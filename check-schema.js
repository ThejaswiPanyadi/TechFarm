const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://deboqhtzjqjeqatchcun.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlYm9xaHR6anFqZXFhdGNoY3VuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjEyOTYxMSwiZXhwIjoyMDg3NzA1NjExfQ.vMGnZiXHKdfay1UHq1N2SP_ObRmCbSTwDqepyG0-LAY";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase.from("machines").select("*").limit(1);
    if (error) {
        console.error("Error introspection:", error.message);
        return;
    }
    if (data.length > 0) {
        console.log("COLUMNS:", Object.keys(data[0]));
    } else {
        console.log("TABLE EMPTY");
    }
}

check();
