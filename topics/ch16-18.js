/* Topic content file — one JS file per topic.
   Rendered by assets/js/site.js on topics/ch16-18.html */

window.TOPIC = {
  id: "ch16-18",
  title: "Quorum Fundamentals",

  lead: "This topic covers Quorum Fundamentals — a concept you will meet repeatedly when working with high availability. We build from first principles to production guidance.",

  objectives: [
    "Define what Quorum Fundamentals is and where it fits",
    "Explain how Quorum Fundamentals works internally",
    "Apply Quorum Fundamentals correctly in a production environment",
    "Recognise the common mistakes and risks involving Quorum Fundamentals",
    "Monitor and troubleshoot Quorum Fundamentals with the right tools"
  ],

  sections: [
    {
      h: "What Quorum Fundamentals means",
      html: `
<p>In this topic we examine <strong>Quorum Fundamentals</strong> within high availability. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.</p>
<p>Requirements must be expressed in RPO and RTO before technology is chosen. Synchronous replication gives RPO = 0 but adds latency; asynchronous gives distance at the cost of possible data loss on failover.</p>
<p>A failover cluster instance (FCI) provides instance-level protection: two or more Windows Server Failover Clustering nodes share storage, and only one owns the SQL Server instance at a time. Failure moves the instance to another node.</p>
<div class="callout fact">
  <div class="callout-label">Key idea</div>
  <p>Quorum Fundamentals is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its workloads.</p>
</div>
      `,
    },
    {
      h: "Where Quorum Fundamentals fits",
      html: `
<p>Always On Availability Groups protect databases rather than the whole instance. A primary replica sends log records to secondary replicas; readable secondaries can offload read workloads, and a listener provides a single connection point that follows the primary.</p>
<p>The diagram below places Quorum Fundamentals alongside the core concepts of high availability. Seeing the relationships makes it easier to reason about cause and effect during an incident.</p>
<div class="figure">
  <svg viewBox="0 0 760 340" role="img" aria-label="Quorum Fundamentals layers">
    <defs>
      <marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/>
      </marker>
    </defs>
    <rect x="70" y="8" width="620" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="30" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Failover</text>
    <text x="380" y="50" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 1</text>
    <rect x="100" y="62" width="560" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="84" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Replica</text>
    <text x="380" y="104" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 2</text>
    <rect x="130" y="116" width="500" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="138" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Listener</text>
    <text x="380" y="158" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 3</text>
    <rect x="160" y="170" width="440" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="192" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Quorum</text>
    <text x="380" y="212" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 4</text>
    <rect x="190" y="224" width="380" height="46" rx="9" fill="var(--surface-2)" stroke="var(--border)"/>
    <text x="380" y="246" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">Commit</text>
    <text x="380" y="266" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 5</text>
    <rect x="220" y="278" width="320" height="46" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
    <text x="380" y="300" text-anchor="middle" fill="var(--text)" font-size="13.5" font-weight="600" font-family="Segoe UI, sans-serif">WSFC</text>
    <text x="380" y="320" text-anchor="middle" fill="var(--muted)" font-size="11.5" font-family="Segoe UI, sans-serif">layer 6</text>
    <text x="380" y="336" text-anchor="middle" fill="var(--muted)" font-size="12" font-style="italic" font-family="Segoe UI, sans-serif">Quorum Fundamentals</text>
  </svg>
  <div class="figcaption">Figure 1 — High availability: how Quorum Fundamentals relates to the core concepts.</div>
</div>
      `,
    },
    {
      h: "Quorum Fundamentals in practice",
      html: `
<p>Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous. Automatic failover requires synchronous commit and a healthy WSFC quorum.</p>
<p>The following comparison captures the distinctions that matter most when working with Quorum Fundamentals:</p>
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
      h: "Working with Quorum Fundamentals",
      html: `
<p>Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Quorum Fundamentals. Run them first on a non-production instance and adapt paths and names to your environment.</p>
<pre><code class="language-sql">-- Quorum Fundamentals
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
<pre><code class="language-sql">-- Quorum Fundamentals
-- Listener configuration
SELECT agl.name AS listener_name,
       agl.ip_configuration_string_from_cluster AS ip_config,
       agl.port
FROM   sys.availability_group_listeners agl;</code></pre>
<p>Next, verify the result and capture a baseline. Recording the 'before' state lets you prove that a change had the intended effect and gives you a rollback reference.</p>
<pre><code class="language-powershell">-- Quorum Fundamentals
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
  <p>With Quorum Fundamentals, prefer measured, reversible changes. Test on non-production, keep a rollback path, and monitor the effect — a change that looks harmless in isolation can have surprising consequences at scale.</p>
</div>
      `,
    },
    {
      h: "Deeper dive: Quorum Fundamentals",
      html: `
<p>This section consolidates <strong>Quorum Fundamentals</strong> with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.</p>
<p>Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous. Automatic failover requires synchronous commit and a healthy WSFC quorum.</p>
<p>Quorum is the mechanism that prevents split-brain: a majority of voting members must agree on cluster ownership. Losing quorum stops the cluster to protect data, which is why witness configuration matters.</p>
<div class="callout fact">
  <div class="callout-label">Remember</div>
  <p>Quorum Fundamentals sits inside a larger system. Always consider how a change here affects availability, recovery, security and performance elsewhere in the estate.</p>
</div>
<p>The distinctions below are the ones that matter most in day-to-day administration:</p>
<table>
  <tr><th>Commit mode</th><th>RPO</th><th>Latency</th></tr>
  <tr><td>Synchronous</td><td>Zero</td><td>Higher (wait for secondary)</td></tr>
  <tr><td>Asynchronous</td><td>Possible loss</td><td>Lower</td></tr>
</table>
<p>Failover can be automatic, manual or forced. Automatic is fastest but requires healthy synchronous replication; forced failover risks data loss and is an emergency measure only.</p>
<p>Use the following as a starting point when investigating Quorum Fundamentals. Adapt names and paths to your own environment and run it first on a non-production instance:</p>
<pre><code class="language-sql">-- Quorum Fundamentals
-- Listener configuration
SELECT agl.name AS listener_name,
       agl.ip_configuration_string_from_cluster AS ip_config,
       agl.port
FROM   sys.availability_group_listeners agl;</code></pre>
<p>HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum. An untested HA configuration is a belief — regular failover testing is essential.</p>
      `,
    }
  ],

  scenario: {
    title: "Quorum loss stopped everything",
    html: `
A two-node cluster lost one node and then the witness, losing quorum; the cluster took the database offline to avoid split-brain. Restoring the witness brought it back. Quorum is a safety feature, and witness placement must be designed deliberately.
<p><strong>The Quorum Fundamentals lesson:</strong> symptoms rarely point directly at the cause. Disciplined diagnosis — evidence first, mitigation second, prevention third — turns an incident into a documented improvement rather than a repeat event.</p>
    `,
  },

  interview: [
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
    },
    {
      q: "Why does automatic failover require synchronous commit?",
      a: `
Because only synchronous commit guarantees the secondary has hardened the same transactions as the primary, so failover does not lose committed data.
      `,
    }
  ],

  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within high availability.”",
      "options": [
        "Quorum Fundamentals",
        "Higher (wait for secondary)",
        "Lower"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Quorum Fundamentals within high availability. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Quorum Fundamentals fits”?",
      "options": [
        "Quorum Fundamentals sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Always On Availability Groups protect databases rather than the whole instance."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Always On Availability Groups protect databases rather than the whole instance. A primary replica sends log records to secondary replicas; readable secondaries can offload read workloads, and a listener provides a single connection point that follows the primary.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Quorum Fundamentals in practice”?",
      "options": [
        "Automatic with sync commit",
        "Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous.",
        "Automatic, node-level"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous. Automatic failover requires synchronous commit and a healthy WSFC quorum.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Quorum Fundamentals”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Quorum Fundamentals. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "With Quorum Fundamentals, prefer measured, reversible changes.",
        "Quorum Fundamentals",
        "HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum. An untested HA configuration is a belief — regular failover testing is essential.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "A failover cluster instance (FCI) provides instance-level protection: two or more Windows Server Failover Clustering nodes share storage, and only one owns the SQL Server instance…",
        "Quorum Fundamentals",
        "Requirements must be expressed in RPO and RTO before technology is chosen."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Quorum Fundamentals with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Quorum Fundamentals means”?",
      "options": [
        "Requirements must be expressed in RPO and RTO before technology is chosen.",
        "The diagram below places Quorum Fundamentals alongside the core concepts of high availability.",
        "Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Requirements must be expressed in RPO and RTO before technology is chosen. Synchronous replication gives RPO = 0 but adds latency; asynchronous gives distance at the cost of possible data loss on failover.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Quorum Fundamentals fits”?",
      "options": [
        "A failover cluster instance (FCI) provides instance-level protection: two or more Windows Server Failover Clustering nodes share storage, and only one owns the SQL Server instance…",
        "Quorum Fundamentals is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "The diagram below places Quorum Fundamentals alongside the core concepts of high availability."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Quorum Fundamentals alongside the core concepts of high availability. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Quorum Fundamentals in practice”?",
      "options": [
        "Always On Availability Groups protect databases rather than the whole instance.",
        "The following comparison captures the distinctions that matter most when working with Quorum Fundamentals:",
        "Quorum Fundamentals is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Quorum Fundamentals:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Quorum Fundamentals”?",
      "options": [
        "The first example establishes the relevant state.",
        "Always On Availability Groups protect databases rather than the whole instance.",
        "The diagram below places Quorum Fundamentals alongside the core concepts of high availability."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within high availability.”",
      "options": [
        "Quorum Fundamentals",
        "Higher (wait for secondary)",
        "Lower"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Quorum Fundamentals within high availability. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Quorum Fundamentals fits”?",
      "options": [
        "Quorum Fundamentals sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Always On Availability Groups protect databases rather than the whole instance."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Always On Availability Groups protect databases rather than the whole instance. A primary replica sends log records to secondary replicas; readable secondaries can offload read workloads, and a listener provides a single connection point that follows the primary.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Quorum Fundamentals in practice”?",
      "options": [
        "Automatic with sync commit",
        "Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous.",
        "Automatic, node-level"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous. Automatic failover requires synchronous commit and a healthy WSFC quorum.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Quorum Fundamentals”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Quorum Fundamentals. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "With Quorum Fundamentals, prefer measured, reversible changes.",
        "Quorum Fundamentals",
        "HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum. An untested HA configuration is a belief — regular failover testing is essential.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "A failover cluster instance (FCI) provides instance-level protection: two or more Windows Server Failover Clustering nodes share storage, and only one owns the SQL Server instance…",
        "Quorum Fundamentals",
        "Requirements must be expressed in RPO and RTO before technology is chosen."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Quorum Fundamentals with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Quorum Fundamentals means”?",
      "options": [
        "Requirements must be expressed in RPO and RTO before technology is chosen.",
        "The diagram below places Quorum Fundamentals alongside the core concepts of high availability.",
        "Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Requirements must be expressed in RPO and RTO before technology is chosen. Synchronous replication gives RPO = 0 but adds latency; asynchronous gives distance at the cost of possible data loss on failover.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Quorum Fundamentals fits”?",
      "options": [
        "A failover cluster instance (FCI) provides instance-level protection: two or more Windows Server Failover Clustering nodes share storage, and only one owns the SQL Server instance…",
        "Quorum Fundamentals is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "The diagram below places Quorum Fundamentals alongside the core concepts of high availability."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Quorum Fundamentals alongside the core concepts of high availability. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Quorum Fundamentals in practice”?",
      "options": [
        "Always On Availability Groups protect databases rather than the whole instance.",
        "The following comparison captures the distinctions that matter most when working with Quorum Fundamentals:",
        "Quorum Fundamentals is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Quorum Fundamentals:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Quorum Fundamentals”?",
      "options": [
        "The first example establishes the relevant state.",
        "Always On Availability Groups protect databases rather than the whole instance.",
        "The diagram below places Quorum Fundamentals alongside the core concepts of high availability."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  quiz: [
    {
      "question": "Complete the lesson statement: “In this topic we examine _____ within high availability.”",
      "options": [
        "Quorum Fundamentals",
        "Higher (wait for secondary)",
        "Lower"
      ],
      "answerIndex": 0,
      "explanation": "The lesson states: “In this topic we examine Quorum Fundamentals within high availability. It is a concept that rewards careful understanding: decisions made here affect reliability, performance and recoverability across the whole estate.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Quorum Fundamentals fits”?",
      "options": [
        "Quorum Fundamentals sits inside a larger system.",
        "The distinctions below are the ones that matter most in day-to-day administration:",
        "Always On Availability Groups protect databases rather than the whole instance."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “Always On Availability Groups protect databases rather than the whole instance. A primary replica sends log records to secondary replicas; readable secondaries can offload read workloads, and a listener provides a single connection point that follows the primary.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Quorum Fundamentals in practice”?",
      "options": [
        "Automatic with sync commit",
        "Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous.",
        "Automatic, node-level"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous. Automatic failover requires synchronous commit and a healthy WSFC quorum.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Quorum Fundamentals”?",
      "options": [
        "Theory becomes useful when you can apply it.",
        "The first example establishes the relevant state.",
        "Next, verify the result and capture a baseline."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Theory becomes useful when you can apply it. These examples show realistic commands and queries connected to Quorum Fundamentals. Run them first on a non-production instance and adapt paths and names to your environment.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Pitfalls and production guidance”?",
      "options": [
        "With Quorum Fundamentals, prefer measured, reversible changes.",
        "Quorum Fundamentals",
        "HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “HA monitoring covers replica health, synchronization state, send/redo queues, failover events and quorum. An untested HA configuration is a belief — regular failover testing is essential.”"
    },
    {
      "question": "Complete the lesson statement: “This section consolidates _____ with a closer look at the mechanisms and the operational decisions that surround it.”",
      "options": [
        "A failover cluster instance (FCI) provides instance-level protection: two or more Windows Server Failover Clustering nodes share storage, and only one owns the SQL Server instance…",
        "Quorum Fundamentals",
        "Requirements must be expressed in RPO and RTO before technology is chosen."
      ],
      "answerIndex": 1,
      "explanation": "The lesson states: “This section consolidates Quorum Fundamentals with a closer look at the mechanisms and the operational decisions that surround it. Revisiting a concept from a second angle is often what turns recognition into real understanding.”"
    },
    {
      "question": "Which fact is covered in the lesson section “What Quorum Fundamentals means”?",
      "options": [
        "Requirements must be expressed in RPO and RTO before technology is chosen.",
        "The diagram below places Quorum Fundamentals alongside the core concepts of high availability.",
        "Availability replicas may be synchronous (the primary waits for the secondary to harden the log) or asynchronous."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “Requirements must be expressed in RPO and RTO before technology is chosen. Synchronous replication gives RPO = 0 but adds latency; asynchronous gives distance at the cost of possible data loss on failover.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Where Quorum Fundamentals fits”?",
      "options": [
        "A failover cluster instance (FCI) provides instance-level protection: two or more Windows Server Failover Clustering nodes share storage, and only one owns the SQL Server instance…",
        "Quorum Fundamentals is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…",
        "The diagram below places Quorum Fundamentals alongside the core concepts of high availability."
      ],
      "answerIndex": 2,
      "explanation": "The section explains: “The diagram below places Quorum Fundamentals alongside the core concepts of high availability. Seeing the relationships makes it easier to reason about cause and effect during an incident.”"
    },
    {
      "question": "Which fact is covered in the lesson section “Quorum Fundamentals in practice”?",
      "options": [
        "Always On Availability Groups protect databases rather than the whole instance.",
        "The following comparison captures the distinctions that matter most when working with Quorum Fundamentals:",
        "Quorum Fundamentals is not an isolated feature — it interacts with the wider platform, so changes should always be considered in the context of the whole instance and its…"
      ],
      "answerIndex": 1,
      "explanation": "The section explains: “The following comparison captures the distinctions that matter most when working with Quorum Fundamentals:”"
    },
    {
      "question": "Which fact is covered in the lesson section “Working with Quorum Fundamentals”?",
      "options": [
        "The first example establishes the relevant state.",
        "Always On Availability Groups protect databases rather than the whole instance.",
        "The diagram below places Quorum Fundamentals alongside the core concepts of high availability."
      ],
      "answerIndex": 0,
      "explanation": "The section explains: “The first example establishes the relevant state. Always confirm what the server reports before changing anything — assumptions are the source of most production mistakes.”"
    }
  ],
  takeaways: [
    "Quorum Fundamentals is a fundamental concept in high availability",
    "Understanding its mechanics lets you diagnose symptoms instead of guessing",
    "Correct configuration and monitoring of Quorum Fundamentals improves reliability and performance",
    "Avoid the common pitfalls — test changes, keep rollback paths and measure results",
    "Use the catalog views, DMVs and commands shown here to verify what the server is actually doing"
  ]
};
