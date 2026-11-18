/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch03-13.html */

window.TOPIC = {
  id: "ch03-13",
  title: "Remote Desktop (RDP)",

  lead: "Remote Desktop (RDP) is a core part of Windows Server and infrastructure for DBAs. This topic explains what it is, how it works inside SQL Server, and what a production DBA must know to operate it safely.",

  objectives: [
    "Define what Remote Desktop (RDP) is and where it fits",
    "Explain how Remote Desktop (RDP) works internally",
    "Apply Remote Desktop (RDP) correctly in a production environment",
    "Recognise the common mistakes and risks involving Remote Desktop (RDP)",
    "Monitor and troubleshoot Remote Desktop (RDP) with the right tools"
  ],

  sections: [
    { h: "Evidence flow", html: `<div class="figure"><svg viewBox="0 0 760 160" role="img" aria-label="Troubleshooting evidence flow"><rect x="20" y="40" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--border)"/><text x="100" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Evidence</text><rect x="300" y="40" width="160" height="70" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="380" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Diagnosis</text><rect x="580" y="40" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--border)"/><text x="660" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Resolution</text></svg><div class="figcaption">Figure 1 - Separate evidence, diagnosis, and remediation.</div></div>` },
    { h: "What Remote Desktop provides", html: `<p>Remote Desktop Protocol (RDP) provides an interactive Windows session to a remote host. RDP is an administration path, not a SQL Server application protocol. TCP 3389 is the usual RDP endpoint; a deployment can use a gateway or a changed port, so verify the configured path.</p>
<p>Use RDP through the organization's VPN, Remote Desktop Gateway, or privileged-access host. Restrict source networks and authorized users, and enable Network Level Authentication and the required MFA controls.</p>` },
    { h: "Separate RDP from SQL connectivity", html: `<p>A successful RDP session proves only that Windows remote administration is available. It does not prove that the Database Engine listener, firewall, TLS configuration, login, or application database is reachable.</p>
<table><tr><th>Check</th><th>Evidence</th></tr><tr><td>RDP</td><td>Test the configured management endpoint and user authorization</td></tr><tr><td>SQL connectivity</td><td>Test the actual listener port from the application network</td></tr><tr><td>SQL authentication</td><td>Inspect client errors and SQL Server logs separately</td></tr></table>` },
    { h: "Troubleshoot RDP", html: `<ol><li>Confirm the host name resolves to the intended address.</li><li>Test the configured RDP port from the approved client network.</li><li>Verify the host firewall profile and matching rule.</li><li>Check Remote Desktop enablement, user authorization, NLA, gateway, and policy.</li><li>Review the terminal-services and Security event logs at the incident timestamp.</li></ol>
<pre><code class="language-powershell">Test-NetConnection -ComputerName db01.contoso.com -Port 3389
Get-Service -Name TermService</code></pre>` },
    { h: "Operational safeguards", html: `<p>Do not expose RDP directly to the internet. Grant access through managed groups, preserve session and change auditing, and remove temporary access when work is complete. Disconnecting leaves a user session running; signing out ends it. Follow policy before ending another administrator's session.</p>` }
  ],
  scenario: {
    title: 'RDP stops after a profile change',
    html: `<p>Administrators lose RDP after a network profile change while SQL applications remain connected. A test from the approved management host confirms the RDP endpoint is blocked. The team restores the narrow management rule for the correct profile and source network. RDP and SQL listener ports remain separately managed.</p>`
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
        "Windows services are long-running background processes.",
        "Service accounts are identities with rights.",
        "Remote Desktop (RDP)"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Remote Desktop (RDP) within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Remote Desktop (RDP) fits”?",
      "options": [
        "With Remote Desktop (RDP), prefer measured, reversible changes.",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "NTFS permissions control who can read or change files."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Event Viewer and Performance Monitor are the Windows-side diagnostic tools. The System and Application logs record service stops, disk errors and driver faults; Performance Monitor counter logs reveal CPU, memory and disk pressure over time.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Remote Desktop (RDP) in practice”?",
      "options": [
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "Remote Desktop (RDP) sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Remote Desktop (RDP)”?",
      "options": [
        "Remote Desktop (RDP) sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Remote Desktop (RDP). Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "NTFS permissions control who can read or change files.",
        "Service accounts are identities with rights.",
        "Use the following as a starting point when investigating Remote Desktop (RDP)."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Service accounts are identities with rights. The principle of least privilege applies: grant only the permissions the service needs (log on as a service, file access to data folders, perhaps domain rights for backups or Kerberos), no more.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Remote Desktop (RDP)",
        "UDP",
        "Remote Desktop (RDP) sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “This section consolidates Remote Desktop (RDP) with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Remote Desktop (RDP) means”?",
      "options": [
        "Use the following as a starting point when investigating Remote Desktop (RDP).",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked.",
        "Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity. The default instance listens on TCP 1433; the Browser service on UDP 1434 resolves named instances; availability groups commonly use 5022.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Remote Desktop (RDP) fits”?",
      "options": [
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "The diagram below places Remote Desktop (RDP) alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "Use the following as a starting point when investigating Remote Desktop (RDP)."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The diagram below places Remote Desktop (RDP) alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Remote Desktop (RDP) in practice”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Remote Desktop (RDP):",
        "Automatic (named instances)",
        "Remote Desktop (RDP)"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Remote Desktop (RDP):”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Remote Desktop (RDP)”?",
      "options": [
        "Remote Desktop (RDP)",
        "Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity.",
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
        "Windows services are long-running background processes.",
        "Service accounts are identities with rights.",
        "Remote Desktop (RDP)"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Remote Desktop (RDP) within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Remote Desktop (RDP) fits”?",
      "options": [
        "With Remote Desktop (RDP), prefer measured, reversible changes.",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "NTFS permissions control who can read or change files."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Event Viewer and Performance Monitor are the Windows-side diagnostic tools. The System and Application logs record service stops, disk errors and driver faults; Performance Monitor counter logs reveal CPU, memory and disk pressure over time.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Remote Desktop (RDP) in practice”?",
      "options": [
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "Remote Desktop (RDP) sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Remote Desktop (RDP)”?",
      "options": [
        "Remote Desktop (RDP) sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Remote Desktop (RDP). Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "NTFS permissions control who can read or change files.",
        "Service accounts are identities with rights.",
        "Use the following as a starting point when investigating Remote Desktop (RDP)."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Service accounts are identities with rights. The principle of least privilege applies: grant only the permissions the service needs (log on as a service, file access to data folders, perhaps domain rights for backups or Kerberos), no more.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Remote Desktop (RDP)",
        "UDP",
        "Remote Desktop (RDP) sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “This section consolidates Remote Desktop (RDP) with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Remote Desktop (RDP) means”?",
      "options": [
        "Use the following as a starting point when investigating Remote Desktop (RDP).",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked.",
        "Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity. The default instance listens on TCP 1433; the Browser service on UDP 1434 resolves named instances; availability groups commonly use 5022.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Remote Desktop (RDP) fits”?",
      "options": [
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "The diagram below places Remote Desktop (RDP) alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "Use the following as a starting point when investigating Remote Desktop (RDP)."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The diagram below places Remote Desktop (RDP) alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Remote Desktop (RDP) in practice”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Remote Desktop (RDP):",
        "Automatic (named instances)",
        "Remote Desktop (RDP)"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Remote Desktop (RDP):”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Remote Desktop (RDP)”?",
      "options": [
        "Remote Desktop (RDP)",
        "Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity.",
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
        "Windows services are long-running background processes.",
        "Service accounts are identities with rights.",
        "Remote Desktop (RDP)"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Remote Desktop (RDP) within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Remote Desktop (RDP) fits”?",
      "options": [
        "With Remote Desktop (RDP), prefer measured, reversible changes.",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "NTFS permissions control who can read or change files."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Event Viewer and Performance Monitor are the Windows-side diagnostic tools. The System and Application logs record service stops, disk errors and driver faults; Performance Monitor counter logs reveal CPU, memory and disk pressure over time.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Remote Desktop (RDP) in practice”?",
      "options": [
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "Remote Desktop (RDP) sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Remote Desktop (RDP)”?",
      "options": [
        "Remote Desktop (RDP) sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Remote Desktop (RDP). Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "NTFS permissions control who can read or change files.",
        "Service accounts are identities with rights.",
        "Use the following as a starting point when investigating Remote Desktop (RDP)."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Service accounts are identities with rights. The principle of least privilege applies: grant only the permissions the service needs (log on as a service, file access to data folders, perhaps domain rights for backups or Kerberos), no more.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Remote Desktop (RDP)",
        "UDP",
        "Remote Desktop (RDP) sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “This section consolidates Remote Desktop (RDP) with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Remote Desktop (RDP) means”?",
      "options": [
        "Use the following as a starting point when investigating Remote Desktop (RDP).",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked.",
        "Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity. The default instance listens on TCP 1433; the Browser service on UDP 1434 resolves named instances; availability groups commonly use 5022.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Remote Desktop (RDP) fits”?",
      "options": [
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "The diagram below places Remote Desktop (RDP) alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "Use the following as a starting point when investigating Remote Desktop (RDP)."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The diagram below places Remote Desktop (RDP) alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Remote Desktop (RDP) in practice”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Remote Desktop (RDP):",
        "Automatic (named instances)",
        "Remote Desktop (RDP)"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Remote Desktop (RDP):”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Remote Desktop (RDP)”?",
      "options": [
        "Remote Desktop (RDP)",
        "Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Remote Desktop (RDP) is a fundamental concept in Windows Server and infrastructure for DBAs",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Remote Desktop (RDP) improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
