/* Practical content file — one JS file per practical lab.
   Rendered by assets/js/site.js on practicals/practical-08.html */

window.TOPIC = {
  id: "practical-08",
  title: "Blocking and Deadlocks",

  lead: "A hands-on concurrency lab: reproduce blocking and a deadlock, find the head blocker with DMVs, capture a deadlock graph with Extended Events, and fix the root cause with indexing and consistent access order.",

  objectives: [
    "Reproduce blocking with two sessions",
    "Identify the head blocker and wait resource",
    "Reproduce a deadlock safely in a lab",
    "Capture and read a deadlock graph",
    "Apply fixes that remove the root cause"
  ],

  sections: [
    {
      h: "Before you start",
      html: `
<p>This lab makes concurrency visible. You will create blocking on purpose, watch sessions queue, then force a deadlock and read the graph SQL Server produces — skills that turn a panicked incident into a calm diagnosis.</p>
<p>Work only on a scratch database. You will hold transactions open across sessions, so use short timeouts and always clean up with ROLLBACK or KILL of your own test sessions.</p>
<p><strong>Environment check</strong> — confirm where you are before changing anything; this habit prevents production mistakes:</p>
<pre><code class="language-sql">-- Lab step
-- SESSION A: hold a lock (leave this transaction open)
BEGIN TRAN;
UPDATE dbo.ConcurrencyDemo
SET    Amount = Amount + 1
WHERE  Id = 1;
-- Do NOT commit yet
GO

-- SESSION B: this will block behind session A
UPDATE dbo.ConcurrencyDemo
SET    Amount = Amount + 2
WHERE  Id = 1;
GO</code></pre>
      `,
    },
    {
      h: "Lab architecture",
      html: `
<p>Locking protects consistency; blocking is one session waiting on another's lock, and a deadlock is a cycle where each session holds what the other needs. Short blocks are normal; long blocks and repeated deadlocks are incidents.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Blocking and deadlock investigation">
    <defs>
      <marker id="pa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="200" y="10" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="31" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Sessions report waits</text>
    <line x1="380" y1="54" x2="380" y2="64" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="64" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="85" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Find head blocker in dm_exec_requests</text>
    <line x1="380" y1="108" x2="380" y2="118" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="118" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="139" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Read statement and wait resource</text>
    <line x1="380" y1="162" x2="380" y2="172" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="172" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="193" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Capture deadlock graph via XEvents</text>
    <line x1="380" y1="216" x2="380" y2="226" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="226" width="360" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)"/>
    <text x="380" y="247" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Fix order / indexing and verify</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Blocking and deadlock investigation</text>
  </svg>
  <div class="figcaption">Figure 1 — Detect the queue, find the head blocker, inspect its statement, then remove the root cause.</div>
</div>
<p>The investigation flow below is the one to memorise: detect the block, find the head blocker, inspect its statement and plan, fix the cause, then verify the queue drains.</p>
      `,
    },
    {
      h: "Core tasks",
      html: `
<p>Open two query windows. In session A, begin a transaction and update a row without committing. In session B, try to update the same row — it will block. Query dm_exec_requests to see B's blocking_session_id pointing at A.</p>
<table>
  <tr><th>Lock</th><th>Purpose</th><th>Compatibility</th></tr>
  <tr><td>Shared (S)</td><td>Protect a read</td><td>Compatible with other S</td></tr>
  <tr><td>Exclusive (X)</td><td>Protect a write</td><td>Incompatible with everything</td></tr>
  <tr><td>Update (U)</td><td>Avoid conversion deadlocks</td><td>Compatible with S</td></tr>
</table>
<p>Find the head blocker: among blocked sessions, identify the one that is blocking others but is not itself blocked. Read its wait_type, wait_resource and statement to understand what it is holding.</p>
<pre><code class="language-sql">-- Lab step
-- THIRD SESSION: find the head blocker
SELECT r.session_id, r.blocking_session_id, r.wait_type,
       r.wait_resource, r.status, t.text AS sql_text
FROM   sys.dm_exec_requests r
OUTER APPLY sys.dm_exec_sql_text(r.sql_handle) t
WHERE  r.blocking_session_id <> 0
    OR r.session_id IN (
         SELECT DISTINCT blocking_session_id
         FROM   sys.dm_exec_requests
         WHERE  blocking_session_id <> 0
       )
ORDER BY r.blocking_session_id DESC;
GO</code></pre>
      `,
    },
    {
      h: "Verify your work",
      html: `
<p>Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:</p>
<pre><code class="language-sql">-- Lab step
-- Capture deadlocks with Extended Events
CREATE EVENT SESSION [CaptureDeadlocks] ON SERVER
ADD EVENT sqlserver.xml_deadlock_report
ADD TARGET package0.event_file
  (SET filename = 'D:\XEvents\Deadlocks.xel');
GO
ALTER EVENT SESSION [CaptureDeadlocks] ON SERVER STATE = START;
GO
-- Reduce reader/writer blocking where appropriate
ALTER DATABASE ConcurrencyLab
SET READ_COMMITTED_SNAPSHOT ON;
GO</code></pre>
<p>For the deadlock, make two sessions update the same two tables in opposite orders inside transactions. SQL Server detects the cycle and terminates one session with error 1205, the deadlock victim.</p>
<p>If the output differs, stop and correct it before moving on. A lab that 'looks right' but was never verified teaches the wrong lessons.</p>
      `,
    },
    {
      h: "Pitfalls and safe practice",
      html: `
<p>Create an Extended Events session on xml_deadlock_report to capture the graph, then fix the cause: consistent access order and an index that narrows the locks taken. Retry to confirm the deadlocks stop.</p>
<table>
  <tr><th>Isolation level</th><th>Dirty reads</th><th>Effect on blocking</th></tr>
  <tr><td>READ UNCOMMITTED</td><td>Allowed</td><td>Minimal locking, dirty data</td></tr>
  <tr><td>READ COMMITTED</td><td>Prevented</td><td>Default; writers can block readers</td></tr>
  <tr><td>SNAPSHOT</td><td>Prevented</td><td>Row versioning reduces blocking</td></tr>
</table>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.</p>
</div>
      `,
    }
  ],

  steps: [
    "Create ConcurrencyLab with a dbo.ConcurrencyDemo table containing a few thousand rows and an Amount column.",
    "In session A, begin a transaction, update one row and leave the transaction open.",
    "In session B, update the same row and confirm it blocks; note the spinner or waiting state.",
    "From a third session, run the DMV query and identify A as the head blocker and B as blocked.",
    "Read session A's wait_type, wait_resource and statement text from the query output.",
    "Roll back session A and confirm session B completes immediately — the queue drains when the head blocker releases.",
    "Start the Extended Events session to capture xml_deadlock_report events.",
    "In two sessions, update two tables in opposite orders inside transactions to force a deadlock; one session should fail with error 1205.",
    "Open the captured .xel file in SSMS and read the deadlock graph — identify the processes, resources and lock modes in the cycle.",
    "Rewrite the two procedures to access tables in the same order, add a supporting index, then retry to confirm deadlocks stop."
  ],

  scenario: {
    title: "The head blocker behind 200 timeouts",
    html: `
An application ran a large unindexed DELETE at 2 p.m., holding locks on a busy table while two hundred sessions queued behind it and timed out. The DBA found the single head blocker, confirmed it was the unindexed delete, stopped it with approval and added an index that narrowed the locks. Chasing the two hundred victims would have changed nothing. In a separate case, two procedures updated tables in opposite order; the deadlock graph made the cycle obvious, and consistent access order eliminated it permanently.
<p><strong>The lesson:</strong> practise both the diagnosis and the safe mitigation in this lab. Under pressure, the steps you have rehearsed are the steps you will actually take — build good muscle memory now.</p>
    `,
  },

  interview: [
    {
      q: "What is the difference between blocking and a deadlock?",
      a: `
Blocking is one session waiting for a lock another holds, resolving when the holder finishes; a deadlock is a cycle of sessions each holding what the other needs, which SQL Server resolves by killing a victim.
      `,
    },
    {
      q: "How do you find the head blocker?",
      a: `
Query sys.dm_exec_requests for blocked sessions, then find the one blocking others but not itself blocked; inspect its statement, wait type and plan to address the root cause.
      `,
    },
    {
      q: "How does READ COMMITTED SNAPSHOT reduce blocking?",
      a: `
It uses row versioning so readers do not take shared locks that block writers and writers do not block readers, at the cost of extra tempdb version-store usage and slightly different read semantics.
      `,
    }
  ],

  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "If the output differs, stop and correct it before moving on.",
        "This lab makes concurrency visible.",
        "For the deadlock, make two sessions update the same two tables in opposite orders inside transactions."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “This lab makes concurrency visible. You will create blocking on purpose, watch sessions queue, then force a deadlock and read the graph SQL Server produces — skills that turn a panicked incident into a calm diagnosis.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Locking protects consistency; blocking is one session waiting on another's lock, and a deadlock is a cycle where each session holds what the other needs.",
        "For the deadlock, make two sessions update the same two tables in opposite orders inside transactions.",
        "If the output differs, stop and correct it before moving on."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Locking protects consistency; blocking is one session waiting on another's lock, and a deadlock is a cycle where each session holds what the other needs. Short blocks are normal; long blocks and repeated deadlocks are incidents.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Minimal locking, dirty data",
        "Default; writers can block readers",
        "Open two query windows."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Open two query windows. In session A, begin a transaction and update a row without committing. In session B, try to update the same row — it will block. Query dm_exec_requests to see B's blocking_session_id pointing at A.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Minimal locking, dirty data",
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Create an Extended Events session on xml_deadlock_report to capture the graph, then fix the cause: consistent access order and an index that narrows the locks taken.",
        "If the output differs, stop and correct it before moving on.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Create an Extended Events session on xml_deadlock_report to capture the graph, then fix the cause: consistent access order and an index that narrows the locks taken. Retry to confirm the deadlocks stop.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "Default; writers can block readers",
        "Row versioning reduces blocking",
        "Work only on a scratch database."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Work only on a scratch database. You will hold transactions open across sessions, so use short timeouts and always clean up with ROLLBACK or KILL of your own test sessions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Row versioning reduces blocking",
        "The investigation flow below is the one to memorise: detect the block, find the head blocker, inspect its statement and plan, fix the cause, then verify the queue drains.",
        "Default; writers can block readers"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The investigation flow below is the one to memorise: detect the block, find the head blocker, inspect its statement and plan, fix the cause, then verify the queue drains.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Find the head blocker: among blocked sessions, identify the one that is blocking others but is not itself blocked.",
        "Incompatible with everything",
        "Compatible with S"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Find the head blocker: among blocked sessions, identify the one that is blocking others but is not itself blocked. Read its wait_type, wait_resource and statement to understand what it is holding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "If the output differs, stop and correct it before moving on.",
        "This lab makes concurrency visible.",
        "For the deadlock, make two sessions update the same two tables in opposite orders inside transactions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “For the deadlock, make two sessions update the same two tables in opposite orders inside transactions. SQL Server detects the cycle and terminates one session with error 1205, the deadlock victim.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Work only on a scratch database.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "This lab makes concurrency visible."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "If the output differs, stop and correct it before moving on.",
        "This lab makes concurrency visible.",
        "For the deadlock, make two sessions update the same two tables in opposite orders inside transactions."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “This lab makes concurrency visible. You will create blocking on purpose, watch sessions queue, then force a deadlock and read the graph SQL Server produces — skills that turn a panicked incident into a calm diagnosis.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Locking protects consistency; blocking is one session waiting on another's lock, and a deadlock is a cycle where each session holds what the other needs.",
        "For the deadlock, make two sessions update the same two tables in opposite orders inside transactions.",
        "If the output differs, stop and correct it before moving on."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Locking protects consistency; blocking is one session waiting on another's lock, and a deadlock is a cycle where each session holds what the other needs. Short blocks are normal; long blocks and repeated deadlocks are incidents.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Minimal locking, dirty data",
        "Default; writers can block readers",
        "Open two query windows."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Open two query windows. In session A, begin a transaction and update a row without committing. In session B, try to update the same row — it will block. Query dm_exec_requests to see B's blocking_session_id pointing at A.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Minimal locking, dirty data",
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Create an Extended Events session on xml_deadlock_report to capture the graph, then fix the cause: consistent access order and an index that narrows the locks taken.",
        "If the output differs, stop and correct it before moving on.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Create an Extended Events session on xml_deadlock_report to capture the graph, then fix the cause: consistent access order and an index that narrows the locks taken. Retry to confirm the deadlocks stop.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "Default; writers can block readers",
        "Row versioning reduces blocking",
        "Work only on a scratch database."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Work only on a scratch database. You will hold transactions open across sessions, so use short timeouts and always clean up with ROLLBACK or KILL of your own test sessions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Row versioning reduces blocking",
        "The investigation flow below is the one to memorise: detect the block, find the head blocker, inspect its statement and plan, fix the cause, then verify the queue drains.",
        "Default; writers can block readers"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The investigation flow below is the one to memorise: detect the block, find the head blocker, inspect its statement and plan, fix the cause, then verify the queue drains.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Find the head blocker: among blocked sessions, identify the one that is blocking others but is not itself blocked.",
        "Incompatible with everything",
        "Compatible with S"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Find the head blocker: among blocked sessions, identify the one that is blocking others but is not itself blocked. Read its wait_type, wait_resource and statement to understand what it is holding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "If the output differs, stop and correct it before moving on.",
        "This lab makes concurrency visible.",
        "For the deadlock, make two sessions update the same two tables in opposite orders inside transactions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “For the deadlock, make two sessions update the same two tables in opposite orders inside transactions. SQL Server detects the cycle and terminates one session with error 1205, the deadlock victim.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Work only on a scratch database.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "This lab makes concurrency visible."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "If the output differs, stop and correct it before moving on.",
        "This lab makes concurrency visible.",
        "For the deadlock, make two sessions update the same two tables in opposite orders inside transactions."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “This lab makes concurrency visible. You will create blocking on purpose, watch sessions queue, then force a deadlock and read the graph SQL Server produces — skills that turn a panicked incident into a calm diagnosis.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Locking protects consistency; blocking is one session waiting on another's lock, and a deadlock is a cycle where each session holds what the other needs.",
        "For the deadlock, make two sessions update the same two tables in opposite orders inside transactions.",
        "If the output differs, stop and correct it before moving on."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Locking protects consistency; blocking is one session waiting on another's lock, and a deadlock is a cycle where each session holds what the other needs. Short blocks are normal; long blocks and repeated deadlocks are incidents.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Minimal locking, dirty data",
        "Default; writers can block readers",
        "Open two query windows."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Open two query windows. In session A, begin a transaction and update a row without committing. In session B, try to update the same row — it will block. Query dm_exec_requests to see B's blocking_session_id pointing at A.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Minimal locking, dirty data",
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Create an Extended Events session on xml_deadlock_report to capture the graph, then fix the cause: consistent access order and an index that narrows the locks taken.",
        "If the output differs, stop and correct it before moving on.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Create an Extended Events session on xml_deadlock_report to capture the graph, then fix the cause: consistent access order and an index that narrows the locks taken. Retry to confirm the deadlocks stop.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "Default; writers can block readers",
        "Row versioning reduces blocking",
        "Work only on a scratch database."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Work only on a scratch database. You will hold transactions open across sessions, so use short timeouts and always clean up with ROLLBACK or KILL of your own test sessions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Row versioning reduces blocking",
        "The investigation flow below is the one to memorise: detect the block, find the head blocker, inspect its statement and plan, fix the cause, then verify the queue drains.",
        "Default; writers can block readers"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The investigation flow below is the one to memorise: detect the block, find the head blocker, inspect its statement and plan, fix the cause, then verify the queue drains.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Find the head blocker: among blocked sessions, identify the one that is blocking others but is not itself blocked.",
        "Incompatible with everything",
        "Compatible with S"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Find the head blocker: among blocked sessions, identify the one that is blocking others but is not itself blocked. Read its wait_type, wait_resource and statement to understand what it is holding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "If the output differs, stop and correct it before moving on.",
        "This lab makes concurrency visible.",
        "For the deadlock, make two sessions update the same two tables in opposite orders inside transactions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “For the deadlock, make two sessions update the same two tables in opposite orders inside transactions. SQL Server detects the cycle and terminates one session with error 1205, the deadlock victim.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Work only on a scratch database.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "This lab makes concurrency visible."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.”"
    }
  ],
  takeaways: [
    "Investigate the head blocker, not the queue of blocked sessions",
    "Short blocking is normal; long blocking and repeated deadlocks are incidents",
    "Deadlock graphs reveal the access-order conflict behind the symptom",
    "Consistent access order and good indexing are the durable fixes",
    "Extended Events captures deadlocks with low overhead in production"
  ]
};
