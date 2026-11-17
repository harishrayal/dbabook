/* Practical content file — one JS file per practical lab.
   Rendered by assets/js/site.js on practicals/practical-01.html */

window.TOPIC = {
  id: "practical-01",
  title: "Database Fundamentals",

  lead: "The first hands-on lab: build a small relational database from scratch in SSMS — tables, keys, constraints, relationships, views, and stored procedures.",

  objectives: [
    "Create and configure a database in SSMS",
    "Design tables with primary keys, foreign keys, and constraints",
    "Insert, update, delete, and query data safely",
    "Build views and stored procedures over the schema",
    "Verify every object you created"
  ],

  sections: [
    {
      h: "Before you start",
      html: `
<p>You need a SQL Server instance (Developer or Express edition is fine) and SSMS or Azure Data Studio. Everything below runs on a local instance — nothing touches production.</p>
<p>Create a scratch database sized sanely so you also see file behaviour later in the roadmap:</p>
<pre><code class="language-sql">CREATE DATABASE RetailLab;
GO
USE RetailLab;
GO</code></pre>
<p><strong>Environment check</strong> — confirm you are on the right instance before any change, a habit that will save you in production:</p>
<pre><code class="language-sql">SELECT @@SERVERNAME  AS server_name,
       db_name()      AS current_database,
       getdate()      AS run_at;</code></pre>
`
    },
    {
      h: "The schema you will build",
      html: `
<p>A minimal retail model that exercises every fundamental concept:</p>
<div class="figure">
  <svg viewBox="0 0 720 260" role="img" aria-label="RetailLab schema diagram">
    <defs>
      <marker id="pk-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="30" y="40" width="200" height="90" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="130" y="66" text-anchor="middle" fill="var(--accent-strong)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">dbo.Customers</text>
    <text x="46" y="90" fill="var(--text)" font-size="12" font-family="Consolas, monospace">PK CustomerID</text>
    <text x="46" y="110" fill="var(--muted)" font-size="12" font-family="Consolas, monospace">Email UNIQUE</text>

    <rect x="270" y="40" width="180" height="90" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="360" y="66" text-anchor="middle" fill="var(--accent-strong)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">dbo.Orders</text>
    <text x="286" y="90" fill="var(--text)" font-size="12" font-family="Consolas, monospace">PK OrderID</text>
    <text x="286" y="110" fill="var(--muted)" font-size="12" font-family="Consolas, monospace">FK CustomerID</text>

    <rect x="490" y="40" width="200" height="90" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="590" y="66" text-anchor="middle" fill="var(--accent-strong)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">dbo.OrderItems</text>
    <text x="506" y="90" fill="var(--text)" font-size="12" font-family="Consolas, monospace">PK OrderItemID</text>
    <text x="506" y="110" fill="var(--muted)" font-size="12" font-family="Consolas, monospace">FK OrderID, ProductID</text>

    <rect x="490" y="180" width="200" height="66" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="590" y="206" text-anchor="middle" fill="var(--accent-strong)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">dbo.Products</text>
    <text x="506" y="228" fill="var(--muted)" font-size="12" font-family="Consolas, monospace">PK ProductID</text>

    <line x1="230" y1="85" x2="268" y2="85" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pk-arrow)"/>
    <line x1="450" y1="85" x2="488" y2="85" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pk-arrow)"/>
    <line x1="590" y1="130" x2="590" y2="178" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pk-arrow)"/>

    <text x="249" y="76" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">1:N</text>
    <text x="469" y="76" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">1:N</text>
    <text x="608" y="158" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">N:1</text>
  </svg>
  <div class="figcaption">Figure 1 — RetailLab: three tables covering one-to-many relationships in both directions.</div>
</div>
`
    },
    {
      h: "Concepts this lab proves",
      html: `
<table>
  <tr><th>Concept</th><th>Where you see it</th></tr>
  <tr><td>Primary key</td><td>Every table's identity column — unique and never NULL</td></tr>
  <tr><td>Foreign key</td><td>Orders.CustomerID → Customers: the database enforces the relationship</td></tr>
  <tr><td>Unique constraint</td><td>Customers.Email — duplicate prevention at the storage layer</td></tr>
  <tr><td>CHECK constraint</td><td>OrderItems.Quantity &gt; 0 — business rules close to the data</td></tr>
  <tr><td>DEFAULT constraint</td><td>Orders.OrderDate = SYSDATETIME()</td></tr>
  <tr><td>View</td><td>A stable interface for reports over joined tables</td></tr>
  <tr><td>Stored procedure</td><td>An encapsulated, parameterised operation (and a plan cache resident)</td></tr>
</table>
<p>Data type choices are part of design, not an afterthought. They determine storage width, index key size and whether a calculation is correct. Prefer <code>datetime2</code> over <code>datetime</code> for new work, <code>decimal</code> over <code>float</code> for money, and <code>nvarchar</code> sized to a realistic maximum rather than an arbitrary 255.</p>
`
    },
    {
      h: "Data types and the catalogue",
      html: `
<p>Every object you created is recorded in the system catalogue. Learning to read it directly — rather than relying only on SSMS dialogs — is the habit that turns a beginner into a DBA who can answer questions on any instance.</p>
<table>
  <tr><th>Catalogue view</th><th>Tells you</th><th>Typical use</th></tr>
  <tr><td>sys.tables</td><td>User tables and their properties</td><td>Inventory the schema</td></tr>
  <tr><td>sys.columns</td><td>Column names, types, nullability</td><td>Check a data type decision</td></tr>
  <tr><td>sys.foreign_keys</td><td>Relationship definitions</td><td>Prove a constraint exists</td></tr>
  <tr><td>sys.check_constraints</td><td>CHECK rule definitions</td><td>Verify a business rule</td></tr>
  <tr><td>sys.views</td><td>View definitions</td><td>List reporting interfaces</td></tr>
</table>
<pre><code class="language-sql">-- Inventory what you actually built
SELECT t.name AS table_name,
       c.name AS column_name,
       ty.name AS data_type,
       c.max_length,
       c.is_nullable
FROM   sys.tables t
JOIN   sys.columns c ON c.object_id = t.object_id
JOIN   sys.types ty ON ty.user_type_id = c.user_type_id
ORDER BY t.name, c.column_id;

-- Relationships and their enforcement
SELECT name, is_disabled, delete_referential_action_desc
FROM   sys.foreign_keys;

--CHECK constraints keep bad data out
SELECT name, definition
FROM   sys.check_constraints;</code></pre>
<div class="callout fact">
  <div class="callout-label">Tip</div>
  <p>SSMS generates its object trees from these same views. Querying them yourself gives you the same answer, works on any instance, and can be automated across a whole estate — something clicking through dialogs can never do.</p>
</div>
`
    }
  ],

  steps: [
    "Create the tables: <code>dbo.Customers</code>, <code>dbo.Orders</code>, <code>dbo.OrderItems</code>, <code>dbo.Products</code> with PRIMARY KEY columns and sensible data types (<code>int</code>, <code>nvarchar(100)</code>, <code>decimal(12,2)</code>, <code>datetime2</code>).",
    "Add a UNIQUE constraint on <code>Customers.Email</code> and a CHECK constraint on <code>OrderItems.Quantity &gt; 0</code>.",
    "Add foreign keys: <code>Orders.CustomerID → Customers</code>, <code>OrderItems.OrderID → Orders</code>, <code>OrderItems.ProductID → Products</code>.",
    "Insert sample data with a single script: 5 customers, 10 orders, 20 order items, 8 products.",
    "Prove the constraints: run an INSERT that violates the CHECK constraint, one that duplicates an email, and one orphaned foreign key — confirm each fails with a clear error.",
    "Write a SELECT joining all four tables to list every order line with customer name, product name, quantity, and line total.",
    "Practice DML: UPDATE a product price, DELETE one order item, then verify with SELECT — wrap changes in a transaction with <code>BEGIN TRAN … ROLLBACK</code> to leave data untouched.",
    "Create a view <code>vw_OrderSummary</code> returning order totals per customer, and SELECT from it.",
    "Create a stored procedure <code>usp_InsertOrder</code> parameterised by customer/products/quantity, execute it, and verify the new rows.",
    "Inventory your work: query <code>sys.tables</code>, <code>sys.foreign_keys</code>, <code>sys.check_constraints</code>, and <code>sys.views</code> to confirm every object exists."
  ],

  scenario: {
    title: "Why a CHECK constraint would have prevented a $40,000 refund bug",
    html: `
<p>A logistics client once imported shipment records with negative quantities through a bulk loader that bypassed application validation. The database had no CHECK constraint, so rows with <code>Quantity = -5</code> were stored — and a downstream pricing job treated them as refunds, issuing credits totalling $40,000 before anyone noticed.</p>
<p>One line would have stopped it: <code>CHECK (Quantity &gt; 0)</code>. The lesson: <strong>constraints are the last line of defence, and they belong in the database, not only in application code</strong> — applications get bypassed by imports, migrations, and ad-hoc scripts; the database never does.</p>
`
  },

  interview: [
    {
      q: "What is the difference between a PRIMARY KEY and a UNIQUE constraint?",
      a: "Both enforce uniqueness, but a table has exactly one PRIMARY KEY (cannot be NULL, clustered by default, drives the table's storage) while multiple UNIQUE constraints are allowed and each permits one NULL in SQL Server."
    },
    {
      q: "Where should business rules live — application or database?",
      a: "Both, but the database is the enforcement layer of last resort: CHECK constraints, FOREIGN KEYs and triggers protect data regardless of which application, import, or script writes to it."
    },
    {
      q: "Why use a stored procedure instead of ad-hoc SQL from the app?",
      a: "It centralises logic, enforces a permission boundary (EXECUTE only), avoids ad-hoc plan cache pollution, and gives a stable interface — the app's SQL can change without redeploying clients."
    }
  ],

  takeaways: [
    "Build the schema first: PK → columns/types → constraints → FKs → indexes → programmability",
    "Prove constraints work by deliberately violating them — never assume",
    "Wrap exploratory DML in BEGIN TRAN / ROLLBACK so labs are repeatable",
    "Views give stable reporting interfaces; procedures give secure, parameterised operations",
    "Always verify with catalog views (sys.tables, sys.foreign_keys) — trust but verify"
  ]
};
