"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const SIGNUP_COOLDOWN_SECONDS = 60;

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toLowerCase();
}

function mapAuthError(errorMessage: string) {
  const message = errorMessage.toLowerCase();

  if (
    message.includes("email rate limit") ||
    message.includes("over_email_send_rate_limit") ||
    message.includes("too many requests")
  ) {
    return "Слишком много писем отправлено. Подождите 60 секунд и попробуйте снова.";
  }

  return errorMessage;
}

export async function signIn(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(`/auth?message=${encodeURIComponent("Введите email и пароль")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/auth?message=${encodeURIComponent(error.message)}`);
  }

  redirect("/");
}

export async function signUp(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(`/auth?message=${encodeURIComponent("Введите email и пароль")}`);
  }

  const cookieStore = await cookies();
  const lastSignupEmail = cookieStore.get("signup_last_email")?.value ?? "";
  const lastSignupAtRaw = Number(cookieStore.get("signup_last_at")?.value ?? 0);
  const now = Date.now();
  const secondsSinceLast = Math.floor((now - lastSignupAtRaw) / 1000);
  const inCooldown =
    lastSignupEmail === email &&
    Number.isFinite(lastSignupAtRaw) &&
    secondsSinceLast >= 0 &&
    secondsSinceLast < SIGNUP_COOLDOWN_SECONDS;

  if (inCooldown) {
    const waitSeconds = SIGNUP_COOLDOWN_SECONDS - secondsSinceLast;
    redirect(
      `/auth?message=${encodeURIComponent(
        `Подождите ${waitSeconds} сек. перед повторной отправкой письма.`,
      )}`,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/auth?message=${encodeURIComponent(mapAuthError(error.message))}`);
  }

  cookieStore.set("signup_last_email", email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SIGNUP_COOLDOWN_SECONDS,
  });
  cookieStore.set("signup_last_at", String(now), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SIGNUP_COOLDOWN_SECONDS,
  });

  // If email confirmation is disabled in Supabase Auth settings,
  // signUp returns a session and user is already authenticated.
  if (data.session) {
    redirect("/");
  }

  // Fallback for projects where email confirmation is still enabled.
  redirect(`/auth?message=${encodeURIComponent("Аккаунт создан. Теперь войдите.")}`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/auth?message=${encodeURIComponent("Вы вышли из аккаунта")}`);
}
