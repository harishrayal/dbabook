/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch05-14.html */

window.TOPIC = {
  id: "ch05-14",
  title: "Server Memory Configuration",

  lead: "SQL Server takes memory when it can and gives it back when it must — which is fine until the operating system, a reporting service, or a second instance needs some, because an uncapped SQL Server does not share politely.",

  objectives: [
    "Describe how SQL Server allocates and releases memory dynamically",
    "Distinguish min server memory, max server memory, and actual usage",
    "Read the memory DMVs that matter in production",
    "Recognise symptoms of memory starvation versus external memory pressure",
    "Choose sensible bounds for single-instance and multi-instance hosts"
  ],

  sections: [
    {
      h: "How SQL Server decides what to take",
      html: `
<p>SQL Server has no fixed memory allocation. It starts small, grows as the buffer pool, plan cache, and memory grants need space, and shrinks when Windows signals pressure. Within <code>min server memory</code> and <code>max server memory</code>, three numbers describe its state at any moment:</p>
<table>
  <tr><th>Measure</th><th>Meaning</th><th>Where to read it</th></tr>
  <tr><td><strong>Target</strong></td><td>What the buffer pool would like to hold right now</td><td><code>sys.dm_os_sys_info.committed_target_kb</code></td></tr>
  <tr><td><strong>Committed</strong></td><td>What SQL Server has actually reserved</td><td><code>sys.dm_os_sys_info.committed_kb</code></td></tr>
  <tr><td><strong>Physical in use</strong></td><td>What the process holds as resident working set</td><td><code>sys.dm_os_process_memory.physical_memory_in_use_kb</code></td></tr>
</table>
<p>When committed is well below target, SQL Server is being held back (or is idle). When physical in use drifts far above the configured cap, something else is going on — an unmanaged allocation, a second process, or a setting you never made.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="How physical memory is divided on a SQL Server host">
    <defs>
      <marker id="mem-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="40" y="30" width="680" height="46" rx="8" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="59" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="600" font-family="Segoe UI, sans-serif">Total physical memory — 64 GB host</text>

    <rect x="40" y="115" width="185" height="78" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="132" y="145" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Windows + other apps</text>
    <text x="132" y="167" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">OS, antivirus, agents</text>

    <rect x="235" y="115" width="330" height="78" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="400" y="145" text-anchor="middle" fill="var(--accent-strong)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">max server memory (MB)</text>
    <text x="400" y="167" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">buffer pool · plan cache · grants</text>

    <rect x="575" y="115" width="145" height="78" rx="10" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="647" y="145" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Outside the cap</text>
    <text x="647" y="167" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">thread stacks · COM</text>

    <line x1="235" y1="96" x2="235" y2="205" stroke="var(--accent)" stroke-width="2" stroke-dasharray="5 4"/>
    <text x="243" y="205" fill="var(--accent-strong)" font-size="11.5" font-family="Segoe UI, sans-serif">your configured floor: min server memory</text>

    <rect x="40" y="232" width="680" height="64" rx="10" fill="var(--surface)" stroke="var(--border)"/>
    <text x="380" y="258" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">min server memory is a floor, not a reservation</text>
    <text x="380" y="280" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">SQL Server never pre-allocates it — once load pushes usage past it, memory is not released below it</text>

    <text x="380" y="325" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Everything outside your cap still has to fit: draw the boundary before the OS draws it for you.</text>
  </svg>
  <div class="figcaption">Figure 1 — A 64 GB host divided between the OS, the governed SQL memory, and allocations the cap does not cover.</div>
</div>
`
    },
    {
      h: "min server memory and max server memory",
      html: `
<p>These two options are advanced settings, changed through <code>sp_configure</code> or the Memory page of Server Properties. Their defaults are the source of most production memory incidents:</p>
<table>
  <tr><th>Option</th><th>Default</th><th>Minimum</th><th>Production recommendation</th></tr>
  <tr><td><code>min server memory (MB)</code></td><td>0</td><td>0</td><td>Leave at 0 unless a VM or a sibling instance is squeezing you</td></tr>
  <tr><td><code>max server memory (MB)</code></td><td><strong>2,147,483,647</strong> (~2 TB)</td><td>128 MB</td><td><strong>Always set it</strong> — roughly 75% of memory not consumed by anything else</td></tr>
</table>
<ul>
  <li><strong>min</strong> is only reached under load: SQL Server will not allocate it at start-up, but once usage climbs to it, memory is not returned below it. Useful to defend an instance in a VM or on a shared host.</li>
  <li><strong>max</strong> is a ceiling the buffer pool and most memory clerks respect. It applies immediately on <code>RECONFIGURE</code> — no restart.</li>
  <li>Do not set min and max to the same value; the docs are explicit about it, and it removes SQL Server's ability to respond to real demand.</li>
</ul>
<p>Setting max too low wastes the hardware you paid for; leaving it at the default lets SQL Server squeeze everything else on the box. Both are configuration defects, and both are avoidable in the first ten minutes after install.</p>
`
    },
    {
      h: "What the cap does not cover",
      html: `
<p>An honest description of <code>max server memory</code> matters, because “SQL Server is limited to 56 GB” is not strictly true. The cap governs the buffer pool and the memory clerks under the Memory Manager. Outside it sit:</p>
<ul>
  <li><strong>Thread stacks</strong> — stack size × the calculated max worker threads</li>
  <li><strong>Backup buffers, extended stored procedure DLLs, Automation (<code>sp_OA</code>) objects, linked-server provider allocations</strong></li>
  <li><strong>Memory for the SQL Server process and the OS itself</strong></li>
</ul>
<p>Microsoft's own sizing guidance therefore subtracts thread memory first, then a 25% margin for unmanaged allocations, before arriving at the number you configure. In practice: set the cap, then confirm the real resident size with <code>sys.dm_os_process_memory</code> — if physical in use sits materially above your cap, the unmanaged side is larger than you assumed.</p>
<p>If you also grant <strong>Lock pages in memory</strong>, an explicit cap becomes mandatory: LPIM stops the OS from paging SQL Server's memory out, so a runaway allocation with no ceiling can destabilise the whole host.</p>
`
    },
    {
      h: "Sizing the number",
      html: `
<p>Start from measured reality, not from a blog post. For a dedicated single-instance host the field-tested approach is:</p>
<ol>
  <li>Record total physical memory and what <em>everything else</em> uses during peak (OS, antivirus, backup agent, monitoring, any reporting services)</li>
  <li>Subtract thread stacks: stack size × max worker threads (roughly 512 KB × threads on 64-bit)</li>
  <li>Subtract a margin — 10% or a few GB — for unmanaged allocations</li>
  <li>Configure the result in <strong>megabytes</strong>, not gigabytes; the option is MB and it is a frequent unit mistake</li>
</ol>
<table>
  <tr><th>Host RAM</th><th>Typical non-SQL usage</th><th>Sensible max server memory</th></tr>
  <tr><td>16 GB</td><td>~2 GB</td><td>14,336 MB (14 GB)</td></tr>
  <tr><td>32 GB</td><td>~3 GB</td><td>29,696 MB (29 GB)</td></tr>
  <tr><td>64 GB</td><td>~6 GB</td><td>57,344 MB (56 GB)</td></tr>
  <tr><td>128 GB</td><td>~8 GB</td><td>122,880 MB (120 GB)</td></tr>
</table>
<p>On a host running several instances, split the pie deliberately: the sum of every instance's max must stay below physical memory, leaving the OS its share. SQL Server makes no attempt to balance instances — the first one to run claims the most.</p>
`
    },
    {
      h: "Reading the memory DMVs",
      html: `
<p>Configured values first, then reality:</p>
<pre><code class="language-sql">SELECT name, value, value_in_use
FROM   sys.configurations
WHERE  name IN ('max server memory (MB)', 'min server memory (MB)');

-- What the process actually holds
SELECT physical_memory_in_use_kb        / 1024 AS physical_memory_mb,
       virtual_address_space_committed_kb / 1024 AS committed_mb,
       memory_utilization_percentage          AS memory_pct,
       page_fault_count                        AS page_faults
FROM   sys.dm_os_process_memory;

-- Buffer pool want vs have
SELECT committed_kb        / 1024 AS committed_mb,
       committed_target_kb / 1024 AS target_mb
FROM   sys.dm_os_sys_info;</code></pre>
<p>And who owns the memory inside the instance — useful when someone claims “SQL Server is using 50 GB” and you need to show which database or clerk is responsible:</p>
<pre><code class="language-sql">SELECT TOP (10) type,
       name,
       pages_kb / 1024 AS mb
FROM   sys.dm_os_memory_clerks
ORDER BY pages_kb DESC;</code></pre>
`
    },
    {
      h: "Symptoms of the wrong setting",
      html: `
<table>
  <tr><th>Symptom</th><th>Most likely cause</th></tr>
  <tr><td>Host <em>Available MBytes</em> near zero, pages/sec climbing, everything slows</td><td>max server memory left at default — SQL Server has taken the host</td></tr>
  <tr><td>Page life expectancy collapses, PAGEIOLATCH waits rise, CPU idle</td><td>Cap too <em>low</em> for the working set, or an oversized scan evicting everything</td></tr>
  <tr><td>SQL fast, but SSRS/ETL/antivirus starved or failing</td><td>SQL capped correctly but the cap was never checked against co-tenants</td></tr>
  <tr><td>Error 17890 in the error log: “significant part of sql server process memory has been paged out”</td><td>OS paging SQL memory — raise the cap discipline, or grant LPIM with an explicit max</td></tr>
  <tr><td>Two instances, one always slow</td><td>Uncapped sibling instance hoarding memory — configure both</td></tr>
</table>
<p>The monitoring pair that catches all of this early: <strong>host Available MBytes</strong> and <strong>page life expectancy</strong>. Alert on the first, graph the second, and review both after any change to max server memory.</p>
`
    }
  ],

  scenario: {
    title: "06:30 — a SQL Server box that stopped sharing the machine",
    html: `
<p>A 64 GB host was purchased “for SQL Server” but also ran Windows, a backup agent, monitoring, and — since last month — a small SSRS instance. At 06:30 the nightly ETL began taking three times longer, then the monitoring agent itself went unresponsive. Available MBytes on the host was <strong>84 MB</strong> and climbing into hard paging; the database showed no errors, and CPU was idle.</p>
<p>The DBA read <code>sys.dm_os_process_memory</code>: SQL Server held <strong>61 GB</strong> of resident memory with max server memory never configured (default 2,147,483,647 MB). The buffer pool had legitimately expanded until Windows began paging — SQL Server was fine, everything else was drowning. Fix in one statement: <code>sp_configure 'max server memory', 57344</code> plus <code>RECONFIGURE</code>, no restart required; within minutes Available MBytes recovered and the ETL finished. Prevention: setting max server memory is now a mandatory line in the post-install checklist, and an alert fires when host Available MBytes drops below 5% — because by the time users notice, the OS has already been paging for hours.</p>
`
  },

  interview: [
    {
      q: "What is the difference between min and max server memory?",
      a: "Max is a ceiling on the memory the buffer pool and memory clerks may consume; it applies immediately without a restart. Min is a floor: SQL Server does not pre-allocate it, but once usage reaches it under load, memory is not released below it. Defaults are 0 and 2,147,483,647 MB, which is why max must always be set explicitly."
    },
    {
      q: "How do you prove SQL Server is starving the operating system?",
      a: "Host counters first: Available MBytes near zero and pages/sec climbing, then sys.dm_os_process_memory showing physical_memory_in_use far above a sane share of RAM. Cross-check the configured value in sys.configurations — if max server memory still reads 2,147,483,647, you have found the root cause, not just the symptom."
    },
    {
      q: "Two SQL Server instances share a 64 GB host. How do you divide the memory?",
      a: "Set an explicit max on each instance so their sum plus OS and co-tenants stays below physical memory — for example 40 GB to the OLTP instance, 12 GB to reporting, 8 GB to dev, leaving 6 GB for Windows. Optionally raise min server memory on the critical instance so a late-starting sibling cannot squeeze it, and never rely on SQL Server to balance instances on its own: it does not."
    }
  ],

  quiz: [
    {
      "question": "Which fact is covered in the lesson section “How SQL Server decides what to take”?",
      "options": [
        "host Available MBytes",
        "SQL Server has no fixed memory allocation.",
        "And who owns the memory inside the instance — useful when someone claims “SQL Server is using 50 GB” and you need to show which database or clerk is responsible:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “SQL Server has no fixed memory allocation. It starts small, grows as the buffer pool, plan cache, and memory grants need space, and shrinks when Windows signals pressure. Within min server memory and max server memory, three numbers describe its state at any moment:”"
    },
    {
      "question": "Which fact is covered in the lesson section “min server memory and max server memory”?",
      "options": [
        "These two options are advanced settings, changed through sp_configure or the Memory page of Server Properties.",
        "And who owns the memory inside the instance — useful when someone claims “SQL Server is using 50 GB” and you need to show which database or clerk is responsible:",
        "host Available MBytes"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “These two options are advanced settings, changed through sp_configure or the Memory page of Server Properties. Their defaults are the source of most production memory incidents:”"
    },
    {
      "question": "Which fact is covered in the lesson section “What the cap does not cover”?",
      "options": [
        "And who owns the memory inside the instance — useful when someone claims “SQL Server is using 50 GB” and you need to show which database or clerk is responsible:",
        "host Available MBytes",
        "An honest description of max server memory matters, because “SQL Server is limited to 56 GB” is not strictly true."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “An honest description of max server memory matters, because “SQL Server is limited to 56 GB” is not strictly true. The cap governs the buffer pool and the memory clerks under the Memory Manager. Outside it sit:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Sizing the number”?",
      "options": [
        "OS paging SQL memory — raise the cap discipline, or grant LPIM with an explicit max",
        "Start from measured reality, not from a blog post.",
        "SQL capped correctly but the cap was never checked against co-tenants"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Start from measured reality, not from a blog post. For a dedicated single-instance host the field-tested approach is:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Reading the memory DMVs”?",
      "options": [
        "Configured values first, then reality:",
        "host Available MBytes",
        "max server memory left at default — SQL Server has taken the host"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Configured values first, then reality:”"
    },
    {
      "question": "Complete the lesson statement: “The monitoring pair that catches all of this early: _____ and page life expectancy.”",
      "options": [
        "sys.dm_os_process_memory.physical_memory_in_use_kb",
        "These two options are advanced settings, changed through sp_configure or the Memory page of Server Properties.",
        "host Available MBytes"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The monitoring pair that catches all of this early: host Available MBytes and page life expectancy. Alert on the first, graph the second, and review both after any change to max server memory.”"
    },
    {
      "question": "Which fact is covered in the lesson section “How SQL Server decides what to take”?",
      "options": [
        "SQL Server has no fixed memory allocation.",
        "When committed is well below target, SQL Server is being held back (or is idle).",
        "Uncapped sibling instance hoarding memory — configure both"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “When committed is well below target, SQL Server is being held back (or is idle). When physical in use drifts far above the configured cap, something else is going on — an unmanaged allocation, a second process, or a setting you never made.”"
    },
    {
      "question": "Which fact is covered in the lesson section “min server memory and max server memory”?",
      "options": [
        "Setting max too low wastes the hardware you paid for; leaving it at the default lets SQL Server squeeze everything else on the box.",
        "Uncapped sibling instance hoarding memory — configure both",
        "These two options are advanced settings, changed through sp_configure or the Memory page of Server Properties."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Setting max too low wastes the hardware you paid for; leaving it at the default lets SQL Server squeeze everything else on the box. Both are configuration defects, and both are avoidable in the first ten minutes after install.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What the cap does not cover”?",
      "options": [
        "Uncapped sibling instance hoarding memory — configure both",
        "An honest description of max server memory matters, because “SQL Server is limited to 56 GB” is not strictly true.",
        "Microsoft's own sizing guidance therefore subtracts thread memory first, then a 25% margin for unmanaged allocations, before arriving at the number you configure."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Microsoft's own sizing guidance therefore subtracts thread memory first, then a 25% margin for unmanaged allocations, before arriving at the number you configure. In practice: set the cap, then confirm the real resident size with sys.dm_os_process_memory — if physical in use sits materially above your cap, the unmanaged side is larger than you assumed.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Sizing the number”?",
      "options": [
        "122,880 MB (120 GB)",
        "On a host running several instances, split the pie deliberately: the sum of every instance's max must stay below physical memory, leaving the OS its share.",
        "57,344 MB (56 GB)"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “On a host running several instances, split the pie deliberately: the sum of every instance's max must stay below physical memory, leaving the OS its share. SQL Server makes no attempt to balance instances — the first one to run claims the most.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “How SQL Server decides what to take”?",
      "options": [
        "host Available MBytes",
        "SQL Server has no fixed memory allocation.",
        "And who owns the memory inside the instance — useful when someone claims “SQL Server is using 50 GB” and you need to show which database or clerk is responsible:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “SQL Server has no fixed memory allocation. It starts small, grows as the buffer pool, plan cache, and memory grants need space, and shrinks when Windows signals pressure. Within min server memory and max server memory, three numbers describe its state at any moment:”"
    },
    {
      "question": "Which fact is covered in the lesson section “min server memory and max server memory”?",
      "options": [
        "These two options are advanced settings, changed through sp_configure or the Memory page of Server Properties.",
        "And who owns the memory inside the instance — useful when someone claims “SQL Server is using 50 GB” and you need to show which database or clerk is responsible:",
        "host Available MBytes"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “These two options are advanced settings, changed through sp_configure or the Memory page of Server Properties. Their defaults are the source of most production memory incidents:”"
    },
    {
      "question": "Which fact is covered in the lesson section “What the cap does not cover”?",
      "options": [
        "And who owns the memory inside the instance — useful when someone claims “SQL Server is using 50 GB” and you need to show which database or clerk is responsible:",
        "host Available MBytes",
        "An honest description of max server memory matters, because “SQL Server is limited to 56 GB” is not strictly true."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “An honest description of max server memory matters, because “SQL Server is limited to 56 GB” is not strictly true. The cap governs the buffer pool and the memory clerks under the Memory Manager. Outside it sit:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Sizing the number”?",
      "options": [
        "OS paging SQL memory — raise the cap discipline, or grant LPIM with an explicit max",
        "Start from measured reality, not from a blog post.",
        "SQL capped correctly but the cap was never checked against co-tenants"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Start from measured reality, not from a blog post. For a dedicated single-instance host the field-tested approach is:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Reading the memory DMVs”?",
      "options": [
        "Configured values first, then reality:",
        "host Available MBytes",
        "max server memory left at default — SQL Server has taken the host"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Configured values first, then reality:”"
    },
    {
      "question": "Complete the lesson statement: “The monitoring pair that catches all of this early: _____ and page life expectancy.”",
      "options": [
        "sys.dm_os_process_memory.physical_memory_in_use_kb",
        "These two options are advanced settings, changed through sp_configure or the Memory page of Server Properties.",
        "host Available MBytes"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The monitoring pair that catches all of this early: host Available MBytes and page life expectancy. Alert on the first, graph the second, and review both after any change to max server memory.”"
    },
    {
      "question": "Which fact is covered in the lesson section “How SQL Server decides what to take”?",
      "options": [
        "SQL Server has no fixed memory allocation.",
        "When committed is well below target, SQL Server is being held back (or is idle).",
        "Uncapped sibling instance hoarding memory — configure both"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “When committed is well below target, SQL Server is being held back (or is idle). When physical in use drifts far above the configured cap, something else is going on — an unmanaged allocation, a second process, or a setting you never made.”"
    },
    {
      "question": "Which fact is covered in the lesson section “min server memory and max server memory”?",
      "options": [
        "Setting max too low wastes the hardware you paid for; leaving it at the default lets SQL Server squeeze everything else on the box.",
        "Uncapped sibling instance hoarding memory — configure both",
        "These two options are advanced settings, changed through sp_configure or the Memory page of Server Properties."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Setting max too low wastes the hardware you paid for; leaving it at the default lets SQL Server squeeze everything else on the box. Both are configuration defects, and both are avoidable in the first ten minutes after install.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What the cap does not cover”?",
      "options": [
        "Uncapped sibling instance hoarding memory — configure both",
        "An honest description of max server memory matters, because “SQL Server is limited to 56 GB” is not strictly true.",
        "Microsoft's own sizing guidance therefore subtracts thread memory first, then a 25% margin for unmanaged allocations, before arriving at the number you configure."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Microsoft's own sizing guidance therefore subtracts thread memory first, then a 25% margin for unmanaged allocations, before arriving at the number you configure. In practice: set the cap, then confirm the real resident size with sys.dm_os_process_memory — if physical in use sits materially above your cap, the unmanaged side is larger than you assumed.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Sizing the number”?",
      "options": [
        "122,880 MB (120 GB)",
        "On a host running several instances, split the pie deliberately: the sum of every instance's max must stay below physical memory, leaving the OS its share.",
        "57,344 MB (56 GB)"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “On a host running several instances, split the pie deliberately: the sum of every instance's max must stay below physical memory, leaving the OS its share. SQL Server makes no attempt to balance instances — the first one to run claims the most.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “How SQL Server decides what to take”?",
      "options": [
        "host Available MBytes",
        "SQL Server has no fixed memory allocation.",
        "And who owns the memory inside the instance — useful when someone claims “SQL Server is using 50 GB” and you need to show which database or clerk is responsible:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “SQL Server has no fixed memory allocation. It starts small, grows as the buffer pool, plan cache, and memory grants need space, and shrinks when Windows signals pressure. Within min server memory and max server memory, three numbers describe its state at any moment:”"
    },
    {
      "question": "Which fact is covered in the lesson section “min server memory and max server memory”?",
      "options": [
        "These two options are advanced settings, changed through sp_configure or the Memory page of Server Properties.",
        "And who owns the memory inside the instance — useful when someone claims “SQL Server is using 50 GB” and you need to show which database or clerk is responsible:",
        "host Available MBytes"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “These two options are advanced settings, changed through sp_configure or the Memory page of Server Properties. Their defaults are the source of most production memory incidents:”"
    },
    {
      "question": "Which fact is covered in the lesson section “What the cap does not cover”?",
      "options": [
        "And who owns the memory inside the instance — useful when someone claims “SQL Server is using 50 GB” and you need to show which database or clerk is responsible:",
        "host Available MBytes",
        "An honest description of max server memory matters, because “SQL Server is limited to 56 GB” is not strictly true."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “An honest description of max server memory matters, because “SQL Server is limited to 56 GB” is not strictly true. The cap governs the buffer pool and the memory clerks under the Memory Manager. Outside it sit:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Sizing the number”?",
      "options": [
        "OS paging SQL memory — raise the cap discipline, or grant LPIM with an explicit max",
        "Start from measured reality, not from a blog post.",
        "SQL capped correctly but the cap was never checked against co-tenants"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Start from measured reality, not from a blog post. For a dedicated single-instance host the field-tested approach is:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Reading the memory DMVs”?",
      "options": [
        "Configured values first, then reality:",
        "host Available MBytes",
        "max server memory left at default — SQL Server has taken the host"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Configured values first, then reality:”"
    },
    {
      "question": "Complete the lesson statement: “The monitoring pair that catches all of this early: _____ and page life expectancy.”",
      "options": [
        "sys.dm_os_process_memory.physical_memory_in_use_kb",
        "These two options are advanced settings, changed through sp_configure or the Memory page of Server Properties.",
        "host Available MBytes"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The monitoring pair that catches all of this early: host Available MBytes and page life expectancy. Alert on the first, graph the second, and review both after any change to max server memory.”"
    },
    {
      "question": "Which fact is covered in the lesson section “How SQL Server decides what to take”?",
      "options": [
        "SQL Server has no fixed memory allocation.",
        "When committed is well below target, SQL Server is being held back (or is idle).",
        "Uncapped sibling instance hoarding memory — configure both"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “When committed is well below target, SQL Server is being held back (or is idle). When physical in use drifts far above the configured cap, something else is going on — an unmanaged allocation, a second process, or a setting you never made.”"
    },
    {
      "question": "Which fact is covered in the lesson section “min server memory and max server memory”?",
      "options": [
        "Setting max too low wastes the hardware you paid for; leaving it at the default lets SQL Server squeeze everything else on the box.",
        "Uncapped sibling instance hoarding memory — configure both",
        "These two options are advanced settings, changed through sp_configure or the Memory page of Server Properties."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Setting max too low wastes the hardware you paid for; leaving it at the default lets SQL Server squeeze everything else on the box. Both are configuration defects, and both are avoidable in the first ten minutes after install.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What the cap does not cover”?",
      "options": [
        "Uncapped sibling instance hoarding memory — configure both",
        "An honest description of max server memory matters, because “SQL Server is limited to 56 GB” is not strictly true.",
        "Microsoft's own sizing guidance therefore subtracts thread memory first, then a 25% margin for unmanaged allocations, before arriving at the number you configure."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Microsoft's own sizing guidance therefore subtracts thread memory first, then a 25% margin for unmanaged allocations, before arriving at the number you configure. In practice: set the cap, then confirm the real resident size with sys.dm_os_process_memory — if physical in use sits materially above your cap, the unmanaged side is larger than you assumed.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Sizing the number”?",
      "options": [
        "122,880 MB (120 GB)",
        "On a host running several instances, split the pie deliberately: the sum of every instance's max must stay below physical memory, leaving the OS its share.",
        "57,344 MB (56 GB)"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “On a host running several instances, split the pie deliberately: the sum of every instance's max must stay below physical memory, leaving the OS its share. SQL Server makes no attempt to balance instances — the first one to run claims the most.”"
    }
  ],
  takeaways: [
    "SQL Server grows and shrinks dynamically between min and max server memory — the defaults (0 / 2,147,483,647 MB) are not production values",
    "min is a floor reached only under load, never a pre-allocation; max is a ceiling applied immediately on RECONFIGURE",
    "The cap excludes thread stacks, backup buffers, and COM/extended-procedure allocations — verify real usage with sys.dm_os_process_memory",
    "Watch host Available MBytes alongside page life expectancy: one proves OS starvation, the other proves cache starvation",
    "On multi-instance hosts, the sum of the maxes is your budget — SQL Server will not divide it for you"
  ]
};
