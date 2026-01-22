export default function OrderCard({ order }) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-semibold">
            Table {order.tableName || "-"}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>

        <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
          {order.orderStatus}
        </span>
      </div>

      <div className="mt-3 divide-y">
        {order.items.map((item) => (
          <div key={item._id} className="py-2 flex justify-between">
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-gray-500">
                Qty {item.quantity} · {item.itemStatus}
              </p>
            </div>
            <p className="text-sm font-semibold">
              ₹{item.price * item.quantity}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
