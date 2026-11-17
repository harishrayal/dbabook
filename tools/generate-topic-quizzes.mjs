import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { addQuizToSource, createTopicQuiz } from "./topic-quiz-generator.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataSource = fs.readFileSync(path.join(root, "assets", "js", "data.js"), "utf8");
const dataSandbox = { window: {} };
vm.runInNewContext(dataSource, dataSandbox);
const roadmap = dataSandbox.window.DBA_ROADMAP;
const force = process.argv.includes("--force");
const updates = [];

const entries = [];
roadmap.chapters.forEach(function (chapter) {
  chapter.topics.forEach(function (topic) {
    entries.push({ id: topic.id, dir: "topics" });
  });
});
roadmap.practicals.forEach(function (practical) {
  entries.push({ id: practical.id, dir: "practicals" });
});

entries.forEach(function (entry) {
  const file = path.join(root, entry.dir, entry.id + ".js");
  const source = fs.readFileSync(file, "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox);
  const topic = sandbox.window.TOPIC;
  if (!topic) throw new Error(entry.id + " does not define window.TOPIC.");

  if (Array.isArray(topic.quiz) && !force) {
    if (topic.quiz.length < 10) {
      throw new Error(entry.id + " has fewer than 10 quiz questions.");
    }
    return;
  }

  const quiz = createTopicQuiz(topic);
  if (quiz.length < 10) throw new Error(entry.id + " has fewer than 10 generated questions.");
  const updatedSource = addQuizToSource(source);
  new vm.Script(updatedSource, { filename: file });
  const updatedSandbox = { window: {} };
  vm.runInNewContext(updatedSource, updatedSandbox);
  if (updatedSandbox.window.TOPIC.quiz.length !== 10) {
    throw new Error(entry.id + " quiz failed validation after insertion.");
  }
  updates.push({ file, source: updatedSource });
});

updates.forEach(function (update) {
  fs.writeFileSync(update.file, update.source, "utf8");
});

console.log("Added 10 lesson-based questions to " + updates.length + " content files.");
