/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch17-20.html */

window.TOPIC = {
  id: "ch17-20",
  title: "DR Runbooks",

  lead: "Understanding DR Runbooks is essential for anyone responsible for disaster recovery technologies. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what DR Runbooks is and where it fits",
    "Explain how DR Runbooks works internally",
    "Apply DR Runbooks correctly in a production environment",
    "Recognise the common mistakes and risks involving DR Runbooks",
    "Monitor and troubleshoot DR Runbooks with the right tools"
  ],

  sections: [
    {
      h: "What DR Runbooks means",
      html: `
<p>In this topic we examine <strong>DR Runbooks</strong> within disaster recovery technologies. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Replication moves data via publication and subscription. Snapshot replication copies a point-in-time copy; transactional replication streams changes; merge replication reconciles changes from multiple sites. Each has distinct conflict and latency characteristics.</p>
<p>Replication agents — snapshot, log reader, distribution and merge — do the work, and their history is the primary monitoring surface. Latency, distribution database growth and agent failures are the common operational concerns.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>DR Runbooks is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where DR Runbooks fits",
      html: `
<p>Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and licensing considerations.</p>
<p>The diagram below places DR Runbooks alongside the core concepts of disaster recovery technologies. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="DR Runbooks flow">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="230" y="12" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="39" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Log shipping</text>
    <rect x="230" y="66" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="93" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Replication</text>
    <rect x="230" y="120" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="147" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. DR</text>
    <rect x="230" y="174" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="201" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Failover</text>
    <rect x="230" y="228" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="255" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Runbook</text>
    <rect x="230" y="282" width="300" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="309" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">6. Failback</text>
    <line x1="380" y1="56" x2="380" y2="66" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="110" x2="380" y2="120" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="164" x2="380" y2="174" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="218" x2="380" y2="228" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="272" x2="380" y2="282" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">DR Runbooks</text>
  </svg>
  <div class="figcaption">Figure 1 — Disaster recovery technologies: how DR Runbooks relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "DR Runbooks in practice",
      html: `
<p>A DR runbook documents the exact steps, contacts, decisions and validation for a disaster. Without it, even good technology fails under the stress of a real incident.</p>
<p>The following comparison captures the distinctions that matter most when working with DR Runbooks:</p>
<table>
  <tr><th>Technology</th><th>RPO</th><th>RTO</th></tr>
  <tr><td>Complexity</td><td>Backup/restore</td><td>Hours</td></tr>
  <tr><td>Hours</td><td>Low</td><td>Log shipping</td></tr>
  <tr><td>Minutes</td><td>Tens of minutes</td><td>Medium</td></tr>
  <tr><td>Availability Group (async)</td><td>Seconds</td><td>Minutes</td></tr>
  <tr><td>High</td></tr>
</table>
<p>Failback planning and regular DR tests complete the picture: failing over is only half the story — returning to the primary site safely, and proving the whole process in a test, are what make DR real.</p>
      `,
    },
    {
      h: "Working with DR Runbooks",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to DR Runbooks. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- DR Runbooks
-- Log shipping status in msdb
SELECT primary_server_name, primary_database_name,
       last_backup_date, last_backup_file,
       last_copied_file, last_restored_date
FROM   msdb.dbo.log_shipping_monitor_primary;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- DR Runbooks
-- Replication agent status
SELECT name, status, last_run_outcome, timestamp
FROM   distribution.dbo.MS_replication_agents;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- DR Runbooks
-- Restore a log-shipped database with recovery (failover)
RESTORE DATABASE SalesDB_DR
WITH RECOVERY;
-- then redirect application connections to the DR instance</code></pre>
<p>Disaster recovery protects against site or region loss. The choice of technology is driven by RPO/RTO and budget: backup-and-restore is cheapest with the slowest RTO, while distributed availability groups or geo-replication give near-real-time protection at higher cost and complexity.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Log shipping backs up the transaction log on a primary, copies it to one or more secondaries and restores it there on a schedule. It is simple, robust and well understood, with RTO determined by the restore interval and manual failover steps.</p>
<table>
  <tr><th>Replication type</th><th>Direction</th><th>Use case</th></tr>
  <tr><td>Snapshot</td><td>One-way point-in-time</td><td>Small / static data</td></tr>
  <tr><td>Transactional</td><td>One-way near real-time</td><td>Reporting / distribution</td></tr>
  <tr><td>Merge</td><td>Bi-directional</td><td>Disconnected sites</td></tr>
</table>
<p>A log-shipping configuration has three jobs per secondary: backup on the primary, copy to the secondary and restore with STANDBY or NORECOVERY. A monitor server can centralise status. Failover is manual and must be rehearsed.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With DR Runbooks, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: DR Runbooks",
      html: `
<p>This section consolidates <strong>DR Runbooks</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>A DR runbook documents the exact steps, contacts, decisions and validation for a disaster. Without it, even good technology fails under the stress of a real incident.</p>
<p>Failback planning and regular DR tests complete the picture: failing over is only half the story — returning to the primary site safely, and proving the whole process in a test, are what make DR real.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>DR Runbooks sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Replication type</th><th>Direction</th><th>Use case</th></tr>
  <tr><td>Snapshot</td><td>One-way point-in-time</td><td>Small / static data</td></tr>
  <tr><td>Transactional</td><td>One-way near real-time</td><td>Reporting / distribution</td></tr>
  <tr><td>Merge</td><td>Bi-directional</td><td>Disconnected sites</td></tr>
</table>
<p>Disaster recovery protects against site or region loss. The choice of technology is driven by RPO/RTO and budget: backup-and-restore is cheapest with the slowest RTO, while distributed availability groups or geo-replication give near-real-time protection at higher cost and complexity.</p>
<p>Use the following as a starting point when investigating DR Runbooks. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- DR Runbooks
-- Log shipping status in msdb
SELECT primary_server_name, primary_database_name,
       last_backup_date, last_backup_file,
       last_copied_file, last_restored_date
FROM   msdb.dbo.log_shipping_monitor_primary;</code></pre>
<p>Log shipping backs up the transaction log on a primary, copies it to one or more secondaries and restores it there on a schedule. It is simple, robust and well understood, with RTO determined by the restore interval and manual failover steps.</p>
      `,
    }
  ],

  scenario: {
    title: "Replication latency at month end",
    html: `
A transactional replication subscriber lagged hours behind during a bulk month-end load, and reports showed stale data. The DBA tuned the distribution agent, checked the distribution database size and indexed the published tables. Monitoring latency as a first-class metric prevented surprise.
<p><strong>The DR Runbooks lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "What is the difference between transactional and merge replication?",
      a: `
Transactional replication streams changes one-way from publisher to subscribers with low latency; merge replication allows changes at multiple sites and reconciles them, with conflict resolution required.
      `,
    },
    {
      q: "Why must DR be tested, not just configured?",
      a: `
Because configuration drifts, paths change and jobs fail silently; only a timed test proves the runbook works and the RPO/RTO can actually be met under pressure.
      `,
    },
    {
      q: "How does log shipping achieve DR and what are its limits?",
      a: `
It periodically backs up, copies and restores logs to a secondary, giving a warm standby; failover is manual and RPO/RTO depend on the schedule, and the secondary is usually not readable during restores without STANDBY.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within disaster recovery technologies.”",
      "options": [
        "Disconnected sites",
        "DR Runbooks",
        "Reporting / distribution"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine DR Runbooks within disaster recovery technologies. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DR Runbooks fits”?",
      "options": [
        "Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and…",
        "DR Runbooks sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and licensing considerations.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DR Runbooks in practice”?",
      "options": [
        "Log shipping",
        "Medium",
        "A DR runbook documents the exact steps, contacts, decisions and validation for a disaster."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A DR runbook documents the exact steps, contacts, decisions and validation for a disaster. Without it, even good technology fails under the stress of a real incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DR Runbooks”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to DR Runbooks. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Log shipping backs up the transaction log on a primary, copies it to one or more secondaries and restores it there on a schedule.",
        "With DR Runbooks, prefer measured, reversible changes.",
        "DR Runbooks"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Log shipping backs up the transaction log on a primary, copies it to one or more secondaries and restores it there on a schedule. It is simple, robust and well understood, with RTO determined by the restore interval and manual failover steps.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Replication moves data via publication and subscription.",
        "Replication agents — snapshot, log reader, distribution and merge — do the work, and their history is the primary monitoring surface.",
        "DR Runbooks"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates DR Runbooks with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What DR Runbooks means”?",
      "options": [
        "A DR runbook documents the exact steps, contacts, decisions and validation for a disaster.",
        "Replication moves data via publication and subscription.",
        "The diagram below places DR Runbooks alongside the core concepts of disaster recovery technologies."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Replication moves data via publication and subscription. Snapshot replication copies a point-in-time copy; transactional replication streams changes; merge replication reconciles changes from multiple sites. Each has distinct conflict and latency characteristics.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DR Runbooks fits”?",
      "options": [
        "The diagram below places DR Runbooks alongside the core concepts of disaster recovery technologies.",
        "Replication agents — snapshot, log reader, distribution and merge — do the work, and their history is the primary monitoring surface.",
        "DR Runbooks is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places DR Runbooks alongside the core concepts of disaster recovery technologies. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DR Runbooks in practice”?",
      "options": [
        "DR Runbooks is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.",
        "Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and…",
        "The following comparison captures the distinctions that matter most when working with DR Runbooks:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with DR Runbooks:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DR Runbooks”?",
      "options": [
        "The diagram below places DR Runbooks alongside the core concepts of disaster recovery technologies.",
        "The first example establishes the relevant state.",
        "Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within disaster recovery technologies.”",
      "options": [
        "Disconnected sites",
        "DR Runbooks",
        "Reporting / distribution"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine DR Runbooks within disaster recovery technologies. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DR Runbooks fits”?",
      "options": [
        "Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and…",
        "DR Runbooks sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and licensing considerations.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DR Runbooks in practice”?",
      "options": [
        "Log shipping",
        "Medium",
        "A DR runbook documents the exact steps, contacts, decisions and validation for a disaster."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A DR runbook documents the exact steps, contacts, decisions and validation for a disaster. Without it, even good technology fails under the stress of a real incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DR Runbooks”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to DR Runbooks. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Log shipping backs up the transaction log on a primary, copies it to one or more secondaries and restores it there on a schedule.",
        "With DR Runbooks, prefer measured, reversible changes.",
        "DR Runbooks"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Log shipping backs up the transaction log on a primary, copies it to one or more secondaries and restores it there on a schedule. It is simple, robust and well understood, with RTO determined by the restore interval and manual failover steps.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Replication moves data via publication and subscription.",
        "Replication agents — snapshot, log reader, distribution and merge — do the work, and their history is the primary monitoring surface.",
        "DR Runbooks"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates DR Runbooks with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What DR Runbooks means”?",
      "options": [
        "A DR runbook documents the exact steps, contacts, decisions and validation for a disaster.",
        "Replication moves data via publication and subscription.",
        "The diagram below places DR Runbooks alongside the core concepts of disaster recovery technologies."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Replication moves data via publication and subscription. Snapshot replication copies a point-in-time copy; transactional replication streams changes; merge replication reconciles changes from multiple sites. Each has distinct conflict and latency characteristics.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DR Runbooks fits”?",
      "options": [
        "The diagram below places DR Runbooks alongside the core concepts of disaster recovery technologies.",
        "Replication agents — snapshot, log reader, distribution and merge — do the work, and their history is the primary monitoring surface.",
        "DR Runbooks is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places DR Runbooks alongside the core concepts of disaster recovery technologies. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DR Runbooks in practice”?",
      "options": [
        "DR Runbooks is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.",
        "Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and…",
        "The following comparison captures the distinctions that matter most when working with DR Runbooks:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with DR Runbooks:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DR Runbooks”?",
      "options": [
        "The diagram below places DR Runbooks alongside the core concepts of disaster recovery technologies.",
        "The first example establishes the relevant state.",
        "Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within disaster recovery technologies.”",
      "options": [
        "Disconnected sites",
        "DR Runbooks",
        "Reporting / distribution"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine DR Runbooks within disaster recovery technologies. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DR Runbooks fits”?",
      "options": [
        "Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and…",
        "DR Runbooks sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and licensing considerations.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DR Runbooks in practice”?",
      "options": [
        "Log shipping",
        "Medium",
        "A DR runbook documents the exact steps, contacts, decisions and validation for a disaster."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A DR runbook documents the exact steps, contacts, decisions and validation for a disaster. Without it, even good technology fails under the stress of a real incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DR Runbooks”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to DR Runbooks. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Log shipping backs up the transaction log on a primary, copies it to one or more secondaries and restores it there on a schedule.",
        "With DR Runbooks, prefer measured, reversible changes.",
        "DR Runbooks"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Log shipping backs up the transaction log on a primary, copies it to one or more secondaries and restores it there on a schedule. It is simple, robust and well understood, with RTO determined by the restore interval and manual failover steps.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Replication moves data via publication and subscription.",
        "Replication agents — snapshot, log reader, distribution and merge — do the work, and their history is the primary monitoring surface.",
        "DR Runbooks"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates DR Runbooks with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What DR Runbooks means”?",
      "options": [
        "A DR runbook documents the exact steps, contacts, decisions and validation for a disaster.",
        "Replication moves data via publication and subscription.",
        "The diagram below places DR Runbooks alongside the core concepts of disaster recovery technologies."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Replication moves data via publication and subscription. Snapshot replication copies a point-in-time copy; transactional replication streams changes; merge replication reconciles changes from multiple sites. Each has distinct conflict and latency characteristics.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DR Runbooks fits”?",
      "options": [
        "The diagram below places DR Runbooks alongside the core concepts of disaster recovery technologies.",
        "Replication agents — snapshot, log reader, distribution and merge — do the work, and their history is the primary monitoring surface.",
        "DR Runbooks is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places DR Runbooks alongside the core concepts of disaster recovery technologies. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DR Runbooks in practice”?",
      "options": [
        "DR Runbooks is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.",
        "Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and…",
        "The following comparison captures the distinctions that matter most when working with DR Runbooks:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with DR Runbooks:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DR Runbooks”?",
      "options": [
        "The diagram below places DR Runbooks alongside the core concepts of disaster recovery technologies.",
        "The first example establishes the relevant state.",
        "Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "DR Runbooks is a fundamental concept in disaster recovery technologies",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of DR Runbooks improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
