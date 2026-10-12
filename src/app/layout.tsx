import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSiteUrl } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "NomadFree — estações de esqui do mundo",
    template: "%s · NomadFree",
  },
  description:
    "Encontre onde esquiar: 100 estações de esqui e resorts do mundo, com altitude, temporada e custo estimado. Conteúdo atual de demonstração.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "NomadFree",
    title: "NomadFree — estações de esqui do mundo",
    description:
      "100 estações de esqui e resorts do mundo, com altitude, temporada e custo estimado.",
  },
};

export const viewport: Viewport = { themeColor: "#0b1220", width: "device-width", initialScale: 1 };

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
