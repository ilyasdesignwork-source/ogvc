"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

function toInt(formData: FormData, key: string) {
  const value = Number(formData.get(key) ?? 0);
  return Number.isFinite(value) ? value : 0;
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    redirect("/auth?message=Нет+доступа");
  }
  return supabase;
}

function done(message: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  redirect(`/?message=${encodeURIComponent(message)}`);
}

export async function updateNewsInline(formData: FormData) {
  const supabase = await requireAdmin();
  const id = toInt(formData, "id");
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const { error } = await supabase
    .from("news")
    .update({ title, summary, content: content || summary })
    .eq("id", id);
  if (error) done(error.message);
  done("Новость обновлена");
}

export async function uploadNewsImage(formData: FormData) {
  const supabase = await requireAdmin();
  const id = toInt(formData, "id");
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    done("Выберите изображение");
  }
  if (!file.type.startsWith("image/")) {
    done("Нужен файл изображения");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ext.replace(/[^a-z0-9]/g, "") || "jpg";
  const objectPath = `news/${id}.${safeExt}`;

  const { error: uploadError } = await supabase.storage
    .from("news-images")
    .upload(objectPath, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    done(`Ошибка загрузки фото: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from("news-images").getPublicUrl(objectPath);
  const { error: updateError } = await supabase
    .from("news")
    .update({ photo_url: data.publicUrl })
    .eq("id", id);

  if (updateError) done(updateError.message);
  done("Фото новости обновлено");
}
