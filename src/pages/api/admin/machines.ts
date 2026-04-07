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

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '20mb',
        },
    },
};

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
        try {
            const { previewsBase64, ...restBody } = req.body;
            let uploadedUrls: string[] = [];

            // Upload via service role to bypass policies completely
            if (previewsBase64 && Array.isArray(previewsBase64)) {
                for (const file of previewsBase64) {
                    const { fileName, fileData, contentType } = file;
                    if (!fileName || !fileData) continue;

                    const safeName = fileName.replace(/\s+/g, "_");
                    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
                    
                    const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
                    const buffer = Buffer.from(base64Data, 'base64');

                    const { error: storageError } = await supabaseAdmin.storage
                        .from("machine-images")
                        .upload(path, buffer, {
                            contentType: contentType || "image/jpeg",
                            upsert: false
                        });

                    if (storageError) {
                        return res.status(500).json({ error: `Upload failed: ${storageError.message}` });
                    }

                    const { data: pubData } = supabaseAdmin.storage.from("machine-images").getPublicUrl(path);
                    if (pubData?.publicUrl) uploadedUrls.push(pubData.publicUrl);
                }
            }

            // Bind newly generated image URLs into the document body
            const finalDoc = {
                ...restBody,
                image_url: uploadedUrls.length > 0 ? uploadedUrls[0] : "",
                images: uploadedUrls
            };

            const { data, error } = await supabaseAdmin
                .from("machines")
                .insert(finalDoc)
                .select()
                .single();

            if (error) return res.status(500).json({ error: error.message });
            return res.status(201).json(data);
        } catch (e: any) {
            return res.status(500).json({ error: e.message || "Unknown server error" });
        }
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
