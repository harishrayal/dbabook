import vm from "node:vm";

const entities = {
  amp: "&",
  apos: "'",
  bull: "•",
  gt: ">",
  hellip: "…",
  lt: "<",
  mdash: "—",
  nbsp: " ",
  ndash: "–",
  quot: "\"",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“"
};

function text(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(?:p|li|div|tr|blockquote|h[1-6])\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, function (_, code) {
      return String.fromCodePoint(parseInt(code, 16));
    })
    .replace(/&#(\d+);/g, function (_, code) {
      return String.fromCodePoint(Number(code));
    })
    .replace(/&([a-z]+);/gi, function (match, entity) {
      return Object.prototype.hasOwnProperty.call(entities, entity.toLowerCase())
        ? entities[entity.toLowerCase()]
        : match;
    })
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function compact(value, limit) {
  const content = text(value);
  if (content.length <= limit) return content;
  const boundary = content.lastIndexOf(" ", limit - 1);
  return content.slice(0, boundary > 0 ? boundary : limit - 1) + "…";
}

function firstSentence(value) {
  const content = text(value);
  const sentences = content.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g) || [content];
  return sentences.map(function (sentence) { return sentence.trim(); }).find(Boolean) || content;
}

function sentenceWith(value, phrase) {
  const content = text(value);
  const sentences = content.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g) || [content];
  return sentences.map(function (sentence) { return sentence.trim(); })
    .find(function (sentence) { return sentence.toLowerCase().includes(phrase.toLowerCase()); }) || content;
}

function clozeSnippet(statement, phrase) {
  const maxLength = 260;
  const index = statement.toLowerCase().indexOf(phrase.toLowerCase());
  if (statement.length <= maxLength || index < 0) return statement;
  const start = Math.max(0, index - 115);
  const end = Math.min(statement.length, index + phrase.length + 140);
  const adjustedStart = start > 0 ? statement.indexOf(" ", start) + 1 : 0;
  const adjustedEnd = end < statement.length ? statement.lastIndexOf(" ", end) : statement.length;
  return (adjustedStart > 0 ? "…" : "") +
    statement.slice(adjustedStart, adjustedEnd > adjustedStart ? adjustedEnd : end).trim() +
    (adjustedEnd < statement.length ? "…" : "");
}

function emphasizedTerms(html) {
  return Array.from(String(html || "").matchAll(/<(strong|em)\b[^>]*>([\s\S]*?)<\/\1>/gi))
    .map(function (match) { return text(match[2]); })
    .filter(function (term) { return term.length >= 3 && term.length <= 90; });
}

function tableRows(html) {
  return Array.from(String(html || "").matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi))
    .flatMap(function (tableMatch, tableIndex) {
      const rows = Array.from(tableMatch[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi))
        .map(function (rowMatch) {
          return {
            hasHeader: /<th\b/i.test(rowMatch[1]),
            cells: Array.from(rowMatch[1].matchAll(/<(?:th|td)\b[^>]*>([\s\S]*?)<\/(?:th|td)>/gi))
              .map(function (cellMatch) { return text(cellMatch[1]); })
          };
        })
        .filter(function (row) { return row.cells.length >= 2 && row.cells.every(Boolean); });
      const headers = rows.length && rows[0].hasHeader ? rows.shift().cells : [];
      return rows.map(function (row) {
        return {
          cells: row.cells,
          column: headers[row.cells.length - 1] || "Details",
          tableIndex: tableIndex
        };
      });
    });
}

function candidatesForSection(section, sectionIndex) {
  const html = String(section.html || "");
  const candidates = [];

  Array.from(html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)).forEach(function (match, index) {
    const paragraph = match[1];
    const statement = text(paragraph);
    if (statement.length < 35) return;

    const term = emphasizedTerms(paragraph)[0];
    if (term && statement.toLowerCase().includes(term.toLowerCase())) {
      const sentence = clozeSnippet(sentenceWith(statement, term), term);
      const phraseIndex = sentence.toLowerCase().indexOf(term.toLowerCase());
      if (phraseIndex >= 0) {
        candidates.push({
          type: "cloze",
          section: section.h,
          sectionIndex: sectionIndex,
          sourceIndex: index,
          answer: term,
          question: "Complete the lesson statement: “" +
            sentence.slice(0, phraseIndex) + "_____" +
            sentence.slice(phraseIndex + term.length) + "”",
          explanation: "The lesson states: “" + statement + "”"
        });
        return;
      }
    }

    candidates.push({
      type: "fact",
      section: section.h,
      sectionIndex: sectionIndex,
      sourceIndex: index,
      answer: compact(firstSentence(statement), 180),
      question: "Which fact is covered in the lesson section “" + text(section.h) + "”?",
      explanation: "The section explains: “" + statement + "”"
    });
  });

  const rows = tableRows(html);
  rows.forEach(function (row, index) {
    const key = row.cells[0];
    const answer = row.cells[row.cells.length - 1];
    candidates.push({
      type: "table",
      section: section.h,
      sectionIndex: sectionIndex,
      sourceIndex: index,
      key: key,
      answer: compact(answer, 180),
      column: row.column,
      tableAnswers: rows.filter(function (sibling) {
        return sibling.tableIndex === row.tableIndex;
      }).map(function (sibling) {
        return compact(sibling.cells[sibling.cells.length - 1], 180);
      }),
      question: "In the “" + text(section.h) + "” table, what is listed for “" +
        key + "” under “" + row.column + "”?",
      explanation: "The lesson’s table lists “" + key + "” as “" + answer + "”."
    });
  });

  return candidates;
}

function unique(values, excluded) {
  const seen = new Set([String(excluded || "").toLowerCase()]);
  return values.filter(function (value) {
    const normalized = text(value);
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildChoices(candidate, selected, allCandidates, terms, seed, index) {
  const correct = compact(candidate.answer, 180);
  let pool;
  if (candidate.type === "cloze") {
    pool = terms;
  } else if (candidate.type === "table") {
    pool = candidate.tableAnswers;
  } else {
    pool = allCandidates
      .filter(function (other) { return other.sectionIndex !== candidate.sectionIndex; })
      .map(function (other) { return compact(other.answer, 180); });
  }

  pool = unique(pool.concat(
    allCandidates.filter(function (other) { return other !== candidate; })
      .map(function (other) { return compact(other.answer, 180); }),
    terms
  ), correct);

  if (pool.length < 2) {
    throw new Error("Not enough lesson-based distractors for " + candidate.question);
  }

  const start = (seed + index) % pool.length;
  const options = [correct];
  for (let offset = 0; offset < pool.length && options.length < 3; offset++) {
    const choice = pool[(start + offset) % pool.length];
    if (!options.some(function (option) { return option.toLowerCase() === choice.toLowerCase(); })) {
      options.push(choice);
    }
  }
  if (options.length !== 3) {
    throw new Error("Could not build three distinct answer options for " + candidate.question);
  }

  const shift = (seed + index) % options.length;
  const shuffled = options.slice(shift).concat(options.slice(0, shift));
  return {
    options: shuffled,
    answerIndex: shuffled.findIndex(function (option) {
      return option.toLowerCase() === correct.toLowerCase();
    })
  };
}

export function createTopicQuiz(topic) {
  const sections = topic.sections || [];
  const allCandidates = sections.flatMap(candidatesForSection);
  const terms = unique(sections.flatMap(function (section) {
    return emphasizedTerms(section.html);
  }), "");
  const groups = sections.map(function (section, sectionIndex) {
    return allCandidates.filter(function (candidate) {
      return candidate.sectionIndex === sectionIndex;
    });
  });
  const selected = [];

  for (let depth = 0; selected.length < 10; depth++) {
    let found = false;
    groups.forEach(function (group) {
      if (group[depth] && selected.length < 10) {
        selected.push(group[depth]);
        found = true;
      }
    });
    if (!found) break;
  }

  if (selected.length < 10) {
    throw new Error(topic.id + " has only " + selected.length + " lesson question sources; 10 required.");
  }

  const suffix = String(topic.id).match(/\d+$/);
  const seed = suffix ? parseInt(suffix[0], 10) : 0;
  return selected.map(function (candidate, index) {
    const choices = buildChoices(candidate, selected, allCandidates, terms, seed, index);
    return {
      question: candidate.question,
      options: choices.options,
      answerIndex: choices.answerIndex,
      explanation: candidate.explanation
    };
  });
}

export function addQuizToSource(source) {
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox);
  const topic = sandbox.window.TOPIC;
  if (!topic) throw new Error("Content file does not define window.TOPIC.");

  const quiz = createTopicQuiz(topic);
  const match = source.match(/^([ \t]*)takeaways\s*:/m);
  if (!match) throw new Error(topic.id + " has no takeaways field for quiz insertion.");
  const indent = match[1];
  const formattedQuiz = JSON.stringify(quiz, null, 2).replace(/\n/g, "\n" + indent);
  return source.replace(/^([ \t]*)takeaways\s*:/m, function (_, fieldIndent) {
    return fieldIndent + "quiz: " + formattedQuiz + ",\n" + fieldIndent + "takeaways:";
  });
}
