// METmatch | Housing Opportunity Intelligence
// Preserves original Impact Score system & readability + unified Institution Programs

const $ = (id) => document.getElementById(id);

let selectedCaseId = "sonoma-lake";
let searchQuery = "";
let sortBy = "impact"; // "impact" | "affordability" | "access"
let filterAxis = "all";
let filterUrbanicity = "all";
let filterRegime = "all";
let showAllCards = false;
let currentTab = "matching"; // "matching" | "peers" | "score"

let pinnedIds = [];
let dismissedIds = [];
let lastAction = null; // { type: 'dismiss'|'pin'|'unpin'|'delete-prog', ... }
let aiUploadStatus = "";

// Unified program list (no visual separation between initial and newly added programs)
let programs = INITIAL_PROGRAMS.map(p => ({ ...p }));

function esc(str) {
  if (typeof str !== "string") return str ?? "";
  return str.replace(/[&<>'"]/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c] || c
  ));
}

function getTierLabel(scoreVal) {
  if (scoreVal >= 4.5) return "High Fit";
  if (scoreVal >= 3.5) return "Strong Fit";
  if (scoreVal >= 2.5) return "Conditional";
  if (scoreVal >= 1.5) return "Critical Constraint";
  return "Low Fit";
}

function evaluateCase(c) {
  const activePrograms = programs.filter(p => p.active);
  const results = c.factors.map(f => {
    const matched = activePrograms.find(p => p.tags.includes(f.required_tag));
    return {
      factor: f,
      matchedProgram: matched || null
    };
  });

  const solved = results.filter(r => r.matchedProgram).length;
  const total = results.length;
  const coverageRatio = total > 0 ? solved / total : 0;

  // 0.5-step additive rating (1.0 to 5.0) for Toolkit & Program Alignment
  const alignmentRating = Math.max(1.0, Math.round((1 + 4 * coverageRatio) * 2) / 2);

  const ratings = {
    potential: c.base_ratings.potential,
    alignment: alignmentRating,
    capacity: c.base_ratings.capacity,
    feasibility: c.base_ratings.feasibility,
    evidence: c.base_ratings.evidence
  };

  // Weighted 0-100 Impact Match Score
  const impactScore = Math.round(
    SCORE_RUBRIC_FACTORS.reduce((sum, rf) => {
      return sum + (ratings[rf.key] / 5) * rf.weight;
    }, 0)
  );

  return {
    solved,
    total,
    allSolved: solved === total,
    ratings,
    impactScore,
    results
  };
}

function getFilteredAndSortedCases() {
  const q = searchQuery.trim().toLowerCase();

  const matching = CASES.filter(c => {
    if (dismissedIds.includes(c.id)) return false;
    if (filterUrbanicity !== "all" && c.urbanicity !== filterUrbanicity) return false;
    if (filterRegime !== "all" && c.market_regime !== filterRegime) return false;

    if (q) {
      const haystack = [
        c.target,
        c.reference,
        c.category_tag,
        c.factor_preview,
        c.summary,
        ...c.factors.map(f => `${f.title} ${f.why} ${f.local_program}`)
      ].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return matching.sort((a, b) => {
    const aPinned = pinnedIds.includes(a.id) ? 1 : 0;
    const bPinned = pinnedIds.includes(b.id) ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;

    if (sortBy === "affordability") {
      const aGap = a.aff_score - a.peer_aff_score;
      const bGap = b.aff_score - b.peer_aff_score;
      return bGap - aGap;
    }
    if (sortBy === "access") {
      const aGap = a.acc_score - a.peer_acc_score;
      const bGap = b.acc_score - b.peer_acc_score;
      return bGap - aGap;
    }
    return evaluateCase(b).impactScore - evaluateCase(a).impactScore;
  });
}

function togglePinCase(id, e) {
  if (e) e.stopPropagation();
  const c = CASES.find(x => x.id === id);
  if (!c) return;

  if (pinnedIds.includes(id)) {
    pinnedIds = pinnedIds.filter(x => x !== id);
  } else {
    pinnedIds.push(id);
  }
  renderAll();
}

function dismissCase(id, e) {
  if (e) e.stopPropagation();
  const c = CASES.find(x => x.id === id);
  if (!c) return;

  const wasPinned = pinnedIds.includes(id);
  pinnedIds = pinnedIds.filter(x => x !== id);
  dismissedIds.push(id);

  lastAction = {
    type: "dismiss",
    id,
    wasPinned,
    label: `Deleted ${c.target} vs. ${c.reference}`
  };

  const remaining = getFilteredAndSortedCases();
  if (selectedCaseId === id && remaining.length > 0) {
    selectedCaseId = remaining[0].id;
  }
  renderAll();
}

function undoLastAction() {
  if (!lastAction) return;
  if (lastAction.type === "dismiss") {
    dismissedIds = dismissedIds.filter(id => id !== lastAction.id);
    if (lastAction.wasPinned && !pinnedIds.includes(lastAction.id)) {
      pinnedIds.push(lastAction.id);
    }
    selectedCaseId = lastAction.id;
  } else if (lastAction.type === "delete-prog") {
    programs.splice(lastAction.index, 0, lastAction.program);
  }
  lastAction = null;
  renderAll();
}

function closeUndoToast() {
  lastAction = null;
  renderStatusAndToast();
  if (!$("toolkit").hidden) renderToolkit();
}

function toggleShowAllCards() {
  showAllCards = !showAllCards;
  renderCards();
}

function selectCase(id) {
  selectedCaseId = id;
  renderAll();
}

function switchTab(tab) {
  currentTab = tab;
  renderDetail();
}

function openScoreJustification(id, e) {
  if (e) e.stopPropagation();
  selectedCaseId = id;
  currentTab = "score";
  renderAll();
  const detailEl = $("detail");
  if (detailEl) detailEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetAllFilters() {
  searchQuery = "";
  sortBy = "impact";
  filterUrbanicity = "all";
  filterRegime = "all";
  $("search-input").value = "";
  $("sort-select").value = "impact";
  $("filter-urbanicity").value = "all";
  $("filter-regime").value = "all";
  renderAll();
}

function renderStatusAndToast() {
  const activeCount = programs.filter(p => p.active).length;
  $("program-count-pill").textContent = `${activeCount}`;

  const toast = $("undo-toast");
  if (lastAction) {
    toast.hidden = false;
    toast.innerHTML = `
      <span>${esc(lastAction.label)}</span>
      <div class="toast-btns">
        <button type="button" class="btn-undo" onclick="undoLastAction()">Undo</button>
        <button type="button" class="btn-close-toast" onclick="closeUndoToast()">Close</button>
      </div>
    `;
  } else {
    toast.hidden = true;
    toast.innerHTML = "";
  }
}

function renderCards() {
  const container = $("cards");
  const expandWrap = $("expand-wrap");
  const allMatching = getFilteredAndSortedCases();

  if (allMatching.length === 0) {
    container.innerHTML = `
      <div class="empty-box">
        <p>No peer communities match your current search or filter settings.</p>
        <button type="button" onclick="resetAllFilters()">Reset Search &amp; Filters</button>
      </div>
    `;
    expandWrap.innerHTML = "";
    return;
  }

  const visible = showAllCards ? allMatching : allMatching.slice(0, 4);

  if (!visible.some(c => c.id === selectedCaseId)) {
    selectedCaseId = visible[0].id;
  }

  container.innerHTML = visible.map((c) => {
    const isSel = c.id === selectedCaseId;
    const isPinned = pinnedIds.includes(c.id);
    const ev = evaluateCase(c);
    const affGap = (c.aff_score - c.peer_aff_score).toFixed(1);
    const accGap = (c.acc_score - c.peer_acc_score).toFixed(1);

    return `
      <article
        class="card ${isSel ? "active" : ""} ${isPinned ? "card-pinned" : ""}"
        onclick="selectCase('${c.id}')"
        role="button"
        tabindex="0"
        aria-pressed="${isSel}"
      >
        <div class="card-top">
          <div class="eyebrow">${esc(c.category_tag)}</div>
          <div class="card-actions">
            <button
              type="button"
              class="card-icon-btn ${isPinned ? "act-pinned" : ""}"
              onclick="togglePinCase('${c.id}', event)"
              title="${isPinned ? "Unpin card" : "Pin card to front"}"
              aria-label="${isPinned ? "Unpin card" : "Pin card"}"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="${isPinned ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true">
                <path d="M8 3H16V5L14.5 6.5V11L17 13.5V15.5H13V21L12 22L11 21V15.5H7V13.5L9.5 11V6.5L8 5Z"/>
              </svg>
            </button>
            <button
              type="button"
              class="card-icon-btn act-dismiss"
              onclick="dismissCase('${c.id}', event)"
              title="Dismiss card"
              aria-label="Dismiss card"
            >&times;</button>
          </div>
        </div>

        <h3>${esc(c.target)}</h3>
        <div class="state">vs. peer ${esc(c.reference)}</div>

        <div class="card-hero-row">
          <div class="score">
            ${ev.impactScore}
            <small>
              / 100
              <span
                class="score-help"
                tabindex="0"
                onclick="openScoreJustification('${c.id}', event)"
                aria-label="What is Impact Score?"
              >?<span class="score-tooltip" role="tooltip">This score represents how well your programs match the most significant divergence factors. Click for more details.</span></span>
            </small>
          </div>
          <span class="badge ${ev.allSolved ? "badge-ok" : "amber"}">
            ${ev.solved}/${ev.total} factors matched
          </span>
        </div>

        <div class="card-rank-scores">
          Affordability gap: <strong>+${affGap} pts</strong> &middot; Access gap: <strong>+${accGap} pts</strong>
        </div>

        <div class="desc">${esc(c.factor_preview)}</div>
      </article>
    `;
  }).join("");

  if (allMatching.length > 4) {
    const hiddenCount = allMatching.length - 4;
    expandWrap.innerHTML = `
      <button type="button" class="btn-expand" onclick="toggleShowAllCards()">
        ${showAllCards
          ? "Show Top 4 Opportunities Only"
          : `Show All ${allMatching.length} Opportunities (+${hiddenCount} more)`}
      </button>
    `;
  } else {
    expandWrap.innerHTML = "";
  }
}

function quickAddTemplateProgram(templateKey) {
  const tpl = AI_UPLOAD_TEMPLATES[templateKey];
  if (!tpl) return;

  const existing = programs.find(p => p.tags.includes(tpl.tag));
  if (existing) {
    existing.active = true;
  } else {
    programs.push({
      id: "prog-" + Date.now(),
      name: tpl.name,
      active: true,
      tags: [tpl.tag],
      desc: tpl.desc
    });
  }
  renderAll();
}

function renderDetail() {
  const container = $("detail");
  const c = CASES.find(x => x.id === selectedCaseId);
  if (!c) {
    container.innerHTML = "";
    return;
  }

  const ev = evaluateCase(c);

  let panelHTML = "";

  if (currentTab === "matching") {
    panelHTML = `
      <div class="match-head-note">
        <div>
          <h3>Factor &amp; Program Matching</h3>
          <p class="body">Each local divergence factor identified between <strong>${esc(c.target)}</strong> and <strong>${esc(c.reference)}</strong> is paired with active programs from your catalog.</p>
        </div>
        <button type="button" onclick="openProgramsView()">Manage Institution Programs (${programs.filter(p => p.active).length})</button>
      </div>

      <div class="match-grid-head">
        <div>Divergence Factors</div>
        <div>Matched Institutional Programming</div>
      </div>

      ${ev.results.map(r => {
        const f = r.factor;
        const m = r.matchedProgram;
        const tpl = AI_UPLOAD_TEMPLATES[f.suggested_template];
        return `
          <div class="match-row ${m ? "row-solved" : "row-unsolved"}">
            <div class="col-factor">
              <h4>${esc(f.title)}</h4>
              <span class="badge">${esc(f.metrics)}</span>
              <p class="body">${esc(f.why)}</p>
            </div>

            <div class="col-prog">
              ${m ? `
                <div class="eyebrow">MATCHED PROGRAM</div>
                <h4>${esc(m.name)}</h4>
                <p class="body">${esc(f.action)}</p>
              ` : `
                <div class="eyebrow eyebrow-amber">UNMATCHED FACTOR</div>
                <h4>No Active Program Matched</h4>
                <p class="body">Current active programs do not directly solve this barrier.</p>
                ${tpl ? `
                  <button type="button" class="btn-inline-add" onclick="quickAddTemplateProgram('${f.suggested_template}')">
                    + Add "${esc(tpl.name)}"
                  </button>
                ` : `
                  <button type="button" class="btn-inline-add" onclick="openProgramsView()">
                    + Add Program in Catalog
                  </button>
                `}
              `}
            </div>
          </div>
        `;
      }).join("")}
    `;
  } else if (currentTab === "peers") {
    panelHTML = `
      <h3>${esc(c.category_tag)} · Peer Group Comparison</h3>
      <p class="body">
        Counties are grouped by baseline socioeconomic similarity (median income, population scale, and area type) so outcome differences reflect local housing and lending conditions. Higher burden scores (0–100 percentile) indicate worse outcomes.
      </p>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Community</th>
              <th>Area Type</th>
              <th>Population (Median Income)</th>
              <th>Affordability Burden</th>
              <th>Access Burden</th>
              <th>Home Value (Price/Income)</th>
              <th>Purchase Denials</th>
              <th>Affordable Units / LMI HH</th>
            </tr>
          </thead>
          <tbody>
            ${c.peers.map(p => {
              const isTarget = p.name === c.target;
              const isRef = p.name === c.reference;
              return `
                <tr class="${isTarget ? "target" : (isRef ? "ref-row" : "")}">
                  <td>
                    ${isTarget ? `<div class="row-tag-line"><span class="row-badge badge-target">TARGET</span></div>` : ""}
                    ${isRef ? `<div class="row-tag-line"><span class="row-badge badge-ref">PEER BENCHMARK</span></div>` : ""}
                    <div>${esc(p.name)}</div>
                  </td>
                  <td>${esc(p.form)}</td>
                  <td>${esc(p.pop)}</td>
                  <td>${p.aff}</td>
                  <td>${p.acc}</td>
                  <td>${esc(p.value)}</td>
                  <td>${p.denial}%</td>
                  <td>${p.units}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
      <div class="callout" style="margin-top:16px;">
        <strong>Scorecard Definitions:</strong> Affordability Burden combines price-to-income (75%) and rent-to-income (25%) national percentiles. Access Burden combines affordable units per LMI household (50%) and HMDA purchase mortgage denial rate (50%).
      </div>
    `;
  } else if (currentTab === "score") {
    panelHTML = `
      <div class="two-col">
        <div>
          <h3>Five-Dimension Impact Score Breakdown</h3>
          <p class="body">
            Each opportunity starts at a <strong>1.0 base</strong> per dimension and earns <strong>+1.0</strong> (full pass) or <strong>+0.5</strong> (partial/constrained pass) across four concrete sub-measures (20% weight each, up to 20 points per dimension). Unmet sub-measures receive <strong>+0.0</strong>.
          </p>

          ${SCORE_RUBRIC_FACTORS.map(rf => {
            const val = ev.ratings[rf.key];
            const tierLabel = getTierLabel(val);
            const note = rf.key === "alignment"
              ? `${ev.solved} of ${ev.total} identified local divergence factors are matched to an active program in your catalog. ${c.rubric_notes.alignment}`
              : c.rubric_notes[rf.key];

            const alignEarned = (val - 1).toFixed(1);
            const tags = rf.key === "alignment"
              ? [
                  `+${alignEarned} Active Catalog Coverage (${ev.solved}/${ev.total} Factors Matched)`,
                  ev.allSolved
                    ? "Full Divergence Coverage"
                    : `+0.0 Unmatched Divergence Factor (${ev.total - ev.solved} Open Gap)`
                ]
              : ((c.rubric_tags && c.rubric_tags[rf.key]) || []);

            return `
              <div class="factor">
                <div class="factor-title">
                  <span>${esc(rf.name)}</span>
                  <strong>${val.toFixed(1)} / 5.0 &middot; ${esc(tierLabel)} &middot; ${rf.weight}% weight</strong>
                </div>
                <div class="factor-rule">${esc(rf.rule)}</div>
                <div class="track"><i style="width:${val * 20}%"></i></div>
                ${tags.length > 0 ? `
                  <div class="submeasure-pills">
                    ${tags.map(t => {
                      const isZero = t.startsWith("+0.0");
                      return `<span class="submeasure-pill ${isZero ? "pill-zero" : ""}">${esc(t)}</span>`;
                    }).join("")}
                  </div>
                ` : ""}
                <p>${esc(note)}</p>
              </div>
            `;
          }).join("")}
        </div>

        <div>
          <div class="callout">
            <strong>Impact Score: ${ev.impactScore} / 100 (${ev.solved}/${ev.total} factors matched)</strong><br>
            All five dimensions are weighted equally at 20% (up to 20 points per dimension). Adding or enabling a program that solves an open divergence factor automatically raises <strong>Toolkit &amp; Program Alignment</strong> and updates the overall score.
          </div>

          <h3>1–5 Rating Scale Reference</h3>
          <div class="rating-scale-list">
            ${RATING_SCALE_KEY.map(item => `
              <div class="rating-scale-row">
                <span class="rs-tier">${esc(item.tier)} &middot; ${esc(item.label)}</span>
                <span class="rs-desc">${esc(item.desc)}</span>
              </div>
            `).join("")}
          </div>

          <h3 style="margin-top:20px;">Primary Evidence &amp; Sources</h3>
          ${(c.sources || []).map(k => {
            const s = SOURCES[k];
            if (!s) return "";
            return `
              <div class="source">
                <a href="${s[1]}" target="_blank" rel="noopener">${esc(s[0])} &nearr;</a><br>
                ${esc(s[2])}
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <section class="detail">
      <div class="detail-head">
        <div>
          <div class="eyebrow">SELECTED OPPORTUNITY &middot; ${esc(c.category_tag.toUpperCase())}</div>
          <h2>${esc(c.target)} <span class="detail-peer-sub">vs. ${esc(c.reference)}</span></h2>
          <p>${esc(c.summary)}</p>
        </div>
        <div class="detail-score-box">
          <div class="score">${ev.impactScore}<small> / 100</small></div>
          <span class="badge ${ev.allSolved ? "badge-ok" : "amber"}">${ev.solved}/${ev.total} Factors Matched</span>
        </div>
      </div>

      <div class="tabs">
        <button type="button" class="${currentTab === "matching" ? "active" : ""}" onclick="switchTab('matching')">
          Factor &amp; Program Matching (${ev.solved}/${ev.total})
        </button>
        <button type="button" class="${currentTab === "peers" ? "active" : ""}" onclick="switchTab('peers')">
          Peer Comparison
        </button>
        <button type="button" class="${currentTab === "score" ? "active" : ""}" onclick="switchTab('score')">
          Impact Score Justification
        </button>
      </div>

      <div class="panel">
        ${panelHTML}
      </div>
    </section>
  `;
}

function openProgramsView() {
  document.querySelectorAll("[data-view]").forEach(b => {
    b.classList.toggle("active", b.dataset.view === "toolkit");
  });
  $("matches").hidden = true;
  $("toolkit").hidden = false;
  renderToolkit();
}

function toggleProgramActive(id) {
  const p = programs.find(x => x.id === id);
  if (p) {
    p.active = !p.active;
    renderAll();
  }
}

function deleteProgram(id, e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const idx = programs.findIndex(x => x.id === id);
  if (idx === -1) return;
  const [removed] = programs.splice(idx, 1);
  lastAction = {
    type: "delete-prog",
    program: removed,
    index: idx,
    label: `Deleted program "${removed.name}"`
  };
  renderAll();
}

function addProgramFromForm(e) {
  e.preventDefault();
  const name = $("prog-name").value.trim();
  const tag = $("prog-tag").value;
  const desc = $("prog-desc").value.trim();
  if (!name) return;

  programs.push({
    id: "prog-" + Date.now(),
    name,
    active: true,
    tags: [tag],
    desc: desc || "Institution program configured for local divergence factor matching."
  });

  $("prog-name").value = "";
  $("prog-desc").value = "";
  aiUploadStatus = "";
  renderAll();
}

function fillFromTemplate(key) {
  const tpl = AI_UPLOAD_TEMPLATES[key];
  if (!tpl) return;
  $("prog-name").value = tpl.name;
  $("prog-tag").value = tpl.tag;
  $("prog-desc").value = tpl.desc;
  aiUploadStatus = `AI extracted program details from "${tpl.fileName}" — review and click Add Program.`;
  const statusEl = $("ai-upload-status");
  if (statusEl) {
    statusEl.hidden = false;
    statusEl.textContent = aiUploadStatus;
  }
}

function handleDocumentUpload(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const fname = file.name.toLowerCase();

  let tpl = AI_UPLOAD_TEMPLATES.workforce_adu;
  if (fname.includes("roof") || fname.includes("flood") || fname.includes("lafayette") || fname.includes("insur")) {
    tpl = AI_UPLOAD_TEMPLATES.roof_bridge;
  } else if (fname.includes("small") || fname.includes("casita") || fname.includes("rehab")) {
    tpl = AI_UPLOAD_TEMPLATES.small_dollar;
  }

  $("prog-name").value = tpl.name;
  $("prog-tag").value = tpl.tag;
  $("prog-desc").value = tpl.desc;
  aiUploadStatus = `AI parsed "${file.name}" and auto-filled program parameters below.`;
  const statusEl = $("ai-upload-status");
  if (statusEl) {
    statusEl.hidden = false;
    statusEl.textContent = aiUploadStatus;
  }
}

function renderToolkit() {
  const container = $("toolkit");

  const tagLabels = {
    "supply-lihtc": "Multifamily Supply & LIHTC Preservation",
    "infill-dev": "Infill Development",
    "cdfi-predev": "CDFI Pre-Development & Rehab Credit",
    "rehab-credit": "Rehabilitation Credit",
    "dpa-grant": "Down-Payment & Closing Grant",
    "low-downpayment": "Low Down-Payment Mortgage",
    "credit-readiness": "Credit Readiness",
    "borrower-retention": "Borrower Hardship & Retention",
    "workforce-adu": "Workforce Down-Payment & ADU Infill",
    "flood-insurance-dti": "Flood/Roof Grant Bridge & DTI Relief",
    "small-dollar-rehab": "Small-Dollar Starter & Casita Rehab (<$150k)"
  };

  container.innerHTML = `
    <div class="workspace-head" style="margin-bottom:18px;">
      <div>
        <div class="eyebrow">INSTITUTION CAPABILITIES</div>
        <h2>Institution Programs</h2>
        <p>Manage active lending, grant, and tax-credit programs used to match community divergence factors.</p>
      </div>
      <button type="button" onclick="document.querySelector('[data-view=matches]').click()">
        Back to Community Matches
      </button>
    </div>

    ${lastAction ? `
      <div class="undo-toast" style="margin-bottom:16px;">
        <span>${esc(lastAction.label)}</span>
        <div class="toast-btns">
          <button type="button" class="btn-undo" onclick="undoLastAction()">Undo</button>
          <button type="button" class="btn-close-toast" onclick="closeUndoToast()">Close</button>
        </div>
      </div>
    ` : ""}

    <div class="programs-layout">
      <div>
        <h3 style="margin-top:0;">Program Catalog (${programs.length})</h3>
        <div class="program-list">
          ${programs.map(p => {
            const primaryTag = p.tags[0];
            const tagLabel = tagLabels[primaryTag] || primaryTag;
            return `
              <article class="tool-card ${p.active ? "" : "tool-inactive"}">
                <div class="tool-card-top">
                  <label class="tool-check-label">
                    <input type="checkbox" ${p.active ? "checked" : ""} onchange="toggleProgramActive('${p.id}')">
                    <strong>${esc(p.name)}</strong>
                  </label>
                  <div class="tool-card-actions">
                    <span class="badge">${esc(tagLabel)}</span>
                    <button type="button" class="card-act-btn act-dismiss" onclick="deleteProgram('${p.id}', event)">Delete</button>
                  </div>
                </div>
                <p>${esc(p.desc)}</p>
                ${p.sourceKey && SOURCES[p.sourceKey] ? `
                  <a href="${SOURCES[p.sourceKey][1]}" target="_blank" rel="noopener" class="source-link">Official program source &nearr;</a>
                ` : ""}
              </article>
            `;
          }).join("")}
        </div>
      </div>

      <div class="add-program-panel">
        <div class="eyebrow">ADD PROGRAM</div>
        <h3>Add Program to Catalog</h3>
        <p class="small">Enter program details manually or upload a program term sheet / guideline PDF to auto-fill with AI.</p>

        <div class="upload-box">
          <label class="upload-label" for="doc-upload">
            <strong>Upload Program Document (Optional AI Auto-Fill)</strong>
            <span>Drop a PDF, DOCX, or TXT guideline file to extract program fields</span>
            <input id="doc-upload" type="file" accept=".pdf,.doc,.docx,.txt" onchange="handleDocumentUpload(this)">
          </label>
          <div class="sample-docs">
            <span>Or test with a sample spec sheet:</span>
            <div class="sample-pills">
              <button type="button" class="btn-sample" onclick="fillFromTemplate('workforce_adu')">Workforce_ADU_Spec.pdf</button>
              <button type="button" class="btn-sample" onclick="fillFromTemplate('roof_bridge')">Roof_Grant_Bridge.pdf</button>
              <button type="button" class="btn-sample" onclick="fillFromTemplate('small_dollar')">Small_Dollar_Rehab.pdf</button>
            </div>
          </div>
          <div id="ai-upload-status" class="ai-status" ${aiUploadStatus ? "" : "hidden"}>${esc(aiUploadStatus)}</div>
        </div>

        <form onsubmit="addProgramFromForm(event)" class="prog-form">
          <label>
            Program Name
            <input type="text" id="prog-name" placeholder="e.g., Workforce Down-Payment & Backyard ADU Loan" required>
          </label>

          <label>
            Primary Divergence Barrier Addressed
            <select id="prog-tag">
              <option value="workforce-adu">Workforce Lockout &amp; Prop 13 / ADU Infill (Sonoma)</option>
              <option value="flood-insurance-dti">Flood Insurance DTI Spike &amp; Roof Rehab (Lafayette)</option>
              <option value="small-dollar-rehab">Small-Dollar Casita &amp; Starter Rehab &lt;$150k (Bernalillo)</option>
              <option value="dpa-grant">Upfront Down-Payment &amp; Closing Cash Hurdle (Bucks / Jefferson)</option>
              <option value="supply-lihtc">Multifamily Supply &amp; LIHTC Preservation</option>
              <option value="cdfi-predev">CDFI Pre-Development &amp; Starter Rehab Credit</option>
            </select>
          </label>

          <label>
            Program Description &amp; Terms
            <textarea id="prog-desc" rows="3" placeholder="Describe eligibility, loan/grant structure, and how it pairs with local subsidies..."></textarea>
          </label>

          <button type="submit" class="btn-primary-add">Add Program</button>
        </form>
      </div>
    </div>
  `;
}

function renderAll() {
  renderStatusAndToast();
  renderCards();
  renderDetail();
  if (!$("toolkit").hidden) renderToolkit();
}

// Navigation
document.querySelectorAll("[data-view]").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll("[data-view]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const v = btn.dataset.view;
    $("matches").hidden = v !== "matches";
    $("toolkit").hidden = v !== "toolkit";
    if (v === "toolkit") renderToolkit();
  };
});

// Search & Sort
$("search-input").oninput = e => {
  searchQuery = e.target.value;
  renderCards();
  renderDetail();
};

$("sort-select").onchange = e => {
  sortBy = e.target.value;
  renderCards();
};

// Filters
$("filter-urbanicity").onchange = e => {
  filterUrbanicity = e.target.value;
  renderAll();
};

$("filter-regime").onchange = e => {
  filterRegime = e.target.value;
  renderAll();
};

renderAll();
