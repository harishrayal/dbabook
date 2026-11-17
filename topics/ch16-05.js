/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch16-05.html */

window.TOPIC = {
  id: "ch16-05",
  title: "SQL Server Failover Cluster Instance (FCI)",

  lead: "Understanding SQL Server Failover Cluster Instance (FCI) is essential for anyone responsible for high availability. Here we examine the mechanics, the production implications and the practical decisions involved.",

  objectives: [
    "Define what SQL Server Failover Cluster Instance (FCI) is and where it fits",
    "Explain how SQL Server Failover Cluster Instance (FCI) works internally",
    "Apply SQL Server Failover Cluster Instance (FCI) correctly in a production environment",
    "Recognise the common mistakes and risks involving SQL Server Failover Cluster Instance (FCI)",
    "Monitor and troubleshoot SQL Server Failover Cluster Instance (FCI) with the right tools"
  ],

  sections: [
    {
      h: "What SQL Server Failover Cluster Instance (FCI) means",
      html: `
<p>In this topic we examine <strong>SQL Server Failover Cluster Instance (FCI)</strong> within high availability. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous. Automatic failover requires synchronous commit and a healthy WSFC quorum.</p>
<p>Quorum is the mechanism that prevents split-brain: a majority of voting members must agree on cluster ownership. Losing quorum stops the cluster to protect data, which is why witness configuration matters.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>SQL Server Failover Cluster Instance (FCI) is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where SQL Server Failover Cluster Instance (FCI) fits",
      html: `
<p>Failover can be automatic, manual or forced. Automatic is fastest but requires healthy synchronous replication; forced failover risks data loss and is an emergency measure only.</p>
<p>The diagram below places SQL Server Failover Cluster Instance (FCI) alongside the core concepts of high availability. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="SQL Server Failover Cluster I… flow">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="230" y="12" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="39" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">1. Failover</text>
    <rect x="230" y="66" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="93" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">2. Replica</text>
    <rect x="230" y="120" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="147" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">3. Listener</text>
    <rect x="230" y="174" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="201" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">4. Quorum</text>
    <rect x="230" y="228" width="300" height="44" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="255" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">5. Commit</text>
    <rect x="230" y="282" width="300" height="44" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="309" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">6. WSFC</text>
    <line x1="380" y1="56" x2="380" y2="66" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="110" x2="380" y2="120" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="164" x2="380" y2="174" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="218" x2="380" y2="228" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="272" x2="380" y2="282" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <text x="380" y="332" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">SQL Server Failover Cluster I…</text>
  </svg>
  <div class="figcaption">Figure 1 — High availability: how SQL Server Failover Cluster Instance (FCI) relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "SQL Server Failover Cluster Instance (FCI) in practice",
      html: `
<p>HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum. An untested HA configuration is a belief — regular failover testing is essential.</p>
<p>The following comparison captures the distinctions that matter most when working with SQL Server Failover Cluster Instance (FCI):</p>
<table>
  <tr><th>Technology</th><th>Protects</th><th>Failover</th></tr>
  <tr><td>FCI</td><td>Whole instance</td><td>Automatic, node-level</td></tr>
  <tr><td>Availability Group</td><td>Databases</td><td>Automatic with sync commit</td></tr>
  <tr><td>Log shipping</td><td>Databases</td><td>Manual, planned</td></tr>
</table>
<p>High availability keeps a database service reachable through failures. It is distinct from disaster recovery: HA handles local failures with near-zero downtime, while DR protects against site-wide loss with a measurable RTO.</p>
      `,
    },
    {
      h: "Working with SQL Server Failover Cluster Instance (FCI)",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Failover Cluster Instance (FCI). Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- SQL Server Failover Cluster Instance (FCI)
-- Availability group health from DMVs
SELECT ag.name AS ag_name,
       ar.replica_server_name,
       ars.synchronization_state_desc,
       ars.synchronization_health_desc,
       drs.synchronization_state_desc AS db_sync_state
FROM   sys.dm_hadr_availability_group_states ags
JOIN   sys.availability_groups ag ON ag.group_id = ags.group_id
JOIN   sys.dm_hadr_availability_replica_states ars
       ON ars.group_id = ag.group_id
JOIN   sys.availability_replicas ar
       ON ar.replica_id = ars.replica_id
JOIN   sys.dm_hadr_database_replica_states drs
       ON drs.replica_id = ars.replica_id;</code></pre>
<p>The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.</p>
<pre><code class="language-sql">-- SQL Server Failover Cluster Instance (FCI)
-- Listener configuration
SELECT agl.name AS listener_name,
       agl.ip_configuration_string_from_cluster AS ip_config,
       agl.port
FROM   sys.availability_group_listeners agl;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-powershell">-- SQL Server Failover Cluster Instance (FCI)
Get-ClusterResource | Select-Object Name,
  State, Group | Format-Table -AutoSize</code></pre>
<p>Requirements must be expressed in RPO and RTO before technology is chosen. Synchronous replication gives RPO = 0 but adds latency; asynchronous gives distance at the cost of possible data loss on failover.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>A failover cluster instance (FCI) provides instance-level protection: two or more Windows Server Failover Clustering nodes share storage, and only one owns the SQL Server instance at a time. Failure moves the instance to another node.</p>
<table>
  <tr><th>Commit mode</th><th>RPO</th><th>Latency</th></tr>
  <tr><td>Synchronous</td><td>Zero</td><td>Higher (wait for secondary)</td></tr>
  <tr><td>Asynchronous</td><td>Possible loss</td><td>Lower</td></tr>
</table>
<p>Always On Availability Groups protect databases rather than the whole instance. A primary replica sends log records to secondary replicas; readable secondaries can offload read workloads, and a listener provides a single connection point that follows the primary.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With SQL Server Failover Cluster Instance (FCI), prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: SQL Server Failover Cluster Instance (FCI)",
      html: `
<p>This section consolidates <strong>SQL Server Failover Cluster Instance (FCI)</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum. An untested HA configuration is a belief — regular failover testing is essential.</p>
<p>High availability keeps a database service reachable through failures. It is distinct from disaster recovery: HA handles local failures with near-zero downtime, while DR protects against site-wide loss with a measurable RTO.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>SQL Server Failover Cluster Instance (FCI) sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Technology</th><th>Protects</th><th>Failover</th></tr>
  <tr><td>FCI</td><td>Whole instance</td><td>Automatic, node-level</td></tr>
  <tr><td>Availability Group</td><td>Databases</td><td>Automatic with sync commit</td></tr>
  <tr><td>Log shipping</td><td>Databases</td><td>Manual, planned</td></tr>
</table>
<p>Requirements must be expressed in RPO and RTO before technology is chosen. Synchronous replication gives RPO = 0 but adds latency; asynchronous gives distance at the cost of possible data loss on failover.</p>
<p>Use the following as a starting point when investigating SQL Server Failover Cluster Instance (FCI). Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- SQL Server Failover Cluster Instance (FCI)
-- Availability group health from DMVs
SELECT ag.name AS ag_name,
       ar.replica_server_name,
       ars.synchronization_state_desc,
       ars.synchronization_health_desc,
       drs.synchronization_state_desc AS db_sync_state
FROM   sys.dm_hadr_availability_group_states ags
JOIN   sys.availability_groups ag ON ag.group_id = ags.group_id
JOIN   sys.dm_hadr_availability_replica_states ars
       ON ars.group_id = ag.group_id
JOIN   sys.availability_replicas ar
       ON ar.replica_id = ars.replica_id
JOIN   sys.dm_hadr_database_replica_states drs
       ON drs.replica_id = ars.replica_id;</code></pre>
<p>A failover cluster instance (FCI) provides instance-level protection: two or more Windows Server Failover Clustering nodes share storage, and only one owns the SQL Server instance at a time. Failure moves the instance to another node.</p>
      `,
    }
  ],

  scenario: {
    title: "The failover that did not happen",
    html: `
A primary node failed but no automatic failover occurred. Investigation showed the synchronous secondary was out of sync after a network issue, so automatic failover was correctly disabled. The DBA restored replication health and demonstrated a manual failover in the next test window. Understanding the health conditions for automatic failover prevents false assumptions.
<p><strong>The SQL Server Failover Cluster Instance (FCI) lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "Why does automatic failover require synchronous commit?",
      a: `
Because only synchronous commit guarantees the secondary has hardened the same transactions as the primary, so failover does not lose committed data.
      `,
    },
    {
      q: "What is quorum and why can losing it stop the database?",
      a: `
Quorum is the majority requirement that decides which nodes may own the cluster; losing it halts the cluster to prevent two halves from independently owning the same data (split-brain).
      `,
    },
    {
      q: "What is the difference between an FCI and an Availability Group?",
      a: `
An FCI protects the whole instance using shared storage with one active node; an AG protects selected databases by replicating log records to secondaries, which can also be readable.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within high availability.”",
      "options": [
        "The following comparison captures the distinctions that matter most when working with SQL Server Failover Cluster Instance (FCI):",
        "SQL Server Failover Cluster Instance (FCI)",
        "HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine SQL Server Failover Cluster Instance (FCI) within high availability. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Failover Cluster Instance (FCI) fits”?",
      "options": [
        "Failover can be automatic, manual or forced.",
        "High availability keeps a database service reachable through failures.",
        "Automatic, node-level"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Failover can be automatic, manual or forced. Automatic is fastest but requires healthy synchronous replication; forced failover risks data loss and is an emergency measure only.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Failover Cluster Instance (FCI) in practice”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum. An untested HA configuration is a belief — regular failover testing is essential.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Failover Cluster Instance (FCI)”?",
      "options": [
        "Automatic, node-level",
        "Theory becomes useful when you can apply it.",
        "High availability keeps a database service reachable through failures."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Failover Cluster Instance (FCI). Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "A failover cluster instance (FCI) provides instance-level protection: two or more Windows Server Failover Clustering nodes share storage, and only one owns the SQL Server instance…",
        "Automatic, node-level",
        "Automatic with sync commit"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A failover cluster instance (FCI) provides instance-level protection: two or more Windows Server Failover Clustering nodes share storage, and only one owns the SQL Server instance at a time. Failure moves the instance to another node.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Manual, planned",
        "Theory becomes useful when you can apply it.",
        "SQL Server Failover Cluster Instance (FCI)"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates SQL Server Failover Cluster Instance (FCI) with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SQL Server Failover Cluster Instance (FCI) means”?",
      "options": [
        "A failover cluster instance (FCI) provides instance-level protection: two or more Windows Server Failover Clustering nodes share storage, and only one owns the SQL Server instance…",
        "Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous.",
        "Requirements must be expressed in RPO and RTO before technology is chosen."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous. Automatic failover requires synchronous commit and a healthy WSFC quorum.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Failover Cluster Instance (FCI) fits”?",
      "options": [
        "The diagram below places SQL Server Failover Cluster Instance (FCI) alongside the core concepts of high availability.",
        "Next, verify the result and capture a baseline.",
        "Requirements must be expressed in RPO and RTO before technology is chosen."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places SQL Server Failover Cluster Instance (FCI) alongside the core concepts of high availability. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Failover Cluster Instance (FCI) in practice”?",
      "options": [
        "Higher (wait for secondary)",
        "Lower",
        "The following comparison captures the distinctions that matter most when working with SQL Server Failover Cluster Instance (FCI):"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SQL Server Failover Cluster Instance (FCI):”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Failover Cluster Instance (FCI)”?",
      "options": [
        "Higher (wait for secondary)",
        "The first example establishes the relevant state.",
        "With SQL Server Failover Cluster Instance (FCI), prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within high availability.”",
      "options": [
        "The following comparison captures the distinctions that matter most when working with SQL Server Failover Cluster Instance (FCI):",
        "SQL Server Failover Cluster Instance (FCI)",
        "HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine SQL Server Failover Cluster Instance (FCI) within high availability. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Failover Cluster Instance (FCI) fits”?",
      "options": [
        "Failover can be automatic, manual or forced.",
        "High availability keeps a database service reachable through failures.",
        "Automatic, node-level"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Failover can be automatic, manual or forced. Automatic is fastest but requires healthy synchronous replication; forced failover risks data loss and is an emergency measure only.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Failover Cluster Instance (FCI) in practice”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum. An untested HA configuration is a belief — regular failover testing is essential.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Failover Cluster Instance (FCI)”?",
      "options": [
        "Automatic, node-level",
        "Theory becomes useful when you can apply it.",
        "High availability keeps a database service reachable through failures."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Failover Cluster Instance (FCI). Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "A failover cluster instance (FCI) provides instance-level protection: two or more Windows Server Failover Clustering nodes share storage, and only one owns the SQL Server instance…",
        "Automatic, node-level",
        "Automatic with sync commit"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A failover cluster instance (FCI) provides instance-level protection: two or more Windows Server Failover Clustering nodes share storage, and only one owns the SQL Server instance at a time. Failure moves the instance to another node.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Manual, planned",
        "Theory becomes useful when you can apply it.",
        "SQL Server Failover Cluster Instance (FCI)"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates SQL Server Failover Cluster Instance (FCI) with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SQL Server Failover Cluster Instance (FCI) means”?",
      "options": [
        "A failover cluster instance (FCI) provides instance-level protection: two or more Windows Server Failover Clustering nodes share storage, and only one owns the SQL Server instance…",
        "Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous.",
        "Requirements must be expressed in RPO and RTO before technology is chosen."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous. Automatic failover requires synchronous commit and a healthy WSFC quorum.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Failover Cluster Instance (FCI) fits”?",
      "options": [
        "The diagram below places SQL Server Failover Cluster Instance (FCI) alongside the core concepts of high availability.",
        "Next, verify the result and capture a baseline.",
        "Requirements must be expressed in RPO and RTO before technology is chosen."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places SQL Server Failover Cluster Instance (FCI) alongside the core concepts of high availability. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Failover Cluster Instance (FCI) in practice”?",
      "options": [
        "Higher (wait for secondary)",
        "Lower",
        "The following comparison captures the distinctions that matter most when working with SQL Server Failover Cluster Instance (FCI):"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SQL Server Failover Cluster Instance (FCI):”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Failover Cluster Instance (FCI)”?",
      "options": [
        "Higher (wait for secondary)",
        "The first example establishes the relevant state.",
        "With SQL Server Failover Cluster Instance (FCI), prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within high availability.”",
      "options": [
        "The following comparison captures the distinctions that matter most when working with SQL Server Failover Cluster Instance (FCI):",
        "SQL Server Failover Cluster Instance (FCI)",
        "HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “In this topic we examine SQL Server Failover Cluster Instance (FCI) within high availability. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Failover Cluster Instance (FCI) fits”?",
      "options": [
        "Failover can be automatic, manual or forced.",
        "High availability keeps a database service reachable through failures.",
        "Automatic, node-level"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Failover can be automatic, manual or forced. Automatic is fastest but requires healthy synchronous replication; forced failover risks data loss and is an emergency measure only.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Failover Cluster Instance (FCI) in practice”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum. An untested HA configuration is a belief — regular failover testing is essential.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Failover Cluster Instance (FCI)”?",
      "options": [
        "Automatic, node-level",
        "Theory becomes useful when you can apply it.",
        "High availability keeps a database service reachable through failures."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to SQL Server Failover Cluster Instance (FCI). Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "A failover cluster instance (FCI) provides instance-level protection: two or more Windows Server Failover Clustering nodes share storage, and only one owns the SQL Server instance…",
        "Automatic, node-level",
        "Automatic with sync commit"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “A failover cluster instance (FCI) provides instance-level protection: two or more Windows Server Failover Clustering nodes share storage, and only one owns the SQL Server instance at a time. Failure moves the instance to another node.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "Manual, planned",
        "Theory becomes useful when you can apply it.",
        "SQL Server Failover Cluster Instance (FCI)"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “This section consolidates SQL Server Failover Cluster Instance (FCI) with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What SQL Server Failover Cluster Instance (FCI) means”?",
      "options": [
        "A failover cluster instance (FCI) provides instance-level protection: two or more Windows Server Failover Clustering nodes share storage, and only one owns the SQL Server instance…",
        "Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous.",
        "Requirements must be expressed in RPO and RTO before technology is chosen."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous. Automatic failover requires synchronous commit and a healthy WSFC quorum.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where SQL Server Failover Cluster Instance (FCI) fits”?",
      "options": [
        "The diagram below places SQL Server Failover Cluster Instance (FCI) alongside the core concepts of high availability.",
        "Next, verify the result and capture a baseline.",
        "Requirements must be expressed in RPO and RTO before technology is chosen."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The diagram below places SQL Server Failover Cluster Instance (FCI) alongside the core concepts of high availability. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “SQL Server Failover Cluster Instance (FCI) in practice”?",
      "options": [
        "Higher (wait for secondary)",
        "Lower",
        "The following comparison captures the distinctions that matter most when working with SQL Server Failover Cluster Instance (FCI):"
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with SQL Server Failover Cluster Instance (FCI):”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with SQL Server Failover Cluster Instance (FCI)”?",
      "options": [
        "Higher (wait for secondary)",
        "The first example establishes the relevant state.",
        "With SQL Server Failover Cluster Instance (FCI), prefer measured, reversible changes."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "SQL Server Failover Cluster Instance (FCI) is a fundamental concept in high availability",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of SQL Server Failover Cluster Instance (FCI) improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
