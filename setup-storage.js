const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://deboqhtzjqjeqatchcun.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlYm9xaHR6anFqZXFhdGNoY3VuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjEyOTYxMSwiZXhwIjoyMDg3NzA1NjExfQ.vMGnZiXHKdfay1UHq1N2SP_ObRmCbSTwDqepyG0-LAY";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function init() {
    const bucketName = "machine-images";
    console.log(`Checking bucket: ${bucketName}...`);

    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
        console.error("Error listing buckets:", listError);
        return;
    }

    const exists = buckets.find(b => b.id === bucketName);

    if (!exists) {
        console.log(`Creating public bucket: ${bucketName}...`);
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
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

init();
