/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch14-09.html */

window.TOPIC = {
  id: "ch14-09",
  title: "DBCC CHECKALLOC",

  lead: "This topic covers DBCC CHECKALLOC — a concept you will meet repeatedly when working with database integrity and corruption. We build from first principles to production guidance.",

  objectives: [
    "Define what DBCC CHECKALLOC is and where it fits",
    "Explain how DBCC CHECKALLOC works internally",
    "Apply DBCC CHECKALLOC correctly in a production environment",
    "Recognise the common mistakes and risks involving DBCC CHECKALLOC",
    "Monitor and troubleshoot DBCC CHECKALLOC with the right tools"
  ],

  sections: [
    {
      h: "What DBCC CHECKALLOC means",
      html: `
<p>In this topic we examine <strong>DBCC CHECKALLOC</strong> within database integrity and corruption. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Database integrity is about detecting damage before it becomes data loss. Corruption is either physical — damaged pages, torn writes, I/O errors — or logical — inconsistent indexes and metadata that the engine can still read but is wrong.</p>
<p>Page checksums are the primary detection mechanism. With CHECKSUM enabled, SQL Server writes a checksum into each page and verifies it on read, catching silent disk corruption that would otherwise go unnoticed until a query fails.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>DBCC CHECKALLOC is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where DBCC CHECKALLOC fits",
      html: `
<p>DBCC CHECKDB is the definitive integrity check. It verifies allocation, structure and logical consistency across the database and reports errors with repair levels and severity. It should be scheduled regularly and after every restore.</p>
<p>The diagram below places DBCC CHECKALLOC alongside the core concepts of database integrity and corruption. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="DBCC CHECKALLOC layers">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="70" y="8" width="620" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="30" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">CHECKDB</text>
    <text x="380" y="50" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 1</text>
    <rect x="100" y="62" width="560" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="84" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Checksum</text>
    <text x="380" y="104" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 2</text>
    <rect x="130" y="116" width="500" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="138" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Page</text>
    <text x="380" y="158" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 3</text>
    <rect x="160" y="170" width="440" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="192" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Corruption</text>
    <text x="380" y="212" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 4</text>
    <rect x="190" y="224" width="380" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="246" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">SUSPECT</text>
    <text x="380" y="266" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 5</text>
    <rect x="220" y="278" width="320" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="300" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Restore</text>
    <text x="380" y="320" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 6</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">DBCC CHECKALLOC</text>
  </svg>
  <div class="figcaption">Figure 1 — Database integrity and corruption: how DBCC CHECKALLOC relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "DBCC CHECKALLOC in practice",
      html: `
<p>DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata. Running full CHECKDB frequently can be expensive, so large systems sometimes split checks across a rotating schedule.</p>
<p>The following comparison captures the distinctions that matter most when working with DBCC CHECKALLOC:</p>
<table>
  <tr><th>Error / state</th><th>Meaning</th><th>First action</th></tr>
  <tr><td>824 / 825</td><td>Logical consistency / I/O error</td><td>Check hardware, run CHECKDB</td></tr>
  <tr><td>SUSPECT</td><td>Recovery failed at startup</td><td>Check log, avoid emergency mode first</td></tr>
  <tr><td>RECOVERY_PENDING</td><td>Recovery cannot start</td><td>Check log access and space</td></tr>
</table>
<p>Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page. The response is careful: capture evidence, avoid destructive repair first, and prefer restoring a clean page or database.</p>
      `,
    },
    {
      h: "Working with DBCC CHECKALLOC",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to DBCC CHECKALLOC. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- DBCC CHECKALLOC
DBCC CHECKDB ('SalesDB') WITH NO_INFOMSGS, ALL_ERRORMSGS;
GO
-- Results include the lowest repair level recommended</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- DBCC CHECKALLOC
-- Enable page checksums and verify on backup
ALTER DATABASE SalesDB SET PAGE_VERIFY CHECKSUM;
GO
BACKUP DATABASE SalesDB
TO DISK = 'D:\Backups\SalesDB_Checksum.bak'
WITH CHECKSUM, COMPRESSION;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- DBCC CHECKALLOC
-- Restore a single corrupted page from a clean backup
RESTORE DATABASE SalesDB
PAGE = '1:123456'
FROM DISK = 'D:\Backups\SalesDB_Full.bak'
WITH NORECOVERY;
-- then apply the log chain and recover</code></pre>
<p>Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and business approval.</p>
<table>
  <tr><th>Repair option</th><th>Risk</th><th>When</th></tr>
  <tr><td>REPAIR_FAST</td><td>Low</td><td>Minor, non-data issues</td></tr>
  <tr><td>REPAIR_REBUILD</td><td>Medium</td><td>Rebuild indexes</td></tr>
  <tr><td>REPAIR_ALLOW_DATA_LOSS</td><td>High</td><td>Absolute last resort</td></tr>
</table>
<p>A corruption incident is a data-loss event until proven otherwise. Preserve the original files, determine the root cause — often storage — and replace the failing hardware before returning the database to service.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With DBCC CHECKALLOC, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: DBCC CHECKALLOC",
      html: `
<p>This section consolidates <strong>DBCC CHECKALLOC</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata. Running full CHECKDB frequently can be expensive, so large systems sometimes split checks across a rotating schedule.</p>
<p>Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page. The response is careful: capture evidence, avoid destructive repair first, and prefer restoring a clean page or database.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>DBCC CHECKALLOC sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Error / state</th><th>Meaning</th><th>First action</th></tr>
  <tr><td>824 / 825</td><td>Logical consistency / I/O error</td><td>Check hardware, run CHECKDB</td></tr>
  <tr><td>SUSPECT</td><td>Recovery failed at startup</td><td>Check log, avoid emergency mode first</td></tr>
  <tr><td>RECOVERY_PENDING</td><td>Recovery cannot start</td><td>Check log access and space</td></tr>
</table>
<p>Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain.</p>
<p>Use the following as a starting point when investigating DBCC CHECKALLOC. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- DBCC CHECKALLOC
-- Enable page checksums and verify on backup
ALTER DATABASE SalesDB SET PAGE_VERIFY CHECKSUM;
GO
BACKUP DATABASE SalesDB
TO DISK = 'D:\Backups\SalesDB_Checksum.bak'
WITH CHECKSUM, COMPRESSION;</code></pre>
<p>Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and business approval.</p>
      `,
    }
  ],

  scenario: {
    title: "Error 824 at 3 a.m.",
    html: `
The error log showed error 824 on page 1:123456 during an index scan. Rather than run a destructive repair, the DBA confirmed page checksums were on, restored just that page from a verified backup, applied the log chain and ran CHECKDB again — clean. The storage team replaced a failing disk that had caused the corruption.
<p><strong>The DBCC CHECKALLOC lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "When would you use a page-level restore?",
      a: `
When a small number of pages are damaged, you have FULL recovery model and a verified backup plus intact log chain; it restores only the bad pages, avoiding a full-database restore and its downtime.
      `,
    },
    {
      q: "What is the difference between logical and physical corruption?",
      a: `
Physical corruption is damaged page bytes or I/O errors detected by checksums; logical corruption is structurally consistent but wrong data or metadata, found by CHECKDB's logical checks.
      `,
    },
    {
      q: "Why is REPAIR_ALLOW_DATA_LOSS a last resort?",
      a: `
Because it can delete damaged rows or pages to make the database consistent — it prioritises structure over data, so it should only follow a verified backup, business approval and evidence of the root cause.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database integrity and corruption.”",
      "options": [
        "DBCC CHECKALLOC",
        "Check log, avoid emergency mode first",
        "Check log access and space"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine DBCC CHECKALLOC within database integrity and corruption. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DBCC CHECKALLOC fits”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "DBCC CHECKDB is the definitive integrity check."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “DBCC CHECKDB is the definitive integrity check. It verifies allocation, structure and logical consistency across the database and reports errors with repair levels and severity. It should be scheduled regularly and after every restore.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DBCC CHECKALLOC in practice”?",
      "options": [
        "With DBCC CHECKALLOC, prefer measured, reversible changes.",
        "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata.",
        "A corruption incident is a data-loss event until proven otherwise."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata. Running full CHECKDB frequently can be expensive, so large systems sometimes split checks across a rotating schedule.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DBCC CHECKALLOC”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and…",
        "A corruption incident is a data-loss event until proven otherwise."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to DBCC CHECKALLOC. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and business approval.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and…",
        "DBCC CHECKALLOC",
        "Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates DBCC CHECKALLOC with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What DBCC CHECKALLOC means”?",
      "options": [
        "Database integrity is about detecting damage before it becomes data loss.",
        "Minor, non-data issues",
        "Rebuild indexes"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Database integrity is about detecting damage before it becomes data loss. Corruption is either physical — damaged pages, torn writes, I/O errors — or logical — inconsistent indexes and metadata that the engine can still read but is wrong.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DBCC CHECKALLOC fits”?",
      "options": [
        "With DBCC CHECKALLOC, prefer measured, reversible changes.",
        "Minor, non-data issues",
        "The diagram below places DBCC CHECKALLOC alongside the core concepts of database integrity and corruption."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places DBCC CHECKALLOC alongside the core concepts of database integrity and corruption. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DBCC CHECKALLOC in practice”?",
      "options": [
        "DBCC CHECKALLOC sits inside a larger system.",
        "The following comparison captures the distinctions that matter most when working with DBCC CHECKALLOC:",
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with DBCC CHECKALLOC:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DBCC CHECKALLOC”?",
      "options": [
        "The first example establishes the relevant state.",
        "DBCC CHECKALLOC sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database integrity and corruption.”",
      "options": [
        "DBCC CHECKALLOC",
        "Check log, avoid emergency mode first",
        "Check log access and space"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine DBCC CHECKALLOC within database integrity and corruption. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DBCC CHECKALLOC fits”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "DBCC CHECKDB is the definitive integrity check."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “DBCC CHECKDB is the definitive integrity check. It verifies allocation, structure and logical consistency across the database and reports errors with repair levels and severity. It should be scheduled regularly and after every restore.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DBCC CHECKALLOC in practice”?",
      "options": [
        "With DBCC CHECKALLOC, prefer measured, reversible changes.",
        "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata.",
        "A corruption incident is a data-loss event until proven otherwise."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata. Running full CHECKDB frequently can be expensive, so large systems sometimes split checks across a rotating schedule.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DBCC CHECKALLOC”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and…",
        "A corruption incident is a data-loss event until proven otherwise."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to DBCC CHECKALLOC. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and business approval.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and…",
        "DBCC CHECKALLOC",
        "Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates DBCC CHECKALLOC with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What DBCC CHECKALLOC means”?",
      "options": [
        "Database integrity is about detecting damage before it becomes data loss.",
        "Minor, non-data issues",
        "Rebuild indexes"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Database integrity is about detecting damage before it becomes data loss. Corruption is either physical — damaged pages, torn writes, I/O errors — or logical — inconsistent indexes and metadata that the engine can still read but is wrong.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DBCC CHECKALLOC fits”?",
      "options": [
        "With DBCC CHECKALLOC, prefer measured, reversible changes.",
        "Minor, non-data issues",
        "The diagram below places DBCC CHECKALLOC alongside the core concepts of database integrity and corruption."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places DBCC CHECKALLOC alongside the core concepts of database integrity and corruption. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DBCC CHECKALLOC in practice”?",
      "options": [
        "DBCC CHECKALLOC sits inside a larger system.",
        "The following comparison captures the distinctions that matter most when working with DBCC CHECKALLOC:",
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with DBCC CHECKALLOC:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DBCC CHECKALLOC”?",
      "options": [
        "The first example establishes the relevant state.",
        "DBCC CHECKALLOC sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database integrity and corruption.”",
      "options": [
        "DBCC CHECKALLOC",
        "Check log, avoid emergency mode first",
        "Check log access and space"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine DBCC CHECKALLOC within database integrity and corruption. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DBCC CHECKALLOC fits”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "DBCC CHECKDB is the definitive integrity check."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “DBCC CHECKDB is the definitive integrity check. It verifies allocation, structure and logical consistency across the database and reports errors with repair levels and severity. It should be scheduled regularly and after every restore.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DBCC CHECKALLOC in practice”?",
      "options": [
        "With DBCC CHECKALLOC, prefer measured, reversible changes.",
        "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata.",
        "A corruption incident is a data-loss event until proven otherwise."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata. Running full CHECKDB frequently can be expensive, so large systems sometimes split checks across a rotating schedule.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DBCC CHECKALLOC”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and…",
        "A corruption incident is a data-loss event until proven otherwise."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to DBCC CHECKALLOC. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and business approval.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and…",
        "DBCC CHECKALLOC",
        "Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates DBCC CHECKALLOC with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What DBCC CHECKALLOC means”?",
      "options": [
        "Database integrity is about detecting damage before it becomes data loss.",
        "Minor, non-data issues",
        "Rebuild indexes"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Database integrity is about detecting damage before it becomes data loss. Corruption is either physical — damaged pages, torn writes, I/O errors — or logical — inconsistent indexes and metadata that the engine can still read but is wrong.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DBCC CHECKALLOC fits”?",
      "options": [
        "With DBCC CHECKALLOC, prefer measured, reversible changes.",
        "Minor, non-data issues",
        "The diagram below places DBCC CHECKALLOC alongside the core concepts of database integrity and corruption."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places DBCC CHECKALLOC alongside the core concepts of database integrity and corruption. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DBCC CHECKALLOC in practice”?",
      "options": [
        "DBCC CHECKALLOC sits inside a larger system.",
        "The following comparison captures the distinctions that matter most when working with DBCC CHECKALLOC:",
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with DBCC CHECKALLOC:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DBCC CHECKALLOC”?",
      "options": [
        "The first example establishes the relevant state.",
        "DBCC CHECKALLOC sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "DBCC CHECKALLOC is a fundamental concept in database integrity and corruption",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of DBCC CHECKALLOC improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
