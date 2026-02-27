import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getAllBookings } from "@/lib/db";

export default function CalendarPage() {
  useAuthGuard("admin");

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllBookings()
      .then((data) => setBookings(data.filter((b: any) => b.status === "Approved")))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const daysArray: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) daysArray.push(null);
  for (let d = 1; d <= totalDays; d++) daysArray.push(new Date(year, month, d));

  function getBookingForDate(date: Date) {
    return bookings.find((b) => {
      const from = new Date(b.from_date);
      const to = new Date(b.to_date);
      return date >= from && date <= to;
    });
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">Availability Calendar</h2>
        <p className="text-gray-600 mb-6">View approved machine booking schedules.</p>

        {/* Calendar Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow mb-4">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-2 rounded-lg border hover:bg-gray-100">
            <ChevronLeft />
          </button>
          <h3 className="text-lg font-semibold">
            {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
          </h3>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-2 rounded-lg border hover:bg-gray-100">
            <ChevronRight />
          </button>
        </div>

        {/* Day Labels */}
        <div className="grid grid-cols-7 text-center font-medium text-gray-600 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading calendar...</div>
        ) : (
          <div className="grid grid-cols-7 gap-2 bg-white p-4 rounded-xl shadow">
            {daysArray.map((date, i) => {
              if (!date) return <div key={i} />;
              const booking = getBookingForDate(date);
              return (
                <div key={i} className={`h-24 border rounded-lg p-2 text-sm relative ${booking ? "bg-green-100 border-green-500" : "bg-gray-50"
                  }`}>
                  <span className="absolute top-2 left-2 font-medium">{date.getDate()}</span>
                  {booking && (
                    <div className="absolute bottom-2 left-2 right-2 text-xs bg-green-700 text-white px-2 py-1 rounded truncate">
                      {booking.machines?.name ?? "Booking"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-6 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-500 rounded" />Booked
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-gray-200 rounded" />Available
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
