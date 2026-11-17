/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch11-23.html */

window.TOPIC = {
  id: "ch11-23",
  title: "Daily Health-Check Reports",

  lead: "Understanding Daily Health-Check Reports is essential for anyone responsible for database monitoring and alerting. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what Daily Health-Check Reports is and where it fits",
    "Explain how Daily Health-Check Reports works internally",
    "Apply Daily Health-Check Reports correctly in a production environment",
    "Recognise the common mistakes and risks involving Daily Health-Check Reports",
    "Monitor and troubleshoot Daily Health-Check Reports with the right tools"
  ],

  sections: [
    {
      h: "What Daily Health-Check Reports means",
      html: `
<p>In this topic we examine <strong>Daily Health-Check Reports</strong> within database monitoring and alerting. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold. Database Mail, Agent alerts and external monitoring systems deliver that signal.</p>
<p>Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Daily Health-Check Reports is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Daily Health-Check Reports fits",
      html: `
<p>Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem? Reactive monitoring reports failures; proactive monitoring catches trends — growing log usage, falling page life expectancy, lengthening backups — before users notice.</p>
<p>The diagram below places Daily Health-Check Reports alongside the core concepts of database monitoring and alerting. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Daily Health-Check Reports flow">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="230" y="12" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="39" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. DMV</text>
    <rect x="230" y="66" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="93" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Wait</text>
    <rect x="230" y="120" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="147" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Health check</text>
    <rect x="230" y="174" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="201" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Error log</text>
    <rect x="230" y="228" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="255" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Extended Events</text>
    <rect x="230" y="282" width="300" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="309" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">6. Alert</text>
    <line x1="380" y1="56" x2="380" y2="66" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="110" x2="380" y2="120" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="164" x2="380" y2="174" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="218" x2="380" y2="228" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="272" x2="380" y2="282" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Daily Health-Check Reports</text>
  </svg>
  <div class="figcaption">Figure 1 — Database monitoring and alerting: how Daily Health-Check Reports relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Daily Health-Check Reports in practice",
      html: `
<p>A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs. Consistency matters more than complexity.</p>
<p>The following comparison captures the distinctions that matter most when working with Daily Health-Check Reports:</p>
<table>
  <tr><th>Metric</th><th>DMV / source</th><th>Why it matters</th></tr>
  <tr><td>Waits</td><td>dm_os_wait_stats</td><td>Finds the bottleneck</td></tr>
  <tr><td>Blocking</td><td>dm_exec_requests</td><td>Finds head blockers</td></tr>
  <tr><td>Space</td><td>dm_os_volume_stats</td><td>Prevents disk full</td></tr>
</table>
<p>Dynamic management views and functions expose the engine's internal state. sys.dm_os_waiting_tasks, sys.dm_exec_requests, sys.dm_os_performance_counters and sys.dm_db_* views are the DBA's primary diagnostic surface.</p>
      `,
    },
    {
      h: "Working with Daily Health-Check Reports",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Daily Health-Check Reports. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Daily Health-Check Reports
-- Top wait types (since instance start)
SELECT TOP 10 wait_type,
       wait_time_ms / 1000 AS wait_seconds,
       waiting_tasks_count
FROM   sys.dm_os_wait_stats
WHERE  wait_type NOT LIKE 'SLEEP%'
  AND  wait_type NOT IN ('CLR_SEMAPHORE','LAZYWRITER_SLEEP')
ORDER BY wait_time_ms DESC;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Daily Health-Check Reports
-- Current requests and blocking
SELECT session_id, status, command, blocking_session_id,
       wait_type, wait_time, total_elapsed_time
FROM   sys.dm_exec_requests
WHERE  session_id > 50
ORDER BY blocking_session_id DESC, total_elapsed_time DESC;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Daily Health-Check Reports
-- Volume free space via dm_os_volume_stats
SELECT DISTINCT vs.volume_mount_point,
       vs.total_bytes / 1073741824 AS total_gb,
       vs.available_bytes / 1073741824 AS free_gb
FROM   sys.master_files f
CROSS APPLY sys.dm_os_volume_stats(f.database_id, f.file_id) vs;</code></pre>
<p>Wait statistics are the most efficient way to find the dominant bottleneck. SQL Server records what each session waited on; aggregating waits points to I/O, CPU, locking or logging as the constraint instead of guessing.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues. Reviewing them daily turns cryptic errors into early warnings.</p>
<table>
  <tr><th>Concern</th><th>Healthy sign</th><th>Warning sign</th></tr>
  <tr><td>Page life expectancy</td><td>High and stable</td><td>Falling rapidly</td></tr>
  <tr><td>Log usage %</td><td>Low</td><td>Approaching 90%</td></tr>
  <tr><td>Failed jobs</td><td>None</td><td>Any overnight failure</td></tr>
</table>
<p>Extended Events is the modern lightweight diagnostics framework. Sessions capture events such as deadlocks, long queries or errors with far less overhead than SQL Trace/Profiler and are safe in production when scoped carefully.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Daily Health-Check Reports, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Daily Health-Check Reports",
      html: `
<p>This section consolidates <strong>Daily Health-Check Reports</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs. Consistency matters more than complexity.</p>
<p>Dynamic management views and functions expose the engine's internal state. sys.dm_os_waiting_tasks, sys.dm_exec_requests, sys.dm_os_performance_counters and sys.dm_db_* views are the DBA's primary diagnostic surface.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Daily Health-Check Reports sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Metric</th><th>DMV / source</th><th>Why it matters</th></tr>
  <tr><td>Waits</td><td>dm_os_wait_stats</td><td>Finds the bottleneck</td></tr>
  <tr><td>Blocking</td><td>dm_exec_requests</td><td>Finds head blockers</td></tr>
  <tr><td>Space</td><td>dm_os_volume_stats</td><td>Prevents disk full</td></tr>
</table>
<p>Wait statistics are the most efficient way to find the dominant bottleneck. SQL Server records what each session waited on; aggregating waits points to I/O, CPU, locking or logging as the constraint instead of guessing.</p>
<p>Use the following as a starting point when investigating Daily Health-Check Reports. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Daily Health-Check Reports
-- Top wait types (since instance start)
SELECT TOP 10 wait_type,
       wait_time_ms / 1000 AS wait_seconds,
       waiting_tasks_count
FROM   sys.dm_os_wait_stats
WHERE  wait_type NOT LIKE 'SLEEP%'
  AND  wait_type NOT IN ('CLR_SEMAPHORE','LAZYWRITER_SLEEP')
ORDER BY wait_time_ms DESC;</code></pre>
<p>The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues. Reviewing them daily turns cryptic errors into early warnings.</p>
      `,
    }
  ],

  scenario: {
    title: "The alert storm that hid a real failure",
    html: `
A monitoring system alerted on every minor error, producing hundreds of messages a day. When a genuine log-growth failure occurred, its alert was lost in the noise. The DBA re-tiered alerts by severity, suppressed known-benign events and routed only actionable conditions to on-call. Monitoring must produce signal, not volume.
<p><strong>The Daily Health-Check Reports lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
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
    },
    {
      q: "What belongs in a daily health check?",
      a: `
Uptime, database states, last successful backups, failed jobs, volume and log free space, tempdb health, current blocking and a review of SQL and Windows error logs.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database monitoring and alerting.”",
      "options": [
        "Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold.",
        "Daily Health-Check Reports",
        "Use the following as a starting point when investigating Daily Health-Check Reports."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Daily Health-Check Reports within database monitoring and alerting. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Daily Health-Check Reports fits”?",
      "options": [
        "Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem?",
        "Daily Health-Check Reports",
        "Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem? Reactive monitoring reports failures; proactive monitoring catches trends — growing log usage, falling page life expectancy, lengthening backups — before users notice.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Daily Health-Check Reports in practice”?",
      "options": [
        "Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold.",
        "Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads.",
        "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs. Consistency matters more than complexity.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Daily Health-Check Reports”?",
      "options": [
        "Daily Health-Check Reports is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Theory becomes useful when you can apply it.",
        "Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Daily Health-Check Reports. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues.",
        "Daily Health-Check Reports is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem?"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues. Reviewing them daily turns cryptic errors into early warnings.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The diagram below places Daily Health-Check Reports alongside the core concepts of database monitoring and alerting.",
        "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs.",
        "Daily Health-Check Reports"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Daily Health-Check Reports with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Daily Health-Check Reports means”?",
      "options": [
        "Finds head blockers",
        "Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold.",
        "Finds the bottleneck"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold. Database Mail, Agent alerts and external monitoring systems deliver that signal.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Daily Health-Check Reports fits”?",
      "options": [
        "The diagram below places Daily Health-Check Reports alongside the core concepts of database monitoring and alerting.",
        "Dynamic management views and functions expose the engine's internal state.",
        "Finds the bottleneck"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Daily Health-Check Reports alongside the core concepts of database monitoring and alerting. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Daily Health-Check Reports in practice”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "The following comparison captures the distinctions that matter most when working with Daily Health-Check Reports:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Daily Health-Check Reports:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Daily Health-Check Reports”?",
      "options": [
        "Finds the bottleneck",
        "The first example establishes the relevant state.",
        "Dynamic management views and functions expose the engine's internal state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database monitoring and alerting.”",
      "options": [
        "Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold.",
        "Daily Health-Check Reports",
        "Use the following as a starting point when investigating Daily Health-Check Reports."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Daily Health-Check Reports within database monitoring and alerting. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Daily Health-Check Reports fits”?",
      "options": [
        "Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem?",
        "Daily Health-Check Reports",
        "Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem? Reactive monitoring reports failures; proactive monitoring catches trends — growing log usage, falling page life expectancy, lengthening backups — before users notice.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Daily Health-Check Reports in practice”?",
      "options": [
        "Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold.",
        "Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads.",
        "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs. Consistency matters more than complexity.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Daily Health-Check Reports”?",
      "options": [
        "Daily Health-Check Reports is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Theory becomes useful when you can apply it.",
        "Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Daily Health-Check Reports. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues.",
        "Daily Health-Check Reports is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem?"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues. Reviewing them daily turns cryptic errors into early warnings.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The diagram below places Daily Health-Check Reports alongside the core concepts of database monitoring and alerting.",
        "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs.",
        "Daily Health-Check Reports"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Daily Health-Check Reports with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Daily Health-Check Reports means”?",
      "options": [
        "Finds head blockers",
        "Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold.",
        "Finds the bottleneck"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold. Database Mail, Agent alerts and external monitoring systems deliver that signal.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Daily Health-Check Reports fits”?",
      "options": [
        "The diagram below places Daily Health-Check Reports alongside the core concepts of database monitoring and alerting.",
        "Dynamic management views and functions expose the engine's internal state.",
        "Finds the bottleneck"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Daily Health-Check Reports alongside the core concepts of database monitoring and alerting. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Daily Health-Check Reports in practice”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "The following comparison captures the distinctions that matter most when working with Daily Health-Check Reports:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Daily Health-Check Reports:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Daily Health-Check Reports”?",
      "options": [
        "Finds the bottleneck",
        "The first example establishes the relevant state.",
        "Dynamic management views and functions expose the engine's internal state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database monitoring and alerting.”",
      "options": [
        "Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold.",
        "Daily Health-Check Reports",
        "Use the following as a starting point when investigating Daily Health-Check Reports."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Daily Health-Check Reports within database monitoring and alerting. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Daily Health-Check Reports fits”?",
      "options": [
        "Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem?",
        "Daily Health-Check Reports",
        "Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem? Reactive monitoring reports failures; proactive monitoring catches trends — growing log usage, falling page life expectancy, lengthening backups — before users notice.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Daily Health-Check Reports in practice”?",
      "options": [
        "Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold.",
        "Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads.",
        "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs. Consistency matters more than complexity.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Daily Health-Check Reports”?",
      "options": [
        "Daily Health-Check Reports is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Theory becomes useful when you can apply it.",
        "Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Daily Health-Check Reports. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues.",
        "Daily Health-Check Reports is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem?"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues. Reviewing them daily turns cryptic errors into early warnings.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The diagram below places Daily Health-Check Reports alongside the core concepts of database monitoring and alerting.",
        "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs.",
        "Daily Health-Check Reports"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Daily Health-Check Reports with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Daily Health-Check Reports means”?",
      "options": [
        "Finds head blockers",
        "Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold.",
        "Finds the bottleneck"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold. Database Mail, Agent alerts and external monitoring systems deliver that signal.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Daily Health-Check Reports fits”?",
      "options": [
        "The diagram below places Daily Health-Check Reports alongside the core concepts of database monitoring and alerting.",
        "Dynamic management views and functions expose the engine's internal state.",
        "Finds the bottleneck"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Daily Health-Check Reports alongside the core concepts of database monitoring and alerting. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Daily Health-Check Reports in practice”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "The following comparison captures the distinctions that matter most when working with Daily Health-Check Reports:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Daily Health-Check Reports:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Daily Health-Check Reports”?",
      "options": [
        "Finds the bottleneck",
        "The first example establishes the relevant state.",
        "Dynamic management views and functions expose the engine's internal state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Daily Health-Check Reports is a fundamental concept in database monitoring and alerting",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Daily Health-Check Reports improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
