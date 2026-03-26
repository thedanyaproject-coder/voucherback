export default async function handler(req, res) {
  // Alleen POST toestaan
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, name, email, message } = req.body || {};

    if (!amount || !name || !email) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const mollieApiKey = process.env.MOLLIE_API_KEY;

    if (!mollieApiKey) {
      return res.status(500).json({
        error: "MOLLIE_API_KEY ontbreekt in environment variables",
      });
    }

    const baseUrl =
      process.env.BASE_URL || "https://voucherback.vercel.app";

    const paymentData = {
      amount: {
        currency: "EUR",
        value: Number(amount).toFixed(2),
      },
      description: `Gutschein voor ${name}`,
      redirectUrl: `${baseUrl}/success?name=${encodeURIComponent(name)}&amount=${encodeURIComponent(amount)}&email=${encodeURIComponent(email)}&message=${encodeURIComponent(message || "")}`,
      webhookUrl: `${baseUrl}/api/webhook`,
      metadata: {
        name,
        email,
        message: message || "",
        amount: Number(amount).toFixed(2),
      },
    };

    const response = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mollieApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.detail || data?.message || "Mollie fout",
        mollie: data,
      });
    }

    return res.status(200).json({
      checkoutUrl: data?._links?.checkout?.href,
      id: data?.id,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
}
