/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch18-03.html */

window.TOPIC = {
  id: "ch18-03",
  title: "Variables and Data Types",

  lead: "This topic covers Variables and Data Types — a concept you will meet repeatedly when working with PowerShell automation for DBAs. We build from first principles to production guidance.",

  objectives: [
    "Define what Variables and Data Types is and where it fits",
    "Explain how Variables and Data Types works internally",
    "Apply Variables and Data Types correctly in a production environment",
    "Recognise the common mistakes and risks involving Variables and Data Types",
    "Monitor and troubleshoot Variables and Data Types with the right tools"
  ],

  sections: [
    {
      h: "What Variables and Data Types means",
      html: `
<p>In this topic we examine <strong>Variables and Data Types</strong> within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model for administration tasks.</p>
<p>Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable. A script that silently continues after an error is worse than one that fails clearly.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Variables and Data Types is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Variables and Data Types fits",
      html: `
<p>Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions. Never use a script in production that you have not tested against a non-production instance.</p>
<p>The diagram below places Variables and Data Types alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Variables and Data Types layers">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="70" y="8" width="620" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="30" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Cmdlet</text>
    <text x="380" y="50" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 1</text>
    <rect x="100" y="62" width="560" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="84" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Pipeline</text>
    <text x="380" y="104" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 2</text>
    <rect x="130" y="116" width="500" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="138" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">SMO</text>
    <text x="380" y="158" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 3</text>
    <rect x="160" y="170" width="440" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="192" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Script</text>
    <text x="380" y="212" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 4</text>
    <rect x="190" y="224" width="380" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="246" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Report</text>
    <text x="380" y="266" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 5</text>
    <rect x="220" y="278" width="320" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="300" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Automation</text>
    <text x="380" y="320" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 6</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Variables and Data Types</text>
  </svg>
  <div class="figcaption">Figure 1 — PowerShell automation for DBAs: how Variables and Data Types relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Variables and Data Types in practice",
      html: `
<p>Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.</p>
<p>The following comparison captures the distinctions that matter most when working with Variables and Data Types:</p>
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
      h: "Working with Variables and Data Types",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Variables and Data Types. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-powershell">-- Variables and Data Types
Import-Module SqlServer
$servers = @('SQL01','SQL02','SQL03')
foreach ($s in $servers) {
  $q = "SELECT name, state_desc FROM sys.databases"
  Invoke-Sqlcmd -ServerInstance $s -Query $q |
    Select-Object @{n='Server';e={$s}}, name, state_desc
}</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-powershell">-- Variables and Data Types
$params = @{
  ServerInstance = 'SQL01'
  Query          = 'SELECT name FROM sys.databases'
}
Invoke-Sqlcmd @params | Format-Table -AutoSize</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-powershell">-- Variables and Data Types
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
  <p>With Variables and Data Types, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Variables and Data Types",
      html: `
<p>This section consolidates <strong>Variables and Data Types</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.</p>
<p>Email notifications close the loop: a report that nobody reads has limited value. Database Mail or SMTP from PowerShell can deliver succinct, actionable alerts.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Variables and Data Types sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Concept</th><th>Purpose</th><th>Example</th></tr>
  <tr><td>Cmdlet</td><td>Single action</td><td>Get-Service</td></tr>
  <tr><td>Pipeline</td><td>Chain objects</td><td>Where-Object</td></tr>
  <tr><td>Splatting</td><td>Pass a parameter hash</td><td>@params</td></tr>
</table>
<p>PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.</p>
<p>Use the following as a starting point when investigating Variables and Data Types. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-powershell"># Variables and Data Types
$params = @{
  ServerInstance = 'SQL01'
  Query          = 'SELECT name FROM sys.databases'
}
Invoke-Sqlcmd @params | Format-Table -AutoSize</code></pre>
<p>PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications. It is an essential force multiplier in an enterprise estate.</p>
      `,
    }
  ],

  scenario: {
    title: "The script that ran on production",
    html: `
A health-check script was copied from a lab and run against production with a cleanup switch left enabled, deleting old backup files. The backup retention policy was restored from the script's dry-run output. The lesson: test on non-production, default to read-only, make destructive actions explicit and require confirmation.
<p><strong>The Variables and Data Types lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "What makes a DBA script safe for production?",
      a: `
Testing on non-production, defaulting to read-only, explicit destructive switches, try/catch with -ErrorAction Stop, clear logging and idempotent behaviour that checks state before changing it.
      `,
    },
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
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within PowerShell automation for DBAs.”",
      "options": [
        "Variables and Data Types",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions.",
        "The diagram below places Variables and Data Types alongside the core concepts of PowerShell automation for DBAs."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Variables and Data Types within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Variables and Data Types fits”?",
      "options": [
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "The following comparison captures the distinctions that matter most when working with Variables and Data Types:",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions. Never use a script in production that you have not tested against a non-production instance.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Variables and Data Types in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "The diagram below places Variables and Data Types alongside the core concepts of PowerShell automation for DBAs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Variables and Data Types”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "The following comparison captures the distinctions that matter most when working with Variables and Data Types:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Variables and Data Types. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Variables and Data Types:",
        "Email notifications close the loop: a report that nobody reads has limited value.",
        "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications. It is an essential force multiplier in an enterprise estate.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Where-Object",
        "Variables and Data Types",
        "Get-Service"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Variables and Data Types with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Variables and Data Types means”?",
      "options": [
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…",
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model for administration tasks.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Variables and Data Types fits”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "The diagram below places Variables and Data Types alongside the core concepts of PowerShell automation for DBAs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Variables and Data Types alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Variables and Data Types in practice”?",
      "options": [
        "With Variables and Data Types, prefer measured, reversible changes.",
        "The following comparison captures the distinctions that matter most when working with Variables and Data Types:",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Variables and Data Types:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Variables and Data Types”?",
      "options": [
        "The first example establishes the relevant state.",
        "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications.",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within PowerShell automation for DBAs.”",
      "options": [
        "Variables and Data Types",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions.",
        "The diagram below places Variables and Data Types alongside the core concepts of PowerShell automation for DBAs."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Variables and Data Types within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Variables and Data Types fits”?",
      "options": [
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "The following comparison captures the distinctions that matter most when working with Variables and Data Types:",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions. Never use a script in production that you have not tested against a non-production instance.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Variables and Data Types in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "The diagram below places Variables and Data Types alongside the core concepts of PowerShell automation for DBAs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Variables and Data Types”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "The following comparison captures the distinctions that matter most when working with Variables and Data Types:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Variables and Data Types. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Variables and Data Types:",
        "Email notifications close the loop: a report that nobody reads has limited value.",
        "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications. It is an essential force multiplier in an enterprise estate.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Where-Object",
        "Variables and Data Types",
        "Get-Service"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Variables and Data Types with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Variables and Data Types means”?",
      "options": [
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…",
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model for administration tasks.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Variables and Data Types fits”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "The diagram below places Variables and Data Types alongside the core concepts of PowerShell automation for DBAs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Variables and Data Types alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Variables and Data Types in practice”?",
      "options": [
        "With Variables and Data Types, prefer measured, reversible changes.",
        "The following comparison captures the distinctions that matter most when working with Variables and Data Types:",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Variables and Data Types:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Variables and Data Types”?",
      "options": [
        "The first example establishes the relevant state.",
        "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications.",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within PowerShell automation for DBAs.”",
      "options": [
        "Variables and Data Types",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions.",
        "The diagram below places Variables and Data Types alongside the core concepts of PowerShell automation for DBAs."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Variables and Data Types within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Variables and Data Types fits”?",
      "options": [
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "The following comparison captures the distinctions that matter most when working with Variables and Data Types:",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions. Never use a script in production that you have not tested against a non-production instance.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Variables and Data Types in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "The diagram below places Variables and Data Types alongside the core concepts of PowerShell automation for DBAs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Variables and Data Types”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "The following comparison captures the distinctions that matter most when working with Variables and Data Types:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Variables and Data Types. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Variables and Data Types:",
        "Email notifications close the loop: a report that nobody reads has limited value.",
        "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications. It is an essential force multiplier in an enterprise estate.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Where-Object",
        "Variables and Data Types",
        "Get-Service"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Variables and Data Types with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Variables and Data Types means”?",
      "options": [
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…",
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model for administration tasks.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Variables and Data Types fits”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "The diagram below places Variables and Data Types alongside the core concepts of PowerShell automation for DBAs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Variables and Data Types alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Variables and Data Types in practice”?",
      "options": [
        "With Variables and Data Types, prefer measured, reversible changes.",
        "The following comparison captures the distinctions that matter most when working with Variables and Data Types:",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Variables and Data Types:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Variables and Data Types”?",
      "options": [
        "The first example establishes the relevant state.",
        "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications.",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Variables and Data Types is a fundamental concept in PowerShell automation for DBAs",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Variables and Data Types improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
