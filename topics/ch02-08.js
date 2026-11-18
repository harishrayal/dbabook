/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch02-08.html */

window.TOPIC = {
  id: "ch02-08",
  title: "Normalization: 1NF, 2NF, and 3NF",

  lead: "Normalisation organizes data to reduce redundancy and update anomalies — the first, second, and third normal forms provide a framework for reasoning about dependencies in relational designs.",

  objectives: [
    "Explain why redundant data causes insert, update, and delete anomalies",
    "Apply first normal form: atomic values and no repeating groups",
    "Apply second normal form: no partial dependency on part of a key",
    "Apply third normal form: no transitive dependency on the key",
    "Weigh deliberate denormalisation with eyes open"
  ],

  sections: [
    {
      h: "Why normalise",
      html: `
<p><strong>Normalisation</strong> is the process of organising tables to reduce undesirable redundancy and update anomalies. It often stores a fact once and refers to it by key, though practical schemas may deliberately duplicate data for historical or performance reasons. Its payoff is simpler maintenance of consistent facts: when the same current fact is copied into many rows, updates can be missed.</p>
<table>
  <tr><th>Anomaly</th><th>What goes wrong</th><th>Example</th></tr>
  <tr><td><strong>Insert</strong></td><td>You cannot record a fact without unrelated facts</td><td>A new customer cannot exist until they place their first order</td></tr>
  <tr><td><strong>Update</strong></td><td>The same fact is duplicated across rows; one update is missed</td><td>A customer moves house — 400 order rows still ship to the old address</td></tr>
  <tr><td><strong>Delete</strong></td><td>Deleting one row destroys unrelated facts</td><td>Deleting the customer's only order erases their contact details entirely</td></tr>
</table>
<p>The normal forms are stated as a sequence. For many transactional designs, 3NF is a useful target: non-key attributes should depend on candidate keys, the whole key, and nothing but the key. Formal definitions account for candidate keys and prime attributes, so the slogan is a learning aid rather than a complete definition.</p>
<blockquote>“The key, the whole key, and nothing but the key” is a useful 3NF mnemonic for common designs, not the full formal definition.</blockquote>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Progression through the normal forms">
    <defs>
      <marker id="nf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="40" y="8" width="680" height="58" rx="10" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="60" y="32" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Unnormalised</text>
    <text x="60" y="54" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">One wide row: customer_email, product_1, product_2, qty_1, qty_2 … repeating groups everywhere</text>

    <line x1="380" y1="66" x2="380" y2="91" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#nf-arrow)"/>

    <rect x="40" y="93" width="680" height="58" rx="10" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="60" y="117" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">1NF — atomic values</text>
    <text x="60" y="139" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">One value per cell, no repeating groups, every row uniquely identifiable</text>

    <line x1="380" y1="151" x2="380" y2="176" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#nf-arrow)"/>

    <rect x="40" y="178" width="680" height="58" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="60" y="202" fill="var(--accent-strong)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">2NF — plus no partial dependency</text>
    <text x="60" y="224" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">With a composite key, every non-key column depends on the whole key, not part of it</text>

    <line x1="380" y1="236" x2="380" y2="261" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#nf-arrow)"/>

    <rect x="40" y="263" width="680" height="58" rx="10" fill="var(--accent)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="60" y="287" fill="#ffffff" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">3NF — plus no transitive dependency</text>
    <text x="60" y="309" fill="#dbeafe" font-size="12" font-family="Segoe UI, sans-serif">Non-key columns depend on the key, the whole key, and nothing but the key</text>

    <text x="735" y="335" text-anchor="end" fill="var(--muted)" font-size="11.5" font-style="italic" font-family="Segoe UI, sans-serif">Each form removes one class of dependency that causes anomalies.</text>
  </svg>
  <div class="figcaption">Figure 1 — Normal forms remove dependencies step by step: repeating groups, then partial, then transitive.</div>
</div>
`
    },
    {
      h: "First normal form (1NF)",
      html: `
<p>In the usual introductory formulation, a table is in <strong>first normal form</strong> when each cell holds a single value at the chosen level of modeling, there are no repeating groups, and a key distinguishes rows. What counts as atomic depends on the operations the design needs to perform. The classic repeating-group problem looks convenient at design time:</p>
<pre><code class="language-sql">-- NOT 1NF: repeating groups stuffed into one row
CREATE TABLE dbo.CustomerOrdersWide
(
    order_id     int            NOT NULL,
    customer_email nvarchar(256) NOT NULL,
    product_1    nvarchar(100)  NULL,
    product_2    nvarchar(100)  NULL,
    product_3    nvarchar(100)  NULL,
    qty_1        int            NULL,
    qty_2        int            NULL,
    qty_3        int            NULL
);

-- 1NF: one value per cell — every product becomes its own row
CREATE TABLE dbo.OrderLines
(
    order_id  int           NOT NULL,
    line_no   int           NOT NULL,
    product   nvarchar(100) NOT NULL,
    qty       int           NOT NULL,
    CONSTRAINT PK_OrderLines PRIMARY KEY CLUSTERED (order_id, line_no)
);</code></pre>
<p>The fixed “product_1 … product_3” columns cap every order at three items; the proper row-per-line design has no limit, and a query for “who ordered WIDGET-42” becomes a simple predicate instead of <code>product_1 = … OR product_2 = … OR product_3 = …</code>.</p>
<p>One value per cell is not the same as one word: <code>2026-01-15</code> is atomic; <code>'2026-01-15; 2026-02-01'</code> in one column is two facts wearing one hat.</p>
`
    },
    {
      h: "Second normal form (2NF)",
      html: `
<p><strong>Second normal form</strong> is commonly relevant when a candidate key is composite. A table is in 2NF when it is in 1NF and every non-prime attribute depends on the <strong>entire</strong> candidate key — not on a fragment of it. A single-column candidate key has no partial-key dependency. A partial dependency can appear when a composite key carries descriptive data:</p>
<ul>
  <li>Key: (order_id, line_no). If a column depends only on <code>order_id</code> — customer_id, order_date — it belongs on the Orders table, not on the line</li>
  <li>Key: (student_id, course_id). A column depending only on <code>student_id</code> — student_name — belongs on Students</li>
</ul>
<p>Partial dependency creates the exact anomalies 1NF cannot fix: every line of an order repeats the order's data, so correcting an order-level fact means finding every line — and missing one leaves the table disagreeing with itself.</p>
`
    },
    {
      h: "Third normal form (3NF)",
      html: `
<p><strong>Third normal form</strong>, in the common simple-key case, rules out non-key attributes depending transitively on a key through another non-key attribute. The formal definition is more precise: for every nontrivial functional dependency, its determinant must be a superkey or its dependent attribute must be prime. The giveaway in a typical design is a column that functionally determines another: if <code>customer_id → customer_city</code>, storing the current city repeatedly can let one customer have conflicting values.</p>
<pre><code class="language-sql">-- 3NF target: each fact in exactly one table, referenced by key
CREATE TABLE sales.Customers
(
    customer_id   int           IDENTITY(1,1) NOT NULL,
    customer_name nvarchar(100) NOT NULL,
    city          nvarchar(60)  NOT NULL,
    CONSTRAINT PK_Customers PRIMARY KEY CLUSTERED (customer_id)
);

CREATE TABLE sales.Orders
(
    order_id     int           IDENTITY(1,1) NOT NULL,
    customer_id  int           NOT NULL,
    order_date   date          NOT NULL,
    CONSTRAINT PK_Orders PRIMARY KEY CLUSTERED (order_id),
    CONSTRAINT FK_Orders_Customers FOREIGN KEY (customer_id)
        REFERENCES sales.Customers (customer_id)
);

CREATE TABLE sales.OrderLines
(
    order_id   int            NOT NULL,
    line_no    int            NOT NULL,
    product_id int            NOT NULL,
    qty        int            NOT NULL,
    unit_price decimal(12,2)  NOT NULL,
    CONSTRAINT PK_OrderLines PRIMARY KEY CLUSTERED (order_id, line_no),
    CONSTRAINT FK_OrderLines_Orders FOREIGN KEY (order_id)
        REFERENCES sales.Orders (order_id)
);</code></pre>
<table>
  <tr><th>Form</th><th>Requirement</th><th>Removes</th></tr>
  <tr><td><strong>1NF</strong></td><td>Atomic values; no repeating groups; a key identifies each row</td><td>Multi-valued and repeating columns</td></tr>
  <tr><td><strong>2NF</strong></td><td>1NF + each non-prime attribute depends on the whole of every candidate key</td><td>Partial dependencies</td></tr>
  <tr><td><strong>3NF</strong></td><td>2NF + each nontrivial dependency has a superkey determinant or a prime dependent attribute</td><td>Some transitive dependencies</td></tr>
  <tr><td><strong>BCNF</strong></td><td>Every determinant is a candidate key</td><td>Leftover anomalies in rarer cases</td></tr>
</table>
`
    },
    {
      h: "Denormalisation: the deliberate trade",
      html: `
<p>Normalisation optimises for correctness of writes; <strong>denormalisation</strong> trades some redundancy for read speed or convenience — and it is legitimate when it is a decision, not an accident. Data warehouses, summary tables, and reporting views routinely repeat facts so that one query answers one dashboard.</p>
<ul>
  <li><strong>Keep the normalised truth</strong> — the transactional tables stay 3NF; denormalised copies are derived, rebuildable, and clearly marked as such</li>
  <li><strong>One writer</strong> — redundancy becomes corruption the moment two sources can write it independently</li>
  <li><strong>Price the anomaly risk</strong> — a cached total that can drift is a support ticket waiting for month-end</li>
</ul>
<p><strong>Common pitfalls:</strong> “denormalising” by accident — copying customer city into orders during an import; summary columns maintained by triggers nobody knows about; and skipping 1NF because JSON columns “make repeats convenient”, then wondering why filtering on the data requires string surgery.</p>
`
    }
  ],

  scenario: {
    title: "One customer, 62 versions of their address",
    html: `
<p>Orders stored the customer's address directly on each order row — convenient at first, and it worked while customers never moved. Then a support escalation: a replacement part shipped to an address the customer had left two years earlier. An audit found 62 distinct addresses recorded for a single account across 148 orders; support had been “correcting” individual orders for months, and shipping picked whatever a given order carried. The CRM held a 63rd, current address.</p>
<p>The DBA's response on a Friday deadline: created a <code>sales.Customers</code> table with the current address as the single source of truth, backfilled customers from the most recent order per account, added a foreign key from Orders to Customers, and updated the read path so shipping resolves addresses through the key. Historical orders kept their original address where it was known to be correct at the time — as history, not as current state. Prevention: the schema now separates <em>current facts</em> (3NF, referenced by key) from <em>point-in-time snapshots</em> (a copy on the order, deliberately, with the rule documented). <strong>Every address had been true once; the absence of one authority meant none of them were authoritative.</strong></p>
`
  },

  interview: [
    {
      q: "What problem does normalisation solve?",
      a: "Unnecessary redundancy can cause insert, update, and delete anomalies. Normalisation organizes dependencies so facts are less likely to conflict; deliberate historical or performance copies can still be appropriate when their purpose and maintenance are explicit."
    },
    {
      q: "What is the difference between a partial and a transitive dependency?",
      a: "A partial dependency is a non-prime attribute depending on only part of a composite candidate key. A transitive dependency is a common simple-key example where a non-key attribute depends on another non-key attribute. 2NF addresses partial dependencies; 3NF addresses dependencies that don't meet its formal superkey/prime-attribute condition."
    },
    {
      q: "When do you denormalise in production?",
      a: "When measured read performance or reporting convenience outweighs the update cost, and only as a controlled copy: keep the normalised tables as the source of truth, make the denormalised structure rebuildable from them, and ensure only one writer owns each redundant fact."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “_____ is the process of organising tables so that every independent fact is stored in exactly one place, and everything else refers to it by key.”",
      "options": [
        "1NF",
        "Normalisation",
        "transitive"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Normalisation is the process of organising tables so that every independent fact is stored in exactly one place, and everything else refers to it by key. Its payoff is not elegance — it is correctness under change. When the same fact is copied into many rows, updates become a hunt, and misses become wrong answers in production.”"
    },
    {
      "question": "Complete the lesson statement: “A table is in _____ when every column holds an atomic value, there are no repeating groups, and each row is distinguishable.”",
      "options": [
        "first normal form",
        "1NF",
        "2NF"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A table is in first normal form when every column holds an atomic value, there are no repeating groups, and each row is distinguishable. The classic 1NF violation looks convenient at design time:”"
    },
    {
      "question": "Complete the lesson statement: “_____ applies to tables whose primary key is composite.”",
      "options": [
        "2NF",
        "BCNF",
        "Second normal form"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Second normal form applies to tables whose primary key is composite. A table is in 2NF when it is in 1NF and every non-key column depends on the entire key — not on a fragment of it. Partial dependency appears whenever a key column pair carries descriptive data:”"
    },
    {
      "question": "Complete the lesson statement: “_____ adds: no non-key column may depend on another non-key column — no transitive dependency.”",
      "options": [
        "denormalisation",
        "Third normal form",
        "BCNF"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Third normal form adds: no non-key column may depend on another non-key column — no transitive dependency. The giveaway is a column that functionally determines another: if customer_id → customer_city, then storing city anywhere but the Customers table lets one customer have two cities.”"
    },
    {
      "question": "Complete the lesson statement: “Normalisation optimises for correctness of writes; _____ trades some redundancy for read speed or convenience — and it is legitimate when it is a decision, not an accident.”",
      "options": [
        "denormalisation",
        "BCNF",
        "Keep the normalised truth"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Normalisation optimises for correctness of writes; denormalisation trades some redundancy for read speed or convenience — and it is legitimate when it is a decision, not an accident. Data warehouses, summary tables, and reporting views routinely repeat facts so that one query answers one dashboard.”"
    },
    {
      "question": "Complete the lesson statement: “The normal forms are stated as a sequence, and in practice reaching _____ is the goal of most transactional designs: every non-key column depends on the key, the whole key, and nothing but the key.”",
      "options": [
        "Keep the normalised truth",
        "One writer",
        "3NF"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The normal forms are stated as a sequence, and in practice reaching 3NF is the goal of most transactional designs: every non-key column depends on the key, the whole key, and nothing but the key.”"
    },
    {
      "question": "Which fact is covered in the lesson section “First normal form (1NF)”?",
      "options": [
        "One value per cell is not the same as one word: 2026-01-15 is atomic; '2026-01-15; 2026-02-01' in one column is two facts wearing one hat.",
        "The fixed “product_1 … product_3” columns cap every order at three items; the proper row-per-line design has no limit, and a query for “who ordered WIDGET-42” becomes a simple…",
        "first normal form"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The fixed “product_1 … product_3” columns cap every order at three items; the proper row-per-line design has no limit, and a query for “who ordered WIDGET-42” becomes a simple predicate instead of product_1 = … OR product_2 = … OR product_3 = ….”"
    },
    {
      "question": "Which fact is covered in the lesson section “Second normal form (2NF)”?",
      "options": [
        "Partial dependency creates the exact anomalies 1NF cannot fix: every line of an order repeats the order's data, so correcting an order-level fact means finding every line — and…",
        "Second normal form",
        "Insert"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Partial dependency creates the exact anomalies 1NF cannot fix: every line of an order repeats the order's data, so correcting an order-level fact means finding every line — and missing one leaves the table disagreeing with itself.”"
    },
    {
      "question": "In the “Third normal form (3NF)” table, what is listed for “1NF” under “Removes”?",
      "options": [
        "Insert",
        "Update",
        "Multi-valued and repeating columns"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “1NF” as “Multi-valued and repeating columns”."
    },
    {
      "question": "Complete the lesson statement: “_____ “denormalising” by accident — copying customer city into orders during an import; summary columns maintained by triggers nobody knows…”",
      "options": [
        "A customer moves house — 400 order rows still ship to the old address",
        "Common pitfalls:",
        "A new customer cannot exist until they place their first order"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Common pitfalls: “denormalising” by accident — copying customer city into orders during an import; summary columns maintained by triggers nobody knows about; and skipping 1NF because JSON columns “make repeats convenient”, then wondering why filtering on the data requires string surgery.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “_____ is the process of organising tables so that every independent fact is stored in exactly one place, and everything else refers to it by key.”",
      "options": [
        "1NF",
        "Normalisation",
        "transitive"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Normalisation is the process of organising tables so that every independent fact is stored in exactly one place, and everything else refers to it by key. Its payoff is not elegance — it is correctness under change. When the same fact is copied into many rows, updates become a hunt, and misses become wrong answers in production.”"
    },
    {
      "question": "Complete the lesson statement: “A table is in _____ when every column holds an atomic value, there are no repeating groups, and each row is distinguishable.”",
      "options": [
        "first normal form",
        "1NF",
        "2NF"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A table is in first normal form when every column holds an atomic value, there are no repeating groups, and each row is distinguishable. The classic 1NF violation looks convenient at design time:”"
    },
    {
      "question": "Complete the lesson statement: “_____ applies to tables whose primary key is composite.”",
      "options": [
        "2NF",
        "BCNF",
        "Second normal form"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Second normal form applies to tables whose primary key is composite. A table is in 2NF when it is in 1NF and every non-key column depends on the entire key — not on a fragment of it. Partial dependency appears whenever a key column pair carries descriptive data:”"
    },
    {
      "question": "Complete the lesson statement: “_____ adds: no non-key column may depend on another non-key column — no transitive dependency.”",
      "options": [
        "denormalisation",
        "Third normal form",
        "BCNF"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Third normal form adds: no non-key column may depend on another non-key column — no transitive dependency. The giveaway is a column that functionally determines another: if customer_id → customer_city, then storing city anywhere but the Customers table lets one customer have two cities.”"
    },
    {
      "question": "Complete the lesson statement: “Normalisation optimises for correctness of writes; _____ trades some redundancy for read speed or convenience — and it is legitimate when it is a decision, not an accident.”",
      "options": [
        "denormalisation",
        "BCNF",
        "Keep the normalised truth"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Normalisation optimises for correctness of writes; denormalisation trades some redundancy for read speed or convenience — and it is legitimate when it is a decision, not an accident. Data warehouses, summary tables, and reporting views routinely repeat facts so that one query answers one dashboard.”"
    },
    {
      "question": "Complete the lesson statement: “The normal forms are stated as a sequence, and in practice reaching _____ is the goal of most transactional designs: every non-key column depends on the key, the whole key, and nothing but the key.”",
      "options": [
        "Keep the normalised truth",
        "One writer",
        "3NF"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The normal forms are stated as a sequence, and in practice reaching 3NF is the goal of most transactional designs: every non-key column depends on the key, the whole key, and nothing but the key.”"
    },
    {
      "question": "Which fact is covered in the lesson section “First normal form (1NF)”?",
      "options": [
        "One value per cell is not the same as one word: 2026-01-15 is atomic; '2026-01-15; 2026-02-01' in one column is two facts wearing one hat.",
        "The fixed “product_1 … product_3” columns cap every order at three items; the proper row-per-line design has no limit, and a query for “who ordered WIDGET-42” becomes a simple…",
        "first normal form"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The fixed “product_1 … product_3” columns cap every order at three items; the proper row-per-line design has no limit, and a query for “who ordered WIDGET-42” becomes a simple predicate instead of product_1 = … OR product_2 = … OR product_3 = ….”"
    },
    {
      "question": "Which fact is covered in the lesson section “Second normal form (2NF)”?",
      "options": [
        "Partial dependency creates the exact anomalies 1NF cannot fix: every line of an order repeats the order's data, so correcting an order-level fact means finding every line — and…",
        "Second normal form",
        "Insert"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Partial dependency creates the exact anomalies 1NF cannot fix: every line of an order repeats the order's data, so correcting an order-level fact means finding every line — and missing one leaves the table disagreeing with itself.”"
    },
    {
      "question": "In the “Third normal form (3NF)” table, what is listed for “1NF” under “Removes”?",
      "options": [
        "Insert",
        "Update",
        "Multi-valued and repeating columns"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “1NF” as “Multi-valued and repeating columns”."
    },
    {
      "question": "Complete the lesson statement: “_____ “denormalising” by accident — copying customer city into orders during an import; summary columns maintained by triggers nobody knows…”",
      "options": [
        "A customer moves house — 400 order rows still ship to the old address",
        "Common pitfalls:",
        "A new customer cannot exist until they place their first order"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Common pitfalls: “denormalising” by accident — copying customer city into orders during an import; summary columns maintained by triggers nobody knows about; and skipping 1NF because JSON columns “make repeats convenient”, then wondering why filtering on the data requires string surgery.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “_____ is the process of organising tables so that every independent fact is stored in exactly one place, and everything else refers to it by key.”",
      "options": [
        "1NF",
        "Normalisation",
        "transitive"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Normalisation is the process of organising tables so that every independent fact is stored in exactly one place, and everything else refers to it by key. Its payoff is not elegance — it is correctness under change. When the same fact is copied into many rows, updates become a hunt, and misses become wrong answers in production.”"
    },
    {
      "question": "Complete the lesson statement: “A table is in _____ when every column holds an atomic value, there are no repeating groups, and each row is distinguishable.”",
      "options": [
        "first normal form",
        "1NF",
        "2NF"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A table is in first normal form when every column holds an atomic value, there are no repeating groups, and each row is distinguishable. The classic 1NF violation looks convenient at design time:”"
    },
    {
      "question": "Complete the lesson statement: “_____ applies to tables whose primary key is composite.”",
      "options": [
        "2NF",
        "BCNF",
        "Second normal form"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Second normal form applies to tables whose primary key is composite. A table is in 2NF when it is in 1NF and every non-key column depends on the entire key — not on a fragment of it. Partial dependency appears whenever a key column pair carries descriptive data:”"
    },
    {
      "question": "Complete the lesson statement: “_____ adds: no non-key column may depend on another non-key column — no transitive dependency.”",
      "options": [
        "denormalisation",
        "Third normal form",
        "BCNF"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Third normal form adds: no non-key column may depend on another non-key column — no transitive dependency. The giveaway is a column that functionally determines another: if customer_id → customer_city, then storing city anywhere but the Customers table lets one customer have two cities.”"
    },
    {
      "question": "Complete the lesson statement: “Normalisation optimises for correctness of writes; _____ trades some redundancy for read speed or convenience — and it is legitimate when it is a decision, not an accident.”",
      "options": [
        "denormalisation",
        "BCNF",
        "Keep the normalised truth"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Normalisation optimises for correctness of writes; denormalisation trades some redundancy for read speed or convenience — and it is legitimate when it is a decision, not an accident. Data warehouses, summary tables, and reporting views routinely repeat facts so that one query answers one dashboard.”"
    },
    {
      "question": "Complete the lesson statement: “The normal forms are stated as a sequence, and in practice reaching _____ is the goal of most transactional designs: every non-key column depends on the key, the whole key, and nothing but the key.”",
      "options": [
        "Keep the normalised truth",
        "One writer",
        "3NF"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The normal forms are stated as a sequence, and in practice reaching 3NF is the goal of most transactional designs: every non-key column depends on the key, the whole key, and nothing but the key.”"
    },
    {
      "question": "Which fact is covered in the lesson section “First normal form (1NF)”?",
      "options": [
        "One value per cell is not the same as one word: 2026-01-15 is atomic; '2026-01-15; 2026-02-01' in one column is two facts wearing one hat.",
        "The fixed “product_1 … product_3” columns cap every order at three items; the proper row-per-line design has no limit, and a query for “who ordered WIDGET-42” becomes a simple…",
        "first normal form"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The fixed “product_1 … product_3” columns cap every order at three items; the proper row-per-line design has no limit, and a query for “who ordered WIDGET-42” becomes a simple predicate instead of product_1 = … OR product_2 = … OR product_3 = ….”"
    },
    {
      "question": "Which fact is covered in the lesson section “Second normal form (2NF)”?",
      "options": [
        "Partial dependency creates the exact anomalies 1NF cannot fix: every line of an order repeats the order's data, so correcting an order-level fact means finding every line — and…",
        "Second normal form",
        "Insert"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Partial dependency creates the exact anomalies 1NF cannot fix: every line of an order repeats the order's data, so correcting an order-level fact means finding every line — and missing one leaves the table disagreeing with itself.”"
    },
    {
      "question": "In the “Third normal form (3NF)” table, what is listed for “1NF” under “Removes”?",
      "options": [
        "Insert",
        "Update",
        "Multi-valued and repeating columns"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “1NF” as “Multi-valued and repeating columns”."
    },
    {
      "question": "Complete the lesson statement: “_____ “denormalising” by accident — copying customer city into orders during an import; summary columns maintained by triggers nobody knows…”",
      "options": [
        "A customer moves house — 400 order rows still ship to the old address",
        "Common pitfalls:",
        "A new customer cannot exist until they place their first order"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Common pitfalls: “denormalising” by accident — copying customer city into orders during an import; summary columns maintained by triggers nobody knows about; and skipping 1NF because JSON columns “make repeats convenient”, then wondering why filtering on the data requires string surgery.”"
    }
  ],
  takeaways: [
    "Redundant facts cause insert, update, and delete anomalies — normalisation stores each fact once",
    "1NF: atomic values and no repeating groups — one value per cell",
    "2NF: with a composite key, every non-key column depends on the whole key",
    "3NF: non-key columns depend on the key, the whole key, and nothing but the key",
    "Denormalise deliberately — derived copies of a normalised truth, never a second independent source"
  ]
};
