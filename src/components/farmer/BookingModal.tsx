import { useState, useEffect } from "react";
import { createBooking, getProfile } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";

interface Props {
  machineId: string;
  machineName: string;
  price: number;
  onClose: () => void;
  onBooked: () => void;
}

type Step = "customer" | "dates" | "payment";
type CustomerMode = "profile" | "manual";

export default function BookingModal({ machineId, machineName, price, onClose, onBooked }: Props) {
  const { user } = useAuth();

  // Wizard step
  const [step, setStep] = useState<Step>("customer");

  // Customer details
  const [customerMode, setCustomerMode] = useState<CustomerMode>("profile");
  const [profileData, setProfileData] = useState<{ full_name: string | null; phone: string | null; location: string | null } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualLocation, setManualLocation] = useState("");
  const [notes, setNotes] = useState("");

  // Dates
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Payment
  const [payment, setPayment] = useState<"cash" | "online">("cash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrConfirmed, setQrConfirmed] = useState(false);

  const days =
    fromDate && toDate
      ? Math.max(1, Math.ceil((new Date(toDate).getTime() - new Date(fromDate).getTime()) / 86400000) + 1)
      : 0;
  const total = days * price;

  // Load profile on mount
  useEffect(() => {
    if (!user) return;
    setProfileLoading(true);
    getProfile(user.id)
      .then(setProfileData)
      .catch(console.error)
      .finally(() => setProfileLoading(false));
  }, [user]);

  // Derived customer fields based on mode
  const customerName = customerMode === "profile" ? (profileData?.full_name ?? "") : manualName;
  const customerPhone = customerMode === "profile" ? (profileData?.phone ?? "") : manualPhone;
  const customerLocation = customerMode === "profile" ? (profileData?.location ?? "") : manualLocation;

  // Validate step 1
  const step1Valid =
    customerMode === "profile"
      ? !!profileData
      : manualName.trim() !== "" && manualPhone.trim() !== "" && manualLocation.trim() !== "";

  // Validate step 2
  const step2Valid = !!fromDate && !!toDate && days > 0;

  async function handleSubmit() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const cashDeadline = new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString();

      const status = payment === "cash" ? "Pending Payment" : "Waiting Admin Approval";

      await createBooking({
        machine_id: machineId,
        farmer_id: user.id,
        from_date: fromDate,
        to_date: toDate,
        total_amount: total,
        payment_method: payment,
        status,
        customer_name: customerName || undefined,
        customer_phone: customerPhone || undefined,
        customer_location: customerLocation || undefined,
        notes: notes || undefined,
        cash_deadline: payment === "cash" ? cashDeadline : null,
      });

      onBooked();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ─── STEP INDICATORS ──────────────────────────────────────
  const steps: Step[] = ["customer", "dates", "payment"];
  const stepLabels = { customer: "Customer", dates: "Dates", payment: "Payment" };
  const currentStepIdx = steps.indexOf(step);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b">
          <h2 className="text-xl font-bold">Book {machineName}</h2>
          {/* Step pills */}
          <div className="flex items-center gap-2 mt-3">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${i < currentStepIdx
                    ? "bg-green-600 text-white"
                    : i === currentStepIdx
                      ? "bg-green-700 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}>
                  <span>{i < currentStepIdx ? "✓" : i + 1}</span>
                  <span>{stepLabels[s]}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-px w-4 ${i < currentStepIdx ? "bg-green-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm border border-red-200 rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          {/* ─── STEP 1: Customer Details ──────────────────── */}
          {step === "customer" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">How would you like to fill customer details?</p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCustomerMode("profile")}
                  className={`p-4 rounded-xl border-2 text-left transition ${customerMode === "profile"
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <div className="text-lg mb-1">👤</div>
                  <div className="font-medium text-sm">Use my profile</div>
                  <div className="text-xs text-gray-500 mt-0.5">Auto-fill from account</div>
                </button>

                <button
                  onClick={() => setCustomerMode("manual")}
                  className={`p-4 rounded-xl border-2 text-left transition ${customerMode === "manual"
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <div className="text-lg mb-1">✏️</div>
                  <div className="font-medium text-sm">Enter manually</div>
                  <div className="text-xs text-gray-500 mt-0.5">Type in new details</div>
                </button>
              </div>

              {customerMode === "profile" && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  {profileLoading ? (
                    <p className="text-sm text-gray-400">Loading profile...</p>
                  ) : profileData ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 w-20">Name</span>
                        <span className="text-sm">{profileData.full_name || <span className="text-gray-400 italic">Not set</span>}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 w-20">Phone</span>
                        <span className="text-sm">{profileData.phone || <span className="text-gray-400 italic">Not set</span>}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 w-20">Location</span>
                        <span className="text-sm">{profileData.location || <span className="text-gray-400 italic">Not set</span>}</span>
                      </div>
                      {(!profileData.phone || !profileData.location) && (
                        <p className="text-xs text-amber-600 mt-2">⚠ Some profile fields are empty. Consider entering details manually.</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">Could not load profile.</p>
                  )}
                </div>
              )}

              {customerMode === "manual" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium block mb-1">Name *</label>
                    <input
                      type="text"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="Full name"
                      className="w-full border rounded-lg p-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full border rounded-lg p-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Location *</label>
                    <input
                      type="text"
                      value={manualLocation}
                      onChange={(e) => setManualLocation(e.target.value)}
                      placeholder="Your village / town"
                      className="w-full border rounded-lg p-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Notes (optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requirements..."
                      rows={2}
                      className="w-full border rounded-lg p-3 text-sm resize-none"
                    />
                  </div>
                </div>
              )}

              {/* notes for profile mode too */}
              {customerMode === "profile" && (
                <div>
                  <label className="text-sm font-medium block mb-1">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requirements..."
                    rows={2}
                    className="w-full border rounded-lg p-3 text-sm resize-none"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="w-full border rounded-lg py-2.5 text-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  disabled={!step1Valid}
                  onClick={() => setStep("dates")}
                  className="w-full bg-green-700 text-white rounded-lg py-2.5 text-sm hover:bg-green-800 disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 2: Date Selection ────────────────────── */}
          {step === "dates" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">From Date *</label>
                <input
                  type="date"
                  className="w-full border rounded-lg p-3"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">To Date *</label>
                <input
                  type="date"
                  className="w-full border rounded-lg p-3"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate || new Date().toISOString().split("T")[0]}
                />
              </div>

              {days > 0 && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm space-y-1">
                  <p className="text-gray-600">Price per day: <span className="font-medium">₹{price}</span></p>
                  <p className="text-gray-600">Duration: <span className="font-medium">{days} day(s)</span></p>
                  <hr className="my-2 border-green-200" />
                  <p className="font-bold text-green-700 text-base">Total: ₹{total}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep("customer")} className="w-full border rounded-lg py-2.5 text-sm hover:bg-gray-50">
                  ← Back
                </button>
                <button
                  disabled={!step2Valid}
                  onClick={() => setStep("payment")}
                  className="w-full bg-green-700 text-white rounded-lg py-2.5 text-sm hover:bg-green-800 disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Payment ──────────────────────────── */}
          {step === "payment" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 font-medium">Choose how you want to pay</p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setPayment("cash"); setQrConfirmed(false); }}
                  className={`p-4 rounded-xl border-2 text-left transition ${payment === "cash" ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <div className="text-2xl mb-1">🏪</div>
                  <div className="font-medium text-sm">Cash at Shop</div>
                  <div className="text-xs text-gray-500 mt-0.5">Pay in-person within 5 hrs</div>
                </button>

                <button
                  onClick={() => setPayment("online")}
                  className={`p-4 rounded-xl border-2 text-left transition ${payment === "online" ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <div className="text-2xl mb-1">📱</div>
                  <div className="font-medium text-sm">Online Payment</div>
                  <div className="text-xs text-gray-500 mt-0.5">Pay via UPI / QR code</div>
                </button>
              </div>

              {/* Cash info */}
              {payment === "cash" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-1">
                  <p className="font-semibold">⏱ Pay within 5 hours</p>
                  <p>Please visit the shop and complete your cash payment within 5 hours of booking. If payment is not received, your booking will be automatically cancelled.</p>
                </div>
              )}

              {/* Online QR */}
              {payment === "online" && (
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm font-medium text-gray-700 mb-3">Scan QR to pay ₹{total}</p>
                    <img
                      src="/admin-qr.png"
                      alt="Admin Payment QR"
                      className="w-48 h-48 object-contain mx-auto rounded-lg border"
                    />
                    <p className="text-xs text-gray-500 mt-3">After paying, click the button below to confirm</p>
                  </div>

                  <button
                    onClick={() => setQrConfirmed(true)}
                    className={`w-full py-3 rounded-xl text-sm font-medium transition ${qrConfirmed
                        ? "bg-green-100 text-green-700 border border-green-300 cursor-default"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                  >
                    {qrConfirmed ? "✓ Payment Confirmed — Ready to Submit" : "I Have Paid"}
                  </button>
                </div>
              )}

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
                <p className="font-semibold text-gray-700 mb-2">Booking Summary</p>
                <p>👤 {customerName || "—"}</p>
                <p>📞 {customerPhone || "—"}</p>
                <p>📍 {customerLocation || "—"}</p>
                <p>📅 {fromDate} → {toDate} ({days} day{days !== 1 ? "s" : ""})</p>
                <p className="font-bold text-green-700 mt-2">Total: ₹{total}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep("dates")} className="w-full border rounded-lg py-2.5 text-sm hover:bg-gray-50">
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || (payment === "online" && !qrConfirmed)}
                  className="w-full bg-green-700 text-white rounded-lg py-2.5 text-sm hover:bg-green-800 disabled:opacity-50"
                >
                  {loading
                    ? "Submitting..."
                    : payment === "cash"
                      ? "Confirm Booking"
                      : "Submit & Notify Admin"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
