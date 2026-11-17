/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch04-17.html */

window.TOPIC = {
  id: "ch04-17",
  title: "Write-Ahead Logging (WAL)",

  lead: "Write-Ahead Logging is the single rule that makes SQL Server's performance and recovery both possible: data pages may be written lazily, but their log records must be written first — every time, without exception.",

  objectives: [
    "State the WAL rule precisely and explain why it exists",
    "Trace the path of a modification from log buffer to data file",
    "Connect WAL to the steal and no-force buffer policy",
    "Diagnose commit latency caused by log flushes",
    "Verify write-ahead behaviour using log and wait diagnostics"
  ],

  sections: [
    {
      h: "The write-ahead rule",
      html: `
<p>The rule, stated formally:</p>
<blockquote>Before any data page is written from the buffer pool to the data file, every log record describing a modification to that page must already be durable on disk in the transaction log.</blockquote>
<p>The consequence is simple to state and profound in effect: <strong>the log always leads the data files</strong>. At any instant, the LDF is at least as far forward as the MDF for every page it describes. That one invariant buys three things at once:</p>
<ul>
  <li><strong>Durability</strong> — a commit means the log reached disk; the data page can follow minutes later without risking the committed work</li>
  <li><strong>Recoverability</strong> — if a crash leaves data files behind the log, recovery can redo from the log; the log can never be behind the data files, so no committed change is unrecoverable</li>
  <li><strong>Write efficiency</strong> — random page writes become sequential log writes; commits cost one log flush, not a page write</li>
</ul>
<p>Break the rule once — write a page whose earlier log records are still in memory — and a crash at that moment leaves a data file that cannot be explained or repaired from the log. The engine therefore enforces the rule as an invariant of the storage engine, not a policy that a setting can disable.</p>
`
    },
    {
      h: "How a modification flows through the system",
      html: `
<p>Trace one UPDATE through the machinery:</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Write-ahead logging write flow">
    <defs>
      <marker id="p17-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
      <marker id="p17-arrow-a" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 10 0 L 0 5 L 10 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="25" y="28" width="165" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="107" y="53" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">UPDATE runs</text>
    <text x="107" y="74" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">page latched in memory</text>

    <rect x="225" y="28" width="175" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="312" y="53" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Log buffer</text>
    <text x="312" y="74" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">log record built first</text>

    <rect x="435" y="28" width="190" height="60" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="530" y="53" text-anchor="middle" fill="var(--accent-strong)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Log file · LDF</text>
    <text x="530" y="74" text-anchor="middle" fill="var(--accent-strong)" font-size="11.5" font-family="Segoe UI, sans-serif">flushed at commit (WRITELOG)</text>

    <rect x="655" y="28" width="85" height="60" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="697" y="62" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">COMMIT</text>

    <rect x="35" y="158" width="245" height="62" rx="10" fill="var(--surface-2)" stroke="var(--amber)" stroke-width="1.8"/>
    <text x="157" y="184" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Dirty page in buffer pool</text>
    <text x="157" y="206" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">m_lsn points at its log record</text>

    <rect x="470" y="158" width="245" height="62" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="592" y="184" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Data file · MDF</text>
    <text x="592" y="206" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">written only by checkpoint / lazy writer</text>

    <line x1="190" y1="58" x2="223" y2="58" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#p17-arrow)"/>
    <line x1="400" y1="58" x2="433" y2="58" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#p17-arrow)"/>
    <line x1="625" y1="58" x2="653" y2="58" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#p17-arrow)"/>
    <line x1="300" y1="90" x2="180" y2="156" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#p17-arrow)"/>
    <line x1="280" y1="189" x2="468" y2="189" stroke="var(--muted)" stroke-width="1.8" marker-end="url(#p17-arrow)"/>
    <text x="374" y="178" text-anchor="middle" fill="var(--muted)" font-size="12" font-family="Segoe UI, sans-serif">log records durable first</text>

    <rect x="35" y="258" width="690" height="62" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="380" y="284" text-anchor="middle" fill="var(--accent-strong)" font-size="14" font-weight="700" font-family="Segoe UI, sans-serif">Write-ahead rule: the LDF for this page must be on disk before the page reaches the MDF</text>
    <text x="380" y="307" text-anchor="middle" fill="var(--accent-strong)" font-size="12" font-family="Segoe UI, sans-serif">recovery relies on it: redo replays the log, undo reverts it — the log is always the source of truth</text>
  </svg>
  <div class="figcaption">Figure 1 — WAL write flow: log first at commit, data pages later, never the other way round.</div>
</div>
<ol>
  <li>The log record is appended to the <strong>log buffer</strong> — a sequential, in-memory write</li>
  <li>The page is modified in memory and marked dirty; its m_lsn is set to the record's LSN</li>
  <li>At <strong>commit</strong>, the log buffer is flushed to the LDF — the only I/O a commit performs</li>
  <li>Later, a checkpoint or the lazy writer writes the dirty page — after confirming the log for that page is already durable</li>
</ol>
`
    },
    {
      h: "Steal, no-force, and what WAL buys",
      html: `
<p>SQL Server pairs WAL with two buffer policies, and the combination is only safe because of the rule:</p>
<table>
  <tr><th>Scenario</th><th>On disk after a crash</th><th>What WAL enables</th></tr>
  <tr><td><strong>No-force</strong> — committed pages still in memory</td><td>Data files missing committed changes</td><td><strong>Redo</strong>: replay the log to reconstruct them</td></tr>
  <tr><td><strong>Steal</strong> — uncommitted pages already written</td><td>Data files contain later-rolled-back changes</td><td><strong>Undo</strong>: revert them using the log's undo chain</td></tr>
</table>
<p>Without WAL, SQL Server would have to force every page to disk before commit (destroying commit throughput) or forbid stealing (forcing uncommitted data to pin the buffer pool). WAL lets commits cost one log flush while recovery remains complete in both directions.</p>
<p>One more subtlety: concurrent commits are amortised — the engine performs <strong>group commit</strong>, letting many transactions share a single log flush. That is why throughput scales even though every commit waits on the log.</p>
`
    },
    {
      h: "When log flushes become the bottleneck",
      html: `
<p>Because commit = log flush, the log's storage path is on the critical path of every transaction. Symptoms of a slow log:</p>
<ul>
  <li><strong>WRITELOG</strong> dominates the wait profile — sessions waiting for the log to reach disk</li>
  <li>Commit latency rises while CPU and data-file I/O look idle</li>
  <li>Log autogrow events land mid-workload — log growth is <em>always</em> zero-initialised (instant file initialization cannot help the LDF), so a growth of even 512 MB can stall commits for seconds</li>
  <li>Percentage-based autogrow on a large log compounds the stall as the file grows</li>
</ul>
<pre><code class="language-sql">-- Who is waiting on log flushes right now?
SELECT session_id, wait_type, wait_duration_ms, resource_description
FROM   sys.dm_os_waiting_tasks
WHERE  wait_type = 'WRITELOG';

-- How much time has the instance spent waiting for the log?
SELECT wait_type, waiting_tasks_count, wait_time_ms,
       wait_time_ms / nullif(waiting_tasks_count, 0) AS avg_wait_ms
FROM   sys.dm_os_wait_stats
WHERE  wait_type = 'WRITELOG';</code></pre>
<p>The fixes are usually physical and organisational: put the LDF on the fastest tier (separate from data files), pre-size it so growth never happens in business hours, use fixed-megabyte autogrow instead of percentages, and reduce commit frequency where the application can batch work in fewer transactions.</p>
`
    },
    {
      h: "Seeing WAL in the log",
      html: `
<p>The log itself shows the ordering the rule guarantees — a begin record, the modification records, then the commit:</p>
<pre><code class="language-sql">-- The most recent log records: begin, row changes, commit
SELECT [Current LSN], [Operation], [Context], [Transaction ID], [Log Record Length]
FROM   sys.fn_dblog(NULL, NULL)
WHERE  [Operation] IN ('LOP_BEGIN_XACT', 'LOP_MODIFY_ROW',
                       'LOP_INSERT_ROWS', 'LOP_COMMIT_XACT')
ORDER BY [Current LSN];</code></pre>
<p>Note what is <em>absent</em>: there is no log record for writing the data page — page writes are inferred from checkpoint records, because the log is the source of truth and the data files are only a cached projection of it. Reading <code>m_lsn</code> on a page with DBCC PAGE and comparing it to the log is how you verify, page by page, that write-ahead ordering held.</p>
`
    }
  ],

  scenario: {
    title: "Commits took 40 ms while the array was barely loaded",
    html: `
<p>A transaction-processing service that normally commits in under 1 ms starts failing SLAs at 10:00. WRITELOG is 46% of all waits, CPU is idle, and the data files show 3 ms latency. The DBA checks the LDF: it sits on the same tier as a nightly archive, sits at 96% used, and is set to grow by 10% — each autogrow zero-initialising 40 GB and stalling every commit in the instance for 20–30 seconds, repeatedly.</p>
<p>Emergency: pre-size the log to a week of headroom during the lunch lull so no growth occurs in business hours, switch autogrow to a fixed 512 MB, and move the LDF to the fast tier with the archive off it. Commits returned to sub-millisecond within the hour. Prevention: alert on log percent-used above 60% and on any autogrow event, and make "no percentage autogrow on logs" a documented standard. <strong>The array was fine — the log path was the whole database's critical path.</strong></p>
`
  },

  interview: [
    {
      q: "State the write-ahead logging rule and explain why it is non-negotiable.",
      a: "Before a data page is written to disk, all log records that modify that page must already be durable in the transaction log. It is what makes recovery correct: the log can always explain or reconstruct the data files, never the other way round. Violating it once would leave a page on disk that no log record can repair after a crash."
    },
    {
      q: "A commit does not write the data page — so what does it write?",
      a: "Only the log. At commit the log buffer is flushed to the LDF (group commits let several transactions share one flush); the dirty data page may stay in memory indefinitely. The page is written later by a checkpoint or the lazy writer, with WAL guaranteeing the log got there first."
    },
    {
      q: "WRITELOG is your top wait. What do you investigate?",
      a: "The log's physical path: latency and queue depth on the LDF's storage, whether it shares a tier with data files or an archive, log percent-used and autogrow events (log growth is zero-initialised and stalls commits), autogrow increments (fix megabytes, never percentages), and application commit frequency so fewer flushes carry more work."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “The consequence is simple to state and profound in effect: _____.”",
      "options": [
        "Undo: revert them using the log's undo chain",
        "the log always leads the data files",
        "Redo: replay the log to reconstruct them"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The consequence is simple to state and profound in effect: the log always leads the data files. At any instant, the LDF is at least as far forward as the MDF for every page it describes. That one invariant buys three things at once:”"
    },
    {
      "question": "Which fact is covered in the lesson section “How a modification flows through the system”?",
      "options": [
        "Trace one UPDATE through the machinery:",
        "Steal",
        "Undo"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Trace one UPDATE through the machinery:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Steal, no-force, and what WAL buys”?",
      "options": [
        "Undo",
        "WRITELOG",
        "SQL Server pairs WAL with two buffer policies, and the combination is only safe because of the rule:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “SQL Server pairs WAL with two buffer policies, and the combination is only safe because of the rule:”"
    },
    {
      "question": "Which fact is covered in the lesson section “When log flushes become the bottleneck”?",
      "options": [
        "always",
        "Because commit = log flush, the log's storage path is on the critical path of every transaction.",
        "WRITELOG"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Because commit = log flush, the log's storage path is on the critical path of every transaction. Symptoms of a slow log:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Seeing WAL in the log”?",
      "options": [
        "The log itself shows the ordering the rule guarantees — a begin record, the modification records, then the commit:",
        "always",
        "the log always leads the data files"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The log itself shows the ordering the rule guarantees — a begin record, the modification records, then the commit:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The write-ahead rule”?",
      "options": [
        "Trace one UPDATE through the machinery:",
        "SQL Server pairs WAL with two buffer policies, and the combination is only safe because of the rule:",
        "Break the rule once — write a page whose earlier log records are still in memory — and a crash at that moment leaves a data file that cannot be explained or repaired from the log."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Break the rule once — write a page whose earlier log records are still in memory — and a crash at that moment leaves a data file that cannot be explained or repaired from the log. The engine therefore enforces the rule as an invariant of the storage engine, not a policy that a setting can disable.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Steal, no-force, and what WAL buys”?",
      "options": [
        "Trace one UPDATE through the machinery:",
        "Without WAL, SQL Server would have to force every page to disk before commit (destroying commit throughput) or forbid stealing (forcing uncommitted data to pin the buffer pool).",
        "Break the rule once — write a page whose earlier log records are still in memory — and a crash at that moment leaves a data file that cannot be explained or repaired from the log."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Without WAL, SQL Server would have to force every page to disk before commit (destroying commit throughput) or forbid stealing (forcing uncommitted data to pin the buffer pool). WAL lets commits cost one log flush while recovery remains complete in both directions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “When log flushes become the bottleneck”?",
      "options": [
        "The fixes are usually physical and organisational: put the LDF on the fastest tier (separate from data files), pre-size it so growth never happens in business hours, use…",
        "Trace one UPDATE through the machinery:",
        "SQL Server pairs WAL with two buffer policies, and the combination is only safe because of the rule:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The fixes are usually physical and organisational: put the LDF on the fastest tier (separate from data files), pre-size it so growth never happens in business hours, use fixed-megabyte autogrow instead of percentages, and reduce commit frequency where the application can batch work in fewer transactions.”"
    },
    {
      "question": "Complete the lesson statement: “Note what is _____: there is no log record for writing the data page — page writes are inferred from checkpoint records, because the log is the source of truth and the data files are only a cached projection of it.”",
      "options": [
        "Write efficiency",
        "log buffer",
        "absent"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Note what is absent: there is no log record for writing the data page — page writes are inferred from checkpoint records, because the log is the source of truth and the data files are only a cached projection of it. Reading m_lsn on a page with DBCC PAGE and comparing it to the log is how you verify, page by page, that write-ahead ordering held.”"
    },
    {
      "question": "Complete the lesson statement: “One more subtlety: concurrent commits are amortised — the engine performs _____, letting many transactions share a single log flush.”",
      "options": [
        "commit",
        "group commit",
        "log buffer"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “One more subtlety: concurrent commits are amortised — the engine performs group commit, letting many transactions share a single log flush. That is why throughput scales even though every commit waits on the log.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “The consequence is simple to state and profound in effect: _____.”",
      "options": [
        "Undo: revert them using the log's undo chain",
        "the log always leads the data files",
        "Redo: replay the log to reconstruct them"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The consequence is simple to state and profound in effect: the log always leads the data files. At any instant, the LDF is at least as far forward as the MDF for every page it describes. That one invariant buys three things at once:”"
    },
    {
      "question": "Which fact is covered in the lesson section “How a modification flows through the system”?",
      "options": [
        "Trace one UPDATE through the machinery:",
        "Steal",
        "Undo"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Trace one UPDATE through the machinery:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Steal, no-force, and what WAL buys”?",
      "options": [
        "Undo",
        "WRITELOG",
        "SQL Server pairs WAL with two buffer policies, and the combination is only safe because of the rule:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “SQL Server pairs WAL with two buffer policies, and the combination is only safe because of the rule:”"
    },
    {
      "question": "Which fact is covered in the lesson section “When log flushes become the bottleneck”?",
      "options": [
        "always",
        "Because commit = log flush, the log's storage path is on the critical path of every transaction.",
        "WRITELOG"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Because commit = log flush, the log's storage path is on the critical path of every transaction. Symptoms of a slow log:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Seeing WAL in the log”?",
      "options": [
        "The log itself shows the ordering the rule guarantees — a begin record, the modification records, then the commit:",
        "always",
        "the log always leads the data files"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The log itself shows the ordering the rule guarantees — a begin record, the modification records, then the commit:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The write-ahead rule”?",
      "options": [
        "Trace one UPDATE through the machinery:",
        "SQL Server pairs WAL with two buffer policies, and the combination is only safe because of the rule:",
        "Break the rule once — write a page whose earlier log records are still in memory — and a crash at that moment leaves a data file that cannot be explained or repaired from the log."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Break the rule once — write a page whose earlier log records are still in memory — and a crash at that moment leaves a data file that cannot be explained or repaired from the log. The engine therefore enforces the rule as an invariant of the storage engine, not a policy that a setting can disable.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Steal, no-force, and what WAL buys”?",
      "options": [
        "Trace one UPDATE through the machinery:",
        "Without WAL, SQL Server would have to force every page to disk before commit (destroying commit throughput) or forbid stealing (forcing uncommitted data to pin the buffer pool).",
        "Break the rule once — write a page whose earlier log records are still in memory — and a crash at that moment leaves a data file that cannot be explained or repaired from the log."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Without WAL, SQL Server would have to force every page to disk before commit (destroying commit throughput) or forbid stealing (forcing uncommitted data to pin the buffer pool). WAL lets commits cost one log flush while recovery remains complete in both directions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “When log flushes become the bottleneck”?",
      "options": [
        "The fixes are usually physical and organisational: put the LDF on the fastest tier (separate from data files), pre-size it so growth never happens in business hours, use…",
        "Trace one UPDATE through the machinery:",
        "SQL Server pairs WAL with two buffer policies, and the combination is only safe because of the rule:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The fixes are usually physical and organisational: put the LDF on the fastest tier (separate from data files), pre-size it so growth never happens in business hours, use fixed-megabyte autogrow instead of percentages, and reduce commit frequency where the application can batch work in fewer transactions.”"
    },
    {
      "question": "Complete the lesson statement: “Note what is _____: there is no log record for writing the data page — page writes are inferred from checkpoint records, because the log is the source of truth and the data files are only a cached projection of it.”",
      "options": [
        "Write efficiency",
        "log buffer",
        "absent"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Note what is absent: there is no log record for writing the data page — page writes are inferred from checkpoint records, because the log is the source of truth and the data files are only a cached projection of it. Reading m_lsn on a page with DBCC PAGE and comparing it to the log is how you verify, page by page, that write-ahead ordering held.”"
    },
    {
      "question": "Complete the lesson statement: “One more subtlety: concurrent commits are amortised — the engine performs _____, letting many transactions share a single log flush.”",
      "options": [
        "commit",
        "group commit",
        "log buffer"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “One more subtlety: concurrent commits are amortised — the engine performs group commit, letting many transactions share a single log flush. That is why throughput scales even though every commit waits on the log.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “The consequence is simple to state and profound in effect: _____.”",
      "options": [
        "Undo: revert them using the log's undo chain",
        "the log always leads the data files",
        "Redo: replay the log to reconstruct them"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The consequence is simple to state and profound in effect: the log always leads the data files. At any instant, the LDF is at least as far forward as the MDF for every page it describes. That one invariant buys three things at once:”"
    },
    {
      "question": "Which fact is covered in the lesson section “How a modification flows through the system”?",
      "options": [
        "Trace one UPDATE through the machinery:",
        "Steal",
        "Undo"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Trace one UPDATE through the machinery:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Steal, no-force, and what WAL buys”?",
      "options": [
        "Undo",
        "WRITELOG",
        "SQL Server pairs WAL with two buffer policies, and the combination is only safe because of the rule:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “SQL Server pairs WAL with two buffer policies, and the combination is only safe because of the rule:”"
    },
    {
      "question": "Which fact is covered in the lesson section “When log flushes become the bottleneck”?",
      "options": [
        "always",
        "Because commit = log flush, the log's storage path is on the critical path of every transaction.",
        "WRITELOG"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Because commit = log flush, the log's storage path is on the critical path of every transaction. Symptoms of a slow log:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Seeing WAL in the log”?",
      "options": [
        "The log itself shows the ordering the rule guarantees — a begin record, the modification records, then the commit:",
        "always",
        "the log always leads the data files"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The log itself shows the ordering the rule guarantees — a begin record, the modification records, then the commit:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The write-ahead rule”?",
      "options": [
        "Trace one UPDATE through the machinery:",
        "SQL Server pairs WAL with two buffer policies, and the combination is only safe because of the rule:",
        "Break the rule once — write a page whose earlier log records are still in memory — and a crash at that moment leaves a data file that cannot be explained or repaired from the log."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Break the rule once — write a page whose earlier log records are still in memory — and a crash at that moment leaves a data file that cannot be explained or repaired from the log. The engine therefore enforces the rule as an invariant of the storage engine, not a policy that a setting can disable.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Steal, no-force, and what WAL buys”?",
      "options": [
        "Trace one UPDATE through the machinery:",
        "Without WAL, SQL Server would have to force every page to disk before commit (destroying commit throughput) or forbid stealing (forcing uncommitted data to pin the buffer pool).",
        "Break the rule once — write a page whose earlier log records are still in memory — and a crash at that moment leaves a data file that cannot be explained or repaired from the log."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Without WAL, SQL Server would have to force every page to disk before commit (destroying commit throughput) or forbid stealing (forcing uncommitted data to pin the buffer pool). WAL lets commits cost one log flush while recovery remains complete in both directions.”"
    },
    {
      "question": "Which fact is covered in the lesson section “When log flushes become the bottleneck”?",
      "options": [
        "The fixes are usually physical and organisational: put the LDF on the fastest tier (separate from data files), pre-size it so growth never happens in business hours, use…",
        "Trace one UPDATE through the machinery:",
        "SQL Server pairs WAL with two buffer policies, and the combination is only safe because of the rule:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The fixes are usually physical and organisational: put the LDF on the fastest tier (separate from data files), pre-size it so growth never happens in business hours, use fixed-megabyte autogrow instead of percentages, and reduce commit frequency where the application can batch work in fewer transactions.”"
    },
    {
      "question": "Complete the lesson statement: “Note what is _____: there is no log record for writing the data page — page writes are inferred from checkpoint records, because the log is the source of truth and the data files are only a cached projection of it.”",
      "options": [
        "Write efficiency",
        "log buffer",
        "absent"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “Note what is absent: there is no log record for writing the data page — page writes are inferred from checkpoint records, because the log is the source of truth and the data files are only a cached projection of it. Reading m_lsn on a page with DBCC PAGE and comparing it to the log is how you verify, page by page, that write-ahead ordering held.”"
    },
    {
      "question": "Complete the lesson statement: “One more subtlety: concurrent commits are amortised — the engine performs _____, letting many transactions share a single log flush.”",
      "options": [
        "commit",
        "group commit",
        "log buffer"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “One more subtlety: concurrent commits are amortised — the engine performs group commit, letting many transactions share a single log flush. That is why throughput scales even though every commit waits on the log.”"
    }
  ],
  takeaways: [
    "WAL: log records for a page must be durable on disk before the page itself is written",
    "Commit costs one log flush (amortised by group commit) — data pages can follow much later",
    "Steal needs undo and no-force needs redo; WAL makes both safe",
    "WRITELOG waits mean the log path is the bottleneck — storage tier, autogrow, or commit frequency",
    "Log files are always zero-initialised: pre-size them and use fixed-MB autogrow",
    "m_lsn on a page versus the log is the page-level proof that write-ahead ordering held"
  ]
};
