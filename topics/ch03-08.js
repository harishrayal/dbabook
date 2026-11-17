/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch03-08.html */

window.TOPIC = {
  id: "ch03-08",
  title: "File and Folder Permissions",

  lead: "A SQL Server instance is a set of directories with precise access requirements: data files, log files, tempdb, backups, dumps, and agent output all need the right principal, at the right folder, for the right reason.",
  objectives: [
    "Design a folder layout for a production SQL Server instance",
    "Build a permission matrix for service accounts, DBAs, and applications",
    "Apply and verify folder ACLs with PowerShell and icacls",
    "Configure secure network shares for backups",
    "Avoid permission traps during file moves and restores"
  ],

  sections: [
    {
      h: "Why folder permissions are a DBA problem",
      html: `
<p>NTFS permissions describe the rules; <em>file and folder permissions in practice</em> are about choosing where database files live and which principal can touch them. SQL Server never asks your user account for permission — it opens files as the service identity. A grant you applied while logged in as a Domain Admin tells you nothing about whether the engine can create a backup file at 02:00.</p>
<p>Four categories of file must be considered on every instance:</p>
<ul>
  <li><strong>Database files</strong> — MDF/NDF data and LDF log files; the engine needs to create, extend, and delete them</li>
  <li><strong>Working files</strong> — tempdb, error logs, failure dumps, and SQL Agent job output</li>
  <li><strong>Recovery files</strong> — full, differential, and log backups, plus restore staging areas</li>
  <li><strong>Integration files</strong> — FILESTREAM and FileTable directories, SSIS packages, flat-file import/export folders</li>
</ul>
<p>Every one of these has caused a production incident when permissions were left to default during installation. The fix is not guesswork: decide the layout, write down the matrix, apply it with a script, and verify it from the service account's point of view.</p>
`
    },
    {
      h: "A deliberate folder layout",
      html: `
<p>The default instance directories under <code>C:\\Program Files\\Microsoft SQL Server\\...</code> are acceptable for a lab, but production databases belong on dedicated volumes with predictable paths. A layout that scales looks like this:</p>
<table>
  <tr><th>Path</th><th>Contents</th><th>Notes</th></tr>
  <tr><td><code>E:\\SQL\\Data</code></td><td>User database MDF/NDF files</td><td>One folder per database is easier to restore and audit</td></tr>
  <tr><td><code>L:\\SQL\\Log</code></td><td>LDF files</td><td>Separate volume for latency and growth isolation</td></tr>
  <tr><td><code>T:\\SQL\\TempDB</code></td><td>tempdb files</td><td>Equal-sized files; recreated on every restart</td></tr>
  <tr><td><code>B:\\SQL\\Backup</code></td><td>Local staging for backups</td><td>Use a network target for the real off-host copy</td></tr>
  <tr><td><code>C:\\SQL\\Dump</code></td><td>Failure dumps and error logs</td><td>On the OS volume; needs write access even when the data volume is full</td></tr>
  <tr><td><code>E:\\SQL\\FileTable</code></td><td>FILESTREAM / FileTable data</td><td>Requires special SQL configuration and its own ACL design</td></tr>
</table>
<p>Keep paths reasonably short and use the same structure on every node of an Availability Group or failover cluster. Applications and DBAs then move between servers without relearning the file system, and automation can assume a single convention.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="SQL Server folder layout with service account permissions">
    <defs>
      <marker id="fp-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="280" y="30" width="200" height="56" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="380" y="65" text-anchor="middle" fill="var(--accent-strong)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">E:\\SQL</text>

    <rect x="30" y="150" width="200" height="92" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="130" y="180" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Data</text>
    <text x="130" y="204" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">svc_sql: Modify (OI)(CI)</text>
    <text x="130" y="224" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">DBAs: Full · users: none</text>

    <rect x="280" y="150" width="200" height="92" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="180" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Log</text>
    <text x="380" y="204" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">svc_sql: Modify (OI)(CI)</text>
    <text x="380" y="224" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">never grant read to users</text>

    <rect x="530" y="150" width="200" height="92" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="630" y="180" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Backup</text>
    <text x="630" y="204" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">svc_sql: Modify (OI)(CI)</text>
    <text x="630" y="224" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">share + NTFS both apply</text>

    <line x1="350" y1="86" x2="150" y2="146" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#fp-arrow)"/>
    <line x1="380" y1="86" x2="380" y2="146" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#fp-arrow)"/>
    <line x1="410" y1="86" x2="610" y2="146" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#fp-arrow)"/>

    <rect x="150" y="276" width="460" height="44" rx="9" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.4"/>
    <text x="380" y="304" text-anchor="middle" fill="var(--text)" font-size="12.5" font-family="Segoe UI, sans-serif">Everyone else: no access · inheritance audited · permissions set by script</text>
  </svg>
  <div class="figcaption">Figure 1 — A role-based folder tree with a narrow, repeatable permission set.</div>
</div>
`
    },
    {
      h: "Building the permission matrix",
      html: `
<p>Before touching an ACL, write down who needs what. The matrix is small, and it turns a vague request like "give the app team access" into a specific decision:</p>
<table>
  <tr><th>Principal</th><th>Data / log folders</th><th>Backup folder</th><th>Dump folder</th><th>Reason</th></tr>
  <tr><td><strong>SQL service account or per-service group</strong></td><td>Modify</td><td>Modify</td><td>Write</td><td>Engine and Agent create and extend files</td></tr>
  <tr><td><strong>DBA group</strong></td><td>Full Control</td><td>Full Control</td><td>Read</td><td>Administration and incident recovery</td></tr>
  <tr><td><strong>Monitoring account</strong></td><td>Read</td><td>Read</td><td>Read</td><td>File-level checks without write capability</td></tr>
  <tr><td><strong>Application accounts</strong></td><td>None</td><td>None</td><td>None</td><td>Applications connect through SQL, never to MDF files</td></tr>
  <tr><td><strong>Everyone / Authenticated Users</strong></td><td>None</td><td>None</td><td>None</td><td>Too broad for any database path</td></tr>
</table>
<p>Note what is absent: application teams never get direct file access to MDF or LDF files. Bypassing the engine risks corruption that no backup strategy can repair. If a vendor insists on "just one folder", give them a dedicated import/export directory — never the database directory.</p>
<p>A couple of details save future incidents. Grant rights with <code>(OI)(CI)</code> so subfolders and files inherit them, and put the DBA grant on a group rather than individuals. If the server has multiple instances, keep their roots separate so a mistake on one instance cannot touch another.</p>
`
    },
    {
      h: "Applying and verifying permissions",
      html: `
<p>Use a script, not a sequence of mouse clicks. It is reviewable, repeatable on the next node, and it removes the temptation to fix an incident by adding Everyone. PowerShell splatting keeps long commands readable without line-continuation characters:</p>
<pre><code class="language-powershell">$dataParams = @{
    ItemType = 'Directory'
    Path     = 'E:\SQL\Data'
    Force    = $true
}
New-Item @dataParams | Out-Null
icacls 'E:\SQL\Data' /inheritance:r /grant:r 'Administrators:(OI)(CI)F' 'SYSTEM:(OI)(CI)F' 'CONTOSO\svc_sqlserver:(OI)(CI)M' /T</code></pre>
<p>Then verify what is actually there, including whether entries are inherited or explicit:</p>
<pre><code class="language-powershell">$paths = 'E:\SQL\Data', 'E:\SQL\Log', 'E:\SQL\Backup'
foreach ($p in $paths) {
    Get-Acl -Path $p | Select-Object -ExpandProperty Access |
        Where-Object { $_.IdentityReference -match 'svc_sqlserver' } |
        Select-Object IdentityReference, FileSystemRights, IsInherited, InheritanceFlags
}</code></pre>
<p>The last step is the one people skip: test as the service account. Run a command as that identity (or use a scheduled task under it) to create and delete a scratch file in each folder. If that test passes at build time, the 02:00 backup is far less likely to fail.</p>
`
    },
    {
      h: "Backup shares and UNC paths",
      html: `
<p>Off-host backups usually target a UNC path such as <code>\\\\fileserver\\sqlbackup\\Full\\Sales.bak</code>. Two permission layers apply, and the more restrictive wins: the SMB share ACL and the NTFS ACL on the folder. Keep the share simple and do the detailed authorisation with NTFS:</p>
<pre><code class="language-powershell">New-SmbShare -Name 'SQLBackup' -Path 'E:\SQL\Backup' -FullAccess 'CONTOSO\svc_sqlserver'
Grant-SmbShareAccess -Name 'SQLBackup' -AccountName 'CONTOSO\SQL_DBAs' -AccessRight Change -Force
Get-SmbShareAccess -Name 'SQLBackup' | Format-Table AccountName, AccessRight, AccessControlType -AutoSize</code></pre>
<ul>
  <li><strong>No mapped drives.</strong> The SQL Server service runs in session 0 and does not see your <code>Z:</code> mapping. Always use the UNC path in <code>BACKUP DATABASE</code>.</li>
  <li><strong>Use SMB 3 or better</strong> for backup targets; older SMB versions lose features and throughput.</li>
  <li><strong>Separate share per role.</strong> A share for SQL backups should not double as a general departmental drop box.</li>
  <li><strong>Verify from the engine.</strong> A successful <code>BACKUP DATABASE</code> followed by <code>RESTORE VERIFYONLY FROM DISK = '\\\\fileserver\\sqlbackup\\...'</code> proves both read and write access.</li>
</ul>
<p>Where encryption is required, use SMB encryption or IPsec rather than depending on the physical network. Backups are unencrypted database images by default — leaving them on a share with overly broad access is a data-breach waiting to happen.</p>
`
    },
    {
      h: "Moves, restores, and other traps",
      html: `
<ul>
  <li><strong>Copy across volumes:</strong> inherits the destination ACL. Always re-check <code>icacls</code> after a storage migration or a file copy from another server.</li>
  <li><strong>Move database files:</strong> the engine needs the path changed with <code>ALTER DATABASE ... MODIFY FILE</code>, an offline database, and a physical move that preserves the service account's access.</li>
  <li><strong>robocopy:</strong> <code>/COPY:DAT</code> copies data, attributes, and timestamps but not ACLs; <code>/COPYALL</code> includes security and ownership. Choose deliberately and test the result.</li>
  <li><strong>Antivirus exclusions:</strong> scanning database files as they are written can lock them and destroy latency. Exclude data, log, tempdb, backup, and dump directories — in consultation with the security team.</li>
  <li><strong>Orphaned ACLs:</strong> restoring from a backup taken on another server can bring in SIDs that do not exist locally. Grant access to the local service group explicitly.</li>
  <li><strong>Long paths:</strong> deeply nested restore folders can exceed the historical 260-character limit. Enable long paths or keep the layout shallow.</li>
</ul>
<pre><code class="language-sql">-- Change the recorded location, then take the database offline before moving the file
ALTER DATABASE Sales MODIFY FILE (NAME = Sales_Data, FILENAME = 'E:\SQL\Data\Sales.mdf');
ALTER DATABASE Sales SET OFFLINE;
-- Copy or move the file, verify ACLs, then:
ALTER DATABASE Sales SET ONLINE;</code></pre>
<p>Finally, treat permissions as part of the change record. When a restore or file move is documented with its before-and-after ACLs, the next incident is a five-minute comparison rather than an hour of speculation.</p>
`
    }
  ],

  scenario: {
    title: "Backups to the new file server fail at 02:00 with OS error 5",
    html: `
<p>The nightly full backup job has worked for months against <code>\\\\fileserver\\sqlbackup</code>. The infrastructure team rebuilds the file server over the weekend and restores the share from a backup. On Monday, backups fail with <em>Cannot open backup device. Operating system error 5 (Access is denied)</em>. The local backup folder starts filling because the job falls back to a local path, and the restore test for the afternoon is now at risk.</p>
<p>The DBA checks the SQL Agent history, then verifies the account the engine runs under, the share ACL (<code>Get-SmbShareAccess</code>), and the NTFS ACL on the restored folder. The restored folder has overwritten the original ACLs: the service account has no entry, and the share was recreated with Read only. The fix is to grant the service account Modify on both layers, re-run the full backup, and prove the file with <code>RESTORE VERIFYONLY</code>. Local staging files are cleaned up after the successful off-host copy.</p>
<p>Prevention: the share configuration and folder ACLs are captured in the build script, not in someone's memory; a weekly restore test reads from the same UNC path the backup job writes to; and free-space alerts cover the local staging folder so a failed network backup cannot silently fill a production volume.</p>
`
  },

  interview: [
    {
      q: "What folder permissions does the SQL Server service account need?",
      a: "Modify with Object Inherit and Container Inherit on data, log, tempdb, and backup folders, plus write access to the error log and dump directories. It must be able to create, extend, and delete files — not merely read them. Grant it to the service account or the setup-created per-service group, and keep application accounts out of those folders entirely."
    },
    {
      q: "Why can't I use a mapped network drive for SQL Server backups?",
      a: "Drive mappings are per user session; the SQL Server service runs in session 0 and cannot see yours. Use a UNC path. Remember that the share ACL and the NTFS ACL are both evaluated and the more restrictive wins, so check both when a backup fails with error 5."
    },
    {
      q: "Database files were moved to a new volume and the database will not open. What do you check?",
      a: "First confirm that moving across volumes changed inherited ACLs — compare icacls output with the old location and re-grant the service group. Then verify that ALTER DATABASE MODIFY FILE recorded the new path and that the database was offline during the move. Check the error log for the exact failing path before changing anything."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “NTFS permissions describe the rules; _____ are about choosing where database files live and which principal can touch them.”",
      "options": [
        "No mapped drives.",
        "file and folder permissions in practice",
        "Everyone / Authenticated Users"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “NTFS permissions describe the rules; file and folder permissions in practice are about choosing where database files live and which principal can touch them. SQL Server never asks your user account for permission — it opens files as the service identity. A grant you applied while logged in as a Domain Admin tells you nothing about whether the engine can create a backup file at 02:00.”"
    },
    {
      "question": "Which fact is covered in the lesson section “A deliberate folder layout”?",
      "options": [
        "The default instance directories under C:\\Program Files\\Microsoft SQL Server\\...",
        "Applications connect through SQL, never to MDF files",
        "Too broad for any database path"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The default instance directories under C:\\Program Files\\Microsoft SQL Server\\... are acceptable for a lab, but production databases belong on dedicated volumes with predictable paths. A layout that scales looks like this:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Building the permission matrix”?",
      "options": [
        "Requires special SQL configuration and its own ACL design",
        "Use a script, not a sequence of mouse clicks.",
        "Before touching an ACL, write down who needs what."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Before touching an ACL, write down who needs what. The matrix is small, and it turns a vague request like \"give the app team access\" into a specific decision:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Applying and verifying permissions”?",
      "options": [
        "Note what is absent: application teams never get direct file access to MDF or LDF files.",
        "Use a script, not a sequence of mouse clicks.",
        "Before touching an ACL, write down who needs what."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Use a script, not a sequence of mouse clicks. It is reviewable, repeatable on the next node, and it removes the temptation to fix an incident by adding Everyone. PowerShell splatting keeps long commands readable without line-continuation characters:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Backup shares and UNC paths”?",
      "options": [
        "bak.",
        "Note what is absent: application teams never get direct file access to MDF or LDF files.",
        "A couple of details save future incidents."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Off-host backups usually target a UNC path such as \\\\fileserver\\sqlbackup\\Full\\Sales.bak. Two permission layers apply, and the more restrictive wins: the SMB share ACL and the NTFS ACL on the folder. Keep the share simple and do the detailed authorisation with NTFS:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Moves, restores, and other traps”?",
      "options": [
        "A couple of details save future incidents.",
        "Engine and Agent create and extend files",
        "Finally, treat permissions as part of the change record."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Finally, treat permissions as part of the change record. When a restore or file move is documented with its before-and-after ACLs, the next incident is a five-minute comparison rather than an hour of speculation.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Why folder permissions are a DBA problem”?",
      "options": [
        "Too broad for any database path",
        "Four categories of file must be considered on every instance:",
        "Applications connect through SQL, never to MDF files"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Four categories of file must be considered on every instance:”"
    },
    {
      "question": "Which fact is covered in the lesson section “A deliberate folder layout”?",
      "options": [
        "Keep paths reasonably short and use the same structure on every node of an Availability Group or failover cluster.",
        "Where encryption is required, use SMB encryption or IPsec rather than depending on the physical network.",
        "Finally, treat permissions as part of the change record."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Keep paths reasonably short and use the same structure on every node of an Availability Group or failover cluster. Applications and DBAs then move between servers without relearning the file system, and automation can assume a single convention.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Building the permission matrix”?",
      "options": [
        "Finally, treat permissions as part of the change record.",
        "Before touching an ACL, write down who needs what.",
        "Note what is absent: application teams never get direct file access to MDF or LDF files."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Note what is absent: application teams never get direct file access to MDF or LDF files. Bypassing the engine risks corruption that no backup strategy can repair. If a vendor insists on \"just one folder\", give them a dedicated import/export directory — never the database directory.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Applying and verifying permissions”?",
      "options": [
        "Too broad for any database path",
        "Then verify what is actually there, including whether entries are inherited or explicit:",
        "Applications connect through SQL, never to MDF files"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Then verify what is actually there, including whether entries are inherited or explicit:”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “NTFS permissions describe the rules; _____ are about choosing where database files live and which principal can touch them.”",
      "options": [
        "No mapped drives.",
        "file and folder permissions in practice",
        "Everyone / Authenticated Users"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “NTFS permissions describe the rules; file and folder permissions in practice are about choosing where database files live and which principal can touch them. SQL Server never asks your user account for permission — it opens files as the service identity. A grant you applied while logged in as a Domain Admin tells you nothing about whether the engine can create a backup file at 02:00.”"
    },
    {
      "question": "Which fact is covered in the lesson section “A deliberate folder layout”?",
      "options": [
        "The default instance directories under C:\\Program Files\\Microsoft SQL Server\\...",
        "Applications connect through SQL, never to MDF files",
        "Too broad for any database path"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The default instance directories under C:\\Program Files\\Microsoft SQL Server\\... are acceptable for a lab, but production databases belong on dedicated volumes with predictable paths. A layout that scales looks like this:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Building the permission matrix”?",
      "options": [
        "Requires special SQL configuration and its own ACL design",
        "Use a script, not a sequence of mouse clicks.",
        "Before touching an ACL, write down who needs what."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Before touching an ACL, write down who needs what. The matrix is small, and it turns a vague request like \"give the app team access\" into a specific decision:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Applying and verifying permissions”?",
      "options": [
        "Note what is absent: application teams never get direct file access to MDF or LDF files.",
        "Use a script, not a sequence of mouse clicks.",
        "Before touching an ACL, write down who needs what."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Use a script, not a sequence of mouse clicks. It is reviewable, repeatable on the next node, and it removes the temptation to fix an incident by adding Everyone. PowerShell splatting keeps long commands readable without line-continuation characters:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Backup shares and UNC paths”?",
      "options": [
        "bak.",
        "Note what is absent: application teams never get direct file access to MDF or LDF files.",
        "A couple of details save future incidents."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Off-host backups usually target a UNC path such as \\\\fileserver\\sqlbackup\\Full\\Sales.bak. Two permission layers apply, and the more restrictive wins: the SMB share ACL and the NTFS ACL on the folder. Keep the share simple and do the detailed authorisation with NTFS:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Moves, restores, and other traps”?",
      "options": [
        "A couple of details save future incidents.",
        "Engine and Agent create and extend files",
        "Finally, treat permissions as part of the change record."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Finally, treat permissions as part of the change record. When a restore or file move is documented with its before-and-after ACLs, the next incident is a five-minute comparison rather than an hour of speculation.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Why folder permissions are a DBA problem”?",
      "options": [
        "Too broad for any database path",
        "Four categories of file must be considered on every instance:",
        "Applications connect through SQL, never to MDF files"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Four categories of file must be considered on every instance:”"
    },
    {
      "question": "Which fact is covered in the lesson section “A deliberate folder layout”?",
      "options": [
        "Keep paths reasonably short and use the same structure on every node of an Availability Group or failover cluster.",
        "Where encryption is required, use SMB encryption or IPsec rather than depending on the physical network.",
        "Finally, treat permissions as part of the change record."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Keep paths reasonably short and use the same structure on every node of an Availability Group or failover cluster. Applications and DBAs then move between servers without relearning the file system, and automation can assume a single convention.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Building the permission matrix”?",
      "options": [
        "Finally, treat permissions as part of the change record.",
        "Before touching an ACL, write down who needs what.",
        "Note what is absent: application teams never get direct file access to MDF or LDF files."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Note what is absent: application teams never get direct file access to MDF or LDF files. Bypassing the engine risks corruption that no backup strategy can repair. If a vendor insists on \"just one folder\", give them a dedicated import/export directory — never the database directory.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Applying and verifying permissions”?",
      "options": [
        "Too broad for any database path",
        "Then verify what is actually there, including whether entries are inherited or explicit:",
        "Applications connect through SQL, never to MDF files"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Then verify what is actually there, including whether entries are inherited or explicit:”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “NTFS permissions describe the rules; _____ are about choosing where database files live and which principal can touch them.”",
      "options": [
        "No mapped drives.",
        "file and folder permissions in practice",
        "Everyone / Authenticated Users"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “NTFS permissions describe the rules; file and folder permissions in practice are about choosing where database files live and which principal can touch them. SQL Server never asks your user account for permission — it opens files as the service identity. A grant you applied while logged in as a Domain Admin tells you nothing about whether the engine can create a backup file at 02:00.”"
    },
    {
      "question": "Which fact is covered in the lesson section “A deliberate folder layout”?",
      "options": [
        "The default instance directories under C:\\Program Files\\Microsoft SQL Server\\...",
        "Applications connect through SQL, never to MDF files",
        "Too broad for any database path"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The default instance directories under C:\\Program Files\\Microsoft SQL Server\\... are acceptable for a lab, but production databases belong on dedicated volumes with predictable paths. A layout that scales looks like this:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Building the permission matrix”?",
      "options": [
        "Requires special SQL configuration and its own ACL design",
        "Use a script, not a sequence of mouse clicks.",
        "Before touching an ACL, write down who needs what."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Before touching an ACL, write down who needs what. The matrix is small, and it turns a vague request like \"give the app team access\" into a specific decision:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Applying and verifying permissions”?",
      "options": [
        "Note what is absent: application teams never get direct file access to MDF or LDF files.",
        "Use a script, not a sequence of mouse clicks.",
        "Before touching an ACL, write down who needs what."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Use a script, not a sequence of mouse clicks. It is reviewable, repeatable on the next node, and it removes the temptation to fix an incident by adding Everyone. PowerShell splatting keeps long commands readable without line-continuation characters:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Backup shares and UNC paths”?",
      "options": [
        "bak.",
        "Note what is absent: application teams never get direct file access to MDF or LDF files.",
        "A couple of details save future incidents."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Off-host backups usually target a UNC path such as \\\\fileserver\\sqlbackup\\Full\\Sales.bak. Two permission layers apply, and the more restrictive wins: the SMB share ACL and the NTFS ACL on the folder. Keep the share simple and do the detailed authorisation with NTFS:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Moves, restores, and other traps”?",
      "options": [
        "A couple of details save future incidents.",
        "Engine and Agent create and extend files",
        "Finally, treat permissions as part of the change record."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Finally, treat permissions as part of the change record. When a restore or file move is documented with its before-and-after ACLs, the next incident is a five-minute comparison rather than an hour of speculation.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Why folder permissions are a DBA problem”?",
      "options": [
        "Too broad for any database path",
        "Four categories of file must be considered on every instance:",
        "Applications connect through SQL, never to MDF files"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Four categories of file must be considered on every instance:”"
    },
    {
      "question": "Which fact is covered in the lesson section “A deliberate folder layout”?",
      "options": [
        "Keep paths reasonably short and use the same structure on every node of an Availability Group or failover cluster.",
        "Where encryption is required, use SMB encryption or IPsec rather than depending on the physical network.",
        "Finally, treat permissions as part of the change record."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Keep paths reasonably short and use the same structure on every node of an Availability Group or failover cluster. Applications and DBAs then move between servers without relearning the file system, and automation can assume a single convention.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Building the permission matrix”?",
      "options": [
        "Finally, treat permissions as part of the change record.",
        "Before touching an ACL, write down who needs what.",
        "Note what is absent: application teams never get direct file access to MDF or LDF files."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Note what is absent: application teams never get direct file access to MDF or LDF files. Bypassing the engine risks corruption that no backup strategy can repair. If a vendor insists on \"just one folder\", give them a dedicated import/export directory — never the database directory.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Applying and verifying permissions”?",
      "options": [
        "Too broad for any database path",
        "Then verify what is actually there, including whether entries are inherited or explicit:",
        "Applications connect through SQL, never to MDF files"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Then verify what is actually there, including whether entries are inherited or explicit:”"
    }
  ],
  takeaways: [
    "Decide the folder layout first: data, log, tempdb, backups, dumps, and integration files each have a role",
    "Write a permission matrix — service account Modify, DBAs Full, everyone else as little as possible",
    "Apply ACLs with scripts using (OI)(CI), then verify from the service account's context",
    "Backups to UNC paths require both share and NTFS access, and mapped drives do not work for SQL Server",
    "Copying files across volumes changes inherited permissions — re-check ACLs after every move or restore"
  ]
};
