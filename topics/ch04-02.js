/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch04-02.html */

window.TOPIC = {
  id: "ch04-02",
  title: "Database Engine Components",

  lead: "The SQL Server Database Engine is not one program — it is a set of cooperating components that each own a narrow job, from framing TDS packets to flushing log records. Knowing the component catalogue lets you read any symptom as “which component is saturated?” instead of “the database is slow”.",

  objectives: [
    "Identify the major Database Engine components and their responsibilities",
    "Describe how a request is handed from the protocol layer to the engines",
    "Recognise which component a given wait type or counter implicates",
    "Inspect components at runtime with DMVs and performance counters"
  ],

  sections: [
    {
      h: "The component catalogue",
      html: `
<p>Microsoft documents the Database Engine in three groups — the relational engine, the storage engine, and the SQLOS services that support both. The practical catalogue a DBA works with looks like this:</p>
<table>
  <tr><th>Group</th><th>Component</th><th>Responsibility</th></tr>
  <tr><td rowspan="3"><strong>Protocol</strong></td><td>Connection / SNI</td><td>Listener endpoints, TLS, connection brokering</td></tr>
  <tr><td>TDS parser</td><td>Frames packets into batches, streams results back</td></tr>
  <tr><td>Language callbacks</td><td>RPC calls, batch submission, attention/cancel signals</td></tr>
  <tr><td rowspan="4"><strong>Relational engine</strong></td><td>Parser / algebrizer</td><td>Syntax trees, name resolution, type binding</td></tr>
  <tr><td>Query optimizer</td><td>Cost-based plan selection from statistics</td></tr>
  <tr><td>Executor</td><td>Runs the plan row by row (iterators)</td></tr>
  <tr><td>Metadata &amp; security</td><td>Catalog views, permissions, constraints</td></tr>
  <tr><td rowspan="4"><strong>Storage engine</strong></td><td>Access methods</td><td>Heaps and b-trees: find, insert, delete rows</td></tr>
  <tr><td>Buffer manager</td><td>Page reads/writes, buffer pool, checkpoints</td></tr>
  <tr><td>Lock manager</td><td>Shared/exclusive/updater locks, deadlocks</td></tr>
  <tr><td>Transaction manager</td><td>Log records, WAL, recovery, log writer</td></tr>
  <tr><td rowspan="3"><strong>SQLOS</strong></td><td>Scheduler / worker pool</td><td>CPU assignment, task dispatch, thread management</td></tr>
  <tr><td>Memory nodes &amp; clerks</td><td>NUMA-aware allocation, memory grants</td></tr>
  <tr><td>I/O completion &amp; waits</td><td>Async file I/O, wait/latch accounting, deadlocks</td></tr>
</table>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Database Engine component hand-off">
    <defs>
      <marker id="a02-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
      <marker id="a02-arrow-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"/>
      </marker>
    </defs>

    <rect x="20" y="20" width="150" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="95" y="45" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Client / driver</text>
    <text x="95" y="66" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">TDS request</text>

    <rect x="210" y="20" width="160" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="290" y="45" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Protocol layer</text>
    <text x="290" y="66" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">SNI · TDS framing</text>

    <rect x="420" y="20" width="160" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="500" y="45" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Connection mgr</text>
    <text x="500" y="66" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">sessions · pooling</text>

    <rect x="620" y="20" width="120" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="680" y="45" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Batch</text>
    <text x="680" y="66" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">text + params</text>

    <rect x="40" y="130" width="330" height="80" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="56" y="154" fill="var(--accent-strong)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Relational engine</text>
    <text x="56" y="178" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">parser → algebrizer → optimizer → executor</text>
    <text x="56" y="198" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">plans from statistics · metadata · permissions</text>

    <rect x="390" y="130" width="330" height="80" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="406" y="154" fill="var(--accent-strong)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Storage engine</text>
    <text x="406" y="178" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">access methods · buffer manager · log writer</text>
    <text x="406" y="198" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">pages, extents, locks, WAL</text>

    <rect x="40" y="250" width="680" height="60" rx="12" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="56" y="274" fill="var(--text)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">SQLOS services</text>
    <text x="56" y="296" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">schedulers · memory nodes · async I/O · wait &amp; latch accounting · deadlock monitor</text>

    <line x1="170" y1="50" x2="208" y2="50" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a02-arrow)"/>
    <line x1="370" y1="50" x2="418" y2="50" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a02-arrow)"/>
    <line x1="580" y1="50" x2="618" y2="50" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a02-arrow)"/>
    <line x1="680" y1="80" x2="560" y2="128" stroke="var(--accent)" stroke-width="1.8" marker-end="url(#a02-arrow-acc)"/>
    <line x1="372" y1="170" x2="388" y2="170" stroke="var(--accent)" stroke-width="1.8" marker-end="url(#a02-arrow-acc)"/>
    <line x1="205" y1="210" x2="205" y2="248" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a02-arrow)"/>
    <line x1="555" y1="210" x2="555" y2="248" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a02-arrow)"/>

    <text x="380" y="330" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">The relational engine plans the work; the storage engine touches the data; SQLOS supplies CPU, memory and I/O to both.</text>
  </svg>
  <div class="figcaption">Figure 1 — How a batch is handed between engine components.</div>
</div>
`
    },
    {
      h: "Protocol layer and connection handling",
      html: `
<p>Everything entering SQL Server arrives as <strong>TDS</strong> on one of four transports: shared memory (local tools), TCP/IP (remote, default port 1433), named pipes, or VIA (retired). The protocol layer validates the login envelope, establishes encryption if configured, and hands a complete batch — SQL text plus RPC parameters — to the relational engine.</p>
<p>Key operational points:</p>
<ul>
  <li><strong>Login vs session</strong> — the protocol layer authenticates (Windows/Kerberos, SQL login, Microsoft Entra); sessions then live in <code>sys.dm_exec_sessions</code></li>
  <li><strong>Attention packets</strong> — a client cancel or timeout sends an ATTENTION signal; the session shows up in <code>sys.dm_exec_requests</code> while it rolls back</li>
  <li><strong>Connection storms</strong> — every physical connection costs a worker when busy; pooled applications avoid this, one-query-one-connection designs do not</li>
</ul>
<pre><code class="language-sql">-- Who is connected, from where, and what are they running?
SELECT s.session_id, s.login_name, s.host_name, s.program_name,
       s.status, s.open_transaction_count,
       c.client_net_address, c.protocol_type,
       r.command, r.wait_type, r.blocking_session_id
FROM   sys.dm_exec_sessions AS s
JOIN   sys.dm_exec_connections AS c ON c.session_id = s.session_id
LEFT   JOIN sys.dm_exec_requests AS r ON r.session_id = s.session_id
WHERE  s.is_user_process = 1
ORDER  BY s.session_id;</code></pre>
`
    },
    {
      h: "Relational engine components at work",
      html: `
<p>The relational engine turns text into a plan. Three sub-components do the heavy lifting:</p>
<ol>
  <li><strong>Parser</strong> — tokenises the batch and produces a syntax tree; syntax errors die here, before any data is touched</li>
  <li><strong>Algebrizer (binder)</strong> — resolves object names to IDs, checks permissions, infers types, and produces the query tree; “object does not exist” and conversion errors surface here</li>
  <li><strong>Optimizer and executor</strong> — the optimizer enumerates feasible plans and picks the cheapest estimated one; the executor walks that plan with iterators (nested loops, hash match, sort, stream aggregate) requesting rows on demand</li>
</ol>
<p>Because the optimizer is <em>cost-based</em>, its choices are only as good as the statistics it reads — which is why stale or missing statistics produce “it was fast on Tuesday” regressions. The plan itself is cached and reused by the plan cache component (ch04-08).</p>
`
    },
    {
      h: "Storage engine components at work",
      html: `
<p>The relational engine never issues file I/O itself; it calls into the storage engine, which owns four components:</p>
<ul>
  <li><strong>Access methods</strong> — navigate heaps and b-trees (clustered indexes, nonclustered indexes, XML/spatial structures) and return rows to the executor</li>
  <li><strong>Buffer manager</strong> — resolves a logical page reference to a physical page: buffer pool hit, or an 8-KB read issued through SQLOS (ch04-06, ch04-07)</li>
  <li><strong>Lock manager</strong> — grants and converts locks on rows, pages, tables, and keys; the deadlock monitor runs here every five seconds</li>
  <li><strong>Transaction manager / log writer</strong> — writes log records before the data pages (WAL), coordinates with the checkpoint and recovery components (ch04-10, ch04-15)</li>
</ul>
<p>The hand-off point is where most tuning happens: the relational side gives you <em>plans and indexes</em>; the storage side gives you <em>pages, locks and log</em>. A slow query is almost always one of the two, and the wait type tells you which.</p>
`
    },
    {
      h: "Reading component health from DMVs",
      html: `
<p>Wait stats are the component-level heartbeat. This query ranks them with the signal/resource split — signal time is time spent ready to run but waiting for CPU (SQLOS contention), resource time is time spent blocked on the component itself:</p>
<pre><code class="language-sql">SELECT TOP 15 wait_type,
       waiting_tasks_count,
       wait_time_ms / 1000.0                 AS wait_sec,
       signal_wait_time_ms / 1000.0          AS signal_sec,
       (wait_time_ms - signal_wait_time_ms) / 1000.0 AS resource_sec,
       CAST(100.0 * signal_wait_time_ms / NULLIF(wait_time_ms, 0) AS decimal(5, 2)) AS signal_pct
FROM   sys.dm_os_wait_stats
WHERE  waiting_tasks_count > 0
  AND  wait_type NOT IN (N'SQLTRACE_BUFFER_FLUSH', N'CLR_SEMAPHORE', N'LAZYWRITER_SLEEP',
                         N'REQUEST_FOR_DEADLOCK_SEARCH', N'XE_TIMER_EVENT', N'SLEEP_TASK',
                         N'WAITFOR', N'CHECKPOINT_QUEUE')
ORDER  BY wait_time_ms DESC;</code></pre>
<p>Interpretation rules of thumb: a high <em>signal</em> percentage means the component is healthy but the server lacks CPU; a high <em>resource</em> percentage means you are waiting on that specific component — disk, lock, log, or network.</p>
<table>
  <tr><th>Component</th><th>Primary counters / DMVs</th></tr>
  <tr><td>Protocol / connections</td><td><code>sys.dm_exec_connections</code>, <code>User Connections</code> counter</td></tr>
  <tr><td>Scheduler</td><td><code>sys.dm_os_schedulers</code>, <code>SOS_SCHEDULER_YIELD</code> waits</td></tr>
  <tr><td>Buffer manager</td><td><code>Page life expectancy</code>, <code>PAGEIOLATCH_*</code>, <code>sys.dm_os_buffer_descriptors</code></td></tr>
  <tr><td>Lock manager</td><td><code>LCK_M_*</code> waits, <code>sys.dm_tran_locks</code>, <code>sys.dm_exec_requests.blocking_session_id</code></td></tr>
  <tr><td>Log writer</td><td><code>LOG_FLUSH_*</code>, <code>sys.dm_io_virtual_file_stats</code> on the LDF</td></tr>
    </table>
`
    },
    {
      h: "Worker pools: when a component runs out of threads",
      html: `
<p>SQLOS allocates workers up to the <code>max worker threads</code> setting (0 = auto-configured from CPU count). When all workers are busy, new tasks queue and sessions wait on <code>THREADPOOL</code> — the classic “server is idle but nothing runs” signature. Schedulers expose this directly:</p>
<pre><code class="language-sql">-- Worker pressure: tasks queued against every scheduler
SELECT scheduler_id, cpu_id,
       current_tasks_count, runnable_tasks_count,
       active_workers_count, work_queue_count
FROM   sys.dm_os_schedulers
WHERE  status = N'VISIBLE ONLINE'
  AND  (runnable_tasks_count > 0 OR work_queue_count > 0);

-- Are we actually waiting for threads?
SELECT wait_type, waiting_tasks_count, wait_time_ms
FROM   sys.dm_os_wait_stats
WHERE  wait_type = N'THREADPOOL';</code></pre>
<p>Fixing worker exhaustion is never “raise max worker threads” first — it is finding the sessions holding threads without doing useful work: un-pooled connections, queries waiting on external resources inside SQL, or runaway parallel queries occupying many workers each.</p>
`
    }
  ],

  scenario: {
    title: "Login timeouts on a server showing 3% CPU",
    html: `
<p>At 09:40 a reporting cluster began rejecting new logins with “timeout” errors while existing sessions crawled. CPU was 3%, no blocking was visible, and memory looked normal. The DBA's first DMV sweep showed <code>sys.dm_os_schedulers</code> with <code>work_queue_count</code> climbing on every scheduler and <code>sys.dm_os_wait_stats</code> gaining a large <code>THREADPOOL</code> bucket.</p>
<p>The root cause: an overnight “quick fix” had replaced the application's connection pool with one-connection-per-query against the reporting replica, and a stuck report opened 900 connections. Each idle session still consumed a worker slot when a request arrived; the pool was exhausted, so even <code>SELECT @@VERSION</code> could not get a thread.</p>
<p>Resolution: identify and kill the stuck report sessions (with approval), restart the application pool, and confirm <code>work_queue_count</code> returned to zero. Prevention: alert on <code>THREADPOOL</code> waits and scheduler queue depth, enforce connection pooling in the data-access layer, and set a login timeout alarm so the failure is detected by monitoring rather than by users.</p>
`
  },

  interview: [
    {
      q: "Name the main components of the Database Engine and group them logically.",
      a: "Protocol layer (SNI, TDS framing, connections); relational engine (parser, algebrizer, optimizer, executor, metadata and security); storage engine (access methods, buffer manager, lock manager, transaction/log manager); and SQLOS beneath them (schedulers and workers, memory nodes, asynchronous I/O, wait and latch accounting)."
    },
    {
      q: "Which component do PAGEIOLATCH waits implicate, and what is your next query?",
      a: "The buffer manager's page-read path — a task is waiting to latch a page that must first be read from disk. Next: sys.dm_io_virtual_file_stats per file to find which data file has high io_stall_read_ms and average read latency, then check whether the working set exceeds memory or the storage is saturated."
    },
    {
      q: "The server is idle — low CPU, no blocking — but queries queue. What do you suspect?",
      a: "Worker thread exhaustion: work_queue_count and THREADPOOL waits on sys.dm_os_schedulers mean tasks exist but no worker is free to run them. Typical causes are unpooled connections, sessions holding threads while blocked on external resources, or too many concurrent parallel queries — not a lack of CPU."
    }
  ],

  takeaways: [
    "The engine is a catalogue of narrow components — protocol, relational, storage, SQLOS — each with its own DMVs and wait types",
    "The relational engine plans; the storage engine touches pages, locks and log; SQLOS supplies CPU, memory and I/O to both",
    "Signal waits mean CPU contention; resource waits mean you are blocked on the named component",
    "TDS is the only way in: every batch, result and cancellation travels as TDS packets",
    "THREADPOOL waits plus a rising scheduler work queue mean worker exhaustion — fix the connection and worker consumers, not the thread limit",
    "Component health is observable: wait stats, scheduler DMVs, file stall stats, and lock DMVs cover the whole stack"
  ]
};
