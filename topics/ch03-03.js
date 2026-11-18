/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch03-03.html */

window.TOPIC = {
  id: "ch03-03",
  title: "SQL Server Windows Services",

  lead: "SQL Server is not one process but a small family of Windows services — the Database Engine, SQL Agent, the Browser, and optional extras — and knowing which service does what is the first step in diagnosing any 'it won't start' or 'it won't connect' incident.",

  objectives: [
    "Name the core SQL Server services and what each one does",
    "Understand instance-aware service naming for named instances",
    "Map each service to its ports, logs, and dependencies",
    "Start, stop, and inspect SQL services with the right tools",
    "Diagnose service-level failures using Event Viewer and the SQL error log"
  ],

  sections: [
    {
      h: "The core service family",
      html: `
<p>SQL Server Setup installs services according to the selected components and edition. The Database Engine and SQL Server Agent are separate services; optional components add other services.</p>
<table>
  <tr><th>Service</th><th>Service name</th><th>Purpose</th></tr>
  <tr><td><strong>SQL Server (Database Engine)</strong></td><td>MSSQLSERVER</td><td>The relational engine: connections, queries, storage, security</td></tr>
  <tr><td><strong>SQL Server Agent</strong></td><td>SQLSERVERAGENT</td><td>Scheduled jobs, alerts, operators; unavailable in Express edition</td></tr>
  <tr><td><strong>SQL Server Browser</strong></td><td>SQLBrowser</td><td>Helps clients locate instances in supported connection scenarios</td></tr>
  <tr><td><strong>SQL Server Launchpad</strong></td><td>SQLLaunchpad</td><td>Supports configured external language features — optional</td></tr>
  <tr><td><strong>SQL Server Analysis/Reporting/Integration</strong></td><td>MSSQLServerOLAP…, SSRS, SSIS</td><td>Optional BI stack services — never required for the Engine</td></tr>
</table>
<p>The Engine accepts database connections. Agent runs SQL Server Agent jobs when the component is available and the service is running; backup jobs can also be scheduled by other tools, so verify the relevant job scheduler and backup history.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="SQL Server service family and their interactions">
    <defs>
      <marker id="sqlsvc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="30" y="30" width="220" height="90" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="140" y="62" text-anchor="middle" fill="var(--accent-strong)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Database Engine</text>
    <text x="140" y="84" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">MSSQLSERVER · TCP (1433 is the default)</text>
    <text x="140" y="104" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">queries · security · storage</text>

    <rect x="30" y="220" width="220" height="90" rx="12" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="140" y="252" text-anchor="middle" fill="var(--text)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">SQL Server Agent</text>
    <text x="140" y="274" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">SQLSERVERAGENT · depends on Engine</text>
    <text x="140" y="294" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">jobs · alerts · operators</text>

    <rect x="530" y="30" width="200" height="90" rx="12" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="630" y="62" text-anchor="middle" fill="var(--text)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">SQL Server Browser</text>
    <text x="630" y="84" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">SQLBrowser · UDP 1434</text>
    <text x="630" y="104" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">instance → port lookup</text>

    <rect x="530" y="220" width="200" height="90" rx="12" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="630" y="252" text-anchor="middle" fill="var(--text)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Clients (SSMS, apps)</text>
    <text x="630" y="274" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">TDS over TCP 1433</text>
    <text x="630" y="294" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">ask Browser for the port</text>

    <line x1="140" y1="220" x2="140" y2="124" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#sqlsvc-arrow)"/>
    <line x1="250" y1="75" x2="528" y2="75" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#sqlsvc-arrow)"/>
    <line x1="560" y1="220" x2="330" y2="140" stroke="var(--muted)" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#sqlsvc-arrow)"/>
    <line x1="530" y1="265" x2="252" y2="265" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#sqlsvc-arrow)"/>

    <text x="384" y="66" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">named-instance port answer</text>
    <text x="440" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">direct connection once port is known</text>
    <text x="140" y="175" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Agent starts only after Engine</text>
  </svg>
  <div class="figcaption">Figure 1 — The Engine is the hub; Agent depends on it, Browser serves port lookups, clients connect over TCP.</div>
</div>
`
    },
    {
      h: "Instance-aware service naming",
      html: `
<p>Each Database Engine instance has its own service name. A default instance uses <code>MSSQLSERVER</code>; named instances include the instance name, allowing multiple instances to coexist.</p>
<table>
  <tr><th>Instance</th><th>Engine service</th><th>Agent service</th></tr>
  <tr><td>Default (MSSQLSERVER)</td><td>MSSQLSERVER</td><td>SQLSERVERAGENT</td></tr>
  <tr><td>Named: <code>INST2</code></td><td>MSSQL$INST2</td><td>SQLAgent$INST2</td></tr>
  <tr><td>Named: <code>PROD</code></td><td>MSSQL$PROD</td><td>SQLAgent$PROD</td></tr>
</table>
<p>The <code>$</code> is literal in the service name — in PowerShell quote the name: <code>Get-Service 'MSSQL$INST2'</code>. Named instances commonly use dynamic ports by default. When clients rely on SQL Server Browser for instance discovery, Browser uses UDP 1434 to return connection information; a fixed port and explicit client configuration can avoid that dependency.</p>
`
    },
    {
      h: "Ports, logs, and dependencies",
      html: `
<p>Each service leaves evidence in a different place. Knowing the map saves you from reading the wrong log under pressure:</p>
<table>
  <tr><th>Service</th><th>Port</th><th>Primary log</th><th>Start dependency</th></tr>
  <tr><td>Database Engine</td><td>Configured TCP port; 1433 is the default instance's default</td><td>SQL Server error log (LOG folder)</td><td>Check the installed service configuration</td></tr>
  <tr><td>SQL Server Agent</td><td>none (outbound only)</td><td>msdb job history + own error log</td><td>MSSQLSERVER</td></tr>
  <tr><td>SQL Server Browser</td><td>UDP 1434</td><td>own error log in LOG folder</td><td>none</td></tr>
</table>
<p>The Agent doesn't expose the Database Engine's client listener, although its jobs can use network resources. Browser is needed only for certain discovery scenarios; if clients use a known port or another supported connection method, it might not be required. Confirm dependencies before changing it.</p>
<pre><code class="language-powershell">Get-Service MSSQL*, SQLAgent*, SQLBrowser* | Format-Table Status, StartType, Name, DisplayName
sc qc MSSQLSERVER
sc qc 'MSSQL$INST2'
netstat -ano | findstr ':1433 :1434'</code></pre>
`
    },
    {
      h: "Starting and stopping SQL services correctly",
      html: `
<p>Use <strong>SQL Server Configuration Manager</strong> for SQL-specific service-account and network configuration. It doesn't replace Windows Firewall management, and stopping or starting a service through a generic SCM tool doesn't automatically change firewall rules or file permissions.</p>
<p>Production rules:</p>
<ul>
  <li><strong>Stop order:</strong> stop or pause relevant Agent jobs before a planned Engine shutdown; don't treat this ordering as a substitute for application and job coordination</li>
  <li><strong>Start order:</strong> Engine first (Agent waits on its dependency automatically)</li>
  <li><strong>Never restart the Engine to fix an Agent problem</strong> — job failures do not justify disconnecting every client</li>
  <li><strong>Prefer graceful stops</strong> — <code>Stop-Service</code> asks for a clean shutdown; a kill forces crash recovery on the next start</li>
</ul>
<pre><code class="language-powershell">Stop-Service -Name SQLSERVERAGENT
Stop-Service -Name MSSQLSERVER
Start-Service -Name MSSQLSERVER
Start-Service -Name SQLSERVERAGENT
Get-Service MSSQLSERVER, SQLSERVERAGENT | Format-Table Status, StartType, Name</code></pre>
`
    },
    {
      h: "Diagnosing a service that will not start",
      html: `
<p>When a SQL service fails to start, read evidence in this order:</p>
<ol>
  <li><strong>Service state and error:</strong> <code>Get-Service</code> plus the SCM event in Event Viewer's System log (7000 series) gives the Windows-side error code</li>
  <li><strong>SQL Server error log:</strong> the Engine writes its own log even for failed starts — look for the phase it died in (resource, recovery, or configuration)</li>
  <li><strong>Registry and config:</strong> a bad <code>max server memory</code>, a missing data file, or a corrupted master database all stop the start sequence</li>
  <li><strong>File permissions:</strong> if the service account changed, the Engine may fail with "access is denied" on MDF/LDF files</li>
</ol>
<p>Classic start failures include <strong>error 1067</strong> (process terminated; inspect the SQL error log), <strong>error 1053</strong> (the service didn't respond in time), and listener-binding errors if another process uses the configured port. Verify the actual configured port rather than assuming 1433.</p>
`
    },
    {
      h: "Where SQL services appear when things break",
      html: `
<p>Three evidence sources, in the order a DBA should read them:</p>
<ul>
  <li><strong>Event Viewer → Windows Logs → System:</strong> Service Control Manager events (7000, 7001, 7024, 7034) tell you a service failed, when, and with which exit code</li>
  <li><strong>Event Viewer → Windows Logs → Application:</strong> SQL Server and SQLAgent write their own entries here with source <code>MSSQLSERVER</code> or <code>SQLAgent</code></li>
  <li><strong>The SQL Server error log:</strong> <code>\\server\\LOG\\ERRORLOG</code> — the definitive record for start failures, recovery phases, and login errors</li>
</ul>
<p>Correlate timestamps across the SCM and SQL Server logs. A Windows service-start event and an engine error-log entry can identify different parts of the same failure; neither log alone always gives the full cause.</p>
`
    }
  ],

  scenario: {
    title: "Engine running, but every nightly backup job silently skipped",
    html: `
<p>Monitoring shows the SQL Server service is Running and users are unaffected — so nobody notices that the SQL Server Agent service has been Stopped since a server reboot on Saturday. On Monday the DBA is asked to restore a table dropped by a developer, and discovers the last successful full backup is four days old. The restore window is now measured in minutes, not hours.</p>
<p>Diagnosis: the Agent had startup type Manual (changed during a previous troubleshooting session and never reverted), so it did not come back after the reboot; no alert watched the Agent service state because uptime checks only tested port 1433. Resolution: start the Agent, re-run the missed full backup, and reconcile backup expectations with the business. Prevention: alert on <em>every</em> SQL service state (not just the Engine), enforce startup types through a configuration baseline, and treat "service is Running" checks as covering the whole service family.</p>
`
  },

  interview: [
    {
      q: "What does the SQL Server Browser service do, and when can you disable it?",
      a: "It listens on UDP 1434 and answers client requests with the TCP port of a named instance that is using dynamic ports. You can disable it when all named instances use static ports, or when clients connect only to default instances or through a configured alias — closing UDP 1434 shrinks the attack surface with no functional loss."
    },
    {
      q: "The database is up and users can query it. How do you know whether backups ran?",
      a: "Check the SQL Server Agent service state first — if the Agent is stopped, no jobs ran regardless of what msdb history claims. Then query msdb for the last successful backup on each database, and confirm the Agent's own error log for the period in question."
    },
    {
      q: "Should you stop SQL services through services.msc or SQL Server Configuration Manager?",
      a: "Configuration Manager. It is SQL Server aware: it maintains the registry settings, firewall rules, and file ACLs that go with the service, whereas services.msc only changes the state and can leave the installation inconsistent — especially when changing service accounts or ports."
    }
  ],

  quiz: [
    {
      "question": "Which fact is covered in the lesson section “The core service family”?",
      "options": [
        "A default SQL Server installation registers these Windows services.",
        "SQLAgent$INST2",
        "SQLAgent$PROD"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A default SQL Server installation registers these Windows services. Each has a distinct failure mode, and mixing them up wastes hours during an incident.”"
    },
    {
      "question": "Complete the lesson statement: “SQL Server services are _____: a named instance gets its own service names with the instance name embedded, so multiple instances coexist without collision.”",
      "options": [
        "SQL Server Analysis/Reporting/Integration",
        "Agent has no port",
        "instance-aware"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “SQL Server services are instance-aware: a named instance gets its own service names with the instance name embedded, so multiple instances coexist without collision.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Ports, logs, and dependencies”?",
      "options": [
        "Optional BI stack services — never required for the Engine",
        "Each service leaves evidence in a different place.",
        "Hosts external language extensions (R/Python) — optional"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Each service leaves evidence in a different place. Knowing the map saves you from reading the wrong log under pressure:”"
    },
    {
      "question": "Complete the lesson statement: “SQL Server services should be controlled through _____, not the generic Services console.”",
      "options": [
        "SQL Server Configuration Manager",
        "Agent has no port",
        "Browser only matters for named instances using dynamic ports"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “SQL Server services should be controlled through SQL Server Configuration Manager, not the generic Services console. Configuration Manager knows about registry paths, firewall exceptions, and the ACLs the Engine needs on its data folders; Services.msc only flips the service state and can leave the rest behind.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Diagnosing a service that will not start”?",
      "options": [
        "instance-aware",
        "The $ is literal in the service name — in PowerShell quote the name: Get-Service 'MSSQL$INST2'.",
        "When a SQL service fails to start, read evidence in this order:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “When a SQL service fails to start, read evidence in this order:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL services appear when things break”?",
      "options": [
        "SQLSERVERAGENT",
        "Three evidence sources, in the order a DBA should read them:",
        "The $ is literal in the service name — in PowerShell quote the name: Get-Service 'MSSQL$INST2'."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Three evidence sources, in the order a DBA should read them:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The core service family”?",
      "options": [
        "The Engine and Agent are the two that matter at 3 AM: without the Engine nothing connects; without the Agent your backups, log-shipping, and maintenance jobs silently never run —…",
        "none",
        "SQL Server Configuration Manager"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The Engine and Agent are the two that matter at 3 AM: without the Engine nothing connects; without the Agent your backups, log-shipping, and maintenance jobs silently never run — which you discover at restore time.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Instance-aware service naming”?",
      "options": [
        "MSSQLSERVER",
        "none",
        "The $ is literal in the service name — in PowerShell quote the name: Get-Service 'MSSQL$INST2'."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The $ is literal in the service name — in PowerShell quote the name: Get-Service 'MSSQL$INST2'. Named instances also default to dynamic ports, which is where the Browser service earns its keep: it listens on UDP 1434 and tells clients which TCP port the instance is currently using.”"
    },
    {
      "question": "Complete the lesson statement: “Two operational consequences: the _____ — job failures are never a firewall problem — and the Browser only matters for named instances using dynamic ports; if you fix named…”",
      "options": [
        "Service state and error:",
        "Agent has no port",
        "Prefer graceful stops"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Two operational consequences: the Agent has no port — job failures are never a firewall problem — and the Browser only matters for named instances using dynamic ports; if you fix named instances to a static port, Browser can be disabled to shrink the attack surface.”"
    },
    {
      "question": "Complete the lesson statement: “Classic start failures and their signatures: _____ (process terminated — read the SQL error log for the real reason), error 1053 (did not respond in time — often a slow recovery of a large…”",
      "options": [
        "error 1067",
        "Prefer graceful stops",
        "Service state and error:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Classic start failures and their signatures: error 1067 (process terminated — read the SQL error log for the real reason), error 1053 (did not respond in time — often a slow recovery of a large tempdb), and port already in use (another instance or a stale process holds 1433).”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “The core service family”?",
      "options": [
        "A default SQL Server installation registers these Windows services.",
        "SQLAgent$INST2",
        "SQLAgent$PROD"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A default SQL Server installation registers these Windows services. Each has a distinct failure mode, and mixing them up wastes hours during an incident.”"
    },
    {
      "question": "Complete the lesson statement: “SQL Server services are _____: a named instance gets its own service names with the instance name embedded, so multiple instances coexist without collision.”",
      "options": [
        "SQL Server Analysis/Reporting/Integration",
        "Agent has no port",
        "instance-aware"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “SQL Server services are instance-aware: a named instance gets its own service names with the instance name embedded, so multiple instances coexist without collision.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Ports, logs, and dependencies”?",
      "options": [
        "Optional BI stack services — never required for the Engine",
        "Each service leaves evidence in a different place.",
        "Hosts external language extensions (R/Python) — optional"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Each service leaves evidence in a different place. Knowing the map saves you from reading the wrong log under pressure:”"
    },
    {
      "question": "Complete the lesson statement: “SQL Server services should be controlled through _____, not the generic Services console.”",
      "options": [
        "SQL Server Configuration Manager",
        "Agent has no port",
        "Browser only matters for named instances using dynamic ports"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “SQL Server services should be controlled through SQL Server Configuration Manager, not the generic Services console. Configuration Manager knows about registry paths, firewall exceptions, and the ACLs the Engine needs on its data folders; Services.msc only flips the service state and can leave the rest behind.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Diagnosing a service that will not start”?",
      "options": [
        "instance-aware",
        "The $ is literal in the service name — in PowerShell quote the name: Get-Service 'MSSQL$INST2'.",
        "When a SQL service fails to start, read evidence in this order:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “When a SQL service fails to start, read evidence in this order:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL services appear when things break”?",
      "options": [
        "SQLSERVERAGENT",
        "Three evidence sources, in the order a DBA should read them:",
        "The $ is literal in the service name — in PowerShell quote the name: Get-Service 'MSSQL$INST2'."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Three evidence sources, in the order a DBA should read them:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The core service family”?",
      "options": [
        "The Engine and Agent are the two that matter at 3 AM: without the Engine nothing connects; without the Agent your backups, log-shipping, and maintenance jobs silently never run —…",
        "none",
        "SQL Server Configuration Manager"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The Engine and Agent are the two that matter at 3 AM: without the Engine nothing connects; without the Agent your backups, log-shipping, and maintenance jobs silently never run — which you discover at restore time.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Instance-aware service naming”?",
      "options": [
        "MSSQLSERVER",
        "none",
        "The $ is literal in the service name — in PowerShell quote the name: Get-Service 'MSSQL$INST2'."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The $ is literal in the service name — in PowerShell quote the name: Get-Service 'MSSQL$INST2'. Named instances also default to dynamic ports, which is where the Browser service earns its keep: it listens on UDP 1434 and tells clients which TCP port the instance is currently using.”"
    },
    {
      "question": "Complete the lesson statement: “Two operational consequences: the _____ — job failures are never a firewall problem — and the Browser only matters for named instances using dynamic ports; if you fix named…”",
      "options": [
        "Service state and error:",
        "Agent has no port",
        "Prefer graceful stops"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Two operational consequences: the Agent has no port — job failures are never a firewall problem — and the Browser only matters for named instances using dynamic ports; if you fix named instances to a static port, Browser can be disabled to shrink the attack surface.”"
    },
    {
      "question": "Complete the lesson statement: “Classic start failures and their signatures: _____ (process terminated — read the SQL error log for the real reason), error 1053 (did not respond in time — often a slow recovery of a large…”",
      "options": [
        "error 1067",
        "Prefer graceful stops",
        "Service state and error:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Classic start failures and their signatures: error 1067 (process terminated — read the SQL error log for the real reason), error 1053 (did not respond in time — often a slow recovery of a large tempdb), and port already in use (another instance or a stale process holds 1433).”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “The core service family”?",
      "options": [
        "A default SQL Server installation registers these Windows services.",
        "SQLAgent$INST2",
        "SQLAgent$PROD"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A default SQL Server installation registers these Windows services. Each has a distinct failure mode, and mixing them up wastes hours during an incident.”"
    },
    {
      "question": "Complete the lesson statement: “SQL Server services are _____: a named instance gets its own service names with the instance name embedded, so multiple instances coexist without collision.”",
      "options": [
        "SQL Server Analysis/Reporting/Integration",
        "Agent has no port",
        "instance-aware"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “SQL Server services are instance-aware: a named instance gets its own service names with the instance name embedded, so multiple instances coexist without collision.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Ports, logs, and dependencies”?",
      "options": [
        "Optional BI stack services — never required for the Engine",
        "Each service leaves evidence in a different place.",
        "Hosts external language extensions (R/Python) — optional"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Each service leaves evidence in a different place. Knowing the map saves you from reading the wrong log under pressure:”"
    },
    {
      "question": "Complete the lesson statement: “SQL Server services should be controlled through _____, not the generic Services console.”",
      "options": [
        "SQL Server Configuration Manager",
        "Agent has no port",
        "Browser only matters for named instances using dynamic ports"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “SQL Server services should be controlled through SQL Server Configuration Manager, not the generic Services console. Configuration Manager knows about registry paths, firewall exceptions, and the ACLs the Engine needs on its data folders; Services.msc only flips the service state and can leave the rest behind.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Diagnosing a service that will not start”?",
      "options": [
        "instance-aware",
        "The $ is literal in the service name — in PowerShell quote the name: Get-Service 'MSSQL$INST2'.",
        "When a SQL service fails to start, read evidence in this order:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “When a SQL service fails to start, read evidence in this order:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL services appear when things break”?",
      "options": [
        "SQLSERVERAGENT",
        "Three evidence sources, in the order a DBA should read them:",
        "The $ is literal in the service name — in PowerShell quote the name: Get-Service 'MSSQL$INST2'."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Three evidence sources, in the order a DBA should read them:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The core service family”?",
      "options": [
        "The Engine and Agent are the two that matter at 3 AM: without the Engine nothing connects; without the Agent your backups, log-shipping, and maintenance jobs silently never run —…",
        "none",
        "SQL Server Configuration Manager"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The Engine and Agent are the two that matter at 3 AM: without the Engine nothing connects; without the Agent your backups, log-shipping, and maintenance jobs silently never run — which you discover at restore time.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Instance-aware service naming”?",
      "options": [
        "MSSQLSERVER",
        "none",
        "The $ is literal in the service name — in PowerShell quote the name: Get-Service 'MSSQL$INST2'."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The $ is literal in the service name — in PowerShell quote the name: Get-Service 'MSSQL$INST2'. Named instances also default to dynamic ports, which is where the Browser service earns its keep: it listens on UDP 1434 and tells clients which TCP port the instance is currently using.”"
    },
    {
      "question": "Complete the lesson statement: “Two operational consequences: the _____ — job failures are never a firewall problem — and the Browser only matters for named instances using dynamic ports; if you fix named…”",
      "options": [
        "Service state and error:",
        "Agent has no port",
        "Prefer graceful stops"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Two operational consequences: the Agent has no port — job failures are never a firewall problem — and the Browser only matters for named instances using dynamic ports; if you fix named instances to a static port, Browser can be disabled to shrink the attack surface.”"
    },
    {
      "question": "Complete the lesson statement: “Classic start failures and their signatures: _____ (process terminated — read the SQL error log for the real reason), error 1053 (did not respond in time — often a slow recovery of a large…”",
      "options": [
        "error 1067",
        "Prefer graceful stops",
        "Service state and error:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Classic start failures and their signatures: error 1067 (process terminated — read the SQL error log for the real reason), error 1053 (did not respond in time — often a slow recovery of a large tempdb), and port already in use (another instance or a stale process holds 1433).”"
    }
  ],
  takeaways: [
    "SQL Server is a service family: Engine (connectivity), Agent (jobs), Browser (port lookup), plus optional extras",
    "Services are instance-aware — MSSQL$INST2 / SQLAgent$INST2 for named instances",
    "Agent has no port; Browser serves UDP 1434 for named instances on dynamic ports",
    "Control SQL services with SQL Server Configuration Manager, not services.msc",
    "An Engine that is Running does not prove jobs ran — monitor every service in the family"
  ]
};
