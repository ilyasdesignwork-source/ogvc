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
    .select("user_id, display_name, name, team_name, team, rating")
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
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-4 py-3">Имя и фамилия</th>
              <th className="px-4 py-3">Команда</th>
              <th className="px-4 py-3">Общий рейтинг</th>
            </tr>
          </thead>
          <tbody>
            {pilots.map((pilot) => (
              <tr key={pilot.user_id} className="border-t border-zinc-800">
                <td className="px-4 py-3">{pilot.display_name ?? pilot.name}</td>
                <td className="px-4 py-3">{pilot.team_name ?? pilot.team}</td>
                <td className="px-4 py-3">{pilot.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
