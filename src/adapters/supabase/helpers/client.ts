import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getAdapters } from ".";
import { Database } from "../types";

/**
 * @dev Creates a typescript client which will be used to interact with supabase platform
 *
 * @param url - The supabase project url
 * @param key - The supabase project key
 * @returns - The supabase client
 */
export const supabase = (url: string, key: string): SupabaseClient => {
  return createClient<Database>(url, key, { auth: { persistSession: false } });
};

export const getUserFromWalletAddr = async (wallet: string): Promise<string | undefined> => {
  const { supabase } = getAdapters();
  const { data } = await supabase.from("wallets").select("user_name").ilike("wallet_address", wallet);
  return data?.[0]?.user_name;
};
