// PagePulse - CRO (Conversion Rate Optimization) Analyzer
// Pro-only: Analyzes conversion-related elements on the page
// i18n-ready: Uses titleKey for translation by popup.js

(function() {
  'use strict';

  const results = [];

  function addResult(titleKey, body, status, action, value) {
    results.push({ titleKey, title: titleKey, body, status, action: action || '', value: value || '' });
  }

  // ---- Page Type Detection ----
  const url = location.href.toLowerCase();
  const path = location.pathname.toLowerCase();
  const isTopPage = path === '/' || path === '/index.html' || path === '/index.php' || /^\/[^/]*\.(html?|php)$/.test(path);
  const isProductPage = /\/(product|item|goods|shop|detail|p\/)/i.test(path) || document.querySelector('[class*="product-detail"], [class*="item-detail"], [itemtype*="Product"]');
  const isCategoryPage = /\/(category|collection|catalog|list|archive|c\/)/i.test(path) || document.querySelector('[class*="product-list"], [class*="item-list"]');
  const pageType = isProductPage ? 'product' : isCategoryPage ? 'category' : isTopPage ? 'top' : 'other';

  // ---- 1. CTA Detection ----
  function analyzeCTAs() {
    const buttons = document.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"], .btn, .button, [class*="cta"], [class*="CTA"]');
    const ctaLinks = document.querySelectorAll('a[class*="btn"], a[class*="button"], a[class*="cta"], a[class*="CTA"]');
    const totalCTAs = buttons.length + ctaLinks.length;

    if (totalCTAs === 0) {
      addResult('croCTAMissing', '', 'fail');
    } else if (totalCTAs <= 2) {
      addResult('croCTAFew', `${totalCTAs} CTAs`, 'warn', '', `${totalCTAs}`);
    } else {
      addResult('croCTACount', `${totalCTAs} CTAs`, 'pass', '', `${totalCTAs}`);
    }

    const firstCTA = buttons[0] || ctaLinks[0];
    if (firstCTA) {
      const rect = firstCTA.getBoundingClientRect();
      if (rect.top > window.innerHeight) {
        addResult('croCTABelowFold', '', 'warn');
      } else {
        addResult('croCTAAboveFold', '', 'pass');
      }
    }
  }

  // ---- 2. Form Analysis ----
  function analyzeForms() {
    const forms = document.querySelectorAll('form');
    if (forms.length === 0) {
      addResult('croFormNone', '', 'info');
      return;
    }
    forms.forEach((form, idx) => {
      const inputs = form.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea');
      const fieldCount = inputs.length;
      if (fieldCount > 7) {
        addResult('croFormTooMany', `Form ${idx + 1}: ${fieldCount} fields`, 'warn', '', `${fieldCount}`);
      } else if (fieldCount > 0) {
        addResult('croFormOk', `Form ${idx + 1}: ${fieldCount} fields`, 'pass', '', `${fieldCount}`);
      }
    });
  }

  // ---- 3. Trust Signals ----
  function analyzeTrustSignals() {
    const body = document.body.innerText || '';
    const html = document.body.innerHTML || '';
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    if (phoneLinks.length > 0) {
      addResult('croPhoneLink', `${phoneLinks.length}`, 'pass', '', `${phoneLinks.length}`);
    } else {
      const phoneStatus = (pageType === 'product' || pageType === 'category' || pageType === 'top') ? 'info' : 'warn';
      addResult('croPhoneMissing', '', phoneStatus);
    }
    const reviewPatterns = /(\u53e3\u30b3\u30df|\u30ec\u30d3\u30e5\u30fc|\u304a\u5ba2\u69d8\u306e\u58f0|\u4e8b\u4f8b|\u5b9f\u7e3e|review|testimonial|rating|\u661f|\u2605|\u2606)/i;
    if (reviewPatterns.test(body) || reviewPatterns.test(html)) {
      addResult('croTrustSignals', '', 'pass');
    } else {
      addResult('croTrustMissing', '', 'warn');
    }
    const badgePatterns = /(\u8a8d\u8a3c|\u8cc7\u683c|\u53d7\u8cde|\u30a2\u30ef\u30fc\u30c9|\u30e1\u30c7\u30a3\u30a2\u63b2\u8f09|ISO|SSL|\u30bb\u30ad\u30e5\u30ea\u30c6\u30a3|\u5b89\u5fc3|\u4fdd\u8a3c|certified|award|featured)/i;
    if (badgePatterns.test(body)) {
      addResult('croBadges', '', 'pass');
    }
  }

  // ---- 4. Urgency & Scarcity ----
  function analyzeUrgency() {
    const body = document.body.innerText || '';
    const urgencyPatterns = /(\u671f\u9593\u9650\u5b9a|\u4eca\u3060\u3051|\u6b8b\u308a\u308f\u305a\u304b|\u5728\u5eab\u9650\u308a|\u6570\u91cf\u9650\u5b9a|\u5148\u7740|\u7de0\u5207|\u30bf\u30a4\u30e0\u30bb\u30fc\u30eb|\u30ab\u30a6\u30f3\u30c8\u30c0\u30a6\u30f3|limited|hurry|only .* left)/i;
    if (urgencyPatterns.test(body)) {
      addResult('croUrgency', '', 'info');
    }
  }

  // ---- 5. Pricing Display ----
  function analyzePricing() {
    const body = document.body.innerText || '';
    const pricePatterns = /(\u00a5[\d,]+|[\d,]+\u5186|\$[\d,.]+|\u7a0e\u8fbc|\u7a0e\u5225|\u6708\u984d|\u5e74\u984d|pricing|price)/i;
    if (pricePatterns.test(body)) {
      addResult('croPricing', '', 'pass');
    }
  }

  // ---- 6. Contact Methods ----
  function analyzeContactMethods() {
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    const lineLinks = document.querySelectorAll('a[href*="line.me"], a[href*="lin.ee"]');
    const chatWidgets = document.querySelectorAll('[class*="chat"], [id*="chat"], [class*="intercom"], [class*="zendesk"], [class*="crisp"]');
    const methods = [];
    if (emailLinks.length > 0) methods.push('email');
    if (lineLinks.length > 0) methods.push('LINE');
    if (chatWidgets.length > 0) methods.push('chat');
    if (methods.length >= 2) {
      addResult('croMultiContact', methods.join(', '), 'pass', '', methods.join(', '));
    } else if (methods.length === 1) {
      addResult('croSingleContact', methods[0], 'warn');
    }
  }

  // ---- 7. Mobile UX ----
  function analyzeMobileUX() {
    const interactives = document.querySelectorAll('button, a, input, select, textarea');
    let smallTargets = 0;
    interactives.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
        smallTargets++;
      }
    });
    if (smallTargets > 5) {
      addResult('croTouchSmall', `${smallTargets}`, 'warn', '', `${smallTargets}`);
    } else {
      addResult('croTouchOk', '', 'pass');
    }
  }

  // ---- 8. Heading Structure ----
  function analyzeHeadings() {
    const h1s = document.querySelectorAll('h1');
    if (h1s.length === 0) {
      addResult('croH1Missing', '', 'warn');
    } else if (h1s.length > 1) {
      addResult('croH1Multiple', `${h1s.length}`, 'warn', '', `${h1s.length}`);
    } else {
      addResult('croH1Ok', '', 'pass');
    }

    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    let skipped = false;
    headings.forEach(h => {
      const level = parseInt(h.tagName.substring(1));
      if (previousLevel > 0 && level - previousLevel > 1) skipped = true;
      previousLevel = level;
    });
    if (skipped) {
      addResult('croHeadingSkip', '', 'info');
    }
  }

  // ---- 9. Image Alt Text ----
  function analyzeImageAlt() {
    const images = document.querySelectorAll('img');
    let missingAltCount = 0;
    images.forEach(img => {
      if (img.width <= 1 || img.height <= 1) return;
      if (!img.hasAttribute('alt') || img.getAttribute('alt').trim() === '') {
        missingAltCount++;
      }
    });
    if (images.length === 0) return;
    if (missingAltCount > 0) {
      const status = missingAltCount > (images.length * 0.5) ? 'fail' : 'warn';
      addResult('croAltMissing', `${missingAltCount} / ${images.length}`, status, '', `${missingAltCount}`);
    } else {
      addResult('croAltOk', `${images.length}`, 'pass');
    }
  }

  // ---- 10. Sticky CTA ----
  function analyzeStickyCTA() {
    const interactives = document.querySelectorAll('a, button, [role="button"], .btn, .cta, [class*="cv-"], [id*="cv-"]');
    let hasStickyCTA = false;
    interactives.forEach(el => {
      if (hasStickyCTA) return;
      let current = el;
      for (let i = 0; i < 4; i++) {
        if (!current || current === document.body) break;
        const compStyle = window.getComputedStyle(current);
        if (compStyle.position === 'fixed' || compStyle.position === 'sticky') {
          const rect = current.getBoundingClientRect();
          if (rect.bottom >= window.innerHeight - 80 || rect.top <= 80) {
            hasStickyCTA = true;
          }
        }
        current = current.parentElement;
      }
    });

    if (hasStickyCTA) {
      addResult('croStickyOk', '', 'pass');
    } else {
      const status = (pageType === 'product' || pageType === 'top') ? 'warn' : 'info';
      addResult('croStickyMissing', '', status);
    }
  }

  // ---- 11. Text Density ----
  function analyzeTextDensity() {
    const paragraphs = document.querySelectorAll('p, .text, .desc, .description');
    let longBlocks = 0;
    paragraphs.forEach(p => {
      const text = p.innerText.trim();
      if (text.length > 200 && p.querySelectorAll('br').length < (text.length / 100)) {
        longBlocks++;
      }
    });
    if (longBlocks > 3) {
      addResult('croTextDense', `${longBlocks}`, 'warn', '', `${longBlocks}`);
    } else if (longBlocks > 0) {
      addResult('croTextSlightly', `${longBlocks}`, 'info');
    }
  }

  analyzeCTAs();
  analyzeTrustSignals();
  analyzeUrgency();
  analyzePricing();
  analyzeContactMethods();
  analyzeMobileUX();
  analyzeHeadings();
  analyzeImageAlt();
  analyzeStickyCTA();
  analyzeTextDensity();

  return results;
})();
