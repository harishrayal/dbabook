/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch02-06.html */

window.TOPIC = {
  id: "ch02-06",
  title: "Unique Keys and Constraints",

  lead: "Constraints are declarative rules the database can enforce for applicable writes while enabled — and knowing which one to use helps keep invalid data out of production.",

  objectives: [
    "List the constraint types and what each one guarantees",
    "Distinguish primary keys from unique keys in behaviour and purpose",
    "Apply CHECK, DEFAULT, and NOT NULL appropriately in table design",
    "Understand how constraints are enforced, trusted, and audited",
    "Avoid the classic constraint mistakes seen in production systems"
  ],

  sections: [
    {
      h: "The constraint family",
      html: `
<p>A <strong>constraint</strong> is a rule about table data that SQL Server stores in metadata and enforces for applicable writes while the constraint is enabled. Constraints complement application logic by defining data rules at the database boundary.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Constraint types grouped by purpose">
    <defs>
      <marker id="cs-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="230" y="14" width="300" height="48" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="43" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Applicable INSERT / UPDATE / DELETE</text>

    <rect x="20" y="90" width="230" height="210" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="135" y="117" text-anchor="middle" fill="var(--accent-strong)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Entity integrity</text>

    <rect x="34" y="130" width="202" height="46" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="135" y="150" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="700" font-family="Segoe UI, sans-serif">PRIMARY KEY</text>
    <text x="135" y="167" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">identity · unique · NOT NULL</text>

    <rect x="34" y="192" width="202" height="46" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="135" y="212" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="700" font-family="Segoe UI, sans-serif">UNIQUE key</text>
    <text x="135" y="229" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">no duplicate key values</text>

    <text x="135" y="275" text-anchor="middle" fill="var(--muted)" font-size="11" font-style="italic" font-family="Segoe UI, sans-serif">exactly one PK per table</text>

    <rect x="265" y="90" width="230" height="210" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="380" y="117" text-anchor="middle" fill="var(--accent-strong)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Domain integrity</text>

    <rect x="279" y="130" width="202" height="46" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="380" y="150" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="700" font-family="Segoe UI, sans-serif">NOT NULL</text>
    <text x="380" y="167" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">value must be known</text>

    <rect x="279" y="192" width="202" height="46" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="380" y="212" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="700" font-family="Segoe UI, sans-serif">CHECK</text>
    <text x="380" y="229" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">FALSE is rejected; UNKNOWN passes</text>

    <rect x="279" y="254" width="202" height="46" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="380" y="274" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="700" font-family="Segoe UI, sans-serif">DEFAULT</text>
    <text x="380" y="291" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">value when omitted</text>

    <rect x="510" y="90" width="230" height="210" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="625" y="117" text-anchor="middle" fill="var(--accent-strong)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Referential integrity</text>

    <rect x="524" y="130" width="202" height="46" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="625" y="150" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="700" font-family="Segoe UI, sans-serif">FOREIGN KEY</text>
    <text x="625" y="167" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">parent row must exist</text>

    <rect x="524" y="192" width="202" height="46" rx="8" fill="var(--surface)" stroke="var(--border)"/>
    <text x="625" y="212" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="700" font-family="Segoe UI, sans-serif">ON DELETE / UPDATE</text>
    <text x="625" y="229" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">cascade · no action · set null</text>

    <text x="625" y="275" text-anchor="middle" fill="var(--muted)" font-size="11" font-style="italic" font-family="Segoe UI, sans-serif">index the FK column yourself</text>

    <line x1="300" y1="62" x2="150" y2="88" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cs-arrow)"/>
    <line x1="380" y1="62" x2="380" y2="88" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cs-arrow)"/>
    <line x1="460" y1="62" x2="610" y2="88" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cs-arrow)"/>

    <text x="380" y="330" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Enabled constraints are enforced by the engine for ordinary writes.</text>
  </svg>
  <div class="figcaption">Figure 1 — Constraints group into entity, domain, and referential integrity.</div>
</div>
<table>
  <tr><th>Constraint</th><th>Guarantee</th><th>Creates an index?</th><th>Per table</th></tr>
  <tr><td><strong>NOT NULL</strong></td><td>Column must hold a value</td><td>No</td><td>Per column</td></tr>
  <tr><td><strong>DEFAULT</strong></td><td>Supplies a value when the column is omitted</td><td>No</td><td>One per column</td></tr>
  <tr><td><strong>CHECK</strong></td><td>Rejects FALSE; UNKNOWN (including many NULL results) passes</td><td>No</td><td>Many</td></tr>
  <tr><td><strong>UNIQUE</strong></td><td>No duplicate key combinations; a single-column key permits one NULL</td><td>Yes — unique index</td><td>Many</td></tr>
  <tr><td><strong>PRIMARY KEY</strong></td><td>Unique, NOT NULL row identity</td><td>Yes — clustered by default</td><td>Exactly one</td></tr>
  <tr><td><strong>FOREIGN KEY</strong></td><td>A non-NULL value references an existing parent row</td><td>No</td><td>Many</td></tr>
</table>
`
    },
    {
      h: "Unique keys in detail",
      html: `
<p>A <strong>unique key</strong> says “no two rows may share this value” without claiming to be the row's identity. That distinction matters:</p>
<ul>
  <li>A table may have <strong>many</strong> unique keys (email, national insurance number, username); only one primary key</li>
  <li>SQL Server enforces a unique key with a <strong>unique index</strong> — reads on those columns are fast too, because the index already exists</li>
  <li>A single-column unique key permits <strong>one NULL</strong> — NULLs are not considered equal, so a second NULL is rejected</li>
  <li>Foreign keys may reference a unique key, so “the parent” does not have to be the primary key</li>
</ul>
<blockquote>The unique key is how you encode a real-world rule like “one account per customer per month” into the schema instead of a hopeful comment in the code.</blockquote>
<p>Subtleties that bite: uniqueness follows the column's <strong>collation</strong> (a case-insensitive collation makes <code>Ann@x.com</code> and <code>ann@x.com</code> the same value; a binary collation does not), and character comparisons generally ignore trailing spaces. For a composite unique key, duplicate combinations are rejected even when one or more key columns are NULL; use a filtered unique index if the business rule requires a different treatment of NULLs.</p>
`
    },
    {
      h: "CHECK, DEFAULT, and NOT NULL working together",
      html: `
<p>Domain constraints define which values are acceptable. A default supplies a value when an insert omits a column or uses <code>DEFAULT</code>; it does not replace an explicitly supplied <code>NULL</code>. A <code>CHECK</code> rejects an expression that evaluates to false, while <code>UNKNOWN</code> (often caused by <code>NULL</code>) passes. Pair it with <code>NOT NULL</code> when NULL must be rejected:</p>
<pre><code class="language-sql">CREATE TABLE billing.Invoices
(
    invoice_id    int            IDENTITY(1,1) NOT NULL,
    customer_id   int            NOT NULL,
    invoice_no    varchar(30)    NOT NULL,
    invoice_date  date           NOT NULL
                  CONSTRAINT DF_Invoices_date DEFAULT (CAST(GETDATE() AS date)),
    due_date      date           NOT NULL,
    status        varchar(12)    NOT NULL
                  CONSTRAINT DF_Invoices_status DEFAULT ('DRAFT'),
    amount        decimal(12,2)  NOT NULL,
    CONSTRAINT PK_Invoices PRIMARY KEY CLUSTERED (invoice_id),
    CONSTRAINT UQ_Invoices_no  UNIQUE (invoice_no),
    CONSTRAINT CK_Invoices_amount CHECK (amount >= 0),
    CONSTRAINT CK_Invoices_status CHECK (status IN ('DRAFT','ISSUED','PAID','VOID')),
    CONSTRAINT CK_Invoices_due  CHECK (due_date >= invoice_date)
);

-- All three rules applied in one statement by the engine:
INSERT INTO billing.Invoices (customer_id, invoice_no, due_date, amount)
VALUES (552, 'INV-2026-0001', '2026-02-14', 4800.00);

-- Rejected: status not in the allowed set
INSERT INTO billing.Invoices (customer_id, invoice_no, due_date, amount, status)
VALUES (552, 'INV-2026-0002', '2026-02-14', 10.00, 'PROBABLY-PAID');</code></pre>
<p>Here the default fills <code>invoice_date</code> and <code>status</code> because those columns are omitted from the insert. The values are appropriate only if they match the application's business rules.</p>
`
    },
    {
      h: "How constraints are enforced and audited",
      html: `
<p>Constraints are metadata in the catalog. Two facts matter operationally:</p>
<ul>
  <li>They are enforced as part of the applicable statement. A constraint error generally rolls back that statement; transaction-level behavior depends on transaction settings and error handling</li>
  <li><code>CHECK</code> and <code>FOREIGN KEY</code> constraints can be <strong>disabled or left untrusted</strong>. An enabled but untrusted constraint still checks future modifications, but existing rows weren't validated and the optimizer can't assume they satisfy the constraint</li>
</ul>
<pre><code class="language-sql">-- Audit CHECK and FOREIGN KEY constraints that need attention
SELECT schema_name(t.schema_id) AS schema_name,
       t.name AS table_name,
       c.name AS constraint_name,
       'CHECK' AS constraint_type,
       c.is_disabled,
       c.is_not_trusted
FROM   sys.check_constraints AS c
JOIN   sys.tables AS t ON t.object_id = c.parent_object_id
WHERE  c.is_disabled = 1 OR c.is_not_trusted = 1
UNION ALL
SELECT schema_name(t.schema_id),
       t.name,
       fk.name,
       'FOREIGN KEY',
       fk.is_disabled,
       fk.is_not_trusted
FROM   sys.foreign_keys AS fk
JOIN   sys.tables AS t ON t.object_id = fk.parent_object_id
WHERE  fk.is_disabled = 1 OR fk.is_not_trusted = 1
ORDER  BY schema_name, table_name, constraint_name;</code></pre>
<p>Re-establish trust with <code>ALTER TABLE … WITH CHECK CHECK CONSTRAINT …</code> — but fix the data first, or the validation fails and tells you exactly where the bad rows live.</p>
<p><strong>Common pitfalls:</strong> application-layer validation with no database guard where one is appropriate; assuming a <code>CHECK</code> rejects NULL when its expression can evaluate to UNKNOWN; unique keys defined on the wrong column combination; and disabling constraints for a load without a verified re-enable and validation step.</p>
`
    }
  ],

  scenario: {
    title: "The month-end invoice batch failed on duplicate keys — twice",
    html: `
<p>At 11:40 PM the monthly billing batch aborted: <code>Violation of UNIQUE KEY constraint 'UQ_Invoices_customer'</code>. The key had been created years earlier on customer_id alone, reflecting a time when a customer could only have one open invoice. The business had since moved to instalments — one invoice per customer per period — and nothing but that old constraint was still enforcing the old rule. The batch failed again on retry because the job re-ran without cleaning its partial load.</p>
<p>The DBA diagnosed it in minutes: the failing key, the legitimate rows it rejected, and the audit trail showing the constraint had never been revised. Resolution: inside a change window, dropped <code>UQ_Invoices_customer</code> and created <code>UQ_Invoices_customer_period</code> on (customer_id, invoice_period), after confirming no true duplicates existed on the new definition. The batch completed on the third run with a corrected restart step. Prevention: every unique constraint now carries a comment documenting the business rule it encodes, and constraint changes go through the same review as any schema change. <strong>The rule had outgrown the constraint — and the constraint was the only thing still enforcing the old one.</strong></p>
`
  },

  interview: [
    {
      q: "Primary key or unique key — when do you use each?",
      a: "Primary key for the single column that identifies the row: NOT NULL, unique, clustered by default. Unique keys for every additional real-world uniqueness rule — email, account number, (customer, period) — and they may be composite and referenced by foreign keys."
    },
    {
      q: "What does an untrusted constraint mean?",
      a: "That a CHECK or FOREIGN KEY constraint exists but has not been validated against all existing rows — usually added or re-enabled with NOCHECK. The engine will still check new writes, but historical rows may already violate it, so the constraint's guarantee is incomplete until you run WITH CHECK and fix any failures."
    },
    {
      q: "Why might a unique index still allow duplicate-looking emails?",
      a: "Because uniqueness follows the column's collation and comparison rules: a case-insensitive collation treats Ann@x.com and ann@x.com as equal, while a case-sensitive collation can distinguish them. A multi-column unique key rejects duplicate combinations even when one or more key values are NULL. Decide the intended rule explicitly with collation, nullability, or a filtered unique index."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is a rule about table data that SQL Server stores in metadata and enforces itself, inside the storage engine, on every statement that touches the table.”",
      "options": [
        "constraint",
        "unique key",
        "many"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A constraint is a rule about table data that SQL Server stores in metadata and enforces itself, inside the storage engine, on every statement that touches the table. Constraints are not suggestions and they are not application logic — they are the definition of what the table accepts.”"
    },
    {
      "question": "Complete the lesson statement: “A _____ says “no two rows may share this value” without claiming to be the row's identity.”",
      "options": [
        "many",
        "unique index",
        "unique key"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A unique key says “no two rows may share this value” without claiming to be the row's identity. That distinction matters:”"
    },
    {
      "question": "Which fact is covered in the lesson section “CHECK, DEFAULT, and NOT NULL working together”?",
      "options": [
        "Common pitfalls:",
        "Domain constraints define what a plausible value looks like.",
        "Re-establish trust with ALTER TABLE … WITH CHECK CHECK CONSTRAINT … — but fix the data first, or the validation fails and tells you exactly where the bad rows live."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Domain constraints define what a plausible value looks like. Together with a default, they turn malformed input into either a corrected value or a clear error at write time:”"
    },
    {
      "question": "Which fact is covered in the lesson section “How constraints are enforced and audited”?",
      "options": [
        "Constraints are metadata in the catalog.",
        "Re-establish trust with ALTER TABLE … WITH CHECK CHECK CONSTRAINT … — but fix the data first, or the validation fails and tells you exactly where the bad rows live.",
        "Common pitfalls:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Constraints are metadata in the catalog. Two facts matter operationally:”"
    },
    {
      "question": "In the “The constraint family” table, what is listed for “NOT NULL” under “Per table”?",
      "options": [
        "Common pitfalls:",
        "NOT NULL",
        "Per column"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “NOT NULL” as “Per column”."
    },
    {
      "question": "Complete the lesson statement: “com the same value; a binary _____ does not), trailing spaces are ignored in comparisons for character types, and a unique key over multiple columns allows any row where at…”",
      "options": [
        "row by row, atomically with the statement",
        "collation",
        "at least one"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Subtleties that bite: uniqueness follows the column's collation (a case-insensitive collation makes Ann@x.com and ann@x.com the same value; a binary collation does not), trailing spaces are ignored in comparisons for character types, and a unique key over multiple columns allows any row where at least one column is NULL — use a filtered index or NOT NULL columns when that matters.”"
    },
    {
      "question": "Which fact is covered in the lesson section “CHECK, DEFAULT, and NOT NULL working together”?",
      "options": [
        "Note the default fills invoice_date and status — an insert that forgets them gets a correct value rather than an error or a NULL.",
        "DEFAULT",
        "CHECK"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Note the default fills invoice_date and status — an insert that forgets them gets a correct value rather than an error or a NULL.”"
    },
    {
      "question": "Which fact is covered in the lesson section “How constraints are enforced and audited”?",
      "options": [
        "CHECK",
        "UNIQUE",
        "Re-establish trust with ALTER TABLE … WITH CHECK CHECK CONSTRAINT … — but fix the data first, or the validation fails and tells you exactly where the bad rows live."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Re-establish trust with ALTER TABLE … WITH CHECK CHECK CONSTRAINT … — but fix the data first, or the validation fails and tells you exactly where the bad rows live.”"
    },
    {
      "question": "In the “The constraint family” table, what is listed for “DEFAULT” under “Per table”?",
      "options": [
        "PRIMARY KEY",
        "One per column",
        "UNIQUE"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “DEFAULT” as “One per column”."
    },
    {
      "question": "Complete the lesson statement: “_____ application-layer validation that “never lets bad data through” (a second writer always appears); CHECK constraints written with…”",
      "options": [
        "Common pitfalls:",
        "Per column",
        "One per column"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Common pitfalls: application-layer validation that “never lets bad data through” (a second writer always appears); CHECK constraints written with non-deterministic functions that cannot be used there; unique keys defined on the wrong column combination; and dropping constraints to “speed up the load” without a scheduled re-enable.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is a rule about table data that SQL Server stores in metadata and enforces itself, inside the storage engine, on every statement that touches the table.”",
      "options": [
        "constraint",
        "unique key",
        "many"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A constraint is a rule about table data that SQL Server stores in metadata and enforces itself, inside the storage engine, on every statement that touches the table. Constraints are not suggestions and they are not application logic — they are the definition of what the table accepts.”"
    },
    {
      "question": "Complete the lesson statement: “A _____ says “no two rows may share this value” without claiming to be the row's identity.”",
      "options": [
        "many",
        "unique index",
        "unique key"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A unique key says “no two rows may share this value” without claiming to be the row's identity. That distinction matters:”"
    },
    {
      "question": "Which fact is covered in the lesson section “CHECK, DEFAULT, and NOT NULL working together”?",
      "options": [
        "Common pitfalls:",
        "Domain constraints define what a plausible value looks like.",
        "Re-establish trust with ALTER TABLE … WITH CHECK CHECK CONSTRAINT … — but fix the data first, or the validation fails and tells you exactly where the bad rows live."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Domain constraints define what a plausible value looks like. Together with a default, they turn malformed input into either a corrected value or a clear error at write time:”"
    },
    {
      "question": "Which fact is covered in the lesson section “How constraints are enforced and audited”?",
      "options": [
        "Constraints are metadata in the catalog.",
        "Re-establish trust with ALTER TABLE … WITH CHECK CHECK CONSTRAINT … — but fix the data first, or the validation fails and tells you exactly where the bad rows live.",
        "Common pitfalls:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Constraints are metadata in the catalog. Two facts matter operationally:”"
    },
    {
      "question": "In the “The constraint family” table, what is listed for “NOT NULL” under “Per table”?",
      "options": [
        "Common pitfalls:",
        "NOT NULL",
        "Per column"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “NOT NULL” as “Per column”."
    },
    {
      "question": "Complete the lesson statement: “com the same value; a binary _____ does not), trailing spaces are ignored in comparisons for character types, and a unique key over multiple columns allows any row where at…”",
      "options": [
        "row by row, atomically with the statement",
        "collation",
        "at least one"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Subtleties that bite: uniqueness follows the column's collation (a case-insensitive collation makes Ann@x.com and ann@x.com the same value; a binary collation does not), trailing spaces are ignored in comparisons for character types, and a unique key over multiple columns allows any row where at least one column is NULL — use a filtered index or NOT NULL columns when that matters.”"
    },
    {
      "question": "Which fact is covered in the lesson section “CHECK, DEFAULT, and NOT NULL working together”?",
      "options": [
        "Note the default fills invoice_date and status — an insert that forgets them gets a correct value rather than an error or a NULL.",
        "DEFAULT",
        "CHECK"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Note the default fills invoice_date and status — an insert that forgets them gets a correct value rather than an error or a NULL.”"
    },
    {
      "question": "Which fact is covered in the lesson section “How constraints are enforced and audited”?",
      "options": [
        "CHECK",
        "UNIQUE",
        "Re-establish trust with ALTER TABLE … WITH CHECK CHECK CONSTRAINT … — but fix the data first, or the validation fails and tells you exactly where the bad rows live."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Re-establish trust with ALTER TABLE … WITH CHECK CHECK CONSTRAINT … — but fix the data first, or the validation fails and tells you exactly where the bad rows live.”"
    },
    {
      "question": "In the “The constraint family” table, what is listed for “DEFAULT” under “Per table”?",
      "options": [
        "PRIMARY KEY",
        "One per column",
        "UNIQUE"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “DEFAULT” as “One per column”."
    },
    {
      "question": "Complete the lesson statement: “_____ application-layer validation that “never lets bad data through” (a second writer always appears); CHECK constraints written with…”",
      "options": [
        "Common pitfalls:",
        "Per column",
        "One per column"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Common pitfalls: application-layer validation that “never lets bad data through” (a second writer always appears); CHECK constraints written with non-deterministic functions that cannot be used there; unique keys defined on the wrong column combination; and dropping constraints to “speed up the load” without a scheduled re-enable.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is a rule about table data that SQL Server stores in metadata and enforces itself, inside the storage engine, on every statement that touches the table.”",
      "options": [
        "constraint",
        "unique key",
        "many"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A constraint is a rule about table data that SQL Server stores in metadata and enforces itself, inside the storage engine, on every statement that touches the table. Constraints are not suggestions and they are not application logic — they are the definition of what the table accepts.”"
    },
    {
      "question": "Complete the lesson statement: “A _____ says “no two rows may share this value” without claiming to be the row's identity.”",
      "options": [
        "many",
        "unique index",
        "unique key"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A unique key says “no two rows may share this value” without claiming to be the row's identity. That distinction matters:”"
    },
    {
      "question": "Which fact is covered in the lesson section “CHECK, DEFAULT, and NOT NULL working together”?",
      "options": [
        "Common pitfalls:",
        "Domain constraints define what a plausible value looks like.",
        "Re-establish trust with ALTER TABLE … WITH CHECK CHECK CONSTRAINT … — but fix the data first, or the validation fails and tells you exactly where the bad rows live."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Domain constraints define what a plausible value looks like. Together with a default, they turn malformed input into either a corrected value or a clear error at write time:”"
    },
    {
      "question": "Which fact is covered in the lesson section “How constraints are enforced and audited”?",
      "options": [
        "Constraints are metadata in the catalog.",
        "Re-establish trust with ALTER TABLE … WITH CHECK CHECK CONSTRAINT … — but fix the data first, or the validation fails and tells you exactly where the bad rows live.",
        "Common pitfalls:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Constraints are metadata in the catalog. Two facts matter operationally:”"
    },
    {
      "question": "In the “The constraint family” table, what is listed for “NOT NULL” under “Per table”?",
      "options": [
        "Common pitfalls:",
        "NOT NULL",
        "Per column"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “NOT NULL” as “Per column”."
    },
    {
      "question": "Complete the lesson statement: “com the same value; a binary _____ does not), trailing spaces are ignored in comparisons for character types, and a unique key over multiple columns allows any row where at…”",
      "options": [
        "row by row, atomically with the statement",
        "collation",
        "at least one"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Subtleties that bite: uniqueness follows the column's collation (a case-insensitive collation makes Ann@x.com and ann@x.com the same value; a binary collation does not), trailing spaces are ignored in comparisons for character types, and a unique key over multiple columns allows any row where at least one column is NULL — use a filtered index or NOT NULL columns when that matters.”"
    },
    {
      "question": "Which fact is covered in the lesson section “CHECK, DEFAULT, and NOT NULL working together”?",
      "options": [
        "Note the default fills invoice_date and status — an insert that forgets them gets a correct value rather than an error or a NULL.",
        "DEFAULT",
        "CHECK"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Note the default fills invoice_date and status — an insert that forgets them gets a correct value rather than an error or a NULL.”"
    },
    {
      "question": "Which fact is covered in the lesson section “How constraints are enforced and audited”?",
      "options": [
        "CHECK",
        "UNIQUE",
        "Re-establish trust with ALTER TABLE … WITH CHECK CHECK CONSTRAINT … — but fix the data first, or the validation fails and tells you exactly where the bad rows live."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Re-establish trust with ALTER TABLE … WITH CHECK CHECK CONSTRAINT … — but fix the data first, or the validation fails and tells you exactly where the bad rows live.”"
    },
    {
      "question": "In the “The constraint family” table, what is listed for “DEFAULT” under “Per table”?",
      "options": [
        "PRIMARY KEY",
        "One per column",
        "UNIQUE"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “DEFAULT” as “One per column”."
    },
    {
      "question": "Complete the lesson statement: “_____ application-layer validation that “never lets bad data through” (a second writer always appears); CHECK constraints written with…”",
      "options": [
        "Common pitfalls:",
        "Per column",
        "One per column"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Common pitfalls: application-layer validation that “never lets bad data through” (a second writer always appears); CHECK constraints written with non-deterministic functions that cannot be used there; unique keys defined on the wrong column combination; and dropping constraints to “speed up the load” without a scheduled re-enable.”"
    }
  ],
  takeaways: [
    "Constraints are engine-enforced rules on every write — entity (PK/UNIQUE), domain (NOT NULL/CHECK/DEFAULT), referential (FK)",
    "A unique key enforces uniqueness through a unique index, permits one NULL, and allows many per table",
    "CHECK plus DEFAULT turns malformed input into a clear error or an automatically correct value",
    "Constraints can be disabled or untrusted — audit sys.objects and re-establish trust after migrations",
    "Document what business rule each constraint encodes, or it will silently outlive the rule"
  ]
};
