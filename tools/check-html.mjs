/* Lightweight structural check: finds mismatched inline/HTML tags in the
   rendered HTML of every content file. Complements audit.mjs.            */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tracked = new Set(["em", "strong", "b", "i", "code", "span", "a", "p", "ul", "ol", "li", "table", "tr", "td", "th", "div", "pre", "h1", "h2", "h3", "h4", "section", "nav"]);
const voids = new Set(["br", "hr", "img", "input", "meta", "link", "path", "rect", "line", "circle", "use", "text", "polygon", "polyline", "ellipse", "stop"]);

function collectHtml(t) {
  let s = t.lead || "";
  for (const o of t.objectives || []) s += o;
  for (const sec of t.sections || []) s += sec.h + (sec.html || "");
  for (const st of t.steps || []) s += st;
  if (t.scenario) s += t.scenario.title + (t.scenario.html || "");
  for (const i of t.interview || []) s += i.q + (i.a || "");
  for (const k of t.takeaways || []) s += k;
  return s;
}

function problems(html) {
  const stack = [];
  const bad = [];
  const re = /<\/?([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g;
  let m;
  while ((m = re.exec(html))) {
    const whole = m[0];
    const tag = m[1].toLowerCase();
    const selfClose = m[2] === "/" || whole.endsWith("/>");
    if (voids.has(tag) || !tracked.has(tag)) continue;
    if (whole.startsWith("</")) {
      if (!stack.length) { bad.push("unexpected closing </" + tag + ">"); continue; }
      const top = stack[stack.length - 1];
      if (top === tag) stack.pop();
      else {
        bad.push("mismatch: expected </" + top + "> but found </" + tag + ">");
        const at = stack.lastIndexOf(tag);
        if (at !== -1) stack.length = at;
      }
    } else if (!selfClose) {
      stack.push(tag);
    }
  }
  if (stack.length) bad.push("unclosed: <" + stack.join(">, <") + ">");
  return bad;
}

let issues = 0;
for (const dir of ["topics", "practicals"]) {
  for (const file of fs.readdirSync(path.join(root, dir)).filter(f => f.endsWith(".js"))) {
    const src = fs.readFileSync(path.join(root, dir, file), "utf8");
    const sb = { window: {} };
    try { new vm.Script(src); vm.runInNewContext(src, sb); } catch (e) { continue; }
    const t = sb.window.TOPIC;
    if (!t) continue;
    const bad = problems(collectHtml(t));
    if (bad.length) {
      issues++;
      console.log(`${dir}/${file}: ${bad.slice(0, 4).join(" | ")}`);
    }
  }
}
console.log(`HTML structure issues: ${issues}`);
