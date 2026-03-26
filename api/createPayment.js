export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, name } = req.body;

  const now = new Date();

  const date =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");

  const sequence = Math.floor(1000 + Math.random() * 9000);

  const voucherCode = `${date}-${sequence}`;

  const payment = await fetch("https://api.mollie.com/v2/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MOLLIE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: {
        currency: "EUR",
        value: amount.toFixed(2)
      },
      description: `Voucher ${voucherCode}`,
      redirectUrl: `${process.env.BASE_URL}/success.html?voucher=${voucherCode}&amount=${amount}&name=${encodeURIComponent(name)}`,
      metadata: {
        voucherCode,
        name,
        amount,
        createdAt: now.toISOString()
      }
    })
  });

  const data = await payment.json();

  return res.status(200).json({
    checkoutUrl: data._links.checkout.href,
    voucherCode
  });
}
