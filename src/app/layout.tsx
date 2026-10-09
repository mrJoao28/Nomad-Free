import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSiteUrl } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "NomadFree — destinos acessíveis para nômades digitais",
    template: "%s · NomadFree",
  },
  description:
    "Descubra destinos econômicos, locais bons para trabalho remoto e oportunidades de hospedagem em troca de trabalho. Conteúdo atual de demonstração.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "NomadFree",
    title: "NomadFree — destinos acessíveis para nômades digitais",
    description:
      "Destinos econômicos, locais para trabalho remoto e oportunidades de hospedagem em troca de trabalho.",
  },
};

export const viewport: Viewport = { themeColor: "#e6e2da", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <a
          href="#conteudo"
          className="focus:bg-ink focus:text-paper sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:px-4 focus:py-2"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
