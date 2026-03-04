import { supabaseAdmin } from "./src/lib/supabaseAdmin";

async function initBucket() {
    const bucketName = "machine-images";
    console.log(`Checking bucket: ${bucketName}...`);

    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    if (listError) {
        console.error("Error listing buckets:", listError);
        return;
    }

    const exists = buckets.find(b => b.id === bucketName);

    if (!exists) {
        console.log(`Creating public bucket: ${bucketName}...`);
        const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
            public: true,
            allowedMimeTypes: ["image/*"],
            fileSizeLimit: 5242880 // 5MB
        });
        if (createError) {
            console.error("Error creating bucket:", createError);
        } else {
            console.log("Bucket created successfully!");
        }
    } else {
        console.log("Bucket already exists.");
    }
}

initBucket();
