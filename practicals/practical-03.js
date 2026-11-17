/* Practical content file — one JS file per practical lab.
   Rendered by assets/js/site.js on practicals/practical-03.html */

window.TOPIC = {
  id: "practical-03",
  title: "Backup and Restore",

  lead: "A hands-on backup and recovery lab: take full, differential and log backups, break and repair the log chain, and perform a point-in-time recovery of accidentally deleted data.",

  objectives: [
    "Take compressed, checksummed full backups",
    "Create differential and transaction log backups",
    "Understand what breaks the log chain",
    "Restore to a point in time with STOPAT",
    "Prove recoverability with a real restore, not VERIFYONLY"
  ],

  sections: [
    {
      h: "Before you start",
      html: `
<p>This lab turns backup theory into muscle memory. You will build a full plus log backup chain, deliberately delete data, then recover it to a moment just before the mistake.</p>
<p>Use a scratch database on a local instance. The backup paths must exist and the SQL Server service account needs write permission on them — permission errors are a common lab failure.</p>
<p><strong>Environment check</strong> — confirm where you are before changing anything; this habit prevents production mistakes:</p>
<pre><code class="language-sql">-- Lab step
ALTER DATABASE BackupLab SET RECOVERY FULL;
GO
BACKUP DATABASE BackupLab
TO DISK = 'D:\Backups\BackupLab_Full.bak'
WITH COMPRESSION, CHECKSUM, INIT, STATS = 10;
GO
-- Make a change, then a differential
BACKUP DATABASE BackupLab
TO DISK = 'D:\Backups\BackupLab_Diff.bak'
WITH COMPRESSION, CHECKSUM, DIFFERENTIAL, INIT, STATS = 10;
GO
BACKUP LOG BackupLab
TO DISK = 'D:\Backups\BackupLab_1.trn'
WITH COMPRESSION, CHECKSUM, STATS = 10;
GO</code></pre>
      `,
    },
    {
      h: "Lab architecture",
      html: `
<p>Recovery model controls the chain. In FULL, log records are retained until backed up, enabling point-in-time restore. In SIMPLE, log backups are not possible. Confirm the model before you start.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Backup and restore chain">
    <defs>
      <marker id="pa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="200" y="10" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="31" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Full backup (base)</text>
    <line x1="380" y1="54" x2="380" y2="64" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="64" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="85" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Differential (changes since full)</text>
    <line x1="380" y1="108" x2="380" y2="118" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="118" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="139" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Log backup 1</text>
    <line x1="380" y1="162" x2="380" y2="172" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="172" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="193" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Log backup 2</text>
    <line x1="380" y1="216" x2="380" y2="226" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="226" width="360" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)"/>
    <text x="380" y="247" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. STOPAT -> recovered database</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Backup and restore chain</text>
  </svg>
  <div class="figcaption">Figure 1 — A full base, a differential and an unbroken log chain combine to reach a point in time.</div>
</div>
<p>The chain below is the sequence you will build and then restore: a full backup establishes the base, a differential narrows replay, and log backups carry you to the target moment.</p>
      `,
    },
    {
      h: "Core tasks",
      html: `
<p>Take a full backup with COMPRESSION and CHECKSUM. Then make some data changes, take a differential, make more changes and take log backups at each stage. Note the timestamps — you will need one for the restore.</p>
<table>
  <tr><th>Backup type</th><th>Contains</th><th>Restore needs</th></tr>
  <tr><td>Full</td><td>Entire database at a point</td><td>Just the full</td></tr>
  <tr><td>Differential</td><td>Changes since last full</td><td>Base full + latest diff</td></tr>
  <tr><td>Log</td><td>Log records since last log backup</td><td>Full + diff + log chain</td></tr>
</table>
<p>Test both sides of the differential behaviour: a second differential should be larger than the first because it contains all changes since the last full, not just since the last differential.</p>
<pre><code class="language-sql">-- Lab step
-- Review the backup chain
SELECT database_name, type, backup_start_date,
       backup_finish_date, compressed_backup_size
FROM   msdb.dbo.backupset
WHERE  database_name = 'BackupLab'
ORDER BY backup_finish_date;
GO
-- D = full, I = differential, L = log</code></pre>
      `,
    },
    {
      h: "Verify your work",
      html: `
<p>Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:</p>
<pre><code class="language-sql">-- Lab step
RESTORE DATABASE BackupLab_Recover
FROM DISK = 'D:\Backups\BackupLab_Full.bak'
WITH MOVE 'BackupLab'      TO 'D:\Data\BackupLab_Recover.mdf',
     MOVE 'BackupLab_log'  TO 'L:\Log\BackupLab_Recover.ldf',
     NORECOVERY, REPLACE, STATS = 10;
GO
RESTORE DATABASE BackupLab_Recover
FROM DISK = 'D:\Backups\BackupLab_Diff.bak'
WITH NORECOVERY, STATS = 10;
GO
RESTORE LOG BackupLab_Recover
FROM DISK = 'D:\Backups\BackupLab_1.trn'
WITH STOPAT = '2026-03-14T09:29:59', RECOVERY, STATS = 10;
GO</code></pre>
<p>For the restore, use a new database name with MOVE so you do not overwrite the source. Apply the full with NORECOVERY, the differential with NORECOVERY, then logs with STOPAT and RECOVERY.</p>
<p>If the output differs, stop and correct it before moving on. A lab that 'looks right' but was never verified teaches the wrong lessons.</p>
      `,
    },
    {
      h: "Pitfalls and safe practice",
      html: `
<p>A common trap is believing RESTORE VERIFYONLY proves recoverability. It only checks readability and checksums; only a real restore proves the data can actually be brought online.</p>
<table>
  <tr><th>Pitfall</th><th>Effect</th><th>Prevention</th></tr>
  <tr><td>SIMPLE model</td><td>No log backups / no PITR</td><td>Set FULL for critical DBs</td></tr>
  <tr><td>Recovery model flip</td><td>Breaks the log chain</td><td>Take a full immediately after</td></tr>
  <tr><td>VERIFYONLY only</td><td>Does not prove recoverability</td><td>Perform real restores</td></tr>
  <tr><td>Full backup disk</td><td>Silent stale backups</td><td>Monitor file timestamps</td></tr>
</table>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.</p>
</div>
      `,
    }
  ],

  steps: [
    "Create BackupLab with a simple table and insert 10 rows containing a timestamp column.",
    "Set the recovery model to FULL and take an initial compressed full backup with CHECKSUM.",
    "Insert 10 more rows, then take a differential backup; record its size.",
    "Insert another 10 rows and take a second differential — confirm it is larger than the first because it is cumulative since the full.",
    "Take a transaction log backup; record the exact time just before a deliberate DELETE.",
    "Run a DELETE that removes a known set of rows — this is the 'accident' you will recover from.",
    "Take another log backup covering the time after the delete.",
    "Query msdb.dbo.backupset to confirm you have a full, differentials and logs in order.",
    "Restore to a new database using MOVE, applying full (NORECOVERY), differential (NORECOVERY), then logs with STOPAT set just before the delete and final RECOVERY.",
    "Verify the recovered table contains the deleted rows and that the source database is untouched."
  ],

  scenario: {
    title: "The TRUNCATE at 09:31 and the STOPAT at 09:30:59",
    html: `
A deployment script accidentally truncated a critical lookup table at 09:31. Because the database was in FULL recovery with an unbroken log chain, the DBA restored the last full to a new database with NORECOVERY, applied the latest differential, then applied logs with STOPAT = '09:30:59'. The recovered table was copied back into production with zero loss of committed work. Had the log chain been broken by a recovery-model change the previous week, the only option would have been the last full backup — and hours of data loss.
<p><strong>The lesson:</strong> practise both the diagnosis and the safe mitigation in this lab. Under pressure, the steps you have rehearsed are the steps you will actually take — build good muscle memory now.</p>
    `,
  },

  interview: [
    {
      q: "How do RPO and RTO determine a backup strategy?",
      a: `
RPO sets the maximum acceptable data loss and therefore the backup frequency (including log backups); RTO sets how fast recovery must be, influencing backup type, storage tier and whether high availability is needed.
      `,
    },
    {
      q: "What breaks the transaction log backup chain?",
      a: `
Switching recovery model, restoring with RECOVERY, or taking a non-copy-only full backup can reset the differential base or log chain. After such a change, take a full backup immediately and alert on log backup failures.
      `,
    },
    {
      q: "Why must you perform real restore tests?",
      a: `
RESTORE VERIFYONLY checks readability and checksums but does not replay logs or open the database. Only a real restore proves the chain is complete and the recovery objectives can be met.
      `,
    }
  ],

  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "This lab turns backup theory into muscle memory.",
        "Test both sides of the differential behaviour: a second differential should be larger than the first because it contains all changes since the last full, not just since the last…",
        "Just the full"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “This lab turns backup theory into muscle memory. You will build a full plus log backup chain, deliberately delete data, then recover it to a moment just before the mistake.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Test both sides of the differential behaviour: a second differential should be larger than the first because it contains all changes since the last full, not just since the last…",
        "Just the full",
        "Recovery model controls the chain."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Recovery model controls the chain. In FULL, log records are retained until backed up, enabling point-in-time restore. In SIMPLE, log backups are not possible. Confirm the model before you start.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "For the restore, use a new database name with MOVE so you do not overwrite the source.",
        "Take a full backup with COMPRESSION and CHECKSUM.",
        "Never assume a lab step worked — verify against the catalog views and DMVs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Take a full backup with COMPRESSION and CHECKSUM. Then make some data changes, take a differential, make more changes and take log backups at each stage. Note the timestamps — you will need one for the restore.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "Test both sides of the differential behaviour: a second differential should be larger than the first because it contains all changes since the last full, not just since the last…",
        "Just the full"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Just the full",
        "Base full + latest diff",
        "A common trap is believing RESTORE VERIFYONLY proves recoverability."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A common trap is believing RESTORE VERIFYONLY proves recoverability. It only checks readability and checksums; only a real restore proves the data can actually be brought online.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "If the output differs, stop and correct it before moving on.",
        "Use a scratch database on a local instance.",
        "For the restore, use a new database name with MOVE so you do not overwrite the source."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Use a scratch database on a local instance. The backup paths must exist and the SQL Server service account needs write permission on them — permission errors are a common lab failure.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "The chain below is the sequence you will build and then restore: a full backup establishes the base, a differential narrows replay, and log backups carry you to the target moment.",
        "For the restore, use a new database name with MOVE so you do not overwrite the source.",
        "If the output differs, stop and correct it before moving on."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The chain below is the sequence you will build and then restore: a full backup establishes the base, a differential narrows replay, and log backups carry you to the target moment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Set FULL for critical DBs",
        "Take a full immediately after",
        "Test both sides of the differential behaviour: a second differential should be larger than the first because it contains all changes since the last full, not just since the last…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Test both sides of the differential behaviour: a second differential should be larger than the first because it contains all changes since the last full, not just since the last differential.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Set FULL for critical DBs",
        "For the restore, use a new database name with MOVE so you do not overwrite the source.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “For the restore, use a new database name with MOVE so you do not overwrite the source. Apply the full with NORECOVERY, the differential with NORECOVERY, then logs with STOPAT and RECOVERY.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "If the output differs, stop and correct it before moving on.",
        "A common trap is believing RESTORE VERIFYONLY proves recoverability."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "This lab turns backup theory into muscle memory.",
        "Test both sides of the differential behaviour: a second differential should be larger than the first because it contains all changes since the last full, not just since the last…",
        "Just the full"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “This lab turns backup theory into muscle memory. You will build a full plus log backup chain, deliberately delete data, then recover it to a moment just before the mistake.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Test both sides of the differential behaviour: a second differential should be larger than the first because it contains all changes since the last full, not just since the last…",
        "Just the full",
        "Recovery model controls the chain."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Recovery model controls the chain. In FULL, log records are retained until backed up, enabling point-in-time restore. In SIMPLE, log backups are not possible. Confirm the model before you start.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "For the restore, use a new database name with MOVE so you do not overwrite the source.",
        "Take a full backup with COMPRESSION and CHECKSUM.",
        "Never assume a lab step worked — verify against the catalog views and DMVs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Take a full backup with COMPRESSION and CHECKSUM. Then make some data changes, take a differential, make more changes and take log backups at each stage. Note the timestamps — you will need one for the restore.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "Test both sides of the differential behaviour: a second differential should be larger than the first because it contains all changes since the last full, not just since the last…",
        "Just the full"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Just the full",
        "Base full + latest diff",
        "A common trap is believing RESTORE VERIFYONLY proves recoverability."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A common trap is believing RESTORE VERIFYONLY proves recoverability. It only checks readability and checksums; only a real restore proves the data can actually be brought online.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "If the output differs, stop and correct it before moving on.",
        "Use a scratch database on a local instance.",
        "For the restore, use a new database name with MOVE so you do not overwrite the source."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Use a scratch database on a local instance. The backup paths must exist and the SQL Server service account needs write permission on them — permission errors are a common lab failure.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "The chain below is the sequence you will build and then restore: a full backup establishes the base, a differential narrows replay, and log backups carry you to the target moment.",
        "For the restore, use a new database name with MOVE so you do not overwrite the source.",
        "If the output differs, stop and correct it before moving on."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The chain below is the sequence you will build and then restore: a full backup establishes the base, a differential narrows replay, and log backups carry you to the target moment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Set FULL for critical DBs",
        "Take a full immediately after",
        "Test both sides of the differential behaviour: a second differential should be larger than the first because it contains all changes since the last full, not just since the last…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Test both sides of the differential behaviour: a second differential should be larger than the first because it contains all changes since the last full, not just since the last differential.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Set FULL for critical DBs",
        "For the restore, use a new database name with MOVE so you do not overwrite the source.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “For the restore, use a new database name with MOVE so you do not overwrite the source. Apply the full with NORECOVERY, the differential with NORECOVERY, then logs with STOPAT and RECOVERY.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "If the output differs, stop and correct it before moving on.",
        "A common trap is believing RESTORE VERIFYONLY proves recoverability."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "This lab turns backup theory into muscle memory.",
        "Test both sides of the differential behaviour: a second differential should be larger than the first because it contains all changes since the last full, not just since the last…",
        "Just the full"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “This lab turns backup theory into muscle memory. You will build a full plus log backup chain, deliberately delete data, then recover it to a moment just before the mistake.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "Test both sides of the differential behaviour: a second differential should be larger than the first because it contains all changes since the last full, not just since the last…",
        "Just the full",
        "Recovery model controls the chain."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Recovery model controls the chain. In FULL, log records are retained until backed up, enabling point-in-time restore. In SIMPLE, log backups are not possible. Confirm the model before you start.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "For the restore, use a new database name with MOVE so you do not overwrite the source.",
        "Take a full backup with COMPRESSION and CHECKSUM.",
        "Never assume a lab step worked — verify against the catalog views and DMVs."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Take a full backup with COMPRESSION and CHECKSUM. Then make some data changes, take a differential, make more changes and take log backups at each stage. Note the timestamps — you will need one for the restore.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Never assume a lab step worked — verify against the catalog views and DMVs.",
        "Test both sides of the differential behaviour: a second differential should be larger than the first because it contains all changes since the last full, not just since the last…",
        "Just the full"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Just the full",
        "Base full + latest diff",
        "A common trap is believing RESTORE VERIFYONLY proves recoverability."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A common trap is believing RESTORE VERIFYONLY proves recoverability. It only checks readability and checksums; only a real restore proves the data can actually be brought online.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Before you start”?",
      "options": [
        "If the output differs, stop and correct it before moving on.",
        "Use a scratch database on a local instance.",
        "For the restore, use a new database name with MOVE so you do not overwrite the source."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Use a scratch database on a local instance. The backup paths must exist and the SQL Server service account needs write permission on them — permission errors are a common lab failure.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Lab architecture”?",
      "options": [
        "The chain below is the sequence you will build and then restore: a full backup establishes the base, a differential narrows replay, and log backups carry you to the target moment.",
        "For the restore, use a new database name with MOVE so you do not overwrite the source.",
        "If the output differs, stop and correct it before moving on."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The chain below is the sequence you will build and then restore: a full backup establishes the base, a differential narrows replay, and log backups carry you to the target moment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Core tasks”?",
      "options": [
        "Set FULL for critical DBs",
        "Take a full immediately after",
        "Test both sides of the differential behaviour: a second differential should be larger than the first because it contains all changes since the last full, not just since the last…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Test both sides of the differential behaviour: a second differential should be larger than the first because it contains all changes since the last full, not just since the last differential.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Verify your work”?",
      "options": [
        "Set FULL for critical DBs",
        "For the restore, use a new database name with MOVE so you do not overwrite the source.",
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “For the restore, use a new database name with MOVE so you do not overwrite the source. Apply the full with NORECOVERY, the differential with NORECOVERY, then logs with STOPAT and RECOVERY.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and safe practice”?",
      "options": [
        "Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.",
        "If the output differs, stop and correct it before moving on.",
        "A common trap is believing RESTORE VERIFYONLY proves recoverability."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.”"
    }
  ],
  takeaways: [
    "A restore plan needs a full base plus an unbroken log chain for point-in-time recovery",
    "Differentials are cumulative since the last full, not the last differential",
    "Use MOVE and a new database name when restoring for a test",
    "STOPAT targets a precise moment just before the mistake",
    "Only a real restore proves recoverability — VERIFYONLY is not enough"
  ]
};
