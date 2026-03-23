// PagePulse - Content Script Analyzer
// Injected into the active tab to analyze the page

(function() {
  'use strict';

  const results = {
    url: window.location.href,
    seo: [],
    performance: [],
    accessibility: [],
    structure: []
  };

  // ============ SEO Analysis ============

  function analyzeSEO() {
    // Title
    const title = document.title;
    if (!title) {
      results.seo.push({ id: 'title-missing', status: 'fail', title: 'Page Title Missing', body: 'This page has no <title> tag. Search engines and browsers need this to display your page.', action: 'Add a descriptive <title> tag between 30-60 characters.' });
    } else if (title.length < 30) {
      results.seo.push({ id: 'title-short', status: 'warn', title: 'Page Title Too Short', body: `"${title}" (${title.length} chars)`, action: `Your title is ${title.length} characters. Aim for 30-60 characters for better visibility in search results.` });
    } else if (title.length > 60) {
      results.seo.push({ id: 'title-long', status: 'warn', title: 'Page Title Too Long', body: `"${title}" (${title.length} chars)`, action: `Your title is ${title.length} characters and may be truncated in search results. Keep it under 60 characters.` });
    } else {
      results.seo.push({ id: 'title-ok', status: 'pass', title: 'Page Title', body: `"${title}" (${title.length} chars)`, action: '' });
    }

    // Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc || !metaDesc.content) {
      results.seo.push({ id: 'meta-desc-missing', status: 'fail', title: 'Meta Description Missing', body: 'No meta description found. This is critical for search result click-through rates.', action: 'Add a meta description between 120-160 characters that summarizes your page content.' });
    } else {
      const len = metaDesc.content.length;
      if (len < 120) {
        results.seo.push({ id: 'meta-desc-short', status: 'warn', title: 'Meta Description Short', body: `${len} characters`, value: metaDesc.content, action: `Expand to 120-160 characters. Short descriptions may be overridden by Google.` });
      } else if (len > 160) {
        results.seo.push({ id: 'meta-desc-long', status: 'warn', title: 'Meta Description Long', body: `${len} characters \u2014 may be truncated`, value: metaDesc.content, action: `Shorten to under 160 characters to prevent truncation in search results.` });
      } else {
        results.seo.push({ id: 'meta-desc-ok', status: 'pass', title: 'Meta Description', body: `${len} characters`, value: metaDesc.content, action: '' });
      }
    }

    // H1
    const h1s = document.querySelectorAll('h1');
    if (h1s.length === 0) {
      results.seo.push({ id: 'h1-missing', status: 'fail', title: 'H1 Tag Missing', body: 'No H1 heading found. Every page should have exactly one H1.', action: 'Add a single H1 tag that describes the main topic of this page.' });
    } else if (h1s.length > 1) {
      results.seo.push({ id: 'h1-multiple', status: 'warn', title: 'Multiple H1 Tags', body: `Found ${h1s.length} H1 tags. Best practice is to use exactly one H1 per page.`, action: 'Keep only one H1 and convert others to H2 or H3.' });
    } else {
      results.seo.push({ id: 'h1-ok', status: 'pass', title: 'H1 Tag', body: 'Single H1 found', value: h1s[0].textContent.trim().substring(0, 100), action: '' });
    }

    // Canonical
    const canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      results.seo.push({ id: 'canonical-missing', status: 'warn', title: 'Canonical URL Missing', body: 'No canonical URL defined. This can cause duplicate content issues.', action: 'Add <link rel="canonical"> to specify the preferred URL for this page.' });
    } else {
      results.seo.push({ id: 'canonical-ok', status: 'pass', title: 'Canonical URL', body: 'Canonical tag present', value: canonical.href, action: '' });
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
      results.seo.push({ id: 'ogp-ok', status: 'pass', title: 'Open Graph Tags', body: 'og:title, og:description, og:image all present', action: '' });
    } else {
      results.seo.push({ id: 'ogp-missing', status: 'warn', title: 'Open Graph Tags Incomplete', body: `Missing: ${ogMissing.join(', ')}`, action: 'Add these OGP tags to control how your page appears when shared on social media.' });
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
      results.seo.push({ id: 'heading-skip', status: 'warn', title: 'Heading Hierarchy Skipped', body: `Headings skip levels (e.g., H1 \u2192 H3). Found ${headings.length} headings.`, action: 'Use headings in sequential order (H1 \u2192 H2 \u2192 H3) without skipping levels.' });
    } else if (headings.length > 0) {
      results.seo.push({ id: 'heading-ok', status: 'pass', title: 'Heading Structure', body: `${headings.length} headings with proper hierarchy`, action: '' });
    }
  }

  // ============ Performance Analysis ============

  function analyzePerformance() {
    // Images without dimensions
    const images = document.querySelectorAll('img');
    const imgsNoDims = [];
    const imgsNoLazy = [];
    const imgsNoAlt = [];
    let totalImages = images.length;

    images.forEach(img => {
      if (!img.getAttribute('width') && !img.getAttribute('height') && !img.style.width && !img.style.height) {
        imgsNoDims.push(img.src || img.dataset.src || '(inline)');
      }
      if (!img.loading && !img.getAttribute('loading')) {
        imgsNoLazy.push(img.src ? img.src.split('/').pop() : '(unknown)');
      }
    });

    results.performance.push({
      id: 'img-count', status: 'info', title: 'Total Images',
      body: `${totalImages} images found on this page`,
      action: ''
    });

    if (imgsNoDims.length > 0) {
      results.performance.push({
        id: 'img-no-dims', status: 'warn', title: 'Images Without Dimensions',
        body: `${imgsNoDims.length} of ${totalImages} images missing width/height attributes`,
        action: `Add explicit width and height to prevent layout shift (CLS). This improves Core Web Vitals.`
      });
    } else if (totalImages > 0) {
      results.performance.push({
        id: 'img-dims-ok', status: 'pass', title: 'Image Dimensions',
        body: 'All images have width/height attributes', action: ''
      });
    }

    // Lazy loading
    const belowFoldImgs = Array.from(images).filter((img, i) => i > 2);
    const lazyCount = belowFoldImgs.filter(img => img.loading === 'lazy').length;
    if (belowFoldImgs.length > 0 && lazyCount < belowFoldImgs.length) {
      results.performance.push({
        id: 'img-lazy', status: 'warn', title: 'Lazy Loading Missing',
        body: `${belowFoldImgs.length - lazyCount} below-fold images not using lazy loading`,
        action: 'Add loading="lazy" to images below the fold to improve initial page load speed.'
      });
    } else if (belowFoldImgs.length > 0) {
      results.performance.push({
        id: 'img-lazy-ok', status: 'pass', title: 'Lazy Loading',
        body: 'All below-fold images use lazy loading', action: ''
      });
    }

    // Scripts
    const scripts = document.querySelectorAll('script[src]');
    const blockingScripts = Array.from(scripts).filter(s => !s.async && !s.defer && !s.type?.includes('module'));
    if (blockingScripts.length > 0) {
      results.performance.push({
        id: 'script-blocking', status: 'warn', title: 'Render-Blocking Scripts',
        body: `${blockingScripts.length} scripts may block page rendering`,
        action: 'Add async or defer attributes to non-critical scripts to prevent render blocking.'
      });
    } else {
      results.performance.push({
        id: 'script-ok', status: 'pass', title: 'Script Loading',
        body: `${scripts.length} scripts \u2014 none are render-blocking`, action: ''
      });
    }

    // Inline styles
    const inlineStyles = document.querySelectorAll('[style]');
    if (inlineStyles.length > 20) {
      results.performance.push({
        id: 'inline-styles', status: 'warn', title: 'Excessive Inline Styles',
        body: `${inlineStyles.length} elements with inline styles`,
        action: 'Move inline styles to CSS classes for better caching and maintainability.'
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
        id: 'img-alt-missing', status: 'fail', title: 'Images Missing Alt Text',
        body: `${noAlt.length} of ${images.length} images have no alt attribute`,
        action: 'Add descriptive alt text to all images. Use alt="" for decorative images.'
      });
    } else if (images.length > 0) {
      results.accessibility.push({
        id: 'img-alt-ok', status: 'pass', title: 'Image Alt Text',
        body: `All ${images.length} images have alt attributes`, action: ''
      });
    }

    // Language attribute
    const htmlLang = document.documentElement.lang;
    if (!htmlLang) {
      results.accessibility.push({
        id: 'lang-missing', status: 'fail', title: 'Language Not Set',
        body: 'The <html> element has no lang attribute',
        action: 'Add lang="en" (or appropriate language code) to the <html> tag for screen readers.'
      });
    } else {
      results.accessibility.push({
        id: 'lang-ok', status: 'pass', title: 'Language Attribute',
        body: `Language set to "${htmlLang}"`, action: ''
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
        id: 'form-label-missing', status: 'warn', title: 'Form Inputs Without Labels',
        body: `${noLabel.length} input fields lack associated labels`,
        action: 'Add <label for="id"> or aria-label to all form inputs for screen reader users.'
      });
    } else if (inputs.length > 0) {
      results.accessibility.push({
        id: 'form-label-ok', status: 'pass', title: 'Form Labels',
        body: `All ${inputs.length} inputs have labels`, action: ''
      });
    }

    // Links
    const links = document.querySelectorAll('a');
    const emptyLinks = Array.from(links).filter(a => !a.textContent.trim() && !a.getAttribute('aria-label') && !a.querySelector('img[alt]'));
    if (emptyLinks.length > 0) {
      results.accessibility.push({
        id: 'link-empty', status: 'warn', title: 'Links Without Text',
        body: `${emptyLinks.length} links have no accessible text`,
        action: 'Add descriptive text or aria-label to all links so users know where they lead.'
      });
    }

    // Viewport meta
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      results.accessibility.push({
        id: 'viewport-missing', status: 'warn', title: 'Viewport Meta Missing',
        body: 'No viewport meta tag found',
        action: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> for mobile responsiveness.'
      });
    } else {
      results.accessibility.push({
        id: 'viewport-ok', status: 'pass', title: 'Viewport Meta',
        body: 'Viewport meta tag present', action: ''
      });
    }

    // Focus indicators (basic check)
    const buttons = document.querySelectorAll('button, [role="button"]');
    const totalInteractive = links.length + buttons.length + inputs.length;
    results.accessibility.push({
      id: 'interactive-count', status: 'info', title: 'Interactive Elements',
      body: `${totalInteractive} interactive elements (${links.length} links, ${buttons.length} buttons, ${inputs.length} inputs)`,
      action: ''
    });
  }

  // ============ Structure Analysis ============

  function analyzeStructure() {
    // Schema.org / JSON-LD
    const jsonLd = document.querySelectorAll('script[type="application/ld+json"]');
    if (jsonLd.length === 0) {
      results.structure.push({
        id: 'schema-missing', status: 'warn', title: 'Structured Data Missing',
        body: 'No JSON-LD structured data found',
        action: 'Add Schema.org structured data to help search engines understand your content and enable rich results.'
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
        id: 'schema-ok', status: 'pass', title: 'Structured Data',
        body: `${jsonLd.length} JSON-LD block(s) found`,
        value: types.length > 0 ? `Types: ${types.join(', ')}` : '',
        action: ''
      });
    }

    // Meta robots
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) {
      const content = robots.content.toLowerCase();
      if (content.includes('noindex')) {
        results.structure.push({
          id: 'robots-noindex', status: 'warn', title: 'Page Set to Noindex',
          body: `robots: "${robots.content}"`,
          action: 'This page will not appear in search results. Remove noindex if you want it indexed.'
        });
      } else {
        results.structure.push({
          id: 'robots-ok', status: 'pass', title: 'Robots Meta',
          body: `robots: "${robots.content}"`, action: ''
        });
      }
    }

    // Favicon
    const favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if (!favicon) {
      results.structure.push({
        id: 'favicon-missing', status: 'warn', title: 'Favicon Missing',
        body: 'No favicon link found',
        action: 'Add a favicon to improve brand recognition in browser tabs and bookmarks.'
      });
    } else {
      results.structure.push({
        id: 'favicon-ok', status: 'pass', title: 'Favicon',
        body: 'Favicon present', action: ''
      });
    }

    // HTTPS check
    if (window.location.protocol !== 'https:') {
      results.structure.push({
        id: 'https-missing', status: 'fail', title: 'Not Using HTTPS',
        body: `Protocol: ${window.location.protocol}`,
        action: 'Migrate to HTTPS. Google uses HTTPS as a ranking signal and browsers show warnings on HTTP sites.'
      });
    } else {
      results.structure.push({
        id: 'https-ok', status: 'pass', title: 'HTTPS',
        body: 'Secure connection', action: ''
      });
    }

    // Page size estimation
    const docSize = new Blob([document.documentElement.outerHTML]).size;
    const sizeKB = (docSize / 1024).toFixed(0);
    const status = docSize > 500 * 1024 ? 'warn' : 'pass';
    results.structure.push({
      id: 'page-size', status: status, title: 'HTML Document Size',
      body: `${sizeKB} KB`,
      action: docSize > 500 * 1024 ? 'HTML is large. Consider removing unused code, inline SVGs, or excessive inline styles.' : ''
    });
  }

  // ============ Run All ============
  analyzeSEO();
  analyzePerformance();
  analyzeAccessibility();
  analyzeStructure();

  return results;
})();
