/* Glossary & Command Reference — part 3: backup/restore, DBCC and integrity. */

window.GLOSSARY = (window.GLOSSARY || []).concat([

  {
    term: "DBCC CHECKDB",
    cat: "Integrity & Maintenance",
    say: "D-B-C-C check-D-B",
    short: "The command that checks a database's structural integrity — the single most important integrity check in SQL Server.",
    what: "DBCC CHECKDB checks the allocation structures, the index and row structures, system catalogue consistency and, with the right options, the data itself. Internally it runs DBCC CHECKALLOC, DBCC CHECKTABLE on every table and indexed view, and DBCC CHECKCATALOG. It reports errors such as damaged pages, broken page links or invalid pointers. It does NOT tell you whether your business data is logically correct (e.g. whether a price is negative) — that requires constraints or application checks.",
    why: "Corruption is silent until it is discovered. CHECKDB is the only built-in way to know whether a database is structurally sound. Running it regularly and alerting on errors is a core DBA responsibility; a backup of a corrupt database is still corrupt.",
    syntax: "DBCC CHECKDB (N'Orders') WITH NO_INFOMSGS, ALL_ERRORMSGS;\nGO\n-- Physical-only checks are faster but do not validate data correctness\nDBCC CHECKDB (N'Orders') WITH NO_INFOMSGS, ALL_ERRORMSGS,\n  PHYSICAL_ONLY;\nGO\n-- Estimated completion without doing the work\nDBCC CHECKDB (N'Orders') WITH ESTIMATE_ONLY;",
    how: [
      "Schedule CHECKDB for every database on every instance — daily for critical systems if the size allows.",
      "Run it with ALL_ERRORMSGS so you see all errors, and NO_INFOMSGS to reduce noise.",
      "For very large databases, use PHYSICAL_ONLY frequently and a full CHECKDB less often, or split checks across days with CHECKALLOC/CHECKTABLE/CHECKCATALOG.",
      "Run it during a quiet window: it reads the whole database and can add significant I/O and CPU load.",
      "Alert on any error. If errors appear, restore a known-good backup and run CHECKDB there to determine when corruption started.",
      "Use WITH DATA_PURITY to catch invalid column values in databases upgraded from older versions."
    ],
    pitfalls: [
      "Assuming backups guarantee integrity — a backup can contain corruption.",
      "Running CHECKDB only once at installation and never again.",
      "Ignoring errors because 'the application still works' — corruption spreads and eventually causes data loss.",
      "Running a full CHECKDB on a multi-terabyte database in the middle of business hours without testing the impact."
    ],
    see: ["ch14-08", "ch14-16", "ch15-12", "practical-09"],
    faq: [
      {
        q: "Is DBCC CHECKDB safe to run in production?",
        a: "It is read-only for data (it uses internal snapshots), so it does not change your tables, but it is resource-intensive. It can slow the instance because it reads every page and uses CPU and tempdb. Schedule it in a maintenance window, use PHYSICAL_ONLY for frequent runs, and test the duration on a restored copy first."
      },
      {
        q: "What does 'repair' mean — can I use REPAIR_ALLOW_DATA_LOSS?",
        a: "DBCC CHECKDB offers REPAIR_FAST, REPAIR_REBUILD and REPAIR_ALLOW_DATA_LOSS. The last option can delete corrupt pages and the rows on them, so it may lose data. It should be a last resort when no good backup exists — always restore from a known-good backup first if possible, and take a copy before any repair."
      },
      {
        q: "How long does CHECKDB take?",
        a: "It depends on database size, disk speed, CPU and concurrent workload. Use WITH ESTIMATE_ONLY to get an estimate, and monitor progress with the 'DBCC CHECKDB' percent-complete column in sys.dm_exec_requests."
      }
    ]
  },

  {
    term: "DBCC CHECKALLOC",
    cat: "Integrity & Maintenance",
    say: "D-B-C-C check-al-loc",
    short: "Checks the consistency of the database's allocation structures — which pages and extents belong where.",
    what: "CHECKALLOC verifies that the system tables tracking page and extent ownership are consistent: that every page is allocated to exactly one object, that extents are accounted for, and that the allocation bitmap pages agree with the object metadata. It is one component of CHECKDB.",
    why: "Allocation corruption can cause pages to be assigned to the wrong object or lost entirely. Splitting it out lets you spread integrity checks over several nights for a very large database.",
    syntax: "DBCC CHECKALLOC (N'Orders') WITH NO_INFOMSGS, ALL_ERRORMSGS;",
    how: [
      "Use it as part of a split integrity strategy: CHECKALLOC night 1, CHECKTABLE on groups of tables subsequent nights, CHECKCATALOG weekly.",
      "Run the full CHECKDB at least weekly if you split checks, to catch cross-object problems.",
      "Treat any error like a CHECKDB error — investigate from a known-good backup."
    ],
    pitfalls: ["Running only CHECKALLOC and assuming the whole database is checked — it does not validate row or index structure."],
    see: ["ch14-09", "ch14-16", "practical-09"]
  },

  {
    term: "DBCC CHECKTABLE",
    cat: "Integrity & Maintenance",
    say: "D-B-C-C check-table",
    short: "Checks the integrity of one table or indexed view — its pages, indexes and row structure.",
    what: "CHECKTABLE verifies the structure of a single table: the in-row data, LOB data, indexes and their links. It detects damaged rows, wrong page links and broken index ordering. Because it targets one table, it is the building block for spreading a large CHECKDB across multiple days.",
    why: "It lets you check a suspect table immediately without waiting for a full database check, and makes integrity checks feasible on multi-terabyte databases.",
    syntax: "DBCC CHECKTABLE (N'dbo.Orders') WITH NO_INFOMSGS, ALL_ERRORMSGS;\nGO\n-- With physical-only for a faster check\nDBCC CHECKTABLE (N'dbo.Orders') WITH PHYSICAL_ONLY;",
    how: [
      "Run it on a specific table when you suspect corruption there.",
      "In a split strategy, check groups of tables each night and cover all of them within a week.",
      "Remember it does not check allocation or catalogue consistency — complement it with CHECKALLOC and CHECKCATALOG."
    ],
    pitfalls: ["Forgetting system tables and indexed views when building a manual split-check schedule."],
    see: ["ch14-10", "ch14-16", "practical-09"]
  },

  {
    term: "DBCC CHECKCATALOG",
    cat: "Integrity & Maintenance",
    say: "D-B-C-C check-catalog",
    short: "Checks consistency between the system metadata tables in a database.",
    what: "CHECKCATALOG verifies that the internal system tables that describe objects, columns, indexes and constraints are consistent with each other. Metadata corruption can make objects disappear or behave strangely, even when user data pages are fine.",
    why: "It is the third component of CHECKDB and is quick to run, so it is worth including in a split integrity schedule.",
    syntax: "DBCC CHECKCATALOG (N'Orders') WITH NO_INFOMSGS;",
    how: [
      "Run it as part of a weekly split-check strategy.",
      "Treat any error as a sign of metadata corruption — restore from a known-good backup.",
      "It requires the database to be in a state where metadata can be read; severe corruption may block it."
    ],
    pitfalls: ["Assuming CHECKTABLE covers the system catalogue — it does not."],
    see: ["ch14-16", "ch14-02", "practical-09"]
  },

  {
    term: "DBCC INPUTBUFFER",
    cat: "Integrity & Maintenance",
    say: "D-B-C-C in-put-buff-er",
    short: "Shows the last batch of SQL text submitted by a session — essential for identifying a blocker.",
    what: "Given a session_id, DBCC INPUTBUFFER returns the event type, parameters and the last statement that session sent. It does not show the currently executing statement inside a procedure — for that use sys.dm_exec_requests with sys.dm_exec_sql_text. It is invaluable when a session has been blocking others for hours.",
    why: "It answers 'what did this session actually run?' in seconds, which is usually the first question during a blocking incident.",
    syntax: "DBCC INPUTBUFFER(62);\nGO\n-- For the currently executing statement instead:\nSELECT r.session_id, t.text\\nFROM   sys.dm_exec_requests r\\nCROSS APPLY sys.dm_exec_sql_text(r.sql_handle) t\\nWHERE  r.session_id = 62;",
    how: [
      "Get the session_id from sys.dm_exec_requests where blocking_session_id <> 0.",
      "Run DBCC INPUTBUFFER on the head blocker.",
      "If the result is a procedure call, use dm_exec_sql_text to see the statement inside it.",
      "Combine with DBCC OPENTRAN if a transaction appears stuck."
    ],
    pitfalls: ["Mistaking the last submitted batch for the exact statement running now."],
    see: ["ch13-04", "ch13-23", "practical-08"]
  },

  {
    term: "DBCC OPENTRAN",
    cat: "Integrity & Maintenance",
    say: "D-B-C-C open-tran",
    short: "Shows the oldest open transaction in a database — often the cause of an unshrinkable log.",
    what: "DBCC OPENTRAN reports the oldest active transaction and its start time, and for replicated databases the oldest distributed and non-distributed transactions. A very old open transaction prevents the log from truncating, because log records behind it must be retained.",
    why: "When a log file grows unexpectedly, OPENTRAN tells you whether an abandoned transaction is holding it — and which session to investigate.",
    syntax: "DBCC OPENTRAN (N'Orders');\nGO\n-- Then find the session with that transaction\\nSELECT session_id, status, command, wait_type\\nFROM   sys.dm_exec_requests WHERE session_id > 50;",
    how: [
      "Run it when the transaction log keeps growing despite regular log backups.",
      "Note the transaction start time and find the matching session.",
      "Check DBCC INPUTBUFFER on that session to see what it ran.",
      "Resolve with the application owner — KILL only as a last resort."
    ],
    pitfalls: ["Running it against the wrong database — open transactions are per database."],
    see: ["ch19-09", "ch06-10", "ch13-05"]
  },

  {
    term: "DBCC SHRINKFILE / SHRINKDATABASE",
    cat: "Integrity & Maintenance",
    say: "D-B-C-C shrink-file",
    short: "Shrinks a data or log file by reclaiming space inside it.",
    what: "DBCC SHRINKFILE shrinks an individual file to a target size in MB; SHRINKDATABASE shrinks all files in a database. Shrinking a data file moves pages towards the front of the file, which fragments indexes. Shrinking a log file only works after the inactive portion has been truncated by a log backup (FULL) or checkpoint (SIMPLE).",
    why: "It is a one-off tool for a genuine space problem, not routine maintenance. Repeated data-file shrinkage causes fragmentation and performance loss.",
    syntax: "-- Shrink the log to 2 GB after a log backup\\nDBCC SHRINKFILE (Orders_Log, 2048);\\nGO\\n-- Empty a file before removing it\\nDBCC SHRINKFILE (Orders_Archive, EMPTYFILE);\\nGO\\n-- Check free space first\\nSELECT name, size / 128 AS size_mb,\\n       (size - CAST(FILEPROPERTY(name,'SpaceUsed') AS int)) / 128 AS free_mb\\nFROM sys.database_files;",
    how: [
      "Fix the cause first: why did the file grow? (Missing log backups, a large delete, an index rebuild.)",
      "For a log file, take a log backup, then shrink to a sensible steady-state size.",
      "Never shrink data files on a schedule; if you must, rebuild indexes afterwards.",
      "Use EMPTYFILE when you intend to remove a data file from a filegroup."
    ],
    pitfalls: [
      "Shrinking a data file regularly and then wondering why indexes are 90% fragmented.",
      "Trying to shrink a log that has not been truncated — nothing happens."
    ],
    see: ["ch06-16", "ch06-17", "practical-02"]
  },

  {
    term: "DBCC FLUSHPROCINDCACHE",
    cat: "Integrity & Maintenance",
    say: "D-B-C-C flush-proc-in-d-cache",
    short: "Clears the cached execution plans for the current database.",
    what: "This command removes all plans for the current database from the plan cache, forcing the next executions to recompile. It is occasionally used after a major change (upgrade, large statistics update) to remove stale plans. It is a blunt instrument and much less targeted than a plan-specific approach such as sp_recompile or Query Store.",
    why: "Useful as a last-resort cache reset in a controlled maintenance window when stale plans are suspected across the whole database.",
    syntax: "USE Orders;\nGO\nDBCC FLUSHPROCINDCACHE;\nGO\n-- Targeted alternative for one object:\nEXEC sp_recompile N'dbo.usp_GetOrders';",
    how: [
      "Prefer a targeted option: sp_recompile for one object, or Query Store plan forcing.",
      "Schedule a cache clear in a quiet period — recompilation causes a short CPU spike.",
      "Measure before and after; do not repeat blindly."
    ],
    pitfalls: ["Flushing the cache as a routine 'fix' without diagnosing the root cause."],
    see: ["ch04-08", "ch12-19", "ch12-28"]
  },

  {
    term: "BACKUP DATABASE",
    cat: "Backup & Restore",
    say: "back-up data-base",
    short: "Creates a full or differential backup of a database.",
    what: "BACKUP DATABASE with no DIFFERENTIAL option creates a full backup — a complete copy of the database at a point in time, plus enough log to make it consistent. WITH DIFFERENTIAL creates a backup of only the extents changed since the last full backup. Backups can go to disk, tape or URL (Azure Blob Storage), can be compressed, and can be striped across multiple files.",
    why: "It is the foundation of every recovery strategy. Without a tested backup you have no way to recover from corruption, hardware failure or human error.",
    syntax: "-- Full backup with compression and checksum\\nBACKUP DATABASE Orders\\nTO DISK = N'D:\\\\Backups\\\\Orders_Full.bak'\\nWITH COMPRESSION, INIT, CHECKSUM, STATS = 10;\nGO\\n-- Differential backup\\nBACKUP DATABASE Orders\\nTO DISK = N'D:\\\\Backups\\\\Orders_Diff.bak'\\nWITH DIFFERENTIAL, COMPRESSION, INIT;\nGO\\n-- Striped backup to two files\\nBACKUP DATABASE Orders\\nTO DISK = N'D:\\\\Backups\\\\Orders_1.bak',\\n   DISK = N'E:\\\\Backups\\\\Orders_2.bak'\\nWITH COMPRESSION, INIT;",
    how: [
      "Schedule full backups based on how much data you can afford to lose (RPO).",
      "Use COMPRESSION to reduce size, CHECKSUM to validate pages, and INIT to overwrite the media.",
      "Take a full backup immediately after switching to FULL recovery model.",
      "Copy backups to off-site storage and test restores regularly."
    ],
    pitfalls: [
      "Backing up to the same physical disk as the database — a disk failure loses both.",
      "Never testing a restore — an untested backup is only a hypothesis."
    ],
    see: ["ch07-02", "ch07-03", "ch07-31", "practical-03"]
  },

  {
    term: "BACKUP LOG",
    cat: "Backup & Restore",
    say: "back-up log",
    short: "Backs up the transaction log, truncating inactive log records so the log can be reused.",
    what: "BACKUP LOG works only in FULL or BULK_LOGGED recovery model. It copies log records generated since the last log backup and then marks the inactive portion of the log reusable. It does not shrink the physical file. Frequent log backups limit data loss and keep the log from growing without bound.",
    why: "It enables point-in-time recovery and is the only way to control log growth in FULL recovery model. A missing log backup breaks the restore chain.",
    syntax: "BACKUP LOG Orders\\nTO DISK = N'D:\\\\Backups\\\\Orders_Log.trn'\\nWITH COMPRESSION, CHECKSUM, STATS = 10;\nGO\\n-- Check log space used\\nSELECT name, log_reuse_wait_desc\\nFROM   sys.databases WHERE name = N'Orders';",
    how: [
      "Schedule log backups every 5-15 minutes on busy production systems, based on your RPO.",
      "Use a unique file name per log backup (include the timestamp).",
      "If the log will not truncate, check log_reuse_wait_desc in sys.databases.",
      "Never delete .trn files from disk without confirming they have been backed up elsewhere."
    ],
    pitfalls: [
      "Setting FULL recovery without scheduling log backups — the log grows until the disk is full.",
      "Switching to SIMPLE to 'solve' log growth, losing point-in-time recovery."
    ],
    see: ["ch07-05", "ch07-15", "ch07-16", "practical-03"]
  },

  {
    term: "RESTORE DATABASE / RESTORE LOG",
    cat: "Backup & Restore",
    say: "re-store data-base / re-store log",
    short: "Restores backups in sequence to recover a database, optionally to a point in time.",
    what: "A restore starts with a full backup, then an optional differential, then log backups in order. WITH NORECOVERRY leaves the database restoring so more backups can be applied; WITH RECOVERY finishes the restore and brings the database online. STOPAT restores to a specific time. MOVE relocates files when restoring to a different server or path.",
    why: "This is the command that actually saves you during an incident. Knowing the sequence and options is essential — and practising it removes panic.",
    syntax: "-- 1. Restore the full backup, leaving the database in restoring state\\nRESTORE DATABASE Orders_Rehearsal\\nFROM DISK = N'D:\\\\Backups\\\\Orders_Full.bak'\\nWITH MOVE N'Orders_Data' TO N'D:\\\\Data\\\\Orders_Rehearsal.mdf',\\n     MOVE N'Orders_Log'  TO N'L:\\\\Log\\\\Orders_Rehearsal.ldf',\\n     NORECOVERY, STATS = 10;\nGO\\n-- 2. Restore the latest differential\\nRESTORE DATABASE Orders_Rehearsal\\nFROM DISK = N'D:\\\\Backups\\\\Orders_Diff.bak'\\nWITH NORECOVERY;\nGO\\n-- 3. Restore log backups in order, stopping at the incident time\\nRESTORE LOG Orders_Rehearsal\\nFROM DISK = N'D:\\\\Backups\\\\Orders_Log_0930.trn'\\nWITH STOPAT = '2026-11-17T09:25:00', RECOVERY;\nGO\\n-- Inspect a backup without restoring it\\nRESTORE HEADERONLY FROM DISK = N'D:\\\\Backups\\\\Orders_Full.bak';",
    how: [
      "Rehearse restores on a separate server or database name regularly.",
      "Use RESTORE HEADERONLY / FILELISTONLY / VERIFYONLY to inspect and validate backups.",
      "Always apply log backups in LSN order with NORECOVERY until the final one.",
      "After a restore to another server, check for orphaned users and fix them with ALTER USER."
    ],
    pitfalls: [
      "Using RECOVERY too early — no further backups can then be applied.",
      "Restoring over a live production database by mistake — always check the target name and path."
    ],
    see: ["ch08-03", "ch08-04", "ch08-10", "practical-04"]
  },

  {
    term: "RESTORE VERIFYONLY",
    cat: "Backup & Restore",
    say: "re-store ver-i-fy-only",
    short: "Checks that a backup file can be read and is structurally valid, without restoring it.",
    what: "RESTORE VERIFYONLY reads the backup media and verifies that it is complete and readable. With CHECKSUM it also validates page checksums recorded at backup time. It does not prove that all tables can be restored correctly — only an actual test restore does.",
    why: "It is a quick way to detect a corrupted or truncated backup file before you need it, and can be automated after each backup job.",
    syntax: "RESTORE VERIFYONLY\\nFROM DISK = N'D:\\\\Backups\\\\Orders_Full.bak'\\nWITH CHECKSUM;\nGO\n-- List the files inside a backup without restoring\\nRESTORE FILELISTONLY\\nFROM DISK = N'D:\\\\Backups\\\\Orders_Full.bak';",
    how: [
      "Add VERIFYONLY WITH CHECKSUM to your backup verification job.",
      "Follow it with a real restore test on a schedule — VERIFYONLY is not a substitute.",
      "Use FILELISTONLY to find logical file names for MOVE clauses."
    ],
    pitfalls: ["Believing VERIFYONLY means the restore is guaranteed to succeed."],
    see: ["ch07-13", "ch07-14", "ch07-30"]
  },

  {
    term: "Recovery point / RPO & RTO",
    cat: "Backup & Restore",
    say: "R-P-O / R-T-O",
    short: "RPO is how much data you can afford to lose; RTO is how long you can afford to be down.",
    what: "Recovery Point Objective is the maximum acceptable gap between the last committed transaction and the recovered state. Recovery Time Objective is the maximum acceptable downtime. These business decisions drive the backup frequency, recovery model, storage choices and whether you need Always On availability groups.",
    why: "Without agreed RPO and RTO, backup schedules are guesswork. A DBA must translate these objectives into a concrete, tested strategy.",
    syntax: "-- No T-SQL: RPO/RTO are design targets.\\n-- Example mapping:\\n-- RPO 5 minutes  -> log backups every 5 minutes in FULL recovery\\n-- RTO 30 minutes -> warm standby or automated restore runbook\\n-- Verify what your schedule actually achieves:\\nSELECT database_name, type, backup_finish_date\\nFROM msdb.dbo.backupset\\nWHERE database_name = N'Orders'\\nORDER BY backup_finish_date DESC;",
    how: [
      "Agree RPO and RTO with the business, not just the IT team.",
      "Map them to backup frequency and recovery technology.",
      "Measure actual restore times in drills and compare with RTO.",
      "Document the strategy and review it when data volume grows."
    ],
    pitfalls: ["Promising an RPO that log backup frequency cannot deliver."],
    see: ["ch07-32", "ch08-27", "ch20-22"]
  },

  {
    term: "Tail-log backup",
    cat: "Backup & Restore",
    say: "tail-log back-up",
    short: "A final log backup taken after a failure to capture work since the last log backup.",
    what: "Before restoring a damaged database, a tail-log backup captures log records generated since the last scheduled log backup, so you can recover right up to the point of failure. It requires the database to be in FULL or BULK_LOGGED model and usually uses WITH NORECOVERY or NO_TRUNCATE if the data files are unavailable.",
    why: "Skipping the tail-log backup can mean losing minutes or hours of transactions that were safe in the log but not yet backed up.",
    syntax: "BACKUP LOG Orders\\nTO DISK = N'D:\\\\Backups\\\\Orders_Tail.trn'\\nWITH NORECOVERY, INIT, COMPRESSION;\nGO\n-- If the data file is inaccessible\\nBACKUP LOG Orders\\nTO DISK = N'D:\\\\Backups\\\\Orders_Tail.trn'\\nWITH NO_TRUNCATE, INIT;",
    how: [
      "Take a tail-log backup before any restore of a production database where possible.",
      "Use NO_TRUNCATE when the data file is damaged but the log is intact.",
      "Store it separately — it is the most recent copy of your data.",
      "Apply it as the last log backup in the restore sequence."
    ],
    pitfalls: ["Restoring first and losing the chance to capture the tail of the log."],
    see: ["ch07-19", "ch08-12", "practical-03"]
  },

  {
    term: "Orphaned file / suspect database",
    cat: "Backup & Restore",
    say: "suspect data-base",
    short: "A database marked SUSPECT when SQL Server cannot open or recover it after an error.",
    what: "If a critical file is missing or recovery fails, SQL Server marks the database SUSPECT and refuses to open it. This is a protective state, not a death sentence. The correct response is to investigate the cause, restore from a good backup, and only in emergencies consider EMERGENCY mode with repair — which risks data loss.",
    why: "Panic actions in this state destroy evidence and often make recovery impossible. A calm, backup-first process saves data.",
    syntax: "SELECT name, state_desc\\nFROM   sys.databases WHERE state_desc <> 'ONLINE';\nGO\n-- Read the error log for the cause\\nEXEC sp_readerrorlog 0, 1, N'Orders';",
    how: [
      "Check the SQL Server error log first to find the actual failure.",
      "Do not detach the database or delete files.",
      "Restore from the most recent known-good backup to a different name first if possible.",
      "Take a tail-log backup if the log is still accessible."
    ],
    pitfalls: ["Setting the database EMERGENCY and running REPAIR_ALLOW_DATA_LOSS before trying a restore."],
    see: ["ch14-12", "ch14-15", "ch19-11"]
  }
]);
