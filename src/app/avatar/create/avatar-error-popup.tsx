"use client";

import { useState } from "react";

type AvatarErrorPopupProps = {
  errorCode?: string;
  errorDetail?: string;
};

export default function AvatarErrorPopup({
  errorCode,
  errorDetail,
}: AvatarErrorPopupProps) {
  const [open, setOpen] = useState(Boolean(errorCode));

  if (!errorCode || !open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-xl border border-red-800 bg-zinc-950 p-5 shadow-2xl">
        <p className="text-sm uppercase tracking-widest text-red-400">Ошибка сохранения</p>
        <p className="mt-3 text-sm text-zinc-200">
          <span className="font-semibold text-red-300">Код:</span> {errorCode}
        </p>
        <p className="mt-2 break-words rounded-md border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-300">
          {errorDetail || "Нет деталей ошибки"}
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-500"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
