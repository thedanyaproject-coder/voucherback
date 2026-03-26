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

    return res.status(200).json({
      success: true,
      checkoutUrl: `https://example.com/test-success?amount=${encodeURIComponent(amount || "")}&name=${encodeURIComponent(name || "")}`,
      debug: {
        amount,
        name,
        email,
        message,
        icon
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
