/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch07-03.html */

window.TOPIC = {
  id: "ch07-03",
  title: "Full Database Backup",

  lead: "A full backup is the anchor of every recovery strategy — the one backup you can always take, must take first, and must be able to restore under pressure at 3 AM.",

  objectives: [
    "Describe exactly what a full backup contains",
    "Interpret the BACKUP DATABASE options used in production",
    "Size and schedule a full backup that fits the backup window",
    "Understand a full backup as the differential and restore anchor",
    "Verify that a full backup is genuinely restorable"
  ],

  sections: [
    {
      h: "What a full backup contains",
      html: `
<p>A <strong>full backup</strong> is a transactionally consistent copy of the entire database, captured as of the moment the backup starts. It reads every allocated page in the database — rows, index pages, allocation pages, free-space metadata — plus enough of the transaction log to make the copy consistent when it is restored.</p>
<ul>
  <li><strong>All allocated pages</strong> — used pages across every data file of the database, including internal tables and index pages</li>
  <li><strong>Schema and metadata</strong> — enough catalog information to rebuild objects, statistics, and permissions state</li>
  <li><strong>Log for consistency</strong> — log records covering transactions that were uncommitted when the backup began, so restore can roll them back</li>
  <li><strong>Backup header and LSNs</strong> — first/last LSN values, family and base GUIDs that later differentials and log backups are matched against</li>
</ul>
<p>Pages modified <em>while the backup runs</em> are tracked via the differential bitmap: the backup captures the state as of its start, not as of its finish. That is why a full backup taken during business hours still restores cleanly.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Contents of a full backup set">
    <defs>
      <marker id="fb-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <text x="380" y="30" text-anchor="middle" fill="var(--text)" font-size="15.5" font-weight="700" font-family="Segoe UI, sans-serif">What BACKUP DATABASE actually reads</text>

    <rect x="30" y="70" width="200" height="210" rx="12" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="130" y="100" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">Database at 02:00</text>
    <g fill="var(--surface)" stroke="var(--border)">
      <rect x="50" y="118" width="160" height="34" rx="6"/>
      <rect x="50" y="160" width="160" height="34" rx="6"/>
      <rect x="50" y="202" width="160" height="34" rx="6"/>
      <rect x="50" y="244" width="160" height="26" rx="6"/>
    </g>
    <text x="130" y="140" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">MDF / NDF data files</text>
    <text x="130" y="182" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">Rows + index pages</text>
    <text x="130" y="224" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">Allocation &amp; system pages</text>
    <text x="130" y="261" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">Transaction log head</text>

    <line x1="240" y1="175" x2="305" y2="175" stroke="var(--muted)" stroke-width="2" marker-end="url(#fb-arrow)"/>

    <rect x="315" y="70" width="240" height="210" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="435" y="100" text-anchor="middle" fill="var(--accent-strong)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">One .bak file (backup set)</text>
    <g fill="var(--surface)" stroke="var(--border)">
      <rect x="335" y="116" width="200" height="34" rx="6"/>
      <rect x="335" y="158" width="200" height="34" rx="6"/>
      <rect x="335" y="200" width="200" height="34" rx="6"/>
      <rect x="335" y="242" width="200" height="26" rx="6"/>
    </g>
    <text x="435" y="138" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">All allocated pages</text>
    <text x="435" y="180" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">Log to roll back uncommitted work</text>
    <text x="435" y="222" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">Header · LSNs · base GUID</text>
    <text x="435" y="259" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">Optional page checksums</text>

    <line x1="565" y1="175" x2="620" y2="175" stroke="var(--muted)" stroke-width="2" marker-end="url(#fb-arrow)"/>

    <rect x="630" y="110" width="110" height="130" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="685" y="140" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">RESTORE</text>
    <text x="685" y="165" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">write pages</text>
    <text x="685" y="185" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">roll back</text>
    <text x="685" y="205" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">replay logs</text>
    <text x="685" y="225" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">recover</text>

    <rect x="315" y="296" width="425" height="30" rx="8" fill="var(--amber)" opacity="0.22" stroke="var(--amber)"/>
    <text x="527" y="316" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">The full backup also becomes the base every future differential is measured from</text>
  </svg>
  <div class="figcaption">Figure 1 — A full backup reads the whole database plus the log needed for consistency, in one shot.</div>
</div>
`
    },
    {
      h: "Anatomy of the BACKUP DATABASE statement",
      html: `
<p>Production full backups should be explicit about media handling, integrity, and naming — defaults will eventually surprise you.</p>
<table>
  <tr><th>Clause</th><th>Purpose</th></tr>
  <tr><td><code>INIT / FORMAT</code></td><td><code>INIT</code> overwrites the first media family; <code>FORMAT</code> reinitialises the media. Without them, backups <em>append</em> to an existing file forever</td></tr>
  <tr><td><code>COMPRESSION</code></td><td>Compresses the backup set (also CPU cost — see the backup compression topic)</td></tr>
  <tr><td><code>CHECKSUM</code></td><td>Computes a checksum per page during the backup and stores it in the set</td></tr>
  <tr><td><code>NAME / DESCRIPTION</code></td><td>Human-readable label stored in msdb — invaluable when hunting sets during an incident</td></tr>
  <tr><td><code>STATS = n</code></td><td>Progress messages every n percent so long runs are observable in the job history</td></tr>
  <tr><td><code>TO DISK / URL / TAPE</code></td><td>Destination media: local/UNC path, Azure Blob URL, or tape</td></tr>
  <tr><td><code>FILE = n</code></td><td>Selects a specific backup set inside a media family that holds several</td></tr>
</table>
<pre><code class="language-sql">-- Standard production full backup
BACKUP DATABASE [Orders]
TO   DISK = N'E:\\Backups\\Orders\\Orders_FULL_20261115.bak'
WITH  INIT, COMPRESSION, CHECKSUM, STATS = 5,
      NAME = N'Orders-Full-20261115-0200',
      DESCRIPTION = N'Weekly full — differential base';

-- Striping across three files for a large database (parallel I/O)
BACKUP DATABASE [Orders]
TO   DISK = N'E:\\Backups\\Orders\\Orders_FULL_1.bak',
     DISK = N'E:\\Backups\\Orders\\Orders_FULL_2.bak',
     DISK = N'E:\\Backups\\Orders\\Orders_FULL_3.bak'
WITH  INIT, COMPRESSION, CHECKSUM, STATS = 10;

-- Off-host copy to cloud object storage
BACKUP DATABASE [Orders]
TO   URL = N'https://contosobackups.blob.core.windows.net/sql/Orders_FULL_20261115.bak'
WITH  INIT, COMPRESSION, CHECKSUM, STATS = 10,
      CREDENTIAL = N'AzureBackupCredential';</code></pre>
`
    },
    {
      h: "Scheduling the full backup",
      html: `
<p>The full backup defines the upper bound of restore effort: everything after it (differentials and logs) only shortens the replay. Scheduling decisions:</p>
<ul>
  <li><strong>Cadence</strong> — weekly for most OLTP databases with differentials; nightly for small ones; monthly only when differentials are proven and monitored</li>
  <li><strong>Window</strong> — run it when I/O headroom exists, but remember: a backup that misses its window still must finish before the next one starts</li>
  <li><strong>Duration trend</strong> — the run time should track data growth; a doubling duration means data growth, a full-volume scan, or storage degradation</li>
  <li><strong>Cadence rule</strong> — take a new full when the differential exceeds roughly half the full's size, because the restore advantage has evaporated</li>
</ul>
<p>History is already in msdb — use it to size the window instead of guessing:</p>
<pre><code class="language-sql">-- Full backup durations and compression ratio, most recent first
SELECT TOP 25
       b.database_name,
       b.backup_start_date,
       datediff(minute, b.backup_start_date, b.backup_finish_date) AS minutes,
       cast(b.backup_size / 1024.0 / 1024 / 1024 AS decimal(12,2)) AS size_gb,
       cast(b.compressed_backup_size / 1024.0 / 1024 / 1024 AS decimal(12,2)) AS stored_gb,
       cast(b.backup_size / nullif(b.compressed_backup_size, 0) AS decimal(6,2)) AS ratio
FROM   msdb.dbo.backupset AS b
WHERE  b.type = 'D'
  AND  b.database_name = N'Orders'
ORDER  BY b.backup_finish_date DESC;</code></pre>
`
    },
    {
      h: "Restoring the full backup",
      html: `
<p>The full backup is almost never restored alone — it is the first step of a sequence. Restoring with <code>NORECOVERY</code> leaves the database ready for differentials and logs; <code>RECOVERY</code> (the default) brings it online and ends the sequence.</p>
<pre><code class="language-sql">-- Step 1 of a typical restore: the full backup, database left offline to further restores
RESTORE DATABASE [Orders]
FROM   DISK = N'E:\\Backups\\Orders\\Orders_FULL_20261115.bak'
WITH   NORECOVERY, STATS = 10;

-- Step 2: latest differential, then logs (see the following topics)
RESTORE DATABASE [Orders]
FROM   DISK = N'E:\\Backups\\Orders\\Orders_DIFF_20261116.bak'
WITH   NORECOVERY, STATS = 10;

RESTORE LOG [Orders]
FROM   DISK = N'E:\\Backups\\Orders\\Orders_LOG_20261116_1015.trn'
WITH   RECOVERY;</code></pre>
<p>Before any of this is attempted in an incident, the set must be readable: <code>RESTORE VERIFYONLY FROM DISK = … WITH CHECKSUM</code> on every full backup, and a full restore into an isolated instance at least monthly. A full backup that has never been read end-to-end by a restore is a file, not a backup.</p>
`
    },
    {
      h: "When to skip a full backup",
      html: `
<p>There are exactly two situations where you should not take a plain full backup:</p>
<ul>
  <li><strong>Ad-hoc copies</strong> — use <code>WITH COPY_ONLY</code> so the regular differential base and log chain are untouched (covered in a later topic)</li>
  <li><strong>Enormous, mostly static databases</strong> — a full rewrite may be pointless when filegroup, file, or partial backups can capture the changing 10% only</li>
</ul>
<p>Note what a full backup does <em>not</em> do: in FULL recovery it does not break the transaction log chain — log backups continue across it. It does, however, reset the differential base, which is exactly why an unplanned full backup in the middle of a week deserves a <code>COPY_ONLY</code> clause.</p>
`
    }
  ],

  scenario: {
    title: "The backup drive that filled at 2 AM — because INIT was never used",
    html: `
<p>The nightly job wrote the full backup to <code>E:\\Backups\\Orders_FULL.bak</code> with no <code>INIT</code> clause. Each run appended a new backup set to the same media file, which is the documented default behaviour. Retention cleanup keyed on a file name pattern that never changed, so nothing was ever aged out. The file grew for 14 months: 180 GB, 400 GB, 900 GB, until at 02:14 the volume hit 100% and the backup failed with "There is not enough space on the disk".</p>
<p>The failure was invisible for two days because the job had retry logic that posted to a monitoring channel nobody read. On day three the production LUN developed real I/O errors; the DBA reached for the backup file and found the last <em>successful</em> set was 40 hours old — and the file itself was in an inconsistent state from the aborted append.</p>
<p>Resolution: <code>RESTORE VERIFYONLY</code> identified the last good set, restore ran from it plus log backups with an RPO of 15 minutes, and service returned within the RTO. Root cause was fixed in the job: <code>WITH INIT, COMPRESSION, CHECKSUM</code>, timestamped file names, and retention by <code>backup_finish_date</code> from msdb rather than by file pattern.</p>
<p>Prevention: free-space alerting on every backup volume, job-failure notifications routed to the on-call channel, and a weekly verification restore. <strong>The backup had been "working" the whole time — only the verification story was broken.</strong></p>
`
  },

  interview: [
    {
      q: "What does a full database backup contain?",
      a: "All allocated pages of the database (data, index, and allocation pages) across every file, plus the transaction log records required to roll back uncommitted transactions so the restore is transactionally consistent as of the backup's start, plus the header information — LSNs, family GUIDs, and base GUID — that differentials and log backups are matched against during restore."
    },
    {
      q: "Does taking a full backup break the transaction log chain?",
      a: "No. In FULL recovery, log backups continue across a full backup without a gap. What a full backup does reset is the differential base — so an ad-hoc full taken outside the schedule should use COPY_ONLY to leave that base alone. The log chain breaks from gaps in log backups or from switching the recovery model to SIMPLE and back."
    },
    {
      q: "How do you decide how often to run full backups?",
      a: "Based on how quickly differentials grow and on tested restore times, not on habit. I monitor differential size relative to full size and the age of the differential base: when the differential passes roughly half the full's size, or the base ages past the agreed window, a new full is due. The cadence is also what makes the earliest possible restore point predictable during an incident."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is a transactionally consistent copy of the entire database, captured as of the moment the backup starts.”",
      "options": [
        "full backup",
        "Backup header and LSNs",
        "while the backup runs"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A full backup is a transactionally consistent copy of the entire database, captured as of the moment the backup starts. It reads every allocated page in the database — rows, index pages, allocation pages, free-space metadata — plus enough of the transaction log to make the copy consistent when it is restored.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Anatomy of the BACKUP DATABASE statement”?",
      "options": [
        "The full backup is almost never restored alone — it is the first step of a sequence.",
        "Before any of this is attempted in an incident, the set must be readable: RESTORE VERIFYONLY FROM DISK = … WITH CHECKSUM on every full backup, and a full restore into an isolated…",
        "Production full backups should be explicit about media handling, integrity, and naming — defaults will eventually surprise you."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Production full backups should be explicit about media handling, integrity, and naming — defaults will eventually surprise you.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Scheduling the full backup”?",
      "options": [
        "Human-readable label stored in msdb — invaluable when hunting sets during an incident",
        "The full backup defines the upper bound of restore effort: everything after it (differentials and logs) only shortens the replay.",
        "Computes a checksum per page during the backup and stores it in the set"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The full backup defines the upper bound of restore effort: everything after it (differentials and logs) only shortens the replay. Scheduling decisions:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Restoring the full backup”?",
      "options": [
        "The full backup is almost never restored alone — it is the first step of a sequence.",
        "Human-readable label stored in msdb — invaluable when hunting sets during an incident",
        "Progress messages every n percent so long runs are observable in the job history"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The full backup is almost never restored alone — it is the first step of a sequence. Restoring with NORECOVERY leaves the database ready for differentials and logs; RECOVERY (the default) brings it online and ends the sequence.”"
    },
    {
      "question": "Which fact is covered in the lesson section “When to skip a full backup”?",
      "options": [
        "Progress messages every n percent so long runs are observable in the job history",
        "Destination media: local/UNC path, Azure Blob URL, or tape",
        "There are exactly two situations where you should not take a plain full backup:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “There are exactly two situations where you should not take a plain full backup:”"
    },
    {
      "question": "Complete the lesson statement: “Pages modified _____ are tracked via the differential bitmap: the backup captures the state as of its start, not as of its finish.”",
      "options": [
        "Cadence rule",
        "while the backup runs",
        "Duration trend"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Pages modified while the backup runs are tracked via the differential bitmap: the backup captures the state as of its start, not as of its finish. That is why a full backup taken during business hours still restores cleanly.”"
    },
    {
      "question": "In the “Anatomy of the BACKUP DATABASE statement” table, what is listed for “INIT / FORMAT” under “Purpose”?",
      "options": [
        "INIT overwrites the first media family; FORMAT reinitialises the media. Without them, backups append to an existing file forever",
        "The full backup defines the upper bound of restore effort: everything after it (differentials and logs) only shortens the replay.",
        "History is already in msdb — use it to size the window instead of guessing:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “INIT / FORMAT” as “INIT overwrites the first media family; FORMAT reinitialises the media. Without them, backups append to an existing file forever”."
    },
    {
      "question": "Which fact is covered in the lesson section “Scheduling the full backup”?",
      "options": [
        "The full backup is almost never restored alone — it is the first step of a sequence.",
        "Before any of this is attempted in an incident, the set must be readable: RESTORE VERIFYONLY FROM DISK = … WITH CHECKSUM on every full backup, and a full restore into an isolated…",
        "History is already in msdb — use it to size the window instead of guessing:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “History is already in msdb — use it to size the window instead of guessing:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Restoring the full backup”?",
      "options": [
        "There are exactly two situations where you should not take a plain full backup:",
        "Before any of this is attempted in an incident, the set must be readable: RESTORE VERIFYONLY FROM DISK = … WITH CHECKSUM on every full backup, and a full restore into an isolated…",
        "History is already in msdb — use it to size the window instead of guessing:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Before any of this is attempted in an incident, the set must be readable: RESTORE VERIFYONLY FROM DISK = … WITH CHECKSUM on every full backup, and a full restore into an isolated instance at least monthly. A full backup that has never been read end-to-end by a restore is a file, not a backup.”"
    },
    {
      "question": "Complete the lesson statement: “_____e what a full backup does not do: in FULL recovery it does not break the transaction log chain — log backups continue across it.”",
      "options": [
        "not",
        "Enormous, mostly static databases",
        "Production full backups should be explicit about media handling, integrity, and naming — defaults will eventually surprise you."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Note what a full backup does not do: in FULL recovery it does not break the transaction log chain — log backups continue across it. It does, however, reset the differential base, which is exactly why an unplanned full backup in the middle of a week deserves a COPY_ONLY clause.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is a transactionally consistent copy of the entire database, captured as of the moment the backup starts.”",
      "options": [
        "full backup",
        "Backup header and LSNs",
        "while the backup runs"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A full backup is a transactionally consistent copy of the entire database, captured as of the moment the backup starts. It reads every allocated page in the database — rows, index pages, allocation pages, free-space metadata — plus enough of the transaction log to make the copy consistent when it is restored.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Anatomy of the BACKUP DATABASE statement”?",
      "options": [
        "The full backup is almost never restored alone — it is the first step of a sequence.",
        "Before any of this is attempted in an incident, the set must be readable: RESTORE VERIFYONLY FROM DISK = … WITH CHECKSUM on every full backup, and a full restore into an isolated…",
        "Production full backups should be explicit about media handling, integrity, and naming — defaults will eventually surprise you."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Production full backups should be explicit about media handling, integrity, and naming — defaults will eventually surprise you.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Scheduling the full backup”?",
      "options": [
        "Human-readable label stored in msdb — invaluable when hunting sets during an incident",
        "The full backup defines the upper bound of restore effort: everything after it (differentials and logs) only shortens the replay.",
        "Computes a checksum per page during the backup and stores it in the set"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The full backup defines the upper bound of restore effort: everything after it (differentials and logs) only shortens the replay. Scheduling decisions:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Restoring the full backup”?",
      "options": [
        "The full backup is almost never restored alone — it is the first step of a sequence.",
        "Human-readable label stored in msdb — invaluable when hunting sets during an incident",
        "Progress messages every n percent so long runs are observable in the job history"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The full backup is almost never restored alone — it is the first step of a sequence. Restoring with NORECOVERY leaves the database ready for differentials and logs; RECOVERY (the default) brings it online and ends the sequence.”"
    },
    {
      "question": "Which fact is covered in the lesson section “When to skip a full backup”?",
      "options": [
        "Progress messages every n percent so long runs are observable in the job history",
        "Destination media: local/UNC path, Azure Blob URL, or tape",
        "There are exactly two situations where you should not take a plain full backup:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “There are exactly two situations where you should not take a plain full backup:”"
    },
    {
      "question": "Complete the lesson statement: “Pages modified _____ are tracked via the differential bitmap: the backup captures the state as of its start, not as of its finish.”",
      "options": [
        "Cadence rule",
        "while the backup runs",
        "Duration trend"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Pages modified while the backup runs are tracked via the differential bitmap: the backup captures the state as of its start, not as of its finish. That is why a full backup taken during business hours still restores cleanly.”"
    },
    {
      "question": "In the “Anatomy of the BACKUP DATABASE statement” table, what is listed for “INIT / FORMAT” under “Purpose”?",
      "options": [
        "INIT overwrites the first media family; FORMAT reinitialises the media. Without them, backups append to an existing file forever",
        "The full backup defines the upper bound of restore effort: everything after it (differentials and logs) only shortens the replay.",
        "History is already in msdb — use it to size the window instead of guessing:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “INIT / FORMAT” as “INIT overwrites the first media family; FORMAT reinitialises the media. Without them, backups append to an existing file forever”."
    },
    {
      "question": "Which fact is covered in the lesson section “Scheduling the full backup”?",
      "options": [
        "The full backup is almost never restored alone — it is the first step of a sequence.",
        "Before any of this is attempted in an incident, the set must be readable: RESTORE VERIFYONLY FROM DISK = … WITH CHECKSUM on every full backup, and a full restore into an isolated…",
        "History is already in msdb — use it to size the window instead of guessing:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “History is already in msdb — use it to size the window instead of guessing:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Restoring the full backup”?",
      "options": [
        "There are exactly two situations where you should not take a plain full backup:",
        "Before any of this is attempted in an incident, the set must be readable: RESTORE VERIFYONLY FROM DISK = … WITH CHECKSUM on every full backup, and a full restore into an isolated…",
        "History is already in msdb — use it to size the window instead of guessing:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Before any of this is attempted in an incident, the set must be readable: RESTORE VERIFYONLY FROM DISK = … WITH CHECKSUM on every full backup, and a full restore into an isolated instance at least monthly. A full backup that has never been read end-to-end by a restore is a file, not a backup.”"
    },
    {
      "question": "Complete the lesson statement: “_____e what a full backup does not do: in FULL recovery it does not break the transaction log chain — log backups continue across it.”",
      "options": [
        "not",
        "Enormous, mostly static databases",
        "Production full backups should be explicit about media handling, integrity, and naming — defaults will eventually surprise you."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Note what a full backup does not do: in FULL recovery it does not break the transaction log chain — log backups continue across it. It does, however, reset the differential base, which is exactly why an unplanned full backup in the middle of a week deserves a COPY_ONLY clause.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ is a transactionally consistent copy of the entire database, captured as of the moment the backup starts.”",
      "options": [
        "full backup",
        "Backup header and LSNs",
        "while the backup runs"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “A full backup is a transactionally consistent copy of the entire database, captured as of the moment the backup starts. It reads every allocated page in the database — rows, index pages, allocation pages, free-space metadata — plus enough of the transaction log to make the copy consistent when it is restored.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Anatomy of the BACKUP DATABASE statement”?",
      "options": [
        "The full backup is almost never restored alone — it is the first step of a sequence.",
        "Before any of this is attempted in an incident, the set must be readable: RESTORE VERIFYONLY FROM DISK = … WITH CHECKSUM on every full backup, and a full restore into an isolated…",
        "Production full backups should be explicit about media handling, integrity, and naming — defaults will eventually surprise you."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Production full backups should be explicit about media handling, integrity, and naming — defaults will eventually surprise you.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Scheduling the full backup”?",
      "options": [
        "Human-readable label stored in msdb — invaluable when hunting sets during an incident",
        "The full backup defines the upper bound of restore effort: everything after it (differentials and logs) only shortens the replay.",
        "Computes a checksum per page during the backup and stores it in the set"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The full backup defines the upper bound of restore effort: everything after it (differentials and logs) only shortens the replay. Scheduling decisions:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Restoring the full backup”?",
      "options": [
        "The full backup is almost never restored alone — it is the first step of a sequence.",
        "Human-readable label stored in msdb — invaluable when hunting sets during an incident",
        "Progress messages every n percent so long runs are observable in the job history"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The full backup is almost never restored alone — it is the first step of a sequence. Restoring with NORECOVERY leaves the database ready for differentials and logs; RECOVERY (the default) brings it online and ends the sequence.”"
    },
    {
      "question": "Which fact is covered in the lesson section “When to skip a full backup”?",
      "options": [
        "Progress messages every n percent so long runs are observable in the job history",
        "Destination media: local/UNC path, Azure Blob URL, or tape",
        "There are exactly two situations where you should not take a plain full backup:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “There are exactly two situations where you should not take a plain full backup:”"
    },
    {
      "question": "Complete the lesson statement: “Pages modified _____ are tracked via the differential bitmap: the backup captures the state as of its start, not as of its finish.”",
      "options": [
        "Cadence rule",
        "while the backup runs",
        "Duration trend"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Pages modified while the backup runs are tracked via the differential bitmap: the backup captures the state as of its start, not as of its finish. That is why a full backup taken during business hours still restores cleanly.”"
    },
    {
      "question": "In the “Anatomy of the BACKUP DATABASE statement” table, what is listed for “INIT / FORMAT” under “Purpose”?",
      "options": [
        "INIT overwrites the first media family; FORMAT reinitialises the media. Without them, backups append to an existing file forever",
        "The full backup defines the upper bound of restore effort: everything after it (differentials and logs) only shortens the replay.",
        "History is already in msdb — use it to size the window instead of guessing:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson’s table lists “INIT / FORMAT” as “INIT overwrites the first media family; FORMAT reinitialises the media. Without them, backups append to an existing file forever”."
    },
    {
      "question": "Which fact is covered in the lesson section “Scheduling the full backup”?",
      "options": [
        "The full backup is almost never restored alone — it is the first step of a sequence.",
        "Before any of this is attempted in an incident, the set must be readable: RESTORE VERIFYONLY FROM DISK = … WITH CHECKSUM on every full backup, and a full restore into an isolated…",
        "History is already in msdb — use it to size the window instead of guessing:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “History is already in msdb — use it to size the window instead of guessing:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Restoring the full backup”?",
      "options": [
        "There are exactly two situations where you should not take a plain full backup:",
        "Before any of this is attempted in an incident, the set must be readable: RESTORE VERIFYONLY FROM DISK = … WITH CHECKSUM on every full backup, and a full restore into an isolated…",
        "History is already in msdb — use it to size the window instead of guessing:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Before any of this is attempted in an incident, the set must be readable: RESTORE VERIFYONLY FROM DISK = … WITH CHECKSUM on every full backup, and a full restore into an isolated instance at least monthly. A full backup that has never been read end-to-end by a restore is a file, not a backup.”"
    },
    {
      "question": "Complete the lesson statement: “_____e what a full backup does not do: in FULL recovery it does not break the transaction log chain — log backups continue across it.”",
      "options": [
        "not",
        "Enormous, mostly static databases",
        "Production full backups should be explicit about media handling, integrity, and naming — defaults will eventually surprise you."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Note what a full backup does not do: in FULL recovery it does not break the transaction log chain — log backups continue across it. It does, however, reset the differential base, which is exactly why an unplanned full backup in the middle of a week deserves a COPY_ONLY clause.”"
    }
  ],
  takeaways: [
    "A full backup reads every allocated page plus the log needed to restore a consistent state",
    "Always use INIT, COMPRESSION, CHECKSUM, and a timestamped NAME in production backup jobs",
    "The full backup is both the differential base and the anchor of every restore sequence",
    "Monitor durations and sizes from msdb — trends reveal growth, I/O problems, and compression wins",
    "A full backup never breaks the log chain, but a plain one does reset the differential base"
  ]
};
