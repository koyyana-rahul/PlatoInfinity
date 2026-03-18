// src/modules/staff/chef/components/KitchenOrderCard.jsx
import KitchenItemRow from "./KitchenItemRow";

const formatTableNo = (tableName, tableId) => {
  const raw = String(tableName || tableId || "Unknown").trim();
  return raw.replace(/^table\s*/i, "").trim();
};

export default function KitchenOrderCard({ order, reload, onStatusUpdate }) {
  const allItemsServed = order.items?.every((i) => i.itemStatus === "SERVED");
  const allItemsReady = order.items?.every(
    (i) => i.itemStatus === "READY" || i.itemStatus === "SERVED",
  );

  let statusColor = "border-blue-200 bg-blue-50 text-blue-700";
  let statusLabel = "In Progress";

  if (allItemsServed) {
    statusColor = "border-green-200 bg-green-50 text-green-700";
    statusLabel = "Served";
  } else if (allItemsReady) {
    statusColor = "border-green-200 bg-green-50 text-green-700";
    statusLabel = "Ready";
  } else if (order.items?.some((i) => i.itemStatus === "IN_PROGRESS")) {
    statusColor = "border-orange-200 bg-orange-50 text-orange-700";
    statusLabel = "Cooking";
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 space-y-4 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start gap-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900">
            Table {formatTableNo(order.tableName, order.tableId)}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {order.items?.length || 0} item
            {order.items?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <span
            className={`inline-block text-xs font-semibold px-3 py-1 rounded border uppercase tracking-wide ${statusColor}`}
          >
            {statusLabel}
          </span>
          <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
            {new Date(order.createdAt).toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="space-y-2 border-t border-gray-100 pt-3">
        {order.items.map((item) => (
          <KitchenItemRow
            key={item._id}
            item={item}
            orderId={order._id}
            tableName={formatTableNo(order.tableName, order.tableId)}
            onUpdated={reload}
            onStatusUpdate={onStatusUpdate}
          />
        ))}
      </div>
    </div>
  );
}
