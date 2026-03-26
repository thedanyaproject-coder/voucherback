export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Geen payment id ontvangen" });
    }

    if (!process.env.MOLLIE_API_KEY) {
      return res.status(500).json({ error: "MOLLIE_API_KEY ontbreekt" });
    }

    const mollieResponse = await fetch(`https://api.mollie.com/v2/payments/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.MOLLIE_API_KEY}`
      }
    });

    const data = await mollieResponse.json();

    if (!mollieResponse.ok) {
      return res.status(500).json({
        error: "Mollie error",
        details: data
      });
    }

    return res.status(200).json({
      id: data.id,
      status: data.status,
      amount: data.metadata?.amount || data.amount?.value || "",
      name: data.metadata?.name || "",
      email: data.metadata?.email || "",
      message: data.metadata?.message || "",
      voucherCode: data.metadata?.voucherCode || "",
      invoiceReference: data.metadata?.invoiceReference || "",
      purchaseDate: data.metadata?.purchaseDate || data.createdAt || "",
      validUntil: data.metadata?.validUntil || "",
      paidVia: data.method || data.metadata?.paidVia || "Mollie",
      paidAt: data.paidAt || ""
    });
  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}
