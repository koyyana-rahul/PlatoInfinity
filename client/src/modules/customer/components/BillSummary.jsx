const BillSummaryRow = ({ label, value, isBold = false, isSmall = false }) => (
  <div className="flex justify-between items-center">
    <p
      className={`font-medium ${
        isSmall
          ? "text-xs text-gray-500 dark:text-gray-400"
          : "text-sm text-gray-700 dark:text-gray-300"
      }`}
    >
      {label}
    </p>
    <p
      className={`font-semibold ${
        isBold
          ? "text-lg md:text-xl font-extrabold text-deep-green dark:text-cream"
          : "text-sm text-gray-800 dark:text-gray-200"
      }`}
    >
      {value}
    </p>
  </div>
);

const BillSummary = ({ subtotal, tax, total, title = "Bill Details" }) => {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-subtle dark:shadow-subtle-dark">
      <h3 className="text-lg font-bold mb-6 text-gray-800 dark:text-gray-100">{title}</h3>
      <div className="space-y-4">
        <BillSummaryRow
          label="Item Total"
          value={`₹${Math.round(subtotal || 0)}`}
        />
        <BillSummaryRow
          label="Taxes & Charges"
          value={`₹${Math.round(tax || 0)}`}
          isSmall
        />
        <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-4"></div>
        <BillSummaryRow
          label="To Pay"
          value={`₹${Math.round(total || 0)}`}
          isBold
        />
      </div>
    </div>
  );
};

export default BillSummary;
