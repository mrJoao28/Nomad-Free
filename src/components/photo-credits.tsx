import { listPhotoCredits } from "@/lib/photos";

/** Créditos das fotos reais em uso (exigidos por licenças como CC BY). Some se não houver fotos. */
export function PhotoCredits() {
  const credits = listPhotoCredits();
  if (credits.length === 0) return null;
  return (
    <details className="mx-auto max-w-7xl px-5 pb-5 sm:px-8" data-testid="photo-credits">
      <summary className="text-ink-soft cursor-pointer text-xs font-medium">
        Créditos das fotos
      </summary>
      <ul className="text-ink-soft mt-3 space-y-1 text-xs leading-relaxed">
        {credits.map((c) => (
          <li key={c.imageKey}>
            {c.title ?? c.imageKey}
            {c.author ? ` — ${c.author}` : ""}
            {c.license ? `, ${c.license}` : ""}
            {c.sourceUrl ? (
              <>
                {" · "}
                <a
                  href={c.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  fonte
                </a>
              </>
            ) : null}
          </li>
        ))}
      </ul>
    </details>
  );
}
