// PagePulse - EC Site Analyzer
// Pro-only: E-commerce specific checks

(function() {
  'use strict';

  const results = [];

  function addResult(title, body, status, action, value) {
    results.push({ title, body, status, action: action || '', value: value || '' });
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
        // TOP/category pages naturally have fewer product-specific images
        const imgStatus = (pageType === 'top' || pageType === 'category') ? 'info' : 'warn';
        addResult('\u5546\u54c1\u753b\u50cf\u304c\u5c11\u306a\u3044', `\u5927\u304d\u306a\u753b\u50cf\u304c${largeImages.length}\u679a\u306e\u307f\u3067\u3059\u3002`, imgStatus,
          'EC\u30b5\u30a4\u30c8\u3067\u306f\u5546\u54c1\u753b\u50cf\u30923\u679a\u4ee5\u4e0a\u63b2\u8f09\u3059\u308b\u306e\u304c\u6a19\u6e96\u3067\u3059\u3002', `${largeImages.length}\u679a`);
      } else {
        addResult('\u5546\u54c1\u753b\u50cf\u6570', `\u5927\u304d\u306a\u753b\u50cf\u304c${largeImages.length}\u679a\u691c\u51fa\u3055\u308c\u307e\u3057\u305f\u3002`, 'pass', '', `${largeImages.length}\u679a`);
      }
    } else {
      if (productImages.length < 3) {
        addResult('\u5546\u54c1\u753b\u50cf\u304c\u5c11\u306a\u3044', `\u5546\u54c1\u753b\u50cf\u304c${productImages.length}\u679a\u306e\u307f\u3067\u3059\u3002`, 'warn',
          'EC\u30b5\u30a4\u30c8\u3067\u306f\u5546\u54c1\u753b\u50cf\u30923\u679a\u4ee5\u4e0a\u63b2\u8f09\u3059\u308b\u306e\u304c\u6a19\u6e96\u3067\u3059\u3002', `${productImages.length}\u679a`);
      } else {
        addResult('\u5546\u54c1\u753b\u50cf\u6570', `\u5546\u54c1\u753b\u50cf\u304c${productImages.length}\u679a\u691c\u51fa\u3055\u308c\u307e\u3057\u305f\u3002`, 'pass', '', `${productImages.length}\u679a`);
      }
    }
  }

  function analyzePriceDisplay() {
    const priceElements = document.querySelectorAll('[class*="price"], [class*="Price"], [class*="cost"], [class*="amount"], [id*="price"]');
    const priceText = /(\u00a5[\d,]+|[\d,]+\u5186|\u7a0e\u8fbc|\u7a0e\u5225)/;
    if (priceElements.length > 0 || priceText.test(body)) {
      addResult('\u4fa1\u683c\u8868\u793a\u3042\u308a', '\u5546\u54c1\u4fa1\u683c\u304c\u8868\u793a\u3055\u308c\u3066\u3044\u307e\u3059\u3002', 'pass');
      if (/\u7a0e\u8fbc|\u7a0e\u5225|\u7a0e\u629c/.test(body)) {
        addResult('\u7a0e\u8868\u8a18\u3042\u308a', '\u7a0e\u8fbc\u307f\u307e\u305f\u306f\u7a0e\u5225\u306e\u8868\u8a18\u304c\u3042\u308a\u307e\u3059\u3002', 'pass');
      } else {
        addResult('\u7a0e\u8868\u8a18\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093', '\u4fa1\u683c\u306b\u7a0e\u8fbc/\u7a0e\u5225\u306e\u660e\u8a18\u304c\u3042\u308a\u307e\u305b\u3093\u3002', 'warn',
          '\u7dcf\u984d\u8868\u793a\u7fa9\u52d9\u306b\u3088\u308a\u3001\u7a0e\u8fbc\u4fa1\u683c\u3092\u660e\u8a18\u3057\u3066\u304f\u3060\u3055\u3044\u3002\n\ud83d\udcdd <span class="price">\u00a51,980<small>(\u7a0e\u8fbc)</small></span>');
      }
    } else {
      addResult('\u4fa1\u683c\u8868\u793a\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093', '\u5546\u54c1\u4fa1\u683c\u306e\u8868\u793a\u304c\u691c\u51fa\u3055\u308c\u307e\u305b\u3093\u3067\u3057\u305f\u3002', 'warn',
        'EC\u30da\u30fc\u30b8\u3067\u306f\u660e\u78ba\u306a\u4fa1\u683c\u8868\u793a\u304c\u57fa\u672c\u3067\u3059\u3002\n\ud83d\udcdd <div class="product-price">\n  <span class="price-current">\u00a51,980<small>(\u7a0e\u8fbc)</small></span>\n  <span class="price-original" style="text-decoration:line-through;">\u00a52,980</span>\n</div>');
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
      addResult('\u8cfc\u5165\u30dc\u30bf\u30f3\u3042\u308a', '\u8cfc\u5165\u30dc\u30bf\u30f3\u304c\u691c\u51fa\u3055\u308c\u307e\u3057\u305f\u3002', 'pass');
    } else {
      // Cart button is only expected on product pages
      const cartStatus = (pageType === 'product') ? 'warn' : 'info';
      addResult('\u8cfc\u5165\u30dc\u30bf\u30f3\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093', '\u8cfc\u5165\u5c0e\u7dda\u304c\u691c\u51fa\u3055\u308c\u307e\u305b\u3093\u3067\u3057\u305f\u3002', cartStatus,
        '\u5546\u54c1\u30da\u30fc\u30b8\u306b\u306f\u660e\u78ba\u306a\u8cfc\u5165CTA\u3092\u914d\u7f6e\u3057\u3066\u304f\u3060\u3055\u3044\u3002\n\ud83d\udcdd <button class="add-to-cart" style="padding:14px 28px; background:#e74c3c; color:#fff; border:none; border-radius:6px; font-size:16px; font-weight:bold; cursor:pointer;">\ud83d\uded2 \u30ab\u30fc\u30c8\u306b\u5165\u308c\u308b</button>');
    }
  }

  function analyzeShippingInfo() {
    const shippingPatterns = /(\u9001\u6599|\u914d\u9001|\u304a\u5c4a\u3051|\u7d0d\u671f|\u5373\u65e5|\u7fcc\u65e5|\u5728\u5eab|shipping|delivery|stock|in.?stock)/i;
    if (shippingPatterns.test(body)) {
      addResult('\u914d\u9001\u60c5\u5831\u3042\u308a', '\u9001\u6599\u30fb\u914d\u9001\u30fb\u5728\u5eab\u306b\u95a2\u3059\u308b\u60c5\u5831\u304c\u691c\u51fa\u3055\u308c\u307e\u3057\u305f\u3002', 'pass');
    } else {
      // Shipping info is mainly relevant on product pages
      const shipStatus = (pageType === 'product') ? 'warn' : 'info';
      addResult('\u914d\u9001\u60c5\u5831\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093', '\u914d\u9001\u60c5\u5831\u304c\u691c\u51fa\u3055\u308c\u307e\u305b\u3093\u3067\u3057\u305f\u3002', shipStatus,
        '\u9001\u6599\u7121\u6599\u6761\u4ef6\u3001\u914d\u9001\u65e5\u306e\u76ee\u5b89\u3001\u5728\u5eab\u72b6\u6cc1\u306e\u8868\u793a\u306f\u8cfc\u5165\u6c7a\u5b9a\u3092\u5f8c\u62bc\u3057\u3057\u307e\u3059\u3002\n\ud83d\udcdd <div class="shipping-info">\n  \ud83d\ude9a \u9001\u6599\u7121\u6599\uff083,980\u5186\u4ee5\u4e0a\uff09\n  \ud83d\udce6 \u6700\u77ed\u7fcc\u65e5\u304a\u5c4a\u3051\n  \u2705 \u5728\u5eab\u3042\u308a\n</div>');
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
      addResult('\u30d1\u30f3\u304f\u305a\u30ea\u30b9\u30c8\u3042\u308a', '\u30d1\u30f3\u304f\u305a\u30ea\u30b9\u30c8\u304c\u691c\u51fa\u3055\u308c\u307e\u3057\u305f\u3002', 'pass');
    } else {
      addResult('\u30d1\u30f3\u304f\u305a\u30ea\u30b9\u30c8\u304c\u3042\u308a\u307e\u305b\u3093', '\u30d1\u30f3\u304f\u305a\u30ea\u30b9\u30c8\u304c\u691c\u51fa\u3055\u308c\u307e\u305b\u3093\u3067\u3057\u305f\u3002', 'warn',
        'EC\u30b5\u30a4\u30c8\u3067\u306f\u30d1\u30f3\u304f\u305a\u30ea\u30b9\u30c8\u304c\u5fc5\u9808\u3067\u3059\u3002\n\ud83d\udcdd <nav aria-label="breadcrumb">\n  <ol class="breadcrumb">\n    <li><a href="/">\u30db\u30fc\u30e0</a></li>\n    <li><a href="/category">\u30ab\u30c6\u30b4\u30ea</a></li>\n    <li>\u5546\u54c1\u540d</li>\n  </ol>\n</nav>');
    }
  }

  function analyzeReturnPolicy() {
    const returnPatterns = /(\u8fd4\u54c1|\u4ea4\u63db|\u8fd4\u91d1|\u30ad\u30e3\u30f3\u30bb\u30eb|\u7279\u5546\u6cd5|\u7279\u5b9a\u5546\u53d6\u5f15|\u30d7\u30e9\u30a4\u30d0\u30b7\u30fc|\u5229\u7528\u898f\u7d04|return.?policy|refund)/i;
    if (returnPatterns.test(body)) {
      addResult('\u8fd4\u54c1\u30fb\u898f\u7d04\u60c5\u5831\u3042\u308a', '\u8fd4\u54c1\u30dd\u30ea\u30b7\u30fc\u3084\u7279\u5546\u6cd5\u8868\u8a18\u304c\u691c\u51fa\u3055\u308c\u307e\u3057\u305f\u3002', 'pass');
    } else {
      addResult('\u8fd4\u54c1\u30fb\u898f\u7d04\u60c5\u5831\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093', '\u7279\u5546\u6cd5\u8868\u8a18\u306e\u30ea\u30f3\u30af\u304c\u691c\u51fa\u3055\u308c\u307e\u305b\u3093\u3067\u3057\u305f\u3002', 'fail',
        '\u7279\u5b9a\u5546\u53d6\u5f15\u6cd5\u306b\u57fa\u3065\u304f\u8868\u8a18\u306f\u6cd5\u5f8b\u4e0a\u306e\u7fa9\u52d9\u3067\u3059\u3002\u5fc5\u305a\u30ea\u30f3\u30af\u3092\u8a2d\u7f6e\u3057\u3066\u304f\u3060\u3055\u3044\u3002\n\ud83d\udcdd <footer>\n  <a href="/legal/tokushoho">\u7279\u5b9a\u5546\u53d6\u5f15\u6cd5\u306b\u57fa\u3065\u304f\u8868\u8a18</a>\n  <a href="/legal/privacy">\u30d7\u30e9\u30a4\u30d0\u30b7\u30fc\u30dd\u30ea\u30b7\u30fc</a>\n  <a href="/legal/return">\u8fd4\u54c1\u30fb\u4ea4\u63db\u30dd\u30ea\u30b7\u30fc</a>\n</footer>');
    }
  }

  // ---- 7. Platform Detection ----
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
      addResult('カートシステム検知', `このサイトは「${platform}」で構築されている可能性が高いです。`, 'info', '', platform);
    } else {
      addResult('カートシステム検知', '主要なSaaS型・パッケージ型のカートシステムは検知されませんでした（独自システムか非対応カートの可能性があります）。', 'info');
    }
  }

  // ---- 8. SKU / Product ID ----
  function analyzeSKU() {
    if (pageType !== 'product') return;
    const skuPatterns = /(\u5546\u54c1\u30b3\u30fc\u30c9|SKU|\u578b\u756a|\u54c1\u756a|item.?code)/i;
    const hasSKUClass = document.querySelector('[class*="sku"], [class*="product-code"], [itemprop="sku"]');
    
    if (skuPatterns.test(body) || hasSKUClass) {
      addResult('SKU表記あり', '商品に対する固有コード（SKUや型番）の表示が検知されました。', 'pass');
    } else {
      addResult('SKUが見当たりません', 'この商品固有のSKU・型番が見つかりません。', 'warn', '顧客からの問い合わせ時やSNSでの言及時に特定しやすくするため、商品番号を明記してください。');
    }
  }

  // ---- 9. Wishlist ----
  function analyzeWishlist() {
    const wishlistPatterns = /(\u304a\u6c17\u306b\u5165\u308a|wishlist|\u30a6\u30a3\u30c3\u30b7\u30e5)/i;
    const hasHeart = document.querySelector('[class*="heart"], [class*="wishlist"], [class*="favorite"], i[class*="fa-heart"]');
    
    if (wishlistPatterns.test(body) || hasHeart) {
      addResult('お気に入り機能あり', 'お気に入りへの追加やウィッシュリスト導線が検知されました。', 'pass');
    } else {
      const status = pageType === 'product' ? 'warn' : 'info'; // High priority on product pages
      addResult('お気に入り導線なし', 'お気に入りボタンやウィッシュリスト機能が見つかりません。', status, 'アパレルや家具など、検討期間が長い商材では「とりあえずお気に入り」の機能がCVRを下支えします。');
    }
  }

  // ---- 10. Related / Cross-sell ----
  function analyzeRelatedProducts() {
    if (pageType !== 'product') return;
    const relatedPatterns = /(\u95a2\u9023\u5546\u54c1|\u304a\u3059\u3059\u3081|\u3053\u306e\u5546\u54c1\u3092\u8cb7\u3063\u305f\u4eba|\u3088\u304f\u4e00\u7dd2\u306b\u8cfc\u5165|related.?products|you.?might.?also.?like)/i;
    
    if (relatedPatterns.test(body) || document.querySelector('[class*="related"], [class*="recommend"]')) {
      addResult('関連商品・クロスセル領域あり', '「関連商品」や「おすすめ」などのクロスセル導線が検知されました。', 'pass');
    } else {
      addResult('クロスセル枠が見当たりません', '商品ページにクロスセル・アップセルのための関連商品枠が見つかりません。', 'warn', '客単価（LTV）を上げるため、現在見ている商品と親和性の高いアイテムをレコメンド表示してください。');
    }
  }

  // ---- 11. Payment Methods ----
  function analyzePaymentMethods() {
    const paymentPatterns = /(クレジットカード|Visa|Mastercard|JCB|AMEX|Din|PayPay|Amazon.?Pay|Apple.?Pay|Google.?Pay|PayPal|\u4ee3\u91d1\u5f15\u63db|\u9280\u884c\u632f\u8fbc)/i;
    const paymentIcons = document.querySelector('img[src*="visa" i], img[src*="master" i], img[src*="jcb" i], [class*="payment-icon"], [class*="pay-icon"]');

    if (paymentPatterns.test(body) || paymentIcons) {
      addResult('決済手段の事前明示あり', 'フッター等で利用可能な決済手段（クレカ、Pay等）が明示されています。', 'pass');
    } else {
      addResult('決済手段の明記が見当たりません', '利用できる決済手段（Visa, PayPayなど）の明記が検知されませんでした。', 'warn', '決済手段がわからないとカート投入前に離脱する原因になります。フッターの全ページ共通エリアにロゴ等で配置してください。');
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
