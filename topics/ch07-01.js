/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch07-01.html */

window.TOPIC = {
  id: "ch07-01",
  title: "Why Database Backups Are Required",

  lead: "Backups are the one DBA responsibility you cannot recover from if you skip it — every other problem can be fixed later, except the permanent loss of data that was never copied anywhere.",

  objectives: [
    "Explain why backups are the foundation of database administration",
    "Identify the failure modes that only a backup can recover from",
    "Distinguish RPO and RTO as the measures of backup adequacy",
    "Recognise what must be present for a backup to be truly recoverable",
    "Describe why an untested backup is an assumption, not a defence"
  ],

  sections: [
    {
      h: "The only defence against data loss",
      html: `
<p>A database can lose its contents in seconds, and almost none of those paths are reversible. Hardware can be replaced, queries can be tuned, permissions can be re-granted — but data that was never written to a recoverable copy is gone. That single fact is why backup and recovery sit at the top of every DBA responsibility list, ahead of performance and ahead of security.</p>
<p>Backups exist because <strong>every other protection fails under the same conditions</strong>: replication stops when the source is gone, mirroring stops when the disk dies, snapshots are lost with the array, and RAID protects against a disk failure, not against a dropped <code>DELETE</code> statement. A backup is the only mechanism that takes the data <em>away</em> from the failure domain that destroyed it.</p>
<blockquote>A backup is not a feature of the database — it is a promise to the business that the database can be rebuilt at a point in time that matters to them.</blockquote>
<p>The job of the DBA is therefore not "run a backup job". It is to be able to answer, at any moment, three questions:</p>
<ul>
  <li><strong>What can we lose?</strong> — how many minutes or hours of transactions are acceptable (RPO)</li>
  <li><strong>How long can we wait?</strong> — how quickly the service must return (RTO)</li>
  <li><strong>How do we know?</strong> — when was the last restore test, and did it work</li>
</ul>
`
    },
    {
      h: "What can destroy a database",
      html: `
<p>The threats are wider than most people assume. Backups are not only for hardware failure — they cover human error, software defects, and hostile action with equal weight:</p>
<table>
  <tr><th>Threat</th><th>Typical cause</th><th>Recovery path</th></tr>
  <tr><td>Storage failure</td><td>Disk, array, or controller dies</td><td>Restore from the most recent backup set</td></tr>
  <tr><td>Accidental data change</td><td>UPDATE/DELETE without a WHERE clause</td><td>Restore to a side instance, recover rows, replay</td></tr>
  <tr><td>Logical corruption</td><td>Bad ETL run, buggy code, wrong mappings</td><td>Point-in-time restore to just before the change</td></tr>
  <tr><td>Page corruption</td><td>Bad I/O, firmware bugs, torn pages (823/824/825)</td><td>Page-level restore, or full restore if no copy exists</td></tr>
  <tr><td>Database file loss</td><td>Volume deleted or formatted</td><td>File/filegroup restore plus log chain</td></tr>
  <tr><td>Site disaster</td><td>Fire, flood, power loss at the data centre</td><td>Off-site copy — the 3-2-1 principle</td></tr>
  <tr><td>Ransomware / sabotage</td><td>Data files and shares encrypted or wiped</td><td>Air-gapped or immutable copy taken before the event</td></tr>
  <tr><td>Failed change</td><td>Bad migration, schema drift, version rollback</td><td>Restore, then replay the change correctly</td></tr>
</table>
<p>Notice that only three of these are "the hardware broke". The rest are caused by people and software — which is exactly why backups must be protected from the same administrators and the same network that run the database.</p>
`
    },
    {
      h: "What counts as a real backup",
      html: `
<p>A file named <code>ERP_full.bak</code> on the production server's <code>D:</code> drive is not a backup strategy. For a copy of data to qualify as recoverable, it must satisfy five conditions:</p>
<ul>
  <li><strong>Consistent</strong> — taken through the SQL Server backup APIs so the copy is transactionally consistent and restorable as-is</li>
  <li><strong>Separate</strong> — stored somewhere the original failure cannot reach: another host, another site, immutable storage</li>
  <li><strong>Versioned</strong> — retaining enough history to reach back to the last known-good state, not just the last 24 hours</li>
  <li><strong>Verifiable</strong> — with checksums, <code>RESTORE VERIFYONLY</code>, and periodic real restores</li>
  <li><strong>Documented</strong> — a known restore procedure with known timings, or the first restore will be done under pressure by someone who has never done it</li>
</ul>
<p>The backup must also include everything required to rebuild the database: data and index pages, schema and object metadata, and <strong>enough transaction log</strong> to roll the copy forward to a consistent state during restore. That last element is why recovery models and log backups (later in this chapter) matter so much.</p>
<p>A practical audit query — every database, its recovery model, and when it was last backed up:</p>
<pre><code class="language-sql">-- Databases with no full backup on record (msdb history)
SELECT d.name,
       d.recovery_model_desc,
       d.state_desc,
       max(b.backup_finish_date) AS last_full_backup
FROM   sys.databases AS d
LEFT JOIN msdb.dbo.backupset AS b
       ON b.database_name = d.name
      AND b.type = 'D'                 -- D = full, I = differential, L = log
GROUP BY d.name, d.recovery_model_desc, d.state_desc
HAVING max(b.backup_finish_date) IS NULL
    OR max(b.backup_finish_date) &lt; dateadd(hour, -26, getdate())
ORDER BY last_full_backup;</code></pre>
<p>If that query returns a row for a production database, you already have an open incident — msdb simply has no evidence that the data exists anywhere else.</p>
`
    },
    {
      h: "Measuring adequacy: RPO and RTO",
      html: `
<p>Backups are not judged by whether they run, but by the numbers they guarantee under failure. Two measures define every backup strategy:</p>
<ul>
  <li><strong>RPO (Recovery Point Objective)</strong> — the maximum acceptable <em>data loss</em>, measured backwards in time from the failure. A 15-minute RPO means backups must land at least every 15 minutes.</li>
  <li><strong>RTO (Recovery Time Objective)</strong> — the maximum acceptable <em>outage</em>, measured forwards from the failure: restore time, recovery time, and validation time combined.</li>
</ul>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="RPO and RTO timeline">
    <defs>
      <marker id="ro-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <text x="380" y="34" text-anchor="middle" fill="var(--text)" font-size="16" font-weight="700" font-family="Segoe UI, sans-serif">Two clocks start when production fails</text>

    <line x1="60" y1="200" x2="705" y2="200" stroke="var(--border)" stroke-width="2.5" marker-end="url(#ro-arrow)"/>
    <text x="700" y="222" text-anchor="end" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">time →</text>

    <line x1="170" y1="178" x2="170" y2="222" stroke="var(--muted)" stroke-width="2"/>
    <circle cx="170" cy="200" r="7" fill="var(--muted)"/>
    <text x="170" y="150" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Last good backup</text>
    <text x="170" y="168" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Sunday 02:00</text>

    <line x1="430" y1="178" x2="430" y2="222" stroke="var(--amber)" stroke-width="2.4"/>
    <circle cx="430" cy="200" r="8" fill="var(--amber)"/>
    <text x="430" y="150" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">Production failure</text>
    <text x="430" y="168" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Monday 14:32</text>

    <line x1="640" y1="178" x2="640" y2="222" stroke="var(--accent)" stroke-width="2.4"/>
    <circle cx="640" cy="200" r="7" fill="var(--accent)"/>
    <text x="640" y="150" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Service restored</text>
    <text x="640" y="168" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Monday 18:10</text>

    <rect x="170" y="244" width="260" height="34" rx="8" fill="var(--amber)" opacity="0.25" stroke="var(--amber)"/>
    <line x1="178" y1="261" x2="422" y2="261" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ro-arrow)" marker-start="url(#ro-arrow)"/>
    <text x="300" y="300" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">RPO — 12 h 32 m of transactions permanently lost</text>

    <rect x="430" y="244" width="210" height="34" rx="8" fill="var(--accent)" opacity="0.22" stroke="var(--accent)"/>
    <line x1="438" y1="261" x2="632" y2="261" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ro-arrow)" marker-start="url(#ro-arrow)"/>
    <text x="535" y="300" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">RTO — 3 h 38 m of downtime</text>

    <text x="380" y="328" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Only the backup schedule can shrink the amber window; only restore practice can shrink the blue one.</text>
  </svg>
  <div class="figcaption">Figure 1 — RPO measures what you lose; RTO measures how long you wait. Both are decided before the failure, not during it.</div>
</div>
<p>The lesson of the timeline: a nightly full backup means an eight-hour RPO by design, regardless of how the job performs. If the business needs 15 minutes, the answer is transaction-log or log-shipping cadence — not a faster full backup.</p>
`
    },
    {
      h: "Backups are not the same as restores",
      html: `
<p>The final reason backups are required is also the most uncomfortable: <strong>only a restore proves a backup exists</strong>. A job history full of green checkmarks proves only that SQL Server finished reading the data — it does not prove the file survived the copy, the retention policy, the encryption certificate, or the SAN migration.</p>
<p>Mature organisations treat restore testing as part of the backup itself:</p>
<ul>
  <li><strong>Every backup run</strong> — job status plus <code>RESTORE VERIFYONLY</code> with checksums on critical databases</li>
  <li><strong>Every week</strong> — a restore of the latest set into an isolated test instance, followed by <code>DBCC CHECKDB</code></li>
  <li><strong>Every quarter</strong> — a timed full recovery drill against the documented RTO, with the results recorded</li>
  <li><strong>After any change</strong> — to backup software, certificates, storage, or recovery model, an immediate verification restore</li>
</ul>
<p>An organisation that has never restored has never backed up — it has only produced files. Chapter 7 continues by defining what those files contain, how the types combine into a strategy, and how each one is verified.</p>
`
    }
  ],

  scenario: {
    title: "The DELETE without a WHERE clause — and the backup nobody had ever restored",
    html: `
<p>At 14:32 a developer ran <code>UPDATE dbo.Orders SET status = 'C'</code> against production instead of the QA copy, touching 1.8 million rows in under a minute. The application went into a lock storm, then began returning wrong order states to customers. The incident channel opened with one instruction: "we need the data as it was at 14:30."</p>
<p>The DBA's first discovery was uncomfortable: the nightly full backup job showed 47 consecutive successes, but that was <em>all</em> there was — no log backups, no differential, and no restore test in the three years since the server was built. The earliest available restore point was 24 hours old, and restoring would require rebuilding the job's undocumented procedure on the fly.</p>
<p>Resolution: restore the previous night's full to an isolated instance (1 h 40 m), identify a joinable audit table that could reconstruct 92% of the affected rows, and replay the remainder. The last 18 minutes of legitimate transactions were accepted as lost — an undeclared RPO of 24 hours.</p>
<p>Prevention agreed with management within a week: recovery model confirmed as FULL with 15-minute log backups, a differential during business hours, off-host copies under 3-2-1, and a mandatory monthly restore test reported alongside uptime. <strong>The incident was never a technology failure — it was an untested assumption.</strong></p>
`
  },

  interview: [
    {
      q: "Why are backups considered the most important DBA duty?",
      a: "Because data loss is the only failure class that cannot be undone by fixing the system. Availability, performance, and security issues can be recovered from; data that was never copied anywhere cannot. Every other DBA responsibility is a form of prevention — backup and restore are the cure."
    },
    {
      q: "The backup job reports success every night. What could still be wrong?",
      a: "The file could be unwritable/unreadable later (no checksum or verification), the copy could be on the same failure domain as the source, the retention job could delete the only copy, dependencies such as certificates or the log chain could be missing, and — most commonly — nobody has ever restored it. Success in msdb only proves the backup API completed."
    },
    {
      q: "How would you decide between a 15-minute and a 4-hour RPO?",
      a: "It is a business decision quantified in cost: how many transactions or how much money the organisation can afford to lose in a worst-case failure, divided by the recovery capability the infrastructure can actually deliver. My job is to show the business what each number costs — log backup cadence, storage, and restore time — and then meet the number we agree on."
    }
  ],

  takeaways: [
    "Backups are the only mechanism that removes data from the failure domain that destroyed it",
    "Threats include human error, logic bugs, ransomware, and site loss — not just hardware failure",
    "A real backup is consistent, separate, versioned, verifiable, and documented",
    "RPO defines acceptable data loss; RTO defines acceptable downtime — both are set before the incident",
    "A backup is only proven by a restore: untested backups are assumptions, not protections"
  ]
};
