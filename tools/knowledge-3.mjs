/* Domain knowledge base, part 3 (ch11-ch15). */

export const K3 = {
  ch11: {
    theme: "database monitoring and alerting",
    vocab: ["DMV", "Wait", "Health check", "Error log", "Extended Events", "Alert"],
    paras: [
      "Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem? Reactive monitoring reports failures; proactive monitoring catches trends — growing log usage, falling page life expectancy, lengthening backups — before users notice.",
      "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs. Consistency matters more than complexity.",
      "Dynamic management views and functions expose the engine's internal state. sys.dm_os_waiting_tasks, sys.dm_exec_requests, sys.dm_os_performance_counters and sys.dm_db_* views are the DBA's primary diagnostic surface.",
      "Wait statistics are the most efficient way to find the dominant bottleneck. SQL Server records what each session waited on; aggregating waits points to I/O, CPU, locking or logging as the constraint instead of guessing.",
      "The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues. Reviewing them daily turns cryptic errors into early warnings.",
      "Extended Events is the modern lightweight diagnostics framework. Sessions capture events such as deadlocks, long queries or errors with far less overhead than SQL Trace/Profiler and are safe in production when scoped carefully.",
      "Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold. Database Mail, Agent alerts and external monitoring systems deliver that signal.",
      "Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads."
    ],
    code: [
      { lang: "sql", body: "-- Top wait types (since instance start)\nSELECT TOP 10 wait_type,\n       wait_time_ms / 1000 AS wait_seconds,\n       waiting_tasks_count\nFROM   sys.dm_os_wait_stats\nWHERE  wait_type NOT LIKE 'SLEEP%'\n  AND  wait_type NOT IN ('CLR_SEMAPHORE','LAZYWRITER_SLEEP')\nORDER BY wait_time_ms DESC;" },
      { lang: "sql", body: "-- Current requests and blocking\nSELECT session_id, status, command, blocking_session_id,\n       wait_type, wait_time, total_elapsed_time\nFROM   sys.dm_exec_requests\nWHERE  session_id > 50\nORDER BY blocking_session_id DESC, total_elapsed_time DESC;" },
      { lang: "sql", body: "-- Volume free space via dm_os_volume_stats\nSELECT DISTINCT vs.volume_mount_point,\n       vs.total_bytes / 1073741824 AS total_gb,\n       vs.available_bytes / 1073741824 AS free_gb\nFROM   sys.master_files f\nCROSS APPLY sys.dm_os_volume_stats(f.database_id, f.file_id) vs;" }
    ],
    tables: [
      ["Metric", "DMV / source", "Why it matters", "Waits", "dm_os_wait_stats", "Finds the bottleneck", "Blocking", "dm_exec_requests", "Finds head blockers", "Space", "dm_os_volume_stats", "Prevents disk full"],
      ["Concern", "Healthy sign", "Warning sign", "Page life expectancy", "High and stable", "Falling rapidly", "Log usage %", "Low", "Approaching 90%", "Failed jobs", "None", "Any overnight failure"]
    ],
    scenarios: [
      ["The alert storm that hid a real failure", "A monitoring system alerted on every minor error, producing hundreds of messages a day. When a genuine log-growth failure occurred, its alert was lost in the noise. The DBA re-tiered alerts by severity, suppressed known-benign events and routed only actionable conditions to on-call. Monitoring must produce signal, not volume."],
      ["The slowdown with no errors", "Users reported intermittent slowness but nothing appeared in the error log. Wait statistics showed PAGEIOLATCH_SH dominating, pointing to physical reads; a query scan on a large table was evicting cache. An index and a predicate fixed it. Waits diagnose what logs cannot."]
    ],
    interviews: [
      ["What belongs in a daily health check?", "Uptime, database states, last successful backups, failed jobs, volume and log free space, tempdb health, current blocking and a review of SQL and Windows error logs."],
      ["How do wait statistics help diagnose performance?", "They aggregate what sessions spent time waiting on — I/O, locks, latches, logging, CPU — so you can identify the dominant bottleneck instead of guessing from symptoms."],
      ["Why prefer Extended Events over SQL Profiler in production?", "Extended Events is far lighter weight, highly filterable and designed for production diagnostics; Profiler/SQL Trace carry much higher overhead and are deprecated."]
    ]
  },
  ch12: {
    theme: "SQL Server performance tuning",
    vocab: ["Execution plan", "Index", "Statistics", "SARGable", "Wait", "Query Store"],
    paras: [
      "Performance tuning is a measurement discipline: establish a baseline, identify the dominant bottleneck, make one change, measure again. Tuning without measurement is guesswork and often makes things worse.",
      "An execution plan is the roadmap the optimiser produces for a query. Reading actual plans reveals join order, access methods (seek versus scan), implicit conversions and expensive operators such as sorts and key lookups.",
      "Clustered indexes define the physical order of a table; nonclustered indexes are separate ordered structures pointing back to the row. Composite indexes order by multiple columns, and included columns can make an index covering so the base table need not be touched.",
      "Statistics describe data distribution and drive cardinality estimates. Stale statistics lead to bad plans; updating them is often the cheapest and fastest performance fix available.",
      "SARGable predicates — simple comparisons against a bare column — allow index seeks. Wrapping a column in a function or applying a leading wildcard forces scans. Rewriting predicates is frequently more effective than adding hardware.",
      "Parameter sniffing occurs when a plan is compiled for one parameter value and reused for others with very different selectivity, causing intermittent slowness. Options include OPTIMIZE FOR, RECOMPILE or parameterisation strategies, each with trade-offs.",
      "Query Store captures query text, plans and runtime statistics over time, making plan regressions visible and allowing a good plan to be forced while the root cause is fixed.",
      "Missing index suggestions are hints, not commands. Validate them against workload, existing indexes and write overhead before implementing — blindly adding every suggested index degrades writes and storage."
    ],
    code: [
      { lang: "sql", body: "-- Most expensive queries by average elapsed time\nSELECT TOP 20\n  qs.total_elapsed_time / qs.execution_count / 1000 AS avg_ms,\n  qs.execution_count,\n  SUBSTRING(st.text, (qs.statement_start_offset/2)+1,\n    ((CASE qs.statement_end_offset WHEN -1\n       THEN DATALENGTH(st.text)\n       ELSE qs.statement_end_offset END - qs.statement_start_offset)/2)+1) AS statement\nFROM sys.dm_exec_query_stats qs\nCROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st\nORDER BY avg_ms DESC;" },
      { lang: "sql", body: "-- Index usage: find unused and heavily used indexes\nSELECT OBJECT_NAME(i.object_id) AS table_name, i.name AS index_name,\n       s.user_seeks, s.user_scans, s.user_lookups, s.user_updates\nFROM   sys.indexes i\nLEFT JOIN sys.dm_db_index_usage_stats s\n       ON s.object_id = i.object_id AND s.index_id = i.index_id\nWHERE  i.object_id > 100\nORDER BY s.user_updates DESC;" },
      { lang: "sql", body: "UPDATE STATISTICS dbo.Orders WITH FULLSCAN;" }
    ],
    tables: [
      ["Access method", "Meaning", "When desirable", "Seek", "Navigate an index to matching rows", "Selective lookups", "Scan", "Read all rows", "Small tables / no usable index", "Lookup", "Fetch base row from a nonclustered index", "Avoid at scale via covering indexes"],
      ["Symptom", "Likely cause", "First check", "Slow read", "Missing index / stale stats", "Actual plan", "High CPU", "Sorts / scans / compilation", "Query stats", "I/O waits", "Cache pressure / scans", "Page life expectancy"]
    ],
    scenarios: [
      ["The function that killed an index seek", "A query filtered with WHERE YEAR(OrderDate)=2026 on a 50-million-row table, forcing a scan. Rewriting it as a range predicate (OrderDate >= '20260101' AND OrderDate < '20270101') restored an index seek and cut the query from 40 seconds to under a second. SARGability beats adding indexes."],
      ["Parameter sniffing after a statistics update", "A stored procedure became slow for some customers after an auto-update of statistics produced a plan tuned to an outlier value. Using OPTIMIZE FOR UNKNOWN on the problematic parameter, plus a targeted filtered index, stabilised performance. Plan regressions need evidence, which Query Store provides."]
    ],
    interviews: [
      ["What is the difference between a clustered and a nonclustered index?", "A clustered index defines the table's physical row order and there is one per table; a nonclustered index is a separate ordered structure with pointers to the rows, and a table can have many."],
      ["What makes a query SARGable?", "A predicate that compares a bare column to a constant or parameter with simple operators, allowing an index seek; functions or leading wildcards on the column usually prevent seeks."],
      ["How would you investigate a suddenly slow query?", "Compare its plan and runtime stats in Query Store, check for plan changes and statistics updates, look at waits, and examine whether data volume or parameters changed — then make one targeted change and remeasure."]
    ]
  },
  ch13: {
    theme: "blocking and deadlocks",
    vocab: ["Lock", "Block", "Deadlock", "Isolation", "Snapshot", "Victim"],
    paras: [
      "Locking protects data consistency when multiple sessions work concurrently. Shared locks protect reads, exclusive locks protect writes, update and intent locks coordinate the transition and hierarchy. Locks are normal; problems arise when they are held too long or in conflicting order.",
      "Blocking occurs when one session holds a lock another needs. A short block is normal; a long block is an incident. The session at the root — the head blocker — is the one to investigate, not the dozens of sessions queued behind it.",
      "Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions. Large unindexed updates are a common trigger.",
      "Isolation levels define how transactions are protected from one another. READ COMMITTED is the default; READ UNCOMMITTED allows dirty reads; REPEATABLE READ and SERIALIZABLE increase protection and blocking; SNAPSHOT and READ COMMITTED SNAPSHOT use row versioning to reduce reader-writer blocking.",
      "A deadlock is a cycle: session A holds a resource B needs while B holds a resource A needs. SQL Server detects the cycle, chooses a victim and rolls it back with error 1205 so the other can proceed.",
      "Deadlock graphs from Extended Events show the processes, resources and lock modes involved. Reading the graph reveals the conflicting access order — the real fix is usually to make access order consistent or add an index so less data is locked.",
      "Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead.",
      "Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction left open by application code."
    ],
    code: [
      { lang: "sql", body: "-- Find the head blocker and its statement\nSELECT r.session_id, r.blocking_session_id, r.wait_type,\n       r.wait_resource, r.status, t.text AS sql_text\nFROM   sys.dm_exec_requests r\nOUTER APPLY sys.dm_exec_sql_text(r.sql_handle) t\nWHERE  r.blocking_session_id <> 0 OR r.session_id IN (\n  SELECT DISTINCT blocking_session_id\n  FROM sys.dm_exec_requests WHERE blocking_session_id <> 0);" },
      { lang: "sql", body: "-- Enable READ COMMITTED SNAPSHOT (requires care)\nALTER DATABASE SalesDB\nSET READ_COMMITTED_SNAPSHOT ON;\nGO\nSELECT name, is_read_committed_snapshot_on\nFROM   sys.databases WHERE name = 'SalesDB';" },
      { lang: "sql", body: "-- Create an Extended Events session for deadlocks\nCREATE EVENT SESSION [CaptureDeadlocks] ON SERVER\nADD EVENT sqlserver.xml_deadlock_report\nADD TARGET package0.event_file\n  (SET filename = 'D:\\XEvents\\Deadlocks.xel');\nGO\nALTER EVENT SESSION [CaptureDeadlocks] ON SERVER STATE = START;" }
    ],
    tables: [
      ["Lock", "Purpose", "Compatibility", "Shared (S)", "Protect a read", "Compatible with other S", "Exclusive (X)", "Protect a write", "Incompatible with all", "Update (U)", "Prevent conversion deadlocks", "Compatible with S"],
      ["Isolation level", "Dirty reads", "Extra protection", "READ UNCOMMITTED", "Allowed", "None", "READ COMMITTED", "Prevented", "Default", "REPEATABLE READ", "Prevented", "Held read locks", "SNAPSHOT", "Prevented", "Row versioning"]
    ],
    scenarios: [
      ["The head blocker behind 200 timeouts", "An application update ran a large DELETE without a supporting index at 2 p.m., holding locks on a busy table. Two hundred sessions queued behind it. The DBA found the single head blocker, confirmed it was the unindexed delete, killed it with approval after the transaction began rolling back, then added an index and rescheduled the cleanup. Chasing the 200 victims would have changed nothing."],
      ["A deadlock graph that pointed at access order", "Two procedures updated the same two tables in opposite order and deadlocked repeatedly under load. The deadlock graph showed the cycle clearly. Reordering the updates so both procedures touched the tables in the same sequence, plus an index to narrow the locks, eliminated the deadlocks. KILL and retry only treated the symptom."]
    ],
    interviews: [
      ["What is the difference between blocking and a deadlock?", "Blocking is one session waiting for a lock held by another — it resolves when the holder finishes. A deadlock is a cycle of two or more sessions each holding what the other needs, which SQL Server resolves by killing a victim."],
      ["How do you find the head blocker?", "Query sys.dm_exec_requests for sessions with a blocking_session_id, then find the session that is blocking others but is not itself blocked; inspect its statement, wait type and plan to find the root cause."],
      ["How does READ COMMITTED SNAPSHOT reduce blocking?", "It uses row versioning so readers do not take shared locks that block writers and writers do not block readers; the trade-off is extra tempdb version-store usage and different semantics for some applications."]
    ]
  },
  ch14: {
    theme: "database integrity and corruption",
    vocab: ["CHECKDB", "Checksum", "Page", "Corruption", "SUSPECT", "Restore"],
    paras: [
      "Database integrity is about detecting damage before it becomes data loss. Corruption is either physical — damaged pages, torn writes, I/O errors — or logical — inconsistent indexes and metadata that the engine can still read but is wrong.",
      "Page checksums are the primary detection mechanism. With CHECKSUM enabled, SQL Server writes a checksum into each page and verifies it on read, catching silent disk corruption that would otherwise go unnoticed until a query fails.",
      "DBCC CHECKDB is the definitive integrity check. It verifies allocation, structure and logical consistency across the database and reports errors with repair levels and severity. It should be scheduled regularly and after every restore.",
      "DBCC CHECKALLOC checks allocation, CHECKTABLE checks a table and CHECKCATALOG checks system metadata. Running full CHECKDB frequently can be expensive, so large systems sometimes split checks across a rotating schedule.",
      "Physical corruption often surfaces as error 824/825 in the error log, a SUSPECT or RECOVERY_PENDING database state, or a query that fails on a specific page. The response is careful: capture evidence, avoid destructive repair first, and prefer restoring a clean page or database.",
      "Page-level restore lets you restore a single damaged page from a recent, verified backup, minimising downtime — but only in FULL recovery model with a suitable log chain.",
      "Repair options REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS carry increasing risk; the last can delete rows and must be a last resort with a copy of the database and business approval.",
      "A corruption incident is a data-loss event until proven otherwise. Preserve the original files, determine the root cause — often storage — and replace the failing hardware before returning the database to service."
    ],
    code: [
      { lang: "sql", body: "DBCC CHECKDB ('SalesDB') WITH NO_INFOMSGS, ALL_ERRORMSGS;\nGO\n-- Results include the lowest repair level recommended" },
      { lang: "sql", body: "-- Enable page checksums and verify on backup\nALTER DATABASE SalesDB SET PAGE_VERIFY CHECKSUM;\nGO\nBACKUP DATABASE SalesDB\nTO DISK = 'D:\\Backups\\SalesDB_Checksum.bak'\nWITH CHECKSUM, COMPRESSION;" },
      { lang: "sql", body: "-- Restore a single corrupted page from a clean backup\nRESTORE DATABASE SalesDB\nPAGE = '1:123456'\nFROM DISK = 'D:\\Backups\\SalesDB_Full.bak'\nWITH NORECOVERY;\n-- then apply the log chain and recover" }
    ],
    tables: [
      ["Error / state", "Meaning", "First action", "824 / 825", "Logical consistency / I/O error", "Check hardware, run CHECKDB", "SUSPECT", "Recovery failed at startup", "Check log, avoid emergency mode first", "RECOVERY_PENDING", "Recovery cannot start", "Check log access and space"],
      ["Repair option", "Risk", "When", "REPAIR_FAST", "Low", "Minor, non-data issues", "REPAIR_REBUILD", "Medium", "Rebuild indexes", "REPAIR_ALLOW_DATA_LOSS", "High", "Absolute last resort"]
    ],
    scenarios: [
      ["Error 824 at 3 a.m.", "The error log showed error 824 on page 1:123456 during an index scan. Rather than run a destructive repair, the DBA confirmed page checksums were on, restored just that page from a verified backup, applied the log chain and ran CHECKDB again — clean. The storage team replaced a failing disk that had caused the corruption."],
      ["The SUSPECT database after a restart", "After an unclean shutdown a production database came up SUSPECT. The DBA resisted the tempting EMERGENCY REPAIR rebuild, captured the error log, confirmed a good backup and restored to a clean state with minimal loss. Rebuilding system tables would have risked far more data."]
    ],
    interviews: [
      ["What is the difference between logical and physical corruption?", "Physical corruption is damaged page bytes or I/O errors detected by checksums; logical corruption is structurally consistent but wrong data or metadata, found by CHECKDB's logical checks."],
      ["Why is REPAIR_ALLOW_DATA_LOSS a last resort?", "Because it can delete damaged rows or pages to make the database consistent — it prioritises structure over data, so it should only follow a verified backup, business approval and evidence of the root cause."],
      ["When would you use a page-level restore?", "When a small number of pages are damaged, you have FULL recovery model and a verified backup plus intact log chain; it restores only the bad pages, avoiding a full-database restore and its downtime."]
    ]
  },
  ch15: {
    theme: "capacity planning and database maintenance",
    vocab: ["Growth", "Capacity", "Maintenance", "Retention", "Partition", "Window"],
    paras: [
      "Capacity planning predicts when resources will run out so you can act on your terms, not during an incident. It combines historical growth trends, known upcoming changes and a safety margin.",
      "Data and log capacity are planned separately. Data grows with retained rows and index size; log growth depends on the recovery model, transaction size and backup frequency. Each needs its own trend and headroom.",
      "Disk, CPU and memory capacity must account for peak load and for maintenance operations such as index rebuilds, which temporarily need significant free space and memory. A full disk during a rebuild is a self-inflicted outage.",
      "A maintenance plan covers the recurring work that keeps a database healthy: integrity checks, index and statistics maintenance, backup retention cleanup and housekeeping. Each task has a window, a duration and an impact.",
      "Index maintenance is nuanced: rebuilding every index weekly is often wasteful. Use fragmentation and page-count thresholds to choose REORGANIZE for lightly fragmented indexes and REBUILD only where justified, and remember that rebuilds update statistics.",
      "Statistics maintenance ensures the optimiser has current data distributions. Auto-update helps but large, rapidly changing tables may need scheduled explicit updates with an appropriate sample.",
      "Retention and archiving control growth at the source: define how long data must stay in the live system, then archive or delete old data on a schedule. Partitioning can make both operations efficient by switching whole partitions.",
      "Maintenance windows must be negotiated and respected. Every task should have an impact analysis, a rollback plan and monitoring so overruns are detected before business hours."
    ],
    code: [
      { lang: "sql", body: "-- Data file growth history from default trace / file stats\nSELECT database_id, file_id,\n       size / 128 AS size_mb\nFROM   sys.dm_io_virtual_file_stats(NULL, NULL);" },
      { lang: "sql", body: "-- Fragmented indexes above 10% and 1000 pages\nSELECT OBJECT_NAME(s.object_id) AS table_name, i.name AS index_name,\n       s.avg_fragmentation_in_percent, s.page_count\nFROM   sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') s\nJOIN   sys.indexes i ON i.object_id=s.object_id AND i.index_id=s.index_id\nWHERE  s.avg_fragmentation_in_percent > 10 AND s.page_count > 1000\nORDER BY s.avg_fragmentation_in_percent DESC;" },
      { lang: "sql", body: "-- Project daily growth: compare two snapshots\n-- Store daily size_mb in a table, then:\nSELECT database_name,\n       AVG(size_mb - prev_size_mb) AS avg_daily_growth_mb\nFROM   dbo.DailySizeSnapshot\nGROUP BY database_name;" }
    ],
    tables: [
      ["Resource", "Plan for", "Common surprise", "Data files", "Row growth + indexes + headroom", "Bulk loads", "Log", "Transaction size / backup frequency", "Long transactions", "Disk", "Peak + maintenance free space", "Rebuild needing 1.5x space"],
      ["Fragmentation", "Action", "Reason", "< 10%", "Leave alone", "No benefit", "10-30%", "REORGANIZE", "Online, low impact", "> 30%", "REBUILD", "Rebuild structure and stats"]
    ],
    scenarios: [
      ["The rebuild that filled the disk", "A weekly 'rebuild everything' job ran out of space on a volume holding a 400 GB database, leaving a partially rebuilt index and an angry morning shift. The DBA replaced blanket rebuilds with threshold-based maintenance, monitored free space against the largest index and moved heavy rebuilds to a window with headroom."],
      ["Log growth nobody forecast", "Switching a database to FULL recovery without adding log backups caused the log to grow until it filled its volume. Capacity planning now includes recovery model, log-backup cadence and worst-case transaction size, with alerts at 70% and 85% log usage."]
    ],
    interviews: [
      ["How do you forecast storage capacity?", "Track daily size from sys.dm_io_virtual_file_stats or a snapshot table, compute a trend, add known upcoming loads and a safety margin, and plan data and log independently."],
      ["When should you rebuild versus reorganise an index?", "Reorganize lightly fragmented indexes (roughly 10-30%) online with low impact; rebuild heavily fragmented ones (above about 30%), and leave low-fragmentation indexes alone — always consider page count."],
      ["Why is retention part of capacity planning?", "Because deleting or archiving old data at the source is the only way to bend a growth curve; without a retention policy, capacity work is just repeatedly buying more disk."]
    ]
  }
};
