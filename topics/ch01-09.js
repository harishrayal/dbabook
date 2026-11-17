/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch01-09.html */

window.TOPIC = {
  id: "ch01-09",
  title: "Incident Management and Escalation",

  lead: "Incident management is the discipline of restoring service under time pressure with incomplete information — and escalation is knowing exactly when and to whom to hand the problem over.",

  objectives: [
    "Distinguish incidents from problems and ordinary changes",
    "Classify incidents by severity and response expectations",
    "Follow a repeatable lifecycle from detection to post-incident review",
    "Apply clear escalation triggers instead of guessing"
  ],

  sections: [
    {
      h: "What counts as an incident",
      html: `
<p>An <strong>incident</strong> is an unplanned interruption of a service, or a degradation serious enough to need urgent restoration. The definition matters because it triggers a process — severity, roles, communication — rather than an improvised heroic effort. Three related terms are worth separating:</p>
<ul>
  <li><strong>Incident</strong> — “production is down or degraded right now”: restore service first</li>
  <li><strong>Problem</strong> — the underlying cause of one or more incidents: find it after service is restored</li>
  <li><strong>Change</strong> — a planned modification with review and a window: prevent incidents before they start</li>
</ul>
<p>Severity sets the response. Most organisations run a four-level scale, and the DBA needs to know instantly which one they are in:</p>
<table>
  <tr><th>Severity</th><th>Definition</th><th>Response</th><th>Example</th></tr>
  <tr><td><strong>Sev1</strong></td><td>Core service down or data at risk</td><td>Immediate, all hands, executive comms</td><td>Orders database not accepting writes</td></tr>
  <tr><td><strong>Sev2</strong></td><td>Major function degraded, no workaround</td><td>Immediate, business-hours comms</td><td>Reporting unusable at month end</td></tr>
  <tr><td><strong>Sev3</strong></td><td>Partial degradation with a workaround</td><td>Next business day, ticket tracked</td><td>One slow dashboard, data still correct</td></tr>
  <tr><td><strong>Sev4</strong></td><td>Minor issue, cosmetic or informational</td><td>Backlog</td><td>Log noise, minor space warning</td></tr>
</table>
<p>The most dangerous misclassification is calling a Sev1 a Sev3: the team “looks into it tomorrow” while data or revenue quietly bleeds. When in doubt, classify higher and downgrade after facts arrive.</p>
`
    },
    {
      h: "The incident lifecycle",
      html: `
<p>Every incident follows the same shape. The organisation's job is to make the shape predictable so responders can think about the problem instead of the process:</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Incident lifecycle from detection to review">
    <defs>
      <marker id="inc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
      <marker id="inc-arrow-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--amber)"/>
      </marker>
    </defs>

    <rect x="270" y="24" width="220" height="52" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="46" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Alert or user report</text>
    <text x="380" y="66" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">detection is part of the clock</text>

    <rect x="25" y="125" width="130" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="90" y="154" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Detect</text>
    <text x="90" y="176" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">symptom seen</text>

    <rect x="175" y="125" width="130" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="240" y="154" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Triage</text>
    <text x="240" y="176" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">scope · severity</text>

    <rect x="325" y="125" width="130" height="70" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="390" y="154" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Mitigate</text>
    <text x="390" y="176" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">restore service</text>

    <rect x="475" y="125" width="130" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="540" y="154" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Resolve</text>
    <text x="540" y="176" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">confirm · close</text>

    <rect x="625" y="125" width="130" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="690" y="154" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Review</text>
    <text x="690" y="176" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">prevent recurrence</text>

    <line x1="380" y1="76" x2="300" y2="123" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#inc-arrow)"/>
    <line x1="155" y1="160" x2="173" y2="160" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#inc-arrow)"/>
    <line x1="305" y1="160" x2="323" y2="160" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#inc-arrow)"/>
    <line x1="455" y1="160" x2="473" y2="160" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#inc-arrow)"/>
    <line x1="605" y1="160" x2="623" y2="160" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#inc-arrow)"/>

    <rect x="240" y="250" width="280" height="54" rx="10" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="380" y="272" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Post-incident review</text>
    <text x="380" y="292" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">timeline · cause · prevention items</text>

    <line x1="690" y1="195" x2="522" y2="268" stroke="var(--amber)" stroke-width="1.8" marker-end="url(#inc-arrow-amber)"/>
    <line x1="240" y1="278" x2="100" y2="197" stroke="var(--amber)" stroke-width="1.8" stroke-dasharray="6 5" marker-end="url(#inc-arrow-amber)"/>

    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Mitigate first, diagnose fully later — the review loop is what stops the second occurrence.</text>
  </svg>
  <div class="figcaption">Figure 1 — The incident loop: restore service, then feed prevention back into detection.</div>
</div>
<p>Two principles govern the middle of that diagram. <strong>Mitigation before root cause</strong> — restarting the failing component, failing over, or killing the head blocker buys the time to investigate properly. And <strong>service restoration outranks curiosity</strong>: understanding why it broke matters less, in the first ten minutes, than ending the user impact.</p>
`
    },
    {
      h: "Triage under pressure",
      html: `
<p>The first five minutes of an incident are structured fact-gathering. For a database incident, the sequence is almost always the same — one query often answers most of it:</p>
<pre><code class="language-sql">-- First query in a database incident: what is running and blocking?
SELECT r.session_id,
       r.status,
       r.wait_type,
       r.wait_time,
       r.blocking_session_id,
       r.cpu_time,
       r.reads,
       r.writes,
       t.text AS sql_text
FROM   sys.dm_exec_requests AS r
CROSS  APPLY sys.dm_exec_sql_text(r.sql_handle) AS t
WHERE  r.session_id &lt;&gt; @@SPID
AND    (r.blocking_session_id &lt;&gt; 0 OR r.wait_time &gt; 5000)
ORDER  BY r.blocking_session_id DESC, r.wait_time DESC;</code></pre>
<p>From there, the standard fact set — collect it before touching anything:</p>
<ol>
  <li><strong>What changed?</strong> — deploy, patch, job run, storage event, statistics update</li>
  <li><strong>What is the scope?</strong> — one database, one instance, or the whole estate? One query or all traffic?</li>
  <li><strong>Is it blocking, failing, or slow?</strong> — these are three different problems with three different first moves</li>
  <li><strong>Is data at risk?</strong> — log full, corruption, failed backup: this raises severity immediately</li>
  <li><strong>What is the simplest safe mitigation?</strong> — failover, kill the head blocker, stop the job, revert the change</li>
</ol>
<p>Throughout, communication runs on a fixed cadence — a short update at agreed intervals to the incident channel, even when the update is “still investigating”. Silence is what turns a technical incident into an organisational crisis.</p>
`
    },
    {
      h: "Escalation: when and to whom",
      html: `
<p>Escalation is not a failure; it is a routing decision. The DBA escalates when the problem leaves their control — and the triggers should be written down so nobody has to decide them from memory at 3 AM:</p>
<table>
  <tr><th>Signal</th><th>Escalate to</th><th>Trigger</th></tr>
  <tr><td>Storage full or I/O subsystem fault</td><td>Infrastructure / storage team</td><td>Immediate for Sev1, same day otherwise</td></tr>
  <tr><td>Network latency or failover of the cluster</td><td>Network / Windows team</td><td>Within minutes for Sev1</td></tr>
  <tr><td>Suspected engine defect</td><td>Microsoft support (with a case)</td><td>After initial triage confirms it</td></tr>
  <tr><td>Application-level logic error</td><td>Development team on call</td><td>As soon as evidence points there</td></tr>
  <tr><td>Customer or regulatory impact</td><td>Management / communications</td><td>Immediately, in parallel — never after</td></tr>
</table>
<p>Escalating <em>with evidence</em> is what makes it effective: symptom, scope, what has been tried, the current hypothesis, and the specific help needed. “It's slow, please fix” transfers the panic without transferring the information.</p>
<p>Equally important is what <strong>not</strong> to do: do not restart the database before capturing the evidence (running requests, wait stats, error log) — a restart destroys the scene; do not sit on a Sev1 waiting to be sure; do not apply an untested fix to production simply because the channel is watching.</p>
`
    },
    {
      h: "After the incident",
      html: `
<p>The incident is not over when service is restored. The post-incident review is where the organisation pays or declines the debt:</p>
<ul>
  <li><strong>Reconstruct the timeline</strong> — detection, actions, decisions, and their exact times; memory is unreliable an hour later</li>
  <li><strong>Find the contributing causes</strong>, not just the trigger — usually an unreviewed change, a missing alert, or an untested runbook sits behind the technical fault</li>
  <li><strong>Agree prevention items with owners and dates</strong> — “we should add monitoring” is not an action; “alert on job failure by Friday, owned by A” is</li>
  <li><strong>Update the runbook</strong> — if the incident took longer to diagnose than to fix, the runbook failed, not the DBA</li>
  <li><strong>Keep it blameless</strong> — people follow incentives and missing information; blame makes the next incident get hidden instead of handled</li>
</ul>
<p>The tell of a healthy culture is whether incidents get reported quickly and early. The tell of an unhealthy one is the incident that nobody knew about until the customer complained — which is almost always a detection and escalation failure, not a technical one.</p>
`
    }
  ],

  scenario: {
    title: "Sev1 at 04:50 — the orders database would not accept writes",
    html: `
<p>The on-call DBA is paged at 4:50 AM: order writes are failing with “The transaction log for database 'Orders' is full”. First triage in the incident channel — scope is one database, the application is erroring, no corruption reported, no change window was open. The DMV query shows no blocking; <code>log_reuse_wait_desc</code> says LOG_BACKUP, and the log backup job last succeeded at 03:05, when the nightly archive job began filling the log with a multi-million-row index build that ran long and never committed.</p>
<p>Mitigation came first: the DBA stopped the archive job (rollback released the log pressure path), took an emergency log backup, and confirmed writes resuming at 4:58 — eight minutes of write unavailability, classified Sev1 because orders were blocked. Root cause was diagnosed afterwards: the archive job had no runtime limit and no alerting, and it had never been scheduled against the log backup interval.</p>
<p>The post-incident review produced three dated prevention items: a maximum-runtime alert on the archive job, a log-space alert at 70%, and a runbook section for “log full” with the exact DMV queries used that night. <strong>The service was restored in eight minutes; the review ensured the incident never needed to happen again.</strong></p>
`
  },

  interview: [
    {
      q: "Walk me through the first ten minutes of a Sev1 database outage.",
      a: "Declare Sev1 and open the incident channel with a named lead. Establish scope: what is down, since when, what changed in the last 24 hours. Run triage queries for blocking, failing requests, and log/disk state. Choose the fastest safe mitigation — failover, kill the head blocker, stop the offending job, or revert the change — while capturing evidence first. Then communicate a status update on the agreed cadence, even if it is still 'investigating'."
    },
    {
      q: "When do you escalate?",
      a: "As soon as the problem leaves my control or the severity demands parallel work: storage and network faults to their teams immediately, suspected engine defects to vendor support after triage, application logic errors to the dev on-call, and customer or regulatory impact to management in parallel — never after the fact. Escalation carries evidence: symptom, scope, actions taken, hypothesis, and the specific help needed."
    },
    {
      q: "What must a post-incident review contain?",
      a: "An accurate timeline of detection and actions, the root cause and contributing factors, what was done well and badly, and prevention items with named owners and dates — plus any runbook updates the incident exposed. It should be blameless: the goal is to fix the system that produced the incident, not to find the person who was in it."
    }
  ],

  takeaways: [
    "Incidents interrupt service, problems explain it, changes prevent it — each has its own process",
    "Classify severity immediately and never under-classify an outage while waiting for certainty",
    "Mitigate first: restore service with the simplest safe action, capturing evidence before any restart",
    "Escalate on written triggers with evidence — and never sit on a Sev1 to be sure",
    "The post-incident review is the job: timeline, causes, and prevention items with owners and dates"
  ]
};
