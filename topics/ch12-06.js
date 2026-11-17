/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch12-06.html */

window.TOPIC = {
  id: "ch12-06",
  title: "Clustered Indexes",

  lead: "This topic covers Clustered Indexes — a concept you will meet repeatedly when working with SQL Server performance tuning. We build from first principles to production guidance.",

  objectives: [
    "Define what Clustered Indexes is and where it fits",
    "Explain how Clustered Indexes works internally",
    "Apply Clustered Indexes correctly in a production environment",
    "Recognise the common mistakes and risks involving Clustered Indexes",
    "Monitor and troubleshoot Clustered Indexes with the right tools"
  ],

  sections: [
    {
      h: "What Clustered Indexes means",
      html: `
<p>In this topic we examine <strong>Clustered Indexes</strong> within SQL Server performance tuning. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Parameter sniffing occurs when a plan is compiled for one parameter value and reused for others with very different selectivity, causing intermittent slowness. Options include OPTIMIZE FOR, RECOMPILE or parameterisation strategies, each with trade-offs.</p>
<p>Query Store captures query text, plans and runtime statistics over time, making plan regressions visible and allowing a good plan to be forced while the root cause is fixed.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Clustered Indexes is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Clustered Indexes fits",
      html: `
<p>Missing index suggestions are hints, not commands. Validate them against workload, existing indexes and write overhead before implementing — blindly adding every suggested index degrades writes and storage.</p>
<p>The diagram below places Clustered Indexes alongside the core concepts of SQL Server performance tuning. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Clustered Indexes layers">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="70" y="8" width="620" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="30" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Execution plan</text>
    <text x="380" y="50" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 1</text>
    <rect x="100" y="62" width="560" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="84" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Index</text>
    <text x="380" y="104" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 2</text>
    <rect x="130" y="116" width="500" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="138" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Statistics</text>
    <text x="380" y="158" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 3</text>
    <rect x="160" y="170" width="440" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="192" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">SARGable</text>
    <text x="380" y="212" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 4</text>
    <rect x="190" y="224" width="380" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="246" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Wait</text>
    <text x="380" y="266" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 5</text>
    <rect x="220" y="278" width="320" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="300" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Query Store</text>
    <text x="380" y="320" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 6</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Clustered Indexes</text>
  </svg>
  <div class="figcaption">Figure 1 — SQL Server performance tuning: how Clustered Indexes relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Clustered Indexes in practice",
      html: `
<p>Performance tuning is a measurement discipline: establish a baseline, identify the dominant bottleneck, make one change, measure again. Tuning without measurement is guesswork and often makes things worse.</p>
<p>The following comparison captures the distinctions that matter most when working with Clustered Indexes:</p>
<table>
  <tr><th>Access method</th><th>Meaning</th><th>When desirable</th></tr>
  <tr><td>Seek</td><td>Navigate an index to matching rows</td><td>Selective lookups</td></tr>
  <tr><td>Scan</td><td>Read all rows</td><td>Small tables / no usable index</td></tr>
  <tr><td>Lookup</td><td>Fetch base row from a nonclustered index</td><td>Avoid at scale via covering indexes</td></tr>
</table>
<p>An execution plan is the roadmap the optimiser produces for a query. Reading actual plans reveals join order, access methods (seek versus scan), implicit conversions and expensive operators such as sorts and key lookups.</p>
      `,
    },
    {
      h: "Working with Clustered Indexes",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Clustered Indexes. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Clustered Indexes
-- Most expensive queries by average elapsed time
SELECT TOP 20
  qs.total_elapsed_time / qs.execution_count / 1000 AS avg_ms,
  qs.execution_count,
  SUBSTRING(st.text, (qs.statement_start_offset/2)+1,
    ((CASE qs.statement_end_offset WHEN -1
       THEN DATALENGTH(st.text)
       ELSE qs.statement_end_offset END - qs.statement_start_offset)/2)+1) AS statement
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
ORDER BY avg_ms DESC;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Clustered Indexes
-- Index usage: find unused and heavily used indexes
SELECT OBJECT_NAME(i.object_id) AS table_name, i.name AS index_name,
       s.user_seeks, s.user_scans, s.user_lookups, s.user_updates
FROM   sys.indexes i
LEFT JOIN sys.dm_db_index_usage_stats s
       ON s.object_id = i.object_id AND s.index_id = i.index_id
WHERE  i.object_id > 100
ORDER BY s.user_updates DESC;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Clustered Indexes
UPDATE STATISTICS dbo.Orders WITH FULLSCAN;</code></pre>
<p>Clustered indexes define the physical order of a table; nonclustered indexes are separate ordered structures pointing back to the row. Composite indexes order by multiple columns, and included columns can make an index covering so the base table need not be touched.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Statistics describe data distribution and drive cardinality estimates. Stale statistics lead to bad plans; updating them is often the cheapest and fastest performance fix available.</p>
<table>
  <tr><th>Symptom</th><th>Likely cause</th><th>First check</th></tr>
  <tr><td>Slow read</td><td>Missing index / stale stats</td><td>Actual plan</td></tr>
  <tr><td>High CPU</td><td>Sorts / scans / compilation</td><td>Query stats</td></tr>
  <tr><td>I/O waits</td><td>Cache pressure / scans</td><td>Page life expectancy</td></tr>
</table>
<p>SARGable predicates — simple comparisons against a bare column — allow index seeks. Wrapping a column in a function or applying a leading wildcard forces scans. Rewriting predicates is frequently more effective than adding hardware.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Clustered Indexes, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Clustered Indexes",
      html: `
<p>This section consolidates <strong>Clustered Indexes</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Performance tuning is a measurement discipline: establish a baseline, identify the dominant bottleneck, make one change, measure again. Tuning without measurement is guesswork and often makes things worse.</p>
<p>An execution plan is the roadmap the optimiser produces for a query. Reading actual plans reveals join order, access methods (seek versus scan), implicit conversions and expensive operators such as sorts and key lookups.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Clustered Indexes sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Symptom</th><th>Likely cause</th><th>First check</th></tr>
  <tr><td>Slow read</td><td>Missing index / stale stats</td><td>Actual plan</td></tr>
  <tr><td>High CPU</td><td>Sorts / scans / compilation</td><td>Query stats</td></tr>
  <tr><td>I/O waits</td><td>Cache pressure / scans</td><td>Page life expectancy</td></tr>
</table>
<p>Clustered indexes define the physical order of a table; nonclustered indexes are separate ordered structures pointing back to the row. Composite indexes order by multiple columns, and included columns can make an index covering so the base table need not be touched.</p>
<p>Use the following as a starting point when investigating Clustered Indexes. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Clustered Indexes
-- Index usage: find unused and heavily used indexes
SELECT OBJECT_NAME(i.object_id) AS table_name, i.name AS index_name,
       s.user_seeks, s.user_scans, s.user_lookups, s.user_updates
FROM   sys.indexes i
LEFT JOIN sys.dm_db_index_usage_stats s
       ON s.object_id = i.object_id AND s.index_id = i.index_id
WHERE  i.object_id > 100
ORDER BY s.user_updates DESC;</code></pre>
<p>Statistics describe data distribution and drive cardinality estimates. Stale statistics lead to bad plans; updating them is often the cheapest and fastest performance fix available.</p>
      `,
    }
  ],

  scenario: {
    title: "Parameter sniffing after a statistics update",
    html: `
A stored procedure became slow for some customers after an auto-update of statistics produced a plan tuned to an outlier value. Using OPTIMIZE FOR UNKNOWN on the problematic parameter, plus a targeted filtered index, stabilised performance. Plan regressions need evidence, which Query Store provides.
<p><strong>The Clustered Indexes lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "How would you investigate a suddenly slow query?",
      a: `
Compare its plan and runtime stats in Query Store, check for plan changes and statistics updates, look at waits, and examine whether data volume or parameters changed — then make one targeted change and remeasure.
      `,
    },
    {
      q: "What is the difference between a clustered and a nonclustered index?",
      a: `
A clustered index defines the table's physical row order and there is one per table; a nonclustered index is a separate ordered structure with pointers to the rows, and a table can have many.
      `,
    },
    {
      q: "What makes a query SARGable?",
      a: `
A predicate that compares a bare column to a constant or parameter with simple operators, allowing an index seek; functions or leading wildcards on the column usually prevent seeks.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server performance tuning.”",
      "options": [
        "Clustered Indexes",
        "The following comparison captures the distinctions that matter most when working with Clustered Indexes:",
        "An execution plan is the roadmap the optimiser produces for a query."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Clustered Indexes within SQL Server performance tuning. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Clustered Indexes fits”?",
      "options": [
        "Selective lookups",
        "Small tables / no usable index",
        "Missing index suggestions are hints, not commands."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Missing index suggestions are hints, not commands. Validate them against workload, existing indexes and write overhead before implementing — blindly adding every suggested index degrades writes and storage.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Clustered Indexes in practice”?",
      "options": [
        "Clustered indexes define the physical order of a table; nonclustered indexes are separate ordered structures pointing back to the row.",
        "Performance tuning is a measurement discipline: establish a baseline, identify the dominant bottleneck, make one change, measure again.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Performance tuning is a measurement discipline: establish a baseline, identify the dominant bottleneck, make one change, measure again. Tuning without measurement is guesswork and often makes things worse.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Clustered Indexes”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Selective lookups",
        "Small tables / no usable index"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Clustered Indexes. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Small tables / no usable index",
        "Avoid at scale via covering indexes",
        "Statistics describe data distribution and drive cardinality estimates."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Statistics describe data distribution and drive cardinality estimates. Stale statistics lead to bad plans; updating them is often the cheapest and fastest performance fix available.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The first example establishes the relevant state.",
        "Clustered Indexes",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Clustered Indexes with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Clustered Indexes means”?",
      "options": [
        "Parameter sniffing occurs when a plan is compiled for one parameter value and reused for others with very different selectivity, causing intermittent slowness.",
        "Statistics describe data distribution and drive cardinality estimates.",
        "SARGable predicates — simple comparisons against a bare column — allow index seeks."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Parameter sniffing occurs when a plan is compiled for one parameter value and reused for others with very different selectivity, causing intermittent slowness. Options include OPTIMIZE FOR, RECOMPILE or parameterisation strategies, each with trade-offs.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Clustered Indexes fits”?",
      "options": [
        "Clustered indexes define the physical order of a table; nonclustered indexes are separate ordered structures pointing back to the row.",
        "Statistics describe data distribution and drive cardinality estimates.",
        "The diagram below places Clustered Indexes alongside the core concepts of SQL Server performance tuning."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Clustered Indexes alongside the core concepts of SQL Server performance tuning. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Clustered Indexes in practice”?",
      "options": [
        "Page life expectancy",
        "The following comparison captures the distinctions that matter most when working with Clustered Indexes:",
        "Query stats"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Clustered Indexes:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Clustered Indexes”?",
      "options": [
        "The first example establishes the relevant state.",
        "Actual plan",
        "Query stats"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server performance tuning.”",
      "options": [
        "Clustered Indexes",
        "The following comparison captures the distinctions that matter most when working with Clustered Indexes:",
        "An execution plan is the roadmap the optimiser produces for a query."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Clustered Indexes within SQL Server performance tuning. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Clustered Indexes fits”?",
      "options": [
        "Selective lookups",
        "Small tables / no usable index",
        "Missing index suggestions are hints, not commands."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Missing index suggestions are hints, not commands. Validate them against workload, existing indexes and write overhead before implementing — blindly adding every suggested index degrades writes and storage.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Clustered Indexes in practice”?",
      "options": [
        "Clustered indexes define the physical order of a table; nonclustered indexes are separate ordered structures pointing back to the row.",
        "Performance tuning is a measurement discipline: establish a baseline, identify the dominant bottleneck, make one change, measure again.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Performance tuning is a measurement discipline: establish a baseline, identify the dominant bottleneck, make one change, measure again. Tuning without measurement is guesswork and often makes things worse.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Clustered Indexes”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Selective lookups",
        "Small tables / no usable index"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Clustered Indexes. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Small tables / no usable index",
        "Avoid at scale via covering indexes",
        "Statistics describe data distribution and drive cardinality estimates."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Statistics describe data distribution and drive cardinality estimates. Stale statistics lead to bad plans; updating them is often the cheapest and fastest performance fix available.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The first example establishes the relevant state.",
        "Clustered Indexes",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Clustered Indexes with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Clustered Indexes means”?",
      "options": [
        "Parameter sniffing occurs when a plan is compiled for one parameter value and reused for others with very different selectivity, causing intermittent slowness.",
        "Statistics describe data distribution and drive cardinality estimates.",
        "SARGable predicates — simple comparisons against a bare column — allow index seeks."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Parameter sniffing occurs when a plan is compiled for one parameter value and reused for others with very different selectivity, causing intermittent slowness. Options include OPTIMIZE FOR, RECOMPILE or parameterisation strategies, each with trade-offs.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Clustered Indexes fits”?",
      "options": [
        "Clustered indexes define the physical order of a table; nonclustered indexes are separate ordered structures pointing back to the row.",
        "Statistics describe data distribution and drive cardinality estimates.",
        "The diagram below places Clustered Indexes alongside the core concepts of SQL Server performance tuning."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Clustered Indexes alongside the core concepts of SQL Server performance tuning. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Clustered Indexes in practice”?",
      "options": [
        "Page life expectancy",
        "The following comparison captures the distinctions that matter most when working with Clustered Indexes:",
        "Query stats"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Clustered Indexes:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Clustered Indexes”?",
      "options": [
        "The first example establishes the relevant state.",
        "Actual plan",
        "Query stats"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server performance tuning.”",
      "options": [
        "Clustered Indexes",
        "The following comparison captures the distinctions that matter most when working with Clustered Indexes:",
        "An execution plan is the roadmap the optimiser produces for a query."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Clustered Indexes within SQL Server performance tuning. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Clustered Indexes fits”?",
      "options": [
        "Selective lookups",
        "Small tables / no usable index",
        "Missing index suggestions are hints, not commands."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Missing index suggestions are hints, not commands. Validate them against workload, existing indexes and write overhead before implementing — blindly adding every suggested index degrades writes and storage.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Clustered Indexes in practice”?",
      "options": [
        "Clustered indexes define the physical order of a table; nonclustered indexes are separate ordered structures pointing back to the row.",
        "Performance tuning is a measurement discipline: establish a baseline, identify the dominant bottleneck, make one change, measure again.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Performance tuning is a measurement discipline: establish a baseline, identify the dominant bottleneck, make one change, measure again. Tuning without measurement is guesswork and often makes things worse.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Clustered Indexes”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Selective lookups",
        "Small tables / no usable index"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Clustered Indexes. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Small tables / no usable index",
        "Avoid at scale via covering indexes",
        "Statistics describe data distribution and drive cardinality estimates."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Statistics describe data distribution and drive cardinality estimates. Stale statistics lead to bad plans; updating them is often the cheapest and fastest performance fix available.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The first example establishes the relevant state.",
        "Clustered Indexes",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Clustered Indexes with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Clustered Indexes means”?",
      "options": [
        "Parameter sniffing occurs when a plan is compiled for one parameter value and reused for others with very different selectivity, causing intermittent slowness.",
        "Statistics describe data distribution and drive cardinality estimates.",
        "SARGable predicates — simple comparisons against a bare column — allow index seeks."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Parameter sniffing occurs when a plan is compiled for one parameter value and reused for others with very different selectivity, causing intermittent slowness. Options include OPTIMIZE FOR, RECOMPILE or parameterisation strategies, each with trade-offs.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Clustered Indexes fits”?",
      "options": [
        "Clustered indexes define the physical order of a table; nonclustered indexes are separate ordered structures pointing back to the row.",
        "Statistics describe data distribution and drive cardinality estimates.",
        "The diagram below places Clustered Indexes alongside the core concepts of SQL Server performance tuning."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Clustered Indexes alongside the core concepts of SQL Server performance tuning. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Clustered Indexes in practice”?",
      "options": [
        "Page life expectancy",
        "The following comparison captures the distinctions that matter most when working with Clustered Indexes:",
        "Query stats"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Clustered Indexes:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Clustered Indexes”?",
      "options": [
        "The first example establishes the relevant state.",
        "Actual plan",
        "Query stats"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Clustered Indexes is a fundamental concept in SQL Server performance tuning",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Clustered Indexes improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
