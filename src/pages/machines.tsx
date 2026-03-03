import Layout from "@/components/layout/Layout";
import Link from "next/link";

const machines = [
  {
    id: 1,
    name: "Tractor",
    price: "₹1500 / day",
    available: true,
  },
  {
    id: 2,
    name: "Power Tiller",
    price: "₹800 / day",
    available: false,
  },
  {
    id: 3,
    name: "Harvesting Machine",
    price: "₹2000 / day",
    available: true,
  },
];

export default function Machines() {
  return (
    <Layout>
      <div className="px-6 md:px-16 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Rent Agricultural Machines
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {machines.map((machine) => (
            <div
              key={machine.id}
              className="border rounded-xl p-4 shadow-sm bg-white"
            >
              {/* Image Placeholder */}
              <div className="h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                Machine Image
              </div>

              {/* Details */}
              <h2 className="text-xl font-semibold">{machine.name}</h2>
              <p className="text-gray-600 mt-1">{machine.price}</p>

              <p
                className={`mt-2 text-sm font-medium ${
                  machine.available
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {machine.available ? "Available" : "Not Available"}
              </p>

              {/* Book Button */}
              {machine.available ? (
                <Link
                  href={{
                    pathname: "/farmer/bookings",
                    query: { machine: machine.name },
                  }}
                >
                  <button className="mt-4 w-full py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition">
                    Book Machine
                  </button>
                </Link>
              ) : (
                <button
                  disabled
                  className="mt-4 w-full py-2 rounded-lg font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
                >
                  Not Available
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
