export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, name } = req.body;

    return res.status(200).json({
      success: true,
      message: "Backend werkt",
      amount,
      name
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
