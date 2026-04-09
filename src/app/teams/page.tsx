import AdminEditableText from "@/components/admin-editable-text";
import { isAdminEmail } from "@/lib/admin";
import { getSiteTextMap } from "@/lib/site-texts";
import { createClient } from "@/lib/supabase/server";

const TEAM_LORE = [
  ["ANDRETTI CADILLAC", "США", "Cadillac", "#000000", "#A6A6A6"],
  ["ASTON MARTIN ARAMCO", "Великобритания", "Honda", "#006F62", "#B8E600"],
  ["ATLASSIAN WILLIAMS", "Великобритания", "Mercedes", "#041E42", "#00B8D9"],
  ["BMW PETRONAS TEAM", "Германия", "BMW", "#FFFFFF", "#00A19C"],
  ["BWT ALPINE", "Франция", "Renault", "#FD4BC7", "#0050FF"],
  ["MASTERCARD MCLAREN", "Великобритания", "Mercedes", "#FF8000", "#EB001B"],
  ["PORSCHE RED BULL", "Австрия", "Porsche", "#001A30", "#E0E0E0"],
  ["RENAULT MSI", "Франция", "Renault", "#FFF500", "#000000"],
  ["REVOLUT AUDI", "Германия", "Audi", "#000000", "#F50537"],
  ["SCUDERIA FERRARI HP", "Италия", "Ferrari", "#E8002D", "#0096D6"],
  ["TGR HAAS", "США", "Toyota / Ferrari", "#FFFFFF", "#E60000"],
  ["VCA RACING BULLS", "Италия", "RBPT Ford", "#1534CC", "#C0C0C0"],
] as const;

export default async function TeamsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = isAdminEmail(user?.email);
  const textMap = await getSiteTextMap(["teams.title", "teams.subtitle"]);
  const { data: dbTeams } = await supabase.from("teams").select("*");
  const { data: avatars } = await supabase
    .from("avatars")
    .select("display_name,name,team_name,team,rating")
    .order("rating", { ascending: false });

  const teamsByName = new Map((dbTeams ?? []).map((team) => [team.name, team]));
  const pilotsByTeam = new Map<string, string[]>();

  for (const avatar of avatars ?? []) {
    const team = avatar.team_name ?? avatar.team;
    if (!team) continue;
    const driver = avatar.display_name ?? avatar.name;
    if (!driver) continue;
    const current = pilotsByTeam.get(team) ?? [];
    if (current.length < 2) {
      current.push(driver);
      pilotsByTeam.set(team, current);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
      <AdminEditableText
        textKey="teams.title"
        value={textMap["teams.title"] ?? "Команды"}
        isAdmin={isAdmin}
        className="text-3xl font-bold"
      />
      <div className="mt-2">
        <AdminEditableText
          textKey="teams.subtitle"
          value={
            textMap["teams.subtitle"] ??
            "Карточки: название, страна, мотор, 2 пилота и фирменный градиент."
          }
          isAdmin={isAdmin}
          multiline
          className="text-zinc-300"
        />
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {TEAM_LORE.map(([name, fallbackCountry, engine, colorFrom, colorTo]) => {
          const dbTeam = teamsByName.get(name);
          const pilots = pilotsByTeam.get(name) ?? [];
          return (
          <article
            key={name}
            className="overflow-hidden rounded-xl border border-zinc-800"
            style={{
              background: `linear-gradient(135deg, ${colorFrom} 0%, ${colorTo} 100%)`,
            }}
          >
            <div className="bg-black/45 p-5">
              <h2 className="text-xl font-black tracking-wide">{name}</h2>
              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <span className="text-zinc-300">Страна:</span>{" "}
                  {dbTeam?.country ?? fallbackCountry}
                </p>
                <p>
                  <span className="text-zinc-300">Мотор:</span> {engine}
                </p>
                <p>
                  <span className="text-zinc-300">Пилоты:</span> {pilots[0] ?? "TBD"},{" "}
                  {pilots[1] ?? "TBD"}
                </p>
              </div>
            </div>
          </article>
          );
        })}
      </div>
    </main>
  );
}
