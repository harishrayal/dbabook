/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch09-21.html */

window.TOPIC = {
  id: "ch09-21",
  title: "Password Policies",

  lead: "This topic covers Password Policies — a concept you will meet repeatedly when working with SQL Server security and permissions. We build from first principles to production guidance.",

  objectives: [
    "Define what Password Policies is and where it fits",
    "Explain how Password Policies works internally",
    "Apply Password Policies correctly in a production environment",
    "Recognise the common mistakes and risks involving Password Policies",
    "Monitor and troubleshoot Password Policies with the right tools"
  ],

  sections: [
    {
      h: "What Password Policies means",
      html: `
<p>In this topic we examine <strong>Password Policies</strong> within SQL Server security and permissions. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>GRANT, DENY and REVOKE form the permission vocabulary. DENY overrides GRANT at every level, so it must be used sparingly — a DENY at a higher scope can silently block access granted lower down.</p>
<p>Least privilege is the governing principle: give each identity only the permissions it needs, for only the scope it needs, and review them regularly. Avoid sysadmin and db_owner for application accounts.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Password Policies is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Password Policies fits",
      html: `
<p>Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface. Windows authentication is preferred where available.</p>
<p>The diagram below places Password Policies alongside the core concepts of SQL Server security and permissions. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Password Policies layers">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="70" y="8" width="620" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="30" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Login</text>
    <text x="380" y="50" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 1</text>
    <rect x="100" y="62" width="560" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="84" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">User</text>
    <text x="380" y="104" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 2</text>
    <rect x="130" y="116" width="500" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="138" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Role</text>
    <text x="380" y="158" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 3</text>
    <rect x="160" y="170" width="440" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="192" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Schema</text>
    <text x="380" y="212" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 4</text>
    <rect x="190" y="224" width="380" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="246" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">GRANT</text>
    <text x="380" y="266" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 5</text>
    <rect x="220" y="278" width="320" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="300" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Audit</text>
    <text x="380" y="320" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 6</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Password Policies</text>
  </svg>
  <div class="figcaption">Figure 1 — SQL Server security and permissions: how Password Policies relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Password Policies in practice",
      html: `
<p>SQL Server Audit and failed-login monitoring provide detection and evidence. Access reviews are a recurring operational task, not a one-time project.</p>
<p>The following comparison captures the distinctions that matter most when working with Password Policies:</p>
<table>
  <tr><th>Object</th><th>Scope</th><th>Purpose</th></tr>
  <tr><td>Login</td><td>Server</td><td>Authenticate to the instance</td></tr>
  <tr><td>User</td><td>Database</td><td>Map a login into a database</td></tr>
  <tr><td>Role</td><td>Server or DB</td><td>Bundle permissions</td></tr>
</table>
<p>Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do. Confusing the two is the root of most permission problems.</p>
      `,
    },
    {
      h: "Working with Password Policies",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Password Policies. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Password Policies
CREATE LOGIN AppLogin WITH PASSWORD = 'UseAStrongPassword!42',
  CHECK_POLICY = ON, CHECK_EXPIRATION = ON;
GO
USE SalesDB;
CREATE USER AppLogin FOR LOGIN AppLogin;
ALTER ROLE db_datareader ADD MEMBER AppLogin;
ALTER ROLE db_datawriter ADD MEMBER AppLogin;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Password Policies
GRANT SELECT ON SCHEMA::dbo TO AppReader;
DENY DELETE ON SCHEMA::dbo TO AppReader;
GRANT EXECUTE ON OBJECT::dbo.usp_PlaceOrder TO AppWriter;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Password Policies
SELECT dp.name AS db_user, sp.name AS login_name
FROM   sys.database_principals dp
LEFT JOIN sys.server_principals sp ON sp.sid = dp.sid
WHERE  dp.type IN ('S','U');</code></pre>
<p>A server login grants access to the instance; a database user maps that login to a database. The mapping is by SID, which is why restores to other servers produce orphaned users. A login and a user are distinct objects at distinct scopes.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Roles simplify permission management. Fixed server roles (sysadmin, serveradmin, securityadmin...) and fixed database roles (db_owner, db_datareader, db_datawriter...) grant predefined sets; user-defined roles let you assemble least-privilege groups for an application.</p>
<table>
  <tr><th>Permission</th><th>Effect</th><th>Precedence</th></tr>
  <tr><td>GRANT</td><td>Allows an action</td><td>Overridden by DENY</td></tr>
  <tr><td>DENY</td><td>Blocks an action</td><td>Overrides GRANT everywhere</td></tr>
  <tr><td>REVOKE</td><td>Removes an explicit grant/deny</td><td>Neutral</td></tr>
</table>
<p>Schemas are namespaces that group objects and act as a permission boundary. Granting permissions on a schema covers all current and future objects within it, which is more maintainable than granting object by object.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Password Policies, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Password Policies",
      html: `
<p>This section consolidates <strong>Password Policies</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>SQL Server Audit and failed-login monitoring provide detection and evidence. Access reviews are a recurring operational task, not a one-time project.</p>
<p>Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do. Confusing the two is the root of most permission problems.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Password Policies sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Object</th><th>Scope</th><th>Purpose</th></tr>
  <tr><td>Login</td><td>Server</td><td>Authenticate to the instance</td></tr>
  <tr><td>User</td><td>Database</td><td>Map a login into a database</td></tr>
  <tr><td>Role</td><td>Server or DB</td><td>Bundle permissions</td></tr>
</table>
<p>A server login grants access to the instance; a database user maps that login to a database. The mapping is by SID, which is why restores to other servers produce orphaned users. A login and a user are distinct objects at distinct scopes.</p>
<p>Use the following as a starting point when investigating Password Policies. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Password Policies
GRANT SELECT ON SCHEMA::dbo TO AppReader;
DENY DELETE ON SCHEMA::dbo TO AppReader;
GRANT EXECUTE ON OBJECT::dbo.usp_PlaceOrder TO AppWriter;</code></pre>
<p>Roles simplify permission management. Fixed server roles (sysadmin, serveradmin, securityadmin...) and fixed database roles (db_owner, db_datareader, db_datawriter...) grant predefined sets; user-defined roles let you assemble least-privilege groups for an application.</p>
      `,
    }
  ],

  scenario: {
    title: "The DENY that broke reporting at midnight",
    html: `
A securityadmin placed a DENY SELECT on a schema to block one contractor, not realising the reporting service used a role granted access to the same schema. DENY overrides GRANT, so all reports failed overnight. The fix was to remove the broad DENY and apply a narrow denial to the specific principal instead.
<p><strong>The Password Policies lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
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
    },
    {
      q: "What does DENY do in the permission hierarchy?",
      a: `
DENY overrides GRANT at any scope — a deny on a schema blocks access even if SELECT is granted on a table inside it — so it is powerful and should be used narrowly.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server security and permissions.”",
      "options": [
        "Password Policies",
        "Password Policies sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Password Policies within SQL Server security and permissions. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Password Policies fits”?",
      "options": [
        "Use the following as a starting point when investigating Password Policies.",
        "The diagram below places Password Policies alongside the core concepts of SQL Server security and permissions.",
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface. Windows authentication is preferred where available.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Password Policies in practice”?",
      "options": [
        "Password Policies",
        "SQL Server Audit and failed-login monitoring provide detection and evidence.",
        "The following comparison captures the distinctions that matter most when working with Password Policies:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “SQL Server Audit and failed-login monitoring provide detection and evidence. Access reviews are a recurring operational task, not a one-time project.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Password Policies”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Password Policies",
        "GRANT, DENY and REVOKE form the permission vocabulary."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Password Policies. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "GRANT, DENY and REVOKE form the permission vocabulary.",
        "Least privilege is the governing principle: give each identity only the permissions it needs, for only the scope it needs, and review them regularly.",
        "Roles simplify permission management."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Roles simplify permission management. Fixed server roles (sysadmin, serveradmin, securityadmin...) and fixed database roles (db_owner, db_datareader, db_datawriter...) grant predefined sets; user-defined roles let you assemble least-privilege groups for an application.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface.",
        "Password Policies",
        "Password Policies is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Password Policies with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Password Policies means”?",
      "options": [
        "GRANT, DENY and REVOKE form the permission vocabulary.",
        "The following comparison captures the distinctions that matter most when working with Password Policies:",
        "Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “GRANT, DENY and REVOKE form the permission vocabulary. DENY overrides GRANT at every level, so it must be used sparingly — a DENY at a higher scope can silently block access granted lower down.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Password Policies fits”?",
      "options": [
        "SQL Server Audit and failed-login monitoring provide detection and evidence.",
        "The following comparison captures the distinctions that matter most when working with Password Policies:",
        "The diagram below places Password Policies alongside the core concepts of SQL Server security and permissions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Password Policies alongside the core concepts of SQL Server security and permissions. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Password Policies in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The following comparison captures the distinctions that matter most when working with Password Policies:",
        "The diagram below places Password Policies alongside the core concepts of SQL Server security and permissions."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Password Policies:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Password Policies”?",
      "options": [
        "The first example establishes the relevant state.",
        "SQL Server Audit and failed-login monitoring provide detection and evidence.",
        "The following comparison captures the distinctions that matter most when working with Password Policies:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server security and permissions.”",
      "options": [
        "Password Policies",
        "Password Policies sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Password Policies within SQL Server security and permissions. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Password Policies fits”?",
      "options": [
        "Use the following as a starting point when investigating Password Policies.",
        "The diagram below places Password Policies alongside the core concepts of SQL Server security and permissions.",
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface. Windows authentication is preferred where available.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Password Policies in practice”?",
      "options": [
        "Password Policies",
        "SQL Server Audit and failed-login monitoring provide detection and evidence.",
        "The following comparison captures the distinctions that matter most when working with Password Policies:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “SQL Server Audit and failed-login monitoring provide detection and evidence. Access reviews are a recurring operational task, not a one-time project.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Password Policies”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Password Policies",
        "GRANT, DENY and REVOKE form the permission vocabulary."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Password Policies. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "GRANT, DENY and REVOKE form the permission vocabulary.",
        "Least privilege is the governing principle: give each identity only the permissions it needs, for only the scope it needs, and review them regularly.",
        "Roles simplify permission management."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Roles simplify permission management. Fixed server roles (sysadmin, serveradmin, securityadmin...) and fixed database roles (db_owner, db_datareader, db_datawriter...) grant predefined sets; user-defined roles let you assemble least-privilege groups for an application.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface.",
        "Password Policies",
        "Password Policies is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Password Policies with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Password Policies means”?",
      "options": [
        "GRANT, DENY and REVOKE form the permission vocabulary.",
        "The following comparison captures the distinctions that matter most when working with Password Policies:",
        "Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “GRANT, DENY and REVOKE form the permission vocabulary. DENY overrides GRANT at every level, so it must be used sparingly — a DENY at a higher scope can silently block access granted lower down.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Password Policies fits”?",
      "options": [
        "SQL Server Audit and failed-login monitoring provide detection and evidence.",
        "The following comparison captures the distinctions that matter most when working with Password Policies:",
        "The diagram below places Password Policies alongside the core concepts of SQL Server security and permissions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Password Policies alongside the core concepts of SQL Server security and permissions. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Password Policies in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The following comparison captures the distinctions that matter most when working with Password Policies:",
        "The diagram below places Password Policies alongside the core concepts of SQL Server security and permissions."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Password Policies:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Password Policies”?",
      "options": [
        "The first example establishes the relevant state.",
        "SQL Server Audit and failed-login monitoring provide detection and evidence.",
        "The following comparison captures the distinctions that matter most when working with Password Policies:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server security and permissions.”",
      "options": [
        "Password Policies",
        "Password Policies sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Password Policies within SQL Server security and permissions. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Password Policies fits”?",
      "options": [
        "Use the following as a starting point when investigating Password Policies.",
        "The diagram below places Password Policies alongside the core concepts of SQL Server security and permissions.",
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface. Windows authentication is preferred where available.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Password Policies in practice”?",
      "options": [
        "Password Policies",
        "SQL Server Audit and failed-login monitoring provide detection and evidence.",
        "The following comparison captures the distinctions that matter most when working with Password Policies:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “SQL Server Audit and failed-login monitoring provide detection and evidence. Access reviews are a recurring operational task, not a one-time project.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Password Policies”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "Password Policies",
        "GRANT, DENY and REVOKE form the permission vocabulary."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Password Policies. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "GRANT, DENY and REVOKE form the permission vocabulary.",
        "Least privilege is the governing principle: give each identity only the permissions it needs, for only the scope it needs, and review them regularly.",
        "Roles simplify permission management."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Roles simplify permission management. Fixed server roles (sysadmin, serveradmin, securityadmin...) and fixed database roles (db_owner, db_datareader, db_datawriter...) grant predefined sets; user-defined roles let you assemble least-privilege groups for an application.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface.",
        "Password Policies",
        "Password Policies is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Password Policies with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Password Policies means”?",
      "options": [
        "GRANT, DENY and REVOKE form the permission vocabulary.",
        "The following comparison captures the distinctions that matter most when working with Password Policies:",
        "Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “GRANT, DENY and REVOKE form the permission vocabulary. DENY overrides GRANT at every level, so it must be used sparingly — a DENY at a higher scope can silently block access granted lower down.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Password Policies fits”?",
      "options": [
        "SQL Server Audit and failed-login monitoring provide detection and evidence.",
        "The following comparison captures the distinctions that matter most when working with Password Policies:",
        "The diagram below places Password Policies alongside the core concepts of SQL Server security and permissions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Password Policies alongside the core concepts of SQL Server security and permissions. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Password Policies in practice”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The following comparison captures the distinctions that matter most when working with Password Policies:",
        "The diagram below places Password Policies alongside the core concepts of SQL Server security and permissions."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Password Policies:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Password Policies”?",
      "options": [
        "The first example establishes the relevant state.",
        "SQL Server Audit and failed-login monitoring provide detection and evidence.",
        "The following comparison captures the distinctions that matter most when working with Password Policies:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Password Policies is a fundamental concept in SQL Server security and permissions",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Password Policies improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
