/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch19-11.html */

window.TOPIC = {
  id: "ch19-11",
  title: "Database Corruption",

  lead: "Understanding Database Corruption is essential for anyone responsible for production incident management. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what Database Corruption is and where it fits",
    "Explain how Database Corruption works internally",
    "Apply Database Corruption correctly in a production environment",
    "Recognise the common mistakes and risks involving Database Corruption",
    "Monitor and troubleshoot Database Corruption with the right tools"
  ],

  sections: [
    {
      h: "What Database Corruption means",
      html: `
<p>In this topic we examine <strong>Database Corruption</strong> within production incident management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Prioritisation weighs impact and urgency. A high-impact, high-urgency incident gets immediate attention; a low-impact cosmetic issue can wait. Clear severity definitions remove debate during stress.</p>
<p>The response lifecycle is detect, triage, diagnose, mitigate, resolve and review. Triage assigns severity and an owner; mitigation restores service, sometimes with a workaround; the post-incident review prevents recurrence.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Database Corruption is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Database Corruption fits",
      html: `
<p>Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full and connection or login failures.</p>
<p>The diagram below places Database Corruption alongside the core concepts of production incident management. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Database Corruption flow">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="230" y="12" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="39" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Severity</text>
    <rect x="230" y="66" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="93" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Incident</text>
    <rect x="230" y="120" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="147" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Escalation</text>
    <rect x="230" y="174" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="201" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. RCA</text>
    <rect x="230" y="228" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="255" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Runbook</text>
    <rect x="230" y="282" width="300" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="309" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">6. Communication</text>
    <line x1="380" y1="56" x2="380" y2="66" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="110" x2="380" y2="120" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="164" x2="380" y2="174" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="218" x2="380" y2="228" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="272" x2="380" y2="282" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Database Corruption</text>
  </svg>
  <div class="figcaption">Figure 1 — Production incident management: how Database Corruption relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Database Corruption in practice",
      html: `
<p>Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations. Runbooks reduce errors and speed response when adrenaline is high and time is short.</p>
<p>The following comparison captures the distinctions that matter most when working with Database Corruption:</p>
<table>
  <tr><th>Severity</th><th>Definition</th><th>Response</th></tr>
  <tr><td>Sev 1</td><td>Total outage / data loss</td><td>Immediate page, continuous updates</td></tr>
  <tr><td>Sev 2</td><td>Major degradation</td><td>Same hour, frequent updates</td></tr>
  <tr><td>Sev 3</td><td>Limited impact</td><td>Next business day</td></tr>
</table>
<p>Communication is part of the job. Regular, honest updates to stakeholders — what is known, what is being done, when the next update is — maintain trust and stop others from interrupting the responder.</p>
      `,
    },
    {
      h: "Working with Database Corruption",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Database Corruption. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Database Corruption
-- Is the instance up, what is slow, and what is blocked?
SELECT @@SERVERNAME AS server, getdate() AS now;
SELECT session_id, status, command, blocking_session_id,
       wait_type, total_elapsed_time
FROM   sys.dm_exec_requests
WHERE  session_id > 50
ORDER BY total_elapsed_time DESC;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Database Corruption
-- Log and volume usage during a full-disk incident
SELECT name, size / 128 AS size_mb,
       max_size, growth
FROM   sys.database_files WHERE type_desc = 'LOG';</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-powershell">-- Database Corruption
Get-Service -Name 'MSSQL*','SQLSERVERAGENT' |
  Select-Object Name, Status, StartType
Get-WinEvent -LogName System -MaxEvents 20 |
  Where-Object { $_.LevelDisplayName -eq 'Error' }
</code></pre>
<p>Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates. Blameless culture surfaces the real causes instead of hiding them.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>A production incident is an unplanned event that degrades or stops service. The priority is to restore service first, then find the root cause — investigation during an outage extends the outage.</p>
<table>
  <tr><th>Incident</th><th>First check</th><th>Typical mitigation</th></tr>
  <tr><td>Server down</td><td>Ping, service state</td><td>Failover / restart</td></tr>
  <tr><td>Log full</td><td>Log usage DMV</td><td>Log backup / grow</td></tr>
  <tr><td>Slow DB</td><td>Waits, blocking</td><td>Kill blocker / fix query</td></tr>
</table>
<p>Severity levels classify impact: Sev1 is a total outage or critical data loss, Sev2 a major degradation, Sev3 a limited impact. Severity drives response time, who is paged and how often stakeholders are updated.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Database Corruption, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Database Corruption",
      html: `
<p>This section consolidates <strong>Database Corruption</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations. Runbooks reduce errors and speed response when adrenaline is high and time is short.</p>
<p>Communication is part of the job. Regular, honest updates to stakeholders — what is known, what is being done, when the next update is — maintain trust and stop others from interrupting the responder.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Database Corruption sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Severity</th><th>Definition</th><th>Response</th></tr>
  <tr><td>Sev 1</td><td>Total outage / data loss</td><td>Immediate page, continuous updates</td></tr>
  <tr><td>Sev 2</td><td>Major degradation</td><td>Same hour, frequent updates</td></tr>
  <tr><td>Sev 3</td><td>Limited impact</td><td>Next business day</td></tr>
</table>
<p>Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates. Blameless culture surfaces the real causes instead of hiding them.</p>
<p>Use the following as a starting point when investigating Database Corruption. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Database Corruption
-- Is the instance up, what is slow, and what is blocked?
SELECT @@SERVERNAME AS server, getdate() AS now;
SELECT session_id, status, command, blocking_session_id,
       wait_type, total_elapsed_time
FROM   sys.dm_exec_requests
WHERE  session_id > 50
ORDER BY total_elapsed_time DESC;</code></pre>
<p>A production incident is an unplanned event that degrades or stops service. The priority is to restore service first, then find the root cause — investigation during an outage extends the outage.</p>
      `,
    }
  ],

  scenario: {
    title: "Transaction log full at 02:00",
    html: `
Alerts fired as the transaction log hit 100%. The on-call DBA checked and found a failed log-backup job after a recovery-model change. Taking an emergency log backup freed space immediately; the DBA then fixed the job, alerted on log usage at 70% and 85%, and added a check that a FULL-model database has recent log backups. Service was restored in minutes.
<p><strong>The Database Corruption lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
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
    },
    {
      q: "What is your priority order during a Sev1 outage?",
      a: `
Restore service first using the safest tested mitigation, communicate status at a fixed cadence, preserve evidence for later analysis, and only then pursue the deep root cause — extending an outage to investigate is a second failure.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within production incident management.”",
      "options": [
        "The first example establishes the relevant state.",
        "Database Corruption",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Database Corruption within production incident management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Database Corruption fits”?",
      "options": [
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…",
        "Next, verify the result and capture a baseline.",
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full and connection or login failures.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Database Corruption in practice”?",
      "options": [
        "Failover / restart",
        "Log backup / grow",
        "Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations. Runbooks reduce errors and speed response when adrenaline is high and time is short.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Database Corruption”?",
      "options": [
        "Failover / restart",
        "Theory becomes useful when you can apply it.",
        "With Database Corruption, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Database Corruption. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "A production incident is an unplanned event that degrades or stops service.",
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates.",
        "Database Corruption sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A production incident is an unplanned event that degrades or stops service. The priority is to restore service first, then find the root cause — investigation during an outage extends the outage.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Severity levels classify impact: Sev1 is a total outage or critical data loss, Sev2 a major degradation, Sev3 a limited impact.",
        "With Database Corruption, prefer measured, reversible changes.",
        "Database Corruption"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Database Corruption with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Database Corruption means”?",
      "options": [
        "Database Corruption",
        "Prioritisation weighs impact and urgency.",
        "Kill blocker / fix query"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Prioritisation weighs impact and urgency. A high-impact, high-urgency incident gets immediate attention; a low-impact cosmetic issue can wait. Clear severity definitions remove debate during stress.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Database Corruption fits”?",
      "options": [
        "The diagram below places Database Corruption alongside the core concepts of production incident management.",
        "Log backup / grow",
        "Kill blocker / fix query"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Database Corruption alongside the core concepts of production incident management. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Database Corruption in practice”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Database Corruption.",
        "The following comparison captures the distinctions that matter most when working with Database Corruption:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Database Corruption:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Database Corruption”?",
      "options": [
        "Use the following as a starting point when investigating Database Corruption.",
        "The first example establishes the relevant state.",
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within production incident management.”",
      "options": [
        "The first example establishes the relevant state.",
        "Database Corruption",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Database Corruption within production incident management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Database Corruption fits”?",
      "options": [
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…",
        "Next, verify the result and capture a baseline.",
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full and connection or login failures.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Database Corruption in practice”?",
      "options": [
        "Failover / restart",
        "Log backup / grow",
        "Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations. Runbooks reduce errors and speed response when adrenaline is high and time is short.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Database Corruption”?",
      "options": [
        "Failover / restart",
        "Theory becomes useful when you can apply it.",
        "With Database Corruption, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Database Corruption. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "A production incident is an unplanned event that degrades or stops service.",
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates.",
        "Database Corruption sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A production incident is an unplanned event that degrades or stops service. The priority is to restore service first, then find the root cause — investigation during an outage extends the outage.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Severity levels classify impact: Sev1 is a total outage or critical data loss, Sev2 a major degradation, Sev3 a limited impact.",
        "With Database Corruption, prefer measured, reversible changes.",
        "Database Corruption"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Database Corruption with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Database Corruption means”?",
      "options": [
        "Database Corruption",
        "Prioritisation weighs impact and urgency.",
        "Kill blocker / fix query"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Prioritisation weighs impact and urgency. A high-impact, high-urgency incident gets immediate attention; a low-impact cosmetic issue can wait. Clear severity definitions remove debate during stress.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Database Corruption fits”?",
      "options": [
        "The diagram below places Database Corruption alongside the core concepts of production incident management.",
        "Log backup / grow",
        "Kill blocker / fix query"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Database Corruption alongside the core concepts of production incident management. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Database Corruption in practice”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Database Corruption.",
        "The following comparison captures the distinctions that matter most when working with Database Corruption:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Database Corruption:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Database Corruption”?",
      "options": [
        "Use the following as a starting point when investigating Database Corruption.",
        "The first example establishes the relevant state.",
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within production incident management.”",
      "options": [
        "The first example establishes the relevant state.",
        "Database Corruption",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Database Corruption within production incident management. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Database Corruption fits”?",
      "options": [
        "Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full…",
        "Next, verify the result and capture a baseline.",
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Common database incidents include server or service down, database offline, disk or log full, backup failure, corruption, slow performance, blocking, high CPU/memory, tempdb full and connection or login failures.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Database Corruption in practice”?",
      "options": [
        "Failover / restart",
        "Log backup / grow",
        "Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Each incident type has a runbook: a concise, tested set of diagnostic steps and safe mitigations. Runbooks reduce errors and speed response when adrenaline is high and time is short.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Database Corruption”?",
      "options": [
        "Failover / restart",
        "Theory becomes useful when you can apply it.",
        "With Database Corruption, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Database Corruption. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "A production incident is an unplanned event that degrades or stops service.",
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates.",
        "Database Corruption sits inside a larger system."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A production incident is an unplanned event that degrades or stops service. The priority is to restore service first, then find the root cause — investigation during an outage extends the outage.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Severity levels classify impact: Sev1 is a total outage or critical data loss, Sev2 a major degradation, Sev3 a limited impact.",
        "With Database Corruption, prefer measured, reversible changes.",
        "Database Corruption"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Database Corruption with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Database Corruption means”?",
      "options": [
        "Database Corruption",
        "Prioritisation weighs impact and urgency.",
        "Kill blocker / fix query"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Prioritisation weighs impact and urgency. A high-impact, high-urgency incident gets immediate attention; a low-impact cosmetic issue can wait. Clear severity definitions remove debate during stress.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Database Corruption fits”?",
      "options": [
        "The diagram below places Database Corruption alongside the core concepts of production incident management.",
        "Log backup / grow",
        "Kill blocker / fix query"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Database Corruption alongside the core concepts of production incident management. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Database Corruption in practice”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Use the following as a starting point when investigating Database Corruption.",
        "The following comparison captures the distinctions that matter most when working with Database Corruption:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Database Corruption:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Database Corruption”?",
      "options": [
        "Use the following as a starting point when investigating Database Corruption.",
        "The first example establishes the relevant state.",
        "Root cause analysis and blameless post-incident reports capture what happened, why, and the concrete prevention actions with owners and dates."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Database Corruption is a fundamental concept in production incident management",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Database Corruption improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
