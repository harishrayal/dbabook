/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch05-11.html */

window.TOPIC = {
  id: "ch05-11",
  title: "SQL Server Agent",

  lead: "SQL Server Agent is the instance's automation engine — backups, maintenance, ETL, alerts, and notifications all run through its jobs, which makes it the first service you check when something did not happen overnight.",

  objectives: [
    "Explain what SQL Server Agent is and what it owns",
    "Describe the anatomy of a job: steps, schedules, notifications",
    "Secure Agent work with roles and proxies",
    "Configure alerts and operator notifications",
    "Diagnose failed jobs from msdb history"
  ],

  sections: [
    {
      h: "What the Agent is",
      html: `
<p>The <strong>SQL Server Agent</strong> is a separate Windows service that runs alongside the engine and stores its configuration in the <strong>msdb</strong> database. It executes scheduled and event-driven work:</p>
<table>
  <tr><th>Object</th><th>Lives in</th><th>What it does</th></tr>
  <tr><td><strong>Job</strong></td><td>msdb</td><td>A named container of steps executed as a unit</td></tr>
  <tr><td><strong>Job step</strong></td><td>msdb</td><td>One action: T-SQL batch, CmdExec, PowerShell, SSIS package, alert…</td></tr>
  <tr><td><strong>Schedule</strong></td><td>msdb</td><td>When a job runs: one-off, recurring, or on CPU idle</td></tr>
  <tr><td><strong>Operator</strong></td><td>msdb</td><td>Who gets notified — email, pager, or net send address</td></tr>
  <tr><td><strong>Alert</strong></td><td>msdb</td><td>Event trigger: error number, severity, performance counter, WMI</td></tr>
  <tr><td><strong>Proxy</strong></td><td>msdb</td><td>Credentials a step runs under when it leaves the engine</td></tr>
</table>
<p>Without the Agent service, none of it runs: no backups, no log shipping, no index maintenance, no data freshness checks. This is why “is the Agent running?” appears in every morning health check.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="SQL Server Agent job pipeline">
    <defs>
      <marker id="job-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="20" y="40" width="150" height="80" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="95" y="68" text-anchor="middle" fill="var(--accent-strong)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Trigger</text>
    <text x="95" y="90" text-anchor="middle" fill="var(--text)" font-size="11.5" font-family="Segoe UI, sans-serif">schedule · alert</text>
    <text x="95" y="108" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">manual start</text>

    <rect x="200" y="40" width="160" height="80" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="280" y="68" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Job</text>
    <text x="280" y="90" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">step 1 → step 2 → …</text>
    <text x="280" y="108" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">go to next / quit on failure</text>

    <rect x="385" y="40" width="170" height="80" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="470" y="68" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Step execution</text>
    <text x="470" y="90" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">T-SQL · CmdExec · PS</text>
    <text x="470" y="108" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">SSIS · proxy credentials</text>

    <rect x="580" y="40" width="160" height="80" rx="10" fill="var(--accent)" stroke="var(--accent-strong)"/>
    <text x="660" y="68" text-anchor="middle" fill="#ffffff" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Outcome</text>
    <text x="660" y="90" text-anchor="middle" fill="#dbeafe" font-size="11.5" font-family="Segoe UI, sans-serif">success · failure</text>
    <text x="660" y="108" text-anchor="middle" fill="#dbeafe" font-size="11.5" font-family="Segoe UI, sans-serif">history in msdb</text>

    <rect x="200" y="180" width="355" height="76" rx="10" fill="var(--surface)" stroke="var(--amber)" stroke-width="1.8"/>
    <text x="377" y="208" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Notifications</text>
    <text x="377" y="230" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">On success / On failure / Always → operator (email, net send)</text>
    <text x="377" y="248" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">plus job history and the msdb write-log option</text>

    <rect x="580" y="180" width="160" height="76" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="660" y="208" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Operator</text>
    <text x="660" y="230" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">DBA on-call</text>
    <text x="660" y="248" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">mailbox · paging</text>

    <line x1="170" y1="80" x2="198" y2="80" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#job-arrow)"/>
    <line x1="360" y1="80" x2="383" y2="80" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#job-arrow)"/>
    <line x1="555" y1="80" x2="578" y2="80" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#job-arrow)"/>
    <line x1="660" y1="120" x2="660" y2="178" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#job-arrow)"/>
    <line x1="555" y1="215" x2="578" y2="215" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#job-arrow)"/>
    <line x1="470" y1="120" x2="420" y2="178" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#job-arrow)"/>

    <text x="380" y="300" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">A job without notifications is a job that fails silently — the most common Agent anti-pattern.</text>
    <text x="380" y="325" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">History is capped: without external monitoring, “why did it fail last month?” becomes unanswerable.</text>
  </svg>
  <div class="figcaption">Figure 1 — The Agent job pipeline: trigger, job steps, outcome, notification to an operator.</div>
</div>
`
    },
    {
      h: "Job steps and how they run",
      html: `
<p>Each step declares a <strong>subsystem</strong> that decides the execution context and what a failure means:</p>
<table>
  <tr><th>Subsystem</th><th>Runs</th><th>Typical use</th></tr>
  <tr><td><strong>T-SQL</strong></td><td>Inside the connected database</td><td>Maintenance, data fixes, reindexing</td></tr>
  <tr><td><strong>CmdExec</strong></td><td>OS command under a proxy account</td><td>File copies, bcp, external tools</td></tr>
  <tr><td><strong>PowerShell</strong></td><td>PowerShell under a proxy</td><td>Orchestration, Azure/API calls</td></tr>
  <tr><td><strong>SSIS Package</strong></td><td>Integration Services catalog</td><td>ETL loads</td></tr>
  <tr><td><strong>Operating-system (XP)</strong></td><td>Legacy extended procedures</td><td>Avoid in new work</td></tr>
</table>
<p>Steps chain by outcome: <strong>quit with failure</strong> (stop the job), <strong>quit with success</strong> (finish), or <strong>go to the next step</strong>. Design principle: each step should be <strong>restartable</strong> — if step 4 fails at 2 AM and you re-run the job, step 1 must not corrupt anything by running twice. Idempotent steps plus explicit “go to next step” logic are what make a job safe to retry.</p>
<p>Set a sensible <strong>retry count and retry interval</strong> for transient failures (deadlocks, brief connectivity blips), but never as a substitute for fixing a real error — retries without alerts just delay the notification.</p>
`
    },
    {
      h: "Security: roles and proxies",
      html: `
<p>Agent work runs with real privileges; control who can create it and what it can touch:</p>
<table>
  <tr><th>Mechanism</th><th>Scope</th><th>Notes</th></tr>
  <tr><td><strong>msdb fixed roles</strong></td><td>Who can see, operate, or administer jobs</td><td>SQLAgentUserRole (create own jobs), SQLAgentOperatorRole (all jobs + alerts), SQLAgentSysAdmin (full control)</td></tr>
  <tr><td><strong>Proxies</strong></td><td>What a CmdExec/PowerShell step runs as</td><td>Credential stored in msdb, granted to specific subsystems and logins</td></tr>
  <tr><td><strong>Run-as account</strong></td><td>T-SQL steps</td><td>Execute as a login only when cross-database rights are needed</td></tr>
  <tr><td><strong>sa / sysadmin</strong></td><td>Legacy jobs often run as sa</td><td>Red flag: replace with least-privilege proxies</td></tr>
</table>
<p>Audit this quarterly: list job steps running as <code>sa</code> or as <code>NT SERVICE\SQLAgent</code> with domain-wide rights, and check proxy accounts that are granted to more logins than necessary. Jobs are an application with privileges — treat them like one.</p>
`
    },
    {
      h: "Alerts, operators, and notifications",
      html: `
<p>Notifications turn a silent failure into a page. Configure three layers:</p>
<table>
  <tr><th>Layer</th><th>What it catches</th><th>Configuration</th></tr>
  <tr><td><strong>Job outcome notifications</strong></td><td>This job failed / succeeded</td><td>Job → Notifications → On failure → operator</td></tr>
  <tr><td><strong>Database error alerts</strong></td><td>Error 823/824/825, severity 16+, corruption messages</td><td>SQL Server Agent alert on error number or severity</td></tr>
  <tr><td><strong>Staleness checks</strong></td><td>Job “succeeded” but produced nothing</td><td>A check job asserting row counts / max timestamps, alerting on failure</td></tr>
</table>
<p>Two disciplines make this work in practice:</p>
<ul>
  <li><strong>Every production job gets an On-failure notification</strong> to a monitored operator — never to an individual's unmonitored mailbox</li>
  <li><strong>Alert on symptoms users will feel</strong>: a job that succeeded while writing zero rows still deserves an alert, which is why data-freshness checks outperform raw job-status alerts</li>
</ul>
<p>Verify the plumbing with a deliberate test failure. An untested notification path is an assumption — and assumptions fail at 2 AM.</p>
`
    },
    {
      h: "Diagnosing job failures",
      html: `
<p>The history lives in msdb. These two queries answer 90 % of “what happened last night?”:</p>
<pre><code class="language-sql">-- Job-level outcomes (step_id = 0) that failed, most recent first
-- run_date is yyyymmdd, run_time is hhmmss — integers, not datetimes
SELECT j.name                                    AS job_name,
       h.run_date, h.run_time, h.run_status,      -- 0 = failed, 1 = succeeded,
       LEFT(h.message, 300)   AS message           -- 2 = in progress, 3 = cancelled
FROM   msdb.dbo.sysjobhistory h
JOIN   msdb.dbo.sysjobs j ON j.job_id = h.job_id
WHERE  h.step_id = 0
AND    h.run_status = 0
ORDER  BY h.run_date DESC, h.run_time DESC;

-- The failing step itself: which subsystem, which error
SELECT j.name AS job_name, s.step_id, s.step_name, s.subsystem, s.database_name,
       h.run_status, LEFT(h.message, 500) AS message
FROM   msdb.dbo.sysjobsteps s
JOIN   msdb.dbo.sysjobs j ON j.job_id = s.job_id
JOIN   msdb.dbo.sysjobhistory h ON h.job_id = s.job_id AND h.step_id = s.step_id
WHERE  h.run_status = 0
ORDER  BY h.run_date DESC, h.run_time DESC;</code></pre>
<p>Useful companions: <code>msdb.dbo.sp_help_job</code> for definition and schedule, <code>msdb.dbo.sp_start_job</code> to re-run after a fix, and <code>sp_update_job</code> to attach notifications. Also check whether history has simply been purged — default retention (all history deleted after 30 days, or capped at 1,000 rows per job) can erase the evidence you need.</p>
`
    }
  ],

  scenario: {
    title: "The nightly ETL job had been failing for six days — nobody knew",
    html: `
<p>On a Monday at 09:15 the finance team reported that yesterday's figures were missing from the dashboard. Investigation showed the nightly ETL job had failed at step 2 (an SSIS package) every night for six days: a service account password rotation had broken its proxy credential. The job had no On-failure notification, its operator record pointed to a departed employee's mailbox, and job history had been purged down to the last seven days — so nothing surfaced until a human noticed stale data.</p>
<p>Resolution: restore the proxy credential from the password vault, re-run the job, backfill the missing days from source, then harden the whole Agent estate — On-failure notifications to a shared on-call operator, a data-freshness check job asserting the dashboard's max load timestamp, and alerting on job outcome from the monitoring platform rather than relying on Agent history alone. Prevention: no production job may exist without an owner and a notification path, proxies are registered in the secret-rotation process, and a weekly query lists jobs with no operator assigned.</p>
`
  },

  interview: [
    {
      q: "Where does SQL Server Agent store its configuration?",
      a: "In the msdb database: jobs, steps, schedules, operators, alerts, proxies, and execution history all live in msdb system tables (sysjobs, sysjobsteps, sysjobschedules, sysoperators, sysalerts). That is why msdb is part of every backup and restore strategy — losing it loses your automation."
    },
    {
      q: "A job shows “succeeded” but the business says the data is missing. What do you check?",
      a: "Whether the job actually did work: step-level history for row counts, the downstream check (max timestamp, expected row counts), and any step configured to go to next step on error. Success only proves the steps returned zero — pair job outcomes with a data-freshness assertion that fails when nothing loaded."
    },
    {
      q: "How do you find out why a job failed last night?",
      a: "Query msdb: join sysjobhistory to sysjobs filtering step_id = 0 for job outcome, then the step-level row for the failing step's message and subsystem. Check that history retention has not purged the rows, and cross-check the SQL Server error log around the run time for engine-side errors."
    }
  ],

  takeaways: [
    "The Agent service runs all scheduled automation; its objects and history live in msdb",
    "A job is steps chained by outcome, triggered by schedules or alerts, with restartable design",
    "Secure Agent work with msdb roles and proxy accounts — audit for steps running as sa",
    "Every production job needs an On-failure notification to a monitored operator, plus freshness checks",
    "Diagnose from sysjobhistory/sysjobsteps — and protect history retention before you need it"
  ]
};
