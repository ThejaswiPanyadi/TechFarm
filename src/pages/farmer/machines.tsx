import { useEffect, useState } from "react";
import FarmerLayout from "@/components/layout/FarmerLayout";
import BookingModal from "@/components/farmer/BookingModal";
import { getMachines } from "@/lib/db";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function FarmerMachines() {
    useAuthGuard("farmer");

    const [machines, setMachines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMachine, setSelectedMachine] = useState<any>(null);
    const [bookedId, setBookedId] = useState<string | null>(null);

    useEffect(() => {
        getMachines()
            .then(setMachines)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <FarmerLayout>
            <div>
                <h1 className="text-2xl font-bold mb-2">Rent a Machine</h1>
                <p className="text-gray-600 mb-6">Browse and book available agricultural machines.</p>

                {loading ? (
                    <div className="text-center py-20 text-gray-400">Loading machines...</div>
                ) : machines.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">No machines available yet.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {machines.map((machine) => {
                            const gallery = Array.isArray(machine.images) ? machine.images : [];
                            const mainImg = gallery[0] || machine.image_url;

                            return (
                                <div key={machine.id} className="border rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition flex flex-col">
                                    <div className="w-full h-40 bg-gray-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden border">
                                        {mainImg ? (
                                            <img src={mainImg} alt={machine.name}
                                                className="max-w-full max-h-full object-contain" /> 
                                        ) : (
                                            <div className="text-gray-400">
                                                🚜 No Image
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-semibold">{machine.name}</h2>
                                    {machine.description && (
                                        <p className="text-gray-500 text-sm mt-1">{machine.description}</p>
                                    )}
                                    <p className="text-gray-600 mt-1">₹{machine.price_per_day} / day</p>
                                    {machine.location && (
                                        <p className="text-sm text-gray-500 mt-1">📍 {machine.location}</p>
                                    )}
                                    <p className={`mt-2 text-sm font-medium ${machine.status === "Available" ? "text-green-600" : "text-red-500"
                                        }`}>
                                        {machine.status === "Available" ? "✓ Available" : "✗ Not Available"}
                                    </p>

                                    {bookedId === machine.id ? (
                                        <div className="mt-4 w-full py-2 rounded-lg bg-green-50 text-green-700 text-center text-sm font-medium">
                                            ✓ Booking Requested!
                                        </div>
                                    ) : machine.status === "Available" ? (
                                        <button onClick={() => setSelectedMachine(machine)}
                                            className="mt-4 w-full py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition">
                                            Book Machine
                                        </button>
                                    ) : (
                                        <button disabled
                                            className="mt-4 w-full py-2 rounded-lg font-medium bg-gray-300 text-gray-500 cursor-not-allowed">
                                            Not Available
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {
                selectedMachine && (
                    <BookingModal
                        machineId={selectedMachine.id}
                        machineName={selectedMachine.name}
                        price={selectedMachine.price_per_day}
                        onClose={() => setSelectedMachine(null)}
                        onBooked={() => {
                            setBookedId(selectedMachine.id);
                            setSelectedMachine(null);
                        }}
                    />
                )
            }
        </FarmerLayout >
    );
}
