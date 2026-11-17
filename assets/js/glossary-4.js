/* Glossary & Command Reference — part 4: maintenance, security, HA/DR, automation and cloud. */

window.GLOSSARY = (window.GLOSSARY || []).concat([

  {
    term: "Index rebuild vs reorganize",
    cat: "Maintenance & Performance",
    say: "in-dex re-build / re-or-gan-ize",
    short: "Two ways to fix index fragmentation — rebuild recreates the index; reorganize defragments leaf pages in place.",
    what: "ALTER INDEX ... REBUILD drops and recreates the index, producing a fresh, compact structure and updating statistics with a full scan. It is an offline operation in Standard Edition unless ONLINE = ON is available. ALTER INDEX ... REORGANIZE physically reorders leaf pages in place, is always online, but is less thorough. Rebuild is generally better above roughly 30% fragmentation; reorganize is suitable for light fragmentation (around 5-30%).",
    why: "Fragmentation slows range scans and wastes memory and disk. Choosing the wrong method wastes time or leaves performance problems unresolved.",
    syntax: "-- Inspect fragmentation\\nSELECT OBJECT_NAME(ips.object_id) AS obj, i.name AS index_name,\\n       ips.avg_fragmentation_in_percent, ips.page_count\\nFROM   sys.dm_db_index_physical_stats\\n       (DB_ID(), NULL, NULL, NULL, 'LIMITED') ips\\nJOIN   sys.indexes i\\n  ON i.object_id = ips.object_id AND i.index_id = ips.index_id\\nWHERE  ips.page_count > 1000\\nORDER BY ips.avg_fragmentation_in_percent DESC;\nGO\\n-- Reorganize\\nALTER INDEX IX_Orders_Customer ON dbo.Orders REORGANIZE;\nGO\\n-- Rebuild online\\nALTER INDEX IX_Orders_Customer ON dbo.Orders\\nREBUILD WITH (ONLINE = ON);",
    how: [
      "Measure fragmentation and page count first — ignore tiny indexes.",
      "Reorganize lightly fragmented indexes; rebuild heavily fragmented ones.",
      "Use ONLINE = ON in Enterprise/2016+ SP1+ editions where available to reduce downtime.",
      "Rebuilding an index updates its statistics; reorganizing does not.",
      "Do not shrink data files after index maintenance — it reintroduces fragmentation."
    ],
    pitfalls: [
      "Rebuilding every index every night — it generates huge log and wastes resources.",
      "Using REORGANIZE on a 90%-fragmented index and expecting a rebuild's result."
    ],
    see: ["ch12-11", "ch12-12", "ch12-13", "practical-07"]
  },

  {
    term: "UPDATE STATISTICS",
    cat: "Maintenance & Performance",
    say: "up-date sta-tis-tics",
    short: "Refreshes the optimiser's data-distribution information so plans reflect current data.",
    what: "UPDATE STATISTICS samples or fully scans a table or index to rebuild its histograms. WITH FULLSCAN reads every row for maximum accuracy; without it SQL Server samples a percentage. Auto-update statistics runs in the background based on modification thresholds, but after a large load an explicit update avoids a window of poor plans.",
    why: "Stale statistics are one of the most common causes of sudden plan regressions. Updating them is fast, safe and often the first thing to try.",
    syntax: "UPDATE STATISTICS dbo.Orders WITH FULLSCAN;\nGO\\n-- Update one index's statistics\\nUPDATE STATISTICS dbo.Orders IX_Orders_Customer WITH FULLSCAN;\nGO\\n-- Check last update\\nSELECT name, STATS_DATE(object_id, stats_id) AS updated\\nFROM sys.stats WHERE object_id = OBJECT_ID('dbo.Orders');",
    how: [
      "Keep AUTO_UPDATE_STATISTICS ON; add explicit updates after bulk loads.",
      "Use FULLSCAN on important, volatile tables when accuracy is critical.",
      "Compare actual vs estimated rows in a plan to spot stale statistics.",
      "Combine with Query Store to see whether performance improved."
    ],
    pitfalls: [
      "Updating every table's statistics nightly — focus on tables with significant changes.",
      "Assuming an index REORGANIZE refreshes statistics — it does not."
    ],
    see: ["ch12-14", "ch12-15", "ch15-11"]
  },

  {
    term: "SQL Server Agent job",
    cat: "Maintenance & Performance",
    say: "S-Q-L Server A-gent job",
    short: "A scheduled automation unit that runs one or more steps — the built-in scheduler of SQL Server.",
    what: "A SQL Server Agent job consists of steps (T-SQL, PowerShell, SSIS, CmdExec, etc.), schedules, alerts and notifications. Jobs back up databases, run index maintenance, execute ETL and clean up old data. They live in the msdb database and are managed through SSMS or system stored procedures such as sp_add_job.",
    why: "Reliable automation removes manual toil and ensures maintenance happens consistently. A failed job that nobody notices is a silent risk.",
    syntax: "-- Inspect job status\\nSELECT j.name, h.run_date, h.run_time,\\n       CASE h.run_status WHEN 0 THEN 'Failed' WHEN 1 THEN 'Succeeded' END AS status\\nFROM   msdb.dbo.sysjobs j\\nJOIN   msdb.dbo.sysjobhistory h ON j.job_id = h.job_id\\nWHERE  h.step_id = 0\\nORDER BY h.run_date DESC, h.run_time DESC;\nGO\\n-- Start a job manually\\nEXEC msdb.dbo.sp_start_job @job_name = N'NightlyBackup';",
    how: [
      "Give jobs clear names, owners and schedules.",
      "Configure alerts or Database Mail so failures notify someone.",
      "Check job history regularly and include it in health checks.",
      "Use proxies and least-privilege accounts for non-T-SQL steps."
    ],
    pitfalls: ["Scheduling overlapping jobs that fight over the same resources."],
    see: ["ch10-01", "ch10-04", "ch10-06", "practical-05"]
  },

  {
    term: "Maintenance plan",
    cat: "Maintenance & Performance",
    say: "main-ten-ance plan",
    short: "An SSMS wizard-generated set of jobs for backups, integrity checks and index maintenance.",
    what: "A maintenance plan is a graphical way to create SQL Server Agent jobs that perform common tasks: full/differential/log backups, CHECKDB, index rebuild or reorganize, statistics updates and cleanup. It generates jobs behind the scenes and stores its definition in msdb.",
    why: "It is a quick starting point for small environments, but many DBAs replace it with custom scripts as requirements grow, because it offers limited conditional logic.",
    syntax: "-- Maintenance plans are created in SSMS: Management > Maintenance Plans.\\n-- Inspect the jobs they create:\\nSELECT name FROM msdb.dbo.sysjobs\\nWHERE name LIKE 'Subplan_%' OR name LIKE 'MaintenancePlan%';\\nGO\\n-- Common alternative: Ola Hallengren scripts create their own jobs\\n-- (see ch15-03 for a scripted approach).",
    how: [
      "Use it to get simple backups and CHECKDB running quickly.",
      "Set cleanup tasks so old backups do not fill the disk.",
      "Review the generated jobs and their schedules.",
      "Move to scripted maintenance when you need conditions, central logging or multi-server reporting."
    ],
    pitfalls: ["Assuming a maintenance plan's backup is tested — still rehearse restores."],
    see: ["ch15-09", "ch10-12", "ch15-20"]
  },

  {
    term: "Logins vs users",
    cat: "Security & Permissions",
    say: "log-ins / users",
    short: "A login grants access to the instance; a database user grants access inside one database.",
    what: "A server login authenticates a principal to SQL Server (Windows/AD account, group or SQL login). Inside each database, a user is mapped to that login (by SID) and receives permissions on database objects. A single login can have a user in several databases. Roles — fixed and custom — group permissions for easier administration.",
    why: "Understanding this two-level model is essential for granting least privilege and for fixing the orphaned-user problem after a restore.",
    syntax: "-- Create a login and a mapped user\\nCREATE LOGIN [DOMAIN\\\\AppSvc] FROM WINDOWS;\\nGO\\nUSE Orders;\\nGO\\nCREATE USER [DOMAIN\\\\AppSvc] FOR LOGIN [DOMAIN\\\\AppSvc];\\nGO\\nALTER ROLE db_datareader ADD MEMBER [DOMAIN\\\\AppSvc];\\nALTER ROLE db_datawriter ADD MEMBER [DOMAIN\\\\AppSvc];\\nGO\\n-- See role membership\\nSELECT r.name AS role_name, m.name AS member_name\\nFROM sys.database_role_members rm\\nJOIN sys.database_principals r ON r.principal_id = rm.role_principal_id\\nJOIN sys.database_principals m ON m.principal_id = rm.member_principal_id;",
    how: [
      "Prefer Windows/AD group logins over individual SQL logins.",
      "Grant the minimum permissions needed — start with db_datareader/db_datawriter or custom roles.",
      "Map users with CREATE USER ... FOR LOGIN and verify SIDs after a restore.",
      "Audit sys.server_principals and sys.database_principals regularly."
    ],
    pitfalls: [
      "GRANTing sysadmin to make an application work — never do this.",
      "Confusing a login with a user; a login alone does not allow access to a database."
    ],
    see: ["ch09-06", "ch09-07", "ch09-08", "practical-04"]
  },

  {
    term: "Roles & least privilege",
    cat: "Security & Permissions",
    say: "roles / least priv-i-lege",
    short: "Grant only the permissions a principal needs, grouped into roles for manageability.",
    what: "Fixed server roles (sysadmin, serveradmin, securityadmin, etc.) and fixed database roles (db_owner, db_datareader, db_datawriter, db_ddladmin) provide common permission sets. User-defined roles let you tailor access precisely. Least privilege means starting with no permissions and granting only what is required for the job.",
    why: "Excessive privilege is the route by which attacks and accidents become catastrophic. Auditing and compliance depend on demonstrable least privilege.",
    syntax: "-- Create a custom role and grant specific permissions\\nUSE Orders;\\nGO\\nCREATE ROLE ReportReader;\\nGRANT SELECT ON SCHEMA::dbo TO ReportReader;\\nGO\\nALTER ROLE ReportReader ADD MEMBER [DOMAIN\\\\ReportUser];\\nGO\\n-- Check effective permissions\\nEXEC sys.fn_my_permissions(N'dbo.Orders', 'OBJECT');",
    how: [
      "Avoid sysadmin and db_owner except for a small, named set of administrators.",
      "Create custom roles around job functions rather than granting to individuals.",
      "Use fn_my_permissions to verify what a principal can actually do.",
      "Review membership periodically and remove stale accounts."
    ],
    pitfalls: ["Adding an account to db_owner 'temporarily' and never removing it."],
    see: ["ch09-19", "ch09-13", "ch09-12"]
  },

  {
    term: "TDE (Transparent Data Encryption)",
    cat: "Security & Permissions",
    say: "T-D-E",
    short: "Encryption at rest for an entire database's data and log files.",
    what: "TDE encrypts the physical data and log files transparently — applications and queries do not need to change. It uses a database encryption key protected by a server certificate in master. Backups of a TDE-enabled database are also encrypted. TDE protects against stolen media, not against a user who can query the database.",
    why: "It satisfies compliance requirements for data at rest with minimal application impact. Key and certificate backup is critical — losing them means losing the data.",
    syntax: "-- Typical sequence (simplified)\\nUSE master;\\nGO\\nCREATE MASTER KEY ENCRYPTION BY PASSWORD = 'StrongPasswordHere';\\nCREATE CERTIFICATE MyServerCert WITH SUBJECT = 'TDE Cert';\\nGO\\nUSE Orders;\\nGO\\nCREATE DATABASE ENCRYPTION KEY\\nWITH ALGORITHM = AES_256\\nENCRYPTION BY SERVER CERTIFICATE MyServerCert;\\nGO\\nALTER DATABASE Orders SET ENCRYPTION ON;\nGO\\n-- Monitor progress\\nSELECT name, is_encrypted, encryption_state_desc\\nFROM sys.databases d\\nJOIN sys.dm_database_encryption_keys e ON d.database_id = e.database_id;",
    how: [
      "Back up the server certificate and its private key immediately, and store them off-site.",
      "Test restore of a TDE backup on another server requires restoring the certificate first.",
      "Expect some CPU overhead; measure on a test system.",
      "Remember TDE does not encrypt data in transit — use TLS for connections."
    ],
    pitfalls: ["Enabling TDE without backing up the certificate — a server rebuild then loses all data."],
    see: ["ch07-11", "ch09-25", "ch20-24"]
  },

  {
    term: "Always On Availability Groups",
    cat: "High Availability & Cloud",
    say: "al-ways on avail-a-bil-i-ty groups",
    short: "Enterprise high-availability and disaster-recovery feature: a set of databases that fail over together.",
    what: "An Always On Availability Group replicates a group of databases from a primary replica to one or more secondary replicas. Secondaries can be synchronous (no data loss, with commit latency) or asynchronous (better performance, possible small loss). Listeners provide a single virtual network name for applications. Failover can be automatic or manual.",
    why: "It provides high availability with no shared storage and can offload read-only reporting to a secondary. It is a major design decision with licensing, quorum and operational implications.",
    syntax: "-- Check availability group health\\nSELECT ag.name AS ag_name, ar.replica_server_name,\\n       ars.role_desc, ars.synchronization_health_desc\\nFROM sys.availability_groups ag\\nJOIN sys.availability_replicas ar ON ag.group_id = ar.group_id\\nJOIN sys.dm_hadr_availability_replica_states ars\\n  ON ar.replica_id = ars.replica_id;\nGO\\n-- Common PowerShell cmdlet\\n-- Get-Date; Get-ClusterResource | Where-Object { $_.Name -like '*AG*' }",
    how: [
      "Decide synchronous vs asynchronous per replica based on RPO and distance.",
      "Configure a quorum witness and test failover, not just failback.",
      "Use a listener so applications do not hard-code server names.",
      "Monitor redo latency and synchronization health on secondaries."
    ],
    pitfalls: ["Assuming a secondary is a backup — it replicates deletes and corruption too."],
    see: ["ch16-08", "ch16-09", "ch16-17", "ch16-19"]
  },

  {
    term: "Failover cluster instance (FCI)",
    cat: "High Availability & Cloud",
    say: "fail-over clus-ter in-stance",
    short: "Two or more nodes sharing storage that present one SQL Server instance with automatic failover.",
    what: "An FCI uses Windows Server Failover Clustering with shared storage. If the active node fails, another node takes over the SQL Server instance and its shared disks. Unlike availability groups, there is only one copy of the data, so it protects against server failure but not against storage failure or corruption.",
    why: "It provides instance-level high availability with full instance fidelity, but requires shared storage and has a longer failover time than an AG.",
    syntax: "-- Inspect cluster nodes (run on a node)\\n-- PowerShell:\\n-- Get-ClusterNode | Select-Object Name, State\\n-- Get-ClusterSharedVolume\\n-- T-SQL to see the instance name\\nSELECT @@SERVERNAME AS server_name, SERVERPROPERTY('IsClustered') AS is_clustered;",
    how: [
      "Use an FCI when you need instance-level failover and can provide shared storage.",
      "Pair it with log shipping or backups for disaster recovery — it does not duplicate data.",
      "Test failover and verify that applications reconnect."
    ],
    pitfalls: ["Believing FCI protects against disk failure — the shared storage is a single point of failure."],
    see: ["ch16-05", "ch16-06", "ch16-07"]
  },

  {
    term: "Log shipping",
    cat: "High Availability & Cloud",
    say: "log ship-ping",
    short: "Automatically backing up, copying and restoring transaction logs to a warm standby server.",
    what: "Log shipping consists of a primary server, one or more secondary servers and a monitor server. Jobs back up the log on the primary, copy the file to the secondary, and restore it WITH STANDBY or NORECOVERY on a schedule. It is simple, robust and works over long distances, but failover is manual and there is a delay.",
    why: "It is a low-cost, well-understood disaster recovery option, especially for older editions or less critical databases.",
    syntax: "-- Configure through SSMS: Database Properties > Transaction Log Shipping.\\n-- On the secondary, restore with standby so it is readable between restores:\\nRESTORE LOG OrdersStandby\\nFROM DISK = N'\\\\\\\\BackupShare\\\\\\\\Orders_Log.trn'\\nWITH STANDBY = N'D:\\\\Standby\\\\Orders_undo.dat';\nGO\\n-- Check msdb history\\nSELECT * FROM msdb.dbo.log_shipping_monitor_secondary;",
    how: [
      "Set the backup copy and restore schedule based on your RPO.",
      "Monitor for restore delays and alert on missed jobs.",
      "Practise a manual failover to the standby regularly.",
      "Remember a readable standby is disconnected while a log is being restored."
    ],
    pitfalls: ["Forgetting that failover is manual and that a readable secondary is a snapshot, not live data."],
    see: ["ch17-03", "ch17-04", "ch17-08"]
  },

  {
    term: "PowerShell for DBAs",
    cat: "Automation & Cloud",
    say: "power-shell",
    short: "A scripting shell and automation framework used to manage SQL Server at scale.",
    what: "PowerShell lets you automate tasks across many servers: run SQL queries with Invoke-Sqlcmd (SqlServer module), manage services and files, call the SQL Server Management Objects (SMO) library, and orchestrate agent jobs. It is essential when a task must be repeated across dozens of instances.",
    why: "GUI clicks do not scale. Scripting makes maintenance repeatable, auditable and less error-prone.",
    syntax: "# Run a query on a remote instance\n$servers = @('SQL01', 'SQL02')\nforeach ($s in $servers) {\n  Invoke-Sqlcmd -ServerInstance $s -Database master `\n    -Query \"SELECT @@SERVERNAME AS srv, name, state_desc FROM sys.databases\"\n}\n\n# Check the SQL Server service\nGet-Service -ComputerName SQL01 -Name 'MSSQLSERVER' | Select-Object Name, Status",
    how: [
      "Install the SqlServer module for Invoke-Sqlcmd.",
      "Use parameterized queries and least-privilege service accounts.",
      "Start with read-only inventory scripts before making changes.",
      "Version your scripts in source control."
    ],
    pitfalls: [
      "Using PowerShell backtick line continuations incorrectly — a trailing space after the backtick breaks the command.",
      "Hard-coding passwords in scripts — use Windows authentication or a credential store."
    ],
    see: ["ch18-01", "ch18-09", "ch18-10", "ch18-19"]
  },

  {
    term: "Azure SQL / managed_instance",
    cat: "Automation & Cloud",
    say: "ay-zure S-Q-L / man-aged in-stance",
    short: "Platform-as-a-service SQL Server offerings where Microsoft manages the operating system and patching.",
    what: "Azure SQL Database is a single database or elastic pool with a managed instance of SQL Server; Azure SQL Managed Instance offers near-full SQL Server compatibility with instance-level features. Backups, patching and high availability are largely automatic, but you still choose service tier, configure firewall rules, monitor performance and design security.",
    why: "Cloud shifts some DBA duties to the provider but adds new ones: cost management, connectivity, and understanding which features differ from on-premises SQL Server.",
    syntax: "-- Azure SQL Database has some differences:\n-- No CREATE DATABASE inside the user database; use the portal/ARM.\n-- Always-on encrypted connections and firewall rules are required.\nSELECT @@VERSION;\nGO\n-- Query typically useful in Azure for DTU/vCore monitoring:\nSELECT * FROM sys.dm_db_resource_stats ORDER BY end_time DESC;",
    how: [
      "Learn which features differ between Azure SQL Database and Managed Instance.",
      "Configure firewall rules and Azure AD authentication deliberately.",
      "Monitor DTU/vCore utilisation and scale deliberately rather than reactively.",
      "Understand that point-in-time restore windows differ from on-premises retention."
    ],
    pitfalls: ["Assuming you manage the server OS and backups exactly as on-premises."],
    see: ["ch17-01", "ch20-11", "ch20-24"]
  }
]);
