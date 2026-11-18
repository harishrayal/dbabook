/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch03-16.html */

window.TOPIC = {
  id: "ch03-16",
  title: "SQL Server Service Accounts",

  lead: "SQL Server Service Accounts is a core part of Windows Server and infrastructure for DBAs. This topic explains what it is, how it works inside SQL Server, and what a production DBA must know to operate it safely.",

  objectives: [
    "Define what SQL Server Service Accounts is and where it fits",
    "Explain how SQL Server Service Accounts works internally",
    "Apply SQL Server Service Accounts correctly in a production environment",
    "Recognise the common mistakes and risks involving SQL Server Service Accounts",
    "Monitor and troubleshoot SQL Server Service Accounts with the right tools"
  ],

  sections: [
    { h: "Evidence flow", html: `<div class="figure"><svg viewBox="0 0 760 160" role="img" aria-label="Troubleshooting evidence flow"><rect x="20" y="40" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--border)"/><text x="100" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Evidence</text><rect x="300" y="40" width="160" height="70" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="380" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Diagnosis</text><rect x="580" y="40" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--border)"/><text x="660" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Resolution</text></svg><div class="figcaption">Figure 1 - Separate evidence, diagnosis, and remediation.</div></div>` },
    { h: "Service identity choices", html: `<p>Each SQL Server service runs under a Windows identity. Choose an identity with only the local and network access that component needs.</p>
<table><tr><th>Identity</th><th>Typical properties</th></tr><tr><td>Virtual account</td><td>Per-service local identity; no password to manage</td></tr><tr><td>gMSA</td><td>Domain identity with AD-managed password</td></tr><tr><td>Domain account</td><td>Domain identity with managed password and lifecycle</td></tr><tr><td>LocalSystem</td><td>Highly privileged local identity; avoid unless required</td></tr></table>` },
    { h: "Rights and network access", html: `<p>The Database Engine needs access to its database, log, error-log, dump, and approved backup paths. SQL Agent jobs can use SQL Agent proxies for supported job-step types. The correct rights depend on the component and target identity.</p>
<p>Virtual accounts are local identities; domain access typically uses the computer account. A gMSA or domain account may be needed for a distinct network identity. Kerberos requires correct SPNs and, when a second hop is involved, separate delegation configuration.</p>` },
    { h: "Change service accounts safely", html: `<pre><code class="language-powershell">Get-CimInstance Win32_Service -Filter "Name='MSSQLSERVER'" |
  Select-Object Name, StartName, State
sc.exe qc MSSQLSERVER</code></pre><p>Use SQL Server Configuration Manager for SQL-specific account changes. Record the account, paths, SPNs, dependents, and restart plan before changing it. Verify startup, file access, backup/restore, Agent jobs, and Kerberos behavior after the change.</p>` },
    { h: "Lifecycle and recovery", html: `<ul><li>Use managed identities where supported.</li><li>Document password ownership and rotation for domain accounts.</li><li>Do not use employee accounts or highly privileged identities for SQL services.</li><li>Test startup and dependent resources after any account, password, or SPN change.</li></ul>` }
  ],
  scenario: {
    title: 'A service rotation breaks startup',
    html: `<p>After a service-account rotation, the Database Engine fails to start. The StartName is correct, but the new account lacks a required file right or logon configuration. The DBA grants only the required rights, then verifies database, backup, Agent, and Kerberos behavior.</p>`
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
        "With SQL Server Service Accounts, prefer measured, reversible changes.",
        "TCP",
        "SQL Server Service Accounts"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine SQL Server Service Accounts within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Service Accounts fits”?",
      "options": [
        "SQL Server Service Accounts sits inside a larger system.",
        "Windows services are long-running background processes.",
        "UDP"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Windows services are long-running background processes. The SQL Server service, SQL Server Agent and several auxiliary services run under configured accounts; their start mode, state and dependencies determine whether the database is reachable after a reboot.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Service Accounts in practice”?",
      "options": [
        "Service accounts are identities with rights.",
        "Use the following as a starting point when investigating SQL Server Service Accounts.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Service Accounts:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Service accounts are identities with rights. The principle of least privilege applies: grant only the permissions the service needs (log on as a service, file access to data folders, perhaps domain rights for backups or Kerberos), no more.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Service Accounts”?",
      "options": [
        "Use the following as a starting point when investigating SQL Server Service Accounts.",
        "The first example establishes the relevant state.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Service Accounts. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "With SQL Server Service Accounts, prefer measured, reversible changes.",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked.",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked. Always verify service state, listener state and network path in that order.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "SQL Server Service Accounts",
        "Use the following as a starting point when investigating SQL Server Service Accounts.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “This section consolidates SQL Server Service Accounts with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SQL Server Service Accounts means”?",
      "options": [
        "Windows services are long-running background processes.",
        "The diagram below places SQL Server Service Accounts alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Service Accounts fits”?",
      "options": [
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "The diagram below places SQL Server Service Accounts alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The diagram below places SQL Server Service Accounts alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Service Accounts in practice”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with SQL Server Service Accounts:",
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "SQL Server Service Accounts is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SQL Server Service Accounts:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Service Accounts”?",
      "options": [
        "SQL Server Service Accounts is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Windows services are long-running background processes.",
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
        "With SQL Server Service Accounts, prefer measured, reversible changes.",
        "TCP",
        "SQL Server Service Accounts"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine SQL Server Service Accounts within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Service Accounts fits”?",
      "options": [
        "SQL Server Service Accounts sits inside a larger system.",
        "Windows services are long-running background processes.",
        "UDP"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Windows services are long-running background processes. The SQL Server service, SQL Server Agent and several auxiliary services run under configured accounts; their start mode, state and dependencies determine whether the database is reachable after a reboot.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Service Accounts in practice”?",
      "options": [
        "Service accounts are identities with rights.",
        "Use the following as a starting point when investigating SQL Server Service Accounts.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Service Accounts:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Service accounts are identities with rights. The principle of least privilege applies: grant only the permissions the service needs (log on as a service, file access to data folders, perhaps domain rights for backups or Kerberos), no more.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Service Accounts”?",
      "options": [
        "Use the following as a starting point when investigating SQL Server Service Accounts.",
        "The first example establishes the relevant state.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Service Accounts. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "With SQL Server Service Accounts, prefer measured, reversible changes.",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked.",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked. Always verify service state, listener state and network path in that order.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "SQL Server Service Accounts",
        "Use the following as a starting point when investigating SQL Server Service Accounts.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “This section consolidates SQL Server Service Accounts with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SQL Server Service Accounts means”?",
      "options": [
        "Windows services are long-running background processes.",
        "The diagram below places SQL Server Service Accounts alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Service Accounts fits”?",
      "options": [
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "The diagram below places SQL Server Service Accounts alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The diagram below places SQL Server Service Accounts alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Service Accounts in practice”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with SQL Server Service Accounts:",
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "SQL Server Service Accounts is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SQL Server Service Accounts:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Service Accounts”?",
      "options": [
        "SQL Server Service Accounts is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Windows services are long-running background processes.",
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
        "With SQL Server Service Accounts, prefer measured, reversible changes.",
        "TCP",
        "SQL Server Service Accounts"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine SQL Server Service Accounts within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Service Accounts fits”?",
      "options": [
        "SQL Server Service Accounts sits inside a larger system.",
        "Windows services are long-running background processes.",
        "UDP"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Windows services are long-running background processes. The SQL Server service, SQL Server Agent and several auxiliary services run under configured accounts; their start mode, state and dependencies determine whether the database is reachable after a reboot.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Service Accounts in practice”?",
      "options": [
        "Service accounts are identities with rights.",
        "Use the following as a starting point when investigating SQL Server Service Accounts.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Service Accounts:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Service accounts are identities with rights. The principle of least privilege applies: grant only the permissions the service needs (log on as a service, file access to data folders, perhaps domain rights for backups or Kerberos), no more.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Service Accounts”?",
      "options": [
        "Use the following as a starting point when investigating SQL Server Service Accounts.",
        "The first example establishes the relevant state.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Service Accounts. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "With SQL Server Service Accounts, prefer measured, reversible changes.",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked.",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked. Always verify service state, listener state and network path in that order.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "SQL Server Service Accounts",
        "Use the following as a starting point when investigating SQL Server Service Accounts.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “This section consolidates SQL Server Service Accounts with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SQL Server Service Accounts means”?",
      "options": [
        "Windows services are long-running background processes.",
        "The diagram below places SQL Server Service Accounts alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Service Accounts fits”?",
      "options": [
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "The diagram below places SQL Server Service Accounts alongside the core concepts of Windows Server and infrastructure for DBAs.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The diagram below places SQL Server Service Accounts alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Service Accounts in practice”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with SQL Server Service Accounts:",
        "SQL Server runs on Windows, so the operating system is part of the database platform.",
        "SQL Server Service Accounts is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SQL Server Service Accounts:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Service Accounts”?",
      "options": [
        "SQL Server Service Accounts is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Windows services are long-running background processes.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "SQL Server Service Accounts is a fundamental concept in Windows Server and infrastructure for DBAs",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of SQL Server Service Accounts improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
