// PagePulse - Content Script Analyzer
// Injected into the active tab to analyze the page

(function() {
  'use strict';

  const results = {
    url: window.location.href,
    seo: [],
    performance: [],
    accessibility: [],
    structure: [],
    llmo: []
  };

  // ============ SEO Analysis ============

  function analyzeSEO() {
    // Title
    const title = document.title;
    if (!title) {
      results.seo.push({ id: 'title-missing', status: 'fail', title: '\u30bf\u30a4\u30c8\u30eb\u30bf\u30b0 (Title) \u306a\u3057', body: '\u30da\u30fc\u30b8\u306b<title>\u30bf\u30b0\u304c\u3042\u308a\u307e\u305b\u3093\u3002\u691c\u7d22\u30a8\u30f3\u30b8\u30f3\u3084\u30d6\u30e9\u30a6\u30b6\u306b\u4e0d\u53ef\u6b20\u306a\u8981\u7d20\u3067\u3059\u3002', action: '30\u301c60\u6587\u5b57\u306e\u308f\u304b\u308a\u3084\u3059\u3044<title>\u30bf\u30b0\u3092\u8ffd\u52a0\u3057\u3066\u304f\u3060\u3055\u3044\u3002' });
    } else if (title.length < 30) {
      results.seo.push({ id: 'title-short', status: 'warn', title: '\u30bf\u30a4\u30c8\u30eb\u304c\u77ed\u3059\u304e\u307e\u3059', body: `"${title}" (${title.length}\u6587\u5b57)`, action: `\u73fe\u5728\u306e\u30bf\u30a4\u30c8\u30eb\u306f${title.length}\u6587\u5b57\u3067\u3059\u3002\u691c\u7d22\u7d50\u679c\u306e\u8996\u8a8d\u6027\u3092\u9ad8\u3081\u308b\u305f\u3081\u300130\u301c60\u6587\u5b57\u3092\u76ee\u5b89\u306b\u3057\u3066\u304f\u3060\u3055\u3044\u3002` });
    } else if (title.length > 60) {
      results.seo.push({ id: 'title-long', status: 'warn', title: '\u30bf\u30a4\u30c8\u30eb\u304c\u9577\u3059\u304e\u307e\u3059', body: `"${title}" (${title.length}\u6587\u5b57)`, action: `\u73fe\u5728\u306e\u30bf\u30a4\u30c8\u30eb\u306f${title.length}\u6587\u5b57\u3042\u308a\u3001\u691c\u7d22\u7d50\u679c\u3067\u7701\u7565\u3055\u308c\u308b\u53ef\u80fd\u6027\u304c\u3042\u308a\u307e\u3059\u300260\u6587\u5b57\u4ee5\u5185\u306b\u53ce\u3081\u3066\u304f\u3060\u3055\u3044\u3002` });
    } else {
      results.seo.push({ id: 'title-ok', status: 'pass', title: '\u30da\u30fc\u30b8\u30bf\u30a4\u30c8\u30eb', body: `"${title}" (${title.length}\u6587\u5b57)`, action: '' });
    }

    // Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc || !metaDesc.content) {
      results.seo.push({ id: 'meta-desc-missing', status: 'fail', title: '\u30e1\u30bf\u30c7\u30a3\u30b9\u30af\u30ea\u30d7\u30b7\u30e7\u30f3\u306a\u3057', body: '\u30e1\u30bf\u30c7\u30a3\u30b9\u30af\u30ea\u30d7\u30b7\u30e7\u30f3\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3002\u691c\u7d22\u7d50\u679c\u306e\u30af\u30ea\u30c3\u30af\u7387(CTR)\u306b\u76f4\u7d50\u3059\u308b\u91cd\u8981\u9805\u76ee\u3067\u3059\u3002', action: '\u30da\u30fc\u30b8\u5185\u5bb9\u3092\u8981\u7d04\u3057\u305f120\u301c160\u6587\u5b57\u7a0b\u5ea6\u306e\u30e1\u30bf\u30c7\u30a3\u30b9\u30af\u30ea\u30d7\u30b7\u30e7\u30f3\u3092\u8ffd\u52a0\u3057\u3066\u304f\u3060\u3055\u3044\u3002' });
    } else {
      const len = metaDesc.content.length;
      if (len < 120) {
        results.seo.push({ id: 'meta-desc-short', status: 'warn', title: '\u30e1\u30bf\u30c7\u30a3\u30b9\u30af\u30ea\u30d7\u30b7\u30e7\u30f3\u304c\u77ed\u3059\u304e\u307e\u3059', body: `${len}\u6587\u5b57`, value: metaDesc.content, action: `120\u301c160\u6587\u5b57\u306b\u62e1\u5f35\u3057\u3066\u304f\u3060\u3055\u3044\u3002\u77ed\u3059\u304e\u308b\u3068Google\u304c\u81ea\u52d5\u751f\u6210\u3057\u305f\u30c6\u30ad\u30b9\u30c8\u306b\u7f6e\u304d\u63db\u3048\u3089\u308c\u308b\u53ef\u80fd\u6027\u304c\u3042\u308a\u307e\u3059\u3002` });
      } else if (len > 160) {
        results.seo.push({ id: 'meta-desc-long', status: 'warn', title: '\u30e1\u30bf\u30c7\u30a3\u30b9\u30af\u30ea\u30d7\u30b7\u30e7\u30f3\u304c\u9577\u3059\u304e\u307e\u3059', body: `${len}\u6587\u5b57\uff08\u7701\u7565\u3055\u308c\u308b\u53ef\u80fd\u6027\u3042\u308a\uff09`, value: metaDesc.content, action: `\u691c\u7d22\u7d50\u679c\u3067\u306e\u7701\u7565\u3092\u9632\u3050\u305f\u3081\u3001160\u6587\u5b57\u4ee5\u5185\u306b\u77ed\u7e2e\u3057\u3066\u304f\u3060\u3055\u3044\u3002` });
      } else {
        results.seo.push({ id: 'meta-desc-ok', status: 'pass', title: '\u30e1\u30bf\u30c7\u30a3\u30b9\u30af\u30ea\u30d7\u30b7\u30e7\u30f3', body: `${len}\u6587\u5b57`, value: metaDesc.content, action: '' });
      }
    }

    // H1
    const h1s = document.querySelectorAll('h1');
    if (h1s.length === 0) {
      results.seo.push({ id: 'h1-missing', status: 'fail', title: 'H1\u30bf\u30b0\u306a\u3057', body: 'H1\u898b\u51fa\u3057\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3002\u3059\u3079\u3066\u306e\u30da\u30fc\u30b8\u306b\u306fH1\u30bf\u30b0\u304c1\u3064\u5fc5\u8981\u3067\u3059\u3002', action: '\u30da\u30fc\u30b8\u306e\u4e3b\u8981\u306a\u30c6\u30fc\u30de\u3092\u8868\u3059H1\u30bf\u30b0\u30921\u3064\u8ffd\u52a0\u3057\u3066\u304f\u3060\u3055\u3044\u3002' });
    } else if (h1s.length > 1) {
      results.seo.push({ id: 'h1-multiple', status: 'warn', title: '\u8907\u6570\u306eH1\u30bf\u30b0', body: `${h1s.length}\u500b\u306eH1\u30bf\u30b0\u304c\u898b\u3064\u304b\u308a\u307e\u3057\u305f\u3002H1\u306f1\u30da\u30fc\u30b8\u306b\u3064\u304d1\u3064\u304c\u6700\u9069\u3067\u3059\u3002`, action: '\u6700\u3082\u91cd\u8981\u306a\u898b\u51fa\u3057\u3092H1\u3068\u3057\u3001\u305d\u308c\u4ee5\u5916\u306fH2\u3084H3\u306b\u5909\u66f4\u3057\u3066\u304f\u3060\u3055\u3044\u3002' });
    } else {
      results.seo.push({ id: 'h1-ok', status: 'pass', title: 'H1\u30bf\u30b0', body: 'H1\u304c1\u3064\u898b\u3064\u304b\u308a\u307e\u3057\u305f', value: h1s[0].textContent.trim().substring(0, 100), action: '' });
    }

    // Canonical
    const canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      results.seo.push({ id: 'canonical-missing', status: 'warn', title: 'Canonical URL\u306a\u3057', body: 'Canonical URL\u304c\u5b9a\u7fa9\u3055\u308c\u3066\u3044\u307e\u305b\u3093\u3002\u91cd\u8907\u30b3\u30f3\u30c6\u30f3\u30c4\u306e\u554f\u984c\u3092\u5f15\u304d\u8d77\u3053\u3059\u53ef\u80fd\u6027\u304c\u3042\u308a\u307e\u3059\u3002', action: '<link rel="canonical"> \u3092\u8ffd\u52a0\u3057\u3001\u3053\u306e\u30da\u30fc\u30b8\u306e\u6b63\u898fURL\u3092\u6307\u5b9a\u3057\u3066\u304f\u3060\u3055\u3044\u3002' });
    } else {
      results.seo.push({ id: 'canonical-ok', status: 'pass', title: 'Canonical URL', body: 'Canonical\u30bf\u30b0\u3042\u308a', value: canonical.href, action: '' });
    }

    // OGP
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogMissing = [];
    if (!ogTitle) ogMissing.push('og:title');
    if (!ogDesc) ogMissing.push('og:description');
    if (!ogImage) ogMissing.push('og:image');
    
    if (ogMissing.length === 0) {
      results.seo.push({ id: 'ogp-ok', status: 'pass', title: 'OGP\u30bf\u30b0 (SNS\u30b7\u30a7\u30a2\u8a2d\u5b9a)', body: 'og:title, og:description, og:image \u304c\u3059\u3079\u3066\u8a2d\u5b9a\u3055\u308c\u3066\u3044\u307e\u3059', action: '' });
    } else {
      results.seo.push({ id: 'ogp-missing', status: 'warn', title: 'OGP\u30bf\u30b0\u304c\u4e0d\u5b8c\u5168\u3067\u3059', body: `\u4e0d\u8db3: ${ogMissing.join(', ')}`, action: 'SNS\u7b49\u3067\u30b7\u30a7\u30a2\u3055\u308c\u305f\u969b\u306e\u8868\u793a\u3092\u6700\u9069\u5316\u3059\u308b\u305f\u3081\u3001\u3053\u308c\u3089\u306eOGP\u30bf\u30b0\u3092\u8ffd\u52a0\u3057\u3066\u304f\u3060\u3055\u3044\u3002' });
    }

    // Heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let hierarchyOk = true;
    let prevLevel = 0;
    headings.forEach(h => {
      const level = parseInt(h.tagName.charAt(1));
      if (level > prevLevel + 1 && prevLevel > 0) hierarchyOk = false;
      prevLevel = level;
    });
    if (!hierarchyOk) {
      results.seo.push({ id: 'heading-skip', status: 'warn', title: '\u898b\u51fa\u3057\u69cb\u9020\u306e\u30b9\u30ad\u30c3\u30d7', body: `\u898b\u51fa\u3057\u30ec\u30d9\u30eb\u304c\u98db\u3093\u3067\u3044\u307e\u3059\uff08\u4f8b: H1\u304b\u3089H3\u306a\u3069\uff09\u3002\u5408\u8a08${headings.length}\u500b\u306e\u898b\u51fa\u3057\u3002`, action: 'H1\u2192H2\u2192H3\u3068\u3001\u968e\u5c64\u3092\u30b9\u30ad\u30c3\u30d7\u305b\u305a\u306b\u9806\u756a\u306b\u30bf\u30ae\u30f3\u30b0\u3057\u3066\u304f\u3060\u3055\u3044\u3002' });
    } else if (headings.length > 0) {
      results.seo.push({ id: 'heading-ok', status: 'pass', title: '\u898b\u51fa\u3057\u69cb\u9020', body: `${headings.length}\u500b\u306e\u898b\u51fa\u3057\uff08\u968e\u5c64\u69cb\u9020\u306b\u554f\u984c\u306a\u3057\uff09`, action: '' });
    }
  }

  // ============ Performance Analysis ============

  function analyzePerformance() {
    // Images without dimensions
    const images = document.querySelectorAll('img');
    const imgsNoDims = [];
    let totalImages = images.length;

    images.forEach(img => {
      if (!img.getAttribute('width') && !img.getAttribute('height') && !img.style.width && !img.style.height) {
        imgsNoDims.push(img.src || img.dataset.src || '(inline)');
      }
    });

    results.performance.push({
      id: 'img-count', status: 'info', title: '\u7dcf\u753b\u50cf\u6570',
      body: `\u30da\u30fc\u30b8\u5185\u306b${totalImages}\u679a\u306e\u753b\u50cf\u304c\u898b\u3064\u304b\u308a\u307e\u3057\u305f`,
      action: ''
    });

    if (imgsNoDims.length > 0) {
      results.performance.push({
        id: 'img-no-dims', status: 'warn', title: '\u753b\u50cf\u30b5\u30a4\u30ba\u306e\u6307\u5b9a\u306a\u3057',
        body: `\u5168${totalImages}\u679a\u4e2d\u3001${imgsNoDims.length}\u679a\u306e\u753b\u50cf\u306b width/height \u5c5e\u6027\u304c\u3042\u308a\u307e\u305b\u3093`,
        action: `\u30ec\u30a4\u30a2\u30a6\u30c8\u30b7\u30d5\u30c8(CLS)\u3092\u9632\u3050\u305f\u3081\u3001\u660e\u793a\u7684\u306bwidth\u3068height\u3092\u8ffd\u52a0\u3057\u3066\u304f\u3060\u3055\u3044\u3002Core Web Vitals\u306e\u30b9\u30b3\u30a2\u5411\u4e0a\u306b\u7e4b\u304c\u308a\u307e\u3059\u3002`
      });
    } else if (totalImages > 0) {
      results.performance.push({
        id: 'img-dims-ok', status: 'pass', title: '\u753b\u50cf\u30b5\u30a4\u30ba\u306e\u6307\u5b9a',
        body: '\u3059\u3079\u3066\u306e\u753b\u50cf\u306bwidth/height\u6307\u5b9a\u304c\u3042\u308a\u307e\u3059', action: ''
      });
    }

    // Lazy loading
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const belowFoldImgs = Array.from(images).filter(img => {
      const rect = img.getBoundingClientRect();
      return rect.top > viewportHeight;
    });
    const lazyCount = belowFoldImgs.filter(img => img.loading === 'lazy').length;
    if (belowFoldImgs.length > 0 && lazyCount < belowFoldImgs.length) {
      results.performance.push({
        id: 'img-lazy', status: 'warn', title: '\u9045\u5ef6\u8aad\u307f\u8fbc\u307f (Lazy Load) \u306a\u3057',
        body: `\u30d5\u30a1\u30fc\u30b9\u30c8\u30d3\u30e5\u30fc\u4ee5\u4e0b\u306e${belowFoldImgs.length}\u679a\u4e2d\u3001${belowFoldImgs.length - lazyCount}\u679a\u304c\u9045\u5ef6\u8aad\u307f\u8fbc\u307f\u3055\u308c\u3066\u3044\u307e\u305b\u3093`,
        action: '\u521d\u671f\u8aad\u307f\u8fbc\u307f\u901f\u5ea6\u3092\u5411\u4e0a\u3055\u305b\u308b\u305f\u3081\u3001\u30b9\u30af\u30ed\u30fc\u30eb\u3055\u308c\u306a\u3044\u3068\u898b\u3048\u306a\u3044\u753b\u50cf\u306b\u306f loading="lazy" \u3092\u8ffd\u52a0\u3057\u3066\u304f\u3060\u3055\u3044\u3002'
      });
    } else if (belowFoldImgs.length > 0) {
      results.performance.push({
        id: 'img-lazy-ok', status: 'pass', title: '\u9045\u5ef6\u8aad\u307f\u8fbc\u307f (Lazy Load)',
        body: '\u30d5\u30a1\u30fc\u30b9\u30c8\u30d3\u30e5\u30fc\u4ee5\u4e0b\u306e\u5168\u753b\u50cf\u306b\u9045\u5ef6\u8aad\u307f\u8fbc\u307f\u304c\u9069\u7528\u3055\u308c\u3066\u3044\u307e\u3059', action: ''
      });
    }

    // Scripts
    const allScripts = document.querySelectorAll('script[src]');
    const headScripts = document.head ? document.head.querySelectorAll('script[src]') : [];
    const blockingScripts = Array.from(headScripts).filter(s => !s.async && !s.defer && !s.type?.includes('module'));
    if (blockingScripts.length > 0) {
      results.performance.push({
        id: 'script-blocking', status: 'warn', title: '\u30ec\u30f3\u30c0\u30ea\u30f3\u30b0\u30d6\u30ed\u30c3\u30af\u30fb\u30b9\u30af\u30ea\u30d7\u30c8',
        body: `<head> \u30bf\u30b0\u5185\u306b\u30da\u30fc\u30b8\u63cf\u753b\u3092\u30d6\u30ed\u30c3\u30af\u3059\u308b\u30b9\u30af\u30ea\u30d7\u30c8\u304c${blockingScripts.length}\u500b\u3042\u308a\u307e\u3059`,
        action: '\u30ec\u30f3\u30c0\u30ea\u30f3\u30b0\u30d6\u30ed\u30c3\u30af\u3092\u9632\u3050\u305f\u3081\u3001\u7dca\u6025\u3067\u306a\u3044\u30b9\u30af\u30ea\u30d7\u30c8\u306b\u306f async \u307e\u305f\u306f defer \u5c5e\u6027\u3092\u8ffd\u52a0\u3057\u3066\u304f\u3060\u3055\u3044\u3002'
      });
    } else {
      results.performance.push({
        id: 'script-ok', status: 'pass', title: '\u30b9\u30af\u30ea\u30d7\u30c8\u8aad\u307f\u8fbc\u307f',
        body: `\u5168${allScripts.length}\u500b\u306e\u30b9\u30af\u30ea\u30d7\u30c8 \u2014 \u30ec\u30f3\u30c0\u30ea\u30f3\u30b0\u3092\u30d6\u30ed\u30c3\u30af\u3059\u308b\u3082\u306e\u306f\u3042\u308a\u307e\u305b\u3093`, action: ''
      });
    }

    // Inline styles
    const inlineStyles = document.querySelectorAll('[style]');
    if (inlineStyles.length > 20) {
      results.performance.push({
        id: 'inline-styles', status: 'warn', title: '\u30a4\u30f3\u30e9\u30a4\u30f3\u30b9\u30bf\u30a4\u30eb\u306e\u591a\u7528',
        body: `\u30a4\u30f3\u30e9\u30a4\u30f3\u30b9\u30bf\u30a4\u30eb\u3092\u6301\u3064\u8981\u7d20\u304c${inlineStyles.length}\u500b\u898b\u3064\u304b\u308a\u307e\u3057\u305f`,
        action: '\u30ad\u30e3\u30c3\u30b7\u30e5\u52b9\u7387\u3068\u30e1\u30f3\u30c6\u30ca\u30f3\u30b9\u6027\u3092\u9ad8\u3081\u308b\u305f\u3081\u3001\u30a4\u30f3\u30e9\u30a4\u30f3\u30b9\u30bf\u30a4\u30eb\u3092CSS\u30af\u30e9\u30b9\u306b\u79fb\u884c\u3057\u3066\u304f\u3060\u3055\u3044\u3002'
      });
    }
  }

  // ============ Accessibility Analysis ============

  function analyzeAccessibility() {
    // Images without alt
    const images = document.querySelectorAll('img');
    const noAlt = Array.from(images).filter(img => !img.hasAttribute('alt'));
    if (noAlt.length > 0) {
      results.accessibility.push({
        id: 'img-alt-missing', status: 'fail', title: '\u753b\u50cf\u306e\u4ee3\u66ff\u30c6\u30ad\u30b9\u30c8(alt)\u306a\u3057',
        body: `\u5168${images.length}\u679a\u4e2d\u3001${noAlt.length}\u679a\u306e\u753b\u50cf\u306balt\u5c5e\u6027\u304c\u3042\u308a\u307e\u305b\u3093`,
        action: '\u3059\u3079\u3066\u306e\u753b\u50cf\u306b\u5185\u5bb9\u3092\u8aac\u660e\u3059\u308balt\u30c6\u30ad\u30b9\u30c8\u3092\u8ffd\u52a0\u3057\u3066\u304f\u3060\u3055\u3044\u3002\u88c5\u98fe\u76ee\u7684\u306e\u753b\u50cf\u306b\u306f alt="" \u3092\u6307\u5b9a\u3057\u307e\u3059\u3002'
      });
    } else if (images.length > 0) {
      results.accessibility.push({
        id: 'img-alt-ok', status: 'pass', title: '\u753b\u50cf\u306e\u4ee3\u66ff\u30c6\u30ad\u30b9\u30c8(alt)',
        body: `\u3059\u3079\u3066\u306e\u753b\u50cf\uff08${images.length}\u679a\uff09\u306balt\u5c5e\u6027\u304c\u8a2d\u5b9a\u3055\u308c\u3066\u3044\u307e\u3059`, action: ''
      });
    }

    // Language attribute
    const htmlLang = document.documentElement.lang;
    if (!htmlLang) {
      results.accessibility.push({
        id: 'lang-missing', status: 'fail', title: '\u8a00\u8a9e\u8a2d\u5b9a\u306a\u3057',
        body: '<html> \u30bf\u30b0\u306b lang \u5c5e\u6027\u304c\u3042\u308a\u307e\u305b\u3093',
        action: '\u30b9\u30af\u30ea\u30fc\u30f3\u30ea\u30fc\u30c0\u30fc\u304c\u8a00\u8a9e\u3092\u6b63\u3057\u304f\u8a8d\u8b58\u3067\u304d\u308b\u3088\u3046\u3001<html> \u30bf\u30b0\u306b lang="ja" \u306a\u3069\u9069\u5207\u306a\u8a00\u8a9e\u30b3\u30fc\u30c9\u3092\u8ffd\u52a0\u3057\u3066\u304f\u3060\u3055\u3044\u3002'
      });
    } else {
      results.accessibility.push({
        id: 'lang-ok', status: 'pass', title: '\u8a00\u8a9e\u8a2d\u5b9a',
        body: `\u8a00\u8a9e\u304c "${htmlLang}" \u306b\u8a2d\u5b9a\u3055\u308c\u3066\u3044\u307e\u3059`, action: ''
      });
    }

    // Form labels
    const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select');
    const noLabel = Array.from(inputs).filter(input => {
      const id = input.id;
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
      const wrappedInLabel = input.closest('label');
      return !hasLabel && !hasAriaLabel && !wrappedInLabel;
    });
    if (noLabel.length > 0) {
      results.accessibility.push({
        id: 'form-label-missing', status: 'warn', title: '\u30e9\u30d9\u30eb\u306e\u306a\u3044\u30d5\u30a9\u30fc\u30e0\u5165\u529b',
        body: `${noLabel.length}\u500b\u306e\u5165\u529b\u30d5\u30a3\u30fc\u30eb\u30c9\u306b\u30e9\u30d9\u30eb\u304c\u95a2\u9023\u4ed8\u3051\u3089\u308c\u3066\u3044\u307e\u305b\u3093`,
        action: '\u8aad\u307f\u4e0a\u3052\u30bd\u30d5\u30c8\u3092\u5229\u7528\u3059\u308b\u30e6\u30fc\u30b6\u30fc\u306e\u305f\u3081\u3001\u3059\u3079\u3066\u306e\u5165\u529b\u6b04\u306b <label for="id"> \u307e\u305f\u306f aria-label \u3092\u8ffd\u52a0\u3057\u3066\u304f\u3060\u3055\u3044\u3002'
      });
    } else if (inputs.length > 0) {
      results.accessibility.push({
        id: 'form-label-ok', status: 'pass', title: '\u30d5\u30a9\u30fc\u30e0\u30e9\u30d9\u30eb',
        body: `\u3059\u3079\u3066\u306e\u5165\u529b\u30d5\u30a3\u30fc\u30eb\u30c9\uff08${inputs.length}\u500b\uff09\u306b\u30e9\u30d9\u30eb\u304c\u8a2d\u5b9a\u3055\u308c\u3066\u3044\u307e\u3059`, action: ''
      });
    }

    // Links
    const links = document.querySelectorAll('a');
    const emptyLinks = Array.from(links).filter(a => !a.textContent.trim() && !a.getAttribute('aria-label') && !a.querySelector('img[alt]'));
    if (emptyLinks.length > 0) {
      results.accessibility.push({
        id: 'link-empty', status: 'warn', title: '\u30c6\u30ad\u30b9\u30c8\u306e\u306a\u3044\u30ea\u30f3\u30af',
        body: `${emptyLinks.length}\u500b\u306e\u30ea\u30f3\u30af\u306b\u30a2\u30af\u30bb\u30b9\u53ef\u80fd\u306a\u30c6\u30ad\u30b9\u30c8\u304c\u3042\u308a\u307e\u305b\u3093`,
        action: '\u30ea\u30f3\u30af\u5148\u304c\u4f55\u3067\u3042\u308b\u304b\u3092\u30e6\u30fc\u30b6\u30fc\u304c\u7406\u89e3\u3067\u304d\u308b\u3088\u3046\u3001\u8aac\u660e\u30c6\u30ad\u30b9\u30c8\u307e\u305f\u306f aria-label \u3092\u8ffd\u52a0\u3057\u3066\u304f\u3060\u3055\u3044\u3002'
      });
    }

    // Viewport meta
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      results.accessibility.push({
        id: 'viewport-missing', status: 'warn', title: 'Viewport\u30e1\u30bf\u30bf\u30b0\u306a\u3057',
        body: 'Viewport\u30e1\u30bf\u30bf\u30b0\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093',
        action: '\u30e2\u30d0\u30a4\u30eb\u5bfe\u5fdc\uff08\u30ec\u30b9\u30dd\u30f3\u30b7\u30d6\uff09\u306b\u3059\u308b\u305f\u3081\u3001<meta name="viewport" content="width=device-width, initial-scale=1"> \u3092\u8ffd\u52a0\u3057\u3066\u304f\u3060\u3055\u3044\u3002'
      });
    } else {
      results.accessibility.push({
        id: 'viewport-ok', status: 'pass', title: 'Viewport\u30e1\u30bf\u30bf\u30b0',
        body: 'Viewport\u30e1\u30bf\u30bf\u30b0\u306b\u3088\u308b\u30e2\u30d0\u30a4\u30eb\u6700\u9069\u5316\u8a2d\u5b9a\u3042\u308a', action: ''
      });
    }

    // Focus indicators (basic check)
    const buttons = document.querySelectorAll('button, [role="button"]');
    const totalInteractive = links.length + buttons.length + inputs.length;
    results.accessibility.push({
      id: 'interactive-count', status: 'info', title: '\u30a4\u30f3\u30bf\u30e9\u30af\u30c6\u30a3\u30d6\u8981\u7d20',
      body: `\u30a4\u30f3\u30bf\u30e9\u30af\u30c6\u30a3\u30d6\u8981\u7d20\u306e\u5408\u8a08: ${totalInteractive}\u500b\uff08\u30ea\u30f3\u30af: ${links.length}, \u30dc\u30bf\u30f3: ${buttons.length}, \u5165\u529b: ${inputs.length}\uff09`,
      action: ''
    });
  }

  // ============ Structure Analysis ============

  function analyzeStructure() {
    // Schema.org / JSON-LD
    const jsonLd = document.querySelectorAll('script[type="application/ld+json"]');
    if (jsonLd.length === 0) {
      results.structure.push({
        id: 'schema-missing', status: 'warn', title: '\u69cb\u9020\u5316\u30c7\u30fc\u30bf (Schema.org) \u306a\u3057',
        body: 'JSON-LD\u5f62\u5f0f\u306e\u69cb\u9020\u5316\u30c7\u30fc\u30bf\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093',
        action: '\u691c\u7d22\u30a8\u30f3\u30b8\u30f3\u304c\u30b3\u30f3\u30c6\u30f3\u30c4\u3092\u6b63\u78ba\u306b\u7406\u89e3\u3057\u3001\u30ea\u30c3\u30c1\u30ea\u30b6\u30eb\u30c8\u3092\u8868\u793a\u3067\u304d\u308b\u3088\u3046Schema.org\u69cb\u9020\u5316\u30c7\u30fc\u30bf\u3092\u8ffd\u52a0\u3057\u3066\u304f\u3060\u3055\u3044\u3002'
      });
    } else {
      let types = [];
      jsonLd.forEach(script => {
        try {
          const data = JSON.parse(script.textContent);
          if (data['@type']) types.push(data['@type']);
          if (Array.isArray(data['@graph'])) {
            data['@graph'].forEach(item => { if (item['@type']) types.push(item['@type']); });
          }
        } catch(e) { /* ignore parse errors */ }
      });
      results.structure.push({
        id: 'schema-ok', status: 'pass', title: '\u69cb\u9020\u5316\u30c7\u30fc\u30bf (Schema.org)',
        body: `${jsonLd.length}\u500b\u306eJSON-LD\u30d6\u30ed\u30c3\u30af\u3092\u691c\u51fa\u3057\u307e\u3057\u305f`,
        value: types.length > 0 ? `\u691c\u51fa\u3055\u308c\u305f\u30bf\u30a4\u30d7: ${types.join(', ')}` : '',
        action: ''
      });
    }

    // Meta robots
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) {
      const content = robots.content.toLowerCase();
      if (content.includes('noindex')) {
        results.structure.push({
          id: 'robots-noindex', status: 'warn', title: 'Noindex\u8a2d\u5b9a\u3042\u308a',
          body: `\u8a18\u8ff0\u5185\u5bb9: "${robots.content}"`,
          action: '\u3053\u306e\u30da\u30fc\u30b8\u306f\u691c\u7d22\u7d50\u679c\u306b\u8868\u793a\u3055\u308c\u307e\u305b\u3093\u3002\u30a4\u30f3\u30c7\u30c3\u30af\u30b9\u3055\u305b\u305f\u3044\u5834\u5408\u306f noindex \u3092\u524a\u9664\u3057\u3066\u304f\u3060\u3055\u3044\u3002'
        });
      } else {
        results.structure.push({
          id: 'robots-ok', status: 'pass', title: 'Robots \u30e1\u30bf\u30bf\u30b0',
          body: `\u8a18\u8ff0\u5185\u5bb9: "${robots.content}"`, action: ''
        });
      }
    }

    // Favicon
    const favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if (!favicon) {
      results.structure.push({
        id: 'favicon-missing', status: 'warn', title: '\u30d5\u30a1\u30d3\u30b3\u30f3 (Favicon) \u306a\u3057',
        body: '\u30d5\u30a1\u30d3\u30b3\u30f3\u306e\u30ea\u30f3\u30af\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093',
        action: '\u30d6\u30e9\u30a6\u30b6\u306e\u30bf\u30d6\u3084\u304a\u6c17\u306b\u5165\u308a\u3067\u30d6\u30e9\u30f3\u30c9\u3092\u8a8d\u8b58\u3057\u3084\u3059\u304f\u3059\u308b\u305f\u3081\u3001\u30d5\u30a1\u30d3\u30b3\u30f3\u3092\u8ffd\u52a0\u3057\u3066\u304f\u3060\u3055\u3044\u3002'
      });
    } else {
      results.structure.push({
        id: 'favicon-ok', status: 'pass', title: '\u30d5\u30a1\u30d3\u30b3\u30f3 (Favicon)',
        body: '\u30d5\u30a1\u30d3\u30b3\u30f3\u8a2d\u5b9a\u3042\u308a', action: ''
      });
    }

    // HTTPS check
    if (window.location.protocol !== 'https:') {
      results.structure.push({
        id: 'https-missing', status: 'fail', title: 'HTTPS\u975e\u5bfe\u5fdc',
        body: `\u30d7\u30ed\u30c8\u30b3\u30eb: ${window.location.protocol}`,
        action: 'HTTPS\u306b\u79fb\u884c\u3057\u3066\u304f\u3060\u3055\u3044\u3002Google\u30e9\u30f3\u30ad\u30f3\u30b0\u30b7\u30b0\u30ca\u30eb\u3068\u3057\u3066\u5fc5\u9808\u3067\u3042\u308a\u3001\u5b89\u5168\u6027\u306e\u8b66\u544a\u3082\u9632\u304e\u307e\u3059\u3002'
      });
    } else {
      results.structure.push({
        id: 'https-ok', status: 'pass', title: 'HTTPS\u5bfe\u5fdc',
        body: '\u5b89\u5168\u306a\u63a5\u7d9a (\u30bb\u30ad\u30e5\u30a2\u901a\u4fe1)', action: ''
      });
    }

    // Page size estimation
    const docSize = new Blob([document.documentElement.outerHTML]).size;
    const sizeKB = (docSize / 1024).toFixed(0);
    const status = docSize > 500 * 1024 ? 'warn' : 'pass';
    results.structure.push({
      id: 'page-size', status: status, title: 'HTML\u30c9\u30ad\u30e5\u30e1\u30f3\u30c8\u30b5\u30a4\u30ba',
      body: `${sizeKB} KB`,
      action: docSize > 500 * 1024 ? 'HTML\u30b5\u30a4\u30ba\u304c\u904e\u5927\u3067\u3059\u3002\u672a\u4f7f\u7528\u306e\u30b3\u30fc\u30c9\u3084\u3001\u5de8\u5927\u306a\u30a4\u30f3\u30e9\u30a4\u30f3SVG\u30fb\u30b9\u30bf\u30a4\u30eb\u306a\u3069\u3092\u524a\u6e1b\u3057\u3066\u304f\u3060\u3055\u3044\u3002' : ''
    });
  }

  // ============ LLMO (AI Readiness) Analysis ============

  function analyzeLLMO() {
    // 1. EC Schema Check (Product, Offer, etc.)
    const jsonLd = document.querySelectorAll('script[type="application/ld+json"]');
    const ecSchemas = ['Product', 'Offer', 'AggregateRating', 'Review', 'FAQPage', 'HowTo', 'Organization'];
    let foundEcSchemas = [];
    
    jsonLd.forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        
        const checkType = (typeVal) => {
          if (!typeVal) return;
          const t = Array.isArray(typeVal) ? typeVal : [typeVal];
          t.forEach(val => {
            ecSchemas.forEach(schema => {
              if (val.includes(schema) && !foundEcSchemas.includes(schema)) {
                foundEcSchemas.push(schema);
              }
            });
          });
        };

        checkType(data['@type']);
        if (Array.isArray(data['@graph'])) {
          data['@graph'].forEach(item => checkType(item['@type']));
        }
      } catch(e) { /* ignore parse errors */ }
    });

    if (foundEcSchemas.length > 0) {
      results.llmo.push({
        id: 'llmo-ec-schema-ok', status: 'pass', title: 'EC\u7528\u69cb\u9020\u5316\u30c7\u30fc\u30bf (Schema)',
        body: `\u691c\u51fa: ${foundEcSchemas.join(', ')}`,
        action: 'ChatGPT\u7b49\u306eAI\u691c\u7d22\u3067\u5546\u54c1\u60c5\u5831\u3068\u3057\u3066\u6b63\u78ba\u306b\u8a8d\u8b58\u30fb\u5f15\u7528\u3055\u308c\u3084\u3059\u304f\u306a\u308a\u307e\u3059\u3002'
      });
    } else {
      results.llmo.push({
        id: 'llmo-ec-schema-missing', status: 'fail', title: 'EC\u7528\u69cb\u9020\u5316\u30c7\u30fc\u30bf\u306a\u3057',
        body: 'Product\u3084Offer\u306a\u3069\u306eEC\u5411\u3051Schema\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093',
        action: 'AI\u30a8\u30f3\u30b8\u30f3\u304c\u300c\u3053\u308c\u306f\u5546\u54c1\u30da\u30fc\u30b8\u3067\u3042\u308b\u300d\u3068\u6b63\u78ba\u306b\u7406\u89e3\u3067\u304d\u308b\u3088\u3046\u3001\u69cb\u9020\u5316\u30c7\u30fc\u30bf\u3092\u8ffd\u52a0\u3057\u3066\u304f\u3060\u3055\u3044\u3002'
      });
    }

    // 2. E-E-A-T Signals (Author / Date / Trust)
    const author = document.querySelector('meta[name="author"], link[rel="author"], .author, .company-name');
    const pubDate = document.querySelector('meta[property="article:published_time"], time[pubdate]');
    if (author || pubDate) {
      results.llmo.push({
        id: 'llmo-eeat-ok', status: 'pass', title: 'E-E-A-T \u30b7\u30b0\u30ca\u30eb',
        body: '\u8457\u4f5c\u8005/\u904b\u55b6\u5143\u60c5\u5831 \u307e\u305f\u306f \u65e5\u4ed8\u60c5\u5831 \u3092\u691c\u51fa',
        action: 'AI\u306f\u60c5\u5831\u306e\u4fe1\u983c\u6027\u3092\u8a55\u4fa1\u3059\u308b\u305f\u3081\u3001\u660e\u78ba\u306a\u904b\u55b6\u5143\u60c5\u5831\u3068\u66f4\u65b0\u65e5\u306f\u5f15\u7528\u306e\u969b\u306b\u6709\u5229\u306b\u50cd\u304d\u307e\u3059\u3002'
      });
    } else {
      results.llmo.push({
        id: 'llmo-eeat-missing', status: 'warn', title: 'E-E-A-T \u30b7\u30b0\u30ca\u30eb\u4e0d\u8db3',
        body: '\u904b\u55b6\u5143\u3084\u516c\u958b\u65e5\u30fb\u66f4\u65b0\u65e5\u304c\u660e\u78ba\u306b\u30de\u30fc\u30af\u30a2\u30c3\u30d7\u3055\u308c\u3066\u3044\u307e\u305b\u3093',
        action: 'AI\u56de\u7b54\u306e\u5f15\u7528\u5143\u3068\u3057\u3066\u9078\u3070\u308c\u308b\u78ba\u7387\u3092\u4e0a\u3052\u308b\u305f\u3081\u3001\u904b\u55b6\u8005\u60c5\u5831(Organization)\u7b49\u3092\u30de\u30fc\u30af\u30a2\u30c3\u30d7\u306b\u542b\u3081\u3066\u304f\u3060\u3055\u3044\u3002'
      });
    }
  }

  // ============ Run All ============
  analyzeSEO();
  analyzePerformance();
  analyzeAccessibility();
  analyzeStructure();
  analyzeLLMO();

  return results;
})();
