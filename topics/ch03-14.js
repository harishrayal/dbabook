/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch03-14.html */

window.TOPIC = {
  id: "ch03-14",
  title: "Event Viewer",

  lead: "Understanding Event Viewer is essential for anyone responsible for Windows Server and infrastructure for DBAs. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what Event Viewer is and where it fits",
    "Explain how Event Viewer works internally",
    "Apply Event Viewer correctly in a production environment",
    "Recognise the common mistakes and risks involving Event Viewer",
    "Monitor and troubleshoot Event Viewer with the right tools"
  ],

  sections: [
    { h: "Evidence flow", html: `<div class="figure"><svg viewBox="0 0 760 160" role="img" aria-label="Troubleshooting evidence flow"><rect x="20" y="40" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--border)"/><text x="100" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Evidence</text><rect x="300" y="40" width="160" height="70" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="380" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Diagnosis</text><rect x="580" y="40" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--border)"/><text x="660" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Resolution</text></svg><div class="figcaption">Figure 1 - Separate evidence, diagnosis, and remediation.</div></div>` },
    { h: "Event channels and evidence", html: `<p>Event Viewer collects records from Windows components and applications. Common channels include System, Application, Security, and component-specific logs under Applications and Services Logs. SQL Server also maintains its own SQL error log and SQL Agent logs.</p>
<table><tr><th>Source</th><th>Typical use</th></tr><tr><td>System</td><td>SCM, drivers, disk, and OS events</td></tr><tr><td>Application</td><td>Application and SQL Server provider events</td></tr><tr><td>Security</td><td>Audited security events when audit policy is enabled</td></tr><tr><td>SQL ERRORLOG</td><td>Engine startup, recovery, login, and configuration details</td></tr></table>` },
    { h: "Filter and correlate", html: `<p>Start with a host and time window, then filter by provider, level, or event ID. Event IDs are provider- and log-specific. Correlate timestamps with SQL Server, SQL Agent, application, and change records, accounting for clock synchronization.</p>
<pre><code class="language-powershell">Get-WinEvent -FilterHashtable @{LogName='System'; StartTime=(Get-Date).AddHours(-2)} |
  Where-Object ProviderName -EQ 'Service Control Manager' |
  Select-Object TimeCreated, Id, LevelDisplayName, Message</code></pre>` },
    { h: "Incident workflow", html: `<ol><li>Capture the symptom, host, exact time, service, and recent change.</li><li>Inspect System and Application logs around the timestamp.</li><li>Open the SQL Server error log and relevant Agent log or job history.</li><li>Compare provider, event ID, message, and surrounding events.</li><li>Preserve evidence and record the resolution.</li></ol><p>An event ID is a search clue, not a complete diagnosis. The full message and related events provide context.</p>` },
    { h: "Retention and access", html: `<p>Event log retention depends on channel size and policy. Busy servers can overwrite older records. Forward or export relevant evidence without clearing logs during an incident. Security-log access and visibility require the organization's audit and role configuration.</p>` }
  ],
  scenario: {
    title: 'SCM and SQL logs identify a failed start',
    html: `<p>A SQL service fails to start after an account change. Event Viewer shows a Service Control Manager event while SQL Server ERRORLOG identifies an access-denied path. The DBA correlates timestamps and restores the account and file rights through the supported SQL Server tool.</p>`
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
        "Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity.",
        "Event Viewer",
        "NTFS permissions control who can read or change files."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Event Viewer within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Event Viewer fits”?",
      "options": [
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "With Event Viewer, prefer measured, reversible changes.",
        "TCP"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Event Viewer in practice”?",
      "options": [
        "Event Viewer sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "SQL Server runs on Windows, so the operating system is part of the database platform."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Event Viewer”?",
      "options": [
        "Service accounts are identities with rights.",
        "Theory becomes useful when you can apply it.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Event Viewer. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "NTFS permissions control who can read or change files.",
        "TCP",
        "UDP"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “NTFS permissions control who can read or change files. The service account needs modify rights on data, log and backup folders. Misconfigured permissions surface as errors 5 (access denied) or failures to create backups and files.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Event Viewer sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Event Viewer"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Event Viewer with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Event Viewer means”?",
      "options": [
        "Event Viewer is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked.",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked. Always verify service state, listener state and network path in that order.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Event Viewer fits”?",
      "options": [
        "The diagram below places Event Viewer alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "Event Viewer"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Event Viewer alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Event Viewer in practice”?",
      "options": [
        "Event Viewer",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked.",
        "The following comparison captures the distinctions that matter most when working with Event Viewer:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Event Viewer:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Event Viewer”?",
      "options": [
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "The first example establishes the relevant state.",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within Windows Server and infrastructure for DBAs.”",
      "options": [
        "Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity.",
        "Event Viewer",
        "NTFS permissions control who can read or change files."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Event Viewer within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Event Viewer fits”?",
      "options": [
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "With Event Viewer, prefer measured, reversible changes.",
        "TCP"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Event Viewer in practice”?",
      "options": [
        "Event Viewer sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "SQL Server runs on Windows, so the operating system is part of the database platform."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Event Viewer”?",
      "options": [
        "Service accounts are identities with rights.",
        "Theory becomes useful when you can apply it.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Event Viewer. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "NTFS permissions control who can read or change files.",
        "TCP",
        "UDP"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “NTFS permissions control who can read or change files. The service account needs modify rights on data, log and backup folders. Misconfigured permissions surface as errors 5 (access denied) or failures to create backups and files.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Event Viewer sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Event Viewer"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Event Viewer with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Event Viewer means”?",
      "options": [
        "Event Viewer is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked.",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked. Always verify service state, listener state and network path in that order.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Event Viewer fits”?",
      "options": [
        "The diagram below places Event Viewer alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "Event Viewer"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Event Viewer alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Event Viewer in practice”?",
      "options": [
        "Event Viewer",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked.",
        "The following comparison captures the distinctions that matter most when working with Event Viewer:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Event Viewer:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Event Viewer”?",
      "options": [
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "The first example establishes the relevant state.",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within Windows Server and infrastructure for DBAs.”",
      "options": [
        "Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity.",
        "Event Viewer",
        "NTFS permissions control who can read or change files."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Event Viewer within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Event Viewer fits”?",
      "options": [
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "With Event Viewer, prefer measured, reversible changes.",
        "TCP"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Event Viewer in practice”?",
      "options": [
        "Event Viewer sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "SQL Server runs on Windows, so the operating system is part of the database platform."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Event Viewer”?",
      "options": [
        "Service accounts are identities with rights.",
        "Theory becomes useful when you can apply it.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Event Viewer. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "NTFS permissions control who can read or change files.",
        "TCP",
        "UDP"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “NTFS permissions control who can read or change files. The service account needs modify rights on data, log and backup folders. Misconfigured permissions surface as errors 5 (access denied) or failures to create backups and files.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Event Viewer sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Event Viewer"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Event Viewer with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Event Viewer means”?",
      "options": [
        "Event Viewer is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked.",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked. Always verify service state, listener state and network path in that order.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Event Viewer fits”?",
      "options": [
        "The diagram below places Event Viewer alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "Event Viewer"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Event Viewer alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Event Viewer in practice”?",
      "options": [
        "Event Viewer",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked.",
        "The following comparison captures the distinctions that matter most when working with Event Viewer:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Event Viewer:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Event Viewer”?",
      "options": [
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "The first example establishes the relevant state.",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Event Viewer is a fundamental concept in Windows Server and infrastructure for DBAs",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Event Viewer improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
