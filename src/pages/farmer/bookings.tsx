import { useState } from "react";
import FarmerLayout from "@/components/layout/FarmerLayout";
import { Calendar, MapPin, Phone } from "lucide-react";

type Status = "Pending" | "Approved" | "Rejected";

interface Booking {
  id: string;
  machine: string;
  location: string;
  from: string;
  to: string;
  price: number;
  days: number;
  status: Status;
}

export default function MyBookings() {
  const [filter, setFilter] = useState<"All" | Status>("All");

  const bookings: Booking[] = [
    {
      id: "1",
      machine: "John Deere Tractor 5050D",
      location: "Village Center",
      from: "Jan 20, 2026",
      to: "Jan 22, 2026",
      price: 4500,
      days: 3,
      status: "Approved",
    },
    {
      id: "2",
      machine: "Rotavator (Tiller)",
      location: "North Field",
      from: "Jan 25, 2026",
      to: "Jan 26, 2026",
      price: 1600,
      days: 2,
      status: "Pending",
    },
    {
      id: "3",
      machine: "Water Pump (Diesel)",
      location: "East Zone",
      from: "Jan 15, 2026",
      to: "Jan 16, 2026",
      price: 800,
      days: 2,
      status: "Rejected",
    },
  ];

  const filteredBookings =
    filter === "All"
      ? bookings
      : bookings.filter((b) => b.status === filter);

  const statusColor = (status: Status) => {
    switch (status) {
      case "Approved":
        return "text-green-600";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm";
      case "Rejected":
        return "text-red-600";
    }
  };

  return (
    <FarmerLayout>
      <div className="space-y-8">
        {/* Title */}
        <div>
          <h2 className="text-3xl font-bold">My Bookings</h2>
          <p className="text-gray-600 mt-2">
            Track all your machine rental requests and their status.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 flex-wrap">
          {["All", "Pending", "Approved", "Rejected"].map((btn) => (
            <button
              key={btn}
              onClick={() => setFilter(btn as any)}
              className={`px-5 py-2 rounded-full font-medium transition ${
                filter === btn
                  ? "bg-green-700 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {btn}
            </button>
          ))}
        </div>

        {/* Booking Cards */}
        <div className="space-y-5">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl shadow-sm p-6 flex flex-col lg:flex-row justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">
                    {booking.machine}
                  </h3>

                  {booking.status === "Pending" && (
                    <span className={statusColor("Pending")}>
                      Pending
                    </span>
                  )}

                  {booking.status === "Approved" && (
                    <span className="text-green-600 font-medium">
                      Approved
                    </span>
                  )}

                  {booking.status === "Rejected" && (
                    <span className="text-red-600 font-medium">
                      Rejected
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-6 text-gray-600 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {booking.from} - {booking.to}
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {booking.location}
                  </div>
                </div>
              </div>

              {/* Right Side */}
              <div className="flex items-center justify-between lg:justify-end gap-6">
                <div className="text-green-700 font-semibold">
                  ₹ {booking.price} ({booking.days} days)
                </div>

                {booking.status === "Approved" && (
                  <button className="flex items-center gap-2 border border-green-700 text-green-700 px-4 py-2 rounded-xl hover:bg-green-700 hover:text-white transition">
                    <Phone className="w-4 h-4" />
                    Contact Shop
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </FarmerLayout>
  );
}
