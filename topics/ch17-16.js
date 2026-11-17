/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch17-16.html */

window.TOPIC = {
  id: "ch17-16",
  title: "Replication Monitoring",

  lead: "Replication Monitoring is a core part of disaster recovery technologies. This topic explains what it is, how it works inside SQL Server, and what a production DBA must know to operate it safely.",

  objectives: [
    "Define what Replication Monitoring is and where it fits",
    "Explain how Replication Monitoring works internally",
    "Apply Replication Monitoring correctly in a production environment",
    "Recognise the common mistakes and risks involving Replication Monitoring",
    "Monitor and troubleshoot Replication Monitoring with the right tools"
  ],

  sections: [
    {
      h: "What Replication Monitoring means",
      html: `
<p>In this topic we examine <strong>Replication Monitoring</strong> within disaster recovery technologies. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Failback planning and regular DR tests complete the picture: failing over is only half the story — returning to the primary site safely, and proving the whole process in a test, are what make DR real.</p>
<p>Disaster recovery protects against site or region loss. The choice of technology is driven by RPO/RTO and budget: backup-and-restore is cheapest with the slowest RTO, while distributed availability groups or geo-replication give near-real-time protection at higher cost and complexity.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Replication Monitoring is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Replication Monitoring fits",
      html: `
<p>Log shipping backs up the transaction log on a primary, copies it to one or more secondaries and restores it there on a schedule. It is simple, robust and well understood, with RTO determined by the restore interval and manual failover steps.</p>
<p>The diagram below places Replication Monitoring alongside the core concepts of disaster recovery technologies. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Replication Monitoring concept map">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="280" y="140" width="200" height="60" rx="9" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="175" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Replication Monitoring</text>
    <rect x="24" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Log shipping</text>
    <text x="124" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 1</text>
    <rect x="536" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Replication</text>
    <text x="636" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 2</text>
    <rect x="24" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">DR</text>
    <text x="124" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 3</text>
    <rect x="536" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Failover</text>
    <text x="636" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 4</text>
    <rect x="24" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Runbook</text>
    <text x="124" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 5</text>
    <rect x="536" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Failback</text>
    <text x="636" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 6</text>
    <line x1="380" y1="170" x2="124" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
  </svg>
  <div class="figcaption">Figure 1 — Disaster recovery technologies: how Replication Monitoring relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Replication Monitoring in practice",
      html: `
<p>A log-shipping configuration has three jobs per secondary: backup on the primary, copy to the secondary and restore with STANDBY or NORECOVERY. A monitor server can centralise status. Failover is manual and must be rehearsed.</p>
<p>The following comparison captures the distinctions that matter most when working with Replication Monitoring:</p>
<table>
  <tr><th>Technology</th><th>RPO</th><th>RTO</th></tr>
  <tr><td>Complexity</td><td>Backup/restore</td><td>Hours</td></tr>
  <tr><td>Hours</td><td>Low</td><td>Log shipping</td></tr>
  <tr><td>Minutes</td><td>Tens of minutes</td><td>Medium</td></tr>
  <tr><td>Availability Group (async)</td><td>Seconds</td><td>Minutes</td></tr>
  <tr><td>High</td></tr>
</table>
<p>Replication moves data via publication and subscription. Snapshot replication copies a point-in-time copy; transactional replication streams changes; merge replication reconciles changes from multiple sites. Each has distinct conflict and latency characteristics.</p>
      `,
    },
    {
      h: "Working with Replication Monitoring",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Replication Monitoring. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Replication Monitoring
-- Log shipping status in msdb
SELECT primary_server_name, primary_database_name,
       last_backup_date, last_backup_file,
       last_copied_file, last_restored_date
FROM   msdb.dbo.log_shipping_monitor_primary;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Replication Monitoring
-- Replication agent status
SELECT name, status, last_run_outcome, timestamp
FROM   distribution.dbo.MS_replication_agents;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Replication Monitoring
-- Restore a log-shipped database with recovery (failover)
RESTORE DATABASE SalesDB_DR
WITH RECOVERY;
-- then redirect application connections to the DR instance</code></pre>
<p>Replication agents — snapshot, log reader, distribution and merge — do the work, and their history is the primary monitoring surface. Latency, distribution database growth and agent failures are the common operational concerns.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and licensing considerations.</p>
<table>
  <tr><th>Replication type</th><th>Direction</th><th>Use case</th></tr>
  <tr><td>Snapshot</td><td>One-way point-in-time</td><td>Small / static data</td></tr>
  <tr><td>Transactional</td><td>One-way near real-time</td><td>Reporting / distribution</td></tr>
  <tr><td>Merge</td><td>Bi-directional</td><td>Disconnected sites</td></tr>
</table>
<p>A DR runbook documents the exact steps, contacts, decisions and validation for a disaster. Without it, even good technology fails under the stress of a real incident.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Replication Monitoring, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Replication Monitoring",
      html: `
<p>This section consolidates <strong>Replication Monitoring</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>A log-shipping configuration has three jobs per secondary: backup on the primary, copy to the secondary and restore with STANDBY or NORECOVERY. A monitor server can centralise status. Failover is manual and must be rehearsed.</p>
<p>Replication moves data via publication and subscription. Snapshot replication copies a point-in-time copy; transactional replication streams changes; merge replication reconciles changes from multiple sites. Each has distinct conflict and latency characteristics.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Replication Monitoring sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Replication type</th><th>Direction</th><th>Use case</th></tr>
  <tr><td>Snapshot</td><td>One-way point-in-time</td><td>Small / static data</td></tr>
  <tr><td>Transactional</td><td>One-way near real-time</td><td>Reporting / distribution</td></tr>
  <tr><td>Merge</td><td>Bi-directional</td><td>Disconnected sites</td></tr>
</table>
<p>Replication agents — snapshot, log reader, distribution and merge — do the work, and their history is the primary monitoring surface. Latency, distribution database growth and agent failures are the common operational concerns.</p>
<p>Use the following as a starting point when investigating Replication Monitoring. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Replication Monitoring
-- Restore a log-shipped database with recovery (failover)
RESTORE DATABASE SalesDB_DR
WITH RECOVERY;
-- then redirect application connections to the DR instance</code></pre>
<p>Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and licensing considerations.</p>
      `,
    }
  ],

  scenario: {
    title: "Replication latency at month end",
    html: `
A transactional replication subscriber lagged hours behind during a bulk month-end load, and reports showed stale data. The DBA tuned the distribution agent, checked the distribution database size and indexed the published tables. Monitoring latency as a first-class metric prevented surprise.
<p><strong>The Replication Monitoring lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "How does log shipping achieve DR and what are its limits?",
      a: `
It periodically backs up, copies and restores logs to a secondary, giving a warm standby; failover is manual and RPO/RTO depend on the schedule, and the secondary is usually not readable during restores without STANDBY.
      `,
    },
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
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within disaster recovery technologies.”",
      "options": [
        "Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and…",
        "A DR runbook documents the exact steps, contacts, decisions and validation for a disaster.",
        "Replication Monitoring"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Replication Monitoring within disaster recovery technologies. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Replication Monitoring fits”?",
      "options": [
        "Small / static data",
        "Log shipping backs up the transaction log on a primary, copies it to one or more secondaries and restores it there on a schedule.",
        "With Replication Monitoring, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Log shipping backs up the transaction log on a primary, copies it to one or more secondaries and restores it there on a schedule. It is simple, robust and well understood, with RTO determined by the restore interval and manual failover steps.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Replication Monitoring in practice”?",
      "options": [
        "A log-shipping configuration has three jobs per secondary: backup on the primary, copy to the secondary and restore with STANDBY or NORECOVERY.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Replication Monitoring."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A log-shipping configuration has three jobs per secondary: backup on the primary, copy to the secondary and restore with STANDBY or NORECOVERY. A monitor server can centralise status. Failover is manual and must be rehearsed.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Replication Monitoring”?",
      "options": [
        "Replication Monitoring sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Replication Monitoring. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Reporting / distribution",
        "Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and…",
        "Small / static data"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and licensing considerations.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Replication Monitoring",
        "Disconnected sites",
        "Replication Monitoring sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “This section consolidates Replication Monitoring with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Replication Monitoring means”?",
      "options": [
        "Use the following as a starting point when investigating Replication Monitoring.",
        "Disaster recovery protects against site or region loss.",
        "Failback planning and regular DR tests complete the picture: failing over is only half the story — returning to the primary site safely, and proving the whole process in a test,…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Failback planning and regular DR tests complete the picture: failing over is only half the story — returning to the primary site safely, and proving the whole process in a test, are what make DR real.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Replication Monitoring fits”?",
      "options": [
        "Log shipping backs up the transaction log on a primary, copies it to one or more secondaries and restores it there on a schedule.",
        "The diagram below places Replication Monitoring alongside the core concepts of disaster recovery technologies.",
        "Use the following as a starting point when investigating Replication Monitoring."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The diagram below places Replication Monitoring alongside the core concepts of disaster recovery technologies. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Replication Monitoring in practice”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Replication Monitoring:",
        "Minutes",
        "Replication Monitoring"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Replication Monitoring:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Replication Monitoring”?",
      "options": [
        "Replication Monitoring",
        "Failback planning and regular DR tests complete the picture: failing over is only half the story — returning to the primary site safely, and proving the whole process in a test,…",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within disaster recovery technologies.”",
      "options": [
        "Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and…",
        "A DR runbook documents the exact steps, contacts, decisions and validation for a disaster.",
        "Replication Monitoring"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Replication Monitoring within disaster recovery technologies. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Replication Monitoring fits”?",
      "options": [
        "Small / static data",
        "Log shipping backs up the transaction log on a primary, copies it to one or more secondaries and restores it there on a schedule.",
        "With Replication Monitoring, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Log shipping backs up the transaction log on a primary, copies it to one or more secondaries and restores it there on a schedule. It is simple, robust and well understood, with RTO determined by the restore interval and manual failover steps.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Replication Monitoring in practice”?",
      "options": [
        "A log-shipping configuration has three jobs per secondary: backup on the primary, copy to the secondary and restore with STANDBY or NORECOVERY.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Replication Monitoring."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A log-shipping configuration has three jobs per secondary: backup on the primary, copy to the secondary and restore with STANDBY or NORECOVERY. A monitor server can centralise status. Failover is manual and must be rehearsed.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Replication Monitoring”?",
      "options": [
        "Replication Monitoring sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Replication Monitoring. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Reporting / distribution",
        "Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and…",
        "Small / static data"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and licensing considerations.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Replication Monitoring",
        "Disconnected sites",
        "Replication Monitoring sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “This section consolidates Replication Monitoring with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Replication Monitoring means”?",
      "options": [
        "Use the following as a starting point when investigating Replication Monitoring.",
        "Disaster recovery protects against site or region loss.",
        "Failback planning and regular DR tests complete the picture: failing over is only half the story — returning to the primary site safely, and proving the whole process in a test,…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Failback planning and regular DR tests complete the picture: failing over is only half the story — returning to the primary site safely, and proving the whole process in a test, are what make DR real.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Replication Monitoring fits”?",
      "options": [
        "Log shipping backs up the transaction log on a primary, copies it to one or more secondaries and restores it there on a schedule.",
        "The diagram below places Replication Monitoring alongside the core concepts of disaster recovery technologies.",
        "Use the following as a starting point when investigating Replication Monitoring."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The diagram below places Replication Monitoring alongside the core concepts of disaster recovery technologies. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Replication Monitoring in practice”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Replication Monitoring:",
        "Minutes",
        "Replication Monitoring"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Replication Monitoring:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Replication Monitoring”?",
      "options": [
        "Replication Monitoring",
        "Failback planning and regular DR tests complete the picture: failing over is only half the story — returning to the primary site safely, and proving the whole process in a test,…",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within disaster recovery technologies.”",
      "options": [
        "Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and…",
        "A DR runbook documents the exact steps, contacts, decisions and validation for a disaster.",
        "Replication Monitoring"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Replication Monitoring within disaster recovery technologies. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Replication Monitoring fits”?",
      "options": [
        "Small / static data",
        "Log shipping backs up the transaction log on a primary, copies it to one or more secondaries and restores it there on a schedule.",
        "With Replication Monitoring, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Log shipping backs up the transaction log on a primary, copies it to one or more secondaries and restores it there on a schedule. It is simple, robust and well understood, with RTO determined by the restore interval and manual failover steps.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Replication Monitoring in practice”?",
      "options": [
        "A log-shipping configuration has three jobs per secondary: backup on the primary, copy to the secondary and restore with STANDBY or NORECOVERY.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Replication Monitoring."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A log-shipping configuration has three jobs per secondary: backup on the primary, copy to the secondary and restore with STANDBY or NORECOVERY. A monitor server can centralise status. Failover is manual and must be rehearsed.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Replication Monitoring”?",
      "options": [
        "Replication Monitoring sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Replication Monitoring. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Reporting / distribution",
        "Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and…",
        "Small / static data"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Always On Availability Groups can extend DR across regions with asynchronous replicas in a remote site, giving a warm standby with modern tooling, at the cost of network and licensing considerations.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Replication Monitoring",
        "Disconnected sites",
        "Replication Monitoring sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “This section consolidates Replication Monitoring with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Replication Monitoring means”?",
      "options": [
        "Use the following as a starting point when investigating Replication Monitoring.",
        "Disaster recovery protects against site or region loss.",
        "Failback planning and regular DR tests complete the picture: failing over is only half the story — returning to the primary site safely, and proving the whole process in a test,…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Failback planning and regular DR tests complete the picture: failing over is only half the story — returning to the primary site safely, and proving the whole process in a test, are what make DR real.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Replication Monitoring fits”?",
      "options": [
        "Log shipping backs up the transaction log on a primary, copies it to one or more secondaries and restores it there on a schedule.",
        "The diagram below places Replication Monitoring alongside the core concepts of disaster recovery technologies.",
        "Use the following as a starting point when investigating Replication Monitoring."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The diagram below places Replication Monitoring alongside the core concepts of disaster recovery technologies. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Replication Monitoring in practice”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Replication Monitoring:",
        "Minutes",
        "Replication Monitoring"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Replication Monitoring:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Replication Monitoring”?",
      "options": [
        "Replication Monitoring",
        "Failback planning and regular DR tests complete the picture: failing over is only half the story — returning to the primary site safely, and proving the whole process in a test,…",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Replication Monitoring is a fundamental concept in disaster recovery technologies",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Replication Monitoring improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
