/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch15-12.html */

window.TOPIC = {
  id: "ch15-12",
  title: "DBCC CHECKDB Scheduling",

  lead: "This topic covers DBCC CHECKDB Scheduling — a concept you will meet repeatedly when working with capacity planning and database maintenance. We build from first principles to production guidance.",

  objectives: [
    "Define what DBCC CHECKDB Scheduling is and where it fits",
    "Explain how DBCC CHECKDB Scheduling works internally",
    "Apply DBCC CHECKDB Scheduling correctly in a production environment",
    "Recognise the common mistakes and risks involving DBCC CHECKDB Scheduling",
    "Monitor and troubleshoot DBCC CHECKDB Scheduling with the right tools"
  ],

  sections: [
    {
      h: "What DBCC CHECKDB Scheduling means",
      html: `
<p>In this topic we examine <strong>DBCC CHECKDB Scheduling</strong> within capacity planning and database maintenance. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping. Each task has a window, a duration and an impact.</p>
<p>Index maintenance is nuanced: rebuilding every index weekly is often wasteful. Use fragmentation and page-count thresholds to choose REORGANIZE for lightly fragmented indexes and REBUILD only where justified, and remember that rebuilds update statistics.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>DBCC CHECKDB Scheduling is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where DBCC CHECKDB Scheduling fits",
      html: `
<p>Statistics maintenance ensures the optimiser has current data distributions. Auto-update helps but large, rapidly changing tables may need scheduled explicit updates with an appropriate sample.</p>
<p>The diagram below places DBCC CHECKDB Scheduling alongside the core concepts of capacity planning and database maintenance. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="DBCC CHECKDB Scheduling layers">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="70" y="8" width="620" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="30" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Growth</text>
    <text x="380" y="50" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 1</text>
    <rect x="100" y="62" width="560" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="84" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Capacity</text>
    <text x="380" y="104" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 2</text>
    <rect x="130" y="116" width="500" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="138" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Maintenance</text>
    <text x="380" y="158" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 3</text>
    <rect x="160" y="170" width="440" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="192" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Retention</text>
    <text x="380" y="212" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 4</text>
    <rect x="190" y="224" width="380" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="246" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Partition</text>
    <text x="380" y="266" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 5</text>
    <rect x="220" y="278" width="320" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="300" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Window</text>
    <text x="380" y="320" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 6</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">DBCC CHECKDB Scheduling</text>
  </svg>
  <div class="figcaption">Figure 1 — Capacity planning and database maintenance: how DBCC CHECKDB Scheduling relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "DBCC CHECKDB Scheduling in practice",
      html: `
<p>Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule. Partitioning can make both operations efficient by switching whole partitions.</p>
<p>The following comparison captures the distinctions that matter most when working with DBCC CHECKDB Scheduling:</p>
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
      h: "Working with DBCC CHECKDB Scheduling",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to DBCC CHECKDB Scheduling. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- DBCC CHECKDB Scheduling
-- Data file growth history from default trace / file stats
SELECT database_id, file_id,
       size / 128 AS size_mb
FROM   sys.dm_io_virtual_file_stats(NULL, NULL);</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- DBCC CHECKDB Scheduling
-- Fragmented indexes above 10% and 1000 pages
SELECT OBJECT_NAME(s.object_id) AS table_name, i.name AS index_name,
       s.avg_fragmentation_in_percent, s.page_count
FROM   sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') s
JOIN   sys.indexes i ON i.object_id=s.object_id AND i.index_id=s.index_id
WHERE  s.avg_fragmentation_in_percent > 10 AND s.page_count > 1000
ORDER BY s.avg_fragmentation_in_percent DESC;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- DBCC CHECKDB Scheduling
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
  <p>With DBCC CHECKDB Scheduling, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: DBCC CHECKDB Scheduling",
      html: `
<p>This section consolidates <strong>DBCC CHECKDB Scheduling</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule. Partitioning can make both operations efficient by switching whole partitions.</p>
<p>Maintenance windows must be negotiated and respected. Every task should have an impact analysis, a rollback plan and monitoring so overruns are detected before business hours.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>DBCC CHECKDB Scheduling sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Fragmentation</th><th>Action</th><th>Reason</th></tr>
  <tr><td>< 10%</td><td>Leave alone</td><td>No benefit</td></tr>
  <tr><td>10-30%</td><td>REORGANIZE</td><td>Online, low impact</td></tr>
  <tr><td>> 30%</td><td>REBUILD</td><td>Rebuild structure and stats</td></tr>
</table>
<p>Capacity planning predicts when resources will run out so you can act on your terms, not during an incident. It combines historical growth trends, known upcoming changes and a safety margin.</p>
<p>Use the following as a starting point when investigating DBCC CHECKDB Scheduling. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- DBCC CHECKDB Scheduling
-- Fragmented indexes above 10% and 1000 pages
SELECT OBJECT_NAME(s.object_id) AS table_name, i.name AS index_name,
       s.avg_fragmentation_in_percent, s.page_count
FROM   sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') s
JOIN   sys.indexes i ON i.object_id=s.object_id AND i.index_id=s.index_id
WHERE  s.avg_fragmentation_in_percent > 10 AND s.page_count > 1000
ORDER BY s.avg_fragmentation_in_percent DESC;</code></pre>
<p>Data and log capacity are planned separately. Data grows with retained rows and index size; log growth depends on the recovery model, transaction size and backup frequency. Each needs its own trend and headroom.</p>
      `,
    }
  ],

  scenario: {
    title: "Log growth nobody forecast",
    html: `
Switching a database to FULL recovery without adding log backups caused the log to grow until it filled its volume. Capacity planning now includes recovery model, log-backup cadence and worst-case transaction size, with alerts at 70% and 85% log usage.
<p><strong>The DBCC CHECKDB Scheduling lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
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
    },
    {
      q: "When should you rebuild versus reorganise an index?",
      a: `
Reorganize lightly fragmented indexes (roughly 10-30%) online with low impact; rebuild heavily fragmented ones (above about 30%), and leave low-fragmentation indexes alone — always consider page count.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within capacity planning and database maintenance.”",
      "options": [
        "DBCC CHECKDB Scheduling",
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine DBCC CHECKDB Scheduling within capacity planning and database maintenance. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DBCC CHECKDB Scheduling fits”?",
      "options": [
        "Capacity planning predicts when resources will run out so you can act on your terms, not during an incident.",
        "Data and log capacity are planned separately.",
        "Statistics maintenance ensures the optimiser has current data distributions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Statistics maintenance ensures the optimiser has current data distributions. Auto-update helps but large, rapidly changing tables may need scheduled explicit updates with an appropriate sample.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DBCC CHECKDB Scheduling in practice”?",
      "options": [
        "Rebuild structure and stats",
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule.",
        "Online, low impact"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule. Partitioning can make both operations efficient by switching whole partitions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DBCC CHECKDB Scheduling”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "No benefit",
        "Online, low impact"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to DBCC CHECKDB Scheduling. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "DBCC CHECKDB Scheduling sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Data and log capacity are planned separately."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Data and log capacity are planned separately. Data grows with retained rows and index size; log growth depends on the recovery model, transaction size and backup frequency. Each needs its own trend and headroom.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "No benefit",
        "DBCC CHECKDB Scheduling",
        "With DBCC CHECKDB Scheduling, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates DBCC CHECKDB Scheduling with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What DBCC CHECKDB Scheduling means”?",
      "options": [
        "A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping.",
        "DBCC CHECKDB Scheduling",
        "DBCC CHECKDB Scheduling sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping. Each task has a window, a duration and an impact.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DBCC CHECKDB Scheduling fits”?",
      "options": [
        "Rebuild structure and stats",
        "DBCC CHECKDB Scheduling sits inside a larger system.",
        "The diagram below places DBCC CHECKDB Scheduling alongside the core concepts of capacity planning and database maintenance."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places DBCC CHECKDB Scheduling alongside the core concepts of capacity planning and database maintenance. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DBCC CHECKDB Scheduling in practice”?",
      "options": [
        "Bulk loads",
        "The following comparison captures the distinctions that matter most when working with DBCC CHECKDB Scheduling:",
        "Use the following as a starting point when investigating DBCC CHECKDB Scheduling."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with DBCC CHECKDB Scheduling:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DBCC CHECKDB Scheduling”?",
      "options": [
        "The first example establishes the relevant state.",
        "Use the following as a starting point when investigating DBCC CHECKDB Scheduling.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within capacity planning and database maintenance.”",
      "options": [
        "DBCC CHECKDB Scheduling",
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine DBCC CHECKDB Scheduling within capacity planning and database maintenance. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DBCC CHECKDB Scheduling fits”?",
      "options": [
        "Capacity planning predicts when resources will run out so you can act on your terms, not during an incident.",
        "Data and log capacity are planned separately.",
        "Statistics maintenance ensures the optimiser has current data distributions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Statistics maintenance ensures the optimiser has current data distributions. Auto-update helps but large, rapidly changing tables may need scheduled explicit updates with an appropriate sample.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DBCC CHECKDB Scheduling in practice”?",
      "options": [
        "Rebuild structure and stats",
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule.",
        "Online, low impact"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule. Partitioning can make both operations efficient by switching whole partitions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DBCC CHECKDB Scheduling”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "No benefit",
        "Online, low impact"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to DBCC CHECKDB Scheduling. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "DBCC CHECKDB Scheduling sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Data and log capacity are planned separately."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Data and log capacity are planned separately. Data grows with retained rows and index size; log growth depends on the recovery model, transaction size and backup frequency. Each needs its own trend and headroom.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "No benefit",
        "DBCC CHECKDB Scheduling",
        "With DBCC CHECKDB Scheduling, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates DBCC CHECKDB Scheduling with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What DBCC CHECKDB Scheduling means”?",
      "options": [
        "A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping.",
        "DBCC CHECKDB Scheduling",
        "DBCC CHECKDB Scheduling sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping. Each task has a window, a duration and an impact.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DBCC CHECKDB Scheduling fits”?",
      "options": [
        "Rebuild structure and stats",
        "DBCC CHECKDB Scheduling sits inside a larger system.",
        "The diagram below places DBCC CHECKDB Scheduling alongside the core concepts of capacity planning and database maintenance."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places DBCC CHECKDB Scheduling alongside the core concepts of capacity planning and database maintenance. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DBCC CHECKDB Scheduling in practice”?",
      "options": [
        "Bulk loads",
        "The following comparison captures the distinctions that matter most when working with DBCC CHECKDB Scheduling:",
        "Use the following as a starting point when investigating DBCC CHECKDB Scheduling."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with DBCC CHECKDB Scheduling:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DBCC CHECKDB Scheduling”?",
      "options": [
        "The first example establishes the relevant state.",
        "Use the following as a starting point when investigating DBCC CHECKDB Scheduling.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within capacity planning and database maintenance.”",
      "options": [
        "DBCC CHECKDB Scheduling",
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine DBCC CHECKDB Scheduling within capacity planning and database maintenance. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DBCC CHECKDB Scheduling fits”?",
      "options": [
        "Capacity planning predicts when resources will run out so you can act on your terms, not during an incident.",
        "Data and log capacity are planned separately.",
        "Statistics maintenance ensures the optimiser has current data distributions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Statistics maintenance ensures the optimiser has current data distributions. Auto-update helps but large, rapidly changing tables may need scheduled explicit updates with an appropriate sample.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DBCC CHECKDB Scheduling in practice”?",
      "options": [
        "Rebuild structure and stats",
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule.",
        "Online, low impact"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule. Partitioning can make both operations efficient by switching whole partitions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DBCC CHECKDB Scheduling”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "No benefit",
        "Online, low impact"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to DBCC CHECKDB Scheduling. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "DBCC CHECKDB Scheduling sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Data and log capacity are planned separately."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Data and log capacity are planned separately. Data grows with retained rows and index size; log growth depends on the recovery model, transaction size and backup frequency. Each needs its own trend and headroom.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "No benefit",
        "DBCC CHECKDB Scheduling",
        "With DBCC CHECKDB Scheduling, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates DBCC CHECKDB Scheduling with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What DBCC CHECKDB Scheduling means”?",
      "options": [
        "A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping.",
        "DBCC CHECKDB Scheduling",
        "DBCC CHECKDB Scheduling sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping. Each task has a window, a duration and an impact.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DBCC CHECKDB Scheduling fits”?",
      "options": [
        "Rebuild structure and stats",
        "DBCC CHECKDB Scheduling sits inside a larger system.",
        "The diagram below places DBCC CHECKDB Scheduling alongside the core concepts of capacity planning and database maintenance."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places DBCC CHECKDB Scheduling alongside the core concepts of capacity planning and database maintenance. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DBCC CHECKDB Scheduling in practice”?",
      "options": [
        "Bulk loads",
        "The following comparison captures the distinctions that matter most when working with DBCC CHECKDB Scheduling:",
        "Use the following as a starting point when investigating DBCC CHECKDB Scheduling."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with DBCC CHECKDB Scheduling:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DBCC CHECKDB Scheduling”?",
      "options": [
        "The first example establishes the relevant state.",
        "Use the following as a starting point when investigating DBCC CHECKDB Scheduling.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "DBCC CHECKDB Scheduling is a fundamental concept in capacity planning and database maintenance",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of DBCC CHECKDB Scheduling improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
