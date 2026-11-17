/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch05-06.html */

window.TOPIC = {
  id: "ch05-06",
  title: "Hardware and Software Prerequisites",

  lead: "Hardware prerequisites are not box-ticking — CPU, memory, and above all storage layout determine whether the instance you install today is still healthy under load two years from now.",

  objectives: [
    "Size CPU and memory for a SQL Server workload",
    "Design storage: separate data, log, tempdb, and backups",
    "Apply OS-level settings: power plan, page file, antivirus exclusions",
    "List the software prerequisites setup depends on",
    "Use a pre-install checklist to catch problems before the window"
  ],

  sections: [
    {
      h: "CPU and memory",
      html: `
<p>There is no universal core count — but there are rules of thumb that avoid the common disasters:</p>
<table>
  <tr><th>Workload</th><th>CPU starting point</th><th>RAM starting point</th><th>Notes</th></tr>
  <tr><td>Small internal app</td><td>4 cores</td><td>16 GB</td><td>Set max server memory explicitly</td></tr>
  <tr><td>Mid-size OLTP</td><td>8–16 cores</td><td>64 GB</td><td>Leave 4 GB for the OS; tempdb on fast storage</td></tr>
  <tr><td>Large OLTP / mixed</td><td>16–32 cores</td><td>128–256 GB</td><td>Watch NUMA boundaries; Standard caps at 128 GB</td></tr>
  <tr><td>Reporting / analytics</td><td>16+ cores</td><td>256 GB+</td><td>Memory-hungry; separate from OLTP where possible</td></tr>
</table>
<ul>
  <li><strong>CPU:</strong> OLTP scales poorly past a handful of sockets — fewer, faster cores beat many slow cores; set <code>max degree of parallelism</code> deliberately</li>
  <li><strong>RAM:</strong> always set <code>max server memory</code> explicitly so SQL Server does not starve the OS (and any co-installed services)</li>
  <li><strong>NUMA:</strong> on multi-socket hosts, understand how memory attaches to nodes before assuming linear scaling</li>
  <li><strong>Edition caps:</strong> Express 1 GB, Standard 128 GB — hardware above the cap is wasted</li>
</ul>
`
    },
    {
      h: "Storage — the part people get wrong",
      html: `
<p>Nearly every “SQL Server is slow” investigation eventually reaches disk. Lay volumes out correctly at build time:</p>
<table>
  <tr><th>File type</th><th>Placement</th><th>Why</th></tr>
  <tr><td><strong>Data files (MDF/NDF)</strong></td><td>Fast shared volume (SSD/NVMe), separate from log</td><td>Random 8 KB reads; contention shows up as PAGEIOLATCH waits</td></tr>
  <tr><td><strong>Transaction log (LDF)</strong></td><td>Separate physical device from data</td><td>Sequential writes, zero tolerance for stalls — log write latency above ~20 ms hurts</td></tr>
  <tr><td><strong>tempdb</strong></td><td>Fastest available storage, separate from user data</td><td>Shared by every session; temp tables and sorts live here</td></tr>
  <tr><td><strong>Backups</strong></td><td>Separate volume or target share</td><td>Backup I/O must never compete with the live log</td></tr>
  <tr><td><strong>OS / page file</strong></td><td>Own small volume</td><td>Never let Windows and SQL data share a spindle</td></tr>
</table>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Recommended storage layout">
    <defs>
      <marker id="sto-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="20" y="24" width="720" height="52" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="55" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">SQL Server host — volumes sized from the capacity plan, not the installer defaults</text>

    <rect x="20" y="110" width="165" height="90" rx="10" fill="var(--surface)" stroke="var(--border)"/>
    <text x="102" y="138" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">C: OS + page file</text>
    <text x="102" y="160" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">small, dedicated</text>
    <text x="102" y="180" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">no SQL data, ever</text>

    <rect x="198" y="110" width="165" height="90" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="280" y="138" text-anchor="middle" fill="var(--accent-strong)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">D: Data files</text>
    <text x="280" y="160" text-anchor="middle" fill="var(--text)" font-size="11" font-family="Segoe UI, sans-serif">MDF / NDF · SSD</text>
    <text x="280" y="180" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">random I/O, sized for growth</text>

    <rect x="376" y="110" width="165" height="90" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="458" y="138" text-anchor="middle" fill="var(--accent-strong)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">E: Transaction log</text>
    <text x="458" y="160" text-anchor="middle" fill="var(--text)" font-size="11" font-family="Segoe UI, sans-serif">LDF · own device</text>
    <text x="458" y="180" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">sequential, low latency</text>

    <rect x="554" y="110" width="186" height="90" rx="10" fill="var(--surface)" stroke="var(--amber)" stroke-width="1.8"/>
    <text x="647" y="138" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">F: tempdb + backups</text>
    <text x="647" y="160" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">tempdb on fastest storage</text>
    <text x="647" y="180" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">backups off the data path</text>

    <rect x="20" y="238" width="345" height="76" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="192" y="264" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Rules that matter at runtime</text>
    <text x="192" y="288" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">log latency &lt; 20 ms · instant file initialization on</text>
    <text x="192" y="306" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">grow files by fixed size, never by percent</text>

    <rect x="395" y="238" width="345" height="76" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="567" y="264" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Capacity</text>
    <text x="567" y="288" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">plan for 2–3× current size · keep 20 % free</text>
    <text x="567" y="306" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">monitor volume free space, not just file size</text>

    <line x1="380" y1="76" x2="380" y2="106" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#sto-arrow)"/>
  </svg>
  <div class="figcaption">Figure 1 — Separate OS, data, log, and backup paths; tempdb gets the fastest storage available.</div>
</div>
<p>Two more storage decisions: enable <strong>instant file initialization</strong> for data files (the “Perform Volume Maintenance Tasks” right) so growth does not stall for minutes, and set file growth in <strong>fixed increments</strong> — percent growth on a 500 GB file triggers multi-gigabyte autogrowth events that block writes.</p>
`
    },
    {
      h: "OS-level settings that affect SQL Server",
      html: `
<table>
  <tr><th>Setting</th><th>Recommended</th><th>Why</th></tr>
  <tr><td>Power plan</td><td>High Performance (or the vendor's equivalent)</td><td>Balanced/power-saving throttles CPUs mid-workload</td></tr>
  <tr><td>Page file</td><td>Fixed size on its own volume</td><td>A paging file on the data volume competes with log writes</td></tr>
  <tr><td>Antivirus / EDR</td><td>Exclude data, log, backup, and bin directories + <code>sqlservr.exe</code></td><td>Real-time scanning of 8 KB pages causes latency spikes</td></tr>
  <tr><td>Lock pages in memory</td><td>Granted to the service account (with care)</td><td>Prevents the buffer pool from being paged out on memory pressure</td></tr>
  <tr><td>Windows updates / reboots</td><td>Scheduled, monitored, coordinated</td><td>Unexpected reboots take every instance on the host with them</td></tr>
  <tr><td>Domain Group Policy</td><td>Reviewed before installation</td><td>Password rotation policies can silently stop services</td></tr>
</table>
<p>Antivirus exclusions are the sneakiest: latency climbs gradually after the security team deploys a new agent, and the database looks healthy until the log write queue backs up.</p>
`
    },
    {
      h: "Software prerequisites",
      html: `
<p>What setup expects to find (or installs itself):</p>
<table>
  <tr><th>Prerequisite</th><th>Purpose</th><th>If missing</th></tr>
  <tr><td>.NET Framework / .NET runtime components</td><td>Shared features, tools, some engine components</td><td>Setup rule fails; stage offline media on disconnected hosts</td></tr>
  <tr><td>Visual C++ redistributables</td><td>Native components shipped with SQL</td><td>Usually installed by setup automatically</td></tr>
  <tr><td>Windows features (e.g. Failover Clustering)</td><td>Only for failover cluster instances</td><td>Add via Server Manager or PowerShell before clustered setup</td></tr>
  <tr><td>Administrative shares and permissions</td><td>Remote setup and administration</td><td>Setup cannot write to target paths</td></tr>
  <tr><td>Correct time synchronisation</td><td>Kerberos, replication, job scheduling</td><td>Auth failures and skewed job run times</td></tr>
  <tr><td>Static IP / DNS records</td><td>Client connectivity, AG listeners</td><td>Connections break after DHCP renewal</td></tr>
</table>
<p>Also pre-create the <strong>domain groups for SQL administrators</strong> and the service accounts with passwords that will not rotate without notice. Doing this after installation, during an incident, is how shared “sqlservice” accounts with unknown passwords get invented.</p>
`
    },
    {
      h: "The pre-install checklist",
      html: `
<p>A ten-minute check that saves a ten-hour incident:</p>
<table>
  <tr><th>✔</th><th>Check</th><th>Tool</th></tr>
  <tr><td>☐</td><td>OS version matches the SQL support matrix</td><td>Get-ComputerInfo</td></tr>
  <tr><td>☐</td><td>No pending reboot; disk space above threshold on every volume</td><td>Test-Path pending reboot keys; Get-Volume</td></tr>
  <tr><td>☐</td><td>Data, log, tempdb, backup volumes exist with correct free space</td><td>Get-Volume / storage team sign-off</td></tr>
  <tr><td>☐</td><td>Physical disks healthy, correct bus type (NVMe/SSD vs SATA)</td><td>Get-PhysicalDisk, Get-Disk</td></tr>
  <tr><td>☐</td><td>Service accounts created; admin group populated</td><td>Active Directory</td></tr>
  <tr><td>☐</td><td>Power plan set; antivirus exclusions agreed with security</td><td>powercfg; security ticket</td></tr>
  <tr><td>☐</td><td>Firewall rules prepared for the chosen static ports</td><td>netsh advfirewall</td></tr>
</table>
<pre><code class="powershell"># Hardware and volume sanity check before installation
Get-PhysicalDisk | Sort-Object FriendlyName | Format-Table FriendlyName, MediaType, BusType, HealthStatus, Size
Get-Disk | Format-Table Number, BusType, OperationalStatus, Size
Get-Volume | Where-Object DriveLetter | Format-Table DriveLetter, FileSystemLabel, FileSystem, SizeRemaining, Size
powercfg /getactivescheme</code></pre>
<pre><code class="language-sql">-- After install: where did setup put everything, and how big is it?
SELECT DB_NAME(database_id) AS database_name, name, physical_name, type_desc,
       size * 8 / 1024 AS size_mb, growth, is_percent_growth
FROM   sys.master_files
ORDER  BY database_id, type_desc;</code></pre>
`
    }
  ],

  scenario: {
    title: "2 AM — the log volume is full and SQL Server has stopped writing",
    html: `
<p>A newly provisioned server arrived with a single 2 TB volume “to keep it simple”. Data, log, backups, and the page file all landed on C:. For months it worked. Then a backup job retention bug filled the volume with old backups the same night a large data-load ran: transaction log growth failed with error 823, transactions began blocking, and the application went down with the database in a partially unavailable state.</p>
<p>Resolution: delete expired backups to reclaim space (immediate relief), verify log integrity with DBCC CHECKDB after recovery, then move the log to a new dedicated volume — <code>ALTER DATABASE … MODIFY FILE</code>, restart, confirm — and relocate the backup target. Prevention: storage layout is now part of the provisioning standard (OS, data, log, tempdb, backup on separate volumes), an alert fires at 20 % free space on any SQL volume, and backup retention is tested before it is trusted.</p>
`
  },

  interview: [
    {
      q: "Why must the transaction log be on a separate device from the data files?",
      a: "Log writes are sequential and latency-sensitive; data reads are random. Sharing a device means random data I/O stalls log writes, which stalls every committed transaction. Separating them keeps log latency predictable — under about 20 ms — and makes capacity planning independent."
    },
    {
      q: "Which OS settings do you change on a new SQL Server?",
      a: "High performance power plan, a fixed page file on its own volume, antivirus exclusions for SQL data/log/backup directories and sqlservr.exe, lock pages in memory for the service account where appropriate, and confirmation that Group Policy will not rotate service account passwords unexpectedly."
    },
    {
      q: "How do you size tempdb at installation?",
      a: "Start with one file per visible scheduler up to eight files, equal sizes, on the fastest storage, with fixed-size growth (not percent). Monitor sys.dm_db_file_space_usage and wait statistics (PAGELATCH_UP on tempdb) afterwards and adjust to the real workload."
    }
  ],

  quiz: [
    {
      "question": "Which fact is covered in the lesson section “CPU and memory”?",
      "options": [
        "There is no universal core count — but there are rules of thumb that avoid the common disasters:",
        "Never let Windows and SQL data share a spindle",
        "Antivirus exclusions are the sneakiest: latency climbs gradually after the security team deploys a new agent, and the database looks healthy until the log write queue backs up."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “There is no universal core count — but there are rules of thumb that avoid the common disasters:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Storage — the part people get wrong”?",
      "options": [
        "A paging file on the data volume competes with log writes",
        "Real-time scanning of 8 KB pages causes latency spikes",
        "Nearly every “SQL Server is slow” investigation eventually reaches disk."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Nearly every “SQL Server is slow” investigation eventually reaches disk. Lay volumes out correctly at build time:”"
    },
    {
      "question": "Which fact is covered in the lesson section “OS-level settings that affect SQL Server”?",
      "options": [
        "Shared by every session; temp tables and sorts live here",
        "Antivirus exclusions are the sneakiest: latency climbs gradually after the security team deploys a new agent, and the database looks healthy until the log write queue backs up.",
        "Sequential writes, zero tolerance for stalls — log write latency above ~20 ms hurts"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Antivirus exclusions are the sneakiest: latency climbs gradually after the security team deploys a new agent, and the database looks healthy until the log write queue backs up.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Software prerequisites”?",
      "options": [
        "What setup expects to find (or installs itself):",
        "Shared by every session; temp tables and sorts live here",
        "Backup I/O must never compete with the live log"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “What setup expects to find (or installs itself):”"
    },
    {
      "question": "Which fact is covered in the lesson section “The pre-install checklist”?",
      "options": [
        "Backup I/O must never compete with the live log",
        "Never let Windows and SQL data share a spindle",
        "A ten-minute check that saves a ten-hour incident:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A ten-minute check that saves a ten-hour incident:”"
    },
    {
      "question": "In the “CPU and memory” table, what is listed for “Small internal app” under “Notes”?",
      "options": [
        "Balanced/power-saving throttles CPUs mid-workload",
        "Set max server memory explicitly",
        "Antivirus exclusions are the sneakiest: latency climbs gradually after the security team deploys a new agent, and the database looks healthy until the log write queue backs up."
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Small internal app” as “Set max server memory explicitly”."
    },
    {
      "question": "Complete the lesson statement: “Two more storage decisions: enable _____ for data files (the “Perform Volume Maintenance Tasks” right) so growth does not stall for minutes, and set file growth in fixed increments…”",
      "options": [
        "instant file initialization",
        "Set max server memory explicitly",
        "Leave 4 GB for the OS; tempdb on fast storage"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Two more storage decisions: enable instant file initialization for data files (the “Perform Volume Maintenance Tasks” right) so growth does not stall for minutes, and set file growth in fixed increments — percent growth on a 500 GB file triggers multi-gigabyte autogrowth events that block writes.”"
    },
    {
      "question": "In the “OS-level settings that affect SQL Server” table, what is listed for “Power plan” under “Why”?",
      "options": [
        "Sequential writes, zero tolerance for stalls — log write latency above ~20 ms hurts",
        "Shared by every session; temp tables and sorts live here",
        "Balanced/power-saving throttles CPUs mid-workload"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “Power plan” as “Balanced/power-saving throttles CPUs mid-workload”."
    },
    {
      "question": "Complete the lesson statement: “Also pre-create the _____ and the service accounts with passwords that will not rotate without notice.”",
      "options": [
        "Memory-hungry; separate from OLTP where possible",
        "domain groups for SQL administrators",
        "Watch NUMA boundaries; Standard caps at 128 GB"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Also pre-create the domain groups for SQL administrators and the service accounts with passwords that will not rotate without notice. Doing this after installation, during an incident, is how shared “sqlservice” accounts with unknown passwords get invented.”"
    },
    {
      "question": "In the “The pre-install checklist” table, what is listed for “☐” under “Tool”?",
      "options": [
        "Get-ComputerInfo",
        "Shared by every session; temp tables and sorts live here",
        "Backup I/O must never compete with the live log"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “☐” as “Get-ComputerInfo”."
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “CPU and memory”?",
      "options": [
        "There is no universal core count — but there are rules of thumb that avoid the common disasters:",
        "Never let Windows and SQL data share a spindle",
        "Antivirus exclusions are the sneakiest: latency climbs gradually after the security team deploys a new agent, and the database looks healthy until the log write queue backs up."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “There is no universal core count — but there are rules of thumb that avoid the common disasters:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Storage — the part people get wrong”?",
      "options": [
        "A paging file on the data volume competes with log writes",
        "Real-time scanning of 8 KB pages causes latency spikes",
        "Nearly every “SQL Server is slow” investigation eventually reaches disk."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Nearly every “SQL Server is slow” investigation eventually reaches disk. Lay volumes out correctly at build time:”"
    },
    {
      "question": "Which fact is covered in the lesson section “OS-level settings that affect SQL Server”?",
      "options": [
        "Shared by every session; temp tables and sorts live here",
        "Antivirus exclusions are the sneakiest: latency climbs gradually after the security team deploys a new agent, and the database looks healthy until the log write queue backs up.",
        "Sequential writes, zero tolerance for stalls — log write latency above ~20 ms hurts"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Antivirus exclusions are the sneakiest: latency climbs gradually after the security team deploys a new agent, and the database looks healthy until the log write queue backs up.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Software prerequisites”?",
      "options": [
        "What setup expects to find (or installs itself):",
        "Shared by every session; temp tables and sorts live here",
        "Backup I/O must never compete with the live log"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “What setup expects to find (or installs itself):”"
    },
    {
      "question": "Which fact is covered in the lesson section “The pre-install checklist”?",
      "options": [
        "Backup I/O must never compete with the live log",
        "Never let Windows and SQL data share a spindle",
        "A ten-minute check that saves a ten-hour incident:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A ten-minute check that saves a ten-hour incident:”"
    },
    {
      "question": "In the “CPU and memory” table, what is listed for “Small internal app” under “Notes”?",
      "options": [
        "Balanced/power-saving throttles CPUs mid-workload",
        "Set max server memory explicitly",
        "Antivirus exclusions are the sneakiest: latency climbs gradually after the security team deploys a new agent, and the database looks healthy until the log write queue backs up."
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Small internal app” as “Set max server memory explicitly”."
    },
    {
      "question": "Complete the lesson statement: “Two more storage decisions: enable _____ for data files (the “Perform Volume Maintenance Tasks” right) so growth does not stall for minutes, and set file growth in fixed increments…”",
      "options": [
        "instant file initialization",
        "Set max server memory explicitly",
        "Leave 4 GB for the OS; tempdb on fast storage"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Two more storage decisions: enable instant file initialization for data files (the “Perform Volume Maintenance Tasks” right) so growth does not stall for minutes, and set file growth in fixed increments — percent growth on a 500 GB file triggers multi-gigabyte autogrowth events that block writes.”"
    },
    {
      "question": "In the “OS-level settings that affect SQL Server” table, what is listed for “Power plan” under “Why”?",
      "options": [
        "Sequential writes, zero tolerance for stalls — log write latency above ~20 ms hurts",
        "Shared by every session; temp tables and sorts live here",
        "Balanced/power-saving throttles CPUs mid-workload"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “Power plan” as “Balanced/power-saving throttles CPUs mid-workload”."
    },
    {
      "question": "Complete the lesson statement: “Also pre-create the _____ and the service accounts with passwords that will not rotate without notice.”",
      "options": [
        "Memory-hungry; separate from OLTP where possible",
        "domain groups for SQL administrators",
        "Watch NUMA boundaries; Standard caps at 128 GB"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Also pre-create the domain groups for SQL administrators and the service accounts with passwords that will not rotate without notice. Doing this after installation, during an incident, is how shared “sqlservice” accounts with unknown passwords get invented.”"
    },
    {
      "question": "In the “The pre-install checklist” table, what is listed for “☐” under “Tool”?",
      "options": [
        "Get-ComputerInfo",
        "Shared by every session; temp tables and sorts live here",
        "Backup I/O must never compete with the live log"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “☐” as “Get-ComputerInfo”."
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “CPU and memory”?",
      "options": [
        "There is no universal core count — but there are rules of thumb that avoid the common disasters:",
        "Never let Windows and SQL data share a spindle",
        "Antivirus exclusions are the sneakiest: latency climbs gradually after the security team deploys a new agent, and the database looks healthy until the log write queue backs up."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “There is no universal core count — but there are rules of thumb that avoid the common disasters:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Storage — the part people get wrong”?",
      "options": [
        "A paging file on the data volume competes with log writes",
        "Real-time scanning of 8 KB pages causes latency spikes",
        "Nearly every “SQL Server is slow” investigation eventually reaches disk."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Nearly every “SQL Server is slow” investigation eventually reaches disk. Lay volumes out correctly at build time:”"
    },
    {
      "question": "Which fact is covered in the lesson section “OS-level settings that affect SQL Server”?",
      "options": [
        "Shared by every session; temp tables and sorts live here",
        "Antivirus exclusions are the sneakiest: latency climbs gradually after the security team deploys a new agent, and the database looks healthy until the log write queue backs up.",
        "Sequential writes, zero tolerance for stalls — log write latency above ~20 ms hurts"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Antivirus exclusions are the sneakiest: latency climbs gradually after the security team deploys a new agent, and the database looks healthy until the log write queue backs up.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Software prerequisites”?",
      "options": [
        "What setup expects to find (or installs itself):",
        "Shared by every session; temp tables and sorts live here",
        "Backup I/O must never compete with the live log"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “What setup expects to find (or installs itself):”"
    },
    {
      "question": "Which fact is covered in the lesson section “The pre-install checklist”?",
      "options": [
        "Backup I/O must never compete with the live log",
        "Never let Windows and SQL data share a spindle",
        "A ten-minute check that saves a ten-hour incident:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A ten-minute check that saves a ten-hour incident:”"
    },
    {
      "question": "In the “CPU and memory” table, what is listed for “Small internal app” under “Notes”?",
      "options": [
        "Balanced/power-saving throttles CPUs mid-workload",
        "Set max server memory explicitly",
        "Antivirus exclusions are the sneakiest: latency climbs gradually after the security team deploys a new agent, and the database looks healthy until the log write queue backs up."
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Small internal app” as “Set max server memory explicitly”."
    },
    {
      "question": "Complete the lesson statement: “Two more storage decisions: enable _____ for data files (the “Perform Volume Maintenance Tasks” right) so growth does not stall for minutes, and set file growth in fixed increments…”",
      "options": [
        "instant file initialization",
        "Set max server memory explicitly",
        "Leave 4 GB for the OS; tempdb on fast storage"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Two more storage decisions: enable instant file initialization for data files (the “Perform Volume Maintenance Tasks” right) so growth does not stall for minutes, and set file growth in fixed increments — percent growth on a 500 GB file triggers multi-gigabyte autogrowth events that block writes.”"
    },
    {
      "question": "In the “OS-level settings that affect SQL Server” table, what is listed for “Power plan” under “Why”?",
      "options": [
        "Sequential writes, zero tolerance for stalls — log write latency above ~20 ms hurts",
        "Shared by every session; temp tables and sorts live here",
        "Balanced/power-saving throttles CPUs mid-workload"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “Power plan” as “Balanced/power-saving throttles CPUs mid-workload”."
    },
    {
      "question": "Complete the lesson statement: “Also pre-create the _____ and the service accounts with passwords that will not rotate without notice.”",
      "options": [
        "Memory-hungry; separate from OLTP where possible",
        "domain groups for SQL administrators",
        "Watch NUMA boundaries; Standard caps at 128 GB"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Also pre-create the domain groups for SQL administrators and the service accounts with passwords that will not rotate without notice. Doing this after installation, during an incident, is how shared “sqlservice” accounts with unknown passwords get invented.”"
    },
    {
      "question": "In the “The pre-install checklist” table, what is listed for “☐” under “Tool”?",
      "options": [
        "Get-ComputerInfo",
        "Shared by every session; temp tables and sorts live here",
        "Backup I/O must never compete with the live log"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “☐” as “Get-ComputerInfo”."
    }
  ],
  takeaways: [
    "Separate OS, data, log, tempdb, and backup storage — shared volumes cause the classic outages",
    "Set max server memory explicitly; leave headroom for the OS and other services",
    "High performance power plan, fixed page file, antivirus exclusions, instant file initialization",
    "Stage .NET/framework prerequisites, service accounts, and firewall rules before the window",
    "Pre-install checklist plus post-install verification queries turn installation into a repeatable process"
  ]
};
