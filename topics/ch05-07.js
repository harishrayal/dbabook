/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch05-07.html */

window.TOPIC = {
  id: "ch05-07",
  title: "SQL Server Installation Components",

  lead: "Setup offers a long feature list — Database Engine, Analysis Services, Reporting Services, Integration Services, shared tools — and the right answer in production is usually to install less than you are offered.",

  objectives: [
    "Distinguish server features from shared features",
    "Describe the purpose of each major SQL Server component",
    "Decide which features a production server actually needs",
    "Understand where client tools fit versus server features",
    "Verify what is installed on an instance"
  ],

  sections: [
    {
      h: "Features versus shared features",
      html: `
<p>SQL Server setup groups what you install into two categories:</p>
<ul>
  <li><strong>Server features</strong> — services that run on this machine and do work: the Database Engine, Analysis Services, Reporting Services, Integration Services</li>
  <li><strong>Shared features</strong> — components installed once and used by several features or instances: connectivity SDK, documentation, Scale Out components, Master Data Services, Distributed Replay</li>
</ul>
<p>The distinction matters operationally: server features get their own services, ports, patching, and monitoring; shared features mostly do not. Every feature you add is attack surface, patch surface, and something that must be explained in the next security review.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="SQL Server feature groups">
    <defs>
      <marker id="feat-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="250" y="20" width="260" height="52" rx="10" fill="var(--accent)" stroke="var(--accent-strong)"/>
    <text x="380" y="52" text-anchor="middle" fill="#ffffff" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">SQL Server setup</text>

    <rect x="30" y="120" width="330" height="180" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="195" y="146" text-anchor="middle" fill="var(--accent-strong)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Server features (own services)</text>
    <g font-size="11.5" fill="var(--text)" font-family="Segoe UI, sans-serif" text-anchor="middle">
      <rect x="45" y="160" width="145" height="40" rx="7" fill="var(--surface)" stroke="var(--border)"/>
      <text x="117" y="177" font-weight="600">Database Engine</text>
      <text x="117" y="193">Replication · Full-Text</text>
      <rect x="200" y="160" width="145" height="40" rx="7" fill="var(--surface)" stroke="var(--border)"/>
      <text x="272" y="177" font-weight="600">Analysis Services</text>
      <text x="272" y="193">semantic models</text>
      <rect x="45" y="212" width="145" height="40" rx="7" fill="var(--surface)" stroke="var(--border)"/>
      <text x="117" y="229" font-weight="600">Reporting Services</text>
      <text x="117" y="245">reports · portal · subs</text>
      <rect x="200" y="212" width="145" height="40" rx="7" fill="var(--surface)" stroke="var(--border)"/>
      <text x="272" y="229" font-weight="600">Integration Services</text>
      <text x="272" y="245">ETL · scale out</text>
      <text x="195" y="285" fill="var(--muted)" font-size="11">patched, monitored, exposed individually</text>
    </g>

    <rect x="400" y="120" width="330" height="180" rx="12" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.8"/>
    <text x="565" y="146" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Shared features &amp; tools</text>
    <g font-size="11.5" fill="var(--muted)" font-family="Segoe UI, sans-serif" text-anchor="middle">
      <rect x="415" y="160" width="145" height="40" rx="7" fill="var(--surface)" stroke="var(--border)"/>
      <text x="487" y="177" font-weight="600" fill="var(--text)">Connectivity SDK</text>
      <text x="487" y="193">drivers · OLE DB</text>
      <rect x="570" y="160" width="145" height="40" rx="7" fill="var(--surface)" stroke="var(--border)"/>
      <text x="642" y="177" font-weight="600" fill="var(--text)">Scale Out Master</text>
      <text x="642" y="193">IS scale-out control</text>
      <rect x="415" y="212" width="145" height="40" rx="7" fill="var(--surface)" stroke="var(--border)"/>
      <text x="487" y="229" font-weight="600" fill="var(--text)">Distributed Replay</text>
      <text x="487" y="245">workload benchmarking</text>
      <rect x="570" y="212" width="145" height="40" rx="7" fill="var(--surface)" stroke="var(--border)"/>
      <text x="642" y="229" font-weight="600" fill="var(--text)">Master Data Services</text>
      <text x="642" y="245">reference data</text>
      <text x="565" y="285" fill="var(--muted)" font-size="11">SSMS and Azure Data Studio download separately</text>
    </g>

    <line x1="330" y1="72" x2="210" y2="118" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#feat-arrow)"/>
    <line x1="430" y1="72" x2="550" y2="118" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#feat-arrow)"/>

    <text x="380" y="330" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Production default: Database Engine only — every other feature must justify its existence.</text>
  </svg>
  <div class="figcaption">Figure 1 — Setup feature groups: server features carry services and exposure; shared features are supporting cast.</div>
</div>
`
    },
    {
      h: "The Database Engine feature",
      html: `
<p>The engine is the reason you are here — and it carries optional sub-features that are often ticked without thought:</p>
<table>
  <tr><th>Component</th><th>What it does</th><th>Install it when…</th></tr>
  <tr><td><strong>Database Engine Services</strong></td><td>Tables, storage, security, backup, availability — the core</td><td>Always; this is the feature you install first</td></tr>
  <tr><td><strong>SQL Server Replication</strong></td><td>Transactional, merge, and snapshot publishing to subscribers</td><td>The application genuinely uses replication publishers</td></tr>
  <tr><td><strong>Full-Text and Semantic Extractions</strong></td><td>Word-based searching over character columns</td><td>Full-Text indexes exist in the design; otherwise leave it off</td></tr>
  <tr><td><strong>Machine Learning Services</strong></td><td>In-process R and Python execution</td><td>Approved by security, with network isolation reviewed</td></tr>
  <tr><td><strong>PolyBase</strong></td><td>Query external data sources (Hadoop, blob storage)</td><td>The solution design depends on it</td></tr>
</table>
<p>Opinionated rule: install the bare Database Engine, then add Replication or Full-Text through a change request when a workload needs them. Features added “in case” become unpatched, unmonitored services within a year.</p>
`
    },
    {
      h: "Server features: AS, RS, IS",
      html: `
<p>The three classic companion features are separate products with separate lifecycles — they do not belong on the database server by default:</p>
<table>
  <tr><th>Feature</th><th>Service</th><th>Purpose</th><th>Where it should live</th></tr>
  <tr><td><strong>Analysis Services</strong></td><td>SQL Server Analysis Services</td><td>Tabular or multidimensional semantic models for BI</td><td>Dedicated server or VM; memory-hungry</td></tr>
  <tr><td><strong>Reporting Services</strong></td><td>SQL Server Reporting Services</td><td>Report authoring, portal, subscriptions, exports</td><td>Own server; web tier on port 80/443</td></tr>
  <tr><td><strong>Integration Services</strong></td><td>SQL Server Integration Services (plus Scale Out Master/Worker)</td><td>ETL packages executed by the SSIS catalog</td><td>ETL server; often separate from production OLTP</td></tr>
</table>
<p>Co-locating them on the OLTP host is occasionally justified for a small estate — but only with resource caps, because SSIS dataflow and SSRS rendering compete directly with your production queries for the same CPU and memory.</p>
<p>Note also that <strong>SSMS is no longer installed by setup</strong> — SQL Server Management Studio has been a separate download for years, as have Azure Data Studio and the command-line tools. Plan client tooling as a separate step in the build.</p>
`
    },
    {
      h: "What setup does and does not configure",
      html: `
<p>Knowing the boundary between “installed” and “configured” prevents post-install surprises:</p>
<table>
  <tr><th>Setup creates</th><th>Setup does <em>not</em> create</th></tr>
  <tr><td>Services and their binaries</td><td>Application databases, logins, or jobs</td></tr>
  <tr><td>System databases (master, model, msdb, tempdb)</td><td>Firewall rules (you open ports yourself)</td></tr>
  <tr><td>Registry entries and instance metadata</td><td>Backup schedules or monitoring agents</td></tr>
  <tr><td>The chosen collation and data directories</td><td>max server memory, MAXDOP, or auth-mode hardening</td></tr>
  <tr><td>Initial SQL admin accounts (if specified)</td><td>Extended events, alerts, or Audit specifications</td></tr>
</table>
<p>Everything on the right-hand column is the <strong>post-install configuration checklist</strong> — the subject of the next topics. An instance straight out of the wizard is installed, not production-ready.</p>
`
    },
    {
      h: "Verifying what is installed",
      html: `
<p>Ask the services and the registry — both, because they tell different stories:</p>
<pre><code class="language-sql">-- Services this instance owns: engine, agent, browser, launchpad
SELECT service_name, startup_type_desc, status_desc, process_id, last_startup_time
FROM   sys.dm_server_services
ORDER  BY service_name;

-- Sub-features of the engine itself
SELECT SERVERPROPERTY('IsFullTextInstalled')  AS fulltext_installed,
       SERVERPROPERTY('IsClustered')          AS is_clustered,
       SERVERPROPERTY('IsIntegratedSecurityOnly') AS auth_mode,
       SERVERPROPERTY('ProductLevel')         AS product_level;</code></pre>
<pre><code class="powershell"># Installed instances on this host (from the registry)
Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\Instance Names\SQL'

# Setup metadata for one instance: paths, version, edition
Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.INST\Setup' |
  Select-Object ProductVersion, Edition, SQLDataDir, SQLTempDBDir, InstallPath</code></pre>
<p>Cross-check both against the build document. If the registry shows a feature nobody can explain, you have found either an undocumented decision or the answer to your next security-review question.</p>
`
    }
  ],

  scenario: {
    title: "Vulnerability scan flags four SQL services nobody can account for",
    html: `
<p>Three days before a compliance audit, the security scanner reported “unsupported configuration: services running without an identified owner” on a production host: SQL Server Analysis Services, SQL Server Integration Services, SQL Server Launchpad, and SQL Server Browser — none documented, none monitored, none patched on the same cycle as the engine. A previous administrator had ticked every feature during the original install “in case they were needed later”.</p>
<p>Resolution under time pressure: confirm with the application teams that AS and IS were unused (SSIS packages had been retired two years earlier), stop the services, disable their start modes, remove Analysis Services and Integration Services through setup's change feature, restrict Browser to the instances that needed it, and add every remaining service to monitoring. Prevention: the build standard now mandates <strong>Database Engine only</strong> at installation, any additional feature requires a change record naming an owner, and the monthly inventory compares installed services against that record.</p>
`
  },

  interview: [
    {
      q: "Which features do you install on a production database server by default?",
      a: "Database Engine Services only — no Analysis Services, Reporting Services, Integration Services, Machine Learning, or Full-Text unless a documented requirement needs them. Everything else is added later through a change, with an owner, monitoring, and a patching plan attached."
    },
    {
      q: "Where does SSMS come from if setup does not install it?",
      a: "It is a separate download — Management Studio has shipped independently of the engine for years, alongside Azure Data Studio and the command-line tools. Client tooling version is also independent of the engine version, though you keep it current for compatibility."
    },
    {
      q: "How do you find out what is really installed on a server?",
      a: "Two views: sys.dm_server_services shows the services running for the instance, and the registry (Instance Names\SQL plus each instance's Setup key) shows every installed instance and feature. Compare both with the build document — discrepancies are either undocumented changes or security findings."
    }
  ],

  takeaways: [
    "Server features run as their own services; shared features support them — know the difference",
    "Production default: Database Engine only; add Replication, Full-Text, SSIS, SSRS, SSAS by change request",
    "SSMS and client tools are separate downloads — plan them in the build, not during an incident",
    "Setup installs services and system databases; it does not harden configuration or schedule backups",
    "Verify installed features with dm_server_services plus the registry, and reconcile against the build document"
  ]
};
