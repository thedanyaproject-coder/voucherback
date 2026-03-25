export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("Incoming body:", req.body);

    const body = req.body || {};
    const amount = body.amount;
    const name = body.name || "";
    const email = body.email || "";
    const description = body.description || "Gutschein Alt Grieth";
    const message = body.message || "";

    if (!process.env.MOLLIE_API_KEY) {
      return res.status(500).json({
        error: "MOLLIE_API_KEY ontbreekt in Vercel"
      });
    }

    if (!amount || isNaN(Number(amount))) {
      return res.status(400).json({
        error: "Ongeldig bedrag ontvangen",
        receivedAmount: amount
      });
    }

    const mollieResponse = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MOLLIE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: {
          currency: "EUR",
          value: Number(amount).toFixed(2)
        },
        description,
        redirectUrl: "https://JOUW-FRONTEND-URL/success.html",
        metadata: {
          name,
          email,
          message,
          amount: Number(amount).toFixed(2)
        }
      })
    });

    const data = await mollieResponse.json();
    console.log("Mollie response status:", mollieResponse.status);
    console.log("Mollie response data:", data);

    if (!mollieResponse.ok) {
      return res.status(mollieResponse.status).json({
        error: "Mollie error",
        mollie: data
      });
    }

    if (!data?._links?.checkout?.href) {
      return res.status(500).json({
        error: "Geen checkoutUrl ontvangen van Mollie",
        mollie: data
      });
    }

    return res.status(200).json({
      id: data.id,
      checkoutUrl: data._links.checkout.href
    });
  } catch (error) {
    console.error("Server crash:", error);
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
