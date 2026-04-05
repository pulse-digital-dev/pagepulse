// PagePulse - Content Script Analyzer (i18n-ready)
// Injected into the active tab to analyze the page
// Returns machine-readable results; UI text is resolved via chrome.i18n in popup.js

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
      results.seo.push({ id: 'title-missing', status: 'fail', titleKey: 'seoTitleMissing', bodyKey: 'seoTitleMissingBody', actionKey: 'seoTitleMissingAction' });
    } else if (title.length < 30) {
      results.seo.push({ id: 'title-short', status: 'warn', titleKey: 'seoTitleShort', body: `"${title}" (${title.length})`, bodyData: { chars: title.length, title: title } });
    } else if (title.length > 60) {
      results.seo.push({ id: 'title-long', status: 'warn', titleKey: 'seoTitleLong', body: `"${title}" (${title.length})`, bodyData: { chars: title.length, title: title } });
    } else {
      results.seo.push({ id: 'title-ok', status: 'pass', titleKey: 'seoTitleOk', body: `"${title}" (${title.length})` });
    }

    // Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc || !metaDesc.content) {
      results.seo.push({ id: 'meta-desc-missing', status: 'fail', titleKey: 'seoMetaDescMissing', bodyKey: 'seoMetaDescMissingBody' });
    } else {
      const len = metaDesc.content.length;
      if (len < 120) {
        results.seo.push({ id: 'meta-desc-short', status: 'warn', titleKey: 'seoMetaDescShort', body: `${len} chars`, value: metaDesc.content });
      } else if (len > 160) {
        results.seo.push({ id: 'meta-desc-long', status: 'warn', titleKey: 'seoMetaDescLong', body: `${len} chars`, value: metaDesc.content });
      } else {
        results.seo.push({ id: 'meta-desc-ok', status: 'pass', titleKey: 'seoMetaDescOk', body: `${len} chars`, value: metaDesc.content });
      }
    }

    // H1
    const h1s = document.querySelectorAll('h1');
    if (h1s.length === 0) {
      results.seo.push({ id: 'h1-missing', status: 'fail', titleKey: 'seoH1Missing', bodyKey: 'seoH1MissingBody' });
    } else if (h1s.length > 1) {
      results.seo.push({ id: 'h1-multiple', status: 'warn', titleKey: 'seoH1Multiple', body: `${h1s.length} H1 tags found` });
    } else {
      results.seo.push({ id: 'h1-ok', status: 'pass', titleKey: 'seoH1Ok', value: h1s[0].textContent.trim().substring(0, 100) });
    }

    // Canonical
    const canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      results.seo.push({ id: 'canonical-missing', status: 'warn', titleKey: 'seoCanonicalMissing' });
    } else {
      results.seo.push({ id: 'canonical-ok', status: 'pass', titleKey: 'seoCanonicalOk', value: canonical.href });
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
      results.seo.push({ id: 'ogp-ok', status: 'pass', titleKey: 'seoOgpOk' });
    } else {
      results.seo.push({ id: 'ogp-missing', status: 'warn', titleKey: 'seoOgpMissing', body: `Missing: ${ogMissing.join(', ')}` });
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
      results.seo.push({ id: 'heading-skip', status: 'warn', titleKey: 'seoHeadingSkip', body: `${headings.length} headings` });
    } else if (headings.length > 0) {
      results.seo.push({ id: 'heading-ok', status: 'pass', titleKey: 'seoHeadingOk', body: `${headings.length} headings` });
    }
  }

  // ============ Performance Analysis ============

  function analyzePerformance() {
    const images = document.querySelectorAll('img');
    const imgsNoDims = [];
    let totalImages = images.length;

    images.forEach(img => {
      if (!img.getAttribute('width') && !img.getAttribute('height') && !img.style.width && !img.style.height) {
        imgsNoDims.push(img.src || img.dataset.src || '(inline)');
      }
    });

    results.performance.push({
      id: 'img-count', status: 'info', titleKey: 'perfImgCount',
      body: `${totalImages} images`
    });

    if (imgsNoDims.length > 0) {
      results.performance.push({
        id: 'img-no-dims', status: 'warn', titleKey: 'perfImgNoDims',
        body: `${imgsNoDims.length} / ${totalImages} missing width/height`
      });
    } else if (totalImages > 0) {
      results.performance.push({
        id: 'img-dims-ok', status: 'pass', titleKey: 'perfImgDimsOk'
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
        id: 'img-lazy', status: 'warn', titleKey: 'perfLazyMissing',
        body: `${belowFoldImgs.length - lazyCount} / ${belowFoldImgs.length} below fold without lazy`
      });
    } else if (belowFoldImgs.length > 0) {
      results.performance.push({
        id: 'img-lazy-ok', status: 'pass', titleKey: 'perfLazyOk'
      });
    }

    // Scripts
    const allScripts = document.querySelectorAll('script[src]');
    const headScripts = document.head ? document.head.querySelectorAll('script[src]') : [];
    const blockingScripts = Array.from(headScripts).filter(s => !s.async && !s.defer && !s.type?.includes('module'));
    if (blockingScripts.length > 0) {
      results.performance.push({
        id: 'script-blocking', status: 'warn', titleKey: 'perfScriptBlocking',
        body: `${blockingScripts.length} render-blocking in <head>`
      });
    } else {
      results.performance.push({
        id: 'script-ok', status: 'pass', titleKey: 'perfScriptOk',
        body: `${allScripts.length} scripts, none blocking`
      });
    }

    // Inline styles
    const inlineStyles = document.querySelectorAll('[style]');
    if (inlineStyles.length > 20) {
      results.performance.push({
        id: 'inline-styles', status: 'warn', titleKey: 'perfInlineStyles',
        body: `${inlineStyles.length} elements`
      });
    }
  }

  // ============ Accessibility Analysis ============

  function analyzeAccessibility() {
    const images = document.querySelectorAll('img');
    const noAlt = Array.from(images).filter(img => !img.hasAttribute('alt'));
    if (noAlt.length > 0) {
      results.accessibility.push({
        id: 'img-alt-missing', status: 'fail', titleKey: 'a11yAltMissing',
        body: `${noAlt.length} / ${images.length} missing alt`
      });
    } else if (images.length > 0) {
      results.accessibility.push({
        id: 'img-alt-ok', status: 'pass', titleKey: 'a11yAltOk',
        body: `${images.length} images`
      });
    }

    // Language attribute
    const htmlLang = document.documentElement.lang;
    if (!htmlLang) {
      results.accessibility.push({
        id: 'lang-missing', status: 'fail', titleKey: 'a11yLangMissing'
      });
    } else {
      results.accessibility.push({
        id: 'lang-ok', status: 'pass', titleKey: 'a11yLangOk',
        body: `lang="${htmlLang}"`
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
        id: 'form-label-missing', status: 'warn', titleKey: 'a11yFormLabelMissing',
        body: `${noLabel.length} inputs`
      });
    } else if (inputs.length > 0) {
      results.accessibility.push({
        id: 'form-label-ok', status: 'pass', titleKey: 'a11yFormLabelOk',
        body: `${inputs.length} inputs`
      });
    }

    // Links
    const links = document.querySelectorAll('a');
    const emptyLinks = Array.from(links).filter(a => !a.textContent.trim() && !a.getAttribute('aria-label') && !a.querySelector('img[alt]'));
    if (emptyLinks.length > 0) {
      results.accessibility.push({
        id: 'link-empty', status: 'warn', titleKey: 'a11yLinkEmpty',
        body: `${emptyLinks.length} links`
      });
    }

    // Viewport meta
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      results.accessibility.push({
        id: 'viewport-missing', status: 'warn', titleKey: 'a11yViewportMissing'
      });
    } else {
      results.accessibility.push({
        id: 'viewport-ok', status: 'pass', titleKey: 'a11yViewportOk'
      });
    }

    // Focus indicators
    const buttons = document.querySelectorAll('button, [role="button"]');
    const totalInteractive = links.length + buttons.length + inputs.length;
    results.accessibility.push({
      id: 'interactive-count', status: 'info', titleKey: 'a11yInteractive',
      body: `Links: ${links.length}, Buttons: ${buttons.length}, Inputs: ${inputs.length} (Total: ${totalInteractive})`
    });
  }

  // ============ Structure Analysis ============

  function analyzeStructure() {
    const jsonLd = document.querySelectorAll('script[type="application/ld+json"]');
    if (jsonLd.length === 0) {
      results.structure.push({
        id: 'schema-missing', status: 'warn', titleKey: 'strSchemaMissing'
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
        } catch(e) {}
      });
      results.structure.push({
        id: 'schema-ok', status: 'pass', titleKey: 'strSchemaOk',
        body: `${jsonLd.length} JSON-LD blocks`,
        value: types.length > 0 ? `Types: ${types.join(', ')}` : ''
      });
    }

    // Meta robots
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) {
      const content = robots.content.toLowerCase();
      if (content.includes('noindex')) {
        results.structure.push({
          id: 'robots-noindex', status: 'warn', titleKey: 'strRobotsNoindex',
          body: `"${robots.content}"`
        });
      } else {
        results.structure.push({
          id: 'robots-ok', status: 'pass', titleKey: 'strRobotsOk',
          body: `"${robots.content}"`
        });
      }
    }

    // Favicon
    const favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if (!favicon) {
      results.structure.push({
        id: 'favicon-missing', status: 'warn', titleKey: 'strFaviconMissing'
      });
    } else {
      results.structure.push({
        id: 'favicon-ok', status: 'pass', titleKey: 'strFaviconOk'
      });
    }

    // HTTPS check
    if (window.location.protocol !== 'https:') {
      results.structure.push({
        id: 'https-missing', status: 'fail', titleKey: 'strHttpsMissing',
        body: `Protocol: ${window.location.protocol}`
      });
    } else {
      results.structure.push({
        id: 'https-ok', status: 'pass', titleKey: 'strHttpsOk'
      });
    }

    // Page size estimation
    const docSize = new Blob([document.documentElement.outerHTML]).size;
    const sizeKB = (docSize / 1024).toFixed(0);
    const status = docSize > 500 * 1024 ? 'warn' : 'pass';
    results.structure.push({
      id: 'page-size', status: status, titleKey: 'strPageSize',
      body: `${sizeKB} KB`
    });
  }

  // ============ LLMO (AI Readiness) Analysis ============

  function analyzeLLMO() {
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
      } catch(e) {}
    });

    if (foundEcSchemas.length > 0) {
      results.llmo.push({
        id: 'llmo-ec-schema-ok', status: 'pass', titleKey: 'llmoEcSchemaOk',
        body: `Found: ${foundEcSchemas.join(', ')}`
      });
    } else {
      results.llmo.push({
        id: 'llmo-ec-schema-missing', status: 'fail', titleKey: 'llmoEcSchemaMissing'
      });
    }

    // E-E-A-T Signals
    const author = document.querySelector('meta[name="author"], link[rel="author"], .author, .company-name');
    const pubDate = document.querySelector('meta[property="article:published_time"], time[pubdate]');
    if (author || pubDate) {
      results.llmo.push({
        id: 'llmo-eeat-ok', status: 'pass', titleKey: 'llmoEeatOk'
      });
    } else {
      results.llmo.push({
        id: 'llmo-eeat-missing', status: 'warn', titleKey: 'llmoEeatMissing'
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
