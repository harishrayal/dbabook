/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch05-20.html */

window.TOPIC = {
  id: "ch05-20",
  title: "Post-Installation Configuration",

  lead: "Understanding Post-Installation Configuration is essential for anyone responsible for SQL Server installation and configuration. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what Post-Installation Configuration is and where it fits",
    "Explain how Post-Installation Configuration works internally",
    "Apply Post-Installation Configuration correctly in a production environment",
    "Recognise the common mistakes and risks involving Post-Installation Configuration",
    "Monitor and troubleshoot Post-Installation Configuration with the right tools"
  ],

  sections: [
    {
      h: "What Post-Installation Configuration means",
      html: `
<p>In this topic we examine <strong>Post-Installation Configuration</strong> within SQL Server installation and configuration. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Service accounts run the engine and Agent. Use a dedicated low-privilege domain or virtual account, grant only required rights, and never run SQL Server as a local administrator in production.</p>
<p>Memory configuration is critical. The default max server memory is effectively unlimited, which can starve the OS and co-hosted services. Set it explicitly, leaving headroom of roughly 1-4 GB for the operating system.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Post-Installation Configuration is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Post-Installation Configuration fits",
      html: `
<p>Network configuration enables the TCP/IP protocol, fixes the port and opens the firewall. Default instances use 1433; named instances use a dynamic port resolved by the Browser service on UDP 1434 unless configured otherwise.</p>
<p>The diagram below places Post-Installation Configuration alongside the core concepts of SQL Server installation and configuration. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Post-Installation Configurati… flow">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="230" y="12" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="39" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Edition</text>
    <rect x="230" y="66" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="93" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Instance</text>
    <rect x="230" y="120" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="147" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Authentication</text>
    <rect x="230" y="174" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="201" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Service</text>
    <rect x="230" y="228" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="255" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Memory</text>
    <rect x="230" y="282" width="300" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="309" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">6. Port</text>
    <line x1="380" y1="56" x2="380" y2="66" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="110" x2="380" y2="120" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="164" x2="380" y2="174" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="218" x2="380" y2="228" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="272" x2="380" y2="282" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Post-Installation Configurati…</text>
  </svg>
  <div class="figcaption">Figure 1 — SQL Server installation and configuration: how Post-Installation Configuration relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Post-Installation Configuration in practice",
      html: `
<p>SQL Server Agent is the scheduling engine for jobs, alerts and maintenance. It must be running and configured to start automatically in production, with an operator for notifications.</p>
<p>The following comparison captures the distinctions that matter most when working with Post-Installation Configuration:</p>
<table>
  <tr><th>Edition</th><th>Intended use</th><th>Key limit / feature</th></tr>
  <tr><td>Express</td><td>Lightweight / learning</td><td>10 GB database size</td></tr>
  <tr><td>Developer</td><td>Non-production</td><td>Full Enterprise features</td></tr>
  <tr><td>Standard</td><td>Mid-size production</td><td>Core HA, limited scale</td></tr>
  <tr><td>Enterprise</td><td>Mission-critical</td><td>Advanced HA, scale</td></tr>
</table>
<p>A production installation checklist turns these decisions into a repeatable, auditable process: editions, paths, accounts, memory, ports, firewall, patch level, backups and monitoring all recorded before go-live.</p>
      `,
    },
    {
      h: "Working with Post-Installation Configuration",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Post-Installation Configuration. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Post-Installation Configuration
SELECT SERVERPROPERTY('MachineName') AS machine,
       SERVERPROPERTY('InstanceName') AS instance,
       SERVERPROPERTY('ProductVersion') AS version,
       SERVERPROPERTY('Edition') AS edition;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Post-Installation Configuration
SELECT name, value_in_use, description
FROM   sys.configurations
WHERE  name IN ('max server memory (MB)',
                'min server memory (MB)');</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Post-Installation Configuration
-- Services related to this instance
SELECT servicename, status_desc, startup_type_desc
FROM   sys.dm_server_services;</code></pre>
<p>Choosing an edition and version is the first installation decision. Express, Developer, Standard and Enterprise editions differ in feature set, licensing and scale limits; production choice is driven by the features the workload needs and the budget available.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>An instance is an installed copy of the Database Engine with its own system databases, configuration and set of user databases. A server can host one default instance and multiple named instances, each isolated from the others.</p>
<table>
  <tr><th>Setting</th><th>Recommendation</th><th>Reason</th></tr>
  <tr><td>max server memory</td><td>RAM minus 1-4 GB</td><td>Leave OS headroom</td></tr>
  <tr><td>Authentication</td><td>Windows mode</td><td>Central credential control</td></tr>
  <tr><td>TCP/IP</td><td>Enabled, fixed port</td><td>Predictable connectivity</td></tr>
</table>
<p>Authentication can be Windows-only or mixed mode. Windows authentication is preferred because credentials are managed centrally and never stored in the connection string; SQL authentication is retained for compatibility and requires a strong password policy.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Post-Installation Configuration, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Post-Installation Configuration",
      html: `
<p>This section consolidates <strong>Post-Installation Configuration</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>SQL Server Agent is the scheduling engine for jobs, alerts and maintenance. It must be running and configured to start automatically in production, with an operator for notifications.</p>
<p>A production installation checklist turns these decisions into a repeatable, auditable process: editions, paths, accounts, memory, ports, firewall, patch level, backups and monitoring all recorded before go-live.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Post-Installation Configuration sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Setting</th><th>Recommendation</th><th>Reason</th></tr>
  <tr><td>max server memory</td><td>RAM minus 1-4 GB</td><td>Leave OS headroom</td></tr>
  <tr><td>Authentication</td><td>Windows mode</td><td>Central credential control</td></tr>
  <tr><td>TCP/IP</td><td>Enabled, fixed port</td><td>Predictable connectivity</td></tr>
</table>
<p>Choosing an edition and version is the first installation decision. Express, Developer, Standard and Enterprise editions differ in feature set, licensing and scale limits; production choice is driven by the features the workload needs and the budget available.</p>
<p>Use the following as a starting point when investigating Post-Installation Configuration. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Post-Installation Configuration
SELECT SERVERPROPERTY('MachineName') AS machine,
       SERVERPROPERTY('InstanceName') AS instance,
       SERVERPROPERTY('ProductVersion') AS version,
       SERVERPROPERTY('Edition') AS edition;</code></pre>
<p>An instance is an installed copy of the Database Engine with its own system databases, configuration and set of user databases. A server can host one default instance and multiple named instances, each isolated from the others.</p>
      `,
    }
  ],

  scenario: {
    title: "Memory starvation after go-live",
    html: `
A server with 32 GB RAM left max server memory at the default. SQL Server grew to consume almost all of it, starving SSRS and the backup agent on the same box. Setting max server memory to 28 GB stabilised both workloads. The lesson: always set memory explicitly when anything else shares the host.
<p><strong>The Post-Installation Configuration lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "Why prefer Windows authentication?",
      a: `
Credentials are managed centrally in Active Directory, support Kerberos and password policies, and are not embedded in application connection strings.
      `,
    },
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
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server installation and configuration.”",
      "options": [
        "Predictable connectivity",
        "Post-Installation Configuration",
        "Central credential control"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Post-Installation Configuration within SQL Server installation and configuration. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Post-Installation Configuration fits”?",
      "options": [
        "Network configuration enables the TCP/IP protocol, fixes the port and opens the firewall.",
        "Post-Installation Configuration sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Network configuration enables the TCP/IP protocol, fixes the port and opens the firewall. Default instances use 1433; named instances use a dynamic port resolved by the Browser service on UDP 1434 unless configured otherwise.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Post-Installation Configuration in practice”?",
      "options": [
        "Full Enterprise features",
        "Core HA, limited scale",
        "SQL Server Agent is the scheduling engine for jobs, alerts and maintenance."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “SQL Server Agent is the scheduling engine for jobs, alerts and maintenance. It must be running and configured to start automatically in production, with an operator for notifications.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Post-Installation Configuration”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Post-Installation Configuration. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "An instance is an installed copy of the Database Engine with its own system databases, configuration and set of user databases.",
        "With Post-Installation Configuration, prefer measured, reversible changes.",
        "Post-Installation Configuration"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “An instance is an installed copy of the Database Engine with its own system databases, configuration and set of user databases. A server can host one default instance and multiple named instances, each isolated from the others.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Service accounts run the engine and Agent.",
        "Memory configuration is critical.",
        "Post-Installation Configuration"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Post-Installation Configuration with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Post-Installation Configuration means”?",
      "options": [
        "SQL Server Agent is the scheduling engine for jobs, alerts and maintenance.",
        "Service accounts run the engine and Agent.",
        "The diagram below places Post-Installation Configuration alongside the core concepts of SQL Server installation and configuration."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Service accounts run the engine and Agent. Use a dedicated low-privilege domain or virtual account, grant only required rights, and never run SQL Server as a local administrator in production.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Post-Installation Configuration fits”?",
      "options": [
        "The diagram below places Post-Installation Configuration alongside the core concepts of SQL Server installation and configuration.",
        "Memory configuration is critical.",
        "Post-Installation Configuration is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Post-Installation Configuration alongside the core concepts of SQL Server installation and configuration. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Post-Installation Configuration in practice”?",
      "options": [
        "Post-Installation Configuration is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Network configuration enables the TCP/IP protocol, fixes the port and opens the firewall.",
        "The following comparison captures the distinctions that matter most when working with Post-Installation Configuration:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Post-Installation Configuration:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Post-Installation Configuration”?",
      "options": [
        "The diagram below places Post-Installation Configuration alongside the core concepts of SQL Server installation and configuration.",
        "The first example establishes the relevant state.",
        "Network configuration enables the TCP/IP protocol, fixes the port and opens the firewall."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server installation and configuration.”",
      "options": [
        "Predictable connectivity",
        "Post-Installation Configuration",
        "Central credential control"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Post-Installation Configuration within SQL Server installation and configuration. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Post-Installation Configuration fits”?",
      "options": [
        "Network configuration enables the TCP/IP protocol, fixes the port and opens the firewall.",
        "Post-Installation Configuration sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Network configuration enables the TCP/IP protocol, fixes the port and opens the firewall. Default instances use 1433; named instances use a dynamic port resolved by the Browser service on UDP 1434 unless configured otherwise.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Post-Installation Configuration in practice”?",
      "options": [
        "Full Enterprise features",
        "Core HA, limited scale",
        "SQL Server Agent is the scheduling engine for jobs, alerts and maintenance."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “SQL Server Agent is the scheduling engine for jobs, alerts and maintenance. It must be running and configured to start automatically in production, with an operator for notifications.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Post-Installation Configuration”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Post-Installation Configuration. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "An instance is an installed copy of the Database Engine with its own system databases, configuration and set of user databases.",
        "With Post-Installation Configuration, prefer measured, reversible changes.",
        "Post-Installation Configuration"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “An instance is an installed copy of the Database Engine with its own system databases, configuration and set of user databases. A server can host one default instance and multiple named instances, each isolated from the others.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Service accounts run the engine and Agent.",
        "Memory configuration is critical.",
        "Post-Installation Configuration"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Post-Installation Configuration with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Post-Installation Configuration means”?",
      "options": [
        "SQL Server Agent is the scheduling engine for jobs, alerts and maintenance.",
        "Service accounts run the engine and Agent.",
        "The diagram below places Post-Installation Configuration alongside the core concepts of SQL Server installation and configuration."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Service accounts run the engine and Agent. Use a dedicated low-privilege domain or virtual account, grant only required rights, and never run SQL Server as a local administrator in production.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Post-Installation Configuration fits”?",
      "options": [
        "The diagram below places Post-Installation Configuration alongside the core concepts of SQL Server installation and configuration.",
        "Memory configuration is critical.",
        "Post-Installation Configuration is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Post-Installation Configuration alongside the core concepts of SQL Server installation and configuration. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Post-Installation Configuration in practice”?",
      "options": [
        "Post-Installation Configuration is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Network configuration enables the TCP/IP protocol, fixes the port and opens the firewall.",
        "The following comparison captures the distinctions that matter most when working with Post-Installation Configuration:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Post-Installation Configuration:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Post-Installation Configuration”?",
      "options": [
        "The diagram below places Post-Installation Configuration alongside the core concepts of SQL Server installation and configuration.",
        "The first example establishes the relevant state.",
        "Network configuration enables the TCP/IP protocol, fixes the port and opens the firewall."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server installation and configuration.”",
      "options": [
        "Predictable connectivity",
        "Post-Installation Configuration",
        "Central credential control"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Post-Installation Configuration within SQL Server installation and configuration. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Post-Installation Configuration fits”?",
      "options": [
        "Network configuration enables the TCP/IP protocol, fixes the port and opens the firewall.",
        "Post-Installation Configuration sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Network configuration enables the TCP/IP protocol, fixes the port and opens the firewall. Default instances use 1433; named instances use a dynamic port resolved by the Browser service on UDP 1434 unless configured otherwise.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Post-Installation Configuration in practice”?",
      "options": [
        "Full Enterprise features",
        "Core HA, limited scale",
        "SQL Server Agent is the scheduling engine for jobs, alerts and maintenance."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “SQL Server Agent is the scheduling engine for jobs, alerts and maintenance. It must be running and configured to start automatically in production, with an operator for notifications.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Post-Installation Configuration”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Post-Installation Configuration. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "An instance is an installed copy of the Database Engine with its own system databases, configuration and set of user databases.",
        "With Post-Installation Configuration, prefer measured, reversible changes.",
        "Post-Installation Configuration"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “An instance is an installed copy of the Database Engine with its own system databases, configuration and set of user databases. A server can host one default instance and multiple named instances, each isolated from the others.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Service accounts run the engine and Agent.",
        "Memory configuration is critical.",
        "Post-Installation Configuration"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Post-Installation Configuration with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Post-Installation Configuration means”?",
      "options": [
        "SQL Server Agent is the scheduling engine for jobs, alerts and maintenance.",
        "Service accounts run the engine and Agent.",
        "The diagram below places Post-Installation Configuration alongside the core concepts of SQL Server installation and configuration."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Service accounts run the engine and Agent. Use a dedicated low-privilege domain or virtual account, grant only required rights, and never run SQL Server as a local administrator in production.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Post-Installation Configuration fits”?",
      "options": [
        "The diagram below places Post-Installation Configuration alongside the core concepts of SQL Server installation and configuration.",
        "Memory configuration is critical.",
        "Post-Installation Configuration is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Post-Installation Configuration alongside the core concepts of SQL Server installation and configuration. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Post-Installation Configuration in practice”?",
      "options": [
        "Post-Installation Configuration is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Network configuration enables the TCP/IP protocol, fixes the port and opens the firewall.",
        "The following comparison captures the distinctions that matter most when working with Post-Installation Configuration:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Post-Installation Configuration:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Post-Installation Configuration”?",
      "options": [
        "The diagram below places Post-Installation Configuration alongside the core concepts of SQL Server installation and configuration.",
        "The first example establishes the relevant state.",
        "Network configuration enables the TCP/IP protocol, fixes the port and opens the firewall."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Post-Installation Configuration is a fundamental concept in SQL Server installation and configuration",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Post-Installation Configuration improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
