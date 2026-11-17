/* Practical knowledge: practical-08 .. practical-10. */

export const P3 = {
  "practical-08": {
    lead: "A hands-on concurrency lab: reproduce blocking and a deadlock, find the head blocker with DMVs, capture a deadlock graph with Extended Events, and fix the root cause with indexing and consistent access order.",
    objectives: [
      "Reproduce blocking with two sessions",
      "Identify the head blocker and wait resource",
      "Reproduce a deadlock safely in a lab",
      "Capture and read a deadlock graph",
      "Apply fixes that remove the root cause"
    ],
    paras: [
      "This lab makes concurrency visible. You will create blocking on purpose, watch sessions queue, then force a deadlock and read the graph SQL Server produces — skills that turn a panicked incident into a calm diagnosis.",
      "Work only on a scratch database. You will hold transactions open across sessions, so use short timeouts and always clean up with ROLLBACK or KILL of your own test sessions.",
      "Locking protects consistency; blocking is one session waiting on another's lock, and a deadlock is a cycle where each session holds what the other needs. Short blocks are normal; long blocks and repeated deadlocks are incidents.",
      "The investigation flow below is the one to memorise: detect the block, find the head blocker, inspect its statement and plan, fix the cause, then verify the queue drains.",
      "Open two query windows. In session A, begin a transaction and update a row without committing. In session B, try to update the same row — it will block. Query dm_exec_requests to see B's blocking_session_id pointing at A.",
      "Find the head blocker: among blocked sessions, identify the one that is blocking others but is not itself blocked. Read its wait_type, wait_resource and statement to understand what it is holding.",
      "For the deadlock, make two sessions update the same two tables in opposite orders inside transactions. SQL Server detects the cycle and terminates one session with error 1205, the deadlock victim.",
      "Create an Extended Events session on xml_deadlock_report to capture the graph, then fix the cause: consistent access order and an index that narrows the locks taken. Retry to confirm the deadlocks stop."
    ],
    code: [
      { lang: "sql", body: "-- SESSION A: hold a lock (leave this transaction open)\nBEGIN TRAN;\nUPDATE dbo.ConcurrencyDemo\nSET    Amount = Amount + 1\nWHERE  Id = 1;\n-- Do NOT commit yet\nGO\n\n-- SESSION B: this will block behind session A\nUPDATE dbo.ConcurrencyDemo\nSET    Amount = Amount + 2\nWHERE  Id = 1;\nGO" },
      { lang: "sql", body: "-- THIRD SESSION: find the head blocker\nSELECT r.session_id, r.blocking_session_id, r.wait_type,\n       r.wait_resource, r.status, t.text AS sql_text\nFROM   sys.dm_exec_requests r\nOUTER APPLY sys.dm_exec_sql_text(r.sql_handle) t\nWHERE  r.blocking_session_id <> 0\n    OR r.session_id IN (\n         SELECT DISTINCT blocking_session_id\n         FROM   sys.dm_exec_requests\n         WHERE  blocking_session_id <> 0\n       )\nORDER BY r.blocking_session_id DESC;\nGO" },
      { lang: "sql", body: "-- Capture deadlocks with Extended Events\nCREATE EVENT SESSION [CaptureDeadlocks] ON SERVER\nADD EVENT sqlserver.xml_deadlock_report\nADD TARGET package0.event_file\n  (SET filename = 'D:\\XEvents\\Deadlocks.xel');\nGO\nALTER EVENT SESSION [CaptureDeadlocks] ON SERVER STATE = START;\nGO\n-- Reduce reader/writer blocking where appropriate\nALTER DATABASE ConcurrencyLab\nSET READ_COMMITTED_SNAPSHOT ON;\nGO" }
    ],
    tables: [
      ["Lock", "Purpose", "Compatibility", "Shared (S)", "Protect a read", "Compatible with other S", "Exclusive (X)", "Protect a write", "Incompatible with everything", "Update (U)", "Avoid conversion deadlocks", "Compatible with S"],
      ["Isolation level", "Dirty reads", "Effect on blocking", "READ UNCOMMITTED", "Allowed", "Minimal locking, dirty data", "READ COMMITTED", "Prevented", "Default; writers can block readers", "SNAPSHOT", "Prevented", "Row versioning reduces blocking"]
    ],
    diagram: { label: "Blocking and deadlock investigation", caption: "Detect the queue, find the head blocker, inspect its statement, then remove the root cause.", nodes: ["Sessions report waits", "Find head blocker in dm_exec_requests", "Read statement and wait resource", "Capture deadlock graph via XEvents", "Fix order / indexing and verify"] },
    steps: [
      "Create ConcurrencyLab with a dbo.ConcurrencyDemo table containing a few thousand rows and an Amount column.",
      "In session A, begin a transaction, update one row and leave the transaction open.",
      "In session B, update the same row and confirm it blocks; note the spinner or waiting state.",
      "From a third session, run the DMV query and identify A as the head blocker and B as blocked.",
      "Read session A's wait_type, wait_resource and statement text from the query output.",
      "Roll back session A and confirm session B completes immediately — the queue drains when the head blocker releases.",
      "Start the Extended Events session to capture xml_deadlock_report events.",
      "In two sessions, update two tables in opposite orders inside transactions to force a deadlock; one session should fail with error 1205.",
      "Open the captured .xel file in SSMS and read the deadlock graph — identify the processes, resources and lock modes in the cycle.",
      "Rewrite the two procedures to access tables in the same order, add a supporting index, then retry to confirm deadlocks stop."
    ],
    scenario: ["The head blocker behind 200 timeouts", "An application ran a large unindexed DELETE at 2 p.m., holding locks on a busy table while two hundred sessions queued behind it and timed out. The DBA found the single head blocker, confirmed it was the unindexed delete, stopped it with approval and added an index that narrowed the locks. Chasing the two hundred victims would have changed nothing. In a separate case, two procedures updated tables in opposite order; the deadlock graph made the cycle obvious, and consistent access order eliminated it permanently."],
    interview: [
      ["What is the difference between blocking and a deadlock?", "Blocking is one session waiting for a lock another holds, resolving when the holder finishes; a deadlock is a cycle of sessions each holding what the other needs, which SQL Server resolves by killing a victim."],
      ["How do you find the head blocker?", "Query sys.dm_exec_requests for blocked sessions, then find the one blocking others but not itself blocked; inspect its statement, wait type and plan to address the root cause."],
      ["How does READ COMMITTED SNAPSHOT reduce blocking?", "It uses row versioning so readers do not take shared locks that block writers and writers do not block readers, at the cost of extra tempdb version-store usage and slightly different read semantics."]
    ],
    takeaways: [
      "Investigate the head blocker, not the queue of blocked sessions",
      "Short blocking is normal; long blocking and repeated deadlocks are incidents",
      "Deadlock graphs reveal the access-order conflict behind the symptom",
      "Consistent access order and good indexing are the durable fixes",
      "Extended Events captures deadlocks with low overhead in production"
    ]
  },

  "practical-09": {
    lead: "A hands-on integrity lab: enable page checksums, run DBCC CHECKDB, interpret consistency errors, perform a page-level restore from a verified backup, and practise safe corruption response.",
    objectives: [
      "Enable and verify page checksums",
      "Run and interpret DBCC CHECKDB output",
      "Understand repair levels and their risk",
      "Restore a damaged page from a clean backup",
      "Follow a safe corruption-incident response"
    ],
    paras: [
      "This lab covers database integrity: detecting damage early and responding without making data loss worse. You will use DBCC CHECKDB and practise a page-level restore, the surgical option that minimises downtime.",
      "Work on a scratch database and a local instance. Real corruption is rare and destructive to simulate, so this lab focuses on the detection and restore mechanics using a controlled setup.",
      "Corruption is physical (damaged page bytes or I/O errors) or logical (structurally consistent but wrong metadata). Page checksums detect physical damage on read; CHECKDB checks allocation, structure and logical consistency.",
      "The response flow below is deliberately cautious: detect, preserve evidence, identify the damaged page, restore from a clean backup, apply logs, then re-run CHECKDB to confirm a clean result.",
      "Ensure PAGE_VERIFY is set to CHECKSUM and take a full backup with CHECKSUM. Confirm the backup is readable — this is the backup you will restore a page from later.",
      "Run DBCC CHECKDB and read the output carefully, including the 'repair level' it recommends and the count of errors. Even on a clean database, understanding the output is the point.",
      "Review the three repair options. REPAIR_FAST and REPAIR_REBUILD are limited; REPAIR_ALLOW_DATA_LOSS can delete rows to achieve consistency and must be a last resort with a copy and business approval.",
      "Perform a page-level restore of a known page using RESTORE DATABASE ... PAGE from a verified backup, apply the log chain and finish with CHECKDB to prove the database is clean."
    ],
    code: [
      { lang: "sql", body: "ALTER DATABASE IntegrityLab SET PAGE_VERIFY CHECKSUM;\nGO\nBACKUP DATABASE IntegrityLab\nTO DISK = 'D:\\Backups\\IntegrityLab_Clean.bak'\nWITH COMPRESSION, CHECKSUM, INIT, STATS = 10;\nGO\n-- Full integrity check with all errors reported\nDBCC CHECKDB ('IntegrityLab')\nWITH NO_INFOMSGS, ALL_ERRORMSGS;\nGO" },
      { lang: "sql", body: "-- Targeted checks when a full CHECKDB window is tight\nDBCC CHECKALLOC ('IntegrityLab') WITH NO_INFOMSGS;\nGO\nDBCC CHECKTABLE ('dbo.Orders') WITH NO_INFOMSGS;\nGO\nDBCC CHECKCATALOG ('IntegrityLab') WITH NO_INFOMSGS;\nGO\n-- Review errors recorded in the error log\nEXEC sp_readerrorlog 0, 1, 'error';\nGO" },
      { lang: "sql", body: "-- Restore a single damaged page from a verified backup\nRESTORE DATABASE IntegrityLab\nPAGE = '1:123456'\nFROM DISK = 'D:\\Backups\\IntegrityLab_Clean.bak'\nWITH NORECOVERY;\nGO\n-- Apply the log chain, then recover\nRESTORE LOG IntegrityLab\nFROM DISK = 'D:\\Backups\\IntegrityLab_Log.trn'\nWITH RECOVERY;\nGO\n-- Confirm the database is clean after repair\nDBCC CHECKDB ('IntegrityLab') WITH NO_INFOMSGS;\nGO" }
    ],
    tables: [
      ["Condition", "Meaning", "First action", "824 / 825", "I/O or consistency error", "Check storage, run CHECKDB", "SUSPECT", "Recovery failed at startup", "Check log; avoid emergency repair first", "RECOVERY_PENDING", "Recovery cannot start", "Check log access and space"],
      ["Repair option", "Risk", "When", "REPAIR_FAST", "Low", "Minor non-data issues", "REPAIR_REBUILD", "Medium", "Rebuild indexes", "REPAIR_ALLOW_DATA_LOSS", "High", "Absolute last resort only"]
    ],
    diagram: { label: "Corruption response flow", caption: "Detect with checksums and CHECKDB, preserve evidence, restore damaged pages, verify clean.", nodes: ["Detect error / checksum", "Run DBCC CHECKDB", "Identify damaged page", "Page restore + log replay", "Re-run CHECKDB to confirm"] },
    steps: [
      "Set PAGE_VERIFY to CHECKSUM on IntegrityLab and confirm with sys.databases.",
      "Take a full compressed backup with CHECKSUM and record its path — this is your clean restore source.",
      "Run DBCC CHECKDB with ALL_ERRORMSGS and record the output, especially the recommended repair level.",
      "Run CHECKALLOC, CHECKTABLE and CHECKCATALOG to see the targeted alternatives.",
      "Read the three repair options and explain to a colleague why REPAIR_ALLOW_DATA_LOSS is last-resort.",
      "Identify a page number from a (simulated) error and prepare a page restore command with the correct file:page syntax.",
      "Perform the page restore WITH NORECOVERY, then apply the log chain WITH RECOVERY.",
      "Run DBCC CHECKDB again and confirm the clean result.",
      "Review the SQL Server error log for any 824 or 825 messages and note what they would mean.",
      "Write a short corruption runbook: detect, preserve files, restore, verify, replace failing hardware."
    ],
    scenario: ["Error 824 at 3 a.m. and the page-level save", "The error log showed error 824 on page 1:123456 during an index scan. Rather than run a destructive repair, the DBA confirmed checksums were enabled, restored just that page from a recent verified backup, applied the log chain and ran CHECKDB again — clean. The storage team then replaced a failing disk that had caused the damage. In another case a database came up SUSPECT after an unclean shutdown; the DBA resisted the tempting emergency rebuild, restored from a good backup instead, and avoided far greater data loss."],
    interview: [
      ["What is the difference between logical and physical corruption?", "Physical corruption is damaged page bytes or I/O errors detected by checksums; logical corruption is structurally consistent but wrong data or metadata, found by CHECKDB's logical checks."],
      ["Why is REPAIR_ALLOW_DATA_LOSS a last resort?", "Because it can delete damaged rows or pages to make the structure consistent — it prioritises structure over data, so it follows only a verified backup, business approval and evidence of the root cause."],
      ["When would you use a page-level restore?", "When a small number of pages are damaged, you are in FULL recovery with a verified backup and intact log chain; it restores only the bad pages, avoiding a full-database restore and its downtime."]
    ],
    takeaways: [
      "Enable page checksums — they catch silent disk corruption on read",
      "DBCC CHECKDB is the definitive integrity check; schedule it and run it after restores",
      "REPAIR_ALLOW_DATA_LOSS can delete data — exhaust restore options first",
      "Page-level restore minimises downtime when the log chain is intact",
      "Preserve evidence and find the root cause, usually storage hardware"
    ]
  },

  "practical-10": {
    lead: "A hands-on automation lab: use PowerShell and the SqlServer module to build multi-server health, backup and service reports, add error handling and splatting, and deliver the result by email.",
    objectives: [
      "Query SQL Server from PowerShell with Invoke-Sqlcmd",
      "Use the pipeline and splatting for readable scripts",
      "Add try/catch and -ErrorAction Stop",
      "Build a multi-server backup and service report",
      "Send an actionable email summary"
    ],
    paras: [
      "This lab turns repetitive checks into a script you can schedule. You will query several instances from PowerShell, collect results as objects, and email a concise report with exceptions highlighted.",
      "Use a local instance (or several lab instances) and the SqlServer PowerShell module. Run scripts read-only first — automation that changes state should be an explicit, tested choice, never the default.",
      "PowerShell passes objects down the pipeline, not text, which makes filtering and formatting reliable. Cmdlets do the work; functions and loops let you scale a check from one server to many.",
      "The flow below is the automation pattern to reuse: gather targets, query each one, collect typed results, format a report, then deliver it and fail loudly on errors.",
      "Start with a single Invoke-Sqlcmd call using splatting — a hashtable of parameters passed with @params — which keeps long commands readable and avoids fragile line continuations.",
      "Wrap each server query in try/catch with -ErrorAction Stop so an unreachable instance produces a clear exception rather than a silent blank row. Record the failure in the report.",
      "Scale to a list of servers with foreach, and use Select-Object and calculated properties to add the server name and format numbers. Export with Export-Csv or ConvertTo-Html.",
      "Finally, email the summary through Database Mail (sp_send_dbmail) or an SMTP cmdlet. A report nobody reads has little value — make it short, highlight exceptions, and send it on a schedule."
    ],
    code: [
      { lang: "powershell", body: "Import-Module SqlServer\n$params = @{\n  ServerInstance = 'localhost'\n  Query          = 'SELECT name, state_desc FROM sys.databases'\n}\nInvoke-Sqlcmd @params |\n  Select-Object name, state_desc |\n  Format-Table -AutoSize" },
      { lang: "powershell", body: "$servers = @('SQL01','SQL02','SQL03')\nforeach ($s in $servers) {\n  try {\n    $q = \"SELECT @@SERVERNAME AS srv, name, state_desc FROM sys.databases\"\n    Invoke-Sqlcmd -ServerInstance $s -Query $q -ErrorAction Stop |\n      Select-Object @{n='Server';e={$_.srv}}, name, state_desc\n  } catch {\n    [pscustomobject]@{ Server=$s; name='UNREACHABLE'; state_desc=$_.Exception.Message }\n  }\n}" },
      { lang: "powershell", body: "$summary = foreach ($s in $servers) {\n  $q = @\"\nSELECT d.name AS db,\n       max(b.backup_finish_date) AS last_backup\nFROM sys.databases d\nLEFT JOIN msdb.dbo.backupset b ON b.database_name=d.name\nGROUP BY d.name\n\"@\n  Invoke-Sqlcmd -ServerInstance $s -Query $q -ErrorAction Stop |\n    Select-Object @{n='Server';e={$s}}, db, last_backup\n}\n$summary | Export-Csv -Path .\\backup_report.csv -NoTypeInformation" }
    ],
    tables: [
      ["Concept", "Purpose", "Example", "Cmdlet", "Single action", "Get-Service", "Pipeline", "Chain objects", "Where-Object", "Splatting", "Pass a parameter hashtable", "@params"],
      ["Report", "Data source", "Cadence", "Backup status", "msdb backupset", "Daily", "Disk space", "dm_os_volume_stats", "Daily", "Job failures", "sysjobhistory", "Daily"]
    ],
    diagram: { label: "PowerShell automation flow", caption: "Gather targets, query each with error handling, collect objects, then format and deliver.", nodes: ["Server list", "Invoke-Sqlcmd with splatting", "try/catch per server", "Collect and format objects", "Email / export report"] },
    steps: [
      "Install or confirm the SqlServer PowerShell module (Install-Module SqlServer) and import it.",
      "Run a single Invoke-Sqlcmd query using splatting and confirm the output.",
      "Wrap the query in try/catch with -ErrorAction Stop and test it against an invalid server name to see clean error handling.",
      "Create a $servers array and loop over it, adding the server name to each result with a calculated property.",
      "Replace hard-coded parameters with @params splatting and confirm the script still works.",
      "Build a backup-status report across all servers from msdb.dbo.backupset.",
      "Export the results with Export-Csv and inspect the file.",
      "Convert the report to HTML with ConvertTo-Html and highlight rows with stale backups.",
      "Send the summary with sp_send_dbmail through Database Mail (or an SMTP cmdlet) and verify delivery.",
      "Schedule the script with SQL Agent or Task Scheduler and document where its output goes."
    ],
    scenario: ["The script that ran against production", "A health-check script copied from a lab was run against production with a cleanup switch still enabled and deleted old backup files. Recovery came from the script's dry-run output and a restored retention policy. The lesson: default to read-only, make destructive actions explicit switches, test on non-production, and use try/catch so failures are loud. Automation multiplies both good practice and mistakes — choose carefully."],
    interview: [
      ["What is splatting in PowerShell?", "Passing a hashtable of parameters to a cmdlet with @params instead of a long positional command line — it improves readability and avoids fragile backtick line continuations."],
      ["How would you build a multi-server backup status report?", "Loop over the server list (optionally in parallel), use Invoke-Sqlcmd against msdb to get the last backup per database, collect results as objects, and export or email a formatted summary while failing loudly on unreachable servers."],
      ["What makes a DBA script safe for production?", "Testing on non-production, defaulting to read-only, explicit destructive switches, try/catch with -ErrorAction Stop, clear logging, and idempotent behaviour that checks state before changing it."]
    ],
    takeaways: [
      "Objects in the pipeline make PowerShell reports reliable and composable",
      "Splatting keeps long commands readable and avoids fragile continuations",
      "try/catch with -ErrorAction Stop makes failures loud, not silent",
      "Default automation to read-only; make destructive actions explicit",
      "A concise, scheduled, emailed report turns checks into repeatable evidence"
    ]
  }
};
