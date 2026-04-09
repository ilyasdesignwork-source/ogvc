import { createClient } from "@/lib/supabase/server";

export async function getSiteTextMap(keys: string[]) {
  if (keys.length === 0) return {} as Record<string, string>;

  const supabase = await createClient();
  const { data } = await supabase.from("site_texts").select("key,value").in("key", keys);

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    map[row.key] = row.value;
  }
  return map;
}
