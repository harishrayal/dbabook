/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch02-02.html */

window.TOPIC = {
  id: "ch02-02",
  title: "What Is a Relational Database Management System (RDBMS)?",

  lead: "An RDBMS is the software that stores data in tables related by keys and exposes it through SQL — the model that still runs the world's transactions, and the reason SQL Server behaves the way it does.",

  objectives: [
    "Explain the relational model: relations, tuples, attributes, and keys",
    "Distinguish the relational model from the DBMS software that implements it",
    "Describe what an RDBMS adds: SQL, ACID, integrity, and data independence",
    "Compare relational and non-relational trade-offs honestly",
    "Recognise how the relational model shapes everyday DBA work"
  ],

  sections: [
    {
      h: "The relational model in plain terms",
      html: `
<p>In 1970 Edgar F. Codd proposed storing data as <strong>relations</strong> — mathematical sets of rows — instead of nested records and pointers. In everyday SQL Server language:</p>
<ul>
  <li>A <strong>relation</strong> is a <strong>table</strong></li>
  <li>A <strong>tuple</strong> is a <strong>row</strong> (one entity, e.g. one customer)</li>
  <li>An <strong>attribute</strong> is a <strong>column</strong> (one property, e.g. customer_name)</li>
  <li>A <strong>key</strong> is the column or columns that uniquely identify a row and link it to related tables</li>
</ul>
<p>The revolutionary part was not tables — it was that <strong>relationships are expressed by data, not by structure</strong>. A customer's orders are not stored inside a customer record; they are rows in an Orders table that <em>reference</em> the customer's key. Applications find them with a join, and no physical nesting has to be rebuilt when requirements change.</p>
<blockquote>Data is related by value, not by position or pointer — that is what “relational” means, and it is why the schema can evolve without rewriting storage.</blockquote>
`
    },
    {
      h: "From the model to the RDBMS",
      html: `
<p>The <strong>Relational Database Management System</strong> is the software product that implements the model. SQL Server, PostgreSQL, Oracle, and MySQL are RDBMSs; each provides the same core machinery under different names and engines.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Relational model and RDBMS layers">
    <defs>
      <marker id="rdbms-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="40" y="24" width="200" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="140" y="49" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Client / application</text>
    <text x="140" y="70" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">sends SQL statements</text>

    <rect x="300" y="24" width="200" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="400" y="49" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">SQL (the language)</text>
    <text x="400" y="70" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">declarative: say what, not how</text>

    <rect x="560" y="24" width="170" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="645" y="49" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Result set</text>
    <text x="645" y="70" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">rows back to the client</text>

    <rect x="40" y="128" width="690" height="118" rx="14" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="385" y="156" text-anchor="middle" fill="var(--accent-strong)" font-size="16.5" font-weight="700" font-family="Segoe UI, sans-serif">RDBMS — SQL Server</text>

    <rect x="70" y="176" width="200" height="54" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="170" y="198" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Integrity engine</text>
    <text x="170" y="218" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">keys · constraints · FK rules</text>

    <rect x="290" y="176" width="190" height="54" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="385" y="198" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Concurrency &amp; ACID</text>
    <text x="385" y="218" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">locks · log · recovery</text>

    <rect x="500" y="176" width="200" height="54" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="600" y="198" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Storage &amp; optimiser</text>
    <text x="600" y="218" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">pages · indexes · plans</text>

    <rect x="40" y="284" width="330" height="46" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="205" y="312" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Data files · tables related by keys</text>

    <rect x="410" y="284" width="320" height="46" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="570" y="312" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Transaction log · point-in-time recovery</text>

    <line x1="240" y1="54" x2="298" y2="54" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#rdbms-arrow)"/>
    <line x1="500" y1="54" x2="558" y2="54" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#rdbms-arrow)"/>
    <line x1="140" y1="84" x2="200" y2="126" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#rdbms-arrow)"/>
    <line x1="645" y1="84" x2="560" y2="126" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#rdbms-arrow)" transform="translate(0,0)"/>
    <line x1="205" y1="246" x2="205" y2="282" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#rdbms-arrow)"/>
    <line x1="570" y1="246" x2="570" y2="282" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#rdbms-arrow)"/>
  </svg>
  <div class="figcaption">Figure 1 — Clients speak SQL; the RDBMS provides integrity, concurrency, and storage beneath it.</div>
</div>
<p>What an RDBMS guarantees that a file system does not:</p>
<ul>
  <li><strong>Declarative access</strong> — you describe the result you want; the optimiser chooses indexes and join strategies</li>
  <li><strong>Integrity</strong> — keys and constraints reject data that breaks the model, for every client equally</li>
  <li><strong>ACID transactions</strong> — concurrent changes are atomic, consistent, isolated, and durable</li>
  <li><strong>Data independence</strong> — physical storage can change (indexes, partitioning, file placement) without changing application SQL</li>
</ul>
`
    },
    {
      h: "Relationships are declared, not stored",
      html: `
<p>The practical heart of an RDBMS is the <strong>foreign key</strong>: a column in one table carrying the primary key of another. The database itself enforces the relationship, so no application can accidentally create an order for a customer that does not exist.</p>
<pre><code class="language-sql">CREATE TABLE sales.Customers
(
    customer_id int           IDENTITY(1,1) NOT NULL,
    customer_name nvarchar(100) NOT NULL,
    CONSTRAINT PK_Customers PRIMARY KEY CLUSTERED (customer_id)
);

CREATE TABLE sales.Orders
(
    order_id     int             IDENTITY(1,1) NOT NULL,
    customer_id  int             NOT NULL,
    order_date   date            NOT NULL,
    CONSTRAINT PK_Orders PRIMARY KEY CLUSTERED (order_id),
    CONSTRAINT FK_Orders_Customers FOREIGN KEY (customer_id)
        REFERENCES sales.Customers (customer_id)
);

-- The RDBMS refuses the orphan row before it is ever stored
INSERT INTO sales.Orders (customer_id, order_date)
VALUES (999999, '2026-01-15');   -- FK violation error</code></pre>
<p>The join is then expressed in SQL, and the optimiser decides how to execute it:</p>
<pre><code class="language-sql">SELECT c.customer_name,
       count(*) AS order_count,
       max(o.order_date) AS last_order
FROM   sales.Customers AS c
JOIN   sales.Orders     AS o ON o.customer_id = c.customer_id
GROUP  BY c.customer_name
ORDER  BY order_count DESC;</code></pre>
`
    },
    {
      h: "Relational versus non-relational — the honest comparison",
      html: `
<p>Document, key-value, and graph stores are not inferior; they answer different questions. What matters is knowing which guarantees you are trading away:</p>
<table>
  <tr><th>Dimension</th><th>Relational (SQL Server)</th><th>Non-relational (document / KV)</th></tr>
  <tr><td>Data shape</td><td>Fixed schema, normalised tables</td><td>Schema-flexible documents, aggregates</td></tr>
  <tr><td>Relationships</td><td>First-class via foreign keys and joins</td><td>Resolved in the application or duplicated</td></tr>
  <tr><td>Transactions</td><td>Full ACID across statements and rows</td><td>Often single-document or eventual consistency</td></tr>
  <tr><td>Integrity</td><td>Enforced centrally by the engine</td><td>Depends on application code</td></tr>
  <tr><td>Best fit</td><td>Transactional systems, reporting, evolving requirements</td><td>Horizontal scale, simple access patterns, semi-structured payloads</td></tr>
</table>
<p>For a production DBA the practical rule: <strong>start relational until you have a measured reason not to</strong>. Most “scale” problems are solved by indexing, partitioning, or one more read replica long before the relational model itself is the bottleneck.</p>
`
    },
    {
      h: "Why this matters to a DBA",
      html: `
<p>Every core DBA duty is a consequence of the relational model: keys and constraints define what “correct data” means; joins define which indexes matter; the log and ACID define what backup and recovery must protect. When a query is slow, you reason about relations and statistics; when data is wrong, you reason about constraints and transactions.</p>
<p><strong>Common pitfalls:</strong> disabling foreign keys “just for the import” and never re-enabling them; letting the ORM create its own schema that ignores the model; assuming a non-relational store will deliver relational guarantees “eventually”; and re-introducing nesting by stuffing JSON blobs into columns that should be related rows — trading the DBMS's integrity engine for application code that nobody tests.</p>
`
    }
  ],

  scenario: {
    title: "The import that left 4,000 orders pointing at customers that never existed",
    html: `
<p>An ERP integration loaded orders nightly. One evening, foreign keys on the Orders table were disabled to speed up a migration, and the load ran with a customer mapping file that was two weeks stale. By morning, 4,000 orders referenced customer IDs that did not exist — reports showed revenue for phantom customers, and the accounts receivable team started dunning the wrong companies.</p>
<p>The DBA diagnosed it by re-enabling the keys in a validation pass: <code>DBCC CHECKCONSTRAINTS</code> listed every violating row. Resolution: matched the stale mapping against the source system, corrected customer_id on the affected rows, then re-enabled the constraint with <code>WITH CHECK</code> to prove the table was clean. Prevention: the import job was rewritten to validate referential integrity inside the same transaction, and disabling constraints for a load now requires a documented exception with an automatic re-enable step. <strong>The constraint had been switched off; the need for it had not.</strong></p>
`
  },

  interview: [
    {
      q: "What does “relational” actually mean?",
      a: "Data is stored in relations (tables) and related by matching key values rather than by nesting or physical pointers — which lets SQL express relationships declaratively and lets the physical storage change without breaking applications."
    },
    {
      q: "What is the difference between the relational model and an RDBMS?",
      a: "The relational model is the theory: tables, keys, and set-based operations. An RDBMS is the software that implements it — parsing SQL, enforcing integrity, managing transactions and storage. SQL Server is an RDBMS; the relational model is the idea it is built on."
    },
    {
      q: "When would you choose a non-relational store over a relational one?",
      a: "When the data is genuinely schemaless or hierarchical, access patterns are simple and known in advance, and horizontal write scale or flexible documents outweigh cross-entity transactions and central integrity. If you need multi-row ACID or many-to-many relationships with enforced rules, the relational model is still the right tool."
    }
  ],

  takeaways: [
    "Relations are tables, rows are tuples, columns are attributes — relationships are expressed by key values, not nesting",
    "The RDBMS implements the model: declarative SQL, integrity enforcement, ACID transactions, and storage optimisation",
    "Foreign keys make relationships the database's responsibility, not each application's",
    "Non-relational stores trade away schema rigidity or transactional guarantees — choose deliberately",
    "Almost every DBA duty — indexing, constraints, locking, recovery — follows from the relational model"
  ]
};
