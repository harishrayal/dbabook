/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch18-17.html */

window.TOPIC = {
  id: "ch18-17",
  title: "Email Notifications",

  lead: "Understanding Email Notifications is essential for anyone responsible for PowerShell automation for DBAs. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what Email Notifications is and where it fits",
    "Explain how Email Notifications works internally",
    "Apply Email Notifications correctly in a production environment",
    "Recognise the common mistakes and risks involving Email Notifications",
    "Monitor and troubleshoot Email Notifications with the right tools"
  ],

  sections: [
    {
      h: "What Email Notifications means",
      html: `
<p>In this topic we examine <strong>Email Notifications</strong> within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications. It is an essential force multiplier in an enterprise estate.</p>
<p>The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts. The pipeline passes objects, not text, which makes filtering and formatting powerful and reliable.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Email Notifications is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Email Notifications fits",
      html: `
<p>The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model for administration tasks.</p>
<p>The diagram below places Email Notifications alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Email Notifications flow">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="230" y="12" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="39" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Cmdlet</text>
    <rect x="230" y="66" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="93" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Pipeline</text>
    <rect x="230" y="120" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="147" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. SMO</text>
    <rect x="230" y="174" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="201" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Script</text>
    <rect x="230" y="228" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="255" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Report</text>
    <rect x="230" y="282" width="300" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="309" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">6. Automation</text>
    <line x1="380" y1="56" x2="380" y2="66" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="110" x2="380" y2="120" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="164" x2="380" y2="174" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="218" x2="380" y2="228" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="272" x2="380" y2="282" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Email Notifications</text>
  </svg>
  <div class="figcaption">Figure 1 — PowerShell automation for DBAs: how Email Notifications relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Email Notifications in practice",
      html: `
<p>Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable. A script that silently continues after an error is worse than one that fails clearly.</p>
<p>The following comparison captures the distinctions that matter most when working with Email Notifications:</p>
<table>
  <tr><th>Concept</th><th>Purpose</th><th>Example</th></tr>
  <tr><td>Cmdlet</td><td>Single action</td><td>Get-Service</td></tr>
  <tr><td>Pipeline</td><td>Chain objects</td><td>Where-Object</td></tr>
  <tr><td>Splatting</td><td>Pass a parameter hash</td><td>@params</td></tr>
</table>
<p>Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions. Never use a script in production that you have not tested against a non-production instance.</p>
      `,
    },
    {
      h: "Working with Email Notifications",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Email Notifications. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-powershell">-- Email Notifications
Import-Module SqlServer
$servers = @('SQL01','SQL02','SQL03')
foreach ($s in $servers) {
  $q = "SELECT name, state_desc FROM sys.databases"
  Invoke-Sqlcmd -ServerInstance $s -Query $q |
    Select-Object @{n='Server';e={$s}}, name, state_desc
}</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-powershell">-- Email Notifications
$params = @{
  ServerInstance = 'SQL01'
  Query          = 'SELECT name FROM sys.databases'
}
Invoke-Sqlcmd @params | Format-Table -AutoSize</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-powershell">-- Email Notifications
Get-Service -Name 'MSSQL*','SQLSERVERAGENT' -ComputerName SQL01 |
  Select-Object Name, Status |
  Format-Table -AutoSize</code></pre>
<p>Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Email notifications close the loop: a report that nobody reads has limited value. Database Mail or SMTP from PowerShell can deliver succinct, actionable alerts.</p>
<table>
  <tr><th>Report</th><th>Data source</th><th>Cadence</th></tr>
  <tr><td>Backup status</td><td>msdb backupset</td><td>Daily</td></tr>
  <tr><td>Disk space</td><td>dm_os_volume_stats</td><td>Daily</td></tr>
  <tr><td>Job failures</td><td>sysjobhistory</td><td>Daily</td></tr>
</table>
<p>PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Email Notifications, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Email Notifications",
      html: `
<p>This section consolidates <strong>Email Notifications</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable. A script that silently continues after an error is worse than one that fails clearly.</p>
<p>Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions. Never use a script in production that you have not tested against a non-production instance.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Email Notifications sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Concept</th><th>Purpose</th><th>Example</th></tr>
  <tr><td>Cmdlet</td><td>Single action</td><td>Get-Service</td></tr>
  <tr><td>Pipeline</td><td>Chain objects</td><td>Where-Object</td></tr>
  <tr><td>Splatting</td><td>Pass a parameter hash</td><td>@params</td></tr>
</table>
<p>Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.</p>
<p>Use the following as a starting point when investigating Email Notifications. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-powershell"># Email Notifications
Import-Module SqlServer
$servers = @('SQL01','SQL02','SQL03')
foreach ($s in $servers) {
  $q = "SELECT name, state_desc FROM sys.databases"
  Invoke-Sqlcmd -ServerInstance $s -Query $q |
    Select-Object @{n='Server';e={$s}}, name, state_desc
}</code></pre>
<p>Email notifications close the loop: a report that nobody reads has limited value. Database Mail or SMTP from PowerShell can deliver succinct, actionable alerts.</p>
      `,
    }
  ],

  scenario: {
    title: "The script that ran on production",
    html: `
A health-check script was copied from a lab and run against production with a cleanup switch left enabled, deleting old backup files. The backup retention policy was restored from the script's dry-run output. The lesson: test on non-production, default to read-only, make destructive actions explicit and require confirmation.
<p><strong>The Email Notifications lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
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
    },
    {
      q: "What is splatting in PowerShell?",
      a: `
Passing a hashtable of parameters to a cmdlet with @params instead of a long positional command line — it improves readability and avoids fragile backtick line continuations.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within PowerShell automation for DBAs.”",
      "options": [
        "Daily",
        "Email Notifications",
        "With Email Notifications, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Email Notifications within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Email Notifications fits”?",
      "options": [
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…",
        "Email Notifications sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model for administration tasks.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Email Notifications in practice”?",
      "options": [
        "Where-Object",
        "@params",
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable. A script that silently continues after an error is worse than one that fails clearly.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Email Notifications”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Email Notifications. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Email notifications close the loop: a report that nobody reads has limited value.",
        "Daily",
        "Email Notifications"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Email notifications close the loop: a report that nobody reads has limited value. Database Mail or SMTP from PowerShell can deliver succinct, actionable alerts.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications.",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts.",
        "Email Notifications"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Email Notifications with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Email Notifications means”?",
      "options": [
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications.",
        "The diagram below places Email Notifications alongside the core concepts of PowerShell automation for DBAs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications. It is an essential force multiplier in an enterprise estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Email Notifications fits”?",
      "options": [
        "The diagram below places Email Notifications alongside the core concepts of PowerShell automation for DBAs.",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts.",
        "Email Notifications is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Email Notifications alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Email Notifications in practice”?",
      "options": [
        "Email Notifications is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…",
        "The following comparison captures the distinctions that matter most when working with Email Notifications:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Email Notifications:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Email Notifications”?",
      "options": [
        "The diagram below places Email Notifications alongside the core concepts of PowerShell automation for DBAs.",
        "The first example establishes the relevant state.",
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within PowerShell automation for DBAs.”",
      "options": [
        "Daily",
        "Email Notifications",
        "With Email Notifications, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Email Notifications within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Email Notifications fits”?",
      "options": [
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…",
        "Email Notifications sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model for administration tasks.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Email Notifications in practice”?",
      "options": [
        "Where-Object",
        "@params",
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable. A script that silently continues after an error is worse than one that fails clearly.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Email Notifications”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Email Notifications. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Email notifications close the loop: a report that nobody reads has limited value.",
        "Daily",
        "Email Notifications"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Email notifications close the loop: a report that nobody reads has limited value. Database Mail or SMTP from PowerShell can deliver succinct, actionable alerts.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications.",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts.",
        "Email Notifications"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Email Notifications with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Email Notifications means”?",
      "options": [
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications.",
        "The diagram below places Email Notifications alongside the core concepts of PowerShell automation for DBAs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications. It is an essential force multiplier in an enterprise estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Email Notifications fits”?",
      "options": [
        "The diagram below places Email Notifications alongside the core concepts of PowerShell automation for DBAs.",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts.",
        "Email Notifications is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Email Notifications alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Email Notifications in practice”?",
      "options": [
        "Email Notifications is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…",
        "The following comparison captures the distinctions that matter most when working with Email Notifications:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Email Notifications:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Email Notifications”?",
      "options": [
        "The diagram below places Email Notifications alongside the core concepts of PowerShell automation for DBAs.",
        "The first example establishes the relevant state.",
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within PowerShell automation for DBAs.”",
      "options": [
        "Daily",
        "Email Notifications",
        "With Email Notifications, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Email Notifications within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Email Notifications fits”?",
      "options": [
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…",
        "Email Notifications sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model for administration tasks.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Email Notifications in practice”?",
      "options": [
        "Where-Object",
        "@params",
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable. A script that silently continues after an error is worse than one that fails clearly.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Email Notifications”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Email Notifications. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Email notifications close the loop: a report that nobody reads has limited value.",
        "Daily",
        "Email Notifications"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Email notifications close the loop: a report that nobody reads has limited value. Database Mail or SMTP from PowerShell can deliver succinct, actionable alerts.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications.",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts.",
        "Email Notifications"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Email Notifications with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Email Notifications means”?",
      "options": [
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications.",
        "The diagram below places Email Notifications alongside the core concepts of PowerShell automation for DBAs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications. It is an essential force multiplier in an enterprise estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Email Notifications fits”?",
      "options": [
        "The diagram below places Email Notifications alongside the core concepts of PowerShell automation for DBAs.",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts.",
        "Email Notifications is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Email Notifications alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Email Notifications in practice”?",
      "options": [
        "Email Notifications is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…",
        "The following comparison captures the distinctions that matter most when working with Email Notifications:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Email Notifications:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Email Notifications”?",
      "options": [
        "The diagram below places Email Notifications alongside the core concepts of PowerShell automation for DBAs.",
        "The first example establishes the relevant state.",
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Email Notifications is a fundamental concept in PowerShell automation for DBAs",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Email Notifications improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
