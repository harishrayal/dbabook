/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch07-30.html */

window.TOPIC = {
  id: "ch07-30",
  title: "Backup Restore Testing",

  lead: "This topic covers Backup Restore Testing — a concept you will meet repeatedly when working with backup and recovery strategy. We build from first principles to production guidance.",

  objectives: [
    "Define what Backup Restore Testing is and where it fits",
    "Explain how Backup Restore Testing works internally",
    "Apply Backup Restore Testing correctly in a production environment",
    "Recognise the common mistakes and risks involving Backup Restore Testing",
    "Monitor and troubleshoot Backup Restore Testing with the right tools"
  ],

  sections: [
    {
      h: "What Backup Restore Testing means",
      html: `
<p>In this topic we examine <strong>Backup Restore Testing</strong> within backup and recovery strategy. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest. RESTORE VERIFYONLY checks readability but does not confirm the database can actually be recovered — only a real restore does.</p>
<p>Retention and off-site copies follow the 3-2-1 rule: three copies, two different media, one off-site. Modern variants add an immutable/offline copy and a zero-error objective tested by automation.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Backup Restore Testing is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Backup Restore Testing fits",
      html: `
<p>The most common backup failures are silent: a job that succeeds but writes to a full disk, a broken log chain after a recovery-model change, or media that has never been restored. Monitoring and regular restore tests are mandatory.</p>
<p>The diagram below places Backup Restore Testing alongside the core concepts of backup and recovery strategy. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Backup Restore Testing layers">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="70" y="8" width="620" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="30" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Full backup</text>
    <text x="380" y="50" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 1</text>
    <rect x="100" y="62" width="560" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="84" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Differential</text>
    <text x="380" y="104" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 2</text>
    <rect x="130" y="116" width="500" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="138" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Log backup</text>
    <text x="380" y="158" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 3</text>
    <rect x="160" y="170" width="440" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="192" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Recovery model</text>
    <text x="380" y="212" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 4</text>
    <rect x="190" y="224" width="380" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="246" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Retention</text>
    <text x="380" y="266" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 5</text>
    <rect x="220" y="278" width="320" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="300" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">RPO</text>
    <text x="380" y="320" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 6</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Backup Restore Testing</text>
  </svg>
  <div class="figcaption">Figure 1 — Backup and recovery strategy: how Backup Restore Testing relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Backup Restore Testing in practice",
      html: `
<p>Backups are the only true protection against data loss. A backup strategy must be derived from business requirements — how much data can be lost (RPO) and how quickly the system must return (RTO) — not chosen arbitrarily.</p>
<p>The following comparison captures the distinctions that matter most when working with Backup Restore Testing:</p>
<table>
  <tr><th>Backup type</th><th>Contains</th><th>Restore needs</th></tr>
  <tr><td>Full</td><td>Entire database</td><td>The full backup</td></tr>
  <tr><td>Differential</td><td>Changes since last full</td><td>Base full + latest diff</td></tr>
  <tr><td>Log</td><td>Log records since last log backup</td><td>Full (+diff) + log chain</td></tr>
</table>
<p>A full backup captures the whole database at a point in time and forms the base of a restore sequence. A differential backup captures only changes since the last full backup, so restore needs the base full plus the latest differential.</p>
      `,
    },
    {
      h: "Working with Backup Restore Testing",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Backup Restore Testing. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Backup Restore Testing
BACKUP DATABASE SalesDB
TO DISK = 'D:\Backups\SalesDB_Full.bak'
WITH COMPRESSION, CHECKSUM, INIT, STATS = 10;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- Backup Restore Testing
BACKUP LOG SalesDB
TO DISK = 'D:\Backups\SalesDB_Log.trn'
WITH COMPRESSION, CHECKSUM, STATS = 10;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- Backup Restore Testing
SELECT d.name AS db, d.recovery_model_desc,
       max(b.backup_finish_date) AS last_backup,
       max(CASE WHEN b.type='L' THEN b.backup_finish_date END) AS last_log
FROM sys.databases d
LEFT JOIN msdb.dbo.backupset b ON b.database_name=d.name
GROUP BY d.name, d.recovery_model_desc
ORDER BY d.name;</code></pre>
<p>Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models. Together, full + differential + log backups form a chain.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Recovery models control log behaviour. SIMPLE truncates the log automatically and cannot do log backups. FULL retains log records until backed up. BULK_LOGGED minimally logs certain bulk operations at the cost of point-in-time precision within those operations.</p>
<table>
  <tr><th>Recovery model</th><th>Log backups</th><th>Point-in-time</th></tr>
  <tr><td>SIMPLE</td><td>Not supported</td><td>No</td></tr>
  <tr><td>FULL</td><td>Required</td><td>Yes</td></tr>
  <tr><td>BULK_LOGGED</td><td>Supported</td><td>Limited during bulk ops</td></tr>
</table>
<p>Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain. They are ideal for one-off copies and tests.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Backup Restore Testing, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Backup Restore Testing",
      html: `
<p>This section consolidates <strong>Backup Restore Testing</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Backups are the only true protection against data loss. A backup strategy must be derived from business requirements — how much data can be lost (RPO) and how quickly the system must return (RTO) — not chosen arbitrarily.</p>
<p>A full backup captures the whole database at a point in time and forms the base of a restore sequence. A differential backup captures only changes since the last full backup, so restore needs the base full plus the latest differential.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Backup Restore Testing sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Recovery model</th><th>Log backups</th><th>Point-in-time</th></tr>
  <tr><td>SIMPLE</td><td>Not supported</td><td>No</td></tr>
  <tr><td>FULL</td><td>Required</td><td>Yes</td></tr>
  <tr><td>BULK_LOGGED</td><td>Supported</td><td>Limited during bulk ops</td></tr>
</table>
<p>Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models. Together, full + differential + log backups form a chain.</p>
<p>Use the following as a starting point when investigating Backup Restore Testing. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Backup Restore Testing
BACKUP LOG SalesDB
TO DISK = 'D:\Backups\SalesDB_Log.trn'
WITH COMPRESSION, CHECKSUM, STATS = 10;</code></pre>
<p>Recovery models control log behaviour. SIMPLE truncates the log automatically and cannot do log backups. FULL retains log records until backed up. BULK_LOGGED minimally logs certain bulk operations at the cost of point-in-time precision within those operations.</p>
      `,
    }
  ],

  scenario: {
    title: "Backups succeeded, disk was full",
    html: `
Backup jobs reported success for days while writing to a share that had run out of space — the files were stale. A restore test would have caught it. The DBA added free-space monitoring on the backup target and a job that verifies recent backup file timestamps.
<p><strong>The Backup Restore Testing lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "Does RESTORE VERIFYONLY prove a backup is good?",
      a: `
No — it checks the backup set is readable and checksums pass, but it does not replay the log or open the database. Only performing a real restore on another instance proves recoverability.
      `,
    },
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
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within backup and recovery strategy.”",
      "options": [
        "Backup Restore Testing",
        "The following comparison captures the distinctions that matter most when working with Backup Restore Testing:",
        "A full backup captures the whole database at a point in time and forms the base of a restore sequence."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Backup Restore Testing within backup and recovery strategy. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Backup Restore Testing fits”?",
      "options": [
        "The full backup",
        "Base full + latest diff",
        "The most common backup failures are silent: a job that succeeds but writes to a full disk, a broken log chain after a recovery-model change, or media that has never been restored."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The most common backup failures are silent: a job that succeeds but writes to a full disk, a broken log chain after a recovery-model change, or media that has never been restored. Monitoring and regular restore tests are mandatory.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Backup Restore Testing in practice”?",
      "options": [
        "Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models.",
        "Backups are the only true protection against data loss.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Backups are the only true protection against data loss. A backup strategy must be derived from business requirements — how much data can be lost (RPO) and how quickly the system must return (RTO) — not chosen arbitrarily.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Backup Restore Testing”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The full backup",
        "Base full + latest diff"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Backup Restore Testing. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Base full + latest diff",
        "Full (+diff) + log chain",
        "Recovery models control log behaviour."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Recovery models control log behaviour. SIMPLE truncates the log automatically and cannot do log backups. FULL retains log records until backed up. BULK_LOGGED minimally logs certain bulk operations at the cost of point-in-time precision within those operations.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The first example establishes the relevant state.",
        "Backup Restore Testing",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Backup Restore Testing with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Backup Restore Testing means”?",
      "options": [
        "Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest.",
        "Recovery models control log behaviour.",
        "Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest. RESTORE VERIFYONLY checks readability but does not confirm the database can actually be recovered — only a real restore does.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Backup Restore Testing fits”?",
      "options": [
        "Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models.",
        "Recovery models control log behaviour.",
        "The diagram below places Backup Restore Testing alongside the core concepts of backup and recovery strategy."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Backup Restore Testing alongside the core concepts of backup and recovery strategy. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Backup Restore Testing in practice”?",
      "options": [
        "Limited during bulk ops",
        "The following comparison captures the distinctions that matter most when working with Backup Restore Testing:",
        "Yes"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Backup Restore Testing:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Backup Restore Testing”?",
      "options": [
        "The first example establishes the relevant state.",
        "No",
        "Yes"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within backup and recovery strategy.”",
      "options": [
        "Backup Restore Testing",
        "The following comparison captures the distinctions that matter most when working with Backup Restore Testing:",
        "A full backup captures the whole database at a point in time and forms the base of a restore sequence."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Backup Restore Testing within backup and recovery strategy. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Backup Restore Testing fits”?",
      "options": [
        "The full backup",
        "Base full + latest diff",
        "The most common backup failures are silent: a job that succeeds but writes to a full disk, a broken log chain after a recovery-model change, or media that has never been restored."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The most common backup failures are silent: a job that succeeds but writes to a full disk, a broken log chain after a recovery-model change, or media that has never been restored. Monitoring and regular restore tests are mandatory.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Backup Restore Testing in practice”?",
      "options": [
        "Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models.",
        "Backups are the only true protection against data loss.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Backups are the only true protection against data loss. A backup strategy must be derived from business requirements — how much data can be lost (RPO) and how quickly the system must return (RTO) — not chosen arbitrarily.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Backup Restore Testing”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The full backup",
        "Base full + latest diff"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Backup Restore Testing. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Base full + latest diff",
        "Full (+diff) + log chain",
        "Recovery models control log behaviour."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Recovery models control log behaviour. SIMPLE truncates the log automatically and cannot do log backups. FULL retains log records until backed up. BULK_LOGGED minimally logs certain bulk operations at the cost of point-in-time precision within those operations.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The first example establishes the relevant state.",
        "Backup Restore Testing",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Backup Restore Testing with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Backup Restore Testing means”?",
      "options": [
        "Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest.",
        "Recovery models control log behaviour.",
        "Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest. RESTORE VERIFYONLY checks readability but does not confirm the database can actually be recovered — only a real restore does.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Backup Restore Testing fits”?",
      "options": [
        "Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models.",
        "Recovery models control log behaviour.",
        "The diagram below places Backup Restore Testing alongside the core concepts of backup and recovery strategy."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Backup Restore Testing alongside the core concepts of backup and recovery strategy. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Backup Restore Testing in practice”?",
      "options": [
        "Limited during bulk ops",
        "The following comparison captures the distinctions that matter most when working with Backup Restore Testing:",
        "Yes"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Backup Restore Testing:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Backup Restore Testing”?",
      "options": [
        "The first example establishes the relevant state.",
        "No",
        "Yes"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within backup and recovery strategy.”",
      "options": [
        "Backup Restore Testing",
        "The following comparison captures the distinctions that matter most when working with Backup Restore Testing:",
        "A full backup captures the whole database at a point in time and forms the base of a restore sequence."
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Backup Restore Testing within backup and recovery strategy. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Backup Restore Testing fits”?",
      "options": [
        "The full backup",
        "Base full + latest diff",
        "The most common backup failures are silent: a job that succeeds but writes to a full disk, a broken log chain after a recovery-model change, or media that has never been restored."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The most common backup failures are silent: a job that succeeds but writes to a full disk, a broken log chain after a recovery-model change, or media that has never been restored. Monitoring and regular restore tests are mandatory.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Backup Restore Testing in practice”?",
      "options": [
        "Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models.",
        "Backups are the only true protection against data loss.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Backups are the only true protection against data loss. A backup strategy must be derived from business requirements — how much data can be lost (RPO) and how quickly the system must return (RTO) — not chosen arbitrarily.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Backup Restore Testing”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The full backup",
        "Base full + latest diff"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Backup Restore Testing. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Base full + latest diff",
        "Full (+diff) + log chain",
        "Recovery models control log behaviour."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Recovery models control log behaviour. SIMPLE truncates the log automatically and cannot do log backups. FULL retains log records until backed up. BULK_LOGGED minimally logs certain bulk operations at the cost of point-in-time precision within those operations.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "The first example establishes the relevant state.",
        "Backup Restore Testing",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Backup Restore Testing with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Backup Restore Testing means”?",
      "options": [
        "Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest.",
        "Recovery models control log behaviour.",
        "Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest. RESTORE VERIFYONLY checks readability but does not confirm the database can actually be recovered — only a real restore does.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Backup Restore Testing fits”?",
      "options": [
        "Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models.",
        "Recovery models control log behaviour.",
        "The diagram below places Backup Restore Testing alongside the core concepts of backup and recovery strategy."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Backup Restore Testing alongside the core concepts of backup and recovery strategy. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Backup Restore Testing in practice”?",
      "options": [
        "Limited during bulk ops",
        "The following comparison captures the distinctions that matter most when working with Backup Restore Testing:",
        "Yes"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Backup Restore Testing:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Backup Restore Testing”?",
      "options": [
        "The first example establishes the relevant state.",
        "No",
        "Yes"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Backup Restore Testing is a fundamental concept in backup and recovery strategy",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Backup Restore Testing improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
