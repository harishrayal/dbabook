/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch03-07.html */

window.TOPIC = {
  id: "ch03-07",
  title: "Windows User Accounts and Groups",

  lead: "SQL Server inherits its identity and much of its access model from Windows, so understanding accounts, groups, and SIDs is the difference between a clean permission change and a service that will not start after a restart.",
  objectives: [
    "Explain why SIDs, not account names, define identity",
    "Compare local, domain, virtual, and managed service accounts",
    "Use groups to grant file and SQL Server access safely",
    "Choose between Windows authentication and SQL authentication",
    "Recognise account lifecycle failures that break production SQL Server"
  ],

  sections: [
    {
      h: "Accounts, SIDs, and why names are only labels",
      html: `
<p>Windows identifies principals by a <strong>security identifier (SID)</strong> such as <code>S-1-5-21-…</code>. The username is a friendly label, and renaming an account leaves its SID untouched. Deleting and recreating an account with exactly the same name produces a different SID — every permission grant and every SQL login attached to the old SID becomes orphaned.</p>
<p>This is the root of some of the most confusing incidents in SQL Server: a login still appears in <code>sys.server_principals</code>, but users cannot connect because the Windows SID behind it no longer exists. Conversely, a renamed account continues to work because the SID is stable.</p>
<table>
  <tr><th>Well-known identity</th><th>SID / name</th><th>Typical use</th></tr>
  <tr><td>Local System</td><td><code>NT AUTHORITY\\SYSTEM</code> (S-1-5-18)</td><td>OS services with full local privilege</td></tr>
  <tr><td>Network Service</td><td><code>NT AUTHORITY\\NETWORK SERVICE</code></td><td>Services needing network identity</td></tr>
  <tr><td>Virtual account</td><td><code>NT SERVICE\\MSSQLSERVER</code></td><td>Default SQL Server engine identity — no password</td></tr>
  <tr><td>Everyone</td><td>S-1-1-0</td><td>All principals; avoid granting database access to it</td></tr>
  <tr><td>Authenticated Users</td><td>S-1-5-11</td><td>Any non-anonymous user; far too broad for DB access</td></tr>
</table>
<pre><code class="language-powershell">whoami /all
Get-LocalUser | Select-Object Name, SID, Enabled, LastLogon, PasswordLastSet | Format-Table -AutoSize</code></pre>
<blockquote>When someone says "we recreated the account with the same name", assume the SID changed and start checking every grant.</blockquote>
`
    },
    {
      h: "Local accounts versus domain accounts",
      html: `
<p>A <strong>local account</strong> exists in the server's SAM database and is scoped to that machine. A <strong>domain account</strong> is managed in Active Directory and can be authenticated across domain-joined systems. Kerberos use depends on the service, SPNs, and domain configuration; cloud-managed identities are a separate option for supported Azure services.</p>
<table>
  <tr><th>Property</th><th>Local</th><th>Domain</th></tr>
  <tr><td>Scope</td><td>Single server</td><td>All domain-joined machines</td></tr>
  <tr><td>Password policy</td><td>Local policy only</td><td>Domain policy, lockout, expiry</td></tr>
  <tr><td>Kerberos / SPNs</td><td>No domain Kerberos</td><td>Yes — required for delegated authentication</td></tr>
  <tr><td>Lifecycle</td><td>Manual on each host</td><td>Central disable, reset, and audit</td></tr>
  <tr><td>Appropriate use</td><td>Standalone servers, workgroup builds</td><td>Enterprise SQL Server services and DBA groups</td></tr>
</table>
<p>For a standalone SQL Server, a virtual service account is often suitable. For domain resources or multi-server scenarios, evaluate a domain account or <strong>group Managed Service Account (gMSA)</strong> supported by the SQL Server version and topology. Use a separate, managed DBA security group. Don't use a person's account for a service.</p>
<pre><code class="language-powershell">Get-ADServiceAccount -Identity 'svc_sql$' -Properties * | Select-Object Name, Enabled, HostComputer, DNSHostName
Test-ADServiceAccount -Identity 'svc_sql$'
Get-LocalGroupMember -Group 'Administrators' | Select-Object Name, PrincipalSource, ObjectClass</code></pre>
`
    },
    {
      h: "Service accounts and per-service SIDs",
      html: `
<p>SQL Server Setup commonly configures <strong>virtual service accounts</strong> such as <code>NT SERVICE\\MSSQLSERVER</code> for the engine and <code>NT SERVICE\\SQLSERVERAGENT</code> for Agent. They don't have a password to manage and have per-service identities that can receive local permissions. When a virtual account accesses network resources, the computer account is typically used; use a domain identity when the workload requires a distinct network identity.</p>
<p>A <strong>gMSA</strong> can be appropriate when a service needs a domain identity and the SQL Server deployment supports it. Active Directory manages its password; configuration requires the account to be permitted on the relevant hosts and depends on domain prerequisites. Validate support and SPN ownership for the specific topology.</p>
<ul>
  <li><strong>Managed password</strong> — no expiry incident, no password stored in a configuration file</li>
  <li><strong>Stronger identity</strong> — cannot be used interactively by a human</li>
  <li><strong>Kerberos</strong> — the account can own the service SPN; correct SPN and delegation configuration is still required</li>
  <li><strong>Cost</strong> — AD administration and KDS planning; not worth it for a lab box</li>
</ul>
<p>Prefer separate, least-privilege service identities over a shared account. Choose the identity based on required local and network access, and follow SQL Server's supported configuration guidance.</p>
`
    },
    {
      h: "Groups: the only sane way to grant access",
      html: `
<p>Grant permissions to <strong>groups</strong>, not individuals. Windows supports nested membership: a user belongs to a domain global group, which is a member of a local group on the SQL Server, which holds the right to a folder or a SQL login. Changing a person's access then means one group-membership change, not a hunt through every ACL.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Windows identity chain from user and service to SQL Server access">
    <defs>
      <marker id="acct-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="20" y="40" width="150" height="84" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="95" y="72" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Domain user</text>
    <text x="95" y="94" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">CONTOSO\\alice</text>

    <rect x="200" y="40" width="170" height="84" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="285" y="72" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Global group</text>
    <text x="285" y="94" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">CONTOSO\\SQL_DBAs</text>

    <rect x="400" y="40" width="180" height="84" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.5"/>
    <text x="490" y="72" text-anchor="middle" fill="var(--accent-strong)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Local SQL group</text>
    <text x="490" y="94" text-anchor="middle" fill="var(--muted)" font-size="10.5" font-family="Segoe UI, sans-serif">SQLServerMSSQLUser$…</text>

    <rect x="610" y="40" width="130" height="84" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="675" y="72" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Access</text>
    <text x="675" y="94" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">files + logins</text>

    <rect x="60" y="200" width="180" height="84" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="150" y="232" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">gMSA</text>
    <text x="150" y="254" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">CONTOSO\\svc_sql$</text>

    <rect x="310" y="200" width="180" height="84" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="400" y="232" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">SID + SPN</text>
    <text x="400" y="254" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">managed password</text>

    <rect x="560" y="200" width="180" height="84" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.5"/>
    <text x="650" y="232" text-anchor="middle" fill="var(--accent-strong)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">SQL service</text>
    <text x="650" y="254" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">engine + Agent</text>

    <line x1="170" y1="82" x2="198" y2="82" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#acct-arrow)"/>
    <line x1="370" y1="82" x2="398" y2="82" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#acct-arrow)"/>
    <line x1="580" y1="82" x2="608" y2="82" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#acct-arrow)"/>
    <line x1="240" y1="242" x2="308" y2="242" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#acct-arrow)"/>
    <line x1="490" y1="242" x2="558" y2="242" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#acct-arrow)"/>

    <text x="380" y="320" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Names are labels; SIDs are identity — grant to groups so a leaver is one membership change.</text>
  </svg>
  <div class="figcaption">Figure 1 — Human access flows through domain groups; the SQL service uses its own managed identity.</div>
</div>
<pre><code class="language-powershell">Add-LocalGroupMember -Group 'SQLServerMSSQLUser$SQL01$MSSQLSERVER' -Member 'CONTOSO\\SQL_DBAs'
Get-LocalGroupMember -Group 'SQLServerMSSQLUser$SQL01$MSSQLSERVER' | Select-Object Name, PrincipalSource</code></pre>
<p>Keep a separate group for DBAs with sysadmin rights, a read-only monitoring group, and a deployment group for application releases. Audit membership quarterly: inherited access accumulates quietly in large organisations.</p>
`
    },
    {
      h: "Windows authentication, SQL authentication, and Kerberos",
      html: `
<p><strong>Windows authentication</strong> is the default and the right choice for most estates: credentials are managed centrally, passwords never appear in a connection string, and Kerberos can delegate identity through multiple hops. <strong>SQL authentication</strong> is sometimes unavoidable for legacy applications or cross-domain access, but it puts password policy, rotation, and storage in the application's hands.</p>
<table>
  <tr><th>Concern</th><th>Windows auth</th><th>SQL auth</th></tr>
  <tr><td>Password storage</td><td>Central directory</td><td>Connection string or secret store</td></tr>
  <tr><td>Delegation / double hop</td><td>Kerberos with SPNs and constrained delegation</td><td>Not supported by the same mechanism</td></tr>
  <tr><td>Audit and leaver process</td><td>Disable the AD account once</td><td>Change every application that uses the login</td></tr>
  <tr><td>When to use</td><td>Default for domain applications</td><td>Legacy, workgroup, or mixed-platform constraints</td></tr>
</table>
<p>Kerberos connections require a correctly registered <strong>Service Principal Name</strong> for the SQL Server service and a client connection using the corresponding name. Without the right SPN, authentication might use another protocol or fail; delegation for a second hop requires additional configuration. Check the service identity and SPN rather than assuming a fallback:</p>
<pre><code class="language-powershell">setspn -L CONTOSO\\svc_sql
Test-NetConnection -ComputerName sql01.contoso.com -Port 1433</code></pre>
<pre><code class="language-sql">-- Windows group login and SID verification
CREATE LOGIN [CONTOSO\\SQL_DBAs] FROM WINDOWS;
SELECT name, type_desc, is_disabled FROM sys.server_principals WHERE type IN ('U', 'G');
SELECT SUSER_SID('CONTOSO\\SQL_DBAs') AS login_sid;</code></pre>
<p>If an account was deleted and recreated, its SID changes. Review server logins and database users by SID and use the supported login/user remapping procedure; <code>sp_change_users_login</code> is deprecated, so prefer catalog views and <code>ALTER USER ... WITH LOGIN</code> where appropriate.</p>
`
    },
    {
      h: "Account lifecycle and production pitfalls",
      html: `
<p>Most account-related outages are not clever attacks; they are routine maintenance with an unexpected blast radius. Build these checks into change control:</p>
<ul>
  <li><strong>Password expiry:</strong> a domain service account with an expiring password stops SQL Server the moment it needs a new logon. gMSA or virtual accounts remove this class of failure entirely.</li>
  <li><strong>Account disable:</strong> leaver processes often disable "unused" accounts that a service still uses. Document service accounts in the CMDB and exclude them from automated leaver scripts.</li>
  <li><strong>Rename and recreate:</strong> renaming is safe (SID preserved); deleting and recreating is not. Map logins by SID before and after directory work.</li>
  <li><strong>Lockout:</strong> a stale password in a reporting tool can lock a service account and take down multiple services at once.</li>
  <li><strong>Excessive privilege:</strong> a service account that is a Domain Admin turns a SQL injection flaw into a domain compromise. Least privilege is a containment strategy.</li>
  <li><strong>Stale group members:</strong> contractors who changed team keep sysadmin rights until someone audits membership.</li>
</ul>
<pre><code class="language-powershell">Get-CimInstance Win32_Service -Filter "Name='MSSQLSERVER'" | Select-Object Name, StartName, State
Get-ADUser -Identity 'svc_sql' -Properties Enabled, PasswordLastSet, AccountLockoutTime, LastBadPasswordAttempt | Select-Object Enabled, PasswordLastSet, AccountLockoutTime</code></pre>
<p>On an estate with many instances, keep a single source of truth: service identity, SPNs, DBA group names, and the owner of each account. When an incident starts, that record is faster than any diagnostic command.</p>
`
    }
  ],

  scenario: {
    title: "Service restart failed on a Sunday night because a leaver was disabled",
    html: `
<p>A patching window restarts the SQL Server at 02:00. The service never comes back: Windows reports <em>Error 1069: The service did not start due to a logon failure</em>. Helpdesk had disabled a domain account two days earlier as part of a leaver process — the account belonged to a former contractor but had been reused as the SQL Server service account on three instances. Nobody had recorded it, so the disable looked harmless.</p>
<p>The on-call DBA confirms the service's <code>StartName</code>, checks the account in Active Directory, and temporarily restores the password to get production back before 03:00. The permanent fix is a gMSA created for the SQL estate, added to the permitted host group, configured as the service identity for the engine and Agent, and granted the same file and SQL permissions through the existing groups. All three instances are restarted and monitored for a full business day.</p>
<p>Prevention: service accounts live in a protected OU with an owner and an exclusion from leaver automation; every instance build uses a gMSA or virtual account; and the patching runbook includes a pre-check that the service identity is enabled and its password is healthy.</p>
`
  },

  interview: [
    {
      q: "Why does recreating a Windows account with the same name break a SQL login?",
      a: "SQL Server stores the Windows SID, not the name. Delete and recreate gives a new SID, so the login no longer matches the directory principal even though the display name looks identical. I compare SUSER_SID with the AD object SID, then drop and recreate the login from Windows and remap database users."
    },
    {
      q: "When would you use a gMSA instead of a virtual account for SQL Server?",
      a: "When the SQL Server version and topology support it and the service needs a domain identity, such as access to domain resources. A gMSA has an Active Directory-managed password, but SPNs and delegation still need correct configuration. A virtual account is often suitable when the service only needs local resources."
    },
    {
      q: "Why grant SQL permissions through Windows groups?",
      a: "It centralises the lifecycle: join or leave one group and every ACL and SQL login updates, with one audit trail. It also avoids orphaned personal grants when people change roles. I keep separate groups for DBAs, monitoring, and deployments so the privilege level is visible from the membership alone."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “Windows identifies principals by a _____ such as S-1-5-21-….”",
      "options": [
        "Stronger identity",
        "SPN registration",
        "security identifier (SID)"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Windows identifies principals by a security identifier (SID) such as S-1-5-21-…. The username is a friendly label, and renaming an account leaves its SID untouched. Deleting and recreating an account with exactly the same name produces a different SID — every permission grant and every SQL login attached to the old SID becomes orphaned.”"
    },
    {
      "question": "Complete the lesson statement: “A _____ exists in the server's SAM database and is scoped to that machine.”",
      "options": [
        "Cost",
        "local account",
        "SPN registration"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A local account exists in the server's SAM database and is scoped to that machine. A domain account lives in Active Directory, is usable across the estate, and participates in Kerberos authentication. Managed identities in Entra ID extend the same idea to cloud-hosted resources.”"
    },
    {
      "question": "Complete the lesson statement: “Modern SQL Server installations default to _____ named after the service: NT SERVICE\\MSSQLSERVER for the engine and NT SERVICE\\SQLSERVERAGENT for Agent.”",
      "options": [
        "virtual accounts",
        "Cost",
        "Network Service"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Modern SQL Server installations default to virtual accounts named after the service: NT SERVICE\\MSSQLSERVER for the engine and NT SERVICE\\SQLSERVERAGENT for Agent. They have no password to expire, are scoped to the local machine, and carry a per-service SID that can be granted rights on the file system. That is why SQL setup can create SQLServerMSSQLUser$SQL01$MSSQLSERVER and grant it access to the data directory without touching a domain account.”"
    },
    {
      "question": "Complete the lesson statement: “Grant permissions to _____, not individuals.”",
      "options": [
        "Cost",
        "Network Service",
        "groups"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Grant permissions to groups, not individuals. Windows supports nested membership: a user belongs to a domain global group, which is a member of a local group on the SQL Server, which holds the right to a folder or a SQL login. Changing a person's access then means one group-membership change, not a hunt through every ACL.”"
    },
    {
      "question": "Complete the lesson statement: “_____ is the default and the right choice for most estates: credentials are managed centrally, passwords never appear in a connection string, and Kerberos can delegate identity through multiple hops.”",
      "options": [
        "groups",
        "Windows authentication",
        "Network Service"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Windows authentication is the default and the right choice for most estates: credentials are managed centrally, passwords never appear in a connection string, and Kerberos can delegate identity through multiple hops. SQL authentication is sometimes unavoidable for legacy applications or cross-domain access, but it puts password policy, rotation, and storage in the application's hands.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Account lifecycle and production pitfalls”?",
      "options": [
        "Most account-related outages are not clever attacks; they are routine maintenance with an unexpected blast radius.",
        "Central disable, reset, and audit",
        "Enterprise SQL Server services and DBA groups"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Most account-related outages are not clever attacks; they are routine maintenance with an unexpected blast radius. Build these checks into change control:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Accounts, SIDs, and why names are only labels”?",
      "options": [
        "Service Principal Name",
        "If a login shows a SID that no longer matches the directory account, drop and recreate the login from Windows, then remap database users with ALTER USER...",
        "server_principals, but users cannot connect because the Windows SID behind it no longer exists."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “This is the root of some of the most confusing incidents in SQL Server: a login still appears in sys.server_principals, but users cannot connect because the Windows SID behind it no longer exists. Conversely, a renamed account continues to work because the SID is stable.”"
    },
    {
      "question": "Complete the lesson statement: “For anything domain-joined, use a dedicated _____ for the engine and Agent, and a domain security group for the DBAs.”",
      "options": [
        "Password expiry:",
        "group Managed Service Account (gMSA)",
        "Service Principal Name"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “For a standalone SQL Server, local groups and virtual accounts are fine. For anything domain-joined, use a dedicated group Managed Service Account (gMSA) for the engine and Agent, and a domain security group for the DBAs. Do not use a person's own account for a service: when that person leaves and the account is disabled, the database service dies at the next restart.”"
    },
    {
      "question": "Complete the lesson statement: “In a domain, a _____ is usually better: Active Directory manages a long, rotating password automatically, interactive logon is disallowed, and the identity works across multiple servers in an Availability Group.”",
      "options": [
        "gMSA",
        "Password expiry:",
        "Account disable:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In a domain, a gMSA is usually better: Active Directory manages a long, rotating password automatically, interactive logon is disallowed, and the identity works across multiple servers in an Availability Group. Requirements include a Key Distribution Service root key and a principle group listing the hosts allowed to retrieve the password.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Groups: the only sane way to grant access”?",
      "options": [
        "Network Service",
        "Windows authentication",
        "Keep a separate group for DBAs with sysadmin rights, a read-only monitoring group, and a deployment group for application releases."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Keep a separate group for DBAs with sysadmin rights, a read-only monitoring group, and a deployment group for application releases. Audit membership quarterly: inherited access accumulates quietly in large organisations.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “Windows identifies principals by a _____ such as S-1-5-21-….”",
      "options": [
        "Stronger identity",
        "SPN registration",
        "security identifier (SID)"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Windows identifies principals by a security identifier (SID) such as S-1-5-21-…. The username is a friendly label, and renaming an account leaves its SID untouched. Deleting and recreating an account with exactly the same name produces a different SID — every permission grant and every SQL login attached to the old SID becomes orphaned.”"
    },
    {
      "question": "Complete the lesson statement: “A _____ exists in the server's SAM database and is scoped to that machine.”",
      "options": [
        "Cost",
        "local account",
        "SPN registration"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A local account exists in the server's SAM database and is scoped to that machine. A domain account lives in Active Directory, is usable across the estate, and participates in Kerberos authentication. Managed identities in Entra ID extend the same idea to cloud-hosted resources.”"
    },
    {
      "question": "Complete the lesson statement: “Modern SQL Server installations default to _____ named after the service: NT SERVICE\\MSSQLSERVER for the engine and NT SERVICE\\SQLSERVERAGENT for Agent.”",
      "options": [
        "virtual accounts",
        "Cost",
        "Network Service"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Modern SQL Server installations default to virtual accounts named after the service: NT SERVICE\\MSSQLSERVER for the engine and NT SERVICE\\SQLSERVERAGENT for Agent. They have no password to expire, are scoped to the local machine, and carry a per-service SID that can be granted rights on the file system. That is why SQL setup can create SQLServerMSSQLUser$SQL01$MSSQLSERVER and grant it access to the data directory without touching a domain account.”"
    },
    {
      "question": "Complete the lesson statement: “Grant permissions to _____, not individuals.”",
      "options": [
        "Cost",
        "Network Service",
        "groups"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Grant permissions to groups, not individuals. Windows supports nested membership: a user belongs to a domain global group, which is a member of a local group on the SQL Server, which holds the right to a folder or a SQL login. Changing a person's access then means one group-membership change, not a hunt through every ACL.”"
    },
    {
      "question": "Complete the lesson statement: “_____ is the default and the right choice for most estates: credentials are managed centrally, passwords never appear in a connection string, and Kerberos can delegate identity through multiple hops.”",
      "options": [
        "groups",
        "Windows authentication",
        "Network Service"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Windows authentication is the default and the right choice for most estates: credentials are managed centrally, passwords never appear in a connection string, and Kerberos can delegate identity through multiple hops. SQL authentication is sometimes unavoidable for legacy applications or cross-domain access, but it puts password policy, rotation, and storage in the application's hands.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Account lifecycle and production pitfalls”?",
      "options": [
        "Most account-related outages are not clever attacks; they are routine maintenance with an unexpected blast radius.",
        "Central disable, reset, and audit",
        "Enterprise SQL Server services and DBA groups"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Most account-related outages are not clever attacks; they are routine maintenance with an unexpected blast radius. Build these checks into change control:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Accounts, SIDs, and why names are only labels”?",
      "options": [
        "Service Principal Name",
        "If a login shows a SID that no longer matches the directory account, drop and recreate the login from Windows, then remap database users with ALTER USER...",
        "server_principals, but users cannot connect because the Windows SID behind it no longer exists."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “This is the root of some of the most confusing incidents in SQL Server: a login still appears in sys.server_principals, but users cannot connect because the Windows SID behind it no longer exists. Conversely, a renamed account continues to work because the SID is stable.”"
    },
    {
      "question": "Complete the lesson statement: “For anything domain-joined, use a dedicated _____ for the engine and Agent, and a domain security group for the DBAs.”",
      "options": [
        "Password expiry:",
        "group Managed Service Account (gMSA)",
        "Service Principal Name"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “For a standalone SQL Server, local groups and virtual accounts are fine. For anything domain-joined, use a dedicated group Managed Service Account (gMSA) for the engine and Agent, and a domain security group for the DBAs. Do not use a person's own account for a service: when that person leaves and the account is disabled, the database service dies at the next restart.”"
    },
    {
      "question": "Complete the lesson statement: “In a domain, a _____ is usually better: Active Directory manages a long, rotating password automatically, interactive logon is disallowed, and the identity works across multiple servers in an Availability Group.”",
      "options": [
        "gMSA",
        "Password expiry:",
        "Account disable:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In a domain, a gMSA is usually better: Active Directory manages a long, rotating password automatically, interactive logon is disallowed, and the identity works across multiple servers in an Availability Group. Requirements include a Key Distribution Service root key and a principle group listing the hosts allowed to retrieve the password.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Groups: the only sane way to grant access”?",
      "options": [
        "Network Service",
        "Windows authentication",
        "Keep a separate group for DBAs with sysadmin rights, a read-only monitoring group, and a deployment group for application releases."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Keep a separate group for DBAs with sysadmin rights, a read-only monitoring group, and a deployment group for application releases. Audit membership quarterly: inherited access accumulates quietly in large organisations.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “Windows identifies principals by a _____ such as S-1-5-21-….”",
      "options": [
        "Stronger identity",
        "SPN registration",
        "security identifier (SID)"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Windows identifies principals by a security identifier (SID) such as S-1-5-21-…. The username is a friendly label, and renaming an account leaves its SID untouched. Deleting and recreating an account with exactly the same name produces a different SID — every permission grant and every SQL login attached to the old SID becomes orphaned.”"
    },
    {
      "question": "Complete the lesson statement: “A _____ exists in the server's SAM database and is scoped to that machine.”",
      "options": [
        "Cost",
        "local account",
        "SPN registration"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A local account exists in the server's SAM database and is scoped to that machine. A domain account lives in Active Directory, is usable across the estate, and participates in Kerberos authentication. Managed identities in Entra ID extend the same idea to cloud-hosted resources.”"
    },
    {
      "question": "Complete the lesson statement: “Modern SQL Server installations default to _____ named after the service: NT SERVICE\\MSSQLSERVER for the engine and NT SERVICE\\SQLSERVERAGENT for Agent.”",
      "options": [
        "virtual accounts",
        "Cost",
        "Network Service"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Modern SQL Server installations default to virtual accounts named after the service: NT SERVICE\\MSSQLSERVER for the engine and NT SERVICE\\SQLSERVERAGENT for Agent. They have no password to expire, are scoped to the local machine, and carry a per-service SID that can be granted rights on the file system. That is why SQL setup can create SQLServerMSSQLUser$SQL01$MSSQLSERVER and grant it access to the data directory without touching a domain account.”"
    },
    {
      "question": "Complete the lesson statement: “Grant permissions to _____, not individuals.”",
      "options": [
        "Cost",
        "Network Service",
        "groups"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Grant permissions to groups, not individuals. Windows supports nested membership: a user belongs to a domain global group, which is a member of a local group on the SQL Server, which holds the right to a folder or a SQL login. Changing a person's access then means one group-membership change, not a hunt through every ACL.”"
    },
    {
      "question": "Complete the lesson statement: “_____ is the default and the right choice for most estates: credentials are managed centrally, passwords never appear in a connection string, and Kerberos can delegate identity through multiple hops.”",
      "options": [
        "groups",
        "Windows authentication",
        "Network Service"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Windows authentication is the default and the right choice for most estates: credentials are managed centrally, passwords never appear in a connection string, and Kerberos can delegate identity through multiple hops. SQL authentication is sometimes unavoidable for legacy applications or cross-domain access, but it puts password policy, rotation, and storage in the application's hands.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Account lifecycle and production pitfalls”?",
      "options": [
        "Most account-related outages are not clever attacks; they are routine maintenance with an unexpected blast radius.",
        "Central disable, reset, and audit",
        "Enterprise SQL Server services and DBA groups"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Most account-related outages are not clever attacks; they are routine maintenance with an unexpected blast radius. Build these checks into change control:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Accounts, SIDs, and why names are only labels”?",
      "options": [
        "Service Principal Name",
        "If a login shows a SID that no longer matches the directory account, drop and recreate the login from Windows, then remap database users with ALTER USER...",
        "server_principals, but users cannot connect because the Windows SID behind it no longer exists."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “This is the root of some of the most confusing incidents in SQL Server: a login still appears in sys.server_principals, but users cannot connect because the Windows SID behind it no longer exists. Conversely, a renamed account continues to work because the SID is stable.”"
    },
    {
      "question": "Complete the lesson statement: “For anything domain-joined, use a dedicated _____ for the engine and Agent, and a domain security group for the DBAs.”",
      "options": [
        "Password expiry:",
        "group Managed Service Account (gMSA)",
        "Service Principal Name"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “For a standalone SQL Server, local groups and virtual accounts are fine. For anything domain-joined, use a dedicated group Managed Service Account (gMSA) for the engine and Agent, and a domain security group for the DBAs. Do not use a person's own account for a service: when that person leaves and the account is disabled, the database service dies at the next restart.”"
    },
    {
      "question": "Complete the lesson statement: “In a domain, a _____ is usually better: Active Directory manages a long, rotating password automatically, interactive logon is disallowed, and the identity works across multiple servers in an Availability Group.”",
      "options": [
        "gMSA",
        "Password expiry:",
        "Account disable:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In a domain, a gMSA is usually better: Active Directory manages a long, rotating password automatically, interactive logon is disallowed, and the identity works across multiple servers in an Availability Group. Requirements include a Key Distribution Service root key and a principle group listing the hosts allowed to retrieve the password.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Groups: the only sane way to grant access”?",
      "options": [
        "Network Service",
        "Windows authentication",
        "Keep a separate group for DBAs with sysadmin rights, a read-only monitoring group, and a deployment group for application releases."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Keep a separate group for DBAs with sysadmin rights, a read-only monitoring group, and a deployment group for application releases. Audit membership quarterly: inherited access accumulates quietly in large organisations.”"
    }
  ],
  takeaways: [
    "SIDs define identity; account names are labels — rename is safe, delete-and-recreate is not",
    "Use virtual accounts for standalone servers and gMSAs for domain-joined instances",
    "Grant file and SQL access through groups, never through a stream of individual accounts",
    "Windows authentication with correct SPNs is the default; SQL authentication is an exception",
    "Service-account password expiry, lockout, and leaver scripts are common causes of SQL outages"
  ]
};
