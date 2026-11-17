/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch04-15.html */

window.TOPIC = {
  id: "ch04-15",
  title: "Checkpoints",

  lead: "A checkpoint writes the database's dirty pages to disk and marks a known good point in the log — it is the mechanism that turns an unbounded crash-recovery workload into one you can predict and budget.",

  objectives: [
    "Explain why checkpoints exist and what they record",
    "Distinguish automatic, indirect, manual, and internal checkpoints",
    "Understand what drives checkpoint frequency and throttling",
    "Configure indirect checkpoints with TARGET_RECOVERY_TIME",
    "Monitor checkpoint I/O and interpret recovery-time surprises"
  ],

  sections: [
    {
      h: "Why checkpoints exist",
      html: `
<p>Because of the buffer pool and the no-force policy, committed data lives in memory for as long as it takes. If SQL Server crashed, recovery would have to replay the entire log since the beginning of time — unless something periodically flushes dirty pages and records how far it got. That something is a <strong>checkpoint</strong>:</p>
<ul>
  <li>Write the database's current dirty pages from the buffer pool to the data files</li>
  <li>Write checkpoint log records (<strong>LOP_BEGIN_CKPT</strong> / <strong>LOP_END_CKPT</strong>) so the position is discoverable from the log alone</li>
  <li>Afterwards, only changes recorded <em>after</em> that checkpoint need to be rolled forward on recovery</li>
</ul>
<p>Recovery time therefore scales with the log generated since the last checkpoint — not with database size. Everything about checkpoint tuning is really about keeping that window small without flooding the storage subsystem.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="How a checkpoint bounds the recovery window">
    <defs>
      <marker id="p15-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
      <marker id="p15-arrow-a" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 10 0 L 0 5 L 10 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <text x="380" y="26" text-anchor="middle" fill="var(--text)" font-size="15.5" font-weight="700" font-family="Segoe UI, sans-serif">Transaction log — written sequentially</text>

    <rect x="40" y="42" width="680" height="54" rx="6" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <rect x="330" y="42" width="330" height="54" fill="var(--accent)" opacity="0.18"/>
    <line x1="95" y1="42" x2="95" y2="96" stroke="var(--border)"/>
    <line x1="150" y1="42" x2="150" y2="96" stroke="var(--border)"/>
    <line x1="205" y1="42" x2="205" y2="96" stroke="var(--border)"/>
    <line x1="260" y1="42" x2="260" y2="96" stroke="var(--border)"/>
    <line x1="330" y1="36" x2="330" y2="104" stroke="var(--amber)" stroke-width="3"/>
    <line x1="660" y1="36" x2="660" y2="104" stroke="var(--accent-strong)" stroke-width="3"/>
    <text x="330" y="126" text-anchor="middle" fill="var(--amber)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">last checkpoint</text>
    <text x="660" y="126" text-anchor="middle" fill="var(--accent-strong)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">crash</text>

    <line x1="334" y1="150" x2="656" y2="150" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#p15-arrow)" marker-start="url(#p15-arrow-a)"/>
    <text x="495" y="172" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-family="Segoe UI, sans-serif">redo window on restart — bounded by checkpoint frequency</text>

    <rect x="45" y="204" width="320" height="72" rx="11" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="205" y="232" text-anchor="middle" fill="var(--accent-strong)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Checkpoint runs</text>
    <text x="205" y="256" text-anchor="middle" fill="var(--accent-strong)" font-size="12" font-family="Segoe UI, sans-serif">dirty pages flushed · LOP_BEGIN_CKPT written</text>

    <rect x="405" y="204" width="315" height="72" rx="11" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="562" y="232" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Restart after crash</text>
    <text x="562" y="256" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">redo only the shaded region, then undo</text>

    <line x1="365" y1="240" x2="403" y2="240" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#p15-arrow)"/>

    <text x="380" y="316" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Checkpoints cannot shrink undo: a long-running uncommitted transaction is rolled back in full, however frequent the checkpoints</text>
  </svg>
  <div class="figcaption">Figure 1 — A checkpoint moves the redo start point forward, bounding crash-recovery work.</div>
</div>
`
    },
    {
      h: "The four types of checkpoints",
      html: `
<table>
  <tr><th>Type</th><th>Interface</th><th>Behaviour</th></tr>
  <tr><td><strong>Automatic</strong></td><td><code>EXEC sp_configure 'recovery interval', 'N'</code></td><td>Fires when the log grows by the amount SQL Server estimates it can replay within the recovery interval (default target: 1 minute). Runs to completion</td></tr>
  <tr><td><strong>Indirect</strong></td><td><code>ALTER DATABASE db SET TARGET_RECOVERY_TIME = 60 SECONDS</code></td><td>Per-database dirty-page budget: a background writer keeps the dirty count low enough to recover within the target. Default for databases created on SQL Server 2016 and later</td></tr>
  <tr><td><strong>Manual</strong></td><td><code>CHECKPOINT [ checkpoint_duration ]</code></td><td>Issued by you for the current database; optionally throttled to complete within the requested number of seconds</td></tr>
  <tr><td><strong>Internal</strong></td><td>None</td><td>Triggered by backup, database snapshot creation, file add/remove, clean shutdown, instance stop, or taking a failover cluster instance offline</td></tr>
</table>
<p>Two details that surprise people: under the simple recovery model an automatic checkpoint also truncates the unused log (and one is queued when the log hits 70% full), while under full or bulk-logged recovery a checkpoint never truncates the log — a log backup does that, after the checkpoint has passed the oldest dirty page.</p>
`
    },
    {
      h: "Frequency, throttling, and the recovery interval",
      html: `
<p>Automatic checkpoint frequency is not a timer — it is a <strong>log-record budget</strong>. SQL Server estimates how many log records it could replay in the recovery interval, and a checkpoint fires each time that many accumulate. A busy OLTP database checkpoints every few seconds; a nearly idle one may go minutes between them.</p>
<ul>
  <li><strong>Throttling:</strong> checkpoints back off when outstanding writes climb or detected write latency exceeds 50 ms — a protective behaviour that means slow storage makes checkpoints <em>later</em>, not faster</li>
  <li><strong>The <code>-k</code> setup option</strong> caps checkpoint I/O for installations with constrained arrays</li>
  <li><strong>Recovery interval is an estimate of redo, not a promise:</strong> long-running transactions add undo work that no checkpoint setting can shorten</li>
  <li><strong>Raising the interval is a trade:</strong> doubling recovery interval roughly doubles potential recovery time in exchange for fewer checkpoints</li>
</ul>
<p>This is why the classic "set recovery interval to 300 to reduce checkpoint I/O" advice is only half of the story — it buys write quiet at the price of a longer worst-case restart.</p>
`
    },
    {
      h: "Indirect checkpoints in practice",
      html: `
<p>Indirect checkpoints (SQL Server 2012+) replace the log-record budget with a <strong>dirty-page budget</strong>: the engine computes how many pages it can afford to leave dirty and still recover within the target, then a background writer continuously flushes toward that number.</p>
<ul>
  <li><strong>Advantage:</strong> predictable recovery time and smoother write I/O — no single giant checkpoint spike</li>
  <li><strong>Cost:</strong> the background writer adds steady write load; on storage already at its I/O ceiling this can hurt foreground performance</li>
  <li><strong>Default:</strong> 60 seconds for databases created on 2016+, including model and tempdb. Databases upgraded in place keep the old automatic behaviour until you change them</li>
</ul>
<pre><code class="language-sql">-- Which databases still use legacy automatic checkpoints?
SELECT name, recovery_model_desc, target_recovery_time_in_seconds
FROM   sys.databases
WHERE  state = 'ONLINE'
  AND  database_id > 4
  AND  target_recovery_time_in_seconds = 0;

-- Give the two biggest user databases a 60-second recovery target
ALTER DATABASE SalesDB  SET TARGET_RECOVERY_TIME = 60 SECONDS;
ALTER DATABASE OrdersDB SET TARGET_RECOVERY_TIME = 60 SECONDS;</code></pre>
`
    },
    {
      h: "Monitoring checkpoint behaviour",
      html: `
<pre><code class="language-sql">-- Server-wide recovery interval (an advanced option)
EXEC sp_configure 'show advanced options', 1;
RECONFIGURE;
EXEC sp_configure 'recovery interval';

-- Checkpoint vs background-writer write volume
SELECT counter_name, cntr_value
FROM   sys.dm_os_performance_counters
WHERE  object_name LIKE '%Buffer Manager%'
  AND  counter_name IN ('Checkpoint pages/sec', 'Background writer pages/sec')
  AND  cntr_type IN (65792, 2724111616);</code></pre>
<pre><code class="language-sql">-- Checkpoint records in the log: when did the last one run?
SELECT [Current LSN], [Operation], [Context], [Description]
FROM   sys.fn_dblog(NULL, NULL)
WHERE  [Operation] IN ('LOP_BEGIN_CKPT', 'LOP_END_CKPT');</code></pre>
<p>A healthy pattern is steady, moderate <em>Checkpoint pages/sec</em> with gaps between checkpoint records. A spike to thousands of pages per second means a dirty backlog is being drained at once (storage felt it); a near-zero rate on a write-heavy database means checkpoints are being throttled — look at write latency next.</p>
`
    }
  ],

  scenario: {
    title: "A routine patch restart took 41 minutes",
    html: `
<p>During a Sunday patch window, SQL Server takes 41 minutes to come back after the reboot — a database that normally starts in 40 seconds. The DBA finds a 2 TB database upgraded in-place from SQL Server 2012: still using legacy automatic checkpoints, it had built a large dirty-page backlog on storage with 45 ms write latency before the stop, and one ETL session had left a two-hour uncommitted transaction that recovery had to undo.</p>
<p>The restart could not be shortened in the moment — the team let it finish and validated the data afterwards. The fixes went in the same week: <code>ALTER DATABASE ... SET TARGET_RECOVERY_TIME = 60 SECONDS</code> on the heavy databases so dirty pages drain continuously, a rewritten ETL that commits in bounded batches instead of holding one transaction open for hours, and a checkpoint-latency alert. A follow-up DR drill measured recovery at under two minutes. <strong>The 41 minutes were not hardware failure — they were an unmanaged recovery budget.</strong></p>
`
  },

  interview: [
    {
      q: "What does a checkpoint do, and why does recovery depend on it?",
      a: "It writes the database's dirty pages to disk and records LOP_BEGIN_CKPT / LOP_END_CKPT in the log. Recovery only has to roll forward log records after the last checkpoint, so the checkpoint's frequency directly bounds redo time. Without checkpoints, recovery would replay the log since the last clean start."
    },
    {
      q: "Automatic versus indirect checkpoints — what actually differs?",
      a: "Automatic checkpoints use a server-wide log-record budget derived from the recovery interval and run to completion. Indirect checkpoints use a per-database dirty-page budget derived from TARGET_RECOVERY_TIME, drained by a background writer, giving predictable recovery time and smoother I/O — at the cost of extra steady write activity."
    },
    {
      q: "Recovery takes far longer than the recovery interval. Why?",
      a: "The interval only budgets redo of recent log records. Actual recovery also includes undo of long-running uncommitted transactions, random I/O latency while replaying, and any throttling that let a dirty backlog build. Check for open transactions at crash time first, then checkpoint write latency, then dirty-page volume."
    }
  ],

  takeaways: [
    "Checkpoints flush dirty pages and mark a redo start point — recovery scales with log since the last checkpoint",
    "Four types: automatic (recovery interval), indirect (TARGET_RECOVERY_TIME), manual (CHECKPOINT), internal (backup, shutdown, snapshots)",
    "Automatic checkpoints fire on a log-record budget and throttle when write latency exceeds 50 ms",
    "Indirect checkpoints bound dirty pages instead of log records — default for databases created on 2016+",
    "Simple recovery: checkpoints truncate the log; full recovery: log backups do, after the checkpoint passes",
    "Undo time is set by long transactions — no checkpoint setting can compensate for them"
  ]
};
