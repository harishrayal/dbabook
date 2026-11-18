/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch03-01.html */

window.TOPIC = {
  id: "ch03-01",
  title: "Windows Server Fundamentals",

  lead: "SQL Server never runs in a vacuum — it sits on top of Windows Server, and every service failure, permission denial, or slow disk you debug is really an operating system problem wearing a database costume.",

  objectives: [
    "Describe what Windows Server is and how it differs from desktop Windows",
    "Understand editions, roles, and features",
    "Recognise the management tools a DBA uses daily",
    "Inventory a Windows Server from the command line",
    "Spot the Windows-level causes behind common SQL Server outages"
  ],

  sections: [
    {
      h: "What Windows Server is",
      html: `
<p><strong>Windows Server</strong> is Microsoft's server operating system. It provides the OS, identity, networking, storage, and security services used by workloads such as SQL Server. It shares much of its Windows codebase with client Windows, but editions, licensing, supported roles, and operational practices differ.</p>
<p>For a DBA the operating system is the floor of the building. When the database is slow, the cause is frequently below SQL Server: a full volume, a service running under the wrong account, a firewall rule, a failing disk driver, or a patch that rebooted the box at 3 AM. You do not need to become a Windows administrator, but you must be able to read the OS well enough to separate "SQL Server has a problem" from "the server under SQL Server has a problem".</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Windows Server stack under SQL Server">
    <defs>
      <marker id="ws-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="40" y="20" width="680" height="56" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="380" y="45" text-anchor="middle" fill="var(--accent-strong)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Applications &amp; users</text>
    <text x="380" y="65" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">SSMS · app tiers · reporting · integration services</text>

    <rect x="40" y="100" width="680" height="56" rx="10" fill="var(--surface-2)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="380" y="125" text-anchor="middle" fill="var(--text)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">SQL Server (Database Engine, Agent, Browser)</text>
    <text x="380" y="145" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">services, permissions, ports, data and log files</text>

    <rect x="40" y="180" width="680" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="380" y="206" text-anchor="middle" fill="var(--text)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Windows Server</text>
    <text x="380" y="228" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-family="Segoe UI, sans-serif">roles &amp; features · services · NTFS · firewall · Event Viewer · DNS</text>

    <rect x="40" y="274" width="680" height="50" rx="10" fill="var(--surface)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="380" y="304" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Hardware &amp; hypervisor — CPU · RAM · disks · network adapters</text>

    <line x1="380" y1="274" x2="380" y2="254" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ws-arrow)"/>
    <line x1="380" y1="180" x2="380" y2="160" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ws-arrow)"/>
    <line x1="380" y1="100" x2="380" y2="80" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ws-arrow)"/>

    <text x="380" y="196" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-style="italic" font-family="Segoe UI, sans-serif"></text>
  </svg>
  <div class="figcaption">Figure 1 — Every SQL Server problem eventually rests on a Windows Server layer below it.</div>
</div>
`
    },
    {
      h: "Editions, roles, and features",
      html: `
<p>Windows Server ships in editions (Standard and Datacenter being the modern pair) that differ mainly in virtualisation rights and scalability, not in day-to-day behaviour. What matters more to a DBA is the <strong>role</strong> model: instead of installing one monolithic product, you switch on the capabilities the server needs.</p>
<table>
  <tr><th>Concept</th><th>Meaning</th><th>DBA example</th></tr>
  <tr><td><strong>Role</strong></td><td>A major server capability</td><td>Failover Clustering (needed for FCI), DNS, File Services</td></tr>
  <tr><td><strong>Feature</strong></td><td>A supporting component</td><td>Install only when an application or SQL Server version requires it</td></tr>
  <tr><td><strong>Desktop Experience</strong></td><td>Full GUI shell</td><td>Familiar, but heavier patch surface</td></tr>
  <tr><td><strong>Server Core</strong></td><td>Minimal install, no GUI</td><td>Smaller attack surface; managed remotely with PowerShell</td></tr>
</table>
<p>On Windows Server, roles and features can be installed with Server Manager or PowerShell's <code>Install-WindowsFeature</code>. Keep the installed components aligned with documented workload requirements; removing unnecessary components can reduce maintenance and attack surface.</p>
`
    },
    {
      h: "The DBA's daily toolbox",
      html: `
<p>Three tools cover most Windows work a DBA performs:</p>
<ul>
  <li><strong>Server Manager / Settings</strong> — roles, features, network profile, and basic configuration</li>
  <li><strong>PowerShell</strong> — the real workhorse; everything clickable has a cmdlet, and cmdlets script and scale</li>
  <li><strong>Event Viewer and Performance Monitor</strong> — evidence when something has already gone wrong</li>
</ul>
<p>Start with an inventory. These commands tell you exactly what you are administering:</p>
<pre><code class="language-powershell">Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, OsBuildNumber, CsTotalPhysicalMemory
Get-WindowsFeature | Where-Object InstallState -eq 'Installed' | Format-Table Name, DisplayName
Get-Service | Sort-Object Status, DisplayName | Format-Table Status, StartType, Name, DisplayName
Get-NetIPConfiguration | Format-Table InterfaceAlias, IPv4Address, DefaultGateway</code></pre>
<p>Run them once on a healthy server and save the output. When a new incident arrives, you are comparing against a known-good baseline instead of guessing.</p>
`
    },
    {
      h: "Versions, builds, and support lifecycle",
      html: `
<p>Check the exact Windows Server release, edition, and build before installing SQL Server. Support is version- and edition-specific, and both products have separate lifecycle dates; don't infer compatibility from the year in their names. Recheck Microsoft's current support matrix when planning a deployment or upgrade.</p>
<table>
  <tr><th>Version</th><th>Typical pairing</th><th>DBA note</th></tr>
  <tr><td><strong>Windows Server release</strong></td><td>Check SQL Server's published OS requirements</td><td>Compatibility can vary by SQL Server version and edition</td></tr>
  <tr><td><strong>SQL Server release</strong></td><td>Check Microsoft's lifecycle and servicing policy</td><td>Plan upgrades using both OS and database-engine support dates</td></tr>
</table>
<p>Get the exact build with PowerShell — the <code>OsBuildNumber</code> and product type matter when you open a support case:</p>
<pre><code class="language-powershell">Get-ComputerInfo | Select-Object OsName, OsVersion, OsBuildNumber, WindowsInstallationType
Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion' | Select-Object ProductName, DisplayVersion, CurrentBuild</code></pre>
<p>Use Microsoft's version-specific hardware and software requirements and lifecycle pages as the authority; product names alone aren't a compatibility matrix.</p>
`
    },
    {
      h: "How the OS interacts with SQL Server",
      html: `
<p>SQL Server depends on the operating system for four things, and each one is a classic failure point:</p>
<table>
  <tr><th>OS provides</th><th>SQL Server uses it for</th><th>When it breaks</th></tr>
  <tr><td><strong>Services</strong></td><td>Starting the Engine, Agent, and Browser</td><td>Instance won't start after a reboot</td></tr>
  <tr><td><strong>NTFS permissions</strong></td><td>Reading MDF/NDF/LDF files</td><td>"Access is denied" in the error log</td></tr>
  <tr><td><strong>Memory &amp; CPU scheduling</strong></td><td>Buffer pool, schedulers, parallelism</td><td>Starvation, paging, unexpected reboots</td></tr>
  <tr><td><strong>TCP/IP stack</strong></td><td>Client connections on the configured listener port (1433 is the default instance's default)</td><td>Timeouts after a firewall, protocol, or NIC change</td></tr>
</table>
<p>This is why DBAs read Windows logs at all: when SQL Server reports something vague like a start failure or a connectivity timeout, Event Viewer, <code>netstat</code>, and the service configuration usually name the culprit first.</p>
`
    },
    {
      h: "Pitfalls on production Windows Servers",
      html: `
<p>Common Windows-layer risks on database servers include:</p>
<ul>
  <li><strong>Unattended patching</strong> — Windows Update configured to auto-restart outside a maintenance window will reboot your primary at the worst possible moment</li>
  <li><strong>Role creep</strong> — installing IIS or .NET components "for one report" widens the patch and attack surface of a production DB</li>
  <li><strong>Power policy changes</strong> — CPU power settings can affect latency; follow the platform team's supported baseline and measure before changing them</li>
  <li><strong>GUI habits on Core</strong> — relying on Remote Desktop for management means you have no plan for when RDP itself is the broken layer</li>
  <li><strong>Drift</strong> — servers configured by hand and never re-checked; document the build, then verify it with scripts after every change</li>
</ul>
<p>Treat the operating system as production infrastructure with its own change control: no feature installs, patch reboots, or power-plan tweaks on a database server outside an approved window.</p>
`
    },
    {
      h: "Patch levels and update channels",
      html: `
<p>Windows servicing on a database server needs change control. Update types and servicing behavior vary by Windows Server release and policy; review what is installed, what is pending, and whether a restart is required before scheduling maintenance.</p>
<pre><code class="language-powershell">Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 10 HotFixID, Description, InstalledOn
Get-ComputerInfo | Select-Object OsBuildNumber, WindowsBuildLabEx
$session = New-Object -ComObject Microsoft.Update.Session; $searcher = $session.CreateUpdateSearcher(); $searcher.Search('IsInstalled=0').Updates | Select-Object Title, MsrcSeverity</code></pre>
<p>Practical policy for production database servers:</p>
<ul>
  <li><strong>Patch in a defined window</strong> with the SQL services verified after every reboot</li>
  <li><strong>Separate OS patches from SQL patches</strong> — never stack both in one change</li>
  <li><strong>Test on a non-production node first</strong>, including a restart, because most patch failures only appear after reboot</li>
  <li><strong>Record the build</strong> — <code>Get-HotFix</code> output belongs in your server documentation</li>
</ul>
`
    }
  ],

  scenario: {
    title: "SQL Server installer failed 40 minutes into a new build",
    html: `
<p>A DBA is asked to install SQL Server 2022 on a Windows Server VM. Setup's prerequisite check rejects the operating system, which is an older release than SQL Server 2022 supports. The infrastructure template predates the database version, and the project deadline is today.</p>
<p>The DBA confirms the OS name and build with <code>Get-ComputerInfo</code>, checks Microsoft's SQL Server 2022 requirements, and stops rather than trying to bypass Setup's rule. The host is rebuilt on a supported Windows Server release, then setup is rerun. Prevention: the build request records both the SQL Server version and a validated OS combination, and preflight checks reject unsupported pairs before installation begins.</p>
`
  },

  interview: [
    {
      q: "How is Windows Server different from desktop Windows?",
      a: "Windows Server is designed and licensed for server workloads, with roles and features such as AD DS, DNS, clustering, and file services. It can be installed with Desktop Experience or Server Core; the choice affects the local management tools available, not whether the OS can host SQL Server."
    },
    {
      q: "A SQL Server instance will not start after a reboot. Where do you look first?",
      a: "In Event Viewer's System and Application logs plus the SQL Server error log. Service Control Manager events tell you whether the service failed to start (bad service account, dependency not running, port conflict), while the SQL error log names file-level problems such as access denied on the data files or a corrupt model database. OS evidence first, then SQL evidence."
    },
    {
      q: "What is the difference between a role and a feature?",
      a: "A role is a major capability the server is meant to provide — DNS, Failover Clustering, File Services. A feature is a supporting component, such as .NET Framework 3.5 or failover cluster tools. You enable roles to give the server its job; features back up the roles and the applications on them."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “_____ is Microsoft's server operating system: the platform layer that manages hardware, identity, networking, storage, and security for everything running on the machine — including SQL Server.”",
      "options": [
        "Feature",
        "Desktop Experience",
        "Windows Server"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Windows Server is Microsoft's server operating system: the platform layer that manages hardware, identity, networking, storage, and security for everything running on the machine — including SQL Server. It shares a kernel with desktop Windows, but it is licensed, configured, and operated differently: no consumer apps, server-grade defaults, and a much heavier emphasis on roles that serve other machines.”"
    },
    {
      "question": "Complete the lesson statement: “What matters more to a DBA is the _____ model: instead of installing one monolithic product, you switch on the capabilities the server needs.”",
      "options": [
        "Server Core",
        "role",
        "Desktop Experience"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Windows Server ships in editions (Standard and Datacenter being the modern pair) that differ mainly in virtualisation rights and scalability, not in day-to-day behaviour. What matters more to a DBA is the role model: instead of installing one monolithic product, you switch on the capabilities the server needs.”"
    },
    {
      "question": "Which fact is covered in the lesson section “The DBA's daily toolbox”?",
      "options": [
        "Three tools cover most Windows work a DBA performs:",
        "Roles are installed with Server Manager or PowerShell's Install-WindowsFeature.",
        "Failover Clustering (needed for FCI), DNS, File Services"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Three tools cover most Windows work a DBA performs:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Versions, builds, and support lifecycle”?",
      "options": [
        "Failover Clustering (needed for FCI), DNS, File Services",
        ".NET Framework 3.5, which older SQL installers still require",
        "Know which Windows Server you are on before anything else — SQL Server's supported OS matrix is version- and edition-specific, and an unsupported platform is a problem you cannot…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Know which Windows Server you are on before anything else — SQL Server's supported OS matrix is version- and edition-specific, and an unsupported platform is a problem you cannot fix with configuration. Server 2016, 2019, 2022, and 2025 are the modern line; each has a long support phase followed by extended support, during which security patches continue but design changes stop.”"
    },
    {
      "question": "Which fact is covered in the lesson section “How the OS interacts with SQL Server”?",
      "options": [
        "Familiar, but heavier patch surface",
        "SQL Server depends on the operating system for four things, and each one is a classic failure point:",
        ".NET Framework 3.5, which older SQL installers still require"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “SQL Server depends on the operating system for four things, and each one is a classic failure point:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls on production Windows Servers”?",
      "options": [
        "Most Windows-layer outages on database servers are self-inflicted:",
        "Familiar, but heavier patch surface",
        "Smaller attack surface; managed remotely with PowerShell"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Most Windows-layer outages on database servers are self-inflicted:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Patch levels and update channels”?",
      "options": [
        "Smaller attack surface; managed remotely with PowerShell",
        "Three tools cover most Windows work a DBA performs:",
        "Windows Update on a database server is a change-management problem, not a technical one."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Windows Update on a database server is a change-management problem, not a technical one. Patches arrive in categories: security-only updates, cumulative updates,.NET updates, and the optional \"preview\" releases that are effectively next month's test. On a DBA-managed host you care about three things — what is installed, what is pending, and when the machine will reboot.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Windows Server is”?",
      "options": [
        "Know which Windows Server you are on before anything else — SQL Server's supported OS matrix is version- and edition-specific, and an unsupported platform is a problem you cannot…",
        "For a DBA the operating system is the floor of the building.",
        "Run them once on a healthy server and save the output."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “For a DBA the operating system is the floor of the building. When the database is slow, the cause is frequently below SQL Server: a full volume, a service running under the wrong account, a firewall rule, a failing disk driver, or a patch that rebooted the box at 3 AM. You do not need to become a Windows administrator, but you must be able to read the OS well enough to separate \"SQL Server has a problem\" from \"the server under SQL Server has a problem\".”"
    },
    {
      "question": "Which fact is covered in the lesson section “Editions, roles, and features”?",
      "options": [
        "Roles are installed with Server Manager or PowerShell's Install-WindowsFeature.",
        "Current mainstream target for new builds",
        "Newest platform — verify feature parity before adopting"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Roles are installed with Server Manager or PowerShell's Install-WindowsFeature. A database server typically keeps its role list deliberately short: the fewer features present, the fewer patches, reboots, and surprises.”"
    },
    {
      "question": "Which fact is covered in the lesson section “The DBA's daily toolbox”?",
      "options": [
        "Two practical rules: never install SQL Server on an OS version that Microsoft's support matrix does not list for that SQL version, and track the OS support end date alongside the…",
        "Still common in production estates; plan upgrades before extended support ends",
        "Start with an inventory."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Start with an inventory. These commands tell you exactly what you are administering:”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “_____ is Microsoft's server operating system: the platform layer that manages hardware, identity, networking, storage, and security for everything running on the machine — including SQL Server.”",
      "options": [
        "Feature",
        "Desktop Experience",
        "Windows Server"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Windows Server is Microsoft's server operating system: the platform layer that manages hardware, identity, networking, storage, and security for everything running on the machine — including SQL Server. It shares a kernel with desktop Windows, but it is licensed, configured, and operated differently: no consumer apps, server-grade defaults, and a much heavier emphasis on roles that serve other machines.”"
    },
    {
      "question": "Complete the lesson statement: “What matters more to a DBA is the _____ model: instead of installing one monolithic product, you switch on the capabilities the server needs.”",
      "options": [
        "Server Core",
        "role",
        "Desktop Experience"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Windows Server ships in editions (Standard and Datacenter being the modern pair) that differ mainly in virtualisation rights and scalability, not in day-to-day behaviour. What matters more to a DBA is the role model: instead of installing one monolithic product, you switch on the capabilities the server needs.”"
    },
    {
      "question": "Which fact is covered in the lesson section “The DBA's daily toolbox”?",
      "options": [
        "Three tools cover most Windows work a DBA performs:",
        "Roles are installed with Server Manager or PowerShell's Install-WindowsFeature.",
        "Failover Clustering (needed for FCI), DNS, File Services"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Three tools cover most Windows work a DBA performs:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Versions, builds, and support lifecycle”?",
      "options": [
        "Failover Clustering (needed for FCI), DNS, File Services",
        ".NET Framework 3.5, which older SQL installers still require",
        "Know which Windows Server you are on before anything else — SQL Server's supported OS matrix is version- and edition-specific, and an unsupported platform is a problem you cannot…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Know which Windows Server you are on before anything else — SQL Server's supported OS matrix is version- and edition-specific, and an unsupported platform is a problem you cannot fix with configuration. Server 2016, 2019, 2022, and 2025 are the modern line; each has a long support phase followed by extended support, during which security patches continue but design changes stop.”"
    },
    {
      "question": "Which fact is covered in the lesson section “How the OS interacts with SQL Server”?",
      "options": [
        "Familiar, but heavier patch surface",
        "SQL Server depends on the operating system for four things, and each one is a classic failure point:",
        ".NET Framework 3.5, which older SQL installers still require"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “SQL Server depends on the operating system for four things, and each one is a classic failure point:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls on production Windows Servers”?",
      "options": [
        "Most Windows-layer outages on database servers are self-inflicted:",
        "Familiar, but heavier patch surface",
        "Smaller attack surface; managed remotely with PowerShell"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Most Windows-layer outages on database servers are self-inflicted:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Patch levels and update channels”?",
      "options": [
        "Smaller attack surface; managed remotely with PowerShell",
        "Three tools cover most Windows work a DBA performs:",
        "Windows Update on a database server is a change-management problem, not a technical one."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Windows Update on a database server is a change-management problem, not a technical one. Patches arrive in categories: security-only updates, cumulative updates,.NET updates, and the optional \"preview\" releases that are effectively next month's test. On a DBA-managed host you care about three things — what is installed, what is pending, and when the machine will reboot.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Windows Server is”?",
      "options": [
        "Know which Windows Server you are on before anything else — SQL Server's supported OS matrix is version- and edition-specific, and an unsupported platform is a problem you cannot…",
        "For a DBA the operating system is the floor of the building.",
        "Run them once on a healthy server and save the output."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “For a DBA the operating system is the floor of the building. When the database is slow, the cause is frequently below SQL Server: a full volume, a service running under the wrong account, a firewall rule, a failing disk driver, or a patch that rebooted the box at 3 AM. You do not need to become a Windows administrator, but you must be able to read the OS well enough to separate \"SQL Server has a problem\" from \"the server under SQL Server has a problem\".”"
    },
    {
      "question": "Which fact is covered in the lesson section “Editions, roles, and features”?",
      "options": [
        "Roles are installed with Server Manager or PowerShell's Install-WindowsFeature.",
        "Current mainstream target for new builds",
        "Newest platform — verify feature parity before adopting"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Roles are installed with Server Manager or PowerShell's Install-WindowsFeature. A database server typically keeps its role list deliberately short: the fewer features present, the fewer patches, reboots, and surprises.”"
    },
    {
      "question": "Which fact is covered in the lesson section “The DBA's daily toolbox”?",
      "options": [
        "Two practical rules: never install SQL Server on an OS version that Microsoft's support matrix does not list for that SQL version, and track the OS support end date alongside the…",
        "Still common in production estates; plan upgrades before extended support ends",
        "Start with an inventory."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Start with an inventory. These commands tell you exactly what you are administering:”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “_____ is Microsoft's server operating system: the platform layer that manages hardware, identity, networking, storage, and security for everything running on the machine — including SQL Server.”",
      "options": [
        "Feature",
        "Desktop Experience",
        "Windows Server"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Windows Server is Microsoft's server operating system: the platform layer that manages hardware, identity, networking, storage, and security for everything running on the machine — including SQL Server. It shares a kernel with desktop Windows, but it is licensed, configured, and operated differently: no consumer apps, server-grade defaults, and a much heavier emphasis on roles that serve other machines.”"
    },
    {
      "question": "Complete the lesson statement: “What matters more to a DBA is the _____ model: instead of installing one monolithic product, you switch on the capabilities the server needs.”",
      "options": [
        "Server Core",
        "role",
        "Desktop Experience"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Windows Server ships in editions (Standard and Datacenter being the modern pair) that differ mainly in virtualisation rights and scalability, not in day-to-day behaviour. What matters more to a DBA is the role model: instead of installing one monolithic product, you switch on the capabilities the server needs.”"
    },
    {
      "question": "Which fact is covered in the lesson section “The DBA's daily toolbox”?",
      "options": [
        "Three tools cover most Windows work a DBA performs:",
        "Roles are installed with Server Manager or PowerShell's Install-WindowsFeature.",
        "Failover Clustering (needed for FCI), DNS, File Services"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Three tools cover most Windows work a DBA performs:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Versions, builds, and support lifecycle”?",
      "options": [
        "Failover Clustering (needed for FCI), DNS, File Services",
        ".NET Framework 3.5, which older SQL installers still require",
        "Know which Windows Server you are on before anything else — SQL Server's supported OS matrix is version- and edition-specific, and an unsupported platform is a problem you cannot…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Know which Windows Server you are on before anything else — SQL Server's supported OS matrix is version- and edition-specific, and an unsupported platform is a problem you cannot fix with configuration. Server 2016, 2019, 2022, and 2025 are the modern line; each has a long support phase followed by extended support, during which security patches continue but design changes stop.”"
    },
    {
      "question": "Which fact is covered in the lesson section “How the OS interacts with SQL Server”?",
      "options": [
        "Familiar, but heavier patch surface",
        "SQL Server depends on the operating system for four things, and each one is a classic failure point:",
        ".NET Framework 3.5, which older SQL installers still require"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “SQL Server depends on the operating system for four things, and each one is a classic failure point:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls on production Windows Servers”?",
      "options": [
        "Most Windows-layer outages on database servers are self-inflicted:",
        "Familiar, but heavier patch surface",
        "Smaller attack surface; managed remotely with PowerShell"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Most Windows-layer outages on database servers are self-inflicted:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Patch levels and update channels”?",
      "options": [
        "Smaller attack surface; managed remotely with PowerShell",
        "Three tools cover most Windows work a DBA performs:",
        "Windows Update on a database server is a change-management problem, not a technical one."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Windows Update on a database server is a change-management problem, not a technical one. Patches arrive in categories: security-only updates, cumulative updates,.NET updates, and the optional \"preview\" releases that are effectively next month's test. On a DBA-managed host you care about three things — what is installed, what is pending, and when the machine will reboot.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Windows Server is”?",
      "options": [
        "Know which Windows Server you are on before anything else — SQL Server's supported OS matrix is version- and edition-specific, and an unsupported platform is a problem you cannot…",
        "For a DBA the operating system is the floor of the building.",
        "Run them once on a healthy server and save the output."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “For a DBA the operating system is the floor of the building. When the database is slow, the cause is frequently below SQL Server: a full volume, a service running under the wrong account, a firewall rule, a failing disk driver, or a patch that rebooted the box at 3 AM. You do not need to become a Windows administrator, but you must be able to read the OS well enough to separate \"SQL Server has a problem\" from \"the server under SQL Server has a problem\".”"
    },
    {
      "question": "Which fact is covered in the lesson section “Editions, roles, and features”?",
      "options": [
        "Roles are installed with Server Manager or PowerShell's Install-WindowsFeature.",
        "Current mainstream target for new builds",
        "Newest platform — verify feature parity before adopting"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Roles are installed with Server Manager or PowerShell's Install-WindowsFeature. A database server typically keeps its role list deliberately short: the fewer features present, the fewer patches, reboots, and surprises.”"
    },
    {
      "question": "Which fact is covered in the lesson section “The DBA's daily toolbox”?",
      "options": [
        "Two practical rules: never install SQL Server on an OS version that Microsoft's support matrix does not list for that SQL version, and track the OS support end date alongside the…",
        "Still common in production estates; plan upgrades before extended support ends",
        "Start with an inventory."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Start with an inventory. These commands tell you exactly what you are administering:”"
    }
  ],
  takeaways: [
    "Windows Server is the platform layer under SQL Server: services, NTFS, networking, memory, and logging",
    "Roles are capabilities, features are supporting components — keep a database server's list deliberately short",
    "PowerShell (Get-ComputerInfo, Get-WindowsFeature, Get-Service) is the DBA's primary Windows tool",
    "Most Windows-layer outages are self-inflicted: unattended patch reboots, role creep, wrong power plan",
    "When SQL behaves oddly, read the OS evidence — Event Viewer and the service state usually name the cause"
  ]
};
