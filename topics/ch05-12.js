/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch05-12.html */

window.TOPIC = {
  id: "ch05-12",
  title: "SQL Server Browser",

  lead: "SQL Server Browser is the small Windows service that answers one question for client applications: which TCP port is this named instance listening on? When it is down, perfectly healthy servers suddenly look unreachable.",

  objectives: [
    "Explain what the SQL Server Browser service does",
    "Trace how a client resolves a named instance to a TCP port",
    "Decide when Browser is required and when it can safely be disabled",
    "Start, verify, and secure the Browser service in production",
    "Diagnose the classic “server was not found or was not accessible” error"
  ],

  sections: [
    {
      h: "What the Browser does",
      html: `
<p><strong>SQL Server Browser</strong> (service name <code>SQLBrowser</code>) is a separate Windows service installed with the Database Engine. There is exactly <em>one</em> Browser per server, no matter how many instances run on it. It is a <strong>directory service for instances</strong> — it never carries a single row of query data.</p>
<p>Its job is to answer SSRP (SQL Server Resolution Protocol) queries sent to <strong>UDP 1434</strong>. When a client is given a connection string such as <code>sql-node-02\\REPORTS</code> with no port number, the client library must first ask “what port is REPORTS on?”, then open a TCP connection to the port that comes back.</p>
<ul>
  <li>Each instance <strong>registers its own endpoint</strong> (instance name and listening port) with the Browser as the service starts</li>
  <li>The Browser answers on <strong>UDP 1434</strong>: “REPORTS is on TCP 51543”</li>
  <li>The client then connects <strong>directly</strong> to the instance on TCP 51543 — the Browser is out of the data path from then on</li>
  <li>The <strong>default instance</strong> is the exception: convention says port 1433, so most clients skip the lookup entirely</li>
</ul>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Named instance resolution through SQL Server Browser">
    <defs>
      <marker id="brw-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="20" y="115" width="180" height="90" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="110" y="143" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Client application</text>
    <text x="110" y="165" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Server=sql-node-02\\REPORTS</text>
    <text x="110" y="186" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">no port in the string</text>

    <rect x="285" y="25" width="200" height="85" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="385" y="54" text-anchor="middle" fill="var(--accent-strong)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">SQL Server Browser</text>
    <text x="385" y="76" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">UDP 1434 · SSRP lookup</text>
    <text x="385" y="97" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">one service per server</text>

    <rect x="560" y="115" width="180" height="90" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="650" y="143" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Instance REPORTS</text>
    <text x="650" y="165" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">listening on TCP 51543</text>
    <text x="650" y="186" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">TDS session from here on</text>

    <rect x="285" y="245" width="200" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="385" y="273" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Default instance</text>
    <text x="385" y="295" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">TCP 1433 — no lookup needed</text>

    <line x1="575" y1="112" x2="489" y2="72" stroke="var(--accent)" stroke-width="1.6" marker-end="url(#brw-arrow)"/>
    <text x="500" y="58" fill="var(--accent-strong)" font-size="11" font-family="Segoe UI, sans-serif">register port</text>

    <line x1="202" y1="132" x2="282" y2="62" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#brw-arrow)"/>
    <text x="212" y="88" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">1 · which port?</text>

    <line x1="282" y1="96" x2="202" y2="182" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#brw-arrow)"/>
    <text x="210" y="146" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">2 · TCP 51543</text>

    <line x1="200" y1="200" x2="556" y2="172" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#brw-arrow)"/>
    <text x="330" y="196" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">3 · connect directly on TCP 51543</text>

    <line x1="110" y1="207" x2="281" y2="272" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#brw-arrow)"/>
    <text x="120" y="252" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">straight to 1433</text>

    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">The Browser is a phone book, not a data path — after step 2 the client talks only to the instance.</text>
  </svg>
  <div class="figcaption">Figure 1 — Named instance resolution: SSRP lookup over UDP 1434, then a direct TCP connection to the returned port.</div>
</div>
`
    },
    {
      h: "Instance resolution, step by step",
      html: `
<p>Follow one connection string through the stack. Understanding this sequence is what lets you tell a <em>resolution</em> failure from a <em>network</em> failure from a <em>login</em> failure — three errors that look identical to the application team.</p>
<table>
  <tr><th>Step</th><th>Actor</th><th>Action</th></tr>
  <tr><td>1</td><td>Client library</td><td>Parses <code>sql-node-02\\REPORTS</code>: server known, instance known, <strong>no port</strong></td></tr>
  <tr><td>2</td><td>Client library</td><td>Sends an SSRP query to <strong>udp/1434</strong> on sql-node-02</td></tr>
  <tr><td>3</td><td>SQL Server Browser</td><td>Replies with the port the REPORTS instance registered at start-up</td></tr>
  <tr><td>4</td><td>Client library</td><td>Opens TCP to <code>sql-node-02:51543</code> and starts the TDS handshake</td></tr>
  <tr><td>5</td><td>Database Engine</td><td>Authenticates the login — from here on it is ordinary SQL Server behaviour</td></tr>
</table>
<p>The port map for a typical server running a default instance, one named instance, and an availability group:</p>
<table>
  <tr><th>Port</th><th>Protocol</th><th>Service</th><th>Purpose</th></tr>
  <tr><td><strong>1433</strong></td><td>TCP</td><td>Default instance</td><td>Standard client connections (TDS)</td></tr>
  <tr><td><strong>1434</strong></td><td><strong>UDP</strong></td><td>SQL Server Browser</td><td>SSRP instance-name → port lookup</td></tr>
  <tr><td><strong>5022</strong></td><td>TCP</td><td>AG / mirroring endpoint</td><td>Replica-to-replica data movement</td></tr>
</table>
`
    },
    {
      h: "When you need it — and when you do not",
      html: `
<p>Opinionated production rule: <strong>if any connection string names an instance without a port, the Browser must run.</strong> Disabling it is a legitimate hardening step, but only after every client has been moved to explicit ports.</p>
<table>
  <tr><th>Deployment</th><th>Browser required?</th><th>Why</th></tr>
  <tr><td>Default instance, clients use <code>server,1433</code> or just <code>server</code></td><td>No</td><td>1433 is the agreed convention, no lookup happens</td></tr>
  <tr><td>Named instance with dynamic ports</td><td><strong>Yes</strong></td><td>The port changes at every service start; only the Browser knows it</td></tr>
  <tr><td>Named instance with a fixed static port</td><td>Optional</td><td>Works without it if every client carries the port explicitly</td></tr>
  <tr><td>Local administration only (shared memory)</td><td>No</td><td>Local connections never use SSRP</td></tr>
  <tr><td>SSMS “Browse for Servers” from a workstation</td><td><strong>Yes</strong></td><td>The instance list itself is built from SSRP replies</td></tr>
</table>
<p>Two consequences worth stating out loud. First, a server with dynamic ports and a stopped Browser is <em>invisible</em> to every remote client, while <code>server,1433</code> (the default instance) keeps working — which is why these outages are so confusing. Second, with Browser disabled, a renamed or renumbered instance silently breaks every connection string you thought you had fixed.</p>
`
    },
    {
      h: "Starting and verifying the service",
      html: `
<p>Check it from the host with PowerShell. The service should be <code>Running</code> and <code>Automatic</code> on any server whose clients use instance names:</p>
<pre><code class="language-powershell"># Service state and start-up type
Get-Service SQLBrowser | Select-Object Name, Status, StartType

# Is anything actually listening on UDP 1433/1434?
netstat -ano | findstr "1434"

# Make it survive a reboot
Set-Service SQLBrowser -StartupType Automatic
Start-Service SQLBrowser</code></pre>
<p>Then confirm what the instance itself reports, so you can compare “what the Browser would advertise” with “what is really listening”:</p>
<pre><code class="language-sql">-- Port this session is actually connected to
SELECT local_net_transport, local_tcp_port
FROM   sys.dm_exec_connections
WHERE  session_id = @@SPID;

-- Instance name exactly as remote clients see it
SELECT @@SERVERNAME          AS server_name,
       SERVERPROPERTY('InstanceName') AS instance_name;
-- InstanceName is NULL for the default instance</code></pre>
<p>If <code>local_tcp_port</code> is NULL you are on shared memory — useful to know before you blame the network.</p>
`
    },
    {
      h: "Securing the Browser",
      html: `
<p>The Browser carries no data, so the usual “expose as little as possible” logic applies to <strong>UDP 1434</strong> rather than to the service itself. Anyone who can reach it learns the names of every instance on the host — a free reconnaissance service for an attacker mapping your estate.</p>
<ul>
  <li>Firewall UDP 1434 <strong>only</strong> from application subnets, never from “any”</li>
  <li>If every connection string carries an explicit port, set SQL Browser to <strong>Disabled</strong> and delete the UDP 1434 rule</li>
  <li>Do not confuse the two: disabling Browser does <em>not</em> close TCP 1433, and closing 1434 does <em>not</em> stop the default instance from accepting connections</li>
  <li>Document the decision — the next DBA will otherwise “fix” an intentionally disabled service</li>
</ul>
<p>Hardening benchmarks often recommend disabling Browser. That recommendation is only safe when paired with static ports and explicit connection strings; applying it blindly is one of the most common self-inflicted outages in Chapter 5.</p>
`
    },
    {
      h: "Troubleshooting resolution failures",
      html: `
<p>Match the symptom to the layer before touching anything. The provider error number tells you where to look:</p>
<table>
  <tr><th>Symptom</th><th>Layer</th><th>First check</th></tr>
  <tr><td>Error <strong>26</strong> — “Error Locating Server/Instance Specified”</td><td>Resolution</td><td>Is SQLBrowser running? Is UDP 1434 reachable from the client subnet?</td></tr>
  <tr><td>Error <strong>10061</strong> / “no process on the other end”</td><td>Listener</td><td>Is TCP/IP enabled, is the port correct, is the service up?</td></tr>
  <tr><td>Error <strong>40</strong> — could not open connection</td><td>Firewall / routing</td><td><code>Test-NetConnection sql-node-02 -Port 51543</code> from the app server</td></tr>
  <tr><td>Error <strong>18456</strong> — login failed</td><td>Authentication</td><td>Resolution worked; look at the login and the error log, not the network</td></tr>
  <tr><td>Works on the server, fails remotely</td><td>Scope</td><td>Local connections use shared memory — they prove nothing about TCP</td></tr>
</table>
<p>Order of operations: confirm the service, confirm the listening port with <code>netstat</code>, confirm the firewall rule, then confirm the connection string. Skipping straight to the connection string wastes the most time, because it is usually right.</p>
`
    }
  ],

  scenario: {
    title: "07:40 — the Reports instance vanished after a hardening change",
    html: `
<p>At 07:40 the reporting application began failing with <em>“A network-related or instance-specific error occurred… The server was not found or was not accessible (provider: SQL Network Interfaces, error: 26)”</em>. The connection string had not changed: <code>sql-node-02\\REPORTS</code>. Meanwhile, <code>sql-node-02,1433</code> — the default instance on the same box — connected perfectly, and the application team insisted “the server is clearly up”.</p>
<p>The DBA spotted the discriminator immediately: <strong>error 26 is a resolution failure, not a network failure.</strong> <code>Get-Service SQLBrowser</code> returned <code>Stopped</code> — the overnight hardening job had applied a benchmark that disables SQL Server Browser, and nobody had flagged the named instance as depending on it. Fix took two minutes: <code>Set-Service SQLBrowser -StartupType Automatic</code>, <code>Start-Service</code>, verify UDP 1434 in <code>netstat</code>, confirm the application recovered. Prevention: hardening benchmarks are reviewed like any other production change, and every server with instance names in its connection strings carries a documented exception. The alternative — moving every client to a static port and an explicit port number — was estimated at a week of work, so the service stayed on, scoped by a firewall rule to the application subnet only.</p>
`
  },

  interview: [
    {
      q: "What does SQL Server Browser do, and what does it not do?",
      a: "It answers SSRP queries on UDP 1434, mapping an instance name to the TCP port that instance is listening on. It is registered per server, not per instance, and it never participates in the actual TDS data session — once the client has the port, the Browser is out of the path."
    },
    {
      q: "Does the default instance need the Browser?",
      a: "No. The default instance is expected on TCP 1433, so clients connect directly. That is also why an outage caused by a stopped Browser only breaks named instances — which makes the failure look selective and confusing."
    },
    {
      q: "Security asks you to disable Browser. How do you do it without breaking clients?",
      a: "First inventory every connection string and monitoring probe: any that name an instance without a port must be converted to a fixed static port plus the explicit port in the string. Then set SQLBrowser to Disabled, remove the UDP 1434 firewall rule, restart nothing else, and verify each client from its own subnet — not from the DBA jump host."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “_____ (service name SQLBrowser ) is a separate Windows service installed with the Database Engine.”",
      "options": [
        "SQL Server Browser",
        "1434",
        "UDP"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “SQL Server Browser (service name SQLBrowser ) is a separate Windows service installed with the Database Engine. There is exactly one Browser per server, no matter how many instances run on it. It is a directory service for instances — it never carries a single row of query data.”"
    },
    {
      "question": "Complete the lesson statement: “Understanding this sequence is what lets you tell a _____ failure from a network failure from a login failure — three errors that look identical to the application team.”",
      "options": [
        "UDP",
        "5022",
        "resolution"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Follow one connection string through the stack. Understanding this sequence is what lets you tell a resolution failure from a network failure from a login failure — three errors that look identical to the application team.”"
    },
    {
      "question": "Complete the lesson statement: “Opinionated production rule: _____”",
      "options": [
        "5022",
        "if any connection string names an instance without a port, the Browser must run.",
        "UDP"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Opinionated production rule: if any connection string names an instance without a port, the Browser must run. Disabling it is a legitimate hardening step, but only after every client has been moved to explicit ports.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Starting and verifying the service”?",
      "options": [
        "Check it from the host with PowerShell.",
        "The port changes at every service start; only the Browser knows it",
        "Works without it if every client carries the port explicitly"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Check it from the host with PowerShell. The service should be Running and Automatic on any server whose clients use instance names:”"
    },
    {
      "question": "Complete the lesson statement: “The Browser carries no data, so the usual “expose as little as possible” logic applies to _____ rather than to the service itself.”",
      "options": [
        "Yes",
        "invisible",
        "UDP 1434"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The Browser carries no data, so the usual “expose as little as possible” logic applies to UDP 1434 rather than to the service itself. Anyone who can reach it learns the names of every instance on the host — a free reconnaissance service for an attacker mapping your estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Troubleshooting resolution failures”?",
      "options": [
        "The instance list itself is built from SSRP replies",
        "Match the symptom to the layer before touching anything.",
        "Local connections never use SSRP"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Match the symptom to the layer before touching anything. The provider error number tells you where to look:”"
    },
    {
      "question": "Complete the lesson statement: “Its job is to answer SSRP (SQL Server Resolution Protocol) queries sent to _____.”",
      "options": [
        "UDP 1434",
        "only",
        "Disabled"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Its job is to answer SSRP (SQL Server Resolution Protocol) queries sent to UDP 1434. When a client is given a connection string such as sql-node-02\\REPORTS with no port number, the client library must first ask “what port is REPORTS on?”, then open a TCP connection to the port that comes back.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Instance resolution, step by step”?",
      "options": [
        "Local connections use shared memory — they prove nothing about TCP",
        "resolution",
        "The port map for a typical server running a default instance, one named instance, and an availability group:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The port map for a typical server running a default instance, one named instance, and an availability group:”"
    },
    {
      "question": "Complete the lesson statement: “First, a server with dynamic ports and a stopped Browser is _____ to every remote client, while server,1433 (the default instance) keeps working — which is why these outages are so confusing.”",
      "options": [
        "10061",
        "invisible",
        "not"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Two consequences worth stating out loud. First, a server with dynamic ports and a stopped Browser is invisible to every remote client, while server,1433 (the default instance) keeps working — which is why these outages are so confusing. Second, with Browser disabled, a renamed or renumbered instance silently breaks every connection string you thought you had fixed.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Starting and verifying the service”?",
      "options": [
        "Then confirm what the instance itself reports, so you can compare “what the Browser would advertise” with “what is really listening”:",
        "Order of operations: confirm the service, confirm the listening port with netstat, confirm the firewall rule, then confirm the connection string.",
        "Is SQLBrowser running? Is UDP 1434 reachable from the client subnet?"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Then confirm what the instance itself reports, so you can compare “what the Browser would advertise” with “what is really listening”:”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “_____ (service name SQLBrowser ) is a separate Windows service installed with the Database Engine.”",
      "options": [
        "SQL Server Browser",
        "1434",
        "UDP"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “SQL Server Browser (service name SQLBrowser ) is a separate Windows service installed with the Database Engine. There is exactly one Browser per server, no matter how many instances run on it. It is a directory service for instances — it never carries a single row of query data.”"
    },
    {
      "question": "Complete the lesson statement: “Understanding this sequence is what lets you tell a _____ failure from a network failure from a login failure — three errors that look identical to the application team.”",
      "options": [
        "UDP",
        "5022",
        "resolution"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Follow one connection string through the stack. Understanding this sequence is what lets you tell a resolution failure from a network failure from a login failure — three errors that look identical to the application team.”"
    },
    {
      "question": "Complete the lesson statement: “Opinionated production rule: _____”",
      "options": [
        "5022",
        "if any connection string names an instance without a port, the Browser must run.",
        "UDP"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Opinionated production rule: if any connection string names an instance without a port, the Browser must run. Disabling it is a legitimate hardening step, but only after every client has been moved to explicit ports.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Starting and verifying the service”?",
      "options": [
        "Check it from the host with PowerShell.",
        "The port changes at every service start; only the Browser knows it",
        "Works without it if every client carries the port explicitly"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Check it from the host with PowerShell. The service should be Running and Automatic on any server whose clients use instance names:”"
    },
    {
      "question": "Complete the lesson statement: “The Browser carries no data, so the usual “expose as little as possible” logic applies to _____ rather than to the service itself.”",
      "options": [
        "Yes",
        "invisible",
        "UDP 1434"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The Browser carries no data, so the usual “expose as little as possible” logic applies to UDP 1434 rather than to the service itself. Anyone who can reach it learns the names of every instance on the host — a free reconnaissance service for an attacker mapping your estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Troubleshooting resolution failures”?",
      "options": [
        "The instance list itself is built from SSRP replies",
        "Match the symptom to the layer before touching anything.",
        "Local connections never use SSRP"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Match the symptom to the layer before touching anything. The provider error number tells you where to look:”"
    },
    {
      "question": "Complete the lesson statement: “Its job is to answer SSRP (SQL Server Resolution Protocol) queries sent to _____.”",
      "options": [
        "UDP 1434",
        "only",
        "Disabled"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Its job is to answer SSRP (SQL Server Resolution Protocol) queries sent to UDP 1434. When a client is given a connection string such as sql-node-02\\REPORTS with no port number, the client library must first ask “what port is REPORTS on?”, then open a TCP connection to the port that comes back.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Instance resolution, step by step”?",
      "options": [
        "Local connections use shared memory — they prove nothing about TCP",
        "resolution",
        "The port map for a typical server running a default instance, one named instance, and an availability group:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The port map for a typical server running a default instance, one named instance, and an availability group:”"
    },
    {
      "question": "Complete the lesson statement: “First, a server with dynamic ports and a stopped Browser is _____ to every remote client, while server,1433 (the default instance) keeps working — which is why these outages are so confusing.”",
      "options": [
        "10061",
        "invisible",
        "not"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Two consequences worth stating out loud. First, a server with dynamic ports and a stopped Browser is invisible to every remote client, while server,1433 (the default instance) keeps working — which is why these outages are so confusing. Second, with Browser disabled, a renamed or renumbered instance silently breaks every connection string you thought you had fixed.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Starting and verifying the service”?",
      "options": [
        "Then confirm what the instance itself reports, so you can compare “what the Browser would advertise” with “what is really listening”:",
        "Order of operations: confirm the service, confirm the listening port with netstat, confirm the firewall rule, then confirm the connection string.",
        "Is SQLBrowser running? Is UDP 1434 reachable from the client subnet?"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Then confirm what the instance itself reports, so you can compare “what the Browser would advertise” with “what is really listening”:”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “_____ (service name SQLBrowser ) is a separate Windows service installed with the Database Engine.”",
      "options": [
        "SQL Server Browser",
        "1434",
        "UDP"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “SQL Server Browser (service name SQLBrowser ) is a separate Windows service installed with the Database Engine. There is exactly one Browser per server, no matter how many instances run on it. It is a directory service for instances — it never carries a single row of query data.”"
    },
    {
      "question": "Complete the lesson statement: “Understanding this sequence is what lets you tell a _____ failure from a network failure from a login failure — three errors that look identical to the application team.”",
      "options": [
        "UDP",
        "5022",
        "resolution"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Follow one connection string through the stack. Understanding this sequence is what lets you tell a resolution failure from a network failure from a login failure — three errors that look identical to the application team.”"
    },
    {
      "question": "Complete the lesson statement: “Opinionated production rule: _____”",
      "options": [
        "5022",
        "if any connection string names an instance without a port, the Browser must run.",
        "UDP"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Opinionated production rule: if any connection string names an instance without a port, the Browser must run. Disabling it is a legitimate hardening step, but only after every client has been moved to explicit ports.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Starting and verifying the service”?",
      "options": [
        "Check it from the host with PowerShell.",
        "The port changes at every service start; only the Browser knows it",
        "Works without it if every client carries the port explicitly"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Check it from the host with PowerShell. The service should be Running and Automatic on any server whose clients use instance names:”"
    },
    {
      "question": "Complete the lesson statement: “The Browser carries no data, so the usual “expose as little as possible” logic applies to _____ rather than to the service itself.”",
      "options": [
        "Yes",
        "invisible",
        "UDP 1434"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The Browser carries no data, so the usual “expose as little as possible” logic applies to UDP 1434 rather than to the service itself. Anyone who can reach it learns the names of every instance on the host — a free reconnaissance service for an attacker mapping your estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Troubleshooting resolution failures”?",
      "options": [
        "The instance list itself is built from SSRP replies",
        "Match the symptom to the layer before touching anything.",
        "Local connections never use SSRP"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Match the symptom to the layer before touching anything. The provider error number tells you where to look:”"
    },
    {
      "question": "Complete the lesson statement: “Its job is to answer SSRP (SQL Server Resolution Protocol) queries sent to _____.”",
      "options": [
        "UDP 1434",
        "only",
        "Disabled"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Its job is to answer SSRP (SQL Server Resolution Protocol) queries sent to UDP 1434. When a client is given a connection string such as sql-node-02\\REPORTS with no port number, the client library must first ask “what port is REPORTS on?”, then open a TCP connection to the port that comes back.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Instance resolution, step by step”?",
      "options": [
        "Local connections use shared memory — they prove nothing about TCP",
        "resolution",
        "The port map for a typical server running a default instance, one named instance, and an availability group:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The port map for a typical server running a default instance, one named instance, and an availability group:”"
    },
    {
      "question": "Complete the lesson statement: “First, a server with dynamic ports and a stopped Browser is _____ to every remote client, while server,1433 (the default instance) keeps working — which is why these outages are so confusing.”",
      "options": [
        "10061",
        "invisible",
        "not"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Two consequences worth stating out loud. First, a server with dynamic ports and a stopped Browser is invisible to every remote client, while server,1433 (the default instance) keeps working — which is why these outages are so confusing. Second, with Browser disabled, a renamed or renumbered instance silently breaks every connection string you thought you had fixed.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Starting and verifying the service”?",
      "options": [
        "Then confirm what the instance itself reports, so you can compare “what the Browser would advertise” with “what is really listening”:",
        "Order of operations: confirm the service, confirm the listening port with netstat, confirm the firewall rule, then confirm the connection string.",
        "Is SQLBrowser running? Is UDP 1434 reachable from the client subnet?"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Then confirm what the instance itself reports, so you can compare “what the Browser would advertise” with “what is really listening”:”"
    }
  ],
  takeaways: [
    "SQL Server Browser is a per-server directory service: UDP 1434 in, instance name out — never a data path",
    "Named instances with dynamic ports are unreachable without it; the default instance on 1433 is not affected",
    "Error 26 means resolution failed; error 10061 means nothing is listening; 18456 means you got past both",
    "Secure it by scoping UDP 1434 to application subnets — or disable it once all clients use explicit ports",
    "Always verify from the application tier: local connections use shared memory and prove nothing about TCP"
  ]
};
