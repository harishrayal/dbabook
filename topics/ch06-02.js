/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch06-02.html */

window.TOPIC = {
  id: "ch06-02",
  title: "Logical and Physical Database Files",

  lead: "Every database has two identities: the logical structure you query and administer, and the physical files Windows sees on disk. A DBA who confuses the two will eventually rename, move, or copy a file they should not have touched.",

  objectives: [
    "Distinguish logical database objects from physical storage",
    "Map a table or index down to filegroup, file, and page",
    "Explain why logical names and physical paths must stay in sync",
    "Inspect and change file properties safely with catalog views"
  ],

  sections: [
    {
      h: "Two views of the same database",
      html: `
<p>When you write <code>SELECT … FROM dbo.Orders</code>, you are addressing the <strong>logical</strong> side: schemas, tables, indexes, filegroups, and file logical names. When Windows Explorer shows <code>E:\\Data\\SalesDB.mdf</code>, it is showing the <strong>physical</strong> side: bytes on a volume. SQL Server keeps a catalogue that maps one to the other, and every storage operation is really an edit of that mapping.</p>
<table>
  <tr><th>Concern</th><th>Logical layer</th><th>Physical layer</th></tr>
  <tr><td>Units</td><td>Database, filegroup, file logical name, object</td><td>File path, page, extent, VLF, volume</td></tr>
  <tr><td>Addressed by</td><td>T-SQL: <code>ALTER DATABASE … MODIFY FILE (NAME = …)</code></td><td>Windows, backups of raw files, attach/detach</td></tr>
  <tr><td>Visible in</td><td><code>sys.filegroups</code>, <code>sys.database_files</code>, <code>sys.tables</code></td><td><code>sys.master_files.physical_name</code>, Explorer</td></tr>
  <tr><td>Safe to change while online?</td><td>Yes, with the right ALTER statement</td><td>No — never rename or move a live file in the OS</td></tr>
</table>
<p>The catalogue is the single source of truth. If the physical path in the catalogue no longer matches the file on disk, the database cannot start cleanly, and a copy job that renames files "for tidiness" can break a restore months later.</p>
`
    },
    {
      h: "How an object maps to storage",
      html: `
<p>Follow one row of <code>dbo.Orders</code> down the hierarchy — every arrow is a mapping the catalogue maintains for you:</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Mapping a logical table to physical files and pages">
    <defs>
      <marker id="map-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="270" y="18" width="220" height="52" rx="9" fill="var(--accent)" />
    <text x="380" y="50" text-anchor="middle" fill="#ffffff" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">dbo.Orders (logical table)</text>

    <rect x="270" y="104" width="220" height="52" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="126" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Filegroup: PRIMARY</text>
    <text x="380" y="145" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">one filegroup owns the object</text>

    <rect x="120" y="190" width="220" height="52" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="230" y="212" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">SalesDB.mdf</text>
    <text x="230" y="231" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">physical file · logical name SalesDB_data</text>

    <rect x="420" y="190" width="220" height="52" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="530" y="212" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">SalesDB_2.ndf</text>
    <text x="530" y="231" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">second file · same filegroup</text>

    <rect x="270" y="278" width="220" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)"/>
    <text x="380" y="307" text-anchor="middle" fill="var(--accent-strong)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">8 KB data pages (via IAM / extents)</text>

    <line x1="380" y1="70" x2="380" y2="102" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#map-arrow)"/>
    <line x1="340" y1="156" x2="240" y2="188" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#map-arrow)"/>
    <line x1="420" y1="156" x2="520" y2="188" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#map-arrow)"/>
    <line x1="230" y1="242" x2="360" y2="276" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#map-arrow)"/>
    <line x1="530" y1="242" x2="400" y2="276" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#map-arrow)"/>
  </svg>
  <div class="figcaption">Figure 1 — One logical table maps to one filegroup, which can span several physical files, down to individual 8 KB pages.</div>
</div>
<ol>
  <li>The table (or index) belongs to a <strong>filegroup</strong> — by default PRIMARY.</li>
  <li>The filegroup contains one or more <strong>data files</strong>; SQL Server spreads allocation across them, favouring the file with the most free space.</li>
  <li>Allocation is recorded through <strong>IAM</strong> pages, which let the engine walk the extents an object owns.</li>
  <li>Each extent holds eight <strong>8 KB pages</strong>, and the row you asked for sits on exactly one of them.</li>
</ol>
<p>Two consequences are worth memorising:</p>
<ul>
  <li>A table or index lives in <strong>exactly one filegroup</strong> (unless it is partitioned, where each partition can sit in a different filegroup via a partition scheme).</li>
  <li>Within that filegroup the object can span <strong>any number of files</strong> — adding a second file transparently spreads its growth.</li>
</ul>
<p>That is why "add a file to the filegroup" is the standard fix when a table outgrows one file, and why moving a table between filegroups requires rebuilding its clustered index (or switching partitions) rather than a simple setting change.</p>
`
    },
    {
      h: "Logical names, physical paths, and keeping them in sync",
      html: `
<p>Each file has two identities:</p>
<ul>
  <li><strong>Logical name</strong> — for example <code>SalesDB_data</code>. It is what every T-SQL statement uses: <code>ALTER DATABASE … MODIFY FILE (NAME = N'SalesDB_data', …)</code>, <code>FILEPROPERTY(N'SalesDB_data', …)</code>, backup/restore WITH MOVE clauses.</li>
  <li><strong>Physical name</strong> — for example <code>E:\\Data\\SalesDB.mdf</code>. It is what Windows, the service account, and volume snapshots see. The file extension is only a convention: SQL Server trusts the catalogue's <code>type</code> column, not the name on disk.</li>
</ul>
<p>You can change either independently, but only through SQL Server:</p>
<pre><code class="language-sql">-- Relocate a data file: update the catalogue first, then move the file
-- while the database is offline (or single-user) during the move itself
ALTER DATABASE [SalesDB]
MODIFY FILE (
    NAME     = N'SalesDB_data',
    FILENAME = N'E:\\Data\\SalesDB.mdf'
);
-- Then take the database offline, move the file in Windows, bring it online.</code></pre>
<p>Doing it the other way round — moving the file in Explorer and hoping — leaves the catalogue pointing at a path that does not exist, and the database will not come up.</p>
`
    },
    {
      h: "Inspecting the mapping",
      html: `
<p>Three views answer nearly every layout question:</p>
<pre><code class="language-sql">-- 1. All databases: logical name, physical path, type, filegroup
SELECT d.name                       AS database_name,
       mf.name                      AS logical_name,
       mf.type_desc,
       fg.name                      AS filegroup_name,
       mf.physical_name
FROM   sys.master_files AS mf
JOIN   sys.databases    AS d ON d.database_id = mf.database_id
LEFT JOIN sys.filegroups AS fg
       ON fg.data_space_id = mf.data_space_id
       AND fg.type = 'FG'
ORDER BY d.name, mf.file_id;</code></pre>
<pre><code class="language-sql">-- 2. Current database: how full is each file really?
SELECT f.name                      AS logical_name,
       f.type_desc,
       f.size * 8 / 1024           AS size_mb,
       cast(FILEPROPERTY(f.name, 'SpaceUsed') * 8.0 / 1024
            as decimal(18, 1))     AS used_mb
FROM   sys.database_files AS f
WHERE  f.type = 0;                -- data files only; log has no SpaceUsed via FILEPROPERTY in the same way</code></pre>
<p><code>FILEPROPERTY(name, 'SpaceUsed')</code> reports pages actually used by the current database, which is how you tell a genuinely full file from one that is merely large — a distinction that decides whether you need space or a shrink.</p>
`
    },
    {
      h: "Rules that keep the two layers aligned",
      html: `
<p>Production habits that prevent nearly every "the files are a mess" incident:</p>
<ul>
  <li><strong>Never touch a live database's files in the OS</strong> — no renames, no moves, no "tidying up" folders while the service is running.</li>
  <li><strong>Change paths with <code>ALTER DATABASE … MODIFY FILE … FILENAME</code></strong>, then take the database offline, move the file, and bring it back.</li>
  <li><strong>Keep naming conventions consistent</strong> — logical name mirrors the file name, extension matches the type (MDF/NDF for data, LDF for log) so runbooks and scripts stay predictable.</li>
  <li><strong>Record the layout in your CMDB</strong> — volume, path, filegroup, growth policy. Restore plans depend on it.</li>
  <li><strong>Verify after every change</strong> — re-run the <code>sys.master_files</code> query and confirm state is ONLINE.</li>
</ul>
`
    }
  ],

  scenario: {
    title: "A tidy-up rename took the database down for 40 minutes",
    html: `
<p>During a storage migration, a junior engineer detached SalesDB, copied the files to the new volume, and — to keep names consistent with a runbook — renamed <code>SalesDB_2019.ndf</code> to <code>SalesDB_data2.ndf</code>. The re-attach failed: the catalogue still expected the old name. Back at the office the team was unsure which files had been renamed, and every minute of uncertainty was a minute of downtime for order entry.</p>
<p>The DBA recovered by comparing <code>sys.database_files.physical_name</code> with the actual files on disk, renaming the file back to match the catalogue, and attaching with <code>FOR ATTACH</code>. The database came back online in 40 minutes; the fix itself took two. Prevention: file moves are DBA-owned and go through <code>ALTER DATABASE … MODIFY FILE … FILENAME</code> plus an offline/online window — engineers do not rename database files in Explorer, and every migration runbook carries the catalogue-vs-disk comparison as a verification step.</p>
`
  },

  interview: [
    {
      q: "What is the difference between a file's logical name and its physical name?",
      a: "The logical name is the identifier used inside SQL Server — in ALTER, FILEPROPERTY, and restore WITH MOVE clauses. The physical name is the OS path on disk. They are independent: you can change the path without renaming the logical file, but both must stay consistent with the file that actually exists or the database will not start."
    },
    {
      q: "Can a table span multiple files? Multiple filegroups?",
      a: "Multiple files in its filegroup: yes, allocation spreads across them automatically. Multiple filegroups: no — a non-partitioned table or index lives in one filegroup. To place a table in a different filegroup you rebuild its clustered index there (or use partition switching); partitioned objects can span filegroups because each partition maps through a partition scheme."
    },
    {
      q: "How do you move a database file to another volume with minimal risk?",
      a: "Update the catalogue with ALTER DATABASE … MODIFY FILE (NAME = …, FILENAME = 'new path'), take the database offline, move the file in Windows, bring it back online, then verify state and paths via sys.database_files. For a log file you can often add a new log file on the target volume and shrink the old one instead, avoiding an offline window altogether."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “Orders, you are addressing the _____ side: schemas, tables, indexes, filegroups, and file logical names.”",
      "options": [
        "IAM",
        "logical",
        "data files"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “When you write SELECT … FROM dbo.Orders, you are addressing the logical side: schemas, tables, indexes, filegroups, and file logical names. When Windows Explorer shows E:\\Data\\SalesDB.mdf, it is showing the physical side: bytes on a volume. SQL Server keeps a catalogue that maps one to the other, and every storage operation is really an edit of that mapping.”"
    },
    {
      "question": "Which fact is covered in the lesson section “How an object maps to storage”?",
      "options": [
        "Orders down the hierarchy — every arrow is a mapping the catalogue maintains for you:",
        "Windows, backups of raw files, attach/detach",
        "sys.master_files.physical_name, Explorer"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Follow one row of dbo.Orders down the hierarchy — every arrow is a mapping the catalogue maintains for you:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Logical names, physical paths, and keeping them in sync”?",
      "options": [
        "sys.master_files.physical_name, Explorer",
        "No — never rename or move a live file in the OS",
        "You can change either independently, but only through SQL Server:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “You can change either independently, but only through SQL Server:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Inspecting the mapping”?",
      "options": [
        "Orders down the hierarchy — every arrow is a mapping the catalogue maintains for you:",
        "Three views answer nearly every layout question:",
        "No — never rename or move a live file in the OS"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Three views answer nearly every layout question:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Rules that keep the two layers aligned”?",
      "options": [
        "Production habits that prevent nearly every \"the files are a mess\" incident:",
        "Orders down the hierarchy — every arrow is a mapping the catalogue maintains for you:",
        "Two consequences are worth memorising:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Production habits that prevent nearly every \"the files are a mess\" incident:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Two views of the same database”?",
      "options": [
        "Production habits that prevent nearly every \"the files are a mess\" incident:",
        "logical",
        "The catalogue is the single source of truth."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The catalogue is the single source of truth. If the physical path in the catalogue no longer matches the file on disk, the database cannot start cleanly, and a copy job that renames files \"for tidiness\" can break a restore months later.”"
    },
    {
      "question": "Which fact is covered in the lesson section “How an object maps to storage”?",
      "options": [
        "FILEPROPERTY(name, 'SpaceUsed') reports pages actually used by the current database, which is how you tell a genuinely full file from one that is merely large — a distinction that…",
        "Two consequences are worth memorising:",
        "Three views answer nearly every layout question:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Two consequences are worth memorising:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Logical names, physical paths, and keeping them in sync”?",
      "options": [
        "Doing it the other way round — moving the file in Explorer and hoping — leaves the catalogue pointing at a path that does not exist, and the database will not come up.",
        "Three views answer nearly every layout question:",
        "FILEPROPERTY(name, 'SpaceUsed') reports pages actually used by the current database, which is how you tell a genuinely full file from one that is merely large — a distinction that…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Doing it the other way round — moving the file in Explorer and hoping — leaves the catalogue pointing at a path that does not exist, and the database will not come up.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Inspecting the mapping”?",
      "options": [
        "Doing it the other way round — moving the file in Explorer and hoping — leaves the catalogue pointing at a path that does not exist, and the database will not come up.",
        "Production habits that prevent nearly every \"the files are a mess\" incident:",
        "FILEPROPERTY(name, 'SpaceUsed') reports pages actually used by the current database, which is how you tell a genuinely full file from one that is merely large — a distinction that…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “FILEPROPERTY(name, 'SpaceUsed') reports pages actually used by the current database, which is how you tell a genuinely full file from one that is merely large — a distinction that decides whether you need space or a shrink.”"
    },
    {
      "question": "In the “Two views of the same database” table, what is listed for “Units” under “Physical layer”?",
      "options": [
        "Production habits that prevent nearly every \"the files are a mess\" incident:",
        "File path, page, extent, VLF, volume",
        "FILEPROPERTY(name, 'SpaceUsed') reports pages actually used by the current database, which is how you tell a genuinely full file from one that is merely large — a distinction that…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Units” as “File path, page, extent, VLF, volume”."
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “Orders, you are addressing the _____ side: schemas, tables, indexes, filegroups, and file logical names.”",
      "options": [
        "IAM",
        "logical",
        "data files"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “When you write SELECT … FROM dbo.Orders, you are addressing the logical side: schemas, tables, indexes, filegroups, and file logical names. When Windows Explorer shows E:\\Data\\SalesDB.mdf, it is showing the physical side: bytes on a volume. SQL Server keeps a catalogue that maps one to the other, and every storage operation is really an edit of that mapping.”"
    },
    {
      "question": "Which fact is covered in the lesson section “How an object maps to storage”?",
      "options": [
        "Orders down the hierarchy — every arrow is a mapping the catalogue maintains for you:",
        "Windows, backups of raw files, attach/detach",
        "sys.master_files.physical_name, Explorer"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Follow one row of dbo.Orders down the hierarchy — every arrow is a mapping the catalogue maintains for you:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Logical names, physical paths, and keeping them in sync”?",
      "options": [
        "sys.master_files.physical_name, Explorer",
        "No — never rename or move a live file in the OS",
        "You can change either independently, but only through SQL Server:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “You can change either independently, but only through SQL Server:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Inspecting the mapping”?",
      "options": [
        "Orders down the hierarchy — every arrow is a mapping the catalogue maintains for you:",
        "Three views answer nearly every layout question:",
        "No — never rename or move a live file in the OS"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Three views answer nearly every layout question:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Rules that keep the two layers aligned”?",
      "options": [
        "Production habits that prevent nearly every \"the files are a mess\" incident:",
        "Orders down the hierarchy — every arrow is a mapping the catalogue maintains for you:",
        "Two consequences are worth memorising:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Production habits that prevent nearly every \"the files are a mess\" incident:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Two views of the same database”?",
      "options": [
        "Production habits that prevent nearly every \"the files are a mess\" incident:",
        "logical",
        "The catalogue is the single source of truth."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The catalogue is the single source of truth. If the physical path in the catalogue no longer matches the file on disk, the database cannot start cleanly, and a copy job that renames files \"for tidiness\" can break a restore months later.”"
    },
    {
      "question": "Which fact is covered in the lesson section “How an object maps to storage”?",
      "options": [
        "FILEPROPERTY(name, 'SpaceUsed') reports pages actually used by the current database, which is how you tell a genuinely full file from one that is merely large — a distinction that…",
        "Two consequences are worth memorising:",
        "Three views answer nearly every layout question:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Two consequences are worth memorising:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Logical names, physical paths, and keeping them in sync”?",
      "options": [
        "Doing it the other way round — moving the file in Explorer and hoping — leaves the catalogue pointing at a path that does not exist, and the database will not come up.",
        "Three views answer nearly every layout question:",
        "FILEPROPERTY(name, 'SpaceUsed') reports pages actually used by the current database, which is how you tell a genuinely full file from one that is merely large — a distinction that…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Doing it the other way round — moving the file in Explorer and hoping — leaves the catalogue pointing at a path that does not exist, and the database will not come up.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Inspecting the mapping”?",
      "options": [
        "Doing it the other way round — moving the file in Explorer and hoping — leaves the catalogue pointing at a path that does not exist, and the database will not come up.",
        "Production habits that prevent nearly every \"the files are a mess\" incident:",
        "FILEPROPERTY(name, 'SpaceUsed') reports pages actually used by the current database, which is how you tell a genuinely full file from one that is merely large — a distinction that…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “FILEPROPERTY(name, 'SpaceUsed') reports pages actually used by the current database, which is how you tell a genuinely full file from one that is merely large — a distinction that decides whether you need space or a shrink.”"
    },
    {
      "question": "In the “Two views of the same database” table, what is listed for “Units” under “Physical layer”?",
      "options": [
        "Production habits that prevent nearly every \"the files are a mess\" incident:",
        "File path, page, extent, VLF, volume",
        "FILEPROPERTY(name, 'SpaceUsed') reports pages actually used by the current database, which is how you tell a genuinely full file from one that is merely large — a distinction that…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Units” as “File path, page, extent, VLF, volume”."
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “Orders, you are addressing the _____ side: schemas, tables, indexes, filegroups, and file logical names.”",
      "options": [
        "IAM",
        "logical",
        "data files"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “When you write SELECT … FROM dbo.Orders, you are addressing the logical side: schemas, tables, indexes, filegroups, and file logical names. When Windows Explorer shows E:\\Data\\SalesDB.mdf, it is showing the physical side: bytes on a volume. SQL Server keeps a catalogue that maps one to the other, and every storage operation is really an edit of that mapping.”"
    },
    {
      "question": "Which fact is covered in the lesson section “How an object maps to storage”?",
      "options": [
        "Orders down the hierarchy — every arrow is a mapping the catalogue maintains for you:",
        "Windows, backups of raw files, attach/detach",
        "sys.master_files.physical_name, Explorer"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Follow one row of dbo.Orders down the hierarchy — every arrow is a mapping the catalogue maintains for you:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Logical names, physical paths, and keeping them in sync”?",
      "options": [
        "sys.master_files.physical_name, Explorer",
        "No — never rename or move a live file in the OS",
        "You can change either independently, but only through SQL Server:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “You can change either independently, but only through SQL Server:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Inspecting the mapping”?",
      "options": [
        "Orders down the hierarchy — every arrow is a mapping the catalogue maintains for you:",
        "Three views answer nearly every layout question:",
        "No — never rename or move a live file in the OS"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Three views answer nearly every layout question:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Rules that keep the two layers aligned”?",
      "options": [
        "Production habits that prevent nearly every \"the files are a mess\" incident:",
        "Orders down the hierarchy — every arrow is a mapping the catalogue maintains for you:",
        "Two consequences are worth memorising:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Production habits that prevent nearly every \"the files are a mess\" incident:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Two views of the same database”?",
      "options": [
        "Production habits that prevent nearly every \"the files are a mess\" incident:",
        "logical",
        "The catalogue is the single source of truth."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The catalogue is the single source of truth. If the physical path in the catalogue no longer matches the file on disk, the database cannot start cleanly, and a copy job that renames files \"for tidiness\" can break a restore months later.”"
    },
    {
      "question": "Which fact is covered in the lesson section “How an object maps to storage”?",
      "options": [
        "FILEPROPERTY(name, 'SpaceUsed') reports pages actually used by the current database, which is how you tell a genuinely full file from one that is merely large — a distinction that…",
        "Two consequences are worth memorising:",
        "Three views answer nearly every layout question:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Two consequences are worth memorising:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Logical names, physical paths, and keeping them in sync”?",
      "options": [
        "Doing it the other way round — moving the file in Explorer and hoping — leaves the catalogue pointing at a path that does not exist, and the database will not come up.",
        "Three views answer nearly every layout question:",
        "FILEPROPERTY(name, 'SpaceUsed') reports pages actually used by the current database, which is how you tell a genuinely full file from one that is merely large — a distinction that…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Doing it the other way round — moving the file in Explorer and hoping — leaves the catalogue pointing at a path that does not exist, and the database will not come up.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Inspecting the mapping”?",
      "options": [
        "Doing it the other way round — moving the file in Explorer and hoping — leaves the catalogue pointing at a path that does not exist, and the database will not come up.",
        "Production habits that prevent nearly every \"the files are a mess\" incident:",
        "FILEPROPERTY(name, 'SpaceUsed') reports pages actually used by the current database, which is how you tell a genuinely full file from one that is merely large — a distinction that…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “FILEPROPERTY(name, 'SpaceUsed') reports pages actually used by the current database, which is how you tell a genuinely full file from one that is merely large — a distinction that decides whether you need space or a shrink.”"
    },
    {
      "question": "In the “Two views of the same database” table, what is listed for “Units” under “Physical layer”?",
      "options": [
        "Production habits that prevent nearly every \"the files are a mess\" incident:",
        "File path, page, extent, VLF, volume",
        "FILEPROPERTY(name, 'SpaceUsed') reports pages actually used by the current database, which is how you tell a genuinely full file from one that is merely large — a distinction that…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Units” as “File path, page, extent, VLF, volume”."
    }
  ],
  takeaways: [
    "Every database has a logical layer (objects, filegroups, logical file names) and a physical layer (paths, pages, extents)",
    "The catalogue maps one to the other — sys.master_files and sys.database_files are the source of truth",
    "A table lives in one filegroup but can span many files within it",
    "File extensions are conventions; SQL Server trusts the catalogue's type column",
    "Never rename or move a live database's files in the OS — use ALTER DATABASE … MODIFY FILE, then move offline",
    "FILEPROPERTY(name, 'SpaceUsed') tells you real usage, not just allocated size"
  ]
};
