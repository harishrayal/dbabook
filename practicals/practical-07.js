/* Practical content file — one JS file per practical lab.
   Rendered by assets/js/site.js on practicals/practical-07.html */

window.TOPIC = {
  id: "practical-07",
  title: "Performance",

  lead: "A hands-on performance lab: capture execution plans, add indexes, update statistics, rewrite a non-SARGable predicate and use Query Store to observe a plan before and after a change.",

  objectives: [
    "Read actual execution plans to find expensive operators",
    "Create an index that removes a costly scan",
    "Measure the effect of stale statistics",
    "Rewrite a predicate to be SARGable",
    "Use Query Store to compare plans over time"
  ],

  sections: [
    {
      h: "Before you start",
      html: `
<p>This lab teaches performance tuning as a measurement loop: baseline, identify, change one thing, measure again. Guessing is not tuning.</p>
<p>Use a local instance with a scratch database large enough to produce meaningful plans — a few hundred thousand rows is plenty. Enable the actual execution plan in SSMS (Ctrl+M) as you work.</p>
<p><strong>Environment check</strong> — confirm where you are before changing anything; this habit prevents production mistakes:</p>
<pre><code class="language-sql">-- Lab step
-- Baseline: turn on measurement, then run the query
SET STATISTICS IO ON;
SET STATISTICS TIME ON;
GO
-- Non-SARGable: function on the column forces a scan
SELECT *
FROM   dbo.BigOrders
WHERE  YEAR(OrderDate) = 2026;
GO
-- SARGable range predicate allows an index seek
SELECT *
FROM   dbo.BigOrders
WHERE  OrderDate >= '20260101'
  AND  OrderDate <  '20270101';
GO</code></pre>
      `,
    },
    {
      h: "Lab architecture",
      html: `
<p>An execution plan is the optimiser's roadmap. Actual plans show row counts and expensive operators such as scans, sorts and key lookups — the evidence you need before changing anything.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Performance tuning loop">
    <defs>
      <marker id="pa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="200" y="10" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="31" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Capture baseline (IO / time)</text>
    <line x1="380" y1="54" x2="380" y2="64" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="64" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="85" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Read actual execution plan</text>
    <line x1="380" y1="108" x2="380" y2="118" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="118" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="139" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Make one targeted change</text>
    <line x1="380" y1="162" x2="380" y2="172" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="172" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="193" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Re-measure and compare</text>
    <line x1="380" y1="216" x2="380" y2="226" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="226" width="360" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)"/>
    <text x="380" y="247" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Record result in Query Store</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Performance tuning loop</text>
  </svg>
  <div class="figcaption">Figure 1 — Baseline, inspect the plan, make one change, measure again — repeat with evidence.</div>
</div>
<p>Follow the loop below for each experiment: capture a baseline, inspect the plan, make one targeted change, then re-run and compare duration and reads with SET STATISTICS.</p>
      `,
    },
    {
      h: "Core tasks",
      html: `
<p>Load a table with deliberately inconvenient data and run a query filtering on a function-wrapped column, such as YEAR(OrderDate). Capture the plan — it will scan because the function prevents a seek.</p>
<table>
  <tr><th>Access method</th><th>Meaning</th><th>When desirable</th></tr>
  <tr><td>Seek</td><td>Navigate an index to matching rows</td><td>Selective lookups</td></tr>
  <tr><td>Scan</td><td>Read all rows</td><td>Small tables / no usable index</td></tr>
  <tr><td>Key lookup</td><td>Fetch base row via nonclustered index</td><td>Avoid at scale with covering indexes</td></tr>
</table>
<p>Rewrite the predicate as a range (OrderDate >= start AND OrderDate < end), confirm an index seek appears, and compare logical reads. This usually delivers the largest win in the whole lab.</p>
<pre><code class="language-sql">-- Lab step
-- Add a covering index with an included column
CREATE INDEX IX_BigOrders_OrderDate
ON dbo.BigOrders (OrderDate)
INCLUDE (CustomerID, Amount);
GO
-- Refresh statistics after large data changes
UPDATE STATISTICS dbo.BigOrders WITH FULLSCAN;
GO
-- Inspect index usage and fragmentation
SELECT i.name AS index_name, s.user_seeks, s.user_scans,
       s.user_updates
FROM   sys.indexes i
LEFT JOIN sys.dm_db_index_usage_stats s
  ON s.object_id = i.object_id AND s.index_id = i.index_id
WHERE  i.object_id = OBJECT_ID('dbo.BigOrders');
GO</code></pre>
      `,
    },
    {
      h: "Verify your work",
      html: `
<p>Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:</p>
<pre><code class="language-sql">-- Lab step
-- Enable Query Store to capture plans over time
ALTER DATABASE PerformanceLab
SET QUERY_STORE = ON
(
  OPERATION_MODE = READ_WRITE,
  MAX_STORAGE_SIZE_MB = 512
);
GO
-- Top queries by average duration from the plan cache
SELECT TOP 20
  qs.total_elapsed_time / qs.execution_count / 1000 AS avg_ms,
  qs.execution_count,
  SUBSTRING(st.text, (qs.statement_start_offset / 2) + 1,
    ((CASE qs.statement_end_offset WHEN -1
       THEN DATALENGTH(st.text)
       ELSE qs.statement_end_offset END
       - qs.statement_start_offset) / 2) + 1) AS statement
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
ORDER BY avg_ms DESC;
GO</code></pre>
<p>Create a nonclustered index and observe a lookup disappear when you add an included column to make the index covering. Then update statistics and note how estimates improve.</p>
<p>If the output differs, stop and correct it before moving on. A lab that 'looks right' but was never verified teaches the wrong lessons.</p>
      `,
    },
    {
      h: "Pitfalls and safe practice",
      html: `
<p>Enable Query Store on the database and re-run the queries; use its reports to see the queries, their plans and runtime stats over time — the tool that makes plan regressions visible in production.</p>
<table>
  <tr><th>Symptom</th><th>Likely cause</th><th>First check</th></tr>
  <tr><td>Slow read</td><td>Missing index or stale stats</td><td>Actual execution plan</td></tr>
  <tr><td>High CPU</td><td>Sorts, scans, recompiles</td><td>Query stats</td></tr>
  <tr><td>I/O waits</td><td>Cache pressure or scans</td><td>Page life expectancy</td></tr>
</table>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.</p>
</div>
      `,
    }
  ],

  steps: [
    "Create PerformanceLab and a dbo.BigOrders table with at least 200,000 rows and an OrderDate column spread across several years.",
    "Enable STATISTICS IO and TIME, run the YEAR(OrderDate) query and record logical reads and duration as the baseline.",
    "View the actual execution plan and confirm a table scan caused by the function on the column.",
    "Run the SARGable range version, view its plan and record the improvement in reads and duration.",
    "Create the covering index IX_BigOrders_OrderDate with included columns and re-run the query to see the lookup disappear.",
    "Update statistics with FULLSCAN and note how estimated versus actual row counts converge.",
    "Check sys.dm_db_index_usage_stats to confirm the index is being sought and not merely scanned.",
    "Enable Query Store and re-run the queries so their plans and runtime stats are captured.",
    "Use the Query Store reports to compare the before and after plans for the same query text.",
    "Write a short note recording baseline and final numbers — the habit of evidence-based tuning."
  ],

  scenario: {
    title: "The function that killed an index seek",
    html: `
A query filtered with WHERE YEAR(OrderDate) = 2026 on a 50-million-row table, forcing a full scan and taking roughly 40 seconds. Rewriting it as a date range restored an index seek and cut the query to under a second — without adding hardware. In a second case, parameter sniffing after a statistics update produced a plan tuned to an outlier value; Query Store made the regression visible and a targeted OPTIMIZE FOR hint stabilised it. Both fixes started with evidence, not intuition.
<p><strong>The lesson:</strong> practise both the diagnosis and the safe mitigation in this lab. Under pressure, the steps you have rehearsed are the steps you will actually take — build good muscle memory now.</p>
    `,
  },

  interview: [
    {
      q: "What is the difference between clustered and nonclustered indexes?",
      a: `
A clustered index defines the table's physical row order and there is one per table; a nonclustered index is a separate ordered structure with pointers to the rows, and a table can have many.
      `,
    },
    {
      q: "What makes a predicate SARGable?",
      a: `
A comparison of a bare column to a constant or parameter with simple operators, allowing an index seek; wrapping the column in a function or using a leading wildcard usually prevents seeks.
      `,
    },
    {
      q: "How would you investigate a suddenly slow query?",
      a: `
Compare its plan and runtime stats in Query Store, check for plan changes and statistics updates, look at waits, and examine whether data volume or parameters changed — then make one targeted change and remeasure.
      `,
    }
  ],

  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "Create a nonclustered index and observe a lookup disappear when you add an included column to make the index covering.",
        "This lab teaches performance tuning as a measurement loop: baseline, identify, change one thing, measure again."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “This lab teaches performance tuning as a measurement loop: baseline, identify, change one thing, measure again. Guessing is not tuning.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Create a nonclustered index and observe a lookup disappear when you add an included column to make the index covering.",
        "An execution plan is the optimiser's roadmap.",
        "Never assume a lab step worked — verify against the catalog views and DMVs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “An execution plan is the optimiser's roadmap. Actual plans show row counts and expensive operators such as scans, sorts and key lookups — the evidence you need before changing anything.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Load a table with deliberately inconvenient data and run a query filtering on a function-wrapped column, such as YEAR(OrderDate).",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "Actual execution plan"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Load a table with deliberately inconvenient data and run a query filtering on a function-wrapped column, such as YEAR(OrderDate). Capture the plan — it will scan because the function prevents a seek.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Enable Query Store on the database and re-run the queries; use its reports to see the queries, their plans and runtime stats over time — the tool that makes plan regressions…",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "Never assume a lab step worked — verify against the catalog views and DMVs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "If the output differs, stop and correct it before moving on.",
        "Enable Query Store on the database and re-run the queries; use its reports to see the queries, their plans and runtime stats over time — the tool that makes plan regressions…",
        "Create a nonclustered index and observe a lookup disappear when you add an included column to make the index covering."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Enable Query Store on the database and re-run the queries; use its reports to see the queries, their plans and runtime stats over time — the tool that makes plan regressions visible in production.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "Use a local instance with a scratch database large enough to produce meaningful plans — a few hundred thousand rows is plenty.",
        "Actual execution plan",
        "Query stats"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Use a local instance with a scratch database large enough to produce meaningful plans — a few hundred thousand rows is plenty. Enable the actual execution plan in SSMS (Ctrl+M) as you work.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Actual execution plan",
        "Query stats",
        "Follow the loop below for each experiment: capture a baseline, inspect the plan, make one targeted change, then re-run and compare duration and reads with SET STATISTICS."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Follow the loop below for each experiment: capture a baseline, inspect the plan, make one targeted change, then re-run and compare duration and reads with SET STATISTICS.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Small tables / no usable index",
        "Rewrite the predicate as a range (OrderDate >= start AND OrderDate < end), confirm an index seek appears, and compare logical reads.",
        "Selective lookups"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Rewrite the predicate as a range (OrderDate >= start AND OrderDate < end), confirm an index seek appears, and compare logical reads. This usually delivers the largest win in the whole lab.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Create a nonclustered index and observe a lookup disappear when you add an included column to make the index covering.",
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "If the output differs, stop and correct it before moving on."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Create a nonclustered index and observe a lookup disappear when you add an included column to make the index covering. Then update statistics and note how estimates improve.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Page life expectancy",
        "This lab teaches performance tuning as a measurement loop: baseline, identify, change one thing, measure again.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "Create a nonclustered index and observe a lookup disappear when you add an included column to make the index covering.",
        "This lab teaches performance tuning as a measurement loop: baseline, identify, change one thing, measure again."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “This lab teaches performance tuning as a measurement loop: baseline, identify, change one thing, measure again. Guessing is not tuning.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Create a nonclustered index and observe a lookup disappear when you add an included column to make the index covering.",
        "An execution plan is the optimiser's roadmap.",
        "Never assume a lab step worked — verify against the catalog views and DMVs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “An execution plan is the optimiser's roadmap. Actual plans show row counts and expensive operators such as scans, sorts and key lookups — the evidence you need before changing anything.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Load a table with deliberately inconvenient data and run a query filtering on a function-wrapped column, such as YEAR(OrderDate).",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "Actual execution plan"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Load a table with deliberately inconvenient data and run a query filtering on a function-wrapped column, such as YEAR(OrderDate). Capture the plan — it will scan because the function prevents a seek.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Enable Query Store on the database and re-run the queries; use its reports to see the queries, their plans and runtime stats over time — the tool that makes plan regressions…",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "Never assume a lab step worked — verify against the catalog views and DMVs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "If the output differs, stop and correct it before moving on.",
        "Enable Query Store on the database and re-run the queries; use its reports to see the queries, their plans and runtime stats over time — the tool that makes plan regressions…",
        "Create a nonclustered index and observe a lookup disappear when you add an included column to make the index covering."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Enable Query Store on the database and re-run the queries; use its reports to see the queries, their plans and runtime stats over time — the tool that makes plan regressions visible in production.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "Use a local instance with a scratch database large enough to produce meaningful plans — a few hundred thousand rows is plenty.",
        "Actual execution plan",
        "Query stats"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Use a local instance with a scratch database large enough to produce meaningful plans — a few hundred thousand rows is plenty. Enable the actual execution plan in SSMS (Ctrl+M) as you work.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Actual execution plan",
        "Query stats",
        "Follow the loop below for each experiment: capture a baseline, inspect the plan, make one targeted change, then re-run and compare duration and reads with SET STATISTICS."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Follow the loop below for each experiment: capture a baseline, inspect the plan, make one targeted change, then re-run and compare duration and reads with SET STATISTICS.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Small tables / no usable index",
        "Rewrite the predicate as a range (OrderDate >= start AND OrderDate < end), confirm an index seek appears, and compare logical reads.",
        "Selective lookups"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Rewrite the predicate as a range (OrderDate >= start AND OrderDate < end), confirm an index seek appears, and compare logical reads. This usually delivers the largest win in the whole lab.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Create a nonclustered index and observe a lookup disappear when you add an included column to make the index covering.",
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "If the output differs, stop and correct it before moving on."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Create a nonclustered index and observe a lookup disappear when you add an included column to make the index covering. Then update statistics and note how estimates improve.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Page life expectancy",
        "This lab teaches performance tuning as a measurement loop: baseline, identify, change one thing, measure again.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "Create a nonclustered index and observe a lookup disappear when you add an included column to make the index covering.",
        "This lab teaches performance tuning as a measurement loop: baseline, identify, change one thing, measure again."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “This lab teaches performance tuning as a measurement loop: baseline, identify, change one thing, measure again. Guessing is not tuning.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Create a nonclustered index and observe a lookup disappear when you add an included column to make the index covering.",
        "An execution plan is the optimiser's roadmap.",
        "Never assume a lab step worked — verify against the catalog views and DMVs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “An execution plan is the optimiser's roadmap. Actual plans show row counts and expensive operators such as scans, sorts and key lookups — the evidence you need before changing anything.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Load a table with deliberately inconvenient data and run a query filtering on a function-wrapped column, such as YEAR(OrderDate).",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "Actual execution plan"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Load a table with deliberately inconvenient data and run a query filtering on a function-wrapped column, such as YEAR(OrderDate). Capture the plan — it will scan because the function prevents a seek.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Enable Query Store on the database and re-run the queries; use its reports to see the queries, their plans and runtime stats over time — the tool that makes plan regressions…",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "Never assume a lab step worked — verify against the catalog views and DMVs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "If the output differs, stop and correct it before moving on.",
        "Enable Query Store on the database and re-run the queries; use its reports to see the queries, their plans and runtime stats over time — the tool that makes plan regressions…",
        "Create a nonclustered index and observe a lookup disappear when you add an included column to make the index covering."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Enable Query Store on the database and re-run the queries; use its reports to see the queries, their plans and runtime stats over time — the tool that makes plan regressions visible in production.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "Use a local instance with a scratch database large enough to produce meaningful plans — a few hundred thousand rows is plenty.",
        "Actual execution plan",
        "Query stats"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Use a local instance with a scratch database large enough to produce meaningful plans — a few hundred thousand rows is plenty. Enable the actual execution plan in SSMS (Ctrl+M) as you work.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Actual execution plan",
        "Query stats",
        "Follow the loop below for each experiment: capture a baseline, inspect the plan, make one targeted change, then re-run and compare duration and reads with SET STATISTICS."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Follow the loop below for each experiment: capture a baseline, inspect the plan, make one targeted change, then re-run and compare duration and reads with SET STATISTICS.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Small tables / no usable index",
        "Rewrite the predicate as a range (OrderDate >= start AND OrderDate < end), confirm an index seek appears, and compare logical reads.",
        "Selective lookups"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Rewrite the predicate as a range (OrderDate >= start AND OrderDate < end), confirm an index seek appears, and compare logical reads. This usually delivers the largest win in the whole lab.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Create a nonclustered index and observe a lookup disappear when you add an included column to make the index covering.",
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "If the output differs, stop and correct it before moving on."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Create a nonclustered index and observe a lookup disappear when you add an included column to make the index covering. Then update statistics and note how estimates improve.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Page life expectancy",
        "This lab teaches performance tuning as a measurement loop: baseline, identify, change one thing, measure again.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.”"
    }
  ],
  takeaways: [
    "Tune with a measurement loop: baseline, change one thing, measure again",
    "Functions on columns destroy SARGability — prefer range predicates",
    "Covering indexes remove expensive key lookups",
    "Stale statistics produce bad plans; updating them is cheap and fast",
    "Query Store makes plan regressions visible and reversible in production"
  ]
};
