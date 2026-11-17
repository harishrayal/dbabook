/* Generates the practical (lab) content files that are still missing.
   Structured knowledge -> full schema-compliant content JS, using a
   line-by-line emitter so template literals stay safe.
   Usage: node tools/generate-practicals.mjs [--force]                */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { P1 } from "./pk-a.mjs";
import { P2 } from "./pk-b.mjs";
import { P3 } from "./pk-c.mjs";
import { P4 } from "./pk-d.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P = { ...P1, ...P2, ...P3, ...P4 };

const dataSrc = fs.readFileSync(path.join(root, "assets", "js", "data.js"), "utf8");
const dsb = { window: {} };
vm.runInNewContext(dataSrc, dsb);
const roadmap = dsb.window.DBA_ROADMAP;
const titles = {};
for (const p of roadmap.practicals) titles[p.id] = p.title;

const dir = path.join(root, "practicals");
const q = (s) => JSON.stringify(String(s));

function emitHtmlField(L, indent, name, html) {
  L.push(`${indent}${name}: \``);
  for (const line of String(html).split("\n")) L.push(line);
  L.push(`${indent}\`,`);
}

function buildSvg(d) {
  const nodes = d.diagram.nodes;
  const marker = "pa";
  let s = `<div class="figure">\n  <svg viewBox="0 0 760 340" role="img" aria-label="${d.diagram.label}">`;
  s += `\n    <defs>\n      <marker id="${marker}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">\n        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>\n      </marker>\n    </defs>`;
  nodes.forEach((n, i) => {
    const y = 10 + i * 54;
    const last = i === nodes.length - 1;
    const fill = last ? "var(--accent-soft)" : "var(--surface-2)";
    const stroke = last ? "var(--accent)" : "var(--border)";
    s += `\n    <rect x="200" y="${y}" width="360" height="44" rx="9" fill="${fill}" stroke="${stroke}"/>`;
    s += `\n    <text x="380" y="${y + 21}" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">${i + 1}. ${n}</text>`;
    if (i < nodes.length - 1) s += `\n    <line x1="380" y1="${y + 44}" x2="380" y2="${y + 54}" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#${marker})"/>`;
  });
  s += `\n    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">${d.diagram.label}</text>`;
  s += `\n  </svg>\n  <div class="figcaption">Figure 1 — ${d.diagram.caption}</div>\n</div>`;
  return s;
}

function tableHtml(flat) {
  let s = "<table>";
  for (let i = 0; i < flat.length; i += 3) {
    const row = flat.slice(i, i + 3);
    const tag = i === 0 ? "th" : "td";
    s += "\n  <tr>" + row.map((c) => `<${tag}>${c}</${tag}>`).join("") + "</tr>";
  }
  return s + "\n</table>";
}

function codeHtml(c) {
  const prefix = c.lang === "sql" ? "-- Lab step" : "# Lab step";
  return `<pre><code class="language-${c.lang}">${prefix}\n${c.body}</code></pre>`;
}

function build(d) {
  const L = [];
  L.push("/* Practical content file — one JS file per practical lab.");
  L.push(`   Rendered by assets/js/site.js on practicals/${d.id}.html */`);
  L.push("");
  L.push("window.TOPIC = {");
  L.push(`  id: ${q(d.id)},`);
  L.push(`  title: ${q(titles[d.id])},`);
  L.push("");
  L.push(`  lead: ${q(d.lead)},`);
  L.push("");

  L.push("  objectives: [");
  d.objectives.forEach((o, i) => L.push(`    ${q(o)}${i < d.objectives.length - 1 ? "," : ""}`));
  L.push("  ],");
  L.push("");

  L.push("  sections: [");

  // 1. Before you start
  L.push("    {");
  L.push("      h: \"Before you start\",");
  let s1 = `<p>${d.paras[0]}</p>\n<p>${d.paras[1]}</p>\n<p><strong>Environment check</strong> — confirm where you are before changing anything; this habit prevents production mistakes:</p>\n${codeHtml(d.code[0])}`;
  emitHtmlField(L, "      ", "html", s1);
  L.push("    },");

  // 2. Lab architecture (SVG)
  L.push("    {");
  L.push("      h: \"Lab architecture\",");
  let s2 = `<p>${d.paras[2]}</p>\n${buildSvg(d)}\n<p>${d.paras[3]}</p>`;
  emitHtmlField(L, "      ", "html", s2);
  L.push("    },");

  // 3. Core tasks (table + code)
  L.push("    {");
  L.push("      h: \"Core tasks\",");
  let s3 = `<p>${d.paras[4]}</p>\n${tableHtml(d.tables[0])}\n<p>${d.paras[5]}</p>\n${codeHtml(d.code[1])}`;
  emitHtmlField(L, "      ", "html", s3);
  L.push("    },");

  // 4. Verification (code + paras)
  L.push("    {");
  L.push("      h: \"Verify your work\",");
  let s4 = `<p>Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:</p>\n${codeHtml(d.code[2])}\n<p>${d.paras[6]}</p>\n<p>If the output differs, stop and correct it before moving on. A lab that 'looks right' but was never verified teaches the wrong lessons.</p>`;
  emitHtmlField(L, "      ", "html", s4);
  L.push("    },");

  // 5. Pitfalls
  L.push("    {");
  L.push("      h: \"Pitfalls and safe practice\",");
  let s5 = `<p>${d.paras[7]}</p>\n${tableHtml(d.tables[1])}\n<div class="callout warning">\n  <div class="callout-label">Production caution</div>\n  <p>Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.</p>\n</div>`;
  emitHtmlField(L, "      ", "html", s5);
  L.push("    }");
  L.push("  ],");
  L.push("");

  // steps
  L.push("  steps: [");
  d.steps.forEach((st, i) => L.push(`    ${q(st)}${i < d.steps.length - 1 ? "," : ""}`));
  L.push("  ],");
  L.push("");

  // scenario
  L.push("  scenario: {");
  L.push(`    title: ${q(d.scenario[0])},`);
  let sh = `${d.scenario[1]}\n<p><strong>The lesson:</strong> practise both the diagnosis and the safe mitigation in this lab. Under pressure, the steps you have rehearsed are the steps you will actually take — build good muscle memory now.</p>`;
  emitHtmlField(L, "    ", "html", sh);
  L.push("  },");
  L.push("");

  // interview
  L.push("  interview: [");
  d.interview.forEach((it, i) => {
    L.push("    {");
    L.push(`      q: ${q(it[0])},`);
    emitHtmlField(L, "      ", "a", it[1]);
    L.push(`    }${i < d.interview.length - 1 ? "," : ""}`);
  });
  L.push("  ],");
  L.push("");

  // takeaways
  L.push("  takeaways: [");
  d.takeaways.forEach((t, i) => L.push(`    ${q(t)}${i < d.takeaways.length - 1 ? "," : ""}`));
  L.push("  ]");
  L.push("};");
  return L.join("\n") + "\n";
}

const FORCE = process.argv.includes("--force");
let created = 0, skipped = 0;
for (const id of Object.keys(titles)) {
  if (id === "practical-01") continue;
  const file = path.join(dir, `${id}.js`);
  if (fs.existsSync(file) && !FORCE) { skipped++; continue; }
  const d = P[id];
  if (!d) throw new Error("No knowledge for " + id);
  fs.writeFileSync(file, build({ ...d, id }), "utf8");
  created++;
}
console.log(`Practicals: ${FORCE ? "regenerated" : "created"} ${created}, skipped ${skipped}.`);
