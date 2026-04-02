import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useLanguage } from "@/context/LanguageContext";
import {
  getAllBookings,
  updateBookingStatus,
  markCashPaid,
  returnMachine,
  markBookingOverdue,
} from "@/lib/db";
import { Clock, Calendar, CheckCircle2, AlertTriangle, Eye, X } from "lucide-react";

type AllStatus =
  | "All"
  | "Pending Payment"
  | "Waiting Admin Approval"
  | "Confirmed"
  | "Cancelled"
  | "Completed"
  | "Late Return"
  | "Overdue";

const STATUS_COLORS: Record<string, string> = {
  "Pending Payment": "bg-amber-100 text-amber-700 border-amber-200",
  "Waiting Admin Approval": "bg-blue-100 text-blue-700 border-blue-200",
  Confirmed: "bg-green-100 text-green-700 border-green-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
  Completed: "bg-teal-100 text-teal-700 border-teal-200",
  "Late Return": "bg-orange-100 text-orange-700 border-orange-200",
  Overdue: "bg-red-200 text-red-800 border-red-300",
  // Legacy
  Pending: "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

const PAYMENT_COLORS: Record<string, string> = {
  cash: "bg-orange-100 text-orange-700 border-orange-200",
  online: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function BookingRequests() {
  useAuthGuard("admin");
  const { t } = useLanguage();

  const [filter, setFilter] = useState<AllStatus>("All");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Real-time tracking
  const [now, setNow] = useState(new Date());

  // Modal State
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadAndProcess = useCallback(async () => {
    try {
      const data = await getAllBookings();
      const rightNow = new Date();
      rightNow.setHours(0, 0, 0, 0);

      // Auto-cancel cash bookings past their deadline
      const toCancel =
        data?.filter(
          (b: any) =>
            b.status === "Pending Payment" &&
            b.cash_deadline &&
            new Date(b.cash_deadline) < new Date()
        ) ?? [];

      // Auto-mark overdue (Confirmed/Approved past to_date END OF DAY)
      const toOverdue =
        data?.filter((b: any) => {
          if (b.status !== "Confirmed" && b.status !== "Approved") return false;
          if (!b.to_date) return false;
          const endTime = new Date(b.to_date);
          endTime.setHours(23, 59, 59, 999);
          return new Date() > endTime;
        }) ?? [];

      await Promise.all([
        ...toCancel.map((b: any) => updateBookingStatus(b.id, "Cancelled").catch(console.error)),
        ...toOverdue.map((b: any) => markBookingOverdue(b.id).catch(console.error)),
      ]);

      const updated = (data ?? []).map((b: any) => {
        if (toCancel.find((c: any) => c.id === b.id)) return { ...b, status: "Cancelled" };
        if (toOverdue.find((o: any) => o.id === b.id)) return { ...b, status: "Overdue" };
        return b;
      });

      setBookings(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAndProcess();
  }, [loadAndProcess]);

  async function handleAction(id: string, status: "Confirmed" | "Cancelled") {
    setActionLoading(id + status);
    await updateBookingStatus(id, status);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    if (selectedBooking?.id === id) setSelectedBooking({ ...selectedBooking, status });
    setActionLoading(null);
  }

  async function handleCashPaid(id: string) {
    setActionLoading(id + "cash");
    await markCashPaid(id);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "Confirmed" } : b)));
    if (selectedBooking?.id === id) setSelectedBooking({ ...selectedBooking, status: "Confirmed" });
    setActionLoading(null);
  }

  async function handleReturn(id: string) {
    setActionLoading(id + "return");
    try {
      const updated = await returnMachine(id);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status: updated.status,
                actual_return_date: updated.actual_return_date,
                late_fee: updated.late_fee,
              }
            : b
        )
      );
      if (selectedBooking?.id === id) {
        setSelectedBooking({
          ...selectedBooking,
          status: updated.status,
          actual_return_date: updated.actual_return_date,
          late_fee: updated.late_fee,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  }

  const filterTabs: AllStatus[] = ["All", "Pending Payment", "Waiting Admin Approval", "Confirmed", "Overdue", "Completed", "Late Return", "Cancelled"];

  const filtered = filter === "All" ? bookings : bookings.filter((b) => b.status === filter);

  // Helper for tracking differences
  const getTrackingInfo = (booking: any) => {
    if (!booking.to_date) return null;
    const endTime = new Date(booking.to_date);
    endTime.setHours(23, 59, 59, 999);
    const msDiff = endTime.getTime() - now.getTime();
    const hoursDiff = Math.abs(msDiff) / (1000 * 60 * 60);

    const isTrackingLive = booking.status === "Confirmed" || booking.status === "Approved" || booking.status === "Overdue";
    const isActive = isTrackingLive && msDiff > 0;
    const isLate = isTrackingLive && msDiff < 0;

    let displayString = "";
    if (isActive) {
      displayString = `${Math.floor(hoursDiff)} hours remaining`;
    } else if (isLate) {
      const days = Math.floor(hoursDiff / 24);
      const hrs = Math.floor(hoursDiff % 24);
      displayString = `Late by ${days}d ${hrs}h`;
    }

    const livePenalty = isLate ? Math.ceil(Math.abs(msDiff) / (1000 * 60 * 60 * 24)) * (booking.machines?.price_per_day ?? 0) : 0;

    return { isActive, isLate, displayString, livePenalty };
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-1">{t("bookingRequests")}</h1>
      <p className="text-gray-600 mb-6">Detailed booking tracking and return management.</p>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filter === tab ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab}
            {tab === "Pending Payment" && bookings.filter((b) => b.status === tab).length > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white px-1.5 py-0.5 rounded-full text-xs">
                {bookings.filter((b) => b.status === tab).length}
              </span>
            )}
            {tab === "Overdue" && bookings.filter((b) => b.status === tab).length > 0 && (
              <span className="ml-1.5 bg-red-600 text-white px-1.5 py-0.5 rounded-full text-xs">
                {bookings.filter((b) => b.status === tab).length}
              </span>
            )}
            {tab === "Waiting Admin Approval" && bookings.filter((b) => b.status === tab).length > 0 && (
              <span className="ml-1.5 bg-blue-500 text-white px-1.5 py-0.5 rounded-full text-xs">
                {bookings.filter((b) => b.status === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading tracking data...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No bookings match this filter.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((booking) => {
            const tracking = getTrackingInfo(booking);

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                onClick={() => setSelectedBooking(booking)}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="font-bold text-lg text-gray-800 line-clamp-1">
                      {booking.machines?.name ?? "Unknown Machine"}
                    </h2>
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full font-bold border ${STATUS_COLORS[booking.status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 font-medium mb-1">
                    👤 {booking.customer_name || booking.profiles?.full_name || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">📍 {booking.customer_location || "Unknown Location"}</p>

                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{booking.from_date} <span className="text-gray-400">to</span> {booking.to_date}</span>
                    </div>

                    {tracking && (tracking.isActive || tracking.isLate) && (
                      <div className={`flex items-center justify-between text-xs font-bold pt-1 border-t border-gray-200 mt-2 ${tracking.isLate ? "text-red-600" : "text-green-700"}`}>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {tracking.displayString}</span>
                        {tracking.isLate && tracking.livePenalty > 0 && <span>+₹{tracking.livePenalty}</span>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }} 
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2 rounded-xl transition"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- Detailed Modal --- */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col relative" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 md:p-8 flex-1">
              
              <button 
                onClick={() => setSelectedBooking(null)} 
                className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">🚜</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedBooking.machines?.name ?? "Machine Rental"}</h2>
                  <p className="text-sm text-gray-500">Booking ID: <span className="font-mono text-xs">{selectedBooking.id}</span></p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                <span className={`px-3 py-1 text-sm font-bold border rounded-full ${STATUS_COLORS[selectedBooking.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {selectedBooking.status}
                </span>
                <span className={`px-3 py-1 text-sm font-bold border rounded-full ${PAYMENT_COLORS[selectedBooking.payment_method] ?? "bg-gray-100 text-gray-600"}`}>
                  {selectedBooking.payment_method === "cash" ? "🏪 Cash" : "📱 Online Payment"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Section: Customer Details */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Customer Details</h3>
                  <div className="space-y-3 text-sm">
                    <p className="flex justify-between"><span className="text-gray-500">Name</span> <span className="font-medium">{selectedBooking.customer_name || selectedBooking.profiles?.full_name || "—"}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Phone</span> <span className="font-medium">{selectedBooking.customer_phone || "—"}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Village/Location</span> <span className="font-medium">{selectedBooking.customer_location || "—"}</span></p>
                    {selectedBooking.notes && (
                      <div className="pt-2 border-t border-gray-200 mt-2">
                        <span className="text-gray-500 block mb-1">Notes</span>
                        <p className="italic text-gray-700">{selectedBooking.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section: Payment & Cost */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Payment Overview</h3>
                  <div className="space-y-3 text-sm">
                    <p className="flex justify-between"><span className="text-gray-500">Daily Rate</span> <span className="font-medium">₹ {selectedBooking.machines?.price_per_day ?? 0}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Base Amount</span> <span className="font-medium text-green-700 font-bold">₹ {selectedBooking.total_amount ?? 0}</span></p>
                    
                    {selectedBooking.status === "Pending Payment" && selectedBooking.cash_deadline && (
                      <div className="bg-amber-100 text-amber-800 p-2 rounded text-xs mt-2 font-medium">
                        Due: {new Date(selectedBooking.cash_deadline).toLocaleString()}
                      </div>
                    )}
                    
                    {(selectedBooking.status === "Late Return" || selectedBooking.late_fee > 0) && (
                      <div className="pt-2 border-t border-gray-200 mt-2 text-orange-700">
                        <p className="flex justify-between font-bold"><span>Final Late Fee</span> <span>₹ {selectedBooking.late_fee}</span></p>
                      </div>
                    )}

                    {getTrackingInfo(selectedBooking)?.isLate && selectedBooking.status === "Overdue" && (
                      <div className="pt-2 border-t border-gray-200 mt-2 text-red-600 animate-pulse">
                        <p className="flex justify-between font-bold"><span>Live Penalty (Est.)</span> <span>₹ {getTrackingInfo(selectedBooking)?.livePenalty}</span></p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section: Timeline Information */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-5 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Timeline Tracking
                </h3>
                
                <div className="relative pl-6 border-l-2 border-gray-100 space-y-6">
                  <div className="relative">
                    <div className="absolute -left-[31px] bg-gray-200 border-4 border-white w-4 h-4 rounded-full"></div>
                    <p className="text-xs text-gray-500 font-semibold mb-0.5">Booking Created</p>
                    <p className="text-sm font-medium">{new Date(selectedBooking.created_at).toLocaleString()}</p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] bg-blue-400 border-4 border-white w-4 h-4 rounded-full"></div>
                    <p className="text-xs text-gray-500 font-semibold mb-0.5">Rental Start (Midnight)</p>
                    <p className="text-sm font-medium">{new Date(selectedBooking.from_date).toLocaleDateString()}</p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] bg-orange-400 border-4 border-white w-4 h-4 rounded-full"></div>
                    <p className="text-xs text-gray-500 font-semibold mb-0.5">Rental End (Deadline)</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{new Date(selectedBooking.to_date).toLocaleDateString()} 23:59</p>
                      
                      {/* Live Tracking Label inside Timeline */}
                      {getTrackingInfo(selectedBooking)?.isActive && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">
                          {getTrackingInfo(selectedBooking)?.displayString}
                        </span>
                      )}
                      {getTrackingInfo(selectedBooking)?.isLate && selectedBooking.status === "Overdue" && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">
                          {getTrackingInfo(selectedBooking)?.displayString}
                        </span>
                      )}
                    </div>
                  </div>

                  {(selectedBooking.status === "Completed" || selectedBooking.status === "Late Return") && (
                    <div className="relative">
                      <div className={`absolute -left-[31px] border-4 border-white w-4 h-4 rounded-full ${selectedBooking.status === "Completed" ? "bg-green-500" : "bg-red-500"}`}></div>
                      <p className="text-xs text-gray-500 font-semibold mb-0.5">Actual Return</p>
                      <p className="text-sm font-medium">{selectedBooking.actual_return_date ? new Date(selectedBooking.actual_return_date).toLocaleString() : "Recorded"}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Administrative Actions */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Admin Actions</h3>
                
                <div className="flex flex-wrap gap-3">
                  {selectedBooking.status === "Pending Payment" && (
                    <>
                      <button disabled={actionLoading === selectedBooking.id + "cash"} onClick={() => handleCashPaid(selectedBooking.id)} className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow hover:bg-green-700 transition">Mark Cash Paid</button>
                      <button disabled={actionLoading === selectedBooking.id + "Cancelled"} onClick={() => handleAction(selectedBooking.id, "Cancelled")} className="bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow hover:bg-red-600 transition">Cancel Booking</button>
                    </>
                  )}

                  {(selectedBooking.status === "Waiting Admin Approval" || selectedBooking.status === "Pending") && (
                    <>
                      <button disabled={actionLoading === selectedBooking.id + "Confirmed"} onClick={() => handleAction(selectedBooking.id, "Confirmed")} className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow hover:bg-green-700 transition">Approve Booking</button>
                      <button disabled={actionLoading === selectedBooking.id + "Cancelled"} onClick={() => handleAction(selectedBooking.id, "Cancelled")} className="bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow hover:bg-red-600 transition">Reject Booking</button>
                    </>
                  )}

                  {(selectedBooking.status === "Confirmed" || selectedBooking.status === "Approved" || selectedBooking.status === "Overdue") && (
                    <button 
                      disabled={actionLoading === selectedBooking.id + "return"} 
                      onClick={() => {
                        if (confirm("Are you sure you want to mark this machine as returned? It will calculate late fees if overdue.")) {
                          handleReturn(selectedBooking.id);
                        }
                      }} 
                      className="bg-teal-600 text-white px-6 py-3 w-full sm:w-auto rounded-xl text-sm font-bold shadow hover:bg-teal-700 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Execute Machine Return
                    </button>
                  )}

                  {(selectedBooking.status === "Completed" || selectedBooking.status === "Late Return" || selectedBooking.status === "Cancelled" || selectedBooking.status === "Rejected") && (
                    <p className="text-sm text-gray-500 font-medium">No further actions required. Workflow finalized.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
