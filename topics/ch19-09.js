/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch19-09.html */

window.TOPIC = {
  id: "ch19-09",
  title: "Transaction Log Full",

  lead: "This topic covers Transaction Log Full — a concept you will meet repeatedly when working with production incident management. We build from first principles to production guidance.",

  objectives: [
    "Define what Transaction Log Full is and where it fits",
    "Explain how Transaction Log Full works internally",
    "Apply Transaction Log Full correctly in a production environment",
    "Recognise the common mistakes and risks involving Transaction Log Full",
    "Monitor and troubleshoot Transaction Log Full with the right tools"
  ],

  sections: [
    {
      h: "What Transaction Log Full means",
      html: `
<p>In this topic we examine <strong>Transaction Log Full</strong> within production incident management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>A production incident is an unplanned event that degrades or stops service. The priority is to restore service first, then find the root cause — investigation during an outage extends the outage.</p>
<p>Severity levels classify impact: Sev1 is a total outage or critical data loss, Sev2 a major degradation, Sev3 a limited impact. Severity drives response time, who is paged and how often stakeholders are updated.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Transaction Log Full is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Transaction Log Full fits",
      html: `
<p>Prioritisation weighs impact and urgency. A high-impact, high-urgency incident gets immediate attention; a low-impact cosmetic issue can wait. Clear severity definitions remove debate during stress.</p>
<p>The diagram below places Transaction Log Full alongside the core concepts of production incident management. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Transaction Log Full layers">
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
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Transaction Log Full</text>
  </svg>
  <div class="figcaption">Figure 1 — Production incident management: how Transaction Log Full relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Transaction Log Full in practice",
      html: `
<p>The response lifecycle is detect, triage, diagnose, mitigate, resolve and review. Triage assigns severity and an owner; mitigation restores service, sometimes with a workaround; the post-incident review prevents recurrence.</p>
<p>The following comparison captures the distinctions that matter most when working with Transaction Log Full:</p>
<table>
  <tr><th>Severity</th><th>Definition</th><th>Response</th></tr>
  <tr><td>Sev 1</td><td>Total outage / data loss</td><td>Immediate page, continuous updates</td></tr>
  <tr><td>Sev 2</td><td>Major degradation</td><td>Same hour, frequent updates</td></tr>
  <tr><td>Sev 3</td><td>Limited impact</td><td>Next business day</td></tr>
</table>
<p>Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full and connection or login failures.</p>
      `,
    },
    {
      h: "Working with Transaction Log Full",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Transaction Log Full. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Transaction Log Full
-- Is the instance up, what is slow, and what is blocked?
SELECT @@SERVERNAME AS server, getdate() AS now;
SELECT session_id, status, command, blocking_session_id,
       wait_type, total_elapsed_time
FROM   sys.dm_exec_requests
WHERE  session_id > 50
ORDER BY total_elapsed_time DESC;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Transaction Log Full
-- Log and volume usage during a full-disk incident
SELECT name, size / 128 AS size_mb,
       max_size, growth
FROM   sys.database_files WHERE type_desc = 'LOG';</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-powershell">-- Transaction Log Full
Get-Service -Name 'MSSQL*','SQLSERVERAGENT' |
  Select-Object Name, Status, StartType
Get-WinEvent -LogName System -MaxEvents 20 |
  Where-Object { $_.LevelDisplayName -eq 'Error' }
</code></pre>
<p>Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations. Runbooks reduce errors and speed response when adrenaline is high and time is short.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Communication is part of the job. Regular, honest updates to stakeholders — what is known, what is being done, when the next update is — maintain trust and stop others from interrupting the responder.</p>
<table>
  <tr><th>Incident</th><th>First check</th><th>Typical mitigation</th></tr>
  <tr><td>Server down</td><td>Ping, service state</td><td>Failover / restart</td></tr>
  <tr><td>Log full</td><td>Log usage DMV</td><td>Log backup / grow</td></tr>
  <tr><td>Slow DB</td><td>Waits, blocking</td><td>Kill blocker / fix query</td></tr>
</table>
<p>Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates. Blameless culture surfaces the real causes instead of hiding them.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Transaction Log Full, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Transaction Log Full",
      html: `
<p>This section consolidates <strong>Transaction Log Full</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>The response lifecycle is detect, triage, diagnose, mitigate, resolve and review. Triage assigns severity and an owner; mitigation restores service, sometimes with a workaround; the post-incident review prevents recurrence.</p>
<p>Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full and connection or login failures.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Transaction Log Full sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Severity</th><th>Definition</th><th>Response</th></tr>
  <tr><td>Sev 1</td><td>Total outage / data loss</td><td>Immediate page, continuous updates</td></tr>
  <tr><td>Sev 2</td><td>Major degradation</td><td>Same hour, frequent updates</td></tr>
  <tr><td>Sev 3</td><td>Limited impact</td><td>Next business day</td></tr>
</table>
<p>Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations. Runbooks reduce errors and speed response when adrenaline is high and time is short.</p>
<p>Use the following as a starting point when investigating Transaction Log Full. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Transaction Log Full
-- Log and volume usage during a full-disk incident
SELECT name, size / 128 AS size_mb,
       max_size, growth
FROM   sys.database_files WHERE type_desc = 'LOG';</code></pre>
<p>Communication is part of the job. Regular, honest updates to stakeholders — what is known, what is being done, when the next update is — maintain trust and stop others from interrupting the responder.</p>
      `,
    }
  ],

  scenario: {
    title: "Transaction log full at 02:00",
    html: `
Alerts fired as the transaction log hit 100%. The on-call DBA checked and found a failed log-backup job after a recovery-model change. Taking an emergency log backup freed space immediately; the DBA then fixed the job, alerted on log usage at 70% and 85%, and added a check that a FULL-model database has recent log backups. Service was restored in minutes.
<p><strong>The Transaction Log Full lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
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
        "Transaction Log Full",
        "Same hour, frequent updates",
        "Next business day"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Transaction Log Full within production incident management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Transaction Log Full fits”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "Prioritisation weighs impact and urgency."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Prioritisation weighs impact and urgency. A high-impact, high-urgency incident gets immediate attention; a low-impact cosmetic issue can wait. Clear severity definitions remove debate during stress.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Transaction Log Full in practice”?",
      "options": [
        "With Transaction Log Full, prefer measured, reversible changes.",
        "The response lifecycle is detect, triage, diagnose, mitigate, resolve and review.",
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The response lifecycle is detect, triage, diagnose, mitigate, resolve and review. Triage assigns severity and an owner; mitigation restores service, sometimes with a workaround; the post-incident review prevents recurrence.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Transaction Log Full”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Communication is part of the job.",
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Transaction Log Full. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Communication is part of the job."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Communication is part of the job. Regular, honest updates to stakeholders — what is known, what is being done, when the next update is — maintain trust and stop others from interrupting the responder.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Communication is part of the job.",
        "Transaction Log Full",
        "Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Transaction Log Full with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Transaction Log Full means”?",
      "options": [
        "A production incident is an unplanned event that degrades or stops service.",
        "Failover / restart",
        "Log backup / grow"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A production incident is an unplanned event that degrades or stops service. The priority is to restore service first, then find the root cause — investigation during an outage extends the outage.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Transaction Log Full fits”?",
      "options": [
        "With Transaction Log Full, prefer measured, reversible changes.",
        "Failover / restart",
        "The diagram below places Transaction Log Full alongside the core concepts of production incident management."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Transaction Log Full alongside the core concepts of production incident management. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Transaction Log Full in practice”?",
      "options": [
        "Transaction Log Full sits inside a larger system.",
        "The following comparison captures the distinctions that matter most when working with Transaction Log Full:",
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Transaction Log Full:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Transaction Log Full”?",
      "options": [
        "The first example establishes the relevant state.",
        "Transaction Log Full sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within production incident management.”",
      "options": [
        "Transaction Log Full",
        "Same hour, frequent updates",
        "Next business day"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Transaction Log Full within production incident management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Transaction Log Full fits”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "Prioritisation weighs impact and urgency."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Prioritisation weighs impact and urgency. A high-impact, high-urgency incident gets immediate attention; a low-impact cosmetic issue can wait. Clear severity definitions remove debate during stress.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Transaction Log Full in practice”?",
      "options": [
        "With Transaction Log Full, prefer measured, reversible changes.",
        "The response lifecycle is detect, triage, diagnose, mitigate, resolve and review.",
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The response lifecycle is detect, triage, diagnose, mitigate, resolve and review. Triage assigns severity and an owner; mitigation restores service, sometimes with a workaround; the post-incident review prevents recurrence.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Transaction Log Full”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Communication is part of the job.",
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Transaction Log Full. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Communication is part of the job."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Communication is part of the job. Regular, honest updates to stakeholders — what is known, what is being done, when the next update is — maintain trust and stop others from interrupting the responder.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Communication is part of the job.",
        "Transaction Log Full",
        "Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Transaction Log Full with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Transaction Log Full means”?",
      "options": [
        "A production incident is an unplanned event that degrades or stops service.",
        "Failover / restart",
        "Log backup / grow"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A production incident is an unplanned event that degrades or stops service. The priority is to restore service first, then find the root cause — investigation during an outage extends the outage.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Transaction Log Full fits”?",
      "options": [
        "With Transaction Log Full, prefer measured, reversible changes.",
        "Failover / restart",
        "The diagram below places Transaction Log Full alongside the core concepts of production incident management."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Transaction Log Full alongside the core concepts of production incident management. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Transaction Log Full in practice”?",
      "options": [
        "Transaction Log Full sits inside a larger system.",
        "The following comparison captures the distinctions that matter most when working with Transaction Log Full:",
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Transaction Log Full:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Transaction Log Full”?",
      "options": [
        "The first example establishes the relevant state.",
        "Transaction Log Full sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within production incident management.”",
      "options": [
        "Transaction Log Full",
        "Same hour, frequent updates",
        "Next business day"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Transaction Log Full within production incident management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Transaction Log Full fits”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "Prioritisation weighs impact and urgency."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Prioritisation weighs impact and urgency. A high-impact, high-urgency incident gets immediate attention; a low-impact cosmetic issue can wait. Clear severity definitions remove debate during stress.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Transaction Log Full in practice”?",
      "options": [
        "With Transaction Log Full, prefer measured, reversible changes.",
        "The response lifecycle is detect, triage, diagnose, mitigate, resolve and review.",
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The response lifecycle is detect, triage, diagnose, mitigate, resolve and review. Triage assigns severity and an owner; mitigation restores service, sometimes with a workaround; the post-incident review prevents recurrence.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Transaction Log Full”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Communication is part of the job.",
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Transaction Log Full. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Communication is part of the job."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Communication is part of the job. Regular, honest updates to stakeholders — what is known, what is being done, when the next update is — maintain trust and stop others from interrupting the responder.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Communication is part of the job.",
        "Transaction Log Full",
        "Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Transaction Log Full with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Transaction Log Full means”?",
      "options": [
        "A production incident is an unplanned event that degrades or stops service.",
        "Failover / restart",
        "Log backup / grow"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A production incident is an unplanned event that degrades or stops service. The priority is to restore service first, then find the root cause — investigation during an outage extends the outage.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Transaction Log Full fits”?",
      "options": [
        "With Transaction Log Full, prefer measured, reversible changes.",
        "Failover / restart",
        "The diagram below places Transaction Log Full alongside the core concepts of production incident management."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Transaction Log Full alongside the core concepts of production incident management. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Transaction Log Full in practice”?",
      "options": [
        "Transaction Log Full sits inside a larger system.",
        "The following comparison captures the distinctions that matter most when working with Transaction Log Full:",
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Transaction Log Full:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Transaction Log Full”?",
      "options": [
        "The first example establishes the relevant state.",
        "Transaction Log Full sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Transaction Log Full is a fundamental concept in production incident management",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Transaction Log Full improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
