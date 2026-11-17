/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch08-03.html */

window.TOPIC = {
  id: "ch08-03",
  title: "Restore Sequence",

  lead: "A restore is not a single command but an ordered sequence — full first, then differential, then logs in LSN order, with NORECOVERY until the very last step — and every step must land in the correct state.",

  objectives: [
    "State the canonical restore order: full → differential → logs → recovery",
    "Explain why intermediate restores must use NORECOVERY",
    "Identify errors caused by out-of-order or missing backups",
    "Write and verify a complete multi-step restore script"
  ],

  sections: [
    {
      h: "The canonical order",
      html: `
<p>SQL Server rebuilds a database by replaying backups in the order they were taken. The rule is fixed by how the media is written:</p>
<ul>
  <li><strong>Full backup first</strong> — the base image of every page; nothing can restore without it</li>
  <li><strong>Differential next</strong> — only valid on top of its own full base; it carries all changed pages since that full</li>
  <li><strong>Transaction log backups in sequence</strong> — starting at the first log whose <code>FirstLSN</code> matches where the previous restore stopped</li>
  <li><strong>Recovery last</strong> — a single final step that rolls back and opens the database</li>
</ul>
<p>Skipping is allowed only in one direction: if you have a recent full and its differentials, you can skip older logs entirely. You can never skip <em>ahead</em> — a gap in the LSN chain aborts the restore with an error such as “The log backup … is not allowed to overwrite an earlier log backup”.</p>
`
    },
    {
      h: "The sequence with its states",
      html: `
<p>The single most important habit in restore work is tracking the <em>state</em> after each step. Every restore except the last leaves the database in <code>RESTORING</code> — that is what allows the next file to be applied.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Restore sequence with NORECOVERY states">
    <defs>
      <marker id="seq-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
      <marker id="seq-arrow-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--amber)"/>
      </marker>
      <marker id="seq-arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"/>
      </marker>
    </defs>

    <text x="380" y="24" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Each step applies media and leaves a defined state for the next step</text>

    <rect x="15" y="48" width="175" height="88" rx="10" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="102" y="76" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">1 · Full backup</text>
    <text x="102" y="100" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">base image of all pages</text>
    <rect x="30" y="110" width="145" height="20" rx="6" fill="var(--amber)" opacity="0.25"/>
    <text x="102" y="124" text-anchor="middle" fill="var(--text)" font-size="11.5" font-weight="600" font-family="Segoe UI, sans-serif">NORECOVERY</text>

    <rect x="205" y="48" width="175" height="88" rx="10" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="292" y="76" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">2 · Differential</text>
    <text x="292" y="100" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">pages changed since the full</text>
    <rect x="220" y="110" width="145" height="20" rx="6" fill="var(--amber)" opacity="0.25"/>
    <text x="292" y="124" text-anchor="middle" fill="var(--text)" font-size="11.5" font-weight="600" font-family="Segoe UI, sans-serif">NORECOVERY</text>

    <rect x="395" y="48" width="150" height="88" rx="10" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="470" y="76" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">3 · Log backups</text>
    <text x="470" y="100" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">in order, no gaps</text>
    <rect x="410" y="110" width="120" height="20" rx="6" fill="var(--amber)" opacity="0.25"/>
    <text x="470" y="124" text-anchor="middle" fill="var(--text)" font-size="11.5" font-weight="600" font-family="Segoe UI, sans-serif">NORECOVERY</text>

    <rect x="560" y="48" width="185" height="88" rx="10" fill="var(--accent)" />
    <text x="652" y="76" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">4 · Final step</text>
    <text x="652" y="100" text-anchor="middle" fill="#dbeafe" font-size="11.5" font-family="Segoe UI, sans-serif">RESTORE … WITH RECOVERY</text>
    <rect x="575" y="110" width="155" height="20" rx="6" fill="#ffffff" opacity="0.25"/>
    <text x="652" y="124" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="600" font-family="Segoe UI, sans-serif">ONLINE</text>

    <line x1="190" y1="92" x2="203" y2="92" stroke="var(--muted)" stroke-width="2" marker-end="url(#seq-arrow)"/>
    <line x1="380" y1="92" x2="393" y2="92" stroke="var(--muted)" stroke-width="2" marker-end="url(#seq-arrow)"/>
    <line x1="545" y1="92" x2="558" y2="92" stroke="var(--accent)" stroke-width="2" marker-end="url(#seq-arrow-accent)"/>

    <rect x="15" y="175" width="730" height="62" rx="10" fill="var(--surface)" stroke="var(--border)" stroke-dasharray="6 4"/>
    <text x="380" y="201" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">State while restoring: database is offline to users, marked RESTORING</text>
    <text x="380" y="223" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">sys.database_recovery_status / sys.master_files show state; connections are rejected</text>

    <line x1="102" y1="136" x2="150" y2="173" stroke="var(--amber)" stroke-width="1.6" marker-end="url(#seq-arrow-amber)"/>

    <rect x="15" y="262" width="355" height="60" rx="10" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="192" y="286" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Rule: only the LAST restore may use RECOVERY</text>
    <text x="192" y="308" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">an early RECOVERY forces you to start the chain again</text>

    <rect x="390" y="262" width="355" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="567" y="286" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">STANDBY is the exception</text>
    <text x="567" y="308" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">stops between steps but leaves a readable copy</text>
  </svg>
  <div class="figcaption">Figure 1 — Full → differential → logs in NORECOVERY, then a single final RECOVERY.</div>
</div>
`
    },
    {
      h: "Reading the states from the catalogue",
      html: `
<p>You can confirm where a restore stands without guessing:</p>
<pre><code class="language-sql">-- Is anything mid-restore on this instance?
SELECT d.name, d.state_desc, d.user_access_desc, d.recovery_model_desc
FROM   sys.databases AS d
WHERE  d.state_desc &lt;&gt; 'ONLINE';

-- Which backups exist and in what order?
SELECT backup_set_name, backup_finish_date, first_lsn, last_lsn,
       type AS backup_type,   -- 1 = full, 2 = log, 5 = differential
       is_damaged, has_incomplete_metadata
FROM   msdb.dbo.backupset
WHERE  database_name = N'ERP'
ORDER  BY backup_finish_date DESC;

-- Where will the next log restore need to start?
RESTORE HEADERONLY FROM DISK = N'E:\\SQLBackup\\ERP_LOG_2026-11-17_1200.trn';</code></pre>
<p><code>state_desc = RESTORING</code> is the signature of a chain in progress — expected during a planned restore, alarming if it persists after one, because the database is unusable until recovery completes.</p>
`
    },
    {
      h: "A complete sequence script",
      html: `
<p>The pattern below is what a real restore runbook looks like: every intermediate step is explicit, and recovery happens exactly once, at the end.</p>
<pre><code class="language-sql">-- Step 1: full base, keep the chain open
RESTORE DATABASE [ERP] FROM DISK = N'E:\\SQLBackup\\ERP_FULL_2026-11-16.bak'
WITH MOVE N'ERP' TO N'D:\\Data\\ERP.mdf',
     MOVE N'ERP_log' TO N'D:\\Data\\ERP_log.ldf',
     NORECOVERY, STATS = 5;

-- Step 2: latest differential
RESTORE DATABASE [ERP] FROM DISK = N'E:\\SQLBackup\\ERP_DIFF_2026-11-17_0600.bak'
WITH NORECOVERY, STATS = 5;

-- Step 3: log backups in order (NORECOVERY keeps the chain open)
RESTORE LOG [ERP] FROM DISK = N'E:\\SQLBackup\\ERP_LOG_2026-11-17_0600.trn'
WITH NORECOVERY, STATS = 5;
RESTORE LOG [ERP] FROM DISK = N'E:\\SQLBackup\\ERP_LOG_2026-11-17_1200.trn'
WITH NORECOVERY, STATS = 5;

-- Step 4: open the database to users — once, at the end
RESTORE DATABASE [ERP] WITH RECOVERY;
GO

-- Step 5: prove it
DBCC CHECKDB (N'ERP') WITH NO_INFOMSGS;</code></pre>
<p>Each statement is idempotent only in the sense that you can re-run a step after fixing its cause; a partially applied step should be diagnosed with the error message and the catalogue, never ignored.</p>
`
    },
    {
      h: "Common sequence mistakes",
      html: `
<table>
  <tr><th>Mistake</th><th>Symptom</th><th>Fix</th></tr>
  <tr><td>Recovering after the full, then applying a log</td><td>Log restore rejected — the database is already ONLINE</td><td>Restore the chain again from the full with NORECOVERY</td></tr>
  <tr><td>Applying a log before its base</td><td>LSN chain mismatch error</td><td>Restore the full (and differential) first</td></tr>
  <tr><td>Missing a middle log backup</td><td>“not allowed to overwrite an earlier log backup” / LSN gap</td><td>Locate the missing file; if gone, the point in time is unreachable</td></tr>
  <tr><td>Using STANDBY for the final step by habit</td><td>Database stays read-only, undo file left behind</td><td>Finish with RECOVERY, then delete the undo file</td></tr>
  <tr><td>Wrong target paths on step 1</td><td>Directory lookup failure before any data is written</td><td>Check FILELISTONLY and prepare WITH MOVE first</td></tr>
</table>
<p>Sequence discipline is what separates a calm restore from an improvised one: one base, ordered logs, one recovery, and a written record of every file applied with its LSNs.</p>
`
    }
  ],

  scenario: {
    title: "The restore that stopped one log backup short",
    html: `
<p>At 07:50 a reporting database corruption forced a restore. The DBA applied the full (NORECOVERY), the 06:00 differential (NORECOVERY), and the 06:00 log — then, wanting users back quickly, ran <code>RESTORE DATABASE RPT WITH RECOVERY</code> at 07:46 database time. The database came online missing the last 90 minutes, including the morning's invoices, because the 07:30 log had never been applied.</p>
<p>Diagnosis: catalogue timestamps showed <code>last_lsn</code> on the database behind the newest log file on disk. Resolution: the team could not roll forward an online database — the chain had to be re-run from the full with NORECOVERY, then the 07:30 log applied, then recovery. Total outage extended by 40 minutes. Prevention: a restore script with <code>NORECOVERY</code> hard-coded on every intermediate line and a final <code>RECOVERY</code>, a mandatory file-by-file checklist with LSNs, and a rule that “bring it online” is a deliberate last command, not a reflex.</p>
`
  },

  interview: [
    {
      q: "What is the correct order for restoring a full, a differential, and several log backups?",
      a: "Full first with NORECOVERY, then the differential with NORECOVERY, then every log backup after the differential's point in time in LSN order with NORECOVERY, and finally a single step WITH RECOVERY. Order is dictated by the LSN chain — you can skip older media but never newer media."
    },
    {
      q: "Why must intermediate restores use NORECOVERY?",
      a: "Because a restore with RECOVERY is final: it rolls back uncommitted work and opens the database, after which no further media can be applied. NORECOVERY leaves the database in RESTORING state, holding the chain open so the next full, differential, or log backup can be replayed on top."
    },
    {
      q: "A log restore fails saying the chain does not match. What do you check?",
      a: "Compare FirstLSN/LastLSN of the file you are applying with the LSN the database stopped at — RESTORE HEADERONLY against the catalogue (sys.master_file_recovery or msdb backupset history). Look for a missing or purged log backup in between; if a gap exists, recovery to the requested point is impossible and you must choose an earlier reachable target or accept data loss."
    }
  ],

  takeaways: [
    "Canonical order: full → differential → log backups in LSN order → one final RECOVERY",
    "Every intermediate restore uses NORECOVERY to keep the chain open",
    "You may skip older media, never newer media — gaps in the LSN chain abort the restore",
    "Track state after each step: RESTORING means in progress, ONLINE means finished",
    "Script the sequence in advance; improvising the final command is how data gets left behind"
  ]
};
