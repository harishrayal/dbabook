/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch09-23.html */

window.TOPIC = {
  id: "ch09-23",
  title: "Failed Login Monitoring",

  lead: "Understanding Failed Login Monitoring is essential for anyone responsible for SQL Server security and permissions. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what Failed Login Monitoring is and where it fits",
    "Explain how Failed Login Monitoring works internally",
    "Apply Failed Login Monitoring correctly in a production environment",
    "Recognise the common mistakes and risks involving Failed Login Monitoring",
    "Monitor and troubleshoot Failed Login Monitoring with the right tools"
  ],

  sections: [
    {
      h: "What Failed Login Monitoring means",
      html: `
<p>In this topic we examine <strong>Failed Login Monitoring</strong> within SQL Server security and permissions. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface. Windows authentication is preferred where available.</p>
<p>SQL Server Audit and failed-login monitoring provide detection and evidence. Access reviews are a recurring operational task, not a one-time project.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Failed Login Monitoring is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Failed Login Monitoring fits",
      html: `
<p>Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do. Confusing the two is the root of most permission problems.</p>
<p>The diagram below places Failed Login Monitoring alongside the core concepts of SQL Server security and permissions. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Failed Login Monitoring flow">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="230" y="12" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="39" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Login</text>
    <rect x="230" y="66" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="93" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. User</text>
    <rect x="230" y="120" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="147" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Role</text>
    <rect x="230" y="174" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="201" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Schema</text>
    <rect x="230" y="228" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="255" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. GRANT</text>
    <rect x="230" y="282" width="300" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="309" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">6. Audit</text>
    <line x1="380" y1="56" x2="380" y2="66" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="110" x2="380" y2="120" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="164" x2="380" y2="174" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="218" x2="380" y2="228" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="272" x2="380" y2="282" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Failed Login Monitoring</text>
  </svg>
  <div class="figcaption">Figure 1 — SQL Server security and permissions: how Failed Login Monitoring relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Failed Login Monitoring in practice",
      html: `
<p>A server login grants access to the instance; a database user maps that login to a database. The mapping is by SID, which is why restores to other servers produce orphaned users. A login and a user are distinct objects at distinct scopes.</p>
<p>The following comparison captures the distinctions that matter most when working with Failed Login Monitoring:</p>
<table>
  <tr><th>Object</th><th>Scope</th><th>Purpose</th></tr>
  <tr><td>Login</td><td>Server</td><td>Authenticate to the instance</td></tr>
  <tr><td>User</td><td>Database</td><td>Map a login into a database</td></tr>
  <tr><td>Role</td><td>Server or DB</td><td>Bundle permissions</td></tr>
</table>
<p>Roles simplify permission management. Fixed server roles (sysadmin, serveradmin, securityadmin...) and fixed database roles (db_owner, db_datareader, db_datawriter...) grant predefined sets; user-defined roles let you assemble least-privilege groups for an application.</p>
      `,
    },
    {
      h: "Working with Failed Login Monitoring",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Failed Login Monitoring. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Failed Login Monitoring
CREATE LOGIN AppLogin WITH PASSWORD = 'UseAStrongPassword!42',
  CHECK_POLICY = ON, CHECK_EXPIRATION = ON;
GO
USE SalesDB;
CREATE USER AppLogin FOR LOGIN AppLogin;
ALTER ROLE db_datareader ADD MEMBER AppLogin;
ALTER ROLE db_datawriter ADD MEMBER AppLogin;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Failed Login Monitoring
GRANT SELECT ON SCHEMA::dbo TO AppReader;
DENY DELETE ON SCHEMA::dbo TO AppReader;
GRANT EXECUTE ON OBJECT::dbo.usp_PlaceOrder TO AppWriter;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Failed Login Monitoring
SELECT dp.name AS db_user, sp.name AS login_name
FROM   sys.database_principals dp
LEFT JOIN sys.server_principals sp ON sp.sid = dp.sid
WHERE  dp.type IN ('S','U');</code></pre>
<p>Schemas are namespaces that group objects and act as a permission boundary. Granting permissions on a schema covers all current and future objects within it, which is more maintainable than granting object by object.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>GRANT, DENY and REVOKE form the permission vocabulary. DENY overrides GRANT at every level, so it must be used sparingly — a DENY at a higher scope can silently block access granted lower down.</p>
<table>
  <tr><th>Permission</th><th>Effect</th><th>Precedence</th></tr>
  <tr><td>GRANT</td><td>Allows an action</td><td>Overridden by DENY</td></tr>
  <tr><td>DENY</td><td>Blocks an action</td><td>Overrides GRANT everywhere</td></tr>
  <tr><td>REVOKE</td><td>Removes an explicit grant/deny</td><td>Neutral</td></tr>
</table>
<p>Least privilege is the governing principle: give each identity only the permissions it needs, for only the scope it needs, and review them regularly. Avoid sysadmin and db_owner for application accounts.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Failed Login Monitoring, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Failed Login Monitoring",
      html: `
<p>This section consolidates <strong>Failed Login Monitoring</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>A server login grants access to the instance; a database user maps that login to a database. The mapping is by SID, which is why restores to other servers produce orphaned users. A login and a user are distinct objects at distinct scopes.</p>
<p>Roles simplify permission management. Fixed server roles (sysadmin, serveradmin, securityadmin...) and fixed database roles (db_owner, db_datareader, db_datawriter...) grant predefined sets; user-defined roles let you assemble least-privilege groups for an application.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Failed Login Monitoring sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Object</th><th>Scope</th><th>Purpose</th></tr>
  <tr><td>Login</td><td>Server</td><td>Authenticate to the instance</td></tr>
  <tr><td>User</td><td>Database</td><td>Map a login into a database</td></tr>
  <tr><td>Role</td><td>Server or DB</td><td>Bundle permissions</td></tr>
</table>
<p>Schemas are namespaces that group objects and act as a permission boundary. Granting permissions on a schema covers all current and future objects within it, which is more maintainable than granting object by object.</p>
<p>Use the following as a starting point when investigating Failed Login Monitoring. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Failed Login Monitoring
CREATE LOGIN AppLogin WITH PASSWORD = 'UseAStrongPassword!42',
  CHECK_POLICY = ON, CHECK_EXPIRATION = ON;
GO
USE SalesDB;
CREATE USER AppLogin FOR LOGIN AppLogin;
ALTER ROLE db_datareader ADD MEMBER AppLogin;
ALTER ROLE db_datawriter ADD MEMBER AppLogin;</code></pre>
<p>GRANT, DENY and REVOKE form the permission vocabulary. DENY overrides GRANT at every level, so it must be used sparingly — a DENY at a higher scope can silently block access granted lower down.</p>
      `,
    }
  ],

  scenario: {
    title: "The DENY that broke reporting at midnight",
    html: `
A securityadmin placed a DENY SELECT on a schema to block one contractor, not realising the reporting service used a role granted access to the same schema. DENY overrides GRANT, so all reports failed overnight. The fix was to remove the broad DENY and apply a narrow denial to the specific principal instead.
<p><strong>The Failed Login Monitoring lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "What does DENY do in the permission hierarchy?",
      a: `
DENY overrides GRANT at any scope — a deny on a schema blocks access even if SELECT is granted on a table inside it — so it is powerful and should be used narrowly.
      `,
    },
    {
      q: "What is least privilege and why does it matter?",
      a: `
Granting only the minimum permissions required for the minimum scope and time. It limits the damage from compromised accounts, accidental changes and insider errors, and simplifies audits.
      `,
    },
    {
      q: "What is the difference between a login and a user?",
      a: `
A login authenticates to the server (server scope); a user is the login's mapped identity inside a database (database scope), linked by SID. Permissions are granted to users at database scope and to logins at server scope.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server security and permissions.”",
      "options": [
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface.",
        "Failed Login Monitoring",
        "Use the following as a starting point when investigating Failed Login Monitoring."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Failed Login Monitoring within SQL Server security and permissions. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Failed Login Monitoring fits”?",
      "options": [
        "Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do.",
        "Failed Login Monitoring",
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do. Confusing the two is the root of most permission problems.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Failed Login Monitoring in practice”?",
      "options": [
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface.",
        "SQL Server Audit and failed-login monitoring provide detection and evidence.",
        "A server login grants access to the instance; a database user maps that login to a database."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A server login grants access to the instance; a database user maps that login to a database. The mapping is by SID, which is why restores to other servers produce orphaned users. A login and a user are distinct objects at distinct scopes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Failed Login Monitoring”?",
      "options": [
        "Failed Login Monitoring is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Theory becomes useful when you can apply it.",
        "SQL Server Audit and failed-login monitoring provide detection and evidence."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Failed Login Monitoring. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "GRANT, DENY and REVOKE form the permission vocabulary.",
        "Failed Login Monitoring is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “GRANT, DENY and REVOKE form the permission vocabulary. DENY overrides GRANT at every level, so it must be used sparingly — a DENY at a higher scope can silently block access granted lower down.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The diagram below places Failed Login Monitoring alongside the core concepts of SQL Server security and permissions.",
        "A server login grants access to the instance; a database user maps that login to a database.",
        "Failed Login Monitoring"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Failed Login Monitoring with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Failed Login Monitoring means”?",
      "options": [
        "Map a login into a database",
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface.",
        "Authenticate to the instance"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface. Windows authentication is preferred where available.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Failed Login Monitoring fits”?",
      "options": [
        "The diagram below places Failed Login Monitoring alongside the core concepts of SQL Server security and permissions.",
        "Roles simplify permission management.",
        "Authenticate to the instance"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Failed Login Monitoring alongside the core concepts of SQL Server security and permissions. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Failed Login Monitoring in practice”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "The following comparison captures the distinctions that matter most when working with Failed Login Monitoring:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Failed Login Monitoring:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Failed Login Monitoring”?",
      "options": [
        "Authenticate to the instance",
        "The first example establishes the relevant state.",
        "Roles simplify permission management."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server security and permissions.”",
      "options": [
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface.",
        "Failed Login Monitoring",
        "Use the following as a starting point when investigating Failed Login Monitoring."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Failed Login Monitoring within SQL Server security and permissions. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Failed Login Monitoring fits”?",
      "options": [
        "Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do.",
        "Failed Login Monitoring",
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do. Confusing the two is the root of most permission problems.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Failed Login Monitoring in practice”?",
      "options": [
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface.",
        "SQL Server Audit and failed-login monitoring provide detection and evidence.",
        "A server login grants access to the instance; a database user maps that login to a database."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A server login grants access to the instance; a database user maps that login to a database. The mapping is by SID, which is why restores to other servers produce orphaned users. A login and a user are distinct objects at distinct scopes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Failed Login Monitoring”?",
      "options": [
        "Failed Login Monitoring is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Theory becomes useful when you can apply it.",
        "SQL Server Audit and failed-login monitoring provide detection and evidence."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Failed Login Monitoring. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "GRANT, DENY and REVOKE form the permission vocabulary.",
        "Failed Login Monitoring is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “GRANT, DENY and REVOKE form the permission vocabulary. DENY overrides GRANT at every level, so it must be used sparingly — a DENY at a higher scope can silently block access granted lower down.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The diagram below places Failed Login Monitoring alongside the core concepts of SQL Server security and permissions.",
        "A server login grants access to the instance; a database user maps that login to a database.",
        "Failed Login Monitoring"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Failed Login Monitoring with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Failed Login Monitoring means”?",
      "options": [
        "Map a login into a database",
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface.",
        "Authenticate to the instance"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface. Windows authentication is preferred where available.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Failed Login Monitoring fits”?",
      "options": [
        "The diagram below places Failed Login Monitoring alongside the core concepts of SQL Server security and permissions.",
        "Roles simplify permission management.",
        "Authenticate to the instance"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Failed Login Monitoring alongside the core concepts of SQL Server security and permissions. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Failed Login Monitoring in practice”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "The following comparison captures the distinctions that matter most when working with Failed Login Monitoring:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Failed Login Monitoring:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Failed Login Monitoring”?",
      "options": [
        "Authenticate to the instance",
        "The first example establishes the relevant state.",
        "Roles simplify permission management."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server security and permissions.”",
      "options": [
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface.",
        "Failed Login Monitoring",
        "Use the following as a starting point when investigating Failed Login Monitoring."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine Failed Login Monitoring within SQL Server security and permissions. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Failed Login Monitoring fits”?",
      "options": [
        "Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do.",
        "Failed Login Monitoring",
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do. Confusing the two is the root of most permission problems.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Failed Login Monitoring in practice”?",
      "options": [
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface.",
        "SQL Server Audit and failed-login monitoring provide detection and evidence.",
        "A server login grants access to the instance; a database user maps that login to a database."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “A server login grants access to the instance; a database user maps that login to a database. The mapping is by SID, which is why restores to other servers produce orphaned users. A login and a user are distinct objects at distinct scopes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Failed Login Monitoring”?",
      "options": [
        "Failed Login Monitoring is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Theory becomes useful when you can apply it.",
        "SQL Server Audit and failed-login monitoring provide detection and evidence."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Failed Login Monitoring. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "GRANT, DENY and REVOKE form the permission vocabulary.",
        "Failed Login Monitoring is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “GRANT, DENY and REVOKE form the permission vocabulary. DENY overrides GRANT at every level, so it must be used sparingly — a DENY at a higher scope can silently block access granted lower down.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The diagram below places Failed Login Monitoring alongside the core concepts of SQL Server security and permissions.",
        "A server login grants access to the instance; a database user maps that login to a database.",
        "Failed Login Monitoring"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates Failed Login Monitoring with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Failed Login Monitoring means”?",
      "options": [
        "Map a login into a database",
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface.",
        "Authenticate to the instance"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface. Windows authentication is preferred where available.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Failed Login Monitoring fits”?",
      "options": [
        "The diagram below places Failed Login Monitoring alongside the core concepts of SQL Server security and permissions.",
        "Roles simplify permission management.",
        "Authenticate to the instance"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places Failed Login Monitoring alongside the core concepts of SQL Server security and permissions. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Failed Login Monitoring in practice”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "The following comparison captures the distinctions that matter most when working with Failed Login Monitoring:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Failed Login Monitoring:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Failed Login Monitoring”?",
      "options": [
        "Authenticate to the instance",
        "The first example establishes the relevant state.",
        "Roles simplify permission management."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Failed Login Monitoring is a fundamental concept in SQL Server security and permissions",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Failed Login Monitoring improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
