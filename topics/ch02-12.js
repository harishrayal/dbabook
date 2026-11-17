/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch02-12.html */

window.TOPIC = {
  id: "ch02-12",
  title: "Functions and Triggers",

  lead: "Functions package reusable, side-effect-free logic; triggers run code you did not explicitly call — and both are powerful precisely because they hide in plain sight, which is why knowing when to use them (and when not to) matters in production.",

  objectives: [
    "Distinguish scalar, inline table-valued, and multi-statement functions",
    "Write an inline table-valued function that the optimiser can expand",
    "Explain AFTER and INSTEAD OF DML triggers and the inserted/deleted tables",
    "Diagnose trigger-driven performance and recursion problems",
    "Decide when a trigger is the right tool versus a constraint or procedure"
  ],

  sections: [
    {
      h: "Two tools, two jobs",
      html: `
<p><strong>Functions</strong> encapsulate logic that takes input and returns a value — no side effects, safe to use inside queries, deterministic when they should be. <strong>Triggers</strong> are procedures bound to a table or view that the engine runs automatically when a data change (or certain DDL) happens. One is called by you; the other is called by the database.</p>
<table>
  <tr><th>Aspect</th><th>Function</th><th>Trigger</th></tr>
  <tr><td>Invoked by</td><td>Your SQL — in SELECT, WHERE, computed columns</td><td>The engine, on INSERT/UPDATE/DELETE (or DDL)</td></tr>
  <tr><td>May modify data?</td><td>Never — side effects are prohibited</td><td>Yes — that is usually its purpose</td></tr>
  <tr><td>Visible to the caller?</td><td>Yes — it is in the statement text</td><td>No — logic fires invisibly on the side</td></tr>
  <tr><td>Typical use</td><td>Formatting, calculation, reusable predicates</td><td>Auditing, guarding, cascading side effects</td></tr>
  <tr><td>Primary risk</td><td>Hidden row-by-row cost in a hot query</td><td>Hidden logic, blocking, recursion, surprises</td></tr>
</table>
<p>Both deserve the same rule: <strong>if a colleague reading the table definition cannot see the behaviour, document it</strong> — triggers especially, because nobody expects a <code>SELECT</code> to fire one.</p>
`
    },
    {
      h: "Functions: three flavours, very different costs",
      html: `
<ul>
  <li><strong>Scalar UDF</strong> — returns one value (<code>dbo.fn_Tax(amount)</code>). Historically executed row-by-row inside the plan; SQL Server 2019+ can inline eligible scalar UDFs, but older compatibility levels pay per row</li>
  <li><strong>Inline table-valued function (ITVF)</strong> — returns a table as a single <code>RETURN (SELECT …)</code>. The optimiser substitutes the body into the calling query like a macro: parameterised, reusable, and fast</li>
  <li><strong>Multi-statement TVF</strong> — declares a table variable and <code>INSERT</code>s into it. The plan treats it as a black box with an unknown row estimate — the classic source of catastrophic cardinality misestimates in hot paths</li>
</ul>
<pre><code class="language-sql">-- Inline TVF: a parameterised, reusable predicate over orders
CREATE OR ALTER FUNCTION sales.fn_CustomerTotals (@since date)
RETURNS TABLE
AS
RETURN
(
    SELECT o.customer_id,
           count(*)           AS order_count,
           sum(o.total_amount) AS total_spend
    FROM   sales.Orders AS o
    WHERE  o.order_date &gt;= @since
    GROUP  BY o.customer_id
);

-- The optimiser expands the function body and joins it natively
SELECT c.customer_name,
       f.order_count,
       f.total_spend
FROM   sales.Customers AS c
CROSS  APPLY sales.fn_CustomerTotals ('2026-01-01') AS f
WHERE  f.total_spend &gt; 10000
ORDER  BY f.total_spend DESC;</code></pre>
<p>Write functions for the optimiser: inline TVFs with set-based bodies — never cursors, never multi-statement bodies — in anything on a critical read path. Prefer a view when there is no parameter; prefer a procedure when the logic returns nothing.</p>
`
    },
    {
      h: "Triggers: the shadow tables",
      html: `
<p>A DML trigger does not see the table directly — it sees two special in-memory result sets: <strong>deleted</strong> (the rows as they were before an UPDATE/DELETE) and <strong>inserted</strong> (the rows as they are after an INSERT/UPDATE). Joining them gives you exactly what changed, set by set — one row per affected row, <em>inside the same statement and transaction</em>.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="DML trigger firing flow">
    <defs>
      <marker id="tg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="230" y="14" width="300" height="54" rx="10" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="380" y="37" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">DML statement</text>
    <text x="380" y="57" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">UPDATE sales.Orders SET total = …</text>

    <rect x="180" y="96" width="400" height="82" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="380" y="120" text-anchor="middle" fill="var(--accent-strong)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Shadow tables for this statement</text>

    <rect x="196" y="132" width="182" height="34" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="287" y="154" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">deleted — rows before</text>

    <rect x="392" y="132" width="172" height="34" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="478" y="154" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">inserted — rows after</text>

    <rect x="60" y="216" width="300" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="210" y="240" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">AFTER trigger</text>
    <text x="210" y="261" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">runs once the change is written — audit, notify, cascade</text>

    <rect x="420" y="216" width="300" height="60" rx="10" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.8"/>
    <text x="570" y="240" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">INSTEAD OF trigger</text>
    <text x="570" y="261" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">replaces the statement entirely — guards and updatable views</text>

    <line x1="380" y1="68" x2="380" y2="94" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#tg-arrow)"/>
    <line x1="310" y1="178" x2="240" y2="214" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#tg-arrow)"/>
    <line x1="450" y1="178" x2="540" y2="214" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#tg-arrow)"/>

    <text x="380" y="306" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">One trigger invocation per statement — its DML runs set-based over inserted / deleted, not row by row.</text>
    <text x="380" y="328" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Triggers run inside the caller's transaction — a ROLLBACK inside the trigger undoes the original write.</text>
  </svg>
  <div class="figcaption">Figure 1 — The engine hands triggers before/after row sets; AFTER complements the write, INSTEAD OF replaces it.</div>
</div>
<p>An auditing trigger that records exactly what changed — set-based, as the engine intends:</p>
<pre><code class="language-sql">CREATE OR ALTER TRIGGER sales.trg_Orders_Audit
ON sales.Orders
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO audit.OrderChanges
        (order_id, old_total, new_total, changed_by, changed_utc)
    SELECT i.order_id,
           d.total_amount,
           i.total_amount,
           SUSER_SNAME(),
           sysutcdatetime()
    FROM   inserted  AS i
    JOIN   deleted   AS d ON d.order_id = i.order_id
    WHERE  i.total_amount &lt;&gt; d.total_amount;   -- only real changes
END;
GO</code></pre>
`
    },
    {
      h: "AFTER versus INSTEAD OF",
      html: `
<table>
  <tr><th>Aspect</th><th>AFTER</th><th>INSTEAD OF</th></tr>
  <tr><td>When it runs</td><td>After the change has been written</td><td>In place of the statement — the original write never happens</td></tr>
  <tr><td>On tables</td><td>Yes (up to 32 nested levels)</td><td>Tables and views (views: the only way to make them writable)</td></tr>
  <tr><td>Can undo the write?</td><td>Yes — ROLLBACK inside the trigger reverses the statement</td><td>Not applicable — it decides what the statement means</td></tr>
  <tr><td>Classic use</td><td>Auditing, notifications, follow-on writes</td><td>Guarding rules, updatable views, steering inserts</td></tr>
  <tr><td>Failure mode</td><td>Adds hidden work to every write, blocks callers</td><td>The “successful” write silently did something else</td></tr>
</table>
<p>Triggers are <strong>not</strong> for enforcing what constraints already enforce: NOT NULL, CHECK, UNIQUE, and FOREIGN KEY are declarative, instant, and always-on. A trigger that “double-checks the data” is slower and easier to disable than the constraint it imitates.</p>
<p><strong>Common pitfalls:</strong> one trigger per table doing three jobs, none documented; row-by-row logic inside a set-based opportunity; forgetting triggers fire per <em>statement</em> — one UPDATE touching 100,000 rows runs the trigger once, but the trigger's joins to <code>inserted</code> need an index on the trigger table's key to stay fast; recursion (a trigger writing a table that fires itself — controlled by <code>RECURSIVE_TRIGGERS</code>, off by default); and <code>ORDER BY</code> or deferred name resolution mistakes that break the trigger at 3 AM, on the one write path nobody tests.</p>
`
    }
  ],

  scenario: {
    title: "A 300-row update took 94 seconds and locked the orders table",
    html: `
<p>A batch updated 300 orders to set a flag. It took 94 seconds and blocked every concurrent order insert. The statement itself was trivial — the time was inside <code>sales.trg_Orders_Status</code>: for each affected order it called a scalar function that queried a remote lookup table over a linked server to resolve a status label, then inserted an audit row one at a time. What looked like a five-line update became 300 sequential remote round-trips holding locks throughout, all inside the caller's transaction.</p>
<p>The DBA diagnosed it with <code>sys.dm_tran_locks</code> and the plan for the trigger's statements: the linked-server call dominated. Immediate fix: moved the label resolution out of the trigger — the audit table stores the status <em>code</em>, and a nightly job derives labels — then made the trigger strictly set-based against <code>inserted</code> with the audit table keyed on order_id. The same update dropped to under a second. Prevention: triggers now appear in each table's documentation, no trigger may make remote or function calls, and trigger code goes through the same plan review as any hot query. <strong>Trigger cost is invisible until someone counts the seconds it adds to every write.</strong></p>
`
  },

  interview: [
    {
      q: "What are the inserted and deleted tables in a trigger?",
      a: "In-memory result sets holding the rows affected by the statement: deleted contains pre-image rows for UPDATE and DELETE, inserted contains post-image rows for UPDATE and INSERT. They let the trigger process exactly what changed, once per statement, set-based."
    },
    {
      q: "When would you use a trigger instead of a constraint?",
      a: "You would not, for data correctness — constraints are declarative, fast, and always enforced. Triggers are for side effects constraints cannot express: audit trails, notifications, cascading business events. For guarding writes before they happen, INSTEAD OF triggers are the tool of last resort."
    },
    {
      q: "Scalar function or inline table-valued function — which do you put in a hot query, and why?",
      a: "An inline table-valued function: its body is expanded into the calling plan so the optimiser sees real tables, real predicates, and real estimates. A scalar UDF historically executes per row with serialisation between rows, degrading parallelism — a known source of CPU-bound slow queries, especially below compatibility level 150."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “_____ encapsulate logic that takes input and returns a value — no side effects, safe to use inside queries, deterministic when they should be.”",
      "options": [
        "Functions",
        "Yes — that is usually its purpose",
        "No — logic fires invisibly on the side"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Functions encapsulate logic that takes input and returns a value — no side effects, safe to use inside queries, deterministic when they should be. Triggers are procedures bound to a table or view that the engine runs automatically when a data change (or certain DDL) happens. One is called by you; the other is called by the database.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Functions: three flavours, very different costs”?",
      "options": [
        "Not applicable — it decides what the statement means",
        "Guarding rules, updatable views, steering inserts",
        "Write functions for the optimiser: inline TVFs with set-based bodies — never cursors, never multi-statement bodies — in anything on a critical read path."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Write functions for the optimiser: inline TVFs with set-based bodies — never cursors, never multi-statement bodies — in anything on a critical read path. Prefer a view when there is no parameter; prefer a procedure when the logic returns nothing.”"
    },
    {
      "question": "Complete the lesson statement: “A DML trigger does not see the table directly — it sees two special in-memory result sets: _____ (the rows as they were before an UPDATE/DELETE) and inserted (the rows as they are after an INSERT/UPDATE).”",
      "options": [
        "Hidden logic, blocking, recursion, surprises",
        "deleted",
        "Auditing, guarding, cascading side effects"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A DML trigger does not see the table directly — it sees two special in-memory result sets: deleted (the rows as they were before an UPDATE/DELETE) and inserted (the rows as they are after an INSERT/UPDATE). Joining them gives you exactly what changed, set by set — one row per affected row, inside the same statement and transaction.”"
    },
    {
      "question": "Complete the lesson statement: “Triggers are _____ for enforcing what constraints already enforce: NOT NULL, CHECK, UNIQUE, and FOREIGN KEY are declarative, instant, and always-on.”",
      "options": [
        "not",
        "Hidden logic, blocking, recursion, surprises",
        "Write functions for the optimiser: inline TVFs with set-based bodies — never cursors, never multi-statement bodies — in anything on a critical read path."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Triggers are not for enforcing what constraints already enforce: NOT NULL, CHECK, UNIQUE, and FOREIGN KEY are declarative, instant, and always-on. A trigger that “double-checks the data” is slower and easier to disable than the constraint it imitates.”"
    },
    {
      "question": "Complete the lesson statement: “Both deserve the same rule: _____ — triggers especially, because nobody expects a SELECT to fire one.”",
      "options": [
        "Write functions for the optimiser: inline TVFs with set-based bodies — never cursors, never multi-statement bodies — in anything on a critical read path.",
        "An auditing trigger that records exactly what changed — set-based, as the engine intends:",
        "if a colleague reading the table definition cannot see the behaviour, document it"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Both deserve the same rule: if a colleague reading the table definition cannot see the behaviour, document it — triggers especially, because nobody expects a SELECT to fire one.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Triggers: the shadow tables”?",
      "options": [
        "Inline table-valued function (ITVF)",
        "An auditing trigger that records exactly what changed — set-based, as the engine intends:",
        "Scalar UDF"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “An auditing trigger that records exactly what changed — set-based, as the engine intends:”"
    },
    {
      "question": "Complete the lesson statement: “_____ one trigger per table doing three jobs, none documented; row-by-row logic inside a set-based opportunity; forgetting triggers fire per…”",
      "options": [
        "Common pitfalls:",
        "In place of the statement — the original write never happens",
        "Tables and views (views: the only way to make them writable)"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Common pitfalls: one trigger per table doing three jobs, none documented; row-by-row logic inside a set-based opportunity; forgetting triggers fire per statement — one UPDATE touching 100,000 rows runs the trigger once, but the trigger's joins to inserted need an index on the trigger table's key to stay fast; recursion (a trigger writing a table that fires itself — controlled by RECURSIVE_TRIGGERS, off by default); and ORDER BY or deferred name resolution mistakes that break the trigger at 3 AM, on the one write path nobody tests.”"
    },
    {
      "question": "In the “Two tools, two jobs” table, what is listed for “Invoked by” under “Trigger”?",
      "options": [
        "Multi-statement TVF",
        "inserted",
        "The engine, on INSERT/UPDATE/DELETE (or DDL)"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “Invoked by” as “The engine, on INSERT/UPDATE/DELETE (or DDL)”."
    },
    {
      "question": "In the “AFTER versus INSTEAD OF” table, what is listed for “When it runs” under “INSTEAD OF”?",
      "options": [
        "inside the same statement and transaction",
        "In place of the statement — the original write never happens",
        "inserted"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “When it runs” as “In place of the statement — the original write never happens”."
    },
    {
      "question": "In the “Two tools, two jobs” table, what is listed for “May modify data?” under “Trigger”?",
      "options": [
        "Yes — that is usually its purpose",
        "inside the same statement and transaction",
        "statement"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “May modify data?” as “Yes — that is usually its purpose”."
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “_____ encapsulate logic that takes input and returns a value — no side effects, safe to use inside queries, deterministic when they should be.”",
      "options": [
        "Functions",
        "Yes — that is usually its purpose",
        "No — logic fires invisibly on the side"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Functions encapsulate logic that takes input and returns a value — no side effects, safe to use inside queries, deterministic when they should be. Triggers are procedures bound to a table or view that the engine runs automatically when a data change (or certain DDL) happens. One is called by you; the other is called by the database.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Functions: three flavours, very different costs”?",
      "options": [
        "Not applicable — it decides what the statement means",
        "Guarding rules, updatable views, steering inserts",
        "Write functions for the optimiser: inline TVFs with set-based bodies — never cursors, never multi-statement bodies — in anything on a critical read path."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Write functions for the optimiser: inline TVFs with set-based bodies — never cursors, never multi-statement bodies — in anything on a critical read path. Prefer a view when there is no parameter; prefer a procedure when the logic returns nothing.”"
    },
    {
      "question": "Complete the lesson statement: “A DML trigger does not see the table directly — it sees two special in-memory result sets: _____ (the rows as they were before an UPDATE/DELETE) and inserted (the rows as they are after an INSERT/UPDATE).”",
      "options": [
        "Hidden logic, blocking, recursion, surprises",
        "deleted",
        "Auditing, guarding, cascading side effects"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A DML trigger does not see the table directly — it sees two special in-memory result sets: deleted (the rows as they were before an UPDATE/DELETE) and inserted (the rows as they are after an INSERT/UPDATE). Joining them gives you exactly what changed, set by set — one row per affected row, inside the same statement and transaction.”"
    },
    {
      "question": "Complete the lesson statement: “Triggers are _____ for enforcing what constraints already enforce: NOT NULL, CHECK, UNIQUE, and FOREIGN KEY are declarative, instant, and always-on.”",
      "options": [
        "not",
        "Hidden logic, blocking, recursion, surprises",
        "Write functions for the optimiser: inline TVFs with set-based bodies — never cursors, never multi-statement bodies — in anything on a critical read path."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Triggers are not for enforcing what constraints already enforce: NOT NULL, CHECK, UNIQUE, and FOREIGN KEY are declarative, instant, and always-on. A trigger that “double-checks the data” is slower and easier to disable than the constraint it imitates.”"
    },
    {
      "question": "Complete the lesson statement: “Both deserve the same rule: _____ — triggers especially, because nobody expects a SELECT to fire one.”",
      "options": [
        "Write functions for the optimiser: inline TVFs with set-based bodies — never cursors, never multi-statement bodies — in anything on a critical read path.",
        "An auditing trigger that records exactly what changed — set-based, as the engine intends:",
        "if a colleague reading the table definition cannot see the behaviour, document it"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Both deserve the same rule: if a colleague reading the table definition cannot see the behaviour, document it — triggers especially, because nobody expects a SELECT to fire one.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Triggers: the shadow tables”?",
      "options": [
        "Inline table-valued function (ITVF)",
        "An auditing trigger that records exactly what changed — set-based, as the engine intends:",
        "Scalar UDF"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “An auditing trigger that records exactly what changed — set-based, as the engine intends:”"
    },
    {
      "question": "Complete the lesson statement: “_____ one trigger per table doing three jobs, none documented; row-by-row logic inside a set-based opportunity; forgetting triggers fire per…”",
      "options": [
        "Common pitfalls:",
        "In place of the statement — the original write never happens",
        "Tables and views (views: the only way to make them writable)"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Common pitfalls: one trigger per table doing three jobs, none documented; row-by-row logic inside a set-based opportunity; forgetting triggers fire per statement — one UPDATE touching 100,000 rows runs the trigger once, but the trigger's joins to inserted need an index on the trigger table's key to stay fast; recursion (a trigger writing a table that fires itself — controlled by RECURSIVE_TRIGGERS, off by default); and ORDER BY or deferred name resolution mistakes that break the trigger at 3 AM, on the one write path nobody tests.”"
    },
    {
      "question": "In the “Two tools, two jobs” table, what is listed for “Invoked by” under “Trigger”?",
      "options": [
        "Multi-statement TVF",
        "inserted",
        "The engine, on INSERT/UPDATE/DELETE (or DDL)"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “Invoked by” as “The engine, on INSERT/UPDATE/DELETE (or DDL)”."
    },
    {
      "question": "In the “AFTER versus INSTEAD OF” table, what is listed for “When it runs” under “INSTEAD OF”?",
      "options": [
        "inside the same statement and transaction",
        "In place of the statement — the original write never happens",
        "inserted"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “When it runs” as “In place of the statement — the original write never happens”."
    },
    {
      "question": "In the “Two tools, two jobs” table, what is listed for “May modify data?” under “Trigger”?",
      "options": [
        "Yes — that is usually its purpose",
        "inside the same statement and transaction",
        "statement"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “May modify data?” as “Yes — that is usually its purpose”."
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “_____ encapsulate logic that takes input and returns a value — no side effects, safe to use inside queries, deterministic when they should be.”",
      "options": [
        "Functions",
        "Yes — that is usually its purpose",
        "No — logic fires invisibly on the side"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Functions encapsulate logic that takes input and returns a value — no side effects, safe to use inside queries, deterministic when they should be. Triggers are procedures bound to a table or view that the engine runs automatically when a data change (or certain DDL) happens. One is called by you; the other is called by the database.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Functions: three flavours, very different costs”?",
      "options": [
        "Not applicable — it decides what the statement means",
        "Guarding rules, updatable views, steering inserts",
        "Write functions for the optimiser: inline TVFs with set-based bodies — never cursors, never multi-statement bodies — in anything on a critical read path."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Write functions for the optimiser: inline TVFs with set-based bodies — never cursors, never multi-statement bodies — in anything on a critical read path. Prefer a view when there is no parameter; prefer a procedure when the logic returns nothing.”"
    },
    {
      "question": "Complete the lesson statement: “A DML trigger does not see the table directly — it sees two special in-memory result sets: _____ (the rows as they were before an UPDATE/DELETE) and inserted (the rows as they are after an INSERT/UPDATE).”",
      "options": [
        "Hidden logic, blocking, recursion, surprises",
        "deleted",
        "Auditing, guarding, cascading side effects"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A DML trigger does not see the table directly — it sees two special in-memory result sets: deleted (the rows as they were before an UPDATE/DELETE) and inserted (the rows as they are after an INSERT/UPDATE). Joining them gives you exactly what changed, set by set — one row per affected row, inside the same statement and transaction.”"
    },
    {
      "question": "Complete the lesson statement: “Triggers are _____ for enforcing what constraints already enforce: NOT NULL, CHECK, UNIQUE, and FOREIGN KEY are declarative, instant, and always-on.”",
      "options": [
        "not",
        "Hidden logic, blocking, recursion, surprises",
        "Write functions for the optimiser: inline TVFs with set-based bodies — never cursors, never multi-statement bodies — in anything on a critical read path."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Triggers are not for enforcing what constraints already enforce: NOT NULL, CHECK, UNIQUE, and FOREIGN KEY are declarative, instant, and always-on. A trigger that “double-checks the data” is slower and easier to disable than the constraint it imitates.”"
    },
    {
      "question": "Complete the lesson statement: “Both deserve the same rule: _____ — triggers especially, because nobody expects a SELECT to fire one.”",
      "options": [
        "Write functions for the optimiser: inline TVFs with set-based bodies — never cursors, never multi-statement bodies — in anything on a critical read path.",
        "An auditing trigger that records exactly what changed — set-based, as the engine intends:",
        "if a colleague reading the table definition cannot see the behaviour, document it"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Both deserve the same rule: if a colleague reading the table definition cannot see the behaviour, document it — triggers especially, because nobody expects a SELECT to fire one.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Triggers: the shadow tables”?",
      "options": [
        "Inline table-valued function (ITVF)",
        "An auditing trigger that records exactly what changed — set-based, as the engine intends:",
        "Scalar UDF"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “An auditing trigger that records exactly what changed — set-based, as the engine intends:”"
    },
    {
      "question": "Complete the lesson statement: “_____ one trigger per table doing three jobs, none documented; row-by-row logic inside a set-based opportunity; forgetting triggers fire per…”",
      "options": [
        "Common pitfalls:",
        "In place of the statement — the original write never happens",
        "Tables and views (views: the only way to make them writable)"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Common pitfalls: one trigger per table doing three jobs, none documented; row-by-row logic inside a set-based opportunity; forgetting triggers fire per statement — one UPDATE touching 100,000 rows runs the trigger once, but the trigger's joins to inserted need an index on the trigger table's key to stay fast; recursion (a trigger writing a table that fires itself — controlled by RECURSIVE_TRIGGERS, off by default); and ORDER BY or deferred name resolution mistakes that break the trigger at 3 AM, on the one write path nobody tests.”"
    },
    {
      "question": "In the “Two tools, two jobs” table, what is listed for “Invoked by” under “Trigger”?",
      "options": [
        "Multi-statement TVF",
        "inserted",
        "The engine, on INSERT/UPDATE/DELETE (or DDL)"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “Invoked by” as “The engine, on INSERT/UPDATE/DELETE (or DDL)”."
    },
    {
      "question": "In the “AFTER versus INSTEAD OF” table, what is listed for “When it runs” under “INSTEAD OF”?",
      "options": [
        "inside the same statement and transaction",
        "In place of the statement — the original write never happens",
        "inserted"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “When it runs” as “In place of the statement — the original write never happens”."
    },
    {
      "question": "In the “Two tools, two jobs” table, what is listed for “May modify data?” under “Trigger”?",
      "options": [
        "Yes — that is usually its purpose",
        "inside the same statement and transaction",
        "statement"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “May modify data?” as “Yes — that is usually its purpose”."
    }
  ],
  takeaways: [
    "Functions return values and cannot modify data; triggers run on data changes and usually do",
    "Inline TVFs are expanded into the plan — the safe function type for hot queries; avoid multi-statement TVFs there",
    "Triggers operate on inserted/deleted row sets — set-based, once per statement, inside the caller's transaction",
    "AFTER complements a write (audit, cascade); INSTEAD OF replaces it (guards, writable views)",
    "Constraints already enforce correctness — triggers belong only on logic constraints cannot express, and they must be documented"
  ]
};
