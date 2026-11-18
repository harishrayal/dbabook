/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch03-06.html */

window.TOPIC = {
  id: "ch03-06",
  title: "NTFS Permissions",

  lead: "NTFS permissions are the access-control rules stored on every file and folder, and they are the reason a perfectly restored database can refuse to open with an innocuous-sounding 'access is denied'.",
  objectives: [
    "Explain security descriptors, ACEs, and how effective access is calculated",
    "Predict the effect of inheritance, explicit deny, and copy versus move",
    "Distinguish share permissions from NTFS permissions",
    "Read and change folder ACLs with PowerShell and icacls",
    "Diagnose access-denied errors affecting SQL Server files"
  ],

  sections: [
    {
      h: "The permission model: descriptors, SIDs, and ACEs",
      html: `
<p>Every NTFS file and folder carries a <strong>security descriptor</strong>. The part that controls day-to-day access is the <strong>DACL</strong> (Discretionary Access Control List): an ordered list of <strong>ACEs</strong> (Access Control Entries). Each ACE grants or denies a set of rights to a <em>trustee</em> — identified internally by a security identifier (SID), not by the friendly name you see in the dialog.</p>
<table>
  <tr><th>Term</th><th>Meaning</th><th>Why a DBA cares</th></tr>
  <tr><td><strong>SID</strong></td><td>Stable numeric identity of a user, group, or service</td><td>Recreating an account creates a new SID; old grants no longer apply</td></tr>
  <tr><td><strong>DACL</strong></td><td>Ordered list of allow and deny entries on an object</td><td>Decides whether the SQL service can read an MDF or write a backup</td></tr>
  <tr><td><strong>ACE</strong></td><td>One allow or deny rule, e.g. Modify to a group</td><td>The unit you add, remove, or inherit when you run <code>icacls</code></td></tr>
  <tr><td><strong>Access mask</strong></td><td>Specific rights: ReadData, WriteData, AppendData, Delete, etc.</td><td>"Modify" is a bundle of rights; SQL needs more than read on data files</td></tr>
  <tr><td><strong>SACL</strong></td><td>System ACL defining which events are audited</td><td>Lets you prove who changed a permission before an incident</td></tr>
</table>
<p>The key mental shift: permissions are <strong>not attached to the account</strong> you used to log in. They are attached to the object and evaluated against the SIDs in the requesting process's token. SQL Server runs as a service account, so <em>your</em> Administrator rights are irrelevant to whether the engine can open a file.</p>
<blockquote>When the DBA says "I can read that file", the useful question is "can NT SERVICE\\MSSQLSERVER read that file?"</blockquote>
`
    },
    {
      h: "Allow, deny, and effective access",
      html: `
<p>Windows builds an <strong>access token</strong> at logon containing the user's SID and every group SID, then compares that token with the DACL of the object being opened. The result is the <strong>effective permission</strong>. Four rules govern almost every surprise:</p>
<ul>
  <li><strong>Allow entries accumulate.</strong> A user in three groups effectively receives the union of all three groups' allows.</li>
  <li><strong>ACE order matters.</strong> Windows evaluates applicable ACEs in DACL order; canonical ACLs place explicit entries before inherited entries and deny entries before allows at the same level. A deny can block the rights it names, so inspect the effective ACL rather than relying on a slogan.</li>
  <li><strong>Explicit and inherited entries interact.</strong> Explicit ACEs are ordered before inherited ACEs in a canonical DACL, but evaluate the complete DACL and token to determine effective access.</li>
  <li><strong>Ownership matters.</strong> The owner can always change the DACL, even if the owner cannot read the file — the basis of <code>takeown</code> recovery.</li>
</ul>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Windows access check against an NTFS DACL">
    <defs>
      <marker id="nt-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="30" y="30" width="210" height="130" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="135" y="58" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Access token</text>
    <text x="135" y="84" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">user SID</text>
    <text x="135" y="106" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">group SIDs</text>
    <text x="135" y="128" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">privileges</text>

    <rect x="520" y="30" width="210" height="130" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="625" y="58" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Folder DACL</text>
    <text x="625" y="84" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Allow svc_sql: Modify</text>
    <text x="625" y="106" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">Allow Admins: Full</text>
    <text x="625" y="128" text-anchor="middle" fill="var(--amber)" font-size="11.5" font-family="Segoe UI, sans-serif">Deny Users: Write</text>

    <rect x="280" y="190" width="200" height="56" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="380" y="224" text-anchor="middle" fill="var(--accent-strong)" font-size="14.5" font-weight="700" font-family="Segoe UI, sans-serif">Windows access check</text>

    <rect x="90" y="278" width="250" height="50" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="215" y="309" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Granted — access allowed</text>

    <rect x="420" y="278" width="250" height="50" rx="9" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="545" y="309" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Denied — explicit deny wins</text>

    <line x1="240" y1="160" x2="320" y2="188" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#nt-arrow)"/>
    <line x1="520" y1="160" x2="440" y2="188" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#nt-arrow)"/>
    <line x1="330" y1="246" x2="225" y2="276" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#nt-arrow)"/>
    <line x1="430" y1="246" x2="535" y2="276" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#nt-arrow)"/>
  </svg>
  <div class="figcaption">Figure 1 — Windows evaluates the requesting token against the ordered DACL to determine access.</div>
</div>
<p>Prefer narrowly scoped allow entries and avoid adding deny ACEs as a shortcut. Use Windows' effective-access tools and inspect the ordered ACL when diagnosing unexpected results.</p>
`
    },
    {
      h: "Inheritance, moves, and copies",
      html: `
<p>Permissions flow downwards. An ACE on <code>E:\\SQL</code> marked <em>Apply to: this folder, subfolders and files</em> is <strong>inherited</strong> by everything beneath it; Windows shows it greyed out in the Advanced Security Settings dialog. A permission applied directly to a child is <strong>explicit</strong> and survives a parent change unless you deliberately re-enable inheritance.</p>
<p>Three operations produce most SQL Server permission incidents:</p>
<table>
  <tr><th>Operation</th><th>What happens to the ACL</th><th>DBA consequence</th></tr>
  <tr><td><strong>Move within the same volume</strong></td><td>Rename — ACL is preserved</td><td>Moving a database folder inside E: usually keeps access intact</td></tr>
  <tr><td><strong>Move across volumes</strong></td><td>Copy then delete — inherits destination ACL</td><td>Files copied to a new LUN silently lose the SQL service grant</td></tr>
  <tr><td><strong>Copy a backup file</strong></td><td>Inherits destination folder's ACL</td><td>A restore fails with OS error 5 even though the file exists</td></tr>
</table>
<p>You can break inheritance explicitly. In the GUI this is <em>Disable inheritance</em>, then either convert inherited entries into explicit ones or remove them. At the command line:</p>
<pre><code class="language-powershell">icacls "E:\\SQLBackup" /inheritance:r /grant:r "Administrators:(OI)(CI)F" "SYSTEM:(OI)(CI)F" "CONTOSO\\svc_sqlserver:(OI)(CI)M"</code></pre>
<p>The <code>(OI)</code> and <code>(CI)</code> flags mean Object Inherit and Container Inherit: subfolders and files receive the entry. Without them, a grant to a folder does not automatically reach the database files inside it — a common cause of "I granted access and nothing changed".</p>
`
    },
    {
      h: "Share permissions versus NTFS permissions",
      html: `
<p>Network shares add a second, independent permission layer. When a database is backed up to <code>\\\\fileserver\\sqlbackup\\Full.bak</code>, Windows applies the <strong>share permission</strong> and the <strong>NTFS permission</strong>, and the <strong>more restrictive of the two wins</strong>. A principal with Full Control on the share but only Read on the folder gets Read — backups fail. A principal with Full Control on the folder but Read on the share also gets Read.</p>
<table>
  <tr><th>Scenario</th><th>Share ACL</th><th>NTFS ACL</th><th>Effective access</th></tr>
  <tr><td>Typical web share</td><td>Everyone: Read</td><td>Data owners: Modify</td><td>Read only</td></tr>
  <tr><td>Recommended SQL backup share</td><td>Everyone or SQL group: Full Control</td><td>SQL service + DBAs: Modify/Full</td><td>Controlled by NTFS</td></tr>
  <tr><td>Rushed fix with no folder changes</td><td>SQL service: Change</td><td>Users: Read only</td><td>Read only — backup still fails</td></tr>
</table>
<p>The standard design is deliberately simple: open the share broadly (Full Control for a dedicated group), then do all real authorisation with NTFS. That leaves one place to audit and one place to change. Enable <em>access-based enumeration</em> if users should not see files they cannot open, and never rely on a mapped drive for SQL Server — the service runs in session 0 and does not inherit your drive mappings. Use the UNC path.</p>
<pre><code class="language-powershell">New-SmbShare -Name 'SQLBackup' -Path 'E:\\SQL\\Backup' -FullAccess 'CONTOSO\\svc_sqlserver'
Get-SmbShareAccess -Name 'SQLBackup' | Format-Table AccountName, AccessRight, AccessControlType -AutoSize</code></pre>
`
    },
    {
      h: "What SQL Server actually needs",
      html: `
<p>During setup, SQL Server creates per-service groups such as <code>SQLServerMSSQLUser$SQL01$MSSQLSERVER</code> and grants them the rights needed on the instance directories. The service logs in as a virtual account (<code>NT SERVICE\\MSSQLSERVER</code>) or a domain service account; either way, the <strong>engine's token</strong> must have read/write access to data and log files, the error log directory, backup destinations, and any file-table or FILESTREAM paths.</p>
<ul>
  <li><strong>Data and log folders:</strong> Modify for the service group or service account. SQL must create, extend, and delete files during restores and operations.</li>
  <li><strong>Backup folder or share:</strong> Modify (write for backup, read for restore) — for both the engine and, where used, the SQL Agent proxy.</li>
  <li><strong>Dump and error-log folders:</strong> write access, or you lose the diagnostics exactly when you need them.</li>
  <li><strong>Administrator groups:</strong> keep access for DBAs through a domain group, not a long list of personal accounts.</li>
</ul>
<pre><code class="language-powershell">Get-Acl -Path 'E:\\SQL\\Data' | Select-Object -ExpandProperty Access | Format-Table IdentityReference, AccessControlType, FileSystemRights, IsInherited, InheritanceFlags -AutoSize
icacls "E:\\SQL\\Data" /grant "CONTOSO\\svc_sqlserver:(OI)(CI)M" /T</code></pre>
<p>Resist the shortcut of granting Everyone Full Control to "make it work". It fixes the symptom, weakens the estate, and makes the next audit an unpleasant afternoon. If access must be changed, do it through a documented group so the grant can be reviewed and removed.</p>
`
    },
    {
      h: "Troubleshooting access denied",
      html: `
<p>SQL Server reports permission failures in characteristically unhelpful ways: <em>Operating system error 5 (Access is denied)</em> during backup or restore, a database stuck in <em>RESTORING</em> or <em>SUSPECT</em>, or a service that refuses to start. Work the problem in this order:</p>
<ol>
  <li>Read the SQL Server error log and Windows Event Viewer (Security events 4656 and 4663 if object auditing is enabled) for the exact path and account.</li>
  <li>Identify the identity actually running the service — <code>Get-CimInstance Win32_Service -Filter "Name='MSSQLSERVER'" | Select-Object Name, StartName</code>.</li>
  <li>Inspect the DACL on the exact file and its parent with <code>icacls</code> or <code>Get-Acl</code>; check for a deny and for missing OI/CI flags.</li>
  <li>Check the share ACL as well when the path is a UNC.</li>
  <li>Test from the service account's context, not your own admin session. A right-click Properties check as a Domain Admin proves almost nothing.</li>
</ol>
<pre><code class="language-powershell">icacls "E:\\SQL\\Data\\Sales.mdf"
icacls "E:\\SQL\\Data" /remove:g "BUILTIN\\Users" /T</code></pre>
<p>If all else fails, take ownership of the orphaned object with <code>takeown</code> and reset the ACL to an explicit baseline — but treat that as recovery, not routine administration. Record the original descriptor first, because a destructive reset during an incident can destroy the evidence of why access broke.</p>
`
    }
  ],

  scenario: {
    title: "Restored database stays SUSPECT twenty minutes before go-live",
    html: `
<p>A new reporting database must be live by 08:00. The DBA restores the backup successfully, but the database shows <em>SUSPECT</em> and the error log repeats <em>Operating system error 5 (Access is denied)</em> while opening the MDF. The storage team had moved the data files from an old LUN to a faster one the previous evening, copying them with a tool that preserved timestamps but not ACLs; the files inherited the root of the new volume, where the SQL Server service account had no grant.</p>
<p>Under time pressure the DBA verifies the service identity with <code>Get-CimInstance Win32_Service</code>, runs <code>icacls</code> on the file and sees only Administrators and SYSTEM, then grants the per-service group Modify with <code>(OI)(CI)</code> and <code>/T</code> on the folder. A restart of the database brings it online, followed by <code>DBCC CHECKDB</code> and a successful application smoke test.</p>
<p>Prevention: every storage migration includes an ACL step in the runbook and a post-move check from the service account's context; SQL service grants are applied by a repeatable PowerShell script; and the monitoring team alerts on databases that fail to come online. Nothing about the restore was wrong — the file's identity had changed underneath it.</p>
`
  },

  interview: [
    {
      q: "Why can a DBA read a backup file in Windows Explorer but SQL Server cannot restore it?",
      a: "Because permissions are evaluated against the requesting token. The DBA's token includes administrative group SIDs; the SQL Server service token does not. I check the service's StartName, inspect the file DACL with icacls, and grant the service account or per-service group the required rights, including OI/CI inheritance."
    },
    {
      q: "Explain explicit deny, inherited allow, and why ordering matters.",
      a: "Windows checks applicable ACEs in DACL order. Canonical ACLs put explicit ACEs before inherited ones and deny ACEs before allows at the same level, but the requested rights, token, and ACE order all matter. I inspect the effective ACL instead of assuming a deny always wins."
    },
    {
      q: "What is the difference between NTFS and share permissions for a backup target?",
      a: "They are separate layers and the more restrictive wins. The usual design is to open the share to a dedicated group with Full Control and enforce real access through NTFS, giving one place to audit. SQL Server must access the UNC path, not a mapped drive, because it runs in a different session."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “Every NTFS file and folder carries a _____.”",
      "options": [
        "security descriptor",
        "SACL",
        "not attached to the account"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Every NTFS file and folder carries a security descriptor. The part that controls day-to-day access is the DACL (Discretionary Access Control List): an ordered list of ACEs (Access Control Entries). Each ACE grants or denies a set of rights to a trustee — identified internally by a security identifier (SID), not by the friendly name you see in the dialog.”"
    },
    {
      "question": "Complete the lesson statement: “Windows builds an _____ at logon containing the user's SID and every group SID, then compares that token with the DACL of the object being opened.”",
      "options": [
        "SACL",
        "not attached to the account",
        "access token"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Windows builds an access token at logon containing the user's SID and every group SID, then compares that token with the DACL of the object being opened. The result is the effective permission. Four rules govern almost every surprise:”"
    },
    {
      "question": "Complete the lesson statement: “An ACE on E:\\SQL marked _____ is inherited by everything beneath it; Windows shows it greyed out in the Advanced Security Settings dialog.”",
      "options": [
        "your",
        "Apply to: this folder, subfolders and files",
        "not attached to the account"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Permissions flow downwards. An ACE on E:\\SQL marked Apply to: this folder, subfolders and files is inherited by everything beneath it; Windows shows it greyed out in the Advanced Security Settings dialog. A permission applied directly to a child is explicit and survives a parent change unless you deliberately re-enable inheritance.”"
    },
    {
      "question": "Complete the lesson statement: “bak, Windows applies the _____ and the NTFS permission, and the more restrictive of the two wins.”",
      "options": [
        "share permission",
        "your",
        "access token"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Network shares add a second, independent permission layer. When a database is backed up to \\\\fileserver\\sqlbackup\\Full.bak, Windows applies the share permission and the NTFS permission, and the more restrictive of the two wins. A principal with Full Control on the share but only Read on the folder gets Read — backups fail. A principal with Full Control on the folder but Read on the share also gets Read.”"
    },
    {
      "question": "Complete the lesson statement: “The service logs in as a virtual account ( NT SERVICE\\MSSQLSERVER ) or a domain service account; either way, the _____ must have read/write access to data and log files, the error log directory, backup destinations, and any file-table or FILESTREAM paths.”",
      "options": [
        "access token",
        "effective permission",
        "engine's token"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “During setup, SQL Server creates per-service groups such as SQLServerMSSQLUser$SQL01$MSSQLSERVER and grants them the rights needed on the instance directories. The service logs in as a virtual account ( NT SERVICE\\MSSQLSERVER ) or a domain service account; either way, the engine's token must have read/write access to data and log files, the error log directory, backup destinations, and any file-table or FILESTREAM paths.”"
    },
    {
      "question": "Complete the lesson statement: “SQL Server reports permission failures in characteristically unhelpful ways: _____ during backup or restore, a database stuck in RESTORING or SUSPECT, or a service that refuses to start.”",
      "options": [
        "Allow entries accumulate.",
        "Operating system error 5 (Access is denied)",
        "effective permission"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “SQL Server reports permission failures in characteristically unhelpful ways: Operating system error 5 (Access is denied) during backup or restore, a database stuck in RESTORING or SUSPECT, or a service that refuses to start. Work the problem in this order:”"
    },
    {
      "question": "Complete the lesson statement: “The key mental shift: permissions are _____ you used to log in.”",
      "options": [
        "not attached to the account",
        "Deny wins.",
        "Explicit beats inherited."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The key mental shift: permissions are not attached to the account you used to log in. They are attached to the object and evaluated against the SIDs in the requesting process's token. SQL Server runs as a service account, so your Administrator rights are irrelevant to whether the engine can open a file.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Allow, deny, and effective access”?",
      "options": [
        "A restore fails with OS error 5 even though the file exists",
        "share permission",
        "Prefer allows to denies."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Prefer allows to denies. Grant the smallest useful set of rights to a dedicated group, and reserve deny entries for genuinely exceptional cases — their precedence makes them hard to reason about at 3 AM.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Inheritance, moves, and copies”?",
      "options": [
        "Resist the shortcut of granting Everyone Full Control to \"make it work\".",
        "Three operations produce most SQL Server permission incidents:",
        "engine's token"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Three operations produce most SQL Server permission incidents:”"
    },
    {
      "question": "Complete the lesson statement: “Enable _____ if users should not see files they cannot open, and never rely on a mapped drive for SQL Server — the service runs in session 0 and does not inherit your drive mappings.”",
      "options": [
        "access-based enumeration",
        "Ownership matters.",
        "Apply to: this folder, subfolders and files"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The standard design is deliberately simple: open the share broadly (Full Control for a dedicated group), then do all real authorisation with NTFS. That leaves one place to audit and one place to change. Enable access-based enumeration if users should not see files they cannot open, and never rely on a mapped drive for SQL Server — the service runs in session 0 and does not inherit your drive mappings. Use the UNC path.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “Every NTFS file and folder carries a _____.”",
      "options": [
        "security descriptor",
        "SACL",
        "not attached to the account"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Every NTFS file and folder carries a security descriptor. The part that controls day-to-day access is the DACL (Discretionary Access Control List): an ordered list of ACEs (Access Control Entries). Each ACE grants or denies a set of rights to a trustee — identified internally by a security identifier (SID), not by the friendly name you see in the dialog.”"
    },
    {
      "question": "Complete the lesson statement: “Windows builds an _____ at logon containing the user's SID and every group SID, then compares that token with the DACL of the object being opened.”",
      "options": [
        "SACL",
        "not attached to the account",
        "access token"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Windows builds an access token at logon containing the user's SID and every group SID, then compares that token with the DACL of the object being opened. The result is the effective permission. Four rules govern almost every surprise:”"
    },
    {
      "question": "Complete the lesson statement: “An ACE on E:\\SQL marked _____ is inherited by everything beneath it; Windows shows it greyed out in the Advanced Security Settings dialog.”",
      "options": [
        "your",
        "Apply to: this folder, subfolders and files",
        "not attached to the account"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Permissions flow downwards. An ACE on E:\\SQL marked Apply to: this folder, subfolders and files is inherited by everything beneath it; Windows shows it greyed out in the Advanced Security Settings dialog. A permission applied directly to a child is explicit and survives a parent change unless you deliberately re-enable inheritance.”"
    },
    {
      "question": "Complete the lesson statement: “bak, Windows applies the _____ and the NTFS permission, and the more restrictive of the two wins.”",
      "options": [
        "share permission",
        "your",
        "access token"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Network shares add a second, independent permission layer. When a database is backed up to \\\\fileserver\\sqlbackup\\Full.bak, Windows applies the share permission and the NTFS permission, and the more restrictive of the two wins. A principal with Full Control on the share but only Read on the folder gets Read — backups fail. A principal with Full Control on the folder but Read on the share also gets Read.”"
    },
    {
      "question": "Complete the lesson statement: “The service logs in as a virtual account ( NT SERVICE\\MSSQLSERVER ) or a domain service account; either way, the _____ must have read/write access to data and log files, the error log directory, backup destinations, and any file-table or FILESTREAM paths.”",
      "options": [
        "access token",
        "effective permission",
        "engine's token"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “During setup, SQL Server creates per-service groups such as SQLServerMSSQLUser$SQL01$MSSQLSERVER and grants them the rights needed on the instance directories. The service logs in as a virtual account ( NT SERVICE\\MSSQLSERVER ) or a domain service account; either way, the engine's token must have read/write access to data and log files, the error log directory, backup destinations, and any file-table or FILESTREAM paths.”"
    },
    {
      "question": "Complete the lesson statement: “SQL Server reports permission failures in characteristically unhelpful ways: _____ during backup or restore, a database stuck in RESTORING or SUSPECT, or a service that refuses to start.”",
      "options": [
        "Allow entries accumulate.",
        "Operating system error 5 (Access is denied)",
        "effective permission"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “SQL Server reports permission failures in characteristically unhelpful ways: Operating system error 5 (Access is denied) during backup or restore, a database stuck in RESTORING or SUSPECT, or a service that refuses to start. Work the problem in this order:”"
    },
    {
      "question": "Complete the lesson statement: “The key mental shift: permissions are _____ you used to log in.”",
      "options": [
        "not attached to the account",
        "Deny wins.",
        "Explicit beats inherited."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The key mental shift: permissions are not attached to the account you used to log in. They are attached to the object and evaluated against the SIDs in the requesting process's token. SQL Server runs as a service account, so your Administrator rights are irrelevant to whether the engine can open a file.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Allow, deny, and effective access”?",
      "options": [
        "A restore fails with OS error 5 even though the file exists",
        "share permission",
        "Prefer allows to denies."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Prefer allows to denies. Grant the smallest useful set of rights to a dedicated group, and reserve deny entries for genuinely exceptional cases — their precedence makes them hard to reason about at 3 AM.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Inheritance, moves, and copies”?",
      "options": [
        "Resist the shortcut of granting Everyone Full Control to \"make it work\".",
        "Three operations produce most SQL Server permission incidents:",
        "engine's token"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Three operations produce most SQL Server permission incidents:”"
    },
    {
      "question": "Complete the lesson statement: “Enable _____ if users should not see files they cannot open, and never rely on a mapped drive for SQL Server — the service runs in session 0 and does not inherit your drive mappings.”",
      "options": [
        "access-based enumeration",
        "Ownership matters.",
        "Apply to: this folder, subfolders and files"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The standard design is deliberately simple: open the share broadly (Full Control for a dedicated group), then do all real authorisation with NTFS. That leaves one place to audit and one place to change. Enable access-based enumeration if users should not see files they cannot open, and never rely on a mapped drive for SQL Server — the service runs in session 0 and does not inherit your drive mappings. Use the UNC path.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “Every NTFS file and folder carries a _____.”",
      "options": [
        "security descriptor",
        "SACL",
        "not attached to the account"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Every NTFS file and folder carries a security descriptor. The part that controls day-to-day access is the DACL (Discretionary Access Control List): an ordered list of ACEs (Access Control Entries). Each ACE grants or denies a set of rights to a trustee — identified internally by a security identifier (SID), not by the friendly name you see in the dialog.”"
    },
    {
      "question": "Complete the lesson statement: “Windows builds an _____ at logon containing the user's SID and every group SID, then compares that token with the DACL of the object being opened.”",
      "options": [
        "SACL",
        "not attached to the account",
        "access token"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Windows builds an access token at logon containing the user's SID and every group SID, then compares that token with the DACL of the object being opened. The result is the effective permission. Four rules govern almost every surprise:”"
    },
    {
      "question": "Complete the lesson statement: “An ACE on E:\\SQL marked _____ is inherited by everything beneath it; Windows shows it greyed out in the Advanced Security Settings dialog.”",
      "options": [
        "your",
        "Apply to: this folder, subfolders and files",
        "not attached to the account"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “Permissions flow downwards. An ACE on E:\\SQL marked Apply to: this folder, subfolders and files is inherited by everything beneath it; Windows shows it greyed out in the Advanced Security Settings dialog. A permission applied directly to a child is explicit and survives a parent change unless you deliberately re-enable inheritance.”"
    },
    {
      "question": "Complete the lesson statement: “bak, Windows applies the _____ and the NTFS permission, and the more restrictive of the two wins.”",
      "options": [
        "share permission",
        "your",
        "access token"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Network shares add a second, independent permission layer. When a database is backed up to \\\\fileserver\\sqlbackup\\Full.bak, Windows applies the share permission and the NTFS permission, and the more restrictive of the two wins. A principal with Full Control on the share but only Read on the folder gets Read — backups fail. A principal with Full Control on the folder but Read on the share also gets Read.”"
    },
    {
      "question": "Complete the lesson statement: “The service logs in as a virtual account ( NT SERVICE\\MSSQLSERVER ) or a domain service account; either way, the _____ must have read/write access to data and log files, the error log directory, backup destinations, and any file-table or FILESTREAM paths.”",
      "options": [
        "access token",
        "effective permission",
        "engine's token"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “During setup, SQL Server creates per-service groups such as SQLServerMSSQLUser$SQL01$MSSQLSERVER and grants them the rights needed on the instance directories. The service logs in as a virtual account ( NT SERVICE\\MSSQLSERVER ) or a domain service account; either way, the engine's token must have read/write access to data and log files, the error log directory, backup destinations, and any file-table or FILESTREAM paths.”"
    },
    {
      "question": "Complete the lesson statement: “SQL Server reports permission failures in characteristically unhelpful ways: _____ during backup or restore, a database stuck in RESTORING or SUSPECT, or a service that refuses to start.”",
      "options": [
        "Allow entries accumulate.",
        "Operating system error 5 (Access is denied)",
        "effective permission"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “SQL Server reports permission failures in characteristically unhelpful ways: Operating system error 5 (Access is denied) during backup or restore, a database stuck in RESTORING or SUSPECT, or a service that refuses to start. Work the problem in this order:”"
    },
    {
      "question": "Complete the lesson statement: “The key mental shift: permissions are _____ you used to log in.”",
      "options": [
        "not attached to the account",
        "Deny wins.",
        "Explicit beats inherited."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The key mental shift: permissions are not attached to the account you used to log in. They are attached to the object and evaluated against the SIDs in the requesting process's token. SQL Server runs as a service account, so your Administrator rights are irrelevant to whether the engine can open a file.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Allow, deny, and effective access”?",
      "options": [
        "A restore fails with OS error 5 even though the file exists",
        "share permission",
        "Prefer allows to denies."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Prefer allows to denies. Grant the smallest useful set of rights to a dedicated group, and reserve deny entries for genuinely exceptional cases — their precedence makes them hard to reason about at 3 AM.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Inheritance, moves, and copies”?",
      "options": [
        "Resist the shortcut of granting Everyone Full Control to \"make it work\".",
        "Three operations produce most SQL Server permission incidents:",
        "engine's token"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Three operations produce most SQL Server permission incidents:”"
    },
    {
      "question": "Complete the lesson statement: “Enable _____ if users should not see files they cannot open, and never rely on a mapped drive for SQL Server — the service runs in session 0 and does not inherit your drive mappings.”",
      "options": [
        "access-based enumeration",
        "Ownership matters.",
        "Apply to: this folder, subfolders and files"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The standard design is deliberately simple: open the share broadly (Full Control for a dedicated group), then do all real authorisation with NTFS. That leaves one place to audit and one place to change. Enable access-based enumeration if users should not see files they cannot open, and never rely on a mapped drive for SQL Server — the service runs in session 0 and does not inherit your drive mappings. Use the UNC path.”"
    }
  ],
  takeaways: [
    "Permissions live on the object and are evaluated against the SIDs in the requesting process's token",
    "Explicit deny beats allow; explicit entries beat inherited ones; owner can always change the DACL",
    "Copying or moving files across volumes changes inherited permissions — a classic cause of restore failures",
    "For network backup targets, the more restrictive of share and NTFS permissions wins; use UNC paths",
    "Troubleshoot from the service account's context with icacls, Get-Acl, and the SQL error log"
  ]
};
