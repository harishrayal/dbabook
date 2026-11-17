/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch07-02.html */

window.TOPIC = {
  id: "ch07-02",
  title: "Types of Database Backups",

  lead: "SQL Server offers several backup types that combine into one strategy — full, differential, log, file, filegroup, partial, and copy-only — and choosing the right mix is what turns a backup job into a recovery plan.",

  objectives: [
    "Classify every SQL Server backup type and what it captures",
    "Explain how backup types depend on one another as a chain",
    "Compare the types by scope, frequency, and restore cost",
    "Recognise copy-only backups and their special behaviour",
    "Assemble backup types into a strategy that meets an RPO"
  ],

  sections: [
    {
      h: "The backup type landscape",
      html: `
<p>Every backup type answers a different question: <em>how much of the database, since when, and how quickly do you need it back?</em> The types differ in what they read, what prior backup they depend on, and what they do to the transaction log.</p>
<table>
  <tr><th>Type</th><th>Scope</th><th>Requires a base</th><th>Captures</th><th>Typical use</th></tr>
  <tr><td><strong>Full</strong></td><td>Whole database</td><td>No</td><td>All allocated pages + log needed for consistency</td><td>Weekly/daily anchor of the strategy</td></tr>
  <tr><td><strong>Differential</strong></td><td>Whole database</td><td>Yes — last full</td><td>Extents changed since that full</td><td>Daily, shortens the restore chain</td></tr>
  <tr><td><strong>Log</strong></td><td>Transaction log</td><td>Yes — log chain</td><td>Log records since the previous log backup</td><td>Every 5–15 min, point-in-time recovery</td></tr>
  <tr><td><strong>File</strong></td><td>One data file</td><td>Yes — full backup</td><td>One .ndf/.mdf file</td><td>Selective restore of a huge file</td></tr>
  <tr><td><strong>Filegroup</strong></td><td>One filegroup</td><td>Yes — full backup</td><td>All files of a filegroup</td><td>Piecemeal restore of large databases</td></tr>
  <tr><td><strong>Partial</strong></td><td>Read-write filegroups</td><td>No</td><td>Primary + all read-write filegroups</td><td>VLDBs with big read-only archives</td></tr>
  <tr><td><strong>Copy-only</strong></td><td>Any of the above</td><td>No</td><td>Same as the type, side effects suppressed</td><td>Ad-hoc copy without disturbing the schedule</td></tr>
</table>
<p>Three rules govern how they fit together:</p>
<ul>
  <li>A <strong>full backup</strong> is the only type you can always take with no prerequisites — it starts every chain.</li>
  <li><strong>Differential</strong> backups measure against the <em>last full</em>, never against each other — they are cumulative, not incremental.</li>
  <li><strong>Log</strong> backups only exist under FULL or BULK_LOGGED recovery and must be contiguous to restore through them.</li>
</ul>
`
    },
    {
      h: "How the types combine",
      html: `
<p>A typical production schedule mixes the types so that restores are short and the RPO is met: a full to anchor, differentials to shorten the chain, and log backups to cover the minutes in between.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Backup types combined on a weekly timeline">
    <defs>
      <marker id="bt-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <text x="380" y="32" text-anchor="middle" fill="var(--text)" font-size="15.5" font-weight="700" font-family="Segoe UI, sans-serif">One week of a FULL-recovery backup schedule</text>

    <line x1="50" y1="150" x2="715" y2="150" stroke="var(--border)" stroke-width="2.5" marker-end="url(#bt-arrow)"/>

    <rect x="60" y="96" width="74" height="42" rx="8" fill="var(--accent)"/>
    <text x="97" y="122" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">FULL</text>
    <text x="97" y="86" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Sunday 02:00</text>

    <rect x="220" y="96" width="88" height="42" rx="8" fill="var(--accent-strong)"/>
    <text x="264" y="122" text-anchor="middle" fill="#ffffff" font-size="12.5" font-weight="700" font-family="Segoe UI, sans-serif">DIFFERENTIAL</text>
    <text x="264" y="86" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Monday 02:00</text>

    <rect x="392" y="96" width="88" height="42" rx="8" fill="var(--accent-strong)"/>
    <text x="436" y="122" text-anchor="middle" fill="#ffffff" font-size="12.5" font-weight="700" font-family="Segoe UI, sans-serif">DIFFERENTIAL</text>
    <text x="436" y="86" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Tuesday 02:00</text>

    <rect x="564" y="96" width="74" height="42" rx="8" fill="var(--accent)"/>
    <text x="601" y="122" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">FULL</text>
    <text x="601" y="86" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Wednesday 02:00</text>

    <rect x="50" y="176" width="660" height="34" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/>
    <text x="380" y="198" text-anchor="middle" fill="var(--accent-strong)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">LOG backups every 15 minutes — BACKUP LOG … TO DISK, day and night</text>

    <g fill="var(--surface-2)" stroke="var(--border)">
      <rect x="50" y="234" width="150" height="56" rx="9"/>
      <rect x="220" y="234" width="150" height="56" rx="9"/>
      <rect x="390" y="234" width="150" height="56" rx="9"/>
      <rect x="560" y="234" width="150" height="56" rx="9"/>
    </g>
    <text x="125" y="256" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Restore full</text>
    <text x="125" y="276" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">read every page</text>
    <text x="295" y="256" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">+ latest differential</text>
    <text x="295" y="276" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">only changed extents</text>
    <text x="465" y="256" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">+ log backups</text>
    <text x="465" y="276" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">replay to STOPAT</text>
    <text x="635" y="256" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">= service restored</text>
    <text x="635" y="276" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">verify, then online</text>

    <line x1="200" y1="262" x2="218" y2="262" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#bt-arrow)"/>
    <line x1="370" y1="262" x2="388" y2="262" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#bt-arrow)"/>
    <line x1="540" y1="262" x2="558" y2="262" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#bt-arrow)"/>

    <text x="380" y="320" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">The more differential and log backups you take, the less of the full backup the restore must replay.</text>
  </svg>
  <div class="figcaption">Figure 1 — Backup types stack: full anchors the chain, differentials shorten it, log backups fill the minutes.</div>
</div>
`
    },
    {
      h: "Writing the backups in T-SQL",
      html: `
<p>Each type has its own command. Note the consistent use of <code>WITH COMPRESSION, CHECKSUM</code> and timestamps in the file name so retention tooling can age sets out cleanly:</p>
<pre><code class="language-sql">-- Full backup: anchors everything
BACKUP DATABASE [Orders]
TO   DISK = N'E:\\Backups\\Orders\\Orders_FULL_20261115.bak'
WITH  NAME = N'Orders-Full-20261115', INIT, COMPRESSION, CHECKSUM, STATS = 10;

-- Differential: extents changed since that full
BACKUP DATABASE [Orders]
TO   DISK = N'E:\\Backups\\Orders\\Orders_DIFF_20261116.bak'
WITH  NAME = N'Orders-Diff-20261116', INIT, COMPRESSION, CHECKSUM,
      DIFFERENTIAL, STATS = 10;

-- Log backup: every transaction since the last log backup
BACKUP LOG [Orders]
TO   DISK = N'E:\\Backups\\Orders\\Orders_LOG_20261116_1015.trn'
WITH  NAME = N'Orders-Log-20261116-1015', INIT, COMPRESSION, CHECKSUM;

-- Copy-only full: an ad-hoc copy that does not disturb the chain
BACKUP DATABASE [Orders]
TO   DISK = N'E:\\Backups\\Orders\\Orders_adhoc_copy.bak'
WITH  COPY_ONLY, COMPRESSION, CHECKSUM, INIT;

-- File and filegroup backups for selective restore
BACKUP DATABASE [Orders] FILE = N'OrdersData2'
TO   DISK = N'E:\\Backups\\Orders\\Orders_file2.bak' WITH COMPRESSION, CHECKSUM;

BACKUP DATABASE [Orders] FILEGROUP = N'FG_Archive'
TO   DISK = N'E:\\Backups\\Orders\\Orders_FGArchive.bak' WITH COMPRESSION, CHECKSUM;</code></pre>
<p>Restore order follows the dependencies exactly: full → (differential OR file/filegroup) → log backups in sequence → <code>WITH RECOVERY</code>.</p>
`
    },
    {
      h: "Choosing types by workload",
      html: `
<p>There is no single correct combination — the strategy is derived from the database's size, change rate, and recovery objectives:</p>
<table>
  <tr><th>Workload</th><th>Typical choice</th><th>Why</th></tr>
  <tr><td>Small, low change, tolerant of data loss</td><td>Nightly full (SIMPLE)</td><td>Simplest chain; RPO equals the schedule</td></tr>
  <tr><td>OLTP, 15-minute RPO</td><td>Weekly full + daily differential + log every 5–15 min</td><td>Fast restores, tight RPO, moderate volume</td></tr>
  <tr><td>Very large database (10 TB+)</td><td>Partial/filegroup full + differential + logs</td><td>Avoids rewriting read-only terabytes nightly</td></tr>
  <tr><td>Read-only archive filegroups</td><td>Single full filegroup backup, rarely repeated</td><td>Data does not change; back it up once and keep it</td></tr>
  <tr><td>Bulk-load / ETL heavy</td><td>FULL recovery, or BULK_LOGGED during the load window</td><td>Minimally logged loads, still log-backup capable</td></tr>
</table>
<p>Whatever the mix, the strategy must be written down, monitored (did every type run?), and proven by restore — three habits that separate a schedule from a strategy.</p>
`
    }
  ],

  scenario: {
    title: "Log backups failing for six weeks because nobody knew they were part of the strategy",
    html: `
<p>An ERP database ran what looked like a healthy schedule: nightly full at 02:00, differential at noon. The database was in FULL recovery, but the log-backup step had been added to a job that was disabled during a migration two months earlier and never re-enabled. Nothing alerted, because the "Backup" job itself was green.</p>
<p>Symptom arrived as a disk alert: the LDF had grown from 4 GB to 186 GB and the volume was at 97%. The log could not be truncated because, in FULL recovery, only a log backup truncates it — autogrowth had been absorbing six weeks of transactions.</p>
<p>Diagnosis took minutes once the DBA checked backup type history rather than job status: <code>msdb</code> showed no rows with <code>type = 'L'</code> since the migration. Resolution: run an immediate <code>BACKUP LOG</code> to free the active portion, then set the log file to a fixed size with sane autogrowth, and add a real differential-plus-log schedule meeting the 15-minute RPO the business had assumed all along.</p>
<p>Prevention: alerting on <em>backup age per type</em> from msdb — not on job success — plus a job-dependency review after every migration. <strong>The tooling monitored activity, not outcomes.</strong></p>
`
  },

  interview: [
    {
      q: "What is the difference between a full, a differential, and a log backup?",
      a: "A full backup reads the whole database and anchors the strategy. A differential reads only the extents changed since the last full backup, so differentials are cumulative relative to that full. A log backup copies transaction log records generated since the previous log backup, which is what enables point-in-time recovery under FULL or BULK_LOGGED recovery."
    },
    {
      q: "Are differentials cumulative or incremental in SQL Server?",
      a: "Cumulative. Every differential is relative to the last full backup, not to the previous differential — so Monday's and Tuesday's differentials each contain everything since Sunday's full. Restoring means full + the single latest differential + logs, never a stack of differentials."
    },
    {
      q: "Which backup types can you take in SIMPLE recovery?",
      a: "Full, differential, file, filegroup, partial, and their copy-only variants. Transaction log backups are impossible — the log is truncated at checkpoints with no chain to preserve — which means no point-in-time recovery, only full/differential granularity."
    }
  ],

  takeaways: [
    "Seven backup types exist: full, differential, log, file, filegroup, partial, and copy-only",
    "Full backups anchor the chain; differentials measure against the last full; logs must be contiguous",
    "Restore order follows dependencies: full → differential or file → logs in sequence → RECOVERY",
    "The strategy is derived from size, change rate, and RPO — not from a default schedule",
    "Monitor backup age per type from msdb; job success alone does not prove the strategy runs"
  ]
};
