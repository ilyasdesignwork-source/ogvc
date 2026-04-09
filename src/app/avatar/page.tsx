import AdminEditableText from "@/components/admin-editable-text";
import { isAdminEmail } from "@/lib/admin";
import { getSiteTextMap } from "@/lib/site-texts";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AvatarPhotoUploader from "./avatar-photo-uploader";

type AvatarPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function AvatarPage({ searchParams }: AvatarPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = isAdminEmail(user?.email);
  const textMap = await getSiteTextMap(["avatar.title", "avatar.subtitle"]);

  if (!user) {
    redirect(`/auth?message=${encodeURIComponent("Сначала войдите в аккаунт")}`);
  }

  const { data: avatar } = await supabase
    .from("avatars")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const params = await searchParams;

  if (!avatar) {
    const createMessage = encodeURIComponent("Сначала создайте аватар");
    redirect(`/avatar/create?message=${createMessage}`);
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <AdminEditableText
        textKey="avatar.title"
        value={textMap["avatar.title"] ?? "Профиль пилота"}
        isAdmin={isAdmin}
        className="text-3xl font-bold"
      />
      <div className="mt-3">
        <AdminEditableText
          textKey="avatar.subtitle"
          value={
            textMap["avatar.subtitle"] ??
            "Как на сайте F1: профиль с командой, рейтингом и неизменяемыми характеристиками."
          }
          isAdmin={isAdmin}
          multiline
          className="text-zinc-300"
        />
      </div>

      {params.message ? (
        <p className="mt-4 rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm">
          {params.message}
        </p>
      ) : null}

      <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/70 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-red-500">Driver</p>
            <h2 className="mt-1 text-2xl font-bold">
              {avatar.display_name ?? avatar.name}
            </h2>
            <p className="mt-2 text-zinc-300">
              {avatar.team_name ?? avatar.team ?? "SCUDERIA FERRARI HP"}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-black px-5 py-3 text-center">
            <p className="text-xs uppercase tracking-widest text-zinc-500">Rating</p>
            <p className="text-3xl font-black text-red-500">{avatar.rating}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            ["Overall Rating", avatar.rating],
            ["Pace", avatar.speed],
            ["Awareness", avatar.awareness],
            ["Racecraft", avatar.racecraft],
            ["Tyre Management", avatar.consistency],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
            >
              <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <AvatarPhotoUploader currentPhotoUrl={avatar.photo_url ?? null} />
    </main>
  );
}
