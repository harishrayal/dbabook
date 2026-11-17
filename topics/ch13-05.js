/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch13-05.html */

window.TOPIC = {
  id: "ch13-05",
  title: "SQL Server Locks",

  lead: "Understanding SQL Server Locks is essential for anyone responsible for blocking and deadlocks. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what SQL Server Locks is and where it fits",
    "Explain how SQL Server Locks works internally",
    "Apply SQL Server Locks correctly in a production environment",
    "Recognise the common mistakes and risks involving SQL Server Locks",
    "Monitor and troubleshoot SQL Server Locks with the right tools"
  ],

  sections: [
    {
      h: "What SQL Server Locks means",
      html: `
<p>In this topic we examine <strong>SQL Server Locks</strong> within blocking and deadlocks. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>A deadlock is a cycle: session A holds a resource B needs while B holds a resource A needs. SQL Server detects the cycle, chooses a victim and rolls it back with error 1205 so the other can proceed.</p>
<p>Deadlock graphs from Extended Events show the processes, resources and lock modes involved. Reading the graph reveals the conflicting access order — the real fix is usually to make access order consistent or add an index so less data is locked.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>SQL Server Locks is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where SQL Server Locks fits",
      html: `
<p>Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead.</p>
<p>The diagram below places SQL Server Locks alongside the core concepts of blocking and deadlocks. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="SQL Server Locks flow">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="230" y="12" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="39" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Lock</text>
    <rect x="230" y="66" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="93" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Block</text>
    <rect x="230" y="120" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="147" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Deadlock</text>
    <rect x="230" y="174" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="201" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Isolation</text>
    <rect x="230" y="228" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="255" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Snapshot</text>
    <rect x="230" y="282" width="300" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="309" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">6. Victim</text>
    <line x1="380" y1="56" x2="380" y2="66" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="110" x2="380" y2="120" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="164" x2="380" y2="174" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="218" x2="380" y2="228" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="272" x2="380" y2="282" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">SQL Server Locks</text>
  </svg>
  <div class="figcaption">Figure 1 — Blocking and deadlocks: how SQL Server Locks relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "SQL Server Locks in practice",
      html: `
<p>Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction left open by application code.</p>
<p>The following comparison captures the distinctions that matter most when working with SQL Server Locks:</p>
<table>
  <tr><th>Lock</th><th>Purpose</th><th>Compatibility</th></tr>
  <tr><td>Shared (S)</td><td>Protect a read</td><td>Compatible with other S</td></tr>
  <tr><td>Exclusive (X)</td><td>Protect a write</td><td>Incompatible with all</td></tr>
  <tr><td>Update (U)</td><td>Prevent conversion deadlocks</td><td>Compatible with S</td></tr>
</table>
<p>Locking protects data consistency when multiple sessions work concurrently. Shared locks protect reads, exclusive locks protect writes, update and intent locks coordinate the transition and hierarchy. Locks are normal; problems arise when they are held too long or in conflicting order.</p>
      `,
    },
    {
      h: "Working with SQL Server Locks",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Locks. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- SQL Server Locks
-- Find the head blocker and its statement
SELECT r.session_id, r.blocking_session_id, r.wait_type,
       r.wait_resource, r.status, t.text AS sql_text
FROM   sys.dm_exec_requests r
OUTER APPLY sys.dm_exec_sql_text(r.sql_handle) t
WHERE  r.blocking_session_id <> 0 OR r.session_id IN (
  SELECT DISTINCT blocking_session_id
  FROM sys.dm_exec_requests WHERE blocking_session_id <> 0);</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- SQL Server Locks
-- Enable READ COMMITTED SNAPSHOT (requires care)
ALTER DATABASE SalesDB
SET READ_COMMITTED_SNAPSHOT ON;
GO
SELECT name, is_read_committed_snapshot_on
FROM   sys.databases WHERE name = 'SalesDB';</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- SQL Server Locks
-- Create an Extended Events session for deadlocks
CREATE EVENT SESSION [CaptureDeadlocks] ON SERVER
ADD EVENT sqlserver.xml_deadlock_report
ADD TARGET package0.event_file
  (SET filename = 'D:\XEvents\Deadlocks.xel');
GO
ALTER EVENT SESSION [CaptureDeadlocks] ON SERVER STATE = START;</code></pre>
<p>Blocking occurs when one session holds a lock another needs. A short block is normal; a long block is an incident. The session at the root — the head blocker — is the one to investigate, not the dozens of sessions queued behind it.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions. Large unindexed updates are a common trigger.</p>
<table>
  <tr><th>Isolation level</th><th>Dirty reads</th><th>Extra protection</th></tr>
  <tr><td>READ UNCOMMITTED</td><td>Allowed</td><td>None</td></tr>
  <tr><td>READ COMMITTED</td><td>Prevented</td><td>Default</td></tr>
  <tr><td>REPEATABLE READ</td><td>Prevented</td><td>Held read locks</td></tr>
  <tr><td>SNAPSHOT</td><td>Prevented</td><td>Row versioning</td></tr>
</table>
<p>Isolation levels define how transactions are protected from one another. READ COMMITTED is the default; READ UNCOMMITTED allows dirty reads; REPEATABLE READ and SERIALIZABLE increase protection and blocking; SNAPSHOT and READ COMMITTED SNAPSHOT use row versioning to reduce reader-writer blocking.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With SQL Server Locks, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: SQL Server Locks",
      html: `
<p>This section consolidates <strong>SQL Server Locks</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction left open by application code.</p>
<p>Locking protects data consistency when multiple sessions work concurrently. Shared locks protect reads, exclusive locks protect writes, update and intent locks coordinate the transition and hierarchy. Locks are normal; problems arise when they are held too long or in conflicting order.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>SQL Server Locks sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Lock</th><th>Purpose</th><th>Compatibility</th></tr>
  <tr><td>Shared (S)</td><td>Protect a read</td><td>Compatible with other S</td></tr>
  <tr><td>Exclusive (X)</td><td>Protect a write</td><td>Incompatible with all</td></tr>
  <tr><td>Update (U)</td><td>Prevent conversion deadlocks</td><td>Compatible with S</td></tr>
</table>
<p>Blocking occurs when one session holds a lock another needs. A short block is normal; a long block is an incident. The session at the root — the head blocker — is the one to investigate, not the dozens of sessions queued behind it.</p>
<p>Use the following as a starting point when investigating SQL Server Locks. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- SQL Server Locks
-- Find the head blocker and its statement
SELECT r.session_id, r.blocking_session_id, r.wait_type,
       r.wait_resource, r.status, t.text AS sql_text
FROM   sys.dm_exec_requests r
OUTER APPLY sys.dm_exec_sql_text(r.sql_handle) t
WHERE  r.blocking_session_id <> 0 OR r.session_id IN (
  SELECT DISTINCT blocking_session_id
  FROM sys.dm_exec_requests WHERE blocking_session_id <> 0);</code></pre>
<p>Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions. Large unindexed updates are a common trigger.</p>
      `,
    }
  ],

  scenario: {
    title: "The head blocker behind 200 timeouts",
    html: `
An application update ran a large DELETE without a supporting index at 2 p.m., holding locks on a busy table. Two hundred sessions queued behind it. The DBA found the single head blocker, confirmed it was the unindexed delete, killed it with approval after the transaction began rolling back, then added an index and rescheduled the cleanup. Chasing the 200 victims would have changed nothing.
<p><strong>The SQL Server Locks lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "How do you find the head blocker?",
      a: `
Query sys.dm_exec_requests for sessions with a blocking_session_id, then find the session that is blocking others but is not itself blocked; inspect its statement, wait type and plan to find the root cause.
      `,
    },
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
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within blocking and deadlocks.”",
      "options": [
        "The following comparison captures the distinctions that matter most when working with SQL Server Locks:",
        "SQL Server Locks",
        "Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine SQL Server Locks within blocking and deadlocks. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Locks fits”?",
      "options": [
        "Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead.",
        "Locking protects data consistency when multiple sessions work concurrently.",
        "Compatible with other S"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Locks in practice”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction left open by application code.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Locks”?",
      "options": [
        "Compatible with other S",
        "Theory becomes useful when you can apply it.",
        "Locking protects data consistency when multiple sessions work concurrently."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Locks. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions.",
        "Compatible with other S",
        "Incompatible with all"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions. Large unindexed updates are a common trigger.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Compatible with S",
        "Theory becomes useful when you can apply it.",
        "SQL Server Locks"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates SQL Server Locks with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SQL Server Locks means”?",
      "options": [
        "Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions.",
        "A deadlock is a cycle: session A holds a resource B needs while B holds a resource A needs.",
        "Blocking occurs when one session holds a lock another needs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A deadlock is a cycle: session A holds a resource B needs while B holds a resource A needs. SQL Server detects the cycle, chooses a victim and rolls it back with error 1205 so the other can proceed.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Locks fits”?",
      "options": [
        "The diagram below places SQL Server Locks alongside the core concepts of blocking and deadlocks.",
        "Next, verify the result and capture a baseline.",
        "Blocking occurs when one session holds a lock another needs."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places SQL Server Locks alongside the core concepts of blocking and deadlocks. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Locks in practice”?",
      "options": [
        "None",
        "Default",
        "The following comparison captures the distinctions that matter most when working with SQL Server Locks:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SQL Server Locks:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Locks”?",
      "options": [
        "None",
        "The first example establishes the relevant state.",
        "With SQL Server Locks, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within blocking and deadlocks.”",
      "options": [
        "The following comparison captures the distinctions that matter most when working with SQL Server Locks:",
        "SQL Server Locks",
        "Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine SQL Server Locks within blocking and deadlocks. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Locks fits”?",
      "options": [
        "Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead.",
        "Locking protects data consistency when multiple sessions work concurrently.",
        "Compatible with other S"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Locks in practice”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction left open by application code.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Locks”?",
      "options": [
        "Compatible with other S",
        "Theory becomes useful when you can apply it.",
        "Locking protects data consistency when multiple sessions work concurrently."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Locks. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions.",
        "Compatible with other S",
        "Incompatible with all"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions. Large unindexed updates are a common trigger.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Compatible with S",
        "Theory becomes useful when you can apply it.",
        "SQL Server Locks"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates SQL Server Locks with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SQL Server Locks means”?",
      "options": [
        "Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions.",
        "A deadlock is a cycle: session A holds a resource B needs while B holds a resource A needs.",
        "Blocking occurs when one session holds a lock another needs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A deadlock is a cycle: session A holds a resource B needs while B holds a resource A needs. SQL Server detects the cycle, chooses a victim and rolls it back with error 1205 so the other can proceed.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Locks fits”?",
      "options": [
        "The diagram below places SQL Server Locks alongside the core concepts of blocking and deadlocks.",
        "Next, verify the result and capture a baseline.",
        "Blocking occurs when one session holds a lock another needs."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places SQL Server Locks alongside the core concepts of blocking and deadlocks. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Locks in practice”?",
      "options": [
        "None",
        "Default",
        "The following comparison captures the distinctions that matter most when working with SQL Server Locks:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SQL Server Locks:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Locks”?",
      "options": [
        "None",
        "The first example establishes the relevant state.",
        "With SQL Server Locks, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within blocking and deadlocks.”",
      "options": [
        "The following comparison captures the distinctions that matter most when working with SQL Server Locks:",
        "SQL Server Locks",
        "Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine SQL Server Locks within blocking and deadlocks. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Locks fits”?",
      "options": [
        "Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead.",
        "Locking protects data consistency when multiple sessions work concurrently.",
        "Compatible with other S"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Locks in practice”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction left open by application code.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Locks”?",
      "options": [
        "Compatible with other S",
        "Theory becomes useful when you can apply it.",
        "Locking protects data consistency when multiple sessions work concurrently."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Locks. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions.",
        "Compatible with other S",
        "Incompatible with all"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions. Large unindexed updates are a common trigger.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Compatible with S",
        "Theory becomes useful when you can apply it.",
        "SQL Server Locks"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates SQL Server Locks with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SQL Server Locks means”?",
      "options": [
        "Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions.",
        "A deadlock is a cycle: session A holds a resource B needs while B holds a resource A needs.",
        "Blocking occurs when one session holds a lock another needs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A deadlock is a cycle: session A holds a resource B needs while B holds a resource A needs. SQL Server detects the cycle, chooses a victim and rolls it back with error 1205 so the other can proceed.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Locks fits”?",
      "options": [
        "The diagram below places SQL Server Locks alongside the core concepts of blocking and deadlocks.",
        "Next, verify the result and capture a baseline.",
        "Blocking occurs when one session holds a lock another needs."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places SQL Server Locks alongside the core concepts of blocking and deadlocks. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Locks in practice”?",
      "options": [
        "None",
        "Default",
        "The following comparison captures the distinctions that matter most when working with SQL Server Locks:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SQL Server Locks:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Locks”?",
      "options": [
        "None",
        "The first example establishes the relevant state.",
        "With SQL Server Locks, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "SQL Server Locks is a fundamental concept in blocking and deadlocks",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of SQL Server Locks improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
