/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch02-05.html */

window.TOPIC = {
  id: "ch02-05",
  title: "Primary Keys and Foreign Keys",

  lead: "Keys are how a relational database guarantees that rows are identifiable and relationships are real — get them right and the engine blocks bad data for you; get them wrong and you will discover the duplicates in production.",

  objectives: [
    "Define primary keys and the guarantees they provide",
    "Explain foreign keys and referential integrity enforcement",
    "Choose between surrogate and natural keys deliberately",
    "Compare referential actions: NO ACTION, CASCADE, SET NULL, SET DEFAULT",
    "Recognise the performance and operational pitfalls of keys in production"
  ],

  sections: [
    {
      h: "The primary key: identity for a row",
      html: `
<p>A <strong>primary key (PK)</strong> is the column or column set that uniquely identifies every row in a table. SQL Server enforces two rules absolutely:</p>
<ul>
  <li><strong>Uniqueness</strong> — no two rows may carry the same PK value</li>
  <li><strong>NOT NULL</strong> — a row without identity does not exist; PK columns can never be NULL</li>
</ul>
<p>Defining a PK also creates a unique index to enforce it, and by default it becomes the table's <strong>clustered index</strong> — meaning the table's rows are physically stored in PK order. That single decision influences read performance for the life of the table, which is why key choice deserves more thought than “make it an int and move on”.</p>
<blockquote>A primary key answers “which row is this?” — for every other table that references it, for every update statement, and for every support ticket that says “the system shows the wrong record”.</blockquote>
<p>Two flavours of PK:</p>
<ul>
  <li><strong>Natural key</strong> — a real-world identifier: ISBN, national insurance number, account number. Correct when the value is genuinely unique, stable, and known by the business.</li>
  <li><strong>Surrogate key</strong> — an artificial identifier invented for the table: <code>IDENTITY</code> or a sequence. Correct when natural values are long, nullable, changeable, or simply not guaranteed unique.</li>
</ul>
`
    },
    {
      h: "The foreign key: proof of relationship",
      html: `
<p>A <strong>foreign key (FK)</strong> is a column in one table holding the primary key (or a unique key) of another. It declares “this row belongs to that parent”, and the engine enforces the declaration on <em>every</em> write, from every application:</p>
<ul>
  <li><strong>Insert/update of a child</strong> — the referenced parent row must exist, or the statement fails</li>
  <li><strong>Delete/update of a parent</strong> — the FK's referential action decides what happens to the children</li>
</ul>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Primary and foreign key relationships">
    <defs>
      <marker id="pk-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="20" y="110" width="210" height="120" rx="10" fill="var(--surface)" stroke="var(--border)" stroke-width="1.6"/>
    <rect x="20" y="110" width="210" height="32" rx="10" fill="var(--accent)"/>
    <rect x="20" y="130" width="210" height="12" fill="var(--accent)"/>
    <text x="125" y="131" text-anchor="middle" fill="#ffffff" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Customers</text>
    <text x="34" y="164" fill="var(--amber)" font-size="12" font-weight="700" font-family="Segoe UI, sans-serif">PK  customer_id</text>
    <text x="34" y="186" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">    customer_name</text>
    <text x="34" y="208" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">    created_utc</text>

    <rect x="275" y="110" width="210" height="120" rx="10" fill="var(--surface)" stroke="var(--border)" stroke-width="1.6"/>
    <rect x="275" y="110" width="210" height="32" rx="10" fill="var(--accent)"/>
    <rect x="275" y="130" width="210" height="12" fill="var(--accent)"/>
    <text x="380" y="131" text-anchor="middle" fill="#ffffff" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Orders</text>
    <text x="289" y="164" fill="var(--amber)" font-size="12" font-weight="700" font-family="Segoe UI, sans-serif">PK  order_id</text>
    <text x="289" y="186" fill="var(--accent-strong)" font-size="12" font-weight="600" font-family="Segoe UI, sans-serif">FK  customer_id</text>
    <text x="289" y="208" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">    order_date</text>

    <rect x="530" y="110" width="210" height="120" rx="10" fill="var(--surface)" stroke="var(--border)" stroke-width="1.6"/>
    <rect x="530" y="110" width="210" height="32" rx="10" fill="var(--accent)"/>
    <rect x="530" y="130" width="210" height="12" fill="var(--accent)"/>
    <text x="635" y="131" text-anchor="middle" fill="#ffffff" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">OrderLines</text>
    <text x="544" y="164" fill="var(--amber)" font-size="12" font-weight="700" font-family="Segoe UI, sans-serif">PK  line_id</text>
    <text x="544" y="186" fill="var(--accent-strong)" font-size="12" font-weight="600" font-family="Segoe UI, sans-serif">FK  order_id</text>
    <text x="544" y="208" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">    sku · quantity</text>

    <text x="252" y="100" text-anchor="middle" fill="var(--muted)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">1 : N</text>
    <text x="507" y="100" text-anchor="middle" fill="var(--muted)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">1 : N</text>
    <line x1="230" y1="170" x2="273" y2="170" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#pk-arrow)"/>
    <line x1="485" y1="170" x2="528" y2="170" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#pk-arrow)"/>

    <rect x="60" y="258" width="640" height="34" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="380" y="280" text-anchor="middle" fill="var(--accent-strong)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">FK  customer_id  REFERENCES Customers(customer_id)  —  no orphan orders possible</text>

    <text x="380" y="322" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">The key travels: every relationship is carried as a value in the child row.</text>
  </svg>
  <div class="figcaption">Figure 1 — Primary keys identify; foreign keys carry that identity into the child table.</div>
</div>
`
    },
    {
      h: "Referential actions: what happens to the children",
      html: `
<p>When a parent row is deleted (or its key updated), the FK action decides the outcome. Choosing this at design time is easy; changing it later is a migration with blast radius.</p>
<table>
  <tr><th>Action</th><th>On parent delete / key update</th><th>Typical use</th></tr>
  <tr><td><strong>NO ACTION</strong> (default)</td><td>Fails with an error if children exist</td><td>Safest default — deletion must be deliberate</td></tr>
  <tr><td><strong>RESTRICT</strong></td><td>Same effect, checked immediately</td><td>Behavioural twin of NO ACTION in SQL Server</td></tr>
  <tr><td><strong>CASCADE</strong></td><td>Deletes the children too</td><td>True dependent children (order lines of a test order)</td></tr>
  <tr><td><strong>SET NULL</strong></td><td>Children's FK set to NULL</td><td>Optional relationships — requires a nullable FK</td></tr>
  <tr><td><strong>SET DEFAULT</strong></td><td>Children's FK set to the column default</td><td>Rare — needs a sensible default parent</td></tr>
</table>
<p>CASCADE is the action people regret most: one <code>DELETE</code> can fan out through several tables, hold locks for minutes, and delete far more than intended. In production, cascade only on genuinely dependent, low-value children — never across a chain that includes financial history.</p>
`
    },
    {
      h: "Building the keys in T-SQL",
      html: `
<p>A realistic pair of parent and child tables with an explicit referential design:</p>
<pre><code class="language-sql">CREATE TABLE sales.Customers
(
    customer_id   int            IDENTITY(1,1) NOT NULL,
    customer_name nvarchar(100)  NOT NULL,
    email         nvarchar(256)  NOT NULL,
    CONSTRAINT PK_Customers PRIMARY KEY CLUSTERED (customer_id),
    CONSTRAINT UQ_Customers_email UNIQUE (email)
);

CREATE TABLE sales.Orders
(
    order_id      int       IDENTITY(1,1) NOT NULL,
    customer_id   int       NOT NULL,
    order_date    date      NOT NULL,
    total_amount  decimal(12,2) NOT NULL
                  CONSTRAINT DF_Orders_total DEFAULT (0),
    CONSTRAINT PK_Orders PRIMARY KEY CLUSTERED (order_id),
    CONSTRAINT FK_Orders_Customers FOREIGN KEY (customer_id)
        REFERENCES sales.Customers (customer_id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);

-- Parent first, child second: insert order for an existing customer
INSERT INTO sales.Customers (customer_name, email)
VALUES (N'Harrow &amp; Co', N'ap@harrow.example');

INSERT INTO sales.Orders (customer_id, order_date, total_amount)
VALUES (SCOPE_IDENTITY(), '2026-01-15', 1240.00);

-- Orphan child: rejected by the engine before it is stored
INSERT INTO sales.Orders (customer_id, order_date, total_amount)
VALUES (999999, '2026-01-15', 10.00);</code></pre>
<p>Composite keys are equally normal — a junction table's PK spans both foreign keys, which by definition prevents the same pair appearing twice.</p>
`
    },
    {
      h: "Production pitfalls",
      html: `
<ul>
  <li><strong>Foreign keys create no index.</strong> The child table's FK column must be indexed for parent lookups and for joins back — otherwise every child insert does a scan of a huge table. Add an index on every FK you create.</li>
  <li><strong>Disabled or untrusted constraints.</strong> <code>is_disabled = 1</code> or <code>is_not_trusted = 1</code> in <code>sys.foreign_keys</code> means the engine is no longer checking — common after bulk loads with <code>WITH NOCHECK</code>.</li>
  <li><strong>Adding an FK to an existing table</strong> validates every existing row under <code>WITH CHECK</code>. Orphans from years of disabled constraints make the <code>ALTER TABLE</code> fail — find them first.</li>
  <li><strong>Hot parent rows.</strong> Millions of children referencing one parent row take key-range locks; a busy parent key can serialize inserts that have nothing to do with each other.</li>
  <li><strong>Deleting “test” parents</strong> in a database where CASCADE rules were chosen hastily.</li>
</ul>
<p>A quick trust check every DBA should run after any migration:</p>
<pre><code class="language-sql">SELECT name, is_disabled, is_not_trusted, delete_referential_action_desc
FROM   sys.foreign_keys
WHERE  is_disabled = 1 OR is_not_trusted = 1;</code></pre>
`
    }
  ],

  scenario: {
    title: "A one-row delete removed 1.4 million order lines",
    html: `
<p>A developer cleaned up a customer account with <code>DELETE FROM sales.Customers WHERE customer_id = 7</code>. The migration had quietly switched the foreign keys to <code>ON DELETE CASCADE</code> “to make cleanup easier”. Within 30 seconds the delete fanned out through Orders into OrderLines, held key-range locks on the clustered index, and the order-entry application began timing out. The statement was killed after three hours — but 1.4 million order lines were gone and the log had swelled to 480 GB.</p>
<p>The DBA restored the affected tables from the full plus transaction-log backups into a staging database, scripted an <code>INSERT … SELECT</code> to bring the rows back inside a single transaction, and rebuilt the indexes. Prevention: both FKs were rebuilt as <code>ON DELETE NO ACTION</code>, a stored procedure <code>sales.usp_DeleteCustomer</code> became the only sanctioned path (with an explicit child-row count printed before deletion), and the incident became a standing rule — <strong>CASCADE belongs on dependent children, never on financial history</strong>.</p>
`
  },

  interview: [
    {
      q: "Primary key or unique key — what is the difference?",
      a: "Both enforce uniqueness, but only one primary key is allowed per table, it can never contain NULLs, and it defines the table's clustered index by default. A unique key may be one of several, allows one NULL by default, and is the typical target for foreign keys on non-PK columns."
    },
    {
      q: "Surrogate or natural key — how do you decide?",
      a: "Use a natural key when the business value is genuinely unique, immutable, and short. Use a surrogate (identity/sequence) when the natural candidate is long, composite, nullable, prone to change, or not truly unique — because changing a key that other tables reference is a data migration, not an edit."
    },
    {
      q: "You are adding a foreign key to a 200-million-row table. What do you check first?",
      a: "That an index exists on the FK column (the constraint will not create one), that every existing child row has a matching parent — query for orphans before running the ALTER — and that the validation scan fits the change window, since WITH CHECK must read and check every row. Prefer building the constraint with WITH NOCHECK only as a documented exception, then fixing data and revalidating."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is the column or column set that uniquely identifies every row in a table.”",
      "options": [
        "every",
        "primary key (PK)",
        "foreign key (FK)"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A primary key (PK) is the column or column set that uniquely identifies every row in a table. SQL Server enforces two rules absolutely:”"
    },
    {
      "question": "Complete the lesson statement: “A _____ is a column in one table holding the primary key (or a unique key) of another.”",
      "options": [
        "foreign key (FK)",
        "every",
        "Insert/update of a child"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A foreign key (FK) is a column in one table holding the primary key (or a unique key) of another. It declares “this row belongs to that parent”, and the engine enforces the declaration on every write, from every application:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Referential actions: what happens to the children”?",
      "options": [
        "Safest default — deletion must be deliberate",
        "Behavioural twin of NO ACTION in SQL Server",
        "When a parent row is deleted (or its key updated), the FK action decides the outcome."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “When a parent row is deleted (or its key updated), the FK action decides the outcome. Choosing this at design time is easy; changing it later is a migration with blast radius.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Building the keys in T-SQL”?",
      "options": [
        "Rare — needs a sensible default parent",
        "A realistic pair of parent and child tables with an explicit referential design:",
        "Optional relationships — requires a nullable FK"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A realistic pair of parent and child tables with an explicit referential design:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production pitfalls”?",
      "options": [
        "A quick trust check every DBA should run after any migration:",
        "Rare — needs a sensible default parent",
        "A realistic pair of parent and child tables with an explicit referential design:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A quick trust check every DBA should run after any migration:”"
    },
    {
      "question": "Complete the lesson statement: “Defining a PK also creates a unique index to enforce it, and by default it becomes the table's _____ — meaning the table's rows are physically stored in PK order.”",
      "options": [
        "RESTRICT",
        "CASCADE",
        "clustered index"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Defining a PK also creates a unique index to enforce it, and by default it becomes the table's clustered index — meaning the table's rows are physically stored in PK order. That single decision influences read performance for the life of the table, which is why key choice deserves more thought than “make it an int and move on”.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Referential actions: what happens to the children”?",
      "options": [
        "Uniqueness",
        "CASCADE is the action people regret most: one DELETE can fan out through several tables, hold locks for minutes, and delete far more than intended.",
        "Rare — needs a sensible default parent"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “CASCADE is the action people regret most: one DELETE can fan out through several tables, hold locks for minutes, and delete far more than intended. In production, cascade only on genuinely dependent, low-value children — never across a chain that includes financial history.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Building the keys in T-SQL”?",
      "options": [
        "Composite keys are equally normal — a junction table's PK spans both foreign keys, which by definition prevents the same pair appearing twice.",
        "Uniqueness",
        "NOT NULL"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Composite keys are equally normal — a junction table's PK spans both foreign keys, which by definition prevents the same pair appearing twice.”"
    },
    {
      "question": "In the “Referential actions: what happens to the children” table, what is listed for “NO ACTION (default)” under “Typical use”?",
      "options": [
        "NOT NULL",
        "Natural key",
        "Safest default — deletion must be deliberate"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “NO ACTION (default)” as “Safest default — deletion must be deliberate”."
    },
    {
      "question": "In the “Referential actions: what happens to the children” table, what is listed for “RESTRICT” under “Typical use”?",
      "options": [
        "Surrogate key",
        "Behavioural twin of NO ACTION in SQL Server",
        "Natural key"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “RESTRICT” as “Behavioural twin of NO ACTION in SQL Server”."
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is the column or column set that uniquely identifies every row in a table.”",
      "options": [
        "every",
        "primary key (PK)",
        "foreign key (FK)"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A primary key (PK) is the column or column set that uniquely identifies every row in a table. SQL Server enforces two rules absolutely:”"
    },
    {
      "question": "Complete the lesson statement: “A _____ is a column in one table holding the primary key (or a unique key) of another.”",
      "options": [
        "foreign key (FK)",
        "every",
        "Insert/update of a child"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A foreign key (FK) is a column in one table holding the primary key (or a unique key) of another. It declares “this row belongs to that parent”, and the engine enforces the declaration on every write, from every application:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Referential actions: what happens to the children”?",
      "options": [
        "Safest default — deletion must be deliberate",
        "Behavioural twin of NO ACTION in SQL Server",
        "When a parent row is deleted (or its key updated), the FK action decides the outcome."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “When a parent row is deleted (or its key updated), the FK action decides the outcome. Choosing this at design time is easy; changing it later is a migration with blast radius.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Building the keys in T-SQL”?",
      "options": [
        "Rare — needs a sensible default parent",
        "A realistic pair of parent and child tables with an explicit referential design:",
        "Optional relationships — requires a nullable FK"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A realistic pair of parent and child tables with an explicit referential design:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production pitfalls”?",
      "options": [
        "A quick trust check every DBA should run after any migration:",
        "Rare — needs a sensible default parent",
        "A realistic pair of parent and child tables with an explicit referential design:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A quick trust check every DBA should run after any migration:”"
    },
    {
      "question": "Complete the lesson statement: “Defining a PK also creates a unique index to enforce it, and by default it becomes the table's _____ — meaning the table's rows are physically stored in PK order.”",
      "options": [
        "RESTRICT",
        "CASCADE",
        "clustered index"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Defining a PK also creates a unique index to enforce it, and by default it becomes the table's clustered index — meaning the table's rows are physically stored in PK order. That single decision influences read performance for the life of the table, which is why key choice deserves more thought than “make it an int and move on”.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Referential actions: what happens to the children”?",
      "options": [
        "Uniqueness",
        "CASCADE is the action people regret most: one DELETE can fan out through several tables, hold locks for minutes, and delete far more than intended.",
        "Rare — needs a sensible default parent"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “CASCADE is the action people regret most: one DELETE can fan out through several tables, hold locks for minutes, and delete far more than intended. In production, cascade only on genuinely dependent, low-value children — never across a chain that includes financial history.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Building the keys in T-SQL”?",
      "options": [
        "Composite keys are equally normal — a junction table's PK spans both foreign keys, which by definition prevents the same pair appearing twice.",
        "Uniqueness",
        "NOT NULL"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Composite keys are equally normal — a junction table's PK spans both foreign keys, which by definition prevents the same pair appearing twice.”"
    },
    {
      "question": "In the “Referential actions: what happens to the children” table, what is listed for “NO ACTION (default)” under “Typical use”?",
      "options": [
        "NOT NULL",
        "Natural key",
        "Safest default — deletion must be deliberate"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “NO ACTION (default)” as “Safest default — deletion must be deliberate”."
    },
    {
      "question": "In the “Referential actions: what happens to the children” table, what is listed for “RESTRICT” under “Typical use”?",
      "options": [
        "Surrogate key",
        "Behavioural twin of NO ACTION in SQL Server",
        "Natural key"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “RESTRICT” as “Behavioural twin of NO ACTION in SQL Server”."
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is the column or column set that uniquely identifies every row in a table.”",
      "options": [
        "every",
        "primary key (PK)",
        "foreign key (FK)"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A primary key (PK) is the column or column set that uniquely identifies every row in a table. SQL Server enforces two rules absolutely:”"
    },
    {
      "question": "Complete the lesson statement: “A _____ is a column in one table holding the primary key (or a unique key) of another.”",
      "options": [
        "foreign key (FK)",
        "every",
        "Insert/update of a child"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A foreign key (FK) is a column in one table holding the primary key (or a unique key) of another. It declares “this row belongs to that parent”, and the engine enforces the declaration on every write, from every application:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Referential actions: what happens to the children”?",
      "options": [
        "Safest default — deletion must be deliberate",
        "Behavioural twin of NO ACTION in SQL Server",
        "When a parent row is deleted (or its key updated), the FK action decides the outcome."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “When a parent row is deleted (or its key updated), the FK action decides the outcome. Choosing this at design time is easy; changing it later is a migration with blast radius.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Building the keys in T-SQL”?",
      "options": [
        "Rare — needs a sensible default parent",
        "A realistic pair of parent and child tables with an explicit referential design:",
        "Optional relationships — requires a nullable FK"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A realistic pair of parent and child tables with an explicit referential design:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production pitfalls”?",
      "options": [
        "A quick trust check every DBA should run after any migration:",
        "Rare — needs a sensible default parent",
        "A realistic pair of parent and child tables with an explicit referential design:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A quick trust check every DBA should run after any migration:”"
    },
    {
      "question": "Complete the lesson statement: “Defining a PK also creates a unique index to enforce it, and by default it becomes the table's _____ — meaning the table's rows are physically stored in PK order.”",
      "options": [
        "RESTRICT",
        "CASCADE",
        "clustered index"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Defining a PK also creates a unique index to enforce it, and by default it becomes the table's clustered index — meaning the table's rows are physically stored in PK order. That single decision influences read performance for the life of the table, which is why key choice deserves more thought than “make it an int and move on”.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Referential actions: what happens to the children”?",
      "options": [
        "Uniqueness",
        "CASCADE is the action people regret most: one DELETE can fan out through several tables, hold locks for minutes, and delete far more than intended.",
        "Rare — needs a sensible default parent"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “CASCADE is the action people regret most: one DELETE can fan out through several tables, hold locks for minutes, and delete far more than intended. In production, cascade only on genuinely dependent, low-value children — never across a chain that includes financial history.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Building the keys in T-SQL”?",
      "options": [
        "Composite keys are equally normal — a junction table's PK spans both foreign keys, which by definition prevents the same pair appearing twice.",
        "Uniqueness",
        "NOT NULL"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Composite keys are equally normal — a junction table's PK spans both foreign keys, which by definition prevents the same pair appearing twice.”"
    },
    {
      "question": "In the “Referential actions: what happens to the children” table, what is listed for “NO ACTION (default)” under “Typical use”?",
      "options": [
        "NOT NULL",
        "Natural key",
        "Safest default — deletion must be deliberate"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “NO ACTION (default)” as “Safest default — deletion must be deliberate”."
    },
    {
      "question": "In the “Referential actions: what happens to the children” table, what is listed for “RESTRICT” under “Typical use”?",
      "options": [
        "Surrogate key",
        "Behavioural twin of NO ACTION in SQL Server",
        "Natural key"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “RESTRICT” as “Behavioural twin of NO ACTION in SQL Server”."
    }
  ],
  takeaways: [
    "A primary key guarantees NOT NULL and uniqueness — and by default becomes the clustered index",
    "A foreign key carries the parent's key into the child and makes orphan rows impossible to store",
    "Choose referential actions deliberately: NO ACTION is the safe default; CASCADE has real blast radius",
    "Index every foreign key column — the engine creates no index for you",
    "Audit constraints for disabled/untrusted states after bulk loads and migrations"
  ]
};
