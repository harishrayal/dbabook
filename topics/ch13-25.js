/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch13-25.html */

window.TOPIC = {
  id: "ch13-25",
  title: "Production Incident Handling",

  lead: "Production Incident Handling is a core part of blocking and deadlocks. This topic explains what it is, how it works inside SQL Server, and what a production DBA must know to operate it safely.",

  objectives: [
    "Define what Production Incident Handling is and where it fits",
    "Explain how Production Incident Handling works internally",
    "Apply Production Incident Handling correctly in a production environment",
    "Recognise the common mistakes and risks involving Production Incident Handling",
    "Monitor and troubleshoot Production Incident Handling with the right tools"
  ],

  sections: [
    {
      h: "What Production Incident Handling means",
      html: `
<p>In this topic we examine <strong>Production Incident Handling</strong> within blocking and deadlocks. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Locking protects data consistency when multiple sessions work concurrently. Shared locks protect reads, exclusive locks protect writes, update and intent locks coordinate the transition and hierarchy. Locks are normal; problems arise when they are held too long or in conflicting order.</p>
<p>Blocking occurs when one session holds a lock another needs. A short block is normal; a long block is an incident. The session at the root — the head blocker — is the one to investigate, not the dozens of sessions queued behind it.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Production Incident Handling is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Production Incident Handling fits",
      html: `
<p>Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions. Large unindexed updates are a common trigger.</p>
<p>The diagram below places Production Incident Handling alongside the core concepts of blocking and deadlocks. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Production Incident Handling concept map">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="280" y="140" width="200" height="60" rx="9" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="175" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Production Incident Handling</text>
    <rect x="24" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Lock</text>
    <text x="124" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 1</text>
    <rect x="536" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Block</text>
    <text x="636" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 2</text>
    <rect x="24" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Deadlock</text>
    <text x="124" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 3</text>
    <rect x="536" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Isolation</text>
    <text x="636" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 4</text>
    <rect x="24" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Snapshot</text>
    <text x="124" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 5</text>
    <rect x="536" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Victim</text>
    <text x="636" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 6</text>
    <line x1="380" y1="170" x2="124" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
  </svg>
  <div class="figcaption">Figure 1 — Blocking and deadlocks: how Production Incident Handling relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Production Incident Handling in practice",
      html: `
<p>Isolation levels define how transactions are protected from one another. READ COMMITTED is the default; READ UNCOMMITTED allows dirty reads; REPEATABLE READ and SERIALIZABLE increase protection and blocking; SNAPSHOT and READ COMMITTED SNAPSHOT use row versioning to reduce reader-writer blocking.</p>
<p>The following comparison captures the distinctions that matter most when working with Production Incident Handling:</p>
<table>
  <tr><th>Lock</th><th>Purpose</th><th>Compatibility</th></tr>
  <tr><td>Shared (S)</td><td>Protect a read</td><td>Compatible with other S</td></tr>
  <tr><td>Exclusive (X)</td><td>Protect a write</td><td>Incompatible with all</td></tr>
  <tr><td>Update (U)</td><td>Prevent conversion deadlocks</td><td>Compatible with S</td></tr>
</table>
<p>A deadlock is a cycle: session A holds a resource B needs while B holds a resource A needs. SQL Server detects the cycle, chooses a victim and rolls it back with error 1205 so the other can proceed.</p>
      `,
    },
    {
      h: "Working with Production Incident Handling",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Production Incident Handling. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Production Incident Handling
-- Find the head blocker and its statement
SELECT r.session_id, r.blocking_session_id, r.wait_type,
       r.wait_resource, r.status, t.text AS sql_text
FROM   sys.dm_exec_requests r
OUTER APPLY sys.dm_exec_sql_text(r.sql_handle) t
WHERE  r.blocking_session_id <> 0 OR r.session_id IN (
  SELECT DISTINCT blocking_session_id
  FROM sys.dm_exec_requests WHERE blocking_session_id <> 0);</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Production Incident Handling
-- Enable READ COMMITTED SNAPSHOT (requires care)
ALTER DATABASE SalesDB
SET READ_COMMITTED_SNAPSHOT ON;
GO
SELECT name, is_read_committed_snapshot_on
FROM   sys.databases WHERE name = 'SalesDB';</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Production Incident Handling
-- Create an Extended Events session for deadlocks
CREATE EVENT SESSION [CaptureDeadlocks] ON SERVER
ADD EVENT sqlserver.xml_deadlock_report
ADD TARGET package0.event_file
  (SET filename = 'D:\XEvents\Deadlocks.xel');
GO
ALTER EVENT SESSION [CaptureDeadlocks] ON SERVER STATE = START;</code></pre>
<p>Deadlock graphs from Extended Events show the processes, resources and lock modes involved. Reading the graph reveals the conflicting access order — the real fix is usually to make access order consistent or add an index so less data is locked.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead.</p>
<table>
  <tr><th>Isolation level</th><th>Dirty reads</th><th>Extra protection</th></tr>
  <tr><td>READ UNCOMMITTED</td><td>Allowed</td><td>None</td></tr>
  <tr><td>READ COMMITTED</td><td>Prevented</td><td>Default</td></tr>
  <tr><td>REPEATABLE READ</td><td>Prevented</td><td>Held read locks</td></tr>
  <tr><td>SNAPSHOT</td><td>Prevented</td><td>Row versioning</td></tr>
</table>
<p>Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction left open by application code.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Production Incident Handling, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    }
  ],

  scenario: {
    title: "The head blocker behind 200 timeouts",
    html: `
An application update ran a large DELETE without a supporting index at 2 p.m., holding locks on a busy table. Two hundred sessions queued behind it. The DBA found the single head blocker, confirmed it was the unindexed delete, killed it with approval after the transaction began rolling back, then added an index and rescheduled the cleanup. Chasing the 200 victims would have changed nothing.
<p><strong>The Production Incident Handling lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
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
    },
    {
      q: "How does READ COMMITTED SNAPSHOT reduce blocking?",
      a: `
It uses row versioning so readers do not take shared locks that block writers and writers do not block readers; the trade-off is extra tempdb version-store usage and different semantics for some applications.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within blocking and deadlocks.”",
      "options": [
        "Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions.",
        "The diagram below places Production Incident Handling alongside the core concepts of blocking and deadlocks.",
        "Production Incident Handling"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Production Incident Handling within blocking and deadlocks. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Incident Handling fits”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Production Incident Handling:",
        "Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions.",
        "Isolation levels define how transactions are protected from one another."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions. Large unindexed updates are a common trigger.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Incident Handling in practice”?",
      "options": [
        "Isolation levels define how transactions are protected from one another.",
        "The diagram below places Production Incident Handling alongside the core concepts of blocking and deadlocks.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Isolation levels define how transactions are protected from one another. READ COMMITTED is the default; READ UNCOMMITTED allows dirty reads; REPEATABLE READ and SERIALIZABLE increase protection and blocking; SNAPSHOT and READ COMMITTED SNAPSHOT use row versioning to reduce reader-writer blocking.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Incident Handling”?",
      "options": [
        "Isolation levels define how transactions are protected from one another.",
        "The following comparison captures the distinctions that matter most when working with Production Incident Handling:",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Production Incident Handling. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "A deadlock is a cycle: session A holds a resource B needs while B holds a resource A needs.",
        "Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead.",
        "The following comparison captures the distinctions that matter most when working with Production Incident Handling:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Production Incident Handling means”?",
      "options": [
        "Locking protects data consistency when multiple sessions work concurrently.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Locking protects data consistency when multiple sessions work concurrently. Shared locks protect reads, exclusive locks protect writes, update and intent locks coordinate the transition and hierarchy. Locks are normal; problems arise when they are held too long or in conflicting order.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Incident Handling fits”?",
      "options": [
        "Compatible with S",
        "Theory becomes useful when you can apply it.",
        "The diagram below places Production Incident Handling alongside the core concepts of blocking and deadlocks."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Production Incident Handling alongside the core concepts of blocking and deadlocks. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Incident Handling in practice”?",
      "options": [
        "Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction…",
        "The following comparison captures the distinctions that matter most when working with Production Incident Handling:",
        "Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Production Incident Handling:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Incident Handling”?",
      "options": [
        "The first example establishes the relevant state.",
        "Compatible with S",
        "Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction left open by application code.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within blocking and deadlocks.”",
      "options": [
        "Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions.",
        "The diagram below places Production Incident Handling alongside the core concepts of blocking and deadlocks.",
        "Production Incident Handling"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Production Incident Handling within blocking and deadlocks. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Incident Handling fits”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Production Incident Handling:",
        "Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions.",
        "Isolation levels define how transactions are protected from one another."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions. Large unindexed updates are a common trigger.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Incident Handling in practice”?",
      "options": [
        "Isolation levels define how transactions are protected from one another.",
        "The diagram below places Production Incident Handling alongside the core concepts of blocking and deadlocks.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Isolation levels define how transactions are protected from one another. READ COMMITTED is the default; READ UNCOMMITTED allows dirty reads; REPEATABLE READ and SERIALIZABLE increase protection and blocking; SNAPSHOT and READ COMMITTED SNAPSHOT use row versioning to reduce reader-writer blocking.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Incident Handling”?",
      "options": [
        "Isolation levels define how transactions are protected from one another.",
        "The following comparison captures the distinctions that matter most when working with Production Incident Handling:",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Production Incident Handling. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "A deadlock is a cycle: session A holds a resource B needs while B holds a resource A needs.",
        "Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead.",
        "The following comparison captures the distinctions that matter most when working with Production Incident Handling:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Production Incident Handling means”?",
      "options": [
        "Locking protects data consistency when multiple sessions work concurrently.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Locking protects data consistency when multiple sessions work concurrently. Shared locks protect reads, exclusive locks protect writes, update and intent locks coordinate the transition and hierarchy. Locks are normal; problems arise when they are held too long or in conflicting order.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Incident Handling fits”?",
      "options": [
        "Compatible with S",
        "Theory becomes useful when you can apply it.",
        "The diagram below places Production Incident Handling alongside the core concepts of blocking and deadlocks."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Production Incident Handling alongside the core concepts of blocking and deadlocks. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Incident Handling in practice”?",
      "options": [
        "Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction…",
        "The following comparison captures the distinctions that matter most when working with Production Incident Handling:",
        "Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Production Incident Handling:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Incident Handling”?",
      "options": [
        "The first example establishes the relevant state.",
        "Compatible with S",
        "Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction left open by application code.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within blocking and deadlocks.”",
      "options": [
        "Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions.",
        "The diagram below places Production Incident Handling alongside the core concepts of blocking and deadlocks.",
        "Production Incident Handling"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Production Incident Handling within blocking and deadlocks. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Incident Handling fits”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Production Incident Handling:",
        "Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions.",
        "Isolation levels define how transactions are protected from one another."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Lock escalation converts many fine-grained row or page locks into a single table lock to save memory, which can suddenly block many more sessions. Large unindexed updates are a common trigger.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Incident Handling in practice”?",
      "options": [
        "Isolation levels define how transactions are protected from one another.",
        "The diagram below places Production Incident Handling alongside the core concepts of blocking and deadlocks.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Isolation levels define how transactions are protected from one another. READ COMMITTED is the default; READ UNCOMMITTED allows dirty reads; REPEATABLE READ and SERIALIZABLE increase protection and blocking; SNAPSHOT and READ COMMITTED SNAPSHOT use row versioning to reduce reader-writer blocking.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Incident Handling”?",
      "options": [
        "Isolation levels define how transactions are protected from one another.",
        "The following comparison captures the distinctions that matter most when working with Production Incident Handling:",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Production Incident Handling. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "A deadlock is a cycle: session A holds a resource B needs while B holds a resource A needs.",
        "Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead.",
        "The following comparison captures the distinctions that matter most when working with Production Incident Handling:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Production Incident Handling means”?",
      "options": [
        "Locking protects data consistency when multiple sessions work concurrently.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Locking protects data consistency when multiple sessions work concurrently. Shared locks protect reads, exclusive locks protect writes, update and intent locks coordinate the transition and hierarchy. Locks are normal; problems arise when they are held too long or in conflicting order.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Production Incident Handling fits”?",
      "options": [
        "Compatible with S",
        "Theory becomes useful when you can apply it.",
        "The diagram below places Production Incident Handling alongside the core concepts of blocking and deadlocks."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Production Incident Handling alongside the core concepts of blocking and deadlocks. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Production Incident Handling in practice”?",
      "options": [
        "Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction…",
        "The following comparison captures the distinctions that matter most when working with Production Incident Handling:",
        "Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Production Incident Handling:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Production Incident Handling”?",
      "options": [
        "The first example establishes the relevant state.",
        "Compatible with S",
        "Reader-writer blocking is frequently reduced by enabling READ COMMITTED SNAPSHOT, which versions rows so readers do not block writers, at the cost of tempdb version-store overhead."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Investigation should be evidence-led: capture the head blocker, the wait resource, the statement and the plan, then fix the root cause — often a missing index or a transaction left open by application code.”"
    }
  ],
  takeaways: [
    "Production Incident Handling is a fundamental concept in blocking and deadlocks",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Production Incident Handling improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
