/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch19-21.html */

window.TOPIC = {
  id: "ch19-21",
  title: "Root Cause Analysis (RCA)",

  lead: "This topic covers Root Cause Analysis (RCA) — a concept you will meet repeatedly when working with production incident management. We build from first principles to production guidance.",

  objectives: [
    "Define what Root Cause Analysis (RCA) is and where it fits",
    "Explain how Root Cause Analysis (RCA) works internally",
    "Apply Root Cause Analysis (RCA) correctly in a production environment",
    "Recognise the common mistakes and risks involving Root Cause Analysis (RCA)",
    "Monitor and troubleshoot Root Cause Analysis (RCA) with the right tools"
  ],

  sections: [
    {
      h: "What Root Cause Analysis (RCA) means",
      html: `
<p>In this topic we examine <strong>Root Cause Analysis (RCA)</strong> within production incident management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full and connection or login failures.</p>
<p>Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations. Runbooks reduce errors and speed response when adrenaline is high and time is short.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Root Cause Analysis (RCA) is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Root Cause Analysis (RCA) fits",
      html: `
<p>Communication is part of the job. Regular, honest updates to stakeholders — what is known, what is being done, when the next update is — maintain trust and stop others from interrupting the responder.</p>
<p>The diagram below places Root Cause Analysis (RCA) alongside the core concepts of production incident management. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Root Cause Analysis (RCA) layers">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="70" y="8" width="620" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="30" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Severity</text>
    <text x="380" y="50" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 1</text>
    <rect x="100" y="62" width="560" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="84" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Incident</text>
    <text x="380" y="104" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 2</text>
    <rect x="130" y="116" width="500" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="138" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Escalation</text>
    <text x="380" y="158" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 3</text>
    <rect x="160" y="170" width="440" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="192" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">RCA</text>
    <text x="380" y="212" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 4</text>
    <rect x="190" y="224" width="380" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="246" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Runbook</text>
    <text x="380" y="266" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 5</text>
    <rect x="220" y="278" width="320" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="300" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Communication</text>
    <text x="380" y="320" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 6</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Root Cause Analysis (RCA)</text>
  </svg>
  <div class="figcaption">Figure 1 — Production incident management: how Root Cause Analysis (RCA) relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Root Cause Analysis (RCA) in practice",
      html: `
<p>Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates. Blameless culture surfaces the real causes instead of hiding them.</p>
<p>The following comparison captures the distinctions that matter most when working with Root Cause Analysis (RCA):</p>
<table>
  <tr><th>Severity</th><th>Definition</th><th>Response</th></tr>
  <tr><td>Sev 1</td><td>Total outage / data loss</td><td>Immediate page, continuous updates</td></tr>
  <tr><td>Sev 2</td><td>Major degradation</td><td>Same hour, frequent updates</td></tr>
  <tr><td>Sev 3</td><td>Limited impact</td><td>Next business day</td></tr>
</table>
<p>A production incident is an unplanned event that degrades or stops service. The priority is to restore service first, then find the root cause — investigation during an outage extends the outage.</p>
      `,
    },
    {
      h: "Working with Root Cause Analysis (RCA)",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Root Cause Analysis (RCA). Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Root Cause Analysis (RCA)
-- Is the instance up, what is slow, and what is blocked?
SELECT @@SERVERNAME AS server, getdate() AS now;
SELECT session_id, status, command, blocking_session_id,
       wait_type, total_elapsed_time
FROM   sys.dm_exec_requests
WHERE  session_id > 50
ORDER BY total_elapsed_time DESC;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Root Cause Analysis (RCA)
-- Log and volume usage during a full-disk incident
SELECT name, size / 128 AS size_mb,
       max_size, growth
FROM   sys.database_files WHERE type_desc = 'LOG';</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-powershell">-- Root Cause Analysis (RCA)
Get-Service -Name 'MSSQL*','SQLSERVERAGENT' |
  Select-Object Name, Status, StartType
Get-WinEvent -LogName System -MaxEvents 20 |
  Where-Object { $_.LevelDisplayName -eq 'Error' }
</code></pre>
<p>Severity levels classify impact: Sev1 is a total outage or critical data loss, Sev2 a major degradation, Sev3 a limited impact. Severity drives response time, who is paged and how often stakeholders are updated.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Prioritisation weighs impact and urgency. A high-impact, high-urgency incident gets immediate attention; a low-impact cosmetic issue can wait. Clear severity definitions remove debate during stress.</p>
<table>
  <tr><th>Incident</th><th>First check</th><th>Typical mitigation</th></tr>
  <tr><td>Server down</td><td>Ping, service state</td><td>Failover / restart</td></tr>
  <tr><td>Log full</td><td>Log usage DMV</td><td>Log backup / grow</td></tr>
  <tr><td>Slow DB</td><td>Waits, blocking</td><td>Kill blocker / fix query</td></tr>
</table>
<p>The response lifecycle is detect, triage, diagnose, mitigate, resolve and review. Triage assigns severity and an owner; mitigation restores service, sometimes with a workaround; the post-incident review prevents recurrence.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Root Cause Analysis (RCA), prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Root Cause Analysis (RCA)",
      html: `
<p>This section consolidates <strong>Root Cause Analysis (RCA)</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates. Blameless culture surfaces the real causes instead of hiding them.</p>
<p>A production incident is an unplanned event that degrades or stops service. The priority is to restore service first, then find the root cause — investigation during an outage extends the outage.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Root Cause Analysis (RCA) sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Severity</th><th>Definition</th><th>Response</th></tr>
  <tr><td>Sev 1</td><td>Total outage / data loss</td><td>Immediate page, continuous updates</td></tr>
  <tr><td>Sev 2</td><td>Major degradation</td><td>Same hour, frequent updates</td></tr>
  <tr><td>Sev 3</td><td>Limited impact</td><td>Next business day</td></tr>
</table>
<p>Severity levels classify impact: Sev1 is a total outage or critical data loss, Sev2 a major degradation, Sev3 a limited impact. Severity drives response time, who is paged and how often stakeholders are updated.</p>
<p>Use the following as a starting point when investigating Root Cause Analysis (RCA). Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Root Cause Analysis (RCA)
-- Log and volume usage during a full-disk incident
SELECT name, size / 128 AS size_mb,
       max_size, growth
FROM   sys.database_files WHERE type_desc = 'LOG';</code></pre>
<p>Prioritisation weighs impact and urgency. A high-impact, high-urgency incident gets immediate attention; a low-impact cosmetic issue can wait. Clear severity definitions remove debate during stress.</p>
      `,
    }
  ],

  scenario: {
    title: "Transaction log full at 02:00",
    html: `
Alerts fired as the transaction log hit 100%. The on-call DBA checked and found a failed log-backup job after a recovery-model change. Taking an emergency log backup freed space immediately; the DBA then fixed the job, alerted on log usage at 70% and 85%, and added a check that a FULL-model database has recent log backups. Service was restored in minutes.
<p><strong>The Root Cause Analysis (RCA) lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "What should a post-incident report contain?",
      a: `
A timeline, impact, root cause, contributing factors, what went well and badly, and concrete prevention actions with owners and due dates — written blamelessly so the real causes surface.
      `,
    },
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
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within production incident management.”",
      "options": [
        "Root Cause Analysis (RCA)",
        "Root Cause Analysis (RCA) sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Root Cause Analysis (RCA) within production incident management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Root Cause Analysis (RCA) fits”?",
      "options": [
        "Use the following as a starting point when investigating Root Cause Analysis (RCA).",
        "The diagram below places Root Cause Analysis (RCA) alongside the core concepts of production incident management.",
        "Communication is part of the job."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Communication is part of the job. Regular, honest updates to stakeholders — what is known, what is being done, when the next update is — maintain trust and stop others from interrupting the responder.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Root Cause Analysis (RCA) in practice”?",
      "options": [
        "Root Cause Analysis (RCA)",
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates.",
        "The following comparison captures the distinctions that matter most when working with Root Cause Analysis (RCA):"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates. Blameless culture surfaces the real causes instead of hiding them.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Root Cause Analysis (RCA)”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Root Cause Analysis (RCA)",
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Root Cause Analysis (RCA). Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…",
        "Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations.",
        "Prioritisation weighs impact and urgency."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Prioritisation weighs impact and urgency. A high-impact, high-urgency incident gets immediate attention; a low-impact cosmetic issue can wait. Clear severity definitions remove debate during stress.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Communication is part of the job.",
        "Root Cause Analysis (RCA)",
        "Root Cause Analysis (RCA) is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Root Cause Analysis (RCA) with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Root Cause Analysis (RCA) means”?",
      "options": [
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…",
        "The following comparison captures the distinctions that matter most when working with Root Cause Analysis (RCA):",
        "A production incident is an unplanned event that degrades or stops service."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full and connection or login failures.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Root Cause Analysis (RCA) fits”?",
      "options": [
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates.",
        "The following comparison captures the distinctions that matter most when working with Root Cause Analysis (RCA):",
        "The diagram below places Root Cause Analysis (RCA) alongside the core concepts of production incident management."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Root Cause Analysis (RCA) alongside the core concepts of production incident management. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Root Cause Analysis (RCA) in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The following comparison captures the distinctions that matter most when working with Root Cause Analysis (RCA):",
        "The diagram below places Root Cause Analysis (RCA) alongside the core concepts of production incident management."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Root Cause Analysis (RCA):”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Root Cause Analysis (RCA)”?",
      "options": [
        "The first example establishes the relevant state.",
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates.",
        "The following comparison captures the distinctions that matter most when working with Root Cause Analysis (RCA):"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within production incident management.”",
      "options": [
        "Root Cause Analysis (RCA)",
        "Root Cause Analysis (RCA) sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Root Cause Analysis (RCA) within production incident management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Root Cause Analysis (RCA) fits”?",
      "options": [
        "Use the following as a starting point when investigating Root Cause Analysis (RCA).",
        "The diagram below places Root Cause Analysis (RCA) alongside the core concepts of production incident management.",
        "Communication is part of the job."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Communication is part of the job. Regular, honest updates to stakeholders — what is known, what is being done, when the next update is — maintain trust and stop others from interrupting the responder.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Root Cause Analysis (RCA) in practice”?",
      "options": [
        "Root Cause Analysis (RCA)",
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates.",
        "The following comparison captures the distinctions that matter most when working with Root Cause Analysis (RCA):"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates. Blameless culture surfaces the real causes instead of hiding them.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Root Cause Analysis (RCA)”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Root Cause Analysis (RCA)",
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Root Cause Analysis (RCA). Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…",
        "Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations.",
        "Prioritisation weighs impact and urgency."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Prioritisation weighs impact and urgency. A high-impact, high-urgency incident gets immediate attention; a low-impact cosmetic issue can wait. Clear severity definitions remove debate during stress.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Communication is part of the job.",
        "Root Cause Analysis (RCA)",
        "Root Cause Analysis (RCA) is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Root Cause Analysis (RCA) with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Root Cause Analysis (RCA) means”?",
      "options": [
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…",
        "The following comparison captures the distinctions that matter most when working with Root Cause Analysis (RCA):",
        "A production incident is an unplanned event that degrades or stops service."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full and connection or login failures.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Root Cause Analysis (RCA) fits”?",
      "options": [
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates.",
        "The following comparison captures the distinctions that matter most when working with Root Cause Analysis (RCA):",
        "The diagram below places Root Cause Analysis (RCA) alongside the core concepts of production incident management."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Root Cause Analysis (RCA) alongside the core concepts of production incident management. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Root Cause Analysis (RCA) in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The following comparison captures the distinctions that matter most when working with Root Cause Analysis (RCA):",
        "The diagram below places Root Cause Analysis (RCA) alongside the core concepts of production incident management."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Root Cause Analysis (RCA):”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Root Cause Analysis (RCA)”?",
      "options": [
        "The first example establishes the relevant state.",
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates.",
        "The following comparison captures the distinctions that matter most when working with Root Cause Analysis (RCA):"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within production incident management.”",
      "options": [
        "Root Cause Analysis (RCA)",
        "Root Cause Analysis (RCA) sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Root Cause Analysis (RCA) within production incident management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Root Cause Analysis (RCA) fits”?",
      "options": [
        "Use the following as a starting point when investigating Root Cause Analysis (RCA).",
        "The diagram below places Root Cause Analysis (RCA) alongside the core concepts of production incident management.",
        "Communication is part of the job."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Communication is part of the job. Regular, honest updates to stakeholders — what is known, what is being done, when the next update is — maintain trust and stop others from interrupting the responder.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Root Cause Analysis (RCA) in practice”?",
      "options": [
        "Root Cause Analysis (RCA)",
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates.",
        "The following comparison captures the distinctions that matter most when working with Root Cause Analysis (RCA):"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates. Blameless culture surfaces the real causes instead of hiding them.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Root Cause Analysis (RCA)”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Root Cause Analysis (RCA)",
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Root Cause Analysis (RCA). Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…",
        "Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations.",
        "Prioritisation weighs impact and urgency."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Prioritisation weighs impact and urgency. A high-impact, high-urgency incident gets immediate attention; a low-impact cosmetic issue can wait. Clear severity definitions remove debate during stress.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Communication is part of the job.",
        "Root Cause Analysis (RCA)",
        "Root Cause Analysis (RCA) is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Root Cause Analysis (RCA) with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Root Cause Analysis (RCA) means”?",
      "options": [
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…",
        "The following comparison captures the distinctions that matter most when working with Root Cause Analysis (RCA):",
        "A production incident is an unplanned event that degrades or stops service."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full and connection or login failures.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Root Cause Analysis (RCA) fits”?",
      "options": [
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates.",
        "The following comparison captures the distinctions that matter most when working with Root Cause Analysis (RCA):",
        "The diagram below places Root Cause Analysis (RCA) alongside the core concepts of production incident management."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Root Cause Analysis (RCA) alongside the core concepts of production incident management. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Root Cause Analysis (RCA) in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The following comparison captures the distinctions that matter most when working with Root Cause Analysis (RCA):",
        "The diagram below places Root Cause Analysis (RCA) alongside the core concepts of production incident management."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Root Cause Analysis (RCA):”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Root Cause Analysis (RCA)”?",
      "options": [
        "The first example establishes the relevant state.",
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates.",
        "The following comparison captures the distinctions that matter most when working with Root Cause Analysis (RCA):"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Root Cause Analysis (RCA) is a fundamental concept in production incident management",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Root Cause Analysis (RCA) improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
