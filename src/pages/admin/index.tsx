import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Tractor, Clock, CheckCircle, TrendingUp, ClipboardList, Calendar } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useLanguage } from "@/context/LanguageContext";
import { getAdminStats, getAllBookings, updateBookingStatus } from "@/lib/db";
import Link from "next/link";

export default function AdminDashboard() {
  useAuthGuard("admin");
  const { t } = useLanguage();

  const [stats, setStats] = useState({ totalMachines: 0, pending: 0, approved: 0, active: 0 });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, bookings] = await Promise.all([getAdminStats(), getAllBookings()]);
        setStats(s);
        setRecentBookings(bookings.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleStatus(id: string, status: "Approved" | "Rejected") {
    await updateBookingStatus(id, status);
    setRecentBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
    setStats((prev) => ({
      ...prev,
      pending: Math.max(0, prev.pending - 1),
      approved: status === "Approved" ? prev.approved + 1 : prev.approved,
    }));
  }

  return (
    <AdminLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">{t("welcomeAdmin")}</h2>
        <p className="text-gray-600">{t("adminDashDesc")}</p>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-20">{t("loadingDash")}</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={<Tractor />} value={String(stats.totalMachines)} label={t("totalMachines")} bg="bg-green-100" />
            <StatCard icon={<Clock />} value={String(stats.pending)} label={t("pendingRequests")} bg="bg-yellow-100" />
            <StatCard icon={<CheckCircle />} value={String(stats.approved)} label={t("approvedBookings")} bg="bg-green-100" />
            <StatCard icon={<TrendingUp />} value={String(stats.active)} label={t("availableMachines")} bg="bg-yellow-100" />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link href="/admin/machines">
              <ActionCard icon={<Tractor />} title={t("manageMachines")} desc={t("manageMachinesDesc")} />
            </Link>
            <Link href="/admin/bookings">
              <ActionCard icon={<ClipboardList />} title={t("bookingRequests")} desc={t("bookingRequestsDesc")} />
            </Link>
            <Link href="/admin/calendar">
              <ActionCard icon={<Calendar />} title={t("availabilityCalendar")} desc={t("availabilityCalendarDesc")} />
            </Link>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="text-xl font-semibold mb-6">{t("recentBookingReq")}</h3>
            {recentBookings.length === 0 ? (
              <p className="text-gray-400 text-center py-8">{t("noBookings")}</p>
            ) : (
              recentBookings.map((b) => (
                <BookingRow
                  key={b.id}
                  name={b.profiles?.full_name ?? t("farmer")}
                  machine={b.machines?.name ?? "—"}
                  status={b.status}
                  t={t}
                  onApprove={b.status === "Pending" ? () => handleStatus(b.id, "Approved") : undefined}
                  onReject={b.status === "Pending" ? () => handleStatus(b.id, "Rejected") : undefined}
                />
              ))
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function StatCard({ icon, value, label, bg }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4 border">
      <div className={`${bg} p-3 rounded-xl`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-gray-600 text-sm">{label}</p>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, desc }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border hover:shadow-md transition cursor-pointer">
      <div className="mb-4 bg-yellow-100 w-fit p-3 rounded-xl">{icon}</div>
      <h4 className="font-semibold text-lg mb-1">{title}</h4>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  );
}

function BookingRow({ name, machine, status, t, onApprove, onReject }: any) {
  const statusColor =
    status === "Pending"
      ? "bg-yellow-100 text-yellow-700"
      : status === "Approved"
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700";

  return (
    <div className="flex flex-wrap justify-between items-center py-4 border-t first:border-t-0 gap-3">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-gray-500">{machine}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 text-xs rounded-full ${statusColor}`}>{t(status.toLowerCase()) || status}</span>
        {onApprove && (
          <button onClick={onApprove} className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700">
            {t("approve")}
          </button>
        )}
        {onReject && (
          <button onClick={onReject} className="text-xs bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600">
            {t("reject")}
          </button>
        )}
      </div>
    </div>
  );
}
