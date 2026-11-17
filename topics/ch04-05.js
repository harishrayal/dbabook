/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch04-05.html */

window.TOPIC = {
  id: "ch04-05",
  title: "Relational Engine",

  lead: "The relational engine is the half of SQL Server that speaks T-SQL: it owns the query processor, the metadata catalogue, permission checking, constraints, and transaction semantics. Everything it does, it eventually asks the storage engine to perform on pages.",

  objectives: [
    "Define the relational engine and separate it from the storage engine",
    "Navigate the metadata catalogue: system tables, catalog views, DMVs",
    "Explain how permissions and ownership chaining are evaluated",
    "Describe constraint enforcement and transaction semantics at this layer"
  ],

  sections: [
    {
      h: "Where the relational engine sits",
      html: `
<p>Microsoft's documentation splits the Database Engine into the <strong>relational engine</strong> (also called the query processor), the <strong>storage engine</strong>, and the SQLOS services beneath both. The relational engine's job is everything that is <em>logical</em> rather than <em>physical</em>:</p>
<ul>
  <li><strong>Language services</strong> — parsing, algebrizing, and executing T-SQL, including procedural constructs (variables, loops, <code>TRY/CATCH</code>)</li>
  <li><strong>Query processor</strong> — optimization and plan execution (ch04-03)</li>
  <li><strong>Metadata</strong> — the catalog: every object, column, statistic, and dependency, served through system tables and catalog views</li>
  <li><strong>Security</strong> — login-to-user mapping, securable permission checks, ownership chaining</li>
  <li><strong>Transaction services</strong> — ACID semantics, isolation levels, savepoints, and the enlistment of the lock manager</li>
  <li><strong>Integrity</strong> — primary/foreign keys, unique constraints, check constraints, data-type enforcement</li>
</ul>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Relational engine boundary with storage engine">
    <defs>
      <marker id="a05-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
      <marker id="a05-arrow-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"/>
      </marker>
    </defs>

    <rect x="20" y="16" width="450" height="272" rx="14" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="36" y="42" fill="var(--accent-strong)" font-size="16" font-weight="700" font-family="Segoe UI, sans-serif">Relational engine — logical SQL Server</text>

    <rect x="36" y="58" width="200" height="64" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="136" y="82" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Query processor</text>
    <text x="136" y="104" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">parse · optimise · execute</text>

    <rect x="252" y="58" width="202" height="64" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="353" y="82" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Metadata catalogue</text>
    <text x="353" y="104" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">sys.tables · sys.columns · stats</text>

    <rect x="36" y="140" width="200" height="64" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="136" y="164" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Security</text>
    <text x="136" y="186" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">principals · permissions · chaining</text>

    <rect x="252" y="140" width="202" height="64" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="353" y="164" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Transactions &amp; integrity</text>
    <text x="353" y="186" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">ACID · isolation · constraints</text>

    <rect x="36" y="220" width="418" height="52" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="245" y="242" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Plan → row requests, lock requests, log records</text>
    <text x="245" y="262" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">the only conversation across the boundary</text>

    <line x1="500" y1="20" x2="500" y2="316" stroke="var(--border)" stroke-width="2" stroke-dasharray="6 6"/>
    <text x="512" y="34" fill="var(--muted)" font-size="11.5" font-style="italic" font-family="Segoe UI, sans-serif">engine boundary</text>

    <rect x="530" y="58" width="210" height="146" rx="14" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="635" y="86" text-anchor="middle" fill="var(--text)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Storage engine</text>
    <text x="635" y="114" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">access methods</text>
    <text x="635" y="136" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">buffer manager · pages</text>
    <text x="635" y="158" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">lock manager</text>
    <text x="635" y="180" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">log writer · recovery</text>

    <rect x="530" y="230" width="210" height="58" rx="10" fill="var(--surface)" stroke="var(--border)"/>
    <text x="635" y="254" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Data files · MDF / NDF / LDF</text>
    <text x="635" y="276" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">8 KB pages, sequential log</text>

    <line x1="472" y1="246" x2="528" y2="246" stroke="var(--accent)" stroke-width="1.8" marker-end="url(#a05-arrow-acc)"/>
    <line x1="635" y1="204" x2="635" y2="228" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#a05-arrow)"/>
    <line x1="635" y1="56" x2="635" y2="36" stroke="var(--muted)" stroke-width="1.4" stroke-dasharray="4 4"/>
    <line x1="635" y1="36" x2="456" y2="36" stroke="var(--muted)" stroke-width="1.4" stroke-dasharray="4 4" marker-end="url(#a05-arrow)"/>

    <text x="380" y="330" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Rows and results cross the boundary; nothing else does — the relational engine never issues file I/O itself.</text>
  </svg>
  <div class="figcaption">Figure 1 — The relational engine plans and validates; the storage engine performs physical work.</div>
</div>
`
    },
    {
      h: "Metadata: the catalogue that describes everything",
      html: `
<p>Every object in the database is a row in an internal system table. SQL Server exposes those tables as <strong>catalog views</strong> (<code>sys.*</code>), which is the supported, stable interface for both tools and DBAs:</p>
<table>
  <tr><th>Layer</th><th>Examples</th><th>Use it for</th></tr>
  <tr><td><strong>Catalog views</strong></td><td><code>sys.tables</code>, <code>sys.columns</code>, <code>sys.indexes</code>, <code>sys.foreign_keys</code></td><td>Schema definition, dependency audits, index reviews</td></tr>
  <tr><td><strong>Information schema</strong></td><td><code>INFORMATION_SCHEMA.TABLES</code></td><td>ANSI-standard compatibility (limited and slow)</td></tr>
  <tr><td><strong>System functions</strong></td><td><code>OBJECT_ID()</code>, <code>COL_LENGTH()</code>, <code>DB_NAME()</code></td><td>Single-value lookups inside T-SQL</td></tr>
  <tr><td><strong>Dynamic management views</strong></td><td><code>sys.dm_exec_*</code>, <code>sys.dm_os_*</code></td><td>Runtime state, not design (ch04-01 onwards)</td></tr>
</table>
<p>The catalog is also where the optimizer gets index definitions and where permission checks resolve securables — which is why a metadata operation (adding a column, disabling an index) immediately affects plans that reference the object.</p>
<pre><code class="language-sql">-- Index and constraint inventory for one table (SQL Server 2017+ for STRING_AGG)
SELECT i.name AS index_name, i.type_desc,
       i.is_unique, i.is_primary_key, i.fill_factor,
       STRING_AGG(c.name, N', ') WITHIN GROUP (ORDER BY ic.key_ordinal) AS key_columns
FROM   sys.indexes AS i
JOIN   sys.index_columns AS ic
       ON ic.object_id = i.object_id AND ic.index_id = i.index_id
JOIN   sys.columns AS c
       ON c.object_id = ic.object_id AND c.column_id = ic.column_id
WHERE  i.object_id = OBJECT_ID(N'dbo.Orders')
  AND  ic.is_included_column = 0
GROUP  BY i.name, i.type_desc, i.is_unique, i.is_primary_key, i.fill_factor
ORDER  BY i.name;</code></pre>
`
    },
    {
      h: "Security at the relational layer",
      html: `
<p>Security is evaluated in a strict order, and understanding it explains most “permission denied” mysteries:</p>
<ol>
  <li><strong>Authentication</strong> — the protocol layer and SQLOS validate the login (Windows/Kerberos, SQL authentication, Microsoft Entra)</li>
  <li><strong>User mapping</strong> — the login maps to a database user, possibly via a role or an Orphaned-User situation after a restore</li>
  <li><strong>Permission check</strong> — at parse/bind time the relational engine checks the securable (database, schema, object, column) against the user's effective permissions</li>
  <li><strong>Ownership chaining</strong> — if the executing principal lacks direct rights but owns (or the chain of owners match for) the next object, the check is skipped — this is why procedures can run with the caller's limited rights</li>
</ol>
<pre><code class="language-sql">-- Effective object permissions granted to this database's users
SELECT p.name AS principal_name, p.type_desc AS principal_type,
       permission_name, state_desc,
       SCHEMA_NAME(o.schema_id) + N'.' + o.name AS securable
FROM   sys.database_permissions AS dp
JOIN   sys.database_principals AS p ON p.principal_id = dp.grantee_principal_id
LEFT   JOIN sys.objects AS o ON o.object_id = dp.major_id
WHERE  dp.class = 1   -- object or column
ORDER  BY p.name, securable;</code></pre>
`
    },
    {
      h: "Integrity: constraints enforced by the engine",
      html: `
<p>Constraints are the relational engine's promise that data arriving through any path — application, SSMS, bulk insert — obeys the same rules:</p>
<table>
  <tr><th>Constraint</th><th>Enforces</th><th>Checked</th><th>Failure behaviour</th></tr>
  <tr><td><strong>PRIMARY KEY / UNIQUE</strong></td><td>Key uniqueness, NULL rules</td><td>Every insert/update, before the row is accepted</td><td>Statement fails with an error</td></tr>
  <tr><td><strong>FOREIGN KEY</strong></td><td>Referential integrity to a parent row</td><td>Statement level, immediately (SQL Server has no deferred FKs)</td><td>Statement fails; can be disabled with NOCHECK</td></tr>
  <tr><td><strong>CHECK</strong></td><td>Boolean predicate on column values</td><td>Row level on insert/update</td><td>Statement fails</td></tr>
  <tr><td><strong>NOT NULL / DEFAULT</strong></td><td>Presence and fallback values</td><td>Row level</td><td>Statement fails / default applied</td></tr>
</table>
<p>Two operational traps: a foreign key added <code>WITH NOCHECK</code> is <em>trusted</em> only after an <code>ALTER TABLE … WITH CHECK CHECK CONSTRAINT</code> — an untrusted constraint makes the optimizer disable join elimination and suboptimal plans. And because SQL Server checks FKs immediately, disabling them during a bulk load is common — forgetting to re-enable them is how orphaned rows reach production.</p>
`
    },
    {
      h: "Transaction semantics and the hand-off",
      html: `
<p>The relational engine implements ACID from the user's point of view: it decides transaction boundaries, isolation levels, and what a rollback must undo. The lock manager (storage side) enforces the concurrency rules the isolation level implies:</p>
<table>
  <tr><th>Isolation level</th><th>Reads see</th><th>Blocking of writers</th><th>Mechanism</th></tr>
  <tr><td>READ UNCOMMITTED</td><td>Dirty rows</td><td>None</td><td>Locks not taken (NOLOCK)</td></tr>
  <tr><td>READ COMMITTED (default)</td><td>Committed-at-statement-time</td><td>Writers block readers briefly</td><td>Shared locks per read</td></tr>
  <tr><td>REPEATABLE READ</td><td>Stable rows for the transaction</td><td>Yes, until commit</td><td>Shared locks held</td></tr>
  <tr><td>SERIALIZABLE</td><td>Phantom-free snapshot of ranges</td><td>Yes, range locks</td><td>Range locks / key-range protection</td></tr>
  <tr><td>SNAPSHOT</td><td>Transaction-start version</td><td>No (readers never block)</td><td>Tempdb version store (RCSI)</td></tr>
</table>
<p>Across the boundary, a simple contract holds: the relational engine submits <em>row requests</em> (seek, fetch, insert, delete), <em>lock requests</em>, and <em>log records</em>; the storage engine returns rows and status. It never asks for “file 4, offset 917” — physical addressing is the storage engine's private business.</p>
`
    },
    {
      h: "Trusting your constraints",
      html: `
<p>A quick health check every DBA should run after any restore, index surgery, or bulk load with constraints disabled:</p>
<pre><code class="language-sql">-- Foreign keys that are disabled or untrusted (cannot be relied on)
SELECT o.name AS table_name, fk.name AS constraint_name,
       fk.is_disabled, fk.is_not_trusted, fk.is_not_for_replication,
       CASE WHEN fk.is_not_trusted = 1 AND fk.is_disabled = 0
            THEN N'ENABLED BUT UNTRUSTED' ELSE N'ok' END AS status
FROM   sys.foreign_keys AS fk
JOIN   sys.objects AS o ON o.object_id = fk.parent_object_id
WHERE  fk.is_disabled = 1 OR fk.is_not_trusted = 1
ORDER  BY status, o.name;</code></pre>
<p>An “enabled but untrusted” foreign key still rejects new violations — but the optimizer no longer trusts it for query simplification, and <code>DBCC CHECKCONSTRAINTS</code> is the only way to prove existing data complies. Treat any non-“ok” row as a data-integrity debt with a scheduled repayment.</p>
`
    }
  ],

  scenario: {
    title: "Orphaned order rows appeared after a “temporary” FK disable",
    html: `
<p>A data-migration job had disabled foreign keys on <code>dbo.OrderLines</code> to speed up a bulk load. It completed on Tuesday. Nobody re-enabled the constraints. By Thursday, a refund workflow was matching lines to orders that no longer existed, and finance found 1,240 order lines with no parent order.</p>
<p>The DBA's first step was diagnosis, not repair: <code>sys.foreign_keys</code> showed <code>is_disabled = 1</code> on two keys, and a <code>LEFT JOIN</code> against <code>dbo.Orders</code> quantified the orphans. Resolution required a business decision: quarantine the 1,240 lines into a review table, fix the true bad lines with the application team, then run <code>ALTER TABLE … WITH CHECK CHECK CONSTRAINT ALL</code> to prove integrity and re-enable protection.</p>
<p>Prevention: constraint disable/enable now lives in a single job step with a guaranteed re-enable in the same transaction scope, monitoring alerts on <code>is_disabled = 1</code> or <code>is_not_trusted = 1</code>, and the migration checklist requires a pre/post constraint report attached to the change record.</p>
`
  },

  interview: [
    {
      q: "What is the difference between the relational engine and the storage engine?",
      a: "The relational engine handles everything logical — T-SQL parsing and execution, the query processor, metadata, permission checks, constraints, and transaction semantics. The storage engine handles everything physical — heaps and b-trees, page I/O and the buffer pool, locks, allocation, and the log. They communicate only through row requests, lock requests, and log records."
    },
    {
      q: "When are foreign key constraints checked in SQL Server?",
      a: "Immediately at statement level — SQL Server does not support deferred constraint checking like some other engines. A violating statement fails and rolls back. Constraints can be disabled with NOCHECK for loads, but then they are untrusted until you run ALTER TABLE WITH CHECK CHECK CONSTRAINT, and the optimizer will not use them for join elimination."
    },
    {
      q: "A procedure fails with a permission error for one user but works for another. What is going on?",
      a: "Check the permission chain: authentication, database user mapping, effective permissions on the securable, and ownership chaining. If the procedure's owner matches the next object's owner, intermediate checks are skipped — so ownership design, not grant sprawl, usually explains the difference. sys.database_permissions shows what is actually granted."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “Microsoft's documentation splits the Database Engine into the _____ (also called the query processor), the storage engine, and the SQLOS services beneath both.”",
      "options": [
        "Security",
        "relational engine",
        "Metadata"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Microsoft's documentation splits the Database Engine into the relational engine (also called the query processor), the storage engine, and the SQLOS services beneath both. The relational engine's job is everything that is logical rather than physical:”"
    },
    {
      "question": "Complete the lesson statement: “Every object in the database is a row in an internal system table. SQL Server exposes those tables as _____ ( sys.* ), which is the supported, stable interface for both tools and DBAs:”",
      "options": [
        "catalog views",
        "Metadata",
        "Security"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Every object in the database is a row in an internal system table. SQL Server exposes those tables as catalog views ( sys.* ), which is the supported, stable interface for both tools and DBAs:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Security at the relational layer”?",
      "options": [
        "Constraints are the relational engine's promise that data arriving through any path — application, SSMS, bulk insert — obeys the same rules:",
        "trusted",
        "Security is evaluated in a strict order, and understanding it explains most “permission denied” mysteries:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Security is evaluated in a strict order, and understanding it explains most “permission denied” mysteries:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Integrity: constraints enforced by the engine”?",
      "options": [
        "row requests",
        "Constraints are the relational engine's promise that data arriving through any path — application, SSMS, bulk insert — obeys the same rules:",
        "The relational engine implements ACID from the user's point of view: it decides transaction boundaries, isolation levels, and what a rollback must undo."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Constraints are the relational engine's promise that data arriving through any path — application, SSMS, bulk insert — obeys the same rules:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Transaction semantics and the hand-off”?",
      "options": [
        "The relational engine implements ACID from the user's point of view: it decides transaction boundaries, isolation levels, and what a rollback must undo.",
        "trusted",
        "Statement fails with an error"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The relational engine implements ACID from the user's point of view: it decides transaction boundaries, isolation levels, and what a rollback must undo. The lock manager (storage side) enforces the concurrency rules the isolation level implies:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Trusting your constraints”?",
      "options": [
        "Statement fails with an error",
        "Statement fails; can be disabled with NOCHECK",
        "A quick health check every DBA should run after any restore, index surgery, or bulk load with constraints disabled:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A quick health check every DBA should run after any restore, index surgery, or bulk load with constraints disabled:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Metadata: the catalogue that describes everything”?",
      "options": [
        "Shared locks held",
        "The catalog is also where the optimizer gets index definitions and where permission checks resolve securables — which is why a metadata operation (adding a column, disabling an…",
        "Shared locks per read"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The catalog is also where the optimizer gets index definitions and where permission checks resolve securables — which is why a metadata operation (adding a column, disabling an index) immediately affects plans that reference the object.”"
    },
    {
      "question": "Complete the lesson statement: “Two operational traps: a foreign key added WITH NOCHECK is _____ only after an ALTER TABLE … WITH CHECK CHECK CONSTRAINT — an untrusted constraint makes the optimizer disable join elimination and suboptimal plans.”",
      "options": [
        "trusted",
        "System functions",
        "Dynamic management views"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Two operational traps: a foreign key added WITH NOCHECK is trusted only after an ALTER TABLE … WITH CHECK CHECK CONSTRAINT — an untrusted constraint makes the optimizer disable join elimination and suboptimal plans. And because SQL Server checks FKs immediately, disabling them during a bulk load is common — forgetting to re-enable them is how orphaned rows reach production.”"
    },
    {
      "question": "Complete the lesson statement: “Across the boundary, a simple contract holds: the relational engine submits _____ (seek, fetch, insert, delete), lock requests, and log records; the storage engine returns rows and status.”",
      "options": [
        "Dynamic management views",
        "Authentication",
        "row requests"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Across the boundary, a simple contract holds: the relational engine submits row requests (seek, fetch, insert, delete), lock requests, and log records; the storage engine returns rows and status. It never asks for “file 4, offset 917” — physical addressing is the storage engine's private business.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Trusting your constraints”?",
      "options": [
        "row requests",
        "An “enabled but untrusted” foreign key still rejects new violations — but the optimizer no longer trusts it for query simplification, and DBCC CHECKCONSTRAINTS is the only way to…",
        "The relational engine implements ACID from the user's point of view: it decides transaction boundaries, isolation levels, and what a rollback must undo."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “An “enabled but untrusted” foreign key still rejects new violations — but the optimizer no longer trusts it for query simplification, and DBCC CHECKCONSTRAINTS is the only way to prove existing data complies. Treat any non-“ok” row as a data-integrity debt with a scheduled repayment.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “Microsoft's documentation splits the Database Engine into the _____ (also called the query processor), the storage engine, and the SQLOS services beneath both.”",
      "options": [
        "Security",
        "relational engine",
        "Metadata"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Microsoft's documentation splits the Database Engine into the relational engine (also called the query processor), the storage engine, and the SQLOS services beneath both. The relational engine's job is everything that is logical rather than physical:”"
    },
    {
      "question": "Complete the lesson statement: “Every object in the database is a row in an internal system table. SQL Server exposes those tables as _____ ( sys.* ), which is the supported, stable interface for both tools and DBAs:”",
      "options": [
        "catalog views",
        "Metadata",
        "Security"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Every object in the database is a row in an internal system table. SQL Server exposes those tables as catalog views ( sys.* ), which is the supported, stable interface for both tools and DBAs:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Security at the relational layer”?",
      "options": [
        "Constraints are the relational engine's promise that data arriving through any path — application, SSMS, bulk insert — obeys the same rules:",
        "trusted",
        "Security is evaluated in a strict order, and understanding it explains most “permission denied” mysteries:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Security is evaluated in a strict order, and understanding it explains most “permission denied” mysteries:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Integrity: constraints enforced by the engine”?",
      "options": [
        "row requests",
        "Constraints are the relational engine's promise that data arriving through any path — application, SSMS, bulk insert — obeys the same rules:",
        "The relational engine implements ACID from the user's point of view: it decides transaction boundaries, isolation levels, and what a rollback must undo."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Constraints are the relational engine's promise that data arriving through any path — application, SSMS, bulk insert — obeys the same rules:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Transaction semantics and the hand-off”?",
      "options": [
        "The relational engine implements ACID from the user's point of view: it decides transaction boundaries, isolation levels, and what a rollback must undo.",
        "trusted",
        "Statement fails with an error"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The relational engine implements ACID from the user's point of view: it decides transaction boundaries, isolation levels, and what a rollback must undo. The lock manager (storage side) enforces the concurrency rules the isolation level implies:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Trusting your constraints”?",
      "options": [
        "Statement fails with an error",
        "Statement fails; can be disabled with NOCHECK",
        "A quick health check every DBA should run after any restore, index surgery, or bulk load with constraints disabled:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A quick health check every DBA should run after any restore, index surgery, or bulk load with constraints disabled:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Metadata: the catalogue that describes everything”?",
      "options": [
        "Shared locks held",
        "The catalog is also where the optimizer gets index definitions and where permission checks resolve securables — which is why a metadata operation (adding a column, disabling an…",
        "Shared locks per read"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The catalog is also where the optimizer gets index definitions and where permission checks resolve securables — which is why a metadata operation (adding a column, disabling an index) immediately affects plans that reference the object.”"
    },
    {
      "question": "Complete the lesson statement: “Two operational traps: a foreign key added WITH NOCHECK is _____ only after an ALTER TABLE … WITH CHECK CHECK CONSTRAINT — an untrusted constraint makes the optimizer disable join elimination and suboptimal plans.”",
      "options": [
        "trusted",
        "System functions",
        "Dynamic management views"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Two operational traps: a foreign key added WITH NOCHECK is trusted only after an ALTER TABLE … WITH CHECK CHECK CONSTRAINT — an untrusted constraint makes the optimizer disable join elimination and suboptimal plans. And because SQL Server checks FKs immediately, disabling them during a bulk load is common — forgetting to re-enable them is how orphaned rows reach production.”"
    },
    {
      "question": "Complete the lesson statement: “Across the boundary, a simple contract holds: the relational engine submits _____ (seek, fetch, insert, delete), lock requests, and log records; the storage engine returns rows and status.”",
      "options": [
        "Dynamic management views",
        "Authentication",
        "row requests"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Across the boundary, a simple contract holds: the relational engine submits row requests (seek, fetch, insert, delete), lock requests, and log records; the storage engine returns rows and status. It never asks for “file 4, offset 917” — physical addressing is the storage engine's private business.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Trusting your constraints”?",
      "options": [
        "row requests",
        "An “enabled but untrusted” foreign key still rejects new violations — but the optimizer no longer trusts it for query simplification, and DBCC CHECKCONSTRAINTS is the only way to…",
        "The relational engine implements ACID from the user's point of view: it decides transaction boundaries, isolation levels, and what a rollback must undo."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “An “enabled but untrusted” foreign key still rejects new violations — but the optimizer no longer trusts it for query simplification, and DBCC CHECKCONSTRAINTS is the only way to prove existing data complies. Treat any non-“ok” row as a data-integrity debt with a scheduled repayment.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “Microsoft's documentation splits the Database Engine into the _____ (also called the query processor), the storage engine, and the SQLOS services beneath both.”",
      "options": [
        "Security",
        "relational engine",
        "Metadata"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Microsoft's documentation splits the Database Engine into the relational engine (also called the query processor), the storage engine, and the SQLOS services beneath both. The relational engine's job is everything that is logical rather than physical:”"
    },
    {
      "question": "Complete the lesson statement: “Every object in the database is a row in an internal system table. SQL Server exposes those tables as _____ ( sys.* ), which is the supported, stable interface for both tools and DBAs:”",
      "options": [
        "catalog views",
        "Metadata",
        "Security"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Every object in the database is a row in an internal system table. SQL Server exposes those tables as catalog views ( sys.* ), which is the supported, stable interface for both tools and DBAs:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Security at the relational layer”?",
      "options": [
        "Constraints are the relational engine's promise that data arriving through any path — application, SSMS, bulk insert — obeys the same rules:",
        "trusted",
        "Security is evaluated in a strict order, and understanding it explains most “permission denied” mysteries:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Security is evaluated in a strict order, and understanding it explains most “permission denied” mysteries:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Integrity: constraints enforced by the engine”?",
      "options": [
        "row requests",
        "Constraints are the relational engine's promise that data arriving through any path — application, SSMS, bulk insert — obeys the same rules:",
        "The relational engine implements ACID from the user's point of view: it decides transaction boundaries, isolation levels, and what a rollback must undo."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Constraints are the relational engine's promise that data arriving through any path — application, SSMS, bulk insert — obeys the same rules:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Transaction semantics and the hand-off”?",
      "options": [
        "The relational engine implements ACID from the user's point of view: it decides transaction boundaries, isolation levels, and what a rollback must undo.",
        "trusted",
        "Statement fails with an error"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The relational engine implements ACID from the user's point of view: it decides transaction boundaries, isolation levels, and what a rollback must undo. The lock manager (storage side) enforces the concurrency rules the isolation level implies:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Trusting your constraints”?",
      "options": [
        "Statement fails with an error",
        "Statement fails; can be disabled with NOCHECK",
        "A quick health check every DBA should run after any restore, index surgery, or bulk load with constraints disabled:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A quick health check every DBA should run after any restore, index surgery, or bulk load with constraints disabled:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Metadata: the catalogue that describes everything”?",
      "options": [
        "Shared locks held",
        "The catalog is also where the optimizer gets index definitions and where permission checks resolve securables — which is why a metadata operation (adding a column, disabling an…",
        "Shared locks per read"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The catalog is also where the optimizer gets index definitions and where permission checks resolve securables — which is why a metadata operation (adding a column, disabling an index) immediately affects plans that reference the object.”"
    },
    {
      "question": "Complete the lesson statement: “Two operational traps: a foreign key added WITH NOCHECK is _____ only after an ALTER TABLE … WITH CHECK CHECK CONSTRAINT — an untrusted constraint makes the optimizer disable join elimination and suboptimal plans.”",
      "options": [
        "trusted",
        "System functions",
        "Dynamic management views"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Two operational traps: a foreign key added WITH NOCHECK is trusted only after an ALTER TABLE … WITH CHECK CHECK CONSTRAINT — an untrusted constraint makes the optimizer disable join elimination and suboptimal plans. And because SQL Server checks FKs immediately, disabling them during a bulk load is common — forgetting to re-enable them is how orphaned rows reach production.”"
    },
    {
      "question": "Complete the lesson statement: “Across the boundary, a simple contract holds: the relational engine submits _____ (seek, fetch, insert, delete), lock requests, and log records; the storage engine returns rows and status.”",
      "options": [
        "Dynamic management views",
        "Authentication",
        "row requests"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Across the boundary, a simple contract holds: the relational engine submits row requests (seek, fetch, insert, delete), lock requests, and log records; the storage engine returns rows and status. It never asks for “file 4, offset 917” — physical addressing is the storage engine's private business.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Trusting your constraints”?",
      "options": [
        "row requests",
        "An “enabled but untrusted” foreign key still rejects new violations — but the optimizer no longer trusts it for query simplification, and DBCC CHECKCONSTRAINTS is the only way to…",
        "The relational engine implements ACID from the user's point of view: it decides transaction boundaries, isolation levels, and what a rollback must undo."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “An “enabled but untrusted” foreign key still rejects new violations — but the optimizer no longer trusts it for query simplification, and DBCC CHECKCONSTRAINTS is the only way to prove existing data complies. Treat any non-“ok” row as a data-integrity debt with a scheduled repayment.”"
    }
  ],
  takeaways: [
    "Relational engine = language services, query processor, metadata, security, transactions, integrity — all logical concerns",
    "Catalog views (sys.*) are the supported window into metadata; DMVs show runtime state instead",
    "Permissions are checked at bind time, with ownership chaining allowing procedures to run on the caller's behalf",
    "Constraints are engine-enforced rules: immediate FK checks, no deferred mode, and untrusted FKs degrade optimisation",
    "Isolation levels decide what readers see and how hard writers block — enforced by the lock manager across the boundary",
    "The engine boundary contract: row requests, lock requests, log records — never physical file addressing"
  ]
};
