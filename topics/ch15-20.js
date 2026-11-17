/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch15-20.html */

window.TOPIC = {
  id: "ch15-20",
  title: "Production Maintenance Checklist",

  lead: "Understanding Production Maintenance Checklist is essential for anyone responsible for capacity planning and database maintenance. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what Production Maintenance Checklist is and where it fits",
    "Explain how Production Maintenance Checklist works internally",
    "Apply Production Maintenance Checklist correctly in a production environment",
    "Recognise the common mistakes and risks involving Production Maintenance Checklist",
    "Monitor and troubleshoot Production Maintenance Checklist with the right tools"
  ],

  sections: [
    {
      h: "What Production Maintenance Checklist means",
      html: `
<p>In this topic we examine <strong>Production Maintenance Checklist</strong> within capacity planning and database maintenance. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping. Each task has a window, a duration and an impact.</p>
<p>Index maintenance is nuanced: rebuilding every index weekly is often wasteful. Use fragmentation and page-count thresholds to choose REORGANIZE for lightly fragmented indexes and REBUILD only where justified, and remember that rebuilds update statistics.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Production Maintenance Checklist is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Production Maintenance Checklist fits",
      html: `
<p>Statistics maintenance ensures the optimiser has current data distributions. Auto-update helps but large, rapidly changing tables may need scheduled explicit updates with an appropriate sample.</p>
<p>The diagram below places Production Maintenance Checklist alongside the core concepts of capacity planning and database maintenance. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Production Maintenance Checkl… flow">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="230" y="12" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="39" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Growth</text>
    <rect x="230" y="66" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="93" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Capacity</text>
    <rect x="230" y="120" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="147" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Maintenance</text>
    <rect x="230" y="174" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="201" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Retention</text>
    <rect x="230" y="228" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="255" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Partition</text>
    <rect x="230" y="282" width="300" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="309" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">6. Window</text>
    <line x1="380" y1="56" x2="380" y2="66" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="110" x2="380" y2="120" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="164" x2="380" y2="174" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="218" x2="380" y2="228" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="272" x2="380" y2="282" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Production Maintenance Checkl…</text>
  </svg>
  <div class="figcaption">Figure 1 — Capacity planning and database maintenance: how Production Maintenance Checklist relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Production Maintenance Checklist in practice",
      html: `
<p>Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule. Partitioning can make both operations efficient by switching whole partitions.</p>
<p>The following comparison captures the distinctions that matter most when working with Production Maintenance Checklist:</p>
<table>
  <tr><th>Resource</th><th>Plan for</th><th>Common surprise</th></tr>
  <tr><td>Data files</td><td>Row growth + indexes + headroom</td><td>Bulk loads</td></tr>
  <tr><td>Log</td><td>Transaction size / backup frequency</td><td>Long transactions</td></tr>
  <tr><td>Disk</td><td>Peak + maintenance free space</td><td>Rebuild needing 1.5x space</td></tr>
</table>
<p>Maintenance windows must be negotiated and respected. Every task should have an impact analysis, a rollback plan and monitoring so overruns are detected before business hours.</p>
      `,
    },
    {
      h: "Working with Production Maintenance Checklist",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Production Maintenance Checklist. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Production Maintenance Checklist
-- Data file growth history from default trace / file stats
SELECT database_id, file_id,
       size / 128 AS size_mb
FROM   sys.dm_io_virtual_file_stats(NULL, NULL);</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Production Maintenance Checklist
-- Fragmented indexes above 10% and 1000 pages
SELECT OBJECT_NAME(s.object_id) AS table_name, i.name AS index_name,
       s.avg_fragmentation_in_percent, s.page_count
FROM   sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') s
JOIN   sys.indexes i ON i.object_id=s.object_id AND i.index_id=s.index_id
WHERE  s.avg_fragmentation_in_percent > 10 AND s.page_count > 1000
ORDER BY s.avg_fragmentation_in_percent DESC;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Production Maintenance Checklist
-- Project daily growth: compare two snapshots
-- Store daily size_mb in a table, then:
SELECT database_name,
       AVG(size_mb - prev_size_mb) AS avg_daily_growth_mb
FROM   dbo.DailySizeSnapshot
GROUP BY database_name;</code></pre>
<p>Capacity planning predicts when resources will run out so you can act on your terms, not during an incident. It combines historical growth trends, known upcoming changes and a safety margin.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Data and log capacity are planned separately. Data grows with retained rows and index size; log growth depends on the recovery model, transaction size and backup frequency. Each needs its own trend and headroom.</p>
<table>
  <tr><th>Fragmentation</th><th>Action</th><th>Reason</th></tr>
  <tr><td>< 10%</td><td>Leave alone</td><td>No benefit</td></tr>
  <tr><td>10-30%</td><td>REORGANIZE</td><td>Online, low impact</td></tr>
  <tr><td>> 30%</td><td>REBUILD</td><td>Rebuild structure and stats</td></tr>
</table>
<p>Disk, CPU and memory capacity must account for peak load and for maintenance operations such as index rebuilds, which temporarily need significant free space and memory. A full disk during a rebuild is a self-inflicted outage.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Production Maintenance Checklist, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Production Maintenance Checklist",
      html: `
<p>This section consolidates <strong>Production Maintenance Checklist</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule. Partitioning can make both operations efficient by switching whole partitions.</p>
<p>Maintenance windows must be negotiated and respected. Every task should have an impact analysis, a rollback plan and monitoring so overruns are detected before business hours.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Production Maintenance Checklist sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Fragmentation</th><th>Action</th><th>Reason</th></tr>
  <tr><td>< 10%</td><td>Leave alone</td><td>No benefit</td></tr>
  <tr><td>10-30%</td><td>REORGANIZE</td><td>Online, low impact</td></tr>
  <tr><td>> 30%</td><td>REBUILD</td><td>Rebuild structure and stats</td></tr>
</table>
<p>Capacity planning predicts when resources will run out so you can act on your terms, not during an incident. It combines historical growth trends, known upcoming changes and a safety margin.</p>
<p>Use the following as a starting point when investigating Production Maintenance Checklist. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Production Maintenance Checklist
-- Data file growth history from default trace / file stats
SELECT database_id, file_id,
       size / 128 AS size_mb
FROM   sys.dm_io_virtual_file_stats(NULL, NULL);</code></pre>
<p>Data and log capacity are planned separately. Data grows with retained rows and index size; log growth depends on the recovery model, transaction size and backup frequency. Each needs its own trend and headroom.</p>
      `,
    }
  ],

  scenario: {
    title: "Log growth nobody forecast",
    html: `
Switching a database to FULL recovery without adding log backups caused the log to grow until it filled its volume. Capacity planning now includes recovery model, log-backup cadence and worst-case transaction size, with alerts at 70% and 85% log usage.
<p><strong>The Production Maintenance Checklist lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "When should you rebuild versus reorganise an index?",
      a: `
Reorganize lightly fragmented indexes (roughly 10-30%) online with low impact; rebuild heavily fragmented ones (above about 30%), and leave low-fragmentation indexes alone — always consider page count.
      `,
    },
    {
      q: "Why is retention part of capacity planning?",
      a: `
Because deleting or archiving old data at the source is the only way to bend a growth curve; without a retention policy, capacity work is just repeatedly buying more disk.
      `,
    },
    {
      q: "How do you forecast storage capacity?",
      a: `
Track daily size from sys.dm_io_virtual_file_stats or a snapshot table, compute a trend, add known upcoming loads and a safety margin, and plan data and log independently.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within capacity planning and database maintenance.”",
      "options": [
        "Production Maintenance Checklist sits inside a larger system.",
        "Production Maintenance Checklist",
        "Rebuild structure and stats"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Production Maintenance Checklist within capacity planning and database maintenance. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Maintenance Checklist fits”?",
      "options": [
        "Statistics maintenance ensures the optimiser has current data distributions.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Production Maintenance Checklist."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Statistics maintenance ensures the optimiser has current data distributions. Auto-update helps but large, rapidly changing tables may need scheduled explicit updates with an appropriate sample.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Maintenance Checklist in practice”?",
      "options": [
        "Long transactions",
        "Rebuild needing 1.5x space",
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule. Partitioning can make both operations efficient by switching whole partitions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Maintenance Checklist”?",
      "options": [
        "Production Maintenance Checklist",
        "Theory becomes useful when you can apply it.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Production Maintenance Checklist. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Data and log capacity are planned separately.",
        "Production Maintenance Checklist",
        "A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Data and log capacity are planned separately. Data grows with retained rows and index size; log growth depends on the recovery model, transaction size and backup frequency. Each needs its own trend and headroom.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Index maintenance is nuanced: rebuilding every index weekly is often wasteful.",
        "Production Maintenance Checklist is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Production Maintenance Checklist"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Production Maintenance Checklist with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Production Maintenance Checklist means”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Production Maintenance Checklist:",
        "A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping.",
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping. Each task has a window, a duration and an impact.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Maintenance Checklist fits”?",
      "options": [
        "The diagram below places Production Maintenance Checklist alongside the core concepts of capacity planning and database maintenance.",
        "Production Maintenance Checklist is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Production Maintenance Checklist alongside the core concepts of capacity planning and database maintenance. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Maintenance Checklist in practice”?",
      "options": [
        "Statistics maintenance ensures the optimiser has current data distributions.",
        "The diagram below places Production Maintenance Checklist alongside the core concepts of capacity planning and database maintenance.",
        "The following comparison captures the distinctions that matter most when working with Production Maintenance Checklist:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Production Maintenance Checklist:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Maintenance Checklist”?",
      "options": [
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule.",
        "The first example establishes the relevant state.",
        "The diagram below places Production Maintenance Checklist alongside the core concepts of capacity planning and database maintenance."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within capacity planning and database maintenance.”",
      "options": [
        "Production Maintenance Checklist sits inside a larger system.",
        "Production Maintenance Checklist",
        "Rebuild structure and stats"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Production Maintenance Checklist within capacity planning and database maintenance. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Maintenance Checklist fits”?",
      "options": [
        "Statistics maintenance ensures the optimiser has current data distributions.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Production Maintenance Checklist."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Statistics maintenance ensures the optimiser has current data distributions. Auto-update helps but large, rapidly changing tables may need scheduled explicit updates with an appropriate sample.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Maintenance Checklist in practice”?",
      "options": [
        "Long transactions",
        "Rebuild needing 1.5x space",
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule. Partitioning can make both operations efficient by switching whole partitions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Maintenance Checklist”?",
      "options": [
        "Production Maintenance Checklist",
        "Theory becomes useful when you can apply it.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Production Maintenance Checklist. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Data and log capacity are planned separately.",
        "Production Maintenance Checklist",
        "A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Data and log capacity are planned separately. Data grows with retained rows and index size; log growth depends on the recovery model, transaction size and backup frequency. Each needs its own trend and headroom.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Index maintenance is nuanced: rebuilding every index weekly is often wasteful.",
        "Production Maintenance Checklist is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Production Maintenance Checklist"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Production Maintenance Checklist with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Production Maintenance Checklist means”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Production Maintenance Checklist:",
        "A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping.",
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping. Each task has a window, a duration and an impact.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Maintenance Checklist fits”?",
      "options": [
        "The diagram below places Production Maintenance Checklist alongside the core concepts of capacity planning and database maintenance.",
        "Production Maintenance Checklist is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Production Maintenance Checklist alongside the core concepts of capacity planning and database maintenance. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Maintenance Checklist in practice”?",
      "options": [
        "Statistics maintenance ensures the optimiser has current data distributions.",
        "The diagram below places Production Maintenance Checklist alongside the core concepts of capacity planning and database maintenance.",
        "The following comparison captures the distinctions that matter most when working with Production Maintenance Checklist:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Production Maintenance Checklist:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Maintenance Checklist”?",
      "options": [
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule.",
        "The first example establishes the relevant state.",
        "The diagram below places Production Maintenance Checklist alongside the core concepts of capacity planning and database maintenance."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within capacity planning and database maintenance.”",
      "options": [
        "Production Maintenance Checklist sits inside a larger system.",
        "Production Maintenance Checklist",
        "Rebuild structure and stats"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Production Maintenance Checklist within capacity planning and database maintenance. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Maintenance Checklist fits”?",
      "options": [
        "Statistics maintenance ensures the optimiser has current data distributions.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Production Maintenance Checklist."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Statistics maintenance ensures the optimiser has current data distributions. Auto-update helps but large, rapidly changing tables may need scheduled explicit updates with an appropriate sample.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Maintenance Checklist in practice”?",
      "options": [
        "Long transactions",
        "Rebuild needing 1.5x space",
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule. Partitioning can make both operations efficient by switching whole partitions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Maintenance Checklist”?",
      "options": [
        "Production Maintenance Checklist",
        "Theory becomes useful when you can apply it.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Production Maintenance Checklist. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Data and log capacity are planned separately.",
        "Production Maintenance Checklist",
        "A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Data and log capacity are planned separately. Data grows with retained rows and index size; log growth depends on the recovery model, transaction size and backup frequency. Each needs its own trend and headroom.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Index maintenance is nuanced: rebuilding every index weekly is often wasteful.",
        "Production Maintenance Checklist is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Production Maintenance Checklist"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Production Maintenance Checklist with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Production Maintenance Checklist means”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Production Maintenance Checklist:",
        "A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping.",
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping. Each task has a window, a duration and an impact.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Maintenance Checklist fits”?",
      "options": [
        "The diagram below places Production Maintenance Checklist alongside the core concepts of capacity planning and database maintenance.",
        "Production Maintenance Checklist is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Production Maintenance Checklist alongside the core concepts of capacity planning and database maintenance. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Maintenance Checklist in practice”?",
      "options": [
        "Statistics maintenance ensures the optimiser has current data distributions.",
        "The diagram below places Production Maintenance Checklist alongside the core concepts of capacity planning and database maintenance.",
        "The following comparison captures the distinctions that matter most when working with Production Maintenance Checklist:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Production Maintenance Checklist:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Maintenance Checklist”?",
      "options": [
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule.",
        "The first example establishes the relevant state.",
        "The diagram below places Production Maintenance Checklist alongside the core concepts of capacity planning and database maintenance."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Production Maintenance Checklist is a fundamental concept in capacity planning and database maintenance",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Production Maintenance Checklist improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
