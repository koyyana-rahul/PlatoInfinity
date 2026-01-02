export default function ManagerTable({ managers = [] }) {
  if (!managers.length) {
    return (
      <div className="bg-white p-6 rounded-xl text-gray-500">
        No managers found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th>Email</th>
            <th>Restaurant</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {managers.map((m) => (
            <tr key={m._id} className="border-t">
              <td className="p-3">{m.name || "—"}</td>
              <td>{m.email}</td>
              <td>{m.restaurant?.name || "—"}</td>
              <td>
                {m.isActive ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-orange-500">Invited</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
