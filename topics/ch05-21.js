/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch05-21.html */

window.TOPIC = {
  id: "ch05-21",
  title: "Production Installation Checklist",

  lead: "This topic covers Production Installation Checklist — a concept you will meet repeatedly when working with SQL Server installation and configuration. We build from first principles to production guidance.",

  objectives: [
    "Define what Production Installation Checklist is and where it fits",
    "Explain how Production Installation Checklist works internally",
    "Apply Production Installation Checklist correctly in a production environment",
    "Recognise the common mistakes and risks involving Production Installation Checklist",
    "Monitor and troubleshoot Production Installation Checklist with the right tools"
  ],

  sections: [
    {
      h: "What Production Installation Checklist means",
      html: `
<p>In this topic we examine <strong>Production Installation Checklist</strong> within SQL Server installation and configuration. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Memory configuration is critical. The default max server memory is effectively unlimited, which can starve the OS and co-hosted services. Set it explicitly, leaving headroom of roughly 1-4 GB for the operating system.</p>
<p>Network configuration enables the TCP/IP protocol, fixes the port and opens the firewall. Default instances use 1433; named instances use a dynamic port resolved by the Browser service on UDP 1434 unless configured otherwise.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Production Installation Checklist is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Production Installation Checklist fits",
      html: `
<p>SQL Server Agent is the scheduling engine for jobs, alerts and maintenance. It must be running and configured to start automatically in production, with an operator for notifications.</p>
<p>The diagram below places Production Installation Checklist alongside the core concepts of SQL Server installation and configuration. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Production Installation Check… layers">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="70" y="8" width="620" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="30" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Edition</text>
    <text x="380" y="50" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 1</text>
    <rect x="100" y="62" width="560" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="84" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Instance</text>
    <text x="380" y="104" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 2</text>
    <rect x="130" y="116" width="500" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="138" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Authentication</text>
    <text x="380" y="158" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 3</text>
    <rect x="160" y="170" width="440" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="192" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Service</text>
    <text x="380" y="212" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 4</text>
    <rect x="190" y="224" width="380" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="246" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Memory</text>
    <text x="380" y="266" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 5</text>
    <rect x="220" y="278" width="320" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="300" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Port</text>
    <text x="380" y="320" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 6</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Production Installation Check…</text>
  </svg>
  <div class="figcaption">Figure 1 — SQL Server installation and configuration: how Production Installation Checklist relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Production Installation Checklist in practice",
      html: `
<p>A production installation checklist turns these decisions into a repeatable, auditable process: editions, paths, accounts, memory, ports, firewall, patch level, backups and monitoring all recorded before go-live.</p>
<p>The following comparison captures the distinctions that matter most when working with Production Installation Checklist:</p>
<table>
  <tr><th>Edition</th><th>Intended use</th><th>Key limit / feature</th></tr>
  <tr><td>Express</td><td>Lightweight / learning</td><td>10 GB database size</td></tr>
  <tr><td>Developer</td><td>Non-production</td><td>Full Enterprise features</td></tr>
  <tr><td>Standard</td><td>Mid-size production</td><td>Core HA, limited scale</td></tr>
  <tr><td>Enterprise</td><td>Mission-critical</td><td>Advanced HA, scale</td></tr>
</table>
<p>Choosing an edition and version is the first installation decision. Express, Developer, Standard and Enterprise editions differ in feature set, licensing and scale limits; production choice is driven by the features the workload needs and the budget available.</p>
      `,
    },
    {
      h: "Working with Production Installation Checklist",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Production Installation Checklist. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Production Installation Checklist
SELECT SERVERPROPERTY('MachineName') AS machine,
       SERVERPROPERTY('InstanceName') AS instance,
       SERVERPROPERTY('ProductVersion') AS version,
       SERVERPROPERTY('Edition') AS edition;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Production Installation Checklist
SELECT name, value_in_use, description
FROM   sys.configurations
WHERE  name IN ('max server memory (MB)',
                'min server memory (MB)');</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Production Installation Checklist
-- Services related to this instance
SELECT servicename, status_desc, startup_type_desc
FROM   sys.dm_server_services;</code></pre>
<p>An instance is an installed copy of the Database Engine with its own system databases, configuration and set of user databases. A server can host one default instance and multiple named instances, each isolated from the others.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Authentication can be Windows-only or mixed mode. Windows authentication is preferred because credentials are managed centrally and never stored in the connection string; SQL authentication is retained for compatibility and requires a strong password policy.</p>
<table>
  <tr><th>Setting</th><th>Recommendation</th><th>Reason</th></tr>
  <tr><td>max server memory</td><td>RAM minus 1-4 GB</td><td>Leave OS headroom</td></tr>
  <tr><td>Authentication</td><td>Windows mode</td><td>Central credential control</td></tr>
  <tr><td>TCP/IP</td><td>Enabled, fixed port</td><td>Predictable connectivity</td></tr>
</table>
<p>Service accounts run the engine and Agent. Use a dedicated low-privilege domain or virtual account, grant only required rights, and never run SQL Server as a local administrator in production.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Production Installation Checklist, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Production Installation Checklist",
      html: `
<p>This section consolidates <strong>Production Installation Checklist</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>A production installation checklist turns these decisions into a repeatable, auditable process: editions, paths, accounts, memory, ports, firewall, patch level, backups and monitoring all recorded before go-live.</p>
<p>Choosing an edition and version is the first installation decision. Express, Developer, Standard and Enterprise editions differ in feature set, licensing and scale limits; production choice is driven by the features the workload needs and the budget available.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Production Installation Checklist sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Edition</th><th>Intended use</th><th>Key limit / feature</th></tr>
  <tr><td>Express</td><td>Lightweight / learning</td><td>10 GB database size</td></tr>
  <tr><td>Developer</td><td>Non-production</td><td>Full Enterprise features</td></tr>
  <tr><td>Standard</td><td>Mid-size production</td><td>Core HA, limited scale</td></tr>
  <tr><td>Enterprise</td><td>Mission-critical</td><td>Advanced HA, scale</td></tr>
</table>
<p>An instance is an installed copy of the Database Engine with its own system databases, configuration and set of user databases. A server can host one default instance and multiple named instances, each isolated from the others.</p>
<p>Use the following as a starting point when investigating Production Installation Checklist. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Production Installation Checklist
SELECT name, value_in_use, description
FROM   sys.configurations
WHERE  name IN ('max server memory (MB)',
                'min server memory (MB)');</code></pre>
<p>Authentication can be Windows-only or mixed mode. Windows authentication is preferred because credentials are managed centrally and never stored in the connection string; SQL authentication is retained for compatibility and requires a strong password policy.</p>
      `,
    }
  ],

  scenario: {
    title: "The named instance nobody could reach",
    html: `
A new named instance was installed but applications could not connect because TCP/IP was disabled and the firewall blocked the dynamic port. The DBA enabled TCP/IP, set a static port, opened that port in the firewall and confirmed with Test-NetConnection. The runbook now includes connectivity verification as an installation sign-off step.
<p><strong>The Production Installation Checklist lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "What should max server memory be on a dedicated SQL Server?",
      a: `
Total physical RAM minus headroom for the OS and any other services — commonly 1-4 GB, more if co-hosted tooling or AV is present — set explicitly rather than left at the unlimited default.
      `,
    },
    {
      q: "How do default and named instances differ?",
      a: `
A default instance is addressed by server name alone on port 1433; a named instance uses server\name and typically a dynamic port resolved by the SQL Browser service (UDP 1434).
      `,
    },
    {
      q: "Why prefer Windows authentication?",
      a: `
Credentials are managed centrally in Active Directory, support Kerberos and password policies, and are not embedded in application connection strings.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server installation and configuration.”",
      "options": [
        "Production Installation Checklist",
        "Predictable connectivity",
        "Production Installation Checklist sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Production Installation Checklist within SQL Server installation and configuration. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Installation Checklist fits”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Production Installation Checklist.",
        "SQL Server Agent is the scheduling engine for jobs, alerts and maintenance."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “SQL Server Agent is the scheduling engine for jobs, alerts and maintenance. It must be running and configured to start automatically in production, with an operator for notifications.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Installation Checklist in practice”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Production Installation Checklist:",
        "A production installation checklist turns these decisions into a repeatable, auditable process: editions, paths, accounts, memory, ports, firewall, patch level, backups and…",
        "Advanced HA, scale"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A production installation checklist turns these decisions into a repeatable, auditable process: editions, paths, accounts, memory, ports, firewall, patch level, backups and monitoring all recorded before go-live.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Installation Checklist”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Next, verify the result and capture a baseline.",
        "Production Installation Checklist"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Production Installation Checklist. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Production Installation Checklist",
        "Memory configuration is critical.",
        "Authentication can be Windows-only or mixed mode."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Authentication can be Windows-only or mixed mode. Windows authentication is preferred because credentials are managed centrally and never stored in the connection string; SQL authentication is retained for compatibility and requires a strong password policy.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Production Installation Checklist is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance…",
        "Production Installation Checklist",
        "Network configuration enables the TCP/IP protocol, fixes the port and opens the firewall."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Production Installation Checklist with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Production Installation Checklist means”?",
      "options": [
        "Memory configuration is critical.",
        "A production installation checklist turns these decisions into a repeatable, auditable process: editions, paths, accounts, memory, ports, firewall, patch level, backups and…",
        "The following comparison captures the distinctions that matter most when working with Production Installation Checklist:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Memory configuration is critical. The default max server memory is effectively unlimited, which can starve the OS and co-hosted services. Set it explicitly, leaving headroom of roughly 1-4 GB for the operating system.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Installation Checklist fits”?",
      "options": [
        "Production Installation Checklist is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance…",
        "A production installation checklist turns these decisions into a repeatable, auditable process: editions, paths, accounts, memory, ports, firewall, patch level, backups and…",
        "The diagram below places Production Installation Checklist alongside the core concepts of SQL Server installation and configuration."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Production Installation Checklist alongside the core concepts of SQL Server installation and configuration. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Installation Checklist in practice”?",
      "options": [
        "The diagram below places Production Installation Checklist alongside the core concepts of SQL Server installation and configuration.",
        "The following comparison captures the distinctions that matter most when working with Production Installation Checklist:",
        "SQL Server Agent is the scheduling engine for jobs, alerts and maintenance."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Production Installation Checklist:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Installation Checklist”?",
      "options": [
        "The first example establishes the relevant state.",
        "The diagram below places Production Installation Checklist alongside the core concepts of SQL Server installation and configuration.",
        "A production installation checklist turns these decisions into a repeatable, auditable process: editions, paths, accounts, memory, ports, firewall, patch level, backups and…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server installation and configuration.”",
      "options": [
        "Production Installation Checklist",
        "Predictable connectivity",
        "Production Installation Checklist sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Production Installation Checklist within SQL Server installation and configuration. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Installation Checklist fits”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Production Installation Checklist.",
        "SQL Server Agent is the scheduling engine for jobs, alerts and maintenance."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “SQL Server Agent is the scheduling engine for jobs, alerts and maintenance. It must be running and configured to start automatically in production, with an operator for notifications.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Installation Checklist in practice”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Production Installation Checklist:",
        "A production installation checklist turns these decisions into a repeatable, auditable process: editions, paths, accounts, memory, ports, firewall, patch level, backups and…",
        "Advanced HA, scale"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A production installation checklist turns these decisions into a repeatable, auditable process: editions, paths, accounts, memory, ports, firewall, patch level, backups and monitoring all recorded before go-live.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Installation Checklist”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Next, verify the result and capture a baseline.",
        "Production Installation Checklist"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Production Installation Checklist. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Production Installation Checklist",
        "Memory configuration is critical.",
        "Authentication can be Windows-only or mixed mode."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Authentication can be Windows-only or mixed mode. Windows authentication is preferred because credentials are managed centrally and never stored in the connection string; SQL authentication is retained for compatibility and requires a strong password policy.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Production Installation Checklist is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance…",
        "Production Installation Checklist",
        "Network configuration enables the TCP/IP protocol, fixes the port and opens the firewall."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Production Installation Checklist with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Production Installation Checklist means”?",
      "options": [
        "Memory configuration is critical.",
        "A production installation checklist turns these decisions into a repeatable, auditable process: editions, paths, accounts, memory, ports, firewall, patch level, backups and…",
        "The following comparison captures the distinctions that matter most when working with Production Installation Checklist:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Memory configuration is critical. The default max server memory is effectively unlimited, which can starve the OS and co-hosted services. Set it explicitly, leaving headroom of roughly 1-4 GB for the operating system.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Installation Checklist fits”?",
      "options": [
        "Production Installation Checklist is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance…",
        "A production installation checklist turns these decisions into a repeatable, auditable process: editions, paths, accounts, memory, ports, firewall, patch level, backups and…",
        "The diagram below places Production Installation Checklist alongside the core concepts of SQL Server installation and configuration."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Production Installation Checklist alongside the core concepts of SQL Server installation and configuration. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Installation Checklist in practice”?",
      "options": [
        "The diagram below places Production Installation Checklist alongside the core concepts of SQL Server installation and configuration.",
        "The following comparison captures the distinctions that matter most when working with Production Installation Checklist:",
        "SQL Server Agent is the scheduling engine for jobs, alerts and maintenance."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Production Installation Checklist:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Installation Checklist”?",
      "options": [
        "The first example establishes the relevant state.",
        "The diagram below places Production Installation Checklist alongside the core concepts of SQL Server installation and configuration.",
        "A production installation checklist turns these decisions into a repeatable, auditable process: editions, paths, accounts, memory, ports, firewall, patch level, backups and…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server installation and configuration.”",
      "options": [
        "Production Installation Checklist",
        "Predictable connectivity",
        "Production Installation Checklist sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Production Installation Checklist within SQL Server installation and configuration. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Installation Checklist fits”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Production Installation Checklist.",
        "SQL Server Agent is the scheduling engine for jobs, alerts and maintenance."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “SQL Server Agent is the scheduling engine for jobs, alerts and maintenance. It must be running and configured to start automatically in production, with an operator for notifications.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Installation Checklist in practice”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Production Installation Checklist:",
        "A production installation checklist turns these decisions into a repeatable, auditable process: editions, paths, accounts, memory, ports, firewall, patch level, backups and…",
        "Advanced HA, scale"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A production installation checklist turns these decisions into a repeatable, auditable process: editions, paths, accounts, memory, ports, firewall, patch level, backups and monitoring all recorded before go-live.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Installation Checklist”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Next, verify the result and capture a baseline.",
        "Production Installation Checklist"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Production Installation Checklist. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Production Installation Checklist",
        "Memory configuration is critical.",
        "Authentication can be Windows-only or mixed mode."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Authentication can be Windows-only or mixed mode. Windows authentication is preferred because credentials are managed centrally and never stored in the connection string; SQL authentication is retained for compatibility and requires a strong password policy.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Production Installation Checklist is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance…",
        "Production Installation Checklist",
        "Network configuration enables the TCP/IP protocol, fixes the port and opens the firewall."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Production Installation Checklist with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Production Installation Checklist means”?",
      "options": [
        "Memory configuration is critical.",
        "A production installation checklist turns these decisions into a repeatable, auditable process: editions, paths, accounts, memory, ports, firewall, patch level, backups and…",
        "The following comparison captures the distinctions that matter most when working with Production Installation Checklist:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Memory configuration is critical. The default max server memory is effectively unlimited, which can starve the OS and co-hosted services. Set it explicitly, leaving headroom of roughly 1-4 GB for the operating system.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Installation Checklist fits”?",
      "options": [
        "Production Installation Checklist is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance…",
        "A production installation checklist turns these decisions into a repeatable, auditable process: editions, paths, accounts, memory, ports, firewall, patch level, backups and…",
        "The diagram below places Production Installation Checklist alongside the core concepts of SQL Server installation and configuration."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Production Installation Checklist alongside the core concepts of SQL Server installation and configuration. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Installation Checklist in practice”?",
      "options": [
        "The diagram below places Production Installation Checklist alongside the core concepts of SQL Server installation and configuration.",
        "The following comparison captures the distinctions that matter most when working with Production Installation Checklist:",
        "SQL Server Agent is the scheduling engine for jobs, alerts and maintenance."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Production Installation Checklist:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Installation Checklist”?",
      "options": [
        "The first example establishes the relevant state.",
        "The diagram below places Production Installation Checklist alongside the core concepts of SQL Server installation and configuration.",
        "A production installation checklist turns these decisions into a repeatable, auditable process: editions, paths, accounts, memory, ports, firewall, patch level, backups and…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Production Installation Checklist is a fundamental concept in SQL Server installation and configuration",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Production Installation Checklist improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
