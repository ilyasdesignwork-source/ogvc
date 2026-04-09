import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AvatarBuilderForm from "../avatar-builder-form";

type CreateAvatarPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function CreateAvatarPage({
  searchParams,
}: CreateAvatarPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth?message=${encodeURIComponent("Сначала войдите в аккаунт")}`);
  }

  const { data: avatar } = await supabase
    .from("avatars")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const params = await searchParams;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <h1 className="text-3xl font-bold">Создание аватара</h1>
      <p className="mt-3 text-zinc-300">
        Настройка аватара через связанные ползунки с trade-off логикой.
      </p>

      {params.message ? (
        <p className="mt-4 rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm">
          {params.message}
        </p>
      ) : null}

      <AvatarBuilderForm
        defaultDisplayName={avatar?.display_name ?? ""}
        defaultTeamName={avatar?.team_name ?? avatar?.team ?? "SCUDERIA FERRARI HP"}
        defaultPace={avatar?.speed ?? 70}
        defaultAwareness={avatar?.awareness ?? 70}
        defaultRacecraft={avatar?.racecraft ?? 70}
        defaultTyreManagement={avatar?.consistency ?? 70}
      />
    </main>
  );
}
