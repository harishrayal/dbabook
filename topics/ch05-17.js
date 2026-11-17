/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch05-17.html */

window.TOPIC = {
  id: "ch05-17",
  title: "TCP/IP Configuration",

  lead: "TCP/IP is the protocol that makes a SQL Server reachable — and its IP address, port, and dynamic-port settings are the difference between a stable endpoint and a firewall rule that stops matching after every reboot.",

  objectives: [
    "Enable TCP/IP correctly and know when a restart is required",
    "Configure the IP address tabs and IPAll for an instance",
    "Choose between static and dynamic ports with confidence",
    "Verify listening sockets from Windows and from SQL Server",
    "Avoid the classic TCP/IP configuration mistakes"
  ],

  sections: [
    {
      h: "Enabling TCP/IP",
      html: `
<p>Open <strong>SQL Server Configuration Manager → SQL Server Network Configuration → Protocols for INSTANCE</strong> and set TCP/IP to <strong>Enabled</strong>. Two things follow immediately:</p>
<ol>
  <li>The setting is read at service start — you must <strong>restart the Database Engine service</strong> for the instance</li>
  <li>Until the restart completes, the instance keeps listening exactly as before, which makes half-applied changes confusing to debug</li>
</ol>
<p>Enable it per instance, not machine-wide: each instance owns its own protocol state, its own ports, and its own restart. The SQL Server Agent has no separate protocol configuration — it talks to the engine locally.</p>
<pre><code class="language-powershell"># Apply the change
Restart-Service MSSQLSERVER -Force

# Confirm the engine is listening on the expected port
Get-NetTCPConnection -State Listen -LocalPort 1433 |
  Select-Object LocalAddress, LocalPort, OwningProcess</code></pre>
<p>If <code>Get-NetTCPConnection</code> returns nothing, TCP/IP is disabled, the service did not restart, or the instance is listening on a different port — check all three before blaming the firewall.</p>
`
    },
    {
      h: "The IP address tabs and IPAll",
      html: `
<p>Below the protocol list, <strong>Properties → IP Addresses</strong> shows one tab per network interface plus <strong>IPAll</strong>. The per-IP tabs let you bind SQL Server to specific addresses; IPAll is the catch-all that applies to any address not configured individually.</p>
<table>
  <tr><th>Setting</th><th>Where</th><th>Meaning</th></tr>
  <tr><td><strong>Enabled / Active</strong></td><td>Each IP tab</td><td>Whether this address is offered at all — a “No” here is a common cause of “some clients work, some do not”</td></tr>
  <tr><td><strong>IP Address</strong></td><td>Each IP tab</td><td>The specific address to bind, or <code>1433</code>-style entries left at defaults</td></tr>
  <tr><td><strong>TCP Port</strong></td><td>Each IP tab / IPAll</td><td>The fixed port for that address</td></tr>
  <tr><td><strong>TCP Dynamic Ports</strong></td><td>Each IP tab / IPAll</td><td><code>0</code> = let SQL Server pick a free port at every start-up; blank = no dynamic port</td></tr>
</table>
<p>Rules of thumb:</p>
<ul>
  <li>Leave the per-IP tabs alone unless you deliberately want SQL Server on specific addresses only — binding to one NIC is a legitimate design choice, but it must be deliberate</li>
  <li><strong>IPAll is where production configuration happens</strong>: one port, applied to every address</li>
  <li>IPAll's TCP Port and TCP Dynamic Ports must not fight each other — configure exactly one of them</li>
</ul>
`
    },
    {
      h: "Static versus dynamic ports",
      html: `
<p><strong>Production recommendation: static ports, always.</strong> Dynamic ports look convenient at install time and then cost you for years:</p>
<table>
  <tr><th>Concern</th><th>Dynamic port</th><th>Static port</th></tr>
  <tr><td>Firewall rules</td><td>Must allow the Browser and follow the port</td><td>One fixed inbound rule, reviewable</td></tr>
  <tr><td>Connection strings</td><td>Instance name + Browser dependency</td><td>Explicit <code>host,port</code> works anywhere</td></tr>
  <tr><td>Monitoring probes</td><td>Port changes after restarts</td><td>Stable target forever</td></tr>
  <tr><td>Documentation</td><td>The “current port” is a moving fact</td><td>One line in the inventory, always true</td></tr>
  <tr><td>Failure mode</td><td>Browser down → instance invisible</td><td>Instance always on a known port</td></tr>
</table>
<p>To set a static port: clear <strong>TCP Dynamic Ports</strong> in IPAll and type the port into <strong>TCP Port</strong>, then restart the service. Choose from a registered range — keep a simple port register (instance → host → port) so two instances never collide, and so the firewall team gets the right number the first time.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Applying a static TCP port change end to end">
    <defs>
      <marker id="tcp-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="25" y="45" width="175" height="95" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="112" y="75" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1 · Set the port</text>
    <text x="112" y="97" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">IPAll → TCP Port 1433</text>
    <text x="112" y="117" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Dynamic Ports → blank</text>

    <rect x="225" y="45" width="175" height="95" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="312" y="75" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2 · Restart service</text>
    <text x="312" y="97" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">protocols load at start-up</text>
    <text x="312" y="117" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">no hot reload exists</text>

    <rect x="425" y="45" width="175" height="95" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="512" y="75" text-anchor="middle" fill="var(--accent-strong)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">3 · Verify listening</text>
    <text x="512" y="97" text-anchor="middle" fill="var(--text)" font-size="11.5" font-family="Segoe UI, sans-serif">0.0.0.0:1433 established</text>
    <text x="512" y="117" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">netstat · Get-NetTCPConnection</text>

    <rect x="625" y="45" width="115" height="95" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="682" y="75" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4 · Client</text>
    <text x="682" y="97" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">host,port connects</text>
    <text x="682" y="117" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">probe passes</text>

    <line x1="200" y1="92" x2="223" y2="92" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#tcp-arrow)"/>
    <line x1="400" y1="92" x2="423" y2="92" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#tcp-arrow)"/>
    <line x1="600" y1="92" x2="623" y2="92" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#tcp-arrow)"/>

    <rect x="225" y="215" width="375" height="80" rx="10" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="412" y="243" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Skip step 2 and the old socket survives</text>
    <text x="412" y="266" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">the new port refuses connections (10061) while the instance</text>
    <text x="412" y="285" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">still answers on the previous dynamic port</text>
    <line x1="312" y1="140" x2="350" y2="213" stroke="var(--amber)" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#tcp-arrow)"/>

    <text x="380" y="330" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">A port change is only real once the service has restarted and the socket has been observed.</text>
  </svg>
  <div class="figcaption">Figure 1 — The four steps of a TCP port change, and what happens when the restart is forgotten.</div>
</div>
`
    },
    {
      h: "Applying and verifying changes",
      html: `
<p>Never walk away from a port change on “it looks right in Configuration Manager”. Confirm the socket from Windows:</p>
<pre><code class="language-powershell"># Every listening SQL-related socket on this host
Get-NetTCPConnection -State Listen |
  Where-Object { $_.OwningProcess -in (Get-Process sqlservr).Id } |
  Select-Object LocalAddress, LocalPort, OwningProcess

# Classic equivalent
netstat -ano | findstr "LISTENING" | findstr "1433"</code></pre>
<p>Then confirm from the engine's own point of view — the port a real session arrived on:</p>
<pre><code class="language-sql">SELECT session_id,
       local_net_transport,
       local_tcp_port
FROM   sys.dm_exec_connections
WHERE  session_id = @@SPID;

-- What does this instance think it is?
SELECT @@SERVERNAME AS server_name,
       SERVERPROPERTY('InstanceName') AS instance_name;</code></pre>
<p>Finally, from the client tier: <code>Test-NetConnection sql-node-02 -Port 1433</code>. Three vantage points — the host, the engine, the client — and only all three together constitute proof.</p>
`
    },
    {
      h: "TCP behaviour that bites",
      html: `
<table>
  <tr><th>Behaviour</th><th>Symptom</th><th>Mitigation</th></tr>
  <tr><td>Idle TDS connections dropped by a firewall or load balancer</td><td>Intermittent “connection was reset” on pooled connections</td><td>Connection pooling with a sensible lifetime; keep-alive configuration on the path</td></tr>
  <tr><td>IPv4 and IPv6 both in use</td><td>Clients fail on one address family while the other works</td><td>Confirm which addresses the instance is bound to; test both from the client</td></tr>
  <tr><td>Bound to a single NIC address</td><td>Hosts on another subnet cannot connect at all</td><td>Use IPAll for “listen on all addresses”, or document the deliberate single-NIC design</td></tr>
  <tr><td>Multiple instances on one host</td><td>Port collision at start-up, instance fails to come up</td><td>Assign each instance a unique static port in the register</td></tr>
</table>
`
    },
    {
      h: "Common mistakes",
      html: `
<ol>
  <li><strong>Enabling TCP/IP and never restarting</strong> — the change is saved, the old socket keeps serving, and everyone blames the firewall</li>
  <li><strong>Setting a static port but leaving dynamic ports configured</strong> — IPAll ends up ambiguous and the instance binds somewhere unexpected</li>
  <li><strong>Configuring the per-IP tabs and not IPAll</strong> — some addresses get the port, others do not, and failures look random</li>
  <li><strong>Opening 1433 in the firewall while the instance listens on a dynamic port</strong> — the rule matches nothing</li>
  <li><strong>Changing ports without updating the port register, monitoring, and connection strings</strong> — the change works until the next restart or migration</li>
</ol>
<p>All five share one root cause: the change was treated as a click instead of as a configuration change with verification steps. Treat the port like an interface contract — it is consumed by firewalls, probes, aliases, and applications, and it changes only through the runbook.</p>
`
    }
  ],

  scenario: {
    title: "11:12 — connection refused on the new port, while the old port still worked",
    html: `
<p>A bank moved its reporting instance from a dynamic port to static port <strong>1533</strong> so the firewall team could write a permanent rule. The rule was created, the connection strings were updated, and the change was marked complete at 11:00. At 11:12 monitoring reported <em>“connection refused”</em> (error 10061) from every probe using <code>host,1533</code> — yet connections using the instance name <code>host\\REPORTS</code> still succeeded.</p>
<p>The DBA read the evidence: Configuration Manager showed TCP Port 1533 in IPAll, but <code>Get-NetTCPConnection</code> showed the engine still listening on the old dynamic port. <strong>The service had never been restarted</strong> — protocols load at start-up, so the saved setting was not yet real. Browser still advertised the old port, which is exactly why instance-name connections kept working and why the failure looked so contradictory. Fix: restart the Database Engine in a five-minute window, confirm <code>0.0.0.0:1533</code> in <code>netstat</code>, re-run the probes, and update the port register. Prevention: every protocol change in the runbook now carries two mandatory verification lines — “service restarted” and “expected socket observed” — and the change is not closed until a probe from the application subnet passes.</p>
`
  },

  interview: [
    {
      q: "You enable TCP/IP in SQL Server Configuration Manager. What else must you do?",
      a: "Restart the Database Engine service for that instance — protocols are read at start-up and there is no hot reload. Then verify the listening socket with Get-NetTCPConnection or netstat, confirm the port matches the firewall rule and the port register, and test from the client tier rather than the server."
    },
    {
      q: "Static or dynamic ports for a production instance?",
      a: "Static. A dynamic port makes the Browser a hard dependency, changes after every restart, and forces firewall rules and monitoring to follow a moving target. A static port is one documented number that connection strings, probes, and firewall rules can all rely on; dynamic ports belong in development."
    },
    {
      q: "How do you find out which port an instance is actually listening on?",
      a: "From Windows: Get-NetTCPConnection -State Listen or netstat -ano, filtered to the sqlservr process ID. From SQL Server: the IP Address tabs in Configuration Manager show the configured port, and sys.dm_exec_connections.local_tcp_port shows the port an actual session arrived on. If Windows and Configuration Manager disagree, the service has not been restarted since the change."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “Open SQL Server Configuration Manager → SQL Server Network Configuration → Protocols for INSTANCE and set TCP/IP to _____.”",
      "options": [
        "The fixed port for that address",
        "Enabled",
        "The specific address to bind, or 1433 -style entries left at defaults"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Open SQL Server Configuration Manager → SQL Server Network Configuration → Protocols for INSTANCE and set TCP/IP to Enabled. Two things follow immediately:”"
    },
    {
      "question": "Complete the lesson statement: “Below the protocol list, _____ shows one tab per network interface plus IPAll.”",
      "options": [
        "Properties → IP Addresses",
        "The fixed port for that address",
        "0 = let SQL Server pick a free port at every start-up; blank = no dynamic port"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Below the protocol list, Properties → IP Addresses shows one tab per network interface plus IPAll. The per-IP tabs let you bind SQL Server to specific addresses; IPAll is the catch-all that applies to any address not configured individually.”"
    },
    {
      "question": "Complete the lesson statement: “_____”",
      "options": [
        "0 = let SQL Server pick a free port at every start-up; blank = no dynamic port",
        "One fixed inbound rule, reviewable",
        "Production recommendation: static ports, always."
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Production recommendation: static ports, always. Dynamic ports look convenient at install time and then cost you for years:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Applying and verifying changes”?",
      "options": [
        "Finally, from the client tier: Test-NetConnection sql-node-02 -Port 1433.",
        "Never walk away from a port change on “it looks right in Configuration Manager”.",
        "Then confirm from the engine's own point of view — the port a real session arrived on:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Never walk away from a port change on “it looks right in Configuration Manager”. Confirm the socket from Windows:”"
    },
    {
      "question": "In the “TCP behaviour that bites” table, what is listed for “Idle TDS connections dropped by a firewall or load balancer” under “Mitigation”?",
      "options": [
        "Connection pooling with a sensible lifetime; keep-alive configuration on the path",
        "All five share one root cause: the change was treated as a click instead of as a configuration change with verification steps.",
        "restart the Database Engine service"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Idle TDS connections dropped by a firewall or load balancer” as “Connection pooling with a sensible lifetime; keep-alive configuration on the path”."
    },
    {
      "question": "Which fact is covered in the lesson section “Common mistakes”?",
      "options": [
        "restart the Database Engine service",
        "IPAll",
        "All five share one root cause: the change was treated as a click instead of as a configuration change with verification steps."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “All five share one root cause: the change was treated as a click instead of as a configuration change with verification steps. Treat the port like an interface contract — it is consumed by firewalls, probes, aliases, and applications, and it changes only through the runbook.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Enabling TCP/IP”?",
      "options": [
        "Enabled / Active",
        "Enable it per instance, not machine-wide: each instance owns its own protocol state, its own ports, and its own restart.",
        "IPAll"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Enable it per instance, not machine-wide: each instance owns its own protocol state, its own ports, and its own restart. The SQL Server Agent has no separate protocol configuration — it talks to the engine locally.”"
    },
    {
      "question": "In the “The IP address tabs and IPAll” table, what is listed for “Enabled / Active” under “Meaning”?",
      "options": [
        "Whether this address is offered at all — a “No” here is a common cause of “some clients work, some do not”",
        "Enabled / Active",
        "IP Address"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Enabled / Active” as “Whether this address is offered at all — a “No” here is a common cause of “some clients work, some do not””."
    },
    {
      "question": "Complete the lesson statement: “To set a static port: clear _____ in IPAll and type the port into TCP Port, then restart the service.”",
      "options": [
        "Never walk away from a port change on “it looks right in Configuration Manager”.",
        "Then confirm from the engine's own point of view — the port a real session arrived on:",
        "TCP Dynamic Ports"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “To set a static port: clear TCP Dynamic Ports in IPAll and type the port into TCP Port, then restart the service. Choose from a registered range — keep a simple port register (instance → host → port) so two instances never collide, and so the firewall team gets the right number the first time.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Applying and verifying changes”?",
      "options": [
        "IPAll is where production configuration happens",
        "Then confirm from the engine's own point of view — the port a real session arrived on:",
        "TCP Port"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Then confirm from the engine's own point of view — the port a real session arrived on:”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “Open SQL Server Configuration Manager → SQL Server Network Configuration → Protocols for INSTANCE and set TCP/IP to _____.”",
      "options": [
        "The fixed port for that address",
        "Enabled",
        "The specific address to bind, or 1433 -style entries left at defaults"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Open SQL Server Configuration Manager → SQL Server Network Configuration → Protocols for INSTANCE and set TCP/IP to Enabled. Two things follow immediately:”"
    },
    {
      "question": "Complete the lesson statement: “Below the protocol list, _____ shows one tab per network interface plus IPAll.”",
      "options": [
        "Properties → IP Addresses",
        "The fixed port for that address",
        "0 = let SQL Server pick a free port at every start-up; blank = no dynamic port"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Below the protocol list, Properties → IP Addresses shows one tab per network interface plus IPAll. The per-IP tabs let you bind SQL Server to specific addresses; IPAll is the catch-all that applies to any address not configured individually.”"
    },
    {
      "question": "Complete the lesson statement: “_____”",
      "options": [
        "0 = let SQL Server pick a free port at every start-up; blank = no dynamic port",
        "One fixed inbound rule, reviewable",
        "Production recommendation: static ports, always."
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Production recommendation: static ports, always. Dynamic ports look convenient at install time and then cost you for years:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Applying and verifying changes”?",
      "options": [
        "Finally, from the client tier: Test-NetConnection sql-node-02 -Port 1433.",
        "Never walk away from a port change on “it looks right in Configuration Manager”.",
        "Then confirm from the engine's own point of view — the port a real session arrived on:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Never walk away from a port change on “it looks right in Configuration Manager”. Confirm the socket from Windows:”"
    },
    {
      "question": "In the “TCP behaviour that bites” table, what is listed for “Idle TDS connections dropped by a firewall or load balancer” under “Mitigation”?",
      "options": [
        "Connection pooling with a sensible lifetime; keep-alive configuration on the path",
        "All five share one root cause: the change was treated as a click instead of as a configuration change with verification steps.",
        "restart the Database Engine service"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Idle TDS connections dropped by a firewall or load balancer” as “Connection pooling with a sensible lifetime; keep-alive configuration on the path”."
    },
    {
      "question": "Which fact is covered in the lesson section “Common mistakes”?",
      "options": [
        "restart the Database Engine service",
        "IPAll",
        "All five share one root cause: the change was treated as a click instead of as a configuration change with verification steps."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “All five share one root cause: the change was treated as a click instead of as a configuration change with verification steps. Treat the port like an interface contract — it is consumed by firewalls, probes, aliases, and applications, and it changes only through the runbook.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Enabling TCP/IP”?",
      "options": [
        "Enabled / Active",
        "Enable it per instance, not machine-wide: each instance owns its own protocol state, its own ports, and its own restart.",
        "IPAll"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Enable it per instance, not machine-wide: each instance owns its own protocol state, its own ports, and its own restart. The SQL Server Agent has no separate protocol configuration — it talks to the engine locally.”"
    },
    {
      "question": "In the “The IP address tabs and IPAll” table, what is listed for “Enabled / Active” under “Meaning”?",
      "options": [
        "Whether this address is offered at all — a “No” here is a common cause of “some clients work, some do not”",
        "Enabled / Active",
        "IP Address"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Enabled / Active” as “Whether this address is offered at all — a “No” here is a common cause of “some clients work, some do not””."
    },
    {
      "question": "Complete the lesson statement: “To set a static port: clear _____ in IPAll and type the port into TCP Port, then restart the service.”",
      "options": [
        "Never walk away from a port change on “it looks right in Configuration Manager”.",
        "Then confirm from the engine's own point of view — the port a real session arrived on:",
        "TCP Dynamic Ports"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “To set a static port: clear TCP Dynamic Ports in IPAll and type the port into TCP Port, then restart the service. Choose from a registered range — keep a simple port register (instance → host → port) so two instances never collide, and so the firewall team gets the right number the first time.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Applying and verifying changes”?",
      "options": [
        "IPAll is where production configuration happens",
        "Then confirm from the engine's own point of view — the port a real session arrived on:",
        "TCP Port"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Then confirm from the engine's own point of view — the port a real session arrived on:”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “Open SQL Server Configuration Manager → SQL Server Network Configuration → Protocols for INSTANCE and set TCP/IP to _____.”",
      "options": [
        "The fixed port for that address",
        "Enabled",
        "The specific address to bind, or 1433 -style entries left at defaults"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Open SQL Server Configuration Manager → SQL Server Network Configuration → Protocols for INSTANCE and set TCP/IP to Enabled. Two things follow immediately:”"
    },
    {
      "question": "Complete the lesson statement: “Below the protocol list, _____ shows one tab per network interface plus IPAll.”",
      "options": [
        "Properties → IP Addresses",
        "The fixed port for that address",
        "0 = let SQL Server pick a free port at every start-up; blank = no dynamic port"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Below the protocol list, Properties → IP Addresses shows one tab per network interface plus IPAll. The per-IP tabs let you bind SQL Server to specific addresses; IPAll is the catch-all that applies to any address not configured individually.”"
    },
    {
      "question": "Complete the lesson statement: “_____”",
      "options": [
        "0 = let SQL Server pick a free port at every start-up; blank = no dynamic port",
        "One fixed inbound rule, reviewable",
        "Production recommendation: static ports, always."
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Production recommendation: static ports, always. Dynamic ports look convenient at install time and then cost you for years:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Applying and verifying changes”?",
      "options": [
        "Finally, from the client tier: Test-NetConnection sql-node-02 -Port 1433.",
        "Never walk away from a port change on “it looks right in Configuration Manager”.",
        "Then confirm from the engine's own point of view — the port a real session arrived on:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Never walk away from a port change on “it looks right in Configuration Manager”. Confirm the socket from Windows:”"
    },
    {
      "question": "In the “TCP behaviour that bites” table, what is listed for “Idle TDS connections dropped by a firewall or load balancer” under “Mitigation”?",
      "options": [
        "Connection pooling with a sensible lifetime; keep-alive configuration on the path",
        "All five share one root cause: the change was treated as a click instead of as a configuration change with verification steps.",
        "restart the Database Engine service"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Idle TDS connections dropped by a firewall or load balancer” as “Connection pooling with a sensible lifetime; keep-alive configuration on the path”."
    },
    {
      "question": "Which fact is covered in the lesson section “Common mistakes”?",
      "options": [
        "restart the Database Engine service",
        "IPAll",
        "All five share one root cause: the change was treated as a click instead of as a configuration change with verification steps."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “All five share one root cause: the change was treated as a click instead of as a configuration change with verification steps. Treat the port like an interface contract — it is consumed by firewalls, probes, aliases, and applications, and it changes only through the runbook.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Enabling TCP/IP”?",
      "options": [
        "Enabled / Active",
        "Enable it per instance, not machine-wide: each instance owns its own protocol state, its own ports, and its own restart.",
        "IPAll"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Enable it per instance, not machine-wide: each instance owns its own protocol state, its own ports, and its own restart. The SQL Server Agent has no separate protocol configuration — it talks to the engine locally.”"
    },
    {
      "question": "In the “The IP address tabs and IPAll” table, what is listed for “Enabled / Active” under “Meaning”?",
      "options": [
        "Whether this address is offered at all — a “No” here is a common cause of “some clients work, some do not”",
        "Enabled / Active",
        "IP Address"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Enabled / Active” as “Whether this address is offered at all — a “No” here is a common cause of “some clients work, some do not””."
    },
    {
      "question": "Complete the lesson statement: “To set a static port: clear _____ in IPAll and type the port into TCP Port, then restart the service.”",
      "options": [
        "Never walk away from a port change on “it looks right in Configuration Manager”.",
        "Then confirm from the engine's own point of view — the port a real session arrived on:",
        "TCP Dynamic Ports"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “To set a static port: clear TCP Dynamic Ports in IPAll and type the port into TCP Port, then restart the service. Choose from a registered range — keep a simple port register (instance → host → port) so two instances never collide, and so the firewall team gets the right number the first time.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Applying and verifying changes”?",
      "options": [
        "IPAll is where production configuration happens",
        "Then confirm from the engine's own point of view — the port a real session arrived on:",
        "TCP Port"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Then confirm from the engine's own point of view — the port a real session arrived on:”"
    }
  ],
  takeaways: [
    "TCP/IP is enabled per instance and only takes effect after a Database Engine service restart",
    "IPAll is where you set production ports: TCP Port for static, TCP Dynamic Ports blank — never both",
    "Static ports in production: stable firewall rules, stable connection strings, stable monitoring",
    "A saved setting is not an applied setting — verify the listening socket, then verify from the client",
    "Keep a port register: instance, host, port, and the firewall rule that allows it"
  ]
};
