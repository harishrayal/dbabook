/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch06-19.html */

window.TOPIC = {
  id: "ch06-19",
  title: "TempDB Architecture",

  lead: "TempDB Architecture is a core part of database storage and file management. This topic explains what it is, how it works inside SQL Server, and what a production DBA must know to operate it safely.",

  objectives: [
    "Define what TempDB Architecture is and where it fits",
    "Explain how TempDB Architecture works internally",
    "Apply TempDB Architecture correctly in a production environment",
    "Recognise the common mistakes and risks involving TempDB Architecture",
    "Monitor and troubleshoot TempDB Architecture with the right tools"
  ],

  sections: [
    {
      h: "What TempDB Architecture means",
      html: `
<p>In this topic we examine <strong>TempDB Architecture</strong> within database storage and file management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Autogrowth is a safety net, not a sizing strategy. Fixed-size growth (for example 512 MB) is predictable; percentage growth becomes increasingly large and wasteful as a file grows. Pre-size files and cap growth deliberately.</p>
<p>Data file growth and log file growth behave differently. Data can spread across many files in a filegroup; the log is effectively sequential and can only grow by adding VLFs, so uncontrolled growth harms recovery.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>TempDB Architecture is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where TempDB Architecture fits",
      html: `
<p>File relocation is a catalogue operation followed by a physical move: ALTER DATABASE ... MODIFY FILE updates the path, then the database is taken offline while the file is moved on disk and brought back online.</p>
<p>The diagram below places TempDB Architecture alongside the core concepts of database storage and file management. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="TempDB Architecture concept map">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="280" y="140" width="200" height="60" rx="9" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="175" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">TempDB Architecture</text>
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
  <div class="figcaption">Figure 1 — Database storage and file management: how TempDB Architecture relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "TempDB Architecture in practice",
      html: `
<p>Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth. It is appropriate after a one-off large deletion or before a migration, never as a recurring maintenance task.</p>
<p>The following comparison captures the distinctions that matter most when working with TempDB Architecture:</p>
<table>
  <tr><th>File type</th><th>Extension</th><th>Role</th></tr>
  <tr><td>Primary data</td><td>MDF</td><td>System objects, boot information</td></tr>
  <tr><td>Secondary data</td><td>NDF</td><td>User objects across filegroups</td></tr>
  <tr><td>Log</td><td>LDF</td><td>Transaction log, recovery</td></tr>
</table>
<p>TempDB is a shared workspace for sorts, hash joins, temporary objects and version store. It is recreated at startup, so it cannot be backed up, and it is a frequent source of contention when misconfigured.</p>
      `,
    },
    {
      h: "Working with TempDB Architecture",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to TempDB Architecture. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- TempDB Architecture
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
<pre><code class="language-sql">-- TempDB Architecture
SELECT name, physical_name, type_desc,
       size / 128 AS size_mb,
       growth, is_percent_growth
FROM   sys.database_files;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- TempDB Architecture
-- TempDB file count and size
SELECT name, size / 128 AS size_mb, growth
FROM   tempdb.sys.database_files
ORDER BY type_desc, name;</code></pre>
<p>For TempDB best practice: multiple equally sized data files (one per CPU core up to around eight) on fast storage, pre-sized to avoid growth, with trace flag 1118 semantics standard on modern versions.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>A database has logical files (data and log) mapped to physical files on disk. Data files (MDF primary, NDF secondary) are grouped into filegroups; the log file (LDF) is separate and managed independently.</p>
<table>
  <tr><th>Growth setting</th><th>Behaviour</th><th>Recommendation</th></tr>
  <tr><td>Fixed MB</td><td>Adds a constant amount</td><td>Preferred — predictable</td></tr>
  <tr><td>Percentage</td><td>Adds a growing amount</td><td>Avoid on large files</td></tr>
  <tr><td>Autogrowth off</td><td>Fails when full</td><td>Only with monitoring</td></tr>
</table>
<p>The PRIMARY filegroup holds system objects and is the default home for user objects. Additional user-defined filegroups let a DBA place large tables or indexes on specific volumes for performance or administration.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With TempDB Architecture, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    }
  ],

  scenario: {
    title: "Autogrowth thrash during a bulk load",
    html: `
A nightly import grew a data file in 1 MB increments hundreds of times, each growth stalling the load and fragmenting the file. Pre-sizing the file to the expected post-load size and setting 512 MB fixed growth removed the stalls. Autogrowth is a safety net that should rarely fire in normal operation.
<p><strong>The TempDB Architecture lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
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
        "Avoid on large files",
        "Only with monitoring",
        "TempDB Architecture"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine TempDB Architecture within database storage and file management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where TempDB Architecture fits”?",
      "options": [
        "TempDB Architecture",
        "File relocation is a catalogue operation followed by a physical move: ALTER DATABASE...",
        "The diagram below places TempDB Architecture alongside the core concepts of database storage and file management."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “File relocation is a catalogue operation followed by a physical move: ALTER DATABASE... MODIFY FILE updates the path, then the database is taken offline while the file is moved on disk and brought back online.”"
    },
    {
      "question": "Which fact is covered in the lesson section “TempDB Architecture in practice”?",
      "options": [
        "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth.",
        "TempDB Architecture",
        "Autogrowth is a safety net, not a sizing strategy."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth. It is appropriate after a one-off large deletion or before a migration, never as a recurring maintenance task.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with TempDB Architecture”?",
      "options": [
        "Autogrowth is a safety net, not a sizing strategy.",
        "Data file growth and log file growth behave differently.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to TempDB Architecture. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "TempDB Architecture is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "A database has logical files (data and log) mapped to physical files on disk.",
        "Data file growth and log file growth behave differently."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A database has logical files (data and log) mapped to physical files on disk. Data files (MDF primary, NDF secondary) are grouped into filegroups; the log file (LDF) is separate and managed independently.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What TempDB Architecture means”?",
      "options": [
        "Autogrowth is a safety net, not a sizing strategy.",
        "The following comparison captures the distinctions that matter most when working with TempDB Architecture:",
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Autogrowth is a safety net, not a sizing strategy. Fixed-size growth (for example 512 MB) is predictable; percentage growth becomes increasingly large and wasteful as a file grows. Pre-size files and cap growth deliberately.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where TempDB Architecture fits”?",
      "options": [
        "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth.",
        "The following comparison captures the distinctions that matter most when working with TempDB Architecture:",
        "The diagram below places TempDB Architecture alongside the core concepts of database storage and file management."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places TempDB Architecture alongside the core concepts of database storage and file management. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “TempDB Architecture in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The following comparison captures the distinctions that matter most when working with TempDB Architecture:",
        "The diagram below places TempDB Architecture alongside the core concepts of database storage and file management."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with TempDB Architecture:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with TempDB Architecture”?",
      "options": [
        "The first example establishes the relevant state.",
        "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth.",
        "The following comparison captures the distinctions that matter most when working with TempDB Architecture:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with TempDB Architecture:",
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store.",
        "The PRIMARY filegroup holds system objects and is the default home for user objects."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The PRIMARY filegroup holds system objects and is the default home for user objects. Additional user-defined filegroups let a DBA place large tables or indexes on specific volumes for performance or administration.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database storage and file management.”",
      "options": [
        "Avoid on large files",
        "Only with monitoring",
        "TempDB Architecture"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine TempDB Architecture within database storage and file management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where TempDB Architecture fits”?",
      "options": [
        "TempDB Architecture",
        "File relocation is a catalogue operation followed by a physical move: ALTER DATABASE...",
        "The diagram below places TempDB Architecture alongside the core concepts of database storage and file management."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “File relocation is a catalogue operation followed by a physical move: ALTER DATABASE... MODIFY FILE updates the path, then the database is taken offline while the file is moved on disk and brought back online.”"
    },
    {
      "question": "Which fact is covered in the lesson section “TempDB Architecture in practice”?",
      "options": [
        "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth.",
        "TempDB Architecture",
        "Autogrowth is a safety net, not a sizing strategy."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth. It is appropriate after a one-off large deletion or before a migration, never as a recurring maintenance task.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with TempDB Architecture”?",
      "options": [
        "Autogrowth is a safety net, not a sizing strategy.",
        "Data file growth and log file growth behave differently.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to TempDB Architecture. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "TempDB Architecture is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "A database has logical files (data and log) mapped to physical files on disk.",
        "Data file growth and log file growth behave differently."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A database has logical files (data and log) mapped to physical files on disk. Data files (MDF primary, NDF secondary) are grouped into filegroups; the log file (LDF) is separate and managed independently.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What TempDB Architecture means”?",
      "options": [
        "Autogrowth is a safety net, not a sizing strategy.",
        "The following comparison captures the distinctions that matter most when working with TempDB Architecture:",
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Autogrowth is a safety net, not a sizing strategy. Fixed-size growth (for example 512 MB) is predictable; percentage growth becomes increasingly large and wasteful as a file grows. Pre-size files and cap growth deliberately.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where TempDB Architecture fits”?",
      "options": [
        "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth.",
        "The following comparison captures the distinctions that matter most when working with TempDB Architecture:",
        "The diagram below places TempDB Architecture alongside the core concepts of database storage and file management."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places TempDB Architecture alongside the core concepts of database storage and file management. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “TempDB Architecture in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The following comparison captures the distinctions that matter most when working with TempDB Architecture:",
        "The diagram below places TempDB Architecture alongside the core concepts of database storage and file management."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with TempDB Architecture:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with TempDB Architecture”?",
      "options": [
        "The first example establishes the relevant state.",
        "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth.",
        "The following comparison captures the distinctions that matter most when working with TempDB Architecture:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with TempDB Architecture:",
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store.",
        "The PRIMARY filegroup holds system objects and is the default home for user objects."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The PRIMARY filegroup holds system objects and is the default home for user objects. Additional user-defined filegroups let a DBA place large tables or indexes on specific volumes for performance or administration.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database storage and file management.”",
      "options": [
        "Avoid on large files",
        "Only with monitoring",
        "TempDB Architecture"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine TempDB Architecture within database storage and file management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where TempDB Architecture fits”?",
      "options": [
        "TempDB Architecture",
        "File relocation is a catalogue operation followed by a physical move: ALTER DATABASE...",
        "The diagram below places TempDB Architecture alongside the core concepts of database storage and file management."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “File relocation is a catalogue operation followed by a physical move: ALTER DATABASE... MODIFY FILE updates the path, then the database is taken offline while the file is moved on disk and brought back online.”"
    },
    {
      "question": "Which fact is covered in the lesson section “TempDB Architecture in practice”?",
      "options": [
        "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth.",
        "TempDB Architecture",
        "Autogrowth is a safety net, not a sizing strategy."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth. It is appropriate after a one-off large deletion or before a migration, never as a recurring maintenance task.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with TempDB Architecture”?",
      "options": [
        "Autogrowth is a safety net, not a sizing strategy.",
        "Data file growth and log file growth behave differently.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to TempDB Architecture. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "TempDB Architecture is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "A database has logical files (data and log) mapped to physical files on disk.",
        "Data file growth and log file growth behave differently."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A database has logical files (data and log) mapped to physical files on disk. Data files (MDF primary, NDF secondary) are grouped into filegroups; the log file (LDF) is separate and managed independently.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What TempDB Architecture means”?",
      "options": [
        "Autogrowth is a safety net, not a sizing strategy.",
        "The following comparison captures the distinctions that matter most when working with TempDB Architecture:",
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Autogrowth is a safety net, not a sizing strategy. Fixed-size growth (for example 512 MB) is predictable; percentage growth becomes increasingly large and wasteful as a file grows. Pre-size files and cap growth deliberately.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where TempDB Architecture fits”?",
      "options": [
        "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth.",
        "The following comparison captures the distinctions that matter most when working with TempDB Architecture:",
        "The diagram below places TempDB Architecture alongside the core concepts of database storage and file management."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places TempDB Architecture alongside the core concepts of database storage and file management. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “TempDB Architecture in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The following comparison captures the distinctions that matter most when working with TempDB Architecture:",
        "The diagram below places TempDB Architecture alongside the core concepts of database storage and file management."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with TempDB Architecture:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with TempDB Architecture”?",
      "options": [
        "The first example establishes the relevant state.",
        "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth.",
        "The following comparison captures the distinctions that matter most when working with TempDB Architecture:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with TempDB Architecture:",
        "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store.",
        "The PRIMARY filegroup holds system objects and is the default home for user objects."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The PRIMARY filegroup holds system objects and is the default home for user objects. Additional user-defined filegroups let a DBA place large tables or indexes on specific volumes for performance or administration.”"
    }
  ],
  takeaways: [
    "TempDB Architecture is a fundamental concept in database storage and file management",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of TempDB Architecture improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
