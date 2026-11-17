/* Domain knowledge base, part 1 (ch01-ch05) for generate-content.mjs. */

export const K1 = {
  ch01: {
    theme: "the DBA role, responsibilities and production operations",
    vocab: ["Availability", "Protection", "Security", "Performance", "Change", "Operations"],
    paras: [
      "A Database Administrator owns the shared, stateful data platform that every application depends on. Unlike a developer who optimises for shipping features, the DBA optimises for the database surviving years of change: available, correct, secure and recoverable.",
      "The role spans six domains — availability, protection, security, performance, change control and daily operations. In a small organisation one person covers all six; in an enterprise they split across production, development, infrastructure and architectural DBA specialisms.",
      "Production differs from every other environment. It holds real customer data, real money and real reputation. A change that is harmless in development can page the whole team at 3 a.m. if it reaches production unreviewed.",
      "Environments follow a promotion path: development for building, test for functional verification, UAT for business sign-off, and production for live traffic. Each promotion is a gate where schema and configuration changes are reviewed, not copied blindly.",
      "The DBA's most important artefact is a tested restore. A backup policy that has never been exercised is an assumption, not a strategy. Regular restore tests into an isolated instance are the only proof recovery objectives can be met.",
      "Availability and reliability are engineered, not hoped for: redundant hardware, high availability features, monitored health and rehearsed failover all contribute to an uptime figure the business can rely on.",
      "Incident management is a discipline. Severity levels, clear escalation paths, calm communication and blameless post-incident reviews turn a chaotic outage into a learning event with documented prevention measures.",
      "The daily rhythm — health checks, backup verification, job review, space monitoring — is what keeps small problems small. Consistency in these routines is more valuable than heroic firefighting."
    ],
    code: [
      { lang: "sql", body: "-- What instance am I on and what is its state?\nSELECT @@SERVERNAME AS server_name,\n       SERVERPROPERTY('ProductVersion') AS product_version,\n       SERVERPROPERTY('Edition') AS edition,\n       (SELECT count(*) FROM sys.databases) AS db_count;" },
      { lang: "sql", body: "-- Review all databases and their current state\nSELECT name, state_desc, recovery_model_desc,\n       compatibility_level\nFROM   sys.databases\nORDER BY name;" },
      { lang: "sql", body: "-- Check recent backup history for every database\nSELECT d.name AS database_name,\n       max(b.backup_finish_date) AS last_backup\nFROM   sys.databases d\nLEFT JOIN msdb.dbo.backupset b\n       ON b.database_name = d.name\nGROUP BY d.name\nORDER BY d.name;" }
    ],
    tables: [
      ["Domain", "Typical ownership", "Primary metric", "Availability", "Uptime, failover, on-call response", "99.9%+ uptime", "Protection", "Backups, restore testing, DR", "RPO / RTO met", "Security", "Logins, roles, least privilege, auditing", "Zero unauthorised access", "Performance", "Plans, indexes, waits, capacity", "Sub-second response"],
      ["Environment", "Purpose", "Change freedom", "Development", "Build and iterate", "High — break freely", "Test", "Functional verification", "Medium — controlled", "UAT", "Business sign-off", "Low — frozen builds", "Production", "Live customer traffic", "Governed and windowed"]
    ],
    scenarios: [
      ["The 9:15 AM deploy that stopped checkout", "At 9:15 a new stored procedure performed an unindexed scan of a 40-million-row table inside a transaction that held locks on Orders. Checkout timeouts cascaded within minutes. The DBA identified the head blocker, killed the offending session with approval, rolled back the failed transaction and added a covering index — then fed the root cause into the deployment review. Availability was lost not because of hardware, but because of an unreviewed change."],
      ["The backup that nobody had ever restored", "A new DBA inherited an estate where nightly backups had 'succeeded' for two years. During a storage failure the team discovered the restore media could not be read. The lesson: a backup policy without a documented, scheduled restore test is an assumption. The DBA immediately set up isolated restore tests for the tier-1 databases and published the results."]
    ],
    interviews: [
      ["What is the single most important responsibility of a DBA?", "Protecting the availability and integrity of the organisation's data — in practice a tested backup and recovery capability, because every other responsibility is undone by data loss."],
      ["How is a DBA different from a backend developer?", "A developer owns application logic for one system; the DBA owns the shared data platform for all systems — configuration, security, performance, backup and recovery — and is accountable when data is slow, lost or exposed."],
      ["You join a company and find no restore has ever been tested. What first?", "Document the risk immediately, then schedule a restore of the most critical database into an isolated instance. A backup policy without a restore test is a business risk, not just a technical one."],
      ["What does a production DBA do every morning?", "Review overnight job and backup results, check space and error logs, verify health metrics, and triage any alerts — establishing that the estate is healthy before the day's changes begin."]
    ]
  },
  ch02: {
    theme: "relational database and SQL fundamentals",
    vocab: ["Table", "Row", "Key", "Constraint", "Relationship", "Transaction"],
    paras: [
      "A database is an organised collection of related data. A relational database stores that data in tables of rows and columns and enforces relationships and rules through constraints, so the structure itself protects correctness.",
      "SQL Server is a relational database management system: it stores data, enforces integrity, manages concurrency and executes queries. The relational engine parses and optimises requests; the storage engine reads and writes pages.",
      "Tables model entities, rows model instances and columns model attributes. Choosing the right data types and nullability is the first act of physical design — it affects storage, index width and the correctness of every downstream calculation.",
      "Keys and constraints encode business rules close to the data. A primary key identifies a row, a foreign key enforces a relationship, a unique constraint prevents duplicates and a check constraint rejects invalid values regardless of which application wrote them.",
      "Normalisation organises tables to reduce redundancy — 1NF removes repeating groups, 2NF removes partial dependencies and 3NF removes transitive dependencies. Denormalisation is a deliberate, measured trade-off, not a default.",
      "SQL divides into DDL (structure), DML (data), DQL (queries), DCL (permissions) and TCL (transactions). A DBA must read all five fluently to administer a server through catalog views and dynamic management views.",
      "Transactions group operations into an atomic unit with ACID guarantees: atomicity, consistency, isolation and durability. COMMIT makes changes permanent; ROLLBACK undoes them. Explicit transactions keep related writes together.",
      "Indexes are the bridge between a query and the data it needs. Understanding clustered versus nonclustered structure is the foundation of all later performance work."
    ],
    code: [
      { lang: "sql", body: "CREATE TABLE dbo.Customer (\n  CustomerID int IDENTITY(1,1) NOT NULL,\n  Email      nvarchar(256) NOT NULL,\n  CreatedAt  datetime2(0) NOT NULL DEFAULT SYSDATETIME(),\n  CONSTRAINT PK_Customer PRIMARY KEY (CustomerID),\n  CONSTRAINT UQ_Customer_Email UNIQUE (Email)\n);" },
      { lang: "sql", body: "BEGIN TRY\n  BEGIN TRAN;\n  INSERT dbo.Customer (Email) VALUES (N'a@example.com');\n  INSERT dbo.Customer (Email) VALUES (N'b@example.com');\n  COMMIT;\nEND TRY\nBEGIN CATCH\n  IF XACT_STATE() <> 0 ROLLBACK;\n  THROW;\nEND CATCH;" },
      { lang: "sql", body: "SELECT t.name AS table_name,\n       c.name AS column_name, ty.name AS data_type,\n       c.max_length, c.is_nullable\nFROM   sys.tables t\nJOIN   sys.columns c ON c.object_id = t.object_id\nJOIN   sys.types ty ON ty.user_type_id = c.user_type_id\nWHERE  t.name = 'Customer'\nORDER BY c.column_id;" }
    ],
    tables: [
      ["Category", "Purpose", "Example", "DDL", "Define structure", "CREATE / ALTER / DROP", "DML", "Modify data", "INSERT / UPDATE / DELETE", "DQL", "Retrieve data", "SELECT", "DCL", "Control access", "GRANT / DENY", "TCL", "Manage transactions", "COMMIT / ROLLBACK"],
      ["Constraint", "Guarantee", "Failure behaviour", "PRIMARY KEY", "Unique, non-null identity", "Reject duplicates / NULL", "FOREIGN KEY", "Referential integrity", "Reject orphan rows", "UNIQUE", "No duplicate values", "Reject duplicates", "CHECK", "Domain rule", "Reject invalid values"]
    ],
    scenarios: [
      ["The negative-quantity refund bug", "A bulk loader bypassed application validation and inserted rows with Quantity = -5 because the database had no CHECK constraint. A downstream pricing job treated them as refunds and issued $40,000 in credits. A single CHECK (Quantity > 0) would have stopped every bad row. Constraints belong in the database because applications, imports and ad-hoc scripts all get bypassed — the database never does."],
      ["The transaction that half-applied", "A deployment script inserted an order header and then failed while writing its lines, leaving an orphaned header visible to customers. The fix was to wrap both writes in an explicit transaction with TRY/CATCH and ROLLBACK on error. Atomicity is not automatic across statements — the developer must request it."]
    ],
    interviews: [
      ["What is the difference between a PRIMARY KEY and a UNIQUE constraint?", "Both enforce uniqueness, but a table has exactly one primary key (non-null, clustered by default) while multiple unique constraints are allowed and each permits one NULL in SQL Server."],
      ["What do ACID properties guarantee?", "Atomicity (all or nothing), Consistency (valid state to valid state), Isolation (concurrent transactions do not interfere beyond the chosen level) and Durability (committed changes survive a crash via the log)."],
      ["Where should business rules live?", "In both layers, but the database is the enforcement layer of last resort — CHECK constraints and foreign keys protect data regardless of which application or script writes to it."]
    ]
  },
  ch03: {
    theme: "Windows Server and infrastructure for DBAs",
    vocab: ["Service", "Account", "Permission", "Network", "Port", "Volume"],
    paras: [
      "SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.",
      "Windows services are long-running background processes. The SQL Server service, SQL Server Agent and several auxiliary services run under configured accounts; their start mode, state and dependencies determine whether the database is reachable after a reboot.",
      "Service accounts are identities with rights. The principle of least privilege applies: grant only the permissions the service needs (log on as a service, file access to data folders, perhaps domain rights for backups or Kerberos), no more.",
      "NTFS permissions control who can read or change files. The service account needs modify rights on data, log and backup folders. Misconfigured permissions surface as errors 5 (access denied) or failures to create backups and files.",
      "Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity. The default instance listens on TCP 1433; the Browser service on UDP 1434 resolves named instances; availability groups commonly use 5022.",
      "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked. Always verify service state, listener state and network path in that order.",
      "Event Viewer and Performance Monitor are the Windows-side diagnostic tools. The System and Application logs record service stops, disk errors and driver faults; Performance Monitor counter logs reveal CPU, memory and disk pressure over time.",
      "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour."
    ],
    code: [
      { lang: "powershell", body: "Get-Service -Name 'MSSQL*','SQLSERVERAGENT' |\n  Select-Object Name, DisplayName, Status, StartType |\n  Format-Table -AutoSize" },
      { lang: "powershell", body: "Test-NetConnection -ComputerName db01 -Port 1433 |\n  Select-Object ComputerName, RemotePort, TcpTestSucceeded" },
      { lang: "powershell", body: "Get-Volume | Select-Object DriveLetter, FileSystemLabel,\n  @{n='FreeGB';e={[math]::Round($_.SizeRemaining/1GB,1)}},\n  @{n='SizeGB';e={[math]::Round($_.Size/1GB,1)}} |\n  Format-Table -AutoSize" }
    ],
    tables: [
      ["Service", "Purpose", "Typical start mode", "MSSQLSERVER / MSSQL$INST", "Database Engine", "Automatic", "SQLSERVERAGENT", "Jobs, alerts, schedules", "Automatic", "SQLBrowser", "Named-instance resolution", "Automatic (named instances)"],
      ["Port", "Used by", "Protocol", "1433", "Default instance / listener", "TCP", "1434", "SQL Server Browser", "UDP", "5022", "Availability group endpoints", "TCP"]
    ],
    scenarios: [
      ["The application that 'could not connect' after patching", "After a Windows patch cycle the app reported SQL Server unavailable. The engine was healthy — Get-Service showed it running — but the firewall profile had switched from Domain to Public and blocked TCP 1433. Resetting the profile and scoping the rule to the app subnet restored connectivity. The prevention was a scripted firewall rule bound to the Domain profile."],
      ["Access denied on a restored database", "A restore succeeded but the service account could not write to the new data folder, producing error 5 on growth. icacls showed the restored folder inherited restrictive rights. Granting the service account modify permission on the data and log folders resolved it; the runbook was updated to include permission checks after every restore path change."]
    ],
    interviews: [
      ["What order do you check when an app cannot connect?", "Service state, then listener/protocol state, then network path (ping, Test-NetConnection to the port), then firewall, then SQL-level errors and logins — from outside in."],
      ["Why does the SQL Server service account need least privilege?", "It limits the blast radius if the service is compromised and avoids unnecessary domain rights; grant only log-on-as-service, file access to data folders and any rights backups or Kerberos genuinely need."],
      ["Where do you look for a service that keeps stopping?", "Windows Event Viewer System and Application logs, SQL Server error log, and the service's dependencies and account — often a password expiry or a failed dependency is the cause."]
    ]
  },
  ch04: {
    theme: "SQL Server internal architecture",
    vocab: ["Page", "Extent", "Buffer", "Log", "Checkpoint", "Recovery"],
    paras: [
      "SQL Server's storage engine manages 8 KB pages, the fundamental unit of I/O. Eight pages form an extent. Data and index pages live in MDF/NDF files; the transaction log is a separate sequential structure of virtual log files.",
      "The buffer pool caches pages in memory. A read that finds a page in the pool is served from RAM in microseconds; a miss requires a physical read milliseconds long. This is why memory sizing dominates performance.",
      "Pages in the buffer pool are clean if they match disk, dirty if modified. Checkpoints write dirty pages to disk to bound recovery time; the lazy writer evicts pages under memory pressure, flushing dirty pages first.",
      "Write-ahead logging guarantees the log record for a change reaches disk before the data page. A committed transaction's log is durable even if the data page is not yet written, which is what makes crash recovery possible.",
      "The transaction log is a circular sequence of VLFs with log sequence numbers (LSNs). Truncation marks inactive VLFs reusable; it does not shrink the physical file. Frequent small autogrowths create VLF explosion and slow recovery.",
      "Crash recovery has three phases: analysis determines the state at the last checkpoint, redo replays committed transactions, and undo rolls back uncommitted ones. The database is brought to a consistent state automatically at startup.",
      "The relational engine parses, compiles and executes queries. Plans are cached and reused; parameterisation and the plan cache are central to understanding consistent versus intermittent performance.",
      "Understanding internals turns mysterious symptoms into mechanisms: PAGEIOLATCH waits mean physical reads, WRITELOG means log flush latency, and a long recovery often means too many VLFs."
    ],
    code: [
      { lang: "sql", body: "-- Buffer pool usage per database\nSELECT db_name(database_id) AS db,\n       count(*) * 8 / 1024 AS buffer_mb\nFROM   sys.dm_os_buffer_descriptors\nGROUP BY database_id\nORDER BY buffer_mb DESC;" },
      { lang: "sql", body: "-- Transaction log space usage\nSELECT total_log_size_in_bytes / 1048576.0 AS total_mb,\n       used_log_space_in_bytes / 1048576.0 AS used_mb,\n       used_log_space_in_percent AS used_pct\nFROM   sys.dm_db_log_space_usage;" },
      { lang: "sql", body: "-- VLF count per database (a high count hurts recovery)\nSELECT db_name(database_id) AS db,\n       count(*) AS vlf_count\nFROM   sys.dm_db_log_info(NULL)\nGROUP BY database_id\nORDER BY vlf_count DESC;" }
    ],
    tables: [
      ["Structure", "Size", "Role", "Page", "8 KB", "Unit of data I/O", "Extent", "64 KB (8 pages)", "Allocation unit", "VLF", "Variable", "Log truncation unit"],
      ["Mechanism", "Trigger", "Effect", "Checkpoint", "Periodic / log volume", "Flush dirty pages, bound recovery", "Lazy writer", "Memory pressure", "Evict clean pages", "Write-ahead log", "Every modification", "Log durable before data"]
    ],
    scenarios: [
      ["Recovery that took three hours", "After a crash, a 2 TB database took three hours to recover. Investigation found over 15,000 VLFs caused by thousands of 1 MB autogrowths. The fix: pre-size the log in large increments to a sensible VLF count, then shrink and regrow once during a maintenance window. Recovery time returned to minutes."],
      ["PLE collapsed after a report went live", "A new unbounded report pulled millions of cold pages into the buffer pool, evicting hot OLTP pages. Page life expectancy fell from 4,200 to under 30 seconds and applications slowed despite idle CPU. The DBA killed the report, added date predicates and an indexed view, and capped reporting with Resource Governor."]
    ],
    interviews: [
      ["What is a page and an extent?", "A page is an 8 KB unit of data storage and I/O; an extent is eight contiguous pages (64 KB), the unit SQL Server uses to allocate space to objects."],
      ["Explain write-ahead logging.", "The log record describing a change is written to disk before the modified data page. This guarantees committed transactions are recoverable after a crash, becauseredo can replay the log."],
      ["Why is a huge VLF count a problem?", "Recovery must process every VLF during analysis and redo, so thousands of small VLFs dramatically lengthen recovery and slow log operations; pre-size logs in large increments to avoid VLF explosion."]
    ]
  },
  ch05: {
    theme: "SQL Server installation and configuration",
    vocab: ["Edition", "Instance", "Authentication", "Service", "Memory", "Port"],
    paras: [
      "Choosing an edition and version is the first installation decision. Express, Developer, Standard and Enterprise editions differ in feature set, licensing and scale limits; production choice is driven by the features the workload needs and the budget available.",
      "An instance is an installed copy of the Database Engine with its own system databases, configuration and set of user databases. A server can host one default instance and multiple named instances, each isolated from the others.",
      "Authentication can be Windows-only or mixed mode. Windows authentication is preferred because credentials are managed centrally and never stored in the connection string; SQL authentication is retained for compatibility and requires a strong password policy.",
      "Service accounts run the engine and Agent. Use a dedicated low-privilege domain or virtual account, grant only required rights, and never run SQL Server as a local administrator in production.",
      "Memory configuration is critical. The default max server memory is effectively unlimited, which can starve the OS and co-hosted services. Set it explicitly, leaving headroom of roughly 1-4 GB for the operating system.",
      "Network configuration enables the TCP/IP protocol, fixes the port and opens the firewall. Default instances use 1433; named instances use a dynamic port resolved by the Browser service on UDP 1434 unless configured otherwise.",
      "SQL Server Agent is the scheduling engine for jobs, alerts and maintenance. It must be running and configured to start automatically in production, with an operator for notifications.",
      "A production installation checklist turns these decisions into a repeatable, auditable process: editions, paths, accounts, memory, ports, firewall, patch level, backups and monitoring all recorded before go-live."
    ],
    code: [
      { lang: "sql", body: "SELECT SERVERPROPERTY('MachineName') AS machine,\n       SERVERPROPERTY('InstanceName') AS instance,\n       SERVERPROPERTY('ProductVersion') AS version,\n       SERVERPROPERTY('Edition') AS edition;" },
      { lang: "sql", body: "SELECT name, value_in_use, description\nFROM   sys.configurations\nWHERE  name IN ('max server memory (MB)',\n                'min server memory (MB)');" },
      { lang: "sql", body: "-- Services related to this instance\nSELECT servicename, status_desc, startup_type_desc\nFROM   sys.dm_server_services;" }
    ],
    tables: [
      ["Edition", "Intended use", "Key limit / feature", "Express", "Lightweight / learning", "10 GB database size", "Developer", "Non-production", "Full Enterprise features", "Standard", "Mid-size production", "Core HA, limited scale", "Enterprise", "Mission-critical", "Advanced HA, scale"],
      ["Setting", "Recommendation", "Reason", "max server memory", "RAM minus 1-4 GB", "Leave OS headroom", "Authentication", "Windows mode", "Central credential control", "TCP/IP", "Enabled, fixed port", "Predictable connectivity"]
    ],
    scenarios: [
      ["The named instance nobody could reach", "A new named instance was installed but applications could not connect because TCP/IP was disabled and the firewall blocked the dynamic port. The DBA enabled TCP/IP, set a static port, opened that port in the firewall and confirmed with Test-NetConnection. The runbook now includes connectivity verification as an installation sign-off step."],
      ["Memory starvation after go-live", "A server with 32 GB RAM left max server memory at the default. SQL Server grew to consume almost all of it, starving SSRS and the backup agent on the same box. Setting max server memory to 28 GB stabilised both workloads. The lesson: always set memory explicitly when anything else shares the host."]
    ],
    interviews: [
      ["How do default and named instances differ?", "A default instance is addressed by server name alone on port 1433; a named instance uses server\\name and typically a dynamic port resolved by the SQL Browser service (UDP 1434)."],
      ["Why prefer Windows authentication?", "Credentials are managed centrally in Active Directory, support Kerberos and password policies, and are not embedded in application connection strings."],
      ["What should max server memory be on a dedicated SQL Server?", "Total physical RAM minus headroom for the OS and any other services — commonly 1-4 GB, more if co-hosted tooling or AV is present — set explicitly rather than left at the unlimited default."]
    ]
  }
};
