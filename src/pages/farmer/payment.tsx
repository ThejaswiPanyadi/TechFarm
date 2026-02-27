import { useRouter } from "next/router";
import { useState } from "react";
import FarmerLayout from "@/components/layout/FarmerLayout";
import Image from "next/image";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function PaymentPage() {
  useAuthGuard("farmer");
  const router = useRouter();
  const { machine, price } = router.query;

  const [method, setMethod] = useState<"cash" | "online" | "">("");
  const [paid, setPaid] = useState(false);

  const handleConfirm = () => {
    setPaid(true);

    // Simulate sending data to admin (frontend only)
    setTimeout(() => {
      alert("Booking request sent to Admin for approval.");
      router.push("/farmer/bookings");
    }, 1500);
  };

  return (
    <FarmerLayout>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-md space-y-6">
        <h2 className="text-2xl font-bold">Payment Method</h2>

        <div>
          <p className="text-lg font-semibold">{machine}</p>
          <p className="text-gray-600">{price}</p>
        </div>

        {/* Payment Options */}
        <div className="space-y-4">
          <div
            onClick={() => setMethod("cash")}
            className={`p-4 border rounded-xl cursor-pointer ${method === "cash"
                ? "border-green-600 bg-green-50"
                : "border-gray-300"
              }`}
          >
            💵 Cash on Shop
          </div>

          <div
            onClick={() => setMethod("online")}
            className={`p-4 border rounded-xl cursor-pointer ${method === "online"
                ? "border-green-600 bg-green-50"
                : "border-gray-300"
              }`}
          >
            💳 Online Payment (Scan QR)
          </div>
        </div>

        {/* QR Code Section */}
        {method === "online" && (
          <div className="text-center space-y-4">
            <p className="font-medium">Scan this QR to pay</p>

            <div className="flex justify-center">
              <Image
                src="/admin-qr.png"   // Put your QR image inside public folder
                alt="Admin QR Code"
                width={200}
                height={200}
              />
            </div>

            <button
              onClick={() => setPaid(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              I Have Paid
            </button>
          </div>
        )}

        {/* Confirm Button */}
        {method === "cash" && (
          <button
            onClick={handleConfirm}
            className="w-full bg-green-700 text-white py-3 rounded-xl font-semibold"
          >
            Confirm Booking (Cash)
          </button>
        )}

        {method === "online" && paid && (
          <button
            onClick={handleConfirm}
            className="w-full bg-green-700 text-white py-3 rounded-xl font-semibold"
          >
            Confirm Booking
          </button>
        )}
      </div>
    </FarmerLayout>
  );
}
