/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch04-14.html */

window.TOPIC = {
  id: "ch04-14",
  title: "Dirty Pages",

  lead: "A dirty page is a page whose in-memory copy is newer than its copy on disk — and the entire checkpoint, lazy writer, and log-truncation machinery exists to manage those pages without ever breaking the write-ahead rule.",

  objectives: [
    "Define a dirty page and trace how a page becomes dirty",
    "Explain the dirty page table and who reads it",
    "Compare the two writers of dirty pages: checkpoint and lazy writer",
    "Understand how a dirty-page backlog pins the transaction log",
    "Measure the dirty load before users feel it"
  ],

  sections: [
    {
      h: "From update to dirty",
      html: `
<p>A page in the buffer pool starts <strong>clean</strong> — identical to its copy in the data file. The moment a transaction modifies it, the page becomes dirty, but the order of operations is strictly prescribed by the write-ahead log (WAL) rule:</p>
<ul>
  <li><strong>1. Log first</strong> — the log record describing the change is written to the log buffer (and must reach the log file before the data page does)</li>
  <li><strong>2. Modify in memory</strong> — the page is latched, the row is changed, and the page header's m_lsn is updated to the LSN of that log record</li>
  <li><strong>3. Mark dirty</strong> — the buffer descriptor's modified flag is set, and the page is recorded in the database's <strong>dirty page table</strong> — once, no matter how many times it is touched afterwards</li>
  <li><strong>4. Leave it</strong> — nothing is written to the data file yet. The commit only flushes the log</li>
</ul>
<p>From this moment, the data file's copy of the page is stale. Every reader that finds this page in the pool sees the newest version; every process that needs the disk copy — restore, backup file copy, crash recovery — must reason about the gap.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Dirty page lifecycle">
    <defs>
      <marker id="p14-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="30" y="34" width="185" height="66" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="122" y="60" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Clean page</text>
    <text x="122" y="82" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">buffer copy = disk copy</text>

    <rect x="288" y="34" width="196" height="66" rx="10" fill="var(--amber)" opacity="0.9"/>
    <text x="386" y="60" text-anchor="middle" fill="#1b1200" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Dirty page</text>
    <text x="386" y="82" text-anchor="middle" fill="#1b1200" font-size="11.5" font-family="Segoe UI, sans-serif">m_lsn updated · disk stale</text>

    <rect x="556" y="34" width="174" height="66" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="643" y="60" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Data file on disk</text>
    <text x="643" y="82" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">catches up only when written</text>

    <line x1="215" y1="67" x2="286" y2="67" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#p14-arrow)"/>
    <text x="250" y="122" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">log record, then modify</text>
    <line x1="484" y1="67" x2="554" y2="67" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#p14-arrow)"/>
    <text x="520" y="122" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">checkpoint / lazy writer</text>

    <rect x="120" y="156" width="520" height="72" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="184" text-anchor="middle" fill="var(--accent-strong)" font-size="15.5" font-weight="700" font-family="Segoe UI, sans-serif">Dirty page table — one entry per dirty page</text>
    <text x="380" y="208" text-anchor="middle" fill="var(--accent-strong)" font-size="12" font-family="Segoe UI, sans-serif">checkpoint scans it · entries removed as pages are written</text>

    <line x1="386" y1="100" x2="386" y2="154" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#p14-arrow)"/>

    <rect x="60" y="262" width="640" height="56" rx="10" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="380" y="286" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">While a page stays dirty, its change LSN pins the log</text>
    <text x="380" y="307" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">truncation cannot pass the min recovery LSN until the oldest dirty page reaches disk</text>
  </svg>
  <div class="figcaption">Figure 1 — Dirty page lifecycle: modify in memory after the log, track once, flush later.</div>
</div>
`
    },
    {
      h: "The dirty page table",
      html: `
<p>The <strong>dirty page table (DPT)</strong> is an in-memory, per-database list of pages that are modified but not yet written. Its design is deliberately simple:</p>
<ul>
  <li>A page is added <strong>the first time</strong> it is marked dirty after being clean — subsequent updates change the page but not the list</li>
  <li>The <strong>checkpoint reads it</strong> as its work list: write these pages, then remove them as each write completes</li>
  <li>The <strong>oldest entry defines the min recovery LSN</strong> — the earliest log record still required to repair a page that is not on disk</li>
  <li>It lives only in memory: after a crash it is rebuilt during the analysis phase of recovery, starting from the last checkpoint</li>
</ul>
<p>That last point is the link between this topic and crash recovery: the DPT is not just a write queue, it is the list recovery will need if the power fails right now.</p>
`
    },
    {
      h: "Who writes dirty pages, and when",
      html: `
<p>Two background writers drain the DPT, for different reasons:</p>
<table>
  <tr><th></th><th>Checkpoint</th><th>Lazy writer</th></tr>
  <tr><td><strong>Trigger</strong></td><td>Periodic — recovery-time budget</td><td>Memory pressure — free buffers running low</td></tr>
  <tr><td><strong>Scope</strong></td><td>All dirty pages of the database</td><td>Enough dirty pages to reclaim free buffers</td></tr>
  <tr><td><strong>Log record</strong></td><td>Writes LOP_BEGIN_CKPT / LOP_END_CKPT</td><td>None — data pages only</td></tr>
  <tr><td><strong>Goal</strong></td><td>Bound recovery time</td><td>Keep the pool supplied with free frames</td></tr>
  <tr><td><strong>Failure mode</strong></td><td>Slow storage → long checkpoints → log truncation stalls</td><td>Chronic memory pressure → PLE collapse, write churn</td></tr>
</table>
<p>Neither writer is triggered by a commit — that is the <em>no-force</em> half of SQL Server's buffer policy. A transaction can commit with all its pages still dirty, because the log already contains everything needed to recreate them.</p>
`
    },
    {
      h: "Why a dirty backlog pins the log",
      html: `
<p>The transaction log can only be truncated up to the <strong>min recovery LSN</strong> — the oldest change that still exists only in a dirty page. As long as one page from an hour ago is unwritten, log records from that hour must stay:</p>
<ul>
  <li>In <strong>simple recovery</strong>, an automatic checkpoint performs truncation — if checkpoints lag, truncation lags, and the LDF autogrows</li>
  <li>In <strong>full recovery</strong>, a log backup alone is not enough: truncation still waits for the checkpoint to pass the oldest dirty page</li>
  <li>A large dirty backlog also means a large redo pass after a crash — recovery time grows with unflushed pages, not with database size</li>
</ul>
<p>The metric that exposes this directly is <code>log_space_in_use_for_recovery_percent</code> — the share of the log held open for recovery rather than reusable.</p>
`
    },
    {
      h: "Measuring the dirty load",
      html: `
<pre><code class="language-sql">-- How much of the log is pinned for recovery right now?
USE SalesDB;
SELECT log_space_used_percent,
       log_space_in_use_for_recovery_percent
FROM   sys.dm_db_log_space_usage;</code></pre>
<pre><code class="language-sql">-- Raw Buffer Manager counters (named instances appear as MSSQL$INST:Buffer Manager)
SELECT counter_name, cntr_value
FROM   sys.dm_os_performance_counters
WHERE  object_name LIKE '%Buffer Manager%'
  AND  counter_name IN ('Database Pages', 'Checkpoint pages/sec',
                        'Lazy writes/sec', 'Free list stalls/sec')
  AND  cntr_type IN (65792, 2724111616);</code></pre>
<p>Reading the set together: <em>Database Pages</em> is the pool's page count, <em>Checkpoint pages/sec</em> shows checkpoint write volume, <em>Lazy writes/sec</em> should stay near zero on a healthy server (it rises only under memory pressure), and a growing recovery-percent tells you the log is being held by unwritten pages. There is no counter for "dirty pages" itself — this combination is the closest honest approximation.</p>
`
    },
    {
      h: "Deeper dive: Dirty Pages",
      html: `
<p>This section consolidates <strong>Dirty Pages</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O. Eight pages form an extent. Data and index pages live in MDF/NDF files; the transaction log is a separate sequential structure of virtual log files.</p>
<p>The buffer pool caches pages in memory. A read that finds a page in the pool is served from RAM in microseconds; a miss requires a physical read milliseconds long. This is why memory sizing dominates performance.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Dirty Pages sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Mechanism</th><th>Trigger</th><th>Effect</th></tr>
  <tr><td>Checkpoint</td><td>Periodic / log volume</td><td>Flush dirty pages, bound recovery</td></tr>
  <tr><td>Lazy writer</td><td>Memory pressure</td><td>Evict clean pages</td></tr>
  <tr><td>Write-ahead log</td><td>Every modification</td><td>Log durable before data</td></tr>
</table>
<p>Pages in the buffer pool are clean if they match disk, dirty if modified. Checkpoints write dirty pages to disk to bound recovery time; the lazy writer evicts pages under memory pressure, flushing dirty pages first.</p>
<p>Use the following as a starting point when investigating Dirty Pages. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Dirty Pages
-- Buffer pool usage per database
SELECT db_name(database_id) AS db,
       count(*) * 8 / 1024 AS buffer_mb
FROM   sys.dm_os_buffer_descriptors
GROUP BY database_id
ORDER BY buffer_mb DESC;</code></pre>
<p>Write-ahead logging guarantees the log record for a change reaches disk before the data page. A committed transaction's log is durable even if the data page is not yet written, which is what makes crash recovery possible.</p>
      `,
    }
  ],

  scenario: {
    title: "The log file grew to 600 GB and truncation stopped dead",
    html: `
<p>An ETL window pushes 40 GB per hour into a simple-recovery database. Around midnight the array's write latency climbs past 50 ms, checkpoints become throttled and take longer than the interval between them, and the dirty-page backlog starts to grow. <code>log_reuse_wait_desc</code> sits on CHECKPOINT, truncation stops, and the LDF autogrows every few minutes. At 02:10 the DBA is paged: the log volume has 12 GB free and the array is at 94%.</p>
<p>Emergency actions: pause the ETL load, confirm <code>log_space_in_use_for_recovery_percent</code> near 90%, and free space by letting one checkpoint complete under reduced load rather than shrinking a pinned log (shrink would fail anyway). Root cause and fix: the checkpoint could not keep pace with the write rate on saturated storage — the team moved the ETL database to its own LUN, cut batch sizes to bound dirty-page production, and set <code>TARGET_RECOVERY_TIME</code> so dirty pages are drained continuously instead of in spikes. Prevention: alert on recovery-percent and checkpoint latency, not just log file free space.</p>
`
  },

  interview: [
    {
      q: "What makes a page dirty, and who keeps track of it?",
      a: "Any logged modification to a page in the buffer pool makes it dirty: after the log record is written, the row is changed in memory, m_lsn is updated, and the descriptor is flagged. The storage engine records the page in the database's dirty page table the first time it becomes dirty; checkpoints use that list as their work list."
    },
    {
      q: "Can a committed transaction's changes be missing from the data files?",
      a: "Yes — SQL Server runs no-force, so a commit only flushes the log; its data pages may stay dirty in memory indefinitely. That is safe because recovery redoes log records during redo. Conversely, steal means uncommitted pages can be on disk, which is why undo exists."
    },
    {
      q: "Why can a log file not truncate even though log backups run on schedule?",
      a: "Truncation cannot pass the min recovery LSN. If checkpoints cannot write the oldest dirty pages — because of I/O saturation, throttling, or a stalled checkpoint — those log records must be retained for redo regardless of log backups. Check the recovery-percent in sys.dm_db_log_space_usage and checkpoint write activity before blaming the backup job."
    }
  ],

  takeaways: [
    "A page becomes dirty after its log record exists: log first, modify in memory, mark dirty",
    "The dirty page table is added to once per clean-to-dirty transition and drained by checkpoints",
    "Checkpoints bound recovery time; the lazy writer responds to memory pressure — different jobs",
    "The oldest unwritten change sets the min recovery LSN and pins the log from truncating",
    "log_space_in_use_for_recovery_percent is the honest gauge of a dirty backlog",
    "A dirty backlog means slow recovery and a growing LDF — both are symptoms of write-path saturation"
  ]
};
