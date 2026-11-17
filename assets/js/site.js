/* ============================================================
   SQL Server DBA Roadmap — shared site runtime
   Renders sidebar, search, progress, theme, and topic content.
   Topic/practical pages expose content via window.TOPIC (their
   own separate .js file, one per topic).
   ============================================================ */

(function () {
  "use strict";

  var ROADMAP = window.DBA_ROADMAP || { chapters: [], practicals: [] };
  var LS = {
    progress: "dba-progress-v1",
    theme: "dba-theme",
    expanded: "dba-expanded-v1"
  };

  /* ---------------- storage helpers (safe on file://) ---------------- */

  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  var progress = new Set(load(LS.progress, []));

  /* ---------------- roadmap index ---------------- */

  var flat = [];       // ordered list of all lessons (topics then practicals)
  var chapterOf = {};  // lesson id -> chapter or practical group

  ROADMAP.chapters.forEach(function (ch) {
    ch.topics.forEach(function (t) {
      var item = { id: t.id, title: t.title, type: "topic", ch: ch };
      flat.push(item);
      chapterOf[t.id] = ch;
    });
  });

  ROADMAP.practicals.forEach(function (p) {
    var item = { id: p.id, title: p.title, type: "practical", ch: p };
    flat.push(item);
    chapterOf[p.id] = p;
  });

  var totalLessons = flat.length;

  function activeId() {
    var file = (location.pathname.split("/").pop() || "index.html").replace(/\.html?$/i, "");
    return file === "index" ? "home" : file;
  }

  var currentId = activeId();
  var currentChapter = chapterOf[currentId] || null;

  function pageKind() {
    return document.body.getAttribute("data-page") || "";
  }

  function rootPrefix() {
    var p = pageKind();
    return (p === "topic" || p === "practical") ? "../" : "";
  }

  /* ---------------- glossary helpers ---------------- */

  function termSlug(term) {
    return String(term).toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function lookupLesson(id) {
    var item = flat.find(function (f) { return f.id === id; });
    if (!item) return null;
    return {
      title: item.title,
      href: rootPrefix() + (item.type === "topic" ? "topics/" : "practicals/") + item.id + ".html"
    };
  }

  var glossaryQueue = [];

  function whenGlossaryReady(fn) {
    if (window.GLOSSARY) fn();
    else glossaryQueue.push(fn);
  }

  /* ---------------- sidebar ---------------- */

  var expanded = new Set(load(LS.expanded, []));
  if (!expanded.size && currentChapter && currentChapter.id.indexOf("ch") === 0) {
    expanded.add(currentChapter.id);
  }

  function isDone(id) { return progress.has(id); }

  function chapterProgressLabel(ch) {
    var done = ch.topics.filter(function (t) { return isDone(t.id); }).length;
    return done + "/" + ch.topics.length;
  }

  function buildSidebar() {
    var html = "";

    html += '<div class="sidebar-head">' +
      '<div class="progress-label"><span>Your progress</span>' +
      '<b id="progressCount">0 / ' + totalLessons + '</b></div>' +
      '<div class="progress-bar"><span id="progressFill"></span></div>' +
      "</div>";

    ROADMAP.chapters.forEach(function (ch) {
      var open = expanded.has(ch.id);
      html += '<div class="nav-chapter' + (open ? "" : " collapsed") + '" data-ch="' + ch.id + '">' +
        '<button class="nav-ch-title" data-ch="' + ch.id + '">' +
        '<span class="num">' + String(ch.num).padStart(2, "0") + "</span>" +
        "<span>" + ch.title + "</span>" +
        '<span class="caret">▾</span>' +
        "</button>" +
        '<ul class="nav-topics">';

      ch.topics.forEach(function (t) {
        var cls = "nav-topic" + (t.id === currentId ? " active" : "") + (isDone(t.id) ? " done" : "");
        html += '<li><a class="' + cls + '" href="../topics/' + t.id + '.html" data-id="' + t.id + '">' +
          '<span class="tick">✓</span><span>' + t.title + "</span></a></li>";
      });

      html += "</ul></div>";
    });

    // Practicals group
    var pOpen = expanded.has("practicals");
    html += '<div class="nav-chapter' + (pOpen ? "" : " collapsed") + '" data-ch="practicals">' +
      '<button class="nav-ch-title" data-ch="practicals">' +
      '<span class="num">P</span><span>Final Practical Phase</span>' +
      '<span class="caret">▾</span></button><ul class="nav-topics">';

    ROADMAP.practicals.forEach(function (p) {
      var cls = "nav-topic" + (p.id === currentId ? " active" : "") + (isDone(p.id) ? " done" : "");
      html += '<li><a class="' + cls + '" href="../practicals/' + p.id + '.html" data-id="' + p.id + '">' +
        '<span class="tick">✓</span><span>' + p.num + ". " + p.title + "</span></a></li>";
    });

    html += "</ul></div>";
    return html;
  }

  function updateProgressUI() {
    var count = document.getElementById("progressCount");
    var fill = document.getElementById("progressFill");
    if (count) count.textContent = progress.size + " / " + totalLessons;
    if (fill) fill.style.width = (totalLessons ? (progress.size / totalLessons) * 100 : 0) + "%";
  }

  function renderSidebar() {
    var sb = document.getElementById("sidebar");
    if (!sb) return;
    sb.innerHTML = buildSidebar();
    updateProgressUI();

    sb.querySelectorAll(".nav-ch-title").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-ch");
        var box = sb.querySelector('.nav-chapter[data-ch="' + id + '"]');
        box.classList.toggle("collapsed");
        if (box.classList.contains("collapsed")) expanded.delete(id);
        else expanded.add(id);
        save(LS.expanded, Array.from(expanded));
      });
    });
  }

  /* ---------------- search ---------------- */

  function buildSearch() {
    var input = document.getElementById("searchInput");
    var results = document.getElementById("searchResults");
    if (!input || !results) return;

    function close() { results.classList.remove("open"); }

    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      if (q.length < 2) { close(); return; }

      var matches = flat.filter(function (item) {
        return item.title.toLowerCase().indexOf(q) !== -1 ||
          item.ch.title.toLowerCase().indexOf(q) !== -1;
      }).slice(0, 10);

      var gmatches = (window.GLOSSARY || []).filter(function (g) {
        return g.term.toLowerCase().indexOf(q) !== -1 ||
          String(g.short || "").toLowerCase().indexOf(q) !== -1 ||
          String(g.cat || "").toLowerCase().indexOf(q) !== -1;
      }).slice(0, 6);

      if (!matches.length && !gmatches.length) {
        results.innerHTML = '<div class="search-empty">No topics or glossary entries match “' + input.value + '”</div>';
      } else {
        var out = matches.map(function (m) {
          var href = (m.type === "topic" ? "../topics/" : "../practicals/") + m.id + ".html";
          return '<a class="search-result" href="' + href + '">' +
            '<span class="sr-ch">' + (m.type === "topic" ? "Chapter " + String(m.ch.num).padStart(2, "0") : "Practical") +
            " · " + m.ch.title + "</span>" + m.title + "</a>";
        }).join("");
        out += gmatches.map(function (g) {
          return '<a class="search-result" href="' + rootPrefix() + 'glossary.html#' + termSlug(g.term) + '">' +
            '<span class="sr-ch">Glossary · ' + esc(g.cat) + "</span>" + esc(g.term) + "</a>";
        }).join("");
        results.innerHTML = out;
      }
      results.classList.add("open");
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { input.value = ""; close(); }
      if (e.key === "Enter") {
        var first = results.querySelector(".search-result");
        if (first) location.href = first.getAttribute("href");
      }
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest(".search")) close();
    });
  }

  /* ---------------- theme ---------------- */

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(LS.theme); } catch (e) { /* ignore */ }
    applyTheme(saved || "light");

    var btn = document.getElementById("themeBtn");
    if (btn) {
      btn.addEventListener("click", function () {
        var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next);
        try { localStorage.setItem(LS.theme, next); } catch (e) { /* ignore */ }
      });
    }
  }

  /* ---------------- mobile sidebar ---------------- */

  function initMobileNav() {
    var btn = document.getElementById("hamburger");
    var sb = document.getElementById("sidebar");
    var overlay = document.getElementById("sidebarOverlay");
    if (!btn || !sb) return;

    function close() {
      sb.classList.remove("open");
      if (overlay) overlay.classList.remove("show");
    }

    btn.addEventListener("click", function () {
      sb.classList.toggle("open");
      if (overlay) overlay.classList.toggle("show", sb.classList.contains("open"));
    });

    if (overlay) overlay.addEventListener("click", close);

    sb.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });
  }

  /* ---------------- code blocks ---------------- */

  function wrapCode(root) {
    root.querySelectorAll("pre").forEach(function (pre) {
      if (pre.parentElement.classList.contains("code-wrap")) return;
      var wrap = document.createElement("div");
      wrap.className = "code-wrap";
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);

      var code = pre.querySelector("code");
      var lang = "";
      if (code) {
        var m = (code.className || "").match(/language-([\w+-]+)/);
        if (m) lang = m[1];
      }
      if (!lang) {
        var first = (pre.textContent || "").trim().split("\n")[0];
        if (/^(USE|SELECT|CREATE|ALTER|RESTORE|BACKUP|DBCC|EXEC|WITH)\b/i.test(first)) lang = "sql";
        else if (/^(function|Get-|Set-|\$|Import-)/.test(first)) lang = "powershell";
        else lang = "text";
      }

      var label = document.createElement("span");
      label.className = "code-lang";
      label.textContent = lang;
      wrap.appendChild(label);

      var copy = document.createElement("button");
      copy.className = "copy-btn";
      copy.type = "button";
      copy.textContent = "Copy";
      copy.addEventListener("click", function () {
        var text = pre.textContent;
        function done() {
          copy.textContent = "Copied!";
          setTimeout(function () { copy.textContent = "Copy"; }, 1500);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () { fallback(); });
        } else { fallback(); }

        function fallback() {
          var ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
          document.body.removeChild(ta);
        }
      });
      wrap.appendChild(copy);
    });
  }

  /* ---------------- pager ---------------- */

  function pagerHtml(id) {
    var idx = flat.findIndex(function (f) { return f.id === id; });
    if (idx === -1) return "";
    var prev = idx > 0 ? flat[idx - 1] : null;
    var next = idx < flat.length - 1 ? flat[idx + 1] : null;

    function href(item) {
      return (item.type === "topic" ? "../topics/" : "../practicals/") + item.id + ".html";
    }

    var html = '<nav class="pager">';
    html += prev
      ? '<a class="pager-link prev" href="' + href(prev) + '"><span class="pager-dir">← Previous</span><span class="pager-title">' + prev.title + "</span></a>"
      : "<span></span>";
    html += next
      ? '<a class="pager-link next" href="' + href(next) + '"><span class="pager-dir">Next →</span><span class="pager-title">' + next.title + "</span></a>"
      : '<a class="pager-link next" href="../practicals/practical-01.html"><span class="pager-dir">Next →</span><span class="pager-title">Start the Practical Phase</span></a>';
    html += "</nav>";
    return html;
  }

  /* ---------------- topic renderer ---------------- */

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderTopic(topic) {
    var main = document.getElementById("main");
    if (!main || !topic) return;

    var meta = chapterOf[topic.id];
    var isPractical = topic.id.indexOf("practical") === 0;
    var title = (meta && meta.title) || topic.title;

    if (meta && !isPractical) title = topic.title; // topic titles are authoritative in the content file
    document.title = title + " — SQL Server DBA Roadmap";

    var eyebrow, crumb;
    if (isPractical && meta) {
      eyebrow = "Practical " + String(meta.num).padStart(2, "0");
      crumb = '<a href="../index.html">Home</a><span class="sep">/</span>' +
        '<a href="../index.html#practicals">Final Practical Phase</a><span class="sep">/</span><span>' + esc(title) + "</span>";
    } else if (meta) {
      eyebrow = "Chapter " + String(meta.num).padStart(2, "0") + " · " + meta.title;
      crumb = '<a href="../index.html">Home</a><span class="sep">/</span>' +
        '<a href="../topics/' + meta.topics[0].id + '.html">' + esc(meta.title) + "</a>" +
        '<span class="sep">/</span><span>' + esc(title) + "</span>";
    } else {
      crumb = '<a href="../index.html">Home</a><span class="sep">/</span><span>' + esc(title) + "</span>";
    }

    var html = "";

    html += '<nav class="breadcrumb">' + crumb + "</nav>";

    html += '<header class="topic-hero">' +
      '<span class="eyebrow">' + esc(eyebrow) + "</span>" +
      "<h1>" + esc(title) + "</h1>" +
      (topic.lead ? '<p class="lead">' + topic.lead + "</p>" : "") +
      '<div class="hero-meta">' +
      '<span class="chip">📖 ' + (topic.sections ? topic.sections.length : 0) + " sections</span>" +
      (topic.scenario ? '<span class="chip">🕐 Production scenario</span>' : "") +
      (topic.interview ? '<span class="chip">🎤 ' + topic.interview.length + " interview Q&amp;As</span>" : "") +
      '<button class="btn" id="markBtn" type="button"></button>' +
      "</div></header>";

    if (topic.objectives && topic.objectives.length) {
      html += '<section class="objectives"><h2>In this topic you will learn</h2><ul class="obj-list">' +
        topic.objectives.map(function (o) { return "<li>" + o + "</li>"; }).join("") +
        "</ul></section>";
    }

    html += '<div class="content">';
    (topic.sections || []).forEach(function (s) {
      html += "<section><h2>" + esc(s.h) + "</h2>" + s.html + "</section>";
    });

    if (topic.steps && topic.steps.length) {
      html += "<section><h2>Step-by-step exercise</h2><ol class=\"steps\">" +
        topic.steps.map(function (s) { return "<li>" + s + "</li>"; }).join("") +
        "</ol></section>";
    }
    html += "</div>";

    if (topic.scenario) {
      html += '<section class="callout scenario">' +
        '<div class="callout-label">🕐 Real-world production scenario</div>' +
        '<p class="scenario-title">' + esc(topic.scenario.title) + "</p>" +
        topic.scenario.html + "</section>";
    }

    if (topic.interview && topic.interview.length) {
      html += '<section class="callout interview">' +
        '<div class="callout-label">🎤 Interview questions you should be able to answer</div>' +
        topic.interview.map(function (i) {
          return '<div class="interview-item"><div class="interview-q">Q: ' + esc(i.q) + "</div>" +
            '<div class="interview-a">A: ' + i.a + "</div></div>";
        }).join("") + "</section>";
    }

    if (topic.takeaways && topic.takeaways.length) {
      html += '<section class="takeaways"><h2>🔑 Key takeaways</h2><ul>' +
        topic.takeaways.map(function (t) { return "<li>" + t + "</li>"; }).join("") +
        "</ul></section>";
    }

    html += pagerHtml(topic.id);

    main.innerHTML = html;
    wrapCode(main);
    wireMarkButton(topic.id);
    whenGlossaryReady(addTopicGlossary);
  }

  function escapeRegExp(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function glossaryMatchKey(g) {
    var m = String(g.term).match(/^(.*?)\s*\(([^)]+)\)$/);
    if (m && m[2].length > 3 && /[a-z]{4}/i.test(m[2])) return m[2];
    return String(g.term).replace(/\s*\(.*\)$/, "");
  }

  // Add a compact "terms used here" panel so unfamiliar vocabulary on any
  // lesson links straight to its plain-English breakdown in the glossary.
  function addTopicGlossary() {
    var main = document.getElementById("main");
    if (!main || !window.GLOSSARY || document.getElementById("topicGlossary")) return;

    var text = (main.textContent || "").toLowerCase();
    var matched = window.GLOSSARY.filter(function (g) {
      var key = glossaryMatchKey(g).toLowerCase();
      if (key.length < 4) return false;
      var re = new RegExp("\\b" + escapeRegExp(key).replace(/\s+/g, "\\s+") + "\\b", "i");
      return re.test(text);
    }).slice(0, 8);

    if (!matched.length) return;

    var html = '<section class="topic-glossary" id="topicGlossary">' +
      "<h2>🧠 Terms used in this topic</h2>" +
      "<p>New vocabulary here? Open any term for a plain-English definition, real syntax and implementation steps.</p>" +
      '<div class="tg-list">' + matched.map(function (g) {
        return '<a class="tg-item" href="' + rootPrefix() + "glossary.html#" + termSlug(g.term) + '">' +
          "<b>" + esc(g.term) + "</b><span>" + esc(g.short || "") + "</span></a>";
      }).join("") + "</div></section>";

    var pager = main.querySelector(".pager");
    if (pager) pager.insertAdjacentHTML("beforebegin", html);
    else main.insertAdjacentHTML("beforeend", html);
  }

  function wireMarkButton(id) {
    var btn = document.getElementById("markBtn");
    if (!btn) return;

    function paint() {
      var done = progress.has(id);
      btn.className = "btn" + (done ? " btn-done" : "");
      btn.textContent = done ? "✓ Completed — click to undo" : "Mark as completed";
    }

    btn.addEventListener("click", function () {
      if (progress.has(id)) progress.delete(id);
      else progress.add(id);
      save(LS.progress, Array.from(progress));
      paint();
      renderSidebar();
    });

    paint();
  }

  /* ---------------- home page ---------------- */

  function buildHome() {
    var grid = document.getElementById("chapterGrid");
    if (grid) {
      grid.innerHTML = ROADMAP.chapters.map(function (ch) {
        var done = ch.topics.filter(function (t) { return isDone(t.id); }).length;
        return '<a class="chapter-card" href="topics/' + ch.topics[0].id + '.html">' +
          '<div class="cover"><img src="assets/img/ch' + String(ch.num).padStart(2, "0") + '.svg" alt="" ' +
          'onerror="this.remove()"><span class="ch-num">Chapter ' + String(ch.num).padStart(2, "0") + "</span></div>" +
          '<div class="card-body"><h3>' + ch.title + "</h3><p>" + ch.blurb + "</p>" +
          '<div class="card-meta"><span>' + ch.topics.length + " topics" +
          (done ? " · " + done + " done" : "") + '</span><span class="go">Start →</span></div>' +
          "</div></a>";
      }).join("");
    }

    var pgrid = document.getElementById("practicalGrid");
    if (pgrid) {
      pgrid.innerHTML = ROADMAP.practicals.map(function (p) {
        return '<a class="chapter-card" href="practicals/' + p.id + '.html">' +
          '<div class="cover" style="background:linear-gradient(135deg,#059669,#0d9488)">' +
          '<span class="ch-num">Practical ' + String(p.num).padStart(2, "0") + "</span></div>" +
          '<div class="card-body"><h3>' + p.title + "</h3><p>" + p.blurb + "</p>" +
          '<div class="card-meta"><span>Hands-on lab</span><span class="go">Open →</span></div>' +
          "</div></a>";
      }).join("");
    }

    // stats
    function setStat(id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = val;
    }
    setStat("statChapters", ROADMAP.chapters.length);
    setStat("statTopics", ROADMAP.chapters.reduce(function (n, c) { return n + c.topics.length; }, 0));
    setStat("statPracticals", ROADMAP.practicals.length);
    setStat("statLessons", totalLessons);

    // resume button
    var resume = document.getElementById("resumeBtn");
    if (resume) {
      var next = flat.find(function (f) { return !isDone(f.id); });
      if (next) {
        resume.setAttribute("href", (next.type === "topic" ? "topics/" : "practicals/") + next.id + ".html");
        resume.textContent = progress.size ? "Resume: " + next.title : "Start learning";
      } else {
        resume.setAttribute("href", "topics/ch01-01.html");
        resume.textContent = "Review from Chapter 1";
      }
    }

    var doneBadge = document.getElementById("doneBadge");
    if (doneBadge) doneBadge.textContent = progress.size + " / " + totalLessons + " completed";
  }

  /* ---------------- glossary & command reference ---------------- */

  function glossaryEntryHtml(g) {
    var h = '<details class="glossary-entry" id="' + termSlug(g.term) + '"' +
      ' data-search="' + esc(String(g.term + " " + (g.say || "") + " " + (g.short || "") + " " +
        (g.what || "") + " " + (g.cat || "")).toLowerCase()) + '">' +
      '<summary>' +
      '<span class="g-term">' + esc(g.term) + "</span>" +
      (g.say ? '<span class="g-say">/ ' + esc(g.say) + ' /</span>' : "") +
      '<span class="g-short">' + esc(g.short || "") + "</span>" +
      '<span class="g-toggle">＋</span>' +
      "</summary>" +
      '<div class="g-body">';

    h += '<div class="g-block"><h4>What it is</h4><p>' + esc(g.what || "") + "</p></div>";

    if (g.why) {
      h += '<div class="g-block why"><h4>Why it matters</h4><p>' + esc(g.why) + "</p></div>";
    }

    if (g.syntax) {
      h += '<div class="g-block"><h4>Real syntax / example</h4>' +
        '<pre><code class="language-sql">' + esc(g.syntax) + "</code></pre></div>";
    }

    if (g.how && g.how.length) {
      h += '<div class="g-block"><h4>How to implement / use it</h4><ol>' +
        g.how.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") +
        "</ol></div>";
    }

    if (g.pitfalls && g.pitfalls.length) {
      h += '<div class="g-block pitfalls"><h4>Common mistakes to avoid</h4><ul>' +
        g.pitfalls.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") +
        "</ul></div>";
    }

    if (g.faq && g.faq.length) {
      h += '<div class="g-block"><h4>Frequently asked questions</h4>' +
        g.faq.map(function (f) {
          return '<div class="g-faq"><b>Q: ' + esc(f.q) + "</b><p>A: " + esc(f.a) + "</p></div>";
        }).join("") + "</div>";
    }

    if (g.see && g.see.length) {
      var links = g.see.map(function (sid) {
        var l = lookupLesson(sid);
        return l ? '<a href="' + l.href + '">' + esc(l.title) + "</a>" : "";
      }).filter(Boolean);
      if (links.length) {
        h += '<div class="g-block see"><h4>See it explained in the roadmap</h4>' +
          '<div class="g-links">' + links.join("") + "</div></div>";
      }
    }

    return h + "</div></details>";
  }

  function wireGlossary() {
    var filter = document.getElementById("glossaryFilter");
    var chips = Array.prototype.slice.call(document.querySelectorAll("#glossaryCats .cat-chip"));
    var groups = Array.prototype.slice.call(document.querySelectorAll(".glossary-group"));
    var entries = Array.prototype.slice.call(document.querySelectorAll(".glossary-entry"));
    var activeCat = "all";

    function applyFilter() {
      var q = (filter ? filter.value : "").trim().toLowerCase();
      entries.forEach(function (el) {
        var text = (el.getAttribute("data-search") || "") + " " + el.textContent.toLowerCase();
        var cat = el.closest(".glossary-group").getAttribute("data-cat");
        var show = (!q || text.indexOf(q) !== -1) && (activeCat === "all" || cat === activeCat);
        el.style.display = show ? "" : "none";
      });
      groups.forEach(function (g) {
        var visible = Array.prototype.some.call(g.querySelectorAll(".glossary-entry"), function (el) {
          return el.style.display !== "none";
        });
        g.style.display = visible ? "" : "none";
      });
    }

    if (filter) filter.addEventListener("input", applyFilter);

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeCat = chip.getAttribute("data-cat");
        chips.forEach(function (c) { c.classList.toggle("active", c === chip); });
        applyFilter();
      });
    });

    var expandAll = document.getElementById("glossaryExpandAll");
    var collapseAll = document.getElementById("glossaryCollapseAll");
    if (expandAll) expandAll.addEventListener("click", function () {
      entries.forEach(function (el) { el.open = true; });
    });
    if (collapseAll) collapseAll.addEventListener("click", function () {
      entries.forEach(function (el) { el.open = false; });
    });

    entries.forEach(function (el) {
      var t = el.querySelector(".g-toggle");
      if (t) t.textContent = el.open ? "−" : "＋";
      el.addEventListener("toggle", function () {
        if (t) t.textContent = el.open ? "−" : "＋";
      });
    });

    function openHash() {
      var id = (location.hash || "").replace(/^#/, "");
      if (!id) return;
      var el = document.getElementById(id);
      if (el && el.classList.contains("glossary-entry")) {
        activeCat = "all";
        chips.forEach(function (c) { c.classList.toggle("active", c.getAttribute("data-cat") === "all"); });
        if (filter) filter.value = "";
        applyFilter();
        el.open = true;
        // Wait for the <details> to lay out before scrolling to its position.
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        });
      }
    }

    openHash();
    window.addEventListener("hashchange", openHash);
  }

  function renderGlossary() {
    var main = document.getElementById("main");
    var terms = window.GLOSSARY || [];
    if (!main) return;
    document.title = "Glossary & Command Reference — SQL Server DBA Roadmap";

    var categories = [];
    terms.forEach(function (t) {
      if (categories.indexOf(t.cat) === -1) categories.push(t.cat);
    });

    var byCat = {};
    categories.forEach(function (c) {
      byCat[c] = terms.filter(function (t) { return t.cat === c; });
    });

    var html = '<nav class="breadcrumb"><a href="index.html">Home</a>' +
      '<span class="sep">/</span><span>Glossary &amp; Command Reference</span></nav>';

    html += '<header class="topic-hero glossary-hero">' +
      '<span class="eyebrow">Quick reference · ' + terms.length + " entries</span>" +
      "<h1>Glossary &amp; Command Reference</h1>" +
      '<p class="lead">Plain-English explanations of every term and command on this roadmap. ' +
      "Each entry answers four questions: <strong>what it is</strong>, <strong>why it matters</strong>, " +
      "<strong>how to use it</strong> with real T-SQL or PowerShell, and <strong>what goes wrong</strong>. " +
      "Start with the highlighted <strong>DBCC CHECKDB</strong> entry — it is the most common " +
      "“what is that?” question for new DBAs.</p>" +
      '<div class="hero-meta">' +
      "<span class=\"chip\">📚 " + categories.length + " categories</span>" +
      '<span class="chip">🧪 Real syntax examples</span>' +
      '<span class="chip">🔗 Links back to lessons</span>' +
      "</div></header>";

    var spotlight = terms.find(function (t) { return termSlug(t.term) === "dbcc-checkdb"; });
    if (spotlight) {
      html += '<section class="glossary-spotlight">' +
        '<div class="callout-label">⭐ Start here · DBCC CHECKDB explained</div>' +
        "<h2>What is DBCC CHECKDB?</h2>" +
        "<p><strong>" + esc(spotlight.short) + "</strong></p>" +
        "<p>" + esc(spotlight.what) + "</p>" +
        '<a class="btn btn-primary" href="#dbcc-checkdb">Read the full entry →</a>' +
        "</section>";
    }

    html += '<section class="glossary-toolbar">' +
      '<label class="glossary-search"><span>Filter entries</span>' +
      '<input type="search" id="glossaryFilter" placeholder="Type a term, command or concept…" autocomplete="off">' +
      "</label>" +
      '<div class="glossary-actions">' +
      '<button class="btn" id="glossaryExpandAll" type="button">Expand all</button>' +
      '<button class="btn" id="glossaryCollapseAll" type="button">Collapse all</button>' +
      "</div>" +
      '<div class="glossary-cats" id="glossaryCats">' +
      '<button class="cat-chip active" data-cat="all" type="button">All (' + terms.length + ")</button>" +
      categories.map(function (c) {
        return '<button class="cat-chip" data-cat="' + esc(c) + '" type="button">' +
          esc(c) + " (" + byCat[c].length + ")";
      }).join("") +
      "</div></section>";

    categories.forEach(function (cat) {
      html += '<section class="glossary-group" data-cat="' + esc(cat) + '">' +
        "<h2>" + esc(cat) + ' <span class="group-count">' + byCat[cat].length + " entries</span></h2>" +
        '<div class="glossary-list">';
      byCat[cat].forEach(function (g) { html += glossaryEntryHtml(g); });
      html += "</div></section>";
    });

    html += '<section class="callout glossary-help">' +
      '<div class="callout-label">🧭 How to use this reference</div>' +
      "<p>Open an entry to see the full explanation, copy a syntax example into SSMS, and follow the " +
      "“See it explained in the roadmap” links for a complete lesson with diagrams and a production scenario. " +
      "Use the filter box to search across all terms — for example type <code>checkdb</code>, " +
      "<code>backup</code>, <code>lock</code> or <code>restore</code>.</p>" +
      "<p>New to a term? Read <strong>What it is</strong> first, then <strong>Why it matters</strong>, " +
      "then <strong>How to implement / use it</strong>. Finish with <strong>Common mistakes to avoid</strong> " +
      "so you recognise the failure mode before you meet it in production.</p>" +
      "</section>";

    main.innerHTML = html;
    wrapCode(main);
    wireGlossary();
  }

  function injectGlossaryLink() {
    var bar = document.querySelector(".topbar");
    if (!bar || bar.querySelector(".topbar-link")) return;
    var link = document.createElement("a");
    link.className = "topbar-link";
    link.href = rootPrefix() + "glossary.html";
    link.textContent = "Glossary";
    link.title = "Glossary & Command Reference";
    var search = bar.querySelector(".search");
    if (search) bar.insertBefore(link, search);
    else bar.appendChild(link);
  }

  // Load the glossary data on ordinary lesson pages so the global search can
  // find terms as well as lessons. The glossary page already loads it inline.
  function loadGlossaryData() {
    if (window.GLOSSARY || pageKind() === "glossary") return;
    var parts = [1, 2, 3, 4];
    (function next(i) {
      if (i >= parts.length) return;
      var tag = document.createElement("script");
      tag.src = rootPrefix() + "assets/js/glossary-" + parts[i] + ".js";
      tag.onload = function () {
        if (i === parts.length - 1) {
          glossaryQueue.splice(0).forEach(function (fn) { fn(); });
        }
        next(i + 1);
      };
      tag.onerror = function () { next(i + 1); };
      document.head.appendChild(tag);
    })(0);
  }

  /* ---------------- boot ---------------- */

  initTheme();
  renderSidebar();
  buildSearch();
  initMobileNav();
  injectGlossaryLink();
  loadGlossaryData();

  var page = pageKind();

  if (page === "topic" && window.TOPIC) {
    renderTopic(window.TOPIC);
  } else if (page === "glossary") {
    renderGlossary();
  } else if (page === "home") {
    buildHome();
  }

  // Home-page sidebar links need no "../" prefix; fix them up.
  if (page === "home") {
    document.querySelectorAll("#sidebar a, #searchResults a").forEach(function (a) {
      a.setAttribute("href", a.getAttribute("href").replace(/^\.\.\//, ""));
    });
  }
})();
