/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch07-17.html */

window.TOPIC = {
  id: "ch07-17",
  title: "Differential Backup Base",

  lead: "A differential backup stores only the pages changed since the last full backup — but everything depends on which full backup SQL Server treats as the base, and getting that wrong breaks the restore chain.",

  objectives: [
    "Explain how SQL Server tracks pages changed since the differential base",
    "Identify which full backup becomes the base — and which one does not",
    "Restore a full → differential → log chain in the correct order",
    "Choose a differential cadence that shortens backup windows safely",
    "Verify a backup chain using msdb history"
  ],

  sections: [
    {
      h: "What a differential backup contains",
      html: `
<p>Each database carries a <strong>differential bitmap</strong> — a small structure that marks which extents (8 pages, 64 KB) have been modified since the last full backup. A <strong>differential backup</strong> reads that bitmap and copies only the changed extents, plus everything from the transaction log since that point.</p>
<p>That makes differentials fundamentally different from the other types:</p>
<table>
  <tr><th>Backup type</th><th>Captures</th><th>Grows with</th></tr>
  <tr><td><strong>Full</strong></td><td>Every allocated page in the database</td><td>Database size</td></tr>
  <tr><td><strong>Differential</strong></td><td>Extents changed since the differential base</td><td>Churn since the base</td></tr>
  <tr><td><strong>Log</strong></td><td>Transaction log records since the last log backup</td><td>Transaction volume</td></tr>
</table>
<p>SQL Server has <em>no</em> incremental backup (page-level, like some other engines). Differentials are extent-level roll-ups from a single base — which is exactly why the base matters so much.</p>
<pre><code class="language-sql">-- Differential backup: only what changed since the full base
BACKUP DATABASE [OrderDb]
TO  DISK = N'D:\\backup\\OrderDb_diff_20260117_0600.bak'
WITH DIFFERENTIAL,
     COMPRESSION,
     INIT,
     CHECKSUM,
     STATS = 5;</code></pre>
`
    },
    {
      h: "How SQL Server picks the base",
      html: `
<p>The differential base is <strong>the most recent full backup of that database</strong> recorded in msdb at the moment the differential runs. Three rules decide it:</p>
<ul>
  <li><strong>A regular full backup becomes the new base</strong> and starts a fresh differential chain.</li>
  <li><strong>A <code>COPY ONLY</code> full backup never becomes the base</strong> and never resets the existing one — it is taken for a snapshot of data without disturbing the chain.</li>
  <li><strong>Restoring a full backup re-establishes the base</strong> that subsequent differentials must attach to.</li>
</ul>
<p>The base is recorded in the backup headers as <code>differential_base_lsn</code> and <code>differential_base_uuid</code>. When you restore, SQL Server compares the differential's base with the LSN of the restored full — a mismatch is rejected, because a differential built on one base cannot roll forward another.</p>
<blockquote>The classic trap: a tool that quietly takes “full” backups with <code>COPY ONLY</code> to avoid blocking. The job reports success every night, yet the differential base never advances — differentials keep growing until they rival the full, and the true base ages out of retention.</blockquote>
`
    },
    {
      h: "The chain, visually",
      html: `
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Full, differential and log backup chain">
    <defs>
      <marker id="d17-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
      <marker id="d17-arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"/>
      </marker>
    </defs>

    <rect x="40" y="40" width="160" height="64" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="120" y="66" text-anchor="middle" fill="var(--accent-strong)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Full (base)</text>
    <text x="120" y="87" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Sun 02:00 · becomes the base</text>

    <rect x="260" y="40" width="130" height="64" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="325" y="66" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Differential 1</text>
    <text x="325" y="87" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Mon 06:00</text>

    <rect x="420" y="40" width="130" height="64" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="485" y="66" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Differential 2</text>
    <text x="485" y="87" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Tue 06:00</text>

    <rect x="580" y="40" width="130" height="64" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="645" y="66" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Differential 3</text>
    <text x="645" y="87" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Wed 06:00 · current</text>

    <line x1="202" y1="72" x2="256" y2="72" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#d17-arrow)"/>
    <line x1="392" y1="72" x2="416" y2="72" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#d17-arrow)"/>
    <line x1="552" y1="72" x2="576" y2="72" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#d17-arrow)"/>

    <line x1="325" y1="104" x2="325" y2="160" stroke="var(--muted)" stroke-width="1.4" stroke-dasharray="5 4"/>
    <line x1="485" y1="104" x2="485" y2="160" stroke="var(--muted)" stroke-width="1.4" stroke-dasharray="5 4"/>
    <line x1="645" y1="104" x2="645" y2="160" stroke="var(--muted)" stroke-width="1.4" stroke-dasharray="5 4"/>
    <line x1="120" y1="160" x2="645" y2="160" stroke="var(--muted)" stroke-width="1.4" stroke-dasharray="5 4"/>
    <line x1="120" y1="160" x2="120" y2="110" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#d17-arrow)"/>
    <text x="383" y="180" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">every differential resolves back to the same full base</text>

    <rect x="40" y="240" width="120" height="52" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="100" y="271" text-anchor="middle" fill="var(--text)" font-size="12.5" font-family="Segoe UI, sans-serif">Log 12:00</text>
    <rect x="180" y="240" width="120" height="52" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="240" y="271" text-anchor="middle" fill="var(--text)" font-size="12.5" font-family="Segoe UI, sans-serif">Log 13:00</text>
    <rect x="320" y="240" width="120" height="52" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="380" y="271" text-anchor="middle" fill="var(--text)" font-size="12.5" font-family="Segoe UI, sans-serif">Log 14:00</text>
    <rect x="460" y="240" width="120" height="52" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="520" y="271" text-anchor="middle" fill="var(--text)" font-size="12.5" font-family="Segoe UI, sans-serif">Log 15:00</text>

    <path d="M 710 110 L 710 210 L 100 210 L 100 236" fill="none" stroke="var(--accent)" stroke-width="1.8" marker-end="url(#d17-arrow-accent)"/>
    <text x="405" y="203" text-anchor="middle" fill="var(--accent-strong)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">restore order: full → most recent differential → later logs</text>

    <text x="380" y="325" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-family="Segoe UI, sans-serif">Skip logs that are already covered by the differential; restore only those taken after it.</text>
  </svg>
  <div class="figcaption">Figure 1 — Differentials all share one base; logs roll the restore forward past the differential.</div>
</div>
`
    },
    {
      h: "Restoring the chain",
      html: `
<p>Restore order is fixed: <strong>full base → most recent differential → every log backup taken after that differential</strong>. Each step except the last runs with <code>NORECOVERY</code> so the next restore can be applied.</p>
<pre><code class="language-sql">-- Step 1: the full that is the differential base
RESTORE DATABASE [OrderDb]
FROM DISK = N'D:\\backup\\OrderDb_full_20260111.bak'
WITH NORECOVERY, STATS = 10;

-- Step 2: the latest differential on top of that base
RESTORE DATABASE [OrderDb]
FROM DISK = N'D:\\backup\\OrderDb_diff_20260117_0600.bak'
WITH NORECOVERY, STATS = 10;

-- Step 3: roll forward with logs taken after the differential
RESTORE LOG [OrderDb]
FROM DISK = N'D:\\backup\\OrderDb_log_20260117_0900.trn'
WITH RECOVERY, STATS = 10;</code></pre>
<p>Practical notes: if you restore an <em>older</em> differential you must first restore the exact full it was built from; restoring a full that is <em>newer</em> than the differential's base makes SQL Server reject the differential. And the differential you choose must be the <strong>most recent one you intend to skip to</strong> — differentials do not stack on each other.</p>
`
    },
    {
      h: "Choosing a differential cadence",
      html: `
<p>Differentials trade restore speed against backup time. The more churn since the base, the larger the differential grows — so a weekly full plus daily differentials works for stable data but degrades on a write-heavy database.</p>
<table>
  <tr><th>Pattern</th><th>Restore steps</th><th>Best for</th><th>Watch out for</th></tr>
  <tr><td>Full + logs only</td><td>Full + many logs</td><td>Small or highly transactional databases</td><td>Long roll-forward during recovery</td></tr>
  <tr><td>Full daily + diff daily</td><td>Full + 1 diff + few logs</td><td>OLTP with moderate churn</td><td>Diff size grows with daily writes</td></tr>
  <tr><td>Full weekly + diff daily</td><td>Full + 1 diff + logs</td><td>Larger databases inside a window</td><td>Diff approaches full size by day 7</td></tr>
  <tr><td>Full twice daily + diff every 4 h</td><td>Full + diff + logs</td><td>Tight RTO, generous backup window</td><td>Heavy I/O across the day</td></tr>
</table>
<p>A useful rule: when a differential consistently exceeds roughly half the size of the full, taking more frequent fulls (or dropping differentials entirely) is cheaper than letting the diff drift toward full size.</p>
`
    },
    {
      h: "Verifying the chain with msdb",
      html: `
<p>msdb records every successful backup with its first/last LSN, type, and duration — enough to prove a chain is intact before anyone needs it:</p>
<pre><code class="language-sql">-- Recent chain for one database: type D = full, I = differential, L = log
SELECT bs.database_name,
       bs.type                                     AS backup_type,
       bs.backup_start_date,
       DATEDIFF(minute, bs.backup_start_date,
                       bs.backup_finish_date)      AS duration_min,
       CAST(bs.backup_size / 1024.0 / 1024 AS int) AS size_mb,
       bs.first_lsn,
       bs.last_lsn,
       bm.physical_device_name
FROM   msdb.dbo.backupset       bs
JOIN   msdb.dbo.backupmediafamily bm
       ON bm.media_set_id = bs.media_set_id
WHERE  bs.database_name = N'OrderDb'
  AND  bs.backup_finish_date >= dateadd(day, -8, getdate())
ORDER BY bs.backup_start_date DESC;</code></pre>
<p>If the gap between the full's <code>last_lsn</code> and the differential's <code>differential_base_lsn</code> does not line up, or the base full has already been deleted by retention, the chain is broken — find that out during verification, not during an incident.</p>
`
    }
  ],

  scenario: {
    title: "The differential chain that quietly lost its base",
    html: `
<p>A retail DBA inherits a database where the nightly “full” backup job — configured by a previous contractor in a third-party tool — actually runs <code>BACKUP DATABASE … WITH COPY ONLY</code>. Every job succeeds for six weeks. Differentials grow from 400 MB to 18 GB because the base never advances, and nightly durations creep from 10 minutes to 70 minutes, eating into the maintenance window.</p>
<p>The failure surfaces during a routine restore drill: the only full backup on the media is six weeks old, and the retention policy deleted everything older. Restoring means replaying six weeks of logs plus an 18 GB differential — the RTO test fails at four hours against a 90-minute target. <strong>Diagnosis:</strong> the backup headers show <code>differential_base_lsn</code> unchanged across six weeks of “fulls”. <strong>Fix:</strong> remove <code>COPY ONLY</code> from the scheduled job, take a genuine full the same night to reset the base, and alert when a “full” backup's base LSN does not advance.</p>
`
  },

  interview: [
    {
      q: "What is a differential base, and how does SQL Server choose it?",
      a: "It is the full backup a differential is built from, identified by LSN and UUID. SQL Server picks the most recent regular full backup recorded in msdb when the differential runs; a COPY ONLY full neither creates nor resets a base, and restoring a full re-establishes the base for differentials applied on top of it."
    },
    {
      q: "Can you restore a differential without the full it was based on?",
      a: "No. The differential carries the base LSN of the full it was taken from, and restore validates that against the restored database. Without that exact full — and the logs that cover the period between them — the chain cannot be reconstructed."
    },
    {
      q: "Where do log backups fit when restoring full plus differential?",
      a: "After the differential, and only those taken after it: full → most recent differential → every subsequent log. Logs covered by the differential are redundant, but the ones taken after it are required to roll forward to the desired point in time."
    }
  ],

  takeaways: [
    "A differential copies only extents changed since the differential base (tracked by the differential bitmap)",
    "The base is the most recent regular full backup — COPY ONLY fulls never create or reset it",
    "Restore order is fixed: full base → differential → log backups taken after that differential",
    "Differentials do not stack on each other; only the most recent one you intend to use matters",
    "Alert on a “full” backup whose base LSN never advances, and verify chains in msdb before an incident does"
  ]
};
