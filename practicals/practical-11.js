/* Practical content file — one JS file per practical lab.
   Rendered by assets/js/site.js on practicals/practical-11.html */

window.TOPIC = {
  id: "practical-11",
  title: "Production Scenarios",

  lead: "A capstone incident-response lab: work through eleven realistic production scenarios — service down, log full, disk full, corruption, failed restore, runaway query and more — using a consistent diagnose-mitigate-prevent method.",

  objectives: [
    "Apply a consistent incident-response method",
    "Diagnose eleven common production failure types",
    "Choose safe mitigations that restore service first",
    "Communicate status and severity under pressure",
    "Turn each incident into documented prevention"
  ],

  sections: [
    {
      h: "Before you start",
      html: `
<p>This lab is a simulation of real on-call work. For each scenario you will identify symptoms, choose the right first diagnostic, apply a safe mitigation, and record a prevention action — without touching a real production system.</p>
<p>Use your lab instance to reproduce what is safe to reproduce: a full log, a blocking chain, a failed job, a slow query. For destructive scenarios such as corruption, reason through the response using the runbook rather than causing damage.</p>
<p><strong>Environment check</strong> — confirm where you are before changing anything; this habit prevents production mistakes:</p>
<pre><code class="language-sql">-- Lab step
-- Generic first-response triage: state, blockers, log, space
SELECT @@SERVERNAME AS server, getdate() AS now;
GO
SELECT session_id, status, command, blocking_session_id,
       wait_type, total_elapsed_time
FROM   sys.dm_exec_requests
WHERE  session_id > 50
ORDER BY total_elapsed_time DESC;
GO
SELECT name, size / 128 AS size_mb
FROM   sys.database_files WHERE type_desc = 'LOG';
GO</code></pre>
      `,
    },
    {
      h: "Lab architecture",
      html: `
<p>The priority in any incident is to restore service first and find the root cause second. Investigating during an outage extends the outage. Protect evidence, mitigate safely, then analyse once users are serving again.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Incident response method">
    <defs>
      <marker id="pa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="200" y="10" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="31" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Classify severity</text>
    <line x1="380" y1="54" x2="380" y2="64" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="64" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="85" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Gather evidence (DMVs / logs)</text>
    <line x1="380" y1="108" x2="380" y2="118" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="118" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="139" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Mitigate to restore service</text>
    <line x1="380" y1="162" x2="380" y2="172" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="172" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="193" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Verify recovery</text>
    <line x1="380" y1="216" x2="380" y2="226" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="226" width="360" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)"/>
    <text x="380" y="247" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Communicate + blameless review</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Incident response method</text>
  </svg>
  <div class="figcaption">Figure 1 — Classify, gather evidence, mitigate safely, verify, communicate, then prevent recurrence.</div>
</div>
<p>The method below is the one to apply to every scenario: classify severity, gather evidence, mitigate, verify recovery, communicate, then document prevention.</p>
      `,
    },
    {
      h: "Core tasks",
      html: `
<p>Work through the incident catalogue in the table. For each, write the first three queries or commands you would run and the safe mitigation you would choose — speed comes from rehearsal, not improvisation.</p>
<table>
  <tr><th>Scenario</th><th>First diagnostic</th><th>Safe mitigation</th></tr>
  <tr><td>Service down</td><td>Ping, Get-Service, error log</td><td>Start service / failover</td></tr>
  <tr><td>Log full</td><td>dm_db_log_space_usage</td><td>Emergency log backup</td></tr>
  <tr><td>Disk full</td><td>dm_os_volume_stats</td><td>Free space / move file / grow</td></tr>
  <tr><td>Corruption</td><td>Error log, CHECKDB</td><td>Page restore from backup</td></tr>
</table>
<p>A full transaction log is the classic: check log usage, find why it grew (failed log backup, long transaction, recovery model change), take an emergency log backup, then fix the underlying cause and add alerts at 70 and 85 percent.</p>
<pre><code class="language-powershell"># Lab step
-- Service and recent system errors (run in PowerShell)
Get-Service -Name 'MSSQL*','SQLSERVERAGENT' |
  Select-Object Name, Status, StartType | Format-Table -AutoSize
Get-WinEvent -LogName System -MaxEvents 30 |
  Where-Object { $_.LevelDisplayName -eq 'Error' } |
  Select-Object TimeCreated, Id, Message -First 10</code></pre>
      `,
    },
    {
      h: "Verify your work",
      html: `
<p>Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:</p>
<pre><code class="language-sql">-- Lab step
-- Emergency log backup when the log is full
BACKUP LOG ProductionDb
TO DISK = 'D:\Backups\ProductionDb_Emergency.trn'
WITH COMPRESSION, STATS = 10;
GO
-- Confirm log space is reclaimed
SELECT used_log_space_in_percent
FROM   sys.dm_db_log_space_usage;
GO
-- Ensure a FULL-model database has recent log backups
SELECT d.name, max(b.backup_finish_date) AS last_log
FROM   sys.databases d
LEFT JOIN msdb.dbo.backupset b
  ON b.database_name=d.name AND b.type='L'
WHERE  d.recovery_model_desc = 'FULL'
GROUP BY d.name;
GO</code></pre>
<p>A runaway query or blocking chain is diagnosed from dm_exec_requests and waits. Identify the head blocker, confirm with the application owner, stop it with approval if needed, then fix the query or index that caused it.</p>
<p>If the output differs, stop and correct it before moving on. A lab that 'looks right' but was never verified teaches the wrong lessons.</p>
      `,
    },
    {
      h: "Pitfalls and safe practice",
      html: `
<p>After each scenario, write a short post-incident note: timeline, impact, root cause and one concrete prevention action with an owner. Blameless reviews surface real causes; blame hides them.</p>
<table>
  <tr><th>Scenario</th><th>First diagnostic</th><th>Safe mitigation</th></tr>
  <tr><td>Failed restore</td><td>msdb backupset history</td><td>Correct sequence / verify backup</td></tr>
  <tr><td>Blocking storm</td><td>dm_exec_requests</td><td>Stop head blocker with approval</td></tr>
  <tr><td>Runaway query</td><td>Query stats + plan</td><td>Kill with approval, fix query</td></tr>
  <tr><td>Login failure</td><td>Error log, sys.server_principals</td><td>Unlock / reset / firewall</td></tr>
</table>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.</p>
</div>
      `,
    }
  ],

  steps: [
    "Write the severity definitions (Sev 1 to 3) and decide who is paged for each.",
    "For 'service down', list ping, Get-Service and error-log checks, then a failover or start action.",
    "For 'log full', run the log-usage query, reproduce a small growth, take an emergency log backup and confirm reclaimed space.",
    "For 'disk full', use dm_os_volume_stats to find the mount point and list safe options to free or add space.",
    "For 'corruption', reason through error 824, CHECKDB and page restore using the integrity lab — do not create real corruption.",
    "For 'failed restore', check msdb backupset history and identify a broken chain or wrong NORECOVERY sequence.",
    "For 'blocking storm', reproduce the lab scenario and practise finding and stopping the head blocker.",
    "For 'runaway query', use query stats and a plan to identify the expensive operator and mitigation.",
    "For each of the eleven scenarios, write a short post-incident note with a prevention action and owner.",
    "Assemble your notes into a personal incident runbook you can use on call."
  ],

  scenario: {
    title: "The 02:00 log-full call and the 30-minute debate",
    html: `
At 02:00 alerts fired as the transaction log hit 100%. An emergency log backup freed space in minutes; the real cause was a failed log-backup job after a recovery-model change. The team had spent the previous incident's first 25 minutes debating severity and who should act, so this time a named incident commander and clear severity definitions got the right person moving immediately. The technical fix was simple; the process discipline was what reduced the outage. Every scenario in this lab ends with that same question: what prevention action stops this recurring?
<p><strong>The lesson:</strong> practise both the diagnosis and the safe mitigation in this lab. Under pressure, the steps you have rehearsed are the steps you will actually take — build good muscle memory now.</p>
    `,
  },

  interview: [
    {
      q: "What is your priority order during a Sev 1 outage?",
      a: `
Restore service first with the safest tested mitigation, communicate status at a fixed cadence, preserve evidence, and only then pursue deep root cause — extending an outage to investigate is a second failure.
      `,
    },
    {
      q: "How do you decide incident severity?",
      a: `
By impact and urgency against defined levels: total outage or data loss is Sev1, major degradation Sev2, limited impact Sev3. Pre-agreed definitions remove debate under pressure.
      `,
    },
    {
      q: "What should a post-incident report contain?",
      a: `
A timeline, impact, root cause, contributing factors, what went well and badly, and concrete prevention actions with owners and due dates — written blamelessly so real causes surface.
      `,
    }
  ],

  takeaways: [
    "Restore service first; root-cause analysis comes after recovery",
    "Severity definitions and a named commander remove debate under pressure",
    "Match each failure type to a small, rehearsed set of first diagnostics",
    "Mitigations must be safe and reversible — avoid making an incident worse",
    "Every incident ends with a documented prevention action and owner"
  ]
};
