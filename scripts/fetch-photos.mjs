#!/usr/bin/env node
/**
 * Baixa fotos de paisagens e lugares do Wikimedia Commons (licenças livres) para
 * public/img/photos/ e grava autor, licença e link em public/img/photos/credits.json.
 *
 * Uso:
 *   node scripts/fetch-photos.mjs                 escolhe e baixa a melhor foto de cada chave
 *   node scripts/fetch-photos.mjs --list          só mostra as melhores candidatas (não baixa)
 *   node scripts/fetch-photos.mjs --only=cusco-peru,porto-portugal
 *   node scripts/fetch-photos.mjs --force         baixa de novo mesmo se a foto já existir
 *
 * Em scripts/photo-sources.json cada chave tem:
 *   "search": termo de busca no Commons (usado na escolha automática)
 *   "file":   título exato de um arquivo (ex.: "File:Exemplo.jpg"); se preenchido, tem prioridade
 *
 * A escolha automática prefere "Featured pictures" e "Quality images", em formato paisagem e
 * alta resolução, e só aceita licenças livres (CC BY, CC BY-SA, CC0, domínio público).
 * Confira o resultado no site; para trocar uma foto, preencha "file" e rode com --force.
 * Requer Node 22+ (fetch nativo). Sem dependências.
 */
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcesPath = path.join(root, "scripts", "photo-sources.json");
const photosDir = path.join(root, "public", "img", "photos");
const creditsPath = path.join(photosDir, "credits.json");

const API = "https://commons.wikimedia.org/w/api.php";
const USER_AGENT = "NomadFreeDev/0.2 (projeto local de estudo; uso de fotos com atribuição)";
const WIDTH = 1920;
const MIN_WIDTH = 2400;
const MIN_RATIO = 1.4;
const MAX_RATIO = 2.4;
const FREE_LICENSE = /^(cc[ -]by|cc[ -]by-sa|cc0|public domain|pd)/i;
const UNWANTED_TITLE =
  /\b(map|mapa|flag|bandeira|coat of arms|logo|diagram|locator|plan|poster|panorama stitched|aerial photograph of the area)\b/i;

export function stripHtml(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function api(params) {
  const url = new URL(API);
  url.search = new URLSearchParams({ format: "json", ...params }).toString();
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`API respondeu ${res.status}`);
  return res.json();
}

const IMAGE_PROPS = {
  prop: "imageinfo",
  iiprop: "url|size|mime|extmetadata",
  iiurlwidth: String(WIDTH),
  iiextmetadatafilter: "Artist|LicenseShortName|ObjectName",
};

function toCandidate(page) {
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata ?? {};
  return {
    title: page.title,
    rank: page.index ?? 999,
    width: info.width ?? 0,
    height: info.height ?? 0,
    mime: info.mime ?? "",
    thumburl: info.thumburl ?? info.url,
    descriptionurl: info.descriptionurl,
    license: stripHtml(meta.LicenseShortName?.value),
    author: stripHtml(meta.Artist?.value) || "Autor não informado",
    name: stripHtml(meta.ObjectName?.value),
  };
}

/** Filtra e ordena candidatas: paisagem, alta resolução, licença livre, sem mapas/bandeiras. */
export function pickBest(candidates) {
  return candidates
    .filter((c) => c && c.mime === "image/jpeg" && FREE_LICENSE.test(c.license))
    .filter((c) => c.width >= MIN_WIDTH && c.height > 0)
    .filter((c) => c.width / c.height >= MIN_RATIO && c.width / c.height <= MAX_RATIO)
    .filter((c) => !UNWANTED_TITLE.test(c.title))
    .sort((a, b) => a.rank - b.rank || b.width * b.height - a.width * a.height);
}

async function searchBest(term) {
  const queries = [
    `${term} incategory:"Featured pictures on Wikimedia Commons"`,
    `${term} incategory:"Quality images"`,
    `${term} filetype:bitmap landscape`,
  ];
  for (const q of queries) {
    const data = await api({
      action: "query",
      generator: "search",
      gsrsearch: q,
      gsrnamespace: "6",
      gsrlimit: "40",
      ...IMAGE_PROPS,
    });
    const candidates = Object.values(data?.query?.pages ?? {}).map(toCandidate);
    const best = pickBest(candidates);
    if (best.length > 0) return best;
  }
  return [];
}

async function byTitle(title) {
  const data = await api({
    action: "query",
    titles: title.startsWith("File:") ? title : `File:${title}`,
    ...IMAGE_PROPS,
  });
  const page = Object.values(data?.query?.pages ?? {})[0];
  const candidate = page && page.missing === undefined ? toCandidate(page) : null;
  if (!candidate) throw new Error("arquivo não encontrado no Commons");
  if (!FREE_LICENSE.test(candidate.license)) {
    throw new Error(`licença "${candidate.license || "desconhecida"}" não é livre`);
  }
  if (!/^image\/(jpeg|png|webp)$/.test(candidate.mime)) {
    throw new Error(`tipo ${candidate.mime} não suportado`);
  }
  return candidate;
}

async function main() {
  const args = process.argv.slice(2);
  const listOnly = args.includes("--list");
  const force = args.includes("--force");
  const only = args
    .find((a) => a.startsWith("--only="))
    ?.slice(7)
    .split(",")
    .filter(Boolean);

  const sources = await readJson(sourcesPath, {});
  const credits = await readJson(creditsPath, {});
  await mkdir(photosDir, { recursive: true });

  for (const [key, source] of Object.entries(sources)) {
    if (only && !only.includes(key)) continue;
    const jpg = path.join(photosDir, `${key}.jpg`);
    if (!force && !listOnly && (await exists(jpg))) {
      console.log(`• ${key}: já existe (use --force para trocar)`);
      continue;
    }
    try {
      const file = String(source.file ?? "").trim();
      let chosen;
      if (file) {
        chosen = await byTitle(file);
      } else {
        const found = await searchBest(String(source.search ?? key.replace(/-/g, " ")));
        if (listOnly) {
          console.log(`\n${key}:`);
          for (const c of found.slice(0, 5)) {
            console.log(`  ${c.title} (${c.width}x${c.height}, ${c.license}) ${c.descriptionurl}`);
          }
          if (found.length === 0) console.log("  nenhuma candidata encontrada");
          continue;
        }
        chosen = found[0];
        if (!chosen) throw new Error("nenhuma candidata (paisagem, alta resolução, licença livre)");
      }
      if (listOnly) continue;

      const res = await fetch(chosen.thumburl, { headers: { "User-Agent": USER_AGENT } });
      if (!res.ok) throw new Error(`download respondeu ${res.status}`);
      const ext =
        chosen.mime === "image/png" ? "png" : chosen.mime === "image/webp" ? "webp" : "jpg";
      await writeFile(path.join(photosDir, `${key}.${ext}`), Buffer.from(await res.arrayBuffer()));

      credits[key] = {
        title: chosen.name || chosen.title.replace(/^File:/, ""),
        author: chosen.author,
        license: chosen.license,
        sourceUrl: chosen.descriptionurl,
      };
      console.log(`✓ ${key}: ${chosen.title} — ${chosen.license}, ${chosen.author}`);
    } catch (error) {
      console.warn(`✗ ${key}: ${error instanceof Error ? error.message : error}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 500)); // gentileza com a API
  }

  if (!listOnly) {
    await writeFile(creditsPath, `${JSON.stringify(credits, null, 2)}\n`, "utf8");
    console.log("\nCréditos salvos em public/img/photos/credits.json. Recarregue o site.");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
