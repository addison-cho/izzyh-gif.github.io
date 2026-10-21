// Common Ground | PNC Housing Opportunity & AI Toolkit Matcher
// Enterprise UI logic (Zero emojis, explicit Target vs. Benchmark hierarchy)

const $ = (id) => document.getElementById(id);

let selectedCaseId = "sonoma-lake";
let filterAxis = "all";
let filterUrbanicity = "all";
let filterRegime = "core";
let currentTab = "matcher";

let dismissedIds = [];
let lastDismissed = null;

let tools = PNC_TOOLS.map(t => ({ ...t }));

function esc(str) {
  if (typeof str !== "string") return str ?? "";
  return str.replace(/[&<>'"]/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c] || c
  ));
}

function evaluateCase(c) {
  const activeTools = tools.filter(t => t.active);
  const results = c.factors.map(f => {
    const matched = activeTools.find(t => t.tags.includes(f.required_tag));
    const suggestedCustom =
      tools.find(t => t.id === f.suggested_custom_id || t.tags.includes(f.required_tag)) ||
      SUGGESTED_CUSTOM_TOOLS.find(t => t.id === f.suggested_custom_id || t.tags.includes(f.required_tag));
    return {
      factor: f,
      matchedTool: matched || null,
      suggestedTool: suggestedCustom || null
    };
  });
  const solved = results.filter(r => r.matchedTool).length;
  return { solved, total: results.length, allSolved: solved === results.length, results };
}

function getActivePoolAndQueue() {
  const primaryCases = CASES.filter(c => !c.is_backup);
  const backupCases = CASES.filter(c => c.is_backup);

  // Only promote backup queue clusters when primary core clusters have been explicitly dismissed
  const dismissedPrimaryCoreCount = primaryCases.filter(
    c => c.market_regime === "core" && dismissedIds.includes(c.id)
  ).length;

  const availableBackups = backupCases.filter(b => !dismissedIds.includes(b.id));
  const promotedBackups = availableBackups.slice(0, dismissedPrimaryCoreCount);
  const remainingQueue = availableBackups.slice(dismissedPrimaryCoreCount);

  const activePool = [
    ...primaryCases.filter(c => !dismissedIds.includes(c.id)),
    ...promotedBackups
  ];

  const visible = activePool.filter(c => {
    if (filterRegime !== "all" && c.market_regime !== filterRegime) return false;
    if (filterAxis !== "all" && c.divergence_axis !== filterAxis) return false;
    if (filterUrbanicity !== "all" && c.urbanicity !== filterUrbanicity) return false;
    return true;
  }).slice(0, 4);

  const matchingQueue = remainingQueue.filter(c => {
    if (filterRegime !== "all" && c.market_regime !== filterRegime) return false;
    if (filterAxis !== "all" && c.divergence_axis !== filterAxis) return false;
    if (filterUrbanicity !== "all" && c.urbanicity !== filterUrbanicity) return false;
    return true;
  });

  return { visible, remainingQueue, matchingQueue };
}

function getVisibleCases() {
  return getActivePoolAndQueue().visible;
}

function dismissCluster(id, e) {
  if (e) e.stopPropagation();
  const c = CASES.find(x => x.id === id);
  if (!c) return;
  const beforeIds = getVisibleCases().map(x => x.id);
  dismissedIds.push(id);
  const after = getVisibleCases();
  const surfaced = after.find(x => !beforeIds.includes(x.id));

  lastDismissed = {
    id,
    title: `${c.target} vs. ${c.reference}`,
    surfaced: surfaced ? `${surfaced.target} vs. ${surfaced.reference}` : null
  };

  if (selectedCaseId === id && after.length > 0) {
    selectedCaseId = after[0].id;
  }
  renderAll();
}

function undoDismiss() {
  if (!lastDismissed) return;
  dismissedIds = dismissedIds.filter(id => id !== lastDismissed.id);
  selectedCaseId = lastDismissed.id;
  lastDismissed = null;
  renderAll();
}

function restoreAll() {
  dismissedIds = [];
  lastDismissed = null;
  renderAll();
}

function toggleTool(id) {
  const t = tools.find(x => x.id === id);
  if (t) {
    t.active = !t.active;
    renderAll();
  }
}

function enableToolById(id) {
  let t = tools.find(x => x.id === id);
  if (!t) {
    const template = SUGGESTED_CUSTOM_TOOLS.find(x => x.id === id);
    if (template) {
      t = { ...template, active: true };
      tools.push(t);
    }
  } else {
    t.active = true;
  }
  renderAll();
}

function removeCustomTool(id, e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  tools = tools.filter(x => x.id !== id);
  renderAll();
}

function closeUndoToast() {
  lastDismissed = null;
  renderTopStatus();
}

function renderTopStatus() {
  const activeCount = tools.filter(t => t.active).length;
  $("toolkit-count-pill").textContent = `${activeCount} Active`;

  const restoreBtn = $("restore-all-btn");
  if (dismissedIds.length > 0) {
    restoreBtn.hidden = false;
    restoreBtn.textContent = `Restore Dismissed (${dismissedIds.length})`;
  } else {
    restoreBtn.hidden = true;
  }

  const toast = $("undo-toast");
  if (lastDismissed) {
    toast.hidden = false;
    toast.innerHTML = `
      <span>
        Dismissed <strong>${esc(lastDismissed.title)}</strong>
        ${lastDismissed.surfaced ? ` &middot; Surfaced next match: <strong>${esc(lastDismissed.surfaced)}</strong>` : ""}
      </span>
      <div class="toast-btns">
        <button type="button" class="btn-undo" onclick="undoDismiss()">Undo</button>
        <button type="button" class="btn-close-toast" onclick="closeUndoToast()" aria-label="Close">Close</button>
      </div>
    `;
  } else {
    toast.hidden = true;
    toast.innerHTML = "";
  }
}

function renderCards() {
  const container = $("cards");
  const queueBar = $("queue-bar");
  const { visible, remainingQueue } = getActivePoolAndQueue();

  if (queueBar) {
    const queueCount = filterRegime === "core" || filterRegime === "all" ? remainingQueue.length : 0;
    queueBar.innerHTML = `
      <span>
        Showing <strong>${visible.length} Active Peer Cluster${visible.length === 1 ? "" : "s"}</strong>
        ${queueCount > 0
          ? ` &middot; <span class="queue-hint">${queueCount} more ranked cluster${queueCount === 1 ? "" : "s"} in queue &mdash; dismiss any card to pull next match</span>`
          : (dismissedIds.length > 0 ? ` &middot; <span class="queue-hint">All queued clusters surfaced</span>` : "")}
      </span>
    `;
  }

  if (visible.length === 0) {
    container.innerHTML = `
      <div class="empty-box">
        <p>No peer communities match this filter combination.</p>
        <button class="btn-reset" onclick="resetAllFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  if (!visible.some(c => c.id === selectedCaseId)) {
    selectedCaseId = visible[0].id;
  }

  container.innerHTML = visible.map(c => {
    const isSel = c.id === selectedCaseId;
    const ev = evaluateCase(c);
    return `
      <div class="card ${isSel ? "selected" : ""}" onclick="selectCase('${c.id}')">
        <div class="card-top">
          <div class="card-tag-wrap">
            <span class="card-tag">${esc(c.category_tag)}</span>
            ${c.is_backup ? `<span class="queue-badge">From Queue</span>` : ""}
          </div>
          <div class="card-actions">
            <span class="match-pill ${ev.allSolved ? "pill-ok" : "pill-gap"}">
              ${ev.solved}/${ev.total} Factors Matched
            </span>
            <button type="button" class="btn-x" title="Dismiss cluster and surface next peer match" onclick="dismissCluster('${c.id}', event)">Dismiss</button>
          </div>
        </div>
        <h3 class="card-title">
          ${esc(c.target)}
          <span class="card-peer-sub">vs. peer ${esc(c.reference)}</span>
        </h3>
        <div class="card-metrics-grid">
          <div class="cm-item">
            <span class="cm-label">Peer Baseline Match</span>
            <span class="cm-val">${esc(c.peer_baseline)}</span>
          </div>
          <div class="cm-item">
            <span class="cm-label">Quantitative Metric Gap</span>
            <span class="cm-val cm-gap">${esc(c.metric_gap)}</span>
          </div>
        </div>
        <div class="card-qual-row">
          <span class="cm-label">AI-Researched Qualitative Drivers:</span>
          <span class="cm-qual-val">${esc(c.qualitative_drivers)}</span>
        </div>
      </div>
    `;
  }).join("");
}

function selectCase(id) {
  selectedCaseId = id;
  renderAll();
}

function switchTab(tab) {
  currentTab = tab;
  renderDetail();
}

function resetAllFilters() {
  filterAxis = "all";
  filterUrbanicity = "all";
  filterRegime = "core";
  dismissedIds = [];
  lastDismissed = null;
  document.querySelectorAll("[data-filter-group='axis'] .chip").forEach(b => {
    b.classList.toggle("selected", b.dataset.val === "all");
  });
  $("filter-urbanicity").value = "all";
  $("filter-regime").value = "core";
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

  let bodyHTML = "";
  if (currentTab === "matcher") {
    bodyHTML = `
      <div class="match-table-wrap">
        <div class="match-grid-head">
          <div>1. Divergence Factor (${esc(c.target)} vs. ${esc(c.reference)})</div>
          <div>2. Local Govt Subsidy (Auto-Researched)</div>
          <div>3. Matched PNC Tool (From Toolkit)</div>
        </div>

        ${ev.results.map(r => {
          const f = r.factor;
          const m = r.matchedTool;
          return `
            <div class="match-row ${m ? "row-solved" : "row-unsolved"}">
              <div class="col-factor">
                <h4>${esc(f.title)}</h4>
                <div class="factor-metric-badge">${esc(f.metrics)}</div>
                <p>${esc(f.why)}</p>
              </div>

              <div class="col-local">
                <span class="col-mini-tag tag-local">LOCAL SUBSIDY</span>
                <div class="local-title">${esc(f.local_program)}</div>
                <p>${esc(f.local_desc)}</p>
              </div>

              <div class="col-tool">
                ${m ? `
                  <span class="col-mini-tag ${m.isCustom ? "tag-custom" : "tag-matched"}">
                    ${m.isCustom ? "MATCHED CUSTOM TOOL" : "MATCHED PNC TOOL"}
                  </span>
                  <div class="tool-matched-title">${esc(m.name)}</div>
                  <p>${esc(f.action)}</p>
                ` : `
                  <span class="col-mini-tag tag-unmatched">UNMATCHED FACTOR</span>
                  <div class="tool-unmatched-label">No Matching Tool in Standard PNC Toolkit</div>
                  <p class="unmatched-sub">Standard tools do not directly address this divergence barrier.</p>
                  ${r.suggestedTool ? `
                    <button class="btn-add-custom-inline" onclick="enableToolById('${r.suggestedTool.id}')">
                      + Enable Custom Tool: "${esc(r.suggestedTool.name)}"
                    </button>
                  ` : `
                    <button class="btn-add-custom-inline" onclick="openToolkit()">
                      + Add Custom Tool in Toolkit
                    </button>
                  `}
                `}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  } else {
    bodyHTML = `
      <p class="peer-note">
        <strong>Community Form:</strong> Share of county households in Suburban, Urban, and Rural census tracts. 
        <strong>Affordability &amp; Access Burden (0–100):</strong> National percentile ranks where higher scores indicate worse housing burden.
      </p>
      <div class="table-wrap">
        <table class="peer-table">
          <thead>
            <tr>
              <th>County</th>
              <th>Community Form (Suburban / Urban / Rural)</th>
              <th>Population</th>
              <th>Median Income</th>
              <th>Median Home Value (Ratio)</th>
              <th>Affordability Burden</th>
              <th>Access Burden</th>
              <th>Affordable Units / LMI HH</th>
              <th>Mortgage Denials</th>
            </tr>
          </thead>
          <tbody>
            ${c.peers.map(p => {
              const isTarget = p.name === c.target;
              const isRef = p.name === c.reference;
              return `
                <tr class="${isTarget ? "tr-target" : (isRef ? "tr-ref" : "")}">
                  <td class="col-county-cell">
                    ${isTarget ? `<div class="t-badge-line"><span class="t-badge tb-target">TARGET</span></div>` : ""}
                    ${isRef ? `<div class="t-badge-line"><span class="t-badge tb-ref">PEER BENCHMARK</span></div>` : ""}
                    <div class="county-name-line"><strong>${esc(p.name)}</strong></div>
                  </td>
                  <td>
                    <div class="form-text">${esc(p.form)}</div>
                    <div class="mini-bar">
                      <span class="mb-s" style="width:${p.s}%"></span>
                      <span class="mb-u" style="width:${p.u}%"></span>
                      <span class="mb-r" style="width:${p.r}%"></span>
                    </div>
                  </td>
                  <td>${esc(p.pop)}</td>
                  <td>${esc(p.inc)}</td>
                  <td><strong>${esc(p.value)}</strong></td>
                  <td>${p.aff}th %ile</td>
                  <td>${p.acc}th %ile</td>
                  <td><strong>${p.units}</strong></td>
                  <td><strong>${esc(p.denial)}</strong></td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  container.innerHTML = `
    <section class="detail-box">
      <div class="detail-header">
        <div>
          <span class="eyebrow">${esc(c.category_tag)}</span>
          <h2>
            Target: ${esc(c.target)}
            <span class="detail-peer-sub">vs. Peer Benchmark: ${esc(c.reference)}</span>
          </h2>
          <p>${esc(c.summary)}</p>
        </div>
        <button class="btn-outline" onclick="openToolkit()">Configure PNC Toolkit (${tools.filter(t => t.active).length} Active)</button>
      </div>

      <!-- 3-Box Executive Comparison Strip -->
      <div class="exec-strip">
        <div class="exec-item">
          <span class="exec-label">1. Why They Are Peers (Baseline Match)</span>
          <strong>${esc(c.strip_match)}</strong>
        </div>
        <div class="exec-item">
          <span class="exec-label">2. Affordability Outcome (${esc(c.target.split(',')[0])} vs. ${esc(c.reference.split(',')[0])})</span>
          <strong>${esc(c.strip_aff)}</strong>
        </div>
        <div class="exec-item">
          <span class="exec-label">3. Access &amp; Lending Outcome (${esc(c.target.split(',')[0])} vs. ${esc(c.reference.split(',')[0])})</span>
          <strong>${esc(c.strip_acc)}</strong>
        </div>
      </div>

      <div class="tabs">
        <button class="tab ${currentTab === "matcher" ? "active" : ""}" onclick="switchTab('matcher')">
          Divergence Factors &amp; AI Match (${ev.solved}/${ev.total})
        </button>
        <button class="tab ${currentTab === "peers" ? "active" : ""}" onclick="switchTab('peers')">
          5-County Peer Comparison Table
        </button>
      </div>

      <div class="detail-body">
        ${bodyHTML}
      </div>
    </section>
  `;
}

function openToolkit() {
  document.querySelectorAll("[data-view]").forEach(b => {
    b.classList.toggle("active", b.dataset.view === "toolkit");
  });
  $("matches").hidden = true;
  $("toolkit").hidden = false;
  renderToolkit();
}

function addCustomToolFromForm(e) {
  e.preventDefault();
  const name = $("ct-name").value.trim();
  const tag = $("ct-tag").value;
  const desc = $("ct-desc").value.trim();
  if (!name) return;

  const existingCustom = tools.find(
    t => t.isCustom && (t.name.toLowerCase() === name.toLowerCase() || t.tags.includes(tag))
  );

  if (existingCustom) {
    existingCustom.name = name;
    existingCustom.desc = desc || existingCustom.desc;
    existingCustom.active = true;
  } else {
    tools.push({
      id: "custom-" + Date.now(),
      name,
      category: "Custom Tool",
      active: true,
      isCustom: true,
      tags: [tag],
      desc: desc || "Custom PNC tool added to solve local divergence barriers."
    });
  }

  $("ct-name").value = "";
  $("ct-desc").value = "";
  renderAll();
}

function quickFill(type) {
  if (type === "sonoma") {
    $("ct-name").value = "Hospital & Teacher Down-Payment + Backyard ADU Loan";
    $("ct-tag").value = "workforce-adu";
    $("ct-desc").value = "Pairs a $25,000 shared-equity down-payment match for essential workers with a backyard ADU loan to bypass Prop 13 resale freezes.";
  } else if (type === "lafayette") {
    $("ct-name").value = "Fortified-Roof Grant & Insurance-Relief Bridge Loan";
    $("ct-tag").value = "flood-insurance-dti";
    $("ct-desc").value = "Advances Louisiana's $10,000 Fortified Roof Grant at closing so buyers immediately lock in 30% lower insurance and pass DTI limits.";
  } else if (type === "bernalillo") {
    $("ct-name").value = "Small-Dollar Starter & Casita Rehab Mortgage (<$150k)";
    $("ct-tag").value = "small-dollar-rehab";
    $("ct-desc").value = "Low-fee mortgage designed for sub-$150k starter home acquisition-rehab and backyard casita infill.";
  }
}

function renderToolkit() {
  const container = $("toolkit");
  const existing = tools.filter(t => !t.isCustom);
  const custom = tools.filter(t => t.isCustom);

  container.innerHTML = `
    <div class="top-bar">
      <div>
        <h1>PNC Toolkit &amp; Custom Tools</h1>
        <p class="sub">Check which tools PNC offers in the target market, or add a custom tool to solve open divergence factors.</p>
      </div>
      <button class="btn-outline" onclick="document.querySelector('[data-view=matches]').click()">Back to Peer Communities</button>
    </div>

    <div class="toolkit-layout">
      <div>
        <h3 class="sec-h">PNC Existing Tools</h3>
        <div class="tool-list">
          ${existing.map(t => `
            <label class="tool-card ${t.active ? "tc-on" : "tc-off"}">
              <input type="checkbox" ${t.active ? "checked" : ""} onchange="toggleTool('${t.id}')">
              <div>
                <div class="tc-head">
                  <strong>${esc(t.name)}</strong>
                  <span class="tc-badge">PNC Verified</span>
                </div>
                <p>${esc(t.desc)}</p>
              </div>
            </label>
          `).join("")}
        </div>

        <h3 class="sec-h" style="margin-top:22px;">Custom Tools (Added / Specialized Programs)</h3>
        <div class="tool-list">
          ${custom.length === 0 ? `
            <div class="empty-custom-box">
              No custom tools added yet. Use <strong>Add New Custom Tool</strong> on the right (or Quick Fill) to demo adding a specialized lending program.
            </div>
          ` : custom.map(t => `
            <label class="tool-card ${t.active ? "tc-on" : "tc-off"}">
              <input type="checkbox" ${t.active ? "checked" : ""} onchange="toggleTool('${t.id}')">
              <div style="flex:1;">
                <div class="tc-head" style="justify-content:space-between;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <strong>${esc(t.name)}</strong>
                    <span class="tc-badge badge-orange">Custom Tool</span>
                  </div>
                  <button type="button" class="btn-x" onclick="removeCustomTool('${t.id}', event)" title="Remove custom tool">Remove</button>
                </div>
                <p>${esc(t.desc)}</p>
              </div>
            </label>
          `).join("")}
        </div>
      </div>

      <div class="add-tool-box">
        <span class="eyebrow">ADD CUSTOM TOOL</span>
        <h3>Add New Custom Tool</h3>
        <p class="sub" style="margin-bottom:12px;">Add a specialized loan or grant rule. The AI immediately checks if it solves any unmatched county divergence factors.</p>

        <div class="quick-row">
          <span>Quick Fill:</span>
          <button type="button" class="btn-qf" onclick="quickFill('sonoma')">+ Workforce &amp; ADU Loan</button>
          <button type="button" class="btn-qf" onclick="quickFill('lafayette')">+ Roof Grant Bridge Loan</button>
          <button type="button" class="btn-qf" onclick="quickFill('bernalillo')">+ Small-Dollar Casita Loan</button>
        </div>

        <form onsubmit="addCustomToolFromForm(event)" class="ct-form">
          <label>
            Tool / Program Name
            <input type="text" id="ct-name" placeholder="e.g., Hospital & Teacher Down-Payment Loan" required>
          </label>

          <label>
            Divergence Factor It Solves
            <select id="ct-tag">
              <option value="workforce-adu">Workforce Lockout &amp; Prop 13 / ADU Infill (Sonoma)</option>
              <option value="flood-insurance-dti">Flood Insurance DTI Spike &amp; Roof Rehab (Lafayette)</option>
              <option value="small-dollar-rehab">Small-Dollar Casita &amp; Starter Rehab &lt;$150k (Bernalillo)</option>
              <option value="dpa-grant">Upfront Down-Payment &amp; Closing Cash Hurdle (Bucks)</option>
              <option value="supply-lihtc">Multifamily Supply &amp; Zoning Infill (All)</option>
            </select>
          </label>

          <label>
            Short Description (Optional)
            <textarea id="ct-desc" rows="2" placeholder="How this tool works alongside local government subsidies..."></textarea>
          </label>

          <button type="submit" class="btn-submit">+ Add Custom Tool to Toolkit</button>
        </form>
      </div>
    </div>
  `;
}

function renderAll() {
  renderTopStatus();
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

// Filters
document.querySelectorAll("[data-filter-group='axis'] .chip").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll("[data-filter-group='axis'] .chip").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    filterAxis = btn.dataset.val;
    renderAll();
  };
});

$("filter-urbanicity").onchange = e => {
  filterUrbanicity = e.target.value;
  renderAll();
};

$("filter-regime").onchange = e => {
  filterRegime = e.target.value;
  renderAll();
};

$("restore-all-btn").onclick = restoreAll;

renderAll();
