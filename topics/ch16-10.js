/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch16-10.html */

window.TOPIC = {
  id: "ch16-10",
  title: "Primary Replica",

  lead: "Primary Replica is a core part of high availability. This topic explains what it is, how it works inside SQL Server, and what a production DBA must know to operate it safely.",

  objectives: [
    "Define what Primary Replica is and where it fits",
    "Explain how Primary Replica works internally",
    "Apply Primary Replica correctly in a production environment",
    "Recognise the common mistakes and risks involving Primary Replica",
    "Monitor and troubleshoot Primary Replica with the right tools"
  ],

  sections: [
    {
      h: "What Primary Replica means",
      html: `
<p>In this topic we examine <strong>Primary Replica</strong> within high availability. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Requirements must be expressed in RPO and RTO before technology is chosen. Synchronous replication gives RPO = 0 but adds latency; asynchronous gives distance at the cost of possible data loss on failover.</p>
<p>A failover cluster instance (FCI) provides instance-level protection: two or more Windows Server Failover Clustering nodes share storage, and only one owns the SQL Server instance at a time. Failure moves the instance to another node.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Primary Replica is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Primary Replica fits",
      html: `
<p>Always On Availability Groups protect databases rather than the whole instance. A primary replica sends log records to secondary replicas; readable secondaries can offload read workloads, and a listener provides a single connection point that follows the primary.</p>
<p>The diagram below places Primary Replica alongside the core concepts of high availability. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Primary Replica concept map">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="280" y="140" width="200" height="60" rx="9" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="175" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Primary Replica</text>
    <rect x="24" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Failover</text>
    <text x="124" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 1</text>
    <rect x="536" y="18" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="40" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Replica</text>
    <text x="636" y="60" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 2</text>
    <rect x="24" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Listener</text>
    <text x="124" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 3</text>
    <rect x="536" y="138" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="160" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Quorum</text>
    <text x="636" y="180" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 4</text>
    <rect x="24" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="124" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Commit</text>
    <text x="124" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 5</text>
    <rect x="536" y="258" width="200" height="56" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="636" y="280" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">WSFC</text>
    <text x="636" y="300" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">key aspect 6</text>
    <line x1="380" y1="170" x2="124" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="46" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="166" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="124" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
    <line x1="380" y1="170" x2="636" y2="286" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ga)"/>
  </svg>
  <div class="figcaption">Figure 1 — High availability: how Primary Replica relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Primary Replica in practice",
      html: `
<p>Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous. Automatic failover requires synchronous commit and a healthy WSFC quorum.</p>
<p>The following comparison captures the distinctions that matter most when working with Primary Replica:</p>
<table>
  <tr><th>Technology</th><th>Protects</th><th>Failover</th></tr>
  <tr><td>FCI</td><td>Whole instance</td><td>Automatic, node-level</td></tr>
  <tr><td>Availability Group</td><td>Databases</td><td>Automatic with sync commit</td></tr>
  <tr><td>Log shipping</td><td>Databases</td><td>Manual, planned</td></tr>
</table>
<p>Quorum is the mechanism that prevents split-brain: a majority of voting members must agree on cluster ownership. Losing quorum stops the cluster to protect data, which is why witness configuration matters.</p>
      `,
    },
    {
      h: "Working with Primary Replica",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Primary Replica. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Primary Replica
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
<pre><code class="language-sql">-- Primary Replica
-- Listener configuration
SELECT agl.name AS listener_name,
       agl.ip_configuration_string_from_cluster AS ip_config,
       agl.port
FROM   sys.availability_group_listeners agl;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-powershell">-- Primary Replica
Get-ClusterResource | Select-Object Name,
  State, Group | Format-Table -AutoSize</code></pre>
<p>Failover can be automatic, manual or forced. Automatic is fastest but requires healthy synchronous replication; forced failover risks data loss and is an emergency measure only.</p>
      `,
    },
    {
      h: "Pitfalls and production guidance",
      html: `
<p>HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum. An untested HA configuration is a belief — regular failover testing is essential.</p>
<table>
  <tr><th>Commit mode</th><th>RPO</th><th>Latency</th></tr>
  <tr><td>Synchronous</td><td>Zero</td><td>Higher (wait for secondary)</td></tr>
  <tr><td>Asynchronous</td><td>Possible loss</td><td>Lower</td></tr>
</table>
<p>High availability keeps a database service reachable through failures. It is distinct from disaster recovery: HA handles local failures with near-zero downtime, while DR protects against site-wide loss with a measurable RTO.</p>
<div class="callout warning">
  <div class="callout-label">Production caution</div>
  <p>With Primary Replica, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    }
  ],

  scenario: {
    title: "Quorum loss stopped everything",
    html: `
A two-node cluster lost one node and then the witness, losing quorum; the cluster took the database offline to avoid split-brain. Restoring the witness brought it back. Quorum is a safety feature, and witness placement must be designed deliberately.
<p><strong>The Primary Replica lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
    {
      q: "What is the difference between an FCI and an Availability Group?",
      a: `
An FCI protects the whole instance using shared storage with one active node; an AG protects selected databases by replicating log records to secondaries, which can also be readable.
      `,
    },
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
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within high availability.”",
      "options": [
        "Manual, planned",
        "Theory becomes useful when you can apply it.",
        "Primary Replica"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Primary Replica within high availability. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Primary Replica fits”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Always On Availability Groups protect databases rather than the whole instance.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Always On Availability Groups protect databases rather than the whole instance. A primary replica sends log records to secondary replicas; readable secondaries can offload read workloads, and a listener provides a single connection point that follows the primary.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Primary Replica in practice”?",
      "options": [
        "Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous.",
        "With Primary Replica, prefer measured, reversible changes.",
        "Higher (wait for secondary)"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous. Automatic failover requires synchronous commit and a healthy WSFC quorum.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Primary Replica”?",
      "options": [
        "High availability keeps a database service reachable through failures.",
        "With Primary Replica, prefer measured, reversible changes.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Primary Replica. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Failover can be automatic, manual or forced.",
        "HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum. An untested HA configuration is a belief — regular failover testing is essential.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Primary Replica means”?",
      "options": [
        "Requirements must be expressed in RPO and RTO before technology is chosen.",
        "Higher (wait for secondary)",
        "Lower"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Requirements must be expressed in RPO and RTO before technology is chosen. Synchronous replication gives RPO = 0 but adds latency; asynchronous gives distance at the cost of possible data loss on failover.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Primary Replica fits”?",
      "options": [
        "With Primary Replica, prefer measured, reversible changes.",
        "Higher (wait for secondary)",
        "The diagram below places Primary Replica alongside the core concepts of high availability."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Primary Replica alongside the core concepts of high availability. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Primary Replica in practice”?",
      "options": [
        "Automatic with sync commit",
        "The following comparison captures the distinctions that matter most when working with Primary Replica:",
        "Automatic, node-level"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Primary Replica:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Primary Replica”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Failover can be automatic, manual or forced."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Lower",
        "Primary Replica",
        "High availability keeps a database service reachable through failures."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “High availability keeps a database service reachable through failures. It is distinct from disaster recovery: HA handles local failures with near-zero downtime, while DR protects against site-wide loss with a measurable RTO.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within high availability.”",
      "options": [
        "Manual, planned",
        "Theory becomes useful when you can apply it.",
        "Primary Replica"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Primary Replica within high availability. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Primary Replica fits”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Always On Availability Groups protect databases rather than the whole instance.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Always On Availability Groups protect databases rather than the whole instance. A primary replica sends log records to secondary replicas; readable secondaries can offload read workloads, and a listener provides a single connection point that follows the primary.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Primary Replica in practice”?",
      "options": [
        "Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous.",
        "With Primary Replica, prefer measured, reversible changes.",
        "Higher (wait for secondary)"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous. Automatic failover requires synchronous commit and a healthy WSFC quorum.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Primary Replica”?",
      "options": [
        "High availability keeps a database service reachable through failures.",
        "With Primary Replica, prefer measured, reversible changes.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Primary Replica. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Failover can be automatic, manual or forced.",
        "HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum. An untested HA configuration is a belief — regular failover testing is essential.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Primary Replica means”?",
      "options": [
        "Requirements must be expressed in RPO and RTO before technology is chosen.",
        "Higher (wait for secondary)",
        "Lower"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Requirements must be expressed in RPO and RTO before technology is chosen. Synchronous replication gives RPO = 0 but adds latency; asynchronous gives distance at the cost of possible data loss on failover.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Primary Replica fits”?",
      "options": [
        "With Primary Replica, prefer measured, reversible changes.",
        "Higher (wait for secondary)",
        "The diagram below places Primary Replica alongside the core concepts of high availability."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Primary Replica alongside the core concepts of high availability. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Primary Replica in practice”?",
      "options": [
        "Automatic with sync commit",
        "The following comparison captures the distinctions that matter most when working with Primary Replica:",
        "Automatic, node-level"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Primary Replica:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Primary Replica”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Failover can be automatic, manual or forced."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Lower",
        "Primary Replica",
        "High availability keeps a database service reachable through failures."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “High availability keeps a database service reachable through failures. It is distinct from disaster recovery: HA handles local failures with near-zero downtime, while DR protects against site-wide loss with a measurable RTO.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within high availability.”",
      "options": [
        "Manual, planned",
        "Theory becomes useful when you can apply it.",
        "Primary Replica"
      ],
      "answerIndex": 2,
      "explanation": "The lesson states: “In this topic we examine Primary Replica within high availability. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Primary Replica fits”?",
      "options": [
        "Next, verify the result and capture a baseline.",
        "Always On Availability Groups protect databases rather than the whole instance.",
        "The first example establishes the relevant state."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Always On Availability Groups protect databases rather than the whole instance. A primary replica sends log records to secondary replicas; readable secondaries can offload read workloads, and a listener provides a single connection point that follows the primary.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Primary Replica in practice”?",
      "options": [
        "Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous.",
        "With Primary Replica, prefer measured, reversible changes.",
        "Higher (wait for secondary)"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous. Automatic failover requires synchronous commit and a healthy WSFC quorum.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Primary Replica”?",
      "options": [
        "High availability keeps a database service reachable through failures.",
        "With Primary Replica, prefer measured, reversible changes.",
        "Theory becomes useful when you can apply it."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Primary Replica. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Failover can be automatic, manual or forced.",
        "HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum. An untested HA configuration is a belief — regular failover testing is essential.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Primary Replica means”?",
      "options": [
        "Requirements must be expressed in RPO and RTO before technology is chosen.",
        "Higher (wait for secondary)",
        "Lower"
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Requirements must be expressed in RPO and RTO before technology is chosen. Synchronous replication gives RPO = 0 but adds latency; asynchronous gives distance at the cost of possible data loss on failover.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Primary Replica fits”?",
      "options": [
        "With Primary Replica, prefer measured, reversible changes.",
        "Higher (wait for secondary)",
        "The diagram below places Primary Replica alongside the core concepts of high availability."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Primary Replica alongside the core concepts of high availability. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Primary Replica in practice”?",
      "options": [
        "Automatic with sync commit",
        "The following comparison captures the distinctions that matter most when working with Primary Replica:",
        "Automatic, node-level"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Primary Replica:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Primary Replica”?",
      "options": [
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline.",
        "Failover can be automatic, manual or forced."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "Lower",
        "Primary Replica",
        "High availability keeps a database service reachable through failures."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “High availability keeps a database service reachable through failures. It is distinct from disaster recovery: HA handles local failures with near-zero downtime, while DR protects against site-wide loss with a measurable RTO.”"
    }
  ],
  takeaways: [
    "Primary Replica is a fundamental concept in high availability",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Primary Replica improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
