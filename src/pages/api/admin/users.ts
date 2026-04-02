import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

async function verifyAdmin(req: NextApiRequest) {
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

    if (!profile || profile.role !== "admin") return null;
    return { id: user.id, role: profile.role };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const admin = await verifyAdmin(req);
    if (!admin) return res.status(403).json({ error: "Forbidden" });

    // ── GET: list all users with email from auth.users ──────────────────
    if (req.method === "GET") {
        // Fetch all profiles
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from("profiles")
            .select("id, full_name, phone, location, role, status, created_at")
            .order("created_at", { ascending: false });

        if (profilesError) return res.status(500).json({ error: profilesError.message });

        // Fetch auth users to get email + last_sign_in_at
        const { data: { users: authUsers }, error: authError } =
            await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

        if (authError) return res.status(500).json({ error: authError.message });

        const authMap = new Map(authUsers.map((u) => [u.id, u]));

        const merged = (profiles ?? []).map((p) => {
            const authUser = authMap.get(p.id);
            return {
                ...p,
                email: authUser?.email ?? null,
                last_sign_in_at: authUser?.last_sign_in_at ?? null,
            };
        });

        return res.status(200).json(merged);
    }

    // ── PATCH: block / unblock ────────────────────────────────────────────
    if (req.method === "PATCH") {
        const { id, status } = req.body;
        if (!id || !["active", "blocked"].includes(status)) {
            return res.status(400).json({ error: "Invalid request" });
        }

        // Prevent admin from blocking themselves
        if (id === admin.id) {
            return res.status(400).json({ error: "Cannot change your own account status" });
        }

        const { data, error } = await supabaseAdmin
            .from("profiles")
            .update({ status })
            .eq("id", id)
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    // ── DELETE: remove user ───────────────────────────────────────────────
    if (req.method === "DELETE") {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: "Missing user id" });

        // Prevent admin from deleting themselves
        if (id === admin.id) {
            return res.status(400).json({ error: "Cannot delete your own account" });
        }

        // Soft-delete bookings and listings (mark as Cancelled / Removed)
        await supabaseAdmin
            .from("bookings")
            .update({ status: "Cancelled" })
            .eq("farmer_id", id)
            .in("status", ["Confirmed", "Pending Payment", "Waiting Admin Approval", "Pending", "Approved"]);

        await supabaseAdmin
            .from("listings")
            .update({ status: "Removed" })
            .eq("farmer_id", id);

        // Delete from profiles (FK should cascade or we do it manually first)
        await supabaseAdmin.from("profiles").delete().eq("id", id);

        // Delete from Supabase auth
        const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (authDeleteError) return res.status(500).json({ error: authDeleteError.message });

        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
}
