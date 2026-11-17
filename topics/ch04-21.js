/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch04-21.html */

window.TOPIC = {
  id: "ch04-21",
  title: "SQL Server Startup and Shutdown",

  lead: "This topic covers SQL Server Startup and Shutdown — a concept you will meet repeatedly when working with SQL Server internal architecture. We build from first principles to production guidance.",

  objectives: [
    "Define what SQL Server Startup and Shutdown is and where it fits",
    "Explain how SQL Server Startup and Shutdown works internally",
    "Apply SQL Server Startup and Shutdown correctly in a production environment",
    "Recognise the common mistakes and risks involving SQL Server Startup and Shutdown",
    "Monitor and troubleshoot SQL Server Startup and Shutdown with the right tools"
  ],

  sections: [
    {
      h: "What SQL Server Startup and Shutdown means",
      html: `
<p>In this topic we examine <strong>SQL Server Startup and Shutdown</strong> within SQL Server internal architecture. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs). Truncation marks inactive VLFs reusable; it does not shrink the physical file. Frequent small autogrowths create VLF explosion and slow recovery.</p>
<p>Crash recovery has three phases: analysis determines the state at the last checkpoint, redo replays committed transactions, and undo rolls back uncommitted ones. The database is brought to a consistent state automatically at startup.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>SQL Server Startup and Shutdown is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where SQL Server Startup and Shutdown fits",
      html: `
<p>The relational engine parses, compiles and executes queries. Plans are cached and reused; parameterisation and the plan cache are central to understanding consistent versus intermittent performance.</p>
<p>The diagram below places SQL Server Startup and Shutdown alongside the core concepts of SQL Server internal architecture. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="SQL Server Startup and Shutdo… layers">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="70" y="8" width="620" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="30" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Page</text>
    <text x="380" y="50" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 1</text>
    <rect x="100" y="62" width="560" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="84" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Extent</text>
    <text x="380" y="104" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 2</text>
    <rect x="130" y="116" width="500" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="138" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Buffer</text>
    <text x="380" y="158" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 3</text>
    <rect x="160" y="170" width="440" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="192" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Log</text>
    <text x="380" y="212" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 4</text>
    <rect x="190" y="224" width="380" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="246" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Checkpoint</text>
    <text x="380" y="266" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 5</text>
    <rect x="220" y="278" width="320" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="300" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Recovery</text>
    <text x="380" y="320" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 6</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">SQL Server Startup and Shutdo…</text>
  </svg>
  <div class="figcaption">Figure 1 — SQL Server internal architecture: how SQL Server Startup and Shutdown relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "SQL Server Startup and Shutdown in practice",
      html: `
<p>Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too many VLFs.</p>
<p>The following comparison captures the distinctions that matter most when working with SQL Server Startup and Shutdown:</p>
<table>
  <tr><th>Structure</th><th>Size</th><th>Role</th></tr>
  <tr><td>Page</td><td>8 KB</td><td>Unit of data I/O</td></tr>
  <tr><td>Extent</td><td>64 KB (8 pages)</td><td>Allocation unit</td></tr>
  <tr><td>VLF</td><td>Variable</td><td>Log truncation unit</td></tr>
</table>
<p>SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O. Eight pages form an extent. Data and index pages live in MDF/NDF files; the transaction log is a separate sequential structure of virtual log files.</p>
      `,
    },
    {
      h: "Working with SQL Server Startup and Shutdown",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Startup and Shutdown. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- SQL Server Startup and Shutdown
-- Buffer pool usage per database
SELECT db_name(database_id) AS db,
       count(*) * 8 / 1024 AS buffer_mb
FROM   sys.dm_os_buffer_descriptors
GROUP BY database_id
ORDER BY buffer_mb DESC;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- SQL Server Startup and Shutdown
-- Transaction log space usage
SELECT total_log_size_in_bytes / 1048576.0 AS total_mb,
       used_log_space_in_bytes / 1048576.0 AS used_mb,
       used_log_space_in_percent AS used_pct
FROM   sys.dm_db_log_space_usage;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- SQL Server Startup and Shutdown
-- VLF count per database (a high count hurts recovery)
SELECT db_name(database_id) AS db,
       count(*) AS vlf_count
FROM   sys.dm_db_log_info(NULL)
GROUP BY database_id
ORDER BY vlf_count DESC;</code></pre>
<p>The buffer pool caches pages in memory. A read that finds a page in the pool is served from RAM in microseconds; a miss requires a physical read milliseconds long. This is why memory sizing dominates performance.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Pages in the buffer pool are clean if they match disk, dirty if modified. Checkpoints write dirty pages to disk to bound recovery time; the lazy writer evicts pages under memory pressure, flushing dirty pages first.</p>
<table>
  <tr><th>Mechanism</th><th>Trigger</th><th>Effect</th></tr>
  <tr><td>Checkpoint</td><td>Periodic / log volume</td><td>Flush dirty pages, bound recovery</td></tr>
  <tr><td>Lazy writer</td><td>Memory pressure</td><td>Evict clean pages</td></tr>
  <tr><td>Write-ahead log</td><td>Every modification</td><td>Log durable before data</td></tr>
</table>
<p>Write-ahead logging guarantees the log record for a change reaches disk before the data page. A committed transaction's log is durable even if the data page is not yet written, which is what makes crash recovery possible.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With SQL Server Startup and Shutdown, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: SQL Server Startup and Shutdown",
      html: `
<p>This section consolidates <strong>SQL Server Startup and Shutdown</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too many VLFs.</p>
<p>SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O. Eight pages form an extent. Data and index pages live in MDF/NDF files; the transaction log is a separate sequential structure of virtual log files.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>SQL Server Startup and Shutdown sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Structure</th><th>Size</th><th>Role</th></tr>
  <tr><td>Page</td><td>8 KB</td><td>Unit of data I/O</td></tr>
  <tr><td>Extent</td><td>64 KB (8 pages)</td><td>Allocation unit</td></tr>
  <tr><td>VLF</td><td>Variable</td><td>Log truncation unit</td></tr>
</table>
<p>The buffer pool caches pages in memory. A read that finds a page in the pool is served from RAM in microseconds; a miss requires a physical read milliseconds long. This is why memory sizing dominates performance.</p>
<p>Use the following as a starting point when investigating SQL Server Startup and Shutdown. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- SQL Server Startup and Shutdown
-- Transaction log space usage
SELECT total_log_size_in_bytes / 1048576.0 AS total_mb,
       used_log_space_in_bytes / 1048576.0 AS used_mb,
       used_log_space_in_percent AS used_pct
FROM   sys.dm_db_log_space_usage;</code></pre>
<p>Pages in the buffer pool are clean if they match disk, dirty if modified. Checkpoints write dirty pages to disk to bound recovery time; the lazy writer evicts pages under memory pressure, flushing dirty pages first.</p>
      `,
    }
  ],

  scenario: {
    title: "Recovery that took three hours",
    html: `
After a crash, a 2 TB database took three hours to recover. Investigation found over 15,000 VLFs caused by thousands of 1 MB autogrowths. The fix: pre-size the log in large increments to a sensible VLF count, then shrink and regrow once during a maintenance window. Recovery time returned to minutes.
<p><strong>The SQL Server Startup and Shutdown lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "Why is a huge VLF count a problem?",
      a: `
Recovery must process every VLF during analysis and redo, so thousands of small VLFs dramatically lengthen recovery and slow log operations; pre-size logs in large increments to avoid VLF explosion.
      `,
    },
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
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server internal architecture.”",
      "options": [
        "SQL Server Startup and Shutdown",
        "SQL Server Startup and Shutdown sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine SQL Server Startup and Shutdown within SQL Server internal architecture. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Startup and Shutdown fits”?",
      "options": [
        "Use the following as a starting point when investigating SQL Server Startup and Shutdown.",
        "The diagram below places SQL Server Startup and Shutdown alongside the core concepts of SQL Server internal architecture.",
        "The relational engine parses, compiles and executes queries."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The relational engine parses, compiles and executes queries. Plans are cached and reused; parameterisation and the plan cache are central to understanding consistent versus intermittent performance.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Startup and Shutdown in practice”?",
      "options": [
        "SQL Server Startup and Shutdown",
        "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too…",
        "The following comparison captures the distinctions that matter most when working with SQL Server Startup and Shutdown:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too many VLFs.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Startup and Shutdown”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "SQL Server Startup and Shutdown",
        "The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs)."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Startup and Shutdown. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs).",
        "Crash recovery has three phases: analysis determines the state at the last checkpoint, redo replays committed transactions, and undo rolls back uncommitted ones.",
        "Pages in the buffer pool are clean if they match disk, dirty if modified."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Pages in the buffer pool are clean if they match disk, dirty if modified. Checkpoints write dirty pages to disk to bound recovery time; the lazy writer evicts pages under memory pressure, flushing dirty pages first.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The relational engine parses, compiles and executes queries.",
        "SQL Server Startup and Shutdown",
        "SQL Server Startup and Shutdown is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates SQL Server Startup and Shutdown with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SQL Server Startup and Shutdown means”?",
      "options": [
        "The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs).",
        "The following comparison captures the distinctions that matter most when working with SQL Server Startup and Shutdown:",
        "SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs). Truncation marks inactive VLFs reusable; it does not shrink the physical file. Frequent small autogrowths create VLF explosion and slow recovery.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Startup and Shutdown fits”?",
      "options": [
        "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too…",
        "The following comparison captures the distinctions that matter most when working with SQL Server Startup and Shutdown:",
        "The diagram below places SQL Server Startup and Shutdown alongside the core concepts of SQL Server internal architecture."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places SQL Server Startup and Shutdown alongside the core concepts of SQL Server internal architecture. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Startup and Shutdown in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Startup and Shutdown:",
        "The diagram below places SQL Server Startup and Shutdown alongside the core concepts of SQL Server internal architecture."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SQL Server Startup and Shutdown:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Startup and Shutdown”?",
      "options": [
        "The first example establishes the relevant state.",
        "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too…",
        "The following comparison captures the distinctions that matter most when working with SQL Server Startup and Shutdown:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server internal architecture.”",
      "options": [
        "SQL Server Startup and Shutdown",
        "SQL Server Startup and Shutdown sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine SQL Server Startup and Shutdown within SQL Server internal architecture. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Startup and Shutdown fits”?",
      "options": [
        "Use the following as a starting point when investigating SQL Server Startup and Shutdown.",
        "The diagram below places SQL Server Startup and Shutdown alongside the core concepts of SQL Server internal architecture.",
        "The relational engine parses, compiles and executes queries."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The relational engine parses, compiles and executes queries. Plans are cached and reused; parameterisation and the plan cache are central to understanding consistent versus intermittent performance.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Startup and Shutdown in practice”?",
      "options": [
        "SQL Server Startup and Shutdown",
        "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too…",
        "The following comparison captures the distinctions that matter most when working with SQL Server Startup and Shutdown:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too many VLFs.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Startup and Shutdown”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "SQL Server Startup and Shutdown",
        "The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs)."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Startup and Shutdown. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs).",
        "Crash recovery has three phases: analysis determines the state at the last checkpoint, redo replays committed transactions, and undo rolls back uncommitted ones.",
        "Pages in the buffer pool are clean if they match disk, dirty if modified."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Pages in the buffer pool are clean if they match disk, dirty if modified. Checkpoints write dirty pages to disk to bound recovery time; the lazy writer evicts pages under memory pressure, flushing dirty pages first.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The relational engine parses, compiles and executes queries.",
        "SQL Server Startup and Shutdown",
        "SQL Server Startup and Shutdown is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates SQL Server Startup and Shutdown with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SQL Server Startup and Shutdown means”?",
      "options": [
        "The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs).",
        "The following comparison captures the distinctions that matter most when working with SQL Server Startup and Shutdown:",
        "SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs). Truncation marks inactive VLFs reusable; it does not shrink the physical file. Frequent small autogrowths create VLF explosion and slow recovery.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Startup and Shutdown fits”?",
      "options": [
        "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too…",
        "The following comparison captures the distinctions that matter most when working with SQL Server Startup and Shutdown:",
        "The diagram below places SQL Server Startup and Shutdown alongside the core concepts of SQL Server internal architecture."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places SQL Server Startup and Shutdown alongside the core concepts of SQL Server internal architecture. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Startup and Shutdown in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Startup and Shutdown:",
        "The diagram below places SQL Server Startup and Shutdown alongside the core concepts of SQL Server internal architecture."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SQL Server Startup and Shutdown:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Startup and Shutdown”?",
      "options": [
        "The first example establishes the relevant state.",
        "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too…",
        "The following comparison captures the distinctions that matter most when working with SQL Server Startup and Shutdown:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server internal architecture.”",
      "options": [
        "SQL Server Startup and Shutdown",
        "SQL Server Startup and Shutdown sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine SQL Server Startup and Shutdown within SQL Server internal architecture. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Startup and Shutdown fits”?",
      "options": [
        "Use the following as a starting point when investigating SQL Server Startup and Shutdown.",
        "The diagram below places SQL Server Startup and Shutdown alongside the core concepts of SQL Server internal architecture.",
        "The relational engine parses, compiles and executes queries."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The relational engine parses, compiles and executes queries. Plans are cached and reused; parameterisation and the plan cache are central to understanding consistent versus intermittent performance.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Startup and Shutdown in practice”?",
      "options": [
        "SQL Server Startup and Shutdown",
        "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too…",
        "The following comparison captures the distinctions that matter most when working with SQL Server Startup and Shutdown:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too many VLFs.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Startup and Shutdown”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "SQL Server Startup and Shutdown",
        "The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs)."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Startup and Shutdown. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs).",
        "Crash recovery has three phases: analysis determines the state at the last checkpoint, redo replays committed transactions, and undo rolls back uncommitted ones.",
        "Pages in the buffer pool are clean if they match disk, dirty if modified."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Pages in the buffer pool are clean if they match disk, dirty if modified. Checkpoints write dirty pages to disk to bound recovery time; the lazy writer evicts pages under memory pressure, flushing dirty pages first.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The relational engine parses, compiles and executes queries.",
        "SQL Server Startup and Shutdown",
        "SQL Server Startup and Shutdown is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates SQL Server Startup and Shutdown with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SQL Server Startup and Shutdown means”?",
      "options": [
        "The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs).",
        "The following comparison captures the distinctions that matter most when working with SQL Server Startup and Shutdown:",
        "SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs). Truncation marks inactive VLFs reusable; it does not shrink the physical file. Frequent small autogrowths create VLF explosion and slow recovery.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Startup and Shutdown fits”?",
      "options": [
        "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too…",
        "The following comparison captures the distinctions that matter most when working with SQL Server Startup and Shutdown:",
        "The diagram below places SQL Server Startup and Shutdown alongside the core concepts of SQL Server internal architecture."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places SQL Server Startup and Shutdown alongside the core concepts of SQL Server internal architecture. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Startup and Shutdown in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Startup and Shutdown:",
        "The diagram below places SQL Server Startup and Shutdown alongside the core concepts of SQL Server internal architecture."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SQL Server Startup and Shutdown:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Startup and Shutdown”?",
      "options": [
        "The first example establishes the relevant state.",
        "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too…",
        "The following comparison captures the distinctions that matter most when working with SQL Server Startup and Shutdown:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "SQL Server Startup and Shutdown is a fundamental concept in SQL Server internal architecture",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of SQL Server Startup and Shutdown improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
