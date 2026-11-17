/* Practical content file — one JS file per practical lab.
   Rendered by assets/js/site.js on practicals/practical-06.html */

window.TOPIC = {
  id: "practical-06",
  title: "Monitoring",

  lead: "A hands-on monitoring lab: query DMVs for CPU, memory, waits, blocking, growth, TempDB and backup health, then assemble the queries into a reusable daily health-check report.",

  objectives: [
    "Collect core health metrics from DMVs",
    "Interpret wait statistics to find a bottleneck",
    "Detect blocking and long-running sessions",
    "Check volume and log space before it becomes an incident",
    "Assemble a single daily health-check query set"
  ],

  sections: [
    {
      h: "Before you start",
      html: `
<p>This lab builds the daily health check you will use for the rest of your DBA career: a small set of queries that answer 'is the estate healthy?' in a few minutes.</p>
<p>Run these on a local instance first. Many DMVs return values since instance start, so a freshly restarted server will show small numbers — note the uptime when interpreting results.</p>
<p><strong>Environment check</strong> — confirm where you are before changing anything; this habit prevents production mistakes:</p>
<pre><code class="language-sql">-- Lab step
-- Instance state and uptime
SELECT @@SERVERNAME AS server,
       sqlserver_start_time,
       DATEDIFF(HOUR, sqlserver_start_time, SYSDATETIME()) AS uptime_hours
FROM   sys.dm_os_sys_info;
GO
-- Top wait types since instance start
SELECT TOP 10 wait_type,
       wait_time_ms / 1000 AS wait_seconds,
       waiting_tasks_count
FROM   sys.dm_os_wait_stats
WHERE  wait_type NOT LIKE 'SLEEP%'
  AND  wait_type NOT IN ('LAZYWRITER_SLEEP','CLR_SEMAPHORE')
ORDER BY wait_time_ms DESC;
GO</code></pre>
      `,
    },
    {
      h: "Lab architecture",
      html: `
<p>Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem? The queries below cover both current state (sessions, blocking) and cumulative signals (waits, space).</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Daily health-check flow">
    <defs>
      <marker id="pa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="200" y="10" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="31" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Instance state and uptime</text>
    <line x1="380" y1="54" x2="380" y2="64" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="64" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="85" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Wait statistics</text>
    <line x1="380" y1="108" x2="380" y2="118" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="118" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="139" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Sessions and blocking</text>
    <line x1="380" y1="162" x2="380" y2="172" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="172" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="193" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Volume and log space</text>
    <line x1="380" y1="216" x2="380" y2="226" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="226" width="360" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)"/>
    <text x="380" y="247" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Error log and job history</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Daily health-check flow</text>
  </svg>
  <div class="figcaption">Figure 1 — Instance state, waits, sessions, space and logs form a repeatable daily routine.</div>
</div>
<p>Work through the flow: gather instance state, examine waits, check sessions and blocking, verify space, then review logs and jobs. Consistency of routine matters more than complexity.</p>
      `,
    },
    {
      h: "Core tasks",
      html: `
<p>Start with wait statistics. Aggregate sys.dm_os_wait_stats, filter benign waits, and look at the top wait types — they point to I/O, CPU, locking or logging as the dominant constraint.</p>
<table>
  <tr><th>Metric</th><th>DMV / source</th><th>Why it matters</th></tr>
  <tr><td>Waits</td><td>dm_os_wait_stats</td><td>Finds the bottleneck</td></tr>
  <tr><td>Blocking</td><td>dm_exec_requests</td><td>Finds head blockers</td></tr>
  <tr><td>Space</td><td>dm_os_volume_stats</td><td>Prevents disk full</td></tr>
</table>
<p>Next inspect sys.dm_exec_requests for long-running or blocked sessions. The head blocker is the session blocking others but not itself blocked; that is where you investigate, not at the queue of victims.</p>
<pre><code class="language-sql">-- Lab step
-- Current requests, blocking and long runners
SELECT session_id, status, command, blocking_session_id,
       wait_type, wait_time, total_elapsed_time
FROM   sys.dm_exec_requests
WHERE  session_id > 50
ORDER BY blocking_session_id DESC, total_elapsed_time DESC;
GO
-- Log space usage for the current database
SELECT used_log_space_in_percent
FROM   sys.dm_db_log_space_usage;
GO</code></pre>
      `,
    },
    {
      h: "Verify your work",
      html: `
<p>Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:</p>
<pre><code class="language-sql">-- Lab step
-- Free space on each volume holding a database file
SELECT DISTINCT vs.volume_mount_point,
       vs.total_bytes / 1073741824 AS total_gb,
       vs.available_bytes / 1073741824 AS free_gb
FROM   sys.master_files f
CROSS APPLY sys.dm_os_volume_stats(f.database_id, f.file_id) vs
ORDER BY vs.volume_mount_point;
GO
-- TempDB file sizes
SELECT name, size / 128 AS size_mb
FROM   tempdb.sys.database_files
ORDER BY name;
GO</code></pre>
<p>Check free space with dm_os_volume_stats and log usage with dm_db_log_space_usage. Catching a log at 85% is far better than explaining a full-disk outage.</p>
<p>If the output differs, stop and correct it before moving on. A lab that 'looks right' but was never verified teaches the wrong lessons.</p>
      `,
    },
    {
      h: "Pitfalls and safe practice",
      html: `
<p>Finally, review the error log and job failures. Combine the queries into a single script you can run each morning, and record a baseline so trends become visible over time.</p>
<table>
  <tr><th>Concern</th><th>Healthy sign</th><th>Warning sign</th></tr>
  <tr><td>Page life expectancy</td><td>High and stable</td><td>Falling rapidly</td></tr>
  <tr><td>Log usage</td><td>Low percentage</td><td>Above 85 percent</td></tr>
  <tr><td>Failed jobs</td><td>None</td><td>Any overnight failure</td></tr>
</table>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.</p>
</div>
      `,
    }
  ],

  steps: [
    "Run the instance-state query and record sqlserver_start_time as your baseline uptime.",
    "Execute the wait-statistics query and identify the top three non-benign wait types.",
    "Run a deliberately long query in a second session and find it in dm_exec_requests by total_elapsed_time.",
    "Create a blocking scenario with an open transaction in one session and a conflicting update in another; identify the head blocker.",
    "Check log usage with dm_db_log_space_usage and record the percentage.",
    "Run the volume-space query and list free space on every mount point holding a database file.",
    "Inspect TempDB file count and sizes and compare with the expected configuration.",
    "Read the last 50 entries of the SQL Server error log with sp_readerrorlog.",
    "Query failed jobs from msdb.dbo.sysjobhistory for the last 24 hours.",
    "Save all queries into one script named daily_healthcheck.sql and run it twice to compare results."
  ],

  scenario: {
    title: "The alert storm that hid a real failure",
    html: `
A monitoring system alerted on every minor error, generating hundreds of messages each day. When the transaction log genuinely filled, its alert was lost in the noise and the outage lasted an hour. The DBA re-tiered alerts by severity, suppressed known-benign conditions and routed only actionable events to on-call. Monitoring must produce signal, not volume — and the daily health check is where that signal is interpreted by a human.
<p><strong>The lesson:</strong> practise both the diagnosis and the safe mitigation in this lab. Under pressure, the steps you have rehearsed are the steps you will actually take — build good muscle memory now.</p>
    `,
  },

  interview: [
    {
      q: "What belongs in a daily health check?",
      a: `
Uptime, database states, last successful backups, failed jobs, volume and log free space, TempDB health, blocking, and a review of SQL and Windows error logs.
      `,
    },
    {
      q: "How do wait statistics help diagnose performance?",
      a: `
They aggregate what sessions spent time waiting on — I/O, locks, latches, logging, CPU — so you can identify the dominant bottleneck instead of guessing from symptoms.
      `,
    },
    {
      q: "How do you find the head blocker?",
      a: `
Find sessions with a blocking_session_id, then identify the session that blocks others but is not itself blocked; inspect its statement, wait type and plan to fix the root cause.
      `,
    }
  ],

  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "' in a few minutes.",
        "Prevents disk full",
        "Never assume a lab step worked — verify against the catalog views and DMVs."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “This lab builds the daily health check you will use for the rest of your DBA career: a small set of queries that answer 'is the estate healthy?' in a few minutes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Prevents disk full",
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem?"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem? The queries below cover both current state (sessions, blocking) and cumulative signals (waits, space).”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "Start with wait statistics.",
        "Finally, review the error log and job failures."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Start with wait statistics. Aggregate sys.dm_os_wait_stats, filter benign waits, and look at the top wait types — they point to I/O, CPU, locking or logging as the dominant constraint.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "Prevents disk full",
        "Finally, review the error log and job failures."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "Check free space with dm_os_volume_stats and log usage with dm_db_log_space_usage.",
        "Finally, review the error log and job failures."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Finally, review the error log and job failures. Combine the queries into a single script you can run each morning, and record a baseline so trends become visible over time.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "Falling rapidly",
        "Run these on a local instance first.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Run these on a local instance first. Many DMVs return values since instance start, so a freshly restarted server will show small numbers — note the uptime when interpreting results.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Work through the flow: gather instance state, examine waits, check sessions and blocking, verify space, then review logs and jobs.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "Falling rapidly"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Work through the flow: gather instance state, examine waits, check sessions and blocking, verify space, then review logs and jobs. Consistency of routine matters more than complexity.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Start with wait statistics.",
        "Finds the bottleneck",
        "dm_exec_requests for long-running or blocked sessions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Next inspect sys.dm_exec_requests for long-running or blocked sessions. The head blocker is the session blocking others but not itself blocked; that is where you investigate, not at the queue of victims.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "Check free space with dm_os_volume_stats and log usage with dm_db_log_space_usage.",
        "Any overnight failure"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Check free space with dm_os_volume_stats and log usage with dm_db_log_space_usage. Catching a log at 85% is far better than explaining a full-disk outage.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "Above 85 percent",
        "Any overnight failure"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "' in a few minutes.",
        "Prevents disk full",
        "Never assume a lab step worked — verify against the catalog views and DMVs."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “This lab builds the daily health check you will use for the rest of your DBA career: a small set of queries that answer 'is the estate healthy?' in a few minutes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Prevents disk full",
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem?"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem? The queries below cover both current state (sessions, blocking) and cumulative signals (waits, space).”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "Start with wait statistics.",
        "Finally, review the error log and job failures."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Start with wait statistics. Aggregate sys.dm_os_wait_stats, filter benign waits, and look at the top wait types — they point to I/O, CPU, locking or logging as the dominant constraint.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "Prevents disk full",
        "Finally, review the error log and job failures."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "Check free space with dm_os_volume_stats and log usage with dm_db_log_space_usage.",
        "Finally, review the error log and job failures."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Finally, review the error log and job failures. Combine the queries into a single script you can run each morning, and record a baseline so trends become visible over time.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "Falling rapidly",
        "Run these on a local instance first.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Run these on a local instance first. Many DMVs return values since instance start, so a freshly restarted server will show small numbers — note the uptime when interpreting results.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Work through the flow: gather instance state, examine waits, check sessions and blocking, verify space, then review logs and jobs.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "Falling rapidly"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Work through the flow: gather instance state, examine waits, check sessions and blocking, verify space, then review logs and jobs. Consistency of routine matters more than complexity.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Start with wait statistics.",
        "Finds the bottleneck",
        "dm_exec_requests for long-running or blocked sessions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Next inspect sys.dm_exec_requests for long-running or blocked sessions. The head blocker is the session blocking others but not itself blocked; that is where you investigate, not at the queue of victims.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "Check free space with dm_os_volume_stats and log usage with dm_db_log_space_usage.",
        "Any overnight failure"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Check free space with dm_os_volume_stats and log usage with dm_db_log_space_usage. Catching a log at 85% is far better than explaining a full-disk outage.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "Above 85 percent",
        "Any overnight failure"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "' in a few minutes.",
        "Prevents disk full",
        "Never assume a lab step worked — verify against the catalog views and DMVs."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “This lab builds the daily health check you will use for the rest of your DBA career: a small set of queries that answer 'is the estate healthy?' in a few minutes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Prevents disk full",
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem?"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Monitoring answers two questions: is the system healthy now, and is it drifting toward a problem? The queries below cover both current state (sessions, blocking) and cumulative signals (waits, space).”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "Start with wait statistics.",
        "Finally, review the error log and job failures."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Start with wait statistics. Aggregate sys.dm_os_wait_stats, filter benign waits, and look at the top wait types — they point to I/O, CPU, locking or logging as the dominant constraint.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "Prevents disk full",
        "Finally, review the error log and job failures."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "Check free space with dm_os_volume_stats and log usage with dm_db_log_space_usage.",
        "Finally, review the error log and job failures."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Finally, review the error log and job failures. Combine the queries into a single script you can run each morning, and record a baseline so trends become visible over time.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "Falling rapidly",
        "Run these on a local instance first.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Run these on a local instance first. Many DMVs return values since instance start, so a freshly restarted server will show small numbers — note the uptime when interpreting results.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Work through the flow: gather instance state, examine waits, check sessions and blocking, verify space, then review logs and jobs.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "Falling rapidly"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Work through the flow: gather instance state, examine waits, check sessions and blocking, verify space, then review logs and jobs. Consistency of routine matters more than complexity.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Start with wait statistics.",
        "Finds the bottleneck",
        "dm_exec_requests for long-running or blocked sessions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Next inspect sys.dm_exec_requests for long-running or blocked sessions. The head blocker is the session blocking others but not itself blocked; that is where you investigate, not at the queue of victims.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "Check free space with dm_os_volume_stats and log usage with dm_db_log_space_usage.",
        "Any overnight failure"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Check free space with dm_os_volume_stats and log usage with dm_db_log_space_usage. Catching a log at 85% is far better than explaining a full-disk outage.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "Above 85 percent",
        "Any overnight failure"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.”"
    }
  ],
  takeaways: [
    "A short, consistent daily health check catches problems early",
    "Wait statistics reveal the dominant bottleneck without guesswork",
    "Investigate the head blocker, not the queue of blocked victims",
    "Volume and log space checks prevent self-inflicted full-disk outages",
    "Save your queries as a script and compare results over time to see trends"
  ]
};
