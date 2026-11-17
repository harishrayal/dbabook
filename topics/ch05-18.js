/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch05-18.html */

window.TOPIC = {
  id: "ch05-18",
  title: "SQL Server Ports",

  lead: "Every SQL Server feature that crosses a network needs a port, and the DBA who maintains an accurate port map is the one who gets firewall changes approved in minutes instead of losing days to them.",

  objectives: [
    "List the ports SQL Server uses by default",
    "Map ports to instances, features, and availability endpoints",
    "Discover the ports an instance is really listening on",
    "Explain why dynamic ports complicate production operations",
    "Maintain a port register for the estate"
  ],

  sections: [
    {
      h: "The default port map",
      html: `
<p>Learn this table; it covers almost every firewall request you will ever make for a Database Engine server:</p>
<table>
  <tr><th>Port</th><th>Protocol</th><th>Used by</th><th>Purpose</th></tr>
  <tr><td><strong>1433</strong></td><td>TCP</td><td>Default instance</td><td>Standard client connections (TDS) — the agreed convention when no port is given</td></tr>
  <tr><td><strong>1434</strong></td><td><strong>UDP</strong></td><td>SQL Server Browser</td><td>SSRP: “which port is this instance on?” — needed only for named instances without explicit ports</td></tr>
  <tr><td><strong>5022</strong></td><td>TCP</td><td>Mirroring / availability group endpoint</td><td>Replica-to-replica data movement and the endpoint login handshake</td></tr>
  <tr><td><strong>4022</strong></td><td>TCP</td><td>Service Broker</td><td>Broker conversations between instances (only if you use Service Broker)</td></tr>
  <tr><td><strong>135</strong></td><td>TCP</td><td>MS DTC / RPC</td><td>Distributed transactions spanning multiple servers</td></tr>
  <tr><td><strong>445</strong></td><td>TCP</td><td>SMB</td><td>Backups to and restores from UNC shares</td></tr>
  <tr><td>2383 / 80</td><td>TCP</td><td>SSAS, SSRS (if installed)</td><td>Analysis Services and Reporting Services have their own ports — relevant only when those features exist</td></tr>
</table>
<p>Two rules that prevent half of all port disputes: <strong>nothing about loopback needs a firewall rule</strong>, and <strong>5022 is required only between replicas — never from clients</strong>.</p>
`
    },
    {
      h: "How ports map to instances",
      html: `
<p>One host, several listeners, each with a different reason to exist. The diagram below is the shape of a real production server:</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Port mapping for a SQL Server host">
    <defs>
      <marker id="port-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="20" y="35" width="430" height="265" rx="14" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="235" y="62" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">Host sql-node-02</text>

    <rect x="40" y="80" width="390" height="58" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="56" y="105" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Default instance · MSSQLSERVER</text>
    <text x="56" y="127" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">static port, no Browser lookup</text>
    <text x="414" y="114" text-anchor="end" fill="var(--accent-strong)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">TCP 1433</text>

    <rect x="40" y="152" width="390" height="58" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="56" y="177" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Named instance · REPORTS</text>
    <text x="56" y="199" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">fixed in the port register</text>
    <text x="414" y="186" text-anchor="end" fill="var(--accent-strong)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">TCP 51543</text>

    <rect x="40" y="224" width="390" height="58" rx="9" fill="var(--surface)" stroke="var(--amber)" stroke-width="1.4"/>
    <text x="56" y="249" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">SQL Server Browser</text>
    <text x="56" y="271" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">one per host, instance lookup only</text>
    <text x="414" y="258" text-anchor="end" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">UDP 1434</text>

    <rect x="510" y="80" width="230" height="58" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="625" y="105" text-anchor="middle" fill="var(--accent-strong)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">AG endpoint (replica A ↔ B)</text>
    <text x="625" y="127" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">TCP 5022</text>
    <line x1="430" y1="109" x2="508" y2="109" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#port-arrow)"/>

    <rect x="510" y="175" width="230" height="70" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="625" y="200" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Who needs the rule</text>
    <text x="625" y="222" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">1433 / 51543 → app subnets</text>
    <text x="625" y="240" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">5022 → the other node only</text>

    <text x="380" y="330" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">A port is a contract between the instance, the firewall rule, and whoever is allowed to reach it.</text>
  </svg>
  <div class="figcaption">Figure 1 — Port mapping on one host: instance ports for clients, 5022 for replicas, 1434 for resolution.</div>
</div>
`
    },
    {
      h: "Discovering what is really in use",
      html: `
<p>Never document a port from memory — read it from the running system. Three vantage points, all worth knowing:</p>
<pre><code class="language-powershell"># Sockets owned by the Database Engine process
$sqlPid = (Get-Process sqlservr).Id
Get-NetTCPConnection -State Listen |
  Where-Object { $_.OwningProcess -eq $sqlPid } |
  Select-Object LocalAddress, LocalPort

# Browser listeners: UDP 1434
Get-NetUDPEndpoint | Where-Object { $_.LocalPort -eq 1434 }</code></pre>
<pre><code class="language-sql">-- Endpoints defined inside SQL Server (AG, mirroring, Service Broker)
SELECT name, type_desc, state_desc, port, ip_address
FROM   sys.tcp_endpoints;

-- The port this session arrived on
SELECT local_net_transport, local_tcp_port
FROM   sys.dm_exec_connections
WHERE  session_id = @@SPID;</code></pre>
<p>Windows shows the truth about sockets, SQL Server shows the truth about endpoints, and the session view shows what a real client actually used. When they disagree, believe <code>netstat</code> — and then find out why the configuration has not been applied.</p>
`
    },
    {
      h: "Dynamic ports in production",
      html: `
<p>A dynamic port is chosen at every service start and advertised through the Browser. It is convenient at install time and expensive afterwards:</p>
<table>
  <tr><th>Operational question</th><th>Dynamic port</th><th>Static port</th></tr>
  <tr><td>What do I put in the firewall rule?</td><td>Whatever the Browser says today</td><td>A permanent number</td></tr>
  <tr><td>What goes in the connection string?</td><td><code>host\\instance</code> plus a Browser dependency</td><td><code>host,port</code>, or the instance name without one</td></tr>
  <tr><td>What does monitoring probe?</td><td>The port changes after a restart</td><td>The same endpoint forever</td></tr>
  <tr><td>What happens when the Browser is down?</td><td>The instance disappears</td><td>Nothing — the port is known</td></tr>
</table>
<p>Production policy: <strong>static ports for every instance, Browser only where legacy connection strings demand it</strong>, and one port register that records instance, host, port, and the firewall rule that permits it. Dynamic ports belong in development, where a restart is not an incident.</p>
`
    },
    {
      h: "Feature endpoints and their reach",
      html: `
<p>Ports differ not only in number but in <em>who</em> may reach them. This is how “allow everything” rules get written, and how to avoid them:</p>
<table>
  <tr><th>Traffic</th><th>Port</th><th>Allowed sources</th><th>Notes</th></tr>
  <tr><td>Client queries</td><td>1433 / instance port</td><td>Application subnets</td><td>The rule every install needs</td></tr>
  <tr><td>Instance lookup</td><td>1434/UDP</td><td>Application subnets, only if the Browser is used</td><td>Optional — disable the Browser instead where you can</td></tr>
  <tr><td>AG / mirroring replication</td><td>5022</td><td><strong>The other replica nodes only</strong></td><td>Both directions, node to node — never “any”</td></tr>
  <tr><td>Service Broker</td><td>4022</td><td>Partner instances</td><td>Only when Broker is in use</td></tr>
  <tr><td>Distributed transactions</td><td>135 (RPC) plus dynamic</td><td>DTC participants</td><td>Often the hardest rule to scope correctly</td></tr>
  <tr><td>Backups to a share</td><td>445 (SMB)</td><td>SQL host → file server</td><td>Inbound on the file server, outbound from SQL</td></tr>
</table>
<p>Read that table with an auditor's eye: not one rule needs “any protocol from any address”. Least privilege applies to ports exactly as it applies to logins.</p>
`
    },
    {
      h: "Keeping the register honest",
      html: `
<p>A port register is only useful if the same process that changes ports updates it:</p>
<ul>
  <li><strong>One row per listener</strong> — host, instance, port, protocol, feature, owning firewall rule, allowed sources, date changed</li>
  <li><strong>Generated, not typed</strong> — script the collection (<code>Get-NetTCPConnection</code> plus <code>sys.tcp_endpoints</code>) and diff it against the register monthly</li>
  <li><strong>Firewall requests come from the register</strong> — every request carries port, protocol, source range, and business owner</li>
  <li><strong>Decommission rows too</strong> — a stale allow rule is an open door nobody remembers</li>
</ul>
<p>On a new build, the port is assigned at build time and lands in the register before the first client connects. Retrofitting a port map onto an inherited estate is a project; keeping one current is a habit.</p>
`
    }
  ],

  scenario: {
    title: "02:15 — the availability group stopped syncing after a firewall migration",
    html: `
<p>At 02:15 the second replica of a four-database availability group dropped to <em>NOT SYNCHRONIZING</em>. The databases stayed readable on the primary, replication was not moving, and the failover review call was booked for the morning. The network team had migrated firewall rules the previous weekend — the SQL rules had been recreated “equivalently”.</p>
<p>The DBA checked the endpoint rather than the instance: <code>sys.tcp_endpoints</code> showed the AG endpoint on <strong>5022</strong>, but <code>Test-NetConnection</code> from node A to node B on port 5022 returned <code>TcpTestSucceeded: False</code> while port 1433 connected perfectly. The migration had recreated the client rule (1433 from the application subnets) and forgotten the <strong>node-to-node rule on 5022</strong> — traffic between the replicas had never been allowed. Fix: open TCP 5022 between the two node addresses in both directions, confirm with <code>Test-NetConnection</code>, watch the endpoint reconnect and the databases return to <em>SYNCHRONIZED</em>. Prevention: the availability-group runbook now carries its own firewall row — 5022, node to node only — and the port register lists every AG endpoint beside its replica peers, so “which ports does this AG need” is answered before a migration rather than after it.</p>
`
  },

  interview: [
    {
      q: "Which ports does a default instance need for ordinary client access?",
      a: "TCP 1433 inbound from the application subnets — that is the entire requirement for a default instance with no special features. UDP 1434 is needed only if clients resolve named instances through the Browser, and 5022 only if the instance participates in mirroring or an availability group."
    },
    {
      q: "What is port 5022 used for, and who should be allowed to reach it?",
      a: "It is the database mirroring / availability group endpoint used for replica-to-replica data movement and the endpoint login handshake. Only the other replica nodes need it, in both directions — clients never connect to it, so the rule is scoped to the node addresses and nothing wider."
    },
    {
      q: "How do you find the port an instance is listening on?",
      a: "Three ways: the IP Address tabs in SQL Server Configuration Manager show the configured port; Get-NetTCPConnection or netstat filtered to the sqlservr process shows the live socket; and sys.tcp_endpoints shows endpoints defined inside SQL Server, including the AG endpoint's port. For an active session, sys.dm_exec_connections.local_tcp_port shows exactly which port the client arrived on."
    }
  ],

  quiz: [
    {
      "question": "Which fact is covered in the lesson section “The default port map”?",
      "options": [
        "Learn this table; it covers almost every firewall request you will ever make for a Database Engine server:",
        "On a new build, the port is assigned at build time and lands in the register before the first client connects.",
        "nothing about loopback needs a firewall rule"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Learn this table; it covers almost every firewall request you will ever make for a Database Engine server:”"
    },
    {
      "question": "Which fact is covered in the lesson section “How ports map to instances”?",
      "options": [
        "The rule every install needs",
        "Optional — disable the Browser instead where you can",
        "One host, several listeners, each with a different reason to exist."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “One host, several listeners, each with a different reason to exist. The diagram below is the shape of a real production server:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Discovering what is really in use”?",
      "options": [
        "Only when Broker is in use",
        "Never document a port from memory — read it from the running system.",
        "Both directions, node to node — never “any”"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Never document a port from memory — read it from the running system. Three vantage points, all worth knowing:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Dynamic ports in production”?",
      "options": [
        "A dynamic port is chosen at every service start and advertised through the Browser.",
        "On a new build, the port is assigned at build time and lands in the register before the first client connects.",
        "static ports for every instance, Browser only where legacy connection strings demand it"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A dynamic port is chosen at every service start and advertised through the Browser. It is convenient at install time and expensive afterwards:”"
    },
    {
      "question": "Complete the lesson statement: “Ports differ not only in number but in _____ may reach them.”",
      "options": [
        "Analysis Services and Reporting Services have their own ports — relevant only when those features exist",
        "One host, several listeners, each with a different reason to exist.",
        "who"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Ports differ not only in number but in who may reach them. This is how “allow everything” rules get written, and how to avoid them:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Keeping the register honest”?",
      "options": [
        "Often the hardest rule to scope correctly",
        "A port register is only useful if the same process that changes ports updates it:",
        "Only when Broker is in use"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A port register is only useful if the same process that changes ports updates it:”"
    },
    {
      "question": "Complete the lesson statement: “Two rules that prevent half of all port disputes: _____, and 5022 is required only between replicas — never from clients.”",
      "options": [
        "nothing about loopback needs a firewall rule",
        "Never document a port from memory — read it from the running system.",
        "Windows shows the truth about sockets, SQL Server shows the truth about endpoints, and the session view shows what a real client actually used."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Two rules that prevent half of all port disputes: nothing about loopback needs a firewall rule, and 5022 is required only between replicas — never from clients.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Discovering what is really in use”?",
      "options": [
        "On a new build, the port is assigned at build time and lands in the register before the first client connects.",
        "Never document a port from memory — read it from the running system.",
        "Windows shows the truth about sockets, SQL Server shows the truth about endpoints, and the session view shows what a real client actually used."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Windows shows the truth about sockets, SQL Server shows the truth about endpoints, and the session view shows what a real client actually used. When they disagree, believe netstat — and then find out why the configuration has not been applied.”"
    },
    {
      "question": "Complete the lesson statement: “Production policy: _____, and one port register that records instance, host, port, and the firewall rule that permits it.”",
      "options": [
        "A permanent number",
        "static ports for every instance, Browser only where legacy connection strings demand it",
        "A dynamic port is chosen at every service start and advertised through the Browser."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Production policy: static ports for every instance, Browser only where legacy connection strings demand it, and one port register that records instance, host, port, and the firewall rule that permits it. Dynamic ports belong in development, where a restart is not an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Feature endpoints and their reach”?",
      "options": [
        "Read that table with an auditor's eye: not one rule needs “any protocol from any address”.",
        "1433",
        "1434"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Read that table with an auditor's eye: not one rule needs “any protocol from any address”. Least privilege applies to ports exactly as it applies to logins.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “The default port map”?",
      "options": [
        "Learn this table; it covers almost every firewall request you will ever make for a Database Engine server:",
        "On a new build, the port is assigned at build time and lands in the register before the first client connects.",
        "nothing about loopback needs a firewall rule"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Learn this table; it covers almost every firewall request you will ever make for a Database Engine server:”"
    },
    {
      "question": "Which fact is covered in the lesson section “How ports map to instances”?",
      "options": [
        "The rule every install needs",
        "Optional — disable the Browser instead where you can",
        "One host, several listeners, each with a different reason to exist."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “One host, several listeners, each with a different reason to exist. The diagram below is the shape of a real production server:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Discovering what is really in use”?",
      "options": [
        "Only when Broker is in use",
        "Never document a port from memory — read it from the running system.",
        "Both directions, node to node — never “any”"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Never document a port from memory — read it from the running system. Three vantage points, all worth knowing:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Dynamic ports in production”?",
      "options": [
        "A dynamic port is chosen at every service start and advertised through the Browser.",
        "On a new build, the port is assigned at build time and lands in the register before the first client connects.",
        "static ports for every instance, Browser only where legacy connection strings demand it"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A dynamic port is chosen at every service start and advertised through the Browser. It is convenient at install time and expensive afterwards:”"
    },
    {
      "question": "Complete the lesson statement: “Ports differ not only in number but in _____ may reach them.”",
      "options": [
        "Analysis Services and Reporting Services have their own ports — relevant only when those features exist",
        "One host, several listeners, each with a different reason to exist.",
        "who"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Ports differ not only in number but in who may reach them. This is how “allow everything” rules get written, and how to avoid them:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Keeping the register honest”?",
      "options": [
        "Often the hardest rule to scope correctly",
        "A port register is only useful if the same process that changes ports updates it:",
        "Only when Broker is in use"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A port register is only useful if the same process that changes ports updates it:”"
    },
    {
      "question": "Complete the lesson statement: “Two rules that prevent half of all port disputes: _____, and 5022 is required only between replicas — never from clients.”",
      "options": [
        "nothing about loopback needs a firewall rule",
        "Never document a port from memory — read it from the running system.",
        "Windows shows the truth about sockets, SQL Server shows the truth about endpoints, and the session view shows what a real client actually used."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Two rules that prevent half of all port disputes: nothing about loopback needs a firewall rule, and 5022 is required only between replicas — never from clients.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Discovering what is really in use”?",
      "options": [
        "On a new build, the port is assigned at build time and lands in the register before the first client connects.",
        "Never document a port from memory — read it from the running system.",
        "Windows shows the truth about sockets, SQL Server shows the truth about endpoints, and the session view shows what a real client actually used."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Windows shows the truth about sockets, SQL Server shows the truth about endpoints, and the session view shows what a real client actually used. When they disagree, believe netstat — and then find out why the configuration has not been applied.”"
    },
    {
      "question": "Complete the lesson statement: “Production policy: _____, and one port register that records instance, host, port, and the firewall rule that permits it.”",
      "options": [
        "A permanent number",
        "static ports for every instance, Browser only where legacy connection strings demand it",
        "A dynamic port is chosen at every service start and advertised through the Browser."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Production policy: static ports for every instance, Browser only where legacy connection strings demand it, and one port register that records instance, host, port, and the firewall rule that permits it. Dynamic ports belong in development, where a restart is not an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Feature endpoints and their reach”?",
      "options": [
        "Read that table with an auditor's eye: not one rule needs “any protocol from any address”.",
        "1433",
        "1434"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Read that table with an auditor's eye: not one rule needs “any protocol from any address”. Least privilege applies to ports exactly as it applies to logins.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “The default port map”?",
      "options": [
        "Learn this table; it covers almost every firewall request you will ever make for a Database Engine server:",
        "On a new build, the port is assigned at build time and lands in the register before the first client connects.",
        "nothing about loopback needs a firewall rule"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Learn this table; it covers almost every firewall request you will ever make for a Database Engine server:”"
    },
    {
      "question": "Which fact is covered in the lesson section “How ports map to instances”?",
      "options": [
        "The rule every install needs",
        "Optional — disable the Browser instead where you can",
        "One host, several listeners, each with a different reason to exist."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “One host, several listeners, each with a different reason to exist. The diagram below is the shape of a real production server:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Discovering what is really in use”?",
      "options": [
        "Only when Broker is in use",
        "Never document a port from memory — read it from the running system.",
        "Both directions, node to node — never “any”"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Never document a port from memory — read it from the running system. Three vantage points, all worth knowing:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Dynamic ports in production”?",
      "options": [
        "A dynamic port is chosen at every service start and advertised through the Browser.",
        "On a new build, the port is assigned at build time and lands in the register before the first client connects.",
        "static ports for every instance, Browser only where legacy connection strings demand it"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A dynamic port is chosen at every service start and advertised through the Browser. It is convenient at install time and expensive afterwards:”"
    },
    {
      "question": "Complete the lesson statement: “Ports differ not only in number but in _____ may reach them.”",
      "options": [
        "Analysis Services and Reporting Services have their own ports — relevant only when those features exist",
        "One host, several listeners, each with a different reason to exist.",
        "who"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Ports differ not only in number but in who may reach them. This is how “allow everything” rules get written, and how to avoid them:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Keeping the register honest”?",
      "options": [
        "Often the hardest rule to scope correctly",
        "A port register is only useful if the same process that changes ports updates it:",
        "Only when Broker is in use"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A port register is only useful if the same process that changes ports updates it:”"
    },
    {
      "question": "Complete the lesson statement: “Two rules that prevent half of all port disputes: _____, and 5022 is required only between replicas — never from clients.”",
      "options": [
        "nothing about loopback needs a firewall rule",
        "Never document a port from memory — read it from the running system.",
        "Windows shows the truth about sockets, SQL Server shows the truth about endpoints, and the session view shows what a real client actually used."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Two rules that prevent half of all port disputes: nothing about loopback needs a firewall rule, and 5022 is required only between replicas — never from clients.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Discovering what is really in use”?",
      "options": [
        "On a new build, the port is assigned at build time and lands in the register before the first client connects.",
        "Never document a port from memory — read it from the running system.",
        "Windows shows the truth about sockets, SQL Server shows the truth about endpoints, and the session view shows what a real client actually used."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Windows shows the truth about sockets, SQL Server shows the truth about endpoints, and the session view shows what a real client actually used. When they disagree, believe netstat — and then find out why the configuration has not been applied.”"
    },
    {
      "question": "Complete the lesson statement: “Production policy: _____, and one port register that records instance, host, port, and the firewall rule that permits it.”",
      "options": [
        "A permanent number",
        "static ports for every instance, Browser only where legacy connection strings demand it",
        "A dynamic port is chosen at every service start and advertised through the Browser."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Production policy: static ports for every instance, Browser only where legacy connection strings demand it, and one port register that records instance, host, port, and the firewall rule that permits it. Dynamic ports belong in development, where a restart is not an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Feature endpoints and their reach”?",
      "options": [
        "Read that table with an auditor's eye: not one rule needs “any protocol from any address”.",
        "1433",
        "1434"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Read that table with an auditor's eye: not one rule needs “any protocol from any address”. Least privilege applies to ports exactly as it applies to logins.”"
    }
  ],
  takeaways: [
    "1433 TCP for default-instance clients, 1434 UDP for Browser lookups, 5022 TCP between AG or mirroring replicas",
    "4022 (Service Broker), 135 (DTC), and 445 (SMB backups) apply only when those features are used",
    "Static ports in production keep firewall rules, connection strings, and monitoring probes stable",
    "Scope every rule by source — clients get the instance port, replicas get 5022, nobody gets “any”",
    "Maintain a generated port register and drive every firewall request from it"
  ]
};
