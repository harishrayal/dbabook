/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch02-14.html */

window.TOPIC = {
  id: "ch02-14",
  title: "Commit and Rollback",

  lead: "Commit and rollback are the two endings every transaction must have — commit makes the work durable and releases it to the world; rollback erases it as if it never happened — and knowing exactly what each one does is the difference between a safe change and an incident.",

  objectives: [
    "State precisely what COMMIT makes permanent and when",
    "Describe what ROLLBACK undoes — and what it cannot undo",
    "Handle nested transactions and savepoints correctly",
    "Write TRY/CATCH handlers that never leave transactions open",
    "Detect and clear stuck transactions using DMVs"
  ],

  sections: [
    {
      h: "COMMIT: making it real",
      html: `
<p><code>COMMIT TRANSACTION</code> ends the transaction by making its changes permanent. Mechanically, SQL Server flushes the transaction's log records to disk (durability), then releases the locks held by the transaction so other sessions can see the new state. Only after the commit succeeds does the data become visible to everyone else.</p>
<ul>
  <li><strong>Log first</strong> — a commit is, at its heart, an I/O guarantee: the log is on disk before the caller is told “done”</li>
  <li><strong>Locks released</strong> — readers and writers on those rows can proceed</li>
  <li><strong>Truncation eligible</strong> — once the oldest active transaction commits, log backups can reclaim the log space its records occupied</li>
</ul>
<blockquote>Commit is the moment an intention becomes history. Everything before it exists only for your session; everything after it exists for everyone, including your backups.</blockquote>
<p>Subtlety worth knowing: <strong>COMMIT inside a nested transaction does not really commit.</strong> With <code>@@TRANCOUNT = 2</code>, a COMMIT decrements the count to 1 — the outer transaction still holds everything. Only the COMMIT that returns <code>@@TRANCOUNT</code> to 0 makes the unit durable.</p>
`
    },
    {
      h: "ROLLBACK: erasing the attempt",
      html: `
<p><code>ROLLBACK TRANSACTION</code> undoes every change made since the transaction began, using the log's undo information, and restores the database to the state it had at BEGIN. Locks are released, log records become reusable, and — critically — <strong>the rolled-back work never became visible to other sessions</strong>, so there is nothing to “tell the others about”.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Commit and rollback state transitions">
    <defs>
      <marker id="cr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="60" y="16" width="200" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="160" y="41" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">SAVE TRANSACTION sp1</text>
    <text x="160" y="62" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">a return point inside the unit</text>

    <rect x="40" y="130" width="190" height="80" rx="12" fill="var(--accent)"/>
    <text x="135" y="163" text-anchor="middle" fill="#ffffff" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Active</text>
    <text x="135" y="186" text-anchor="middle" fill="#dbeafe" font-size="11.5" font-family="Segoe UI, sans-serif">locks held · uncommitted</text>

    <rect x="470" y="40" width="250" height="70" rx="12" fill="var(--surface-2)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="595" y="68" text-anchor="middle" fill="var(--accent-strong)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">COMMITTED</text>
    <text x="595" y="90" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">durable · visible · locks released</text>

    <rect x="470" y="230" width="250" height="70" rx="12" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.8"/>
    <text x="595" y="258" text-anchor="middle" fill="var(--text)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">ROLLED BACK</text>
    <text x="595" y="280" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">prior state restored · locks released</text>

    <line x1="140" y1="76" x2="140" y2="128" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#cr-arrow)"/>
    <line x1="230" y1="150" x2="468" y2="86" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#cr-arrow)"/>
    <line x1="230" y1="190" x2="468" y2="266" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#cr-arrow)"/>

    <text x="305" y="118" fill="var(--accent-strong)" font-size="12.5" font-weight="700" font-family="Segoe UI, sans-serif">COMMIT</text>
    <text x="305" y="240" fill="var(--text)" font-size="12.5" font-weight="700" font-family="Segoe UI, sans-serif">ROLLBACK</text>
    <text x="206" y="106" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">ROLLBACK TO sp1 returns here</text>

    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">A session that dies with an open transaction is rolled back automatically — by the same log that protects everyone else.</text>
  </svg>
  <div class="figcaption">Figure 1 — Every transaction resolves to COMMITTED or ROLLBACK, possibly passing through savepoints first.</div>
</div>
<p>What rollback can and cannot do:</p>
<ul>
  <li><strong>Can undo</strong> — inserts, updates, deletes, and most DDL performed inside the transaction</li>
  <li><strong>Cannot undo</strong> — external effects: emails sent, files written, calls to linked servers or external modules, and sequences or identity counters (gaps remain)</li>
  <li><strong>Cannot roll back</strong> — if the transaction was already committed, or the work ran outside one (autocommit made it permanent on execution)</li>
</ul>
`
    },
    {
      h: "Nesting, savepoints, and counting",
      html: `
<p>SQL Server has no true nested transactions — there is one transaction, tracked by <code>@@TRANCOUNT</code>, and the rules around it are where well-written code separates from fragile code:</p>
<table>
  <tr><th>Statement</th><th>Effect on @@TRANCOUNT</th><th>Real effect</th></tr>
  <tr><td><code>BEGIN TRANSACTION</code></td><td>+1</td><td>1 = real start; higher = nesting marker</td></tr>
  <tr><td><code>COMMIT TRANSACTION</code> (count &gt; 1)</td><td>−1</td><td>Nothing committed yet — just closes a nesting level</td></tr>
  <tr><td><code>COMMIT TRANSACTION</code> (count = 1)</td><td>→ 0</td><td>Everything commits and becomes durable</td></tr>
  <tr><td><code>ROLLBACK TRANSACTION</code></td><td>→ 0</td><td>Undoes <strong>everything</strong>, even outer nesting levels</td></tr>
  <tr><td><code>ROLLBACK TRANSACTION sp1</code></td><td>unchanged</td><td>Undoes back to the savepoint; transaction continues</td></tr>
</table>
<p>This asymmetry is a classic bug: a procedure called inside an application's transaction issues a plain ROLLBACK, silently destroying the outer unit, and the application's later COMMIT fails with error 266 (“mismatching number of BEGIN and COMMIT”). The safe reusable-procedure pattern respects whoever opened the transaction:</p>
<pre><code class="language-sql">CREATE OR ALTER PROCEDURE sales.usp_AdjustStock
    @product_id int,
    @delta      int
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT OFF;              -- we manage the boundary ourselves

    DECLARE @TranCount int = @@TRANCOUNT;

    IF @TranCount &gt; 0
        SAVE TRANSACTION usp_AdjustStock;      -- mark a return point
    ELSE
        BEGIN TRANSACTION;

    BEGIN TRY
        UPDATE inventory.Stock
           SET on_hand = on_hand + @delta
         WHERE product_id = @product_id;

        IF @@ROWCOUNT = 0
            THROW 52001, 'Product not found.', 1;

        IF @TranCount = 0
            COMMIT TRANSACTION;                -- only the owner commits
    END TRY
    BEGIN CATCH
        IF XACT_STATE() &lt;&gt; 0
        BEGIN
            IF @TranCount &gt; 0
                ROLLBACK TRANSACTION usp_AdjustStock;   -- unwind just our work
            ELSE
                ROLLBACK TRANSACTION;
        END
        THROW;                                  -- hand the error back
    END CATCH;
END;
GO</code></pre>
<p>Read <code>XACT_STATE()</code> before deciding: <strong>1</strong> = active and committable, <strong>0</strong> = no active transaction, <strong>−1</strong> = active but doomed (an error occurred with XACT_ABORT ON — it can only be rolled back, never committed).</p>
`
    },
    {
      h: "Detecting transactions that never end",
      html: `
<p>The most common production transaction problem is not wrong logic — it is a transaction left open by a client, a forgotten tool session, or a retry loop. This query is worth having on every DBA's shortlist:</p>
<pre><code class="language-sql">SELECT s.session_id,
       s.login_name,
       t.transaction_id,
       t.transaction_begin_time,
       DATEDIFF(minute, t.transaction_begin_time, GETDATE()) AS open_minutes,
       t.transaction_type,      -- 1 = read/write, 2 = bulk, 4 = distributed
       t.transaction_state,     -- 0..7: 6 = committed, 4 = write-committed
       db_name(t.database_id)   AS database_name
FROM   sys.dm_tran_session_transactions AS st
JOIN   sys.dm_tran_active_transactions  AS t
       ON t.transaction_id = st.transaction_id
JOIN   sys.dm_exec_sessions AS s
       ON s.session_id = st.session_id
ORDER  BY t.transaction_begin_time;</code></pre>
<p>Interpretation: <code>open_minutes</code> climbing during business hours is a red flag; a write transaction (<code>transaction_type = 1</code>) with no running request attached to the session is an abandoned one. Killing the session rolls it back safely — with the application owner informed first.</p>
<p><strong>Common pitfalls:</strong> the nested-ROLLBACK mismatch described above; assuming “it rolled back” when no transaction was open (autocommit had already committed each statement); checking only <code>@@ROWCOUNT</code> after an UPDATE without an error handler; and building retry loops that commit a doomed transaction — impossible, and the resulting error 3930 masks the original failure.</p>
`
    }
  ],

  scenario: {
    title: "Error 266: the inner procedure rolled back the outer transaction",
    html: `
<p>An order-modification endpoint failed intermittently with error 266 — “mismatching number of BEGIN and COMMIT statements” — always after a constraint violation had occurred somewhere in the chain. The application opened a transaction, called <code>sales.usp_ModifyOrder</code>, which called <code>sales.usp_RepriceLines</code>. The inner procedure had its own <code>BEGIN … ROLLBACK</code> pair. When a price rule failed, the inner ROLLBACK unwound the <em>whole</em> transaction (SQL Server has only one), the outer COMMIT then found no transaction to commit, and the endpoint reported a confusing error while its audit log recorded a “successful” attempt that had, in fact, been fully undone.</p>
<p>The DBA reproduced it in a test session, watched <code>@@TRANCOUNT</code> fall to 0 on the inner rollback, and traced the code path. Resolution: the inner procedure was rewritten with the savepoint pattern — record <code>@@TRANCOUNT</code>, <code>SAVE TRANSACTION</code> when nested, roll back only to that point, and let the outermost owner commit — plus <code>XACT_STATE()</code> checks in every handler. Prevention: a documented rule in the codebase — <strong>only the code that opened the transaction may commit or roll it back</strong> — enforced in review, with error 266 treated as a blocking defect. <strong>Transaction boundaries have exactly one owner; everything else is a visitor.</strong></p>
`
  },

  interview: [
    {
      q: "What exactly happens when you issue COMMIT?",
      a: "The transaction's log records are flushed to disk (satisfying durability), locks are released, and the changes become visible to other sessions; the transaction ends and its log space becomes eligible for truncation by the next log backup. In nested transactions, COMMIT only decrements the nesting count until it reaches zero."
    },
    {
      q: "Can you roll back a committed transaction?",
      a: "No — not with a ROLLBACK. Recovery from a committed change means restoring from backups and replaying the log to a point before the commit (point-in-time restore), which is exactly why risky changes are wrapped in an explicit transaction so the in-flight state can still be undone."
    },
    {
      q: "A procedure must work both standalone and inside a caller's transaction. How?",
      a: "Capture @@TRANCOUNT at entry. If it is greater than zero, SAVE TRANSACTION to mark a return point; otherwise BEGIN TRANSACTION. In the catch handler, roll back only to the savepoint when nested (plain ROLLBACK would destroy the caller's unit), and issue COMMIT only when you opened the transaction — then rethrow the error so the caller can decide its own outcome."
    }
  ],

  takeaways: [
    "COMMIT flushes the log for durability, releases locks, and — only at nesting level 1 — makes the work permanent",
    "ROLLBACK restores the pre-transaction state and releases locks; rolled-back work was never visible to others",
    "There is no true nesting: one transaction, @@TRANCOUNT as a counter, and plain ROLLBACK ends them all",
    "Savepoints let reusable code unwind only its own work inside a caller's transaction",
    "Read @@TRANCOUNT and XACT_STATE() before acting; only the transaction's owner may commit or roll it back"
  ]
};
