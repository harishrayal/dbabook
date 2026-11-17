/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch04-03.html */

window.TOPIC = {
  id: "ch04-03",
  title: "Query Processor",

  lead: "The query processor is the brain of the relational engine: it turns raw T-SQL text into a compiled, cost-optimised execution plan and then runs it. Every tuning decision you make — index, hint, statistic — exists to influence what this component decides.",

  objectives: [
    "Walk a batch through parsing, algebrizing, optimisation, and execution",
    "Explain how the cost-based optimizer uses statistics to choose a plan",
    "Recognise parameter sniffing, plan reuse, and recompilation triggers",
    "Read plan and statement statistics from sys.dm_exec_query_stats"
  ],

  sections: [
    {
      h: "The processing pipeline",
      html: `
<p>Every batch passes through four stages before a single row is read:</p>
<ol>
  <li><strong>Parse</strong> — the scanner tokenises the text and the parser builds a syntax tree; a syntax error stops here with no execution at all</li>
  <li><strong>Algebrize (bind)</strong> — names resolve to object IDs, permissions are checked, data types are inferred, and the tree becomes a logical query tree. Errors such as “invalid column name” or implicit conversion failures originate here</li>
  <li><strong>Optimise</strong> — the optimizer generates alternative physical plans (join order, join algorithm, index vs heap, streaming vs blocking) and picks the one with the lowest <em>estimated</em> cost, informed by statistics and the <code>OPTIMISE FOR</code>/<code>OPTION</code> directives</li>
  <li><strong>Execute</strong> — the executor walks the plan with iterators: each operator requests rows from its child on demand, so a plan is a pipeline, not a script</li>
</ol>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Query processor pipeline">
    <defs>
      <marker id="a03-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
      <marker id="a03-arrow-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"/>
      </marker>
    </defs>

    <rect x="20" y="30" width="130" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="85" y="55" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Batch text</text>
    <text x="85" y="76" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">SQL / RPC</text>

    <rect x="180" y="30" width="140" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="250" y="55" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Parser</text>
    <text x="250" y="76" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">syntax tree</text>

    <rect x="350" y="30" width="150" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="425" y="55" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Algebrizer</text>
    <text x="425" y="76" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">bind · permissions</text>

    <rect x="530" y="30" width="210" height="60" rx="10" fill="var(--accent)" />
    <text x="635" y="55" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Cost-based optimizer</text>
    <text x="635" y="76" text-anchor="middle" fill="#dbeafe" font-size="11.5" font-family="Segoe UI, sans-serif">statistics → plan alternatives</text>

    <rect x="20" y="150" width="210" height="70" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="125" y="178" text-anchor="middle" fill="var(--accent-strong)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Plan cache</text>
    <text x="125" y="201" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">reuse compiled plans</text>

    <rect x="270" y="150" width="210" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="375" y="178" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Executor</text>
    <text x="375" y="201" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">iterators · row-by-row</text>

    <rect x="520" y="150" width="220" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="630" y="178" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Storage engine</text>
    <text x="630" y="201" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">access methods · pages</text>

    <rect x="20" y="260" width="720" height="56" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="36" y="283" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Recompilation triggers</text>
    <text x="36" y="304" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">schema change · statistics update · OPTION(RECOMPILE) · cached-plan eviction · SET options change</text>

    <line x1="150" y1="60" x2="178" y2="60" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a03-arrow)"/>
    <line x1="320" y1="60" x2="348" y2="60" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a03-arrow)"/>
    <line x1="500" y1="60" x2="528" y2="60" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a03-arrow)"/>
    <line x1="600" y1="90" x2="430" y2="148" stroke="var(--accent)" stroke-width="1.8" marker-end="url(#a03-arrow-acc)"/>
    <line x1="232" y1="185" x2="268" y2="185" stroke="var(--accent)" stroke-width="1.8" marker-end="url(#a03-arrow-acc)"/>
    <line x1="480" y1="185" x2="518" y2="185" stroke="var(--accent)" stroke-width="1.8" marker-end="url(#a03-arrow-acc)"/>
    <line x1="375" y1="220" x2="375" y2="258" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#a03-arrow)"/>

    <text x="380" y="128" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">cache hit → skip straight to the executor; cache miss → optimise, store, then execute</text>
  </svg>
  <div class="figcaption">Figure 1 — From batch text to executed plan, with the plan cache as the shortcut.</div>
</div>
`
    },
    {
      h: "Cost-based optimisation",
      html: `
<p>SQL Server does not pick the “best” plan — it picks the <em>cheapest estimated</em> plan from the alternatives it generates. Cost is a unitless figure derived from estimated row counts, estimated CPU work, and estimated I/O (page reads). Inputs include:</p>
<table>
  <tr><th>Input</th><th>Source</th><th>Effect when wrong</th></tr>
  <tr><td>Table/index statistics</td><td><code>sys.stats</code>, auto-update at ~10% of rows changed</td><td>Bad cardinality estimates → wrong join order or algorithm</td></tr>
  <tr><td>Index catalogue</td><td>Metadata: columns, keys, includes, filters</td><td>Missing covering index → key lookups or scans</td></tr>
  <tr><td>Parameter values (sniffing)</td><td>First compilation of a parameterised query</td><td>Plan built for one value, reused for all others</td></tr>
  <tr><td>Query hints / SET options</td><td>Directive, plan-affecting SET settings</td><td>Non-reusable plans, plan-affecting differences</td></tr>
  <tr><td>Physical environment</td><td>CPU count, memory, maxdop, cost threshold</td><td>Parallel plans that do not pay for themselves</td></tr>
</table>
<p>The optimizer can only be as accurate as its statistics. A table with 5 million rows where statistics say 100 will get a nested loops plan where a hash join was needed — the plan is internally consistent, perfectly legal, and catastrophically slow. <code>OPTION (RECOMPILE)</code> or an updated statistic is the fix, not a rewrite of the query.</p>
`
    },
    {
      h: "Physical operators you will meet",
      html: `
<p>The executor's operators fall into three families, and recognising them in an actual execution plan is the core skill of query tuning:</p>
<ul>
  <li><strong>Access operators</strong> — clustered index seek/scan, nonclustered index seek/scan, RID lookup, key lookup, table scan</li>
  <li><strong>Join operators</strong> — nested loops (cheap outer, indexed inner), hash match (large unsorted inputs), merge (both inputs sorted on the join key)</li>
  <li><strong>Blocking vs streaming</strong> — sort, hash match, and spool consume all input before producing output (blocking); nested loops, merge join, and stream aggregate stream rows (non-blocking)</li>
</ul>
<p>Blocking operators are legal but dangerous in a chain: three blocking operators in sequence mean the first row is only delivered after the whole input has been processed. Parallel plans add <code>Gather Streams</code>, <code>Repartition Streams</code>, and exchange waits (<code>CXPACKET</code>/<code>CXCONSUMER</code>).</p>
`
    },
    {
      h: "Parameters, sniffing, and recompilation",
      html: `
<p>When a query is parameterised, the optimizer compiles a plan the first time it sees the statement — a process called <strong>parameter sniffing</strong>. The plan is then reused for every subsequent execution, whatever the parameter value. That is usually a feature; it becomes an incident when the first value is unrepresentative:</p>
<ul>
  <li><strong>Sniffed selectivity</strong> — the first call is <code>@CustomerID = 42</code> (one row), the plan is a nested loops seek; a later call for a customer with 200,000 orders reuses it and re-runs the inner seek per row</li>
  <li><strong>Recompile triggers</strong> — schema change, statistics update, plan eviction, plan-affecting SET option change, or explicit <code>OPTION (RECOMPILE)</code></li>
  <li><strong>Mitigations</strong> — <code>OPTIMIZE FOR</code>/<code>OPTIMIZE FOR UNKNOWN</code>, a forced plan (last resort), splitting the statement, or designing the query to be plan-stable across value ranges</li>
</ul>
<pre><code class="language-sql">-- Optimizer effort and recompilation counters for this instance
SELECT counter, value, last_value
FROM   sys.dm_exec_query_optimizer_info
ORDER  BY value DESC;</code></pre>
<p>A rising <code>optimizations</code> counter relative to executions means SQL is compiling far more often than it is reusing plans — a strong sign of plan cache pollution or statistics churn.</p>
`
    },
    {
      h: "Plan cache and statement statistics",
      html: `
<p>The query processor records per-statement runtime statistics that map directly back to the plan operators:</p>
<pre><code class="language-sql">-- Ten most CPU-expensive statements, with their plans
SELECT TOP 10
       qs.execution_count,
       qs.total_worker_time / 1000 / qs.execution_count   AS avg_cpu_ms,
       qs.total_elapsed_time / 1000 / qs.execution_count  AS avg_elapsed_ms,
       qs.total_logical_reads / qs.execution_count        AS avg_logical_reads,
       qs.total_physical_reads / qs.execution_count       AS avg_physical_reads,
       qs.last_execution_time,
       SUBSTRING(st.text, (qs.statement_start_offset / 2) + 1,
                 ((qs.statement_end_offset - qs.statement_start_offset) / 2) + 1) AS statement_text
FROM   sys.dm_exec_query_stats AS qs
CROSS  APPLY sys.dm_exec_sql_text(qs.sql_handle) AS st
ORDER  BY qs.total_worker_time DESC;</code></pre>
<p>Reading the ratios matters: high <code>avg_logical_reads</code> with low <code>execution_count</code> is a design problem; modest reads with a huge <code>execution_count</code> is a chatty-calls problem. Join the same DMV to <code>sys.dm_exec_query_plan</code> for the XML plan and to <code>sys.dm_exec_procedure_stats</code> when the statement belongs to a procedure.</p>
`
    },
    {
      h: "Where the query processor shows up in incidents",
      html: `
<p>Query-processor problems have recognisable signatures, distinct from storage or locking problems:</p>
<table>
  <tr><th>Symptom</th><th>Processor explanation</th><th>Check</th></tr>
  <tr><td>Fast in SSMS, slow in app</td><td>Parameter sniffing — different plan per context</td><td>Compare actual vs estimated rows in the plan</td></tr>
  <tr><td>Slow after data growth</td><td>Stale statistics → old cardinality estimates</td><td><code>sys.dm_db_stats_properties</code>, update statistics</td></tr>
  <tr><td>CPU spike with no I/O growth</td><td>Compilations, blocking sorts, bad join choice</td><td><code>sys.dm_exec_query_optimizer_info</code>, wait types</td></tr>
  <tr><td>One query suddenly 100× slower</td><td>Plan change — recompile or eviction and re-sniff</td><td>plan handle history, <code>sys.dm_exec_query_plan_hash</code></td></tr>
</table>
<p>The discipline: never tune from the text of a query alone. Get the <em>actual execution plan</em> with estimated vs actual row counts, then decide whether the processor was misinformed (statistics, parameters) or under-equipped (missing index).</p>
`
    }
  ],

  scenario: {
    title: "The nightly report took 6 hours — after one index drop",
    html: `
<p>A month-end report that ran in 40 minutes suddenly needed six hours. The query text had not changed. The DBA pulled the actual execution plan and found the difference: a nested loops plan with 400,000 key lookups, where the previous plan had used a hash join over a covering index. Two days earlier a developer had dropped an index deemed “unused” — the optimizer no longer had the covering option, and the statistics histogram no longer matched the data shape after a bulk load.</p>
<p>Diagnosis: the processor was making the best choice available to it — the catalogue was missing an option and the cardinality estimates were stale. Resolution: recreate the covering index and run <code>UPDATE STATISTICS</code> on the affected table; the original plan returned within minutes. Prevention: index-drop proposals now require a query-store/plan-cache usage check, and statistics maintenance is part of the bulk-load job.</p>
`
  },

  interview: [
    {
      q: "Walk me through what happens to a query before it reads a single row.",
      a: "Parse (syntax tree), algebrize (name resolution, permissions, type binding), optimize (generate alternatives, cost each using statistics, choose the cheapest), then execution — where the executor runs the chosen plan's iterators on demand, pulling rows from the storage engine through access methods."
    },
    {
      q: "What is parameter sniffing, and when does it hurt?",
      a: "The optimizer compiles a parameterised statement using the parameter values available at first compilation, then reuses that plan. It hurts when the first values are unrepresentative — a plan tuned for one selective row is reused for a broad value range, producing misestimates and the wrong join algorithm. Diagnose it by comparing estimated vs actual row counts and by looking at the sniffed parameter in the plan."
    },
    {
      q: "How do you tell a bad plan from bad statistics?",
      a: "Compare estimated and actual row counts in the actual plan. Large divergence at the top of the tree means cardinality estimation is wrong — stale or missing statistics, or a parameter sniffing artefact. If estimates match reality but the plan is still expensive, the plan is correct for the data and the fix is physical design: indexes, partitioning, or query rewriting."
    }
  ],

  takeaways: [
    "Pipeline: parse → algebrize → optimize → execute, with the plan cache short-circuiting the first three on a hit",
    "The optimizer chooses the lowest estimated cost — statistics quality determines whether that is the right plan",
    "Blocking operators (sort, hash, spool) hold all input before output; chains of them delay the first row",
    "Parameter sniffing reuses the first compilation for all values — a feature until the first value is unrepresentative",
    "sys.dm_exec_query_stats gives per-statement CPU, reads, and execution counts — join it to sql_text and query_plan",
    "Tune from the actual execution plan and estimated-vs-actual row counts, never from query text alone"
  ]
};
