import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useLanguage } from "@/context/LanguageContext";
import { getAllBookings, updateBookingStatus, markCashPaid } from "@/lib/db";

type AllStatus = "All" | "Pending Payment" | "Waiting Admin Approval" | "Confirmed" | "Cancelled" | "Pending" | "Approved" | "Rejected";

const STATUS_COLORS: Record<string, string> = {
  "Pending Payment": "bg-amber-100 text-amber-700",
  "Waiting Admin Approval": "bg-blue-100 text-blue-700",
  Confirmed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  // Legacy
  Pending: "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

const PAYMENT_COLORS: Record<string, string> = {
  cash: "bg-orange-100 text-orange-700",
  online: "bg-purple-100 text-purple-700",
};

export default function BookingRequests() {
  useAuthGuard("admin");
  const { t } = useLanguage();

  const [filter, setFilter] = useState<AllStatus>("All");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadAndAutoCancelExpired = useCallback(async () => {
    try {
      const data = await getAllBookings();

      // Auto-cancel cash bookings past their deadline
      const now = new Date();
      const toCancel = data?.filter(
        (b: any) =>
          b.status === "Pending Payment" &&
          b.cash_deadline &&
          new Date(b.cash_deadline) < now
      ) ?? [];

      // Fire-and-forget updates
      await Promise.all(
        toCancel.map((b: any) => updateBookingStatus(b.id, "Cancelled").catch(console.error))
      );

      // Apply cancellation locally
      const updated = (data ?? []).map((b: any) =>
        toCancel.find((c: any) => c.id === b.id) ? { ...b, status: "Cancelled" } : b
      );

      setBookings(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAndAutoCancelExpired();
  }, [loadAndAutoCancelExpired]);

  async function handleAction(id: string, status: "Confirmed" | "Cancelled") {
    setActionLoading(id + status);
    await updateBookingStatus(id, status);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    setActionLoading(null);
  }

  async function handleCashPaid(id: string) {
    setActionLoading(id + "cash");
    await markCashPaid(id);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "Confirmed" } : b)));
    setActionLoading(null);
  }

  const filterTabs: AllStatus[] = ["All", "Pending Payment", "Waiting Admin Approval", "Confirmed", "Cancelled"];
  const pendingCount = bookings.filter(
    (b) => b.status === "Pending Payment" || b.status === "Waiting Admin Approval" || b.status === "Pending"
  ).length;

  const filtered = filter === "All" ? bookings : bookings.filter((b) => b.status === filter);

  const getStatusLabel = (status: string) => {
    if (status === "Pending Payment") return t("pendingPayment");
    if (status === "Waiting Admin Approval") return t("waitingAdminApproval");
    if (status === "Confirmed") return t("confirmed");
    if (status === "Cancelled") return t("cancelled");
    return t(status.toLowerCase()) || status;
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-1">{t("bookingRequests")}</h1>
      <p className="text-gray-600 mb-6">
        {t("bookingRequestsDesc")}{" "}
        {pendingCount > 0 && (
          <span className="text-amber-600 font-medium">({pendingCount} {t("needAttention")})</span>
        )}
      </p>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filter === tab ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {tab === "All" ? t("all") : getStatusLabel(tab)}
            {tab === "Pending Payment" &&
              bookings.filter((b) => b.status === "Pending Payment").length > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white px-1.5 py-0.5 rounded-full text-xs">
                  {bookings.filter((b) => b.status === "Pending Payment").length}
                </span>
              )}
            {tab === "Waiting Admin Approval" &&
              bookings.filter((b) => b.status === "Waiting Admin Approval").length > 0 && (
                <span className="ml-1.5 bg-blue-500 text-white px-1.5 py-0.5 rounded-full text-xs">
                  {bookings.filter((b) => b.status === "Waiting Admin Approval").length}
                </span>
              )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">{t("loadingDash")}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">{t("noBookings")}</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => {
            const isLoadingAction = actionLoading?.startsWith(booking.id);
            const cashDeadline = booking.cash_deadline ? new Date(booking.cash_deadline) : null;

            return (
              <div
                key={booking.id}
                className="bg-white rounded-xl p-5 shadow-sm border flex flex-col lg:flex-row justify-between gap-4"
              >
                {/* Left: Info */}
                <div className="flex-1 space-y-1.5">
                  {/* Title row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-lg">{booking.machines?.name ?? t("machine")}</h2>
                    <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${STATUS_COLORS[booking.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                    {booking.payment_method && (
                      <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${PAYMENT_COLORS[booking.payment_method] ?? "bg-gray-100 text-gray-600"}`}>
                        {booking.payment_method === "cash" ? "🏪 " + t("cash") : "📱 " + t("online")}
                      </span>
                    )}
                    <span className="text-gray-400 text-xs">{new Date(booking.created_at).toLocaleString()}</span>
                  </div>

                  {/* Customer details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600 mt-2">
                    <p>👤 {booking.customer_name || booking.profiles?.full_name || "—"}</p>
                    <p>📞 {booking.customer_phone || "—"}</p>
                    <p>📍 {booking.customer_location || booking.machines?.location || "—"}</p>
                    <p>📅 {booking.from_date} → {booking.to_date}</p>
                    {booking.total_amount && (
                      <p className="font-semibold text-green-700">₹ {booking.total_amount}</p>
                    )}
                    {booking.notes && (
                      <p className="text-gray-500 col-span-2 italic">📝 {booking.notes}</p>
                    )}
                  </div>

                  {/* Cash deadline warning */}
                  {booking.status === "Pending Payment" && cashDeadline && (
                    <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      ⏱ {t("cashPayDue")}: <span className="font-semibold">{cashDeadline.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-start lg:items-center gap-2 flex-wrap lg:flex-col lg:min-w-[160px]">
                  {(booking.status === "Pending Payment") && (
                    <>
                      <button
                        disabled={isLoadingAction}
                        onClick={() => handleCashPaid(booking.id)}
                        className="flex-1 lg:w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition"
                      >
                        ✓ {t("markCashPaid")}
                      </button>
                      <button
                        disabled={isLoadingAction}
                        onClick={() => handleAction(booking.id, "Cancelled")}
                        className="flex-1 lg:w-full bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 transition"
                      >
                        {t("cancel")}
                      </button>
                    </>
                  )}

                  {(booking.status === "Waiting Admin Approval" || booking.status === "Pending") && (
                    <>
                      <button
                        disabled={isLoadingAction}
                        onClick={() => handleAction(booking.id, "Confirmed")}
                        className="flex-1 lg:w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition"
                      >
                        ✓ {t("approve")}
                      </button>
                      <button
                        disabled={isLoadingAction}
                        onClick={() => handleAction(booking.id, "Cancelled")}
                        className="flex-1 lg:w-full bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 transition"
                      >
                        ✗ {t("reject")}
                      </button>
                    </>
                  )}

                  {(booking.status === "Confirmed" || booking.status === "Approved") && (
                    <span className="text-green-600 text-sm font-medium">✓ {t("confirmed")}</span>
                  )}

                  {(booking.status === "Cancelled" || booking.status === "Rejected") && (
                    <span className="text-red-500 text-sm font-medium">✗ {t("cancelled")}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
