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
    {
      h: "What Storage and Network Troubleshooting means",
      html: `
<p>In this topic we examine <strong>Storage and Network Troubleshooting</strong> within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.</p>
<p>Windows services are long-running background processes. The SQL Server service, SQL Server Agent and several auxiliary services run under configured accounts; their start mode, state and dependencies determine whether the database is reachable after a reboot.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Storage and Network Troubleshooting is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Storage and Network Troubleshooting fits",
      html: `
<p>Service accounts are identities with rights. The principle of least privilege applies: grant only the permissions the service needs (log on as a service, file access to data folders, perhaps domain rights for backups or Kerberos), no more.</p>
<p>The diagram below places Storage and Network Troubleshooting alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Storage and Network Troublesh… flow">
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
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Storage and Network Troublesh…</text>
  </svg>
  <div class="figcaption">Figure 1 — Windows Server and infrastructure for DBAs: how Storage and Network Troubleshooting relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Storage and Network Troubleshooting in practice",
      html: `
<p>NTFS permissions control who can read or change files. The service account needs modify rights on data, log and backup folders. Misconfigured permissions surface as errors 5 (access denied) or failures to create backups and files.</p>
<p>The following comparison captures the distinctions that matter most when working with Storage and Network Troubleshooting:</p>
<table>
  <tr><th>Service</th><th>Purpose</th><th>Typical start mode</th></tr>
  <tr><td>MSSQLSERVER / MSSQL$INST</td><td>Database Engine</td><td>Automatic</td></tr>
  <tr><td>SQLSERVERAGENT</td><td>Jobs, alerts, schedules</td><td>Automatic</td></tr>
  <tr><td>SQLBrowser</td><td>Named-instance resolution</td><td>Automatic (named instances)</td></tr>
</table>
<p>Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity. The default instance listens on TCP 1433; the Browser service on UDP 1434 resolves named instances; availability groups commonly use 5022.</p>
      `,
    },
    {
      h: "Working with Storage and Network Troubleshooting",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Storage and Network Troubleshooting. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-powershell">-- Storage and Network Troubleshooting
Get-Service -Name 'MSSQL*','SQLSERVERAGENT' |
  Select-Object Name, DisplayName, Status, StartType |
  Format-Table -AutoSize</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-powershell">-- Storage and Network Troubleshooting
Test-NetConnection -ComputerName db01 -Port 1433 |
  Select-Object ComputerName, RemotePort, TcpTestSucceeded</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-powershell">-- Storage and Network Troubleshooting
Get-Volume | Select-Object DriveLetter, FileSystemLabel,
  @{n='FreeGB';e={[math]::Round($_.SizeRemaining/1GB,1)}},
  @{n='SizeGB';e={[math]::Round($_.Size/1GB,1)}} |
  Format-Table -AutoSize</code></pre>
<p>The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked. Always verify service state, listener state and network path in that order.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Event Viewer and Performance Monitor are the Windows-side diagnostic tools. The System and Application logs record service stops, disk errors and driver faults; Performance Monitor counter logs reveal CPU, memory and disk pressure over time.</p>
<table>
  <tr><th>Port</th><th>Used by</th><th>Protocol</th></tr>
  <tr><td>1433</td><td>Default instance / listener</td><td>TCP</td></tr>
  <tr><td>1434</td><td>SQL Server Browser</td><td>UDP</td></tr>
  <tr><td>5022</td><td>Availability group endpoints</td><td>TCP</td></tr>
</table>
<p>Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Storage and Network Troubleshooting, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Storage and Network Troubleshooting",
      html: `
<p>This section consolidates <strong>Storage and Network Troubleshooting</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>NTFS permissions control who can read or change files. The service account needs modify rights on data, log and backup folders. Misconfigured permissions surface as errors 5 (access denied) or failures to create backups and files.</p>
<p>Networking fundamentals — IP addresses, subnets, DNS, ports and firewalls — govern connectivity. The default instance listens on TCP 1433; the Browser service on UDP 1434 resolves named instances; availability groups commonly use 5022.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Storage and Network Troubleshooting sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Service</th><th>Purpose</th><th>Typical start mode</th></tr>
  <tr><td>MSSQLSERVER / MSSQL$INST</td><td>Database Engine</td><td>Automatic</td></tr>
  <tr><td>SQLSERVERAGENT</td><td>Jobs, alerts, schedules</td><td>Automatic</td></tr>
  <tr><td>SQLBrowser</td><td>Named-instance resolution</td><td>Automatic (named instances)</td></tr>
</table>
<p>The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked. Always verify service state, listener state and network path in that order.</p>
<p>Use the following as a starting point when investigating Storage and Network Troubleshooting. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-powershell"># Storage and Network Troubleshooting
Get-Service -Name 'MSSQL*','SQLSERVERAGENT' |
  Select-Object Name, DisplayName, Status, StartType |
  Format-Table -AutoSize</code></pre>
<p>Event Viewer and Performance Monitor are the Windows-side diagnostic tools. The System and Application logs record service stops, disk errors and driver faults; Performance Monitor counter logs reveal CPU, memory and disk pressure over time.</p>
      `,
    }
  ],

  scenario: {
    title: "The application that 'could not connect' after patching",
    html: `
After a Windows patch cycle the app reported SQL Server unavailable. The engine was healthy — Get-Service showed it running — but the firewall profile had switched from Domain to Public and blocked TCP 1433. Resetting the profile and scoping the rule to the app subnet restored connectivity. The prevention was a scripted firewall rule bound to the Domain profile.
<p><strong>The Storage and Network Troubleshooting lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
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
