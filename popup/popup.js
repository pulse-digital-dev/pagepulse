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
  const proUpsell = $('#proUpsell');
  const proUpsellTitle = $('#proUpsellTitle');
  const proUpsellDesc = $('#proUpsellDesc');
  const proUpsellFeatures = $('#proUpsellFeatures');
  let croData = null;
  let ecData = null;

  // Pro category descriptions for upsell teaser
  const proCategoryInfo = {
    cro: {
      title: 'CRO\u8a3a\u65ad',
      desc: 'CTA\u5206\u6790\u30fb\u30d5\u30a9\u30fc\u30e0\u6700\u9069\u5316\u30fb\u4fe1\u983c\u6027\u30c1\u30a7\u30c3\u30af\u7b49\u3001\u30b3\u30f3\u30d0\u30fc\u30b8\u30e7\u30f3\u6539\u5584\u306b\u7279\u5316\u3057\u305f\u8a3a\u65ad',
      features: [
        'CTA\u6570\u30fb\u914d\u7f6e\u306e\u6700\u9069\u5316\u30c1\u30a7\u30c3\u30af',
        '\u96fb\u8a71\u756a\u53f7\u30ea\u30f3\u30af\u30fbtel:\u5c5e\u6027\u306e\u691c\u51fa',
        '\u4fe1\u983c\u6027\u8981\u7d20\uff08\u30ec\u30d3\u30e5\u30fc\u30fb\u5b9f\u7e3e\u30fb\u30d0\u30c3\u30b8\uff09\u306e\u5206\u6790',
        '\u30bf\u30c3\u30c1\u30bf\u30fc\u30b2\u30c3\u30c8\u30b5\u30a4\u30ba\u306e\u691c\u8a3c'
      ]
    },
    ec: {
      title: 'EC\u7279\u5316\u5206\u6790',
      desc: '\u5546\u54c1\u30da\u30fc\u30b8\u306e\u8cfc\u5165\u5c0e\u7dda\u30fb\u4fa1\u683c\u8868\u793a\u30fb\u6cd5\u4ee4\u9075\u5b88\u3092\u81ea\u52d5\u30c1\u30a7\u30c3\u30af',
      features: [
        '\u5546\u54c1\u753b\u50cf\u679a\u6570\u30fb\u4fa1\u683c\u8868\u793a\u306e\u691c\u51fa',
        '\u8cfc\u5165\u30dc\u30bf\u30f3\u30fb\u30ab\u30fc\u30c8\u5c0e\u7dda\u306e\u6709\u7121',
        '\u9001\u6599\u30fb\u914d\u9001\u60c5\u5831\u306e\u8868\u793a\u30c1\u30a7\u30c3\u30af',
        '\u7279\u5546\u6cd5\u8868\u8a18\u30fb\u8fd4\u54c1\u30dd\u30ea\u30b7\u30fc\u306e\u691c\u51fa'
      ]
    },
    history: {
      title: '\u5206\u6790\u5c65\u6b74',
      desc: '\u904e\u53bb\u306e\u5206\u6790\u7d50\u679c\u3092\u81ea\u52d5\u4fdd\u5b58\u3002\u6539\u5584\u306e\u9032\u6357\u3092\u53ef\u8996\u5316',
      features: [
        '\u6700\u592750\u4ef6\u306e\u5206\u6790\u5c65\u6b74\u3092\u81ea\u52d5\u4fdd\u5b58',
        'URL\u5225\u30b9\u30b3\u30a2\u63a8\u79fb\u306e\u78ba\u8a8d',
        '\u30ef\u30f3\u30af\u30ea\u30c3\u30af\u3067\u904e\u53bb\u306e\u5206\u6790\u3092\u518d\u8868\u793a'
      ]
    }
  };
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
    resultsContainer.innerHTML = buildGroupedCards(data, isPro ? 'pro' : 'free');
  }

  // ---- Tab Switching ----
  $$('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const cat = tab.dataset.category;
      const isProCategory = cat === 'cro' || cat === 'ec' || cat === 'history';

      $$('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = cat;
      proUpsell.classList.add('hidden');

      if (activeCategory === 'history') {
        resultsContainer.classList.add('hidden');
        historySection.classList.remove('hidden');
        if (isPro) {
          renderHistory();
        } else {
          historySection.classList.add('hidden');
          showProUpsell(cat);
        }
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
    if (isPro) {
      resultsContainer.innerHTML = buildGroupedCards(data, 'pro');
      return;
    }
    // Free user teaser: show the WORST 1 item + blur rest
    const fails = data.filter(item => item.status === 'fail');
    const warns = data.filter(item => item.status === 'warn');
    const passes = data.filter(item => item.status === 'pass');
    const infos = data.filter(item => item.status === 'info');

    // Pick the single worst item: first fail, or first warn
    const worstItem = fails[0] || warns[0];
    const remainingCount = data.length - (worstItem ? 1 : 0);

    let html = '';

    // Show the worst item fully visible
    if (worstItem) {
      const statusLabel = worstItem.status === 'fail' ? '\u8981\u4fee\u6b63' : '\u6ce8\u610f';
      html += `<div class="result-section-header"><span class="result-section-header__dot result-section-header__dot--${worstItem.status}"></span><span class="result-section-header__label">${statusLabel}</span><span class="result-section-header__line"></span></div>`;
      html += `<div class="result-card"><div class="result-card__header"><span class="result-card__status result-card__status--${worstItem.status}"></span><span class="result-card__title">${escapeHtml(worstItem.title)}</span><span class="result-card__tag result-card__tag--pro">Pro\u5206\u6790</span></div><div class="result-card__body">${escapeHtml(worstItem.body)}${worstItem.value ? `<span class="result-card__value">${escapeHtml(worstItem.value)}</span>` : ''}</div>${worstItem.action ? formatAction(worstItem.action) : ''}</div>`;
    }

    // Blurred placeholder cards for hidden items
    if (remainingCount > 0) {
      html += `<div class="teaser-blur-wrapper">`;
      const previewCount = Math.min(remainingCount, 3);
      const statusOrder = ['fail', 'warn', 'pass', 'info'];
      for (let i = 0; i < previewCount; i++) {
        const s = statusOrder[Math.min(i, statusOrder.length - 1)];
        html += `<div class="result-card result-card--blurred"><div class="result-card__header"><span class="result-card__status result-card__status--${s}"></span><span class="result-card__title">\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588</span></div><div class="result-card__body">\u2588\u2588\u2588\u2588\u2588 \u2588\u2588\u2588\u2588\u2588\u2588\u2588 \u2588\u2588\u2588\u2588\u2588\u2588 \u2588\u2588\u2588\u2588</div></div>`;
      }
      html += `<div class="teaser-blur-overlay"></div>`;
      html += `</div>`;
    }

    // Upgrade CTA with remaining counts
    html += `<div class="teaser-cta">`;
    html += `<div class="teaser-cta__stats">`;
    const failRemain = fails.length - (worstItem && worstItem.status === 'fail' ? 1 : 0);
    const warnRemain = warns.length - (worstItem && worstItem.status === 'warn' ? 1 : 0);
    if (failRemain > 0) html += `<span class="teaser-cta__stat teaser-cta__stat--fail">\u274c \u8981\u4fee\u6b63 \u4ed6${failRemain}\u4ef6</span>`;
    if (warnRemain > 0) html += `<span class="teaser-cta__stat teaser-cta__stat--warn">\u26a0 \u6ce8\u610f \u4ed6${warnRemain}\u4ef6</span>`;
    if (passes.length > 0) html += `<span class="teaser-cta__stat teaser-cta__stat--pass">\u2713 \u5408\u683c ${passes.length}\u4ef6</span>`;
    if (infos.length > 0) html += `<span class="teaser-cta__stat teaser-cta__stat--info">\u2139 \u53c2\u8003 ${infos.length}\u4ef6</span>`;
    html += `</div>`;
    html += `<p class="teaser-cta__text">\u5168${data.length}\u4ef6\u306e\u5206\u6790\u7d50\u679c\u3068\u6539\u5584\u30b3\u30fc\u30c9\u3092\u898b\u308b</p>`;
    html += `<button class="pro-upsell__btn teaser-cta__btn" id="btnTeaserUpgrade"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>Pro\u306b\u30a2\u30c3\u30d7\u30b0\u30ec\u30fc\u30c9</button>`;
    html += `</div>`;

    resultsContainer.innerHTML = html;

    // Bind upgrade button
    const teaserBtn = document.getElementById('btnTeaserUpgrade');
    if (teaserBtn) {
      teaserBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'OPEN_PAYMENT_PAGE' });
      });
    }
  }

  function showProTabs() {
    tabHistory.classList.remove('tab--locked');
    tabCro.classList.remove('tab--locked');
    tabEc.classList.remove('tab--locked');
    // Update badges to show counts instead of "Pro"
    $('#badge-cro').textContent = '-';
    $('#badge-ec').textContent = '-';
    $('#badge-history').textContent = '-';
  }

  function hideProTabs() {
    // No longer lock tabs — free users can click to see teaser
    // Tab badges remain as "Pro" to indicate premium
  }

  function showProUpsell(category) {
    const info = proCategoryInfo[category];
    if (!info) return;
    proUpsellTitle.textContent = info.title;
    proUpsellDesc.textContent = info.desc;
    proUpsellFeatures.innerHTML = info.features.map(f => `<li>${escapeHtml(f)}</li>`).join('');
    proUpsell.classList.remove('hidden');
  }

  // ---- Upgrade Buttons ----
  $('#btnUpgrade').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://pulse-digital.dev' });
  });

  // Pro upgrade banner button
  $('#btnUpgradePro').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_PAYMENT_PAGE' });
  });

  // Pro upsell section button
  $('#btnUpsellPro').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_PAYMENT_PAGE' });
  });

  // Listen for payment status changes (real-time upgrade)
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'PAYMENT_STATUS_CHANGED' && message.paid) {
      isPro = true;
      proBanner.classList.add('hidden');
      proUpsell.classList.add('hidden');
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

  // PDF Export (Pro only)
  $('#btnExportPDF').addEventListener('click', () => {
    if (!isPro) {
      chrome.runtime.sendMessage({ type: 'OPEN_PAYMENT_PAGE' });
      return;
    }
    if (!analysisData) return;
    try {
      const url = pageUrlEl.textContent || '';
      window.PagePulsePDF.generate(analysisData, url, calcCategoryScore);
      showExportDone($('#btnExportPDF'), 'PDF Report');
    } catch (err) {
      console.error('PDF generation error:', err);
    }
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

  // ---- Grouped Card Builder ----
  function buildGroupedCards(data, tagType) {
    const order = { fail: 0, warn: 1, pass: 2, info: 3 };
    const sorted = [...data].sort((a, b) => (order[a.status] || 3) - (order[b.status] || 3));
    const groups = {};
    sorted.forEach(item => {
      const s = item.status || 'info';
      if (!groups[s]) groups[s] = [];
      groups[s].push(item);
    });
    const sectionLabels = {
      fail: '\u8981\u4fee\u6b63',
      warn: '\u6ce8\u610f',
      pass: '\u5408\u683c',
      info: '\u53c2\u8003\u60c5\u5831'
    };
    const tagLabel = tagType === 'pro' ? 'Pro\u5206\u6790' : '\u7121\u6599\u8a3a\u65ad';
    let html = '';
    ['fail', 'warn', 'pass', 'info'].forEach(status => {
      const items = groups[status];
      if (!items || items.length === 0) return;
      html += `<div class="result-section-header"><span class="result-section-header__dot result-section-header__dot--${status}"></span><span class="result-section-header__label">${sectionLabels[status]}</span><span class="result-section-header__line"></span><span class="result-section-header__count">${items.length}</span></div>`;
      items.forEach(item => {
        html += `<div class="result-card"><div class="result-card__header"><span class="result-card__status result-card__status--${item.status}"></span><span class="result-card__title">${escapeHtml(item.title)}</span><span class="result-card__tag result-card__tag--${tagType}">${tagLabel}</span></div><div class="result-card__body">${escapeHtml(item.body)}${item.value ? `<span class="result-card__value">${escapeHtml(item.value)}</span>` : ''}</div>${item.action ? formatAction(item.action) : ''}</div>`;
      });
    });
    return html;
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
