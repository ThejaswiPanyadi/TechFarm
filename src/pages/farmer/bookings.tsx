import { useEffect, useState } from "react";
import FarmerLayout from "@/components/layout/FarmerLayout";
import { Calendar, MapPin, Phone } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getFarmerBookings } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";

type Status = "Pending" | "Approved" | "Rejected" | "Pending Payment" | "Waiting Admin Approval" | "Confirmed" | "Cancelled";

export default function MyBookings() {
  useAuthGuard("farmer");
  const { user } = useAuth();

  const [filter, setFilter] = useState<"All" | Status>("All");

  const STATUS_STYLE: Record<string, string> = {
    "Pending Payment": "bg-amber-100 text-amber-700",
    "Waiting Admin Approval": "bg-blue-100 text-blue-700",
    "Confirmed": "bg-green-100 text-green-700",
    "Cancelled": "bg-red-100 text-red-700",
    "Pending": "bg-yellow-100 text-yellow-700",
    "Approved": "bg-green-100 text-green-700",
    "Rejected": "bg-red-100 text-red-700",
  };
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getFarmerBookings(user.id)
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = filter === "All" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <FarmerLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold">My Bookings</h2>
          <p className="text-gray-600 mt-2">Track all your machine rental requests and their status.</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          {["All", "Pending Payment", "Waiting Admin Approval", "Confirmed", "Cancelled"].map((btn) => (
            <button key={btn} onClick={() => setFilter(btn as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filter === btn ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
              {btn}
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
              <div key={booking.id}
                className="bg-white rounded-2xl shadow-sm p-6 flex flex-col lg:flex-row justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold">{booking.machines?.name ?? "Machine"}</h3>
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${STATUS_STYLE[booking.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {booking.status}
                    </span>
                    {booking.payment_method && (
                      <span className={`px-2.5 py-0.5 text-xs rounded-full ${booking.payment_method === "cash" ? "bg-orange-100 text-orange-700" : "bg-purple-100 text-purple-700"
                        }`}>
                        {booking.payment_method === "cash" ? "🏪 Cash" : "📱 Online"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-gray-600 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {booking.from_date} – {booking.to_date}
                    </div>
                    {booking.machines?.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {booking.machines.location}
                      </div>
                    )}
                  </div>
                  {booking.total_amount && (
                    <p className="text-green-700 font-semibold">₹ {booking.total_amount}</p>
                  )}
                  {/* Status-specific messages */}
                  {booking.status === "Pending Payment" && booking.cash_deadline && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      ⏱ Please pay cash at the shop by{" "}
                      <span className="font-semibold">{new Date(booking.cash_deadline).toLocaleString()}</span>
                    </div>
                  )}
                  {booking.status === "Waiting Admin Approval" && (
                    <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                      📋 Payment received. Waiting for admin to confirm your booking.
                    </div>
                  )}
                  {(booking.status === "Confirmed" || booking.status === "Approved") && (
                    <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      ✅ Booking confirmed! Contact the shop if you have questions.
                    </div>
                  )}
                </div>
                {(booking.status === "Confirmed" || booking.status === "Approved") && (
                  <div className="flex items-center">
                    <button className="flex items-center gap-2 border border-green-700 text-green-700 px-4 py-2 rounded-xl hover:bg-green-700 hover:text-white transition">
                      <Phone className="w-4 h-4" />
                      Contact Shop
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </FarmerLayout>
  );
}
