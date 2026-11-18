/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch03-12.html */

window.TOPIC = {
  id: "ch03-12",
  title: "Firewall Rules",

  lead: "This topic covers Firewall Rules — a concept you will meet repeatedly when working with Windows Server and infrastructure for DBAs. We build from first principles to production guidance.",

  objectives: [
    "Define what Firewall Rules is and where it fits",
    "Explain how Firewall Rules works internally",
    "Apply Firewall Rules correctly in a production environment",
    "Recognise the common mistakes and risks involving Firewall Rules",
    "Monitor and troubleshoot Firewall Rules with the right tools"
  ],

  sections: [
    {
      h: "Windows Defender Firewall basics",
      html: `
<p>Windows Defender Firewall applies inbound and outbound rules using profiles such as Domain, Private, and Public. A rule can specify direction, protocol, port, address scope, program, and profile. A running SQL Server service can still be unreachable if a firewall or network control blocks its listener.</p>
<p>For SQL Server, determine the actual TCP port first. Port 1433 is common for the default instance but can be changed; named instances may use dynamic ports. UDP 1434 is needed only for SQL Server Browser discovery scenarios.</p>
<table>
  <tr><th>Rule property</th><th>Example decision</th></tr>
  <tr><td>Direction / protocol</td><td>Inbound TCP for a Database Engine listener</td></tr>
  <tr><td>Local port</td><td>The port configured for this instance</td></tr>
  <tr><td>Remote scope</td><td>Only application or administration subnets that need access</td></tr>
  <tr><td>Profile</td><td>Profiles appropriate to the managed server network</td></tr>
</table>
<div class="figure"><svg viewBox="0 0 760 160" role="img" aria-label="Troubleshooting evidence flow"><rect x="20" y="40" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--border)"/><text x="100" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Evidence</text><rect x="300" y="40" width="160" height="70" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="380" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Diagnosis</text><rect x="580" y="40" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--border)"/><text x="660" y="82" text-anchor="middle" fill="var(--text)" font-size="14">Resolution</text></svg><div class="figcaption">Figure 1 - Separate evidence, diagnosis, and remediation.</div></div>
`
    },
    {
      h: "Create a narrow inbound rule",
      html: `
<p>Use a documented, narrowly scoped rule and coordinate it with network security policy. For example, this rule permits an application subnet to reach a known listener on a domain-profile server:</p>
<pre><code class="language-powershell">New-NetFirewallRule -DisplayName 'SQL Engine from app subnet' -Direction Inbound -Protocol TCP -LocalPort 51433 -RemoteAddress 10.20.30.0/24 -Profile Domain -Action Allow</code></pre>
<p>Replace the example port, subnet, and profile with values approved for the environment. Confirm that Group Policy or another management layer won't replace the local rule.</p>
`
    },
    {
      h: "Diagnose blocked connections",
      html: `
<ol>
  <li>Confirm the service is running and SQL Server is listening on the expected address and port.</li>
  <li>Test the port from a client in the affected network.</li>
  <li>Inspect the active firewall profile and matching inbound rules on the SQL Server host.</li>
  <li>Check upstream firewalls, routing, and security groups when the host rule permits the traffic.</li>
  <li>After a change, retest from the client and remove temporary rules that are no longer required.</li>
</ol>
<p>Don't disable the firewall or create broad allow rules as a troubleshooting shortcut. A successful port test establishes network reachability, not SQL authentication or application health.</p>
`
    },
    {
      h: "SQL Server-specific ports",
      html: `
<p>Open only the endpoints the deployment uses: the Database Engine listener, Browser discovery if needed, and separately configured Availability Group or other feature endpoints. Browser uses UDP 1434; an Availability Group endpoint uses its configured TCP port. Document both directions when replicas or backup systems communicate across hosts.</p>
<p>Scope remote addresses to known clients and management networks. Changing a port may reduce noise but isn't a substitute for access controls, authentication, or patching.</p>
`
    }
  ],
  scenario: {
    title: 'A firewall rule blocks an application subnet',
    html: `<p>The SQL Engine is running and listening on a fixed port, but one application subnet cannot connect. A port test confirms the host firewall rule is scoped to the wrong remote address range. The rule is corrected to the approved subnet and profile; a repeat test confirms recovery.</p>`
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
        "Firewall Rules",
        "Next, verify the result and capture a baseline.",
        "SQL Server runs on Windows, so the operating system is part of the database platform."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Firewall Rules within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Firewall Rules fits”?",
      "options": [
        "Windows services are long-running background processes.",
        "Service accounts are identities with rights.",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked. Always verify service state, listener state and network path in that order.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Firewall Rules in practice”?",
      "options": [
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "UDP"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Event Viewer and Performance Monitor are the Windows-side diagnostic tools. The System and Application logs record service stops, disk errors and driver faults; Performance Monitor counter logs reveal CPU, memory and disk pressure over time.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Firewall Rules”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "UDP",
        "Firewall Rules sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Firewall Rules. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Firewall Rules.",
        "Windows services are long-running background processes."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Windows services are long-running background processes. The SQL Server service, SQL Server Agent and several auxiliary services run under configured accounts; their start mode, state and dependencies determine whether the database is reachable after a reboot.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "UDP",
        "Firewall Rules",
        "TCP"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Firewall Rules with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Firewall Rules means”?",
      "options": [
        "NTFS permissions control who can read or change files.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Firewall Rules."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “NTFS permissions control who can read or change files. The service account needs modify rights on data, log and backup folders. Misconfigured permissions surface as errors 5 (access denied) or failures to create backups and files.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Firewall Rules fits”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Firewall Rules.",
        "The diagram below places Firewall Rules alongside the core concepts of Windows Server and infrastructure for DBAs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Firewall Rules alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Firewall Rules in practice”?",
      "options": [
        "Automatic (named instances)",
        "The following comparison captures the distinctions that matter most when working with Firewall Rules:",
        "Automatic"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Firewall Rules:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Firewall Rules”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Firewall Rules"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within Windows Server and infrastructure for DBAs.”",
      "options": [
        "Firewall Rules",
        "Next, verify the result and capture a baseline.",
        "SQL Server runs on Windows, so the operating system is part of the database platform."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Firewall Rules within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Firewall Rules fits”?",
      "options": [
        "Windows services are long-running background processes.",
        "Service accounts are identities with rights.",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked. Always verify service state, listener state and network path in that order.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Firewall Rules in practice”?",
      "options": [
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "UDP"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Event Viewer and Performance Monitor are the Windows-side diagnostic tools. The System and Application logs record service stops, disk errors and driver faults; Performance Monitor counter logs reveal CPU, memory and disk pressure over time.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Firewall Rules”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "UDP",
        "Firewall Rules sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Firewall Rules. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Firewall Rules.",
        "Windows services are long-running background processes."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Windows services are long-running background processes. The SQL Server service, SQL Server Agent and several auxiliary services run under configured accounts; their start mode, state and dependencies determine whether the database is reachable after a reboot.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "UDP",
        "Firewall Rules",
        "TCP"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Firewall Rules with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Firewall Rules means”?",
      "options": [
        "NTFS permissions control who can read or change files.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Firewall Rules."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “NTFS permissions control who can read or change files. The service account needs modify rights on data, log and backup folders. Misconfigured permissions surface as errors 5 (access denied) or failures to create backups and files.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Firewall Rules fits”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Firewall Rules.",
        "The diagram below places Firewall Rules alongside the core concepts of Windows Server and infrastructure for DBAs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Firewall Rules alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Firewall Rules in practice”?",
      "options": [
        "Automatic (named instances)",
        "The following comparison captures the distinctions that matter most when working with Firewall Rules:",
        "Automatic"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Firewall Rules:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Firewall Rules”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Firewall Rules"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within Windows Server and infrastructure for DBAs.”",
      "options": [
        "Firewall Rules",
        "Next, verify the result and capture a baseline.",
        "SQL Server runs on Windows, so the operating system is part of the database platform."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Firewall Rules within Windows Server and infrastructure for DBAs. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Firewall Rules fits”?",
      "options": [
        "Windows services are long-running background processes.",
        "Service accounts are identities with rights.",
        "The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The firewall is a common cause of 'SQL Server is down' reports when in fact the service is healthy and traffic is simply blocked. Always verify service state, listener state and network path in that order.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Firewall Rules in practice”?",
      "options": [
        "Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.",
        "Event Viewer and Performance Monitor are the Windows-side diagnostic tools.",
        "UDP"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Event Viewer and Performance Monitor are the Windows-side diagnostic tools. The System and Application logs record service stops, disk errors and driver faults; Performance Monitor counter logs reveal CPU, memory and disk pressure over time.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Firewall Rules”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "UDP",
        "Firewall Rules sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Firewall Rules. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Firewall Rules.",
        "Windows services are long-running background processes."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Windows services are long-running background processes. The SQL Server service, SQL Server Agent and several auxiliary services run under configured accounts; their start mode, state and dependencies determine whether the database is reachable after a reboot.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "UDP",
        "Firewall Rules",
        "TCP"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Firewall Rules with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Firewall Rules means”?",
      "options": [
        "NTFS permissions control who can read or change files.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Firewall Rules."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “NTFS permissions control who can read or change files. The service account needs modify rights on data, log and backup folders. Misconfigured permissions surface as errors 5 (access denied) or failures to create backups and files.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Firewall Rules fits”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Firewall Rules.",
        "The diagram below places Firewall Rules alongside the core concepts of Windows Server and infrastructure for DBAs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Firewall Rules alongside the core concepts of Windows Server and infrastructure for DBAs. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Firewall Rules in practice”?",
      "options": [
        "Automatic (named instances)",
        "The following comparison captures the distinctions that matter most when working with Firewall Rules:",
        "Automatic"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Firewall Rules:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Firewall Rules”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Firewall Rules"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Firewall Rules is a fundamental concept in Windows Server and infrastructure for DBAs",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Firewall Rules improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
