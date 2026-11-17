/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch02-10.html */

window.TOPIC = {
  id: "ch02-10",
  title: "Index Fundamentals",

  lead: "An index is a sorted structure that lets SQL Server find rows without reading the whole table — the single biggest lever on read performance, and a permanent tax on every write, which is why index decisions are trade-offs, not free wins.",

  objectives: [
    "Explain how a B-tree index finds rows in a handful of page reads",
    "Distinguish clustered from nonclustered indexes",
    "Choose key columns and INCLUDE columns for covering index designs",
    "Read seek, scan, and key lookup in an execution plan",
    "Balance read gains against write and maintenance costs"
  ],

  sections: [
    {
      h: "What an index is",
      html: `
<p>An <strong>index</strong> is an auxiliary structure built on a table's columns that stores those columns in sorted order, each entry pointing back to its row. Without an index, finding every order for one customer means reading the entire table — a <strong>table scan</strong>. With an index on <code>customer_id</code>, SQL Server reads a handful of index pages — a <strong>seek</strong>.</p>
<p>The structure is a <strong>B-tree</strong> (balanced tree): a root page fans out to intermediate pages, which fan out to leaf pages. All leaves sit at the same depth, so every lookup costs the same small number of page reads — whether the table holds a thousand rows or a billion.</p>
<ul>
  <li><strong>Reads collapse</strong> — a seek is typically 2–4 page reads instead of millions</li>
  <li><strong>Writes pay</strong> — every INSERT, UPDATE, and DELETE must also maintain every index on the table</li>
  <li><strong>Storage pays</strong> — each index duplicates its key columns (and any included columns) on disk</li>
</ul>
<blockquote>An index is a bet: you are trading write speed and disk space for read speed. Make the bet with usage data, not with habit.</blockquote>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="B-tree index structure">
    <defs>
      <marker id="idx-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="300" y="22" width="160" height="48" rx="9" fill="var(--accent)"/>
    <text x="380" y="43" text-anchor="middle" fill="#ffffff" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Root page</text>
    <text x="380" y="61" text-anchor="middle" fill="#dbeafe" font-size="11.5" font-family="Segoe UI, sans-serif">500 | 1200</text>

    <rect x="160" y="120" width="170" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="245" y="147" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">100 | 300 | 450</text>

    <rect x="430" y="120" width="170" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="515" y="147" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">600 | 900 | 1100</text>

    <rect x="40" y="224" width="170" height="54" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="125" y="247" text-anchor="middle" fill="var(--accent-strong)" font-size="12.5" font-weight="700" font-family="Segoe UI, sans-serif">Leaf pages</text>
    <text x="125" y="266" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">keys 1 – 499 · sorted</text>

    <rect x="250" y="224" width="170" height="54" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="335" y="247" text-anchor="middle" fill="var(--accent-strong)" font-size="12.5" font-weight="700" font-family="Segoe UI, sans-serif">Leaf pages</text>
    <text x="335" y="266" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">keys 501 – 1199</text>

    <rect x="460" y="224" width="170" height="54" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="545" y="247" text-anchor="middle" fill="var(--accent-strong)" font-size="12.5" font-weight="700" font-family="Segoe UI, sans-serif">Leaf pages</text>
    <text x="545" y="266" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">keys 1201 – 99999</text>

    <line x1="355" y1="70" x2="260" y2="118" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#idx-arrow)"/>
    <line x1="405" y1="70" x2="500" y2="118" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#idx-arrow)"/>
    <line x1="220" y1="164" x2="140" y2="222" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#idx-arrow)"/>
    <line x1="265" y1="164" x2="320" y2="222" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#idx-arrow)"/>
    <line x1="500" y1="164" x2="355" y2="222" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#idx-arrow)"/>
    <line x1="535" y1="164" x2="555" y2="222" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#idx-arrow)"/>

    <rect x="655" y="30" width="90" height="130" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="700" y="52" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="700" font-family="Segoe UI, sans-serif">Seek</text>
    <text x="700" y="74" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">root →</text>
    <text x="700" y="92" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">branch →</text>
    <text x="700" y="110" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">leaf</text>
    <text x="700" y="134" text-anchor="middle" fill="var(--accent-strong)" font-size="11.5" font-weight="700" font-family="Segoe UI, sans-serif">~3 reads</text>
    <text x="700" y="152" text-anchor="middle" fill="var(--muted)" font-size="10" font-family="Segoe UI, sans-serif">any table size</text>

    <text x="380" y="310" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Clustered leaf: the table rows themselves, sorted by key · Nonclustered leaf: key + pointer to the row</text>
    <text x="380" y="331" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Balanced: every path is the same depth — so every seek is predictable.</text>
  </svg>
  <div class="figcaption">Figure 1 — A seek walks root → branch → leaf in a fixed number of page reads.</div>
</div>
`
    },
    {
      h: "Clustered versus nonclustered",
      html: `
<p>The <strong>clustered index</strong> <em>is</em> the table: its leaf pages contain the actual rows, stored in the key's order, so there is exactly one per table (by default, the primary key). A <strong>nonclustered index</strong> is a separate structure — sorted key columns plus a pointer back to the row.</p>
<table>
  <tr><th>Aspect</th><th>Clustered index</th><th>Nonclustered index</th></tr>
  <tr><td>Leaf pages contain</td><td>The table's data rows</td><td>Key columns + row locator</td></tr>
  <tr><td>How many per table</td><td>Exactly one</td><td>Up to 999</td></tr>
  <tr><td>Reads it serves</td><td>Range seeks on the clustering key (“orders in January”)</td><td>Predicates on its key columns</td></tr>
  <tr><td>Extra write cost</td><td>None — it is the table</td><td>One more structure per insert/update/delete</td></tr>
  <tr><td>Good clustering key</td><td>Narrow, stable, ever-increasing (int/bigint identity)</td><td>—</td></tr>
</table>
<p>A nonclustered index on a clustered table stores the <em>clustering key</em> as its row pointer — another reason a wide clustering key (a 500-character string, or a random GUID) quietly inflates every secondary index in the table.</p>
`
    },
    {
      h: "Key columns, INCLUDE columns, and covering",
      html: `
<p>Two kinds of columns make up a nonclustered index:</p>
<ul>
  <li><strong>Key columns</strong> — sorted and used for seeking; they appear in the <code>ON</code> clause and are capped at 17 for nonclustered indexes (900 bytes total for older key types)</li>
  <li><strong>INCLUDE columns</strong> — stored only at the leaf, never sorted; they let a query's output columns live in the index so it never touches the table</li>
</ul>
<p>When every column a query touches is in the index, the index is <strong>covering</strong> and the plan has no reason to look at the table — eliminating the extra <strong>key lookup</strong> round-trip per row.</p>
<pre><code class="language-sql">-- Covering index for the hot order-history path
CREATE NONCLUSTERED INDEX IX_Orders_customer_date
ON sales.Orders (customer_id, order_date)      -- key columns: seek + range
INCLUDE (total_amount, status)                 -- leaf only: covers the SELECT
WHERE status &lt;&gt; 'VOID';                        -- filtered: skips void noise entirely
GO

-- Usage stats: is this index (and its siblings) actually earning its keep?
SELECT t.name AS table_name,
       i.name AS index_name,
       s.user_seeks, s.user_scans, s.user_lookups, s.user_updates
FROM   sys.dm_db_index_usage_stats AS s
JOIN   sys.indexes  AS i ON i.object_id = s.object_id AND i.index_id = s.index_id
JOIN   sys.tables   AS t ON t.object_id = s.object_id
WHERE  s.database_id = db_id()
ORDER  BY s.user_updates DESC;</code></pre>
<p>A filtered index only serves queries that carry a matching predicate — the <code>WHERE status &lt;&gt; 'VOID'</code> filter must also appear in the querying SQL, and it drops the void rows from the index entirely, making it smaller and cheaper.</p>
<p>Terms you will read in every plan: <strong>seek</strong> (targeted key lookup), <strong>scan</strong> (read the whole index or table — fine for covering small ones, costly for large ones), <strong>key lookup</strong> (index found the row, now fetch the rest from the table — the classic sign of a non-covering index).</p>
`
    },
    {
      h: "The cost side of the ledger",
      html: `
<p>Every index is a maintenance obligation on writes:</p>
<ul>
  <li><strong>Insert throughput</strong> — each index is another B-tree to update; a write-heavy table with 15 indexes spends real CPU and log volume maintaining them</li>
  <li><strong>Blocking risk</strong> — wide indexes take wider key-range locks under serialisable isolation, increasing deadlocks</li>
  <li><strong>Maintenance</strong> — fragmentation from random inserts means rebuilds or reorganises, and each rebuild is I/O and log pressure</li>
  <li><strong>Plan noise</strong> — too many similar indexes make the optimiser's choice harder and statistics more expensive to keep fresh</li>
</ul>
<p>Practical policy: start with the clustered key and one index per distinct read pattern; justify every additional index with <code>sys.dm_db_index_usage_stats</code> (note that these DMVs reset at restart unless collection is persisted); and never let an ORM create the indexes — let workload evidence do it.</p>
<p><strong>Common pitfalls:</strong> indexing every column “to be safe”; a non-covering index that fixes the scan but adds a lookup per row; forgetting the FK index (foreign keys create none); assuming an index will be used when a function wraps the column (<code>WHERE CONVERT(date, order_date) = …</code> hides the key); and writing maintenance jobs that rebuild every index nightly regardless of usage.</p>
`
    }
  ],

  scenario: {
    title: "Insert throughput halved after the index that saved the report",
    html: `
<p>An order-status report was timing out every morning. A developer added a nonclustered index on <code>Orders(status, created_utc)</code> covering nothing — the query also selected twelve other columns — so the plan changed from a scan to a seek plus <em>key lookup per row</em>, and the report's gain was marginal. The real damage appeared on the write path: order inserts dropped from ~1,200/sec to ~550/sec, because the table now carried a seventeenth index with a composite key on a hot table, plus two leftover single-column experiments from earlier tuning sessions.</p>
<p>The DBA audited with <code>sys.dm_db_index_usage_stats</code>: three of the seventeen nonclustered indexes showed zero seeks and scans but tens of thousands of updates — pure write tax. The fix was subtractive: dropped the two unused indexes, extended the new one with <code>INCLUDE</code> to cover the report's columns so lookups disappeared, and added a monthly usage review to the maintenance cycle. Insert throughput recovered within the hour. Prevention: index changes now require a before/after plan <em>and</em> a write-cost estimate. <strong>An index nobody seeks is a tax on every write and a placebo for the report.</strong></p>
`
  },

  interview: [
    {
      q: "Clustered vs nonclustered index — what is the core difference?",
      a: "The clustered index's leaf pages are the table's rows themselves, sorted by its key, so it exists once per table and is the physical order of data. A nonclustered index is a separate B-tree of key columns plus a pointer back to the row; you can have many, and each one must be maintained on every write."
    },
    {
      q: "What is a covering index, and what is a key lookup?",
      a: "A covering index contains every column the query needs — keys for seeking plus INCLUDE columns for output — so the plan reads only the index. A key lookup means the index found the row but lacked a needed column, forcing a fetch from the clustered index or heap for each matched row; it usually indicates missing INCLUDE columns."
    },
    {
      q: "How do you decide whether an index should exist?",
      a: "Evidence on both sides: reads served (user_seeks/scans/lookups from dm_db_index_usage_stats, plus the actual query plans it accelerates) against costs (user_updates, storage, rebuild maintenance, and observed write throughput). An index with updates but no reads should be dropped unless it enforces uniqueness or supports a known critical query that runs outside the DMV window."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “An _____ is an auxiliary structure built on a table's columns that stores those columns in sorted order, each entry pointing back to its row.”",
      "options": [
        "INCLUDE columns",
        "covering",
        "index"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “An index is an auxiliary structure built on a table's columns that stores those columns in sorted order, each entry pointing back to its row. Without an index, finding every order for one customer means reading the entire table — a table scan. With an index on customer_id, SQL Server reads a handful of index pages — a seek.”"
    },
    {
      "question": "Complete the lesson statement: “The _____ is the table: its leaf pages contain the actual rows, stored in the key's order, so there is exactly one per table (by default, the primary key).”",
      "options": [
        "key lookup",
        "clustered index",
        "covering"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The clustered index is the table: its leaf pages contain the actual rows, stored in the key's order, so there is exactly one per table (by default, the primary key). A nonclustered index is a separate structure — sorted key columns plus a pointer back to the row.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Key columns, INCLUDE columns, and covering”?",
      "options": [
        "Two kinds of columns make up a nonclustered index:",
        "covering",
        "A filtered index only serves queries that carry a matching predicate — the WHERE status <&gt; 'VOID' filter must also appear in the querying SQL, and it drops the void rows from…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Two kinds of columns make up a nonclustered index:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The cost side of the ledger”?",
      "options": [
        "dm_db_index_usage_stats (note that these DMVs reset at restart unless collection is persisted); and never let an ORM create the indexes — let workload evidence do it.",
        "Common pitfalls:",
        "Every index is a maintenance obligation on writes:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Every index is a maintenance obligation on writes:”"
    },
    {
      "question": "Complete the lesson statement: “The structure is a _____ (balanced tree): a root page fans out to intermediate pages, which fan out to leaf pages.”",
      "options": [
        "Blocking risk",
        "B-tree",
        "Insert throughput"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The structure is a B-tree (balanced tree): a root page fans out to intermediate pages, which fan out to leaf pages. All leaves sit at the same depth, so every lookup costs the same small number of page reads — whether the table holds a thousand rows or a billion.”"
    },
    {
      "question": "Complete the lesson statement: “A nonclustered index on a clustered table stores the _____ as its row pointer — another reason a wide clustering key (a 500-character string, or a random GUID) quietly inflates every secondary index in the table.”",
      "options": [
        "clustering key",
        "Blocking risk",
        "Maintenance"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A nonclustered index on a clustered table stores the clustering key as its row pointer — another reason a wide clustering key (a 500-character string, or a random GUID) quietly inflates every secondary index in the table.”"
    },
    {
      "question": "Complete the lesson statement: “When every column a query touches is in the index, the index is _____ and the plan has no reason to look at the table — eliminating the extra key lookup round-trip per row.”",
      "options": [
        "Maintenance",
        "Plan noise",
        "covering"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “When every column a query touches is in the index, the index is covering and the plan has no reason to look at the table — eliminating the extra key lookup round-trip per row.”"
    },
    {
      "question": "Which fact is covered in the lesson section “The cost side of the ledger”?",
      "options": [
        "Storage pays",
        "dm_db_index_usage_stats (note that these DMVs reset at restart unless collection is persisted); and never let an ORM create the indexes — let workload evidence do it.",
        "Writes pay"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Practical policy: start with the clustered key and one index per distinct read pattern; justify every additional index with sys.dm_db_index_usage_stats (note that these DMVs reset at restart unless collection is persisted); and never let an ORM create the indexes — let workload evidence do it.”"
    },
    {
      "question": "In the “Clustered versus nonclustered” table, what is listed for “Leaf pages contain” under “Nonclustered index”?",
      "options": [
        "Key columns + row locator",
        "Storage pays",
        "nonclustered index"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Leaf pages contain” as “Key columns + row locator”."
    },
    {
      "question": "Which fact is covered in the lesson section “Key columns, INCLUDE columns, and covering”?",
      "options": [
        "nonclustered index",
        "Key columns",
        "A filtered index only serves queries that carry a matching predicate — the WHERE status <&gt; 'VOID' filter must also appear in the querying SQL, and it drops the void rows from…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A filtered index only serves queries that carry a matching predicate — the WHERE status <&gt; 'VOID' filter must also appear in the querying SQL, and it drops the void rows from the index entirely, making it smaller and cheaper.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “An _____ is an auxiliary structure built on a table's columns that stores those columns in sorted order, each entry pointing back to its row.”",
      "options": [
        "INCLUDE columns",
        "covering",
        "index"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “An index is an auxiliary structure built on a table's columns that stores those columns in sorted order, each entry pointing back to its row. Without an index, finding every order for one customer means reading the entire table — a table scan. With an index on customer_id, SQL Server reads a handful of index pages — a seek.”"
    },
    {
      "question": "Complete the lesson statement: “The _____ is the table: its leaf pages contain the actual rows, stored in the key's order, so there is exactly one per table (by default, the primary key).”",
      "options": [
        "key lookup",
        "clustered index",
        "covering"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The clustered index is the table: its leaf pages contain the actual rows, stored in the key's order, so there is exactly one per table (by default, the primary key). A nonclustered index is a separate structure — sorted key columns plus a pointer back to the row.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Key columns, INCLUDE columns, and covering”?",
      "options": [
        "Two kinds of columns make up a nonclustered index:",
        "covering",
        "A filtered index only serves queries that carry a matching predicate — the WHERE status 'VOID' filter must also appear in the querying SQL, and it drops the void rows from the…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Two kinds of columns make up a nonclustered index:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The cost side of the ledger”?",
      "options": [
        "dm_db_index_usage_stats (note that these DMVs reset at restart unless collection is persisted); and never let an ORM create the indexes — let workload evidence do it.",
        "Common pitfalls:",
        "Every index is a maintenance obligation on writes:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Every index is a maintenance obligation on writes:”"
    },
    {
      "question": "Complete the lesson statement: “The structure is a _____ (balanced tree): a root page fans out to intermediate pages, which fan out to leaf pages.”",
      "options": [
        "Blocking risk",
        "B-tree",
        "Insert throughput"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The structure is a B-tree (balanced tree): a root page fans out to intermediate pages, which fan out to leaf pages. All leaves sit at the same depth, so every lookup costs the same small number of page reads — whether the table holds a thousand rows or a billion.”"
    },
    {
      "question": "Complete the lesson statement: “A nonclustered index on a clustered table stores the _____ as its row pointer — another reason a wide clustering key (a 500-character string, or a random GUID) quietly inflates every secondary index in the table.”",
      "options": [
        "clustering key",
        "Blocking risk",
        "Maintenance"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A nonclustered index on a clustered table stores the clustering key as its row pointer — another reason a wide clustering key (a 500-character string, or a random GUID) quietly inflates every secondary index in the table.”"
    },
    {
      "question": "Complete the lesson statement: “When every column a query touches is in the index, the index is _____ and the plan has no reason to look at the table — eliminating the extra key lookup round-trip per row.”",
      "options": [
        "Maintenance",
        "Plan noise",
        "covering"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “When every column a query touches is in the index, the index is covering and the plan has no reason to look at the table — eliminating the extra key lookup round-trip per row.”"
    },
    {
      "question": "Which fact is covered in the lesson section “The cost side of the ledger”?",
      "options": [
        "Storage pays",
        "dm_db_index_usage_stats (note that these DMVs reset at restart unless collection is persisted); and never let an ORM create the indexes — let workload evidence do it.",
        "Writes pay"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Practical policy: start with the clustered key and one index per distinct read pattern; justify every additional index with sys.dm_db_index_usage_stats (note that these DMVs reset at restart unless collection is persisted); and never let an ORM create the indexes — let workload evidence do it.”"
    },
    {
      "question": "In the “Clustered versus nonclustered” table, what is listed for “Leaf pages contain” under “Nonclustered index”?",
      "options": [
        "Key columns + row locator",
        "Storage pays",
        "nonclustered index"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Leaf pages contain” as “Key columns + row locator”."
    },
    {
      "question": "Which fact is covered in the lesson section “Key columns, INCLUDE columns, and covering”?",
      "options": [
        "nonclustered index",
        "Key columns",
        "A filtered index only serves queries that carry a matching predicate — the WHERE status 'VOID' filter must also appear in the querying SQL, and it drops the void rows from the…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A filtered index only serves queries that carry a matching predicate — the WHERE status <> 'VOID' filter must also appear in the querying SQL, and it drops the void rows from the index entirely, making it smaller and cheaper.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “An _____ is an auxiliary structure built on a table's columns that stores those columns in sorted order, each entry pointing back to its row.”",
      "options": [
        "INCLUDE columns",
        "covering",
        "index"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “An index is an auxiliary structure built on a table's columns that stores those columns in sorted order, each entry pointing back to its row. Without an index, finding every order for one customer means reading the entire table — a table scan. With an index on customer_id, SQL Server reads a handful of index pages — a seek.”"
    },
    {
      "question": "Complete the lesson statement: “The _____ is the table: its leaf pages contain the actual rows, stored in the key's order, so there is exactly one per table (by default, the primary key).”",
      "options": [
        "key lookup",
        "clustered index",
        "covering"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The clustered index is the table: its leaf pages contain the actual rows, stored in the key's order, so there is exactly one per table (by default, the primary key). A nonclustered index is a separate structure — sorted key columns plus a pointer back to the row.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Key columns, INCLUDE columns, and covering”?",
      "options": [
        "Two kinds of columns make up a nonclustered index:",
        "covering",
        "A filtered index only serves queries that carry a matching predicate — the WHERE status 'VOID' filter must also appear in the querying SQL, and it drops the void rows from the…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Two kinds of columns make up a nonclustered index:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The cost side of the ledger”?",
      "options": [
        "dm_db_index_usage_stats (note that these DMVs reset at restart unless collection is persisted); and never let an ORM create the indexes — let workload evidence do it.",
        "Common pitfalls:",
        "Every index is a maintenance obligation on writes:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Every index is a maintenance obligation on writes:”"
    },
    {
      "question": "Complete the lesson statement: “The structure is a _____ (balanced tree): a root page fans out to intermediate pages, which fan out to leaf pages.”",
      "options": [
        "Blocking risk",
        "B-tree",
        "Insert throughput"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The structure is a B-tree (balanced tree): a root page fans out to intermediate pages, which fan out to leaf pages. All leaves sit at the same depth, so every lookup costs the same small number of page reads — whether the table holds a thousand rows or a billion.”"
    },
    {
      "question": "Complete the lesson statement: “A nonclustered index on a clustered table stores the _____ as its row pointer — another reason a wide clustering key (a 500-character string, or a random GUID) quietly inflates every secondary index in the table.”",
      "options": [
        "clustering key",
        "Blocking risk",
        "Maintenance"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A nonclustered index on a clustered table stores the clustering key as its row pointer — another reason a wide clustering key (a 500-character string, or a random GUID) quietly inflates every secondary index in the table.”"
    },
    {
      "question": "Complete the lesson statement: “When every column a query touches is in the index, the index is _____ and the plan has no reason to look at the table — eliminating the extra key lookup round-trip per row.”",
      "options": [
        "Maintenance",
        "Plan noise",
        "covering"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “When every column a query touches is in the index, the index is covering and the plan has no reason to look at the table — eliminating the extra key lookup round-trip per row.”"
    },
    {
      "question": "Which fact is covered in the lesson section “The cost side of the ledger”?",
      "options": [
        "Storage pays",
        "dm_db_index_usage_stats (note that these DMVs reset at restart unless collection is persisted); and never let an ORM create the indexes — let workload evidence do it.",
        "Writes pay"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Practical policy: start with the clustered key and one index per distinct read pattern; justify every additional index with sys.dm_db_index_usage_stats (note that these DMVs reset at restart unless collection is persisted); and never let an ORM create the indexes — let workload evidence do it.”"
    },
    {
      "question": "In the “Clustered versus nonclustered” table, what is listed for “Leaf pages contain” under “Nonclustered index”?",
      "options": [
        "Key columns + row locator",
        "Storage pays",
        "nonclustered index"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Leaf pages contain” as “Key columns + row locator”."
    },
    {
      "question": "Which fact is covered in the lesson section “Key columns, INCLUDE columns, and covering”?",
      "options": [
        "nonclustered index",
        "Key columns",
        "A filtered index only serves queries that carry a matching predicate — the WHERE status 'VOID' filter must also appear in the querying SQL, and it drops the void rows from the…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A filtered index only serves queries that carry a matching predicate — the WHERE status <> 'VOID' filter must also appear in the querying SQL, and it drops the void rows from the index entirely, making it smaller and cheaper.”"
    }
  ],
  takeaways: [
    "A B-tree index converts a full table scan into a fixed-depth seek of a few page reads",
    "The clustered index is the table; nonclustered indexes are extra structures paid for on every write",
    "Key columns seek; INCLUDE columns cover — covering eliminates key lookups",
    "Cluster narrow, stable, ever-increasing keys so every secondary index stays small",
    "Every index must justify itself with usage data — reads served versus writes taxed"
  ]
};
