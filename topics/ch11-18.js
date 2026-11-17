/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch11-18.html */

window.TOPIC = {
  id: "ch11-18",
  title: "Dynamic Management Views (DMVs)",

  lead: "This topic covers Dynamic Management Views (DMVs) — a concept you will meet repeatedly when working with database monitoring and alerting. We build from first principles to production guidance.",

  objectives: [
    "Define what Dynamic Management Views (DMVs) is and where it fits",
    "Explain how Dynamic Management Views (DMVs) works internally",
    "Apply Dynamic Management Views (DMVs) correctly in a production environment",
    "Recognise the common mistakes and risks involving Dynamic Management Views (DMVs)",
    "Monitor and troubleshoot Dynamic Management Views (DMVs) with the right tools"
  ],

  sections: [
    {
      h: "What Dynamic Management Views (DMVs) means",
      html: `
<p>In this topic we examine <strong>Dynamic Management Views (DMVs)</strong> within database monitoring and alerting. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs. Consistency matters more than complexity.</p>
<p>Dynamic management views and functions expose the engine's internal state. sys.dm_os_waiting_tasks, sys.dm_exec_requests, sys.dm_os_performance_counters and sys.dm_db_* views are the DBA's primary diagnostic surface.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Dynamic Management Views (DMVs) is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Dynamic Management Views (DMVs) fits",
      html: `
<p>Wait statistics are the most efficient way to find the dominant bottleneck. SQL Server records what each session waited on; aggregating waits points to I/O, CPU, locking or logging as the constraint instead of guessing.</p>
<p>The diagram below places Dynamic Management Views (DMVs) alongside the core concepts of database monitoring and alerting. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Dynamic Management Views (DMV… layers">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="70" y="8" width="620" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="30" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">DMV</text>
    <text x="380" y="50" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 1</text>
    <rect x="100" y="62" width="560" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="84" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Wait</text>
    <text x="380" y="104" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 2</text>
    <rect x="130" y="116" width="500" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="138" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Health check</text>
    <text x="380" y="158" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 3</text>
    <rect x="160" y="170" width="440" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="192" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Error log</text>
    <text x="380" y="212" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 4</text>
    <rect x="190" y="224" width="380" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="246" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Extended Events</text>
    <text x="380" y="266" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 5</text>
    <rect x="220" y="278" width="320" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="300" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Alert</text>
    <text x="380" y="320" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 6</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Dynamic Management Views (DMV…</text>
  </svg>
  <div class="figcaption">Figure 1 — Database monitoring and alerting: how Dynamic Management Views (DMVs) relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Dynamic Management Views (DMVs) in practice",
      html: `
<p>The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues. Reviewing them daily turns cryptic errors into early warnings.</p>
<p>The following comparison captures the distinctions that matter most when working with Dynamic Management Views (DMVs):</p>
<table>
  <tr><th>Metric</th><th>DMV / source</th><th>Why it matters</th></tr>
  <tr><td>Waits</td><td>dm_os_wait_stats</td><td>Finds the bottleneck</td></tr>
  <tr><td>Blocking</td><td>dm_exec_requests</td><td>Finds head blockers</td></tr>
  <tr><td>Space</td><td>dm_os_volume_stats</td><td>Prevents disk full</td></tr>
</table>
<p>Extended Events is the modern lightweight diagnostics framework. Sessions capture events such as deadlocks, long queries or errors with far less overhead than SQL Trace/Profiler and are safe in production when scoped carefully.</p>
      `,
    },
    {
      h: "Working with Dynamic Management Views (DMVs)",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Dynamic Management Views (DMVs). Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Dynamic Management Views (DMVs)
-- Top wait types (since instance start)
SELECT TOP 10 wait_type,
       wait_time_ms / 1000 AS wait_seconds,
       waiting_tasks_count
FROM   sys.dm_os_wait_stats
WHERE  wait_type NOT LIKE 'SLEEP%'
  AND  wait_type NOT IN ('CLR_SEMAPHORE','LAZYWRITER_SLEEP')
ORDER BY wait_time_ms DESC;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Dynamic Management Views (DMVs)
-- Current requests and blocking
SELECT session_id, status, command, blocking_session_id,
       wait_type, wait_time, total_elapsed_time
FROM   sys.dm_exec_requests
WHERE  session_id > 50
ORDER BY blocking_session_id DESC, total_elapsed_time DESC;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Dynamic Management Views (DMVs)
-- Volume free space via dm_os_volume_stats
SELECT DISTINCT vs.volume_mount_point,
       vs.total_bytes / 1073741824 AS total_gb,
       vs.available_bytes / 1073741824 AS free_gb
FROM   sys.master_files f
CROSS APPLY sys.dm_os_volume_stats(f.database_id, f.file_id) vs;</code></pre>
<p>Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold. Database Mail, Agent alerts and external monitoring systems deliver that signal.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads.</p>
<table>
  <tr><th>Concern</th><th>Healthy sign</th><th>Warning sign</th></tr>
  <tr><td>Page life expectancy</td><td>High and stable</td><td>Falling rapidly</td></tr>
  <tr><td>Log usage %</td><td>Low</td><td>Approaching 90%</td></tr>
  <tr><td>Failed jobs</td><td>None</td><td>Any overnight failure</td></tr>
</table>
<p>Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem? Reactive monitoring reports failures; proactive monitoring catches trends — growing log usage, falling page life expectancy, lengthening backups — before users notice.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Dynamic Management Views (DMVs), prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Dynamic Management Views (DMVs)",
      html: `
<p>This section consolidates <strong>Dynamic Management Views (DMVs)</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues. Reviewing them daily turns cryptic errors into early warnings.</p>
<p>Extended Events is the modern lightweight diagnostics framework. Sessions capture events such as deadlocks, long queries or errors with far less overhead than SQL Trace/Profiler and are safe in production when scoped carefully.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Dynamic Management Views (DMVs) sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Concern</th><th>Healthy sign</th><th>Warning sign</th></tr>
  <tr><td>Page life expectancy</td><td>High and stable</td><td>Falling rapidly</td></tr>
  <tr><td>Log usage %</td><td>Low</td><td>Approaching 90%</td></tr>
  <tr><td>Failed jobs</td><td>None</td><td>Any overnight failure</td></tr>
</table>
<p>Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold. Database Mail, Agent alerts and external monitoring systems deliver that signal.</p>
<p>Use the following as a starting point when investigating Dynamic Management Views (DMVs). Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Dynamic Management Views (DMVs)
-- Current requests and blocking
SELECT session_id, status, command, blocking_session_id,
       wait_type, wait_time, total_elapsed_time
FROM   sys.dm_exec_requests
WHERE  session_id > 50
ORDER BY blocking_session_id DESC, total_elapsed_time DESC;</code></pre>
<p>Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads.</p>
      `,
    }
  ],

  scenario: {
    title: "The slowdown with no errors",
    html: `
Users reported intermittent slowness but nothing appeared in the error log. Wait statistics showed PAGEIOLATCH_SH dominating, pointing to physical reads; a query scan on a large table was evicting cache. An index and a predicate fixed it. Waits diagnose what logs cannot.
<p><strong>The Dynamic Management Views (DMVs) lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "Why prefer Extended Events over SQL Profiler in production?",
      a: `
Extended Events is far lighter weight, highly filterable and designed for production diagnostics; Profiler/SQL Trace carry much higher overhead and are deprecated.
      `,
    },
    {
      q: "What belongs in a daily health check?",
      a: `
Uptime, database states, last successful backups, failed jobs, volume and log free space, tempdb health, current blocking and a review of SQL and Windows error logs.
      `,
    },
    {
      q: "How do wait statistics help diagnose performance?",
      a: `
They aggregate what sessions spent time waiting on — I/O, locks, latches, logging, CPU — so you can identify the dominant bottleneck instead of guessing from symptoms.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database monitoring and alerting.”",
      "options": [
        "Dynamic Management Views (DMVs)",
        "Falling rapidly",
        "Approaching 90%"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Dynamic Management Views (DMVs) within database monitoring and alerting. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Dynamic Management Views (DMVs) fits”?",
      "options": [
        "Any overnight failure",
        "Dynamic Management Views (DMVs) sits inside a larger system.",
        "Wait statistics are the most efficient way to find the dominant bottleneck."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Wait statistics are the most efficient way to find the dominant bottleneck. SQL Server records what each session waited on; aggregating waits points to I/O, CPU, locking or logging as the constraint instead of guessing.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Dynamic Management Views (DMVs) in practice”?",
      "options": [
        "Finds the bottleneck",
        "The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues.",
        "The following comparison captures the distinctions that matter most when working with Dynamic Management Views (DMVs):"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues. Reviewing them daily turns cryptic errors into early warnings.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Dynamic Management Views (DMVs)”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Use the following as a starting point when investigating Dynamic Management Views (DMVs).",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Dynamic Management Views (DMVs). Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem?",
        "With Dynamic Management Views (DMVs), prefer measured, reversible changes.",
        "Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs.",
        "Dynamic Management Views (DMVs)",
        "Use the following as a starting point when investigating Dynamic Management Views (DMVs)."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Dynamic Management Views (DMVs) with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Dynamic Management Views (DMVs) means”?",
      "options": [
        "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs.",
        "Wait statistics are the most efficient way to find the dominant bottleneck.",
        "The diagram below places Dynamic Management Views (DMVs) alongside the core concepts of database monitoring and alerting."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs. Consistency matters more than complexity.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Dynamic Management Views (DMVs) fits”?",
      "options": [
        "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs.",
        "Dynamic management views and functions expose the engine's internal state.",
        "The diagram below places Dynamic Management Views (DMVs) alongside the core concepts of database monitoring and alerting."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Dynamic Management Views (DMVs) alongside the core concepts of database monitoring and alerting. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Dynamic Management Views (DMVs) in practice”?",
      "options": [
        "Dynamic Management Views (DMVs) is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "The following comparison captures the distinctions that matter most when working with Dynamic Management Views (DMVs):",
        "Dynamic management views and functions expose the engine's internal state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Dynamic Management Views (DMVs):”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Dynamic Management Views (DMVs)”?",
      "options": [
        "The first example establishes the relevant state.",
        "Dynamic Management Views (DMVs) is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Wait statistics are the most efficient way to find the dominant bottleneck."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database monitoring and alerting.”",
      "options": [
        "Dynamic Management Views (DMVs)",
        "Falling rapidly",
        "Approaching 90%"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Dynamic Management Views (DMVs) within database monitoring and alerting. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Dynamic Management Views (DMVs) fits”?",
      "options": [
        "Any overnight failure",
        "Dynamic Management Views (DMVs) sits inside a larger system.",
        "Wait statistics are the most efficient way to find the dominant bottleneck."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Wait statistics are the most efficient way to find the dominant bottleneck. SQL Server records what each session waited on; aggregating waits points to I/O, CPU, locking or logging as the constraint instead of guessing.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Dynamic Management Views (DMVs) in practice”?",
      "options": [
        "Finds the bottleneck",
        "The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues.",
        "The following comparison captures the distinctions that matter most when working with Dynamic Management Views (DMVs):"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues. Reviewing them daily turns cryptic errors into early warnings.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Dynamic Management Views (DMVs)”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Use the following as a starting point when investigating Dynamic Management Views (DMVs).",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Dynamic Management Views (DMVs). Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem?",
        "With Dynamic Management Views (DMVs), prefer measured, reversible changes.",
        "Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs.",
        "Dynamic Management Views (DMVs)",
        "Use the following as a starting point when investigating Dynamic Management Views (DMVs)."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Dynamic Management Views (DMVs) with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Dynamic Management Views (DMVs) means”?",
      "options": [
        "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs.",
        "Wait statistics are the most efficient way to find the dominant bottleneck.",
        "The diagram below places Dynamic Management Views (DMVs) alongside the core concepts of database monitoring and alerting."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs. Consistency matters more than complexity.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Dynamic Management Views (DMVs) fits”?",
      "options": [
        "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs.",
        "Dynamic management views and functions expose the engine's internal state.",
        "The diagram below places Dynamic Management Views (DMVs) alongside the core concepts of database monitoring and alerting."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Dynamic Management Views (DMVs) alongside the core concepts of database monitoring and alerting. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Dynamic Management Views (DMVs) in practice”?",
      "options": [
        "Dynamic Management Views (DMVs) is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "The following comparison captures the distinctions that matter most when working with Dynamic Management Views (DMVs):",
        "Dynamic management views and functions expose the engine's internal state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Dynamic Management Views (DMVs):”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Dynamic Management Views (DMVs)”?",
      "options": [
        "The first example establishes the relevant state.",
        "Dynamic Management Views (DMVs) is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Wait statistics are the most efficient way to find the dominant bottleneck."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database monitoring and alerting.”",
      "options": [
        "Dynamic Management Views (DMVs)",
        "Falling rapidly",
        "Approaching 90%"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Dynamic Management Views (DMVs) within database monitoring and alerting. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Dynamic Management Views (DMVs) fits”?",
      "options": [
        "Any overnight failure",
        "Dynamic Management Views (DMVs) sits inside a larger system.",
        "Wait statistics are the most efficient way to find the dominant bottleneck."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Wait statistics are the most efficient way to find the dominant bottleneck. SQL Server records what each session waited on; aggregating waits points to I/O, CPU, locking or logging as the constraint instead of guessing.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Dynamic Management Views (DMVs) in practice”?",
      "options": [
        "Finds the bottleneck",
        "The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues.",
        "The following comparison captures the distinctions that matter most when working with Dynamic Management Views (DMVs):"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues. Reviewing them daily turns cryptic errors into early warnings.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Dynamic Management Views (DMVs)”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Use the following as a starting point when investigating Dynamic Management Views (DMVs).",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Dynamic Management Views (DMVs). Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem?",
        "With Dynamic Management Views (DMVs), prefer measured, reversible changes.",
        "Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs.",
        "Dynamic Management Views (DMVs)",
        "Use the following as a starting point when investigating Dynamic Management Views (DMVs)."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Dynamic Management Views (DMVs) with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Dynamic Management Views (DMVs) means”?",
      "options": [
        "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs.",
        "Wait statistics are the most efficient way to find the dominant bottleneck.",
        "The diagram below places Dynamic Management Views (DMVs) alongside the core concepts of database monitoring and alerting."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs. Consistency matters more than complexity.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Dynamic Management Views (DMVs) fits”?",
      "options": [
        "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs.",
        "Dynamic management views and functions expose the engine's internal state.",
        "The diagram below places Dynamic Management Views (DMVs) alongside the core concepts of database monitoring and alerting."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Dynamic Management Views (DMVs) alongside the core concepts of database monitoring and alerting. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Dynamic Management Views (DMVs) in practice”?",
      "options": [
        "Dynamic Management Views (DMVs) is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "The following comparison captures the distinctions that matter most when working with Dynamic Management Views (DMVs):",
        "Dynamic management views and functions expose the engine's internal state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Dynamic Management Views (DMVs):”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Dynamic Management Views (DMVs)”?",
      "options": [
        "The first example establishes the relevant state.",
        "Dynamic Management Views (DMVs) is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Wait statistics are the most efficient way to find the dominant bottleneck."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Dynamic Management Views (DMVs) is a fundamental concept in database monitoring and alerting",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Dynamic Management Views (DMVs) improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
