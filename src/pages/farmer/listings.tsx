import Link from "next/link";
import FarmerLayout from "@/components/layout/FarmerLayout";

const myListings = [
  {
    id: 1,
    name: "Arecanut Seedlings",
    price: "₹50 per plant",
    quantity: "500 plants",
    location: "Sullia",
    status: "Active",
  },
  {
    id: 2,
    name: "Paddy Seeds",
    price: "₹40 per kg",
    quantity: "200 kg",
    location: "Kadaba",
    status: "Active",
  },
];

export default function MyListings() {
  return (
    <FarmerLayout>
      <div className="px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            My Crop & Seed Listings
          </h1>

          <Link
            href="/farmer/add-listing"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            + Add New Listing
          </Link>
        </div>

        {/* Listings */}
        <div className="space-y-4">
          {myListings.map((item) => (
            <div
              key={item.id}
              className="border rounded-xl p-4 bg-white shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {item.name}
                  </h2>
                  <p className="text-gray-600">
                    Price: {item.price}
                  </p>
                  <p className="text-gray-600">
                    Quantity: {item.quantity}
                  </p>
                  <p className="text-gray-600">
                    Location: {item.location}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-green-600">
                    {item.status}
                  </span>

                  <button className="border px-4 py-1 rounded hover:bg-gray-100">
                    View
                  </button>

                  <button className="border px-4 py-1 rounded hover:bg-gray-100">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </FarmerLayout>
  );
}
