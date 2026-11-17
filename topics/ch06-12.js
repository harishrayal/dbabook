/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch06-12.html */

window.TOPIC = {
  id: "ch06-12",
  title: "Fixed-Size Versus Percentage Growth",

  lead: "Every file has to grow as data arrives, and how it grows is a setting with real consequences: fixed increments keep growth predictable, while percentage growth silently scales with the file and can stall production at the worst possible moment.",

  objectives: [
    "Explain how SQL Server autogrowth works",
    "Compare fixed-size and percentage growth settings",
    "Choose sensible increments for data and log files",
    "Recognise the cost and risk of a growth event in production"
  ],

  sections: [
    {
      h: "Why autogrowth exists",
      html: `
<p>When a data or log file runs out of space, SQL Server tries to extend it — that is <strong>autogrowth</strong>. The increment is stored per file (<code>sys.database_files.is_percent_growth</code> and <code>growth</code>) and can be expressed in megabytes or as a percentage of the current file size.</p>
<p>Autogrowth exists so a database does not fail the moment it fills up, but it is <em>not</em> a sizing strategy. Every growth event is a real-time allocation on the storage subsystem, and the workload feels it while it happens:</p>
<ul>
  <li><strong>Data files</strong> — extending a data file is cheap on editions with instant file initialization (no zeroing), but it still means allocating extents on a live volume</li>
  <li><strong>Log files</strong> — new log space must be zeroed before use, so a large log growth can take minutes while log writes queue behind it</li>
  <li><strong>Failure</strong> — if the volume holds less free space than the increment demands, the growth fails and sessions receive error 1105, “There is not enough space on the disk”</li>
</ul>
<p>The question is therefore not <em>whether</em> to allow growth, but <em>how much</em> to allocate each time — and how often you are willing to let production sit through it.</p>
`
    },
    {
      h: "Fixed increment vs percentage growth",
      html: `
<p>Both settings extend the file; the difference is what the next increment costs:</p>
<table>
  <tr><th>Property</th><th>Fixed increment</th><th>Percentage growth</th></tr>
  <tr><td>Increment size</td><td>Same every event (e.g. 512 MB)</td><td>Grows with the file (10% of 2 TB = 200 GB)</td></tr>
  <tr><td>Predictability</td><td>High — capacity can be planned around it</td><td>Low — the cost doubles every time the file doubles</td></tr>
  <tr><td>IO impact</td><td>Constant and usually short</td><td>Escalating; log zeroing can stall writes for minutes</td></tr>
  <tr><td>Free space needed</td><td>One increment</td><td>A percentage of a possibly enormous file</td></tr>
  <tr><td>Best suited to</td><td>Almost every production file</td><td>Small, unpredictable, non-critical files only</td></tr>
</table>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Fixed versus percentage growth curves">
    <defs>
      <marker id="grow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <text x="380" y="26" text-anchor="middle" fill="var(--text)" font-size="16" font-weight="700" font-family="Segoe UI, sans-serif">Same file, two growth settings</text>

    <rect x="24" y="46" width="340" height="238" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="194" y="72" text-anchor="middle" fill="var(--accent-strong)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Fixed: +512 MB every event</text>
    <line x1="60" y1="254" x2="340" y2="254" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#grow-arrow)"/>
    <line x1="60" y1="254" x2="60" y2="96" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#grow-arrow)"/>
    <polyline points="64,244 108,244 108,226 152,226 152,208 196,208 196,190 240,190 240,172 284,172 284,154 332,154" fill="none" stroke="var(--accent)" stroke-width="2.6"/>
    <text x="200" y="272" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">time → · even steps, constant IO cost</text>

    <rect x="396" y="46" width="340" height="238" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="566" y="72" text-anchor="middle" fill="var(--amber)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Percentage: 10% of current size</text>
    <line x1="432" y1="254" x2="712" y2="254" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#grow-arrow)"/>
    <line x1="432" y1="254" x2="432" y2="96" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#grow-arrow)"/>
    <polyline points="436,244 474,244 474,234 512,234 512,220 550,220 550,198 588,198 588,166 626,166 626,122 664,122 664,84 706,84" fill="none" stroke="var(--amber)" stroke-width="2.6"/>
    <text x="566" y="272" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">time → · each step is bigger than the last</text>
    <line x1="626" y1="122" x2="586" y2="104" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#grow-arrow)"/>
    <text x="576" y="98" text-anchor="end" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">on a 2 TB file one event = 200 GB</text>

    <text x="380" y="322" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Large percentage increments are how a routine batch turns into an eleven-minute stall.</text>
  </svg>
  <div class="figcaption">Figure 1 — Fixed growth adds the same increment each time; percentage growth accelerates as the file grows.</div>
</div>
`
    },
    {
      h: "Choosing the right increment",
      html: `
<p>The increment should be sized to the <em>rate of growth</em>, not to a round number:</p>
<ul>
  <li><strong>Data files</strong> — pick an increment that absorbs a few weeks of real growth between events. For most OLTP databases that is 128–512 MB; a busy warehouse might justify 1–2 GB.</li>
  <li><strong>Log files</strong> — fixed increments of 64–512 MB. Increments that are far too small create thousands of tiny virtual log files (VLFs), which slow truncation and recovery; increments that are far too large mean long zeroing stalls and wasted space.</li>
  <li><strong>Never use percentage</strong> on a file that is already large or will become large. Percentage growth is only defensible on small, short-lived files where nobody can predict the workload.</li>
  <li><strong>Match headroom</strong> — the volume should always hold at least several increments of free space, otherwise autogrowth becomes a race against disk-full.</li>
</ul>
<p>A useful smell test: if a file grows more than once a week, the increment is too small; if you cannot remember the last growth event, the increment is comfortably large and the volume should be carrying the difference.</p>
`
    },
    {
      h: "What a growth event costs",
      html: `
<p>During a growth event the workload pays for the allocation:</p>
<ol>
  <li>The file extends on disk (and for a log, the new space is zeroed before it can be used).</li>
  <li>Log writes queue behind a log growth — transactions stall until it completes, regardless of how fast the CPU is.</li>
  <li>If the volume is nearly full, the growth attempt fails, the statement fails, and the application sees error 1105. Retries usually fail again.</li>
</ol>
<p>Because growth events are visible in file sizes over time rather than in a single DMV, the practical defence is <strong>capacity monitoring</strong>: track file size and volume free space on a schedule, alert well before autogrowth becomes urgent, and change growth settings before — not after — the file becomes large enough for percentage growth to hurt.</p>
`
    },
    {
      h: "Auditing and changing growth settings",
      html: `
<p>Change growth with <code>ALTER DATABASE … MODIFY FILE</code>. The change is metadata-only: it takes effect at the <em>next</em> growth event and needs no restart. Two rules prevent surprises — never specify a <code>SIZE</code> smaller than the file's current size, and keep at least one increment of free space on the volume.</p>
<pre><code class="language-sql">-- 1. Audit: how does every file on the instance grow today?
SELECT db_name(database_id)                  AS database_name,
       name                                  AS logical_name,
       type_desc,
       size * 8 / 1024                       AS size_mb,
       CASE is_percent_growth
            WHEN 1 THEN cast(growth AS varchar(12)) + ' %'
            ELSE cast(growth * 8 / 1024 AS varchar(12)) + ' MB'
       END                                   AS growth_setting
FROM   sys.master_files
ORDER BY database_id, type_desc, name;</code></pre>
<pre><code class="language-sql">-- 2. Replace a dangerous 10 % setting with fixed increments.
--    Run in a change window; watch the next growth event afterwards.
ALTER DATABASE [SalesDB] MODIFY FILE
  (NAME = N'SalesDB_Data', GROWTH = 512MB);

ALTER DATABASE [SalesDB] MODIFY FILE
  (NAME = N'SalesDB_Log',  GROWTH = 128MB);</code></pre>
<p>Audit the whole estate, not only the database you are investigating — percentage growth hides in defaults and in copies of old build scripts, and it stays invisible until the file is already huge.</p>
`
    },
    {
      h: "Deeper dive: Fixed-Size Versus Percentage Growth",
      html: `
<p>This section consolidates <strong>Fixed-Size Versus Percentage Growth</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>TempDB is a shared workspace for sorts, hash joins, temporary objects and version store. It is recreated at startup, so it cannot be backed up, and it is a frequent source of contention when misconfigured.</p>
<p>For TempDB best practice: multiple equally sized data files (one per CPU core up to around eight) on fast storage, pre-sized to avoid growth, with trace flag 1118 semantics standard on modern versions.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Fixed-Size Versus Percentage Growth sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Growth setting</th><th>Behaviour</th><th>Recommendation</th></tr>
  <tr><td>Fixed MB</td><td>Adds a constant amount</td><td>Preferred — predictable</td></tr>
  <tr><td>Percentage</td><td>Adds a growing amount</td><td>Avoid on large files</td></tr>
  <tr><td>Autogrowth off</td><td>Fails when full</td><td>Only with monitoring</td></tr>
</table>
<p>A database has logical files (data and log) mapped to physical files on disk. Data files (MDF primary, NDF secondary) are grouped into filegroups; the log file (LDF) is separate and managed independently.</p>
<p>Use the following as a starting point when investigating Fixed-Size Versus Percentage Growth. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Fixed-Size Versus Percentage Growth
SELECT name, physical_name, type_desc,
       size / 128 AS size_mb,
       growth, is_percent_growth
FROM   sys.database_files;</code></pre>
<p>The PRIMARY filegroup holds system objects and is the default home for user objects. Additional user-defined filegroups let a DBA place large tables or indexes on specific volumes for performance or administration.</p>
      `,
    }
  ],

  scenario: {
    title: "10% autogrowth on a 1.8 TB file froze order entry for eleven minutes",
    html: `
<p>At 14:20 the order-entry application began timing out. CPU was idle, no query was blocked, but every transaction was slow. The DBA found the cause in minutes: the sales database's main data file was set to <strong>10% percentage growth</strong>, and at 1.8 TB that meant a 180 GB allocation triggered by a routine batch. The storage array was already serving peak reporting IO, so the extension crawled — and log writes queued behind it.</p>
<p>Resolution: with the storage team, the DBA confirmed the volume had 400 GB free (so no data loss), let the event complete while freezing the offending batch, then immediately changed the setting to a fixed 512 MB increment. Prevention: an estate-wide audit of <code>sys.master_files</code> found nine more databases with percentage growth, an alert on volume free space below 20%, and a rule that autogrowth settings are part of every build review. <strong>The hardware was never the problem — an unpredictable growth setting was.</strong></p>
`
  },

  interview: [
    {
      q: "When is percentage growth acceptable?",
      a: "Almost never in production. It is defensible only for small files with unpredictable, short-lived workloads, because the increment is a percentage of the current size — on any large file the increment becomes enormous, unpredictable, and impossible to budget free space for."
    },
    {
      q: "Why is a 10% increment dangerous on a 2 TB file?",
      a: "One event allocates 200 GB: a long allocation for a data file, minutes of zeroing for a log file, and it requires 200 GB of free space on the volume at that instant. If the free space is not there, autogrowth fails with error 1105 and the workload stops until someone frees space."
    },
    {
      q: "How do you change growth settings safely?",
      a: "Audit first with sys.master_files, size each increment to the real rate of growth (data: weeks of growth per event; log: 64–512 MB fixed), apply ALTER DATABASE … MODIFY FILE during a change window, confirm the metadata changed, and keep the next growth event under observation. No restart is required — the new increment applies at the next event."
    }
  ],

  takeaways: [
    "Autogrowth is a safety net, not a sizing strategy — every growth event costs IO and risks failure",
    "Fixed increments keep cost, timing, and free-space requirements predictable; percentage growth escalates with the file",
    "Size data increments to weeks of real growth and log increments to 64–512 MB fixed",
    "A large percentage increment is how a routine batch becomes a production stall — audit sys.master_files estate-wide",
    "Track file size and volume free space over time so growth settings change before the file becomes large"
  ]
};
