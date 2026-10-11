import Link from "next/link";
import { PhotoCredits } from "./photo-credits";

export function SiteFooter() {
  return (
    <footer className="border-line text-ink mt-24 border-t bg-black/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="display-caps text-3xl tracking-[0.12em]">
            Nomad<span className="text-fjord">Free</span>
          </p>
          <p className="text-ink-soft mt-4 max-w-sm text-sm leading-relaxed">
            Ideias de destinos acessíveis e oportunidades de hospedagem em troca de trabalho para
            quem viaja e trabalha à distância.
          </p>
        </div>
        <nav aria-label="Rodapé">
          <p className="text-sm font-semibold">Navegar</p>
          <ul className="text-ink-soft mt-3 space-y-2 text-sm">
            <li>
              <Link
                className="hover:text-fjord underline-offset-4 hover:underline"
                href="/explorar"
              >
                Explorar
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-fjord underline-offset-4 hover:underline"
                href="/comparar"
              >
                Comparar destinos
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-fjord underline-offset-4 hover:underline"
                href="/favoritos"
              >
                Favoritos
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <p className="text-sm font-semibold">Newsletter</p>
          <p className="text-ink-soft mt-3 text-sm">
            Ainda não disponível. Quando existir, explicaremos aqui como seu e-mail seria guardado e
            usado.
          </p>
        </div>
      </div>
      <div className="border-line border-t">
        <PhotoCredits />
        <p className="text-ink-soft mx-auto max-w-7xl px-5 py-5 text-xs leading-relaxed sm:px-8">
          Todo o conteúdo atual é de demonstração: valores e condições são estimativas ilustrativas,
          não verificadas. Hospedagem em troca de trabalho pode exigir horas de serviço, taxas ou
          outros custos, e não está disponível para todos. Favoritos ficam apenas neste navegador e
          não sincronizam entre dispositivos.
        </p>
      </div>
    </footer>
  );
}
