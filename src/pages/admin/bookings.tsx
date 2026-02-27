import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getAllBookings, updateBookingStatus } from "@/lib/db";

type Status = "Pending" | "Approved" | "Rejected";

export default function BookingRequests() {
  useAuthGuard("admin");

  const [filter, setFilter] = useState<Status | "All">("All");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatus(id: string, status: "Approved" | "Rejected") {
    await updateBookingStatus(id, status);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  }

  const pendingCount = bookings.filter((b) => b.status === "Pending").length;
  const filtered = filter === "All" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-1">Booking Requests</h1>
      <p className="text-gray-600 mb-6">
        Review and manage machine rental requests from farmers.{" "}
        <span className="text-yellow-600 font-medium">({pendingCount} pending)</span>
      </p>

      {/* Filter Tabs */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {["All", "Pending", "Approved", "Rejected"].map((tab) => (
          <button key={tab} onClick={() => setFilter(tab as any)}
            className={`px-5 py-2 rounded-full font-medium transition ${filter === tab ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700"
              }`}>
            {tab}
            {tab === "Pending" && pendingCount > 0 && (
              <span className="ml-2 bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading bookings...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No bookings found.</div>
      ) : (
        <div className="space-y-5">
          {filtered.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl p-6 shadow flex flex-col lg:flex-row justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="font-semibold text-lg">{booking.machines?.name ?? "Machine"}</h2>
                  <span className={`px-3 py-1 text-xs rounded-full ${booking.status === "Pending" ? "bg-yellow-100 text-yellow-700"
                      : booking.status === "Approved" ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>{booking.status}</span>
                  <span className="text-gray-400 text-sm">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 mt-2">👤 {booking.profiles?.full_name ?? "Farmer"}</p>
                <p className="text-gray-600">📍 {booking.machines?.location ?? "—"}</p>
                <p className="text-gray-600">📅 {booking.from_date} → {booking.to_date}</p>
                {booking.total_amount && (
                  <p className="text-green-700 font-semibold mt-2">₹ {booking.total_amount}</p>
                )}
              </div>
              {booking.status === "Pending" && (
                <div className="flex items-center gap-3">
                  <button onClick={() => handleStatus(booking.id, "Approved")}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    Approve
                  </button>
                  <button onClick={() => handleStatus(booking.id, "Rejected")}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
