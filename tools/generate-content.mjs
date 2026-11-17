/* Generates schema-compliant topic content files for every topic in data.js
   that does not yet have one. Uses the local knowledge base (knowledge-1..4)
   so generation needs no external provider.
   Usage: node tools/generate-content.mjs                                   */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { K1 } from "./knowledge-1.mjs";
import { K2 } from "./knowledge-2.mjs";
import { K3 } from "./knowledge-3.mjs";
import { K4 } from "./knowledge-4.mjs";
import { addQuizToSource } from "./topic-quiz-generator.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const K = { ...K1, ...K2, ...K3, ...K4 };

/* ---------------- load data.js ---------------- */
const dataSrc = fs.readFileSync(path.join(root, "assets", "js", "data.js"), "utf8");
const dsb = { window: {} };
vm.runInNewContext(dataSrc, dsb);
const roadmap = dsb.window.DBA_ROADMAP;

const topicsDir = path.join(root, "topics");

/* ---------------- helpers ---------------- */
function rot(arr, n) {
  if (!arr || !arr.length) return arr || [];
  const k = ((n % arr.length) + arr.length) % arr.length;
  return arr.slice(k).concat(arr.slice(0, k));
}
function shortLabel(title, max = 30) {
  return title.length > max ? title.slice(0, max - 1) + "…" : title;
}
function q(s) { return JSON.stringify(String(s)); }

/* Emit a JS template-literal string field, one physical line per HTML line. */
function emitHtmlField(L, indent, fieldName, html) {
  L.push(`${indent}${fieldName}: \``);
  for (const line of html.split("\n")) L.push(line);
  L.push(`${indent}\`,`);
}

/* ---------------- SVG diagram builders (3 variants) ---------------- */
function buildSvg(topic, ch, variant) {
  const v = ch.vocab;
  const label = shortLabel(topic.title, 30);
  const marker = "ga";
  const defs = `    <defs>
      <marker id="${marker}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>`;
  const box = (x, y, w, h, t1, t2, fill, stroke) => `    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${fill}" stroke="${stroke}"${stroke === "var(--border)" ? "" : ' stroke-width="2"'}/>
    <text x="${x + w / 2}" y="${y + (t2 ? 22 : h / 2 + 5)}" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">${t1}</text>${t2 ? `
    <text x="${x + w / 2}" y="${y + 42}" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">${t2}</text>` : ""}`;
  const line = (x1, y1, x2, y2) => `    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#${marker})"/>`;
  const cap = `  <div class="figcaption">Figure 1 — ${ch.theme.charAt(0).toUpperCase() + ch.theme.slice(1)}: how ${topic.title} relates to the core concepts.</div>`;

  if (variant === 0) {
    // hub and spoke
    const pos = [[24, 18], [536, 18], [24, 138], [536, 138], [24, 258], [536, 258]];
    let s = `<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="${label} concept map">
${defs}`;
    s += `
${box(280, 140, 200, 60, label, "", "var(--accent)", "var(--accent)")}`;
    v.forEach((word, i) => {
      const [x, y] = pos[i];
      s += `
${box(x, y, 200, 56, word, `key aspect ${i + 1}`, "var(--surface-2)", "var(--border)")}`;
    });
    const cx = 380, cy = 170;
    [[124, 46], [636, 46], [124, 166], [636, 166], [124, 286], [636, 286]].forEach(([x, y]) => {
      s += `
${line(cx, cy, x, y)}`;
    });
    s += `
  </svg>
${cap}
</div>`;
    return s;
  }

  if (variant === 1) {
    // linear flow
    let s = `<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="${label} flow">
${defs}`;
    v.forEach((word, i) => {
      const y = 12 + i * 54;
      s += `
${box(230, y, 300, 44, `${i + 1}. ${word}`, "", i === v.length - 1 ? "var(--accent-soft)" : "var(--surface-2)", i === v.length - 1 ? "var(--accent)" : "var(--border)")}`;
    });
    for (let i = 0; i < v.length - 1; i++) s += `
${line(380, 56 + i * 54, 380, 66 + i * 54)}`;
    s += `
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">${label}</text>
  </svg>
${cap}
</div>`;
    return s;
  }

  // variant 2: layered stack
  let s = `<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="${label} layers">
${defs}`;
  v.forEach((word, i) => {
    const w = 620 - i * 60;
    const x = (760 - w) / 2;
    const y = 8 + i * 54;
    s += `
${box(x, y, w, 46, word, `layer ${i + 1}`, i % 2 ? "var(--accent-soft)" : "var(--surface-2)", i % 2 ? "var(--accent)" : "var(--border)")}`;
  });
  s += `
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">${label}</text>
  </svg>
${cap}
</div>`;
  return s;
}

function tableHtml(flat) {
  const cols = 3;
  const rows = [];
  for (let i = 0; i < flat.length; i += cols) rows.push(flat.slice(i, i + cols));
  let s = "<table>";
  rows.forEach((row, i) => {
    const tag = i === 0 ? "th" : "td";
    s += "\n  <tr>" + row.map(c => `<${tag}>${c}</${tag}>`).join("") + "</tr>";
  });
  s += "\n</table>";
  return s;
}

function codeHtml(c, topic) {
  return `<pre><code class="language-${c.lang}">-- ${topic.title}\n${c.body}</code></pre>`;
}

/* ---------------- build one topic file ---------------- */
function buildTopic(topic, chapter, index) {
  const ch = K[chapter.id];
  const paras = ch.paras;
  const p = rot(paras, index);
  const variant = index % 3;
  const L = [];

  L.push("/* Topic content file — one JS file per topic.");
  L.push(`   Rendered by assets/js/site.js on topics/${topic.id}.html */`);
  L.push("");
  L.push("window.TOPIC = {");
  L.push(`  id: ${q(topic.id)},`);
  L.push(`  title: ${q(topic.title)},`);
  L.push("");

  const leads = [
    `${topic.title} is a core part of ${ch.theme}. This topic explains what it is, how it works inside SQL Server, and what a production DBA must know to operate it safely.`,
    `Understanding ${topic.title} is essential for anyone responsible for ${ch.theme}. Here we examine the mechanics, the production implications and the practical decisions involved.`,
    `This topic covers ${topic.title} — a concept you will meet repeatedly when working with ${ch.theme}. We build from first principles to production guidance.`
  ];
  L.push(`  lead: ${q(leads[index % leads.length])},`);
  L.push("");

  L.push("  objectives: [");
  const objs = [
    `Define what ${topic.title} is and where it fits`,
    `Explain how ${topic.title} works internally`,
    `Apply ${topic.title} correctly in a production environment`,
    `Recognise the common mistakes and risks involving ${topic.title}`,
    `Monitor and troubleshoot ${topic.title} with the right tools`
  ];
  objs.forEach((o, i) => L.push(`    ${q(o)}${i < objs.length - 1 ? "," : ""}`));
  L.push("  ],");
  L.push("");

  L.push("  sections: [");

  // Section 1
  L.push("    {");
  L.push(`      h: ${q("What " + topic.title + " means")},`);
  let s1 = `<p>In this topic we examine <strong>${topic.title}</strong> within ${ch.theme}. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>${p[0]}</p>
<p>${p[1]}</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>${topic.title} is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>`;
  emitHtmlField(L, "      ", "html", s1);
  L.push("    },");

  // Section 2 (SVG)
  L.push("    {");
  L.push(`      h: ${q("Where " + topic.title + " fits")},`);
  let s2 = `<p>${p[2]}</p>
<p>The diagram below places ${topic.title} alongside the core concepts of ${ch.theme}. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
${buildSvg(topic, ch, variant)}`;
  emitHtmlField(L, "      ", "html", s2);
  L.push("    },");

  // Section 3 (table)
  L.push("    {");
  L.push(`      h: ${q(topic.title + " in practice")},`);
  let s3 = `<p>${p[3]}</p>
<p>The following comparison captures the distinctions that matter most when working with ${topic.title}:</p>
${tableHtml(ch.tables[0])}
<p>${p[4]}</p>`;
  emitHtmlField(L, "      ", "html", s3);
  L.push("    },");

  // Section 4 (code)
  L.push("    {");
  L.push(`      h: ${q("Working with " + topic.title)},`);
  let s4 = `<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to ${topic.title}. Run them first on a non-production instance and adapt paths and names to your environment.</p>
${codeHtml(ch.code[0], topic)}
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
${codeHtml(ch.code[1], topic)}
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
${codeHtml(ch.code[2], topic)}
<p>${p[5]}</p>`;
  emitHtmlField(L, "      ", "html", s4);
  L.push("    },");

  // Section 5 (pitfalls + table)
  L.push("    {");
  L.push(`      h: ${q("Pitfalls and production guidance")},`);
  let s5 = `<p>${p[6]}</p>
${tableHtml(ch.tables[1])}
<p>${p[7]}</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With ${topic.title}, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>`;
  emitHtmlField(L, "      ", "html", s5);
  L.push("    }");
  L.push("  ],");
  L.push("");

  // Scenario
  const sc = rot(ch.scenarios, index)[0];
  L.push("  scenario: {");
  L.push(`    title: ${q(sc[0])},`);
  let sh = `${sc[1]}
<p><strong>The ${topic.title} lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>`;
  emitHtmlField(L, "    ", "html", sh);
  L.push("  },");
  L.push("");

  // Interview
  L.push("  interview: [");
  const ivs = rot(ch.interviews, index).slice(0, 3);
  ivs.forEach((it, i) => {
    L.push("    {");
    L.push(`      q: ${q(it[0])},`);
    emitHtmlField(L, "      ", "a", it[1]);
    L.push(`    }${i < ivs.length - 1 ? "," : ""}`);
  });
  L.push("  ],");
  L.push("");

  // Takeaways
  L.push("  takeaways: [");
  const tks = [
    `${topic.title} is a fundamental concept in ${ch.theme}`,
    `Understanding its mechanics lets you diagnose symptoms instead of guessing`,
    `Correct configuration and monitoring of ${topic.title} improves reliability and performance`,
    `Avoid the common pitfalls — test changes, keep rollback paths and measure results`,
    `Use the catalog views, DMVs and commands shown here to verify what the server is actually doing`
  ];
  tks.forEach((t, i) => L.push(`    ${q(t)}${i < tks.length - 1 ? "," : ""}`));
  L.push("  ]");
  L.push("};");

  return addQuizToSource(L.join("\n") + "\n");
}

/* ---------------- main ---------------- */
const FORCE = process.argv.includes("--force") || process.env.FORCE === "1";
let created = 0, skipped = 0;
for (const chapter of roadmap.chapters) {
  chapter.topics.forEach((topic, index) => {
    const file = path.join(topicsDir, `${topic.id}.js`);
    if (fs.existsSync(file) && !FORCE) { skipped++; return; }
    if (!K[chapter.id]) throw new Error("No knowledge base for " + chapter.id);
    fs.writeFileSync(file, buildTopic(topic, chapter, index), "utf8");
    created++;
  });
}
console.log(`Topics: ${FORCE ? "regenerated" : "created"} ${created}, skipped ${skipped}.`);
