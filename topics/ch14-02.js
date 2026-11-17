/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch14-02.html */

window.TOPIC = {
  id: "ch14-02",
  title: "Logical Corruption",

  lead: "Understanding Logical Corruption is essential for anyone responsible for database integrity and corruption. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what Logical Corruption is and where it fits",
    "Explain how Logical Corruption works internally",
    "Apply Logical Corruption correctly in a production environment",
    "Recognise the common mistakes and risks involving Logical Corruption",
    "Monitor and troubleshoot Logical Corruption with the right tools"
  ],

  sections: [
    {
      h: "What Logical Corruption means",
      html: `
<p>In this topic we examine <strong>Logical Corruption</strong> within database integrity and corruption. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Page checksums are the primary detection mechanism. With CHECKSUM enabled, SQL Server writes a checksum into each page and verifies it on read, catching silent disk corruption that would otherwise go unnoticed until a query fails.</p>
<p>DBCC CHECKDB is the definitive integrity check. It verifies allocation, structure and logical consistency across the database and reports errors with repair levels and severity. It should be scheduled regularly and after every restore.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Logical Corruption is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Logical Corruption fits",
      html: `
<p>DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata. Running full CHECKDB frequently can be expensive, so large systems sometimes split checks across a rotating schedule.</p>
<p>The diagram below places Logical Corruption alongside the core concepts of database integrity and corruption. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Logical Corruption flow">
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
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Logical Corruption</text>
  </svg>
  <div class="figcaption">Figure 1 — Database integrity and corruption: how Logical Corruption relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Logical Corruption in practice",
      html: `
<p>Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page. The response is careful: capture evidence, avoid destructive repair first, and prefer restoring a clean page or database.</p>
<p>The following comparison captures the distinctions that matter most when working with Logical Corruption:</p>
<table>
  <tr><th>Error / state</th><th>Meaning</th><th>First action</th></tr>
  <tr><td>824 / 825</td><td>Logical consistency / I/O error</td><td>Check hardware, run CHECKDB</td></tr>
  <tr><td>SUSPECT</td><td>Recovery failed at startup</td><td>Check log, avoid emergency mode first</td></tr>
  <tr><td>RECOVERY_PENDING</td><td>Recovery cannot start</td><td>Check log access and space</td></tr>
</table>
<p>Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain.</p>
      `,
    },
    {
      h: "Working with Logical Corruption",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Logical Corruption. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Logical Corruption
DBCC CHECKDB ('SalesDB') WITH NO_INFOMSGS, ALL_ERRORMSGS;
GO
-- Results include the lowest repair level recommended</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Logical Corruption
-- Enable page checksums and verify on backup
ALTER DATABASE SalesDB SET PAGE_VERIFY CHECKSUM;
GO
BACKUP DATABASE SalesDB
TO DISK = 'D:\Backups\SalesDB_Checksum.bak'
WITH CHECKSUM, COMPRESSION;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Logical Corruption
-- Restore a single corrupted page from a clean backup
RESTORE DATABASE SalesDB
PAGE = '1:123456'
FROM DISK = 'D:\Backups\SalesDB_Full.bak'
WITH NORECOVERY;
-- then apply the log chain and recover</code></pre>
<p>Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and business approval.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>A corruption incident is a data-loss event until proven otherwise. Preserve the original files, determine the root cause — often storage — and replace the failing hardware before returning the database to service.</p>
<table>
  <tr><th>Repair option</th><th>Risk</th><th>When</th></tr>
  <tr><td>REPAIR_FAST</td><td>Low</td><td>Minor, non-data issues</td></tr>
  <tr><td>REPAIR_REBUILD</td><td>Medium</td><td>Rebuild indexes</td></tr>
  <tr><td>REPAIR_ALLOW_DATA_LOSS</td><td>High</td><td>Absolute last resort</td></tr>
</table>
<p>Database integrity is about detecting damage before it becomes data loss. Corruption is either physical — damaged pages, torn writes, I/O errors — or logical — inconsistent indexes and metadata that the engine can still read but is wrong.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Logical Corruption, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Logical Corruption",
      html: `
<p>This section consolidates <strong>Logical Corruption</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page. The response is careful: capture evidence, avoid destructive repair first, and prefer restoring a clean page or database.</p>
<p>Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Logical Corruption sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Repair option</th><th>Risk</th><th>When</th></tr>
  <tr><td>REPAIR_FAST</td><td>Low</td><td>Minor, non-data issues</td></tr>
  <tr><td>REPAIR_REBUILD</td><td>Medium</td><td>Rebuild indexes</td></tr>
  <tr><td>REPAIR_ALLOW_DATA_LOSS</td><td>High</td><td>Absolute last resort</td></tr>
</table>
<p>Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and business approval.</p>
<p>Use the following as a starting point when investigating Logical Corruption. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Logical Corruption
DBCC CHECKDB ('SalesDB') WITH NO_INFOMSGS, ALL_ERRORMSGS;
GO
-- Results include the lowest repair level recommended</code></pre>
<p>A corruption incident is a data-loss event until proven otherwise. Preserve the original files, determine the root cause — often storage — and replace the failing hardware before returning the database to service.</p>
      `,
    }
  ],

  scenario: {
    title: "The SUSPECT database after a restart",
    html: `
After an unclean shutdown a production database came up SUSPECT. The DBA resisted the tempting EMERGENCY REPAIR rebuild, captured the error log, confirmed a good backup and restored to a clean state with minimal loss. Rebuilding system tables would have risked far more data.
<p><strong>The Logical Corruption lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
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
        "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata.",
        "Logical Corruption",
        "Logical Corruption is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Logical Corruption within database integrity and corruption. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Logical Corruption fits”?",
      "options": [
        "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata.",
        "Logical Corruption is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.",
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata. Running full CHECKDB frequently can be expensive, so large systems sometimes split checks across a rotating schedule.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Logical Corruption in practice”?",
      "options": [
        "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata.",
        "The diagram below places Logical Corruption alongside the core concepts of database integrity and corruption.",
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page. The response is careful: capture evidence, avoid destructive repair first, and prefer restoring a clean page or database.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Logical Corruption”?",
      "options": [
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page.",
        "Theory becomes useful when you can apply it.",
        "The diagram below places Logical Corruption alongside the core concepts of database integrity and corruption."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Logical Corruption. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "A corruption incident is a data-loss event until proven otherwise.",
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page.",
        "The following comparison captures the distinctions that matter most when working with Logical Corruption:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A corruption incident is a data-loss event until proven otherwise. Preserve the original files, determine the root cause — often storage — and replace the failing hardware before returning the database to service.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain.",
        "Check hardware, run CHECKDB",
        "Logical Corruption"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Logical Corruption with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Logical Corruption means”?",
      "options": [
        "The first example establishes the relevant state.",
        "Page checksums are the primary detection mechanism.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Page checksums are the primary detection mechanism. With CHECKSUM enabled, SQL Server writes a checksum into each page and verifies it on read, catching silent disk corruption that would otherwise go unnoticed until a query fails.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Logical Corruption fits”?",
      "options": [
        "The diagram below places Logical Corruption alongside the core concepts of database integrity and corruption.",
        "Check log access and space",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Logical Corruption alongside the core concepts of database integrity and corruption. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Logical Corruption in practice”?",
      "options": [
        "A corruption incident is a data-loss event until proven otherwise.",
        "Database integrity is about detecting damage before it becomes data loss.",
        "The following comparison captures the distinctions that matter most when working with Logical Corruption:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Logical Corruption:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Logical Corruption”?",
      "options": [
        "A corruption incident is a data-loss event until proven otherwise.",
        "The first example establishes the relevant state.",
        "Check log access and space"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database integrity and corruption.”",
      "options": [
        "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata.",
        "Logical Corruption",
        "Logical Corruption is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Logical Corruption within database integrity and corruption. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Logical Corruption fits”?",
      "options": [
        "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata.",
        "Logical Corruption is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.",
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata. Running full CHECKDB frequently can be expensive, so large systems sometimes split checks across a rotating schedule.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Logical Corruption in practice”?",
      "options": [
        "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata.",
        "The diagram below places Logical Corruption alongside the core concepts of database integrity and corruption.",
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page. The response is careful: capture evidence, avoid destructive repair first, and prefer restoring a clean page or database.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Logical Corruption”?",
      "options": [
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page.",
        "Theory becomes useful when you can apply it.",
        "The diagram below places Logical Corruption alongside the core concepts of database integrity and corruption."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Logical Corruption. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "A corruption incident is a data-loss event until proven otherwise.",
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page.",
        "The following comparison captures the distinctions that matter most when working with Logical Corruption:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A corruption incident is a data-loss event until proven otherwise. Preserve the original files, determine the root cause — often storage — and replace the failing hardware before returning the database to service.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain.",
        "Check hardware, run CHECKDB",
        "Logical Corruption"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Logical Corruption with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Logical Corruption means”?",
      "options": [
        "The first example establishes the relevant state.",
        "Page checksums are the primary detection mechanism.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Page checksums are the primary detection mechanism. With CHECKSUM enabled, SQL Server writes a checksum into each page and verifies it on read, catching silent disk corruption that would otherwise go unnoticed until a query fails.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Logical Corruption fits”?",
      "options": [
        "The diagram below places Logical Corruption alongside the core concepts of database integrity and corruption.",
        "Check log access and space",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Logical Corruption alongside the core concepts of database integrity and corruption. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Logical Corruption in practice”?",
      "options": [
        "A corruption incident is a data-loss event until proven otherwise.",
        "Database integrity is about detecting damage before it becomes data loss.",
        "The following comparison captures the distinctions that matter most when working with Logical Corruption:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Logical Corruption:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Logical Corruption”?",
      "options": [
        "A corruption incident is a data-loss event until proven otherwise.",
        "The first example establishes the relevant state.",
        "Check log access and space"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database integrity and corruption.”",
      "options": [
        "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata.",
        "Logical Corruption",
        "Logical Corruption is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Logical Corruption within database integrity and corruption. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Logical Corruption fits”?",
      "options": [
        "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata.",
        "Logical Corruption is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.",
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata. Running full CHECKDB frequently can be expensive, so large systems sometimes split checks across a rotating schedule.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Logical Corruption in practice”?",
      "options": [
        "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata.",
        "The diagram below places Logical Corruption alongside the core concepts of database integrity and corruption.",
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page. The response is careful: capture evidence, avoid destructive repair first, and prefer restoring a clean page or database.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Logical Corruption”?",
      "options": [
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page.",
        "Theory becomes useful when you can apply it.",
        "The diagram below places Logical Corruption alongside the core concepts of database integrity and corruption."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Logical Corruption. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "A corruption incident is a data-loss event until proven otherwise.",
        "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page.",
        "The following comparison captures the distinctions that matter most when working with Logical Corruption:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A corruption incident is a data-loss event until proven otherwise. Preserve the original files, determine the root cause — often storage — and replace the failing hardware before returning the database to service.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain.",
        "Check hardware, run CHECKDB",
        "Logical Corruption"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Logical Corruption with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Logical Corruption means”?",
      "options": [
        "The first example establishes the relevant state.",
        "Page checksums are the primary detection mechanism.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Page checksums are the primary detection mechanism. With CHECKSUM enabled, SQL Server writes a checksum into each page and verifies it on read, catching silent disk corruption that would otherwise go unnoticed until a query fails.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Logical Corruption fits”?",
      "options": [
        "The diagram below places Logical Corruption alongside the core concepts of database integrity and corruption.",
        "Check log access and space",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Logical Corruption alongside the core concepts of database integrity and corruption. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Logical Corruption in practice”?",
      "options": [
        "A corruption incident is a data-loss event until proven otherwise.",
        "Database integrity is about detecting damage before it becomes data loss.",
        "The following comparison captures the distinctions that matter most when working with Logical Corruption:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Logical Corruption:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Logical Corruption”?",
      "options": [
        "A corruption incident is a data-loss event until proven otherwise.",
        "The first example establishes the relevant state.",
        "Check log access and space"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Logical Corruption is a fundamental concept in database integrity and corruption",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Logical Corruption improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
