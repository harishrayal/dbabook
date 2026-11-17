/* Generates the thin HTML shell for every topic and practical page
   from assets/js/data.js, so shells are always consistent.
   Usage: node tools/generate-shells.mjs                                    */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(root, "assets", "js", "data.js");

// Evaluate the browser-style data file in a plain scope.
const src = fs.readFileSync(dataPath, "utf8");
const sandbox = {};
new Function("window", src)(sandbox);
const roadmap = sandbox.DBA_ROADMAP;

if (!roadmap) throw new Error("Could not load DBA_ROADMAP from data.js");

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shell({ id, title, description, contentSrc, outPath, eyebrow }) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} — SQL Server DBA Roadmap</title>
  <meta name="description" content="${esc(description)}">
  <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body data-page="topic" data-id="${id}">
  <noscript>
    <div class="noscript" style="margin:80px 20px 20px;max-width:760px;margin-inline:auto">
      This topic page requires JavaScript to render its content
      (<code>${esc(contentSrc)}</code>).
    </div>
  </noscript>

  <header class="topbar">
    <button class="icon-btn hamburger" id="hamburger" aria-label="Open menu">☰</button>
    <a class="brand" href="../index.html">
      <span class="logo">DBA</span>
      <span class="brand-text">SQL Server DBA Roadmap
        <span class="brand-sub">${esc(eyebrow)}</span>
      </span>
    </a>
    <div class="topbar-spacer"></div>
    <div class="search">
      <input class="search-input" id="searchInput" type="search" placeholder="Search topics… e.g. deadlock" autocomplete="off">
      <div class="search-results" id="searchResults"></div>
    </div>
    <button class="icon-btn" id="themeBtn" title="Toggle light/dark theme">◐</button>
  </header>

  <div class="layout">
    <aside class="sidebar" id="sidebar"></aside>
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <main class="main" id="main">
      <h1>${esc(title)}</h1>
      <p>${esc(description)}</p>
    </main>
  </div>

  <script src="../assets/js/data.js"></script>
  <script src="${contentSrc}"></script>
  <script src="../assets/js/site.js"></script>
</body>
</html>
`;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, "utf8");
}

let count = 0;

for (const ch of roadmap.chapters) {
  const chapterLabel = `Chapter ${String(ch.num).padStart(2, "0")} · ${ch.title}`;
  for (const t of ch.topics) {
    shell({
      id: t.id,
      title: t.title,
      description: `${t.title} — ${chapterLabel}. Part of the SQL Server DBA Learning Roadmap.`,
      contentSrc: `${t.id}.js`,
      outPath: path.join(root, "topics", `${t.id}.html`),
      eyebrow: chapterLabel
    });
    count++;
  }
}

for (const p of roadmap.practicals) {
  const label = `Practical ${String(p.num).padStart(2, "0")} · ${p.title}`;
  shell({
    id: p.id,
    title: p.title,
    description: `${p.title} — hands-on lab ${p.num} of 12 in the SQL Server DBA roadmap practical phase.`,
    contentSrc: `${p.id}.js`,
    outPath: path.join(root, "practicals", `${p.id}.html`),
    eyebrow: label
  });
  count++;
}

console.log(`Generated ${count} page shells (${roadmap.chapters.length} chapters, ${roadmap.practicals.length} practicals).`);
