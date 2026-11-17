/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch02-04.html */

window.TOPIC = {
  id: "ch02-04",
  title: "Tables, Rows, and Columns",

  lead: "Tables, rows, and columns are the atoms of every relational database — and designing them well is the cheapest performance and integrity decision you will ever make, because everything else in SQL Server is built on top of them.",

  objectives: [
    "Describe a table as the unit of structure and storage in a relational database",
    "Distinguish entities, attributes, and records in table terms",
    "Design columns deliberately: data types, nullability, and defaults",
    "Understand how rows are stored physically — heaps and clustered tables",
    "Avoid the table-design mistakes that surface as production incidents"
  ],

  sections: [
    {
      h: "What a table is",
      html: `
<p>A <strong>table</strong> is a named, structured set of rows and columns that represents one kind of thing — customers, orders, invoices, disk volumes. Each table follows the rules of the relational model:</p>
<ul>
  <li>Every <strong>column</strong> has a name and a data type; it represents one <em>attribute</em> of the thing (its colour, its price, its date)</li>
  <li>Every <strong>row</strong> represents one <em>instance</em> of the thing, with exactly one value per column (NULL where permitted and absent)</li>
  <li>The set of columns is <strong>fixed by design</strong>; the number of rows grows with the data</li>
</ul>
<p>Tables live inside a <strong>schema</strong> — a namespace inside a database (for example <code>sales.Orders</code>). Schemas keep ownership and permissions tidy: the finance role gets <code>finance</code>, the app gets <code>app</code>, and neither can accidentally touch the other's objects.</p>
<blockquote>A table is a promise: “every row here means the same kind of thing, and every column means the same kind of value.” Constraints are how you keep that promise.</blockquote>
`
    },
    {
      h: "Anatomy of a table",
      html: `
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Anatomy of a table">
    <defs>
      <marker id="tbl-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="60" y="40" width="440" height="196" rx="6" fill="var(--surface)" stroke="var(--border)" stroke-width="1.6"/>
    <rect x="60" y="40" width="440" height="32" rx="6" fill="var(--accent)"/>
    <rect x="60" y="60" width="440" height="12" fill="var(--accent)"/>
    <text x="280" y="61" text-anchor="middle" fill="#ffffff" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">sales.Orders — one table, one entity type</text>

    <line x1="60" y1="104" x2="500" y2="104" stroke="var(--border)" stroke-width="1.4"/>
    <line x1="60" y1="134" x2="500" y2="134" stroke="var(--border)"/>
    <line x1="60" y1="164" x2="500" y2="164" stroke="var(--border)"/>
    <line x1="60" y1="194" x2="500" y2="194" stroke="var(--border)"/>
    <line x1="160" y1="72" x2="160" y2="236" stroke="var(--border)"/>
    <line x1="270" y1="72" x2="270" y2="236" stroke="var(--border)"/>
    <line x1="380" y1="72" x2="380" y2="236" stroke="var(--border)"/>

    <text x="110" y="87" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="700" font-family="Segoe UI, sans-serif">order_id</text>
    <text x="110" y="99" text-anchor="middle" fill="var(--amber)" font-size="10" font-family="Segoe UI, sans-serif">int · PK</text>
    <text x="215" y="87" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="700" font-family="Segoe UI, sans-serif">customer_id</text>
    <text x="215" y="99" text-anchor="middle" fill="var(--muted)" font-size="10" font-family="Segoe UI, sans-serif">int · FK</text>
    <text x="325" y="87" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="700" font-family="Segoe UI, sans-serif">order_date</text>
    <text x="325" y="99" text-anchor="middle" fill="var(--muted)" font-size="10" font-family="Segoe UI, sans-serif">date</text>
    <text x="440" y="87" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="700" font-family="Segoe UI, sans-serif">amount</text>
    <text x="440" y="99" text-anchor="middle" fill="var(--muted)" font-size="10" font-family="Segoe UI, sans-serif">decimal(12,2)</text>

    <text x="110" y="124" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">10001</text>
    <text x="215" y="124" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">552</text>
    <text x="325" y="124" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">2026-01-15</text>
    <text x="440" y="124" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">1240.00</text>

    <text x="110" y="154" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">10002</text>
    <text x="215" y="154" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">618</text>
    <text x="325" y="154" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">2026-01-15</text>
    <text x="440" y="154" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">98.50</text>

    <text x="110" y="184" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">10003</text>
    <text x="215" y="184" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">552</text>
    <text x="325" y="184" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">2026-01-16</text>
    <text x="440" y="184" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">305.75</text>

    <text x="280" y="220" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-style="italic" font-family="Segoe UI, sans-serif">… 1,997 more rows</text>

    <rect x="540" y="74" width="190" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="635" y="94" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Column</text>
    <text x="635" y="111" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">one attribute, one data type</text>

    <rect x="540" y="130" width="190" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="635" y="150" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Row</text>
    <text x="635" y="167" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">one entity instance</text>

    <rect x="540" y="186" width="190" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="635" y="206" text-anchor="middle" fill="var(--accent-strong)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Primary key</text>
    <text x="635" y="223" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">every row is distinct</text>

    <line x1="540" y1="96" x2="470" y2="96" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#tbl-arrow)"/>
    <line x1="540" y1="152" x2="505" y2="124" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#tbl-arrow)"/>
    <line x1="540" y1="208" x2="175" y2="105" stroke="var(--muted)" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#tbl-arrow)"/>

    <rect x="60" y="262" width="670" height="34" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="395" y="284" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">database  ›  schema  ›  table  ›  column / row  ›  value</text>

    <text x="395" y="324" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Structure is fixed at design time; rows carry the values — the primary key proves they are distinct.</text>
  </svg>
  <div class="figcaption">Figure 1 — A table pairs a fixed column definition with a growing set of rows.</div>
</div>
`
    },
    {
      h: "Designing the columns",
      html: `
<p>Column choices are made once and lived with for years. The three decisions that matter most:</p>
<ul>
  <li><strong>Data type</strong> — the narrowest type that can never overflow or lose precision (<code>date</code> not <code>datetime2</code> for a calendar date; <code>int</code> not <code>bigint</code> unless growth truly demands it)</li>
  <li><strong>Nullability</strong> — <code>NOT NULL</code> unless the value is genuinely optional; NULL means “unknown”, and it quietly complicates comparisons, indexes, and logic</li>
  <li><strong>Default</strong> — a default turns “forgot to supply a value” into a correct value instead of an error or a NULL</li>
</ul>
<p>A worked example that encodes all three, plus a key so rows are identifiable:</p>
<pre><code class="language-sql">CREATE TABLE sales.OrderLines
(
    line_id     bigint         IDENTITY(1,1) NOT NULL,
    order_id    int            NOT NULL,
    sku         varchar(20)    NOT NULL,
    quantity    int            NOT NULL
                CONSTRAINT DF_OrderLines_qty DEFAULT (1),
    unit_price  decimal(12,2)  NOT NULL,
    notes       nvarchar(200)  NULL,
    created_utc datetime2(3)   NOT NULL
                CONSTRAINT DF_OrderLines_created DEFAULT (sysutcdatetime()),
    CONSTRAINT PK_OrderLines PRIMARY KEY CLUSTERED (line_id),
    CONSTRAINT CK_OrderLines_qty CHECK (quantity > 0),
    CONSTRAINT CK_OrderLines_price CHECK (unit_price >= 0)
);

INSERT INTO sales.OrderLines (order_id, sku, unit_price)
VALUES (10001, 'WIDGET-42', 19.95),
       (10001, 'GADGET-7', 4.50);

SELECT line_id, sku, quantity, unit_price,
       quantity * unit_price AS line_total
FROM   sales.OrderLines
WHERE  order_id = 10001
ORDER  BY line_id;</code></pre>
<p>Notice what the design does for you: negative quantities and prices are rejected by CHECK constraints, a missing quantity becomes 1 rather than NULL, and every line can be uniquely addressed by <code>line_id</code>.</p>
`
    },
    {
      h: "How rows are stored: heaps and clustered tables",
      html: `
<p>Physically, rows live in 8-KB pages. A table is stored one of two ways, and the difference affects almost every read in the system:</p>
<table>
  <tr><th>Aspect</th><th>Heap (no clustered key)</th><th>Clustered table</th></tr>
  <tr><td>Row order</td><td>Arbitrary — wherever space was free</td><td>Sorted by the clustering key</td></tr>
  <tr><td>Primary read path</td><td>Full table scans only</td><td>Range seeks: “all orders in January” reads contiguous pages</td></tr>
  <tr><td>Row locator</td><td>RID (file:page:slot)</td><td>Clustering key value — reused by every nonclustered index</td></tr>
  <tr><td>Typical use</td><td>Staging tables, quick bulk loads</td><td>Virtually every user table</td></tr>
</table>
<p>A nonclustered index is like an index in a book: it stores the key columns plus a pointer back to the row. In a clustered table that pointer is the clustering key, which is why a narrow, stable clustering key (often an <code>int</code> or <code>bigint</code> identity) keeps every secondary index small — a production concern the day the table reaches tens of millions of rows.</p>
<p><strong>Common pitfalls:</strong> designing tables with no primary key at all (nothing prevents exact duplicates); choosing a GUID clustering key that fragments as it grows; storing large documents in <code>nvarchar(max)</code> columns that bloat rows and force off-row reads; and using a “misc” table of 60 mostly-NULL columns because “we might need it someday”.</p>
`
    }
  ],

  scenario: {
    title: "Two thousand customers were emailed three times in one morning",
    html: `
<p>A marketing send doubled overnight: the same customers received the same campaign email two and three times. The import job read from a Customers table that had no primary key, and a retried import had inserted the same customers again — identical rows, differing only by internal RIDs. Duplicate-hunting queries that grouped on email had been “cleaning” the data for months, but nothing in the schema prevented duplicates from arriving.</p>
<p>The DBA's response: ranked rows by email and creation date, kept one survivor per customer, deleted the rest inside a single transaction, then made the table honest — added a <code>NOT NULL</code> email column, a <code>UNIQUE</code> index on email, and a primary key on customer_id. The import job's retry logic was rewritten to key its idempotency on that constraint: a duplicate now fails loudly instead of silently duplicating. Prevention: <strong>constraints belong in the schema, not in the cleanup query</strong> — a table without a key is a suggestion box, not a database.</p>
`
  },

  interview: [
    {
      q: "What is the difference between a row and a column?",
      a: "A column is a defined attribute with a name and data type — it exists in the table definition. A row is one instance of the entity carrying a value for each column; rows grow over time while the column set changes only through schema changes."
    },
    {
      q: "Heap or clustered table — when does it matter?",
      a: "It matters as soon as you read by predicate or range: a clustered table is physically sorted by its clustering key so range queries read contiguous pages, while a heap only supports full scans. Heaps are fine for short-lived staging tables; user tables should be clustered."
    },
    {
      q: "How do you decide whether a column should allow NULL?",
      a: "Ask whether the absence of a value is meaningful and unavoidable. If the attribute is required for the row to make business sense — keys, dates, amounts — make it NOT NULL with a default if appropriate. Every nullable column pushes NULL handling into queries, indexes, and application logic, so make NULLs the exception you can justify."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is a named, structured set of rows and columns that represents one kind of thing — customers, orders, invoices, disk volumes.”",
      "options": [
        "fixed by design",
        "schema",
        "table"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A table is a named, structured set of rows and columns that represents one kind of thing — customers, orders, invoices, disk volumes. Each table follows the rules of the relational model:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Designing the columns”?",
      "options": [
        "Range seeks: “all orders in January” reads contiguous pages",
        "Column choices are made once and lived with for years.",
        "Sorted by the clustering key"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Column choices are made once and lived with for years. The three decisions that matter most:”"
    },
    {
      "question": "Which fact is covered in the lesson section “How rows are stored: heaps and clustered tables”?",
      "options": [
        "Physically, rows live in 8-KB pages.",
        "Common pitfalls:",
        "Sorted by the clustering key"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Physically, rows live in 8-KB pages. A table is stored one of two ways, and the difference affects almost every read in the system:”"
    },
    {
      "question": "Complete the lesson statement: “_____s keep ownership and permissions tidy: the finance role gets finance, the app gets app, and neither can accidentally touch the other's objects.”",
      "options": [
        "Nullability",
        "Default",
        "schema"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Tables live inside a schema — a namespace inside a database (for example sales.Orders ). Schemas keep ownership and permissions tidy: the finance role gets finance, the app gets app, and neither can accidentally touch the other's objects.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Designing the columns”?",
      "options": [
        "Column choices are made once and lived with for years.",
        "A worked example that encodes all three, plus a key so rows are identifiable:",
        "Virtually every user table"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A worked example that encodes all three, plus a key so rows are identifiable:”"
    },
    {
      "question": "Which fact is covered in the lesson section “How rows are stored: heaps and clustered tables”?",
      "options": [
        "A nonclustered index is like an index in a book: it stores the key columns plus a pointer back to the row.",
        "Clustering key value — reused by every nonclustered index",
        "Virtually every user table"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A nonclustered index is like an index in a book: it stores the key columns plus a pointer back to the row. In a clustered table that pointer is the clustering key, which is why a narrow, stable clustering key (often an int or bigint identity) keeps every secondary index small — a production concern the day the table reaches tens of millions of rows.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Designing the columns”?",
      "options": [
        "A worked example that encodes all three, plus a key so rows are identifiable:",
        "column",
        "Notice what the design does for you: negative quantities and prices are rejected by CHECK constraints, a missing quantity becomes 1 rather than NULL, and every line can be…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Notice what the design does for you: negative quantities and prices are rejected by CHECK constraints, a missing quantity becomes 1 rather than NULL, and every line can be uniquely addressed by line_id.”"
    },
    {
      "question": "Complete the lesson statement: “_____ designing tables with no primary key at all (nothing prevents exact duplicates); choosing a GUID clustering key that fragments as it grows;…”",
      "options": [
        "Notice what the design does for you: negative quantities and prices are rejected by CHECK constraints, a missing quantity becomes 1 rather than NULL, and every line can be…",
        "Common pitfalls:",
        "A worked example that encodes all three, plus a key so rows are identifiable:"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Common pitfalls: designing tables with no primary key at all (nothing prevents exact duplicates); choosing a GUID clustering key that fragments as it grows; storing large documents in nvarchar(max) columns that bloat rows and force off-row reads; and using a “misc” table of 60 mostly-NULL columns because “we might need it someday”.”"
    },
    {
      "question": "In the “How rows are stored: heaps and clustered tables” table, what is listed for “Row order” under “Clustered table”?",
      "options": [
        "Sorted by the clustering key",
        "attribute",
        "row"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Row order” as “Sorted by the clustering key”."
    },
    {
      "question": "In the “How rows are stored: heaps and clustered tables” table, what is listed for “Primary read path” under “Clustered table”?",
      "options": [
        "row",
        "instance",
        "Range seeks: “all orders in January” reads contiguous pages"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “Primary read path” as “Range seeks: “all orders in January” reads contiguous pages”."
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is a named, structured set of rows and columns that represents one kind of thing — customers, orders, invoices, disk volumes.”",
      "options": [
        "fixed by design",
        "schema",
        "table"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A table is a named, structured set of rows and columns that represents one kind of thing — customers, orders, invoices, disk volumes. Each table follows the rules of the relational model:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Designing the columns”?",
      "options": [
        "Range seeks: “all orders in January” reads contiguous pages",
        "Column choices are made once and lived with for years.",
        "Sorted by the clustering key"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Column choices are made once and lived with for years. The three decisions that matter most:”"
    },
    {
      "question": "Which fact is covered in the lesson section “How rows are stored: heaps and clustered tables”?",
      "options": [
        "Physically, rows live in 8-KB pages.",
        "Common pitfalls:",
        "Sorted by the clustering key"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Physically, rows live in 8-KB pages. A table is stored one of two ways, and the difference affects almost every read in the system:”"
    },
    {
      "question": "Complete the lesson statement: “_____s keep ownership and permissions tidy: the finance role gets finance, the app gets app, and neither can accidentally touch the other's objects.”",
      "options": [
        "Nullability",
        "Default",
        "schema"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Tables live inside a schema — a namespace inside a database (for example sales.Orders ). Schemas keep ownership and permissions tidy: the finance role gets finance, the app gets app, and neither can accidentally touch the other's objects.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Designing the columns”?",
      "options": [
        "Column choices are made once and lived with for years.",
        "A worked example that encodes all three, plus a key so rows are identifiable:",
        "Virtually every user table"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A worked example that encodes all three, plus a key so rows are identifiable:”"
    },
    {
      "question": "Which fact is covered in the lesson section “How rows are stored: heaps and clustered tables”?",
      "options": [
        "A nonclustered index is like an index in a book: it stores the key columns plus a pointer back to the row.",
        "Clustering key value — reused by every nonclustered index",
        "Virtually every user table"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A nonclustered index is like an index in a book: it stores the key columns plus a pointer back to the row. In a clustered table that pointer is the clustering key, which is why a narrow, stable clustering key (often an int or bigint identity) keeps every secondary index small — a production concern the day the table reaches tens of millions of rows.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Designing the columns”?",
      "options": [
        "A worked example that encodes all three, plus a key so rows are identifiable:",
        "column",
        "Notice what the design does for you: negative quantities and prices are rejected by CHECK constraints, a missing quantity becomes 1 rather than NULL, and every line can be…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Notice what the design does for you: negative quantities and prices are rejected by CHECK constraints, a missing quantity becomes 1 rather than NULL, and every line can be uniquely addressed by line_id.”"
    },
    {
      "question": "Complete the lesson statement: “_____ designing tables with no primary key at all (nothing prevents exact duplicates); choosing a GUID clustering key that fragments as it grows;…”",
      "options": [
        "Notice what the design does for you: negative quantities and prices are rejected by CHECK constraints, a missing quantity becomes 1 rather than NULL, and every line can be…",
        "Common pitfalls:",
        "A worked example that encodes all three, plus a key so rows are identifiable:"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Common pitfalls: designing tables with no primary key at all (nothing prevents exact duplicates); choosing a GUID clustering key that fragments as it grows; storing large documents in nvarchar(max) columns that bloat rows and force off-row reads; and using a “misc” table of 60 mostly-NULL columns because “we might need it someday”.”"
    },
    {
      "question": "In the “How rows are stored: heaps and clustered tables” table, what is listed for “Row order” under “Clustered table”?",
      "options": [
        "Sorted by the clustering key",
        "attribute",
        "row"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Row order” as “Sorted by the clustering key”."
    },
    {
      "question": "In the “How rows are stored: heaps and clustered tables” table, what is listed for “Primary read path” under “Clustered table”?",
      "options": [
        "row",
        "instance",
        "Range seeks: “all orders in January” reads contiguous pages"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “Primary read path” as “Range seeks: “all orders in January” reads contiguous pages”."
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is a named, structured set of rows and columns that represents one kind of thing — customers, orders, invoices, disk volumes.”",
      "options": [
        "fixed by design",
        "schema",
        "table"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A table is a named, structured set of rows and columns that represents one kind of thing — customers, orders, invoices, disk volumes. Each table follows the rules of the relational model:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Designing the columns”?",
      "options": [
        "Range seeks: “all orders in January” reads contiguous pages",
        "Column choices are made once and lived with for years.",
        "Sorted by the clustering key"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Column choices are made once and lived with for years. The three decisions that matter most:”"
    },
    {
      "question": "Which fact is covered in the lesson section “How rows are stored: heaps and clustered tables”?",
      "options": [
        "Physically, rows live in 8-KB pages.",
        "Common pitfalls:",
        "Sorted by the clustering key"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Physically, rows live in 8-KB pages. A table is stored one of two ways, and the difference affects almost every read in the system:”"
    },
    {
      "question": "Complete the lesson statement: “_____s keep ownership and permissions tidy: the finance role gets finance, the app gets app, and neither can accidentally touch the other's objects.”",
      "options": [
        "Nullability",
        "Default",
        "schema"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Tables live inside a schema — a namespace inside a database (for example sales.Orders ). Schemas keep ownership and permissions tidy: the finance role gets finance, the app gets app, and neither can accidentally touch the other's objects.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Designing the columns”?",
      "options": [
        "Column choices are made once and lived with for years.",
        "A worked example that encodes all three, plus a key so rows are identifiable:",
        "Virtually every user table"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A worked example that encodes all three, plus a key so rows are identifiable:”"
    },
    {
      "question": "Which fact is covered in the lesson section “How rows are stored: heaps and clustered tables”?",
      "options": [
        "A nonclustered index is like an index in a book: it stores the key columns plus a pointer back to the row.",
        "Clustering key value — reused by every nonclustered index",
        "Virtually every user table"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A nonclustered index is like an index in a book: it stores the key columns plus a pointer back to the row. In a clustered table that pointer is the clustering key, which is why a narrow, stable clustering key (often an int or bigint identity) keeps every secondary index small — a production concern the day the table reaches tens of millions of rows.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Designing the columns”?",
      "options": [
        "A worked example that encodes all three, plus a key so rows are identifiable:",
        "column",
        "Notice what the design does for you: negative quantities and prices are rejected by CHECK constraints, a missing quantity becomes 1 rather than NULL, and every line can be…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Notice what the design does for you: negative quantities and prices are rejected by CHECK constraints, a missing quantity becomes 1 rather than NULL, and every line can be uniquely addressed by line_id.”"
    },
    {
      "question": "Complete the lesson statement: “_____ designing tables with no primary key at all (nothing prevents exact duplicates); choosing a GUID clustering key that fragments as it grows;…”",
      "options": [
        "Notice what the design does for you: negative quantities and prices are rejected by CHECK constraints, a missing quantity becomes 1 rather than NULL, and every line can be…",
        "Common pitfalls:",
        "A worked example that encodes all three, plus a key so rows are identifiable:"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Common pitfalls: designing tables with no primary key at all (nothing prevents exact duplicates); choosing a GUID clustering key that fragments as it grows; storing large documents in nvarchar(max) columns that bloat rows and force off-row reads; and using a “misc” table of 60 mostly-NULL columns because “we might need it someday”.”"
    },
    {
      "question": "In the “How rows are stored: heaps and clustered tables” table, what is listed for “Row order” under “Clustered table”?",
      "options": [
        "Sorted by the clustering key",
        "attribute",
        "row"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Row order” as “Sorted by the clustering key”."
    },
    {
      "question": "In the “How rows are stored: heaps and clustered tables” table, what is listed for “Primary read path” under “Clustered table”?",
      "options": [
        "row",
        "instance",
        "Range seeks: “all orders in January” reads contiguous pages"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “Primary read path” as “Range seeks: “all orders in January” reads contiguous pages”."
    }
  ],
  takeaways: [
    "Tables represent one entity type; columns are fixed attributes, rows are the growing instances",
    "Name tables through schemas (sales.Orders) to keep ownership and permissions clean",
    "Choose narrow data types, NOT NULL by default, and defaults that make omissions correct",
    "Clustered tables store rows in key order and make range reads fast; heaps do not",
    "A primary key is not ceremony — without it, duplicates are structurally possible, and they will happen"
  ]
};
