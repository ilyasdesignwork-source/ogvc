"use server";

import { redirect } from "next/navigation";
import {
  buildFullStatsFromCore,
  calculateRatingFromCore,
  enforceStatsBudget,
} from "@/lib/avatar-rating";
import { createClient } from "@/lib/supabase/server";

function parseStat(formData: FormData, name: string) {
  const raw = Number(formData.get(name) ?? 0);
  return Number.isFinite(raw) ? raw : 0;
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
  const stats = enforceStatsBudget(buildFullStatsFromCore(coreStats));
  const { rating } = calculateRatingFromCore(coreStats);

  const { error } = await supabase.from("avatars").upsert(
    {
      user_id: user.id,
      display_name: displayName || "Rookie",
      name: displayName || "Rookie",
      team_name: teamName,
      team: teamName,
      speed: stats.speed,
      awareness: stats.awareness,
      consistency: stats.consistency,
      overtaking: stats.overtaking,
      racecraft: stats.racecraft,
      rating,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    redirect(`/avatar/create?message=${encodeURIComponent(error.message)}`);
  }

  redirect(`/avatar?message=${encodeURIComponent("Аватар сохранен")}`);
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
