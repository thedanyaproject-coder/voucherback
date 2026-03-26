import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

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
    const { amount, name, email, message } = req.body;

    const voucherCode = "AG-" + Date.now().toString().slice(-6);

    // 🔥 PDF MAKEN
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 landscape

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // achtergrond
    page.drawRectangle({
      x: 0,
      y: 0,
      width: 842,
      height: 595,
      color: rgb(1, 1, 1),
    });

    // kader
    page.drawRectangle({
      x: 30,
      y: 30,
      width: 782,
      height: 535,
      borderWidth: 2,
      borderColor: rgb(0.74, 0.68, 0.51), // #bdad82
    });

    // titel
    page.drawText("GASTHAUS ALT GRIETH", {
      x: 260,
      y: 520,
      size: 18,
      font,
      color: rgb(0.74, 0.68, 0.51),
    });

    page.drawText("GUTSCHEIN", {
      x: 320,
      y: 460,
      size: 40,
      font,
      color: rgb(0.09, 0.02, 0.13), // #160520
    });

    // bedrag
    page.drawText(`€ ${amount}`, {
      x: 350,
      y: 380,
      size: 36,
      font,
      color: rgb(0.09, 0.02, 0.13),
    });

    // naam
    page.drawText(`Für: ${name}`, {
      x: 80,
      y: 260,
      size: 20,
      font,
      color: rgb(0.09, 0.02, 0.13),
    });

    // bericht
    if (message) {
      page.drawText(message, {
        x: 80,
        y: 220,
        size: 16,
        font,
        color: rgb(0.09, 0.02, 0.13),
      });
    }

    // code
    page.drawText(`Code: ${voucherCode}`, {
      x: 80,
      y: 120,
      size: 18,
      font,
      color: rgb(0.74, 0.68, 0.51),
    });

    // geldigheid
    page.drawText("Gültig 1 Jahr ab Kaufdatum", {
      x: 80,
      y: 90,
      size: 14,
      font,
      color: rgb(0.09, 0.02, 0.13),
    });

    const pdfBytes = await pdfDoc.save();

    // 🔥 DIRECT DOWNLOAD ALS TEST (tijdelijk zonder Mollie)
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=gutschein.pdf");

    return res.send(Buffer.from(pdfBytes));

  } catch (error) {
    return res.status(500).json({
      error: "PDF error",
      details: error.message,
    });
  }
}
