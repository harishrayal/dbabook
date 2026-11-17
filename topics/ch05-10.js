/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch05-10.html */

window.TOPIC = {
  id: "ch05-10",
  title: "SQL Server Services",

  lead: "SQL Server is not one program but a family of Windows services — and half of all “the database is down” calls are really a service that stopped, never started, or was never set to start automatically.",

  objectives: [
    "List the services an installed SQL Server depends on",
    "Explain what each service does and what breaks without it",
    "Choose correct startup modes and recovery options",
    "Manage service state from T-SQL and PowerShell",
    "Build monitoring that catches stopped services early"
  ],

  sections: [
    {
      h: "The service family",
      html: `
<p>Every SQL Server host carries a set of services. Know them by name — the display name, the service name, and the job it does:</p>
<table>
  <tr><th>Service (display name)</th><th>Service name</th><th>Purpose</th><th>Recommended start mode</th></tr>
  <tr><td><strong>SQL Server (MSSQLSERVER)</strong></td><td><code>MSSQLSERVER</code></td><td>The Database Engine — runs queries, manages files and logins</td><td>Automatic (Delayed Start)</td></tr>
  <tr><td><strong>SQL Server (PROD)</strong></td><td><code>MSSQL$PROD</code></td><td>Engine for a named instance</td><td>Automatic (Delayed Start)</td></tr>
  <tr><td><strong>SQL Server Agent (…)</strong></td><td><code>SQLAgent$PROD</code></td><td>Jobs, schedules, alerts, operators — the instance's scheduler</td><td>Automatic — verify after install</td></tr>
  <tr><td><strong>SQL Server Browser</strong></td><td><code>SQLBrowser</code></td><td>Resolves named instances to ports (UDP 1434)</td><td>Disabled unless named instances need it</td></tr>
  <tr><td><strong>SQL Server Launchpad</strong></td><td>Launchpad service</td><td>Launches external scripts (R/Python) for Machine Learning Services</td><td>Disabled if ML Services unused</td></tr>
  <tr><td><strong>SQL Server VSS Writer</strong></td><td><code>SQLWriter</code></td><td>Allows Volume Shadow Copy backups of SQL data</td><td>Automatic if VSS backups are used</td></tr>
  <tr><td><strong>SSAS / SSRS / SSIS services</strong></td><td>varies by feature</td><td>Companion features if installed (see ch05-07)</td><td>Only when the feature is in use</td></tr>
</table>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="SQL Server service topology">
    <defs>
      <marker id="svc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="30" y="24" width="700" height="230" rx="14" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="52" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">Windows host · services.msc</text>

    <rect x="230" y="80" width="300" height="76" rx="12" fill="var(--accent)" stroke="var(--accent-strong)" stroke-width="1.8"/>
    <text x="380" y="110" text-anchor="middle" fill="#ffffff" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">SQL Server (Database Engine)</text>
    <text x="380" y="134" text-anchor="middle" fill="#dbeafe" font-size="12" font-family="Segoe UI, sans-serif">sqlservr.exe · port 1433 / static</text>

    <rect x="55" y="80" width="155" height="70" rx="10" fill="var(--surface)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="132" y="106" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">SQL Server Agent</text>
    <text x="132" y="127" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">jobs · alerts · schedules</text>

    <rect x="550" y="80" width="155" height="70" rx="10" fill="var(--surface)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="627" y="106" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">SQL Server Browser</text>
    <text x="627" y="127" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">UDP 1434 · name → port</text>

    <rect x="55" y="176" width="155" height="60" rx="10" fill="var(--surface)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="132" y="200" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">VSS Writer</text>
    <text x="132" y="220" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">shadow-copy backups</text>

    <rect x="300" y="176" width="160" height="60" rx="10" fill="var(--surface)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="380" y="200" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Launchpad</text>
    <text x="380" y="220" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">external scripts (R/Python)</text>

    <rect x="550" y="176" width="155" height="60" rx="10" fill="var(--surface)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="627" y="200" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Companion features</text>
    <text x="627" y="220" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">SSAS · SSRS · SSIS</text>

    <line x1="205" y1="115" x2="228" y2="115" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#svc-arrow)"/>
    <line x1="530" y1="115" x2="548" y2="115" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#svc-arrow)"/>
    <line x1="290" y1="156" x2="160" y2="174" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#svc-arrow)"/>
    <line x1="380" y1="156" x2="380" y2="174" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#svc-arrow)"/>
    <line x1="470" y1="156" x2="600" y2="174" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#svc-arrow)"/>

    <text x="380" y="288" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Engine is the dependency root: without it, Agent, Browser, and every client connection fail together.</text>
    <text x="380" y="314" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Delayed start lets the OS finish booting before SQL claims CPU and memory.</text>
  </svg>
  <div class="figcaption">Figure 1 — Service topology on a typical host: the engine is the root; everything else depends on or supports it.</div>
</div>
`
    },
    {
      h: "What happens when the engine service starts",
      html: `
<p>The Database Engine service (<code>sqlservr.exe</code>) does far more than open a port:</p>
<ol>
  <li>Starts, connects to the <strong>master</strong> database, and reads instance configuration</li>
  <li>Performs <strong>crash recovery</strong> — rolling back incomplete transactions and rolling forward committed ones from the log</li>
  <li>Brings user databases online according to their state</li>
  <li>Starts the <strong>SQL Server Agent</strong> if its startup mode is automatic (Agent starts <em>after</em> the engine)</li>
  <li>Begins listening on its configured port</li>
</ol>
<p>This is why startup order and delays matter: on a busy host, setting both engine and Agent to plain “Automatic” can cause a boot-time resource fight. <strong>Automatic (Delayed Start)</strong> for the engine is the production default you should verify, with the Agent set to automatic only if its jobs are required at boot.</p>
<p>Service recovery options are equally important: configure the service to <strong>restart on failure</strong> (first, second, subsequent restart with a reset timer) so a transient crash self-heals — while still alerting monitoring, because a service that restarts itself three times in a row is telling you something.</p>
`
    },
    {
      h: "Companion services: Agent, Browser, and the rest",
      html: `
<table>
  <tr><th>Service</th><th>Without it…</th><th>Verdict</th></tr>
  <tr><td><strong>SQL Server Agent</strong></td><td>No scheduled jobs: no backups, no maintenance, no ETL, no alerts</td><td>Required on almost every production instance — see ch05-11</td></tr>
  <tr><td><strong>SQL Server Browser</strong></td><td>Named instances cannot be resolved by name on dynamic ports</td><td>Required only for dynamic named instances; disable when all ports are static</td></tr>
  <tr><td><strong>VSS Writer</strong></td><td>Volume Shadow Copy backups cannot snapshot SQL data cleanly</td><td>Keep if your backup strategy uses VSS; otherwise it is harmless overhead</td></tr>
  <tr><td><strong>Launchpad</strong></td><td>External R/Python scripts fail to launch</td><td>Disable when Machine Learning Services is not used — reduce attack surface</td></tr>
  <tr><td><strong>Telemetry / feedback services</strong></td><td>Feature usage data is not sent to Microsoft</td><td>Optional; align with your organisation's data-handling policy</td></tr>
</table>
<p>The pattern: <strong>each service you keep must be needed, monitored, and patched; each service you disable shrinks the attack surface.</strong> Review the list quarterly against the build document.</p>
`
    },
    {
      h: "Managing service state",
      html: `
<p>From inside the instance — useful for monitoring jobs and for servers where you lack interactive access:</p>
<pre><code class="language-sql">-- Full service inventory: start mode, status, process, account
SELECT service_name, startup_type_desc, status_desc, process_id,
       last_startup_time, service_account
FROM   sys.dm_server_services
ORDER  BY service_name;

-- Ask Windows about a specific service
-- (states: querystate, start, stop, pause, continue)
EXEC xp_servicecontrol N'querystate', N'MSSQLSERVER';
EXEC xp_servicecontrol N'querystate', N'SQLServerAGENT';</code></pre>
<p>From the host — what a DBA or infrastructure engineer runs in a maintenance window:</p>
<pre><code class="powershell"># Inventory SQL services and their start modes
Get-Service | Where-Object { $_.Name -like 'MSSQL*' -or $_.Name -like 'SQLAgent*' -or $_.Name -eq 'SQLBrowser' } |
  Format-Table Name, DisplayName, Status, StartType

# Make an Agent service start automatically after reboot
Set-Service -Name 'SQLAgent$PROD' -StartupType Automatic

# Controlled restart of a named instance (Agent follows the engine)
Restart-Service -Name 'MSSQL$PROD' -Force</code></pre>
<p>Note the service-name conventions: the engine on a named instance is <code>MSSQL$INST</code>, the Agent is <code>SQLAgent$INST</code>, and the Browser is <code>SQLBrowser</code> — memorise these; every service incident starts with finding the right name.</p>
`
    },
    {
      h: "Monitoring that actually works",
      html: `
<p>Services fail quietly at 3 AM. Close the loop with three checks:</p>
<ul>
  <li><strong>State monitoring</strong> — alert when any expected SQL service is not running</li>
  <li><strong>Startup-type audit</strong> — a weekly query comparing <code>startup_type_desc</code> against the build document catches group policy edits and manual changes</li>
  <li><strong>Restart awareness</strong> — alert when <code>last_startup_time</code> changes, because an unplanned restart means recovery happened and scheduled jobs may have been missed</li>
</ul>
<pre><code class="language-sql">-- Services whose state disagrees with the expected state
SELECT service_name, startup_type_desc, status_desc, last_startup_time
FROM   sys.dm_server_services
WHERE  status_desc <> N'Running'
   OR  (service_name LIKE N'SQLAgent%' AND startup_type_desc <> N'Automatic');

-- When did this instance last start? (compare with planned maintenance)
SELECT sqlserver_start_time FROM sys.dm_os_sys_info;</code></pre>
<p>Pair these with host-level alerts (service stopped, unexpected reboot) and you will hear about a stopped service from monitoring — never from a user.</p>
`
    }
  ],

  scenario: {
    title: "07:00 — nobody can connect after the overnight patch cycle",
    html: `
<p>Monday morning, users received “connection refused” errors. The overnight patch job had rebooted the server at 02:00. The Database Engine had come back only because the patch script started it manually — its startup type had been left as Manual; the Agent was stopped, so no backups ran; and the Browser service was disabled, so every named-instance connection string failed even though the engine was listening on its port. Monitoring watched query performance only, so nothing alerted for five hours.</p>
<p>Resolution: set the engine and Agent startup types to Automatic (Delayed Start), started Browser until static ports were configured, verified remote connectivity for each instance, and re-ran the missed backup and maintenance jobs. Root cause: <strong>service configuration was treated as an installation detail rather than monitored infrastructure</strong>. Prevention: startup types are recorded in the build document and audited weekly; host-level alerts cover engine, Agent, and Browser; and the patch runbook ends with a scripted connectivity test from a remote host before it can report success.</p>
`
  },

  interview: [
    {
      q: "Which SQL Server services must run in production?",
      a: "The Database Engine always; SQL Server Agent almost always, because backups, maintenance, and alerts are jobs; SQL Server Browser only when named instances use dynamic ports; VSS Writer and Launchpad only if their features are used. Everything else should be disabled to reduce attack surface."
    },
    {
      q: "Why is Automatic (Delayed Start) recommended for the engine?",
      a: "So SQL Server does not compete with the OS and other services during boot. Delayed start lets Windows finish initialising first; the engine then starts, runs crash recovery, and only afterwards the Agent follows — avoiding boot-time resource contention and startup-order failures."
    },
    {
      q: "How do you check service state without leaving T-SQL?",
      a: "SELECT from sys.dm_server_services for startup type, status, process ID, last startup time, and account; or EXEC xp_servicecontrol N'querystate', N'SQLServerAGENT' for one service. PowerShell Get-Service gives the host-wide view, including services outside the instance."
    }
  ],

  takeaways: [
    "SQL Server is a service family: engine, Agent, Browser, VSS Writer, Launchpad, plus optional companions",
    "Engine starts first and runs crash recovery; Agent follows; Browser only serves named-instance resolution",
    "Use Automatic (Delayed Start) for the engine and configure restart-on-failure recovery options",
    "Service names: MSSQL$INST, SQLAgent$INST, SQLBrowser — know them before the incident",
    "Monitor state AND startup type; an unplanned last_startup_time change deserves an alert"
  ]
};
