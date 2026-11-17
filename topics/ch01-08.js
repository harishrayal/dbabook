/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch01-08.html */

window.TOPIC = {
  id: "ch01-08",
  title: "Database Maintenance Responsibilities",

  lead: "Maintenance is the unglamorous recurring work — backups, integrity checks, index and statistics upkeep, log management — that decides whether a database is still healthy in two years or already on life support.",

  objectives: [
    "List the core maintenance tasks and the failure each prevents",
    "Match maintenance tasks to the right frequency",
    "Apply index and statistics maintenance with correct thresholds",
    "Automate maintenance without letting it run blind"
  ],

  sections: [
    {
      h: "What maintenance covers",
      html: `
<p><strong>Database maintenance</strong> is every recurring task required to keep a database correct, recoverable, and performant as it ages. Applications change the database constantly — data grows, structures fragment, statistics drift, logs accumulate — and without deliberate upkeep those natural processes eventually produce an outage.</p>
<p>The core tasks, each mapped to the failure it prevents:</p>
<table>
  <tr><th>Task</th><th>Failure it prevents</th></tr>
  <tr><td>Backup and verify</td><td>Unrecoverable data after corruption, loss, or ransomware</td></tr>
  <tr><td>DBCC CHECKDB (integrity check)</td><td>Logical corruption spreading silently for weeks before discovery</td></tr>
  <tr><td>Index rebuild / reorganise</td><td>Query performance degrading as pages fragment</td></tr>
  <tr><td>Statistics updates</td><td>Stale cardinality estimates producing wrong query plans</td></tr>
  <tr><td>Transaction log management</td><td>Log file growth to 100%, writes rejected, database read-only</td></tr>
  <tr><td>Data and log file growth review</td><td>Autogrowth failing when a disk fills mid-write</td></tr>
  <tr><td>Archival and retention</td><td>Tables and backups growing past any usable size</td></tr>
  <tr><td>Patching and updates</td><td>Known bugs and security vulnerabilities staying in production</td></tr>
</table>
<p>The defining property of maintenance is that <strong>its absence is invisible until it is catastrophic</strong>. No user reports “fragmentation is at 38%”. The report just gets slower every month, until the day someone notices the log is full.</p>
<blockquote>Nobody is thanked for the CHECKDB that found nothing. That is exactly the point.</blockquote>
`
    },
    {
      h: "The maintenance calendar",
      html: `
<p>Frequency is not arbitrary: it follows how fast each thing degrades and how long you can tolerate discovering the problem. The classic rhythm looks like this:</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Daily, weekly and monthly maintenance lanes">
    <defs>
      <marker id="mnt-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="20" y="36" width="95" height="56" rx="9" fill="var(--accent)" />
    <text x="67" y="70" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Daily</text>

    <rect x="140" y="36" width="165" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="222" y="60" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Backup verification</text>
    <text x="222" y="80" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">jobs · alerts · disk space</text>

    <rect x="330" y="36" width="165" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="412" y="60" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Job outcome review</text>
    <text x="412" y="80" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">ETL · log backups · jobs</text>

    <rect x="520" y="36" width="165" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="602" y="60" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Growth &amp; blocking check</text>
    <text x="602" y="80" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">file sizes · long queries</text>

    <line x1="305" y1="64" x2="328" y2="64" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#mnt-arrow)"/>
    <line x1="495" y1="64" x2="518" y2="64" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#mnt-arrow)"/>

    <rect x="20" y="140" width="95" height="56" rx="9" fill="var(--accent-strong)"/>
    <text x="67" y="174" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Weekly</text>

    <rect x="140" y="140" width="165" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="222" y="164" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Index &amp; statistics</text>
    <text x="222" y="184" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">rebuild · reorganise · update</text>

    <rect x="330" y="140" width="165" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="412" y="164" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Integrity checks</text>
    <text x="412" y="184" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">DBCC CHECKDB schedule</text>

    <rect x="520" y="140" width="165" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="602" y="164" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Capacity trend</text>
    <text x="602" y="184" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">growth rate · forecast</text>

    <line x1="305" y1="168" x2="328" y2="168" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#mnt-arrow)"/>
    <line x1="495" y1="168" x2="518" y2="168" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#mnt-arrow)"/>

    <rect x="20" y="244" width="95" height="56" rx="9" fill="var(--amber)"/>
    <text x="67" y="278" text-anchor="middle" fill="#1f2937" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Monthly</text>

    <rect x="140" y="244" width="165" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="222" y="268" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Restore test</text>
    <text x="222" y="288" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">prove the backups work</text>

    <rect x="330" y="244" width="165" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="412" y="268" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Patching window</text>
    <text x="412" y="288" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">CU / security updates</text>

    <rect x="520" y="244" width="165" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="602" y="268" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Access review</text>
    <text x="602" y="288" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">roles · orphaned users</text>

    <line x1="305" y1="272" x2="328" y2="272" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#mnt-arrow)"/>
    <line x1="495" y1="272" x2="518" y2="272" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#mnt-arrow)"/>

    <text x="380" y="330" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Each lane runs in a maintenance window — never over the business peak.</text>
  </svg>
  <div class="figcaption">Figure 1 — Maintenance cadence: what runs daily, weekly, and monthly.</div>
</div>
<p>Two scheduling rules matter more than the exact frequencies. First, <strong>heavy work goes in quiet windows</strong> — a index rebuild at 2 PM on a trading platform is an incident, not maintenance. Second, <strong>the schedule must be explicit</strong>: if it is not on a calendar with an owner, it is not being done, no matter how often everyone intends to do it.</p>
`
    },
    {
      h: "Index and statistics maintenance",
      html: `
<p>Two tasks in that calendar deserve real judgement rather than blanket rules:</p>
<p><strong>Indexes.</strong> Fragmentation is not automatically a problem — it depends on the index size, the workload, and whether the cost of rebuilding exceeds the cost of the scans. The usual guidance: below 5% do nothing, between 5% and 30% reorganise (online, lighter), above 30% rebuild (heavier, log-intensive). Page <em>count</em> matters as much as percentage: a 90% fragmented index with 40 pages is noise.</p>
<pre><code class="language-sql">-- Fragmentation triage: only indexes worth acting on
SELECT t.name                                    AS table_name,
       i.name                                    AS index_name,
       i.type_desc,
       ips.avg_fragmentation_in_percent,
       ips.page_count
FROM   sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') AS ips
JOIN   sys.indexes AS i
       ON i.object_id = ips.object_id AND i.index_id = ips.index_id
JOIN   sys.tables AS t ON t.object_id = i.object_id
WHERE  ips.avg_fragmentation_in_percent &gt; 10
AND    ips.page_count &gt; 1000
ORDER  BY ips.avg_fragmentation_in_percent DESC;</code></pre>
<p><strong>Statistics.</strong> The query optimiser trusts cardinality estimates; stale statistics produce plans that were right when the data looked different. Auto-update statistics handles small tables well, but large, heavily-written tables frequently need scheduled updates — full scans on a defined schedule, or incremental statistics on partitioned tables. After a large data load, an explicit update before the next business peak is cheap insurance.</p>
`
    },
    {
      h: "Backups, integrity, and log management",
      html: `
<p>The rest of the calendar is about proving and protecting data:</p>
<ul>
  <li><strong>Backups</strong> — full, differential, and log schedules matched to the recovery model and RPO; retention aligned to how long a problem can go unnoticed (corruption found in week three needs week-one backups)</li>
  <li><strong>Verification</strong> — a backup job that “succeeded” is not a restore; run <code>RESTORE VERIFYONLY</code> in automation and a real restore into a scratch instance on a schedule</li>
  <li><strong>Integrity checks</strong> — DBCC CHECKDB on every database, frequency scaled to size (daily for small, every few days or with physical-only for very large), because logical corruption does not announce itself</li>
  <li><strong>Log management</strong> — in FULL recovery the log grows until log backups run; in simple recovery a checkpoint reclaims it. Watch <code>log_reuse_wait_desc</code> rather than waiting for the disk alert</li>
  <li><strong>Autogrowth</strong> — configure sensible fixed increments, not the default 1 MB or 10%; a log growing in 1 MB steps during peak generates thousands of VLFs and slows recovery</li>
</ul>
<pre><code class="language-sql">-- Cheap daily integrity smoke test for very large databases
DBCC CHECKDB ('OrdersDb') WITH PHYSICAL_ONLY, NO_INFOMSGS;</code></pre>
<p><code>PHYSICAL_ONLY</code> skips logical checks but runs far faster — a pragmatic trade for databases too large for a full daily check, with full checks scheduled less often.</p>
`
    },
    {
      h: "Automating without flying blind",
      html: `
<p>Everything above should run as scheduled SQL Agent jobs — most teams use a maintained script suite such as Ola Hallengren's Maintenance Solution — but automation only moves the work; it does not remove the responsibility:</p>
<ul>
  <li><strong>Alert on outcomes, not on schedules</strong> — a job that runs nightly and fails nightly must page someone, not merely appear in history</li>
  <li><strong>Check the output</strong> — “success” for a maintenance job should mean it found and processed the work it expected</li>
  <li><strong>Respect the peak</strong> — verify window alignment when the business changes hours or traffic patterns</li>
  <li><strong>Never shrink data files</strong> as routine maintenance — it causes fragmentation, contention, and regrowth; fix the underlying growth misconfiguration instead (autoshrink is worse still)</li>
  <li><strong>Review thresholds annually</strong> — databases grow, so rebuild thresholds, CHECKDB frequency, and backup windows must grow with them</li>
</ul>
<p>The classic failure is a maintenance suite installed on day one, never read again, whose log backup step silently stopped in year two. Maintenance without monitoring is a schedule, not a strategy.</p>
`
    }
  ],

  scenario: {
    title: "The database that went read-only at 3 AM",
    html: `
<p>At 3:12 AM a nightly job began failing across the application with “The transaction log for database 'BillingDb' is full”. The billing database is in FULL recovery with a 100 GB log file that had never grown past 20%. Diagnosis was quick: <code>sys.databases</code> showed <code>log_reuse_wait_desc</code> = LOG_BACKUP, and the log backup job history showed its last success eleven days earlier — it had broken when a storage migration re-pointed the backup share without updating the job's destination path. The log filled; the database accepted no more writes.</p>
<p>The DBA's first action was not to shrink anything: check the wait reason, restore the backup path, take an immediate log backup, and watch the log reuse drop back to normal. Writes resumed at 3:26 AM. The disk itself had plenty of space — the log simply had no way to be reused.</p>
<p>Prevention: an alert on log space at 70%, an alert on any failed job rather than a human reading history, and a <strong>maintenance review that checks each job's last successful run</strong>, not just whether the job exists. The outage was caused by maintenance that had stopped maintaining itself.</p>
`
  },

  interview: [
    {
      q: "How often should you run DBCC CHECKDB and why?",
      a: "Typically daily for small and medium databases, with frequency reduced for very large ones — often using WITH PHYSICAL_ONLY daily and full checks weekly or monthly. The rationale is the rate at which corruption can spread undetected versus the runtime cost; the schedule must be explicit and monitored, because a skipped integrity check is invisible."
    },
    {
      q: "When do you rebuild versus reorganise an index?",
      a: "As a starting rule: under 5% fragmentation do nothing; 5% to 30% reorganise, since it is online and incremental; above 30% rebuild, which is heavier and log-intensive but restores the structure. Page count qualifies the decision — a tiny index at 90% fragmentation is not worth a maintenance window — and write-heavy tables need this review more often than read-only ones."
    },
    {
      q: "A developer suggests shrinking data files weekly to reclaim space. What do you say?",
      a: "No for data files. Shrinking causes immediate fragmentation, rework as the file regrows, and contention during the shrink itself; the correct fix is to correct the autogrowth configuration and, if space is genuinely needed, add capacity. The log file is different: shrink only after fixing the log reuse problem that caused the growth, or it will simply grow back."
    }
  ],

  takeaways: [
    "Maintenance prevents failures that are invisible until catastrophic — no user reports fragmentation",
    "Match each task to a cadence and a maintenance window; schedule it explicitly with an owner",
    "Index work is triage by fragmentation and page count; statistics keep plans honest after data changes",
    "Backups are only proven by restores — verify automatically and restore on a schedule",
    "Automate the jobs, but alert on outcomes and review last-success dates; never shrink data files routinely"
  ]
};
