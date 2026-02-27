import { useState } from "react";
import { createBooking } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";

interface Props {
  machineId: string;
  machineName: string;
  price: number;
  onClose: () => void;
  onBooked: () => void;
}

export default function BookingModal({ machineId, machineName, price, onClose, onBooked }: Props) {
  const { user } = useAuth();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [payment, setPayment] = useState<"cash" | "online">("cash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = fromDate && toDate
    ? Math.max(1, Math.ceil((new Date(toDate).getTime() - new Date(fromDate).getTime()) / 86400000) + 1)
    : 0;
  const total = days * price;

  async function handleSubmit() {
    if (!user || !fromDate || !toDate) return;
    setLoading(true);
    setError(null);
    try {
      await createBooking({
        machine_id: machineId,
        farmer_id: user.id,
        from_date: fromDate,
        to_date: toDate,
        total_amount: total,
        payment_method: payment,
      });
      onBooked();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-1">Book {machineName}</h2>
        <p className="text-sm text-gray-500 mb-4">Select dates and payment method</p>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm border border-red-200 rounded-lg px-4 py-2 mb-4">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">From Date *</label>
            <input type="date" className="w-full border rounded-lg p-3"
              value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">To Date *</label>
            <input type="date" className="w-full border rounded-lg p-3"
              value={toDate} onChange={(e) => setToDate(e.target.value)}
              min={fromDate || new Date().toISOString().split("T")[0]} />
          </div>

          <div>
            <p className="font-medium mb-2">Payment Method</p>
            <label className="mr-4 cursor-pointer">
              <input type="radio" checked={payment === "cash"}
                onChange={() => setPayment("cash")} /> Cash at Shop
            </label>
            <label className="cursor-pointer">
              <input type="radio" checked={payment === "online"}
                onChange={() => setPayment("online")} /> Online Payment
            </label>
          </div>

          {days > 0 && (
            <div className="bg-gray-100 rounded-lg p-4 text-sm">
              <p>Price per day: ₹{price}</p>
              <p>Duration: {days} day(s)</p>
              <hr className="my-2" />
              <p className="font-bold text-green-700">Total: ₹{total}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button onClick={onClose} className="w-full border rounded-lg py-2 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={loading || !fromDate || !toDate}
              className="w-full bg-green-700 text-white rounded-lg py-2 hover:bg-green-800 disabled:opacity-60">
              {loading ? "Booking..." : "Submit Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
