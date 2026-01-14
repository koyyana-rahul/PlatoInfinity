// src/modules/staff/chef/components/KitchenOrderCard.jsx
import KitchenItemRow from "./KitchenItemRow";

export default function KitchenOrderCard({ order, reload }) {
  return (
    <div className="rounded-xl border bg-gray-50 p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">
          Table {order.tableName || order.tableId}
        </h3>
        <span className="text-xs text-gray-500">
          {new Date(order.createdAt).toLocaleTimeString()}
        </span>
      </div>

      <div className="space-y-2">
        {order.items.map((item) => (
          <KitchenItemRow
            key={item._id}
            item={item}
            orderId={order._id}
            onUpdated={reload}
          />
        ))}
      </div>
    </div>
  );
}
