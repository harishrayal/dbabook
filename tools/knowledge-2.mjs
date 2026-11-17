/* Domain knowledge base, part 2 (ch06-ch10). */

export const K2 = {
  ch06: {
    theme: "database storage and file management",
    vocab: ["Filegroup", "Data file", "Log file", "Autogrowth", "TempDB", "Volume"],
    paras: [
      "A database has logical files (data and log) mapped to physical files on disk. Data files (MDF primary, NDF secondary) are grouped into filegroups; the log file (LDF) is separate and managed independently.",
      "The PRIMARY filegroup holds system objects and is the default home for user objects. Additional user-defined filegroups let a DBA place large tables or indexes on specific volumes for performance or administration.",
      "Autogrowth is a safety net, not a sizing strategy. Fixed-size growth (for example 512 MB) is predictable; percentage growth becomes increasingly large and wasteful as a file grows. Pre-size files and cap growth deliberately.",
      "Data file growth and log file growth behave differently. Data can spread across many files in a filegroup; the log is effectively sequential and can only grow by adding VLFs, so uncontrolled growth harms recovery.",
      "File relocation is a catalogue operation followed by a physical move: ALTER DATABASE ... MODIFY FILE updates the path, then the database is taken offline while the file is moved on disk and brought back online.",
      "Shrinking a file returns space to the OS but causes fragmentation and can trigger immediate regrowth. It is appropriate after a one-off large deletion or before a migration, never as a recurring maintenance task.",
      "TempDB is a shared workspace for sorts, hash joins, temporary objects and version store. It is recreated at startup, so it cannot be backed up, and it is a frequent source of contention when misconfigured.",
      "For TempDB best practice: multiple equally sized data files (one per CPU core up to around eight) on fast storage, pre-sized to avoid growth, with trace flag 1118 semantics standard on modern versions."
    ],
    code: [
      { lang: "sql", body: "ALTER DATABASE SalesDB\nADD FILEGROUP FG_Archive;\nGO\nALTER DATABASE SalesDB\nADD FILE (\n  NAME = SalesDB_Archive,\n  FILENAME = 'E:\\Data\\SalesDB_Archive.ndf',\n  SIZE = 2GB, FILEGROWTH = 512MB\n) TO FILEGROUP FG_Archive;" },
      { lang: "sql", body: "SELECT name, physical_name, type_desc,\n       size / 128 AS size_mb,\n       growth, is_percent_growth\nFROM   sys.database_files;" },
      { lang: "sql", body: "-- TempDB file count and size\nSELECT name, size / 128 AS size_mb, growth\nFROM   tempdb.sys.database_files\nORDER BY type_desc, name;" }
    ],
    tables: [
      ["File type", "Extension", "Role", "Primary data", "MDF", "System objects, boot information", "Secondary data", "NDF", "User objects across filegroups", "Log", "LDF", "Transaction log, recovery"],
      ["Growth setting", "Behaviour", "Recommendation", "Fixed MB", "Adds a constant amount", "Preferred — predictable", "Percentage", "Adds a growing amount", "Avoid on large files", "Autogrowth off", "Fails when full", "Only with monitoring"]
    ],
    scenarios: [
      ["Autogrowth thrash during a bulk load", "A nightly import grew a data file in 1 MB increments hundreds of times, each growth stalling the load and fragmenting the file. Pre-sizing the file to the expected post-load size and setting 512 MB fixed growth removed the stalls. Autogrowth is a safety net that should rarely fire in normal operation."],
      ["TempDB contention at month end", "Month-end reporting drove heavy sort and hash activity and latency on a single TempDB data file, with PAGELATCH waits on allocation pages. Adding three equally sized TempDB files and enabling trace flags removed the contention. TempDB configuration is a first-line performance lever."]
    ],
    interviews: [
      ["Why is percentage autogrowth discouraged?", "Because the increment grows with the file, causing increasingly large and unpredictable growth events with long stalls; fixed-size growth is predictable and easier to capacity plan."],
      ["Can you back up TempDB?", "No. TempDB is recreated on every SQL Server start, so it cannot be backed up or restored; the focus is correct configuration and fast storage."],
      ["What is the correct way to move a data file?", "Use ALTER DATABASE ... MODIFY FILE to change the catalogued path, take the database offline, physically move the file, then bring it back online — never rename or move a live file in the OS."]
    ]
  },
  ch07: {
    theme: "backup and recovery strategy",
    vocab: ["Full backup", "Differential", "Log backup", "Recovery model", "Retention", "RPO"],
    paras: [
      "Backups are the only true protection against data loss. A backup strategy must be derived from business requirements — how much data can be lost (RPO) and how quickly the system must return (RTO) — not chosen arbitrarily.",
      "A full backup captures the whole database at a point in time and forms the base of a restore sequence. A differential backup captures only changes since the last full backup, so restore needs the base full plus the latest differential.",
      "Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models. Together, full + differential + log backups form a chain.",
      "Recovery models control log behaviour. SIMPLE truncates the log automatically and cannot do log backups. FULL retains log records until backed up. BULK_LOGGED minimally logs certain bulk operations at the cost of point-in-time precision within those operations.",
      "Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain. They are ideal for one-off copies and tests.",
      "Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest. RESTORE VERIFYONLY checks readability but does not confirm the database can actually be recovered — only a real restore does.",
      "Retention and off-site copies follow the 3-2-1 rule: three copies, two different media, one off-site. Modern variants add an immutable/offline copy and a zero-error objective tested by automation.",
      "The most common backup failures are silent: a job that succeeds but writes to a full disk, a broken log chain after a recovery-model change, or media that has never been restored. Monitoring and regular restore tests are mandatory."
    ],
    code: [
      { lang: "sql", body: "BACKUP DATABASE SalesDB\nTO DISK = 'D:\\Backups\\SalesDB_Full.bak'\nWITH COMPRESSION, CHECKSUM, INIT, STATS = 10;" },
      { lang: "sql", body: "BACKUP LOG SalesDB\nTO DISK = 'D:\\Backups\\SalesDB_Log.trn'\nWITH COMPRESSION, CHECKSUM, STATS = 10;" },
      { lang: "sql", body: "SELECT d.name AS db, d.recovery_model_desc,\n       max(b.backup_finish_date) AS last_backup,\n       max(CASE WHEN b.type='L' THEN b.backup_finish_date END) AS last_log\nFROM sys.databases d\nLEFT JOIN msdb.dbo.backupset b ON b.database_name=d.name\nGROUP BY d.name, d.recovery_model_desc\nORDER BY d.name;" }
    ],
    tables: [
      ["Backup type", "Contains", "Restore needs", "Full", "Entire database", "The full backup", "Differential", "Changes since last full", "Base full + latest diff", "Log", "Log records since last log backup", "Full (+diff) + log chain"],
      ["Recovery model", "Log backups", "Point-in-time", "SIMPLE", "Not supported", "No", "FULL", "Required", "Yes", "BULK_LOGGED", "Supported", "Limited during bulk ops"]
    ],
    scenarios: [
      ["The log chain broken by a model change", "An engineer switched a database from FULL to SIMPLE and back to FULL to 'clear' a growing log, then never took another full backup. Log backups began failing with a chain error and RPO was silently unbounded. The prevention: change recovery model deliberately, immediately take a full backup, and alert on log backup failures."],
      ["Backups succeeded, disk was full", "Backup jobs reported success for days while writing to a share that had run out of space — the files were stale. A restore test would have caught it. The DBA added free-space monitoring on the backup target and a job that verifies recent backup file timestamps."]
    ],
    interviews: [
      ["How do RPO and RTO shape a backup strategy?", "RPO sets how often you must back up (maximum acceptable data loss) and RTO sets how fast you must restore; together they determine backup frequency, type, storage tier and whether log shipping or HA is needed."],
      ["What breaks the transaction log backup chain?", "Switching recovery model, restoring with RECOVERY, or taking a non-copy-only full backup outside the normal plan can reset the differential base or log chain; always take a full backup after such changes."],
      ["Does RESTORE VERIFYONLY prove a backup is good?", "No — it checks the backup set is readable and checksums pass, but it does not replay the log or open the database. Only performing a real restore on another instance proves recoverability."]
    ]
  },
  ch08: {
    theme: "restore and disaster recovery",
    vocab: ["Restore", "NORECOVERY", "STOPAT", "MOVE", "Orphaned user", "Standby"],
    paras: [
      "Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment. Each step must be ordered correctly.",
      "NORECOVERY leaves the database restoring so further backups can be applied. RECOVERY completes the sequence and makes the database usable. STANDBY leaves it read-only while still allowing further restores, useful for log shipping with query access.",
      "Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change. It requires a full backup, the relevant differentials and an unbroken log chain covering that time.",
      "A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost. If the data files are intact, BACKUP LOG ... WITH NORECOVERY captures the tail and leaves the database restoring.",
      "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths. Logical names come from RESTORE FILELISTONLY; ignoring MOVE overwrites or fails against existing paths.",
      "After a restore, users can be orphaned: a database user's SID no longer matches a server login. Mapping logins to users (with ALTER USER or sp_change_users_login) restores access. Server-level objects such as jobs, linked servers and logins are not part of a database backup and must be scripted separately.",
      "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.",
      "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works."
    ],
    code: [
      { lang: "sql", body: "RESTORE DATABASE SalesDB_Recover\nFROM DISK = 'D:\\Backups\\SalesDB_Full.bak'\nWITH MOVE 'SalesDB_data' TO 'D:\\Data\\SalesDB_Recover.mdf',\n     MOVE 'SalesDB_log'  TO 'L:\\Log\\SalesDB_Recover.ldf',\n     NORECOVERY, REPLACE, STATS = 10;" },
      { lang: "sql", body: "RESTORE LOG SalesDB_Recover\nFROM DISK = 'D:\\Backups\\SalesDB_Log.trn'\nWITH STOPAT = '2026-03-14T09:29:00', RECOVERY, STATS = 10;" },
      { lang: "sql", body: "-- Find orphaned users after a restore\nSELECT dp.name AS user_name, dp.sid\nFROM   sys.database_principals dp\nLEFT JOIN sys.server_principals sp ON sp.sid = dp.sid\nWHERE  dp.type IN ('S','U') AND sp.sid IS NULL\n       AND dp.name NOT IN ('dbo','guest','INFORMATION_SCHEMA','sys');" }
    ],
    tables: [
      ["Option", "Database state", "Use", "NORECOVERY", "Restoring", "More backups to apply", "RECOVERY", "Online", "End of the sequence", "STANDBY", "Read-only / restoring", "Log shipping with reads"],
      ["Standby", "RTO", "Cost", "Cold", "Hours", "Lowest", "Warm", "Tens of minutes", "Medium", "Hot", "Near zero", "Highest"]
    ],
    scenarios: [
      ["The accidental TRUNCATE at 09:31", "A deployment truncated a critical table at 09:31. The DBA restored the last full to a new database with NORECOVERY, applied differentials and logs with STOPAT = 09:30:59, recovered it, and copied the lost rows back. Because the log chain was intact and a tail-log backup was taken first, no committed work was lost."],
      ["Restore succeeded but nobody could log in", "A database was restored to a new server and the application failed to authenticate. The users were orphaned because their SIDs did not match server logins. Mapping each login to its user with ALTER USER ... WITH LOGIN restored access; the runbook now includes an orphan check after every restore."]
    ],
    interviews: [
      ["What is the difference between NORECOVERY and RECOVERY?", "NORECOVERY keeps the database in a restoring state so more backups can be applied; RECOVERY finishes the restore, rolls back uncommitted transactions and brings the database online."],
      ["What is a tail-log backup and when do you take one?", "It captures log records generated after the last scheduled backup, usually before a restore or after a failure, so committed work since the last backup is not lost; take it WITH NORECOVERY if data files are intact."],
      ["Why are logins considered separately from a database restore?", "Logins and other server-level objects live in master and are not part of a user database backup, so their SIDs must be reconciled with database users (the orphaned-user problem) after a restore to another server."]
    ]
  },
  ch09: {
    theme: "SQL Server security and permissions",
    vocab: ["Login", "User", "Role", "Schema", "GRANT", "Audit"],
    paras: [
      "Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do. Confusing the two is the root of most permission problems.",
      "A server login grants access to the instance; a database user maps that login to a database. The mapping is by SID, which is why restores to other servers produce orphaned users. A login and a user are distinct objects at distinct scopes.",
      "Roles simplify permission management. Fixed server roles (sysadmin, serveradmin, securityadmin...) and fixed database roles (db_owner, db_datareader, db_datawriter...) grant predefined sets; user-defined roles let you assemble least-privilege groups for an application.",
      "Schemas are namespaces that group objects and act as a permission boundary. Granting permissions on a schema covers all current and future objects within it, which is more maintainable than granting object by object.",
      "GRANT, DENY and REVOKE form the permission vocabulary. DENY overrides GRANT at every level, so it must be used sparingly — a DENY at a higher scope can silently block access granted lower down.",
      "Least privilege is the governing principle: give each identity only the permissions it needs, for only the scope it needs, and review them regularly. Avoid sysadmin and db_owner for application accounts.",
      "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface. Windows authentication is preferred where available.",
      "SQL Server Audit and failed-login monitoring provide detection and evidence. Access reviews are a recurring operational task, not a one-time project."
    ],
    code: [
      { lang: "sql", body: "CREATE LOGIN AppLogin WITH PASSWORD = 'UseAStrongPassword!42',\n  CHECK_POLICY = ON, CHECK_EXPIRATION = ON;\nGO\nUSE SalesDB;\nCREATE USER AppLogin FOR LOGIN AppLogin;\nALTER ROLE db_datareader ADD MEMBER AppLogin;\nALTER ROLE db_datawriter ADD MEMBER AppLogin;" },
      { lang: "sql", body: "GRANT SELECT ON SCHEMA::dbo TO AppReader;\nDENY DELETE ON SCHEMA::dbo TO AppReader;\nGRANT EXECUTE ON OBJECT::dbo.usp_PlaceOrder TO AppWriter;" },
      { lang: "sql", body: "SELECT dp.name AS db_user, sp.name AS login_name\nFROM   sys.database_principals dp\nLEFT JOIN sys.server_principals sp ON sp.sid = dp.sid\nWHERE  dp.type IN ('S','U');" }
    ],
    tables: [
      ["Object", "Scope", "Purpose", "Login", "Server", "Authenticate to the instance", "User", "Database", "Map a login into a database", "Role", "Server or DB", "Bundle permissions"],
      ["Permission", "Effect", "Precedence", "GRANT", "Allows an action", "Overridden by DENY", "DENY", "Blocks an action", "Overrides GRANT everywhere", "REVOKE", "Removes an explicit grant/deny", "Neutral"]
    ],
    scenarios: [
      ["The DENY that broke reporting at midnight", "A securityadmin placed a DENY SELECT on a schema to block one contractor, not realising the reporting service used a role granted access to the same schema. DENY overrides GRANT, so all reports failed overnight. The fix was to remove the broad DENY and apply a narrow denial to the specific principal instead."],
      ["The sa account under attack", "Failed-login alerts showed thousands of attempts against sa on an internet-reachable server. The DBA disabled sa, enforced Windows authentication, restricted the firewall to the app subnet and enabled audit capture. Monitoring then showed the attempts drop to noise."]
    ],
    interviews: [
      ["What is the difference between a login and a user?", "A login authenticates to the server (server scope); a user is the login's mapped identity inside a database (database scope), linked by SID. Permissions are granted to users at database scope and to logins at server scope."],
      ["What does DENY do in the permission hierarchy?", "DENY overrides GRANT at any scope — a deny on a schema blocks access even if SELECT is granted on a table inside it — so it is powerful and should be used narrowly."],
      ["What is least privilege and why does it matter?", "Granting only the minimum permissions required for the minimum scope and time. It limits the damage from compromised accounts, accidental changes and insider errors, and simplifies audits."]
    ]
  },
  ch10: {
    theme: "SQL Server Agent and automation",
    vocab: ["Job", "Step", "Schedule", "Alert", "Operator", "Proxy"],
    paras: [
      "SQL Server Agent is the scheduling and automation engine. It runs jobs — collections of one or more steps — on schedules, and can raise alerts and notify operators when something fails.",
      "A job step can run T-SQL, PowerShell, SSIS packages or command-line programs. Steps execute in order; the success or failure of each step controls what runs next, which lets you build branching maintenance workflows.",
      "Schedules define when a job runs: once, on a recurring interval, daily, weekly or monthly. Multiple schedules can be attached to one job, and one schedule can drive several jobs.",
      "Job ownership matters: a job runs under the security context of its owner (or a proxy). If the owner is disabled or lacks permissions, the job fails — a common cause of 'the backup job suddenly stopped working'.",
      "Notifications go to operators by email, pager or net send, triggered by alerts or job completion conditions. Database Mail must be configured for email notifications to work.",
      "Alerts respond to SQL Server errors or performance conditions, such as severity 19+ errors or a specific error number, and can execute a job in response — the backbone of proactive monitoring.",
      "Proxies and credentials let a job step run under a different, appropriately privileged account without exposing that account's password, essential for steps that touch the file system or network.",
      "Job history is the diagnostic record. Reviewing failed steps and their messages is a daily DBA task; automating the review with a query over msdb makes it reliable."
    ],
    code: [
      { lang: "sql", body: "-- Recent failed jobs\nSELECT j.name AS job_name, h.step_name,\n       h.run_date, h.run_time, h.message\nFROM   msdb.dbo.sysjobs j\nJOIN   msdb.dbo.sysjobhistory h ON j.job_id = h.job_id\nWHERE  h.run_status = 0\nORDER BY h.run_date DESC, h.run_time DESC;" },
      { lang: "sql", body: "-- Is Agent running and how is it configured?\nSELECT servicename, status_desc, startup_type_desc\nFROM   sys.dm_server_services\nWHERE  servicename LIKE '%Agent%';" },
      { lang: "sql", body: "-- Job schedule list\nSELECT j.name AS job, s.name AS schedule,\n       s.enabled\nFROM   msdb.dbo.sysjobs j\nJOIN   msdb.dbo.sysjobschedules js ON j.job_id=js.job_id\nJOIN   msdb.dbo.sysschedules s ON js.schedule_id=s.schedule_id\nORDER BY j.name;" }
    ],
    tables: [
      ["Concept", "Meaning", "Failure symptom", "Job", "Unit of automated work", "Job never runs", "Step", "Individual task in a job", "Partial completion", "Schedule", "When a job runs", "Missed window"],
      ["Notification", "Trigger", "Prerequisite", "Operator", "Named recipient", "Database Mail configured", "Alert", "Error or condition", "Enabled alert", "Job outcome", "Success/failure of a job", "Notification set on job"]
    ],
    scenarios: [
      ["Backups silently stopped for a week", "A job owner's account was disabled during a security cleanup, so the nightly backup job failed silently with no operator notified. The DBA reassigned ownership to a dedicated service account, configured failure notifications and added a daily check of the last successful backup date. Ownership and alerting are as important as the job definition."],
      ["The maintenance job that locked a table at 2 a.m.", "An index rebuild step ran longer than its window and blocked the batch posting process, causing morning delays. The DBA added a time limit, used REORGANIZE for lightly fragmented indexes and moved the heavy rebuild to a dedicated weekend window. Automation still needs impact analysis."]
    ],
    interviews: [
      ["Why can a perfectly defined job suddenly stop running?", "Common causes include a disabled or deleted owner, a stopped Agent service, a disabled schedule, or missing permissions for a step — all reasons to check owner, service and history, not just the job definition."],
      ["What is the purpose of a proxy in SQL Server Agent?", "A proxy maps a job step to a credential so the step can run under a different, appropriately privileged Windows account without exposing its password, used for file system or network access."],
      ["How would you audit job failures proactively?", "Query msdb.dbo.sysjobhistory for run_status = 0 and alert on results, or configure Agent alerts/operators and Database Mail so failures notify someone immediately."]
    ]
  }
};
