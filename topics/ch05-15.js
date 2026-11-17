/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch05-15.html */

window.TOPIC = {
  id: "ch05-15",
  title: "Maximum Server Memory",

  lead: "max server memory is the single most important number you set on a new SQL Server — an uncapped instance will happily take every megabyte of the host and leave Windows to page itself to death.",

  objectives: [
    "Explain why the default of 2,147,483,647 MB is unsafe",
    "Calculate a defensible max server memory for any host",
    "Set the option correctly with sp_configure and SSMS",
    "Divide memory fairly across multiple instances",
    "Verify the cap is working and adjust it safely"
  ],

  sections: [
    {
      h: "Why the default is a production defect",
      html: `
<p><code>max server memory (MB)</code> defaults to <strong>2,147,483,647 megabytes</strong> — about 2 TB, i.e. “no limit at all”. On a server where SQL Server is the only workload, the result is usually survivable: SQL takes what it needs, Windows keeps a small reserve, and nobody notices.</p>
<p>The damage appears in three situations, all common:</p>
<ul>
  <li><strong>Co-tenants</strong> — SSRS, SSIS, ETL agents, monitoring, antivirus, or a second instance all compete with a process that never voluntarily shrinks</li>
  <li><strong>Growing demand</strong> — a new report, a data load, or a bad scan expands the buffer pool until Windows starts paging; every service on the box degrades together</li>
  <li><strong>Lock pages in memory</strong> — with LPIM granted and no cap, SQL Server memory cannot be paged out at all, so the host can become genuinely unstable</li>
</ul>
<blockquote>The cost of setting max server memory is one statement in sp_configure. The cost of not setting it is an outage investigation at 06:30 with Available MBytes in double digits.</blockquote>
<p>Microsoft's own guidance is to configure it on every version and every install — SQL Server Setup has offered a recommendation for the value since 2019, which tells you how often the default has caused trouble.</p>
`
    },
    {
      h: "Setting the option",
      html: `
<p>It is an advanced option, it takes effect immediately, and it requires no restart:</p>
<pre><code class="language-sql">EXECUTE sp_configure 'show advanced options', 1;
RECONFIGURE;

-- 56 GB expressed in megabytes — the option is MB, not GB
EXECUTE sp_configure 'max server memory', 57344;
RECONFIGURE;

-- Confirm the value in use
SELECT name, value_in_use AS configured_mb
FROM   sys.configurations
WHERE  name = 'max server memory (MB)';</code></pre>
<p>The equivalent path in SSMS: right-click the instance → <strong>Properties → Memory</strong> → Maximum server memory. Same setting, same effect; the script version is the one you put in source control.</p>
<ul>
  <li><strong>Raising</strong> the cap is safe at any time — the buffer pool grows back as demand arrives</li>
  <li><strong>Lowering</strong> it is also immediate, but the pool must shed pages first; expect a short dip in performance while memory is reclaimed</li>
  <li>Units matter: typing <code>64</code> means 64 <em>megabytes</em>. It will make SQL Server unusable — and it will do so instantly</li>
</ul>
`
    },
    {
      h: "Calculating the number",
      html: `
<p>Microsoft's documented method for a single instance:</p>
<ol>
  <li>Start with total physical memory</li>
  <li>Subtract <strong>thread memory outside the cap</strong>: stack size × calculated max worker threads</li>
  <li>Subtract <strong>25% for unmanaged allocations</strong> — backup buffers, extended stored procedures, Automation objects, linked-server providers</li>
  <li>What remains is your <code>max server memory</code></li>
</ol>
<p>For day-to-day practice a simpler rule is close enough and easier to defend in a change review: <strong>leave 10% (or at least 4 GB) for everything that is not SQL Server</strong>, then sanity-check against the real co-tenants on the box.</p>
<table>
  <tr><th>Host RAM</th><th>Co-tenants</th><th>Set max server memory to</th></tr>
  <tr><td>32 GB</td><td>Windows + agents only</td><td>29,696 MB (29 GB)</td></tr>
  <tr><td>64 GB</td><td>Windows + backup + monitoring</td><td>57,344 MB (56 GB)</td></tr>
  <tr><td>64 GB</td><td>+ SSRS and an ETL tool</td><td>45,056 MB (44 GB)</td></tr>
  <tr><td>128 GB</td><td>Windows + agents only</td><td>122,880 MB (120 GB)</td></tr>
</table>
<p>Always write the value in megabytes in the change record, with the reasoning next to it. “Set to 75% of RAM” is a decision; “57344” is a number the next DBA can verify.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Before and after setting max server memory">
    <defs>
      <marker id="cap-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <text x="40" y="40" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Before · default (2,147,483,647 MB)</text>
    <rect x="40" y="52" width="600" height="56" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="340" y="78" text-anchor="middle" fill="var(--accent-strong)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">SQL Server: 62 GB and still growing</text>
    <text x="340" y="98" text-anchor="middle" fill="var(--text)" font-size="11.5" font-family="Segoe UI, sans-serif">buffer pool expands until the OS pushes back</text>
    <rect x="648" y="52" width="72" height="56" rx="8" fill="var(--amber)" stroke="var(--amber)"/>
    <text x="684" y="85" text-anchor="middle" fill="#1f2937" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">2 GB</text>
    <text x="684" y="130" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">OS pages to disk</text>

    <text x="40" y="180" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">After · max server memory = 57,344 MB</text>
    <rect x="40" y="192" width="595" height="56" rx="8" fill="var(--accent)" stroke="var(--accent)"/>
    <text x="337" y="218" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">SQL Server: capped at 56 GB</text>
    <text x="337" y="238" text-anchor="middle" fill="#dbeafe" font-size="11.5" font-family="Segoe UI, sans-serif">grows to the ceiling, then stops</text>
    <rect x="643" y="192" width="77" height="56" rx="8" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="681" y="218" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">8 GB</text>
    <text x="681" y="237" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">OS · agents</text>

    <line x1="640" y1="172" x2="640" y2="272" stroke="var(--accent-strong)" stroke-width="2" stroke-dasharray="5 4"/>
    <text x="632" y="288" text-anchor="middle" fill="var(--accent-strong)" font-size="12" font-weight="600" font-family="Segoe UI, sans-serif">the cap you configured</text>

    <text x="40" y="325" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Same 64 GB of hardware — only the boundary moves, and the host stops paging.</text>
  </svg>
  <div class="figcaption">Figure 1 — Uncapped versus capped: the OS gets its headroom back the moment the limit is configured.</div>
</div>
`
    },
    {
      h: "Multiple instances on one host",
      html: `
<p>SQL Server does <strong>not</strong> balance instances against each other. Whichever instance starts first and receives load first takes the most memory; an idle instance that later becomes busy can only claim what the others release. Divide the budget explicitly:</p>
<table>
  <tr><th>Consumer on a 64 GB host</th><th>max server memory</th></tr>
  <tr><td>PROD — OLTP instance (critical)</td><td>40,960 MB (40 GB)</td></tr>
  <tr><td>REPORTS — reporting instance</td><td>12,288 MB (12 GB)</td></tr>
  <tr><td>DEV — development instance</td><td>4,096 MB (4 GB)</td></tr>
  <tr><td>Windows, agents, co-tenants (no SQL cap)</td><td>~6 GB by design</td></tr>
  <tr><td><strong>Total</strong></td><td><strong>≤ 65,536 MB — within physical memory</strong></td></tr>
</table>
<p>Two further options when instances must coexist:</p>
<ul>
  <li><strong>Sum of minimums</strong> — raise <code>min server memory</code> on the critical instance so a late-starting sibling cannot crowd it out; keep the sum of minimums 1–2 GB below physical memory</li>
  <li><strong>Sum of maximums</strong> — keep every max configured so a burst on one instance cannot consume another's budget</li>
</ul>
<p>Both are legitimate; the combination of both is best practice on any host that matters.</p>
`
    },
    {
      h: "Verifying the cap is real",
      html: `
<p>Configured value, then observed behaviour:</p>
<pre><code class="language-sql">SELECT name, value_in_use AS configured_mb
FROM   sys.configurations
WHERE  name = 'max server memory (MB)';

-- Is SQL Server actually sitting at the ceiling?
SELECT physical_memory_in_use_kb / 1024 AS sql_physical_mb,
       memory_utilization_percentage   AS memory_pct,
       page_fault_count                AS page_faults
FROM   sys.dm_os_process_memory;

-- Buffer pool: want versus have
SELECT committed_kb        / 1024 AS committed_mb,
       committed_target_kb / 1024 AS target_mb
FROM   sys.dm_os_sys_info;</code></pre>
<p>Interpretation guide:</p>
<table>
  <tr><th>Observation</th><th>Reading</th></tr>
  <tr><td>physical in use ≈ configured cap, target ≈ committed</td><td>Healthy: the instance is using its full budget and no more</td></tr>
  <tr><td>physical in use well above the cap</td><td>Unmanaged allocations (backup buffers, COM) — recalculate with the documented method</td></tr>
  <tr><td>physical far below cap with PLE falling</td><td>Something else is evicting pages — a scan, or memory pressure from outside SQL Server</td></tr>
</table>
<p>Remember the cap is a ceiling for growth, not a reservation: an idle instance will not hold 56 GB just because you allowed it to.</p>
`
    },
    {
      h: "Operating it safely",
      html: `
<ul>
  <li><strong>Change it with the buffer pool in mind</strong> — raising is free; lowering during business hours causes a temporary reclamation dip</li>
  <li><strong>Document the calculation</strong> — RAM, co-tenants, worker threads, the number, and the date</li>
  <li><strong>Alert on host memory</strong> — Available MBytes below 5% means the cap (or the co-tenant budget) is wrong</li>
  <li><strong>Revisit after hardware changes</strong> — a RAM upgrade or a new co-tenant invalidates the old number</li>
  <li><strong>Pair it with Lock pages in memory</strong> — if LPIM is granted, an explicit cap is mandatory, not optional</li>
  <li><strong>Never copy a number from a blog</strong> — 4,096 MB on a 96 GB server is not caution, it is self-harm</li>
</ul>
<p>One line of configuration, reviewed whenever the host changes — that is the whole discipline.</p>
`
    }
  ],

  scenario: {
    title: "14:05 — someone pasted a 4 GB example into a 96 GB server",
    html: `
<p>A junior DBA, following a well-meaning blog post titled “SQL Server memory settings for small servers”, set <code>max server memory</code> to <code>4096</code> on the company's 96 GB reporting instance. For an hour nothing seemed wrong — then the 15:00 finance refresh began: page life expectancy fell from 3,900 seconds to under 20, waits on <code>RESOURCES_SEMAPHORE</code> appeared as large sorts and hashes queued for a shrinking memory grant, and the executive dashboard timed out for its biggest audience of the day.</p>
<p>The DBA diagnosed it in three queries: <code>sys.configurations</code> showed <code>value_in_use = 4096</code>; <code>sys.dm_os_process_memory</code> showed SQL pinned at the ceiling with the buffer pool thrashing; wait stats showed memory grants, not I/O, as the bottleneck. Fix: recalculate from the host (96 GB, Windows and agents ≈ 8 GB, thread and unmanaged margin ≈ 4 GB) and set <code>max server memory = 86,016</code> with <code>RECONFIGURE</code> — no restart, PLE recovered within ten minutes as the pool refilled. Prevention: memory values are now peer-reviewed like schema changes, the change record must include the calculation, and a monitoring panel graphs configured cap against actual usage so a wrong number is visible long before users are.</p>
`
  },

  interview: [
    {
      q: "What should max server memory be set to on a dedicated 64 GB server?",
      a: "Not the default. Start from 64 GB, subtract what Windows and co-tenants really use (about 6 GB), subtract thread stacks (stack size × max worker threads) and a margin for unmanaged allocations — in practice around 56 GB, so 57,344 MB. The option is in megabytes, and the reasoning should be written down with the value."
    },
    {
      q: "Does changing max server memory require a service restart?",
      a: "No. It is an advanced option applied immediately by RECONFIGURE. Raising it lets the buffer pool grow back on demand; lowering it forces the pool to shed pages, which can cause a brief performance dip but no downtime. The restart concern only applies to options that are not dynamic."
    },
    {
      q: "You have just granted Lock pages in memory to the service account. What must happen next?",
      a: "Set an explicit max server memory. LPIM prevents the OS from paging SQL Server's memory out, so without a ceiling an unmanaged or runaway allocation can push the host into an unstable state — Microsoft explicitly recommends a fixed max whenever LPIM is enabled."
    }
  ],

  takeaways: [
    "The default 2,147,483,647 MB means unlimited — configure max server memory on every instance, every time",
    "Calculate it: total RAM minus OS/co-tenants, thread stacks, and a margin for unmanaged allocations; record it in megabytes with the reasoning",
    "Changes apply immediately with RECONFIGURE — no restart — but lowering during business hours causes a reclamation dip",
    "On multi-instance hosts, configure every max: SQL Server will not divide memory between instances for you",
    "Verify with sys.dm_os_process_memory: physical in use should sit at, not above, the cap you configured"
  ]
};
