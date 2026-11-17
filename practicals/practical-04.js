/* Practical content file — one JS file per practical lab.
   Rendered by assets/js/site.js on practicals/practical-04.html */

window.TOPIC = {
  id: "practical-04",
  title: "Security",

  lead: "A hands-on security lab: create logins and users, assign roles and schema permissions, observe GRANT/DENY/REVOKE precedence, and repair orphaned users after a restore.",

  objectives: [
    "Create and configure a SQL login with a strong password policy",
    "Map a login to a database user",
    "Use fixed and custom roles for least privilege",
    "Demonstrate DENY overriding GRANT",
    "Detect and fix orphaned users"
  ],

  sections: [
    {
      h: "Before you start",
      html: `
<p>This lab makes the login/user distinction concrete. You will create identities at both scopes, grant permissions and then connect as those identities to see the effect first-hand.</p>
<p>Work on a scratch database. Create a dedicated test login rather than reusing your admin account — the point is to observe exactly what a low-privilege identity can and cannot do.</p>
<p><strong>Environment check</strong> — confirm where you are before changing anything; this habit prevents production mistakes:</p>
<pre><code class="language-sql">-- Lab step
CREATE LOGIN LabAppLogin
WITH PASSWORD = 'Str0ng!Password#2026',
     CHECK_POLICY = ON, CHECK_EXPIRATION = ON;
GO
CREATE LOGIN LabReportLogin
WITH PASSWORD = 'An0ther!Strong#2026',
     CHECK_POLICY = ON;
GO
SELECT name, type_desc, is_disabled
FROM   sys.server_principals
WHERE  name LIKE 'Lab%';
GO</code></pre>
      `,
    },
    {
      h: "Lab architecture",
      html: `
<p>Authentication establishes who you are; authorisation decides what you may do. A login authenticates to the server, a user maps that login into a database, and permissions are granted to the user at database scope.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Security identity flow">
    <defs>
      <marker id="pa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="200" y="10" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="31" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Windows / SQL login (server)</text>
    <line x1="380" y1="54" x2="380" y2="64" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="64" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="85" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Database user (mapped by SID)</text>
    <line x1="380" y1="108" x2="380" y2="118" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="118" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="139" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Role membership (fixed or custom)</text>
    <line x1="380" y1="162" x2="380" y2="172" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="172" width="360" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="193" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. GRANT / DENY on schema or object</text>
    <line x1="380" y1="216" x2="380" y2="226" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#pa)"/>
    <rect x="200" y="226" width="360" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)"/>
    <text x="380" y="247" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Effective permission</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Security identity flow</text>
  </svg>
  <div class="figcaption">Figure 1 — A server login maps by SID to a database user, which gains permissions through roles.</div>
</div>
<p>The sequence below mirrors a real onboarding: create login, create user, add to a role, grant schema permissions, then connect and test.</p>
      `,
    },
    {
      h: "Core tasks",
      html: `
<p>Use roles instead of granting to individuals. Fixed database roles such as db_datareader are convenient; custom roles let you assemble a precise least-privilege bundle for an application.</p>
<table>
  <tr><th>Object</th><th>Scope</th><th>Purpose</th></tr>
  <tr><td>Login</td><td>Server</td><td>Authenticate to the instance</td></tr>
  <tr><td>User</td><td>Database</td><td>Map a login into a database</td></tr>
  <tr><td>Role</td><td>Server or DB</td><td>Bundle permissions</td></tr>
</table>
<p>DENY overrides GRANT at every scope. You will see this directly: grant SELECT on a schema, then DENY on a table, and confirm the user cannot read that table even though the schema is granted.</p>
<pre><code class="language-sql">-- Lab step
USE SecurityLab;
GO
CREATE USER LabAppLogin FOR LOGIN LabAppLogin;
CREATE USER LabReportLogin FOR LOGIN LabReportLogin;
GO
CREATE ROLE AppReaders;
GO
ALTER ROLE AppReaders ADD MEMBER LabReportLogin;
GRANT SELECT ON SCHEMA::dbo TO AppReaders;
GRANT EXECUTE ON SCHEMA::dbo TO LabAppLogin;
GO
-- DENY demonstrates precedence
DENY DELETE ON SCHEMA::dbo TO LabReportLogin;
GO</code></pre>
      `,
    },
    {
      h: "Verify your work",
      html: `
<p>Never assume a lab step worked — verify against the catalog views and DMVs. The query below reports the state you should expect:</p>
<pre><code class="language-sql">-- Lab step
-- Find orphaned users (SID with no matching login)
SELECT dp.name AS db_user, dp.sid
FROM   sys.database_principals dp
LEFT JOIN sys.server_principals sp ON sp.sid = dp.sid
WHERE  dp.type = 'S'
  AND  sp.sid IS NULL
  AND  dp.name NOT IN ('dbo','guest','INFORMATION_SCHEMA','sys');
GO
-- Remap an orphaned user to its login
ALTER USER LabReportLogin WITH LOGIN = LabReportLogin;
GO
-- Effective permissions for a principal
SELECT permission_name, state_desc
FROM   sys.fn_my_permissions(NULL, 'DATABASE');
GO</code></pre>
<p>Orphaned users appear when a database is restored to another server and the user's SID no longer matches any login. Query the catalogues to find them and remap with ALTER USER.</p>
<p>If the output differs, stop and correct it before moving on. A lab that 'looks right' but was never verified teaches the wrong lessons.</p>
      `,
    },
    {
      h: "Pitfalls and safe practice",
      html: `
<p>Least privilege is the goal throughout: give each identity only what it needs, avoid sysadmin and db_owner, and review permissions as a recurring task, not a one-off.</p>
<table>
  <tr><th>Statement</th><th>Effect</th><th>Precedence</th></tr>
  <tr><td>GRANT</td><td>Allows an action</td><td>Overridden by DENY</td></tr>
  <tr><td>DENY</td><td>Blocks an action</td><td>Beats GRANT at any scope</td></tr>
  <tr><td>REVOKE</td><td>Removes an explicit grant or deny</td><td>Neutral</td></tr>
</table>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>Practise the safe version of every task here: test on non-production, keep a rollback path, and record a 'before' state so you can prove the change did what you intended.</p>
</div>
      `,
    }
  ],

  steps: [
    "Create two SQL logins with CHECK_POLICY ON and strong passwords.",
    "Create a SecurityLab database and create a user for each login inside it.",
    "Create a custom role AppReaders, add LabReportLogin to it and grant SELECT on the dbo schema.",
    "Grant EXECUTE on the dbo schema to LabAppLogin but no SELECT — establishing least privilege.",
    "DENY DELETE on the dbo schema to LabReportLogin and confirm DENY wins over any GRANT.",
    "Open a second SSMS connection as LabReportLogin and verify SELECT works while DELETE fails.",
    "Connect as LabAppLogin and verify it cannot SELECT but can EXECUTE permitted procedures.",
    "Use sys.fn_my_permissions to list effective permissions for each connection.",
    "Back up and restore SecurityLab to a new name to create an orphaned-user scenario, then find it with the SID query.",
    "Remap the orphaned user with ALTER USER ... WITH LOGIN and verify access is restored."
  ],

  scenario: {
    title: "The DENY that stopped reporting at midnight",
    html: `
A security administrator added a broad DENY SELECT on a schema to block a single contractor. The reporting service used a role granted SELECT on the same schema; because DENY overrides GRANT at every scope, all overnight reports failed. The fix was to remove the broad DENY and apply a narrow denial to the specific principal. The lab reproduces this so you learn to reach for least-privilege grants rather than sweeping DENYs.
<p><strong>The lesson:</strong> practise both the diagnosis and the safe mitigation in this lab. Under pressure, the steps you have rehearsed are the steps you will actually take — build good muscle memory now.</p>
    `,
  },

  interview: [
    {
      q: "What is the difference between a login and a user?",
      a: `
A login authenticates to the server (server scope); a user is that login's mapped identity inside a database (database scope), linked by SID. Permissions are granted to users in the database and to logins at the server.
      `,
    },
    {
      q: "What does DENY do in the permission hierarchy?",
      a: `
DENY overrides GRANT at every scope — denying SELECT on a schema blocks access even if SELECT is granted on a table inside it — so it is powerful and should be used narrowly.
      `,
    },
    {
      q: "Why do orphaned users occur and how do you fix them?",
      a: `
After a restore to another server, a user's SID may not match any login. Find them by joining sys.database_principals to sys.server_principals on SID, then remap with ALTER USER ... WITH LOGIN.
      `,
    }
  ],

  takeaways: [
    "Authentication (login) and authorisation (user/permissions) are different layers",
    "Prefer roles and schema-level grants over per-object, per-user grants",
    "DENY always overrides GRANT — use it sparingly and narrowly",
    "Orphaned users are a SID mismatch resolved with ALTER USER ... WITH LOGIN",
    "Least privilege limits the blast radius of errors and compromises"
  ]
};
