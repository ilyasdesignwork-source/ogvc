import AdminEditableText from "@/components/admin-editable-text";
import { isAdminEmail } from "@/lib/admin";
import { getSiteTextMap } from "@/lib/site-texts";
import { createClient } from "@/lib/supabase/server";

export default async function ConstructorStandingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = isAdminEmail(user?.email);
  const textMap = await getSiteTextMap(["constructor_standings.title"]);
  const { data } = await supabase.from("driver_standings").select("team_name, points");
  const teamTotals = new Map<string, number>();
  for (const row of data ?? []) {
    const teamName = row.team_name?.trim();
    if (!teamName) continue;
    teamTotals.set(teamName, (teamTotals.get(teamName) ?? 0) + Number(row.points ?? 0));
  }
  const rows = Array.from(teamTotals.entries())
    .map(([team_name, points]) => ({ team_name, points }))
    .sort((a, b) => b.points - a.points);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <AdminEditableText
        textKey="constructor_standings.title"
        value={textMap["constructor_standings.title"] ?? "Командный зачет"}
        isAdmin={isAdmin}
        className="text-3xl font-bold"
      />
      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-4 py-3">Команда</th>
              <th className="px-4 py-3">Очки</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.team_name} className="border-t border-zinc-800">
                <td className="px-4 py-3">{row.team_name}</td>
                <td className="px-4 py-3">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
