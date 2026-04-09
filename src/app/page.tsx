import { isAdminEmail } from "@/lib/admin";
import AdminEditableText from "@/components/admin-editable-text";
import NewsReadModal from "@/components/news-read-modal";
import { getSiteTextMap } from "@/lib/site-texts";
import { createClient } from "@/lib/supabase/server";
import { updateNewsInline, uploadNewsImage } from "./news-actions";

type HomeProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = isAdminEmail(user?.email);
  const textMap = await getSiteTextMap(["home.title", "home.subtitle"]);

  const { data: news } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  const newsCards =
    news && news.length > 0
      ? news
      : [
          {
            id: "1",
            title: "OGVC GP стартует в эти выходные",
            summary: "Превью гонки, состояние трассы и ожидания команд.",
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            title: "Технический регламент обновлен",
            summary: "Команды адаптируют настройки под новые ограничения.",
            created_at: new Date().toISOString(),
          },
        ];
  const params = await searchParams;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
      <AdminEditableText
        textKey="home.title"
        value={textMap["home.title"] ?? "OGVC News"}
        isAdmin={isAdmin}
        className="text-4xl font-black uppercase tracking-wide text-red-500"
      />
      <div className="mt-3 max-w-2xl">
        <AdminEditableText
          textKey="home.subtitle"
          value={
            textMap["home.subtitle"] ??
            "Stage 3: главная страница в F1-стиле. Здесь выводятся новости из Supabase таблицы `news`."
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

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {newsCards.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5"
          >
            {item.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.photo_url}
                alt={item.title}
                className="mb-4 h-44 w-full rounded-lg object-cover"
              />
            ) : null}
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              {new Date(item.created_at).toLocaleDateString("ru-RU")}
            </p>
            <h2 className="mt-2 text-xl font-bold">{item.title}</h2>
            <p className="mt-3 text-zinc-300">{item.summary}</p>
            <NewsReadModal
              title={item.title}
              content={item.content ?? item.summary}
              createdAt={item.created_at}
              photoUrl={item.photo_url}
            />
            {isAdmin && typeof item.id === "number" ? (
              <details className="mt-4 rounded-lg border border-zinc-700 bg-black/40 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-red-400">
                  Редактировать новость
                </summary>
                <form action={updateNewsInline} className="mt-3 space-y-2">
                  <input type="hidden" name="id" value={item.id} />
                  <input
                    name="title"
                    defaultValue={item.title}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  />
                  <textarea
                    name="summary"
                    rows={3}
                    defaultValue={item.summary}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  />
                  <textarea
                    name="content"
                    rows={5}
                    defaultValue={item.content ?? item.summary}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  />
                  <button className="rounded-md border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800">
                    Сохранить текст
                  </button>
                </form>
                <form action={uploadNewsImage} className="mt-3 space-y-2">
                  <input type="hidden" name="id" value={item.id} />
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    required
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  />
                  <button className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium hover:bg-red-500">
                    Загрузить фото
                  </button>
                </form>
              </details>
            ) : null}
          </article>
        ))}
      </section>
    </main>
  );
}
