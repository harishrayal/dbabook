/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch04-22.html */

window.TOPIC = {
  id: "ch04-22",
  title: "Crash Recovery: Analysis, Redo, and Undo",

  lead: "Crash Recovery: Analysis, Redo, and Undo is a core part of SQL Server internal architecture. This topic explains what it is, how it works inside SQL Server, and what a production DBA must know to operate it safely.",

  objectives: [
    "Define what Crash Recovery: Analysis, Redo, and Undo is and where it fits",
    "Explain how Crash Recovery: Analysis, Redo, and Undo works internally",
    "Apply Crash Recovery: Analysis, Redo, and Undo correctly in a production environment",
    "Recognise the common mistakes and risks involving Crash Recovery: Analysis, Redo, and Undo",
    "Monitor and troubleshoot Crash Recovery: Analysis, Redo, and Undo with the right tools"
  ],

  sections: [
    {
      h: "What Crash Recovery: Analysis, Redo, and Undo means",
      html: `
<p>In this topic we examine <strong>Crash Recovery: Analysis, Redo, and Undo</strong> within SQL Server internal architecture. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Crash recovery has three phases: analysis determines the state at the last checkpoint, redo replays committed transactions, and undo rolls back uncommitted ones. The database is brought to a consistent state automatically at startup.</p>
<p>The relational engine parses, compiles and executes queries. Plans are cached and reused; parameterisation and the plan cache are central to understanding consistent versus intermittent performance.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Crash Recovery: Analysis, Redo, and Undo is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Crash Recovery: Analysis, Redo, and Undo fits",
      html: `
<p>Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too many VLFs.</p>
<p>The diagram below places Crash Recovery: Analysis, Redo, and Undo alongside the core concepts of SQL Server internal architecture. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Crash Recovery: Analysis, Red… concept map">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="280" y="140" width="200" height="60" rx="9" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="175" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Crash Recovery: Analysis, Red…</text>
    <rect x="24" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Page</text>
    <text x="124" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 1</text>
    <rect x="536" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Extent</text>
    <text x="636" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 2</text>
    <rect x="24" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Buffer</text>
    <text x="124" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 3</text>
    <rect x="536" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Log</text>
    <text x="636" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 4</text>
    <rect x="24" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Checkpoint</text>
    <text x="124" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 5</text>
    <rect x="536" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Recovery</text>
    <text x="636" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 6</text>
    <line x1="380" y1="170" x2="124" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
  </svg>
  <div class="figcaption">Figure 1 — SQL Server internal architecture: how Crash Recovery: Analysis, Redo, and Undo relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Crash Recovery: Analysis, Redo, and Undo in practice",
      html: `
<p>SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O. Eight pages form an extent. Data and index pages live in MDF/NDF files; the transaction log is a separate sequential structure of virtual log files.</p>
<p>The following comparison captures the distinctions that matter most when working with Crash Recovery: Analysis, Redo, and Undo:</p>
<table>
  <tr><th>Structure</th><th>Size</th><th>Role</th></tr>
  <tr><td>Page</td><td>8 KB</td><td>Unit of data I/O</td></tr>
  <tr><td>Extent</td><td>64 KB (8 pages)</td><td>Allocation unit</td></tr>
  <tr><td>VLF</td><td>Variable</td><td>Log truncation unit</td></tr>
</table>
<p>The buffer pool caches pages in memory. A read that finds a page in the pool is served from RAM in microseconds; a miss requires a physical read milliseconds long. This is why memory sizing dominates performance.</p>
      `,
    },
    {
      h: "Working with Crash Recovery: Analysis, Redo, and Undo",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Crash Recovery: Analysis, Redo, and Undo. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Crash Recovery: Analysis, Redo, and Undo
-- Buffer pool usage per database
SELECT db_name(database_id) AS db,
       count(*) * 8 / 1024 AS buffer_mb
FROM   sys.dm_os_buffer_descriptors
GROUP BY database_id
ORDER BY buffer_mb DESC;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Crash Recovery: Analysis, Redo, and Undo
-- Transaction log space usage
SELECT total_log_size_in_bytes / 1048576.0 AS total_mb,
       used_log_space_in_bytes / 1048576.0 AS used_mb,
       used_log_space_in_percent AS used_pct
FROM   sys.dm_db_log_space_usage;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Crash Recovery: Analysis, Redo, and Undo
-- VLF count per database (a high count hurts recovery)
SELECT db_name(database_id) AS db,
       count(*) AS vlf_count
FROM   sys.dm_db_log_info(NULL)
GROUP BY database_id
ORDER BY vlf_count DESC;</code></pre>
<p>Pages in the buffer pool are clean if they match disk, dirty if modified. Checkpoints write dirty pages to disk to bound recovery time; the lazy writer evicts pages under memory pressure, flushing dirty pages first.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Write-ahead logging guarantees the log record for a change reaches disk before the data page. A committed transaction's log is durable even if the data page is not yet written, which is what makes crash recovery possible.</p>
<table>
  <tr><th>Mechanism</th><th>Trigger</th><th>Effect</th></tr>
  <tr><td>Checkpoint</td><td>Periodic / log volume</td><td>Flush dirty pages, bound recovery</td></tr>
  <tr><td>Lazy writer</td><td>Memory pressure</td><td>Evict clean pages</td></tr>
  <tr><td>Write-ahead log</td><td>Every modification</td><td>Log durable before data</td></tr>
</table>
<p>The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs). Truncation marks inactive VLFs reusable; it does not shrink the physical file. Frequent small autogrowths create VLF explosion and slow recovery.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Crash Recovery: Analysis, Redo, and Undo, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    }
  ],

  scenario: {
    title: "PLE collapsed after a report went live",
    html: `
A new unbounded report pulled millions of cold pages into the buffer pool, evicting hot OLTP pages. Page life expectancy fell from 4,200 to under 30 seconds and applications slowed despite idle CPU. The DBA killed the report, added date predicates and an indexed view, and capped reporting with Resource Governor.
<p><strong>The Crash Recovery: Analysis, Redo, and Undo lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "What is a page and an extent?",
      a: `
A page is an 8 KB unit of data storage and I/O; an extent is eight contiguous pages (64 KB), the unit SQL Server uses to allocate space to objects.
      `,
    },
    {
      q: "Explain write-ahead logging.",
      a: `
The log record describing a change is written to disk before the modified data page. This guarantees committed transactions are recoverable after a crash, becauseredo can replay the log.
      `,
    },
    {
      q: "Why is a huge VLF count a problem?",
      a: `
Recovery must process every VLF during analysis and redo, so thousands of small VLFs dramatically lengthen recovery and slow log operations; pre-size logs in large increments to avoid VLF explosion.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server internal architecture.”",
      "options": [
        "The relational engine parses, compiles and executes queries.",
        "Crash Recovery: Analysis, Redo, and Undo is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole…",
        "Crash Recovery: Analysis, Redo, and Undo"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Crash Recovery: Analysis, Redo, and Undo within SQL Server internal architecture. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Crash Recovery: Analysis, Redo, and Undo fits”?",
      "options": [
        "Crash Recovery: Analysis, Redo, and Undo is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole…",
        "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too…",
        "The relational engine parses, compiles and executes queries."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too many VLFs.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Crash Recovery: Analysis, Redo, and Undo in practice”?",
      "options": [
        "SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O.",
        "Crash Recovery: Analysis, Redo, and Undo is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole…",
        "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O. Eight pages form an extent. Data and index pages live in MDF/NDF files; the transaction log is a separate sequential structure of virtual log files.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Crash Recovery: Analysis, Redo, and Undo”?",
      "options": [
        "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too…",
        "The diagram below places Crash Recovery: Analysis, Redo, and Undo alongside the core concepts of SQL Server internal architecture.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Crash Recovery: Analysis, Redo, and Undo. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O.",
        "Write-ahead logging guarantees the log record for a change reaches disk before the data page.",
        "The diagram below places Crash Recovery: Analysis, Redo, and Undo alongside the core concepts of SQL Server internal architecture."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Write-ahead logging guarantees the log record for a change reaches disk before the data page. A committed transaction's log is durable even if the data page is not yet written, which is what makes crash recovery possible.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Crash Recovery: Analysis, Redo, and Undo means”?",
      "options": [
        "Crash recovery has three phases: analysis determines the state at the last checkpoint, redo replays committed transactions, and undo rolls back uncommitted ones.",
        "Allocation unit",
        "Log truncation unit"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Crash recovery has three phases: analysis determines the state at the last checkpoint, redo replays committed transactions, and undo rolls back uncommitted ones. The database is brought to a consistent state automatically at startup.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Crash Recovery: Analysis, Redo, and Undo fits”?",
      "options": [
        "Unit of data I/O",
        "Allocation unit",
        "The diagram below places Crash Recovery: Analysis, Redo, and Undo alongside the core concepts of SQL Server internal architecture."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Crash Recovery: Analysis, Redo, and Undo alongside the core concepts of SQL Server internal architecture. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Crash Recovery: Analysis, Redo, and Undo in practice”?",
      "options": [
        "Pages in the buffer pool are clean if they match disk, dirty if modified.",
        "The following comparison captures the distinctions that matter most when working with Crash Recovery: Analysis, Redo, and Undo:",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Crash Recovery: Analysis, Redo, and Undo:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Crash Recovery: Analysis, Redo, and Undo”?",
      "options": [
        "The first example establishes the relevant state.",
        "Unit of data I/O",
        "Allocation unit"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Allocation unit",
        "Log truncation unit",
        "The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs)."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs). Truncation marks inactive VLFs reusable; it does not shrink the physical file. Frequent small autogrowths create VLF explosion and slow recovery.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server internal architecture.”",
      "options": [
        "The relational engine parses, compiles and executes queries.",
        "Crash Recovery: Analysis, Redo, and Undo is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole…",
        "Crash Recovery: Analysis, Redo, and Undo"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Crash Recovery: Analysis, Redo, and Undo within SQL Server internal architecture. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Crash Recovery: Analysis, Redo, and Undo fits”?",
      "options": [
        "Crash Recovery: Analysis, Redo, and Undo is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole…",
        "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too…",
        "The relational engine parses, compiles and executes queries."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too many VLFs.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Crash Recovery: Analysis, Redo, and Undo in practice”?",
      "options": [
        "SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O.",
        "Crash Recovery: Analysis, Redo, and Undo is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole…",
        "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O. Eight pages form an extent. Data and index pages live in MDF/NDF files; the transaction log is a separate sequential structure of virtual log files.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Crash Recovery: Analysis, Redo, and Undo”?",
      "options": [
        "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too…",
        "The diagram below places Crash Recovery: Analysis, Redo, and Undo alongside the core concepts of SQL Server internal architecture.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Crash Recovery: Analysis, Redo, and Undo. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O.",
        "Write-ahead logging guarantees the log record for a change reaches disk before the data page.",
        "The diagram below places Crash Recovery: Analysis, Redo, and Undo alongside the core concepts of SQL Server internal architecture."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Write-ahead logging guarantees the log record for a change reaches disk before the data page. A committed transaction's log is durable even if the data page is not yet written, which is what makes crash recovery possible.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Crash Recovery: Analysis, Redo, and Undo means”?",
      "options": [
        "Crash recovery has three phases: analysis determines the state at the last checkpoint, redo replays committed transactions, and undo rolls back uncommitted ones.",
        "Allocation unit",
        "Log truncation unit"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Crash recovery has three phases: analysis determines the state at the last checkpoint, redo replays committed transactions, and undo rolls back uncommitted ones. The database is brought to a consistent state automatically at startup.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Crash Recovery: Analysis, Redo, and Undo fits”?",
      "options": [
        "Unit of data I/O",
        "Allocation unit",
        "The diagram below places Crash Recovery: Analysis, Redo, and Undo alongside the core concepts of SQL Server internal architecture."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Crash Recovery: Analysis, Redo, and Undo alongside the core concepts of SQL Server internal architecture. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Crash Recovery: Analysis, Redo, and Undo in practice”?",
      "options": [
        "Pages in the buffer pool are clean if they match disk, dirty if modified.",
        "The following comparison captures the distinctions that matter most when working with Crash Recovery: Analysis, Redo, and Undo:",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Crash Recovery: Analysis, Redo, and Undo:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Crash Recovery: Analysis, Redo, and Undo”?",
      "options": [
        "The first example establishes the relevant state.",
        "Unit of data I/O",
        "Allocation unit"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Allocation unit",
        "Log truncation unit",
        "The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs)."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs). Truncation marks inactive VLFs reusable; it does not shrink the physical file. Frequent small autogrowths create VLF explosion and slow recovery.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server internal architecture.”",
      "options": [
        "The relational engine parses, compiles and executes queries.",
        "Crash Recovery: Analysis, Redo, and Undo is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole…",
        "Crash Recovery: Analysis, Redo, and Undo"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Crash Recovery: Analysis, Redo, and Undo within SQL Server internal architecture. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Crash Recovery: Analysis, Redo, and Undo fits”?",
      "options": [
        "Crash Recovery: Analysis, Redo, and Undo is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole…",
        "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too…",
        "The relational engine parses, compiles and executes queries."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too many VLFs.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Crash Recovery: Analysis, Redo, and Undo in practice”?",
      "options": [
        "SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O.",
        "Crash Recovery: Analysis, Redo, and Undo is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole…",
        "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O. Eight pages form an extent. Data and index pages live in MDF/NDF files; the transaction log is a separate sequential structure of virtual log files.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Crash Recovery: Analysis, Redo, and Undo”?",
      "options": [
        "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too…",
        "The diagram below places Crash Recovery: Analysis, Redo, and Undo alongside the core concepts of SQL Server internal architecture.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Crash Recovery: Analysis, Redo, and Undo. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O.",
        "Write-ahead logging guarantees the log record for a change reaches disk before the data page.",
        "The diagram below places Crash Recovery: Analysis, Redo, and Undo alongside the core concepts of SQL Server internal architecture."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Write-ahead logging guarantees the log record for a change reaches disk before the data page. A committed transaction's log is durable even if the data page is not yet written, which is what makes crash recovery possible.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Crash Recovery: Analysis, Redo, and Undo means”?",
      "options": [
        "Crash recovery has three phases: analysis determines the state at the last checkpoint, redo replays committed transactions, and undo rolls back uncommitted ones.",
        "Allocation unit",
        "Log truncation unit"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Crash recovery has three phases: analysis determines the state at the last checkpoint, redo replays committed transactions, and undo rolls back uncommitted ones. The database is brought to a consistent state automatically at startup.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Crash Recovery: Analysis, Redo, and Undo fits”?",
      "options": [
        "Unit of data I/O",
        "Allocation unit",
        "The diagram below places Crash Recovery: Analysis, Redo, and Undo alongside the core concepts of SQL Server internal architecture."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Crash Recovery: Analysis, Redo, and Undo alongside the core concepts of SQL Server internal architecture. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Crash Recovery: Analysis, Redo, and Undo in practice”?",
      "options": [
        "Pages in the buffer pool are clean if they match disk, dirty if modified.",
        "The following comparison captures the distinctions that matter most when working with Crash Recovery: Analysis, Redo, and Undo:",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Crash Recovery: Analysis, Redo, and Undo:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Crash Recovery: Analysis, Redo, and Undo”?",
      "options": [
        "The first example establishes the relevant state.",
        "Unit of data I/O",
        "Allocation unit"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Allocation unit",
        "Log truncation unit",
        "The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs)."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs). Truncation marks inactive VLFs reusable; it does not shrink the physical file. Frequent small autogrowths create VLF explosion and slow recovery.”"
    }
  ],
  takeaways: [
    "Crash Recovery: Analysis, Redo, and Undo is a fundamental concept in SQL Server internal architecture",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Crash Recovery: Analysis, Redo, and Undo improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
