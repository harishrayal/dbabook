/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch05-02.html */

window.TOPIC = {
  id: "ch05-02",
  title: "SQL Server Versions",

  lead: "SQL Server releases roughly every three years on a five-plus-five-year support lifecycle — knowing which version you are on, what build it is, and when support ends is the difference between planned upgrades and emergency ones.",

  objectives: [
    "List the major SQL Server versions and their release generations",
    "Explain mainstream support, extended support, and ESU",
    "Read @@VERSION and SERVERPROPERTY to identify a build precisely",
    "Understand the shift from service packs to cumulative updates",
    "Decide which version a new production build should use"
  ],

  sections: [
    {
      h: "Why version matters",
      html: `
<p>The version string in the corner of a report decides far more than feature availability:</p>
<ul>
  <li><strong>Security posture</strong> — only supported versions receive security patches</li>
  <li><strong>Feature set</strong> — Availability Group capabilities, intelligent query processing, ledger tables, and Azure integration all arrive per version</li>
  <li><strong>Compatibility level</strong> — new databases inherit the engine's default; old databases keep their level until you raise it</li>
  <li><strong>Upgrade path</strong> — skipping versions is possible in place, but supportability narrows with every release</li>
  <li><strong>Licensing and audit</strong> — the build determines servicing obligations and Extended Security Update eligibility</li>
</ul>
<p>Microsoft's fixed lifecycle gives each version <strong>five years of mainstream support</strong> (features, fixes, security) and <strong>five years of extended support</strong> (security updates only). After that: no patches at all, unless you buy <strong>Extended Security Updates (ESU)</strong> for up to three more years.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="SQL Server version support timeline">
    <defs>
      <marker id="ver-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <g font-size="11" fill="var(--muted)" font-family="Segoe UI, sans-serif">
      <text x="64" y="24" text-anchor="middle">2016</text>
      <text x="229" y="24" text-anchor="middle">2021</text>
      <text x="394" y="24" text-anchor="middle">2026</text>
      <text x="559" y="24" text-anchor="middle">2031</text>
      <text x="714" y="24" text-anchor="middle">2036</text>
    </g>
    <g stroke="var(--border)" stroke-width="1" stroke-dasharray="4 4">
      <line x1="64" y1="32" x2="64" y2="310"/>
      <line x1="229" y1="32" x2="229" y2="310"/>
      <line x1="394" y1="32" x2="394" y2="310"/>
      <line x1="559" y1="32" x2="559" y2="310"/>
      <line x1="714" y1="32" x2="714" y2="310"/>
    </g>

    <g font-size="12.5" font-weight="600" fill="var(--text)" font-family="Segoe UI, sans-serif" text-anchor="end">
      <text x="56" y="66">2016</text>
      <text x="56" y="116">2017</text>
      <text x="56" y="166">2019</text>
      <text x="56" y="216">2022</text>
      <text x="56" y="266">2025</text>
    </g>

    <rect x="76" y="50" width="165" height="22" rx="5" fill="var(--accent)"/>
    <rect x="241" y="50" width="165" height="22" rx="5" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="318" y="66" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">out of support</text>

    <rect x="119" y="100" width="165" height="22" rx="5" fill="var(--accent)"/>
    <rect x="284" y="100" width="165" height="22" rx="5" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="366" y="116" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">security updates to 2027</text>

    <rect x="189" y="150" width="169" height="22" rx="5" fill="var(--accent)"/>
    <rect x="358" y="150" width="159" height="22" rx="5" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="437" y="166" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">extended to 2030</text>

    <rect x="287" y="200" width="201" height="22" rx="5" fill="var(--accent)"/>
    <rect x="488" y="200" width="164" height="22" rx="5" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="570" y="216" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">extended to 2033</text>

    <rect x="385" y="250" width="165" height="22" rx="5" fill="var(--accent-strong)"/>
    <rect x="550" y="250" width="167" height="22" rx="5" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="633" y="266" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">extended to 2036</text>

    <g font-size="11.5" fill="var(--text)" font-family="Segoe UI, sans-serif">
      <rect x="64" y="300" width="26" height="12" rx="3" fill="var(--accent)"/>
      <text x="96" y="310">mainstream support (features + fixes)</text>
      <rect x="330" y="300" width="26" height="12" rx="3" fill="var(--surface-2)" stroke="var(--border)"/>
      <text x="362" y="310">extended support (security only)</text>
    </g>
    <text x="380" y="334" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">2016 reached end of support in July 2026 — ESU exists, but it is a delay, not a strategy.</text>
  </svg>
  <div class="figcaption">Figure 1 — Support windows for the modern SQL Server generations (indicative; confirm dates on Microsoft's lifecycle page).</div>
</div>
`
    },
    {
      h: "Version history at a glance",
      html: `
<table>
  <tr><th>Version</th><th>Internal</th><th>Released</th><th>Mainstream end</th><th>Extended end</th><th>Notes</th></tr>
  <tr><td>SQL Server 2016</td><td>13.x</td><td>Jun 2016</td><td>Jul 2021</td><td><strong>Jul 2026 (passed)</strong></td><td>First “cloud-ready” release; always encrypted, query store</td></tr>
  <tr><td>SQL Server 2017</td><td>14.x</td><td>Sep 2017</td><td>Oct 2022</td><td>Oct 2027</td><td>Linux support; last version with service packs</td></tr>
  <tr><td>SQL Server 2019</td><td>15.x</td><td>Nov 2019</td><td>Feb 2025</td><td>Jan 2030</td><td>Big data clusters (retired), lightweight profiling, AG improvements</td></tr>
  <tr><td>SQL Server 2022</td><td>16.x</td><td>Nov 2022</td><td>2028</td><td>2033</td><td>ledger tables, query store hints, Azure integration</td></tr>
  <tr><td>SQL Server 2025</td><td>17.x</td><td>Nov 2025</td><td>Jan 2031</td><td>Jan 2036</td><td>Current release; built for AI workloads, compat level 170</td></tr>
</table>
<p>Older generations (2012, 2014) are long past extended support — if you meet one in the wild, treat it as a migration project, not a patching task. Always confirm exact dates against Microsoft's lifecycle page before quoting them in a plan; dates shift for long-term servicing releases.</p>
`
    },
    {
      h: "Reading your build precisely",
      html: `
<p>“We run SQL Server” is not an inventory. You need version, build, and CU level:</p>
<pre><code class="language-sql">SELECT @@VERSION                            AS full_version_string,
       SERVERPROPERTY('ProductVersion')     AS product_version,   -- 16.0.4105.5
       SERVERPROPERTY('ProductLevel')       AS product_level,     -- RTM, CU12, SP3
       SERVERPROPERTY('ProductMajorVersion') AS major_version,     -- 13 / 15 / 16 / 17
       SERVERPROPERTY('Edition')            AS edition;</code></pre>
<pre><code class="language-sql">-- How long has this instance been up? (uptime hints at last restart / patching)
SELECT sqlserver_start_time, cpu_count, physical_memory_kb / 1024 AS memory_mb
FROM   sys.dm_os_sys_info;</code></pre>
<p><code>@@VERSION</code> is the raw truth — it includes the exact build (for example <code>16.0.4105.5</code>), the OS build, and the last CU applied. Map build numbers to cumulative updates with Microsoft's build-number table when you need to know whether a specific fix is present.</p>
`
    },
    {
      h: "Servicing: service packs are gone",
      html: `
<p>From SQL Server 2017 onwards there are <strong>no service packs</strong>. Servicing is continuous:</p>
<table>
  <tr><th>Channel</th><th>What it contains</th><th>Cadence</th></tr>
  <tr><td><strong>Cumulative Update (CU)</strong></td><td>Everything in the previous CU plus fixes — no hotfix-only branch</td><td>Monthly for a period, then quarterly</td></tr>
  <tr><td><strong>General Distribution Release (GDR)</strong></td><td>Security-only update that also applies to machines with no CUs installed</td><td>As needed for CVEs</td></tr>
  <tr><td><strong>Service Pack</strong></td><td>Legacy packaging, last shipped for 2016</td><td>Discontinued</td></tr>
  <tr><td><strong>ESU</strong></td><td>Security updates after end of extended support</td><td>Annual, up to 3 years</td></tr>
</table>
<p>Opinionated rule: keep every instance <strong>within two CUs of the latest</strong>, test in non-production first, and patch on a schedule rather than reactively. A server that has never had a CU applied is carrying every bug Microsoft has already fixed.</p>
`
    },
    {
      h: "Which version for a new build?",
      html: `
<p>Default advice for production in this era:</p>
<ul>
  <li><strong>New production build → SQL Server 2022 or 2025</strong>, latest CU at installation, database compatibility level set deliberately (not blindly at the default)</li>
  <li><strong>SQL Server 2019 → still supported</strong> and fine to keep, but plan its migration path while extended support runs</li>
  <li><strong>SQL Server 2017 and earlier → out of or near end of support</strong>; budget a migration now, before an audit or a CVE forces it</li>
  <li><strong>Test environments should mirror production's version</strong> — a Developer or Express install of the same version catches compatibility surprises for free</li>
</ul>
<p>Remember the two version axes: the <strong>engine version</strong> (16.0.x) and the database <strong>compatibility level</strong> (150, 160, 170 …). You can run an old database at an old compatibility level on a new engine — that is usually the safest upgrade strategy, raising the level only after testing.</p>
`
    }
  ],

  scenario: {
    title: "Security audit flags SQL Server 2016 two weeks after end of support",
    html: `
<p>On 14 July 2026 a client's penetration test reports “unsupported database software in production”. The instance runs SQL Server 2016 SP3 for a claims-processing application, and no upgrade has ever been scheduled — the team believed SP3 meant “fully patched”. It does not: extended support ended the same week, and Microsoft will issue no further security updates without ESU.</p>
<p>The DBA had 48 hours to produce a plan for the audit committee. Diagnosis took an hour: inventory every 2016 instance, confirm build numbers, and estimate database compatibility issues. The resolution was a staged plan — buy ESU as a bridge for the two systems that could not move quickly, stand up a SQL Server 2022 instance in parallel, and migrate database by database over the next quarter with compatibility-level testing. Prevention: lifecycle dates now appear on the estate dashboard, and any instance within 18 months of end of support raises a visible risk item — not a surprise in a pen-test report.</p>
`
  },

  interview: [
    {
      q: "What is the difference between mainstream and extended support?",
      a: "Mainstream support includes new features, non-security fixes, and security updates. Extended support includes security updates only — no design changes, no non-security bug fixes. After extended support ends, nothing is released unless you purchase Extended Security Updates."
    },
    {
      q: "How do you determine the exact build of a SQL Server instance?",
      a: "Run SELECT @@VERSION for the raw build string, or SERVERPROPERTY('ProductVersion') plus SERVERPROPERTY('ProductLevel') for a queryable form, then map the build number to its cumulative update using Microsoft's build-number table. sys.dm_os_sys_info adds uptime, which tells you when it was last restarted."
    },
    {
      q: "Why did Microsoft replace service packs with cumulative updates?",
      a: "So there is one supported code line: every CU contains all previous fixes, eliminating the choice between a risky SP and an ever-growing set of hotfixes. The trade-off is that CUs must be tested continuously rather than deferred to a twice-yearly service pack window."
    }
  ],

  takeaways: [
    "Each version gets five years of mainstream and five years of extended support, then ESU at most",
    "SQL Server 2016 went out of support in July 2026 — running it unpatched is a security and compliance risk",
    "Identify builds with @@VERSION and SERVERPROPERTY, then map to the CU with Microsoft's build table",
    "No service packs after 2017 — keep instances within two CUs of the latest",
    "New production builds: 2022 or 2025 at the latest CU; decide compatibility level deliberately"
  ]
};
