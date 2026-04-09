import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE_BYTES = 1024 * 1024;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("photo");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Выберите файл" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Нужен файл изображения" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Файл больше 1MB после обработки" },
      { status: 400 },
    );
  }

  const objectPath = `${user.id}/avatar.webp`;

  const { error: uploadError } = await supabase.storage
    .from("avatar-photos")
    .upload(objectPath, file, {
      upsert: true,
      contentType: "image/webp",
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Не удалось загрузить фото. Проверь bucket avatar-photos" },
      { status: 400 },
    );
  }

  const { data: publicData } = supabase.storage
    .from("avatar-photos")
    .getPublicUrl(objectPath);

  const { error: updateError } = await supabase
    .from("avatars")
    .update({ photo_url: publicData.publicUrl })
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Фото обновлено" });
}
