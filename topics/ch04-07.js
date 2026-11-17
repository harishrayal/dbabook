/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch04-07.html */

window.TOPIC = {
  id: "ch04-07",
  title: "Buffer Cache",

  lead: "The buffer cache is the page collection held inside the buffer pool: descriptors, hash lookups, and replacement lists that decide which 8-KB pages stay in RAM and which are evicted. Understanding how that cache is organised explains hit ratios, stolen pages, and why a failover makes everything slow for twenty minutes.",

  objectives: [
    "Distinguish the buffer pool (the memory) from the buffer cache (the pages it holds)",
    "Describe the buffer hash table, descriptors, and replacement lists",
    "Find which databases and objects own the cache",
    "Interpret cache counters: hit ratio, free pages, stolen pages"
  ],

  sections: [
    {
      h: "Pool, cache, and the other caches",
      html: `
<p>The terminology confuses even experienced DBAs, so pin it down:</p>
<table>
  <tr><th>Term</th><th>What it actually is</th></tr>
  <tr><td><strong>Buffer pool</strong></td><td>The memory region SQL Server allocates to hold 8-KB data and index pages (largest memory clerk)</td></tr>
  <tr><td><strong>Buffer cache</strong></td><td>The set of <em>pages</em> currently resident in that pool — the cache proper, managed through buffer descriptors and replacement lists</td></tr>
  <tr><td><strong>Plan / procedure cache</strong></td><td>Compiled query plans — a completely different memory clerk (ch04-08)</td></tr>
  <tr><td><strong>Columnstore / memory grants</strong></td><td>Other consumers competing for the same pool</td></tr>
</table>
<p>The performance counter named “Buffer cache hit ratio” measures only how often a page request was satisfied from RAM. Everything else — plans, locks, temp tables — is outside that ratio, which is why a perfect hit ratio never proves the server is healthy.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Buffer cache structure and replacement lists">
    <defs>
      <marker id="a07-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
      <marker id="a07-arrow-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"/>
      </marker>
    </defs>

    <rect x="20" y="16" width="190" height="54" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="115" y="38" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Page request</text>
    <text x="115" y="58" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">database · file · page_id</text>

    <rect x="265" y="16" width="230" height="54" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="38" text-anchor="middle" fill="var(--accent-strong)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">Buffer hash table</text>
    <text x="380" y="58" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">hash → buffer descriptor</text>

    <rect x="550" y="16" width="190" height="54" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="645" y="38" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Descriptor found?</text>
    <text x="645" y="58" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">hit · miss</text>

    <rect x="20" y="108" width="720" height="140" rx="14" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="132" text-anchor="middle" fill="var(--accent-strong)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Buffer cache — one descriptor per resident page</text>

    <rect x="40" y="146" width="150" height="84" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="115" y="176" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Free list</text>
    <text x="115" y="200" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">empty descriptors</text>
    <text x="115" y="219" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">first place a miss looks</text>

    <rect x="215" y="146" width="150" height="84" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="290" y="176" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Cold list</text>
    <text x="290" y="200" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">LRU tail</text>
    <text x="290" y="219" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">evicted first</text>

    <rect x="390" y="146" width="150" height="84" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="465" y="176" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Warm list</text>
    <text x="465" y="200" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">used recently</text>
    <text x="465" y="219" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">one touch from hot</text>

    <rect x="565" y="146" width="155" height="84" rx="9" fill="var(--surface)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="642" y="176" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Hot list</text>
    <text x="642" y="200" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">actively referenced</text>
    <text x="642" y="219" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">kept until pressure</text>

    <rect x="20" y="272" width="330" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="185" y="291" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Data files — physical 8 KB read on a miss</text>
    <text x="185" y="310" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">descriptor moves onto a list once the page arrives</text>

    <rect x="410" y="272" width="330" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="575" y="291" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Dirty pages — checkpoint / lazy writer</text>
    <text x="575" y="310" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">a stolen page must be flushed before reuse</text>

    <line x1="210" y1="43" x2="263" y2="43" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a07-arrow)"/>
    <line x1="495" y1="43" x2="548" y2="43" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a07-arrow)"/>
    <line x1="380" y1="70" x2="140" y2="144" stroke="var(--accent)" stroke-width="1.8" marker-end="url(#a07-arrow-acc)"/>
    <line x1="645" y1="70" x2="642" y2="144" stroke="var(--accent)" stroke-width="1.8" marker-end="url(#a07-arrow-acc)"/>
    <line x1="115" y1="230" x2="160" y2="270" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a07-arrow)"/>
    <line x1="465" y1="230" x2="540" y2="270" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a07-arrow)"/>

    <text x="250" y="100" fill="var(--muted)" font-size="11.5" font-style="italic" font-family="Segoe UI, sans-serif">miss → allocate a free descriptor</text>
    <text x="672" y="100" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-style="italic" font-family="Segoe UI, sans-serif">hit → touch</text>
  </svg>
  <div class="figcaption">Figure 1 — Hash lookup into the buffer cache and the replacement lists behind it.</div>
</div>
`
    },
    {
      h: "How a lookup works",
      html: `
<p>When the access method needs page <code>(7, 1, 20433)</code> — database, file, page — the buffer manager hashes that triple and probes the buffer hash table:</p>
<ol>
  <li><strong>Hit</strong> — a descriptor exists. The page is latched, read, and the descriptor is <em>touched</em>: it moves toward the hot end of the replacement lists. Cost: microseconds</li>
  <li><strong>Miss</strong> — no descriptor. SQL Server takes one from the <strong>free list</strong>; if the free list is empty, it steals from the cold end. If the stolen page is <em>dirty</em>, it must be flushed first — that is a <strong>stolen</strong> page, and the write is on the critical path of your query</li>
  <li><strong>Fetch</strong> — an asynchronous 8-KB read is issued; when it completes, the descriptor is linked into a list and the waiting task resumes</li>
</ol>
<p>Two consequences you can measure: a cache with many stolen pages is a cache under memory pressure, and a cache whose free list sits at zero with high <code>Lazy writes/sec</code> is recycling pages faster than it can serve them.</p>
`
    },
    {
      h: "Who owns the cache?",
      html: `
<p>The cache is shared, but it is not evenly divided. Joining the buffer descriptors to the allocation catalogue answers the question every capacity review asks — which objects are holding memory:</p>
<pre><code class="language-sql">-- Top 20 objects by cached pages (current database, in-row data)
SELECT TOP 20
       SCHEMA_NAME(o.schema_id)            AS schema_name,
       o.name                              AS table_name,
       i.name                              AS index_name,
       COUNT(*)                            AS cached_pages,
       COUNT(*) * 8 / 1024                 AS cached_mb
FROM   sys.dm_os_buffer_descriptors AS b
JOIN   sys.allocation_units AS au
       ON au.allocation_unit_id = b.allocation_unit_id
JOIN   sys.partitions AS p
       ON p.partition_id = au.container_id
JOIN   sys.objects AS o
       ON o.object_id = p.object_id
LEFT   JOIN sys.indexes AS i
       ON i.object_id = p.object_id AND i.index_id = p.index_id
WHERE  b.database_id = DB_ID()
  AND  au.type IN (1, 3)      -- IN_ROW_DATA and ROW_OVERFLOW_DATA
GROUP  BY o.schema_id, o.name, i.name
ORDER  BY cached_pages DESC;</code></pre>
<p>A report table holding 8 GB of descriptors tells you two things: it is crowding out the OLTP working set, and a scan of it will be nearly free the second time and expensive the first. Note the filter to in-row/row-overflow allocations — LOB allocations use <code>hobt_id</code> rather than <code>partition_id</code> as their container.</p>
`
    },
    {
      h: "Cache counters that matter",
      html: `
<p>The “Buffer cache hit ratio” counter is a ratio counter: its value must be divided by its <em>base</em> counter. In <code>sys.dm_os_performance_counters</code> both rows exist, and a DBA who reads the raw value is reading meaningless integers:</p>
<pre><code class="language-sql">-- Hit ratio (value / base) plus cache pressure counters
SELECT p.counter_name,
       CASE WHEN p.counter_name = N'Buffer cache hit ratio'
            THEN CAST(100.0 * p.cntr_value / NULLIF(b.cntr_value, 0) AS decimal(5, 2))
            ELSE CAST(p.cntr_value AS decimal(18, 0))
       END AS current_value,
       p.cntr_type
FROM   sys.dm_os_performance_counters AS p
LEFT   JOIN sys.dm_os_performance_counters AS b
       ON b.counter_name = N'Buffer cache hit ratio base'
      AND b.object_name = p.object_name
WHERE  p.counter_name IN (N'Buffer cache hit ratio', N'Buffer cache hit ratio base',
                          N'Free pages', N'Stolen pages', N'Total pages',
                          N'Lazy writes/sec', N'Page reads/sec', N'Page writes/sec');</code></pre>
<table>
  <tr><th>Counter</th><th>Healthy reading</th><th>Interpretation</th></tr>
  <tr><td><code>Buffer cache hit ratio</code></td><td>Above ~98% steady state</td><td>Below that: working set larger than pool, or cold cache</td></tr>
  <tr><td><code>Free pages</code></td><td>Non-trivial pool available</td><td>Near zero: cache is full, evictions are inevitable</td></tr>
  <tr><td><code>Stolen pages</code></td><td>Low and stable</td><td>Rising: dirty pages blocking reuse — pressure or write burst</td></tr>
  <tr><td><code>Page reads/sec</code></td><td>Steady, modest</td><td>Spike with falling hit ratio: cache misses, not query cost</td></tr>
</table>
`
    },
    {
      h: "Cold caches: restarts, failovers, restores",
      html: `
<p>The cache is volatile — it starts empty on every instance start, failover, and many restores. A cold cache has a predictable signature:</p>
<ul>
  <li>Hit ratio plunges (60–75% is normal briefly), <code>Page reads/sec</code> spikes, and <code>PAGEIOLATCH_SH</code> becomes the top wait</li>
  <li>Queries that touch hot tables re-read them from disk — elapsed time is dominated by I/O, not CPU</li>
  <li>Within minutes (or one pass of the workload) the working set returns to RAM and the counters normalise</li>
</ul>
<p>Practical responses: <strong>expect it</strong> (do not chase a storage fault that is actually a warm-up), <strong>throttle</strong> the rollout of heavy jobs immediately after a failover, and where the business requires it, run a documented <strong>cache-warming</strong> routine — a curated set of queries against the critical tables — before opening traffic. On a readable secondary, warming is done by running those queries against the replica itself.</p>
`
    },
    {
      h: "Cache health as a baseline",
      html: `
<p>Cache metrics are trend metrics: one reading proves nothing, a curve proves everything. Capture them alongside page life expectancy so you can separate “cache too small” from “cache too hot”:</p>
<pre><code class="language-sql">-- Snapshot of cache state per database: how much of the pool each owns
SELECT DB_NAME(database_id)            AS database_name,
       COUNT(*)                        AS cached_pages,
       COUNT(*) * 8 / 1024             AS cached_mb,
       SUM(CASE WHEN is_modified = 1 THEN 1 ELSE 0 END) AS dirty_pages
FROM   sys.dm_os_buffer_descriptors
GROUP  BY database_id
ORDER  BY cached_pages DESC;</code></pre>
<p>Baselining this by hour of day reveals the pattern that matters: if the reporting database's cached pages grow through the morning and never shrink, it is steadily evicting the OLTP database's working set — a cache-allocation problem that no index will fix, but memory sizing or workload separation will.</p>
`
    }
  ],

  scenario: {
    title: "Twenty slow minutes after every failover — and no fault anywhere",
    html: `
<p>After a planned failover to the synchronous replica, checkout latency was 4–6 seconds for exactly 22 minutes, then returned to normal on its own. The replica had identical hardware, identical files, and no blocking. The DBA's counters showed the story instantly: buffer cache hit ratio at 61%, <code>Page reads/sec</code> at 14,000, free pages at zero, and <code>PAGEIOLATCH_SH</code> dominating waits.</p>
<p>Diagnosis: a completely cold buffer cache — every hot page had to be re-read from disk before queries could run at speed. The storage was fine; the cache simply had to refill. Resolution: the team let the working set rebuild, delayed the nightly reporting load by 30 minutes so it would not compete for free descriptors, and confirmed hit ratio recovered above 99% once the warm-up completed.</p>
<p>Prevention: the failover runbook now includes a cache-warming step for the top 15 critical queries, an explicit note that a cold-cache warm-up is expected behaviour (so the next on-call does not misdiagnose it), and a hit-ratio floor alert set with a 30-minute grace period after any restart or failover event.</p>
`
  },

  interview: [
    {
      q: "What is the difference between the buffer pool and the buffer cache?",
      a: "The buffer pool is the memory region allocated to hold 8-KB pages — the largest memory clerk. The buffer cache is the collection of pages resident in it, organised by a hash table of buffer descriptors and free/cold/warm/hot replacement lists. The pool is the container; the cache is the content and the policy that manages it."
    },
    {
      q: "How do you find out which object is using the most buffer cache?",
      a: "Join sys.dm_os_buffer_descriptors to sys.allocation_units and sys.partitions (matching container_id to partition_id for in-row and row-overflow allocations, hobt_id for LOB), then group by object and index. The result ranks objects by cached pages and shows you what is crowding out the working set."
    },
    {
      q: "Hit ratio drops to 60% after a failover. Is something wrong?",
      a: "Usually not — it is the expected signature of a cold cache: pages must be re-read before they can be served, so the ratio falls and PAGEIOLATCH waits rise until the working set returns to RAM. Verify by watching page life expectancy climb and page reads/sec settle; the fix is a warm-up runbook and delaying heavy jobs, not storage remediation."
    }
  ],

  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Pool, cache, and the other caches”?",
      "options": [
        "Rising: dirty pages blocking reuse — pressure or write burst",
        "Spike with falling hit ratio: cache misses, not query cost",
        "The terminology confuses even experienced DBAs, so pin it down:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The terminology confuses even experienced DBAs, so pin it down:”"
    },
    {
      "question": "Which fact is covered in the lesson section “How a lookup works”?",
      "options": [
        "Below that: working set larger than pool, or cold cache",
        "When the access method needs page (7, 1, 20433) — database, file, page — the buffer manager hashes that triple and probes the buffer hash table:",
        "base"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “When the access method needs page (7, 1, 20433) — database, file, page — the buffer manager hashes that triple and probes the buffer hash table:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Who owns the cache?”?",
      "options": [
        "The cache is shared, but it is not evenly divided.",
        "Below that: working set larger than pool, or cold cache",
        "Near zero: cache is full, evictions are inevitable"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The cache is shared, but it is not evenly divided. Joining the buffer descriptors to the allocation catalogue answers the question every capacity review asks — which objects are holding memory:”"
    },
    {
      "question": "Complete the lesson statement: “The “Buffer cache hit ratio” counter is a ratio counter: its value must be divided by its _____ counter.”",
      "options": [
        "stolen",
        "Fetch",
        "base"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The “Buffer cache hit ratio” counter is a ratio counter: its value must be divided by its base counter. In sys.dm_os_performance_counters both rows exist, and a DBA who reads the raw value is reading meaningless integers:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Cold caches: restarts, failovers, restores”?",
      "options": [
        "Near zero: cache is full, evictions are inevitable",
        "The cache is volatile — it starts empty on every instance start, failover, and many restores.",
        "Below that: working set larger than pool, or cold cache"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The cache is volatile — it starts empty on every instance start, failover, and many restores. A cold cache has a predictable signature:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Cache health as a baseline”?",
      "options": [
        "Cache metrics are trend metrics: one reading proves nothing, a curve proves everything.",
        "Near zero: cache is full, evictions are inevitable",
        "Rising: dirty pages blocking reuse — pressure or write burst"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Cache metrics are trend metrics: one reading proves nothing, a curve proves everything. Capture them alongside page life expectancy so you can separate “cache too small” from “cache too hot”:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pool, cache, and the other caches”?",
      "options": [
        "The terminology confuses even experienced DBAs, so pin it down:",
        "The memory region SQL Server allocates to hold 8-KB data and index pages (largest memory clerk)",
        "The performance counter named “Buffer cache hit ratio” measures only how often a page request was satisfied from RAM."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The performance counter named “Buffer cache hit ratio” measures only how often a page request was satisfied from RAM. Everything else — plans, locks, temp tables — is outside that ratio, which is why a perfect hit ratio never proves the server is healthy.”"
    },
    {
      "question": "Which fact is covered in the lesson section “How a lookup works”?",
      "options": [
        "Cache metrics are trend metrics: one reading proves nothing, a curve proves everything.",
        "Two consequences you can measure: a cache with many stolen pages is a cache under memory pressure, and a cache whose free list sits at zero with high Lazy writes/sec is recycling…",
        "expect it"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Two consequences you can measure: a cache with many stolen pages is a cache under memory pressure, and a cache whose free list sits at zero with high Lazy writes/sec is recycling pages faster than it can serve them.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Who owns the cache?”?",
      "options": [
        "A report table holding 8 GB of descriptors tells you two things: it is crowding out the OLTP working set, and a scan of it will be nearly free the second time and expensive the…",
        "Cache metrics are trend metrics: one reading proves nothing, a curve proves everything.",
        "Baselining this by hour of day reveals the pattern that matters: if the reporting database's cached pages grow through the morning and never shrink, it is steadily evicting the…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A report table holding 8 GB of descriptors tells you two things: it is crowding out the OLTP working set, and a scan of it will be nearly free the second time and expensive the first. Note the filter to in-row/row-overflow allocations — LOB allocations use hobt_id rather than partition_id as their container.”"
    },
    {
      "question": "In the “Cache counters that matter” table, what is listed for “Buffer cache hit ratio” under “Interpretation”?",
      "options": [
        "Cache metrics are trend metrics: one reading proves nothing, a curve proves everything.",
        "Baselining this by hour of day reveals the pattern that matters: if the reporting database's cached pages grow through the morning and never shrink, it is steadily evicting the…",
        "Below that: working set larger than pool, or cold cache"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “Buffer cache hit ratio” as “Below that: working set larger than pool, or cold cache”."
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Pool, cache, and the other caches”?",
      "options": [
        "Rising: dirty pages blocking reuse — pressure or write burst",
        "Spike with falling hit ratio: cache misses, not query cost",
        "The terminology confuses even experienced DBAs, so pin it down:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The terminology confuses even experienced DBAs, so pin it down:”"
    },
    {
      "question": "Which fact is covered in the lesson section “How a lookup works”?",
      "options": [
        "Below that: working set larger than pool, or cold cache",
        "When the access method needs page (7, 1, 20433) — database, file, page — the buffer manager hashes that triple and probes the buffer hash table:",
        "base"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “When the access method needs page (7, 1, 20433) — database, file, page — the buffer manager hashes that triple and probes the buffer hash table:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Who owns the cache?”?",
      "options": [
        "The cache is shared, but it is not evenly divided.",
        "Below that: working set larger than pool, or cold cache",
        "Near zero: cache is full, evictions are inevitable"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The cache is shared, but it is not evenly divided. Joining the buffer descriptors to the allocation catalogue answers the question every capacity review asks — which objects are holding memory:”"
    },
    {
      "question": "Complete the lesson statement: “The “Buffer cache hit ratio” counter is a ratio counter: its value must be divided by its _____ counter.”",
      "options": [
        "stolen",
        "Fetch",
        "base"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The “Buffer cache hit ratio” counter is a ratio counter: its value must be divided by its base counter. In sys.dm_os_performance_counters both rows exist, and a DBA who reads the raw value is reading meaningless integers:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Cold caches: restarts, failovers, restores”?",
      "options": [
        "Near zero: cache is full, evictions are inevitable",
        "The cache is volatile — it starts empty on every instance start, failover, and many restores.",
        "Below that: working set larger than pool, or cold cache"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The cache is volatile — it starts empty on every instance start, failover, and many restores. A cold cache has a predictable signature:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Cache health as a baseline”?",
      "options": [
        "Cache metrics are trend metrics: one reading proves nothing, a curve proves everything.",
        "Near zero: cache is full, evictions are inevitable",
        "Rising: dirty pages blocking reuse — pressure or write burst"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Cache metrics are trend metrics: one reading proves nothing, a curve proves everything. Capture them alongside page life expectancy so you can separate “cache too small” from “cache too hot”:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pool, cache, and the other caches”?",
      "options": [
        "The terminology confuses even experienced DBAs, so pin it down:",
        "The memory region SQL Server allocates to hold 8-KB data and index pages (largest memory clerk)",
        "The performance counter named “Buffer cache hit ratio” measures only how often a page request was satisfied from RAM."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The performance counter named “Buffer cache hit ratio” measures only how often a page request was satisfied from RAM. Everything else — plans, locks, temp tables — is outside that ratio, which is why a perfect hit ratio never proves the server is healthy.”"
    },
    {
      "question": "Which fact is covered in the lesson section “How a lookup works”?",
      "options": [
        "Cache metrics are trend metrics: one reading proves nothing, a curve proves everything.",
        "Two consequences you can measure: a cache with many stolen pages is a cache under memory pressure, and a cache whose free list sits at zero with high Lazy writes/sec is recycling…",
        "expect it"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Two consequences you can measure: a cache with many stolen pages is a cache under memory pressure, and a cache whose free list sits at zero with high Lazy writes/sec is recycling pages faster than it can serve them.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Who owns the cache?”?",
      "options": [
        "A report table holding 8 GB of descriptors tells you two things: it is crowding out the OLTP working set, and a scan of it will be nearly free the second time and expensive the…",
        "Cache metrics are trend metrics: one reading proves nothing, a curve proves everything.",
        "Baselining this by hour of day reveals the pattern that matters: if the reporting database's cached pages grow through the morning and never shrink, it is steadily evicting the…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A report table holding 8 GB of descriptors tells you two things: it is crowding out the OLTP working set, and a scan of it will be nearly free the second time and expensive the first. Note the filter to in-row/row-overflow allocations — LOB allocations use hobt_id rather than partition_id as their container.”"
    },
    {
      "question": "In the “Cache counters that matter” table, what is listed for “Buffer cache hit ratio” under “Interpretation”?",
      "options": [
        "Cache metrics are trend metrics: one reading proves nothing, a curve proves everything.",
        "Baselining this by hour of day reveals the pattern that matters: if the reporting database's cached pages grow through the morning and never shrink, it is steadily evicting the…",
        "Below that: working set larger than pool, or cold cache"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “Buffer cache hit ratio” as “Below that: working set larger than pool, or cold cache”."
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Pool, cache, and the other caches”?",
      "options": [
        "Rising: dirty pages blocking reuse — pressure or write burst",
        "Spike with falling hit ratio: cache misses, not query cost",
        "The terminology confuses even experienced DBAs, so pin it down:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The terminology confuses even experienced DBAs, so pin it down:”"
    },
    {
      "question": "Which fact is covered in the lesson section “How a lookup works”?",
      "options": [
        "Below that: working set larger than pool, or cold cache",
        "When the access method needs page (7, 1, 20433) — database, file, page — the buffer manager hashes that triple and probes the buffer hash table:",
        "base"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “When the access method needs page (7, 1, 20433) — database, file, page — the buffer manager hashes that triple and probes the buffer hash table:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Who owns the cache?”?",
      "options": [
        "The cache is shared, but it is not evenly divided.",
        "Below that: working set larger than pool, or cold cache",
        "Near zero: cache is full, evictions are inevitable"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The cache is shared, but it is not evenly divided. Joining the buffer descriptors to the allocation catalogue answers the question every capacity review asks — which objects are holding memory:”"
    },
    {
      "question": "Complete the lesson statement: “The “Buffer cache hit ratio” counter is a ratio counter: its value must be divided by its _____ counter.”",
      "options": [
        "stolen",
        "Fetch",
        "base"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The “Buffer cache hit ratio” counter is a ratio counter: its value must be divided by its base counter. In sys.dm_os_performance_counters both rows exist, and a DBA who reads the raw value is reading meaningless integers:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Cold caches: restarts, failovers, restores”?",
      "options": [
        "Near zero: cache is full, evictions are inevitable",
        "The cache is volatile — it starts empty on every instance start, failover, and many restores.",
        "Below that: working set larger than pool, or cold cache"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The cache is volatile — it starts empty on every instance start, failover, and many restores. A cold cache has a predictable signature:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Cache health as a baseline”?",
      "options": [
        "Cache metrics are trend metrics: one reading proves nothing, a curve proves everything.",
        "Near zero: cache is full, evictions are inevitable",
        "Rising: dirty pages blocking reuse — pressure or write burst"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Cache metrics are trend metrics: one reading proves nothing, a curve proves everything. Capture them alongside page life expectancy so you can separate “cache too small” from “cache too hot”:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pool, cache, and the other caches”?",
      "options": [
        "The terminology confuses even experienced DBAs, so pin it down:",
        "The memory region SQL Server allocates to hold 8-KB data and index pages (largest memory clerk)",
        "The performance counter named “Buffer cache hit ratio” measures only how often a page request was satisfied from RAM."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The performance counter named “Buffer cache hit ratio” measures only how often a page request was satisfied from RAM. Everything else — plans, locks, temp tables — is outside that ratio, which is why a perfect hit ratio never proves the server is healthy.”"
    },
    {
      "question": "Which fact is covered in the lesson section “How a lookup works”?",
      "options": [
        "Cache metrics are trend metrics: one reading proves nothing, a curve proves everything.",
        "Two consequences you can measure: a cache with many stolen pages is a cache under memory pressure, and a cache whose free list sits at zero with high Lazy writes/sec is recycling…",
        "expect it"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Two consequences you can measure: a cache with many stolen pages is a cache under memory pressure, and a cache whose free list sits at zero with high Lazy writes/sec is recycling pages faster than it can serve them.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Who owns the cache?”?",
      "options": [
        "A report table holding 8 GB of descriptors tells you two things: it is crowding out the OLTP working set, and a scan of it will be nearly free the second time and expensive the…",
        "Cache metrics are trend metrics: one reading proves nothing, a curve proves everything.",
        "Baselining this by hour of day reveals the pattern that matters: if the reporting database's cached pages grow through the morning and never shrink, it is steadily evicting the…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A report table holding 8 GB of descriptors tells you two things: it is crowding out the OLTP working set, and a scan of it will be nearly free the second time and expensive the first. Note the filter to in-row/row-overflow allocations — LOB allocations use hobt_id rather than partition_id as their container.”"
    },
    {
      "question": "In the “Cache counters that matter” table, what is listed for “Buffer cache hit ratio” under “Interpretation”?",
      "options": [
        "Cache metrics are trend metrics: one reading proves nothing, a curve proves everything.",
        "Baselining this by hour of day reveals the pattern that matters: if the reporting database's cached pages grow through the morning and never shrink, it is steadily evicting the…",
        "Below that: working set larger than pool, or cold cache"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “Buffer cache hit ratio” as “Below that: working set larger than pool, or cold cache”."
    }
  ],
  takeaways: [
    "Buffer pool = the memory; buffer cache = the pages in it, managed by hash lookup and replacement lists",
    "A hit touches the descriptor toward hot; a miss allocates from the free list and may have to steal (and flush) a page",
    "sys.dm_os_buffer_descriptors joined to allocation metadata shows which objects own the cache",
    "Read hit ratio as value/base — the raw counter is meaningless without its base",
    "Cold caches after restart/failover/restore are normal: hit ratio falls, reads spike, then it self-heals",
    "Baseline cache ownership per database hourly — steady growth by one database means it is evicting everyone else"
  ]
};
