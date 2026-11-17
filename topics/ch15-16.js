/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch15-16.html */

window.TOPIC = {
  id: "ch15-16",
  title: "Data Retention Policies",

  lead: "Data Retention Policies is a core part of capacity planning and database maintenance. This topic explains what it is, how it works inside SQL Server, and what a production DBA must know to operate it safely.",

  objectives: [
    "Define what Data Retention Policies is and where it fits",
    "Explain how Data Retention Policies works internally",
    "Apply Data Retention Policies correctly in a production environment",
    "Recognise the common mistakes and risks involving Data Retention Policies",
    "Monitor and troubleshoot Data Retention Policies with the right tools"
  ],

  sections: [
    {
      h: "What Data Retention Policies means",
      html: `
<p>In this topic we examine <strong>Data Retention Policies</strong> within capacity planning and database maintenance. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Maintenance windows must be negotiated and respected. Every task should have an impact analysis, a rollback plan and monitoring so overruns are detected before business hours.</p>
<p>Capacity planning predicts when resources will run out so you can act on your terms, not during an incident. It combines historical growth trends, known upcoming changes and a safety margin.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Data Retention Policies is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Data Retention Policies fits",
      html: `
<p>Data and log capacity are planned separately. Data grows with retained rows and index size; log growth depends on the recovery model, transaction size and backup frequency. Each needs its own trend and headroom.</p>
<p>The diagram below places Data Retention Policies alongside the core concepts of capacity planning and database maintenance. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Data Retention Policies concept map">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="280" y="140" width="200" height="60" rx="9" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="175" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Data Retention Policies</text>
    <rect x="24" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Growth</text>
    <text x="124" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 1</text>
    <rect x="536" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Capacity</text>
    <text x="636" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 2</text>
    <rect x="24" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Maintenance</text>
    <text x="124" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 3</text>
    <rect x="536" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Retention</text>
    <text x="636" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 4</text>
    <rect x="24" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Partition</text>
    <text x="124" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 5</text>
    <rect x="536" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Window</text>
    <text x="636" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 6</text>
    <line x1="380" y1="170" x2="124" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
  </svg>
  <div class="figcaption">Figure 1 — Capacity planning and database maintenance: how Data Retention Policies relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Data Retention Policies in practice",
      html: `
<p>Disk, CPU and memory capacity must account for peak load and for maintenance operations such as index rebuilds, which temporarily need significant free space and memory. A full disk during a rebuild is a self-inflicted outage.</p>
<p>The following comparison captures the distinctions that matter most when working with Data Retention Policies:</p>
<table>
  <tr><th>Resource</th><th>Plan for</th><th>Common surprise</th></tr>
  <tr><td>Data files</td><td>Row growth + indexes + headroom</td><td>Bulk loads</td></tr>
  <tr><td>Log</td><td>Transaction size / backup frequency</td><td>Long transactions</td></tr>
  <tr><td>Disk</td><td>Peak + maintenance free space</td><td>Rebuild needing 1.5x space</td></tr>
</table>
<p>A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping. Each task has a window, a duration and an impact.</p>
      `,
    },
    {
      h: "Working with Data Retention Policies",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Data Retention Policies. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Data Retention Policies
-- Data file growth history from default trace / file stats
SELECT database_id, file_id,
       size / 128 AS size_mb
FROM   sys.dm_io_virtual_file_stats(NULL, NULL);</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Data Retention Policies
-- Fragmented indexes above 10% and 1000 pages
SELECT OBJECT_NAME(s.object_id) AS table_name, i.name AS index_name,
       s.avg_fragmentation_in_percent, s.page_count
FROM   sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') s
JOIN   sys.indexes i ON i.object_id=s.object_id AND i.index_id=s.index_id
WHERE  s.avg_fragmentation_in_percent > 10 AND s.page_count > 1000
ORDER BY s.avg_fragmentation_in_percent DESC;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Data Retention Policies
-- Project daily growth: compare two snapshots
-- Store daily size_mb in a table, then:
SELECT database_name,
       AVG(size_mb - prev_size_mb) AS avg_daily_growth_mb
FROM   dbo.DailySizeSnapshot
GROUP BY database_name;</code></pre>
<p>Index maintenance is nuanced: rebuilding every index weekly is often wasteful. Use fragmentation and page-count thresholds to choose REORGANIZE for lightly fragmented indexes and REBUILD only where justified, and remember that rebuilds update statistics.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Statistics maintenance ensures the optimiser has current data distributions. Auto-update helps but large, rapidly changing tables may need scheduled explicit updates with an appropriate sample.</p>
<table>
  <tr><th>Fragmentation</th><th>Action</th><th>Reason</th></tr>
  <tr><td>< 10%</td><td>Leave alone</td><td>No benefit</td></tr>
  <tr><td>10-30%</td><td>REORGANIZE</td><td>Online, low impact</td></tr>
  <tr><td>> 30%</td><td>REBUILD</td><td>Rebuild structure and stats</td></tr>
</table>
<p>Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule. Partitioning can make both operations efficient by switching whole partitions.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Data Retention Policies, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    }
  ],

  scenario: {
    title: "Log growth nobody forecast",
    html: `
Switching a database to FULL recovery without adding log backups caused the log to grow until it filled its volume. Capacity planning now includes recovery model, log-backup cadence and worst-case transaction size, with alerts at 70% and 85% log usage.
<p><strong>The Data Retention Policies lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
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
    },
    {
      q: "Why is retention part of capacity planning?",
      a: `
Because deleting or archiving old data at the source is the only way to bend a growth curve; without a retention policy, capacity work is just repeatedly buying more disk.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within capacity planning and database maintenance.”",
      "options": [
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule.",
        "With Data Retention Policies, prefer measured, reversible changes.",
        "Data Retention Policies"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Data Retention Policies within capacity planning and database maintenance. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Data Retention Policies fits”?",
      "options": [
        "Online, low impact",
        "Data and log capacity are planned separately.",
        "No benefit"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Data and log capacity are planned separately. Data grows with retained rows and index size; log growth depends on the recovery model, transaction size and backup frequency. Each needs its own trend and headroom.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Data Retention Policies in practice”?",
      "options": [
        "Disk, CPU and memory capacity must account for peak load and for maintenance operations such as index rebuilds, which temporarily need significant free space and memory.",
        "Bulk loads",
        "Long transactions"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Disk, CPU and memory capacity must account for peak load and for maintenance operations such as index rebuilds, which temporarily need significant free space and memory. A full disk during a rebuild is a self-inflicted outage.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Data Retention Policies”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Index maintenance is nuanced: rebuilding every index weekly is often wasteful.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Data Retention Policies. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Data Retention Policies",
        "Statistics maintenance ensures the optimiser has current data distributions.",
        "Rebuild structure and stats"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Statistics maintenance ensures the optimiser has current data distributions. Auto-update helps but large, rapidly changing tables may need scheduled explicit updates with an appropriate sample.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Data Retention Policies means”?",
      "options": [
        "Maintenance windows must be negotiated and respected.",
        "Data and log capacity are planned separately.",
        "The diagram below places Data Retention Policies alongside the core concepts of capacity planning and database maintenance."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Maintenance windows must be negotiated and respected. Every task should have an impact analysis, a rollback plan and monitoring so overruns are detected before business hours.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Data Retention Policies fits”?",
      "options": [
        "Maintenance windows must be negotiated and respected.",
        "Capacity planning predicts when resources will run out so you can act on your terms, not during an incident.",
        "The diagram below places Data Retention Policies alongside the core concepts of capacity planning and database maintenance."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Data Retention Policies alongside the core concepts of capacity planning and database maintenance. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Data Retention Policies in practice”?",
      "options": [
        "Data Retention Policies is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "The following comparison captures the distinctions that matter most when working with Data Retention Policies:",
        "Capacity planning predicts when resources will run out so you can act on your terms, not during an incident."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Data Retention Policies:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Data Retention Policies”?",
      "options": [
        "The first example establishes the relevant state.",
        "Data Retention Policies is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Data and log capacity are planned separately."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Data and log capacity are planned separately.",
        "The diagram below places Data Retention Policies alongside the core concepts of capacity planning and database maintenance.",
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule. Partitioning can make both operations efficient by switching whole partitions.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within capacity planning and database maintenance.”",
      "options": [
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule.",
        "With Data Retention Policies, prefer measured, reversible changes.",
        "Data Retention Policies"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Data Retention Policies within capacity planning and database maintenance. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Data Retention Policies fits”?",
      "options": [
        "Online, low impact",
        "Data and log capacity are planned separately.",
        "No benefit"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Data and log capacity are planned separately. Data grows with retained rows and index size; log growth depends on the recovery model, transaction size and backup frequency. Each needs its own trend and headroom.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Data Retention Policies in practice”?",
      "options": [
        "Disk, CPU and memory capacity must account for peak load and for maintenance operations such as index rebuilds, which temporarily need significant free space and memory.",
        "Bulk loads",
        "Long transactions"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Disk, CPU and memory capacity must account for peak load and for maintenance operations such as index rebuilds, which temporarily need significant free space and memory. A full disk during a rebuild is a self-inflicted outage.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Data Retention Policies”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Index maintenance is nuanced: rebuilding every index weekly is often wasteful.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Data Retention Policies. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Data Retention Policies",
        "Statistics maintenance ensures the optimiser has current data distributions.",
        "Rebuild structure and stats"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Statistics maintenance ensures the optimiser has current data distributions. Auto-update helps but large, rapidly changing tables may need scheduled explicit updates with an appropriate sample.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Data Retention Policies means”?",
      "options": [
        "Maintenance windows must be negotiated and respected.",
        "Data and log capacity are planned separately.",
        "The diagram below places Data Retention Policies alongside the core concepts of capacity planning and database maintenance."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Maintenance windows must be negotiated and respected. Every task should have an impact analysis, a rollback plan and monitoring so overruns are detected before business hours.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Data Retention Policies fits”?",
      "options": [
        "Maintenance windows must be negotiated and respected.",
        "Capacity planning predicts when resources will run out so you can act on your terms, not during an incident.",
        "The diagram below places Data Retention Policies alongside the core concepts of capacity planning and database maintenance."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Data Retention Policies alongside the core concepts of capacity planning and database maintenance. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Data Retention Policies in practice”?",
      "options": [
        "Data Retention Policies is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "The following comparison captures the distinctions that matter most when working with Data Retention Policies:",
        "Capacity planning predicts when resources will run out so you can act on your terms, not during an incident."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Data Retention Policies:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Data Retention Policies”?",
      "options": [
        "The first example establishes the relevant state.",
        "Data Retention Policies is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Data and log capacity are planned separately."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Data and log capacity are planned separately.",
        "The diagram below places Data Retention Policies alongside the core concepts of capacity planning and database maintenance.",
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule. Partitioning can make both operations efficient by switching whole partitions.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within capacity planning and database maintenance.”",
      "options": [
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule.",
        "With Data Retention Policies, prefer measured, reversible changes.",
        "Data Retention Policies"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Data Retention Policies within capacity planning and database maintenance. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Data Retention Policies fits”?",
      "options": [
        "Online, low impact",
        "Data and log capacity are planned separately.",
        "No benefit"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Data and log capacity are planned separately. Data grows with retained rows and index size; log growth depends on the recovery model, transaction size and backup frequency. Each needs its own trend and headroom.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Data Retention Policies in practice”?",
      "options": [
        "Disk, CPU and memory capacity must account for peak load and for maintenance operations such as index rebuilds, which temporarily need significant free space and memory.",
        "Bulk loads",
        "Long transactions"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Disk, CPU and memory capacity must account for peak load and for maintenance operations such as index rebuilds, which temporarily need significant free space and memory. A full disk during a rebuild is a self-inflicted outage.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Data Retention Policies”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Index maintenance is nuanced: rebuilding every index weekly is often wasteful.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Data Retention Policies. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Data Retention Policies",
        "Statistics maintenance ensures the optimiser has current data distributions.",
        "Rebuild structure and stats"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Statistics maintenance ensures the optimiser has current data distributions. Auto-update helps but large, rapidly changing tables may need scheduled explicit updates with an appropriate sample.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Data Retention Policies means”?",
      "options": [
        "Maintenance windows must be negotiated and respected.",
        "Data and log capacity are planned separately.",
        "The diagram below places Data Retention Policies alongside the core concepts of capacity planning and database maintenance."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Maintenance windows must be negotiated and respected. Every task should have an impact analysis, a rollback plan and monitoring so overruns are detected before business hours.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Data Retention Policies fits”?",
      "options": [
        "Maintenance windows must be negotiated and respected.",
        "Capacity planning predicts when resources will run out so you can act on your terms, not during an incident.",
        "The diagram below places Data Retention Policies alongside the core concepts of capacity planning and database maintenance."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Data Retention Policies alongside the core concepts of capacity planning and database maintenance. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Data Retention Policies in practice”?",
      "options": [
        "Data Retention Policies is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "The following comparison captures the distinctions that matter most when working with Data Retention Policies:",
        "Capacity planning predicts when resources will run out so you can act on your terms, not during an incident."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Data Retention Policies:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Data Retention Policies”?",
      "options": [
        "The first example establishes the relevant state.",
        "Data Retention Policies is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Data and log capacity are planned separately."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Data and log capacity are planned separately.",
        "The diagram below places Data Retention Policies alongside the core concepts of capacity planning and database maintenance.",
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule. Partitioning can make both operations efficient by switching whole partitions.”"
    }
  ],
  takeaways: [
    "Data Retention Policies is a fundamental concept in capacity planning and database maintenance",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Data Retention Policies improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
