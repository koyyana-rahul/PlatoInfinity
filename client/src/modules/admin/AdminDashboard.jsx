export default function AdminDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1A1C1E] mb-4">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sales" value="₹0" />
        <StatCard title="Orders Today" value="0" />
        <StatCard title="Active Tables" value="0" />
        <StatCard title="Staff Online" value="0" />
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
