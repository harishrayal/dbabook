/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch20-21.html */

window.TOPIC = {
  id: "ch20-21",
  title: "SLA Management",

  lead: "This topic covers SLA Management — a concept you will meet repeatedly when working with enterprise DBA operations. We build from first principles to production guidance.",

  objectives: [
    "Define what SLA Management is and where it fits",
    "Explain how SLA Management works internally",
    "Apply SLA Management correctly in a production environment",
    "Recognise the common mistakes and risks involving SLA Management",
    "Monitor and troubleshoot SLA Management with the right tools"
  ],

  sections: [
    {
      h: "What SLA Management means",
      html: `
<p>In this topic we examine <strong>SLA Management</strong> within enterprise DBA operations. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Patching and upgrades are planned programmes. Cumulative updates, service packs and version upgrades need testing in lower environments, a rollback plan, compatibility checks and a maintenance window.</p>
<p>Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies. Cross-server work must account for logins, linked servers, agent jobs and application connection strings.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>SLA Management is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where SLA Management fits",
      html: `
<p>Reporting is how an enterprise DBA demonstrates control: health-check, backup-compliance, capacity and performance reports provide evidence for SLAs and audits.</p>
<p>The diagram below places SLA Management alongside the core concepts of enterprise DBA operations. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="SLA Management layers">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="70" y="8" width="620" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="30" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Estate</text>
    <text x="380" y="50" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 1</text>
    <rect x="100" y="62" width="560" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="84" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Change</text>
    <text x="380" y="104" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 2</text>
    <rect x="130" y="116" width="500" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="138" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Patch</text>
    <text x="380" y="158" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 3</text>
    <rect x="160" y="170" width="440" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="192" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Migration</text>
    <text x="380" y="212" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 4</text>
    <rect x="190" y="224" width="380" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="246" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">SLA</text>
    <text x="380" y="266" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 5</text>
    <rect x="220" y="278" width="320" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="300" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Compliance</text>
    <text x="380" y="320" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 6</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">SLA Management</text>
  </svg>
  <div class="figcaption">Figure 1 — Enterprise DBA operations: how SLA Management relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "SLA Management in practice",
      html: `
<p>SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations. Daily, weekly and monthly routines keep the estate stable and the evidence current.</p>
<p>The following comparison captures the distinctions that matter most when working with SLA Management:</p>
<table>
  <tr><th>Operation</th><th>Cadence</th><th>Evidence</th></tr>
  <tr><td>Health check</td><td>Daily</td><td>Report + exceptions</td></tr>
  <tr><td>Backup compliance</td><td>Daily</td><td>Last backup per DB</td></tr>
  <tr><td>Capacity review</td><td>Weekly / monthly</td><td>Growth trend</td></tr>
</table>
<p>Enterprise DBA work shifts from single servers to a governed estate of many instances across environments and regions. Scale makes standardisation, automation and documentation essential rather than optional.</p>
      `,
    },
    {
      h: "Working with SLA Management",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SLA Management. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- SLA Management
-- Estate inventory across a registered server group (run per instance)
SELECT @@SERVERNAME AS server,
       SERVERPROPERTY('ProductVersion') AS version,
       SERVERPROPERTY('Edition') AS edition,
       name, state_desc, recovery_model_desc
FROM sys.databases
ORDER BY name;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- SLA Management
-- Backup compliance across the estate
SELECT @@SERVERNAME AS server, d.name AS db,
       d.recovery_model_desc,
       max(b.backup_finish_date) AS last_full
FROM sys.databases d
LEFT JOIN msdb.dbo.backupset b
  ON b.database_name=d.name AND b.type='D'
GROUP BY d.name, d.recovery_model_desc;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- SLA Management
-- Compatibility levels before an upgrade
SELECT name, compatibility_level
FROM sys.databases
WHERE compatibility_level < 150;</code></pre>
<p>Managing multiple instances requires a central inventory: versions, editions, patch levels, owners, databases, sizes and dependencies. Without it, you cannot answer basic questions during an audit or incident.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Environments must stay aligned but distinct. Refreshing test and UAT from production (sanitised) keeps schemas realistic, while access controls ensure only the right people can reach live data.</p>
<table>
  <tr><th>Change type</th><th>Approval</th><th>Window</th></tr>
  <tr><td>Schema deploy</td><td>Peer review + CAB</td><td>Scheduled</td></tr>
  <tr><td>Patch / CU</td><td>Tested + CAB</td><td>Maintenance</td></tr>
  <tr><td>Emergency fix</td><td>Retrospective</td><td>Immediate</td></tr>
</table>
<p>Change management governs every production change: request, review, approval, scheduled window, implementation and verification. Emergency changes have a fast path but still require recording and retrospective approval.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With SLA Management, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: SLA Management",
      html: `
<p>This section consolidates <strong>SLA Management</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations. Daily, weekly and monthly routines keep the estate stable and the evidence current.</p>
<p>Enterprise DBA work shifts from single servers to a governed estate of many instances across environments and regions. Scale makes standardisation, automation and documentation essential rather than optional.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>SLA Management sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Operation</th><th>Cadence</th><th>Evidence</th></tr>
  <tr><td>Health check</td><td>Daily</td><td>Report + exceptions</td></tr>
  <tr><td>Backup compliance</td><td>Daily</td><td>Last backup per DB</td></tr>
  <tr><td>Capacity review</td><td>Weekly / monthly</td><td>Growth trend</td></tr>
</table>
<p>Managing multiple instances requires a central inventory: versions, editions, patch levels, owners, databases, sizes and dependencies. Without it, you cannot answer basic questions during an audit or incident.</p>
<p>Use the following as a starting point when investigating SLA Management. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- SLA Management
-- Backup compliance across the estate
SELECT @@SERVERNAME AS server, d.name AS db,
       d.recovery_model_desc,
       max(b.backup_finish_date) AS last_full
FROM sys.databases d
LEFT JOIN msdb.dbo.backupset b
  ON b.database_name=d.name AND b.type='D'
GROUP BY d.name, d.recovery_model_desc;</code></pre>
<p>Environments must stay aligned but distinct. Refreshing test and UAT from production (sanitised) keeps schemas realistic, while access controls ensure only the right people can reach live data.</p>
      `,
    }
  ],

  scenario: {
    title: "The unpatched instance found in an audit",
    html: `
An audit discovered an instance two cumulative updates behind with a known security vulnerability — nobody knew it existed because it was missing from the inventory. The DBA built a central inventory, a patch baseline and a monthly compliance report, then brought the instance up to date through the change process.
<p><strong>The SLA Management lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "What do you report to demonstrate SLA and compliance?",
      a: `
Uptime, backup success and restore-test results, RPO/RTO adherence, patch levels, job success rates, capacity trends and open incidents — with evidence retained for auditors.
      `,
    },
    {
      q: "How do you manage a large SQL Server estate?",
      a: `
With a central inventory, standard configurations, automated health and compliance reporting, documented change control and runbooks — scale demands consistency and evidence.
      `,
    },
    {
      q: "What is the role of change management?",
      a: `
To ensure every production change is requested, reviewed, approved, scheduled, implemented and verified, with an emergency path that is recorded and retrospectively approved.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within enterprise DBA operations.”",
      "options": [
        "SLA Management",
        "SLA Management sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine SLA Management within enterprise DBA operations. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SLA Management fits”?",
      "options": [
        "Use the following as a starting point when investigating SLA Management.",
        "The diagram below places SLA Management alongside the core concepts of enterprise DBA operations.",
        "Reporting is how an enterprise DBA demonstrates control: health-check, backup-compliance, capacity and performance reports provide evidence for SLAs and audits."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Reporting is how an enterprise DBA demonstrates control: health-check, backup-compliance, capacity and performance reports provide evidence for SLAs and audits.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SLA Management in practice”?",
      "options": [
        "SLA Management",
        "SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations.",
        "The following comparison captures the distinctions that matter most when working with SLA Management:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations. Daily, weekly and monthly routines keep the estate stable and the evidence current.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SLA Management”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "SLA Management",
        "Patching and upgrades are planned programmes."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SLA Management. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Patching and upgrades are planned programmes.",
        "Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies.",
        "Environments must stay aligned but distinct."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Environments must stay aligned but distinct. Refreshing test and UAT from production (sanitised) keeps schemas realistic, while access controls ensure only the right people can reach live data.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Reporting is how an enterprise DBA demonstrates control: health-check, backup-compliance, capacity and performance reports provide evidence for SLAs and audits.",
        "SLA Management",
        "SLA Management is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates SLA Management with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SLA Management means”?",
      "options": [
        "Patching and upgrades are planned programmes.",
        "The following comparison captures the distinctions that matter most when working with SLA Management:",
        "Enterprise DBA work shifts from single servers to a governed estate of many instances across environments and regions."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Patching and upgrades are planned programmes. Cumulative updates, service packs and version upgrades need testing in lower environments, a rollback plan, compatibility checks and a maintenance window.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SLA Management fits”?",
      "options": [
        "SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations.",
        "The following comparison captures the distinctions that matter most when working with SLA Management:",
        "The diagram below places SLA Management alongside the core concepts of enterprise DBA operations."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places SLA Management alongside the core concepts of enterprise DBA operations. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SLA Management in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The following comparison captures the distinctions that matter most when working with SLA Management:",
        "The diagram below places SLA Management alongside the core concepts of enterprise DBA operations."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SLA Management:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SLA Management”?",
      "options": [
        "The first example establishes the relevant state.",
        "SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations.",
        "The following comparison captures the distinctions that matter most when working with SLA Management:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within enterprise DBA operations.”",
      "options": [
        "SLA Management",
        "SLA Management sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine SLA Management within enterprise DBA operations. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SLA Management fits”?",
      "options": [
        "Use the following as a starting point when investigating SLA Management.",
        "The diagram below places SLA Management alongside the core concepts of enterprise DBA operations.",
        "Reporting is how an enterprise DBA demonstrates control: health-check, backup-compliance, capacity and performance reports provide evidence for SLAs and audits."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Reporting is how an enterprise DBA demonstrates control: health-check, backup-compliance, capacity and performance reports provide evidence for SLAs and audits.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SLA Management in practice”?",
      "options": [
        "SLA Management",
        "SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations.",
        "The following comparison captures the distinctions that matter most when working with SLA Management:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations. Daily, weekly and monthly routines keep the estate stable and the evidence current.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SLA Management”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "SLA Management",
        "Patching and upgrades are planned programmes."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SLA Management. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Patching and upgrades are planned programmes.",
        "Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies.",
        "Environments must stay aligned but distinct."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Environments must stay aligned but distinct. Refreshing test and UAT from production (sanitised) keeps schemas realistic, while access controls ensure only the right people can reach live data.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Reporting is how an enterprise DBA demonstrates control: health-check, backup-compliance, capacity and performance reports provide evidence for SLAs and audits.",
        "SLA Management",
        "SLA Management is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates SLA Management with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SLA Management means”?",
      "options": [
        "Patching and upgrades are planned programmes.",
        "The following comparison captures the distinctions that matter most when working with SLA Management:",
        "Enterprise DBA work shifts from single servers to a governed estate of many instances across environments and regions."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Patching and upgrades are planned programmes. Cumulative updates, service packs and version upgrades need testing in lower environments, a rollback plan, compatibility checks and a maintenance window.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SLA Management fits”?",
      "options": [
        "SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations.",
        "The following comparison captures the distinctions that matter most when working with SLA Management:",
        "The diagram below places SLA Management alongside the core concepts of enterprise DBA operations."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places SLA Management alongside the core concepts of enterprise DBA operations. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SLA Management in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The following comparison captures the distinctions that matter most when working with SLA Management:",
        "The diagram below places SLA Management alongside the core concepts of enterprise DBA operations."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SLA Management:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SLA Management”?",
      "options": [
        "The first example establishes the relevant state.",
        "SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations.",
        "The following comparison captures the distinctions that matter most when working with SLA Management:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within enterprise DBA operations.”",
      "options": [
        "SLA Management",
        "SLA Management sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine SLA Management within enterprise DBA operations. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SLA Management fits”?",
      "options": [
        "Use the following as a starting point when investigating SLA Management.",
        "The diagram below places SLA Management alongside the core concepts of enterprise DBA operations.",
        "Reporting is how an enterprise DBA demonstrates control: health-check, backup-compliance, capacity and performance reports provide evidence for SLAs and audits."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Reporting is how an enterprise DBA demonstrates control: health-check, backup-compliance, capacity and performance reports provide evidence for SLAs and audits.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SLA Management in practice”?",
      "options": [
        "SLA Management",
        "SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations.",
        "The following comparison captures the distinctions that matter most when working with SLA Management:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations. Daily, weekly and monthly routines keep the estate stable and the evidence current.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SLA Management”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "SLA Management",
        "Patching and upgrades are planned programmes."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SLA Management. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Patching and upgrades are planned programmes.",
        "Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies.",
        "Environments must stay aligned but distinct."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Environments must stay aligned but distinct. Refreshing test and UAT from production (sanitised) keeps schemas realistic, while access controls ensure only the right people can reach live data.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Reporting is how an enterprise DBA demonstrates control: health-check, backup-compliance, capacity and performance reports provide evidence for SLAs and audits.",
        "SLA Management",
        "SLA Management is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates SLA Management with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SLA Management means”?",
      "options": [
        "Patching and upgrades are planned programmes.",
        "The following comparison captures the distinctions that matter most when working with SLA Management:",
        "Enterprise DBA work shifts from single servers to a governed estate of many instances across environments and regions."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Patching and upgrades are planned programmes. Cumulative updates, service packs and version upgrades need testing in lower environments, a rollback plan, compatibility checks and a maintenance window.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SLA Management fits”?",
      "options": [
        "SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations.",
        "The following comparison captures the distinctions that matter most when working with SLA Management:",
        "The diagram below places SLA Management alongside the core concepts of enterprise DBA operations."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places SLA Management alongside the core concepts of enterprise DBA operations. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SLA Management in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The following comparison captures the distinctions that matter most when working with SLA Management:",
        "The diagram below places SLA Management alongside the core concepts of enterprise DBA operations."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SLA Management:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SLA Management”?",
      "options": [
        "The first example establishes the relevant state.",
        "SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations.",
        "The following comparison captures the distinctions that matter most when working with SLA Management:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "SLA Management is a fundamental concept in enterprise DBA operations",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of SLA Management improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
