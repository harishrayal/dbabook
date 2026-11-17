/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch06-10.html */

window.TOPIC = {
  id: "ch06-10",
  title: "Transaction Log Growth",

  lead: "Transaction Log Growth is a core part of database storage and file management. This topic explains what it is, how it works inside SQL Server, and what a production DBA must know to operate it safely.",

  objectives: [
    "Define what Transaction Log Growth is and where it fits",
    "Explain how Transaction Log Growth works internally",
    "Apply Transaction Log Growth correctly in a production environment",
    "Recognise the common mistakes and risks involving Transaction Log Growth",
    "Monitor and troubleshoot Transaction Log Growth with the right tools"
  ],

  sections: [
    {
      h: "What Transaction Log Growth means",
      html: `
<p>In this topic we examine <strong>Transaction Log Growth</strong> within database storage and file management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>The PRIMARY filegroup holds system objects and is the default home for user objects. Additional user-defined filegroups let a DBA place large tables or indexes on specific volumes for performance or administration.</p>
<p>Autogrowth is a safety net, not a sizing strategy. Fixed-size growth (for example 512 MB) is predictable; percentage growth becomes increasingly large and wasteful as a file grows. Pre-size files and cap growth deliberately.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Transaction Log Growth is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Transaction Log Growth fits",
      html: `
<p>Data file growth and log file growth behave differently. Data can spread across many files in a filegroup; the log is effectively sequential and can only grow by adding VLFs, so uncontrolled growth harms recovery.</p>
<p>The diagram below places Transaction Log Growth alongside the core concepts of database storage and file management. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Transaction Log Growth concept map">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="280" y="140" width="200" height="60" rx="9" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="175" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Transaction Log Growth</text>
    <rect x="24" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Filegroup</text>
    <text x="124" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 1</text>
    <rect x="536" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Data file</text>
    <text x="636" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 2</text>
    <rect x="24" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Log file</text>
    <text x="124" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 3</text>
    <rect x="536" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Autogrowth</text>
    <text x="636" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 4</text>
    <rect x="24" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">TempDB</text>
    <text x="124" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 5</text>
    <rect x="536" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Volume</text>
    <text x="636" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 6</text>
    <line x1="380" y1="170" x2="124" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
  </svg>
  <div class="figcaption">Figure 1 — Database storage and file management: how Transaction Log Growth relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Transaction Log Growth in practice",
      html: `
<p>File relocation is a catalogue operation followed by a physical move: ALTER DATABASE ... MODIFY FILE updates the path, then the database is taken offline while the file is moved on disk and brought back online.</p>
<p>The following comparison captures the distinctions that matter most when working with Transaction Log Growth:</p>
<table>
  <tr><th>File type</th><th>Extension</th><th>Role</th></tr>
  <tr><td>Primary data</td><td>MDF</td><td>System objects, boot information</td></tr>
  <tr><td>Secondary data</td><td>NDF</td><td>User objects across filegroups</td></tr>
  <tr><td>Log</td><td>LDF</td><td>Transaction log, recovery</td></tr>
</table>
<p>Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth. It is appropriate after a one-off large deletion or before a migration, never as a recurring maintenance task.</p>
      `,
    },
    {
      h: "Working with Transaction Log Growth",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Transaction Log Growth. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Transaction Log Growth
ALTER DATABASE SalesDB
ADD FILEGROUP FG_Archive;
GO
ALTER DATABASE SalesDB
ADD FILE (
  NAME = SalesDB_Archive,
  FILENAME = 'E:\Data\SalesDB_Archive.ndf',
  SIZE = 2GB, FILEGROWTH = 512MB
) TO FILEGROUP FG_Archive;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Transaction Log Growth
SELECT name, physical_name, type_desc,
       size / 128 AS size_mb,
       growth, is_percent_growth
FROM   sys.database_files;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Transaction Log Growth
-- TempDB file count and size
SELECT name, size / 128 AS size_mb, growth
FROM   tempdb.sys.database_files
ORDER BY type_desc, name;</code></pre>
<p>TempDB is a shared workspace for sorts, hash joins, temporary objects and version store. It is recreated at startup, so it cannot be backed up, and it is a frequent source of contention when misconfigured.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>For TempDB best practice: multiple equally sized data files (one per CPU core up to around eight) on fast storage, pre-sized to avoid growth, with trace flag 1118 semantics standard on modern versions.</p>
<table>
  <tr><th>Growth setting</th><th>Behaviour</th><th>Recommendation</th></tr>
  <tr><td>Fixed MB</td><td>Adds a constant amount</td><td>Preferred — predictable</td></tr>
  <tr><td>Percentage</td><td>Adds a growing amount</td><td>Avoid on large files</td></tr>
  <tr><td>Autogrowth off</td><td>Fails when full</td><td>Only with monitoring</td></tr>
</table>
<p>A database has logical files (data and log) mapped to physical files on disk. Data files (MDF primary, NDF secondary) are grouped into filegroups; the log file (LDF) is separate and managed independently.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Transaction Log Growth, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    }
  ],

  scenario: {
    title: "TempDB contention at month end",
    html: `
Month-end reporting drove heavy sort and hash activity and latency on a single TempDB data file, with PAGELATCH waits on allocation pages. Adding three equally sized TempDB files and enabling trace flags removed the contention. TempDB configuration is a first-line performance lever.
<p><strong>The Transaction Log Growth lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "Why is percentage autogrowth discouraged?",
      a: `
Because the increment grows with the file, causing increasingly large and unpredictable growth events with long stalls; fixed-size growth is predictable and easier to capacity plan.
      `,
    },
    {
      q: "Can you back up TempDB?",
      a: `
No. TempDB is recreated on every SQL Server start, so it cannot be backed up or restored; the focus is correct configuration and fast storage.
      `,
    },
    {
      q: "What is the correct way to move a data file?",
      a: `
Use ALTER DATABASE ... MODIFY FILE to change the catalogued path, take the database offline, physically move the file, then bring it back online — never rename or move a live file in the OS.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database storage and file management.”",
      "options": [
        "Transaction log, recovery",
        "Theory becomes useful when you can apply it.",
        "Transaction Log Growth"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Transaction Log Growth within database storage and file management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Transaction Log Growth fits”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Data file growth and log file growth behave differently.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Data file growth and log file growth behave differently. Data can spread across many files in a filegroup; the log is effectively sequential and can only grow by adding VLFs, so uncontrolled growth harms recovery.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Transaction Log Growth in practice”?",
      "options": [
        "File relocation is a catalogue operation followed by a physical move: ALTER DATABASE...",
        "With Transaction Log Growth, prefer measured, reversible changes.",
        "Preferred — predictable"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “File relocation is a catalogue operation followed by a physical move: ALTER DATABASE... MODIFY FILE updates the path, then the database is taken offline while the file is moved on disk and brought back online.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Transaction Log Growth”?",
      "options": [
        "A database has logical files (data and log) mapped to physical files on disk.",
        "With Transaction Log Growth, prefer measured, reversible changes.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Transaction Log Growth. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store.",
        "For TempDB best practice: multiple equally sized data files (one per CPU core up to around eight) on fast storage, pre-sized to avoid growth, with trace flag 1118 semantics…",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “For TempDB best practice: multiple equally sized data files (one per CPU core up to around eight) on fast storage, pre-sized to avoid growth, with trace flag 1118 semantics standard on modern versions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Transaction Log Growth means”?",
      "options": [
        "The PRIMARY filegroup holds system objects and is the default home for user objects.",
        "Preferred — predictable",
        "Avoid on large files"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The PRIMARY filegroup holds system objects and is the default home for user objects. Additional user-defined filegroups let a DBA place large tables or indexes on specific volumes for performance or administration.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Transaction Log Growth fits”?",
      "options": [
        "With Transaction Log Growth, prefer measured, reversible changes.",
        "Preferred — predictable",
        "The diagram below places Transaction Log Growth alongside the core concepts of database storage and file management."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Transaction Log Growth alongside the core concepts of database storage and file management. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Transaction Log Growth in practice”?",
      "options": [
        "System objects, boot information",
        "The following comparison captures the distinctions that matter most when working with Transaction Log Growth:",
        "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Transaction Log Growth:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Transaction Log Growth”?",
      "options": [
        "The first example establishes the relevant state.",
        "Theory becomes useful when you can apply it.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Avoid on large files",
        "Only with monitoring",
        "A database has logical files (data and log) mapped to physical files on disk."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A database has logical files (data and log) mapped to physical files on disk. Data files (MDF primary, NDF secondary) are grouped into filegroups; the log file (LDF) is separate and managed independently.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database storage and file management.”",
      "options": [
        "Transaction log, recovery",
        "Theory becomes useful when you can apply it.",
        "Transaction Log Growth"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Transaction Log Growth within database storage and file management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Transaction Log Growth fits”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Data file growth and log file growth behave differently.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Data file growth and log file growth behave differently. Data can spread across many files in a filegroup; the log is effectively sequential and can only grow by adding VLFs, so uncontrolled growth harms recovery.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Transaction Log Growth in practice”?",
      "options": [
        "File relocation is a catalogue operation followed by a physical move: ALTER DATABASE...",
        "With Transaction Log Growth, prefer measured, reversible changes.",
        "Preferred — predictable"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “File relocation is a catalogue operation followed by a physical move: ALTER DATABASE... MODIFY FILE updates the path, then the database is taken offline while the file is moved on disk and brought back online.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Transaction Log Growth”?",
      "options": [
        "A database has logical files (data and log) mapped to physical files on disk.",
        "With Transaction Log Growth, prefer measured, reversible changes.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Transaction Log Growth. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store.",
        "For TempDB best practice: multiple equally sized data files (one per CPU core up to around eight) on fast storage, pre-sized to avoid growth, with trace flag 1118 semantics…",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “For TempDB best practice: multiple equally sized data files (one per CPU core up to around eight) on fast storage, pre-sized to avoid growth, with trace flag 1118 semantics standard on modern versions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Transaction Log Growth means”?",
      "options": [
        "The PRIMARY filegroup holds system objects and is the default home for user objects.",
        "Preferred — predictable",
        "Avoid on large files"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The PRIMARY filegroup holds system objects and is the default home for user objects. Additional user-defined filegroups let a DBA place large tables or indexes on specific volumes for performance or administration.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Transaction Log Growth fits”?",
      "options": [
        "With Transaction Log Growth, prefer measured, reversible changes.",
        "Preferred — predictable",
        "The diagram below places Transaction Log Growth alongside the core concepts of database storage and file management."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Transaction Log Growth alongside the core concepts of database storage and file management. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Transaction Log Growth in practice”?",
      "options": [
        "System objects, boot information",
        "The following comparison captures the distinctions that matter most when working with Transaction Log Growth:",
        "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Transaction Log Growth:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Transaction Log Growth”?",
      "options": [
        "The first example establishes the relevant state.",
        "Theory becomes useful when you can apply it.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Avoid on large files",
        "Only with monitoring",
        "A database has logical files (data and log) mapped to physical files on disk."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A database has logical files (data and log) mapped to physical files on disk. Data files (MDF primary, NDF secondary) are grouped into filegroups; the log file (LDF) is separate and managed independently.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database storage and file management.”",
      "options": [
        "Transaction log, recovery",
        "Theory becomes useful when you can apply it.",
        "Transaction Log Growth"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Transaction Log Growth within database storage and file management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Transaction Log Growth fits”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Data file growth and log file growth behave differently.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Data file growth and log file growth behave differently. Data can spread across many files in a filegroup; the log is effectively sequential and can only grow by adding VLFs, so uncontrolled growth harms recovery.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Transaction Log Growth in practice”?",
      "options": [
        "File relocation is a catalogue operation followed by a physical move: ALTER DATABASE...",
        "With Transaction Log Growth, prefer measured, reversible changes.",
        "Preferred — predictable"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “File relocation is a catalogue operation followed by a physical move: ALTER DATABASE... MODIFY FILE updates the path, then the database is taken offline while the file is moved on disk and brought back online.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Transaction Log Growth”?",
      "options": [
        "A database has logical files (data and log) mapped to physical files on disk.",
        "With Transaction Log Growth, prefer measured, reversible changes.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Transaction Log Growth. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store.",
        "For TempDB best practice: multiple equally sized data files (one per CPU core up to around eight) on fast storage, pre-sized to avoid growth, with trace flag 1118 semantics…",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “For TempDB best practice: multiple equally sized data files (one per CPU core up to around eight) on fast storage, pre-sized to avoid growth, with trace flag 1118 semantics standard on modern versions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Transaction Log Growth means”?",
      "options": [
        "The PRIMARY filegroup holds system objects and is the default home for user objects.",
        "Preferred — predictable",
        "Avoid on large files"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The PRIMARY filegroup holds system objects and is the default home for user objects. Additional user-defined filegroups let a DBA place large tables or indexes on specific volumes for performance or administration.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Transaction Log Growth fits”?",
      "options": [
        "With Transaction Log Growth, prefer measured, reversible changes.",
        "Preferred — predictable",
        "The diagram below places Transaction Log Growth alongside the core concepts of database storage and file management."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Transaction Log Growth alongside the core concepts of database storage and file management. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Transaction Log Growth in practice”?",
      "options": [
        "System objects, boot information",
        "The following comparison captures the distinctions that matter most when working with Transaction Log Growth:",
        "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Transaction Log Growth:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Transaction Log Growth”?",
      "options": [
        "The first example establishes the relevant state.",
        "Theory becomes useful when you can apply it.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Avoid on large files",
        "Only with monitoring",
        "A database has logical files (data and log) mapped to physical files on disk."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A database has logical files (data and log) mapped to physical files on disk. Data files (MDF primary, NDF secondary) are grouped into filegroups; the log file (LDF) is separate and managed independently.”"
    }
  ],
  takeaways: [
    "Transaction Log Growth is a fundamental concept in database storage and file management",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Transaction Log Growth improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
