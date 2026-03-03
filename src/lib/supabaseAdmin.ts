import { createClient } from "@supabase/supabase-js";

/**
 * Server-side only Supabase client using the service role key.
 * This bypasses RLS completely — NEVER import this in client-side code.
 * Only use in /pages/api/* routes.
 */
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
