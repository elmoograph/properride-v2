import { supabase } from "@/src/shared/lib/supabase";

export async function checkSupabaseConnection() {
  const { error } = await supabase.from("profiles").select("id").limit(1);

  if (error) {
    throw error;
  }

  return true;
}
