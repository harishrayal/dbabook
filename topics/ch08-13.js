/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch08-13.html */

window.TOPIC = {
  id: "ch08-13",
  title: "Restoring to a Different Database",

  lead: "Restoring to a Different Database is a core part of restore and disaster recovery. This topic explains what it is, how it works inside SQL Server, and what a production DBA must know to operate it safely.",

  objectives: [
    "Define what Restoring to a Different Database is and where it fits",
    "Explain how Restoring to a Different Database works internally",
    "Apply Restoring to a Different Database correctly in a production environment",
    "Recognise the common mistakes and risks involving Restoring to a Different Database",
    "Monitor and troubleshoot Restoring to a Different Database with the right tools"
  ],

  sections: [
    {
      h: "What Restoring to a Different Database means",
      html: `
<p>In this topic we examine <strong>Restoring to a Different Database</strong> within restore and disaster recovery. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths. Logical names come from RESTORE FILELISTONLY; ignoring MOVE overwrites or fails against existing paths.</p>
<p>After a restore, users can be orphaned: a database user's SID no longer matches a server login. Mapping logins to users (with ALTER USER or sp_change_users_login) restores access. Server-level objects such as jobs, linked servers and logins are not part of a database backup and must be scripted separately.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Restoring to a Different Database is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Restoring to a Different Database fits",
      html: `
<p>Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.</p>
<p>The diagram below places Restoring to a Different Database alongside the core concepts of restore and disaster recovery. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Restoring to a Different Data… concept map">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="280" y="140" width="200" height="60" rx="9" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="175" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Restoring to a Different Data…</text>
    <rect x="24" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Restore</text>
    <text x="124" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 1</text>
    <rect x="536" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">NORECOVERY</text>
    <text x="636" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 2</text>
    <rect x="24" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">STOPAT</text>
    <text x="124" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 3</text>
    <rect x="536" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">MOVE</text>
    <text x="636" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 4</text>
    <rect x="24" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Orphaned user</text>
    <text x="124" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 5</text>
    <rect x="536" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Standby</text>
    <text x="636" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 6</text>
    <line x1="380" y1="170" x2="124" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
  </svg>
  <div class="figcaption">Figure 1 — Restore and disaster recovery: how Restoring to a Different Database relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Restoring to a Different Database in practice",
      html: `
<p>Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.</p>
<p>The following comparison captures the distinctions that matter most when working with Restoring to a Different Database:</p>
<table>
  <tr><th>Option</th><th>Database state</th><th>Use</th></tr>
  <tr><td>NORECOVERY</td><td>Restoring</td><td>More backups to apply</td></tr>
  <tr><td>RECOVERY</td><td>Online</td><td>End of the sequence</td></tr>
  <tr><td>STANDBY</td><td>Read-only / restoring</td><td>Log shipping with reads</td></tr>
</table>
<p>Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment. Each step must be ordered correctly.</p>
      `,
    },
    {
      h: "Working with Restoring to a Different Database",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Restoring to a Different Database. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Restoring to a Different Database
RESTORE DATABASE SalesDB_Recover
FROM DISK = 'D:\Backups\SalesDB_Full.bak'
WITH MOVE 'SalesDB_data' TO 'D:\Data\SalesDB_Recover.mdf',
     MOVE 'SalesDB_log'  TO 'L:\Log\SalesDB_Recover.ldf',
     NORECOVERY, REPLACE, STATS = 10;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Restoring to a Different Database
RESTORE LOG SalesDB_Recover
FROM DISK = 'D:\Backups\SalesDB_Log.trn'
WITH STOPAT = '2026-03-14T09:29:00', RECOVERY, STATS = 10;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Restoring to a Different Database
-- Find orphaned users after a restore
SELECT dp.name AS user_name, dp.sid
FROM   sys.database_principals dp
LEFT JOIN sys.server_principals sp ON sp.sid = dp.sid
WHERE  dp.type IN ('S','U') AND sp.sid IS NULL
       AND dp.name NOT IN ('dbo','guest','INFORMATION_SCHEMA','sys');</code></pre>
<p>NORECOVERY leaves the database restoring so further backups can be applied. RECOVERY completes the sequence and makes the database usable. STANDBY leaves it read-only while still allowing further restores, useful for log shipping with query access.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change. It requires a full backup, the relevant differentials and an unbroken log chain covering that time.</p>
<table>
  <tr><th>Standby</th><th>RTO</th><th>Cost</th></tr>
  <tr><td>Cold</td><td>Hours</td><td>Lowest</td></tr>
  <tr><td>Warm</td><td>Tens of minutes</td><td>Medium</td></tr>
  <tr><td>Hot</td><td>Near zero</td><td>Highest</td></tr>
</table>
<p>A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost. If the data files are intact, BACKUP LOG ... WITH NORECOVERY captures the tail and leaves the database restoring.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Restoring to a Different Database, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Restoring to a Different Database",
      html: `
<p>This section consolidates <strong>Restoring to a Different Database</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.</p>
<p>Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment. Each step must be ordered correctly.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Restoring to a Different Database sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Option</th><th>Database state</th><th>Use</th></tr>
  <tr><td>NORECOVERY</td><td>Restoring</td><td>More backups to apply</td></tr>
  <tr><td>RECOVERY</td><td>Online</td><td>End of the sequence</td></tr>
  <tr><td>STANDBY</td><td>Read-only / restoring</td><td>Log shipping with reads</td></tr>
</table>
<p>NORECOVERY leaves the database restoring so further backups can be applied. RECOVERY completes the sequence and makes the database usable. STANDBY leaves it read-only while still allowing further restores, useful for log shipping with query access.</p>
<p>Use the following as a starting point when investigating Restoring to a Different Database. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Restoring to a Different Database
-- Find orphaned users after a restore
SELECT dp.name AS user_name, dp.sid
FROM   sys.database_principals dp
LEFT JOIN sys.server_principals sp ON sp.sid = dp.sid
WHERE  dp.type IN ('S','U') AND sp.sid IS NULL
       AND dp.name NOT IN ('dbo','guest','INFORMATION_SCHEMA','sys');</code></pre>
<p>Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change. It requires a full backup, the relevant differentials and an unbroken log chain covering that time.</p>
      `,
    }
  ],

  scenario: {
    title: "The accidental TRUNCATE at 09:31",
    html: `
A deployment truncated a critical table at 09:31. The DBA restored the last full to a new database with NORECOVERY, applied differentials and logs with STOPAT = 09:30:59, recovered it, and copied the lost rows back. Because the log chain was intact and a tail-log backup was taken first, no committed work was lost.
<p><strong>The Restoring to a Different Database lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
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
    },
    {
      q: "Why are logins considered separately from a database restore?",
      a: `
Logins and other server-level objects live in master and are not part of a user database backup, so their SIDs must be reconciled with database users (the orphaned-user problem) after a restore to another server.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within restore and disaster recovery.”",
      "options": [
        "Next, verify the result and capture a baseline.",
        "NORECOVERY leaves the database restoring so further backups can be applied.",
        "Restoring to a Different Database"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Restoring to a Different Database within restore and disaster recovery. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Restoring to a Different Database fits”?",
      "options": [
        "A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost.",
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.",
        "Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Restoring to a Different Database in practice”?",
      "options": [
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.",
        "Highest",
        "Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Restoring to a Different Database”?",
      "options": [
        "Medium",
        "Highest",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Restoring to a Different Database. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Use the following as a starting point when investigating Restoring to a Different Database.",
        "Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change. It requires a full backup, the relevant differentials and an unbroken log chain covering that time.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Restoring to a Different Database",
        "Lowest",
        "Medium"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “This section consolidates Restoring to a Different Database with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Restoring to a Different Database means”?",
      "options": [
        "Restoring to a Different Database sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths. Logical names come from RESTORE FILELISTONLY; ignoring MOVE overwrites or fails against existing paths.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Restoring to a Different Database fits”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "The diagram below places Restoring to a Different Database alongside the core concepts of restore and disaster recovery.",
        "Restoring to a Different Database sits inside a larger system."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The diagram below places Restoring to a Different Database alongside the core concepts of restore and disaster recovery. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Restoring to a Different Database in practice”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Restoring to a Different Database:",
        "More backups to apply",
        "End of the sequence"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Restoring to a Different Database:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Restoring to a Different Database”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Next, verify the result and capture a baseline.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within restore and disaster recovery.”",
      "options": [
        "Next, verify the result and capture a baseline.",
        "NORECOVERY leaves the database restoring so further backups can be applied.",
        "Restoring to a Different Database"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Restoring to a Different Database within restore and disaster recovery. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Restoring to a Different Database fits”?",
      "options": [
        "A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost.",
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.",
        "Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Restoring to a Different Database in practice”?",
      "options": [
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.",
        "Highest",
        "Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Restoring to a Different Database”?",
      "options": [
        "Medium",
        "Highest",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Restoring to a Different Database. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Use the following as a starting point when investigating Restoring to a Different Database.",
        "Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change. It requires a full backup, the relevant differentials and an unbroken log chain covering that time.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Restoring to a Different Database",
        "Lowest",
        "Medium"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “This section consolidates Restoring to a Different Database with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Restoring to a Different Database means”?",
      "options": [
        "Restoring to a Different Database sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths. Logical names come from RESTORE FILELISTONLY; ignoring MOVE overwrites or fails against existing paths.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Restoring to a Different Database fits”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "The diagram below places Restoring to a Different Database alongside the core concepts of restore and disaster recovery.",
        "Restoring to a Different Database sits inside a larger system."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The diagram below places Restoring to a Different Database alongside the core concepts of restore and disaster recovery. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Restoring to a Different Database in practice”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Restoring to a Different Database:",
        "More backups to apply",
        "End of the sequence"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Restoring to a Different Database:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Restoring to a Different Database”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Next, verify the result and capture a baseline.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within restore and disaster recovery.”",
      "options": [
        "Next, verify the result and capture a baseline.",
        "NORECOVERY leaves the database restoring so further backups can be applied.",
        "Restoring to a Different Database"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Restoring to a Different Database within restore and disaster recovery. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Restoring to a Different Database fits”?",
      "options": [
        "A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost.",
        "Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.",
        "Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Restoring to a Different Database in practice”?",
      "options": [
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.",
        "Highest",
        "Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Restoring to a Different Database”?",
      "options": [
        "Medium",
        "Highest",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Restoring to a Different Database. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Use the following as a starting point when investigating Restoring to a Different Database.",
        "Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change. It requires a full backup, the relevant differentials and an unbroken log chain covering that time.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Restoring to a Different Database",
        "Lowest",
        "Medium"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “This section consolidates Restoring to a Different Database with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Restoring to a Different Database means”?",
      "options": [
        "Restoring to a Different Database sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths. Logical names come from RESTORE FILELISTONLY; ignoring MOVE overwrites or fails against existing paths.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Restoring to a Different Database fits”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "The diagram below places Restoring to a Different Database alongside the core concepts of restore and disaster recovery.",
        "Restoring to a Different Database sits inside a larger system."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The diagram below places Restoring to a Different Database alongside the core concepts of restore and disaster recovery. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Restoring to a Different Database in practice”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Restoring to a Different Database:",
        "More backups to apply",
        "End of the sequence"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Restoring to a Different Database:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Restoring to a Different Database”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Next, verify the result and capture a baseline.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Restoring to a Different Database is a fundamental concept in restore and disaster recovery",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Restoring to a Different Database improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
