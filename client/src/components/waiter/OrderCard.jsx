export default function OrderCard({ order }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-bold text-gray-900">
            Table {order.tableName || "-"}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>

        <span className="text-[10px] px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200 font-semibold uppercase tracking-wide">
          {order.orderStatus}
        </span>
      </div>

      <div className="mt-3 divide-y divide-gray-100">
        {order.items.map((item) => (
          <div key={item._id} className="py-2 flex justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500">
                Qty {item.quantity} · {item.itemStatus}
              </p>
            </div>
            <p className="text-sm font-bold text-gray-900">
              ₹{item.price * item.quantity}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
