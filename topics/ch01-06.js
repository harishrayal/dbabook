/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch01-06.html */

window.TOPIC = {
  id: "ch01-06",
  title: "DBA Responsibilities During Application Deployment",

  lead: "Every application release is also a database change, and the DBA is the person who makes sure the data layer is reviewed, applied safely, and verified before the celebration starts.",

  objectives: [
    "State the DBA's role across the full release lifecycle",
    "List what a production deployment review must cover",
    "Choose between deployment mechanisms and their trade-offs",
    "Recognise deployment failure patterns before they reach production"
  ],

  sections: [
    {
      h: "The DBA's role in a release",
      html: `
<p>When an application deploys, the code ships as binaries but the <strong>data layer changes shape</strong>: tables, indexes, constraints, stored procedures, permissions, and often Agent jobs or configuration. The DBA's job is not to write the feature — it is to guarantee that the data-layer change is <em>correct, safe, and reversible</em> in production.</p>
<p>That makes the DBA a gate, but a useful one. The best deployment reviews are not interrogations; they are a short, repeatable conversation with a checklist:</p>
<ul>
  <li><strong>What is changing?</strong> — objects touched, and whether the change is additive or breaking</li>
  <li><strong>How long will it take and what will it lock?</strong> — estimated duration, lock behaviour on hot tables</li>
  <li><strong>How do we get out?</strong> — the rollback path, decided <em>before</em> the deploy starts</li>
  <li><strong>How do we know it worked?</strong> — the verification queries run immediately afterwards</li>
</ul>
<blockquote>A deployment without a rollback plan is not a deployment — it is a wager with customer data as the stake.</blockquote>
`
    },
    {
      h: "Before, during, after",
      html: `
<p>The DBA's involvement spans three distinct phases, and the value is heavily weighted to the first one:</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Deployment timeline with DBA gates">
    <defs>
      <marker id="dep-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>

    <rect x="30" y="110" width="160" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="110" y="138" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1 · Build</text>
    <text x="110" y="160" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">app team + dev DBA</text>

    <rect x="215" y="110" width="160" height="70" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
    <text x="295" y="138" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2 · DBA review</text>
    <text x="295" y="160" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">script · locks · rollback</text>

    <rect x="400" y="110" width="160" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="480" y="138" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3 · Change window</text>
    <text x="480" y="160" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">apply · watch · verify</text>

    <rect x="585" y="110" width="160" height="70" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="665" y="138" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4 · Sign off</text>
    <text x="665" y="160" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">smoke test · record</text>

    <line x1="190" y1="145" x2="213" y2="145" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#dep-arrow)"/>
    <line x1="375" y1="145" x2="398" y2="145" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#dep-arrow)"/>
    <line x1="560" y1="145" x2="583" y2="145" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#dep-arrow)"/>

    <line x1="295" y1="180" x2="295" y2="228" stroke="var(--accent)" stroke-width="2" marker-end="url(#dep-arrow)"/>
    <rect x="195" y="232" width="200" height="56" rx="10" fill="var(--amber)" opacity="0.92"/>
    <text x="295" y="256" text-anchor="middle" fill="#1f2937" font-size="13" font-weight="700" font-family="Segoe UI, sans-serif">Gate: no review, no release</text>
    <text x="295" y="276" text-anchor="middle" fill="#1f2937" font-size="11.5" font-family="Segoe UI, sans-serif">evidence required at step 2</text>

    <line x1="665" y1="180" x2="665" y2="228" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#dep-arrow)"/>
    <rect x="545" y="232" width="240" height="56" rx="10" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="665" y="256" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="600" font-family="Segoe UI, sans-serif">Verification queries</text>
    <text x="665" y="276" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">version · object existence · no blockers</text>

    <text x="380" y="330" text-anchor="middle" fill="var(--muted)" font-size="12.5" font-style="italic" font-family="Segoe UI, sans-serif">Ninety per cent of deployment risk is removed at step 2 — while the change is still only text.</text>
  </svg>
  <div class="figcaption">Figure 1 — The DBA gate sits before the change window, not inside it.</div>
</div>
<p><strong>Before:</strong> review the migration script against the release artefact, check estimated duration and lock behaviour on hot tables, confirm the rollback path, and schedule the window. <strong>During:</strong> apply with the abort-on-error setting enabled, watch blocking and job activity live, and keep the application team on the line. <strong>After:</strong> run verification queries, confirm statistics and indexes are current, and record what actually changed in the change log.</p>
`
    },
    {
      h: "What the deployment review covers",
      html: `
<p>A production deployment review is a checklist, not an art form. The items that catch real problems:</p>
<table>
  <tr><th>Check</th><th>Question being answered</th></tr>
  <tr><td>Script review</td><td>Is it the artefact tested in UAT, idempotent, and free of hand edits?</td></tr>
  <tr><td>Breaking vs additive</td><td>Can old and new application versions run against this schema during the rollout?</td></tr>
  <tr><td>Locking and duration</td><td>Which statements take schema-modification or long-held DML locks, and for how long?</td></tr>
  <tr><td>Data backfill</td><td>Does existing data need updating? Is it batched, resumable, and bounded?</td></tr>
  <tr><td>Permissions</td><td>Which logins, roles, or EXECUTE grants must change — and are they in the script?</td></tr>
  <tr><td>Agent jobs and config</td><td>New jobs, schedules, operators, or configuration that schema tooling will not carry</td></tr>
  <tr><td>Rollback</td><td>What is the exact reversal, and has it been rehearsed in test?</td></tr>
  <tr><td>Statistics and indexes</td><td>Will the deploy rebuild indexes or leave statistics stale for the new query shapes?</td></tr>
</table>
<p>Two items deserve emphasis. <strong>Additive-first design</strong> — add the new column as nullable, deploy code that reads both, backfill, then add constraints in a later release — turns most rollouts into safe, boring steps. And <strong>bounded backfills</strong>: a single UPDATE across 200 million rows inside one transaction will hold locks and fill the log; batching with a delay keeps the system serving traffic while the data catches up.</p>
`
    },
    {
      h: "Deployment mechanics",
      html: `
<p>Whatever the team uses, the DBA should be able to trigger the production step from a reviewed artefact. A typical DACPAC promotion looks like this in one command:</p>
<pre><code class="language-powershell"># Publish the reviewed DACPAC to production — one artefact, one command
Publish-SqlDacPackage -DatabaseName 'OrdersDb' -PublishXml '.\\deploy\\OrdersDb.publish.xml' -DatabaseServer 'PROD-SQL01\\INST1' -InputFile '.\\deploy\\OrdersDb.dacpac' -BlockSize 40000 -Timeout 1200</code></pre>
<p>The three main mechanisms, and where each earns its place:</p>
<ul>
  <li><strong>Migration scripts</strong> — ordered, hand-written, version-controlled. Maximum control, minimum surprise; the DBA reads every line. Best for most organisations</li>
  <li><strong>DACPAC / state-based</strong> — diffs desired schema against live and generates the delta. Fast, but the generated script must still be reviewed for production: the tool sees schema, not data volume or locking</li>
  <li><strong>ORM-driven migrations</strong> — convenient for developers, opaque to reviewers; require a gate that exports the executed script for DBA review before production</li>
</ul>
<p>After any mechanism runs, the DBA verifies with real queries rather than a green build badge:</p>
<pre><code class="language-sql">-- Post-deploy verification: version, object presence, no stuck blockers
SELECT schema_version, applied_by, applied_on FROM dbo.SchemaVersion;

SELECT name, type_desc FROM sys.objects
WHERE name IN ('usp_CreateOrder', 'ix_Orders_OrderDate')
  AND type IN ('P', 'IX');

SELECT session_id, blocking_session_id, wait_type, wait_time
FROM sys.dm_exec_requests
WHERE blocking_session_id &lt;&gt; 0;</code></pre>
`
    },
    {
      h: "When deployments go wrong",
      html: `
<p>Deployment incidents share a short list of root causes. Knowing them is half the review:</p>
<ul>
  <li><strong>No rollback plan</strong> — the deploy fails halfway and the team improvises with production data</li>
  <li><strong>Breaking change without compatibility</strong> — new code expects a column the old code's schema does not have, and the rollout is not atomic</li>
  <li><strong>Long-running DML in the script</strong> — a backfill UPDATE or a non-optimised CREATE INDEX running during peak, holding locks on the busiest table</li>
  <li><strong>Stale statistics after deploy</strong> — new query shapes run against old cardinality estimates and pick terrible plans</li>
  <li><strong>Forgotten companions</strong> — schema deploys cleanly, but the Agent job, grant, or Service Broker route was never created</li>
  <li><strong>Deploying at peak because the team is available</strong> — convenient for the team, expensive for the business</li>
</ul>
<p>The meta-pitfall is <strong>treating the database step as an afterthought in a code pipeline</strong>. Application deployments are automated end to end; if the database step still depends on someone remembering to run a script under time pressure, the organisation has automated everything except the riskiest part.</p>
`
    }
  ],

  scenario: {
    title: "The nine-minute lock during the Black Friday release",
    html: `
<p>Friday, 7:40 AM — the release window before the retail peak. A deployment script adds a new customer tier column, then “tidies up” by running an unbatched UPDATE across 40 million order rows to populate it. At 7:43 AM order inserts begin queuing; by 7:46 the checkout API is timing out and the incident channel is live. The DBA finds the head blocker in under two minutes: the deploy session, still running the backfill, holding row locks that every new order must wait behind.</p>
<p>Resolution: with the release manager's approval, the deploy session was killed — the transaction rolled back, releasing the locks — and traffic recovered immediately. The column was then added as nullable (a metadata-only operation), the application deployed reading NULL, and the backfill was rewritten to run in batches of 5,000 rows with a short delay between batches, completing over the next hour without user impact.</p>
<p>Prevention: the review checklist gained a hard rule — <strong>no unbatched DML on tables over a million rows in any production script</strong>, plus estimated-duration evidence required at the review gate. The feature shipped the same day; only its approach to existing data had been wrong.</p>
`
  },

  interview: [
    {
      q: "What do you check before approving a schema change for production?",
      a: "That it is the tested artefact; whether it is additive or breaking; the statements that take locks and their expected duration; how existing data is backfilled and whether that is batched; permissions and Agent jobs included; a rehearsed rollback; and the verification queries I will run afterwards. If any of those is unanswered, the deploy waits."
    },
    {
      q: "How do you deploy a change with zero downtime?",
      a: "Make every step additive and backwards-compatible: add nullable columns or new tables first, deploy code that tolerates both states, backfill in small batches, then apply constraints or cleanup in a later release. Combined with an online-capable index operation and a quiet window for the final step, the application never sees an incompatible schema."
    },
    {
      q: "The developer says the change is just one column. How do you respond?",
      a: "One column can still be a table rewrite depending on the operation and data size — I would check the actual statement, the table's row count, and the locking behaviour, then present the numbers. Most one-column changes are indeed metadata-only and get approved in minutes; the review exists so that the rare expensive one is identified before, not during, peak traffic."
    }
  ],

  takeaways: [
    "The DBA owns the safety of the data-layer change: review, application, verification, and rollback",
    "Ninety per cent of deployment risk is removed at the review gate, while the change is still text",
    "Prefer additive, backwards-compatible steps and batched backfills — then clean up in a later release",
    "Verify with queries after deploy: version, object existence, statistics, and no blockers",
    "Never deploy unbatched DML against a large hot table in a production window"
  ]
};
