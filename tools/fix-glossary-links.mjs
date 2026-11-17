/* One-off fixer: point every glossary "see" array at the correct real lesson. */

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const jsDir = path.join(root, "assets", "js");

const maps = {
  "glossary-1.js": [
    ["ch04-11", "ch04-12", "ch14-04"],
    ["ch04-11", "ch06-09"],
    ["ch04-06", "ch04-13", "ch11-06"],
    ["ch04-17", "ch04-18", "ch07-05"],
    ["ch04-15", "ch04-14", "ch04-22"],
    ["ch04-19", "ch06-10", "ch19-09"],
    ["ch04-20", "ch07-16", "ch08-03"],
    ["ch07-15", "ch07-16", "ch19-09"],
    ["ch06-01", "ch06-04", "ch06-06"],
    ["ch06-02", "ch06-03", "ch04-09"],
    ["ch06-19", "ch06-20", "ch11-10"],
    ["ch12-06", "ch02-10", "ch12-07"],
    ["ch12-07", "ch12-10", "practical-07"],
    ["ch12-14", "ch12-15", "ch12-21"],
    ["ch12-03", "ch12-05", "practical-07"],
    ["ch12-17", "ch12-18", "ch12-26"],
    ["ch12-18", "ch12-17", "practical-07"],
    ["ch12-19", "ch12-20", "ch12-21"],
    ["ch12-20", "ch12-28", "practical-07"],
    ["ch13-05", "ch13-01", "practical-08"],
    ["ch13-01", "ch13-03", "ch13-04", "practical-08"],
    ["ch13-18", "ch13-19", "ch13-20", "practical-08"],
    ["ch13-11", "ch13-16", "ch13-17"],
    ["ch02-13", "ch02-14", "practical-01"],
    ["ch08-19", "ch08-20", "practical-04"]
  ],
  "glossary-2.js": [
    ["ch02-04", "ch02-09", "practical-01"],
    ["ch02-05", "ch02-09", "practical-01"],
    ["ch02-09", "ch13-05", "practical-01"],
    ["ch02-09", "ch15-14", "practical-01"],
    ["ch02-09", "ch15-14", "practical-03"],
    ["ch02-04", "ch02-06", "practical-01"],
    ["ch06-01", "ch06-02", "ch06-15", "practical-02"],
    ["ch02-05", "ch02-06", "practical-01"],
    ["ch02-05", "ch02-07", "practical-01"],
    ["ch02-06", "practical-01"],
    ["ch02-11", "ch09-16", "practical-01"],
    ["ch02-11", "ch12-19", "practical-01"],
    ["ch02-11", "ch09-15", "practical-01"],
    ["ch02-13", "ch02-14", "practical-01"],
    ["ch02-09", "practical-01"],
    ["ch02-09", "practical-01"],
    ["ch13-23", "ch13-04", "practical-08"],
    ["practical-08", "ch13-01"],
    ["ch12-02", "ch12-21", "practical-07"],
    ["ch14-08", "ch14-16", "ch10-14"],
    ["ch11-02", "ch04-02", "practical-04"],
    ["ch11-18", "ch11-02", "practical-06"],
    ["ch10-01", "ch10-04", "ch11-19"],
    ["ch12-16", "ch02-09"]
  ],
  "glossary-3.js": [
    ["ch14-08", "ch14-16", "ch15-12", "practical-09"],
    ["ch14-09", "ch14-16", "practical-09"],
    ["ch14-10", "ch14-16", "practical-09"],
    ["ch14-16", "ch14-02", "practical-09"],
    ["ch13-04", "ch13-23", "practical-08"],
    ["ch19-09", "ch06-10", "ch13-05"],
    ["ch06-16", "ch06-17", "practical-02"],
    ["ch04-08", "ch12-19", "ch12-28"],
    ["ch07-02", "ch07-03", "ch07-31", "practical-03"],
    ["ch07-05", "ch07-15", "ch07-16", "practical-03"],
    ["ch08-03", "ch08-04", "ch08-10", "practical-04"],
    ["ch07-13", "ch07-14", "ch07-30"],
    ["ch07-32", "ch08-27", "ch20-22"],
    ["ch07-19", "ch08-12", "practical-03"],
    ["ch14-12", "ch14-15", "ch19-11"]
  ],
  "glossary-4.js": [
    ["ch12-11", "ch12-12", "ch12-13", "practical-07"],
    ["ch12-14", "ch12-15", "ch15-11"],
    ["ch10-01", "ch10-04", "ch10-06", "practical-05"],
    ["ch15-09", "ch10-12", "ch15-20"],
    ["ch09-06", "ch09-07", "ch09-08", "practical-04"],
    ["ch09-19", "ch09-13", "ch09-12"],
    ["ch07-11", "ch09-25", "ch20-24"],
    ["ch16-08", "ch16-09", "ch16-17", "ch16-19"],
    ["ch16-05", "ch16-06", "ch16-07"],
    ["ch17-03", "ch17-04", "ch17-08"],
    ["ch18-01", "ch18-09", "ch18-10", "ch18-19"],
    ["ch17-01", "ch20-11", "ch20-24"]
  ]
};

for (const [name, replacements] of Object.entries(maps)) {
  const file = path.join(jsDir, name);
  let src = fs.readFileSync(file, "utf8");
  let i = 0;
  src = src.replace(/(\n\s*)see:\s*\[[^\]]*\]/g, (full, lead) => {
    const ids = replacements[i++];
    if (!ids) throw new Error(`No replacement ${i} for ${name}`);
    return lead + "see: [" + ids.map((id) => JSON.stringify(id)).join(", ") + "]";
  });
  if (i !== replacements.length) {
    throw new Error(`${name}: replaced ${i} of ${replacements.length} see arrays`);
  }
  fs.writeFileSync(file, src, "utf8");
  console.log(`${name}: updated ${i} cross-reference arrays`);
}
