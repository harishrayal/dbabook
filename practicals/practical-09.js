/* Practical content file — one JS file per practical lab.
   Rendered by assets/js/site.js on practicals/practical-09.html */

window.TOPIC = {
  id: "practical-09",
  title: "Database Integrity",

  lead: "A hands-on integrity lab: enable page checksums, run DBCC CHECKDB, interpret consistency errors, perform a page-level restore from a verified backup, and practise safe corruption response.",

  objectives: [
    "Enable and verify page checksums",
    "Run and interpret DBCC CHECKDB output",
    "Understand repair levels and their risk",
    "Restore a damaged page from a clean backup",
    "Follow a safe corruption-incident response"
  ],

  sections: [
    {
      h: "Before you start",
      html: `
<p>This lab covers database integrity: detecting damage early and responding without making data loss worse. You will use DBCC CHECKDB and practise a page-level restore, the surgical option that minimises downtime.</p>
<p>Work on a scratch database and a local instance. Real corruption is rare and destructive to simulate, so this lab focuses on the detection and restore mechanics using a controlled setup.</p>
<p><strong>Environment check</strong> — confirm where you are before changing anything; this habit prevents production mistakes:</p>
<pre><code class="language-sql">-- Lab step
ALTER DATABASE IntegrityLab SET PAGE_VERIFY CHECKSUM;
GO
BACKUP DATABASE IntegrityLab
TO DISK = 'D:\Backups\IntegrityLab_Clean.bak'
WITH COMPRESSION, CHECKSUM, INIT, STATS = 10;
GO
-- Full integrity check with all errors reported
DBCC CHECKDB ('IntegrityLab')
WITH NO_INFOMSGS, ALL_ERRORMSGS;
GO</code></pre>
      `,
    },
    {
      h: "Lab architecture",
      html: `
<p>Corruption is physical (damaged page bytes or I/O errors) or logical (structurally consistent but wrong metadata). Page checksums detect physical damage on read; CHECKDB checks allocation, structure and logical consistency.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Corruption response flow">
    <defs>
      <marker id="pa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="200" y="10" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="31" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Detect error / checksum</text>
    <line x1="380" y1="54" x2="380" y2="64" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="64" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="85" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Run DBCC CHECKDB</text>
    <line x1="380" y1="108" x2="380" y2="118" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="118" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="139" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Identify damaged page</text>
    <line x1="380" y1="162" x2="380" y2="172" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="172" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="193" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Page restore + log replay</text>
    <line x1="380" y1="216" x2="380" y2="226" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="226" width="360" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)"/>
    <text x="380" y="247" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Re-run CHECKDB to confirm</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Corruption response flow</text>
  </svg>
  <div class="figcaption">Figure 1 — Detect with checksums and CHECKDB, preserve evidence, restore damaged pages, verify clean.</div>
</div>
<p>The response flow below is deliberately cautious: detect, preserve evidence, identify the damaged page, restore from a clean backup, apply logs, then re-run CHECKDB to confirm a clean result.</p>
      `,
    },
    {
      h: "Core tasks",
      html: `
<p>Ensure PAGE_VERIFY is set to CHECKSUM and take a full backup with CHECKSUM. Confirm the backup is readable — this is the backup you will restore a page from later.</p>
<table>
  <tr><th>Condition</th><th>Meaning</th><th>First action</th></tr>
  <tr><td>824 / 825</td><td>I/O or consistency error</td><td>Check storage, run CHECKDB</td></tr>
  <tr><td>SUSPECT</td><td>Recovery failed at startup</td><td>Check log; avoid emergency repair first</td></tr>
  <tr><td>RECOVERY_PENDING</td><td>Recovery cannot start</td><td>Check log access and space</td></tr>
</table>
<p>Run DBCC CHECKDB and read the output carefully, including the 'repair level' it recommends and the count of errors. Even on a clean database, understanding the output is the point.</p>
<pre><code class="language-sql">-- Lab step
-- Targeted checks when a full CHECKDB window is tight
DBCC CHECKALLOC ('IntegrityLab') WITH NO_INFOMSGS;
GO
DBCC CHECKTABLE ('dbo.Orders') WITH NO_INFOMSGS;
GO
DBCC CHECKCATALOG ('IntegrityLab') WITH NO_INFOMSGS;
GO
-- Review errors recorded in the error log
EXEC sp_readerrorlog 0, 1, 'error';
GO</code></pre>
      `,
    },
    {
      h: "Verify your work",
      html: `
<p>Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:</p>
<pre><code class="language-sql">-- Lab step
-- Restore a single damaged page from a verified backup
RESTORE DATABASE IntegrityLab
PAGE = '1:123456'
FROM DISK = 'D:\Backups\IntegrityLab_Clean.bak'
WITH NORECOVERY;
GO
-- Apply the log chain, then recover
RESTORE LOG IntegrityLab
FROM DISK = 'D:\Backups\IntegrityLab_Log.trn'
WITH RECOVERY;
GO
-- Confirm the database is clean after repair
DBCC CHECKDB ('IntegrityLab') WITH NO_INFOMSGS;
GO</code></pre>
<p>Review the three repair options. REPAIR_FAST and REPAIR_REBUILD are limited; REPAIR_ALLOW_DATA_LOSS can delete rows to achieve consistency and must be a last resort with a copy and business approval.</p>
<p>If the output differs, stop and correct it before moving on. A lab that 'looks right' but was never verified teaches the wrong lessons.</p>
      `,
    },
    {
      h: "Pitfalls and safe practice",
      html: `
<p>Perform a page-level restore of a known page using RESTORE DATABASE ... PAGE from a verified backup, apply the log chain and finish with CHECKDB to prove the database is clean.</p>
<table>
  <tr><th>Repair option</th><th>Risk</th><th>When</th></tr>
  <tr><td>REPAIR_FAST</td><td>Low</td><td>Minor non-data issues</td></tr>
  <tr><td>REPAIR_REBUILD</td><td>Medium</td><td>Rebuild indexes</td></tr>
  <tr><td>REPAIR_ALLOW_DATA_LOSS</td><td>High</td><td>Absolute last resort only</td></tr>
</table>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.</p>
</div>
      `,
    }
  ],

  steps: [
    "Set PAGE_VERIFY to CHECKSUM on IntegrityLab and confirm with sys.databases.",
    "Take a full compressed backup with CHECKSUM and record its path — this is your clean restore source.",
    "Run DBCC CHECKDB with ALL_ERRORMSGS and record the output, especially the recommended repair level.",
    "Run CHECKALLOC, CHECKTABLE and CHECKCATALOG to see the targeted alternatives.",
    "Read the three repair options and explain to a colleague why REPAIR_ALLOW_DATA_LOSS is last-resort.",
    "Identify a page number from a (simulated) error and prepare a page restore command with the correct file:page syntax.",
    "Perform the page restore WITH NORECOVERY, then apply the log chain WITH RECOVERY.",
    "Run DBCC CHECKDB again and confirm the clean result.",
    "Review the SQL Server error log for any 824 or 825 messages and note what they would mean.",
    "Write a short corruption runbook: detect, preserve files, restore, verify, replace failing hardware."
  ],

  scenario: {
    title: "Error 824 at 3 a.m. and the page-level save",
    html: `
The error log showed error 824 on page 1:123456 during an index scan. Rather than run a destructive repair, the DBA confirmed checksums were enabled, restored just that page from a recent verified backup, applied the log chain and ran CHECKDB again — clean. The storage team then replaced a failing disk that had caused the damage. In another case a database came up SUSPECT after an unclean shutdown; the DBA resisted the tempting emergency rebuild, restored from a good backup instead, and avoided far greater data loss.
<p><strong>The lesson:</strong> practise both the diagnosis and the safe mitigation in this lab. Under pressure, the steps you have rehearsed are the steps you will actually take — build good muscle memory now.</p>
    `,
  },

  interview: [
    {
      q: "What is the difference between logical and physical corruption?",
      a: `
Physical corruption is damaged page bytes or I/O errors detected by checksums; logical corruption is structurally consistent but wrong data or metadata, found by CHECKDB's logical checks.
      `,
    },
    {
      q: "Why is REPAIR_ALLOW_DATA_LOSS a last resort?",
      a: `
Because it can delete damaged rows or pages to make the structure consistent — it prioritises structure over data, so it follows only a verified backup, business approval and evidence of the root cause.
      `,
    },
    {
      q: "When would you use a page-level restore?",
      a: `
When a small number of pages are damaged, you are in FULL recovery with a verified backup and intact log chain; it restores only the bad pages, avoiding a full-database restore and its downtime.
      `,
    }
  ],

  takeaways: [
    "Enable page checksums — they catch silent disk corruption on read",
    "DBCC CHECKDB is the definitive integrity check; schedule it and run it after restores",
    "REPAIR_ALLOW_DATA_LOSS can delete data — exhaust restore options first",
    "Page-level restore minimises downtime when the log chain is intact",
    "Preserve evidence and find the root cause, usually storage hardware"
  ]
};
