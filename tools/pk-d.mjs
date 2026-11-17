/* Practical knowledge: practical-11 .. practical-12. */

export const P4 = {
  "practical-11": {
    lead: "A capstone incident-response lab: work through eleven realistic production scenarios — service down, log full, disk full, corruption, failed restore, runaway query and more — using a consistent diagnose-mitigate-prevent method.",
    objectives: [
      "Apply a consistent incident-response method",
      "Diagnose eleven common production failure types",
      "Choose safe mitigations that restore service first",
      "Communicate status and severity under pressure",
      "Turn each incident into documented prevention"
    ],
    paras: [
      "This lab is a simulation of real on-call work. For each scenario you will identify symptoms, choose the right first diagnostic, apply a safe mitigation, and record a prevention action — without touching a real production system.",
      "Use your lab instance to reproduce what is safe to reproduce: a full log, a blocking chain, a failed job, a slow query. For destructive scenarios such as corruption, reason through the response using the runbook rather than causing damage.",
      "The priority in any incident is to restore service first and find the root cause second. Investigating during an outage extends the outage. Protect evidence, mitigate safely, then analyse once users are serving again.",
      "The method below is the one to apply to every scenario: classify severity, gather evidence, mitigate, verify recovery, communicate, then document prevention.",
      "Work through the incident catalogue in the table. For each, write the first three queries or commands you would run and the safe mitigation you would choose — speed comes from rehearsal, not improvisation.",
      "A full transaction log is the classic: check log usage, find why it grew (failed log backup, long transaction, recovery model change), take an emergency log backup, then fix the underlying cause and add alerts at 70 and 85 percent.",
      "A runaway query or blocking chain is diagnosed from dm_exec_requests and waits. Identify the head blocker, confirm with the application owner, stop it with approval if needed, then fix the query or index that caused it.",
      "After each scenario, write a short post-incident note: timeline, impact, root cause and one concrete prevention action with an owner. Blameless reviews surface real causes; blame hides them."
    ],
    code: [
      { lang: "sql", body: "-- Generic first-response triage: state, blockers, log, space\nSELECT @@SERVERNAME AS server, getdate() AS now;\nGO\nSELECT session_id, status, command, blocking_session_id,\n       wait_type, total_elapsed_time\nFROM   sys.dm_exec_requests\nWHERE  session_id > 50\nORDER BY total_elapsed_time DESC;\nGO\nSELECT name, size / 128 AS size_mb\nFROM   sys.database_files WHERE type_desc = 'LOG';\nGO" },
      { lang: "powershell", body: "-- Service and recent system errors (run in PowerShell)\nGet-Service -Name 'MSSQL*','SQLSERVERAGENT' |\n  Select-Object Name, Status, StartType | Format-Table -AutoSize\nGet-WinEvent -LogName System -MaxEvents 30 |\n  Where-Object { $_.LevelDisplayName -eq 'Error' } |\n  Select-Object TimeCreated, Id, Message -First 10" },
      { lang: "sql", body: "-- Emergency log backup when the log is full\nBACKUP LOG ProductionDb\nTO DISK = 'D:\\Backups\\ProductionDb_Emergency.trn'\nWITH COMPRESSION, STATS = 10;\nGO\n-- Confirm log space is reclaimed\nSELECT used_log_space_in_percent\nFROM   sys.dm_db_log_space_usage;\nGO\n-- Ensure a FULL-model database has recent log backups\nSELECT d.name, max(b.backup_finish_date) AS last_log\nFROM   sys.databases d\nLEFT JOIN msdb.dbo.backupset b\n  ON b.database_name=d.name AND b.type='L'\nWHERE  d.recovery_model_desc = 'FULL'\nGROUP BY d.name;\nGO" }
    ],
    tables: [
      ["Scenario", "First diagnostic", "Safe mitigation", "Service down", "Ping, Get-Service, error log", "Start service / failover", "Log full", "dm_db_log_space_usage", "Emergency log backup", "Disk full", "dm_os_volume_stats", "Free space / move file / grow", "Corruption", "Error log, CHECKDB", "Page restore from backup"],
      ["Scenario", "First diagnostic", "Safe mitigation", "Failed restore", "msdb backupset history", "Correct sequence / verify backup", "Blocking storm", "dm_exec_requests", "Stop head blocker with approval", "Runaway query", "Query stats + plan", "Kill with approval, fix query", "Login failure", "Error log, sys.server_principals", "Unlock / reset / firewall"],
      ["Severity", "Definition", "Response", "Sev 1", "Total outage or data loss", "Immediate page, continuous updates", "Sev 2", "Major degradation", "Same hour, frequent updates", "Sev 3", "Limited impact", "Next business day"]
    ],
    diagram: { label: "Incident response method", caption: "Classify, gather evidence, mitigate safely, verify, communicate, then prevent recurrence.", nodes: ["Classify severity", "Gather evidence (DMVs / logs)", "Mitigate to restore service", "Verify recovery", "Communicate + blameless review"] },
    steps: [
      "Write the severity definitions (Sev 1 to 3) and decide who is paged for each.",
      "For 'service down', list ping, Get-Service and error-log checks, then a failover or start action.",
      "For 'log full', run the log-usage query, reproduce a small growth, take an emergency log backup and confirm reclaimed space.",
      "For 'disk full', use dm_os_volume_stats to find the mount point and list safe options to free or add space.",
      "For 'corruption', reason through error 824, CHECKDB and page restore using the integrity lab — do not create real corruption.",
      "For 'failed restore', check msdb backupset history and identify a broken chain or wrong NORECOVERY sequence.",
      "For 'blocking storm', reproduce the lab scenario and practise finding and stopping the head blocker.",
      "For 'runaway query', use query stats and a plan to identify the expensive operator and mitigation.",
      "For each of the eleven scenarios, write a short post-incident note with a prevention action and owner.",
      "Assemble your notes into a personal incident runbook you can use on call."
    ],
    scenario: ["The 02:00 log-full call and the 30-minute debate", "At 02:00 alerts fired as the transaction log hit 100%. An emergency log backup freed space in minutes; the real cause was a failed log-backup job after a recovery-model change. The team had spent the previous incident's first 25 minutes debating severity and who should act, so this time a named incident commander and clear severity definitions got the right person moving immediately. The technical fix was simple; the process discipline was what reduced the outage. Every scenario in this lab ends with that same question: what prevention action stops this recurring?"],
    interview: [
      ["What is your priority order during a Sev 1 outage?", "Restore service first with the safest tested mitigation, communicate status at a fixed cadence, preserve evidence, and only then pursue deep root cause — extending an outage to investigate is a second failure."],
      ["How do you decide incident severity?", "By impact and urgency against defined levels: total outage or data loss is Sev1, major degradation Sev2, limited impact Sev3. Pre-agreed definitions remove debate under pressure."],
      ["What should a post-incident report contain?", "A timeline, impact, root cause, contributing factors, what went well and badly, and concrete prevention actions with owners and due dates — written blamelessly so real causes surface."]
    ],
    takeaways: [
      "Restore service first; root-cause analysis comes after recovery",
      "Severity definitions and a named commander remove debate under pressure",
      "Match each failure type to a small, rehearsed set of first diagnostics",
      "Mitigations must be safe and reversible — avoid making an incident worse",
      "Every incident ends with a documented prevention action and owner"
    ]
  },

  "practical-12": {
    lead: "The final project: build a complete small DBA administration environment from scratch — a documented database, a tested backup and DR strategy, monitoring and alerting, maintenance jobs and a set of runbooks you can show an employer.",
    objectives: [
      "Design and document a small production-like database environment",
      "Implement and test a full backup and DR strategy",
      "Deploy monitoring, alerts and a daily health report",
      "Schedule routine maintenance through SQL Server Agent",
      "Produce runbooks and evidence of recovery objectives"
    ],
    paras: [
      "This is the integrating project for the whole roadmap. You will combine storage, security, backup, monitoring, performance and automation into one coherent environment that demonstrates end-to-end DBA competence.",
      "Define scope first: one or two databases on a local instance, a named business owner, stated RPO and RTO, and a set of service levels. Every later decision should trace back to these requirements.",
      "The project flows through the phases below. Treat it like a real engagement: design, implement, test, document, then present evidence. A solution without evidence of testing is only a claim.",
      "Start with the database itself: sensible files and filegroups, a documented schema, constraints, indexes and a least-privilege security model with roles and mapped users. Record the design in a short architecture document.",
      "Implement the backup strategy derived from your RPO/RTO: full, differential and log backups, compression and checksums, retention, and off-site copies. Then prove it with a documented point-in-time restore to a new database.",
      "Add monitoring: a daily health-check script, alerts for log and disk usage, failed-job notifications and an operator. Schedule maintenance jobs for integrity checks, statistics and index maintenance with sensible thresholds.",
      "Finally, document everything: an environment inventory, a restore runbook, an incident runbook, a DR plan with failover and failback steps, and the results of your restore and DR tests. This portfolio is what turns lab work into demonstrable experience."
    ],
    code: [
      { lang: "sql", body: "-- 1. Baseline configuration and inventory\nSELECT @@SERVERNAME AS server,\n       SERVERPROPERTY('ProductVersion') AS version,\n       SERVERPROPERTY('Edition') AS edition;\nGO\nSELECT name, state_desc, recovery_model_desc,\n       compatibility_level\nFROM   sys.databases\nWHERE  name NOT IN ('master','model','msdb','tempdb')\nORDER BY name;\nGO\nSELECT name, value_in_use\nFROM   sys.configurations\nWHERE  name IN ('max server memory (MB)','max degree of parallelism');\nGO" },
      { lang: "sql", body: "-- 2. Backup policy evidence for every user database\nSELECT d.name AS db, d.recovery_model_desc,\n       max(CASE WHEN b.type='D' THEN b.backup_finish_date END) AS last_full,\n       max(CASE WHEN b.type='I' THEN b.backup_finish_date END) AS last_diff,\n       max(CASE WHEN b.type='L' THEN b.backup_finish_date END) AS last_log\nFROM   sys.databases d\nLEFT JOIN msdb.dbo.backupset b ON b.database_name = d.name\nWHERE  d.name NOT IN ('master','model','msdb','tempdb')\nGROUP BY d.name, d.recovery_model_desc\nORDER BY d.name;\nGO" },
      { lang: "sql", body: "-- 3. Final verification: integrity, jobs and space\nDBCC CHECKDB ('PortfolioDb') WITH NO_INFOMSGS;\nGO\nSELECT j.name, h.run_status, h.run_date\nFROM   msdb.dbo.sysjobs j\nJOIN   msdb.dbo.sysjobhistory h ON j.job_id=h.job_id\nWHERE  h.run_status = 0\nORDER BY h.run_date DESC;\nGO\nSELECT DISTINCT vs.volume_mount_point,\n       vs.available_bytes / 1073741824 AS free_gb\nFROM sys.master_files f\nCROSS APPLY sys.dm_os_volume_stats(f.database_id, f.file_id) vs;\nGO" }
    ],
    tables: [
      ["Deliverable", "Evidence to show", "Success criterion", "Design doc", "Architecture diagram + schema", "RPO/RTO stated", "Backup policy", "Backupset history query", "Recent full + log backups", "Restore test", "Recovered DB + row counts", "Meets RPO/RTO", "Runbooks", "Restore + incident docs", "Another DBA could follow them"],
      ["Phase", "Activities", "Output", "Design", "Files, schema, security, RPO/RTO", "Architecture document", "Implement", "Backups, jobs, alerts, maintenance", "Configured environment", "Test", "Point-in-time restore, DR walkthrough", "Evidence pack", "Document", "Runbooks and inventory", "Portfolio"]
    ],
    diagram: { label: "Final project phases", caption: "Design, implement, test and document — then present evidence of meeting the objectives.", nodes: ["Design (RPO/RTO, schema, security)", "Implement (backup, monitoring, jobs)", "Test (restore + DR walkthrough)", "Document (runbooks, inventory)", "Present evidence pack"] },
    steps: [
      "Write a one-page design document: purpose, owner, RPO, RTO, environment and architecture diagram.",
      "Create PortfolioDb with deliberate filegroups, a documented schema, constraints and least-privilege roles.",
      "Configure full, differential and log backups with compression and checksums, plus a retention policy.",
      "Perform a documented point-in-time restore to PortfolioDb_Recover and record the steps and row counts.",
      "Build and schedule a daily health-check script covering space, backups, jobs, waits and blocking.",
      "Configure an operator and failure notifications for the critical jobs.",
      "Schedule maintenance jobs: DBCC CHECKDB, statistics updates and threshold-based index maintenance.",
      "Write a restore runbook another DBA could follow without guessing, including paths and permissions.",
      "Write an incident runbook and a DR plan covering failover and failback steps.",
      "Assemble an evidence pack: design doc, backup history, restore results, job history and runbooks — then review it as if presenting to an employer."
    ],
    scenario: ["The portfolio that answered every interview question", "A candidate presented a small but complete DBA environment: a documented schema, a backup policy with evidence of a point-in-time restore, scheduled health reports and clear runbooks. When asked how they would handle a full transaction log, they walked through the exact diagnostic query and safe mitigation they had rehearsed in their own lab. The depth came not from the size of the environment but from having implemented, tested and documented every part of it — the difference between knowing about DBA work and having done it."],
    interview: [
      ["What demonstrates DBA competence better than a list of features?", "Evidence: a designed environment, a tested backup and restore with recorded results, monitoring that has been configured and read, and runbooks someone else could follow. Implementation and proof beat vocabulary."],
      ["How do RPO and RTO drive the whole design?", "They set the backup frequency, recovery model, HA/DR choice, storage tier and monitoring thresholds. Every technical decision should trace back to what the business can tolerate for data loss and downtime."],
      ["Why are runbooks part of a DBA's deliverable?", "Because systems must be supportable by someone other than their author, especially at 3 a.m. Runbooks reduce errors, preserve knowledge and turn individual skill into repeatable organisational capability."]
    ],
    takeaways: [
      "Start with requirements: RPO, RTO and ownership drive every design decision",
      "Integrate the whole roadmap: storage, security, backup, monitoring, performance, automation",
      "Proof beats claims — record restore tests, job history and health reports",
      "Runbooks make the environment supportable by anyone on the team",
      "The finished portfolio is evidence of practice, not just knowledge"
    ]
  }
};
