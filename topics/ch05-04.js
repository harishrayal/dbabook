/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch05-04.html */

window.TOPIC = {
  id: "ch05-04",
  title: "Default and Named Instances",

  lead: "SQL Server ships with one default instance per server and any number of named instances — and the difference decides your port, your connection string, and whether the Browser service is allowed to be disabled.",

  objectives: [
    "Explain default versus named instance behaviour",
    "Map service names, ports, and connection strings for each",
    "Describe how the Browser service resolves named instances",
    "Configure a static port for a named instance",
    "Diagnose named-instance connection failures"
  ],

  sections: [
    {
      h: "The default instance",
      html: `
<p>The first instance installed can be the <strong>default instance</strong>: it answers to the server name alone. Clients connect with just the hostname — no instance name, no port.</p>
<table>
  <tr><th>Property</th><th>Default instance</th></tr>
  <tr><td>Instance name</td><td><code>MSSQLSERVER</code> (clients omit it)</td></tr>
  <tr><td>Windows service</td><td><code>SQL Server (MSSQLSERVER)</code></td></tr>
  <tr><td>Agent service</td><td><code>SQL Server Agent (MSSQLSERVER)</code></td></tr>
  <tr><td>Typical connection</td><td><code>Server=SQL01;Database=AppDb;…</code></td></tr>
  <tr><td>Default port</td><td>1433 (if TCP/IP is configured with the default)</td></tr>
  <tr><td>SERVERPROPERTY('InstanceName')</td><td><code>NULL</code> — a small trap for inventory scripts</td></tr>
</table>
<p>Only one default instance can exist per server. Everything else is a named instance — including the one you created “just for testing” in 2019 that is still running.</p>
`
    },
    {
      h: "Named instances",
      html: `
<p>A <strong>named instance</strong> carries its own identity everywhere:</p>
<table>
  <tr><th>Property</th><th>Named instance (example: PROD)</th></tr>
  <tr><td>Instance name</td><td><code>PROD</code> — full name <code>SERVER\PROD</code></td></tr>
  <tr><td>Windows service</td><td><code>SQL Server (MSSQL$PROD)</code></td></tr>
  <tr><td>Agent service</td><td><code>SQL Server Agent (MSSQL$PROD)</code></td></tr>
  <tr><td>Registry path</td><td><code>…\MSSQL16.PROD\…</code> and <code>MSSQL$PROD\LoginMode</code></td></tr>
  <tr><td>Typical connection</td><td><code>Server=SQL01\\PROD;Database=AppDb;…</code> (double backslash in a connection string)</td></tr>
  <tr><td>Default port behaviour</td><td><strong>Dynamic port</strong> — assigned at each service start</td></tr>
</table>
<p>Named instances are how you run dev beside prod, isolate applications with different collation or authentication needs, or stage a migration side by side. The cost is connection complexity — and dynamic ports.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="How a client resolves a SQL Server instance">
    <defs>
      <marker id="ni-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="20" y="40" width="160" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="100" y="68" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Client application</text>
    <text x="100" y="90" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Server=SQL01\PROD</text>

    <rect x="240" y="40" width="200" height="70" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="340" y="68" text-anchor="middle" fill="var(--accent-strong)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">SQL Server Browser</text>
    <text x="340" y="90" text-anchor="middle" fill="var(--text)" font-size="11.5" font-family="Segoe UI, sans-serif">UDP 1434 — instance → port</text>

    <rect x="500" y="24" width="240" height="66" rx="10" fill="var(--surface)" stroke="var(--border)"/>
    <text x="620" y="50" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Default instance</text>
    <text x="620" y="71" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">direct to port 1433 — Browser not used</text>

    <rect x="500" y="112" width="240" height="66" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="620" y="138" text-anchor="middle" fill="var(--accent-strong)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Named instance (PROD)</text>
    <text x="620" y="159" text-anchor="middle" fill="var(--text)" font-size="11.5" font-family="Segoe UI, sans-serif">dynamic or static port returned</text>

    <rect x="240" y="230" width="400" height="76" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="440" y="258" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Named instance on a static port</text>
    <text x="440" y="282" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">client connects to Server=SQL01,1500 — no Browser dependency</text>

    <line x1="180" y1="75" x2="238" y2="75" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ni-arrow)"/>
    <line x1="440" y1="62" x2="498" y2="58" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ni-arrow)"/>
    <line x1="440" y1="90" x2="498" y2="135" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ni-arrow)"/>
    <line x1="620" y1="178" x2="560" y2="230" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ni-arrow)"/>
    <line x1="340" y1="110" x2="340" y2="228" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ni-arrow)"/>

    <text x="380" y="212" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Dynamic ports break when the service restarts — production should use static ports.</text>
  </svg>
  <div class="figcaption">Figure 1 — Resolution paths: default instances connect directly; named instances normally ask the Browser for a port.</div>
</div>
`
    },
    {
      h: "Dynamic ports and the Browser service",
      html: `
<p>By default a named instance picks a <strong>dynamic port</strong> at service start and registers it with the <strong>SQL Server Browser</strong> service (UDP 1434). A client that asks “which port is <code>SQL01\PROD</code> on?” gets the current answer, then connects directly to that port.</p>
<p>This works — until something changes:</p>
<ul>
  <li>The service restarts and receives a <em>different</em> port; cached connection strings with hard-coded ports fail</li>
  <li>Browser is disabled (common hardening recommendation) — named instances become unreachable by name</li>
  <li>A firewall blocks UDP 1434 or the dynamically assigned TCP range</li>
  <li>IPsec or a load balancer sits between client and server</li>
</ul>
<p><strong>Production rule: assign static ports.</strong> In SQL Server Configuration Manager → SQL Server Network Configuration → Protocols → TCP/IP → IP All, set a dedicated TCP port per instance (for example 1500, 1501), restart the service, open the firewall for that port only, and disable Browser if no dynamic instances remain.</p>
`
    },
    {
      h: "Connection strings and ports, side by side",
      html: `
<table>
  <tr><th>Target</th><th>Connection string fragment</th><th>Requires Browser?</th></tr>
  <tr><td>Default instance</td><td><code>Server=SQL01</code></td><td>No</td></tr>
  <tr><td>Named, dynamic port</td><td><code>Server=SQL01\\PROD</code></td><td>Yes (UDP 1434)</td></tr>
  <tr><td>Named, static port 1500</td><td><code>Server=SQL01,1500</code></td><td>No</td></tr>
  <tr><td>Named, static port, explicit</td><td><code>Server=SQL01\\PROD,1500</code></td><td>No</td></tr>
  <tr><td>Local default on 1433</td><td><code>Server=localhost,1433</code></td><td>No</td></tr>
</table>
<p>Verify what a connection actually uses before you document it:</p>
<pre><code class="language-sql">-- Port and transport of my own session
SELECT local_tcp_port, net_transport, client_net_address, encrypt_option
FROM   sys.dm_exec_connections
WHERE  session_id = @@SPID;

-- Instance identity (InstanceName is NULL on the default instance)
SELECT @@SERVERNAME AS server_name,
       ISNULL(SERVERPROPERTY('InstanceName'), 'MSSQLSERVER') AS instance_name,
       local_tcp_port
FROM   sys.dm_exec_connections
WHERE  session_id = @@SPID;</code></pre>
`
    },
    {
      h: "Troubleshooting instance connections",
      html: `
<p>When “server not found” arrives, walk the chain in order — each step invalidates a whole class of causes:</p>
<table>
  <tr><th>Check</th><th>How</th><th>What it proves</th></tr>
  <tr><td>Is the service running?</td><td><code>Get-Service MSSQL$PROD</code> or Configuration Manager</td><td>Nothing listens without the service</td></tr>
  <tr><td>Is Browser running?</td><td><code>Get-Service SQLBrowser</code></td><td>Required for dynamic named instances</td></tr>
  <tr><td>Which port is bound?</td><td><code>netstat -ano | findstr &lt;PID&gt;</code></td><td>The service is listening where you think</td></tr>
  <tr><td>Is the port reachable?</td><td><code>Test-NetConnection SQL01 -Port 1500</code></td><td>Firewall or network in the path</td></tr>
  <tr><td>Which instance am I on?</td><td><code>SELECT @@SERVERNAME, SERVERPROPERTY('InstanceName')</code></td><td>Connected to the right instance at all</td></tr>
</table>
<pre><code class="language-sql">-- Is the service healthy and which start mode does it have?
SELECT service_name, startup_type_desc, status_desc, process_id
FROM   sys.dm_server_services
WHERE  service_name LIKE 'MSSQL%' OR service_name LIKE 'SQLAgent%';

-- Ask Windows about a service state directly from T-SQL
EXEC xp_servicecontrol N'querystate', N'SQLBrowser';</code></pre>
<p>Most named-instance outages reduce to one of three: Browser stopped, dynamic port changed after restart, or firewall rule missing for the static port. Identify which in minutes, not hours.</p>
`
    }
  ],

  scenario: {
    title: "Application timeouts after every server patch window",
    html: `
<p>An application team reported intermittent “connection timeout” errors each Tuesday after the monthly patch cycle — and only from servers outside the database subnet. Inside the subnet everything worked. The named instance used a dynamic port; after each restart the engine picked a new one, and the DBA had once hard-coded the previous port into a firewall rule. Browser was reachable, so local clients succeeded; remote clients targeted a port nothing was listening on.</p>
<p>Resolution: set the instance to static port 1500 in Configuration Manager, updated the firewall for 1500 only, updated connection strings to <code>Server=SQL01,1500</code>, and stopped the Browser service since no dynamic instances remained. Prevention: connection-string and firewall documentation now includes the instance's port as a managed value, and the patch runbook verifies a remote TCP test after every restart.</p>
`
  },

  interview: [
    {
      q: "How does a client find a named instance?",
      a: "It queries the SQL Server Browser service on UDP 1434, which maps the instance name to its currently registered port; the client then connects to that TCP port directly. With a static port configured, the client can bypass Browser entirely by using Server=host,port."
    },
    {
      q: "Why is SERVERPROPERTY('InstanceName') NULL on the default instance?",
      a: "Because the default instance has no name — it is MSSQLSERVER by service convention and answers to the bare server name. Scripts should use ISNULL(SERVERPROPERTY('InstanceName'), 'MSSQLSERVER') when generating service or path names."
    },
    {
      q: "What is your standard production port strategy?",
      a: "Static port per instance, assigned from a documented range, with the Browser service disabled when every instance is static, firewall rules restricted to those ports, and connection strings using host,port. It removes a runtime dependency and makes the network path auditable."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “The first instance installed can be the _____: it answers to the server name alone.”",
      "options": [
        "Production rule: assign static ports.",
        "Only one default instance can exist per server.",
        "default instance"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The first instance installed can be the default instance: it answers to the server name alone. Clients connect with just the hostname — no instance name, no port.”"
    },
    {
      "question": "Complete the lesson statement: “A _____ carries its own identity everywhere:”",
      "options": [
        "MSSQLSERVER (clients omit it)",
        "named instance",
        "Only one default instance can exist per server."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A named instance carries its own identity everywhere:”"
    },
    {
      "question": "Complete the lesson statement: “By default a named instance picks a _____ at service start and registers it with the SQL Server Browser service (UDP 1434).”",
      "options": [
        "dynamic port",
        "MSSQLSERVER (clients omit it)",
        "SQL Server (MSSQLSERVER)"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “By default a named instance picks a dynamic port at service start and registers it with the SQL Server Browser service (UDP 1434). A client that asks “which port is SQL01PROD on?” gets the current answer, then connects directly to that port.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Connection strings and ports, side by side”?",
      "options": [
        "NULL — a small trap for inventory scripts",
        "named instance",
        "Verify what a connection actually uses before you document it:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Verify what a connection actually uses before you document it:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Troubleshooting instance connections”?",
      "options": [
        "Named instances are how you run dev beside prod, isolate applications with different collation or authentication needs, or stage a migration side by side.",
        "When “server not found” arrives, walk the chain in order — each step invalidates a whole class of causes:",
        "named instance"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “When “server not found” arrives, walk the chain in order — each step invalidates a whole class of causes:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The default instance”?",
      "options": [
        "Only one default instance can exist per server.",
        "This works — until something changes:",
        "Production rule: assign static ports."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Only one default instance can exist per server. Everything else is a named instance — including the one you created “just for testing” in 2019 that is still running.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Named instances”?",
      "options": [
        "Production rule: assign static ports.",
        "Verify what a connection actually uses before you document it:",
        "Named instances are how you run dev beside prod, isolate applications with different collation or authentication needs, or stage a migration side by side."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Named instances are how you run dev beside prod, isolate applications with different collation or authentication needs, or stage a migration side by side. The cost is connection complexity — and dynamic ports.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Dynamic ports and the Browser service”?",
      "options": [
        "SQL Server Agent (MSSQL$PROD)",
        "This works — until something changes:",
        "SQL Server (MSSQL$PROD)"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “This works — until something changes:”"
    },
    {
      "question": "In the “Connection strings and ports, side by side” table, what is listed for “Default instance” under “Requires Browser?”?",
      "options": [
        "No",
        "SQL Server (MSSQL$PROD)",
        "SQL Server Agent (MSSQL$PROD)"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Default instance” as “No”."
    },
    {
      "question": "Which fact is covered in the lesson section “Troubleshooting instance connections”?",
      "options": [
        "…MSSQL16.PROD… and MSSQL$PRODLoginMode",
        "Server=SQL01\\PROD;Database=AppDb;… (double backslash in a connection string)",
        "Most named-instance outages reduce to one of three: Browser stopped, dynamic port changed after restart, or firewall rule missing for the static port."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Most named-instance outages reduce to one of three: Browser stopped, dynamic port changed after restart, or firewall rule missing for the static port. Identify which in minutes, not hours.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “The first instance installed can be the _____: it answers to the server name alone.”",
      "options": [
        "Production rule: assign static ports.",
        "Only one default instance can exist per server.",
        "default instance"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The first instance installed can be the default instance: it answers to the server name alone. Clients connect with just the hostname — no instance name, no port.”"
    },
    {
      "question": "Complete the lesson statement: “A _____ carries its own identity everywhere:”",
      "options": [
        "MSSQLSERVER (clients omit it)",
        "named instance",
        "Only one default instance can exist per server."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A named instance carries its own identity everywhere:”"
    },
    {
      "question": "Complete the lesson statement: “By default a named instance picks a _____ at service start and registers it with the SQL Server Browser service (UDP 1434).”",
      "options": [
        "dynamic port",
        "MSSQLSERVER (clients omit it)",
        "SQL Server (MSSQLSERVER)"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “By default a named instance picks a dynamic port at service start and registers it with the SQL Server Browser service (UDP 1434). A client that asks “which port is SQL01PROD on?” gets the current answer, then connects directly to that port.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Connection strings and ports, side by side”?",
      "options": [
        "NULL — a small trap for inventory scripts",
        "named instance",
        "Verify what a connection actually uses before you document it:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Verify what a connection actually uses before you document it:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Troubleshooting instance connections”?",
      "options": [
        "Named instances are how you run dev beside prod, isolate applications with different collation or authentication needs, or stage a migration side by side.",
        "When “server not found” arrives, walk the chain in order — each step invalidates a whole class of causes:",
        "named instance"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “When “server not found” arrives, walk the chain in order — each step invalidates a whole class of causes:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The default instance”?",
      "options": [
        "Only one default instance can exist per server.",
        "This works — until something changes:",
        "Production rule: assign static ports."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Only one default instance can exist per server. Everything else is a named instance — including the one you created “just for testing” in 2019 that is still running.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Named instances”?",
      "options": [
        "Production rule: assign static ports.",
        "Verify what a connection actually uses before you document it:",
        "Named instances are how you run dev beside prod, isolate applications with different collation or authentication needs, or stage a migration side by side."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Named instances are how you run dev beside prod, isolate applications with different collation or authentication needs, or stage a migration side by side. The cost is connection complexity — and dynamic ports.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Dynamic ports and the Browser service”?",
      "options": [
        "SQL Server Agent (MSSQL$PROD)",
        "This works — until something changes:",
        "SQL Server (MSSQL$PROD)"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “This works — until something changes:”"
    },
    {
      "question": "In the “Connection strings and ports, side by side” table, what is listed for “Default instance” under “Requires Browser?”?",
      "options": [
        "No",
        "SQL Server (MSSQL$PROD)",
        "SQL Server Agent (MSSQL$PROD)"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Default instance” as “No”."
    },
    {
      "question": "Which fact is covered in the lesson section “Troubleshooting instance connections”?",
      "options": [
        "…MSSQL16.PROD… and MSSQL$PRODLoginMode",
        "Server=SQL01\\PROD;Database=AppDb;… (double backslash in a connection string)",
        "Most named-instance outages reduce to one of three: Browser stopped, dynamic port changed after restart, or firewall rule missing for the static port."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Most named-instance outages reduce to one of three: Browser stopped, dynamic port changed after restart, or firewall rule missing for the static port. Identify which in minutes, not hours.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “The first instance installed can be the _____: it answers to the server name alone.”",
      "options": [
        "Production rule: assign static ports.",
        "Only one default instance can exist per server.",
        "default instance"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The first instance installed can be the default instance: it answers to the server name alone. Clients connect with just the hostname — no instance name, no port.”"
    },
    {
      "question": "Complete the lesson statement: “A _____ carries its own identity everywhere:”",
      "options": [
        "MSSQLSERVER (clients omit it)",
        "named instance",
        "Only one default instance can exist per server."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A named instance carries its own identity everywhere:”"
    },
    {
      "question": "Complete the lesson statement: “By default a named instance picks a _____ at service start and registers it with the SQL Server Browser service (UDP 1434).”",
      "options": [
        "dynamic port",
        "MSSQLSERVER (clients omit it)",
        "SQL Server (MSSQLSERVER)"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “By default a named instance picks a dynamic port at service start and registers it with the SQL Server Browser service (UDP 1434). A client that asks “which port is SQL01PROD on?” gets the current answer, then connects directly to that port.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Connection strings and ports, side by side”?",
      "options": [
        "NULL — a small trap for inventory scripts",
        "named instance",
        "Verify what a connection actually uses before you document it:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Verify what a connection actually uses before you document it:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Troubleshooting instance connections”?",
      "options": [
        "Named instances are how you run dev beside prod, isolate applications with different collation or authentication needs, or stage a migration side by side.",
        "When “server not found” arrives, walk the chain in order — each step invalidates a whole class of causes:",
        "named instance"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “When “server not found” arrives, walk the chain in order — each step invalidates a whole class of causes:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The default instance”?",
      "options": [
        "Only one default instance can exist per server.",
        "This works — until something changes:",
        "Production rule: assign static ports."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Only one default instance can exist per server. Everything else is a named instance — including the one you created “just for testing” in 2019 that is still running.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Named instances”?",
      "options": [
        "Production rule: assign static ports.",
        "Verify what a connection actually uses before you document it:",
        "Named instances are how you run dev beside prod, isolate applications with different collation or authentication needs, or stage a migration side by side."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Named instances are how you run dev beside prod, isolate applications with different collation or authentication needs, or stage a migration side by side. The cost is connection complexity — and dynamic ports.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Dynamic ports and the Browser service”?",
      "options": [
        "SQL Server Agent (MSSQL$PROD)",
        "This works — until something changes:",
        "SQL Server (MSSQL$PROD)"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “This works — until something changes:”"
    },
    {
      "question": "In the “Connection strings and ports, side by side” table, what is listed for “Default instance” under “Requires Browser?”?",
      "options": [
        "No",
        "SQL Server (MSSQL$PROD)",
        "SQL Server Agent (MSSQL$PROD)"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Default instance” as “No”."
    },
    {
      "question": "Which fact is covered in the lesson section “Troubleshooting instance connections”?",
      "options": [
        "…MSSQL16.PROD… and MSSQL$PRODLoginMode",
        "Server=SQL01\\PROD;Database=AppDb;… (double backslash in a connection string)",
        "Most named-instance outages reduce to one of three: Browser stopped, dynamic port changed after restart, or firewall rule missing for the static port."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Most named-instance outages reduce to one of three: Browser stopped, dynamic port changed after restart, or firewall rule missing for the static port. Identify which in minutes, not hours.”"
    }
  ],
  takeaways: [
    "One default instance per server (MSSQLSERVER, typically 1433); any number of named instances",
    "Named instances default to dynamic ports and need the Browser service on UDP 1434",
    "Production should use static ports and may disable Browser entirely",
    "Connection strings: Server=host for default, Server=host\\INST for named, Server=host,port for static",
    "InstanceName is NULL on the default instance — guard inventory scripts with ISNULL"
  ]
};
