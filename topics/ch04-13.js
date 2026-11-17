/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch04-13.html */

window.TOPIC = {
  id: "ch04-13",
  title: "Buffer Management",

  lead: "Buffer management is the storage engine's memory discipline — deciding which 8-KB pages stay in RAM, protecting them while they are used, and getting modified pages to disk without ever breaking the write-ahead rules.",

  objectives: [
    "List the core jobs of the buffer manager",
    "Trace how a page lookup resolves through the hash table and buffer descriptors",
    "Distinguish latches from locks and interpret latch wait types",
    "Explain the steal and no-force policy and its recovery consequences",
    "Monitor buffer residency, dirty pages, and latch waits with DMVs"
  ],

  sections: [
    {
      h: "The buffer manager's four jobs",
      html: `
<p>The <strong>buffer manager</strong> owns the buffer pool and performs four jobs on behalf of every operation that touches a page:</p>
<ul>
  <li><strong>Allocate and free</strong> — hand out 8-KB page frames and return them to free lists</li>
  <li><strong>Read</strong> — fetch a page from disk into a frame when it is not already cached</li>
  <li><strong>Find</strong> — resolve a page address to an in-memory frame in constant time</li>
  <li><strong>Flush</strong> — write modified frames to disk on checkpoint or under memory pressure</li>
</ul>
<p>Everything above it — the access methods, locking, latch managers — assumes the buffer manager can produce a page on demand. The buffer pool is exposed as the <code>BUFFERPOOL</code> memory clerk in <code>sys.dm_os_memory_clerks</code>, and it is almost always the largest consumer of memory on the instance.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Buffer manager page lookup flow">
    <defs>
      <marker id="p13-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="20" y="24" width="150" height="56" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="95" y="48" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Page request</text>
    <text x="95" y="68" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">database, file, page</text>

    <rect x="215" y="24" width="175" height="56" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="302" y="48" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Hash lookup</text>
    <text x="302" y="68" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">hash on dbid + file + page</text>

    <rect x="440" y="24" width="185" height="56" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="532" y="48" text-anchor="middle" fill="var(--accent-strong)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Buffer descriptor</text>
    <text x="532" y="68" text-anchor="middle" fill="var(--accent-strong)" font-size="11.5" font-family="Segoe UI, sans-serif">the page's record in memory</text>

    <rect x="110" y="134" width="520" height="118" rx="14" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="370" y="160" text-anchor="middle" fill="var(--accent-strong)" font-size="16" font-weight="700" font-family="Segoe UI, sans-serif">Buffer pool</text>

    <rect x="140" y="176" width="155" height="56" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="217" y="200" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Free lists</text>
    <text x="217" y="220" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">clean frames, ready to use</text>

    <rect x="312" y="176" width="148" height="56" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="386" y="200" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Replacement</text>
    <text x="386" y="220" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">cold end first</text>

    <rect x="478" y="176" width="132" height="56" rx="9" fill="var(--surface)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="544" y="200" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Dirty pages</text>
    <text x="544" y="220" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">flush before reuse</text>

    <rect x="600" y="278" width="140" height="50" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="670" y="300" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Data files</text>
    <text x="670" y="318" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">MDF / NDF</text>

    <line x1="170" y1="52" x2="213" y2="52" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#p13-arrow)"/>
    <line x1="390" y1="52" x2="438" y2="52" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#p13-arrow)"/>
    <line x1="470" y1="80" x2="420" y2="132" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#p13-arrow)"/>
    <text x="470" y="110" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">hit: latch and serve</text>

    <line x1="545" y1="252" x2="610" y2="276" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#p13-arrow)"/>
    <text x="500" y="272" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">miss: physical read</text>

    <text x="370" y="304" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Descriptor found in the hash table means a hit; otherwise a free frame is taken and the page is read in</text>
  </svg>
  <div class="figcaption">Figure 1 — Page lookup: hash table to buffer descriptor to frame, with a physical read only on a miss.</div>
</div>
`
    },
    {
      h: "Hash table, descriptors, and replacement",
      html: `
<p>Every cached page has exactly one <strong>buffer descriptor</strong> — a small structure recording database id, file id, page id, whether the page is dirty, and where its frame lives. Descriptors are found through a hash table keyed on (database id, file id, page id), which is why page lookup is constant-time regardless of pool size.</p>
<p>When a page is requested and the hash lookup misses, the buffer manager needs a frame:</p>
<ul>
  <li>Take one from a <strong>free list</strong> if available — zero contention, no work</li>
  <li>Otherwise <strong>replace</strong>: walk from the cold end of the replacement queues, prefer a clean page (nothing to write), and reuse its frame</li>
  <li>If the chosen page is dirty, it must be flushed first — but dirty pages are normally written ahead of time by checkpoints and the lazy writer, precisely so replacement is not forced to do I/O in a request path</li>
</ul>
<p>The practical consequence: free buffers are a leading indicator. When free lists run dry, every miss starts competing for frames, wait times rise, and the counters <em>Free list stalls/sec</em> and <em>Lazy writes/sec</em> climb together.</p>
`
    },
    {
      h: "Latches: protection measured in milliseconds",
      html: `
<p>When a page is being read or modified, the engine must guarantee structural consistency — that is a <strong>latch</strong>'s job, not a lock's:</p>
<table>
  <tr><th></th><th>Lock</th><th>Latch</th></tr>
  <tr><td>Protects</td><td>Data visibility between transactions</td><td>Physical structure of an in-memory object</td></tr>
  <tr><td>Duration</td><td>Transaction lifetime</td><td>Milliseconds, statement or operation scope</td></tr>
  <tr><td>Logged</td><td>No, but waits are visible in waits and blocking chains</td><td>No logging at all</td></tr>
  <tr><td>Typical waits</td><td>LCK_M_*</td><td>PAGELATCH_*, PAGEIOLATCH_*, LATCH_*</td></tr>
</table>
<p>The wait type itself tells you where the time went:</p>
<ul>
  <li><strong>PAGELATCH_*</strong> — waiting for a latch on a page that is already in memory: pure in-memory contention (hot page, allocation bitmaps, page splits)</li>
  <li><strong>PAGEIOLATCH_*</strong> — waiting for the physical read of a page to finish: the page was <em>not</em> cached; this is an I/O problem wearing a latch's clothing</li>
</ul>
<p>Confusing the two is a classic misdiagnosis: a PAGEIOLATCH storm means storage or an oversized scan, while a PAGELATCH storm means concurrency on a small set of pages.</p>
`
    },
    {
      h: "Steal and no-force: the buffer manager's contract",
      html: `
<p>The buffer manager runs SQL Server under two deliberate policy choices:</p>
<table>
  <tr><th>Policy</th><th>Meaning</th><th>SQL Server</th></tr>
  <tr><td><strong>Steal</strong></td><td>May write pages of uncommitted transactions to the data files</td><td>Yes — steal</td></tr>
  <tr><td><strong>Force</strong></td><td>Must write a transaction's pages before it can commit</td><td>No — no-force</td></tr>
</table>
<p>Because of <em>no-force</em>, a commit's durability comes entirely from flushing the log — the data page may still be in memory hours later. Because of <em>steal</em>, data files can contain changes of transactions that were later rolled back. Both directions are exactly why crash recovery needs both a redo pass (committed work not yet on disk) and an undo pass (uncommitted work already on disk) — and why the write-ahead logging rule is not optional.</p>
`
    },
    {
      h: "Monitoring buffer management",
      html: `
<p>Two queries cover most buffer-management health checks:</p>
<pre><code class="language-sql">-- Which databases own the buffer pool, and how much of it is dirty?
SELECT db_name(database_id)          AS database_name,
       count(*) * 8 / 1024           AS cached_mb,
       sum(CASE WHEN is_modified = 1 THEN 1 ELSE 0 END) * 8 / 1024 AS dirty_mb
FROM   sys.dm_os_buffer_descriptors
GROUP BY database_id
ORDER BY cached_mb DESC;</code></pre>
<pre><code class="language-sql">-- Separate in-memory contention from storage waits
SELECT wait_type, waiting_tasks_count, wait_time_ms,
       wait_time_ms / nullif(waiting_tasks_count, 0) AS avg_wait_ms
FROM   sys.dm_os_wait_stats
WHERE  wait_type LIKE 'PAGE%LATCH%'
ORDER BY wait_time_ms DESC;</code></pre>
<p>Interpret them together: high dirty_mb with rising PAGELATCH waits points at write contention on hot pages; high PAGEIOLATCH with low cache residency points at I/O or memory sizing. On very large pools note that <code>sys.dm_os_buffer_descriptors</code> walks every descriptor — collect it during quiet periods or against a single database with a <code>WHERE database_id = ...</code> filter.</p>
`
    }
  ],

  scenario: {
    title: "Checkout inserts stalled while CPU and blocking stayed at zero",
    html: `
<p>A payments team reports throughput dropping from 900 to 150 inserts per second between 09:00 and 17:00. There are no blocking chains, CPU sits at 12%, and queries return instantly in isolation. The DBA finds <code>PAGELATCH_UP</code> as the top wait, with the wait resource pointing at the last page of a clustered index on an IDENTITY key — every insert in the system was contending for one page.</p>
<p>Immediate action: none of the usual fixes (more indexes, more CPU) apply, so the team throttles the batch uploader to smooth the burst. The structural fix follows in the release window: cluster the table on a randomly distributed key (a hashed surrogate) so inserts spread across the leaf, and move one high-rate table to a partitioned design. Within a week PAGELATCH_UP disappeared from the wait profile. <strong>The bottleneck was a single page in memory, not the storage or the server.</strong></p>
`
  },

  interview: [
    {
      q: "What is the difference between a latch and a lock?",
      a: "A lock protects data visibility between transactions and lives for the transaction's duration; a latch protects the physical structure of an in-memory object (like a page being read or modified) and lives for milliseconds. Latches are never logged and cannot be escalated or deadlocked with locks, but they show up as PAGELATCH or PAGEIOLATCH waits."
    },
    {
      q: "What do steal and no-force mean, and why does SQL Server choose them?",
      a: "Steal means uncommitted pages may be written to the data files; no-force means committed pages are not required to be written at commit. SQL Server uses both so that commits only cost one log flush and the buffer pool is never held hostage by large transactions. WAL plus crash recovery (redo for no-force, undo for steal) makes the combination safe."
    },
    {
      q: "PAGEIOLATCH_SH versus PAGELATCH_SH — how do you interpret the difference?",
      a: "PAGEIOLATCH_SH means the session is waiting for a physical read to complete: the page was not cached, so look at storage latency, memory sizing, or scans pulling in cold pages. PAGELATCH_SH means the page is in memory but another session holds its latch: in-memory contention — a hot page, a page split, or allocation bitmap contention."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “The _____ owns the buffer pool and performs four jobs on behalf of every operation that touches a page:”",
      "options": [
        "Steal",
        "Force",
        "buffer manager"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The buffer manager owns the buffer pool and performs four jobs on behalf of every operation that touches a page:”"
    },
    {
      "question": "Complete the lesson statement: “Every cached page has exactly one _____ — a small structure recording database id, file id, page id, whether the page is dirty, and where its frame lives.”",
      "options": [
        "no-force",
        "buffer descriptor",
        "Force"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Every cached page has exactly one buffer descriptor — a small structure recording database id, file id, page id, whether the page is dirty, and where its frame lives. Descriptors are found through a hash table keyed on (database id, file id, page id), which is why page lookup is constant-time regardless of pool size.”"
    },
    {
      "question": "Complete the lesson statement: “When a page is being read or modified, the engine must guarantee structural consistency — that is a _____ 's job, not a lock's:”",
      "options": [
        "latch",
        "no-force",
        "Everything above it — the access methods, locking, latch managers — assumes the buffer manager can produce a page on demand."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “When a page is being read or modified, the engine must guarantee structural consistency — that is a latch 's job, not a lock's:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Steal and no-force: the buffer manager's contract”?",
      "options": [
        "No — no-force",
        "Allocate and free",
        "The buffer manager runs SQL Server under two deliberate policy choices:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The buffer manager runs SQL Server under two deliberate policy choices:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Monitoring buffer management”?",
      "options": [
        "Read",
        "Two queries cover most buffer-management health checks:",
        "Allocate and free"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Two queries cover most buffer-management health checks:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The buffer manager's four jobs”?",
      "options": [
        "Everything above it — the access methods, locking, latch managers — assumes the buffer manager can produce a page on demand.",
        "Read",
        "Find"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Everything above it — the access methods, locking, latch managers — assumes the buffer manager can produce a page on demand. The buffer pool is exposed as the BUFFERPOOL memory clerk in sys.dm_os_memory_clerks, and it is almost always the largest consumer of memory on the instance.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Hash table, descriptors, and replacement”?",
      "options": [
        "Find",
        "Flush",
        "When a page is requested and the hash lookup misses, the buffer manager needs a frame:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “When a page is requested and the hash lookup misses, the buffer manager needs a frame:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Latches: protection measured in milliseconds”?",
      "options": [
        "free list",
        "The wait type itself tells you where the time went:",
        "Flush"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The wait type itself tells you where the time went:”"
    },
    {
      "question": "Complete the lesson statement: “Because of _____, a commit's durability comes entirely from flushing the log — the data page may still be in memory hours later.”",
      "options": [
        "no-force",
        "Milliseconds, statement or operation scope",
        "No logging at all"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Because of no-force, a commit's durability comes entirely from flushing the log — the data page may still be in memory hours later. Because of steal, data files can contain changes of transactions that were later rolled back. Both directions are exactly why crash recovery needs both a redo pass (committed work not yet on disk) and an undo pass (uncommitted work already on disk) — and why the write-ahead logging rule is not optional.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Monitoring buffer management”?",
      "options": [
        "replace",
        "Lazy writes/sec",
        "Interpret them together: high dirty_mb with rising PAGELATCH waits points at write contention on hot pages; high PAGEIOLATCH with low cache residency points at I/O or memory…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Interpret them together: high dirty_mb with rising PAGELATCH waits points at write contention on hot pages; high PAGEIOLATCH with low cache residency points at I/O or memory sizing. On very large pools note that sys.dm_os_buffer_descriptors walks every descriptor — collect it during quiet periods or against a single database with a WHERE database_id =... filter.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “The _____ owns the buffer pool and performs four jobs on behalf of every operation that touches a page:”",
      "options": [
        "Steal",
        "Force",
        "buffer manager"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The buffer manager owns the buffer pool and performs four jobs on behalf of every operation that touches a page:”"
    },
    {
      "question": "Complete the lesson statement: “Every cached page has exactly one _____ — a small structure recording database id, file id, page id, whether the page is dirty, and where its frame lives.”",
      "options": [
        "no-force",
        "buffer descriptor",
        "Force"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Every cached page has exactly one buffer descriptor — a small structure recording database id, file id, page id, whether the page is dirty, and where its frame lives. Descriptors are found through a hash table keyed on (database id, file id, page id), which is why page lookup is constant-time regardless of pool size.”"
    },
    {
      "question": "Complete the lesson statement: “When a page is being read or modified, the engine must guarantee structural consistency — that is a _____ 's job, not a lock's:”",
      "options": [
        "latch",
        "no-force",
        "Everything above it — the access methods, locking, latch managers — assumes the buffer manager can produce a page on demand."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “When a page is being read or modified, the engine must guarantee structural consistency — that is a latch 's job, not a lock's:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Steal and no-force: the buffer manager's contract”?",
      "options": [
        "No — no-force",
        "Allocate and free",
        "The buffer manager runs SQL Server under two deliberate policy choices:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The buffer manager runs SQL Server under two deliberate policy choices:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Monitoring buffer management”?",
      "options": [
        "Read",
        "Two queries cover most buffer-management health checks:",
        "Allocate and free"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Two queries cover most buffer-management health checks:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The buffer manager's four jobs”?",
      "options": [
        "Everything above it — the access methods, locking, latch managers — assumes the buffer manager can produce a page on demand.",
        "Read",
        "Find"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Everything above it — the access methods, locking, latch managers — assumes the buffer manager can produce a page on demand. The buffer pool is exposed as the BUFFERPOOL memory clerk in sys.dm_os_memory_clerks, and it is almost always the largest consumer of memory on the instance.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Hash table, descriptors, and replacement”?",
      "options": [
        "Find",
        "Flush",
        "When a page is requested and the hash lookup misses, the buffer manager needs a frame:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “When a page is requested and the hash lookup misses, the buffer manager needs a frame:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Latches: protection measured in milliseconds”?",
      "options": [
        "free list",
        "The wait type itself tells you where the time went:",
        "Flush"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The wait type itself tells you where the time went:”"
    },
    {
      "question": "Complete the lesson statement: “Because of _____, a commit's durability comes entirely from flushing the log — the data page may still be in memory hours later.”",
      "options": [
        "no-force",
        "Milliseconds, statement or operation scope",
        "No logging at all"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Because of no-force, a commit's durability comes entirely from flushing the log — the data page may still be in memory hours later. Because of steal, data files can contain changes of transactions that were later rolled back. Both directions are exactly why crash recovery needs both a redo pass (committed work not yet on disk) and an undo pass (uncommitted work already on disk) — and why the write-ahead logging rule is not optional.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Monitoring buffer management”?",
      "options": [
        "replace",
        "Lazy writes/sec",
        "Interpret them together: high dirty_mb with rising PAGELATCH waits points at write contention on hot pages; high PAGEIOLATCH with low cache residency points at I/O or memory…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Interpret them together: high dirty_mb with rising PAGELATCH waits points at write contention on hot pages; high PAGEIOLATCH with low cache residency points at I/O or memory sizing. On very large pools note that sys.dm_os_buffer_descriptors walks every descriptor — collect it during quiet periods or against a single database with a WHERE database_id =... filter.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “The _____ owns the buffer pool and performs four jobs on behalf of every operation that touches a page:”",
      "options": [
        "Steal",
        "Force",
        "buffer manager"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The buffer manager owns the buffer pool and performs four jobs on behalf of every operation that touches a page:”"
    },
    {
      "question": "Complete the lesson statement: “Every cached page has exactly one _____ — a small structure recording database id, file id, page id, whether the page is dirty, and where its frame lives.”",
      "options": [
        "no-force",
        "buffer descriptor",
        "Force"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Every cached page has exactly one buffer descriptor — a small structure recording database id, file id, page id, whether the page is dirty, and where its frame lives. Descriptors are found through a hash table keyed on (database id, file id, page id), which is why page lookup is constant-time regardless of pool size.”"
    },
    {
      "question": "Complete the lesson statement: “When a page is being read or modified, the engine must guarantee structural consistency — that is a _____ 's job, not a lock's:”",
      "options": [
        "latch",
        "no-force",
        "Everything above it — the access methods, locking, latch managers — assumes the buffer manager can produce a page on demand."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “When a page is being read or modified, the engine must guarantee structural consistency — that is a latch 's job, not a lock's:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Steal and no-force: the buffer manager's contract”?",
      "options": [
        "No — no-force",
        "Allocate and free",
        "The buffer manager runs SQL Server under two deliberate policy choices:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The buffer manager runs SQL Server under two deliberate policy choices:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Monitoring buffer management”?",
      "options": [
        "Read",
        "Two queries cover most buffer-management health checks:",
        "Allocate and free"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Two queries cover most buffer-management health checks:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The buffer manager's four jobs”?",
      "options": [
        "Everything above it — the access methods, locking, latch managers — assumes the buffer manager can produce a page on demand.",
        "Read",
        "Find"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Everything above it — the access methods, locking, latch managers — assumes the buffer manager can produce a page on demand. The buffer pool is exposed as the BUFFERPOOL memory clerk in sys.dm_os_memory_clerks, and it is almost always the largest consumer of memory on the instance.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Hash table, descriptors, and replacement”?",
      "options": [
        "Find",
        "Flush",
        "When a page is requested and the hash lookup misses, the buffer manager needs a frame:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “When a page is requested and the hash lookup misses, the buffer manager needs a frame:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Latches: protection measured in milliseconds”?",
      "options": [
        "free list",
        "The wait type itself tells you where the time went:",
        "Flush"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The wait type itself tells you where the time went:”"
    },
    {
      "question": "Complete the lesson statement: “Because of _____, a commit's durability comes entirely from flushing the log — the data page may still be in memory hours later.”",
      "options": [
        "no-force",
        "Milliseconds, statement or operation scope",
        "No logging at all"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Because of no-force, a commit's durability comes entirely from flushing the log — the data page may still be in memory hours later. Because of steal, data files can contain changes of transactions that were later rolled back. Both directions are exactly why crash recovery needs both a redo pass (committed work not yet on disk) and an undo pass (uncommitted work already on disk) — and why the write-ahead logging rule is not optional.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Monitoring buffer management”?",
      "options": [
        "replace",
        "Lazy writes/sec",
        "Interpret them together: high dirty_mb with rising PAGELATCH waits points at write contention on hot pages; high PAGEIOLATCH with low cache residency points at I/O or memory…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Interpret them together: high dirty_mb with rising PAGELATCH waits points at write contention on hot pages; high PAGEIOLATCH with low cache residency points at I/O or memory sizing. On very large pools note that sys.dm_os_buffer_descriptors walks every descriptor — collect it during quiet periods or against a single database with a WHERE database_id =... filter.”"
    }
  ],
  takeaways: [
    "The buffer manager allocates frames, reads pages, resolves them via a hash table, and flushes dirty ones",
    "Buffer descriptors map (database, file, page) to a frame in constant time; free lists keep misses cheap",
    "Latches protect in-memory structure for milliseconds; locks protect visibility for transactions",
    "PAGEIOLATCH waits mean missing cache or slow storage; PAGELATCH waits mean hot in-memory contention",
    "SQL Server runs with steal and no-force — commits are safe because of WAL, not because data pages are flushed",
    "Watch Free list stalls/sec, dirty_mb per database, and latch wait mixes to catch buffer problems early"
  ]
};
