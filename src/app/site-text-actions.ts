"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

function done(message: string) {
  revalidatePath("/");
  revalidatePath("/auth");
  revalidatePath("/avatar");
  revalidatePath("/pilots");
  revalidatePath("/teams");
  revalidatePath("/driver-standings");
  revalidatePath("/constructor-standings");
  revalidatePath("/admin");
  redirect(`/?message=${encodeURIComponent(message)}`);
}

export async function updateSiteText(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    done("Нет доступа");
  }

  const key = String(formData.get("key") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();

  if (!key) done("Пустой ключ текста");

  const { error } = await supabase
    .from("site_texts")
    .upsert({ key, value }, { onConflict: "key" });

  if (error) done(error.message);
  done("Текст обновлен");
}
