/* Glossary & Command Reference — part 1: concepts and internals.
   Each entry is appended to window.GLOSSARY and rendered by site.js. */

window.GLOSSARY = (window.GLOSSARY || []).concat([

  {
    term: "Page (8 KB)",
    cat: "Concepts & Internals",
    say: "eight-K page",
    short: "The smallest unit of data SQL Server reads from and writes to disk.",
    what: "SQL Server does not read a single row at a time. It reads and writes fixed-size 8 KB blocks called pages. A page holds rows from one table or index, or allocation metadata, or the header of a larger structure. When you request one row, the engine pulls the entire page containing that row into memory. This is why a table scan of a tiny table is cheap, while a scan of a large table can push gigabytes of pages through memory.",
    why: "Almost every performance symptom eventually comes down to pages: too many pages read (I/O waits), too many pages held (memory pressure), or pages being modified by too many sessions (latching and contention).",
    syntax: "-- See how much of the buffer pool each database is using\nSELECT db_name(database_id) AS db,\n       count(*) * 8 / 1024 AS buffer_mb\nFROM   sys.dm_os_buffer_descriptors\nGROUP BY database_id\nORDER BY buffer_mb DESC;",
    how: [
      "Remember the size: 8 pages make an extent (64 KB), and 128 pages make 1 MB.",
      "When investigating slow reads, ask 'how many pages did this query touch?' using SET STATISTICS IO.",
      "Check page life expectancy to see whether pages are being pushed out of memory too quickly.",
      "Use DBCC CHECKDB to verify page-level consistency."
    ],
    pitfalls: [
      "Assuming a SELECT of one row reads one row — it reads at least one whole page.",
      "Shrinking data files repeatedly rewrites and fragments pages."
    ],
    see: ["ch04-11", "ch04-12", "ch14-04"]
  },

  {
    term: "Extent",
    cat: "Concepts & Internals",
    say: "ex-tent",
    short: "A group of eight contiguous pages (64 KB) — SQL Server's unit of space allocation.",
    what: "When an object needs more space, SQL Server does not allocate one page at a time; it allocates an extent of eight pages. Uniform extents belong to one object; mixed extents are shared by several small objects. This is why a tiny table can still consume 64 KB on disk, and why page-level space reports sometimes look larger than expected.",
    why: "Extent allocation explains sudden growth spurts and why small tables waste a little space. It also matters for understanding allocation bottlenecks in TempDB.",
    how: [
      "Think of pages as bricks and extents as a pallet of eight bricks.",
      "When sizing a database, multiply expected rows by row size, then round up to extents.",
      "Investigate TempDB allocation contention with PAGELATCH waits on allocation pages."
    ],
    pitfalls: ["Treating file size as equal to used data — allocated extents may be mostly empty."],
    see: ["ch04-11", "ch06-09"]
  },

  {
    term: "Buffer pool",
    cat: "Concepts & Internals",
    say: "buffer pool",
    short: "SQL Server's in-memory cache of data pages — the reason databases are fast.",
    what: "The buffer pool is the main area of memory where SQL Server holds copies of data pages read from disk. A read that finds the page already in the pool is served from RAM in microseconds; a cache miss requires a physical disk read that is thousands of times slower. Modified pages become 'dirty' and are written back by checkpoints and the lazy writer.",
    why: "Sizing the buffer pool correctly is the single biggest performance decision after indexing. It also explains why a report that scans a huge table can evict the hot pages your application needs.",
    syntax: "-- Memory configured for SQL Server\nSELECT name, value_in_use\nFROM   sys.configurations\nWHERE  name = 'max server memory (MB)';\nGO\n-- Page life expectancy (seconds a page stays in cache)\nSELECT cntr_value AS page_life_expectancy\nFROM   sys.dm_os_performance_counters\nWHERE  counter_name = 'Page life expectancy';",
    how: [
      "Set max server memory explicitly, leaving 1-4 GB for the operating system.",
      "Monitor page life expectancy; a sustained steep drop usually means cache churn from a scan.",
      "Use sys.dm_os_buffer_descriptors to see which databases dominate the cache.",
      "Add indexes or predicates to stop reports from dragging cold pages into memory."
    ],
    pitfalls: [
      "Leaving max server memory at the unlimited default on a shared host.",
      "Assuming more memory fixes a missing index — it only hides the scan temporarily."
    ],
    see: ["ch04-06", "ch04-13", "ch11-06"]
  },

  {
    term: "Write-ahead logging (WAL)",
    cat: "Concepts & Internals",
    say: "write-ahead logging",
    short: "The rule that the transaction log record must reach disk before the changed data page does.",
    what: "Before SQL Server writes a modified data page to disk, it first writes a log record describing the change. This guarantees that if the server crashes, the log contains enough information to redo committed work and undo uncommitted work. Without write-ahead logging, a committed transaction could be lost if its data page had not yet been flushed.",
    why: "It is the foundation of durability and of every backup/restore strategy. It also explains why log latency (WRITELOG waits) can slow all writes, even when data disks are fast.",
    syntax: "-- Log flush activity\nSELECT *\nFROM   sys.dm_io_virtual_file_stats(DB_ID(), NULL)\nWHERE  file_id = 2;",
    how: [
      "Place the log file on fast, low-latency storage — ideally its own volume.",
      "Pre-size the log in large increments so autogrowth is rare.",
      "Watch WRITELOG waits to detect a slow log disk.",
      "Never switch to SIMPLE recovery just to 'fix' log growth without understanding the impact."
    ],
    pitfalls: [
      "Putting the log on the same slow disk as data and tempdb.",
      "Assuming a checkpoint writes all data immediately — it only bounds recovery time."
    ],
    see: ["ch04-17", "ch04-18", "ch07-05"]
  },

  {
    term: "Checkpoint",
    cat: "Concepts & Internals",
    say: "check-point",
    short: "A process that flushes dirty pages from memory to disk to bound how long recovery takes.",
    what: "A checkpoint writes all dirty pages for a database to disk and records its position in the log. After a crash, recovery only needs to replay the log from the last checkpoint, rather than from the beginning of time. Checkpoints happen automatically based on log volume and time, and can be requested manually.",
    why: "Checkpoint frequency affects both recovery time and I/O spikes. A very long transaction can delay a checkpoint, which lengthens crash recovery.",
    syntax: "CHECKPOINT;\nGO\n-- When did the last checkpoint happen?\nSELECT DATABASEPROPERTYEX(DB_NAME(), 'LastCheckpointTime') AS last_checkpoint;",
    how: [
      "Let SQL Server manage checkpoints automatically in most cases.",
      "Run CHECKPOINT before a manual backup of a test database if you want a clean flush.",
      "Investigate long-running transactions if recovery times grow.",
      "Monitor checkpoint I/O with wait types such as BACKUPIO and WRITELOG."
    ],
    pitfalls: ["Issuing CHECKPOINT repeatedly in production — it adds I/O for little benefit."],
    see: ["ch04-15", "ch04-14", "ch04-22"]
  },

  {
    term: "VLF (Virtual Log File)",
    cat: "Concepts & Internals",
    say: "vee-el-eff",
    short: "A chunk of the transaction log file — too many of them makes recovery slow.",
    what: "SQL Server divides the physical log file into smaller segments called virtual log files. The log is managed as a circular sequence of VLFs: active VLFs hold log records that have not been backed up or truncated; inactive ones can be reused. Every autogrowth event adds VLFs, so a log that grew in thousands of tiny increments can end up with thousands of VLFs.",
    why: "Recovery must process every VLF during analysis and redo. A database with 15,000 VLFs can take hours to recover after a crash, even if the data is small.",
    syntax: "-- Count VLFs per database\nSELECT db_name(database_id) AS db, count(*) AS vlf_count\nFROM   sys.dm_db_log_info(NULL)\nGROUP BY database_id\nORDER BY vlf_count DESC;",
    how: [
      "Check VLF count on your critical databases with sys.dm_db_log_info.",
      "Pre-size the log in large increments (for example 4-8 GB) so few VLFs are created.",
      "If the count is already high, shrink and regrow the log once in a maintenance window.",
      "Take log backups regularly so inactive VLFs can be reused."
    ],
    pitfalls: [
      "Growing the log in 1 MB steps — the classic cause of VLF explosion.",
      "Confusing log truncation with shrinking the physical file."
    ],
    see: ["ch04-19", "ch06-10", "ch19-09"]
  },

  {
    term: "LSN (Log Sequence Number)",
    cat: "Concepts & Internals",
    say: "el-ess-en",
    short: "A unique increasing identifier for every log record — the backbone of backup chains.",
    what: "Every record in the transaction log has an LSN. Backup sets record the first and last LSN they contain. During restore, SQL Server matches these numbers to make sure the full backup, differential and log backups form an unbroken chain that covers the point in time you want.",
    why: "Understanding LSNs explains why a missing log backup breaks point-in-time recovery, and how SQL Server knows which differential belongs to which full backup.",
    syntax: "-- First and last LSN of each backup set\nSELECT database_name, type,\n       first_lsn, last_lsn,\n       database_backup_lsn AS differential_base_lsn,\n       backup_finish_date\nFROM   msdb.dbo.backupset\nWHERE  database_name = N'Orders'\nORDER BY backup_finish_date DESC;",
    how: [
      "Query msdb.dbo.backupset to inspect the LSNs of your backup chain.",
      "Confirm that the next log backup's first LSN follows the previous last LSN.",
      "After a recovery-model change, take a full backup so the chain has a new base."
    ],
    pitfalls: ["Assuming a successful log backup means the chain is contiguous — verify LSNs when diagnosing."],
    see: ["ch04-20", "ch07-16", "ch08-03"]
  },

  {
    term: "Recovery model",
    cat: "Concepts & Internals",
    say: "re-kov-er-ee model",
    short: "A database setting that decides how the transaction log is managed and what restores are possible.",
    what: "SQL Server has three recovery models. SIMPLE automatically truncates the log and does not allow log backups or point-in-time recovery. FULL retains log records until they are backed up, enabling point-in-time restores. BULK_LOGGED minimally logs some bulk operations, reducing log size at the cost of precise point-in-time recovery within those operations.",
    why: "The recovery model directly determines your RPO. Choosing SIMPLE for a critical database means every restore goes back to the last full or differential backup.",
    syntax: "ALTER DATABASE Orders SET RECOVERY FULL;\nGO\nSELECT name, recovery_model_desc\nFROM   sys.databases\nWHERE  name = N'Orders';",
    how: [
      "Use FULL for production databases that require point-in-time recovery.",
      "Use SIMPLE for development, test and databases where data can be recreated.",
      "Immediately take a full backup after switching from SIMPLE to FULL.",
      "Schedule log backups frequently enough to meet the RPO."
    ],
    pitfalls: [
      "Switching to SIMPLE to 'clear' a full log — this breaks the log backup chain.",
      "Setting FULL without adding log backups, so the log grows until the disk fills."
    ],
    see: ["ch07-15", "ch07-16", "ch19-09"]
  },

  {
    term: "Filegroup",
    cat: "Concepts & Internals",
    say: "file-group",
    short: "A named group of data files that objects can be assigned to for placement and administration.",
    what: "A filegroup is a container for data files. Every database has a PRIMARY filegroup that holds system objects; you can add user-defined filegroups and place specific tables or indexes on them. Filegroups let you spread large objects across volumes, back up or restore subsets of a database, and bring parts of a very large database online in stages.",
    why: "Filegroups are the main tool for managing very large databases and for piecemeal restore strategies.",
    syntax: "ALTER DATABASE Orders ADD FILEGROUP FG_Archive;\nGO\nALTER DATABASE Orders\nADD FILE (\n  NAME = Orders_Archive,\n  FILENAME = 'E:\\Data\\Orders_Archive.ndf',\n  SIZE = 2GB, FILEGROWTH = 512MB\n) TO FILEGROUP FG_Archive;\nGO\n-- Create a table on that filegroup\nCREATE TABLE dbo.OrderArchive (Id int, Notes nvarchar(200))\nON FG_Archive;",
    how: [
      "Add a filegroup before adding data files to it.",
      "Specify the filegroup in CREATE TABLE or CREATE INDEX with the ON clause.",
      "Check placement with sys.filegroups and sys.database_files.",
      "For piecemeal restore, back up and restore filegroups individually."
    ],
    pitfalls: ["Forgetting that the log file does not belong to any filegroup."],
    see: ["ch06-01", "ch06-04", "ch06-06"]
  },

  {
    term: "MDF / NDF / LDF",
    cat: "Concepts & Internals",
    say: "M-D-F / N-D-F / L-D-F",
    short: "The three physical file types of a SQL Server database: primary data, secondary data and log.",
    what: "MDF is the primary data file: it holds the database boot information and system objects. NDF files are secondary data files that extend the database across more disks or filegroups. LDF is the transaction log file, a separate sequential structure. Logical names are used in T-SQL commands; physical names are the Windows paths.",
    why: "Knowing which file is which is essential for moving, growing, backing up and troubleshooting a database.",
    syntax: "SELECT name AS logical_name, physical_name, type_desc,\n       size / 128 AS size_mb, growth, is_percent_growth\nFROM   sys.database_files\nORDER BY type_desc;",
    how: [
      "Check the file list with sys.database_files before any file operation.",
      "Use logical names in ALTER DATABASE ... MODIFY FILE, not physical paths.",
      "Put data, log and tempdb on separate volumes where possible."
    ],
    pitfalls: [
      "Moving or renaming an MDF in Windows Explorer without updating the catalogue.",
      "Assuming an NDF is a backup — it is just another data file."
    ],
    see: ["ch06-02", "ch06-03", "ch04-09"]
  },

  {
    term: "TempDB",
    cat: "Concepts & Internals",
    say: "temp-D-B",
    short: "A shared scratch database recreated at every SQL Server startup.",
    what: "TempDB holds temporary tables, table variables, sort and hash work, index build scratch space, and the row-version store used by snapshot isolation and online operations. It is recreated from scratch every time the instance starts, so anything in it disappears and it cannot be backed up or restored.",
    why: "TempDB is a shared resource for every database on the instance. Poor configuration causes contention and slow reports for everyone.",
    syntax: "-- TempDB file sizes\nSELECT name, size / 128 AS size_mb, growth\nFROM   tempdb.sys.database_files\nORDER BY type_desc, name;",
    how: [
      "Create multiple equally sized data files (one per core up to around eight).",
      "Pre-size them so autogrowth rarely fires during peak workloads.",
      "Place tempdb on fast storage, separate from user databases where possible.",
      "Monitor version store growth if you use row versioning."
    ],
    pitfalls: [
      "Trying to back up tempdb — it is recreated at startup.",
      "Letting a single tempdb data file handle all allocation, causing PAGELATCH contention."
    ],
    see: ["ch06-19", "ch06-20", "ch11-10"]
  },

  {
    term: "Clustered index",
    cat: "Concepts & Internals",
    say: "clustered index",
    short: "The index that defines the physical sort order of the table — there can be only one.",
    what: "A clustered index sorts and stores the actual data rows in index order. The leaf level of the clustered index is the data itself. Because the rows are physically ordered by the key, range scans on that key are very fast. A table without a clustered index is a heap, with rows stored in no particular order.",
    why: "Choosing a good clustered key affects every other index on the table, because nonclustered indexes use it as their row locator.",
    syntax: "CREATE CLUSTERED INDEX IX_Orders_OrderDate\nON dbo.Orders (OrderDate);\nGO\n-- Or define it as the primary key\nALTER TABLE dbo.Orders\nADD CONSTRAINT PK_Orders PRIMARY KEY CLUSTERED (OrderID);",
    how: [
      "Choose a narrow, static, ever-increasing key where possible (an identity integer is a common choice).",
      "Avoid wide or frequently changing clustered keys — every nonclustered index copies the key.",
      "Check the current clustered index with sys.indexes where type_desc = 'CLUSTERED'.",
      "Remember that creating or dropping a clustered index rebuilds the whole table."
    ],
    pitfalls: [
      "Using a GUID as the clustered key without understanding the fragmentation it causes.",
      "Assuming a primary key must be clustered — it need not be."
    ],
    see: ["ch12-06", "ch02-10", "ch12-07"]
  },

  {
    term: "Nonclustered index",
    cat: "Concepts & Internals",
    say: "non-clustered index",
    short: "A separate sorted structure that points back to the data rows — like a book's index.",
    what: "A nonclustered index contains the indexed key columns plus a pointer (the clustered key, or a row identifier for a heap) back to the full row. SQL Server can find matching rows quickly through the index, then fetch the remaining columns from the base table. Included columns can be added at the leaf level to make the index 'covering' so that lookup is unnecessary.",
    why: "Well-chosen nonclustered indexes turn table scans into fast seeks. Too many of them slow down writes and consume storage.",
    syntax: "CREATE NONCLUSTERED INDEX IX_Orders_Customer\nON dbo.Orders (CustomerID)\nINCLUDE (OrderDate, Amount);\nGO\n-- Check whether it is being used\nSELECT i.name, s.user_seeks, s.user_scans, s.user_updates\nFROM   sys.indexes i\nLEFT JOIN sys.dm_db_index_usage_stats s\n  ON s.object_id=i.object_id AND s.index_id=i.index_id\nWHERE  i.object_id = OBJECT_ID('dbo.Orders');",
    how: [
      "Index columns used in WHERE, JOIN and ORDER BY clauses first.",
      "Add small, frequently needed columns as INCLUDE columns to avoid key lookups.",
      "Check usage stats after a representative workload before keeping an index.",
      "Remember that each index adds work to INSERT, UPDATE and DELETE."
    ],
    pitfalls: [
      "Blindly creating every index SQL Server suggests without considering write cost.",
      "Duplicating an existing index with a slightly different column order."
    ],
    see: ["ch12-07", "ch12-10", "practical-07"]
  },

  {
    term: "Statistics",
    cat: "Concepts & Internals",
    say: "sta-tis-tics",
    short: "Data about your data's distribution that the optimiser uses to choose a query plan.",
    what: "Statistics store histograms — samples of column values — that tell the optimiser how many rows it expects a predicate to return. Good estimates lead to good plans: index seeks, sensible join order and appropriate memory grants. Stale statistics lead to bad estimates and poor plans.",
    why: "Updating statistics is often the cheapest, fastest performance fix available, especially after a large data load.",
    syntax: "UPDATE STATISTICS dbo.Orders WITH FULLSCAN;\nGO\n-- When were statistics last updated?\nSELECT name, stats_id,\n       STATS_DATE(object_id, stats_id) AS last_updated\nFROM   sys.stats\nWHERE  object_id = OBJECT_ID('dbo.Orders');",
    how: [
      "Leave auto-update statistics enabled, but update explicitly after bulk loads.",
      "Use FULLSCAN on important tables when accuracy matters more than speed.",
      "Compare estimated versus actual row counts in an actual execution plan.",
      "Use Query Store to spot a plan that changed after a statistics update."
    ],
    pitfalls: [
      "Assuming an index rebuild always updates all statistics with a full scan.",
      "Updating statistics on every table every night — target the volatile ones."
    ],
    see: ["ch12-14", "ch12-15", "ch12-21"]
  },

  {
    term: "Execution plan",
    cat: "Concepts & Internals",
    say: "ex-e-cu-tion plan",
    short: "The step-by-step roadmap the optimiser creates for running a query.",
    what: "An execution plan shows the operators SQL Server will use — seeks, scans, joins, sorts, lookups — and the order it will use them. An estimated plan is produced without running the query; an actual plan includes real row counts and is far more useful for diagnosis. Read plans from right to left, top to bottom.",
    why: "The plan is where you see why a query is slow: a scan where you expected a seek, a huge sort, or a key lookup repeated millions of times.",
    syntax: "-- Enable the actual plan in SSMS with Ctrl+M, or inspect cached plans:\nSELECT qs.execution_count, qs.total_worker_time / qs.execution_count AS avg_cpu,\n       qp.query_plan\nFROM   sys.dm_exec_query_stats qs\nCROSS APPLY sys.dm_exec_query_plan(qs.plan_handle) qp\nORDER BY qs.total_worker_time DESC;",
    how: [
      "Run the query with 'Include Actual Execution Plan' enabled in SSMS.",
      "Look first at operators with high 'Actual Number of Rows' and high cost.",
      "Hover over operators to see predicates, warnings and estimated versus actual rows.",
      "Change one thing, then capture a new plan and compare."
    ],
    pitfalls: [
      "Trusting estimated plans when actual row counts differ wildly.",
      "Focusing on the first operator you see instead of the most expensive one."
    ],
    see: ["ch12-03", "ch12-05", "practical-07"]
  },

  {
    term: "Seek vs Scan",
    cat: "Concepts & Internals",
    say: "seek versus scan",
    short: "A seek navigates straight to matching rows; a scan reads the whole table or index.",
    what: "An index seek uses the index structure to jump directly to the rows that satisfy a predicate, like using a book index. An index or table scan reads every row and filters afterwards, like reading every page of a book. Scans are not always bad — a small table or a query needing most rows is cheaper to scan — but a scan on a large table with a selective predicate usually signals a missing or unusable index.",
    why: "Converting an unnecessary scan into a seek is the most common and most dramatic performance win in SQL Server.",
    syntax: "-- Compare the two forms of the same filter\n-- Scan (function on the column):\nSELECT * FROM dbo.Orders WHERE YEAR(OrderDate) = 2026;\n-- Seek (range predicate):\nSELECT * FROM dbo.Orders\nWHERE OrderDate >= '20260101' AND OrderDate < '20270101';",
    how: [
      "Capture an actual execution plan and find the access method on the table.",
      "Check whether the predicate is SARGable — no function on the column.",
      "Create or adjust an index whose leading key matches the predicate.",
      "Use SET STATISTICS IO to compare logical reads before and after."
    ],
    pitfalls: ["Adding an index when the real problem is a non-SARGable predicate."],
    see: ["ch12-17", "ch12-18", "ch12-26"]
  },

  {
    term: "SARGable",
    cat: "Concepts & Internals",
    say: "sar-ga-bull",
    short: "A predicate written so that SQL Server can use an index seek.",
    what: "SARG stands for Search Argument. A SARGable predicate compares a bare column to a constant or parameter using simple operators such as =, >, <, BETWEEN or LIKE without a leading wildcard. Wrapping the column in a function, applying arithmetic to it, or using a leading wildcard such as LIKE '%abc' prevents an efficient seek.",
    why: "Rewriting a predicate is often faster and cheaper than adding hardware or indexes.",
    syntax: "-- NOT SARGable: function on the column\nWHERE YEAR(OrderDate) = 2026\n-- SARGable: range on the bare column\nWHERE OrderDate >= '20260101' AND OrderDate < '20270101'\n\n-- NOT SARGable: leading wildcard\nWHERE CustomerName LIKE '%son'\n-- SARGable where appropriate: trailing wildcard\nWHERE CustomerName LIKE 'Anderson%'",
    how: [
      "Keep the column alone on one side of the comparison.",
      "Replace functions on dates with explicit date ranges.",
      "Avoid implicit conversions — compare like data types.",
      "Verify the change with an actual execution plan and SET STATISTICS IO."
    ],
    pitfalls: ["Assuming LIKE is always non-SARGable — a trailing wildcard can seek."],
    see: ["ch12-18", "ch12-17", "practical-07"]
  },

  {
    term: "Parameter sniffing",
    cat: "Concepts & Internals",
    say: "pa-ram-e-ter sniff-ing",
    short: "When a stored procedure's plan is built for one parameter value and reused for all the others.",
    what: "When a procedure is first compiled, SQL Server 'sniffs' the parameter values supplied on that first call and builds a plan tuned for them. If later calls pass very different values — for example one customer with three orders and another with three million — the cached plan may be exactly wrong for the second case, causing intermittent slowness.",
    why: "It explains the classic support ticket: 'the procedure is fast for some customers and slow for others'.",
    syntax: "-- Force recompilation for one execution\nEXEC dbo.usp_GetOrders @CustomerID = 42 WITH RECOMPILE;\n-- Or inside the procedure\nCREATE PROCEDURE dbo.usp_GetOrders @CustomerID int\nAS\nSELECT * FROM dbo.Orders\nWHERE CustomerID = @CustomerID\nOPTION (RECOMPILE);",
    how: [
      "Confirm the problem in Query Store by comparing plans and parameter values.",
      "Use OPTION (RECOMPILE) for highly variable, expensive queries.",
      "Consider OPTIMIZE FOR UNKNOWN or OPTIMIZE FOR a typical value.",
      "A filtered index or plan guide can help in specific cases — measure first."
    ],
    pitfalls: ["Recompiling everything — it adds CPU cost and removes plan reuse benefits."],
    see: ["ch12-19", "ch12-20", "ch12-21"]
  },

  {
    term: "Query Store",
    cat: "Concepts & Internals",
    say: "query store",
    short: "A built-in flight recorder that keeps query text, plans and performance history over time.",
    what: "Query Store captures queries, their execution plans and runtime statistics such as duration, CPU and reads, and keeps them in the database. It lets you see exactly when a plan changed and how performance shifted, and in many cases force a previously good plan while you fix the root cause.",
    why: "It turns 'it was fast yesterday' into an evidence-based investigation — invaluable for intermittent production issues.",
    syntax: "ALTER DATABASE Orders SET QUERY_STORE = ON\n(\n  OPERATION_MODE = READ_WRITE,\n  MAX_STORAGE_SIZE_MB = 512\n);\nGO\n-- Regressed queries\nSELECT q.query_id, q.query_text_id,\n       rs.avg_duration / 1000 AS avg_ms\nFROM sys.query_store_query q\nJOIN sys.query_store_runtime_stats rs\n  ON rs.plan_id IN (SELECT plan_id FROM sys.query_store_plan WHERE query_id = q.query_id)\nORDER BY rs.avg_duration DESC;",
    how: [
      "Enable Query Store on important databases (on by default in newer versions).",
      "Use the built-in reports in SSMS: Regressed Queries and Top Resource Consumers.",
      "Compare plans for the same query_id before and after a change.",
      "Force a known-good plan only as a temporary measure, then fix the cause."
    ],
    pitfalls: [
      "Leaving it in READ_ONLY so no new data is captured.",
      "Forcing a plan permanently without addressing stale statistics or index changes."
    ],
    see: ["ch12-20", "ch12-28", "practical-07"]
  },

  {
    term: "Lock",
    cat: "Concepts & Internals",
    say: "lock",
    short: "A mechanism that protects data so two sessions cannot change it inconsistently at the same time.",
    what: "SQL Server takes locks on rows, pages, tables or other resources. Shared (S) locks protect reads, exclusive (X) locks protect writes, update (U) locks help avoid conversion deadlocks, and intent locks signal the hierarchy. Locks are normal and necessary; problems arise when they are held too long or taken at too coarse a level.",
    why: "Every blocking and deadlock issue is really a story about which locks are held, for how long, and in what order.",
    syntax: "-- Current locks (via DMVs)\nSELECT request_session_id, resource_type, resource_description,\n       request_mode, request_status\nFROM   sys.dm_tran_locks\nWHERE  request_session_id > 50\nORDER BY request_session_id;",
    how: [
      "Keep transactions short — commit or roll back as soon as the work is done.",
      "Index the columns used in WHERE clauses so fewer rows need to be locked.",
      "Access tables in a consistent order across procedures to avoid deadlocks.",
      "Consider row versioning isolation to reduce reader-writer blocking."
    ],
    pitfalls: [
      "Leaving a transaction open in SSMS while you go for lunch.",
      "Treating all locks as bad — short, well-scoped locks are essential."
    ],
    see: ["ch13-05", "ch13-01", "practical-08"]
  },

  {
    term: "Blocking",
    cat: "Concepts & Internals",
    say: "block-ing",
    short: "One session waiting because another session holds a lock it needs.",
    what: "Blocking happens when session B wants a resource locked by session A. B waits until A releases it. A short block is normal in any busy database; a long block is an incident because every other session wanting the same resource queues up behind it. The session at the root is called the head blocker.",
    why: "Hundreds of timeouts can be caused by one badly behaved transaction. Fixing the victims changes nothing.",
    syntax: "-- Find blocked sessions and their blockers\nSELECT session_id, blocking_session_id, wait_type, wait_resource,\n       status, total_elapsed_time\nFROM   sys.dm_exec_requests\nWHERE  blocking_session_id <> 0\n    OR session_id IN (\n      SELECT DISTINCT blocking_session_id FROM sys.dm_exec_requests\n      WHERE blocking_session_id <> 0)\nORDER BY blocking_session_id DESC;",
    how: [
      "Find the head blocker: the session blocking others but not itself blocked.",
      "Inspect its statement, wait type and execution plan.",
      "Confirm with the application owner before stopping any production session.",
      "Fix the root cause — usually a missing index or a transaction left open by code."
    ],
    pitfalls: [
      "Killing every blocked session instead of the one causing the block.",
      "Ignoring a block that grows steadily through the business day."
    ],
    see: ["ch13-01", "ch13-03", "ch13-04", "practical-08"]
  },

  {
    term: "Deadlock",
    cat: "Concepts & Internals",
    say: "dead-lock",
    short: "A cycle where two sessions each hold a resource the other needs — SQL Server kills one of them.",
    what: "Session A holds a lock on table 1 and wants table 2; session B holds table 2 and wants table 1. Neither can proceed, so SQL Server's deadlock monitor detects the cycle and chooses a victim, rolling it back with error 1205 so the other can continue. This is a deliberate, normal mechanism, not a corruption.",
    why: "Frequent deadlocks cause application errors and retries. The deadlock graph tells you the access-order conflict that caused them.",
    syntax: "-- Capture deadlock graphs with Extended Events\nCREATE EVENT SESSION [CaptureDeadlocks] ON SERVER\nADD EVENT sqlserver.xml_deadlock_report\nADD TARGET package0.event_file\n  (SET filename = 'D:\\XEvents\\Deadlocks.xel');\nGO\nALTER EVENT SESSION [CaptureDeadlocks] ON SERVER STATE = START;",
    how: [
      "Capture the graph with Extended Events and open the .xel file in SSMS.",
      "Identify the two processes, the resources and the lock modes in the cycle.",
      "Make all procedures access tables in the same order.",
      "Add indexes so transactions lock fewer rows for less time."
    ],
    pitfalls: [
      "Treating error 1205 by adding blind retries without fixing the cause.",
      "Assuming the victim is always the 'wrong' query — it is just the cheaper rollback."
    ],
    see: ["ch13-18", "ch13-19", "ch13-20", "practical-08"]
  },

  {
    term: "Isolation level",
    cat: "Concepts & Internals",
    say: "iso-la-tion level",
    short: "A setting that decides how much one transaction is protected from the effects of others.",
    what: "Isolation levels trade consistency against concurrency. READ UNCOMMITTED allows dirty reads. READ COMMITTED (the default) prevents dirty reads. REPEATABLE READ holds read locks longer, SERIALIZABLE prevents phantoms, and SNAPSHOT uses row versioning instead of blocking. Higher isolation means more consistency but usually more blocking.",
    why: "Changing isolation is a powerful way to resolve reader-writer blocking — but it changes application semantics, so it must be tested.",
    syntax: "SET TRANSACTION ISOLATION LEVEL READ COMMITTED;\nGO\n-- Enable row versioning options at database level\nALTER DATABASE Orders SET READ_COMMITTED_SNAPSHOT ON;\nGO\nALTER DATABASE Orders SET ALLOW_SNAPSHOT_ISOLATION ON;",
    how: [
      "Keep READ COMMITTED unless you have a specific reason to change.",
      "For heavy reporting, consider READ COMMITTED SNAPSHOT to version rows instead of blocking.",
      "Test the application thoroughly — versioning changes what a reader can see.",
      "Monitor tempdb version store if you enable snapshot isolation."
    ],
    pitfalls: [
      "Using READ UNCOMMITTED (NOLOCK) to 'speed up' reports — it can return dirty or duplicate data.",
      "Enabling snapshot options without checking tempdb capacity."
    ],
    see: ["ch13-11", "ch13-16", "ch13-17"]
  },

  {
    term: "ACID / Transaction",
    cat: "Concepts & Internals",
    say: "ay-sid",
    short: "The four guarantees that make a group of statements all-or-nothing and crash-safe.",
    what: "A transaction groups several statements into one unit of work. ACID stands for Atomicity (all succeed or all roll back), Consistency (valid state to valid state), Isolation (concurrent transactions do not interfere beyond the chosen level) and Durability (committed changes survive a crash via the log). BEGIN TRAN starts one; COMMIT makes it permanent; ROLLBACK undoes it.",
    why: "Without explicit transactions, a failure halfway through a multi-statement operation leaves partial, inconsistent data.",
    syntax: "BEGIN TRY\n  BEGIN TRAN;\n  INSERT dbo.Orders (CustomerID) VALUES (1);\n  INSERT dbo.OrderItems (OrderID, Qty) VALUES (SCOPE_IDENTITY(), 2);\n  COMMIT;\nEND TRY\nBEGIN CATCH\n  IF XACT_STATE() <> 0 ROLLBACK;\n  THROW;\nEND CATCH;",
    how: [
      "Wrap related writes in BEGIN TRAN / COMMIT.",
      "Always use TRY/CATCH and roll back in the CATCH block.",
      "Keep transactions short to reduce blocking.",
      "Check @@TRANCOUNT or XACT_STATE() before rolling back."
    ],
    pitfalls: [
      "Forgetting to commit — an open transaction holds locks indefinitely.",
      "Assuming each statement is part of a transaction automatically; in autocommit mode each is its own."
    ],
    see: ["ch02-13", "ch02-14", "practical-01"]
  },

  {
    term: "Orphaned user",
    cat: "Concepts & Internals",
    say: "or-phaned user",
    short: "A database user whose SID no longer matches any server login, usually after a restore.",
    what: "Users inside a database are mapped to server logins by a security identifier (SID). When you restore a database to a different server, the logins may exist with different SIDs, so the mapping breaks. The user still appears in the database but cannot connect — it is 'orphaned'.",
    why: "This is the most common reason an application cannot log in after a restore or migration.",
    syntax: "-- Find orphaned users\nSELECT dp.name AS db_user, dp.sid\nFROM   sys.database_principals dp\nLEFT JOIN sys.server_principals sp ON sp.sid = dp.sid\nWHERE  dp.type = 'S' AND sp.sid IS NULL\n  AND dp.name NOT IN ('dbo','guest','INFORMATION_SCHEMA','sys');\nGO\n-- Remap\nALTER USER AppLogin WITH LOGIN = AppLogin;",
    how: [
      "Run the SID query after every restore to another server.",
      "Recreate the login with the original SID where possible, or remap with ALTER USER.",
      "Verify with the application that permissions still work.",
      "Add the check to your restore runbook."
    ],
    pitfalls: ["Giving the application sysadmin to 'fix' login failures — never do this."],
    see: ["ch08-19", "ch08-20", "practical-04"]
  }
]);
