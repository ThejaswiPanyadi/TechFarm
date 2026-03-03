import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Booking {
  id: string;
  machine: string;
  start: Date;
  end: Date;
}

export default function CalendarPage() {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  // 🔥 Dummy bookings (later connect to DB)
  const bookings: Booking[] = [
    {
      id: "1",
      machine: "Tractor 5050D",
      start: new Date(2026, 0, 20),
      end: new Date(2026, 0, 22),
    },
    {
      id: "2",
      machine: "Rotavator",
      start: new Date(2026, 0, 25),
      end: new Date(2026, 0, 28),
    },
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDay = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const daysArray = [];

  // Empty cells before month starts
  for (let i = 0; i < startDay; i++) {
    daysArray.push(null);
  }

  // Fill days
  for (let day = 1; day <= totalDays; day++) {
    daysArray.push(new Date(year, month, day));
  }

  const isBooked = (date: Date) => {
    return bookings.find(
      (booking) =>
        date >= booking.start && date <= booking.end
    );
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">
          Availability Calendar
        </h2>
        <p className="text-gray-600 mb-6">
          View machine booking schedules at a glance.
        </p>

        {/* Calendar Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow mb-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg border hover:bg-gray-100"
          >
            <ChevronLeft />
          </button>

          <h3 className="text-lg font-semibold">
            {currentDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h3>

          <button
            onClick={nextMonth}
            className="p-2 rounded-lg border hover:bg-gray-100"
          >
            <ChevronRight />
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 text-center font-medium text-gray-600 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
            (day) => (
              <div key={day}>{day}</div>
            )
          )}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 bg-white p-4 rounded-xl shadow">
          {daysArray.map((date, index) => {
            if (!date) {
              return <div key={index}></div>;
            }

            const booking = isBooked(date);

            return (
              <div
                key={index}
                className={`h-24 border rounded-lg p-2 text-sm relative ${
                  booking
                    ? "bg-green-100 border-green-500"
                    : "bg-gray-50"
                }`}
              >
                <span className="absolute top-2 left-2 font-medium">
                  {date.getDate()}
                </span>

                {booking && (
                  <div className="absolute bottom-2 left-2 right-2 text-xs bg-green-700 text-white px-2 py-1 rounded">
                    {booking.machine}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-6 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-500 rounded"></span>
            Booked
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-gray-200 rounded"></span>
            Available
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
