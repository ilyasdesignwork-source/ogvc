"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

function toInt(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key) ?? fallback);
  return Number.isFinite(value) ? value : fallback;
}

async function ensureAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/auth?message=Нет+доступа+к+admin");
  }

  return supabase;
}

function done(message: string) {
  revalidatePath("/");
  revalidatePath("/pilots");
  revalidatePath("/teams");
  revalidatePath("/driver-standings");
  revalidatePath("/constructor-standings");
  revalidatePath("/avatar");
  revalidatePath("/admin");
  redirect(`/admin?message=${encodeURIComponent(message)}`);
}

export async function createNews(formData: FormData) {
  const supabase = await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const { error } = await supabase
    .from("news")
    .insert({ title, summary, content: content || summary });
  if (error) done(error.message);
  done("Новость добавлена");
}

export async function updateNews(formData: FormData) {
  const supabase = await ensureAdmin();
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

export async function deleteNews(formData: FormData) {
  const supabase = await ensureAdmin();
  const id = toInt(formData, "id");
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) done(error.message);
  done("Новость удалена");
}

export async function updateAvatar(formData: FormData) {
  const supabase = await ensureAdmin();
  const userId = String(formData.get("userId") ?? "");
  const payload = {
    display_name: String(formData.get("displayName") ?? "Rookie"),
    name: String(formData.get("displayName") ?? "Rookie"),
    team_name: String(formData.get("teamName") ?? "SCUDERIA FERRARI HP"),
    team: String(formData.get("teamName") ?? "SCUDERIA FERRARI HP"),
    rating: toInt(formData, "rating", 50),
    speed: toInt(formData, "pace", 70),
    awareness: toInt(formData, "awareness", 70),
    racecraft: toInt(formData, "racecraft", 70),
    consistency: toInt(formData, "tyreManagement", 70),
    photo_url: String(formData.get("photoUrl") ?? "").trim() || null,
  };
  const { error } = await supabase.from("avatars").update(payload).eq("user_id", userId);
  if (error) done(error.message);
  done("Профиль пилота обновлен");
}

export async function deleteAvatar(formData: FormData) {
  const supabase = await ensureAdmin();
  const userId = String(formData.get("userId") ?? "");
  const { error } = await supabase.from("avatars").delete().eq("user_id", userId);
  if (error) done(error.message);
  done("Пилот удален");
}

export async function createTeam(formData: FormData) {
  const supabase = await ensureAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const { error } = await supabase.from("teams").insert({ name, country });
  if (error) done(error.message);
  done("Команда добавлена");
}

export async function updateTeam(formData: FormData) {
  const supabase = await ensureAdmin();
  const id = toInt(formData, "id");
  const name = String(formData.get("name") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const { error } = await supabase.from("teams").update({ name, country }).eq("id", id);
  if (error) done(error.message);
  done("Команда обновлена");
}

export async function deleteTeam(formData: FormData) {
  const supabase = await ensureAdmin();
  const id = toInt(formData, "id");
  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) done(error.message);
  done("Команда удалена");
}

export async function createDriverStanding(formData: FormData) {
  const supabase = await ensureAdmin();
  const driver_name = String(formData.get("driverName") ?? "").trim();
  const team_name = String(formData.get("teamName") ?? "").trim();
  const points = toInt(formData, "points");
  const { error } = await supabase
    .from("driver_standings")
    .insert({ driver_name, team_name, points });
  if (error) done(error.message);
  done("Пилот добавлен в личный зачет");
}

export async function updateDriverStanding(formData: FormData) {
  const supabase = await ensureAdmin();
  const id = toInt(formData, "id");
  const driver_name = String(formData.get("driverName") ?? "").trim();
  const team_name = String(formData.get("teamName") ?? "").trim();
  const points = toInt(formData, "points");
  const { error } = await supabase
    .from("driver_standings")
    .update({ driver_name, team_name, points })
    .eq("id", id);
  if (error) done(error.message);
  done("Личный зачет обновлен");
}

export async function deleteDriverStanding(formData: FormData) {
  const supabase = await ensureAdmin();
  const id = toInt(formData, "id");
  const { error } = await supabase.from("driver_standings").delete().eq("id", id);
  if (error) done(error.message);
  done("Запись личного зачета удалена");
}

export async function createConstructorStanding(formData: FormData) {
  const supabase = await ensureAdmin();
  const team_name = String(formData.get("teamName") ?? "").trim();
  const points = toInt(formData, "points");
  const { error } = await supabase
    .from("constructor_standings")
    .insert({ team_name, points });
  if (error) done(error.message);
  done("Команда добавлена в командный зачет");
}

export async function updateConstructorStanding(formData: FormData) {
  const supabase = await ensureAdmin();
  const id = toInt(formData, "id");
  const team_name = String(formData.get("teamName") ?? "").trim();
  const points = toInt(formData, "points");
  const { error } = await supabase
    .from("constructor_standings")
    .update({ team_name, points })
    .eq("id", id);
  if (error) done(error.message);
  done("Командный зачет обновлен");
}

export async function deleteConstructorStanding(formData: FormData) {
  const supabase = await ensureAdmin();
  const id = toInt(formData, "id");
  const { error } = await supabase.from("constructor_standings").delete().eq("id", id);
  if (error) done(error.message);
  done("Запись командного зачета удалена");
}
