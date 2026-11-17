/* Domain knowledge base, part 4 (ch16-ch20). */

export const K4 = {
  ch16: {
    theme: "high availability",
    vocab: ["Failover", "Replica", "Listener", "Quorum", "Commit", "WSFC"],
    paras: [
      "High availability keeps a database service reachable through failures. It is distinct from disaster recovery: HA handles local failures with near-zero downtime, while DR protects against site-wide loss with a measurable RTO.",
      "Requirements must be expressed in RPO and RTO before technology is chosen. Synchronous replication gives RPO = 0 but adds latency; asynchronous gives distance at the cost of possible data loss on failover.",
      "A failover cluster instance (FCI) provides instance-level protection: two or more Windows Server Failover Clustering nodes share storage, and only one owns the SQL Server instance at a time. Failure moves the instance to another node.",
      "Always On Availability Groups protect databases rather than the whole instance. A primary replica sends log records to secondary replicas; readable secondaries can offload read workloads, and a listener provides a single connection point that follows the primary.",
      "Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous. Automatic failover requires synchronous commit and a healthy WSFC quorum.",
      "Quorum is the mechanism that prevents split-brain: a majority of voting members must agree on cluster ownership. Losing quorum stops the cluster to protect data, which is why witness configuration matters.",
      "Failover can be automatic, manual or forced. Automatic is fastest but requires healthy synchronous replication; forced failover risks data loss and is an emergency measure only.",
      "HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum. An untested HA configuration is a belief — regular failover testing is essential."
    ],
    code: [
      { lang: "sql", body: "-- Availability group health from DMVs\nSELECT ag.name AS ag_name,\n       ar.replica_server_name,\n       ars.synchronization_state_desc,\n       ars.synchronization_health_desc,\n       drs.synchronization_state_desc AS db_sync_state\nFROM   sys.dm_hadr_availability_group_states ags\nJOIN   sys.availability_groups ag ON ag.group_id = ags.group_id\nJOIN   sys.dm_hadr_availability_replica_states ars\n       ON ars.group_id = ag.group_id\nJOIN   sys.availability_replicas ar\n       ON ar.replica_id = ars.replica_id\nJOIN   sys.dm_hadr_database_replica_states drs\n       ON drs.replica_id = ars.replica_id;" },
      { lang: "sql", body: "-- Listener configuration\nSELECT agl.name AS listener_name,\n       agl.ip_configuration_string_from_cluster AS ip_config,\n       agl.port\nFROM   sys.availability_group_listeners agl;" },
      { lang: "powershell", body: "Get-ClusterResource | Select-Object Name,\n  State, Group | Format-Table -AutoSize" }
    ],
    tables: [
      ["Technology", "Protects", "Failover", "FCI", "Whole instance", "Automatic, node-level", "Availability Group", "Databases", "Automatic with sync commit", "Log shipping", "Databases", "Manual, planned"],
      ["Commit mode", "RPO", "Latency", "Synchronous", "Zero", "Higher (wait for secondary)", "Asynchronous", "Possible loss", "Lower"]
    ],
    scenarios: [
      ["The failover that did not happen", "A primary node failed but no automatic failover occurred. Investigation showed the synchronous secondary was out of sync after a network issue, so automatic failover was correctly disabled. The DBA restored replication health and demonstrated a manual failover in the next test window. Understanding the health conditions for automatic failover prevents false assumptions."],
      ["Quorum loss stopped everything", "A two-node cluster lost one node and then the witness, losing quorum; the cluster took the database offline to avoid split-brain. Restoring the witness brought it back. Quorum is a safety feature, and witness placement must be designed deliberately."]
    ],
    interviews: [
      ["What is the difference between an FCI and an Availability Group?", "An FCI protects the whole instance using shared storage with one active node; an AG protects selected databases by replicating log records to secondaries, which can also be readable."],
      ["Why does automatic failover require synchronous commit?", "Because only synchronous commit guarantees the secondary has hardened the same transactions as the primary, so failover does not lose committed data."],
      ["What is quorum and why can losing it stop the database?", "Quorum is the majority requirement that decides which nodes may own the cluster; losing it halts the cluster to prevent two halves from independently owning the same data (split-brain)."]
    ]
  },
  ch17: {
    theme: "disaster recovery technologies",
    vocab: ["Log shipping", "Replication", "DR", "Failover", "Runbook", "Failback"],
    paras: [
      "Disaster recovery protects against site or region loss. The choice of technology is driven by RPO/RTO and budget: backup-and-restore is cheapest with the slowest RTO, while distributed availability groups or geo-replication give near-real-time protection at higher cost and complexity.",
      "Log shipping backs up the transaction log on a primary, copies it to one or more secondaries and restores it there on a schedule. It is simple, robust and well understood, with RTO determined by the restore interval and manual failover steps.",
      "A log-shipping configuration has three jobs per secondary: backup on the primary, copy to the secondary and restore with STANDBY or NORECOVERY. A monitor server can centralise status. Failover is manual and must be rehearsed.",
      "Replication moves data via publication and subscription. Snapshot replication copies a point-in-time copy; transactional replication streams changes; merge replication reconciles changes from multiple sites. Each has distinct conflict and latency characteristics.",
      "Replication agents — snapshot, log reader, distribution and merge — do the work, and their history is the primary monitoring surface. Latency, distribution database growth and agent failures are the common operational concerns.",
      "Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and licensing considerations.",
      "A DR runbook documents the exact steps, contacts, decisions and validation for a disaster. Without it, even good technology fails under the stress of a real incident.",
      "Failback planning and regular DR tests complete the picture: failing over is only half the story — returning to the primary site safely, and proving the whole process in a test, are what make DR real."
    ],
    code: [
      { lang: "sql", body: "-- Log shipping status in msdb\nSELECT primary_server_name, primary_database_name,\n       last_backup_date, last_backup_file,\n       last_copied_file, last_restored_date\nFROM   msdb.dbo.log_shipping_monitor_primary;" },
      { lang: "sql", body: "-- Replication agent status\nSELECT name, status, last_run_outcome, timestamp\nFROM   distribution.dbo.MS_replication_agents;" },
      { lang: "sql", body: "-- Restore a log-shipped database with recovery (failover)\nRESTORE DATABASE SalesDB_DR\nWITH RECOVERY;\n-- then redirect application connections to the DR instance" }
    ],
    tables: [
      ["Technology", "RPO", "RTO", "Complexity", "Backup/restore", "Hours", "Hours", "Low", "Log shipping", "Minutes", "Tens of minutes", "Medium", "Availability Group (async)", "Seconds", "Minutes", "High"],
      ["Replication type", "Direction", "Use case", "Snapshot", "One-way point-in-time", "Small / static data", "Transactional", "One-way near real-time", "Reporting / distribution", "Merge", "Bi-directional", "Disconnected sites"]
    ],
    scenarios: [
      ["The DR test that failed at step three", "A scheduled DR test discovered the secondary's log restore job had been failing for weeks because the backup share path had changed. Failover would have used stale data. The DBA fixed the path, added monitoring on restore lag, and made DR testing a quarterly, documented, timed exercise."],
      ["Replication latency at month end", "A transactional replication subscriber lagged hours behind during a bulk month-end load, and reports showed stale data. The DBA tuned the distribution agent, checked the distribution database size and indexed the published tables. Monitoring latency as a first-class metric prevented surprise."]
    ],
    interviews: [
      ["How does log shipping achieve DR and what are its limits?", "It periodically backs up, copies and restores logs to a secondary, giving a warm standby; failover is manual and RPO/RTO depend on the schedule, and the secondary is usually not readable during restores without STANDBY."],
      ["What is the difference between transactional and merge replication?", "Transactional replication streams changes one-way from publisher to subscribers with low latency; merge replication allows changes at multiple sites and reconciles them, with conflict resolution required."],
      ["Why must DR be tested, not just configured?", "Because configuration drifts, paths change and jobs fail silently; only a timed test proves the runbook works and the RPO/RTO can actually be met under pressure."]
    ]
  },
  ch18: {
    theme: "PowerShell automation for DBAs",
    vocab: ["Cmdlet", "Pipeline", "SMO", "Script", "Report", "Automation"],
    paras: [
      "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications. It is an essential force multiplier in an enterprise estate.",
      "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts. The pipeline passes objects, not text, which makes filtering and formatting powerful and reliable.",
      "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model for administration tasks.",
      "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable. A script that silently continues after an error is worse than one that fails clearly.",
      "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions. Never use a script in production that you have not tested against a non-production instance.",
      "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.",
      "Email notifications close the loop: a report that nobody reads has limited value. Database Mail or SMTP from PowerShell can deliver succinct, actionable alerts.",
      "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts."
    ],
    code: [
      { lang: "powershell", body: "Import-Module SqlServer\n$servers = @('SQL01','SQL02','SQL03')\nforeach ($s in $servers) {\n  $q = \"SELECT name, state_desc FROM sys.databases\"\n  Invoke-Sqlcmd -ServerInstance $s -Query $q |\n    Select-Object @{n='Server';e={$s}}, name, state_desc\n}" },
      { lang: "powershell", body: "$params = @{\n  ServerInstance = 'SQL01'\n  Query          = 'SELECT name FROM sys.databases'\n}\nInvoke-Sqlcmd @params | Format-Table -AutoSize" },
      { lang: "powershell", body: "Get-Service -Name 'MSSQL*','SQLSERVERAGENT' -ComputerName SQL01 |\n  Select-Object Name, Status |\n  Format-Table -AutoSize" }
    ],
    tables: [
      ["Concept", "Purpose", "Example", "Cmdlet", "Single action", "Get-Service", "Pipeline", "Chain objects", "Where-Object", "Splatting", "Pass a parameter hash", "@params"],
      ["Report", "Data source", "Cadence", "Backup status", "msdb backupset", "Daily", "Disk space", "dm_os_volume_stats", "Daily", "Job failures", "sysjobhistory", "Daily"]
    ],
    scenarios: [
      ["The script that ran on production", "A health-check script was copied from a lab and run against production with a cleanup switch left enabled, deleting old backup files. The backup retention policy was restored from the script's dry-run output. The lesson: test on non-production, default to read-only, make destructive actions explicit and require confirmation."],
      ["The 40-server health report", "A DBA manually checked 40 instances each morning until a PowerShell script queried them all in parallel and emailed a single summary with exceptions highlighted. What took an hour became a two-minute review, with better coverage and a saved audit trail."]
    ],
    interviews: [
      ["What is splatting in PowerShell?", "Passing a hashtable of parameters to a cmdlet with @params instead of a long positional command line — it improves readability and avoids fragile backtick line continuations."],
      ["How would you build a multi-server backup status report?", "Loop over the server list (optionally in parallel), use Invoke-Sqlcmd against msdb to get the last backup per database, collect results into objects and export or email a formatted summary, failing loudly on unreachable servers."],
      ["What makes a DBA script safe for production?", "Testing on non-production, defaulting to read-only, explicit destructive switches, try/catch with -ErrorAction Stop, clear logging and idempotent behaviour that checks state before changing it."]
    ]
  },
  ch19: {
    theme: "production incident management",
    vocab: ["Severity", "Incident", "Escalation", "RCA", "Runbook", "Communication"],
    paras: [
      "A production incident is an unplanned event that degrades or stops service. The priority is to restore service first, then find the root cause — investigation during an outage extends the outage.",
      "Severity levels classify impact: Sev1 is a total outage or critical data loss, Sev2 a major degradation, Sev3 a limited impact. Severity drives response time, who is paged and how often stakeholders are updated.",
      "Prioritisation weighs impact and urgency. A high-impact, high-urgency incident gets immediate attention; a low-impact cosmetic issue can wait. Clear severity definitions remove debate during stress.",
      "The response lifecycle is detect, triage, diagnose, mitigate, resolve and review. Triage assigns severity and an owner; mitigation restores service, sometimes with a workaround; the post-incident review prevents recurrence.",
      "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full and connection or login failures.",
      "Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations. Runbooks reduce errors and speed response when adrenaline is high and time is short.",
      "Communication is part of the job. Regular, honest updates to stakeholders — what is known, what is being done, when the next update is — maintain trust and stop others from interrupting the responder.",
      "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates. Blameless culture surfaces the real causes instead of hiding them."
    ],
    code: [
      { lang: "sql", body: "-- Is the instance up, what is slow, and what is blocked?\nSELECT @@SERVERNAME AS server, getdate() AS now;\nSELECT session_id, status, command, blocking_session_id,\n       wait_type, total_elapsed_time\nFROM   sys.dm_exec_requests\nWHERE  session_id > 50\nORDER BY total_elapsed_time DESC;" },
      { lang: "sql", body: "-- Log and volume usage during a full-disk incident\nSELECT name, size / 128 AS size_mb,\n       max_size, growth\nFROM   sys.database_files WHERE type_desc = 'LOG';" },
      { lang: "powershell", body: "Get-Service -Name 'MSSQL*','SQLSERVERAGENT' |\n  Select-Object Name, Status, StartType\nGet-WinEvent -LogName System -MaxEvents 20 |\n  Where-Object { $_.LevelDisplayName -eq 'Error' }\n" }
    ],
    tables: [
      ["Severity", "Definition", "Response", "Sev 1", "Total outage / data loss", "Immediate page, continuous updates", "Sev 2", "Major degradation", "Same hour, frequent updates", "Sev 3", "Limited impact", "Next business day"],
      ["Incident", "First check", "Typical mitigation", "Server down", "Ping, service state", "Failover / restart", "Log full", "Log usage DMV", "Log backup / grow", "Slow DB", "Waits, blocking", "Kill blocker / fix query"]
    ],
    scenarios: [
      ["Transaction log full at 02:00", "Alerts fired as the transaction log hit 100%. The on-call DBA checked and found a failed log-backup job after a recovery-model change. Taking an emergency log backup freed space immediately; the DBA then fixed the job, alerted on log usage at 70% and 85%, and added a check that a FULL-model database has recent log backups. Service was restored in minutes."],
      ["The 30-minute outage that became 90", "A service restart should have taken five minutes, but the team spent 25 minutes debating severity and who should act while users waited. A post-incident review introduced clear severity definitions, a named incident commander and runbooks. The technical fix was fine; the process was the weakness."]
    ],
    interviews: [
      ["What is your priority order during a Sev1 outage?", "Restore service first using the safest tested mitigation, communicate status at a fixed cadence, preserve evidence for later analysis, and only then pursue the deep root cause — extending an outage to investigate is a second failure."],
      ["How do you decide incident severity?", "By impact and urgency against defined levels: total outage or data loss is Sev1, major degradation Sev2, limited impact Sev3 — pre-agreed definitions avoid debate under pressure."],
      ["What should a post-incident report contain?", "A timeline, impact, root cause, contributing factors, what went well and badly, and concrete prevention actions with owners and due dates — written blamelessly so the real causes surface."]
    ]
  },
  ch20: {
    theme: "enterprise DBA operations",
    vocab: ["Estate", "Change", "Patch", "Migration", "SLA", "Compliance"],
    paras: [
      "Enterprise DBA work shifts from single servers to a governed estate of many instances across environments and regions. Scale makes standardisation, automation and documentation essential rather than optional.",
      "Managing multiple instances requires a central inventory: versions, editions, patch levels, owners, databases, sizes and dependencies. Without it, you cannot answer basic questions during an audit or incident.",
      "Environments must stay aligned but distinct. Refreshing test and UAT from production (sanitised) keeps schemas realistic, while access controls ensure only the right people can reach live data.",
      "Change management governs every production change: request, review, approval, scheduled window, implementation and verification. Emergency changes have a fast path but still require recording and retrospective approval.",
      "Patching and upgrades are planned programmes. Cumulative updates, service packs and version upgrades need testing in lower environments, a rollback plan, compatibility checks and a maintenance window.",
      "Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies. Cross-server work must account for logins, linked servers, agent jobs and application connection strings.",
      "Reporting is how an enterprise DBA demonstrates control: health-check, backup-compliance, capacity and performance reports provide evidence for SLAs and audits.",
      "SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations. Daily, weekly and monthly routines keep the estate stable and the evidence current."
    ],
    code: [
      { lang: "sql", body: "-- Estate inventory across a registered server group (run per instance)\nSELECT @@SERVERNAME AS server,\n       SERVERPROPERTY('ProductVersion') AS version,\n       SERVERPROPERTY('Edition') AS edition,\n       name, state_desc, recovery_model_desc\nFROM sys.databases\nORDER BY name;" },
      { lang: "sql", body: "-- Backup compliance across the estate\nSELECT @@SERVERNAME AS server, d.name AS db,\n       d.recovery_model_desc,\n       max(b.backup_finish_date) AS last_full\nFROM sys.databases d\nLEFT JOIN msdb.dbo.backupset b\n  ON b.database_name=d.name AND b.type='D'\nGROUP BY d.name, d.recovery_model_desc;" },
      { lang: "sql", body: "-- Compatibility levels before an upgrade\nSELECT name, compatibility_level\nFROM sys.databases\nWHERE compatibility_level < 150;" }
    ],
    tables: [
      ["Operation", "Cadence", "Evidence", "Health check", "Daily", "Report + exceptions", "Backup compliance", "Daily", "Last backup per DB", "Capacity review", "Weekly / monthly", "Growth trend"],
      ["Change type", "Approval", "Window", "Schema deploy", "Peer review + CAB", "Scheduled", "Patch / CU", "Tested + CAB", "Maintenance", "Emergency fix", "Retrospective", "Immediate"]
    ],
    scenarios: [
      ["The unpatched instance found in an audit", "An audit discovered an instance two cumulative updates behind with a known security vulnerability — nobody knew it existed because it was missing from the inventory. The DBA built a central inventory, a patch baseline and a monthly compliance report, then brought the instance up to date through the change process."],
      ["The migration that forgot the jobs", "A database migrate/refresh succeeded but the application's scheduled exports stopped: agent jobs, logins and linked servers were not part of the database backup. The runbook now includes a server-level object checklist and post-migration smoke tests with the application team."]
    ],
    interviews: [
      ["How do you manage a large SQL Server estate?", "With a central inventory, standard configurations, automated health and compliance reporting, documented change control and runbooks — scale demands consistency and evidence."],
      ["What is the role of change management?", "To ensure every production change is requested, reviewed, approved, scheduled, implemented and verified, with an emergency path that is recorded and retrospectively approved."],
      ["What do you report to demonstrate SLA and compliance?", "Uptime, backup success and restore-test results, RPO/RTO adherence, patch levels, job success rates, capacity trends and open incidents — with evidence retained for auditors."]
    ]
  }
};
