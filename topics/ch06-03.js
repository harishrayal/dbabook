/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch06-03.html */

window.TOPIC = {
  id: "ch06-03",
  title: "MDF, NDF, and LDF",

  lead: "MDF, NDF, and LDF are the three file extensions you will meet on every SQL Server disk. Understanding what each one really holds — and what the extension does not mean — prevents mis-scoped backups, failed restores, and confusing migrations.",

  objectives: [
    "Identify the primary data, secondary data, and log files",
    "Explain what the catalogue stores versus the file extension",
    "Decide when a database needs an NDF file",
    "Audit a database's file set with T-SQL"
  ],

  sections: [
    {
      h: "The three file types",
      html: `
<p>SQL Server recognises exactly two kinds of file — data and log — but three familiar extensions describe how they are usually named:</p>
<table>
  <tr><th>Extension</th><th>Type in the catalogue</th><th>Role</th><th>Rules</th></tr>
  <tr><td><strong>.mdf</strong></td><td>Data (type 0), primary</td><td>The database's primary data file</td><td>Exactly one per database; it lives in the PRIMARY filegroup and holds system metadata</td></tr>
  <tr><td><strong>.ndf</strong></td><td>Data (type 0), secondary</td><td>Any additional data file</td><td>Optional; any number; each belongs to one filegroup</td></tr>
  <tr><td><strong>.ldf</strong></td><td>Log (type 2)</td><td>The transaction log file</td><td>At least one per database; no filegroup; any additional files are also log files</td></tr>
</table>
<p>The critical insight: <strong>the extension is a human convention, not a type.</strong> SQL Server decides a file's behaviour from the <code>type</code> column in <code>sys.database_files</code>. A file called <code>SalesDB.archive</code> that was created as a log file is a log file, whatever its name says — and scripts that infer type from the extension will get it wrong.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="MDF, NDF and LDF file layout">
    <defs>
      <marker id="mf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="250" y="14" width="260" height="48" rx="12" fill="var(--accent)"/>
    <text x="380" y="43" text-anchor="middle" fill="#ffffff" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">SalesDB</text>

    <rect x="30" y="96" width="440" height="220" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="250" y="122" text-anchor="middle" fill="var(--accent-strong)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">Data files (type 0)</text>

    <rect x="54" y="142" width="392" height="58" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="250" y="166" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">MDF · SalesDB.mdf — primary data file</text>
    <text x="250" y="187" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">in PRIMARY filegroup · system tables live here</text>

    <rect x="54" y="214" width="190" height="84" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="149" y="243" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">NDF · data2.ndf</text>
    <text x="149" y="264" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">secondary data file</text>
    <text x="149" y="284" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">PRIMARY or other filegroup</text>

    <rect x="266" y="214" width="180" height="84" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="356" y="243" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">NDF · archive.ndf</text>
    <text x="356" y="264" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">secondary data file</text>
    <text x="356" y="284" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">in FG_Archive</text>

    <rect x="506" y="96" width="226" height="220" rx="12" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="619" y="122" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">Log files (type 2)</text>

    <rect x="530" y="142" width="178" height="66" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="619" y="170" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">LDF · SalesDB.ldf</text>
    <text x="619" y="192" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">the only log file needed</text>

    <rect x="530" y="224" width="178" height="66" rx="9" fill="var(--surface)" stroke="var(--border)" stroke-dasharray="4 3"/>
    <text x="619" y="252" text-anchor="middle" fill="var(--muted)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">extra log file</text>
    <text x="619" y="274" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">only as a temporary fix</text>

    <line x1="380" y1="64" x2="380" y2="94" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#mf-arrow)"/>
    <line x1="472" y1="206" x2="528" y2="206" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#mf-arrow)"/>

    <text x="380" y="335" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Type comes from the catalogue — never from the file extension.</text>
  </svg>
  <div class="figcaption">Figure 1 — One primary data file, any number of secondary data files, at least one log file outside all filegroups.</div>
</div>
`
    },
    {
      h: "The primary data file (MDF)",
      html: `
<p>The primary data file is special in three ways:</p>
<ul>
  <li>There is <strong>exactly one</strong> per database, and it must be in the PRIMARY filegroup.</li>
  <li>It holds the database's <strong>system metadata</strong> — the root of the allocation tree, filegroup definitions, and object catalogue entries.</li>
  <li>If it cannot grow, the database cannot grow: a full PRIMARY filegroup is a database-wide problem, not a local one.</li>
</ul>
<p>It is created with the database (or copied from <code>model</code> during <code>CREATE DATABASE</code>) and never removed. Everything else in the PRIMARY filegroup — user tables created without an explicit filegroup — is ordinary data that happens to share the primary file.</p>
`
    },
    {
      h: "Secondary data files (NDF)",
      html: `
<p>NDF files exist for practical reasons, not for tidiness:</p>
<ul>
  <li><strong>Capacity</strong> — a volume ran out of space, so a new file lands on another volume.</li>
  <li><strong>I/O distribution</strong> — separate files on separate spindles or LUNs spread read/write load.</li>
  <li><strong>Filegroup placement</strong> — every filegroup other than PRIMARY needs at least one file to be usable.</li>
  <li><strong>Manageability</strong> — a 2 TB single file is painful to move, back up at file level, or check for corruption than two 1 TB files.</li>
</ul>
<p>Once a filegroup holds several files, SQL Server spreads allocation across them proportionally to free space — no configuration required. That behaviour is the whole reason "add a file" is the standard remedy for a full filegroup.</p>
`
    },
    {
      h: "The log file (LDF)",
      html: `
<p>The log file stores the database's log records: one stream, written sequentially, replayed in order during recovery. Points that matter in production:</p>
<ul>
  <li>Every database has <strong>at least one</strong> log file; it lives <strong>no filegroup</strong> (it is not in PRIMARY either).</li>
  <li>You can add more log files, but SQL Server allocates to them one at a time — a second log file is a temporary fix, never a design.</li>
  <li>Log growth happens in <strong>VLFs</strong>; growth settings on the log therefore affect recovery and write latency directly.</li>
  <li>In full recovery, the log is only reusable after a <strong>log backup</strong> — the usual cause of an ever-growing LDF.</li>
</ul>
`
    },
    {
      h: "Auditing the file set",
      html: `
<p>A ten-second health check for any database — type, size, growth, and where each file physically sits:</p>
<pre><code class="language-sql">SELECT db_name(database_id)              AS database_name,
       file_id,
       name                              AS logical_name,
       case type when 0 then 'Data' when 2 then 'Log' end AS file_type,
       type_desc,
       size * 8 / 1024                   AS size_mb,
       case is_percent_growth
            when 1 then cast(growth as varchar(12)) + ' %'
            else cast(growth * 8 / 1024 as varchar(12)) + ' MB'
       end                               AS growth_setting,
       physical_name
FROM   sys.master_files
WHERE  database_id = DB_ID(N'SalesDB')
ORDER BY file_id;</code></pre>
<p>Run it before a migration, after a restore, and whenever someone reports "the disk is full" — it immediately answers which file is growing, where it lives, and how it grows.</p>
`
    },
    {
      h: "Deeper dive: MDF, NDF, and LDF",
      html: `
<p>This section consolidates <strong>MDF, NDF, and LDF</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth. It is appropriate after a one-off large deletion or before a migration, never as a recurring maintenance task.</p>
<p>TempDB is a shared workspace for sorts, hash joins, temporary objects and version store. It is recreated at startup, so it cannot be backed up, and it is a frequent source of contention when misconfigured.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>MDF, NDF, and LDF sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>File type</th><th>Extension</th><th>Role</th></tr>
  <tr><td>Primary data</td><td>MDF</td><td>System objects, boot information</td></tr>
  <tr><td>Secondary data</td><td>NDF</td><td>User objects across filegroups</td></tr>
  <tr><td>Log</td><td>LDF</td><td>Transaction log, recovery</td></tr>
</table>
<p>For TempDB best practice: multiple equally sized data files (one per CPU core up to around eight) on fast storage, pre-sized to avoid growth, with trace flag 1118 semantics standard on modern versions.</p>
<p>Use the following as a starting point when investigating MDF, NDF, and LDF. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- MDF, NDF, and LDF
SELECT name, physical_name, type_desc,
       size / 128 AS size_mb,
       growth, is_percent_growth
FROM   sys.database_files;</code></pre>
<p>A database has logical files (data and log) mapped to physical files on disk. Data files (MDF primary, NDF secondary) are grouped into filegroups; the log file (LDF) is separate and managed independently.</p>
      `,
    }
  ],

  scenario: {
    title: "The second log file that nobody's runbook knew about",
    html: `
<p>A database had grown a second log file months earlier as an emergency fix — created with a default name that had no .ldf extension, because the DBA typed it under pressure. The failover runbook listed files to copy as "every *.mdf and *.ldf on the volume". During an actual datacentre failover, that second log file was not copied. The restored database came up in a broken log chain and the recovery had to be re-run from the last full backup — costing two hours against a one-hour RTO.</p>
<p>Diagnosis was immediate once someone queried <code>sys.database_files</code>: three log files, one of them invisible to an extension-based script. Fix: re-run the copy using the catalogue, not wildcards; then remove the surplus log file after the emergency passed, because multiple log files buy nothing. Prevention: runbooks enumerate files from <code>sys.database_files</code>, files follow the MDF/NDF/LDF convention, and no emergency file survives the incident it was created for.</p>
`
  },

  interview: [
    {
      q: "What are MDF, NDF, and LDF files?",
      a: "MDF is the primary data file — one per database, in the PRIMARY filegroup, holding system metadata. NDF files are additional data files, optional and each in one filegroup. LDF is the transaction log file — at least one per database, in no filegroup. The extensions are naming conventions; the catalogue's type column defines the actual behaviour."
    },
    {
      q: "Does SQL Server care about the file extension?",
      a: "No. The file's role is determined by how it was created and recorded in sys.database_files (type 0 = data, type 2 = log). The extension only helps humans and scripts — and extension-based scripts are exactly what breaks when someone creates a file without the convention."
    },
    {
      q: "When would you add an NDF file?",
      a: "When the current volume is running out of space, when I/O needs to be spread across spindles or LUNs, when a filegroup needs its first file, or when a single file has become unwieldy for backup and management. Allocation then spreads across files in the filegroup automatically, proportional to free space."
    }
  ],

  quiz: [
    {
      "question": "Which fact is covered in the lesson section “The three file types”?",
      "options": [
        "SQL Server recognises exactly two kinds of file — data and log — but three familiar extensions describe how they are usually named:",
        "Once a filegroup holds several files, SQL Server spreads allocation across them proportionally to free space — no configuration required.",
        "The log file stores the database's log records: one stream, written sequentially, replayed in order during recovery."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “SQL Server recognises exactly two kinds of file — data and log — but three familiar extensions describe how they are usually named:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The primary data file (MDF)”?",
      "options": [
        "At least one per database; no filegroup; any additional files are also log files",
        "NDF files exist for practical reasons, not for tidiness:",
        "The primary data file is special in three ways:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The primary data file is special in three ways:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Secondary data files (NDF)”?",
      "options": [
        "It is created with the database (or copied from model during CREATE DATABASE ) and never removed.",
        "NDF files exist for practical reasons, not for tidiness:",
        "The primary data file is special in three ways:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “NDF files exist for practical reasons, not for tidiness:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The log file (LDF)”?",
      "options": [
        "The log file stores the database's log records: one stream, written sequentially, replayed in order during recovery.",
        "It is created with the database (or copied from model during CREATE DATABASE ) and never removed.",
        "NDF files exist for practical reasons, not for tidiness:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The log file stores the database's log records: one stream, written sequentially, replayed in order during recovery. Points that matter in production:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Auditing the file set”?",
      "options": [
        "NDF files exist for practical reasons, not for tidiness:",
        "Once a filegroup holds several files, SQL Server spreads allocation across them proportionally to free space — no configuration required.",
        "A ten-second health check for any database — type, size, growth, and where each file physically sits:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A ten-second health check for any database — type, size, growth, and where each file physically sits:”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Manageability",
        "MDF, NDF, and LDF",
        "Filegroup placement"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates MDF, NDF, and LDF with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Complete the lesson statement: “The critical insight: _____”",
      "options": [
        "the extension is a human convention, not a type.",
        "at least one",
        "no filegroup"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The critical insight: the extension is a human convention, not a type. SQL Server decides a file's behaviour from the type column in sys.database_files. A file called SalesDB.archive that was created as a log file is a log file, whatever its name says — and scripts that infer type from the extension will get it wrong.”"
    },
    {
      "question": "Which fact is covered in the lesson section “The primary data file (MDF)”?",
      "options": [
        "MDF, NDF, and LDF",
        "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth.",
        "It is created with the database (or copied from model during CREATE DATABASE ) and never removed."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “It is created with the database (or copied from model during CREATE DATABASE ) and never removed. Everything else in the PRIMARY filegroup — user tables created without an explicit filegroup — is ordinary data that happens to share the primary file.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Secondary data files (NDF)”?",
      "options": [
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store.",
        "Once a filegroup holds several files, SQL Server spreads allocation across them proportionally to free space — no configuration required.",
        "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Once a filegroup holds several files, SQL Server spreads allocation across them proportionally to free space — no configuration required. That behaviour is the whole reason \"add a file\" is the standard remedy for a full filegroup.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Auditing the file set”?",
      "options": [
        "Run it before a migration, after a restore, and whenever someone reports \"the disk is full\" — it immediately answers which file is growing, where it lives, and how it grows.",
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store.",
        "MDF, NDF, and LDF sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Run it before a migration, after a restore, and whenever someone reports \"the disk is full\" — it immediately answers which file is growing, where it lives, and how it grows.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “The three file types”?",
      "options": [
        "SQL Server recognises exactly two kinds of file — data and log — but three familiar extensions describe how they are usually named:",
        "Once a filegroup holds several files, SQL Server spreads allocation across them proportionally to free space — no configuration required.",
        "The log file stores the database's log records: one stream, written sequentially, replayed in order during recovery."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “SQL Server recognises exactly two kinds of file — data and log — but three familiar extensions describe how they are usually named:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The primary data file (MDF)”?",
      "options": [
        "At least one per database; no filegroup; any additional files are also log files",
        "NDF files exist for practical reasons, not for tidiness:",
        "The primary data file is special in three ways:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The primary data file is special in three ways:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Secondary data files (NDF)”?",
      "options": [
        "It is created with the database (or copied from model during CREATE DATABASE ) and never removed.",
        "NDF files exist for practical reasons, not for tidiness:",
        "The primary data file is special in three ways:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “NDF files exist for practical reasons, not for tidiness:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The log file (LDF)”?",
      "options": [
        "The log file stores the database's log records: one stream, written sequentially, replayed in order during recovery.",
        "It is created with the database (or copied from model during CREATE DATABASE ) and never removed.",
        "NDF files exist for practical reasons, not for tidiness:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The log file stores the database's log records: one stream, written sequentially, replayed in order during recovery. Points that matter in production:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Auditing the file set”?",
      "options": [
        "NDF files exist for practical reasons, not for tidiness:",
        "Once a filegroup holds several files, SQL Server spreads allocation across them proportionally to free space — no configuration required.",
        "A ten-second health check for any database — type, size, growth, and where each file physically sits:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A ten-second health check for any database — type, size, growth, and where each file physically sits:”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Manageability",
        "MDF, NDF, and LDF",
        "Filegroup placement"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates MDF, NDF, and LDF with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Complete the lesson statement: “The critical insight: _____”",
      "options": [
        "the extension is a human convention, not a type.",
        "at least one",
        "no filegroup"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The critical insight: the extension is a human convention, not a type. SQL Server decides a file's behaviour from the type column in sys.database_files. A file called SalesDB.archive that was created as a log file is a log file, whatever its name says — and scripts that infer type from the extension will get it wrong.”"
    },
    {
      "question": "Which fact is covered in the lesson section “The primary data file (MDF)”?",
      "options": [
        "MDF, NDF, and LDF",
        "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth.",
        "It is created with the database (or copied from model during CREATE DATABASE ) and never removed."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “It is created with the database (or copied from model during CREATE DATABASE ) and never removed. Everything else in the PRIMARY filegroup — user tables created without an explicit filegroup — is ordinary data that happens to share the primary file.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Secondary data files (NDF)”?",
      "options": [
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store.",
        "Once a filegroup holds several files, SQL Server spreads allocation across them proportionally to free space — no configuration required.",
        "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Once a filegroup holds several files, SQL Server spreads allocation across them proportionally to free space — no configuration required. That behaviour is the whole reason \"add a file\" is the standard remedy for a full filegroup.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Auditing the file set”?",
      "options": [
        "Run it before a migration, after a restore, and whenever someone reports \"the disk is full\" — it immediately answers which file is growing, where it lives, and how it grows.",
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store.",
        "MDF, NDF, and LDF sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Run it before a migration, after a restore, and whenever someone reports \"the disk is full\" — it immediately answers which file is growing, where it lives, and how it grows.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “The three file types”?",
      "options": [
        "SQL Server recognises exactly two kinds of file — data and log — but three familiar extensions describe how they are usually named:",
        "Once a filegroup holds several files, SQL Server spreads allocation across them proportionally to free space — no configuration required.",
        "The log file stores the database's log records: one stream, written sequentially, replayed in order during recovery."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “SQL Server recognises exactly two kinds of file — data and log — but three familiar extensions describe how they are usually named:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The primary data file (MDF)”?",
      "options": [
        "At least one per database; no filegroup; any additional files are also log files",
        "NDF files exist for practical reasons, not for tidiness:",
        "The primary data file is special in three ways:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The primary data file is special in three ways:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Secondary data files (NDF)”?",
      "options": [
        "It is created with the database (or copied from model during CREATE DATABASE ) and never removed.",
        "NDF files exist for practical reasons, not for tidiness:",
        "The primary data file is special in three ways:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “NDF files exist for practical reasons, not for tidiness:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The log file (LDF)”?",
      "options": [
        "The log file stores the database's log records: one stream, written sequentially, replayed in order during recovery.",
        "It is created with the database (or copied from model during CREATE DATABASE ) and never removed.",
        "NDF files exist for practical reasons, not for tidiness:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The log file stores the database's log records: one stream, written sequentially, replayed in order during recovery. Points that matter in production:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Auditing the file set”?",
      "options": [
        "NDF files exist for practical reasons, not for tidiness:",
        "Once a filegroup holds several files, SQL Server spreads allocation across them proportionally to free space — no configuration required.",
        "A ten-second health check for any database — type, size, growth, and where each file physically sits:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A ten-second health check for any database — type, size, growth, and where each file physically sits:”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Manageability",
        "MDF, NDF, and LDF",
        "Filegroup placement"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates MDF, NDF, and LDF with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Complete the lesson statement: “The critical insight: _____”",
      "options": [
        "the extension is a human convention, not a type.",
        "at least one",
        "no filegroup"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The critical insight: the extension is a human convention, not a type. SQL Server decides a file's behaviour from the type column in sys.database_files. A file called SalesDB.archive that was created as a log file is a log file, whatever its name says — and scripts that infer type from the extension will get it wrong.”"
    },
    {
      "question": "Which fact is covered in the lesson section “The primary data file (MDF)”?",
      "options": [
        "MDF, NDF, and LDF",
        "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth.",
        "It is created with the database (or copied from model during CREATE DATABASE ) and never removed."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “It is created with the database (or copied from model during CREATE DATABASE ) and never removed. Everything else in the PRIMARY filegroup — user tables created without an explicit filegroup — is ordinary data that happens to share the primary file.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Secondary data files (NDF)”?",
      "options": [
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store.",
        "Once a filegroup holds several files, SQL Server spreads allocation across them proportionally to free space — no configuration required.",
        "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Once a filegroup holds several files, SQL Server spreads allocation across them proportionally to free space — no configuration required. That behaviour is the whole reason \"add a file\" is the standard remedy for a full filegroup.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Auditing the file set”?",
      "options": [
        "Run it before a migration, after a restore, and whenever someone reports \"the disk is full\" — it immediately answers which file is growing, where it lives, and how it grows.",
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store.",
        "MDF, NDF, and LDF sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Run it before a migration, after a restore, and whenever someone reports \"the disk is full\" — it immediately answers which file is growing, where it lives, and how it grows.”"
    }
  ],
  takeaways: [
    "MDF = primary data file (one per database), NDF = secondary data files, LDF = log file",
    "Extensions are conventions; the catalogue's type column (data vs log) is what matters",
    "The primary file lives in PRIMARY and holds system metadata — if it cannot grow, nothing does",
    "NDF files exist for capacity, I/O spread, and filegroup placement; allocation spreads across them automatically",
    "The log has no filegroup and a second log file is a temporary fix, never a design",
    "Enumerate files from sys.database_files in runbooks — never from file-extension wildcards"
  ]
};
