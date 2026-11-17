/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch05-01.html */

window.TOPIC = {
  id: "ch05-01",
  title: "SQL Server Editions: Express, Developer, Standard, Enterprise",

  lead: "Every SQL Server installation begins with one question — which edition? The engine is the same, but the licence, the limits, and the availability features differ enormously, and choosing wrong either wastes money or fails in production at 3 AM.",

  objectives: [
    "Describe the four mainstream SQL Server editions and their intended use",
    "Compare editions on memory, cores, database size, and availability",
    "Choose the right edition for a production workload and justify it",
    "Identify the running edition of any instance with T-SQL"
  ],

  sections: [
    {
      h: "One engine, four editions",
      html: `
<p>Microsoft ships SQL Server in several editions. All of them run the same database engine, speak the same T-SQL, and store data in the same page format — what changes is <strong>licensing, resource limits, and which features are unlocked</strong>.</p>
<table>
  <tr><th>Edition</th><th>What it is for</th></tr>
  <tr><td><strong>Express</strong></td><td>Free entry edition for small apps, embedded workloads, and development laptops. Hard limits on size and memory.</td></tr>
  <tr><td><strong>Developer</strong></td><td>Full Enterprise features, free — but licensed for <em>development and test only</em>, never production.</td></tr>
  <tr><td><strong>Standard</strong></td><td>The production workhorse. Per-core licence, sensible limits, enough availability for most businesses.</td></tr>
  <tr><td><strong>Enterprise</strong></td><td>Maximum scale and availability: full Always On, online operations, in-memory and analytics features.</td></tr>
  <tr><td><strong>Web</strong></td><td>Legacy hosting (SPLA) edition — rarely chosen for new on-premises builds.</td></tr>
</table>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Edition comparison matrix">
    <defs>
      <marker id="ed-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="155" y="16" width="140" height="40" rx="8" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="225" y="42" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="600" font-family="Segoe UI, sans-serif">Express</text>
    <rect x="300" y="16" width="140" height="40" rx="8" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="370" y="42" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="600" font-family="Segoe UI, sans-serif">Developer</text>
    <rect x="445" y="16" width="140" height="40" rx="8" fill="var(--accent)" stroke="var(--accent-strong)"/>
    <text x="515" y="42" text-anchor="middle" fill="#ffffff" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">Standard</text>
    <rect x="590" y="16" width="140" height="40" rx="8" fill="var(--accent-strong)" stroke="var(--accent-strong)"/>
    <text x="660" y="42" text-anchor="middle" fill="#ffffff" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">Enterprise</text>

    <rect x="16" y="62" width="134" height="44" rx="6" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="28" y="89" fill="var(--muted)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Licence</text>
    <rect x="16" y="110" width="134" height="44" rx="6" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="28" y="137" fill="var(--muted)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Max database</text>
    <rect x="16" y="158" width="134" height="44" rx="6" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="28" y="185" fill="var(--muted)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Max memory</text>
    <rect x="16" y="206" width="134" height="44" rx="6" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="28" y="233" fill="var(--muted)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Max cores</text>
    <rect x="16" y="254" width="134" height="44" rx="6" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="28" y="281" fill="var(--muted)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Production use</text>

    <g font-size="12" font-family="Segoe UI, sans-serif" text-anchor="middle">
      <rect x="155" y="62" width="140" height="44" fill="var(--surface)" stroke="var(--border)"/>
      <text x="225" y="89" fill="var(--text)">Free</text>
      <rect x="300" y="62" width="140" height="44" fill="var(--surface)" stroke="var(--border)"/>
      <text x="370" y="89" fill="var(--text)">Free (dev/test)</text>
      <rect x="445" y="62" width="140" height="44" fill="var(--surface)" stroke="var(--border)"/>
      <text x="515" y="89" fill="var(--text)">Per core</text>
      <rect x="590" y="62" width="140" height="44" fill="var(--surface)" stroke="var(--border)"/>
      <text x="660" y="89" fill="var(--text)">Per core</text>

      <rect x="155" y="110" width="140" height="44" fill="var(--surface)" stroke="var(--border)"/>
      <text x="225" y="137" fill="var(--amber)" font-weight="600">10 GB</text>
      <rect x="300" y="110" width="140" height="44" fill="var(--surface)" stroke="var(--border)"/>
      <text x="370" y="137" fill="var(--text)">Unlimited</text>
      <rect x="445" y="110" width="140" height="44" fill="var(--surface)" stroke="var(--border)"/>
      <text x="515" y="137" fill="var(--text)">Unlimited</text>
      <rect x="590" y="110" width="140" height="44" fill="var(--surface)" stroke="var(--border)"/>
      <text x="660" y="137" fill="var(--text)">Unlimited</text>

      <rect x="155" y="158" width="140" height="44" fill="var(--surface)" stroke="var(--border)"/>
      <text x="225" y="185" fill="var(--amber)" font-weight="600">1 GB</text>
      <rect x="300" y="158" width="140" height="44" fill="var(--surface)" stroke="var(--border)"/>
      <text x="370" y="185" fill="var(--text)">OS maximum</text>
      <rect x="445" y="158" width="140" height="44" fill="var(--surface)" stroke="var(--border)"/>
      <text x="515" y="185" fill="var(--amber)" font-weight="600">128 GB</text>
      <rect x="590" y="158" width="140" height="44" fill="var(--surface)" stroke="var(--border)"/>
      <text x="660" y="185" fill="var(--text)">OS maximum</text>

      <rect x="155" y="206" width="140" height="44" fill="var(--surface)" stroke="var(--border)"/>
      <text x="225" y="233" fill="var(--amber)" font-weight="600">4</text>
      <rect x="300" y="206" width="140" height="44" fill="var(--surface)" stroke="var(--border)"/>
      <text x="370" y="233" fill="var(--text)">OS maximum</text>
      <rect x="445" y="206" width="140" height="44" fill="var(--surface)" stroke="var(--border)"/>
      <text x="515" y="233" fill="var(--text)">24</text>
      <rect x="590" y="206" width="140" height="44" fill="var(--surface)" stroke="var(--border)"/>
      <text x="660" y="233" fill="var(--text)">128</text>

      <rect x="155" y="254" width="140" height="44" fill="var(--surface)" stroke="var(--border)"/>
      <text x="225" y="281" fill="var(--amber)" font-weight="700">No</text>
      <rect x="300" y="254" width="140" height="44" fill="var(--surface)" stroke="var(--border)"/>
      <text x="370" y="281" fill="var(--amber)" font-weight="700">Not licensed</text>
      <rect x="445" y="254" width="140" height="44" fill="var(--accent-soft)" stroke="var(--accent)"/>
      <text x="515" y="281" fill="var(--accent-strong)" font-weight="700">Yes</text>
      <rect x="590" y="254" width="140" height="44" fill="var(--accent-soft)" stroke="var(--accent)"/>
      <text x="660" y="281" fill="var(--accent-strong)" font-weight="700">Yes</text>
    </g>

    <line x1="225" y1="300" x2="445" y2="300" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#ed-arrow)"/>
    <text x="380" y="325" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Most production estates live here — Enterprise buys headroom, not speed on a small server.</text>
  </svg>
  <div class="figcaption">Figure 1 — Edition limits at a glance: Express stops quickly, Standard carries production, Enterprise removes the ceilings.</div>
</div>
`
    },
    {
      h: "Where the editions actually differ",
      html: `
<p>Limit numbers matter because they fail <em>silently</em> until the day they do not. A Standard instance caps memory at 128 GB — the buffer pool simply stops growing, performance degrades, and no error is raised.</p>
<table>
  <tr><th>Capability</th><th>Express</th><th>Developer</th><th>Standard</th><th>Enterprise</th></tr>
  <tr><td>Maximum database size</td><td>10 GB</td><td>Unlimited</td><td>Unlimited</td><td>Unlimited</td></tr>
  <tr><td>Maximum memory used by the engine</td><td>1 GB</td><td>OS maximum</td><td>128 GB</td><td>OS maximum</td></tr>
  <tr><td>Maximum cores per instance</td><td>4</td><td>OS maximum</td><td>24</td><td>128</td></tr>
  <tr><td>Availability Groups</td><td>No</td><td>Full features</td><td>Basic (2 nodes, 1 database)</td><td>Full, multiple secondaries</td></tr>
  <tr><td>Online index rebuild</td><td>No</td><td>Yes</td><td>No</td><td>Yes</td></tr>
  <tr><td>Compression, partitioning, in-memory OLTP</td><td>No</td><td>Full features</td><td>Subset (varies by version)</td><td>Full</td></tr>
  <tr><td>Permitted in production</td><td>No (by design)</td><td><strong>Prohibited</strong></td><td>Yes</td><td>Yes</td></tr>
</table>
<p>Two traps live in this table. <strong>Developer is not a cheap production licence</strong> — running it in production is a licence violation regardless of technical capability. And <strong>Basic Availability Groups in Standard are not the Enterprise feature</strong>: one database per AG, no readable secondary, no automatic seeding across sites.</p>
`
    },
    {
      h: "Choosing an edition for production",
      html: `
<p>Opinionated default, honed across many estates:</p>
<table>
  <tr><th>Workload</th><th>Choose</th><th>Why</th></tr>
  <tr><td>Internal app, &lt; 50 GB, low concurrency</td><td><strong>Standard</strong></td><td>Headroom beats saving money; Express limits will bite within a year</td></tr>
  <tr><td>OLTP core system, 128 GB RAM is enough</td><td><strong>Standard</strong></td><td>24 cores and 128 GB cover most mid-size databases</td></tr>
  <tr><td>Large OLTP, mission-critical HA, in-memory</td><td><strong>Enterprise</strong></td><td>Full AGs, online rebuilds, no memory ceiling</td></tr>
  <tr><td>Developer laptop, CI pipeline, demo</td><td><strong>Express or Developer</strong></td><td>Free and identical to production engine</td></tr>
  <tr><td>“We might need Enterprise later”</td><td><strong>Standard first</strong></td><td>Licence Enterprise when a named requirement demands it — never speculatively</td></tr>
</table>
<p>The discipline that matters: <strong>decide the edition at design time and record it in the build document</strong>. Migrating Express → Standard later is a reinstall-and-restore; migrating Standard → Enterprise is a licence key and a restart — but only if the workload actually needs it.</p>
`
    },
    {
      h: "Checking what you are running",
      html: `
<p>Never trust an inventory spreadsheet. Ask the server:</p>
<pre><code class="language-sql">SELECT @@SERVERNAME                              AS server_name,
       SERVERPROPERTY('Edition')                AS edition,
       SERVERPROPERTY('ProductVersion')         AS product_version,
       SERVERPROPERTY('ProductLevel')           AS product_level,
       SERVERPROPERTY('EngineEdition')          AS engine_edition,
       SERVERPROPERTY('IsClustered')            AS is_clustered;

-- EngineEdition: 2 = Standard, 3 = Enterprise (Developer reports 3),
--                4 = Express, 5 = Azure SQL Database</code></pre>
<pre><code class="language-sql">-- Memory ceiling in effect on this instance (MB)
SELECT name, value_in_use
FROM   sys.configurations
WHERE  name = 'max server memory (MB)';</code></pre>
<p>The second query matters after consolidation: Express and Standard both <em>cap</em> memory by edition even when <code>max server memory</code> is set higher. The effective limit is whichever is lower.</p>
`
    },
    {
      h: "Licensing realities",
      html: `
<p>Technical selection and commercial selection are the same decision — treat them together.</p>
<ul>
  <li><strong>Per-core licensing</strong> — Standard and Enterprise are licensed by physical core, with minimums and socket caps; virtualised servers may be licensed per VM or per host</li>
  <li><strong>Software Assurance</strong> — buys upgrade rights, passive failover rights for DR, and Extended Security Updates after end of support</li>
  <li><strong>Passive replicas</strong> — a secondary used only for failover is generally covered without extra licence, but <em>readable</em> secondaries need their own licence</li>
  <li><strong>Developer edition</strong> — full features, zero production rights; ideal for a test environment that mirrors production exactly</li>
</ul>
<p>Before any purchase, capture: core count (physical, not vCPUs), socket count, number of production instances, and whether readable secondaries are required. That single paragraph prevents 90 % of licensing surprises.</p>
`
    }
  ],

  scenario: {
    title: "3:40 AM — production inserts start failing with ‘database is full’",
    html: `
<p>An ISV shipped their product on SQL Server Express “to keep costs down”. For 14 months it worked. At 3:40 AM the order database crossed 10 GB; every INSERT began failing with error 1105, and by 6 AM the client's fulfilment system was down. The team's first instinct was disk failure — it was not: the volume had 400 GB free. The ceiling was the <strong>edition</strong>.</p>
<p>Resolution under pressure: restore a copy onto a server with SQL Server Standard, update connection strings, and validate the workload — Express could not simply be “unlocked”. Root cause was a decision made 14 months earlier with no size projection and no edition review. Prevention: edition and 5-year size projections are now mandatory fields in the deployment template, and an alert fires at 70 % of any edition limit.</p>
`
  },

  interview: [
    {
      q: "When would you choose Standard over Enterprise for a production system?",
      a: "When the workload fits Standard's ceilings — up to 128 GB memory, 24 cores, single-database basic availability needs — and there is no requirement for online index rebuilds, readable secondaries, or full in-memory features. Start Standard; move to Enterprise only when a named, funded requirement demands it."
    },
    {
      q: "Is Developer edition acceptable as a cheap production option?",
      a: "No. Developer has Enterprise features but its licence permits development and test only. Running it in production is a licence violation, and an audit will find it — the engine even reports Enterprise capabilities, which is exactly how such installations go unnoticed until the audit."
    },
    {
      q: "A Standard instance has max server memory set to 200 GB on a 256 GB server. Will it use 200 GB?",
      a: "No — Standard caps engine memory at 128 GB regardless of the configuration value, so the effective ceiling is 128 GB. The DBA must recognise edition limits as a hard constraint that configuration cannot override."
    }
  ],

  takeaways: [
    "Express (10 GB, 1 GB RAM, 4 cores), Developer (Enterprise features, no production rights), Standard (128 GB, 24 cores), Enterprise (no ceilings, full availability)",
    "Edition limits fail silently — memory and CPU simply stop scaling, with no error",
    "Standard is the production default; Enterprise is justified only by named requirements",
    "Developer edition in production is a licence violation, not a cost saving",
    "Decide the edition at design time and verify it with SERVERPROPERTY on the live instance"
  ]
};
