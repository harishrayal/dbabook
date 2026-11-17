/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch04-12.html */

window.TOPIC = {
  id: "ch04-12",
  title: "Data Page Structure",

  lead: "Every table, index, and allocation map in SQL Server lives in 8-KB pages, and the exact byte layout of those pages explains how rows are found, why updates behave the way they do, and what page-level corruption actually means.",

  objectives: [
    "Describe the three regions of an 8-KB page: header, row data, slot array",
    "Read the important fields of the 96-byte page header",
    "Explain how a row is packed, located, forwarded, and ghosted",
    "Identify common page types by their m_type value",
    "Inspect real pages safely with DBCC PAGE and DMVs"
  ],

  sections: [
    {
      h: "The anatomy of an 8-KB page",
      html: `
<p>SQL Server's storage engine reads and writes exactly one unit: the <strong>8-KB page</strong> (8,192 bytes). Data files are simply collections of pages, and almost every storage-level question — why did this update split, why did the file grow, what does this corruption error mean — comes back to what is inside a page.</p>
<p>Every data and index page has the same three regions:</p>
<ul>
  <li><strong>96-byte page header</strong> — identity, type, page linkage, and the LSN of the last change</li>
  <li><strong>Row data</strong> — rows stored back-to-back, growing forward from the header</li>
  <li><strong>Slot array</strong> — one 2-byte offset per row, growing backward from the end of the page</li>
</ul>
<p>Free space is whatever is left in the middle. Because rows move — page splits, updates that grow variable-length columns — a row's physical position is never assumed. SQL Server always goes through the slot array to find it.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Layout of an 8 KB data page">
    <defs>
      <marker id="p12-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <text x="380" y="28" text-anchor="middle" fill="var(--text)" font-size="16" font-weight="700" font-family="Segoe UI, sans-serif">One 8-KB data page (8,192 bytes)</text>

    <rect x="30" y="50" width="700" height="95" rx="8" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <rect x="30" y="50" width="95" height="95" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="77" y="90" text-anchor="middle" fill="var(--accent-strong)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">96-byte</text>
    <text x="77" y="110" text-anchor="middle" fill="var(--accent-strong)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">header</text>

    <rect x="133" y="64" width="72" height="66" rx="5" fill="var(--surface)" stroke="var(--border)"/>
    <text x="169" y="102" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Row 1</text>
    <rect x="209" y="64" width="88" height="66" rx="5" fill="var(--surface)" stroke="var(--border)"/>
    <text x="253" y="102" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Row 2</text>
    <rect x="301" y="64" width="72" height="66" rx="5" fill="var(--surface)" stroke="var(--border)"/>
    <text x="337" y="102" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Row 3</text>

    <rect x="377" y="64" width="234" height="66" rx="5" fill="var(--surface-2)" stroke="var(--border)" stroke-dasharray="5 4"/>
    <text x="494" y="102" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">free space</text>

    <rect x="615" y="64" width="36" height="66" fill="var(--amber)" opacity="0.85"/>
    <rect x="653" y="64" width="36" height="66" fill="var(--amber)" opacity="0.65"/>
    <rect x="691" y="64" width="36" height="66" fill="var(--amber)" opacity="0.45"/>
    <text x="670" y="166" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">slot array (2 bytes per row)</text>

    <line x1="140" y1="195" x2="356" y2="195" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#p12-arrow)"/>
    <text x="248" y="215" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">rows grow forward</text>

    <line x1="618" y1="238" x2="430" y2="238" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#p12-arrow)"/>
    <text x="524" y="258" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">slot array grows backward</text>

    <rect x="30" y="274" width="700" height="50" rx="8" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="295" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Header: m_pageId · m_type · m_slotCnt · m_freeData · m_lsn · m_xdesId · m_ghostRecCnt</text>
    <text x="380" y="314" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">A row is found by slot number, never by arithmetic — offsets are what the slot array stores</text>
  </svg>
  <div class="figcaption">Figure 1 — Layout of an 8-KB page: header, rows growing forward, slot array growing backward.</div>
</div>
<p>The header answers every question the storage engine asks about a page:</p>
<table>
  <tr><th>Field</th><th>Meaning</th></tr>
  <tr><td>m_pageId</td><td>Page address, printed as (file:page)</td></tr>
  <tr><td>m_type</td><td>Page type — 1 = data, 2 = index (full list below)</td></tr>
  <tr><td>m_indexId / m_level</td><td>Which index owns the page and its tree level (0 = leaf)</td></tr>
  <tr><td>m_prevPage / m_nextPage</td><td>Page-chain links used to walk an index or heap in order</td></tr>
  <tr><td>m_slotCnt</td><td>Number of rows (slots) on the page</td></tr>
  <tr><td>m_freeData</td><td>Offset just past the last row — where new rows are written</td></tr>
  <tr><td>m_freeCnt</td><td>Free bytes between rows and slot array (fragmentation)</td></tr>
  <tr><td>m_lsn</td><td>LSN of the log record that last modified this page</td></tr>
  <tr><td>m_xdesId</td><td>Transaction descriptor of the transaction that last touched it</td></tr>
  <tr><td>m_ghostRecCnt</td><td>Ghost (deleted) records awaiting cleanup</td></tr>
  <tr><td>m_tornBits</td><td>Torn-bit pattern used to detect a partially written page</td></tr>
</table>
`
    },
    {
      h: "How a row is packed",
      html: `
<p>A row is a tightly packed byte string — no padding, no alignment, no index over its internals. Its layout is fixed enough that the storage engine can parse it from the status bytes alone:</p>
<table>
  <tr><th>Region</th><th>Contents</th></tr>
  <tr><td>Status byte A</td><td>Flags: versioning info present, forwarded record, NULL bitmap, variable-length columns, ghost record</td></tr>
  <tr><td>Status byte B + tag byte</td><td>Index rows only — number of keys and key-column metadata</td></tr>
  <tr><td>Fixed-length columns</td><td>Stored inline at fixed offsets (int, datetime, char(10) …)</td></tr>
  <tr><td>NULL bitmap</td><td>2-byte column count plus one bit per column — why nullable columns are cheap</td></tr>
  <tr><td>Variable-length offset array</td><td>2 bytes per variable column, pointing into the variable-length data</td></tr>
  <tr><td>Variable-length data</td><td>varchar and nvarchar values packed in declaration order</td></tr>
  <tr><td>Row versioning info</td><td>Present when RCSI, snapshot, or temporal versioning applies</td></tr>
</table>
<p>Consequences worth remembering:</p>
<ul>
  <li>Maximum row size is <strong>8,060 bytes</strong>. A wider row forces <em>row-overflow</em> storage, where one or more variable-length columns move off-page behind a pointer</li>
  <li>LOB types (varchar(max), xml, FILESTREAM) always live off-page in text-mix and text-tree pages</li>
  <li>Widening a fixed-length column physically rewrites every row; adding a nullable variable column costs only a NULL-bitmap bit until you store data in it</li>
  <li>Because variable-length columns are located by offset array rather than position, growing one shifts only the data that follows it <em>within that row</em> — the row itself may still grow past its neighbours and move to another page</li>
</ul>
`
    },
    {
      h: "Locating rows: slots, RIDs, forwarding, and ghosts",
      html: `
<p>Every row is addressed by a <strong>Row ID (RID)</strong> — file:page:slot, internally 8 bytes (2-byte file id, 4-byte page id, 2-byte slot number). Reading a row takes two hops: the RID identifies the page and the slot; the slot array entry gives the byte offset inside the page; the row's status bytes tell SQL Server how to parse the rest.</p>
<p>Rows move, and the bookkeeping differs by structure:</p>
<ul>
  <li><strong>Clustered index</strong> — a row that no longer fits its slot is relocated by a <em>page split</em>; keys stay sorted, the old slot disappears, and half the page's rows are copied to a new page</li>
  <li><strong>Heap</strong> — when a variable-length row grows and no space exists, the row is copied to another page and the original slot becomes a <strong>forwarding record</strong> holding the new RID. Every subsequent read pays one extra hop for that row</li>
  <li><strong>Delete in a clustered index</strong> — the row becomes a <strong>ghost record</strong> (status bit set, m_ghostRecCnt incremented). A background ghost-cleaner reclaims the space later, which is why a delete does not instantly free space or reduce page counts</li>
</ul>
<p>Heavy forwarding is invisible in metadata but brutal on scans: a heap can report a healthy page count while every read is doing double work.</p>
`
    },
    {
      h: "Page types across the database",
      html: `
<p>Not every page holds user rows. The m_type field identifies what a page is:</p>
<table>
  <tr><th>m_type</th><th>Page</th><th>Role</th></tr>
  <tr><td>1</td><td>Data</td><td>Heap or clustered index leaf rows</td></tr>
  <tr><td>2</td><td>Index</td><td>Nonclustered or clustered interior index rows</td></tr>
  <tr><td>3 / 4</td><td>Text mix / text tree</td><td>Off-page LOB storage</td></tr>
  <tr><td>8</td><td>GAM</td><td>Global Allocation Map — which extents are allocated</td></tr>
  <tr><td>9</td><td>SGAM</td><td>Shared Allocation Map — mixed extents with free slots</td></tr>
  <tr><td>10</td><td>IAM</td><td>Index Allocation Map — extents belonging to an allocation unit</td></tr>
  <tr><td>11</td><td>PFS</td><td>Page Free Space — which pages are free or in use</td></tr>
  <tr><td>16 / 17</td><td>DCM / BCM</td><td>Differential and bulk-change maps used by backups</td></tr>
</table>
<p>These bitmap pages repeat at fixed intervals — a PFS page every 8,088 pages, GAM and SGAM pages every 511,232 pages (about 4 GB) — so SQL Server never has to scan linearly to find free space, even in a multi-terabyte file.</p>
`
    },
    {
      h: "Reading pages with DBCC PAGE",
      html: `
<p>DBCC PAGE prints a page's internals. Output goes to the client only with trace flag 3604 enabled (2520 also works on modern versions):</p>
<pre><code class="language-sql">-- Dump page 10624 of file 1 in database id 11 (print option 1)
DBCC TRACEON (3604);
DBCC PAGE (11, 1, 10624, 1);
DBCC TRACEOFF (3604);</code></pre>
<p>Find the right page numbers first, without guessing:</p>
<pre><code class="language-sql">-- Page inventory for one table, one row per page
SELECT page_type_desc, count(*) AS pages
FROM   sys.dm_db_database_page_allocations(
         db_id('SalesDB'), object_id('dbo.Orders'), NULL, NULL, 'DETAILED')
GROUP BY page_type_desc
ORDER BY pages DESC;</code></pre>
<p>Read the output as a diagnostic: m_freeCnt exposes internal fragmentation, m_slotCnt versus row sizes explains splits, m_ghostRecCnt shows delete-cleanup lag, and a forwarded row is easy to spot — its data section is nothing but a target RID. DBCC PAGE is a read-only window into the engine; use it on copies of production pages, never as a repair tool.</p>
`
    }
  ],

  scenario: {
    title: "Order scans got five times slower while the table barely grew",
    html: `
<p>At 07:40 a message-processing service starts timing out. dbo.IncomingMessages is a heap of about 12 million rows with a 2 KB varchar payload column, and it receives constant UPDATEs that append status text. Page counts grew 10% in a month, yet scan durations grew 5× — CPU idle, no blocking, no plan changes. The DBA dumps a sample page and finds rows whose data section is only a forwarding address, then runs DBCC SHOWCONTIG: <strong>4.7 million forwarded records</strong>.</p>
<p>Every scan was following forwarding hops for nearly half the table. Immediate fix: stop the append-style updates, then <code>ALTER TABLE dbo.IncomingMessages REBUILD</code> to rewrite the heap without forwarding, verified by re-running SHOWCONTIG. Prevention: move the growing payload to a LOB column (row-overflow instead of row movement), add a clustered index so growth causes bounded splits instead of forwarding, and alert on forwarding-record growth. The storage engine was not slow — the heap's physical decay was.</p>
`
  },

  interview: [
    {
      q: "Walk me through how SQL Server finds a row when you query by primary key.",
      a: "The nonclustered or clustered index navigation lands on a leaf page (or the clustered leaf, if the key is the clustered key). The index entry gives file:page:slot — a RID or a clustered key plus page locator. The buffer manager resolves the page in the buffer pool (or reads it), the slot array at the end of the page gives the byte offset, and the row's status bytes drive parsing of fixed columns, NULL bitmap, and the variable-length offset array."
    },
    {
      q: "What is the maximum row size, and what happens when a row will not fit?",
      a: "8,060 bytes on an 8-KB page after the 96-byte header and slot array. If a row exceeds it, SQL Server moves one or more variable-length columns off-page (row-overflow), leaving a pointer in the row; LOB types always live off-page. If even the minimum inline portion cannot fit, the insert fails with a 'maximum storage size' error."
    },
    {
      q: "Why doesn't space from deleted rows come back immediately?",
      a: "Deletes in a clustered index leave ghost records that a background cleaner reclaims later, and pages only return to the file when an extent becomes empty (and even then the file is not shrunk automatically). Heaps additionally keep forwarding records pointing at relocated rows. Space reclaim is asynchronous and lazy by design — it is not a sign of a leak on its own."
    }
  ],

  takeaways: [
    "An 8-KB page = 96-byte header + rows growing forward + slot array growing backward",
    "Rows are found through the slot array — physical offsets are never assumed",
    "Maximum row size is 8,060 bytes; overflow pushes variable-length or LOB data off-page",
    "Forwarding records (heaps) and ghost records (clustered indexes) explain 'phantom' slowness after heavy updates and deletes",
    "m_type tells you what a page is: 1 data, 2 index, 8 GAM, 9 SGAM, 10 IAM, 11 PFS",
    "DBCC PAGE with trace flag 3604 is a read-only microscope, not a repair tool"
  ]
};
