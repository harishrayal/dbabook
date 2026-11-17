/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch05-19.html */

window.TOPIC = {
  id: "ch05-19",
  title: "Firewall Configuration",

  lead: "A perfectly installed SQL Server behind a firewall with the wrong rule is just an expensive offline service — firewall work belongs to the installation, not to the incident that follows it.",

  objectives: [
    "Explain why SQL Server needs inbound firewall rules",
    "Describe the anatomy of a well-scoped firewall rule",
    "Create and verify rules with PowerShell",
    "Test connectivity from the tier that actually connects",
    "Manage rules centrally and keep them documented"
  ],

  sections: [
    {
      h: "Why SQL breaks behind a firewall",
      html: `
<p>Windows Firewall with Advanced Security blocks inbound traffic by default. SQL Server's Database Engine is a <em>listener</em>: every client outside the host must reach a specific TCP port, and the default posture says no. The engine can be running, the port correct, the login valid — and the client still times out.</p>
<p>Three facts shape every rule you will write:</p>
<ul>
  <li><strong>The rule is inbound on the SQL host</strong> — clients reach SQL Server, not the other way round (backups to a share are the main outbound exception)</li>
  <li><strong>Profiles matter</strong> — Domain, Private, and Public are evaluated separately; a rule enabled only on the Public profile does nothing on a domain-joined server</li>
  <li><strong>Scope is the rule</strong> — protocol, port, source addresses, and profile together decide who gets through</li>
</ul>
<p>The failure that generates the most tickets, though, is not “no rule”. It is a rule that exists, is enabled, and allows the wrong sources.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Firewall rule evaluation for SQL Server traffic">
    <defs>
      <marker id="fw-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
      <marker id="fw-block" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--amber)"/>
      </marker>
    </defs>

    <rect x="20" y="45" width="185" height="90" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="112" y="75" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">App servers</text>
    <text x="112" y="97" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">10.20.0.0/16</text>
    <text x="112" y="117" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">connect to host,1433</text>

    <rect x="20" y="215" width="185" height="80" rx="10" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="112" y="243" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Unknown subnet</text>
    <text x="112" y="265" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">10.99.0.0/24</text>
    <text x="112" y="285" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">not in any rule</text>

    <rect x="275" y="45" width="230" height="250" rx="12" fill="var(--surface)" stroke="var(--border)" stroke-width="2"/>
    <text x="390" y="75" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">Windows Firewall</text>

    <rect x="295" y="95" width="190" height="52" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.5"/>
    <text x="390" y="117" text-anchor="middle" fill="var(--accent-strong)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">TCP 1433 · in · allow</text>
    <text x="390" y="137" text-anchor="middle" fill="var(--text)" font-size="11.5" font-family="Segoe UI, sans-serif">scope 10.20.0.0/16</text>

    <rect x="295" y="160" width="190" height="52" rx="8" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="390" y="182" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">UDP 1434 · in · allow</text>
    <text x="390" y="202" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">only if Browser is used</text>

    <rect x="295" y="225" width="190" height="52" rx="8" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.5"/>
    <text x="390" y="247" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">everything else</text>
    <text x="390" y="267" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">default: block inbound</text>

    <rect x="570" y="45" width="175" height="90" rx="10" fill="var(--accent)" />
    <text x="657" y="77" text-anchor="middle" fill="#ffffff" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">SQL Server</text>
    <text x="657" y="100" text-anchor="middle" fill="#dbeafe" font-size="12" font-family="Segoe UI, sans-serif">listening on 1433</text>
    <text x="657" y="120" text-anchor="middle" fill="#dbeafe" font-size="11.5" font-family="Segoe UI, sans-serif">TDS session established</text>

    <line x1="205" y1="90" x2="273" y2="120" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#fw-arrow)"/>
    <line x1="507" y1="120" x2="568" y2="90" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#fw-arrow)"/>
    <line x1="205" y1="255" x2="300" y2="265" stroke="var(--amber)" stroke-width="1.8" stroke-dasharray="6 4" marker-end="url(#fw-block)"/>
    <text x="243" y="243" fill="var(--amber)" font-size="11.5" font-family="Segoe UI, sans-serif">dropped</text>

    <text x="380" y="330" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">The port is open only for the sources you named — everyone else meets the default block.</text>
  </svg>
  <div class="figcaption">Figure 1 — A scoped rule set: allowed sources pass to the listener, unknown sources are dropped by default.</div>
</div>
`
    },
    {
      h: "Anatomy of a good rule",
      html: `
<p>Every property has a defensible production value. Fill this table in your head before you open the console:</p>
<table>
  <tr><th>Property</th><th>Recommended value</th><th>Reason</th></tr>
  <tr><td>Direction</td><td>Inbound</td><td>Clients initiate connections to SQL Server</td></tr>
  <tr><td>Action</td><td>Allow</td><td>Block rules take precedence; allow only what is needed</td></tr>
  <tr><td>Protocol</td><td>TCP (UDP only for 1434)</td><td>TDS runs over TCP; Browser is the exception</td></tr>
  <tr><td>Local port</td><td>The instance's static port (1433 by convention)</td><td>From your port register — never “all”</td></tr>
  <tr><td>Remote address</td><td><strong>Application subnets only</strong></td><td>The single most important scoping decision</td></tr>
  <tr><td>Profile</td><td>Domain (and Private where applicable)</td><td>A domain server should not depend on Public-profile rules</td></tr>
  <tr><td>Program</td><td>Optionally <code>sqlservr.exe</code></td><td>Extra precision, at the cost of a rule that must follow the install path</td></tr>
  <tr><td>Name</td><td>Descriptive, e.g. <code>SQL Server - TCP 1433 - app subnet</code></td><td>Rules are read by humans during incidents and audits</td></tr>
</table>
`
    },
    {
      h: "Creating rules with PowerShell",
      html: `
<p>Scripted rules are reviewable, repeatable, and diffable — the properties belong in a splat so the change request and the change itself are the same document:</p>
<pre><code class="language-powershell">$rule = @{
  DisplayName     = 'SQL Server - TCP 1433 - app subnet'
  Direction       = 'Inbound'
  Action          = 'Allow'
  Protocol        = 'TCP'
  LocalPort       = 1433
  RemoteAddress   = '10.20.0.0/16'
  Profile         = 'Domain','Private'
  Enabled         = 'True'
  Description     = 'Client connections to the default instance'
}
New-NetFirewallRule @rule

# Availability group: replica to replica only
$agRule = @{
  DisplayName   = 'SQL AG - TCP 5022 - node to node'
  Direction     = 'Inbound'
  Action        = 'Allow'
  Protocol      = 'TCP'
  LocalPort     = 5022
  RemoteAddress = '10.20.10.11','10.20.10.12'
  Profile       = 'Domain'
}
New-NetFirewallRule @agRule</code></pre>
<p>Second block — verify what is actually in force, including the scope, which is where most rules are wrong:</p>
<pre><code class="language-powershell">Get-NetFirewallRule -DisplayName 'SQL Server*' |
  Select-Object DisplayName, Enabled, Profile, Action |
  Format-Table -AutoSize

Get-NetFirewallRule -DisplayName 'SQL Server - TCP 1433 - app subnet' |
  Get-NetFirewallAddressFilter |
  Select-Object RemoteAddress</code></pre>
<p>Note the second query: an <em>enabled, allowed</em> rule with <code>RemoteAddress = Any</code> is a finding, not a success.</p>
`
    },
    {
      h: "Testing the right way",
      html: `
<p>Connectivity is proved from the client tier. A test from the database host itself never crosses the firewall and proves nothing at all.</p>
<pre><code class="language-powershell"># From an application server (or a host inside the app subnet)
Test-NetConnection -ComputerName sql-node-02 -Port 1433 |
  Select-Object RemoteAddress, RemotePort, PingSucceeded, TcpTestSucceeded</code></pre>
<table>
  <tr><th>Result</th><th>Meaning</th><th>Next step</th></tr>
  <tr><td><code>TcpTestSucceeded: True</code></td><td>Listener reachable and rule allows this source</td><td>If logins still fail, it is SQL Server, not the network</td></tr>
  <tr><td>Ping works, TCP fails</td><td>Port not allowed for this source, or nothing listening</td><td>Check the rule scope, then <code>Get-NetTCPConnection</code> on the host</td></tr>
  <tr><td>Everything fails</td><td>Routing, host down, or rule missing entirely</td><td>Work outwards: route → host → rule → port</td></tr>
</table>
<p>“It works from my workstation” is not evidence: your workstation is often in a management subnet that has its own allow rule. Test from a host that shares the application's network path.</p>
`
    },
    {
      h: "Managing rules at scale",
      html: `
<ul>
  <li><strong>Central policy first</strong> — domain-joined SQL hosts should receive their rules from Group Policy or infrastructure-as-code, not from a console session someone ran once</li>
  <li><strong>Rules live with the build</strong> — the installation checklist includes the exact rule objects; a server built without them is incomplete</li>
  <li><strong>Name and describe everything</strong> — during an incident nobody can audit a rule named “New Rule (12)”</li>
  <li><strong>Review periodically</strong> — enumerate SQL rules, compare against the port register, and remove what no longer matches an active instance</li>
  <li><strong>Remember the outer layers</strong> — cloud network security groups, hardware firewalls, and load balancers apply the same logic in different tools; a host rule that is correct can still be blocked one layer out</li>
</ul>
<p>The firewall is configuration like any other: owned, versioned, reviewed, and tested from the client side.</p>
`
    },
    {
      h: "Rule review checklist",
      html: `
<table>
  <tr><th>#</th><th>Question</th><th>Pass condition</th></tr>
  <tr><td>1</td><td>Is there an inbound rule for the instance's static port?</td><td>Yes, enabled, matching the port register</td></tr>
  <tr><td>2</td><td>Is the remote address scoped to known application subnets?</td><td>Never “Any” for client ports</td></tr>
  <tr><td>3</td><td>Does the profile match where the server actually runs?</td><td>Domain profile enabled on domain-joined hosts</td></tr>
  <tr><td>4</td><td>Is UDP 1434 open only when the Browser is genuinely used?</td><td>Otherwise the rule is absent and the service disabled</td></tr>
  <tr><td>5</td><td>Is 5022 scoped to replica node addresses only?</td><td>Both directions, nodes only</td></tr>
  <tr><td>6</td><td>Has it been tested from the application subnet?</td><td><code>TcpTestSucceeded: True</code> from a client, not the host</td></tr>
</table>
<p>Six questions, five minutes, and the most common “SQL Server is down” tickets never get opened.</p>
`
    }
  ],

  scenario: {
    title: "16:40 — “the firewall is fine, I can connect from the jump box”",
    html: `
<p>A new reporting server went live at 16:00. By 16:40 the application team reported connection timeouts from every app server, while the DBA's own test from the management jump box succeeded instantly. Three people had already concluded the firewall was working; two hours were about to be lost to “it must be the connection string”.</p>
<p>The DBA asked the only question that mattered: <strong>where was the test run from?</strong> From an application server, <code>Test-NetConnection sql-node-04 -Port 1433</code> returned <code>TcpTestSucceeded: False</code> with ping succeeding — classic “port not allowed for this source”. The rule itself was enabled and allowed TCP 1433, but its remote scope read <code>10.0.0.0/8</code>, copied from the previous environment; these application servers sat in <code>172.20.0.0/16</code>. The jump box worked because it lives in 10.x. Fix: correct the rule's remote addresses to the current application subnets, re-test from an app server, confirm <code>TcpTestSucceeded: True</code>, and update the firewall row in the build checklist. Prevention: rule scope is now written down <em>before</em> the build, connectivity tests are only accepted from a host inside the client subnet, and “works from my workstation” is explicitly not a test result.</p>
`
  },

  interview: [
    {
      q: "What must a firewall rule specify for SQL Server to be reachable?",
      a: "Direction inbound, action allow, protocol TCP, the instance's local port, the remote addresses that legitimately connect (the application subnets), and the profile the server actually runs in — plus a descriptive name. All of those must be right: an enabled allow rule with the wrong scope behaves exactly like no rule at all."
    },
    {
      q: "How do you prove a firewall rule is the cause of a connection failure?",
      a: "Test TCP from the client's subnet with Test-NetConnection — success or failure there is the ground truth. On the host, confirm a listening socket exists (Get-NetTCPConnection), then inspect the rule's enabled state, action, port filter, and address filter with Get-NetFirewallRule piped into Get-NetFirewallPortFilter and Get-NetFirewallAddressFilter. Local tests prove nothing, because they never cross the firewall."
    },
    {
      q: "Which firewall rules does a two-node availability group need?",
      a: "The normal client rule for the instance port on both nodes, plus TCP 5022 between the two node addresses in both directions for the endpoint — and nothing else for replication. If clients reach instances by name, UDP 1434 from the application subnets as well; 5022 must never be open to client subnets."
    }
  ],

  takeaways: [
    "SQL Server is a listener: inbound rules are required, and the default posture is to block",
    "A rule is direction, action, protocol, port, source scope, and profile — all six must be correct",
    "Scope client rules to application subnets; 5022 goes node to node only",
    "Prove connectivity from the application subnet — a test from the host or jump box proves nothing",
    "Script rules with PowerShell, name them for humans, and review them against the port register"
  ]
};
