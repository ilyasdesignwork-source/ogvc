"use client";

import { useState } from "react";

type NewsReadModalProps = {
  title: string;
  content: string;
  createdAt: string;
  photoUrl?: string | null;
};

export default function NewsReadModal({
  title,
  content,
  createdAt,
  photoUrl,
}: NewsReadModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 rounded-md border border-zinc-600 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
      >
        Читать полностью
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="h-[70vh] w-full max-w-4xl overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  {new Date(createdAt).toLocaleDateString("ru-RU")}
                </p>
                <h3 className="mt-1 text-xl font-bold">{title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-800"
              >
                Закрыть
              </button>
            </div>

            <div className="h-[calc(70vh-82px)] overflow-y-auto px-5 py-4">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt={title}
                  className="mb-4 h-56 w-full rounded-lg object-cover"
                />
              ) : null}
              <p className="whitespace-pre-line leading-7 text-zinc-300">{content}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
