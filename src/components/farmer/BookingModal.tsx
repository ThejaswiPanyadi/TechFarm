import { useState, useEffect } from "react";
import { createBooking, getProfile, getUserActiveBooking } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

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
  const { t } = useLanguage();

  // Wizard step
  const [step, setStep] = useState<Step>("customer");

  // Customer details
  const [customerMode, setCustomerMode] = useState<CustomerMode>("profile");
  const [profileData, setProfileData] = useState<{ full_name: string | null; phone: string | null; location: string | null } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualLocation, setManualLocation] = useState("");
  // Optional override of profile village for profile mode
  const [locationOverride, setLocationOverride] = useState("");
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

  // Load profile on mount; pre-fill locationOverride with stored village
  useEffect(() => {
    if (!user) return;
    setProfileLoading(true);
    getProfile(user.id)
      .then((p) => {
        setProfileData(p);
        if (p?.location) setLocationOverride(p.location);
      })
      .catch(console.error)
      .finally(() => setProfileLoading(false));
  }, [user]);

  // Derived customer fields based on mode
  const customerName = customerMode === "profile" ? (profileData?.full_name ?? "") : manualName;
  const customerPhone = customerMode === "profile" ? (profileData?.phone ?? "") : manualPhone;
  // For profile mode use override (which defaults to stored village); for manual mode use selection
  const customerLocation = customerMode === "profile"
    ? (locationOverride || profileData?.location || "")
    : manualLocation;

  // Validate step 1
  const step1Valid =
    customerMode === "profile"
      ? !!profileData && customerLocation.trim() !== ""
      : manualName.trim() !== "" && manualPhone.trim() !== "" && manualLocation.trim() !== "";

  // Validate step 2
  const step2Valid = !!fromDate && !!toDate && days > 0;

  async function handleSubmit() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Re-verify status just in case
      const active = await getUserActiveBooking(user.id);
      if (active) {
          const isOverdue = active.status === "Overdue" || active.status === "Late";
          if (isOverdue) {
              throw new Error("You have not returned your previous machine. Please return it to continue booking.");
          }
          throw new Error("You already have an active booking. Please complete or return the current machine before booking another.");
      }

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
  const stepLabels = { customer: t("booking.customerDetails"), dates: t("booking.toDate"), payment: t("booking.paymentChoice") };
  const currentStepIdx = steps.indexOf(step);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b">
          <h2 className="text-xl font-bold">{t("machines.bookMachine")} {machineName}</h2>
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
              <p className="text-sm text-gray-500 font-medium">{t("booking.customerInfoMode")}</p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCustomerMode("profile")}
                  className={`p-4 rounded-xl border-2 text-left transition ${customerMode === "profile"
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <div className="text-lg mb-1">👤</div>
                  <div className="font-medium text-sm">{t("booking.useProfile")}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{t("booking.autoFillDesc")}</div>
                </button>

                <button
                  onClick={() => setCustomerMode("manual")}
                  className={`p-4 rounded-xl border-2 text-left transition ${customerMode === "manual"
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <div className="text-lg mb-1">✏️</div>
                  <div className="font-medium text-sm">{t("booking.manualEntry")}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{t("booking.typeNewDetails")}</div>
                </button>
              </div>

              {customerMode === "profile" && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  {profileLoading ? (
                    <p className="text-sm text-gray-400">{t("booking.profileLoading")}</p>
                  ) : profileData ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 w-20">{t("booking.name")}</span>
                        <span className="text-sm">{profileData.full_name || <span className="text-gray-400 italic">{t("booking.notSet")}</span>}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 w-20">{t("booking.phone")}</span>
                        <span className="text-sm">{profileData.phone || <span className="text-gray-400 italic">{t("booking.notSet")}</span>}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500 w-20">{t("booking.village")}</span>
                          <span className="text-sm text-gray-700">{profileData.location || <span className="text-gray-400 italic">{t("booking.notSet")}</span>}</span>
                        </div>
                        {/* Optional location override */}
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">{t("booking.locationOverride")}</label>
                          <select
                            value={locationOverride}
                            onChange={(e) => setLocationOverride(e.target.value)}
                            className="w-full border rounded-lg p-2 text-sm bg-white"
                          >
                            <option value="">— {t("booking.sameAsProfile")} ({profileData.location || t("booking.notSet")}) —</option>
                            <option value="Kadaba">Kadaba</option>
                            <option value="Nelyadi">Nelyadi</option>
                            <option value="Kaniyoor">Kaniyoor</option>
                            <option value="Panja">Panja</option>
                            <option value="Sullia">Sullia</option>
                            <option value="Bellare">Bellare</option>
                            <option value="Subrahmanya">Subrahmanya</option>
                            <option value="Aranthodu">Aranthodu</option>
                            <option value="Guthigar">Guthigar</option>
                            <option value="Balila">Balila</option>
                            <option value="Ballya">Ballya</option>
                            <option value="Kutrupadi">Kutrupadi</option>
                          </select>
                        </div>
                      </div>
                      {(!profileData.phone || !profileData.location) && (
                        <p className="text-xs text-amber-600 mt-2">⚠ {t("booking.missingFieldsWarning")}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">{t("auth.registerError")}</p>
                  )}
                </div>
              )}

              {customerMode === "manual" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium block mb-1">{t("auth.fullName")} *</label>
                    <input
                      type="text"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder={t("auth.fullName")}
                      className="w-full border rounded-lg p-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">{t("auth.userPhone")} *</label>
                    <input
                      type="tel"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full border rounded-lg p-3 text-sm" required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">{t("booking.village")} *</label>
                    <select
                      value={manualLocation}
                      onChange={(e) => setManualLocation(e.target.value)}
                      className="w-full border rounded-lg p-3 text-sm bg-white"
                    >
                      <option value="">— {t("booking.selectVillage")} —</option>
                      <option value="Kadaba">Kadaba</option>
                      <option value="Nelyadi">Nelyadi</option>
                      <option value="Kaniyoor">Kaniyoor</option>
                      <option value="Panja">Panja</option>
                      <option value="Sullia">Sullia</option>
                      <option value="Bellare">Bellare</option>
                      <option value="Subrahmanya">Subrahmanya</option>
                      <option value="Aranthodu">Aranthodu</option>
                      <option value="Guthigar">Guthigar</option>
                      <option value="Balila">Balila</option>
                      <option value="Ballya Kutrupadi">Ballya Kutrupadi</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1.5">
                      ℹ️ {t("booking.serviceAreaHint")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">{t("booking.notes")}</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t("booking.notesPlaceholder")}
                      rows={2}
                      className="w-full border rounded-lg p-3 text-sm resize-none"
                    />
                  </div>
                </div>
              )}

              {/* notes for profile mode too */}
              {customerMode === "profile" && (
                <div>
                  <label className="text-sm font-medium block mb-1">{t("booking.notes")}</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("booking.notesPlaceholder")}
                    rows={2}
                    className="w-full border rounded-lg p-3 text-sm resize-none"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="w-full border rounded-lg py-2.5 text-sm hover:bg-gray-50">
                  {t("common.cancel")}
                </button>
                <button
                  disabled={!step1Valid}
                  onClick={() => setStep("dates")}
                  className="w-full bg-green-700 text-white rounded-lg py-2.5 text-sm hover:bg-green-800 disabled:opacity-50"
                >
                  {t("booking.next")}
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 2: Date Selection ────────────────────── */}
          {step === "dates" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">{t("booking.fromDate")} *</label>
                <input
                  type="date"
                  className="w-full border rounded-lg p-3"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">{t("booking.toDate")} *</label>
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
                  <p className="text-gray-600 font-medium">{t("booking.pricePerDay")}: <span className="font-bold">₹{price}</span></p>
                  <p className="text-gray-600 font-medium">{t("booking.duration")}: <span className="font-bold">{days} day(s)</span></p>
                  <hr className="my-2 border-green-200" />
                  <p className="font-bold text-green-700 text-base">{t("booking.total")}: ₹{total}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep("customer")} className="w-full border rounded-lg py-2.5 text-sm hover:bg-gray-50">
                  {t("booking.back")}
                </button>
                <button
                  disabled={!step2Valid}
                  onClick={() => setStep("payment")}
                  className="w-full bg-green-700 text-white rounded-lg py-2.5 text-sm hover:bg-green-800 disabled:opacity-50"
                >
                  {t("booking.next")}
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Payment ──────────────────────────── */}
          {step === "payment" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 font-medium">{t("booking.paymentChoice")}</p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setPayment("cash"); setQrConfirmed(false); }}
                  className={`p-4 rounded-xl border-2 text-left transition ${payment === "cash" ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <div className="text-2xl mb-1">🏪</div>
                  <div className="font-medium text-sm">{t("booking.cashAtShop")}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{t("booking.payInPerson")}</div>
                </button>

                <button
                  onClick={() => setPayment("online")}
                  className={`p-4 rounded-xl border-2 text-left transition ${payment === "online" ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <div className="text-2xl mb-1">📱</div>
                  <div className="font-medium text-sm">{t("booking.onlinePayment")}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{t("booking.payViaUpi")}</div>
                </button>
              </div>

              {/* Cash info */}
              {payment === "cash" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-1">
                  <p className="font-bold">⏱ {t("booking.cashPayDue")}</p>
                  <p>{t("booking.cashDeadlineInfo")}</p>
                </div>
              )}

              {/* Online QR */}
              {payment === "online" && (
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm font-bold text-gray-700 mb-3">{t("booking.scanQr")} ₹{total}</p>
                    <img
                      src="/myqr-code.jpg"
                      alt="Admin Payment QR"
                      className="w-48 h-48 object-contain mx-auto rounded-lg border"
                    />
                    <p className="text-xs text-gray-500 mt-3">{t("booking.readyToSubmit")}</p>
                  </div>

                  <button
                    onClick={() => setQrConfirmed(true)}
                    className={`w-full py-3 rounded-xl text-sm font-medium transition ${qrConfirmed
                      ? "bg-green-100 text-green-700 border border-green-300 cursor-default"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                  >
                    {qrConfirmed ? t("booking.readyToSubmit") : t("booking.confirmPaid")}
                  </button>
                </div>
              )}

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1 font-medium">
                <p className="font-bold text-gray-700 mb-2">{t("booking.summary")}</p>
                <p>👤 {customerName || "—"}</p>
                <p>📞 {customerPhone || "—"}</p>
                <p>📍 {customerLocation || "—"}</p>
                <p>📅 {fromDate} → {toDate} ({days} day{days !== 1 ? "s" : ""})</p>
                <p className="font-bold text-green-700 mt-2">{t("booking.total")}: ₹{total}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep("dates")} className="w-full border rounded-lg py-2.5 text-sm hover:bg-gray-50">
                  {t("booking.back")}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || (payment === "online" && !qrConfirmed)}
                  className="w-full bg-green-700 text-white rounded-lg py-2.5 text-sm hover:bg-green-800 disabled:opacity-50"
                >
                  {loading
                    ? t("booking.submitting")
                    : payment === "cash"
                      ? t("booking.confirmBooking")
                      : t("booking.submitNotifyAdmin")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
