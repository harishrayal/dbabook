/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch08-02.html */

window.TOPIC = {
  id: "ch08-02",
  title: "Backup Versus Restore",

  lead: "Backups and restores are two halves of one promise: a backup copies data forward in time, a restore brings it back — and only the restore decides whether the promise was worth anything.",

  objectives: [
    "Contrast the purpose, effort, and failure modes of backup and restore",
    "Map business targets — RPO and RTO — onto each side of the pair",
    "Recognise why backups succeed while restores fail",
    "Design backup and restore practice as one symmetric process"
  ],

  sections: [
    {
      h: "Two operations, one promise",
      html: `
<p>A <strong>backup</strong> reads a live database and writes its pages plus log records to media — a file, tape, or cloud blob. A <strong>restore</strong> does the opposite: it reads that media and rebuilds a database from it. One creates the evidence; the other spends it.</p>
<table>
  <tr><th>Dimension</th><th>Backup</th><th>Restore</th></tr>
  <tr><td>Direction</td><td>Production database → media</td><td>Media → target database</td></tr>
  <tr><td>Who triggers it</td><td>Scheduler, automatically, unattended</td><td>A DBA, usually under pressure</td></tr>
  <tr><td>When failure is visible</td><td>Immediately, in a job history</td><td>Only when you attempt it — often during an incident</td></tr>
  <tr><td>Cost driver</td><td>Backup window, network, media</td><td>Restore duration, disk, DBA attention</td></tr>
  <tr><td>Business target</td><td>Defines <strong>RPO</strong> — how much data can be lost</td><td>Defines <strong>RTO</strong> — how long the service is down</td></tr>
  <tr><td>Success criteria</td><td>Job reports success, checksums valid</td><td>Database online, CHECKDB clean, users working</td></tr>
</table>
<p>The asymmetry in the table is the whole lesson: <strong>backups are routine and verified daily; restores are rare and verified almost never.</strong> An organisation can run thousands of successful backups and still have no working recovery.</p>
`
    },
    {
      h: "The recovery promise chain",
      html: `
<p>Between the backup job and the recovered service sits a chain of events, each with its own duration. RPO lives on the left (how far back the media lets you go), RTO lives on the right (how long the whole trip takes).</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Backup and restore promise chain">
    <defs>
      <marker id="pair-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
      <marker id="pair-arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"/>
      </marker>
      <marker id="pair-arrow-back" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M 10 0 L 0 5 L 10 10 z" fill="var(--accent-strong)"/>
      </marker>
    </defs>

    <text x="380" y="26" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Forward: data is copied · Backward: data is rebuilt</text>

    <rect x="20" y="55" width="160" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="100" y="83" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Production DB</text>
    <text x="100" y="105" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">the data at risk</text>

    <rect x="235" y="55" width="160" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="315" y="83" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Backup job</text>
    <text x="315" y="105" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">full · diff · log</text>

    <rect x="450" y="55" width="160" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="530" y="83" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Backup media</text>
    <text x="530" y="105" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">disk · tape · cloud</text>

    <rect x="580" y="55" width="160" height="70" rx="10" fill="var(--accent)" />
    <text x="660" y="83" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Restore</text>
    <text x="660" y="105" text-anchor="middle" fill="#dbeafe" font-size="11.5" font-family="Segoe UI, sans-serif">DBA-driven, timed</text>

    <line x1="180" y1="90" x2="233" y2="90" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#pair-arrow)"/>
    <line x1="395" y1="90" x2="448" y2="90" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#pair-arrow)"/>
    <line x1="610" y1="125" x2="560" y2="165" stroke="var(--accent)" stroke-width="1.8" marker-end="url(#pair-arrow-accent)"/>

    <rect x="300" y="170" width="440" height="70" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="520" y="198" text-anchor="middle" fill="var(--accent-strong)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Recovered database — online, consistent, verified</text>
    <text x="520" y="222" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">DBCC CHECKDB clean · row counts checked · users reconnected</text>

    <path d="M 20 275 L 180 275" stroke="var(--amber)" stroke-width="2" fill="none"/>
    <path d="M 20 269 L 20 281 M 180 269 L 180 281" stroke="var(--amber)" stroke-width="2"/>
    <text x="100" y="300" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">RPO — data at risk</text>
    <text x="100" y="319" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">set by backup frequency</text>

    <path d="M 250 275 L 740 275" stroke="var(--accent)" stroke-width="2" fill="none"/>
    <path d="M 250 269 L 250 281 M 740 269 L 740 281" stroke="var(--accent)" stroke-width="2"/>
    <text x="495" y="300" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">RTO — time to recover</text>
    <text x="495" y="319" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">set by restore speed, not backup speed</text>
  </svg>
  <div class="figcaption">Figure 1 — Backups bound the RPO; only restores bound the RTO.</div>
</div>
`
    },
    {
      h: "Why backups succeed and restores fail",
      html: `
<p>Backups run as a scheduled job on a healthy server with full permissions; restores run by hand, often on a different machine, months after anyone looked at them. The gap produces a familiar failure list:</p>
<ul>
  <li><strong>Untested media</strong> — files copied to a target that was never read back</li>
  <li><strong>Broken chains</strong> — log backups purged or a retention gap, so the sequence stops early</li>
  <li><strong>Environment drift</strong> — the DR server has different drive letters, folder paths, or free space</li>
  <li><strong>Path and name mismatches</strong> — target paths do not exist and no <code>WITH MOVE</code> was prepared</li>
  <li><strong>Hidden dependencies</strong> — certificates, logins, jobs, and replication not accounted for</li>
  <li><strong>Corruption discovered at restore</strong> — the backup succeeded, but the source pages were already damaged</li>
</ul>
<p>The cure is symmetry: treat restore as a scheduled workload with its own runbook, its own test window, and its own evidence — not as the emergency appendix to the backup job.</p>
`
    },
    {
      h: "The same data, written both ways",
      html: `
<p>Here is one data set expressed as the pair. Notice that the restore carries the extra clauses the backup never needs: target file layout, recovery state, and overwrite rules.</p>
<pre><code class="language-sql">-- BACKUP side: capture a full image with checksums
BACKUP DATABASE [ERP]
TO  DISK = N'E:\\SQLBackup\\ERP_FULL_2026-11-17.bak'
WITH CHECKSUM, COMPRESSION, STATS = 10;
GO

-- RESTORE side: rebuild the same database somewhere else
RESTORE DATABASE [ERP_DR]
FROM DISK = N'E:\\SQLBackup\\ERP_FULL_2026-11-17.bak'
WITH MOVE N'ERP'      TO N'D:\\Data\\ERP_DR.mdf',
     MOVE N'ERP_log'  TO N'D:\\Data\\ERP_DR_log.ldf',
     RECOVERY, STATS = 10;
GO

-- Evidence that the pair worked
RESTORE VERIFYONLY FROM DISK = N'E:\\SQLBackup\\ERP_FULL_2026-11-17.bak' WITH CHECKSUMS;
USE [ERP_DR];
DBCC CHECKDB (N'ERP_DR') WITH NO_INFOMSGS;</code></pre>
<p>The backup command is one line of intent. The restore command encodes everything that can go wrong — file placement, naming, and the recovery decision — which is why restore deserves as much automation and rehearsal as the backup itself.</p>
`
    },
    {
      h: "Running them as one process",
      html: `
<p>Mature teams stop treating backup and restore as separate concerns and join them into a single pipeline:</p>
<ul>
  <li><strong>Back up with <code>CHECKSUM</code></strong> so corruption is detected at write time, and verify on read</li>
  <li><strong>Keep retention long enough to restore</strong> — full + differential + logs covering the agreed recovery window</li>
  <li><strong>Automate a restore test</strong> — nightly or weekly into a scratch instance, alerting on failure</li>
  <li><strong>Measure and publish</strong> — actual restore minutes feed the RTO; actual log intervals feed the RPO</li>
  <li><strong>Rehearse the whole incident</strong> — who decides, where the media lives, how users are told</li>
</ul>
<p>When both sides are measured together, the uncomfortable questions surface early: if a restore takes six hours but the business accepts thirty minutes of downtime, the fix is on the restore side — faster storage, parallel restores, or a standby — not more backups.</p>
`
    }
  ],

  scenario: {
    title: "900 successful backups, zero successful restores",
    html: `
<p>A logistics company's monitoring showed 900 consecutive successful backup runs. When a developer ran <code>TRUNCATE TABLE</code> against the shipping tables at 16:40 on a Friday, the DBA began the first restore anyone could remember. It failed three times: the log backup covering 16:30–16:45 had already been overwritten by the nightly retention job, the DR server's <code>E:\SQLBackup</code> folder did not exist, and the restored files would not have fitted on the target volume.</p>
<p>Resolution under time pressure: restored the full plus latest differential to the primary server under a different name with <code>WITH MOVE</code>, applied log backups up to 16:39, and scripted the missing 16:30–16:40 rows back by hand from the application's audit table. Root cause: retention and paths were designed for <em>backing up</em>, never validated for <em>restoring</em>. Prevention: retention sized to the recovery window, a weekly automated restore test with path and free-space checks, and an RTO measured from the incident log rather than estimated.</p>
`
  },

  interview: [
    {
      q: "Which side of backup/restore does RPO belong to, and which does RTO belong to?",
      a: "RPO — how much data you can lose — is bounded by the backup strategy: the last full, differential, and log backups, especially log frequency. RTO — how long the service is down — is bounded by the restore: media read speed, disk throughput, chain length, and how rehearsed the procedure is. Fast backups do not shrink an RTO."
    },
    {
      q: "Your backups pass nightly but you suspect recovery is weak. What is the first thing you do?",
      a: "Schedule and run a real restore of the most critical database into an isolated instance, with the real procedure and the real runbook. It will immediately expose chain retention, path, space, and permission problems that VERIFYONLY cannot see — and it produces the first honest RTO number."
    },
    {
      q: "What belongs in a restore runbook but not in a backup job?",
      a: "Target instance and file layout, WITH MOVE mapping, pre-checks for free space and chain completeness, the NORECOVERY/RECOVERY sequence, post-restore validation (CHECKDB, row counts, logins, jobs), who approves, and how users are notified. The backup job needs none of that; the restore under pressure needs all of it."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ reads a live database and writes its pages plus log records to media — a file, tape, or cloud blob.”",
      "options": [
        "backups are routine and verified daily; restores are rare and verified almost never.",
        "backup",
        "RTO"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A backup reads a live database and writes its pages plus log records to media — a file, tape, or cloud blob. A restore does the opposite: it reads that media and rebuilds a database from it. One creates the evidence; the other spends it.”"
    },
    {
      "question": "Which fact is covered in the lesson section “The recovery promise chain”?",
      "options": [
        "Between the backup job and the recovered service sits a chain of events, each with its own duration.",
        "A DBA, usually under pressure",
        "Only when you attempt it — often during an incident"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Between the backup job and the recovered service sits a chain of events, each with its own duration. RPO lives on the left (how far back the media lets you go), RTO lives on the right (how long the whole trip takes).”"
    },
    {
      "question": "Which fact is covered in the lesson section “Why backups succeed and restores fail”?",
      "options": [
        "Only when you attempt it — often during an incident",
        "Restore duration, disk, DBA attention",
        "Backups run as a scheduled job on a healthy server with full permissions; restores run by hand, often on a different machine, months after anyone looked at them."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Backups run as a scheduled job on a healthy server with full permissions; restores run by hand, often on a different machine, months after anyone looked at them. The gap produces a familiar failure list:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The same data, written both ways”?",
      "options": [
        "Defines RTO — how long the service is down",
        "Here is one data set expressed as the pair.",
        "Restore duration, disk, DBA attention"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Here is one data set expressed as the pair. Notice that the restore carries the extra clauses the backup never needs: target file layout, recovery state, and overwrite rules.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Running them as one process”?",
      "options": [
        "Mature teams stop treating backup and restore as separate concerns and join them into a single pipeline:",
        "Defines RTO — how long the service is down",
        "Database online, CHECKDB clean, users working"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Mature teams stop treating backup and restore as separate concerns and join them into a single pipeline:”"
    },
    {
      "question": "Complete the lesson statement: “The asymmetry in the table is the whole lesson: _____”",
      "options": [
        "Path and name mismatches",
        "Hidden dependencies",
        "backups are routine and verified daily; restores are rare and verified almost never."
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The asymmetry in the table is the whole lesson: backups are routine and verified daily; restores are rare and verified almost never. An organisation can run thousands of successful backups and still have no working recovery.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Why backups succeed and restores fail”?",
      "options": [
        "Here is one data set expressed as the pair.",
        "The cure is symmetry: treat restore as a scheduled workload with its own runbook, its own test window, and its own evidence — not as the emergency appendix to the backup job.",
        "Between the backup job and the recovered service sits a chain of events, each with its own duration."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The cure is symmetry: treat restore as a scheduled workload with its own runbook, its own test window, and its own evidence — not as the emergency appendix to the backup job.”"
    },
    {
      "question": "Which fact is covered in the lesson section “The same data, written both ways”?",
      "options": [
        "The backup command is one line of intent.",
        "Backups run as a scheduled job on a healthy server with full permissions; restores run by hand, often on a different machine, months after anyone looked at them.",
        "The cure is symmetry: treat restore as a scheduled workload with its own runbook, its own test window, and its own evidence — not as the emergency appendix to the backup job."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The backup command is one line of intent. The restore command encodes everything that can go wrong — file placement, naming, and the recovery decision — which is why restore deserves as much automation and rehearsal as the backup itself.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Running them as one process”?",
      "options": [
        "The cure is symmetry: treat restore as a scheduled workload with its own runbook, its own test window, and its own evidence — not as the emergency appendix to the backup job.",
        "Here is one data set expressed as the pair.",
        "When both sides are measured together, the uncomfortable questions surface early: if a restore takes six hours but the business accepts thirty minutes of downtime, the fix is on…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “When both sides are measured together, the uncomfortable questions surface early: if a restore takes six hours but the business accepts thirty minutes of downtime, the fix is on the restore side — faster storage, parallel restores, or a standby — not more backups.”"
    },
    {
      "question": "In the “Two operations, one promise” table, what is listed for “Direction” under “Restore”?",
      "options": [
        "Mature teams stop treating backup and restore as separate concerns and join them into a single pipeline:",
        "Media → target database",
        "The backup command is one line of intent."
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Direction” as “Media → target database”."
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ reads a live database and writes its pages plus log records to media — a file, tape, or cloud blob.”",
      "options": [
        "backups are routine and verified daily; restores are rare and verified almost never.",
        "backup",
        "RTO"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A backup reads a live database and writes its pages plus log records to media — a file, tape, or cloud blob. A restore does the opposite: it reads that media and rebuilds a database from it. One creates the evidence; the other spends it.”"
    },
    {
      "question": "Which fact is covered in the lesson section “The recovery promise chain”?",
      "options": [
        "Between the backup job and the recovered service sits a chain of events, each with its own duration.",
        "A DBA, usually under pressure",
        "Only when you attempt it — often during an incident"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Between the backup job and the recovered service sits a chain of events, each with its own duration. RPO lives on the left (how far back the media lets you go), RTO lives on the right (how long the whole trip takes).”"
    },
    {
      "question": "Which fact is covered in the lesson section “Why backups succeed and restores fail”?",
      "options": [
        "Only when you attempt it — often during an incident",
        "Restore duration, disk, DBA attention",
        "Backups run as a scheduled job on a healthy server with full permissions; restores run by hand, often on a different machine, months after anyone looked at them."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Backups run as a scheduled job on a healthy server with full permissions; restores run by hand, often on a different machine, months after anyone looked at them. The gap produces a familiar failure list:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The same data, written both ways”?",
      "options": [
        "Defines RTO — how long the service is down",
        "Here is one data set expressed as the pair.",
        "Restore duration, disk, DBA attention"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Here is one data set expressed as the pair. Notice that the restore carries the extra clauses the backup never needs: target file layout, recovery state, and overwrite rules.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Running them as one process”?",
      "options": [
        "Mature teams stop treating backup and restore as separate concerns and join them into a single pipeline:",
        "Defines RTO — how long the service is down",
        "Database online, CHECKDB clean, users working"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Mature teams stop treating backup and restore as separate concerns and join them into a single pipeline:”"
    },
    {
      "question": "Complete the lesson statement: “The asymmetry in the table is the whole lesson: _____”",
      "options": [
        "Path and name mismatches",
        "Hidden dependencies",
        "backups are routine and verified daily; restores are rare and verified almost never."
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The asymmetry in the table is the whole lesson: backups are routine and verified daily; restores are rare and verified almost never. An organisation can run thousands of successful backups and still have no working recovery.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Why backups succeed and restores fail”?",
      "options": [
        "Here is one data set expressed as the pair.",
        "The cure is symmetry: treat restore as a scheduled workload with its own runbook, its own test window, and its own evidence — not as the emergency appendix to the backup job.",
        "Between the backup job and the recovered service sits a chain of events, each with its own duration."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The cure is symmetry: treat restore as a scheduled workload with its own runbook, its own test window, and its own evidence — not as the emergency appendix to the backup job.”"
    },
    {
      "question": "Which fact is covered in the lesson section “The same data, written both ways”?",
      "options": [
        "The backup command is one line of intent.",
        "Backups run as a scheduled job on a healthy server with full permissions; restores run by hand, often on a different machine, months after anyone looked at them.",
        "The cure is symmetry: treat restore as a scheduled workload with its own runbook, its own test window, and its own evidence — not as the emergency appendix to the backup job."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The backup command is one line of intent. The restore command encodes everything that can go wrong — file placement, naming, and the recovery decision — which is why restore deserves as much automation and rehearsal as the backup itself.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Running them as one process”?",
      "options": [
        "The cure is symmetry: treat restore as a scheduled workload with its own runbook, its own test window, and its own evidence — not as the emergency appendix to the backup job.",
        "Here is one data set expressed as the pair.",
        "When both sides are measured together, the uncomfortable questions surface early: if a restore takes six hours but the business accepts thirty minutes of downtime, the fix is on…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “When both sides are measured together, the uncomfortable questions surface early: if a restore takes six hours but the business accepts thirty minutes of downtime, the fix is on the restore side — faster storage, parallel restores, or a standby — not more backups.”"
    },
    {
      "question": "In the “Two operations, one promise” table, what is listed for “Direction” under “Restore”?",
      "options": [
        "Mature teams stop treating backup and restore as separate concerns and join them into a single pipeline:",
        "Media → target database",
        "The backup command is one line of intent."
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Direction” as “Media → target database”."
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ reads a live database and writes its pages plus log records to media — a file, tape, or cloud blob.”",
      "options": [
        "backups are routine and verified daily; restores are rare and verified almost never.",
        "backup",
        "RTO"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A backup reads a live database and writes its pages plus log records to media — a file, tape, or cloud blob. A restore does the opposite: it reads that media and rebuilds a database from it. One creates the evidence; the other spends it.”"
    },
    {
      "question": "Which fact is covered in the lesson section “The recovery promise chain”?",
      "options": [
        "Between the backup job and the recovered service sits a chain of events, each with its own duration.",
        "A DBA, usually under pressure",
        "Only when you attempt it — often during an incident"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Between the backup job and the recovered service sits a chain of events, each with its own duration. RPO lives on the left (how far back the media lets you go), RTO lives on the right (how long the whole trip takes).”"
    },
    {
      "question": "Which fact is covered in the lesson section “Why backups succeed and restores fail”?",
      "options": [
        "Only when you attempt it — often during an incident",
        "Restore duration, disk, DBA attention",
        "Backups run as a scheduled job on a healthy server with full permissions; restores run by hand, often on a different machine, months after anyone looked at them."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Backups run as a scheduled job on a healthy server with full permissions; restores run by hand, often on a different machine, months after anyone looked at them. The gap produces a familiar failure list:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The same data, written both ways”?",
      "options": [
        "Defines RTO — how long the service is down",
        "Here is one data set expressed as the pair.",
        "Restore duration, disk, DBA attention"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Here is one data set expressed as the pair. Notice that the restore carries the extra clauses the backup never needs: target file layout, recovery state, and overwrite rules.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Running them as one process”?",
      "options": [
        "Mature teams stop treating backup and restore as separate concerns and join them into a single pipeline:",
        "Defines RTO — how long the service is down",
        "Database online, CHECKDB clean, users working"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Mature teams stop treating backup and restore as separate concerns and join them into a single pipeline:”"
    },
    {
      "question": "Complete the lesson statement: “The asymmetry in the table is the whole lesson: _____”",
      "options": [
        "Path and name mismatches",
        "Hidden dependencies",
        "backups are routine and verified daily; restores are rare and verified almost never."
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The asymmetry in the table is the whole lesson: backups are routine and verified daily; restores are rare and verified almost never. An organisation can run thousands of successful backups and still have no working recovery.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Why backups succeed and restores fail”?",
      "options": [
        "Here is one data set expressed as the pair.",
        "The cure is symmetry: treat restore as a scheduled workload with its own runbook, its own test window, and its own evidence — not as the emergency appendix to the backup job.",
        "Between the backup job and the recovered service sits a chain of events, each with its own duration."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The cure is symmetry: treat restore as a scheduled workload with its own runbook, its own test window, and its own evidence — not as the emergency appendix to the backup job.”"
    },
    {
      "question": "Which fact is covered in the lesson section “The same data, written both ways”?",
      "options": [
        "The backup command is one line of intent.",
        "Backups run as a scheduled job on a healthy server with full permissions; restores run by hand, often on a different machine, months after anyone looked at them.",
        "The cure is symmetry: treat restore as a scheduled workload with its own runbook, its own test window, and its own evidence — not as the emergency appendix to the backup job."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The backup command is one line of intent. The restore command encodes everything that can go wrong — file placement, naming, and the recovery decision — which is why restore deserves as much automation and rehearsal as the backup itself.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Running them as one process”?",
      "options": [
        "The cure is symmetry: treat restore as a scheduled workload with its own runbook, its own test window, and its own evidence — not as the emergency appendix to the backup job.",
        "Here is one data set expressed as the pair.",
        "When both sides are measured together, the uncomfortable questions surface early: if a restore takes six hours but the business accepts thirty minutes of downtime, the fix is on…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “When both sides are measured together, the uncomfortable questions surface early: if a restore takes six hours but the business accepts thirty minutes of downtime, the fix is on the restore side — faster storage, parallel restores, or a standby — not more backups.”"
    },
    {
      "question": "In the “Two operations, one promise” table, what is listed for “Direction” under “Restore”?",
      "options": [
        "Mature teams stop treating backup and restore as separate concerns and join them into a single pipeline:",
        "Media → target database",
        "The backup command is one line of intent."
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Direction” as “Media → target database”."
    }
  ],
  takeaways: [
    "Backup copies data forward to media; restore reads media back into a usable database",
    "Backups are automatic and verified daily — restores are manual, rare, and usually unverified",
    "RPO is set by backup frequency; RTO is set by restore speed and rehearsal",
    "Restores fail for environmental reasons: retention gaps, missing paths, insufficient space",
    "Treat backup and restore as one pipeline, with an automated restore test as its proof"
  ]
};
