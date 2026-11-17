/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch19-07.html */

window.TOPIC = {
  id: "ch19-07",
  title: "Database Offline",

  lead: "Database Offline is a core part of production incident management. This topic explains what it is, how it works inside SQL Server, and what a production DBA must know to operate it safely.",

  objectives: [
    "Define what Database Offline is and where it fits",
    "Explain how Database Offline works internally",
    "Apply Database Offline correctly in a production environment",
    "Recognise the common mistakes and risks involving Database Offline",
    "Monitor and troubleshoot Database Offline with the right tools"
  ],

  sections: [
    {
      h: "What Database Offline means",
      html: `
<p>In this topic we examine <strong>Database Offline</strong> within production incident management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Communication is part of the job. Regular, honest updates to stakeholders — what is known, what is being done, when the next update is — maintain trust and stop others from interrupting the responder.</p>
<p>Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates. Blameless culture surfaces the real causes instead of hiding them.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Database Offline is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Database Offline fits",
      html: `
<p>A production incident is an unplanned event that degrades or stops service. The priority is to restore service first, then find the root cause — investigation during an outage extends the outage.</p>
<p>The diagram below places Database Offline alongside the core concepts of production incident management. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Database Offline concept map">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="280" y="140" width="200" height="60" rx="9" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="175" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Database Offline</text>
    <rect x="24" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Severity</text>
    <text x="124" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 1</text>
    <rect x="536" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Incident</text>
    <text x="636" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 2</text>
    <rect x="24" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Escalation</text>
    <text x="124" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 3</text>
    <rect x="536" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">RCA</text>
    <text x="636" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 4</text>
    <rect x="24" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Runbook</text>
    <text x="124" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 5</text>
    <rect x="536" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Communication</text>
    <text x="636" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 6</text>
    <line x1="380" y1="170" x2="124" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
  </svg>
  <div class="figcaption">Figure 1 — Production incident management: how Database Offline relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Database Offline in practice",
      html: `
<p>Severity levels classify impact: Sev1 is a total outage or critical data loss, Sev2 a major degradation, Sev3 a limited impact. Severity drives response time, who is paged and how often stakeholders are updated.</p>
<p>The following comparison captures the distinctions that matter most when working with Database Offline:</p>
<table>
  <tr><th>Severity</th><th>Definition</th><th>Response</th></tr>
  <tr><td>Sev 1</td><td>Total outage / data loss</td><td>Immediate page, continuous updates</td></tr>
  <tr><td>Sev 2</td><td>Major degradation</td><td>Same hour, frequent updates</td></tr>
  <tr><td>Sev 3</td><td>Limited impact</td><td>Next business day</td></tr>
</table>
<p>Prioritisation weighs impact and urgency. A high-impact, high-urgency incident gets immediate attention; a low-impact cosmetic issue can wait. Clear severity definitions remove debate during stress.</p>
      `,
    },
    {
      h: "Working with Database Offline",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Database Offline. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Database Offline
-- Is the instance up, what is slow, and what is blocked?
SELECT @@SERVERNAME AS server, getdate() AS now;
SELECT session_id, status, command, blocking_session_id,
       wait_type, total_elapsed_time
FROM   sys.dm_exec_requests
WHERE  session_id > 50
ORDER BY total_elapsed_time DESC;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Database Offline
-- Log and volume usage during a full-disk incident
SELECT name, size / 128 AS size_mb,
       max_size, growth
FROM   sys.database_files WHERE type_desc = 'LOG';</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-powershell">-- Database Offline
Get-Service -Name 'MSSQL*','SQLSERVERAGENT' |
  Select-Object Name, Status, StartType
Get-WinEvent -LogName System -MaxEvents 20 |
  Where-Object { $_.LevelDisplayName -eq 'Error' }
</code></pre>
<p>The response lifecycle is detect, triage, diagnose, mitigate, resolve and review. Triage assigns severity and an owner; mitigation restores service, sometimes with a workaround; the post-incident review prevents recurrence.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full and connection or login failures.</p>
<table>
  <tr><th>Incident</th><th>First check</th><th>Typical mitigation</th></tr>
  <tr><td>Server down</td><td>Ping, service state</td><td>Failover / restart</td></tr>
  <tr><td>Log full</td><td>Log usage DMV</td><td>Log backup / grow</td></tr>
  <tr><td>Slow DB</td><td>Waits, blocking</td><td>Kill blocker / fix query</td></tr>
</table>
<p>Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations. Runbooks reduce errors and speed response when adrenaline is high and time is short.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Database Offline, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    }
  ],

  scenario: {
    title: "Transaction log full at 02:00",
    html: `
Alerts fired as the transaction log hit 100%. The on-call DBA checked and found a failed log-backup job after a recovery-model change. Taking an emergency log backup freed space immediately; the DBA then fixed the job, alerted on log usage at 70% and 85%, and added a check that a FULL-model database has recent log backups. Service was restored in minutes.
<p><strong>The Database Offline lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "What is your priority order during a Sev1 outage?",
      a: `
Restore service first using the safest tested mitigation, communicate status at a fixed cadence, preserve evidence for later analysis, and only then pursue the deep root cause — extending an outage to investigate is a second failure.
      `,
    },
    {
      q: "How do you decide incident severity?",
      a: `
By impact and urgency against defined levels: total outage or data loss is Sev1, major degradation Sev2, limited impact Sev3 — pre-agreed definitions avoid debate under pressure.
      `,
    },
    {
      q: "What should a post-incident report contain?",
      a: `
A timeline, impact, root cause, contributing factors, what went well and badly, and concrete prevention actions with owners and due dates — written blamelessly so the real causes surface.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within production incident management.”",
      "options": [
        "Prioritisation weighs impact and urgency.",
        "Immediate page, continuous updates",
        "Database Offline"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Database Offline within production incident management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Database Offline fits”?",
      "options": [
        "Next business day",
        "A production incident is an unplanned event that degrades or stops service.",
        "Same hour, frequent updates"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A production incident is an unplanned event that degrades or stops service. The priority is to restore service first, then find the root cause — investigation during an outage extends the outage.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Database Offline in practice”?",
      "options": [
        "Severity levels classify impact: Sev1 is a total outage or critical data loss, Sev2 a major degradation, Sev3 a limited impact.",
        "The response lifecycle is detect, triage, diagnose, mitigate, resolve and review.",
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Severity levels classify impact: Sev1 is a total outage or critical data loss, Sev2 a major degradation, Sev3 a limited impact. Severity drives response time, who is paged and how often stakeholders are updated.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Database Offline”?",
      "options": [
        "Same hour, frequent updates",
        "Next business day",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Database Offline. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…",
        "Next business day"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full and connection or login failures.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Database Offline means”?",
      "options": [
        "Communication is part of the job.",
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…",
        "Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Communication is part of the job. Regular, honest updates to stakeholders — what is known, what is being done, when the next update is — maintain trust and stop others from interrupting the responder.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Database Offline fits”?",
      "options": [
        "The response lifecycle is detect, triage, diagnose, mitigate, resolve and review.",
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…",
        "The diagram below places Database Offline alongside the core concepts of production incident management."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Database Offline alongside the core concepts of production incident management. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Database Offline in practice”?",
      "options": [
        "Kill blocker / fix query",
        "The following comparison captures the distinctions that matter most when working with Database Offline:",
        "Log backup / grow"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Database Offline:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Database Offline”?",
      "options": [
        "The first example establishes the relevant state.",
        "Failover / restart",
        "Log backup / grow"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…",
        "With Database Offline, prefer measured, reversible changes.",
        "Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations. Runbooks reduce errors and speed response when adrenaline is high and time is short.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within production incident management.”",
      "options": [
        "Prioritisation weighs impact and urgency.",
        "Immediate page, continuous updates",
        "Database Offline"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Database Offline within production incident management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Database Offline fits”?",
      "options": [
        "Next business day",
        "A production incident is an unplanned event that degrades or stops service.",
        "Same hour, frequent updates"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A production incident is an unplanned event that degrades or stops service. The priority is to restore service first, then find the root cause — investigation during an outage extends the outage.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Database Offline in practice”?",
      "options": [
        "Severity levels classify impact: Sev1 is a total outage or critical data loss, Sev2 a major degradation, Sev3 a limited impact.",
        "The response lifecycle is detect, triage, diagnose, mitigate, resolve and review.",
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Severity levels classify impact: Sev1 is a total outage or critical data loss, Sev2 a major degradation, Sev3 a limited impact. Severity drives response time, who is paged and how often stakeholders are updated.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Database Offline”?",
      "options": [
        "Same hour, frequent updates",
        "Next business day",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Database Offline. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…",
        "Next business day"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full and connection or login failures.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Database Offline means”?",
      "options": [
        "Communication is part of the job.",
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…",
        "Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Communication is part of the job. Regular, honest updates to stakeholders — what is known, what is being done, when the next update is — maintain trust and stop others from interrupting the responder.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Database Offline fits”?",
      "options": [
        "The response lifecycle is detect, triage, diagnose, mitigate, resolve and review.",
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…",
        "The diagram below places Database Offline alongside the core concepts of production incident management."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Database Offline alongside the core concepts of production incident management. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Database Offline in practice”?",
      "options": [
        "Kill blocker / fix query",
        "The following comparison captures the distinctions that matter most when working with Database Offline:",
        "Log backup / grow"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Database Offline:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Database Offline”?",
      "options": [
        "The first example establishes the relevant state.",
        "Failover / restart",
        "Log backup / grow"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…",
        "With Database Offline, prefer measured, reversible changes.",
        "Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations. Runbooks reduce errors and speed response when adrenaline is high and time is short.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within production incident management.”",
      "options": [
        "Prioritisation weighs impact and urgency.",
        "Immediate page, continuous updates",
        "Database Offline"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Database Offline within production incident management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Database Offline fits”?",
      "options": [
        "Next business day",
        "A production incident is an unplanned event that degrades or stops service.",
        "Same hour, frequent updates"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A production incident is an unplanned event that degrades or stops service. The priority is to restore service first, then find the root cause — investigation during an outage extends the outage.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Database Offline in practice”?",
      "options": [
        "Severity levels classify impact: Sev1 is a total outage or critical data loss, Sev2 a major degradation, Sev3 a limited impact.",
        "The response lifecycle is detect, triage, diagnose, mitigate, resolve and review.",
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Severity levels classify impact: Sev1 is a total outage or critical data loss, Sev2 a major degradation, Sev3 a limited impact. Severity drives response time, who is paged and how often stakeholders are updated.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Database Offline”?",
      "options": [
        "Same hour, frequent updates",
        "Next business day",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Database Offline. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…",
        "Next business day"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full and connection or login failures.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Database Offline means”?",
      "options": [
        "Communication is part of the job.",
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…",
        "Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Communication is part of the job. Regular, honest updates to stakeholders — what is known, what is being done, when the next update is — maintain trust and stop others from interrupting the responder.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Database Offline fits”?",
      "options": [
        "The response lifecycle is detect, triage, diagnose, mitigate, resolve and review.",
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…",
        "The diagram below places Database Offline alongside the core concepts of production incident management."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Database Offline alongside the core concepts of production incident management. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Database Offline in practice”?",
      "options": [
        "Kill blocker / fix query",
        "The following comparison captures the distinctions that matter most when working with Database Offline:",
        "Log backup / grow"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Database Offline:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Database Offline”?",
      "options": [
        "The first example establishes the relevant state.",
        "Failover / restart",
        "Log backup / grow"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…",
        "With Database Offline, prefer measured, reversible changes.",
        "Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations. Runbooks reduce errors and speed response when adrenaline is high and time is short.”"
    }
  ],
  takeaways: [
    "Database Offline is a fundamental concept in production incident management",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Database Offline improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
