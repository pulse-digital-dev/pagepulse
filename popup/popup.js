// PagePulse - Popup Controller
// Handles tab switching, analysis execution, result rendering

document.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

  const loadingSection = $('#loadingSection');
  const scoreSection = $('#scoreSection');
  const tabs = $('#tabs');
  const resultsContainer = $('#results');
  const pageUrlEl = $('#pageUrl');

  let analysisData = null;
  let activeCategory = 'seo';
  let isPro = false;
  const exportBar = $('#exportBar');
  const proBanner = $('#proBanner');
  const proStatus = $('#proStatus');
  const historySection = $('#historySection');
  const historyList = $('#historyList');
  const tabHistory = $('#tabHistory');
  const tabCro = $('#tabCro');
  const tabEc = $('#tabEc');
  let croData = null;
  let ecData = null;
  let currentTabId = null;

  // ---- Initialize ----
  scoreSection.classList.add('hidden');
  tabs.classList.add('hidden');
  resultsContainer.classList.add('hidden');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      showError('\u3053\u306e\u30da\u30fc\u30b8\u306b\u306f\u30a2\u30af\u30bb\u30b9\u3067\u304d\u307e\u305b\u3093\u3002');
      return;
    }

    pageUrlEl.textContent = tab.url;

    // Check if we can inject
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:')) {
      showError('\u30d6\u30e9\u30a6\u30b6\u8a2d\u5b9a\u30da\u30fc\u30b8\u306f\u5206\u6790\u3067\u304d\u307e\u305b\u3093\u3002');
      return;
    }

    // Inject and execute analyzer
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content/analyzer.js']
    });

    if (result && result.result) {
      analysisData = result.result;
      renderResults();
      saveToHistory(tab.url, analysisData);
    } else {
      showError('\u5206\u6790\u30c7\u30fc\u30bf\u304c\u53d6\u5f97\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f\u3002');
    }

  } catch (err) {
    console.error('PagePulse error:', err);
    showError('\u30da\u30fc\u30b8\u306e\u5206\u6790\u306b\u5931\u6557\u3057\u307e\u3057\u305f\u3002\u518d\u8aad\u307f\u8fbc\u307f\u3057\u3066\u304f\u3060\u3055\u3044\u3002');
  }

  // ---- Check Payment Status ----
  try {
    const response = await chrome.runtime.sendMessage({ type: 'CHECK_PAYMENT_STATUS' });
    if (response && response.paid) {
      isPro = true;
      proStatus.classList.remove('hidden');
      proBanner.classList.add('hidden');
      showProTabs();
    } else {
      isPro = false;
      proBanner.classList.remove('hidden');
      proStatus.classList.add('hidden');
      hideProTabs();
    }
  } catch (err) {
    console.warn('Payment check failed:', err);
    proBanner.classList.remove('hidden');
    hideProTabs();
  }

  // ---- Render ----
  function renderResults() {
    loadingSection.classList.add('hidden');
    scoreSection.classList.remove('hidden');
    tabs.classList.remove('hidden');
    resultsContainer.classList.remove('hidden');
    exportBar.classList.remove('hidden');

    renderScoreRing();
    renderBadges();
    renderTabBadges();
    renderCategory(activeCategory);
  }

  function renderScoreRing() {
    const scores = {
      seo: calcCategoryScore(analysisData.seo),
      performance: calcCategoryScore(analysisData.performance),
      accessibility: calcCategoryScore(analysisData.accessibility),
      structure: calcCategoryScore(analysisData.structure),
      llmo: calcCategoryScore(analysisData.llmo)
    };

    const total = Math.round(
      scores.seo * 0.20 +
      scores.performance * 0.20 +
      scores.accessibility * 0.15 +
      scores.structure * 0.15 +
      scores.llmo * 0.30
    );

    const scoreNumber = $('#scoreNumber');
    const scoreRing = $('#scoreRing');
    const circumference = 2 * Math.PI * 52;

    animateNumber(scoreNumber, 0, total, 1000);

    let color1, color2;
    if (total >= 80) { color1 = '#00D68F'; color2 = '#00B4D8'; }
    else if (total >= 50) { color1 = '#FFD93D'; color2 = '#FFA94D'; }
    else { color1 = '#FF6B6B'; color2 = '#FF8E53'; }

    const svg = $('.score-ring__svg');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'scoreGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', color1);
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', color2);
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.prepend(defs);

    setTimeout(() => {
      const offset = circumference - (circumference * total / 100);
      scoreRing.style.strokeDashoffset = offset;
    }, 100);
  }

  function renderBadges() {
    const badgesContainer = $('#scoreBadges');
    const categories = [
      { key: 'llmo', label: 'AI\u6700\u9069\u5316', data: analysisData.llmo },
      { key: 'seo', label: 'SEO', data: analysisData.seo },
      { key: 'performance', label: '\u30b9\u30d4\u30fc\u30c9', data: analysisData.performance },
      { key: 'accessibility', label: '\u30a2\u30af\u30bb\u30b7\u30d3\u30ea\u30c6\u30a3', data: analysisData.accessibility },
      { key: 'structure', label: '\u69cb\u9020', data: analysisData.structure }
    ];

    badgesContainer.innerHTML = categories.map(cat => {
      const score = calcCategoryScore(cat.data);
      const cls = score >= 80 ? 'good' : score >= 50 ? 'warn' : 'bad';
      return `<span class="score-badge score-badge--${cls}">${cat.label}: ${score}</span>`;
    }).join('');
  }

  function renderTabBadges() {
    const categories = ['seo', 'performance', 'accessibility', 'structure', 'llmo'];
    categories.forEach(cat => {
      const data = analysisData[cat];
      const issues = data.filter(r => r.status === 'fail' || r.status === 'warn').length;
      const badge = $(`#badge-${cat}`);
      badge.textContent = issues;
      badge.className = 'tab__badge';
      if (issues === 0) badge.classList.add('tab__badge--good');
      else if (issues <= 2) badge.classList.add('tab__badge--warn');
      else badge.classList.add('tab__badge--bad');
    });
  }

  function renderCategory(category) {
    const data = analysisData[category];
    if (!data) return;

    const order = { fail: 0, warn: 1, pass: 2, info: 3 };
    const sorted = [...data].sort((a, b) => (order[a.status] || 3) - (order[b.status] || 3));

    resultsContainer.innerHTML = sorted.map(item => `
      <div class="result-card">
        <div class="result-card__header">
          <span class="result-card__status result-card__status--${item.status}"></span>
          <span class="result-card__title">${escapeHtml(item.title)}</span>
          <span class="result-card__tag result-card__tag--${isPro ? 'pro' : 'free'}">${isPro ? 'Pro\u5206\u6790' : '\u7121\u6599\u8a3a\u65ad'}</span>
        </div>
        <div class="result-card__body">
          ${escapeHtml(item.body)}
          ${item.value ? `<span class="result-card__value">${escapeHtml(item.value)}</span>` : ''}
        </div>
        ${item.action ? formatAction(item.action) : ''}
      </div>
    `).join('');
  }

  // ---- Tab Switching ----
  $$('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.category;

      if (activeCategory === 'history') {
        resultsContainer.classList.add('hidden');
        historySection.classList.remove('hidden');
        renderHistory();
      } else if (activeCategory === 'cro' || activeCategory === 'ec') {
        historySection.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
        runProAnalysis(activeCategory);
      } else {
        historySection.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
        renderCategory(activeCategory);
      }
    });
  });

  // ---- Pro Analysis (CRO / EC) ----
  async function runProAnalysis(category) {
    const file = category === 'cro' ? 'content/cro-analyzer.js' : 'content/ec-analyzer.js';
    const cached = category === 'cro' ? croData : ecData;

    if (cached) {
      renderProResults(cached);
      return;
    }

    resultsContainer.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted)"><div class="loading__spinner" style="margin:0 auto 10px"></div>\u5206\u6790\u4e2d...</div>';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [file]
      });

      if (result && result.result) {
        if (category === 'cro') croData = result.result;
        else ecData = result.result;
        renderProResults(result.result);
      } else {
        resultsContainer.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:30px">\u5206\u6790\u30c7\u30fc\u30bf\u304c\u53d6\u5f97\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f</p>';
      }
    } catch (err) {
      console.error('Pro analysis error:', err);
      resultsContainer.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:30px">\u5206\u6790\u306b\u5931\u6557\u3057\u307e\u3057\u305f</p>';
    }
  }

  function renderProResults(data) {
    const order = { fail: 0, warn: 1, pass: 2, info: 3 };
    const sorted = [...data].sort((a, b) => (order[a.status] || 3) - (order[b.status] || 3));

    resultsContainer.innerHTML = sorted.map(item => `
      <div class="result-card">
        <div class="result-card__header">
          <span class="result-card__status result-card__status--${item.status}"></span>
          <span class="result-card__title">${escapeHtml(item.title)}</span>
          <span class="result-card__tag result-card__tag--pro">Pro\u5206\u6790</span>
        </div>
        <div class="result-card__body">
          ${escapeHtml(item.body)}
          ${item.value ? `<span class="result-card__value">${escapeHtml(item.value)}</span>` : ''}
        </div>
        ${item.action ? formatAction(item.action) : ''}
      </div>
    `).join('');
  }

  function showProTabs() {
    tabHistory.classList.remove('hidden');
    tabCro.classList.remove('hidden');
    tabEc.classList.remove('hidden');
  }

  function hideProTabs() {
    tabHistory.classList.add('hidden');
    tabCro.classList.add('hidden');
    tabEc.classList.add('hidden');
  }

  // ---- Upgrade Buttons ----
  $('#btnUpgrade').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://pulse-digital.dev' });
  });

  // Pro upgrade banner button
  $('#btnUpgradePro').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_PAYMENT_PAGE' });
  });

  // Listen for payment status changes (real-time upgrade)
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'PAYMENT_STATUS_CHANGED' && message.paid) {
      isPro = true;
      proBanner.classList.add('hidden');
      proStatus.classList.remove('hidden');
      showProTabs();
      // Re-render with Pro features
      if (analysisData) renderCategory(activeCategory);
    }
  });

  // ---- Export Buttons ----
  $('#btnExportCSV').addEventListener('click', () => {
    if (!analysisData) return;
    const csv = generateCSV();
    downloadFile(csv, `pagepulse-report-${getTimestamp()}.csv`, 'text/csv;charset=utf-8');
    showExportDone($('#btnExportCSV'), 'CSV\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9');
  });

  $('#btnExportJSON').addEventListener('click', () => {
    if (!analysisData) return;
    const json = generateJSON();
    downloadFile(json, `pagepulse-report-${getTimestamp()}.json`, 'application/json;charset=utf-8');
    showExportDone($('#btnExportJSON'), 'JSON');
  });

  function generateCSV() {
    const BOM = '\uFEFF';
    const header = '\u30ab\u30c6\u30b4\u30ea,\u30b9\u30c6\u30fc\u30bf\u30b9,\u30c1\u30a7\u30c3\u30af\u9805\u76ee,\u8aac\u660e,\u6539\u5584\u30a2\u30af\u30b7\u30e7\u30f3';
    const categoryNames = {
      seo: 'SEO',
      performance: '\u30d1\u30d5\u30a9\u30fc\u30de\u30f3\u30b9',
      accessibility: '\u30a2\u30af\u30bb\u30b7\u30d3\u30ea\u30c6\u30a3',
      structure: '\u69cb\u9020',
      llmo: 'AI\u6700\u9069\u5316'
    };
    const rows = [header];
    for (const [cat, items] of Object.entries(analysisData)) {
      if (cat === 'url') continue;
      const catName = categoryNames[cat] || cat;
      items.forEach(item => {
        rows.push([
          catName,
          item.status || '',
          csvEscape(item.title || ''),
          csvEscape(item.body || ''),
          csvEscape(item.action || '')
        ].join(','));
      });
    }
    return BOM + rows.join('\n');
  }

  function generateJSON() {
    const categoryNames = {
      seo: 'SEO',
      performance: 'Performance',
      accessibility: 'Accessibility',
      structure: 'Structure',
      llmo: 'AI Optimization (LLMO)'
    };
    const report = {
      tool: 'PagePulse v1.3.0',
      url: analysisData.url || '',
      exportedAt: new Date().toISOString(),
      scores: {},
      details: {}
    };
    for (const [cat, items] of Object.entries(analysisData)) {
      if (cat === 'url') continue;
      const name = categoryNames[cat] || cat;
      report.scores[name] = calcCategoryScore(items);
      report.details[name] = items;
    }
    return JSON.stringify(report, null, 2);
  }

  function csvEscape(str) {
    if (!str) return '';
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function getTimestamp() {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  }

  function showExportDone(btn, originalText) {
    const icon = btn.querySelector('.btn-export__icon');
    const label = btn.querySelector('span:last-child');
    const prevIcon = icon.textContent;
    icon.textContent = '\u2705';
    label.textContent = '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u5b8c\u4e86';
    btn.classList.add('btn-export--done');
    setTimeout(() => {
      icon.textContent = prevIcon;
      label.textContent = originalText;
      btn.classList.remove('btn-export--done');
    }, 2000);
  }

  // ---- History (Pro) ----
  async function saveToHistory(url, data) {
    try {
      const result = await chrome.storage.local.get('history');
      const history = result.history || [];

      const scores = {
        seo: calcCategoryScore(data.seo),
        performance: calcCategoryScore(data.performance),
        accessibility: calcCategoryScore(data.accessibility),
        structure: calcCategoryScore(data.structure),
        llmo: calcCategoryScore(data.llmo)
      };

      const totalScore = Math.round(
        scores.seo * 0.20 +
        scores.performance * 0.20 +
        scores.accessibility * 0.15 +
        scores.structure * 0.15 +
        scores.llmo * 0.30
      );

      history.unshift({
        url: url,
        timestamp: new Date().toISOString(),
        scores: scores,
        totalScore: totalScore
      });

      if (history.length > 50) history.length = 50;

      await chrome.storage.local.set({ history: history });
    } catch (err) {
      console.warn('Failed to save history:', err);
    }
  }

  async function renderHistory() {
    try {
      const result = await chrome.storage.local.get('history');
      const history = result.history || [];

      if (history.length === 0) {
        historyList.innerHTML = `
          <div class="history__empty">
            <span style="font-size:24px">\ud83d\udced</span>
            <p>\u307e\u3060\u5206\u6790\u5c65\u6b74\u304c\u3042\u308a\u307e\u305b\u3093</p>
          </div>
        `;
        return;
      }

      historyList.innerHTML = history.map((entry, i) => {
        const date = new Date(entry.timestamp);
        const dateStr = `${date.getMonth()+1}/${date.getDate()} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
        const scoreClass = entry.totalScore >= 80 ? 'good' : entry.totalScore >= 50 ? 'warn' : 'bad';
        const displayUrl = entry.url.replace(/^https?:\/\//, '').substring(0, 40);

        return `
          <div class="history__item" style="animation-delay:${i * 0.05}s">
            <div class="history__item-header">
              <span class="history__score history__score--${scoreClass}">${entry.totalScore}</span>
              <span class="history__url">${escapeHtml(displayUrl)}</span>
              <span class="history__date">${dateStr}</span>
            </div>
            <div class="history__badges">
              ${Object.entries(entry.scores).map(([key, val]) => {
                const cls = val >= 80 ? 'good' : val >= 50 ? 'warn' : 'bad';
                const labels = { seo:'SEO', performance:'Speed', accessibility:'A11y', structure:'Str', llmo:'AI' };
                return `<span class="history__mini-badge history__mini-badge--${cls}">${labels[key]}:${val}</span>`;
              }).join('')}
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      historyList.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px">\u5c65\u6b74\u306e\u8aad\u307f\u8fbc\u307f\u306b\u5931\u6557\u3057\u307e\u3057\u305f</p>';
    }
  }

  // Clear history
  $('#btnClearHistory').addEventListener('click', async () => {
    await chrome.storage.local.remove('history');
    renderHistory();
  });

  // ---- Utilities ----
  function calcCategoryScore(items) {
    if (!items || items.length === 0) return 100;
    const infoItems = items.filter(i => i.status === 'info');
    const scoredItems = items.filter(i => i.status !== 'info');
    if (scoredItems.length === 0) return 100;

    let score = 100;
    scoredItems.forEach(item => {
      if (item.status === 'fail') score -= (100 / scoredItems.length);
      else if (item.status === 'warn') score -= (50 / scoredItems.length);
    });
    return Math.max(0, Math.round(score));
  }

  function animateNumber(el, start, end, duration) {
    const range = end - start;
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + range * eased);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function showError(msg) {
    loadingSection.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    resultsContainer.innerHTML = `
      <div class="result-card" style="text-align:center; padding:40px 20px;">
        <div style="font-size:32px; margin-bottom:12px;">\u26A0\uFE0F</div>
        <div class="result-card__title" style="font-size:14px;">${escapeHtml(msg)}</div>
      </div>
    `;
  }

  function formatAction(actionStr) {
    if (!actionStr) return '';
    const marker = '\n\ud83d\udcdd';
    const idx = actionStr.indexOf(marker);
    if (idx === -1) {
      return `<div class="result-card__action">${escapeHtml(actionStr)}</div>`;
    }
    const advice = actionStr.substring(0, idx);
    const codeRaw = actionStr.substring(idx + marker.length).trim();
    return `<div class="result-card__action">${escapeHtml(advice)}</div><div class="result-card__code">${escapeHtml(codeRaw)}</div>`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
