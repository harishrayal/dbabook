/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch02-13.html */

window.TOPIC = {
  id: "ch02-13",
  title: "Transactions and ACID Properties",

  lead: "A transaction is the database's promise that a unit of work happens completely or not at all — and ACID (atomicity, consistency, isolation, durability) is the vocabulary for exactly what that promise covers.",

  objectives: [
    "Define a transaction as a unit of work with a clear boundary",
    "Explain each ACID property and the SQL Server mechanism behind it",
    "Map isolation levels to the anomalies they permit",
    "Write transactions safely with XACT_ABORT and TRY/CATCH",
    "Spot long-running or open transactions before they cause an incident"
  ],

  sections: [
    {
      h: "What a transaction is",
      html: `
<p>A <strong>transaction</strong> groups statements into a single logical unit: either every statement takes effect, or none does. The canonical example is a money transfer — debit one account, credit another. If the second write fails after the first succeeded, money vanished. A transaction makes that outcome impossible: the two writes succeed together or roll back together.</p>
<p>SQL Server's default mode is <strong>autocommit</strong>: each statement is its own tiny transaction. To get atomic behaviour for several statements you must declare the boundary yourself:</p>
<ul>
  <li><code>BEGIN TRANSACTION</code> — start the unit; from here, changes are provisional</li>
  <li><code>COMMIT TRANSACTION</code> — make it real; the log is flushed and the changes are durable</li>
  <li><code>ROLLBACK TRANSACTION</code> — undo everything since BEGIN; the table returns to its prior state</li>
</ul>
<blockquote>A transaction is a bet on two moments: that the commit will be fast, and that everything inside it will be. Keep both small.</blockquote>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Transaction lifecycle: commit or rollback">
    <defs>
      <marker id="tx-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="20" y="120" width="150" height="70" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="95" y="150" text-anchor="middle" fill="var(--accent-strong)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">BEGIN TRAN</text>
    <text x="95" y="172" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">boundary opened</text>

    <rect x="215" y="110" width="210" height="90" rx="12" fill="var(--accent)"/>
    <text x="320" y="143" text-anchor="middle" fill="#ffffff" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Transaction active</text>
    <text x="320" y="166" text-anchor="middle" fill="#dbeafe" font-size="11.5" font-family="Segoe UI, sans-serif">statements run · locks held</text>
    <text x="320" y="186" text-anchor="middle" fill="#dbeafe" font-size="11.5" font-family="Segoe UI, sans-serif">log records accumulating</text>

    <rect x="490" y="30" width="240" height="70" rx="12" fill="var(--surface-2)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="610" y="58" text-anchor="middle" fill="var(--accent-strong)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">COMMIT</text>
    <text x="610" y="80" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">log flushed · changes durable</text>

    <rect x="490" y="240" width="240" height="70" rx="12" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.8"/>
    <text x="610" y="268" text-anchor="middle" fill="var(--text)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">ROLLBACK</text>
    <text x="610" y="290" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">changes undone · prior state restored</text>

    <line x1="170" y1="155" x2="213" y2="155" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#tx-arrow)"/>
    <line x1="425" y1="130" x2="488" y2="78" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#tx-arrow)"/>
    <line x1="425" y1="180" x2="488" y2="262" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#tx-arrow)"/>
    <text x="440" y="122" fill="var(--accent-strong)" font-size="12" font-weight="700" font-family="Segoe UI, sans-serif">all statements OK</text>
    <text x="438" y="228" fill="var(--text)" font-size="12" font-weight="700" font-family="Segoe UI, sans-serif">error or rule violated</text>

    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Write-ahead logging: every change reaches the log first — which is what makes commit and crash recovery both possible.</text>
  </svg>
  <div class="figcaption">Figure 1 — A transaction resolves to exactly one outcome: committed or rolled back.</div>
</div>
`
    },
    {
      h: "ACID, one property at a time",
      html: `
<p><strong>ACID</strong> is the summary of what a transaction guarantees. Each letter corresponds to a concrete SQL Server mechanism — knowing which one failed tells you where to look:</p>
<table>
  <tr><th>Property</th><th>Promise</th><th>SQL Server mechanism</th><th>Failure it prevents</th></tr>
  <tr><td><strong>Atomicity</strong></td><td>All statements in the unit apply, or none do</td><td>Transaction log records; ROLLBACK undoes committed work in flight</td><td>Half-completed transfers</td></tr>
  <tr><td><strong>Consistency</strong></td><td>The database moves from one valid state to another</td><td>Keys, constraints, triggers validated at statement time</td><td>Orphans, negative balances, broken invariants</td></tr>
  <tr><td><strong>Isolation</strong></td><td>Concurrent transactions do not see each other's incomplete work</td><td>Locking plus row versioning (tempdb version store)</td><td>Dirty reads, lost updates, phantoms</td></tr>
  <tr><td><strong>Durability</strong></td><td>Once committed, the change survives crashes</td><td>Write-ahead logging: log flushed to disk before the commit returns</td><td>Committed rows lost on power failure</td></tr>
</table>
<p><strong>Atomicity</strong> and <strong>durability</strong> are carried by the log — one mechanism, two guarantees. <strong>Consistency</strong> is the constraints' job: a statement that violates one fails and (inside a transaction) takes the unit down with it. <strong>Isolation</strong> is the expensive one, because it is paid continuously while transactions run concurrently.</p>
`
    },
    {
      h: "Isolation: the cost of sharing",
      html: `
<p>Isolation levels trade correctness anomalies against concurrency. SQL Server's default, READ COMMITTED, blocks readers briefly rather than showing them uncommitted data; SNAPSHOT versions rows in tempdb so readers never block the writer.</p>
<table>
  <tr><th>Isolation level</th><th>Dirty read</th><th>Lost / non-repeatable read</th><th>Phantom rows</th><th>Cost profile</th></tr>
  <tr><td><strong>READ UNCOMMITTED</strong> (NOLOCK)</td><td>Possible</td><td>Possible</td><td>Possible</td><td>No blocking, uncommitted data visible</td></tr>
  <tr><td><strong>READ COMMITTED</strong> (default)</td><td>No</td><td>Possible</td><td>Possible</td><td>Shared locks held while reading</td></tr>
  <tr><td><strong>REPEATABLE READ</strong></td><td>No</td><td>No</td><td>Possible</td><td>Read locks held to transaction end</td></tr>
  <tr><td><strong>SNAPSHOT</strong></td><td>No</td><td>No</td><td>No</td><td>Version store in tempdb; no reader/writer blocking</td></tr>
  <tr><td><strong>SERIALIZABLE</strong></td><td>No</td><td>No</td><td>No</td><td>Range locks — highest conflict, lowest concurrency</td></tr>
</table>
<p>Practical guidance: stay at the default until a measured anomaly forces a change; avoid <code>NOLOCK</code> as a blanket fix (it trades blocking for wrong answers and 823/824-style errors) — prefer <code>READ COMMITTED SNAPSHOT</code> if read blocking is a genuine systemic issue; and keep transactions short, because locks are held until commit.</p>
`
    },
    {
      h: "Writing transactions that behave",
      html: `
<p>The production-safe shape of any multi-statement write: abort on error, bound the transaction, verify before committing.</p>
<pre><code class="language-sql">SET XACT_ABORT ON;   -- any error makes the whole transaction rollback-ready

BEGIN TRY
    BEGIN TRANSACTION;

        UPDATE banking.Accounts
           SET balance = balance - 500.00
         WHERE account_id = 1;

        UPDATE banking.Accounts
           SET balance = balance + 500.00
         WHERE account_id = 2;

        -- Business invariant checked inside the unit of work
        IF EXISTS (SELECT 1 FROM banking.Accounts
                   WHERE account_id = 1 AND balance &lt; 0)
            THROW 51000, 'Overdraft prevented: transfer cancelled.', 1;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT &gt; 0 ROLLBACK TRANSACTION;
    THROW;                  -- surface the failure to the caller
END CATCH;</code></pre>
<p>Rules that keep transactions healthy:</p>
<ul>
  <li><strong>Never hold a transaction open across user think time</strong> — a web form's transaction must open only when the submit button is pressed</li>
  <li><strong>Order statements consistently</strong> across competing transactions to reduce deadlock probability</li>
  <li><strong>Set <code>LOCK_TIMEOUT</code> or handle deadlocks</strong> — deadlock victims are chosen by <code>SET DEADLOCK_PRIORITY</code>, and error 1205 is normal in busy systems: retry it</li>
  <li><strong>Keep the log healthy</strong> — long transactions prevent log truncation, so an open transaction can stop your log backups from reclaiming space</li>
</ul>
<p>Signs that the problem is a <em>transaction</em>, not a query — worth recognising before you start tuning execution plans:</p>
<ul>
  <li><strong>Blocking chains</strong> head by a single session with an old begin time in <code>sys.dm_tran_active_transactions</code></li>
  <li><strong>Log growth despite frequent log backups</strong> — an active transaction pins the log's reusable portion</li>
  <li><strong>Deadlocks (error 1205) clustering at the same time daily</strong> — competing jobs taking locks in different orders</li>
  <li><strong>Timeouts that appear only under load</strong> — transactions fine in test serialise badly with concurrency</li>
</ul>
<p><strong>Common pitfalls:</strong> committing before validating (constraints throw after the fact anyway — check inside); implicit transactions left on by a driver setting, so every SELECT opens one; bulk operations in one giant transaction that fill the log; and assuming <code>NOLOCK</code> “makes things faster” without noticing the phantom totals in the report.</p>
`
    }
  ],

  scenario: {
    title: "The 10 AM slowdown caused by a transaction opened at 6 AM",
    html: `
<p>Orders slowed to a crawl and blocking chains stacked up behind a single session. The log file had grown to 92 GB overnight and no log backup had reclaimed anything. The DBA's first query — active transactions with their start times — showed the culprit: a data-migration script on a jump host had run an UPDATE inside a transaction at 06:12, hit a timeout waiting for its own input, and the connection sat idle for four hours with the transaction still open. Its locks were held, its uncommitted log records pinned the log, and every write to the same key ranges queued behind it.</p>
<p>Resolution: with the application owner on the line, the session was killed (<code>KILL</code>), the transaction rolled back automatically, locks released, and the log became eligible for truncation at the next log backup — latency normalised within a minute. Prevention: command timeouts on every application connection (30 seconds), an alert on transactions open longer than 15 minutes from <code>sys.dm_tran_active_transactions</code>, and a rule that interactive tools never touch production without an explicit transaction budget. <strong>An open transaction is not idle — it is holding locks and log space for everyone else.</strong></p>
`
  },

  interview: [
    {
      q: "Explain ACID in terms of SQL Server mechanisms.",
      a: "Atomicity: the log records every change so ROLLBACK can undo the unit. Consistency: constraints validate each statement, moving the database between valid states. Isolation: locking plus row versioning keep concurrent transactions from seeing each other's unfinished work. Durability: write-ahead logging flushes log records to disk before a commit returns, so a crash cannot lose a committed change."
    },
    {
      q: "What is the difference between dirty read, non-repeatable read, and phantom?",
      a: "A dirty read sees another transaction's uncommitted data. A non-repeatable read sees a row change between two reads of the same row within your transaction. A phantom sees new rows appear for the same predicate. READ UNCOMMITTED permits all three; READ COMMITTED permits the last two; SNAPSHOT prevents all three via versioning."
    },
    {
      q: "How do you handle a deadlock in an application?",
      a: "Treat error 1205 as retryable: wrap the transaction in a retry loop with backoff, keep transactions short, and ensure competing transactions acquire locks in a consistent order. You can also set DEADLOCK_PRIORITY so the less critical session becomes the victim — but retry logic and lock-order discipline are the real fix."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ groups statements into a single logical unit: either every statement takes effect, or none does.”",
      "options": [
        "Set LOCK_TIMEOUT or handle deadlocks",
        "Keep the log healthy",
        "transaction"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A transaction groups statements into a single logical unit: either every statement takes effect, or none does. The canonical example is a money transfer — debit one account, credit another. If the second write fails after the first succeeded, money vanished. A transaction makes that outcome impossible: the two writes succeed together or roll back together.”"
    },
    {
      "question": "Complete the lesson statement: “_____ is the summary of what a transaction guarantees.”",
      "options": [
        "Blocking chains",
        "ACID",
        "Keep the log healthy"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “ACID is the summary of what a transaction guarantees. Each letter corresponds to a concrete SQL Server mechanism — knowing which one failed tells you where to look:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Isolation: the cost of sharing”?",
      "options": [
        "Isolation levels trade correctness anomalies against concurrency.",
        "Version store in tempdb; no reader/writer blocking",
        "Range locks — highest conflict, lowest concurrency"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Isolation levels trade correctness anomalies against concurrency. SQL Server's default, READ COMMITTED, blocks readers briefly rather than showing them uncommitted data; SNAPSHOT versions rows in tempdb so readers never block the writer.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Writing transactions that behave”?",
      "options": [
        "Common pitfalls:",
        "Consistency",
        "The production-safe shape of any multi-statement write: abort on error, bound the transaction, verify before committing."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The production-safe shape of any multi-statement write: abort on error, bound the transaction, verify before committing.”"
    },
    {
      "question": "Complete the lesson statement: “SQL Server's default mode is _____: each statement is its own tiny transaction.”",
      "options": [
        "Timeouts that appear only under load",
        "autocommit",
        "Deadlocks (error 1205) clustering at the same time daily"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “SQL Server's default mode is autocommit: each statement is its own tiny transaction. To get atomic behaviour for several statements you must declare the boundary yourself:”"
    },
    {
      "question": "Complete the lesson statement: “_____ and durability are carried by the log — one mechanism, two guarantees.”",
      "options": [
        "Atomicity",
        "Timeouts that appear only under load",
        "Common pitfalls:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Atomicity and durability are carried by the log — one mechanism, two guarantees. Consistency is the constraints' job: a statement that violates one fails and (inside a transaction) takes the unit down with it. Isolation is the expensive one, because it is paid continuously while transactions run concurrently.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Isolation: the cost of sharing”?",
      "options": [
        "Durability",
        "READ UNCOMMITTED",
        "Practical guidance: stay at the default until a measured anomaly forces a change; avoid NOLOCK as a blanket fix (it trades blocking for wrong answers and 823/824-style errors) —…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Practical guidance: stay at the default until a measured anomaly forces a change; avoid NOLOCK as a blanket fix (it trades blocking for wrong answers and 823/824-style errors) — prefer READ COMMITTED SNAPSHOT if read blocking is a genuine systemic issue; and keep transactions short, because locks are held until commit.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Writing transactions that behave”?",
      "options": [
        "READ COMMITTED",
        "Rules that keep transactions healthy:",
        "READ UNCOMMITTED"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Rules that keep transactions healthy:”"
    },
    {
      "question": "In the “ACID, one property at a time” table, what is listed for “Atomicity” under “Failure it prevents”?",
      "options": [
        "Half-completed transfers",
        "READ COMMITTED",
        "REPEATABLE READ"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Atomicity” as “Half-completed transfers”."
    },
    {
      "question": "In the “Isolation: the cost of sharing” table, what is listed for “READ UNCOMMITTED (NOLOCK)” under “Cost profile”?",
      "options": [
        "REPEATABLE READ",
        "SNAPSHOT",
        "No blocking, uncommitted data visible"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “READ UNCOMMITTED (NOLOCK)” as “No blocking, uncommitted data visible”."
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ groups statements into a single logical unit: either every statement takes effect, or none does.”",
      "options": [
        "Set LOCK_TIMEOUT or handle deadlocks",
        "Keep the log healthy",
        "transaction"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A transaction groups statements into a single logical unit: either every statement takes effect, or none does. The canonical example is a money transfer — debit one account, credit another. If the second write fails after the first succeeded, money vanished. A transaction makes that outcome impossible: the two writes succeed together or roll back together.”"
    },
    {
      "question": "Complete the lesson statement: “_____ is the summary of what a transaction guarantees.”",
      "options": [
        "Blocking chains",
        "ACID",
        "Keep the log healthy"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “ACID is the summary of what a transaction guarantees. Each letter corresponds to a concrete SQL Server mechanism — knowing which one failed tells you where to look:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Isolation: the cost of sharing”?",
      "options": [
        "Isolation levels trade correctness anomalies against concurrency.",
        "Version store in tempdb; no reader/writer blocking",
        "Range locks — highest conflict, lowest concurrency"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Isolation levels trade correctness anomalies against concurrency. SQL Server's default, READ COMMITTED, blocks readers briefly rather than showing them uncommitted data; SNAPSHOT versions rows in tempdb so readers never block the writer.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Writing transactions that behave”?",
      "options": [
        "Common pitfalls:",
        "Consistency",
        "The production-safe shape of any multi-statement write: abort on error, bound the transaction, verify before committing."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The production-safe shape of any multi-statement write: abort on error, bound the transaction, verify before committing.”"
    },
    {
      "question": "Complete the lesson statement: “SQL Server's default mode is _____: each statement is its own tiny transaction.”",
      "options": [
        "Timeouts that appear only under load",
        "autocommit",
        "Deadlocks (error 1205) clustering at the same time daily"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “SQL Server's default mode is autocommit: each statement is its own tiny transaction. To get atomic behaviour for several statements you must declare the boundary yourself:”"
    },
    {
      "question": "Complete the lesson statement: “_____ and durability are carried by the log — one mechanism, two guarantees.”",
      "options": [
        "Atomicity",
        "Timeouts that appear only under load",
        "Common pitfalls:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Atomicity and durability are carried by the log — one mechanism, two guarantees. Consistency is the constraints' job: a statement that violates one fails and (inside a transaction) takes the unit down with it. Isolation is the expensive one, because it is paid continuously while transactions run concurrently.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Isolation: the cost of sharing”?",
      "options": [
        "Durability",
        "READ UNCOMMITTED",
        "Practical guidance: stay at the default until a measured anomaly forces a change; avoid NOLOCK as a blanket fix (it trades blocking for wrong answers and 823/824-style errors) —…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Practical guidance: stay at the default until a measured anomaly forces a change; avoid NOLOCK as a blanket fix (it trades blocking for wrong answers and 823/824-style errors) — prefer READ COMMITTED SNAPSHOT if read blocking is a genuine systemic issue; and keep transactions short, because locks are held until commit.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Writing transactions that behave”?",
      "options": [
        "READ COMMITTED",
        "Rules that keep transactions healthy:",
        "READ UNCOMMITTED"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Rules that keep transactions healthy:”"
    },
    {
      "question": "In the “ACID, one property at a time” table, what is listed for “Atomicity” under “Failure it prevents”?",
      "options": [
        "Half-completed transfers",
        "READ COMMITTED",
        "REPEATABLE READ"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Atomicity” as “Half-completed transfers”."
    },
    {
      "question": "In the “Isolation: the cost of sharing” table, what is listed for “READ UNCOMMITTED (NOLOCK)” under “Cost profile”?",
      "options": [
        "REPEATABLE READ",
        "SNAPSHOT",
        "No blocking, uncommitted data visible"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “READ UNCOMMITTED (NOLOCK)” as “No blocking, uncommitted data visible”."
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ groups statements into a single logical unit: either every statement takes effect, or none does.”",
      "options": [
        "Set LOCK_TIMEOUT or handle deadlocks",
        "Keep the log healthy",
        "transaction"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A transaction groups statements into a single logical unit: either every statement takes effect, or none does. The canonical example is a money transfer — debit one account, credit another. If the second write fails after the first succeeded, money vanished. A transaction makes that outcome impossible: the two writes succeed together or roll back together.”"
    },
    {
      "question": "Complete the lesson statement: “_____ is the summary of what a transaction guarantees.”",
      "options": [
        "Blocking chains",
        "ACID",
        "Keep the log healthy"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “ACID is the summary of what a transaction guarantees. Each letter corresponds to a concrete SQL Server mechanism — knowing which one failed tells you where to look:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Isolation: the cost of sharing”?",
      "options": [
        "Isolation levels trade correctness anomalies against concurrency.",
        "Version store in tempdb; no reader/writer blocking",
        "Range locks — highest conflict, lowest concurrency"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Isolation levels trade correctness anomalies against concurrency. SQL Server's default, READ COMMITTED, blocks readers briefly rather than showing them uncommitted data; SNAPSHOT versions rows in tempdb so readers never block the writer.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Writing transactions that behave”?",
      "options": [
        "Common pitfalls:",
        "Consistency",
        "The production-safe shape of any multi-statement write: abort on error, bound the transaction, verify before committing."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The production-safe shape of any multi-statement write: abort on error, bound the transaction, verify before committing.”"
    },
    {
      "question": "Complete the lesson statement: “SQL Server's default mode is _____: each statement is its own tiny transaction.”",
      "options": [
        "Timeouts that appear only under load",
        "autocommit",
        "Deadlocks (error 1205) clustering at the same time daily"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “SQL Server's default mode is autocommit: each statement is its own tiny transaction. To get atomic behaviour for several statements you must declare the boundary yourself:”"
    },
    {
      "question": "Complete the lesson statement: “_____ and durability are carried by the log — one mechanism, two guarantees.”",
      "options": [
        "Atomicity",
        "Timeouts that appear only under load",
        "Common pitfalls:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Atomicity and durability are carried by the log — one mechanism, two guarantees. Consistency is the constraints' job: a statement that violates one fails and (inside a transaction) takes the unit down with it. Isolation is the expensive one, because it is paid continuously while transactions run concurrently.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Isolation: the cost of sharing”?",
      "options": [
        "Durability",
        "READ UNCOMMITTED",
        "Practical guidance: stay at the default until a measured anomaly forces a change; avoid NOLOCK as a blanket fix (it trades blocking for wrong answers and 823/824-style errors) —…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Practical guidance: stay at the default until a measured anomaly forces a change; avoid NOLOCK as a blanket fix (it trades blocking for wrong answers and 823/824-style errors) — prefer READ COMMITTED SNAPSHOT if read blocking is a genuine systemic issue; and keep transactions short, because locks are held until commit.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Writing transactions that behave”?",
      "options": [
        "READ COMMITTED",
        "Rules that keep transactions healthy:",
        "READ UNCOMMITTED"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Rules that keep transactions healthy:”"
    },
    {
      "question": "In the “ACID, one property at a time” table, what is listed for “Atomicity” under “Failure it prevents”?",
      "options": [
        "Half-completed transfers",
        "READ COMMITTED",
        "REPEATABLE READ"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Atomicity” as “Half-completed transfers”."
    },
    {
      "question": "In the “Isolation: the cost of sharing” table, what is listed for “READ UNCOMMITTED (NOLOCK)” under “Cost profile”?",
      "options": [
        "REPEATABLE READ",
        "SNAPSHOT",
        "No blocking, uncommitted data visible"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “READ UNCOMMITTED (NOLOCK)” as “No blocking, uncommitted data visible”."
    }
  ],
  takeaways: [
    "A transaction is a unit of work that commits entirely or rolls back entirely; autocommit gives you one statement per unit",
    "ACID maps to real mechanisms: log-based atomicity/durability, constraint-based consistency, locking/versioning-based isolation",
    "Isolation levels trade anomalies against concurrency — stay at the default until evidence says otherwise",
    "Write transactions with XACT_ABORT ON and TRY/CATCH; never hold one open across user think time",
    "Long open transactions block locks and pin the log — monitor them before users report slowness"
  ]
};
