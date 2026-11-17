/* Practical content file — one JS file per practical lab.
   Rendered by assets/js/site.js on practicals/practical-05.html */

window.TOPIC = {
  id: "practical-05",
  title: "SQL Server Agent",

  lead: "A hands-on SQL Server Agent lab: create jobs with multiple steps and schedules, configure operators and notifications, investigate job failures, and automate a maintenance task safely.",

  objectives: [
    "Create a multi-step job with a clear success/failure flow",
    "Attach a schedule and verify it fires",
    "Configure an operator and failure notification",
    "Investigate failed steps with job history",
    "Assign safe job ownership and proxies"
  ],

  sections: [
    {
      h: "Before you start",
      html: `
<p>This lab turns the Agent from a black box into a tool you can inspect and trust. You will build a job, watch it run, deliberately make a step fail, and then diagnose the failure from msdb.</p>
<p>Confirm the SQL Server Agent service is running first. If it is stopped, none of your jobs will ever execute and the symptoms look identical to a broken schedule.</p>
<p><strong>Environment check</strong> — confirm where you are before changing anything; this habit prevents production mistakes:</p>
<pre><code class="language-sql">-- Lab step
-- Is Agent running and set to start automatically?
SELECT servicename, status_desc, startup_type_desc
FROM   sys.dm_server_services
WHERE  servicename LIKE '%Agent%';
GO
-- Scratch log table for the job to write to
CREATE TABLE dbo.AgentLabLog
(
  id        int IDENTITY(1,1) PRIMARY KEY,
  ran_at    datetime2(0) NOT NULL DEFAULT SYSDATETIME(),
  step_note nvarchar(100) NOT NULL
);
GO</code></pre>
      `,
    },
    {
      h: "Lab architecture",
      html: `
<p>A job is a container of steps; each step can run T-SQL, PowerShell, SSIS or a command. Steps execute in order and the outcome of each controls what runs next — that is how you build branching maintenance workflows.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="SQL Server Agent job lifecycle">
    <defs>
      <marker id="pa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="200" y="10" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="31" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Create job and steps</text>
    <line x1="380" y1="54" x2="380" y2="64" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="64" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="85" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Attach schedule</text>
    <line x1="380" y1="108" x2="380" y2="118" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="118" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="139" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Agent service executes job</text>
    <line x1="380" y1="162" x2="380" y2="172" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="172" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="193" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Steps run in order</text>
    <line x1="380" y1="216" x2="380" y2="226" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="226" width="360" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)"/>
    <text x="380" y="247" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. History + notification record result</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">SQL Server Agent job lifecycle</text>
  </svg>
  <div class="figcaption">Figure 1 — Define job, add steps, attach a schedule, execute, then read history to verify and diagnose.</div>
</div>
<p>The flow below shows the lifecycle you will exercise: create job, add steps, set a schedule, run it, then read the history to verify and diagnose.</p>
      `,
    },
    {
      h: "Core tasks",
      html: `
<p>Create a job with one T-SQL step that writes a timestamp into a log table, and a second step that checks the row count. Set step two to run only if step one succeeds — the default flow for dependent steps.</p>
<table>
  <tr><th>Concept</th><th>Meaning</th><th>Where to check</th></tr>
  <tr><td>Job</td><td>Unit of automated work</td><td>msdb.dbo.sysjobs</td></tr>
  <tr><td>Step</td><td>A single task in a job</td><td>sysjobsteps</td></tr>
  <tr><td>Schedule</td><td>When the job runs</td><td>sysschedules</td></tr>
</table>
<p>Attach a schedule that runs every minute for a short test window, then disable it once you have observed a few executions. Leaving test schedules enabled is a common source of surprise load.</p>
<pre><code class="language-sql">-- Lab step
EXEC msdb.dbo.sp_add_job
  @job_name = N'AgentLab_Heartbeat';
GO
EXEC msdb.dbo.sp_add_jobstep
  @job_name = N'AgentLab_Heartbeat',
  @step_name = N'Write heartbeat',
  @subsystem = N'TSQL',
  @command = N'INSERT dbo.AgentLabLog (step_note) VALUES (N''heartbeat'');',
  @on_success_action = 3;
GO
EXEC msdb.dbo.sp_add_schedule
  @schedule_name = N'Every minute (lab)',
  @freq_type = 4, @freq_interval = 1,
  @freq_subday_type = 4, @freq_subday_interval = 1;
GO
EXEC msdb.dbo.sp_attach_schedule
  @job_name = N'AgentLab_Heartbeat',
  @schedule_name = N'Every minute (lab)';
GO</code></pre>
      `,
    },
    {
      h: "Verify your work",
      html: `
<p>Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:</p>
<pre><code class="language-sql">-- Lab step
-- Recent job history, including failures
SELECT j.name AS job_name, h.step_id, h.step_name,
       h.run_date, h.run_time,
       CASE h.run_status WHEN 0 THEN 'FAIL' WHEN 1 THEN 'OK' ELSE 'OTHER' END AS outcome,
       h.message
FROM   msdb.dbo.sysjobs j
JOIN   msdb.dbo.sysjobhistory h ON j.job_id = h.job_id
WHERE  j.name = N'AgentLab_Heartbeat'
ORDER BY h.run_date DESC, h.run_time DESC;
GO
-- Verify the job actually wrote rows
SELECT count(*) AS heartbeat_rows, max(ran_at) AS last_run
FROM   dbo.AgentLabLog;
GO</code></pre>
<p>Configure an operator and set the job to notify on failure. Database Mail must be configured for email to work; if mail is unavailable, note the notification configuration even if you cannot send in the lab.</p>
<p>If the output differs, stop and correct it before moving on. A lab that 'looks right' but was never verified teaches the wrong lessons.</p>
      `,
    },
    {
      h: "Pitfalls and safe practice",
      html: `
<p>Job ownership is a frequent hidden cause of failure. If the owner is disabled or lacks permissions, the job fails even though the definition looks perfect — always verify owner and history together.</p>
<table>
  <tr><th>Failure cause</th><th>Symptom</th><th>Fix</th></tr>
  <tr><td>Agent stopped</td><td>Nothing runs at all</td><td>Start service, set Automatic</td></tr>
  <tr><td>Disabled owner</td><td>Job fails silently</td><td>Reassign to a valid service account</td></tr>
  <tr><td>Missing permission</td><td>Step fails with error 5 / login failed</td><td>Grant rights or use a proxy</td></tr>
  <tr><td>No notification</td><td>Nobody knows it failed</td><td>Configure operator + Database Mail</td></tr>
</table>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.</p>
</div>
      `,
    }
  ],

  steps: [
    "Confirm the SQL Server Agent service is running and set to Automatic startup.",
    "Create the AgentLabLog table and confirm you can insert a row manually.",
    "Create a job AgentLab_Heartbeat with a T-SQL step that inserts into the log table.",
    "Add a second verification step that checks the row count and configure it to run only after success.",
    "Create a schedule that runs every minute, attach it, and enable the job.",
    "Wait for two or three executions, then verify rows appeared in AgentLabLog.",
    "Deliberately break the first step (for example reference a missing table) and let it fail once.",
    "Query sysjobhistory to find the failed step and read its error message.",
    "Configure an operator and set the job to notify on failure, noting the Database Mail prerequisite.",
    "Fix the step, re-enable the schedule briefly to confirm success, then disable the job and clean up."
  ],

  scenario: {
    title: "Backups silently stopped for a week",
    html: `
A nightly backup job began failing after the job owner's domain account was disabled during a security cleanup. No operator notification was configured, so nobody noticed until a restore was needed and the newest backup was a week old. Reassigning the job to a dedicated service account, configuring failure notifications and adding a daily check of the last successful backup restored confidence. The job definition was fine all along — ownership and alerting were the weakness.
<p><strong>The lesson:</strong> practise both the diagnosis and the safe mitigation in this lab. Under pressure, the steps you have rehearsed are the steps you will actually take — build good muscle memory now.</p>
    `,
  },

  interview: [
    {
      q: "Why can a perfectly defined job suddenly stop running?",
      a: `
Common causes are a stopped Agent service, a disabled or deleted owner, a disabled schedule, or a step lacking permissions. Check service, owner, schedule and history rather than rewriting the job.
      `,
    },
    {
      q: "What is the purpose of an Agent proxy?",
      a: `
A proxy maps a job step to a credential so the step can run under a different, appropriately privileged Windows account without exposing its password — used for file system, network or other external access.
      `,
    },
    {
      q: "How would you audit job failures proactively?",
      a: `
Query msdb.dbo.sysjobhistory for run_status = 0 and alert on results, and configure operators/alerts with Database Mail so failures notify someone immediately.
      `,
    }
  ],

  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "sysschedules",
        "This lab turns the Agent from a black box into a tool you can inspect and trust.",
        "sysjobsteps"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “This lab turns the Agent from a black box into a tool you can inspect and trust. You will build a job, watch it run, deliberately make a step fail, and then diagnose the failure from msdb.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "A job is a container of steps; each step can run T-SQL, PowerShell, SSIS or a command.",
        "sysjobsteps",
        "sysschedules"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A job is a container of steps; each step can run T-SQL, PowerShell, SSIS or a command. Steps execute in order and the outcome of each controls what runs next — that is how you build branching maintenance workflows.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "If the output differs, stop and correct it before moving on.",
        "Job ownership is a frequent hidden cause of failure.",
        "Create a job with one T-SQL step that writes a timestamp into a log table, and a second step that checks the row count."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Create a job with one T-SQL step that writes a timestamp into a log table, and a second step that checks the row count. Set step two to run only if step one succeeds — the default flow for dependent steps.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "sysschedules",
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "sysjobsteps"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Job ownership is a frequent hidden cause of failure.",
        "sysschedules",
        "Never assume a lab step worked — verify against the catalog views and DMVs."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Job ownership is a frequent hidden cause of failure. If the owner is disabled or lacks permissions, the job fails even though the definition looks perfect — always verify owner and history together.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "Job ownership is a frequent hidden cause of failure.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "Confirm the SQL Server Agent service is running first."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Confirm the SQL Server Agent service is running first. If it is stopped, none of your jobs will ever execute and the symptoms look identical to a broken schedule.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "The flow below shows the lifecycle you will exercise: create job, add steps, set a schedule, run it, then read the history to verify and diagnose.",
        "Job ownership is a frequent hidden cause of failure."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The flow below shows the lifecycle you will exercise: create job, add steps, set a schedule, run it, then read the history to verify and diagnose.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Attach a schedule that runs every minute for a short test window, then disable it once you have observed a few executions.",
        "Grant rights or use a proxy",
        "Configure operator + Database Mail"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Attach a schedule that runs every minute for a short test window, then disable it once you have observed a few executions. Leaving test schedules enabled is a common source of surprise load.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Reassign to a valid service account",
        "Grant rights or use a proxy",
        "Configure an operator and set the job to notify on failure."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Configure an operator and set the job to notify on failure. Database Mail must be configured for email to work; if mail is unavailable, note the notification configuration even if you cannot send in the lab.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Reassign to a valid service account",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "Start service, set Automatic"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "sysschedules",
        "This lab turns the Agent from a black box into a tool you can inspect and trust.",
        "sysjobsteps"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “This lab turns the Agent from a black box into a tool you can inspect and trust. You will build a job, watch it run, deliberately make a step fail, and then diagnose the failure from msdb.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "A job is a container of steps; each step can run T-SQL, PowerShell, SSIS or a command.",
        "sysjobsteps",
        "sysschedules"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A job is a container of steps; each step can run T-SQL, PowerShell, SSIS or a command. Steps execute in order and the outcome of each controls what runs next — that is how you build branching maintenance workflows.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "If the output differs, stop and correct it before moving on.",
        "Job ownership is a frequent hidden cause of failure.",
        "Create a job with one T-SQL step that writes a timestamp into a log table, and a second step that checks the row count."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Create a job with one T-SQL step that writes a timestamp into a log table, and a second step that checks the row count. Set step two to run only if step one succeeds — the default flow for dependent steps.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "sysschedules",
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "sysjobsteps"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Job ownership is a frequent hidden cause of failure.",
        "sysschedules",
        "Never assume a lab step worked — verify against the catalog views and DMVs."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Job ownership is a frequent hidden cause of failure. If the owner is disabled or lacks permissions, the job fails even though the definition looks perfect — always verify owner and history together.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "Job ownership is a frequent hidden cause of failure.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "Confirm the SQL Server Agent service is running first."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Confirm the SQL Server Agent service is running first. If it is stopped, none of your jobs will ever execute and the symptoms look identical to a broken schedule.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "The flow below shows the lifecycle you will exercise: create job, add steps, set a schedule, run it, then read the history to verify and diagnose.",
        "Job ownership is a frequent hidden cause of failure."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The flow below shows the lifecycle you will exercise: create job, add steps, set a schedule, run it, then read the history to verify and diagnose.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Attach a schedule that runs every minute for a short test window, then disable it once you have observed a few executions.",
        "Grant rights or use a proxy",
        "Configure operator + Database Mail"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Attach a schedule that runs every minute for a short test window, then disable it once you have observed a few executions. Leaving test schedules enabled is a common source of surprise load.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Reassign to a valid service account",
        "Grant rights or use a proxy",
        "Configure an operator and set the job to notify on failure."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Configure an operator and set the job to notify on failure. Database Mail must be configured for email to work; if mail is unavailable, note the notification configuration even if you cannot send in the lab.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Reassign to a valid service account",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "Start service, set Automatic"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "sysschedules",
        "This lab turns the Agent from a black box into a tool you can inspect and trust.",
        "sysjobsteps"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “This lab turns the Agent from a black box into a tool you can inspect and trust. You will build a job, watch it run, deliberately make a step fail, and then diagnose the failure from msdb.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "A job is a container of steps; each step can run T-SQL, PowerShell, SSIS or a command.",
        "sysjobsteps",
        "sysschedules"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A job is a container of steps; each step can run T-SQL, PowerShell, SSIS or a command. Steps execute in order and the outcome of each controls what runs next — that is how you build branching maintenance workflows.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "If the output differs, stop and correct it before moving on.",
        "Job ownership is a frequent hidden cause of failure.",
        "Create a job with one T-SQL step that writes a timestamp into a log table, and a second step that checks the row count."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Create a job with one T-SQL step that writes a timestamp into a log table, and a second step that checks the row count. Set step two to run only if step one succeeds — the default flow for dependent steps.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "sysschedules",
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "sysjobsteps"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Job ownership is a frequent hidden cause of failure.",
        "sysschedules",
        "Never assume a lab step worked — verify against the catalog views and DMVs."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Job ownership is a frequent hidden cause of failure. If the owner is disabled or lacks permissions, the job fails even though the definition looks perfect — always verify owner and history together.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "Job ownership is a frequent hidden cause of failure.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "Confirm the SQL Server Agent service is running first."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Confirm the SQL Server Agent service is running first. If it is stopped, none of your jobs will ever execute and the symptoms look identical to a broken schedule.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "The flow below shows the lifecycle you will exercise: create job, add steps, set a schedule, run it, then read the history to verify and diagnose.",
        "Job ownership is a frequent hidden cause of failure."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The flow below shows the lifecycle you will exercise: create job, add steps, set a schedule, run it, then read the history to verify and diagnose.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Attach a schedule that runs every minute for a short test window, then disable it once you have observed a few executions.",
        "Grant rights or use a proxy",
        "Configure operator + Database Mail"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Attach a schedule that runs every minute for a short test window, then disable it once you have observed a few executions. Leaving test schedules enabled is a common source of surprise load.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Reassign to a valid service account",
        "Grant rights or use a proxy",
        "Configure an operator and set the job to notify on failure."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Configure an operator and set the job to notify on failure. Database Mail must be configured for email to work; if mail is unavailable, note the notification configuration even if you cannot send in the lab.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Reassign to a valid service account",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "Start service, set Automatic"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.”"
    }
  ],
  takeaways: [
    "A job is steps plus a schedule plus an owner — all three must be healthy",
    "Job history in msdb is the primary diagnostic record",
    "Notifications and operators are what turn a failure into an action",
    "Job ownership is a common silent cause of failure",
    "Disable test schedules when the lab is done to avoid surprise load"
  ]
};
