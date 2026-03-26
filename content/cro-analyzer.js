// PagePulse - CRO (Conversion Rate Optimization) Analyzer
// Pro-only: Analyzes conversion-related elements on the page

(function() {
  'use strict';

  const results = [];

  function addResult(title, body, status, action, value) {
    results.push({ title, body, status, action: action || '', value: value || '' });
  }

  // ---- 1. CTA Detection ----
  function analyzeCTAs() {
    const buttons = document.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"], .btn, .button, [class*="cta"], [class*="CTA"]');
    const ctaLinks = document.querySelectorAll('a[class*="btn"], a[class*="button"], a[class*="cta"], a[class*="CTA"]');
    const totalCTAs = buttons.length + ctaLinks.length;

    if (totalCTAs === 0) {
      addResult('CTA\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093', '\u30da\u30fc\u30b8\u5185\u306b\u30dc\u30bf\u30f3\u3084CTA\u30ea\u30f3\u30af\u304c\u691c\u51fa\u3055\u308c\u307e\u305b\u3093\u3067\u3057\u305f\u3002', 'fail',
        '\u30da\u30fc\u30b8\u306e\u76ee\u7684\u306b\u5fdc\u3058\u305f\u660e\u78ba\u306aCTA\u30dc\u30bf\u30f3\u3092\u8a2d\u7f6e\u3057\u3066\u304f\u3060\u3055\u3044\u3002\n\ud83d\udcdd <a href="/contact" class="cta-btn" style="display:inline-block; padding:16px 32px; background:#ff6b35; color:#fff; border-radius:8px; font-weight:bold; text-decoration:none;">\u304a\u554f\u3044\u5408\u308f\u305b\u306f\u3053\u3061\u3089</a>');
    } else if (totalCTAs <= 2) {
      addResult('CTA\u6570', `\u30da\u30fc\u30b8\u5185\u306bCTA\u304c${totalCTAs}\u500b\u898b\u3064\u304b\u308a\u307e\u3057\u305f\u3002`, 'warn',
        'LP\u3084\u5546\u54c1\u30da\u30fc\u30b8\u3067\u306f\u3001\u30d5\u30a1\u30fc\u30b9\u30c8\u30d3\u30e5\u30fc\u3068\u30da\u30fc\u30b8\u4e0b\u90e8\u306e\u6700\u4f4e2\u7b87\u6240\u306bCTA\u3092\u914d\u7f6e\u3059\u308b\u306e\u304c\u6a19\u6e96\u3067\u3059\u3002', `${totalCTAs}\u500b`);
    } else {
      addResult('CTA\u6570', `\u30da\u30fc\u30b8\u5185\u306bCTA\u304c${totalCTAs}\u500b\u691c\u51fa\u3055\u308c\u307e\u3057\u305f\u3002`, 'pass', '', `${totalCTAs}\u500b`);
    }

    const firstCTA = buttons[0] || ctaLinks[0];
    if (firstCTA) {
      const rect = firstCTA.getBoundingClientRect();
      if (rect.top > window.innerHeight) {
        addResult('\u30d5\u30a1\u30fc\u30b9\u30c8\u30d3\u30e5\u30fc\u306bCTA\u304c\u3042\u308a\u307e\u305b\u3093', '\u6700\u521d\u306eCTA\u304c\u30b9\u30af\u30ed\u30fc\u30eb\u3057\u306a\u3044\u3068\u898b\u3048\u306a\u3044\u4f4d\u7f6e\u306b\u3042\u308a\u307e\u3059\u3002', 'warn',
          '\u30d5\u30a1\u30fc\u30b9\u30c8\u30d3\u30e5\u30fc\u5185\u306bCTA\u30dc\u30bf\u30f3\u3092\u914d\u7f6e\u3057\u3066\u304f\u3060\u3055\u3044\u3002\n\ud83d\udcdd <!-- \u30d2\u30fc\u30ed\u30fc\u30bb\u30af\u30b7\u30e7\u30f3\u5185\u306b\u914d\u7f6e -->\n<section class="hero">\n  <h1>\u898b\u51fa\u3057</h1>\n  <a href="/contact" class="cta">\u4eca\u3059\u3050\u76f8\u8ac7</a>\n</section>');
      } else {
        addResult('\u30d5\u30a1\u30fc\u30b9\u30c8\u30d3\u30e5\u30fc\u306bCTA\u3042\u308a', 'CTA\u304c\u30d5\u30a1\u30fc\u30b9\u30c8\u30d3\u30e5\u30fc\u5185\u306b\u914d\u7f6e\u3055\u308c\u3066\u3044\u307e\u3059\u3002', 'pass');
      }
    }
  }

  // ---- 2. Form Analysis ----
  function analyzeForms() {
    const forms = document.querySelectorAll('form');
    if (forms.length === 0) {
      addResult('\u30d5\u30a9\u30fc\u30e0\u306a\u3057', '\u30da\u30fc\u30b8\u5185\u306b\u30d5\u30a9\u30fc\u30e0\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3067\u3057\u305f\u3002', 'info',
        '\u304a\u554f\u3044\u5408\u308f\u305b\u3084\u8cc7\u6599\u8acb\u6c42\u30da\u30fc\u30b8\u3067\u306f\u30d5\u30a9\u30fc\u30e0\u304c\u5fc5\u8981\u3067\u3059\u3002');
      return;
    }
    forms.forEach((form, idx) => {
      const inputs = form.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea');
      const fieldCount = inputs.length;
      if (fieldCount > 7) {
        addResult(`\u30d5\u30a9\u30fc\u30e0${idx + 1}: \u30d5\u30a3\u30fc\u30eb\u30c9\u6570\u304c\u591a\u3044`, `\u5165\u529b\u30d5\u30a3\u30fc\u30eb\u30c9\u304c${fieldCount}\u500b\u3042\u308a\u307e\u3059\u3002`, 'warn',
          '\u30d5\u30a9\u30fc\u30e0\u306e\u30d5\u30a3\u30fc\u30eb\u30c9\u6570\u306f7\u4ee5\u4e0b\u304c\u7406\u60f3\u7684\u3067\u3059\u3002', `${fieldCount}\u30d5\u30a3\u30fc\u30eb\u30c9`);
      } else if (fieldCount > 0) {
        addResult(`\u30d5\u30a9\u30fc\u30e0${idx + 1}: \u30d5\u30a3\u30fc\u30eb\u30c9\u6570\u304c\u9069\u5207`, `\u5165\u529b\u30d5\u30a3\u30fc\u30eb\u30c9\u304c${fieldCount}\u500b\u3067\u3059\u3002`, 'pass', '', `${fieldCount}\u30d5\u30a3\u30fc\u30eb\u30c9`);
      }
    });
  }

  // ---- 3. Trust Signals ----
  function analyzeTrustSignals() {
    const body = document.body.innerText || '';
    const html = document.body.innerHTML || '';
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    if (phoneLinks.length > 0) {
      addResult('\u96fb\u8a71\u756a\u53f7\u30ea\u30f3\u30af\u3042\u308a', `tel:\u30ea\u30f3\u30af\u304c${phoneLinks.length}\u500b\u898b\u3064\u304b\u308a\u307e\u3057\u305f\u3002`, 'pass', '', `${phoneLinks.length}\u500b`);
    } else {
      addResult('\u96fb\u8a71\u756a\u53f7\u30ea\u30f3\u30af\u306a\u3057', '\u30e2\u30d0\u30a4\u30eb\u3067\u30bf\u30c3\u30d7\u3067\u304d\u308btel:\u30ea\u30f3\u30af\u304c\u3042\u308a\u307e\u305b\u3093\u3002', 'warn',
        'BtoB\u3084\u5e97\u8217\u7cfb\u30b5\u30a4\u30c8\u3067\u306f\u96fb\u8a71\u756a\u53f7\u3092\u30bf\u30c3\u30d7\u53ef\u80fd\u306b\u3057\u3066\u304f\u3060\u3055\u3044\u3002\n\ud83d\udcdd <a href="tel:03-1234-5678">\u260e 03-1234-5678</a>');
    }
    const reviewPatterns = /(\u53e3\u30b3\u30df|\u30ec\u30d3\u30e5\u30fc|\u304a\u5ba2\u69d8\u306e\u58f0|\u4e8b\u4f8b|\u5b9f\u7e3e|review|testimonial|rating|\u661f|\u2605|\u2606)/i;
    if (reviewPatterns.test(body) || reviewPatterns.test(html)) {
      addResult('\u4fe1\u983c\u6027\u8981\u7d20\u3042\u308a', '\u53e3\u30b3\u30df\u30fb\u30ec\u30d3\u30e5\u30fc\u30fb\u5b9f\u7e3e\u7b49\u306e\u4fe1\u983c\u6027\u8981\u7d20\u304c\u691c\u51fa\u3055\u308c\u307e\u3057\u305f\u3002', 'pass');
    } else {
      addResult('\u4fe1\u983c\u6027\u8981\u7d20\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093', '\u53e3\u30b3\u30df\u3001\u30ec\u30d3\u30e5\u30fc\u3001\u5b9f\u7e3e\u6570\u7b49\u306e\u8868\u793a\u304c\u691c\u51fa\u3055\u308c\u307e\u305b\u3093\u3067\u3057\u305f\u3002', 'warn',
        '\u30bd\u30fc\u30b7\u30e3\u30eb\u30d7\u30eb\u30fc\u30d5\u3092\u8ffd\u52a0\u3057\u3066\u304f\u3060\u3055\u3044\u3002\n\ud83d\udcdd <section class="testimonials">\n  <h2>\u304a\u5ba2\u69d8\u306e\u58f0</h2>\n  <blockquote>\u201c\u975e\u5e38\u306b\u6e80\u8db3\u3057\u3066\u3044\u307e\u3059\u201d<cite>\u25cb\u25cb\u69d8</cite></blockquote>\n</section>');
    }
    const badgePatterns = /(\u8a8d\u8a3c|\u8cc7\u683c|\u53d7\u8cde|\u30a2\u30ef\u30fc\u30c9|\u30e1\u30c7\u30a3\u30a2\u63b2\u8f09|ISO|SSL|\u30bb\u30ad\u30e5\u30ea\u30c6\u30a3|\u5b89\u5fc3|\u4fdd\u8a3c|certified|award|featured)/i;
    if (badgePatterns.test(body)) {
      addResult('\u8a8d\u8a3c\u30fb\u5b9f\u7e3e\u30d0\u30c3\u30b8\u3042\u308a', '\u8a8d\u8a3c\u30fb\u53d7\u8cde\u30fb\u30e1\u30c7\u30a3\u30a2\u63b2\u8f09\u7b49\u306e\u8868\u8a18\u304c\u898b\u3064\u304b\u308a\u307e\u3057\u305f\u3002', 'pass');
    }
  }

  // ---- 4. Urgency & Scarcity ----
  function analyzeUrgency() {
    const body = document.body.innerText || '';
    const urgencyPatterns = /(\u671f\u9593\u9650\u5b9a|\u4eca\u3060\u3051|\u6b8b\u308a\u308f\u305a\u304b|\u5728\u5eab\u9650\u308a|\u6570\u91cf\u9650\u5b9a|\u5148\u7740|\u7de0\u5207|\u30bf\u30a4\u30e0\u30bb\u30fc\u30eb|\u30ab\u30a6\u30f3\u30c8\u30c0\u30a6\u30f3|limited|hurry|only .* left)/i;
    if (urgencyPatterns.test(body)) {
      addResult('\u7dcb\u8feb\u611f\u306e\u8868\u73fe\u3042\u308a', '\u671f\u9593\u9650\u5b9a\u3084\u5728\u5eab\u9650\u308a\u7b49\u306e\u7dcb\u8feb\u8868\u73fe\u304c\u691c\u51fa\u3055\u308c\u307e\u3057\u305f\u3002', 'info',
        '\u904e\u5ea6\u306a\u7dcb\u8feb\u611f\u306f\u4fe1\u983c\u3092\u640d\u306a\u3044\u307e\u3059\u3002\u4e8b\u5b9f\u306b\u57fa\u3065\u3044\u305f\u7dcb\u8feb\u8868\u73fe\u306e\u307f\u4f7f\u7528\u3057\u3066\u304f\u3060\u3055\u3044\u3002');
    }
  }

  // ---- 5. Pricing Display ----
  function analyzePricing() {
    const body = document.body.innerText || '';
    const pricePatterns = /(\u00a5[\d,]+|[\d,]+\u5186|\$[\d,.]+|\u7a0e\u8fbc|\u7a0e\u5225|\u6708\u984d|\u5e74\u984d|pricing|price)/i;
    if (pricePatterns.test(body)) {
      addResult('\u4fa1\u683c\u8868\u793a\u3042\u308a', '\u30da\u30fc\u30b8\u5185\u306b\u4fa1\u683c\u60c5\u5831\u304c\u691c\u51fa\u3055\u308c\u307e\u3057\u305f\u3002', 'pass',
        '\u4fa1\u683c\u306e\u900f\u660e\u6027\u306f\u30b3\u30f3\u30d0\u30fc\u30b8\u30e7\u30f3\u7387\u5411\u4e0a\u306b\u8ca2\u732e\u3057\u307e\u3059\u3002');
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
      addResult('\u8907\u6570\u306e\u554f\u3044\u5408\u308f\u305b\u624b\u6bb5', `${methods.join(', ')}\u304c\u691c\u51fa\u3055\u308c\u307e\u3057\u305f\u3002`, 'pass', '', methods.join(', '));
    } else if (methods.length === 1) {
      addResult('\u554f\u3044\u5408\u308f\u305b\u624b\u6bb5\u304c1\u3064', `${methods[0]}\u306e\u307f\u691c\u51fa\u3055\u308c\u307e\u3057\u305f\u3002`, 'warn',
        '\u8907\u6570\u306e\u9023\u7d61\u624b\u6bb5\u3092\u63d0\u4f9b\u3059\u308b\u3068\u30b3\u30f3\u30d0\u30fc\u30b8\u30e7\u30f3\u304c\u4e0a\u304c\u308a\u307e\u3059\u3002');
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
      addResult('\u30bf\u30c3\u30c1\u30bf\u30fc\u30b2\u30c3\u30c8\u304c\u5c0f\u3055\u3044', `44x44px\u672a\u6e80\u306e\u30bf\u30c3\u30c1\u30bf\u30fc\u30b2\u30c3\u30c8\u304c${smallTargets}\u500b\u3042\u308a\u307e\u3059\u3002`, 'warn',
        '\u30e2\u30d0\u30a4\u30eb\u3067\u306f\u30bf\u30c3\u30c1\u30bf\u30fc\u30b2\u30c3\u30c8\u3092\u6700\u4f4e44x44px\u306b\u3057\u3066\u304f\u3060\u3055\u3044\u3002\n\ud83d\udcdd button, a, input { min-width: 44px; min-height: 44px; }', `${smallTargets}\u500b`);
    } else {
      addResult('\u30bf\u30c3\u30c1\u30bf\u30fc\u30b2\u30c3\u30c8\u30b5\u30a4\u30ba', '\u5927\u534a\u306e\u30a4\u30f3\u30bf\u30e9\u30af\u30c6\u30a3\u30d6\u8981\u7d20\u304c\u9069\u5207\u306a\u30b5\u30a4\u30ba\u3067\u3059\u3002', 'pass');
    }
  }

  analyzeCTAs();
  analyzeForms();
  analyzeTrustSignals();
  analyzeUrgency();
  analyzePricing();
  analyzeContactMethods();
  analyzeMobileUX();

  return results;
})();
