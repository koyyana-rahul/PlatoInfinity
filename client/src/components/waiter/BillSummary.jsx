export default function BillSummary({ bill }) {
  if (!bill) return null;

  return (
    <div className="bg-white border rounded-2xl p-4 space-y-2">
      <Row label="Subtotal" value={`₹${bill.subtotal}`} />
      <Row label="Taxes" value={`₹${bill.taxes}`} />
      <Row label="Total" value={`₹${bill.total}`} bold />
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm ${bold ? "font-bold" : ""}`}>{value}</span>
    </div>
  );
}
