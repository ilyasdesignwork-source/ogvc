"use client";

import { useState } from "react";

type AvatarSuccessPopupProps = {
  message?: string;
};

export default function AvatarSuccessPopup({ message }: AvatarSuccessPopupProps) {
  const isSuccess = message === "Аватар сохранен";
  const [open, setOpen] = useState(isSuccess);

  if (!isSuccess || !open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-emerald-700 bg-zinc-950 p-5 shadow-2xl">
        <p className="text-sm uppercase tracking-widest text-emerald-400">Успех</p>
        <p className="mt-3 text-sm text-zinc-200">Аватар успешно создан.</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
