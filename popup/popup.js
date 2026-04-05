// PagePulse - Popup Controller (i18n)
// Handles tab switching, analysis execution, result rendering

document.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);
  const msg = chrome.i18n.getMessage;

  // ---- i18n: apply data-i18n attributes ----
  $$('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const translated = msg(key);
    if (translated) el.textContent = translated;
  });

  // Set html lang attribute based on browser locale
  const uiLang = chrome.i18n.getUILanguage();
  document.documentElement.lang = uiLang.startsWith('ja') ? 'ja' : 'en';

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
      title: msg('proUpsellCroTitle'),
      desc: msg('proUpsellCroDesc'),
      features: [
        msg('proUpsellCroF1'),
        msg('proUpsellCroF2'),
        msg('proUpsellCroF3'),
        msg('proUpsellCroF4')
      ]
    },
    ec: {
      title: msg('proUpsellEcTitle'),
      desc: msg('proUpsellEcDesc'),
      features: [
        msg('proUpsellEcF1'),
        msg('proUpsellEcF2'),
        msg('proUpsellEcF3'),
        msg('proUpsellEcF4')
      ]
    },
    history: {
      title: msg('proUpsellHistTitle'),
      desc: msg('proUpsellHistDesc'),
      features: [
        msg('proUpsellHistF1'),
        msg('proUpsellHistF2'),
        msg('proUpsellHistF3')
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
      showError(msg('errorNoAccess'));
      return;
    }

    pageUrlEl.textContent = tab.url;

    // Check if we can inject
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:')) {
      showError(msg('errorBrowserPage'));
      return;
    }

    // Inject and execute analyzer
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content/analyzer.js']
    });

    if (result && result.result) {
      analysisData = result.result;
      translateAnalysisData(analysisData);
      renderResults();
      saveToHistory(tab.url, analysisData);
    } else {
      showError(msg('errorNoData'));
    }

  } catch (err) {
    console.error('PagePulse error:', err);
    showError(msg('errorFailed'));
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
      { key: 'llmo', label: msg('badgeAiOpt'), data: analysisData.llmo },
      { key: 'seo', label: 'SEO', data: analysisData.seo },
      { key: 'performance', label: msg('badgeSpeed'), data: analysisData.performance },
      { key: 'accessibility', label: msg('badgeA11y'), data: analysisData.accessibility },
      { key: 'structure', label: msg('badgeStructure'), data: analysisData.structure }
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

    resultsContainer.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted)"><div class="loading__spinner" style="margin:0 auto 10px"></div>' + msg('analyzingPro') + '</div>';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [file]
      });

      if (result && result.result) {
        // Translate titleKey for i18n
        result.result.forEach(item => {
          if (item.titleKey) {
            const translated = msg(item.titleKey);
            if (translated) item.title = translated;
          }
        });
        if (category === 'cro') croData = result.result;
        else ecData = result.result;
        renderProResults(result.result);
      } else {
        resultsContainer.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:30px">' + msg('proAnalysisError') + '</p>';
      }
    } catch (err) {
      console.error('Pro analysis error:', err);
      resultsContainer.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:30px">' + msg('proAnalysisFailed') + '</p>';
    }
  }

  function renderProResults(data) {
    if (isPro) {
      resultsContainer.innerHTML = buildGroupedCards(data, 'pro');
      return;
    }
    const fails = data.filter(item => item.status === 'fail');
    const warns = data.filter(item => item.status === 'warn');
    const passes = data.filter(item => item.status === 'pass');
    const infos = data.filter(item => item.status === 'info');

    const worstItem = fails[0] || warns[0];
    const remainingCount = data.length - (worstItem ? 1 : 0);

    let html = '';

    if (worstItem) {
      const statusLabel = worstItem.status === 'fail' ? msg('statusFail') : msg('statusWarn');
      html += `<div class="result-section-header"><span class="result-section-header__dot result-section-header__dot--${worstItem.status}"></span><span class="result-section-header__label">${statusLabel}</span><span class="result-section-header__line"></span></div>`;
      html += `<div class="result-card"><div class="result-card__header"><span class="result-card__status result-card__status--${worstItem.status}"></span><span class="result-card__title">${escapeHtml(worstItem.title)}</span><span class="result-card__tag result-card__tag--pro">${msg('tagPro')}</span></div><div class="result-card__body">${escapeHtml(worstItem.body)}${worstItem.value ? `<span class="result-card__value">${escapeHtml(worstItem.value)}</span>` : ''}</div>${worstItem.action ? formatAction(worstItem.action) : ''}</div>`;
    }

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

    html += `<div class="teaser-cta">`;
    html += `<div class="teaser-cta__stats">`;
    const failRemain = fails.length - (worstItem && worstItem.status === 'fail' ? 1 : 0);
    const warnRemain = warns.length - (worstItem && worstItem.status === 'warn' ? 1 : 0);
    if (failRemain > 0) html += `<span class="teaser-cta__stat teaser-cta__stat--fail">${msg('teaserFailRemain', [failRemain])}</span>`;
    if (warnRemain > 0) html += `<span class="teaser-cta__stat teaser-cta__stat--warn">${msg('teaserWarnRemain', [warnRemain])}</span>`;
    if (passes.length > 0) html += `<span class="teaser-cta__stat teaser-cta__stat--pass">${msg('teaserPassCount', [passes.length])}</span>`;
    if (infos.length > 0) html += `<span class="teaser-cta__stat teaser-cta__stat--info">${msg('teaserInfoCount', [infos.length])}</span>`;
    html += `</div>`;
    html += `<p class="teaser-cta__text">${msg('teaserSeeAll', [data.length])}</p>`;
    html += `<button class="pro-upsell__btn teaser-cta__btn" id="btnTeaserUpgrade"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>${msg('proUpgradeBtn')}</button>`;
    html += `</div>`;

    resultsContainer.innerHTML = html;

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
    $('#badge-cro').textContent = '-';
    $('#badge-ec').textContent = '-';
    $('#badge-history').textContent = '-';
  }

  function hideProTabs() {}

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

  $('#btnUpgradePro').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_PAYMENT_PAGE' });
  });

  $('#btnUpsellPro').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_PAYMENT_PAGE' });
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'PAYMENT_STATUS_CHANGED' && message.paid) {
      isPro = true;
      proBanner.classList.add('hidden');
      proUpsell.classList.add('hidden');
      proStatus.classList.remove('hidden');
      showProTabs();
      if (analysisData) renderCategory(activeCategory);
    }
  });

  // ---- Export Buttons ----
  $('#btnExportCSV').addEventListener('click', () => {
    if (!analysisData) return;
    const csv = generateCSV();
    downloadFile(csv, `pagepulse-report-${getTimestamp()}.csv`, 'text/csv;charset=utf-8');
    showExportDone($('#btnExportCSV'), 'CSV');
  });

  $('#btnExportJSON').addEventListener('click', () => {
    if (!analysisData) return;
    const json = generateJSON();
    downloadFile(json, `pagepulse-report-${getTimestamp()}.json`, 'application/json;charset=utf-8');
    showExportDone($('#btnExportJSON'), 'JSON');
  });

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
    const header = msg('csvHeader');
    const categoryNames = {
      seo: 'SEO',
      performance: msg('csvCatPerformance'),
      accessibility: msg('csvCatA11y'),
      structure: msg('csvCatStructure'),
      llmo: msg('csvCatAiOpt')
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
      tool: 'PagePulse v1.5.0',
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
    label.textContent = msg('downloadComplete');
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
        scores.seo * 0.20 + scores.performance * 0.20 +
        scores.accessibility * 0.15 + scores.structure * 0.15 + scores.llmo * 0.30
      );
      history.unshift({ url, timestamp: new Date().toISOString(), scores, totalScore });
      if (history.length > 50) history.length = 50;
      await chrome.storage.local.set({ history });
    } catch (err) {
      console.warn('Failed to save history:', err);
    }
  }

  async function renderHistory() {
    try {
      const result = await chrome.storage.local.get('history');
      const history = result.history || [];
      if (history.length === 0) {
        historyList.innerHTML = `<div class="history__empty"><span style="font-size:24px">\ud83d\udced</span><p>${msg('historyEmpty')}</p></div>`;
        return;
      }
      historyList.innerHTML = history.map((entry, i) => {
        const date = new Date(entry.timestamp);
        const dateStr = `${date.getMonth()+1}/${date.getDate()} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
        const scoreClass = entry.totalScore >= 80 ? 'good' : entry.totalScore >= 50 ? 'warn' : 'bad';
        const displayUrl = entry.url.replace(/^https?:\/\//, '').substring(0, 40);
        return `<div class="history__item" style="animation-delay:${i * 0.05}s"><div class="history__item-header"><span class="history__score history__score--${scoreClass}">${entry.totalScore}</span><span class="history__url">${escapeHtml(displayUrl)}</span><span class="history__date">${dateStr}</span></div><div class="history__badges">${Object.entries(entry.scores).map(([key, val]) => {
          const cls = val >= 80 ? 'good' : val >= 50 ? 'warn' : 'bad';
          const labels = { seo:'SEO', performance:'Speed', accessibility:'A11y', structure:'Str', llmo:'AI' };
          return `<span class="history__mini-badge history__mini-badge--${cls}">${labels[key]}:${val}</span>`;
        }).join('')}</div></div>`;
      }).join('');
    } catch (err) {
      historyList.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px">' + msg('historyLoadError') + '</p>';
    }
  }

  $('#btnClearHistory').addEventListener('click', async () => {
    await chrome.storage.local.remove('history');
    renderHistory();
  });

  // ---- i18n: translate titleKey/bodyKey/actionKey from analyzer results ----
  function translateAnalysisData(data) {
    const categories = ['seo', 'performance', 'accessibility', 'structure', 'llmo'];
    categories.forEach(cat => {
      if (!data[cat]) return;
      data[cat].forEach(item => {
        if (item.titleKey) {
          const translated = msg(item.titleKey);
          if (translated) item.title = translated;
          else item.title = item.titleKey;
        }
        if (item.bodyKey) {
          const translated = msg(item.bodyKey);
          if (translated) item.body = translated;
        }
        if (item.actionKey) {
          const translated = msg(item.actionKey);
          if (translated) item.action = translated;
        }
        if (!item.title) item.title = item.id || '';
        if (!item.body) item.body = '';
      });
    });
  }

  // ---- Utilities ----
  function calcCategoryScore(items) {
    if (!items || items.length === 0) return 100;
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

  function showError(errorMsg) {
    loadingSection.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    resultsContainer.innerHTML = `<div class="result-card" style="text-align:center; padding:40px 20px;"><div style="font-size:32px; margin-bottom:12px;">\u26A0\uFE0F</div><div class="result-card__title" style="font-size:14px;">${escapeHtml(errorMsg)}</div></div>`;
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
      fail: msg('statusFail'),
      warn: msg('statusWarn'),
      pass: msg('statusPass'),
      info: msg('statusInfo')
    };
    const tagLabel = tagType === 'pro' ? msg('tagPro') : msg('tagFree');
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
