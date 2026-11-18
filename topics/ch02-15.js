/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch02-15.html */

window.TOPIC = {
  id: "ch02-15",
  title: "SQL Server Data Types",

  lead: "Choosing a data type determines how values are stored and compared and can affect indexing and query behavior — select a type that fits the value range and workload.",

  objectives: [
    "Navigate the main SQL Server data type categories",
    "Compare exact and approximate numeric types and know when each is wrong",
    "Choose character types (char, varchar, nvarchar) deliberately",
    "Explain how type choices affect conversion, comparison, and index seeks",
    "Audit an existing table for risky type choices"
  ],

  sections: [
    {
      h: "Why the type choice matters",
      html: `
<p>Every column's data type affects storage, comparison semantics, and how SQL Server processes expressions and predicates. A type mismatch can introduce implicit conversions and affect a plan, but a seek isn't guaranteed or ruled out by the type alone; inspect the actual execution plan and workload.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="SQL Server data type categories">
    <defs>
      <marker id="dt-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="260" y="10" width="240" height="44" rx="10" fill="var(--accent)"/>
    <text x="380" y="38" text-anchor="middle" fill="#ffffff" font-size="15.5" font-weight="700" font-family="Segoe UI, sans-serif">SQL Server data types</text>

    <rect x="30" y="110" width="170" height="112" rx="10" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="115" y="134" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Exact numeric</text>
    <text x="115" y="158" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">int · bigint · smallint</text>
    <text x="115" y="178" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">decimal(12,2) · numeric</text>
    <text x="115" y="198" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">money — fixed precision</text>

    <rect x="225" y="110" width="170" height="112" rx="10" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="310" y="134" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Approximate</text>
    <text x="310" y="158" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">float · real</text>
    <text x="310" y="178" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">binary floating point</text>
    <text x="310" y="198" text-anchor="middle" fill="var(--amber)" font-size="11.5" font-weight="600" font-family="Segoe UI, sans-serif">never for money</text>

    <rect x="420" y="110" width="150" height="112" rx="10" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="495" y="134" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Date / time</text>
    <text x="495" y="158" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">date · time · datetime2</text>
    <text x="495" y="178" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">datetimeoffset (zone)</text>
    <text x="495" y="198" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">datetime — legacy</text>

    <rect x="595" y="110" width="150" height="112" rx="10" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="670" y="134" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Character</text>
    <text x="670" y="158" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">varchar · char</text>
    <text x="670" y="178" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">nvarchar · nchar</text>
    <text x="670" y="198" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">varchar(max) — large values</text>

    <line x1="330" y1="54" x2="130" y2="108" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#dt-arrow)"/>
    <line x1="365" y1="54" x2="318" y2="108" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#dt-arrow)"/>
    <line x1="430" y1="54" x2="487" y2="108" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#dt-arrow)"/>
    <line x1="465" y1="54" x2="655" y2="108" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#dt-arrow)"/>

    <rect x="30" y="244" width="715" height="40" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="387" y="269" text-anchor="middle" fill="var(--accent-strong)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Other: bit · binary / varbinary · uniqueidentifier · xml · json-as-varchar · geometry / geography</text>

    <text x="380" y="316" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Rule: choose a type that covers the domain and suits the workload.</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Type changes after go-live are data migrations — decide with evidence.</text>
  </svg>
  <div class="figcaption">Figure 1 — The main type families and the members you will actually use.</div>
</div>
`
    },
    {
      h: "Numeric types: exact versus approximate",
      html: `
<p>The most consequential numeric decision is <strong>exact versus approximate</strong>. Exact types store precisely what you wrote; approximate types store a binary fraction that may differ in the last bits — perfectly fine for scientific measurement, dangerous for money.</p>
<table>
  <tr><th>Type</th><th>Storage</th><th>Precision / range</th><th>Correct use</th></tr>
  <tr><td><strong>int</strong></td><td>4 bytes</td><td>±2.1 billion</td><td>Identifiers, counts, quantities</td></tr>
  <tr><td><strong>bigint</strong></td><td>8 bytes</td><td>±9.2 × 10<sup>18</sup></td><td>Very large identifiers and totals</td></tr>
  <tr><td><strong>smallint / tinyint</strong></td><td>2 / 1 bytes</td><td>±32,767 / 0–255</td><td>Status codes, type flags</td></tr>
  <tr><td><strong>decimal(18,4) / numeric</strong></td><td>5–17 bytes</td><td>Exact, scale fixed</td><td>Money, rates, measurements — default for currency</td></tr>
  <tr><td><strong>float / real</strong></td><td>8 / 4 bytes</td><td>Approximate binary</td><td>Scientific data, statistics — <em>never</em> money</td></tr>
  <tr><td><strong>money</strong></td><td>8 bytes</td><td>Scale 4, fixed</td><td>Use only when its fixed scale and range fit the requirements; decimal offers explicit precision and scale</td></tr>
</table>
<p>For exact monetary amounts, <code>decimal(p,s)</code> with a precision and scale chosen for the domain is a common choice (for example, 12,2 for some currencies); rates may require a different scale. Approximate <code>float</code> and <code>real</code> values aren't suitable when exact decimal arithmetic is required.</p>
`
    },
    {
      h: "Character types: the width decisions",
      html: `
<p>String types differ in encoding, storage, and comparison behaviour:</p>
<table>
  <tr><th>Type</th><th>Storage</th><th>Notes</th></tr>
  <tr><td><strong>varchar(n)</strong></td><td>Variable-length encoded bytes; bytes per character depend on collation (UTF-8 collations may use multiple bytes)</td><td>In non-Unicode code pages, unrepresentable characters can be lost or replaced during conversion</td></tr>
  <tr><td><strong>nvarchar(n)</strong></td><td>UTF-16 byte-pairs; some supplementary characters use two pairs</td><td>Unicode text; choose when the supported character repertoire requires it</td></tr>
  <tr><td><strong>char(n)</strong></td><td>n bytes, always</td><td>Genuinely fixed-width codes: country codes, ISO currency</td></tr>
  <tr><td><strong>varchar(max)</strong></td><td>Up to 2 GB; large values may be stored off-row</td><td>Large text payloads; storage location and I/O depend on value size and row settings</td></tr>
</table>
<p>Practical guidance: choose a character type and collation that support the text's character repertoire; use <code>nvarchar</code> when Unicode storage is required, and <code>varchar</code> when its collation/code page is sufficient. Declare a realistic <code>n</code>; the declared size is a limit and can affect estimates and memory grants.</p>
<pre><code class="language-sql">CREATE TABLE sales.Orders
(
    order_id      bigint         IDENTITY(1,1) NOT NULL,
    customer_id   int            NOT NULL,
    reference     varchar(20)    NOT NULL,     -- machine code: ASCII is fine
    order_date    date           NOT NULL,     -- calendar date: 3 bytes, no time
    placed_utc    datetime2(3)   NOT NULL
                  CONSTRAINT DF_Orders_placed DEFAULT (sysutcdatetime()),
    status        tinyint        NOT NULL,     -- 0..255 codes, 1 byte
    total_amount  decimal(12,2)  NOT NULL,     -- exact money
    customer_note nvarchar(500)  NULL,         -- human text: Unicode
    document      varchar(max)   NULL,         -- large text payload
    CONSTRAINT PK_Orders PRIMARY KEY CLUSTERED (order_id),
    CONSTRAINT CK_Orders_total CHECK (total_amount &gt;= 0)
);</code></pre>
<p>For identifiers, compare the storage and access trade-offs: <code>bigint</code> uses 8 bytes, while <code>uniqueidentifier</code> uses 16. Random GUID inserts can cause page splits and fragmentation for some clustered-index workloads; sequential GUID generation or a different clustering key can change that behavior.</p>
`
    },
    {
      h: "Conversions: where indexes go to die",
      html: `
<p>When two types meet in a comparison, SQL Server applies <strong>data type precedence</strong> and converts the lower-precedence expression. A conversion applied to the indexed column can make an efficient seek less likely, though the optimizer's choice depends on the expression and plan:</p>
<pre><code class="language-sql">-- WRONG: converts order_date to varchar for every row -> cannot seek
SELECT order_id
FROM   sales.Orders
WHERE  CONVERT(varchar(10), order_date) = '2026-01-15';

-- RIGHT: the literal converts to date (a constant), the column stays a date -> seek
SELECT order_id
FROM   sales.Orders
WHERE  order_date = '2026-01-15';

-- Same trap in parameters: declare @d date = '2026-01-15' before EXEC sp_executesql,
-- so the parameter type matches the column type exactly.</code></pre>
<p>Related traps: an <code>nvarchar</code> parameter against a <code>varchar</code> column can cause an implicit conversion on the column because <code>nvarchar</code> has higher precedence; assigning <code>decimal(12,4)</code> into <code>decimal(12,2)</code> can round; and date strings can depend on session language settings — prefer typed parameters or unambiguous date formats.</p>
<p><strong>Common pitfalls:</strong> storing exact monetary amounts in <code>float</code>; choosing <code>varchar(50)</code> without checking whether the range and encoding are sufficient; legacy <code>datetime</code> with its approximate 3.33 ms increments; <code>bit</code> columns that quietly mean three different things; and adding a new column as <code>varchar(max)</code> for “temporary” data that is still there four years later.</p>
`
    }
  ],

  scenario: {
    title: "Month-end close failed on a £431.77 difference",
    html: `
<p>Finance closed the month and the ledger failed validation: the sum of line totals exceeded the header totals by £431.77 across 62,000 invoices. The application “rounded correctly” in code — but two columns in <code>dbo.InvoiceLines</code> had been created as <code>float</code> by an early developer because the prototype used spreadsheet arithmetic. Depending on magnitude and operation order, <code>sum(qty * unit_price)</code> in floating point differed from the exact decimal arithmetic the header totals used, and the drift was visible only when the two were compared at scale.</p>
<p>The DBA's response before the close deadline: quantised every stored line value to 2 decimal places with a documented script, checked the converted values for range and rounding effects, altered the columns to <code>decimal(12,2)</code>, recomputed the 62 affected header totals from exact arithmetic, and handed Finance a reconciliation report of the penny-level changes. Prevention: a schema standard — monetary columns use an exact type with explicit precision and scale, enforced by a review checklist and a scan for approximate numeric types in user tables. <strong>The code was never wrong; the type it ran on was incapable of being right.</strong></p>
`
  },

  interview: [
    {
      q: "How do you store monetary values in SQL Server?",
      a: "Use an exact type when exact decimal arithmetic is required, commonly decimal/numeric with precision and scale chosen for the domain. Float and real are approximate; money has a fixed scale and range, so compare those trade-offs against the requirements."
    },
    {
      q: "varchar or nvarchar — which and when?",
      a: "Choose based on the characters and collation required. Nvarchar supports Unicode; varchar can also support Unicode with a UTF-8 collation, while other varchar collations use a code page. Use char for genuinely fixed-width values."
    },
    {
      q: "A query has an index on the filtered column but still scans. What is the first thing you check?",
      a: "Check the actual execution plan for implicit conversions and compare the column, literal, and parameter types. A higher-precedence parameter type (such as nvarchar against a varchar column) or an explicit function on the column can affect seekability; align types where appropriate and verify the resulting plan."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “…bytes each row occupies, whether comparisons are exact or approximate, whether an index on that column can be _____, and what happens at the boundary when another type (a parameter, a literal, another column) meets it.”",
      "options": [
        "seeked",
        "Money deserves a hard rule: decimal(p,s) with an explicit scale (12,2 for currency, 12,4 for rates), because reconciliation systems compare totals to the penny and floats cannot…",
        "Identifiers, counts, quantities"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Every column's data type determines four things: how many bytes each row occupies, whether comparisons are exact or approximate, whether an index on that column can be seeked, and what happens at the boundary when another type (a parameter, a literal, another column) meets it. Get the type right and the database quietly does the correct, fast thing forever; get it wrong and every query inherits a workaround.”"
    },
    {
      "question": "Complete the lesson statement: “The most consequential numeric decision is _____.”",
      "options": [
        "Identifiers, counts, quantities",
        "Very large identifiers and totals",
        "exact versus approximate"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The most consequential numeric decision is exact versus approximate. Exact types store precisely what you wrote; approximate types store a binary fraction that may differ in the last bits — perfectly fine for scientific measurement, dangerous for money.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Character types: the width decisions”?",
      "options": [
        "int",
        "String types differ in encoding, storage, and comparison behaviour:",
        "Documents and payloads — each read pays off-row I/O"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “String types differ in encoding, storage, and comparison behaviour:”"
    },
    {
      "question": "Complete the lesson statement: “When two types meet in a comparison, SQL Server applies _____ — the “wider” type wins and the other side is converted.”",
      "options": [
        "data type precedence",
        "Status codes, type flags",
        "Money, rates, measurements — default for currency"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “When two types meet in a comparison, SQL Server applies data type precedence — the “wider” type wins and the other side is converted. If the column is converted, the index on it cannot be seeked and every row must be converted (a scan). This is the most common cause of a “the index exists but is not used” diagnosis:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Numeric types: exact versus approximate”?",
      "options": [
        "bigint",
        "smallint / tinyint",
        "Money deserves a hard rule: decimal(p,s) with an explicit scale (12,2 for currency, 12,4 for rates), because reconciliation systems compare totals to the penny and floats cannot…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Money deserves a hard rule: decimal(p,s) with an explicit scale (12,2 for currency, 12,4 for rates), because reconciliation systems compare totals to the penny and floats cannot promise that.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Character types: the width decisions”?",
      "options": [
        "decimal(18,4) / numeric",
        "ller”); plain varchar for machine-generated identifiers; and declare a realistic n — the declared size is a promise used by the optimiser for memory grants, not just a cap.",
        "smallint / tinyint"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Practical guidance: nvarchar for any text a human typed (people's names are the classic varchar casualty — “Müller” becomes “M?ller”); plain varchar for machine-generated identifiers; and declare a realistic n — the declared size is a promise used by the optimiser for memory grants, not just a cap.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Conversions: where indexes go to die”?",
      "options": [
        "Related traps: varchar parameter against an nvarchar column (the column wins → conversion → scan); implicit rounding when assigning decimal(12,4) into decimal(12,2); and date…",
        "decimal(18,4) / numeric",
        "float / real"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Related traps: varchar parameter against an nvarchar column (the column wins → conversion → scan); implicit rounding when assigning decimal(12,4) into decimal(12,2); and date strings that depend on session language settings — prefer typed literals or unambiguous ISO 8601 strings.”"
    },
    {
      "question": "In the “Numeric types: exact versus approximate” table, what is listed for “int” under “Correct use”?",
      "options": [
        "float / real",
        "never",
        "Identifiers, counts, quantities"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “int” as “Identifiers, counts, quantities”."
    },
    {
      "question": "Which fact is covered in the lesson section “Character types: the width decisions”?",
      "options": [
        "money",
        "For identifiers, prefer bigint identity over uniqueidentifier: 8 bytes sorted (good clustering key) versus 16 bytes random (fragmenting clustering key).",
        "never"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “For identifiers, prefer bigint identity over uniqueidentifier: 8 bytes sorted (good clustering key) versus 16 bytes random (fragmenting clustering key). Use GUIDs at integration boundaries where global uniqueness is required — then map them, rather than clustering a hot table on randomness.”"
    },
    {
      "question": "Complete the lesson statement: “_____ storing money in float “because Excel does”; choosing varchar(50) for everything (silent truncation errors are actually preferable to…”",
      "options": [
        "Common pitfalls:",
        "For identifiers, prefer bigint identity over uniqueidentifier: 8 bytes sorted (good clustering key) versus 16 bytes random (fragmenting clustering key).",
        "Non-Unicode; characters outside the collation's code page become “?”"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Common pitfalls: storing money in float “because Excel does”; choosing varchar(50) for everything (silent truncation errors are actually preferable to silent corruption — at least they are loud); legacy datetime with its 3.33 ms rounding; bit columns that quietly mean three different things; and adding a new column as varchar(max) for “temporary” data that is still there four years later.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “…bytes each row occupies, whether comparisons are exact or approximate, whether an index on that column can be _____, and what happens at the boundary when another type (a parameter, a literal, another column) meets it.”",
      "options": [
        "seeked",
        "Money deserves a hard rule: decimal(p,s) with an explicit scale (12,2 for currency, 12,4 for rates), because reconciliation systems compare totals to the penny and floats cannot…",
        "Identifiers, counts, quantities"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Every column's data type determines four things: how many bytes each row occupies, whether comparisons are exact or approximate, whether an index on that column can be seeked, and what happens at the boundary when another type (a parameter, a literal, another column) meets it. Get the type right and the database quietly does the correct, fast thing forever; get it wrong and every query inherits a workaround.”"
    },
    {
      "question": "Complete the lesson statement: “The most consequential numeric decision is _____.”",
      "options": [
        "Identifiers, counts, quantities",
        "Very large identifiers and totals",
        "exact versus approximate"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The most consequential numeric decision is exact versus approximate. Exact types store precisely what you wrote; approximate types store a binary fraction that may differ in the last bits — perfectly fine for scientific measurement, dangerous for money.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Character types: the width decisions”?",
      "options": [
        "int",
        "String types differ in encoding, storage, and comparison behaviour:",
        "Documents and payloads — each read pays off-row I/O"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “String types differ in encoding, storage, and comparison behaviour:”"
    },
    {
      "question": "Complete the lesson statement: “When two types meet in a comparison, SQL Server applies _____ — the “wider” type wins and the other side is converted.”",
      "options": [
        "data type precedence",
        "Status codes, type flags",
        "Money, rates, measurements — default for currency"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “When two types meet in a comparison, SQL Server applies data type precedence — the “wider” type wins and the other side is converted. If the column is converted, the index on it cannot be seeked and every row must be converted (a scan). This is the most common cause of a “the index exists but is not used” diagnosis:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Numeric types: exact versus approximate”?",
      "options": [
        "bigint",
        "smallint / tinyint",
        "Money deserves a hard rule: decimal(p,s) with an explicit scale (12,2 for currency, 12,4 for rates), because reconciliation systems compare totals to the penny and floats cannot…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Money deserves a hard rule: decimal(p,s) with an explicit scale (12,2 for currency, 12,4 for rates), because reconciliation systems compare totals to the penny and floats cannot promise that.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Character types: the width decisions”?",
      "options": [
        "decimal(18,4) / numeric",
        "ller”); plain varchar for machine-generated identifiers; and declare a realistic n — the declared size is a promise used by the optimiser for memory grants, not just a cap.",
        "smallint / tinyint"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Practical guidance: nvarchar for any text a human typed (people's names are the classic varchar casualty — “Müller” becomes “M?ller”); plain varchar for machine-generated identifiers; and declare a realistic n — the declared size is a promise used by the optimiser for memory grants, not just a cap.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Conversions: where indexes go to die”?",
      "options": [
        "Related traps: varchar parameter against an nvarchar column (the column wins → conversion → scan); implicit rounding when assigning decimal(12,4) into decimal(12,2); and date…",
        "decimal(18,4) / numeric",
        "float / real"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Related traps: varchar parameter against an nvarchar column (the column wins → conversion → scan); implicit rounding when assigning decimal(12,4) into decimal(12,2); and date strings that depend on session language settings — prefer typed literals or unambiguous ISO 8601 strings.”"
    },
    {
      "question": "In the “Numeric types: exact versus approximate” table, what is listed for “int” under “Correct use”?",
      "options": [
        "float / real",
        "never",
        "Identifiers, counts, quantities"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “int” as “Identifiers, counts, quantities”."
    },
    {
      "question": "Which fact is covered in the lesson section “Character types: the width decisions”?",
      "options": [
        "money",
        "For identifiers, prefer bigint identity over uniqueidentifier: 8 bytes sorted (good clustering key) versus 16 bytes random (fragmenting clustering key).",
        "never"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “For identifiers, prefer bigint identity over uniqueidentifier: 8 bytes sorted (good clustering key) versus 16 bytes random (fragmenting clustering key). Use GUIDs at integration boundaries where global uniqueness is required — then map them, rather than clustering a hot table on randomness.”"
    },
    {
      "question": "Complete the lesson statement: “_____ storing money in float “because Excel does”; choosing varchar(50) for everything (silent truncation errors are actually preferable to…”",
      "options": [
        "Common pitfalls:",
        "For identifiers, prefer bigint identity over uniqueidentifier: 8 bytes sorted (good clustering key) versus 16 bytes random (fragmenting clustering key).",
        "Non-Unicode; characters outside the collation's code page become “?”"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Common pitfalls: storing money in float “because Excel does”; choosing varchar(50) for everything (silent truncation errors are actually preferable to silent corruption — at least they are loud); legacy datetime with its 3.33 ms rounding; bit columns that quietly mean three different things; and adding a new column as varchar(max) for “temporary” data that is still there four years later.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “…bytes each row occupies, whether comparisons are exact or approximate, whether an index on that column can be _____, and what happens at the boundary when another type (a parameter, a literal, another column) meets it.”",
      "options": [
        "seeked",
        "Money deserves a hard rule: decimal(p,s) with an explicit scale (12,2 for currency, 12,4 for rates), because reconciliation systems compare totals to the penny and floats cannot…",
        "Identifiers, counts, quantities"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Every column's data type determines four things: how many bytes each row occupies, whether comparisons are exact or approximate, whether an index on that column can be seeked, and what happens at the boundary when another type (a parameter, a literal, another column) meets it. Get the type right and the database quietly does the correct, fast thing forever; get it wrong and every query inherits a workaround.”"
    },
    {
      "question": "Complete the lesson statement: “The most consequential numeric decision is _____.”",
      "options": [
        "Identifiers, counts, quantities",
        "Very large identifiers and totals",
        "exact versus approximate"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The most consequential numeric decision is exact versus approximate. Exact types store precisely what you wrote; approximate types store a binary fraction that may differ in the last bits — perfectly fine for scientific measurement, dangerous for money.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Character types: the width decisions”?",
      "options": [
        "int",
        "String types differ in encoding, storage, and comparison behaviour:",
        "Documents and payloads — each read pays off-row I/O"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “String types differ in encoding, storage, and comparison behaviour:”"
    },
    {
      "question": "Complete the lesson statement: “When two types meet in a comparison, SQL Server applies _____ — the “wider” type wins and the other side is converted.”",
      "options": [
        "data type precedence",
        "Status codes, type flags",
        "Money, rates, measurements — default for currency"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “When two types meet in a comparison, SQL Server applies data type precedence — the “wider” type wins and the other side is converted. If the column is converted, the index on it cannot be seeked and every row must be converted (a scan). This is the most common cause of a “the index exists but is not used” diagnosis:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Numeric types: exact versus approximate”?",
      "options": [
        "bigint",
        "smallint / tinyint",
        "Money deserves a hard rule: decimal(p,s) with an explicit scale (12,2 for currency, 12,4 for rates), because reconciliation systems compare totals to the penny and floats cannot…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Money deserves a hard rule: decimal(p,s) with an explicit scale (12,2 for currency, 12,4 for rates), because reconciliation systems compare totals to the penny and floats cannot promise that.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Character types: the width decisions”?",
      "options": [
        "decimal(18,4) / numeric",
        "ller”); plain varchar for machine-generated identifiers; and declare a realistic n — the declared size is a promise used by the optimiser for memory grants, not just a cap.",
        "smallint / tinyint"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Practical guidance: nvarchar for any text a human typed (people's names are the classic varchar casualty — “Müller” becomes “M?ller”); plain varchar for machine-generated identifiers; and declare a realistic n — the declared size is a promise used by the optimiser for memory grants, not just a cap.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Conversions: where indexes go to die”?",
      "options": [
        "Related traps: varchar parameter against an nvarchar column (the column wins → conversion → scan); implicit rounding when assigning decimal(12,4) into decimal(12,2); and date…",
        "decimal(18,4) / numeric",
        "float / real"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Related traps: varchar parameter against an nvarchar column (the column wins → conversion → scan); implicit rounding when assigning decimal(12,4) into decimal(12,2); and date strings that depend on session language settings — prefer typed literals or unambiguous ISO 8601 strings.”"
    },
    {
      "question": "In the “Numeric types: exact versus approximate” table, what is listed for “int” under “Correct use”?",
      "options": [
        "float / real",
        "never",
        "Identifiers, counts, quantities"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “int” as “Identifiers, counts, quantities”."
    },
    {
      "question": "Which fact is covered in the lesson section “Character types: the width decisions”?",
      "options": [
        "money",
        "For identifiers, prefer bigint identity over uniqueidentifier: 8 bytes sorted (good clustering key) versus 16 bytes random (fragmenting clustering key).",
        "never"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “For identifiers, prefer bigint identity over uniqueidentifier: 8 bytes sorted (good clustering key) versus 16 bytes random (fragmenting clustering key). Use GUIDs at integration boundaries where global uniqueness is required — then map them, rather than clustering a hot table on randomness.”"
    },
    {
      "question": "Complete the lesson statement: “_____ storing money in float “because Excel does”; choosing varchar(50) for everything (silent truncation errors are actually preferable to…”",
      "options": [
        "Common pitfalls:",
        "For identifiers, prefer bigint identity over uniqueidentifier: 8 bytes sorted (good clustering key) versus 16 bytes random (fragmenting clustering key).",
        "Non-Unicode; characters outside the collation's code page become “?”"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Common pitfalls: storing money in float “because Excel does”; choosing varchar(50) for everything (silent truncation errors are actually preferable to silent corruption — at least they are loud); legacy datetime with its 3.33 ms rounding; bit columns that quietly mean three different things; and adding a new column as varchar(max) for “temporary” data that is still there four years later.”"
    }
  ],
  takeaways: [
    "Data types determine storage, comparison semantics, and whether an index can be seeked",
    "Exact numerics (decimal) for money; float/real are approximate and never appropriate for currency",
    "nvarchar for human text, varchar for machine ASCII, char only for fixed codes, varchar(max) sparingly",
    "Implicit conversion follows data type precedence — a converted column cannot use its index",
    "Prefer bigint identity over GUIDs for clustering keys, and datetime2/date over legacy datetime"
  ]
};
