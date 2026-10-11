import { describe, expect, it } from "vitest";
// @ts-expect-error módulo .mjs sem tipos
import { pickBest, stripHtml } from "../../scripts/fetch-photos.mjs";

const base = {
  mime: "image/jpeg",
  license: "CC BY-SA 4.0",
  width: 4000,
  height: 2500,
  rank: 1,
  title: "File:Cusco panorama.jpg",
};

describe("seleção automática de fotos", () => {
  it("prefere a melhor posição na busca e aceita só paisagem de alta resolução", () => {
    const result = pickBest([
      { ...base, title: "File:B.jpg", rank: 3 },
      { ...base, title: "File:A.jpg", rank: 1 },
      { ...base, title: "File:Retrato.jpg", width: 2000, height: 3000 },
      { ...base, title: "File:Pequena.jpg", width: 1200, height: 800 },
      { ...base, title: "File:Muito larga.jpg", width: 9000, height: 1500 },
    ]);
    expect(result.map((c: { title: string }) => c.title)).toEqual(["File:A.jpg", "File:B.jpg"]);
  });

  it("rejeita licenças não livres, tipos não JPEG e mapas ou bandeiras", () => {
    const result = pickBest([
      { ...base, title: "File:Nao livre.jpg", license: "All rights reserved" },
      { ...base, title: "File:Icone.png", mime: "image/png" },
      { ...base, title: "File:Mapa de Cusco.jpg" },
      { ...base, title: "File:Flag of Peru.jpg" },
      { ...base, title: "File:Boa.jpg", license: "Public domain" },
    ]);
    expect(result.map((c: { title: string }) => c.title)).toEqual(["File:Boa.jpg"]);
  });

  it("limpa HTML dos metadados", () => {
    expect(stripHtml('<a href="x">Maria &amp; Cia</a>')).toBe("Maria & Cia");
  });
});
