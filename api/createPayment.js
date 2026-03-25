export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, name, email, message } = req.body || {};

    if (!process.env.MOLLIE_API_KEY) {
      return res.status(500).json({ error: "MOLLIE_API_KEY ontbreekt" });
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
        description: "Gutschein Alt Grieth",
        redirectUrl: "https://voucherfront.vercel.app/success.html",
        metadata: {
          name,
          email,
          message,
          amount
        }
      })
    });

    const data = await mollieResponse.json();

    if (!mollieResponse.ok) {
      return res.status(500).json(data);
    }

    return res.status(200).json({
      checkoutUrl: data._links.checkout.href
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
