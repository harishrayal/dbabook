/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch06-13.html */

window.TOPIC = {
  id: "ch06-13",
  title: "Initial Database Sizing",

  lead: "A database created with sensible initial sizes grows calmly for years; one created with inherited defaults spends its first months in constant autogrowth, log churn, and fire drills. Initial sizing is a forecast of the workload, not a guess about disk space.",

  objectives: [
    "Explain why initial file sizes matter after the first week",
    "Estimate data and log volume from business drivers",
    "Plan data files, log files, and filegroups at creation",
    "Create a database with right-sized files and fixed growth"
  ],

  sections: [
    {
      h: "Why the first size matters",
      html: `
<p>When you create a database, you choose the starting size of every file and the increment it grows by. Those two decisions determine how the database behaves for its first year:</p>
<ul>
  <li><strong>Undersized files</strong> mean frequent autogrowth during business hours — IO stalls on the live volume, and for logs, churn of tiny virtual log files that slows every truncation afterwards.</li>
  <li><strong>Oversized files</strong> waste space on a volume that other databases, backups, and exports also need — space that is painful to reclaim later (see Shrinking).</li>
  <li><strong>Wrong layout</strong> (data and log on one volume, no filegroup for archival data) is expensive to fix once the database carries production traffic.</li>
</ul>
<p>The initial size is also a communication artefact: it tells the storage team what this database needs on day one, and it anchors every capacity conversation that follows.</p>
`
    },
    {
      h: "Estimating data volume",
      html: `
<p>Data sizing is arithmetic driven by the business, not by the installer:</p>
<p><strong>rows per day × row + index width × retention days × overhead factor</strong></p>
<p>The overhead factor (typically 1.5–2) covers indexes, forwarded rows, page splits, and free space inside pages. Worked example for an order system:</p>
<ul>
  <li>250,000 orders/day, average row plus indexes ≈ 400 bytes → about 100 MB per day</li>
  <li>Two years of retention → 730 days × 100 MB ≈ <strong>73 GB</strong> of user data</li>
  <li>× 1.5 for indexes and overhead ≈ <strong>110 GB</strong> — then add headroom for the growth you cannot predict (new features, integrations, a compliance rule nobody has written yet)</li>
</ul>
<p>Validate the estimate against a comparable existing database if one exists: how fast did <em>that</em> database actually grow in its first year? Drivers worth interviewing for: user counts, transaction rates, retention and purge policies, scheduled bulk imports, and any product decision that multiplies volume (new regions, new SKUs, longer history).</p>
`
    },
    {
      h: "Sizing the log",
      html: `
<p>The log is <strong>not</strong> a percentage of the data — it is sized by transaction behaviour:</p>
<ul>
  <li><strong>Throughput and recovery model.</strong> In full recovery with frequent log backups, the log only needs to hold work since the last backup, so it can stay modest. In simple recovery with large bulk operations, it must absorb the whole operation.</li>
  <li><strong>The largest single transaction.</strong> A bulk insert, an index rebuild, or one long-running report transaction must fit — an undersized log cannot truncate past an active transaction.</li>
  <li><strong>Growth increments.</strong> Small increments (1 MB) create thousands of VLFs; huge increments create long zeroing stalls. Fixed 64–512 MB increments keep VLF counts healthy as the log grows.</li>
</ul>
<p>A practical starting point for OLTP systems with regular log backups is a log of roughly 10–20% of the data file, reviewed after the first month of real telemetry rather than trusted as a law of nature.</p>
`
    },
    {
      h: "Filegroups and file layout",
      html: `
<p>Decide the physical layout at creation, because moving files later costs downtime:</p>
<ul>
  <li><strong>Data and log on separate volumes</strong> (ideally separate from tempdb and backups too) so a log write burst never competes with a reporting scan.</li>
  <li><strong>Consider a second filegroup</strong> if archival or partitioned data is already planned — adding a filegroup later is easy, migrating data into it is not.</li>
  <li><strong>For large filegroups</strong>, plan several equal-sized files so space allocation and growth spread across them; for small databases, one data file is fine.</li>
  <li><strong>Do not create files “just in case”.</strong> Every file needs its own growth monitoring, and tempdb-style file counts only help when allocation contention actually exists.</li>
</ul>
<p>Whatever you choose, write it down: the file layout, the reasoning, and the date of the first sizing review.</p>
`
    },
    {
      h: "Creating the database the right way",
      html: `
<p>Set initial sizes and fixed growth in the <code>CREATE DATABASE</code> statement itself, so the defaults never get a chance to apply:</p>
<pre><code class="language-sql">CREATE DATABASE [SalesDB]
 ON PRIMARY
 ( NAME     = N'SalesDB_Data',
   FILENAME = N'E:\\Data\\SalesDB_Data.mdf',
   SIZE     = 163840MB,          -- ~160 GB: 12 months of forecast
   FILEGROWTH = 512MB ),
 FILEGROUP [FG_Sales_Archive]
 ( NAME     = N'SalesDB_Archive',
   FILENAME = N'E:\\Data\\SalesDB_Archive.ndf',
   SIZE     = 20480MB,
   FILEGROWTH = 256MB )
 LOG ON
 ( NAME     = N'SalesDB_Log',
   FILENAME = N'F:\\Log\\SalesDB_Log.ldf',
   SIZE     = 16384MB,           -- sized from transaction behaviour
   FILEGROWTH = 128MB );
GO</code></pre>
<table>
  <tr><th>Workload</th><th>Data on day 1</th><th>Log on day 1</th><th>Data growth</th><th>Log growth</th></tr>
  <tr><td>Small internal application</td><td>5–20 GB</td><td>1–2 GB</td><td>128–256 MB</td><td>64 MB</td></tr>
  <tr><td>Steady OLTP system</td><td>50–200 GB</td><td>8–32 GB</td><td>256–512 MB</td><td>128–256 MB</td></tr>
  <tr><td>Large warehouse / archive</td><td>500 GB–5 TB</td><td>16–64 GB</td><td>1–2 GB</td><td>512 MB</td></tr>
</table>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Initial sizing workflow from workload drivers to created database">
    <defs>
      <marker id="size-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <text x="380" y="24" text-anchor="middle" fill="var(--text)" font-size="15.5" font-weight="700" font-family="Segoe UI, sans-serif">Sizing is arithmetic, not instinct</text>

    <rect x="20" y="52" width="180" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="110" y="76" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Workload drivers</text>
    <text x="110" y="97" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">250k orders/day · 400 B</text>

    <rect x="20" y="140" width="180" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="110" y="164" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Retention policy</text>
    <text x="110" y="185" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">24 months of history</text>

    <rect x="20" y="228" width="180" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="110" y="252" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Comparable databases</text>
    <text x="110" y="273" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">actual year-1 growth</text>

    <rect x="256" y="110" width="220" height="120" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="366" y="140" text-anchor="middle" fill="var(--accent-strong)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">Estimate</text>
    <text x="366" y="166" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">rows × width × days × 1.5</text>
    <text x="366" y="192" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">73 GB data → 110 GB with</text>
    <text x="366" y="211" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">indexes, plus headroom</text>

    <rect x="542" y="52" width="198" height="100" rx="10" fill="var(--surface-2)" stroke="var(--accent)"/>
    <text x="641" y="80" text-anchor="middle" fill="var(--accent-strong)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">CREATE DATABASE</text>
    <text x="641" y="104" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">data 160 GB · log 16 GB</text>
    <text x="641" y="126" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">growth 512 MB / 128 MB</text>

    <rect x="542" y="188" width="198" height="100" rx="10" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="641" y="216" text-anchor="middle" fill="var(--amber)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Review at month 1</text>
    <text x="641" y="240" text-anchor="middle" fill="var(--text)" font-size="12" font-family="Segoe UI, sans-serif">compare forecast vs actual</text>
    <text x="641" y="262" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">alert when 70 % reached</text>

    <line x1="200" y1="82" x2="254" y2="130" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#size-arrow)"/>
    <line x1="200" y1="170" x2="254" y2="170" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#size-arrow)"/>
    <line x1="200" y1="258" x2="254" y2="212" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#size-arrow)"/>
    <line x1="476" y1="145" x2="540" y2="110" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#size-arrow)"/>
    <line x1="476" y1="196" x2="540" y2="230" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#size-arrow)"/>

    <text x="380" y="326" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Size for the next 12–18 months, then re-forecast from real telemetry every quarter.</text>
  </svg>
  <div class="figcaption">Figure 1 — Drivers feed the estimate; the estimate becomes the initial files, then real telemetry corrects it.</div>
</div>
<p>These ranges are starting points, not answers. Revisit them with measured growth after the first month (see Database Capacity Planning) and adjust the increment — not the panic — if reality runs ahead of the forecast.</p>
`
    }
  ],

  scenario: {
    title: "Week three: the new CRM database triggered forty growth events a day",
    html: `
<p>A CRM database was created from an old build script with default sizes inherited from <code>model</code> and 1 MB autogrowth increments. For two weeks nothing was noticed. Then a marketing import doubled the row count, and the data file began growing several times an hour while the log — growing in 1 MB steps — accumulated thousands of VLFs. Users reported ten-second save times during the import window, and the nightly maintenance job overran by 90 minutes.</p>
<p>Resolution: during a change window the DBA extended the data file to the 12-month forecast, set data growth to 512 MB and log growth to 128 MB, and let the log settle at its new increment rather than shrinking it (which would only have fragmented it). Prevention: a creation standard with required initial sizes and fixed growth, a build-review checklist, and an alert when any file grows more than twice a week. <strong>The database was not too small for the business — it was sized by default rather than by forecast.</strong></p>
`
  },

  interview: [
    {
      q: "How do you estimate the data volume for a brand-new database?",
      a: "Multiply the business driver rate (rows or events per day) by the average row plus index width, by the retention window, then apply an overhead factor of roughly 1.5–2 for indexes and page free space. Validate against a comparable existing database's real first-year growth, size for 12–18 months, and re-forecast from telemetry after the first month."
    },
    {
      q: "Why not create it small and let autogrowth handle it?",
      a: "Because autogrowth is a stall: data events cost IO on the live volume, log events zero space while log writes queue behind them, small log increments create VLF churn, and any growth event can fail if the volume lacks free space. Autogrowth should be a safety net for the remainder of the plan, not the plan itself."
    },
    {
      q: "How big should the transaction log be?",
      a: "It is driven by transaction behaviour, not data volume: the largest single transaction, the transaction rate, the recovery model, and log backup frequency. In full recovery with frequent backups the log can stay small because it only needs to hold work since the last backup; bulk workloads in simple recovery need enough log to complete the operation. Use fixed 64–512 MB growth to keep VLF counts healthy."
    }
  ],

  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Why the first size matters”?",
      "options": [
        "The initial size is also a communication artefact: it tells the storage team what this database needs on day one, and it anchors every capacity conversation that follows.",
        "Undersized files",
        "When you create a database, you choose the starting size of every file and the increment it grows by."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “When you create a database, you choose the starting size of every file and the increment it grows by. Those two decisions determine how the database behaves for its first year:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Estimating data volume”?",
      "options": [
        "Oversized files",
        "Data sizing is arithmetic driven by the business, not by the installer:",
        "Undersized files"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Data sizing is arithmetic driven by the business, not by the installer:”"
    },
    {
      "question": "Complete the lesson statement: “The log is _____ a percentage of the data — it is sized by transaction behaviour:”",
      "options": [
        "not",
        "The initial size is also a communication artefact: it tells the storage team what this database needs on day one, and it anchors every capacity conversation that follows.",
        "Data sizing is arithmetic driven by the business, not by the installer:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The log is not a percentage of the data — it is sized by transaction behaviour:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Filegroups and file layout”?",
      "options": [
        "Wrong layout",
        "73 GB",
        "Decide the physical layout at creation, because moving files later costs downtime:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Decide the physical layout at creation, because moving files later costs downtime:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Creating the database the right way”?",
      "options": [
        "110 GB",
        "Set initial sizes and fixed growth in the CREATE DATABASE statement itself, so the defaults never get a chance to apply:",
        "73 GB"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Set initial sizes and fixed growth in the CREATE DATABASE statement itself, so the defaults never get a chance to apply:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Why the first size matters”?",
      "options": [
        "The initial size is also a communication artefact: it tells the storage team what this database needs on day one, and it anchors every capacity conversation that follows.",
        "110 GB",
        "Throughput and recovery model."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The initial size is also a communication artefact: it tells the storage team what this database needs on day one, and it anchors every capacity conversation that follows.”"
    },
    {
      "question": "Complete the lesson statement: “_____”",
      "options": [
        "Decide the physical layout at creation, because moving files later costs downtime:",
        "Whatever you choose, write it down: the file layout, the reasoning, and the date of the first sizing review.",
        "rows per day × row + index width × retention days × overhead factor"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “rows per day × row + index width × retention days × overhead factor”"
    },
    {
      "question": "Which fact is covered in the lesson section “Sizing the log”?",
      "options": [
        "Growth increments.",
        "A practical starting point for OLTP systems with regular log backups is a log of roughly 10–20% of the data file, reviewed after the first month of real telemetry rather than…",
        "The largest single transaction."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A practical starting point for OLTP systems with regular log backups is a log of roughly 10–20% of the data file, reviewed after the first month of real telemetry rather than trusted as a law of nature.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Filegroups and file layout”?",
      "options": [
        "Whatever you choose, write it down: the file layout, the reasoning, and the date of the first sizing review.",
        "Growth increments.",
        "Data and log on separate volumes"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Whatever you choose, write it down: the file layout, the reasoning, and the date of the first sizing review.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Creating the database the right way”?",
      "options": [
        "Data and log on separate volumes",
        "Consider a second filegroup",
        "These ranges are starting points, not answers."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “These ranges are starting points, not answers. Revisit them with measured growth after the first month (see Database Capacity Planning) and adjust the increment — not the panic — if reality runs ahead of the forecast.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Why the first size matters”?",
      "options": [
        "The initial size is also a communication artefact: it tells the storage team what this database needs on day one, and it anchors every capacity conversation that follows.",
        "Undersized files",
        "When you create a database, you choose the starting size of every file and the increment it grows by."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “When you create a database, you choose the starting size of every file and the increment it grows by. Those two decisions determine how the database behaves for its first year:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Estimating data volume”?",
      "options": [
        "Oversized files",
        "Data sizing is arithmetic driven by the business, not by the installer:",
        "Undersized files"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Data sizing is arithmetic driven by the business, not by the installer:”"
    },
    {
      "question": "Complete the lesson statement: “The log is _____ a percentage of the data — it is sized by transaction behaviour:”",
      "options": [
        "not",
        "The initial size is also a communication artefact: it tells the storage team what this database needs on day one, and it anchors every capacity conversation that follows.",
        "Data sizing is arithmetic driven by the business, not by the installer:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The log is not a percentage of the data — it is sized by transaction behaviour:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Filegroups and file layout”?",
      "options": [
        "Wrong layout",
        "73 GB",
        "Decide the physical layout at creation, because moving files later costs downtime:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Decide the physical layout at creation, because moving files later costs downtime:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Creating the database the right way”?",
      "options": [
        "110 GB",
        "Set initial sizes and fixed growth in the CREATE DATABASE statement itself, so the defaults never get a chance to apply:",
        "73 GB"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Set initial sizes and fixed growth in the CREATE DATABASE statement itself, so the defaults never get a chance to apply:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Why the first size matters”?",
      "options": [
        "The initial size is also a communication artefact: it tells the storage team what this database needs on day one, and it anchors every capacity conversation that follows.",
        "110 GB",
        "Throughput and recovery model."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The initial size is also a communication artefact: it tells the storage team what this database needs on day one, and it anchors every capacity conversation that follows.”"
    },
    {
      "question": "Complete the lesson statement: “_____”",
      "options": [
        "Decide the physical layout at creation, because moving files later costs downtime:",
        "Whatever you choose, write it down: the file layout, the reasoning, and the date of the first sizing review.",
        "rows per day × row + index width × retention days × overhead factor"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “rows per day × row + index width × retention days × overhead factor”"
    },
    {
      "question": "Which fact is covered in the lesson section “Sizing the log”?",
      "options": [
        "Growth increments.",
        "A practical starting point for OLTP systems with regular log backups is a log of roughly 10–20% of the data file, reviewed after the first month of real telemetry rather than…",
        "The largest single transaction."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A practical starting point for OLTP systems with regular log backups is a log of roughly 10–20% of the data file, reviewed after the first month of real telemetry rather than trusted as a law of nature.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Filegroups and file layout”?",
      "options": [
        "Whatever you choose, write it down: the file layout, the reasoning, and the date of the first sizing review.",
        "Growth increments.",
        "Data and log on separate volumes"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Whatever you choose, write it down: the file layout, the reasoning, and the date of the first sizing review.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Creating the database the right way”?",
      "options": [
        "Data and log on separate volumes",
        "Consider a second filegroup",
        "These ranges are starting points, not answers."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “These ranges are starting points, not answers. Revisit them with measured growth after the first month (see Database Capacity Planning) and adjust the increment — not the panic — if reality runs ahead of the forecast.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “Why the first size matters”?",
      "options": [
        "The initial size is also a communication artefact: it tells the storage team what this database needs on day one, and it anchors every capacity conversation that follows.",
        "Undersized files",
        "When you create a database, you choose the starting size of every file and the increment it grows by."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “When you create a database, you choose the starting size of every file and the increment it grows by. Those two decisions determine how the database behaves for its first year:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Estimating data volume”?",
      "options": [
        "Oversized files",
        "Data sizing is arithmetic driven by the business, not by the installer:",
        "Undersized files"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Data sizing is arithmetic driven by the business, not by the installer:”"
    },
    {
      "question": "Complete the lesson statement: “The log is _____ a percentage of the data — it is sized by transaction behaviour:”",
      "options": [
        "not",
        "The initial size is also a communication artefact: it tells the storage team what this database needs on day one, and it anchors every capacity conversation that follows.",
        "Data sizing is arithmetic driven by the business, not by the installer:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The log is not a percentage of the data — it is sized by transaction behaviour:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Filegroups and file layout”?",
      "options": [
        "Wrong layout",
        "73 GB",
        "Decide the physical layout at creation, because moving files later costs downtime:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Decide the physical layout at creation, because moving files later costs downtime:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Creating the database the right way”?",
      "options": [
        "110 GB",
        "Set initial sizes and fixed growth in the CREATE DATABASE statement itself, so the defaults never get a chance to apply:",
        "73 GB"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Set initial sizes and fixed growth in the CREATE DATABASE statement itself, so the defaults never get a chance to apply:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Why the first size matters”?",
      "options": [
        "The initial size is also a communication artefact: it tells the storage team what this database needs on day one, and it anchors every capacity conversation that follows.",
        "110 GB",
        "Throughput and recovery model."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The initial size is also a communication artefact: it tells the storage team what this database needs on day one, and it anchors every capacity conversation that follows.”"
    },
    {
      "question": "Complete the lesson statement: “_____”",
      "options": [
        "Decide the physical layout at creation, because moving files later costs downtime:",
        "Whatever you choose, write it down: the file layout, the reasoning, and the date of the first sizing review.",
        "rows per day × row + index width × retention days × overhead factor"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “rows per day × row + index width × retention days × overhead factor”"
    },
    {
      "question": "Which fact is covered in the lesson section “Sizing the log”?",
      "options": [
        "Growth increments.",
        "A practical starting point for OLTP systems with regular log backups is a log of roughly 10–20% of the data file, reviewed after the first month of real telemetry rather than…",
        "The largest single transaction."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A practical starting point for OLTP systems with regular log backups is a log of roughly 10–20% of the data file, reviewed after the first month of real telemetry rather than trusted as a law of nature.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Filegroups and file layout”?",
      "options": [
        "Whatever you choose, write it down: the file layout, the reasoning, and the date of the first sizing review.",
        "Growth increments.",
        "Data and log on separate volumes"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Whatever you choose, write it down: the file layout, the reasoning, and the date of the first sizing review.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Creating the database the right way”?",
      "options": [
        "Data and log on separate volumes",
        "Consider a second filegroup",
        "These ranges are starting points, not answers."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “These ranges are starting points, not answers. Revisit them with measured growth after the first month (see Database Capacity Planning) and adjust the increment — not the panic — if reality runs ahead of the forecast.”"
    }
  ],
  takeaways: [
    "Initial sizing is a workload forecast — row rate × width × retention × overhead, plus headroom",
    "Undersized files cause autogrowth storms and VLF churn; oversized files strand scarce volume space",
    "Size the log from transaction behaviour (largest transaction, throughput, recovery model), not as a percentage of data",
    "Choose the physical layout — separate data/log volumes, filegroups — at creation, when it is cheap",
    "Bake sizes and fixed growth into CREATE DATABASE, then re-forecast from measured growth after month one"
  ]
};
