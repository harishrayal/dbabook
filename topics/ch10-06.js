/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch10-06.html */

window.TOPIC = {
  id: "ch10-06",
  title: "Job Schedules",

  lead: "This topic covers Job Schedules — a concept you will meet repeatedly when working with SQL Server Agent and automation. We build from first principles to production guidance.",

  objectives: [
    "Define what Job Schedules is and where it fits",
    "Explain how Job Schedules works internally",
    "Apply Job Schedules correctly in a production environment",
    "Recognise the common mistakes and risks involving Job Schedules",
    "Monitor and troubleshoot Job Schedules with the right tools"
  ],

  sections: [
    {
      h: "What Job Schedules means",
      html: `
<p>In this topic we examine <strong>Job Schedules</strong> within SQL Server Agent and automation. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Alerts respond to SQL Server errors or performance conditions, such as severity 19+ errors or a specific error number, and can execute a job in response — the backbone of proactive monitoring.</p>
<p>Proxies and credentials let a job step run under a different, appropriately privileged account without exposing that account's password, essential for steps that touch the file system or network.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Job Schedules is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Job Schedules fits",
      html: `
<p>Job history is the diagnostic record. Reviewing failed steps and their messages is a daily DBA task; automating the review with a query over msdb makes it reliable.</p>
<p>The diagram below places Job Schedules alongside the core concepts of SQL Server Agent and automation. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Job Schedules layers">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="70" y="8" width="620" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="30" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Job</text>
    <text x="380" y="50" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 1</text>
    <rect x="100" y="62" width="560" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="84" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Step</text>
    <text x="380" y="104" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 2</text>
    <rect x="130" y="116" width="500" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="138" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Schedule</text>
    <text x="380" y="158" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 3</text>
    <rect x="160" y="170" width="440" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="192" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Alert</text>
    <text x="380" y="212" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 4</text>
    <rect x="190" y="224" width="380" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="246" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Operator</text>
    <text x="380" y="266" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 5</text>
    <rect x="220" y="278" width="320" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="300" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Proxy</text>
    <text x="380" y="320" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 6</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Job Schedules</text>
  </svg>
  <div class="figcaption">Figure 1 — SQL Server Agent and automation: how Job Schedules relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Job Schedules in practice",
      html: `
<p>SQL Server Agent is the scheduling and automation engine. It runs jobs — collections of one or more steps — on schedules, and can raise alerts and notify operators when something fails.</p>
<p>The following comparison captures the distinctions that matter most when working with Job Schedules:</p>
<table>
  <tr><th>Concept</th><th>Meaning</th><th>Failure symptom</th></tr>
  <tr><td>Job</td><td>Unit of automated work</td><td>Job never runs</td></tr>
  <tr><td>Step</td><td>Individual task in a job</td><td>Partial completion</td></tr>
  <tr><td>Schedule</td><td>When a job runs</td><td>Missed window</td></tr>
</table>
<p>A job step can run T-SQL, PowerShell, SSIS packages or command-line programs. Steps execute in order; the success or failure of each step controls what runs next, which lets you build branching maintenance workflows.</p>
      `,
    },
    {
      h: "Working with Job Schedules",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Job Schedules. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Job Schedules
-- Recent failed jobs
SELECT j.name AS job_name, h.step_name,
       h.run_date, h.run_time, h.message
FROM   msdb.dbo.sysjobs j
JOIN   msdb.dbo.sysjobhistory h ON j.job_id = h.job_id
WHERE  h.run_status = 0
ORDER BY h.run_date DESC, h.run_time DESC;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Job Schedules
-- Is Agent running and how is it configured?
SELECT servicename, status_desc, startup_type_desc
FROM   sys.dm_server_services
WHERE  servicename LIKE '%Agent%';</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Job Schedules
-- Job schedule list
SELECT j.name AS job, s.name AS schedule,
       s.enabled
FROM   msdb.dbo.sysjobs j
JOIN   msdb.dbo.sysjobschedules js ON j.job_id=js.job_id
JOIN   msdb.dbo.sysschedules s ON js.schedule_id=s.schedule_id
ORDER BY j.name;</code></pre>
<p>Schedules define when a job runs: once, on a recurring interval, daily, weekly or monthly. Multiple schedules can be attached to one job, and one schedule can drive several jobs.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Job ownership matters: a job runs under the security context of its owner (or a proxy). If the owner is disabled or lacks permissions, the job fails — a common cause of 'the backup job suddenly stopped working'.</p>
<table>
  <tr><th>Notification</th><th>Trigger</th><th>Prerequisite</th></tr>
  <tr><td>Operator</td><td>Named recipient</td><td>Database Mail configured</td></tr>
  <tr><td>Alert</td><td>Error or condition</td><td>Enabled alert</td></tr>
  <tr><td>Job outcome</td><td>Success/failure of a job</td><td>Notification set on job</td></tr>
</table>
<p>Notifications go to operators by email, pager or net send, triggered by alerts or job completion conditions. Database Mail must be configured for email notifications to work.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Job Schedules, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Job Schedules",
      html: `
<p>This section consolidates <strong>Job Schedules</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>SQL Server Agent is the scheduling and automation engine. It runs jobs — collections of one or more steps — on schedules, and can raise alerts and notify operators when something fails.</p>
<p>A job step can run T-SQL, PowerShell, SSIS packages or command-line programs. Steps execute in order; the success or failure of each step controls what runs next, which lets you build branching maintenance workflows.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Job Schedules sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Notification</th><th>Trigger</th><th>Prerequisite</th></tr>
  <tr><td>Operator</td><td>Named recipient</td><td>Database Mail configured</td></tr>
  <tr><td>Alert</td><td>Error or condition</td><td>Enabled alert</td></tr>
  <tr><td>Job outcome</td><td>Success/failure of a job</td><td>Notification set on job</td></tr>
</table>
<p>Schedules define when a job runs: once, on a recurring interval, daily, weekly or monthly. Multiple schedules can be attached to one job, and one schedule can drive several jobs.</p>
<p>Use the following as a starting point when investigating Job Schedules. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Job Schedules
-- Is Agent running and how is it configured?
SELECT servicename, status_desc, startup_type_desc
FROM   sys.dm_server_services
WHERE  servicename LIKE '%Agent%';</code></pre>
<p>Job ownership matters: a job runs under the security context of its owner (or a proxy). If the owner is disabled or lacks permissions, the job fails — a common cause of 'the backup job suddenly stopped working'.</p>
      `,
    }
  ],

  scenario: {
    title: "The maintenance job that locked a table at 2 a.m.",
    html: `
An index rebuild step ran longer than its window and blocked the batch posting process, causing morning delays. The DBA added a time limit, used REORGANIZE for lightly fragmented indexes and moved the heavy rebuild to a dedicated weekend window. Automation still needs impact analysis.
<p><strong>The Job Schedules lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
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
    },
    {
      q: "What is the purpose of a proxy in SQL Server Agent?",
      a: `
A proxy maps a job step to a credential so the step can run under a different, appropriately privileged Windows account without exposing its password, used for file system or network access.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server Agent and automation.”",
      "options": [
        "Job Schedules",
        "The following comparison captures the distinctions that matter most when working with Job Schedules:",
        "A job step can run T-SQL, PowerShell, SSIS packages or command-line programs."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Job Schedules within SQL Server Agent and automation. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Job Schedules fits”?",
      "options": [
        "Job never runs",
        "Partial completion",
        "Job history is the diagnostic record."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Job history is the diagnostic record. Reviewing failed steps and their messages is a daily DBA task; automating the review with a query over msdb makes it reliable.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Job Schedules in practice”?",
      "options": [
        "Schedules define when a job runs: once, on a recurring interval, daily, weekly or monthly.",
        "SQL Server Agent is the scheduling and automation engine.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “SQL Server Agent is the scheduling and automation engine. It runs jobs — collections of one or more steps — on schedules, and can raise alerts and notify operators when something fails.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Job Schedules”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Job never runs",
        "Partial completion"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Job Schedules. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Partial completion",
        "Missed window",
        "Job ownership matters: a job runs under the security context of its owner (or a proxy)."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Job ownership matters: a job runs under the security context of its owner (or a proxy). If the owner is disabled or lacks permissions, the job fails — a common cause of 'the backup job suddenly stopped working'.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The first example establishes the relevant state.",
        "Job Schedules",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Job Schedules with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Job Schedules means”?",
      "options": [
        "Alerts respond to SQL Server errors or performance conditions, such as severity 19+ errors or a specific error number, and can execute a job in response — the backbone of…",
        "Job ownership matters: a job runs under the security context of its owner (or a proxy).",
        "Notifications go to operators by email, pager or net send, triggered by alerts or job completion conditions."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Alerts respond to SQL Server errors or performance conditions, such as severity 19+ errors or a specific error number, and can execute a job in response — the backbone of proactive monitoring.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Job Schedules fits”?",
      "options": [
        "Schedules define when a job runs: once, on a recurring interval, daily, weekly or monthly.",
        "Job ownership matters: a job runs under the security context of its owner (or a proxy).",
        "The diagram below places Job Schedules alongside the core concepts of SQL Server Agent and automation."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Job Schedules alongside the core concepts of SQL Server Agent and automation. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Job Schedules in practice”?",
      "options": [
        "Notification set on job",
        "The following comparison captures the distinctions that matter most when working with Job Schedules:",
        "Enabled alert"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Job Schedules:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Job Schedules”?",
      "options": [
        "The first example establishes the relevant state.",
        "Database Mail configured",
        "Enabled alert"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server Agent and automation.”",
      "options": [
        "Job Schedules",
        "The following comparison captures the distinctions that matter most when working with Job Schedules:",
        "A job step can run T-SQL, PowerShell, SSIS packages or command-line programs."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Job Schedules within SQL Server Agent and automation. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Job Schedules fits”?",
      "options": [
        "Job never runs",
        "Partial completion",
        "Job history is the diagnostic record."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Job history is the diagnostic record. Reviewing failed steps and their messages is a daily DBA task; automating the review with a query over msdb makes it reliable.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Job Schedules in practice”?",
      "options": [
        "Schedules define when a job runs: once, on a recurring interval, daily, weekly or monthly.",
        "SQL Server Agent is the scheduling and automation engine.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “SQL Server Agent is the scheduling and automation engine. It runs jobs — collections of one or more steps — on schedules, and can raise alerts and notify operators when something fails.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Job Schedules”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Job never runs",
        "Partial completion"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Job Schedules. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Partial completion",
        "Missed window",
        "Job ownership matters: a job runs under the security context of its owner (or a proxy)."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Job ownership matters: a job runs under the security context of its owner (or a proxy). If the owner is disabled or lacks permissions, the job fails — a common cause of 'the backup job suddenly stopped working'.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The first example establishes the relevant state.",
        "Job Schedules",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Job Schedules with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Job Schedules means”?",
      "options": [
        "Alerts respond to SQL Server errors or performance conditions, such as severity 19+ errors or a specific error number, and can execute a job in response — the backbone of…",
        "Job ownership matters: a job runs under the security context of its owner (or a proxy).",
        "Notifications go to operators by email, pager or net send, triggered by alerts or job completion conditions."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Alerts respond to SQL Server errors or performance conditions, such as severity 19+ errors or a specific error number, and can execute a job in response — the backbone of proactive monitoring.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Job Schedules fits”?",
      "options": [
        "Schedules define when a job runs: once, on a recurring interval, daily, weekly or monthly.",
        "Job ownership matters: a job runs under the security context of its owner (or a proxy).",
        "The diagram below places Job Schedules alongside the core concepts of SQL Server Agent and automation."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Job Schedules alongside the core concepts of SQL Server Agent and automation. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Job Schedules in practice”?",
      "options": [
        "Notification set on job",
        "The following comparison captures the distinctions that matter most when working with Job Schedules:",
        "Enabled alert"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Job Schedules:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Job Schedules”?",
      "options": [
        "The first example establishes the relevant state.",
        "Database Mail configured",
        "Enabled alert"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server Agent and automation.”",
      "options": [
        "Job Schedules",
        "The following comparison captures the distinctions that matter most when working with Job Schedules:",
        "A job step can run T-SQL, PowerShell, SSIS packages or command-line programs."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Job Schedules within SQL Server Agent and automation. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Job Schedules fits”?",
      "options": [
        "Job never runs",
        "Partial completion",
        "Job history is the diagnostic record."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Job history is the diagnostic record. Reviewing failed steps and their messages is a daily DBA task; automating the review with a query over msdb makes it reliable.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Job Schedules in practice”?",
      "options": [
        "Schedules define when a job runs: once, on a recurring interval, daily, weekly or monthly.",
        "SQL Server Agent is the scheduling and automation engine.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “SQL Server Agent is the scheduling and automation engine. It runs jobs — collections of one or more steps — on schedules, and can raise alerts and notify operators when something fails.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Job Schedules”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Job never runs",
        "Partial completion"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Job Schedules. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Partial completion",
        "Missed window",
        "Job ownership matters: a job runs under the security context of its owner (or a proxy)."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Job ownership matters: a job runs under the security context of its owner (or a proxy). If the owner is disabled or lacks permissions, the job fails — a common cause of 'the backup job suddenly stopped working'.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The first example establishes the relevant state.",
        "Job Schedules",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Job Schedules with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Job Schedules means”?",
      "options": [
        "Alerts respond to SQL Server errors or performance conditions, such as severity 19+ errors or a specific error number, and can execute a job in response — the backbone of…",
        "Job ownership matters: a job runs under the security context of its owner (or a proxy).",
        "Notifications go to operators by email, pager or net send, triggered by alerts or job completion conditions."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Alerts respond to SQL Server errors or performance conditions, such as severity 19+ errors or a specific error number, and can execute a job in response — the backbone of proactive monitoring.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Job Schedules fits”?",
      "options": [
        "Schedules define when a job runs: once, on a recurring interval, daily, weekly or monthly.",
        "Job ownership matters: a job runs under the security context of its owner (or a proxy).",
        "The diagram below places Job Schedules alongside the core concepts of SQL Server Agent and automation."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Job Schedules alongside the core concepts of SQL Server Agent and automation. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Job Schedules in practice”?",
      "options": [
        "Notification set on job",
        "The following comparison captures the distinctions that matter most when working with Job Schedules:",
        "Enabled alert"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Job Schedules:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Job Schedules”?",
      "options": [
        "The first example establishes the relevant state.",
        "Database Mail configured",
        "Enabled alert"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Job Schedules is a fundamental concept in SQL Server Agent and automation",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Job Schedules improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
