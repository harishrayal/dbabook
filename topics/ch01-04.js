/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch01-04.html */

window.TOPIC = {
  id: "ch01-04",
  title: "Development, Testing, UAT, and Production Environments",

  lead: "Separate environments exist so that change can be proven before it touches real data — each stage of the path from development to production trades realism for safety in a deliberate way.",

  objectives: [
    "Explain why environments are separated and what each one is for",
    "Describe the promotion path from development to production",
    "Know what differs between environments beyond the schema",
    "Recognise environment pitfalls that surface only in production"
  ],

  sections: [
    {
      h: "Why separate environments exist",
      html: `
<p>An <strong>environment</strong> is an isolated instance of the system — its own databases, configuration, and (usually) its own data — with a specific purpose. The reason for separation is simple: <strong>change needs somewhere safe to be wrong</strong>. Every environment answers a different question:</p>
<ul>
  <li><strong>Development</strong> — “does the code work at all?” Fast feedback, disposable data, anything may change</li>
  <li><strong>Testing (QA)</strong> — “does it work correctly, and does it perform?” Closer to production shape, systematic test cases</li>
  <li><strong>UAT</strong> — “does it do what the business needs?” Business users, business data rules, acceptance sign-off</li>
  <li><strong>Production</strong> — “does it serve the organisation right now?” Real customers, real consequences, change control</li>
</ul>
<p>Each step forward increases <strong>realism</strong> (data volume, configuration parity, real users) and decreases <strong>freedom</strong> (approval, windows, rollback plans). Collapsing the environments — pointing development at production data, or skipping testing “because the change is small” — buys speed once and pays for it every release afterwards.</p>
<blockquote>Environments are not bureaucracy. They are the cheapest place to discover that your change is wrong.</blockquote>
`
    },
    {
      h: "The promotion path",
      html: `
<p>Code and schema move forward through the same path every time, ideally as one immutable artefact built once and promoted — never rebuilt per environment:</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Promotion path from development to production">
    <defs>
      <marker id="env-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="30" y="30" width="720" height="48" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.6"/>
    <text x="390" y="60" text-anchor="middle" fill="var(--accent-strong)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Version-controlled release artefact (migration scripts / DACPAC)</text>

    <line x1="105" y1="78" x2="105" y2="116" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#env-arrow)"/>
    <line x1="295" y1="78" x2="295" y2="116" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#env-arrow)"/>
    <line x1="485" y1="78" x2="485" y2="116" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#env-arrow)"/>
    <line x1="675" y1="78" x2="675" y2="116" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#env-arrow)"/>

    <rect x="30" y="120" width="150" height="76" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="105" y="150" text-anchor="middle" fill="var(--text)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Development</text>
    <text x="105" y="174" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">synthetic data</text>

    <rect x="220" y="120" width="150" height="76" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="295" y="150" text-anchor="middle" fill="var(--text)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Testing</text>
    <text x="295" y="174" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">production-shaped data</text>

    <rect x="410" y="120" width="150" height="76" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="485" y="150" text-anchor="middle" fill="var(--text)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">UAT</text>
    <text x="485" y="174" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">business sign-off</text>

    <rect x="600" y="120" width="150" height="76" rx="10" fill="var(--accent)" />
    <text x="675" y="150" text-anchor="middle" fill="#ffffff" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Production</text>
    <text x="675" y="174" text-anchor="middle" fill="#dbeafe" font-size="11.5" font-family="Segoe UI, sans-serif">real customers</text>

    <line x1="180" y1="158" x2="218" y2="158" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#env-arrow)"/>
    <line x1="370" y1="158" x2="408" y2="158" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#env-arrow)"/>
    <line x1="560" y1="158" x2="598" y2="158" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#env-arrow)"/>

    <text x="199" y="148" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">pass</text>
    <text x="389" y="148" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">pass</text>
    <text x="579" y="148" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Segoe UI, sans-serif">approve</text>

    <rect x="150" y="245" width="460" height="54" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="268" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Data moves sideways too: refreshes, masking, retention rules</text>
    <text x="380" y="288" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">only production ever holds unmasked customer data</text>

    <text x="380" y="330" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">The artefact is built once — if it changes between environments, it was never really tested.</text>
  </svg>
  <div class="figcaption">Figure 1 — One artefact promoted left to right, with data refreshed at each stage.</div>
</div>
<p>The rule that makes this work: <strong>the same artefact is promoted, not rebuilt</strong>. If the deployment script is regenerated by hand at each stage, testing proved something different from what production receives.</p>
`
    },
    {
      h: "What differs between environments",
      html: `
<p>The schema should be identical by the time a release reaches UAT. Almost everything else will differ — and the DBA's job is knowing <em>what</em> differs, because undocumented differences are where production incidents hide:</p>
<table>
  <tr><th>Aspect</th><th>Development</th><th>Testing / UAT</th><th>Production</th></tr>
  <tr><td>Data</td><td>Synthetic or masked</td><td>Refreshed, masked, production-shaped volume</td><td>Real, protected by retention rules</td></tr>
  <tr><td>Schema change</td><td>Free, frequent</td><td>Only via the release artefact</td><td>Reviewed, windowed, rollback planned</td></tr>
  <tr><td>Access</td><td>Developers broadly</td><td>Controlled test accounts</td><td>Least privilege, audited</td></tr>
  <tr><td>SQL Agent jobs</td><td>Often absent</td><td>Present but scaled down</td><td>Full schedule, monitored</td></tr>
  <tr><td>Availability expectation</td><td>Best effort</td><td>Business hours</td><td>SLA, monitored, on-call</td></tr>
  <tr><td>Configuration</td><td>Developer defaults</td><td>Approximating production</td><td>Documented baseline, changed only via process</td></tr>
</table>
<p>The row that catches most teams out is <strong>configuration</strong>: compatibility level, max degree of parallelism, memory settings, trace flags, collation, time zone, and Agent jobs. A query that behaves beautifully on a development instance with default settings can produce a different plan on production — same script, different engine behaviour.</p>
`
    },
    {
      h: "Moving changes between environments",
      html: `
<p>Promotion is a mechanical step, and it should look mechanical — one reviewed command, repeatable across environments:</p>
<pre><code class="language-powershell"># Promote the release script to UAT — one reviewed command, no manual clicking
Invoke-Sqlcmd -ServerInstance 'UAT-SQL01' -Database 'OrdersDb' -InputFile '.\\release\\v2.3_orders.sql' -AbortOnError -Verbose</code></pre>
<p>Two properties make that command safe: <code>-AbortOnError</code> stops the run at the first failing batch, and the file is the same one already applied in test — under version control, with its own history. Teams commonly promote with one of three mechanisms:</p>
<ul>
  <li><strong>Ordered migration scripts</strong> (Flyway, DbUp, or hand-rolled) — each change is a numbered file applied in sequence; simple, diffable, and auditable</li>
  <li><strong>DACPAC / state-based deployment</strong> — compare the desired schema to the live one and generate the delta; powerful, but review the generated script before production</li>
  <li><strong>Hand-applied scripts</strong> — acceptable only in the smallest environments, and the fastest route to drift between test and production</li>
</ul>
<p>Whatever the mechanism, the DBA verifies after promotion — object versions, row counts on key tables, job definitions, and a smoke-test query:</p>
<pre><code class="language-sql">-- Confirm the deployed schema version in the target environment
SELECT schema_version, applied_by, applied_on
FROM   dbo.SchemaVersion
ORDER  BY applied_on DESC;</code></pre>
`
    },
    {
      h: "Environment pitfalls",
      html: `
<p>Almost every “it worked in test” incident traces back to an environment problem rather than a code problem. The recurring ones:</p>
<ul>
  <li><strong>Development pointed at production data</strong> — the fastest way to leak personal data and to let an experimental script touch live rows. Test against masked copies instead</li>
  <li><strong>Stale test data</strong> — a UAT environment refreshed once six months ago cannot reveal growth-related failures; refresh it on a schedule</li>
  <li><strong>Missing non-schema assets</strong> — logins, Agent jobs, stored procedure permissions, linked servers, and Service Broker objects are not in the table schema and are routinely forgotten</li>
  <li><strong>Configuration drift</strong> — an environment that matched production once but has diverged silently since; baseline it and compare it regularly</li>
  <li><strong>Hot-fixes applied directly in production</strong> — the change never exists in the artefact, so the next promotion silently reverts it</li>
  <li><strong>Environments that are too small</strong> — performance tested on 1 GB of data, deployed against 400 GB; test at production-like volume or accept that performance is untested</li>
</ul>
<p>The DBA's guard against all five is a short environment standard, written down: what each environment is for, how data gets there, who may change what, and the promotion command itself. Environments drift by default; only a documented standard keeps them comparable.</p>
`
    }
  ],

  scenario: {
    title: "The release that worked in UAT and stalled in production",
    html: `
<p>Thursday, 6:00 PM release window. A new version of the billing application deploys cleanly to UAT the previous week and passes business sign-off. At 6:14 PM in production the deploy stalls: a CREATE INDEX in the migration script is blocked, and behind it every billing write queues. The DBA traces the blocking to a stale statistics-update job that had been disabled in production “temporarily” during last month's patching — a difference that existed in no environment.</p>
<p>With fifteen minutes of user impact already recorded, the DBA made the call: kill the blocked deploy session, roll back the partial batch (the script was transactional up to that point — a habit that saved the evening), re-enable the statistics job, and complete the deployment thirty minutes later in a quieter window. Billing caught up without data loss.</p>
<p>The prevention was structural rather than technical: an environment parity checklist that includes Agent jobs, proxies, and configuration compared against a documented baseline, plus a rule that <strong>no production configuration may change outside the same release process as schema changes</strong>. The code was never the difference — the undocumented environment was.</p>
`
  },

  interview: [
    {
      q: "Why should the same artefact be promoted through every environment?",
      a: "Because testing proves the artefact, not the process of rebuilding it. If the script is regenerated or edited at each stage, production receives something that was never tested — and every difference between environments becomes an untested variable."
    },
    {
      q: "Besides the schema, what usually differs between test and production?",
      a: "SQL Agent jobs and their accounts, logins and permissions, configuration such as compatibility level, max DOP and memory settings, data volume and distribution, statistics freshness, and external dependencies like linked servers or mail profiles. Configuration differences are the most common cause of 'it worked in test'."
    },
    {
      q: "How do you stop development from using production data?",
      a: "Technically: separate accounts with no cross-environment access, and periodic audits of who connects where. Practically: provide a good masked, refreshed test dataset so there is no reason to reach for production — people bypass the rule because the sanctioned path is slow, and the fix is making the sanctioned path fast."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “An _____ is an isolated instance of the system — its own databases, configuration, and (usually) its own data — with a specific purpose.”",
      "options": [
        "Production",
        "realism",
        "environment"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “An environment is an isolated instance of the system — its own databases, configuration, and (usually) its own data — with a specific purpose. The reason for separation is simple: change needs somewhere safe to be wrong. Every environment answers a different question:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The promotion path”?",
      "options": [
        "Least privilege, audited",
        "Code and schema move forward through the same path every time, ideally as one immutable artefact built once and promoted — never rebuilt per environment:",
        "Reviewed, windowed, rollback planned"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Code and schema move forward through the same path every time, ideally as one immutable artefact built once and promoted — never rebuilt per environment:”"
    },
    {
      "question": "Complete the lesson statement: “Almost everything else will differ — and the DBA's job is knowing _____ differs, because undocumented differences are where production incidents hide:”",
      "options": [
        "what",
        "realism",
        "freedom"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The schema should be identical by the time a release reaches UAT. Almost everything else will differ — and the DBA's job is knowing what differs, because undocumented differences are where production incidents hide:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Moving changes between environments”?",
      "options": [
        "Reviewed, windowed, rollback planned",
        "Least privilege, audited",
        "Promotion is a mechanical step, and it should look mechanical — one reviewed command, repeatable across environments:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Promotion is a mechanical step, and it should look mechanical — one reviewed command, repeatable across environments:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Environment pitfalls”?",
      "options": [
        "Full schedule, monitored",
        "Almost every “it worked in test” incident traces back to an environment problem rather than a code problem.",
        "Least privilege, audited"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Almost every “it worked in test” incident traces back to an environment problem rather than a code problem. The recurring ones:”"
    },
    {
      "question": "Complete the lesson statement: “Each step forward increases _____ (data volume, configuration parity, real users) and decreases freedom (approval, windows, rollback plans).”",
      "options": [
        "realism",
        "configuration",
        "Ordered migration scripts"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Each step forward increases realism (data volume, configuration parity, real users) and decreases freedom (approval, windows, rollback plans). Collapsing the environments — pointing development at production data, or skipping testing “because the change is small” — buys speed once and pays for it every release afterwards.”"
    },
    {
      "question": "Complete the lesson statement: “The rule that makes this work: _____.”",
      "options": [
        "Ordered migration scripts",
        "DACPAC / state-based deployment",
        "the same artefact is promoted, not rebuilt"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The rule that makes this work: the same artefact is promoted, not rebuilt. If the deployment script is regenerated by hand at each stage, testing proved something different from what production receives.”"
    },
    {
      "question": "Complete the lesson statement: “The row that catches most teams out is _____: compatibility level, max degree of parallelism, memory settings, trace flags, collation, time zone, and Agent jobs.”",
      "options": [
        "Hand-applied scripts",
        "configuration",
        "DACPAC / state-based deployment"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The row that catches most teams out is configuration: compatibility level, max degree of parallelism, memory settings, trace flags, collation, time zone, and Agent jobs. A query that behaves beautifully on a development instance with default settings can produce a different plan on production — same script, different engine behaviour.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Moving changes between environments”?",
      "options": [
        "Two properties make that command safe: -AbortOnError stops the run at the first failing batch, and the file is the same one already applied in test — under version control, with…",
        "Almost every “it worked in test” incident traces back to an environment problem rather than a code problem.",
        "The DBA's guard against all five is a short environment standard, written down: what each environment is for, how data gets there, who may change what, and the promotion command…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Two properties make that command safe: -AbortOnError stops the run at the first failing batch, and the file is the same one already applied in test — under version control, with its own history. Teams commonly promote with one of three mechanisms:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Environment pitfalls”?",
      "options": [
        "Two properties make that command safe: -AbortOnError stops the run at the first failing batch, and the file is the same one already applied in test — under version control, with…",
        "Whatever the mechanism, the DBA verifies after promotion — object versions, row counts on key tables, job definitions, and a smoke-test query:",
        "The DBA's guard against all five is a short environment standard, written down: what each environment is for, how data gets there, who may change what, and the promotion command…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The DBA's guard against all five is a short environment standard, written down: what each environment is for, how data gets there, who may change what, and the promotion command itself. Environments drift by default; only a documented standard keeps them comparable.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “An _____ is an isolated instance of the system — its own databases, configuration, and (usually) its own data — with a specific purpose.”",
      "options": [
        "Production",
        "realism",
        "environment"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “An environment is an isolated instance of the system — its own databases, configuration, and (usually) its own data — with a specific purpose. The reason for separation is simple: change needs somewhere safe to be wrong. Every environment answers a different question:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The promotion path”?",
      "options": [
        "Least privilege, audited",
        "Code and schema move forward through the same path every time, ideally as one immutable artefact built once and promoted — never rebuilt per environment:",
        "Reviewed, windowed, rollback planned"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Code and schema move forward through the same path every time, ideally as one immutable artefact built once and promoted — never rebuilt per environment:”"
    },
    {
      "question": "Complete the lesson statement: “Almost everything else will differ — and the DBA's job is knowing _____ differs, because undocumented differences are where production incidents hide:”",
      "options": [
        "what",
        "realism",
        "freedom"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The schema should be identical by the time a release reaches UAT. Almost everything else will differ — and the DBA's job is knowing what differs, because undocumented differences are where production incidents hide:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Moving changes between environments”?",
      "options": [
        "Reviewed, windowed, rollback planned",
        "Least privilege, audited",
        "Promotion is a mechanical step, and it should look mechanical — one reviewed command, repeatable across environments:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Promotion is a mechanical step, and it should look mechanical — one reviewed command, repeatable across environments:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Environment pitfalls”?",
      "options": [
        "Full schedule, monitored",
        "Almost every “it worked in test” incident traces back to an environment problem rather than a code problem.",
        "Least privilege, audited"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Almost every “it worked in test” incident traces back to an environment problem rather than a code problem. The recurring ones:”"
    },
    {
      "question": "Complete the lesson statement: “Each step forward increases _____ (data volume, configuration parity, real users) and decreases freedom (approval, windows, rollback plans).”",
      "options": [
        "realism",
        "configuration",
        "Ordered migration scripts"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Each step forward increases realism (data volume, configuration parity, real users) and decreases freedom (approval, windows, rollback plans). Collapsing the environments — pointing development at production data, or skipping testing “because the change is small” — buys speed once and pays for it every release afterwards.”"
    },
    {
      "question": "Complete the lesson statement: “The rule that makes this work: _____.”",
      "options": [
        "Ordered migration scripts",
        "DACPAC / state-based deployment",
        "the same artefact is promoted, not rebuilt"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The rule that makes this work: the same artefact is promoted, not rebuilt. If the deployment script is regenerated by hand at each stage, testing proved something different from what production receives.”"
    },
    {
      "question": "Complete the lesson statement: “The row that catches most teams out is _____: compatibility level, max degree of parallelism, memory settings, trace flags, collation, time zone, and Agent jobs.”",
      "options": [
        "Hand-applied scripts",
        "configuration",
        "DACPAC / state-based deployment"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The row that catches most teams out is configuration: compatibility level, max degree of parallelism, memory settings, trace flags, collation, time zone, and Agent jobs. A query that behaves beautifully on a development instance with default settings can produce a different plan on production — same script, different engine behaviour.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Moving changes between environments”?",
      "options": [
        "Two properties make that command safe: -AbortOnError stops the run at the first failing batch, and the file is the same one already applied in test — under version control, with…",
        "Almost every “it worked in test” incident traces back to an environment problem rather than a code problem.",
        "The DBA's guard against all five is a short environment standard, written down: what each environment is for, how data gets there, who may change what, and the promotion command…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Two properties make that command safe: -AbortOnError stops the run at the first failing batch, and the file is the same one already applied in test — under version control, with its own history. Teams commonly promote with one of three mechanisms:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Environment pitfalls”?",
      "options": [
        "Two properties make that command safe: -AbortOnError stops the run at the first failing batch, and the file is the same one already applied in test — under version control, with…",
        "Whatever the mechanism, the DBA verifies after promotion — object versions, row counts on key tables, job definitions, and a smoke-test query:",
        "The DBA's guard against all five is a short environment standard, written down: what each environment is for, how data gets there, who may change what, and the promotion command…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The DBA's guard against all five is a short environment standard, written down: what each environment is for, how data gets there, who may change what, and the promotion command itself. Environments drift by default; only a documented standard keeps them comparable.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “An _____ is an isolated instance of the system — its own databases, configuration, and (usually) its own data — with a specific purpose.”",
      "options": [
        "Production",
        "realism",
        "environment"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “An environment is an isolated instance of the system — its own databases, configuration, and (usually) its own data — with a specific purpose. The reason for separation is simple: change needs somewhere safe to be wrong. Every environment answers a different question:”"
    },
    {
      "question": "Which fact is covered in the lesson section “The promotion path”?",
      "options": [
        "Least privilege, audited",
        "Code and schema move forward through the same path every time, ideally as one immutable artefact built once and promoted — never rebuilt per environment:",
        "Reviewed, windowed, rollback planned"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Code and schema move forward through the same path every time, ideally as one immutable artefact built once and promoted — never rebuilt per environment:”"
    },
    {
      "question": "Complete the lesson statement: “Almost everything else will differ — and the DBA's job is knowing _____ differs, because undocumented differences are where production incidents hide:”",
      "options": [
        "what",
        "realism",
        "freedom"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “The schema should be identical by the time a release reaches UAT. Almost everything else will differ — and the DBA's job is knowing what differs, because undocumented differences are where production incidents hide:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Moving changes between environments”?",
      "options": [
        "Reviewed, windowed, rollback planned",
        "Least privilege, audited",
        "Promotion is a mechanical step, and it should look mechanical — one reviewed command, repeatable across environments:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Promotion is a mechanical step, and it should look mechanical — one reviewed command, repeatable across environments:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Environment pitfalls”?",
      "options": [
        "Full schedule, monitored",
        "Almost every “it worked in test” incident traces back to an environment problem rather than a code problem.",
        "Least privilege, audited"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Almost every “it worked in test” incident traces back to an environment problem rather than a code problem. The recurring ones:”"
    },
    {
      "question": "Complete the lesson statement: “Each step forward increases _____ (data volume, configuration parity, real users) and decreases freedom (approval, windows, rollback plans).”",
      "options": [
        "realism",
        "configuration",
        "Ordered migration scripts"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “Each step forward increases realism (data volume, configuration parity, real users) and decreases freedom (approval, windows, rollback plans). Collapsing the environments — pointing development at production data, or skipping testing “because the change is small” — buys speed once and pays for it every release afterwards.”"
    },
    {
      "question": "Complete the lesson statement: “The rule that makes this work: _____.”",
      "options": [
        "Ordered migration scripts",
        "DACPAC / state-based deployment",
        "the same artefact is promoted, not rebuilt"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The rule that makes this work: the same artefact is promoted, not rebuilt. If the deployment script is regenerated by hand at each stage, testing proved something different from what production receives.”"
    },
    {
      "question": "Complete the lesson statement: “The row that catches most teams out is _____: compatibility level, max degree of parallelism, memory settings, trace flags, collation, time zone, and Agent jobs.”",
      "options": [
        "Hand-applied scripts",
        "configuration",
        "DACPAC / state-based deployment"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “The row that catches most teams out is configuration: compatibility level, max degree of parallelism, memory settings, trace flags, collation, time zone, and Agent jobs. A query that behaves beautifully on a development instance with default settings can produce a different plan on production — same script, different engine behaviour.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Moving changes between environments”?",
      "options": [
        "Two properties make that command safe: -AbortOnError stops the run at the first failing batch, and the file is the same one already applied in test — under version control, with…",
        "Almost every “it worked in test” incident traces back to an environment problem rather than a code problem.",
        "The DBA's guard against all five is a short environment standard, written down: what each environment is for, how data gets there, who may change what, and the promotion command…"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Two properties make that command safe: -AbortOnError stops the run at the first failing batch, and the file is the same one already applied in test — under version control, with its own history. Teams commonly promote with one of three mechanisms:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Environment pitfalls”?",
      "options": [
        "Two properties make that command safe: -AbortOnError stops the run at the first failing batch, and the file is the same one already applied in test — under version control, with…",
        "Whatever the mechanism, the DBA verifies after promotion — object versions, row counts on key tables, job definitions, and a smoke-test query:",
        "The DBA's guard against all five is a short environment standard, written down: what each environment is for, how data gets there, who may change what, and the promotion command…"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The DBA's guard against all five is a short environment standard, written down: what each environment is for, how data gets there, who may change what, and the promotion command itself. Environments drift by default; only a documented standard keeps them comparable.”"
    }
  ],
  takeaways: [
    "Environments trade realism for safety: each stage forward adds realism and removes freedom",
    "Promote one immutable artefact — migration scripts or DACPAC — never a hand-edited rebuild",
    "Schema parity is not environment parity: Agent jobs, logins, and configuration drift too",
    "Promotion should be one reviewed, abortable, repeatable command with a verification step",
    "Document the environment standard — environments drift by default"
  ]
};
