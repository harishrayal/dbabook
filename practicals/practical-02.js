/* Practical content file — one JS file per practical lab.
   Rendered by assets/js/site.js on practicals/practical-02.html */

window.TOPIC = {
  id: "practical-02",
  title: "Database Storage",

  lead: "A hands-on lab in database storage: create a database with explicit MDF, NDF and LDF files, build filegroups, configure autogrowth, move files safely and monitor file sizes with catalog views.",

  objectives: [
    "Create a database with deliberately sized data and log files",
    "Add filegroups and secondary data files",
    "Configure sensible fixed autogrowth",
    "Move a data file using the catalogue-then-filesystem sequence",
    "Monitor file size and free space with DMVs"
  ],

  sections: [
    {
      h: "Before you start",
      html: `
<p>This lab explores physical storage. You will create a scratch database with explicit file definitions so you can see exactly where SQL Server puts bytes on disk, then change that layout and verify the result.</p>
<p>Use a local Developer or Express instance. Never run storage experiments against a production database — file moves require taking the database offline, which is an outage.</p>
<p><strong>Environment check</strong> — confirm where you are before changing anything; this habit prevents production mistakes:</p>
<pre><code class="language-sql">-- Lab step
CREATE DATABASE StorageLab
ON PRIMARY
(
  NAME = StorageLab_Primary,
  FILENAME = 'D:\Data\StorageLab.mdf',
  SIZE = 64MB, MAXSIZE = 2GB, FILEGROWTH = 64MB
),
FILEGROUP FG_Archive
(
  NAME = StorageLab_Archive,
  FILENAME = 'E:\Data\StorageLab_Archive.ndf',
  SIZE = 64MB, MAXSIZE = 2GB, FILEGROWTH = 64MB
)
LOG ON
(
  NAME = StorageLab_Log,
  FILENAME = 'L:\Log\StorageLab.ldf',
  SIZE = 64MB, MAXSIZE = 1GB, FILEGROWTH = 64MB
);
GO</code></pre>
      `,
    },
    {
      h: "Lab architecture",
      html: `
<p>A database maps logical files to physical files. The primary data file (MDF) holds system objects; secondary data files (NDF) extend filegroups; the log file (LDF) is a separate sequential structure. Understanding the mapping is the whole point of this lab.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Database storage hierarchy">
    <defs>
      <marker id="pa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="200" y="10" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="31" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Database (StorageLab)</text>
    <line x1="380" y1="54" x2="380" y2="64" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="64" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="85" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Filegroup (PRIMARY / FG_Archive)</text>
    <line x1="380" y1="108" x2="380" y2="118" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="118" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="139" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Physical files (MDF, NDF, LDF)</text>
    <line x1="380" y1="162" x2="380" y2="172" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="172" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="193" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Extents (8 pages = 64 KB)</text>
    <line x1="380" y1="216" x2="380" y2="226" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="226" width="360" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)"/>
    <text x="380" y="247" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Data pages (8 KB)</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Database storage hierarchy</text>
  </svg>
  <div class="figcaption">Figure 1 — From database to filegroup to file to 8 KB page — the log is managed separately.</div>
</div>
<p>Follow the flow below: a database owns filegroups, filegroups own data files, and those files are divided into 8 KB pages. The log sits alongside, managed independently.</p>
      `,
    },
    {
      h: "Core tasks",
      html: `
<p>Start by creating a database with one primary data file, one secondary file in a custom filegroup, and a log file — all pre-sized so autogrowth does not fire during the lab.</p>
<table>
  <tr><th>Concept</th><th>Catalogue source</th><th>What you learn</th></tr>
  <tr><td>MDF</td><td>sys.database_files</td><td>Primary data file</td></tr>
  <tr><td>NDF</td><td>sys.filegroups</td><td>Secondary data file</td></tr>
  <tr><td>LDF</td><td>type_desc = LOG</td><td>Transaction log</td></tr>
  <tr><td>Autogrowth</td><td>growth / is_percent_growth</td><td>Growth behaviour</td></tr>
</table>
<p>Notice the autogrowth settings. Fixed growth in megabytes is predictable; percentage growth becomes unpredictable on large files. Set growth deliberately, then confirm with sys.database_files.</p>
<pre><code class="language-sql">-- Lab step
USE StorageLab;
GO
-- Add another file to the filegroup
ALTER DATABASE StorageLab
ADD FILE
(
  NAME = StorageLab_Archive2,
  FILENAME = 'E:\Data\StorageLab_Archive2.ndf',
  SIZE = 128MB, FILEGROWTH = 128MB
) TO FILEGROUP FG_Archive;
GO
-- Change growth from percentage-style to fixed MB
ALTER DATABASE StorageLab
MODIFY FILE
( NAME = StorageLab_Primary, FILEGROWTH = 128MB );
GO</code></pre>
      `,
    },
    {
      h: "Verify your work",
      html: `
<p>Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:</p>
<pre><code class="language-sql">-- Lab step
SELECT name AS logical_name,
       physical_name,
       type_desc,
       size / 128 AS size_mb,
       growth,
       is_percent_growth
FROM   sys.database_files
ORDER BY type_desc, name;
GO
-- Free space on each volume holding a database file
SELECT DISTINCT vs.volume_mount_point,
       vs.total_bytes / 1073741824 AS total_gb,
       vs.available_bytes / 1073741824 AS free_gb
FROM sys.database_files f
CROSS APPLY sys.dm_os_volume_stats(DB_ID(), f.file_id) vs;</code></pre>
<p>Verification is everything in storage work. Query the catalogue for logical names, physical paths, sizes and growth, and query dm_os_volume_stats for free space on the underlying volumes.</p>
<p>If the output differs, stop and correct it before moving on. A lab that 'looks right' but was never verified teaches the wrong lessons.</p>
      `,
    },
    {
      h: "Pitfalls and safe practice",
      html: `
<p>The classic storage mistake is moving a live file in Windows Explorer. SQL Server tracks paths in its catalogue; changing the path on disk without updating the catalogue leaves the database unable to open its files after a restart.</p>
<table>
  <tr><th>Mistake</th><th>Consequence</th><th>Safe approach</th></tr>
  <tr><td>Percentage growth</td><td>Unpredictable large growths</td><td>Use fixed MB</td></tr>
  <tr><td>Move file on disk first</td><td>Catalogue points at old path</td><td>MODIFY FILE, then move</td></tr>
  <tr><td>Shrink as routine</td><td>Fragmentation, regrowth</td><td>Only after large deletions</td></tr>
  <tr><td>Unsized log</td><td>VLF explosion</td><td>Pre-size in large increments</td></tr>
</table>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.</p>
</div>
      `,
    }
  ],

  steps: [
    "Create the folders D:\\Data, E:\\Data and L:\\Log on your local instance before running the CREATE DATABASE script.",
    "Run the setup script to create StorageLab with a primary file, an FG_Archive file and a log file.",
    "Query sys.database_files and sys.filegroups — record logical names, physical paths, sizes and growth settings.",
    "Add StorageLab_Archive2 to FG_Archive with 128 MB initial size and 128 MB fixed growth.",
    "Change the primary file's growth to a fixed 128 MB and confirm is_percent_growth is 0.",
    "Create a table on FG_Archive and insert enough rows to see the file grow; observe growth events via the default trace if available.",
    "Move a data file correctly: ALTER DATABASE ... MODIFY FILE with the new path, take the database OFFLINE, copy the file on disk, then ONLINE.",
    "Confirm the moved path in sys.database_files and that the database is ONLINE and accessible.",
    "Use dm_os_volume_stats to report free space on every volume that holds a database file.",
    "Drop StorageLab at the end and delete the scratch folders, leaving the instance clean."
  ],

  scenario: {
    title: "The file moved in Explorer that broke a restart",
    html: `
An engineer freed space by moving a live MDF file in Windows Explorer without telling SQL Server. Everything worked until the next patch reboot, when the engine could not find its file at the catalogued path and the database stayed OFFLINE. The fix was to update the catalogue with ALTER DATABASE ... MODIFY FILE, then move the file and bring the database back online. The root cause was treating physical files as ordinary documents instead of catalogue-managed resources.
<p><strong>The lesson:</strong> practise both the diagnosis and the safe mitigation in this lab. Under pressure, the steps you have rehearsed are the steps you will actually take — build good muscle memory now.</p>
    `,
  },

  interview: [
    {
      q: "What is the difference between a logical and a physical file name?",
      a: `
The logical name is the internal identifier used in ALTER DATABASE statements (for example StorageLab_Primary); the physical name is the operating-system path (D:\Data\StorageLab.mdf). SQL Server maps one to the other in the catalogue.
      `,
    },
    {
      q: "Why is fixed autogrowth preferred over percentage growth?",
      a: `
Fixed MB growth is predictable and easy to capacity-plan; percentage growth increases with file size, producing ever-larger growth events that stall workloads and waste space.
      `,
    },
    {
      q: "What is the correct sequence to move a data file?",
      a: `
Run ALTER DATABASE ... MODIFY FILE to set the new path in the catalogue, take the database offline, physically move or copy the file, then bring the database online and verify sys.database_files.
      `,
    }
  ],

  takeaways: [
    "A database maps logical files to physical paths through the catalogue",
    "Pre-size files and use fixed autogrowth to avoid surprises",
    "Data files and the log grow differently — plan each independently",
    "Always move files catalogue-first, never in Explorer alone",
    "Verify layout and free space with sys.database_files and dm_os_volume_stats"
  ]
};
