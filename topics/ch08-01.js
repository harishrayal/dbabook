/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch08-01.html */

window.TOPIC = {
  id: "ch08-01",
  title: "What Is Database Restoration?",

  lead: "Restoration is the act of reading backup media and rebuilding a database from it — the moment your backup strategy either proves itself or is exposed as an assumption.",

  objectives: [
    "Define restoration and separate it from recovery, restart, and failover",
    "Describe the three phases of a restore: copy, roll forward, roll back",
    "Inspect backup media safely with RESTORE HEADERONLY, FILELISTONLY, and VERIFYONLY",
    "Explain why a backup is only evidence until it has been restored"
  ],

  sections: [
    {
      h: "Defining restoration",
      html: `
<p><strong>Restoration</strong> is the process of rebuilding a database from backup media. It is operator-initiated: someone runs a <code>RESTORE</code> command, SQL Server reads one or more backup files, and a usable database appears at a moment and a location of your choosing.</p>
<p>It is the exact inverse of a backup. A backup copies pages <em>forward</em> in time onto media; a restore reads those pages <em>back</em> and lands them in data and log files. But a restore is far more than a file copy — SQL Server validates the media, writes pages into the target files, replays the transaction log in LSN order, and finally rolls back anything unfinished so the result is transactionally consistent.</p>
<blockquote>A backup is a promise written down on disk. A restore is the moment that promise is either kept or broken.</blockquote>
<p>Restoration is used for far more than disasters. Typical targets:</p>
<ul>
  <li><strong>Same database, same server</strong> — undoing a mistake or corruption</li>
  <li><strong>Different database name</strong> — rebuilding production into <code>ERP_SANDBOX</code> for testing</li>
  <li><strong>Different server</strong> — DR failover, migration, or building a reporting copy</li>
  <li><strong>Earlier moment</strong> — point-in-time recovery to before a bad change</li>
</ul>
`
    },
    {
      h: "Restore, recovery, restart, failover",
      html: `
<p>The vocabulary is used loosely in conversation, but in an incident the precision matters — these are four different things:</p>
<table>
  <tr><th>Term</th><th>What it means</th><th>Triggered by</th></tr>
  <tr><td><strong>Restore</strong></td><td>Rebuild a database from backup media</td><td>A DBA running RESTORE</td></tr>
  <tr><td><strong>Recovery</strong></td><td>Roll back uncommitted transactions and open the database to users</td><td>The final step of a restore (<code>WITH RECOVERY</code>), or automatically on service restart</td></tr>
  <tr><td><strong>Crash recovery</strong></td><td>Replay the log of an already-online database after an unexpected stop</td><td>SQL Server, automatically</td></tr>
  <tr><td><strong>Failover</strong></td><td>Switch clients to a replica or standby copy</td><td>HA mechanism or a DBA</td></tr>
</table>
<p>Notice that a restore ends with recovery: the same roll-forward / roll-back machinery SQL Server uses after a power cut is what finishes a <code>RESTORE</code>. Understanding that shared machinery is what makes the options in the rest of this chapter (<code>NORECOVERY</code>, <code>RECOVERY</code>, <code>STANDBY</code>, <code>STOPAT</code>) make sense instead of looking like arbitrary keywords.</p>
`
    },
    {
      h: "The three phases of a restore",
      html: `
<p>Every restore, from a 2 GB sandbox to a 4 TB warehouse, moves through the same three phases:</p>
<ul>
  <li><strong>1. Copy</strong> — SQL Server reads the backup set and writes pages into the target data and log files. This is the phase that consumes disk I/O and clock time; it is where insufficient space and missing directories fail.</li>
  <li><strong>2. Roll forward (redo)</strong> — log records are replayed in LSN order so every committed transaction that belongs to the restore point is applied.</li>
  <li><strong>3. Roll back (undo)</strong> — transactions that were still active at the restore point are rolled back. This only runs when the restore finishes with <code>RECOVERY</code>.</li>
</ul>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Three phases of a restore">
    <defs>
      <marker id="rst-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
      <marker id="rst-arrow-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--amber)"/>
      </marker>
    </defs>

    <text x="380" y="26" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Read backup media → rebuild data → make it consistent</text>

    <rect x="15" y="45" width="170" height="86" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="100" y="74" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="600" font-family="Segoe UI, sans-serif">Backup media</text>
    <text x="100" y="96" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">full · differential</text>
    <text x="100" y="114" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">log backup files</text>

    <rect x="215" y="45" width="170" height="86" rx="10" fill="var(--surface)" stroke="var(--border)" stroke-width="1.6"/>
    <rect x="215" y="45" width="170" height="26" rx="10" fill="var(--accent-soft)"/>
    <text x="300" y="63" text-anchor="middle" fill="var(--accent-strong)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">1 · Copy</text>
    <text x="300" y="90" text-anchor="middle" fill="var(--text)" font-size="12.5" font-family="Segoe UI, sans-serif">write pages into</text>
    <text x="300" y="108" text-anchor="middle" fill="var(--text)" font-size="12.5" font-family="Segoe UI, sans-serif">MDF / NDF / LDF files</text>
    <text x="300" y="126" text-anchor="middle" fill="var(--muted)" font-size="11" font-style="italic" font-family="Segoe UI, sans-serif">I/O heavy — needs space</text>

    <rect x="415" y="45" width="165" height="86" rx="10" fill="var(--surface)" stroke="var(--border)" stroke-width="1.6"/>
    <rect x="415" y="45" width="165" height="26" rx="10" fill="var(--accent-soft)"/>
    <text x="497" y="63" text-anchor="middle" fill="var(--accent-strong)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">2 · Roll forward</text>
    <text x="497" y="90" text-anchor="middle" fill="var(--text)" font-size="12.5" font-family="Segoe UI, sans-serif">redo committed work</text>
    <text x="497" y="108" text-anchor="middle" fill="var(--text)" font-size="12.5" font-family="Segoe UI, sans-serif">in LSN order</text>
    <text x="497" y="126" text-anchor="middle" fill="var(--muted)" font-size="11" font-style="italic" font-family="Segoe UI, sans-serif">always runs</text>

    <rect x="610" y="45" width="135" height="86" rx="10" fill="var(--surface)" stroke="var(--amber)" stroke-width="1.6"/>
    <rect x="610" y="45" width="135" height="26" rx="10" fill="var(--amber)" opacity="0.22"/>
    <text x="677" y="63" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">3 · Roll back</text>
    <text x="677" y="90" text-anchor="middle" fill="var(--text)" font-size="12.5" font-family="Segoe UI, sans-serif">undo in-flight</text>
    <text x="677" y="108" text-anchor="middle" fill="var(--text)" font-size="12.5" font-family="Segoe UI, sans-serif">transactions</text>
    <text x="677" y="126" text-anchor="middle" fill="var(--muted)" font-size="11" font-style="italic" font-family="Segoe UI, sans-serif">only with RECOVERY</text>

    <line x1="185" y1="88" x2="213" y2="88" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#rst-arrow)"/>
    <line x1="385" y1="88" x2="413" y2="88" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#rst-arrow)"/>
    <line x1="580" y1="88" x2="608" y2="88" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#rst-arrow)"/>

    <rect x="15" y="175" width="730" height="70" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="204" text-anchor="middle" fill="var(--accent-strong)" font-size="16" font-weight="700" font-family="Segoe UI, sans-serif">Database ONLINE — open to users, transactions consistent</text>
    <text x="380" y="228" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-family="Segoe UI, sans-serif">reached when the restore finishes WITH RECOVERY (the default)</text>

    <line x1="677" y1="131" x2="420" y2="175" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#rst-arrow)"/>

    <rect x="15" y="270" width="355" height="52" rx="10" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="192" y="292" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">WITH NORECOVERY</text>
    <text x="192" y="311" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">stops after phase 2 — database stays in RESTORING</text>

    <rect x="390" y="270" width="355" height="52" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="567" y="292" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">WITH STANDBY</text>
    <text x="567" y="311" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">stops between restores but leaves the copy readable</text>

    <line x1="300" y1="131" x2="200" y2="270" stroke="var(--amber)" stroke-width="1.6" marker-end="url(#rst-arrow-amber)"/>
  </svg>
  <div class="figcaption">Figure 1 — A restore copies, rolls forward, and rolls back; NORECOVERY stops it before the final rollback.</div>
</div>
`
    },
    {
      h: "Inspecting the media before you restore",
      html: `
<p>Three read-only commands tell you what you are about to restore without touching a single production page. Run them first, every time:</p>
<pre><code class="language-sql">-- 1. What is in this backup set? (type, dates, LSNs, file count)
RESTORE HEADERONLY
FROM DISK = N'E:\\SQLBackup\\ERP_FULL_2026-11-16.bak';

-- 2. Which files will be created, and how big are they?
RESTORE FILELISTONLY
FROM DISK = N'E:\\SQLBackup\\ERP_FULL_2026-11-16.bak';

-- 3. Is the media readable and are the checksums intact?
RESTORE VERIFYONLY
FROM DISK = N'E:\\SQLBackup\\ERP_FULL_2026-11-16.bak'
WITH CHECKSUMS, STATS = 5;</code></pre>
<p><strong>HEADERONLY</strong> returns one row per backup in the file: <code>BackupType</code> (1 = database, 2 = log, 5 = differential), <code>BackupStartDate</code>, <code>FirstLSN</code> / <code>LastLSN</code>, and the database name. <strong>FILELISTONLY</strong> returns the logical names, physical paths, type (D = data, L = log), and sizes of every file in the set — everything you need to prepare <code>WITH MOVE</code> and to check free space.</p>
<p><strong>VERIFYONLY</strong> confirms the media is readable and checksums pass, but it does not rebuild the database and does not prove every page is correct. Treat it as a smoke test; only an actual restore proves a backup works.</p>
`
    },
    {
      h: "What a successful restore requires",
      html: `
<p>Restores fail for boring, predictable reasons. Before starting, confirm:</p>
<ul>
  <li><strong>An intact chain</strong> — the full base, any needed differentials, and every log backup in sequence with no gaps</li>
  <li><strong>Enough space</strong> — target files sized from <code>FILELISTONLY</code>, plus headroom for growth</li>
  <li><strong>Valid target paths</strong> — directories exist, or a <code>WITH MOVE</code> list is ready (covered in topic ch08-15)</li>
  <li><strong>Permissions</strong> — typically sysadmin, or <code>RESTORE ANY</code> plus ownership of the target database</li>
  <li><strong>Compatibility</strong> — the target instance version and edition must accept the backup (a newer major version cannot be restored onto an older one)</li>
</ul>
<p>Equally important is what happens <em>after</em> the command succeeds: <code>DBCC CHECKDB</code>, row-count spot checks, login and job verification, and a recorded restore duration. A restore that has never been timed, space-checked, and rehearsed is still an assumption — the RTO in your DR plan is a guess until someone has run it end to end.</p>
`
    }
  ],

  scenario: {
    title: "The backup job was green for 400 days — the first restore test failed",
    html: `
<p>A payments company had nightly full backups with transaction log backups every 15 minutes, all reporting success for over a year. When the auditor demanded the first real restore test, the DBA restored the 240 GB database to the DR test server and the copy phase died after 22 minutes: the target volume had only 150 GB free, because the production database had grown six-fold since the machine was built and no one had re-run a restore since.</p>
<p>Diagnosis took minutes — <code>RESTORE FILELISTONLY</code> showed required file sizes far above available space, and the log backup files older than 7 days had already been purged from the DR site, breaking the chain. Resolution: provision a larger volume, restore with <code>WITH MOVE</code> onto it, and apply log backups copied from the primary site. Prevention: a monthly automated restore test into a scratch instance with a free-space pre-check, retention of log backups long enough to cover the recovery window, and a recorded restore duration feeding the real RTO. <strong>The backups were never the problem — the untested restore was.</strong></p>
`
  },

  interview: [
    {
      q: "What is the difference between a restore and recovery?",
      a: "A restore is the explicit process of rebuilding a database from backup media — copying pages, then rolling forward. Recovery is the final consistency step: rolling back uncommitted transactions and opening the database to users. A restore ends with recovery (the default), but recovery also happens automatically when SQL Server restarts a database that was already online."
    },
    {
      q: "How do you know a backup will restore without actually restoring it?",
      a: "You do not — fully. RESTORE VERIFYONLY WITH CHECKSUMS proves the media is readable and checksums validate, and HEADERONLY/FILELISTONLY confirm the chain, dates, and file layout. But only a real restore plus DBCC CHECKDB proves recoverability, which is why restore tests are mandatory rather than optional."
    },
    {
      q: "Which command tells you the physical file layout a backup will create?",
      a: "RESTORE FILELISTONLY FROM DISK — it returns LogicalName, PhysicalName, Type (D/L), and Size for every file in the set. Those rows drive both the free-space check and the WITH MOVE clauses you will need on a different server."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “_____ is the process of rebuilding a database from backup media.”",
      "options": [
        "back",
        "Same database, same server",
        "Restoration"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Restoration is the process of rebuilding a database from backup media. It is operator-initiated: someone runs a RESTORE command, SQL Server reads one or more backup files, and a usable database appears at a moment and a location of your choosing.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Restore, recovery, restart, failover”?",
      "options": [
        "Every restore, from a 2 GB sandbox to a 4 TB warehouse, moves through the same three phases:",
        "The vocabulary is used loosely in conversation, but in an incident the precision matters — these are four different things:",
        "Restoration is used for far more than disasters."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The vocabulary is used loosely in conversation, but in an incident the precision matters — these are four different things:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The three phases of a restore”?",
      "options": [
        "Every restore, from a 2 GB sandbox to a 4 TB warehouse, moves through the same three phases:",
        "The vocabulary is used loosely in conversation, but in an incident the precision matters — these are four different things:",
        "Notice that a restore ends with recovery: the same roll-forward / roll-back machinery SQL Server uses after a power cut is what finishes a RESTORE."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Every restore, from a 2 GB sandbox to a 4 TB warehouse, moves through the same three phases:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Inspecting the media before you restore”?",
      "options": [
        "Notice that a restore ends with recovery: the same roll-forward / roll-back machinery SQL Server uses after a power cut is what finishes a RESTORE.",
        "A DBA running RESTORE",
        "Three read-only commands tell you what you are about to restore without touching a single production page."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Three read-only commands tell you what you are about to restore without touching a single production page. Run them first, every time:”"
    },
    {
      "question": "Which fact is covered in the lesson section “What a successful restore requires”?",
      "options": [
        "The final step of a restore ( WITH RECOVERY ), or automatically on service restart",
        "Restores fail for boring, predictable reasons.",
        "A DBA running RESTORE"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Restores fail for boring, predictable reasons. Before starting, confirm:”"
    },
    {
      "question": "Complete the lesson statement: “A backup copies pages _____ in time onto media; a restore reads those pages back and lands them in data and log files.”",
      "options": [
        "forward",
        "Restore",
        "Recovery"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “It is the exact inverse of a backup. A backup copies pages forward in time onto media; a restore reads those pages back and lands them in data and log files. But a restore is far more than a file copy — SQL Server validates the media, writes pages into the target files, replays the transaction log in LSN order, and finally rolls back anything unfinished so the result is transactionally consistent.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Restore, recovery, restart, failover”?",
      "options": [
        "Restores fail for boring, predictable reasons.",
        "after",
        "Notice that a restore ends with recovery: the same roll-forward / roll-back machinery SQL Server uses after a power cut is what finishes a RESTORE."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Notice that a restore ends with recovery: the same roll-forward / roll-back machinery SQL Server uses after a power cut is what finishes a RESTORE. Understanding that shared machinery is what makes the options in the rest of this chapter ( NORECOVERY, RECOVERY, STANDBY, STOPAT ) make sense instead of looking like arbitrary keywords.”"
    },
    {
      "question": "Complete the lesson statement: “_____ returns one row per backup in the file: BackupType (1 = database, 2 = log, 5 = differential), BackupStartDate, FirstLSN / LastLSN, and the database name.”",
      "options": [
        "Crash recovery",
        "HEADERONLY",
        "Recovery"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “HEADERONLY returns one row per backup in the file: BackupType (1 = database, 2 = log, 5 = differential), BackupStartDate, FirstLSN / LastLSN, and the database name. FILELISTONLY returns the logical names, physical paths, type (D = data, L = log), and sizes of every file in the set — everything you need to prepare WITH MOVE and to check free space.”"
    },
    {
      "question": "Complete the lesson statement: “Equally important is what happens _____ the command succeeds: DBCC CHECKDB, row-count spot checks, login and job verification, and a recorded restore duration.”",
      "options": [
        "after",
        "Crash recovery",
        "Failover"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Equally important is what happens after the command succeeds: DBCC CHECKDB, row-count spot checks, login and job verification, and a recorded restore duration. A restore that has never been timed, space-checked, and rehearsed is still an assumption — the RTO in your DR plan is a guess until someone has run it end to end.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Defining restoration”?",
      "options": [
        "Restores fail for boring, predictable reasons.",
        "after",
        "Restoration is used for far more than disasters."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Restoration is used for far more than disasters. Typical targets:”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “_____ is the process of rebuilding a database from backup media.”",
      "options": [
        "back",
        "Same database, same server",
        "Restoration"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Restoration is the process of rebuilding a database from backup media. It is operator-initiated: someone runs a RESTORE command, SQL Server reads one or more backup files, and a usable database appears at a moment and a location of your choosing.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Restore, recovery, restart, failover”?",
      "options": [
        "Every restore, from a 2 GB sandbox to a 4 TB warehouse, moves through the same three phases:",
        "The vocabulary is used loosely in conversation, but in an incident the precision matters — these are four different things:",
        "Restoration is used for far more than disasters."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The vocabulary is used loosely in conversation, but in an incident the precision matters — these are four different things:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The three phases of a restore”?",
      "options": [
        "Every restore, from a 2 GB sandbox to a 4 TB warehouse, moves through the same three phases:",
        "The vocabulary is used loosely in conversation, but in an incident the precision matters — these are four different things:",
        "Notice that a restore ends with recovery: the same roll-forward / roll-back machinery SQL Server uses after a power cut is what finishes a RESTORE."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Every restore, from a 2 GB sandbox to a 4 TB warehouse, moves through the same three phases:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Inspecting the media before you restore”?",
      "options": [
        "Notice that a restore ends with recovery: the same roll-forward / roll-back machinery SQL Server uses after a power cut is what finishes a RESTORE.",
        "A DBA running RESTORE",
        "Three read-only commands tell you what you are about to restore without touching a single production page."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Three read-only commands tell you what you are about to restore without touching a single production page. Run them first, every time:”"
    },
    {
      "question": "Which fact is covered in the lesson section “What a successful restore requires”?",
      "options": [
        "The final step of a restore ( WITH RECOVERY ), or automatically on service restart",
        "Restores fail for boring, predictable reasons.",
        "A DBA running RESTORE"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Restores fail for boring, predictable reasons. Before starting, confirm:”"
    },
    {
      "question": "Complete the lesson statement: “A backup copies pages _____ in time onto media; a restore reads those pages back and lands them in data and log files.”",
      "options": [
        "forward",
        "Restore",
        "Recovery"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “It is the exact inverse of a backup. A backup copies pages forward in time onto media; a restore reads those pages back and lands them in data and log files. But a restore is far more than a file copy — SQL Server validates the media, writes pages into the target files, replays the transaction log in LSN order, and finally rolls back anything unfinished so the result is transactionally consistent.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Restore, recovery, restart, failover”?",
      "options": [
        "Restores fail for boring, predictable reasons.",
        "after",
        "Notice that a restore ends with recovery: the same roll-forward / roll-back machinery SQL Server uses after a power cut is what finishes a RESTORE."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Notice that a restore ends with recovery: the same roll-forward / roll-back machinery SQL Server uses after a power cut is what finishes a RESTORE. Understanding that shared machinery is what makes the options in the rest of this chapter ( NORECOVERY, RECOVERY, STANDBY, STOPAT ) make sense instead of looking like arbitrary keywords.”"
    },
    {
      "question": "Complete the lesson statement: “_____ returns one row per backup in the file: BackupType (1 = database, 2 = log, 5 = differential), BackupStartDate, FirstLSN / LastLSN, and the database name.”",
      "options": [
        "Crash recovery",
        "HEADERONLY",
        "Recovery"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “HEADERONLY returns one row per backup in the file: BackupType (1 = database, 2 = log, 5 = differential), BackupStartDate, FirstLSN / LastLSN, and the database name. FILELISTONLY returns the logical names, physical paths, type (D = data, L = log), and sizes of every file in the set — everything you need to prepare WITH MOVE and to check free space.”"
    },
    {
      "question": "Complete the lesson statement: “Equally important is what happens _____ the command succeeds: DBCC CHECKDB, row-count spot checks, login and job verification, and a recorded restore duration.”",
      "options": [
        "after",
        "Crash recovery",
        "Failover"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Equally important is what happens after the command succeeds: DBCC CHECKDB, row-count spot checks, login and job verification, and a recorded restore duration. A restore that has never been timed, space-checked, and rehearsed is still an assumption — the RTO in your DR plan is a guess until someone has run it end to end.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Defining restoration”?",
      "options": [
        "Restores fail for boring, predictable reasons.",
        "after",
        "Restoration is used for far more than disasters."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Restoration is used for far more than disasters. Typical targets:”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “_____ is the process of rebuilding a database from backup media.”",
      "options": [
        "back",
        "Same database, same server",
        "Restoration"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Restoration is the process of rebuilding a database from backup media. It is operator-initiated: someone runs a RESTORE command, SQL Server reads one or more backup files, and a usable database appears at a moment and a location of your choosing.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Restore, recovery, restart, failover”?",
      "options": [
        "Every restore, from a 2 GB sandbox to a 4 TB warehouse, moves through the same three phases:",
        "The vocabulary is used loosely in conversation, but in an incident the precision matters — these are four different things:",
        "Restoration is used for far more than disasters."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The vocabulary is used loosely in conversation, but in an incident the precision matters — these are four different things:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The three phases of a restore”?",
      "options": [
        "Every restore, from a 2 GB sandbox to a 4 TB warehouse, moves through the same three phases:",
        "The vocabulary is used loosely in conversation, but in an incident the precision matters — these are four different things:",
        "Notice that a restore ends with recovery: the same roll-forward / roll-back machinery SQL Server uses after a power cut is what finishes a RESTORE."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Every restore, from a 2 GB sandbox to a 4 TB warehouse, moves through the same three phases:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Inspecting the media before you restore”?",
      "options": [
        "Notice that a restore ends with recovery: the same roll-forward / roll-back machinery SQL Server uses after a power cut is what finishes a RESTORE.",
        "A DBA running RESTORE",
        "Three read-only commands tell you what you are about to restore without touching a single production page."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Three read-only commands tell you what you are about to restore without touching a single production page. Run them first, every time:”"
    },
    {
      "question": "Which fact is covered in the lesson section “What a successful restore requires”?",
      "options": [
        "The final step of a restore ( WITH RECOVERY ), or automatically on service restart",
        "Restores fail for boring, predictable reasons.",
        "A DBA running RESTORE"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Restores fail for boring, predictable reasons. Before starting, confirm:”"
    },
    {
      "question": "Complete the lesson statement: “A backup copies pages _____ in time onto media; a restore reads those pages back and lands them in data and log files.”",
      "options": [
        "forward",
        "Restore",
        "Recovery"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “It is the exact inverse of a backup. A backup copies pages forward in time onto media; a restore reads those pages back and lands them in data and log files. But a restore is far more than a file copy — SQL Server validates the media, writes pages into the target files, replays the transaction log in LSN order, and finally rolls back anything unfinished so the result is transactionally consistent.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Restore, recovery, restart, failover”?",
      "options": [
        "Restores fail for boring, predictable reasons.",
        "after",
        "Notice that a restore ends with recovery: the same roll-forward / roll-back machinery SQL Server uses after a power cut is what finishes a RESTORE."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Notice that a restore ends with recovery: the same roll-forward / roll-back machinery SQL Server uses after a power cut is what finishes a RESTORE. Understanding that shared machinery is what makes the options in the rest of this chapter ( NORECOVERY, RECOVERY, STANDBY, STOPAT ) make sense instead of looking like arbitrary keywords.”"
    },
    {
      "question": "Complete the lesson statement: “_____ returns one row per backup in the file: BackupType (1 = database, 2 = log, 5 = differential), BackupStartDate, FirstLSN / LastLSN, and the database name.”",
      "options": [
        "Crash recovery",
        "HEADERONLY",
        "Recovery"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “HEADERONLY returns one row per backup in the file: BackupType (1 = database, 2 = log, 5 = differential), BackupStartDate, FirstLSN / LastLSN, and the database name. FILELISTONLY returns the logical names, physical paths, type (D = data, L = log), and sizes of every file in the set — everything you need to prepare WITH MOVE and to check free space.”"
    },
    {
      "question": "Complete the lesson statement: “Equally important is what happens _____ the command succeeds: DBCC CHECKDB, row-count spot checks, login and job verification, and a recorded restore duration.”",
      "options": [
        "after",
        "Crash recovery",
        "Failover"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Equally important is what happens after the command succeeds: DBCC CHECKDB, row-count spot checks, login and job verification, and a recorded restore duration. A restore that has never been timed, space-checked, and rehearsed is still an assumption — the RTO in your DR plan is a guess until someone has run it end to end.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Defining restoration”?",
      "options": [
        "Restores fail for boring, predictable reasons.",
        "after",
        "Restoration is used for far more than disasters."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Restoration is used for far more than disasters. Typical targets:”"
    }
  ],
  takeaways: [
    "Restoration rebuilds a database from backup media — backup copies forward, restore reads back",
    "Every restore runs three phases: copy, roll forward (redo), roll back (undo)",
    "Roll back only happens with RECOVERY; NORECOVERY stops the restore before it",
    "HEADERONLY, FILELISTONLY, and VERIFYONLY inspect media safely before you commit",
    "A backup is evidence, not proof — only a timed restore test proves the strategy works"
  ]
};
