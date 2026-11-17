/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch04-01.html */

window.TOPIC = {
  id: "ch04-01",
  title: "SQL Server Internal Architecture",

  lead: "SQL Server is a layered system: client requests travel through a protocol layer, a relational engine plans and executes them, a storage engine reads and writes pages, and an operating-system-like layer called SQLOS schedules every millisecond of work. Understanding those layers is how a DBA turns a vague “it is slow” into a precise diagnosis.",

  objectives: [
    "Describe the main layers of SQL Server and what each one owns",
    "Explain how SQLOS schedules work onto processors",
    "Trace a single batch through the full stack, end to end",
    "Map wait statistics to the layer that is actually struggling"
  ],

  sections: [
    {
      h: "The layered architecture",
      html: `
<p>Every version of SQL Server since 7.0 has been built from the same three cooperating subsystems, plus the client-facing protocol path:</p>
<ul>
  <li><strong>Protocol layer</strong> — speaks TDS (Tabular Data Stream) over TCP/IP, shared memory, or named pipes; turns network packets into batches and results back into packets</li>
  <li><strong>Relational engine</strong> (also called the query processor) — parses, validates, optimises, and executes T-SQL; owns metadata, security, and transaction semantics seen by the user</li>
  <li><strong>Storage engine</strong> — decides how rows are physically stored, reads and writes 8-KB pages, manages allocation, locking, and the transaction log</li>
  <li><strong>SQLOS</strong> — the layer beneath both engines: scheduling, memory nodes, asynchronous I/O, wait/latch coordination, and deadlock detection. It behaves like a small operating system running on Windows</li>
</ul>
<p>The engines never talk to Windows directly for CPU or I/O — they ask SQLOS. That separation is why SQL Server manages its own threads instead of one thread per request, and why wait statistics (the DBA's primary diagnostic tool) are generated in the first place.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="SQL Server layered architecture">
    <defs>
      <marker id="a01-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="230" y="6" width="300" height="36" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="29" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Client applications · SSMS · Drivers (TDS)</text>

    <rect x="230" y="54" width="300" height="36" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="77" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Protocol layer · connection · TDS framing</text>

    <rect x="30" y="104" width="700" height="60" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="46" y="124" fill="var(--accent-strong)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Relational engine</text>
    <rect x="46" y="132" width="205" height="24" rx="6" fill="var(--surface)" stroke="var(--border)"/>
    <text x="148" y="148" text-anchor="middle" fill="var(--text)" font-size="11.5" font-family="Segoe UI, sans-serif">Query processor: parse → optimise → execute</text>
    <rect x="266" y="132" width="220" height="24" rx="6" fill="var(--surface)" stroke="var(--border)"/>
    <text x="376" y="148" text-anchor="middle" fill="var(--text)" font-size="11.5" font-family="Segoe UI, sans-serif">Metadata · security · constraints</text>
    <rect x="501" y="132" width="213" height="24" rx="6" fill="var(--surface)" stroke="var(--border)"/>
    <text x="607" y="148" text-anchor="middle" fill="var(--text)" font-size="11.5" font-family="Segoe UI, sans-serif">Transaction semantics (ACID)</text>

    <rect x="30" y="176" width="700" height="60" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="46" y="196" fill="var(--accent-strong)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Storage engine</text>
    <rect x="46" y="204" width="205" height="24" rx="6" fill="var(--surface)" stroke="var(--border)"/>
    <text x="148" y="220" text-anchor="middle" fill="var(--text)" font-size="11.5" font-family="Segoe UI, sans-serif">Access methods · b-tree navigation</text>
    <rect x="266" y="204" width="220" height="24" rx="6" fill="var(--surface)" stroke="var(--border)"/>
    <text x="376" y="220" text-anchor="middle" fill="var(--text)" font-size="11.5" font-family="Segoe UI, sans-serif">Buffer manager · log writer</text>
    <rect x="501" y="204" width="213" height="24" rx="6" fill="var(--surface)" stroke="var(--border)"/>
    <text x="607" y="220" text-anchor="middle" fill="var(--text)" font-size="11.5" font-family="Segoe UI, sans-serif">Lock manager · allocation maps</text>

    <rect x="30" y="248" width="700" height="60" rx="12" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="46" y="268" fill="var(--text)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">SQLOS — the SQL operating system</text>
    <rect x="46" y="276" width="165" height="24" rx="6" fill="var(--surface)" stroke="var(--border)"/>
    <text x="128" y="292" text-anchor="middle" fill="var(--text)" font-size="11.5" font-family="Segoe UI, sans-serif">Schedulers · workers</text>
    <rect x="226" y="276" width="165" height="24" rx="6" fill="var(--surface)" stroke="var(--border)"/>
    <text x="308" y="292" text-anchor="middle" fill="var(--text)" font-size="11.5" font-family="Segoe UI, sans-serif">Memory nodes</text>
    <rect x="406" y="276" width="165" height="24" rx="6" fill="var(--surface)" stroke="var(--border)"/>
    <text x="488" y="292" text-anchor="middle" fill="var(--text)" font-size="11.5" font-family="Segoe UI, sans-serif">Async I/O · completion</text>
    <rect x="586" y="276" width="128" height="24" rx="6" fill="var(--surface)" stroke="var(--border)"/>
    <text x="650" y="292" text-anchor="middle" fill="var(--text)" font-size="11.5" font-family="Segoe UI, sans-serif">Waits · deadlocks</text>

    <line x1="380" y1="42" x2="380" y2="52" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a01-arrow)"/>
    <line x1="380" y1="90" x2="380" y2="102" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a01-arrow)"/>
    <line x1="380" y1="164" x2="380" y2="174" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a01-arrow)"/>
    <line x1="380" y1="236" x2="380" y2="246" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a01-arrow)"/>

    <text x="380" y="330" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Requests flow down the stack and results flow back up — SQLOS owns the CPU, memory and I/O underneath both engines.</text>
  </svg>
  <div class="figcaption">Figure 1 — The four cooperating layers of a SQL Server instance.</div>
</div>
`
    },
    {
      h: "SQLOS: schedulers, workers, and tasks",
      html: `
<p>SQLOS does not create an OS thread per query. Instead it maintains a pool of <strong>workers</strong> (thread pool entries) that execute <strong>tasks</strong> (units of work such as a query, a log write, or a background cleanup). One <strong>scheduler</strong> exists per visible logical processor; each scheduler has its own run queue and hands its worker a slice of CPU time before the worker voluntarily yields.</p>
<table>
  <tr><th>SQLOS concept</th><th>What it is</th><th>Where you see it</th></tr>
  <tr><td><strong>Scheduler</strong></td><td>One per logical CPU; owns a run queue and a set of workers</td><td><code>sys.dm_os_schedulers</code></td></tr>
  <tr><td><strong>Worker</strong></td><td>A pooled thread that executes one task at a time</td><td><code>sys.dm_os_workers</code></td></tr>
  <tr><td><strong>Task</strong></td><td>A unit of work assigned to a worker (query, log flush, probe)</td><td><code>sys.dm_os_tasks</code></td></tr>
  <tr><td><strong>Worker thread limit</strong></td><td>Derived from <code>max worker threads</code> (default: auto-computed)</td><td><code>sys.dm_os_sys_info</code></td></tr>
  <tr><td><strong>Preemptive switch</strong></td><td>Worker left SQL's control (network call, OS API, external wait)</td><td>wait types prefixed <code>PREEMPTIVE_</code></td></tr>
</table>
<p>Two consequences matter in production. First, a scheduler with many <em>runnable</em> tasks but no progress means CPU saturation — you will see <code>SOS_SCHEDULER_YIELD</code>. Second, when workers leave SQL's control (calling a web service, linked server, or CLR external code) the scheduler keeps running other work, but those sessions occupy pooled workers and can eventually starve everyone else.</p>
`
    },
    {
      h: "Memory at the architectural level",
      html: `
<p>Memory is divided into <strong>nodes</strong> (mirroring NUMA) and claimed by named <strong>memory clerks</strong>. The buffer pool (topic ch04-06) and plan cache (ch04-08) are simply the two largest clerks; everything else — lock manager, thread structures, columnstore, replication — takes a slice from the same pool.</p>
<pre><code class="language-sql">-- Top memory clerks on this instance (KB)
SELECT TOP 10 type,
       name,
       pages_kb,
       virtual_memory_reserved_kb,
       virtual_memory_committed_kb
FROM   sys.dm_os_memory_clerks
ORDER  BY pages_kb DESC;</code></pre>
<p>If <code>MEMORYCLERK_SQLBUFFERPOOL</code> dwarfs everything else, you are looking at data pages; if <code>MEMORYCLERK_SQLPLAN</code> is unexpectedly large, ad-hoc plans are accumulating (see ch04-08). Reading memory at clerk level tells you <em>which subsystem</em> is consuming the instance, not merely that memory is “used”.</p>
`
    },
    {
      h: "End-to-end path of one batch",
      html: `
<p>Follow a single <code>SELECT</code> through the stack — this path is the backbone of every performance topic that follows:</p>
<ol>
  <li><strong>Protocol layer</strong> reassembles TDS packets into a batch text and hands it to the relational engine</li>
  <li><strong>Parser and algebrizer</strong> build a syntax tree, resolve names against metadata, and bind types</li>
  <li><strong>Optimizer</strong> uses statistics to choose join order, join algorithms, and indexes, producing a compiled plan — cached in the plan cache</li>
  <li><strong>Executor</strong> runs the plan: for each row request, an <em>access method</em> navigates the b-tree or scans a heap</li>
  <li><strong>Buffer manager</strong> checks the buffer pool: a hit is served from RAM, a miss issues an 8-KB read through SQLOS to the file</li>
  <li><strong>Lock manager</strong> grants shared/exclusive locks as rows and pages are touched; log records are written for any modification</li>
  <li>Rows travel back up the same path and are framed into TDS packets for the client</li>
</ol>
<p>Every wait you ever observe is a pause somewhere on this list: <code>PAGEIOLATCH_SH</code> at step 5, <code>LCK_M_X</code> at step 6, <code>CXPACKET</code> during a parallel step 4/5, and so on.</p>
`
    },
    {
      h: "Mapping waits to layers",
      html: `
<p>The fastest triage technique in SQL Server: run wait statistics first, then read them as a map of the stack.</p>
<table>
  <tr><th>Signature wait</th><th>Layer under stress</th><th>First thing to check</th></tr>
  <tr><td><code>PAGEIOLATCH_*</code></td><td>Storage engine → disk</td><td>File-level stalls in <code>sys.dm_io_virtual_file_stats</code></td></tr>
  <tr><td><code>LCK_M_*</code></td><td>Lock manager</td><td>Blocking chain via <code>sys.dm_exec_requests</code> and <code>blocking_session_id</code></td></tr>
  <tr><td><code>SOS_SCHEDULER_YIELD</code></td><td>SQLOS / CPU</td><td>Runnable tasks per scheduler, CPU-bound queries</td></tr>
  <tr><td><code>CXPACKET</code> / <code>CXCONSUMER</code></td><td>Parallel query execution</td><td>Skewed partitions, max degree of parallelism</td></tr>
  <tr><td><code>THREADPOOL</code></td><td>SQLOS worker pool</td><td>Worker exhaustion — sessions waiting for a thread</td></tr>
  <tr><td><code>PREEMPTIVE_*</code></td><td>Outside SQL's control</td><td>External calls (web service, linked server, OS API) in flight</td></tr>
  <tr><td><code>LOG_FLUSH_WAIT</code> / write stalls</td><td>Log writer → LDF</td><td>Log file on slow storage, autogrowth events</td></tr>
</table>
`
    },
    {
      h: "Seeing it live",
      html: `
<p>Two queries establish the architectural baseline of any instance — how many schedulers are working right now, and which subsystem they are waiting on:</p>
<pre><code class="language-sql">-- Scheduler health: queued and pending work per logical CPU
SELECT scheduler_id, cpu_id, status,
       current_tasks_count, runnable_tasks_count,
       active_workers_count, work_queue_count,
       pending_disk_io_count, load_factor
FROM   sys.dm_os_schedulers
WHERE  status = N'VISIBLE ONLINE'
ORDER  BY runnable_tasks_count DESC, pending_disk_io_count DESC;</code></pre>
<pre><code class="language-sql">-- Top 15 resource waits (idle/background waits filtered out)
SELECT TOP 15 wait_type,
       waiting_tasks_count,
       wait_time_ms,
       signal_wait_time_ms,
       wait_time_ms - signal_wait_time_ms AS resource_wait_ms
FROM   sys.dm_os_wait_stats
WHERE  wait_type NOT IN (N'SQLTRACE_BUFFER_FLUSH', N'CLR_SEMAPHORE', N'LAZYWRITER_SLEEP',
                         N'REQUEST_FOR_DEADLOCK_SEARCH', N'XE_TIMER_EVENT', N'SLEEP_TASK',
                         N'WAITFOR', N'HADR_FILESTREAM_IOMGR_IOCOMPLETION', N'CHECKPOINT_QUEUE')
ORDER  BY wait_time_ms DESC;</code></pre>
<p>A healthy idle instance shows mostly background waits. When a steady-state workload shows a dominant <em>resource</em> wait (wait time minus signal wait time), that number points at the layer to investigate next — no guessing required.</p>
`
    }
  ],

  scenario: {
    title: "Every checkout call froze at 11 AM while CPU sat at 4%",
    html: `
<p>An order-processing site reported that all API calls dependent on the database began timing out at 11:03. CPU was 4%, memory was fine, and no query appeared blocked. Checking <code>sys.dm_os_schedulers</code> showed plenty of online schedulers but a growing population of workers sitting in <em>preemptive</em> state, and wait stats were dominated by <code>PREEMPTIVE_*</code> waits with a rising <code>THREADPOOL</code> count.</p>
<p>Diagnosis: a newly deployed integration wrapped an outbound HTTPS call to a tax service <em>inside</em> an open transaction, holding a worker, a connection, and locks while waiting on the network. At peak volume these calls exhausted the worker pool, so ordinary queries could not get a thread — the database looked idle from Windows, but SQLOS was out of workers.</p>
<p>Resolution: kill the offending sessions with approval, deploy a hotfix that performs the external call before opening the transaction, and cap the integration's connection count. Prevention: monitor <code>THREADPOOL</code> waits and preemptive wait totals, and add an architecture review rule — <strong>no external I/O inside an open transaction</strong>.</p>
`
  },

  interview: [
    {
      q: "What are the three main parts of SQL Server, and what does each do?",
      a: "The relational engine (parses, validates, optimises and executes T-SQL, and owns metadata and transaction semantics), the storage engine (page storage, access methods, buffer management, locking and log writing), and SQLOS — the operating-system layer that provides scheduling, memory nodes, asynchronous I/O and wait/latch coordination to both engines."
    },
    {
      q: "What is a scheduler, and how many does an instance have?",
      a: "A scheduler is SQLOS's abstraction of one logical processor: it owns a run queue and executes tasks through pooled workers that yield their CPU slice voluntarily. By default there is one visible scheduler per logical CPU (grouped per NUMA node, and per resource governor scheduler group if configured); you can see them in sys.dm_os_schedulers."
    },
    {
      q: "A user says the server is slow. How do you use internals knowledge to triage?",
      a: "Start with wait statistics and signal-vs-resource waits. PAGEIOLATCH points to storage, LCK_M to blocking, SOS_SCHEDULER_YIELD to CPU, THREADPOOL to worker exhaustion, and PREEMPTIVE_* to work happening outside SQL's control. Each signature names a layer, so the next diagnostic step is chosen by evidence rather than guesswork."
    }
  ],

  quiz: [
    {
      "question": "Which fact is covered in the lesson section “The layered architecture”?",
      "options": [
        "runnable",
        "sys.dm_os_schedulers",
        "0 has been built from the same three cooperating subsystems, plus the client-facing protocol path:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Every version of SQL Server since 7.0 has been built from the same three cooperating subsystems, plus the client-facing protocol path:”"
    },
    {
      "question": "Complete the lesson statement: “Instead it maintains a pool of _____ (thread pool entries) that execute tasks (units of work such as a query, a log write, or a background cleanup).”",
      "options": [
        "SQLOS",
        "workers",
        "Storage engine"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “SQLOS does not create an OS thread per query. Instead it maintains a pool of workers (thread pool entries) that execute tasks (units of work such as a query, a log write, or a background cleanup). One scheduler exists per visible logical processor; each scheduler has its own run queue and hands its worker a slice of CPU time before the worker voluntarily yields.”"
    },
    {
      "question": "Complete the lesson statement: “Memory is divided into _____ (mirroring NUMA) and claimed by named memory clerks.”",
      "options": [
        "nodes",
        "SQLOS",
        "workers"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Memory is divided into nodes (mirroring NUMA) and claimed by named memory clerks. The buffer pool (topic ch04-06) and plan cache (ch04-08) are simply the two largest clerks; everything else — lock manager, thread structures, columnstore, replication — takes a slice from the same pool.”"
    },
    {
      "question": "Which fact is covered in the lesson section “End-to-end path of one batch”?",
      "options": [
        "sys.dm_os_schedulers",
        "sys.dm_os_workers",
        "Follow a single SELECT through the stack — this path is the backbone of every performance topic that follows:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Follow a single SELECT through the stack — this path is the backbone of every performance topic that follows:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Mapping waits to layers”?",
      "options": [
        "sys.dm_os_tasks",
        "The fastest triage technique in SQL Server: run wait statistics first, then read them as a map of the stack.",
        "sys.dm_os_workers"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The fastest triage technique in SQL Server: run wait statistics first, then read them as a map of the stack.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Seeing it live”?",
      "options": [
        "Two queries establish the architectural baseline of any instance — how many schedulers are working right now, and which subsystem they are waiting on:",
        "sys.dm_os_tasks",
        "sys.dm_os_sys_info"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Two queries establish the architectural baseline of any instance — how many schedulers are working right now, and which subsystem they are waiting on:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The layered architecture”?",
      "options": [
        "nodes",
        "which subsystem",
        "The engines never talk to Windows directly for CPU or I/O — they ask SQLOS."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The engines never talk to Windows directly for CPU or I/O — they ask SQLOS. That separation is why SQL Server manages its own threads instead of one thread per request, and why wait statistics (the DBA's primary diagnostic tool) are generated in the first place.”"
    },
    {
      "question": "Complete the lesson statement: “First, a scheduler with many _____ tasks but no progress means CPU saturation — you will see SOS_SCHEDULER_YIELD.”",
      "options": [
        "Worker thread limit",
        "runnable",
        "Task"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Two consequences matter in production. First, a scheduler with many runnable tasks but no progress means CPU saturation — you will see SOS_SCHEDULER_YIELD. Second, when workers leave SQL's control (calling a web service, linked server, or CLR external code) the scheduler keeps running other work, but those sessions occupy pooled workers and can eventually starve everyone else.”"
    },
    {
      "question": "Complete the lesson statement: “Reading memory at clerk level tells you _____ is consuming the instance, not merely that memory is “used”.”",
      "options": [
        "which subsystem",
        "Worker thread limit",
        "Preemptive switch"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “If MEMORYCLERK_SQLBUFFERPOOL dwarfs everything else, you are looking at data pages; if MEMORYCLERK_SQLPLAN is unexpectedly large, ad-hoc plans are accumulating (see ch04-08). Reading memory at clerk level tells you which subsystem is consuming the instance, not merely that memory is “used”.”"
    },
    {
      "question": "Which fact is covered in the lesson section “End-to-end path of one batch”?",
      "options": [
        "which subsystem",
        "The fastest triage technique in SQL Server: run wait statistics first, then read them as a map of the stack.",
        "Every wait you ever observe is a pause somewhere on this list: PAGEIOLATCH_SH at step 5, LCK_M_X at step 6, CXPACKET during a parallel step 4/5, and so on."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Every wait you ever observe is a pause somewhere on this list: PAGEIOLATCH_SH at step 5, LCK_M_X at step 6, CXPACKET during a parallel step 4/5, and so on.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “The layered architecture”?",
      "options": [
        "runnable",
        "sys.dm_os_schedulers",
        "0 has been built from the same three cooperating subsystems, plus the client-facing protocol path:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Every version of SQL Server since 7.0 has been built from the same three cooperating subsystems, plus the client-facing protocol path:”"
    },
    {
      "question": "Complete the lesson statement: “Instead it maintains a pool of _____ (thread pool entries) that execute tasks (units of work such as a query, a log write, or a background cleanup).”",
      "options": [
        "SQLOS",
        "workers",
        "Storage engine"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “SQLOS does not create an OS thread per query. Instead it maintains a pool of workers (thread pool entries) that execute tasks (units of work such as a query, a log write, or a background cleanup). One scheduler exists per visible logical processor; each scheduler has its own run queue and hands its worker a slice of CPU time before the worker voluntarily yields.”"
    },
    {
      "question": "Complete the lesson statement: “Memory is divided into _____ (mirroring NUMA) and claimed by named memory clerks.”",
      "options": [
        "nodes",
        "SQLOS",
        "workers"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Memory is divided into nodes (mirroring NUMA) and claimed by named memory clerks. The buffer pool (topic ch04-06) and plan cache (ch04-08) are simply the two largest clerks; everything else — lock manager, thread structures, columnstore, replication — takes a slice from the same pool.”"
    },
    {
      "question": "Which fact is covered in the lesson section “End-to-end path of one batch”?",
      "options": [
        "sys.dm_os_schedulers",
        "sys.dm_os_workers",
        "Follow a single SELECT through the stack — this path is the backbone of every performance topic that follows:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Follow a single SELECT through the stack — this path is the backbone of every performance topic that follows:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Mapping waits to layers”?",
      "options": [
        "sys.dm_os_tasks",
        "The fastest triage technique in SQL Server: run wait statistics first, then read them as a map of the stack.",
        "sys.dm_os_workers"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The fastest triage technique in SQL Server: run wait statistics first, then read them as a map of the stack.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Seeing it live”?",
      "options": [
        "Two queries establish the architectural baseline of any instance — how many schedulers are working right now, and which subsystem they are waiting on:",
        "sys.dm_os_tasks",
        "sys.dm_os_sys_info"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Two queries establish the architectural baseline of any instance — how many schedulers are working right now, and which subsystem they are waiting on:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The layered architecture”?",
      "options": [
        "nodes",
        "which subsystem",
        "The engines never talk to Windows directly for CPU or I/O — they ask SQLOS."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The engines never talk to Windows directly for CPU or I/O — they ask SQLOS. That separation is why SQL Server manages its own threads instead of one thread per request, and why wait statistics (the DBA's primary diagnostic tool) are generated in the first place.”"
    },
    {
      "question": "Complete the lesson statement: “First, a scheduler with many _____ tasks but no progress means CPU saturation — you will see SOS_SCHEDULER_YIELD.”",
      "options": [
        "Worker thread limit",
        "runnable",
        "Task"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Two consequences matter in production. First, a scheduler with many runnable tasks but no progress means CPU saturation — you will see SOS_SCHEDULER_YIELD. Second, when workers leave SQL's control (calling a web service, linked server, or CLR external code) the scheduler keeps running other work, but those sessions occupy pooled workers and can eventually starve everyone else.”"
    },
    {
      "question": "Complete the lesson statement: “Reading memory at clerk level tells you _____ is consuming the instance, not merely that memory is “used”.”",
      "options": [
        "which subsystem",
        "Worker thread limit",
        "Preemptive switch"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “If MEMORYCLERK_SQLBUFFERPOOL dwarfs everything else, you are looking at data pages; if MEMORYCLERK_SQLPLAN is unexpectedly large, ad-hoc plans are accumulating (see ch04-08). Reading memory at clerk level tells you which subsystem is consuming the instance, not merely that memory is “used”.”"
    },
    {
      "question": "Which fact is covered in the lesson section “End-to-end path of one batch”?",
      "options": [
        "which subsystem",
        "The fastest triage technique in SQL Server: run wait statistics first, then read them as a map of the stack.",
        "Every wait you ever observe is a pause somewhere on this list: PAGEIOLATCH_SH at step 5, LCK_M_X at step 6, CXPACKET during a parallel step 4/5, and so on."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Every wait you ever observe is a pause somewhere on this list: PAGEIOLATCH_SH at step 5, LCK_M_X at step 6, CXPACKET during a parallel step 4/5, and so on.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “The layered architecture”?",
      "options": [
        "runnable",
        "sys.dm_os_schedulers",
        "0 has been built from the same three cooperating subsystems, plus the client-facing protocol path:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Every version of SQL Server since 7.0 has been built from the same three cooperating subsystems, plus the client-facing protocol path:”"
    },
    {
      "question": "Complete the lesson statement: “Instead it maintains a pool of _____ (thread pool entries) that execute tasks (units of work such as a query, a log write, or a background cleanup).”",
      "options": [
        "SQLOS",
        "workers",
        "Storage engine"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “SQLOS does not create an OS thread per query. Instead it maintains a pool of workers (thread pool entries) that execute tasks (units of work such as a query, a log write, or a background cleanup). One scheduler exists per visible logical processor; each scheduler has its own run queue and hands its worker a slice of CPU time before the worker voluntarily yields.”"
    },
    {
      "question": "Complete the lesson statement: “Memory is divided into _____ (mirroring NUMA) and claimed by named memory clerks.”",
      "options": [
        "nodes",
        "SQLOS",
        "workers"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Memory is divided into nodes (mirroring NUMA) and claimed by named memory clerks. The buffer pool (topic ch04-06) and plan cache (ch04-08) are simply the two largest clerks; everything else — lock manager, thread structures, columnstore, replication — takes a slice from the same pool.”"
    },
    {
      "question": "Which fact is covered in the lesson section “End-to-end path of one batch”?",
      "options": [
        "sys.dm_os_schedulers",
        "sys.dm_os_workers",
        "Follow a single SELECT through the stack — this path is the backbone of every performance topic that follows:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Follow a single SELECT through the stack — this path is the backbone of every performance topic that follows:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Mapping waits to layers”?",
      "options": [
        "sys.dm_os_tasks",
        "The fastest triage technique in SQL Server: run wait statistics first, then read them as a map of the stack.",
        "sys.dm_os_workers"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The fastest triage technique in SQL Server: run wait statistics first, then read them as a map of the stack.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Seeing it live”?",
      "options": [
        "Two queries establish the architectural baseline of any instance — how many schedulers are working right now, and which subsystem they are waiting on:",
        "sys.dm_os_tasks",
        "sys.dm_os_sys_info"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Two queries establish the architectural baseline of any instance — how many schedulers are working right now, and which subsystem they are waiting on:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The layered architecture”?",
      "options": [
        "nodes",
        "which subsystem",
        "The engines never talk to Windows directly for CPU or I/O — they ask SQLOS."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The engines never talk to Windows directly for CPU or I/O — they ask SQLOS. That separation is why SQL Server manages its own threads instead of one thread per request, and why wait statistics (the DBA's primary diagnostic tool) are generated in the first place.”"
    },
    {
      "question": "Complete the lesson statement: “First, a scheduler with many _____ tasks but no progress means CPU saturation — you will see SOS_SCHEDULER_YIELD.”",
      "options": [
        "Worker thread limit",
        "runnable",
        "Task"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Two consequences matter in production. First, a scheduler with many runnable tasks but no progress means CPU saturation — you will see SOS_SCHEDULER_YIELD. Second, when workers leave SQL's control (calling a web service, linked server, or CLR external code) the scheduler keeps running other work, but those sessions occupy pooled workers and can eventually starve everyone else.”"
    },
    {
      "question": "Complete the lesson statement: “Reading memory at clerk level tells you _____ is consuming the instance, not merely that memory is “used”.”",
      "options": [
        "which subsystem",
        "Worker thread limit",
        "Preemptive switch"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “If MEMORYCLERK_SQLBUFFERPOOL dwarfs everything else, you are looking at data pages; if MEMORYCLERK_SQLPLAN is unexpectedly large, ad-hoc plans are accumulating (see ch04-08). Reading memory at clerk level tells you which subsystem is consuming the instance, not merely that memory is “used”.”"
    },
    {
      "question": "Which fact is covered in the lesson section “End-to-end path of one batch”?",
      "options": [
        "which subsystem",
        "The fastest triage technique in SQL Server: run wait statistics first, then read them as a map of the stack.",
        "Every wait you ever observe is a pause somewhere on this list: PAGEIOLATCH_SH at step 5, LCK_M_X at step 6, CXPACKET during a parallel step 4/5, and so on."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Every wait you ever observe is a pause somewhere on this list: PAGEIOLATCH_SH at step 5, LCK_M_X at step 6, CXPACKET during a parallel step 4/5, and so on.”"
    }
  ],
  takeaways: [
    "SQL Server = protocol layer + relational engine + storage engine + SQLOS, with SQLOS owning CPU, memory and I/O for everything above it",
    "SQLOS runs schedulers (one per logical CPU), pooled workers and tasks — not one OS thread per query",
    "Memory is claimed by named clerks; the buffer pool and plan cache are just the two biggest ones",
    "A batch flows: TDS → parse → algebrize → optimise → execute → access method → buffer pool → file I/O, and back up again",
    "Wait statistics are a map of the architecture: each wait type names the layer that is struggling",
    "Preemptive waits mean a worker has left SQL's control — the classic cause of worker starvation"
  ]
};
