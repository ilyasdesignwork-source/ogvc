"use server";

import { redirect } from "next/navigation";
import {
  calculateRating,
  buildFullStatsFromCore,
  enforceStatsBudget,
  type AvatarStats,
  avatarRules,
} from "@/lib/avatar-rating";
import { createClient } from "@/lib/supabase/server";

function parseStat(formData: FormData, name: string) {
  const raw = Number(formData.get(name) ?? 0);
  return Number.isFinite(raw) ? raw : 0;
}

function reduceStats(stats: AvatarStats): AvatarStats {
  const entries = [
    ["speed", stats.speed],
    ["awareness", stats.awareness],
    ["consistency", stats.consistency],
    ["racecraft", stats.racecraft],
    ["overtaking", stats.overtaking],
  ] as const;

  const reducible = entries
    .filter(([, value]) => value > avatarRules.min)
    .sort((a, b) => b[1] - a[1]);

  if (reducible.length === 0) return stats;

  const [key] = reducible[0];
  return {
    ...stats,
    [key]: stats[key] - 1,
  };
}

function isStatsConstraintError(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const message = String(error.message ?? "").toLowerCase();
  return (
    error.code === "23514" &&
    (message.includes("check_stats_sum") || message.includes("check constraint"))
  );
}

function isUpstream502Error(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const message = String(error.message ?? "").toLowerCase();
  return (
    message.includes("502 bad gateway") ||
    message.includes("<center>cloudflare</center>") ||
    message.includes("bad gateway")
  );
}

function mapAvatarSaveError(error: { message?: string; code?: string } | null) {
  if (!error) return "Не удалось сохранить аватар";

  if (isUpstream502Error(error)) {
    return "Сервис базы временно недоступен (502). Попробуйте снова через 10-30 секунд.";
  }

  if (isStatsConstraintError(error)) {
    return "Не удалось сохранить: ограничение на сумму характеристик. Уменьшите статы.";
  }

  if (error.code === "23502") {
    return "Не удалось сохранить: не заполнено обязательное поле профиля.";
  }

  if (error.code === "42501") {
    return "Нет прав на сохранение аватара. Перелогиньтесь и попробуйте снова.";
  }

  return String(error.message ?? "Не удалось сохранить аватар");
}

function buildAvatarErrorRedirect(error: { message?: string; code?: string } | null) {
  const message = mapAvatarSaveError(error);
  const code = String(error?.code ?? "UNKNOWN");
  const detail = String(error?.message ?? "No details").slice(0, 300);
  return `/avatar/create?message=${encodeURIComponent(message)}&errorCode=${encodeURIComponent(
    code,
  )}&errorDetail=${encodeURIComponent(detail)}`;
}

async function upsertAvatarWithTimeout(
  supabase: Awaited<ReturnType<typeof createClient>>,
  payload: {
    user_id: string;
    display_name: string;
    name: string;
    team_name: string;
    team: string;
    speed: number;
    awareness: number;
    consistency: number;
    overtaking: number;
    racecraft: number;
    rating: number;
  },
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    const result = await supabase
      .from("avatars")
      .upsert(payload, { onConflict: "user_id" })
      .abortSignal(controller.signal);
    return result.error as { message?: string; code?: string } | null;
  } catch {
    return { message: "Таймаут запроса к базе. Попробуйте еще раз.", code: "TIMEOUT" };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function saveAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth?message=${encodeURIComponent("Сначала войдите в аккаунт")}`);
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  const teamName = String(formData.get("teamName") ?? "").trim();
  const coreStats = {
    pace: parseStat(formData, "pace"),
    awareness: parseStat(formData, "awareness"),
    racecraft: parseStat(formData, "racecraft"),
    tyreManagement: parseStat(formData, "tyreManagement"),
  };

  if (!teamName) {
    redirect(`/avatar/create?message=${encodeURIComponent("Выберите команду")}`);
  }

  const baseName = displayName || "Rookie";
  const safeTeamName = teamName || "SCUDERIA FERRARI HP";
  const initialStats = enforceStatsBudget(buildFullStatsFromCore(coreStats));
  const initialRating = calculateRating(initialStats).rating;

  let error = await upsertAvatarWithTimeout(supabase, {
    user_id: user.id,
    display_name: baseName,
    name: baseName,
    team_name: safeTeamName,
    team: safeTeamName,
    speed: initialStats.speed,
    awareness: initialStats.awareness,
    consistency: initialStats.consistency,
    overtaking: initialStats.overtaking,
    racecraft: initialStats.racecraft,
    rating: initialRating,
  });

  // Single correction retry for DB stat constraint.
  if (isStatsConstraintError(error)) {
    const correctedStats = reduceStats(initialStats);
    const correctedRating = calculateRating(correctedStats).rating;
    error = await upsertAvatarWithTimeout(supabase, {
      user_id: user.id,
      display_name: baseName,
      name: baseName,
      team_name: safeTeamName,
      team: safeTeamName,
      speed: correctedStats.speed,
      awareness: correctedStats.awareness,
      consistency: correctedStats.consistency,
      overtaking: correctedStats.overtaking,
      racecraft: correctedStats.racecraft,
      rating: correctedRating,
    });
  }

  // One additional retry for transient upstream 502.
  if (isUpstream502Error(error)) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    error = await upsertAvatarWithTimeout(supabase, {
      user_id: user.id,
      display_name: baseName,
      name: baseName,
      team_name: safeTeamName,
      team: safeTeamName,
      speed: initialStats.speed,
      awareness: initialStats.awareness,
      consistency: initialStats.consistency,
      overtaking: initialStats.overtaking,
      racecraft: initialStats.racecraft,
      rating: initialRating,
    });
  }

  if (!error) {
    redirect(`/avatar?message=${encodeURIComponent("Аватар сохранен")}`);
  }

  redirect(buildAvatarErrorRedirect(error));
}

export async function uploadAvatarPhoto(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth?message=${encodeURIComponent("Сначала войдите в аккаунт")}`);
  }

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`/avatar?tab=photo&message=${encodeURIComponent("Выберите файл")}`);
  }
  const imageFile = file as File;

  if (!imageFile.type.startsWith("image/")) {
    redirect(
      `/avatar?tab=photo&message=${encodeURIComponent("Нужен файл изображения")}`,
    );
  }

  const extension = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "jpg";
  const objectPath = `${user.id}/avatar.${safeExtension}`;

  const { error: uploadError } = await supabase.storage
    .from("avatar-photos")
    .upload(objectPath, imageFile, {
      upsert: true,
      contentType: imageFile.type,
    });

  if (uploadError) {
    redirect(
      `/avatar?tab=photo&message=${encodeURIComponent(
        "Не удалось загрузить фото. Проверь bucket avatar-photos",
      )}`,
    );
  }

  const { data: publicData } = supabase.storage
    .from("avatar-photos")
    .getPublicUrl(objectPath);

  const { error: updateError } = await supabase
    .from("avatars")
    .update({
      photo_url: publicData.publicUrl,
    })
    .eq("user_id", user.id);

  if (updateError) {
    redirect(`/avatar?tab=photo&message=${encodeURIComponent(updateError.message)}`);
  }

  redirect(`/avatar?tab=photo&message=${encodeURIComponent("Фото обновлено")}`);
}
