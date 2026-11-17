/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch08-04.html */

window.TOPIC = {
  id: "ch08-04",
  title: "Restoring Full Backups",

  lead: "The full backup is the base image of a database — every page it contains — and restoring one correctly is the foundation every other restore step builds on.",

  objectives: [
    "Explain what a full backup contains and when to restore one alone",
    "Use RESTORE DATABASE with STATS, MOVE, and REPLACE appropriately",
    "Decide between a standalone restore and a NORECOVERY chain start",
    "Validate a restored full backup with FILELISTONLY and CHECKDB"
  ],

  sections: [
    {
      h: "What a full backup restore gives you",
      html: `
<p>A <strong>full backup</strong> is a complete copy of the database at the moment the backup ran — every allocated page, plus enough log to make those pages consistent when restored. Restoring it rebuilds the database exactly as it looked at that point: <strong>no earlier, no later</strong>.</p>
<p>That single fact drives every decision about a full-restore:</p>
<ul>
  <li><strong>Standalone</strong> — restore a full with <code>RECOVERY</code> (the default) and you have a usable database frozen at the backup's moment. Simplest path, but all data written afterwards is gone.</li>
  <li><strong>As a base</strong> — restore the full with <code>NORECOVERY</code> and it becomes the anchor for differentials and log backups, letting you roll forward to a later moment.</li>
</ul>
<blockquote>Restoring a full backup answers one question precisely: “What did this database look like when this backup finished?”</blockquote>
<p>The rest of the chapter is about moving that answer forward in time — but it always starts here.</p>
`
    },
    {
      h: "The anatomy of a full restore",
      html: `
<p>A full restore reads the backup set, writes pages into the target data and log files, rolls the log forward to the backup's end point, then (if not told otherwise) rolls back and opens the database.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Anatomy of a full backup restore">
    <defs>
      <marker id="full-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
      <marker id="full-arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"/>
      </marker>
    </defs>

    <text x="380" y="24" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">One media file in → every page written to the target layout</text>

    <rect x="20" y="50" width="210" height="120" rx="12" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="125" y="80" text-anchor="middle" fill="var(--text)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">ERP_FULL.bak</text>
    <text x="125" y="104" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">full backup set</text>
    <line x1="45" y1="122" x2="205" y2="122" stroke="var(--border)" stroke-width="1"/>
    <text x="125" y="144" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">data pages + log records</text>
    <text x="125" y="162" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">checksums per stripe</text>

    <rect x="300" y="70" width="160" height="80" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="100" text-anchor="middle" fill="var(--accent-strong)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">RESTORE DATABASE</text>
    <text x="380" y="124" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">validate → copy → redo</text>
    <text x="380" y="142" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-style="italic" font-family="Segoe UI, sans-serif">STATS shows progress</text>

    <rect x="530" y="35" width="215" height="52" rx="10" fill="var(--surface)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="637" y="57" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">ERP.mdf</text>
    <text x="637" y="76" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">data file — pages restored</text>

    <rect x="530" y="100" width="215" height="52" rx="10" fill="var(--surface)" stroke="var(--border)" stroke-width="1.6"/>
    <text x="637" y="122" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">ERP_log.ldf</text>
    <text x="637" y="141" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">log file — replayed, then rolled back</text>

    <line x1="230" y1="110" x2="298" y2="110" stroke="var(--muted)" stroke-width="2" marker-end="url(#full-arrow)"/>
    <line x1="460" y1="95" x2="528" y2="66" stroke="var(--accent)" stroke-width="1.8" marker-end="url(#full-arrow-accent)"/>
    <line x1="460" y1="125" x2="528" y2="126" stroke="var(--accent)" stroke-width="1.8" marker-end="url(#full-arrow-accent)"/>

    <rect x="20" y="205" width="355" height="52" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="197" y="227" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">With RECOVERY (default)</text>
    <text x="197" y="246" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">database ends ONLINE, ready for users</text>

    <rect x="390" y="205" width="355" height="52" rx="10" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="567" y="227" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">With NORECOVERY</text>
    <text x="567" y="246" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">stays RESTORING — base for diffs and logs</text>

    <text x="380" y="298" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">WITH REPLACE lets a full overwrite an existing database — use it deliberately, never by habit</text>
  </svg>
  <div class="figcaption">Figure 1 — A full restore writes the backup's pages into your chosen file layout, then either opens or holds the database.</div>
</div>
`
    },
    {
      h: "Standing alone versus starting a chain",
      html: `
<p>The same command produces two very different outcomes depending on the recovery clause:</p>
<table>
  <tr><th>Goal</th><th>Command shape</th><th>Ends in</th></tr>
  <tr><td>Database exactly as of the full backup, usable now</td><td><code>RESTORE DATABASE … FROM DISK … (RECOVERY)</code></td><td>ONLINE — final</td></tr>
  <tr><td>Base for differentials / logs (PITR)</td><td><code>RESTORE DATABASE … WITH NORECOVERY</code></td><td>RESTORING — chain open</td></tr>
  <tr><td>Readable copy while logs are still applied</td><td><code>RESTORE … WITH STANDBY = 'undo.dat'</code></td><td>STANDBY / read-only — chain open</td></tr>
</table>
<p>When overwriting an existing database with a full backup of the same name, add <code>WITH REPLACE</code>. Without it, SQL Server refuses if the existing database has a different family GUID or if the target name already exists with mismatched settings — a guard against accidentally destroying the wrong database. <code>REPLACE</code> removes that guard, so confirm the target name in writing before you type it.</p>
<p>Two clauses worth knowing from the start: <code>KEEP_REPLICATION</code> preserves publication settings that a restore would otherwise strip, and <code>KEEP_CDC</code> preserves change data capture history. Omit them and CDC/replication metadata is silently dropped.</p>
`
    },
    {
      h: "A full restore, prepared and executed",
      html: `
<p>Prepare first, restore second. The file list tells you exactly what layout the backup expects:</p>
<pre><code class="language-sql">-- 1. What files (and sizes) does this backup create?
RESTORE FILELISTONLY FROM DISK = N'E:\\SQLBackup\\ERP_FULL_2026-11-16.bak';
--   LogicalName = ERP, ERP_log   Type = D, L   Size = bytes needed

-- 2. Confirm free space on the target volume (outside SQL Server), then restore
RESTORE DATABASE [ERP] FROM DISK = N'E:\\SQLBackup\\ERP_FULL_2026-11-16.bak'
WITH MOVE N'ERP'     TO N'D:\\Data\\ERP.mdf',
     MOVE N'ERP_log' TO N'D:\\Data\\ERP_log.ldf',
     REPLACE,            -- overwrite the existing database deliberately
     RECOVERY,           -- final: open it to users
     STATS = 5;          -- progress every 5%
GO

-- 3. Prove the result
DBCC CHECKDB (N'ERP') WITH NO_INFOMSGS;
SELECT name, state_desc, compatibility_level, recovery_model_desc
FROM   sys.databases WHERE name = N'ERP';</code></pre>
<p>If the restore stops mid-way, do not keep re-running it blindly: read the message. Directory problems mean the paths are wrong, “cannot create the file” means insufficient space, and an LSN error means you are not applying the media this database expects.</p>
`
    },
    {
      h: "When a full restore is the right choice",
      html: `
<p>Restoring only the full is appropriate when:</p>
<ul>
  <li>You need a <strong>known-good baseline</strong> — for example, a clean copy for a developer or a test of a schema change</li>
  <li><strong>No logs are available</strong> — retention has passed and the full is all you have (accepting data loss up to the backup moment)</li>
  <li>You are <strong>rebuilding after corruption</strong> and will re-apply logs afterwards to reach a safe moment</li>
  <li>You are <strong>seeding a new target</strong> — the first step of a migration or a DR stand-by</li>
</ul>
<p>It is the <em>wrong</em> choice when log backups exist covering the incident — restoring a full and stopping there throws away transactions that were safely on disk. Always check <code>msdb.dbo.backupset</code> for newer log backups before you commit to a standalone restore, and remember that a full restore is the most I/O-intensive operation the storage subsystem will ever run: measure it, do not estimate it.</p>
`
    },
    {
      h: "Deeper dive: Restoring Full Backups",
      html: `
<p>This section consolidates <strong>Restoring Full Backups</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Post-restore validation includes DBCC CHECKDB, row-count and application smoke tests, permission checks and a compatibility review when moving across versions.</p>
<p>Disaster recovery planning extends beyond restore mechanics: cold, warm and hot standby options trade cost against RTO, and regular DR tests are the only proof the plan works.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Restoring Full Backups sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Standby</th><th>RTO</th><th>Cost</th></tr>
  <tr><td>Cold</td><td>Hours</td><td>Lowest</td></tr>
  <tr><td>Warm</td><td>Tens of minutes</td><td>Medium</td></tr>
  <tr><td>Hot</td><td>Near zero</td><td>Highest</td></tr>
</table>
<p>Restoration reverses backup: a full backup establishes the base, a differential reduces the log replay needed, and log backups bring the database forward to the desired moment. Each step must be ordered correctly.</p>
<p>Use the following as a starting point when investigating Restoring Full Backups. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Restoring Full Backups
-- Find orphaned users after a restore
SELECT dp.name AS user_name, dp.sid
FROM   sys.database_principals dp
LEFT JOIN sys.server_principals sp ON sp.sid = dp.sid
WHERE  dp.type IN ('S','U') AND sp.sid IS NULL
       AND dp.name NOT IN ('dbo','guest','INFORMATION_SCHEMA','sys');</code></pre>
<p>NORECOVERY leaves the database restoring so further backups can be applied. RECOVERY completes the sequence and makes the database usable. STANDBY leaves it read-only while still allowing further restores, useful for log shipping with query access.</p>
      `,
    }
  ],

  scenario: {
    title: "The SAN upgrade left the database three hours behind",
    html: `
<p>At 02:15 a storage array failed mid-morning, and the database was taken down for a SAN replacement. The team restored the most recent full backup (taken at 00:00) with <code>RECOVERY</code> to get users online quickly — but the 01:00 and 02:00 log backups were sitting right there on disk, and nobody applied them. The company reopened with three hours of orders missing.</p>
<p>Diagnosis in the post-incident review: the restore script in the runbook ended at the full and had never been extended. Resolution: nothing could roll forward an already-online database; the missing transactions were recovered from the application's message queue and re-keyed manually. Prevention: the runbook was rewritten as a parameterised script that always continues with available logs, every standalone full restore now requires a documented reason for not applying logs, and the DR test checks <code>last_lsn</code> against the newest log file before declaring success.</p>
`
  },

  interview: [
    {
      q: "When do you use WITH REPLACE on a full restore?",
      a: "When the target database already exists and you intend to overwrite it — for example refreshing a database from a backup of the same name. It overrides SQL Server's safety checks that stop you replacing a database the backup was not taken from, so it should always be paired with an explicitly verified target name, never typed from memory."
    },
    {
      q: "What does FILELISTONLY tell you before a full restore?",
      a: "The logical names, physical source paths, file types (D/L), file groups, and sizes of every file in the backup set. That is exactly what you need to check free space on the target and to write the WITH MOVE clauses when the destination layout differs."
    },
    {
      q: "Can you restore a full backup with STOPAT to an earlier moment?",
      a: "No — STOPAT applies to transaction log restores. A full backup represents its own moment; you restore it with RECOVERY to use it as-is, or with NORECOVERY and then apply log backups with STOPAT to reach a chosen time."
    }
  ],

  takeaways: [
    "A full backup restores the database exactly as of its own moment — no earlier, no later",
    "RECOVERY (default) ends ONLINE; NORECOVERY keeps the chain open for diffs and logs",
    "FILELISTONLY first — it gives you the logical names, paths, and sizes for MOVE and space checks",
    "WITH REPLACE deliberately overwrites an existing database; confirm the target before using it",
    "Before stopping at a full, check whether newer log backups exist — they may hold hours of work"
  ]
};
