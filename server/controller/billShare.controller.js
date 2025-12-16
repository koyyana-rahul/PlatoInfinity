import Bill from "../models/bill.model.js";

export async function sendBillLink(req, res) {
  const { billId } = req.params;
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone required" });
  }

  const bill = await Bill.findById(billId);
  if (!bill) {
    return res.status(404).json({ message: "Bill not found" });
  }

  // fake public URL (later replace with frontend link)
  const billUrl = `https://yourapp.com/bill/${bill._id}`;

  bill.customerPhone = phone;
  bill.meta.billSharedAt = new Date();
  await bill.save();

  // integrate WhatsApp API later
  console.log(`Send WhatsApp bill to ${phone}: ${billUrl}`);

  res.json({
    success: true,
    message: "Bill link sent",
    billUrl,
  });
}
