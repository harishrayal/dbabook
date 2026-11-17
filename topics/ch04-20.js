/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch04-20.html */

window.TOPIC = {
  id: "ch04-20",
  title: "Log Sequence Numbers (LSNs)",

  lead: "Understanding Log Sequence Numbers (LSNs) is essential for anyone responsible for SQL Server internal architecture. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what Log Sequence Numbers (LSNs) is and where it fits",
    "Explain how Log Sequence Numbers (LSNs) works internally",
    "Apply Log Sequence Numbers (LSNs) correctly in a production environment",
    "Recognise the common mistakes and risks involving Log Sequence Numbers (LSNs)",
    "Monitor and troubleshoot Log Sequence Numbers (LSNs) with the right tools"
  ],

  sections: [
    {
      h: "What Log Sequence Numbers (LSNs) means",
      html: `
<p>In this topic we examine <strong>Log Sequence Numbers (LSNs)</strong> within SQL Server internal architecture. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Write-ahead logging guarantees the log record for a change reaches disk before the data page. A committed transaction's log is durable even if the data page is not yet written, which is what makes crash recovery possible.</p>
<p>The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs). Truncation marks inactive VLFs reusable; it does not shrink the physical file. Frequent small autogrowths create VLF explosion and slow recovery.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Log Sequence Numbers (LSNs) is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Log Sequence Numbers (LSNs) fits",
      html: `
<p>Crash recovery has three phases: analysis determines the state at the last checkpoint, redo replays committed transactions, and undo rolls back uncommitted ones. The database is brought to a consistent state automatically at startup.</p>
<p>The diagram below places Log Sequence Numbers (LSNs) alongside the core concepts of SQL Server internal architecture. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Log Sequence Numbers (LSNs) flow">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="230" y="12" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="39" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Page</text>
    <rect x="230" y="66" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="93" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Extent</text>
    <rect x="230" y="120" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="147" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Buffer</text>
    <rect x="230" y="174" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="201" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Log</text>
    <rect x="230" y="228" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="255" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Checkpoint</text>
    <rect x="230" y="282" width="300" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="309" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">6. Recovery</text>
    <line x1="380" y1="56" x2="380" y2="66" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="110" x2="380" y2="120" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="164" x2="380" y2="174" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="218" x2="380" y2="228" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="272" x2="380" y2="282" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Log Sequence Numbers (LSNs)</text>
  </svg>
  <div class="figcaption">Figure 1 — SQL Server internal architecture: how Log Sequence Numbers (LSNs) relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Log Sequence Numbers (LSNs) in practice",
      html: `
<p>The relational engine parses, compiles and executes queries. Plans are cached and reused; parameterisation and the plan cache are central to understanding consistent versus intermittent performance.</p>
<p>The following comparison captures the distinctions that matter most when working with Log Sequence Numbers (LSNs):</p>
<table>
  <tr><th>Structure</th><th>Size</th><th>Role</th></tr>
  <tr><td>Page</td><td>8 KB</td><td>Unit of data I/O</td></tr>
  <tr><td>Extent</td><td>64 KB (8 pages)</td><td>Allocation unit</td></tr>
  <tr><td>VLF</td><td>Variable</td><td>Log truncation unit</td></tr>
</table>
<p>Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too many VLFs.</p>
      `,
    },
    {
      h: "Working with Log Sequence Numbers (LSNs)",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Log Sequence Numbers (LSNs). Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Log Sequence Numbers (LSNs)
-- Buffer pool usage per database
SELECT db_name(database_id) AS db,
       count(*) * 8 / 1024 AS buffer_mb
FROM   sys.dm_os_buffer_descriptors
GROUP BY database_id
ORDER BY buffer_mb DESC;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Log Sequence Numbers (LSNs)
-- Transaction log space usage
SELECT total_log_size_in_bytes / 1048576.0 AS total_mb,
       used_log_space_in_bytes / 1048576.0 AS used_mb,
       used_log_space_in_percent AS used_pct
FROM   sys.dm_db_log_space_usage;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Log Sequence Numbers (LSNs)
-- VLF count per database (a high count hurts recovery)
SELECT db_name(database_id) AS db,
       count(*) AS vlf_count
FROM   sys.dm_db_log_info(NULL)
GROUP BY database_id
ORDER BY vlf_count DESC;</code></pre>
<p>SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O. Eight pages form an extent. Data and index pages live in MDF/NDF files; the transaction log is a separate sequential structure of virtual log files.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>The buffer pool caches pages in memory. A read that finds a page in the pool is served from RAM in microseconds; a miss requires a physical read milliseconds long. This is why memory sizing dominates performance.</p>
<table>
  <tr><th>Mechanism</th><th>Trigger</th><th>Effect</th></tr>
  <tr><td>Checkpoint</td><td>Periodic / log volume</td><td>Flush dirty pages, bound recovery</td></tr>
  <tr><td>Lazy writer</td><td>Memory pressure</td><td>Evict clean pages</td></tr>
  <tr><td>Write-ahead log</td><td>Every modification</td><td>Log durable before data</td></tr>
</table>
<p>Pages in the buffer pool are clean if they match disk, dirty if modified. Checkpoints write dirty pages to disk to bound recovery time; the lazy writer evicts pages under memory pressure, flushing dirty pages first.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Log Sequence Numbers (LSNs), prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Log Sequence Numbers (LSNs)",
      html: `
<p>This section consolidates <strong>Log Sequence Numbers (LSNs)</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>The relational engine parses, compiles and executes queries. Plans are cached and reused; parameterisation and the plan cache are central to understanding consistent versus intermittent performance.</p>
<p>Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too many VLFs.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Log Sequence Numbers (LSNs) sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Mechanism</th><th>Trigger</th><th>Effect</th></tr>
  <tr><td>Checkpoint</td><td>Periodic / log volume</td><td>Flush dirty pages, bound recovery</td></tr>
  <tr><td>Lazy writer</td><td>Memory pressure</td><td>Evict clean pages</td></tr>
  <tr><td>Write-ahead log</td><td>Every modification</td><td>Log durable before data</td></tr>
</table>
<p>SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O. Eight pages form an extent. Data and index pages live in MDF/NDF files; the transaction log is a separate sequential structure of virtual log files.</p>
<p>Use the following as a starting point when investigating Log Sequence Numbers (LSNs). Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Log Sequence Numbers (LSNs)
-- Buffer pool usage per database
SELECT db_name(database_id) AS db,
       count(*) * 8 / 1024 AS buffer_mb
FROM   sys.dm_os_buffer_descriptors
GROUP BY database_id
ORDER BY buffer_mb DESC;</code></pre>
<p>The buffer pool caches pages in memory. A read that finds a page in the pool is served from RAM in microseconds; a miss requires a physical read milliseconds long. This is why memory sizing dominates performance.</p>
      `,
    }
  ],

  scenario: {
    title: "PLE collapsed after a report went live",
    html: `
A new unbounded report pulled millions of cold pages into the buffer pool, evicting hot OLTP pages. Page life expectancy fell from 4,200 to under 30 seconds and applications slowed despite idle CPU. The DBA killed the report, added date predicates and an indexed view, and capped reporting with Resource Governor.
<p><strong>The Log Sequence Numbers (LSNs) lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "Explain write-ahead logging.",
      a: `
The log record describing a change is written to disk before the modified data page. This guarantees committed transactions are recoverable after a crash, becauseredo can replay the log.
      `,
    },
    {
      q: "Why is a huge VLF count a problem?",
      a: `
Recovery must process every VLF during analysis and redo, so thousands of small VLFs dramatically lengthen recovery and slow log operations; pre-size logs in large increments to avoid VLF explosion.
      `,
    },
    {
      q: "What is a page and an extent?",
      a: `
A page is an 8 KB unit of data storage and I/O; an extent is eight contiguous pages (64 KB), the unit SQL Server uses to allocate space to objects.
      `,
    }
  ],

  takeaways: [
    "Log Sequence Numbers (LSNs) is a fundamental concept in SQL Server internal architecture",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Log Sequence Numbers (LSNs) improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
