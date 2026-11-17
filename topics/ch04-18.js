/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch04-18.html */

window.TOPIC = {
  id: "ch04-18",
  title: "Transaction Log Architecture",

  lead: "This topic covers Transaction Log Architecture — a concept you will meet repeatedly when working with SQL Server internal architecture. We build from first principles to production guidance.",

  objectives: [
    "Define what Transaction Log Architecture is and where it fits",
    "Explain how Transaction Log Architecture works internally",
    "Apply Transaction Log Architecture correctly in a production environment",
    "Recognise the common mistakes and risks involving Transaction Log Architecture",
    "Monitor and troubleshoot Transaction Log Architecture with the right tools"
  ],

  sections: [
    {
      h: "What Transaction Log Architecture means",
      html: `
<p>In this topic we examine <strong>Transaction Log Architecture</strong> within SQL Server internal architecture. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>The buffer pool caches pages in memory. A read that finds a page in the pool is served from RAM in microseconds; a miss requires a physical read milliseconds long. This is why memory sizing dominates performance.</p>
<p>Pages in the buffer pool are clean if they match disk, dirty if modified. Checkpoints write dirty pages to disk to bound recovery time; the lazy writer evicts pages under memory pressure, flushing dirty pages first.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Transaction Log Architecture is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Transaction Log Architecture fits",
      html: `
<p>Write-ahead logging guarantees the log record for a change reaches disk before the data page. A committed transaction's log is durable even if the data page is not yet written, which is what makes crash recovery possible.</p>
<p>The diagram below places Transaction Log Architecture alongside the core concepts of SQL Server internal architecture. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Transaction Log Architecture layers">
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
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Transaction Log Architecture</text>
  </svg>
  <div class="figcaption">Figure 1 — SQL Server internal architecture: how Transaction Log Architecture relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Transaction Log Architecture in practice",
      html: `
<p>The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs). Truncation marks inactive VLFs reusable; it does not shrink the physical file. Frequent small autogrowths create VLF explosion and slow recovery.</p>
<p>The following comparison captures the distinctions that matter most when working with Transaction Log Architecture:</p>
<table>
  <tr><th>Structure</th><th>Size</th><th>Role</th></tr>
  <tr><td>Page</td><td>8 KB</td><td>Unit of data I/O</td></tr>
  <tr><td>Extent</td><td>64 KB (8 pages)</td><td>Allocation unit</td></tr>
  <tr><td>VLF</td><td>Variable</td><td>Log truncation unit</td></tr>
</table>
<p>Crash recovery has three phases: analysis determines the state at the last checkpoint, redo replays committed transactions, and undo rolls back uncommitted ones. The database is brought to a consistent state automatically at startup.</p>
      `,
    },
    {
      h: "Working with Transaction Log Architecture",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Transaction Log Architecture. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Transaction Log Architecture
-- Buffer pool usage per database
SELECT db_name(database_id) AS db,
       count(*) * 8 / 1024 AS buffer_mb
FROM   sys.dm_os_buffer_descriptors
GROUP BY database_id
ORDER BY buffer_mb DESC;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Transaction Log Architecture
-- Transaction log space usage
SELECT total_log_size_in_bytes / 1048576.0 AS total_mb,
       used_log_space_in_bytes / 1048576.0 AS used_mb,
       used_log_space_in_percent AS used_pct
FROM   sys.dm_db_log_space_usage;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Transaction Log Architecture
-- VLF count per database (a high count hurts recovery)
SELECT db_name(database_id) AS db,
       count(*) AS vlf_count
FROM   sys.dm_db_log_info(NULL)
GROUP BY database_id
ORDER BY vlf_count DESC;</code></pre>
<p>The relational engine parses, compiles and executes queries. Plans are cached and reused; parameterisation and the plan cache are central to understanding consistent versus intermittent performance.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too many VLFs.</p>
<table>
  <tr><th>Mechanism</th><th>Trigger</th><th>Effect</th></tr>
  <tr><td>Checkpoint</td><td>Periodic / log volume</td><td>Flush dirty pages, bound recovery</td></tr>
  <tr><td>Lazy writer</td><td>Memory pressure</td><td>Evict clean pages</td></tr>
  <tr><td>Write-ahead log</td><td>Every modification</td><td>Log durable before data</td></tr>
</table>
<p>SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O. Eight pages form an extent. Data and index pages live in MDF/NDF files; the transaction log is a separate sequential structure of virtual log files.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Transaction Log Architecture, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Transaction Log Architecture",
      html: `
<p>This section consolidates <strong>Transaction Log Architecture</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs). Truncation marks inactive VLFs reusable; it does not shrink the physical file. Frequent small autogrowths create VLF explosion and slow recovery.</p>
<p>Crash recovery has three phases: analysis determines the state at the last checkpoint, redo replays committed transactions, and undo rolls back uncommitted ones. The database is brought to a consistent state automatically at startup.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Transaction Log Architecture sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Mechanism</th><th>Trigger</th><th>Effect</th></tr>
  <tr><td>Checkpoint</td><td>Periodic / log volume</td><td>Flush dirty pages, bound recovery</td></tr>
  <tr><td>Lazy writer</td><td>Memory pressure</td><td>Evict clean pages</td></tr>
  <tr><td>Write-ahead log</td><td>Every modification</td><td>Log durable before data</td></tr>
</table>
<p>The relational engine parses, compiles and executes queries. Plans are cached and reused; parameterisation and the plan cache are central to understanding consistent versus intermittent performance.</p>
<p>Use the following as a starting point when investigating Transaction Log Architecture. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Transaction Log Architecture
-- Transaction log space usage
SELECT total_log_size_in_bytes / 1048576.0 AS total_mb,
       used_log_space_in_bytes / 1048576.0 AS used_mb,
       used_log_space_in_percent AS used_pct
FROM   sys.dm_db_log_space_usage;</code></pre>
<p>Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too many VLFs.</p>
      `,
    }
  ],

  scenario: {
    title: "PLE collapsed after a report went live",
    html: `
A new unbounded report pulled millions of cold pages into the buffer pool, evicting hot OLTP pages. Page life expectancy fell from 4,200 to under 30 seconds and applications slowed despite idle CPU. The DBA killed the report, added date predicates and an indexed view, and capped reporting with Resource Governor.
<p><strong>The Transaction Log Architecture lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
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
        "Transaction Log Architecture",
        "Flush dirty pages, bound recovery",
        "Evict clean pages"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Transaction Log Architecture within SQL Server internal architecture. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Transaction Log Architecture fits”?",
      "options": [
        "Log durable before data",
        "Transaction Log Architecture sits inside a larger system.",
        "Write-ahead logging guarantees the log record for a change reaches disk before the data page."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Write-ahead logging guarantees the log record for a change reaches disk before the data page. A committed transaction's log is durable even if the data page is not yet written, which is what makes crash recovery possible.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Transaction Log Architecture in practice”?",
      "options": [
        "Unit of data I/O",
        "The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs).",
        "The following comparison captures the distinctions that matter most when working with Transaction Log Architecture:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs). Truncation marks inactive VLFs reusable; it does not shrink the physical file. Frequent small autogrowths create VLF explosion and slow recovery.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Transaction Log Architecture”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Use the following as a starting point when investigating Transaction Log Architecture.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Transaction Log Architecture. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O.",
        "With Transaction Log Architecture, prefer measured, reversible changes.",
        "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too many VLFs.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The buffer pool caches pages in memory.",
        "Transaction Log Architecture",
        "Use the following as a starting point when investigating Transaction Log Architecture."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Transaction Log Architecture with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Transaction Log Architecture means”?",
      "options": [
        "The buffer pool caches pages in memory.",
        "Write-ahead logging guarantees the log record for a change reaches disk before the data page.",
        "The diagram below places Transaction Log Architecture alongside the core concepts of SQL Server internal architecture."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The buffer pool caches pages in memory. A read that finds a page in the pool is served from RAM in microseconds; a miss requires a physical read milliseconds long. This is why memory sizing dominates performance.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Transaction Log Architecture fits”?",
      "options": [
        "The buffer pool caches pages in memory.",
        "Pages in the buffer pool are clean if they match disk, dirty if modified.",
        "The diagram below places Transaction Log Architecture alongside the core concepts of SQL Server internal architecture."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Transaction Log Architecture alongside the core concepts of SQL Server internal architecture. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Transaction Log Architecture in practice”?",
      "options": [
        "Transaction Log Architecture is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "The following comparison captures the distinctions that matter most when working with Transaction Log Architecture:",
        "Pages in the buffer pool are clean if they match disk, dirty if modified."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Transaction Log Architecture:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Transaction Log Architecture”?",
      "options": [
        "The first example establishes the relevant state.",
        "Transaction Log Architecture is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Write-ahead logging guarantees the log record for a change reaches disk before the data page."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server internal architecture.”",
      "options": [
        "Transaction Log Architecture",
        "Flush dirty pages, bound recovery",
        "Evict clean pages"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Transaction Log Architecture within SQL Server internal architecture. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Transaction Log Architecture fits”?",
      "options": [
        "Log durable before data",
        "Transaction Log Architecture sits inside a larger system.",
        "Write-ahead logging guarantees the log record for a change reaches disk before the data page."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Write-ahead logging guarantees the log record for a change reaches disk before the data page. A committed transaction's log is durable even if the data page is not yet written, which is what makes crash recovery possible.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Transaction Log Architecture in practice”?",
      "options": [
        "Unit of data I/O",
        "The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs).",
        "The following comparison captures the distinctions that matter most when working with Transaction Log Architecture:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs). Truncation marks inactive VLFs reusable; it does not shrink the physical file. Frequent small autogrowths create VLF explosion and slow recovery.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Transaction Log Architecture”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Use the following as a starting point when investigating Transaction Log Architecture.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Transaction Log Architecture. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O.",
        "With Transaction Log Architecture, prefer measured, reversible changes.",
        "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too many VLFs.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The buffer pool caches pages in memory.",
        "Transaction Log Architecture",
        "Use the following as a starting point when investigating Transaction Log Architecture."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Transaction Log Architecture with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Transaction Log Architecture means”?",
      "options": [
        "The buffer pool caches pages in memory.",
        "Write-ahead logging guarantees the log record for a change reaches disk before the data page.",
        "The diagram below places Transaction Log Architecture alongside the core concepts of SQL Server internal architecture."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The buffer pool caches pages in memory. A read that finds a page in the pool is served from RAM in microseconds; a miss requires a physical read milliseconds long. This is why memory sizing dominates performance.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Transaction Log Architecture fits”?",
      "options": [
        "The buffer pool caches pages in memory.",
        "Pages in the buffer pool are clean if they match disk, dirty if modified.",
        "The diagram below places Transaction Log Architecture alongside the core concepts of SQL Server internal architecture."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Transaction Log Architecture alongside the core concepts of SQL Server internal architecture. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Transaction Log Architecture in practice”?",
      "options": [
        "Transaction Log Architecture is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "The following comparison captures the distinctions that matter most when working with Transaction Log Architecture:",
        "Pages in the buffer pool are clean if they match disk, dirty if modified."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Transaction Log Architecture:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Transaction Log Architecture”?",
      "options": [
        "The first example establishes the relevant state.",
        "Transaction Log Architecture is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Write-ahead logging guarantees the log record for a change reaches disk before the data page."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server internal architecture.”",
      "options": [
        "Transaction Log Architecture",
        "Flush dirty pages, bound recovery",
        "Evict clean pages"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Transaction Log Architecture within SQL Server internal architecture. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Transaction Log Architecture fits”?",
      "options": [
        "Log durable before data",
        "Transaction Log Architecture sits inside a larger system.",
        "Write-ahead logging guarantees the log record for a change reaches disk before the data page."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Write-ahead logging guarantees the log record for a change reaches disk before the data page. A committed transaction's log is durable even if the data page is not yet written, which is what makes crash recovery possible.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Transaction Log Architecture in practice”?",
      "options": [
        "Unit of data I/O",
        "The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs).",
        "The following comparison captures the distinctions that matter most when working with Transaction Log Architecture:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs). Truncation marks inactive VLFs reusable; it does not shrink the physical file. Frequent small autogrowths create VLF explosion and slow recovery.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Transaction Log Architecture”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Use the following as a starting point when investigating Transaction Log Architecture.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Transaction Log Architecture. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O.",
        "With Transaction Log Architecture, prefer measured, reversible changes.",
        "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too many VLFs.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The buffer pool caches pages in memory.",
        "Transaction Log Architecture",
        "Use the following as a starting point when investigating Transaction Log Architecture."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Transaction Log Architecture with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Transaction Log Architecture means”?",
      "options": [
        "The buffer pool caches pages in memory.",
        "Write-ahead logging guarantees the log record for a change reaches disk before the data page.",
        "The diagram below places Transaction Log Architecture alongside the core concepts of SQL Server internal architecture."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The buffer pool caches pages in memory. A read that finds a page in the pool is served from RAM in microseconds; a miss requires a physical read milliseconds long. This is why memory sizing dominates performance.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Transaction Log Architecture fits”?",
      "options": [
        "The buffer pool caches pages in memory.",
        "Pages in the buffer pool are clean if they match disk, dirty if modified.",
        "The diagram below places Transaction Log Architecture alongside the core concepts of SQL Server internal architecture."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Transaction Log Architecture alongside the core concepts of SQL Server internal architecture. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Transaction Log Architecture in practice”?",
      "options": [
        "Transaction Log Architecture is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "The following comparison captures the distinctions that matter most when working with Transaction Log Architecture:",
        "Pages in the buffer pool are clean if they match disk, dirty if modified."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Transaction Log Architecture:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Transaction Log Architecture”?",
      "options": [
        "The first example establishes the relevant state.",
        "Transaction Log Architecture is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Write-ahead logging guarantees the log record for a change reaches disk before the data page."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Transaction Log Architecture is a fundamental concept in SQL Server internal architecture",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Transaction Log Architecture improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
