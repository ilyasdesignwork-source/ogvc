# OGVC F1 MVP

MVP сайта в стиле F1 на `Next.js + Supabase`.

## Что реализовано

- Stage 1: регистрация/вход/выход через Supabase Auth (сессия сохраняется в cookie).
- Stage 2: создание аватара с серверным расчетом рейтинга (клиент не может подменить итоговый рейтинг).
- Stage 3: F1-структура сайта: новости, пилоты, команды, личный и командный зачеты.

## Быстрый запуск

1. Скопируйте `.env.example` в `.env.local` и заполните ключи Supabase.
2. В Supabase SQL Editor выполните `supabase/schema.sql`.
3. Установите зависимости и запустите проект:

```bash
npm install
npm run dev
```

## Admin Panel

- Страница: `/admin`
- Доступ к UI: только email из `ADMIN_EMAILS` в `.env.local`.
- Для прав записи в Supabase выполните `supabase/admin_policies.sql`.
- Добавьте своего пользователя в админы:

```sql
insert into public.admin_users (user_id)
values ('YOUR_AUTH_USER_UUID')
on conflict (user_id) do nothing;
```

- Inline-редактирование текстов на страницах работает через таблицу `site_texts` (кнопка `Ред.` видна только админам).

## Таблицы Supabase

- `avatars`
- `news`
- `teams`
- `driver_standings`
- `constructor_standings`
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
