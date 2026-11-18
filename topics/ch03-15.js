/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch03-15.html */

window.TOPIC = {
  id: "ch03-15",
  title: "Windows Performance Monitoring",

  lead: "This topic covers Windows Performance Monitoring — a concept you will meet repeatedly when working with Windows Server and infrastructure for DBAs. We build from first principles to production guidance.",

  objectives: [
    "Define what Windows Performance Monitoring is and where it fits",
    "Explain how Windows Performance Monitoring works internally",
    "Apply Windows Performance Monitoring correctly in a production environment",
    "Recognise the common mistakes and risks involving Windows Performance Monitoring",
    "Monitor and troubleshoot Windows Performance Monitoring with the right tools"
  ],

  sections: [
    { h: "Evidence flow", html: `<div class="figure"><svg viewBox="0 0 760 160" role="img" aria-label="Troubleshooting evidence flow"><rect x="20" y="40" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--border)"/><text x="100" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Evidence</text><rect x="300" y="40" width="160" height="70" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="380" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Diagnosis</text><rect x="580" y="40" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--border)"/><text x="660" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Resolution</text></svg><div class="figcaption">Figure 1 - Separate evidence, diagnosis, and remediation.</div></div>` },
    { h: "Monitor trends, not isolated readings", html: `<p>Performance monitoring compares a measured workload with a baseline and service objective. A one-counter snapshot rarely proves a bottleneck. Capture time-series data and correlate Windows counters with SQL waits, query activity, file I/O, and workload schedules.</p>
<table><tr><th>Area</th><th>Example counters</th><th>Correlate with</th></tr><tr><td>CPU</td><td>Processor Time, Processor Queue Length</td><td>SQL CPU and runnable tasks</td></tr><tr><td>Memory</td><td>Available MBytes, Pages/sec</td><td>SQL grants and process memory</td></tr><tr><td>Storage</td><td>Avg. Disk sec/Read and Write</td><td>SQL wait and file-I/O statistics</td></tr><tr><td>Network</td><td>Interface bytes, errors, discards</td><td>Network path and workload throughput</td></tr></table>` },
    { h: "Collect a focused sample", html: `<pre><code class="language-powershell">Get-Counter -Counter '\Processor(_Total)\% Processor Time',
  '\System\Processor Queue Length',
  '\Memory\Available MBytes',
  '\LogicalDisk(*)\Avg. Disk sec/Read',
  '\LogicalDisk(*)\Avg. Disk sec/Write' -SampleInterval 5 -MaxSamples 12</code></pre><p>Use a normal interval and the incident interval from the same host. For ongoing monitoring, use an approved Data Collector Set or monitoring platform.</p>` },
    { h: "Interpret counters with SQL evidence", html: `<p><code>Pages/sec</code> is not proof of harmful SQL Server paging. Disk queue and latency depend on the storage stack and workload. Correlate counters with wait statistics and file-level I/O. Cumulative SQL statistics require delta calculations between two snapshots.</p>
<p>Waits such as <code>PAGEIOLATCH_*</code> or <code>WRITELOG</code> identify resource waits to investigate; they do not prove a faulty disk by themselves.</p>` },
    { h: "Build a useful baseline", html: `<ul><li>Record normal peaks, batch windows, and maintenance periods.</li><li>Document counter units, instance names, and volume mappings.</li><li>Alert on sustained workload-relevant deviations, not arbitrary one-sample values.</li><li>Retain enough history to compare incidents and capacity trends.</li></ul>` }
  ],
  scenario: {
    title: 'CPU counters align with a scheduled report',
    html: `<p>Users report timeouts at the top of each hour. Counter capture shows Processor Time and Processor Queue Length rise during a scheduled report. SQL evidence identifies the report workload. The team tests rescheduling and query improvements instead of replacing the server based on one CPU reading.</p>`
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
        "Windows Performance Monitoring",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked.",
        "With Windows Performance Monitoring, prefer measured, reversible changes."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Windows Performance Monitoring within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Windows Performance Monitoring fits”?",
      "options": [
        "TCP",
        "UDP",
        "SQL Server runs on Windows, so the operating system is part of the database platform."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Windows Performance Monitoring in practice”?",
      "options": [
        "Use the following as a starting point when investigating Windows Performance Monitoring.",
        "Windows services are long-running background processes.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Windows services are long-running background processes. The SQL Server service, SQL Server Agent and several auxiliary services run under configured accounts; their start mode, state and dependencies determine whether the database is reachable after a reboot.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Windows Performance Monitoring”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "NTFS permissions control who can read or change files.",
        "Use the following as a starting point when investigating Windows Performance Monitoring."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Windows Performance Monitoring. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "With Windows Performance Monitoring, prefer measured, reversible changes.",
        "TCP",
        "Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity. The default instance listens on TCP 1433; the Browser service on UDP 1434 resolves named instances; availability groups commonly use 5022.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Use the following as a starting point when investigating Windows Performance Monitoring.",
        "Windows Performance Monitoring",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Windows Performance Monitoring with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Windows Performance Monitoring means”?",
      "options": [
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "Windows Performance Monitoring is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "SQL Server runs on Windows, so the operating system is part of the database platform."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Event Viewer and Performance Monitor are the Windows-side diagnostic tools. The System and Application logs record service stops, disk errors and driver faults; Performance Monitor counter logs reveal CPU, memory and disk pressure over time.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Windows Performance Monitoring fits”?",
      "options": [
        "Windows Performance Monitoring",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "The diagram below places Windows Performance Monitoring alongside the core concepts of Windows Server and infrastructure for DBAs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Windows Performance Monitoring alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Windows Performance Monitoring in practice”?",
      "options": [
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "The following comparison captures the distinctions that matter most when working with Windows Performance Monitoring:",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Windows Performance Monitoring:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Windows Performance Monitoring”?",
      "options": [
        "The first example establishes the relevant state.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "Windows Performance Monitoring is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within Windows Server and infrastructure for DBAs.”",
      "options": [
        "Windows Performance Monitoring",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked.",
        "With Windows Performance Monitoring, prefer measured, reversible changes."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Windows Performance Monitoring within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Windows Performance Monitoring fits”?",
      "options": [
        "TCP",
        "UDP",
        "SQL Server runs on Windows, so the operating system is part of the database platform."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Windows Performance Monitoring in practice”?",
      "options": [
        "Use the following as a starting point when investigating Windows Performance Monitoring.",
        "Windows services are long-running background processes.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Windows services are long-running background processes. The SQL Server service, SQL Server Agent and several auxiliary services run under configured accounts; their start mode, state and dependencies determine whether the database is reachable after a reboot.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Windows Performance Monitoring”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "NTFS permissions control who can read or change files.",
        "Use the following as a starting point when investigating Windows Performance Monitoring."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Windows Performance Monitoring. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "With Windows Performance Monitoring, prefer measured, reversible changes.",
        "TCP",
        "Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity. The default instance listens on TCP 1433; the Browser service on UDP 1434 resolves named instances; availability groups commonly use 5022.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Use the following as a starting point when investigating Windows Performance Monitoring.",
        "Windows Performance Monitoring",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Windows Performance Monitoring with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Windows Performance Monitoring means”?",
      "options": [
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "Windows Performance Monitoring is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "SQL Server runs on Windows, so the operating system is part of the database platform."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Event Viewer and Performance Monitor are the Windows-side diagnostic tools. The System and Application logs record service stops, disk errors and driver faults; Performance Monitor counter logs reveal CPU, memory and disk pressure over time.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Windows Performance Monitoring fits”?",
      "options": [
        "Windows Performance Monitoring",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "The diagram below places Windows Performance Monitoring alongside the core concepts of Windows Server and infrastructure for DBAs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Windows Performance Monitoring alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Windows Performance Monitoring in practice”?",
      "options": [
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "The following comparison captures the distinctions that matter most when working with Windows Performance Monitoring:",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Windows Performance Monitoring:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Windows Performance Monitoring”?",
      "options": [
        "The first example establishes the relevant state.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "Windows Performance Monitoring is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within Windows Server and infrastructure for DBAs.”",
      "options": [
        "Windows Performance Monitoring",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked.",
        "With Windows Performance Monitoring, prefer measured, reversible changes."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Windows Performance Monitoring within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Windows Performance Monitoring fits”?",
      "options": [
        "TCP",
        "UDP",
        "SQL Server runs on Windows, so the operating system is part of the database platform."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Windows Performance Monitoring in practice”?",
      "options": [
        "Use the following as a starting point when investigating Windows Performance Monitoring.",
        "Windows services are long-running background processes.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Windows services are long-running background processes. The SQL Server service, SQL Server Agent and several auxiliary services run under configured accounts; their start mode, state and dependencies determine whether the database is reachable after a reboot.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Windows Performance Monitoring”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "NTFS permissions control who can read or change files.",
        "Use the following as a starting point when investigating Windows Performance Monitoring."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Windows Performance Monitoring. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "With Windows Performance Monitoring, prefer measured, reversible changes.",
        "TCP",
        "Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity. The default instance listens on TCP 1433; the Browser service on UDP 1434 resolves named instances; availability groups commonly use 5022.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Use the following as a starting point when investigating Windows Performance Monitoring.",
        "Windows Performance Monitoring",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Windows Performance Monitoring with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Windows Performance Monitoring means”?",
      "options": [
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "Windows Performance Monitoring is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "SQL Server runs on Windows, so the operating system is part of the database platform."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Event Viewer and Performance Monitor are the Windows-side diagnostic tools. The System and Application logs record service stops, disk errors and driver faults; Performance Monitor counter logs reveal CPU, memory and disk pressure over time.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Windows Performance Monitoring fits”?",
      "options": [
        "Windows Performance Monitoring",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "The diagram below places Windows Performance Monitoring alongside the core concepts of Windows Server and infrastructure for DBAs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Windows Performance Monitoring alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Windows Performance Monitoring in practice”?",
      "options": [
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "The following comparison captures the distinctions that matter most when working with Windows Performance Monitoring:",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Windows Performance Monitoring:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Windows Performance Monitoring”?",
      "options": [
        "The first example establishes the relevant state.",
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "Windows Performance Monitoring is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Windows Performance Monitoring is a fundamental concept in Windows Server and infrastructure for DBAs",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Windows Performance Monitoring improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
