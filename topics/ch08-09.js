/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch08-09.html */

window.TOPIC = {
  id: "ch08-09",
  title: "STANDBY Option",

  lead: "This topic covers STANDBY Option — a concept you will meet repeatedly when working with restore and disaster recovery. We build from first principles to production guidance.",

  objectives: [
    "Define what STANDBY Option is and where it fits",
    "Explain how STANDBY Option works internally",
    "Apply STANDBY Option correctly in a production environment",
    "Recognise the common mistakes and risks involving STANDBY Option",
    "Monitor and troubleshoot STANDBY Option with the right tools"
  ],

  sections: [
    {
      h: "What STANDBY Option means",
      html: `
<p>In this topic we examine <strong>STANDBY Option</strong> within restore and disaster recovery. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment. Each step must be ordered correctly.</p>
<p>NORECOVERY leaves the database restoring so further backups can be applied. RECOVERY completes the sequence and makes the database usable. STANDBY leaves it read-only while still allowing further restores, useful for log shipping with query access.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>STANDBY Option is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where STANDBY Option fits",
      html: `
<p>Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change. It requires a full backup, the relevant differentials and an unbroken log chain covering that time.</p>
<p>The diagram below places STANDBY Option alongside the core concepts of restore and disaster recovery. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="STANDBY Option layers">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="70" y="8" width="620" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="30" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Restore</text>
    <text x="380" y="50" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 1</text>
    <rect x="100" y="62" width="560" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="84" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">NORECOVERY</text>
    <text x="380" y="104" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 2</text>
    <rect x="130" y="116" width="500" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="138" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">STOPAT</text>
    <text x="380" y="158" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 3</text>
    <rect x="160" y="170" width="440" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="192" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">MOVE</text>
    <text x="380" y="212" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 4</text>
    <rect x="190" y="224" width="380" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="246" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Orphaned user</text>
    <text x="380" y="266" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 5</text>
    <rect x="220" y="278" width="320" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="300" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Standby</text>
    <text x="380" y="320" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 6</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">STANDBY Option</text>
  </svg>
  <div class="figcaption">Figure 1 — Restore and disaster recovery: how STANDBY Option relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "STANDBY Option in practice",
      html: `
<p>A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost. If the data files are intact, BACKUP LOG ... WITH NORECOVERY captures the tail and leaves the database restoring.</p>
<p>The following comparison captures the distinctions that matter most when working with STANDBY Option:</p>
<table>
  <tr><th>Option</th><th>Database state</th><th>Use</th></tr>
  <tr><td>NORECOVERY</td><td>Restoring</td><td>More backups to apply</td></tr>
  <tr><td>RECOVERY</td><td>Online</td><td>End of the sequence</td></tr>
  <tr><td>STANDBY</td><td>Read-only / restoring</td><td>Log shipping with reads</td></tr>
</table>
<p>Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths. Logical names come from RESTORE FILELISTONLY; ignoring MOVE overwrites or fails against existing paths.</p>
      `,
    },
    {
      h: "Working with STANDBY Option",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to STANDBY Option. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- STANDBY Option
RESTORE DATABASE SalesDB_Recover
FROM DISK = 'D:\Backups\SalesDB_Full.bak'
WITH MOVE 'SalesDB_data' TO 'D:\Data\SalesDB_Recover.mdf',
     MOVE 'SalesDB_log'  TO 'L:\Log\SalesDB_Recover.ldf',
     NORECOVERY, REPLACE, STATS = 10;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- STANDBY Option
RESTORE LOG SalesDB_Recover
FROM DISK = 'D:\Backups\SalesDB_Log.trn'
WITH STOPAT = '2026-03-14T09:29:00', RECOVERY, STATS = 10;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- STANDBY Option
-- Find orphaned users after a restore
SELECT dp.name AS user_name, dp.sid
FROM   sys.database_principals dp
LEFT JOIN sys.server_principals sp ON sp.sid = dp.sid
WHERE  dp.type IN ('S','U') AND sp.sid IS NULL
       AND dp.name NOT IN ('dbo','guest','INFORMATION_SCHEMA','sys');</code></pre>
<p>After a restore, users can be orphaned: a database user's SID no longer matches a server login. Mapping logins to users (with ALTER USER or sp_change_users_login) restores access. Server-level objects such as jobs, linked servers and logins are not part of a database backup and must be scripted separately.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.</p>
<table>
  <tr><th>Standby</th><th>RTO</th><th>Cost</th></tr>
  <tr><td>Cold</td><td>Hours</td><td>Lowest</td></tr>
  <tr><td>Warm</td><td>Tens of minutes</td><td>Medium</td></tr>
  <tr><td>Hot</td><td>Near zero</td><td>Highest</td></tr>
</table>
<p>Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With STANDBY Option, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: STANDBY Option",
      html: `
<p>This section consolidates <strong>STANDBY Option</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost. If the data files are intact, BACKUP LOG ... WITH NORECOVERY captures the tail and leaves the database restoring.</p>
<p>Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths. Logical names come from RESTORE FILELISTONLY; ignoring MOVE overwrites or fails against existing paths.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>STANDBY Option sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Option</th><th>Database state</th><th>Use</th></tr>
  <tr><td>NORECOVERY</td><td>Restoring</td><td>More backups to apply</td></tr>
  <tr><td>RECOVERY</td><td>Online</td><td>End of the sequence</td></tr>
  <tr><td>STANDBY</td><td>Read-only / restoring</td><td>Log shipping with reads</td></tr>
</table>
<p>After a restore, users can be orphaned: a database user's SID no longer matches a server login. Mapping logins to users (with ALTER USER or sp_change_users_login) restores access. Server-level objects such as jobs, linked servers and logins are not part of a database backup and must be scripted separately.</p>
<p>Use the following as a starting point when investigating STANDBY Option. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- STANDBY Option
RESTORE LOG SalesDB_Recover
FROM DISK = 'D:\Backups\SalesDB_Log.trn'
WITH STOPAT = '2026-03-14T09:29:00', RECOVERY, STATS = 10;</code></pre>
<p>Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.</p>
      `,
    }
  ],

  scenario: {
    title: "The accidental TRUNCATE at 09:31",
    html: `
A deployment truncated a critical table at 09:31. The DBA restored the last full to a new database with NORECOVERY, applied differentials and logs with STOPAT = 09:30:59, recovered it, and copied the lost rows back. Because the log chain was intact and a tail-log backup was taken first, no committed work was lost.
<p><strong>The STANDBY Option lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
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
    },
    {
      q: "What is a tail-log backup and when do you take one?",
      a: `
It captures log records generated after the last scheduled backup, usually before a restore or after a failure, so committed work since the last backup is not lost; take it WITH NORECOVERY if data files are intact.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within restore and disaster recovery.”",
      "options": [
        "STANDBY Option",
        "End of the sequence",
        "Log shipping with reads"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine STANDBY Option within restore and disaster recovery. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where STANDBY Option fits”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change. It requires a full backup, the relevant differentials and an unbroken log chain covering that time.”"
    },
    {
      "question": "Which fact is covered in the lesson section “STANDBY Option in practice”?",
      "options": [
        "With STANDBY Option, prefer measured, reversible changes.",
        "A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost.",
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost. If the data files are intact, BACKUP LOG... WITH NORECOVERY captures the tail and leaves the database restoring.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with STANDBY Option”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.",
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to STANDBY Option. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.",
        "STANDBY Option",
        "After a restore, users can be orphaned: a database user's SID no longer matches a server login."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates STANDBY Option with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What STANDBY Option means”?",
      "options": [
        "Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment.",
        "Lowest",
        "Medium"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment. Each step must be ordered correctly.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where STANDBY Option fits”?",
      "options": [
        "With STANDBY Option, prefer measured, reversible changes.",
        "Lowest",
        "The diagram below places STANDBY Option alongside the core concepts of restore and disaster recovery."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places STANDBY Option alongside the core concepts of restore and disaster recovery. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “STANDBY Option in practice”?",
      "options": [
        "STANDBY Option sits inside a larger system.",
        "The following comparison captures the distinctions that matter most when working with STANDBY Option:",
        "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with STANDBY Option:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with STANDBY Option”?",
      "options": [
        "The first example establishes the relevant state.",
        "STANDBY Option sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within restore and disaster recovery.”",
      "options": [
        "STANDBY Option",
        "End of the sequence",
        "Log shipping with reads"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine STANDBY Option within restore and disaster recovery. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where STANDBY Option fits”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change. It requires a full backup, the relevant differentials and an unbroken log chain covering that time.”"
    },
    {
      "question": "Which fact is covered in the lesson section “STANDBY Option in practice”?",
      "options": [
        "With STANDBY Option, prefer measured, reversible changes.",
        "A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost.",
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost. If the data files are intact, BACKUP LOG... WITH NORECOVERY captures the tail and leaves the database restoring.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with STANDBY Option”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.",
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to STANDBY Option. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.",
        "STANDBY Option",
        "After a restore, users can be orphaned: a database user's SID no longer matches a server login."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates STANDBY Option with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What STANDBY Option means”?",
      "options": [
        "Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment.",
        "Lowest",
        "Medium"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment. Each step must be ordered correctly.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where STANDBY Option fits”?",
      "options": [
        "With STANDBY Option, prefer measured, reversible changes.",
        "Lowest",
        "The diagram below places STANDBY Option alongside the core concepts of restore and disaster recovery."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places STANDBY Option alongside the core concepts of restore and disaster recovery. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “STANDBY Option in practice”?",
      "options": [
        "STANDBY Option sits inside a larger system.",
        "The following comparison captures the distinctions that matter most when working with STANDBY Option:",
        "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with STANDBY Option:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with STANDBY Option”?",
      "options": [
        "The first example establishes the relevant state.",
        "STANDBY Option sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within restore and disaster recovery.”",
      "options": [
        "STANDBY Option",
        "End of the sequence",
        "Log shipping with reads"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine STANDBY Option within restore and disaster recovery. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where STANDBY Option fits”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change. It requires a full backup, the relevant differentials and an unbroken log chain covering that time.”"
    },
    {
      "question": "Which fact is covered in the lesson section “STANDBY Option in practice”?",
      "options": [
        "With STANDBY Option, prefer measured, reversible changes.",
        "A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost.",
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost. If the data files are intact, BACKUP LOG... WITH NORECOVERY captures the tail and leaves the database restoring.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with STANDBY Option”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.",
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to STANDBY Option. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.",
        "STANDBY Option",
        "After a restore, users can be orphaned: a database user's SID no longer matches a server login."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates STANDBY Option with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What STANDBY Option means”?",
      "options": [
        "Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment.",
        "Lowest",
        "Medium"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment. Each step must be ordered correctly.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where STANDBY Option fits”?",
      "options": [
        "With STANDBY Option, prefer measured, reversible changes.",
        "Lowest",
        "The diagram below places STANDBY Option alongside the core concepts of restore and disaster recovery."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places STANDBY Option alongside the core concepts of restore and disaster recovery. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “STANDBY Option in practice”?",
      "options": [
        "STANDBY Option sits inside a larger system.",
        "The following comparison captures the distinctions that matter most when working with STANDBY Option:",
        "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with STANDBY Option:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with STANDBY Option”?",
      "options": [
        "The first example establishes the relevant state.",
        "STANDBY Option sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "STANDBY Option is a fundamental concept in restore and disaster recovery",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of STANDBY Option improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
