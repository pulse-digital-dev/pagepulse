// PagePulse - EC Site Analyzer
// Pro-only: E-commerce specific checks
// i18n-ready: Uses titleKey for translation by popup.js

(function() {
  'use strict';

  const results = [];

  function addResult(titleKey, body, status, action, value) {
    results.push({ titleKey, title: titleKey, body, status, action: action || '', value: value || '' });
  }

  // ---- Page Type Detection ----
  const path = location.pathname.toLowerCase();
  const isTopPage = path === '/' || path === '/index.html' || path === '/index.php' || /^\/[^/]*\.(html?|php)$/.test(path);
  const isProductPage = /\/(product|item|goods|shop|detail|p\/)/i.test(path) || document.querySelector('[class*="product-detail"], [class*="item-detail"], [itemtype*="Product"]');
  const isCategoryPage = /\/(category|collection|catalog|list|archive|c\/)/i.test(path) || document.querySelector('[class*="product-list"], [class*="item-list"]');
  const pageType = isProductPage ? 'product' : isCategoryPage ? 'category' : isTopPage ? 'top' : 'other';

  const body = document.body.innerText || '';
  const html = document.body.innerHTML || '';

  function analyzeProductImages() {
    const images = document.querySelectorAll('img');
    const productImages = Array.from(images).filter(img => {
      const src = (img.src || '').toLowerCase();
      const alt = (img.alt || '').toLowerCase();
      const parent = img.closest('[class*="product"], [class*="item"], [class*="goods"], [id*="product"]');
      return parent || /product|item|goods|\u5546\u54c1/.test(src + alt);
    });
    if (productImages.length === 0) {
      const largeImages = Array.from(images).filter(img => {
        const rect = img.getBoundingClientRect();
        return rect.width > 150 && rect.height > 150;
      });
      if (largeImages.length < 3) {
        const imgStatus = (pageType === 'top' || pageType === 'category') ? 'info' : 'warn';
        addResult('ecImagesFew', `${largeImages.length}`, imgStatus, '', `${largeImages.length}`);
      } else {
        addResult('ecImagesOk', `${largeImages.length}`, 'pass', '', `${largeImages.length}`);
      }
    } else {
      if (productImages.length < 3) {
        addResult('ecImagesFew', `${productImages.length}`, 'warn', '', `${productImages.length}`);
      } else {
        addResult('ecImagesOk', `${productImages.length}`, 'pass', '', `${productImages.length}`);
      }
    }
  }

  function analyzePriceDisplay() {
    const priceElements = document.querySelectorAll('[class*="price"], [class*="Price"], [class*="cost"], [class*="amount"], [id*="price"]');
    const priceText = /(\u00a5[\d,]+|[\d,]+\u5186|\u7a0e\u8fbc|\u7a0e\u5225)/;
    if (priceElements.length > 0 || priceText.test(body)) {
      addResult('ecPriceOk', '', 'pass');
      if (/\u7a0e\u8fbc|\u7a0e\u5225|\u7a0e\u629c/.test(body)) {
        addResult('ecTaxOk', '', 'pass');
      } else {
        addResult('ecTaxMissing', '', 'warn');
      }
    } else {
      addResult('ecPriceMissing', '', 'warn');
    }
  }

  function analyzeCartButton() {
    const cartPatterns = /(\u30ab\u30fc\u30c8\u306b\u5165\u308c\u308b|\u30ab\u30fc\u30c8\u306b\u8ffd\u52a0|\u8cfc\u5165|\u6ce8\u6587|\u8cb7\u3044\u7269\u304b\u3054|\u304a\u8cb7\u3044\u7269|add.?to.?cart|buy.?now|purchase|checkout)/i;
    const buttons = document.querySelectorAll('button, input[type="submit"], a');
    let found = false;
    buttons.forEach(btn => {
      const text = (btn.textContent || btn.value || '').trim();
      if (cartPatterns.test(text)) found = true;
    });
    if (found) {
      addResult('ecCartOk', '', 'pass');
    } else {
      const cartStatus = (pageType === 'product') ? 'warn' : 'info';
      addResult('ecCartMissing', '', cartStatus);
    }
  }

  function analyzeShippingInfo() {
    const shippingPatterns = /(\u9001\u6599|\u914d\u9001|\u304a\u5c4a\u3051|\u7d0d\u671f|\u5373\u65e5|\u7fcc\u65e5|\u5728\u5eab|shipping|delivery|stock|in.?stock)/i;
    if (shippingPatterns.test(body)) {
      addResult('ecShippingOk', '', 'pass');
    } else {
      const shipStatus = (pageType === 'product') ? 'warn' : 'info';
      addResult('ecShippingMissing', '', shipStatus);
    }
  }

  function analyzeBreadcrumbs() {
    const breadcrumbs = document.querySelector('[class*="breadcrumb"], [class*="Breadcrumb"], nav[aria-label*="breadcrumb"], ol[class*="bread"]');
    const schemaBC = document.querySelector('script[type="application/ld+json"]');
    let hasSchemaBreadcrumb = false;
    if (schemaBC) {
      try {
        const data = JSON.parse(schemaBC.textContent);
        const items = Array.isArray(data) ? data : [data];
        hasSchemaBreadcrumb = items.some(d => d['@type'] === 'BreadcrumbList');
      } catch(e) {}
    }
    if (breadcrumbs || hasSchemaBreadcrumb) {
      addResult('ecBreadcrumbOk', '', 'pass');
    } else {
      addResult('ecBreadcrumbMissing', '', 'warn');
    }
  }

  function analyzeReturnPolicy() {
    const returnPatterns = /(\u8fd4\u54c1|\u4ea4\u63db|\u8fd4\u91d1|\u30ad\u30e3\u30f3\u30bb\u30eb|\u7279\u5546\u6cd5|\u7279\u5b9a\u5546\u53d6\u5f15|\u30d7\u30e9\u30a4\u30d0\u30b7\u30fc|\u5229\u7528\u898f\u7d04|return.?policy|refund)/i;
    if (returnPatterns.test(body)) {
      addResult('ecReturnOk', '', 'pass');
    } else {
      addResult('ecReturnMissing', '', 'fail');
    }
  }

  function analyzePlatform() {
    const htmlString = document.documentElement.innerHTML;
    let platform = '';
    if (window.Shopify || htmlString.includes('cdn.shopify.com')) platform = 'Shopify';
    else if (window.MakeShop || htmlString.includes('makeshop.jp') || htmlString.includes('ssl.makeshop.jp')) platform = 'MakeShop';
    else if (htmlString.includes('ec-cube') || htmlString.includes('ECCUBE')) platform = 'EC-CUBE';
    else if (htmlString.includes('base.in') || htmlString.includes('thebase.in')) platform = 'BASE';
    else if (htmlString.includes('stores.jp')) platform = 'STORES';
    else if (htmlString.includes('wp-content/plugins/woocommerce')) platform = 'WooCommerce';
    else if (htmlString.includes('colorme') || htmlString.includes('shop-pro.jp')) platform = 'ColorMe Shop';
    else if (htmlString.includes('future-shop') || htmlString.includes('fs-')) platform = 'FutureShop2';
    else if (htmlString.includes('bcart.jp')) platform = 'B-Cart (BtoB)';

    if (platform) {
      addResult('ecPlatformDetected', platform, 'info', '', platform);
    } else {
      addResult('ecPlatformUnknown', '', 'info');
    }
  }

  function analyzeSKU() {
    if (pageType !== 'product') return;
    const skuPatterns = /(\u5546\u54c1\u30b3\u30fc\u30c9|SKU|\u578b\u756a|\u54c1\u756a|item.?code)/i;
    const hasSKUClass = document.querySelector('[class*="sku"], [class*="product-code"], [itemprop="sku"]');
    if (skuPatterns.test(body) || hasSKUClass) {
      addResult('ecSKUOk', '', 'pass');
    } else {
      addResult('ecSKUMissing', '', 'warn');
    }
  }

  function analyzeWishlist() {
    const wishlistPatterns = /(\u304a\u6c17\u306b\u5165\u308a|wishlist|\u30a6\u30a3\u30c3\u30b7\u30e5)/i;
    const hasHeart = document.querySelector('[class*="heart"], [class*="wishlist"], [class*="favorite"], i[class*="fa-heart"]');
    if (wishlistPatterns.test(body) || hasHeart) {
      addResult('ecWishlistOk', '', 'pass');
    } else {
      const status = pageType === 'product' ? 'warn' : 'info';
      addResult('ecWishlistMissing', '', status);
    }
  }

  function analyzeRelatedProducts() {
    if (pageType !== 'product') return;
    const relatedPatterns = /(\u95a2\u9023\u5546\u54c1|\u304a\u3059\u3059\u3081|\u3053\u306e\u5546\u54c1\u3092\u8cb7\u3063\u305f\u4eba|\u3088\u304f\u4e00\u7dd2\u306b\u8cfc\u5165|related.?products|you.?might.?also.?like)/i;
    if (relatedPatterns.test(body) || document.querySelector('[class*="related"], [class*="recommend"]')) {
      addResult('ecRelatedOk', '', 'pass');
    } else {
      addResult('ecRelatedMissing', '', 'warn');
    }
  }

  function analyzePaymentMethods() {
    const paymentPatterns = /(\u30af\u30ec\u30b8\u30c3\u30c8\u30ab\u30fc\u30c9|Visa|Mastercard|JCB|AMEX|Din|PayPay|Amazon.?Pay|Apple.?Pay|Google.?Pay|PayPal|\u4ee3\u91d1\u5f15\u63db|\u9280\u884c\u632f\u8fbc)/i;
    const paymentIcons = document.querySelector('img[src*="visa" i], img[src*="master" i], img[src*="jcb" i], [class*="payment-icon"], [class*="pay-icon"]');
    if (paymentPatterns.test(body) || paymentIcons) {
      addResult('ecPaymentOk', '', 'pass');
    } else {
      addResult('ecPaymentMissing', '', 'warn');
    }
  }

  analyzeProductImages();
  analyzePriceDisplay();
  analyzeCartButton();
  analyzeShippingInfo();
  analyzeBreadcrumbs();
  analyzeReturnPolicy();
  analyzePlatform();
  analyzeSKU();
  analyzeWishlist();
  analyzeRelatedProducts();
  analyzePaymentMethods();

  return results;
})();
