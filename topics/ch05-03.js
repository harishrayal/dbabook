/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch05-03.html */

window.TOPIC = {
  id: "ch05-03",
  title: "SQL Server Instance Concepts",

  lead: "An instance is an installed copy of the SQL Server engine — its own services, system databases, logins, and memory — and understanding what an instance owns versus what a database owns prevents most permission and consolidation mistakes.",

  objectives: [
    "Define an instance and what it contains",
    "Separate instance-level state from database-level state",
    "Describe how instances share a server's hardware",
    "Discover and inventory instances with T-SQL",
    "Decide when multiple instances are appropriate"
  ],

  sections: [
    {
      h: "What an instance is",
      html: `
<p>When you run SQL Server setup and complete the wizard, you install an <strong>instance</strong> — a self-contained copy of the database engine. One physical server (or VM) can host several instances, each behaving like its own database server:</p>
<ul>
  <li>Its own <strong>services</strong> — SQL Server service and matching SQL Server Agent</li>
  <li>Its own <strong>system databases</strong> — master, model, msdb, tempdb (tempdb is per-instance, recreated at every start)</li>
  <li>Its own <strong>memory allocation, ports, and collation default</strong></li>
  <li>Its own <strong>security boundary</strong> — logins, server roles, endpoints, and Agent jobs live here</li>
  <li>Its own <strong>databases</strong> — user databases belong to exactly one instance</li>
</ul>
<p>Applications connect to an <em>instance</em>, not to a server: the connection string names the host and the instance, and everything downstream — authentication, permissions, backups, jobs — is scoped to that instance.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Instance architecture on one server">
    <defs>
      <marker id="inst-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="30" y="20" width="700" height="250" rx="14" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="46" text-anchor="middle" fill="var(--text)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Physical server / VM — CPU, RAM, disks, OS</text>

    <rect x="55" y="64" width="315" height="140" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="212" y="88" text-anchor="middle" fill="var(--accent-strong)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Instance A — PROD (default)</text>
    <g font-size="11.5" fill="var(--text)" font-family="Segoe UI, sans-serif" text-anchor="middle">
      <rect x="70" y="100" width="140" height="34" rx="6" fill="var(--surface)" stroke="var(--border)"/>
      <text x="140" y="121">master · model · msdb · tempdb</text>
      <rect x="220" y="100" width="135" height="34" rx="6" fill="var(--surface)" stroke="var(--border)"/>
      <text x="287" y="121">logins · jobs · endpoints</text>
      <rect x="70" y="146" width="140" height="34" rx="6" fill="var(--surface)" stroke="var(--border)"/>
      <text x="140" y="167">ERP · Reporting · Audit</text>
      <rect x="220" y="146" width="135" height="34" rx="6" fill="var(--surface)" stroke="var(--border)"/>
      <text x="287" y="167">own port &amp; memory</text>
    </g>

    <rect x="390" y="64" width="315" height="140" rx="10" fill="var(--surface)" stroke="var(--border)" stroke-width="1.8"/>
    <text x="547" y="88" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Instance B — TEST (MSSQL$TEST)</text>
    <g font-size="11.5" fill="var(--muted)" font-family="Segoe UI, sans-serif" text-anchor="middle">
      <rect x="405" y="100" width="140" height="34" rx="6" fill="var(--surface-2)" stroke="var(--border)"/>
      <text x="475" y="121">master · model · msdb · tempdb</text>
      <rect x="555" y="100" width="135" height="34" rx="6" fill="var(--surface-2)" stroke="var(--border)"/>
      <text x="622" y="121">own logins &amp; jobs</text>
      <rect x="405" y="146" width="140" height="34" rx="6" fill="var(--surface-2)" stroke="var(--border)"/>
      <text x="475" y="167">AppTest · Sandbox</text>
      <rect x="555" y="146" width="135" height="34" rx="6" fill="var(--surface-2)" stroke="var(--border)"/>
      <text x="622" y="167">own port &amp; memory</text>
    </g>

    <rect x="55" y="228" width="315" height="30" rx="6" fill="var(--surface)" stroke="var(--border)"/>
    <text x="212" y="248" text-anchor="middle" fill="var(--text)" font-size="11.5" font-family="Segoe UI, sans-serif">Services: MSSQLSERVER + SQLAgent$PROD</text>
    <rect x="390" y="228" width="315" height="30" rx="6" fill="var(--surface)" stroke="var(--border)"/>
    <text x="547" y="248" text-anchor="middle" fill="var(--text)" font-size="11.5" font-family="Segoe UI, sans-serif">Services: MSSQL$TEST + SQLAgent$TEST</text>

    <text x="380" y="300" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Instances are isolated for security and configuration — but they still compete for the same CPU, memory, and I/O.</text>
    <line x1="380" y1="272" x2="380" y2="284" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#inst-arrow)"/>
  </svg>
  <div class="figcaption">Figure 1 — Two instances on one host: separate services, system databases, and security — shared hardware.</div>
</div>
`
    },
    {
      h: "Instance-level versus database-level",
      html: `
<p>This distinction answers most “why can't they see it?” questions:</p>
<table>
  <tr><th>Lives at <strong>instance</strong> level</th><th>Lives at <strong>database</strong> level</th></tr>
  <tr><td>Logins and server roles</td><td>Users and database roles</td></tr>
  <tr><td>Endpoints, linked servers, credentials</td><td>Schemas, tables, stored procedures</td></tr>
  <tr><td>SQL Server Agent jobs, schedules, alerts</td><td>Database options: recovery model, auto-close, encryption</td></tr>
  <tr><td>Server-wide configuration (max memory, auth mode)</td><td>File placement, filegroups, containment</td></tr>
  <tr><td>System databases and tempdb</td><td>User data and transaction logs</td></tr>
</table>
<p>A login must exist on the instance <em>and</em> map to a user in each database — the classic <strong>orphaned user</strong> problem after a restore: the login survives in master, but the database user has no matching SID. Fix with <code>ALTER USER … WITH LOGIN = …</code> once you understand which layer is missing.</p>
`
    },
    {
      h: "Instances share everything below them",
      html: `
<p>Instances isolate <em>configuration and security</em>, not <em>resources</em>. On one host, a runaway instance can starve its neighbours:</p>
<table>
  <tr><th>Resource</th><th>Shared?</th><th>Control lever</th></tr>
  <tr><td>CPU</td><td>Yes — scheduler count is split</td><td>sp_configure 'max degree of parallelism', Resource Governor, CPU caps</td></tr>
  <tr><td>Memory</td><td>Yes — each instance's max server memory adds up</td><td>Set max server memory on <em>every</em> instance; total must leave room for the OS</td></tr>
  <tr><td>Disk I/O</td><td>Yes</td><td>Separate volumes, storage QoS, avoid co-locating heavy jobs</td></tr>
  <tr><td>Ports</td><td>No — each instance binds its own</td><td>Static port or dynamic port via Browser</td></tr>
  <tr><td>tempdb / system DBs</td><td>No — one set per instance</td><td>Size tempdb per workload</td></tr>
</table>
<p>Classic consolidation bug: two instances each left at default <code>max server memory</code> on a 128 GB host — both believe they may use everything, the OS gets squeezed, and paging begins. Every instance on a shared box must have an explicit memory budget.</p>
`
    },
    {
      h: "Discovering what is installed",
      html: `
<p>Inventory queries you can run anywhere:</p>
<pre><code class="language-sql">SELECT @@SERVERNAME                                   AS server_name,
       ISNULL(SERVERPROPERTY('InstanceName'), 'MSSQLSERVER') AS instance_name,
       SERVERPROPERTY('MachineName')                 AS host_name,
       SERVERPROPERTY('IsClustered')                 AS is_clustered,
       SERVERPROPERTY('Collation')                   AS server_collation,
       SERVERPROPERTY('IsIntegratedSecurityOnly')    AS auth_mode;   -- 1 = Windows only</code></pre>
<pre><code class="language-sql">-- Services owned by this host (engine, agent, browser, launchpad)
SELECT service_name, startup_type_desc, status_desc, process_id, last_startup_time
FROM   sys.dm_server_services
ORDER  BY service_name;</code></pre>
<p>Combine both with a walk of <code>HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\Instance Names\SQL</code> in PowerShell to enumerate instances the DMVs cannot see from inside — a named instance that is stopped will not answer a query, but it is still installed.</p>
`
    },
    {
      h: "When to use multiple instances",
      html: `
<p>Instances are a tool, not a default. Honest guidance:</p>
<table>
  <tr><th>Scenario</th><th>Recommendation</th></tr>
  <tr><td>Production on its own VM</td><td><strong>One instance</strong> — simplest, fewest moving parts, clearest resource ownership</td></tr>
  <tr><td>Dev/test on shared hardware</td><td><strong>Multiple instances</strong> — cheap isolation without extra OS licences</td></tr>
  <tr><td>Isolating a noisy workload</td><td>Separate instance helps security, not performance, unless resources are capped</td></tr>
  <tr><td>Different collation or auth requirements</td><td>Separate instance — both are instance-level settings</td></tr>
  <tr><td>Migrating an application sideways</td><td>Temporary second instance, side-by-side cutover, then decommission</td></tr>
</table>
<p>Opinionated default: <strong>one instance per production server</strong>. Add instances only for a named reason, and when you do, give each one explicit memory, port, and backup ownership — never leave shared hosts on defaults.</p>
`
    }
  ],

  scenario: {
    title: "One server, two instances — and production slowed every night at 2 AM",
    html: `
<p>After a cost-saving consolidation, a reporting instance and the production OLTP instance shared one 64 GB host. Production was fine all day, then slowed to a crawl nightly at 2 AM. The DBA checked the production instance first: CPU idle-looking, memory settings untouched, no blocking. The real cause was next door — the reporting instance ran a nightly warehouse load, and neither instance had <code>max server memory</code> set, so the report engine claimed most of the 64 GB while its queries burned all 16 cores.</p>
<p>Resolution within the incident: cap the reporting instance at 16 GB and 4 effective cores, cap production at 40 GB, and move the warehouse load's schedule outside business hours. Root cause was not the workload — it was <strong>unbudgeted sharing</strong>. Prevention: every instance on a shared host now gets an explicit memory and CPU budget recorded in the build document, with alerts on host-level memory pressure.</p>
`
  },

  interview: [
    {
      q: "What is the difference between a server and an instance?",
      a: "The server is the host — hardware, OS, and shared resources. An instance is an installed copy of the SQL Server engine with its own services, system databases, configuration, security, and databases. Applications connect to an instance; instances share the host's CPU, memory, and I/O."
    },
    {
      q: "Where do logins and Agent jobs live — instance or database?",
      a: "Instance level. Logins live in the master database (instance-wide), and Agent jobs live in msdb (instance-wide). Database users, roles, and schemas are database-scoped, which is why a login can exist while a database user becomes orphaned after a restore."
    },
    {
      q: "Two instances on one 64 GB host — what must you configure?",
      a: "An explicit max server memory for each instance that totals less than physical RAM minus OS headroom, CPU limits or a sensible max degree of parallelism, separate port assignments, and separate backup schedules. Without memory caps both instances assume they own the host."
    }
  ],

  takeaways: [
    "An instance = one installation of the engine: its own services, system databases, ports, and security boundary",
    "Logins, jobs, and endpoints are instance-level; users, schemas, and objects are database-level",
    "Instances share CPU, memory, and I/O — budget them explicitly or they will fight",
    "tempdb, master, model, and msdb belong to the instance and are recreated or shared per instance",
    "Default to one instance per production server; add instances only for a named reason"
  ]
};
