import { updateSiteText } from "@/app/site-text-actions";

type AdminEditableTextProps = {
  textKey: string;
  value: string;
  isAdmin: boolean;
  className?: string;
  multiline?: boolean;
};

export default function AdminEditableText({
  textKey,
  value,
  isAdmin,
  className,
  multiline = false,
}: AdminEditableTextProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <p className={className}>{value}</p>
      {isAdmin ? (
        <details className="shrink-0">
          <summary className="cursor-pointer rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800">
            Ред.
          </summary>
          <form action={updateSiteText} className="mt-2 w-72 space-y-2 rounded-lg border border-zinc-700 bg-zinc-900 p-2">
            <input type="hidden" name="key" value={textKey} />
            {multiline ? (
              <textarea
                name="value"
                defaultValue={value}
                rows={4}
                className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm"
              />
            ) : (
              <input
                name="value"
                defaultValue={value}
                className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm"
              />
            )}
            <button className="rounded border border-zinc-600 px-2 py-1 text-xs hover:bg-zinc-800">
              Сохранить
            </button>
          </form>
        </details>
      ) : null}
    </div>
  );
}
