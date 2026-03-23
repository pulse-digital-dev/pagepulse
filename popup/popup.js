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

  // ---- Initialize ----
  scoreSection.classList.add('hidden');
  tabs.classList.add('hidden');
  resultsContainer.classList.add('hidden');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      showError('Unable to access this page.');
      return;
    }

    pageUrlEl.textContent = tab.url;

    // Check if we can inject
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:')) {
      showError('Cannot analyze browser internal pages.');
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
    } else {
      showError('Analysis returned no data.');
    }

  } catch (err) {
    console.error('PagePulse error:', err);
    showError('Failed to analyze page. Try refreshing.');
  }

  // ---- Render ----
  function renderResults() {
    loadingSection.classList.add('hidden');
    scoreSection.classList.remove('hidden');
    tabs.classList.remove('hidden');
    resultsContainer.classList.remove('hidden');

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
      structure: calcCategoryScore(analysisData.structure)
    };

    const total = Math.round(
      scores.seo * 0.35 +
      scores.performance * 0.25 +
      scores.accessibility * 0.20 +
      scores.structure * 0.20
    );

    const scoreNumber = $('#scoreNumber');
    const scoreRing = $('#scoreRing');
    const circumference = 2 * Math.PI * 52; // r=52

    // Animate score number
    animateNumber(scoreNumber, 0, total, 1000);

    // Set ring color
    let color1, color2;
    if (total >= 80) { color1 = '#00D68F'; color2 = '#00B4D8'; }
    else if (total >= 50) { color1 = '#FFD93D'; color2 = '#FFA94D'; }
    else { color1 = '#FF6B6B'; color2 = '#FF8E53'; }

    // Add gradient to SVG
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

    // Animate ring
    setTimeout(() => {
      const offset = circumference - (circumference * total / 100);
      scoreRing.style.strokeDashoffset = offset;
    }, 100);
  }

  function renderBadges() {
    const badgesContainer = $('#scoreBadges');
    const categories = [
      { key: 'seo', label: 'SEO', data: analysisData.seo },
      { key: 'performance', label: 'Speed', data: analysisData.performance },
      { key: 'accessibility', label: 'A11y', data: analysisData.accessibility },
      { key: 'structure', label: 'Structure', data: analysisData.structure }
    ];

    badgesContainer.innerHTML = categories.map(cat => {
      const score = calcCategoryScore(cat.data);
      const cls = score >= 80 ? 'good' : score >= 50 ? 'warn' : 'bad';
      return `<span class="score-badge score-badge--${cls}">${cat.label}: ${score}</span>`;
    }).join('');
  }

  function renderTabBadges() {
    const categories = ['seo', 'performance', 'accessibility', 'structure'];
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

    // Sort: fail first, then warn, then pass, then info
    const order = { fail: 0, warn: 1, pass: 2, info: 3 };
    const sorted = [...data].sort((a, b) => (order[a.status] || 3) - (order[b.status] || 3));

    resultsContainer.innerHTML = sorted.map(item => `
      <div class="result-card">
        <div class="result-card__header">
          <span class="result-card__status result-card__status--${item.status}"></span>
          <span class="result-card__title">${escapeHtml(item.title)}</span>
          <span class="result-card__tag result-card__tag--free">FREE</span>
        </div>
        <div class="result-card__body">
          ${escapeHtml(item.body)}
          ${item.value ? `<span class="result-card__value">${escapeHtml(item.value)}</span>` : ''}
        </div>
        ${item.action ? `<div class="result-card__action">${escapeHtml(item.action)}</div>` : ''}
      </div>
    `).join('');
  }

  // ---- Tab Switching ----
  $$('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.category;
      renderCategory(activeCategory);
    });
  });

  // ---- Upgrade Button ----
  $('#btnUpgrade').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://pagepulse.dev/pro' });
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
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
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

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
