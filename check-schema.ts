import { supabaseAdmin } from "./src/lib/supabaseAdmin";

async function checkSchema() {
    console.log("Checking columns for 'machines' table...");
    // We can't easily list columns via the JS client without a custom RPC.
    // But we can try to fetch one row and see the keys.
    const { data, error } = await supabaseAdmin.from("machines").select("*").limit(1);
    if (error) {
        console.error("Error fetching machines:", error);
        return;
    }
    if (data && data.length > 0) {
        console.log("Columns found:", Object.keys(data[0]));
    } else {
        console.log("No rows found to introspect. Attempting to insert a dummy row (will fail if images is missing).");
        const { error: insertError } = await supabaseAdmin.from("machines").insert([{
            name: "Test",
            images: ["test.jpg"],
            price_per_day: 0,
            location: "Test"
        }]);
        if (insertError) {
            console.error("Insert failed as expected if column is missing:", insertError.message);
        }
    }
}

checkSchema();
