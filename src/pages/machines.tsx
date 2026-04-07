import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import BookingModal from "@/components/farmer/BookingModal";
import { getMachines, getUserActiveBooking } from "@/lib/db";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

export default function Machines() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [bookedId, setBookedId] = useState<string | null>(null);
  const [activeBooking, setActiveBooking] = useState<any>(null);

  useEffect(() => {
    getMachines()
      .then(setMachines)
      .catch(console.error)
      .finally(() => setLoading(false));

    if (user) {
      getUserActiveBooking(user.id).then(setActiveBooking).catch(console.error);
    }
  }, [user]);

  return (
    <Layout>
      <div className="px-6 md:px-16 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("machines.title")}</h1>

        {loading ? (
          <div className="text-center py-20 text-gray-400">{t("machines.loading")}</div>
        ) : machines.length === 0 ? (
          <div className="text-center py-20 text-gray-400">{t("machines.noMachines")}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {machines.map((machine) => (
              <div key={machine.id} className="border rounded-xl p-4 shadow-sm bg-white">
                {machine.image_url ? (
                  <img src={machine.image_url} alt={machine.name}
                    className="w-full h-40 object-cover rounded-lg mb-4" />
                ) : (
                  <div className="h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                    🚜 {t("machines.noImage")}
                  </div>
                )}

                <h2 className="text-xl font-semibold">{machine.name}</h2>
                <p className="text-gray-600 mt-1">₹{machine.price_per_day} {t("machines.perDay")}</p>
                {machine.location && (
                  <p className="text-sm text-gray-500 mt-1">📍 {machine.location}</p>
                )}

                <p className={`mt-2 text-sm font-medium ${machine.status === "Available" ? "text-green-600" : "text-red-500"
                  }`}>
                  {machine.status === "Available" ? t("machines.available") : t("machines.unavailable")}
                </p>

                {bookedId === machine.id ? (
                  <div className="mt-4 w-full py-2 rounded-lg bg-green-50 text-green-700 text-center text-sm font-medium">
                    {t("machines.bookingRequested")}
                  </div>
                ) : activeBooking ? (
                  <div className="mt-4 space-y-2">
                    <button disabled
                      className="w-full py-2 rounded-lg font-medium bg-gray-200 text-gray-500 cursor-not-allowed">
                      {t("machines.bookMachine")}
                    </button>
                    <p className="text-xs text-red-600 font-medium text-center">
                      {activeBooking.status === "Overdue" || activeBooking.status === "Late" 
                        ? t("machines.overdueRestriction")
                        : t("machines.activeBookingRestriction")
                      }
                    </p>
                  </div>
                ) : machine.status === "Available" ? (
                  <button
                    onClick={() => {
                        if (!user) {
                            router.push("/register?redirect=/machines");
                        } else {
                            setSelectedMachine(machine);
                        }
                    }}
                    className="mt-4 w-full py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition">
                    {t("machines.bookMachine")}
                  </button>
                ) : (
                  <button disabled
                    className="mt-4 w-full py-2 rounded-lg font-medium bg-gray-300 text-gray-500 cursor-not-allowed">
                    {t("machines.unavailable")}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedMachine && (
        <BookingModal
          machineId={selectedMachine.id}
          machineName={selectedMachine.name}
          price={selectedMachine.price_per_day}
          onClose={() => setSelectedMachine(null)}
          onBooked={() => {
            setBookedId(selectedMachine.id);
            setSelectedMachine(null);
          }}
        />
      )}
    </Layout>
  );
}
