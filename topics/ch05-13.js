/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch05-13.html */

window.TOPIC = {
  id: "ch05-13",
  title: "Service Accounts",

  lead: "SQL Server runs as a Windows account, and that account decides what the engine can read, write, and start — the difference between a healthy production instance and one that cannot grow a data file or start after a reboot.",

  objectives: [
    "Explain why the service account is a security and availability decision",
    "Compare local, virtual, and domain accounts for SQL Server services",
    "Map each required privilege to the feature it unlocks",
    "Register SPNs correctly so Kerberos authentication works",
    "Change a service account safely and verify the result"
  ],

  sections: [
    {
      h: "Why the service account matters",
      html: `
<p>Every SQL Server service — Database Engine, SQL Server Agent, Browser, Launchpad — runs as a Windows principal. That principal is the identity behind <strong>every</strong> action the service performs: opening data files, writing backups to a share, connecting to linked servers, running Agent job steps, and (if someone enables it) executing <code>xp_cmdshell</code>.</p>
<p>Two failure modes follow from this, and they pull in opposite directions:</p>
<ul>
  <li><strong>Too little privilege</strong> — the service fails to start, cannot read its own registry keys, cannot grow files, cannot write backups</li>
  <li><strong>Too much privilege</strong> — a SQL injection or a compromised job step becomes a path to domain compromise</li>
</ul>
<blockquote>Run SQL Server as Domain Admin and you have not secured the database; you have made the database the most valuable target on the network.</blockquote>
<p>The production standard is a <strong>dedicated, low-privilege account per service</strong>, granted exactly the rights listed later in this topic — nothing inherited from “it worked when we installed it”.</p>
`
    },
    {
      h: "Choosing the account",
      html: `
<table>
  <tr><th>Account type</th><th>Strengths</th><th>Weaknesses</th><th>Verdict</th></tr>
  <tr><td>Local System</td><td>Zero setup</td><td>Local admin by definition; no network identity for shares</td><td>Never in production</td></tr>
  <tr><td>Network Service</td><td>Limited network identity</td><td>Machine account on the network; hard to audit</td><td>Avoid</td></tr>
  <tr><td>Virtual service account</td><td>Managed automatically, no password to rotate</td><td>Per-machine identity; awkward for clustered or domain-joined work</td><td>Acceptable for small installs</td></tr>
  <tr><td>Dedicated domain user</td><td>Full control, auditable, works with shares and Kerberos</td><td>Password rotation, SPN management</td><td><strong>Good production default</strong></td></tr>
  <tr><td>Group managed service account (gMSA)</td><td>Automatic password rotation, least privilege, no stale passwords</td><td>Domain schema and tooling requirements</td><td><strong>Best choice where available</strong></td></tr>
</table>
<p>Whatever you choose: <strong>one account for the Database Engine and a separate one for SQL Server Agent</strong> where the job workload justifies it, and never an account that is a member of Domain Admins, Enterprise Admins, or the local Administrators group.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Service account privilege boundaries">
    <defs>
      <marker id="svc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="275" y="130" width="210" height="80" rx="12" fill="var(--accent)" />
    <text x="380" y="163" text-anchor="middle" fill="#ffffff" font-size="16" font-weight="700" font-family="Segoe UI, sans-serif">SQL Server service account</text>
    <text x="380" y="187" text-anchor="middle" fill="#dbeafe" font-size="12" font-family="Segoe UI, sans-serif">CONTOSO\\svc-sql-gmsa$</text>

    <rect x="25" y="25" width="205" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="127" y="52" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Data, log, backup files</text>
    <text x="127" y="73" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">NTFS Modify on own folders</text>

    <rect x="530" y="25" width="205" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="632" y="52" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Windows rights</text>
    <text x="632" y="73" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Log on as a service · IFI</text>

    <rect x="25" y="245" width="205" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="127" y="272" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Active Directory</text>
    <text x="127" y="293" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">SPN for Kerberos</text>

    <rect x="530" y="245" width="205" height="70" rx="10" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="632" y="272" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Explicitly not granted</text>
    <text x="632" y="293" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Domain admin · interactive logon</text>

    <line x1="230" y1="60" x2="290" y2="132" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#svc-arrow)"/>
    <line x1="530" y1="60" x2="470" y2="132" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#svc-arrow)"/>
    <line x1="230" y1="280" x2="290" y2="208" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#svc-arrow)"/>
    <line x1="530" y1="280" x2="470" y2="208" stroke="var(--amber)" stroke-width="1.6" marker-end="url(#svc-arrow)"/>

    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Grant by capability, not by habit: every right above maps to a feature you can name.</text>
  </svg>
  <div class="figcaption">Figure 1 — The service account needs specific, named privileges; everything else stays ungranted.</div>
</div>
`
    },
    {
      h: "The permissions matrix",
      html: `
<p>This is the table to keep in your runbook. Each row exists because a feature silently degrades or fails without it:</p>
<table>
  <tr><th>Right or permission</th><th>Granted to</th><th>What breaks without it</th></tr>
  <tr><td><strong>Log on as a service</strong></td><td>Engine, Agent, Browser</td><td>Service refuses to start (set automatically by Configuration Manager)</td></tr>
  <tr><td><strong>Perform volume maintenance tasks</strong></td><td>Database Engine</td><td><strong>Instant file initialisation is lost</strong> — data file growth and restore zero the file first and take many times longer</td></tr>
  <tr><td><strong>Lock pages in memory</strong> (optional)</td><td>Database Engine</td><td>SQL Server memory can be paged to disk under OS pressure (error 17890 in the error log)</td></tr>
  <tr><td><strong>NTFS Modify</strong> on data/log folders</td><td>Engine</td><td>Service starts but cannot create, grow, or read database files</td></tr>
  <tr><td><strong>NTFS Modify / share write</strong> on the backup path</td><td>Engine and Agent</td><td>Backup jobs fail with “Operating system error 5 — access is denied”</td></tr>
  <tr><td><strong>SPN registered in Active Directory</strong></td><td>Engine (domain accounts)</td><td>Kerberos fails, NTLM is used instead — and double-hop authentication breaks</td></tr>
</table>
<p>Note what is <em>absent</em>: no local Administrators group, no Domain Users on the domain controllers, no “full control” on the SQL data root. Grant rights on the exact folders the instance uses, not on an entire drive.</p>
`
    },
    {
      h: "SPNs and Kerberos",
      html: `
<p>An <strong>Service Principal Name</strong> is the Active Directory record that binds “the SQL Server service on sql-node-02” to the account that runs it. Without a correct SPN, clients fall back to NTLM — which works for a single hop but fails the moment a web tier needs to pass the caller's identity to SQL Server (the classic “double-hop” problem).</p>
<pre><code class="language-powershell">setspn -L CONTOSO\\svc-sql-gmsa

setspn -S MSSQLSvc/sql-node-02.contoso.com:1433 CONTOSO\\svc-sql-gmsa
setspn -S MSSQLSvc/sql-node-02:1433 CONTOSO\\svc-sql-gmsa</code></pre>
<ul>
  <li><strong>Always use <code>-S</code></strong> for registration: it refuses to create a duplicate SPN, whereas <code>-A</code> will happily create a conflict that fails authentication later</li>
  <li>Register <strong>both</strong> the FQDN and the short name if clients use both</li>
  <li>Named instances use <code>MSSQLSvc/host.domain.com:port</code> — the port is part of the SPN</li>
  <li>After any account change, the SPNs must move with it: a stale SPN pointing at the old account is a Kerberos outage waiting to happen</li>
</ul>
`
    },
    {
      h: "Changing the account safely",
      html: `
<p>Always change service accounts in <strong>SQL Server Configuration Manager</strong>, never in <code>services.msc</code>. Configuration Manager performs the steps that matter: it updates the account, grants the Windows rights above, and fixes the ACLs on the instance's registry keys and folders. The Services console does none of that — it only changes who starts the process.</p>
<ol>
  <li>Create or select the account, confirm it can <em>log on as a service</em></li>
  <li>Grant folder rights and (if used) the SPN, <strong>before</strong> the restart</li>
  <li>Change the account in Configuration Manager and restart the services</li>
  <li>Verify with the DMV below, then run a backup and check the Agent can execute a job</li>
  <li>Confirm instant file initialisation is still enabled — it is the right people forget</li>
</ol>
<pre><code class="language-sql">-- Who runs each service, and is instant file initialisation on?
SELECT servicename,
       status_desc,
       service_account,
       instant_file_initialisation_enabled AS ifi
FROM   sys.dm_server_services
WHERE  servicename LIKE 'SQL Server%';

-- Is Lock pages in memory granted to this account?
SELECT sql_memory_model_desc
FROM   sys.dm_os_sys_info;</code></pre>
<p>Both queries need <code>VIEW SERVER STATE</code> (SQL Server 2019 and earlier) or <code>VIEW SERVER SECURITY STATE</code> (2022 and later). A <code>CONVENTIONAL</code> memory model plus <code>ifi = N</code> after an account change tells you exactly which rights were lost.</p>
`
    },
    {
      h: "Operational hygiene",
      html: `
<ul>
  <li><strong>Password rotation</strong> — rotate on schedule, and remember the service password is also stored by SQL Server Setup for unattended installs; use gMSA to make this a non-event</li>
  <li><strong>Agent proxy accounts</strong> — job steps run as the Agent service account unless a proxy is defined; keep job steps as narrow as the account</li>
  <li><strong><code>xp_cmdshell</code> and OLE Automation</strong> inherit this identity — a shell running as the SQL account runs with its file and network rights</li>
  <li><strong>Linked servers and Database Mail</strong> also carry credentials; they are part of the same threat model</li>
  <li><strong>Audit quarterly</strong>: the DMV above, plus <code>setspn -L</code>, plus a check that no account has quietly been added to a privileged group</li>
</ul>
<p>Treat the service account as production configuration: documented, reviewed, and changed only through the runbook.</p>
`
    }
  ],

  scenario: {
    title: "09:47 — a 200 GB data file took 47 minutes to grow",
    html: `
<p>A batch import triggered an automatic growth of a 200 GB data file. What normally takes seconds took <strong>47 minutes</strong>, and the application timed out. The DBA first suspected storage, then a lock — neither showed anything. The clue was in the account: two weeks earlier, the instance had been migrated to a new domain service account, and the change had been made in <code>services.msc</code> because “Configuration Manager was not installed on the jump box”.</p>
<p>The DMV gave the verdict: <code>instant_file_initialisation_enabled = N</code>. Without the <em>Perform volume maintenance tasks</em> right, SQL Server must zero every new page of the data file before it can be used — for 200 GB, that is tens of minutes of writes. Fix: grant the right to the account in the local policy, restart the Database Engine (the right is read at start-up), verify <code>ifi = Y</code>, and re-run a controlled growth test. Prevention: account changes go through SQL Server Configuration Manager only, the runbook includes a post-change DMV check for <code>ifi</code> and <code>sql_memory_model_desc</code>, and the checklist item “instant file initialisation verified” must be signed off before the change is closed.</p>
`
  },

  interview: [
    {
      q: "Why should SQL Server not run as a domain or local administrator?",
      a: "Least privilege: the service account is the identity behind file access, backup writes, Agent jobs and anything reached through xp_cmdshell. If it were an administrator, a single SQL injection or malicious job step would hand over the host — and potentially the domain. The engine does not need administrative rights; it needs specific, nameable ones."
    },
    {
      q: "Which right enables instant file initialisation, and what exactly does it affect?",
      a: "Perform volume initialisation — properly, Perform volume maintenance tasks. It lets SQL Server bypass zeroing newly allocated space in <strong>data</strong> files, so growth and restore are near-instant. Transaction log files are always zeroed, so log growth is unaffected. Verify it with instant_file_initialisation_enabled in sys.dm_server_services."
    },
    {
      q: "How do you change a SQL Server service account without causing an outage?",
      a: "Grant the rights first (Log on as a service, NTFS Modify on the data, log and backup paths, Perform volume maintenance tasks), move or create the SPN for Kerberos, then change the account in SQL Server Configuration Manager — which fixes registry and folder ACLs — restart the services, and verify with sys.dm_server_services, a test backup, and one Agent job."
    }
  ],

  takeaways: [
    "The service account is both a security boundary and an availability dependency — pick a dedicated low-privilege account or gMSA",
    "Configuration Manager, not services.msc: it grants rights and repairs ACLs when the account changes",
    "Perform volume maintenance tasks buys instant file initialisation; without it, growth and restore crawl",
    "Register SPNs with setspn -S to avoid duplicate Kerberos bindings; stale SPNs break authentication after account changes",
    "Verify every change with sys.dm_server_services: status, account, and instant file initialisation"
  ]
};
