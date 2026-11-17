/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch18-19.html */

window.TOPIC = {
  id: "ch18-19",
  title: "Production Automation Best Practices",

  lead: "Production Automation Best Practices is a core part of PowerShell automation for DBAs. This topic explains what it is, how it works inside SQL Server, and what a production DBA must know to operate it safely.",

  objectives: [
    "Define what Production Automation Best Practices is and where it fits",
    "Explain how Production Automation Best Practices works internally",
    "Apply Production Automation Best Practices correctly in a production environment",
    "Recognise the common mistakes and risks involving Production Automation Best Practices",
    "Monitor and troubleshoot Production Automation Best Practices with the right tools"
  ],

  sections: [
    {
      h: "What Production Automation Best Practices means",
      html: `
<p>In this topic we examine <strong>Production Automation Best Practices</strong> within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model for administration tasks.</p>
<p>Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable. A script that silently continues after an error is worse than one that fails clearly.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Production Automation Best Practices is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Production Automation Best Practices fits",
      html: `
<p>Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions. Never use a script in production that you have not tested against a non-production instance.</p>
<p>The diagram below places Production Automation Best Practices alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Production Automation Best Pr… concept map">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="280" y="140" width="200" height="60" rx="9" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="175" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Production Automation Best Pr…</text>
    <rect x="24" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Cmdlet</text>
    <text x="124" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 1</text>
    <rect x="536" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Pipeline</text>
    <text x="636" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 2</text>
    <rect x="24" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">SMO</text>
    <text x="124" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 3</text>
    <rect x="536" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Script</text>
    <text x="636" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 4</text>
    <rect x="24" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Report</text>
    <text x="124" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 5</text>
    <rect x="536" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Automation</text>
    <text x="636" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 6</text>
    <line x1="380" y1="170" x2="124" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
  </svg>
  <div class="figcaption">Figure 1 — PowerShell automation for DBAs: how Production Automation Best Practices relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Production Automation Best Practices in practice",
      html: `
<p>Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.</p>
<p>The following comparison captures the distinctions that matter most when working with Production Automation Best Practices:</p>
<table>
  <tr><th>Concept</th><th>Purpose</th><th>Example</th></tr>
  <tr><td>Cmdlet</td><td>Single action</td><td>Get-Service</td></tr>
  <tr><td>Pipeline</td><td>Chain objects</td><td>Where-Object</td></tr>
  <tr><td>Splatting</td><td>Pass a parameter hash</td><td>@params</td></tr>
</table>
<p>Email notifications close the loop: a report that nobody reads has limited value. Database Mail or SMTP from PowerShell can deliver succinct, actionable alerts.</p>
      `,
    },
    {
      h: "Working with Production Automation Best Practices",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Production Automation Best Practices. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-powershell">-- Production Automation Best Practices
Import-Module SqlServer
$servers = @('SQL01','SQL02','SQL03')
foreach ($s in $servers) {
  $q = "SELECT name, state_desc FROM sys.databases"
  Invoke-Sqlcmd -ServerInstance $s -Query $q |
    Select-Object @{n='Server';e={$s}}, name, state_desc
}</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-powershell">-- Production Automation Best Practices
$params = @{
  ServerInstance = 'SQL01'
  Query          = 'SELECT name FROM sys.databases'
}
Invoke-Sqlcmd @params | Format-Table -AutoSize</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-powershell">-- Production Automation Best Practices
Get-Service -Name 'MSSQL*','SQLSERVERAGENT' -ComputerName SQL01 |
  Select-Object Name, Status |
  Format-Table -AutoSize</code></pre>
<p>PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications. It is an essential force multiplier in an enterprise estate.</p>
<table>
  <tr><th>Report</th><th>Data source</th><th>Cadence</th></tr>
  <tr><td>Backup status</td><td>msdb backupset</td><td>Daily</td></tr>
  <tr><td>Disk space</td><td>dm_os_volume_stats</td><td>Daily</td></tr>
  <tr><td>Job failures</td><td>sysjobhistory</td><td>Daily</td></tr>
</table>
<p>The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts. The pipeline passes objects, not text, which makes filtering and formatting powerful and reliable.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Production Automation Best Practices, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    }
  ],

  scenario: {
    title: "The script that ran on production",
    html: `
A health-check script was copied from a lab and run against production with a cleanup switch left enabled, deleting old backup files. The backup retention policy was restored from the script's dry-run output. The lesson: test on non-production, default to read-only, make destructive actions explicit and require confirmation.
<p><strong>The Production Automation Best Practices lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "What is splatting in PowerShell?",
      a: `
Passing a hashtable of parameters to a cmdlet with @params instead of a long positional command line — it improves readability and avoids fragile backtick line continuations.
      `,
    },
    {
      q: "How would you build a multi-server backup status report?",
      a: `
Loop over the server list (optionally in parallel), use Invoke-Sqlcmd against msdb to get the last backup per database, collect results into objects and export or email a formatted summary, failing loudly on unreachable servers.
      `,
    },
    {
      q: "What makes a DBA script safe for production?",
      a: `
Testing on non-production, defaulting to read-only, explicit destructive switches, try/catch with -ErrorAction Stop, clear logging and idempotent behaviour that checks state before changing it.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within PowerShell automation for DBAs.”",
      "options": [
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…",
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "Production Automation Best Practices"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Production Automation Best Practices within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Automation Best Practices fits”?",
      "options": [
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions.",
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions. Never use a script in production that you have not tested against a non-production instance.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Automation Best Practices in practice”?",
      "options": [
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "Production Automation Best Practices is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Automation Best Practices”?",
      "options": [
        "Production Automation Best Practices is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance…",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Production Automation Best Practices. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The diagram below places Production Automation Best Practices alongside the core concepts of PowerShell automation for DBAs.",
        "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications.",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications. It is an essential force multiplier in an enterprise estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Production Automation Best Practices means”?",
      "options": [
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…",
        "Get-Service",
        "Where-Object"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model for administration tasks.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Automation Best Practices fits”?",
      "options": [
        "Email notifications close the loop: a report that nobody reads has limited value.",
        "Get-Service",
        "The diagram below places Production Automation Best Practices alongside the core concepts of PowerShell automation for DBAs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Production Automation Best Practices alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Automation Best Practices in practice”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "The following comparison captures the distinctions that matter most when working with Production Automation Best Practices:",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Production Automation Best Practices:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Automation Best Practices”?",
      "options": [
        "The first example establishes the relevant state.",
        "Email notifications close the loop: a report that nobody reads has limited value.",
        "Get-Service"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Get-Service",
        "Where-Object",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts. The pipeline passes objects, not text, which makes filtering and formatting powerful and reliable.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within PowerShell automation for DBAs.”",
      "options": [
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…",
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "Production Automation Best Practices"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Production Automation Best Practices within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Automation Best Practices fits”?",
      "options": [
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions.",
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions. Never use a script in production that you have not tested against a non-production instance.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Automation Best Practices in practice”?",
      "options": [
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "Production Automation Best Practices is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Automation Best Practices”?",
      "options": [
        "Production Automation Best Practices is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance…",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Production Automation Best Practices. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The diagram below places Production Automation Best Practices alongside the core concepts of PowerShell automation for DBAs.",
        "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications.",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications. It is an essential force multiplier in an enterprise estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Production Automation Best Practices means”?",
      "options": [
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…",
        "Get-Service",
        "Where-Object"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model for administration tasks.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Automation Best Practices fits”?",
      "options": [
        "Email notifications close the loop: a report that nobody reads has limited value.",
        "Get-Service",
        "The diagram below places Production Automation Best Practices alongside the core concepts of PowerShell automation for DBAs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Production Automation Best Practices alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Automation Best Practices in practice”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "The following comparison captures the distinctions that matter most when working with Production Automation Best Practices:",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Production Automation Best Practices:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Automation Best Practices”?",
      "options": [
        "The first example establishes the relevant state.",
        "Email notifications close the loop: a report that nobody reads has limited value.",
        "Get-Service"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Get-Service",
        "Where-Object",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts. The pipeline passes objects, not text, which makes filtering and formatting powerful and reliable.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within PowerShell automation for DBAs.”",
      "options": [
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…",
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "Production Automation Best Practices"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Production Automation Best Practices within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Automation Best Practices fits”?",
      "options": [
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions.",
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions. Never use a script in production that you have not tested against a non-production instance.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Automation Best Practices in practice”?",
      "options": [
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "Production Automation Best Practices is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Automation Best Practices”?",
      "options": [
        "Production Automation Best Practices is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance…",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Production Automation Best Practices. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The diagram below places Production Automation Best Practices alongside the core concepts of PowerShell automation for DBAs.",
        "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications.",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications. It is an essential force multiplier in an enterprise estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Production Automation Best Practices means”?",
      "options": [
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…",
        "Get-Service",
        "Where-Object"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model for administration tasks.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Automation Best Practices fits”?",
      "options": [
        "Email notifications close the loop: a report that nobody reads has limited value.",
        "Get-Service",
        "The diagram below places Production Automation Best Practices alongside the core concepts of PowerShell automation for DBAs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Production Automation Best Practices alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Automation Best Practices in practice”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "The following comparison captures the distinctions that matter most when working with Production Automation Best Practices:",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Production Automation Best Practices:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Automation Best Practices”?",
      "options": [
        "The first example establishes the relevant state.",
        "Email notifications close the loop: a report that nobody reads has limited value.",
        "Get-Service"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Get-Service",
        "Where-Object",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts. The pipeline passes objects, not text, which makes filtering and formatting powerful and reliable.”"
    }
  ],
  takeaways: [
    "Production Automation Best Practices is a fundamental concept in PowerShell automation for DBAs",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Production Automation Best Practices improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
