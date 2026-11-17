/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch11-19.html */

window.TOPIC = {
  id: "ch11-19",
  title: "SQL Server Error Logs",

  lead: "SQL Server Error Logs is a core part of database monitoring and alerting. This topic explains what it is, how it works inside SQL Server, and what a production DBA must know to operate it safely.",

  objectives: [
    "Define what SQL Server Error Logs is and where it fits",
    "Explain how SQL Server Error Logs works internally",
    "Apply SQL Server Error Logs correctly in a production environment",
    "Recognise the common mistakes and risks involving SQL Server Error Logs",
    "Monitor and troubleshoot SQL Server Error Logs with the right tools"
  ],

  sections: [
    {
      h: "What SQL Server Error Logs means",
      html: `
<p>In this topic we examine <strong>SQL Server Error Logs</strong> within database monitoring and alerting. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Dynamic management views and functions expose the engine's internal state. sys.dm_os_waiting_tasks, sys.dm_exec_requests, sys.dm_os_performance_counters and sys.dm_db_* views are the DBA's primary diagnostic surface.</p>
<p>Wait statistics are the most efficient way to find the dominant bottleneck. SQL Server records what each session waited on; aggregating waits points to I/O, CPU, locking or logging as the constraint instead of guessing.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>SQL Server Error Logs is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where SQL Server Error Logs fits",
      html: `
<p>The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues. Reviewing them daily turns cryptic errors into early warnings.</p>
<p>The diagram below places SQL Server Error Logs alongside the core concepts of database monitoring and alerting. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="SQL Server Error Logs concept map">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="280" y="140" width="200" height="60" rx="9" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="175" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">SQL Server Error Logs</text>
    <rect x="24" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">DMV</text>
    <text x="124" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 1</text>
    <rect x="536" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Wait</text>
    <text x="636" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 2</text>
    <rect x="24" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Health check</text>
    <text x="124" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 3</text>
    <rect x="536" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Error log</text>
    <text x="636" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 4</text>
    <rect x="24" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Extended Events</text>
    <text x="124" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 5</text>
    <rect x="536" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Alert</text>
    <text x="636" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 6</text>
    <line x1="380" y1="170" x2="124" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
  </svg>
  <div class="figcaption">Figure 1 — Database monitoring and alerting: how SQL Server Error Logs relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "SQL Server Error Logs in practice",
      html: `
<p>Extended Events is the modern lightweight diagnostics framework. Sessions capture events such as deadlocks, long queries or errors with far less overhead than SQL Trace/Profiler and are safe in production when scoped carefully.</p>
<p>The following comparison captures the distinctions that matter most when working with SQL Server Error Logs:</p>
<table>
  <tr><th>Metric</th><th>DMV / source</th><th>Why it matters</th></tr>
  <tr><td>Waits</td><td>dm_os_wait_stats</td><td>Finds the bottleneck</td></tr>
  <tr><td>Blocking</td><td>dm_exec_requests</td><td>Finds head blockers</td></tr>
  <tr><td>Space</td><td>dm_os_volume_stats</td><td>Prevents disk full</td></tr>
</table>
<p>Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold. Database Mail, Agent alerts and external monitoring systems deliver that signal.</p>
      `,
    },
    {
      h: "Working with SQL Server Error Logs",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Error Logs. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- SQL Server Error Logs
-- Top wait types (since instance start)
SELECT TOP 10 wait_type,
       wait_time_ms / 1000 AS wait_seconds,
       waiting_tasks_count
FROM   sys.dm_os_wait_stats
WHERE  wait_type NOT LIKE 'SLEEP%'
  AND  wait_type NOT IN ('CLR_SEMAPHORE','LAZYWRITER_SLEEP')
ORDER BY wait_time_ms DESC;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- SQL Server Error Logs
-- Current requests and blocking
SELECT session_id, status, command, blocking_session_id,
       wait_type, wait_time, total_elapsed_time
FROM   sys.dm_exec_requests
WHERE  session_id > 50
ORDER BY blocking_session_id DESC, total_elapsed_time DESC;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- SQL Server Error Logs
-- Volume free space via dm_os_volume_stats
SELECT DISTINCT vs.volume_mount_point,
       vs.total_bytes / 1073741824 AS total_gb,
       vs.available_bytes / 1073741824 AS free_gb
FROM   sys.master_files f
CROSS APPLY sys.dm_os_volume_stats(f.database_id, f.file_id) vs;</code></pre>
<p>Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem? Reactive monitoring reports failures; proactive monitoring catches trends — growing log usage, falling page life expectancy, lengthening backups — before users notice.</p>
<table>
  <tr><th>Concern</th><th>Healthy sign</th><th>Warning sign</th></tr>
  <tr><td>Page life expectancy</td><td>High and stable</td><td>Falling rapidly</td></tr>
  <tr><td>Log usage %</td><td>Low</td><td>Approaching 90%</td></tr>
  <tr><td>Failed jobs</td><td>None</td><td>Any overnight failure</td></tr>
</table>
<p>A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs. Consistency matters more than complexity.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With SQL Server Error Logs, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    }
  ],

  scenario: {
    title: "The alert storm that hid a real failure",
    html: `
A monitoring system alerted on every minor error, producing hundreds of messages a day. When a genuine log-growth failure occurred, its alert was lost in the noise. The DBA re-tiered alerts by severity, suppressed known-benign events and routed only actionable conditions to on-call. Monitoring must produce signal, not volume.
<p><strong>The SQL Server Error Logs lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
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
    },
    {
      q: "Why prefer Extended Events over SQL Profiler in production?",
      a: `
Extended Events is far lighter weight, highly filterable and designed for production diagnostics; Profiler/SQL Trace carry much higher overhead and are deprecated.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database monitoring and alerting.”",
      "options": [
        "Approaching 90%",
        "Any overnight failure",
        "SQL Server Error Logs"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine SQL Server Error Logs within database monitoring and alerting. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Error Logs fits”?",
      "options": [
        "SQL Server Error Logs",
        "The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues.",
        "The diagram below places SQL Server Error Logs alongside the core concepts of database monitoring and alerting."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues. Reviewing them daily turns cryptic errors into early warnings.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Error Logs in practice”?",
      "options": [
        "Extended Events is the modern lightweight diagnostics framework.",
        "SQL Server Error Logs",
        "Dynamic management views and functions expose the engine's internal state."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Extended Events is the modern lightweight diagnostics framework. Sessions capture events such as deadlocks, long queries or errors with far less overhead than SQL Trace/Profiler and are safe in production when scoped carefully.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Error Logs”?",
      "options": [
        "Dynamic management views and functions expose the engine's internal state.",
        "Wait statistics are the most efficient way to find the dominant bottleneck.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Error Logs. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "SQL Server Error Logs is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem?",
        "Wait statistics are the most efficient way to find the dominant bottleneck."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem? Reactive monitoring reports failures; proactive monitoring catches trends — growing log usage, falling page life expectancy, lengthening backups — before users notice.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SQL Server Error Logs means”?",
      "options": [
        "Dynamic management views and functions expose the engine's internal state.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Error Logs:",
        "Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Dynamic management views and functions expose the engine's internal state. sys.dm_os_waiting_tasks, sys.dm_exec_requests, sys.dm_os_performance_counters and sys.dm_db_* views are the DBA's primary diagnostic surface.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Error Logs fits”?",
      "options": [
        "Extended Events is the modern lightweight diagnostics framework.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Error Logs:",
        "The diagram below places SQL Server Error Logs alongside the core concepts of database monitoring and alerting."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places SQL Server Error Logs alongside the core concepts of database monitoring and alerting. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Error Logs in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Error Logs:",
        "The diagram below places SQL Server Error Logs alongside the core concepts of database monitoring and alerting."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SQL Server Error Logs:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Error Logs”?",
      "options": [
        "The first example establishes the relevant state.",
        "Extended Events is the modern lightweight diagnostics framework.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Error Logs:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with SQL Server Error Logs:",
        "Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold.",
        "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs. Consistency matters more than complexity.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database monitoring and alerting.”",
      "options": [
        "Approaching 90%",
        "Any overnight failure",
        "SQL Server Error Logs"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine SQL Server Error Logs within database monitoring and alerting. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Error Logs fits”?",
      "options": [
        "SQL Server Error Logs",
        "The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues.",
        "The diagram below places SQL Server Error Logs alongside the core concepts of database monitoring and alerting."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues. Reviewing them daily turns cryptic errors into early warnings.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Error Logs in practice”?",
      "options": [
        "Extended Events is the modern lightweight diagnostics framework.",
        "SQL Server Error Logs",
        "Dynamic management views and functions expose the engine's internal state."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Extended Events is the modern lightweight diagnostics framework. Sessions capture events such as deadlocks, long queries or errors with far less overhead than SQL Trace/Profiler and are safe in production when scoped carefully.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Error Logs”?",
      "options": [
        "Dynamic management views and functions expose the engine's internal state.",
        "Wait statistics are the most efficient way to find the dominant bottleneck.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Error Logs. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "SQL Server Error Logs is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem?",
        "Wait statistics are the most efficient way to find the dominant bottleneck."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem? Reactive monitoring reports failures; proactive monitoring catches trends — growing log usage, falling page life expectancy, lengthening backups — before users notice.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SQL Server Error Logs means”?",
      "options": [
        "Dynamic management views and functions expose the engine's internal state.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Error Logs:",
        "Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Dynamic management views and functions expose the engine's internal state. sys.dm_os_waiting_tasks, sys.dm_exec_requests, sys.dm_os_performance_counters and sys.dm_db_* views are the DBA's primary diagnostic surface.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Error Logs fits”?",
      "options": [
        "Extended Events is the modern lightweight diagnostics framework.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Error Logs:",
        "The diagram below places SQL Server Error Logs alongside the core concepts of database monitoring and alerting."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places SQL Server Error Logs alongside the core concepts of database monitoring and alerting. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Error Logs in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Error Logs:",
        "The diagram below places SQL Server Error Logs alongside the core concepts of database monitoring and alerting."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SQL Server Error Logs:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Error Logs”?",
      "options": [
        "The first example establishes the relevant state.",
        "Extended Events is the modern lightweight diagnostics framework.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Error Logs:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with SQL Server Error Logs:",
        "Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold.",
        "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs. Consistency matters more than complexity.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database monitoring and alerting.”",
      "options": [
        "Approaching 90%",
        "Any overnight failure",
        "SQL Server Error Logs"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine SQL Server Error Logs within database monitoring and alerting. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Error Logs fits”?",
      "options": [
        "SQL Server Error Logs",
        "The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues.",
        "The diagram below places SQL Server Error Logs alongside the core concepts of database monitoring and alerting."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues. Reviewing them daily turns cryptic errors into early warnings.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Error Logs in practice”?",
      "options": [
        "Extended Events is the modern lightweight diagnostics framework.",
        "SQL Server Error Logs",
        "Dynamic management views and functions expose the engine's internal state."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Extended Events is the modern lightweight diagnostics framework. Sessions capture events such as deadlocks, long queries or errors with far less overhead than SQL Trace/Profiler and are safe in production when scoped carefully.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Error Logs”?",
      "options": [
        "Dynamic management views and functions expose the engine's internal state.",
        "Wait statistics are the most efficient way to find the dominant bottleneck.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Error Logs. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "SQL Server Error Logs is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem?",
        "Wait statistics are the most efficient way to find the dominant bottleneck."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem? Reactive monitoring reports failures; proactive monitoring catches trends — growing log usage, falling page life expectancy, lengthening backups — before users notice.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SQL Server Error Logs means”?",
      "options": [
        "Dynamic management views and functions expose the engine's internal state.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Error Logs:",
        "Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Dynamic management views and functions expose the engine's internal state. sys.dm_os_waiting_tasks, sys.dm_exec_requests, sys.dm_os_performance_counters and sys.dm_db_* views are the DBA's primary diagnostic surface.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Error Logs fits”?",
      "options": [
        "Extended Events is the modern lightweight diagnostics framework.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Error Logs:",
        "The diagram below places SQL Server Error Logs alongside the core concepts of database monitoring and alerting."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places SQL Server Error Logs alongside the core concepts of database monitoring and alerting. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Error Logs in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Error Logs:",
        "The diagram below places SQL Server Error Logs alongside the core concepts of database monitoring and alerting."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SQL Server Error Logs:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Error Logs”?",
      "options": [
        "The first example establishes the relevant state.",
        "Extended Events is the modern lightweight diagnostics framework.",
        "The following comparison captures the distinctions that matter most when working with SQL Server Error Logs:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with SQL Server Error Logs:",
        "Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold.",
        "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs. Consistency matters more than complexity.”"
    }
  ],
  takeaways: [
    "SQL Server Error Logs is a fundamental concept in database monitoring and alerting",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of SQL Server Error Logs improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
