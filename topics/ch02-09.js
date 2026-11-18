/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch02-09.html */

window.TOPIC = {
  id: "ch02-09",
  title: "SQL Command Categories: DDL, DML, DQL, DCL, TCL",

  lead: "SQL statements can be grouped by purpose — structure, data, reads, permissions, and transactions — and these teaching categories help explain what a command changes and how it can be managed.",

  objectives: [
    "Classify SQL statements into DDL, DML, DQL, DCL, and TCL",
    "Predict which statements commit automatically and which can roll back",
    "Write a script that combines all five categories safely",
    "Apply permissions with GRANT, DENY, and REVOKE deliberately",
    "Avoid the autocommit traps that leave half-applied changes in production"
  ],

  sections: [
    {
      h: "Why the categories matter",
      html: `
<p>This lesson uses five common teaching categories for SQL statements. The terminology varies: for example, some references classify <code>SELECT</code> as DML rather than using a separate DQL category. The distinctions can still help reason about what a statement does:</p>
<ul>
  <li><strong>Who is allowed to run it?</strong> — DCL decides; a service account should read and write data (DML) but never alter structure (DDL)</li>
  <li><strong>What does it change?</strong> — DDL changes objects, DML changes data, a typical SELECT reads data, and TCL controls transaction state</li>
  <li><strong>Can it be undone?</strong> — depends on the transaction boundaries, which is exactly what TCL manages</li>
</ul>
<p>A script is not necessarily atomic because it <em>looks</em> like one unit. In SQL Server's default autocommit mode, each statement is its own transaction unless it runs inside an explicit or implicit transaction.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Five SQL command categories">
    <defs>
      <marker id="cat-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="280" y="135" width="200" height="70" rx="12" fill="var(--accent)"/>
    <text x="380" y="165" text-anchor="middle" fill="#ffffff" font-size="19" font-weight="700" font-family="Segoe UI, sans-serif">T-SQL script</text>
    <text x="380" y="188" text-anchor="middle" fill="#dbeafe" font-size="12" font-family="Segoe UI, sans-serif">which category changes what?</text>

    <rect x="30" y="20" width="200" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="130" y="45" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">DDL — structure</text>
    <text x="130" y="66" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">CREATE · ALTER · DROP · TRUNCATE</text>

    <rect x="530" y="20" width="200" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="630" y="45" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">DML — data</text>
    <text x="630" y="66" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">INSERT · UPDATE · DELETE · MERGE</text>

    <rect x="30" y="140" width="200" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="130" y="165" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">DQL — reads</text>
    <text x="130" y="186" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">SELECT</text>

    <rect x="530" y="140" width="200" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="630" y="165" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">DCL — access</text>
    <text x="630" y="186" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">GRANT · DENY · REVOKE</text>

    <rect x="285" y="255" width="190" height="60" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="380" y="280" text-anchor="middle" fill="var(--accent-strong)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">TCL — boundaries</text>
    <text x="380" y="301" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">BEGIN · COMMIT · ROLLBACK · SAVE TRAN</text>

    <line x1="230" y1="62" x2="284" y2="142" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cat-arrow)"/>
    <line x1="530" y1="62" x2="476" y2="142" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cat-arrow)"/>
    <line x1="230" y1="170" x2="278" y2="170" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cat-arrow)"/>
    <line x1="530" y1="170" x2="482" y2="170" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cat-arrow)"/>
    <line x1="380" y1="253" x2="380" y2="208" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cat-arrow)"/>

    <text x="745" y="335" text-anchor="end" fill="var(--muted)" font-size="11.5" font-style="italic" font-family="Segoe UI, sans-serif">Transactions group supported operations into a unit of work.</text>
  </svg>
  <div class="figcaption">Figure 1 — The five command categories and the verbs each one owns.</div>
</div>
`
    },
    {
      h: "DDL — defining the structure",
      html: `
<p><strong>Data Definition Language</strong> changes schema or database objects: examples include <code>CREATE</code>, <code>ALTER</code>, <code>DROP</code>, and <code>TRUNCATE</code>. SQL Server does not have a general <code>RENAME</code> statement; renaming is handled by procedures such as <code>sp_rename</code>. DDL changes catalog metadata or storage structures, and should be permissioned deliberately.</p>
<table>
  <tr><th>Category</th><th>Verbs</th><th>What it changes</th><th>Rollback?</th><th>Typical owner</th></tr>
  <tr><td><strong>DDL</strong></td><td>CREATE, ALTER, DROP, TRUNCATE</td><td>Schema objects</td><td>Many operations can be rolled back in a transaction; command-specific restrictions apply</td><td>DBA / deployment</td></tr>
  <tr><td><strong>DML</strong></td><td>INSERT, UPDATE, DELETE, MERGE</td><td>Rows of data</td><td>Yes — within a transaction</td><td>Application / ETL / DBA</td></tr>
  <tr><td><strong>DQL</strong></td><td>SELECT (teaching label)</td><td>Usually reads; SELECT INTO also creates and populates an object</td><td>Not applicable</td><td>Everyone with permission</td></tr>
  <tr><td><strong>DCL</strong></td><td>GRANT, DENY, REVOKE</td><td>Permissions</td><td>Yes — permission changes are transactional</td><td>DBA / security</td></tr>
  <tr><td><strong>TCL</strong></td><td>BEGIN TRAN, COMMIT, ROLLBACK, SAVE TRANSACTION</td><td>Transaction boundaries</td><td>Defines them</td><td>Application / DBA</td></tr>
</table>
<p>Two DDL details: <code>TRUNCATE TABLE</code> removes all rows, can be rolled back in a transaction, requires <code>ALTER</code> permission, and doesn't fire DELETE triggers; and adding a constraint with validation can fail if existing rows violate it. Check the command's transaction restrictions and verify the outcome before relying on a schema change.</p>
`
    },
    {
      h: "DML and DQL — changing and reading data",
      html: `
<p><strong>DML</strong> manipulates rows. The safe pattern for anything beyond a trivial change is: measure, wrap, verify.</p>
<ul>
  <li><strong>INSERT</strong> — add rows; prefer explicit column lists so table changes do not break scripts</li>
  <li><strong>UPDATE / DELETE</strong> — always run the same statement first as a <code>SELECT</code> with the identical <code>WHERE</code> clause and count the rows</li>
  <li><strong>MERGE</strong> — upserts in one statement; powerful, but its concurrency semantics have produced real bugs — test it under concurrent writers before trusting it</li>
</ul>
<p><strong>DQL</strong> — a teaching label used here for <code>SELECT</code> queries — generally reads data. A SELECT can still consume significant resources, and forms such as <code>SELECT INTO</code> also create and populate an object, so production reads should be permissioned and assessed for impact.</p>
<pre><code class="language-sql">-- DML: prove the target set first — same predicate, read only
SELECT count(*) AS rows_to_fix
FROM   sales.Orders
WHERE  status = 'PENDING'
  AND  total_amount = 0;

-- Same predicate, wrapped so the whole batch is one unit
SET XACT_ABORT ON;
BEGIN TRANSACTION;
    UPDATE sales.Orders
    SET    status = 'VOID'
    WHERE  status = 'PENDING'
      AND  total_amount = 0;

    -- DQL: verify inside the transaction before committing
    SELECT count(*) AS remaining
    FROM   sales.Orders
    WHERE  status = 'PENDING'
      AND  total_amount = 0;
COMMIT TRANSACTION;</code></pre>
`
    },
    {
      h: "DCL — who is allowed to do what",
      html: `
<p><strong>Data Control Language</strong> grants, denies, and revokes permissions on securables: databases, schemas, tables, procedures. A <code>DENY</code> generally overrides grants inherited through roles, though ownership chaining and privileged principals have exceptions.</p>
<ul>
  <li><strong>GRANT</strong> — allow a permission: <code>GRANT SELECT ON sales.Orders TO [app_readonly]</code></li>
  <li><strong>DENY</strong> — explicitly block a permission; use deliberately and account for ownership and privileged-role exceptions</li>
  <li><strong>REVOKE</strong> — remove a previous grant or deny, leaving inheritance to decide the outcome</li>
</ul>
<p>Production discipline: grant to <strong>roles</strong>, add logins to roles, and never grant object-level permissions to individual logins that will outlive the person who requested them. The audit question “who can modify this table?” should have a one-query answer from <code>sys.database_permissions</code>.</p>
`
    },
    {
      h: "TCL — making a script behave as one unit",
      html: `
<p><strong>Transaction Control Language</strong> defines transaction boundaries for operations that participate in the transaction. This example illustrates all five teaching categories; the DDL and permission change occur before the guarded data transaction:</p>
<pre><code class="language-sql">-- All five categories in one guarded script
CREATE TABLE staging.ImportAudit            -- DDL
(
    audit_id int IDENTITY(1,1) NOT NULL,
    batch_id int NOT NULL,
    row_count int NOT NULL,
    created_utc datetime2(3) NOT NULL
        CONSTRAINT DF_ImportAudit_created DEFAULT (sysutcdatetime()),
    CONSTRAINT PK_ImportAudit PRIMARY KEY CLUSTERED (audit_id)
);
GO

GRANT SELECT, INSERT ON staging.ImportAudit TO [etl_reader];   -- DCL

SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRANSACTION;                                          -- TCL
        UPDATE staging.StagingOrders                            -- DML
           SET status = 'READY'
         WHERE status = 'STAGED'
           AND batch_id = 20260115;

        INSERT INTO staging.ImportAudit (batch_id, row_count)   -- DML
        VALUES (20260115, @@ROWCOUNT);

        SELECT status, count(*) AS n                            -- DQL
          FROM staging.StagingOrders
         GROUP BY status;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT &gt; 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;</code></pre>
<p><strong>Common pitfalls:</strong> assuming a script is atomic without an explicit boundary; leaving a transaction open by forgetting <code>COMMIT</code>; using <code>SELECT</code> results as if they were validated DML targets; and assuming <code>GO</code> itself commits or rolls back a transaction. A batch separator ends a client-side batch, not necessarily the transaction. Also check which commands can run inside an explicit transaction.</p>
`
    }
  ],

  scenario: {
    title: "The 10 PM release script committed half of itself",
    html: `
<p>A deployment ran a long T-SQL script: an UPDATE to backfill a new column, then a CREATE INDEX, then a data migration insert, then a validation SELECT. At statement three the insert hit a constraint violation and SQL Management Studio reported an error — the developer stopped and called the DBA, assuming the script had undone itself. It had not: in the default autocommit mode each completed statement had committed independently. The table was now backfilled, the index existed, and part of the migration data was loaded while the rest was not.</p>
<p>The DBA triaged by category: DML damage was bounded (the backfill was idempotent), the partial insert was identified by comparing the migration source count against <code>count(*)</code>, and the remaining rows were loaded with a corrected script inside an explicit transaction with <code>XACT_ABORT ON</code>. The release completed at 11:40 PM. Prevention: every deployment script now opens with <code>SET XACT_ABORT ON</code> and <code>BEGIN TRANSACTION</code> (or is split into documented, idempotent batches), DML targets are proven with a matching <code>SELECT</code> first, and validation lives inside the transaction. <strong>Without a transaction boundary, a script is a queue of independent statements — not a unit of work.</strong></p>
`
  },

  interview: [
    {
      q: "Name the five SQL command categories and an example of each.",
      a: "DDL — CREATE TABLE (structure). DML — UPDATE (data). DQL — SELECT (reads). DCL — GRANT SELECT (permissions). TCL — BEGIN TRANSACTION / COMMIT / ROLLBACK (transaction boundaries)."
    },
    {
      q: "If a script fails halfway through, what has been saved?",
      a: "Whatever was outside an explicit transaction: in autocommit mode every successful statement committed independently, so all earlier statements persist. Only statements inside a transaction that is rolled back are undone — which is why risky scripts open a transaction and set XACT_ABORT ON so any error triggers rollback instead of a half-applied mess."
    },
    {
      q: "Can DDL be rolled back in SQL Server?",
      a: "Many SQL Server DDL operations, including CREATE TABLE and TRUNCATE TABLE, can participate in an explicit transaction and be rolled back. Some commands have transaction restrictions, so check the specific operation before grouping it with data changes."
    }
  ],

  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Why the categories matter”?",
      "options": [
        "Every SQL statement falls into one of five categories.",
        "Data Control Language",
        "roles"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Every SQL statement falls into one of five categories. The classification is not academic — it maps directly onto operational reality:”"
    },
    {
      "question": "Complete the lesson statement: “_____ changes the schema itself: CREATE, ALTER, DROP, TRUNCATE, and RENAME.”",
      "options": [
        "INSERT",
        "UPDATE / DELETE",
        "Data Definition Language"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Data Definition Language changes the schema itself: CREATE, ALTER, DROP, TRUNCATE, and RENAME. DDL modifies catalog metadata and, where relevant, storage structures — which is why DDL statements typically require elevated permissions (the ddl_admin habit of granting db_owner to everyone is a security smell).”"
    },
    {
      "question": "Complete the lesson statement: “_____ manipulates rows.”",
      "options": [
        "MERGE",
        "DML",
        "UPDATE / DELETE"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “DML manipulates rows. The safe pattern for anything beyond a trivial change is: measure, wrap, verify.”"
    },
    {
      "question": "Complete the lesson statement: “_____ grants, denies, and revokes permissions on securables: databases, schemas, tables, procedures.”",
      "options": [
        "Data Control Language",
        "UPDATE / DELETE",
        "MERGE"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Data Control Language grants, denies, and revokes permissions on securables: databases, schemas, tables, procedures. Three verbs with clear precedence — DENY always beats GRANT, and permissions can be direct or inherited through roles.”"
    },
    {
      "question": "Complete the lesson statement: “_____ defines the boundary inside which everything else succeeds or fails together.”",
      "options": [
        "MERGE",
        "Data Control Language",
        "Transaction Control Language"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Transaction Control Language defines the boundary inside which everything else succeeds or fails together. Put it together with the other categories into a production-shaped script:”"
    },
    {
      "question": "Complete the lesson statement: “The most expensive misunderstanding in junior SQL is assuming a script is atomic because it _____ like one unit.”",
      "options": [
        "DENY",
        "looks",
        "GRANT"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The most expensive misunderstanding in junior SQL is assuming a script is atomic because it looks like one unit. In SQL Server, without an explicit transaction, every statement commits on its own — called autocommit.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DDL — defining the structure”?",
      "options": [
        "Two DDL traps: TRUNCATE TABLE is DML's cousin — it empties a table quickly and is fully transactional, but it requires ALTER permission and fires no row-level triggers; and a…",
        "What does it change?",
        "Can it be undone?"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Two DDL traps: TRUNCATE TABLE is DML's cousin — it empties a table quickly and is fully transactional, but it requires ALTER permission and fires no row-level triggers; and a failed ALTER TABLE … ADD CONSTRAINT that must validate existing data will abort on the first bad row, leaving the constraint un-added while you assumed it was there.”"
    },
    {
      "question": "Complete the lesson statement: “_____ — SELECT — reads without changing anything, which is why it is the only statement you can run freely against production (with the right permissions and one eye on the plan cost).”",
      "options": [
        "REVOKE",
        "roles",
        "DQL"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “DQL — SELECT — reads without changing anything, which is why it is the only statement you can run freely against production (with the right permissions and one eye on the plan cost).”"
    },
    {
      "question": "Complete the lesson statement: “Production discipline: grant to _____, add logins to roles, and never grant object-level permissions to individual logins that will outlive the person who requested them.”",
      "options": [
        "Transaction Control Language",
        "roles",
        "REVOKE"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Production discipline: grant to roles, add logins to roles, and never grant object-level permissions to individual logins that will outlive the person who requested them. The audit question “who can modify this table?” should have a one-query answer from sys.database_permissions.”"
    },
    {
      "question": "Complete the lesson statement: “_____ assuming a script is atomic without BEGIN TRANSACTION (autocommit commits each statement); leaving a transaction open by forgetting COMMIT…”",
      "options": [
        "Common pitfalls:",
        "roles",
        "Transaction Control Language"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Common pitfalls: assuming a script is atomic without BEGIN TRANSACTION (autocommit commits each statement); leaving a transaction open by forgetting COMMIT — which holds locks and blocks others; using SELECT results as if they were validated DML targets; and running DDL in a window with GO batch separators, which ends the batch but does not end your transaction — plan where the boundary sits.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Why the categories matter”?",
      "options": [
        "Every SQL statement falls into one of five categories.",
        "Data Control Language",
        "roles"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Every SQL statement falls into one of five categories. The classification is not academic — it maps directly onto operational reality:”"
    },
    {
      "question": "Complete the lesson statement: “_____ changes the schema itself: CREATE, ALTER, DROP, TRUNCATE, and RENAME.”",
      "options": [
        "INSERT",
        "UPDATE / DELETE",
        "Data Definition Language"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Data Definition Language changes the schema itself: CREATE, ALTER, DROP, TRUNCATE, and RENAME. DDL modifies catalog metadata and, where relevant, storage structures — which is why DDL statements typically require elevated permissions (the ddl_admin habit of granting db_owner to everyone is a security smell).”"
    },
    {
      "question": "Complete the lesson statement: “_____ manipulates rows.”",
      "options": [
        "MERGE",
        "DML",
        "UPDATE / DELETE"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “DML manipulates rows. The safe pattern for anything beyond a trivial change is: measure, wrap, verify.”"
    },
    {
      "question": "Complete the lesson statement: “_____ grants, denies, and revokes permissions on securables: databases, schemas, tables, procedures.”",
      "options": [
        "Data Control Language",
        "UPDATE / DELETE",
        "MERGE"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Data Control Language grants, denies, and revokes permissions on securables: databases, schemas, tables, procedures. Three verbs with clear precedence — DENY always beats GRANT, and permissions can be direct or inherited through roles.”"
    },
    {
      "question": "Complete the lesson statement: “_____ defines the boundary inside which everything else succeeds or fails together.”",
      "options": [
        "MERGE",
        "Data Control Language",
        "Transaction Control Language"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Transaction Control Language defines the boundary inside which everything else succeeds or fails together. Put it together with the other categories into a production-shaped script:”"
    },
    {
      "question": "Complete the lesson statement: “The most expensive misunderstanding in junior SQL is assuming a script is atomic because it _____ like one unit.”",
      "options": [
        "DENY",
        "looks",
        "GRANT"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The most expensive misunderstanding in junior SQL is assuming a script is atomic because it looks like one unit. In SQL Server, without an explicit transaction, every statement commits on its own — called autocommit.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DDL — defining the structure”?",
      "options": [
        "Two DDL traps: TRUNCATE TABLE is DML's cousin — it empties a table quickly and is fully transactional, but it requires ALTER permission and fires no row-level triggers; and a…",
        "What does it change?",
        "Can it be undone?"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Two DDL traps: TRUNCATE TABLE is DML's cousin — it empties a table quickly and is fully transactional, but it requires ALTER permission and fires no row-level triggers; and a failed ALTER TABLE … ADD CONSTRAINT that must validate existing data will abort on the first bad row, leaving the constraint un-added while you assumed it was there.”"
    },
    {
      "question": "Complete the lesson statement: “_____ — SELECT — reads without changing anything, which is why it is the only statement you can run freely against production (with the right permissions and one eye on the plan cost).”",
      "options": [
        "REVOKE",
        "roles",
        "DQL"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “DQL — SELECT — reads without changing anything, which is why it is the only statement you can run freely against production (with the right permissions and one eye on the plan cost).”"
    },
    {
      "question": "Complete the lesson statement: “Production discipline: grant to _____, add logins to roles, and never grant object-level permissions to individual logins that will outlive the person who requested them.”",
      "options": [
        "Transaction Control Language",
        "roles",
        "REVOKE"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Production discipline: grant to roles, add logins to roles, and never grant object-level permissions to individual logins that will outlive the person who requested them. The audit question “who can modify this table?” should have a one-query answer from sys.database_permissions.”"
    },
    {
      "question": "Complete the lesson statement: “_____ assuming a script is atomic without BEGIN TRANSACTION (autocommit commits each statement); leaving a transaction open by forgetting COMMIT…”",
      "options": [
        "Common pitfalls:",
        "roles",
        "Transaction Control Language"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Common pitfalls: assuming a script is atomic without BEGIN TRANSACTION (autocommit commits each statement); leaving a transaction open by forgetting COMMIT — which holds locks and blocks others; using SELECT results as if they were validated DML targets; and running DDL in a window with GO batch separators, which ends the batch but does not end your transaction — plan where the boundary sits.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Why the categories matter”?",
      "options": [
        "Every SQL statement falls into one of five categories.",
        "Data Control Language",
        "roles"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Every SQL statement falls into one of five categories. The classification is not academic — it maps directly onto operational reality:”"
    },
    {
      "question": "Complete the lesson statement: “_____ changes the schema itself: CREATE, ALTER, DROP, TRUNCATE, and RENAME.”",
      "options": [
        "INSERT",
        "UPDATE / DELETE",
        "Data Definition Language"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Data Definition Language changes the schema itself: CREATE, ALTER, DROP, TRUNCATE, and RENAME. DDL modifies catalog metadata and, where relevant, storage structures — which is why DDL statements typically require elevated permissions (the ddl_admin habit of granting db_owner to everyone is a security smell).”"
    },
    {
      "question": "Complete the lesson statement: “_____ manipulates rows.”",
      "options": [
        "MERGE",
        "DML",
        "UPDATE / DELETE"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “DML manipulates rows. The safe pattern for anything beyond a trivial change is: measure, wrap, verify.”"
    },
    {
      "question": "Complete the lesson statement: “_____ grants, denies, and revokes permissions on securables: databases, schemas, tables, procedures.”",
      "options": [
        "Data Control Language",
        "UPDATE / DELETE",
        "MERGE"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Data Control Language grants, denies, and revokes permissions on securables: databases, schemas, tables, procedures. Three verbs with clear precedence — DENY always beats GRANT, and permissions can be direct or inherited through roles.”"
    },
    {
      "question": "Complete the lesson statement: “_____ defines the boundary inside which everything else succeeds or fails together.”",
      "options": [
        "MERGE",
        "Data Control Language",
        "Transaction Control Language"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Transaction Control Language defines the boundary inside which everything else succeeds or fails together. Put it together with the other categories into a production-shaped script:”"
    },
    {
      "question": "Complete the lesson statement: “The most expensive misunderstanding in junior SQL is assuming a script is atomic because it _____ like one unit.”",
      "options": [
        "DENY",
        "looks",
        "GRANT"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The most expensive misunderstanding in junior SQL is assuming a script is atomic because it looks like one unit. In SQL Server, without an explicit transaction, every statement commits on its own — called autocommit.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DDL — defining the structure”?",
      "options": [
        "Two DDL traps: TRUNCATE TABLE is DML's cousin — it empties a table quickly and is fully transactional, but it requires ALTER permission and fires no row-level triggers; and a…",
        "What does it change?",
        "Can it be undone?"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Two DDL traps: TRUNCATE TABLE is DML's cousin — it empties a table quickly and is fully transactional, but it requires ALTER permission and fires no row-level triggers; and a failed ALTER TABLE … ADD CONSTRAINT that must validate existing data will abort on the first bad row, leaving the constraint un-added while you assumed it was there.”"
    },
    {
      "question": "Complete the lesson statement: “_____ — SELECT — reads without changing anything, which is why it is the only statement you can run freely against production (with the right permissions and one eye on the plan cost).”",
      "options": [
        "REVOKE",
        "roles",
        "DQL"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “DQL — SELECT — reads without changing anything, which is why it is the only statement you can run freely against production (with the right permissions and one eye on the plan cost).”"
    },
    {
      "question": "Complete the lesson statement: “Production discipline: grant to _____, add logins to roles, and never grant object-level permissions to individual logins that will outlive the person who requested them.”",
      "options": [
        "Transaction Control Language",
        "roles",
        "REVOKE"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Production discipline: grant to roles, add logins to roles, and never grant object-level permissions to individual logins that will outlive the person who requested them. The audit question “who can modify this table?” should have a one-query answer from sys.database_permissions.”"
    },
    {
      "question": "Complete the lesson statement: “_____ assuming a script is atomic without BEGIN TRANSACTION (autocommit commits each statement); leaving a transaction open by forgetting COMMIT…”",
      "options": [
        "Common pitfalls:",
        "roles",
        "Transaction Control Language"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Common pitfalls: assuming a script is atomic without BEGIN TRANSACTION (autocommit commits each statement); leaving a transaction open by forgetting COMMIT — which holds locks and blocks others; using SELECT results as if they were validated DML targets; and running DDL in a window with GO batch separators, which ends the batch but does not end your transaction — plan where the boundary sits.”"
    }
  ],
  takeaways: [
    "DDL defines structure, DML changes rows, DQL is a teaching label for reads, DCL controls access, TCL defines boundaries",
    "Without an explicit transaction every statement auto-commits — a failing script leaves earlier statements in place",
    "Many SQL Server DDL operations can roll back inside a transaction; check command-specific restrictions",
    "Grant permissions to roles, not individuals; DENY generally overrides grants through roles, with exceptions",
    "Safe change recipe: prove the target with SELECT, wrap in a transaction, set XACT_ABORT ON, verify before COMMIT"
  ]
};
