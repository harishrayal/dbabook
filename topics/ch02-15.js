/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch02-15.html */

window.TOPIC = {
  id: "ch02-15",
  title: "SQL Server Data Types",

  lead: "Choosing a data type is choosing how a value is stored, compared, and indexed for the life of the table — the narrowest type that can never be wrong is a performance decision, a correctness decision, and a storage decision at once.",

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
<p>Every column's data type determines four things: how many bytes each row occupies, whether comparisons are exact or approximate, whether an index on that column can be <strong>seeked</strong>, and what happens at the boundary when another type (a parameter, a literal, another column) meets it. Get the type right and the database quietly does the correct, fast thing forever; get it wrong and every query inherits a workaround.</p>
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
    <text x="115" y="198" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">money — legacy, avoid</text>

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
    <text x="670" y="198" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">varchar(max) — off-row</text>

    <line x1="330" y1="54" x2="130" y2="108" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#dt-arrow)"/>
    <line x1="365" y1="54" x2="318" y2="108" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#dt-arrow)"/>
    <line x1="430" y1="54" x2="487" y2="108" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#dt-arrow)"/>
    <line x1="465" y1="54" x2="655" y2="108" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#dt-arrow)"/>

    <rect x="30" y="244" width="715" height="40" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="387" y="269" text-anchor="middle" fill="var(--accent-strong)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Other: bit · binary / varbinary · uniqueidentifier · xml · json-as-varchar · geometry / geography</text>

    <text x="380" y="316" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Rule: the narrowest type that can never be wrong — storage, comparisons, and index seeks all follow the choice.</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Type changes after go-live are data migrations — decide once, with evidence.</text>
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
  <tr><td><strong>money</strong></td><td>8 bytes</td><td>Scale 4, fixed</td><td>Legacy only — odd rounding behaviour and no scale control</td></tr>
</table>
<p>Money deserves a hard rule: <code>decimal(p,s)</code> with an explicit scale (12,2 for currency, 12,4 for rates), because reconciliation systems compare totals to the penny and floats cannot promise that.</p>
`
    },
    {
      h: "Character types: the width decisions",
      html: `
<p>String types differ in encoding, storage, and comparison behaviour:</p>
<table>
  <tr><th>Type</th><th>Storage</th><th>Notes</th></tr>
  <tr><td><strong>varchar(n)</strong></td><td>1 byte per character (2-byte overhead), actual length used</td><td>Non-Unicode; characters outside the collation's code page become “?”</td></tr>
  <tr><td><strong>nvarchar(n)</strong></td><td>2 bytes per character</td><td>Unicode — correct for names, addresses, anything international</td></tr>
  <tr><td><strong>char(n)</strong></td><td>n bytes, always</td><td>Genuinely fixed-width codes: country codes, ISO currency</td></tr>
  <tr><td><strong>varchar(max)</strong></td><td>Up to 2 GB, stored off-row above 8 KB</td><td>Documents and payloads — each read pays off-row I/O</td></tr>
</table>
<p>Practical guidance: <code>nvarchar</code> for any text a human typed (people's names are the classic <code>varchar</code> casualty — “Müller” becomes “M?ller”); plain <code>varchar</code> for machine-generated identifiers; and declare a realistic <code>n</code> — the declared size is a promise used by the optimiser for memory grants, not just a cap.</p>
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
    document      varchar(max)   NULL,         -- large payload, off-row
    CONSTRAINT PK_Orders PRIMARY KEY CLUSTERED (order_id),
    CONSTRAINT CK_Orders_total CHECK (total_amount &gt;= 0)
);</code></pre>
<p>For identifiers, prefer <code>bigint identity</code> over <code>uniqueidentifier</code>: 8 bytes sorted (good clustering key) versus 16 bytes random (fragmenting clustering key). Use GUIDs at integration boundaries where global uniqueness is required — then map them, rather than clustering a hot table on randomness.</p>
`
    },
    {
      h: "Conversions: where indexes go to die",
      html: `
<p>When two types meet in a comparison, SQL Server applies <strong>data type precedence</strong> — the “wider” type wins and the other side is converted. If the <em>column</em> is converted, the index on it cannot be seeked and every row must be converted (a scan). This is the most common cause of a “the index exists but is not used” diagnosis:</p>
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
<p>Related traps: <code>varchar</code> parameter against an <code>nvarchar</code> column (the column wins → conversion → scan); implicit rounding when assigning <code>decimal(12,4)</code> into <code>decimal(12,2)</code>; and date strings that depend on session language settings — prefer typed literals or unambiguous ISO 8601 strings.</p>
<p><strong>Common pitfalls:</strong> storing money in <code>float</code> “because Excel does”; choosing <code>varchar(50)</code> for everything (silent truncation errors are actually preferable to silent corruption — at least they are loud); legacy <code>datetime</code> with its 3.33 ms rounding; <code>bit</code> columns that quietly mean three different things; and adding a new column as <code>varchar(max)</code> for “temporary” data that is still there four years later.</p>
`
    }
  ],

  scenario: {
    title: "Month-end close failed on a £431.77 difference",
    html: `
<p>Finance closed the month and the ledger failed validation: the sum of line totals exceeded the header totals by £431.77 across 62,000 invoices. The application “rounded correctly” in code — but two columns in <code>dbo.InvoiceLines</code> had been created as <code>float</code> by an early developer because the prototype used spreadsheet arithmetic. Depending on magnitude and operation order, <code>sum(qty * unit_price)</code> in floating point differed from the exact decimal arithmetic the header totals used, and the drift was visible only when the two were compared at scale.</p>
<p>The DBA's response before the close deadline: quantised every stored line value to 2 decimal places with a documented script, ran <code>ALTER COLUMN</code> to <code>decimal(12,2)</code> (non-null, verified with <code>WITH CHECK</code>-style validation first), recomputed the 62 affected header totals from exact arithmetic, and handed Finance a reconciliation report of the penny-level changes. Prevention: a schema standard — monetary columns are <code>decimal</code> with explicit scale, enforced by a review checklist and a scan for <code>float</code>/<code>real</code>/<code>money</code> columns in user tables. <strong>The code was never wrong; the type it ran on was incapable of being right.</strong></p>
`
  },

  interview: [
    {
      q: "How do you store monetary values in SQL Server?",
      a: "As decimal (numeric) with an explicit precision and scale — decimal(12,2) for currency, more scale for rates. Never float or real, because they are approximate binary values that drift under aggregation; and avoid money for new work because of its fixed scale and awkward rounding behaviour."
    },
    {
      q: "varchar or nvarchar — which and when?",
      a: "nvarchar for any text people write — names, addresses, notes — because Unicode prevents data-dependent corruption outside the collation's code page, at double the storage. varchar for machine-generated ASCII identifiers and codes where the encoding is guaranteed. Use char only for truly fixed-length codes."
    },
    {
      q: "A query has an index on the filtered column but still scans. What is the first thing you check?",
      a: "Type mismatch causing implicit conversion on the column side: compare the data types of the predicate's column, literal, and parameter against data type precedence. If the column is being converted (e.g. a varchar parameter against an nvarchar column, or CONVERT on the column in the WHERE clause), the seek is impossible — fix the comparison types, not the index."
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
