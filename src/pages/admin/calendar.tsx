import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useLanguage } from "@/context/LanguageContext";
import { getAllBookings } from "@/lib/db";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AvailabilityCalendar() {
  useAuthGuard("admin");
  const { t } = useLanguage();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllBookings();
        setBookings(data.filter((b: any) => b.status === "Confirmed" || b.status === "Approved"));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(year, currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() + 1));

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("availabilityCalendar")}</h1>
          <p className="text-gray-600">{t("availabilityCalendarDesc")}</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border">
          <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold min-w-[140px] text-center">
            {monthName} {year}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        {/* Calendar Legend */}
        <div className="flex gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>{t("confirmed")}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
            <span>{t("available")}</span>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-px mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-xs font-bold text-gray-400 py-2 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-32 rounded-xl bg-gray-50/50"></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayBookings = bookings.filter((b) => dateStr >= b.from_date && dateStr <= b.to_date);

            return (
              <div key={day} className="h-32 p-2 rounded-xl border border-gray-100 hover:border-green-200 transition bg-white relative group overflow-hidden">
                <span className="font-medium text-gray-600">{day}</span>
                <div className="mt-1 space-y-1">
                  {dayBookings.map((b) => (
                    <div key={b.id} className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded truncate font-medium">
                      {b.machines?.name} - {b.profiles?.full_name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-semibold text-green-800">{t("loadingDash")}</p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
