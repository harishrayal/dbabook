/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch08-23.html */

window.TOPIC = {
  id: "ch08-23",
  title: "DBCC CHECKDB After Restoration",

  lead: "Understanding DBCC CHECKDB After Restoration is essential for anyone responsible for restore and disaster recovery. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what DBCC CHECKDB After Restoration is and where it fits",
    "Explain how DBCC CHECKDB After Restoration works internally",
    "Apply DBCC CHECKDB After Restoration correctly in a production environment",
    "Recognise the common mistakes and risks involving DBCC CHECKDB After Restoration",
    "Monitor and troubleshoot DBCC CHECKDB After Restoration with the right tools"
  ],

  sections: [
    {
      h: "What DBCC CHECKDB After Restoration means",
      html: `
<p>In this topic we examine <strong>DBCC CHECKDB After Restoration</strong> within restore and disaster recovery. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.</p>
<p>Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>DBCC CHECKDB After Restoration is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where DBCC CHECKDB After Restoration fits",
      html: `
<p>Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment. Each step must be ordered correctly.</p>
<p>The diagram below places DBCC CHECKDB After Restoration alongside the core concepts of restore and disaster recovery. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="DBCC CHECKDB After Restoration flow">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="230" y="12" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="39" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Restore</text>
    <rect x="230" y="66" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="93" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. NORECOVERY</text>
    <rect x="230" y="120" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="147" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. STOPAT</text>
    <rect x="230" y="174" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="201" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. MOVE</text>
    <rect x="230" y="228" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="255" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Orphaned user</text>
    <rect x="230" y="282" width="300" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="309" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">6. Standby</text>
    <line x1="380" y1="56" x2="380" y2="66" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="110" x2="380" y2="120" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="164" x2="380" y2="174" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="218" x2="380" y2="228" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="272" x2="380" y2="282" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">DBCC CHECKDB After Restoration</text>
  </svg>
  <div class="figcaption">Figure 1 — Restore and disaster recovery: how DBCC CHECKDB After Restoration relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "DBCC CHECKDB After Restoration in practice",
      html: `
<p>NORECOVERY leaves the database restoring so further backups can be applied. RECOVERY completes the sequence and makes the database usable. STANDBY leaves it read-only while still allowing further restores, useful for log shipping with query access.</p>
<p>The following comparison captures the distinctions that matter most when working with DBCC CHECKDB After Restoration:</p>
<table>
  <tr><th>Option</th><th>Database state</th><th>Use</th></tr>
  <tr><td>NORECOVERY</td><td>Restoring</td><td>More backups to apply</td></tr>
  <tr><td>RECOVERY</td><td>Online</td><td>End of the sequence</td></tr>
  <tr><td>STANDBY</td><td>Read-only / restoring</td><td>Log shipping with reads</td></tr>
</table>
<p>Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change. It requires a full backup, the relevant differentials and an unbroken log chain covering that time.</p>
      `,
    },
    {
      h: "Working with DBCC CHECKDB After Restoration",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to DBCC CHECKDB After Restoration. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- DBCC CHECKDB After Restoration
RESTORE DATABASE SalesDB_Recover
FROM DISK = 'D:\Backups\SalesDB_Full.bak'
WITH MOVE 'SalesDB_data' TO 'D:\Data\SalesDB_Recover.mdf',
     MOVE 'SalesDB_log'  TO 'L:\Log\SalesDB_Recover.ldf',
     NORECOVERY, REPLACE, STATS = 10;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- DBCC CHECKDB After Restoration
RESTORE LOG SalesDB_Recover
FROM DISK = 'D:\Backups\SalesDB_Log.trn'
WITH STOPAT = '2026-03-14T09:29:00', RECOVERY, STATS = 10;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- DBCC CHECKDB After Restoration
-- Find orphaned users after a restore
SELECT dp.name AS user_name, dp.sid
FROM   sys.database_principals dp
LEFT JOIN sys.server_principals sp ON sp.sid = dp.sid
WHERE  dp.type IN ('S','U') AND sp.sid IS NULL
       AND dp.name NOT IN ('dbo','guest','INFORMATION_SCHEMA','sys');</code></pre>
<p>A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost. If the data files are intact, BACKUP LOG ... WITH NORECOVERY captures the tail and leaves the database restoring.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths. Logical names come from RESTORE FILELISTONLY; ignoring MOVE overwrites or fails against existing paths.</p>
<table>
  <tr><th>Standby</th><th>RTO</th><th>Cost</th></tr>
  <tr><td>Cold</td><td>Hours</td><td>Lowest</td></tr>
  <tr><td>Warm</td><td>Tens of minutes</td><td>Medium</td></tr>
  <tr><td>Hot</td><td>Near zero</td><td>Highest</td></tr>
</table>
<p>After a restore, users can be orphaned: a database user's SID no longer matches a server login. Mapping logins to users (with ALTER USER or sp_change_users_login) restores access. Server-level objects such as jobs, linked servers and logins are not part of a database backup and must be scripted separately.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With DBCC CHECKDB After Restoration, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: DBCC CHECKDB After Restoration",
      html: `
<p>This section consolidates <strong>DBCC CHECKDB After Restoration</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>NORECOVERY leaves the database restoring so further backups can be applied. RECOVERY completes the sequence and makes the database usable. STANDBY leaves it read-only while still allowing further restores, useful for log shipping with query access.</p>
<p>Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change. It requires a full backup, the relevant differentials and an unbroken log chain covering that time.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>DBCC CHECKDB After Restoration sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Option</th><th>Database state</th><th>Use</th></tr>
  <tr><td>NORECOVERY</td><td>Restoring</td><td>More backups to apply</td></tr>
  <tr><td>RECOVERY</td><td>Online</td><td>End of the sequence</td></tr>
  <tr><td>STANDBY</td><td>Read-only / restoring</td><td>Log shipping with reads</td></tr>
</table>
<p>A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost. If the data files are intact, BACKUP LOG ... WITH NORECOVERY captures the tail and leaves the database restoring.</p>
<p>Use the following as a starting point when investigating DBCC CHECKDB After Restoration. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- DBCC CHECKDB After Restoration
RESTORE DATABASE SalesDB_Recover
FROM DISK = 'D:\Backups\SalesDB_Full.bak'
WITH MOVE 'SalesDB_data' TO 'D:\Data\SalesDB_Recover.mdf',
     MOVE 'SalesDB_log'  TO 'L:\Log\SalesDB_Recover.ldf',
     NORECOVERY, REPLACE, STATS = 10;</code></pre>
<p>Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths. Logical names come from RESTORE FILELISTONLY; ignoring MOVE overwrites or fails against existing paths.</p>
      `,
    }
  ],

  scenario: {
    title: "The accidental TRUNCATE at 09:31",
    html: `
A deployment truncated a critical table at 09:31. The DBA restored the last full to a new database with NORECOVERY, applied differentials and logs with STOPAT = 09:30:59, recovered it, and copied the lost rows back. Because the log chain was intact and a tail-log backup was taken first, no committed work was lost.
<p><strong>The DBCC CHECKDB After Restoration lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "What is a tail-log backup and when do you take one?",
      a: `
It captures log records generated after the last scheduled backup, usually before a restore or after a failure, so committed work since the last backup is not lost; take it WITH NORECOVERY if data files are intact.
      `,
    },
    {
      q: "Why are logins considered separately from a database restore?",
      a: `
Logins and other server-level objects live in master and are not part of a user database backup, so their SIDs must be reconciled with database users (the orphaned-user problem) after a restore to another server.
      `,
    },
    {
      q: "What is the difference between NORECOVERY and RECOVERY?",
      a: `
NORECOVERY keeps the database in a restoring state so more backups can be applied; RECOVERY finishes the restore, rolls back uncommitted transactions and brings the database online.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within restore and disaster recovery.”",
      "options": [
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.",
        "DBCC CHECKDB After Restoration",
        "Use the following as a starting point when investigating DBCC CHECKDB After Restoration."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine DBCC CHECKDB After Restoration within restore and disaster recovery. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DBCC CHECKDB After Restoration fits”?",
      "options": [
        "Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment.",
        "DBCC CHECKDB After Restoration",
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment. Each step must be ordered correctly.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DBCC CHECKDB After Restoration in practice”?",
      "options": [
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.",
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.",
        "NORECOVERY leaves the database restoring so further backups can be applied."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “NORECOVERY leaves the database restoring so further backups can be applied. RECOVERY completes the sequence and makes the database usable. STANDBY leaves it read-only while still allowing further restores, useful for log shipping with query access.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DBCC CHECKDB After Restoration”?",
      "options": [
        "DBCC CHECKDB After Restoration is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Theory becomes useful when you can apply it.",
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to DBCC CHECKDB After Restoration. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths.",
        "DBCC CHECKDB After Restoration is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths. Logical names come from RESTORE FILELISTONLY; ignoring MOVE overwrites or fails against existing paths.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The diagram below places DBCC CHECKDB After Restoration alongside the core concepts of restore and disaster recovery.",
        "NORECOVERY leaves the database restoring so further backups can be applied.",
        "DBCC CHECKDB After Restoration"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates DBCC CHECKDB After Restoration with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What DBCC CHECKDB After Restoration means”?",
      "options": [
        "End of the sequence",
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.",
        "More backups to apply"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DBCC CHECKDB After Restoration fits”?",
      "options": [
        "The diagram below places DBCC CHECKDB After Restoration alongside the core concepts of restore and disaster recovery.",
        "Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change.",
        "More backups to apply"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places DBCC CHECKDB After Restoration alongside the core concepts of restore and disaster recovery. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DBCC CHECKDB After Restoration in practice”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "The following comparison captures the distinctions that matter most when working with DBCC CHECKDB After Restoration:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with DBCC CHECKDB After Restoration:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DBCC CHECKDB After Restoration”?",
      "options": [
        "More backups to apply",
        "The first example establishes the relevant state.",
        "Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within restore and disaster recovery.”",
      "options": [
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.",
        "DBCC CHECKDB After Restoration",
        "Use the following as a starting point when investigating DBCC CHECKDB After Restoration."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine DBCC CHECKDB After Restoration within restore and disaster recovery. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DBCC CHECKDB After Restoration fits”?",
      "options": [
        "Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment.",
        "DBCC CHECKDB After Restoration",
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment. Each step must be ordered correctly.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DBCC CHECKDB After Restoration in practice”?",
      "options": [
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.",
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.",
        "NORECOVERY leaves the database restoring so further backups can be applied."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “NORECOVERY leaves the database restoring so further backups can be applied. RECOVERY completes the sequence and makes the database usable. STANDBY leaves it read-only while still allowing further restores, useful for log shipping with query access.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DBCC CHECKDB After Restoration”?",
      "options": [
        "DBCC CHECKDB After Restoration is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Theory becomes useful when you can apply it.",
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to DBCC CHECKDB After Restoration. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths.",
        "DBCC CHECKDB After Restoration is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths. Logical names come from RESTORE FILELISTONLY; ignoring MOVE overwrites or fails against existing paths.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The diagram below places DBCC CHECKDB After Restoration alongside the core concepts of restore and disaster recovery.",
        "NORECOVERY leaves the database restoring so further backups can be applied.",
        "DBCC CHECKDB After Restoration"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates DBCC CHECKDB After Restoration with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What DBCC CHECKDB After Restoration means”?",
      "options": [
        "End of the sequence",
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.",
        "More backups to apply"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DBCC CHECKDB After Restoration fits”?",
      "options": [
        "The diagram below places DBCC CHECKDB After Restoration alongside the core concepts of restore and disaster recovery.",
        "Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change.",
        "More backups to apply"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places DBCC CHECKDB After Restoration alongside the core concepts of restore and disaster recovery. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DBCC CHECKDB After Restoration in practice”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "The following comparison captures the distinctions that matter most when working with DBCC CHECKDB After Restoration:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with DBCC CHECKDB After Restoration:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DBCC CHECKDB After Restoration”?",
      "options": [
        "More backups to apply",
        "The first example establishes the relevant state.",
        "Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within restore and disaster recovery.”",
      "options": [
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.",
        "DBCC CHECKDB After Restoration",
        "Use the following as a starting point when investigating DBCC CHECKDB After Restoration."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine DBCC CHECKDB After Restoration within restore and disaster recovery. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DBCC CHECKDB After Restoration fits”?",
      "options": [
        "Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment.",
        "DBCC CHECKDB After Restoration",
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment. Each step must be ordered correctly.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DBCC CHECKDB After Restoration in practice”?",
      "options": [
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.",
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.",
        "NORECOVERY leaves the database restoring so further backups can be applied."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “NORECOVERY leaves the database restoring so further backups can be applied. RECOVERY completes the sequence and makes the database usable. STANDBY leaves it read-only while still allowing further restores, useful for log shipping with query access.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DBCC CHECKDB After Restoration”?",
      "options": [
        "DBCC CHECKDB After Restoration is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Theory becomes useful when you can apply it.",
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to DBCC CHECKDB After Restoration. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths.",
        "DBCC CHECKDB After Restoration is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and…",
        "Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths. Logical names come from RESTORE FILELISTONLY; ignoring MOVE overwrites or fails against existing paths.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The diagram below places DBCC CHECKDB After Restoration alongside the core concepts of restore and disaster recovery.",
        "NORECOVERY leaves the database restoring so further backups can be applied.",
        "DBCC CHECKDB After Restoration"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates DBCC CHECKDB After Restoration with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What DBCC CHECKDB After Restoration means”?",
      "options": [
        "End of the sequence",
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.",
        "More backups to apply"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where DBCC CHECKDB After Restoration fits”?",
      "options": [
        "The diagram below places DBCC CHECKDB After Restoration alongside the core concepts of restore and disaster recovery.",
        "Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change.",
        "More backups to apply"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places DBCC CHECKDB After Restoration alongside the core concepts of restore and disaster recovery. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “DBCC CHECKDB After Restoration in practice”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "The following comparison captures the distinctions that matter most when working with DBCC CHECKDB After Restoration:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with DBCC CHECKDB After Restoration:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with DBCC CHECKDB After Restoration”?",
      "options": [
        "More backups to apply",
        "The first example establishes the relevant state.",
        "Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "DBCC CHECKDB After Restoration is a fundamental concept in restore and disaster recovery",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of DBCC CHECKDB After Restoration improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
