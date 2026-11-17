/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch07-05.html */

window.TOPIC = {
  id: "ch07-05",
  title: "Transaction Log Backup",

  lead: "Transaction log backups are what turn a database into a time machine — every backup of the log extends how far back you can recover, and their cadence is literally your RPO.",

  objectives: [
    "Explain what a transaction log backup contains",
    "Describe how log backups drive truncation and log growth",
    "Schedule log backups to a defined RPO",
    "Restore log backups to a point in time with STOPAT",
    "Recognise the conditions that make a log backup fail"
  ],

  sections: [
    {
      h: "What a log backup captures",
      html: `
<p>In FULL or BULK_LOGGED recovery, every change is written to the transaction log first. A <strong>log backup</strong> copies the log records generated since the previous log backup (or since the full/differential that started the chain) into a backup file, and advances the chain.</p>
<ul>
  <li><strong>Contents</strong> — all log records in the covered LSN range: inserts, updates, deletes, allocations, and index changes, in physical order</li>
  <li><strong>Prerequisites</strong> — the database must be in FULL or BULK_LOGGED recovery, and a full backup must exist to anchor the chain</li>
  <li><strong>Side effect</strong> — a log backup <em>truncates</em> the inactive portion of the log, freeing space for reuse. It is the only thing that does, apart from a checkpoint in SIMPLE recovery</li>
  <li><strong>Result</strong> — the ability to restore to any moment covered by the chain: <code>RESTORE LOG … STOPAT</code></li>
</ul>
<p>The relationship is direct: <strong>log backup cadence equals data loss exposure</strong>. With log backups every 15 minutes, the worst-case loss is 15 minutes. With none, everything since the last full or differential is unprotected.</p>
`
    },
    {
      h: "Log backups, truncation, and growth",
      html: `
<p>The log file is a ring of virtual log files (VLFs). In FULL recovery, VLFs in the <em>inactive</em> region cannot be reused until a log backup covers them. When log backups stop, the log grows — indefinitely, until the volume fills.</p>
<p>SQL Server tells you exactly why it is waiting:</p>
<pre><code class="language-sql">-- Why is the log not being reused?
SELECT name, recovery_model_desc, log_reuse_wait_desc, state_desc
FROM   sys.databases
WHERE  name = N'Orders';

-- How old is our worst log backup? (RPO exposure right now)
SELECT b.database_name,
       max(b.backup_finish_date)                              AS last_log_backup,
       datediff(minute, max(b.backup_finish_date), getdate()) AS age_minutes
FROM   msdb.dbo.backupset AS b
WHERE  b.type = 'L'
GROUP BY b.database_name
ORDER  BY age_minutes DESC;</code></pre>
<p>If <code>log_reuse_wait_desc</code> reads <code>LOG_BACKUP</code>, the database is asking for a log backup — not a shrink, not a bigger file. Shrinking the log without taking the backup simply moves the problem to next week's autogrowth.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Transaction log backup chain along a timeline">
    <defs>
      <marker id="tl-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <text x="380" y="30" text-anchor="middle" fill="var(--text)" font-size="15.5" font-weight="700" font-family="Segoe UI, sans-serif">A contiguous log chain covers every minute — any of which can be a restore target</text>

    <line x1="50" y1="150" x2="715" y2="150" stroke="var(--border)" stroke-width="2.5" marker-end="url(#tl-arrow)"/>

    <rect x="50" y="106" width="70" height="40" rx="8" fill="var(--accent)"/>
    <text x="85" y="131" text-anchor="middle" fill="#ffffff" font-size="12.5" font-weight="700" font-family="Segoe UI, sans-serif">FULL</text>

    <g fill="var(--accent-soft)" stroke="var(--accent)">
      <rect x="140" y="106" width="80" height="40" rx="8"/>
      <rect x="240" y="106" width="80" height="40" rx="8"/>
      <rect x="340" y="106" width="80" height="40" rx="8"/>
      <rect x="440" y="106" width="80" height="40" rx="8"/>
      <rect x="540" y="106" width="80" height="40" rx="8"/>
      <rect x="640" y="106" width="75" height="40" rx="8"/>
    </g>
    <g fill="var(--accent-strong)" font-size="12" font-weight="700" text-anchor="middle" font-family="Segoe UI, sans-serif">
      <text x="180" y="131">LOG 1</text>
      <text x="280" y="131">LOG 2</text>
      <text x="380" y="131">LOG 3</text>
      <text x="480" y="131">LOG 4</text>
      <text x="580" y="131">LOG 5</text>
      <text x="677" y="131">TAIL</text>
    </g>
    <g fill="var(--muted)" font-size="11" text-anchor="middle" font-family="Segoe UI, sans-serif">
      <text x="180" y="168">02:00</text>
      <text x="280" y="168">02:15</text>
      <text x="380" y="168">02:30</text>
      <text x="480" y="168">02:45</text>
      <text x="580" y="168">03:00</text>
      <text x="677" y="168">now</text>
    </g>

    <line x1="415" y1="196" x2="415" y2="246" stroke="var(--amber)" stroke-width="2.4"/>
    <circle cx="415" cy="196" r="7" fill="var(--amber)"/>
    <text x="415" y="218" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">STOPAT 02:37:12</text>

    <rect x="140" y="256" width="575" height="36" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/>
    <text x="427" y="279" text-anchor="middle" fill="var(--accent-strong)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Restore: FULL → logs 1–3 → STOPAT 02:37:12 → RECOVERY (log 4 onward discarded)</text>

    <text x="380" y="322" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Every gap in this chain is a period you can no longer restore through — cadence and continuity are both required.</text>
  </svg>
  <div class="figcaption">Figure 1 — Log backups form a contiguous chain; STOPAT selects a moment inside one of them.</div>
</div>
`
    },
    {
      h: "Taking log backups",
      html: `
<p>The command is deliberately small — the options that matter are integrity and compression, exactly as with fulls:</p>
<pre><code class="language-sql">-- Every 10 minutes, compressed and checksummed
BACKUP LOG [Orders]
TO   DISK = N'E:\\Backups\\Orders\\Orders_LOG_20261116_1430.trn'
WITH  INIT, COMPRESSION, CHECKSUM, STATS = 10,
      NAME = N'Orders-Log-20261116-1430';

-- Off-host copy of the same log
BACKUP LOG [Orders]
TO   URL = N'https://contosobackups.blob.core.windows.net/sql/Orders_LOG_20261116_1430.trn'
WITH  INIT, COMPRESSION, CHECKSUM,
      CREDENTIAL = N'AzureBackupCredential';</code></pre>
<p>Operational rules for log backups:</p>
<ul>
  <li><strong>Schedule them every few minutes</strong> — the job interval is the RPO; document it and alert on it</li>
  <li><strong>Never run only copy-only log backups</strong> — <code>COPY_ONLY</code> log backups do not truncate the log, so they cannot stand in for real ones</li>
  <li><strong>Keep the chain on the same schedule as restores</strong> — log backups must start immediately after a full/differential restore, with no gap</li>
  <li><strong>Alert on age</strong> — a log backup older than 2× the interval is an active RPO breach, not a minor job delay</li>
</ul>
`
    },
    {
      h: "Restoring to a point in time",
      html: `
<p>Point-in-time recovery is the whole reason for the chain. Restore the full, then the differential, then log backups in order until the chain covers the target moment, and stop there:</p>
<pre><code class="language-sql">RESTORE DATABASE [Orders] FROM DISK = N'E:\\Backups\\Orders\\Orders_FULL_20261115.bak'
WITH NORECOVERY, STATS = 10;

RESTORE DATABASE [Orders] FROM DISK = N'E:\\Backups\\Orders\\Orders_DIFF_20261116.bak'
WITH NORECOVERY, STATS = 10;

RESTORE LOG [Orders] FROM DISK = N'E:\\Backups\\Orders\\Orders_LOG_20261116_1400.trn'
WITH NORECOVERY, STANDBY = N'E:\\Backups\\Orders\\Orders_undo.bak';

RESTORE LOG [Orders] FROM DISK = N'E:\\Backups\\Orders\\Orders_LOG_20261116_1410.trn'
WITH STOPAT = '2026-11-16T14:07:33',
     RECOVERY, STATS = 10;</code></pre>
<p>Requirements for <code>STOPAT</code> to work:</p>
<ul>
  <li>The target time must fall inside a log backup in the sequence — you cannot stop at a time no log covers</li>
  <li>The log chain must be continuous from the full/differential up to that time</li>
  <li>Under FULL recovery; a database last backed up in SIMPLE can only be recovered to its last full/differential</li>
</ul>
<p>Use <code>STANDBY</code> instead of <code>NORECOVERY</code> when you need to let readers query the database between restores — useful when searching many log files for the right moment.</p>
`
    },
    {
      h: "Why log backups fail",
      html: `
<p>Log backup failures deserve faster reactions than full backup failures, because the log only keeps growing while they are absent:</p>
<table>
  <tr><th>Failure</th><th>Meaning</th><th>Action</th></tr>
  <tr><td>Database in SIMPLE recovery</td><td>No chain exists — model was switched</td><td>Re-establish FULL recovery and restart the chain with a full backup</td></tr>
  <tr><td>"The log for this database is not backed up"</td><td>No full backup anchors the chain yet</td><td>Take a full backup first, then resume log backups</td></tr>
  <tr><td>"Media family incomplete" / I/O error</td><td>Destination volume or file problem</td><td>Fix the destination, retry — monitor free space on the backup target</td></tr>
  <tr><td>"Cannot back up log because the log file is damaged"</td><td>Corrupt LDF</td><td><code>BACKUP LOG … WITH NO_TRUNCATE</code>, or tail-log with <code>BACKUP_LOG … WITH CONTINUE_AFTER_ERROR</code>, then restore</td></tr>
  <tr><td>Chain gap discovered during restore</td><td>A log backup file is missing or deleted</td><td>Restore up to the gap only; recover the rest from the application — then fix retention</td></tr>
</table>
<p>Because a missing log backup is unrecoverable by definition, treat every log backup failure as a Sev-3 incident until proven otherwise.</p>
`
    }
  ],

  scenario: {
    title: "A disk failure erased the log file — six hours of transactions with it",
    html: `
<p>The business had approved a backup strategy with log backups every six hours (a decision made when the RPO was "overnight is fine"). At 21:15 a SAN failure took out the volume holding both the MDF and LDF of the finance database. The instance could not start the database, and — critically — no tail-log backup was possible, because the log itself was gone.</p>
<p>The DBA restored the last full, the latest differential, and log backups up to 18:00. Everything between 18:00 and 21:15 existed only in the destroyed log file: 11,400 posted transactions, worth roughly £2.4M of settlements, had no recoverable copy. The stated RPO was "6 hours", but the incident exposed that the business had believed it was 15 minutes.</p>
<p>Resolution: restored to 18:00, exported the affected customers' data for reconciliation, and replayed the gap from application-level message queues where possible. Prevention: log backups every 10 minutes with an age alert at 20 minutes, a documented RPO signed by the business, and a pre-agreed decision tree that includes <code>BACKUP LOG … WITH NO_TRUNCATE</code> for cases where the database is offline but the log volume survives.</p>
<p><strong>The cadence was not a scheduling detail — it was the contract, and nobody had read it.</strong></p>
`
  },

  interview: [
    {
      q: "What does a transaction log backup do?",
      a: "It copies the log records generated since the previous log backup into a backup file, advancing the recovery chain, truncating the inactive portion of the log so space can be reused, and enabling point-in-time restore with RESTORE LOG … STOPAT. It only exists under FULL or BULK_LOGGED recovery and only after a full backup has anchored the chain."
    },
    {
      q: "My log file keeps growing even though the database is tiny. Why?",
      a: "In FULL recovery the log is only freed by a log backup. Check log_reuse_wait_desc in sys.databases: if it says LOG_BACKUP, a log backup is overdue; if it says AVAILABILITY_REPLICA or ACTIVE_TRANSACTION, something else is holding the log. Never shrink the log as the fix — take the backup, then size the file correctly."
    },
    {
      q: "Can you restore a log backup taken while the database was in BULK_LOGGED recovery?",
      a: "Yes, if the bulk-logged operations inside it are fully covered — a minimally logged operation must be captured by a full or differential backup taken while the log containing it is still intact. If a bulk operation spans a log backup that cannot be recovered (for example, the bulk extents were lost), that log backup cannot be restored and the chain must be re-established from an earlier full/differential."
    }
  ],

  takeaways: [
    "Log backups capture log records since the previous one — their cadence IS your RPO",
    "They truncate the log; without them, the LDF grows until the volume fails",
    "Point-in-time recovery = full → differential → logs in order → STOPAT → RECOVERY",
    "STOPAT must land inside a log backup covered by an unbroken chain",
    "Treat any log backup failure as an active incident: the exposure grows every minute"
  ]
};
