import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";

const listingsData = [
  {
    id: 1,
    name: "Arecanut Seedlings",
    price: "₹50 per plant",
    quantity: "500 plants",
    location: "Sullia",
    seller: "Farmer Ramesh",
  },
  {
    id: 2,
    name: "Paddy Seeds",
    price: "₹40 per kg",
    quantity: "200 kg",
    location: "Kadaba",
    seller: "Farmer Suresh",
  },
  {
    id: 3,
    name: "Banana Saplings",
    price: "₹30 per plant",
    quantity: "300 plants",
    location: "Puttur",
    seller: "Farmer Mahesh",
  },
];

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const filteredListings = listingsData.filter((item) => {
    const matchesName = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesLocation = item.location
      .toLowerCase()
      .includes(locationFilter.toLowerCase());

    return matchesName && matchesLocation;
  });

  return (
    <Layout>
      <div className="px-6 md:px-16 py-10">
        <h1 className="text-3xl font-bold mb-4">
          Crop & Seed Marketplace
        </h1>

        <p className="text-gray-600 mb-6">
          Search and connect with farmers selling crops and seeds.
        </p>

        {/* SEARCH & FILTER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <input
            type="text"
            placeholder="Search crop or seed name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg px-4 py-2"
          />

          <input
            type="text"
            placeholder="Filter by location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="border rounded-lg px-4 py-2"
          />
        </div>

        {/* LISTINGS */}
        {filteredListings.length === 0 ? (
          <p className="text-gray-500">
            No listings found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredListings.map((item) => (
              <div
                key={item.id}
                className="border rounded-xl p-4 bg-white shadow-sm"
              >
                <div className="h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                  Crop Image
                </div>

                <h2 className="text-xl font-semibold">
                  {item.name}
                </h2>
                <p className="text-gray-700 mt-1">
                  {item.price}
                </p>
                <p className="text-sm text-gray-600">
                  Quantity: {item.quantity}
                </p>
                <p className="text-sm text-gray-600">
                  Location: {item.location}
                </p>

                <p className="text-sm text-gray-500 mt-2">
                  Seller: {item.seller}
                </p>

                <Link
                  href={`/marketplace/${item.id}`}
                  className="inline-block mt-4 text-green-600 font-medium hover:underline"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
