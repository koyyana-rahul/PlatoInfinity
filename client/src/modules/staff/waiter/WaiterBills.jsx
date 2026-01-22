import { useState } from "react";
import BillSummary from "../../../components/waiter/BillSummary";

export default function WaiterBills() {
  const [bill] = useState(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bills</h1>

      {!bill ? (
        <div className="bg-white p-6 rounded-2xl border text-gray-600">
          Select a table to generate bill
        </div>
      ) : (
        <BillSummary bill={bill} />
      )}
    </div>
  );
}
