/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch01-02.html */

window.TOPIC = {
  id: "ch01-02",
  title: "Types of DBAs: Production, Development, Infrastructure, Architect",

  lead: "As an organisation's data estate grows, the single generalist DBA splits into specialisations — production, development, infrastructure, and architecture — each with a different focus, a different clock, and a different definition of done.",

  objectives: [
    "Distinguish the four common DBA types by focus and accountability",
    "Describe what each type owns day to day",
    "Trace how the types collaborate on change and incidents",
    "Recognise when an organisation needs a dedicated role rather than a generalist"
  ],

  sections: [
    {
      h: "Why the role specialises",
      html: `
<p>In a small company one DBA might cover backups, index maintenance, and on-call work. As an estate grows, teams may divide responsibilities among production, development, infrastructure, and architecture roles. This is one useful model, not a standard taxonomy: titles and boundaries vary, and the same person may cover several areas.</p>
<p>These areas often have different planning horizons:</p>
<ul>
  <li><strong>Production DBA</strong> — the clock is <em>now</em>: uptime, incidents, and changes that land in live systems</li>
  <li><strong>Development DBA</strong> — the clock is <em>the release</em>: schema design, query review, test data, migration scripts</li>
  <li><strong>Infrastructure DBA</strong> — the clock is <em>the estate</em>: servers, storage, installs, patching, capacity</li>
  <li><strong>Database Architect</strong> — the clock is <em>years</em>: standards, data models, integration patterns, technology direction</li>
</ul>
<p>The specialisations share technical foundations — T-SQL, storage, backup, and security — but focus on different outcomes. Clear change and incident ownership helps prevent work from falling between roles.</p>
<blockquote>The skills are the same; the accountability is not. Production asks “is it still running?”, development asks “is it ready to ship?”, infrastructure asks “does the platform scale?”, and architecture asks “will this still fit in two years?”</blockquote>
`
    },
    {
      h: "The four types side by side",
      html: `
<p>The clearest way to separate the roles is by what they own and what they are measured on:</p>
<table>
  <tr><th>Type</th><th>Primary focus</th><th>Typical ownership</th><th>Key metric</th></tr>
  <tr><td><strong>Production</strong></td><td>Live systems, right now</td><td>Availability, change control, incidents, backups, monitoring</td><td>Uptime, RPO/RTO met, incident count</td></tr>
  <tr><td><strong>Development</strong></td><td>Applications before release</td><td>Schema design, query review, migrations, test data, performance in test</td><td>Release quality, defect escapes, deploy success</td></tr>
  <tr><td><strong>Infrastructure</strong></td><td>The server estate</td><td>Instances, storage, patching, failover clusters, Agent jobs, capacity</td><td>Capacity headroom, patch compliance, provisioning time</td></tr>
  <tr><td><strong>Architect</strong></td><td>Design across systems and years</td><td>Data model standards, integration patterns, technology choices, reviews</td><td>Design fit, rework avoided, standards adoption</td></tr>
</table>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Four DBA specialisations around one data platform">
    <defs>
      <marker id="dba-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="280" y="135" width="200" height="72" rx="12" fill="var(--accent)"/>
    <text x="380" y="166" text-anchor="middle" fill="#ffffff" font-size="17" font-weight="700" font-family="Segoe UI, sans-serif">Enterprise data</text>
    <text x="380" y="190" text-anchor="middle" fill="#ffffff" font-size="17" font-weight="700" font-family="Segoe UI, sans-serif">platform</text>

    <rect x="40" y="30" width="200" height="66" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="140" y="57" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="600" font-family="Segoe UI, sans-serif">Production DBA</text>
    <text x="140" y="79" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">uptime · change · incidents</text>

    <rect x="520" y="30" width="200" height="66" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="620" y="57" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="600" font-family="Segoe UI, sans-serif">Development DBA</text>
    <text x="620" y="79" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">schema · queries · releases</text>

    <rect x="40" y="246" width="200" height="66" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="140" y="273" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="600" font-family="Segoe UI, sans-serif">Infrastructure DBA</text>
    <text x="140" y="295" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">servers · storage · patching</text>

    <rect x="520" y="246" width="200" height="66" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="620" y="273" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="600" font-family="Segoe UI, sans-serif">Architect</text>
    <text x="620" y="295" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">standards · models · direction</text>

    <line x1="240" y1="75" x2="305" y2="138" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#dba-arrow)"/>
    <line x1="520" y1="75" x2="455" y2="138" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#dba-arrow)"/>
    <line x1="240" y1="270" x2="305" y2="210" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#dba-arrow)"/>
    <line x1="520" y1="270" x2="455" y2="210" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#dba-arrow)"/>

    <text x="380" y="335" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Four specialisations, one platform — the hand-offs between them are where outages start.</text>
  </svg>
  <div class="figcaption">Figure 1 — Each specialisation serves the same platform from a different angle.</div>
</div>
<p>All four roles should share one estate view. A simple inventory query keeps everyone honest about what is actually running:</p>
<pre><code class="language-sql">-- Shared estate view: databases, size, recovery model, last full backup
WITH FileSizes AS (
    SELECT database_id, SUM(CONVERT(bigint, size)) * 8 / 1024 AS size_mb
    FROM sys.master_files
    GROUP BY database_id
),
FullBackups AS (
    SELECT database_name, MAX(backup_finish_date) AS last_full_backup
    FROM msdb.dbo.backupset
    WHERE type = 'D'
    GROUP BY database_name
)
SELECT d.name AS database_name,
       d.recovery_model_desc,
       f.size_mb,
       b.last_full_backup
FROM   sys.databases AS d
JOIN   FileSizes AS f ON f.database_id = d.database_id
LEFT   JOIN FullBackups AS b ON b.database_name = d.name
WHERE  d.database_id > 4
ORDER  BY size_mb DESC;</code></pre>
`
    },
    {
      h: "A day in each role",
      html: `
<p><strong>Production DBA.</strong> Starts with monitoring: alerts, failed Agent jobs, backup verification, disk space, blocking. Then the change window — reviewing and applying approved releases — then on-call for incidents, and capacity or housekeeping work squeezed between them. Success is a boring day: nothing paged, nothing lost.</p>
<p><strong>Development DBA.</strong> Reviews table designs and indexes before they are coded against, walks through execution plans with developers, builds migration scripts, refreshes and masks test data, and tunes queries in the test environment so production never sees them slow. Success is a release that needs no emergency DBA work.</p>
<p><strong>Infrastructure DBA.</strong> Provisions instances, applies cumulative updates, manages storage allocation and autogrowth, maintains failover clusters and availability groups, and keeps the patching calendar current. Success is a platform that scales without heroics and has no single point of failure left unexamined.</p>
<p><strong>Architect.</strong> Sets standards (naming, surrogate keys, partitioning thresholds, PII handling), reviews designs for the major applications, chooses between patterns — eventual consistency, replicas, message queues — and keeps the roadmap aligned with where the business is going. Success is decisions made once and reused, not rediscovered per project.</p>
<p>In a mid-sized organisation one person may genuinely hold two or three of these hats. The danger is not the workload — it is <strong>unconscious switching</strong>: solving a development problem with production access, or patching infrastructure while a Sev1 is running.</p>
`
    },
    {
      h: "How the four collaborate",
      html: `
<p>Most database work travels a predictable path. For a <strong>schema change</strong>:</p>
<ol>
  <li>The application team proposes the change and the queries it enables</li>
  <li>The <strong>development DBA</strong> reviews the design, indexes, and migration script against test data</li>
  <li>The <strong>architect</strong> checks it against standards and the wider data model (usually only for major changes)</li>
  <li>The <strong>infrastructure DBA</strong> provisions capacity, jobs, or a new instance if the change needs them</li>
  <li>The <strong>production DBA</strong> approves the release window, applies it, and verifies it in production</li>
</ol>
<p>For an <strong>incident</strong> the path is shorter: the production DBA is the first responder and coordinates; escalation goes to infrastructure for storage, OS, or network faults, to the vendor for engine defects, and to the architect only when the incident exposes a design problem.</p>
<table>
  <tr><th>Signal</th><th>Who leads</th><th>Who supports</th></tr>
  <tr><td>Application outage or blocking</td><td>Production DBA</td><td>Development DBA (query forensics)</td></tr>
  <tr><td>Disk, memory, or patch problem</td><td>Infrastructure DBA</td><td>Production DBA (impact assessment)</td></tr>
  <tr><td>Slow query in production</td><td>Production DBA</td><td>Development DBA (code fix)</td></tr>
  <tr><td>New system design</td><td>Architect</td><td>All three, at review</td></tr>
</table>
<p>For higher-risk or regulated systems, an independent review or approval can provide separation of duties. The organisation should define the required controls for its risk and compliance obligations.</p>
`
    },
    {
      h: "Titles vary — ownership does not",
      html: `
<p>Job titles in this field are unreliable. One company's “Production DBA” is another's “Senior Systems DBA”; a small firm may advertise “DBA” and expect all four roles. Judge a position by what it <em>owns</em>, not what it is called. Three pitfalls to recognise early:</p>
<ul>
  <li><strong>The missing production hat.</strong> An organisation with development and infrastructure DBAs but no clear owner of live availability means nobody is accountable when production breaks at 3 AM. Someone must own the change gate and the on-call rota.</li>
  <li><strong>The architect who stopped being hands-on.</strong> Architecture reviewed only on slides drifts away from reality. Architects who stay credible run proof-of-concepts and read production execution plans.</li>
  <li><strong>Title inflation without authority.</strong> Being called an architect but having no say in design reviews is a warning sign — ownership without authority produces disengagement, not standards.</li>
</ul>
<p>If you are the only DBA, adopt the specialisation <em>deliberately</em>: keep a written checklist per hat, give production the first claim on your attention, and switch hats visibly (close the feature work, open the change record) so one role never silently cannibalises another.</p>
`
    }
  ],

  scenario: {
    title: "The hotfix that skipped the production DBA",
    html: `
<p>At 10:40 AM, mid-peak, checkout requests start timing out on a retail platform. The on-call production DBA is brought in and within four minutes finds a new index and an altered column sitting on the orders table — neither in the change record. The development DBA, under pressure to fix a slow query reported by the business, had applied the hotfix directly to production using their privileged connection, unaware that the table was under heavy write load and the ALTER took a schema-modification lock. Order inserts queued behind it for eleven minutes.</p>
<p>Diagnosis came from the blocking chain in <code>sys.dm_exec_requests</code>: the head blocker was the deployment session itself. With the release manager's approval the DBA killed the session, the lock released, and traffic recovered. The fix itself was correct — only the <strong>timing, ownership, and route</strong> were wrong.</p>
<p>Prevention had three parts: production logins restricted to the change pipeline and the on-call rota, a rule that any lock-taking change on a hot table runs in the change window, and a weekly hand-off where the development DBA walked the production DBA through pending fixes. <strong>The organisation did not have a skills problem — it had a role-boundary problem.</strong></p>
`
  },

  interview: [
    {
      q: "What distinguishes a production DBA from a development DBA?",
      a: "The accountability and the clock. A development DBA optimises the schema, queries, and migration scripts before release; a production DBA owns the live system — availability, change control, incidents, and recovery — and answers for it when it breaks. The skills overlap heavily, but the incentives differ: one is judged on shipping, the other on not breaking."
    },
    {
      q: "Can one person cover all four types?",
      a: "Yes, at small scale — most solo DBAs do. The requirement is deliberate hat-switching: documented checklists per role, production taking precedence over feature work, and a formal change gate so development pressure never bypasses production judgement. Problems start when the hats are worn unconsciously."
    },
    {
      q: "What does an architect do that a senior production DBA does not?",
      a: "Design across systems and over a longer horizon: data model standards, integration and security patterns, partitioning and scaling strategy, and technology direction — validated against production reality. A senior DBA keeps the current platform healthy; the architect decides what the platform should become."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “At that point the role splits along _____, because the four jobs genuinely run on different clocks:”",
      "options": [
        "the release",
        "timescale",
        "Development DBA"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In a small company one DBA does everything: backups at night, indexes by day, on call at the weekend. Specialisation appears when the estate outgrows one person — multiple instances, several applications, regulated data, and a release train that never stops. At that point the role splits along timescale, because the four jobs genuinely run on different clocks:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The four types side by side”?",
      "options": [
        "The clearest way to separate the roles is by what they own and what they are measured on:",
        "Development DBA.",
        "Infrastructure DBA."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The clearest way to separate the roles is by what they own and what they are measured on:”"
    },
    {
      "question": "Complete the lesson statement: “_____”",
      "options": [
        "the release",
        "Infrastructure DBA",
        "Production DBA."
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Production DBA. Starts with monitoring: alerts, failed Agent jobs, backup verification, disk space, blocking. Then the change window — reviewing and applying approved releases — then on-call for incidents, and capacity or housekeeping work squeezed between them. Success is a boring day: nothing paged, nothing lost.”"
    },
    {
      "question": "Complete the lesson statement: “For a _____:”",
      "options": [
        "the estate",
        "schema change",
        "Infrastructure DBA"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Most database work travels a predictable path. For a schema change:”"
    },
    {
      "question": "Complete the lesson statement: “Judge a position by what it _____, not what it is called.”",
      "options": [
        "owns",
        "the estate",
        "Database Architect"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Job titles in this field are unreliable. One company's “Production DBA” is another's “Senior Systems DBA”; a small firm may advertise “DBA” and expect all four roles. Judge a position by what it owns, not what it is called. Three pitfalls to recognise early:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Why the role specialises”?",
      "options": [
        "Development DBA.",
        "Infrastructure DBA.",
        "The specialisations share the same technical foundation — T-SQL, storage, backup, security — but they are optimised for different outcomes."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The specialisations share the same technical foundation — T-SQL, storage, backup, security — but they are optimised for different outcomes. Confusing them is one of the most common organisational mistakes in data teams: a development DBA making an urgent production change is wearing the wrong hat, and production usually notices.”"
    },
    {
      "question": "Which fact is covered in the lesson section “The four types side by side”?",
      "options": [
        "no single role can approve its own change into production",
        "All four roles should share one estate view.",
        "incident"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “All four roles should share one estate view. A simple inventory query keeps everyone honest about what is actually running:”"
    },
    {
      "question": "Complete the lesson statement: “_____”",
      "options": [
        "Development DBA.",
        "Production",
        "Development"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Development DBA. Reviews table designs and indexes before they are coded against, walks through execution plans with developers, builds migration scripts, refreshes and masks test data, and tunes queries in the test environment so production never sees them slow. Success is a release that needs no emergency DBA work.”"
    },
    {
      "question": "Complete the lesson statement: “For an _____ the path is shorter: the production DBA is the first responder and coordinates; escalation goes to infrastructure for storage, OS, or…”",
      "options": [
        "Development",
        "Infrastructure",
        "incident"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “For an incident the path is shorter: the production DBA is the first responder and coordinates; escalation goes to infrastructure for storage, OS, or network faults, to the vendor for engine defects, and to the architect only when the incident exposes a design problem.”"
    },
    {
      "question": "Complete the lesson statement: “If you are the only DBA, adopt the specialisation _____: keep a written checklist per hat, give production the first claim on your attention, and switch hats visibly (close the feature work, open…”",
      "options": [
        "Architect",
        "deliberately",
        "Infrastructure"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “If you are the only DBA, adopt the specialisation deliberately: keep a written checklist per hat, give production the first claim on your attention, and switch hats visibly (close the feature work, open the change record) so one role never silently cannibalises another.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “At that point the role splits along _____, because the four jobs genuinely run on different clocks:”",
      "options": [
        "the release",
        "timescale",
        "Development DBA"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In a small company one DBA does everything: backups at night, indexes by day, on call at the weekend. Specialisation appears when the estate outgrows one person — multiple instances, several applications, regulated data, and a release train that never stops. At that point the role splits along timescale, because the four jobs genuinely run on different clocks:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The four types side by side”?",
      "options": [
        "The clearest way to separate the roles is by what they own and what they are measured on:",
        "Development DBA.",
        "Infrastructure DBA."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The clearest way to separate the roles is by what they own and what they are measured on:”"
    },
    {
      "question": "Complete the lesson statement: “_____”",
      "options": [
        "the release",
        "Infrastructure DBA",
        "Production DBA."
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Production DBA. Starts with monitoring: alerts, failed Agent jobs, backup verification, disk space, blocking. Then the change window — reviewing and applying approved releases — then on-call for incidents, and capacity or housekeeping work squeezed between them. Success is a boring day: nothing paged, nothing lost.”"
    },
    {
      "question": "Complete the lesson statement: “For a _____:”",
      "options": [
        "the estate",
        "schema change",
        "Infrastructure DBA"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Most database work travels a predictable path. For a schema change:”"
    },
    {
      "question": "Complete the lesson statement: “Judge a position by what it _____, not what it is called.”",
      "options": [
        "owns",
        "the estate",
        "Database Architect"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Job titles in this field are unreliable. One company's “Production DBA” is another's “Senior Systems DBA”; a small firm may advertise “DBA” and expect all four roles. Judge a position by what it owns, not what it is called. Three pitfalls to recognise early:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Why the role specialises”?",
      "options": [
        "Development DBA.",
        "Infrastructure DBA.",
        "The specialisations share the same technical foundation — T-SQL, storage, backup, security — but they are optimised for different outcomes."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The specialisations share the same technical foundation — T-SQL, storage, backup, security — but they are optimised for different outcomes. Confusing them is one of the most common organisational mistakes in data teams: a development DBA making an urgent production change is wearing the wrong hat, and production usually notices.”"
    },
    {
      "question": "Which fact is covered in the lesson section “The four types side by side”?",
      "options": [
        "no single role can approve its own change into production",
        "All four roles should share one estate view.",
        "incident"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “All four roles should share one estate view. A simple inventory query keeps everyone honest about what is actually running:”"
    },
    {
      "question": "Complete the lesson statement: “_____”",
      "options": [
        "Development DBA.",
        "Production",
        "Development"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Development DBA. Reviews table designs and indexes before they are coded against, walks through execution plans with developers, builds migration scripts, refreshes and masks test data, and tunes queries in the test environment so production never sees them slow. Success is a release that needs no emergency DBA work.”"
    },
    {
      "question": "Complete the lesson statement: “For an _____ the path is shorter: the production DBA is the first responder and coordinates; escalation goes to infrastructure for storage, OS, or…”",
      "options": [
        "Development",
        "Infrastructure",
        "incident"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “For an incident the path is shorter: the production DBA is the first responder and coordinates; escalation goes to infrastructure for storage, OS, or network faults, to the vendor for engine defects, and to the architect only when the incident exposes a design problem.”"
    },
    {
      "question": "Complete the lesson statement: “If you are the only DBA, adopt the specialisation _____: keep a written checklist per hat, give production the first claim on your attention, and switch hats visibly (close the feature work, open…”",
      "options": [
        "Architect",
        "deliberately",
        "Infrastructure"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “If you are the only DBA, adopt the specialisation deliberately: keep a written checklist per hat, give production the first claim on your attention, and switch hats visibly (close the feature work, open the change record) so one role never silently cannibalises another.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “At that point the role splits along _____, because the four jobs genuinely run on different clocks:”",
      "options": [
        "the release",
        "timescale",
        "Development DBA"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In a small company one DBA does everything: backups at night, indexes by day, on call at the weekend. Specialisation appears when the estate outgrows one person — multiple instances, several applications, regulated data, and a release train that never stops. At that point the role splits along timescale, because the four jobs genuinely run on different clocks:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The four types side by side”?",
      "options": [
        "The clearest way to separate the roles is by what they own and what they are measured on:",
        "Development DBA.",
        "Infrastructure DBA."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The clearest way to separate the roles is by what they own and what they are measured on:”"
    },
    {
      "question": "Complete the lesson statement: “_____”",
      "options": [
        "the release",
        "Infrastructure DBA",
        "Production DBA."
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Production DBA. Starts with monitoring: alerts, failed Agent jobs, backup verification, disk space, blocking. Then the change window — reviewing and applying approved releases — then on-call for incidents, and capacity or housekeeping work squeezed between them. Success is a boring day: nothing paged, nothing lost.”"
    },
    {
      "question": "Complete the lesson statement: “For a _____:”",
      "options": [
        "the estate",
        "schema change",
        "Infrastructure DBA"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Most database work travels a predictable path. For a schema change:”"
    },
    {
      "question": "Complete the lesson statement: “Judge a position by what it _____, not what it is called.”",
      "options": [
        "owns",
        "the estate",
        "Database Architect"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Job titles in this field are unreliable. One company's “Production DBA” is another's “Senior Systems DBA”; a small firm may advertise “DBA” and expect all four roles. Judge a position by what it owns, not what it is called. Three pitfalls to recognise early:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Why the role specialises”?",
      "options": [
        "Development DBA.",
        "Infrastructure DBA.",
        "The specialisations share the same technical foundation — T-SQL, storage, backup, security — but they are optimised for different outcomes."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The specialisations share the same technical foundation — T-SQL, storage, backup, security — but they are optimised for different outcomes. Confusing them is one of the most common organisational mistakes in data teams: a development DBA making an urgent production change is wearing the wrong hat, and production usually notices.”"
    },
    {
      "question": "Which fact is covered in the lesson section “The four types side by side”?",
      "options": [
        "no single role can approve its own change into production",
        "All four roles should share one estate view.",
        "incident"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “All four roles should share one estate view. A simple inventory query keeps everyone honest about what is actually running:”"
    },
    {
      "question": "Complete the lesson statement: “_____”",
      "options": [
        "Development DBA.",
        "Production",
        "Development"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Development DBA. Reviews table designs and indexes before they are coded against, walks through execution plans with developers, builds migration scripts, refreshes and masks test data, and tunes queries in the test environment so production never sees them slow. Success is a release that needs no emergency DBA work.”"
    },
    {
      "question": "Complete the lesson statement: “For an _____ the path is shorter: the production DBA is the first responder and coordinates; escalation goes to infrastructure for storage, OS, or…”",
      "options": [
        "Development",
        "Infrastructure",
        "incident"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “For an incident the path is shorter: the production DBA is the first responder and coordinates; escalation goes to infrastructure for storage, OS, or network faults, to the vendor for engine defects, and to the architect only when the incident exposes a design problem.”"
    },
    {
      "question": "Complete the lesson statement: “If you are the only DBA, adopt the specialisation _____: keep a written checklist per hat, give production the first claim on your attention, and switch hats visibly (close the feature work, open…”",
      "options": [
        "Architect",
        "deliberately",
        "Infrastructure"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “If you are the only DBA, adopt the specialisation deliberately: keep a written checklist per hat, give production the first claim on your attention, and switch hats visibly (close the feature work, open the change record) so one role never silently cannibalises another.”"
    }
  ],
  takeaways: [
    "The DBA role splits along timescale: production (now), development (release), infrastructure (estate), architecture (years)",
    "Each type owns different things and is measured differently — but all share the same technical foundation",
    "Collaboration follows a path: design review, provisioning, change window, verification — with no self-approval of production changes",
    "Titles are unreliable; judge a role by what it owns and what it is accountable for",
    "Solo DBAs must wear all four hats deliberately, with production taking precedence at all times"
  ]
};
