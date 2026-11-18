/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch03-17.html */

window.TOPIC = {
  id: "ch03-17",
  title: "Storage and Network Troubleshooting",

  lead: "Understanding Storage and Network Troubleshooting is essential for anyone responsible for Windows Server and infrastructure for DBAs. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what Storage and Network Troubleshooting is and where it fits",
    "Explain how Storage and Network Troubleshooting works internally",
    "Apply Storage and Network Troubleshooting correctly in a production environment",
    "Recognise the common mistakes and risks involving Storage and Network Troubleshooting",
    "Monitor and troubleshoot Storage and Network Troubleshooting with the right tools"
  ],

  sections: [
    { h: "Evidence flow", html: `<div class="figure"><svg viewBox="0 0 760 160" role="img" aria-label="Troubleshooting evidence flow"><rect x="20" y="40" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--border)"/><text x="100" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Evidence</text><rect x="300" y="40" width="160" height="70" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="380" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Diagnosis</text><rect x="580" y="40" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--border)"/><text x="660" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Resolution</text></svg><div class="figcaption">Figure 1 - Separate evidence, diagnosis, and remediation.</div></div>` },
    { h: "Separate network and storage symptoms", html: `<p>A connection failure and a slow query may share a time window but have different causes. Diagnose reachability, SQL protocol/authentication, storage capacity, and I/O latency as separate layers.</p>
<table><tr><th>Symptom</th><th>First evidence</th></tr><tr><td>TCP timeout</td><td>DNS, listener port, firewall, route</td></tr><tr><td>Login or TLS error</td><td>Client error and SQL ERRORLOG</td></tr><tr><td>I/O wait</td><td>SQL waits and file-I/O deltas</td></tr><tr><td>Full disk or backup failure</td><td>Free space, path, identity, and SQL error log</td></tr></table>` },
    { h: "Network triage", html: `<p>Start from the affected client. Resolve the server name and test the configured listener port. Distinguish a failed TCP handshake from TLS, authentication, or query failures.</p>
<pre><code class="language-powershell">Resolve-DnsName sql01.contoso.com
Test-NetConnection sql01.contoso.com -Port 51433 -InformationLevel Detailed</code></pre><p>If TCP fails, check listener binding, host and network firewalls, routing, and addresses. If TCP succeeds, inspect SQL protocol and authentication evidence.</p>` },
    { h: "Storage triage", html: `<p>Check free space, SQL file locations, autogrowth, Windows events, and storage counters during the incident interval. SQL Server file-I/O values are cumulative; calculate deltas over a known interval.</p>
<pre><code class="language-powershell">Get-Volume | Select-Object DriveLetter, FileSystemLabel,
  @{n='FreeGB';e={[math]::Round($_.SizeRemaining/1GB,1)}},
  @{n='SizeGB';e={[math]::Round($_.Size/1GB,1)}} | Format-Table -AutoSize</code></pre>` },
    { h: "Correlate and resolve", html: `<ol><li>Record host, client, database, error, timestamp, and recent changes.</li><li>Test DNS and the actual SQL port.</li><li>Check SQL service state, listener, ERRORLOG, and authentication.</li><li>Map SQL files to volumes and align I/O measurements with waits and storage telemetry.</li><li>Change one confirmed cause and retest the same workload.</li></ol><p>Escalate with endpoint details, volume mappings, timestamps, and measured deltas. Avoid arbitrary thresholds, broad firewall changes, or shrinking files as an emergency shortcut.</p>` }
  ],
  scenario: {
    title: 'Storage latency is mistaken for network loss',
    html: `<p>The application reports timeouts. DNS and the configured SQL TCP port succeed from the affected client, ruling out listener and firewall reachability. SQL file-I/O deltas and storage telemetry show log-volume latency during the window. The storage issue is repaired and the workload returns to baseline.</p>`
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
        "UDP",
        "Storage and Network Troubleshooting",
        "TCP"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Storage and Network Troubleshooting within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Storage and Network Troubleshooting fits”?",
      "options": [
        "Service accounts are identities with rights.",
        "Storage and Network Troubleshooting sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Service accounts are identities with rights. The principle of least privilege applies: grant only the permissions the service needs (log on as a service, file access to data folders, perhaps domain rights for backups or Kerberos), no more.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Storage and Network Troubleshooting in practice”?",
      "options": [
        "Automatic",
        "Automatic (named instances)",
        "NTFS permissions control who can read or change files."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “NTFS permissions control who can read or change files. The service account needs modify rights on data, log and backup folders. Misconfigured permissions surface as errors 5 (access denied) or failures to create backups and files.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Storage and Network Troubleshooting”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Storage and Network Troubleshooting. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "UDP",
        "Storage and Network Troubleshooting"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Event Viewer and Performance Monitor are the Windows-side diagnostic tools. The System and Application logs record service stops, disk errors and driver faults; Performance Monitor counter logs reveal CPU, memory and disk pressure over time.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "Windows services are long-running background processes.",
        "Storage and Network Troubleshooting"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Storage and Network Troubleshooting with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Storage and Network Troubleshooting means”?",
      "options": [
        "NTFS permissions control who can read or change files.",
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "The diagram below places Storage and Network Troubleshooting alongside the core concepts of Windows Server and infrastructure for DBAs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Storage and Network Troubleshooting fits”?",
      "options": [
        "The diagram below places Storage and Network Troubleshooting alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "Windows services are long-running background processes.",
        "Storage and Network Troubleshooting is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Storage and Network Troubleshooting alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Storage and Network Troubleshooting in practice”?",
      "options": [
        "Storage and Network Troubleshooting is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance…",
        "Service accounts are identities with rights.",
        "The following comparison captures the distinctions that matter most when working with Storage and Network Troubleshooting:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Storage and Network Troubleshooting:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Storage and Network Troubleshooting”?",
      "options": [
        "The diagram below places Storage and Network Troubleshooting alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "The first example establishes the relevant state.",
        "Service accounts are identities with rights."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within Windows Server and infrastructure for DBAs.”",
      "options": [
        "UDP",
        "Storage and Network Troubleshooting",
        "TCP"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Storage and Network Troubleshooting within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Storage and Network Troubleshooting fits”?",
      "options": [
        "Service accounts are identities with rights.",
        "Storage and Network Troubleshooting sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Service accounts are identities with rights. The principle of least privilege applies: grant only the permissions the service needs (log on as a service, file access to data folders, perhaps domain rights for backups or Kerberos), no more.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Storage and Network Troubleshooting in practice”?",
      "options": [
        "Automatic",
        "Automatic (named instances)",
        "NTFS permissions control who can read or change files."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “NTFS permissions control who can read or change files. The service account needs modify rights on data, log and backup folders. Misconfigured permissions surface as errors 5 (access denied) or failures to create backups and files.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Storage and Network Troubleshooting”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Storage and Network Troubleshooting. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "UDP",
        "Storage and Network Troubleshooting"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Event Viewer and Performance Monitor are the Windows-side diagnostic tools. The System and Application logs record service stops, disk errors and driver faults; Performance Monitor counter logs reveal CPU, memory and disk pressure over time.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "Windows services are long-running background processes.",
        "Storage and Network Troubleshooting"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Storage and Network Troubleshooting with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Storage and Network Troubleshooting means”?",
      "options": [
        "NTFS permissions control who can read or change files.",
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "The diagram below places Storage and Network Troubleshooting alongside the core concepts of Windows Server and infrastructure for DBAs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Storage and Network Troubleshooting fits”?",
      "options": [
        "The diagram below places Storage and Network Troubleshooting alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "Windows services are long-running background processes.",
        "Storage and Network Troubleshooting is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Storage and Network Troubleshooting alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Storage and Network Troubleshooting in practice”?",
      "options": [
        "Storage and Network Troubleshooting is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance…",
        "Service accounts are identities with rights.",
        "The following comparison captures the distinctions that matter most when working with Storage and Network Troubleshooting:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Storage and Network Troubleshooting:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Storage and Network Troubleshooting”?",
      "options": [
        "The diagram below places Storage and Network Troubleshooting alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "The first example establishes the relevant state.",
        "Service accounts are identities with rights."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within Windows Server and infrastructure for DBAs.”",
      "options": [
        "UDP",
        "Storage and Network Troubleshooting",
        "TCP"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Storage and Network Troubleshooting within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Storage and Network Troubleshooting fits”?",
      "options": [
        "Service accounts are identities with rights.",
        "Storage and Network Troubleshooting sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Service accounts are identities with rights. The principle of least privilege applies: grant only the permissions the service needs (log on as a service, file access to data folders, perhaps domain rights for backups or Kerberos), no more.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Storage and Network Troubleshooting in practice”?",
      "options": [
        "Automatic",
        "Automatic (named instances)",
        "NTFS permissions control who can read or change files."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “NTFS permissions control who can read or change files. The service account needs modify rights on data, log and backup folders. Misconfigured permissions surface as errors 5 (access denied) or failures to create backups and files.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Storage and Network Troubleshooting”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Storage and Network Troubleshooting. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "UDP",
        "Storage and Network Troubleshooting"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Event Viewer and Performance Monitor are the Windows-side diagnostic tools. The System and Application logs record service stops, disk errors and driver faults; Performance Monitor counter logs reveal CPU, memory and disk pressure over time.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "Windows services are long-running background processes.",
        "Storage and Network Troubleshooting"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Storage and Network Troubleshooting with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Storage and Network Troubleshooting means”?",
      "options": [
        "NTFS permissions control who can read or change files.",
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "The diagram below places Storage and Network Troubleshooting alongside the core concepts of Windows Server and infrastructure for DBAs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Storage and Network Troubleshooting fits”?",
      "options": [
        "The diagram below places Storage and Network Troubleshooting alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "Windows services are long-running background processes.",
        "Storage and Network Troubleshooting is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Storage and Network Troubleshooting alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Storage and Network Troubleshooting in practice”?",
      "options": [
        "Storage and Network Troubleshooting is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance…",
        "Service accounts are identities with rights.",
        "The following comparison captures the distinctions that matter most when working with Storage and Network Troubleshooting:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Storage and Network Troubleshooting:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Storage and Network Troubleshooting”?",
      "options": [
        "The diagram below places Storage and Network Troubleshooting alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "The first example establishes the relevant state.",
        "Service accounts are identities with rights."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Storage and Network Troubleshooting is a fundamental concept in Windows Server and infrastructure for DBAs",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Storage and Network Troubleshooting improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
