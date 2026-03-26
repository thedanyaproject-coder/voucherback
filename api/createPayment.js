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
    const { amount, name, email, message, icon } = req.body;

    const mollieApiKey = process.env.MOLLIE_API_KEY;
    const baseUrl = "https://voucherback.vercel.app";

    const response = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mollieApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: {
          currency: "EUR",
          value: Number(amount).toFixed(2),
        },
        description: `Gutschein ${name}`,
        redirectUrl: `${baseUrl}/success.html?amount=${amount}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&message=${encodeURIComponent(message)}&icon=${encodeURIComponent(icon)}`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data });
    }

    return res.status(200).json({
      checkoutUrl: data._links.checkout.href,
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
