/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch07-06.html */

window.TOPIC = {
  id: "ch07-06",
  title: "File Backup",

  lead: "When a database is measured in terabytes, backing up and restoring whole files instead of the whole database is the difference between a two-minute recovery and a weekend outage.",

  objectives: [
    "Explain when file-level backups are appropriate",
    "Write BACKUP DATABASE … FILE statements",
    "Restore a single file and replay it into consistency",
    "Understand the log requirements for file restores",
    "Compare file backups with filegroup and partial backups"
  ],

  sections: [
    {
      h: "Why back up individual files",
      html: `
<p>A database with several data files (<code>.mdf</code> / <code>.ndf</code>) does not have to be protected as one indivisible object. <strong>File backups</strong> copy a single data file, which matters in three situations:</p>
<ul>
  <li><strong>Enormous databases</strong> — a 6 TB database with a 200 GB file that changes daily; backing up just that file keeps the nightly window sane</li>
  <li><strong>Selective recovery</strong> — one file's pages are corrupted; restore that file instead of the entire database</li>
  <li><strong>Storage layout</strong> — different files live on different volumes, so backup targets and retention can follow the data</li>
</ul>
<p>The catch is consistency: restoring an old version of one file into a database whose other files are newer produces a database that cannot be opened. File restores must therefore be <strong>replayed with log backups</strong> until the restored file reaches the same point in time as the rest of the database.</p>
<blockquote>Rule of thumb: a file backup is not a strategy by itself — it is a component of a full + log sequence, used to reduce the <em>scope</em> of the restore.</blockquote>
`
    },
    {
      h: "Taking a file backup",
      html: `
<p>Syntax is the normal <code>BACKUP DATABASE</code> with <code>FILE = 'logical_file_name'</code>. The logical name comes from <code>sys.database_files</code>, not the physical path:</p>
<pre><code class="language-sql">-- Which files exist, and what are their logical names?
SELECT file_id, name, physical_name, type_desc
FROM   sys.database_files;

-- Back up one data file (compressed, checksummed)
BACKUP DATABASE [Orders]
FILE   = N'OrdersData2'
TO     DISK = N'E:\\Backups\\Orders\\Orders_file_OrdersData2_20261116.bak'
WITH   INIT, COMPRESSION, CHECKSUM, STATS = 10,
       NAME = N'Orders-File-OrdersData2-20261116';

-- Several files in one statement (media set spans them)
BACKUP DATABASE [Orders]
FILE   = N'OrdersData2', FILE = N'OrdersData3'
TO     DISK = N'E:\\Backups\\Orders\\Orders_files_20261116.bak'
WITH   INIT, COMPRESSION, CHECKSUM, STATS = 10;</code></pre>
<p>Prerequisites to remember:</p>
<ul>
  <li>File backups of a user database are taken <strong>between full database backups</strong> — the full remains the anchor of the strategy</li>
  <li>Files in <strong>read-only</strong> filegroups can be backed up once and reused; files that change need regular file backups plus logs</li>
  <li>Under FULL recovery, a complete strategy for read-write files includes log backups that cover the periods between them</li>
</ul>
`
    },
    {
      h: "Restoring a file into a consistent database",
      html: `
<p>Restoring a single file follows the same discipline as a full restore: <code>NORECOVERY</code> while the sequence continues, log backups replayed to the common point, then <code>RECOVERY</code>.</p>
<pre><code class="language-sql">-- 1. Restore only the damaged file, database stays in restoring state
RESTORE DATABASE [Orders]
FILE   = N'OrdersData2'
FROM   DISK = N'E:\\Backups\\Orders\\Orders_file_OrdersData2_20261116.bak'
WITH   NORECOVERY, STATS = 10;

-- 2. Replay log backups so the file catches up with the rest of the database
RESTORE LOG [Orders]
FROM   DISK = N'E:\\Backups\\Orders\\Orders_LOG_20261116_1430.trn'
WITH   NORECOVERY, STATS = 10;

RESTORE LOG [Orders]
FROM   DISK = N'E:\\Backups\\Orders\\Orders_LOG_20261116_1440.trn'
WITH   RECOVERY;

-- 3. Prove the restored file is clean before serving traffic
DBCC CHECKDB ([Orders]) WITH NO_INFOMSGS;</code></pre>
<p>Two important details:</p>
<ul>
  <li>The log sequence must reach <strong>the end of the log</strong> (or a chosen point) for <em>all</em> files — not just the restored one — before the database can recover</li>
  <li>A file restored from an older backup can also be brought forward with <code>RESTORE DATABASE … FILE … WITH STOPAT</code>-style log replay only through log backups; the file version itself cannot be newer than the logs you hold</li>
</ul>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Restoring one file and replaying logs to a common point">
    <defs>
      <marker id="fm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
      <marker id="fm-arrow-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--amber)"/>
      </marker>
    </defs>

    <text x="380" y="30" text-anchor="middle" fill="var(--text)" font-size="15.5" font-weight="700" font-family="Segoe UI, sans-serif">One file behind — bring it forward with logs, not with a full restore</text>

    <rect x="30" y="70" width="290" height="150" rx="12" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="175" y="98" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Database at 14:40</text>
    <rect x="50" y="114" width="250" height="38" rx="7" fill="var(--accent-soft)" stroke="var(--accent)"/>
    <text x="175" y="138" text-anchor="middle" fill="var(--accent-strong)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">File A · current (14:40)</text>
    <rect x="50" y="160" width="250" height="38" rx="7" fill="var(--amber)" opacity="0.3" stroke="var(--amber)"/>
    <text x="175" y="184" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">File B · corrupted (pages unreadable)</text>
    <text x="175" y="212" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">cannot open · 823/824 errors on read</text>

    <line x1="328" y1="145" x2="392" y2="145" stroke="var(--muted)" stroke-width="2" marker-end="url(#fm-arrow)"/>

    <rect x="400" y="70" width="150" height="150" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="475" y="98" text-anchor="middle" fill="var(--accent-strong)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">RESTORE FILE</text>
    <text x="475" y="124" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">from file backup</text>
    <text x="475" y="146" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">taken 02:00</text>
    <text x="475" y="176" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">WITH NORECOVERY</text>
    <text x="475" y="196" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">file now at 02:00</text>

    <line x1="558" y1="145" x2="620" y2="145" stroke="var(--amber)" stroke-width="2" marker-end="url(#fm-arrow-amber)"/>

    <rect x="626" y="70" width="110" height="150" rx="12" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="681" y="98" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">LOG …</text>
    <text x="681" y="122" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">02:00 → 14:40</text>
    <text x="681" y="146" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">NORECOVERY,</text>
    <text x="681" y="164" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">final one</text>
    <text x="681" y="182" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">RECOVERY</text>
    <text x="681" y="204" text-anchor="middle" fill="var(--accent-strong)" font-size="11.5" font-weight="600" font-family="Segoe UI, sans-serif">DBCC CHECKDB</text>

    <rect x="400" y="250" width="336" height="56" rx="10" fill="var(--accent-soft)" stroke="var(--accent)"/>
    <text x="568" y="274" text-anchor="middle" fill="var(--accent-strong)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">All files now agree at 14:40 — database recovers online</text>
    <text x="568" y="294" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">only the corrupted file's pages were rewritten</text>

    <line x1="475" y1="222" x2="475" y2="246" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#fm-arrow)"/>
    <line x1="681" y1="222" x2="681" y2="246" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#fm-arrow)"/>

    <text x="200" y="270" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Saved: 5.8 TB of untouched data</text>
    <text x="200" y="290" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">skipped the full-database rewrite</text>
  </svg>
  <div class="figcaption">Figure 1 — File restore plus log replay brings one file to the database's current point in time.</div>
</div>
`
    },
    {
      h: "File, filegroup, or partial?",
      html: `
<p>Three backup types reduce scope in different ways — choosing wrong produces a strategy that is hard to reason about during an incident:</p>
<table>
  <tr><th>Type</th><th>Copies</th><th>Best for</th><th>Restore granularity</th></tr>
  <tr><td><strong>File</strong></td><td>One data file</td><td>A single large/hot file, targeted corruption</td><td>One file, then log replay</td></tr>
  <tr><td><strong>Filegroup</strong></td><td>All files of a filegroup</td><td>Logical partitioning (by year, by region)</td><td>One filegroup, then log replay</td></tr>
  <tr><td><strong>Partial</strong></td><td>Primary + all read-write filegroups</td><td>Huge read-only archive sections</td><td>Piecemeal: read-write parts first</td></tr>
  <tr><td><strong>Full</strong></td><td>Everything</td><td>Small/medium databases, simplicity</td><td>The whole database, one shot</td></tr>
</table>
<p>Signs that file-level backups belong in your strategy:</p>
<ul>
  <li>The database exceeds a few terabytes and only a fraction changes daily</li>
  <li>Files are spread across volumes with different failure characteristics</li>
  <li>RTO testing shows a full restore would breach the target</li>
  <li>Corruption events historically affected one file, not the whole database</li>
</ul>
<p>If none of those hold, a plain full + differential + log schedule is simpler and just as safe — <strong>complexity in a backup strategy is a cost, not a feature</strong>.</p>
`
    }
  ],

  scenario: {
    title: "Corruption in one 800 GB file — full restore would have taken six hours",
    html: `
<p>At 03:20 routine <code>DBCC CHECKDB</code> on a 6 TB warehouse reported corruption confined to a single <code>.ndf</code> file holding two years of historical fact tables. The RTO was four hours. A full database restore plus log replay was measured at six hours — already a breach before the incident channel opened.</p>
<p>The database had been laid out with six data files across three volumes and — by design — file backups for the largest files each night, plus continuous log backups. The DBA's path: restore the file backup of the affected file with <code>NORECOVERY</code>, replay log backups to the failure point, run <code>DBCC CHECKDB</code> to confirm the corruption was gone, then <code>RECOVERY</code>. Total elapsed: 52 minutes, with the other 5.8 TB untouched.</p>
<p>Prevention: the file layout was reviewed so no single file dominated the database, the file backup schedule was folded into the main job with per-type age monitoring, and a runbook page documented the file-restore sequence with its prerequisites — because nobody should be reading the syntax reference at 03:20.</p>
<p><strong>The strategy had been designed for exactly this failure, and the design paid for itself the first time it was used.</strong></p>
`
  },

  interview: [
    {
      q: "When would you use a file backup instead of a full backup?",
      a: "When the database is very large and only part of it changes or is at risk — file backups let you protect and restore a single file. Typical cases are multi-terabyte databases with a hot file, files on separate volumes, or targeted corruption where restoring everything would breach the RTO. The full backup still anchors the strategy; file backups reduce the scope of individual runs and restores."
    },
    {
      q: "What do you need after restoring a file backup to finish the job?",
      a: "Log backups. The restored file is at the moment of its file backup, while the rest of the database is newer, so you must replay the log chain with RESTORE LOG … NORECOVERY until all files reach a common point, then RECOVERY — and finally DBCC CHECKDB to prove the restored file is sound."
    },
    {
      q: "Can you back up a read-only file?",
      a: "Yes — read-only files or filegroups are ideal file-backup candidates because their contents never change, so one good backup can be kept indefinitely and restored whenever needed. No log replay is required to keep them current, since they cannot have changed since the backup was taken."
    }
  ],

  takeaways: [
    "File backups copy one data file — the tool for huge or selectively risky databases",
    "They are taken between full backups and identified by logical file name from sys.database_files",
    "A file restore must be followed by log replay until all files share a common point in time",
    "Read-only files are backed up once and reused; read-write files need regular coverage plus logs",
    "Choose file/filegroup scope only when size, layout, or RTO demands it — simplicity is a virtue"
  ]
};
