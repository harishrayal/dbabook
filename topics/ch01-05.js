/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch01-05.html */

window.TOPIC = {
  id: "ch01-05",
  title: "Difference Between a Developer and a DBA",

  lead: "Developers and DBAs share the same database and often the same SQL — but they optimise for different outcomes, which is why the healthiest teams make the boundary explicit rather than assumed.",

  objectives: [
    "Compare developer and DBA responsibilities across the data lifecycle",
    "Identify where ownership overlaps and who has the final say",
    "Recognise the failure modes each role is prone to",
    "Apply practices that make the working relationship effective"
  ],

  sections: [
    {
      h: "Two roles, one database",
      html: `
<p>A <strong>developer</strong> owns the application logic that reads and writes data: the queries, the ORM mappings, the transactions, the feature behaviour. A <strong>DBA</strong> owns the platform those operations run on: the instance, the databases, the backups, the security, the performance envelope, and the change process into production.</p>
<p>The overlap is real — both write SQL, both care about indexes, both get paged when the database is slow. The distinction is best expressed as a boundary of <strong>accountability</strong>:</p>
<ul>
  <li>The developer answers: “does my feature behave correctly and efficiently?”</li>
  <li>The DBA answers: “is the database available, secure, recoverable, and fast <em>for everyone</em>?”</li>
</ul>
<p>That last word matters. A query that is fast for one application can starve another; a grant that unblocks one developer can expose every table. The DBA must reason about the whole system while the developer reasons about their part of it — and neither perspective alone is sufficient.</p>
<blockquote>Developers optimise the query in front of them. DBAs optimise the database behind every query.</blockquote>
`
    },
    {
      h: "Where responsibilities overlap",
      html: `
<p>Most friction happens in the middle of this table — the activities neither role fully owns by default. Healthy teams assign each one explicitly:</p>
<table>
  <tr><th>Activity</th><th>Developer</th><th>DBA</th><th>Final say</th></tr>
  <tr><td>Application logic and transactions</td><td><strong>Owns</strong></td><td>Advises</td><td>Developer</td></tr>
  <tr><td>Query tuning within the app</td><td><strong>Owns</strong></td><td>Provides plans and guidance</td><td>Developer</td></tr>
  <tr><td>Schema design</td><td>Proposes</td><td><strong>Reviews and approves</strong></td><td>DBA (production impact)</td></tr>
  <tr><td>Indexes</td><td>Proposes from workload</td><td><strong>Approves and maintains</strong></td><td>DBA (shared with dev)</td></tr>
  <tr><td>Deployment to production</td><td>Builds the artefact</td><td><strong>Applies in the window</strong></td><td>Change process</td></tr>
  <tr><td>Backup and recovery</td><td>—</td><td><strong>Owns</strong></td><td>DBA</td></tr>
  <tr><td>Access and permissions</td><td>Requests</td><td><strong>Grants and audits</strong></td><td>DBA</td></tr>
  <tr><td>Instance configuration</td><td>—</td><td><strong>Owns</strong></td><td>DBA</td></tr>
</table>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Developer and DBA ownership with a shared middle">
    <defs>
      <marker id="own-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="20" y="40" width="215" height="250" rx="12" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="127" y="72" text-anchor="middle" fill="var(--text)" font-size="16" font-weight="700" font-family="Segoe UI, sans-serif">Developer owns</text>
    <text x="127" y="112" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-family="Segoe UI, sans-serif">Application logic</text>
    <text x="127" y="136" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-family="Segoe UI, sans-serif">Transactions</text>
    <text x="127" y="160" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-family="Segoe UI, sans-serif">Query behaviour</text>
    <text x="127" y="184" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-family="Segoe UI, sans-serif">Feature correctness</text>
    <text x="127" y="208" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-family="Segoe UI, sans-serif">Test coverage</text>
    <text x="127" y="262" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-style="italic" font-family="Segoe UI, sans-serif">clock: the release</text>

    <rect x="525" y="40" width="215" height="250" rx="12" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="632" y="72" text-anchor="middle" fill="var(--text)" font-size="16" font-weight="700" font-family="Segoe UI, sans-serif">DBA owns</text>
    <text x="632" y="112" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-family="Segoe UI, sans-serif">Availability &amp; recovery</text>
    <text x="632" y="136" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-family="Segoe UI, sans-serif">Backups &amp; restore</text>
    <text x="632" y="160" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-family="Segoe UI, sans-serif">Security &amp; auditing</text>
    <text x="632" y="184" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-family="Segoe UI, sans-serif">Instance configuration</text>
    <text x="632" y="208" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-family="Segoe UI, sans-serif">Capacity &amp; patching</text>
    <text x="632" y="262" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-style="italic" font-family="Segoe UI, sans-serif">clock: production, always</text>

    <rect x="275" y="95" width="210" height="145" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="125" text-anchor="middle" fill="var(--accent-strong)" font-size="15" font-weight="700" font-family="Segoe UI, sans-serif">Shared ownership</text>
    <text x="380" y="158" text-anchor="middle" fill="var(--text)" font-size="12.5" font-family="Segoe UI, sans-serif">Schema design</text>
    <text x="380" y="182" text-anchor="middle" fill="var(--text)" font-size="12.5" font-family="Segoe UI, sans-serif">Indexing strategy</text>
    <text x="380" y="206" text-anchor="middle" fill="var(--text)" font-size="12.5" font-family="Segoe UI, sans-serif">Performance tuning</text>
    <text x="380" y="230" text-anchor="middle" fill="var(--text)" font-size="12.5" font-family="Segoe UI, sans-serif">Deployments</text>

    <line x1="235" y1="167" x2="273" y2="167" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#own-arrow)"/>
    <line x1="525" y1="167" x2="487" y2="167" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#own-arrow)"/>

    <text x="380" y="322" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">The middle is where collaboration is designed — or where blame accumulates.</text>
  </svg>
  <div class="figcaption">Figure 1 — Distinct ownership with an explicit shared zone in the middle.</div>
</div>
`
    },
    {
      h: "Different incentives, different failure modes",
      html: `
<p>Each role's greatest strength has a matching weakness under pressure:</p>
<table>
  <tr><th></th><th>Strength</th><th>Failure mode under pressure</th></tr>
  <tr><td><strong>Developer</strong></td><td>Ships features fast, iterates with the business</td><td>ORM default plans, missing predicates, N+1 queries, schema shortcuts that only bite at scale</td></tr>
  <tr><td><strong>DBA</strong></td><td>Protects stability, refuses risky change</td><td>Change aversion, gatekeeping without alternatives, “no” without a “here's how”</td></tr>
</table>
<p>The developer's failure mode is usually invisible until production load arrives; the DBA's failure mode is visible immediately but can slow the whole organisation. Both are rational responses to the wrong incentive — which is why the fix is structural: shared goals (a performance budget, a definition of done that includes query review) rather than asking either side to be more generous.</p>
<p>A useful rule of thumb for the boundary: <strong>the developer may optimise anything they can measure; the DBA may veto anything that threatens the platform</strong>. Vetoes require evidence and an alternative, or they erode into politics.</p>
`
    },
    {
      h: "Evidence, not opinion",
      html: `
<p>The most productive conversations between the two roles start with a plan rather than a complaint. When a developer says “your database is slow”, the DBA's first contribution is the data that turns the complaint into a work item:</p>
<pre><code class="language-sql">-- Hand this to a developer: high-impact missing indexes, ranked
SELECT d.statement                                  AS table_name,
       d.equality_columns,
       d.inequality_columns,
       s.user_seeks + s.user_scans                  AS executions,
       CAST(s.avg_total_user_cost * s.avg_user_impact AS decimal(10,1)) AS impact_score
FROM   sys.dm_db_missing_index_groups AS g
JOIN   sys.dm_db_missing_index_group_stats AS s
       ON s.group_handle = g.index_group_handle
JOIN   sys.dm_db_missing_index_details AS d
       ON d.index_handle = g.index_handle
ORDER  BY impact_score DESC;</code></pre>
<p>Notice what this produces: a ranked, evidence-based conversation. The developer sees the table and the columns the engine actually wanted; the DBA sees the estimated impact before writing a DDL statement. The same query also illustrates the limit — missing-index DMVs are a hint, not a command, and a DBA still weighs write overhead, duplication, and maintenance cost before creating anything.</p>
<p>Practical habits that keep the relationship healthy:</p>
<ul>
  <li><strong>Review schema changes together</strong>, before coding against them — not after the tables exist</li>
  <li><strong>Share the dashboards</strong> — developers with visibility into waits and plans self-correct faster than any review process</li>
  <li><strong>Define “done” together</strong> — a feature is not done until its queries are reviewed against realistic data volumes</li>
</ul>
`
    },
    {
      h: "When the relationship breaks down",
      html: `
<p>Warning signs the boundary has failed: developers get production access “just to check”; production changes appear that no one reviewed; tickets turn into arguments about whose fault the last outage was; the DBA becomes a rubber stamp or a roadblock instead of a reviewer.</p>
<p>Recovery is mostly procedural:</p>
<ol>
  <li><strong>Restore the change gate</strong> — every production change reviewed and applied through one path, regardless of who requests it</li>
  <li><strong>Move the conversation earlier</strong> — DBA input at design time costs minutes; input at incident time costs hours</li>
  <li><strong>Make the trade-offs visible</strong> — publish the performance budget, the release calendar, and the recovery objectives so arguments are about priorities, not personalities</li>
  <li><strong>Give developers self-service where it is safe</strong> — a documented way to request indexes, refresh test data, or read plans removes the incentive to bypass the DBA</li>
</ol>
<p>Neither role is senior to the other. They hold different parts of the same risk, and the organisation only gets the benefit when the hand-off between those parts is deliberate.</p>
`
    }
  ],

  scenario: {
    title: "The blameless post-mortem that found no owner",
    html: `
<p>Monday, 10:05 AM: the customer portal slows to a crawl for two hours. The application team says the queries are unchanged; the DBA says the data grew. The post-mortem's first hour produced no owner at all — until someone pulled the plan cache and found the portal's main query had changed plans three weeks earlier, after a statistics update coincided with an index the DBA had removed during a clean-up “because nothing was using it”. Both changes were individually reasonable. Neither role had seen the other's.</p>
<p>Resolution was immediate: the index was recreated and the plan regression disappeared within minutes. The prevention was the interesting part. The team defined ownership explicitly: <strong>index removal requires checking dependent query patterns across applications, and the DBA shares an index-usage report with the development team every month</strong>. They also added a joint review for any change to a table used by more than one application.</p>
<p>The outage was not caused by a bad index or a bad statistic. It was caused by an unowned interface between two roles — and interfaces, not individuals, are what process fixes.</p>
`
  },

  interview: [
    {
      q: "Who is responsible for query performance — the developer or the DBA?",
      a: "Jointly, with distinct parts: the developer owns the query's logic, predicates, and shape; the DBA owns the platform-level inputs — indexes, statistics, configuration, and plan stability. In practice the DBA supplies evidence (plans, waits, missing-index impact) and the developer applies the fix, because the change that must not regress is in application code."
    },
    {
      q: "A developer asks you to create every missing index on a busy table. What do you say?",
      a: "Start from workload evidence, not the DMV list. Missing-index suggestions ignore write cost, existing indexes, and duplication — I would rank them by impact, check what the table already has, evaluate the insert/update penalty on a write-heavy table, then create the one or two that pay for themselves and show the developer how to verify the improvement."
    },
    {
      q: "How do you work with a developer who resists database review?",
      a: "Move the review earlier and make it cheap — a five-minute design conversation instead of a production incident — and give them the evidence for why it exists: the last plan regression, the lock contention, the outage timeline. Also remove the reason for resistance: if review feels like a gate with no answer, provide a fast path for low-risk changes."
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ owns the application logic that reads and writes data: the queries, the ORM mappings, the transactions, the feature behaviour.”",
      "options": [
        "Applies in the window",
        "developer",
        "Approves and maintains"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A developer owns the application logic that reads and writes data: the queries, the ORM mappings, the transactions, the feature behaviour. A DBA owns the platform those operations run on: the instance, the databases, the backups, the security, the performance envelope, and the change process into production.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where responsibilities overlap”?",
      "options": [
        "Most friction happens in the middle of this table — the activities neither role fully owns by default.",
        "ORM default plans, missing predicates, N+1 queries, schema shortcuts that only bite at scale",
        "Change aversion, gatekeeping without alternatives, “no” without a “here's how”"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Most friction happens in the middle of this table — the activities neither role fully owns by default. Healthy teams assign each one explicitly:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Different incentives, different failure modes”?",
      "options": [
        "DBA",
        "The most productive conversations between the two roles start with a plan rather than a complaint.",
        "Each role's greatest strength has a matching weakness under pressure:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Each role's greatest strength has a matching weakness under pressure:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Evidence, not opinion”?",
      "options": [
        "The developer's failure mode is usually invisible until production load arrives; the DBA's failure mode is visible immediately but can slow the whole organisation.",
        "The most productive conversations between the two roles start with a plan rather than a complaint.",
        "Each role's greatest strength has a matching weakness under pressure:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The most productive conversations between the two roles start with a plan rather than a complaint. When a developer says “your database is slow”, the DBA's first contribution is the data that turns the complaint into a work item:”"
    },
    {
      "question": "Which fact is covered in the lesson section “When the relationship breaks down”?",
      "options": [
        "Warning signs the boundary has failed: developers get production access “just to check”; production changes appear that no one reviewed; tickets turn into arguments about whose…",
        "The developer's failure mode is usually invisible until production load arrives; the DBA's failure mode is visible immediately but can slow the whole organisation.",
        "A useful rule of thumb for the boundary: the developer may optimise anything they can measure; the DBA may veto anything that threatens the platform."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Warning signs the boundary has failed: developers get production access “just to check”; production changes appear that no one reviewed; tickets turn into arguments about whose fault the last outage was; the DBA becomes a rubber stamp or a roadblock instead of a reviewer.”"
    },
    {
      "question": "Complete the lesson statement: “The distinction is best expressed as a boundary of _____:”",
      "options": [
        "Define “done” together",
        "Restore the change gate",
        "accountability"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The overlap is real — both write SQL, both care about indexes, both get paged when the database is slow. The distinction is best expressed as a boundary of accountability:”"
    },
    {
      "question": "In the “Where responsibilities overlap” table, what is listed for “Application logic and transactions” under “Final say”?",
      "options": [
        "The most productive conversations between the two roles start with a plan rather than a complaint.",
        "Developer",
        "Change aversion, gatekeeping without alternatives, “no” without a “here's how”"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Application logic and transactions” as “Developer”."
    },
    {
      "question": "Which fact is covered in the lesson section “Different incentives, different failure modes”?",
      "options": [
        "The developer's failure mode is usually invisible until production load arrives; the DBA's failure mode is visible immediately but can slow the whole organisation.",
        "Neither role is senior to the other.",
        "Each role's greatest strength has a matching weakness under pressure:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The developer's failure mode is usually invisible until production load arrives; the DBA's failure mode is visible immediately but can slow the whole organisation. Both are rational responses to the wrong incentive — which is why the fix is structural: shared goals (a performance budget, a definition of done that includes query review) rather than asking either side to be more generous.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Evidence, not opinion”?",
      "options": [
        "Warning signs the boundary has failed: developers get production access “just to check”; production changes appear that no one reviewed; tickets turn into arguments about whose…",
        "Neither role is senior to the other.",
        "Notice what this produces: a ranked, evidence-based conversation."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Notice what this produces: a ranked, evidence-based conversation. The developer sees the table and the columns the engine actually wanted; the DBA sees the estimated impact before writing a DDL statement. The same query also illustrates the limit — missing-index DMVs are a hint, not a command, and a DBA still weighs write overhead, duplication, and maintenance cost before creating anything.”"
    },
    {
      "question": "Which fact is covered in the lesson section “When the relationship breaks down”?",
      "options": [
        "Practical habits that keep the relationship healthy:",
        "Neither role is senior to the other.",
        "Notice what this produces: a ranked, evidence-based conversation."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Neither role is senior to the other. They hold different parts of the same risk, and the organisation only gets the benefit when the hand-off between those parts is deliberate.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ owns the application logic that reads and writes data: the queries, the ORM mappings, the transactions, the feature behaviour.”",
      "options": [
        "Applies in the window",
        "developer",
        "Approves and maintains"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A developer owns the application logic that reads and writes data: the queries, the ORM mappings, the transactions, the feature behaviour. A DBA owns the platform those operations run on: the instance, the databases, the backups, the security, the performance envelope, and the change process into production.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where responsibilities overlap”?",
      "options": [
        "Most friction happens in the middle of this table — the activities neither role fully owns by default.",
        "ORM default plans, missing predicates, N+1 queries, schema shortcuts that only bite at scale",
        "Change aversion, gatekeeping without alternatives, “no” without a “here's how”"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Most friction happens in the middle of this table — the activities neither role fully owns by default. Healthy teams assign each one explicitly:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Different incentives, different failure modes”?",
      "options": [
        "DBA",
        "The most productive conversations between the two roles start with a plan rather than a complaint.",
        "Each role's greatest strength has a matching weakness under pressure:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Each role's greatest strength has a matching weakness under pressure:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Evidence, not opinion”?",
      "options": [
        "The developer's failure mode is usually invisible until production load arrives; the DBA's failure mode is visible immediately but can slow the whole organisation.",
        "The most productive conversations between the two roles start with a plan rather than a complaint.",
        "Each role's greatest strength has a matching weakness under pressure:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The most productive conversations between the two roles start with a plan rather than a complaint. When a developer says “your database is slow”, the DBA's first contribution is the data that turns the complaint into a work item:”"
    },
    {
      "question": "Which fact is covered in the lesson section “When the relationship breaks down”?",
      "options": [
        "Warning signs the boundary has failed: developers get production access “just to check”; production changes appear that no one reviewed; tickets turn into arguments about whose…",
        "The developer's failure mode is usually invisible until production load arrives; the DBA's failure mode is visible immediately but can slow the whole organisation.",
        "A useful rule of thumb for the boundary: the developer may optimise anything they can measure; the DBA may veto anything that threatens the platform."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Warning signs the boundary has failed: developers get production access “just to check”; production changes appear that no one reviewed; tickets turn into arguments about whose fault the last outage was; the DBA becomes a rubber stamp or a roadblock instead of a reviewer.”"
    },
    {
      "question": "Complete the lesson statement: “The distinction is best expressed as a boundary of _____:”",
      "options": [
        "Define “done” together",
        "Restore the change gate",
        "accountability"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The overlap is real — both write SQL, both care about indexes, both get paged when the database is slow. The distinction is best expressed as a boundary of accountability:”"
    },
    {
      "question": "In the “Where responsibilities overlap” table, what is listed for “Application logic and transactions” under “Final say”?",
      "options": [
        "The most productive conversations between the two roles start with a plan rather than a complaint.",
        "Developer",
        "Change aversion, gatekeeping without alternatives, “no” without a “here's how”"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Application logic and transactions” as “Developer”."
    },
    {
      "question": "Which fact is covered in the lesson section “Different incentives, different failure modes”?",
      "options": [
        "The developer's failure mode is usually invisible until production load arrives; the DBA's failure mode is visible immediately but can slow the whole organisation.",
        "Neither role is senior to the other.",
        "Each role's greatest strength has a matching weakness under pressure:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The developer's failure mode is usually invisible until production load arrives; the DBA's failure mode is visible immediately but can slow the whole organisation. Both are rational responses to the wrong incentive — which is why the fix is structural: shared goals (a performance budget, a definition of done that includes query review) rather than asking either side to be more generous.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Evidence, not opinion”?",
      "options": [
        "Warning signs the boundary has failed: developers get production access “just to check”; production changes appear that no one reviewed; tickets turn into arguments about whose…",
        "Neither role is senior to the other.",
        "Notice what this produces: a ranked, evidence-based conversation."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Notice what this produces: a ranked, evidence-based conversation. The developer sees the table and the columns the engine actually wanted; the DBA sees the estimated impact before writing a DDL statement. The same query also illustrates the limit — missing-index DMVs are a hint, not a command, and a DBA still weighs write overhead, duplication, and maintenance cost before creating anything.”"
    },
    {
      "question": "Which fact is covered in the lesson section “When the relationship breaks down”?",
      "options": [
        "Practical habits that keep the relationship healthy:",
        "Neither role is senior to the other.",
        "Notice what this produces: a ranked, evidence-based conversation."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Neither role is senior to the other. They hold different parts of the same risk, and the organisation only gets the benefit when the hand-off between those parts is deliberate.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “A _____ owns the application logic that reads and writes data: the queries, the ORM mappings, the transactions, the feature behaviour.”",
      "options": [
        "Applies in the window",
        "developer",
        "Approves and maintains"
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “A developer owns the application logic that reads and writes data: the queries, the ORM mappings, the transactions, the feature behaviour. A DBA owns the platform those operations run on: the instance, the databases, the backups, the security, the performance envelope, and the change process into production.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where responsibilities overlap”?",
      "options": [
        "Most friction happens in the middle of this table — the activities neither role fully owns by default.",
        "ORM default plans, missing predicates, N+1 queries, schema shortcuts that only bite at scale",
        "Change aversion, gatekeeping without alternatives, “no” without a “here's how”"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Most friction happens in the middle of this table — the activities neither role fully owns by default. Healthy teams assign each one explicitly:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Different incentives, different failure modes”?",
      "options": [
        "DBA",
        "The most productive conversations between the two roles start with a plan rather than a complaint.",
        "Each role's greatest strength has a matching weakness under pressure:"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Each role's greatest strength has a matching weakness under pressure:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Evidence, not opinion”?",
      "options": [
        "The developer's failure mode is usually invisible until production load arrives; the DBA's failure mode is visible immediately but can slow the whole organisation.",
        "The most productive conversations between the two roles start with a plan rather than a complaint.",
        "Each role's greatest strength has a matching weakness under pressure:"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The most productive conversations between the two roles start with a plan rather than a complaint. When a developer says “your database is slow”, the DBA's first contribution is the data that turns the complaint into a work item:”"
    },
    {
      "question": "Which fact is covered in the lesson section “When the relationship breaks down”?",
      "options": [
        "Warning signs the boundary has failed: developers get production access “just to check”; production changes appear that no one reviewed; tickets turn into arguments about whose…",
        "The developer's failure mode is usually invisible until production load arrives; the DBA's failure mode is visible immediately but can slow the whole organisation.",
        "A useful rule of thumb for the boundary: the developer may optimise anything they can measure; the DBA may veto anything that threatens the platform."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Warning signs the boundary has failed: developers get production access “just to check”; production changes appear that no one reviewed; tickets turn into arguments about whose fault the last outage was; the DBA becomes a rubber stamp or a roadblock instead of a reviewer.”"
    },
    {
      "question": "Complete the lesson statement: “The distinction is best expressed as a boundary of _____:”",
      "options": [
        "Define “done” together",
        "Restore the change gate",
        "accountability"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “The overlap is real — both write SQL, both care about indexes, both get paged when the database is slow. The distinction is best expressed as a boundary of accountability:”"
    },
    {
      "question": "In the “Where responsibilities overlap” table, what is listed for “Application logic and transactions” under “Final say”?",
      "options": [
        "The most productive conversations between the two roles start with a plan rather than a complaint.",
        "Developer",
        "Change aversion, gatekeeping without alternatives, “no” without a “here's how”"
      ],
      "answerIndex": 1,
      "explanation": "The lesson’s table lists “Application logic and transactions” as “Developer”."
    },
    {
      "question": "Which fact is covered in the lesson section “Different incentives, different failure modes”?",
      "options": [
        "The developer's failure mode is usually invisible until production load arrives; the DBA's failure mode is visible immediately but can slow the whole organisation.",
        "Neither role is senior to the other.",
        "Each role's greatest strength has a matching weakness under pressure:"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The developer's failure mode is usually invisible until production load arrives; the DBA's failure mode is visible immediately but can slow the whole organisation. Both are rational responses to the wrong incentive — which is why the fix is structural: shared goals (a performance budget, a definition of done that includes query review) rather than asking either side to be more generous.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Evidence, not opinion”?",
      "options": [
        "Warning signs the boundary has failed: developers get production access “just to check”; production changes appear that no one reviewed; tickets turn into arguments about whose…",
        "Neither role is senior to the other.",
        "Notice what this produces: a ranked, evidence-based conversation."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Notice what this produces: a ranked, evidence-based conversation. The developer sees the table and the columns the engine actually wanted; the DBA sees the estimated impact before writing a DDL statement. The same query also illustrates the limit — missing-index DMVs are a hint, not a command, and a DBA still weighs write overhead, duplication, and maintenance cost before creating anything.”"
    },
    {
      "question": "Which fact is covered in the lesson section “When the relationship breaks down”?",
      "options": [
        "Practical habits that keep the relationship healthy:",
        "Neither role is senior to the other.",
        "Notice what this produces: a ranked, evidence-based conversation."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Neither role is senior to the other. They hold different parts of the same risk, and the organisation only gets the benefit when the hand-off between those parts is deliberate.”"
    }
  ],
  takeaways: [
    "Developers own application logic and query behaviour; DBAs own the platform's availability, security, and recovery",
    "The overlap — schema, indexes, tuning, deployments — must be assigned explicitly or it becomes blame territory",
    "Each role has a pressure-induced failure mode: shipping shortcuts versus change aversion",
    "Ground every performance conversation in evidence: plans, waits, and ranked impact — not opinion",
    "Move DBA involvement to design time; the earlier the boundary is negotiated, the cheaper it is"
  ]
};
