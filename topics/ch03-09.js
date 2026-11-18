/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch03-09.html */

window.TOPIC = {
  id: "ch03-09",
  title: "Network Fundamentals",

  lead: "This topic covers Network Fundamentals — a concept you will meet repeatedly when working with Windows Server and infrastructure for DBAs. We build from first principles to production guidance.",

  objectives: [
    "Define what Network Fundamentals is and where it fits",
    "Explain how Network Fundamentals works internally",
    "Apply Network Fundamentals correctly in a production environment",
    "Recognise the common mistakes and risks involving Network Fundamentals",
    "Monitor and troubleshoot Network Fundamentals with the right tools"
  ],

  sections: [
    {
      h: "Network path fundamentals",
      html: `
<p>A SQL Server connection crosses several independently managed layers: name resolution, routing, a listening protocol and port, host and network firewalls, and SQL Server authentication. A failure at one layer can look like a database outage, so diagnose the path rather than guessing from the client error.</p>
<p>Keep the client and server addresses, subnet masks, gateways, DNS servers, and expected SQL listener endpoint in the deployment record. DNS maps names to addresses; routing selects a path between networks; TCP ports identify the application endpoint on a host.</p>
<table>
  <tr><th>Layer</th><th>Question</th><th>Useful evidence</th></tr>
  <tr><td>Name resolution</td><td>Does the client resolve the intended server name?</td><td><code>Resolve-DnsName</code>, DNS records</td></tr>
  <tr><td>Routing</td><td>Can the client reach the server subnet?</td><td>Route table, gateway, network team telemetry</td></tr>
  <tr><td>Listener</td><td>Is SQL Server listening on the expected address and port?</td><td>SQL error log, SQL Server Configuration Manager</td></tr>
  <tr><td>Filtering</td><td>Do host and network firewalls allow the flow?</td><td>Firewall rules and connection logs</td></tr>
</table>
<div class="figure"><svg viewBox="0 0 760 160" role="img" aria-label="Troubleshooting evidence flow"><rect x="20" y="40" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--border)"/><text x="100" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Evidence</text><rect x="300" y="40" width="160" height="70" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="380" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Diagnosis</text><rect x="580" y="40" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--border)"/><text x="660" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Resolution</text></svg><div class="figcaption">Figure 1 - Separate evidence, diagnosis, and remediation.</div></div>
`
    },
    {
      h: "TCP/IP checks for a DBA",
      html: `
<p><code>ping</code> tests ICMP reachability when ICMP is allowed; it does not test a SQL Server TCP port. <code>Test-NetConnection</code> can test a specific TCP endpoint, but a successful TCP handshake doesn't prove that SQL authentication, TLS negotiation, or a query will succeed.</p>
<pre><code class="language-powershell">Resolve-DnsName -Name 'sql01.contoso.com'
Test-NetConnection -ComputerName 'sql01.contoso.com' -Port 51433 -InformationLevel Detailed
Get-NetIPConfiguration</code></pre>
<p>Use the actual listener port from the instance configuration or SQL Server error log rather than assuming 1433. Test from the affected client network; a test run on the database host can bypass a firewall or route that blocks remote clients.</p>
`
    },
    {
      h: "SQL Server connectivity layers",
      html: `
<p>For a connection to work, TCP/IP must be enabled for the instance, SQL Server must be listening on the expected address and port, and the firewall path must allow the client. Named instances can use dynamic ports; SQL Server Browser can provide discovery information in some connection scenarios, but clients can also use an explicitly configured port.</p>
<p>After TCP connects, diagnose SQL-level failures separately: TLS certificate validation, authentication mode, login state, and database access are not repaired by opening another firewall port. For Availability Groups, the client listener and the replica-to-replica database-mirroring endpoint are distinct network endpoints.</p>
`
    },
    {
      h: "A repeatable troubleshooting order",
      html: `
<ol>
  <li>Record the exact client error, timestamp, client host, server name, and port.</li>
  <li>Resolve the server name from the affected client and confirm the returned address is expected.</li>
  <li>Confirm the SQL instance is running, TCP/IP is enabled, and the instance is listening on that port.</li>
  <li>Test the TCP port from the client; if it fails, check host firewall, network firewall, routing, and the listener binding.</li>
  <li>If TCP succeeds, inspect TLS, authentication, SQL error logs, and login/database permissions.</li>
</ol>
<p>Change one layer at a time and preserve before/after evidence. Avoid disabling a firewall as a diagnostic shortcut; use a narrowly scoped temporary rule only through the approved change process.</p>
`
    }
  ],
  scenario: {
    title: 'A firewall profile blocks the SQL listener',
    html: `<p>The application team reports SQL unavailable after a Windows patch. The engine is running and the SQL error log shows no listener failure. A TCP test from the application subnet fails, while one on the server succeeds. The DBA finds the host is now classified on a different firewall profile and restores a narrowly scoped rule. Re-testing from the application subnet confirms the connection.</p>`
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
        "Network Fundamentals",
        "Automatic (named instances)",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Network Fundamentals within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Network Fundamentals fits”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Service accounts are identities with rights."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Service accounts are identities with rights. The principle of least privilege applies: grant only the permissions the service needs (log on as a service, file access to data folders, perhaps domain rights for backups or Kerberos), no more.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Network Fundamentals in practice”?",
      "options": [
        "With Network Fundamentals, prefer measured, reversible changes.",
        "NTFS permissions control who can read or change files.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “NTFS permissions control who can read or change files. The service account needs modify rights on data, log and backup folders. Misconfigured permissions surface as errors 5 (access denied) or failures to create backups and files.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Network Fundamentals”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "With Network Fundamentals, prefer measured, reversible changes."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Network Fundamentals. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked.",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Event Viewer and Performance Monitor are the Windows-side diagnostic tools. The System and Application logs record service stops, disk errors and driver faults; Performance Monitor counter logs reveal CPU, memory and disk pressure over time.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "Network Fundamentals",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Network Fundamentals with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Network Fundamentals means”?",
      "options": [
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "UDP",
        "Network Fundamentals"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Network Fundamentals fits”?",
      "options": [
        "TCP",
        "UDP",
        "The diagram below places Network Fundamentals alongside the core concepts of Windows Server and infrastructure for DBAs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Network Fundamentals alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Network Fundamentals in practice”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "The following comparison captures the distinctions that matter most when working with Network Fundamentals:",
        "Network Fundamentals sits inside a larger system."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Network Fundamentals:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Network Fundamentals”?",
      "options": [
        "The first example establishes the relevant state.",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked.",
        "Use the following as a starting point when investigating Network Fundamentals."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within Windows Server and infrastructure for DBAs.”",
      "options": [
        "Network Fundamentals",
        "Automatic (named instances)",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Network Fundamentals within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Network Fundamentals fits”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Service accounts are identities with rights."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Service accounts are identities with rights. The principle of least privilege applies: grant only the permissions the service needs (log on as a service, file access to data folders, perhaps domain rights for backups or Kerberos), no more.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Network Fundamentals in practice”?",
      "options": [
        "With Network Fundamentals, prefer measured, reversible changes.",
        "NTFS permissions control who can read or change files.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “NTFS permissions control who can read or change files. The service account needs modify rights on data, log and backup folders. Misconfigured permissions surface as errors 5 (access denied) or failures to create backups and files.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Network Fundamentals”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "With Network Fundamentals, prefer measured, reversible changes."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Network Fundamentals. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked.",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Event Viewer and Performance Monitor are the Windows-side diagnostic tools. The System and Application logs record service stops, disk errors and driver faults; Performance Monitor counter logs reveal CPU, memory and disk pressure over time.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "Network Fundamentals",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Network Fundamentals with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Network Fundamentals means”?",
      "options": [
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "UDP",
        "Network Fundamentals"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Network Fundamentals fits”?",
      "options": [
        "TCP",
        "UDP",
        "The diagram below places Network Fundamentals alongside the core concepts of Windows Server and infrastructure for DBAs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Network Fundamentals alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Network Fundamentals in practice”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "The following comparison captures the distinctions that matter most when working with Network Fundamentals:",
        "Network Fundamentals sits inside a larger system."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Network Fundamentals:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Network Fundamentals”?",
      "options": [
        "The first example establishes the relevant state.",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked.",
        "Use the following as a starting point when investigating Network Fundamentals."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within Windows Server and infrastructure for DBAs.”",
      "options": [
        "Network Fundamentals",
        "Automatic (named instances)",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Network Fundamentals within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Network Fundamentals fits”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Service accounts are identities with rights."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Service accounts are identities with rights. The principle of least privilege applies: grant only the permissions the service needs (log on as a service, file access to data folders, perhaps domain rights for backups or Kerberos), no more.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Network Fundamentals in practice”?",
      "options": [
        "With Network Fundamentals, prefer measured, reversible changes.",
        "NTFS permissions control who can read or change files.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “NTFS permissions control who can read or change files. The service account needs modify rights on data, log and backup folders. Misconfigured permissions surface as errors 5 (access denied) or failures to create backups and files.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Network Fundamentals”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "With Network Fundamentals, prefer measured, reversible changes."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Network Fundamentals. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked.",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Event Viewer and Performance Monitor are the Windows-side diagnostic tools. The System and Application logs record service stops, disk errors and driver faults; Performance Monitor counter logs reveal CPU, memory and disk pressure over time.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "Network Fundamentals",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Network Fundamentals with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Network Fundamentals means”?",
      "options": [
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "UDP",
        "Network Fundamentals"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Network Fundamentals fits”?",
      "options": [
        "TCP",
        "UDP",
        "The diagram below places Network Fundamentals alongside the core concepts of Windows Server and infrastructure for DBAs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Network Fundamentals alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Network Fundamentals in practice”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "The following comparison captures the distinctions that matter most when working with Network Fundamentals:",
        "Network Fundamentals sits inside a larger system."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Network Fundamentals:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Network Fundamentals”?",
      "options": [
        "The first example establishes the relevant state.",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked.",
        "Use the following as a starting point when investigating Network Fundamentals."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Network Fundamentals is a fundamental concept in Windows Server and infrastructure for DBAs",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Network Fundamentals improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
