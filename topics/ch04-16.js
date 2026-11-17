/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch04-16.html */

window.TOPIC = {
  id: "ch04-16",
  title: "Lazy Writer",

  lead: "The lazy writer is the buffer pool's emergency housekeeper: when free pages run low, it flushes dirty pages and discards clean ones so requests never have to wait for a frame — and when it works too hard, it is a symptom you can read from counters.",

  objectives: [
    "Explain what the lazy writer does and when it activates",
    "Distinguish the lazy writer from a checkpoint",
    "Recognise the signals of memory pressure the engine reacts to",
    "Identify lazy-writer churn from performance counters",
    "Fix chronic memory pressure without masking the symptom"
  ],

  sections: [
    {
      h: "What the lazy writer does",
      html: `
<p>The lazy writer is part of the buffer manager. When the buffer pool needs a free frame and the free lists are empty, someone has to produce one — that is the lazy writer's job:</p>
<ul>
  <li><strong>Respond to memory pressure</strong> — either the buffer pool itself is short of free buffers, or Windows is signalling low available memory</li>
  <li><strong>Flush dirty pages first</strong> — a dirty page cannot simply be dropped, so it is written to the data file (its log records are already durable, thanks to WAL)</li>
  <li><strong>Discard clean pages</strong> — clean pages from the cold end of the pool are thrown away; they can always be re-read</li>
  <li><strong>Return frames to free lists</strong> — so the next page request does not stall</li>
</ul>
<p>The lazy writer never writes log records and never marks a checkpoint. It is purely a memory-space recycler, which is why a healthy, well-sized server shows it almost idle.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Lazy writer activation flow">
    <defs>
      <marker id="p16-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="25" y="28" width="175" height="58" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="112" y="52" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Workload spikes</text>
    <text x="112" y="72" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">more pages demanded</text>

    <rect x="235" y="28" width="175" height="58" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="322" y="52" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Free lists shrink</text>
    <text x="322" y="72" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">free buffers run out</text>

    <rect x="445" y="28" width="285" height="58" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="587" y="52" text-anchor="middle" fill="var(--accent-strong)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Memory pressure signal</text>
    <text x="587" y="72" text-anchor="middle" fill="var(--accent-strong)" font-size="11.5" font-family="Segoe UI, sans-serif">pool target or Windows low-memory</text>

    <rect x="255" y="140" width="250" height="64" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="167" text-anchor="middle" fill="var(--accent-strong)" font-size="15.5" font-weight="700" font-family="Segoe UI, sans-serif">Lazy writer wakes</text>
    <text x="380" y="190" text-anchor="middle" fill="var(--accent-strong)" font-size="12" font-family="Segoe UI, sans-serif">reclaim frames for the free lists</text>

    <rect x="40" y="252" width="270" height="58" rx="10" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="175" y="276" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Flush dirty pages</text>
    <text x="175" y="296" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">written to MDF / NDF</text>

    <rect x="460" y="252" width="270" height="58" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="595" y="276" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Discard clean pages</text>
    <text x="595" y="296" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">re-readable if needed later</text>

    <line x1="200" y1="57" x2="233" y2="57" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#p16-arrow)"/>
    <line x1="410" y1="57" x2="443" y2="57" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#p16-arrow)"/>
    <line x1="500" y1="86" x2="440" y2="138" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#p16-arrow)"/>
    <line x1="315" y1="204" x2="225" y2="250" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#p16-arrow)"/>
    <line x1="445" y1="204" x2="535" y2="250" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#p16-arrow)"/>

    <text x="380" y="234" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Sustained Lazy writes/sec means the pool is too small or the working set too broad — not a disk problem</text>
  </svg>
  <div class="figcaption">Figure 1 — The lazy writer activates on memory pressure and must flush before it can discard.</div>
</div>
`
    },
    {
      h: "Checkpoint or lazy writer?",
      html: `
<p>Both write dirty pages, so the two are often conflated. They differ in every dimension that matters:</p>
<table>
  <tr><th></th><th>Checkpoint</th><th>Lazy writer</th></tr>
  <tr><td><strong>Purpose</strong></td><td>Bound recovery time</td><td>Produce free buffers under memory pressure</td></tr>
  <tr><td><strong>Trigger</strong></td><td>Log-record budget / target recovery time</td><td>Free lists low or Windows low-memory signal</td></tr>
  <tr><td><strong>Pages written</strong></td><td>All dirty pages of one database</td><td>Only as many as needed to reclaim space</td></tr>
  <tr><td><strong>Log records</strong></td><td>LOP_BEGIN_CKPT / LOP_END_CKPT</td><td>None</td></tr>
  <tr><td><strong>Expected activity</strong></td><td>Regular, periodic bursts</td><td>Near zero on a healthy server</td></tr>
</table>
<p>A server with frequent lazy writes but modest checkpoints is telling you the pool is undersized or memory is contested. A server with giant checkpoints but idle lazy writes is telling you writes are being throttled or batched — different problem, different fix.</p>
`
    },
    {
      h: "How pressure is detected",
      html: `
<p>The lazy writer does not wait for a hard failure — it reacts to graduated signals:</p>
<ul>
  <li><strong>Internal pressure:</strong> free buffers drop below the pool's target — common during large scans that sweep cold pages in</li>
  <li><strong>External pressure:</strong> Windows reports low available memory (also visible through the Available Work Set signal), and SQL Server starts trimming toward <code>max server memory</code></li>
  <li><strong>Competition:</strong> other memory clerks — plan cache, lock pool, CLR, full-text — or another process on the host (SSRS, ETL, antivirus) squeezing the box</li>
</ul>
<p>Crucially, if <code>max server memory</code> is set too low, the buffer pool lives under <em>permanent</em> internal pressure: the lazy writer runs continuously even though the server has 64 GB of RAM. That misconfiguration is the single most common cause of lazy-writer churn.</p>
`
    },
    {
      h: "Reading the counters",
      html: `
<p>Three counters separate healthy housekeeping from churn:</p>
<pre><code class="language-sql">-- Lazy writer activity, free-buffer stalls, and cache residency
SELECT counter_name, cntr_value
FROM   sys.dm_os_performance_counters
WHERE  object_name LIKE '%Buffer Manager%'
  AND  counter_name IN ('Lazy writes/sec', 'Free list stalls/sec',
                        'Page life expectancy', 'Database Pages')
  AND  cntr_type IN (65792, 2724111616);

-- Is Windows itself short of memory?
SELECT total_physical_memory_kb   / 1024 AS server_ram_mb,
       available_physical_memory_kb / 1024 AS available_mb
FROM   sys.dm_os_sys_memory;

-- Which memory clerk owns the instance?
SELECT TOP (10) type, name, pages_kb / 1024 AS mb
FROM   sys.dm_os_memory_clerks
ORDER BY pages_kb DESC;</code></pre>
<p>Interpretation: <em>Lazy writes/sec</em> in the hundreds continuously plus rising <em>Free list stalls/sec</em> means frames are being recycled as fast as they arrive; a sawtooth <em>Page life expectancy</em> confirms pages are evicted almost immediately. If <code>available_mb</code> is healthy at the same time, the pressure is internal — memory sizing, not the operating system.</p>
`
    },
    {
      h: "Fixing pressure without masking it",
      html: `
<p>The order of operations matters, because every "fix" trades one resource for another:</p>
<ul>
  <li><strong>Set <code>max server memory</code> explicitly</strong> — total RAM minus 1–4 GB for the OS, adjusted if other services share the host; never leave the default on a shared machine</li>
  <li><strong>Account for every memory consumer</strong> — SSRS, SSIS, SQL Agent, backup tools, and ETL engines all take memory outside the pool</li>
  <li><strong>Attack oversized working sets</strong> — unbounded reports and missing predicates evict hot pages faster than any setting can compensate (see the buffer pool topic)</li>
  <li><strong>Only then add RAM</strong> — hardware is the last lever, not the first</li>
</ul>
<p>Beware of "fixes" that hide the signal: capping memory so low that the lazy writer throttles the workload, or increasing the pool without removing the process that is actually stealing memory.</p>
`
    }
  ],

  scenario: {
    title: "The server has 128 GB of RAM and the lazy writer never sleeps",
    html: `
<p>After an unrelated storage incident, a colleague reduced <code>max server memory</code> from 100 GB to 8 GB "to be safe" and never restored it. Three weeks later the business reports the ERP slowing every afternoon. The DBA finds <em>Lazy writes/sec</em> steady in the high hundreds, <em>Free list stalls/sec</em> climbing hourly, page life expectancy oscillating between 5 and 40 seconds — while <code>available_mb</code> shows 90 GB free. The engine was in a permanent internal memory squeeze on a mostly idle machine.</p>
<p>Fix: restore <code>max server memory</code> to 104 GB in a monitored change window, watch free-buffer stalls fall to zero within minutes, and confirm PLE climbs back to hours. Prevention: memory settings recorded in the configuration baseline with an alert on drift, plus a dashboard for <em>Free list stalls/sec</em> — the counter that caught the problem before the first ticket.</p>
`
  },

  interview: [
    {
      q: "What does the lazy writer do, and how does it differ from a checkpoint?",
      a: "The lazy writer responds to memory pressure: it flushes dirty pages so it can reclaim frames and puts them back on the free lists. A checkpoint is a periodic, database-scoped flush that bounds recovery time and writes checkpoint log records. The lazy writer writes no log records and only produces as much space as pressure requires."
    },
    {
      q: "What does a persistently high Lazy writes/sec tell you?",
      a: "The buffer pool cannot hold the working set: frames are recycled almost as soon as they are freed. Causes include an undersized max server memory, another process stealing memory, or an oversized scan sweeping cold pages through the pool. Correlate with Free list stalls/sec, Page life expectancy, and available physical memory to pick the cause."
    },
    {
      q: "Windows shows plenty of free memory but the pool is under pressure. Where do you look?",
      a: "Inside SQL Server: check the configured max server memory versus target and current pool size, review sys.dm_os_memory_clerks to see which clerk is large, and check whether a scan or ad-hoc workload is driving turnover. External memory being free only proves the OS is fine — internal sizing can still starve the pool."
    }
  ],

  takeaways: [
    "The lazy writer flushes dirty pages and discards clean ones to keep free buffers available",
    "It writes no log records and creates no checkpoint — that is the checkpoint's job",
    "Pressure comes from the pool's own free lists or from Windows low-memory signals",
    "Sustained Lazy writes/sec + Free list stalls/sec + sawtooth PLE = chronic memory squeeze",
    "Set max server memory explicitly and account for every service sharing the host",
    "Fix sizing and workload first — adding RAM only hides a misconfigured pool"
  ]
};
