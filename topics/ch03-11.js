/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch03-11.html */

window.TOPIC = {
  id: "ch03-11",
  title: "DNS Fundamentals",

  lead: "Understanding DNS Fundamentals is essential for anyone responsible for Windows Server and infrastructure for DBAs. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what DNS Fundamentals is and where it fits",
    "Explain how DNS Fundamentals works internally",
    "Apply DNS Fundamentals correctly in a production environment",
    "Recognise the common mistakes and risks involving DNS Fundamentals",
    "Monitor and troubleshoot DNS Fundamentals with the right tools"
  ],

  sections: [
    {
      h: "How DNS resolution works",
      html: `
<p>The Domain Name System (DNS) maps names to records such as IPv4 <code>A</code>, IPv6 <code>AAAA</code>, and alias <code>CNAME</code> records. DNS lookup returns name information, not the SQL Server port; instance discovery and TCP connection happen separately.</p>
<p>In Active Directory environments, DNS also helps clients locate domain controllers and other directory services. SQL Server clients commonly connect using a stable host name, Availability Group listener name, or approved alias rather than a hard-coded IP address.</p>
<table>
  <tr><th>Record / feature</th><th>Use</th><th>DBA check</th></tr>
  <tr><td>A / AAAA</td><td>Name to IPv4 / IPv6 address</td><td>Confirm the answer matches the intended interface</td></tr>
  <tr><td>CNAME</td><td>Alias to another DNS name</td><td>Check target, TTL, and Kerberos SPN implications</td></tr>
  <tr><td>PTR</td><td>Address to name (reverse lookup)</td><td>Useful for diagnostics; not a substitute for forward lookup</td></tr>
</table>
<div class="figure"><svg viewBox="0 0 760 160" role="img" aria-label="Troubleshooting evidence flow"><rect x="20" y="40" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--border)"/><text x="100" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Evidence</text><rect x="300" y="40" width="160" height="70" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="380" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Diagnosis</text><rect x="580" y="40" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--border)"/><text x="660" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Resolution</text></svg><div class="figcaption">Figure 1 - Separate evidence, diagnosis, and remediation.</div></div>
`
    },
    {
      h: "Resolver caches and records",
      html: `
<p>Clients and DNS servers cache answers according to TTLs. After a planned address change, an old cached answer can persist until its TTL expires; clearing a client cache affects only that client and doesn't repair an incorrect authoritative record.</p>
<pre><code class="language-powershell">Resolve-DnsName -Name 'sql01.contoso.com' -Type A
Resolve-DnsName -Name 'ag-listener.contoso.com'
Get-DnsClientServerAddress -AddressFamily IPv4
ipconfig /displaydns</code></pre>
<p>Use <code>ipconfig /flushdns</code> only when a stale local cache is the issue. Verify the record on the authoritative DNS service and from multiple relevant client networks before changing records.</p>
`
    },
    {
      h: "DNS and SQL Server authentication",
      html: `
<p>DNS helps clients find the server; it doesn't configure SQL Server's listener, firewall, or login permissions. If Windows clients use Kerberos, the SQL Server service needs the correct SPN for the name and port clients use. Aliases, load-balanced names, and Availability Group listeners should be reviewed for SPN registration and delegation requirements.</p>
<p>Prefer the fully qualified name used by the application when testing. Connecting by IP address can change the authentication behavior and won't validate the production DNS path.</p>
`
    },
    {
      h: "Diagnose name-resolution failures",
      html: `
<ol>
  <li>Resolve the exact application server name from the affected client.</li>
  <li>Compare the result with the intended A/AAAA/CNAME record and current address.</li>
  <li>Test the SQL listener port using the resolved name and, if useful, the expected IP.</li>
  <li>If the IP test works but the name-based test does not, inspect DNS, caches, aliases, and SPNs.</li>
  <li>After any record change, verify TTL and results from the application subnet before declaring recovery.</li>
</ol>
<p>Don't use a hosts-file edit as a permanent repair: it bypasses central DNS and can leave clients with inconsistent mappings.</p>
`
    }
  ],
  scenario: {
    title: 'DNS points to the wrong address',
    html: `<p>Users connect only by IP address because DNS resolves the server name to an old address. The DBA verifies and corrects the authoritative DNS record, accounts for cache/TTL policy, and retests name and IP resolution from the affected clients.</p>`
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
        "Next, verify the result and capture a baseline.",
        "DNS Fundamentals",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine DNS Fundamentals within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DNS Fundamentals fits”?",
      "options": [
        "Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "SQL Server runs on Windows, so the operating system is part of the database platform."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity. The default instance listens on TCP 1433; the Browser service on UDP 1434 resolves named instances; availability groups commonly use 5022.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DNS Fundamentals in practice”?",
      "options": [
        "TCP",
        "UDP",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked. Always verify service state, listener state and network path in that order.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DNS Fundamentals”?",
      "options": [
        "UDP",
        "Theory becomes useful when you can apply it.",
        "TCP"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to DNS Fundamentals. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "DNS Fundamentals sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "With DNS Fundamentals, prefer measured, reversible changes.",
        "TCP",
        "DNS Fundamentals"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates DNS Fundamentals with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What DNS Fundamentals means”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Service accounts are identities with rights.",
        "DNS Fundamentals sits inside a larger system."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Service accounts are identities with rights. The principle of least privilege applies: grant only the permissions the service needs (log on as a service, file access to data folders, perhaps domain rights for backups or Kerberos), no more.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DNS Fundamentals fits”?",
      "options": [
        "The diagram below places DNS Fundamentals alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "DNS Fundamentals sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places DNS Fundamentals alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DNS Fundamentals in practice”?",
      "options": [
        "Use the following as a starting point when investigating DNS Fundamentals.",
        "Automatic",
        "The following comparison captures the distinctions that matter most when working with DNS Fundamentals:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with DNS Fundamentals:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DNS Fundamentals”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "The first example establishes the relevant state.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within Windows Server and infrastructure for DBAs.”",
      "options": [
        "Next, verify the result and capture a baseline.",
        "DNS Fundamentals",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine DNS Fundamentals within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DNS Fundamentals fits”?",
      "options": [
        "Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "SQL Server runs on Windows, so the operating system is part of the database platform."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity. The default instance listens on TCP 1433; the Browser service on UDP 1434 resolves named instances; availability groups commonly use 5022.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DNS Fundamentals in practice”?",
      "options": [
        "TCP",
        "UDP",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked. Always verify service state, listener state and network path in that order.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DNS Fundamentals”?",
      "options": [
        "UDP",
        "Theory becomes useful when you can apply it.",
        "TCP"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to DNS Fundamentals. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "DNS Fundamentals sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "With DNS Fundamentals, prefer measured, reversible changes.",
        "TCP",
        "DNS Fundamentals"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates DNS Fundamentals with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What DNS Fundamentals means”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Service accounts are identities with rights.",
        "DNS Fundamentals sits inside a larger system."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Service accounts are identities with rights. The principle of least privilege applies: grant only the permissions the service needs (log on as a service, file access to data folders, perhaps domain rights for backups or Kerberos), no more.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DNS Fundamentals fits”?",
      "options": [
        "The diagram below places DNS Fundamentals alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "DNS Fundamentals sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places DNS Fundamentals alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DNS Fundamentals in practice”?",
      "options": [
        "Use the following as a starting point when investigating DNS Fundamentals.",
        "Automatic",
        "The following comparison captures the distinctions that matter most when working with DNS Fundamentals:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with DNS Fundamentals:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DNS Fundamentals”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "The first example establishes the relevant state.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within Windows Server and infrastructure for DBAs.”",
      "options": [
        "Next, verify the result and capture a baseline.",
        "DNS Fundamentals",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine DNS Fundamentals within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DNS Fundamentals fits”?",
      "options": [
        "Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "SQL Server runs on Windows, so the operating system is part of the database platform."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity. The default instance listens on TCP 1433; the Browser service on UDP 1434 resolves named instances; availability groups commonly use 5022.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DNS Fundamentals in practice”?",
      "options": [
        "TCP",
        "UDP",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked. Always verify service state, listener state and network path in that order.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DNS Fundamentals”?",
      "options": [
        "UDP",
        "Theory becomes useful when you can apply it.",
        "TCP"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to DNS Fundamentals. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "DNS Fundamentals sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "With DNS Fundamentals, prefer measured, reversible changes.",
        "TCP",
        "DNS Fundamentals"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates DNS Fundamentals with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What DNS Fundamentals means”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Service accounts are identities with rights.",
        "DNS Fundamentals sits inside a larger system."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Service accounts are identities with rights. The principle of least privilege applies: grant only the permissions the service needs (log on as a service, file access to data folders, perhaps domain rights for backups or Kerberos), no more.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DNS Fundamentals fits”?",
      "options": [
        "The diagram below places DNS Fundamentals alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "DNS Fundamentals sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places DNS Fundamentals alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DNS Fundamentals in practice”?",
      "options": [
        "Use the following as a starting point when investigating DNS Fundamentals.",
        "Automatic",
        "The following comparison captures the distinctions that matter most when working with DNS Fundamentals:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with DNS Fundamentals:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DNS Fundamentals”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "The first example establishes the relevant state.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "DNS Fundamentals is a fundamental concept in Windows Server and infrastructure for DBAs",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of DNS Fundamentals improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
