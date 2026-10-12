import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FavoritesList } from "@/components/favorites-list";
import { listResorts } from "@/data/catalog-repository";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Favoritos", robots: { index: false } };

export default async function FavoritesPage() {
  const items = await listResorts();
  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-7xl px-5 pt-6 sm:px-8">
        <h1 className="display display-caps text-[clamp(2.6rem,7vw,6rem)]">Favoritos</h1>
        <p className="text-ink-soft mt-4 max-w-xl text-sm leading-relaxed">
          Seus favoritos ficam salvos apenas neste navegador e neste dispositivo. Eles não são
          sincronizados entre aparelhos nem enviados ao servidor, e podem sumir se você limpar os
          dados do navegador.
        </p>
        <FavoritesList items={items} />
      </main>
      <SiteFooter />
    </>
  );
}
