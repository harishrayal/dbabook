/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch03-05.html */

window.TOPIC = {
  id: "ch03-05",
  title: "Disk Partitions and Volumes",

  lead: "Every SQL Server database is ultimately a set of files on a Windows volume, so how disks are partitioned, formatted, and laid out decides how safely the database can grow — and how quickly it can fail.",

  objectives: [
    "Distinguish physical disks, partitions, volumes, and file systems",
    "Choose between MBR and GPT partition tables",
    "Use drive letters and mount points deliberately",
    "Select allocation unit size and formatting options for SQL Server files",
    "Design a volume layout that isolates data, log, tempdb, and backups"
  ],

  sections: [
    {
      h: "Disks, partitions, and volumes",
      html: `
<p>A physical disk is a block device: an SSD, a SAN LUN presented to the host, or a virtual disk in a hypervisor. Windows never lets a file system use the raw device directly. It first writes a <strong>partition table</strong> describing contiguous ranges of sectors, then formats one of those ranges and gives it an identity — a drive letter or a mount-point folder. That formatted range is a <strong>volume</strong>.</p>
<table>
  <tr><th>Layer</th><th>What it is</th><th>Example</th><th>Visible to SQL Server?</th></tr>
  <tr><td><strong>Physical disk</strong></td><td>Hardware, LUN, or virtual disk</td><td>Disk 3, 4 TB</td><td>No</td></tr>
  <tr><td><strong>Partition</strong></td><td>Contiguous sector range described in the partition table</td><td>Partition 2 on Disk 3</td><td>No</td></tr>
  <tr><td><strong>Volume</strong></td><td>Formatted partition with a letter or mount point</td><td>E:</td><td>Indirectly, through the path</td></tr>
  <tr><td><strong>File system</strong></td><td>NTFS metadata: MFT, clusters, ACLs, journals</td><td>NTFS, 64 KB clusters</td><td>Yes — permissions, growth, fragmentation</td></tr>
</table>
<p>A DBA normally sees only the last link in the chain: a path such as <code>E:\\SQL\\Data\\Sales.mdf</code>. Everything beneath it — partition style, alignment, volume size, allocation unit — is invisible in T-SQL, yet it determines whether the file can grow, how efficiently writes reach the storage array, and whether tomorrow's restore will even fit.</p>
<blockquote>SQL Server asks for a file path. The storage stack decides whether that path is a fast, resilient home or a trap waiting for a busy night.</blockquote>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Disk partition and volume layout for SQL Server">
    <defs>
      <marker id="dv-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <text x="40" y="28" fill="var(--text)" font-size="14" font-weight="600" font-family="Segoe UI, sans-serif">Disk 3 — GPT · 4 TB LUN</text>

    <rect x="40" y="42" width="680" height="86" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <rect x="56" y="58" width="110" height="54" rx="6" fill="var(--surface)" stroke="var(--border)"/>
    <text x="111" y="82" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">EFI</text>
    <text x="111" y="99" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">100 MB</text>

    <rect x="176" y="58" width="150" height="54" rx="6" fill="var(--surface)" stroke="var(--border)"/>
    <text x="251" y="82" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Partition 2</text>
    <text x="251" y="99" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">OS + binaries</text>

    <rect x="336" y="58" width="180" height="54" rx="6" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.5"/>
    <text x="426" y="82" text-anchor="middle" fill="var(--accent-strong)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Partition 3</text>
    <text x="426" y="99" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">data + log</text>

    <rect x="526" y="58" width="178" height="54" rx="6" fill="var(--surface)" stroke="var(--border)"/>
    <text x="615" y="82" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="600" font-family="Segoe UI, sans-serif">Partition 4</text>
    <text x="615" y="99" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">backup / staging</text>

    <rect x="30" y="190" width="160" height="72" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="110" y="218" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">C:</text>
    <text x="110" y="238" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">OS, SQL binaries, dumps</text>

    <rect x="210" y="190" width="160" height="72" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.5"/>
    <text x="290" y="218" text-anchor="middle" fill="var(--accent-strong)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">E:</text>
    <text x="290" y="238" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">MDF / NDF data files</text>

    <rect x="390" y="190" width="160" height="72" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="470" y="218" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">L:</text>
    <text x="470" y="238" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">LDF transaction log</text>

    <rect x="570" y="190" width="160" height="72" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="650" y="218" text-anchor="middle" fill="var(--text)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">B:</text>
    <text x="650" y="238" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">backups, restore tests</text>

    <line x1="251" y1="128" x2="130" y2="186" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#dv-arrow)"/>
    <line x1="426" y1="128" x2="300" y2="186" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#dv-arrow)"/>
    <line x1="470" y1="128" x2="470" y2="186" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#dv-arrow)"/>
    <line x1="615" y1="128" x2="650" y2="186" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#dv-arrow)"/>

    <text x="380" y="308" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Partitions divide the disk; volumes give each division a file system, a purpose, and its own growth path.</text>
  </svg>
  <div class="figcaption">Figure 1 — One physical disk split into partitions, with volumes assigned to OS, data, log, and backup roles.</div>
</div>
`
    },
    {
      h: "MBR versus GPT: the partition table",
      html: `
<p><strong>MBR</strong> (Master Boot Record) is a legacy partition style with a roughly 2 TiB address limit on disks using 512-byte sectors and at most four primary partition entries. <strong>GPT</strong> (GUID Partition Table) supports larger disks and more partitions, and keeps redundant partition-table metadata.</p>
<table>
  <tr><th>Property</th><th>MBR</th><th>GPT</th></tr>
  <tr><td>Disk size</td><td>Limited to about 2 TiB with 512-byte sectors</td><td>Supports disks larger than 2 TiB; practical limits depend on Windows and storage</td></tr>
  <tr><td>Partition entries</td><td>4 primary, or 3 primary plus extended</td><td>128 by default</td></tr>
  <tr><td>Boot requirement</td><td>Commonly used with BIOS boot</td><td>Required for native UEFI boot; data-disk use is separate from boot mode</td></tr>
  <tr><td>Integrity</td><td>No checksum, single table copy</td><td>CRC checksums plus a backup header</td></tr>
  <tr><td>Partition identity</td><td>Byte offsets</td><td>GUIDs — stable across reordering</td></tr>
</table>
<p>A multi-terabyte LUN that shows only about 2 TiB usable might be using MBR. Check the disk before creating partitions. Initializing or converting a disk can erase data; conversion options differ for boot and data disks, so verify backups and Microsoft's supported procedure before proceeding.</p>
<pre><code class="language-powershell">Get-Disk | Format-Table Number, FriendlyName, PartitionStyle, @{n='SizeGB';e={[math]::Round($_.Size/1GB,1)}}, OperationalStatus -AutoSize</code></pre>
<p>For new SQL Server volumes, GPT is the usual choice, especially for disks larger than 2 TiB. Partition count, alignment, and layout should follow the storage platform's supported design; inspect legacy templates and cloned VMs rather than assuming their layout is suitable.</p>
`
    },
    {
      h: "Drive letters and mount points",
      html: `
<p>A volume needs an identity before SQL Server can use it. A <strong>drive letter</strong> is the familiar choice, but a busy server can present dozens of LUNs and there are only 26 letters. A <strong>mount point</strong> attaches a volume to an empty folder on an existing NTFS volume, giving you paths such as <code>C:\\Mount\\SQLData01\\</code> with no letter consumed.</p>
<pre><code class="language-powershell">Get-Volume | Select-Object DriveLetter, FileSystemLabel, FileSystem, @{n='SizeGB';e={[math]::Round($_.Size/1GB,1)}}, @{n='FreeGB';e={[math]::Round($_.SizeRemaining/1GB,1)}}, Path | Format-Table -AutoSize
mountvol</code></pre>
<p>SQL Server fully supports mount-point paths in <code>CREATE DATABASE</code> and <code>ALTER DATABASE ... MODIFY FILE</code>. The advantages are real: no letter exhaustion, a consistent naming scheme across servers, and the ability to add data volumes without re-letttering existing ones. The caveats are equally real:</p>
<ul>
  <li><strong>Tool support:</strong> some backup agents, installers, and monitoring tools enumerate drive letters only and never see mounted volumes — verify before standardising.</li>
  <li><strong>Accidental deletion:</strong> deleting the empty mount folder hides the volume rather than deleting it, which looks like data loss to the next DBA on call. Name mount folders clearly and document the mapping.</li>
  <li><strong>Cluster awareness:</strong> in a failover cluster, mount points must be part of the clustered disk resource and fail over with it.</li>
</ul>
<p>Choose one convention per estate and enforce it: letters for small standalone servers, mount points for consolidated or SAN-heavy servers, and a register that maps volume GUID to purpose, LUN, and database.</p>
`
    },
    {
      h: "Allocation unit size and formatting",
      html: `
<p>NTFS stores files in <strong>clusters</strong>, also called allocation units; 4 KB is a common default. SQL Server pages are 8 KB and extents are 64 KB. A 64 KB allocation unit is a common SQL Server data-volume recommendation, but it isn't a guarantee of higher performance; follow current Microsoft and storage-vendor guidance for the specific workload and volume.</p>
<pre><code class="language-powershell">Format-Volume -DriveLetter L -FileSystem NTFS -AllocationUnitSize 65536 -NewFileSystemLabel 'SQLLog' -Confirm:$false</code></pre>
<p>Allocation unit size is fixed at format time. Changing it later means rebuilding the volume and moving every file, so it belongs in the build checklist alongside the partition style. Other formatting decisions that matter:</p>
<table>
  <tr><th>Option</th><th>Guidance for SQL Server</th></tr>
  <tr><td><strong>NTFS compression</strong></td><td>Don't enable on live database files unless the SQL Server version and workload are explicitly supported; test performance and recovery implications</td></tr>
  <tr><td><strong>EFS encryption</strong></td><td>Not supported for SQL Server database files; use BitLocker at the volume level if encryption is required</td></tr>
  <tr><td><strong>BitLocker</strong></td><td>Supported, but test key escrow, recovery mode, and performance before production</td></tr>
  <tr><td><strong>Deduplication</strong></td><td>Not supported on live database files; fine on backup targets that the backup product understands</td></tr>
  <tr><td><strong>Quick format</strong></td><td>Doesn't overwrite every data sector; use the organization's approved sanitization process for sensitive media</td></tr>
  <tr><td><strong>Sector size</strong></td><td>Check 512e versus 4Kn with <code>Get-Disk</code>; Windows aligns by default but old arrays may not</td></tr>
</table>
`
    },
    {
      h: "Laying out volumes for SQL Server",
      html: `
<p>Separate volumes are not about spinning disks any more; on all-flash arrays the reasons are blast radius, growth, backup I/O, and recovery. A workable production layout looks like this:</p>
<table>
  <tr><th>Volume</th><th>Contents</th><th>Typical size</th><th>Why separate</th></tr>
  <tr><td><strong>C:</strong></td><td>Windows, SQL binaries, memory dumps</td><td>120–200 GB</td><td>Patching and crash dumps must not consume database space</td></tr>
  <tr><td><strong>E:</strong> data</td><td>All user MDF/NDF files</td><td>Grows with data</td><td>Extend or restore without touching the log volume</td></tr>
  <tr><td><strong>L:</strong> log</td><td>LDF files only</td><td>Peak log + headroom</td><td>Sequential, latency-sensitive writes; log growth is independent</td></tr>
  <tr><td><strong>T:</strong> tempdb</td><td>tempdb data and log files</td><td>Size and file count based on workload</td><td>Recreated at restart; monitor space and allocation contention</td></tr>
  <tr><td><strong>B:</strong> backup</td><td>Local staging or backup cache, if needed</td><td>Based on backup sizes and retention</td><td>Keep recoverable copies off-host and monitor free space</td></tr>
</table>
<p>Pre-size files for expected workload where practical and choose autogrowth increments based on observed growth; percentage growth can become very large as files grow. Instant file initialization can accelerate data-file growth when enabled. Transaction-log growth is normally zero-initialized, with limited instant initialization support for log autogrowth up to 64 MB in SQL Server 2022 and later. Place tempdb according to measured capacity and I/O needs, and monitor it for growth and contention.</p>
<p>If the array supports tiers or quality-of-service policies, put the log on the lowest-latency tier. Every commit waits for a log write, so log latency multiplies straight into transaction latency — more so than data-file latency, which the buffer pool can often hide.</p>
`
    },
    {
      h: "Growth, expansion, and thin provisioning",
      html: `
<p>Volumes fill silently, and SQL Server is very good at filling them. Three habits prevent most incidents: monitor free space as a first-class alert, pre-size files, and know how to extend a volume before you need to.</p>
<ul>
  <li><strong>Thin provisioning:</strong> the LUN reports capacity the array does not physically have. Everything looks fine until the pool fills, then every write on every volume fails at once.</li>
  <li><strong>Snapshots and VSS:</strong> snapshot delta files consume array or volume space; a long-running snapshot can exhaust a volume that looks healthy in Windows.</li>
  <li><strong>Autogrowth:</strong> growth events can pause work and percentage increments increase with file size. Choose fixed or percentage increments to suit the workload, and pre-size files where practical.</li>
  <li><strong>Instant file initialization:</strong> the SQL Server service identity needs <em>Perform Volume Maintenance Tasks</em> for supported data-file operations. Log-file support is version- and growth-size-dependent.</li>
  <li><strong>Contiguous space:</strong> Windows can only extend a partition into unallocated space immediately after it. Grow the LUN first, rescan storage, then extend.</li>
</ul>
<pre><code class="language-powershell">Update-HostStorageCache
$max = (Get-PartitionSupportedSize -DriveLetter L).Size.Max
Resize-Partition -DriveLetter L -Size $max
Get-Volume -DriveLetter L | Select-Object DriveLetter, Size, SizeRemaining</code></pre>
<p>On a failover cluster, use a cluster-aware procedure and verify the new capacity on every node. Extending a volume can often be done online, but confirm support for the storage and cluster configuration, record the change, and check monitoring thresholds.</p>
`
    }
  ],

  scenario: {
    title: "The 2 AM ETL that filled C: and stopped every database",
    html: `
<p>At 02:10 the nightly ETL job fails with <em>The transaction log for database 'Sales' is full</em>. Ten minutes later the file share agent reports that the backup job cannot write to <code>C:\\Program Files\\Microsoft SQL Server\\MSSQL15.MSSQLSERVER\\MSSQL\\Backup</code>, and application logins begin timing out. The on-call DBA finds C: at 100 percent, the Sales log file at 180 GB on a 200 GB volume, and the backup job writing full backups to the default instance folder because the dedicated backup volume was never configured on this rebuilt node.</p>
<p>Diagnosis takes three commands: <code>Get-Volume</code> shows C: with zero free bytes, <code>Get-Disk</code> reveals the 4 TB data LUN is MBR and therefore only 2 TB usable, and the SQL error log shows repeated autogrowth events on the log. The immediate fix is to free space (move the backups to the SAN backup share, shrink nothing without approval), switch the database to simple recovery only with the application owner's sign-off, and let the ETL complete. The structural fix happens in the next window: convert the data LUN to GPT, add a dedicated backup volume, pre-size the log to its peak, and set autogrowth to fixed 1 GB increments.</p>
<p>Prevention is process, not heroics: free-space alerts at 20 percent and 10 percent on every volume, a build checklist that includes partition style and allocation unit size, and a backup destination that is validated by an actual restore test rather than a job status of "succeeded".</p>
`
  },

  interview: [
    {
      q: "When would you use a mount point instead of a drive letter?",
      a: "When a server presents more volumes than letters allow, or when I want a consistent, role-based path across many servers. Mount points avoid letter exhaustion and make added LUNs predictable. The trade-off is tool support: some backup and monitoring agents only enumerate drive letters, so I verify that before standardising, and I document the volume-to-folder mapping."
    },
    {
      q: "What allocation unit size do you use for SQL Server data and log volumes, and why?",
      a: "64 KB is a common recommendation for SQL Server data volumes, but I follow current Microsoft and storage-vendor guidance and validate the workload. Allocation unit size is selected when formatting; changing it later requires reformatting and moving the files."
    },
    {
      q: "A 4 TB LUN shows only 2 TB usable in Disk Management. What is happening?",
      a: "An MBR partition style has an approximately 2 TiB limit with 512-byte sectors. I confirm the style and size with Get-Disk, then follow a supported conversion or migration plan with verified backups; the correct method depends on whether it's a boot or data disk."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “It first writes a _____ describing contiguous ranges of sectors, then formats one of those ranges and gives it an identity — a drive letter or a mount-point folder.”",
      "options": [
        "drive letter",
        "partition table",
        "GPT"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A physical disk is a block device: an SSD, a SAN LUN presented to the host, or a virtual disk in a hypervisor. Windows never lets a file system use the raw device directly. It first writes a partition table describing contiguous ranges of sectors, then formats one of those ranges and gives it an identity — a drive letter or a mount-point folder. That formatted range is a volume.”"
    },
    {
      "question": "Complete the lesson statement: “_____ (Master Boot Record) is the legacy format: a 32-bit sector address, a 2 TiB ceiling, and four primary partition slots.”",
      "options": [
        "MBR",
        "drive letter",
        "mount point"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Two partition-table formats exist, and choosing the wrong one silently caps how much of a LUN you can use. MBR (Master Boot Record) is the legacy format: a 32-bit sector address, a 2 TiB ceiling, and four primary partition slots. GPT (GUID Partition Table) is the modern format: 64-bit addressing, 128 partition entries by default, and a backup copy of the table at the end of the disk.”"
    },
    {
      "question": "Complete the lesson statement: “A _____ is the familiar choice, but a busy server can present dozens of LUNs and there are only 26 letters.”",
      "options": [
        "mount point",
        "Tool support:",
        "drive letter"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A volume needs an identity before SQL Server can use it. A drive letter is the familiar choice, but a busy server can present dozens of LUNs and there are only 26 letters. A mount point attaches a volume to an empty folder on an existing NTFS volume, giving you paths such as C:\\Mount\\SQLData01\\ with no letter consumed.”"
    },
    {
      "question": "Complete the lesson statement: “NTFS stores files in _____, also called allocation units.”",
      "options": [
        "Tool support:",
        "clusters",
        "mount point"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “NTFS stores files in clusters, also called allocation units. The default is 4 KB. SQL Server reads in 8 KB pages and allocates space in 64 KB extents, so a 4 KB cluster means one extent spans sixteen separate clusters — more metadata work and less predictable sequential I/O. Microsoft's storage guidance for SQL Server recommends 64 KB allocation units on data and log volumes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Laying out volumes for SQL Server”?",
      "options": [
        "Separate volumes are not about spinning disks any more; on all-flash arrays the reasons are blast radius, growth, backup I/O, and recovery.",
        "128 by default",
        "UEFI for the boot disk; data disks work either way"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Separate volumes are not about spinning disks any more; on all-flash arrays the reasons are blast radius, growth, backup I/O, and recovery. A workable production layout looks like this:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Growth, expansion, and thin provisioning”?",
      "options": [
        "UEFI for the boot disk; data disks work either way",
        "CRC checksums plus a backup header",
        "Volumes fill silently, and SQL Server is very good at filling them."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Volumes fill silently, and SQL Server is very good at filling them. Three habits prevent most incidents: monitor free space as a first-class alert, pre-size files, and know how to extend a volume before you need to.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Disks, partitions, and volumes”?",
      "options": [
        "Allocation unit size is fixed at format time.",
        "mdf.",
        "clusters"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A DBA normally sees only the last link in the chain: a path such as E:\\SQL\\Data\\Sales.mdf. Everything beneath it — partition style, alignment, volume size, allocation unit — is invisible in T-SQL, yet it determines whether the file can grow, how efficiently writes reach the storage array, and whether tomorrow's restore will even fit.”"
    },
    {
      "question": "Which fact is covered in the lesson section “MBR versus GPT: the partition table”?",
      "options": [
        "The classic symptom is a 4 TB LUN that shows up as 2 TB usable in Disk Management.",
        "Supported, but test key escrow, recovery mode, and performance before production",
        "Not supported on live database files; fine on backup targets that the backup product understands"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The classic symptom is a 4 TB LUN that shows up as 2 TB usable in Disk Management. Nothing is broken; the disk was initialised as MBR, so the extra address space simply cannot be described. Converting MBR to GPT destroys data unless you use a tool that performs an in-place conversion — and that tool is a change with its own risk. Check before you build, not after:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Drive letters and mount points”?",
      "options": [
        "clusters",
        "Allocation unit size is fixed at format time.",
        "SQL Server fully supports mount-point paths in CREATE DATABASE and ALTER DATABASE..."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “SQL Server fully supports mount-point paths in CREATE DATABASE and ALTER DATABASE... MODIFY FILE. The advantages are real: no letter exhaustion, a consistent naming scheme across servers, and the ability to add data volumes without re-letttering existing ones. The caveats are equally real:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Allocation unit size and formatting”?",
      "options": [
        "Choose one convention per estate and enforce it: letters for small standalone servers, mount points for consolidated or SAN-heavy servers, and a register that maps volume GUID to…",
        "Allocation unit size is fixed at format time.",
        "SQL Server fully supports mount-point paths in CREATE DATABASE and ALTER DATABASE..."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Allocation unit size is fixed at format time. Changing it later means rebuilding the volume and moving every file, so it belongs in the build checklist alongside the partition style. Other formatting decisions that matter:”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “It first writes a _____ describing contiguous ranges of sectors, then formats one of those ranges and gives it an identity — a drive letter or a mount-point folder.”",
      "options": [
        "drive letter",
        "partition table",
        "GPT"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A physical disk is a block device: an SSD, a SAN LUN presented to the host, or a virtual disk in a hypervisor. Windows never lets a file system use the raw device directly. It first writes a partition table describing contiguous ranges of sectors, then formats one of those ranges and gives it an identity — a drive letter or a mount-point folder. That formatted range is a volume.”"
    },
    {
      "question": "Complete the lesson statement: “_____ (Master Boot Record) is the legacy format: a 32-bit sector address, a 2 TiB ceiling, and four primary partition slots.”",
      "options": [
        "MBR",
        "drive letter",
        "mount point"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Two partition-table formats exist, and choosing the wrong one silently caps how much of a LUN you can use. MBR (Master Boot Record) is the legacy format: a 32-bit sector address, a 2 TiB ceiling, and four primary partition slots. GPT (GUID Partition Table) is the modern format: 64-bit addressing, 128 partition entries by default, and a backup copy of the table at the end of the disk.”"
    },
    {
      "question": "Complete the lesson statement: “A _____ is the familiar choice, but a busy server can present dozens of LUNs and there are only 26 letters.”",
      "options": [
        "mount point",
        "Tool support:",
        "drive letter"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A volume needs an identity before SQL Server can use it. A drive letter is the familiar choice, but a busy server can present dozens of LUNs and there are only 26 letters. A mount point attaches a volume to an empty folder on an existing NTFS volume, giving you paths such as C:\\Mount\\SQLData01\\ with no letter consumed.”"
    },
    {
      "question": "Complete the lesson statement: “NTFS stores files in _____, also called allocation units.”",
      "options": [
        "Tool support:",
        "clusters",
        "mount point"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “NTFS stores files in clusters, also called allocation units. The default is 4 KB. SQL Server reads in 8 KB pages and allocates space in 64 KB extents, so a 4 KB cluster means one extent spans sixteen separate clusters — more metadata work and less predictable sequential I/O. Microsoft's storage guidance for SQL Server recommends 64 KB allocation units on data and log volumes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Laying out volumes for SQL Server”?",
      "options": [
        "Separate volumes are not about spinning disks any more; on all-flash arrays the reasons are blast radius, growth, backup I/O, and recovery.",
        "128 by default",
        "UEFI for the boot disk; data disks work either way"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Separate volumes are not about spinning disks any more; on all-flash arrays the reasons are blast radius, growth, backup I/O, and recovery. A workable production layout looks like this:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Growth, expansion, and thin provisioning”?",
      "options": [
        "UEFI for the boot disk; data disks work either way",
        "CRC checksums plus a backup header",
        "Volumes fill silently, and SQL Server is very good at filling them."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Volumes fill silently, and SQL Server is very good at filling them. Three habits prevent most incidents: monitor free space as a first-class alert, pre-size files, and know how to extend a volume before you need to.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Disks, partitions, and volumes”?",
      "options": [
        "Allocation unit size is fixed at format time.",
        "mdf.",
        "clusters"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A DBA normally sees only the last link in the chain: a path such as E:\\SQL\\Data\\Sales.mdf. Everything beneath it — partition style, alignment, volume size, allocation unit — is invisible in T-SQL, yet it determines whether the file can grow, how efficiently writes reach the storage array, and whether tomorrow's restore will even fit.”"
    },
    {
      "question": "Which fact is covered in the lesson section “MBR versus GPT: the partition table”?",
      "options": [
        "The classic symptom is a 4 TB LUN that shows up as 2 TB usable in Disk Management.",
        "Supported, but test key escrow, recovery mode, and performance before production",
        "Not supported on live database files; fine on backup targets that the backup product understands"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The classic symptom is a 4 TB LUN that shows up as 2 TB usable in Disk Management. Nothing is broken; the disk was initialised as MBR, so the extra address space simply cannot be described. Converting MBR to GPT destroys data unless you use a tool that performs an in-place conversion — and that tool is a change with its own risk. Check before you build, not after:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Drive letters and mount points”?",
      "options": [
        "clusters",
        "Allocation unit size is fixed at format time.",
        "SQL Server fully supports mount-point paths in CREATE DATABASE and ALTER DATABASE..."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “SQL Server fully supports mount-point paths in CREATE DATABASE and ALTER DATABASE... MODIFY FILE. The advantages are real: no letter exhaustion, a consistent naming scheme across servers, and the ability to add data volumes without re-letttering existing ones. The caveats are equally real:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Allocation unit size and formatting”?",
      "options": [
        "Choose one convention per estate and enforce it: letters for small standalone servers, mount points for consolidated or SAN-heavy servers, and a register that maps volume GUID to…",
        "Allocation unit size is fixed at format time.",
        "SQL Server fully supports mount-point paths in CREATE DATABASE and ALTER DATABASE..."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Allocation unit size is fixed at format time. Changing it later means rebuilding the volume and moving every file, so it belongs in the build checklist alongside the partition style. Other formatting decisions that matter:”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “It first writes a _____ describing contiguous ranges of sectors, then formats one of those ranges and gives it an identity — a drive letter or a mount-point folder.”",
      "options": [
        "drive letter",
        "partition table",
        "GPT"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A physical disk is a block device: an SSD, a SAN LUN presented to the host, or a virtual disk in a hypervisor. Windows never lets a file system use the raw device directly. It first writes a partition table describing contiguous ranges of sectors, then formats one of those ranges and gives it an identity — a drive letter or a mount-point folder. That formatted range is a volume.”"
    },
    {
      "question": "Complete the lesson statement: “_____ (Master Boot Record) is the legacy format: a 32-bit sector address, a 2 TiB ceiling, and four primary partition slots.”",
      "options": [
        "MBR",
        "drive letter",
        "mount point"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Two partition-table formats exist, and choosing the wrong one silently caps how much of a LUN you can use. MBR (Master Boot Record) is the legacy format: a 32-bit sector address, a 2 TiB ceiling, and four primary partition slots. GPT (GUID Partition Table) is the modern format: 64-bit addressing, 128 partition entries by default, and a backup copy of the table at the end of the disk.”"
    },
    {
      "question": "Complete the lesson statement: “A _____ is the familiar choice, but a busy server can present dozens of LUNs and there are only 26 letters.”",
      "options": [
        "mount point",
        "Tool support:",
        "drive letter"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “A volume needs an identity before SQL Server can use it. A drive letter is the familiar choice, but a busy server can present dozens of LUNs and there are only 26 letters. A mount point attaches a volume to an empty folder on an existing NTFS volume, giving you paths such as C:\\Mount\\SQLData01\\ with no letter consumed.”"
    },
    {
      "question": "Complete the lesson statement: “NTFS stores files in _____, also called allocation units.”",
      "options": [
        "Tool support:",
        "clusters",
        "mount point"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “NTFS stores files in clusters, also called allocation units. The default is 4 KB. SQL Server reads in 8 KB pages and allocates space in 64 KB extents, so a 4 KB cluster means one extent spans sixteen separate clusters — more metadata work and less predictable sequential I/O. Microsoft's storage guidance for SQL Server recommends 64 KB allocation units on data and log volumes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Laying out volumes for SQL Server”?",
      "options": [
        "Separate volumes are not about spinning disks any more; on all-flash arrays the reasons are blast radius, growth, backup I/O, and recovery.",
        "128 by default",
        "UEFI for the boot disk; data disks work either way"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Separate volumes are not about spinning disks any more; on all-flash arrays the reasons are blast radius, growth, backup I/O, and recovery. A workable production layout looks like this:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Growth, expansion, and thin provisioning”?",
      "options": [
        "UEFI for the boot disk; data disks work either way",
        "CRC checksums plus a backup header",
        "Volumes fill silently, and SQL Server is very good at filling them."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Volumes fill silently, and SQL Server is very good at filling them. Three habits prevent most incidents: monitor free space as a first-class alert, pre-size files, and know how to extend a volume before you need to.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Disks, partitions, and volumes”?",
      "options": [
        "Allocation unit size is fixed at format time.",
        "mdf.",
        "clusters"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “A DBA normally sees only the last link in the chain: a path such as E:\\SQL\\Data\\Sales.mdf. Everything beneath it — partition style, alignment, volume size, allocation unit — is invisible in T-SQL, yet it determines whether the file can grow, how efficiently writes reach the storage array, and whether tomorrow's restore will even fit.”"
    },
    {
      "question": "Which fact is covered in the lesson section “MBR versus GPT: the partition table”?",
      "options": [
        "The classic symptom is a 4 TB LUN that shows up as 2 TB usable in Disk Management.",
        "Supported, but test key escrow, recovery mode, and performance before production",
        "Not supported on live database files; fine on backup targets that the backup product understands"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The classic symptom is a 4 TB LUN that shows up as 2 TB usable in Disk Management. Nothing is broken; the disk was initialised as MBR, so the extra address space simply cannot be described. Converting MBR to GPT destroys data unless you use a tool that performs an in-place conversion — and that tool is a change with its own risk. Check before you build, not after:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Drive letters and mount points”?",
      "options": [
        "clusters",
        "Allocation unit size is fixed at format time.",
        "SQL Server fully supports mount-point paths in CREATE DATABASE and ALTER DATABASE..."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “SQL Server fully supports mount-point paths in CREATE DATABASE and ALTER DATABASE... MODIFY FILE. The advantages are real: no letter exhaustion, a consistent naming scheme across servers, and the ability to add data volumes without re-letttering existing ones. The caveats are equally real:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Allocation unit size and formatting”?",
      "options": [
        "Choose one convention per estate and enforce it: letters for small standalone servers, mount points for consolidated or SAN-heavy servers, and a register that maps volume GUID to…",
        "Allocation unit size is fixed at format time.",
        "SQL Server fully supports mount-point paths in CREATE DATABASE and ALTER DATABASE..."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Allocation unit size is fixed at format time. Changing it later means rebuilding the volume and moving every file, so it belongs in the build checklist alongside the partition style. Other formatting decisions that matter:”"
    }
  ],
  takeaways: [
    "Disk → partition → volume → file system: SQL Server sees the path, but every layer below it affects performance and growth",
    "Use GPT on every new volume; MBR silently caps a disk at 2 TiB",
    "Mount points remove the 26-letter limit, but verify that backup and monitoring tools can see them",
    "Format data and log volumes with 64 KB allocation units, and never compress or EFS-encrypt live database files",
    "Isolate data, log, tempdb, and backups on separate volumes — and pre-size files with fixed autogrowth increments"
  ]
};
