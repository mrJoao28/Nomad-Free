#!/usr/bin/env node
/**
 * Baixa uma foto livre de direitos para cada estação (e para o fundo da página inicial) e grava
 * autor, licença e link em public/img/photos/credits.json.
 *
 * Como a foto é escolhida (sem busca por texto, para não trazer imagens erradas):
 *   1. A imagem principal do artigo da estação na Wikipédia (campo "wiki" em photo-sources.json).
 *   2. Se ela não servir, as outras imagens do mesmo artigo.
 *   3. Se ainda assim faltar, as fotos da categoria do Commons (campo "commonsCategory", opcional).
 * Cada candidata precisa estar no Wikimedia Commons com licença livre (CC BY, CC BY-SA, CC0 ou
 * domínio público), ser JPEG em paisagem e ter largura mínima (1280 px). Mapas de pistas, logos e bandeiras
 * são descartados, e a MESMA foto nunca é usada em duas estações.
 *
 * Uso:
 *   node scripts/fetch-photos.mjs              baixa as fotos que faltam
 *   node scripts/fetch-photos.mjs --dry        só mostra a escolha, sem baixar
 *   node scripts/fetch-photos.mjs --only=zermatt,chamonix
 *   node scripts/fetch-photos.mjs --force      baixa de novo, mesmo se a foto já existir
 *   node scripts/fetch-photos.mjs --report     refaz scripts/revisao-fotos.html (sem rede)
 *
 * Para trocar uma foto: copie o título de um arquivo do Commons (ex.: "File:Exemplo.jpg") para o
 * campo "file" da estação em photo-sources.json e rode com --only=<chave> --force.
 * Depois abra scripts/revisao-fotos.html no navegador para conferir todas as fotos de uma vez.
 * Requer Node 18+ (fetch nativo). Sem dependências.
 */
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcesPath = path.join(root, "scripts", "photo-sources.json");
const reportPath = path.join(root, "scripts", "revisao-fotos.html");
const photosDir = path.join(root, "public", "img", "photos");
const creditsPath = path.join(photosDir, "credits.json");

const WIKI_API = "https://en.wikipedia.org/w/api.php";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const USER_AGENT = "NomadFreeDev/0.3 (projeto local de estudo; fotos com atribuição)";
// 1920 é um tamanho padrão de miniatura do Wikimedia; larguras fora dos "degraus" (ex.: 2400) são recusadas (HTTP 429).
const THUMB_WIDTH = 1920;
const GOOD_WIDTH = 1920;
const MIN_WIDTH = 1280;
const MIN_RATIO = 1.2;
const MAX_RATIO = 2.6;
const FREE_LICENSE = /^(cc[ -]by|cc[ -]by-sa|cc0|public domain|pd)/i;
const UNWANTED_TITLE =
  /\b(map|mapa|karte|carte|plan|piste|pistenplan|trail|logo|flag|coat of arms|emblem|diagram|locator|sketch|poster|timetable|route|aircraft|fighter|air base|airbase|warship)\b/i;

export function stripHtml(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** "File:Foo_bar.jpg" e "Foo bar.jpg" viram a mesma chave: "File:Foo bar.jpg". */
export function normalizeTitle(title) {
  const t = String(title).replace(/_/g, " ").trim();
  return t.startsWith("File:") ? t : `File:${t}`;
}

export function isUnwanted(title) {
  return UNWANTED_TITLE.test(title);
}

/**
 * Escolhe a melhor candidata. `candidates` vem em ordem de prioridade da origem
 * (principal do artigo, outras do artigo, categoria) e cada item tem `order`.
 * `used` é o conjunto de títulos já usados por outras estações.
 */
export function rankCandidates(candidates, used = new Set()) {
  return candidates
    .filter((c) => c && c.mime === "image/jpeg" && FREE_LICENSE.test(c.license))
    .filter((c) => !used.has(normalizeTitle(c.title)))
    .filter((c) => c.width >= MIN_WIDTH && c.height > 0)
    .filter((c) => c.width / c.height >= MIN_RATIO && c.width / c.height <= MAX_RATIO)
    .filter((c) => !isUnwanted(c.title))
    .map((c) => ({ ...c, tier: c.width >= GOOD_WIDTH ? 0 : 1 }))
    .sort(
      (a, b) => a.tier - b.tier || a.order - b.order || b.width * b.height - a.width * a.height,
    );
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

/** fetch com nova tentativa para 429 e erros 5xx (respeita Retry-After). */
async function fetchRetry(url, tries = 4) {
  let last;
  for (let attempt = 1; attempt <= tries; attempt += 1) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (res.ok) return res;
      last = new Error(`resposta ${res.status}`);
      if (res.status !== 429 && res.status < 500) break;
      const wait = Number(res.headers.get("retry-after")) || attempt * 2;
      await new Promise((resolve) => setTimeout(resolve, Math.min(wait, 15) * 1000));
    } catch (error) {
      last = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
  throw last ?? new Error("falha de rede");
}

async function api(base, params) {
  const url = new URL(base);
  url.search = new URLSearchParams({ format: "json", ...params }).toString();
  const res = await fetchRetry(url);
  return res.json();
}

const chunk = (list, size) =>
  Array.from({ length: Math.ceil(list.length / size) }, (_, i) =>
    list.slice(i * size, (i + 1) * size),
  );

/** Título do artigo (como pedido) -> arquivo da imagem principal, ou null. */
async function leadImages(wikiTitles) {
  const result = new Map();
  for (const batch of chunk([...new Set(wikiTitles)], 40)) {
    const data = await api(WIKI_API, {
      action: "query",
      prop: "pageimages",
      piprop: "name",
      redirects: "1",
      converttitles: "1",
      titles: batch.join("|"),
    });
    const alias = new Map(batch.map((t) => [t, t]));
    for (const n of data?.query?.normalized ?? []) alias.set(n.from, n.to);
    for (const r of data?.query?.redirects ?? []) {
      for (const [from, to] of alias) if (to === r.from) alias.set(from, r.to);
    }
    const byTitle = new Map(Object.values(data?.query?.pages ?? {}).map((p) => [p.title, p]));
    for (const requested of batch) {
      const page = byTitle.get(alias.get(requested));
      result.set(requested, page?.pageimage ? normalizeTitle(page.pageimage) : null);
    }
  }
  return result;
}

async function articleImages(wikiTitle) {
  const data = await api(WIKI_API, {
    action: "query",
    prop: "images",
    imlimit: "100",
    redirects: "1",
    titles: wikiTitle,
  });
  const page = Object.values(data?.query?.pages ?? {})[0];
  return (page?.images ?? [])
    .map((i) => i.title)
    .filter((t) => /\.jpe?g$/i.test(t))
    .map(normalizeTitle);
}

async function categoryFiles(category) {
  const data = await api(COMMONS_API, {
    action: "query",
    list: "categorymembers",
    cmtitle: category.startsWith("Category:") ? category : `Category:${category}`,
    cmtype: "file",
    cmlimit: "60",
  });
  return (data?.query?.categorymembers ?? []).map((m) => normalizeTitle(m.title));
}

/** Metadados de arquivos do Commons. Arquivos que não existem no Commons (ex.: não livres) ficam de fora. */
async function imageInfo(fileTitles, cache) {
  const missing = [...new Set(fileTitles.map(normalizeTitle))].filter((t) => !cache.has(t));
  for (const batch of chunk(missing, 40)) {
    const data = await api(COMMONS_API, {
      action: "query",
      prop: "imageinfo",
      iiprop: "url|size|mime|extmetadata",
      iiurlwidth: String(THUMB_WIDTH),
      iiextmetadatafilter: "Artist|LicenseShortName|ObjectName",
      titles: batch.join("|"),
    });
    const alias = new Map(batch.map((t) => [t, t]));
    for (const n of data?.query?.normalized ?? []) alias.set(n.from, n.to);
    const byTitle = new Map(Object.values(data?.query?.pages ?? {}).map((p) => [p.title, p]));
    for (const requested of batch) {
      const page = byTitle.get(alias.get(requested));
      const info = page && page.missing === undefined ? page.imageinfo?.[0] : undefined;
      if (!info) {
        cache.set(requested, null);
        continue;
      }
      const meta = info.extmetadata ?? {};
      cache.set(requested, {
        title: normalizeTitle(page.title),
        width: info.width ?? 0,
        height: info.height ?? 0,
        mime: info.mime ?? "",
        thumburl: info.thumburl ?? info.url,
        descriptionurl: info.descriptionurl,
        license: stripHtml(meta.LicenseShortName?.value),
        author: stripHtml(meta.Artist?.value) || "Autor não informado",
        name: stripHtml(meta.ObjectName?.value),
      });
    }
  }
  return fileTitles.map((t) => cache.get(normalizeTitle(t)) ?? null);
}

/** Lista candidatas em ordem de prioridade. Lança só em falha de rede. */
async function collectCandidates(source, lead, cache, used) {
  const ordered = [];
  const add = async (titles, base) => {
    const infos = await imageInfo(titles, cache);
    infos.forEach((info, i) => info && ordered.push({ ...info, order: base + i }));
  };
  const file = String(source.file ?? "").trim();
  if (file) {
    await add([file], 0);
    return ordered;
  }
  if (lead) await add([lead], 0);
  if (rankCandidates(ordered, used).length === 0) {
    await add(await articleImages(source.wiki), 100);
  }
  // Categoria do Commons: a indicada em "commonsCategory" ou, como último recurso, a de mesmo nome do artigo.
  if (source.commonsCategory || rankCandidates(ordered, used).length === 0) {
    try {
      await add(await categoryFiles(source.commonsCategory || source.wiki), 1000);
    } catch {
      // categoria inexistente: segue sem ela
    }
  }
  return ordered;
}

function reportHtml(entries, missing) {
  const rows = entries
    .map(
      (e) => `<tr>
  <td><img src="../public/img/photos/${escapeHtml(e.key)}.jpg" alt="" width="320" loading="lazy"></td>
  <td><strong>${escapeHtml(e.key)}</strong><br>${escapeHtml(e.title)}<br>${escapeHtml(e.license)}<br>${escapeHtml(e.author)}<br>${
    e.sourceUrl ? `<a href="${escapeHtml(e.sourceUrl)}">fonte</a>` : ""
  }</td></tr>`,
    )
    .join("\n");
  const miss = missing.length
    ? `<h2>Sem foto (${missing.length})</h2><ul>${missing
        .map((m) => `<li><strong>${escapeHtml(m.key)}</strong>: ${escapeHtml(m.reason)}</li>`)
        .join("")}</ul>`
    : "";
  return `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Revisão das fotos</title>
<style>body{font:14px system-ui;background:#111;color:#eee;margin:2rem}td{padding:.6rem;vertical-align:top;border-bottom:1px solid #333}a{color:#8bbfff}</style>
<h1>Revisão das fotos (${entries.length})</h1>
<p>Confira se cada foto mostra a estação certa. Para trocar uma, preencha "file" em scripts/photo-sources.json e rode com --only=chave --force.</p>
<table>${rows}</table>${miss}</html>`;
}

async function writeReport(sources, credits, missing) {
  const entries = [];
  for (const key of Object.keys(sources)) {
    if (credits[key] && (await exists(path.join(photosDir, `${key}.jpg`)))) {
      entries.push({ key, ...credits[key] });
    }
  }
  await writeFile(reportPath, reportHtml(entries, missing), "utf8");
  return entries.length;
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry");
  const force = args.includes("--force");
  const onlyReport = args.includes("--report");
  const only = args
    .find((a) => a.startsWith("--only="))
    ?.slice(7)
    .split(",")
    .filter(Boolean);

  const sources = await readJson(sourcesPath, {});
  const credits = await readJson(creditsPath, {});
  await mkdir(photosDir, { recursive: true });

  if (onlyReport) {
    const n = await writeReport(sources, credits, []);
    console.log(`Relatório com ${n} fotos em scripts/revisao-fotos.html`);
    return;
  }

  const keys = Object.keys(sources).filter((k) => !only || only.includes(k));
  const todo = [];
  for (const key of keys) {
    if (!force && (await exists(path.join(photosDir, `${key}.jpg`)))) continue;
    todo.push(key);
  }
  console.log(`${keys.length - todo.length} já existem; buscando ${todo.length}...`);

  // Títulos já ocupados por fotos existentes (para nunca repetir uma foto em outra estação).
  const used = new Set(
    Object.entries(credits)
      .filter(([k]) => !todo.includes(k))
      .map(([, c]) => normalizeTitle(c.file ?? "")),
  );

  const leads = await leadImages(todo.map((k) => sources[k].wiki).filter(Boolean));
  const cache = new Map();
  const missing = [];
  let ok = 0;

  for (const key of todo) {
    const source = sources[key];
    try {
      const candidates = await collectCandidates(
        source,
        leads.get(source.wiki) ?? null,
        cache,
        used,
      );
      const ranked = rankCandidates(candidates, used);
      const best = ranked[0];
      if (!best) {
        const reason = candidates.length
          ? "nenhuma candidata passou nos critérios (licença livre, JPEG, paisagem, largura mínima, sem repetição)"
          : "nenhuma imagem encontrada (confira o título em 'wiki')";
        missing.push({ key, reason });
        console.warn(`✗ ${key}: ${reason}`);
        continue;
      }
      if (dry) {
        const note = best.tier === 1 ? " (resolução menor que a ideal)" : "";
        console.log(
          `• ${key}: ${best.title} — ${best.width}x${best.height}, ${best.license}${note}`,
        );
        used.add(normalizeTitle(best.title));
        ok += 1;
        continue;
      }
      // Tenta até 5 candidatas: se o download de uma falhar, passa para a próxima.
      let saved = null;
      let lastError = null;
      for (const candidate of ranked.slice(0, 5)) {
        try {
          const res = await fetchRetry(candidate.thumburl);
          await writeFile(path.join(photosDir, `${key}.jpg`), Buffer.from(await res.arrayBuffer()));
          saved = candidate;
          break;
        } catch (error) {
          lastError = error;
        }
      }
      if (!saved) throw lastError ?? new Error("download falhou");
      used.add(normalizeTitle(saved.title));
      const note = saved.tier === 1 ? " (resolução menor que a ideal)" : "";
      credits[key] = {
        file: saved.title,
        title: saved.name || saved.title.replace(/^File:/, ""),
        author: saved.author,
        license: saved.license,
        sourceUrl: saved.descriptionurl,
      };
      ok += 1;
      console.log(`✓ ${key}: ${saved.title} — ${saved.license}${note}`);
    } catch (error) {
      missing.push({ key, reason: error instanceof Error ? error.message : String(error) });
      console.warn(`✗ ${key}: ${error instanceof Error ? error.message : error}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 250)); // gentileza com a API
  }

  if (!dry) {
    await writeFile(creditsPath, `${JSON.stringify(credits, null, 2)}\n`, "utf8");
    await writeReport(sources, credits, missing);
  }
  console.log(`\n${ok} fotos ${dry ? "escolhidas" : "baixadas"}, ${missing.length} sem foto.`);
  if (!dry) console.log("Abra scripts/revisao-fotos.html no navegador para conferir.");
  if (missing.length)
    console.log("Para as que faltam, preencha 'file' em scripts/photo-sources.json.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
