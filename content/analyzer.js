// PagePulse - Content Script Analyzer
// Injected into the active tab to analyze the page

(async function() {
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
      results.seo.push({ id: 'title-missing', status: 'fail', title: 'タイトルタグ (Title) なし', body: 'ページに<title>タグがありません。検索エンジンやブラウザに不可欠な要素です。', action: '30〜60文字のわかりやすい<title>タグを追加してください。' });
    } else if (title.length < 30) {
      results.seo.push({ id: 'title-short', status: 'warn', title: 'タイトルが短すぎます', body: `"${title}" (${title.length}文字)`, action: `現在のタイトルは${title.length}文字です。検索結果の視認性を高めるため、30〜60文字を目安にしてください。` });
    } else if (title.length > 60) {
      results.seo.push({ id: 'title-long', status: 'warn', title: 'タイトルが長すぎます', body: `"${title}" (${title.length}文字)`, action: `現在のタイトルは${title.length}文字あり、検索結果で省略される可能性があります。60文字以内に収めてください。` });
    } else {
      results.seo.push({ id: 'title-ok', status: 'pass', title: 'ページタイトル', body: `"${title}" (${title.length}文字)`, action: '' });
    }

    // Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc || !metaDesc.content) {
      results.seo.push({ id: 'meta-desc-missing', status: 'fail', title: 'メタディスクリプションなし', body: 'メタディスクリプションが見つかりません。検索結果のクリック率(CTR)に直結する重要項目です。', action: 'ページ内容を要約した120〜160文字程度のメタディスクリプションを追加してください。' });
    } else {
      const len = metaDesc.content.length;
      if (len < 120) {
        results.seo.push({ id: 'meta-desc-short', status: 'warn', title: 'メタディスクリプションが短すぎます', body: `${len}文字`, value: metaDesc.content, action: `120〜160文字に拡張してください。短すぎるとGoogleが自動生成したテキストに置き換えられる可能性があります。` });
      } else if (len > 160) {
        results.seo.push({ id: 'meta-desc-long', status: 'warn', title: 'メタディスクリプションが長すぎます', body: `${len}文字（省略される可能性あり）`, value: metaDesc.content, action: `検索結果での省略を防ぐため、160文字以内に短縮してください。` });
      } else {
        results.seo.push({ id: 'meta-desc-ok', status: 'pass', title: 'メタディスクリプション', body: `${len}文字`, value: metaDesc.content, action: '' });
      }
    }

    // H1
    const h1s = document.querySelectorAll('h1');
    if (h1s.length === 0) {
      results.seo.push({ id: 'h1-missing', status: 'fail', title: 'H1タグなし', body: 'H1見出しが見つかりません。すべてのページにはH1タグが1つ必要です。', action: 'ページの主要なテーマを表すH1タグを1つ追加してください。' });
    } else if (h1s.length > 1) {
      results.seo.push({ id: 'h1-multiple', status: 'warn', title: '複数のH1タグ', body: `${h1s.length}個のH1タグが見つかりました。H1は1ページにつき1つが最適です。`, action: '最も重要な見出しをH1とし、それ以外はH2やH3に変更してください。' });
    } else {
      results.seo.push({ id: 'h1-ok', status: 'pass', title: 'H1タグ', body: 'H1が1つ見つかりました', value: h1s[0].textContent.trim().substring(0, 100), action: '' });
    }

    // Canonical
    const canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      results.seo.push({ id: 'canonical-missing', status: 'warn', title: 'Canonical URLなし', body: 'Canonical URLが定義されていません。重複コンテンツの問題を引き起こす可能性があります。', action: '<link rel="canonical"> を追加し、このページの正規URLを指定してください。' });
    } else {
      results.seo.push({ id: 'canonical-ok', status: 'pass', title: 'Canonical URL', body: 'Canonicalタグあり', value: canonical.href, action: '' });
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
      results.seo.push({ id: 'ogp-ok', status: 'pass', title: 'OGPタグ (SNSシェア設定)', body: 'og:title, og:description, og:image がすべて設定されています', action: '' });
    } else {
      results.seo.push({ id: 'ogp-missing', status: 'warn', title: 'OGPタグが不完全です', body: `不足: ${ogMissing.join(', ')}`, action: 'SNS等でシェアされた際の表示を最適化するため、これらのOGPタグを追加してください。' });
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
      results.seo.push({ id: 'heading-skip', status: 'warn', title: '見出し構造のスキップ', body: `見出しレベルが飛んでいます（例: H1からH3など）。合計${headings.length}個の見出し。`, action: 'H1→H2→H3と、階層をスキップせずに順番にタギングしてください。' });
    } else if (headings.length > 0) {
      results.seo.push({ id: 'heading-ok', status: 'pass', title: '見出し構造', body: `${headings.length}個の見出し（階層構造に問題なし）`, action: '' });
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
      id: 'img-count', status: 'info', title: '総画像数',
      body: `ページ内に${totalImages}枚の画像が見つかりました`,
      action: ''
    });

    if (imgsNoDims.length > 0) {
      results.performance.push({
        id: 'img-no-dims', status: 'warn', title: '画像サイズの指定なし',
        body: `全${totalImages}枚中、${imgsNoDims.length}枚の画像に width/height 属性がありません`,
        action: `レイアウトシフト(CLS)を防ぐため、明示的にwidthとheightを追加してください。Core Web Vitalsのスコア向上に繋がります。`
      });
    } else if (totalImages > 0) {
      results.performance.push({
        id: 'img-dims-ok', status: 'pass', title: '画像サイズの指定',
        body: 'すべての画像にwidth/height指定があります', action: ''
      });
    }

    // Lazy loading — use viewport position instead of DOM index
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const belowFoldImgs = Array.from(images).filter(img => {
      const rect = img.getBoundingClientRect();
      return rect.top > viewportHeight; // truly below the viewport
    });
    const lazyCount = belowFoldImgs.filter(img => img.loading === 'lazy').length;
    if (belowFoldImgs.length > 0 && lazyCount < belowFoldImgs.length) {
      results.performance.push({
        id: 'img-lazy', status: 'warn', title: '遅延読み込み (Lazy Load) なし',
        body: `ファーストビュー以下の${belowFoldImgs.length}枚中、${belowFoldImgs.length - lazyCount}枚が遅延読み込みされていません`,
        action: '初期読み込み速度を向上させるため、スクロールされないと見えない画像には loading="lazy" を追加してください。'
      });
    } else if (belowFoldImgs.length > 0) {
      results.performance.push({
        id: 'img-lazy-ok', status: 'pass', title: '遅延読み込み (Lazy Load)',
        body: 'ファーストビュー以下の全画像に遅延読み込みが適用されています', action: ''
      });
    }

    // Scripts — only <head> scripts can truly render-block
    const allScripts = document.querySelectorAll('script[src]');
    const headScripts = document.head ? document.head.querySelectorAll('script[src]') : [];
    const blockingScripts = Array.from(headScripts).filter(s => !s.async && !s.defer && !s.type?.includes('module'));
    if (blockingScripts.length > 0) {
      results.performance.push({
        id: 'script-blocking', status: 'warn', title: 'レンダリングブロック・スクリプト',
        body: `<head> タグ内にページ描画をブロックするスクリプトが${blockingScripts.length}個あります`,
        action: 'レンダリングブロックを防ぐため、緊急でないスクリプトには async または defer 属性を追加してください。'
      });
    } else {
      results.performance.push({
        id: 'script-ok', status: 'pass', title: 'スクリプト読み込み',
        body: `全${allScripts.length}個のスクリプト — レンダリングをブロックするものはありません`, action: ''
      });
    }

    // Inline styles
    const inlineStyles = document.querySelectorAll('[style]');
    if (inlineStyles.length > 20) {
      results.performance.push({
        id: 'inline-styles', status: 'warn', title: 'インラインスタイルの多用',
        body: `インラインスタイルを持つ要素が${inlineStyles.length}個見つかりました`,
        action: 'キャッシュ効率とメンテナンス性を高めるため、インラインスタイルをCSSクラスに移行してください。'
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
        id: 'img-alt-missing', status: 'fail', title: '画像の代替テキスト(alt)なし',
        body: `全${images.length}枚中、${noAlt.length}枚の画像にalt属性がありません`,
        action: 'すべての画像に内容を説明するaltテキストを追加してください。装飾目的の画像には alt="" を指定します。'
      });
    } else if (images.length > 0) {
      results.accessibility.push({
        id: 'img-alt-ok', status: 'pass', title: '画像の代替テキスト(alt)',
        body: `すべての画像（${images.length}枚）にalt属性が設定されています`, action: ''
      });
    }

    // Language attribute
    const htmlLang = document.documentElement.lang;
    if (!htmlLang) {
      results.accessibility.push({
        id: 'lang-missing', status: 'fail', title: '言語設定なし',
        body: '<html> タグに lang 属性がありません',
        action: 'スクリーンリーダーが言語を正しく認識できるよう、<html> タグに lang="ja" など適切な言語コードを追加してください。'
      });
    } else {
      results.accessibility.push({
        id: 'lang-ok', status: 'pass', title: '言語設定',
        body: `言語が "${htmlLang}" に設定されています`, action: ''
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
        id: 'form-label-missing', status: 'warn', title: 'ラベルのないフォーム入力',
        body: `${noLabel.length}個の入力フィールドにラベルが関連付けられていません`,
        action: '読み上げソフトを利用するユーザーのため、すべての入力欄に <label for="id"> または aria-label を追加してください。'
      });
    } else if (inputs.length > 0) {
      results.accessibility.push({
        id: 'form-label-ok', status: 'pass', title: 'フォームラベル',
        body: `すべての入力フィールド（${inputs.length}個）にラベルが設定されています`, action: ''
      });
    }

    // Links
    const links = document.querySelectorAll('a');
    const emptyLinks = Array.from(links).filter(a => !a.textContent.trim() && !a.getAttribute('aria-label') && !a.querySelector('img[alt]'));
    if (emptyLinks.length > 0) {
      results.accessibility.push({
        id: 'link-empty', status: 'warn', title: 'テキストのないリンク',
        body: `${emptyLinks.length}個のリンクにアクセス可能なテキストがありません`,
        action: 'リンク先が何であるかをユーザーが理解できるよう、説明テキストまたは aria-label を追加してください。'
      });
    }

    // Viewport meta
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      results.accessibility.push({
        id: 'viewport-missing', status: 'warn', title: 'Viewportメタタグなし',
        body: 'Viewportメタタグが見つかりません',
        action: 'モバイル対応（レスポンシブ）にするため、<meta name="viewport" content="width=device-width, initial-scale=1"> を追加してください。'
      });
    } else {
      results.accessibility.push({
        id: 'viewport-ok', status: 'pass', title: 'Viewportメタタグ',
        body: 'Viewportメタタグによるモバイル最適化設定あり', action: ''
      });
    }

    // Focus indicators (basic check)
    const buttons = document.querySelectorAll('button, [role="button"]');
    const totalInteractive = links.length + buttons.length + inputs.length;
    results.accessibility.push({
      id: 'interactive-count', status: 'info', title: 'インタラクティブ要素',
      body: `インタラクティブ要素の合計: ${totalInteractive}個（リンク: ${links.length}, ボタン: ${buttons.length}, 入力: ${inputs.length}）`,
      action: ''
    });
  }

  // ============ Structure Analysis ============

  function analyzeStructure() {
    // Schema.org / JSON-LD
    const jsonLd = document.querySelectorAll('script[type="application/ld+json"]');
    if (jsonLd.length === 0) {
      results.structure.push({
        id: 'schema-missing', status: 'warn', title: '構造化データ (Schema.org) なし',
        body: 'JSON-LD形式の構造化データが見つかりません',
        action: '検索エンジンがコンテンツを正確に理解し、リッチリザルトを表示できるようSchema.org構造化データを追加してください。'
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
        id: 'schema-ok', status: 'pass', title: '構造化データ (Schema.org)',
        body: `${jsonLd.length}個のJSON-LDブロックを検出しました`,
        value: types.length > 0 ? `検出されたタイプ: ${types.join(', ')}` : '',
        action: ''
      });
    }

    // Meta robots
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) {
      const content = robots.content.toLowerCase();
      if (content.includes('noindex')) {
        results.structure.push({
          id: 'robots-noindex', status: 'warn', title: 'Noindex設定あり',
          body: `記述内容: "${robots.content}"`,
          action: 'このページは検索結果に表示されません。インデックスさせたい場合は noindex を削除してください。'
        });
      } else {
        results.structure.push({
          id: 'robots-ok', status: 'pass', title: 'Robots メタタグ',
          body: `記述内容: "${robots.content}"`, action: ''
        });
      }
    }

    // Favicon
    const favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if (!favicon) {
      results.structure.push({
        id: 'favicon-missing', status: 'warn', title: 'ファビコン (Favicon) なし',
        body: 'ファビコンのリンクが見つかりません',
        action: 'ブラウザのタブやお気に入りでブランドを認識しやすくするため、ファビコンを追加してください。'
      });
    } else {
      results.structure.push({
        id: 'favicon-ok', status: 'pass', title: 'ファビコン (Favicon)',
        body: 'ファビコン設定あり', action: ''
      });
    }

    // HTTPS check
    if (window.location.protocol !== 'https:') {
      results.structure.push({
        id: 'https-missing', status: 'fail', title: 'HTTPS非対応',
        body: `プロトコル: ${window.location.protocol}`,
        action: 'HTTPSに移行してください。Googleランキングシグナルとして必須であり、安全性の警告も防ぎます。'
      });
    } else {
      results.structure.push({
        id: 'https-ok', status: 'pass', title: 'HTTPS対応',
        body: '安全な接続 (セキュア通信)', action: ''
      });
    }

    // Page size estimation
    const docSize = new Blob([document.documentElement.outerHTML]).size;
    const sizeKB = (docSize / 1024).toFixed(0);
    const status = docSize > 500 * 1024 ? 'warn' : 'pass';
    results.structure.push({
      id: 'page-size', status: status, title: 'HTMLドキュメントサイズ',
      body: `${sizeKB} KB`,
      action: docSize > 500 * 1024 ? 'HTMLサイズが過大です。未使用のコードや、巨大なインラインSVG・スタイルなどを削減してください。' : ''
    });
  }

  // ============ LLMO (AI Readiness) Analysis ============

  async function analyzeLLMO() {
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
        id: 'llmo-ec-schema-ok', status: 'pass', title: 'EC用構造化データ (Schema)',
        body: `検出: ${foundEcSchemas.join(', ')}`,
        action: 'ChatGPT等のAI検索で商品情報として正確に認識・引用されやすくなります。'
      });
    } else {
      results.llmo.push({
        id: 'llmo-ec-schema-missing', status: 'fail', title: 'EC用構造化データなし',
        body: 'ProductやOfferなどのEC向けSchemaが見つかりません',
        action: 'AIエンジンが「これは商品ページである」と正確に理解できるよう、構造化データを追加してください。'
      });
    }

    // 2. E-E-A-T Signals (Author / Date / Trust)
    const author = document.querySelector('meta[name="author"], link[rel="author"], .author, .company-name');
    const pubDate = document.querySelector('meta[property="article:published_time"], time[pubdate]');
    if (author || pubDate) {
      results.llmo.push({
        id: 'llmo-eeat-ok', status: 'pass', title: 'E-E-A-T シグナル',
        body: '著作者/運営元情報 または 日付情報 を検出',
        action: 'AIは情報の信頼性を評価するため、明確な運営元情報と更新日は引用の際に有利に働きます。'
      });
    } else {
      results.llmo.push({
        id: 'llmo-eeat-missing', status: 'warn', title: 'E-E-A-T シグナル不足',
        body: '運営元や公開日・更新日が明確にマークアップされていません',
        action: 'AI回答の引用元として選ばれる確率を上げるため、運営者情報(Organization)等をマークアップに含めてください。'
      });
    }

    // 3. robots.txt for AI Crawlers
    const origin = window.location.origin;
    try {
      const robotsRes = await chrome.runtime.sendMessage({ type: 'FETCH_RESOURCE', url: `${origin}/robots.txt` });
      if (robotsRes && robotsRes.success) {
        const text = robotsRes.text.toLowerCase();
        // Check for common AI bot blockages
        const aiBots = ['gptbot', 'claudebot', 'anthropic-ai', 'amazonbot', 'applebot'];
        let blockedBots = [];
        
        const lines = text.split('\n');
        let currentAgent = '';
        lines.forEach(line => {
          line = line.trim();
          if (line.startsWith('user-agent:')) {
            currentAgent = line.substring(11).trim();
          } else if (line.startsWith('disallow: /') && (line === 'disallow: /' || line === 'disallow: /*')) {
            // Check if current agent is an AI bot or '*'
            if (currentAgent === '*') {
              blockedBots.push('* (全クローラー対象)');
            } else {
              aiBots.forEach(bot => {
                if (currentAgent.includes(bot) && !blockedBots.includes(bot)) {
                  blockedBots.push(bot);
                }
              });
            }
          }
        });

        if (blockedBots.length > 0) {
          results.llmo.push({
            id: 'llmo-robots-blocked', status: 'fail', title: 'AIクローラーのアクセス制御',
            body: `ブロック設定検出: ${blockedBots.join(', ')}`,
            action: '意図しないAIクローラーのブロックは、PerplexityやChatGPTウェブ検索での露出機会を損失させます。設定を見直してください。'
          });
        } else {
          results.llmo.push({
            id: 'llmo-robots-ok', status: 'pass', title: 'AIクローラーのアクセス制御',
            body: 'GPTBot等への明示的なブロックはありません',
            action: 'AIエンジンはこのサイトの情報を学習・検索結果に引用できる状態です。'
          });
        }
      } else {
        results.llmo.push({
          id: 'llmo-robots-error', status: 'info', title: 'AIクローラーのアクセス制御',
          body: 'robots.txt の読み取りをスキップしました',
          action: '確認できませんでした。'
        });
      }
    } catch(err) {
      results.llmo.push({
        id: 'llmo-robots-error', status: 'info', title: 'AIクローラーのアクセス制御',
        body: 'robots.txt取得時にエラーが発生しました', action: ''
      });
    }

    // 4. llms.txt Check
    try {
      const llmsRes = await chrome.runtime.sendMessage({ type: 'FETCH_RESOURCE', url: `${origin}/llms.txt` });
      if (llmsRes && llmsRes.success && llmsRes.text && !llmsRes.text.includes('<html') && llmsRes.text.length < 50000) {
        results.llmo.push({
          id: 'llmo-txt-ok', status: 'pass', title: 'llms.txt (AI用テキストガイド)',
          body: '/llms.txt ファイルを検出しました',
          action: '最新のAIフレンドリー対応が実装されています。'
        });
      } else {
        results.llmo.push({
          id: 'llmo-txt-missing', status: 'info', title: 'llms.txt (AI用テキストガイド)',
          body: '未導入',
          action: '一部のAIエージェント向けに情報を伝達するための llms.txt が近年注目されています。(まだ必須ではありません)'
        });
      }
    } catch(err) {
      // ignore
    }
  }

  // ============ Run All ============
  analyzeSEO();
  analyzePerformance();
  analyzeAccessibility();
  analyzeStructure();
  await analyzeLLMO();

  return results;
})();
