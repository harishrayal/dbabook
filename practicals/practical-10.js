/* Practical content file — one JS file per practical lab.
   Rendered by assets/js/site.js on practicals/practical-10.html */

window.TOPIC = {
  id: "practical-10",
  title: "Automation",

  lead: "A hands-on automation lab: use PowerShell and the SqlServer module to build multi-server health, backup and service reports, add error handling and splatting, and deliver the result by email.",

  objectives: [
    "Query SQL Server from PowerShell with Invoke-Sqlcmd",
    "Use the pipeline and splatting for readable scripts",
    "Add try/catch and -ErrorAction Stop",
    "Build a multi-server backup and service report",
    "Send an actionable email summary"
  ],

  sections: [
    {
      h: "Before you start",
      html: `
<p>This lab turns repetitive checks into a script you can schedule. You will query several instances from PowerShell, collect results as objects, and email a concise report with exceptions highlighted.</p>
<p>Use a local instance (or several lab instances) and the SqlServer PowerShell module. Run scripts read-only first — automation that changes state should be an explicit, tested choice, never the default.</p>
<p><strong>Environment check</strong> — confirm where you are before changing anything; this habit prevents production mistakes:</p>
<pre><code class="language-powershell"># Lab step
Import-Module SqlServer
$params = @{
  ServerInstance = 'localhost'
  Query          = 'SELECT name, state_desc FROM sys.databases'
}
Invoke-Sqlcmd @params |
  Select-Object name, state_desc |
  Format-Table -AutoSize</code></pre>
      `,
    },
    {
      h: "Lab architecture",
      html: `
<p>PowerShell passes objects down the pipeline, not text, which makes filtering and formatting reliable. Cmdlets do the work; functions and loops let you scale a check from one server to many.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="PowerShell automation flow">
    <defs>
      <marker id="pa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="200" y="10" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="31" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Server list</text>
    <line x1="380" y1="54" x2="380" y2="64" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="64" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="85" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Invoke-Sqlcmd with splatting</text>
    <line x1="380" y1="108" x2="380" y2="118" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="118" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="139" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. try/catch per server</text>
    <line x1="380" y1="162" x2="380" y2="172" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="172" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="193" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Collect and format objects</text>
    <line x1="380" y1="216" x2="380" y2="226" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="226" width="360" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)"/>
    <text x="380" y="247" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Email / export report</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">PowerShell automation flow</text>
  </svg>
  <div class="figcaption">Figure 1 — Gather targets, query each with error handling, collect objects, then format and deliver.</div>
</div>
<p>The flow below is the automation pattern to reuse: gather targets, query each one, collect typed results, format a report, then deliver it and fail loudly on errors.</p>
      `,
    },
    {
      h: "Core tasks",
      html: `
<p>Start with a single Invoke-Sqlcmd call using splatting — a hashtable of parameters passed with @params — which keeps long commands readable and avoids fragile line continuations.</p>
<table>
  <tr><th>Concept</th><th>Purpose</th><th>Example</th></tr>
  <tr><td>Cmdlet</td><td>Single action</td><td>Get-Service</td></tr>
  <tr><td>Pipeline</td><td>Chain objects</td><td>Where-Object</td></tr>
  <tr><td>Splatting</td><td>Pass a parameter hashtable</td><td>@params</td></tr>
</table>
<p>Wrap each server query in try/catch with -ErrorAction Stop so an unreachable instance produces a clear exception rather than a silent blank row. Record the failure in the report.</p>
<pre><code class="language-powershell"># Lab step
$servers = @('SQL01','SQL02','SQL03')
foreach ($s in $servers) {
  try {
    $q = "SELECT @@SERVERNAME AS srv, name, state_desc FROM sys.databases"
    Invoke-Sqlcmd -ServerInstance $s -Query $q -ErrorAction Stop |
      Select-Object @{n='Server';e={$_.srv}}, name, state_desc
  } catch {
    [pscustomobject]@{ Server=$s; name='UNREACHABLE'; state_desc=$_.Exception.Message }
  }
}</code></pre>
      `,
    },
    {
      h: "Verify your work",
      html: `
<p>Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:</p>
<pre><code class="language-powershell"># Lab step
$summary = foreach ($s in $servers) {
  $q = @"
SELECT d.name AS db,
       max(b.backup_finish_date) AS last_backup
FROM sys.databases d
LEFT JOIN msdb.dbo.backupset b ON b.database_name=d.name
GROUP BY d.name
"@
  Invoke-Sqlcmd -ServerInstance $s -Query $q -ErrorAction Stop |
    Select-Object @{n='Server';e={$s}}, db, last_backup
}
$summary | Export-Csv -Path .\backup_report.csv -NoTypeInformation</code></pre>
<p>Scale to a list of servers with foreach, and use Select-Object and calculated properties to add the server name and format numbers. Export with Export-Csv or ConvertTo-Html.</p>
<p>If the output differs, stop and correct it before moving on. A lab that 'looks right' but was never verified teaches the wrong lessons.</p>
      `,
    },
    {
      h: "Pitfalls and safe practice",
      html: `
<p>Finally, email the summary through Database Mail (sp_send_dbmail) or an SMTP cmdlet. A report nobody reads has little value — make it short, highlight exceptions, and send it on a schedule.</p>
<table>
  <tr><th>Report</th><th>Data source</th><th>Cadence</th></tr>
  <tr><td>Backup status</td><td>msdb backupset</td><td>Daily</td></tr>
  <tr><td>Disk space</td><td>dm_os_volume_stats</td><td>Daily</td></tr>
  <tr><td>Job failures</td><td>sysjobhistory</td><td>Daily</td></tr>
</table>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.</p>
</div>
      `,
    }
  ],

  steps: [
    "Install or confirm the SqlServer PowerShell module (Install-Module SqlServer) and import it.",
    "Run a single Invoke-Sqlcmd query using splatting and confirm the output.",
    "Wrap the query in try/catch with -ErrorAction Stop and test it against an invalid server name to see clean error handling.",
    "Create a $servers array and loop over it, adding the server name to each result with a calculated property.",
    "Replace hard-coded parameters with @params splatting and confirm the script still works.",
    "Build a backup-status report across all servers from msdb.dbo.backupset.",
    "Export the results with Export-Csv and inspect the file.",
    "Convert the report to HTML with ConvertTo-Html and highlight rows with stale backups.",
    "Send the summary with sp_send_dbmail through Database Mail (or an SMTP cmdlet) and verify delivery.",
    "Schedule the script with SQL Agent or Task Scheduler and document where its output goes."
  ],

  scenario: {
    title: "The script that ran against production",
    html: `
A health-check script copied from a lab was run against production with a cleanup switch still enabled and deleted old backup files. Recovery came from the script's dry-run output and a restored retention policy. The lesson: default to read-only, make destructive actions explicit switches, test on non-production, and use try/catch so failures are loud. Automation multiplies both good practice and mistakes — choose carefully.
<p><strong>The lesson:</strong> practise both the diagnosis and the safe mitigation in this lab. Under pressure, the steps you have rehearsed are the steps you will actually take — build good muscle memory now.</p>
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
Loop over the server list (optionally in parallel), use Invoke-Sqlcmd against msdb to get the last backup per database, collect results as objects, and export or email a formatted summary while failing loudly on unreachable servers.
      `,
    },
    {
      q: "What makes a DBA script safe for production?",
      a: `
Testing on non-production, defaulting to read-only, explicit destructive switches, try/catch with -ErrorAction Stop, clear logging, and idempotent behaviour that checks state before changing it.
      `,
    }
  ],

  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "Finally, email the summary through Database Mail (sp_send_dbmail) or an SMTP cmdlet.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "This lab turns repetitive checks into a script you can schedule."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “This lab turns repetitive checks into a script you can schedule. You will query several instances from PowerShell, collect results as objects, and email a concise report with exceptions highlighted.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "PowerShell passes objects down the pipeline, not text, which makes filtering and formatting reliable.",
        "Finally, email the summary through Database Mail (sp_send_dbmail) or an SMTP cmdlet."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “PowerShell passes objects down the pipeline, not text, which makes filtering and formatting reliable. Cmdlets do the work; functions and loops let you scale a check from one server to many.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Start with a single Invoke-Sqlcmd call using splatting — a hashtable of parameters passed with @params — which keeps long commands readable and avoids fragile line continuations.",
        "Get-Service",
        "Where-Object"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Start with a single Invoke-Sqlcmd call using splatting — a hashtable of parameters passed with @params — which keeps long commands readable and avoids fragile line continuations.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Scale to a list of servers with foreach, and use Select-Object and calculated properties to add the server name and format numbers.",
        "If the output differs, stop and correct it before moving on.",
        "Never assume a lab step worked — verify against the catalog views and DMVs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "This lab turns repetitive checks into a script you can schedule.",
        "Finally, email the summary through Database Mail (sp_send_dbmail) or an SMTP cmdlet.",
        "Daily"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Finally, email the summary through Database Mail (sp_send_dbmail) or an SMTP cmdlet. A report nobody reads has little value — make it short, highlight exceptions, and send it on a schedule.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "Use a local instance (or several lab instances) and the SqlServer PowerShell module.",
        "PowerShell passes objects down the pipeline, not text, which makes filtering and formatting reliable.",
        "The flow below is the automation pattern to reuse: gather targets, query each one, collect typed results, format a report, then deliver it and fail loudly on errors."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Use a local instance (or several lab instances) and the SqlServer PowerShell module. Run scripts read-only first — automation that changes state should be an explicit, tested choice, never the default.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Use a local instance (or several lab instances) and the SqlServer PowerShell module.",
        "Environment check",
        "The flow below is the automation pattern to reuse: gather targets, query each one, collect typed results, format a report, then deliver it and fail loudly on errors."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The flow below is the automation pattern to reuse: gather targets, query each one, collect typed results, format a report, then deliver it and fail loudly on errors.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "PowerShell passes objects down the pipeline, not text, which makes filtering and formatting reliable.",
        "Wrap each server query in try/catch with -ErrorAction Stop so an unreachable instance produces a clear exception rather than a silent blank row.",
        "Environment check"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Wrap each server query in try/catch with -ErrorAction Stop so an unreachable instance produces a clear exception rather than a silent blank row. Record the failure in the report.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Scale to a list of servers with foreach, and use Select-Object and calculated properties to add the server name and format numbers.",
        "PowerShell passes objects down the pipeline, not text, which makes filtering and formatting reliable.",
        "The flow below is the automation pattern to reuse: gather targets, query each one, collect typed results, format a report, then deliver it and fail loudly on errors."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Scale to a list of servers with foreach, and use Select-Object and calculated properties to add the server name and format numbers. Export with Export-Csv or ConvertTo-Html.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "The flow below is the automation pattern to reuse: gather targets, query each one, collect typed results, format a report, then deliver it and fail loudly on errors.",
        "Start with a single Invoke-Sqlcmd call using splatting — a hashtable of parameters passed with @params — which keeps long commands readable and avoids fragile line continuations.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "Finally, email the summary through Database Mail (sp_send_dbmail) or an SMTP cmdlet.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "This lab turns repetitive checks into a script you can schedule."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “This lab turns repetitive checks into a script you can schedule. You will query several instances from PowerShell, collect results as objects, and email a concise report with exceptions highlighted.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "PowerShell passes objects down the pipeline, not text, which makes filtering and formatting reliable.",
        "Finally, email the summary through Database Mail (sp_send_dbmail) or an SMTP cmdlet."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “PowerShell passes objects down the pipeline, not text, which makes filtering and formatting reliable. Cmdlets do the work; functions and loops let you scale a check from one server to many.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Start with a single Invoke-Sqlcmd call using splatting — a hashtable of parameters passed with @params — which keeps long commands readable and avoids fragile line continuations.",
        "Get-Service",
        "Where-Object"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Start with a single Invoke-Sqlcmd call using splatting — a hashtable of parameters passed with @params — which keeps long commands readable and avoids fragile line continuations.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Scale to a list of servers with foreach, and use Select-Object and calculated properties to add the server name and format numbers.",
        "If the output differs, stop and correct it before moving on.",
        "Never assume a lab step worked — verify against the catalog views and DMVs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "This lab turns repetitive checks into a script you can schedule.",
        "Finally, email the summary through Database Mail (sp_send_dbmail) or an SMTP cmdlet.",
        "Daily"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Finally, email the summary through Database Mail (sp_send_dbmail) or an SMTP cmdlet. A report nobody reads has little value — make it short, highlight exceptions, and send it on a schedule.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "Use a local instance (or several lab instances) and the SqlServer PowerShell module.",
        "PowerShell passes objects down the pipeline, not text, which makes filtering and formatting reliable.",
        "The flow below is the automation pattern to reuse: gather targets, query each one, collect typed results, format a report, then deliver it and fail loudly on errors."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Use a local instance (or several lab instances) and the SqlServer PowerShell module. Run scripts read-only first — automation that changes state should be an explicit, tested choice, never the default.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Use a local instance (or several lab instances) and the SqlServer PowerShell module.",
        "Environment check",
        "The flow below is the automation pattern to reuse: gather targets, query each one, collect typed results, format a report, then deliver it and fail loudly on errors."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The flow below is the automation pattern to reuse: gather targets, query each one, collect typed results, format a report, then deliver it and fail loudly on errors.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "PowerShell passes objects down the pipeline, not text, which makes filtering and formatting reliable.",
        "Wrap each server query in try/catch with -ErrorAction Stop so an unreachable instance produces a clear exception rather than a silent blank row.",
        "Environment check"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Wrap each server query in try/catch with -ErrorAction Stop so an unreachable instance produces a clear exception rather than a silent blank row. Record the failure in the report.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Scale to a list of servers with foreach, and use Select-Object and calculated properties to add the server name and format numbers.",
        "PowerShell passes objects down the pipeline, not text, which makes filtering and formatting reliable.",
        "The flow below is the automation pattern to reuse: gather targets, query each one, collect typed results, format a report, then deliver it and fail loudly on errors."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Scale to a list of servers with foreach, and use Select-Object and calculated properties to add the server name and format numbers. Export with Export-Csv or ConvertTo-Html.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "The flow below is the automation pattern to reuse: gather targets, query each one, collect typed results, format a report, then deliver it and fail loudly on errors.",
        "Start with a single Invoke-Sqlcmd call using splatting — a hashtable of parameters passed with @params — which keeps long commands readable and avoids fragile line continuations.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "Finally, email the summary through Database Mail (sp_send_dbmail) or an SMTP cmdlet.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "This lab turns repetitive checks into a script you can schedule."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “This lab turns repetitive checks into a script you can schedule. You will query several instances from PowerShell, collect results as objects, and email a concise report with exceptions highlighted.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "PowerShell passes objects down the pipeline, not text, which makes filtering and formatting reliable.",
        "Finally, email the summary through Database Mail (sp_send_dbmail) or an SMTP cmdlet."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “PowerShell passes objects down the pipeline, not text, which makes filtering and formatting reliable. Cmdlets do the work; functions and loops let you scale a check from one server to many.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Start with a single Invoke-Sqlcmd call using splatting — a hashtable of parameters passed with @params — which keeps long commands readable and avoids fragile line continuations.",
        "Get-Service",
        "Where-Object"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Start with a single Invoke-Sqlcmd call using splatting — a hashtable of parameters passed with @params — which keeps long commands readable and avoids fragile line continuations.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Scale to a list of servers with foreach, and use Select-Object and calculated properties to add the server name and format numbers.",
        "If the output differs, stop and correct it before moving on.",
        "Never assume a lab step worked — verify against the catalog views and DMVs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "This lab turns repetitive checks into a script you can schedule.",
        "Finally, email the summary through Database Mail (sp_send_dbmail) or an SMTP cmdlet.",
        "Daily"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Finally, email the summary through Database Mail (sp_send_dbmail) or an SMTP cmdlet. A report nobody reads has little value — make it short, highlight exceptions, and send it on a schedule.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "Use a local instance (or several lab instances) and the SqlServer PowerShell module.",
        "PowerShell passes objects down the pipeline, not text, which makes filtering and formatting reliable.",
        "The flow below is the automation pattern to reuse: gather targets, query each one, collect typed results, format a report, then deliver it and fail loudly on errors."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Use a local instance (or several lab instances) and the SqlServer PowerShell module. Run scripts read-only first — automation that changes state should be an explicit, tested choice, never the default.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Use a local instance (or several lab instances) and the SqlServer PowerShell module.",
        "Environment check",
        "The flow below is the automation pattern to reuse: gather targets, query each one, collect typed results, format a report, then deliver it and fail loudly on errors."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The flow below is the automation pattern to reuse: gather targets, query each one, collect typed results, format a report, then deliver it and fail loudly on errors.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "PowerShell passes objects down the pipeline, not text, which makes filtering and formatting reliable.",
        "Wrap each server query in try/catch with -ErrorAction Stop so an unreachable instance produces a clear exception rather than a silent blank row.",
        "Environment check"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Wrap each server query in try/catch with -ErrorAction Stop so an unreachable instance produces a clear exception rather than a silent blank row. Record the failure in the report.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Scale to a list of servers with foreach, and use Select-Object and calculated properties to add the server name and format numbers.",
        "PowerShell passes objects down the pipeline, not text, which makes filtering and formatting reliable.",
        "The flow below is the automation pattern to reuse: gather targets, query each one, collect typed results, format a report, then deliver it and fail loudly on errors."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Scale to a list of servers with foreach, and use Select-Object and calculated properties to add the server name and format numbers. Export with Export-Csv or ConvertTo-Html.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "The flow below is the automation pattern to reuse: gather targets, query each one, collect typed results, format a report, then deliver it and fail loudly on errors.",
        "Start with a single Invoke-Sqlcmd call using splatting — a hashtable of parameters passed with @params — which keeps long commands readable and avoids fragile line continuations.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.”"
    }
  ],
  takeaways: [
    "Objects in the pipeline make PowerShell reports reliable and composable",
    "Splatting keeps long commands readable and avoids fragile continuations",
    "try/catch with -ErrorAction Stop makes failures loud, not silent",
    "Default automation to read-only; make destructive actions explicit",
    "A concise, scheduled, emailed report turns checks into repeatable evidence"
  ]
};
