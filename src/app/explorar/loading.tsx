export default function Loading() {
  return (
    <main id="conteudo" className="mx-auto max-w-7xl px-5 py-24 sm:px-8" aria-busy="true">
      <p role="status" className="text-ink-soft text-sm">
        Carregando…
      </p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-paper h-72 animate-pulse rounded-[var(--radius-card)] motion-reduce:animate-none"
          />
        ))}
      </div>
    </main>
  );
}
