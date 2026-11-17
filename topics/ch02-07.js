/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch02-07.html */

window.TOPIC = {
  id: "ch02-07",
  title: "Relationships: One-to-One, One-to-Many, Many-to-Many",

  lead: "Cardinality — how many rows on each side of a relationship — is the central modelling decision of a relational schema, and the foreign key's placement follows from it every time.",

  objectives: [
    "State the three basic relationship types and their cardinality",
    "Place foreign keys correctly for each relationship type",
    "Build junction tables for many-to-many relationships",
    "Recognise when a one-to-one split is justified",
    "Avoid the modelling mistakes that surface as broken reporting"
  ],

  sections: [
    {
      h: "What a relationship actually is",
      html: `
<p>A <strong>relationship</strong> is a declared association between two tables, carried by a foreign key: the child column stores the parent's key value, and the database guarantees the pairing. Two questions define every relationship:</p>
<ul>
  <li><strong>Cardinality</strong> — for one row on side A, how many rows can exist on side B? (1, N, or “many” on both sides)</li>
  <li><strong>Optionality</strong> — is the child row required or optional? (an order must have a customer; a customer may have no orders yet — the FK is still NOT NULL, because a <em>row</em> that exists must name its parent)</li>
</ul>
<p>The three cardinalities cover nearly every real schema. Each one has exactly one correct place for the foreign key, and putting it anywhere else produces a design that cannot be enforced by the engine.</p>
<blockquote>Cardinality is decided at design time with a whiteboard. Moving it later is a data migration with stakeholders attached.</blockquote>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="One-to-one, one-to-many, and many-to-many relationships">
    <defs>
      <marker id="rel-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <text x="130" y="30" text-anchor="middle" fill="var(--accent-strong)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">One-to-many</text>
    <rect x="30" y="50" width="200" height="50" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="130" y="80" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Customers</text>
    <line x1="130" y1="100" x2="130" y2="132" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#rel-arrow)"/>
    <text x="108" y="122" fill="var(--muted)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">1</text>
    <text x="146" y="122" fill="var(--muted)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">N</text>
    <rect x="30" y="136" width="200" height="50" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="130" y="166" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Orders</text>
    <text x="130" y="212" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">FK lives on the many side</text>
    <text x="130" y="232" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Orders.customer_id → Customers</text>
    <text x="130" y="252" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">The default of nearly all schemas</text>

    <text x="380" y="30" text-anchor="middle" fill="var(--accent-strong)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">One-to-one</text>
    <rect x="280" y="50" width="200" height="50" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="80" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Users</text>
    <line x1="380" y1="100" x2="380" y2="132" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#rel-arrow)"/>
    <text x="358" y="122" fill="var(--muted)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">1</text>
    <text x="396" y="122" fill="var(--muted)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">1</text>
    <rect x="280" y="136" width="200" height="50" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="166" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">UserProfiles</text>
    <text x="380" y="212" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Child PK = FK = PK</text>
    <text x="380" y="232" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Splits wide or sensitive columns</text>
    <text x="380" y="252" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Parent row may exist alone</text>

    <text x="630" y="30" text-anchor="middle" fill="var(--accent-strong)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">Many-to-many</text>
    <rect x="525" y="50" width="100" height="50" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="575" y="80" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Students</text>
    <rect x="640" y="50" width="100" height="50" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="690" y="80" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Courses</text>
    <line x1="575" y1="100" x2="608" y2="132" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#rel-arrow)"/>
    <line x1="690" y1="100" x2="652" y2="132" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#rel-arrow)"/>
    <rect x="555" y="136" width="150" height="50" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="630" y="166" text-anchor="middle" fill="var(--accent-strong)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">Enrolments</text>
    <text x="630" y="212" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Junction table, two FKs</text>
    <text x="630" y="232" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">PK = (student_id, course_id)</text>
    <text x="630" y="252" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">No duplicates, ever</text>

    <line x1="15" y1="278" x2="745" y2="278" stroke="var(--border)" stroke-width="1.4"/>
    <text x="380" y="308" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Rule: the foreign key always lives on the side that can hold many — or on both sides of a junction table.</text>
    <text x="380" y="330" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">A relationship the engine cannot enforce is a comment, not a constraint.</text>
  </svg>
  <div class="figcaption">Figure 1 — The three cardinalities and where their keys live.</div>
</div>
`
    },
    {
      h: "One-to-many: the workhorse",
      html: `
<p>In a one-to-many relationship, one parent row is referenced by zero, one, or many child rows. The foreign key goes on the <strong>many</strong> side — always. A customer does not store a list of orders; each order stores the customer's key.</p>
<ul>
  <li>Parent side: the primary key (or a unique key)</li>
  <li>Child side: a NOT NULL foreign key plus an index on it, so joins and parent lookups stay fast</li>
  <li>Deletion of a parent is governed by the referential action (NO ACTION by default)</li>
</ul>
<p>This pattern scales from “one user owns many documents” to “one server hosts many databases”. When you see a repeating group or a comma-separated list inside a parent column, you are looking at a one-to-many relationship that has not been modelled yet.</p>
`
    },
    {
      h: "One-to-one and many-to-many",
      html: `
<p><strong>One-to-one</strong> is rare and deliberate. The child table's primary key <em>is</em> the foreign key — one profile row per user, at most. Legitimate uses: splitting rarely-updated or heavily-referenced columns out of a hot table, isolating sensitive columns with their own permissions, or holding data that is genuinely optional per parent. Two one-to-one tables sharing only a key often signal a table that should be merged.</p>
<p><strong>Many-to-many</strong> cannot be expressed with a single foreign key — both sides can hold many. The answer is always the same: a <strong>junction</strong> (bridge) table containing both foreign keys, with a composite primary key that makes each pairing appear at most once:</p>
<pre><code class="language-sql">CREATE TABLE school.Students
(
    student_id int           IDENTITY(1,1) NOT NULL,
    full_name  nvarchar(100) NOT NULL,
    CONSTRAINT PK_Students PRIMARY KEY CLUSTERED (student_id)
);

CREATE TABLE school.Courses
(
    course_id   int           IDENTITY(1,1) NOT NULL,
    course_name nvarchar(100) NOT NULL,
    CONSTRAINT PK_Courses PRIMARY KEY CLUSTERED (course_id)
);

CREATE TABLE school.Enrolments
(
    student_id  int  NOT NULL,
    course_id   int  NOT NULL,
    enrolled_on date NOT NULL
                CONSTRAINT DF_Enrolments_on DEFAULT (CAST(GETDATE() AS date)),
    CONSTRAINT PK_Enrolments PRIMARY KEY CLUSTERED (student_id, course_id),
    CONSTRAINT FK_Enrolments_Students FOREIGN KEY (student_id)
        REFERENCES school.Students (student_id),
    CONSTRAINT FK_Enrolments_Courses FOREIGN KEY (course_id)
        REFERENCES school.Courses (course_id)
);
-- PK leads with student_id; add the reverse lookup path
CREATE INDEX IX_Enrolments_course ON school.Enrolments (course_id);

-- Read the relationship across all three tables
SELECT s.full_name, c.course_name, e.enrolled_on
FROM   school.Students    AS s
JOIN   school.Enrolments  AS e ON e.student_id = s.student_id
JOIN   school.Courses     AS c ON c.course_id  = e.course_id
ORDER  BY c.course_name, s.full_name;</code></pre>
<p>The junction table can carry its own attributes — enrolled_on, grade, quantity — which is exactly why junctions are modelled as tables rather than lists.</p>
<table>
  <tr><th>Type</th><th>For one row on side A</th><th>FK placement</th><th>Example</th></tr>
  <tr><td><strong>One-to-many</strong></td><td>0..N rows on side B</td><td>On side B</td><td>Customer → Orders</td></tr>
  <tr><td><strong>One-to-one</strong></td><td>At most 1 row on side B</td><td>Child PK doubles as FK</td><td>User → UserDetail</td></tr>
  <tr><td><strong>Many-to-many</strong></td><td>0..N on both sides</td><td>Two FKs in a junction table</td><td>Student ↔ Course via Enrolments</td></tr>
</table>
`
    },
    {
      h: "Choosing cardinality in real designs",
      html: `
<p>Design questions that settle the relationship before any DDL runs:</p>
<ul>
  <li><strong>Can a parent exist without children, and children without parents?</strong> — decides nullability and the referential action</li>
  <li><strong>Do children carry their own attributes?</strong> — if “the link itself” has data (dates, quantities, roles), it is a junction or child table, not a flag column</li>
  <li><strong>Is the pair unique?</strong> — that uniqueness belongs in the junction table's composite key, not in application code</li>
  <li><strong>Will this cardinality still hold in two years?</strong> — “one contract per customer” tends to become “many”; design for the question, not the current answer</li>
</ul>
<p><strong>Common pitfalls:</strong> FK placed on the parent (“Customer.order_id” storing only the first order); comma-separated values in a column doing a junction table's job; junction tables missing their composite key, so enrolments duplicate silently; and assuming one-to-one forever, then needing a migration when the second row finally arrives.</p>
`
    }
  ],

  scenario: {
    title: "The audit asked which customers hold which licences — nobody could answer",
    html: `
<p>A regulator's request due Friday: list every customer with every licence product in force. The ProductLicences column on the customer table held a comma-separated string — <code>SUITE-365,VISIO-STD,PLAN-PRO</code> — padded to fit, sometimes with spaces, sometimes truncated at 256 characters. Three years of sales had no reliable way to count licences per product or products per customer, and an evening of string splitting revealed at least 40 customers whose strings no longer matched the invoices.</p>
<p>The DBA's resolution under the deadline: built the correct model — a <code>Licences</code> junction table with (customer_id, product_id) as the primary key and a licensed_on date — then parsed the existing strings into it with <code>STRING_SPLIT</code>, quarantined unmatched rows for the sales team to reconcile, and produced the audit report from the new table by Wednesday. Prevention: the intake form and API were changed to write rows, not strings, and every future many-to-many link now needs a composite key on its junction table. <strong>A many-to-many relationship hidden in a string column is a relationship the database cannot enforce, validate, or query.</strong></p>
`
  },

  interview: [
    {
      q: "Where does the foreign key go in a one-to-many relationship?",
      a: "On the many side — the child table references the parent's primary key. The parent cannot hold a list of children; putting the key on the parent would allow only one child and could not be enforced."
    },
    {
      q: "How do you model a many-to-many relationship?",
      a: "With a junction table containing a foreign key to each side, and a composite primary key across both keys so a pairing cannot repeat. The junction table is also where relationship attributes — dates, quantities, roles — naturally live."
    },
    {
      q: "When is a one-to-one relationship appropriate?",
      a: "When a row of a parent has at most one related row and splitting it has a concrete benefit: isolating sensitive or rarely-read columns with separate permissions, keeping a hot table narrow, or holding genuinely optional per-parent detail. The child's primary key is both PK and FK."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is a declared association between two tables, carried by a foreign key: the child column stores the parent's key value, and the database guarantees the pairing.”",
      "options": [
        "One-to-many",
        "Can a parent exist without children, and children without parents?",
        "relationship"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A relationship is a declared association between two tables, carried by a foreign key: the child column stores the parent's key value, and the database guarantees the pairing. Two questions define every relationship:”"
    },
    {
      "question": "Complete the lesson statement: “In a one-to-_____ relationship, one parent row is referenced by zero, one, or many child rows.”",
      "options": [
        "Do children carry their own attributes?",
        "many",
        "Can a parent exist without children, and children without parents?"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In a one-to-many relationship, one parent row is referenced by zero, one, or many child rows. The foreign key goes on the many side — always. A customer does not store a list of orders; each order stores the customer's key.”"
    },
    {
      "question": "Complete the lesson statement: “_____ is rare and deliberate.”",
      "options": [
        "One-to-one",
        "Do children carry their own attributes?",
        "Is the pair unique?"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “One-to-one is rare and deliberate. The child table's primary key is the foreign key — one profile row per user, at most. Legitimate uses: splitting rarely-updated or heavily-referenced columns out of a hot table, isolating sensitive columns with their own permissions, or holding data that is genuinely optional per parent. Two one-to-one tables sharing only a key often signal a table that should be merged.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Choosing cardinality in real designs”?",
      "options": [
        "Common pitfalls:",
        "Cardinality",
        "Design questions that settle the relationship before any DDL runs:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Design questions that settle the relationship before any DDL runs:”"
    },
    {
      "question": "Which fact is covered in the lesson section “What a relationship actually is”?",
      "options": [
        "Optionality",
        "The three cardinalities cover nearly every real schema.",
        "Cardinality"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The three cardinalities cover nearly every real schema. Each one has exactly one correct place for the foreign key, and putting it anywhere else produces a design that cannot be enforced by the engine.”"
    },
    {
      "question": "Which fact is covered in the lesson section “One-to-many: the workhorse”?",
      "options": [
        "This pattern scales from “one user owns many documents” to “one server hosts many databases”.",
        "Optionality",
        "row"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “This pattern scales from “one user owns many documents” to “one server hosts many databases”. When you see a repeating group or a comma-separated list inside a parent column, you are looking at a one-to-many relationship that has not been modelled yet.”"
    },
    {
      "question": "Complete the lesson statement: “_____ cannot be expressed with a single foreign key — both sides can hold many.”",
      "options": [
        "The three cardinalities cover nearly every real schema.",
        "This pattern scales from “one user owns many documents” to “one server hosts many databases”.",
        "Many-to-many"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Many-to-many cannot be expressed with a single foreign key — both sides can hold many. The answer is always the same: a junction (bridge) table containing both foreign keys, with a composite primary key that makes each pairing appear at most once:”"
    },
    {
      "question": "Complete the lesson statement: “_____ FK placed on the parent (“Customer.order_id” storing only the first order); comma-separated values in a column doing a junction table's…”",
      "options": [
        "The junction table can carry its own attributes — enrolled_on, grade, quantity — which is exactly why junctions are modelled as tables rather than lists.",
        "Common pitfalls:",
        "This pattern scales from “one user owns many documents” to “one server hosts many databases”."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Common pitfalls: FK placed on the parent (“Customer.order_id” storing only the first order); comma-separated values in a column doing a junction table's job; junction tables missing their composite key, so enrolments duplicate silently; and assuming one-to-one forever, then needing a migration when the second row finally arrives.”"
    },
    {
      "question": "Which fact is covered in the lesson section “One-to-one and many-to-many”?",
      "options": [
        "The junction table can carry its own attributes — enrolled_on, grade, quantity — which is exactly why junctions are modelled as tables rather than lists.",
        "One-to-many",
        "Can a parent exist without children, and children without parents?"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The junction table can carry its own attributes — enrolled_on, grade, quantity — which is exactly why junctions are modelled as tables rather than lists.”"
    },
    {
      "question": "In the “One-to-one and many-to-many” table, what is listed for “One-to-many” under “Example”?",
      "options": [
        "Can a parent exist without children, and children without parents?",
        "Do children carry their own attributes?",
        "Customer → Orders"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “One-to-many” as “Customer → Orders”."
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is a declared association between two tables, carried by a foreign key: the child column stores the parent's key value, and the database guarantees the pairing.”",
      "options": [
        "One-to-many",
        "Can a parent exist without children, and children without parents?",
        "relationship"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A relationship is a declared association between two tables, carried by a foreign key: the child column stores the parent's key value, and the database guarantees the pairing. Two questions define every relationship:”"
    },
    {
      "question": "Complete the lesson statement: “In a one-to-_____ relationship, one parent row is referenced by zero, one, or many child rows.”",
      "options": [
        "Do children carry their own attributes?",
        "many",
        "Can a parent exist without children, and children without parents?"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In a one-to-many relationship, one parent row is referenced by zero, one, or many child rows. The foreign key goes on the many side — always. A customer does not store a list of orders; each order stores the customer's key.”"
    },
    {
      "question": "Complete the lesson statement: “_____ is rare and deliberate.”",
      "options": [
        "One-to-one",
        "Do children carry their own attributes?",
        "Is the pair unique?"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “One-to-one is rare and deliberate. The child table's primary key is the foreign key — one profile row per user, at most. Legitimate uses: splitting rarely-updated or heavily-referenced columns out of a hot table, isolating sensitive columns with their own permissions, or holding data that is genuinely optional per parent. Two one-to-one tables sharing only a key often signal a table that should be merged.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Choosing cardinality in real designs”?",
      "options": [
        "Common pitfalls:",
        "Cardinality",
        "Design questions that settle the relationship before any DDL runs:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Design questions that settle the relationship before any DDL runs:”"
    },
    {
      "question": "Which fact is covered in the lesson section “What a relationship actually is”?",
      "options": [
        "Optionality",
        "The three cardinalities cover nearly every real schema.",
        "Cardinality"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The three cardinalities cover nearly every real schema. Each one has exactly one correct place for the foreign key, and putting it anywhere else produces a design that cannot be enforced by the engine.”"
    },
    {
      "question": "Which fact is covered in the lesson section “One-to-many: the workhorse”?",
      "options": [
        "This pattern scales from “one user owns many documents” to “one server hosts many databases”.",
        "Optionality",
        "row"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “This pattern scales from “one user owns many documents” to “one server hosts many databases”. When you see a repeating group or a comma-separated list inside a parent column, you are looking at a one-to-many relationship that has not been modelled yet.”"
    },
    {
      "question": "Complete the lesson statement: “_____ cannot be expressed with a single foreign key — both sides can hold many.”",
      "options": [
        "The three cardinalities cover nearly every real schema.",
        "This pattern scales from “one user owns many documents” to “one server hosts many databases”.",
        "Many-to-many"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Many-to-many cannot be expressed with a single foreign key — both sides can hold many. The answer is always the same: a junction (bridge) table containing both foreign keys, with a composite primary key that makes each pairing appear at most once:”"
    },
    {
      "question": "Complete the lesson statement: “_____ FK placed on the parent (“Customer.order_id” storing only the first order); comma-separated values in a column doing a junction table's…”",
      "options": [
        "The junction table can carry its own attributes — enrolled_on, grade, quantity — which is exactly why junctions are modelled as tables rather than lists.",
        "Common pitfalls:",
        "This pattern scales from “one user owns many documents” to “one server hosts many databases”."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Common pitfalls: FK placed on the parent (“Customer.order_id” storing only the first order); comma-separated values in a column doing a junction table's job; junction tables missing their composite key, so enrolments duplicate silently; and assuming one-to-one forever, then needing a migration when the second row finally arrives.”"
    },
    {
      "question": "Which fact is covered in the lesson section “One-to-one and many-to-many”?",
      "options": [
        "The junction table can carry its own attributes — enrolled_on, grade, quantity — which is exactly why junctions are modelled as tables rather than lists.",
        "One-to-many",
        "Can a parent exist without children, and children without parents?"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The junction table can carry its own attributes — enrolled_on, grade, quantity — which is exactly why junctions are modelled as tables rather than lists.”"
    },
    {
      "question": "In the “One-to-one and many-to-many” table, what is listed for “One-to-many” under “Example”?",
      "options": [
        "Can a parent exist without children, and children without parents?",
        "Do children carry their own attributes?",
        "Customer → Orders"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “One-to-many” as “Customer → Orders”."
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is a declared association between two tables, carried by a foreign key: the child column stores the parent's key value, and the database guarantees the pairing.”",
      "options": [
        "One-to-many",
        "Can a parent exist without children, and children without parents?",
        "relationship"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A relationship is a declared association between two tables, carried by a foreign key: the child column stores the parent's key value, and the database guarantees the pairing. Two questions define every relationship:”"
    },
    {
      "question": "Complete the lesson statement: “In a one-to-_____ relationship, one parent row is referenced by zero, one, or many child rows.”",
      "options": [
        "Do children carry their own attributes?",
        "many",
        "Can a parent exist without children, and children without parents?"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In a one-to-many relationship, one parent row is referenced by zero, one, or many child rows. The foreign key goes on the many side — always. A customer does not store a list of orders; each order stores the customer's key.”"
    },
    {
      "question": "Complete the lesson statement: “_____ is rare and deliberate.”",
      "options": [
        "One-to-one",
        "Do children carry their own attributes?",
        "Is the pair unique?"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “One-to-one is rare and deliberate. The child table's primary key is the foreign key — one profile row per user, at most. Legitimate uses: splitting rarely-updated or heavily-referenced columns out of a hot table, isolating sensitive columns with their own permissions, or holding data that is genuinely optional per parent. Two one-to-one tables sharing only a key often signal a table that should be merged.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Choosing cardinality in real designs”?",
      "options": [
        "Common pitfalls:",
        "Cardinality",
        "Design questions that settle the relationship before any DDL runs:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Design questions that settle the relationship before any DDL runs:”"
    },
    {
      "question": "Which fact is covered in the lesson section “What a relationship actually is”?",
      "options": [
        "Optionality",
        "The three cardinalities cover nearly every real schema.",
        "Cardinality"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The three cardinalities cover nearly every real schema. Each one has exactly one correct place for the foreign key, and putting it anywhere else produces a design that cannot be enforced by the engine.”"
    },
    {
      "question": "Which fact is covered in the lesson section “One-to-many: the workhorse”?",
      "options": [
        "This pattern scales from “one user owns many documents” to “one server hosts many databases”.",
        "Optionality",
        "row"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “This pattern scales from “one user owns many documents” to “one server hosts many databases”. When you see a repeating group or a comma-separated list inside a parent column, you are looking at a one-to-many relationship that has not been modelled yet.”"
    },
    {
      "question": "Complete the lesson statement: “_____ cannot be expressed with a single foreign key — both sides can hold many.”",
      "options": [
        "The three cardinalities cover nearly every real schema.",
        "This pattern scales from “one user owns many documents” to “one server hosts many databases”.",
        "Many-to-many"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Many-to-many cannot be expressed with a single foreign key — both sides can hold many. The answer is always the same: a junction (bridge) table containing both foreign keys, with a composite primary key that makes each pairing appear at most once:”"
    },
    {
      "question": "Complete the lesson statement: “_____ FK placed on the parent (“Customer.order_id” storing only the first order); comma-separated values in a column doing a junction table's…”",
      "options": [
        "The junction table can carry its own attributes — enrolled_on, grade, quantity — which is exactly why junctions are modelled as tables rather than lists.",
        "Common pitfalls:",
        "This pattern scales from “one user owns many documents” to “one server hosts many databases”."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Common pitfalls: FK placed on the parent (“Customer.order_id” storing only the first order); comma-separated values in a column doing a junction table's job; junction tables missing their composite key, so enrolments duplicate silently; and assuming one-to-one forever, then needing a migration when the second row finally arrives.”"
    },
    {
      "question": "Which fact is covered in the lesson section “One-to-one and many-to-many”?",
      "options": [
        "The junction table can carry its own attributes — enrolled_on, grade, quantity — which is exactly why junctions are modelled as tables rather than lists.",
        "One-to-many",
        "Can a parent exist without children, and children without parents?"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The junction table can carry its own attributes — enrolled_on, grade, quantity — which is exactly why junctions are modelled as tables rather than lists.”"
    },
    {
      "question": "In the “One-to-one and many-to-many” table, what is listed for “One-to-many” under “Example”?",
      "options": [
        "Can a parent exist without children, and children without parents?",
        "Do children carry their own attributes?",
        "Customer → Orders"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “One-to-many” as “Customer → Orders”."
    }
  ],
  takeaways: [
    "Cardinality (1:1, 1:N, M:N) plus optionality define every relationship — the FK goes on the side that can hold many",
    "One-to-many is the default shape of relational design; index the FK column on the child",
    "Many-to-many always becomes a junction table with both FKs and a composite primary key",
    "One-to-one splits columns deliberately — the child's PK doubles as its FK",
    "Comma-separated lists and parent-side key columns are unenforceable relationships waiting to be reported on"
  ]
};
