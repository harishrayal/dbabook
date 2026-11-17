/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch01-01.html */

window.TOPIC = {
  id: "ch01-01",
  title: "What Is a Database Administrator?",

  lead: "A Database Administrator is the person responsible for keeping an organisation's data available, correct, secure, and performant — the role that owns the database when everything else goes wrong.",

  objectives: [
    "Define the DBA role and what it owns",
    "Understand why the role exists in production organisations",
    "Distinguish DBA responsibilities from developer responsibilities",
    "Recognise the core competencies a DBA must build"
  ],

  sections: [
    {
      h: "Defining the role",
      html: `
<p>A <strong>Database Administrator (DBA)</strong> is the technical owner of a database system. Where a developer writes the application that <em>uses</em> data, the DBA is accountable for the platform that <em>stores, protects, and serves</em> that data to every application, report, and integration in the organisation.</p>
<p>The simplest way to understand the role: when data is slow, lost, corrupted, leaked, or unavailable, the DBA is the person paged. The role exists because databases are shared, stateful infrastructure — one misconfigured setting or one missed backup affects every application that depends on it.</p>
<blockquote>A developer asks “does this query work?”. A DBA asks “will this database still be running, fast, and recoverable in six months at 3× today's load?”</blockquote>
<p>The DBA owns the full lifecycle of the database platform:</p>
<ul>
  <li><strong>Build</strong> — install, configure, and provision instances and databases</li>
  <li><strong>Protect</strong> — backups, recovery, security, and permissions</li>
  <li><strong>Sustain</strong> — monitoring, maintenance, capacity, and patching</li>
  <li><strong>Optimise</strong> — performance tuning, indexing, and query tuning</li>
  <li><strong>Recover</strong> — incident response, restoration, and disaster recovery</li>
</ul>
`
    },
    {
      h: "What a DBA actually owns",
      html: `
<p>Responsibilities fall into six domains. In a small company one DBA covers all of them; in an enterprise they may be split across specialised DBA roles (covered in the next topic).</p>
<table>
  <tr><th>Domain</th><th>Typical ownership</th></tr>
  <tr><td><strong>Availability</strong></td><td>Uptime, failover, recovery, on-call response</td></tr>
  <tr><td><strong>Protection</strong></td><td>Backup strategy, restore testing, disaster recovery (RPO/RTO)</td></tr>
  <tr><td><strong>Security</strong></td><td>Logins, roles, least privilege, auditing, patching</td></tr>
  <tr><td><strong>Performance</strong></td><td>Execution plans, indexes, waits, capacity</td></tr>
  <tr><td><strong>Change</strong></td><td>Deployments, schema reviews, configuration changes in production</td></tr>
  <tr><td><strong>Operations</strong></td><td>Monitoring, maintenance jobs, health reports, documentation</td></tr>
</table>
<div class="figure">
  <svg viewBox="0 0 760 350" role="img" aria-label="DBA responsibility hub diagram">
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="290" y="140" width="180" height="70" rx="12" fill="var(--accent)" />
    <text x="380" y="172" text-anchor="middle" fill="#ffffff" font-size="20" font-weight="700" font-family="Segoe UI, sans-serif">DBA</text>
    <text x="380" y="196" text-anchor="middle" fill="#dbeafe" font-size="12.5" font-family="Segoe UI, sans-serif">owns the data platform</text>

    <rect x="30" y="30" width="200" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="130" y="58" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="600" font-family="Segoe UI, sans-serif">Applications</text>
    <text x="130" y="79" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">Dev teams · APIs · reports</text>

    <rect x="530" y="30" width="200" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="630" y="58" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="600" font-family="Segoe UI, sans-serif">Infrastructure</text>
    <text x="630" y="79" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">Windows · storage · network</text>

    <rect x="30" y="250" width="200" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="130" y="278" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="600" font-family="Segoe UI, sans-serif">Security &amp; Compliance</text>
    <text x="130" y="299" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">Access · audit · patching</text>

    <rect x="530" y="250" width="200" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="630" y="278" text-anchor="middle" fill="var(--text)" font-size="14.5" font-weight="600" font-family="Segoe UI, sans-serif">Backup &amp; DR</text>
    <text x="630" y="299" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">RPO · RTO · restore tests</text>

    <line x1="230" y1="70" x2="300" y2="145" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#arrow)"/>
    <line x1="530" y1="70" x2="460" y2="145" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#arrow)"/>
    <line x1="230" y1="285" x2="300" y2="210" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#arrow)"/>
    <line x1="530" y1="285" x2="460" y2="210" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#arrow)"/>

    <text x="380" y="335" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Every dependency points back to the DBA — that is why the role is accountable, not advisory.</text>
  </svg>
  <div class="figcaption">Figure 1 — The DBA sits at the centre of applications, infrastructure, security, and recovery.</div>
</div>
`
    },
    {
      h: "How the role differs from a developer's",
      html: `
<p>Both roles write SQL, but the incentives differ. A developer optimises for shipping features; a DBA optimises for the database surviving years of feature shipping.</p>
<table>
  <tr><th>Concern</th><th>Developer</th><th>DBA</th></tr>
  <tr><td>Primary goal</td><td>Ship working features</td><td>Keep data available, fast, recoverable</td></tr>
  <tr><td>Scope</td><td>One application</td><td>Every database on the instance/estate</td></tr>
  <tr><td>Change style</td><td>Frequent deploys</td><td>Governed, reviewed, windowed changes</td></tr>
  <tr><td>Failure response</td><td>Fix the code, redeploy</td><td>Restore, recover, investigate, report</td></tr>
  <tr><td>Success metric</td><td>Features delivered</td><td>Uptime, RPO/RTO met, zero data loss</td></tr>
</table>
<p>In practice the two roles work <em>together</em>: the DBA reviews schema changes and indexes before release, the developer writes efficient queries, and both share ownership of performance in production.</p>
`
    },
    {
      h: "Core competencies",
      html: `
<p>A competent production DBA builds skill across four layers:</p>
<ul>
  <li><strong>T-SQL mastery</strong> — you cannot administer what you cannot query: DMVs, backup history, wait statistics</li>
  <li><strong>Windows &amp; infrastructure</strong> — services, accounts, storage, networking, Event Viewer</li>
  <li><strong>Operations discipline</strong> — monitoring, runbooks, incident response, change control</li>
  <li><strong>Judgement under pressure</strong> — production decisions are made with incomplete information and a running clock</li>
</ul>
<p>This roadmap builds those layers in order: fundamentals → architecture → operations → performance → availability → enterprise practice.</p>
<p>Every DBA lives in the catalog views and DMVs. Even at the very start, you should be comfortable asking the server what it knows about itself — this is the query many DBAs run on day one of a new job:</p>
<pre><code class="language-sql">-- What instance am I on, what version, and what is its current state?
SELECT @@SERVERNAME                       AS server_name,
       SERVERPROPERTY('ProductVersion')   AS product_version,
       SERVERPROPERTY('ProductLevel')     AS product_level,
       SERVERPROPERTY('Edition')          AS edition,
       (SELECT count(*) FROM sys.databases) AS database_count;

-- Which SQL Server services are running on this box?
SELECT servicename, status_desc, service_type, startup_type_desc
FROM   sys.dm_server_services;</code></pre>
<p>Learning to interrogate the instance directly — rather than relying only on SSMS dialogs — is the habit that separates a career DBA from someone who merely clicks through wizards.</p>
`
    },
    {
      h: "Deeper dive: What Is a Database Administrator?",
      html: `
<p>This section consolidates <strong>What Is a Database Administrator?</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Environments follow a promotion path: development for building, test for functional verification, UAT for business sign-off, and production for live traffic. Each promotion is a gate where schema and configuration changes are reviewed, not copied blindly.</p>
<p>The DBA's most important artefact is a tested restore. A backup policy that has never been exercised is an assumption, not a strategy. Regular restore tests into an isolated instance are the only proof recovery objectives can be met.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>What Is a Database Administrator? sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Domain</th><th>Typical ownership</th><th>Primary metric</th></tr>
  <tr><td>Availability</td><td>Uptime, failover, on-call response</td><td>99.9%+ uptime</td></tr>
  <tr><td>Protection</td><td>Backups, restore testing, DR</td><td>RPO / RTO met</td></tr>
  <tr><td>Security</td><td>Logins, roles, least privilege, auditing</td><td>Zero unauthorised access</td></tr>
  <tr><td>Performance</td><td>Plans, indexes, waits, capacity</td><td>Sub-second response</td></tr>
</table>
<p>Availability and reliability are engineered, not hoped for: redundant hardware, high availability features, monitored health and rehearsed failover all contribute to an uptime figure the business can rely on.</p>
<p>Use the following as a starting point when investigating What Is a Database Administrator?. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- What Is a Database Administrator?
-- Check recent backup history for every database
SELECT d.name AS database_name,
       max(b.backup_finish_date) AS last_backup
FROM   sys.databases d
LEFT JOIN msdb.dbo.backupset b
       ON b.database_name = d.name
GROUP BY d.name
ORDER BY d.name;</code></pre>
<p>Incident management is a discipline. Severity levels, clear escalation paths, calm communication and blameless post-incident reviews turn a chaotic outage into a learning event with documented prevention measures.</p>
      `,
    }
  ],

  scenario: {
    title: "The 9:15 AM deploy that took down checkout",
    html: `
<p>An e-commerce company releases a new feature at 9:15 AM. Within minutes the checkout service starts timing out. The developer's queries look fine in dev. On production, the DBA finds a new stored procedure doing an unindexed scan of a 40-million-row table — inside a transaction that also holds locks on the orders table. Every other order operation queues behind it.</p>
<p>The DBA's actions: identify the head blocker, kill the offending session (with approval), roll back the failed transaction, and add a covering index — then feed the root cause back into the deployment review process. <strong>Availability was lost not because of hardware, but because of an unreviewed change.</strong> That is the DBA's real job: owning the consequences of change in production.</p>
`
  },

  interview: [
    {
      q: "What is the single most important responsibility of a DBA?",
      a: "Protecting the availability and integrity of the organisation's data — which in practice means a tested backup/recovery capability, because every other responsibility can be undone except data loss."
    },
    {
      q: "How is a DBA different from a backend developer?",
      a: "A developer owns application logic for one system; the DBA owns the shared data platform for all systems — configuration, security, performance, backup, and recovery — and is accountable when data is slow, lost, or exposed."
    },
    {
      q: "You join a company and find no restore has ever been tested. What do you do first?",
      a: "Document the risk immediately, then schedule a restore test of the most critical database into an isolated instance. A backup policy without a restore test is an assumption, not a strategy — and it is a business risk, not just a technical one."
    }
  ],

  takeaways: [
    "The DBA is the technical owner of the data platform: build, protect, sustain, optimise, recover",
    "The role spans six domains — availability, protection, security, performance, change, operations",
    "Developers optimise for shipping features; DBAs optimise for surviving them in production",
    "Core competencies: T-SQL, Windows/infrastructure, operations discipline, judgement under pressure",
    "When data is slow, lost, corrupted, or leaked — the DBA is accountable"
  ]
};
