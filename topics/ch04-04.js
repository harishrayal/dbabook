/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch04-04.html */

window.TOPIC = {
  id: "ch04-04",
  title: "Storage Engine",

  lead: "The storage engine is the part of SQL Server that actually touches data: it navigates heaps and b-trees, moves 8-KB pages in and out of the buffer pool, applies locks, and writes the transaction log before anything reaches a data file. When a query is slow and the plan is fine, the answer is almost always here.",

  objectives: [
    "Describe the four responsibilities of the storage engine",
    "Distinguish logical reads, physical reads, and latches",
    "Explain the write-ahead path from modification to disk",
    "Measure per-file I/O health with sys.dm_io_virtual_file_stats"
  ],

  sections: [
    {
      h: "What the storage engine owns",
      html: `
<p>Where the relational engine decides <em>what</em> to do, the storage engine does <em>the work of touching data</em>. It has four components, each with a distinct failure mode:</p>
<ul>
  <li><strong>Access methods</strong> — heaps and b-trees: seek a key, scan a range, insert/delete a row. Failure mode: scans, lookups, page splits</li>
  <li><strong>Buffer manager</strong> — resolves a logical page number to a page in the buffer pool, issuing an 8-KB read on a miss. Failure mode: <code>PAGEIOLATCH_*</code>, low page life expectancy</li>
  <li><strong>Lock manager</strong> — grants shared, exclusive, update, and schema locks on rows, pages, and tables; runs the deadlock monitor. Failure mode: <code>LCK_M_*</code> waits, deadlocks</li>
  <li><strong>Transaction manager / log writer</strong> — produces log records, honours write-ahead logging, coordinates checkpoints and recovery. Failure mode: log stalls, autogrowth events, long recovery</li>
</ul>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Storage engine read and write paths">
    <defs>
      <marker id="a04-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
      <marker id="a04-arrow-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"/>
      </marker>
    </defs>

    <rect x="40" y="14" width="340" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="210" y="33" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Relational engine (executor)</text>
    <text x="210" y="51" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">requests rows / applies changes</text>

    <rect x="40" y="82" width="340" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="210" y="101" text-anchor="middle" fill="var(--accent-strong)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Access methods</text>
    <text x="210" y="119" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">heap / b-tree navigation · allocation units</text>

    <rect x="40" y="152" width="340" height="50" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="210" y="173" text-anchor="middle" fill="var(--accent-strong)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Buffer manager</text>
    <text x="210" y="193" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">logical page → page in memory (latch it)</text>

    <rect x="40" y="228" width="340" height="44" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="210" y="247" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Buffer pool — 8 KB pages in RAM</text>
    <text x="210" y="265" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">hit: served in µs · miss: physical read</text>

    <rect x="40" y="292" width="340" height="40" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="210" y="309" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Data files · MDF / NDF</text>
    <text x="210" y="326" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">async folio reads and writes</text>

    <rect x="450" y="82" width="280" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="590" y="101" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Lock manager</text>
    <text x="590" y="119" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">S / X / U grants · deadlock monitor</text>

    <rect x="450" y="152" width="280" height="50" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="590" y="173" text-anchor="middle" fill="var(--accent-strong)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Log writer (WAL)</text>
    <text x="590" y="193" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">log record flushed before data page</text>

    <rect x="450" y="228" width="280" height="44" rx="9" fill="var(--surface)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="590" y="247" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Transaction log · LDF</text>
    <text x="590" y="265" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">sequential write · commit ack</text>

    <line x1="210" y1="58" x2="210" y2="80" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a04-arrow)"/>
    <line x1="210" y1="126" x2="210" y2="150" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a04-arrow)"/>
    <line x1="210" y1="202" x2="210" y2="226" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a04-arrow)"/>
    <line x1="210" y1="272" x2="210" y2="290" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a04-arrow)"/>
    <line x1="380" y1="104" x2="448" y2="104" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#a04-arrow)"/>
    <line x1="380" y1="177" x2="448" y2="177" stroke="var(--accent)" stroke-width="1.8" marker-end="url(#a04-arrow-acc)"/>
    <line x1="590" y1="202" x2="590" y2="226" stroke="var(--accent)" stroke-width="1.8" marker-end="url(#a04-arrow-acc)"/>

    <text x="380" y="74" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-style="italic" font-family="Segoe UI, sans-serif">read path</text>
    <text x="414" y="250" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-style="italic" font-family="Segoe UI, sans-serif">write path</text>
  </svg>
  <div class="figcaption">Figure 1 — The storage engine's read path (left) and write-ahead path (right).</div>
</div>
`
    },
    {
      h: "Access methods: heaps and b-trees",
      html: `
<p>Every user table lives in one of two structures, and the access method chosen for it determines the cost of every query against it:</p>
<table>
  <tr><th>Structure</th><th>Physical layout</th><th>Access pattern</th><th>Best for</th></tr>
  <tr><td><strong>Heap</strong></td><td>Unordered pages chained via IAM; rows located by RID</td><td>Full scan or allocation-order scan; no seeks</td><td>Staging, heaps with clustered indexes on top</td></tr>
  <tr><td><strong>Clustered index</strong></td><td>B-tree keyed on the clustering key; leaf pages <em>are</em> the data</td><td>Range seeks, ordered scans, key lookups into leaves</td><td>Range queries, ordered output, narrow keys</td></tr>
  <tr><td><strong>Nonclustered index</strong></td><td>B-tree keyed on the index key + clustering key as row locator</td><td>Seek on key columns; lookup back to the row if not covered</td><td>Selective predicates, covering projections</td></tr>
</table>
<p>A <strong>seek</strong> walks 3–4 pages from root to leaf; a <strong>scan</strong> reads every leaf page in order. A key/row <strong>lookup</strong> is a second seek per row — the single most common source of a “good index, terrible plan” incident. Storage-engine tuning is largely the art of removing lookups and scans by covering the query.</p>
`
    },
    {
      h: "Reads: logical, physical, and the latch",
      html: `
<p>Three different counters get confused constantly, and the distinction matters for diagnosis:</p>
<ul>
  <li><strong>Logical read</strong> — a page requested from the buffer pool, counted whether or not it was in memory. This is the number that reflects query design</li>
  <li><strong>Physical read</strong> — the page was not in memory and had to be read from disk (an 8-KB folio read issued asynchronously through SQLOS)</li>
  <li><strong>Latch</strong> — a short-lived, internal physical guard on a page's memory structure while it is being read or modified; <em>not</em> a lock, and not held for the duration of a transaction</li>
</ul>
<p>A query doing 40,000 logical reads and zero physical reads is still expensive — it is burning CPU walking pages in RAM. Conversely, a modest number of logical reads with high physical reads means a cold or thrashing buffer pool. The wait type tells you which state you are in: <code>PAGEIOLATCH_SH</code> means “waiting for a disk read to finish so I can latch the page”.</p>
`
    },
    {
      h: "Writes: the write-ahead path",
      html: `
<p>Modifications never write the data page first. The storage engine follows <strong>Write-Ahead Logging (WAL)</strong>, topic ch04-17 in depth:</p>
<ol>
  <li>Row/page modifications occur in the buffer pool, turning the page <em>dirty</em></li>
  <li>Before the transaction can commit, the corresponding <strong>log records</strong> (with enough detail to undo or redo) are written to the LDF and flushed — the commit acknowledgment depends on this flush</li>
  <li>The dirty data page reaches the MDF/NDF later, at a <strong>checkpoint</strong> (periodic, bounds recovery time) or under memory pressure from the <strong>lazy writer</strong></li>
</ol>
<p>This ordering is why the log must be sequential and fast, why log-file latency directly caps write throughput, and why crash recovery can replay a log even when the data page never made it to disk.</p>
<pre><code class="language-sql">-- Write activity and stalls, per file, in this database
SELECT df.name AS logical_name, df.type_desc,
       vfs.num_of_writes,
       vfs.num_of_bytes_written / 1048576  AS written_mb,
       vfs.io_stall_write_ms,
       CAST(vfs.io_stall_write_ms / NULLIF(vfs.num_of_writes, 0) AS decimal(12, 2)) AS avg_write_stall_ms
FROM   sys.master_files AS df
JOIN   sys.dm_io_virtual_file_stats(DB_ID(), NULL) AS vfs
       ON vfs.file_id = df.file_id
WHERE  df.database_id = DB_ID()
ORDER  BY vfs.io_stall_write_ms DESC;</code></pre>
`
    },
    {
      h: "Locks and latches side by side",
      html: `
<p>The lock manager and the buffer manager both guard data, but at different levels and timescales. Mixing them up leads to the wrong fix:</p>
<table>
  <tr><th></th><th><strong>Lock</strong></th><th><strong>Latch</strong></th></tr>
  <tr><td>Purpose</td><td>Transactional correctness (isolation, concurrency)</td><td>Physical integrity of an in-memory structure</td></tr>
  <tr><td>Held for</td><td>Duration of the transaction (or shorter with read committed snapshot)</td><td>Milliseconds — while a page or structure is touched</td></tr>
  <tr><td>Scope</td><td>Row, key, page, object, schema</td><td>Page, extent, allocation structure, internal object</td></tr>
  <tr><td>Contention wait</td><td><code>LCK_M_S</code>, <code>LCK_M_X</code>, <code>LCK_M_U</code></td><td><code>PAGELATCH_SH</code>, <code>PAGELATCH_UP</code>, <code>RESOURCE_SEMAPHORE</code></td></tr>
  <tr><td>First response</td><td>Find the blocking head via <code>blocking_session_id</code></td><td>Find the hot page (e.g. allocation pages, tempdb)</td></tr>
</table>
<p>Note the tell: <code>PAGELATCH</code> waits have <em>no</em> blocking session — nothing is “blocking” the request; the physical page itself is busy. That signature appears with hot pages such as allocation bitmaps, insert-order ranges in a clustered index, and tempdb allocation during heavy ad-hoc work.</p>
`
    },
    {
      h: "Measuring the storage engine",
      html: `
<p>Two views give you the complete picture — file-level stalls from the DMV, and wait types from the scheduler's perspective:</p>
<pre><code class="language-sql">-- Per-file read latency for the current database
SELECT df.name AS logical_name,
       df.type_desc,
       vfs.num_of_reads,
       vfs.num_of_bytes_read / 1048576 AS read_mb,
       CAST(vfs.io_stall_read_ms / NULLIF(vfs.num_of_reads, 0) AS decimal(12, 2)) AS avg_read_ms,
       CAST(100.0 * vfs.io_stall_read_ms /
            NULLIF(vfs.io_stall_read_ms + vfs.io_stall_write_ms, 0) AS decimal(5, 2)) AS read_stall_pct
FROM   sys.master_files AS df
JOIN   sys.dm_io_virtual_file_stats(DB_ID(), NULL) AS vfs
       ON vfs.file_id = df.file_id
WHERE  df.database_id = DB_ID()
ORDER  BY avg_read_ms DESC;</code></pre>
<pre><code class="language-sql">-- Storage-engine waits since the last counter reset
SELECT wait_type, waiting_tasks_count, wait_time_ms,
       wait_time_ms / NULLIF(waiting_tasks_count, 0) AS avg_wait_ms
FROM   sys.dm_os_wait_stats
WHERE  wait_type LIKE N'PAGEIOLATCH%'
    OR wait_type LIKE N'WRITELOG%'
    OR wait_type IN (N'ASYNC_IO_COMPLETION', N'IO_COMPLETION', N'BACKUPIO')
ORDER  BY wait_time_ms DESC;</code></pre>
<p>Healthy data files sit well under 10 ms average read stall on enterprise storage; the log is stricter still (see ch04-10). Persistent double-digit stalls are a storage conversation, not a query-tuning conversation.</p>
`
    }
  ],

  scenario: {
    title: "Order entry slowed to 3-second pauses after a filegroup move",
    html: `
<p>At 09:40 the order-entry application began stalling intermittently — a 2–3 second freeze, then normal operation, repeating every few minutes. Plans were unchanged and nothing was blocked. Top waits were <code>PAGEIOLATCH_SH</code>, and <code>sys.dm_io_virtual_file_stats</code> showed one secondary data file with an average read stall of 48 ms while its sibling files sat at 2 ms.</p>
<p>Diagnosis: an “unused” filegroup had been moved to a new storage tier the previous weekend — a slow, heavily shared archive LUN. The hot table's nonclustered index lived there, so every selective lookup paid 48 ms of latency. The storage engine was not broken; it was serving from the wrong device.</p>
<p>Resolution: with approval, the DBA set the filegroup offline path — take the database to a maintenance window, <code>ALTER DATABASE … MODIFY FILE</code> to relocate the file to the original tier, and bring it back — then verified average read stalls returned under 3 ms. Prevention: per-file latency baselines in monitoring with an alert at 20 ms, and a rule that no production file moves tiers without an I/O benchmark first.</p>
`
  },

  interview: [
    {
      q: "Explain logical read, physical read, and a latch.",
      a: "A logical read is a page request served by the buffer pool, counted regardless of where the page was; a physical read is one of those requests that missed and had to fetch the page from disk. A latch is the short-lived internal guard the buffer manager takes on a page while reading or modifying it — milliseconds long, unrelated to transactional locking."
    },
    {
      q: "Why does SQL Server write to the log before writing the data page?",
      a: "Write-Ahead Logging guarantees durability with minimal data-page writes: the log record carries enough information to redo (and undo) the change, so a commit can be acknowledged once the log is flushed. Data pages can be written later by checkpoint or lazy writer, and if the server crashes in between, recovery replays the log — which is why log throughput caps write performance."
    },
    {
      q: "You see PAGEIOLATCH_SH dominating the waits. Where do you look next?",
      a: "At per-file latency: sys.dm_io_virtual_file_stats for io_stall_read_ms and average read stall per file. Then check buffer pool health (page life expectancy, buffer hit ratio) to rule out memory pressure, and finally the workload itself for large scans. The DMV tells you whether it is one slow file, saturated storage, or a working set that no longer fits in RAM."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “Where the relational engine decides _____ to do, the storage engine does the work of touching data.”",
      "options": [
        "Transaction manager / log writer",
        "Heap",
        "what"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Where the relational engine decides what to do, the storage engine does the work of touching data. It has four components, each with a distinct failure mode:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Access methods: heaps and b-trees”?",
      "options": [
        "Note the tell: PAGELATCH waits have no blocking session — nothing is “blocking” the request; the physical page itself is busy.",
        "Every user table lives in one of two structures, and the access method chosen for it determines the cost of every query against it:",
        "The lock manager and the buffer manager both guard data, but at different levels and timescales."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Every user table lives in one of two structures, and the access method chosen for it determines the cost of every query against it:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Reads: logical, physical, and the latch”?",
      "options": [
        "Three different counters get confused constantly, and the distinction matters for diagnosis:",
        "Write-Ahead Logging (WAL)",
        "This ordering is why the log must be sequential and fast, why log-file latency directly caps write throughput, and why crash recovery can replay a log even when the data page…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Three different counters get confused constantly, and the distinction matters for diagnosis:”"
    },
    {
      "question": "Complete the lesson statement: “The storage engine follows _____, topic ch04-17 in depth:”",
      "options": [
        "Clustered index",
        "are",
        "Write-Ahead Logging (WAL)"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Modifications never write the data page first. The storage engine follows Write-Ahead Logging (WAL), topic ch04-17 in depth:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Locks and latches side by side”?",
      "options": [
        "This ordering is why the log must be sequential and fast, why log-file latency directly caps write throughput, and why crash recovery can replay a log even when the data page…",
        "The lock manager and the buffer manager both guard data, but at different levels and timescales.",
        "Write-Ahead Logging (WAL)"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The lock manager and the buffer manager both guard data, but at different levels and timescales. Mixing them up leads to the wrong fix:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Measuring the storage engine”?",
      "options": [
        "Two views give you the complete picture — file-level stalls from the DMV, and wait types from the scheduler's perspective:",
        "This ordering is why the log must be sequential and fast, why log-file latency directly caps write throughput, and why crash recovery can replay a log even when the data page…",
        "The lock manager and the buffer manager both guard data, but at different levels and timescales."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Two views give you the complete picture — file-level stalls from the DMV, and wait types from the scheduler's perspective:”"
    },
    {
      "question": "Complete the lesson statement: “A _____ walks 3–4 pages from root to leaf; a scan reads every leaf page in order.”",
      "options": [
        "scan",
        "lookup",
        "seek"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A seek walks 3–4 pages from root to leaf; a scan reads every leaf page in order. A key/row lookup is a second seek per row — the single most common source of a “good index, terrible plan” incident. Storage-engine tuning is largely the art of removing lookups and scans by covering the query.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Reads: logical, physical, and the latch”?",
      "options": [
        "Page, extent, allocation structure, internal object",
        "A query doing 40,000 logical reads and zero physical reads is still expensive — it is burning CPU walking pages in RAM.",
        "Milliseconds — while a page or structure is touched"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A query doing 40,000 logical reads and zero physical reads is still expensive — it is burning CPU walking pages in RAM. Conversely, a modest number of logical reads with high physical reads means a cold or thrashing buffer pool. The wait type tells you which state you are in: PAGEIOLATCH_SH means “waiting for a disk read to finish so I can latch the page”.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Writes: the write-ahead path”?",
      "options": [
        "This ordering is why the log must be sequential and fast, why log-file latency directly caps write throughput, and why crash recovery can replay a log even when the data page…",
        "Page, extent, allocation structure, internal object",
        "PAGELATCH_SH, PAGELATCH_UP, RESOURCE_SEMAPHORE"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “This ordering is why the log must be sequential and fast, why log-file latency directly caps write throughput, and why crash recovery can replay a log even when the data page never made it to disk.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Locks and latches side by side”?",
      "options": [
        "Physical integrity of an in-memory structure",
        "Milliseconds — while a page or structure is touched",
        "Note the tell: PAGELATCH waits have no blocking session — nothing is “blocking” the request; the physical page itself is busy."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Note the tell: PAGELATCH waits have no blocking session — nothing is “blocking” the request; the physical page itself is busy. That signature appears with hot pages such as allocation bitmaps, insert-order ranges in a clustered index, and tempdb allocation during heavy ad-hoc work.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “Where the relational engine decides _____ to do, the storage engine does the work of touching data.”",
      "options": [
        "Transaction manager / log writer",
        "Heap",
        "what"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Where the relational engine decides what to do, the storage engine does the work of touching data. It has four components, each with a distinct failure mode:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Access methods: heaps and b-trees”?",
      "options": [
        "Note the tell: PAGELATCH waits have no blocking session — nothing is “blocking” the request; the physical page itself is busy.",
        "Every user table lives in one of two structures, and the access method chosen for it determines the cost of every query against it:",
        "The lock manager and the buffer manager both guard data, but at different levels and timescales."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Every user table lives in one of two structures, and the access method chosen for it determines the cost of every query against it:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Reads: logical, physical, and the latch”?",
      "options": [
        "Three different counters get confused constantly, and the distinction matters for diagnosis:",
        "Write-Ahead Logging (WAL)",
        "This ordering is why the log must be sequential and fast, why log-file latency directly caps write throughput, and why crash recovery can replay a log even when the data page…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Three different counters get confused constantly, and the distinction matters for diagnosis:”"
    },
    {
      "question": "Complete the lesson statement: “The storage engine follows _____, topic ch04-17 in depth:”",
      "options": [
        "Clustered index",
        "are",
        "Write-Ahead Logging (WAL)"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Modifications never write the data page first. The storage engine follows Write-Ahead Logging (WAL), topic ch04-17 in depth:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Locks and latches side by side”?",
      "options": [
        "This ordering is why the log must be sequential and fast, why log-file latency directly caps write throughput, and why crash recovery can replay a log even when the data page…",
        "The lock manager and the buffer manager both guard data, but at different levels and timescales.",
        "Write-Ahead Logging (WAL)"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The lock manager and the buffer manager both guard data, but at different levels and timescales. Mixing them up leads to the wrong fix:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Measuring the storage engine”?",
      "options": [
        "Two views give you the complete picture — file-level stalls from the DMV, and wait types from the scheduler's perspective:",
        "This ordering is why the log must be sequential and fast, why log-file latency directly caps write throughput, and why crash recovery can replay a log even when the data page…",
        "The lock manager and the buffer manager both guard data, but at different levels and timescales."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Two views give you the complete picture — file-level stalls from the DMV, and wait types from the scheduler's perspective:”"
    },
    {
      "question": "Complete the lesson statement: “A _____ walks 3–4 pages from root to leaf; a scan reads every leaf page in order.”",
      "options": [
        "scan",
        "lookup",
        "seek"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A seek walks 3–4 pages from root to leaf; a scan reads every leaf page in order. A key/row lookup is a second seek per row — the single most common source of a “good index, terrible plan” incident. Storage-engine tuning is largely the art of removing lookups and scans by covering the query.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Reads: logical, physical, and the latch”?",
      "options": [
        "Page, extent, allocation structure, internal object",
        "A query doing 40,000 logical reads and zero physical reads is still expensive — it is burning CPU walking pages in RAM.",
        "Milliseconds — while a page or structure is touched"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A query doing 40,000 logical reads and zero physical reads is still expensive — it is burning CPU walking pages in RAM. Conversely, a modest number of logical reads with high physical reads means a cold or thrashing buffer pool. The wait type tells you which state you are in: PAGEIOLATCH_SH means “waiting for a disk read to finish so I can latch the page”.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Writes: the write-ahead path”?",
      "options": [
        "This ordering is why the log must be sequential and fast, why log-file latency directly caps write throughput, and why crash recovery can replay a log even when the data page…",
        "Page, extent, allocation structure, internal object",
        "PAGELATCH_SH, PAGELATCH_UP, RESOURCE_SEMAPHORE"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “This ordering is why the log must be sequential and fast, why log-file latency directly caps write throughput, and why crash recovery can replay a log even when the data page never made it to disk.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Locks and latches side by side”?",
      "options": [
        "Physical integrity of an in-memory structure",
        "Milliseconds — while a page or structure is touched",
        "Note the tell: PAGELATCH waits have no blocking session — nothing is “blocking” the request; the physical page itself is busy."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Note the tell: PAGELATCH waits have no blocking session — nothing is “blocking” the request; the physical page itself is busy. That signature appears with hot pages such as allocation bitmaps, insert-order ranges in a clustered index, and tempdb allocation during heavy ad-hoc work.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “Where the relational engine decides _____ to do, the storage engine does the work of touching data.”",
      "options": [
        "Transaction manager / log writer",
        "Heap",
        "what"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Where the relational engine decides what to do, the storage engine does the work of touching data. It has four components, each with a distinct failure mode:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Access methods: heaps and b-trees”?",
      "options": [
        "Note the tell: PAGELATCH waits have no blocking session — nothing is “blocking” the request; the physical page itself is busy.",
        "Every user table lives in one of two structures, and the access method chosen for it determines the cost of every query against it:",
        "The lock manager and the buffer manager both guard data, but at different levels and timescales."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Every user table lives in one of two structures, and the access method chosen for it determines the cost of every query against it:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Reads: logical, physical, and the latch”?",
      "options": [
        "Three different counters get confused constantly, and the distinction matters for diagnosis:",
        "Write-Ahead Logging (WAL)",
        "This ordering is why the log must be sequential and fast, why log-file latency directly caps write throughput, and why crash recovery can replay a log even when the data page…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Three different counters get confused constantly, and the distinction matters for diagnosis:”"
    },
    {
      "question": "Complete the lesson statement: “The storage engine follows _____, topic ch04-17 in depth:”",
      "options": [
        "Clustered index",
        "are",
        "Write-Ahead Logging (WAL)"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Modifications never write the data page first. The storage engine follows Write-Ahead Logging (WAL), topic ch04-17 in depth:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Locks and latches side by side”?",
      "options": [
        "This ordering is why the log must be sequential and fast, why log-file latency directly caps write throughput, and why crash recovery can replay a log even when the data page…",
        "The lock manager and the buffer manager both guard data, but at different levels and timescales.",
        "Write-Ahead Logging (WAL)"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The lock manager and the buffer manager both guard data, but at different levels and timescales. Mixing them up leads to the wrong fix:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Measuring the storage engine”?",
      "options": [
        "Two views give you the complete picture — file-level stalls from the DMV, and wait types from the scheduler's perspective:",
        "This ordering is why the log must be sequential and fast, why log-file latency directly caps write throughput, and why crash recovery can replay a log even when the data page…",
        "The lock manager and the buffer manager both guard data, but at different levels and timescales."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Two views give you the complete picture — file-level stalls from the DMV, and wait types from the scheduler's perspective:”"
    },
    {
      "question": "Complete the lesson statement: “A _____ walks 3–4 pages from root to leaf; a scan reads every leaf page in order.”",
      "options": [
        "scan",
        "lookup",
        "seek"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A seek walks 3–4 pages from root to leaf; a scan reads every leaf page in order. A key/row lookup is a second seek per row — the single most common source of a “good index, terrible plan” incident. Storage-engine tuning is largely the art of removing lookups and scans by covering the query.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Reads: logical, physical, and the latch”?",
      "options": [
        "Page, extent, allocation structure, internal object",
        "A query doing 40,000 logical reads and zero physical reads is still expensive — it is burning CPU walking pages in RAM.",
        "Milliseconds — while a page or structure is touched"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A query doing 40,000 logical reads and zero physical reads is still expensive — it is burning CPU walking pages in RAM. Conversely, a modest number of logical reads with high physical reads means a cold or thrashing buffer pool. The wait type tells you which state you are in: PAGEIOLATCH_SH means “waiting for a disk read to finish so I can latch the page”.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Writes: the write-ahead path”?",
      "options": [
        "This ordering is why the log must be sequential and fast, why log-file latency directly caps write throughput, and why crash recovery can replay a log even when the data page…",
        "Page, extent, allocation structure, internal object",
        "PAGELATCH_SH, PAGELATCH_UP, RESOURCE_SEMAPHORE"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “This ordering is why the log must be sequential and fast, why log-file latency directly caps write throughput, and why crash recovery can replay a log even when the data page never made it to disk.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Locks and latches side by side”?",
      "options": [
        "Physical integrity of an in-memory structure",
        "Milliseconds — while a page or structure is touched",
        "Note the tell: PAGELATCH waits have no blocking session — nothing is “blocking” the request; the physical page itself is busy."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Note the tell: PAGELATCH waits have no blocking session — nothing is “blocking” the request; the physical page itself is busy. That signature appears with hot pages such as allocation bitmaps, insert-order ranges in a clustered index, and tempdb allocation during heavy ad-hoc work.”"
    }
  ],
  takeaways: [
    "Storage engine = access methods + buffer manager + lock manager + log writer, each with its own wait-type signature",
    "Logical reads measure query design; physical reads measure cache misses; latches guard pages, locks guard transactions",
    "WAL: log records are flushed before data pages — the log, not the data file, sets write throughput",
    "A seek is 3–4 pages; a scan is every leaf page; a lookup per row is the classic hidden cost in a “good” plan",
    "sys.dm_io_virtual_file_stats exposes per-file stalls — average read/write stall is your first storage health check",
    "PAGELATCH waits have no blocking session: the page itself is busy, not the transaction"
  ]
};
