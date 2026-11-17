/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch05-16.html */

window.TOPIC = {
  id: "ch05-16",
  title: "Network Configuration",

  lead: "SQL Server's network configuration decides which protocols the engine listens on, how clients reach it, and whether the TDS stream is encrypted — all configured in SQL Server Configuration Manager, not in Windows networking.",

  objectives: [
    "Locate server-side and client-side network settings",
    "Compare shared memory, named pipes, and TCP/IP",
    "Understand where encryption and Force Encryption are configured",
    "Verify connectivity from the client tier, not the server",
    "Choose a defensible production protocol baseline"
  ],

  sections: [
    {
      h: "Where the settings live",
      html: `
<p>Two separate consoles control SQL Server networking, and confusing them is the most common first mistake:</p>
<table>
  <tr><th>Console</th><th>Scope</th><th>What you configure there</th></tr>
  <tr><td><strong>SQL Server Network Configuration → Protocols for INSTANCE</strong></td><td>Server side, per instance</td><td>Enable/disable shared memory, named pipes, TCP/IP; TCP port properties; certificate and Force Encryption</td></tr>
  <tr><td><strong>SQL Native Client Configuration</strong></td><td>Client side, per machine</td><td>Client protocol order, aliases (<code>server\alias</code> → host:port), default network library</td></tr>
  <tr><td><strong>Windows Firewall with Advanced Security</strong></td><td>Host, inbound</td><td>Which ports are reachable from which addresses — covered separately</td></tr>
</table>
<p>Changing a protocol requires a <strong>restart of the Database Engine service</strong> for that instance. There is no hot reload — which is why protocol work belongs in a change window, not in an ad-hoc afternoon session.</p>
`
    },
    {
      h: "The protocols",
      html: `
<table>
  <tr><th>Protocol</th><th>Scope</th><th>Strengths</th><th>Verdict</th></tr>
  <tr><td><strong>Shared Memory</strong></td><td>Local connections only</td><td>Fastest path — in-process, no socket, no firewall</td><td><strong>Keep enabled</strong> for local administration</td></tr>
  <tr><td><strong>Named Pipes</strong></td><td>Local / SMB-based</td><td>Familiar to legacy Windows apps; used over SMB</td><td>Disable unless a specific application requires it</td></tr>
  <tr><td><strong>TCP/IP</strong></td><td>All remote traffic</td><td>The standard: routable, firewallable, works across subnets and with availability features</td><td><strong>Required</strong> for any remote workload</td></tr>
  <tr><td><strong>VIA</strong></td><td>Specialist hardware</td><td>Deprecated years ago and removed from modern versions</td><td>Ignore — it should not exist on your server</td></tr>
</table>
<p>Local clients negotiate from the client protocol order; remote clients have only TCP/IP as a practical option. The important production point: <strong>if TCP/IP is disabled, the server can be perfectly healthy and completely unreachable</strong> — the engine answers on shared memory for local sessions and on nothing for remote ones.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Paths into the SQL Server Database Engine">
    <defs>
      <marker id="net-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="270" y="120" width="220" height="95" rx="12" fill="var(--accent)"/>
    <text x="380" y="158" text-anchor="middle" fill="#ffffff" font-size="17" font-weight="700" font-family="Segoe UI, sans-serif">Database Engine</text>
    <text x="380" y="183" text-anchor="middle" fill="#dbeafe" font-size="12" font-family="Segoe UI, sans-serif">TDS endpoint · per instance</text>

    <rect x="20" y="25" width="205" height="72" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="122" y="53" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Local client</text>
    <text x="122" y="75" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">shared memory · no socket</text>

    <rect x="20" y="240" width="205" height="72" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="122" y="268" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Remote client</text>
    <text x="122" y="290" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">TCP/IP · TDS on 1433</text>

    <rect x="540" y="240" width="200" height="72" rx="10" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="640" y="268" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Named Pipes</text>
    <text x="640" y="290" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">legacy · disable by default</text>

    <rect x="540" y="25" width="200" height="72" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="640" y="53" text-anchor="middle" fill="var(--accent-strong)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Certificate + Force Encryption</text>
    <text x="640" y="75" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">TLS wraps the TDS stream</text>

    <line x1="225" y1="61" x2="268" y2="130" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#net-arrow)"/>
    <line x1="225" y1="276" x2="268" y2="205" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#net-arrow)"/>
    <line x1="540" y1="276" x2="492" y2="205" stroke="var(--amber)" stroke-width="1.6" marker-end="url(#net-arrow)"/>
    <line x1="540" y1="61" x2="492" y2="128" stroke="var(--accent)" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#net-arrow)"/>

    <text x="380" y="333" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Remote traffic has exactly one road in: TCP/IP — everything else is local, legacy, or a layer above it.</text>
  </svg>
  <div class="figcaption">Figure 1 — Paths into the engine: shared memory locally, TCP/IP remotely, TLS applied on top.</div>
</div>
`
    },
    {
      h: "Server side versus client side",
      html: `
<p>A connection only succeeds when <strong>both</strong> ends agree. The server must have a protocol enabled and listening; the client must be configured to use it.</p>
<table>
  <tr><th>Connection string</th><th>What the client does</th><th>Server requirement</th></tr>
  <tr><td><code>Server=sql-node-02</code></td><td>Default instance, default port 1433</td><td>TCP/IP enabled, port 1433 reachable</td></tr>
  <tr><td><code>Server=sql-node-02\\REPORTS</code></td><td>SSRP lookup on UDP 1434, then TCP</td><td>Browser running, dynamic/static port reachable</td></tr>
  <tr><td><code>Server=sql-node-02,1533</code></td><td>Straight to the explicit port</td><td>Instance listening on 1533</td></tr>
  <tr><td><code>Server=sql-node-02;Network=dbmssocp</code></td><td>Forces TCP/IP in older providers</td><td>TCP/IP enabled</td></tr>
</table>
<p>Client-side aliases are useful when connection strings cannot change: an alias maps a friendly name to host, port, and protocol, so a server migration becomes a one-line change on each application host instead of a code release. Keep the alias list documented — it is configuration that lives outside the database.</p>
<p>Local connections on shared memory bypass sockets entirely, which is why testing only from the server itself proves nothing about remote connectivity.</p>
`
    },
    {
      h: "Encryption and Force Encryption",
      html: `
<p>Encryption is configured on the server's TCP/IP properties, in the <strong>Certificate</strong> tab. Without Force Encryption, a connection is encrypted only if the client asks for it; with it, the server insists on TLS for every TDS session.</p>
<pre><code class="language-powershell"># Which certificates are available to SQL Server on this host?
Get-ChildItem Cert:\\LocalMachine\\My |
  Where-Object { $_.Subject -like '*sql*' } |
  Select-Object Thumbprint, Subject, NotAfter</code></pre>
<ul>
  <li><strong>Preferred</strong>: a certificate issued by your organisation's CA, with the server's FQDN in the subject or SAN</li>
  <li><strong>Acceptable</strong>: the auto-generated self-signed certificate — traffic is encrypted, but clients that validate certificates will reject the server's identity</li>
  <li><strong>Critical</strong>: certificates expire. Put every SQL Server certificate's <code>NotAfter</code> date into monitoring with a 30-day warning</li>
</ul>
<p>Two settings trip up every team once: clients need <code>TrustServerCertificate=True</code> (or the CA chain installed) when a self-signed certificate is used, and <code>Encrypt=True</code> in the connection string only <em>requests</em> encryption — it does not force the server to provide it.</p>
`
    },
    {
      h: "Verifying connectivity",
      html: `
<p>Test from the tier that actually connects — the application server, not the database host:</p>
<pre><code class="language-powershell"># TCP reachability from the app tier
Test-NetConnection -ComputerName sql-node-02 -Port 1433 |
  Select-Object ComputerName, RemoteAddress, RemotePort, TcpTestSucceeded</code></pre>
<p>Then confirm what the server sees for your own session:</p>
<pre><code class="language-sql">SELECT local_net_transport,   -- SHARED MEMORY / TCP / NAMED PIPE
       local_tcp_port,        -- NULL for shared memory
       encrypt_option         -- is this session encrypted?
FROM   sys.dm_exec_connections
WHERE  session_id = @@SPID;</code></pre>
<p>A remote session showing <code>local_net_transport = TCP</code> and a port confirms the whole chain: protocol enabled, listening socket open, firewall allowing the source, client using the right library.</p>
`
    },
    {
      h: "A production baseline",
      html: `
<p>Opinionated defaults that hold up under audit and under load:</p>
<table>
  <tr><th>Setting</th><th>Recommendation</th><th>Rationale</th></tr>
  <tr><td>Shared memory</td><td>Enabled</td><td>Local administration stays fast and unaffected by network changes</td></tr>
  <tr><td>Named pipes</td><td>Disabled</td><td>Removes an unnecessary remote path; re-enable only for a named application need</td></tr>
  <tr><td>TCP/IP</td><td>Enabled with a documented port</td><td>The only protocol that supports remote, monitored, firewalled access</td></tr>
  <tr><td>Force Encryption</td><td>On where policy requires it</td><td>Protects data in transit; pair with a real certificate and an expiry alert</td></tr>
  <tr><td>Client aliases</td><td>Documented per host</td><td>Migrations and failovers become configuration changes, not code releases</td></tr>
</table>
<p>Whatever you choose, record it: protocol state, port, certificate thumbprint, and the reason. The next DBA should be able to rebuild the exact network behaviour of the instance from your documentation alone.</p>
`
    }
  ],

  scenario: {
    title: "08:04 — remote clients failed while logins on the server worked",
    html: `
<p>Monday 08:04: every application server reported <em>“The certificate's validity period has expired”</em> when establishing connections. On the database host itself, SSMS connected instantly. The on-call DBA's first instinct — restart SQL Server — was wrong and would have changed nothing.</p>
<p>The discriminator was the transport: local sessions use <strong>shared memory</strong>, which never touches TLS, while every remote session rides TCP/IP under <strong>Force Encryption</strong>. Compliance had switched Force Encryption on eleven months earlier using the certificate SQL Server generated at install — a one-year, self-signed certificate whose expiry fell on Saturday. Diagnosis took four queries: <code>Test-NetConnection</code> proved the port was open, <code>sys.dm_exec_connections.encrypt_option</code> showed encryption in force, <code>Get-ChildItem Cert:\\LocalMachine\\My</code> showed <code>NotAfter</code> in the past, and the Configuration Manager Certificate tab showed the expired thumbprint.</p>
<p>Resolution: request a one-year certificate from the organisation CA with the server's FQDN, assign its thumbprint, restart the engine during a ten-minute window, and confirm remote sessions now report an encrypted connection with a valid chain. Prevention: SQL Server certificates joined the certificate-expiry monitor with a 30-day alert, and the self-signed fallback was documented as “encryption without identity” — never a long-term answer.</p>
`
  },

  interview: [
    {
      q: "What is the difference between server-side and client-side network configuration?",
      a: "Server-side (SQL Server Network Configuration, per instance) decides which protocols the engine listens on, its ports, and its certificate. Client-side (SQL Native Client Configuration) decides the protocol order and aliases used by applications on that machine. A connection needs both ends to agree — a perfectly configured server is unreachable if the client is pointed at the wrong port or protocol."
    },
    {
      q: "Local logins work but remote connections fail. What do you check?",
      a: "Local sessions use shared memory, so they prove nothing about TCP. From the application tier, test the port with Test-NetConnection; then check that TCP/IP is enabled for the instance, the service was restarted after the change, the listening port matches the connection string, and an inbound firewall rule allows the source subnet."
    },
    {
      q: "When would you use a SQL alias instead of changing connection strings?",
      a: "When application configuration cannot be changed easily — legacy apps, vendor software, many hosts at once. An alias maps a stable name to the current host, port, and protocol, so a migration or failover becomes a configuration update on each client. The trade-off is that the alias list becomes infrastructure you must document and keep in sync."
    }
  ],

  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Where the settings live”?",
      "options": [
        "A remote session showing local_net_transport = TCP and a port confirms the whole chain: protocol enabled, listening socket open, firewall allowing the source, client using the…",
        "Opinionated defaults that hold up under audit and under load:",
        "Two separate consoles control SQL Server networking, and confusing them is the most common first mistake:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Two separate consoles control SQL Server networking, and confusing them is the most common first mistake:”"
    },
    {
      "question": "Complete the lesson statement: “The important production point: _____ — the engine answers on shared memory for local sessions and on nothing for remote ones.”",
      "options": [
        "Client protocol order, aliases ( serveralias → host:port), default network library",
        "if TCP/IP is disabled, the server can be perfectly healthy and completely unreachable",
        "Enable/disable shared memory, named pipes, TCP/IP; TCP port properties; certificate and Force Encryption"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Local clients negotiate from the client protocol order; remote clients have only TCP/IP as a practical option. The important production point: if TCP/IP is disabled, the server can be perfectly healthy and completely unreachable — the engine answers on shared memory for local sessions and on nothing for remote ones.”"
    },
    {
      "question": "Complete the lesson statement: “A connection only succeeds when _____ ends agree.”",
      "options": [
        "both",
        "Client protocol order, aliases ( serveralias → host:port), default network library",
        "Which ports are reachable from which addresses — covered separately"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A connection only succeeds when both ends agree. The server must have a protocol enabled and listening; the client must be configured to use it.”"
    },
    {
      "question": "Complete the lesson statement: “Encryption is configured on the server's TCP/IP properties, in the _____ tab.”",
      "options": [
        "Which ports are reachable from which addresses — covered separately",
        "Keep enabled for local administration",
        "Certificate"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Encryption is configured on the server's TCP/IP properties, in the Certificate tab. Without Force Encryption, a connection is encrypted only if the client asks for it; with it, the server insists on TLS for every TDS session.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verifying connectivity”?",
      "options": [
        "Local administration stays fast and unaffected by network changes",
        "Test from the tier that actually connects — the application server, not the database host:",
        "Whatever you choose, record it: protocol state, port, certificate thumbprint, and the reason."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Test from the tier that actually connects — the application server, not the database host:”"
    },
    {
      "question": "Which fact is covered in the lesson section “A production baseline”?",
      "options": [
        "Opinionated defaults that hold up under audit and under load:",
        "A remote session showing local_net_transport = TCP and a port confirms the whole chain: protocol enabled, listening socket open, firewall allowing the source, client using the…",
        "Whatever you choose, record it: protocol state, port, certificate thumbprint, and the reason."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Opinionated defaults that hold up under audit and under load:”"
    },
    {
      "question": "Complete the lesson statement: “Changing a protocol requires a _____ for that instance.”",
      "options": [
        "Required for any remote workload",
        "Ignore — it should not exist on your server",
        "restart of the Database Engine service"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Changing a protocol requires a restart of the Database Engine service for that instance. There is no hot reload — which is why protocol work belongs in a change window, not in an ad-hoc afternoon session.”"
    },
    {
      "question": "In the “The protocols” table, what is listed for “Shared Memory” under “Verdict”?",
      "options": [
        "Removes an unnecessary remote path; re-enable only for a named application need",
        "Keep enabled for local administration",
        "Local administration stays fast and unaffected by network changes"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Shared Memory” as “Keep enabled for local administration”."
    },
    {
      "question": "Which fact is covered in the lesson section “Server side versus client side”?",
      "options": [
        "Client-side aliases are useful when connection strings cannot change: an alias maps a friendly name to host, port, and protocol, so a server migration becomes a one-line change on…",
        "TCP/IP enabled, port 1433 reachable",
        "Browser running, dynamic/static port reachable"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Client-side aliases are useful when connection strings cannot change: an alias maps a friendly name to host, port, and protocol, so a server migration becomes a one-line change on each application host instead of a code release. Keep the alias list documented — it is configuration that lives outside the database.”"
    },
    {
      "question": "Complete the lesson statement: “Two settings trip up every team once: clients need TrustServerCertificate=True (or the CA chain installed) when a self-signed certificate is used, and Encrypt=True in the connection string only _____ encryption — it does not force the server to provide it.”",
      "options": [
        "Local connections on shared memory bypass sockets entirely, which is why testing only from the server itself proves nothing about remote connectivity.",
        "TCP/IP enabled, port 1433 reachable",
        "requests"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Two settings trip up every team once: clients need TrustServerCertificate=True (or the CA chain installed) when a self-signed certificate is used, and Encrypt=True in the connection string only requests encryption — it does not force the server to provide it.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Where the settings live”?",
      "options": [
        "A remote session showing local_net_transport = TCP and a port confirms the whole chain: protocol enabled, listening socket open, firewall allowing the source, client using the…",
        "Opinionated defaults that hold up under audit and under load:",
        "Two separate consoles control SQL Server networking, and confusing them is the most common first mistake:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Two separate consoles control SQL Server networking, and confusing them is the most common first mistake:”"
    },
    {
      "question": "Complete the lesson statement: “The important production point: _____ — the engine answers on shared memory for local sessions and on nothing for remote ones.”",
      "options": [
        "Client protocol order, aliases ( serveralias → host:port), default network library",
        "if TCP/IP is disabled, the server can be perfectly healthy and completely unreachable",
        "Enable/disable shared memory, named pipes, TCP/IP; TCP port properties; certificate and Force Encryption"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Local clients negotiate from the client protocol order; remote clients have only TCP/IP as a practical option. The important production point: if TCP/IP is disabled, the server can be perfectly healthy and completely unreachable — the engine answers on shared memory for local sessions and on nothing for remote ones.”"
    },
    {
      "question": "Complete the lesson statement: “A connection only succeeds when _____ ends agree.”",
      "options": [
        "both",
        "Client protocol order, aliases ( serveralias → host:port), default network library",
        "Which ports are reachable from which addresses — covered separately"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A connection only succeeds when both ends agree. The server must have a protocol enabled and listening; the client must be configured to use it.”"
    },
    {
      "question": "Complete the lesson statement: “Encryption is configured on the server's TCP/IP properties, in the _____ tab.”",
      "options": [
        "Which ports are reachable from which addresses — covered separately",
        "Keep enabled for local administration",
        "Certificate"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Encryption is configured on the server's TCP/IP properties, in the Certificate tab. Without Force Encryption, a connection is encrypted only if the client asks for it; with it, the server insists on TLS for every TDS session.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verifying connectivity”?",
      "options": [
        "Local administration stays fast and unaffected by network changes",
        "Test from the tier that actually connects — the application server, not the database host:",
        "Whatever you choose, record it: protocol state, port, certificate thumbprint, and the reason."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Test from the tier that actually connects — the application server, not the database host:”"
    },
    {
      "question": "Which fact is covered in the lesson section “A production baseline”?",
      "options": [
        "Opinionated defaults that hold up under audit and under load:",
        "A remote session showing local_net_transport = TCP and a port confirms the whole chain: protocol enabled, listening socket open, firewall allowing the source, client using the…",
        "Whatever you choose, record it: protocol state, port, certificate thumbprint, and the reason."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Opinionated defaults that hold up under audit and under load:”"
    },
    {
      "question": "Complete the lesson statement: “Changing a protocol requires a _____ for that instance.”",
      "options": [
        "Required for any remote workload",
        "Ignore — it should not exist on your server",
        "restart of the Database Engine service"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Changing a protocol requires a restart of the Database Engine service for that instance. There is no hot reload — which is why protocol work belongs in a change window, not in an ad-hoc afternoon session.”"
    },
    {
      "question": "In the “The protocols” table, what is listed for “Shared Memory” under “Verdict”?",
      "options": [
        "Removes an unnecessary remote path; re-enable only for a named application need",
        "Keep enabled for local administration",
        "Local administration stays fast and unaffected by network changes"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Shared Memory” as “Keep enabled for local administration”."
    },
    {
      "question": "Which fact is covered in the lesson section “Server side versus client side”?",
      "options": [
        "Client-side aliases are useful when connection strings cannot change: an alias maps a friendly name to host, port, and protocol, so a server migration becomes a one-line change on…",
        "TCP/IP enabled, port 1433 reachable",
        "Browser running, dynamic/static port reachable"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Client-side aliases are useful when connection strings cannot change: an alias maps a friendly name to host, port, and protocol, so a server migration becomes a one-line change on each application host instead of a code release. Keep the alias list documented — it is configuration that lives outside the database.”"
    },
    {
      "question": "Complete the lesson statement: “Two settings trip up every team once: clients need TrustServerCertificate=True (or the CA chain installed) when a self-signed certificate is used, and Encrypt=True in the connection string only _____ encryption — it does not force the server to provide it.”",
      "options": [
        "Local connections on shared memory bypass sockets entirely, which is why testing only from the server itself proves nothing about remote connectivity.",
        "TCP/IP enabled, port 1433 reachable",
        "requests"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Two settings trip up every team once: clients need TrustServerCertificate=True (or the CA chain installed) when a self-signed certificate is used, and Encrypt=True in the connection string only requests encryption — it does not force the server to provide it.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Where the settings live”?",
      "options": [
        "A remote session showing local_net_transport = TCP and a port confirms the whole chain: protocol enabled, listening socket open, firewall allowing the source, client using the…",
        "Opinionated defaults that hold up under audit and under load:",
        "Two separate consoles control SQL Server networking, and confusing them is the most common first mistake:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Two separate consoles control SQL Server networking, and confusing them is the most common first mistake:”"
    },
    {
      "question": "Complete the lesson statement: “The important production point: _____ — the engine answers on shared memory for local sessions and on nothing for remote ones.”",
      "options": [
        "Client protocol order, aliases ( serveralias → host:port), default network library",
        "if TCP/IP is disabled, the server can be perfectly healthy and completely unreachable",
        "Enable/disable shared memory, named pipes, TCP/IP; TCP port properties; certificate and Force Encryption"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Local clients negotiate from the client protocol order; remote clients have only TCP/IP as a practical option. The important production point: if TCP/IP is disabled, the server can be perfectly healthy and completely unreachable — the engine answers on shared memory for local sessions and on nothing for remote ones.”"
    },
    {
      "question": "Complete the lesson statement: “A connection only succeeds when _____ ends agree.”",
      "options": [
        "both",
        "Client protocol order, aliases ( serveralias → host:port), default network library",
        "Which ports are reachable from which addresses — covered separately"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A connection only succeeds when both ends agree. The server must have a protocol enabled and listening; the client must be configured to use it.”"
    },
    {
      "question": "Complete the lesson statement: “Encryption is configured on the server's TCP/IP properties, in the _____ tab.”",
      "options": [
        "Which ports are reachable from which addresses — covered separately",
        "Keep enabled for local administration",
        "Certificate"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Encryption is configured on the server's TCP/IP properties, in the Certificate tab. Without Force Encryption, a connection is encrypted only if the client asks for it; with it, the server insists on TLS for every TDS session.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verifying connectivity”?",
      "options": [
        "Local administration stays fast and unaffected by network changes",
        "Test from the tier that actually connects — the application server, not the database host:",
        "Whatever you choose, record it: protocol state, port, certificate thumbprint, and the reason."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Test from the tier that actually connects — the application server, not the database host:”"
    },
    {
      "question": "Which fact is covered in the lesson section “A production baseline”?",
      "options": [
        "Opinionated defaults that hold up under audit and under load:",
        "A remote session showing local_net_transport = TCP and a port confirms the whole chain: protocol enabled, listening socket open, firewall allowing the source, client using the…",
        "Whatever you choose, record it: protocol state, port, certificate thumbprint, and the reason."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Opinionated defaults that hold up under audit and under load:”"
    },
    {
      "question": "Complete the lesson statement: “Changing a protocol requires a _____ for that instance.”",
      "options": [
        "Required for any remote workload",
        "Ignore — it should not exist on your server",
        "restart of the Database Engine service"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Changing a protocol requires a restart of the Database Engine service for that instance. There is no hot reload — which is why protocol work belongs in a change window, not in an ad-hoc afternoon session.”"
    },
    {
      "question": "In the “The protocols” table, what is listed for “Shared Memory” under “Verdict”?",
      "options": [
        "Removes an unnecessary remote path; re-enable only for a named application need",
        "Keep enabled for local administration",
        "Local administration stays fast and unaffected by network changes"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Shared Memory” as “Keep enabled for local administration”."
    },
    {
      "question": "Which fact is covered in the lesson section “Server side versus client side”?",
      "options": [
        "Client-side aliases are useful when connection strings cannot change: an alias maps a friendly name to host, port, and protocol, so a server migration becomes a one-line change on…",
        "TCP/IP enabled, port 1433 reachable",
        "Browser running, dynamic/static port reachable"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Client-side aliases are useful when connection strings cannot change: an alias maps a friendly name to host, port, and protocol, so a server migration becomes a one-line change on each application host instead of a code release. Keep the alias list documented — it is configuration that lives outside the database.”"
    },
    {
      "question": "Complete the lesson statement: “Two settings trip up every team once: clients need TrustServerCertificate=True (or the CA chain installed) when a self-signed certificate is used, and Encrypt=True in the connection string only _____ encryption — it does not force the server to provide it.”",
      "options": [
        "Local connections on shared memory bypass sockets entirely, which is why testing only from the server itself proves nothing about remote connectivity.",
        "TCP/IP enabled, port 1433 reachable",
        "requests"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Two settings trip up every team once: clients need TrustServerCertificate=True (or the CA chain installed) when a self-signed certificate is used, and Encrypt=True in the connection string only requests encryption — it does not force the server to provide it.”"
    }
  ],
  takeaways: [
    "Server-side protocol settings live in SQL Server Network Configuration; client-side order and aliases live in SQL Native Client Configuration",
    "Shared memory for local administration, TCP/IP for everything remote — named pipes only when something specifically needs it",
    "Protocol changes require a service restart; there is no hot reload",
    "Force Encryption plus a certificate protects data in transit — and certificates expire, so monitor NotAfter",
    "Verify from the application tier: Test-NetConnection for reachability, sys.dm_exec_connections for transport and encryption"
  ]
};
