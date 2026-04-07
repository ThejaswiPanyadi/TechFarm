import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

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

        const { fileName, fileData, contentType } = req.body;
        if (!fileName || !fileData) return res.status(400).json({ error: "fileName and fileData are required" });

        // Parse base64
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${fileName.replace(/\\s+/g, "_")}`;
        const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
        const buffer = Buffer.from(base64Data, 'base64');

        const { error: storageError } = await supabaseAdmin.storage
            .from("machine-images")
            .upload(path, buffer, {
                contentType: contentType || "image/jpeg",
                upsert: false
            });

        if (storageError) throw storageError;

        const { data } = supabaseAdmin.storage.from("machine-images").getPublicUrl(path);

        return res.status(200).json({ url: data.publicUrl });
    } catch (error: any) {
        console.error("Upload error:", error);
        return res.status(500).json({ error: error.message });
    }
}
