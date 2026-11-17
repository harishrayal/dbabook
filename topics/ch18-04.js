/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch18-04.html */

window.TOPIC = {
  id: "ch18-04",
  title: "Arrays and Loops",

  lead: "Arrays and Loops is a core part of PowerShell automation for DBAs. This topic explains what it is, how it works inside SQL Server, and what a production DBA must know to operate it safely.",

  objectives: [
    "Define what Arrays and Loops is and where it fits",
    "Explain how Arrays and Loops works internally",
    "Apply Arrays and Loops correctly in a production environment",
    "Recognise the common mistakes and risks involving Arrays and Loops",
    "Monitor and troubleshoot Arrays and Loops with the right tools"
  ],

  sections: [
    {
      h: "What Arrays and Loops means",
      html: `
<p>In this topic we examine <strong>Arrays and Loops</strong> within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable. A script that silently continues after an error is worse than one that fails clearly.</p>
<p>Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions. Never use a script in production that you have not tested against a non-production instance.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Arrays and Loops is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Arrays and Loops fits",
      html: `
<p>Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.</p>
<p>The diagram below places Arrays and Loops alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Arrays and Loops concept map">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="280" y="140" width="200" height="60" rx="9" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="175" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Arrays and Loops</text>
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
  <div class="figcaption">Figure 1 — PowerShell automation for DBAs: how Arrays and Loops relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Arrays and Loops in practice",
      html: `
<p>Email notifications close the loop: a report that nobody reads has limited value. Database Mail or SMTP from PowerShell can deliver succinct, actionable alerts.</p>
<p>The following comparison captures the distinctions that matter most when working with Arrays and Loops:</p>
<table>
  <tr><th>Concept</th><th>Purpose</th><th>Example</th></tr>
  <tr><td>Cmdlet</td><td>Single action</td><td>Get-Service</td></tr>
  <tr><td>Pipeline</td><td>Chain objects</td><td>Where-Object</td></tr>
  <tr><td>Splatting</td><td>Pass a parameter hash</td><td>@params</td></tr>
</table>
<p>PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.</p>
      `,
    },
    {
      h: "Working with Arrays and Loops",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Arrays and Loops. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-powershell">-- Arrays and Loops
Import-Module SqlServer
$servers = @('SQL01','SQL02','SQL03')
foreach ($s in $servers) {
  $q = "SELECT name, state_desc FROM sys.databases"
  Invoke-Sqlcmd -ServerInstance $s -Query $q |
    Select-Object @{n='Server';e={$s}}, name, state_desc
}</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-powershell">-- Arrays and Loops
$params = @{
  ServerInstance = 'SQL01'
  Query          = 'SELECT name FROM sys.databases'
}
Invoke-Sqlcmd @params | Format-Table -AutoSize</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-powershell">-- Arrays and Loops
Get-Service -Name 'MSSQL*','SQLSERVERAGENT' -ComputerName SQL01 |
  Select-Object Name, Status |
  Format-Table -AutoSize</code></pre>
<p>PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications. It is an essential force multiplier in an enterprise estate.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts. The pipeline passes objects, not text, which makes filtering and formatting powerful and reliable.</p>
<table>
  <tr><th>Report</th><th>Data source</th><th>Cadence</th></tr>
  <tr><td>Backup status</td><td>msdb backupset</td><td>Daily</td></tr>
  <tr><td>Disk space</td><td>dm_os_volume_stats</td><td>Daily</td></tr>
  <tr><td>Job failures</td><td>sysjobhistory</td><td>Daily</td></tr>
</table>
<p>The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model for administration tasks.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Arrays and Loops, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    }
  ],

  scenario: {
    title: "The 40-server health report",
    html: `
A DBA manually checked 40 instances each morning until a PowerShell script queried them all in parallel and emailed a single summary with exceptions highlighted. What took an hour became a two-minute review, with better coverage and a saved audit trail.
<p><strong>The Arrays and Loops lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
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
        "The diagram below places Arrays and Loops alongside the core concepts of PowerShell automation for DBAs.",
        "Email notifications close the loop: a report that nobody reads has limited value.",
        "Arrays and Loops"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Arrays and Loops within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Arrays and Loops fits”?",
      "options": [
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.",
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "The following comparison captures the distinctions that matter most when working with Arrays and Loops:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Arrays and Loops in practice”?",
      "options": [
        "Email notifications close the loop: a report that nobody reads has limited value.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Email notifications close the loop: a report that nobody reads has limited value. Database Mail or SMTP from PowerShell can deliver succinct, actionable alerts.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Arrays and Loops”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Arrays and Loops:",
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Arrays and Loops. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Get-Service",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts.",
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts. The pipeline passes objects, not text, which makes filtering and formatting powerful and reliable.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Arrays and Loops means”?",
      "options": [
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable. A script that silently continues after an error is worse than one that fails clearly.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Arrays and Loops fits”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "The diagram below places Arrays and Loops alongside the core concepts of PowerShell automation for DBAs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Arrays and Loops alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Arrays and Loops in practice”?",
      "options": [
        "With Arrays and Loops, prefer measured, reversible changes.",
        "The following comparison captures the distinctions that matter most when working with Arrays and Loops:",
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Arrays and Loops:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Arrays and Loops”?",
      "options": [
        "The first example establishes the relevant state.",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts.",
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model for administration tasks.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within PowerShell automation for DBAs.”",
      "options": [
        "The diagram below places Arrays and Loops alongside the core concepts of PowerShell automation for DBAs.",
        "Email notifications close the loop: a report that nobody reads has limited value.",
        "Arrays and Loops"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Arrays and Loops within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Arrays and Loops fits”?",
      "options": [
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.",
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "The following comparison captures the distinctions that matter most when working with Arrays and Loops:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Arrays and Loops in practice”?",
      "options": [
        "Email notifications close the loop: a report that nobody reads has limited value.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Email notifications close the loop: a report that nobody reads has limited value. Database Mail or SMTP from PowerShell can deliver succinct, actionable alerts.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Arrays and Loops”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Arrays and Loops:",
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Arrays and Loops. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Get-Service",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts.",
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts. The pipeline passes objects, not text, which makes filtering and formatting powerful and reliable.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Arrays and Loops means”?",
      "options": [
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable. A script that silently continues after an error is worse than one that fails clearly.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Arrays and Loops fits”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "The diagram below places Arrays and Loops alongside the core concepts of PowerShell automation for DBAs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Arrays and Loops alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Arrays and Loops in practice”?",
      "options": [
        "With Arrays and Loops, prefer measured, reversible changes.",
        "The following comparison captures the distinctions that matter most when working with Arrays and Loops:",
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Arrays and Loops:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Arrays and Loops”?",
      "options": [
        "The first example establishes the relevant state.",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts.",
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model for administration tasks.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within PowerShell automation for DBAs.”",
      "options": [
        "The diagram below places Arrays and Loops alongside the core concepts of PowerShell automation for DBAs.",
        "Email notifications close the loop: a report that nobody reads has limited value.",
        "Arrays and Loops"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Arrays and Loops within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Arrays and Loops fits”?",
      "options": [
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.",
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "The following comparison captures the distinctions that matter most when working with Arrays and Loops:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Arrays and Loops in practice”?",
      "options": [
        "Email notifications close the loop: a report that nobody reads has limited value.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Email notifications close the loop: a report that nobody reads has limited value. Database Mail or SMTP from PowerShell can deliver succinct, actionable alerts.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Arrays and Loops”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Arrays and Loops:",
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Arrays and Loops. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Get-Service",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts.",
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts. The pipeline passes objects, not text, which makes filtering and formatting powerful and reliable.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Arrays and Loops means”?",
      "options": [
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable. A script that silently continues after an error is worse than one that fails clearly.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Arrays and Loops fits”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "The diagram below places Arrays and Loops alongside the core concepts of PowerShell automation for DBAs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Arrays and Loops alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Arrays and Loops in practice”?",
      "options": [
        "With Arrays and Loops, prefer measured, reversible changes.",
        "The following comparison captures the distinctions that matter most when working with Arrays and Loops:",
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Arrays and Loops:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Arrays and Loops”?",
      "options": [
        "The first example establishes the relevant state.",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts.",
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model for administration tasks.”"
    }
  ],
  takeaways: [
    "Arrays and Loops is a fundamental concept in PowerShell automation for DBAs",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Arrays and Loops improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
