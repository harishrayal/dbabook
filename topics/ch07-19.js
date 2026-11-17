/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch07-19.html */

window.TOPIC = {
  id: "ch07-19",
  title: "Tail-Log Backup",

  lead: "Tail-Log Backup is a core part of backup and recovery strategy. This topic explains what it is, how it works inside SQL Server, and what a production DBA must know to operate it safely.",

  objectives: [
    "Define what Tail-Log Backup is and where it fits",
    "Explain how Tail-Log Backup works internally",
    "Apply Tail-Log Backup correctly in a production environment",
    "Recognise the common mistakes and risks involving Tail-Log Backup",
    "Monitor and troubleshoot Tail-Log Backup with the right tools"
  ],

  sections: [
    {
      h: "What Tail-Log Backup means",
      html: `
<p>In this topic we examine <strong>Tail-Log Backup</strong> within backup and recovery strategy. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models. Together, full + differential + log backups form a chain.</p>
<p>Recovery models control log behaviour. SIMPLE truncates the log automatically and cannot do log backups. FULL retains log records until backed up. BULK_LOGGED minimally logs certain bulk operations at the cost of point-in-time precision within those operations.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Tail-Log Backup is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Tail-Log Backup fits",
      html: `
<p>Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain. They are ideal for one-off copies and tests.</p>
<p>The diagram below places Tail-Log Backup alongside the core concepts of backup and recovery strategy. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Tail-Log Backup concept map">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="280" y="140" width="200" height="60" rx="9" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="175" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Tail-Log Backup</text>
    <rect x="24" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Full backup</text>
    <text x="124" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 1</text>
    <rect x="536" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Differential</text>
    <text x="636" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 2</text>
    <rect x="24" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Log backup</text>
    <text x="124" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 3</text>
    <rect x="536" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Recovery model</text>
    <text x="636" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 4</text>
    <rect x="24" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Retention</text>
    <text x="124" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 5</text>
    <rect x="536" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">RPO</text>
    <text x="636" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 6</text>
    <line x1="380" y1="170" x2="124" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
  </svg>
  <div class="figcaption">Figure 1 — Backup and recovery strategy: how Tail-Log Backup relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Tail-Log Backup in practice",
      html: `
<p>Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest. RESTORE VERIFYONLY checks readability but does not confirm the database can actually be recovered — only a real restore does.</p>
<p>The following comparison captures the distinctions that matter most when working with Tail-Log Backup:</p>
<table>
  <tr><th>Backup type</th><th>Contains</th><th>Restore needs</th></tr>
  <tr><td>Full</td><td>Entire database</td><td>The full backup</td></tr>
  <tr><td>Differential</td><td>Changes since last full</td><td>Base full + latest diff</td></tr>
  <tr><td>Log</td><td>Log records since last log backup</td><td>Full (+diff) + log chain</td></tr>
</table>
<p>Retention and off-site copies follow the 3-2-1 rule: three copies, two different media, one off-site. Modern variants add an immutable/offline copy and a zero-error objective tested by automation.</p>
      `,
    },
    {
      h: "Working with Tail-Log Backup",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Tail-Log Backup. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Tail-Log Backup
BACKUP DATABASE SalesDB
TO DISK = 'D:\Backups\SalesDB_Full.bak'
WITH COMPRESSION, CHECKSUM, INIT, STATS = 10;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Tail-Log Backup
BACKUP LOG SalesDB
TO DISK = 'D:\Backups\SalesDB_Log.trn'
WITH COMPRESSION, CHECKSUM, STATS = 10;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Tail-Log Backup
SELECT d.name AS db, d.recovery_model_desc,
       max(b.backup_finish_date) AS last_backup,
       max(CASE WHEN b.type='L' THEN b.backup_finish_date END) AS last_log
FROM sys.databases d
LEFT JOIN msdb.dbo.backupset b ON b.database_name=d.name
GROUP BY d.name, d.recovery_model_desc
ORDER BY d.name;</code></pre>
<p>The most common backup failures are silent: a job that succeeds but writes to a full disk, a broken log chain after a recovery-model change, or media that has never been restored. Monitoring and regular restore tests are mandatory.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Backups are the only true protection against data loss. A backup strategy must be derived from business requirements — how much data can be lost (RPO) and how quickly the system must return (RTO) — not chosen arbitrarily.</p>
<table>
  <tr><th>Recovery model</th><th>Log backups</th><th>Point-in-time</th></tr>
  <tr><td>SIMPLE</td><td>Not supported</td><td>No</td></tr>
  <tr><td>FULL</td><td>Required</td><td>Yes</td></tr>
  <tr><td>BULK_LOGGED</td><td>Supported</td><td>Limited during bulk ops</td></tr>
</table>
<p>A full backup captures the whole database at a point in time and forms the base of a restore sequence. A differential backup captures only changes since the last full backup, so restore needs the base full plus the latest differential.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Tail-Log Backup, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Tail-Log Backup",
      html: `
<p>This section consolidates <strong>Tail-Log Backup</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest. RESTORE VERIFYONLY checks readability but does not confirm the database can actually be recovered — only a real restore does.</p>
<p>Retention and off-site copies follow the 3-2-1 rule: three copies, two different media, one off-site. Modern variants add an immutable/offline copy and a zero-error objective tested by automation.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Tail-Log Backup sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Backup type</th><th>Contains</th><th>Restore needs</th></tr>
  <tr><td>Full</td><td>Entire database</td><td>The full backup</td></tr>
  <tr><td>Differential</td><td>Changes since last full</td><td>Base full + latest diff</td></tr>
  <tr><td>Log</td><td>Log records since last log backup</td><td>Full (+diff) + log chain</td></tr>
</table>
<p>The most common backup failures are silent: a job that succeeds but writes to a full disk, a broken log chain after a recovery-model change, or media that has never been restored. Monitoring and regular restore tests are mandatory.</p>
<p>Use the following as a starting point when investigating Tail-Log Backup. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Tail-Log Backup
SELECT d.name AS db, d.recovery_model_desc,
       max(b.backup_finish_date) AS last_backup,
       max(CASE WHEN b.type='L' THEN b.backup_finish_date END) AS last_log
FROM sys.databases d
LEFT JOIN msdb.dbo.backupset b ON b.database_name=d.name
GROUP BY d.name, d.recovery_model_desc
ORDER BY d.name;</code></pre>
<p>Backups are the only true protection against data loss. A backup strategy must be derived from business requirements — how much data can be lost (RPO) and how quickly the system must return (RTO) — not chosen arbitrarily.</p>
      `,
    }
  ],

  scenario: {
    title: "The log chain broken by a model change",
    html: `
An engineer switched a database from FULL to SIMPLE and back to FULL to 'clear' a growing log, then never took another full backup. Log backups began failing with a chain error and RPO was silently unbounded. The prevention: change recovery model deliberately, immediately take a full backup, and alert on log backup failures.
<p><strong>The Tail-Log Backup lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "How do RPO and RTO shape a backup strategy?",
      a: `
RPO sets how often you must back up (maximum acceptable data loss) and RTO sets how fast you must restore; together they determine backup frequency, type, storage tier and whether log shipping or HA is needed.
      `,
    },
    {
      q: "What breaks the transaction log backup chain?",
      a: `
Switching recovery model, restoring with RECOVERY, or taking a non-copy-only full backup outside the normal plan can reset the differential base or log chain; always take a full backup after such changes.
      `,
    },
    {
      q: "Does RESTORE VERIFYONLY prove a backup is good?",
      a: `
No — it checks the backup set is readable and checksums pass, but it does not replay the log or open the database. Only performing a real restore on another instance proves recoverability.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within backup and recovery strategy.”",
      "options": [
        "Yes",
        "Limited during bulk ops",
        "Tail-Log Backup"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Tail-Log Backup within backup and recovery strategy. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Tail-Log Backup fits”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain.",
        "Tail-Log Backup sits inside a larger system."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain. They are ideal for one-off copies and tests.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Tail-Log Backup in practice”?",
      "options": [
        "Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest.",
        "Base full + latest diff",
        "Full (+diff) + log chain"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest. RESTORE VERIFYONLY checks readability but does not confirm the database can actually be recovered — only a real restore does.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Tail-Log Backup”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Tail-Log Backup. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Tail-Log Backup",
        "Backups are the only true protection against data loss.",
        "Limited during bulk ops"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Backups are the only true protection against data loss. A backup strategy must be derived from business requirements — how much data can be lost (RPO) and how quickly the system must return (RTO) — not chosen arbitrarily.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Tail-Log Backup",
        "Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models.",
        "Recovery models control log behaviour."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “This section consolidates Tail-Log Backup with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Tail-Log Backup means”?",
      "options": [
        "The diagram below places Tail-Log Backup alongside the core concepts of backup and recovery strategy.",
        "Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest.",
        "Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models. Together, full + differential + log backups form a chain.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Tail-Log Backup fits”?",
      "options": [
        "Tail-Log Backup is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.",
        "The diagram below places Tail-Log Backup alongside the core concepts of backup and recovery strategy.",
        "Recovery models control log behaviour."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The diagram below places Tail-Log Backup alongside the core concepts of backup and recovery strategy. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Tail-Log Backup in practice”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Tail-Log Backup:",
        "Tail-Log Backup is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.",
        "Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Tail-Log Backup:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Tail-Log Backup”?",
      "options": [
        "Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain.",
        "The diagram below places Tail-Log Backup alongside the core concepts of backup and recovery strategy.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within backup and recovery strategy.”",
      "options": [
        "Yes",
        "Limited during bulk ops",
        "Tail-Log Backup"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Tail-Log Backup within backup and recovery strategy. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Tail-Log Backup fits”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain.",
        "Tail-Log Backup sits inside a larger system."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain. They are ideal for one-off copies and tests.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Tail-Log Backup in practice”?",
      "options": [
        "Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest.",
        "Base full + latest diff",
        "Full (+diff) + log chain"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest. RESTORE VERIFYONLY checks readability but does not confirm the database can actually be recovered — only a real restore does.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Tail-Log Backup”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Tail-Log Backup. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Tail-Log Backup",
        "Backups are the only true protection against data loss.",
        "Limited during bulk ops"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Backups are the only true protection against data loss. A backup strategy must be derived from business requirements — how much data can be lost (RPO) and how quickly the system must return (RTO) — not chosen arbitrarily.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Tail-Log Backup",
        "Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models.",
        "Recovery models control log behaviour."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “This section consolidates Tail-Log Backup with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Tail-Log Backup means”?",
      "options": [
        "The diagram below places Tail-Log Backup alongside the core concepts of backup and recovery strategy.",
        "Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest.",
        "Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models. Together, full + differential + log backups form a chain.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Tail-Log Backup fits”?",
      "options": [
        "Tail-Log Backup is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.",
        "The diagram below places Tail-Log Backup alongside the core concepts of backup and recovery strategy.",
        "Recovery models control log behaviour."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The diagram below places Tail-Log Backup alongside the core concepts of backup and recovery strategy. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Tail-Log Backup in practice”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Tail-Log Backup:",
        "Tail-Log Backup is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.",
        "Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Tail-Log Backup:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Tail-Log Backup”?",
      "options": [
        "Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain.",
        "The diagram below places Tail-Log Backup alongside the core concepts of backup and recovery strategy.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within backup and recovery strategy.”",
      "options": [
        "Yes",
        "Limited during bulk ops",
        "Tail-Log Backup"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Tail-Log Backup within backup and recovery strategy. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Tail-Log Backup fits”?",
      "options": [
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain.",
        "Tail-Log Backup sits inside a larger system."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain. They are ideal for one-off copies and tests.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Tail-Log Backup in practice”?",
      "options": [
        "Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest.",
        "Base full + latest diff",
        "Full (+diff) + log chain"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest. RESTORE VERIFYONLY checks readability but does not confirm the database can actually be recovered — only a real restore does.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Tail-Log Backup”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Tail-Log Backup. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Tail-Log Backup",
        "Backups are the only true protection against data loss.",
        "Limited during bulk ops"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Backups are the only true protection against data loss. A backup strategy must be derived from business requirements — how much data can be lost (RPO) and how quickly the system must return (RTO) — not chosen arbitrarily.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Tail-Log Backup",
        "Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models.",
        "Recovery models control log behaviour."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “This section consolidates Tail-Log Backup with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Tail-Log Backup means”?",
      "options": [
        "The diagram below places Tail-Log Backup alongside the core concepts of backup and recovery strategy.",
        "Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest.",
        "Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models. Together, full + differential + log backups form a chain.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Tail-Log Backup fits”?",
      "options": [
        "Tail-Log Backup is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.",
        "The diagram below places Tail-Log Backup alongside the core concepts of backup and recovery strategy.",
        "Recovery models control log behaviour."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The diagram below places Tail-Log Backup alongside the core concepts of backup and recovery strategy. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Tail-Log Backup in practice”?",
      "options": [
        "The following comparison captures the distinctions that matter most when working with Tail-Log Backup:",
        "Tail-Log Backup is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.",
        "Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Tail-Log Backup:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Tail-Log Backup”?",
      "options": [
        "Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain.",
        "The diagram below places Tail-Log Backup alongside the core concepts of backup and recovery strategy.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Tail-Log Backup is a fundamental concept in backup and recovery strategy",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Tail-Log Backup improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
