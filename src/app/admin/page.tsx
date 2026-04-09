import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import {
  createConstructorStanding,
  createDriverStanding,
  createNews,
  createTeam,
  deleteConstructorStanding,
  deleteDriverStanding,
  deleteNews,
  deleteTeam,
  deleteAvatar,
  updateAvatar,
  updateConstructorStanding,
  updateDriverStanding,
  updateNews,
  updateTeam,
} from "./actions";

type AdminPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/auth?message=Нет+доступа+к+admin");
  }

  const [{ data: news }, { data: avatars }, { data: teams }, { data: ds }, { data: cs }] =
    await Promise.all([
      supabase.from("news").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("avatars").select("*").order("rating", { ascending: false }).limit(30),
      supabase.from("teams").select("*").order("name", { ascending: true }),
      supabase.from("driver_standings").select("*").order("points", { ascending: false }),
      supabase.from("constructor_standings").select("*").order("points", { ascending: false }),
    ]);

  const params = await searchParams;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      <p className="mt-2 text-zinc-300">
        Редактирование контента сайта: новости, тексты, рейтинги и фото.
      </p>
      {params.message ? (
        <p className="mt-4 rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm">
          {params.message}
        </p>
      ) : null}

      <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
        <h2 className="text-xl font-semibold">Новости</h2>
        <form action={createNews} className="mt-4 grid gap-3 md:grid-cols-[1fr_2fr_auto]">
          <input
            name="title"
            required
            placeholder="Заголовок"
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          />
          <input
            name="summary"
            required
            placeholder="Краткий текст новости"
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          />
          <input
            name="content"
            placeholder="Полный текст новости"
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 md:col-span-2"
          />
          <button className="rounded-md bg-red-600 px-4 py-2 font-medium hover:bg-red-500">
            Добавить
          </button>
        </form>
        <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Существующие новости
        </h3>
        <div className="mt-3 space-y-3">
          {(news ?? []).map((item) => (
            <form
              key={item.id}
              action={updateNews}
              className="grid gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3 md:grid-cols-[70px_1fr_2fr_2fr_auto_auto]"
            >
              <input type="hidden" name="id" value={item.id} />
              <input
                readOnly
                value={item.id}
                className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-2 text-xs text-zinc-400"
              />
              <input
                name="title"
                defaultValue={item.title}
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
              />
              <textarea
                name="summary"
                defaultValue={item.summary}
                rows={2}
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
              />
              <textarea
                name="content"
                defaultValue={item.content ?? item.summary}
                rows={2}
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
              />
              <button className="rounded-md border border-zinc-600 px-3 py-2 hover:bg-zinc-800">
                Сохранить
              </button>
              <button
                formAction={deleteNews}
                className="rounded-md border border-red-900 px-3 py-2 text-red-300 hover:bg-red-950/40"
              >
                Удалить
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
        <h2 className="text-xl font-semibold">Пилоты (тексты, рейтинги, фото)</h2>
        <div className="mt-4 space-y-3">
          {(avatars ?? []).map((avatar) => (
            <form
              key={avatar.user_id}
              action={updateAvatar}
              className="grid gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3 md:grid-cols-6"
            >
              <input type="hidden" name="userId" value={avatar.user_id} />
              <input
                name="displayName"
                defaultValue={avatar.display_name ?? avatar.name}
                placeholder="Имя и фамилия"
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
              />
              <input
                name="teamName"
                defaultValue={avatar.team_name ?? avatar.team}
                placeholder="Команда"
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
              />
              <input
                type="number"
                name="rating"
                defaultValue={avatar.rating}
                placeholder="Overall"
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
              />
              <input
                type="number"
                name="pace"
                defaultValue={avatar.speed}
                placeholder="Pace"
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
              />
              <input
                type="number"
                name="awareness"
                defaultValue={avatar.awareness}
                placeholder="Awareness"
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
              />
              <input
                type="number"
                name="racecraft"
                defaultValue={avatar.racecraft}
                placeholder="Racecraft"
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
              />
              <input
                type="number"
                name="tyreManagement"
                defaultValue={avatar.consistency}
                placeholder="Tyre Management"
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
              />
              <input
                name="photoUrl"
                defaultValue={avatar.photo_url ?? ""}
                placeholder="URL фото"
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 md:col-span-2"
              />
              <button className="rounded-md border border-zinc-600 px-3 py-2 hover:bg-zinc-800 md:col-span-1">
                Сохранить пилота
              </button>
              <button
                formAction={deleteAvatar}
                className="rounded-md border border-red-900 px-3 py-2 text-red-300 hover:bg-red-950/40 md:col-span-1"
              >
                Удалить пилота
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
        <h2 className="text-xl font-semibold">Команды</h2>
        <form action={createTeam} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input name="name" required placeholder="Название" className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" />
          <input name="country" required placeholder="Страна" className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" />
          <button className="rounded-md bg-red-600 px-4 py-2 font-medium hover:bg-red-500">Добавить</button>
        </form>
        <div className="mt-4 space-y-3">
          {(teams ?? []).map((team) => (
            <form key={team.id} action={updateTeam} className="grid gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3 md:grid-cols-[70px_1fr_1fr_auto_auto]">
              <input type="hidden" name="id" value={team.id} />
              <input readOnly value={team.id} className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-2 text-xs text-zinc-400" />
              <input name="name" defaultValue={team.name} className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2" />
              <input name="country" defaultValue={team.country} className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2" />
              <button className="rounded-md border border-zinc-600 px-3 py-2 hover:bg-zinc-800">Сохранить</button>
              <button formAction={deleteTeam} className="rounded-md border border-red-900 px-3 py-2 text-red-300 hover:bg-red-950/40">Удалить</button>
            </form>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
        <h2 className="text-xl font-semibold">Личный зачет</h2>
        <form action={createDriverStanding} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_120px_auto]">
          <input name="driverName" required placeholder="Пилот" className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" />
          <input name="teamName" required placeholder="Команда" className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" />
          <input type="number" name="points" required placeholder="Очки" className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" />
          <button className="rounded-md bg-red-600 px-4 py-2 font-medium hover:bg-red-500">Добавить</button>
        </form>
        <div className="mt-4 space-y-3">
          {(ds ?? []).map((row) => (
            <form key={row.id} action={updateDriverStanding} className="grid gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3 md:grid-cols-[70px_1fr_1fr_120px_auto_auto]">
              <input type="hidden" name="id" value={row.id} />
              <input readOnly value={row.id} className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-2 text-xs text-zinc-400" />
              <input name="driverName" defaultValue={row.driver_name} className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2" />
              <input name="teamName" defaultValue={row.team_name} className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2" />
              <input type="number" name="points" defaultValue={row.points} className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2" />
              <button className="rounded-md border border-zinc-600 px-3 py-2 hover:bg-zinc-800">Сохранить</button>
              <button formAction={deleteDriverStanding} className="rounded-md border border-red-900 px-3 py-2 text-red-300 hover:bg-red-950/40">Удалить</button>
            </form>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
        <h2 className="text-xl font-semibold">Командный зачет</h2>
        <form action={createConstructorStanding} className="mt-4 grid gap-3 md:grid-cols-[1fr_120px_auto]">
          <input name="teamName" required placeholder="Команда" className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" />
          <input type="number" name="points" required placeholder="Очки" className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" />
          <button className="rounded-md bg-red-600 px-4 py-2 font-medium hover:bg-red-500">Добавить</button>
        </form>
        <div className="mt-4 space-y-3">
          {(cs ?? []).map((row) => (
            <form key={row.id} action={updateConstructorStanding} className="grid gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3 md:grid-cols-[70px_1fr_120px_auto_auto]">
              <input type="hidden" name="id" value={row.id} />
              <input readOnly value={row.id} className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-2 text-xs text-zinc-400" />
              <input name="teamName" defaultValue={row.team_name} className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2" />
              <input type="number" name="points" defaultValue={row.points} className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2" />
              <button className="rounded-md border border-zinc-600 px-3 py-2 hover:bg-zinc-800">Сохранить</button>
              <button formAction={deleteConstructorStanding} className="rounded-md border border-red-900 px-3 py-2 text-red-300 hover:bg-red-950/40">Удалить</button>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
