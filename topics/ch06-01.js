/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch06-01.html */

window.TOPIC = {
  id: "ch06-01",
  title: "Database Storage Architecture",

  lead: "A SQL Server database is ultimately a set of operating-system files. This topic maps the full path from instance down to filegroup, file, page, and extent — the mental model you need before you add, move, or grow a single file in production.",

  objectives: [
    "Describe the storage hierarchy from instance down to extent",
    "Explain how pages and extents are allocated",
    "Separate the roles of data files and the transaction log",
    "Read the physical layout of any database with catalog views"
  ],

  sections: [
    {
      h: "From instance to extent",
      html: `
<p>SQL Server organises storage in a strict hierarchy. An <strong>instance</strong> hosts many <strong>databases</strong>; each database is a set of operating-system <strong>files</strong> arranged into <strong>filegroups</strong>; files are divided into 8 KB <strong>pages</strong>, and pages are handed out in <strong>extents</strong> of eight pages. Every storage task a DBA performs — adding a file, placing a table, growing the log — is an operation on exactly one layer of this hierarchy.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Database storage hierarchy">
    <defs>
      <marker id="sa-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="270" y="14" width="220" height="50" rx="12" fill="var(--accent)"/>
    <text x="380" y="36" text-anchor="middle" fill="#ffffff" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">SQL Server instance</text>
    <text x="380" y="55" text-anchor="middle" fill="#dbeafe" font-size="11.5" font-family="Segoe UI, sans-serif">hosts databases, each a set of files</text>

    <line x1="380" y1="66" x2="380" y2="90" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#sa-arrow)"/>

    <rect x="24" y="94" width="452" height="150" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="250" y="120" text-anchor="middle" fill="var(--accent-strong)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Data filegroup (e.g. PRIMARY)</text>

    <rect x="48" y="136" width="190" height="56" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="143" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">MDF · primary data</text>
    <text x="143" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">one per database</text>

    <rect x="262" y="136" width="190" height="56" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="357" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">NDF · secondary data</text>
    <text x="357" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">optional, any number</text>

    <text x="250" y="222" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">pages (8 KB) allocated as extents (64 KB)</text>

    <rect x="506" y="94" width="230" height="150" rx="12" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="621" y="120" text-anchor="middle" fill="var(--text)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Transaction log</text>

    <rect x="528" y="136" width="186" height="56" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="621" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">LDF · log records</text>
    <text x="621" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">never in a filegroup</text>

    <text x="621" y="222" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">sequential write-ahead stream</text>

    <rect x="24" y="272" width="712" height="50" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="294" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">8 KB pages in RAM (buffer pool) ↔ written back to the data and log files</text>
    <text x="380" y="313" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">log first (write-ahead logging) · data pages at the next checkpoint</text>

    <line x1="250" y1="246" x2="250" y2="270" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#sa-arrow)"/>
    <line x1="621" y1="246" x2="621" y2="270" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#sa-arrow)"/>
  </svg>
  <div class="figcaption">Figure 1 — Storage hierarchy: filegroups hold data files, files hold pages, and the log sits outside filegroups entirely.</div>
</div>
<p>Two details of this diagram matter more than the rest. First, a data file belongs to exactly one filegroup, and every filegroup belongs to exactly one database — there is no cross-database file. Second, the log file has no filegroup at all: it is a single sequential stream that records every change the database makes.</p>
`
    },
    {
      h: "Pages and extents",
      html: `
<p>Data files are not written at byte level. SQL Server allocates and reads in fixed units:</p>
<ul>
  <li><strong>Page</strong> — 8 KB (8,192 bytes): a 96-byte header plus up to roughly 8,060 bytes of row data. Every row lives on exactly one page, and a page read is the unit of I/O.</li>
  <li><strong>Extent</strong> — eight contiguous pages, 64 KB: the unit of allocation. The engine tracks free space in extents, not individual pages.</li>
  <li><strong>Mixed extent</strong> — the first pages of a brand-new object may share an extent with other objects, so a one-row table does not consume 64 KB of space.</li>
  <li><strong>Uniform extent</strong> — as an object grows it takes whole extents for itself, reducing allocation bookkeeping and contention.</li>
</ul>
<p>Behind the scenes, a handful of allocation pages do the bookkeeping: <strong>PFS</strong> pages record which pages are free, <strong>GAM</strong> and <strong>SGAM</strong> pages record which extents are allocated (and whether they are shared), and <strong>DCM/BCM</strong> pages drive differential backups. When you see latch waits on allocation pages — classically PAGELATCH_UP contention in tempdb — you are looking at contention on these structures, not on user data.</p>
`
    },
    {
      h: "Data files and the log are different animals",
      html: `
<p>The two file types exist to serve different access patterns, and most storage mistakes come from treating them the same:</p>
<table>
  <tr><th>Aspect</th><th>Data files (MDF / NDF)</th><th>Transaction log (LDF)</th></tr>
  <tr><td>Contents</td><td>Pages: rows, indexes, IAM and LOB structures</td><td>Log records: one per change, plus VLF bookkeeping</td></tr>
  <tr><td>Organised by</td><td>Filegroups, extents, pages</td><td>A single sequential stream divided into VLFs</td></tr>
  <tr><td>Access pattern</td><td>Random reads and writes through the buffer pool</td><td>Append-only writes; replayed sequentially on recovery</td></tr>
  <tr><td>Grows in</td><td>Extents (allocation of pages)</td><td>VLFs (virtual log files)</td></tr>
  <tr><td>Typical backups</td><td>Full and differential</td><td>Transaction log backups in full/bulk-logged recovery</td></tr>
  <tr><td>Growth stalls writes?</td><td>Usually not — background work</td><td>Yes — the writer waits for growth to finish</td></tr>
</table>
`
    },
    {
      h: "How a write travels through storage",
      html: `
<p>The hierarchy only makes sense once you watch a modification move through it:</p>
<ol>
  <li>The transaction's log record is appended to the log file and flushed on commit — this is <strong>write-ahead logging</strong>.</li>
  <li>The modified page in the buffer pool becomes <strong>dirty</strong>; the data file on disk is untouched for now.</li>
  <li>A checkpoint (or lazy writer under memory pressure) writes dirty pages out to their data files, at extent granularity.</li>
  <li>Reads walk the same path in reverse: buffer pool hit, or an 8 KB physical read from the file.</li>
</ol>
<p>This asymmetry explains most production surprises. Data file growth is asynchronous background work that users rarely notice, while log growth must complete <em>before</em> the transaction that needs the space can proceed — which is why a slow, badly sized, or nearly full log file is felt immediately as timeouts.</p>
`
    },
    {
      h: "Reading the physical layout",
      html: `
<p>Before changing anything, read what is actually there. <code>sys.master_files</code> shows every file on the instance; <code>sys.database_files</code> shows the current database's view of itself:</p>
<pre><code class="language-sql">-- Every file on the instance, with its growth policy
SELECT d.name                       AS database_name,
       mf.file_id,
       mf.type_desc,
       mf.name                      AS logical_name,
       mf.physical_name,
       mf.state_desc,
       mf.size * 8 / 1024           AS size_mb,
       case mf.is_percent_growth
            when 1 then cast(mf.growth as varchar(12)) + ' %'
            else cast(mf.growth * 8 / 1024 as varchar(12)) + ' MB'
       end                          AS growth_setting
FROM   sys.master_files AS mf
JOIN   sys.databases    AS d ON d.database_id = mf.database_id
ORDER BY d.name, mf.file_id;</code></pre>
<pre><code class="language-sql">-- Current database only: logical files and their filegroups
SELECT file_id, name, type_desc, filegroup_name,
       physical_name, state_desc, size * 8 / 1024 AS size_mb
FROM   sys.database_files
ORDER BY file_id;</code></pre>
<p>Both views expose <em>logical</em> names (used in every T-SQL statement) and <em>physical</em> paths (used by Windows and by attach/detach). Keep that distinction sharp: you can change a physical path without renaming the logical file, and you can rename a logical file without moving a byte on disk.</p>
`
    }
  ],

  scenario: {
    title: "2 AM page: the OS drive filled up on the brand-new server",
    html: `
<p>A company migrated two databases to a freshly built SQL Server. Nobody changed the default file locations, so both MDF and LDF landed on C:. For six weeks all was quiet — until a busy Monday, when autogrowth pushed the log past the drive's capacity. The OS volume hit 100%, the VSS writer failed, and SQL Server began refusing writes with log-full errors while the monitoring team chased an "application" outage.</p>
<p>The DBA's first query was <code>sys.master_files</code>, which showed every file still on C: — the migration runbook had copied data but never re-pointed storage. Immediate fix: add a second log file on the E: volume, take a log backup, shrink the C: log file back down, and free space on the OS drive. Prevention: set the instance's default data and log locations, encode file placement in deployment templates, and alert on volume free space <em>and</em> on data/log size deltas. <strong>The database was never the problem — the default file locations were.</strong></p>
`
  },

  interview: [
    {
      q: "Walk me down the storage hierarchy of a SQL Server database.",
      a: "Instance → databases → filegroups → files → pages → extents. A database is a set of files; data files are grouped into filegroups (the PRIMARY filegroup always exists), the log file has no filegroup, files are divided into 8 KB pages, and pages are allocated in 64 KB extents."
    },
    {
      q: "Where do you find the physical file names and locations of every database?",
      a: "sys.master_files for all databases on the instance (joined to sys.databases for names), or sys.database_files when you are already connected to the target database. Both expose the logical name, physical path, type, size, and growth setting."
    },
    {
      q: "Why does the transaction log not belong to a filegroup?",
      a: "Because filegroups exist to organise and place data files for allocation and object placement, while the log is a single sequential stream of log records that must be replayed in order during recovery. Allocation structures such as extents apply to data, not to log records, which are grouped into VLFs instead."
    }
  ],

  takeaways: [
    "Storage layers: instance → database → filegroup → file → 8 KB page → 64 KB extent",
    "Pages are the unit of I/O; extents are the unit of allocation (mixed vs uniform)",
    "Data files are random-access page stores; the log is a sequential write-ahead stream with no filegroup",
    "Write-ahead logging: log record to disk on commit, data pages later at checkpoint",
    "Read the layout before changing it: sys.master_files, sys.database_files, and growth settings",
    "Default file locations are a production risk — set them deliberately and alert on volume space"
  ]
};
