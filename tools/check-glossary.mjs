/* Validate the glossary data files and the shared runtime. */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const jsDir = path.join(root, "assets", "js");
const names = [
  "data.js",
  "glossary-1.js",
  "glossary-2.js",
  "glossary-3.js",
  "glossary-4.js"
];

const ctx = vm.createContext({ window: {}, console });
let syntaxErrors = 0;

for (const name of names) {
  const file = path.join(jsDir, name);
  const src = fs.readFileSync(file, "utf8");
  try {
    new vm.Script(src, { filename: name });
    vm.runInContext(src, ctx, { filename: name });
  } catch (e) {
    syntaxErrors++;
    console.error(`SYNTAX ERROR in ${name}: ${e.message}`);
  }
}

const siteSrc = fs.readFileSync(path.join(jsDir, "site.js"), "utf8");
try {
  new vm.Script(siteSrc, { filename: "site.js" });
} catch (e) {
  syntaxErrors++;
  console.error(`SYNTAX ERROR in site.js: ${e.message}`);
}

const terms = ctx.window.GLOSSARY || [];
const roadmap = ctx.window.DBA_ROADMAP || { chapters: [], practicals: [] };
const ids = new Set();
for (const ch of roadmap.chapters) for (const t of ch.topics) ids.add(t.id);
for (const p of roadmap.practicals) ids.add(p.id);

const problems = [];
const slugs = new Map();

function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

for (const g of terms) {
  const s = slug(g.term);
  if (slugs.has(s)) problems.push(`Duplicate slug "${s}": ${slugs.get(s)} / ${g.term}`);
  slugs.set(s, g.term);

  for (const key of ["term", "cat", "short", "what"]) {
    if (!g[key]) problems.push(`Missing ${key}: ${g.term}`);
    else if (String(g[key]).includes('"')) problems.push(`Double quote in ${key} (breaks data attribute): ${g.term}`);
  }
  if (!g.how || !g.how.length) problems.push(`No implementation steps: ${g.term}`);
  if (!g.see || !g.see.length) problems.push(`No roadmap links: ${g.term}`);
  for (const ref of g.see || []) {
    if (!ids.has(ref)) problems.push(`Unknown lesson id "${ref}" in: ${g.term}`);
  }
  for (const f of g.faq || []) {
    if (!f.q || !f.a) problems.push(`Incomplete FAQ in: ${g.term}`);
  }
}

const cats = [...new Set(terms.map((g) => g.cat))];
console.log(`Glossary entries: ${terms.length}`);
console.log(`Categories: ${cats.length} -> ${cats.join(", ")}`);
console.log(`DBCC CHECKDB present: ${terms.some((g) => slug(g.term) === "dbcc-checkdb")}`);
console.log(`Syntax errors: ${syntaxErrors}`);
console.log(`Data problems: ${problems.length}`);
problems.forEach((p) => console.log("  - " + p));
if (syntaxErrors || problems.length) process.exit(1);
