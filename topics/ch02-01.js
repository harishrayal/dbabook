/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch02-01.html */

window.TOPIC = {
  id: "ch02-01",
  title: "What Is a Database?",

  lead: "A database is an organised, structured collection of data that a computer system stores and retrieves efficiently — and understanding what that really means separates a production system people trust from a folder of spreadsheets nobody dares to edit.",

  objectives: [
    "Define a database and distinguish it from a flat file or spreadsheet",
    "Understand the role of the engine (DBMS) that serves the data",
    "Identify the physical parts of a SQL Server database",
    "Recognise why organisations move data out of files and into databases",
    "Spot the classic pitfalls of treating a database like a document store"
  ],

  sections: [
    {
      h: "Defining a database",
      html: `
<p>A <strong>database</strong> is an organised collection of structured data, stored so that a computer program can read, search, update, and protect it efficiently. The word itself — <em>data base</em> — is accurate: a base in which data is kept in a defined structure rather than scattered across files.</p>
<p>Three properties make something a database rather than a pile of files:</p>
<ul>
  <li><strong>Structure</strong> — data lives in tables with named columns, agreed data types, and rules about what may be stored</li>
  <li><strong>Shared access</strong> — many users and applications read and write the same data safely, at the same time</li>
  <li><strong>Managed lifecycle</strong> — someone is responsible for backing it up, securing it, recovering it, and keeping it performant</li>
</ul>
<p>A database is <em>not</em> the application. The application holds business logic; the database holds the business's facts. The application can be rewritten in a fortnight — the data usually outlives every program ever written against it, which is exactly why the database deserves its own discipline.</p>
<blockquote>Files store documents. Databases store facts — with rules, structure, and a recovery plan attached.</blockquote>
`
    },
    {
      h: "Why not just use files or spreadsheets?",
      html: `
<p>Small teams often start with CSV files or a shared workbook. It works — until two people edit it at once, or someone sorts one column and breaks every row's association, or the file corrupts on a Friday evening. Databases solve each of these problems systematically:</p>
<table>
  <tr><th>Concern</th><th>Flat file / spreadsheet</th><th>Database</th></tr>
  <tr><td>Concurrent editing</td><td>Last save wins; locks are manual or absent</td><td>Transactions isolate users; writes never corrupt each other</td></tr>
  <tr><td>Integrity</td><td>Anything can be typed anywhere</td><td>Types, keys, and constraints reject invalid data</td></tr>
  <tr><td>Consistency</td><td>The same value is copied into many files</td><td>One authoritative row, referenced by everyone else</td></tr>
  <tr><td>Query power</td><td>Manual filtering, fragile formulas</td><td>Set-based SQL across millions of rows</td></tr>
  <tr><td>Security</td><td>File-share permissions are all-or-nothing</td><td>Logins, roles, row/column-level grants, auditing</td></tr>
  <tr><td>Recovery</td><td>Undo depends on the user remembering to save a copy</td><td>Backups, transaction log, point-in-time restore</td></tr>
</table>
<p>The hidden cost of spreadsheets is <strong>drift</strong>: every copy diverges, nobody knows which is authoritative, and reconciliation becomes a monthly meeting. A database makes one copy authoritative by design.</p>
`
    },
    {
      h: "Inside a SQL Server database",
      html: `
<p>When someone says “the database”, they usually mean both the <em>logical</em> objects (tables, indexes, procedures) and the <em>physical</em> files that hold them. SQL Server separates the two: applications talk to the engine, and the engine decides how the bytes are laid out on disk.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Database and database engine layers">
    <defs>
      <marker id="db-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="40" y="20" width="190" height="54" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="135" y="43" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Applications</text>
    <text x="135" y="63" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">web · mobile · services</text>

    <rect x="285" y="20" width="190" height="54" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="43" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">BI &amp; reporting</text>
    <text x="380" y="63" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Power BI · SSRS · exports</text>

    <rect x="530" y="20" width="190" height="54" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="625" y="43" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Administrators</text>
    <text x="625" y="63" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">SSMS · sqlcmd · scripts</text>

    <rect x="90" y="120" width="580" height="110" rx="14" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="146" text-anchor="middle" fill="var(--accent-strong)" font-size="16.5" font-weight="700" font-family="Segoe UI, sans-serif">SQL Server database engine (the DBMS)</text>

    <rect x="120" y="160" width="250" height="56" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="245" y="183" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Relational engine</text>
    <text x="245" y="203" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">T-SQL · plans · security</text>

    <rect x="410" y="160" width="240" height="56" rx="9" fill="var(--surface)" stroke="var(--border)"/>
    <text x="530" y="183" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Storage engine</text>
    <text x="530" y="203" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">pages · buffer pool · log</text>

    <rect x="90" y="275" width="270" height="50" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="225" y="297" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Data files · MDF / NDF</text>
    <text x="225" y="316" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">tables and indexes on disk</text>

    <rect x="420" y="275" width="250" height="50" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="545" y="297" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Transaction log · LDF</text>
    <text x="545" y="316" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">every change, in order</text>

    <line x1="135" y1="74" x2="205" y2="118" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#db-arrow)"/>
    <line x1="380" y1="74" x2="380" y2="118" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#db-arrow)"/>
    <line x1="625" y1="74" x2="555" y2="118" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#db-arrow)"/>
    <line x1="250" y1="230" x2="235" y2="273" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#db-arrow)"/>
    <line x1="535" y1="230" x2="545" y2="273" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#db-arrow)"/>

    <text x="380" y="254" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">reads come from memory · writes go to the log first, data files later</text>
  </svg>
  <div class="figcaption">Figure 1 — Clients talk to the database engine; the engine owns the data files and the transaction log.</div>
</div>
<p>Physically, a SQL Server database is made of at least two files: a <strong>primary data file</strong> (.mdf) holding tables and indexes, and a <strong>transaction log file</strong> (.ldf) holding an ordered journal of every change. Additional data files (.ndf) can spread storage across drives. The log is not a duplicate of the data — it is the record that makes recovery possible.</p>
`
    },
    {
      h: "What lives inside the database",
      html: `
<p>Tables are the headline act, but a production database carries a whole catalog of objects. Knowing the inventory matters: each object type has its own backup, permission, and performance implications.</p>
<table>
  <tr><th>Object</th><th>Purpose</th></tr>
  <tr><td><strong>Tables</strong></td><td>Primary data storage — rows and columns</td></tr>
  <tr><td><strong>Keys &amp; constraints</strong></td><td>Rules that reject bad data (primary keys, defaults, checks)</td></tr>
  <tr><td><strong>Indexes</strong></td><td>Structures that make reads fast</td></tr>
  <tr><td><strong>Views</strong></td><td>Saved queries that present or restrict data</td></tr>
  <tr><td><strong>Stored procedures &amp; functions</strong></td><td>Named, reusable, secure logic</td></tr>
  <tr><td><strong>Triggers</strong></td><td>Automated reactions to data changes</td></tr>
</table>
<p>A minimal but real example — one table, a key, a constraint, and the queries around it:</p>
<pre><code class="language-sql">-- Create a schema-qualified table inside the current database
CREATE TABLE sales.Customers
(
    customer_id   int           IDENTITY(1,1) NOT NULL,
    customer_name nvarchar(100) NOT NULL,
    email         nvarchar(256) NOT NULL,
    created_utc   datetime2(3)  NOT NULL
        CONSTRAINT DF_Customers_created DEFAULT (sysutcdatetime()),
    CONSTRAINT PK_Customers PRIMARY KEY CLUSTERED (customer_id),
    CONSTRAINT UQ_Customers_email UNIQUE (email)
);

-- The database enforces the rules, no matter which application inserts
INSERT INTO sales.Customers (customer_name, email)
VALUES (N'Northwind Trading', N'orders@northwind.example');

SELECT customer_id, customer_name, email
FROM   sales.Customers
WHERE  email = N'orders@northwind.example';</code></pre>
`
    },
    {
      h: "What a production DBA cares about",
      html: `
<p>For a DBA, “what is a database” is an operational question, not just a definition. Every database in the estate carries these attributes, whether anyone tracks them or not:</p>
<ul>
  <li><strong>Size and growth</strong> — how big is it today, how fast is it growing, and does the disk have room for next quarter?</li>
  <li><strong>Recovery posture</strong> — which recovery model, which backup schedule, and when was the last <em>restore test</em>?</li>
  <li><strong>Criticality</strong> — which applications, SLAs, and revenue streams depend on it?</li>
  <li><strong>Security</strong> — who can connect, what can they see, and is any data subject to compliance rules?</li>
  <li><strong>Health</strong> — autogrowth settings, fragmentation, corruption checks, and free space in the log</li>
</ul>
<p><strong>Common pitfalls:</strong> leaving files on the system drive with autogrowth enabled by default; treating the log as “just another file” until it fills the disk; naming databases after a project and never documenting their owner; and — the most expensive one — assuming that because the database is up, it is recoverable.</p>
`
    }
  ],

  scenario: {
    title: "The shared workbook that stopped opening at 4:45 PM",
    html: `
<p>A 12-person operations team ran daily order entry from a single Excel file on a file share. At 4:45 PM on month-end, the workbook stopped responding: two users had it open, one had sorted a column without the rest of the rows, and an unsaved copy from the morning was sitting on someone's desktop. Half a day of order data existed in three inconsistent versions, and none of them opened cleanly.</p>
<p>The DBA's response: reconstruct the day's orders from the source system's emails and the mail-queue logs, consolidate everything into a new SQL Server table with a primary key on order number and a unique constraint on the order reference, then point the team's intake form at it. Prevention: the spreadsheet became a <strong>report</strong> — exported <em>from</em> the database, never edited in place. The incident was not an Excel failure; it was a database that did not exist yet.</p>
`
  },

  interview: [
    {
      q: "Define a database in one sentence.",
      a: "An organised, structured collection of data held so that a management system can store, retrieve, secure, and recover it reliably for many concurrent users — not merely a file that contains data."
    },
    {
      q: "What is the difference between a database and a DBMS?",
      a: "The database is the data and its structure — tables, indexes, log files. The DBMS is the software (for SQL Server, the database engine) that manages that data: it parses SQL, enforces rules, handles concurrency, and controls storage and recovery."
    },
    {
      q: "A developer asks why they cannot just ship the data as JSON files. What do you say?",
      a: "JSON files give you no concurrency control, no constraints, no point-in-time recovery, and no efficient querying across millions of rows. A database enforces integrity at write time, journals every change for recovery, and serves set-based reads — the three things files cannot do once more than one person depends on the data."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is an organised collection of structured data, stored so that a computer program can read, search, update, and protect it efficiently.”",
      "options": [
        "Structure",
        "Shared access",
        "database"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A database is an organised collection of structured data, stored so that a computer program can read, search, update, and protect it efficiently. The word itself — data base — is accurate: a base in which data is kept in a defined structure rather than scattered across files.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Why not just use files or spreadsheets?”?",
      "options": [
        "logical",
        "Small teams often start with CSV files or a shared workbook.",
        "not"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Small teams often start with CSV files or a shared workbook. It works — until two people edit it at once, or someone sorts one column and breaks every row's association, or the file corrupts on a Friday evening. Databases solve each of these problems systematically:”"
    },
    {
      "question": "Complete the lesson statement: “When someone says “the database”, they usually mean both the _____ objects (tables, indexes, procedures) and the physical files that hold them.”",
      "options": [
        "logical",
        "Shared access",
        "Managed lifecycle"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “When someone says “the database”, they usually mean both the logical objects (tables, indexes, procedures) and the physical files that hold them. SQL Server separates the two: applications talk to the engine, and the engine decides how the bytes are laid out on disk.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What lives inside the database”?",
      "options": [
        "drift",
        "Transactions isolate users; writes never corrupt each other",
        "Tables are the headline act, but a production database carries a whole catalog of objects."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Tables are the headline act, but a production database carries a whole catalog of objects. Knowing the inventory matters: each object type has its own backup, permission, and performance implications.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What a production DBA cares about”?",
      "options": [
        "Types, keys, and constraints reject invalid data",
        "For a DBA, “what is a database” is an operational question, not just a definition.",
        "Transactions isolate users; writes never corrupt each other"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “For a DBA, “what is a database” is an operational question, not just a definition. Every database in the estate carries these attributes, whether anyone tracks them or not:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Defining a database”?",
      "options": [
        "Three properties make something a database rather than a pile of files:",
        "Logins, roles, row/column-level grants, auditing",
        "Backups, transaction log, point-in-time restore"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Three properties make something a database rather than a pile of files:”"
    },
    {
      "question": "Complete the lesson statement: “The hidden cost of spreadsheets is _____: every copy diverges, nobody knows which is authoritative, and reconciliation becomes a monthly meeting.”",
      "options": [
        "physical",
        "primary data file",
        "drift"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The hidden cost of spreadsheets is drift: every copy diverges, nobody knows which is authoritative, and reconciliation becomes a monthly meeting. A database makes one copy authoritative by design.”"
    },
    {
      "question": "Complete the lesson statement: “Physically, a SQL Server database is made of at least two files: a _____ (.mdf) holding tables and indexes, and a transaction log file (.ldf) holding an ordered journal of every change. Additional data files…”",
      "options": [
        "transaction log file",
        "primary data file",
        "physical"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Physically, a SQL Server database is made of at least two files: a primary data file (.mdf) holding tables and indexes, and a transaction log file (.ldf) holding an ordered journal of every change. Additional data files (.ndf) can spread storage across drives. The log is not a duplicate of the data — it is the record that makes recovery possible.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What lives inside the database”?",
      "options": [
        "A minimal but real example — one table, a key, a constraint, and the queries around it:",
        "Logins, roles, row/column-level grants, auditing",
        "Backups, transaction log, point-in-time restore"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A minimal but real example — one table, a key, a constraint, and the queries around it:”"
    },
    {
      "question": "Complete the lesson statement: “_____ leaving files on the system drive with autogrowth enabled by default; treating the log as “just another file” until it fills the disk;…”",
      "options": [
        "transaction log file",
        "Tables",
        "Common pitfalls:"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Common pitfalls: leaving files on the system drive with autogrowth enabled by default; treating the log as “just another file” until it fills the disk; naming databases after a project and never documenting their owner; and — the most expensive one — assuming that because the database is up, it is recoverable.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is an organised collection of structured data, stored so that a computer program can read, search, update, and protect it efficiently.”",
      "options": [
        "Structure",
        "Shared access",
        "database"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A database is an organised collection of structured data, stored so that a computer program can read, search, update, and protect it efficiently. The word itself — data base — is accurate: a base in which data is kept in a defined structure rather than scattered across files.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Why not just use files or spreadsheets?”?",
      "options": [
        "logical",
        "Small teams often start with CSV files or a shared workbook.",
        "not"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Small teams often start with CSV files or a shared workbook. It works — until two people edit it at once, or someone sorts one column and breaks every row's association, or the file corrupts on a Friday evening. Databases solve each of these problems systematically:”"
    },
    {
      "question": "Complete the lesson statement: “When someone says “the database”, they usually mean both the _____ objects (tables, indexes, procedures) and the physical files that hold them.”",
      "options": [
        "logical",
        "Shared access",
        "Managed lifecycle"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “When someone says “the database”, they usually mean both the logical objects (tables, indexes, procedures) and the physical files that hold them. SQL Server separates the two: applications talk to the engine, and the engine decides how the bytes are laid out on disk.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What lives inside the database”?",
      "options": [
        "drift",
        "Transactions isolate users; writes never corrupt each other",
        "Tables are the headline act, but a production database carries a whole catalog of objects."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Tables are the headline act, but a production database carries a whole catalog of objects. Knowing the inventory matters: each object type has its own backup, permission, and performance implications.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What a production DBA cares about”?",
      "options": [
        "Types, keys, and constraints reject invalid data",
        "For a DBA, “what is a database” is an operational question, not just a definition.",
        "Transactions isolate users; writes never corrupt each other"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “For a DBA, “what is a database” is an operational question, not just a definition. Every database in the estate carries these attributes, whether anyone tracks them or not:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Defining a database”?",
      "options": [
        "Three properties make something a database rather than a pile of files:",
        "Logins, roles, row/column-level grants, auditing",
        "Backups, transaction log, point-in-time restore"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Three properties make something a database rather than a pile of files:”"
    },
    {
      "question": "Complete the lesson statement: “The hidden cost of spreadsheets is _____: every copy diverges, nobody knows which is authoritative, and reconciliation becomes a monthly meeting.”",
      "options": [
        "physical",
        "primary data file",
        "drift"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The hidden cost of spreadsheets is drift: every copy diverges, nobody knows which is authoritative, and reconciliation becomes a monthly meeting. A database makes one copy authoritative by design.”"
    },
    {
      "question": "Complete the lesson statement: “Physically, a SQL Server database is made of at least two files: a _____ (.mdf) holding tables and indexes, and a transaction log file (.ldf) holding an ordered journal of every change. Additional data files…”",
      "options": [
        "transaction log file",
        "primary data file",
        "physical"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Physically, a SQL Server database is made of at least two files: a primary data file (.mdf) holding tables and indexes, and a transaction log file (.ldf) holding an ordered journal of every change. Additional data files (.ndf) can spread storage across drives. The log is not a duplicate of the data — it is the record that makes recovery possible.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What lives inside the database”?",
      "options": [
        "A minimal but real example — one table, a key, a constraint, and the queries around it:",
        "Logins, roles, row/column-level grants, auditing",
        "Backups, transaction log, point-in-time restore"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A minimal but real example — one table, a key, a constraint, and the queries around it:”"
    },
    {
      "question": "Complete the lesson statement: “_____ leaving files on the system drive with autogrowth enabled by default; treating the log as “just another file” until it fills the disk;…”",
      "options": [
        "transaction log file",
        "Tables",
        "Common pitfalls:"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Common pitfalls: leaving files on the system drive with autogrowth enabled by default; treating the log as “just another file” until it fills the disk; naming databases after a project and never documenting their owner; and — the most expensive one — assuming that because the database is up, it is recoverable.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is an organised collection of structured data, stored so that a computer program can read, search, update, and protect it efficiently.”",
      "options": [
        "Structure",
        "Shared access",
        "database"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A database is an organised collection of structured data, stored so that a computer program can read, search, update, and protect it efficiently. The word itself — data base — is accurate: a base in which data is kept in a defined structure rather than scattered across files.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Why not just use files or spreadsheets?”?",
      "options": [
        "logical",
        "Small teams often start with CSV files or a shared workbook.",
        "not"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Small teams often start with CSV files or a shared workbook. It works — until two people edit it at once, or someone sorts one column and breaks every row's association, or the file corrupts on a Friday evening. Databases solve each of these problems systematically:”"
    },
    {
      "question": "Complete the lesson statement: “When someone says “the database”, they usually mean both the _____ objects (tables, indexes, procedures) and the physical files that hold them.”",
      "options": [
        "logical",
        "Shared access",
        "Managed lifecycle"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “When someone says “the database”, they usually mean both the logical objects (tables, indexes, procedures) and the physical files that hold them. SQL Server separates the two: applications talk to the engine, and the engine decides how the bytes are laid out on disk.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What lives inside the database”?",
      "options": [
        "drift",
        "Transactions isolate users; writes never corrupt each other",
        "Tables are the headline act, but a production database carries a whole catalog of objects."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Tables are the headline act, but a production database carries a whole catalog of objects. Knowing the inventory matters: each object type has its own backup, permission, and performance implications.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What a production DBA cares about”?",
      "options": [
        "Types, keys, and constraints reject invalid data",
        "For a DBA, “what is a database” is an operational question, not just a definition.",
        "Transactions isolate users; writes never corrupt each other"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “For a DBA, “what is a database” is an operational question, not just a definition. Every database in the estate carries these attributes, whether anyone tracks them or not:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Defining a database”?",
      "options": [
        "Three properties make something a database rather than a pile of files:",
        "Logins, roles, row/column-level grants, auditing",
        "Backups, transaction log, point-in-time restore"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Three properties make something a database rather than a pile of files:”"
    },
    {
      "question": "Complete the lesson statement: “The hidden cost of spreadsheets is _____: every copy diverges, nobody knows which is authoritative, and reconciliation becomes a monthly meeting.”",
      "options": [
        "physical",
        "primary data file",
        "drift"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The hidden cost of spreadsheets is drift: every copy diverges, nobody knows which is authoritative, and reconciliation becomes a monthly meeting. A database makes one copy authoritative by design.”"
    },
    {
      "question": "Complete the lesson statement: “Physically, a SQL Server database is made of at least two files: a _____ (.mdf) holding tables and indexes, and a transaction log file (.ldf) holding an ordered journal of every change. Additional data files…”",
      "options": [
        "transaction log file",
        "primary data file",
        "physical"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Physically, a SQL Server database is made of at least two files: a primary data file (.mdf) holding tables and indexes, and a transaction log file (.ldf) holding an ordered journal of every change. Additional data files (.ndf) can spread storage across drives. The log is not a duplicate of the data — it is the record that makes recovery possible.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What lives inside the database”?",
      "options": [
        "A minimal but real example — one table, a key, a constraint, and the queries around it:",
        "Logins, roles, row/column-level grants, auditing",
        "Backups, transaction log, point-in-time restore"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A minimal but real example — one table, a key, a constraint, and the queries around it:”"
    },
    {
      "question": "Complete the lesson statement: “_____ leaving files on the system drive with autogrowth enabled by default; treating the log as “just another file” until it fills the disk;…”",
      "options": [
        "transaction log file",
        "Tables",
        "Common pitfalls:"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Common pitfalls: leaving files on the system drive with autogrowth enabled by default; treating the log as “just another file” until it fills the disk; naming databases after a project and never documenting their owner; and — the most expensive one — assuming that because the database is up, it is recoverable.”"
    }
  ],
  takeaways: [
    "A database is structured, shared, managed data — distinct from the application that uses it",
    "The DBMS (database engine) sits between clients and the physical files, enforcing rules and recovery",
    "A SQL Server database is data files (MDF/NDF) for tables and indexes plus a transaction log (LDF) for recovery",
    "Databases beat files on concurrency, integrity, query power, security, and recovery — spreadsheets beat nothing",
    "A production DBA treats every database as an operational asset: size, growth, backups, security, and tested restore"
  ]
};
