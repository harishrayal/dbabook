/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch02-11.html */

window.TOPIC = {
  id: "ch02-11",
  title: "Views and Stored Procedures",

  lead: "Views and stored procedures are SQL Server's two oldest abstraction tools — a view is a named query over tables, a procedure is named, parameterised logic — and together they give applications a stable interface while the schema keeps evolving underneath.",

  objectives: [
    "Define a view and explain what it stores (and does not store)",
    "Recognise when an indexed view is justified",
    "Build parameterised stored procedures with proper error handling",
    "Apply the security and governance benefits of both objects",
    "Avoid the abstraction pitfalls that surface in production"
  ],

  sections: [
    {
      h: "Views: a query with a name",
      html: `
<p>A <strong>view</strong> is a stored <code>SELECT</code> statement registered in the catalog. Query <code>sales.vw_RecentOrders</code> and SQL Server expands it to the underlying query at run time — a view stores no data of its own (with one important exception, covered below). It behaves like a virtual table you can read, and — under conditions — even write through.</p>
<p>Why production teams create views:</p>
<ul>
  <li><strong>Simplification</strong> — a five-table join becomes one object name in reports and applications</li>
  <li><strong>Stability</strong> — the schema can change beneath the view; consumers keep selecting the same column names</li>
  <li><strong>Security</strong> — grant <code>SELECT</code> on a view that exposes only permitted columns, or filters rows by caller</li>
  <li><strong>Consistency</strong> — “revenue” is computed once, in one place, instead of in forty queries</li>
</ul>
<blockquote>A view is not a performance feature — it is a contract. It keeps consumers stable while the DBA reshapes the storage.</blockquote>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Views and stored procedures as an abstraction layer">
    <defs>
      <marker id="vs-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="40" y="20" width="200" height="54" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="140" y="44" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Web applications</text>
    <text x="140" y="64" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">SELECT … FROM vw_…</text>

    <rect x="280" y="20" width="200" height="54" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="44" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Reports / BI</text>
    <text x="380" y="64" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">clean, stable columns</text>

    <rect x="520" y="20" width="200" height="54" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="620" y="44" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Services</text>
    <text x="620" y="64" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">EXEC usp_… @params</text>

    <rect x="90" y="118" width="580" height="106" rx="14" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="146" text-anchor="middle" fill="var(--accent-strong)" font-size="16" font-weight="700" font-family="Segoe UI, sans-serif">Abstraction layer</text>

    <rect x="120" y="162" width="250" height="46" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="245" y="182" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">Views</text>
    <text x="245" y="200" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">named queries · column &amp; row security</text>

    <rect x="410" y="162" width="240" height="46" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="530" y="182" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">Stored procedures</text>
    <text x="530" y="200" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">named logic · parameters · EXECUTE only</text>

    <rect x="90" y="266" width="580" height="46" rx="12" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.8"/>
    <text x="380" y="294" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Tables · keys · indexes — may change behind the layer</text>

    <line x1="140" y1="74" x2="200" y2="116" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#vs-arrow)"/>
    <line x1="380" y1="74" x2="380" y2="116" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#vs-arrow)"/>
    <line x1="620" y1="74" x2="560" y2="116" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#vs-arrow)"/>
    <line x1="380" y1="224" x2="380" y2="264" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#vs-arrow)"/>

    <text x="740" y="336" text-anchor="end" fill="var(--muted)" font-size="11.5" font-style="italic" font-family="Segoe UI, sans-serif">Consumers bind to the names in the middle — the storage underneath stays yours to change.</text>
  </svg>
  <div class="figcaption">Figure 1 — Views and procedures isolate applications from physical schema changes.</div>
</div>
`
    },
    {
      h: "Views in practice, including the indexed exception",
      html: `
<p>A view that selects directly from base tables is a simple, expandable text substitute — performance is identical to inlining the query. The exception is the <strong>indexed view</strong> (a view with <code>SCHEMABINDING</code> whose result is materialised as a unique clustered index), which physically stores aggregated results and can accelerate heavy aggregate queries dramatically — but must obey strict rules (deterministic expressions, no outer joins or many built-ins) and is expensive to maintain on hot write tables.</p>
<pre><code class="language-sql">-- A standard view: contract over live tables
CREATE OR ALTER VIEW sales.vw_OrderSummary
AS
    SELECT o.order_id,
           o.order_date,
           c.customer_name,
           o.total_amount,
           o.status
    FROM   sales.Orders      AS o
    JOIN   sales.Customers   AS c ON c.customer_id = o.customer_id
    WHERE  o.order_date &gt;= DATEADD(month, -12, CAST(GETDATE() AS date));
GO

-- Consumers see a stable shape regardless of table changes behind it
SELECT customer_name, sum(total_amount) AS trailing_12m
FROM   sales.vw_OrderSummary
WHERE  status = 'PAID'
GROUP  BY customer_name;</code></pre>
<p><code>CREATE OR ALTER</code> keeps scripts idempotent — the same statement works on a fresh environment and an existing one, which is exactly what deployment pipelines need.</p>
`
    },
    {
      h: "Stored procedures: named, parameterised logic",
      html: `
<p>A <strong>stored procedure</strong> is a named T-SQL program stored in the database. Unlike a view, it <em>does</em> something: it can run multiple statements, accept input and output parameters, return status values, and be granted <code>EXECUTE</code> without granting anything else.</p>
<ul>
  <li><strong>Plan reuse</strong> — parameterised calls hit the plan cache instead of compiling a fresh ad-hoc plan per call</li>
  <li><strong>Security</strong> — grant execution of <code>usp_CreateOrder</code> while withholding direct table rights; the proc runs with its owner's permissions (<code>WITH EXECUTE AS</code>) or the caller's, deliberately chosen</li>
  <li><strong>Network efficiency</strong> — one call replaces a client-side script of statements</li>
  <li><strong>Governed change</strong> — business rules live in one auditable object, not scattered across services</li>
</ul>
<pre><code class="language-sql">CREATE OR ALTER PROCEDURE sales.usp_CreateOrder
    @customer_id int,
    @order_date  date,
    @total_amount decimal(12,2),
    @order_id    int OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (SELECT 1 FROM sales.Customers
                       WHERE customer_id = @customer_id)
            THROW 50001, 'Customer not found.', 1;

        INSERT INTO sales.Orders (customer_id, order_date, total_amount)
        VALUES (@customer_id, @order_date, @total_amount);

        SET @order_id = SCOPE_IDENTITY();

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT &gt; 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

DECLARE @new_id int;
EXEC sales.usp_CreateOrder
      @customer_id  = 552,
      @order_date   = '2026-01-15',
      @total_amount = 1240.00,
      @order_id     = @new_id OUTPUT;
SELECT @new_id AS new_order_id;</code></pre>
`
    },
    {
      h: "Choosing between them",
      html: `
<table>
  <tr><th>Concern</th><th>View</th><th>Stored procedure</th></tr>
  <tr><td>What it is</td><td>A saved SELECT — reads</td><td>A saved program — reads and writes</td></tr>
  <tr><td>Parameters</td><td>None — filtering happens in the caller's WHERE</td><td>Input and output parameters, defaults</td></tr>
  <tr><td>Output</td><td>A result set only</td><td>Result sets, output params, return codes</td></tr>
  <tr><td>Permission granted</td><td>SELECT (on the view)</td><td>EXECUTE only</td></tr>
  <tr><td>Best for</td><td>Stable read shapes, security trimming, reporting</td><td>Multi-step logic, controlled writes, API-style contracts</td></tr>
  <tr><td>Failure mode</td><td>Column changes behind it break consumers</td><td>Cached plan behaves badly for an outlier parameter</td></tr>
</table>
<p><strong>Common pitfalls:</strong> deep nesting — views built on views on views, where nobody can trace which columns come from where; granting table SELECT <em>and</em> view SELECT “temporarily”; procedures that mix business logic with maintenance tasks; using procedures as the only place logic exists while reports bypass them with raw table access; and creating a view per developer request until the catalog holds 400 near-duplicates.</p>
`
    }
  ],

  scenario: {
    title: "Five applications failed at 09:05 because a view was missing",
    html: `
<p>A developer renamed <code>Orders.customer_ref</code> to <code>Orders.customer_id</code> to tidy up before a release. SQL Server refused the rename while <code>sales.vw_OrderSummary</code> referenced the old name — so the developer dropped the view, renamed the column, and intended to recreate the view “later in the deploy”. The deploy step was skipped. At 09:05 five applications issued their first queries of the day and failed with error 208: object not found. Checkout fell back to a degraded mode; the reporting portal was blank.</p>
<p>The DBA restored service in twelve minutes: found the last known definition of the view in source control, recreated it with <code>CREATE OR ALTER VIEW</code>, verified column names matched the consumers' expectations, and confirmed the dependent queries ran. Prevention: all schema changes now go through one deployment tool that ships views and columns together (with dependency ordering), a pre-deploy check lists objects referenced but not included in the release, and a morning smoke test runs the five critical view queries on a five-minute schedule. <strong>The view was an interface — dropping it was an API break, and APIs do not get dropped “later”.</strong></p>
`
  },

  interview: [
    {
      q: "Does a view store data?",
      a: "A regular view stores nothing but its definition — querying it executes the underlying SELECT against the live tables. The exception is an indexed view, which materialises its result with a unique clustered index and physically stores it, paying write cost for read speed on heavy aggregates."
    },
    {
      q: "Why prefer stored procedures over ad-hoc SQL from the application?",
      a: "Parameterised procedures reuse cached plans instead of compiling per-call ad-hoc variants, reduce network traffic, and — most importantly — let you grant EXECUTE without granting table access, so business rules and writes pass through one auditable, governed object."
    },
    {
      q: "You find views nested three deep with dynamic column names. What do you do?",
      a: "Document and flatten deliberately: trace dependencies with sys.sql_expression_dependencies, merge the chain into single-level views over base tables where possible, and route changes through the same deployment process that broke the incident — the goal is one level of indirection that a human can still read."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is a stored SELECT statement registered in the catalog.”",
      "options": [
        "CREATE OR ALTER keeps scripts idempotent — the same statement works on a fresh environment and an existing one, which is exactly what deployment pipelines need.",
        "view",
        "and"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A view is a stored SELECT statement registered in the catalog. Query sales.vw_RecentOrders and SQL Server expands it to the underlying query at run time — a view stores no data of its own (with one important exception, covered below). It behaves like a virtual table you can read, and — under conditions — even write through.”"
    },
    {
      "question": "Complete the lesson statement: “The exception is the _____ (a view with SCHEMABINDING whose result is materialised as a unique clustered index), which physically stores aggregated results and can…”",
      "options": [
        "indexed view",
        "CREATE OR ALTER keeps scripts idempotent — the same statement works on a fresh environment and an existing one, which is exactly what deployment pipelines need.",
        "A saved program — reads and writes"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A view that selects directly from base tables is a simple, expandable text substitute — performance is identical to inlining the query. The exception is the indexed view (a view with SCHEMABINDING whose result is materialised as a unique clustered index), which physically stores aggregated results and can accelerate heavy aggregate queries dramatically — but must obey strict rules (deterministic expressions, no outer joins or many built-ins) and is expensive to maintain on hot write tables.”"
    },
    {
      "question": "Complete the lesson statement: “A _____ is a named T-SQL program stored in the database.”",
      "options": [
        "A saved program — reads and writes",
        "Input and output parameters, defaults",
        "stored procedure"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A stored procedure is a named T-SQL program stored in the database. Unlike a view, it does something: it can run multiple statements, accept input and output parameters, return status values, and be granted EXECUTE without granting anything else.”"
    },
    {
      "question": "Complete the lesson statement: “_____ deep nesting — views built on views on views, where nobody can trace which columns come from where; granting table SELECT and view SELECT…”",
      "options": [
        "Result sets, output params, return codes",
        "Common pitfalls:",
        "Input and output parameters, defaults"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Common pitfalls: deep nesting — views built on views on views, where nobody can trace which columns come from where; granting table SELECT and view SELECT “temporarily”; procedures that mix business logic with maintenance tasks; using procedures as the only place logic exists while reports bypass them with raw table access; and creating a view per developer request until the catalog holds 400 near-duplicates.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Views in practice, including the indexed exception”?",
      "options": [
        "CREATE OR ALTER keeps scripts idempotent — the same statement works on a fresh environment and an existing one, which is exactly what deployment pipelines need.",
        "Plan reuse",
        "Network efficiency"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “CREATE OR ALTER keeps scripts idempotent — the same statement works on a fresh environment and an existing one, which is exactly what deployment pipelines need.”"
    },
    {
      "question": "In the “Choosing between them” table, what is listed for “What it is” under “Stored procedure”?",
      "options": [
        "Network efficiency",
        "Governed change",
        "A saved program — reads and writes"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “What it is” as “A saved program — reads and writes”."
    },
    {
      "question": "In the “Choosing between them” table, what is listed for “Parameters” under “Stored procedure”?",
      "options": [
        "and",
        "Input and output parameters, defaults",
        "Governed change"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Parameters” as “Input and output parameters, defaults”."
    },
    {
      "question": "In the “Choosing between them” table, what is listed for “Output” under “Stored procedure”?",
      "options": [
        "Result sets, output params, return codes",
        "and",
        "A saved program — reads and writes"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Output” as “Result sets, output params, return codes”."
    },
    {
      "question": "In the “Choosing between them” table, what is listed for “Permission granted” under “Stored procedure”?",
      "options": [
        "A saved program — reads and writes",
        "Input and output parameters, defaults",
        "EXECUTE only"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “Permission granted” as “EXECUTE only”."
    },
    {
      "question": "In the “Choosing between them” table, what is listed for “Best for” under “Stored procedure”?",
      "options": [
        "Result sets, output params, return codes",
        "Multi-step logic, controlled writes, API-style contracts",
        "Input and output parameters, defaults"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Best for” as “Multi-step logic, controlled writes, API-style contracts”."
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is a stored SELECT statement registered in the catalog.”",
      "options": [
        "CREATE OR ALTER keeps scripts idempotent — the same statement works on a fresh environment and an existing one, which is exactly what deployment pipelines need.",
        "view",
        "and"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A view is a stored SELECT statement registered in the catalog. Query sales.vw_RecentOrders and SQL Server expands it to the underlying query at run time — a view stores no data of its own (with one important exception, covered below). It behaves like a virtual table you can read, and — under conditions — even write through.”"
    },
    {
      "question": "Complete the lesson statement: “The exception is the _____ (a view with SCHEMABINDING whose result is materialised as a unique clustered index), which physically stores aggregated results and can…”",
      "options": [
        "indexed view",
        "CREATE OR ALTER keeps scripts idempotent — the same statement works on a fresh environment and an existing one, which is exactly what deployment pipelines need.",
        "A saved program — reads and writes"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A view that selects directly from base tables is a simple, expandable text substitute — performance is identical to inlining the query. The exception is the indexed view (a view with SCHEMABINDING whose result is materialised as a unique clustered index), which physically stores aggregated results and can accelerate heavy aggregate queries dramatically — but must obey strict rules (deterministic expressions, no outer joins or many built-ins) and is expensive to maintain on hot write tables.”"
    },
    {
      "question": "Complete the lesson statement: “A _____ is a named T-SQL program stored in the database.”",
      "options": [
        "A saved program — reads and writes",
        "Input and output parameters, defaults",
        "stored procedure"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A stored procedure is a named T-SQL program stored in the database. Unlike a view, it does something: it can run multiple statements, accept input and output parameters, return status values, and be granted EXECUTE without granting anything else.”"
    },
    {
      "question": "Complete the lesson statement: “_____ deep nesting — views built on views on views, where nobody can trace which columns come from where; granting table SELECT and view SELECT…”",
      "options": [
        "Result sets, output params, return codes",
        "Common pitfalls:",
        "Input and output parameters, defaults"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Common pitfalls: deep nesting — views built on views on views, where nobody can trace which columns come from where; granting table SELECT and view SELECT “temporarily”; procedures that mix business logic with maintenance tasks; using procedures as the only place logic exists while reports bypass them with raw table access; and creating a view per developer request until the catalog holds 400 near-duplicates.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Views in practice, including the indexed exception”?",
      "options": [
        "CREATE OR ALTER keeps scripts idempotent — the same statement works on a fresh environment and an existing one, which is exactly what deployment pipelines need.",
        "Plan reuse",
        "Network efficiency"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “CREATE OR ALTER keeps scripts idempotent — the same statement works on a fresh environment and an existing one, which is exactly what deployment pipelines need.”"
    },
    {
      "question": "In the “Choosing between them” table, what is listed for “What it is” under “Stored procedure”?",
      "options": [
        "Network efficiency",
        "Governed change",
        "A saved program — reads and writes"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “What it is” as “A saved program — reads and writes”."
    },
    {
      "question": "In the “Choosing between them” table, what is listed for “Parameters” under “Stored procedure”?",
      "options": [
        "and",
        "Input and output parameters, defaults",
        "Governed change"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Parameters” as “Input and output parameters, defaults”."
    },
    {
      "question": "In the “Choosing between them” table, what is listed for “Output” under “Stored procedure”?",
      "options": [
        "Result sets, output params, return codes",
        "and",
        "A saved program — reads and writes"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Output” as “Result sets, output params, return codes”."
    },
    {
      "question": "In the “Choosing between them” table, what is listed for “Permission granted” under “Stored procedure”?",
      "options": [
        "A saved program — reads and writes",
        "Input and output parameters, defaults",
        "EXECUTE only"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “Permission granted” as “EXECUTE only”."
    },
    {
      "question": "In the “Choosing between them” table, what is listed for “Best for” under “Stored procedure”?",
      "options": [
        "Result sets, output params, return codes",
        "Multi-step logic, controlled writes, API-style contracts",
        "Input and output parameters, defaults"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Best for” as “Multi-step logic, controlled writes, API-style contracts”."
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is a stored SELECT statement registered in the catalog.”",
      "options": [
        "CREATE OR ALTER keeps scripts idempotent — the same statement works on a fresh environment and an existing one, which is exactly what deployment pipelines need.",
        "view",
        "and"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A view is a stored SELECT statement registered in the catalog. Query sales.vw_RecentOrders and SQL Server expands it to the underlying query at run time — a view stores no data of its own (with one important exception, covered below). It behaves like a virtual table you can read, and — under conditions — even write through.”"
    },
    {
      "question": "Complete the lesson statement: “The exception is the _____ (a view with SCHEMABINDING whose result is materialised as a unique clustered index), which physically stores aggregated results and can…”",
      "options": [
        "indexed view",
        "CREATE OR ALTER keeps scripts idempotent — the same statement works on a fresh environment and an existing one, which is exactly what deployment pipelines need.",
        "A saved program — reads and writes"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A view that selects directly from base tables is a simple, expandable text substitute — performance is identical to inlining the query. The exception is the indexed view (a view with SCHEMABINDING whose result is materialised as a unique clustered index), which physically stores aggregated results and can accelerate heavy aggregate queries dramatically — but must obey strict rules (deterministic expressions, no outer joins or many built-ins) and is expensive to maintain on hot write tables.”"
    },
    {
      "question": "Complete the lesson statement: “A _____ is a named T-SQL program stored in the database.”",
      "options": [
        "A saved program — reads and writes",
        "Input and output parameters, defaults",
        "stored procedure"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A stored procedure is a named T-SQL program stored in the database. Unlike a view, it does something: it can run multiple statements, accept input and output parameters, return status values, and be granted EXECUTE without granting anything else.”"
    },
    {
      "question": "Complete the lesson statement: “_____ deep nesting — views built on views on views, where nobody can trace which columns come from where; granting table SELECT and view SELECT…”",
      "options": [
        "Result sets, output params, return codes",
        "Common pitfalls:",
        "Input and output parameters, defaults"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Common pitfalls: deep nesting — views built on views on views, where nobody can trace which columns come from where; granting table SELECT and view SELECT “temporarily”; procedures that mix business logic with maintenance tasks; using procedures as the only place logic exists while reports bypass them with raw table access; and creating a view per developer request until the catalog holds 400 near-duplicates.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Views in practice, including the indexed exception”?",
      "options": [
        "CREATE OR ALTER keeps scripts idempotent — the same statement works on a fresh environment and an existing one, which is exactly what deployment pipelines need.",
        "Plan reuse",
        "Network efficiency"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “CREATE OR ALTER keeps scripts idempotent — the same statement works on a fresh environment and an existing one, which is exactly what deployment pipelines need.”"
    },
    {
      "question": "In the “Choosing between them” table, what is listed for “What it is” under “Stored procedure”?",
      "options": [
        "Network efficiency",
        "Governed change",
        "A saved program — reads and writes"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “What it is” as “A saved program — reads and writes”."
    },
    {
      "question": "In the “Choosing between them” table, what is listed for “Parameters” under “Stored procedure”?",
      "options": [
        "and",
        "Input and output parameters, defaults",
        "Governed change"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Parameters” as “Input and output parameters, defaults”."
    },
    {
      "question": "In the “Choosing between them” table, what is listed for “Output” under “Stored procedure”?",
      "options": [
        "Result sets, output params, return codes",
        "and",
        "A saved program — reads and writes"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Output” as “Result sets, output params, return codes”."
    },
    {
      "question": "In the “Choosing between them” table, what is listed for “Permission granted” under “Stored procedure”?",
      "options": [
        "A saved program — reads and writes",
        "Input and output parameters, defaults",
        "EXECUTE only"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “Permission granted” as “EXECUTE only”."
    },
    {
      "question": "In the “Choosing between them” table, what is listed for “Best for” under “Stored procedure”?",
      "options": [
        "Result sets, output params, return codes",
        "Multi-step logic, controlled writes, API-style contracts",
        "Input and output parameters, defaults"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Best for” as “Multi-step logic, controlled writes, API-style contracts”."
    }
  ],
  takeaways: [
    "A view is a stored SELECT — a contract over tables, not a copy of data (unless it is indexed)",
    "Views deliver simplification, stability, and column/row-level security for consumers",
    "Stored procedures provide parameterised plan reuse, EXECUTE-only security, and centralised write logic",
    "CREATE OR ALTER makes deployment scripts idempotent and re-runnable",
    "Treat views and procedures as interfaces: they ship together with any schema change, never 'later'"
  ]
};
