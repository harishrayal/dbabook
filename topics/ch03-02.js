/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch03-02.html */

window.TOPIC = {
  id: "ch03-02",
  title: "Windows Services",

  lead: "Windows services are the background processes that start with the operating system and keep running without anyone logged in — SQL Server itself is a pair of them, and their configuration decides whether your database survives a reboot.",

  objectives: [
    "Explain what a Windows service is and how the Service Control Manager works",
    "Distinguish service states and startup types",
    "Inspect dependencies and recovery options",
    "Manage services safely from PowerShell and sc.exe",
    "Diagnose a service that will not start or stops unexpectedly"
  ],

  sections: [
    {
      h: "What a service is",
      html: `
<p>A <strong>Windows service</strong> is an executable registered with the <strong>Service Control Manager (SCM)</strong> so it can start automatically at boot, run in its own session without an interactive user, and be started, stopped, paused, and queried by other processes. Services are why your database is available at 4 AM with nobody at a keyboard.</p>
<p>Each service has a display name (what humans see in <code>services.msc</code>), a short service name (what scripts and <code>sc</code> use), a binary path, an account it runs under, and a set of dependencies — other services that must be running first. The SCM owns all of this configuration in the registry and enforces it at every boot.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Windows service lifecycle managed by the SCM">
    <defs>
      <marker id="svc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="40" y="30" width="200" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="140" y="56" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="600" font-family="Segoe UI, sans-serif">Service Control Manager</text>
    <text x="140" y="77" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">registry · start type · account</text>

    <rect x="300" y="30" width="180" height="60" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="390" y="56" text-anchor="middle" fill="var(--accent-strong)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">Running</text>
    <text x="390" y="77" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">accepting start/stop</text>

    <rect x="560" y="30" width="160" height="60" rx="10" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="640" y="56" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="600" font-family="Segoe UI, sans-serif">Stopped</text>
    <text x="640" y="77" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">not listening</text>

    <rect x="300" y="150" width="180" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="390" y="176" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="600" font-family="Segoe UI, sans-serif">Paused</text>
    <text x="390" y="197" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">suspended requests</text>

    <rect x="560" y="150" width="160" height="60" rx="10" fill="var(--surface)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="640" y="176" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="600" font-family="Segoe UI, sans-serif">Failed</text>
    <text x="640" y="197" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">recovery actions run</text>

    <line x1="240" y1="55" x2="298" y2="55" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#svc-arrow)"/>
    <line x1="480" y1="55" x2="558" y2="55" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#svc-arrow)"/>
    <line x1="390" y1="90" x2="390" y2="148" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#svc-arrow)"/>
    <line x1="480" y1="180" x2="558" y2="180" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#svc-arrow)"/>
    <line x1="640" y1="150" x2="640" y2="92" stroke="var(--muted)" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#svc-arrow)"/>

    <text x="268" y="45" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">start</text>
    <text x="518" y="45" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">stop</text>
    <text x="640" y="128" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">restart on failure</text>

    <rect x="40" y="150" width="200" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="140" y="176" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Startup type</text>
    <text x="140" y="197" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Automatic · Manual · Disabled</text>

    <line x1="240" y1="180" x2="352" y2="180" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#svc-arrow)"/>
    <text x="140" y="250" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">SCM decides at boot; recovery actions decide after a crash.</text>
    <line x1="140" y1="210" x2="140" y2="262" stroke="var(--muted)" stroke-width="1.6" stroke-dasharray="4 4" marker-end="url(#svc-arrow)"/>
  </svg>
  <div class="figcaption">Figure 1 — The SCM drives service state; recovery actions decide what happens after a failure.</div>
</div>
`
    },
    {
      h: "States and startup types",
      html: `
<p>Two independent properties describe a service: its current <strong>state</strong> and its configured <strong>startup type</strong>. Confusing them is a classic debugging error — a service set to Automatic can still be Stopped right now.</p>
<table>
  <tr><th>Startup type</th><th>Behaviour at boot</th><th>Typical use</th></tr>
  <tr><td><strong>Automatic</strong></td><td>Starts during boot, in dependency order</td><td>SQL Server Database Engine, SQL Agent</td></tr>
  <tr><td><strong>Automatic (Delayed Start)</strong></td><td>Starts ~2 minutes after boot</td><td>Reduces boot contention on busy servers</td></tr>
  <tr><td><strong>Manual</strong></td><td>Starts only when another service or command requests it</td><td>SQL Server Browser on some builds</td></tr>
  <tr><td><strong>Disabled</strong></td><td>Cannot start at all</td><td>Attack-surface reduction — never for the Engine</td></tr>
</table>
<p>States are <code>Running</code>, <code>Stopped</code>, <code>Paused</code> (the SCM still tracks it, but requests queue), and <code>StartPending</code>/<code>StopPending</code> transitional states you see while a service is coming up or shutting down — SQL Server can sit in <code>StopPending</code> for minutes while it rolls back transactions.</p>
`
    },
    {
      h: "Dependencies, accounts, and recovery",
      html: `
<p>A service's <strong>dependencies</strong> are services that must be running before it can start. The Engine typically depends on RPCSS and HTTP; SQL Agent depends on the Engine. If a dependency is stopped or stuck, your service will not start and the SCM logs a clear event.</p>
<p><strong>Recovery options</strong> define what happens after the first, second, and subsequent failures: restart the service, run a program, or reboot the machine. On a database server the sensible default is <em>restart the service</em> with a reset period, never <em>reboot the machine</em> — a reboot turns one service failure into a full outage with failover and recovery time attached.</p>
<pre><code class="language-powershell">Get-Service SQLSERVERAGENT | Format-List Name, DisplayName, Status, StartType
Get-Service SQLSERVERAGENT -RequiredServices | Format-Table Status, Name, DisplayName
sc qc MSSQLSERVER
sc qdescription MSSQLSERVER</code></pre>
<p><code>sc qc</code> shows the binary path, start type, account, and dependency list — the four facts you need before touching any service.</p>
`
    },
    {
      h: "Managing services safely",
      html: `
<p>PowerShell is the safe interface: it validates input, works remotely through <code>Invoke-Command</code>, and can be scripted and reviewed. The rules for production are simple:</p>
<ul>
  <li><strong>Never stop the Engine to "try something"</strong> — stopping SQL Server disconnects every client and starts a recovery cycle on restart</li>
  <li><strong>Change startup type deliberately</strong> — <code>Set-Service -StartupType Disabled</code> on the Engine guarantees the next reboot is an outage</li>
  <li><strong>Use SQL Server Configuration Manager for SQL services</strong> — it also fixes registry and permission state that the plain Services console does not touch</li>
  <li><strong>Restart Agent, not the Engine, for Agent-only problems</strong> — job failures rarely justify taking the database offline</li>
</ul>
<pre><code class="language-powershell">Set-Service -Name SQLSERVERAGENT -StartupType Automatic
Set-Service -Name MSSQLSERVER -StartupType Automatic
Start-Service -Name MSSQLSERVER
Get-Service MSSQLSERVER, SQLSERVERAGENT | Format-Table Status, StartType, Name</code></pre>
`
    },
    {
      h: "Troubleshooting a service that will not start",
      html: `
<p>Work in this order — it is the same order the OS uses:</p>
<ol>
  <li><strong>Read the state</strong>: <code>Get-Service</code> gives Running/Stopped and the start type</li>
  <li><strong>Read Event Viewer</strong>: System log Service Control Manager events (7000, 7001, 7024, 7034) name the failure and often the error code</li>
  <li><strong>Read the service's own log</strong>: for SQL Server, the SQL Server error log in the log directory</li>
  <li><strong>Check the account</strong>: a domain account with an expired password or a changed password stops the service from logging on</li>
  <li><strong>Check dependencies and ports</strong>: a stopped dependency or a port already held by another process both produce start failures</li>
</ol>
<p>Common error codes: <strong>5</strong> (access denied — wrong account or permissions), <strong>1053</strong> (the service did not respond in time — often a hung start), <strong>1067</strong> (the process terminated unexpectedly — read the service's own log).</p>
`
    },
    {
      h: "Service accounts in one line",
      html: `
<p>Every service runs as <em>some</em> account, and that account decides what the service can touch. The Engine's account needs rights on the data and log folders, the ability to log on as a service, and — for instant file initialization — the perform-volume-maintenance privilege. SQL Server Configuration Manager grants these for you; Services.msc does not, which is why account changes belong there and not in the generic console.</p>
<table>
  <tr><th>Account type</th><th>Identity</th><th>Typical use</th></tr>
  <tr><td><strong>Virtual service account</strong></td><td>NT SERVICE\\MSSQLSERVER</td><td>Default for a default instance — least privilege, no password to manage</td></tr>
  <tr><td><strong>Domain service account</strong></td><td>DOMAIN\\svc-sql</td><td>Needed for domain-resource access: backups to shares, AG replication endpoints</td></tr>
  <tr><td><strong>LocalSystem</strong></td><td>Computer account</td><td>Avoid — over-privileged and a security audit finding waiting to happen</td></tr>
</table>
<p>Topic <strong>ch03-16</strong> covers service accounts in depth; here it is enough to know that a service failing to log on is an account problem, not a SQL Server problem.</p>
`
    }
  ],

  scenario: {
    title: "Monday morning: SQL Agent stopped, nobody touched it",
    html: `
<p>At 08:10 the monitoring alerts that no SQL Agent job has run since 03:00. Users are still querying fine — the Engine is up — but the overnight ETL and backups never happened. The DBA finds SQLSERVERAGENT in state <code>Stopped</code> with start type Automatic, and Event Viewer shows SCM event 7034: "The SQL Server Agent service terminated unexpectedly" at 03:00.</p>
<p>Diagnosis: the service account's password had expired under the domain's 90-day policy, and the Agent had crashed during a job step that called out over the network. The Engine, running as a virtual service account, was unaffected — which is why the outage looked "partial". Resolution: reset the account password in SQL Server Configuration Manager (not Services.msc), start the Agent, re-run the failed jobs in dependency order, then move the Agent to a managed service account with non-expiring credentials. Prevention: alert on service state, not only on connectivity, and track password-expiry dates for every service account.</p>
`
  },

  interview: [
    {
      q: "What is the difference between a service's state and its startup type?",
      a: "State is what the service is doing right now — Running, Stopped, Paused, or a transitional state like StartPending. Startup type is the policy for the next boot: Automatic, Automatic (Delayed Start), Manual, or Disabled. A service can be Automatic yet currently Stopped, which is exactly the situation you check before assuming a reboot fixed something."
    },
    {
      q: "Why should recovery options on a SQL Server service restart the service rather than reboot the machine?",
      a: "A service restart recovers in seconds to minutes and leaves the OS and other services untouched. A reboot adds boot time, OS patching cycles, failover or recovery time, and potentially takes down every other workload on the host. Reboot recovery also hides the underlying failure instead of forcing you to diagnose it."
    },
    {
      q: "How do you find out why a Windows service failed to start?",
      a: "Read the Service Control Manager events in Event Viewer's System log — 7000/7001 for start failures with the error code, 7024 with the exit code, 7034/7031 for unexpected terminations — then cross-check the service's own log (the SQL Server error log for the Engine) and verify the account, dependencies, and port availability with sc qc."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is an executable registered with the Service Control Manager (SCM) so it can start automatically at boot, run in its own session without an interactive user, and be started, stopped, paused, and queried by other processes.”",
      "options": [
        "Automatic",
        "Windows service",
        "startup type"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A Windows service is an executable registered with the Service Control Manager (SCM) so it can start automatically at boot, run in its own session without an interactive user, and be started, stopped, paused, and queried by other processes. Services are why your database is available at 4 AM with nobody at a keyboard.”"
    },
    {
      "question": "Complete the lesson statement: “Two independent properties describe a service: its current _____ and its configured startup type.”",
      "options": [
        "state",
        "Automatic",
        "Automatic (Delayed Start)"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Two independent properties describe a service: its current state and its configured startup type. Confusing them is a classic debugging error — a service set to Automatic can still be Stopped right now.”"
    },
    {
      "question": "Complete the lesson statement: “A service's _____ are services that must be running before it can start.”",
      "options": [
        "Automatic",
        "Automatic (Delayed Start)",
        "dependencies"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A service's dependencies are services that must be running before it can start. The Engine typically depends on RPCSS and HTTP; SQL Agent depends on the Engine. If a dependency is stopped or stuck, your service will not start and the SCM logs a clear event.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Managing services safely”?",
      "options": [
        "SQL Server Browser on some builds",
        "PowerShell is the safe interface: it validates input, works remotely through Invoke-Command, and can be scripted and reviewed.",
        "Reduces boot contention on busy servers"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “PowerShell is the safe interface: it validates input, works remotely through Invoke-Command, and can be scripted and reviewed. The rules for production are simple:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Troubleshooting a service that will not start”?",
      "options": [
        "Work in this order — it is the same order the OS uses:",
        "SQL Server Browser on some builds",
        "Attack-surface reduction — never for the Engine"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Work in this order — it is the same order the OS uses:”"
    },
    {
      "question": "Complete the lesson statement: “Every service runs as _____ account, and that account decides what the service can touch.”",
      "options": [
        "Disabled",
        "dependencies",
        "some"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Every service runs as some account, and that account decides what the service can touch. The Engine's account needs rights on the data and log folders, the ability to log on as a service, and — for instant file initialization — the perform-volume-maintenance privilege. SQL Server Configuration Manager grants these for you; Services.msc does not, which is why account changes belong there and not in the generic console.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What a service is”?",
      "options": [
        "PowerShell is the safe interface: it validates input, works remotely through Invoke-Command, and can be scripted and reviewed.",
        "msc ), a short service name (what scripts and sc use), a binary path, an account it runs under, and a set of dependencies — other services that must be running first.",
        "sc qc shows the binary path, start type, account, and dependency list — the four facts you need before touching any service."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Each service has a display name (what humans see in services.msc ), a short service name (what scripts and sc use), a binary path, an account it runs under, and a set of dependencies — other services that must be running first. The SCM owns all of this configuration in the registry and enforces it at every boot.”"
    },
    {
      "question": "Which fact is covered in the lesson section “States and startup types”?",
      "options": [
        "States are Running, Stopped, Paused (the SCM still tracks it, but requests queue), and StartPending / StopPending transitional states you see while a service is coming up or…",
        "ch03-16",
        "Default for a default instance — least privilege, no password to manage"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “States are Running, Stopped, Paused (the SCM still tracks it, but requests queue), and StartPending / StopPending transitional states you see while a service is coming up or shutting down — SQL Server can sit in StopPending for minutes while it rolls back transactions.”"
    },
    {
      "question": "Complete the lesson statement: “_____ define what happens after the first, second, and subsequent failures: restart the service, run a program, or reboot the machine.”",
      "options": [
        "reboot the machine",
        "Never stop the Engine to \"try something\"",
        "Recovery options"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Recovery options define what happens after the first, second, and subsequent failures: restart the service, run a program, or reboot the machine. On a database server the sensible default is restart the service with a reset period, never reboot the machine — a reboot turns one service failure into a full outage with failover and recovery time attached.”"
    },
    {
      "question": "Complete the lesson statement: “Common error codes: 5 (access denied — wrong account or permissions), _____ (the service did not respond in time — often a hung start), 1067 (the process terminated unexpectedly — read the service's own log).”",
      "options": [
        "Never stop the Engine to \"try something\"",
        "1053",
        "reboot the machine"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Common error codes: 5 (access denied — wrong account or permissions), 1053 (the service did not respond in time — often a hung start), 1067 (the process terminated unexpectedly — read the service's own log).”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is an executable registered with the Service Control Manager (SCM) so it can start automatically at boot, run in its own session without an interactive user, and be started, stopped, paused, and queried by other processes.”",
      "options": [
        "Automatic",
        "Windows service",
        "startup type"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A Windows service is an executable registered with the Service Control Manager (SCM) so it can start automatically at boot, run in its own session without an interactive user, and be started, stopped, paused, and queried by other processes. Services are why your database is available at 4 AM with nobody at a keyboard.”"
    },
    {
      "question": "Complete the lesson statement: “Two independent properties describe a service: its current _____ and its configured startup type.”",
      "options": [
        "state",
        "Automatic",
        "Automatic (Delayed Start)"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Two independent properties describe a service: its current state and its configured startup type. Confusing them is a classic debugging error — a service set to Automatic can still be Stopped right now.”"
    },
    {
      "question": "Complete the lesson statement: “A service's _____ are services that must be running before it can start.”",
      "options": [
        "Automatic",
        "Automatic (Delayed Start)",
        "dependencies"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A service's dependencies are services that must be running before it can start. The Engine typically depends on RPCSS and HTTP; SQL Agent depends on the Engine. If a dependency is stopped or stuck, your service will not start and the SCM logs a clear event.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Managing services safely”?",
      "options": [
        "SQL Server Browser on some builds",
        "PowerShell is the safe interface: it validates input, works remotely through Invoke-Command, and can be scripted and reviewed.",
        "Reduces boot contention on busy servers"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “PowerShell is the safe interface: it validates input, works remotely through Invoke-Command, and can be scripted and reviewed. The rules for production are simple:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Troubleshooting a service that will not start”?",
      "options": [
        "Work in this order — it is the same order the OS uses:",
        "SQL Server Browser on some builds",
        "Attack-surface reduction — never for the Engine"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Work in this order — it is the same order the OS uses:”"
    },
    {
      "question": "Complete the lesson statement: “Every service runs as _____ account, and that account decides what the service can touch.”",
      "options": [
        "Disabled",
        "dependencies",
        "some"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Every service runs as some account, and that account decides what the service can touch. The Engine's account needs rights on the data and log folders, the ability to log on as a service, and — for instant file initialization — the perform-volume-maintenance privilege. SQL Server Configuration Manager grants these for you; Services.msc does not, which is why account changes belong there and not in the generic console.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What a service is”?",
      "options": [
        "PowerShell is the safe interface: it validates input, works remotely through Invoke-Command, and can be scripted and reviewed.",
        "msc ), a short service name (what scripts and sc use), a binary path, an account it runs under, and a set of dependencies — other services that must be running first.",
        "sc qc shows the binary path, start type, account, and dependency list — the four facts you need before touching any service."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Each service has a display name (what humans see in services.msc ), a short service name (what scripts and sc use), a binary path, an account it runs under, and a set of dependencies — other services that must be running first. The SCM owns all of this configuration in the registry and enforces it at every boot.”"
    },
    {
      "question": "Which fact is covered in the lesson section “States and startup types”?",
      "options": [
        "States are Running, Stopped, Paused (the SCM still tracks it, but requests queue), and StartPending / StopPending transitional states you see while a service is coming up or…",
        "ch03-16",
        "Default for a default instance — least privilege, no password to manage"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “States are Running, Stopped, Paused (the SCM still tracks it, but requests queue), and StartPending / StopPending transitional states you see while a service is coming up or shutting down — SQL Server can sit in StopPending for minutes while it rolls back transactions.”"
    },
    {
      "question": "Complete the lesson statement: “_____ define what happens after the first, second, and subsequent failures: restart the service, run a program, or reboot the machine.”",
      "options": [
        "reboot the machine",
        "Never stop the Engine to \"try something\"",
        "Recovery options"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Recovery options define what happens after the first, second, and subsequent failures: restart the service, run a program, or reboot the machine. On a database server the sensible default is restart the service with a reset period, never reboot the machine — a reboot turns one service failure into a full outage with failover and recovery time attached.”"
    },
    {
      "question": "Complete the lesson statement: “Common error codes: 5 (access denied — wrong account or permissions), _____ (the service did not respond in time — often a hung start), 1067 (the process terminated unexpectedly — read the service's own log).”",
      "options": [
        "Never stop the Engine to \"try something\"",
        "1053",
        "reboot the machine"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Common error codes: 5 (access denied — wrong account or permissions), 1053 (the service did not respond in time — often a hung start), 1067 (the process terminated unexpectedly — read the service's own log).”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is an executable registered with the Service Control Manager (SCM) so it can start automatically at boot, run in its own session without an interactive user, and be started, stopped, paused, and queried by other processes.”",
      "options": [
        "Automatic",
        "Windows service",
        "startup type"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A Windows service is an executable registered with the Service Control Manager (SCM) so it can start automatically at boot, run in its own session without an interactive user, and be started, stopped, paused, and queried by other processes. Services are why your database is available at 4 AM with nobody at a keyboard.”"
    },
    {
      "question": "Complete the lesson statement: “Two independent properties describe a service: its current _____ and its configured startup type.”",
      "options": [
        "state",
        "Automatic",
        "Automatic (Delayed Start)"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Two independent properties describe a service: its current state and its configured startup type. Confusing them is a classic debugging error — a service set to Automatic can still be Stopped right now.”"
    },
    {
      "question": "Complete the lesson statement: “A service's _____ are services that must be running before it can start.”",
      "options": [
        "Automatic",
        "Automatic (Delayed Start)",
        "dependencies"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A service's dependencies are services that must be running before it can start. The Engine typically depends on RPCSS and HTTP; SQL Agent depends on the Engine. If a dependency is stopped or stuck, your service will not start and the SCM logs a clear event.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Managing services safely”?",
      "options": [
        "SQL Server Browser on some builds",
        "PowerShell is the safe interface: it validates input, works remotely through Invoke-Command, and can be scripted and reviewed.",
        "Reduces boot contention on busy servers"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “PowerShell is the safe interface: it validates input, works remotely through Invoke-Command, and can be scripted and reviewed. The rules for production are simple:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Troubleshooting a service that will not start”?",
      "options": [
        "Work in this order — it is the same order the OS uses:",
        "SQL Server Browser on some builds",
        "Attack-surface reduction — never for the Engine"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Work in this order — it is the same order the OS uses:”"
    },
    {
      "question": "Complete the lesson statement: “Every service runs as _____ account, and that account decides what the service can touch.”",
      "options": [
        "Disabled",
        "dependencies",
        "some"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Every service runs as some account, and that account decides what the service can touch. The Engine's account needs rights on the data and log folders, the ability to log on as a service, and — for instant file initialization — the perform-volume-maintenance privilege. SQL Server Configuration Manager grants these for you; Services.msc does not, which is why account changes belong there and not in the generic console.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What a service is”?",
      "options": [
        "PowerShell is the safe interface: it validates input, works remotely through Invoke-Command, and can be scripted and reviewed.",
        "msc ), a short service name (what scripts and sc use), a binary path, an account it runs under, and a set of dependencies — other services that must be running first.",
        "sc qc shows the binary path, start type, account, and dependency list — the four facts you need before touching any service."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Each service has a display name (what humans see in services.msc ), a short service name (what scripts and sc use), a binary path, an account it runs under, and a set of dependencies — other services that must be running first. The SCM owns all of this configuration in the registry and enforces it at every boot.”"
    },
    {
      "question": "Which fact is covered in the lesson section “States and startup types”?",
      "options": [
        "States are Running, Stopped, Paused (the SCM still tracks it, but requests queue), and StartPending / StopPending transitional states you see while a service is coming up or…",
        "ch03-16",
        "Default for a default instance — least privilege, no password to manage"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “States are Running, Stopped, Paused (the SCM still tracks it, but requests queue), and StartPending / StopPending transitional states you see while a service is coming up or shutting down — SQL Server can sit in StopPending for minutes while it rolls back transactions.”"
    },
    {
      "question": "Complete the lesson statement: “_____ define what happens after the first, second, and subsequent failures: restart the service, run a program, or reboot the machine.”",
      "options": [
        "reboot the machine",
        "Never stop the Engine to \"try something\"",
        "Recovery options"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Recovery options define what happens after the first, second, and subsequent failures: restart the service, run a program, or reboot the machine. On a database server the sensible default is restart the service with a reset period, never reboot the machine — a reboot turns one service failure into a full outage with failover and recovery time attached.”"
    },
    {
      "question": "Complete the lesson statement: “Common error codes: 5 (access denied — wrong account or permissions), _____ (the service did not respond in time — often a hung start), 1067 (the process terminated unexpectedly — read the service's own log).”",
      "options": [
        "Never stop the Engine to \"try something\"",
        "1053",
        "reboot the machine"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Common error codes: 5 (access denied — wrong account or permissions), 1053 (the service did not respond in time — often a hung start), 1067 (the process terminated unexpectedly — read the service's own log).”"
    }
  ],
  takeaways: [
    "Services run without a logged-in user; the Service Control Manager owns their state, start type, account, and dependencies",
    "State (now) and startup type (next boot) are independent — check both before concluding anything",
    "Set recovery to restart the service, never to reboot the machine, on database servers",
    "Use PowerShell and SQL Server Configuration Manager for SQL services; Services.msc does not fix SQL registry state",
    "A start failure is diagnosed in order: state → Event Viewer → service's own log → account → dependencies/ports"
  ]
};
