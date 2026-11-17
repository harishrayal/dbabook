/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch14-12.html */

window.TOPIC = {
  id: "ch14-12",
  title: "Suspect Database State",

  lead: "This topic covers Suspect Database State — a concept you will meet repeatedly when working with database integrity and corruption. We build from first principles to production guidance.",

  objectives: [
    "Define what Suspect Database State is and where it fits",
    "Explain how Suspect Database State works internally",
    "Apply Suspect Database State correctly in a production environment",
    "Recognise the common mistakes and risks involving Suspect Database State",
    "Monitor and troubleshoot Suspect Database State with the right tools"
  ],

  sections: [
    {
      h: "What Suspect Database State means",
      html: `
<p>In this topic we examine <strong>Suspect Database State</strong> within database integrity and corruption. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata. Running full CHECKDB frequently can be expensive, so large systems sometimes split checks across a rotating schedule.</p>
<p>Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page. The response is careful: capture evidence, avoid destructive repair first, and prefer restoring a clean page or database.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Suspect Database State is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Suspect Database State fits",
      html: `
<p>Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain.</p>
<p>The diagram below places Suspect Database State alongside the core concepts of database integrity and corruption. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Suspect Database State layers">
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
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Suspect Database State</text>
  </svg>
  <div class="figcaption">Figure 1 — Database integrity and corruption: how Suspect Database State relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Suspect Database State in practice",
      html: `
<p>Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and business approval.</p>
<p>The following comparison captures the distinctions that matter most when working with Suspect Database State:</p>
<table>
  <tr><th>Error / state</th><th>Meaning</th><th>First action</th></tr>
  <tr><td>824 / 825</td><td>Logical consistency / I/O error</td><td>Check hardware, run CHECKDB</td></tr>
  <tr><td>SUSPECT</td><td>Recovery failed at startup</td><td>Check log, avoid emergency mode first</td></tr>
  <tr><td>RECOVERY_PENDING</td><td>Recovery cannot start</td><td>Check log access and space</td></tr>
</table>
<p>A corruption incident is a data-loss event until proven otherwise. Preserve the original files, determine the root cause — often storage — and replace the failing hardware before returning the database to service.</p>
      `,
    },
    {
      h: "Working with Suspect Database State",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Suspect Database State. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Suspect Database State
DBCC CHECKDB ('SalesDB') WITH NO_INFOMSGS, ALL_ERRORMSGS;
GO
-- Results include the lowest repair level recommended</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Suspect Database State
-- Enable page checksums and verify on backup
ALTER DATABASE SalesDB SET PAGE_VERIFY CHECKSUM;
GO
BACKUP DATABASE SalesDB
TO DISK = 'D:\Backups\SalesDB_Checksum.bak'
WITH CHECKSUM, COMPRESSION;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Suspect Database State
-- Restore a single corrupted page from a clean backup
RESTORE DATABASE SalesDB
PAGE = '1:123456'
FROM DISK = 'D:\Backups\SalesDB_Full.bak'
WITH NORECOVERY;
-- then apply the log chain and recover</code></pre>
<p>Database integrity is about detecting damage before it becomes data loss. Corruption is either physical — damaged pages, torn writes, I/O errors — or logical — inconsistent indexes and metadata that the engine can still read but is wrong.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Page checksums are the primary detection mechanism. With CHECKSUM enabled, SQL Server writes a checksum into each page and verifies it on read, catching silent disk corruption that would otherwise go unnoticed until a query fails.</p>
<table>
  <tr><th>Repair option</th><th>Risk</th><th>When</th></tr>
  <tr><td>REPAIR_FAST</td><td>Low</td><td>Minor, non-data issues</td></tr>
  <tr><td>REPAIR_REBUILD</td><td>Medium</td><td>Rebuild indexes</td></tr>
  <tr><td>REPAIR_ALLOW_DATA_LOSS</td><td>High</td><td>Absolute last resort</td></tr>
</table>
<p>DBCC CHECKDB is the definitive integrity check. It verifies allocation, structure and logical consistency across the database and reports errors with repair levels and severity. It should be scheduled regularly and after every restore.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Suspect Database State, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Suspect Database State",
      html: `
<p>This section consolidates <strong>Suspect Database State</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and business approval.</p>
<p>A corruption incident is a data-loss event until proven otherwise. Preserve the original files, determine the root cause — often storage — and replace the failing hardware before returning the database to service.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Suspect Database State sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Repair option</th><th>Risk</th><th>When</th></tr>
  <tr><td>REPAIR_FAST</td><td>Low</td><td>Minor, non-data issues</td></tr>
  <tr><td>REPAIR_REBUILD</td><td>Medium</td><td>Rebuild indexes</td></tr>
  <tr><td>REPAIR_ALLOW_DATA_LOSS</td><td>High</td><td>Absolute last resort</td></tr>
</table>
<p>Database integrity is about detecting damage before it becomes data loss. Corruption is either physical — damaged pages, torn writes, I/O errors — or logical — inconsistent indexes and metadata that the engine can still read but is wrong.</p>
<p>Use the following as a starting point when investigating Suspect Database State. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Suspect Database State
-- Enable page checksums and verify on backup
ALTER DATABASE SalesDB SET PAGE_VERIFY CHECKSUM;
GO
BACKUP DATABASE SalesDB
TO DISK = 'D:\Backups\SalesDB_Checksum.bak'
WITH CHECKSUM, COMPRESSION;</code></pre>
<p>Page checksums are the primary detection mechanism. With CHECKSUM enabled, SQL Server writes a checksum into each page and verifies it on read, catching silent disk corruption that would otherwise go unnoticed until a query fails.</p>
      `,
    }
  ],

  scenario: {
    title: "The SUSPECT database after a restart",
    html: `
After an unclean shutdown a production database came up SUSPECT. The DBA resisted the tempting EMERGENCY REPAIR rebuild, captured the error log, confirmed a good backup and restored to a clean state with minimal loss. Rebuilding system tables would have risked far more data.
<p><strong>The Suspect Database State lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
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
        "Suspect Database State",
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Suspect Database State within database integrity and corruption. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Suspect Database State fits”?",
      "options": [
        "Database integrity is about detecting damage before it becomes data loss.",
        "Page checksums are the primary detection mechanism.",
        "Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Suspect Database State in practice”?",
      "options": [
        "Absolute last resort",
        "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and…",
        "Rebuild indexes"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and business approval.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Suspect Database State”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Minor, non-data issues",
        "Rebuild indexes"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Suspect Database State. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Suspect Database State sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Page checksums are the primary detection mechanism."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Page checksums are the primary detection mechanism. With CHECKSUM enabled, SQL Server writes a checksum into each page and verifies it on read, catching silent disk corruption that would otherwise go unnoticed until a query fails.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Minor, non-data issues",
        "Suspect Database State",
        "With Suspect Database State, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Suspect Database State with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Suspect Database State means”?",
      "options": [
        "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata.",
        "Suspect Database State",
        "Suspect Database State sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata. Running full CHECKDB frequently can be expensive, so large systems sometimes split checks across a rotating schedule.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Suspect Database State fits”?",
      "options": [
        "Absolute last resort",
        "Suspect Database State sits inside a larger system.",
        "The diagram below places Suspect Database State alongside the core concepts of database integrity and corruption."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Suspect Database State alongside the core concepts of database integrity and corruption. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Suspect Database State in practice”?",
      "options": [
        "Check hardware, run CHECKDB",
        "The following comparison captures the distinctions that matter most when working with Suspect Database State:",
        "Use the following as a starting point when investigating Suspect Database State."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Suspect Database State:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Suspect Database State”?",
      "options": [
        "The first example establishes the relevant state.",
        "Use the following as a starting point when investigating Suspect Database State.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database integrity and corruption.”",
      "options": [
        "Suspect Database State",
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Suspect Database State within database integrity and corruption. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Suspect Database State fits”?",
      "options": [
        "Database integrity is about detecting damage before it becomes data loss.",
        "Page checksums are the primary detection mechanism.",
        "Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Suspect Database State in practice”?",
      "options": [
        "Absolute last resort",
        "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and…",
        "Rebuild indexes"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and business approval.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Suspect Database State”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Minor, non-data issues",
        "Rebuild indexes"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Suspect Database State. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Suspect Database State sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Page checksums are the primary detection mechanism."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Page checksums are the primary detection mechanism. With CHECKSUM enabled, SQL Server writes a checksum into each page and verifies it on read, catching silent disk corruption that would otherwise go unnoticed until a query fails.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Minor, non-data issues",
        "Suspect Database State",
        "With Suspect Database State, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Suspect Database State with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Suspect Database State means”?",
      "options": [
        "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata.",
        "Suspect Database State",
        "Suspect Database State sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata. Running full CHECKDB frequently can be expensive, so large systems sometimes split checks across a rotating schedule.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Suspect Database State fits”?",
      "options": [
        "Absolute last resort",
        "Suspect Database State sits inside a larger system.",
        "The diagram below places Suspect Database State alongside the core concepts of database integrity and corruption."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Suspect Database State alongside the core concepts of database integrity and corruption. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Suspect Database State in practice”?",
      "options": [
        "Check hardware, run CHECKDB",
        "The following comparison captures the distinctions that matter most when working with Suspect Database State:",
        "Use the following as a starting point when investigating Suspect Database State."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Suspect Database State:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Suspect Database State”?",
      "options": [
        "The first example establishes the relevant state.",
        "Use the following as a starting point when investigating Suspect Database State.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database integrity and corruption.”",
      "options": [
        "Suspect Database State",
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Suspect Database State within database integrity and corruption. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Suspect Database State fits”?",
      "options": [
        "Database integrity is about detecting damage before it becomes data loss.",
        "Page checksums are the primary detection mechanism.",
        "Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Suspect Database State in practice”?",
      "options": [
        "Absolute last resort",
        "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and…",
        "Rebuild indexes"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and business approval.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Suspect Database State”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Minor, non-data issues",
        "Rebuild indexes"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Suspect Database State. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Suspect Database State sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Page checksums are the primary detection mechanism."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Page checksums are the primary detection mechanism. With CHECKSUM enabled, SQL Server writes a checksum into each page and verifies it on read, catching silent disk corruption that would otherwise go unnoticed until a query fails.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Minor, non-data issues",
        "Suspect Database State",
        "With Suspect Database State, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Suspect Database State with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Suspect Database State means”?",
      "options": [
        "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata.",
        "Suspect Database State",
        "Suspect Database State sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata. Running full CHECKDB frequently can be expensive, so large systems sometimes split checks across a rotating schedule.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Suspect Database State fits”?",
      "options": [
        "Absolute last resort",
        "Suspect Database State sits inside a larger system.",
        "The diagram below places Suspect Database State alongside the core concepts of database integrity and corruption."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Suspect Database State alongside the core concepts of database integrity and corruption. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Suspect Database State in practice”?",
      "options": [
        "Check hardware, run CHECKDB",
        "The following comparison captures the distinctions that matter most when working with Suspect Database State:",
        "Use the following as a starting point when investigating Suspect Database State."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Suspect Database State:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Suspect Database State”?",
      "options": [
        "The first example establishes the relevant state.",
        "Use the following as a starting point when investigating Suspect Database State.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Suspect Database State is a fundamental concept in database integrity and corruption",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Suspect Database State improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
