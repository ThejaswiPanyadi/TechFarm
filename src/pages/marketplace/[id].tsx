import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout";

const dummyListings = [
  {
    id: "1",
    name: "Arecanut Seedlings",
    price: "₹50 per plant",
    quantity: "500 plants",
    location: "Sullia",
    description: "Healthy arecanut seedlings ready for plantation.",
    sellerName: "Ramesh",
    phone: "9876543210",
  },
  {
    id: "2",
    name: "Paddy Seeds",
    price: "₹40 per kg",
    quantity: "200 kg",
    location: "Kadaba",
    description: "High quality paddy seeds suitable for monsoon season.",
    sellerName: "Suresh",
    phone: "9123456780",
  },
];

export default function ListingDetails() {
  const router = useRouter();
  const { id } = router.query;

  const listing = dummyListings.find(
    (item) => item.id === id
  );

  if (!listing) {
    return (
      <Layout>
        <div className="px-6 py-10">
          <p>Listing not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-6 md:px-16 py-10 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">
          {listing.name}
        </h1>

        {/* Image Placeholder */}
        <div className="h-60 bg-gray-100 rounded-lg mb-6 flex items-center justify-center text-gray-400">
          Crop Image
        </div>

        <p className="text-lg text-gray-700 mb-2">
          <strong>Price:</strong> {listing.price}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Quantity:</strong> {listing.quantity}
        </p>
        <p className="text-gray-700 mb-4">
          <strong>Location:</strong> {listing.location}
        </p>

        <p className="text-gray-600 mb-6">
          {listing.description}
        </p>

        {/* Seller Info */}
        <div className="border rounded-lg p-4 bg-green-50">
          <h2 className="text-lg font-semibold mb-2">
            Seller Details
          </h2>
          <p><strong>Name:</strong> {listing.sellerName}</p>
          <p><strong>Phone:</strong> {listing.phone}</p>

          <a
            href={`tel:${listing.phone}`}
            className="inline-block mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Call Seller
          </a>
        </div>
      </div>
    </Layout>
  );
}
