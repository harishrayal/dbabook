/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch08-26.html */

window.TOPIC = {
  id: "ch08-26",
  title: "Cold, Warm, and Hot Standby",

  lead: "Understanding Cold, Warm, and Hot Standby is essential for anyone responsible for restore and disaster recovery. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what Cold, Warm, and Hot Standby is and where it fits",
    "Explain how Cold, Warm, and Hot Standby works internally",
    "Apply Cold, Warm, and Hot Standby correctly in a production environment",
    "Recognise the common mistakes and risks involving Cold, Warm, and Hot Standby",
    "Monitor and troubleshoot Cold, Warm, and Hot Standby with the right tools"
  ],

  sections: [
    {
      h: "What Cold, Warm, and Hot Standby means",
      html: `
<p>In this topic we examine <strong>Cold, Warm, and Hot Standby</strong> within restore and disaster recovery. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>NORECOVERY leaves the database restoring so further backups can be applied. RECOVERY completes the sequence and makes the database usable. STANDBY leaves it read-only while still allowing further restores, useful for log shipping with query access.</p>
<p>Point-in-time recovery uses STOPAT in RESTORE LOG to stop at a precise moment just before an accidental change. It requires a full backup, the relevant differentials and an unbroken log chain covering that time.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Cold, Warm, and Hot Standby is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Cold, Warm, and Hot Standby fits",
      html: `
<p>A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost. If the data files are intact, BACKUP LOG ... WITH NORECOVERY captures the tail and leaves the database restoring.</p>
<p>The diagram below places Cold, Warm, and Hot Standby alongside the core concepts of restore and disaster recovery. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Cold, Warm, and Hot Standby flow">
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
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Cold, Warm, and Hot Standby</text>
  </svg>
  <div class="figcaption">Figure 1 — Restore and disaster recovery: how Cold, Warm, and Hot Standby relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Cold, Warm, and Hot Standby in practice",
      html: `
<p>Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths. Logical names come from RESTORE FILELISTONLY; ignoring MOVE overwrites or fails against existing paths.</p>
<p>The following comparison captures the distinctions that matter most when working with Cold, Warm, and Hot Standby:</p>
<table>
  <tr><th>Option</th><th>Database state</th><th>Use</th></tr>
  <tr><td>NORECOVERY</td><td>Restoring</td><td>More backups to apply</td></tr>
  <tr><td>RECOVERY</td><td>Online</td><td>End of the sequence</td></tr>
  <tr><td>STANDBY</td><td>Read-only / restoring</td><td>Log shipping with reads</td></tr>
</table>
<p>After a restore, users can be orphaned: a database user's SID no longer matches a server login. Mapping logins to users (with ALTER USER or sp_change_users_login) restores access. Server-level objects such as jobs, linked servers and logins are not part of a database backup and must be scripted separately.</p>
      `,
    },
    {
      h: "Working with Cold, Warm, and Hot Standby",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Cold, Warm, and Hot Standby. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Cold, Warm, and Hot Standby
RESTORE DATABASE SalesDB_Recover
FROM DISK = 'D:\Backups\SalesDB_Full.bak'
WITH MOVE 'SalesDB_data' TO 'D:\Data\SalesDB_Recover.mdf',
     MOVE 'SalesDB_log'  TO 'L:\Log\SalesDB_Recover.ldf',
     NORECOVERY, REPLACE, STATS = 10;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Cold, Warm, and Hot Standby
RESTORE LOG SalesDB_Recover
FROM DISK = 'D:\Backups\SalesDB_Log.trn'
WITH STOPAT = '2026-03-14T09:29:00', RECOVERY, STATS = 10;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Cold, Warm, and Hot Standby
-- Find orphaned users after a restore
SELECT dp.name AS user_name, dp.sid
FROM   sys.database_principals dp
LEFT JOIN sys.server_principals sp ON sp.sid = dp.sid
WHERE  dp.type IN ('S','U') AND sp.sid IS NULL
       AND dp.name NOT IN ('dbo','guest','INFORMATION_SCHEMA','sys');</code></pre>
<p>Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.</p>
<table>
  <tr><th>Standby</th><th>RTO</th><th>Cost</th></tr>
  <tr><td>Cold</td><td>Hours</td><td>Lowest</td></tr>
  <tr><td>Warm</td><td>Tens of minutes</td><td>Medium</td></tr>
  <tr><td>Hot</td><td>Near zero</td><td>Highest</td></tr>
</table>
<p>Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment. Each step must be ordered correctly.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Cold, Warm, and Hot Standby, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Cold, Warm, and Hot Standby",
      html: `
<p>This section consolidates <strong>Cold, Warm, and Hot Standby</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths. Logical names come from RESTORE FILELISTONLY; ignoring MOVE overwrites or fails against existing paths.</p>
<p>After a restore, users can be orphaned: a database user's SID no longer matches a server login. Mapping logins to users (with ALTER USER or sp_change_users_login) restores access. Server-level objects such as jobs, linked servers and logins are not part of a database backup and must be scripted separately.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Cold, Warm, and Hot Standby sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Standby</th><th>RTO</th><th>Cost</th></tr>
  <tr><td>Cold</td><td>Hours</td><td>Lowest</td></tr>
  <tr><td>Warm</td><td>Tens of minutes</td><td>Medium</td></tr>
  <tr><td>Hot</td><td>Near zero</td><td>Highest</td></tr>
</table>
<p>Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.</p>
<p>Use the following as a starting point when investigating Cold, Warm, and Hot Standby. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Cold, Warm, and Hot Standby
RESTORE DATABASE SalesDB_Recover
FROM DISK = 'D:\Backups\SalesDB_Full.bak'
WITH MOVE 'SalesDB_data' TO 'D:\Data\SalesDB_Recover.mdf',
     MOVE 'SalesDB_log'  TO 'L:\Log\SalesDB_Recover.ldf',
     NORECOVERY, REPLACE, STATS = 10;</code></pre>
<p>Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.</p>
      `,
    }
  ],

  scenario: {
    title: "Restore succeeded but nobody could log in",
    html: `
A database was restored to a new server and the application failed to authenticate. The users were orphaned because their SIDs did not match server logins. Mapping each login to its user with ALTER USER ... WITH LOGIN restored access; the runbook now includes an orphan check after every restore.
<p><strong>The Cold, Warm, and Hot Standby lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
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
        "A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost.",
        "Cold, Warm, and Hot Standby",
        "Cold, Warm, and Hot Standby is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Cold, Warm, and Hot Standby within restore and disaster recovery. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Cold, Warm, and Hot Standby fits”?",
      "options": [
        "A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost.",
        "Cold, Warm, and Hot Standby is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost. If the data files are intact, BACKUP LOG... WITH NORECOVERY captures the tail and leaves the database restoring.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Cold, Warm, and Hot Standby in practice”?",
      "options": [
        "A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost.",
        "The diagram below places Cold, Warm, and Hot Standby alongside the core concepts of restore and disaster recovery.",
        "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths. Logical names come from RESTORE FILELISTONLY; ignoring MOVE overwrites or fails against existing paths.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Cold, Warm, and Hot Standby”?",
      "options": [
        "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths.",
        "Theory becomes useful when you can apply it.",
        "The diagram below places Cold, Warm, and Hot Standby alongside the core concepts of restore and disaster recovery."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Cold, Warm, and Hot Standby. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.",
        "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths.",
        "The following comparison captures the distinctions that matter most when working with Cold, Warm, and Hot Standby:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "After a restore, users can be orphaned: a database user's SID no longer matches a server login.",
        "More backups to apply",
        "Cold, Warm, and Hot Standby"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Cold, Warm, and Hot Standby with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Cold, Warm, and Hot Standby means”?",
      "options": [
        "The first example establishes the relevant state.",
        "NORECOVERY leaves the database restoring so further backups can be applied.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “NORECOVERY leaves the database restoring so further backups can be applied. RECOVERY completes the sequence and makes the database usable. STANDBY leaves it read-only while still allowing further restores, useful for log shipping with query access.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Cold, Warm, and Hot Standby fits”?",
      "options": [
        "The diagram below places Cold, Warm, and Hot Standby alongside the core concepts of restore and disaster recovery.",
        "Log shipping with reads",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Cold, Warm, and Hot Standby alongside the core concepts of restore and disaster recovery. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Cold, Warm, and Hot Standby in practice”?",
      "options": [
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.",
        "Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment.",
        "The following comparison captures the distinctions that matter most when working with Cold, Warm, and Hot Standby:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Cold, Warm, and Hot Standby:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Cold, Warm, and Hot Standby”?",
      "options": [
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.",
        "The first example establishes the relevant state.",
        "Log shipping with reads"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within restore and disaster recovery.”",
      "options": [
        "A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost.",
        "Cold, Warm, and Hot Standby",
        "Cold, Warm, and Hot Standby is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Cold, Warm, and Hot Standby within restore and disaster recovery. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Cold, Warm, and Hot Standby fits”?",
      "options": [
        "A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost.",
        "Cold, Warm, and Hot Standby is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost. If the data files are intact, BACKUP LOG... WITH NORECOVERY captures the tail and leaves the database restoring.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Cold, Warm, and Hot Standby in practice”?",
      "options": [
        "A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost.",
        "The diagram below places Cold, Warm, and Hot Standby alongside the core concepts of restore and disaster recovery.",
        "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths. Logical names come from RESTORE FILELISTONLY; ignoring MOVE overwrites or fails against existing paths.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Cold, Warm, and Hot Standby”?",
      "options": [
        "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths.",
        "Theory becomes useful when you can apply it.",
        "The diagram below places Cold, Warm, and Hot Standby alongside the core concepts of restore and disaster recovery."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Cold, Warm, and Hot Standby. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.",
        "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths.",
        "The following comparison captures the distinctions that matter most when working with Cold, Warm, and Hot Standby:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "After a restore, users can be orphaned: a database user's SID no longer matches a server login.",
        "More backups to apply",
        "Cold, Warm, and Hot Standby"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Cold, Warm, and Hot Standby with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Cold, Warm, and Hot Standby means”?",
      "options": [
        "The first example establishes the relevant state.",
        "NORECOVERY leaves the database restoring so further backups can be applied.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “NORECOVERY leaves the database restoring so further backups can be applied. RECOVERY completes the sequence and makes the database usable. STANDBY leaves it read-only while still allowing further restores, useful for log shipping with query access.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Cold, Warm, and Hot Standby fits”?",
      "options": [
        "The diagram below places Cold, Warm, and Hot Standby alongside the core concepts of restore and disaster recovery.",
        "Log shipping with reads",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Cold, Warm, and Hot Standby alongside the core concepts of restore and disaster recovery. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Cold, Warm, and Hot Standby in practice”?",
      "options": [
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.",
        "Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment.",
        "The following comparison captures the distinctions that matter most when working with Cold, Warm, and Hot Standby:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Cold, Warm, and Hot Standby:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Cold, Warm, and Hot Standby”?",
      "options": [
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.",
        "The first example establishes the relevant state.",
        "Log shipping with reads"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within restore and disaster recovery.”",
      "options": [
        "A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost.",
        "Cold, Warm, and Hot Standby",
        "Cold, Warm, and Hot Standby is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Cold, Warm, and Hot Standby within restore and disaster recovery. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Cold, Warm, and Hot Standby fits”?",
      "options": [
        "A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost.",
        "Cold, Warm, and Hot Standby is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost. If the data files are intact, BACKUP LOG... WITH NORECOVERY captures the tail and leaves the database restoring.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Cold, Warm, and Hot Standby in practice”?",
      "options": [
        "A tail-log backup captures log records after the last scheduled backup — essential after a failure so no committed work is lost.",
        "The diagram below places Cold, Warm, and Hot Standby alongside the core concepts of restore and disaster recovery.",
        "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths. Logical names come from RESTORE FILELISTONLY; ignoring MOVE overwrites or fails against existing paths.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Cold, Warm, and Hot Standby”?",
      "options": [
        "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths.",
        "Theory becomes useful when you can apply it.",
        "The diagram below places Cold, Warm, and Hot Standby alongside the core concepts of restore and disaster recovery."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Cold, Warm, and Hot Standby. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.",
        "Restoring to a different server or database name requires WITH MOVE to redirect logical file names to new physical paths.",
        "The following comparison captures the distinctions that matter most when working with Cold, Warm, and Hot Standby:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "After a restore, users can be orphaned: a database user's SID no longer matches a server login.",
        "More backups to apply",
        "Cold, Warm, and Hot Standby"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Cold, Warm, and Hot Standby with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Cold, Warm, and Hot Standby means”?",
      "options": [
        "The first example establishes the relevant state.",
        "NORECOVERY leaves the database restoring so further backups can be applied.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “NORECOVERY leaves the database restoring so further backups can be applied. RECOVERY completes the sequence and makes the database usable. STANDBY leaves it read-only while still allowing further restores, useful for log shipping with query access.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Cold, Warm, and Hot Standby fits”?",
      "options": [
        "The diagram below places Cold, Warm, and Hot Standby alongside the core concepts of restore and disaster recovery.",
        "Log shipping with reads",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Cold, Warm, and Hot Standby alongside the core concepts of restore and disaster recovery. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Cold, Warm, and Hot Standby in practice”?",
      "options": [
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.",
        "Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment.",
        "The following comparison captures the distinctions that matter most when working with Cold, Warm, and Hot Standby:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Cold, Warm, and Hot Standby:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Cold, Warm, and Hot Standby”?",
      "options": [
        "Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.",
        "The first example establishes the relevant state.",
        "Log shipping with reads"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Cold, Warm, and Hot Standby is a fundamental concept in restore and disaster recovery",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Cold, Warm, and Hot Standby improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
