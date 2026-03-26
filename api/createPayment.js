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
    const { amount, name, email, message, icon } = req.body || {};

    if (!amount || !name || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const mollieApiKey = process.env.MOLLIE_API_KEY;

    if (!mollieApiKey) {
      return res.status(500).json({ error: "Missing MOLLIE_API_KEY" });
    }

    const redirectUrl =
      `https://www.altgrieth.de/gutschein-download` +
      `?amount=${encodeURIComponent(Number(amount).toFixed(2))}` +
      `&name=${encodeURIComponent(name)}` +
      `&email=${encodeURIComponent(email)}` +
      `&message=${encodeURIComponent(message || "")}` +
      `&icon=${encodeURIComponent(icon || "❤")}`;

    const mollieResponse = await fetch("https://api.mollie.com/v2/payments", {
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
        redirectUrl: redirectUrl,
      }),
    });

    const data = await mollieResponse.json();

    if (!mollieResponse.ok) {
      return res.status(500).json({
        error: data?.detail || data?.message || "Mollie error",
        mollie: data,
      });
    }

    return res.status(200).json({
      checkoutUrl: data?._links?.checkout?.href,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
}
