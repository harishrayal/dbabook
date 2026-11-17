/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch11-14.html */

window.TOPIC = {
  id: "ch11-14",
  title: "Blocking Monitoring",

  lead: "Understanding Blocking Monitoring is essential for anyone responsible for database monitoring and alerting. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what Blocking Monitoring is and where it fits",
    "Explain how Blocking Monitoring works internally",
    "Apply Blocking Monitoring correctly in a production environment",
    "Recognise the common mistakes and risks involving Blocking Monitoring",
    "Monitor and troubleshoot Blocking Monitoring with the right tools"
  ],

  sections: [
    {
      h: "What Blocking Monitoring means",
      html: `
<p>In this topic we examine <strong>Blocking Monitoring</strong> within database monitoring and alerting. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Extended Events is the modern lightweight diagnostics framework. Sessions capture events such as deadlocks, long queries or errors with far less overhead than SQL Trace/Profiler and are safe in production when scoped carefully.</p>
<p>Alerts and notifications close the loop: a metric is only useful if someone is told when it crosses a threshold. Database Mail, Agent alerts and external monitoring systems deliver that signal.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Blocking Monitoring is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Blocking Monitoring fits",
      html: `
<p>Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads.</p>
<p>The diagram below places Blocking Monitoring alongside the core concepts of database monitoring and alerting. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Blocking Monitoring flow">
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
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Blocking Monitoring</text>
  </svg>
  <div class="figcaption">Figure 1 — Database monitoring and alerting: how Blocking Monitoring relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Blocking Monitoring in practice",
      html: `
<p>Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem? Reactive monitoring reports failures; proactive monitoring catches trends — growing log usage, falling page life expectancy, lengthening backups — before users notice.</p>
<p>The following comparison captures the distinctions that matter most when working with Blocking Monitoring:</p>
<table>
  <tr><th>Metric</th><th>DMV / source</th><th>Why it matters</th></tr>
  <tr><td>Waits</td><td>dm_os_wait_stats</td><td>Finds the bottleneck</td></tr>
  <tr><td>Blocking</td><td>dm_exec_requests</td><td>Finds head blockers</td></tr>
  <tr><td>Space</td><td>dm_os_volume_stats</td><td>Prevents disk full</td></tr>
</table>
<p>A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs. Consistency matters more than complexity.</p>
      `,
    },
    {
      h: "Working with Blocking Monitoring",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Blocking Monitoring. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Blocking Monitoring
-- Top wait types (since instance start)
SELECT TOP 10 wait_type,
       wait_time_ms / 1000 AS wait_seconds,
       waiting_tasks_count
FROM   sys.dm_os_wait_stats
WHERE  wait_type NOT LIKE 'SLEEP%'
  AND  wait_type NOT IN ('CLR_SEMAPHORE','LAZYWRITER_SLEEP')
ORDER BY wait_time_ms DESC;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Blocking Monitoring
-- Current requests and blocking
SELECT session_id, status, command, blocking_session_id,
       wait_type, wait_time, total_elapsed_time
FROM   sys.dm_exec_requests
WHERE  session_id > 50
ORDER BY blocking_session_id DESC, total_elapsed_time DESC;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Blocking Monitoring
-- Volume free space via dm_os_volume_stats
SELECT DISTINCT vs.volume_mount_point,
       vs.total_bytes / 1073741824 AS total_gb,
       vs.available_bytes / 1073741824 AS free_gb
FROM   sys.master_files f
CROSS APPLY sys.dm_os_volume_stats(f.database_id, f.file_id) vs;</code></pre>
<p>Dynamic management views and functions expose the engine's internal state. sys.dm_os_waiting_tasks, sys.dm_exec_requests, sys.dm_os_performance_counters and sys.dm_db_* views are the DBA's primary diagnostic surface.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Wait statistics are the most efficient way to find the dominant bottleneck. SQL Server records what each session waited on; aggregating waits points to I/O, CPU, locking or logging as the constraint instead of guessing.</p>
<table>
  <tr><th>Concern</th><th>Healthy sign</th><th>Warning sign</th></tr>
  <tr><td>Page life expectancy</td><td>High and stable</td><td>Falling rapidly</td></tr>
  <tr><td>Log usage %</td><td>Low</td><td>Approaching 90%</td></tr>
  <tr><td>Failed jobs</td><td>None</td><td>Any overnight failure</td></tr>
</table>
<p>The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues. Reviewing them daily turns cryptic errors into early warnings.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Blocking Monitoring, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Blocking Monitoring",
      html: `
<p>This section consolidates <strong>Blocking Monitoring</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem? Reactive monitoring reports failures; proactive monitoring catches trends — growing log usage, falling page life expectancy, lengthening backups — before users notice.</p>
<p>A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs. Consistency matters more than complexity.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Blocking Monitoring sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Concern</th><th>Healthy sign</th><th>Warning sign</th></tr>
  <tr><td>Page life expectancy</td><td>High and stable</td><td>Falling rapidly</td></tr>
  <tr><td>Log usage %</td><td>Low</td><td>Approaching 90%</td></tr>
  <tr><td>Failed jobs</td><td>None</td><td>Any overnight failure</td></tr>
</table>
<p>Dynamic management views and functions expose the engine's internal state. sys.dm_os_waiting_tasks, sys.dm_exec_requests, sys.dm_os_performance_counters and sys.dm_db_* views are the DBA's primary diagnostic surface.</p>
<p>Use the following as a starting point when investigating Blocking Monitoring. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Blocking Monitoring
-- Top wait types (since instance start)
SELECT TOP 10 wait_type,
       wait_time_ms / 1000 AS wait_seconds,
       waiting_tasks_count
FROM   sys.dm_os_wait_stats
WHERE  wait_type NOT LIKE 'SLEEP%'
  AND  wait_type NOT IN ('CLR_SEMAPHORE','LAZYWRITER_SLEEP')
ORDER BY wait_time_ms DESC;</code></pre>
<p>Wait statistics are the most efficient way to find the dominant bottleneck. SQL Server records what each session waited on; aggregating waits points to I/O, CPU, locking or logging as the constraint instead of guessing.</p>
      `,
    }
  ],

  scenario: {
    title: "The slowdown with no errors",
    html: `
Users reported intermittent slowness but nothing appeared in the error log. Wait statistics showed PAGEIOLATCH_SH dominating, pointing to physical reads; a query scan on a large table was evicting cache. An index and a predicate fixed it. Waits diagnose what logs cannot.
<p><strong>The Blocking Monitoring lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
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
        "Wait statistics are the most efficient way to find the dominant bottleneck.",
        "Blocking Monitoring",
        "Dynamic management views and functions expose the engine's internal state."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Blocking Monitoring within database monitoring and alerting. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Blocking Monitoring fits”?",
      "options": [
        "Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads.",
        "The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues.",
        "With Blocking Monitoring, prefer measured, reversible changes."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Blocking Monitoring in practice”?",
      "options": [
        "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs.",
        "Blocking Monitoring sits inside a larger system.",
        "Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem?"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem? Reactive monitoring reports failures; proactive monitoring catches trends — growing log usage, falling page life expectancy, lengthening backups — before users notice.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Blocking Monitoring”?",
      "options": [
        "Blocking Monitoring sits inside a larger system.",
        "Theory becomes useful when you can apply it.",
        "Any overnight failure"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Blocking Monitoring. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Wait statistics are the most efficient way to find the dominant bottleneck.",
        "Use the following as a starting point when investigating Blocking Monitoring.",
        "Falling rapidly"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Wait statistics are the most efficient way to find the dominant bottleneck. SQL Server records what each session waited on; aggregating waits points to I/O, CPU, locking or logging as the constraint instead of guessing.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Approaching 90%",
        "Any overnight failure",
        "Blocking Monitoring"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Blocking Monitoring with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Blocking Monitoring means”?",
      "options": [
        "Use the following as a starting point when investigating Blocking Monitoring.",
        "Extended Events is the modern lightweight diagnostics framework.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Extended Events is the modern lightweight diagnostics framework. Sessions capture events such as deadlocks, long queries or errors with far less overhead than SQL Trace/Profiler and are safe in production when scoped carefully.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Blocking Monitoring fits”?",
      "options": [
        "The diagram below places Blocking Monitoring alongside the core concepts of database monitoring and alerting.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Blocking Monitoring."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Blocking Monitoring alongside the core concepts of database monitoring and alerting. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Blocking Monitoring in practice”?",
      "options": [
        "Finds head blockers",
        "Prevents disk full",
        "The following comparison captures the distinctions that matter most when working with Blocking Monitoring:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Blocking Monitoring:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Blocking Monitoring”?",
      "options": [
        "Blocking Monitoring",
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database monitoring and alerting.”",
      "options": [
        "Wait statistics are the most efficient way to find the dominant bottleneck.",
        "Blocking Monitoring",
        "Dynamic management views and functions expose the engine's internal state."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Blocking Monitoring within database monitoring and alerting. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Blocking Monitoring fits”?",
      "options": [
        "Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads.",
        "The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues.",
        "With Blocking Monitoring, prefer measured, reversible changes."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Blocking Monitoring in practice”?",
      "options": [
        "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs.",
        "Blocking Monitoring sits inside a larger system.",
        "Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem?"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem? Reactive monitoring reports failures; proactive monitoring catches trends — growing log usage, falling page life expectancy, lengthening backups — before users notice.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Blocking Monitoring”?",
      "options": [
        "Blocking Monitoring sits inside a larger system.",
        "Theory becomes useful when you can apply it.",
        "Any overnight failure"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Blocking Monitoring. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Wait statistics are the most efficient way to find the dominant bottleneck.",
        "Use the following as a starting point when investigating Blocking Monitoring.",
        "Falling rapidly"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Wait statistics are the most efficient way to find the dominant bottleneck. SQL Server records what each session waited on; aggregating waits points to I/O, CPU, locking or logging as the constraint instead of guessing.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Approaching 90%",
        "Any overnight failure",
        "Blocking Monitoring"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Blocking Monitoring with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Blocking Monitoring means”?",
      "options": [
        "Use the following as a starting point when investigating Blocking Monitoring.",
        "Extended Events is the modern lightweight diagnostics framework.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Extended Events is the modern lightweight diagnostics framework. Sessions capture events such as deadlocks, long queries or errors with far less overhead than SQL Trace/Profiler and are safe in production when scoped carefully.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Blocking Monitoring fits”?",
      "options": [
        "The diagram below places Blocking Monitoring alongside the core concepts of database monitoring and alerting.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Blocking Monitoring."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Blocking Monitoring alongside the core concepts of database monitoring and alerting. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Blocking Monitoring in practice”?",
      "options": [
        "Finds head blockers",
        "Prevents disk full",
        "The following comparison captures the distinctions that matter most when working with Blocking Monitoring:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Blocking Monitoring:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Blocking Monitoring”?",
      "options": [
        "Blocking Monitoring",
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within database monitoring and alerting.”",
      "options": [
        "Wait statistics are the most efficient way to find the dominant bottleneck.",
        "Blocking Monitoring",
        "Dynamic management views and functions expose the engine's internal state."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Blocking Monitoring within database monitoring and alerting. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Blocking Monitoring fits”?",
      "options": [
        "Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads.",
        "The SQL Server error log and Windows Event Log record failures, restarts, corruption messages and login issues.",
        "With Blocking Monitoring, prefer measured, reversible changes."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Good monitoring is intentional: choose metrics tied to failure modes, set thresholds from a baseline, avoid alert storms, and keep a daily report that a human actually reads.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Blocking Monitoring in practice”?",
      "options": [
        "A daily health check covers the fundamentals: uptime, database states, last backups, job failures, free space on every volume, log usage, tempdb, blocking and the error logs.",
        "Blocking Monitoring sits inside a larger system.",
        "Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem?"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem? Reactive monitoring reports failures; proactive monitoring catches trends — growing log usage, falling page life expectancy, lengthening backups — before users notice.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Blocking Monitoring”?",
      "options": [
        "Blocking Monitoring sits inside a larger system.",
        "Theory becomes useful when you can apply it.",
        "Any overnight failure"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Blocking Monitoring. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Wait statistics are the most efficient way to find the dominant bottleneck.",
        "Use the following as a starting point when investigating Blocking Monitoring.",
        "Falling rapidly"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Wait statistics are the most efficient way to find the dominant bottleneck. SQL Server records what each session waited on; aggregating waits points to I/O, CPU, locking or logging as the constraint instead of guessing.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Approaching 90%",
        "Any overnight failure",
        "Blocking Monitoring"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Blocking Monitoring with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Blocking Monitoring means”?",
      "options": [
        "Use the following as a starting point when investigating Blocking Monitoring.",
        "Extended Events is the modern lightweight diagnostics framework.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Extended Events is the modern lightweight diagnostics framework. Sessions capture events such as deadlocks, long queries or errors with far less overhead than SQL Trace/Profiler and are safe in production when scoped carefully.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Blocking Monitoring fits”?",
      "options": [
        "The diagram below places Blocking Monitoring alongside the core concepts of database monitoring and alerting.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Blocking Monitoring."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Blocking Monitoring alongside the core concepts of database monitoring and alerting. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Blocking Monitoring in practice”?",
      "options": [
        "Finds head blockers",
        "Prevents disk full",
        "The following comparison captures the distinctions that matter most when working with Blocking Monitoring:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Blocking Monitoring:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Blocking Monitoring”?",
      "options": [
        "Blocking Monitoring",
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Blocking Monitoring is a fundamental concept in database monitoring and alerting",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Blocking Monitoring improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
