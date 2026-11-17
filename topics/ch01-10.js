/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch01-10.html */

window.TOPIC = {
  id: "ch01-10",
  title: "Production DBA Daily, Weekly, and Monthly Activities",

  lead: "A production DBA's reliability comes from cadence: a fixed set of daily checks, weekly deep-dives, and monthly proofs that together turn a reactive job into a controlled operation.",

  objectives: [
    "Organise production work into daily, weekly, and monthly cadences",
    "State the purpose and evidence expected from each activity",
    "Distinguish monitoring from verification in each cycle",
    "Build a personal cadence that survives holidays, incidents, and workload spikes"
  ],

  sections: [
    {
      h: "Why cadence matters",
      html: `
<p>Production databases degrade continuously and fail suddenly. Cadence is how a DBA converts continuous degradation into scheduled detection — each cycle catches a different class of problem before it becomes an incident:</p>
<ul>
  <li><strong>Daily</strong> — catch what broke overnight: jobs, backups, space, blocking. Minutes of work, immediate signal</li>
  <li><strong>Weekly</strong> — catch what drifts slowly: fragmentation, statistics, capacity trends, slow queries. An hour of analysis</li>
  <li><strong>Monthly</strong> — catch what only shows over time: recovery capability, patch levels, access hygiene, documentation gaps. A deliberate exercise</li>
</ul>
<p>The three cycles also differ in what counts as success. Daily success is <em>nothing to report</em>. Weekly success is <em>a change made based on evidence</em>. Monthly success is <em>a proof obtained</em> — the restore that worked, the failover that met its RTO, the access list that got shorter.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Daily, weekly and monthly cadence cycle">
    <defs>
      <marker id="cad-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="290" y="20" width="180" height="60" rx="10" fill="var(--accent)"/>
    <text x="380" y="46" text-anchor="middle" fill="#ffffff" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Daily</text>
    <text x="380" y="68" text-anchor="middle" fill="#dbeafe" font-size="11.5" font-family="Segoe UI, sans-serif">verify — nothing broke</text>

    <rect x="540" y="240" width="190" height="60" rx="10" fill="var(--accent-strong)"/>
    <text x="635" y="266" text-anchor="middle" fill="#ffffff" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Weekly</text>
    <text x="635" y="288" text-anchor="middle" fill="#e0e7ff" font-size="11.5" font-family="Segoe UI, sans-serif">tune — drift caught</text>

    <rect x="30" y="240" width="190" height="60" rx="10" fill="var(--amber)"/>
    <text x="125" y="266" text-anchor="middle" fill="#1f2937" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Monthly</text>
    <text x="125" y="288" text-anchor="middle" fill="#1f2937" font-size="11.5" font-family="Segoe UI, sans-serif">prove — recovery works</text>

    <rect x="270" y="140" width="220" height="70" rx="12" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="170" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="600" font-family="Segoe UI, sans-serif">Recurring rhythm</text>
    <text x="380" y="194" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">check → trend → prove</text>

    <line x1="472" y1="58" x2="610" y2="236" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cad-arrow)"/>
    <line x1="538" y1="270" x2="226" y2="270" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cad-arrow)"/>
    <line x1="126" y1="236" x2="294" y2="88" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cad-arrow)"/>

    <text x="380" y="330" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Each cycle feeds the next: daily catches failures, weekly catches drift, monthly proves recovery.</text>
  </svg>
  <div class="figcaption">Figure 1 — The production cadence loops continuously; skipping a cycle defers its findings to an incident.</div>
</div>
<blockquote>Monitoring tells you the database is alive today. Cadence tells you it will still be healthy next quarter.</blockquote>
`
    },
    {
      h: "Daily: keep the lights on",
      html: `
<p>The daily cycle runs at a fixed time, ideally before the business peaks, and takes fifteen minutes when nothing is wrong. Its outputs are evidence, not vibes:</p>
<table>
  <tr><th>Activity</th><th>Evidence to capture</th></tr>
  <tr><td>Alert and dashboard review</td><td>Zero unacknowledged critical alerts; any new warning noted</td></tr>
  <tr><td>SQL Agent job outcomes</td><td>All scheduled jobs succeeded — especially backups, log backups, and ETL</td></tr>
  <tr><td>Backup freshness</td><td>Last full, differential, and log backup within the RPO window</td></tr>
  <tr><td>Disk and file growth</td><td>Free space headroom on data, log, and backup volumes</td></tr>
  <tr><td>Blocking and long-running work</td><td>No unexplained sessions running longer than the threshold</td></tr>
  <tr><td>Error log scan</td><td>No new critical entries since yesterday's check</td></tr>
  <tr><td>Replication / AG health</td><td>Secondaries current, no suspended data movement</td></tr>
  <tr><td>Change window preparation</td><td>Today's approved changes reviewed, rollback known, window confirmed</td></tr>
  <tr><td>On-call handover</td><td>Notes passed: open issues, pending work, anything to watch</td></tr>
</table>
<pre><code class="language-sql">-- Daily: databases with no successful backup in the last 24 hours
SELECT d.name                         AS database_name,
       d.recovery_model_desc,
       d.state_desc,
       max(b.backup_finish_date)      AS last_backup
FROM   sys.databases AS d
LEFT   JOIN msdb.dbo.backupset AS b
       ON b.database_name = d.name
WHERE  d.database_id &gt; 4
AND    d.state = 0
GROUP  BY d.name, d.recovery_model_desc, d.state_desc
HAVING max(b.backup_finish_date) IS NULL
    OR max(b.backup_finish_date) &lt; DATEADD(hour, -24, GETDATE())
ORDER  BY last_backup;</code></pre>
<p>The query is deliberately blunt: anything returned needs an answer today. Databases created ad hoc by developers, restored under a new name, or missed by a backup policy all surface here — they are the ones that fail during a recovery nobody expected.</p>
<p>Pair it with the job history check: a backup job that succeeded is only meaningful if its output was verified. The daily cycle closes with both facts recorded, so tomorrow's comparison has a baseline to work from.</p>
`
    },
    {
      h: "Weekly: review, tune, and plan",
      html: `
<p>The weekly cycle is where the DBA stops reacting and looks at trends. It runs in a quiet window and produces work items for the coming week:</p>
<ul>
  <li><strong>Index and statistics maintenance</strong> — run the fragmentation triage, rebuild or reorganise what crosses threshold, update statistics on tables with heavy churn</li>
  <li><strong>Integrity check results</strong> — confirm DBCC CHECKDB completed cleanly; investigate every warning, not just errors</li>
  <li><strong>Capacity trend</strong> — compare data, log, and backup growth against last week and project forward; flag the volume that will fill in six weeks</li>
  <li><strong>Slow query review</strong> — top consumers from query stats or Query Store; hand evidence to developers with plans attached</li>
  <li><strong>Job health</strong> — jobs running longer than usual, jobs succeeding suspiciously fast, agents with expired credentials</li>
  <li><strong>Security and permissions</strong> — new logins and role changes since last week, reviewed against expectations</li>
  <li><strong>Documentation updates</strong> — anything changed last week that a runbook or diagram now contradicts</li>
  <li><strong>Change retrospective</strong> — did this week's deployments behave as the review predicted? Feed surprises back into the checklist</li>
</ul>
<p>A useful discipline: the weekly session ends with a short written summary — three bullets of what changed, what was found, what is planned. That habit is what turns a year of DBA work into a defensible record during audits, budget reviews, or an incident investigation six months later.</p>
`
    },
    {
      h: "Monthly: prove, patch, and audit",
      html: `
<p>Monthly activities are the ones teams skip first when busy — and they are precisely the ones that prove the promises made to the business:</p>
<table>
  <tr><th>Activity</th><th>Proof it produces</th></tr>
  <tr><td>Restore test into a scratch instance</td><td>Backups are recoverable, and the restore meets its target time</td></tr>
  <tr><td>Failover or DR drill (quarterly at minimum)</td><td>Measured RPO and RTO, not assumed ones</td></tr>
  <tr><td>Patching and updates</td><td>Known defects and vulnerabilities removed on schedule</td></tr>
  <tr><td>Access and permission review</td><td>Roles audited, orphaned users removed, excessive grants withdrawn</td></tr>
  <tr><td>Retention and archival</td><td>Old data and expired backups removed per policy</td></tr>
  <tr><td>Runbook and documentation update</td><td>Steps still match reality after a month of changes</td></tr>
  <tr><td>Baseline comparison</td><td>Performance and size trends measured against last month</td></tr>
</table>
<p>Two of these deserve emphasis. The <strong>restore test</strong> is the only activity that converts “we have backups” into “we can recover” — schedule it the way you would schedule an audit, because it is one. And the <strong>access review</strong> is where security debt accumulates silently: every contractor account, every temporary grant, every “just for now” sysadmin that outlived its reason.</p>
`
    },
    {
      h: "Handover, coverage, and the quiet weeks",
      html: `
<p>No cadence survives on goodwill alone. Holiday, illness, and project work all interrupt it, so the cycle must be <strong>portable</strong>: a colleague should be able to pick up the daily check with the document open and reach the same conclusions you would. Three things make that possible:</p>
<ul>
  <li><strong>A written rota</strong> — who runs the daily check, who owns the weekly session, who performs the monthly restore, and who covers each role during absence</li>
  <li><strong>Handover notes at every boundary</strong> — open incidents, pending changes, known anomalies, and anything scheduled in the next 48 hours</li>
  <li><strong>Shared evidence</strong> — reports land in a shared location rather than an inbox, so the next person sees exactly what you saw</li>
  <li><strong>Escalation contacts</strong> — who to page for storage, network, and application faults during the covered period</li>
</ul>
<table>
  <tr><th>Cadence item</th><th>Primary owner</th><th>Backup owner</th></tr>
  <tr><td>Daily health check</td><td>On-call DBA</td><td>DBA on rota</td></tr>
  <tr><td>Weekly review</td><td>Lead DBA</td><td>Deputy DBA</td></tr>
  <tr><td>Monthly restore test</td><td>DBA</td><td>Second engineer as witness</td></tr>
  <tr><td>Change window</td><td>Applying DBA</td><td>Release manager</td></tr>
</table>
<p>A quick handover query answers the question the incoming DBA actually has: what has this instance been doing while I was away?</p>
<pre><code class="language-powershell"># Handover: last outcome of every job, so nothing failed silently during the break
Invoke-Sqlcmd -ServerInstance 'PROD-SQL01\\INST1' -Query "SELECT j.name, max(h.run_date) AS last_run_date, max(h.run_status) AS last_status FROM msdb.dbo.sysjobhistory AS h JOIN msdb.dbo.sysjobs AS j ON j.job_id = h.job_id WHERE h.step_id = 0 GROUP BY j.name ORDER BY last_run_date DESC" -OutputAs DataRows</code></pre>
<p>The other half of coverage is the <strong>quiet week</strong>. When alerts are silent and the queue is short, the temptation is to let the cadence lapse — but quiet weeks are precisely when the weekly and monthly cycles are cheapest to run. Treat a quiet period as capacity for prevention: run the restore test early, close the access review, document the change you made last month. The next busy week will arrive regardless, and it will be easier if the quiet one was spent well.</p>
`
    },
    {
      h: "Making the cadence stick",
      html: `
<p>Any cadence collapses under its first real workload spike unless it is externalised and defended:</p>
<ul>
  <li><strong>Write it down</strong> — a one-page schedule with the queries, thresholds, and expected results, so anyone on the rota can run it</li>
  <li><strong>Automate collection, keep judgement manual</strong> — jobs gather the evidence; the DBA interprets it, because a threshold crossed at 6 AM needs a person to decide what it means</li>
  <li><strong>Calendar the deep work</strong> — weekly and monthly sessions as recurring appointments; if they are not on the calendar, incidents will consume them</li>
  <li><strong>Alert on cadence failure itself</strong> — “no backup report generated today” must page someone; the absence of evidence is evidence of a problem</li>
  <li><strong>Cover absences</strong> — the checklist must be runnable by a colleague, or holiday becomes an unmonitored outage window</li>
  <li><strong>Review the cadence itself quarterly</strong> — which checks produced real signal, which produced noise, and what new risk deserves a new check</li>
</ul>
<p>Common pitfalls: doing the daily check only when something feels wrong; treating weekly review as optional the moment a project lands; skipping the restore test because the backups “ran fine”; and keeping the whole cadence in one person's head. <strong>The measure of a mature production DBA is not how quickly they fix incidents — it is how few of them the cadence allows.</strong></p>
`
    }
  ],

  scenario: {
    title: "The quarterly restore that was scheduled every quarter for two years",
    html: `
<p>Monday's monthly cycle surfaced an uncomfortable pattern: the restore test had been on the calendar for eight consecutive quarters and completed twice. Each time it slipped — a project, an incident, a holiday — and each time it was re-scheduled without anyone noting the gap. Meanwhile the backup jobs reported success every night, so no alert existed for the thing that was never happening.</p>
<p>The DBA treated it as an incident against the process. The test was re-scoped so it could not fail for time reasons: a weekly automated restore of the smallest critical database into a scratch instance, verified by row counts and a version query, taking under twenty minutes — plus the full quarterly restore of the largest database, booked as a half-day with a named owner and a backup owner.</p>
<p>The first automated restore failed within the hour: the backup chain was fine, but the restored database came up without its logins — a gap that would have turned a real recovery into an additional hour of work. <strong>Two years of nightly successes had never proved one thing: that recovery actually works.</strong> The cadence now reports restoration proofs, not backup jobs.</p>
`
  },

  interview: [
    {
      q: "What is the difference between the daily and weekly cycles?",
      a: "Daily is verification that nothing broke overnight — jobs, backups, space, blocking — and it should take minutes with almost always a boring result. Weekly is analysis of trends: fragmentation and statistics maintenance, capacity projection, slow-query review, and a retrospective on the week's changes. Daily detects failures; weekly prevents drift."
    },
    {
      q: "Why is a restore test a monthly activity rather than an incident-only one?",
      a: "Because backups only prove recoverability when someone restores them — job success proves the file was written, not that it is usable or that the restore meets its RTO. Corruption, missing logins, or an untested procedure surface during a scheduled test, which costs twenty minutes, rather than during an incident, which costs the business an outage."
    },
    {
      q: "How do you keep up the cadence during a busy project month?",
      a: "Protect the cycle by making it external and prioritised: the daily check is scripted and runs in minutes, the weekly and monthly sessions are calendar appointments with named owners, and a colleague can run the checklist from documentation if I am pulled away. I also alert on cadence failure itself, so a skipped cycle becomes visible instead of quietly forgotten."
    }
  ],

  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Why cadence matters”?",
      "options": [
        "Today's approved changes reviewed, rollback known, window confirmed",
        "Notes passed: open issues, pending work, anything to watch",
        "Production databases degrade continuously and fail suddenly."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Production databases degrade continuously and fail suddenly. Cadence is how a DBA converts continuous degradation into scheduled detection — each cycle catches a different class of problem before it becomes an incident:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Daily: keep the lights on”?",
      "options": [
        "Performance and size trends measured against last month",
        "The daily cycle runs at a fixed time, ideally before the business peaks, and takes fifteen minutes when nothing is wrong.",
        "Steps still match reality after a month of changes"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The daily cycle runs at a fixed time, ideally before the business peaks, and takes fifteen minutes when nothing is wrong. Its outputs are evidence, not vibes:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Weekly: review, tune, and plan”?",
      "options": [
        "The weekly cycle is where the DBA stops reacting and looks at trends.",
        "Today's approved changes reviewed, rollback known, window confirmed",
        "Notes passed: open issues, pending work, anything to watch"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The weekly cycle is where the DBA stops reacting and looks at trends. It runs in a quiet window and produces work items for the coming week:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Monthly: prove, patch, and audit”?",
      "options": [
        "Notes passed: open issues, pending work, anything to watch",
        "The weekly cycle is where the DBA stops reacting and looks at trends.",
        "Monthly activities are the ones teams skip first when busy — and they are precisely the ones that prove the promises made to the business:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Monthly activities are the ones teams skip first when busy — and they are precisely the ones that prove the promises made to the business:”"
    },
    {
      "question": "Complete the lesson statement: “Holiday, illness, and project work all interrupt it, so the cycle must be _____: a colleague should be able to pick up the daily check with the document open and reach the same conclusions you would.”",
      "options": [
        "access review",
        "portable",
        "restore test"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “No cadence survives on goodwill alone. Holiday, illness, and project work all interrupt it, so the cycle must be portable: a colleague should be able to pick up the daily check with the document open and reach the same conclusions you would. Three things make that possible:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Making the cadence stick”?",
      "options": [
        "Any cadence collapses under its first real workload spike unless it is externalised and defended:",
        "A useful discipline: the weekly session ends with a short written summary — three bullets of what changed, what was found, what is planned.",
        "Monthly activities are the ones teams skip first when busy — and they are precisely the ones that prove the promises made to the business:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Any cadence collapses under its first real workload spike unless it is externalised and defended:”"
    },
    {
      "question": "Complete the lesson statement: “Daily success is _____.”",
      "options": [
        "A written rota",
        "Handover notes at every boundary",
        "nothing to report"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The three cycles also differ in what counts as success. Daily success is nothing to report. Weekly success is a change made based on evidence. Monthly success is a proof obtained — the restore that worked, the failover that met its RTO, the access list that got shorter.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Daily: keep the lights on”?",
      "options": [
        "Second engineer as witness",
        "The query is deliberately blunt: anything returned needs an answer today.",
        "Deputy DBA"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The query is deliberately blunt: anything returned needs an answer today. Databases created ad hoc by developers, restored under a new name, or missed by a backup policy all surface here — they are the ones that fail during a recovery nobody expected.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Weekly: review, tune, and plan”?",
      "options": [
        "A useful discipline: the weekly session ends with a short written summary — three bullets of what changed, what was found, what is planned.",
        "Known defects and vulnerabilities removed on schedule",
        "Roles audited, orphaned users removed, excessive grants withdrawn"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A useful discipline: the weekly session ends with a short written summary — three bullets of what changed, what was found, what is planned. That habit is what turns a year of DBA work into a defensible record during audits, budget reviews, or an incident investigation six months later.”"
    },
    {
      "question": "Complete the lesson statement: “The _____ is the only activity that converts “we have backups” into “we can recover” — schedule it the way you would schedule an audit, because it is one.”",
      "options": [
        "Escalation contacts",
        "quiet week",
        "restore test"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Two of these deserve emphasis. The restore test is the only activity that converts “we have backups” into “we can recover” — schedule it the way you would schedule an audit, because it is one. And the access review is where security debt accumulates silently: every contractor account, every temporary grant, every “just for now” sysadmin that outlived its reason.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Why cadence matters”?",
      "options": [
        "Today's approved changes reviewed, rollback known, window confirmed",
        "Notes passed: open issues, pending work, anything to watch",
        "Production databases degrade continuously and fail suddenly."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Production databases degrade continuously and fail suddenly. Cadence is how a DBA converts continuous degradation into scheduled detection — each cycle catches a different class of problem before it becomes an incident:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Daily: keep the lights on”?",
      "options": [
        "Performance and size trends measured against last month",
        "The daily cycle runs at a fixed time, ideally before the business peaks, and takes fifteen minutes when nothing is wrong.",
        "Steps still match reality after a month of changes"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The daily cycle runs at a fixed time, ideally before the business peaks, and takes fifteen minutes when nothing is wrong. Its outputs are evidence, not vibes:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Weekly: review, tune, and plan”?",
      "options": [
        "The weekly cycle is where the DBA stops reacting and looks at trends.",
        "Today's approved changes reviewed, rollback known, window confirmed",
        "Notes passed: open issues, pending work, anything to watch"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The weekly cycle is where the DBA stops reacting and looks at trends. It runs in a quiet window and produces work items for the coming week:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Monthly: prove, patch, and audit”?",
      "options": [
        "Notes passed: open issues, pending work, anything to watch",
        "The weekly cycle is where the DBA stops reacting and looks at trends.",
        "Monthly activities are the ones teams skip first when busy — and they are precisely the ones that prove the promises made to the business:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Monthly activities are the ones teams skip first when busy — and they are precisely the ones that prove the promises made to the business:”"
    },
    {
      "question": "Complete the lesson statement: “Holiday, illness, and project work all interrupt it, so the cycle must be _____: a colleague should be able to pick up the daily check with the document open and reach the same conclusions you would.”",
      "options": [
        "access review",
        "portable",
        "restore test"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “No cadence survives on goodwill alone. Holiday, illness, and project work all interrupt it, so the cycle must be portable: a colleague should be able to pick up the daily check with the document open and reach the same conclusions you would. Three things make that possible:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Making the cadence stick”?",
      "options": [
        "Any cadence collapses under its first real workload spike unless it is externalised and defended:",
        "A useful discipline: the weekly session ends with a short written summary — three bullets of what changed, what was found, what is planned.",
        "Monthly activities are the ones teams skip first when busy — and they are precisely the ones that prove the promises made to the business:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Any cadence collapses under its first real workload spike unless it is externalised and defended:”"
    },
    {
      "question": "Complete the lesson statement: “Daily success is _____.”",
      "options": [
        "A written rota",
        "Handover notes at every boundary",
        "nothing to report"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The three cycles also differ in what counts as success. Daily success is nothing to report. Weekly success is a change made based on evidence. Monthly success is a proof obtained — the restore that worked, the failover that met its RTO, the access list that got shorter.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Daily: keep the lights on”?",
      "options": [
        "Second engineer as witness",
        "The query is deliberately blunt: anything returned needs an answer today.",
        "Deputy DBA"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The query is deliberately blunt: anything returned needs an answer today. Databases created ad hoc by developers, restored under a new name, or missed by a backup policy all surface here — they are the ones that fail during a recovery nobody expected.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Weekly: review, tune, and plan”?",
      "options": [
        "A useful discipline: the weekly session ends with a short written summary — three bullets of what changed, what was found, what is planned.",
        "Known defects and vulnerabilities removed on schedule",
        "Roles audited, orphaned users removed, excessive grants withdrawn"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A useful discipline: the weekly session ends with a short written summary — three bullets of what changed, what was found, what is planned. That habit is what turns a year of DBA work into a defensible record during audits, budget reviews, or an incident investigation six months later.”"
    },
    {
      "question": "Complete the lesson statement: “The _____ is the only activity that converts “we have backups” into “we can recover” — schedule it the way you would schedule an audit, because it is one.”",
      "options": [
        "Escalation contacts",
        "quiet week",
        "restore test"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Two of these deserve emphasis. The restore test is the only activity that converts “we have backups” into “we can recover” — schedule it the way you would schedule an audit, because it is one. And the access review is where security debt accumulates silently: every contractor account, every temporary grant, every “just for now” sysadmin that outlived its reason.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Why cadence matters”?",
      "options": [
        "Today's approved changes reviewed, rollback known, window confirmed",
        "Notes passed: open issues, pending work, anything to watch",
        "Production databases degrade continuously and fail suddenly."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Production databases degrade continuously and fail suddenly. Cadence is how a DBA converts continuous degradation into scheduled detection — each cycle catches a different class of problem before it becomes an incident:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Daily: keep the lights on”?",
      "options": [
        "Performance and size trends measured against last month",
        "The daily cycle runs at a fixed time, ideally before the business peaks, and takes fifteen minutes when nothing is wrong.",
        "Steps still match reality after a month of changes"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The daily cycle runs at a fixed time, ideally before the business peaks, and takes fifteen minutes when nothing is wrong. Its outputs are evidence, not vibes:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Weekly: review, tune, and plan”?",
      "options": [
        "The weekly cycle is where the DBA stops reacting and looks at trends.",
        "Today's approved changes reviewed, rollback known, window confirmed",
        "Notes passed: open issues, pending work, anything to watch"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The weekly cycle is where the DBA stops reacting and looks at trends. It runs in a quiet window and produces work items for the coming week:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Monthly: prove, patch, and audit”?",
      "options": [
        "Notes passed: open issues, pending work, anything to watch",
        "The weekly cycle is where the DBA stops reacting and looks at trends.",
        "Monthly activities are the ones teams skip first when busy — and they are precisely the ones that prove the promises made to the business:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Monthly activities are the ones teams skip first when busy — and they are precisely the ones that prove the promises made to the business:”"
    },
    {
      "question": "Complete the lesson statement: “Holiday, illness, and project work all interrupt it, so the cycle must be _____: a colleague should be able to pick up the daily check with the document open and reach the same conclusions you would.”",
      "options": [
        "access review",
        "portable",
        "restore test"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “No cadence survives on goodwill alone. Holiday, illness, and project work all interrupt it, so the cycle must be portable: a colleague should be able to pick up the daily check with the document open and reach the same conclusions you would. Three things make that possible:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Making the cadence stick”?",
      "options": [
        "Any cadence collapses under its first real workload spike unless it is externalised and defended:",
        "A useful discipline: the weekly session ends with a short written summary — three bullets of what changed, what was found, what is planned.",
        "Monthly activities are the ones teams skip first when busy — and they are precisely the ones that prove the promises made to the business:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Any cadence collapses under its first real workload spike unless it is externalised and defended:”"
    },
    {
      "question": "Complete the lesson statement: “Daily success is _____.”",
      "options": [
        "A written rota",
        "Handover notes at every boundary",
        "nothing to report"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The three cycles also differ in what counts as success. Daily success is nothing to report. Weekly success is a change made based on evidence. Monthly success is a proof obtained — the restore that worked, the failover that met its RTO, the access list that got shorter.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Daily: keep the lights on”?",
      "options": [
        "Second engineer as witness",
        "The query is deliberately blunt: anything returned needs an answer today.",
        "Deputy DBA"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The query is deliberately blunt: anything returned needs an answer today. Databases created ad hoc by developers, restored under a new name, or missed by a backup policy all surface here — they are the ones that fail during a recovery nobody expected.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Weekly: review, tune, and plan”?",
      "options": [
        "A useful discipline: the weekly session ends with a short written summary — three bullets of what changed, what was found, what is planned.",
        "Known defects and vulnerabilities removed on schedule",
        "Roles audited, orphaned users removed, excessive grants withdrawn"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A useful discipline: the weekly session ends with a short written summary — three bullets of what changed, what was found, what is planned. That habit is what turns a year of DBA work into a defensible record during audits, budget reviews, or an incident investigation six months later.”"
    },
    {
      "question": "Complete the lesson statement: “The _____ is the only activity that converts “we have backups” into “we can recover” — schedule it the way you would schedule an audit, because it is one.”",
      "options": [
        "Escalation contacts",
        "quiet week",
        "restore test"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Two of these deserve emphasis. The restore test is the only activity that converts “we have backups” into “we can recover” — schedule it the way you would schedule an audit, because it is one. And the access review is where security debt accumulates silently: every contractor account, every temporary grant, every “just for now” sysadmin that outlived its reason.”"
    }
  ],
  takeaways: [
    "Daily catches failures, weekly catches drift, monthly proves recovery — each cycle has a distinct purpose",
    "Every activity produces evidence: a report, a measurement, a written summary — not a feeling that it went fine",
    "The restore test and access review are the monthly activities most often skipped and most often needed",
    "Automate evidence collection, keep interpretation manual, and alert when a cadence itself fails",
    "A mature production DBA is measured by how few incidents the cadence prevents"
  ]
};
