/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch14-05.html */

window.TOPIC = {
  id: "ch14-05",
  title: "Torn Pages",

  lead: "Understanding Torn Pages is essential for anyone responsible for database integrity and corruption. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what Torn Pages is and where it fits",
    "Explain how Torn Pages works internally",
    "Apply Torn Pages correctly in a production environment",
    "Recognise the common mistakes and risks involving Torn Pages",
    "Monitor and troubleshoot Torn Pages with the right tools"
  ],

  sections: [
    {
      h: "What Torn Pages means",
      html: `
<p>In this topic we examine <strong>Torn Pages</strong> within database integrity and corruption. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page. The response is careful: capture evidence, avoid destructive repair first, and prefer restoring a clean page or database.</p>
<p>Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Torn Pages is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Torn Pages fits",
      html: `
<p>Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and business approval.</p>
<p>The diagram below places Torn Pages alongside the core concepts of database integrity and corruption. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Torn Pages flow">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="230" y="12" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="39" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. CHECKDB</text>
    <rect x="230" y="66" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="93" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Checksum</text>
    <rect x="230" y="120" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="147" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Page</text>
    <rect x="230" y="174" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="201" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Corruption</text>
    <rect x="230" y="228" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="255" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. SUSPECT</text>
    <rect x="230" y="282" width="300" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="309" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">6. Restore</text>
    <line x1="380" y1="56" x2="380" y2="66" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="110" x2="380" y2="120" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="164" x2="380" y2="174" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="218" x2="380" y2="228" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="272" x2="380" y2="282" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Torn Pages</text>
  </svg>
  <div class="figcaption">Figure 1 — Database integrity and corruption: how Torn Pages relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Torn Pages in practice",
      html: `
<p>A corruption incident is a data-loss event until proven otherwise. Preserve the original files, determine the root cause — often storage — and replace the failing hardware before returning the database to service.</p>
<p>The following comparison captures the distinctions that matter most when working with Torn Pages:</p>
<table>
  <tr><th>Error / state</th><th>Meaning</th><th>First action</th></tr>
  <tr><td>824 / 825</td><td>Logical consistency / I/O error</td><td>Check hardware, run CHECKDB</td></tr>
  <tr><td>SUSPECT</td><td>Recovery failed at startup</td><td>Check log, avoid emergency mode first</td></tr>
  <tr><td>RECOVERY_PENDING</td><td>Recovery cannot start</td><td>Check log access and space</td></tr>
</table>
<p>Database integrity is about detecting damage before it becomes data loss. Corruption is either physical — damaged pages, torn writes, I/O errors — or logical — inconsistent indexes and metadata that the engine can still read but is wrong.</p>
      `,
    },
    {
      h: "Working with Torn Pages",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Torn Pages. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Torn Pages
DBCC CHECKDB ('SalesDB') WITH NO_INFOMSGS, ALL_ERRORMSGS;
GO
-- Results include the lowest repair level recommended</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Torn Pages
-- Enable page checksums and verify on backup
ALTER DATABASE SalesDB SET PAGE_VERIFY CHECKSUM;
GO
BACKUP DATABASE SalesDB
TO DISK = 'D:\Backups\SalesDB_Checksum.bak'
WITH CHECKSUM, COMPRESSION;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Torn Pages
-- Restore a single corrupted page from a clean backup
RESTORE DATABASE SalesDB
PAGE = '1:123456'
FROM DISK = 'D:\Backups\SalesDB_Full.bak'
WITH NORECOVERY;
-- then apply the log chain and recover</code></pre>
<p>Page checksums are the primary detection mechanism. With CHECKSUM enabled, SQL Server writes a checksum into each page and verifies it on read, catching silent disk corruption that would otherwise go unnoticed until a query fails.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>DBCC CHECKDB is the definitive integrity check. It verifies allocation, structure and logical consistency across the database and reports errors with repair levels and severity. It should be scheduled regularly and after every restore.</p>
<table>
  <tr><th>Repair option</th><th>Risk</th><th>When</th></tr>
  <tr><td>REPAIR_FAST</td><td>Low</td><td>Minor, non-data issues</td></tr>
  <tr><td>REPAIR_REBUILD</td><td>Medium</td><td>Rebuild indexes</td></tr>
  <tr><td>REPAIR_ALLOW_DATA_LOSS</td><td>High</td><td>Absolute last resort</td></tr>
</table>
<p>DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata. Running full CHECKDB frequently can be expensive, so large systems sometimes split checks across a rotating schedule.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Torn Pages, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Torn Pages",
      html: `
<p>This section consolidates <strong>Torn Pages</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>A corruption incident is a data-loss event until proven otherwise. Preserve the original files, determine the root cause — often storage — and replace the failing hardware before returning the database to service.</p>
<p>Database integrity is about detecting damage before it becomes data loss. Corruption is either physical — damaged pages, torn writes, I/O errors — or logical — inconsistent indexes and metadata that the engine can still read but is wrong.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Torn Pages sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Error / state</th><th>Meaning</th><th>First action</th></tr>
  <tr><td>824 / 825</td><td>Logical consistency / I/O error</td><td>Check hardware, run CHECKDB</td></tr>
  <tr><td>SUSPECT</td><td>Recovery failed at startup</td><td>Check log, avoid emergency mode first</td></tr>
  <tr><td>RECOVERY_PENDING</td><td>Recovery cannot start</td><td>Check log access and space</td></tr>
</table>
<p>Page checksums are the primary detection mechanism. With CHECKSUM enabled, SQL Server writes a checksum into each page and verifies it on read, catching silent disk corruption that would otherwise go unnoticed until a query fails.</p>
<p>Use the following as a starting point when investigating Torn Pages. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Torn Pages
DBCC CHECKDB ('SalesDB') WITH NO_INFOMSGS, ALL_ERRORMSGS;
GO
-- Results include the lowest repair level recommended</code></pre>
<p>DBCC CHECKDB is the definitive integrity check. It verifies allocation, structure and logical consistency across the database and reports errors with repair levels and severity. It should be scheduled regularly and after every restore.</p>
      `,
    }
  ],

  scenario: {
    title: "Error 824 at 3 a.m.",
    html: `
The error log showed error 824 on page 1:123456 during an index scan. Rather than run a destructive repair, the DBA confirmed page checksums were on, restored just that page from a verified backup, applied the log chain and ran CHECKDB again — clean. The storage team replaced a failing disk that had caused the corruption.
<p><strong>The Torn Pages lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "Why is REPAIR_ALLOW_DATA_LOSS a last resort?",
      a: `
Because it can delete damaged rows or pages to make the database consistent — it prioritises structure over data, so it should only follow a verified backup, business approval and evidence of the root cause.
      `,
    },
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
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database integrity and corruption.”",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Torn Pages:",
        "Torn Pages",
        "A corruption incident is a data-loss event until proven otherwise."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Torn Pages within database integrity and corruption. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Torn Pages fits”?",
      "options": [
        "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and…",
        "Database integrity is about detecting damage before it becomes data loss.",
        "Check hardware, run CHECKDB"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and business approval.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Torn Pages in practice”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "A corruption incident is a data-loss event until proven otherwise."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A corruption incident is a data-loss event until proven otherwise. Preserve the original files, determine the root cause — often storage — and replace the failing hardware before returning the database to service.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Torn Pages”?",
      "options": [
        "Check hardware, run CHECKDB",
        "Theory becomes useful when you can apply it.",
        "Database integrity is about detecting damage before it becomes data loss."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Torn Pages. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "DBCC CHECKDB is the definitive integrity check.",
        "Check hardware, run CHECKDB",
        "Check log, avoid emergency mode first"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “DBCC CHECKDB is the definitive integrity check. It verifies allocation, structure and logical consistency across the database and reports errors with repair levels and severity. It should be scheduled regularly and after every restore.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Check log access and space",
        "Theory becomes useful when you can apply it.",
        "Torn Pages"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Torn Pages with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Torn Pages means”?",
      "options": [
        "DBCC CHECKDB is the definitive integrity check.",
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page.",
        "Page checksums are the primary detection mechanism."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page. The response is careful: capture evidence, avoid destructive repair first, and prefer restoring a clean page or database.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Torn Pages fits”?",
      "options": [
        "The diagram below places Torn Pages alongside the core concepts of database integrity and corruption.",
        "Next, verify the result and capture a baseline.",
        "Page checksums are the primary detection mechanism."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Torn Pages alongside the core concepts of database integrity and corruption. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Torn Pages in practice”?",
      "options": [
        "Minor, non-data issues",
        "Rebuild indexes",
        "The following comparison captures the distinctions that matter most when working with Torn Pages:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Torn Pages:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Torn Pages”?",
      "options": [
        "Minor, non-data issues",
        "The first example establishes the relevant state.",
        "With Torn Pages, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database integrity and corruption.”",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Torn Pages:",
        "Torn Pages",
        "A corruption incident is a data-loss event until proven otherwise."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Torn Pages within database integrity and corruption. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Torn Pages fits”?",
      "options": [
        "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and…",
        "Database integrity is about detecting damage before it becomes data loss.",
        "Check hardware, run CHECKDB"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and business approval.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Torn Pages in practice”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "A corruption incident is a data-loss event until proven otherwise."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A corruption incident is a data-loss event until proven otherwise. Preserve the original files, determine the root cause — often storage — and replace the failing hardware before returning the database to service.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Torn Pages”?",
      "options": [
        "Check hardware, run CHECKDB",
        "Theory becomes useful when you can apply it.",
        "Database integrity is about detecting damage before it becomes data loss."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Torn Pages. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "DBCC CHECKDB is the definitive integrity check.",
        "Check hardware, run CHECKDB",
        "Check log, avoid emergency mode first"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “DBCC CHECKDB is the definitive integrity check. It verifies allocation, structure and logical consistency across the database and reports errors with repair levels and severity. It should be scheduled regularly and after every restore.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Check log access and space",
        "Theory becomes useful when you can apply it.",
        "Torn Pages"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Torn Pages with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Torn Pages means”?",
      "options": [
        "DBCC CHECKDB is the definitive integrity check.",
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page.",
        "Page checksums are the primary detection mechanism."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page. The response is careful: capture evidence, avoid destructive repair first, and prefer restoring a clean page or database.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Torn Pages fits”?",
      "options": [
        "The diagram below places Torn Pages alongside the core concepts of database integrity and corruption.",
        "Next, verify the result and capture a baseline.",
        "Page checksums are the primary detection mechanism."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Torn Pages alongside the core concepts of database integrity and corruption. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Torn Pages in practice”?",
      "options": [
        "Minor, non-data issues",
        "Rebuild indexes",
        "The following comparison captures the distinctions that matter most when working with Torn Pages:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Torn Pages:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Torn Pages”?",
      "options": [
        "Minor, non-data issues",
        "The first example establishes the relevant state.",
        "With Torn Pages, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database integrity and corruption.”",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Torn Pages:",
        "Torn Pages",
        "A corruption incident is a data-loss event until proven otherwise."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Torn Pages within database integrity and corruption. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Torn Pages fits”?",
      "options": [
        "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and…",
        "Database integrity is about detecting damage before it becomes data loss.",
        "Check hardware, run CHECKDB"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and business approval.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Torn Pages in practice”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "A corruption incident is a data-loss event until proven otherwise."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A corruption incident is a data-loss event until proven otherwise. Preserve the original files, determine the root cause — often storage — and replace the failing hardware before returning the database to service.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Torn Pages”?",
      "options": [
        "Check hardware, run CHECKDB",
        "Theory becomes useful when you can apply it.",
        "Database integrity is about detecting damage before it becomes data loss."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Torn Pages. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "DBCC CHECKDB is the definitive integrity check.",
        "Check hardware, run CHECKDB",
        "Check log, avoid emergency mode first"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “DBCC CHECKDB is the definitive integrity check. It verifies allocation, structure and logical consistency across the database and reports errors with repair levels and severity. It should be scheduled regularly and after every restore.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Check log access and space",
        "Theory becomes useful when you can apply it.",
        "Torn Pages"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Torn Pages with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Torn Pages means”?",
      "options": [
        "DBCC CHECKDB is the definitive integrity check.",
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page.",
        "Page checksums are the primary detection mechanism."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page. The response is careful: capture evidence, avoid destructive repair first, and prefer restoring a clean page or database.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Torn Pages fits”?",
      "options": [
        "The diagram below places Torn Pages alongside the core concepts of database integrity and corruption.",
        "Next, verify the result and capture a baseline.",
        "Page checksums are the primary detection mechanism."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Torn Pages alongside the core concepts of database integrity and corruption. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Torn Pages in practice”?",
      "options": [
        "Minor, non-data issues",
        "Rebuild indexes",
        "The following comparison captures the distinctions that matter most when working with Torn Pages:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Torn Pages:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Torn Pages”?",
      "options": [
        "Minor, non-data issues",
        "The first example establishes the relevant state.",
        "With Torn Pages, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Torn Pages is a fundamental concept in database integrity and corruption",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Torn Pages improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
