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
    {
      h: "What Remote Desktop (RDP) means",
      html: `
<p>In this topic we examine <strong>Remote Desktop (RDP)</strong> within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity. The default instance listens on TCP 1433; the Browser service on UDP 1434 resolves named instances; availability groups commonly use 5022.</p>
<p>The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked. Always verify service state, listener state and network path in that order.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Remote Desktop (RDP) is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Remote Desktop (RDP) fits",
      html: `
<p>Event Viewer and Performance Monitor are the Windows-side diagnostic tools. The System and Application logs record service stops, disk errors and driver faults; Performance Monitor counter logs reveal CPU, memory and disk pressure over time.</p>
<p>The diagram below places Remote Desktop (RDP) alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Remote Desktop (RDP) concept map">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="280" y="140" width="200" height="60" rx="9" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="175" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Remote Desktop (RDP)</text>
    <rect x="24" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Service</text>
    <text x="124" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 1</text>
    <rect x="536" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Account</text>
    <text x="636" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 2</text>
    <rect x="24" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Permission</text>
    <text x="124" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 3</text>
    <rect x="536" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Network</text>
    <text x="636" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 4</text>
    <rect x="24" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Port</text>
    <text x="124" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 5</text>
    <rect x="536" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Volume</text>
    <text x="636" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 6</text>
    <line x1="380" y1="170" x2="124" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
  </svg>
  <div class="figcaption">Figure 1 — Windows Server and infrastructure for DBAs: how Remote Desktop (RDP) relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Remote Desktop (RDP) in practice",
      html: `
<p>Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.</p>
<p>The following comparison captures the distinctions that matter most when working with Remote Desktop (RDP):</p>
<table>
  <tr><th>Service</th><th>Purpose</th><th>Typical start mode</th></tr>
  <tr><td>MSSQLSERVER / MSSQL$INST</td><td>Database Engine</td><td>Automatic</td></tr>
  <tr><td>SQLSERVERAGENT</td><td>Jobs, alerts, schedules</td><td>Automatic</td></tr>
  <tr><td>SQLBrowser</td><td>Named-instance resolution</td><td>Automatic (named instances)</td></tr>
</table>
<p>SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.</p>
      `,
    },
    {
      h: "Working with Remote Desktop (RDP)",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Remote Desktop (RDP). Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-powershell">-- Remote Desktop (RDP)
Get-Service -Name 'MSSQL*','SQLSERVERAGENT' |
  Select-Object Name, DisplayName, Status, StartType |
  Format-Table -AutoSize</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-powershell">-- Remote Desktop (RDP)
Test-NetConnection -ComputerName db01 -Port 1433 |
  Select-Object ComputerName, RemotePort, TcpTestSucceeded</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-powershell">-- Remote Desktop (RDP)
Get-Volume | Select-Object DriveLetter, FileSystemLabel,
  @{n='FreeGB';e={[math]::Round($_.SizeRemaining/1GB,1)}},
  @{n='SizeGB';e={[math]::Round($_.Size/1GB,1)}} |
  Format-Table -AutoSize</code></pre>
<p>Windows services are long-running background processes. The SQL Server service, SQL Server Agent and several auxiliary services run under configured accounts; their start mode, state and dependencies determine whether the database is reachable after a reboot.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Service accounts are identities with rights. The principle of least privilege applies: grant only the permissions the service needs (log on as a service, file access to data folders, perhaps domain rights for backups or Kerberos), no more.</p>
<table>
  <tr><th>Port</th><th>Used by</th><th>Protocol</th></tr>
  <tr><td>1433</td><td>Default instance / listener</td><td>TCP</td></tr>
  <tr><td>1434</td><td>SQL Server Browser</td><td>UDP</td></tr>
  <tr><td>5022</td><td>Availability group endpoints</td><td>TCP</td></tr>
</table>
<p>NTFS permissions control who can read or change files. The service account needs modify rights on data, log and backup folders. Misconfigured permissions surface as errors 5 (access denied) or failures to create backups and files.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Remote Desktop (RDP), prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Remote Desktop (RDP)",
      html: `
<p>This section consolidates <strong>Remote Desktop (RDP)</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.</p>
<p>SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Remote Desktop (RDP) sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Service</th><th>Purpose</th><th>Typical start mode</th></tr>
  <tr><td>MSSQLSERVER / MSSQL$INST</td><td>Database Engine</td><td>Automatic</td></tr>
  <tr><td>SQLSERVERAGENT</td><td>Jobs, alerts, schedules</td><td>Automatic</td></tr>
  <tr><td>SQLBrowser</td><td>Named-instance resolution</td><td>Automatic (named instances)</td></tr>
</table>
<p>Windows services are long-running background processes. The SQL Server service, SQL Server Agent and several auxiliary services run under configured accounts; their start mode, state and dependencies determine whether the database is reachable after a reboot.</p>
<p>Use the following as a starting point when investigating Remote Desktop (RDP). Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-powershell"># Remote Desktop (RDP)
Get-Volume | Select-Object DriveLetter, FileSystemLabel,
  @{n='FreeGB';e={[math]::Round($_.SizeRemaining/1GB,1)}},
  @{n='SizeGB';e={[math]::Round($_.Size/1GB,1)}} |
  Format-Table -AutoSize</code></pre>
<p>Service accounts are identities with rights. The principle of least privilege applies: grant only the permissions the service needs (log on as a service, file access to data folders, perhaps domain rights for backups or Kerberos), no more.</p>
      `,
    }
  ],

  scenario: {
    title: "The application that 'could not connect' after patching",
    html: `
After a Windows patch cycle the app reported SQL Server unavailable. The engine was healthy — Get-Service showed it running — but the firewall profile had switched from Domain to Public and blocked TCP 1433. Resetting the profile and scoping the rule to the app subnet restored connectivity. The prevention was a scripted firewall rule bound to the Domain profile.
<p><strong>The Remote Desktop (RDP) lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "What order do you check when an app cannot connect?",
      a: `
Service state, then listener/protocol state, then network path (ping, Test-NetConnection to the port), then firewall, then SQL-level errors and logins — from outside in.
      `,
    },
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
