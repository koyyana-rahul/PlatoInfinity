import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

export async function generateBillPDF(bill) {
  const fileName = `bill_${bill._id}.pdf`;
  const filePath = path.join("uploads/bills", fileName);

  fs.mkdirSync("uploads/bills", { recursive: true });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(18).text("Restaurant Bill", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Bill ID: ${bill._id}`);
    doc.text(`Session: ${bill.sessionId}`);
    doc.text(`Date: ${new Date(bill.createdAt).toLocaleString()}`);
    doc.moveDown();

    doc.text("Items:");
    doc.moveDown(0.5);

    bill.items.forEach((item) => {
      doc.text(
        `${item.name} x ${item.quantity}  @ ₹${item.rate} = ₹${
          item.quantity * item.rate
        }`
      );
    });

    doc.moveDown();
    doc.text(`Subtotal: ₹${bill.subtotal}`);
    doc.text(`Tax: ₹${bill.taxes}`);
    doc.text(`Total: ₹${bill.total}`, { underline: true });

    doc.moveDown();
    doc.text("Thank you! Visit again ❤️", { align: "center" });

    doc.end();

    stream.on("finish", () => resolve({ filePath, fileName }));
    stream.on("error", reject);
  });
}
