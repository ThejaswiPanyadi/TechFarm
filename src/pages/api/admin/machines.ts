import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

// Verify the requesting user is an admin via their session token
async function verifyAdmin(req: NextApiRequest): Promise<boolean> {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return false;

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return false;

    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    return profile?.role === "admin";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
        return res.status(403).json({ error: "Forbidden: admin only" });
    }

    if (req.method === "GET") {
        const { data, error } = await supabaseAdmin
            .from("machines")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    if (req.method === "POST") {
        const { data, error } = await supabaseAdmin
            .from("machines")
            .insert(req.body)
            .select()
            .single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
    }

    if (req.method === "PATCH") {
        const { id, ...updates } = req.body;
        const { data, error } = await supabaseAdmin
            .from("machines")
            .update(updates)
            .eq("id", id)
            .select()
            .single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    if (req.method === "DELETE") {
        const { id } = req.body;
        const { error } = await supabaseAdmin.from("machines").delete().eq("id", id);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
}
