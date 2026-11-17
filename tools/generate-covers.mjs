/* Generates 21 SVG cover images (hero + 20 chapter covers) into assets/img/.
   Usage: node tools/generate-covers.mjs                                    */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "assets", "img");
fs.mkdirSync(outDir, { recursive: true });

const accents = [
  "#3b82f6", "#8b5cf6", "#22d3ee", "#34d399", "#fbbf24",
  "#f472b6", "#818cf8", "#2dd4bf", "#fb923c", "#fb7185"
];

/* ---------------- per-chapter glyphs (drawn at 0,0 origin, ~140x110) ---------------- */

const glyphs = {
  1: `<rect x="4" y="6" width="150" height="94" rx="8" fill="none" stroke="#cbd5e1" stroke-width="4"/>
      <path d="M20 76 L48 76 L60 44 L76 78 L92 52 L106 68 L138 68" fill="none" stroke="ACC" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M64 100 L94 100 M79 100 L79 112" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>`,

  2: `<rect x="4" y="8" width="72" height="56" rx="6" fill="none" stroke="#cbd5e1" stroke-width="4"/>
      <path d="M4 28 H76 M28 8 V64 M52 8 V64" stroke="#cbd5e1" stroke-width="3"/>
      <rect x="90" y="54" width="70" height="54" rx="6" fill="none" stroke="ACC" stroke-width="4"/>
      <path d="M90 74 H160 M113 54 V108 M137 54 V108" stroke="ACC" stroke-width="3"/>
      <path d="M76 36 H90" stroke="#94a3b8" stroke-width="3" stroke-dasharray="5 5"/>`,

  3: `<rect x="10" y="6" width="140" height="32" rx="6" fill="none" stroke="#cbd5e1" stroke-width="4"/>
      <rect x="10" y="46" width="140" height="32" rx="6" fill="none" stroke="#cbd5e1" stroke-width="4"/>
      <rect x="10" y="86" width="140" height="32" rx="6" fill="none" stroke="ACC" stroke-width="4"/>
      <circle cx="32" cy="22" r="6" fill="ACC"/><circle cx="32" cy="62" r="6" fill="#94a3b8"/><circle cx="32" cy="102" r="6" fill="ACC"/>
      <path d="M56 22 H132 M56 62 H132 M56 102 H132" stroke="#64748b" stroke-width="4" stroke-linecap="round"/>`,

  4: `<circle cx="58" cy="58" r="38" fill="none" stroke="#cbd5e1" stroke-width="4" stroke-dasharray="12 8"/>
      <circle cx="58" cy="58" r="16" fill="none" stroke="ACC" stroke-width="5"/>
      <path d="M116 26 h44 v18 h-16 v14 h16 v18 h-44 v-14 h16 v-14 h-16 z" fill="none" stroke="ACC" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="138" cy="86" rx="26" ry="9" fill="none" stroke="#cbd5e1" stroke-width="4"/>`,

  5: `<path d="M20 44 L80 20 L140 44 L80 68 Z" fill="none" stroke="#cbd5e1" stroke-width="4" stroke-linejoin="round"/>
      <path d="M20 44 V96 L80 120 L140 96 V44" fill="none" stroke="ACC" stroke-width="4" stroke-linejoin="round"/>
      <path d="M80 68 V120" stroke="#cbd5e1" stroke-width="3"/>
      <path d="M176 30 V74 M160 58 L176 74 L192 58" fill="none" stroke="ACC" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,

  6: `<ellipse cx="80" cy="22" rx="56" ry="18" fill="none" stroke="#cbd5e1" stroke-width="4"/>
      <path d="M24 22 V80 M136 22 V80" stroke="#cbd5e1" stroke-width="4"/>
      <ellipse cx="80" cy="80" rx="56" ry="18" fill="none" stroke="#cbd5e1" stroke-width="4"/>
      <path d="M24 56 a56 18 0 0 0 112 0" fill="none" stroke="ACC" stroke-width="4"/>
      <path d="M24 56 a56 18 0 0 1 112 0" fill="none" stroke="ACC" stroke-width="4"/>`,

  7: `<path d="M80 6 L138 28 V64 C138 96 112 116 80 124 C48 116 22 96 22 64 V28 Z" fill="none" stroke="#cbd5e1" stroke-width="4" stroke-linejoin="round"/>
      <path d="M54 62 L74 82 L108 44" fill="none" stroke="ACC" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,

  8: `<ellipse cx="80" cy="30" rx="44" ry="14" fill="none" stroke="#cbd5e1" stroke-width="4"/>
      <path d="M36 30 V76 a44 14 0 0 0 88 0 V30" fill="none" stroke="#cbd5e1" stroke-width="4"/>
      <path d="M36 54 a44 14 0 0 0 88 0" fill="none" stroke="ACC" stroke-width="4"/>
      <path d="M150 44 a42 42 0 1 1 -20 -32" fill="none" stroke="ACC" stroke-width="5" stroke-linecap="round"/>
      <path d="M124 0 L134 16 L116 18 Z" fill="ACC"/>`,

  9: `<rect x="34" y="54" width="92" height="70" rx="10" fill="none" stroke="#cbd5e1" stroke-width="4"/>
      <path d="M54 54 V36 a26 26 0 0 1 52 0 V54" fill="none" stroke="ACC" stroke-width="5"/>
      <circle cx="80" cy="84" r="10" fill="ACC"/>
      <path d="M80 94 V108" stroke="ACC" stroke-width="6" stroke-linecap="round"/>`,

  10: `<circle cx="80" cy="66" r="46" fill="none" stroke="#cbd5e1" stroke-width="4"/>
       <path d="M80 66 V36 M80 66 L102 78" stroke="ACC" stroke-width="5" stroke-linecap="round"/>
       <path d="M36 22 L54 38 M124 22 L106 38" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round"/>
       <path d="M62 118 L80 106 L98 118" fill="none" stroke="ACC" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
       <circle cx="80" cy="66" r="7" fill="ACC"/>`,

  11: `<path d="M12 100 L48 66 L74 84 L112 34 L146 52" fill="none" stroke="ACC" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
       <circle cx="48" cy="66" r="7" fill="#cbd5e1"/><circle cx="112" cy="34" r="7" fill="#cbd5e1"/>
       <path d="M12 112 H150" stroke="#64748b" stroke-width="4" stroke-linecap="round"/>
       <path d="M150 20 a22 22 0 1 1 -14 -8" fill="none" stroke="#cbd5e1" stroke-width="4"/>
       <path d="M136 12 v12 h-12" fill="none" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>`,

  12: `<path d="M18 96 a64 64 0 0 1 128 0" fill="none" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round"/>
       <path d="M42 96 a40 40 0 0 1 80 0" fill="none" stroke="ACC" stroke-width="5" stroke-dasharray="10 8" stroke-linecap="round"/>
       <path d="M82 96 L120 56" stroke="ACC" stroke-width="7" stroke-linecap="round"/>
       <circle cx="82" cy="96" r="10" fill="#cbd5e1"/>`,

  13: `<path d="M20 40 H110 a26 26 0 0 1 0 52 H60" fill="none" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round"/>
       <path d="M140 40 L112 26 M140 40 L114 58" fill="none" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round"/>
       <path d="M140 100 H50 a26 26 0 0 1 0 -52 H90" fill="none" stroke="ACC" stroke-width="5" stroke-linecap="round"/>
       <path d="M20 100 L48 86 M20 100 L46 116" fill="none" stroke="ACC" stroke-width="5" stroke-linecap="round"/>`,

  14: `<circle cx="66" cy="54" r="42" fill="none" stroke="#cbd5e1" stroke-width="5"/>
       <path d="M46 56 L62 72 L90 38" fill="none" stroke="ACC" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
       <path d="M96 86 L140 122" stroke="ACC" stroke-width="10" stroke-linecap="round"/>`,

  15: `<path d="M14 112 H150" stroke="#64748b" stroke-width="4" stroke-linecap="round"/>
       <rect x="24" y="76" width="26" height="36" fill="#cbd5e1"/>
       <rect x="62" y="52" width="26" height="60" fill="ACC"/>
       <rect x="100" y="30" width="26" height="82" fill="ACC"/>
       <path d="M20 44 L70 20 L112 8 L148 14" fill="none" stroke="#fbbf24" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,

  16: `<circle cx="80" cy="26" r="18" fill="none" stroke="ACC" stroke-width="5"/>
       <circle cx="32" cy="98" r="18" fill="none" stroke="#cbd5e1" stroke-width="5"/>
       <circle cx="128" cy="98" r="18" fill="none" stroke="#cbd5e1" stroke-width="5"/>
       <path d="M68 40 L44 84 M92 40 L116 84 M50 98 H110" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
       <path d="M80 18 v16 M72 26 h16" stroke="ACC" stroke-width="4" stroke-linecap="round"/>`,

  17: `<circle cx="80" cy="64" r="52" fill="none" stroke="#cbd5e1" stroke-width="4"/>
       <ellipse cx="80" cy="64" rx="24" ry="52" fill="none" stroke="ACC" stroke-width="4"/>
       <path d="M30 44 H130 M30 84 H130" stroke="ACC" stroke-width="3"/>
       <path d="M80 12 V116" stroke="#cbd5e1" stroke-width="3"/>`,

  18: `<rect x="10" y="14" width="144" height="96" rx="10" fill="none" stroke="#cbd5e1" stroke-width="4"/>
       <path d="M10 40 H154" stroke="#cbd5e1" stroke-width="4"/>
       <circle cx="28" cy="27" r="4" fill="ACC"/><circle cx="44" cy="27" r="4" fill="#64748b"/><circle cx="60" cy="27" r="4" fill="#64748b"/>
       <path d="M34 66 L54 84 L34 102" fill="none" stroke="ACC" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
       <path d="M70 102 H116" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round"/>`,

  19: `<path d="M80 14 L148 116 H12 Z" fill="none" stroke="#cbd5e1" stroke-width="5" stroke-linejoin="round"/>
       <path d="M80 54 V86" stroke="ACC" stroke-width="9" stroke-linecap="round"/>
       <circle cx="80" cy="102" r="6" fill="ACC"/>`,

  20: `<rect x="14" y="12" width="56" height="40" rx="6" fill="none" stroke="ACC" stroke-width="4"/>
       <rect x="92" y="12" width="56" height="40" rx="6" fill="none" stroke="#cbd5e1" stroke-width="4"/>
       <rect x="52" y="76" width="56" height="40" rx="6" fill="none" stroke="#cbd5e1" stroke-width="4"/>
       <path d="M42 52 V64 H118 V52 M80 64 V76" stroke="#94a3b8" stroke-width="4" fill="none"/>`
};

/* ---------------- frame ---------------- */

function cover({ w = 640, h = 220, number, label, glyph, accent, glowX = 0.74, glowY = 0.32 }) {
  const glyphBlock = glyph
    ? `<g transform="translate(${Math.round(w * 0.66)},${Math.round(h * 0.16)}) scale(1.05)" stroke-linecap="round" stroke-linejoin="round">${glyph.replaceAll("ACC", accent)}</g>`
    : "";
  const numberBlock = number
    ? `<text x="58" y="${h * 0.55}" font-family="Segoe UI, Arial, sans-serif" font-size="${Math.round(h * 0.32)}" font-weight="800" fill="#f8fafc" fill-opacity="0.96">${number}</text>
       <text x="60" y="${h * 0.75}" font-family="Segoe UI, Arial, sans-serif" font-size="${Math.round(h * 0.085)}" font-weight="700" letter-spacing="6" fill="#94a3b8">${label}</text>
       <rect x="60" y="${h * 0.83}" width="${Math.round(w * 0.11)}" height="6" rx="3" fill="${accent}"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label} cover art">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f172a"/>
      <stop offset="0.55" stop-color="#16203c"/>
      <stop offset="1" stop-color="#1b1740"/>
    </linearGradient>
    <radialGradient id="glow" cx="${glowX}" cy="${glowY}" r="0.85">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.5"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
      <path d="M34 0H0V34" fill="none" stroke="#ffffff" stroke-opacity="0.045"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#grid)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <circle cx="${w * 0.94}" cy="${h * 0.12}" r="3" fill="#ffffff" fill-opacity="0.5"/>
  <circle cx="${w * 0.86}" cy="${h * 0.9}" r="2" fill="#ffffff" fill-opacity="0.35"/>
  <circle cx="${w * 0.62}" cy="${h * 0.08}" r="2.5" fill="#ffffff" fill-opacity="0.3"/>
  ${numberBlock}
  ${glyphBlock}
</svg>
`;
}

/* ---------------- chapter covers ---------------- */

const titles = [
  "DBA Role and Responsibilities", "Database and SQL Fundamentals",
  "Windows Server and Infrastructure", "SQL Server Architecture",
  "Installation and Configuration", "Storage and File Management",
  "Backup and Recovery", "Restore and Disaster Recovery",
  "Security and Permissions", "SQL Server Agent and Automation",
  "Monitoring and Alerting", "Performance Tuning",
  "Blocking and Deadlocks", "Integrity and Corruption",
  "Capacity and Maintenance", "High Availability",
  "Disaster Recovery Technologies", "PowerShell Automation",
  "Production Incident Management", "Enterprise DBA Operations"
];

let n = 0;
for (let i = 1; i <= 20; i++) {
  const accent = accents[(i - 1) % accents.length];
  const svg = cover({
    number: String(i).padStart(2, "0"),
    label: "CHAPTER",
    glyph: glyphs[i],
    accent,
    glowX: 0.76,
    glowY: 0.3
  });
  fs.writeFileSync(path.join(outDir, `ch${String(i).padStart(2, "0")}.svg`), svg, "utf8");
  n++;
}

/* ---------------- hero ---------------- */

const heroAccent = "#7c3aed";
const hero = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 520" role="img" aria-label="SQL Server DBA roadmap hero art">
  <defs>
    <linearGradient id="hbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1120"/>
      <stop offset="1" stop-color="#1a1440"/>
    </linearGradient>
    <radialGradient id="hglow" cx="0.68" cy="0.4" r="0.7">
      <stop offset="0" stop-color="#6366f1" stop-opacity="0.65"/>
      <stop offset="1" stop-color="#6366f1" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="hglow2" cx="0.25" cy="0.85" r="0.6">
      <stop offset="0" stop-color="#22d3ee" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#22d3ee" stop-opacity="0"/>
    </radialGradient>
    <pattern id="hgrid" width="44" height="44" patternUnits="userSpaceOnUse">
      <path d="M44 0H0V44" fill="none" stroke="#ffffff" stroke-opacity="0.05"/>
    </pattern>
  </defs>
  <rect width="1200" height="520" fill="url(#hbg)"/>
  <rect width="1200" height="520" fill="url(#hgrid)"/>
  <rect width="1200" height="520" fill="url(#hglow)"/>
  <rect width="1200" height="520" fill="url(#hglow2)"/>

  <g transform="translate(760,120)">
    <ellipse cx="160" cy="40" rx="150" ry="46" fill="#312e81" stroke="#818cf8" stroke-width="5"/>
    <path d="M10 40 v150 a150 46 0 0 0 300 0 V40" fill="#1e1b4b" stroke="#818cf8" stroke-width="5"/>
    <ellipse cx="160" cy="112" rx="150" ry="46" fill="none" stroke="#818cf8" stroke-width="4" stroke-opacity="0.8"/>
    <ellipse cx="160" cy="176" rx="150" ry="46" fill="none" stroke="#818cf8" stroke-width="4" stroke-opacity="0.8"/>
    <ellipse cx="160" cy="40" rx="150" ry="46" fill="#4338ca" fill-opacity="0.85" stroke="#a5b4fc" stroke-width="5"/>
    <ellipse cx="160" cy="40" rx="96" ry="26" fill="none" stroke="#c7d2fe" stroke-width="3" stroke-opacity="0.7"/>
    <circle cx="160" cy="40" r="10" fill="#e0e7ff"/>
  </g>

  <g stroke="#22d3ee" stroke-width="3" fill="none" stroke-opacity="0.85">
    <path d="M640 210 H720"/>
    <path d="M660 300 H730"/>
    <path d="M700 390 H760"/>
  </g>
  <g fill="#22d3ee">
    <circle cx="640" cy="210" r="7"/><circle cx="660" cy="300" r="7"/><circle cx="700" cy="390" r="7"/>
  </g>
  <g transform="translate(470,150)">
    <rect x="0" y="0" width="150" height="96" rx="10" fill="#0f172a" stroke="#38bdf8" stroke-width="4"/>
    <path d="M18 68 L44 68 L56 42 L70 70 L84 48 L96 62 L130 62" fill="none" stroke="#34d399" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="20" y="120" width="150" height="96" rx="10" fill="#0f172a" stroke="#818cf8" stroke-width="4"/>
    <path d="M40 146 h110 M40 168 h110 M40 190 h74" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
    <path d="M56 146 v44 M96 146 v44" stroke="#475569" stroke-width="3"/>
  </g>

  <g fill="#ffffff" fill-opacity="0.65">
    <circle cx="180" cy="90" r="3"/><circle cx="320" cy="430" r="2.5"/><circle cx="1080" cy="440" r="3"/>
    <circle cx="90" cy="330" r="2"/><circle cx="1010" cy="80" r="2.5"/>
  </g>
  <path d="M0 470 Q300 430 600 460 T1200 440" fill="none" stroke="#818cf8" stroke-width="3" stroke-opacity="0.5"/>
</svg>
`;
fs.writeFileSync(path.join(outDir, "hero.svg"), hero, "utf8");

console.log(`Generated ${n + 1} SVG covers (20 chapters + hero) into assets/img/`);
