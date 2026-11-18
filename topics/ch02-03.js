/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch02-03.html */

window.TOPIC = {
  id: "ch02-03",
  title: "SQL Server Architecture Overview",

  lead: "SQL Server is a client-server engine made of cooperating layers — a relational engine that plans your SQL and a storage engine that moves pages — and knowing that layout is what turns mysterious slowness into a diagnosis.",

  objectives: [
    "Describe the major components of a SQL Server instance",
    "Trace a query from client connection through plan to page read",
    "Explain the roles of data files, filegroups, and the transaction log",
    "Identify the system databases and what each one is for",
    "Know where to look first when diagnosing an instance-level problem"
  ],

  sections: [
    {
      h: "Instance, engine, and client",
      html: `
<p>A <strong>SQL Server instance</strong> is one running installation of the database engine with its own system databases, logins, configuration, and memory. A server can host several instances side by side; each is an independent little universe. Clients — applications, drivers, SSMS — never touch files directly. They open a connection over <strong>TDS</strong> (Tabular Data Stream) and speak SQL; the engine does everything else.</p>
<p>Architecturally the engine splits into two halves that work together on every statement:</p>
<ul>
  <li><strong>Relational engine (query processor)</strong> — parses and binds SQL, chooses an execution plan, compiles and caches it, and enforces security</li>
  <li><strong>Storage engine</strong> — turns the plan's logical reads into physical page reads and writes, manages the buffer pool, locking, and the transaction log</li>
</ul>
<blockquote>The relational engine plans the work and the storage engine accesses data; performance issues can involve both, as well as workload, configuration, and the operating system.</blockquote>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="SQL Server instance architecture">
    <defs>
      <marker id="sa-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="230" y="8" width="300" height="40" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="33" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Clients over TDS · apps · SSMS · drivers</text>

    <rect x="60" y="68" width="640" height="78" rx="14" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="92" text-anchor="middle" fill="var(--accent-strong)" font-size="16" font-weight="700" font-family="Segoe UI, sans-serif">Relational engine (query processor)</text>

    <rect x="90" y="102" width="270" height="34" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="225" y="124" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Parser → binder → optimiser</text>

    <rect x="400" y="102" width="270" height="34" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="535" y="124" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Plan cache · security &amp; permissions</text>

    <rect x="60" y="164" width="640" height="78" rx="14" fill="var(--surface-2)" stroke="var(--border)" stroke-width="2"/>
    <text x="380" y="188" text-anchor="middle" fill="var(--text)" font-size="16" font-weight="700" font-family="Segoe UI, sans-serif">Storage engine</text>

    <rect x="90" y="198" width="270" height="34" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="225" y="220" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Buffer pool · access methods</text>

    <rect x="400" y="198" width="270" height="34" rx="8" fill="var(--surface)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="535" y="220" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Lock manager · log manager</text>

    <rect x="60" y="262" width="210" height="44" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="165" y="280" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Data files · MDF / NDF</text>
    <text x="165" y="298" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">tables and indexes</text>

    <rect x="300" y="262" width="180" height="44" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="390" y="280" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Log file · LDF</text>
    <text x="390" y="298" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">write-ahead journal</text>

    <rect x="520" y="262" width="180" height="44" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="610" y="280" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">tempdb</text>
    <text x="610" y="298" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">scratch · version store</text>

    <line x1="380" y1="48" x2="380" y2="66" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#sa-arrow)"/>
    <line x1="380" y1="146" x2="380" y2="162" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#sa-arrow)"/>
    <line x1="200" y1="242" x2="175" y2="260" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#sa-arrow)"/>
    <line x1="380" y1="242" x2="388" y2="260" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#sa-arrow)"/>
    <line x1="560" y1="242" x2="595" y2="260" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#sa-arrow)"/>

    <text x="380" y="330" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">SQLOS underneath both engines: scheduling, memory, and asynchronous I/O</text>
  </svg>
  <div class="figcaption">Figure 1 — A query descends through the relational engine to the storage engine and the files.</div>
</div>
`
    },
    {
      h: "What happens when you execute a query",
      html: `
<p>Understanding the request lifecycle explains most “why is it slow” conversations:</p>
<ul>
  <li><strong>Connection</strong> — the client authenticates a login and a default database is selected</li>
  <li><strong>Parse &amp; bind</strong> — syntax is checked, object names resolved, permissions verified against metadata</li>
  <li><strong>Optimise</strong> — the optimiser estimates cost from statistics and picks join order, join type, and indexes; the plan is cached</li>
  <li><strong>Execute</strong> — the storage engine reads pages from the buffer pool (or disk), takes locks per the isolation level, and writes log records</li>
  <li><strong>Return</strong> — rows stream back over TDS to the client</li>
</ul>
<p>When a reusable cached plan is available, SQL Server can avoid compiling the statement again. Cache reuse is not guaranteed: plans can be evicted, invalidated, or recompiled, and differences in query text or parameterization can affect reuse. Parameterized queries can reduce duplicate ad hoc plans, though plan quality still depends on the workload and parameter values.</p>
`
    },
    {
      h: "Files, filegroups, and system databases",
      html: `
<p>Data is organised into <strong>filegroups</strong> — named groups of data files used for allocation and administration. Separating files across storage can affect I/O, depending on the storage system and workload. File or filegroup backups are supported, but their use in a recoverable backup strategy depends on the database state, recovery model, and restore sequence.</p>
<pre><code class="language-sql">CREATE DATABASE OrderDb
ON PRIMARY
( NAME       = N'OrderDb',
  FILENAME   = 'E:/Data/OrderDb.mdf',
  SIZE       = 8192MB,
  FILEGROWTH = 1024MB ),
FILEGROUP FG_History
( NAME       = N'OrderDb_hist',
  FILENAME   = 'E:/Data/OrderDb_hist.ndf',
  SIZE       = 4096MB,
  FILEGROWTH = 512MB )
LOG ON
( NAME       = N'OrderDb_log',
  FILENAME   = 'E:/Log/OrderDb_log.ldf',
  SIZE       = 2048MB,
  FILEGROWTH = 512MB);
GO</code></pre>
<p>Every instance also ships with system databases. Learn these — several recovery scenarios depend on knowing their roles:</p>
<table>
  <tr><th>System database</th><th>Role</th><th>DBA implication</th></tr>
  <tr><td><strong>master</strong></td><td>Instance metadata: logins, endpoints, linked servers</td><td>Back up on every meaningful change; restore before anything else after a failure</td></tr>
  <tr><td><strong>model</strong></td><td>Template for every new database</td><td>Changing it changes all future databases</td></tr>
  <tr><td><strong>msdb</strong></td><td>SQL Agent jobs, alerts, backup history</td><td>Back it up — losing it loses your backup schedule and history</td></tr>
  <tr><td><strong>tempdb</strong></td><td>Scratch space: temp tables, sorts, version store</td><td>Rebuilt empty at every restart; sized and placed deliberately</td></tr>
</table>
`
    },
    {
      h: "What the DBA monitors at the instance level",
      html: `
<p>Before tuning any single query, the DBA checks the instance: is it running, is memory sane, is the log healthy, are jobs succeeding? The DMVs answer these questions in seconds:</p>
<pre><code class="language-sql">-- Instance basics: version, uptime, memory targets
SELECT @@SERVERNAME                                   AS server_name,
       sqlserver_start_time,
       DATEDIFF(HOUR, sqlserver_start_time, GETDATE()) AS uptime_hours
FROM   sys.dm_os_sys_info;

-- Top 10 resource consumers by average CPU time
SELECT TOP 10
       st.text,
       qs.execution_count,
       CONVERT(decimal(19,2), qs.total_worker_time) / NULLIF(qs.execution_count, 0)
                                                      AS avg_cpu_microseconds
FROM   sys.dm_exec_query_stats AS qs
CROSS  APPLY sys.dm_exec_sql_text(qs.sql_handle) AS st
ORDER  BY avg_cpu_microseconds DESC;</code></pre>
<p><code>total_worker_time</code> is reported in microseconds, and this DMV summarizes executions for plans that remain in cache; it is not a complete workload history.</p>
<p>Pair these with the error log, SQL Agent job history, and disk space — the three places instance-level failures announce themselves first.</p>
<p><strong>Common pitfalls:</strong> running every database on the system drive; leaving memory settings unreviewed on a shared server; enabling authentication options without reviewing account configuration; and restarting the service as a “fix” without reading the error log for the actual fault.</p>
`
    }
  ],

  scenario: {
    title: "Every application timed out after a routine failover",
    html: `
<p>At 2 AM an availability group failed over to the secondary replica. Applications reconnected — and every login began timing out. The engine was running, CPU was idle, and the error log showed nothing fatal. Performance Monitor showed SQL Server's target memory below the level expected for the workload while the operating system was under memory pressure; other processes were consuming much of the available RAM.</p>
<p>Resolution: the team measured SQL Server and operating-system memory use, configured <code>max server memory</code> to leave appropriate headroom for the OS and required agents, and verified the memory counters and workload after the change. Prevention: a build checklist now checks memory configuration, data/log file placement, and Agent dependencies on every replica — <strong>the node was healthy as hardware and broken as configuration</strong>, which is exactly the gap an architecture-level view catches.</p>
`
  },

  interview: [
    {
      q: "Walk me through what happens when a query is executed in SQL Server.",
      a: "The connection authenticates, the relational engine parses and binds the statement against metadata and checks permissions, the optimiser produces and caches a plan from statistics, and the storage engine executes it — reading pages from the buffer pool or disk, taking locks, and writing log records — then rows stream back to the client."
    },
    {
      q: "What are the system databases and which one do you back up first after a failure?",
      a: "master (instance metadata), model (template for new databases), msdb (Agent jobs and backup history), and tempdb (scratch, rebuilt at restart). After a failure you restore master first — without it the instance will not start properly or recognise its databases and logins."
    },
    {
      q: "Relational engine or storage engine — where would you look for a plan-based problem versus an I/O problem?",
      a: "Plan and CPU problems (bad join order, missing predicate, parameter sniffing) sit in the relational engine: execution plans and query stats. I/O and concurrency problems (page reads, latch waits, blocking) sit in the storage engine: wait statistics, buffer pool, and the lock manager."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is one running installation of the database engine with its own system databases, logins, configuration, and memory.”",
      "options": [
        "SQL Server instance",
        "what",
        "how the bytes move"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A SQL Server instance is one running installation of the database engine with its own system databases, logins, configuration, and memory. A server can host several instances side by side; each is an independent little universe. Clients — applications, drivers, SSMS — never touch files directly. They open a connection over TDS (Tabular Data Stream) and speak SQL; the engine does everything else.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What happens when you execute a query”?",
      "options": [
        "Back up on every meaningful change; restore before anything else after a failure",
        "Changing it changes all future databases",
        "Understanding the request lifecycle explains most “why is it slow” conversations:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Understanding the request lifecycle explains most “why is it slow” conversations:”"
    },
    {
      "question": "Complete the lesson statement: “Data is organised into _____ — named buckets of files that tables and indexes are placed into.”",
      "options": [
        "Connection",
        "filegroups",
        "how the bytes move"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Data is organised into filegroups — named buckets of files that tables and indexes are placed into. Splitting data across filegroups on separate volumes can spread I/O; putting archival tables on their own filegroup lets you back them up independently.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What the DBA monitors at the instance level”?",
      "options": [
        "Before tuning any single query, the DBA checks the instance: is it running, is memory sane, is the log healthy, are jobs succeeding?",
        "Back up on every meaningful change; restore before anything else after a failure",
        "Changing it changes all future databases"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Before tuning any single query, the DBA checks the instance: is it running, is memory sane, is the log healthy, are jobs succeeding? The DMVs answer these questions in seconds:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Instance, engine, and client”?",
      "options": [
        "Rebuilt empty at every restart; sized and placed deliberately",
        "Before tuning any single query, the DBA checks the instance: is it running, is memory sane, is the log healthy, are jobs succeeding?",
        "Architecturally the engine splits into two halves that work together on every statement:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Architecturally the engine splits into two halves that work together on every statement:”"
    },
    {
      "question": "Which fact is covered in the lesson section “What happens when you execute a query”?",
      "options": [
        "Pair these with the error log, SQL Agent job history, and disk space — the three places instance-level failures announce themselves first.",
        "A cached plan means the second execution of a query skips parsing and optimisation.",
        "Before tuning any single query, the DBA checks the instance: is it running, is memory sane, is the log healthy, are jobs succeeding?"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A cached plan means the second execution of a query skips parsing and optimisation. That is why parameterised queries beat string-concatenated ones: the same shape hits the cache, instead of filling it with thousands of near-identical plans.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Files, filegroups, and system databases”?",
      "options": [
        "Every instance also ships with system databases.",
        "Changing it changes all future databases",
        "Back it up — losing it loses your backup schedule and history"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Every instance also ships with system databases. Learn these — several recovery scenarios depend on knowing their roles:”"
    },
    {
      "question": "Which fact is covered in the lesson section “What the DBA monitors at the instance level”?",
      "options": [
        "Before tuning any single query, the DBA checks the instance: is it running, is memory sane, is the log healthy, are jobs succeeding?",
        "Common pitfalls:",
        "Pair these with the error log, SQL Agent job history, and disk space — the three places instance-level failures announce themselves first."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Pair these with the error log, SQL Agent job history, and disk space — the three places instance-level failures announce themselves first.”"
    },
    {
      "question": "In the “Files, filegroups, and system databases” table, what is listed for “master” under “DBA implication”?",
      "options": [
        "TDS",
        "Back up on every meaningful change; restore before anything else after a failure",
        "Common pitfalls:"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “master” as “Back up on every meaningful change; restore before anything else after a failure”."
    },
    {
      "question": "Complete the lesson statement: “_____ running every database on the system drive; leaving max server memory at its default on a shared server; installing default instances with…”",
      "options": [
        "Common pitfalls:",
        "master",
        "model"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Common pitfalls: running every database on the system drive; leaving max server memory at its default on a shared server; installing default instances with mixed authentication and a blank sa password; and restarting the service as a “fix” without ever reading the error log for the actual fault.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is one running installation of the database engine with its own system databases, logins, configuration, and memory.”",
      "options": [
        "SQL Server instance",
        "what",
        "how the bytes move"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A SQL Server instance is one running installation of the database engine with its own system databases, logins, configuration, and memory. A server can host several instances side by side; each is an independent little universe. Clients — applications, drivers, SSMS — never touch files directly. They open a connection over TDS (Tabular Data Stream) and speak SQL; the engine does everything else.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What happens when you execute a query”?",
      "options": [
        "Back up on every meaningful change; restore before anything else after a failure",
        "Changing it changes all future databases",
        "Understanding the request lifecycle explains most “why is it slow” conversations:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Understanding the request lifecycle explains most “why is it slow” conversations:”"
    },
    {
      "question": "Complete the lesson statement: “Data is organised into _____ — named buckets of files that tables and indexes are placed into.”",
      "options": [
        "Connection",
        "filegroups",
        "how the bytes move"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Data is organised into filegroups — named buckets of files that tables and indexes are placed into. Splitting data across filegroups on separate volumes can spread I/O; putting archival tables on their own filegroup lets you back them up independently.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What the DBA monitors at the instance level”?",
      "options": [
        "Before tuning any single query, the DBA checks the instance: is it running, is memory sane, is the log healthy, are jobs succeeding?",
        "Back up on every meaningful change; restore before anything else after a failure",
        "Changing it changes all future databases"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Before tuning any single query, the DBA checks the instance: is it running, is memory sane, is the log healthy, are jobs succeeding? The DMVs answer these questions in seconds:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Instance, engine, and client”?",
      "options": [
        "Rebuilt empty at every restart; sized and placed deliberately",
        "Before tuning any single query, the DBA checks the instance: is it running, is memory sane, is the log healthy, are jobs succeeding?",
        "Architecturally the engine splits into two halves that work together on every statement:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Architecturally the engine splits into two halves that work together on every statement:”"
    },
    {
      "question": "Which fact is covered in the lesson section “What happens when you execute a query”?",
      "options": [
        "Pair these with the error log, SQL Agent job history, and disk space — the three places instance-level failures announce themselves first.",
        "A cached plan means the second execution of a query skips parsing and optimisation.",
        "Before tuning any single query, the DBA checks the instance: is it running, is memory sane, is the log healthy, are jobs succeeding?"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A cached plan means the second execution of a query skips parsing and optimisation. That is why parameterised queries beat string-concatenated ones: the same shape hits the cache, instead of filling it with thousands of near-identical plans.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Files, filegroups, and system databases”?",
      "options": [
        "Every instance also ships with system databases.",
        "Changing it changes all future databases",
        "Back it up — losing it loses your backup schedule and history"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Every instance also ships with system databases. Learn these — several recovery scenarios depend on knowing their roles:”"
    },
    {
      "question": "Which fact is covered in the lesson section “What the DBA monitors at the instance level”?",
      "options": [
        "Before tuning any single query, the DBA checks the instance: is it running, is memory sane, is the log healthy, are jobs succeeding?",
        "Common pitfalls:",
        "Pair these with the error log, SQL Agent job history, and disk space — the three places instance-level failures announce themselves first."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Pair these with the error log, SQL Agent job history, and disk space — the three places instance-level failures announce themselves first.”"
    },
    {
      "question": "In the “Files, filegroups, and system databases” table, what is listed for “master” under “DBA implication”?",
      "options": [
        "TDS",
        "Back up on every meaningful change; restore before anything else after a failure",
        "Common pitfalls:"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “master” as “Back up on every meaningful change; restore before anything else after a failure”."
    },
    {
      "question": "Complete the lesson statement: “_____ running every database on the system drive; leaving max server memory at its default on a shared server; installing default instances with…”",
      "options": [
        "Common pitfalls:",
        "master",
        "model"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Common pitfalls: running every database on the system drive; leaving max server memory at its default on a shared server; installing default instances with mixed authentication and a blank sa password; and restarting the service as a “fix” without ever reading the error log for the actual fault.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is one running installation of the database engine with its own system databases, logins, configuration, and memory.”",
      "options": [
        "SQL Server instance",
        "what",
        "how the bytes move"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A SQL Server instance is one running installation of the database engine with its own system databases, logins, configuration, and memory. A server can host several instances side by side; each is an independent little universe. Clients — applications, drivers, SSMS — never touch files directly. They open a connection over TDS (Tabular Data Stream) and speak SQL; the engine does everything else.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What happens when you execute a query”?",
      "options": [
        "Back up on every meaningful change; restore before anything else after a failure",
        "Changing it changes all future databases",
        "Understanding the request lifecycle explains most “why is it slow” conversations:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Understanding the request lifecycle explains most “why is it slow” conversations:”"
    },
    {
      "question": "Complete the lesson statement: “Data is organised into _____ — named buckets of files that tables and indexes are placed into.”",
      "options": [
        "Connection",
        "filegroups",
        "how the bytes move"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Data is organised into filegroups — named buckets of files that tables and indexes are placed into. Splitting data across filegroups on separate volumes can spread I/O; putting archival tables on their own filegroup lets you back them up independently.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What the DBA monitors at the instance level”?",
      "options": [
        "Before tuning any single query, the DBA checks the instance: is it running, is memory sane, is the log healthy, are jobs succeeding?",
        "Back up on every meaningful change; restore before anything else after a failure",
        "Changing it changes all future databases"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Before tuning any single query, the DBA checks the instance: is it running, is memory sane, is the log healthy, are jobs succeeding? The DMVs answer these questions in seconds:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Instance, engine, and client”?",
      "options": [
        "Rebuilt empty at every restart; sized and placed deliberately",
        "Before tuning any single query, the DBA checks the instance: is it running, is memory sane, is the log healthy, are jobs succeeding?",
        "Architecturally the engine splits into two halves that work together on every statement:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Architecturally the engine splits into two halves that work together on every statement:”"
    },
    {
      "question": "Which fact is covered in the lesson section “What happens when you execute a query”?",
      "options": [
        "Pair these with the error log, SQL Agent job history, and disk space — the three places instance-level failures announce themselves first.",
        "A cached plan means the second execution of a query skips parsing and optimisation.",
        "Before tuning any single query, the DBA checks the instance: is it running, is memory sane, is the log healthy, are jobs succeeding?"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A cached plan means the second execution of a query skips parsing and optimisation. That is why parameterised queries beat string-concatenated ones: the same shape hits the cache, instead of filling it with thousands of near-identical plans.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Files, filegroups, and system databases”?",
      "options": [
        "Every instance also ships with system databases.",
        "Changing it changes all future databases",
        "Back it up — losing it loses your backup schedule and history"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Every instance also ships with system databases. Learn these — several recovery scenarios depend on knowing their roles:”"
    },
    {
      "question": "Which fact is covered in the lesson section “What the DBA monitors at the instance level”?",
      "options": [
        "Before tuning any single query, the DBA checks the instance: is it running, is memory sane, is the log healthy, are jobs succeeding?",
        "Common pitfalls:",
        "Pair these with the error log, SQL Agent job history, and disk space — the three places instance-level failures announce themselves first."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Pair these with the error log, SQL Agent job history, and disk space — the three places instance-level failures announce themselves first.”"
    },
    {
      "question": "In the “Files, filegroups, and system databases” table, what is listed for “master” under “DBA implication”?",
      "options": [
        "TDS",
        "Back up on every meaningful change; restore before anything else after a failure",
        "Common pitfalls:"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “master” as “Back up on every meaningful change; restore before anything else after a failure”."
    },
    {
      "question": "Complete the lesson statement: “_____ running every database on the system drive; leaving max server memory at its default on a shared server; installing default instances with…”",
      "options": [
        "Common pitfalls:",
        "master",
        "model"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Common pitfalls: running every database on the system drive; leaving max server memory at its default on a shared server; installing default instances with mixed authentication and a blank sa password; and restarting the service as a “fix” without ever reading the error log for the actual fault.”"
    }
  ],
  takeaways: [
    "A SQL Server instance is one engine with its own system databases, logins, and memory; clients connect over TDS",
    "The relational engine plans and secures queries; the storage engine moves pages, locks rows, and writes the log",
    "Data lives in files grouped into filegroups; the log is a separate write-ahead journal; tempdb is scratch",
    "master, model, and msdb are all worth backing up — tempdb is rebuilt at every restart",
    "Diagnose top-down: instance health and DMVs first, single-query tuning second"
  ]
};
