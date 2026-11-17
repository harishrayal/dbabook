/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch05-08.html */

window.TOPIC = {
  id: "ch05-08",
  title: "Database Engine Configuration",

  lead: "The Database Engine Configuration pages decide collation, directories, tempdb, authentication, and who gets admin rights — five decisions, two of them effectively permanent, all made in a single wizard screen.",

  objectives: [
    "Identify the Database Engine configuration pages and what each controls",
    "Choose a server collation and understand the consequences",
    "Plan data, log, backup, and tempdb directories",
    "Configure initial administrators and authentication mode",
    "Verify every setting after the wizard with T-SQL"
  ],

  sections: [
    {
      h: "The configuration pages",
      html: `
<table>
  <tr><th>Page</th><th>Decisions made</th><th>Reversible?</th></tr>
  <tr><td><strong>Server Configuration</strong> (service accounts &amp; collation)</td><td>Service startup accounts, server collation, startup types</td><td>Accounts yes (restart); <strong>collation no</strong></td></tr>
  <tr><td><strong>Database Engine Configuration → Data Directories</strong></td><td>Data root, log root, backup directory, per-instance paths</td><td>Yes — via ALTER DATABASE … MODIFY FILE</td></tr>
  <tr><td><strong>Database Engine Configuration → TempDB</strong></td><td>Number of tempdb files, size, growth, placement</td><td>Yes — but disruptive while running</td></tr>
  <tr><td><strong>Database Engine Configuration → Error Reporting</strong></td><td>Whether to send feature usage data to Microsoft</td><td>Yes</td></tr>
  <tr><td><strong>Database Engine Configuration → Feature Configuration</strong></td><td>Admin accounts, Windows vs Mixed authentication</td><td>Auth mode needs a restart</td></tr>
</table>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Database Engine configuration decisions and their reversibility">
    <defs>
      <marker id="cfg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="260" y="24" width="240" height="56" rx="12" fill="var(--accent)" stroke="var(--accent-strong)"/>
    <text x="380" y="48" text-anchor="middle" fill="#ffffff" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">Database Engine</text>
    <text x="380" y="68" text-anchor="middle" fill="#dbeafe" font-size="12" font-family="Segoe UI, sans-serif">Configuration wizard</text>

    <rect x="20" y="130" width="200" height="84" rx="10" fill="var(--surface)" stroke="var(--amber)" stroke-width="2"/>
    <text x="120" y="156" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Server collation</text>
    <text x="120" y="178" text-anchor="middle" fill="var(--amber)" font-size="11.5" font-weight="600" font-family="Segoe UI, sans-serif">one-way door</text>
    <text x="120" y="198" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">changing = rebuild system DBs</text>

    <rect x="240" y="130" width="200" height="84" rx="10" fill="var(--surface)" stroke="var(--amber)" stroke-width="2"/>
    <text x="340" y="156" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Authentication mode</text>
    <text x="340" y="178" text-anchor="middle" fill="var(--amber)" font-size="11.5" font-weight="600" font-family="Segoe UI, sans-serif">restart required</text>
    <text x="340" y="198" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">plan it with the app teams</text>

    <rect x="460" y="130" width="130" height="84" rx="10" fill="var(--surface)" stroke="var(--accent)" stroke-width="2"/>
    <text x="525" y="156" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Admins</text>
    <text x="525" y="178" text-anchor="middle" fill="var(--accent-strong)" font-size="11.5" font-weight="600" font-family="Segoe UI, sans-serif">easy to change</text>
    <text x="525" y="198" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">named accounts only</text>

    <rect x="610" y="130" width="130" height="84" rx="10" fill="var(--surface)" stroke="var(--accent)" stroke-width="2"/>
    <text x="675" y="156" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">Directories</text>
    <text x="675" y="178" text-anchor="middle" fill="var(--accent-strong)" font-size="11.5" font-weight="600" font-family="Segoe UI, sans-serif">movable later</text>
    <text x="675" y="198" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">with downtime</text>

    <rect x="160" y="256" width="440" height="56" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="380" y="280" text-anchor="middle" fill="var(--accent-strong)" font-size="13.5" font-weight="700" font-family="Segoe UI, sans-serif">tempdb files, data/log paths, error reporting</text>
    <text x="380" y="300" text-anchor="middle" fill="var(--text)" font-size="11.5" font-family="Segoe UI, sans-serif">changeable, but every change is a maintenance window</text>

    <line x1="300" y1="80" x2="130" y2="128" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cfg-arrow)"/>
    <line x1="350" y1="80" x2="345" y2="128" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cfg-arrow)"/>
    <line x1="430" y1="80" x2="515" y2="128" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cfg-arrow)"/>
    <line x1="470" y1="80" x2="665" y2="128" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cfg-arrow)"/>
    <line x1="380" y1="214" x2="380" y2="254" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cfg-arrow)"/>

    <text x="380" y="240" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-style="italic" font-family="Segoe UI, sans-serif">Amber = decide carefully before install · green = adjustable with normal change control</text>
  </svg>
  <div class="figcaption">Figure 1 — Risk-ranked configuration decisions: collation and authentication are the expensive ones to change.</div>
</div>
`
    },
    {
      h: "Collation: the one-way door",
      html: `
<p>Collation defines <strong>character set, sort order, and case/accent sensitivity</strong> for the instance. It governs every string comparison, every ORDER BY, every join — and changing it later means rebuilding the system databases, which means restoring every user database afterwards.</p>
<table>
  <tr><th>Collation style</th><th>Behaviour</th><th>When to choose it</th></tr>
  <tr><td><code>SQL_Latin1_General_CP1_CI_AS</code></td><td>Case-insensitive, accent-sensitive — the classic default</td><td>Legacy applications expecting it</td></tr>
  <tr><td><code>Latin1_General_CI_AS</code></td><td>Windows collation, case-insensitive</td><td>General Western European workloads</td></tr>
  <tr><td><code>Latin1_General_CS_AS</code></td><td>Case-sensitive</td><td>Codes where 'AB12' ≠ 'ab12' (part numbers, tokens)</td></tr>
  <tr><td><code>…_KS_AS</code> / <code>…_WS</code></td><td>Keyboard-sensitive / whitespace-sensitive</td><td>Rare, but mandatory when the app requires it</td></tr>
</table>
<p>Ask the application team <em>before</em> installation: does <code>'a' = 'A'</code> need to be true? Is <code>'é'</code> equal to <code>'e'</code>? Getting these answers late is how collation conflicts appear in production joins. Where a single database must differ from the server default, you can set a <strong>database-level collation</strong> — but note that changing it afterwards does not alter existing columns; existing objects keep the collation they were created with.</p>
`
    },
    {
      h: "Directories done right",
      html: `
<p>The defaults live under <code>C:\Program Files\Microsoft SQL Server\MSSQLxx.INSTNAME\</code> — correct for a laptop, wrong for production:</p>
<table>
  <tr><th>Directory setting</th><th>Points to</th><th>Production target</th></tr>
  <tr><td>Data root</td><td>New databases' MDF/NDF files</td><td>Dedicated data volume (D:)</td></tr>
  <tr><td>Log root</td><td>New databases' LDF files</td><td>Separate log volume (E:)</td></tr>
  <tr><td>Backup directory</td><td>Default BACKUP DATABASE target</td><td>Backup volume or share — never the data volume</td></tr>
  <tr><td>tempdb directories</td><td>tempdb data and log files</td><td>Fastest storage available</td></tr>
</table>
<p>Rules that save pain later:</p>
<ul>
  <li>Point roots at volume roots (<code>D:\Data</code>), not deeply nested folders — per-database subfolders are created automatically</li>
  <li>Set the backup directory correctly from day one; a wrong default backup path becomes someone's 2 AM discovery</li>
  <li>Keep system and user databases on paths the storage design owns; record them in the build document</li>
  <li>Grant the service accounts modify rights on these paths — setup does it for you, manual moves do not</li>
</ul>
`
    },
    {
      h: "tempdb and initial administrators",
      html: `
<p><strong>tempdb</strong> is recreated at every engine start, so its install-time settings are the ones that matter most:</p>
<ul>
  <li><strong>File count:</strong> start with one file per visible scheduler up to 8, equal sizes; more files reduce allocation contention</li>
  <li><strong>Size and growth:</strong> give it a realistic starting size with <strong>fixed</strong> growth — percent growth on tempdb triggers pointless large autogrowth events</li>
  <li><strong>Placement:</strong> the fastest volume; tempdb contention shows up as PAGELATCH waits on allocation pages</li>
</ul>
<p><strong>Administrators:</strong> add named individuals or a security group — <strong>never Domain Admins</strong>, never a shared “sqldbadmin” account. And on the Feature Configuration page, choose authentication deliberately:</p>
<table>
  <tr><th>Mode</th><th>Logins</th><th>Choose when</th></tr>
  <tr><td><strong>Windows authentication only</strong></td><td>Domain/Windows accounts and groups</td><td>All clients support Windows auth — the secure default</td></tr>
  <tr><td><strong>Mixed</strong></td><td>Windows plus SQL Server logins</td><td>Legacy apps, cross-domain, or non-Windows clients need SQL logins</td></tr>
</table>
<p>Mixed mode is not wrong — but it must come with password policy enforced (<code>CHECK_POLICY = ON</code>), the <code>sa</code> account disabled or renamed with a strong password, and SQL logins inventoried.</p>
`
    },
    {
      h: "Verify after the wizard",
      html: `
<p>Every setting on those pages should be provable in T-SQL within a minute of installation:</p>
<pre><code class="language-sql">-- Collation, authentication mode, version
SELECT SERVERPROPERTY('Collation')                AS server_collation,
       SERVERPROPERTY('IsIntegratedSecurityOnly') AS auth_mode,  -- 1 = Windows only
       SERVERPROPERTY('ProductVersion')           AS product_version,
       SERVERPROPERTY('Edition')                  AS edition;

-- tempdb files as configured at install (and later by DBAs)
SELECT name, physical_name, size * 8 / 1024 AS size_mb, growth, is_percent_growth
FROM   sys.master_files
WHERE  database_id = DB_ID('tempdb')
ORDER  BY file_id;

-- Who is in the sysadmin role?
SELECT sp.name, sp.type_desc, sp.is_disabled
FROM   sys.server_role_members srm
JOIN   sys.server_principals sp ON sp.principal_id = srm.member_principal_id
WHERE  srm.role_principal_id = (SELECT principal_id FROM sys.server_principals WHERE name = 'sysadmin');</code></pre>
<pre><code class="language-sql">-- The settings that should already be on your post-install checklist
SELECT name, value_in_use
FROM   sys.configurations
WHERE  name IN ('max server memory (MB)', 'max degree of parallelism',
                'cost threshold for parallelism', 'backup compression default')
ORDER  BY name;</code></pre>
<p>Record the results in the build document. The wizard's “Success” message proves files were written — these queries prove the instance was configured the way you intended.</p>
`
    }
  ],

  scenario: {
    title: "Cannot resolve the collation conflict — three days before go-live",
    html: `
<p>A new instance was installed at speed using the default collation while the development team quietly assumed their existing database's case-sensitive collation would carry over. Integration testing on the new server failed immediately: joins across the application database and a reference database threw “Cannot resolve the collation conflict between Latin1_General_CS_AS and SQL_Latin1_General_CP1_CI_AS in the equal to operation”. Strings that matched in development did not match in production.</p>
<p>Resolution under a three-day deadline: collation cannot be changed on a live instance without rebuilding system databases, so the team provisioned a <em>second</em> instance with the correct server collation, restored databases into it, verified the application end to end, and cut connection strings over — the first instance was scrapped. Prevention: collation is now a signed-off field on the installation request, the application's required collation is documented per database, and a post-install verification query (including a case-sensitivity smoke test) is mandatory before handover.</p>
`
  },

  interview: [
    {
      q: "Why is collation the most important Database Engine configuration?",
      a: "It determines string comparison, sorting, and case/accent sensitivity for the entire instance, and changing it later requires rebuilding the system databases and restoring everything — effectively a rebuild. Every string operation in every database inherits it, so a wrong choice surfaces as subtle data-matching bugs, not an obvious error."
    },
    {
      q: "What do you configure immediately after installation?",
      a: "Post-install configuration: max server memory, MAXDOP and cost threshold for parallelism, authentication mode and sa handling, backup compression default, default backup path, tempdb file layout verification, monitoring and backup jobs — then record every value in the build document. An instance out of the wizard is not production-ready."
    },
    {
      q: "How many tempdb files should you create at installation?",
      a: "A starting point of one file per visible scheduler up to eight, equal in size with fixed growth, on the fastest storage. Then validate against the real workload: contention shows up as PAGELATCH_UP waits on tempdb, and files are added only when evidence supports it."
    }
  ],

  takeaways: [
    "Configuration pages: service accounts & collation, data directories, tempdb, error reporting, admins & auth mode",
    "Collation is a one-way door — confirm case/accent requirements with the application team before setup",
    "Point data, log, tempdb, and backup roots at their designed volumes, not C: defaults",
    "tempdb: up to 8 equal files, fixed growth, fastest storage; admins are named accounts, never Domain Admins",
    "Prove every wizard decision with SERVERPROPERTY, sys.master_files, and sys.configurations queries"
  ]
};
