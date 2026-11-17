/* Practical knowledge: practical-02 .. practical-04. */

export const P1 = {
  "practical-02": {
    lead: "A hands-on lab in database storage: create a database with explicit MDF, NDF and LDF files, build filegroups, configure autogrowth, move files safely and monitor file sizes with catalog views.",
    objectives: [
      "Create a database with deliberately sized data and log files",
      "Add filegroups and secondary data files",
      "Configure sensible fixed autogrowth",
      "Move a data file using the catalogue-then-filesystem sequence",
      "Monitor file size and free space with DMVs"
    ],
    paras: [
      "This lab explores physical storage. You will create a scratch database with explicit file definitions so you can see exactly where SQL Server puts bytes on disk, then change that layout and verify the result.",
      "Use a local Developer or Express instance. Never run storage experiments against a production database — file moves require taking the database offline, which is an outage.",
      "A database maps logical files to physical files. The primary data file (MDF) holds system objects; secondary data files (NDF) extend filegroups; the log file (LDF) is a separate sequential structure. Understanding the mapping is the whole point of this lab.",
      "Follow the flow below: a database owns filegroups, filegroups own data files, and those files are divided into 8 KB pages. The log sits alongside, managed independently.",
      "Start by creating a database with one primary data file, one secondary file in a custom filegroup, and a log file — all pre-sized so autogrowth does not fire during the lab.",
      "Notice the autogrowth settings. Fixed growth in megabytes is predictable; percentage growth becomes unpredictable on large files. Set growth deliberately, then confirm with sys.database_files.",
      "Verification is everything in storage work. Query the catalogue for logical names, physical paths, sizes and growth, and query dm_os_volume_stats for free space on the underlying volumes.",
      "The classic storage mistake is moving a live file in Windows Explorer. SQL Server tracks paths in its catalogue; changing the path on disk without updating the catalogue leaves the database unable to open its files after a restart."
    ],
    code: [
      { lang: "sql", body: "CREATE DATABASE StorageLab\nON PRIMARY\n(\n  NAME = StorageLab_Primary,\n  FILENAME = 'D:\\Data\\StorageLab.mdf',\n  SIZE = 64MB, MAXSIZE = 2GB, FILEGROWTH = 64MB\n),\nFILEGROUP FG_Archive\n(\n  NAME = StorageLab_Archive,\n  FILENAME = 'E:\\Data\\StorageLab_Archive.ndf',\n  SIZE = 64MB, MAXSIZE = 2GB, FILEGROWTH = 64MB\n)\nLOG ON\n(\n  NAME = StorageLab_Log,\n  FILENAME = 'L:\\Log\\StorageLab.ldf',\n  SIZE = 64MB, MAXSIZE = 1GB, FILEGROWTH = 64MB\n);\nGO" },
      { lang: "sql", body: "USE StorageLab;\nGO\n-- Add another file to the filegroup\nALTER DATABASE StorageLab\nADD FILE\n(\n  NAME = StorageLab_Archive2,\n  FILENAME = 'E:\\Data\\StorageLab_Archive2.ndf',\n  SIZE = 128MB, FILEGROWTH = 128MB\n) TO FILEGROUP FG_Archive;\nGO\n-- Change growth from percentage-style to fixed MB\nALTER DATABASE StorageLab\nMODIFY FILE\n( NAME = StorageLab_Primary, FILEGROWTH = 128MB );\nGO" },
      { lang: "sql", body: "SELECT name AS logical_name,\n       physical_name,\n       type_desc,\n       size / 128 AS size_mb,\n       growth,\n       is_percent_growth\nFROM   sys.database_files\nORDER BY type_desc, name;\nGO\n-- Free space on each volume holding a database file\nSELECT DISTINCT vs.volume_mount_point,\n       vs.total_bytes / 1073741824 AS total_gb,\n       vs.available_bytes / 1073741824 AS free_gb\nFROM sys.database_files f\nCROSS APPLY sys.dm_os_volume_stats(DB_ID(), f.file_id) vs;" }
    ],
    tables: [
      ["Concept", "Catalogue source", "What you learn", "MDF", "sys.database_files", "Primary data file", "NDF", "sys.filegroups", "Secondary data file", "LDF", "type_desc = LOG", "Transaction log", "Autogrowth", "growth / is_percent_growth", "Growth behaviour"],
      ["Mistake", "Consequence", "Safe approach", "Percentage growth", "Unpredictable large growths", "Use fixed MB", "Move file on disk first", "Catalogue points at old path", "MODIFY FILE, then move", "Shrink as routine", "Fragmentation, regrowth", "Only after large deletions", "Unsized log", "VLF explosion", "Pre-size in large increments"]
    ],
    diagram: { label: "Database storage hierarchy", caption: "From database to filegroup to file to 8 KB page — the log is managed separately.", nodes: ["Database (StorageLab)", "Filegroup (PRIMARY / FG_Archive)", "Physical files (MDF, NDF, LDF)", "Extents (8 pages = 64 KB)", "Data pages (8 KB)"] },
    steps: [
      "Create the folders D:\\Data, E:\\Data and L:\\Log on your local instance before running the CREATE DATABASE script.",
      "Run the setup script to create StorageLab with a primary file, an FG_Archive file and a log file.",
      "Query sys.database_files and sys.filegroups — record logical names, physical paths, sizes and growth settings.",
      "Add StorageLab_Archive2 to FG_Archive with 128 MB initial size and 128 MB fixed growth.",
      "Change the primary file's growth to a fixed 128 MB and confirm is_percent_growth is 0.",
      "Create a table on FG_Archive and insert enough rows to see the file grow; observe growth events via the default trace if available.",
      "Move a data file correctly: ALTER DATABASE ... MODIFY FILE with the new path, take the database OFFLINE, copy the file on disk, then ONLINE.",
      "Confirm the moved path in sys.database_files and that the database is ONLINE and accessible.",
      "Use dm_os_volume_stats to report free space on every volume that holds a database file.",
      "Drop StorageLab at the end and delete the scratch folders, leaving the instance clean."
    ],
    scenario: ["The file moved in Explorer that broke a restart", "An engineer freed space by moving a live MDF file in Windows Explorer without telling SQL Server. Everything worked until the next patch reboot, when the engine could not find its file at the catalogued path and the database stayed OFFLINE. The fix was to update the catalogue with ALTER DATABASE ... MODIFY FILE, then move the file and bring the database back online. The root cause was treating physical files as ordinary documents instead of catalogue-managed resources."],
    interview: [
      ["What is the difference between a logical and a physical file name?", "The logical name is the internal identifier used in ALTER DATABASE statements (for example StorageLab_Primary); the physical name is the operating-system path (D:\\Data\\StorageLab.mdf). SQL Server maps one to the other in the catalogue."],
      ["Why is fixed autogrowth preferred over percentage growth?", "Fixed MB growth is predictable and easy to capacity-plan; percentage growth increases with file size, producing ever-larger growth events that stall workloads and waste space."],
      ["What is the correct sequence to move a data file?", "Run ALTER DATABASE ... MODIFY FILE to set the new path in the catalogue, take the database offline, physically move or copy the file, then bring the database online and verify sys.database_files."]
    ],
    takeaways: [
      "A database maps logical files to physical paths through the catalogue",
      "Pre-size files and use fixed autogrowth to avoid surprises",
      "Data files and the log grow differently — plan each independently",
      "Always move files catalogue-first, never in Explorer alone",
      "Verify layout and free space with sys.database_files and dm_os_volume_stats"
    ]
  },

  "practical-03": {
    lead: "A hands-on backup and recovery lab: take full, differential and log backups, break and repair the log chain, and perform a point-in-time recovery of accidentally deleted data.",
    objectives: [
      "Take compressed, checksummed full backups",
      "Create differential and transaction log backups",
      "Understand what breaks the log chain",
      "Restore to a point in time with STOPAT",
      "Prove recoverability with a real restore, not VERIFYONLY"
    ],
    paras: [
      "This lab turns backup theory into muscle memory. You will build a full plus log backup chain, deliberately delete data, then recover it to a moment just before the mistake.",
      "Use a scratch database on a local instance. The backup paths must exist and the SQL Server service account needs write permission on them — permission errors are a common lab failure.",
      "Recovery model controls the chain. In FULL, log records are retained until backed up, enabling point-in-time restore. In SIMPLE, log backups are not possible. Confirm the model before you start.",
      "The chain below is the sequence you will build and then restore: a full backup establishes the base, a differential narrows replay, and log backups carry you to the target moment.",
      "Take a full backup with COMPRESSION and CHECKSUM. Then make some data changes, take a differential, make more changes and take log backups at each stage. Note the timestamps — you will need one for the restore.",
      "Test both sides of the differential behaviour: a second differential should be larger than the first because it contains all changes since the last full, not just since the last differential.",
      "For the restore, use a new database name with MOVE so you do not overwrite the source. Apply the full with NORECOVERY, the differential with NORECOVERY, then logs with STOPAT and RECOVERY.",
      "A common trap is believing RESTORE VERIFYONLY proves recoverability. It only checks readability and checksums; only a real restore proves the data can actually be brought online."
    ],
    code: [
      { lang: "sql", body: "ALTER DATABASE BackupLab SET RECOVERY FULL;\nGO\nBACKUP DATABASE BackupLab\nTO DISK = 'D:\\Backups\\BackupLab_Full.bak'\nWITH COMPRESSION, CHECKSUM, INIT, STATS = 10;\nGO\n-- Make a change, then a differential\nBACKUP DATABASE BackupLab\nTO DISK = 'D:\\Backups\\BackupLab_Diff.bak'\nWITH COMPRESSION, CHECKSUM, DIFFERENTIAL, INIT, STATS = 10;\nGO\nBACKUP LOG BackupLab\nTO DISK = 'D:\\Backups\\BackupLab_1.trn'\nWITH COMPRESSION, CHECKSUM, STATS = 10;\nGO" },
      { lang: "sql", body: "-- Review the backup chain\nSELECT database_name, type, backup_start_date,\n       backup_finish_date, compressed_backup_size\nFROM   msdb.dbo.backupset\nWHERE  database_name = 'BackupLab'\nORDER BY backup_finish_date;\nGO\n-- D = full, I = differential, L = log" },
      { lang: "sql", body: "RESTORE DATABASE BackupLab_Recover\nFROM DISK = 'D:\\Backups\\BackupLab_Full.bak'\nWITH MOVE 'BackupLab'      TO 'D:\\Data\\BackupLab_Recover.mdf',\n     MOVE 'BackupLab_log'  TO 'L:\\Log\\BackupLab_Recover.ldf',\n     NORECOVERY, REPLACE, STATS = 10;\nGO\nRESTORE DATABASE BackupLab_Recover\nFROM DISK = 'D:\\Backups\\BackupLab_Diff.bak'\nWITH NORECOVERY, STATS = 10;\nGO\nRESTORE LOG BackupLab_Recover\nFROM DISK = 'D:\\Backups\\BackupLab_1.trn'\nWITH STOPAT = '2026-03-14T09:29:59', RECOVERY, STATS = 10;\nGO" }
    ],
    tables: [
      ["Backup type", "Contains", "Restore needs", "Full", "Entire database at a point", "Just the full", "Differential", "Changes since last full", "Base full + latest diff", "Log", "Log records since last log backup", "Full + diff + log chain"],
      ["Pitfall", "Effect", "Prevention", "SIMPLE model", "No log backups / no PITR", "Set FULL for critical DBs", "Recovery model flip", "Breaks the log chain", "Take a full immediately after", "VERIFYONLY only", "Does not prove recoverability", "Perform real restores", "Full backup disk", "Silent stale backups", "Monitor file timestamps"]
    ],
    diagram: { label: "Backup and restore chain", caption: "A full base, a differential and an unbroken log chain combine to reach a point in time.", nodes: ["Full backup (base)", "Differential (changes since full)", "Log backup 1", "Log backup 2", "STOPAT -> recovered database"] },
    steps: [
      "Create BackupLab with a simple table and insert 10 rows containing a timestamp column.",
      "Set the recovery model to FULL and take an initial compressed full backup with CHECKSUM.",
      "Insert 10 more rows, then take a differential backup; record its size.",
      "Insert another 10 rows and take a second differential — confirm it is larger than the first because it is cumulative since the full.",
      "Take a transaction log backup; record the exact time just before a deliberate DELETE.",
      "Run a DELETE that removes a known set of rows — this is the 'accident' you will recover from.",
      "Take another log backup covering the time after the delete.",
      "Query msdb.dbo.backupset to confirm you have a full, differentials and logs in order.",
      "Restore to a new database using MOVE, applying full (NORECOVERY), differential (NORECOVERY), then logs with STOPAT set just before the delete and final RECOVERY.",
      "Verify the recovered table contains the deleted rows and that the source database is untouched."
    ],
    scenario: ["The TRUNCATE at 09:31 and the STOPAT at 09:30:59", "A deployment script accidentally truncated a critical lookup table at 09:31. Because the database was in FULL recovery with an unbroken log chain, the DBA restored the last full to a new database with NORECOVERY, applied the latest differential, then applied logs with STOPAT = '09:30:59'. The recovered table was copied back into production with zero loss of committed work. Had the log chain been broken by a recovery-model change the previous week, the only option would have been the last full backup — and hours of data loss."],
    interview: [
      ["How do RPO and RTO determine a backup strategy?", "RPO sets the maximum acceptable data loss and therefore the backup frequency (including log backups); RTO sets how fast recovery must be, influencing backup type, storage tier and whether high availability is needed."],
      ["What breaks the transaction log backup chain?", "Switching recovery model, restoring with RECOVERY, or taking a non-copy-only full backup can reset the differential base or log chain. After such a change, take a full backup immediately and alert on log backup failures."],
      ["Why must you perform real restore tests?", "RESTORE VERIFYONLY checks readability and checksums but does not replay logs or open the database. Only a real restore proves the chain is complete and the recovery objectives can be met."]
    ],
    takeaways: [
      "A restore plan needs a full base plus an unbroken log chain for point-in-time recovery",
      "Differentials are cumulative since the last full, not the last differential",
      "Use MOVE and a new database name when restoring for a test",
      "STOPAT targets a precise moment just before the mistake",
      "Only a real restore proves recoverability — VERIFYONLY is not enough"
    ]
  },

  "practical-04": {
    lead: "A hands-on security lab: create logins and users, assign roles and schema permissions, observe GRANT/DENY/REVOKE precedence, and repair orphaned users after a restore.",
    objectives: [
      "Create and configure a SQL login with a strong password policy",
      "Map a login to a database user",
      "Use fixed and custom roles for least privilege",
      "Demonstrate DENY overriding GRANT",
      "Detect and fix orphaned users"
    ],
    paras: [
      "This lab makes the login/user distinction concrete. You will create identities at both scopes, grant permissions and then connect as those identities to see the effect first-hand.",
      "Work on a scratch database. Create a dedicated test login rather than reusing your admin account — the point is to observe exactly what a low-privilege identity can and cannot do.",
      "Authentication establishes who you are; authorisation decides what you may do. A login authenticates to the server, a user maps that login into a database, and permissions are granted to the user at database scope.",
      "The sequence below mirrors a real onboarding: create login, create user, add to a role, grant schema permissions, then connect and test.",
      "Use roles instead of granting to individuals. Fixed database roles such as db_datareader are convenient; custom roles let you assemble a precise least-privilege bundle for an application.",
      "DENY overrides GRANT at every scope. You will see this directly: grant SELECT on a schema, then DENY on a table, and confirm the user cannot read that table even though the schema is granted.",
      "Orphaned users appear when a database is restored to another server and the user's SID no longer matches any login. Query the catalogues to find them and remap with ALTER USER.",
      "Least privilege is the goal throughout: give each identity only what it needs, avoid sysadmin and db_owner, and review permissions as a recurring task, not a one-off."
    ],
    code: [
      { lang: "sql", body: "CREATE LOGIN LabAppLogin\nWITH PASSWORD = 'Str0ng!Password#2026',\n     CHECK_POLICY = ON, CHECK_EXPIRATION = ON;\nGO\nCREATE LOGIN LabReportLogin\nWITH PASSWORD = 'An0ther!Strong#2026',\n     CHECK_POLICY = ON;\nGO\nSELECT name, type_desc, is_disabled\nFROM   sys.server_principals\nWHERE  name LIKE 'Lab%';\nGO" },
      { lang: "sql", body: "USE SecurityLab;\nGO\nCREATE USER LabAppLogin FOR LOGIN LabAppLogin;\nCREATE USER LabReportLogin FOR LOGIN LabReportLogin;\nGO\nCREATE ROLE AppReaders;\nGO\nALTER ROLE AppReaders ADD MEMBER LabReportLogin;\nGRANT SELECT ON SCHEMA::dbo TO AppReaders;\nGRANT EXECUTE ON SCHEMA::dbo TO LabAppLogin;\nGO\n-- DENY demonstrates precedence\nDENY DELETE ON SCHEMA::dbo TO LabReportLogin;\nGO" },
      { lang: "sql", body: "-- Find orphaned users (SID with no matching login)\nSELECT dp.name AS db_user, dp.sid\nFROM   sys.database_principals dp\nLEFT JOIN sys.server_principals sp ON sp.sid = dp.sid\nWHERE  dp.type = 'S'\n  AND  sp.sid IS NULL\n  AND  dp.name NOT IN ('dbo','guest','INFORMATION_SCHEMA','sys');\nGO\n-- Remap an orphaned user to its login\nALTER USER LabReportLogin WITH LOGIN = LabReportLogin;\nGO\n-- Effective permissions for a principal\nSELECT permission_name, state_desc\nFROM   sys.fn_my_permissions(NULL, 'DATABASE');\nGO" }
    ],
    tables: [
      ["Object", "Scope", "Purpose", "Login", "Server", "Authenticate to the instance", "User", "Database", "Map a login into a database", "Role", "Server or DB", "Bundle permissions"],
      ["Statement", "Effect", "Precedence", "GRANT", "Allows an action", "Overridden by DENY", "DENY", "Blocks an action", "Beats GRANT at any scope", "REVOKE", "Removes an explicit grant or deny", "Neutral"]
    ],
    diagram: { label: "Security identity flow", caption: "A server login maps by SID to a database user, which gains permissions through roles.", nodes: ["Windows / SQL login (server)", "Database user (mapped by SID)", "Role membership (fixed or custom)", "GRANT / DENY on schema or object", "Effective permission"] },
    steps: [
      "Create two SQL logins with CHECK_POLICY ON and strong passwords.",
      "Create a SecurityLab database and create a user for each login inside it.",
      "Create a custom role AppReaders, add LabReportLogin to it and grant SELECT on the dbo schema.",
      "Grant EXECUTE on the dbo schema to LabAppLogin but no SELECT — establishing least privilege.",
      "DENY DELETE on the dbo schema to LabReportLogin and confirm DENY wins over any GRANT.",
      "Open a second SSMS connection as LabReportLogin and verify SELECT works while DELETE fails.",
      "Connect as LabAppLogin and verify it cannot SELECT but can EXECUTE permitted procedures.",
      "Use sys.fn_my_permissions to list effective permissions for each connection.",
      "Back up and restore SecurityLab to a new name to create an orphaned-user scenario, then find it with the SID query.",
      "Remap the orphaned user with ALTER USER ... WITH LOGIN and verify access is restored."
    ],
    scenario: ["The DENY that stopped reporting at midnight", "A security administrator added a broad DENY SELECT on a schema to block a single contractor. The reporting service used a role granted SELECT on the same schema; because DENY overrides GRANT at every scope, all overnight reports failed. The fix was to remove the broad DENY and apply a narrow denial to the specific principal. The lab reproduces this so you learn to reach for least-privilege grants rather than sweeping DENYs."],
    interview: [
      ["What is the difference between a login and a user?", "A login authenticates to the server (server scope); a user is that login's mapped identity inside a database (database scope), linked by SID. Permissions are granted to users in the database and to logins at the server."],
      ["What does DENY do in the permission hierarchy?", "DENY overrides GRANT at every scope — denying SELECT on a schema blocks access even if SELECT is granted on a table inside it — so it is powerful and should be used narrowly."],
      ["Why do orphaned users occur and how do you fix them?", "After a restore to another server, a user's SID may not match any login. Find them by joining sys.database_principals to sys.server_principals on SID, then remap with ALTER USER ... WITH LOGIN."]
    ],
    takeaways: [
      "Authentication (login) and authorisation (user/permissions) are different layers",
      "Prefer roles and schema-level grants over per-object, per-user grants",
      "DENY always overrides GRANT — use it sparingly and narrowly",
      "Orphaned users are a SID mismatch resolved with ALTER USER ... WITH LOGIN",
      "Least privilege limits the blast radius of errors and compromises"
    ]
  }
};
