/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch18-14.html */

window.TOPIC = {
  id: "ch18-14",
  title: "SQL Server Service Monitoring",

  lead: "Understanding SQL Server Service Monitoring is essential for anyone responsible for PowerShell automation for DBAs. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what SQL Server Service Monitoring is and where it fits",
    "Explain how SQL Server Service Monitoring works internally",
    "Apply SQL Server Service Monitoring correctly in a production environment",
    "Recognise the common mistakes and risks involving SQL Server Service Monitoring",
    "Monitor and troubleshoot SQL Server Service Monitoring with the right tools"
  ],

  sections: [
    {
      h: "What SQL Server Service Monitoring means",
      html: `
<p>In this topic we examine <strong>SQL Server Service Monitoring</strong> within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.</p>
<p>Email notifications close the loop: a report that nobody reads has limited value. Database Mail or SMTP from PowerShell can deliver succinct, actionable alerts.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>SQL Server Service Monitoring is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where SQL Server Service Monitoring fits",
      html: `
<p>PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.</p>
<p>The diagram below places SQL Server Service Monitoring alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="SQL Server Service Monitoring flow">
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
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">SQL Server Service Monitoring</text>
  </svg>
  <div class="figcaption">Figure 1 — PowerShell automation for DBAs: how SQL Server Service Monitoring relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "SQL Server Service Monitoring in practice",
      html: `
<p>PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications. It is an essential force multiplier in an enterprise estate.</p>
<p>The following comparison captures the distinctions that matter most when working with SQL Server Service Monitoring:</p>
<table>
  <tr><th>Concept</th><th>Purpose</th><th>Example</th></tr>
  <tr><td>Cmdlet</td><td>Single action</td><td>Get-Service</td></tr>
  <tr><td>Pipeline</td><td>Chain objects</td><td>Where-Object</td></tr>
  <tr><td>Splatting</td><td>Pass a parameter hash</td><td>@params</td></tr>
</table>
<p>The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts. The pipeline passes objects, not text, which makes filtering and formatting powerful and reliable.</p>
      `,
    },
    {
      h: "Working with SQL Server Service Monitoring",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Service Monitoring. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-powershell">-- SQL Server Service Monitoring
Import-Module SqlServer
$servers = @('SQL01','SQL02','SQL03')
foreach ($s in $servers) {
  $q = "SELECT name, state_desc FROM sys.databases"
  Invoke-Sqlcmd -ServerInstance $s -Query $q |
    Select-Object @{n='Server';e={$s}}, name, state_desc
}</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-powershell">-- SQL Server Service Monitoring
$params = @{
  ServerInstance = 'SQL01'
  Query          = 'SELECT name FROM sys.databases'
}
Invoke-Sqlcmd @params | Format-Table -AutoSize</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-powershell">-- SQL Server Service Monitoring
Get-Service -Name 'MSSQL*','SQLSERVERAGENT' -ComputerName SQL01 |
  Select-Object Name, Status |
  Format-Table -AutoSize</code></pre>
<p>The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model for administration tasks.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable. A script that silently continues after an error is worse than one that fails clearly.</p>
<table>
  <tr><th>Report</th><th>Data source</th><th>Cadence</th></tr>
  <tr><td>Backup status</td><td>msdb backupset</td><td>Daily</td></tr>
  <tr><td>Disk space</td><td>dm_os_volume_stats</td><td>Daily</td></tr>
  <tr><td>Job failures</td><td>sysjobhistory</td><td>Daily</td></tr>
</table>
<p>Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions. Never use a script in production that you have not tested against a non-production instance.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With SQL Server Service Monitoring, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: SQL Server Service Monitoring",
      html: `
<p>This section consolidates <strong>SQL Server Service Monitoring</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications. It is an essential force multiplier in an enterprise estate.</p>
<p>The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts. The pipeline passes objects, not text, which makes filtering and formatting powerful and reliable.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>SQL Server Service Monitoring sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Report</th><th>Data source</th><th>Cadence</th></tr>
  <tr><td>Backup status</td><td>msdb backupset</td><td>Daily</td></tr>
  <tr><td>Disk space</td><td>dm_os_volume_stats</td><td>Daily</td></tr>
  <tr><td>Job failures</td><td>sysjobhistory</td><td>Daily</td></tr>
</table>
<p>The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model for administration tasks.</p>
<p>Use the following as a starting point when investigating SQL Server Service Monitoring. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-powershell"># SQL Server Service Monitoring
Import-Module SqlServer
$servers = @('SQL01','SQL02','SQL03')
foreach ($s in $servers) {
  $q = "SELECT name, state_desc FROM sys.databases"
  Invoke-Sqlcmd -ServerInstance $s -Query $q |
    Select-Object @{n='Server';e={$s}}, name, state_desc
}</code></pre>
<p>Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable. A script that silently continues after an error is worse than one that fails clearly.</p>
      `,
    }
  ],

  scenario: {
    title: "The 40-server health report",
    html: `
A DBA manually checked 40 instances each morning until a PowerShell script queried them all in parallel and emailed a single summary with exceptions highlighted. What took an hour became a two-minute review, with better coverage and a saved audit trail.
<p><strong>The SQL Server Service Monitoring lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
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
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "SQL Server Service Monitoring",
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine SQL Server Service Monitoring within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Service Monitoring fits”?",
      "options": [
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions.",
        "With SQL Server Service Monitoring, prefer measured, reversible changes."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Service Monitoring in practice”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating SQL Server Service Monitoring.",
        "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications. It is an essential force multiplier in an enterprise estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Service Monitoring”?",
      "options": [
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…",
        "Theory becomes useful when you can apply it.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Service Monitoring. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "Use the following as a starting point when investigating SQL Server Service Monitoring.",
        "Daily"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable. A script that silently continues after an error is worse than one that fails clearly.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "SQL Server Service Monitoring sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "SQL Server Service Monitoring"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates SQL Server Service Monitoring with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SQL Server Service Monitoring means”?",
      "options": [
        "SQL Server Service Monitoring is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "Email notifications close the loop: a report that nobody reads has limited value."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Service Monitoring fits”?",
      "options": [
        "The diagram below places SQL Server Service Monitoring alongside the core concepts of PowerShell automation for DBAs.",
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.",
        "SQL Server Service Monitoring"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places SQL Server Service Monitoring alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Service Monitoring in practice”?",
      "options": [
        "SQL Server Service Monitoring",
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Service Monitoring:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SQL Server Service Monitoring:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Service Monitoring”?",
      "options": [
        "Email notifications close the loop: a report that nobody reads has limited value.",
        "The first example establishes the relevant state.",
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within PowerShell automation for DBAs.”",
      "options": [
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "SQL Server Service Monitoring",
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine SQL Server Service Monitoring within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Service Monitoring fits”?",
      "options": [
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions.",
        "With SQL Server Service Monitoring, prefer measured, reversible changes."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Service Monitoring in practice”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating SQL Server Service Monitoring.",
        "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications. It is an essential force multiplier in an enterprise estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Service Monitoring”?",
      "options": [
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…",
        "Theory becomes useful when you can apply it.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Service Monitoring. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "Use the following as a starting point when investigating SQL Server Service Monitoring.",
        "Daily"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable. A script that silently continues after an error is worse than one that fails clearly.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "SQL Server Service Monitoring sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "SQL Server Service Monitoring"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates SQL Server Service Monitoring with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SQL Server Service Monitoring means”?",
      "options": [
        "SQL Server Service Monitoring is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "Email notifications close the loop: a report that nobody reads has limited value."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Service Monitoring fits”?",
      "options": [
        "The diagram below places SQL Server Service Monitoring alongside the core concepts of PowerShell automation for DBAs.",
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.",
        "SQL Server Service Monitoring"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places SQL Server Service Monitoring alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Service Monitoring in practice”?",
      "options": [
        "SQL Server Service Monitoring",
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Service Monitoring:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SQL Server Service Monitoring:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Service Monitoring”?",
      "options": [
        "Email notifications close the loop: a report that nobody reads has limited value.",
        "The first example establishes the relevant state.",
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within PowerShell automation for DBAs.”",
      "options": [
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "SQL Server Service Monitoring",
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine SQL Server Service Monitoring within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Service Monitoring fits”?",
      "options": [
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions.",
        "With SQL Server Service Monitoring, prefer measured, reversible changes."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Service Monitoring in practice”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating SQL Server Service Monitoring.",
        "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications. It is an essential force multiplier in an enterprise estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Service Monitoring”?",
      "options": [
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…",
        "Theory becomes useful when you can apply it.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Service Monitoring. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "Use the following as a starting point when investigating SQL Server Service Monitoring.",
        "Daily"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable. A script that silently continues after an error is worse than one that fails clearly.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "SQL Server Service Monitoring sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "SQL Server Service Monitoring"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates SQL Server Service Monitoring with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SQL Server Service Monitoring means”?",
      "options": [
        "SQL Server Service Monitoring is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "Email notifications close the loop: a report that nobody reads has limited value."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Service Monitoring fits”?",
      "options": [
        "The diagram below places SQL Server Service Monitoring alongside the core concepts of PowerShell automation for DBAs.",
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.",
        "SQL Server Service Monitoring"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places SQL Server Service Monitoring alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Service Monitoring in practice”?",
      "options": [
        "SQL Server Service Monitoring",
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Service Monitoring:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SQL Server Service Monitoring:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Service Monitoring”?",
      "options": [
        "Email notifications close the loop: a report that nobody reads has limited value.",
        "The first example establishes the relevant state.",
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "SQL Server Service Monitoring is a fundamental concept in PowerShell automation for DBAs",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of SQL Server Service Monitoring improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
