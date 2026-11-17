/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch14-13.html */

window.TOPIC = {
  id: "ch14-13",
  title: "Recovery Pending State",

  lead: "Recovery Pending State is a core part of database integrity and corruption. This topic explains what it is, how it works inside SQL Server, and what a production DBA must know to operate it safely.",

  objectives: [
    "Define what Recovery Pending State is and where it fits",
    "Explain how Recovery Pending State works internally",
    "Apply Recovery Pending State correctly in a production environment",
    "Recognise the common mistakes and risks involving Recovery Pending State",
    "Monitor and troubleshoot Recovery Pending State with the right tools"
  ],

  sections: [
    {
      h: "What Recovery Pending State means",
      html: `
<p>In this topic we examine <strong>Recovery Pending State</strong> within database integrity and corruption. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page. The response is careful: capture evidence, avoid destructive repair first, and prefer restoring a clean page or database.</p>
<p>Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Recovery Pending State is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Recovery Pending State fits",
      html: `
<p>Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and business approval.</p>
<p>The diagram below places Recovery Pending State alongside the core concepts of database integrity and corruption. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Recovery Pending State concept map">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="280" y="140" width="200" height="60" rx="9" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="175" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Recovery Pending State</text>
    <rect x="24" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">CHECKDB</text>
    <text x="124" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 1</text>
    <rect x="536" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Checksum</text>
    <text x="636" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 2</text>
    <rect x="24" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Page</text>
    <text x="124" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 3</text>
    <rect x="536" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Corruption</text>
    <text x="636" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 4</text>
    <rect x="24" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">SUSPECT</text>
    <text x="124" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 5</text>
    <rect x="536" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Restore</text>
    <text x="636" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 6</text>
    <line x1="380" y1="170" x2="124" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
  </svg>
  <div class="figcaption">Figure 1 — Database integrity and corruption: how Recovery Pending State relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Recovery Pending State in practice",
      html: `
<p>A corruption incident is a data-loss event until proven otherwise. Preserve the original files, determine the root cause — often storage — and replace the failing hardware before returning the database to service.</p>
<p>The following comparison captures the distinctions that matter most when working with Recovery Pending State:</p>
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
      h: "Working with Recovery Pending State",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Recovery Pending State. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Recovery Pending State
DBCC CHECKDB ('SalesDB') WITH NO_INFOMSGS, ALL_ERRORMSGS;
GO
-- Results include the lowest repair level recommended</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Recovery Pending State
-- Enable page checksums and verify on backup
ALTER DATABASE SalesDB SET PAGE_VERIFY CHECKSUM;
GO
BACKUP DATABASE SalesDB
TO DISK = 'D:\Backups\SalesDB_Checksum.bak'
WITH CHECKSUM, COMPRESSION;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Recovery Pending State
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
  <p>With Recovery Pending State, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    }
  ],

  scenario: {
    title: "Error 824 at 3 a.m.",
    html: `
The error log showed error 824 on page 1:123456 during an index scan. Rather than run a destructive repair, the DBA confirmed page checksums were on, restored just that page from a verified backup, applied the log chain and ran CHECKDB again — clean. The storage team replaced a failing disk that had caused the corruption.
<p><strong>The Recovery Pending State lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
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
    },
    {
      q: "When would you use a page-level restore?",
      a: `
When a small number of pages are damaged, you have FULL recovery model and a verified backup plus intact log chain; it restores only the bad pages, avoiding a full-database restore and its downtime.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database integrity and corruption.”",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Page checksums are the primary detection mechanism.",
        "Recovery Pending State"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Recovery Pending State within database integrity and corruption. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Recovery Pending State fits”?",
      "options": [
        "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata.",
        "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and…",
        "DBCC CHECKDB is the definitive integrity check."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and business approval.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Recovery Pending State in practice”?",
      "options": [
        "A corruption incident is a data-loss event until proven otherwise.",
        "Absolute last resort",
        "The following comparison captures the distinctions that matter most when working with Recovery Pending State:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A corruption incident is a data-loss event until proven otherwise. Preserve the original files, determine the root cause — often storage — and replace the failing hardware before returning the database to service.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Recovery Pending State”?",
      "options": [
        "Rebuild indexes",
        "Absolute last resort",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Recovery Pending State. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Minor, non-data issues",
        "DBCC CHECKDB is the definitive integrity check.",
        "With Recovery Pending State, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “DBCC CHECKDB is the definitive integrity check. It verifies allocation, structure and logical consistency across the database and reports errors with repair levels and severity. It should be scheduled regularly and after every restore.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Recovery Pending State means”?",
      "options": [
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page.",
        "Recovery Pending State",
        "Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page. The response is careful: capture evidence, avoid destructive repair first, and prefer restoring a clean page or database.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Recovery Pending State fits”?",
      "options": [
        "Absolute last resort",
        "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and…",
        "The diagram below places Recovery Pending State alongside the core concepts of database integrity and corruption."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Recovery Pending State alongside the core concepts of database integrity and corruption. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Recovery Pending State in practice”?",
      "options": [
        "Recovery Pending State",
        "The following comparison captures the distinctions that matter most when working with Recovery Pending State:",
        "Check log access and space"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Recovery Pending State:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Recovery Pending State”?",
      "options": [
        "The first example establishes the relevant state.",
        "Recovery Pending State",
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page.",
        "Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain.",
        "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata. Running full CHECKDB frequently can be expensive, so large systems sometimes split checks across a rotating schedule.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database integrity and corruption.”",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Page checksums are the primary detection mechanism.",
        "Recovery Pending State"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Recovery Pending State within database integrity and corruption. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Recovery Pending State fits”?",
      "options": [
        "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata.",
        "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and…",
        "DBCC CHECKDB is the definitive integrity check."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and business approval.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Recovery Pending State in practice”?",
      "options": [
        "A corruption incident is a data-loss event until proven otherwise.",
        "Absolute last resort",
        "The following comparison captures the distinctions that matter most when working with Recovery Pending State:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A corruption incident is a data-loss event until proven otherwise. Preserve the original files, determine the root cause — often storage — and replace the failing hardware before returning the database to service.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Recovery Pending State”?",
      "options": [
        "Rebuild indexes",
        "Absolute last resort",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Recovery Pending State. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Minor, non-data issues",
        "DBCC CHECKDB is the definitive integrity check.",
        "With Recovery Pending State, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “DBCC CHECKDB is the definitive integrity check. It verifies allocation, structure and logical consistency across the database and reports errors with repair levels and severity. It should be scheduled regularly and after every restore.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Recovery Pending State means”?",
      "options": [
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page.",
        "Recovery Pending State",
        "Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page. The response is careful: capture evidence, avoid destructive repair first, and prefer restoring a clean page or database.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Recovery Pending State fits”?",
      "options": [
        "Absolute last resort",
        "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and…",
        "The diagram below places Recovery Pending State alongside the core concepts of database integrity and corruption."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Recovery Pending State alongside the core concepts of database integrity and corruption. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Recovery Pending State in practice”?",
      "options": [
        "Recovery Pending State",
        "The following comparison captures the distinctions that matter most when working with Recovery Pending State:",
        "Check log access and space"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Recovery Pending State:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Recovery Pending State”?",
      "options": [
        "The first example establishes the relevant state.",
        "Recovery Pending State",
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page.",
        "Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain.",
        "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata. Running full CHECKDB frequently can be expensive, so large systems sometimes split checks across a rotating schedule.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database integrity and corruption.”",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Page checksums are the primary detection mechanism.",
        "Recovery Pending State"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Recovery Pending State within database integrity and corruption. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Recovery Pending State fits”?",
      "options": [
        "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata.",
        "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and…",
        "DBCC CHECKDB is the definitive integrity check."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and business approval.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Recovery Pending State in practice”?",
      "options": [
        "A corruption incident is a data-loss event until proven otherwise.",
        "Absolute last resort",
        "The following comparison captures the distinctions that matter most when working with Recovery Pending State:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A corruption incident is a data-loss event until proven otherwise. Preserve the original files, determine the root cause — often storage — and replace the failing hardware before returning the database to service.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Recovery Pending State”?",
      "options": [
        "Rebuild indexes",
        "Absolute last resort",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Recovery Pending State. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Minor, non-data issues",
        "DBCC CHECKDB is the definitive integrity check.",
        "With Recovery Pending State, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “DBCC CHECKDB is the definitive integrity check. It verifies allocation, structure and logical consistency across the database and reports errors with repair levels and severity. It should be scheduled regularly and after every restore.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Recovery Pending State means”?",
      "options": [
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page.",
        "Recovery Pending State",
        "Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page. The response is careful: capture evidence, avoid destructive repair first, and prefer restoring a clean page or database.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Recovery Pending State fits”?",
      "options": [
        "Absolute last resort",
        "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and…",
        "The diagram below places Recovery Pending State alongside the core concepts of database integrity and corruption."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Recovery Pending State alongside the core concepts of database integrity and corruption. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Recovery Pending State in practice”?",
      "options": [
        "Recovery Pending State",
        "The following comparison captures the distinctions that matter most when working with Recovery Pending State:",
        "Check log access and space"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Recovery Pending State:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Recovery Pending State”?",
      "options": [
        "The first example establishes the relevant state.",
        "Recovery Pending State",
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page.",
        "Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain.",
        "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata. Running full CHECKDB frequently can be expensive, so large systems sometimes split checks across a rotating schedule.”"
    }
  ],
  takeaways: [
    "Recovery Pending State is a fundamental concept in database integrity and corruption",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Recovery Pending State improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
