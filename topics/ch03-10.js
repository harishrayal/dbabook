/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch03-10.html */

window.TOPIC = {
  id: "ch03-10",
  title: "IP Addresses and Ports",

  lead: "IP Addresses and Ports is a core part of Windows Server and infrastructure for DBAs. This topic explains what it is, how it works inside SQL Server, and what a production DBA must know to operate it safely.",

  objectives: [
    "Define what IP Addresses and Ports is and where it fits",
    "Explain how IP Addresses and Ports works internally",
    "Apply IP Addresses and Ports correctly in a production environment",
    "Recognise the common mistakes and risks involving IP Addresses and Ports",
    "Monitor and troubleshoot IP Addresses and Ports with the right tools"
  ],

  sections: [
    {
      h: "Addresses, subnets, and gateways",
      html: `
<p>An IP address identifies a network interface; its subnet prefix determines which destinations are local and which require a router. A default gateway forwards traffic to other networks. A host can have multiple interfaces and addresses, so record the client-facing SQL address rather than assuming the first address shown by a command is the one in use.</p>
<p>Use the network team's approved static-address, DHCP-reservation, and DNS-registration process. Avoid assigning an address already in use, and verify DNS and routing after an address change.</p>
<pre><code class="language-powershell">Get-NetIPConfiguration
Get-NetIPAddress -AddressFamily IPv4 | Format-Table InterfaceAlias, IPAddress, PrefixLength</code></pre>
<div class="figure"><svg viewBox="0 0 760 160" role="img" aria-label="Troubleshooting evidence flow"><rect x="20" y="40" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--border)"/><text x="100" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Evidence</text><rect x="300" y="40" width="160" height="70" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="380" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Diagnosis</text><rect x="580" y="40" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--border)"/><text x="660" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Resolution</text></svg><div class="figcaption">Figure 1 - Separate evidence, diagnosis, and remediation.</div></div>
`
    },
    {
      h: "SQL Server ports",
      html: `
<p>TCP 1433 is the default port for a default Database Engine instance when TCP/IP is enabled and the port hasn't been changed. Named instances commonly use dynamic ports by default. SQL Server Browser uses UDP 1434 for discovery in supported scenarios; Availability Group endpoints use their configured port (5022 is a common example, not a universal default).</p>
<table>
  <tr><th>Endpoint</th><th>Protocol</th><th>What to verify</th></tr>
  <tr><td>Database Engine client listener</td><td>TCP</td><td>Actual configured port and listening address</td></tr>
  <tr><td>SQL Server Browser discovery</td><td>UDP 1434</td><td>Needed only for clients using Browser discovery</td></tr>
  <tr><td>Availability Group endpoint</td><td>Configured TCP port</td><td>Endpoint URL and replica-to-replica firewall path</td></tr>
</table>
`
    },
    {
      h: "Find and test the listening port",
      html: `
<p>Find the listener port in SQL Server Configuration Manager or the SQL Server error log, then test that exact port from the client network. A port test confirms TCP reachability only; it doesn't validate a SQL login or application protocol.</p>
<pre><code class="language-powershell">Test-NetConnection -ComputerName 'sql01.contoso.com' -Port 51433
Get-NetTCPConnection -State Listen | Sort-Object LocalPort | Format-Table LocalAddress, LocalPort, OwningProcess</code></pre>
<pre><code class="language-sql">SELECT local_net_address, local_tcp_port
FROM sys.dm_exec_connections
WHERE session_id = @@SPID;</code></pre>
<p>The SQL query reports the local endpoint for the current TCP connection; it doesn't inventory every listener or prove remote reachability.</p>
`
    },
    {
      h: "Client connection strings and firewall scope",
      html: `
<p>Use a stable DNS name and, where appropriate, an explicit port in the client configuration. If an instance's port changes, update the firewall rule and clients together, then verify both new and failover paths. A firewall rule should allow only the required protocol, local port, network profile, and authorized remote address ranges.</p>
<p>Don't treat a nonstandard port as a security control: it can reduce accidental scans but doesn't replace authentication, patching, firewall scope, or monitoring.</p>
`
    }
  ],
  scenario: {
    title: 'A named instance moves to a fixed port',
    html: `<p>A named instance is changed from dynamic ports to 51433, but the firewall rule still allows 1433. Remote clients time out. The DBA confirms the listener port in SQL Server Configuration Manager and the error log, updates host and network rules, and updates the application connection string. A client test confirms TCP reachability.</p>`
  },

  interview: [
    { q: "What evidence must be captured first?", a: "Record the host, client, exact timestamp, error, and recent change. Capture the relevant logs and measurements before changing the suspected layer." },
    { q: "How do you avoid changing the wrong layer?", a: "Test one confirmed boundary at a time: naming, routing, listener, firewall, authentication, storage, or application behavior. Compare with a known-good baseline where possible." },
    { q: "What proves a corrective change worked?", a: "Retest the same affected path or workload after the change, preserve before-and-after evidence, and monitor for recurrence under normal load." }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within Windows Server and infrastructure for DBAs.”",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "IP Addresses and Ports"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine IP Addresses and Ports within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where IP Addresses and Ports fits”?",
      "options": [
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "NTFS permissions control who can read or change files.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “NTFS permissions control who can read or change files. The service account needs modify rights on data, log and backup folders. Misconfigured permissions surface as errors 5 (access denied) or failures to create backups and files.”"
    },
    {
      "question": "Which fact is covered in the lesson section “IP Addresses and Ports in practice”?",
      "options": [
        "Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity.",
        "With IP Addresses and Ports, prefer measured, reversible changes.",
        "TCP"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity. The default instance listens on TCP 1433; the Browser service on UDP 1434 resolves named instances; availability groups commonly use 5022.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with IP Addresses and Ports”?",
      "options": [
        "With IP Addresses and Ports, prefer measured, reversible changes.",
        "TCP",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to IP Addresses and Ports. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "IP Addresses and Ports sits inside a larger system.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "IP Addresses and Ports",
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "With IP Addresses and Ports, prefer measured, reversible changes."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “This section consolidates IP Addresses and Ports with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What IP Addresses and Ports means”?",
      "options": [
        "IP Addresses and Ports",
        "IP Addresses and Ports sits inside a larger system.",
        "Windows services are long-running background processes."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Windows services are long-running background processes. The SQL Server service, SQL Server Agent and several auxiliary services run under configured accounts; their start mode, state and dependencies determine whether the database is reachable after a reboot.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where IP Addresses and Ports fits”?",
      "options": [
        "IP Addresses and Ports sits inside a larger system.",
        "The diagram below places IP Addresses and Ports alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "UDP"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The diagram below places IP Addresses and Ports alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “IP Addresses and Ports in practice”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with IP Addresses and Ports:",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating IP Addresses and Ports."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with IP Addresses and Ports:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with IP Addresses and Ports”?",
      "options": [
        "Use the following as a starting point when investigating IP Addresses and Ports.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within Windows Server and infrastructure for DBAs.”",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "IP Addresses and Ports"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine IP Addresses and Ports within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where IP Addresses and Ports fits”?",
      "options": [
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "NTFS permissions control who can read or change files.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “NTFS permissions control who can read or change files. The service account needs modify rights on data, log and backup folders. Misconfigured permissions surface as errors 5 (access denied) or failures to create backups and files.”"
    },
    {
      "question": "Which fact is covered in the lesson section “IP Addresses and Ports in practice”?",
      "options": [
        "Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity.",
        "With IP Addresses and Ports, prefer measured, reversible changes.",
        "TCP"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity. The default instance listens on TCP 1433; the Browser service on UDP 1434 resolves named instances; availability groups commonly use 5022.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with IP Addresses and Ports”?",
      "options": [
        "With IP Addresses and Ports, prefer measured, reversible changes.",
        "TCP",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to IP Addresses and Ports. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "IP Addresses and Ports sits inside a larger system.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "IP Addresses and Ports",
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "With IP Addresses and Ports, prefer measured, reversible changes."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “This section consolidates IP Addresses and Ports with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What IP Addresses and Ports means”?",
      "options": [
        "IP Addresses and Ports",
        "IP Addresses and Ports sits inside a larger system.",
        "Windows services are long-running background processes."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Windows services are long-running background processes. The SQL Server service, SQL Server Agent and several auxiliary services run under configured accounts; their start mode, state and dependencies determine whether the database is reachable after a reboot.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where IP Addresses and Ports fits”?",
      "options": [
        "IP Addresses and Ports sits inside a larger system.",
        "The diagram below places IP Addresses and Ports alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "UDP"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The diagram below places IP Addresses and Ports alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “IP Addresses and Ports in practice”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with IP Addresses and Ports:",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating IP Addresses and Ports."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with IP Addresses and Ports:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with IP Addresses and Ports”?",
      "options": [
        "Use the following as a starting point when investigating IP Addresses and Ports.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within Windows Server and infrastructure for DBAs.”",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "IP Addresses and Ports"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine IP Addresses and Ports within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where IP Addresses and Ports fits”?",
      "options": [
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "NTFS permissions control who can read or change files.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “NTFS permissions control who can read or change files. The service account needs modify rights on data, log and backup folders. Misconfigured permissions surface as errors 5 (access denied) or failures to create backups and files.”"
    },
    {
      "question": "Which fact is covered in the lesson section “IP Addresses and Ports in practice”?",
      "options": [
        "Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity.",
        "With IP Addresses and Ports, prefer measured, reversible changes.",
        "TCP"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity. The default instance listens on TCP 1433; the Browser service on UDP 1434 resolves named instances; availability groups commonly use 5022.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with IP Addresses and Ports”?",
      "options": [
        "With IP Addresses and Ports, prefer measured, reversible changes.",
        "TCP",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to IP Addresses and Ports. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "IP Addresses and Ports sits inside a larger system.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "IP Addresses and Ports",
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "With IP Addresses and Ports, prefer measured, reversible changes."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “This section consolidates IP Addresses and Ports with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What IP Addresses and Ports means”?",
      "options": [
        "IP Addresses and Ports",
        "IP Addresses and Ports sits inside a larger system.",
        "Windows services are long-running background processes."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Windows services are long-running background processes. The SQL Server service, SQL Server Agent and several auxiliary services run under configured accounts; their start mode, state and dependencies determine whether the database is reachable after a reboot.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where IP Addresses and Ports fits”?",
      "options": [
        "IP Addresses and Ports sits inside a larger system.",
        "The diagram below places IP Addresses and Ports alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "UDP"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The diagram below places IP Addresses and Ports alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “IP Addresses and Ports in practice”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with IP Addresses and Ports:",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating IP Addresses and Ports."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with IP Addresses and Ports:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with IP Addresses and Ports”?",
      "options": [
        "Use the following as a starting point when investigating IP Addresses and Ports.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "IP Addresses and Ports is a fundamental concept in Windows Server and infrastructure for DBAs",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of IP Addresses and Ports improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
