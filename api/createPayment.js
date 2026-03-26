export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Alleen POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, name, email, message } = req.body || {};

    if (!amount || !name || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const mollieApiKey = process.env.MOLLIE_API_KEY;
    const baseUrl = process.env.BASE_URL || "https://voucherback.vercel.app";

    if (!mollieApiKey) {
      return res.status(500).json({ error: "Missing MOLLIE_API_KEY" });
    }

    const paymentBody = {
      amount: {
        currency: "EUR",
        value: Number(amount).toFixed(2),
      },
      description: `Gutschein ${name}`,
      redirectUrl: `${baseUrl}/success.html?amount=${encodeURIComponent(amount)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&message=${encodeURIComponent(message || "")}`,
      webhookUrl: `${baseUrl}/api/webhook`,
      metadata: {
        amount: Number(amount).toFixed(2),
        name,
        email,
        message: message || "",
      },
    };

    const mollieResponse = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mollieApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentBody),
    });

    const data = await mollieResponse.json();

    if (!mollieResponse.ok) {
      return res.status(mollieResponse.status).json({
        error: data.detail || "Mollie error",
        mollie: data,
      });
    }

    return res.status(200).json({
      success: true,
      checkoutUrl: data._links?.checkout?.href || null,
      paymentId: data.id || null,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
}
