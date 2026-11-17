/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch04-11.html */

window.TOPIC = {
  id: "ch04-11",
  title: "Pages and Extents",

  lead: "SQL Server stores data in 8-KB pages and allocates it in 64-KB extents — the two units that govern every read, write, and allocation on the instance. Pages and extents are where “logical” tables become physical I/O, and where fragmentation quietly multiplies your query costs.",

  objectives: [
    "Describe the 8-KB page as the unit of I/O and the 64-KB extent as the unit of allocation",
    "Distinguish mixed and uniform extents and why the split exists",
    "Explain how PFS, GAM, SGAM, and IAM pages track allocation",
    "Measure fragmentation and allocation footprint with DMVs"
  ],

  sections: [
    {
      h: "The page: SQL Server's smallest unit of work",
      html: `
<p>A <strong>page</strong> is 8,192 bytes — 8 KB of which 96 bytes are header and the remainder holds rows, slot offsets, and free space. Every read, latch, and modification operates at page granularity: there is no 1 KB read and no 512-byte write in SQL Server's data path.</p>
<table>
  <tr><th>Property</th><th>Value</th><th>Consequence</th></tr>
  <tr><td>Page size</td><td>8 KB (8,192 bytes)</td><td>One row spanning a page boundary needs an overflow mechanism</td></tr>
  <tr><td>Header</td><td>96 bytes</td><td>Page ID, type, allocation info, LSN, slot count, free space</td></tr>
  <tr><td>Rows</td><td>Up to ~8,060 bytes each (in-row)</td><td>Wide rows push data to row-overflow or LOB structures</td></tr>
  <tr><td>Slot array</td><td>2 bytes per row, growing from the end of the page</td><td>Row location = page + slot, not byte offset</td></tr>
  <tr><td>Physical I/O</td><td>One page read = one 8 KB request</td><td>SQL Server can combine adjacent pages into larger folio reads</td></tr>
</table>
<p>The full header layout belongs to the next topic (ch04-12); the point here is the <em>granularity</em>: when a query reads one row, the storage engine reads a whole page, and when it reads a range, it reads pages — then extents.</p>
`
    },
    {
      h: "Extents: eight pages at a time",
      html: `
<p>An <strong>extent</strong> is eight contiguous pages — exactly 64 KB. Extents are the unit of <em>allocation</em>: SQL Server never allocates a single page from the file, it allocates extents and then hands out pages within them. Two allocation strategies reduce waste for small objects:</p>
<table>
  <tr><th>Extent type</th><th>Contents</th><th>Used when</th></tr>
  <tr><td><strong>Mixed extent</strong></td><td>Pages from up to 8 different objects</td><td>First eight pages of a new table or index (small objects)</td></tr>
  <tr><td><strong>Uniform extent</strong></td><td>All 8 pages belong to one object</td><td>Once an object passes eight pages</td></tr>
</table>
<p>Why the split matters: without mixed extents, a brand-new table with one page would still consume 64 KB, and an instance with thousands of small tables would waste most of its data file. With them, growth is gradual until the object proves it needs dedicated extents — and scans of that object become contiguous 64 KB reads rather than scattered page-at-a-time fetches.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Pages, extents, and allocation maps">
    <defs>
      <marker id="a11-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
      <marker id="a11-arrow-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"/>
      </marker>
    </defs>

    <text x="240" y="28" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">One extent = 8 pages × 8 KB = 64 KB</text>

    <rect x="30" y="42" width="430" height="96" rx="11" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <rect x="46" y="72" width="44" height="48" rx="5" fill="var(--surface)" stroke="var(--border)"/>
    <text x="68" y="94" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="600" font-family="Segoe UI, sans-serif">P1</text>
    <text x="68" y="111" text-anchor="middle" fill="var(--muted)" font-size="9.5" font-family="Segoe UI, sans-serif">8 KB</text>
    <rect x="97" y="72" width="44" height="48" rx="5" fill="var(--surface)" stroke="var(--border)"/>
    <text x="119" y="94" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="600" font-family="Segoe UI, sans-serif">P2</text>
    <text x="119" y="111" text-anchor="middle" fill="var(--muted)" font-size="9.5" font-family="Segoe UI, sans-serif">8 KB</text>
    <rect x="148" y="72" width="44" height="48" rx="5" fill="var(--surface)" stroke="var(--border)"/>
    <text x="170" y="94" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="600" font-family="Segoe UI, sans-serif">P3</text>
    <text x="170" y="111" text-anchor="middle" fill="var(--muted)" font-size="9.5" font-family="Segoe UI, sans-serif">8 KB</text>
    <rect x="199" y="72" width="44" height="48" rx="5" fill="var(--surface)" stroke="var(--border)"/>
    <text x="221" y="94" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="600" font-family="Segoe UI, sans-serif">P4</text>
    <text x="221" y="111" text-anchor="middle" fill="var(--muted)" font-size="9.5" font-family="Segoe UI, sans-serif">8 KB</text>
    <rect x="250" y="72" width="44" height="48" rx="5" fill="var(--surface)" stroke="var(--border)"/>
    <text x="272" y="94" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="600" font-family="Segoe UI, sans-serif">P5</text>
    <text x="272" y="111" text-anchor="middle" fill="var(--muted)" font-size="9.5" font-family="Segoe UI, sans-serif">8 KB</text>
    <rect x="301" y="72" width="44" height="48" rx="5" fill="var(--surface)" stroke="var(--border)"/>
    <text x="323" y="94" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="600" font-family="Segoe UI, sans-serif">P6</text>
    <text x="323" y="111" text-anchor="middle" fill="var(--muted)" font-size="9.5" font-family="Segoe UI, sans-serif">8 KB</text>
    <rect x="352" y="72" width="44" height="48" rx="5" fill="var(--surface)" stroke="var(--border)"/>
    <text x="374" y="94" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="600" font-family="Segoe UI, sans-serif">P7</text>
    <text x="374" y="111" text-anchor="middle" fill="var(--muted)" font-size="9.5" font-family="Segoe UI, sans-serif">8 KB</text>
    <rect x="403" y="72" width="44" height="48" rx="5" fill="var(--surface)" stroke="var(--border)"/>
    <text x="425" y="94" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="600" font-family="Segoe UI, sans-serif">P8</text>
    <text x="425" y="111" text-anchor="middle" fill="var(--muted)" font-size="9.5" font-family="Segoe UI, sans-serif">8 KB</text>
    <text x="245" y="130" text-anchor="middle" fill="var(--muted)" font-size="11" font-style="italic" font-family="Segoe UI, sans-serif">contiguous — one extent is one 64 KB I/O</text>

    <rect x="510" y="42" width="230" height="46" rx="8" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="625" y="61" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">PFS</text>
    <text x="625" y="79" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">free space page-by-page · ~64 MB</text>

    <rect x="510" y="96" width="230" height="46" rx="8" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="625" y="115" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">GAM</text>
    <text x="625" y="133" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">bit per extent: allocated? · ~4 GB</text>

    <rect x="510" y="150" width="230" height="46" rx="8" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="625" y="169" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">SGAM</text>
    <text x="625" y="187" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">mixed extents with free pages · ~4 GB</text>

    <rect x="510" y="204" width="230" height="46" rx="8" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="625" y="223" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">IAM</text>
    <text x="625" y="241" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">chains the extents of one object</text>

    <line x1="508" y1="65" x2="462" y2="80" stroke="var(--accent)" stroke-width="1.6" marker-end="url(#a11-arrow-acc)"/>
    <line x1="508" y1="119" x2="462" y2="112" stroke="var(--accent)" stroke-width="1.6" marker-end="url(#a11-arrow-acc)"/>
    <line x1="508" y1="173" x2="462" y2="130" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#a11-arrow)"/>
    <line x1="508" y1="227" x2="462" y2="140" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#a11-arrow)"/>

    <rect x="30" y="176" width="210" height="60" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="135" y="200" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Mixed extent</text>
    <text x="135" y="222" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">first 8 pages of an object</text>

    <rect x="252" y="176" width="208" height="60" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="356" y="200" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Uniform extent</text>
    <text x="356" y="222" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">all 8 pages, one object</text>

    <rect x="30" y="256" width="430" height="66" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="46" y="278" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Page types you will meet</text>
    <text x="46" y="300" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">1 = data · 2 = index · 3 = IAM · 4 = text mix (LOB) ·</text>
    <text x="46" y="317" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">5 = sorted view · 6 = deferred DDL · plus the allocation pages above</text>

    <rect x="510" y="264" width="230" height="58" rx="9" fill="var(--surface)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="625" y="287" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Allocation contention</text>
    <text x="625" y="308" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">hot GAM/SGAM pages → PAGELATCH_UP</text>
  </svg>
  <div class="figcaption">Figure 1 — Extent structure, the allocation pages that track them, and where contention appears.</div>
</div>
`
    },
    {
      h: "Allocation pages: how SQL Server finds free space",
      html: `
<p>Allocation metadata lives in special pages scattered through the data files, each with a defined coverage interval:</p>
<table>
  <tr><th>Page</th><th>Tracks</th><th>Granularity</th><th>Looked up when</th></tr>
  <tr><td><strong>PFS</strong></td><td>Free space and page type for each page; flags full/free pages</td><td>One PFS page covers ~64 MB of file</td><td>Any insert needs a page with room</td></tr>
  <tr><td><strong>GAM</strong></td><td>One bit per extent: allocated or not</td><td>One GAM page covers ~4 GB of file</td><td>SQL Server needs a new extent</td></tr>
  <tr><td><strong>SGAM</strong></td><td>One bit per extent: mixed extent with free pages</td><td>One SGAM page covers ~4 GB of file</td><td>A small object needs its first pages</td></tr>
  <tr><td><strong>IAM</strong></td><td>The chain of extents allocated to one table/index partition</td><td>One IAM page covers a growing range</td><td>A scan walks all pages of an object</td></tr>
</table>
<p>This is also why allocation can become a bottleneck: every concurrent insert hits the same PFS/GAM pages for its file region, taking brief latches. When many sessions contend on one allocation page you see <code>PAGELATCH_UP</code> waits <em>with no blocking session</em> — the classic tempdb allocation signature during ad-hoc query storms.</p>
`
    },
    {
      h: "How extents drive I/O",
      html: `
<p>Because extents are contiguous, SQL Server can read them as a single larger request (folio reads), which is far more efficient than eight separate 8 KB reads. Two design consequences:</p>
<ul>
  <li><strong>Scans of well-allocated objects are sequential</strong> — a full table scan walks IAM-chained extents in physical order, streaming from disk at device-queue depth</li>
  <li><strong>Fragmentation breaks the sequence</strong> — after heavy inserts, page splits, and deletes, the logical order of pages no longer matches physical order. Scans must hop between extents: more reads, more seeks, lower cache density</li>
</ul>
<p>Fragmentation has two flavours: <em>logical</em> (page chain order ≠ key order — affects scans and range seeks) and <em>physical</em> (file-level spread across the volume — affects raw device latency). Logical fragmentation above ~30% on a large, read-heavy index is where tuning attention usually begins.</p>
`
    },
    {
      h: "Measuring fragmentation and allocation",
      html: `
<p><code>sys.dm_db_index_physical_stats</code> walks the page chain (limited mode scans only the tree's skeleton, keeping cost low) and reports how scattered the pages are:</p>
<pre><code class="language-sql">-- Logical fragmentation for the heaviest indexes in this database
SELECT i.name AS index_name,
       ips.index_type_desc,
       ips.page_count,
       CAST(ips.avg_fragmentation_in_percent AS decimal(5, 2)) AS frag_pct,
       ips.fragment_count,
       ips.record_count
FROM   sys.dm_db_index_physical_stats(DB_ID(), OBJECT_ID(N'dbo.Orders'), NULL, NULL, 'LIMITED') AS ips
JOIN   sys.indexes AS i
       ON i.object_id = ips.object_id AND i.index_id = ips.index_id
WHERE  ips.page_count &gt; 1000
ORDER  BY ips.avg_fragmentation_in_percent DESC;</code></pre>
<pre><code class="language-sql">-- Allocation footprint: how many pages/extent space does each object hold?
SELECT TOP 15
       OBJECT_NAME(p.object_id)   AS object_name,
       i.name                     AS index_name,
       a.type_desc                AS allocation_type,
       a.total_pages * 8 / 1024   AS total_mb,
       a.used_pages * 8 / 1024    AS used_mb,
       a.data_pages * 8 / 1024    AS data_mb
FROM   sys.allocation_units AS a
JOIN   sys.partitions AS p
       ON p.partition_id = a.container_id
      AND a.type IN (1, 3)          -- in-row and row-overflow allocation
JOIN   sys.indexes AS i
       ON i.object_id = p.object_id AND i.index_id = p.index_id
ORDER  BY a.total_pages DESC;</code></pre>
<p>The gap between <code>total_mb</code> and <code>used_mb</code> reveals empty space from deletes and page splits — money paid for in file size and read amplification.</p>
`
    },
    {
      h: "Fragmentation response: rebuild, reorganise, or ignore",
      html: `
<p>Not every fragmented index deserves work. The decision matrix used in practice:</p>
<table>
  <tr><th>Condition</th><th>Action</th></tr>
  <tr><td>Frag under ~10–15%, or the index is rarely scanned</td><td>Ignore — the cost of rebuilding exceeds the benefit</td></tr>
  <tr><td>Frag 15–40% on a large index</td><td><code>ALTER INDEX … REORGANIZE</code> — online, no full rebuild, defragments page by page</td></tr>
  <tr><td>Frag above ~40%, or low page density after mass deletes</td><td><code>REBUILD</code> with an appropriate <code>FILLFACTOR</code>, in a maintenance window</td></tr>
  <tr><td>Constantly fragmenting insert pattern (identity range)</td><td>Fix the pattern: fill factor, partitioning, or a key that spreads inserts — not a nightly rebuild</td></tr>
</table>
<p>Rebuilding rebuilds <em>allocation</em> too: the new index occupies contiguous extents again, page density returns to the fill factor, and scans regain sequential I/O. Reorganise only defragments what is there. Either way, fragmentation alerts should be trended against <code>Page Splits/sec</code> so you see the cause, not just the symptom.</p>
`
    }
  ],

  scenario: {
    title: "The nightly report started reading five times the table's data",
    html: `
<p>A report that scans the 220-million-row <code>dbo.Invoices</code> table took 18 minutes in March and 74 minutes by May. The plan was identical — a clustered index scan — and row count had grown only 8%. The DBA ran <code>dm_db_index_physical_stats</code> in limited mode: <code>avg_fragmentation_in_percent</code> was 98.4%, <code>page_count</code> implied far more pages than the data needed, and <code>Page Splits/sec</code> had been climbing since a high-volume insert job was switched to run hourly against the clustered key.</p>
<p>Diagnosis: page splits were scattering the page chain — every scan now hopped between extents instead of streaming them, and partially filled pages meant each 8 KB page carried fewer rows, so the report physically read five times the pages for the same rows. Resolution: an <code>ALTER INDEX … REBUILD</code> with <code>FILLFACTOR = 90</code> during the Sunday window returned fragmentation to under 2% and cut the report back to 21 minutes. Prevention: a fragmentation baseline alert on key tables, the insert job rewritten to a non-clustered identity or a gap-filling key, and a rule that any change to the clustered key's insert pattern gets a fragmentation review first.</p>
`
  },

  interview: [
    {
      q: "What is the difference between a page and an extent?",
      a: "A page is the 8-KB unit of I/O and row storage — every read, latch, and modification works at page granularity. An extent is eight contiguous pages (64 KB) and is the unit of allocation: SQL Server allocates extents from files, then hands out pages inside them, using mixed extents for small objects and uniform extents once an object passes eight pages."
    },
    {
      q: "What do PFS, GAM, SGAM, and IAM pages each track?",
      a: "PFS records free space and page type for each page (roughly 64 MB per PFS page); GAM has one bit per extent marking allocation (~4 GB coverage); SGAM marks mixed extents that still contain free pages; IAM chains the extents belonging to a single table or index partition so a scan can find every page of the object."
    },
    {
      q: "Why does fragmentation make queries slower even though the plan is unchanged?",
      a: "The plan still says scan, but the scan now reads more pages: splits scatter the logical page chain so physical order no longer matches key order, and partially filled pages carry fewer rows each. So the same query issues more 8-KB reads, hops between extents instead of streaming, and pulls less useful data per page into the buffer pool."
    }
  ],

  takeaways: [
    "Pages are 8 KB (the I/O unit); extents are 8 pages / 64 KB (the allocation unit)",
    "Mixed extents let small objects share 64 KB; uniform extents give a large object contiguous, streamable space",
    "PFS, GAM, SGAM and IAM pages are the allocation map — and their hot pages can cause PAGELATCH contention",
    "Fragmentation means more pages for the same rows: higher read counts, broken sequential I/O, poorer cache density",
    "Measure with sys.dm_db_index_physical_stats (limited mode) and sys.allocation_units — trend, do not single-check",
    "Respond by threshold: ignore low fragmentation, reorganise moderate, rebuild severe — and fix the insert pattern that caused it"
  ]
};
