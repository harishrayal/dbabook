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
    {
      h: "What Event Viewer means",
      html: `
<p>In this topic we examine <strong>Event Viewer</strong> within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked. Always verify service state, listener state and network path in that order.</p>
<p>Event Viewer and Performance Monitor are the Windows-side diagnostic tools. The System and Application logs record service stops, disk errors and driver faults; Performance Monitor counter logs reveal CPU, memory and disk pressure over time.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Event Viewer is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Event Viewer fits",
      html: `
<p>Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.</p>
<p>The diagram below places Event Viewer alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Event Viewer flow">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="230" y="12" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="39" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Service</text>
    <rect x="230" y="66" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="93" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Account</text>
    <rect x="230" y="120" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="147" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Permission</text>
    <rect x="230" y="174" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="201" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Network</text>
    <rect x="230" y="228" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="255" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Port</text>
    <rect x="230" y="282" width="300" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="309" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">6. Volume</text>
    <line x1="380" y1="56" x2="380" y2="66" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="110" x2="380" y2="120" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="164" x2="380" y2="174" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="218" x2="380" y2="228" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="272" x2="380" y2="282" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Event Viewer</text>
  </svg>
  <div class="figcaption">Figure 1 — Windows Server and infrastructure for DBAs: how Event Viewer relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Event Viewer in practice",
      html: `
<p>SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.</p>
<p>The following comparison captures the distinctions that matter most when working with Event Viewer:</p>
<table>
  <tr><th>Service</th><th>Purpose</th><th>Typical start mode</th></tr>
  <tr><td>MSSQLSERVER / MSSQL$INST</td><td>Database Engine</td><td>Automatic</td></tr>
  <tr><td>SQLSERVERAGENT</td><td>Jobs, alerts, schedules</td><td>Automatic</td></tr>
  <tr><td>SQLBrowser</td><td>Named-instance resolution</td><td>Automatic (named instances)</td></tr>
</table>
<p>Windows services are long-running background processes. The SQL Server service, SQL Server Agent and several auxiliary services run under configured accounts; their start mode, state and dependencies determine whether the database is reachable after a reboot.</p>
      `,
    },
    {
      h: "Working with Event Viewer",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Event Viewer. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-powershell">-- Event Viewer
Get-Service -Name 'MSSQL*','SQLSERVERAGENT' |
  Select-Object Name, DisplayName, Status, StartType |
  Format-Table -AutoSize</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-powershell">-- Event Viewer
Test-NetConnection -ComputerName db01 -Port 1433 |
  Select-Object ComputerName, RemotePort, TcpTestSucceeded</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-powershell">-- Event Viewer
Get-Volume | Select-Object DriveLetter, FileSystemLabel,
  @{n='FreeGB';e={[math]::Round($_.SizeRemaining/1GB,1)}},
  @{n='SizeGB';e={[math]::Round($_.Size/1GB,1)}} |
  Format-Table -AutoSize</code></pre>
<p>Service accounts are identities with rights. The principle of least privilege applies: grant only the permissions the service needs (log on as a service, file access to data folders, perhaps domain rights for backups or Kerberos), no more.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>NTFS permissions control who can read or change files. The service account needs modify rights on data, log and backup folders. Misconfigured permissions surface as errors 5 (access denied) or failures to create backups and files.</p>
<table>
  <tr><th>Port</th><th>Used by</th><th>Protocol</th></tr>
  <tr><td>1433</td><td>Default instance / listener</td><td>TCP</td></tr>
  <tr><td>1434</td><td>SQL Server Browser</td><td>UDP</td></tr>
  <tr><td>5022</td><td>Availability group endpoints</td><td>TCP</td></tr>
</table>
<p>Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity. The default instance listens on TCP 1433; the Browser service on UDP 1434 resolves named instances; availability groups commonly use 5022.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Event Viewer, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Event Viewer",
      html: `
<p>This section consolidates <strong>Event Viewer</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.</p>
<p>Windows services are long-running background processes. The SQL Server service, SQL Server Agent and several auxiliary services run under configured accounts; their start mode, state and dependencies determine whether the database is reachable after a reboot.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Event Viewer sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Port</th><th>Used by</th><th>Protocol</th></tr>
  <tr><td>1433</td><td>Default instance / listener</td><td>TCP</td></tr>
  <tr><td>1434</td><td>SQL Server Browser</td><td>UDP</td></tr>
  <tr><td>5022</td><td>Availability group endpoints</td><td>TCP</td></tr>
</table>
<p>Service accounts are identities with rights. The principle of least privilege applies: grant only the permissions the service needs (log on as a service, file access to data folders, perhaps domain rights for backups or Kerberos), no more.</p>
<p>Use the following as a starting point when investigating Event Viewer. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-powershell"># Event Viewer
Get-Service -Name 'MSSQL*','SQLSERVERAGENT' |
  Select-Object Name, DisplayName, Status, StartType |
  Format-Table -AutoSize</code></pre>
<p>NTFS permissions control who can read or change files. The service account needs modify rights on data, log and backup folders. Misconfigured permissions surface as errors 5 (access denied) or failures to create backups and files.</p>
      `,
    }
  ],

  scenario: {
    title: "Access denied on a restored database",
    html: `
A restore succeeded but the service account could not write to the new data folder, producing error 5 on growth. icacls showed the restored folder inherited restrictive rights. Granting the service account modify permission on the data and log folders resolved it; the runbook was updated to include permission checks after every restore path change.
<p><strong>The Event Viewer lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "Why does the SQL Server service account need least privilege?",
      a: `
It limits the blast radius if the service is compromised and avoids unnecessary domain rights; grant only log-on-as-service, file access to data folders and any rights backups or Kerberos genuinely need.
      `,
    },
    {
      q: "Where do you look for a service that keeps stopping?",
      a: `
Windows Event Viewer System and Application logs, SQL Server error log, and the service's dependencies and account — often a password expiry or a failed dependency is the cause.
      `,
    },
    {
      q: "What order do you check when an app cannot connect?",
      a: `
Service state, then listener/protocol state, then network path (ping, Test-NetConnection to the port), then firewall, then SQL-level errors and logins — from outside in.
      `,
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
