/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch13-03.html */

window.TOPIC = {
  id: "ch13-03",
  title: "Blocking Chains",

  lead: "This topic covers Blocking Chains — a concept you will meet repeatedly when working with blocking and deadlocks. We build from first principles to production guidance.",

  objectives: [
    "Define what Blocking Chains is and where it fits",
    "Explain how Blocking Chains works internally",
    "Apply Blocking Chains correctly in a production environment",
    "Recognise the common mistakes and risks involving Blocking Chains",
    "Monitor and troubleshoot Blocking Chains with the right tools"
  ],

  sections: [
    {
      h: "What Blocking Chains means",
      html: `
<p>In this topic we examine <strong>Blocking Chains</strong> within blocking and deadlocks. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions. Large unindexed updates are a common trigger.</p>
<p>Isolation levels define how transactions are protected from one another. READ COMMITTED is the default; READ UNCOMMITTED allows dirty reads; REPEATABLE READ and SERIALIZABLE increase protection and blocking; SNAPSHOT and READ COMMITTED SNAPSHOT use row versioning to reduce reader-writer blocking.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Blocking Chains is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Blocking Chains fits",
      html: `
<p>A deadlock is a cycle: session A holds a resource B needs while B holds a resource A needs. SQL Server detects the cycle, chooses a victim and rolls it back with error 1205 so the other can proceed.</p>
<p>The diagram below places Blocking Chains alongside the core concepts of blocking and deadlocks. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Blocking Chains layers">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="70" y="8" width="620" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="30" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Lock</text>
    <text x="380" y="50" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 1</text>
    <rect x="100" y="62" width="560" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="84" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Block</text>
    <text x="380" y="104" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 2</text>
    <rect x="130" y="116" width="500" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="138" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Deadlock</text>
    <text x="380" y="158" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 3</text>
    <rect x="160" y="170" width="440" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="192" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Isolation</text>
    <text x="380" y="212" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 4</text>
    <rect x="190" y="224" width="380" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="246" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Snapshot</text>
    <text x="380" y="266" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 5</text>
    <rect x="220" y="278" width="320" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="300" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Victim</text>
    <text x="380" y="320" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 6</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Blocking Chains</text>
  </svg>
  <div class="figcaption">Figure 1 — Blocking and deadlocks: how Blocking Chains relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Blocking Chains in practice",
      html: `
<p>Deadlock graphs from Extended Events show the processes, resources and lock modes involved. Reading the graph reveals the conflicting access order — the real fix is usually to make access order consistent or add an index so less data is locked.</p>
<p>The following comparison captures the distinctions that matter most when working with Blocking Chains:</p>
<table>
  <tr><th>Lock</th><th>Purpose</th><th>Compatibility</th></tr>
  <tr><td>Shared (S)</td><td>Protect a read</td><td>Compatible with other S</td></tr>
  <tr><td>Exclusive (X)</td><td>Protect a write</td><td>Incompatible with all</td></tr>
  <tr><td>Update (U)</td><td>Prevent conversion deadlocks</td><td>Compatible with S</td></tr>
</table>
<p>Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead.</p>
      `,
    },
    {
      h: "Working with Blocking Chains",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Blocking Chains. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Blocking Chains
-- Find the head blocker and its statement
SELECT r.session_id, r.blocking_session_id, r.wait_type,
       r.wait_resource, r.status, t.text AS sql_text
FROM   sys.dm_exec_requests r
OUTER APPLY sys.dm_exec_sql_text(r.sql_handle) t
WHERE  r.blocking_session_id <> 0 OR r.session_id IN (
  SELECT DISTINCT blocking_session_id
  FROM sys.dm_exec_requests WHERE blocking_session_id <> 0);</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Blocking Chains
-- Enable READ COMMITTED SNAPSHOT (requires care)
ALTER DATABASE SalesDB
SET READ_COMMITTED_SNAPSHOT ON;
GO
SELECT name, is_read_committed_snapshot_on
FROM   sys.databases WHERE name = 'SalesDB';</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Blocking Chains
-- Create an Extended Events session for deadlocks
CREATE EVENT SESSION [CaptureDeadlocks] ON SERVER
ADD EVENT sqlserver.xml_deadlock_report
ADD TARGET package0.event_file
  (SET filename = 'D:\XEvents\Deadlocks.xel');
GO
ALTER EVENT SESSION [CaptureDeadlocks] ON SERVER STATE = START;</code></pre>
<p>Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction left open by application code.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Locking protects data consistency when multiple sessions work concurrently. Shared locks protect reads, exclusive locks protect writes, update and intent locks coordinate the transition and hierarchy. Locks are normal; problems arise when they are held too long or in conflicting order.</p>
<table>
  <tr><th>Isolation level</th><th>Dirty reads</th><th>Extra protection</th></tr>
  <tr><td>READ UNCOMMITTED</td><td>Allowed</td><td>None</td></tr>
  <tr><td>READ COMMITTED</td><td>Prevented</td><td>Default</td></tr>
  <tr><td>REPEATABLE READ</td><td>Prevented</td><td>Held read locks</td></tr>
  <tr><td>SNAPSHOT</td><td>Prevented</td><td>Row versioning</td></tr>
</table>
<p>Blocking occurs when one session holds a lock another needs. A short block is normal; a long block is an incident. The session at the root — the head blocker — is the one to investigate, not the dozens of sessions queued behind it.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Blocking Chains, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    }
  ],

  scenario: {
    title: "The head blocker behind 200 timeouts",
    html: `
An application update ran a large DELETE without a supporting index at 2 p.m., holding locks on a busy table. Two hundred sessions queued behind it. The DBA found the single head blocker, confirmed it was the unindexed delete, killed it with approval after the transaction began rolling back, then added an index and rescheduled the cleanup. Chasing the 200 victims would have changed nothing.
<p><strong>The Blocking Chains lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "How does READ COMMITTED SNAPSHOT reduce blocking?",
      a: `
It uses row versioning so readers do not take shared locks that block writers and writers do not block readers; the trade-off is extra tempdb version-store usage and different semantics for some applications.
      `,
    },
    {
      q: "What is the difference between blocking and a deadlock?",
      a: `
Blocking is one session waiting for a lock held by another — it resolves when the holder finishes. A deadlock is a cycle of two or more sessions each holding what the other needs, which SQL Server resolves by killing a victim.
      `,
    },
    {
      q: "How do you find the head blocker?",
      a: `
Query sys.dm_exec_requests for sessions with a blocking_session_id, then find the session that is blocking others but is not itself blocked; inspect its statement, wait type and plan to find the root cause.
      `,
    }
  ],

  takeaways: [
    "Blocking Chains is a fundamental concept in blocking and deadlocks",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Blocking Chains improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
