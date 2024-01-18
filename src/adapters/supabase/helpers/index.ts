export * from "./client";
import { supabase } from "./client";
import { config } from "dotenv";
config();

export const getAdapters = () => {
  return {
    supabase: supabase(process.env.SUPABASE_URL ?? "", process.env.SUPABASE_KEY ?? ""),
  };
};
