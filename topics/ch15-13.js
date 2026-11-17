/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch15-13.html */

window.TOPIC = {
  id: "ch15-13",
  title: "Backup Retention Management",

  lead: "Backup Retention Management is a core part of capacity planning and database maintenance. This topic explains what it is, how it works inside SQL Server, and what a production DBA must know to operate it safely.",

  objectives: [
    "Define what Backup Retention Management is and where it fits",
    "Explain how Backup Retention Management works internally",
    "Apply Backup Retention Management correctly in a production environment",
    "Recognise the common mistakes and risks involving Backup Retention Management",
    "Monitor and troubleshoot Backup Retention Management with the right tools"
  ],

  sections: [
    {
      h: "What Backup Retention Management means",
      html: `
<p>In this topic we examine <strong>Backup Retention Management</strong> within capacity planning and database maintenance. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Index maintenance is nuanced: rebuilding every index weekly is often wasteful. Use fragmentation and page-count thresholds to choose REORGANIZE for lightly fragmented indexes and REBUILD only where justified, and remember that rebuilds update statistics.</p>
<p>Statistics maintenance ensures the optimiser has current data distributions. Auto-update helps but large, rapidly changing tables may need scheduled explicit updates with an appropriate sample.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Backup Retention Management is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Backup Retention Management fits",
      html: `
<p>Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule. Partitioning can make both operations efficient by switching whole partitions.</p>
<p>The diagram below places Backup Retention Management alongside the core concepts of capacity planning and database maintenance. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Backup Retention Management concept map">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="280" y="140" width="200" height="60" rx="9" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="175" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Backup Retention Management</text>
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
  <div class="figcaption">Figure 1 — Capacity planning and database maintenance: how Backup Retention Management relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Backup Retention Management in practice",
      html: `
<p>Maintenance windows must be negotiated and respected. Every task should have an impact analysis, a rollback plan and monitoring so overruns are detected before business hours.</p>
<p>The following comparison captures the distinctions that matter most when working with Backup Retention Management:</p>
<table>
  <tr><th>Resource</th><th>Plan for</th><th>Common surprise</th></tr>
  <tr><td>Data files</td><td>Row growth + indexes + headroom</td><td>Bulk loads</td></tr>
  <tr><td>Log</td><td>Transaction size / backup frequency</td><td>Long transactions</td></tr>
  <tr><td>Disk</td><td>Peak + maintenance free space</td><td>Rebuild needing 1.5x space</td></tr>
</table>
<p>Capacity planning predicts when resources will run out so you can act on your terms, not during an incident. It combines historical growth trends, known upcoming changes and a safety margin.</p>
      `,
    },
    {
      h: "Working with Backup Retention Management",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Backup Retention Management. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Backup Retention Management
-- Data file growth history from default trace / file stats
SELECT database_id, file_id,
       size / 128 AS size_mb
FROM   sys.dm_io_virtual_file_stats(NULL, NULL);</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Backup Retention Management
-- Fragmented indexes above 10% and 1000 pages
SELECT OBJECT_NAME(s.object_id) AS table_name, i.name AS index_name,
       s.avg_fragmentation_in_percent, s.page_count
FROM   sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') s
JOIN   sys.indexes i ON i.object_id=s.object_id AND i.index_id=s.index_id
WHERE  s.avg_fragmentation_in_percent > 10 AND s.page_count > 1000
ORDER BY s.avg_fragmentation_in_percent DESC;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Backup Retention Management
-- Project daily growth: compare two snapshots
-- Store daily size_mb in a table, then:
SELECT database_name,
       AVG(size_mb - prev_size_mb) AS avg_daily_growth_mb
FROM   dbo.DailySizeSnapshot
GROUP BY database_name;</code></pre>
<p>Data and log capacity are planned separately. Data grows with retained rows and index size; log growth depends on the recovery model, transaction size and backup frequency. Each needs its own trend and headroom.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Disk, CPU and memory capacity must account for peak load and for maintenance operations such as index rebuilds, which temporarily need significant free space and memory. A full disk during a rebuild is a self-inflicted outage.</p>
<table>
  <tr><th>Fragmentation</th><th>Action</th><th>Reason</th></tr>
  <tr><td>< 10%</td><td>Leave alone</td><td>No benefit</td></tr>
  <tr><td>10-30%</td><td>REORGANIZE</td><td>Online, low impact</td></tr>
  <tr><td>> 30%</td><td>REBUILD</td><td>Rebuild structure and stats</td></tr>
</table>
<p>A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping. Each task has a window, a duration and an impact.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Backup Retention Management, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    }
  ],

  scenario: {
    title: "The rebuild that filled the disk",
    html: `
A weekly 'rebuild everything' job ran out of space on a volume holding a 400 GB database, leaving a partially rebuilt index and an angry morning shift. The DBA replaced blanket rebuilds with threshold-based maintenance, monitored free space against the largest index and moved heavy rebuilds to a window with headroom.
<p><strong>The Backup Retention Management lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
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
        "Next, verify the result and capture a baseline.",
        "Data and log capacity are planned separately.",
        "Backup Retention Management"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Backup Retention Management within capacity planning and database maintenance. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Backup Retention Management fits”?",
      "options": [
        "A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping.",
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule.",
        "Disk, CPU and memory capacity must account for peak load and for maintenance operations such as index rebuilds, which temporarily need significant free space and memory."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule. Partitioning can make both operations efficient by switching whole partitions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Backup Retention Management in practice”?",
      "options": [
        "Maintenance windows must be negotiated and respected.",
        "Rebuild structure and stats",
        "The following comparison captures the distinctions that matter most when working with Backup Retention Management:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Maintenance windows must be negotiated and respected. Every task should have an impact analysis, a rollback plan and monitoring so overruns are detected before business hours.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Backup Retention Management”?",
      "options": [
        "Online, low impact",
        "Rebuild structure and stats",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Backup Retention Management. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "No benefit",
        "Disk, CPU and memory capacity must account for peak load and for maintenance operations such as index rebuilds, which temporarily need significant free space and memory.",
        "With Backup Retention Management, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Disk, CPU and memory capacity must account for peak load and for maintenance operations such as index rebuilds, which temporarily need significant free space and memory. A full disk during a rebuild is a self-inflicted outage.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Backup Retention Management means”?",
      "options": [
        "Index maintenance is nuanced: rebuilding every index weekly is often wasteful.",
        "Backup Retention Management",
        "Statistics maintenance ensures the optimiser has current data distributions."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Index maintenance is nuanced: rebuilding every index weekly is often wasteful. Use fragmentation and page-count thresholds to choose REORGANIZE for lightly fragmented indexes and REBUILD only where justified, and remember that rebuilds update statistics.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Backup Retention Management fits”?",
      "options": [
        "Rebuild structure and stats",
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule.",
        "The diagram below places Backup Retention Management alongside the core concepts of capacity planning and database maintenance."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Backup Retention Management alongside the core concepts of capacity planning and database maintenance. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Backup Retention Management in practice”?",
      "options": [
        "Backup Retention Management",
        "The following comparison captures the distinctions that matter most when working with Backup Retention Management:",
        "Rebuild needing 1.5x space"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Backup Retention Management:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Backup Retention Management”?",
      "options": [
        "The first example establishes the relevant state.",
        "Backup Retention Management",
        "Index maintenance is nuanced: rebuilding every index weekly is often wasteful."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Index maintenance is nuanced: rebuilding every index weekly is often wasteful.",
        "Statistics maintenance ensures the optimiser has current data distributions.",
        "A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping. Each task has a window, a duration and an impact.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within capacity planning and database maintenance.”",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Data and log capacity are planned separately.",
        "Backup Retention Management"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Backup Retention Management within capacity planning and database maintenance. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Backup Retention Management fits”?",
      "options": [
        "A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping.",
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule.",
        "Disk, CPU and memory capacity must account for peak load and for maintenance operations such as index rebuilds, which temporarily need significant free space and memory."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule. Partitioning can make both operations efficient by switching whole partitions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Backup Retention Management in practice”?",
      "options": [
        "Maintenance windows must be negotiated and respected.",
        "Rebuild structure and stats",
        "The following comparison captures the distinctions that matter most when working with Backup Retention Management:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Maintenance windows must be negotiated and respected. Every task should have an impact analysis, a rollback plan and monitoring so overruns are detected before business hours.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Backup Retention Management”?",
      "options": [
        "Online, low impact",
        "Rebuild structure and stats",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Backup Retention Management. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "No benefit",
        "Disk, CPU and memory capacity must account for peak load and for maintenance operations such as index rebuilds, which temporarily need significant free space and memory.",
        "With Backup Retention Management, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Disk, CPU and memory capacity must account for peak load and for maintenance operations such as index rebuilds, which temporarily need significant free space and memory. A full disk during a rebuild is a self-inflicted outage.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Backup Retention Management means”?",
      "options": [
        "Index maintenance is nuanced: rebuilding every index weekly is often wasteful.",
        "Backup Retention Management",
        "Statistics maintenance ensures the optimiser has current data distributions."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Index maintenance is nuanced: rebuilding every index weekly is often wasteful. Use fragmentation and page-count thresholds to choose REORGANIZE for lightly fragmented indexes and REBUILD only where justified, and remember that rebuilds update statistics.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Backup Retention Management fits”?",
      "options": [
        "Rebuild structure and stats",
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule.",
        "The diagram below places Backup Retention Management alongside the core concepts of capacity planning and database maintenance."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Backup Retention Management alongside the core concepts of capacity planning and database maintenance. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Backup Retention Management in practice”?",
      "options": [
        "Backup Retention Management",
        "The following comparison captures the distinctions that matter most when working with Backup Retention Management:",
        "Rebuild needing 1.5x space"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Backup Retention Management:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Backup Retention Management”?",
      "options": [
        "The first example establishes the relevant state.",
        "Backup Retention Management",
        "Index maintenance is nuanced: rebuilding every index weekly is often wasteful."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Index maintenance is nuanced: rebuilding every index weekly is often wasteful.",
        "Statistics maintenance ensures the optimiser has current data distributions.",
        "A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping. Each task has a window, a duration and an impact.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within capacity planning and database maintenance.”",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Data and log capacity are planned separately.",
        "Backup Retention Management"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Backup Retention Management within capacity planning and database maintenance. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Backup Retention Management fits”?",
      "options": [
        "A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping.",
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule.",
        "Disk, CPU and memory capacity must account for peak load and for maintenance operations such as index rebuilds, which temporarily need significant free space and memory."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule. Partitioning can make both operations efficient by switching whole partitions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Backup Retention Management in practice”?",
      "options": [
        "Maintenance windows must be negotiated and respected.",
        "Rebuild structure and stats",
        "The following comparison captures the distinctions that matter most when working with Backup Retention Management:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Maintenance windows must be negotiated and respected. Every task should have an impact analysis, a rollback plan and monitoring so overruns are detected before business hours.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Backup Retention Management”?",
      "options": [
        "Online, low impact",
        "Rebuild structure and stats",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Backup Retention Management. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "No benefit",
        "Disk, CPU and memory capacity must account for peak load and for maintenance operations such as index rebuilds, which temporarily need significant free space and memory.",
        "With Backup Retention Management, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Disk, CPU and memory capacity must account for peak load and for maintenance operations such as index rebuilds, which temporarily need significant free space and memory. A full disk during a rebuild is a self-inflicted outage.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Backup Retention Management means”?",
      "options": [
        "Index maintenance is nuanced: rebuilding every index weekly is often wasteful.",
        "Backup Retention Management",
        "Statistics maintenance ensures the optimiser has current data distributions."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Index maintenance is nuanced: rebuilding every index weekly is often wasteful. Use fragmentation and page-count thresholds to choose REORGANIZE for lightly fragmented indexes and REBUILD only where justified, and remember that rebuilds update statistics.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Backup Retention Management fits”?",
      "options": [
        "Rebuild structure and stats",
        "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule.",
        "The diagram below places Backup Retention Management alongside the core concepts of capacity planning and database maintenance."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Backup Retention Management alongside the core concepts of capacity planning and database maintenance. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Backup Retention Management in practice”?",
      "options": [
        "Backup Retention Management",
        "The following comparison captures the distinctions that matter most when working with Backup Retention Management:",
        "Rebuild needing 1.5x space"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Backup Retention Management:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Backup Retention Management”?",
      "options": [
        "The first example establishes the relevant state.",
        "Backup Retention Management",
        "Index maintenance is nuanced: rebuilding every index weekly is often wasteful."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Index maintenance is nuanced: rebuilding every index weekly is often wasteful.",
        "Statistics maintenance ensures the optimiser has current data distributions.",
        "A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping. Each task has a window, a duration and an impact.”"
    }
  ],
  takeaways: [
    "Backup Retention Management is a fundamental concept in capacity planning and database maintenance",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Backup Retention Management improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
