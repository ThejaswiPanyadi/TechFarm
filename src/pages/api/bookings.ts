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

        const { data: rawData, error } = await query.order("created_at", { ascending: true });
        if (error) return res.status(500).json({ error: error.message });

        // --- AUTOMATED OVERDUE DETECTION & NOTIFICATION TRIGGER ---
        const now = new Date();
        const data = await Promise.all((rawData || []).map(async (booking) => {
            const isTracking = booking.status === "Confirmed" || booking.status === "Approved";
            const toDate = new Date(booking.to_date);
            // Consider overdue after midnight of toDate
            toDate.setHours(23, 59, 59, 999);

            if (isTracking && now > toDate) {
                const updates: any = { status: "Overdue" };
                
                // Triggers "notification" flag once
                if (!booking.notification_status) {
                    updates.notification_status = true;
                    // In real production, send SMS/Email here
                }

                const { data: updated } = await supabaseAdmin
                    .from("bookings")
                    .update(updates)
                    .eq("id", booking.id)
                    .select("*, machines(name, location, price_per_day), profiles(full_name)")
                    .single();
                
                return updated || booking;
            }
            return booking;
        }));

        return res.status(200).json(data);
    }

    if (req.method === "POST") {
        // --- RESTRICTION CHECK ---
        // Farmers can only have one active booking.
        // Block if they have any booking that is NOT Completed or Cancelled.
        const { data: existingBookings, error: checkError } = await supabaseAdmin
            .from("bookings")
            .select("status")
            .eq("farmer_id", user.id)
            .in("status", [
                "Pending Payment",
                "Waiting Admin Approval",
                "Approved",
                "Confirmed",
                "Overdue",
                "Late",
                "Pending",
                "Active"
            ]);

        if (checkError) return res.status(500).json({ error: checkError.message });

        if (existingBookings && existingBookings.length > 0) {
            const hasOverdue = existingBookings.some(b => 
                b.status === "Overdue" || b.status === "Late"
            );

            if (hasOverdue) {
                return res.status(403).json({ 
                    error: "You have not returned your previous machine. Please return it to continue booking." 
                });
            }

            return res.status(403).json({ 
                error: "You already have an active booking. Please complete or return the current machine before booking another." 
            });
        }
        // --- END RESTRICTION CHECK ---

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
        const { id, action, ...updates } = req.body;

        // Only admins can perform return/status actions
        if (action === "returnMachine") {
            if (user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden" });
            }

            // Fetch the booking with machine price
            const { data: booking, error: fetchError } = await supabaseAdmin
                .from("bookings")
                .select("*, machines(price_per_day)")
                .eq("id", id)
                .single();

            if (fetchError || !booking) {
                return res.status(404).json({ error: "Booking not found" });
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const actualReturnDate = today.toISOString().split("T")[0];

            const toDate = new Date(booking.to_date);
            toDate.setHours(0, 0, 0, 0);

            const msPerDay = 1000 * 60 * 60 * 24;
            const lateDays = Math.max(0, Math.round((today.getTime() - toDate.getTime()) / msPerDay));
            const pricePerDay: number = booking.machines?.price_per_day ?? 0;
            const lateFee = lateDays > 0 ? lateDays * pricePerDay : 0;
            const newStatus = "Returned";

            const { data: updatedBooking, error: updateError } = await supabaseAdmin
                .from("bookings")
                .update({
                    status: newStatus,
                    actual_return_date: actualReturnDate,
                    late_fee: lateFee,
                })
                .eq("id", id)
                .select()
                .single();

            if (updateError) return res.status(500).json({ error: updateError.message });

            // Machine is returned — mark it available again
            await supabaseAdmin
                .from("machines")
                .update({ status: "Available" })
                .eq("id", booking.machine_id);

            return res.status(200).json(updatedBooking);
        }

        // ── Standard status update ──────────────────────────────────────
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
