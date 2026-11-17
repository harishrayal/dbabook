/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch09-15.html */

window.TOPIC = {
  id: "ch09-15",
  title: "GRANT, DENY, and REVOKE",

  lead: "This topic covers GRANT, DENY, and REVOKE — a concept you will meet repeatedly when working with SQL Server security and permissions. We build from first principles to production guidance.",

  objectives: [
    "Define what GRANT, DENY, and REVOKE is and where it fits",
    "Explain how GRANT, DENY, and REVOKE works internally",
    "Apply GRANT, DENY, and REVOKE correctly in a production environment",
    "Recognise the common mistakes and risks involving GRANT, DENY, and REVOKE",
    "Monitor and troubleshoot GRANT, DENY, and REVOKE with the right tools"
  ],

  sections: [
    {
      h: "What GRANT, DENY, and REVOKE means",
      html: `
<p>In this topic we examine <strong>GRANT, DENY, and REVOKE</strong> within SQL Server security and permissions. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface. Windows authentication is preferred where available.</p>
<p>SQL Server Audit and failed-login monitoring provide detection and evidence. Access reviews are a recurring operational task, not a one-time project.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>GRANT, DENY, and REVOKE is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where GRANT, DENY, and REVOKE fits",
      html: `
<p>Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do. Confusing the two is the root of most permission problems.</p>
<p>The diagram below places GRANT, DENY, and REVOKE alongside the core concepts of SQL Server security and permissions. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="GRANT, DENY, and REVOKE layers">
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
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">GRANT, DENY, and REVOKE</text>
  </svg>
  <div class="figcaption">Figure 1 — SQL Server security and permissions: how GRANT, DENY, and REVOKE relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "GRANT, DENY, and REVOKE in practice",
      html: `
<p>A server login grants access to the instance; a database user maps that login to a database. The mapping is by SID, which is why restores to other servers produce orphaned users. A login and a user are distinct objects at distinct scopes.</p>
<p>The following comparison captures the distinctions that matter most when working with GRANT, DENY, and REVOKE:</p>
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
      h: "Working with GRANT, DENY, and REVOKE",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to GRANT, DENY, and REVOKE. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- GRANT, DENY, and REVOKE
CREATE LOGIN AppLogin WITH PASSWORD = 'UseAStrongPassword!42',
  CHECK_POLICY = ON, CHECK_EXPIRATION = ON;
GO
USE SalesDB;
CREATE USER AppLogin FOR LOGIN AppLogin;
ALTER ROLE db_datareader ADD MEMBER AppLogin;
ALTER ROLE db_datawriter ADD MEMBER AppLogin;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- GRANT, DENY, and REVOKE
GRANT SELECT ON SCHEMA::dbo TO AppReader;
DENY DELETE ON SCHEMA::dbo TO AppReader;
GRANT EXECUTE ON OBJECT::dbo.usp_PlaceOrder TO AppWriter;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- GRANT, DENY, and REVOKE
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
  <p>With GRANT, DENY, and REVOKE, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: GRANT, DENY, and REVOKE",
      html: `
<p>This section consolidates <strong>GRANT, DENY, and REVOKE</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>A server login grants access to the instance; a database user maps that login to a database. The mapping is by SID, which is why restores to other servers produce orphaned users. A login and a user are distinct objects at distinct scopes.</p>
<p>Roles simplify permission management. Fixed server roles (sysadmin, serveradmin, securityadmin...) and fixed database roles (db_owner, db_datareader, db_datawriter...) grant predefined sets; user-defined roles let you assemble least-privilege groups for an application.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>GRANT, DENY, and REVOKE sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Object</th><th>Scope</th><th>Purpose</th></tr>
  <tr><td>Login</td><td>Server</td><td>Authenticate to the instance</td></tr>
  <tr><td>User</td><td>Database</td><td>Map a login into a database</td></tr>
  <tr><td>Role</td><td>Server or DB</td><td>Bundle permissions</td></tr>
</table>
<p>Schemas are namespaces that group objects and act as a permission boundary. Granting permissions on a schema covers all current and future objects within it, which is more maintainable than granting object by object.</p>
<p>Use the following as a starting point when investigating GRANT, DENY, and REVOKE. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- GRANT, DENY, and REVOKE
GRANT SELECT ON SCHEMA::dbo TO AppReader;
DENY DELETE ON SCHEMA::dbo TO AppReader;
GRANT EXECUTE ON OBJECT::dbo.usp_PlaceOrder TO AppWriter;</code></pre>
<p>GRANT, DENY and REVOKE form the permission vocabulary. DENY overrides GRANT at every level, so it must be used sparingly — a DENY at a higher scope can silently block access granted lower down.</p>
      `,
    }
  ],

  scenario: {
    title: "The DENY that broke reporting at midnight",
    html: `
A securityadmin placed a DENY SELECT on a schema to block one contractor, not realising the reporting service used a role granted access to the same schema. DENY overrides GRANT, so all reports failed overnight. The fix was to remove the broad DENY and apply a narrow denial to the specific principal instead.
<p><strong>The GRANT, DENY, and REVOKE lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
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
        "GRANT, DENY, and REVOKE",
        "GRANT, DENY and REVOKE form the permission vocabulary.",
        "Least privilege is the governing principle: give each identity only the permissions it needs, for only the scope it needs, and review them regularly."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine GRANT, DENY, and REVOKE within SQL Server security and permissions. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where GRANT, DENY, and REVOKE fits”?",
      "options": [
        "With GRANT, DENY, and REVOKE, prefer measured, reversible changes.",
        "Overridden by DENY",
        "Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do. Confusing the two is the root of most permission problems.”"
    },
    {
      "question": "Which fact is covered in the lesson section “GRANT, DENY, and REVOKE in practice”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "A server login grants access to the instance; a database user maps that login to a database.",
        "GRANT, DENY, and REVOKE sits inside a larger system."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A server login grants access to the instance; a database user maps that login to a database. The mapping is by SID, which is why restores to other servers produce orphaned users. A login and a user are distinct objects at distinct scopes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with GRANT, DENY, and REVOKE”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "GRANT, DENY, and REVOKE sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to GRANT, DENY, and REVOKE. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Least privilege is the governing principle: give each identity only the permissions it needs, for only the scope it needs, and review them regularly.",
        "With GRANT, DENY, and REVOKE, prefer measured, reversible changes.",
        "GRANT, DENY and REVOKE form the permission vocabulary."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “GRANT, DENY and REVOKE form the permission vocabulary. DENY overrides GRANT at every level, so it must be used sparingly — a DENY at a higher scope can silently block access granted lower down.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "GRANT, DENY, and REVOKE sits inside a larger system.",
        "GRANT, DENY, and REVOKE",
        "Neutral"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates GRANT, DENY, and REVOKE with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What GRANT, DENY, and REVOKE means”?",
      "options": [
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface.",
        "Use the following as a starting point when investigating GRANT, DENY, and REVOKE.",
        "SQL Server Audit and failed-login monitoring provide detection and evidence."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface. Windows authentication is preferred where available.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where GRANT, DENY, and REVOKE fits”?",
      "options": [
        "Use the following as a starting point when investigating GRANT, DENY, and REVOKE.",
        "Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do.",
        "The diagram below places GRANT, DENY, and REVOKE alongside the core concepts of SQL Server security and permissions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places GRANT, DENY, and REVOKE alongside the core concepts of SQL Server security and permissions. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “GRANT, DENY, and REVOKE in practice”?",
      "options": [
        "GRANT, DENY, and REVOKE",
        "The following comparison captures the distinctions that matter most when working with GRANT, DENY, and REVOKE:",
        "Bundle permissions"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with GRANT, DENY, and REVOKE:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with GRANT, DENY, and REVOKE”?",
      "options": [
        "The first example establishes the relevant state.",
        "GRANT, DENY, and REVOKE",
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server security and permissions.”",
      "options": [
        "GRANT, DENY, and REVOKE",
        "GRANT, DENY and REVOKE form the permission vocabulary.",
        "Least privilege is the governing principle: give each identity only the permissions it needs, for only the scope it needs, and review them regularly."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine GRANT, DENY, and REVOKE within SQL Server security and permissions. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where GRANT, DENY, and REVOKE fits”?",
      "options": [
        "With GRANT, DENY, and REVOKE, prefer measured, reversible changes.",
        "Overridden by DENY",
        "Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do. Confusing the two is the root of most permission problems.”"
    },
    {
      "question": "Which fact is covered in the lesson section “GRANT, DENY, and REVOKE in practice”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "A server login grants access to the instance; a database user maps that login to a database.",
        "GRANT, DENY, and REVOKE sits inside a larger system."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A server login grants access to the instance; a database user maps that login to a database. The mapping is by SID, which is why restores to other servers produce orphaned users. A login and a user are distinct objects at distinct scopes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with GRANT, DENY, and REVOKE”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "GRANT, DENY, and REVOKE sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to GRANT, DENY, and REVOKE. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Least privilege is the governing principle: give each identity only the permissions it needs, for only the scope it needs, and review them regularly.",
        "With GRANT, DENY, and REVOKE, prefer measured, reversible changes.",
        "GRANT, DENY and REVOKE form the permission vocabulary."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “GRANT, DENY and REVOKE form the permission vocabulary. DENY overrides GRANT at every level, so it must be used sparingly — a DENY at a higher scope can silently block access granted lower down.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "GRANT, DENY, and REVOKE sits inside a larger system.",
        "GRANT, DENY, and REVOKE",
        "Neutral"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates GRANT, DENY, and REVOKE with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What GRANT, DENY, and REVOKE means”?",
      "options": [
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface.",
        "Use the following as a starting point when investigating GRANT, DENY, and REVOKE.",
        "SQL Server Audit and failed-login monitoring provide detection and evidence."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface. Windows authentication is preferred where available.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where GRANT, DENY, and REVOKE fits”?",
      "options": [
        "Use the following as a starting point when investigating GRANT, DENY, and REVOKE.",
        "Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do.",
        "The diagram below places GRANT, DENY, and REVOKE alongside the core concepts of SQL Server security and permissions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places GRANT, DENY, and REVOKE alongside the core concepts of SQL Server security and permissions. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “GRANT, DENY, and REVOKE in practice”?",
      "options": [
        "GRANT, DENY, and REVOKE",
        "The following comparison captures the distinctions that matter most when working with GRANT, DENY, and REVOKE:",
        "Bundle permissions"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with GRANT, DENY, and REVOKE:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with GRANT, DENY, and REVOKE”?",
      "options": [
        "The first example establishes the relevant state.",
        "GRANT, DENY, and REVOKE",
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within SQL Server security and permissions.”",
      "options": [
        "GRANT, DENY, and REVOKE",
        "GRANT, DENY and REVOKE form the permission vocabulary.",
        "Least privilege is the governing principle: give each identity only the permissions it needs, for only the scope it needs, and review them regularly."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine GRANT, DENY, and REVOKE within SQL Server security and permissions. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where GRANT, DENY, and REVOKE fits”?",
      "options": [
        "With GRANT, DENY, and REVOKE, prefer measured, reversible changes.",
        "Overridden by DENY",
        "Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do. Confusing the two is the root of most permission problems.”"
    },
    {
      "question": "Which fact is covered in the lesson section “GRANT, DENY, and REVOKE in practice”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "A server login grants access to the instance; a database user maps that login to a database.",
        "GRANT, DENY, and REVOKE sits inside a larger system."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A server login grants access to the instance; a database user maps that login to a database. The mapping is by SID, which is why restores to other servers produce orphaned users. A login and a user are distinct objects at distinct scopes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with GRANT, DENY, and REVOKE”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "GRANT, DENY, and REVOKE sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to GRANT, DENY, and REVOKE. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Least privilege is the governing principle: give each identity only the permissions it needs, for only the scope it needs, and review them regularly.",
        "With GRANT, DENY, and REVOKE, prefer measured, reversible changes.",
        "GRANT, DENY and REVOKE form the permission vocabulary."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “GRANT, DENY and REVOKE form the permission vocabulary. DENY overrides GRANT at every level, so it must be used sparingly — a DENY at a higher scope can silently block access granted lower down.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "GRANT, DENY, and REVOKE sits inside a larger system.",
        "GRANT, DENY, and REVOKE",
        "Neutral"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates GRANT, DENY, and REVOKE with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What GRANT, DENY, and REVOKE means”?",
      "options": [
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface.",
        "Use the following as a starting point when investigating GRANT, DENY, and REVOKE.",
        "SQL Server Audit and failed-login monitoring provide detection and evidence."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface. Windows authentication is preferred where available.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where GRANT, DENY, and REVOKE fits”?",
      "options": [
        "Use the following as a starting point when investigating GRANT, DENY, and REVOKE.",
        "Security is layered: authentication establishes identity (who you are), authorization determines what that identity may do.",
        "The diagram below places GRANT, DENY, and REVOKE alongside the core concepts of SQL Server security and permissions."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places GRANT, DENY, and REVOKE alongside the core concepts of SQL Server security and permissions. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “GRANT, DENY, and REVOKE in practice”?",
      "options": [
        "GRANT, DENY, and REVOKE",
        "The following comparison captures the distinctions that matter most when working with GRANT, DENY, and REVOKE:",
        "Bundle permissions"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with GRANT, DENY, and REVOKE:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with GRANT, DENY, and REVOKE”?",
      "options": [
        "The first example establishes the relevant state.",
        "GRANT, DENY, and REVOKE",
        "Service account security, strong password policies for SQL authentication and disabling or renaming the sa account reduce the attack surface."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "GRANT, DENY, and REVOKE is a fundamental concept in SQL Server security and permissions",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of GRANT, DENY, and REVOKE improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
