import AdminLayout from "@/components/layout/AdminLayout";
import { Tractor, Clock, CheckCircle, TrendingUp, ClipboardList, Calendar } from "lucide-react";

export default function AdminDashboard() {
  return (
    <AdminLayout>

      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">
          Welcome, Saya Enterprises! 👋
        </h2>
        <p className="text-gray-600">
          Manage your machine rentals and monitor booking requests.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <StatCard icon={<Tractor />} value="8" label="Total Machines" bg="bg-green-100" />

        <StatCard icon={<Clock />} value="5" label="Pending Requests" bg="bg-yellow-100" />

        <StatCard icon={<CheckCircle />} value="12" label="Approved This Week" bg="bg-green-100" />

        <StatCard icon={<TrendingUp />} value="3" label="Active Rentals" bg="bg-yellow-100" />

      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <ActionCard
          icon={<Tractor />}
          title="Manage Machines"
          desc="Add, edit, or remove rental machines"
        />

        <ActionCard
          icon={<ClipboardList />}
          title="Booking Requests"
          desc="Review and manage farmer bookings"
        />

        <ActionCard
          icon={<Calendar />}
          title="Availability Calendar"
          desc="View machine schedules"
        />

      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="text-xl font-semibold mb-6">
          Recent Booking Requests
        </h3>

        <BookingRow
          name="Ramesh Kumar"
          machine="Tractor 5050D"
          status="Pending"
        />

        <BookingRow
          name="Suresh Patel"
          machine="Rotavator"
          status="Approved"
        />

        <BookingRow
          name="Anjali Devi"
          machine="Harvester"
          status="Rejected"
        />
      </div>

    </AdminLayout>
  );
}

function StatCard({ icon, value, label, bg }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4 border">
      <div className={`${bg} p-3 rounded-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-gray-600 text-sm">{label}</p>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, desc }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border hover:shadow-md transition">
      <div className="mb-4 bg-yellow-100 w-fit p-3 rounded-xl">
        {icon}
      </div>
      <h4 className="font-semibold text-lg mb-1">{title}</h4>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  );
}

function BookingRow({ name, machine, status }: any) {
  const statusColor =
    status === "Pending"
      ? "bg-yellow-100 text-yellow-700"
      : status === "Approved"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="flex justify-between items-center py-4 border-t first:border-t-0">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-gray-500">{machine}</p>
      </div>
      <span className={`px-3 py-1 text-xs rounded-full ${statusColor}`}>
        {status}
      </span>
    </div>
  );
}
