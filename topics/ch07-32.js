/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch07-32.html */

window.TOPIC = {
  id: "ch07-32",
  title: "RPO and RTO Fundamentals",

  lead: "Understanding RPO and RTO Fundamentals is essential for anyone responsible for backup and recovery strategy. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what RPO and RTO Fundamentals is and where it fits",
    "Explain how RPO and RTO Fundamentals works internally",
    "Apply RPO and RTO Fundamentals correctly in a production environment",
    "Recognise the common mistakes and risks involving RPO and RTO Fundamentals",
    "Monitor and troubleshoot RPO and RTO Fundamentals with the right tools"
  ],

  sections: [
    {
      h: "What RPO and RTO Fundamentals means",
      html: `
<p>In this topic we examine <strong>RPO and RTO Fundamentals</strong> within backup and recovery strategy. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>The most common backup failures are silent: a job that succeeds but writes to a full disk, a broken log chain after a recovery-model change, or media that has never been restored. Monitoring and regular restore tests are mandatory.</p>
<p>Backups are the only true protection against data loss. A backup strategy must be derived from business requirements — how much data can be lost (RPO) and how quickly the system must return (RTO) — not chosen arbitrarily.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>RPO and RTO Fundamentals is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where RPO and RTO Fundamentals fits",
      html: `
<p>A full backup captures the whole database at a point in time and forms the base of a restore sequence. A differential backup captures only changes since the last full backup, so restore needs the base full plus the latest differential.</p>
<p>The diagram below places RPO and RTO Fundamentals alongside the core concepts of backup and recovery strategy. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="RPO and RTO Fundamentals flow">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="230" y="12" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="39" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Full backup</text>
    <rect x="230" y="66" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="93" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Differential</text>
    <rect x="230" y="120" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="147" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Log backup</text>
    <rect x="230" y="174" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="201" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Recovery model</text>
    <rect x="230" y="228" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="255" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Retention</text>
    <rect x="230" y="282" width="300" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="309" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">6. RPO</text>
    <line x1="380" y1="56" x2="380" y2="66" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="110" x2="380" y2="120" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="164" x2="380" y2="174" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="218" x2="380" y2="228" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="272" x2="380" y2="282" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">RPO and RTO Fundamentals</text>
  </svg>
  <div class="figcaption">Figure 1 — Backup and recovery strategy: how RPO and RTO Fundamentals relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "RPO and RTO Fundamentals in practice",
      html: `
<p>Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models. Together, full + differential + log backups form a chain.</p>
<p>The following comparison captures the distinctions that matter most when working with RPO and RTO Fundamentals:</p>
<table>
  <tr><th>Backup type</th><th>Contains</th><th>Restore needs</th></tr>
  <tr><td>Full</td><td>Entire database</td><td>The full backup</td></tr>
  <tr><td>Differential</td><td>Changes since last full</td><td>Base full + latest diff</td></tr>
  <tr><td>Log</td><td>Log records since last log backup</td><td>Full (+diff) + log chain</td></tr>
</table>
<p>Recovery models control log behaviour. SIMPLE truncates the log automatically and cannot do log backups. FULL retains log records until backed up. BULK_LOGGED minimally logs certain bulk operations at the cost of point-in-time precision within those operations.</p>
      `,
    },
    {
      h: "Working with RPO and RTO Fundamentals",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to RPO and RTO Fundamentals. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- RPO and RTO Fundamentals
BACKUP DATABASE SalesDB
TO DISK = 'D:\Backups\SalesDB_Full.bak'
WITH COMPRESSION, CHECKSUM, INIT, STATS = 10;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- RPO and RTO Fundamentals
BACKUP LOG SalesDB
TO DISK = 'D:\Backups\SalesDB_Log.trn'
WITH COMPRESSION, CHECKSUM, STATS = 10;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-sql">-- RPO and RTO Fundamentals
SELECT d.name AS db, d.recovery_model_desc,
       max(b.backup_finish_date) AS last_backup,
       max(CASE WHEN b.type='L' THEN b.backup_finish_date END) AS last_log
FROM sys.databases d
LEFT JOIN msdb.dbo.backupset b ON b.database_name=d.name
GROUP BY d.name, d.recovery_model_desc
ORDER BY d.name;</code></pre>
<p>Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain. They are ideal for one-off copies and tests.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest. RESTORE VERIFYONLY checks readability but does not confirm the database can actually be recovered — only a real restore does.</p>
<table>
  <tr><th>Recovery model</th><th>Log backups</th><th>Point-in-time</th></tr>
  <tr><td>SIMPLE</td><td>Not supported</td><td>No</td></tr>
  <tr><td>FULL</td><td>Required</td><td>Yes</td></tr>
  <tr><td>BULK_LOGGED</td><td>Supported</td><td>Limited during bulk ops</td></tr>
</table>
<p>Retention and off-site copies follow the 3-2-1 rule: three copies, two different media, one off-site. Modern variants add an immutable/offline copy and a zero-error objective tested by automation.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With RPO and RTO Fundamentals, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: RPO and RTO Fundamentals",
      html: `
<p>This section consolidates <strong>RPO and RTO Fundamentals</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models. Together, full + differential + log backups form a chain.</p>
<p>Recovery models control log behaviour. SIMPLE truncates the log automatically and cannot do log backups. FULL retains log records until backed up. BULK_LOGGED minimally logs certain bulk operations at the cost of point-in-time precision within those operations.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>RPO and RTO Fundamentals sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Recovery model</th><th>Log backups</th><th>Point-in-time</th></tr>
  <tr><td>SIMPLE</td><td>Not supported</td><td>No</td></tr>
  <tr><td>FULL</td><td>Required</td><td>Yes</td></tr>
  <tr><td>BULK_LOGGED</td><td>Supported</td><td>Limited during bulk ops</td></tr>
</table>
<p>Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain. They are ideal for one-off copies and tests.</p>
<p>Use the following as a starting point when investigating RPO and RTO Fundamentals. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- RPO and RTO Fundamentals
BACKUP DATABASE SalesDB
TO DISK = 'D:\Backups\SalesDB_Full.bak'
WITH COMPRESSION, CHECKSUM, INIT, STATS = 10;</code></pre>
<p>Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest. RESTORE VERIFYONLY checks readability but does not confirm the database can actually be recovered — only a real restore does.</p>
      `,
    }
  ],

  scenario: {
    title: "Backups succeeded, disk was full",
    html: `
Backup jobs reported success for days while writing to a share that had run out of space — the files were stale. A restore test would have caught it. The DBA added free-space monitoring on the backup target and a job that verifies recent backup file timestamps.
<p><strong>The RPO and RTO Fundamentals lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
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
    },
    {
      q: "How do RPO and RTO shape a backup strategy?",
      a: `
RPO sets how often you must back up (maximum acceptable data loss) and RTO sets how fast you must restore; together they determine backup frequency, type, storage tier and whether log shipping or HA is needed.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within backup and recovery strategy.”",
      "options": [
        "Base full + latest diff",
        "RPO and RTO Fundamentals",
        "The full backup"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine RPO and RTO Fundamentals within backup and recovery strategy. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where RPO and RTO Fundamentals fits”?",
      "options": [
        "A full backup captures the whole database at a point in time and forms the base of a restore sequence.",
        "Full (+diff) + log chain",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A full backup captures the whole database at a point in time and forms the base of a restore sequence. A differential backup captures only changes since the last full backup, so restore needs the base full plus the latest differential.”"
    },
    {
      "question": "Which fact is covered in the lesson section “RPO and RTO Fundamentals in practice”?",
      "options": [
        "Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest.",
        "Retention and off-site copies follow the 3-2-1 rule: three copies, two different media, one off-site.",
        "Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models. Together, full + differential + log backups form a chain.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with RPO and RTO Fundamentals”?",
      "options": [
        "Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest.",
        "Theory becomes useful when you can apply it.",
        "Full (+diff) + log chain"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to RPO and RTO Fundamentals. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest. RESTORE VERIFYONLY checks readability but does not confirm the database can actually be recovered — only a real restore does.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain.",
        "RPO and RTO Fundamentals"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates RPO and RTO Fundamentals with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What RPO and RTO Fundamentals means”?",
      "options": [
        "No",
        "The most common backup failures are silent: a job that succeeds but writes to a full disk, a broken log chain after a recovery-model change, or media that has never been restored.",
        "With RPO and RTO Fundamentals, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The most common backup failures are silent: a job that succeeds but writes to a full disk, a broken log chain after a recovery-model change, or media that has never been restored. Monitoring and regular restore tests are mandatory.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where RPO and RTO Fundamentals fits”?",
      "options": [
        "The diagram below places RPO and RTO Fundamentals alongside the core concepts of backup and recovery strategy.",
        "Retention and off-site copies follow the 3-2-1 rule: three copies, two different media, one off-site.",
        "With RPO and RTO Fundamentals, prefer measured, reversible changes."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places RPO and RTO Fundamentals alongside the core concepts of backup and recovery strategy. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “RPO and RTO Fundamentals in practice”?",
      "options": [
        "Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models.",
        "Recovery models control log behaviour.",
        "The following comparison captures the distinctions that matter most when working with RPO and RTO Fundamentals:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with RPO and RTO Fundamentals:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with RPO and RTO Fundamentals”?",
      "options": [
        "RPO and RTO Fundamentals sits inside a larger system.",
        "The first example establishes the relevant state.",
        "Limited during bulk ops"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within backup and recovery strategy.”",
      "options": [
        "Base full + latest diff",
        "RPO and RTO Fundamentals",
        "The full backup"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine RPO and RTO Fundamentals within backup and recovery strategy. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where RPO and RTO Fundamentals fits”?",
      "options": [
        "A full backup captures the whole database at a point in time and forms the base of a restore sequence.",
        "Full (+diff) + log chain",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A full backup captures the whole database at a point in time and forms the base of a restore sequence. A differential backup captures only changes since the last full backup, so restore needs the base full plus the latest differential.”"
    },
    {
      "question": "Which fact is covered in the lesson section “RPO and RTO Fundamentals in practice”?",
      "options": [
        "Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest.",
        "Retention and off-site copies follow the 3-2-1 rule: three copies, two different media, one off-site.",
        "Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models. Together, full + differential + log backups form a chain.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with RPO and RTO Fundamentals”?",
      "options": [
        "Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest.",
        "Theory becomes useful when you can apply it.",
        "Full (+diff) + log chain"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to RPO and RTO Fundamentals. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest. RESTORE VERIFYONLY checks readability but does not confirm the database can actually be recovered — only a real restore does.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain.",
        "RPO and RTO Fundamentals"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates RPO and RTO Fundamentals with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What RPO and RTO Fundamentals means”?",
      "options": [
        "No",
        "The most common backup failures are silent: a job that succeeds but writes to a full disk, a broken log chain after a recovery-model change, or media that has never been restored.",
        "With RPO and RTO Fundamentals, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The most common backup failures are silent: a job that succeeds but writes to a full disk, a broken log chain after a recovery-model change, or media that has never been restored. Monitoring and regular restore tests are mandatory.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where RPO and RTO Fundamentals fits”?",
      "options": [
        "The diagram below places RPO and RTO Fundamentals alongside the core concepts of backup and recovery strategy.",
        "Retention and off-site copies follow the 3-2-1 rule: three copies, two different media, one off-site.",
        "With RPO and RTO Fundamentals, prefer measured, reversible changes."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places RPO and RTO Fundamentals alongside the core concepts of backup and recovery strategy. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “RPO and RTO Fundamentals in practice”?",
      "options": [
        "Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models.",
        "Recovery models control log behaviour.",
        "The following comparison captures the distinctions that matter most when working with RPO and RTO Fundamentals:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with RPO and RTO Fundamentals:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with RPO and RTO Fundamentals”?",
      "options": [
        "RPO and RTO Fundamentals sits inside a larger system.",
        "The first example establishes the relevant state.",
        "Limited during bulk ops"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within backup and recovery strategy.”",
      "options": [
        "Base full + latest diff",
        "RPO and RTO Fundamentals",
        "The full backup"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine RPO and RTO Fundamentals within backup and recovery strategy. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where RPO and RTO Fundamentals fits”?",
      "options": [
        "A full backup captures the whole database at a point in time and forms the base of a restore sequence.",
        "Full (+diff) + log chain",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A full backup captures the whole database at a point in time and forms the base of a restore sequence. A differential backup captures only changes since the last full backup, so restore needs the base full plus the latest differential.”"
    },
    {
      "question": "Which fact is covered in the lesson section “RPO and RTO Fundamentals in practice”?",
      "options": [
        "Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest.",
        "Retention and off-site copies follow the 3-2-1 rule: three copies, two different media, one off-site.",
        "Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models. Together, full + differential + log backups form a chain.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with RPO and RTO Fundamentals”?",
      "options": [
        "Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest.",
        "Theory becomes useful when you can apply it.",
        "Full (+diff) + log chain"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to RPO and RTO Fundamentals. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest.",
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Compression reduces backup size and I/O; checksums detect corruption at backup time; encryption protects media at rest. RESTORE VERIFYONLY checks readability but does not confirm the database can actually be recovered — only a real restore does.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Copy-only backups are independent of the normal chain — a copy-only full does not reset the differential base and a copy-only log does not break the log chain.",
        "RPO and RTO Fundamentals"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates RPO and RTO Fundamentals with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What RPO and RTO Fundamentals means”?",
      "options": [
        "No",
        "The most common backup failures are silent: a job that succeeds but writes to a full disk, a broken log chain after a recovery-model change, or media that has never been restored.",
        "With RPO and RTO Fundamentals, prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The most common backup failures are silent: a job that succeeds but writes to a full disk, a broken log chain after a recovery-model change, or media that has never been restored. Monitoring and regular restore tests are mandatory.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where RPO and RTO Fundamentals fits”?",
      "options": [
        "The diagram below places RPO and RTO Fundamentals alongside the core concepts of backup and recovery strategy.",
        "Retention and off-site copies follow the 3-2-1 rule: three copies, two different media, one off-site.",
        "With RPO and RTO Fundamentals, prefer measured, reversible changes."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places RPO and RTO Fundamentals alongside the core concepts of backup and recovery strategy. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “RPO and RTO Fundamentals in practice”?",
      "options": [
        "Transaction log backups capture log records since the last log backup and allow point-in-time recovery in the FULL and BULK_LOGGED recovery models.",
        "Recovery models control log behaviour.",
        "The following comparison captures the distinctions that matter most when working with RPO and RTO Fundamentals:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with RPO and RTO Fundamentals:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with RPO and RTO Fundamentals”?",
      "options": [
        "RPO and RTO Fundamentals sits inside a larger system.",
        "The first example establishes the relevant state.",
        "Limited during bulk ops"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "RPO and RTO Fundamentals is a fundamental concept in backup and recovery strategy",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of RPO and RTO Fundamentals improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
