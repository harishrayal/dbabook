/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch18-02.html */

window.TOPIC = {
  id: "ch18-02",
  title: "PowerShell Commands and Cmdlets",

  lead: "Understanding PowerShell Commands and Cmdlets is essential for anyone responsible for PowerShell automation for DBAs. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what PowerShell Commands and Cmdlets is and where it fits",
    "Explain how PowerShell Commands and Cmdlets works internally",
    "Apply PowerShell Commands and Cmdlets correctly in a production environment",
    "Recognise the common mistakes and risks involving PowerShell Commands and Cmdlets",
    "Monitor and troubleshoot PowerShell Commands and Cmdlets with the right tools"
  ],

  sections: [
    {
      h: "What PowerShell Commands and Cmdlets means",
      html: `
<p>In this topic we examine <strong>PowerShell Commands and Cmdlets</strong> within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts. The pipeline passes objects, not text, which makes filtering and formatting powerful and reliable.</p>
<p>The SqlServer PowerShell module provides commands for querying and managing SQL Server, and beneath them the SQL Server Management Objects (SMO) library offers a full object model for administration tasks.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>PowerShell Commands and Cmdlets is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where PowerShell Commands and Cmdlets fits",
      html: `
<p>Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable. A script that silently continues after an error is worse than one that fails clearly.</p>
<p>The diagram below places PowerShell Commands and Cmdlets alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="PowerShell Commands and Cmdle… flow">
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
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">PowerShell Commands and Cmdle…</text>
  </svg>
  <div class="figcaption">Figure 1 — PowerShell automation for DBAs: how PowerShell Commands and Cmdlets relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "PowerShell Commands and Cmdlets in practice",
      html: `
<p>Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions. Never use a script in production that you have not tested against a non-production instance.</p>
<p>The following comparison captures the distinctions that matter most when working with PowerShell Commands and Cmdlets:</p>
<table>
  <tr><th>Concept</th><th>Purpose</th><th>Example</th></tr>
  <tr><td>Cmdlet</td><td>Single action</td><td>Get-Service</td></tr>
  <tr><td>Pipeline</td><td>Chain objects</td><td>Where-Object</td></tr>
  <tr><td>Splatting</td><td>Pass a parameter hash</td><td>@params</td></tr>
</table>
<p>Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.</p>
      `,
    },
    {
      h: "Working with PowerShell Commands and Cmdlets",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to PowerShell Commands and Cmdlets. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-powershell">-- PowerShell Commands and Cmdlets
Import-Module SqlServer
$servers = @('SQL01','SQL02','SQL03')
foreach ($s in $servers) {
  $q = "SELECT name, state_desc FROM sys.databases"
  Invoke-Sqlcmd -ServerInstance $s -Query $q |
    Select-Object @{n='Server';e={$s}}, name, state_desc
}</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-powershell">-- PowerShell Commands and Cmdlets
$params = @{
  ServerInstance = 'SQL01'
  Query          = 'SELECT name FROM sys.databases'
}
Invoke-Sqlcmd @params | Format-Table -AutoSize</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-powershell">-- PowerShell Commands and Cmdlets
Get-Service -Name 'MSSQL*','SQLSERVERAGENT' -ComputerName SQL01 |
  Select-Object Name, Status |
  Format-Table -AutoSize</code></pre>
<p>Email notifications close the loop: a report that nobody reads has limited value. Database Mail or SMTP from PowerShell can deliver succinct, actionable alerts.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.</p>
<table>
  <tr><th>Report</th><th>Data source</th><th>Cadence</th></tr>
  <tr><td>Backup status</td><td>msdb backupset</td><td>Daily</td></tr>
  <tr><td>Disk space</td><td>dm_os_volume_stats</td><td>Daily</td></tr>
  <tr><td>Job failures</td><td>sysjobhistory</td><td>Daily</td></tr>
</table>
<p>PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications. It is an essential force multiplier in an enterprise estate.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With PowerShell Commands and Cmdlets, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: PowerShell Commands and Cmdlets",
      html: `
<p>This section consolidates <strong>PowerShell Commands and Cmdlets</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions. Never use a script in production that you have not tested against a non-production instance.</p>
<p>Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions. Scheduled with Task Scheduler or Agent, they turn checks into repeatable evidence.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>PowerShell Commands and Cmdlets sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Report</th><th>Data source</th><th>Cadence</th></tr>
  <tr><td>Backup status</td><td>msdb backupset</td><td>Daily</td></tr>
  <tr><td>Disk space</td><td>dm_os_volume_stats</td><td>Daily</td></tr>
  <tr><td>Job failures</td><td>sysjobhistory</td><td>Daily</td></tr>
</table>
<p>Email notifications close the loop: a report that nobody reads has limited value. Database Mail or SMTP from PowerShell can deliver succinct, actionable alerts.</p>
<p>Use the following as a starting point when investigating PowerShell Commands and Cmdlets. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-powershell"># PowerShell Commands and Cmdlets
Import-Module SqlServer
$servers = @('SQL01','SQL02','SQL03')
foreach ($s in $servers) {
  $q = "SELECT name, state_desc FROM sys.databases"
  Invoke-Sqlcmd -ServerInstance $s -Query $q |
    Select-Object @{n='Server';e={$s}}, name, state_desc
}</code></pre>
<p>PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.</p>
      `,
    }
  ],

  scenario: {
    title: "The 40-server health report",
    html: `
A DBA manually checked 40 instances each morning until a PowerShell script queried them all in parallel and emailed a single summary with exceptions highlighted. What took an hour became a two-minute review, with better coverage and a saved audit trail.
<p><strong>The PowerShell Commands and Cmdlets lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
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
        "PowerShell Commands and Cmdlets",
        "PowerShell Commands and Cmdlets is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine PowerShell Commands and Cmdlets within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where PowerShell Commands and Cmdlets fits”?",
      "options": [
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "PowerShell Commands and Cmdlets is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable. A script that silently continues after an error is worse than one that fails clearly.”"
    },
    {
      "question": "Which fact is covered in the lesson section “PowerShell Commands and Cmdlets in practice”?",
      "options": [
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "The diagram below places PowerShell Commands and Cmdlets alongside the core concepts of PowerShell automation for DBAs.",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions. Never use a script in production that you have not tested against a non-production instance.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with PowerShell Commands and Cmdlets”?",
      "options": [
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions.",
        "Theory becomes useful when you can apply it.",
        "The diagram below places PowerShell Commands and Cmdlets alongside the core concepts of PowerShell automation for DBAs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to PowerShell Commands and Cmdlets. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions.",
        "The following comparison captures the distinctions that matter most when working with PowerShell Commands and Cmdlets:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "Get-Service",
        "PowerShell Commands and Cmdlets"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates PowerShell Commands and Cmdlets with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What PowerShell Commands and Cmdlets means”?",
      "options": [
        "The first example establishes the relevant state.",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts. The pipeline passes objects, not text, which makes filtering and formatting powerful and reliable.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where PowerShell Commands and Cmdlets fits”?",
      "options": [
        "The diagram below places PowerShell Commands and Cmdlets alongside the core concepts of PowerShell automation for DBAs.",
        "@params",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places PowerShell Commands and Cmdlets alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “PowerShell Commands and Cmdlets in practice”?",
      "options": [
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.",
        "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications.",
        "The following comparison captures the distinctions that matter most when working with PowerShell Commands and Cmdlets:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with PowerShell Commands and Cmdlets:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with PowerShell Commands and Cmdlets”?",
      "options": [
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.",
        "The first example establishes the relevant state.",
        "@params"
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
        "PowerShell Commands and Cmdlets",
        "PowerShell Commands and Cmdlets is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine PowerShell Commands and Cmdlets within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where PowerShell Commands and Cmdlets fits”?",
      "options": [
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "PowerShell Commands and Cmdlets is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable. A script that silently continues after an error is worse than one that fails clearly.”"
    },
    {
      "question": "Which fact is covered in the lesson section “PowerShell Commands and Cmdlets in practice”?",
      "options": [
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "The diagram below places PowerShell Commands and Cmdlets alongside the core concepts of PowerShell automation for DBAs.",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions. Never use a script in production that you have not tested against a non-production instance.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with PowerShell Commands and Cmdlets”?",
      "options": [
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions.",
        "Theory becomes useful when you can apply it.",
        "The diagram below places PowerShell Commands and Cmdlets alongside the core concepts of PowerShell automation for DBAs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to PowerShell Commands and Cmdlets. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions.",
        "The following comparison captures the distinctions that matter most when working with PowerShell Commands and Cmdlets:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "Get-Service",
        "PowerShell Commands and Cmdlets"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates PowerShell Commands and Cmdlets with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What PowerShell Commands and Cmdlets means”?",
      "options": [
        "The first example establishes the relevant state.",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts. The pipeline passes objects, not text, which makes filtering and formatting powerful and reliable.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where PowerShell Commands and Cmdlets fits”?",
      "options": [
        "The diagram below places PowerShell Commands and Cmdlets alongside the core concepts of PowerShell automation for DBAs.",
        "@params",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places PowerShell Commands and Cmdlets alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “PowerShell Commands and Cmdlets in practice”?",
      "options": [
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.",
        "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications.",
        "The following comparison captures the distinctions that matter most when working with PowerShell Commands and Cmdlets:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with PowerShell Commands and Cmdlets:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with PowerShell Commands and Cmdlets”?",
      "options": [
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.",
        "The first example establishes the relevant state.",
        "@params"
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
        "PowerShell Commands and Cmdlets",
        "PowerShell Commands and Cmdlets is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine PowerShell Commands and Cmdlets within PowerShell automation for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where PowerShell Commands and Cmdlets fits”?",
      "options": [
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "PowerShell Commands and Cmdlets is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable. A script that silently continues after an error is worse than one that fails clearly.”"
    },
    {
      "question": "Which fact is covered in the lesson section “PowerShell Commands and Cmdlets in practice”?",
      "options": [
        "Error handling with try/catch/finally and -ErrorAction Stop makes scripts predictable.",
        "The diagram below places PowerShell Commands and Cmdlets alongside the core concepts of PowerShell automation for DBAs.",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions. Never use a script in production that you have not tested against a non-production instance.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with PowerShell Commands and Cmdlets”?",
      "options": [
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions.",
        "Theory becomes useful when you can apply it.",
        "The diagram below places PowerShell Commands and Cmdlets alongside the core concepts of PowerShell automation for DBAs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to PowerShell Commands and Cmdlets. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.",
        "Automation should be idempotent and safe: check the current state, make the change only if needed, log what happened and fail loudly on unexpected conditions.",
        "The following comparison captures the distinctions that matter most when working with PowerShell Commands and Cmdlets:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Common reports include database and backup status, free disk space, service state, failed jobs and long-running sessions.",
        "Get-Service",
        "PowerShell Commands and Cmdlets"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates PowerShell Commands and Cmdlets with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What PowerShell Commands and Cmdlets means”?",
      "options": [
        "The first example establishes the relevant state.",
        "The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The basics — cmdlets, the pipeline, variables, arrays, loops, conditions and functions — compose into scripts. The pipeline passes objects, not text, which makes filtering and formatting powerful and reliable.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where PowerShell Commands and Cmdlets fits”?",
      "options": [
        "The diagram below places PowerShell Commands and Cmdlets alongside the core concepts of PowerShell automation for DBAs.",
        "@params",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places PowerShell Commands and Cmdlets alongside the core concepts of PowerShell automation for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “PowerShell Commands and Cmdlets in practice”?",
      "options": [
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.",
        "PowerShell lets a DBA automate repetitive work across many servers: health reports, backup status, service monitoring, job checks and notifications.",
        "The following comparison captures the distinctions that matter most when working with PowerShell Commands and Cmdlets:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with PowerShell Commands and Cmdlets:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with PowerShell Commands and Cmdlets”?",
      "options": [
        "PowerShell examples must avoid backtick line continuations — use splatting and pipelines for readable, robust scripts.",
        "The first example establishes the relevant state.",
        "@params"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "PowerShell Commands and Cmdlets is a fundamental concept in PowerShell automation for DBAs",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of PowerShell Commands and Cmdlets improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
