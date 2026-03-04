import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: "No token" });

        // Verify admin role
        const token = authHeader.split(" ")[1];
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) return res.status(401).json({ error: "Unauthorized" });

        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role !== "admin") return res.status(403).json({ error: "Forbidden" });

        const { fileName } = req.body;
        if (!fileName) return res.status(400).json({ error: "fileName is required" });

        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${fileName.replace(/\s+/g, "_")}`;

        const { data, error: storageError } = await supabaseAdmin.storage
            .from("machine-images")
            .createSignedUploadUrl(path);

        if (storageError) throw storageError;

        return res.status(200).json({
            signedUrl: data.signedUrl,
            token: data.token,
            path: path
        });
    } catch (error: any) {
        console.error("get-upload-url error:", error);
        return res.status(500).json({ error: error.message });
    }
}
