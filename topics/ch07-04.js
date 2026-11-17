/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch07-04.html */

window.TOPIC = {
  id: "ch07-04",
  title: "Differential Backup",

  lead: "A differential backup captures only what changed since the last full backup — the trick that turns a multi-hour restore into a few minutes, as long as you understand exactly which base it measures against.",

  objectives: [
    "Explain extent-level change tracking and the differential bitmap",
    "State how differentials relate to their full backup base",
    "Write and restore a differential backup correctly",
    "Identify when a new full backup must be taken",
    "Diagnose differentials that have outgrown their purpose"
  ],

  sections: [
    {
      h: "How a differential works",
      html: `
<p>SQL Server tracks which extents (8 × 8 KB pages) have changed since the last full backup in the <strong>differential bitmap</strong> — a small structure stored in the database. A differential backup reads only the extents marked as changed, which makes it dramatically smaller and faster than a full backup on a database where only a fraction of data changes per day.</p>
<ul>
  <li>The bitmap is set when a <strong>full backup</strong> completes — that full becomes the <strong>differential base</strong></li>
  <li>Any write to an extent marks it in the bitmap, regardless of which session or process wrote it</li>
  <li>A differential backup reads the marked extents and then <em>clears the marks</em> — those extents are no longer "changed since the base"</li>
  <li>Extents modified again after the differential are marked again and captured by the next one</li>
</ul>
<blockquote>Crucial detail: differentials in SQL Server are <strong>cumulative</strong> relative to the last full backup — not incremental relative to each other. Monday's and Tuesday's differentials each contain everything since Sunday's full.</blockquote>
`
    },
    {
      h: "The differential base",
      html: `
<p>Because every differential is measured against a single full backup, that base must be present and restorable for any differential to be useful. The relationship looks like this:</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Differential backups all point back to one full backup base">
    <defs>
      <marker id="df-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
      <marker id="df-arrow-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--amber)"/>
      </marker>
    </defs>

    <text x="380" y="30" text-anchor="middle" fill="var(--text)" font-size="15.5" font-weight="700" font-family="Segoe UI, sans-serif">Every differential measures back to the same full backup</text>

    <line x1="50" y1="230" x2="715" y2="230" stroke="var(--border)" stroke-width="2.5" marker-end="url(#df-arrow)"/>
    <text x="712" y="252" text-anchor="end" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">days →</text>

    <rect x="55" y="200" width="96" height="56" rx="9" fill="var(--accent)"/>
    <text x="103" y="226" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">FULL</text>
    <text x="103" y="246" text-anchor="middle" fill="#dbeafe" font-size="11.5" font-family="Segoe UI, sans-serif">Sunday 02:00</text>

    <g fill="var(--accent-strong)">
      <rect x="215" y="200" width="84" height="56" rx="9"/>
      <rect x="365" y="200" width="84" height="56" rx="9"/>
      <rect x="515" y="200" width="84" height="56" rx="9"/>
    </g>
    <g fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle" font-family="Segoe UI, sans-serif">
      <text x="257" y="228">DIFF</text>
      <text x="407" y="228">DIFF</text>
      <text x="557" y="228">DIFF</text>
    </g>
    <g fill="#dbeafe" font-size="11.5" text-anchor="middle" font-family="Segoe UI, sans-serif">
      <text x="257" y="248">Mon</text>
      <text x="407" y="248">Tue</text>
      <text x="557" y="248">Wed</text>
    </g>

    <rect x="640" y="200" width="76" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)" stroke-dasharray="5 4"/>
    <text x="678" y="228" text-anchor="middle" fill="var(--muted)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">EXTENTS</text>
    <text x="678" y="248" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">still marked</text>

    <path d="M 257 196 C 240 140, 150 130, 108 194" fill="none" stroke="var(--amber)" stroke-width="2" stroke-dasharray="6 5" marker-end="url(#df-arrow-amber)"/>
    <path d="M 407 196 C 340 130, 170 122, 108 194" fill="none" stroke="var(--amber)" stroke-width="2" stroke-dasharray="6 5" marker-end="url(#df-arrow-amber)"/>
    <path d="M 557 196 C 440 122, 200 116, 110 194" fill="none" stroke="var(--amber)" stroke-width="2" stroke-dasharray="6 5" marker-end="url(#df-arrow-amber)"/>

    <line x1="656" y1="196" x2="656" y2="262" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#df-arrow)"/>
    <text x="435" y="300" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Restore = FULL (Sunday) + the single latest DIFF + log backups to the target time</text>
    <text x="435" y="324" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">If the Sunday full disappears, every differential since Sunday is unrestoreable — the base is not optional.</text>
  </svg>
  <div class="figcaption">Figure 1 — One full backup anchors every differential taken since it; differentials never chain to each other.</div>
</div>
<p>msdb records the link between each differential and its base through the <code>differential_base_guid</code> column of <code>backupset</code>. That is how the restore engine knows which full a differential belongs to — and how you can audit the relationship:</p>
<pre><code class="language-sql">-- Full backups (the bases) and the differentials built on top of them
SELECT b.type                        AS backup_type,   -- D = full, I = differential
       b.backup_start_date,
       b.differential_base_guid,
       cast(b.backup_size / 1024.0 / 1024 / 1024 AS decimal(12,2)) AS size_gb
FROM   msdb.dbo.backupset AS b
WHERE  b.database_name = N'Orders'
ORDER  BY b.backup_start_date DESC;</code></pre>
`
    },
    {
      h: "Taking and restoring a differential",
      html: `
<p>The syntax is the ordinary <code>BACKUP DATABASE</code> with one keyword. Note it still uses <code>COMPRESSION</code> and <code>CHECKSUM</code> — differentials deserve the same integrity treatment as fulls.</p>
<pre><code class="language-sql">-- Daily differential: only extents changed since the last full
BACKUP DATABASE [Orders]
TO   DISK = N'E:\\Backups\\Orders\\Orders_DIFF_20261116.bak'
WITH  INIT, DIFFERENTIAL, COMPRESSION, CHECKSUM, STATS = 10,
      NAME = N'Orders-Diff-20261116-0200';

-- Restore sequence: full → differential → logs
RESTORE DATABASE [Orders]
FROM   DISK = N'E:\\Backups\\Orders\\Orders_FULL_20261115.bak'
WITH   NORECOVERY, STATS = 10;

RESTORE DATABASE [Orders]
FROM   DISK = N'E:\\Backups\\Orders\\Orders_DIFF_20261116.bak'
WITH   NORECOVERY, STATS = 10;   -- matched to its base automatically

RESTORE LOG [Orders]
FROM   DISK = N'E:\\Backups\\Orders\\Orders_LOG_20261116_1015.trn'
WITH   RECOVERY;</code></pre>
<p>The restore engine enforces the dependency: if you attempt a differential without its matching base, the restore fails with an LSN/guid mismatch rather than producing a subtly wrong database. That safety check is also why guessing at restore order never works.</p>
<table>
  <tr><th>Property</th><th>Full</th><th>Differential</th></tr>
  <tr><td>Reads</td><td>All allocated pages</td><td>Extents changed since the base full</td></tr>
  <tr><td>Depends on</td><td>Nothing</td><td>One full backup (the base)</td></tr>
  <tr><td>Cumulative?</td><td>—</td><td>Yes, relative to the base — not to other differentials</td></tr>
  <tr><td>Restore step</td><td>First, NORECOVERY</td><td>Second, NORECOVERY, then logs</td></tr>
  <tr><td>Side effect</td><td>Resets the differential base</td><td>Clears the extents it captured</td></tr>
</table>
`
    },
    {
      h: "When a new full is required",
      html: `
<p>The differential base has a lifespan. Take a fresh full backup whenever:</p>
<ul>
  <li><strong>The differential outgrows its savings</strong> — roughly half the full's size means the restore no longer saves meaningful time</li>
  <li><strong>The base ages past policy</strong> — many strategies mandate a weekly or monthly full regardless of differential size</li>
  <li><strong>The base media is gone</strong> — retention deleted or corrupted the full; the differentials are worthless until a new full is taken</li>
  <li><strong>Structural change</strong> — after restoring onto new hardware, a file move, or a recovery-model change, re-anchor the chain deliberately</li>
</ul>
<p>COPY_ONLY full backups are the exception: they do <em>not</em> reset the differential base, so an ad-hoc copy taken by a vendor cannot silently invalidate your schedule.</p>
`
    },
    {
      h: "What goes wrong in practice",
      html: `
<p>Differential problems are almost always visible in msdb before they hurt:</p>
<pre><code class="language-sql">-- Has the differential grown suspiciously close to the full?
SELECT latest_diff.database_name,
       max(CASE WHEN latest_diff.type = 'D' THEN latest_diff.size_gb END) AS latest_full_gb,
       max(CASE WHEN latest_diff.type = 'I' THEN latest_diff.size_gb END) AS latest_diff_gb
FROM (
  SELECT b.database_name, b.type,
         cast(b.backup_size / 1024.0 / 1024 / 1024 AS decimal(12,2)) AS size_gb,
         row_number() OVER (PARTITION BY b.database_name, b.type
                            ORDER BY b.backup_finish_date DESC) AS rn
  FROM   msdb.dbo.backupset AS b
  WHERE  b.type IN ('D','I')
) AS latest_diff
WHERE latest_diff.rn = 1
GROUP BY latest_diff.database_name;</code></pre>
<p>Common failure signatures:</p>
<ul>
  <li><strong>Differential ≈ full size</strong> — the base is old, or nearly every extent has changed; take a full now</li>
  <li><strong>Differential fails with an LSN error</strong> — restoring from a different server or a mismatched base set</li>
  <li><strong>Differential takes as long as a full</strong> — either of the above, or heavy random write churn touching most extents</li>
</ul>
`
    }
  ],

  scenario: {
    title: "The weekly full got rescheduled — and the differential grew for six weeks",
    html: `
<p>To "save backup window", a team moved the Orders database's full backup from every Sunday to the first Sunday of the month. Differentials continued nightly as before. Because differentials are cumulative since the last full, each night's backup captured one more day of extents — 220 GB after the first week, 780 GB after four.</p>
<p>The first symptom was operational: the 02:00 differential overran its 90-minute window by week five, colliding with the ETL job and delaying log backups. The second symptom was found in a routine restore test: restoring full + latest differential + logs took 4 hours 10 minutes against an agreed RTO of 90 minutes — because the "latest differential" now had to replay six weeks of change.</p>
<p>Resolution: take a new full backup immediately (resetting the base), verify with <code>RESTORE VERIFYONLY WITH CHECKSUM</code>, run a timed restore to re-baseline the RTO, and revert the schedule to a weekly full with daily differentials. The differential was then 240 GB against a 1.4 TB full — back in the range where it actually saves time.</p>
<p>Prevention: an alert when a differential exceeds 50% of its full, plus an alert on differential base age. <strong>The schedule looked cheaper; it had simply moved its cost into the restore.</strong></p>
`
  },

  interview: [
    {
      q: "What is a differential backup and how does it choose its base?",
      a: "A backup of only the extents modified since the last full database backup. SQL Server tracks those extents in the differential bitmap, which is set when a full backup completes — that full is the base, recorded in msdb via differential_base_guid. A COPY_ONLY full does not set the base; a normal full does."
    },
    {
      q: "Are differentials incremental or cumulative?",
      a: "Cumulative relative to the base full — every differential since that full contains all extents changed since then. To restore you need the base full, the single most recent differential, and any subsequent log backups; you never replay a stack of differentials."
    },
    {
      q: "When is a differential backup no longer worth taking?",
      a: "When it approaches the size of a full (typically past 40–50%), when its base is aging past policy, or when the change rate is so high that extents are being rewritten constantly — the differential then costs almost as much to take and restore as a full. At that point, take a new full and re-anchor."
    }
  ],

  takeaways: [
    "Differentials back up only extents changed since the last full — the differential bitmap decides",
    "They are cumulative against the base full, never chained to each other",
    "A restore needs base full → latest differential → log backups, in that order",
    "Take a new full when the differential grows past ~50% of the full or the base ages out",
    "COPY_ONLY full backups do not reset the base; normal full backups do"
  ]
};
