/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch01-03.html */

window.TOPIC = {
  id: "ch01-03",
  title: "Daily Responsibilities of a DBA",

  lead: "A DBA's day is a rhythm of recurring checks, governed changes, incoming requests, and whatever breaks in between — and the recurring checks are what stop most incidents from ever happening.",

  objectives: [
    "Describe the recurring core of DBA daily work",
    "Explain why each recurring check exists and what failure it prevents",
    "Triage requests and changes without dropping proactive work",
    "Build a repeatable daily checklist that survives busy days"
  ],

  sections: [
    {
      h: "What a DBA day actually contains",
      html: `
<p>Nothing in a DBA's day is accidental. The work falls into five streams, and every experienced DBA learns to run them in parallel:</p>
<ul>
  <li><strong>Observe</strong> — alerts, monitoring dashboards, failed jobs, backup results, disk and memory headroom</li>
  <li><strong>Respond</strong> — incidents and blocked users, from “this report is slow” to a full outage</li>
  <li><strong>Change</strong> — reviewing and applying schema, configuration, and deployment changes</li>
  <li><strong>Service</strong> — requests for logins, permissions, new databases, restores, space, and information</li>
  <li><strong>Improve</strong> — tuning, maintenance, documentation, and automation that remove tomorrow's work</li>
</ul>
<p>The trap is that the first four are <em>reactive</em> — they fill the day by themselves. Without a deliberate practice of the fifth, the DBA becomes a ticket queue with a keyboard, and every improvement waits for a quiet week that never arrives.</p>
<blockquote>A day with no proactive work is not a quiet day. It is a day the next incident was being prepared for you.</blockquote>
`
    },
    {
      h: "The recurring core",
      html: `
<p>Underneath the tickets sits a set of checks that should happen at the same time every day. They are cheap, they are boring, and each one maps to a specific class of production failure:</p>
<table>
  <tr><th>Check</th><th>Frequency</th><th>What it prevents</th></tr>
  <tr><td>Alert and monitoring review</td><td>Start of day</td><td>Silent failures nobody reported yet</td></tr>
  <tr><td>SQL Agent job outcomes</td><td>Start of day</td><td>Nightly ETL, log backup, or maintenance that failed quietly</td></tr>
  <tr><td>Backup verification</td><td>Start of day</td><td>Discovering an unbackupable database during a recovery</td></tr>
  <tr><td>Disk space and autogrowth</td><td>Start of day</td><td>Log or data file filling during business hours</td></tr>
  <tr><td>Blocking and long-running sessions</td><td>Midday</td><td>Users reporting slowness an hour after it started</td></tr>
  <tr><td>Change window preparation</td><td>Before releases</td><td>Unreviewed changes reaching production</td></tr>
  <tr><td>On-call handover notes</td><td>End of day</td><td>Context lost between shifts</td></tr>
</table>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="A DBA day: planned work interrupted by incidents">
    <defs>
      <marker id="day-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="290" y="30" width="190" height="56" rx="10" fill="var(--amber)" opacity="0.92"/>
    <text x="385" y="54" text-anchor="middle" fill="#1f2937" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Unplanned incident</text>
    <text x="385" y="74" text-anchor="middle" fill="#1f2937" font-size="11.5" font-family="Segoe UI, sans-serif">page · blocking · outage</text>

    <rect x="30" y="150" width="160" height="64" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="110" y="176" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Morning checks</text>
    <text x="110" y="197" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">alerts · jobs · backups</text>

    <rect x="215" y="150" width="160" height="64" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="295" y="176" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Triage requests</text>
    <text x="295" y="197" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">access · space · speed</text>

    <rect x="400" y="150" width="160" height="64" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="480" y="176" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Change window</text>
    <text x="480" y="197" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">review · deploy · verify</text>

    <rect x="585" y="150" width="160" height="64" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="665" y="176" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Proactive work</text>
    <text x="665" y="197" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">tuning · docs · automation</text>

    <line x1="190" y1="182" x2="213" y2="182" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#day-arrow)"/>
    <line x1="375" y1="182" x2="398" y2="182" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#day-arrow)"/>
    <line x1="560" y1="182" x2="583" y2="182" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#day-arrow)"/>

    <line x1="385" y1="86" x2="340" y2="148" stroke="var(--amber)" stroke-width="2" marker-end="url(#day-arrow)"/>

    <path d="M 665 216 C 640 290 130 290 112 220" fill="none" stroke="var(--muted)" stroke-width="1.6" stroke-dasharray="6 5" marker-end="url(#day-arrow)"/>
    <text x="388" y="283" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">the rhythm repeats — incidents interrupt it, they should not replace it</text>
  </svg>
  <div class="figcaption">Figure 1 — The planned daily rhythm, and the interruption that must not consume it.</div>
</div>
`
    },
    {
      h: "The morning health check",
      html: `
<p>The single highest-value habit in database operations is a fixed morning check, run before the first meeting. A compact version covers failed jobs and database state in one pass:</p>
<pre><code class="language-sql">-- Morning check 1: jobs that finished as failed in the last 24 hours
SELECT j.name                                   AS job_name,
       h.run_date, h.run_time, h.run_status,
       left(h.message, 120)                     AS message_head
FROM   msdb.dbo.sysjobhistory AS h
JOIN   msdb.dbo.sysjobs AS j ON j.job_id = h.job_id
WHERE  h.run_status = 0          -- 0 = failed
AND    h.step_id = 0             -- job outcome rows only
AND    h.run_date >= CONVERT(char(8), DATEADD(day, -1, GETDATE()), 112)
ORDER  BY h.run_date DESC, h.run_time DESC;</code></pre>
<pre><code class="language-sql">-- Morning check 2: anything not online, and log reuse waits
SELECT name, state_desc, recovery_model_desc, log_reuse_wait_desc
FROM   sys.databases
WHERE  state_desc &lt;&gt; 'ONLINE'
OR     log_reuse_wait_desc &lt;&gt; 'NOTHING'
ORDER  BY name;</code></pre>
<p>Both queries take under a second and answer the questions that matter: <em>did last night's work succeed, and is anything already in trouble?</em> Running them at the same time daily also builds the pattern-recognition that makes anomalies jump out — a job that “always fails on Tuesdays” is only visible if you look on Tuesdays.</p>
`
    },
    {
      h: "Requests, changes, and triage",
      html: `
<p>Incoming work arrives without context: “the report is slow”, “I need sysadmin”, “add 50 GB to the database”. A DBA triages every request against three questions:</p>
<ol>
  <li><strong>What is the risk?</strong> — does this touch production data, security, or availability?</li>
  <li><strong>What is the evidence?</strong> — is there a plan, a wait statistic, a growth trend, or just a feeling?</li>
  <li><strong>What is the reversible path?</strong> — can it be undone, and do we know how before we start?</li>
</ol>
<p>Permission requests deserve special care. “Grant sysadmin to my account” is almost never the real requirement — the real requirement is a specific action on a specific object. Answering with a narrower grant teaches the requester to ask precisely next time; answering with sysadmin teaches them to ask for everything forever.</p>
<p>Changes follow the same discipline: reviewed script, defined window, known rollback, verification step afterwards. The DBA who applies a change because “the developer is waiting” has quietly converted a request into an incident waiting to happen.</p>
`
    },
    {
      h: "Making the day repeatable",
      html: `
<p>Daily work that lives only in someone's head fails the day that person is on holiday. The fix is to externalise it:</p>
<ul>
  <li><strong>Written checklist</strong> — a one-page morning runbook with the exact queries and thresholds, so a competent colleague could run the day</li>
  <li><strong>Dashboards over log files</strong> — one screen that shows jobs, backups, disk, waits, and blocking; if checking it takes ten minutes, the dashboard is wrong</li>
  <li><strong>Automate the check, not just the fix</strong> — failed-job alerts and backup-age alerts turn observation into a notification</li>
  <li><strong>Protect the proactive block</strong> — schedule one fixed hour for tuning or documentation; if it is never on the calendar, reactive work will always win</li>
</ul>
<p>Common pitfalls: running the checks only when something feels wrong, trusting that “the jobs are probably fine”, never reading job output, and treating documentation as a project instead of a by-product of every change. The day is only as reliable as the checklist behind it.</p>
`
    }
  ],

  scenario: {
    title: "The log backup job that had been off for six days",
    html: `
<p>Tuesday, 8:55 AM. The morning check shows the orders database in FULL recovery with <code>log_reuse_wait_desc</code> = LOG_BACKUP, and the transaction log at 94% of a 200 GB file. The application starts throwing “The transaction log for database 'Orders' is full” errors at 9:12 AM as order writes fail. The log backup job history reveals the truth: it last succeeded six days ago, on the day a server migration copied the SQL Agent jobs but not the job's proxy account, so every run since had failed with “login failure” — and nobody was reading the output of a job nobody expected to fail.</p>
<p>Diagnosis took seven minutes: job history for the failure reason, then <code>sys.databases</code> to confirm the wait reason. Resolution: created the missing proxy, re-enabled the job, took an immediate log backup, and watched the log reuse drop back to normal — writes resumed at 9:26 AM. No data was lost because the log had never been truncated past the active portion.</p>
<p>Prevention: alert on any job failure rather than on any job outcome being read by a human, a log-space alert at 70%, and a migration checklist that includes Agent proxies, operators, and alerts — not just databases. <strong>The job did not fail loudly; the day's checklist did.</strong></p>
`
  },

  interview: [
    {
      q: "What do you check first every morning?",
      a: "Three things: whether every scheduled job succeeded overnight (especially backups and log backups), whether any database is not ONLINE or has a log reuse wait, and whether disk space has headroom. They take seconds and they cover the failures that turn small problems into outages by noon."
    },
    {
      q: "How do you balance incoming requests against proactive work?",
      a: "Triage requests by risk and evidence, batch the low-risk ones, and refuse to skip the scheduled proactive block — because proactive work is what reduces the request queue. If reactive work consumes every day, the queue grows; a fixed hour of indexing, automation, or documentation is what shrinks it."
    },
    {
      q: "A developer says a query is slow but cannot show you a plan. What do you do?",
      a: "Get the evidence myself: find the query in sys.dm_exec_query_stats or via Query Store, pull the actual plan and wait statistics, and confirm the symptom at the same time of day it occurs. Then work with the developer on the fix — but the investigation starts with data, not opinion."
    }
  ],

  quiz: [
    {
      "question": "Which fact is covered in the lesson section “What a DBA day actually contains”?",
      "options": [
        "Nothing in a DBA's day is accidental.",
        "Discovering an unbackupable database during a recovery",
        "Log or data file filling during business hours"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Nothing in a DBA's day is accidental. The work falls into five streams, and every experienced DBA learns to run them in parallel:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The recurring core”?",
      "options": [
        "Incoming work arrives without context: “the report is slow”, “I need sysadmin”, “add 50 GB to the database”.",
        "Permission requests deserve special care.",
        "Underneath the tickets sits a set of checks that should happen at the same time every day."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Underneath the tickets sits a set of checks that should happen at the same time every day. They are cheap, they are boring, and each one maps to a specific class of production failure:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The morning health check”?",
      "options": [
        "Log or data file filling during business hours",
        "The single highest-value habit in database operations is a fixed morning check, run before the first meeting.",
        "Discovering an unbackupable database during a recovery"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The single highest-value habit in database operations is a fixed morning check, run before the first meeting. A compact version covers failed jobs and database state in one pass:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Requests, changes, and triage”?",
      "options": [
        "Incoming work arrives without context: “the report is slow”, “I need sysadmin”, “add 50 GB to the database”.",
        "Log or data file filling during business hours",
        "Users reporting slowness an hour after it started"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Incoming work arrives without context: “the report is slow”, “I need sysadmin”, “add 50 GB to the database”. A DBA triages every request against three questions:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Making the day repeatable”?",
      "options": [
        "Users reporting slowness an hour after it started",
        "Unreviewed changes reaching production",
        "Daily work that lives only in someone's head fails the day that person is on holiday."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Daily work that lives only in someone's head fails the day that person is on holiday. The fix is to externalise it:”"
    },
    {
      "question": "Complete the lesson statement: “The trap is that the first four are _____ — they fill the day by themselves.”",
      "options": [
        "Written checklist",
        "reactive",
        "What is the reversible path?"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The trap is that the first four are reactive — they fill the day by themselves. Without a deliberate practice of the fifth, the DBA becomes a ticket queue with a keyboard, and every improvement waits for a quiet week that never arrives.”"
    },
    {
      "question": "In the “The recurring core” table, what is listed for “Alert and monitoring review” under “What it prevents”?",
      "options": [
        "Silent failures nobody reported yet",
        "The single highest-value habit in database operations is a fixed morning check, run before the first meeting.",
        "did last night's work succeed, and is anything already in trouble?"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Alert and monitoring review” as “Silent failures nobody reported yet”."
    },
    {
      "question": "Complete the lesson statement: “Both queries take under a second and answer the questions that matter: _____”",
      "options": [
        "Dashboards over log files",
        "Automate the check, not just the fix",
        "did last night's work succeed, and is anything already in trouble?"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Both queries take under a second and answer the questions that matter: did last night's work succeed, and is anything already in trouble? Running them at the same time daily also builds the pattern-recognition that makes anomalies jump out — a job that “always fails on Tuesdays” is only visible if you look on Tuesdays.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Requests, changes, and triage”?",
      "options": [
        "Daily work that lives only in someone's head fails the day that person is on holiday.",
        "Permission requests deserve special care.",
        "did last night's work succeed, and is anything already in trouble?"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Permission requests deserve special care. “Grant sysadmin to my account” is almost never the real requirement — the real requirement is a specific action on a specific object. Answering with a narrower grant teaches the requester to ask precisely next time; answering with sysadmin teaches them to ask for everything forever.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Making the day repeatable”?",
      "options": [
        "Common pitfalls: running the checks only when something feels wrong, trusting that “the jobs are probably fine”, never reading job output, and treating documentation as a project…",
        "Incoming work arrives without context: “the report is slow”, “I need sysadmin”, “add 50 GB to the database”.",
        "Permission requests deserve special care."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Common pitfalls: running the checks only when something feels wrong, trusting that “the jobs are probably fine”, never reading job output, and treating documentation as a project instead of a by-product of every change. The day is only as reliable as the checklist behind it.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “What a DBA day actually contains”?",
      "options": [
        "Nothing in a DBA's day is accidental.",
        "Discovering an unbackupable database during a recovery",
        "Log or data file filling during business hours"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Nothing in a DBA's day is accidental. The work falls into five streams, and every experienced DBA learns to run them in parallel:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The recurring core”?",
      "options": [
        "Incoming work arrives without context: “the report is slow”, “I need sysadmin”, “add 50 GB to the database”.",
        "Permission requests deserve special care.",
        "Underneath the tickets sits a set of checks that should happen at the same time every day."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Underneath the tickets sits a set of checks that should happen at the same time every day. They are cheap, they are boring, and each one maps to a specific class of production failure:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The morning health check”?",
      "options": [
        "Log or data file filling during business hours",
        "The single highest-value habit in database operations is a fixed morning check, run before the first meeting.",
        "Discovering an unbackupable database during a recovery"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The single highest-value habit in database operations is a fixed morning check, run before the first meeting. A compact version covers failed jobs and database state in one pass:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Requests, changes, and triage”?",
      "options": [
        "Incoming work arrives without context: “the report is slow”, “I need sysadmin”, “add 50 GB to the database”.",
        "Log or data file filling during business hours",
        "Users reporting slowness an hour after it started"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Incoming work arrives without context: “the report is slow”, “I need sysadmin”, “add 50 GB to the database”. A DBA triages every request against three questions:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Making the day repeatable”?",
      "options": [
        "Users reporting slowness an hour after it started",
        "Unreviewed changes reaching production",
        "Daily work that lives only in someone's head fails the day that person is on holiday."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Daily work that lives only in someone's head fails the day that person is on holiday. The fix is to externalise it:”"
    },
    {
      "question": "Complete the lesson statement: “The trap is that the first four are _____ — they fill the day by themselves.”",
      "options": [
        "Written checklist",
        "reactive",
        "What is the reversible path?"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The trap is that the first four are reactive — they fill the day by themselves. Without a deliberate practice of the fifth, the DBA becomes a ticket queue with a keyboard, and every improvement waits for a quiet week that never arrives.”"
    },
    {
      "question": "In the “The recurring core” table, what is listed for “Alert and monitoring review” under “What it prevents”?",
      "options": [
        "Silent failures nobody reported yet",
        "The single highest-value habit in database operations is a fixed morning check, run before the first meeting.",
        "did last night's work succeed, and is anything already in trouble?"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Alert and monitoring review” as “Silent failures nobody reported yet”."
    },
    {
      "question": "Complete the lesson statement: “Both queries take under a second and answer the questions that matter: _____”",
      "options": [
        "Dashboards over log files",
        "Automate the check, not just the fix",
        "did last night's work succeed, and is anything already in trouble?"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Both queries take under a second and answer the questions that matter: did last night's work succeed, and is anything already in trouble? Running them at the same time daily also builds the pattern-recognition that makes anomalies jump out — a job that “always fails on Tuesdays” is only visible if you look on Tuesdays.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Requests, changes, and triage”?",
      "options": [
        "Daily work that lives only in someone's head fails the day that person is on holiday.",
        "Permission requests deserve special care.",
        "did last night's work succeed, and is anything already in trouble?"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Permission requests deserve special care. “Grant sysadmin to my account” is almost never the real requirement — the real requirement is a specific action on a specific object. Answering with a narrower grant teaches the requester to ask precisely next time; answering with sysadmin teaches them to ask for everything forever.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Making the day repeatable”?",
      "options": [
        "Common pitfalls: running the checks only when something feels wrong, trusting that “the jobs are probably fine”, never reading job output, and treating documentation as a project…",
        "Incoming work arrives without context: “the report is slow”, “I need sysadmin”, “add 50 GB to the database”.",
        "Permission requests deserve special care."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Common pitfalls: running the checks only when something feels wrong, trusting that “the jobs are probably fine”, never reading job output, and treating documentation as a project instead of a by-product of every change. The day is only as reliable as the checklist behind it.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “What a DBA day actually contains”?",
      "options": [
        "Nothing in a DBA's day is accidental.",
        "Discovering an unbackupable database during a recovery",
        "Log or data file filling during business hours"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Nothing in a DBA's day is accidental. The work falls into five streams, and every experienced DBA learns to run them in parallel:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The recurring core”?",
      "options": [
        "Incoming work arrives without context: “the report is slow”, “I need sysadmin”, “add 50 GB to the database”.",
        "Permission requests deserve special care.",
        "Underneath the tickets sits a set of checks that should happen at the same time every day."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Underneath the tickets sits a set of checks that should happen at the same time every day. They are cheap, they are boring, and each one maps to a specific class of production failure:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The morning health check”?",
      "options": [
        "Log or data file filling during business hours",
        "The single highest-value habit in database operations is a fixed morning check, run before the first meeting.",
        "Discovering an unbackupable database during a recovery"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The single highest-value habit in database operations is a fixed morning check, run before the first meeting. A compact version covers failed jobs and database state in one pass:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Requests, changes, and triage”?",
      "options": [
        "Incoming work arrives without context: “the report is slow”, “I need sysadmin”, “add 50 GB to the database”.",
        "Log or data file filling during business hours",
        "Users reporting slowness an hour after it started"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Incoming work arrives without context: “the report is slow”, “I need sysadmin”, “add 50 GB to the database”. A DBA triages every request against three questions:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Making the day repeatable”?",
      "options": [
        "Users reporting slowness an hour after it started",
        "Unreviewed changes reaching production",
        "Daily work that lives only in someone's head fails the day that person is on holiday."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Daily work that lives only in someone's head fails the day that person is on holiday. The fix is to externalise it:”"
    },
    {
      "question": "Complete the lesson statement: “The trap is that the first four are _____ — they fill the day by themselves.”",
      "options": [
        "Written checklist",
        "reactive",
        "What is the reversible path?"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The trap is that the first four are reactive — they fill the day by themselves. Without a deliberate practice of the fifth, the DBA becomes a ticket queue with a keyboard, and every improvement waits for a quiet week that never arrives.”"
    },
    {
      "question": "In the “The recurring core” table, what is listed for “Alert and monitoring review” under “What it prevents”?",
      "options": [
        "Silent failures nobody reported yet",
        "The single highest-value habit in database operations is a fixed morning check, run before the first meeting.",
        "did last night's work succeed, and is anything already in trouble?"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Alert and monitoring review” as “Silent failures nobody reported yet”."
    },
    {
      "question": "Complete the lesson statement: “Both queries take under a second and answer the questions that matter: _____”",
      "options": [
        "Dashboards over log files",
        "Automate the check, not just the fix",
        "did last night's work succeed, and is anything already in trouble?"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Both queries take under a second and answer the questions that matter: did last night's work succeed, and is anything already in trouble? Running them at the same time daily also builds the pattern-recognition that makes anomalies jump out — a job that “always fails on Tuesdays” is only visible if you look on Tuesdays.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Requests, changes, and triage”?",
      "options": [
        "Daily work that lives only in someone's head fails the day that person is on holiday.",
        "Permission requests deserve special care.",
        "did last night's work succeed, and is anything already in trouble?"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Permission requests deserve special care. “Grant sysadmin to my account” is almost never the real requirement — the real requirement is a specific action on a specific object. Answering with a narrower grant teaches the requester to ask precisely next time; answering with sysadmin teaches them to ask for everything forever.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Making the day repeatable”?",
      "options": [
        "Common pitfalls: running the checks only when something feels wrong, trusting that “the jobs are probably fine”, never reading job output, and treating documentation as a project…",
        "Incoming work arrives without context: “the report is slow”, “I need sysadmin”, “add 50 GB to the database”.",
        "Permission requests deserve special care."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Common pitfalls: running the checks only when something feels wrong, trusting that “the jobs are probably fine”, never reading job output, and treating documentation as a project instead of a by-product of every change. The day is only as reliable as the checklist behind it.”"
    }
  ],
  takeaways: [
    "DBA work has five streams: observe, respond, change, service, improve — the fifth must be scheduled or it never happens",
    "The recurring core (jobs, backups, disk, blocking, changes, handover) maps directly to classes of preventable failures",
    "A fixed morning health check turns silent failures into visible ones in under a minute",
    "Triage every request by risk, evidence, and reversibility — and answer broad permission asks with narrow grants",
    "Externalise the day: written checklist, one-screen dashboard, alerts on job failure, protected proactive time"
  ]
};
