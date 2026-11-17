/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch04-10.html */

window.TOPIC = {
  id: "ch04-10",
  title: "Transaction Log: LDF",

  lead: "The transaction log is SQL Server's diary: every change is recorded there in order before any data page moves, so a crash can be undone or replayed exactly. When the LDF cannot grow or cannot be reused, the whole database stops writing — which makes the log the single most operationally important file you manage.",

  objectives: [
    "Explain what the log records and why WAL requires log-first writes",
    "Describe log reuse: truncation, log backups, and log_reuse_wait",
    "Recognise log growth incidents and the transactions behind them",
    "Monitor log usage, VLF health, and latency with DMVs"
  ],

  sections: [
    {
      h: "Why the log exists",
      html: `
<p>Data pages are modified in memory (the buffer pool) and written to disk much later. That design is fast, but it means the log is the only durable record of what happened. <strong>Write-Ahead Logging</strong> closes the gap with one rule: <em>the log record for a change must be flushed to the LDF before the modified data page is written to the MDF/NDF</em>.</p>
<p>Because the log holds enough information to <strong>redo</strong> (reapply committed work) and <strong>undo</strong> (roll back uncommitted work), recovery after a crash needs only the log — the data file may be seconds or hours stale. Everything about log design follows from this: sequential writes, no page splits, no reads of unrelated pages, and a flush at every commit.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Transaction log write-ahead flow and LSN chain">
    <defs>
      <marker id="a10-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
      <marker id="a10-arrow-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"/>
      </marker>
    </defs>

    <rect x="16" y="14" width="170" height="54" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="101" y="36" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">DML modifies a page</text>
    <text x="101" y="56" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">page becomes dirty in RAM</text>

    <rect x="200" y="14" width="170" height="54" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="285" y="36" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Log record built</text>
    <text x="285" y="56" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">LSN · txn id · page · before/after</text>

    <rect x="384" y="14" width="170" height="54" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="469" y="36" text-anchor="middle" fill="var(--accent-strong)" font-size="12.5" font-weight="700" font-family="Segoe UI, sans-serif">Log writer flushes</text>
    <text x="469" y="56" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">sequential write to the LDF</text>

    <rect x="568" y="14" width="170" height="54" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="653" y="36" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Commit acknowledged</text>
    <text x="653" y="56" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">client receives success</text>

    <rect x="16" y="88" width="722" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="377" y="107" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Write-Ahead Logging: the data page is written later — checkpoint or lazy writer</text>
    <text x="377" y="127" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">a crash between the two is healed by redo/undo from the log</text>

    <rect x="16" y="154" width="722" height="112" rx="13" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="377" y="177" text-anchor="middle" fill="var(--accent-strong)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">Transaction log — a sequential chain of LSNs inside VLFs</text>

    <rect x="40" y="192" width="100" height="46" rx="7" fill="var(--surface)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="90" y="211" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="600" font-family="Segoe UI, sans-serif">VLF 1</text>
    <text x="90" y="230" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">active</text>

    <rect x="156" y="192" width="100" height="46" rx="7" fill="var(--surface)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="206" y="211" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="600" font-family="Segoe UI, sans-serif">VLF 2</text>
    <text x="206" y="230" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">active</text>

    <rect x="272" y="192" width="100" height="46" rx="7" fill="var(--surface)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="322" y="211" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="600" font-family="Segoe UI, sans-serif">VLF 3</text>
    <text x="322" y="230" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">active</text>

    <rect x="388" y="192" width="100" height="46" rx="7" fill="var(--surface)" stroke="var(--border)"/>
    <text x="438" y="211" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="600" font-family="Segoe UI, sans-serif">VLF 4</text>
    <text x="438" y="230" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">reusable</text>

    <rect x="504" y="192" width="100" height="46" rx="7" fill="var(--surface)" stroke="var(--border)"/>
    <text x="554" y="211" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="600" font-family="Segoe UI, sans-serif">VLF 5</text>
    <text x="554" y="230" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">reusable</text>

    <rect x="620" y="192" width="100" height="46" rx="7" fill="var(--surface)" stroke="var(--border)"/>
    <text x="670" y="211" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="600" font-family="Segoe UI, sans-serif">VLF 6</text>
    <text x="670" y="230" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">free</text>

    <rect x="16" y="284" width="722" height="40" rx="9" fill="var(--surface)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="377" y="309" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Truncation point advances only when a log backup runs (FULL) or at a checkpoint (SIMPLE) — then old VLFs become reusable</text>

    <line x1="186" y1="41" x2="198" y2="41" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a10-arrow)"/>
    <line x1="370" y1="41" x2="382" y2="41" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a10-arrow)"/>
    <line x1="554" y1="41" x2="566" y2="41" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a10-arrow)"/>
    <line x1="469" y1="68" x2="469" y2="86" stroke="var(--accent)" stroke-width="1.8" marker-end="url(#a10-arrow-acc)"/>
    <line x1="377" y1="134" x2="377" y2="152" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a10-arrow)"/>
    <line x1="377" y1="266" x2="377" y2="282" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a10-arrow)"/>
  </svg>
  <div class="figcaption">Figure 1 — Commit path (top) and the LSN chain inside virtual log files (bottom).</div>
</div>
`
    },
    {
      h: "Anatomy of a log record",
      html: `
<p>Log records are small, self-describing, and written in LSN (log sequence number) order. An LSN is a tuple — <em>virtual log file id, block, offset</em> — which uniquely locates any record in the file and forms the chain recovery follows.</p>
<table>
  <tr><th>Field</th><th>Purpose</th></tr>
  <tr><td><strong>LSN</strong></td><td>Position in the log; every record also stores the LSN of its predecessor — the chain</td></tr>
  <tr><td><strong>Transaction ID</strong></td><td>Links records belonging to the same transaction for undo</td></tr>
  <tr><td><strong>Record type</strong></td><td>Begin, commit, abort, update, index insert/delete, undo/redo information, checkpoint, backup</td></tr>
  <tr><td><strong>Page ID + slot + offset</strong></td><td>The exact row location the change applies to — so recovery can find the page</td></tr>
  <tr><td><strong>Before/after image</strong></td><td>Undo data (previous value) for rollback, redo data (new value) for replay</td></tr>
  <tr><td><strong>Context / length</strong></td><td>What generated the record and how long it is</td></tr>
</table>
<p>Only <em>physical</em> changes generate log records — logical operations like <code>UPDATE</code> become row-level page modifications. Index maintenance, allocation changes, and page splits all log as well, which is why an index rebuild can generate far more log than the table's data size.</p>
`
    },
    {
      h: "Log reuse: truncation is not shrinking",
      html: `
<p>The LDF never needs to hold every record ever written. <strong>Truncation</strong> marks space occupied by records that are no longer needed for recovery or point-in-time restore as reusable — the file size stays the same, the space becomes available again. <strong>Shrinking</strong> is a different, rarely appropriate operation that returns files to the OS (see the operations chapter).</p>
<p>Truncation happens only when nothing blocks it, and <code>sys.databases.log_reuse_wait_desc</code> names the blocker:</p>
<table>
  <tr><th><code>log_reuse_wait_desc</code></th><th>Meaning</th><th>Your action</th></tr>
  <tr><td><code>NOTHING</code></td><td>Ready to truncate</td><td>None — healthy</td></tr>
  <tr><td><code>CHECKPOINT</code></td><td>Waiting for the next checkpoint (SIMPLE recovery)</td><td>Normal; verify checkpoints are occurring</td></tr>
  <tr><td><code>LOG_BACKUP</code></td><td>Need a log backup to advance the truncation point (FULL)</td><td>Run/repair the log backup job</td></tr>
  <tr><td><code>ACTIVE_TRANSACTION</code></td><td>An open transaction pins old records</td><td>Find it — <code>sys.dm_tran_database_transactions</code></td></tr>
  <tr><td><code>AVAILABILITY_REPLICA</code> / <code>REPLICATION</code></td><td>A downstream consumer has not acknowledged</td><td>Check AG/replication latency</td></tr>
</table>
`
    },
    {
      h: "Recovery models and the backup chain",
      html: `
<p>The recovery model decides how much log is kept and whether you can recover to a moment in time:</p>
<table>
  <tr><th>Model</th><th>Log kept</th><th>Backups required</th><th>Recovery point</th></tr>
  <tr><td><strong>FULL</strong></td><td>All records until log backup</td><td>Full + regular log backups</td><td>Any point in time (to the last log backup)</td></tr>
  <tr><td><strong>BULK_LOGGED</strong></td><td>All, with minimal logging for bulk operations</td><td>Full + log backups</td><td>Point in time except across minimal-logged operations</td></tr>
  <tr><td><strong>SIMPLE</strong></td><td>Truncated at checkpoint</td><td>Full/differential only</td><td>Restore to last full/differential only</td></tr>
</table>
<p>A FULL database with no working log backup is the worst of both worlds: the log grows without limit <em>and</em> you have no point-in-time restore. If you cannot run log backups on a schedule, SIMPLE is the honest choice — but decide deliberately, because changing back to FULL requires a full backup to restart the chain.</p>
`
    },
    {
      h: "Monitoring the log",
      html: `
<p>Four DMVs cover log health: usage percentage, VLF structure, reuse blocker, and I/O latency.</p>
<pre><code class="language-sql">-- 1. Reuse blocker and recovery model for this database
SELECT name, recovery_model_desc, log_reuse_wait, log_reuse_wait_desc
FROM   sys.databases
WHERE  database_id = DB_ID();

-- 2. VLF count and size per log file (aim for hundreds, not tens of thousands)
SELECT file_id,
       COUNT(*)                     AS vlf_count,
       SUM(vlf_size_mb)             AS total_vlf_mb,
       SUM(CASE WHEN vlf_active = 1 THEN 1 ELSE 0 END) AS active_vlfs
FROM   sys.dm_db_log_info(DB_ID())
GROUP  BY file_id;

-- 3. How full is the log right now?
SELECT database_id, log_size_mb, log_space_used_percent
FROM   sys.dm_db_log_usage(DB_ID());</code></pre>
<pre><code class="language-sql">-- 4. Log file latency and open transactions pinning the log
SELECT df.name, vfs.num_of_writes,
       CAST(vfs.io_stall_write_ms / NULLIF(vfs.num_of_writes, 0) AS decimal(12, 2)) AS avg_log_write_ms
FROM   sys.master_files AS df
JOIN   sys.dm_io_virtual_file_stats(DB_ID(), NULL) AS vfs ON vfs.file_id = df.file_id
WHERE  df.database_id = DB_ID() AND df.type = 1;

SELECT t.transaction_id, t.transaction_begin_time, t.transaction_state,
       dt.database_transaction_begin_time,
       dt.database_transaction_log_bytes_used / 1048576 AS log_mb_used
FROM   sys.dm_tran_active_transactions AS t
JOIN   sys.dm_tran_database_transactions AS dt ON dt.transaction_id = t.transaction_id
WHERE  dt.database_id = DB_ID()
ORDER  BY t.transaction_begin_time;</code></pre>
<p>Healthy log write latency is sub-millisecond on enterprise storage; average write stalls above 10–20 ms directly cap transaction throughput, because every commit waits on that flush.</p>
`
    },
    {
      h: "Growth events and sizing rules",
      html: `
<p>Log growth is expensive: each event must zero-initialise the new space, holding a log lock while it does. Practical rules:</p>
<ul>
  <li><strong>Fixed increments</strong> — 256–512 MB is a common production setting; never percent growth on a log</li>
  <li><strong>Pre-size it</strong> — estimate peak workload log generation × time between truncations, then set the initial size so the file never grows during business hours</li>
  <li><strong>Alert on events</strong> — Error <code>14505</code> in the error log, <code>Log File(s) Size (KB)</code> trend, and <code>log_space_used_percent</code> above 75%</li>
  <li><strong>Watch the VLF count</strong> — a log grown in thousands of tiny increments accumulates tens of thousands of VLFs, slowing recovery and truncation (deep dive: ch04-19)</li>
</ul>
<p>After any incident-driven shrink, re-size the file deliberately to the correct steady-state value — otherwise it will simply grow back on the next peak.</p>
`
    }
  ],

  scenario: {
    title: "The LDF grew from 2 GB to 486 GB and refused to truncate",
    html: `
<p>Saturday night, the finance database's log grew from 2 GB to 486 GB in six hours and nearly filled a 1 TB volume. Writes were still succeeding — barely — because the log could grow, but the on-call DBA saw <code>log_reuse_wait_desc = LOG_BACKUP</code> in the morning and a second blocker: <code>ACTIVE_TRANSACTION</code> from a session started at 01:14.</p>
<p>Diagnosis: two failures stacked. The log backup job had been failing since Thursday (an expired credential), so in FULL recovery nothing could truncate. On top of that, the nightly ETL had opened a transaction at 01:14 and never committed — an exception path that skipped the <code>COMMIT</code>, pinning 61 GB of log records.</p>
<p>Resolution, in order: repair the credential and run an immediate log backup (truncation point advanced, most space became reusable), then kill the orphaned ETL session with approval — the transaction rolled back and released the rest. One controlled shrink returned the file to 8 GB, then it was re-sized to 32 GB to absorb a normal weekend. Prevention: alerts on log space used above 75% and on any log backup job failure, a monitoring check for transactions open longer than 30 minutes, and fixed 512 MB growth with an explicit max size so a repeat can never silently fill the volume.</p>
`
  },

  interview: [
    {
      q: "Why must the log be written before the data page?",
      a: "Write-Ahead Logging guarantees durability with minimal data-page I/O: the log record carries redo and undo information, so once the log is flushed the commit is durable. Data pages can be written later by checkpoint or lazy writer; if the server dies in between, recovery replays the log — which would be impossible if the data page had gone first."
    },
    {
      q: "Your log file is 400 GB and log_reuse_wait says ACTIVE_TRANSACTION. What now?",
      a: "Find the open transaction: join sys.dm_tran_active_transactions to sys.dm_tran_database_transactions filtered on the database to see start time and log bytes used (or DBCC OPENTRAN). Then decide with the business whether to let it finish or kill the session — after a rollback, truncation resumes. Check why it is open: an uncommitted job step, a forgotten BEGIN TRAN, or a blocked consumer."
    },
    {
      q: "How do you keep a log healthy in production?",
      a: "Pre-size it, use fixed growth increments, alert on log space used percent and growth events, monitor log write latency via dm_io_virtual_file_stats, verify log_reuse_wait_desc is NOTHING or expected values, and keep the VLF count in the hundreds rather than tens of thousands — plus a log backup schedule that actually succeeds if you are in FULL recovery."
    }
  ],

  takeaways: [
    "WAL: log records flush before data pages — that single rule is what makes recovery possible",
    "Log records are chained by LSNs and carry transaction ID, page location, and before/after images",
    "Truncation reuses space; shrinking returns space — most “log is huge” problems need neither",
    "log_reuse_wait_desc names the blocker: missing log backup, open transaction, replication/AG lag",
    "Monitor four things: log space used, VLF structure, reuse wait, and write latency",
    "Pre-size logs, grow them by fixed amounts, and alert on growth events before users notice"
  ]
};
