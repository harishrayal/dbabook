/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch04-08.html */

window.TOPIC = {
  id: "ch04-08",
  title: "Plan Cache",

  lead: "The plan cache is SQL Server's store of compiled execution plans, reused so that repeated statements skip parsing, binding, and optimisation. It is also a shared, finite resource — polluted by ad-hoc SQL, starved by memory pressure, and the reason one bad query can slow down an entire instance.",

  objectives: [
    "Describe what the plan cache stores and how plans are reused",
    "Diagnose plan cache pollution from single-use ad-hoc plans",
    "Distinguish parameter sniffing problems from cache size problems",
    "Measure cache size, reuse, and recompilation with DMVs"
  ],

  sections: [
    {
      h: "What lives in the plan cache",
      html: `
<p>When a batch compiles, SQL Server stores the result — not the text, but the <strong>compiled plan</strong> plus the execution context needed to run it. The cache holds several object types:</p>
<table>
  <tr><th><code>objtype</code></th><th>What it is</th><th>Reuse behaviour</th></tr>
  <tr><td><code>Prepared</code></td><td>Explicitly prepared statements and driver-prepared queries (RPC)</td><td>Reused across sessions with matching SET options</td></tr>
  <tr><td><code>Proc</code></td><td>Stored procedures, views, triggers (entry point)</td><td>Plans for each inner statement cached under the proc</td></tr>
  <tr><td><code>Adhoc</code></td><td>Ad-hoc text submitted directly</td><td>Reused only if the text matches exactly (after tokenisation)</td></tr>
  <tr><td><code>Replicated</code></td><td>Plans for replication-related statements</td><td>Specialised handling</td></tr>
  <tr><td><code>View</code></td><td>View definitions expanded at compile time</td><td>Shared via the proc entry that references them</td></tr>
</table>
<p>Two separate structures are cached: the <strong>compiled plan</strong> (the operator tree) and the <strong>cached context</strong> (session-specific state such as temporary object handles). Memory clerks <code>MEMORYCLERK_SQLPLAN</code> and <code>MEMORYCLERK_SQLEXEC</code> hold them respectively.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Plan cache lookup and recompilation flow">
    <defs>
      <marker id="a08-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
      <marker id="a08-arrow-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"/>
      </marker>
    </defs>

    <rect x="20" y="18" width="160" height="54" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="100" y="40" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Incoming batch</text>
    <text x="100" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">text + parameters</text>

    <rect x="225" y="18" width="210" height="54" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="330" y="40" text-anchor="middle" fill="var(--accent-strong)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">Plan cache probe</text>
    <text x="330" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">hash of text + SET options</text>

    <rect x="490" y="18" width="250" height="54" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="615" y="40" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Hit → reuse</text>
    <text x="615" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">usecounts++ · execute directly</text>

    <rect x="40" y="120" width="320" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="200" y="146" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Miss → compile</text>
    <text x="200" y="170" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">parse → algebrize → optimise</text>

    <rect x="400" y="120" width="320" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="560" y="146" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Insert compiled plan</text>
    <text x="560" y="170" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">stored under objtype · size_in_bytes</text>

    <rect x="40" y="228" width="320" height="76" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="200" y="254" text-anchor="middle" fill="var(--accent-strong)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Recompile triggers</text>
    <text x="200" y="276" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">schema change · stats update · SET options</text>
    <text x="200" y="296" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">plan eviction · OPTION(RECOMPILE)</text>

    <rect x="400" y="228" width="320" height="76" rx="10" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="560" y="254" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Eviction under pressure</text>
    <text x="560" y="276" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">plans removed when memory is needed elsewhere</text>
    <text x="560" y="296" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">next execution pays full compile cost again</text>

    <line x1="180" y1="45" x2="223" y2="45" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a08-arrow)"/>
    <line x1="435" y1="45" x2="488" y2="45" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a08-arrow)"/>
    <line x1="330" y1="72" x2="240" y2="118" stroke="var(--accent)" stroke-width="1.8" marker-end="url(#a08-arrow-acc)"/>
    <line x1="360" y1="155" x2="398" y2="155" stroke="var(--accent)" stroke-width="1.8" marker-end="url(#a08-arrow-acc)"/>
    <line x1="560" y1="190" x2="560" y2="226" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#a08-arrow)"/>
    <line x1="200" y1="190" x2="200" y2="226" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#a08-arrow)"/>

    <text x="615" y="100" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-style="italic" font-family="Segoe UI, sans-serif">reuse skips all four compile steps</text>
    <text x="380" y="330" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">A cache hit is the whole point: compile once, execute many — until the plan is evicted or invalidated.</text>
  </svg>
  <div class="figcaption">Figure 1 — Plan cache probe, compile-on-miss, and the paths that invalidate a plan.</div>
</div>
`
    },
    {
      h: "How reuse actually works",
      html: `
<p>Reuse depends on an exact match of everything that can affect a plan:</p>
<ul>
  <li><strong>Statement text</strong> — after whitespace normalisation, <code>SELECT *</code> and <code>SELECT *</code> from different databases hash differently only if the resolved objects differ; one character difference creates a separate cache entry</li>
  <li><strong>SET options</strong> — <code>ANSI_NULLS</code>, <code>QUOTED_IDENTIFIER</code>, <code>ARITHABORT</code> and others are part of the cache key. The same query with a different SET profile compiles twice</li>
  <li><strong>Parameterisation</strong> — a statement is eligible for reuse only if it is parameterised (RPC, prepared, or auto-parameterised)</li>
  <li><strong>Object dependencies</strong> — schema or statistics changes invalidate dependent plans; the next execution recompiles</li>
</ul>
<p>The <code>usecounts</code> column in <code>sys.dm_exec_cached_plans</code> is the reuse evidence. A plan with <code>usecounts = 1</code> was compiled and never used again — multiply by <code>size_in_bytes</code> across the cache and you can quantify pollution in megabytes.</p>
`
    },
    {
      h: "Ad-hoc pollution and how to measure it",
      html: `
<p>Applications that build query text by string concatenation submit thousands of unique one-off batches. Each becomes an <code>Adhoc</code> cache entry — a compiled plan occupying memory, compiled once, reused never. On instances with heavy ORM or dynamic-SQL traffic this routinely reaches hundreds of megabytes.</p>
<pre><code class="language-sql">-- Cache footprint by object type
SELECT objtype, cacheobjtype,
       COUNT(*)                     AS plan_count,
       SUM(usecounts)               AS total_uses,
       SUM(size_in_bytes) / 1048576 AS total_mb,
       AVG(size_in_bytes) / 1024    AS avg_kb
FROM   sys.dm_exec_cached_plans
GROUP  BY objtype, cacheobjtype
ORDER  BY total_mb DESC;

-- Single-use ad-hoc plans: pure overhead
SELECT COUNT(*)                     AS single_use_plans,
       SUM(size_in_bytes) / 1048576 AS wasted_mb
FROM   sys.dm_exec_cached_plans
WHERE  objtype = N'Adhoc'
  AND  usecounts = 1;</code></pre>
<p>Mitigations, in order of preference: fix the application to use parameterised queries or procedures; set <code>optimize for ad hoc objects = 1</code> so the first execution stores only a compiled skeleton (a cheap plan) and only the second execution stores the full plan; and reserve <code>DBCC FREEPROCCACHE</code> as a diagnostic, not a cure.</p>
`
    },
    {
      h: "Size, pressure, and eviction",
      html: `
<p>The plan cache has no fixed maximum — it grows toward the difference between <em>target</em> and <em>committed</em> server memory and shrinks when other memory clerks (usually the buffer pool) need space. Under pressure SQL Server evicts idle plans, and the cost of eviction is paid on the next execution:</p>
<pre><code class="language-sql">-- Plan cache size vs buffer pool, and the memory pressure signal
SELECT counter_name, cntr_value
FROM   sys.dm_os_performance_counters
WHERE  counter_name IN (N'Cache Pages', N'Cache Object Counts',
                        N'Free Pages', N'Total Server Memory (KB)',
                        N'Target Server Memory (KB)');

-- Plans most expensive to keep (largest and least used)
SELECT TOP 20 cp.objtype, cp.usecounts,
       cp.size_in_bytes / 1024 AS size_kb,
       LEFT(st.text, 120)      AS batch_text
FROM   sys.dm_exec_cached_plans AS cp
CROSS  APPLY sys.dm_exec_sql_text(cp.plan_handle) AS st
WHERE  cp.usecounts = 1
ORDER  BY cp.size_in_bytes DESC;</code></pre>
<p>If the second query returns large single-use <code>Adhoc</code> rows, you have both a pollution problem and an eviction problem: useless plans are consuming the space that useful plans would have kept.</p>
`
    },
    {
      h: "Sniffing, recompiles, and plan instability",
      html: `
<p>The plan cache also stores the <em>parameter values used at compilation</em>, which is the root of parameter sniffing (ch04-03). Related cache-side symptoms:</p>
<ul>
  <li><strong>Same statement, different plans</strong> — compare <code>sys.dm_exec_query_plan_hash</code>: differing hashes across executions indicate recompiles or multiple cached variants</li>
  <li><strong>Recompile storms</strong> — watch <code>sys.dm_exec_query_optimizer_info</code>: a fast-rising <code>optimizations</code> counter means compilations outnumbering reuses</li>
  <li><strong>Plan-affecting SET differences</strong> — two client drivers using different SET profiles double the cache footprint and defeat reuse</li>
</ul>
<pre><code class="language-sql">-- Statements recompiling far more than they execute
SELECT TOP 10 qs.execution_count,
       qs.plan_generation_num,
       SUBSTRING(st.text, (qs.statement_start_offset / 2) + 1,
                 ((qs.statement_end_offset - qs.statement_start_offset) / 2) + 1) AS statement_text
FROM   sys.dm_exec_query_stats AS qs
CROSS  APPLY sys.dm_exec_sql_text(qs.sql_handle) AS st
WHERE  qs.plan_generation_num &gt; qs.execution_count / 2
ORDER  BY qs.plan_generation_num DESC;</code></pre>
<p><code>plan_generation_num</code> counts how many times that specific statement was generated into a plan — when it approaches the execution count, the statement is being compiled almost every time it runs.</p>
`
    },
    {
      h: "Maintenance: what to run and what to avoid",
      html: `
<p>Plan cache maintenance is mostly about restraint. The safe operations:</p>
<table>
  <tr><th>Operation</th><th>Effect</th><th>When it is justified</th></tr>
  <tr><td><code>DBCC FREEPROCCACHE</code></td><td>Evicts all plans; next executions recompile</td><td>Diagnosing a suspected bad plan (instance-wide impact)</td></tr>
  <tr><td><code>DBCC FREEPROCCACHE (&lt;plan_handle&gt;)</code></td><td>Evicts one plan only</td><td>Targeted test of a single regressed statement</td></tr>
  <tr><td><code>DBCC FLUSHPROCINDB</code></td><td>Clears one database's plans</td><td>Post-deploy validation in a controlled window</td></tr>
  <tr><td><code>OPTION (RECOMPILE)</code></td><td>Statement compiles each run, stores no plan</td><td>Statements whose optimal plan varies wildly per call</td></tr>
  <tr><td>Restart / failover</td><td>Everything recompiles — cold cache incident</td><td>Last resort; plan problems rarely warrant it</td></tr>
</table>
<p>A plan cache cleared in production is a CPU spike you chose to create: every statement recompiles at once. Prefer targeted eviction, and prefer fixing the cause — parameterisation, statistics, or an index — over flushing symptoms.</p>
`
    }
  ],

  scenario: {
    title: "Memory pressure from a “tiny” reporting job",
    html: `
<p>Every morning at 07:00 a reporting job generated dynamic SQL by concatenating table names and filters — roughly 40,000 unique statements per day, each submitted once. By 10:00 the instance began showing recompile storms and erratic latency. The DBA found <code>MEMORYCLERK_SQLPLAN</code> holding 3.4 GB, with over 60,000 single-use <code>Adhoc</code> plans in <code>sys.dm_exec_cached_plans</code> and a growing count of evicted-then-recompiled high-value plans.</p>
<p>Diagnosis: plan cache pollution. The buffer pool was being squeezed out by plans that would never execute again, so valuable plans were evicted and recompiled repeatedly — CPU rose without any query changing. Resolution: set <code>optimize for ad hoc objects</code> to 1 (immediate reduction — skeleton plans only), work with the team to parameterise the report builder, and clear the polluted plans once during a quiet window.</p>
<p>Prevention: a monitoring check on single-use ad-hoc plan count and plan-cache MB, an architecture rule that dynamic SQL must use parameters, and a monthly review of <code>sys.dm_exec_cached_plans</code> grouped by <code>objtype</code>.</p>
`
  },

  interview: [
    {
      q: "What does the plan cache store, and why does it exist?",
      a: "Compiled execution plans plus their cached execution contexts, keyed by statement text, parameterisation, and plan-affecting SET options. It exists so a statement is parsed, bound, and optimised once and executed many times — compilation is expensive, and reuse is what makes repeated statements cheap."
    },
    {
      q: "How do you prove that ad-hoc SQL is polluting the plan cache?",
      a: "Group sys.dm_exec_cached_plans by objtype and sum size_in_bytes: a large Adhoc bucket with a high count of usecounts = 1 rows means plans compiled once and never reused. Correlate with the plan cache clerk in sys.dm_os_memory_clerks and with recompile counters in sys.dm_exec_query_optimizer_info."
    },
    {
      q: "When would you clear the plan cache in production?",
      a: "Rarely, and only with intent: to evict a specific bad plan by plan_handle during diagnosis, or after a controlled deployment to force recompilation. A full DBCC FREEPROCCACHE creates an instance-wide compile spike, so it is a diagnostic of last resort — the real fix is parameterisation, statistics, or index work that removes the bad plan's cause."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “When a batch compiles, SQL Server stores the result — not the text, but the _____ plus the execution context needed to run it.”",
      "options": [
        "Recompile storms",
        "compiled plan",
        "Same statement, different plans"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “When a batch compiles, SQL Server stores the result — not the text, but the compiled plan plus the execution context needed to run it. The cache holds several object types:”"
    },
    {
      "question": "Which fact is covered in the lesson section “How reuse actually works”?",
      "options": [
        "Reuse depends on an exact match of everything that can affect a plan:",
        "If the second query returns large single-use Adhoc rows, you have both a pollution problem and an eviction problem: useless plans are consuming the space that useful plans would…",
        "parameter values used at compilation"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Reuse depends on an exact match of everything that can affect a plan:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Ad-hoc pollution and how to measure it”?",
      "options": [
        "parameter values used at compilation",
        "plan_generation_num counts how many times that specific statement was generated into a plan — when it approaches the execution count, the statement is being compiled almost every…",
        "Applications that build query text by string concatenation submit thousands of unique one-off batches."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Applications that build query text by string concatenation submit thousands of unique one-off batches. Each becomes an Adhoc cache entry — a compiled plan occupying memory, compiled once, reused never. On instances with heavy ORM or dynamic-SQL traffic this routinely reaches hundreds of megabytes.”"
    },
    {
      "question": "Complete the lesson statement: “The plan cache has no fixed maximum — it grows toward the difference between _____ and committed server memory and shrinks when other memory clerks (usually the buffer pool) need space.”",
      "options": [
        "Plans for each inner statement cached under the proc",
        "target",
        "Reused across sessions with matching SET options"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The plan cache has no fixed maximum — it grows toward the difference between target and committed server memory and shrinks when other memory clerks (usually the buffer pool) need space. Under pressure SQL Server evicts idle plans, and the cost of eviction is paid on the next execution:”"
    },
    {
      "question": "Complete the lesson statement: “The plan cache also stores the _____, which is the root of parameter sniffing (ch04-03).”",
      "options": [
        "parameter values used at compilation",
        "Plans for each inner statement cached under the proc",
        "Reused only if the text matches exactly (after tokenisation)"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The plan cache also stores the parameter values used at compilation, which is the root of parameter sniffing (ch04-03). Related cache-side symptoms:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Maintenance: what to run and what to avoid”?",
      "options": [
        "plan_generation_num counts how many times that specific statement was generated into a plan — when it approaches the execution count, the statement is being compiled almost every…",
        "A plan cache cleared in production is a CPU spike you chose to create: every statement recompiles at once.",
        "Plan cache maintenance is mostly about restraint."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Plan cache maintenance is mostly about restraint. The safe operations:”"
    },
    {
      "question": "Complete the lesson statement: “Two separate structures are cached: the _____ (the operator tree) and the cached context (session-specific state such as temporary object handles).”",
      "options": [
        "Shared via the proc entry that references them",
        "compiled plan",
        "Specialised handling"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Two separate structures are cached: the compiled plan (the operator tree) and the cached context (session-specific state such as temporary object handles). Memory clerks MEMORYCLERK_SQLPLAN and MEMORYCLERK_SQLEXEC hold them respectively.”"
    },
    {
      "question": "Which fact is covered in the lesson section “How reuse actually works”?",
      "options": [
        "dm_exec_cached_plans is the reuse evidence.",
        "Targeted test of a single regressed statement",
        "Post-deploy validation in a controlled window"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The usecounts column in sys.dm_exec_cached_plans is the reuse evidence. A plan with usecounts = 1 was compiled and never used again — multiply by size_in_bytes across the cache and you can quantify pollution in megabytes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Ad-hoc pollution and how to measure it”?",
      "options": [
        "Post-deploy validation in a controlled window",
        "Statements whose optimal plan varies wildly per call",
        "Mitigations, in order of preference: fix the application to use parameterised queries or procedures; set optimize for ad hoc objects = 1 so the first execution stores only a…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Mitigations, in order of preference: fix the application to use parameterised queries or procedures; set optimize for ad hoc objects = 1 so the first execution stores only a compiled skeleton (a cheap plan) and only the second execution stores the full plan; and reserve DBCC FREEPROCCACHE as a diagnostic, not a cure.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Size, pressure, and eviction”?",
      "options": [
        "Last resort; plan problems rarely warrant it",
        "If the second query returns large single-use Adhoc rows, you have both a pollution problem and an eviction problem: useless plans are consuming the space that useful plans would…",
        "Statements whose optimal plan varies wildly per call"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “If the second query returns large single-use Adhoc rows, you have both a pollution problem and an eviction problem: useless plans are consuming the space that useful plans would have kept.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “When a batch compiles, SQL Server stores the result — not the text, but the _____ plus the execution context needed to run it.”",
      "options": [
        "Recompile storms",
        "compiled plan",
        "Same statement, different plans"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “When a batch compiles, SQL Server stores the result — not the text, but the compiled plan plus the execution context needed to run it. The cache holds several object types:”"
    },
    {
      "question": "Which fact is covered in the lesson section “How reuse actually works”?",
      "options": [
        "Reuse depends on an exact match of everything that can affect a plan:",
        "If the second query returns large single-use Adhoc rows, you have both a pollution problem and an eviction problem: useless plans are consuming the space that useful plans would…",
        "parameter values used at compilation"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Reuse depends on an exact match of everything that can affect a plan:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Ad-hoc pollution and how to measure it”?",
      "options": [
        "parameter values used at compilation",
        "plan_generation_num counts how many times that specific statement was generated into a plan — when it approaches the execution count, the statement is being compiled almost every…",
        "Applications that build query text by string concatenation submit thousands of unique one-off batches."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Applications that build query text by string concatenation submit thousands of unique one-off batches. Each becomes an Adhoc cache entry — a compiled plan occupying memory, compiled once, reused never. On instances with heavy ORM or dynamic-SQL traffic this routinely reaches hundreds of megabytes.”"
    },
    {
      "question": "Complete the lesson statement: “The plan cache has no fixed maximum — it grows toward the difference between _____ and committed server memory and shrinks when other memory clerks (usually the buffer pool) need space.”",
      "options": [
        "Plans for each inner statement cached under the proc",
        "target",
        "Reused across sessions with matching SET options"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The plan cache has no fixed maximum — it grows toward the difference between target and committed server memory and shrinks when other memory clerks (usually the buffer pool) need space. Under pressure SQL Server evicts idle plans, and the cost of eviction is paid on the next execution:”"
    },
    {
      "question": "Complete the lesson statement: “The plan cache also stores the _____, which is the root of parameter sniffing (ch04-03).”",
      "options": [
        "parameter values used at compilation",
        "Plans for each inner statement cached under the proc",
        "Reused only if the text matches exactly (after tokenisation)"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The plan cache also stores the parameter values used at compilation, which is the root of parameter sniffing (ch04-03). Related cache-side symptoms:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Maintenance: what to run and what to avoid”?",
      "options": [
        "plan_generation_num counts how many times that specific statement was generated into a plan — when it approaches the execution count, the statement is being compiled almost every…",
        "A plan cache cleared in production is a CPU spike you chose to create: every statement recompiles at once.",
        "Plan cache maintenance is mostly about restraint."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Plan cache maintenance is mostly about restraint. The safe operations:”"
    },
    {
      "question": "Complete the lesson statement: “Two separate structures are cached: the _____ (the operator tree) and the cached context (session-specific state such as temporary object handles).”",
      "options": [
        "Shared via the proc entry that references them",
        "compiled plan",
        "Specialised handling"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Two separate structures are cached: the compiled plan (the operator tree) and the cached context (session-specific state such as temporary object handles). Memory clerks MEMORYCLERK_SQLPLAN and MEMORYCLERK_SQLEXEC hold them respectively.”"
    },
    {
      "question": "Which fact is covered in the lesson section “How reuse actually works”?",
      "options": [
        "dm_exec_cached_plans is the reuse evidence.",
        "Targeted test of a single regressed statement",
        "Post-deploy validation in a controlled window"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The usecounts column in sys.dm_exec_cached_plans is the reuse evidence. A plan with usecounts = 1 was compiled and never used again — multiply by size_in_bytes across the cache and you can quantify pollution in megabytes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Ad-hoc pollution and how to measure it”?",
      "options": [
        "Post-deploy validation in a controlled window",
        "Statements whose optimal plan varies wildly per call",
        "Mitigations, in order of preference: fix the application to use parameterised queries or procedures; set optimize for ad hoc objects = 1 so the first execution stores only a…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Mitigations, in order of preference: fix the application to use parameterised queries or procedures; set optimize for ad hoc objects = 1 so the first execution stores only a compiled skeleton (a cheap plan) and only the second execution stores the full plan; and reserve DBCC FREEPROCCACHE as a diagnostic, not a cure.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Size, pressure, and eviction”?",
      "options": [
        "Last resort; plan problems rarely warrant it",
        "If the second query returns large single-use Adhoc rows, you have both a pollution problem and an eviction problem: useless plans are consuming the space that useful plans would…",
        "Statements whose optimal plan varies wildly per call"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “If the second query returns large single-use Adhoc rows, you have both a pollution problem and an eviction problem: useless plans are consuming the space that useful plans would have kept.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “When a batch compiles, SQL Server stores the result — not the text, but the _____ plus the execution context needed to run it.”",
      "options": [
        "Recompile storms",
        "compiled plan",
        "Same statement, different plans"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “When a batch compiles, SQL Server stores the result — not the text, but the compiled plan plus the execution context needed to run it. The cache holds several object types:”"
    },
    {
      "question": "Which fact is covered in the lesson section “How reuse actually works”?",
      "options": [
        "Reuse depends on an exact match of everything that can affect a plan:",
        "If the second query returns large single-use Adhoc rows, you have both a pollution problem and an eviction problem: useless plans are consuming the space that useful plans would…",
        "parameter values used at compilation"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Reuse depends on an exact match of everything that can affect a plan:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Ad-hoc pollution and how to measure it”?",
      "options": [
        "parameter values used at compilation",
        "plan_generation_num counts how many times that specific statement was generated into a plan — when it approaches the execution count, the statement is being compiled almost every…",
        "Applications that build query text by string concatenation submit thousands of unique one-off batches."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Applications that build query text by string concatenation submit thousands of unique one-off batches. Each becomes an Adhoc cache entry — a compiled plan occupying memory, compiled once, reused never. On instances with heavy ORM or dynamic-SQL traffic this routinely reaches hundreds of megabytes.”"
    },
    {
      "question": "Complete the lesson statement: “The plan cache has no fixed maximum — it grows toward the difference between _____ and committed server memory and shrinks when other memory clerks (usually the buffer pool) need space.”",
      "options": [
        "Plans for each inner statement cached under the proc",
        "target",
        "Reused across sessions with matching SET options"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The plan cache has no fixed maximum — it grows toward the difference between target and committed server memory and shrinks when other memory clerks (usually the buffer pool) need space. Under pressure SQL Server evicts idle plans, and the cost of eviction is paid on the next execution:”"
    },
    {
      "question": "Complete the lesson statement: “The plan cache also stores the _____, which is the root of parameter sniffing (ch04-03).”",
      "options": [
        "parameter values used at compilation",
        "Plans for each inner statement cached under the proc",
        "Reused only if the text matches exactly (after tokenisation)"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The plan cache also stores the parameter values used at compilation, which is the root of parameter sniffing (ch04-03). Related cache-side symptoms:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Maintenance: what to run and what to avoid”?",
      "options": [
        "plan_generation_num counts how many times that specific statement was generated into a plan — when it approaches the execution count, the statement is being compiled almost every…",
        "A plan cache cleared in production is a CPU spike you chose to create: every statement recompiles at once.",
        "Plan cache maintenance is mostly about restraint."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Plan cache maintenance is mostly about restraint. The safe operations:”"
    },
    {
      "question": "Complete the lesson statement: “Two separate structures are cached: the _____ (the operator tree) and the cached context (session-specific state such as temporary object handles).”",
      "options": [
        "Shared via the proc entry that references them",
        "compiled plan",
        "Specialised handling"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Two separate structures are cached: the compiled plan (the operator tree) and the cached context (session-specific state such as temporary object handles). Memory clerks MEMORYCLERK_SQLPLAN and MEMORYCLERK_SQLEXEC hold them respectively.”"
    },
    {
      "question": "Which fact is covered in the lesson section “How reuse actually works”?",
      "options": [
        "dm_exec_cached_plans is the reuse evidence.",
        "Targeted test of a single regressed statement",
        "Post-deploy validation in a controlled window"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The usecounts column in sys.dm_exec_cached_plans is the reuse evidence. A plan with usecounts = 1 was compiled and never used again — multiply by size_in_bytes across the cache and you can quantify pollution in megabytes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Ad-hoc pollution and how to measure it”?",
      "options": [
        "Post-deploy validation in a controlled window",
        "Statements whose optimal plan varies wildly per call",
        "Mitigations, in order of preference: fix the application to use parameterised queries or procedures; set optimize for ad hoc objects = 1 so the first execution stores only a…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Mitigations, in order of preference: fix the application to use parameterised queries or procedures; set optimize for ad hoc objects = 1 so the first execution stores only a compiled skeleton (a cheap plan) and only the second execution stores the full plan; and reserve DBCC FREEPROCCACHE as a diagnostic, not a cure.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Size, pressure, and eviction”?",
      "options": [
        "Last resort; plan problems rarely warrant it",
        "If the second query returns large single-use Adhoc rows, you have both a pollution problem and an eviction problem: useless plans are consuming the space that useful plans would…",
        "Statements whose optimal plan varies wildly per call"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “If the second query returns large single-use Adhoc rows, you have both a pollution problem and an eviction problem: useless plans are consuming the space that useful plans would have kept.”"
    }
  ],
  takeaways: [
    "Plan cache = compiled plans + execution contexts, keyed by text, parameters, and SET options",
    "Reuse is the entire point: usecounts shows whether a plan earned its memory",
    "Single-use Adhoc plans are cache pollution — quantify them by count and MB before arguing about it",
    "Set optimize for ad hoc objects = 1 to stop dynamic-SQL traffic storing full plans on first use",
    "Eviction is not free: every evicted plan recompiles on its next execution, spiking CPU",
    "Prefer targeted eviction (plan_handle) and root-cause fixes over instance-wide FREEPROCCACHE"
  ]
};
