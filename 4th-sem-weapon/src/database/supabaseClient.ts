import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Pulling from the secure .env vault
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

let cachedClient: SupabaseClient | null = null;
let cachedToken: string | null = null;

export const createClerkSupabaseClient = (clerkToken: string) => {
    // Return cached client if the token hasn't changed
    if (cachedClient && cachedToken === clerkToken) {
        return cachedClient;
    }

    cachedToken = clerkToken;
    cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${clerkToken}`,
            },
        },
    });

    return cachedClient;
};