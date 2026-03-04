import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

// Helper: Verify user and return their profile/role
async function verifyUser(req: NextApiRequest) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return null;

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return null;

    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .single();

    return profile ? { id: user.id, role: profile.role } : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await verifyUser(req);
    if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method === "GET") {
        let query = supabaseAdmin
            .from("bookings")
            .select("*, machines(name, location, price_per_day), profiles(full_name)");

        // If not admin, restrict to user's own bookings
        if (user.role !== "admin") {
            query = query.eq("farmer_id", user.id);
        }

        const { data, error } = await query.order("created_at", { ascending: true });
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    if (req.method === "POST") {
        // Ensure farmer_id matches the authenticated user if they aren't admin
        const bookingData = { ...req.body };
        if (user.role !== "admin") {
            bookingData.farmer_id = user.id;
        }

        const { data, error } = await supabaseAdmin
            .from("bookings")
            .insert(bookingData)
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
    }

    if (req.method === "PATCH") {
        const { id, ...updates } = req.body;

        // Check ownership if not admin
        if (user.role !== "admin") {
            const { data: existing } = await supabaseAdmin
                .from("bookings")
                .select("farmer_id")
                .eq("id", id)
                .single();

            if (!existing || existing.farmer_id !== user.id) {
                return res.status(403).json({ error: "Forbidden" });
            }
            // Farmers can only cancel their own bookings (if applicable)
            // For now, we'll allow status updates but admin usually does approval
        }

        const { data: updatedBooking, error } = await supabaseAdmin
            .from("bookings")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });

        // AUTOMATION: Update machine availability based on booking status
        if (updatedBooking.status === "Confirmed" || updatedBooking.status === "Approved") {
            await supabaseAdmin
                .from("machines")
                .update({ status: "Unavailable" })
                .eq("id", updatedBooking.machine_id);
        } else if (updatedBooking.status === "Cancelled") {
            await supabaseAdmin
                .from("machines")
                .update({ status: "Available" })
                .eq("id", updatedBooking.machine_id);
        }

        return res.status(200).json(updatedBooking);
    }

    return res.status(405).json({ error: "Method not allowed" });
}
