/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch20-26.html */

window.TOPIC = {
  id: "ch20-26",
  title: "Enterprise DBA Weekly Operations",

  lead: "Understanding Enterprise DBA Weekly Operations is essential for anyone responsible for enterprise DBA operations. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what Enterprise DBA Weekly Operations is and where it fits",
    "Explain how Enterprise DBA Weekly Operations works internally",
    "Apply Enterprise DBA Weekly Operations correctly in a production environment",
    "Recognise the common mistakes and risks involving Enterprise DBA Weekly Operations",
    "Monitor and troubleshoot Enterprise DBA Weekly Operations with the right tools"
  ],

  sections: [
    {
      h: "What Enterprise DBA Weekly Operations means",
      html: `
<p>In this topic we examine <strong>Enterprise DBA Weekly Operations</strong> within enterprise DBA operations. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Managing multiple instances requires a central inventory: versions, editions, patch levels, owners, databases, sizes and dependencies. Without it, you cannot answer basic questions during an audit or incident.</p>
<p>Environments must stay aligned but distinct. Refreshing test and UAT from production (sanitised) keeps schemas realistic, while access controls ensure only the right people can reach live data.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Enterprise DBA Weekly Operations is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Enterprise DBA Weekly Operations fits",
      html: `
<p>Change management governs every production change: request, review, approval, scheduled window, implementation and verification. Emergency changes have a fast path but still require recording and retrospective approval.</p>
<p>The diagram below places Enterprise DBA Weekly Operations alongside the core concepts of enterprise DBA operations. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Enterprise DBA Weekly Operati… flow">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="230" y="12" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="39" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Estate</text>
    <rect x="230" y="66" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="93" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Change</text>
    <rect x="230" y="120" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="147" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Patch</text>
    <rect x="230" y="174" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="201" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Migration</text>
    <rect x="230" y="228" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="255" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. SLA</text>
    <rect x="230" y="282" width="300" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="309" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">6. Compliance</text>
    <line x1="380" y1="56" x2="380" y2="66" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="110" x2="380" y2="120" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="164" x2="380" y2="174" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="218" x2="380" y2="228" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="272" x2="380" y2="282" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Enterprise DBA Weekly Operati…</text>
  </svg>
  <div class="figcaption">Figure 1 — Enterprise DBA operations: how Enterprise DBA Weekly Operations relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Enterprise DBA Weekly Operations in practice",
      html: `
<p>Patching and upgrades are planned programmes. Cumulative updates, service packs and version upgrades need testing in lower environments, a rollback plan, compatibility checks and a maintenance window.</p>
<p>The following comparison captures the distinctions that matter most when working with Enterprise DBA Weekly Operations:</p>
<table>
  <tr><th>Operation</th><th>Cadence</th><th>Evidence</th></tr>
  <tr><td>Health check</td><td>Daily</td><td>Report + exceptions</td></tr>
  <tr><td>Backup compliance</td><td>Daily</td><td>Last backup per DB</td></tr>
  <tr><td>Capacity review</td><td>Weekly / monthly</td><td>Growth trend</td></tr>
</table>
<p>Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies. Cross-server work must account for logins, linked servers, agent jobs and application connection strings.</p>
      `,
    },
    {
      h: "Working with Enterprise DBA Weekly Operations",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Enterprise DBA Weekly Operations. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Enterprise DBA Weekly Operations
-- Estate inventory across a registered server group (run per instance)
SELECT @@SERVERNAME AS server,
       SERVERPROPERTY('ProductVersion') AS version,
       SERVERPROPERTY('Edition') AS edition,
       name, state_desc, recovery_model_desc
FROM sys.databases
ORDER BY name;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Enterprise DBA Weekly Operations
-- Backup compliance across the estate
SELECT @@SERVERNAME AS server, d.name AS db,
       d.recovery_model_desc,
       max(b.backup_finish_date) AS last_full
FROM sys.databases d
LEFT JOIN msdb.dbo.backupset b
  ON b.database_name=d.name AND b.type='D'
GROUP BY d.name, d.recovery_model_desc;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Enterprise DBA Weekly Operations
-- Compatibility levels before an upgrade
SELECT name, compatibility_level
FROM sys.databases
WHERE compatibility_level < 150;</code></pre>
<p>Reporting is how an enterprise DBA demonstrates control: health-check, backup-compliance, capacity and performance reports provide evidence for SLAs and audits.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations. Daily, weekly and monthly routines keep the estate stable and the evidence current.</p>
<table>
  <tr><th>Change type</th><th>Approval</th><th>Window</th></tr>
  <tr><td>Schema deploy</td><td>Peer review + CAB</td><td>Scheduled</td></tr>
  <tr><td>Patch / CU</td><td>Tested + CAB</td><td>Maintenance</td></tr>
  <tr><td>Emergency fix</td><td>Retrospective</td><td>Immediate</td></tr>
</table>
<p>Enterprise DBA work shifts from single servers to a governed estate of many instances across environments and regions. Scale makes standardisation, automation and documentation essential rather than optional.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Enterprise DBA Weekly Operations, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Enterprise DBA Weekly Operations",
      html: `
<p>This section consolidates <strong>Enterprise DBA Weekly Operations</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Patching and upgrades are planned programmes. Cumulative updates, service packs and version upgrades need testing in lower environments, a rollback plan, compatibility checks and a maintenance window.</p>
<p>Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies. Cross-server work must account for logins, linked servers, agent jobs and application connection strings.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Enterprise DBA Weekly Operations sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Change type</th><th>Approval</th><th>Window</th></tr>
  <tr><td>Schema deploy</td><td>Peer review + CAB</td><td>Scheduled</td></tr>
  <tr><td>Patch / CU</td><td>Tested + CAB</td><td>Maintenance</td></tr>
  <tr><td>Emergency fix</td><td>Retrospective</td><td>Immediate</td></tr>
</table>
<p>Reporting is how an enterprise DBA demonstrates control: health-check, backup-compliance, capacity and performance reports provide evidence for SLAs and audits.</p>
<p>Use the following as a starting point when investigating Enterprise DBA Weekly Operations. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Enterprise DBA Weekly Operations
-- Estate inventory across a registered server group (run per instance)
SELECT @@SERVERNAME AS server,
       SERVERPROPERTY('ProductVersion') AS version,
       SERVERPROPERTY('Edition') AS edition,
       name, state_desc, recovery_model_desc
FROM sys.databases
ORDER BY name;</code></pre>
<p>SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations. Daily, weekly and monthly routines keep the estate stable and the evidence current.</p>
      `,
    }
  ],

  scenario: {
    title: "The migration that forgot the jobs",
    html: `
A database migrate/refresh succeeded but the application's scheduled exports stopped: agent jobs, logins and linked servers were not part of the database backup. The runbook now includes a server-level object checklist and post-migration smoke tests with the application team.
<p><strong>The Enterprise DBA Weekly Operations lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "What is the role of change management?",
      a: `
To ensure every production change is requested, reviewed, approved, scheduled, implemented and verified, with an emergency path that is recorded and retrospectively approved.
      `,
    },
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
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within enterprise DBA operations.”",
      "options": [
        "Change management governs every production change: request, review, approval, scheduled window, implementation and verification.",
        "Enterprise DBA Weekly Operations",
        "Enterprise DBA Weekly Operations is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Enterprise DBA Weekly Operations within enterprise DBA operations. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Enterprise DBA Weekly Operations fits”?",
      "options": [
        "Change management governs every production change: request, review, approval, scheduled window, implementation and verification.",
        "Enterprise DBA Weekly Operations is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Patching and upgrades are planned programmes."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Change management governs every production change: request, review, approval, scheduled window, implementation and verification. Emergency changes have a fast path but still require recording and retrospective approval.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Enterprise DBA Weekly Operations in practice”?",
      "options": [
        "Change management governs every production change: request, review, approval, scheduled window, implementation and verification.",
        "The diagram below places Enterprise DBA Weekly Operations alongside the core concepts of enterprise DBA operations.",
        "Patching and upgrades are planned programmes."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Patching and upgrades are planned programmes. Cumulative updates, service packs and version upgrades need testing in lower environments, a rollback plan, compatibility checks and a maintenance window.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Enterprise DBA Weekly Operations”?",
      "options": [
        "Patching and upgrades are planned programmes.",
        "Theory becomes useful when you can apply it.",
        "The diagram below places Enterprise DBA Weekly Operations alongside the core concepts of enterprise DBA operations."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Enterprise DBA Weekly Operations. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations.",
        "Patching and upgrades are planned programmes.",
        "The following comparison captures the distinctions that matter most when working with Enterprise DBA Weekly Operations:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations. Daily, weekly and monthly routines keep the estate stable and the evidence current.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies.",
        "Report + exceptions",
        "Enterprise DBA Weekly Operations"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Enterprise DBA Weekly Operations with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Enterprise DBA Weekly Operations means”?",
      "options": [
        "The first example establishes the relevant state.",
        "Managing multiple instances requires a central inventory: versions, editions, patch levels, owners, databases, sizes and dependencies.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Managing multiple instances requires a central inventory: versions, editions, patch levels, owners, databases, sizes and dependencies. Without it, you cannot answer basic questions during an audit or incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Enterprise DBA Weekly Operations fits”?",
      "options": [
        "The diagram below places Enterprise DBA Weekly Operations alongside the core concepts of enterprise DBA operations.",
        "Growth trend",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Enterprise DBA Weekly Operations alongside the core concepts of enterprise DBA operations. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Enterprise DBA Weekly Operations in practice”?",
      "options": [
        "SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations.",
        "Enterprise DBA work shifts from single servers to a governed estate of many instances across environments and regions.",
        "The following comparison captures the distinctions that matter most when working with Enterprise DBA Weekly Operations:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Enterprise DBA Weekly Operations:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Enterprise DBA Weekly Operations”?",
      "options": [
        "SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations.",
        "The first example establishes the relevant state.",
        "Growth trend"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within enterprise DBA operations.”",
      "options": [
        "Change management governs every production change: request, review, approval, scheduled window, implementation and verification.",
        "Enterprise DBA Weekly Operations",
        "Enterprise DBA Weekly Operations is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Enterprise DBA Weekly Operations within enterprise DBA operations. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Enterprise DBA Weekly Operations fits”?",
      "options": [
        "Change management governs every production change: request, review, approval, scheduled window, implementation and verification.",
        "Enterprise DBA Weekly Operations is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Patching and upgrades are planned programmes."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Change management governs every production change: request, review, approval, scheduled window, implementation and verification. Emergency changes have a fast path but still require recording and retrospective approval.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Enterprise DBA Weekly Operations in practice”?",
      "options": [
        "Change management governs every production change: request, review, approval, scheduled window, implementation and verification.",
        "The diagram below places Enterprise DBA Weekly Operations alongside the core concepts of enterprise DBA operations.",
        "Patching and upgrades are planned programmes."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Patching and upgrades are planned programmes. Cumulative updates, service packs and version upgrades need testing in lower environments, a rollback plan, compatibility checks and a maintenance window.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Enterprise DBA Weekly Operations”?",
      "options": [
        "Patching and upgrades are planned programmes.",
        "Theory becomes useful when you can apply it.",
        "The diagram below places Enterprise DBA Weekly Operations alongside the core concepts of enterprise DBA operations."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Enterprise DBA Weekly Operations. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations.",
        "Patching and upgrades are planned programmes.",
        "The following comparison captures the distinctions that matter most when working with Enterprise DBA Weekly Operations:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations. Daily, weekly and monthly routines keep the estate stable and the evidence current.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies.",
        "Report + exceptions",
        "Enterprise DBA Weekly Operations"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Enterprise DBA Weekly Operations with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Enterprise DBA Weekly Operations means”?",
      "options": [
        "The first example establishes the relevant state.",
        "Managing multiple instances requires a central inventory: versions, editions, patch levels, owners, databases, sizes and dependencies.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Managing multiple instances requires a central inventory: versions, editions, patch levels, owners, databases, sizes and dependencies. Without it, you cannot answer basic questions during an audit or incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Enterprise DBA Weekly Operations fits”?",
      "options": [
        "The diagram below places Enterprise DBA Weekly Operations alongside the core concepts of enterprise DBA operations.",
        "Growth trend",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Enterprise DBA Weekly Operations alongside the core concepts of enterprise DBA operations. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Enterprise DBA Weekly Operations in practice”?",
      "options": [
        "SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations.",
        "Enterprise DBA work shifts from single servers to a governed estate of many instances across environments and regions.",
        "The following comparison captures the distinctions that matter most when working with Enterprise DBA Weekly Operations:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Enterprise DBA Weekly Operations:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Enterprise DBA Weekly Operations”?",
      "options": [
        "SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations.",
        "The first example establishes the relevant state.",
        "Growth trend"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within enterprise DBA operations.”",
      "options": [
        "Change management governs every production change: request, review, approval, scheduled window, implementation and verification.",
        "Enterprise DBA Weekly Operations",
        "Enterprise DBA Weekly Operations is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Enterprise DBA Weekly Operations within enterprise DBA operations. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Enterprise DBA Weekly Operations fits”?",
      "options": [
        "Change management governs every production change: request, review, approval, scheduled window, implementation and verification.",
        "Enterprise DBA Weekly Operations is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Patching and upgrades are planned programmes."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Change management governs every production change: request, review, approval, scheduled window, implementation and verification. Emergency changes have a fast path but still require recording and retrospective approval.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Enterprise DBA Weekly Operations in practice”?",
      "options": [
        "Change management governs every production change: request, review, approval, scheduled window, implementation and verification.",
        "The diagram below places Enterprise DBA Weekly Operations alongside the core concepts of enterprise DBA operations.",
        "Patching and upgrades are planned programmes."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Patching and upgrades are planned programmes. Cumulative updates, service packs and version upgrades need testing in lower environments, a rollback plan, compatibility checks and a maintenance window.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Enterprise DBA Weekly Operations”?",
      "options": [
        "Patching and upgrades are planned programmes.",
        "Theory becomes useful when you can apply it.",
        "The diagram below places Enterprise DBA Weekly Operations alongside the core concepts of enterprise DBA operations."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Enterprise DBA Weekly Operations. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations.",
        "Patching and upgrades are planned programmes.",
        "The following comparison captures the distinctions that matter most when working with Enterprise DBA Weekly Operations:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations. Daily, weekly and monthly routines keep the estate stable and the evidence current.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies.",
        "Report + exceptions",
        "Enterprise DBA Weekly Operations"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Enterprise DBA Weekly Operations with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Enterprise DBA Weekly Operations means”?",
      "options": [
        "The first example establishes the relevant state.",
        "Managing multiple instances requires a central inventory: versions, editions, patch levels, owners, databases, sizes and dependencies.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Managing multiple instances requires a central inventory: versions, editions, patch levels, owners, databases, sizes and dependencies. Without it, you cannot answer basic questions during an audit or incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Enterprise DBA Weekly Operations fits”?",
      "options": [
        "The diagram below places Enterprise DBA Weekly Operations alongside the core concepts of enterprise DBA operations.",
        "Growth trend",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Enterprise DBA Weekly Operations alongside the core concepts of enterprise DBA operations. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Enterprise DBA Weekly Operations in practice”?",
      "options": [
        "SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations.",
        "Enterprise DBA work shifts from single servers to a governed estate of many instances across environments and regions.",
        "The following comparison captures the distinctions that matter most when working with Enterprise DBA Weekly Operations:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Enterprise DBA Weekly Operations:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Enterprise DBA Weekly Operations”?",
      "options": [
        "SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations.",
        "The first example establishes the relevant state.",
        "Growth trend"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Enterprise DBA Weekly Operations is a fundamental concept in enterprise DBA operations",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Enterprise DBA Weekly Operations improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
