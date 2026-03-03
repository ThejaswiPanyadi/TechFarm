import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";

interface Machine {
  id: number;
  name: string;
  description: string;
  location: string;
  price: number;
  image: string;
  status: "Available" | "Unavailable";
}

export default function ManageMachines() {
  const [machines, setMachines] = useState<Machine[]>([
    {
      id: 1,
      name: "John Deere Tractor 5050D",
      description: "50 HP tractor suitable for plowing and tilling.",
      location: "Village Center",
      price: 1500,
      image: "/machine-card.jpg",
      status: "Available",
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const [newMachine, setNewMachine] = useState({
    name: "",
    description: "",
    location: "",
    price: "",
    image: "",
    status: "Available",
  });

  const handleAddMachine = () => {
    if (!newMachine.name || !newMachine.price) return;

    const machine: Machine = {
      id: Date.now(),
      name: newMachine.name,
      description: newMachine.description,
      location: newMachine.location,
      price: Number(newMachine.price),
      image: newMachine.image || "/machine-card.jpg",
      status: newMachine.status as "Available" | "Unavailable",
    };

    setMachines([...machines, machine]);
    setShowForm(false);
    setNewMachine({
      name: "",
      description: "",
      location: "",
      price: "",
      image: "",
      status: "Available",
    });
  };

  const handleDelete = (id: number) => {
    setMachines(machines.filter((m) => m.id !== id));
  };

  const toggleStatus = (id: number) => {
    setMachines(
      machines.map((m) =>
        m.id === id
          ? {
              ...m,
              status:
                m.status === "Available" ? "Unavailable" : "Available",
            }
          : m
      )
    );
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Machines</h1>
          <p className="text-gray-600">
            Add, edit, or remove rental machines from your inventory.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          + Add Machine
        </button>
      </div>

      {/* ADD MACHINE FORM */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Machine Name"
              className="border p-2 rounded"
              value={newMachine.name}
              onChange={(e) =>
                setNewMachine({ ...newMachine, name: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Location"
              className="border p-2 rounded"
              value={newMachine.location}
              onChange={(e) =>
                setNewMachine({ ...newMachine, location: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Price per day"
              className="border p-2 rounded"
              value={newMachine.price}
              onChange={(e) =>
                setNewMachine({ ...newMachine, price: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Image URL"
              className="border p-2 rounded"
              value={newMachine.image}
              onChange={(e) =>
                setNewMachine({ ...newMachine, image: e.target.value })
              }
            />

            <select
              className="border p-2 rounded"
              value={newMachine.status}
              onChange={(e) =>
                setNewMachine({ ...newMachine, status: e.target.value })
              }
            >
              <option>Available</option>
              <option>Unavailable</option>
            </select>

            <textarea
              placeholder="Description"
              className="border p-2 rounded col-span-1 md:col-span-2"
              value={newMachine.description}
              onChange={(e) =>
                setNewMachine({ ...newMachine, description: e.target.value })
              }
            />
          </div>

          <button
            onClick={handleAddMachine}
            className="mt-4 bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Save Machine
          </button>
        </div>
      )}

      {/* MACHINE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {machines.map((machine) => (
          <div
            key={machine.id}
            className="bg-white rounded-xl shadow overflow-hidden"
          >
            <div className="relative">
              <img
                src={machine.image}
                alt={machine.name}
                className="w-full h-48 object-cover"
              />
              <span
                className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm text-white ${
                  machine.status === "Available"
                    ? "bg-green-600"
                    : "bg-red-600"
                }`}
              >
                {machine.status}
              </span>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg">
                {machine.name}
              </h3>
              <p className="text-gray-600 text-sm">
                {machine.description}
              </p>
              <p className="text-sm mt-2 text-gray-500">
                📍 {machine.location}
              </p>
              <p className="font-bold text-green-700 mt-2">
                ₹ {machine.price} / day
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => toggleStatus(machine.id)}
                  className="border px-3 py-1 rounded text-sm"
                >
                  Toggle Status
                </button>

                {/* <button
                  onClick={() => handleDelete(machine.id)}
                  className="border border-red-500 text-red-500 px-3 py-1 rounded text-sm"
                >
                  Delete
                </button> */}

                <button
 onClick={() => handleDelete(machine.id)}
                    className="w-12 flex items-center justify-center border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition  text-padding-2"
                  ><b>Delete</b></button>

              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
