/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch01-07.html */

window.TOPIC = {
  id: "ch01-07",
  title: "Database Availability and Reliability",

  lead: "Availability is about being up when needed; reliability is about behaving correctly while up — and both are engineered through redundancy, measurable objectives, and failure testing, not hoped for.",

  objectives: [
    "Distinguish availability from reliability and measure each",
    "Define RPO and RTO and translate them into design choices",
    "Map the redundancy layers that protect a database service",
    "Identify single points of failure before they identify themselves"
  ],

  sections: [
    {
      h: "Two words that are not synonyms",
      html: `
<p><strong>Availability</strong> is the proportion of time a service is usable by its consumers, usually expressed as an uptime percentage. <strong>Reliability</strong> is the probability that the service performs correctly over time — no corruption, no wrong answers, no silent data loss. A database can be available and unreliable (up, but returning stale or wrong data), or reliable and unavailable (correct, but not answering).</p>
<p>Availability is arithmetic. The table below shows what each “nine” actually costs you in allowed downtime per year — it is the language DBAs use to translate an uptime target into a maintenance budget:</p>
<table>
  <tr><th>Uptime target</th><th>Downtime per year</th><th>Downtime per month</th><th>Typical use</th></tr>
  <tr><td>99.0%</td><td>3.65 days</td><td>7.3 hours</td><td>Internal tools</td></tr>
  <tr><td>99.9%</td><td>8.76 hours</td><td>43.8 minutes</td><td>Standard business applications</td></tr>
  <tr><td>99.99%</td><td>52.6 minutes</td><td>4.4 minutes</td><td>Customer-facing services</td></tr>
  <tr><td>99.999%</td><td>5.3 minutes</td><td>26 seconds</td><td>Critical financial / telecoms</td></tr>
</table>
<p>Notice the consequence: at four nines, an eight-hour planned patching window in a single year breaks the target on its own. <strong>Every availability number implies a design</strong> — rolling patches, redundant hardware, automatic failover — and the DBA is usually the person who has to say that out loud before the commitment is made.</p>
`
    },
    {
      h: "Measuring what you promised: RPO and RTO",
      html: `
<p>Two objectives turn a vague promise into engineering requirements:</p>
<ul>
  <li><strong>RPO (Recovery Point Objective)</strong> — how much data you can afford to lose, measured backwards in time from the failure. An RPO of 15 minutes means the design must ensure no failure loses more than 15 minutes of work</li>
  <li><strong>RTO (Recovery Time Objective)</strong> — how long the service may be down before it becomes unacceptable. It budgets detection, decision, failover, and verification together</li>
</ul>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="RPO and RTO on a failure timeline">
    <defs>
      <marker id="rpo-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--amber)"/>
      </marker>
      <marker id="rto-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"/>
      </marker>
    </defs>

    <line x1="40" y1="200" x2="730" y2="200" stroke="var(--border)" stroke-width="3"/>
    <text x="720" y="230" text-anchor="end" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">time</text>

    <line x1="120" y1="160" x2="120" y2="240" stroke="var(--muted)" stroke-width="2" stroke-dasharray="6 5"/>
    <circle cx="120" cy="200" r="7" fill="var(--muted)"/>
    <text x="120" y="150" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Last recoverable</text>
    <text x="120" y="170" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">backup / replicated LSN</text>

    <line x1="330" y1="140" x2="330" y2="260" stroke="var(--amber)" stroke-width="3"/>
    <text x="330" y="130" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Failure</text>

    <line x1="620" y1="140" x2="620" y2="260" stroke="var(--accent)" stroke-width="3"/>
    <text x="620" y="130" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Service restored</text>

    <line x1="126" y1="95" x2="324" y2="95" stroke="var(--amber)" stroke-width="2.4" marker-end="url(#rpo-arrow)"/>
    <text x="225" y="82" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">RPO — data at risk</text>

    <line x1="336" y1="285" x2="614" y2="285" stroke="var(--accent)" stroke-width="2.4" marker-end="url(#rto-arrow)"/>
    <text x="475" y="310" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">RTO — time to restore service</text>

    <rect x="345" y="175" width="260" height="50" rx="8" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="475" y="196" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">detect · decide · failover · verify</text>
    <text x="475" y="215" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">all four count against RTO</text>
  </svg>
  <div class="figcaption">Figure 1 — RPO measures data loss backwards from failure; RTO measures recovery forwards.</div>
</div>
<p>The DBA's practical job is to measure what the current design can recover and compare it with the agreed objective. Log-backup age is one useful signal in FULL or BULK_LOGGED recovery, but it isn't the complete RPO: an eligible tail-log backup, availability-group data movement, or log-shipping restore position can change the recoverable point. Measure the relevant recovery path and report its limitations.</p>
`
    },
    {
      h: "Where availability actually comes from",
      html: `
<p>Availability is built from redundancy at every layer that can fail — and a chain is only as strong as its weakest single point:</p>
<table>
  <tr><th>Failure domain</th><th>Protection</th><th>What it does NOT protect against</th></tr>
  <tr><td>Instance / process</td><td>Automatic restart, cluster failover</td><td>Corruption, bad change</td></tr>
  <tr><td>Server</td><td>Failover clustering, availability groups with replicas</td><td>Shared storage failure, SAN misconfiguration</td></tr>
  <tr><td>Storage</td><td>RAID, storage replication, separate LUNs for data and log</td><td>Human error at the storage layer</td></tr>
  <tr><td>Data centre</td><td>Synchronous or async replication to a second site</td><td>WAN partition, split brain</td></tr>
  <tr><td>Whole-site loss</td><td>Backup copies off-site plus documented failover</td><td>Untrained recovery — backups without drills</td></tr>
</table>
<p>Two common SQL Server availability designs are <strong>failover clustering</strong> (an instance can move between cluster nodes) and <strong>availability groups</strong> (selected databases are replicated to secondary replicas). With a synchronized synchronous-commit replica, planned failover can avoid data loss, usually at the cost of additional write latency. Asynchronous commit doesn't wait for the secondary to harden each transaction, so forced failover can lose transactions that hadn't reached it. Choose and test the design against the recovery objectives and failure scenarios.</p>
<p>Backups remain in every design, not as availability but as the last line against everything the redundancy above cannot catch — corruption, ransomware, and the accidental DELETE with no WHERE clause.</p>
`
    },
    {
      h: "Is the RPO real? Measure it",
      html: `
<p>Backup history is one input to recovery planning, not a direct measurement of RPO. This query shows the latest full, differential, and log backup times separately so each can be compared with the database's policy:</p>
<pre><code class="language-sql">-- Latest backup times by type; compare with the recovery policy
SELECT d.name                          AS database_name,
       d.recovery_model_desc,
       d.state_desc,
       MAX(CASE WHEN b.type = 'D' THEN b.backup_finish_date END) AS last_full_backup,
       MAX(CASE WHEN b.type = 'I' THEN b.backup_finish_date END) AS last_differential_backup,
       MAX(CASE WHEN b.type = 'L' THEN b.backup_finish_date END) AS last_log_backup
FROM   sys.databases AS d
LEFT   JOIN msdb.dbo.backupset AS b
       ON b.database_name = d.name
WHERE  d.database_id &gt; 4
AND    d.state = 0
GROUP  BY d.name, d.recovery_model_desc, d.state_desc
ORDER  BY last_log_backup, last_full_backup;</code></pre>
<p>For availability groups, inspect the replica's synchronization and send/redo queues; for log shipping, inspect backup, copy, and restore status. These measures reveal gaps and lag, but the effective RPO also depends on which recovery actions remain possible after the failure.</p>
`
    },
    {
      h: "Designing for failure — and the pitfalls",
      html: `
<p>Availability engineering has a well-worn set of failure modes, and almost all of them are organisational rather than technical:</p>
<ul>
  <li><strong>HA mistaken for backup</strong> — a replicated or failed-over system replicates corruption with perfect fidelity. Backups and restore tests are still required</li>
  <li><strong>Failover never tested</strong> — the cluster works on paper; the first real failover happens during an incident, at the worst possible moment. Schedule drills</li>
  <li><strong>Ignoring planned downtime</strong> — patching, index maintenance, and restores all consume the uptime budget; rolling procedures keep the total within target</li>
  <li><strong>Capacity ceilings</strong> — the log file fills, the tempdb spills, the buffer pool is undersized; the system is unavailable for reasons no redundancy can fix</li>
  <li><strong>Single points of failure nobody documented</strong> — one storage array behind two nodes, one domain controller, one network path; redundancy at the database layer cannot protect against shared infrastructure</li>
  <li><strong>Split-brain and quorum mistakes</strong> — failover clustering and AGs fail when quorum is misconfigured, turning an outage into two outages</li>
  <li><strong>Undocumented dependencies</strong> — the reporting server pointed at the primary, the Agent job that needs the instance name updated after failover, the application that caches connection strings</li>
  <li><strong>RPO/RTO set by hope</strong> — objectives chosen because they sound good, never validated by a timed restore</li>
</ul>
<p>The discipline that catches all six is the same: <strong>test the recovery, on a schedule, with a stopwatch</strong>. A database that has never been restored under time pressure has an assumed RPO and an assumed RTO — and assumptions do not appear in status reports until they fail.</p>
`
    }
  ],

  scenario: {
    title: "The failover that lost twenty minutes of orders",
    html: `
<p>Wednesday, 2:17 AM: the primary database server stops responding. The team forces failover to an asynchronous-commit secondary and later discovers it was eleven minutes behind, so some recently committed transactions weren't hardened on that replica. Log backups running every twenty minutes provide a separate recovery path if their files and the required log chain are available; they don't determine how far the availability-group secondary had caught up. The business had been told the RPO was five minutes.</p>
<p>After the forced failover, the DBA compared the secondary's last hardened log position with application records and quantified which orders needed reconciliation. The secondary came online at 2:31 AM; the application was fully served by 2:52 AM — an RTO of thirty-five minutes against a promise of fifteen.</p>
<p>Prevention came from the review that followed: synchronous commit for the two databases where data loss was unacceptable, asynchronous for the rest with a lag alert at sixty seconds, log backups tightened to five minutes, and — most importantly — <strong>a quarterly timed failover drill</strong> that measures the real RPO and RTO and reports the numbers to the business. The design had never been wrong on paper; it had simply never been tested against the clock.</p>
`
  },

  interview: [
    {
      q: "What is the difference between availability and reliability?",
      a: "Availability is uptime — the proportion of time the service is usable by consumers. Reliability is correct operation over time — no corruption, no wrong results, no silent data loss. A system can be up but unreliable (serving stale or corrupted data) or reliable but down; engineering needs both measures."
    },
    {
      q: "Define RPO and RTO with a concrete example.",
      a: "RPO is the maximum acceptable data loss measured backwards from failure. If the primary is lost and no tail-log backup can be taken, a 15-minute-old last usable log backup can leave up to 15 minutes of transactions unrecoverable from that backup chain. RTO is the maximum acceptable outage measured forwards: detection, decision, failover, and verification all count against it."
    },
    {
      q: "Your availability group secondary is thirty minutes behind. What does that mean?",
      a: "The effective RPO for that database is now thirty minutes, whatever the target says. I would check replication state and why the secondary is not catching up (redo queue, blocking, log backup gaps, suspended data movement), alert on the lag threshold, and either restore sync or explicitly accept and document the exposure with the business."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “_____ is the proportion of time a service is usable by its consumers, usually expressed as an uptime percentage.”",
      "options": [
        "HA mistaken for backup",
        "Failover never tested",
        "Availability"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Availability is the proportion of time a service is usable by its consumers, usually expressed as an uptime percentage. Reliability is the probability that the service performs correctly over time — no corruption, no wrong answers, no silent data loss. A database can be available and unreliable (up, but returning stale or wrong data), or reliable and unavailable (correct, but not answering).”"
    },
    {
      "question": "Which fact is covered in the lesson section “Measuring what you promised: RPO and RTO”?",
      "options": [
        "Backups remain in every design, not as availability but as the last line against everything the redundancy above cannot catch — corruption, ransomware, and the accidental DELETE…",
        "Two objectives turn a vague promise into engineering requirements:",
        "failover clustering"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Two objectives turn a vague promise into engineering requirements:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where availability actually comes from”?",
      "options": [
        "Availability is built from redundancy at every layer that can fail — and a chain is only as strong as its weakest single point:",
        "The fastest way to check whether an RPO is achievable is to look at how much data would be lost if the server failed right now.",
        "A database showing hundreds of minutes since its last backup while the business believes its RPO is 15 minutes is a gap between policy and reality — exactly the kind of gap that…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Availability is built from redundancy at every layer that can fail — and a chain is only as strong as its weakest single point:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Is the RPO real? Measure it”?",
      "options": [
        "failover clustering",
        "Backups remain in every design, not as availability but as the last line against everything the redundancy above cannot catch — corruption, ransomware, and the accidental DELETE…",
        "The fastest way to check whether an RPO is achievable is to look at how much data would be lost if the server failed right now."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The fastest way to check whether an RPO is achievable is to look at how much data would be lost if the server failed right now. For a database in FULL recovery, that is bounded by the time since the last usable backup (or replication position):”"
    },
    {
      "question": "Which fact is covered in the lesson section “Designing for failure — and the pitfalls”?",
      "options": [
        "Corruption, bad change",
        "Availability engineering has a well-worn set of failure modes, and almost all of them are organisational rather than technical:",
        "Backups remain in every design, not as availability but as the last line against everything the redundancy above cannot catch — corruption, ransomware, and the accidental DELETE…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Availability engineering has a well-worn set of failure modes, and almost all of them are organisational rather than technical:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Two words that are not synonyms”?",
      "options": [
        "Availability is arithmetic.",
        "the objective is only real if a monitor can see it.",
        "Availability engineering has a well-worn set of failure modes, and almost all of them are organisational rather than technical:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Availability is arithmetic. The table below shows what each “nine” actually costs you in allowed downtime per year — it is the language DBAs use to translate an uptime target into a maintenance budget:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Measuring what you promised: RPO and RTO”?",
      "options": [
        "WAN partition, split brain",
        "Untrained recovery — backups without drills",
        "The DBA's practical job here is to be honest about what current design delivers."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The DBA's practical job here is to be honest about what current design delivers. If log backups run every 15 minutes, the RPO is 15 minutes regardless of what the slide deck says. Measure it, publish it, and let the business decide whether that is acceptable.”"
    },
    {
      "question": "Complete the lesson statement: “The two most common database-level designs in SQL Server are _____ (one instance, multiple nodes, shared or replicated storage) and availability groups (multiple databases replicated to secondary replicas with synchronous or asynchronous commit).”",
      "options": [
        "test the recovery, on a schedule, with a stopwatch",
        "failover clustering",
        "RPO/RTO set by hope"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The two most common database-level designs in SQL Server are failover clustering (one instance, multiple nodes, shared or replicated storage) and availability groups (multiple databases replicated to secondary replicas with synchronous or asynchronous commit). The choice is driven by the RPO: synchronous commit protects against data loss at the cost of write latency; asynchronous commit keeps latency low but the secondary can lag, and that lag is your exposure.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Is the RPO real? Measure it”?",
      "options": [
        "A database showing hundreds of minutes since its last backup while the business believes its RPO is 15 minutes is a gap between policy and reality — exactly the kind of gap that…",
        "WAN partition, split brain",
        "Untrained recovery — backups without drills"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A database showing hundreds of minutes since its last backup while the business believes its RPO is 15 minutes is a gap between policy and reality — exactly the kind of gap that turns into a post-incident finding. Run it, alert on it, and treat the number as the real RPO until something proves otherwise.”"
    },
    {
      "question": "Complete the lesson statement: “The discipline that catches all six is the same: _____.”",
      "options": [
        "Availability is arithmetic.",
        "Internal tools",
        "test the recovery, on a schedule, with a stopwatch"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The discipline that catches all six is the same: test the recovery, on a schedule, with a stopwatch. A database that has never been restored under time pressure has an assumed RPO and an assumed RTO — and assumptions do not appear in status reports until they fail.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “_____ is the proportion of time a service is usable by its consumers, usually expressed as an uptime percentage.”",
      "options": [
        "HA mistaken for backup",
        "Failover never tested",
        "Availability"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Availability is the proportion of time a service is usable by its consumers, usually expressed as an uptime percentage. Reliability is the probability that the service performs correctly over time — no corruption, no wrong answers, no silent data loss. A database can be available and unreliable (up, but returning stale or wrong data), or reliable and unavailable (correct, but not answering).”"
    },
    {
      "question": "Which fact is covered in the lesson section “Measuring what you promised: RPO and RTO”?",
      "options": [
        "Backups remain in every design, not as availability but as the last line against everything the redundancy above cannot catch — corruption, ransomware, and the accidental DELETE…",
        "Two objectives turn a vague promise into engineering requirements:",
        "failover clustering"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Two objectives turn a vague promise into engineering requirements:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where availability actually comes from”?",
      "options": [
        "Availability is built from redundancy at every layer that can fail — and a chain is only as strong as its weakest single point:",
        "The fastest way to check whether an RPO is achievable is to look at how much data would be lost if the server failed right now.",
        "A database showing hundreds of minutes since its last backup while the business believes its RPO is 15 minutes is a gap between policy and reality — exactly the kind of gap that…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Availability is built from redundancy at every layer that can fail — and a chain is only as strong as its weakest single point:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Is the RPO real? Measure it”?",
      "options": [
        "failover clustering",
        "Backups remain in every design, not as availability but as the last line against everything the redundancy above cannot catch — corruption, ransomware, and the accidental DELETE…",
        "The fastest way to check whether an RPO is achievable is to look at how much data would be lost if the server failed right now."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The fastest way to check whether an RPO is achievable is to look at how much data would be lost if the server failed right now. For a database in FULL recovery, that is bounded by the time since the last usable backup (or replication position):”"
    },
    {
      "question": "Which fact is covered in the lesson section “Designing for failure — and the pitfalls”?",
      "options": [
        "Corruption, bad change",
        "Availability engineering has a well-worn set of failure modes, and almost all of them are organisational rather than technical:",
        "Backups remain in every design, not as availability but as the last line against everything the redundancy above cannot catch — corruption, ransomware, and the accidental DELETE…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Availability engineering has a well-worn set of failure modes, and almost all of them are organisational rather than technical:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Two words that are not synonyms”?",
      "options": [
        "Availability is arithmetic.",
        "the objective is only real if a monitor can see it.",
        "Availability engineering has a well-worn set of failure modes, and almost all of them are organisational rather than technical:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Availability is arithmetic. The table below shows what each “nine” actually costs you in allowed downtime per year — it is the language DBAs use to translate an uptime target into a maintenance budget:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Measuring what you promised: RPO and RTO”?",
      "options": [
        "WAN partition, split brain",
        "Untrained recovery — backups without drills",
        "The DBA's practical job here is to be honest about what current design delivers."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The DBA's practical job here is to be honest about what current design delivers. If log backups run every 15 minutes, the RPO is 15 minutes regardless of what the slide deck says. Measure it, publish it, and let the business decide whether that is acceptable.”"
    },
    {
      "question": "Complete the lesson statement: “The two most common database-level designs in SQL Server are _____ (one instance, multiple nodes, shared or replicated storage) and availability groups (multiple databases replicated to secondary replicas with synchronous or asynchronous commit).”",
      "options": [
        "test the recovery, on a schedule, with a stopwatch",
        "failover clustering",
        "RPO/RTO set by hope"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The two most common database-level designs in SQL Server are failover clustering (one instance, multiple nodes, shared or replicated storage) and availability groups (multiple databases replicated to secondary replicas with synchronous or asynchronous commit). The choice is driven by the RPO: synchronous commit protects against data loss at the cost of write latency; asynchronous commit keeps latency low but the secondary can lag, and that lag is your exposure.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Is the RPO real? Measure it”?",
      "options": [
        "A database showing hundreds of minutes since its last backup while the business believes its RPO is 15 minutes is a gap between policy and reality — exactly the kind of gap that…",
        "WAN partition, split brain",
        "Untrained recovery — backups without drills"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A database showing hundreds of minutes since its last backup while the business believes its RPO is 15 minutes is a gap between policy and reality — exactly the kind of gap that turns into a post-incident finding. Run it, alert on it, and treat the number as the real RPO until something proves otherwise.”"
    },
    {
      "question": "Complete the lesson statement: “The discipline that catches all six is the same: _____.”",
      "options": [
        "Availability is arithmetic.",
        "Internal tools",
        "test the recovery, on a schedule, with a stopwatch"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The discipline that catches all six is the same: test the recovery, on a schedule, with a stopwatch. A database that has never been restored under time pressure has an assumed RPO and an assumed RTO — and assumptions do not appear in status reports until they fail.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “_____ is the proportion of time a service is usable by its consumers, usually expressed as an uptime percentage.”",
      "options": [
        "HA mistaken for backup",
        "Failover never tested",
        "Availability"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Availability is the proportion of time a service is usable by its consumers, usually expressed as an uptime percentage. Reliability is the probability that the service performs correctly over time — no corruption, no wrong answers, no silent data loss. A database can be available and unreliable (up, but returning stale or wrong data), or reliable and unavailable (correct, but not answering).”"
    },
    {
      "question": "Which fact is covered in the lesson section “Measuring what you promised: RPO and RTO”?",
      "options": [
        "Backups remain in every design, not as availability but as the last line against everything the redundancy above cannot catch — corruption, ransomware, and the accidental DELETE…",
        "Two objectives turn a vague promise into engineering requirements:",
        "failover clustering"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Two objectives turn a vague promise into engineering requirements:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where availability actually comes from”?",
      "options": [
        "Availability is built from redundancy at every layer that can fail — and a chain is only as strong as its weakest single point:",
        "The fastest way to check whether an RPO is achievable is to look at how much data would be lost if the server failed right now.",
        "A database showing hundreds of minutes since its last backup while the business believes its RPO is 15 minutes is a gap between policy and reality — exactly the kind of gap that…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Availability is built from redundancy at every layer that can fail — and a chain is only as strong as its weakest single point:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Is the RPO real? Measure it”?",
      "options": [
        "failover clustering",
        "Backups remain in every design, not as availability but as the last line against everything the redundancy above cannot catch — corruption, ransomware, and the accidental DELETE…",
        "The fastest way to check whether an RPO is achievable is to look at how much data would be lost if the server failed right now."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The fastest way to check whether an RPO is achievable is to look at how much data would be lost if the server failed right now. For a database in FULL recovery, that is bounded by the time since the last usable backup (or replication position):”"
    },
    {
      "question": "Which fact is covered in the lesson section “Designing for failure — and the pitfalls”?",
      "options": [
        "Corruption, bad change",
        "Availability engineering has a well-worn set of failure modes, and almost all of them are organisational rather than technical:",
        "Backups remain in every design, not as availability but as the last line against everything the redundancy above cannot catch — corruption, ransomware, and the accidental DELETE…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Availability engineering has a well-worn set of failure modes, and almost all of them are organisational rather than technical:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Two words that are not synonyms”?",
      "options": [
        "Availability is arithmetic.",
        "the objective is only real if a monitor can see it.",
        "Availability engineering has a well-worn set of failure modes, and almost all of them are organisational rather than technical:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Availability is arithmetic. The table below shows what each “nine” actually costs you in allowed downtime per year — it is the language DBAs use to translate an uptime target into a maintenance budget:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Measuring what you promised: RPO and RTO”?",
      "options": [
        "WAN partition, split brain",
        "Untrained recovery — backups without drills",
        "The DBA's practical job here is to be honest about what current design delivers."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The DBA's practical job here is to be honest about what current design delivers. If log backups run every 15 minutes, the RPO is 15 minutes regardless of what the slide deck says. Measure it, publish it, and let the business decide whether that is acceptable.”"
    },
    {
      "question": "Complete the lesson statement: “The two most common database-level designs in SQL Server are _____ (one instance, multiple nodes, shared or replicated storage) and availability groups (multiple databases replicated to secondary replicas with synchronous or asynchronous commit).”",
      "options": [
        "test the recovery, on a schedule, with a stopwatch",
        "failover clustering",
        "RPO/RTO set by hope"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The two most common database-level designs in SQL Server are failover clustering (one instance, multiple nodes, shared or replicated storage) and availability groups (multiple databases replicated to secondary replicas with synchronous or asynchronous commit). The choice is driven by the RPO: synchronous commit protects against data loss at the cost of write latency; asynchronous commit keeps latency low but the secondary can lag, and that lag is your exposure.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Is the RPO real? Measure it”?",
      "options": [
        "A database showing hundreds of minutes since its last backup while the business believes its RPO is 15 minutes is a gap between policy and reality — exactly the kind of gap that…",
        "WAN partition, split brain",
        "Untrained recovery — backups without drills"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A database showing hundreds of minutes since its last backup while the business believes its RPO is 15 minutes is a gap between policy and reality — exactly the kind of gap that turns into a post-incident finding. Run it, alert on it, and treat the number as the real RPO until something proves otherwise.”"
    },
    {
      "question": "Complete the lesson statement: “The discipline that catches all six is the same: _____.”",
      "options": [
        "Availability is arithmetic.",
        "Internal tools",
        "test the recovery, on a schedule, with a stopwatch"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The discipline that catches all six is the same: test the recovery, on a schedule, with a stopwatch. A database that has never been restored under time pressure has an assumed RPO and an assumed RTO — and assumptions do not appear in status reports until they fail.”"
    }
  ],
  takeaways: [
    "Availability is uptime; reliability is correct operation — measure both, they fail differently",
    "Every uptime target implies a design, and every extra nine costs disproportionately more",
    "RPO measures data loss backwards; RTO budgets detection, decision, failover, and verification together",
    "Redundancy must cover every failure domain — and backups still cover what redundancy cannot",
    "Objectives are only real when tested: schedule timed restore and failover drills, and report the numbers"
  ]
};
