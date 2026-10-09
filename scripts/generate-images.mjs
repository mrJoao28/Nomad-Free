#!/usr/bin/env node
// Gera paisagens SVG locais (placeholders originais) em public/img. Determinístico por chave.
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "public/img";
mkdirSync(OUT, { recursive: true });

function rng(seed) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => (h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) / 4294967296;
}

const W = 1600,
  H = 1000;
const themes = {
  mountain: {
    sky: ["#c9c4bc", "#8d8a87"],
    far: "#6f6f72",
    mid: "#4a4a4d",
    near: "#2b2d2f",
    water: "#2f5d62",
    accent: "#d9d4cb",
  },
  coast: {
    sky: ["#d8cdbd", "#a39a8e"],
    far: "#7b7a6d",
    mid: "#5b6b4e",
    near: "#c3a878",
    water: "#2f5d62",
    accent: "#efe6d4",
  },
  valley: {
    sky: ["#e0d3bd", "#b19f84"],
    far: "#8a8665",
    mid: "#667248",
    near: "#3c4a2e",
    water: "#5e7a73",
    accent: "#f2e8cf",
  },
  dunes: {
    sky: ["#e2d0b4", "#b98f62"],
    far: "#b8865a",
    mid: "#8e6444",
    near: "#5a3f2d",
    water: "#6b7f80",
    accent: "#f4e3c2",
  },
  forest: {
    sky: ["#c6cdc0", "#8c9a8a"],
    far: "#6b7f6d",
    mid: "#3f5744",
    near: "#223329",
    water: "#4e6f6a",
    accent: "#e1e6d8",
  },
};
const assign = {
  "medellin-colombia": "valley",
  "cusco-peru": "mountain",
  "oaxaca-mexico": "dunes",
  "tbilisi-georgia": "valley",
  "chiang-mai-tailandia": "forest",
  "da-nang-vietna": "coast",
  "florianopolis-brasil": "coast",
  "cidade-do-cabo-africa-do-sul": "mountain",
  "porto-portugal": "coast",
  "op-medellin-hostel": "valley",
  "op-medellin-horta": "forest",
  "op-cusco-cafe": "dunes",
  "op-cusco-escola": "mountain",
  "op-oaxaca-guesthouse": "dunes",
  "op-oaxaca-ceramica": "dunes",
  "op-chiang-mai-guesthouse": "forest",
  "op-chiang-mai-santuario": "forest",
  "op-florianopolis-pousada": "coast",
  "op-tbilisi-ecovila": "valley",
  "op-da-nang-hostel": "coast",
  "op-porto-vinhedo": "valley",
  "op-cidade-do-cabo-costa": "coast",
  "hero-montanha": "mountain",
  "hero-fiorde": "coast",
};

function ridge(r, baseY, amp, steps, color, jag) {
  const pts = [];
  let y = baseY;
  for (let i = 0; i <= steps; i++) {
    y += (r() - 0.5) * amp * (jag ? 1.6 : 0.7);
    y = Math.min(baseY + amp, Math.max(baseY - amp, y));
    pts.push(`${Math.round((i / steps) * W)},${Math.round(y)}`);
  }
  return `<polygon points="0,${H} ${pts.join(" ")} ${W},${H}" fill="${color}"/>`;
}

function build(key, themeName) {
  const t = themes[themeName];
  const r = rng(key);
  const sunX = 250 + r() * 1100;
  const waterY = themeName === "coast" || key.includes("fiorde") ? 640 + r() * 80 : H + 10;
  const parts = [];
  parts.push(`<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.sky[0]}"/><stop offset="1" stop-color="${t.sky[1]}"/></linearGradient>
<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>
<filter id="b"><feGaussianBlur stdDeviation="14"/></filter></defs>`);
  parts.push(`<rect width="${W}" height="${H}" fill="url(#s)"/>`);
  parts.push(
    `<circle cx="${sunX.toFixed(0)}" cy="260" r="120" fill="${t.accent}" opacity=".55" filter="url(#b)"/>`,
  );
  const jag = themeName === "mountain";
  parts.push(ridge(r, 470, jag ? 150 : 70, jag ? 26 : 14, t.far, jag));
  parts.push(
    `<rect y="520" width="${W}" height="260" fill="${t.accent}" opacity=".18" filter="url(#b)"/>`,
  );
  parts.push(ridge(r, 600, jag ? 130 : 60, jag ? 22 : 12, t.mid, jag));
  if (waterY < H)
    parts.push(
      `<rect y="${Math.round(waterY)}" width="${W}" height="${H - Math.round(waterY)}" fill="${t.water}"/><rect y="${Math.round(waterY)}" width="${W}" height="14" fill="${t.accent}" opacity=".35"/>`,
    );
  parts.push(ridge(r, 790, jag ? 90 : 45, 10, t.near, false));
  parts.push(`<rect width="${W}" height="${H}" fill="url(#g)"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${parts.join("")}</svg>\n`;
}

for (const [key, theme] of Object.entries(assign)) {
  writeFileSync(`${OUT}/${key}.svg`, build(key, theme));
}
console.log(`${Object.keys(assign).length} imagens geradas em ${OUT}`);
