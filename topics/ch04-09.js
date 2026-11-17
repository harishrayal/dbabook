/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch04-09.html */

window.TOPIC = {
  id: "ch04-09",
  title: "Data Files: MDF and NDF",

  lead: "Data files are where a database stops being abstract: one primary file (MDF), any number of secondary files (NDF), and a log file (LDF), grouped into filegroups that map logical tables to physical storage. How you size, grow, and place them decides both performance and how gracefully the database fails.",

  objectives: [
    "Distinguish MDF, NDF, and LDF files and their roles",
    "Explain filegroups and when multiple data files help",
    "Choose sensible growth settings and avoid growth-related stalls",
    "Measure file usage, latency, and volume space with DMVs"
  ],

  sections: [
    {
      h: "File types and filegroups",
      html: `
<p>Every database has at least two files — a primary data file and a log file — and may have many more:</p>
<table>
  <tr><th>File</th><th>Extension</th><th>Required</th><th>Contents</th></tr>
  <tr><td><strong>Primary data file</strong></td><td><code>.mdf</code></td><td>Exactly one</td><td>All system tables plus any objects not placed elsewhere; starts the filegroup chain</td></tr>
  <tr><td><strong>Secondary data file</strong></td><td><code>.ndf</code></td><td>Zero or more</td><td>User data only; must belong to a filegroup</td></tr>
  <tr><td><strong>Transaction log file</strong></td><td><code>.ldf</code></td><td>At least one</td><td>Log records only — never data pages (ch04-10)</td></tr>
</table>
<p>A <strong>filegroup</strong> is a named, ordered collection of data files. The <code>PRIMARY</code> filegroup always exists; user-defined filegroups let you place specific tables and indexes on specific storage. Objects are allocated <em>within</em> their filegroup's files, round-robin across files in practice.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Database filegroup and file layout">
    <defs>
      <marker id="a09-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="30" y="18" width="700" height="50" rx="11" fill="var(--accent)" />
    <text x="380" y="40" text-anchor="middle" fill="#ffffff" font-size="16" font-weight="700" font-family="Segoe UI, sans-serif">Database — SalesDB</text>
    <text x="380" y="60" text-anchor="middle" fill="#dbeafe" font-size="11.5" font-family="Segoe UI, sans-serif">logical objects map to filegroups, filegroups map to files</text>

    <rect x="30" y="104" width="220" height="54" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="140" y="126" text-anchor="middle" fill="var(--accent-strong)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">PRIMARY filegroup</text>
    <text x="140" y="147" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">system tables · default</text>

    <rect x="270" y="104" width="220" height="54" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="126" text-anchor="middle" fill="var(--accent-strong)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">FG_Hot (OLTP)</text>
    <text x="380" y="147" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">orders · customers · fast tier</text>

    <rect x="510" y="104" width="220" height="54" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="620" y="126" text-anchor="middle" fill="var(--accent-strong)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">FG_Archive</text>
    <text x="620" y="147" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">history · reports · cool tier</text>

    <rect x="30" y="196" width="220" height="58" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="140" y="218" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">SalesDB.mdf (primary)</text>
    <text x="140" y="240" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">starts the filegroup · one only</text>

    <rect x="270" y="196" width="220" height="58" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="218" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">SalesDB_01.ndf</text>
    <text x="380" y="240" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">secondary file · fast LUN</text>

    <rect x="510" y="196" width="220" height="58" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="620" y="218" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">SalesDB_hist.ndf</text>
    <text x="620" y="240" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">secondary file · archive tier</text>

    <rect x="30" y="284" width="700" height="40" rx="9" fill="var(--surface)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="380" y="309" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">SalesDB_log.ldf — one or more log files, sequential writes only</text>

    <line x1="140" y1="68" x2="140" y2="102" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a09-arrow)"/>
    <line x1="380" y1="68" x2="380" y2="102" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a09-arrow)"/>
    <line x1="620" y1="68" x2="620" y2="102" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a09-arrow)"/>
    <line x1="140" y1="158" x2="140" y2="194" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a09-arrow)"/>
    <line x1="380" y1="158" x2="380" y2="194" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a09-arrow)"/>
    <line x1="620" y1="158" x2="620" y2="194" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a09-arrow)"/>
    <line x1="380" y1="254" x2="380" y2="282" stroke="var(--muted)" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#a09-arrow)"/>

    <text x="595" y="270" text-anchor="middle" fill="var(--muted)" font-size="11" font-style="italic" font-family="Segoe UI, sans-serif">log never belongs to a data filegroup</text>
  </svg>
  <div class="figcaption">Figure 1 — Filegroups group data files; the log file stands apart from both.</div>
</div>
`
    },
    {
      h: "Why add an NDF?",
      html: `
<p>One data file per database is fine for small systems. Multiple secondary files earn their keep for three reasons:</p>
<ul>
  <li><strong>Parallel I/O</strong> — files on separate volumes can service reads concurrently; with multiple files per filegroup, allocation spreads across them, and queries benefit from parallel page reads</li>
  <li><strong>Capacity and placement</strong> — a 400 GB history table can live on the archive tier while hot tables stay on the fast tier, controlled by filegroup assignment per table/index</li>
  <li><strong>Growth isolation</strong> — one table's growth does not extend the file that holds the entire database's data</li>
</ul>
<p>Guidance that has aged well: for large databases, create data files sized equally (to avoid uneven allocation) and prefer a few files over many. Adding files is <em>not</em> a fix for log-file or CPU problems, and for <code>tempdb</code> the classic advice is one file per visible CPU core up to eight, equal in size, with proportional fill disabled only where Microsoft's guidance calls for it.</p>
<pre><code class="language-sql">-- File inventory with growth settings and physical placement
SELECT name AS logical_name,
       type_desc,
       physical_name,
       size * 8 / 1024             AS current_mb,
       CASE is_percent_growth
            WHEN 1 THEN CAST(growth AS varchar(12)) + N'%'
            ELSE CAST(growth * 8 / 1024 AS varchar(12)) + N' MB'
       END                          AS growth_setting,
       max_size,
       state_desc
FROM   sys.master_files
WHERE  database_id = DB_ID()
ORDER  BY type, file_id;</code></pre>
`
    },
    {
      h: "Growth settings: where outages are born",
      html: `
<p>An auto-grow event is a maintenance operation happening in the middle of your workload. Data-file growth takes an allocation and (with instant file initialization enabled) writes only a metadata change; log-file growth must zero-initialise every new byte — which is why log growth on a slow volume can stall writes for minutes.</p>
<table>
  <tr><th>Setting</th><th>Risk</th><th>Recommendation</th></tr>
  <tr><td><strong>Percent growth</strong></td><td>Growth size escalates as the file grows; late-stage events are huge and slow</td><td>Always fixed-size growth (e.g. 512 MB–2 GB for data, 256–512 MB for log)</td></tr>
  <tr><td><strong>Very small increments</strong></td><td>Dozens of growths a day, fragmentation, repeated stalls</td><td>Size the increment to absorb a day of normal growth</td></tr>
  <tr><td><strong>Unlimited max size</strong></td><td>Volume fills silently, then writes fail</td><td>Cap deliberately and alert on free space instead</td></tr>
  <tr><td><strong>Instant file init off</strong></td><td>Data growth zeroes the new space — slow on large increments</td><td>Enable <code>Perform Volume Maintenance Tasks</code> for the service account</td></tr>
</table>
<p>Growth events are visible in the SQL Server error log (<code>Error 14505</code> — growth for file … failed) and in the <code>Auto Growth</code> performance counter. Count them in monitoring: a database that grows several times a week is telling you its size should be set manually.</p>
`
    },
    {
      h: "Measuring file usage and latency",
      html: `
<p><code>sys.dm_io_virtual_file_stats</code> returns cumulative I/O since the last counter reset, and <code>FILEPROPERTY</code> returns space used right now. Together they answer “is this file full, slow, or both?”:</p>
<pre><code class="language-sql">-- Usage, growth, and read latency for every file in this database
SELECT df.name AS logical_name,
       df.type_desc,
       df.size * 8 / 1024                              AS current_mb,
       CAST(FILEPROPERTY(df.name, N'SpaceUsed') AS bigint) * 8 / 1024 AS used_mb,
       vfs.num_of_reads,
       CAST(vfs.io_stall_read_ms / NULLIF(vfs.num_of_reads, 0) AS decimal(12, 2)) AS avg_read_ms,
       CAST(vfs.io_stall_write_ms / NULLIF(vfs.num_of_writes, 0) AS decimal(12, 2)) AS avg_write_ms
FROM   sys.master_files AS df
JOIN   sys.dm_io_virtual_file_stats(DB_ID(), NULL) AS vfs
       ON vfs.file_id = df.file_id
WHERE  df.database_id = DB_ID()
ORDER  BY df.type, df.file_id;</code></pre>
<p>Reading the result: a data file at 95% <code>used_mb</code> is a growth waiting to happen; a file with double-digit <code>avg_read_ms</code> is on bad storage; a log file whose write latency spikes correlates directly with transaction throughput.</p>
`
    },
    {
      h: "Volume space and file placement",
      html: `
<p>Files live on volumes, and volumes fill for reasons that have nothing to do with SQL Server (backups, logs, other databases). Check free space at the file's own location:</p>
<pre><code class="language-sql">-- Free space per volume hosting this database's files
SELECT DISTINCT
       vs.volume_mount_point,
       vs.logical_volume_name,
       CAST(vs.total_bytes / 1073741824.0 AS decimal(12, 2))     AS total_gb,
       CAST(vs.available_bytes / 1073741824.0 AS decimal(12, 2)) AS free_gb,
       CAST(100.0 * vs.available_bytes / NULLIF(vs.total_bytes, 0) AS decimal(5, 2)) AS free_pct
FROM   sys.master_files AS df
CROSS  APPLY sys.dm_os_volume_stats(df.database_id, df.physical_name) AS vs
WHERE  df.database_id = DB_ID();</code></pre>
<p>Alerting rule of thumb: warn below 15% free, critical below 10% — and remember that a log file needing 2 GB of growth needs 2 GB free <em>right now</em>, not on average. Placement changes are metadata-only operations: <code>ALTER DATABASE … MODIFY FILE</code> updates the registered path, then the file is copied offline (or via backup/restore/attach for large moves).</p>
`
    },
    {
      h: "Common file operations",
      html: `
<pre><code class="language-sql">-- Add a secondary file to a user filegroup
ALTER DATABASE SalesDB ADD FILE
( NAME = N'SalesDB_02',
  FILENAME = N'E:\\Data\\SalesDB_02.ndf',
  SIZE = 4GB, FILEGROWTH = 512MB )
TO FILEGROUP FG_Hot;

-- Change growth increment (logical size change only — path changes need a restart cycle)
ALTER DATABASE SalesDB MODIFY FILE
( NAME = N'SalesDB_01', FILEGROWTH = 1024MB );</code></pre>
<p>Rules to internalise: a <em>size</em> change takes effect immediately (the file grows on disk at once), a <em>path</em> change is only recorded until the file is taken offline and back; and <code>REMOVE FILE</code> only works on an empty file — SQL Server will not shrink data for you as part of a cleanup. Shrinking is a damage-control operation (after a one-off bulk load), not maintenance (see <code>DBCC SHRINKFILE</code> cautions in the operations chapter).</p>
`
    }
  ],

  scenario: {
    title: "Writes failed at 14:12 — the data volume was full",
    html: `
<p>At 14:12 the order database began rejecting every <code>INSERT</code> with an operating-system error: the data file could not be extended. Monitoring for the volume itself was silent because it tracked free space at the array level, not per mount point. <code>sys.dm_os_volume_stats</code> showed the <code>E:</code> volume at 0.4% free — a colleague's unattended backup-retention script had written 300 GB of copy-only backups to the same volume overnight.</p>
<p>Diagnosis took four minutes: file inventory plus volume free space identified the exact mount point, and the error log confirmed the failed growth event at 14:12. Resolution: with approval, the DBA deleted expired backups from the volume (they were redundant), verified free space returned to 40%, and retried the growth — no data was lost, but writes had been rejected for 26 minutes.</p>
<p>Prevention: per-volume free-space alerts using <code>sys.dm_os_volume_stats</code> with a 15% warning threshold, a fixed 1 GB growth increment with a deliberate <code>max_size</code> cap, a policy that backups never share a data volume, and an alert on growth events (Error 14505) so the first growth triggers a capacity review rather than an outage.</p>
`
  },

  interview: [
    {
      q: "What is the difference between an MDF and an NDF file?",
      a: "The MDF is the primary data file — there is exactly one per database, it starts the PRIMARY filegroup and holds system tables. NDF files are secondary data files that belong to a filegroup and hold user data; you add them for capacity, parallel I/O across volumes, or to place specific tables/indexes on different storage tiers."
    },
    {
      q: "How do you check how full and how fast each data file is?",
      a: "sys.dm_io_virtual_file_stats joined to sys.master_files gives cumulative reads/writes and io_stall values — divide stalls by operation counts for average latency per file. FILEPROPERTY(name, 'SpaceUsed') gives current space used, and sys.master_files.size gives the current size in 8-KB pages. Free space on the underlying volume comes from sys.dm_os_volume_stats."
    },
    {
      q: "Why is percent-based auto-grow a bad default?",
      a: "The increment scales with the file, so growth events start tiny and become enormous as the database grows — a 10% growth on a 500 GB file is a 50 GB event, slow to allocate and disruptive during workload. Fixed-size growth gives predictable, bounded stall time; you size it to cover a normal day of growth and alert on the growth event itself."
    }
  ],

  takeaways: [
    "MDF is the single primary data file; NDF files are secondary files in filegroups; the LDF never holds data pages",
    "Filegroups map objects to storage — use them to separate hot and archive tiers, not just to hold files",
    "Multiple equal-sized data files spread allocation and enable parallel I/O; many small files do not help",
    "Auto-grow is a mid-workload maintenance event: fixed increments, deliberate max size, and instant file initialization",
    "sys.dm_io_virtual_file_stats gives per-file latency; FILEPROPERTY gives space used; dm_os_volume_stats gives free space",
    "Volume-full failures are silent until writes fail — alert on free space per mount point, not per array"
  ]
};
