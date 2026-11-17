/* Practical content file — one JS file per practical lab.
   Rendered by assets/js/site.js on practicals/practical-12.html */

window.TOPIC = {
  id: "practical-12",
  title: "DBA Final Project",

  lead: "The final project: build a complete small DBA administration environment from scratch — a documented database, a tested backup and DR strategy, monitoring and alerting, maintenance jobs and a set of runbooks you can show an employer.",

  objectives: [
    "Design and document a small production-like database environment",
    "Implement and test a full backup and DR strategy",
    "Deploy monitoring, alerts and a daily health report",
    "Schedule routine maintenance through SQL Server Agent",
    "Produce runbooks and evidence of recovery objectives"
  ],

  sections: [
    {
      h: "Before you start",
      html: `
<p>This is the integrating project for the whole roadmap. You will combine storage, security, backup, monitoring, performance and automation into one coherent environment that demonstrates end-to-end DBA competence.</p>
<p>Define scope first: one or two databases on a local instance, a named business owner, stated RPO and RTO, and a set of service levels. Every later decision should trace back to these requirements.</p>
<p><strong>Environment check</strong> — confirm where you are before changing anything; this habit prevents production mistakes:</p>
<pre><code class="language-sql">-- Lab step
-- 1. Baseline configuration and inventory
SELECT @@SERVERNAME AS server,
       SERVERPROPERTY('ProductVersion') AS version,
       SERVERPROPERTY('Edition') AS edition;
GO
SELECT name, state_desc, recovery_model_desc,
       compatibility_level
FROM   sys.databases
WHERE  name NOT IN ('master','model','msdb','tempdb')
ORDER BY name;
GO
SELECT name, value_in_use
FROM   sys.configurations
WHERE  name IN ('max server memory (MB)','max degree of parallelism');
GO</code></pre>
      `,
    },
    {
      h: "Lab architecture",
      html: `
<p>The project flows through the phases below. Treat it like a real engagement: design, implement, test, document, then present evidence. A solution without evidence of testing is only a claim.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Final project phases">
    <defs>
      <marker id="pa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="200" y="10" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="31" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Design (RPO/RTO, schema, security)</text>
    <line x1="380" y1="54" x2="380" y2="64" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="64" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="85" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Implement (backup, monitoring, jobs)</text>
    <line x1="380" y1="108" x2="380" y2="118" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="118" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="139" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Test (restore + DR walkthrough)</text>
    <line x1="380" y1="162" x2="380" y2="172" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="172" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="193" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Document (runbooks, inventory)</text>
    <line x1="380" y1="216" x2="380" y2="226" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="226" width="360" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)"/>
    <text x="380" y="247" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Present evidence pack</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Final project phases</text>
  </svg>
  <div class="figcaption">Figure 1 — Design, implement, test and document — then present evidence of meeting the objectives.</div>
</div>
<p>Start with the database itself: sensible files and filegroups, a documented schema, constraints, indexes and a least-privilege security model with roles and mapped users. Record the design in a short architecture document.</p>
      `,
    },
    {
      h: "Core tasks",
      html: `
<p>Implement the backup strategy derived from your RPO/RTO: full, differential and log backups, compression and checksums, retention, and off-site copies. Then prove it with a documented point-in-time restore to a new database.</p>
<table>
  <tr><th>Deliverable</th><th>Evidence to show</th><th>Success criterion</th></tr>
  <tr><td>Design doc</td><td>Architecture diagram + schema</td><td>RPO/RTO stated</td></tr>
  <tr><td>Backup policy</td><td>Backupset history query</td><td>Recent full + log backups</td></tr>
  <tr><td>Restore test</td><td>Recovered DB + row counts</td><td>Meets RPO/RTO</td></tr>
  <tr><td>Runbooks</td><td>Restore + incident docs</td><td>Another DBA could follow them</td></tr>
</table>
<p>Add monitoring: a daily health-check script, alerts for log and disk usage, failed-job notifications and an operator. Schedule maintenance jobs for integrity checks, statistics and index maintenance with sensible thresholds.</p>
<pre><code class="language-sql">-- Lab step
-- 2. Backup policy evidence for every user database
SELECT d.name AS db, d.recovery_model_desc,
       max(CASE WHEN b.type='D' THEN b.backup_finish_date END) AS last_full,
       max(CASE WHEN b.type='I' THEN b.backup_finish_date END) AS last_diff,
       max(CASE WHEN b.type='L' THEN b.backup_finish_date END) AS last_log
FROM   sys.databases d
LEFT JOIN msdb.dbo.backupset b ON b.database_name = d.name
WHERE  d.name NOT IN ('master','model','msdb','tempdb')
GROUP BY d.name, d.recovery_model_desc
ORDER BY d.name;
GO</code></pre>
      `,
    },
    {
      h: "Verify your work",
      html: `
<p>Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:</p>
<pre><code class="language-sql">-- Lab step
-- 3. Final verification: integrity, jobs and space
DBCC CHECKDB ('PortfolioDb') WITH NO_INFOMSGS;
GO
SELECT j.name, h.run_status, h.run_date
FROM   msdb.dbo.sysjobs j
JOIN   msdb.dbo.sysjobhistory h ON j.job_id=h.job_id
WHERE  h.run_status = 0
ORDER BY h.run_date DESC;
GO
SELECT DISTINCT vs.volume_mount_point,
       vs.available_bytes / 1073741824 AS free_gb
FROM sys.master_files f
CROSS APPLY sys.dm_os_volume_stats(f.database_id, f.file_id) vs;
GO</code></pre>
<p>Finally, document everything: an environment inventory, a restore runbook, an incident runbook, a DR plan with failover and failback steps, and the results of your restore and DR tests. This portfolio is what turns lab work into demonstrable experience.</p>
<p>If the output differs, stop and correct it before moving on. A lab that 'looks right' but was never verified teaches the wrong lessons.</p>
      `,
    },
    {
      h: "Pitfalls and safe practice",
      html: `
<p>undefined</p>
<table>
  <tr><th>Phase</th><th>Activities</th><th>Output</th></tr>
  <tr><td>Design</td><td>Files, schema, security, RPO/RTO</td><td>Architecture document</td></tr>
  <tr><td>Implement</td><td>Backups, jobs, alerts, maintenance</td><td>Configured environment</td></tr>
  <tr><td>Test</td><td>Point-in-time restore, DR walkthrough</td><td>Evidence pack</td></tr>
  <tr><td>Document</td><td>Runbooks and inventory</td><td>Portfolio</td></tr>
</table>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.</p>
</div>
      `,
    }
  ],

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

  scenario: {
    title: "The portfolio that answered every interview question",
    html: `
A candidate presented a small but complete DBA environment: a documented schema, a backup policy with evidence of a point-in-time restore, scheduled health reports and clear runbooks. When asked how they would handle a full transaction log, they walked through the exact diagnostic query and safe mitigation they had rehearsed in their own lab. The depth came not from the size of the environment but from having implemented, tested and documented every part of it — the difference between knowing about DBA work and having done it.
<p><strong>The lesson:</strong> practise both the diagnosis and the safe mitigation in this lab. Under pressure, the steps you have rehearsed are the steps you will actually take — build good muscle memory now.</p>
    `,
  },

  interview: [
    {
      q: "What demonstrates DBA competence better than a list of features?",
      a: `
Evidence: a designed environment, a tested backup and restore with recorded results, monitoring that has been configured and read, and runbooks someone else could follow. Implementation and proof beat vocabulary.
      `,
    },
    {
      q: "How do RPO and RTO drive the whole design?",
      a: `
They set the backup frequency, recovery model, HA/DR choice, storage tier and monitoring thresholds. Every technical decision should trace back to what the business can tolerate for data loss and downtime.
      `,
    },
    {
      q: "Why are runbooks part of a DBA's deliverable?",
      a: `
Because systems must be supportable by someone other than their author, especially at 3 a.m. Runbooks reduce errors, preserve knowledge and turn individual skill into repeatable organisational capability.
      `,
    }
  ],

  takeaways: [
    "Start with requirements: RPO, RTO and ownership drive every design decision",
    "Integrate the whole roadmap: storage, security, backup, monitoring, performance, automation",
    "Proof beats claims — record restore tests, job history and health reports",
    "Runbooks make the environment supportable by anyone on the team",
    "The finished portfolio is evidence of practice, not just knowledge"
  ]
};
