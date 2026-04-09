import AdminEditableText from "@/components/admin-editable-text";
import { isAdminEmail } from "@/lib/admin";
import { getSiteTextMap } from "@/lib/site-texts";
import { createClient } from "@/lib/supabase/server";

export default async function PilotsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = isAdminEmail(user?.email);
  const textMap = await getSiteTextMap(["pilots.title"]);
  const { data } = await supabase
    .from("avatars")
    .select("user_id, display_name, name, team_name, team, rating, photo_url")
    .order("rating", { ascending: false })
    .limit(20);

  const pilots = data ?? [];

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <AdminEditableText
        textKey="pilots.title"
        value={textMap["pilots.title"] ?? "Пилоты"}
        isAdmin={isAdmin}
        className="text-3xl font-bold"
      />
      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800">
        <div className="grid gap-4 bg-zinc-950 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {pilots.map((pilot) => {
            const pilotName = pilot.display_name ?? pilot.name ?? "Rookie";
            const pilotTeam = pilot.team_name ?? pilot.team ?? "SCUDERIA FERRARI HP";
            const initials = pilotName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part: string) => part[0]?.toUpperCase() ?? "")
              .join("");

            return (
              <article
                key={pilot.user_id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4"
              >
                <div className="mb-4 flex items-center gap-3">
                  {pilot.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pilot.photo_url}
                      alt={pilotName}
                      className="h-16 w-16 rounded-full border border-zinc-700 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-lg font-bold text-zinc-300">
                      {initials || "R"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-white">{pilotName}</p>
                    <p className="truncate text-sm text-zinc-400">{pilotTeam}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-black/40 p-3 text-center">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">Общий рейтинг</p>
                  <p className="mt-1 text-2xl font-black text-red-500">{pilot.rating}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
