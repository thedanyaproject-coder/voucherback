export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, name, email, description } = req.body;

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
        description: description || "Gutschein Alt Grieth",
        redirectUrl: "https://JOUW-FRONTEND-URL/success.html"
      })
    });

    const data = await mollieResponse.json();

    return res.status(200).json({
      checkoutUrl: data._links.checkout.href
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
