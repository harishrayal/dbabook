/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch10-17.html */

window.TOPIC = {
  id: "ch10-17",
  title: "SQL Server Agent Proxies",

  lead: "Understanding SQL Server Agent Proxies is essential for anyone responsible for SQL Server Agent and automation. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what SQL Server Agent Proxies is and where it fits",
    "Explain how SQL Server Agent Proxies works internally",
    "Apply SQL Server Agent Proxies correctly in a production environment",
    "Recognise the common mistakes and risks involving SQL Server Agent Proxies",
    "Monitor and troubleshoot SQL Server Agent Proxies with the right tools"
  ],

  sections: [
    {
      h: "What SQL Server Agent Proxies means",
      html: `
<p>In this topic we examine <strong>SQL Server Agent Proxies</strong> within SQL Server Agent and automation. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>SQL Server Agent is the scheduling and automation engine. It runs jobs — collections of one or more steps — on schedules, and can raise alerts and notify operators when something fails.</p>
<p>A job step can run T-SQL, PowerShell, SSIS packages or command-line programs. Steps execute in order; the success or failure of each step controls what runs next, which lets you build branching maintenance workflows.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>SQL Server Agent Proxies is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where SQL Server Agent Proxies fits",
      html: `
<p>Schedules define when a job runs: once, on a recurring interval, daily, weekly or monthly. Multiple schedules can be attached to one job, and one schedule can drive several jobs.</p>
<p>The diagram below places SQL Server Agent Proxies alongside the core concepts of SQL Server Agent and automation. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="SQL Server Agent Proxies flow">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="230" y="12" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="39" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Job</text>
    <rect x="230" y="66" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="93" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Step</text>
    <rect x="230" y="120" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="147" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Schedule</text>
    <rect x="230" y="174" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="201" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Alert</text>
    <rect x="230" y="228" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="255" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Operator</text>
    <rect x="230" y="282" width="300" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="309" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">6. Proxy</text>
    <line x1="380" y1="56" x2="380" y2="66" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="110" x2="380" y2="120" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="164" x2="380" y2="174" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="218" x2="380" y2="228" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="272" x2="380" y2="282" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">SQL Server Agent Proxies</text>
  </svg>
  <div class="figcaption">Figure 1 — SQL Server Agent and automation: how SQL Server Agent Proxies relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "SQL Server Agent Proxies in practice",
      html: `
<p>Job ownership matters: a job runs under the security context of its owner (or a proxy). If the owner is disabled or lacks permissions, the job fails — a common cause of 'the backup job suddenly stopped working'.</p>
<p>The following comparison captures the distinctions that matter most when working with SQL Server Agent Proxies:</p>
<table>
  <tr><th>Concept</th><th>Meaning</th><th>Failure symptom</th></tr>
  <tr><td>Job</td><td>Unit of automated work</td><td>Job never runs</td></tr>
  <tr><td>Step</td><td>Individual task in a job</td><td>Partial completion</td></tr>
  <tr><td>Schedule</td><td>When a job runs</td><td>Missed window</td></tr>
</table>
<p>Notifications go to operators by email, pager or net send, triggered by alerts or job completion conditions. Database Mail must be configured for email notifications to work.</p>
      `,
    },
    {
      h: "Working with SQL Server Agent Proxies",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Agent Proxies. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- SQL Server Agent Proxies
-- Recent failed jobs
SELECT j.name AS job_name, h.step_name,
       h.run_date, h.run_time, h.message
FROM   msdb.dbo.sysjobs j
JOIN   msdb.dbo.sysjobhistory h ON j.job_id = h.job_id
WHERE  h.run_status = 0
ORDER BY h.run_date DESC, h.run_time DESC;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- SQL Server Agent Proxies
-- Is Agent running and how is it configured?
SELECT servicename, status_desc, startup_type_desc
FROM   sys.dm_server_services
WHERE  servicename LIKE '%Agent%';</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- SQL Server Agent Proxies
-- Job schedule list
SELECT j.name AS job, s.name AS schedule,
       s.enabled
FROM   msdb.dbo.sysjobs j
JOIN   msdb.dbo.sysjobschedules js ON j.job_id=js.job_id
JOIN   msdb.dbo.sysschedules s ON js.schedule_id=s.schedule_id
ORDER BY j.name;</code></pre>
<p>Alerts respond to SQL Server errors or performance conditions, such as severity 19+ errors or a specific error number, and can execute a job in response — the backbone of proactive monitoring.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Proxies and credentials let a job step run under a different, appropriately privileged account without exposing that account's password, essential for steps that touch the file system or network.</p>
<table>
  <tr><th>Notification</th><th>Trigger</th><th>Prerequisite</th></tr>
  <tr><td>Operator</td><td>Named recipient</td><td>Database Mail configured</td></tr>
  <tr><td>Alert</td><td>Error or condition</td><td>Enabled alert</td></tr>
  <tr><td>Job outcome</td><td>Success/failure of a job</td><td>Notification set on job</td></tr>
</table>
<p>Job history is the diagnostic record. Reviewing failed steps and their messages is a daily DBA task; automating the review with a query over msdb makes it reliable.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With SQL Server Agent Proxies, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: SQL Server Agent Proxies",
      html: `
<p>This section consolidates <strong>SQL Server Agent Proxies</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Job ownership matters: a job runs under the security context of its owner (or a proxy). If the owner is disabled or lacks permissions, the job fails — a common cause of 'the backup job suddenly stopped working'.</p>
<p>Notifications go to operators by email, pager or net send, triggered by alerts or job completion conditions. Database Mail must be configured for email notifications to work.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>SQL Server Agent Proxies sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Concept</th><th>Meaning</th><th>Failure symptom</th></tr>
  <tr><td>Job</td><td>Unit of automated work</td><td>Job never runs</td></tr>
  <tr><td>Step</td><td>Individual task in a job</td><td>Partial completion</td></tr>
  <tr><td>Schedule</td><td>When a job runs</td><td>Missed window</td></tr>
</table>
<p>Alerts respond to SQL Server errors or performance conditions, such as severity 19+ errors or a specific error number, and can execute a job in response — the backbone of proactive monitoring.</p>
<p>Use the following as a starting point when investigating SQL Server Agent Proxies. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- SQL Server Agent Proxies
-- Recent failed jobs
SELECT j.name AS job_name, h.step_name,
       h.run_date, h.run_time, h.message
FROM   msdb.dbo.sysjobs j
JOIN   msdb.dbo.sysjobhistory h ON j.job_id = h.job_id
WHERE  h.run_status = 0
ORDER BY h.run_date DESC, h.run_time DESC;</code></pre>
<p>Proxies and credentials let a job step run under a different, appropriately privileged account without exposing that account's password, essential for steps that touch the file system or network.</p>
      `,
    }
  ],

  scenario: {
    title: "Backups silently stopped for a week",
    html: `
A job owner's account was disabled during a security cleanup, so the nightly backup job failed silently with no operator notified. The DBA reassigned ownership to a dedicated service account, configured failure notifications and added a daily check of the last successful backup date. Ownership and alerting are as important as the job definition.
<p><strong>The SQL Server Agent Proxies lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "What is the purpose of a proxy in SQL Server Agent?",
      a: `
A proxy maps a job step to a credential so the step can run under a different, appropriately privileged Windows account without exposing its password, used for file system or network access.
      `,
    },
    {
      q: "How would you audit job failures proactively?",
      a: `
Query msdb.dbo.sysjobhistory for run_status = 0 and alert on results, or configure Agent alerts/operators and Database Mail so failures notify someone immediately.
      `,
    },
    {
      q: "Why can a perfectly defined job suddenly stop running?",
      a: `
Common causes include a disabled or deleted owner, a stopped Agent service, a disabled schedule, or missing permissions for a step — all reasons to check owner, service and history, not just the job definition.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server Agent and automation.”",
      "options": [
        "Database Mail configured",
        "SQL Server Agent Proxies",
        "With SQL Server Agent Proxies, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine SQL Server Agent Proxies within SQL Server Agent and automation. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Agent Proxies fits”?",
      "options": [
        "Schedules define when a job runs: once, on a recurring interval, daily, weekly or monthly.",
        "Enabled alert",
        "Notification set on job"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Schedules define when a job runs: once, on a recurring interval, daily, weekly or monthly. Multiple schedules can be attached to one job, and one schedule can drive several jobs.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Agent Proxies in practice”?",
      "options": [
        "Use the following as a starting point when investigating SQL Server Agent Proxies.",
        "Job never runs",
        "Job ownership matters: a job runs under the security context of its owner (or a proxy)."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Job ownership matters: a job runs under the security context of its owner (or a proxy). If the owner is disabled or lacks permissions, the job fails — a common cause of 'the backup job suddenly stopped working'.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Agent Proxies”?",
      "options": [
        "Use the following as a starting point when investigating SQL Server Agent Proxies.",
        "Theory becomes useful when you can apply it.",
        "Alerts respond to SQL Server errors or performance conditions, such as severity 19+ errors or a specific error number, and can execute a job in response — the backbone of…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Agent Proxies. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Proxies and credentials let a job step run under a different, appropriately privileged account without exposing that account's password, essential for steps that touch the file…",
        "Database Mail configured",
        "Enabled alert"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Proxies and credentials let a job step run under a different, appropriately privileged account without exposing that account's password, essential for steps that touch the file system or network.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating SQL Server Agent Proxies.",
        "SQL Server Agent Proxies"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates SQL Server Agent Proxies with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SQL Server Agent Proxies means”?",
      "options": [
        "Schedules define when a job runs: once, on a recurring interval, daily, weekly or monthly.",
        "SQL Server Agent is the scheduling and automation engine.",
        "SQL Server Agent Proxies is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “SQL Server Agent is the scheduling and automation engine. It runs jobs — collections of one or more steps — on schedules, and can raise alerts and notify operators when something fails.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Agent Proxies fits”?",
      "options": [
        "The diagram below places SQL Server Agent Proxies alongside the core concepts of SQL Server Agent and automation.",
        "SQL Server Agent Proxies",
        "SQL Server Agent is the scheduling and automation engine."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places SQL Server Agent Proxies alongside the core concepts of SQL Server Agent and automation. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Agent Proxies in practice”?",
      "options": [
        "SQL Server Agent is the scheduling and automation engine.",
        "A job step can run T-SQL, PowerShell, SSIS packages or command-line programs.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Agent Proxies:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SQL Server Agent Proxies:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Agent Proxies”?",
      "options": [
        "SQL Server Agent Proxies is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "The first example establishes the relevant state.",
        "A job step can run T-SQL, PowerShell, SSIS packages or command-line programs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server Agent and automation.”",
      "options": [
        "Database Mail configured",
        "SQL Server Agent Proxies",
        "With SQL Server Agent Proxies, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine SQL Server Agent Proxies within SQL Server Agent and automation. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Agent Proxies fits”?",
      "options": [
        "Schedules define when a job runs: once, on a recurring interval, daily, weekly or monthly.",
        "Enabled alert",
        "Notification set on job"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Schedules define when a job runs: once, on a recurring interval, daily, weekly or monthly. Multiple schedules can be attached to one job, and one schedule can drive several jobs.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Agent Proxies in practice”?",
      "options": [
        "Use the following as a starting point when investigating SQL Server Agent Proxies.",
        "Job never runs",
        "Job ownership matters: a job runs under the security context of its owner (or a proxy)."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Job ownership matters: a job runs under the security context of its owner (or a proxy). If the owner is disabled or lacks permissions, the job fails — a common cause of 'the backup job suddenly stopped working'.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Agent Proxies”?",
      "options": [
        "Use the following as a starting point when investigating SQL Server Agent Proxies.",
        "Theory becomes useful when you can apply it.",
        "Alerts respond to SQL Server errors or performance conditions, such as severity 19+ errors or a specific error number, and can execute a job in response — the backbone of…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Agent Proxies. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Proxies and credentials let a job step run under a different, appropriately privileged account without exposing that account's password, essential for steps that touch the file…",
        "Database Mail configured",
        "Enabled alert"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Proxies and credentials let a job step run under a different, appropriately privileged account without exposing that account's password, essential for steps that touch the file system or network.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating SQL Server Agent Proxies.",
        "SQL Server Agent Proxies"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates SQL Server Agent Proxies with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SQL Server Agent Proxies means”?",
      "options": [
        "Schedules define when a job runs: once, on a recurring interval, daily, weekly or monthly.",
        "SQL Server Agent is the scheduling and automation engine.",
        "SQL Server Agent Proxies is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “SQL Server Agent is the scheduling and automation engine. It runs jobs — collections of one or more steps — on schedules, and can raise alerts and notify operators when something fails.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Agent Proxies fits”?",
      "options": [
        "The diagram below places SQL Server Agent Proxies alongside the core concepts of SQL Server Agent and automation.",
        "SQL Server Agent Proxies",
        "SQL Server Agent is the scheduling and automation engine."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places SQL Server Agent Proxies alongside the core concepts of SQL Server Agent and automation. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Agent Proxies in practice”?",
      "options": [
        "SQL Server Agent is the scheduling and automation engine.",
        "A job step can run T-SQL, PowerShell, SSIS packages or command-line programs.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Agent Proxies:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SQL Server Agent Proxies:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Agent Proxies”?",
      "options": [
        "SQL Server Agent Proxies is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "The first example establishes the relevant state.",
        "A job step can run T-SQL, PowerShell, SSIS packages or command-line programs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server Agent and automation.”",
      "options": [
        "Database Mail configured",
        "SQL Server Agent Proxies",
        "With SQL Server Agent Proxies, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine SQL Server Agent Proxies within SQL Server Agent and automation. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Agent Proxies fits”?",
      "options": [
        "Schedules define when a job runs: once, on a recurring interval, daily, weekly or monthly.",
        "Enabled alert",
        "Notification set on job"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Schedules define when a job runs: once, on a recurring interval, daily, weekly or monthly. Multiple schedules can be attached to one job, and one schedule can drive several jobs.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Agent Proxies in practice”?",
      "options": [
        "Use the following as a starting point when investigating SQL Server Agent Proxies.",
        "Job never runs",
        "Job ownership matters: a job runs under the security context of its owner (or a proxy)."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Job ownership matters: a job runs under the security context of its owner (or a proxy). If the owner is disabled or lacks permissions, the job fails — a common cause of 'the backup job suddenly stopped working'.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Agent Proxies”?",
      "options": [
        "Use the following as a starting point when investigating SQL Server Agent Proxies.",
        "Theory becomes useful when you can apply it.",
        "Alerts respond to SQL Server errors or performance conditions, such as severity 19+ errors or a specific error number, and can execute a job in response — the backbone of…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Agent Proxies. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Proxies and credentials let a job step run under a different, appropriately privileged account without exposing that account's password, essential for steps that touch the file…",
        "Database Mail configured",
        "Enabled alert"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Proxies and credentials let a job step run under a different, appropriately privileged account without exposing that account's password, essential for steps that touch the file system or network.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating SQL Server Agent Proxies.",
        "SQL Server Agent Proxies"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates SQL Server Agent Proxies with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SQL Server Agent Proxies means”?",
      "options": [
        "Schedules define when a job runs: once, on a recurring interval, daily, weekly or monthly.",
        "SQL Server Agent is the scheduling and automation engine.",
        "SQL Server Agent Proxies is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “SQL Server Agent is the scheduling and automation engine. It runs jobs — collections of one or more steps — on schedules, and can raise alerts and notify operators when something fails.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Agent Proxies fits”?",
      "options": [
        "The diagram below places SQL Server Agent Proxies alongside the core concepts of SQL Server Agent and automation.",
        "SQL Server Agent Proxies",
        "SQL Server Agent is the scheduling and automation engine."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places SQL Server Agent Proxies alongside the core concepts of SQL Server Agent and automation. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Agent Proxies in practice”?",
      "options": [
        "SQL Server Agent is the scheduling and automation engine.",
        "A job step can run T-SQL, PowerShell, SSIS packages or command-line programs.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Agent Proxies:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SQL Server Agent Proxies:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Agent Proxies”?",
      "options": [
        "SQL Server Agent Proxies is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "The first example establishes the relevant state.",
        "A job step can run T-SQL, PowerShell, SSIS packages or command-line programs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "SQL Server Agent Proxies is a fundamental concept in SQL Server Agent and automation",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of SQL Server Agent Proxies improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
