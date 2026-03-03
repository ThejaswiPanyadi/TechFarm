import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";

type Status = "Pending" | "Approved" | "Rejected";

interface Booking {
  id: number;
  machine: string;
  farmer: string;
  location: string;
  from: string;
  to: string;
  amount: number;
  status: Status;
  created: string;
}

export default function BookingRequests() {
  const [filter, setFilter] = useState<Status | "All">("All");

  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 1,
      machine: "John Deere Tractor 5050D",
      farmer: "Ramesh Kumar",
      location: "Village Center",
      from: "Jan 25, 2026",
      to: "Jan 27, 2026",
      amount: 4500,
      status: "Pending",
      created: "2 hours ago",
    },
    {
      id: 2,
      machine: "Rotavator (Tiller)",
      farmer: "Suresh Patel",
      location: "North District",
      from: "Jan 26, 2026",
      to: "Jan 28, 2026",
      amount: 2400,
      status: "Pending",
      created: "5 hours ago",
    },
    {
      id: 3,
      machine: "Harvester Combine",
      farmer: "Anjali Devi",
      location: "South Block",
      from: "Jan 20, 2026",
      to: "Jan 22, 2026",
      amount: 10500,
      status: "Approved",
      created: "2 days ago",
    },
    {
      id: 4,
      machine: "Seed Drill Machine",
      farmer: "Prakash Singh",
      location: "East Zone",
      from: "Jan 18, 2026",
      to: "Jan 19, 2026",
      amount: 1200,
      status: "Rejected",
      created: "3 days ago",
    },
  ]);

  const pendingCount = bookings.filter(b => b.status === "Pending").length;

  const updateStatus = (id: number, status: Status) => {
    setBookings(bookings.map(b =>
      b.id === id ? { ...b, status } : b
    ));
  };

  const filteredBookings =
    filter === "All"
      ? bookings
      : bookings.filter(b => b.status === filter);

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-1">Booking Requests</h1>
        <p className="text-gray-600 mb-6">
          Review and manage machine rental requests from farmers. 
          <span className="text-yellow-600 font-medium"> ({pendingCount} pending)</span>
        </p>

        {/* FILTER TABS */}
        <div className="flex gap-3 mb-6">
          {["All", "Pending", "Approved", "Rejected"].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={`px-5 py-2 rounded-full font-medium transition ${
                filter === tab
                  ? "bg-green-700 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {tab}
              {tab === "Pending" && pendingCount > 0 && (
                <span className="ml-2 bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* BOOKING LIST */}
        <div className="space-y-5">
          {filteredBookings.map(booking => (
            <div
              key={booking.id}
              className="bg-white rounded-xl p-6 shadow flex flex-col lg:flex-row justify-between gap-4"
            >
              {/* LEFT INFO */}
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-lg">
                    {booking.machine}
                  </h2>

                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      booking.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : booking.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {booking.status}
                  </span>

                  <span className="text-gray-400 text-sm">
                    {booking.created}
                  </span>
                </div>

                <p className="text-gray-600 mt-2">
                  👤 {booking.farmer}
                </p>

                <p className="text-gray-600">
                  📍 {booking.location}
                </p>

                <p className="text-gray-600">
                  📅 {booking.from} - {booking.to}
                </p>

                <p className="text-green-700 font-semibold mt-2">
                  ₹ {booking.amount}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-3">
                <button className="border px-4 py-2 rounded-lg">
                  Details
                </button>

                {booking.status === "Pending" && (
                  <>
                    <button
                      onClick={() =>
                        updateStatus(booking.id, "Approved")
                      }
                      className="bg-green-600 text-white px-4 py-2 rounded-lg"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(booking.id, "Rejected")
                      }
                      className="bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
