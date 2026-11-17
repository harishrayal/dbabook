/* Audit content files against data.js: ids, titles, syntax, schema. */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// load roadmap data
const dataSrc = fs.readFileSync(path.join(root, "assets", "js", "data.js"), "utf8");
const dataSandbox = { window: {} };
vm.runInNewContext(dataSrc, dataSandbox);
const roadmap = dataSandbox.window.DBA_ROADMAP;

const expected = [];
for (const ch of roadmap.chapters) for (const t of ch.topics) expected.push({ ...t, type: "topic" });
for (const p of roadmap.practicals) expected.push({ ...p, type: "practical" });

let missing = [], badTitle = [], noFile = [], schemaBad = [];

for (const e of expected) {
  const dir = e.type === "topic" ? "topics" : "practicals";
  const file = path.join(root, dir, `${e.id}.js`);
  if (!fs.existsSync(file)) { missing.push(e.id); continue; }

  const src = fs.readFileSync(file, "utf8");
  // syntax check
  try { new vm.Script(src, { filename: file }); }
  catch (err) { noFile.push(`${e.id} (SYNTAX: ${err.message.split("\n")[0]})`); continue; }

  // load TOPIC
  const sb = { window: {} };
  try { vm.runInNewContext(src, sb); } catch (e2) { noFile.push(`${e.id} (LOAD: ${e2.message})`); continue; }
  const t = sb.window.TOPIC;
  if (!t) { schemaBad.push(`${e.id} (no window.TOPIC)`); continue; }
  if (t.id !== e.id) schemaBad.push(`${e.id} (id mismatch: ${t.id})`);
  if (t.title !== e.title) badTitle.push(`${e.id}: expected "${e.title}" got "${t.title}"`);

  const missingFields = [];
  if (!t.lead) missingFields.push("lead");
  if (!Array.isArray(t.objectives) || t.objectives.length < 3) missingFields.push("objectives");
  if (!Array.isArray(t.sections) || t.sections.length < 3) missingFields.push("sections");
  if (!t.scenario) missingFields.push("scenario");
  if (!Array.isArray(t.interview) || t.interview.length < 2) missingFields.push("interview");
  if (!Array.isArray(t.takeaways) || t.takeaways.length < 4) missingFields.push("takeaways");
  if (!Array.isArray(t.quiz) || t.quiz.length < 10) {
    missingFields.push("quiz (at least 10 questions)");
  } else {
    t.quiz.forEach((q, index) => {
      if (!q.question || !q.explanation || !Array.isArray(q.options) || q.options.length < 3 ||
          !Number.isInteger(q.answerIndex) || q.answerIndex < 0 || q.answerIndex >= q.options.length ||
          new Set(q.options).size !== q.options.length) {
        missingFields.push(`quiz question ${index + 1} (invalid question, options, or answer)`);
      }
    });
  }
  const allHtml = (t.sections || []).map(s => s.html || "").join("") + (t.scenario?.html || "");
  if (!allHtml.includes("<svg")) missingFields.push("svg-figure");
  if (!/<pre><code/.test(allHtml)) missingFields.push("code-block");
  if (missingFields.length) schemaBad.push(`${e.id} (missing: ${missingFields.join(", ")})`);
}

console.log(`EXPECTED: ${expected.length}`);
console.log(`MISSING FILES (${missing.length}): ${missing.join(", ")}`);
console.log(`BROKEN/UNLOADABLE (${noFile.length}): ${noFile.join(" | ")}`);
console.log(`TITLE MISMATCH (${badTitle.length}):`);
badTitle.forEach(x => console.log("  " + x));
console.log(`SCHEMA ISSUES (${schemaBad.length}):`);
schemaBad.forEach(x => console.log("  " + x));

// group missing by chapter
const byCh = {};
for (const id of missing) { const ch = id.slice(0, 4); byCh[ch] = (byCh[ch] || 0) + 1; }
console.log("MISSING BY CHAPTER:", JSON.stringify(byCh));
