export default async function handler(req, res) {

  // CORS (nodig voor frontend)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Alleen POST toegestaan (maar we laten GET toe voor test)
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    // 🔍 TEST: check welke key Vercel gebruikt
    return res.status(200).json({
      keyPrefix: process.env.MOLLIE_API_KEY?.slice(0, 5) || "missing"
    });

  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}
