import { supabase } from "./supabase";

// ─── MACHINES ─────────────────────────────────────────────

export async function getMachines() {
    const { data, error } = await supabase
        .from("machines")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
}

export async function addMachine(machine: {
    name: string;
    description: string;
    location: string;
    price_per_day: number;
    image_url?: string;
    status: string;
}) {
    const { data, error } = await supabase.from("machines").insert(machine).select().single();
    if (error) throw error;
    return data;
}

export async function updateMachine(id: string, updates: Partial<{ status: string; name: string; price_per_day: number }>) {
    const { data, error } = await supabase.from("machines").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
}

export async function deleteMachine(id: string) {
    const { error } = await supabase.from("machines").delete().eq("id", id);
    if (error) throw error;
}

// ─── BOOKINGS ─────────────────────────────────────────────

export async function getAllBookings() {
    const { data, error } = await supabase
        .from("bookings")
        .select("*, machines(name, location), profiles(full_name)")
        .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
}

export async function getFarmerBookings(farmerId: string) {
    const { data, error } = await supabase
        .from("bookings")
        .select("*, machines(name, location, price_per_day)")
        .eq("farmer_id", farmerId)
        .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
}

export async function createBooking(booking: {
    machine_id: string;
    farmer_id: string;
    from_date: string;
    to_date: string;
    total_amount: number;
    payment_method: string;
}) {
    const { data, error } = await supabase.from("bookings").insert(booking).select().single();
    if (error) throw error;
    return data;
}

export async function updateBookingStatus(id: string, status: "Approved" | "Rejected") {
    const { data, error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ─── LISTINGS ─────────────────────────────────────────────

export async function getAllListings(search = "", location = "") {
    let query = supabase
        .from("listings")
        .select("*, profiles(full_name)")
        .eq("status", "Active")
        .order("created_at", { ascending: false });

    if (search) query = query.ilike("name", `%${search}%`);
    if (location) query = query.ilike("location", `%${location}%`);

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function getFarmerListings(farmerId: string) {
    const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("farmer_id", farmerId)
        .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
}

export async function addListing(listing: {
    farmer_id: string;
    name: string;
    type: string;
    price: string;
    quantity: string;
    location: string;
    description?: string;
}) {
    const { data, error } = await supabase.from("listings").insert(listing).select().single();
    if (error) throw error;
    return data;
}

export async function deleteListing(id: string) {
    const { error } = await supabase.from("listings").update({ status: "Removed" }).eq("id", id);
    if (error) throw error;
}

// ─── ADMIN STATS ──────────────────────────────────────────

export async function getAdminStats() {
    const [machines, bookings, listings] = await Promise.all([
        supabase.from("machines").select("id, status"),
        supabase.from("bookings").select("id, status"),
        supabase.from("listings").select("id").eq("status", "Active"),
    ]);

    const totalMachines = machines.data?.length ?? 0;
    const pending = bookings.data?.filter((b) => b.status === "Pending").length ?? 0;
    const approved = bookings.data?.filter((b) => b.status === "Approved").length ?? 0;
    const active = machines.data?.filter((m) => m.status === "Available").length ?? 0;

    return { totalMachines, pending, approved, active, totalListings: listings.data?.length ?? 0 };
}

// ─── FARMER STATS ─────────────────────────────────────────

export async function getFarmerStats(farmerId: string) {
    const [bookings, listings] = await Promise.all([
        supabase.from("bookings").select("id, status").eq("farmer_id", farmerId),
        supabase.from("listings").select("id").eq("farmer_id", farmerId).eq("status", "Active"),
    ]);

    return {
        activeBookings: bookings.data?.filter((b) => b.status === "Approved").length ?? 0,
        myListings: listings.data?.length ?? 0,
    };
}
