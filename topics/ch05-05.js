/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch05-05.html */

window.TOPIC = {
  id: "ch05-05",
  title: "SQL Server Installation Requirements",

  lead: "A successful SQL Server installation is 90 % decisions made before setup runs — platform support, accounts, paths, and collation — because everything the wizard cannot fix for you must be right the first time in production.",

  objectives: [
    "State the platform requirements for a modern SQL Server install",
    "Make the pre-install decisions: edition, instance, paths, accounts, collation",
    "Walk the installation flow from planning to post-install verification",
    "Identify the accounts and permissions setup needs",
    "Run pre-flight checks before an installation window"
  ],

  sections: [
    {
      h: "Decide before you click setup",
      html: `
<p>Every decision made during a rushed install becomes a migration project later. Settle these first:</p>
<table>
  <tr><th>Decision</th><th>Why it must be early</th></tr>
  <tr><td><strong>Version and edition</strong></td><td>Fixes feature set, limits, and licence cost (see ch05-01, ch05-02)</td></tr>
  <tr><td><strong>Default or named instance</strong></td><td>Service names, ports, and connection strings depend on it</td></tr>
  <tr><td><strong>Collation</strong></td><td>Changing server collation later means rebuilding system databases</td></tr>
  <tr><td><strong>Data, log, and backup paths</strong></td><td>Storage layout should follow the storage design, not the C: drive default</td></tr>
  <tr><td><strong>Service accounts</strong></td><td>Domain accounts, least privilege, and password expiry policies interact badly at 3 AM</td></tr>
  <tr><td><strong>Authentication mode</strong></td><td>Windows-only versus mixed changes how every application connects</td></tr>
  <tr><td><strong>Admin accounts</strong></td><td>The first SQL logins created during setup must be named, not shared</td></tr>
</table>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="SQL Server installation flow">
    <defs>
      <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <g font-family="Segoe UI, sans-serif">
      <rect x="20" y="50" width="160" height="70" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.6"/>
      <text x="100" y="78" text-anchor="middle" fill="var(--accent-strong)" font-size="13.5" font-weight="700">1 · Plan</text>
      <text x="100" y="99" text-anchor="middle" fill="var(--text)" font-size="11">edition · sizing · paths</text>

      <rect x="205" y="50" width="160" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
      <text x="285" y="78" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700">2 · Run setup</text>
      <text x="285" y="99" text-anchor="middle" fill="var(--muted)" font-size="11">elevated, from media</text>

      <rect x="390" y="50" width="160" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
      <text x="470" y="78" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700">3 · Prerequisites</text>
      <text x="470" y="99" text-anchor="middle" fill="var(--muted)" font-size="11">.NET · reboot · rules</text>

      <rect x="575" y="50" width="160" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
      <text x="655" y="78" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700">4 · Feature selection</text>
      <text x="655" y="99" text-anchor="middle" fill="var(--muted)" font-size="11">engine only, usually</text>

      <rect x="20" y="190" width="160" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
      <text x="100" y="218" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700">5 · Instance config</text>
      <text x="100" y="239" text-anchor="middle" fill="var(--muted)" font-size="11">name · accounts</text>

      <rect x="205" y="190" width="160" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
      <text x="285" y="218" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700">6 · Engine config</text>
      <text x="285" y="239" text-anchor="middle" fill="var(--muted)" font-size="11">collation · dirs · tempdb</text>

      <rect x="390" y="190" width="160" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
      <text x="470" y="218" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700">7 · Install</text>
      <text x="470" y="239" text-anchor="middle" fill="var(--muted)" font-size="11">files · services · restart</text>

      <rect x="575" y="190" width="160" height="70" rx="10" fill="var(--accent)" stroke="var(--accent-strong)"/>
      <text x="655" y="218" text-anchor="middle" fill="#ffffff" font-size="13.5" font-weight="700">8 · Verify</text>
      <text x="655" y="239" text-anchor="middle" fill="#e2e8f0" font-size="11">build · services · backups</text>

      <line x1="180" y1="85" x2="203" y2="85" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#flow-arrow)"/>
      <line x1="365" y1="85" x2="388" y2="85" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#flow-arrow)"/>
      <line x1="550" y1="85" x2="573" y2="85" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#flow-arrow)"/>
      <path d="M 655 122 L 655 155 L 100 155 L 100 188" fill="none" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#flow-arrow)"/>
      <line x1="180" y1="225" x2="203" y2="225" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#flow-arrow)"/>
      <line x1="365" y1="225" x2="388" y2="225" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#flow-arrow)"/>
      <line x1="550" y1="225" x2="573" y2="225" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#flow-arrow)"/>

      <text x="380" y="300" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic">Step 3 fails more often than any other — run the pre-flight checks first.</text>
      <text x="380" y="325" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic">Step 8 is skipped by everyone, and it is the one that catches misconfiguration.</text>
    </g>
  </svg>
  <div class="figcaption">Figure 1 — The installation flow: decide, install, then verify — verification is part of the install, not an optional extra.</div>
</div>
`
    },
    {
      h: "Platform requirements",
      html: `
<p>Requirements vary by version — always confirm against the official system requirements for the release you are installing — but the shape of them is stable:</p>
<table>
  <tr><th>Area</th><th>Requirement</th><th>Production note</th></tr>
  <tr><td>Operating system</td><td>Windows Server 2016/2019/2022 (and newer for current releases); Windows 10/11 for dev and test</td><td>Match the OS to the SQL version's support matrix — never guess</td></tr>
  <tr><td>Architecture</td><td>x64 only on modern versions</td><td>Itanium and x86 are long gone</td></tr>
  <tr><td>Framework</td><td>Supported .NET Framework / .NET runtime components — setup detects and installs missing ones</td><td>Disconnected servers need the prerequisites staged offline</td></tr>
  <tr><td>Processor</td><td>x64, 1.4 GHz minimum; 2.4 GHz+ recommended</td><td>Core count matters more than speed for OLTP</td></tr>
  <tr><td>Memory</td><td>Modest minimum (about 2 GB); Express limited to 1 GB for the engine</td><td>Sizing is a workload exercise: 16 GB+ for anything production</td></tr>
  <tr><td>Disk</td><td>Several GB of free space for setup binaries alone</td><td>Data, log, tempdb, and backups each need their own capacity plan</td></tr>
  <tr><td>Network</td><td>TCP/IP enabled; firewall rules for the chosen ports</td><td>Decide static ports before opening firewall holes</td></tr>
</table>
<p>Linux is a first-class platform from SQL Server 2017 onwards (RHEL, Ubuntu, SUSE) with the same engine and mostly the same DMVs — but this roadmap assumes Windows service management unless stated otherwise.</p>
`
    },
    {
      h: "Accounts and permissions",
      html: `
<p>Setup needs enough privilege to create services, write registry keys, and format nothing else — beyond that, everything should be least privilege:</p>
<table>
  <tr><th>Account</th><th>Needs</th><th>Guidance</th></tr>
  <tr><td><strong>Setup account</strong></td><td>Local administrator on the target server (domain account or local admin)</td><td>Elevated session; not a personal daily-driver account</td></tr>
  <tr><td><strong>SQL Server service</strong></td><td>Right to start the engine and read/write data paths</td><td>Default virtual account is fine on a single server; use a domain account when accessing domain resources (linked servers, file shares)</td></tr>
  <tr><td><strong>SQL Server Agent</strong></td><td>Same as engine, plus rights for job steps (CmdExec, PowerShell)</td><td>Job steps that touch the domain need a domain account or a proxy</td></tr>
  <tr><td><strong>SQL Admins</strong></td><td>Sysadmin at first login</td><td>Add named individuals or a security group — never Domain Admins</td></tr>
</table>
<p>Service account passwords are a classic outage: a domain policy forces rotation, the service cannot start on reboot, and the database is offline at boot. Either use managed virtual accounts or integrate with Group Managed Service Accounts (gMSA) where the environment supports them.</p>
`
    },
    {
      h: "Pre-flight checks",
      html: `
<p>Run these before the maintenance window, not during it:</p>
<pre><code class="powershell"># Pre-flight checks before SQL Server setup — elevated PowerShell
Get-ComputerInfo | Select-Object WindowsProductName, OsVersion, OsArchitecture
Get-CimInstance Win32_ComputerSystem | Select-Object Manufacturer, Model, TotalPhysicalMemory
Get-Volume | Where-Object DriveLetter | Format-Table DriveLetter, FileSystemLabel, SizeRemaining, Size
Get-Service | Where-Object { $_.Name -like 'MSSQL*' -or $_.Name -like 'SQLAgent*' } | Format-Table Name, Status, StartType
Test-Path 'HKLM:\SOFTWARE\Microsoft\.NET\Framework\v4.0.30319'
Test-Path 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\Instance Names\SQL'</code></pre>
<p>The last line lists instances already installed — the fastest way to avoid a surprise name clash. Also confirm: no pending reboot, correct time zone, firewall rules planned, and service accounts created with passwords that do not expire unexpectedly.</p>
<pre><code class="language-sql">-- After install: prove the instance is what the design document says
SELECT @@SERVERNAME                                    AS server_name,
       SERVERPROPERTY('ProductVersion')                AS product_version,
       SERVERPROPERTY('Edition')                       AS edition,
       ISNULL(SERVERPROPERTY('InstanceName'), 'MSSQLSERVER') AS instance_name,
       SERVERPROPERTY('Collation')                     AS server_collation,
       SERVERPROPERTY('IsIntegratedSecurityOnly')      AS auth_mode;

SELECT service_name, startup_type_desc, status_desc
FROM   sys.dm_server_services;</code></pre>
`
    },
    {
      h: "Running the install",
      html: `
<p>With decisions made and checks passed, the mechanics are straightforward — discipline matters more than technique:</p>
<ul>
  <li><strong>Run setup elevated</strong> from extracted media, not from a network share with flaky connectivity</li>
  <li><strong>Install the Database Engine first</strong> — add features (SSRS, SSIS, shared tools) afterwards only when required</li>
  <li><strong>Watch the summary log</strong> — setup writes a detailed log; failures name the exact rule that failed</li>
  <li><strong>Note the instance name, paths, and admin accounts</strong> into the build document while you still remember them</li>
  <li><strong>Reboot if setup asks</strong> — deferred reboots cause half-configured service states</li>
  <li><strong>Verify before you leave the window:</strong> services running, TCP reachable remotely, a full backup taken immediately, and the post-install configuration checklist applied (max memory, authentication mode, tempdb layout)</li>
</ul>
<p>An installation is not finished when setup shows “Succeeded” — it is finished when a remote client connects, a backup restores somewhere else, and the configuration values are recorded.</p>
`
    }
  ],

  scenario: {
    title: "Saturday 10 PM install window — setup rolls back at the prerequisite rules",
    html: `
<p>A production upgrade window opened at 10 PM with a 6-hour deadline. Setup failed within four minutes: “The rule .NET Framework setup failed” — the new server image lacked a .NET component, and the host had no internet access to fetch it. The team fixed that, re-ran setup, and failed again on a pending reboot from an earlier patch. Each cycle cost 30 minutes, and by 1 AM the database was still not upgraded.</p>
<p>Resolution: pause, run a scripted pre-flight (OS state, .NET components, pending reboot, disk space, existing instance names), stage the offline prerequisites, clear the pending reboot flag, then re-run setup once — cleanly, at 2:30 AM, with verification queries and a smoke-test backup before the window closed. Prevention: the pre-flight script is now mandatory in the runbook and is executed the day before every window, and offline prerequisite media lives with the setup media in the build share.</p>
`
  },

  interview: [
    {
      q: "What must be decided before running SQL Server setup in production?",
      a: "Version and edition, default or named instance, server collation, data/log/backup paths, service accounts, authentication mode, and the initial admin accounts. Collation and instance naming are the costly ones — both are effectively permanent without rebuilding system databases or rewriting connection strings."
    },
    {
      q: "What are the most common causes of setup failure?",
      a: "Failed prerequisite rules: a pending reboot, missing .NET components, insufficient disk space, a name clash with an existing instance, or a group policy blocking service creation. Almost all are caught by a pre-flight script run before the window."
    },
    {
      q: "When is an installation actually complete?",
      a: "When services are running with the intended start modes, a remote client can connect over TCP with the documented string, the first full backup has been taken and verified, and post-install configuration (max memory, auth mode, tempdb files, monitoring) is recorded in the build document."
    }
  ],

  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Decide before you click setup”?",
      "options": [
        "Sizing is a workload exercise: 16 GB+ for anything production",
        "Every decision made during a rushed install becomes a migration project later.",
        "Core count matters more than speed for OLTP"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Every decision made during a rushed install becomes a migration project later. Settle these first:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Platform requirements”?",
      "options": [
        "Requirements vary by version — always confirm against the official system requirements for the release you are installing — but the shape of them is stable:",
        "Windows-only versus mixed changes how every application connects",
        "The first SQL logins created during setup must be named, not shared"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Requirements vary by version — always confirm against the official system requirements for the release you are installing — but the shape of them is stable:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Accounts and permissions”?",
      "options": [
        "The first SQL logins created during setup must be named, not shared",
        "Requirements vary by version — always confirm against the official system requirements for the release you are installing — but the shape of them is stable:",
        "Setup needs enough privilege to create services, write registry keys, and format nothing else — beyond that, everything should be least privilege:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Setup needs enough privilege to create services, write registry keys, and format nothing else — beyond that, everything should be least privilege:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pre-flight checks”?",
      "options": [
        "Linux is a first-class platform from SQL Server 2017 onwards (RHEL, Ubuntu, SUSE) with the same engine and mostly the same DMVs — but this roadmap assumes Windows service…",
        "Run these before the maintenance window, not during it:",
        "Requirements vary by version — always confirm against the official system requirements for the release you are installing — but the shape of them is stable:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Run these before the maintenance window, not during it:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Running the install”?",
      "options": [
        "With decisions made and checks passed, the mechanics are straightforward — discipline matters more than technique:",
        "Linux is a first-class platform from SQL Server 2017 onwards (RHEL, Ubuntu, SUSE) with the same engine and mostly the same DMVs — but this roadmap assumes Windows service…",
        "Match the OS to the SQL version's support matrix — never guess"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “With decisions made and checks passed, the mechanics are straightforward — discipline matters more than technique:”"
    },
    {
      "question": "In the “Decide before you click setup” table, what is listed for “Version and edition” under “Why it must be early”?",
      "options": [
        "Itanium and x86 are long gone",
        "Disconnected servers need the prerequisites staged offline",
        "Fixes feature set, limits, and licence cost (see ch05-01, ch05-02)"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “Version and edition” as “Fixes feature set, limits, and licence cost (see ch05-01, ch05-02)”."
    },
    {
      "question": "Which fact is covered in the lesson section “Platform requirements”?",
      "options": [
        "Job steps that touch the domain need a domain account or a proxy",
        "Linux is a first-class platform from SQL Server 2017 onwards (RHEL, Ubuntu, SUSE) with the same engine and mostly the same DMVs — but this roadmap assumes Windows service…",
        "Default virtual account is fine on a single server; use a domain account when accessing domain resources (linked servers, file shares)"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Linux is a first-class platform from SQL Server 2017 onwards (RHEL, Ubuntu, SUSE) with the same engine and mostly the same DMVs — but this roadmap assumes Windows service management unless stated otherwise.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Accounts and permissions”?",
      "options": [
        "Service account passwords are a classic outage: a domain policy forces rotation, the service cannot start on reboot, and the database is offline at boot.",
        "Disconnected servers need the prerequisites staged offline",
        "Core count matters more than speed for OLTP"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Service account passwords are a classic outage: a domain policy forces rotation, the service cannot start on reboot, and the database is offline at boot. Either use managed virtual accounts or integrate with Group Managed Service Accounts (gMSA) where the environment supports them.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pre-flight checks”?",
      "options": [
        "Core count matters more than speed for OLTP",
        "Sizing is a workload exercise: 16 GB+ for anything production",
        "The last line lists instances already installed — the fastest way to avoid a surprise name clash."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The last line lists instances already installed — the fastest way to avoid a surprise name clash. Also confirm: no pending reboot, correct time zone, firewall rules planned, and service accounts created with passwords that do not expire unexpectedly.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Running the install”?",
      "options": [
        "Data, log, tempdb, and backups each need their own capacity plan",
        "An installation is not finished when setup shows “Succeeded” — it is finished when a remote client connects, a backup restores somewhere else, and the configuration values are…",
        "Sizing is a workload exercise: 16 GB+ for anything production"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “An installation is not finished when setup shows “Succeeded” — it is finished when a remote client connects, a backup restores somewhere else, and the configuration values are recorded.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Decide before you click setup”?",
      "options": [
        "Sizing is a workload exercise: 16 GB+ for anything production",
        "Every decision made during a rushed install becomes a migration project later.",
        "Core count matters more than speed for OLTP"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Every decision made during a rushed install becomes a migration project later. Settle these first:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Platform requirements”?",
      "options": [
        "Requirements vary by version — always confirm against the official system requirements for the release you are installing — but the shape of them is stable:",
        "Windows-only versus mixed changes how every application connects",
        "The first SQL logins created during setup must be named, not shared"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Requirements vary by version — always confirm against the official system requirements for the release you are installing — but the shape of them is stable:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Accounts and permissions”?",
      "options": [
        "The first SQL logins created during setup must be named, not shared",
        "Requirements vary by version — always confirm against the official system requirements for the release you are installing — but the shape of them is stable:",
        "Setup needs enough privilege to create services, write registry keys, and format nothing else — beyond that, everything should be least privilege:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Setup needs enough privilege to create services, write registry keys, and format nothing else — beyond that, everything should be least privilege:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pre-flight checks”?",
      "options": [
        "Linux is a first-class platform from SQL Server 2017 onwards (RHEL, Ubuntu, SUSE) with the same engine and mostly the same DMVs — but this roadmap assumes Windows service…",
        "Run these before the maintenance window, not during it:",
        "Requirements vary by version — always confirm against the official system requirements for the release you are installing — but the shape of them is stable:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Run these before the maintenance window, not during it:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Running the install”?",
      "options": [
        "With decisions made and checks passed, the mechanics are straightforward — discipline matters more than technique:",
        "Linux is a first-class platform from SQL Server 2017 onwards (RHEL, Ubuntu, SUSE) with the same engine and mostly the same DMVs — but this roadmap assumes Windows service…",
        "Match the OS to the SQL version's support matrix — never guess"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “With decisions made and checks passed, the mechanics are straightforward — discipline matters more than technique:”"
    },
    {
      "question": "In the “Decide before you click setup” table, what is listed for “Version and edition” under “Why it must be early”?",
      "options": [
        "Itanium and x86 are long gone",
        "Disconnected servers need the prerequisites staged offline",
        "Fixes feature set, limits, and licence cost (see ch05-01, ch05-02)"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “Version and edition” as “Fixes feature set, limits, and licence cost (see ch05-01, ch05-02)”."
    },
    {
      "question": "Which fact is covered in the lesson section “Platform requirements”?",
      "options": [
        "Job steps that touch the domain need a domain account or a proxy",
        "Linux is a first-class platform from SQL Server 2017 onwards (RHEL, Ubuntu, SUSE) with the same engine and mostly the same DMVs — but this roadmap assumes Windows service…",
        "Default virtual account is fine on a single server; use a domain account when accessing domain resources (linked servers, file shares)"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Linux is a first-class platform from SQL Server 2017 onwards (RHEL, Ubuntu, SUSE) with the same engine and mostly the same DMVs — but this roadmap assumes Windows service management unless stated otherwise.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Accounts and permissions”?",
      "options": [
        "Service account passwords are a classic outage: a domain policy forces rotation, the service cannot start on reboot, and the database is offline at boot.",
        "Disconnected servers need the prerequisites staged offline",
        "Core count matters more than speed for OLTP"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Service account passwords are a classic outage: a domain policy forces rotation, the service cannot start on reboot, and the database is offline at boot. Either use managed virtual accounts or integrate with Group Managed Service Accounts (gMSA) where the environment supports them.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pre-flight checks”?",
      "options": [
        "Core count matters more than speed for OLTP",
        "Sizing is a workload exercise: 16 GB+ for anything production",
        "The last line lists instances already installed — the fastest way to avoid a surprise name clash."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The last line lists instances already installed — the fastest way to avoid a surprise name clash. Also confirm: no pending reboot, correct time zone, firewall rules planned, and service accounts created with passwords that do not expire unexpectedly.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Running the install”?",
      "options": [
        "Data, log, tempdb, and backups each need their own capacity plan",
        "An installation is not finished when setup shows “Succeeded” — it is finished when a remote client connects, a backup restores somewhere else, and the configuration values are…",
        "Sizing is a workload exercise: 16 GB+ for anything production"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “An installation is not finished when setup shows “Succeeded” — it is finished when a remote client connects, a backup restores somewhere else, and the configuration values are recorded.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Decide before you click setup”?",
      "options": [
        "Sizing is a workload exercise: 16 GB+ for anything production",
        "Every decision made during a rushed install becomes a migration project later.",
        "Core count matters more than speed for OLTP"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Every decision made during a rushed install becomes a migration project later. Settle these first:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Platform requirements”?",
      "options": [
        "Requirements vary by version — always confirm against the official system requirements for the release you are installing — but the shape of them is stable:",
        "Windows-only versus mixed changes how every application connects",
        "The first SQL logins created during setup must be named, not shared"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Requirements vary by version — always confirm against the official system requirements for the release you are installing — but the shape of them is stable:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Accounts and permissions”?",
      "options": [
        "The first SQL logins created during setup must be named, not shared",
        "Requirements vary by version — always confirm against the official system requirements for the release you are installing — but the shape of them is stable:",
        "Setup needs enough privilege to create services, write registry keys, and format nothing else — beyond that, everything should be least privilege:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Setup needs enough privilege to create services, write registry keys, and format nothing else — beyond that, everything should be least privilege:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pre-flight checks”?",
      "options": [
        "Linux is a first-class platform from SQL Server 2017 onwards (RHEL, Ubuntu, SUSE) with the same engine and mostly the same DMVs — but this roadmap assumes Windows service…",
        "Run these before the maintenance window, not during it:",
        "Requirements vary by version — always confirm against the official system requirements for the release you are installing — but the shape of them is stable:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Run these before the maintenance window, not during it:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Running the install”?",
      "options": [
        "With decisions made and checks passed, the mechanics are straightforward — discipline matters more than technique:",
        "Linux is a first-class platform from SQL Server 2017 onwards (RHEL, Ubuntu, SUSE) with the same engine and mostly the same DMVs — but this roadmap assumes Windows service…",
        "Match the OS to the SQL version's support matrix — never guess"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “With decisions made and checks passed, the mechanics are straightforward — discipline matters more than technique:”"
    },
    {
      "question": "In the “Decide before you click setup” table, what is listed for “Version and edition” under “Why it must be early”?",
      "options": [
        "Itanium and x86 are long gone",
        "Disconnected servers need the prerequisites staged offline",
        "Fixes feature set, limits, and licence cost (see ch05-01, ch05-02)"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “Version and edition” as “Fixes feature set, limits, and licence cost (see ch05-01, ch05-02)”."
    },
    {
      "question": "Which fact is covered in the lesson section “Platform requirements”?",
      "options": [
        "Job steps that touch the domain need a domain account or a proxy",
        "Linux is a first-class platform from SQL Server 2017 onwards (RHEL, Ubuntu, SUSE) with the same engine and mostly the same DMVs — but this roadmap assumes Windows service…",
        "Default virtual account is fine on a single server; use a domain account when accessing domain resources (linked servers, file shares)"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Linux is a first-class platform from SQL Server 2017 onwards (RHEL, Ubuntu, SUSE) with the same engine and mostly the same DMVs — but this roadmap assumes Windows service management unless stated otherwise.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Accounts and permissions”?",
      "options": [
        "Service account passwords are a classic outage: a domain policy forces rotation, the service cannot start on reboot, and the database is offline at boot.",
        "Disconnected servers need the prerequisites staged offline",
        "Core count matters more than speed for OLTP"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Service account passwords are a classic outage: a domain policy forces rotation, the service cannot start on reboot, and the database is offline at boot. Either use managed virtual accounts or integrate with Group Managed Service Accounts (gMSA) where the environment supports them.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pre-flight checks”?",
      "options": [
        "Core count matters more than speed for OLTP",
        "Sizing is a workload exercise: 16 GB+ for anything production",
        "The last line lists instances already installed — the fastest way to avoid a surprise name clash."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The last line lists instances already installed — the fastest way to avoid a surprise name clash. Also confirm: no pending reboot, correct time zone, firewall rules planned, and service accounts created with passwords that do not expire unexpectedly.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Running the install”?",
      "options": [
        "Data, log, tempdb, and backups each need their own capacity plan",
        "An installation is not finished when setup shows “Succeeded” — it is finished when a remote client connects, a backup restores somewhere else, and the configuration values are…",
        "Sizing is a workload exercise: 16 GB+ for anything production"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “An installation is not finished when setup shows “Succeeded” — it is finished when a remote client connects, a backup restores somewhere else, and the configuration values are recorded.”"
    }
  ],
  takeaways: [
    "Decide edition, instance name, collation, paths, accounts, and auth mode before setup runs",
    "Confirm OS, framework, and hardware against the official requirements for your version",
    "Setup needs local admin; service accounts need least privilege and non-expiring credentials",
    "Run pre-flight checks the day before — pending reboots and missing .NET top the failure list",
    "Installation finishes with verification: services, remote connectivity, backup, recorded configuration"
  ]
};
