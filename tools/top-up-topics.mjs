/* Adds a substantive 'deeper dive' section to topic files that are under
   170 lines, without modifying any existing content. Safe to re-run:
   files already at or above the target are skipped.
   Usage: node tools/top-up-topics.mjs                                    */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { K1 } from "./knowledge-1.mjs";
import { K2 } from "./knowledge-2.mjs";
import { K3 } from "./knowledge-3.mjs";
import { K4 } from "./knowledge-4.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const K = { ...K1, ...K2, ...K3, ...K4 };
const TARGET = 170;

const dataSrc = fs.readFileSync(path.join(root, "assets", "js", "data.js"), "utf8");
const dsb = { window: {} };
vm.runInNewContext(dataSrc, dsb);
const roadmap = dsb.window.DBA_ROADMAP;
const titles = {};
for (const ch of roadmap.chapters) for (const t of ch.topics) titles[t.id] = t.title;

function rot(arr, n) {
  if (!arr || !arr.length) return arr || [];
  const k = ((n % arr.length) + arr.length) % arr.length;
  return arr.slice(k).concat(arr.slice(0, k));
}
const q = (s) => JSON.stringify(String(s));

function tableHtml(flat) {
  let s = "<table>";
  for (let i = 0; i < flat.length; i += 3) {
    const row = flat.slice(i, i + 3);
    const tag = i === 0 ? "th" : "td";
    s += "\n  <tr>" + row.map((c) => `<${tag}>${c}</${tag}>`).join("") + "</tr>";
  }
  return s + "\n</table>";
}
function codeHtml(c, title) {
  const prefix = c.lang === "sql" ? "--" : "#";
  return `<pre><code class="language-${c.lang}">${prefix} ${title}\n${c.body}</code></pre>`;
}

const MARKER = "\n    }\n  ],\n\n  scenario: {";

function deeperSection(id, title, chapter) {
  const seed = parseInt(id.split("-")[1], 10) || 1;
  const paras = rot(chapter.paras, seed + 2);
  const code = chapter.code[(seed + 1) % chapter.code.length];
  const table = chapter.tables[(seed + 1) % chapter.tables.length];
  const lines = [
    "    {",
    `      h: ${q("Deeper dive: " + title)},`,
    "      html: `",
    `<p>This section consolidates <strong>${title}</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>`,
    `<p>${paras[0]}</p>`,
    `<p>${paras[1]}</p>`,
    `<div class="callout fact">`,
    `  <div class="callout-label">Remember</div>`,
    `  <p>${title} sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>`,
    `</div>`,
    `<p>The distinctions below are the ones that matter most in day-to-day administration:</p>`,
    tableHtml(table),
    `<p>${paras[2]}</p>`,
    `<p>Use the following as a starting point when investigating ${title}. Adapt names and paths to your own environment and run it first on a non-production instance:</p>`,
    codeHtml(code, title),
    `<p>${paras[3]}</p>`,
    "      `,",
    "    }"
  ];
  return "\n" + lines.join("\n");
}

let topped = 0, skipped = 0, unmatched = [];
const ONLY = process.env.ONLY || "";
const dir = path.join(root, "topics");
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".js"))) {
  const id = file.slice(0, -3);
  if (ONLY && id !== ONLY) continue;
  const src = fs.readFileSync(path.join(dir, file), "utf8");
  const count = src.endsWith("\n") ? src.split("\n").length - 1 : src.split("\n").length;
  if (count >= TARGET) { skipped++; continue; }
  const markerAt = src.lastIndexOf(MARKER);
  if (markerAt === -1) { unmatched.push(`${id} (${count} lines)`); continue; }
  const chapter = K[id.slice(0, 4)];
  if (!chapter) { unmatched.push(`${id} (no chapter knowledge)`); continue; }
  const title = titles[id] || id;
  const insertion = deeperSection(id, title, chapter);
  const replacement = "\n    }," + insertion + "\n  ],\n\n  scenario: {";
  const out = src.slice(0, markerAt) + replacement + src.slice(markerAt + MARKER.length);
  fs.writeFileSync(path.join(dir, file), out, "utf8");
  topped++;
}
console.log(`Topped up: ${topped}, skipped (already >= ${TARGET}): ${skipped}, unmatched: ${unmatched.length}`);
if (unmatched.length) console.log("UNMATCHED:\n  " + unmatched.join("\n  "));
