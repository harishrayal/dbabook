/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch07-18.html */

window.TOPIC = {
  id: "ch07-18",
  title: "Point-in-Time Recovery",

  lead: "Point-in-time recovery (PITR) lets you restore a database to the exact second an incident happened — not merely to the last backup — by replaying transaction log backups up to a STOPAT value.",

  objectives: [
    "Explain what point-in-time recovery is and when it is required",
    "List the prerequisites for a STOPAT restore",
    "Build a full → differential → log → STOPAT restore sequence",
    "Interpret LSNs and log backup windows when locating a point in time",
    "Avoid the pitfalls that silently prevent a STOPAT restore"
  ],

  sections: [
    {
      h: "What point-in-time recovery actually means",
      html: `
<p>A full backup takes you to the moment it finished. A differential takes you to when it ran. Only <strong>transaction log backups</strong> carry the database forward second by second — which is why PITR exists only in the <strong>full</strong> (or bulk-logged, with restrictions) recovery model with log backups running.</p>
<p>PITR answers a specific business question: <em>“The bad delete happened at 14:37:12 — give me the database as it was at 14:37:00, before it.”</em> The mechanism is <code>RESTORE LOG … STOPAT</code>: SQL Server replays log records and stops precisely at the first transaction that begins after the specified time.</p>
<blockquote>PITR is not a backup type. It is a restore technique built from backups you already have: one full, optionally one differential, and a contiguous chain of logs that spans the target time.</blockquote>
<table>
  <tr><th>Recovery model</th><th>Possible?</th><th>Why</th></tr>
  <tr><td>Simple</td><td>No</td><td>No log backups exist; the log is truncated at checkpoint</td></tr>
  <tr><td>Full</td><td>Yes</td><td>Log backups form a continuous chain to replay</td></tr>
  <tr><td>Bulk-logged</td><td>Partially</td><td>Minimally logged operations break the chain for that range</td></tr>
</table>
`
    },
    {
      h: "The recovery timeline",
      html: `
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Point-in-time recovery timeline with STOPAT">
    <defs>
      <marker id="d18-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
      <marker id="d18-arrow-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--amber)"/>
      </marker>
    </defs>

    <line x1="40" y1="180" x2="720" y2="180" stroke="var(--border)" stroke-width="3"/>
    <line x1="40" y1="180" x2="620" y2="180" stroke="var(--accent)" stroke-width="3"/>

    <rect x="50" y="152" width="90" height="56" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="95" y="176" text-anchor="middle" fill="var(--accent-strong)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">Full</text>
    <text x="95" y="196" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">Sat 02:00</text>

    <rect x="230" y="152" width="90" height="56" rx="8" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="275" y="176" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Log</text>
    <text x="275" y="196" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">12:00</text>

    <rect x="360" y="152" width="90" height="56" rx="8" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="405" y="176" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Log</text>
    <text x="405" y="196" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">14:30</text>

    <rect x="490" y="152" width="90" height="56" rx="8" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="535" y="176" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Log</text>
    <text x="535" y="196" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">15:00</text>

    <rect x="620" y="152" width="90" height="56" rx="8" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="665" y="176" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Log</text>
    <text x="665" y="196" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">15:30</text>

    <line x1="405" y1="152" x2="405" y2="70" stroke="var(--amber)" stroke-width="2.2" marker-end="url(#d18-arrow-amber)"/>
    <rect x="318" y="34" width="176" height="34" rx="8" fill="var(--surface)" stroke="var(--amber)" stroke-width="2"/>
    <text x="406" y="56" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">STOPAT 14:37:00</text>

    <rect x="360" y="240" width="90" height="46" rx="8" fill="var(--amber)" opacity="0.18" stroke="var(--amber)" stroke-dasharray="4 3"/>
    <text x="405" y="268" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="600" font-family="Segoe UI, sans-serif">bad DELETE</text>
    <line x1="405" y1="240" x2="405" y2="212" stroke="var(--amber)" stroke-width="1.6" stroke-dasharray="4 3"/>

    <line x1="60" y1="120" x2="398" y2="120" stroke="var(--accent)" stroke-width="1.6" marker-end="url(#d18-arrow)"/>
    <text x="229" y="112" text-anchor="middle" fill="var(--accent-strong)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">replayed (committed before STOPAT)</text>

    <line x1="412" y1="120" x2="700" y2="120" stroke="var(--muted)" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#d18-arrow)"/>
    <text x="556" y="112" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">discarded — still recoverable in later log files</text>

    <text x="380" y="322" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-family="Segoe UI, sans-serif">Restore the full, then every log up to and including the one covering the STOPAT moment.</text>
  </svg>
  <div class="figcaption">Figure 1 — STOPAT stops log replay just before the bad transaction; later log files remain on disk.</div>
</div>
`
    },
    {
      h: "Building the STOPAT restore",
      html: `
<p>The sequence is always the same: restore the last full (and the most recent differential if you use them) with <code>NORECOVERY</code>, then walk the log chain forward, applying <code>STOPAT</code> on the <strong>final</strong> log restore and finishing with <code>RECOVERY</code>.</p>
<pre><code class="language-sql">-- Step 1: full base, left open
RESTORE DATABASE [OrderDb]
FROM DISK = N'D:\\backup\\OrderDb_full_20260117_0200.bak'
WITH NORECOVERY, STATS = 10;

-- Step 2: every log after the full, in chronological order
RESTORE LOG [OrderDb]
FROM DISK = N'D:\\backup\\OrderDb_log_20260117_1300.trn'
WITH NORECOVERY, STATS = 10;

RESTORE LOG [OrderDb]
FROM DISK = N'D:\\backup\\OrderDb_log_20260117_1400.trn'
WITH NORECOVERY, STATS = 10;

-- Step 3: stop inside the log that covers 14:37 and bring the database online
RESTORE LOG [OrderDb]
FROM DISK = N'D:\\backup\\OrderDb_log_20260117_1500.trn'
WITH RECOVERY,
     STOPAT = '2026-01-17 14:37:00',
     STATS = 10;</code></pre>
<p>Rules that matter under pressure:</p>
<ul>
  <li><code>STOPAT</code> is only valid on a <strong>log</strong> restore — not on a full or differential.</li>
  <li>The stopat time must fall <strong>inside the range of the log file being restored</strong>; stop before the log's first transaction and SQL Server restores nothing.</li>
  <li>Use <code>RECOVERY</code> on the last restore only. If you leave the database in <code>NORECOVERY</code>, it stays offline and unusable.</li>
  <li>For <code>datetime2</code> columns, pass the value as a string with fractional seconds: <code>STOPAT = '2026-01-17 14:37:00.750'</code>.</li>
</ul>
`
    },
    {
      h: "Finding the right log file",
      html: `
<p>During an incident you will not remember which log covers the target moment. Query msdb for the log backups whose window contains it, using <code>backup_start_date</code> and LSNs:</p>
<pre><code class="language-sql">-- Which log backups cover 2026-01-17 14:37:00?
DECLARE @target datetime = '2026-01-17 14:37:00';

SELECT bs.database_name,
       bs.backup_start_date,
       bs.first_lsn,
       bs.last_lsn,
       bm.physical_device_name
FROM   msdb.dbo.backupset          bs
JOIN   msdb.dbo.backupmediafamily  bm
       ON bm.media_set_id = bs.media_set_id
WHERE  bs.type = 'L'
  AND  bs.database_name = N'OrderDb'
  AND  bs.backup_start_date <= @target
  AND  bs.backup_finish_date >= dateadd(minute, -5, @target)
ORDER BY bs.backup_start_date;</code></pre>
<p>The full sequence you need is: the last full <em>before</em> the target, the last differential after it, then every log from after that differential through the log that covers the target. Restore <code>HEADERONLY</code> on each candidate file if you are unsure of its contents:</p>
<pre><code class="language-sql">RESTORE HEADERONLY FROM DISK = N'D:\\backup\\OrderDb_log_20260117_1500.trn';</code></pre>
`
    },
    {
      h: "Pitfalls that quietly defeat STOPAT",
      html: `
<table>
  <tr><th>Pitfall</th><th>Symptom</th><th>Prevention</th></tr>
  <tr><td>Gap in the log chain (missing log backup)</td><td>Restore fails: the log tail of the database is not contiguously recoverable</td><td>Monitor log backup frequency; alert when the last log backup is older than the RPO</td></tr>
  <tr><td>Minimal/bulk-logged operation in range</td><td>“The log tail of the database is not contiguously recoverable” for that range</td><td>Switch to full recovery during bulk loads, or accept recovery to the log backup boundary</td></tr>
  <tr><td>STOPAT before the restored full finished</td><td>Nothing to stop at; restore errors or returns the full's state</td><td>Choose a target after the base backup's end time</td></tr>
  <tr><td>Database already recovered</td><td>Cannot apply further log restores</td><td>Keep <code>NORECOVERY</code> until the final step</td></tr>
  <tr><td>Wrong time zone on the incident report</td><td>Restore lands minutes off from the “incident time”</td><td>Normalise all timestamps to UTC before picking STOPAT</td></tr>
</table>
<p>Finally: practise STOPAT. The technique is easy in a quiet room and brutal at 3 AM with a hostile clock — a documented runbook with your instance's actual paths is worth more than remembered syntax.</p>
`
    }
  ],

  scenario: {
    title: "14:37:12 — the bad DELETE that wiped 41,000 order rows",
    html: `
<p>A support agent runs an unfiltered <code>DELETE FROM OrderLines</code> against production at 14:37:12 during a “cleanup”. The application errors minutes later. There is no undo — the transactions committed. The incident bridge sets a 60-minute RTO, and the business needs the data as it was at 14:37:00, one second before the damage.</p>
<p>The DBA's runbook: query msdb to find log backups covering 14:37, restore the last full from 02:00 with <code>NORECOVERY</code>, apply the 13:00 and 14:00 logs, then restore the 15:00 log with <code>STOPAT = '2026-01-17 14:37:00'</code> and <code>RECOVERY</code>. Verification: the 41,000 rows are present, <code>DBCC CHECKDB</code> is clean, and the application reconnects. Total restore time: 38 minutes — inside RTO only because log backups run every 15 minutes and the sequence had been rehearsed the previous quarter. <strong>Prevention:</strong> require a soft-delete column and a two-step confirmation for bulk deletes, and keep a PITR drill on the quarterly calendar.</p>
`
  },

  interview: [
    {
      q: "What are the prerequisites for point-in-time recovery?",
      a: "The database must be in full or bulk-logged recovery, a contiguous chain of transaction log backups must exist from the last full (or differential) through the target time, and the restore must run with NORECOVERY until the final log, which carries STOPAT and RECOVERY. Simple recovery cannot do it — there are no log backups to replay."
    },
    {
      q: "Can you STOPAT to a time covered by a log backup you have not restored yet?",
      a: "Yes — but you must restore that log file itself with STOPAT applied. The stopat value has to fall within the range of the log being restored, so you restore the log that spans the target moment and stop inside it, leaving later log files unapplied."
    },
    {
      q: "A restore fails saying the log tail is not contiguously recoverable. What happened?",
      a: "The chain is broken — usually a missed or deleted log backup, a restore of a full that skipped logs, or a minimally logged operation inside the range. Find the gap in msdb backup history, and either supply the missing log file or restore to the last point the chain still supports."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “Only _____ carry the database forward second by second — which is why PITR exists only in the full (or bulk-logged, with restrictions) recovery model with log backups running.”",
      "options": [
        "transaction log backups",
        "log",
        "inside the range of the log file being restored"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A full backup takes you to the moment it finished. A differential takes you to when it ran. Only transaction log backups carry the database forward second by second — which is why PITR exists only in the full (or bulk-logged, with restrictions) recovery model with log backups running.”"
    },
    {
      "question": "Complete the lesson statement: “The sequence is always the same: restore the last full (and the most recent differential if you use them) with NORECOVERY, then walk the log chain forward, applying STOPAT on the _____ log restore and finishing with RECOVERY.”",
      "options": [
        "inside the range of the log file being restored",
        "before",
        "final"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The sequence is always the same: restore the last full (and the most recent differential if you use them) with NORECOVERY, then walk the log chain forward, applying STOPAT on the final log restore and finishing with RECOVERY.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Finding the right log file”?",
      "options": [
        "final",
        "During an incident you will not remember which log covers the target moment.",
        "Minimally logged operations break the chain for that range"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “During an incident you will not remember which log covers the target moment. Query msdb for the log backups whose window contains it, using backup_start_date and LSNs:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls that quietly defeat STOPAT”?",
      "options": [
        "Finally: practise STOPAT.",
        "final",
        "During an incident you will not remember which log covers the target moment."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Finally: practise STOPAT. The technique is easy in a quiet room and brutal at 3 AM with a hostile clock — a documented runbook with your instance's actual paths is worth more than remembered syntax.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What point-in-time recovery actually means”?",
      "options": [
        "Choose a target after the base backup's end time",
        "Keep NORECOVERY until the final step",
        "” The mechanism is RESTORE LOG … STOPAT: SQL Server replays log records and stops precisely at the first transaction that begins after the specified time."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “PITR answers a specific business question: “The bad delete happened at 14:37:12 — give me the database as it was at 14:37:00, before it.” The mechanism is RESTORE LOG … STOPAT: SQL Server replays log records and stops precisely at the first transaction that begins after the specified time.”"
    },
    {
      "question": "Complete the lesson statement: “The full sequence you need is: the last full _____ the target, the last differential after it, then every log from after that differential through the log that covers the target.”",
      "options": [
        "Minimally logged operations break the chain for that range",
        "before",
        "Log backups form a continuous chain to replay"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The full sequence you need is: the last full before the target, the last differential after it, then every log from after that differential through the log that covers the target. Restore HEADERONLY on each candidate file if you are unsure of its contents:”"
    },
    {
      "question": "In the “Pitfalls that quietly defeat STOPAT” table, what is listed for “Gap in the log chain (missing log backup)” under “Prevention”?",
      "options": [
        "Monitor log backup frequency; alert when the last log backup is older than the RPO",
        "Minimally logged operations break the chain for that range",
        "final"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Gap in the log chain (missing log backup)” as “Monitor log backup frequency; alert when the last log backup is older than the RPO”."
    },
    {
      "question": "In the “What point-in-time recovery actually means” table, what is listed for “Simple” under “Why”?",
      "options": [
        "Switch to full recovery during bulk loads, or accept recovery to the log backup boundary",
        "Choose a target after the base backup's end time",
        "No log backups exist; the log is truncated at checkpoint"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “Simple” as “No log backups exist; the log is truncated at checkpoint”."
    },
    {
      "question": "In the “Pitfalls that quietly defeat STOPAT” table, what is listed for “Minimal/bulk-logged operation in range” under “Prevention”?",
      "options": [
        "before",
        "Switch to full recovery during bulk loads, or accept recovery to the log backup boundary",
        "During an incident you will not remember which log covers the target moment."
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Minimal/bulk-logged operation in range” as “Switch to full recovery during bulk loads, or accept recovery to the log backup boundary”."
    },
    {
      "question": "In the “What point-in-time recovery actually means” table, what is listed for “Full” under “Why”?",
      "options": [
        "Log backups form a continuous chain to replay",
        "Keep NORECOVERY until the final step",
        "Normalise all timestamps to UTC before picking STOPAT"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Full” as “Log backups form a continuous chain to replay”."
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “Only _____ carry the database forward second by second — which is why PITR exists only in the full (or bulk-logged, with restrictions) recovery model with log backups running.”",
      "options": [
        "transaction log backups",
        "log",
        "inside the range of the log file being restored"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A full backup takes you to the moment it finished. A differential takes you to when it ran. Only transaction log backups carry the database forward second by second — which is why PITR exists only in the full (or bulk-logged, with restrictions) recovery model with log backups running.”"
    },
    {
      "question": "Complete the lesson statement: “The sequence is always the same: restore the last full (and the most recent differential if you use them) with NORECOVERY, then walk the log chain forward, applying STOPAT on the _____ log restore and finishing with RECOVERY.”",
      "options": [
        "inside the range of the log file being restored",
        "before",
        "final"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The sequence is always the same: restore the last full (and the most recent differential if you use them) with NORECOVERY, then walk the log chain forward, applying STOPAT on the final log restore and finishing with RECOVERY.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Finding the right log file”?",
      "options": [
        "final",
        "During an incident you will not remember which log covers the target moment.",
        "Minimally logged operations break the chain for that range"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “During an incident you will not remember which log covers the target moment. Query msdb for the log backups whose window contains it, using backup_start_date and LSNs:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls that quietly defeat STOPAT”?",
      "options": [
        "Finally: practise STOPAT.",
        "final",
        "During an incident you will not remember which log covers the target moment."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Finally: practise STOPAT. The technique is easy in a quiet room and brutal at 3 AM with a hostile clock — a documented runbook with your instance's actual paths is worth more than remembered syntax.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What point-in-time recovery actually means”?",
      "options": [
        "Choose a target after the base backup's end time",
        "Keep NORECOVERY until the final step",
        "” The mechanism is RESTORE LOG … STOPAT: SQL Server replays log records and stops precisely at the first transaction that begins after the specified time."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “PITR answers a specific business question: “The bad delete happened at 14:37:12 — give me the database as it was at 14:37:00, before it.” The mechanism is RESTORE LOG … STOPAT: SQL Server replays log records and stops precisely at the first transaction that begins after the specified time.”"
    },
    {
      "question": "Complete the lesson statement: “The full sequence you need is: the last full _____ the target, the last differential after it, then every log from after that differential through the log that covers the target.”",
      "options": [
        "Minimally logged operations break the chain for that range",
        "before",
        "Log backups form a continuous chain to replay"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The full sequence you need is: the last full before the target, the last differential after it, then every log from after that differential through the log that covers the target. Restore HEADERONLY on each candidate file if you are unsure of its contents:”"
    },
    {
      "question": "In the “Pitfalls that quietly defeat STOPAT” table, what is listed for “Gap in the log chain (missing log backup)” under “Prevention”?",
      "options": [
        "Monitor log backup frequency; alert when the last log backup is older than the RPO",
        "Minimally logged operations break the chain for that range",
        "final"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Gap in the log chain (missing log backup)” as “Monitor log backup frequency; alert when the last log backup is older than the RPO”."
    },
    {
      "question": "In the “What point-in-time recovery actually means” table, what is listed for “Simple” under “Why”?",
      "options": [
        "Switch to full recovery during bulk loads, or accept recovery to the log backup boundary",
        "Choose a target after the base backup's end time",
        "No log backups exist; the log is truncated at checkpoint"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “Simple” as “No log backups exist; the log is truncated at checkpoint”."
    },
    {
      "question": "In the “Pitfalls that quietly defeat STOPAT” table, what is listed for “Minimal/bulk-logged operation in range” under “Prevention”?",
      "options": [
        "before",
        "Switch to full recovery during bulk loads, or accept recovery to the log backup boundary",
        "During an incident you will not remember which log covers the target moment."
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Minimal/bulk-logged operation in range” as “Switch to full recovery during bulk loads, or accept recovery to the log backup boundary”."
    },
    {
      "question": "In the “What point-in-time recovery actually means” table, what is listed for “Full” under “Why”?",
      "options": [
        "Log backups form a continuous chain to replay",
        "Keep NORECOVERY until the final step",
        "Normalise all timestamps to UTC before picking STOPAT"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Full” as “Log backups form a continuous chain to replay”."
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “Only _____ carry the database forward second by second — which is why PITR exists only in the full (or bulk-logged, with restrictions) recovery model with log backups running.”",
      "options": [
        "transaction log backups",
        "log",
        "inside the range of the log file being restored"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A full backup takes you to the moment it finished. A differential takes you to when it ran. Only transaction log backups carry the database forward second by second — which is why PITR exists only in the full (or bulk-logged, with restrictions) recovery model with log backups running.”"
    },
    {
      "question": "Complete the lesson statement: “The sequence is always the same: restore the last full (and the most recent differential if you use them) with NORECOVERY, then walk the log chain forward, applying STOPAT on the _____ log restore and finishing with RECOVERY.”",
      "options": [
        "inside the range of the log file being restored",
        "before",
        "final"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The sequence is always the same: restore the last full (and the most recent differential if you use them) with NORECOVERY, then walk the log chain forward, applying STOPAT on the final log restore and finishing with RECOVERY.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Finding the right log file”?",
      "options": [
        "final",
        "During an incident you will not remember which log covers the target moment.",
        "Minimally logged operations break the chain for that range"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “During an incident you will not remember which log covers the target moment. Query msdb for the log backups whose window contains it, using backup_start_date and LSNs:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls that quietly defeat STOPAT”?",
      "options": [
        "Finally: practise STOPAT.",
        "final",
        "During an incident you will not remember which log covers the target moment."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Finally: practise STOPAT. The technique is easy in a quiet room and brutal at 3 AM with a hostile clock — a documented runbook with your instance's actual paths is worth more than remembered syntax.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What point-in-time recovery actually means”?",
      "options": [
        "Choose a target after the base backup's end time",
        "Keep NORECOVERY until the final step",
        "” The mechanism is RESTORE LOG … STOPAT: SQL Server replays log records and stops precisely at the first transaction that begins after the specified time."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “PITR answers a specific business question: “The bad delete happened at 14:37:12 — give me the database as it was at 14:37:00, before it.” The mechanism is RESTORE LOG … STOPAT: SQL Server replays log records and stops precisely at the first transaction that begins after the specified time.”"
    },
    {
      "question": "Complete the lesson statement: “The full sequence you need is: the last full _____ the target, the last differential after it, then every log from after that differential through the log that covers the target.”",
      "options": [
        "Minimally logged operations break the chain for that range",
        "before",
        "Log backups form a continuous chain to replay"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The full sequence you need is: the last full before the target, the last differential after it, then every log from after that differential through the log that covers the target. Restore HEADERONLY on each candidate file if you are unsure of its contents:”"
    },
    {
      "question": "In the “Pitfalls that quietly defeat STOPAT” table, what is listed for “Gap in the log chain (missing log backup)” under “Prevention”?",
      "options": [
        "Monitor log backup frequency; alert when the last log backup is older than the RPO",
        "Minimally logged operations break the chain for that range",
        "final"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Gap in the log chain (missing log backup)” as “Monitor log backup frequency; alert when the last log backup is older than the RPO”."
    },
    {
      "question": "In the “What point-in-time recovery actually means” table, what is listed for “Simple” under “Why”?",
      "options": [
        "Switch to full recovery during bulk loads, or accept recovery to the log backup boundary",
        "Choose a target after the base backup's end time",
        "No log backups exist; the log is truncated at checkpoint"
      ],
      "answerIndex": 2,
      "explanation": "The lesson’s table lists “Simple” as “No log backups exist; the log is truncated at checkpoint”."
    },
    {
      "question": "In the “Pitfalls that quietly defeat STOPAT” table, what is listed for “Minimal/bulk-logged operation in range” under “Prevention”?",
      "options": [
        "before",
        "Switch to full recovery during bulk loads, or accept recovery to the log backup boundary",
        "During an incident you will not remember which log covers the target moment."
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Minimal/bulk-logged operation in range” as “Switch to full recovery during bulk loads, or accept recovery to the log backup boundary”."
    },
    {
      "question": "In the “What point-in-time recovery actually means” table, what is listed for “Full” under “Why”?",
      "options": [
        "Log backups form a continuous chain to replay",
        "Keep NORECOVERY until the final step",
        "Normalise all timestamps to UTC before picking STOPAT"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “Full” as “Log backups form a continuous chain to replay”."
    }
  ],
  takeaways: [
    "PITR is a restore technique, not a backup type — it needs full recovery plus a continuous log chain",
    "STOPAT goes only on the final LOG restore, together with RECOVERY",
    "The stopat time must sit inside the log file being restored, after the base backup completed",
    "Locate candidate log files with msdb history (backup_start_date, first_lsn, last_lsn) before restoring",
    "Minimal logging and missing log backups are the two classic chain breakers — rehearse the drill before the incident"
  ]
};
