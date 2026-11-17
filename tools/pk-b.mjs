/* Practical knowledge: practical-05 .. practical-07. */

export const P2 = {
  "practical-05": {
    lead: "A hands-on SQL Server Agent lab: create jobs with multiple steps and schedules, configure operators and notifications, investigate job failures, and automate a maintenance task safely.",
    objectives: [
      "Create a multi-step job with a clear success/failure flow",
      "Attach a schedule and verify it fires",
      "Configure an operator and failure notification",
      "Investigate failed steps with job history",
      "Assign safe job ownership and proxies"
    ],
    paras: [
      "This lab turns the Agent from a black box into a tool you can inspect and trust. You will build a job, watch it run, deliberately make a step fail, and then diagnose the failure from msdb.",
      "Confirm the SQL Server Agent service is running first. If it is stopped, none of your jobs will ever execute and the symptoms look identical to a broken schedule.",
      "A job is a container of steps; each step can run T-SQL, PowerShell, SSIS or a command. Steps execute in order and the outcome of each controls what runs next — that is how you build branching maintenance workflows.",
      "The flow below shows the lifecycle you will exercise: create job, add steps, set a schedule, run it, then read the history to verify and diagnose.",
      "Create a job with one T-SQL step that writes a timestamp into a log table, and a second step that checks the row count. Set step two to run only if step one succeeds — the default flow for dependent steps.",
      "Attach a schedule that runs every minute for a short test window, then disable it once you have observed a few executions. Leaving test schedules enabled is a common source of surprise load.",
      "Configure an operator and set the job to notify on failure. Database Mail must be configured for email to work; if mail is unavailable, note the notification configuration even if you cannot send in the lab.",
      "Job ownership is a frequent hidden cause of failure. If the owner is disabled or lacks permissions, the job fails even though the definition looks perfect — always verify owner and history together."
    ],
    code: [
      { lang: "sql", body: "-- Is Agent running and set to start automatically?\nSELECT servicename, status_desc, startup_type_desc\nFROM   sys.dm_server_services\nWHERE  servicename LIKE '%Agent%';\nGO\n-- Scratch log table for the job to write to\nCREATE TABLE dbo.AgentLabLog\n(\n  id        int IDENTITY(1,1) PRIMARY KEY,\n  ran_at    datetime2(0) NOT NULL DEFAULT SYSDATETIME(),\n  step_note nvarchar(100) NOT NULL\n);\nGO" },
      { lang: "sql", body: "EXEC msdb.dbo.sp_add_job\n  @job_name = N'AgentLab_Heartbeat';\nGO\nEXEC msdb.dbo.sp_add_jobstep\n  @job_name = N'AgentLab_Heartbeat',\n  @step_name = N'Write heartbeat',\n  @subsystem = N'TSQL',\n  @command = N'INSERT dbo.AgentLabLog (step_note) VALUES (N''heartbeat'');',\n  @on_success_action = 3;\nGO\nEXEC msdb.dbo.sp_add_schedule\n  @schedule_name = N'Every minute (lab)',\n  @freq_type = 4, @freq_interval = 1,\n  @freq_subday_type = 4, @freq_subday_interval = 1;\nGO\nEXEC msdb.dbo.sp_attach_schedule\n  @job_name = N'AgentLab_Heartbeat',\n  @schedule_name = N'Every minute (lab)';\nGO" },
      { lang: "sql", body: "-- Recent job history, including failures\nSELECT j.name AS job_name, h.step_id, h.step_name,\n       h.run_date, h.run_time,\n       CASE h.run_status WHEN 0 THEN 'FAIL' WHEN 1 THEN 'OK' ELSE 'OTHER' END AS outcome,\n       h.message\nFROM   msdb.dbo.sysjobs j\nJOIN   msdb.dbo.sysjobhistory h ON j.job_id = h.job_id\nWHERE  j.name = N'AgentLab_Heartbeat'\nORDER BY h.run_date DESC, h.run_time DESC;\nGO\n-- Verify the job actually wrote rows\nSELECT count(*) AS heartbeat_rows, max(ran_at) AS last_run\nFROM   dbo.AgentLabLog;\nGO" }
    ],
    tables: [
      ["Concept", "Meaning", "Where to check", "Job", "Unit of automated work", "msdb.dbo.sysjobs", "Step", "A single task in a job", "sysjobsteps", "Schedule", "When the job runs", "sysschedules"],
      ["Failure cause", "Symptom", "Fix", "Agent stopped", "Nothing runs at all", "Start service, set Automatic", "Disabled owner", "Job fails silently", "Reassign to a valid service account", "Missing permission", "Step fails with error 5 / login failed", "Grant rights or use a proxy", "No notification", "Nobody knows it failed", "Configure operator + Database Mail"]
    ],
    diagram: { label: "SQL Server Agent job lifecycle", caption: "Define job, add steps, attach a schedule, execute, then read history to verify and diagnose.", nodes: ["Create job and steps", "Attach schedule", "Agent service executes job", "Steps run in order", "History + notification record result"] },
    steps: [
      "Confirm the SQL Server Agent service is running and set to Automatic startup.",
      "Create the AgentLabLog table and confirm you can insert a row manually.",
      "Create a job AgentLab_Heartbeat with a T-SQL step that inserts into the log table.",
      "Add a second verification step that checks the row count and configure it to run only after success.",
      "Create a schedule that runs every minute, attach it, and enable the job.",
      "Wait for two or three executions, then verify rows appeared in AgentLabLog.",
      "Deliberately break the first step (for example reference a missing table) and let it fail once.",
      "Query sysjobhistory to find the failed step and read its error message.",
      "Configure an operator and set the job to notify on failure, noting the Database Mail prerequisite.",
      "Fix the step, re-enable the schedule briefly to confirm success, then disable the job and clean up."
    ],
    scenario: ["Backups silently stopped for a week", "A nightly backup job began failing after the job owner's domain account was disabled during a security cleanup. No operator notification was configured, so nobody noticed until a restore was needed and the newest backup was a week old. Reassigning the job to a dedicated service account, configuring failure notifications and adding a daily check of the last successful backup restored confidence. The job definition was fine all along — ownership and alerting were the weakness."],
    interview: [
      ["Why can a perfectly defined job suddenly stop running?", "Common causes are a stopped Agent service, a disabled or deleted owner, a disabled schedule, or a step lacking permissions. Check service, owner, schedule and history rather than rewriting the job."],
      ["What is the purpose of an Agent proxy?", "A proxy maps a job step to a credential so the step can run under a different, appropriately privileged Windows account without exposing its password — used for file system, network or other external access."],
      ["How would you audit job failures proactively?", "Query msdb.dbo.sysjobhistory for run_status = 0 and alert on results, and configure operators/alerts with Database Mail so failures notify someone immediately."]
    ],
    takeaways: [
      "A job is steps plus a schedule plus an owner — all three must be healthy",
      "Job history in msdb is the primary diagnostic record",
      "Notifications and operators are what turn a failure into an action",
      "Job ownership is a common silent cause of failure",
      "Disable test schedules when the lab is done to avoid surprise load"
    ]
  },

  "practical-06": {
    lead: "A hands-on monitoring lab: query DMVs for CPU, memory, waits, blocking, growth, TempDB and backup health, then assemble the queries into a reusable daily health-check report.",
    objectives: [
      "Collect core health metrics from DMVs",
      "Interpret wait statistics to find a bottleneck",
      "Detect blocking and long-running sessions",
      "Check volume and log space before it becomes an incident",
      "Assemble a single daily health-check query set"
    ],
    paras: [
      "This lab builds the daily health check you will use for the rest of your DBA career: a small set of queries that answer 'is the estate healthy?' in a few minutes.",
      "Run these on a local instance first. Many DMVs return values since instance start, so a freshly restarted server will show small numbers — note the uptime when interpreting results.",
      "Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem? The queries below cover both current state (sessions, blocking) and cumulative signals (waits, space).",
      "Work through the flow: gather instance state, examine waits, check sessions and blocking, verify space, then review logs and jobs. Consistency of routine matters more than complexity.",
      "Start with wait statistics. Aggregate sys.dm_os_wait_stats, filter benign waits, and look at the top wait types — they point to I/O, CPU, locking or logging as the dominant constraint.",
      "Next inspect sys.dm_exec_requests for long-running or blocked sessions. The head blocker is the session blocking others but not itself blocked; that is where you investigate, not at the queue of victims.",
      "Check free space with dm_os_volume_stats and log usage with dm_db_log_space_usage. Catching a log at 85% is far better than explaining a full-disk outage.",
      "Finally, review the error log and job failures. Combine the queries into a single script you can run each morning, and record a baseline so trends become visible over time."
    ],
    code: [
      { lang: "sql", body: "-- Instance state and uptime\nSELECT @@SERVERNAME AS server,\n       sqlserver_start_time,\n       DATEDIFF(HOUR, sqlserver_start_time, SYSDATETIME()) AS uptime_hours\nFROM   sys.dm_os_sys_info;\nGO\n-- Top wait types since instance start\nSELECT TOP 10 wait_type,\n       wait_time_ms / 1000 AS wait_seconds,\n       waiting_tasks_count\nFROM   sys.dm_os_wait_stats\nWHERE  wait_type NOT LIKE 'SLEEP%'\n  AND  wait_type NOT IN ('LAZYWRITER_SLEEP','CLR_SEMAPHORE')\nORDER BY wait_time_ms DESC;\nGO" },
      { lang: "sql", body: "-- Current requests, blocking and long runners\nSELECT session_id, status, command, blocking_session_id,\n       wait_type, wait_time, total_elapsed_time\nFROM   sys.dm_exec_requests\nWHERE  session_id > 50\nORDER BY blocking_session_id DESC, total_elapsed_time DESC;\nGO\n-- Log space usage for the current database\nSELECT used_log_space_in_percent\nFROM   sys.dm_db_log_space_usage;\nGO" },
      { lang: "sql", body: "-- Free space on each volume holding a database file\nSELECT DISTINCT vs.volume_mount_point,\n       vs.total_bytes / 1073741824 AS total_gb,\n       vs.available_bytes / 1073741824 AS free_gb\nFROM   sys.master_files f\nCROSS APPLY sys.dm_os_volume_stats(f.database_id, f.file_id) vs\nORDER BY vs.volume_mount_point;\nGO\n-- TempDB file sizes\nSELECT name, size / 128 AS size_mb\nFROM   tempdb.sys.database_files\nORDER BY name;\nGO" }
    ],
    tables: [
      ["Metric", "DMV / source", "Why it matters", "Waits", "dm_os_wait_stats", "Finds the bottleneck", "Blocking", "dm_exec_requests", "Finds head blockers", "Space", "dm_os_volume_stats", "Prevents disk full"],
      ["Concern", "Healthy sign", "Warning sign", "Page life expectancy", "High and stable", "Falling rapidly", "Log usage", "Low percentage", "Above 85 percent", "Failed jobs", "None", "Any overnight failure"]
    ],
    diagram: { label: "Daily health-check flow", caption: "Instance state, waits, sessions, space and logs form a repeatable daily routine.", nodes: ["Instance state and uptime", "Wait statistics", "Sessions and blocking", "Volume and log space", "Error log and job history"] },
    steps: [
      "Run the instance-state query and record sqlserver_start_time as your baseline uptime.",
      "Execute the wait-statistics query and identify the top three non-benign wait types.",
      "Run a deliberately long query in a second session and find it in dm_exec_requests by total_elapsed_time.",
      "Create a blocking scenario with an open transaction in one session and a conflicting update in another; identify the head blocker.",
      "Check log usage with dm_db_log_space_usage and record the percentage.",
      "Run the volume-space query and list free space on every mount point holding a database file.",
      "Inspect TempDB file count and sizes and compare with the expected configuration.",
      "Read the last 50 entries of the SQL Server error log with sp_readerrorlog.",
      "Query failed jobs from msdb.dbo.sysjobhistory for the last 24 hours.",
      "Save all queries into one script named daily_healthcheck.sql and run it twice to compare results."
    ],
    scenario: ["The alert storm that hid a real failure", "A monitoring system alerted on every minor error, generating hundreds of messages each day. When the transaction log genuinely filled, its alert was lost in the noise and the outage lasted an hour. The DBA re-tiered alerts by severity, suppressed known-benign conditions and routed only actionable events to on-call. Monitoring must produce signal, not volume — and the daily health check is where that signal is interpreted by a human."],
    interview: [
      ["What belongs in a daily health check?", "Uptime, database states, last successful backups, failed jobs, volume and log free space, TempDB health, blocking, and a review of SQL and Windows error logs."],
      ["How do wait statistics help diagnose performance?", "They aggregate what sessions spent time waiting on — I/O, locks, latches, logging, CPU — so you can identify the dominant bottleneck instead of guessing from symptoms."],
      ["How do you find the head blocker?", "Find sessions with a blocking_session_id, then identify the session that blocks others but is not itself blocked; inspect its statement, wait type and plan to fix the root cause."]
    ],
    takeaways: [
      "A short, consistent daily health check catches problems early",
      "Wait statistics reveal the dominant bottleneck without guesswork",
      "Investigate the head blocker, not the queue of blocked victims",
      "Volume and log space checks prevent self-inflicted full-disk outages",
      "Save your queries as a script and compare results over time to see trends"
    ]
  },

  "practical-07": {
    lead: "A hands-on performance lab: capture execution plans, add indexes, update statistics, rewrite a non-SARGable predicate and use Query Store to observe a plan before and after a change.",
    objectives: [
      "Read actual execution plans to find expensive operators",
      "Create an index that removes a costly scan",
      "Measure the effect of stale statistics",
      "Rewrite a predicate to be SARGable",
      "Use Query Store to compare plans over time"
    ],
    paras: [
      "This lab teaches performance tuning as a measurement loop: baseline, identify, change one thing, measure again. Guessing is not tuning.",
      "Use a local instance with a scratch database large enough to produce meaningful plans — a few hundred thousand rows is plenty. Enable the actual execution plan in SSMS (Ctrl+M) as you work.",
      "An execution plan is the optimiser's roadmap. Actual plans show row counts and expensive operators such as scans, sorts and key lookups — the evidence you need before changing anything.",
      "Follow the loop below for each experiment: capture a baseline, inspect the plan, make one targeted change, then re-run and compare duration and reads with SET STATISTICS.",
      "Load a table with deliberately inconvenient data and run a query filtering on a function-wrapped column, such as YEAR(OrderDate). Capture the plan — it will scan because the function prevents a seek.",
      "Rewrite the predicate as a range (OrderDate >= start AND OrderDate < end), confirm an index seek appears, and compare logical reads. This usually delivers the largest win in the whole lab.",
      "Create a nonclustered index and observe a lookup disappear when you add an included column to make the index covering. Then update statistics and note how estimates improve.",
      "Enable Query Store on the database and re-run the queries; use its reports to see the queries, their plans and runtime stats over time — the tool that makes plan regressions visible in production."
    ],
    code: [
      { lang: "sql", body: "-- Baseline: turn on measurement, then run the query\nSET STATISTICS IO ON;\nSET STATISTICS TIME ON;\nGO\n-- Non-SARGable: function on the column forces a scan\nSELECT *\nFROM   dbo.BigOrders\nWHERE  YEAR(OrderDate) = 2026;\nGO\n-- SARGable range predicate allows an index seek\nSELECT *\nFROM   dbo.BigOrders\nWHERE  OrderDate >= '20260101'\n  AND  OrderDate <  '20270101';\nGO" },
      { lang: "sql", body: "-- Add a covering index with an included column\nCREATE INDEX IX_BigOrders_OrderDate\nON dbo.BigOrders (OrderDate)\nINCLUDE (CustomerID, Amount);\nGO\n-- Refresh statistics after large data changes\nUPDATE STATISTICS dbo.BigOrders WITH FULLSCAN;\nGO\n-- Inspect index usage and fragmentation\nSELECT i.name AS index_name, s.user_seeks, s.user_scans,\n       s.user_updates\nFROM   sys.indexes i\nLEFT JOIN sys.dm_db_index_usage_stats s\n  ON s.object_id = i.object_id AND s.index_id = i.index_id\nWHERE  i.object_id = OBJECT_ID('dbo.BigOrders');\nGO" },
      { lang: "sql", body: "-- Enable Query Store to capture plans over time\nALTER DATABASE PerformanceLab\nSET QUERY_STORE = ON\n(\n  OPERATION_MODE = READ_WRITE,\n  MAX_STORAGE_SIZE_MB = 512\n);\nGO\n-- Top queries by average duration from the plan cache\nSELECT TOP 20\n  qs.total_elapsed_time / qs.execution_count / 1000 AS avg_ms,\n  qs.execution_count,\n  SUBSTRING(st.text, (qs.statement_start_offset / 2) + 1,\n    ((CASE qs.statement_end_offset WHEN -1\n       THEN DATALENGTH(st.text)\n       ELSE qs.statement_end_offset END\n       - qs.statement_start_offset) / 2) + 1) AS statement\nFROM sys.dm_exec_query_stats qs\nCROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st\nORDER BY avg_ms DESC;\nGO" }
    ],
    tables: [
      ["Access method", "Meaning", "When desirable", "Seek", "Navigate an index to matching rows", "Selective lookups", "Scan", "Read all rows", "Small tables / no usable index", "Key lookup", "Fetch base row via nonclustered index", "Avoid at scale with covering indexes"],
      ["Symptom", "Likely cause", "First check", "Slow read", "Missing index or stale stats", "Actual execution plan", "High CPU", "Sorts, scans, recompiles", "Query stats", "I/O waits", "Cache pressure or scans", "Page life expectancy"]
    ],
    diagram: { label: "Performance tuning loop", caption: "Baseline, inspect the plan, make one change, measure again — repeat with evidence.", nodes: ["Capture baseline (IO / time)", "Read actual execution plan", "Make one targeted change", "Re-measure and compare", "Record result in Query Store"] },
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
    scenario: ["The function that killed an index seek", "A query filtered with WHERE YEAR(OrderDate) = 2026 on a 50-million-row table, forcing a full scan and taking roughly 40 seconds. Rewriting it as a date range restored an index seek and cut the query to under a second — without adding hardware. In a second case, parameter sniffing after a statistics update produced a plan tuned to an outlier value; Query Store made the regression visible and a targeted OPTIMIZE FOR hint stabilised it. Both fixes started with evidence, not intuition."],
    interview: [
      ["What is the difference between clustered and nonclustered indexes?", "A clustered index defines the table's physical row order and there is one per table; a nonclustered index is a separate ordered structure with pointers to the rows, and a table can have many."],
      ["What makes a predicate SARGable?", "A comparison of a bare column to a constant or parameter with simple operators, allowing an index seek; wrapping the column in a function or using a leading wildcard usually prevents seeks."],
      ["How would you investigate a suddenly slow query?", "Compare its plan and runtime stats in Query Store, check for plan changes and statistics updates, look at waits, and examine whether data volume or parameters changed — then make one targeted change and remeasure."]
    ],
    takeaways: [
      "Tune with a measurement loop: baseline, change one thing, measure again",
      "Functions on columns destroy SARGability — prefer range predicates",
      "Covering indexes remove expensive key lookups",
      "Stale statistics produce bad plans; updating them is cheap and fast",
      "Query Store makes plan regressions visible and reversible in production"
    ]
  }
};
