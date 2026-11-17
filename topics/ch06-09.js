/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch06-09.html */

window.TOPIC = {
  id: "ch06-09",
  title: "Data File Growth",

  lead: "This topic covers Data File Growth — a concept you will meet repeatedly when working with database storage and file management. We build from first principles to production guidance.",

  objectives: [
    "Define what Data File Growth is and where it fits",
    "Explain how Data File Growth works internally",
    "Apply Data File Growth correctly in a production environment",
    "Recognise the common mistakes and risks involving Data File Growth",
    "Monitor and troubleshoot Data File Growth with the right tools"
  ],

  sections: [
    {
      h: "What Data File Growth means",
      html: `
<p>In this topic we examine <strong>Data File Growth</strong> within database storage and file management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>A database has logical files (data and log) mapped to physical files on disk. Data files (MDF primary, NDF secondary) are grouped into filegroups; the log file (LDF) is separate and managed independently.</p>
<p>The PRIMARY filegroup holds system objects and is the default home for user objects. Additional user-defined filegroups let a DBA place large tables or indexes on specific volumes for performance or administration.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Data File Growth is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Data File Growth fits",
      html: `
<p>Autogrowth is a safety net, not a sizing strategy. Fixed-size growth (for example 512 MB) is predictable; percentage growth becomes increasingly large and wasteful as a file grows. Pre-size files and cap growth deliberately.</p>
<p>The diagram below places Data File Growth alongside the core concepts of database storage and file management. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Data File Growth layers">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="70" y="8" width="620" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="30" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Filegroup</text>
    <text x="380" y="50" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 1</text>
    <rect x="100" y="62" width="560" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="84" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Data file</text>
    <text x="380" y="104" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 2</text>
    <rect x="130" y="116" width="500" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="138" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Log file</text>
    <text x="380" y="158" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 3</text>
    <rect x="160" y="170" width="440" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="192" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Autogrowth</text>
    <text x="380" y="212" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 4</text>
    <rect x="190" y="224" width="380" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="246" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">TempDB</text>
    <text x="380" y="266" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 5</text>
    <rect x="220" y="278" width="320" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="300" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Volume</text>
    <text x="380" y="320" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 6</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Data File Growth</text>
  </svg>
  <div class="figcaption">Figure 1 — Database storage and file management: how Data File Growth relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Data File Growth in practice",
      html: `
<p>Data file growth and log file growth behave differently. Data can spread across many files in a filegroup; the log is effectively sequential and can only grow by adding VLFs, so uncontrolled growth harms recovery.</p>
<p>The following comparison captures the distinctions that matter most when working with Data File Growth:</p>
<table>
  <tr><th>File type</th><th>Extension</th><th>Role</th></tr>
  <tr><td>Primary data</td><td>MDF</td><td>System objects, boot information</td></tr>
  <tr><td>Secondary data</td><td>NDF</td><td>User objects across filegroups</td></tr>
  <tr><td>Log</td><td>LDF</td><td>Transaction log, recovery</td></tr>
</table>
<p>File relocation is a catalogue operation followed by a physical move: ALTER DATABASE ... MODIFY FILE updates the path, then the database is taken offline while the file is moved on disk and brought back online.</p>
      `,
    },
    {
      h: "Working with Data File Growth",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Data File Growth. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Data File Growth
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
<pre><code class="language-sql">-- Data File Growth
SELECT name, physical_name, type_desc,
       size / 128 AS size_mb,
       growth, is_percent_growth
FROM   sys.database_files;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Data File Growth
-- TempDB file count and size
SELECT name, size / 128 AS size_mb, growth
FROM   tempdb.sys.database_files
ORDER BY type_desc, name;</code></pre>
<p>Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth. It is appropriate after a one-off large deletion or before a migration, never as a recurring maintenance task.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>TempDB is a shared workspace for sorts, hash joins, temporary objects and version store. It is recreated at startup, so it cannot be backed up, and it is a frequent source of contention when misconfigured.</p>
<table>
  <tr><th>Growth setting</th><th>Behaviour</th><th>Recommendation</th></tr>
  <tr><td>Fixed MB</td><td>Adds a constant amount</td><td>Preferred — predictable</td></tr>
  <tr><td>Percentage</td><td>Adds a growing amount</td><td>Avoid on large files</td></tr>
  <tr><td>Autogrowth off</td><td>Fails when full</td><td>Only with monitoring</td></tr>
</table>
<p>For TempDB best practice: multiple equally sized data files (one per CPU core up to around eight) on fast storage, pre-sized to avoid growth, with trace flag 1118 semantics standard on modern versions.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Data File Growth, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Data File Growth",
      html: `
<p>This section consolidates <strong>Data File Growth</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Data file growth and log file growth behave differently. Data can spread across many files in a filegroup; the log is effectively sequential and can only grow by adding VLFs, so uncontrolled growth harms recovery.</p>
<p>File relocation is a catalogue operation followed by a physical move: ALTER DATABASE ... MODIFY FILE updates the path, then the database is taken offline while the file is moved on disk and brought back online.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Data File Growth sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>File type</th><th>Extension</th><th>Role</th></tr>
  <tr><td>Primary data</td><td>MDF</td><td>System objects, boot information</td></tr>
  <tr><td>Secondary data</td><td>NDF</td><td>User objects across filegroups</td></tr>
  <tr><td>Log</td><td>LDF</td><td>Transaction log, recovery</td></tr>
</table>
<p>Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth. It is appropriate after a one-off large deletion or before a migration, never as a recurring maintenance task.</p>
<p>Use the following as a starting point when investigating Data File Growth. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Data File Growth
SELECT name, physical_name, type_desc,
       size / 128 AS size_mb,
       growth, is_percent_growth
FROM   sys.database_files;</code></pre>
<p>TempDB is a shared workspace for sorts, hash joins, temporary objects and version store. It is recreated at startup, so it cannot be backed up, and it is a frequent source of contention when misconfigured.</p>
      `,
    }
  ],

  scenario: {
    title: "Autogrowth thrash during a bulk load",
    html: `
A nightly import grew a data file in 1 MB increments hundreds of times, each growth stalling the load and fragmenting the file. Pre-sizing the file to the expected post-load size and setting 512 MB fixed growth removed the stalls. Autogrowth is a safety net that should rarely fire in normal operation.
<p><strong>The Data File Growth lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "What is the correct way to move a data file?",
      a: `
Use ALTER DATABASE ... MODIFY FILE to change the catalogued path, take the database offline, physically move the file, then bring it back online — never rename or move a live file in the OS.
      `,
    },
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
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database storage and file management.”",
      "options": [
        "Data File Growth",
        "User objects across filegroups",
        "Transaction log, recovery"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Data File Growth within database storage and file management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Data File Growth fits”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "Autogrowth is a safety net, not a sizing strategy."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Autogrowth is a safety net, not a sizing strategy. Fixed-size growth (for example 512 MB) is predictable; percentage growth becomes increasingly large and wasteful as a file grows. Pre-size files and cap growth deliberately.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Data File Growth in practice”?",
      "options": [
        "With Data File Growth, prefer measured, reversible changes.",
        "Data file growth and log file growth behave differently.",
        "For TempDB best practice: multiple equally sized data files (one per CPU core up to around eight) on fast storage, pre-sized to avoid growth, with trace flag 1118 semantics…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Data file growth and log file growth behave differently. Data can spread across many files in a filegroup; the log is effectively sequential and can only grow by adding VLFs, so uncontrolled growth harms recovery.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Data File Growth”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store.",
        "For TempDB best practice: multiple equally sized data files (one per CPU core up to around eight) on fast storage, pre-sized to avoid growth, with trace flag 1118 semantics…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Data File Growth. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “TempDB is a shared workspace for sorts, hash joins, temporary objects and version store. It is recreated at startup, so it cannot be backed up, and it is a frequent source of contention when misconfigured.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store.",
        "Data File Growth",
        "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Data File Growth with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Data File Growth means”?",
      "options": [
        "A database has logical files (data and log) mapped to physical files on disk.",
        "Preferred — predictable",
        "Avoid on large files"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A database has logical files (data and log) mapped to physical files on disk. Data files (MDF primary, NDF secondary) are grouped into filegroups; the log file (LDF) is separate and managed independently.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Data File Growth fits”?",
      "options": [
        "With Data File Growth, prefer measured, reversible changes.",
        "Preferred — predictable",
        "The diagram below places Data File Growth alongside the core concepts of database storage and file management."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Data File Growth alongside the core concepts of database storage and file management. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Data File Growth in practice”?",
      "options": [
        "Data File Growth sits inside a larger system.",
        "The following comparison captures the distinctions that matter most when working with Data File Growth:",
        "File relocation is a catalogue operation followed by a physical move: ALTER DATABASE..."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Data File Growth:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Data File Growth”?",
      "options": [
        "The first example establishes the relevant state.",
        "Data File Growth sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database storage and file management.”",
      "options": [
        "Data File Growth",
        "User objects across filegroups",
        "Transaction log, recovery"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Data File Growth within database storage and file management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Data File Growth fits”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "Autogrowth is a safety net, not a sizing strategy."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Autogrowth is a safety net, not a sizing strategy. Fixed-size growth (for example 512 MB) is predictable; percentage growth becomes increasingly large and wasteful as a file grows. Pre-size files and cap growth deliberately.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Data File Growth in practice”?",
      "options": [
        "With Data File Growth, prefer measured, reversible changes.",
        "Data file growth and log file growth behave differently.",
        "For TempDB best practice: multiple equally sized data files (one per CPU core up to around eight) on fast storage, pre-sized to avoid growth, with trace flag 1118 semantics…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Data file growth and log file growth behave differently. Data can spread across many files in a filegroup; the log is effectively sequential and can only grow by adding VLFs, so uncontrolled growth harms recovery.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Data File Growth”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store.",
        "For TempDB best practice: multiple equally sized data files (one per CPU core up to around eight) on fast storage, pre-sized to avoid growth, with trace flag 1118 semantics…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Data File Growth. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “TempDB is a shared workspace for sorts, hash joins, temporary objects and version store. It is recreated at startup, so it cannot be backed up, and it is a frequent source of contention when misconfigured.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store.",
        "Data File Growth",
        "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Data File Growth with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Data File Growth means”?",
      "options": [
        "A database has logical files (data and log) mapped to physical files on disk.",
        "Preferred — predictable",
        "Avoid on large files"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A database has logical files (data and log) mapped to physical files on disk. Data files (MDF primary, NDF secondary) are grouped into filegroups; the log file (LDF) is separate and managed independently.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Data File Growth fits”?",
      "options": [
        "With Data File Growth, prefer measured, reversible changes.",
        "Preferred — predictable",
        "The diagram below places Data File Growth alongside the core concepts of database storage and file management."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Data File Growth alongside the core concepts of database storage and file management. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Data File Growth in practice”?",
      "options": [
        "Data File Growth sits inside a larger system.",
        "The following comparison captures the distinctions that matter most when working with Data File Growth:",
        "File relocation is a catalogue operation followed by a physical move: ALTER DATABASE..."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Data File Growth:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Data File Growth”?",
      "options": [
        "The first example establishes the relevant state.",
        "Data File Growth sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database storage and file management.”",
      "options": [
        "Data File Growth",
        "User objects across filegroups",
        "Transaction log, recovery"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Data File Growth within database storage and file management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Data File Growth fits”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "Autogrowth is a safety net, not a sizing strategy."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Autogrowth is a safety net, not a sizing strategy. Fixed-size growth (for example 512 MB) is predictable; percentage growth becomes increasingly large and wasteful as a file grows. Pre-size files and cap growth deliberately.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Data File Growth in practice”?",
      "options": [
        "With Data File Growth, prefer measured, reversible changes.",
        "Data file growth and log file growth behave differently.",
        "For TempDB best practice: multiple equally sized data files (one per CPU core up to around eight) on fast storage, pre-sized to avoid growth, with trace flag 1118 semantics…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Data file growth and log file growth behave differently. Data can spread across many files in a filegroup; the log is effectively sequential and can only grow by adding VLFs, so uncontrolled growth harms recovery.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Data File Growth”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store.",
        "For TempDB best practice: multiple equally sized data files (one per CPU core up to around eight) on fast storage, pre-sized to avoid growth, with trace flag 1118 semantics…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Data File Growth. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “TempDB is a shared workspace for sorts, hash joins, temporary objects and version store. It is recreated at startup, so it cannot be backed up, and it is a frequent source of contention when misconfigured.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store.",
        "Data File Growth",
        "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Data File Growth with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Data File Growth means”?",
      "options": [
        "A database has logical files (data and log) mapped to physical files on disk.",
        "Preferred — predictable",
        "Avoid on large files"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A database has logical files (data and log) mapped to physical files on disk. Data files (MDF primary, NDF secondary) are grouped into filegroups; the log file (LDF) is separate and managed independently.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Data File Growth fits”?",
      "options": [
        "With Data File Growth, prefer measured, reversible changes.",
        "Preferred — predictable",
        "The diagram below places Data File Growth alongside the core concepts of database storage and file management."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Data File Growth alongside the core concepts of database storage and file management. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Data File Growth in practice”?",
      "options": [
        "Data File Growth sits inside a larger system.",
        "The following comparison captures the distinctions that matter most when working with Data File Growth:",
        "File relocation is a catalogue operation followed by a physical move: ALTER DATABASE..."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Data File Growth:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Data File Growth”?",
      "options": [
        "The first example establishes the relevant state.",
        "Data File Growth sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Data File Growth is a fundamental concept in database storage and file management",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Data File Growth improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
