/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch03-04.html */

window.TOPIC = {
  id: "ch03-04",
  title: "CPU, RAM, and Storage Fundamentals",

  lead: "Every SQL Server performance problem eventually maps to one of three resources: processor time, memory, or disk. Learn what each one does, how it fails, and how to measure it — and you can separate 'the query is bad' from 'the hardware is starved' in minutes.",

  objectives: [
    "Explain how CPU cores, sockets, and scheduling relate to SQL Server",
    "Describe the memory hierarchy and why SQL Server wants most of the RAM",
    "Distinguish storage latency, throughput, and IOPS",
    "Read the key Windows performance counters for each resource",
    "Recognise the classic symptoms of each resource running out"
  ],

  sections: [
    {
      h: "CPU: cores, sockets, and schedulers",
      html: `
<p>The CPU executes instructions. SQL Server creates schedulers for logical processors available to the Database Engine, subject to configuration and edition limits; worker tasks take turns running on schedulers. For a DBA, sustained runnable-task queues and CPU time are more useful than the processor's advertised clock speed alone.</p>
<table>
  <tr><th>Term</th><th>What it is</th><th>DBA relevance</th></tr>
  <tr><td><strong>Socket</strong></td><td>Physical CPU package in the socket</td><td>NUMA boundaries — cross-socket memory access is slower</td></tr>
  <tr><td><strong>Core</strong></td><td>Independent execution unit inside a socket</td><td>Where parallel query workers actually run</td></tr>
  <tr><td><strong>Logical processor</strong></td><td>Core × hyperthreading</td><td>What Windows shows and what SQL schedulers count</td></tr>
  <tr><td><strong>Runnable task</strong></td><td>Work ready for a scheduler</td><td>A persistent queue can indicate CPU pressure; compare it with a baseline</td></tr>
</table>
<p><strong>MAXDOP</strong> limits processors used by parallel plan execution; it doesn't guarantee a query will use that many. The cost threshold influences when the optimizer considers parallel plans. Set both using workload evidence and current guidance, not as one-size-fits-all hardware switches.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="CPU, memory, and storage data path">
    <defs>
      <marker id="hw-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="30" y="40" width="200" height="90" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="130" y="72" text-anchor="middle" fill="var(--accent-strong)" font-size="16" font-weight="700" font-family="Segoe UI, sans-serif">CPU</text>
    <text x="130" y="96" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">nanoseconds · schedulers</text>
    <text x="130" y="116" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">% Processor Time · queue</text>

    <rect x="280" y="40" width="200" height="90" rx="12" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="380" y="72" text-anchor="middle" fill="var(--text)" font-size="16" font-weight="700" font-family="Segoe UI, sans-serif">RAM</text>
    <text x="380" y="96" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">microseconds · buffer pool</text>
    <text x="380" y="116" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">Available MB · page life</text>

    <rect x="530" y="40" width="200" height="90" rx="12" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="630" y="72" text-anchor="middle" fill="var(--text)" font-size="16" font-weight="700" font-family="Segoe UI, sans-serif">Storage</text>
    <text x="630" y="96" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">milliseconds · pages/bytes</text>
    <text x="630" y="116" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">Avg. Disk sec · queue length</text>

    <rect x="140" y="220" width="480" height="80" rx="12" fill="var(--surface)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="380" y="252" text-anchor="middle" fill="var(--accent-strong)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">SQL Server query execution</text>
    <text x="380" y="278" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-family="Segoe UI, sans-serif">plan → compute on CPU → pages from RAM → misses fall through to disk</text>

    <line x1="130" y1="220" x2="250" y2="136" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#hw-arrow)"/>
    <line x1="380" y1="220" x2="380" y2="136" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#hw-arrow)"/>
    <line x1="630" y1="220" x2="510" y2="136" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#hw-arrow)"/>

    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Latency varies by hardware and workload; measure the resources that queries actually wait on.</text>
  </svg>
  <div class="figcaption">Figure 1 — The resource path: compute in CPU, pages in RAM, persistence on disk.</div>
</div>
`
    },
    {
      h: "RAM: the tier SQL Server lives in",
      html: `
<p>SQL Server uses memory for the buffer pool, plans, execution workspaces, and other features. Memory access is usually faster than storage I/O, but actual latency depends on the system and workload; sorts and hash operations can spill to tempdb when grants are insufficient.</p>
<p>Windows and other processes also need memory. Configure <code>max server memory</code> to leave appropriate headroom for the OS, drivers, and other workloads. SQL Server Setup has provided a recommendation since SQL Server 2019, but the right value depends on the host and the allocations the setting does not cover.</p>
<pre><code class="language-powershell">Get-Counter '\\Memory\\Available MBytes', '\\Memory\\Pages/sec', '\\Memory\\Committed Bytes' -SampleInterval 5 -MaxSamples 3
Get-Counter '\\SQLServer:Buffer Manager\\Page life expectancy', '\\SQLServer:Memory Manager\\Memory Grants Pending' -SampleInterval 5 -MaxSamples 3</code></pre>
<p>Set <code>max server memory</code> deliberately for each instance, accounting for OS needs, other instances, and memory used outside that limit. Interpret <strong>Available MBytes</strong> and buffer-pool indicators such as <strong>Page life expectancy</strong> in context and over time; neither is a standalone diagnosis.</p>
`
    },
    {
      h: "Storage: latency, throughput, and IOPS",
      html: `
<p>Storage is the slowest tier and the most common bottleneck in production. Three properties describe it, and they fail independently. A device can be fast at one and poor at the other two, so always name which property your workload depends on:</p>
<table>
  <tr><th>Property</th><th>Means</th><th>Healthy (data files)</th><th>Symptom when low</th></tr>
  <tr><td><strong>Latency</strong></td><td>Time per I/O operation</td><td>Compare with workload requirements and a healthy baseline</td><td>Queries may wait on PAGEIOLATCH or WRITELOG</td></tr>
  <tr><td><strong>IOPS</strong></td><td>Operations per second</td><td>Depends on device class</td><td>Queue grows, throughput collapses</td></tr>
  <tr><td><strong>Throughput</strong></td><td>Bytes per second</td><td>Hundreds of MB/s+</td><td>Backups and scans crawl</td></tr>
</table>
<p>SQL Server can expose storage-related waits such as <strong>PAGEIOLATCH_*</strong> for page reads, <strong>WRITELOG</strong> for log flushes, and <strong>ASYNC_IO_COMPLETION</strong> for some asynchronous I/O. Interpret waits with file latency and workload data; fully durable commits depend on log flushes, while group commit and delayed durability affect the relationship to individual transactions.</p>
<pre><code class="language-powershell">Get-Counter '\\PhysicalDisk(_Total)\\Avg. Disk sec/Transfer', '\\PhysicalDisk(_Total)\\Avg. Disk Queue Length', '\\PhysicalDisk(_Total)\\Disk Bytes/sec' -SampleInterval 5 -MaxSamples 5</code></pre>
`
    },
    {
      h: "Matching counters to symptoms",
      html: `
<p>When a user says "the server is slow", triage the three resources in this order — it takes about five minutes:</p>
<table>
  <tr><th>Observed</th><th>Resource</th><th>Next check</th></tr>
  <tr><td>CPU high and runnable queues persist</td><td><strong>CPU</strong></td><td>Processor counters, top CPU queries, scheduler queues, MAXDOP</td></tr>
  <tr><td>CPU idle but everything slow</td><td><strong>Memory</strong></td><td>Available MBytes, page life expectancy, PAGEIOLATCH waits</td></tr>
  <tr><td>Waits dominated by WRITELOG/PAGEIOLATCH</td><td><strong>Storage</strong></td><td>Avg. Disk sec/Transfer per volume, file-level stalls in DMVs</td></tr>
  <tr><td>Intermittent, no resource pegged</td><td><strong>Concurrency</strong></td><td>Blocking, tempdb contention, network latency</td></tr>
</table>
<p>The discipline is to <strong>measure before you change</strong>. A counter snapshot taken during the incident — plus one from a normal period — is the difference between an evidence-based fix and an expensive guess.</p>
<p>Keep the triage script ready before the incident, not during it:</p>
<pre><code class="language-powershell">Get-Counter '\\Processor(_Total)\\% Processor Time', '\\System\\Processor Queue Length', '\\Memory\\Available MBytes', '\\PhysicalDisk(_Total)\\Avg. Disk sec/Transfer' -SampleInterval 5 -MaxSamples 5</code></pre>
`
    },
    {
      h: "NUMA, sockets, and locality",
      html: `
<p>NUMA hardware groups processors and memory into nodes; their mapping to sockets varies by platform and virtualization. Local memory access is generally lower latency than remote-node access. SQL Server is NUMA-aware, but topology and workload determine whether locality is a bottleneck.</p>
<p>Why a DBA cares:</p>
<ul>
  <li><strong>Cross-node memory grants</strong> add latency to large sorts and hash joins</li>
  <li><strong>Soft-NUMA</strong> changes scheduler-node groupings; don't treat it as a general latch-contention fix</li>
  <li><strong>VM vCPU topology</strong> should be reviewed with the virtualization team when CPU or memory locality is implicated</li>
</ul>
<pre><code class="language-powershell">Get-Counter '\\NUMA Node Memory\\Total Mbytes' -SampleInterval 5 -MaxSamples 1
Get-CimInstance Win32_PerfRawData_Counters_ProcessorInformation | Select-Object -First 4 Name, ProcessorQueueLength</code></pre>
<p>Check <code>sys.dm_os_schedulers</code> in SQL Server: each scheduler belongs to a NUMA node, and a non-zero <code>yield_count</code> pattern across nodes tells you where work is landing.</p>
`
    },
    {
      h: "Sizing and capacity pitfalls",
      html: `
<ul>
  <li><strong>vCPU overcommitment:</strong> on a VM, host-level CPU contention manifests as mysterious slowness with no local cause — check with the hypervisor team, not just inside the guest</li>
  <li><strong>Thin-provisioned storage:</strong> the LUN reports free space that does not physically exist; performance collapses once the array fills</li>
  <li><strong>Shared spindles:</strong> putting data, log, and backups on one volume makes every backup a latency event for every query</li>
  <li><strong>Ignoring the log file:</strong> a log on slow storage caps throughput no matter how fast the data files are</li>
  <li><strong>No baseline:</strong> without normal numbers you cannot prove that the new report — or the new hardware — actually changed anything</li>
</ul>
<p>Watch for interactions: memory pressure can increase I/O, CPU pressure can delay work, and storage latency can extend waits. Correlate measurements before assigning a root cause or changing hardware.</p>
<p>Capacity planning starts with evidence: capture counters for a week under normal load, then project growth from business drivers (row counts, transaction volume) rather than from panic.</p>
`
    },
    {
      h: "Deeper dive: CPU, RAM, and Storage Fundamentals",
      html: `
<p>This section consolidates <strong>CPU, RAM, and Storage Fundamentals</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Event Viewer and Performance Monitor are the Windows-side diagnostic tools. The System and Application logs record service stops, disk errors and driver faults; Performance Monitor counter logs reveal CPU, memory and disk pressure over time.</p>
<p>Storage layout matters: data, logs and tempdb on separate volumes reduce I/O contention, and each volume's free space and latency directly affect database behaviour.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>CPU, RAM, and Storage Fundamentals sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Port</th><th>Used by</th><th>Protocol</th></tr>
  <tr><td>1433</td><td>Default instance / listener</td><td>TCP</td></tr>
  <tr><td>1434</td><td>SQL Server Browser</td><td>UDP</td></tr>
  <tr><td>5022</td><td>Availability group endpoints</td><td>TCP</td></tr>
</table>
<p>SQL Server runs on Windows, so the operating system is part of the database platform. Services, accounts, file permissions, networking and the event log are all things a DBA must understand to diagnose failures that look like database problems but are not.</p>
<p>Use the following as a starting point when investigating CPU, RAM, and Storage Fundamentals. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-powershell"># CPU, RAM, and Storage Fundamentals
Get-Volume | Select-Object DriveLetter, FileSystemLabel,
  @{n='FreeGB';e={[math]::Round($_.SizeRemaining/1GB,1)}},
  @{n='SizeGB';e={[math]::Round($_.Size/1GB,1)}} |
  Format-Table -AutoSize</code></pre>
<p>Windows services are long-running background processes. The SQL Server service, SQL Server Agent and several auxiliary services run under configured accounts; their start mode, state and dependencies determine whether the database is reachable after a reboot.</p>
      `,
    }
  ],

  scenario: {
    title: "CPU at 100% for six minutes every hour, then perfectly fine",
    html: `
<p>An order-processing server shows a clockwork CPU spike at the top of every hour, and queries time out during the window. The DBA correlates the timings with SQL Agent history and identifies a reporting job running a large scan at the same time as order processing.</p>
<p>Before changing MAXDOP or adding an index, the DBA captures query plans, CPU and scheduler data, and the competing workload. The job is rescheduled after review with the application owner; a query/index change is tested against representative data and measured before deployment. Prevention: retain a normal-period baseline and monitor the scheduled workload alongside SQL Server CPU.</p>
`
  },

  interview: [
    {
      q: "How do you tell a CPU-bound server from an I/O-bound one?",
      a: "Look at sustained CPU use, scheduler runnable queues, query CPU, relevant wait statistics, and per-volume or per-file latency together. High SOS_SCHEDULER_YIELD can support a CPU-pressure hypothesis; PAGEIOLATCH or WRITELOG can point toward I/O waits, but none proves a cause alone."
    },
    {
      q: "Why does SQL Server need max server memory configured explicitly?",
      a: "Configuring max server memory sets an upper bound for memory managed by SQL Server's memory manager and helps leave capacity for Windows and other workloads. The limit doesn't cover every SQL Server allocation, so size it using host and workload requirements."
    },
    {
      q: "What is the difference between latency, IOPS, and throughput?",
      a: "Latency is the time for one I/O operation; IOPS is how many operations the device completes per second; throughput is bytes moved per second. They are related but independent — a device can have high throughput with poor latency (large sequential reads) or decent latency that collapses under queue depth. SQL OLTP cares most about latency because every commit waits on the log."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “What matters for a DBA is not the clock speed on the box label but _____.”",
      "options": [
        "max degree of parallelism (MAXDOP)",
        "cost threshold for parallelism",
        "how many runnable tasks compete for schedulers"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The CPU executes instructions; SQL Server's schedulers map one-to-one onto logical processors and each running query task occupies a scheduler slot. What matters for a DBA is not the clock speed on the box label but how many runnable tasks compete for schedulers.”"
    },
    {
      "question": "Which fact is covered in the lesson section “RAM: the tier SQL Server lives in”?",
      "options": [
        "Storage is the slowest tier and the most common bottleneck in production.",
        "Memory is where the buffer pool caches 8-KB data and index pages, where plan cache stores compiled plans, and where sorts and hash joins spill if they do not fit.",
        "Persistent &gt; logical processors = CPU starvation"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Memory is where the buffer pool caches 8-KB data and index pages, where plan cache stores compiled plans, and where sorts and hash joins spill if they do not fit. A page served from RAM takes microseconds; the same page from disk takes milliseconds — three orders of magnitude, which is why memory sizing beats almost every other tuning step.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Storage: latency, throughput, and IOPS”?",
      "options": [
        "Storage is the slowest tier and the most common bottleneck in production.",
        "Memory is where the buffer pool caches 8-KB data and index pages, where plan cache stores compiled plans, and where sorts and hash joins spill if they do not fit.",
        "Windows itself competes for RAM: the file system cache, drivers, antivirus, and any other process on the box."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Storage is the slowest tier and the most common bottleneck in production. Three properties describe it, and they fail independently. A device can be fast at one and poor at the other two, so always name which property your workload depends on:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Matching counters to symptoms”?",
      "options": [
        "Windows itself competes for RAM: the file system cache, drivers, antivirus, and any other process on the box.",
        "Available MBytes",
        "When a user says \"the server is slow\", triage the three resources in this order — it takes about five minutes:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “When a user says \"the server is slow\", triage the three resources in this order — it takes about five minutes:”"
    },
    {
      "question": "Complete the lesson statement: “Modern servers group cores and memory into _____ (one per socket).”",
      "options": [
        "Latency",
        "NUMA nodes",
        "Page life expectancy"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Modern servers group cores and memory into NUMA nodes (one per socket). Memory inside a node is fast to reach; memory on the other socket costs extra hops. SQL Server is NUMA-aware: it allocates memory per node and schedules queries locally when it can.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Sizing and capacity pitfalls”?",
      "options": [
        "Watch for the interaction effects too: slow storage inflates CPU wait times, memory pressure pushes reads onto disk, and a starved CPU delays log flushes.",
        "Storage is the slowest tier and the most common bottleneck in production.",
        "IO waits"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Watch for the interaction effects too: slow storage inflates CPU wait times, memory pressure pushes reads onto disk, and a starved CPU delays log flushes. When all three counters look unhealthy, find the first domino rather than \"upgrading everything\".”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "IOPS",
        "Throughput",
        "CPU, RAM, and Storage Fundamentals"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates CPU, RAM, and Storage Fundamentals with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Complete the lesson statement: “Two SQL settings tie directly to the hardware: _____ caps how many schedulers one query may use, and cost threshold for parallelism decides when a plan may go parallel at all.”",
      "options": [
        "CPU",
        "max degree of parallelism (MAXDOP)",
        "IO waits"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Two SQL settings tie directly to the hardware: max degree of parallelism (MAXDOP) caps how many schedulers one query may use, and cost threshold for parallelism decides when a plan may go parallel at all. Misconfigured, they turn ordinary OLTP workloads into CPU storms.”"
    },
    {
      "question": "Which fact is covered in the lesson section “RAM: the tier SQL Server lives in”?",
      "options": [
        "Windows itself competes for RAM: the file system cache, drivers, antivirus, and any other process on the box.",
        "measure before you change",
        "Keep the triage script ready before the incident, not during it:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Windows itself competes for RAM: the file system cache, drivers, antivirus, and any other process on the box. If SQL Server is allowed to consume everything (the default max server memory is effectively unlimited), the OS starts paging, and the whole machine degrades — this is the classic \"SQL Server installed and the server became slow\" story.”"
    },
    {
      "question": "Complete the lesson statement: “SQL Server feels storage problems as _____: PAGEIOLATCH_* while reading pages, WRITELOG while flushing the log, and ASYNC_IO_COMPLETION during large scans.”",
      "options": [
        "Memory",
        "Storage",
        "IO waits"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “SQL Server feels storage problems as IO waits: PAGEIOLATCH_* while reading pages, WRITELOG while flushing the log, and ASYNC_IO_COMPLETION during large scans. The transaction log is particularly sensitive — every commit waits for a log write, so log latency multiplies directly into transaction latency.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “What matters for a DBA is not the clock speed on the box label but _____.”",
      "options": [
        "max degree of parallelism (MAXDOP)",
        "cost threshold for parallelism",
        "how many runnable tasks compete for schedulers"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The CPU executes instructions; SQL Server's schedulers map one-to-one onto logical processors and each running query task occupies a scheduler slot. What matters for a DBA is not the clock speed on the box label but how many runnable tasks compete for schedulers.”"
    },
    {
      "question": "Which fact is covered in the lesson section “RAM: the tier SQL Server lives in”?",
      "options": [
        "Storage is the slowest tier and the most common bottleneck in production.",
        "Memory is where the buffer pool caches 8-KB data and index pages, where plan cache stores compiled plans, and where sorts and hash joins spill if they do not fit.",
        "Persistent > logical processors = CPU starvation"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Memory is where the buffer pool caches 8-KB data and index pages, where plan cache stores compiled plans, and where sorts and hash joins spill if they do not fit. A page served from RAM takes microseconds; the same page from disk takes milliseconds — three orders of magnitude, which is why memory sizing beats almost every other tuning step.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Storage: latency, throughput, and IOPS”?",
      "options": [
        "Storage is the slowest tier and the most common bottleneck in production.",
        "Memory is where the buffer pool caches 8-KB data and index pages, where plan cache stores compiled plans, and where sorts and hash joins spill if they do not fit.",
        "Windows itself competes for RAM: the file system cache, drivers, antivirus, and any other process on the box."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Storage is the slowest tier and the most common bottleneck in production. Three properties describe it, and they fail independently. A device can be fast at one and poor at the other two, so always name which property your workload depends on:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Matching counters to symptoms”?",
      "options": [
        "Windows itself competes for RAM: the file system cache, drivers, antivirus, and any other process on the box.",
        "Available MBytes",
        "When a user says \"the server is slow\", triage the three resources in this order — it takes about five minutes:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “When a user says \"the server is slow\", triage the three resources in this order — it takes about five minutes:”"
    },
    {
      "question": "Complete the lesson statement: “Modern servers group cores and memory into _____ (one per socket).”",
      "options": [
        "Latency",
        "NUMA nodes",
        "Page life expectancy"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Modern servers group cores and memory into NUMA nodes (one per socket). Memory inside a node is fast to reach; memory on the other socket costs extra hops. SQL Server is NUMA-aware: it allocates memory per node and schedules queries locally when it can.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Sizing and capacity pitfalls”?",
      "options": [
        "Watch for the interaction effects too: slow storage inflates CPU wait times, memory pressure pushes reads onto disk, and a starved CPU delays log flushes.",
        "Storage is the slowest tier and the most common bottleneck in production.",
        "IO waits"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Watch for the interaction effects too: slow storage inflates CPU wait times, memory pressure pushes reads onto disk, and a starved CPU delays log flushes. When all three counters look unhealthy, find the first domino rather than \"upgrading everything\".”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "IOPS",
        "Throughput",
        "CPU, RAM, and Storage Fundamentals"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates CPU, RAM, and Storage Fundamentals with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Complete the lesson statement: “Two SQL settings tie directly to the hardware: _____ caps how many schedulers one query may use, and cost threshold for parallelism decides when a plan may go parallel at all.”",
      "options": [
        "CPU",
        "max degree of parallelism (MAXDOP)",
        "IO waits"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Two SQL settings tie directly to the hardware: max degree of parallelism (MAXDOP) caps how many schedulers one query may use, and cost threshold for parallelism decides when a plan may go parallel at all. Misconfigured, they turn ordinary OLTP workloads into CPU storms.”"
    },
    {
      "question": "Which fact is covered in the lesson section “RAM: the tier SQL Server lives in”?",
      "options": [
        "Windows itself competes for RAM: the file system cache, drivers, antivirus, and any other process on the box.",
        "measure before you change",
        "Keep the triage script ready before the incident, not during it:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Windows itself competes for RAM: the file system cache, drivers, antivirus, and any other process on the box. If SQL Server is allowed to consume everything (the default max server memory is effectively unlimited), the OS starts paging, and the whole machine degrades — this is the classic \"SQL Server installed and the server became slow\" story.”"
    },
    {
      "question": "Complete the lesson statement: “SQL Server feels storage problems as _____: PAGEIOLATCH_* while reading pages, WRITELOG while flushing the log, and ASYNC_IO_COMPLETION during large scans.”",
      "options": [
        "Memory",
        "Storage",
        "IO waits"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “SQL Server feels storage problems as IO waits: PAGEIOLATCH_* while reading pages, WRITELOG while flushing the log, and ASYNC_IO_COMPLETION during large scans. The transaction log is particularly sensitive — every commit waits for a log write, so log latency multiplies directly into transaction latency.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “What matters for a DBA is not the clock speed on the box label but _____.”",
      "options": [
        "max degree of parallelism (MAXDOP)",
        "cost threshold for parallelism",
        "how many runnable tasks compete for schedulers"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The CPU executes instructions; SQL Server's schedulers map one-to-one onto logical processors and each running query task occupies a scheduler slot. What matters for a DBA is not the clock speed on the box label but how many runnable tasks compete for schedulers.”"
    },
    {
      "question": "Which fact is covered in the lesson section “RAM: the tier SQL Server lives in”?",
      "options": [
        "Storage is the slowest tier and the most common bottleneck in production.",
        "Memory is where the buffer pool caches 8-KB data and index pages, where plan cache stores compiled plans, and where sorts and hash joins spill if they do not fit.",
        "Persistent > logical processors = CPU starvation"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Memory is where the buffer pool caches 8-KB data and index pages, where plan cache stores compiled plans, and where sorts and hash joins spill if they do not fit. A page served from RAM takes microseconds; the same page from disk takes milliseconds — three orders of magnitude, which is why memory sizing beats almost every other tuning step.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Storage: latency, throughput, and IOPS”?",
      "options": [
        "Storage is the slowest tier and the most common bottleneck in production.",
        "Memory is where the buffer pool caches 8-KB data and index pages, where plan cache stores compiled plans, and where sorts and hash joins spill if they do not fit.",
        "Windows itself competes for RAM: the file system cache, drivers, antivirus, and any other process on the box."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Storage is the slowest tier and the most common bottleneck in production. Three properties describe it, and they fail independently. A device can be fast at one and poor at the other two, so always name which property your workload depends on:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Matching counters to symptoms”?",
      "options": [
        "Windows itself competes for RAM: the file system cache, drivers, antivirus, and any other process on the box.",
        "Available MBytes",
        "When a user says \"the server is slow\", triage the three resources in this order — it takes about five minutes:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “When a user says \"the server is slow\", triage the three resources in this order — it takes about five minutes:”"
    },
    {
      "question": "Complete the lesson statement: “Modern servers group cores and memory into _____ (one per socket).”",
      "options": [
        "Latency",
        "NUMA nodes",
        "Page life expectancy"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Modern servers group cores and memory into NUMA nodes (one per socket). Memory inside a node is fast to reach; memory on the other socket costs extra hops. SQL Server is NUMA-aware: it allocates memory per node and schedules queries locally when it can.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Sizing and capacity pitfalls”?",
      "options": [
        "Watch for the interaction effects too: slow storage inflates CPU wait times, memory pressure pushes reads onto disk, and a starved CPU delays log flushes.",
        "Storage is the slowest tier and the most common bottleneck in production.",
        "IO waits"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Watch for the interaction effects too: slow storage inflates CPU wait times, memory pressure pushes reads onto disk, and a starved CPU delays log flushes. When all three counters look unhealthy, find the first domino rather than \"upgrading everything\".”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "IOPS",
        "Throughput",
        "CPU, RAM, and Storage Fundamentals"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates CPU, RAM, and Storage Fundamentals with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Complete the lesson statement: “Two SQL settings tie directly to the hardware: _____ caps how many schedulers one query may use, and cost threshold for parallelism decides when a plan may go parallel at all.”",
      "options": [
        "CPU",
        "max degree of parallelism (MAXDOP)",
        "IO waits"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Two SQL settings tie directly to the hardware: max degree of parallelism (MAXDOP) caps how many schedulers one query may use, and cost threshold for parallelism decides when a plan may go parallel at all. Misconfigured, they turn ordinary OLTP workloads into CPU storms.”"
    },
    {
      "question": "Which fact is covered in the lesson section “RAM: the tier SQL Server lives in”?",
      "options": [
        "Windows itself competes for RAM: the file system cache, drivers, antivirus, and any other process on the box.",
        "measure before you change",
        "Keep the triage script ready before the incident, not during it:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Windows itself competes for RAM: the file system cache, drivers, antivirus, and any other process on the box. If SQL Server is allowed to consume everything (the default max server memory is effectively unlimited), the OS starts paging, and the whole machine degrades — this is the classic \"SQL Server installed and the server became slow\" story.”"
    },
    {
      "question": "Complete the lesson statement: “SQL Server feels storage problems as _____: PAGEIOLATCH_* while reading pages, WRITELOG while flushing the log, and ASYNC_IO_COMPLETION during large scans.”",
      "options": [
        "Memory",
        "Storage",
        "IO waits"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “SQL Server feels storage problems as IO waits: PAGEIOLATCH_* while reading pages, WRITELOG while flushing the log, and ASYNC_IO_COMPLETION during large scans. The transaction log is particularly sensitive — every commit waits for a log write, so log latency multiplies directly into transaction latency.”"
    }
  ],
  takeaways: [
    "CPU problems show as scheduler pressure; memory problems show as page life drop; storage problems show as IO waits",
    "Set max server memory explicitly — leave the OS 1–4 GB and never let SQL Server starve the host",
    "Storage has three independent properties: latency, IOPS, throughput — measure the one your workload depends on",
    "Triage with counters first: % Processor Time, Available MBytes, Avg. Disk sec/Transfer, plus SQL wait types",
    "Baseline normal counters so you can prove what changed when the incident starts; capacity grows from evidence, not panic"
  ]
};
