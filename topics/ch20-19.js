/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch20-19.html */

window.TOPIC = {
  id: "ch20-19",
  title: "Capacity Reporting",

  lead: "Capacity Reporting is a core part of enterprise DBA operations. This topic explains what it is, how it works inside SQL Server, and what a production DBA must know to operate it safely.",

  objectives: [
    "Define what Capacity Reporting is and where it fits",
    "Explain how Capacity Reporting works internally",
    "Apply Capacity Reporting correctly in a production environment",
    "Recognise the common mistakes and risks involving Capacity Reporting",
    "Monitor and troubleshoot Capacity Reporting with the right tools"
  ],

  sections: [
    {
      h: "What Capacity Reporting means",
      html: `
<p>In this topic we examine <strong>Capacity Reporting</strong> within enterprise DBA operations. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Environments must stay aligned but distinct. Refreshing test and UAT from production (sanitised) keeps schemas realistic, while access controls ensure only the right people can reach live data.</p>
<p>Change management governs every production change: request, review, approval, scheduled window, implementation and verification. Emergency changes have a fast path but still require recording and retrospective approval.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Capacity Reporting is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Capacity Reporting fits",
      html: `
<p>Patching and upgrades are planned programmes. Cumulative updates, service packs and version upgrades need testing in lower environments, a rollback plan, compatibility checks and a maintenance window.</p>
<p>The diagram below places Capacity Reporting alongside the core concepts of enterprise DBA operations. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Capacity Reporting concept map">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="280" y="140" width="200" height="60" rx="9" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="175" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Capacity Reporting</text>
    <rect x="24" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Estate</text>
    <text x="124" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 1</text>
    <rect x="536" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Change</text>
    <text x="636" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 2</text>
    <rect x="24" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Patch</text>
    <text x="124" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 3</text>
    <rect x="536" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Migration</text>
    <text x="636" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 4</text>
    <rect x="24" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">SLA</text>
    <text x="124" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 5</text>
    <rect x="536" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Compliance</text>
    <text x="636" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 6</text>
    <line x1="380" y1="170" x2="124" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
  </svg>
  <div class="figcaption">Figure 1 — Enterprise DBA operations: how Capacity Reporting relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Capacity Reporting in practice",
      html: `
<p>Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies. Cross-server work must account for logins, linked servers, agent jobs and application connection strings.</p>
<p>The following comparison captures the distinctions that matter most when working with Capacity Reporting:</p>
<table>
  <tr><th>Operation</th><th>Cadence</th><th>Evidence</th></tr>
  <tr><td>Health check</td><td>Daily</td><td>Report + exceptions</td></tr>
  <tr><td>Backup compliance</td><td>Daily</td><td>Last backup per DB</td></tr>
  <tr><td>Capacity review</td><td>Weekly / monthly</td><td>Growth trend</td></tr>
</table>
<p>Reporting is how an enterprise DBA demonstrates control: health-check, backup-compliance, capacity and performance reports provide evidence for SLAs and audits.</p>
      `,
    },
    {
      h: "Working with Capacity Reporting",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Capacity Reporting. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Capacity Reporting
-- Estate inventory across a registered server group (run per instance)
SELECT @@SERVERNAME AS server,
       SERVERPROPERTY('ProductVersion') AS version,
       SERVERPROPERTY('Edition') AS edition,
       name, state_desc, recovery_model_desc
FROM sys.databases
ORDER BY name;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Capacity Reporting
-- Backup compliance across the estate
SELECT @@SERVERNAME AS server, d.name AS db,
       d.recovery_model_desc,
       max(b.backup_finish_date) AS last_full
FROM sys.databases d
LEFT JOIN msdb.dbo.backupset b
  ON b.database_name=d.name AND b.type='D'
GROUP BY d.name, d.recovery_model_desc;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Capacity Reporting
-- Compatibility levels before an upgrade
SELECT name, compatibility_level
FROM sys.databases
WHERE compatibility_level < 150;</code></pre>
<p>SLAs, RPO/RTO and compliance requirements translate business expectations into measurable operations. Daily, weekly and monthly routines keep the estate stable and the evidence current.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Enterprise DBA work shifts from single servers to a governed estate of many instances across environments and regions. Scale makes standardisation, automation and documentation essential rather than optional.</p>
<table>
  <tr><th>Change type</th><th>Approval</th><th>Window</th></tr>
  <tr><td>Schema deploy</td><td>Peer review + CAB</td><td>Scheduled</td></tr>
  <tr><td>Patch / CU</td><td>Tested + CAB</td><td>Maintenance</td></tr>
  <tr><td>Emergency fix</td><td>Retrospective</td><td>Immediate</td></tr>
</table>
<p>Managing multiple instances requires a central inventory: versions, editions, patch levels, owners, databases, sizes and dependencies. Without it, you cannot answer basic questions during an audit or incident.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Capacity Reporting, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    }
  ],

  scenario: {
    title: "The unpatched instance found in an audit",
    html: `
An audit discovered an instance two cumulative updates behind with a known security vulnerability — nobody knew it existed because it was missing from the inventory. The DBA built a central inventory, a patch baseline and a monthly compliance report, then brought the instance up to date through the change process.
<p><strong>The Capacity Reporting lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
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
    },
    {
      q: "What do you report to demonstrate SLA and compliance?",
      a: `
Uptime, backup success and restore-test results, RPO/RTO adherence, patch levels, job success rates, capacity trends and open incidents — with evidence retained for auditors.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within enterprise DBA operations.”",
      "options": [
        "Maintenance",
        "Immediate",
        "Capacity Reporting"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Capacity Reporting within enterprise DBA operations. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Capacity Reporting fits”?",
      "options": [
        "Capacity Reporting",
        "Patching and upgrades are planned programmes.",
        "The diagram below places Capacity Reporting alongside the core concepts of enterprise DBA operations."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Patching and upgrades are planned programmes. Cumulative updates, service packs and version upgrades need testing in lower environments, a rollback plan, compatibility checks and a maintenance window.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Capacity Reporting in practice”?",
      "options": [
        "Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies.",
        "Capacity Reporting",
        "Environments must stay aligned but distinct."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies. Cross-server work must account for logins, linked servers, agent jobs and application connection strings.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Capacity Reporting”?",
      "options": [
        "Environments must stay aligned but distinct.",
        "Change management governs every production change: request, review, approval, scheduled window, implementation and verification.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Capacity Reporting. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Capacity Reporting is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.",
        "Enterprise DBA work shifts from single servers to a governed estate of many instances across environments and regions.",
        "Change management governs every production change: request, review, approval, scheduled window, implementation and verification."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Enterprise DBA work shifts from single servers to a governed estate of many instances across environments and regions. Scale makes standardisation, automation and documentation essential rather than optional.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Capacity Reporting means”?",
      "options": [
        "Environments must stay aligned but distinct.",
        "The following comparison captures the distinctions that matter most when working with Capacity Reporting:",
        "Reporting is how an enterprise DBA demonstrates control: health-check, backup-compliance, capacity and performance reports provide evidence for SLAs and audits."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Environments must stay aligned but distinct. Refreshing test and UAT from production (sanitised) keeps schemas realistic, while access controls ensure only the right people can reach live data.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Capacity Reporting fits”?",
      "options": [
        "Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies.",
        "The following comparison captures the distinctions that matter most when working with Capacity Reporting:",
        "The diagram below places Capacity Reporting alongside the core concepts of enterprise DBA operations."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Capacity Reporting alongside the core concepts of enterprise DBA operations. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Capacity Reporting in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The following comparison captures the distinctions that matter most when working with Capacity Reporting:",
        "The diagram below places Capacity Reporting alongside the core concepts of enterprise DBA operations."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Capacity Reporting:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Capacity Reporting”?",
      "options": [
        "The first example establishes the relevant state.",
        "Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies.",
        "The following comparison captures the distinctions that matter most when working with Capacity Reporting:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Capacity Reporting:",
        "Reporting is how an enterprise DBA demonstrates control: health-check, backup-compliance, capacity and performance reports provide evidence for SLAs and audits.",
        "Managing multiple instances requires a central inventory: versions, editions, patch levels, owners, databases, sizes and dependencies."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Managing multiple instances requires a central inventory: versions, editions, patch levels, owners, databases, sizes and dependencies. Without it, you cannot answer basic questions during an audit or incident.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within enterprise DBA operations.”",
      "options": [
        "Maintenance",
        "Immediate",
        "Capacity Reporting"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Capacity Reporting within enterprise DBA operations. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Capacity Reporting fits”?",
      "options": [
        "Capacity Reporting",
        "Patching and upgrades are planned programmes.",
        "The diagram below places Capacity Reporting alongside the core concepts of enterprise DBA operations."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Patching and upgrades are planned programmes. Cumulative updates, service packs and version upgrades need testing in lower environments, a rollback plan, compatibility checks and a maintenance window.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Capacity Reporting in practice”?",
      "options": [
        "Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies.",
        "Capacity Reporting",
        "Environments must stay aligned but distinct."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies. Cross-server work must account for logins, linked servers, agent jobs and application connection strings.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Capacity Reporting”?",
      "options": [
        "Environments must stay aligned but distinct.",
        "Change management governs every production change: request, review, approval, scheduled window, implementation and verification.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Capacity Reporting. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Capacity Reporting is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.",
        "Enterprise DBA work shifts from single servers to a governed estate of many instances across environments and regions.",
        "Change management governs every production change: request, review, approval, scheduled window, implementation and verification."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Enterprise DBA work shifts from single servers to a governed estate of many instances across environments and regions. Scale makes standardisation, automation and documentation essential rather than optional.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Capacity Reporting means”?",
      "options": [
        "Environments must stay aligned but distinct.",
        "The following comparison captures the distinctions that matter most when working with Capacity Reporting:",
        "Reporting is how an enterprise DBA demonstrates control: health-check, backup-compliance, capacity and performance reports provide evidence for SLAs and audits."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Environments must stay aligned but distinct. Refreshing test and UAT from production (sanitised) keeps schemas realistic, while access controls ensure only the right people can reach live data.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Capacity Reporting fits”?",
      "options": [
        "Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies.",
        "The following comparison captures the distinctions that matter most when working with Capacity Reporting:",
        "The diagram below places Capacity Reporting alongside the core concepts of enterprise DBA operations."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Capacity Reporting alongside the core concepts of enterprise DBA operations. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Capacity Reporting in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The following comparison captures the distinctions that matter most when working with Capacity Reporting:",
        "The diagram below places Capacity Reporting alongside the core concepts of enterprise DBA operations."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Capacity Reporting:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Capacity Reporting”?",
      "options": [
        "The first example establishes the relevant state.",
        "Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies.",
        "The following comparison captures the distinctions that matter most when working with Capacity Reporting:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Capacity Reporting:",
        "Reporting is how an enterprise DBA demonstrates control: health-check, backup-compliance, capacity and performance reports provide evidence for SLAs and audits.",
        "Managing multiple instances requires a central inventory: versions, editions, patch levels, owners, databases, sizes and dependencies."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Managing multiple instances requires a central inventory: versions, editions, patch levels, owners, databases, sizes and dependencies. Without it, you cannot answer basic questions during an audit or incident.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within enterprise DBA operations.”",
      "options": [
        "Maintenance",
        "Immediate",
        "Capacity Reporting"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Capacity Reporting within enterprise DBA operations. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Capacity Reporting fits”?",
      "options": [
        "Capacity Reporting",
        "Patching and upgrades are planned programmes.",
        "The diagram below places Capacity Reporting alongside the core concepts of enterprise DBA operations."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Patching and upgrades are planned programmes. Cumulative updates, service packs and version upgrades need testing in lower environments, a rollback plan, compatibility checks and a maintenance window.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Capacity Reporting in practice”?",
      "options": [
        "Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies.",
        "Capacity Reporting",
        "Environments must stay aligned but distinct."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies. Cross-server work must account for logins, linked servers, agent jobs and application connection strings.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Capacity Reporting”?",
      "options": [
        "Environments must stay aligned but distinct.",
        "Change management governs every production change: request, review, approval, scheduled window, implementation and verification.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Capacity Reporting. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Capacity Reporting is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.",
        "Enterprise DBA work shifts from single servers to a governed estate of many instances across environments and regions.",
        "Change management governs every production change: request, review, approval, scheduled window, implementation and verification."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Enterprise DBA work shifts from single servers to a governed estate of many instances across environments and regions. Scale makes standardisation, automation and documentation essential rather than optional.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Capacity Reporting means”?",
      "options": [
        "Environments must stay aligned but distinct.",
        "The following comparison captures the distinctions that matter most when working with Capacity Reporting:",
        "Reporting is how an enterprise DBA demonstrates control: health-check, backup-compliance, capacity and performance reports provide evidence for SLAs and audits."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Environments must stay aligned but distinct. Refreshing test and UAT from production (sanitised) keeps schemas realistic, while access controls ensure only the right people can reach live data.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Capacity Reporting fits”?",
      "options": [
        "Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies.",
        "The following comparison captures the distinctions that matter most when working with Capacity Reporting:",
        "The diagram below places Capacity Reporting alongside the core concepts of enterprise DBA operations."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Capacity Reporting alongside the core concepts of enterprise DBA operations. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Capacity Reporting in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The following comparison captures the distinctions that matter most when working with Capacity Reporting:",
        "The diagram below places Capacity Reporting alongside the core concepts of enterprise DBA operations."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Capacity Reporting:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Capacity Reporting”?",
      "options": [
        "The first example establishes the relevant state.",
        "Migrations and database refreshes move data between servers while preserving permissions, jobs and dependencies.",
        "The following comparison captures the distinctions that matter most when working with Capacity Reporting:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Capacity Reporting:",
        "Reporting is how an enterprise DBA demonstrates control: health-check, backup-compliance, capacity and performance reports provide evidence for SLAs and audits.",
        "Managing multiple instances requires a central inventory: versions, editions, patch levels, owners, databases, sizes and dependencies."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Managing multiple instances requires a central inventory: versions, editions, patch levels, owners, databases, sizes and dependencies. Without it, you cannot answer basic questions during an audit or incident.”"
    }
  ],
  takeaways: [
    "Capacity Reporting is a fundamental concept in enterprise DBA operations",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Capacity Reporting improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
