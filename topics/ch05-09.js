/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch05-09.html */

window.TOPIC = {
  id: "ch05-09",
  title: "Authentication Modes: Windows, SQL Server, Mixed",

  lead: "Authentication mode decides who — or what — is allowed to connect to your instance, and choosing it wrong either breaks every application at cutover or leaves a shared password in a connection string forever.",

  objectives: [
    "Explain Windows, SQL Server, and Mixed authentication",
    "Compare security properties of each mode",
    "Choose the right mode for an application landscape",
    "Change authentication mode safely on an existing instance",
    "Provision and audit logins correctly"
  ],

  sections: [
    {
      h: "One decision, three outcomes",
      html: `
<p>At installation (and afterwards, in server properties) you choose how the instance validates a login:</p>
<table>
  <tr><th>Mode</th><th>Accepted logins</th><th>Typical use</th></tr>
  <tr><td><strong>Windows authentication only</strong></td><td>Domain and local Windows accounts/groups</td><td>Modern estates — the secure default</td></tr>
  <tr><td><strong>Mixed (SQL Server + Windows)</strong></td><td>Windows accounts <em>and</em> SQL Server logins</td><td>Legacy apps, cross-domain, non-Windows clients</td></tr>
  <tr><td><strong>SQL Database / contained</strong></td><td>Contained database users (authentication at database level)</td><td>Cloud and modern designs where portability matters</td></tr>
</table>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Authentication flow for Windows and SQL logins">
    <defs>
      <marker id="auth-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="20" y="130" width="140" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="90" y="158" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Client connects</text>
    <text x="90" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">TDS · port 1433/1500</text>

    <rect x="200" y="118" width="180" height="94" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="290" y="146" text-anchor="middle" fill="var(--accent-strong)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Server authentication mode</text>
    <text x="290" y="170" text-anchor="middle" fill="var(--text)" font-size="11.5" font-family="Segoe UI, sans-serif">Windows only → Windows path</text>
    <text x="290" y="190" text-anchor="middle" fill="var(--text)" font-size="11.5" font-family="Segoe UI, sans-serif">Mixed → both paths allowed</text>

    <rect x="440" y="30" width="190" height="76" rx="10" fill="var(--surface)" stroke="var(--border)"/>
    <text x="535" y="56" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Windows path</text>
    <text x="535" y="77" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Kerberos / NTLM token</text>
    <text x="535" y="95" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">→ domain group membership</text>

    <rect x="440" y="180" width="190" height="76" rx="10" fill="var(--surface)" stroke="var(--amber)" stroke-width="1.8"/>
    <text x="535" y="206" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">SQL Server path</text>
    <text x="535" y="227" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">login + password hash</text>
    <text x="535" y="245" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">stored in master</text>

    <rect x="660" y="105" width="90" height="110" rx="10" fill="var(--accent)" stroke="var(--accent-strong)"/>
    <text x="705" y="145" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">Server</text>
    <text x="705" y="165" text-anchor="middle" fill="#dbeafe" font-size="11.5" font-family="Segoe UI, sans-serif">login →</text>
    <text x="705" y="182" text-anchor="middle" fill="#dbeafe" font-size="11.5" font-family="Segoe UI, sans-serif">database user</text>
    <text x="705" y="199" text-anchor="middle" fill="#dbeafe" font-size="11.5" font-family="Segoe UI, sans-serif">→ permissions</text>

    <line x1="160" y1="165" x2="198" y2="165" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#auth-arrow)"/>
    <line x1="380" y1="145" x2="438" y2="80" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#auth-arrow)"/>
    <line x1="380" y1="185" x2="438" y2="215" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#auth-arrow)"/>
    <line x1="630" y1="70" x2="668" y2="115" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#auth-arrow)"/>
    <line x1="630" y1="220" x2="668" y2="200" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#auth-arrow)"/>

    <text x="380" y="310" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Authentication proves who you are; authorisation (users, roles, permissions) happens after, per database.</text>
  </svg>
  <div class="figcaption">Figure 1 — Authentication paths: Windows tokens or SQL password checks, both converging on a server login.</div>
</div>
`
    },
    {
      h: "Windows authentication",
      html: `
<p>Windows authentication validates the caller's <strong>security token</strong> — issued by Active Directory (Kerberos) or the local machine (NTLM). SQL Server never sees a password; it sees group membership and trusts the domain to have done the hard work.</p>
<table>
  <tr><th>Strength</th><th>What it means in practice</th></tr>
  <tr><td>Single sign-on</td><td>Users connect with their own account — no shared secrets, no password in a config file</td></tr>
  <tr><td>Central policy</td><td>Password complexity, expiry, lockout, and account disablement all happen in Active Directory</td></tr>
  <tr><td>Auditability</td><td>Events tie to a named person or service account, not to “the app login”</td></tr>
  <tr><td>Group-based administration</td><td>Add a user to <code>CORP\SQL-ERP-Users</code> and access flows through group membership</td></tr>
</table>
<p>The known limitation is the <strong>double hop</strong>: a service using Windows auth cannot easily impersonate a user to reach a second server (a linked server or file share) without Kerberos delegation configured. Design for it — use constrained delegation, a service account with explicit rights, or SQL authentication for the service-to-service hop.</p>
`
    },
    {
      h: "SQL Server authentication",
      html: `
<p>SQL authentication stores a <strong>login and password hash inside the instance</strong> (master database). It works anywhere, from any client, with no domain relationship — which is exactly why it is also the weakest link when unmanaged.</p>
<table>
  <tr><th>Concern</th><th>Reality</th></tr>
  <tr><td>Passwords</td><td>Managed per login; policy enforcement only if <code>CHECK_POLICY = ON</code></td></tr>
  <tr><td>Connection strings</td><td>Contain a secret — it ends up in config files, CI variables, and code repositories</td></tr>
  <tr><td>The <code>sa</code> account</td><td>Target number one for attackers; should be disabled or renamed with a long random password</td></tr>
  <tr><td>Auditing</td><td>“app_login” tells you the application connected, not which human ran the query</td></tr>
  <tr><td>Cross-domain / non-Windows</td><td>Genuinely useful — legacy apps, Linux clients, external integrations</td></tr>
</table>
<p>SQL logins are not forbidden — they must be <strong>governed</strong>: policy checked, inventoried, rotated, and owned. Where possible prefer <strong>contained database users</strong>, which move the credential into the database itself and survive restores more gracefully.</p>
`
    },
    {
      h: "Choosing and changing the mode",
      html: `
<p>Decision guide:</p>
<table>
  <tr><th>Situation</th><th>Choose</th></tr>
  <tr><td>All clients are domain-joined or can use Windows auth</td><td><strong>Windows authentication only</strong></td></tr>
  <tr><td>One legacy application requires a SQL login</td><td>Mixed — then migrate that app to Windows auth when possible</td></tr>
  <tr><td>Cross-forest or external integration</td><td>Mixed, with SQL logins under policy and monitoring</td></tr>
  <tr><td>Greenfield, cloud-synced, or Linux clients</td><td>Mixed or contained authentication — document the exception</td></tr>
</table>
<p>Changing the mode on a live instance:</p>
<ol>
  <li>SSMS → right-click the server → Properties → Security → select the mode (this writes the <code>LoginMode</code> registry value)</li>
  <li><strong>Restart the Database Engine service</strong> — the setting takes effect only after restart</li>
  <li>Enable SQL logins <em>before</em> the restart if applications already expect them, or connections will fail</li>
  <li>Verify with <code>SERVERPROPERTY('IsIntegratedSecurityOnly')</code> and a test connection in each application</li>
</ol>
<p>Never flip to Windows-only “to improve security” without inventorying every SQL login in use — that is a self-inflicted outage.</p>
`
    },
    {
      h: "Provisioning and auditing logins",
      html: `
<p>Find the current mode and the risky logins:</p>
<pre><code class="language-sql">-- 1 = Windows authentication only, 0 = mixed mode
SELECT SERVERPROPERTY('IsIntegratedSecurityOnly') AS is_windows_only,
       SERVERPROPERTY('Name')                     AS server_name;

-- SQL logins with policy enforcement disabled (audit red flag)
SELECT name, is_disabled, is_policy_checked, is_expiration_checked, create_date
FROM   sys.sql_logins
WHERE  is_policy_checked = 0
ORDER  BY create_date DESC;</code></pre>
<p>Provisioning done properly:</p>
<pre><code class="language-sql">-- Windows login from a domain group (preferred)
CREATE LOGIN [CORP\APP-ERP-Readers] FROM WINDOWS WITH DEFAULT_DATABASE = [AppDb];

-- SQL login with policy enforced — inject a real secret at deployment time
CREATE LOGIN app_reader
  WITH PASSWORD      = N'Temp0rary!Passw0rd-rotate-me',
       CHECK_POLICY   = ON,
       CHECK_EXPIRATION = ON,
       DEFAULT_DATABASE = [AppDb];

-- Database-level access (login alone grants nothing inside a database)
CREATE USER app_reader FOR LOGIN app_reader;
ALTER ROLE db_datareader ADD MEMBER app_reader;

-- Harden the legacy account
ALTER LOGIN sa DISABLE;   -- or rename it and store the password in the vault</code></pre>
<p>Audit quarterly: disabled-but-present logins, logins with policy off, members of <code>sysadmin</code>, and any password that has not changed within your rotation policy. Authentication mode is set once; <strong>login hygiene is continuous</strong>.</p>
`
    }
  ],

  scenario: {
    title: "Penetration test reports “sa login with default password attempt” at 4 PM",
    html: `
<p>A red-team engagement flagged that the production instance ran in Mixed mode with <code>sa</code> enabled, a password unchanged since installation, and policy checks disabled on three application logins — all discovered from a leaked connection string in a public code repository. The team had until Friday's report to demonstrate remediation, and the applications could not tolerate a connectivity outage while changes were made.</p>
<p>Resolution that evening: inventory every SQL login and its usage via <code>sys.dm_exec_connections</code> and login auditing; disable <code>sa</code> (the applications did not use it); enable <code>CHECK_POLICY</code> on the three logins after confirming their password complexity would pass; rotate the application passwords through the deployment pipeline; enable failed-login auditing; and move the two applications that could support it to Windows authentication. Prevention: SQL logins are now created only through a deployment process with policy on, <code>sa</code> is disabled in the build standard, and repository secret scanning was added to CI.</p>
`
  },

  interview: [
    {
      q: "Windows or Mixed authentication — what do you choose for a new production instance?",
      a: "Windows authentication only, wherever the client landscape allows it: no passwords in connection strings, Active Directory enforces policy and expiry, and auditing names real accounts. Mixed mode only when a named application or integration genuinely requires SQL logins — and then those logins are governed with CHECK_POLICY and rotation."
    },
    {
      q: "How do you change the authentication mode on a live server?",
      a: "Through server Properties → Security in SSMS (which sets the LoginMode registry value), then restart the Database Engine for it to take effect. Before restarting, inventory SQL logins so applications still using them are either migrated or enabled — otherwise the restart becomes an outage."
    },
    {
      q: "What does SERVERPROPERTY('IsIntegratedSecurityOnly') return?",
      a: "1 when the server accepts Windows authentication only, 0 when it is in Mixed mode (both Windows and SQL Server authentication available). It is the quickest T-SQL check of the configured mode."
    }
  ],

  quiz: [
    {
      "question": "Which fact is covered in the lesson section “One decision, three outcomes”?",
      "options": [
        "At installation (and afterwards, in server properties) you choose how the instance validates a login:",
        "Contain a secret — it ends up in config files, CI variables, and code repositories",
        "Target number one for attackers; should be disabled or renamed with a long random password"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “At installation (and afterwards, in server properties) you choose how the instance validates a login:”"
    },
    {
      "question": "Complete the lesson statement: “Windows authentication validates the caller's _____ — issued by Active Directory (Kerberos) or the local machine (NTLM).”",
      "options": [
        "login hygiene is continuous",
        "At installation (and afterwards, in server properties) you choose how the instance validates a login:",
        "security token"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Windows authentication validates the caller's security token — issued by Active Directory (Kerberos) or the local machine (NTLM). SQL Server never sees a password; it sees group membership and trusts the domain to have done the hard work.”"
    },
    {
      "question": "Complete the lesson statement: “SQL authentication stores a _____ (master database).”",
      "options": [
        "Modern estates — the secure default",
        "login and password hash inside the instance",
        "At installation (and afterwards, in server properties) you choose how the instance validates a login:"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “SQL authentication stores a login and password hash inside the instance (master database). It works anywhere, from any client, with no domain relationship — which is exactly why it is also the weakest link when unmanaged.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Choosing and changing the mode”?",
      "options": [
        "Changing the mode on a live instance:",
        "Managed per login; policy enforcement only if CHECK_POLICY = ON",
        "Contain a secret — it ends up in config files, CI variables, and code repositories"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Changing the mode on a live instance:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Provisioning and auditing logins”?",
      "options": [
        "Contain a secret — it ends up in config files, CI variables, and code repositories",
        "Target number one for attackers; should be disabled or renamed with a long random password",
        "Find the current mode and the risky logins:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Find the current mode and the risky logins:”"
    },
    {
      "question": "In the “One decision, three outcomes” table, what is listed for “Windows authentication only” under “Typical use”?",
      "options": [
        "Genuinely useful — legacy apps, Linux clients, external integrations",
        "Modern estates — the secure default",
        "“app_login” tells you the application connected, not which human ran the query"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Windows authentication only” as “Modern estates — the secure default”."
    },
    {
      "question": "Complete the lesson statement: “The known limitation is the _____: a service using Windows auth cannot easily impersonate a user to reach a second server (a linked server or file share) without Kerberos delegation configured.”",
      "options": [
        "double hop",
        "Users connect with their own account — no shared secrets, no password in a config file",
        "Password complexity, expiry, lockout, and account disablement all happen in Active Directory"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The known limitation is the double hop: a service using Windows auth cannot easily impersonate a user to reach a second server (a linked server or file share) without Kerberos delegation configured. Design for it — use constrained delegation, a service account with explicit rights, or SQL authentication for the service-to-service hop.”"
    },
    {
      "question": "Complete the lesson statement: “SQL logins are not forbidden — they must be _____: policy checked, inventoried, rotated, and owned.”",
      "options": [
        "Password complexity, expiry, lockout, and account disablement all happen in Active Directory",
        "Events tie to a named person or service account, not to “the app login”",
        "governed"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “SQL logins are not forbidden — they must be governed: policy checked, inventoried, rotated, and owned. Where possible prefer contained database users, which move the credential into the database itself and survive restores more gracefully.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Choosing and changing the mode”?",
      "options": [
        "login hygiene is continuous",
        "Never flip to Windows-only “to improve security” without inventorying every SQL login in use — that is a self-inflicted outage.",
        "Find the current mode and the risky logins:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Never flip to Windows-only “to improve security” without inventorying every SQL login in use — that is a self-inflicted outage.”"
    },
    {
      "question": "Complete the lesson statement: “Authentication mode is set once; _____.”",
      "options": [
        "login hygiene is continuous",
        "Add a user to CORPSQL-ERP-Users and access flows through group membership",
        "Managed per login; policy enforcement only if CHECK_POLICY = ON"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Audit quarterly: disabled-but-present logins, logins with policy off, members of sysadmin, and any password that has not changed within your rotation policy. Authentication mode is set once; login hygiene is continuous.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “One decision, three outcomes”?",
      "options": [
        "At installation (and afterwards, in server properties) you choose how the instance validates a login:",
        "Contain a secret — it ends up in config files, CI variables, and code repositories",
        "Target number one for attackers; should be disabled or renamed with a long random password"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “At installation (and afterwards, in server properties) you choose how the instance validates a login:”"
    },
    {
      "question": "Complete the lesson statement: “Windows authentication validates the caller's _____ — issued by Active Directory (Kerberos) or the local machine (NTLM).”",
      "options": [
        "login hygiene is continuous",
        "At installation (and afterwards, in server properties) you choose how the instance validates a login:",
        "security token"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Windows authentication validates the caller's security token — issued by Active Directory (Kerberos) or the local machine (NTLM). SQL Server never sees a password; it sees group membership and trusts the domain to have done the hard work.”"
    },
    {
      "question": "Complete the lesson statement: “SQL authentication stores a _____ (master database).”",
      "options": [
        "Modern estates — the secure default",
        "login and password hash inside the instance",
        "At installation (and afterwards, in server properties) you choose how the instance validates a login:"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “SQL authentication stores a login and password hash inside the instance (master database). It works anywhere, from any client, with no domain relationship — which is exactly why it is also the weakest link when unmanaged.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Choosing and changing the mode”?",
      "options": [
        "Changing the mode on a live instance:",
        "Managed per login; policy enforcement only if CHECK_POLICY = ON",
        "Contain a secret — it ends up in config files, CI variables, and code repositories"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Changing the mode on a live instance:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Provisioning and auditing logins”?",
      "options": [
        "Contain a secret — it ends up in config files, CI variables, and code repositories",
        "Target number one for attackers; should be disabled or renamed with a long random password",
        "Find the current mode and the risky logins:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Find the current mode and the risky logins:”"
    },
    {
      "question": "In the “One decision, three outcomes” table, what is listed for “Windows authentication only” under “Typical use”?",
      "options": [
        "Genuinely useful — legacy apps, Linux clients, external integrations",
        "Modern estates — the secure default",
        "“app_login” tells you the application connected, not which human ran the query"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Windows authentication only” as “Modern estates — the secure default”."
    },
    {
      "question": "Complete the lesson statement: “The known limitation is the _____: a service using Windows auth cannot easily impersonate a user to reach a second server (a linked server or file share) without Kerberos delegation configured.”",
      "options": [
        "double hop",
        "Users connect with their own account — no shared secrets, no password in a config file",
        "Password complexity, expiry, lockout, and account disablement all happen in Active Directory"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The known limitation is the double hop: a service using Windows auth cannot easily impersonate a user to reach a second server (a linked server or file share) without Kerberos delegation configured. Design for it — use constrained delegation, a service account with explicit rights, or SQL authentication for the service-to-service hop.”"
    },
    {
      "question": "Complete the lesson statement: “SQL logins are not forbidden — they must be _____: policy checked, inventoried, rotated, and owned.”",
      "options": [
        "Password complexity, expiry, lockout, and account disablement all happen in Active Directory",
        "Events tie to a named person or service account, not to “the app login”",
        "governed"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “SQL logins are not forbidden — they must be governed: policy checked, inventoried, rotated, and owned. Where possible prefer contained database users, which move the credential into the database itself and survive restores more gracefully.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Choosing and changing the mode”?",
      "options": [
        "login hygiene is continuous",
        "Never flip to Windows-only “to improve security” without inventorying every SQL login in use — that is a self-inflicted outage.",
        "Find the current mode and the risky logins:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Never flip to Windows-only “to improve security” without inventorying every SQL login in use — that is a self-inflicted outage.”"
    },
    {
      "question": "Complete the lesson statement: “Authentication mode is set once; _____.”",
      "options": [
        "login hygiene is continuous",
        "Add a user to CORPSQL-ERP-Users and access flows through group membership",
        "Managed per login; policy enforcement only if CHECK_POLICY = ON"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Audit quarterly: disabled-but-present logins, logins with policy off, members of sysadmin, and any password that has not changed within your rotation policy. Authentication mode is set once; login hygiene is continuous.”"
    }
  ],
  quiz: [
    {
      "question": "Which fact is covered in the lesson section “One decision, three outcomes”?",
      "options": [
        "At installation (and afterwards, in server properties) you choose how the instance validates a login:",
        "Contain a secret — it ends up in config files, CI variables, and code repositories",
        "Target number one for attackers; should be disabled or renamed with a long random password"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “At installation (and afterwards, in server properties) you choose how the instance validates a login:”"
    },
    {
      "question": "Complete the lesson statement: “Windows authentication validates the caller's _____ — issued by Active Directory (Kerberos) or the local machine (NTLM).”",
      "options": [
        "login hygiene is continuous",
        "At installation (and afterwards, in server properties) you choose how the instance validates a login:",
        "security token"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Windows authentication validates the caller's security token — issued by Active Directory (Kerberos) or the local machine (NTLM). SQL Server never sees a password; it sees group membership and trusts the domain to have done the hard work.”"
    },
    {
      "question": "Complete the lesson statement: “SQL authentication stores a _____ (master database).”",
      "options": [
        "Modern estates — the secure default",
        "login and password hash inside the instance",
        "At installation (and afterwards, in server properties) you choose how the instance validates a login:"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “SQL authentication stores a login and password hash inside the instance (master database). It works anywhere, from any client, with no domain relationship — which is exactly why it is also the weakest link when unmanaged.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Choosing and changing the mode”?",
      "options": [
        "Changing the mode on a live instance:",
        "Managed per login; policy enforcement only if CHECK_POLICY = ON",
        "Contain a secret — it ends up in config files, CI variables, and code repositories"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Changing the mode on a live instance:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Provisioning and auditing logins”?",
      "options": [
        "Contain a secret — it ends up in config files, CI variables, and code repositories",
        "Target number one for attackers; should be disabled or renamed with a long random password",
        "Find the current mode and the risky logins:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Find the current mode and the risky logins:”"
    },
    {
      "question": "In the “One decision, three outcomes” table, what is listed for “Windows authentication only” under “Typical use”?",
      "options": [
        "Genuinely useful — legacy apps, Linux clients, external integrations",
        "Modern estates — the secure default",
        "“app_login” tells you the application connected, not which human ran the query"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Windows authentication only” as “Modern estates — the secure default”."
    },
    {
      "question": "Complete the lesson statement: “The known limitation is the _____: a service using Windows auth cannot easily impersonate a user to reach a second server (a linked server or file share) without Kerberos delegation configured.”",
      "options": [
        "double hop",
        "Users connect with their own account — no shared secrets, no password in a config file",
        "Password complexity, expiry, lockout, and account disablement all happen in Active Directory"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The known limitation is the double hop: a service using Windows auth cannot easily impersonate a user to reach a second server (a linked server or file share) without Kerberos delegation configured. Design for it — use constrained delegation, a service account with explicit rights, or SQL authentication for the service-to-service hop.”"
    },
    {
      "question": "Complete the lesson statement: “SQL logins are not forbidden — they must be _____: policy checked, inventoried, rotated, and owned.”",
      "options": [
        "Password complexity, expiry, lockout, and account disablement all happen in Active Directory",
        "Events tie to a named person or service account, not to “the app login”",
        "governed"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “SQL logins are not forbidden — they must be governed: policy checked, inventoried, rotated, and owned. Where possible prefer contained database users, which move the credential into the database itself and survive restores more gracefully.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Choosing and changing the mode”?",
      "options": [
        "login hygiene is continuous",
        "Never flip to Windows-only “to improve security” without inventorying every SQL login in use — that is a self-inflicted outage.",
        "Find the current mode and the risky logins:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Never flip to Windows-only “to improve security” without inventorying every SQL login in use — that is a self-inflicted outage.”"
    },
    {
      "question": "Complete the lesson statement: “Authentication mode is set once; _____.”",
      "options": [
        "login hygiene is continuous",
        "Add a user to CORPSQL-ERP-Users and access flows through group membership",
        "Managed per login; policy enforcement only if CHECK_POLICY = ON"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Audit quarterly: disabled-but-present logins, logins with policy off, members of sysadmin, and any password that has not changed within your rotation policy. Authentication mode is set once; login hygiene is continuous.”"
    }
  ],
  takeaways: [
    "Windows authentication uses domain tokens — SSO, central policy, named auditing; watch the double-hop limit",
    "SQL authentication stores logins in master — convenient for legacy clients, risky when ungoverned",
    "Mixed mode is acceptable only with CHECK_POLICY on, sa disabled, and SQL logins inventoried",
    "Changing authentication mode requires a service restart and a pre-change login inventory",
    "Authenticating is only step one: users, roles, and permissions are granted per database afterwards"
  ]
};
