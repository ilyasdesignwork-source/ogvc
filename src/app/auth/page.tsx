import AdminEditableText from "@/components/admin-editable-text";
import { isAdminEmail } from "@/lib/admin";
import { getSiteTextMap } from "@/lib/site-texts";
import { createClient } from "@/lib/supabase/server";
import { signIn, signUp } from "./actions";

type AuthPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = isAdminEmail(user?.email);
  const textMap = await getSiteTextMap(["auth.title", "auth.subtitle"]);
  const params = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16">
      <section className="grid gap-8 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-8 md:grid-cols-2">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-red-500">
            Stage 1
          </p>
          <div className="mt-2">
            <AdminEditableText
              textKey="auth.title"
              value={textMap["auth.title"] ?? "Авторизация в стиле F1"}
              isAdmin={isAdmin}
              className="text-3xl font-bold"
            />
          </div>
          <div className="mt-4">
            <AdminEditableText
              textKey="auth.subtitle"
              value={
                textMap["auth.subtitle"] ??
                "После входа сессия хранится в cookie Supabase. Пользователь не логинится повторно, пока не выйдет сам или не очистит данные браузера."
              }
              isAdmin={isAdmin}
              multiline
              className="text-zinc-300"
            />
          </div>
          {params.message ? (
            <p className="mt-6 rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-200">
              {params.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-6">
          <form action={signIn} className="space-y-3 rounded-xl bg-zinc-900 p-4">
            <h2 className="text-lg font-semibold">Вход</h2>
            <input
              required
              type="email"
              name="email"
              placeholder="Email"
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
            />
            <input
              required
              type="password"
              name="password"
              placeholder="Пароль"
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
            />
            <button className="w-full rounded-md bg-red-600 px-3 py-2 font-medium hover:bg-red-500">
              Войти
            </button>
          </form>

          <form action={signUp} className="space-y-3 rounded-xl bg-zinc-900 p-4">
            <h2 className="text-lg font-semibold">Регистрация</h2>
            <input
              required
              type="email"
              name="email"
              placeholder="Email"
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
            />
            <input
              required
              type="password"
              name="password"
              minLength={6}
              placeholder="Пароль (от 6 символов)"
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
            />
            <button className="w-full rounded-md border border-zinc-600 px-3 py-2 font-medium hover:bg-zinc-800">
              Создать аккаунт
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
