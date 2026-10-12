import { describe, expect, it } from "vitest";
import {
  isUnwanted,
  normalizeTitle,
  rankCandidates,
  stripHtml,
} from "../../scripts/fetch-photos.mjs";
import type { PhotoCandidate } from "../../scripts/fetch-photos.mjs";

type Candidate = PhotoCandidate;

const base: Candidate = {
  title: "File:Zermatt.jpg",
  mime: "image/jpeg",
  license: "CC BY-SA 4.0",
  width: 4000,
  height: 2500,
  order: 0,
};

const titles = (list: Candidate[]) => list.map((c) => c.title);

describe("escolha automática de fotos", () => {
  it("prefere resolução alta e, entre iguais, a origem de maior prioridade", () => {
    const result = rankCandidates([
      { ...base, title: "File:Baixa.jpg", width: 1500, height: 1000, order: 0 },
      { ...base, title: "File:Outra.jpg", order: 100 },
      { ...base, title: "File:Principal.jpg", order: 0 },
    ]);
    expect(titles(result)).toEqual(["File:Principal.jpg", "File:Outra.jpg", "File:Baixa.jpg"]);
  });

  it("exige JPEG, licença livre, largura mínima e formato de paisagem", () => {
    const result = rankCandidates([
      { ...base, title: "File:Icone.png", mime: "image/png" },
      { ...base, title: "File:Nao livre.jpg", license: "All rights reserved" },
      { ...base, title: "File:Pequena.jpg", width: 1000, height: 700 },
      { ...base, title: "File:Retrato.jpg", width: 2000, height: 3000 },
      { ...base, title: "File:Faixa fina.jpg", width: 9000, height: 1500 },
      { ...base, title: "File:Boa.jpg", license: "Public domain" },
    ]);
    expect(titles(result)).toEqual(["File:Boa.jpg"]);
  });

  it("descarta mapas de pistas, logos, bandeiras e aeronaves", () => {
    for (const bad of [
      "File:Piste map Chamonix.jpg",
      "File:Trail map.jpg",
      "File:Logo.jpg",
      "File:Flag of Peru.jpg",
      "File:F-16 aircraft over Da Nang air base.jpg",
    ]) {
      expect(isUnwanted(bad)).toBe(true);
      expect(rankCandidates([{ ...base, title: bad }])).toEqual([]);
    }
    expect(isUnwanted("File:Zermatt and the Matterhorn.jpg")).toBe(false);
  });

  it("nunca repete uma foto já usada por outra estação", () => {
    const used = new Set([normalizeTitle("Zermatt.jpg")]);
    expect(rankCandidates([base], used)).toEqual([]);
    expect(
      titles(rankCandidates([base, { ...base, title: "File:Outra.jpg", order: 1 }], used)),
    ).toEqual(["File:Outra.jpg"]);
  });

  it("normaliza títulos com underscore e sem prefixo", () => {
    expect(normalizeTitle("Foo_bar.jpg")).toBe("File:Foo bar.jpg");
    expect(normalizeTitle("File:Foo bar.jpg")).toBe("File:Foo bar.jpg");
  });

  it("limpa HTML dos metadados", () => {
    expect(stripHtml('<a href="x">Maria &amp; Cia</a>')).toBe("Maria & Cia");
  });
});
