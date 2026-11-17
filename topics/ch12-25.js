/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch12-25.html */

window.TOPIC = {
  id: "ch12-25",
  title: "Wait Statistics Analysis",

  lead: "Wait Statistics Analysis is a core part of SQL Server performance tuning. This topic explains what it is, how it works inside SQL Server, and what a production DBA must know to operate it safely.",

  objectives: [
    "Define what Wait Statistics Analysis is and where it fits",
    "Explain how Wait Statistics Analysis works internally",
    "Apply Wait Statistics Analysis correctly in a production environment",
    "Recognise the common mistakes and risks involving Wait Statistics Analysis",
    "Monitor and troubleshoot Wait Statistics Analysis with the right tools"
  ],

  sections: [
    {
      h: "What Wait Statistics Analysis means",
      html: `
<p>In this topic we examine <strong>Wait Statistics Analysis</strong> within SQL Server performance tuning. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Performance tuning is a measurement discipline: establish a baseline, identify the dominant bottleneck, make one change, measure again. Tuning without measurement is guesswork and often makes things worse.</p>
<p>An execution plan is the roadmap the optimiser produces for a query. Reading actual plans reveals join order, access methods (seek versus scan), implicit conversions and expensive operators such as sorts and key lookups.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Wait Statistics Analysis is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Wait Statistics Analysis fits",
      html: `
<p>Clustered indexes define the physical order of a table; nonclustered indexes are separate ordered structures pointing back to the row. Composite indexes order by multiple columns, and included columns can make an index covering so the base table need not be touched.</p>
<p>The diagram below places Wait Statistics Analysis alongside the core concepts of SQL Server performance tuning. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Wait Statistics Analysis concept map">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="280" y="140" width="200" height="60" rx="9" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="175" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Wait Statistics Analysis</text>
    <rect x="24" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Execution plan</text>
    <text x="124" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 1</text>
    <rect x="536" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Index</text>
    <text x="636" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 2</text>
    <rect x="24" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Statistics</text>
    <text x="124" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 3</text>
    <rect x="536" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">SARGable</text>
    <text x="636" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 4</text>
    <rect x="24" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Wait</text>
    <text x="124" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 5</text>
    <rect x="536" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Query Store</text>
    <text x="636" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 6</text>
    <line x1="380" y1="170" x2="124" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
  </svg>
  <div class="figcaption">Figure 1 — SQL Server performance tuning: how Wait Statistics Analysis relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Wait Statistics Analysis in practice",
      html: `
<p>Statistics describe data distribution and drive cardinality estimates. Stale statistics lead to bad plans; updating them is often the cheapest and fastest performance fix available.</p>
<p>The following comparison captures the distinctions that matter most when working with Wait Statistics Analysis:</p>
<table>
  <tr><th>Access method</th><th>Meaning</th><th>When desirable</th></tr>
  <tr><td>Seek</td><td>Navigate an index to matching rows</td><td>Selective lookups</td></tr>
  <tr><td>Scan</td><td>Read all rows</td><td>Small tables / no usable index</td></tr>
  <tr><td>Lookup</td><td>Fetch base row from a nonclustered index</td><td>Avoid at scale via covering indexes</td></tr>
</table>
<p>SARGable predicates — simple comparisons against a bare column — allow index seeks. Wrapping a column in a function or applying a leading wildcard forces scans. Rewriting predicates is frequently more effective than adding hardware.</p>
      `,
    },
    {
      h: "Working with Wait Statistics Analysis",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Wait Statistics Analysis. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Wait Statistics Analysis
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
<pre><code class="language-sql">-- Wait Statistics Analysis
-- Index usage: find unused and heavily used indexes
SELECT OBJECT_NAME(i.object_id) AS table_name, i.name AS index_name,
       s.user_seeks, s.user_scans, s.user_lookups, s.user_updates
FROM   sys.indexes i
LEFT JOIN sys.dm_db_index_usage_stats s
       ON s.object_id = i.object_id AND s.index_id = i.index_id
WHERE  i.object_id > 100
ORDER BY s.user_updates DESC;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Wait Statistics Analysis
UPDATE STATISTICS dbo.Orders WITH FULLSCAN;</code></pre>
<p>Parameter sniffing occurs when a plan is compiled for one parameter value and reused for others with very different selectivity, causing intermittent slowness. Options include OPTIMIZE FOR, RECOMPILE or parameterisation strategies, each with trade-offs.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Query Store captures query text, plans and runtime statistics over time, making plan regressions visible and allowing a good plan to be forced while the root cause is fixed.</p>
<table>
  <tr><th>Symptom</th><th>Likely cause</th><th>First check</th></tr>
  <tr><td>Slow read</td><td>Missing index / stale stats</td><td>Actual plan</td></tr>
  <tr><td>High CPU</td><td>Sorts / scans / compilation</td><td>Query stats</td></tr>
  <tr><td>I/O waits</td><td>Cache pressure / scans</td><td>Page life expectancy</td></tr>
</table>
<p>Missing index suggestions are hints, not commands. Validate them against workload, existing indexes and write overhead before implementing — blindly adding every suggested index degrades writes and storage.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Wait Statistics Analysis, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    }
  ],

  scenario: {
    title: "The function that killed an index seek",
    html: `
A query filtered with WHERE YEAR(OrderDate)=2026 on a 50-million-row table, forcing a scan. Rewriting it as a range predicate (OrderDate >= '20260101' AND OrderDate < '20270101') restored an index seek and cut the query from 40 seconds to under a second. SARGability beats adding indexes.
<p><strong>The Wait Statistics Analysis lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
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
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server performance tuning.”",
      "options": [
        "The diagram below places Wait Statistics Analysis alongside the core concepts of SQL Server performance tuning.",
        "Statistics describe data distribution and drive cardinality estimates.",
        "Wait Statistics Analysis"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Wait Statistics Analysis within SQL Server performance tuning. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Wait Statistics Analysis fits”?",
      "options": [
        "SARGable predicates — simple comparisons against a bare column — allow index seeks.",
        "Clustered indexes define the physical order of a table; nonclustered indexes are separate ordered structures pointing back to the row.",
        "The following comparison captures the distinctions that matter most when working with Wait Statistics Analysis:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Clustered indexes define the physical order of a table; nonclustered indexes are separate ordered structures pointing back to the row. Composite indexes order by multiple columns, and included columns can make an index covering so the base table need not be touched.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Wait Statistics Analysis in practice”?",
      "options": [
        "Statistics describe data distribution and drive cardinality estimates.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Statistics describe data distribution and drive cardinality estimates. Stale statistics lead to bad plans; updating them is often the cheapest and fastest performance fix available.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Wait Statistics Analysis”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Wait Statistics Analysis:",
        "SARGable predicates — simple comparisons against a bare column — allow index seeks.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Wait Statistics Analysis. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Selective lookups",
        "Query Store captures query text, plans and runtime statistics over time, making plan regressions visible and allowing a good plan to be forced while the root cause is fixed.",
        "SARGable predicates — simple comparisons against a bare column — allow index seeks."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Query Store captures query text, plans and runtime statistics over time, making plan regressions visible and allowing a good plan to be forced while the root cause is fixed.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Wait Statistics Analysis means”?",
      "options": [
        "Performance tuning is a measurement discipline: establish a baseline, identify the dominant bottleneck, make one change, measure again.",
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Performance tuning is a measurement discipline: establish a baseline, identify the dominant bottleneck, make one change, measure again. Tuning without measurement is guesswork and often makes things worse.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Wait Statistics Analysis fits”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "The diagram below places Wait Statistics Analysis alongside the core concepts of SQL Server performance tuning."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Wait Statistics Analysis alongside the core concepts of SQL Server performance tuning. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Wait Statistics Analysis in practice”?",
      "options": [
        "With Wait Statistics Analysis, prefer measured, reversible changes.",
        "The following comparison captures the distinctions that matter most when working with Wait Statistics Analysis:",
        "Missing index suggestions are hints, not commands."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Wait Statistics Analysis:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Wait Statistics Analysis”?",
      "options": [
        "The first example establishes the relevant state.",
        "Query Store captures query text, plans and runtime statistics over time, making plan regressions visible and allowing a good plan to be forced while the root cause is fixed.",
        "Missing index suggestions are hints, not commands."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Missing index suggestions are hints, not commands."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Missing index suggestions are hints, not commands. Validate them against workload, existing indexes and write overhead before implementing — blindly adding every suggested index degrades writes and storage.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server performance tuning.”",
      "options": [
        "The diagram below places Wait Statistics Analysis alongside the core concepts of SQL Server performance tuning.",
        "Statistics describe data distribution and drive cardinality estimates.",
        "Wait Statistics Analysis"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Wait Statistics Analysis within SQL Server performance tuning. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Wait Statistics Analysis fits”?",
      "options": [
        "SARGable predicates — simple comparisons against a bare column — allow index seeks.",
        "Clustered indexes define the physical order of a table; nonclustered indexes are separate ordered structures pointing back to the row.",
        "The following comparison captures the distinctions that matter most when working with Wait Statistics Analysis:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Clustered indexes define the physical order of a table; nonclustered indexes are separate ordered structures pointing back to the row. Composite indexes order by multiple columns, and included columns can make an index covering so the base table need not be touched.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Wait Statistics Analysis in practice”?",
      "options": [
        "Statistics describe data distribution and drive cardinality estimates.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Statistics describe data distribution and drive cardinality estimates. Stale statistics lead to bad plans; updating them is often the cheapest and fastest performance fix available.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Wait Statistics Analysis”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Wait Statistics Analysis:",
        "SARGable predicates — simple comparisons against a bare column — allow index seeks.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Wait Statistics Analysis. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Selective lookups",
        "Query Store captures query text, plans and runtime statistics over time, making plan regressions visible and allowing a good plan to be forced while the root cause is fixed.",
        "SARGable predicates — simple comparisons against a bare column — allow index seeks."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Query Store captures query text, plans and runtime statistics over time, making plan regressions visible and allowing a good plan to be forced while the root cause is fixed.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Wait Statistics Analysis means”?",
      "options": [
        "Performance tuning is a measurement discipline: establish a baseline, identify the dominant bottleneck, make one change, measure again.",
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Performance tuning is a measurement discipline: establish a baseline, identify the dominant bottleneck, make one change, measure again. Tuning without measurement is guesswork and often makes things worse.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Wait Statistics Analysis fits”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "The diagram below places Wait Statistics Analysis alongside the core concepts of SQL Server performance tuning."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Wait Statistics Analysis alongside the core concepts of SQL Server performance tuning. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Wait Statistics Analysis in practice”?",
      "options": [
        "With Wait Statistics Analysis, prefer measured, reversible changes.",
        "The following comparison captures the distinctions that matter most when working with Wait Statistics Analysis:",
        "Missing index suggestions are hints, not commands."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Wait Statistics Analysis:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Wait Statistics Analysis”?",
      "options": [
        "The first example establishes the relevant state.",
        "Query Store captures query text, plans and runtime statistics over time, making plan regressions visible and allowing a good plan to be forced while the root cause is fixed.",
        "Missing index suggestions are hints, not commands."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Missing index suggestions are hints, not commands."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Missing index suggestions are hints, not commands. Validate them against workload, existing indexes and write overhead before implementing — blindly adding every suggested index degrades writes and storage.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server performance tuning.”",
      "options": [
        "The diagram below places Wait Statistics Analysis alongside the core concepts of SQL Server performance tuning.",
        "Statistics describe data distribution and drive cardinality estimates.",
        "Wait Statistics Analysis"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Wait Statistics Analysis within SQL Server performance tuning. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Wait Statistics Analysis fits”?",
      "options": [
        "SARGable predicates — simple comparisons against a bare column — allow index seeks.",
        "Clustered indexes define the physical order of a table; nonclustered indexes are separate ordered structures pointing back to the row.",
        "The following comparison captures the distinctions that matter most when working with Wait Statistics Analysis:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Clustered indexes define the physical order of a table; nonclustered indexes are separate ordered structures pointing back to the row. Composite indexes order by multiple columns, and included columns can make an index covering so the base table need not be touched.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Wait Statistics Analysis in practice”?",
      "options": [
        "Statistics describe data distribution and drive cardinality estimates.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Statistics describe data distribution and drive cardinality estimates. Stale statistics lead to bad plans; updating them is often the cheapest and fastest performance fix available.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Wait Statistics Analysis”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Wait Statistics Analysis:",
        "SARGable predicates — simple comparisons against a bare column — allow index seeks.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Wait Statistics Analysis. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Selective lookups",
        "Query Store captures query text, plans and runtime statistics over time, making plan regressions visible and allowing a good plan to be forced while the root cause is fixed.",
        "SARGable predicates — simple comparisons against a bare column — allow index seeks."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Query Store captures query text, plans and runtime statistics over time, making plan regressions visible and allowing a good plan to be forced while the root cause is fixed.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Wait Statistics Analysis means”?",
      "options": [
        "Performance tuning is a measurement discipline: establish a baseline, identify the dominant bottleneck, make one change, measure again.",
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Performance tuning is a measurement discipline: establish a baseline, identify the dominant bottleneck, make one change, measure again. Tuning without measurement is guesswork and often makes things worse.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Wait Statistics Analysis fits”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "The diagram below places Wait Statistics Analysis alongside the core concepts of SQL Server performance tuning."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Wait Statistics Analysis alongside the core concepts of SQL Server performance tuning. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Wait Statistics Analysis in practice”?",
      "options": [
        "With Wait Statistics Analysis, prefer measured, reversible changes.",
        "The following comparison captures the distinctions that matter most when working with Wait Statistics Analysis:",
        "Missing index suggestions are hints, not commands."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Wait Statistics Analysis:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Wait Statistics Analysis”?",
      "options": [
        "The first example establishes the relevant state.",
        "Query Store captures query text, plans and runtime statistics over time, making plan regressions visible and allowing a good plan to be forced while the root cause is fixed.",
        "Missing index suggestions are hints, not commands."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Missing index suggestions are hints, not commands."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Missing index suggestions are hints, not commands. Validate them against workload, existing indexes and write overhead before implementing — blindly adding every suggested index degrades writes and storage.”"
    }
  ],
  takeaways: [
    "Wait Statistics Analysis is a fundamental concept in SQL Server performance tuning",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Wait Statistics Analysis improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
