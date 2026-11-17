/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch04-06.html */

window.TOPIC = {
  id: "ch04-06",
  title: "Buffer Pool",

  lead: "The buffer pool is SQL Server's memory engine — the cache where data pages live so queries read from RAM instead of disk, and the place where almost every performance story begins.",

  objectives: [
    "Explain what the buffer pool stores and why",
    "Trace how a page moves between disk, buffer pool, and log",
    "Distinguish clean pages, dirty pages, checkpoints, and lazy writer",
    "Monitor buffer pool size and hit ratio with DMVs"
  ],

  sections: [
    {
      h: "What the buffer pool is",
      html: `
<p>The <strong>buffer pool</strong> is the largest consumer of SQL Server's memory. It is a cache of <strong>8-KB pages</strong> — the same pages that live in the MDF/NDF data files on disk. When a query needs a row, the storage engine checks the buffer pool first:</p>
<ul>
  <li><strong>Page present (hit)</strong> → read from RAM: microseconds</li>
  <li><strong>Page absent (miss)</strong> → read from disk into the pool: milliseconds — 1000× slower</li>
</ul>
<p>Because of this, a well-sized buffer pool is the single biggest performance lever on a SQL Server. Everything above it — query plans, indexes, locking — assumes the data pages are already in memory.</p>
<div class="figure">
  <svg viewBox="0 0 780 360" role="img" aria-label="Buffer pool architecture">
    <defs>
      <marker id="bp-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="20" y="30" width="170" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="105" y="56" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Query request</text>
    <text x="105" y="76" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">SELECT … FROM Orders</text>

    <rect x="230" y="30" width="180" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="320" y="56" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Query processor</text>
    <text x="320" y="76" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">plan → access method</text>

    <rect x="450" y="30" width="180" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="540" y="56" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Storage engine</text>
    <text x="540" y="76" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">page read / latch</text>

    <rect x="140" y="140" width="500" height="130" rx="14" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="390" y="168" text-anchor="middle" fill="var(--accent-strong)" font-size="17" font-weight="700" font-family="Segoe UI, sans-serif">Buffer pool (RAM cache of 8 KB pages)</text>

    <rect x="175" y="185" width="200" height="60" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="275" y="209" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Clean pages</text>
    <text x="275" y="229" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">match disk — can be evicted</text>

    <rect x="405" y="185" width="200" height="60" rx="9" fill="var(--surface)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="505" y="209" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Dirty pages</text>
    <text x="505" y="229" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">changed in memory, not yet on disk</text>

    <rect x="20" y="300" width="220" height="52" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="130" y="322" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Data files · MDF / NDF</text>
    <text x="130" y="341" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">8 KB pages on disk</text>

    <rect x="540" y="300" width="220" height="52" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="650" y="322" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Transaction log · LDF</text>
    <text x="650" y="341" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">write-ahead: log first, data later</text>

    <line x1="190" y1="60" x2="228" y2="60" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#bp-arrow)"/>
    <line x1="410" y1="60" x2="448" y2="60" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#bp-arrow)"/>
    <line x1="540" y1="90" x2="430" y2="140" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#bp-arrow)"/>
    <line x1="300" y1="270" x2="200" y2="300" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#bp-arrow)"/>
    <line x1="480" y1="270" x2="620" y2="300" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#bp-arrow)"/>

    <text x="390" y="128" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">hit → serve from RAM · miss → physical read from disk</text>
  </svg>
  <div class="figcaption">Figure 1 — Data flows through the buffer pool; the log is written first (WAL), data pages later.</div>
</div>
`
    },
    {
      h: "Reads, writes, and the life of a page",
      html: `
<p>A page entering the buffer pool is <strong>clean</strong> — identical to its copy on disk. When a query modifies it, it becomes <strong>dirty</strong>: memory now holds a newer version than disk. SQL Server must never lose a dirty page, so two mechanisms handle them:</p>
<ul>
  <li><strong>Checkpoint</strong> — periodically writes all dirty pages for that database to disk and records the change in the log. Regular, predictable, reduces recovery time.</li>
  <li><strong>Lazy writer</strong> — evicts clean pages under memory pressure, flushing dirty pages first so it always has something to reclaim.</li>
</ul>
<p>Critical rule: <strong>the transaction log is written before the data page</strong> (Write-Ahead Logging). A committed transaction's log record reaches the LDF before the modified data page reaches the MDF — which is exactly why crash recovery can replay the log.</p>
`
    },
    {
      h: "Sizing and memory pressure",
      html: `
<p>By default the buffer pool can grow until <em>Target Server Memory</em>, competing with the OS, antivirus, and other processes — which is why production best practice is to set <strong>max server memory</strong> explicitly (typically total RAM minus 1–4 GB for the OS). Symptoms of an undersized pool:</p>
<ul>
  <li>Rising <strong>page life expectancy</strong> (PLE) drops — pages being evicted almost as fast as they arrive</li>
  <li>High <strong>ASYNC_IO_COMPLETION / PAGEIOLATCH_*</strong> waits — queries stuck reading from disk</li>
  <li>Plan cache and buffer pool fighting for the same memory</li>
</ul>
<p>Classic mistake: leaving <code>max server memory</code> at the 2,147,483,647 MB default on a server that also runs SSRS, SSIS, or a reporting tool — SQL Server silently squeezes everything else.</p>
`
    },
    {
      h: "Monitoring the buffer pool",
      html: `
<p>Two DMV queries every DBA should have in their toolbox:</p>
<pre><code class="language-sql">-- Buffer pool size per database (MB)
SELECT db_name(database_id)            AS database_name,
       count(*) * 8 / 1024             AS buffer_pool_mb
FROM   sys.dm_os_buffer_descriptors
GROUP BY database_id
ORDER BY buffer_pool_mb DESC;</code></pre>
<pre><code class="language-sql">-- Page life expectancy: seconds a page stays in cache
SELECT counter_name, cntr_value
FROM   sys.dm_os_performance_counters
WHERE  counter_name = 'Page life expectancy';</code></pre>
<p>A PLE that trends downward during business hours means the working set no longer fits in memory — investigate memory sizing or an oversized scan before users file tickets.</p>
`
    },
    {
      h: "Deeper dive: Buffer Pool",
      html: `
<p>This section consolidates <strong>Buffer Pool</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O. Eight pages form an extent. Data and index pages live in MDF/NDF files; the transaction log is a separate sequential structure of virtual log files.</p>
<p>The buffer pool caches pages in memory. A read that finds a page in the pool is served from RAM in microseconds; a miss requires a physical read milliseconds long. This is why memory sizing dominates performance.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Buffer Pool sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Mechanism</th><th>Trigger</th><th>Effect</th></tr>
  <tr><td>Checkpoint</td><td>Periodic / log volume</td><td>Flush dirty pages, bound recovery</td></tr>
  <tr><td>Lazy writer</td><td>Memory pressure</td><td>Evict clean pages</td></tr>
  <tr><td>Write-ahead log</td><td>Every modification</td><td>Log durable before data</td></tr>
</table>
<p>Pages in the buffer pool are clean if they match disk, dirty if modified. Checkpoints write dirty pages to disk to bound recovery time; the lazy writer evicts pages under memory pressure, flushing dirty pages first.</p>
<p>Use the following as a starting point when investigating Buffer Pool. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Buffer Pool
-- Transaction log space usage
SELECT total_log_size_in_bytes / 1048576.0 AS total_mb,
       used_log_space_in_bytes / 1048576.0 AS used_mb,
       used_log_space_in_percent AS used_pct
FROM   sys.dm_db_log_space_usage;</code></pre>
<p>Write-ahead logging guarantees the log record for a change reaches disk before the data page. A committed transaction's log is durable even if the data page is not yet written, which is what makes crash recovery possible.</p>
      `,
    }
  ],

  scenario: {
    title: "PLE collapsed from 4,200 seconds to 30 after a report went live",
    html: `
<p>A finance team scheduled a new “export everything” report at 8 AM. The report joined three large tables without predicates, dragging millions of cold pages into the buffer pool and evicting the hot pages the OLTP application needed. PLE dropped from 4,200 to under 30 seconds, and the order-entry application slowed to a crawl — even though CPU was idle and no query was blocked.</p>
<p>The DBA recognised the signature: <strong>I/O-bound, not CPU-bound</strong>. Immediate actions: killed the report session, verified PLE recovered within minutes, then worked with the developer to add date-range filters and an indexed view. Long-term: resource governor to cap reporting memory, and an alert on PLE. The hardware was never the problem — an unbounded workload was.</p>
`
  },

  interview: [
    {
      q: "What is the buffer pool and what does it store?",
      a: "SQL Server's main memory cache of 8-KB data and index pages read from data files. It serves reads from RAM and holds modified (dirty) pages until a checkpoint or lazy writer writes them to disk."
    },
    {
      q: "What is the difference between a checkpoint and lazy writer?",
      a: "A checkpoint is a database-scoped, periodic flush of dirty pages to disk to bound recovery time. Lazy writer is a memory-pressure mechanism that reclaims clean pages and must flush dirty pages first — it runs when the buffer pool needs free space."
    },
    {
      q: "Your page life expectancy keeps dropping. What do you check?",
      a: "Whether the working set exceeds memory: set max server memory explicitly, check for large ad-hoc scans or missing predicates via sys.dm_exec_query_stats and wait stats (PAGEIOLATCH), review which databases own the buffer pool via sys.dm_os_buffer_descriptors, and confirm no other process is stealing memory."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “The _____ is the largest consumer of SQL Server's memory.”",
      "options": [
        "buffer pool",
        "Lazy writer",
        "the transaction log is written before the data page"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The buffer pool is the largest consumer of SQL Server's memory. It is a cache of 8-KB pages — the same pages that live in the MDF/NDF data files on disk. When a query needs a row, the storage engine checks the buffer pool first:”"
    },
    {
      "question": "Complete the lesson statement: “A page entering the buffer pool is _____ — identical to its copy on disk.”",
      "options": [
        "the transaction log is written before the data page",
        "Target Server Memory",
        "clean"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A page entering the buffer pool is clean — identical to its copy on disk. When a query modifies it, it becomes dirty: memory now holds a newer version than disk. SQL Server must never lose a dirty page, so two mechanisms handle them:”"
    },
    {
      "question": "Complete the lesson statement: “By default the buffer pool can grow until _____, competing with the OS, antivirus, and other processes — which is why production best practice is to set max server memory explicitly (typically total RAM minus 1–4 GB for the OS).”",
      "options": [
        "max server memory",
        "Target Server Memory",
        "the transaction log is written before the data page"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “By default the buffer pool can grow until Target Server Memory, competing with the OS, antivirus, and other processes — which is why production best practice is to set max server memory explicitly (typically total RAM minus 1–4 GB for the OS). Symptoms of an undersized pool:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Monitoring the buffer pool”?",
      "options": [
        "Two DMV queries every DBA should have in their toolbox:",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Pages in the buffer pool are clean if they match disk, dirty if modified."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Two DMV queries every DBA should have in their toolbox:”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "page life expectancy",
        "ASYNC_IO_COMPLETION / PAGEIOLATCH_*",
        "Buffer Pool"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Buffer Pool with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What the buffer pool is”?",
      "options": [
        "Use the following as a starting point when investigating Buffer Pool.",
        "Because of this, a well-sized buffer pool is the single biggest performance lever on a SQL Server.",
        "Pages in the buffer pool are clean if they match disk, dirty if modified."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Because of this, a well-sized buffer pool is the single biggest performance lever on a SQL Server. Everything above it — query plans, indexes, locking — assumes the data pages are already in memory.”"
    },
    {
      "question": "Complete the lesson statement: “Critical rule: _____ (Write-Ahead Logging).”",
      "options": [
        "the transaction log is written before the data page",
        "Because of this, a well-sized buffer pool is the single biggest performance lever on a SQL Server.",
        "Classic mistake: leaving max server memory at the 2,147,483,647 MB default on a server that also runs SSRS, SSIS, or a reporting tool — SQL Server silently squeezes everything…"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Critical rule: the transaction log is written before the data page (Write-Ahead Logging). A committed transaction's log record reaches the LDF before the modified data page reaches the MDF — which is exactly why crash recovery can replay the log.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Sizing and memory pressure”?",
      "options": [
        "Flush dirty pages, bound recovery",
        "Evict clean pages",
        "Classic mistake: leaving max server memory at the 2,147,483,647 MB default on a server that also runs SSRS, SSIS, or a reporting tool — SQL Server silently squeezes everything…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Classic mistake: leaving max server memory at the 2,147,483,647 MB default on a server that also runs SSRS, SSIS, or a reporting tool — SQL Server silently squeezes everything else.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Monitoring the buffer pool”?",
      "options": [
        "Log durable before data",
        "A PLE that trends downward during business hours means the working set no longer fits in memory — investigate memory sizing or an oversized scan before users file tickets.",
        "Evict clean pages"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A PLE that trends downward during business hours means the working set no longer fits in memory — investigate memory sizing or an oversized scan before users file tickets.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Deeper dive: Buffer Pool”?",
      "options": [
        "SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O.",
        "Evict clean pages",
        "Log durable before data"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O. Eight pages form an extent. Data and index pages live in MDF/NDF files; the transaction log is a separate sequential structure of virtual log files.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “The _____ is the largest consumer of SQL Server's memory.”",
      "options": [
        "buffer pool",
        "Lazy writer",
        "the transaction log is written before the data page"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The buffer pool is the largest consumer of SQL Server's memory. It is a cache of 8-KB pages — the same pages that live in the MDF/NDF data files on disk. When a query needs a row, the storage engine checks the buffer pool first:”"
    },
    {
      "question": "Complete the lesson statement: “A page entering the buffer pool is _____ — identical to its copy on disk.”",
      "options": [
        "the transaction log is written before the data page",
        "Target Server Memory",
        "clean"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A page entering the buffer pool is clean — identical to its copy on disk. When a query modifies it, it becomes dirty: memory now holds a newer version than disk. SQL Server must never lose a dirty page, so two mechanisms handle them:”"
    },
    {
      "question": "Complete the lesson statement: “By default the buffer pool can grow until _____, competing with the OS, antivirus, and other processes — which is why production best practice is to set max server memory explicitly (typically total RAM minus 1–4 GB for the OS).”",
      "options": [
        "max server memory",
        "Target Server Memory",
        "the transaction log is written before the data page"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “By default the buffer pool can grow until Target Server Memory, competing with the OS, antivirus, and other processes — which is why production best practice is to set max server memory explicitly (typically total RAM minus 1–4 GB for the OS). Symptoms of an undersized pool:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Monitoring the buffer pool”?",
      "options": [
        "Two DMV queries every DBA should have in their toolbox:",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Pages in the buffer pool are clean if they match disk, dirty if modified."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Two DMV queries every DBA should have in their toolbox:”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "page life expectancy",
        "ASYNC_IO_COMPLETION / PAGEIOLATCH_*",
        "Buffer Pool"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Buffer Pool with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What the buffer pool is”?",
      "options": [
        "Use the following as a starting point when investigating Buffer Pool.",
        "Because of this, a well-sized buffer pool is the single biggest performance lever on a SQL Server.",
        "Pages in the buffer pool are clean if they match disk, dirty if modified."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Because of this, a well-sized buffer pool is the single biggest performance lever on a SQL Server. Everything above it — query plans, indexes, locking — assumes the data pages are already in memory.”"
    },
    {
      "question": "Complete the lesson statement: “Critical rule: _____ (Write-Ahead Logging).”",
      "options": [
        "the transaction log is written before the data page",
        "Because of this, a well-sized buffer pool is the single biggest performance lever on a SQL Server.",
        "Classic mistake: leaving max server memory at the 2,147,483,647 MB default on a server that also runs SSRS, SSIS, or a reporting tool — SQL Server silently squeezes everything…"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Critical rule: the transaction log is written before the data page (Write-Ahead Logging). A committed transaction's log record reaches the LDF before the modified data page reaches the MDF — which is exactly why crash recovery can replay the log.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Sizing and memory pressure”?",
      "options": [
        "Flush dirty pages, bound recovery",
        "Evict clean pages",
        "Classic mistake: leaving max server memory at the 2,147,483,647 MB default on a server that also runs SSRS, SSIS, or a reporting tool — SQL Server silently squeezes everything…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Classic mistake: leaving max server memory at the 2,147,483,647 MB default on a server that also runs SSRS, SSIS, or a reporting tool — SQL Server silently squeezes everything else.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Monitoring the buffer pool”?",
      "options": [
        "Log durable before data",
        "A PLE that trends downward during business hours means the working set no longer fits in memory — investigate memory sizing or an oversized scan before users file tickets.",
        "Evict clean pages"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A PLE that trends downward during business hours means the working set no longer fits in memory — investigate memory sizing or an oversized scan before users file tickets.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Deeper dive: Buffer Pool”?",
      "options": [
        "SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O.",
        "Evict clean pages",
        "Log durable before data"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O. Eight pages form an extent. Data and index pages live in MDF/NDF files; the transaction log is a separate sequential structure of virtual log files.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “The _____ is the largest consumer of SQL Server's memory.”",
      "options": [
        "buffer pool",
        "Lazy writer",
        "the transaction log is written before the data page"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The buffer pool is the largest consumer of SQL Server's memory. It is a cache of 8-KB pages — the same pages that live in the MDF/NDF data files on disk. When a query needs a row, the storage engine checks the buffer pool first:”"
    },
    {
      "question": "Complete the lesson statement: “A page entering the buffer pool is _____ — identical to its copy on disk.”",
      "options": [
        "the transaction log is written before the data page",
        "Target Server Memory",
        "clean"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A page entering the buffer pool is clean — identical to its copy on disk. When a query modifies it, it becomes dirty: memory now holds a newer version than disk. SQL Server must never lose a dirty page, so two mechanisms handle them:”"
    },
    {
      "question": "Complete the lesson statement: “By default the buffer pool can grow until _____, competing with the OS, antivirus, and other processes — which is why production best practice is to set max server memory explicitly (typically total RAM minus 1–4 GB for the OS).”",
      "options": [
        "max server memory",
        "Target Server Memory",
        "the transaction log is written before the data page"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “By default the buffer pool can grow until Target Server Memory, competing with the OS, antivirus, and other processes — which is why production best practice is to set max server memory explicitly (typically total RAM minus 1–4 GB for the OS). Symptoms of an undersized pool:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Monitoring the buffer pool”?",
      "options": [
        "Two DMV queries every DBA should have in their toolbox:",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Pages in the buffer pool are clean if they match disk, dirty if modified."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Two DMV queries every DBA should have in their toolbox:”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "page life expectancy",
        "ASYNC_IO_COMPLETION / PAGEIOLATCH_*",
        "Buffer Pool"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Buffer Pool with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What the buffer pool is”?",
      "options": [
        "Use the following as a starting point when investigating Buffer Pool.",
        "Because of this, a well-sized buffer pool is the single biggest performance lever on a SQL Server.",
        "Pages in the buffer pool are clean if they match disk, dirty if modified."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Because of this, a well-sized buffer pool is the single biggest performance lever on a SQL Server. Everything above it — query plans, indexes, locking — assumes the data pages are already in memory.”"
    },
    {
      "question": "Complete the lesson statement: “Critical rule: _____ (Write-Ahead Logging).”",
      "options": [
        "the transaction log is written before the data page",
        "Because of this, a well-sized buffer pool is the single biggest performance lever on a SQL Server.",
        "Classic mistake: leaving max server memory at the 2,147,483,647 MB default on a server that also runs SSRS, SSIS, or a reporting tool — SQL Server silently squeezes everything…"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Critical rule: the transaction log is written before the data page (Write-Ahead Logging). A committed transaction's log record reaches the LDF before the modified data page reaches the MDF — which is exactly why crash recovery can replay the log.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Sizing and memory pressure”?",
      "options": [
        "Flush dirty pages, bound recovery",
        "Evict clean pages",
        "Classic mistake: leaving max server memory at the 2,147,483,647 MB default on a server that also runs SSRS, SSIS, or a reporting tool — SQL Server silently squeezes everything…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Classic mistake: leaving max server memory at the 2,147,483,647 MB default on a server that also runs SSRS, SSIS, or a reporting tool — SQL Server silently squeezes everything else.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Monitoring the buffer pool”?",
      "options": [
        "Log durable before data",
        "A PLE that trends downward during business hours means the working set no longer fits in memory — investigate memory sizing or an oversized scan before users file tickets.",
        "Evict clean pages"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A PLE that trends downward during business hours means the working set no longer fits in memory — investigate memory sizing or an oversized scan before users file tickets.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Deeper dive: Buffer Pool”?",
      "options": [
        "SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O.",
        "Evict clean pages",
        "Log durable before data"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O. Eight pages form an extent. Data and index pages live in MDF/NDF files; the transaction log is a separate sequential structure of virtual log files.”"
    }
  ],
  takeaways: [
    "The buffer pool caches 8-KB pages so queries hit RAM instead of disk — the biggest performance lever",
    "Clean pages match disk; dirty pages are modified in memory and must be flushed (checkpoint / lazy writer)",
    "Write-Ahead Logging: the log is written before the data page — that is what makes crash recovery possible",
    "Set max server memory explicitly in production; leave headroom for the OS and other services",
    "Watch page life expectancy and PAGEIOLATCH waits to detect an undersized pool early"
  ]
};
