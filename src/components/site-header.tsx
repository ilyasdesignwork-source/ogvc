import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

const links = [
  { href: "/", label: "Новости" },
  { href: "/pilots", label: "Пилоты" },
  { href: "/teams", label: "Команды" },
  { href: "/driver-standings", label: "Личный зачет" },
  { href: "/constructor-standings", label: "Командный зачет" },
  { href: "/avatar", label: "Мой аватар" },
  { href: "/admin", label: "Админ" },
];

export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-zinc-800 bg-black">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-[0.2em] text-red-500">
          OGVC F1
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm text-zinc-200">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-red-400">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="text-zinc-300">{user.email}</span>
              <form action={signOut}>
                <button className="rounded-md border border-zinc-700 px-3 py-1.5 hover:bg-zinc-900">
                  Выйти
                </button>
              </form>
            </>
          ) : (
            <Link href="/auth" className="rounded-md bg-red-600 px-3 py-1.5 font-medium hover:bg-red-500">
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
