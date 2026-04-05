---
name: pagepulse
description: PagePulse Chrome拡張（AI Website Analyzer）の開発・運用ナレッジ。アーキテクチャ、分析ロジック、公開手順、LP・計測基盤を定義。
---

# PagePulse - AI Website Analyzer

## 概要

ワンクリックでWebページのSEO・パフォーマンス・アクセシビリティ・構造を分析するChrome拡張。
英語ファーストでグローバル市場をターゲット。

## リポジトリ・インフラ

| 項目 | 値 |
|------|-----|
| **GitHub（ソース管理）** | https://github.com/knomoto-comrade/pagepulse （プライベート） |
| **GitHub（LP公開）** | https://github.com/pulse-digital-dev/pagepulse |
| **ローカル（拡張）** | `/Users/nomotokengo/COM/knomoto/20_新規ビジネス/pagepulse/` |
| **ローカル（LP）** | `/Users/nomotokengo/COM/knomoto/20_新規ビジネス/pagepulse-lp/` |
| **本番LP** | https://pulse-digital.dev/ （Cloudflare Pages） |
| **ドメイン** | pulse-digital.dev（Cloudflare管理） |
| **Chrome Web Store** | https://chrome.google.com/webstore/detail/biihgmkmmdihocjmdfedmhmkdmepfcoc |
| **Chrome Extension ID** | `biihgmkmmdihocjmdfedmhmkdmepfcoc` |

## 計測基盤（2026-03-24 導入済み）

| ツール | ID / 設定 | 状態 |
|--------|----------|------|
| GTM | `GTM-NDF8CV6Z` | ✅ 公開済み（v2） |
| GA4 | `G-DXPTT9SB8R` | ✅ 稼働中 |
| Clarity | プロジェクトID `w0sngo3uez` 公式テンプレート | ✅ 稼働中（GA4連携あり） |

### GTMタグ構成

| タグ名 | イベント | トリガー |
|--------|---------|----------|
| GA4 - Google Tag | page_view（自動） | All Pages |
| GA4 Event - CTA Click Chrome | `cta_chrome_add` | Click URL含む `chrome.google.com/webstore` |
| GA4 Event - CTA Click Waitlist | `cta_waitlist_click` | Click URL含む `mailto:` |
| GA4 Event - Purchase | `purchase`（Eコマース） | CE - purchase（カスタムイベント） |
| Microsoft Clarity - Official | ヒートマップ/セッション録画 | All Pages |

### SEO基盤
- **GSC:** `https://pulse-digital.dev/` 登録済み（GTM経由で自動検証）
- **sitemap.xml:** 3ページ（トップ、特商法、プライバシー）
- **robots.txt:** thank-youページをDisallow
- **構造化データ:** Organization + SoftwareApplication schema設定済み

### デジタル商品販売基盤（2026-03-25）
- **Stripe Payment Link:** `https://buy.stripe.com/8x200icJ95ylgkF87l5ZC01`
- **サンクスページ:** `/thank-you/`（session_idチェックによるセキュリティ対策済み）
- **特商法ページ:** `/tokushoho/`（請求ベース開示方式）
- **商品:** GA4 Eコマース計測チェックリスト（¥980）

### 保留タスク
- GA4イベント一覧反映後に `cta_chrome_add` / `cta_waitlist_click` をキーイベント設定
- UTMパラメータはリリース・集客開始時に運用開始

## 課金基盤 — ExtensionPay + Stripe（2026-03-26 実装済み）

| 項目 | 値 |
|------|-----|
| **決済プラットフォーム** | ExtensionPay（https://extensionpay.com） |
| **ExtensionPay 拡張ID** | `biihgmkmmdihocjmdfedmhmkdmepfcoc`（= Chrome Extension ID） |
| **ExtPay初期化コード** | `ExtPay('biihgmkmmdihocjmdfedmhmkdmepfcoc')` |
| **Stripe アカウント** | Pulse Digital / PayPay銀行 ****8967 ノモトケンゴ |
| **Stripe 明細書表記** | PULSE DIGITAL |
| **サポート電話番号** | +81 90 3143 2697 |
| **税金設定** | デジタル商品（税種別自動） |
| **ExtPay手数料** | 5%（Stripe手数料とは別） |
| **Customer Portal** | ✅ 有効済み |
| **Stripe連携ステータス** | ✅ **Stripe Connect完了（2026-03-27）** |
| **ExtensionPayサポート** | `glen@extensionpay.com`（開発者 Glen Chiacchieri 直通） |

> [!CAUTION]
> **Stripeアカウントのマイナス残高による連携エラーについて**
> 本番公開前（または公開後）に、**「ご自身の本物のクレジットカードで決済テストを行い、その後全額返金する」行為は絶対に避けてください。**
> Stripeの仕様上、3.6%の決済手数料は返還されないためアカウントがマイナス残高になります。
> **マイナス残高状態では、Stripe側の制限がかかり、ExtensionPayなど他のプラットフォームとの連携（Connect）がエラーになるか、連携完了状態に移行しません。**
> 疎通確認は必ず「Zip展開等の開発モード（テストカード4242...）」で行うこと。
> もしマイナスになってしまった場合は、Stripeダッシュボードから「資金を追加」で数十円実費精算すれば制限が解除されます。

> [!NOTE]
> **ExtensionPay Stripe Connect完了（2026-03-27）**
> - Step 1〜4全完了。Step 5「Publish and collect payments」はCWS公開後に自動完了予定。
> - 自前決済基盤への切替は不要。

### プラン構成

| プラン | 月額 | 年額 | 機能 |
|--------|------|------|------|
| Free | ¥0 | — | 5カテゴリ基本分析 + スコア + CSV/JSONエクスポート |
| **Pro** | **¥980** | **¥7,800** | CRO診断11項目、EC特化11項目、分析履歴、AI提案（Phase 2） |
| Team | ¥2,980 | ¥29,800 | Pro全機能 + 一括URL診断、ホワイトラベルPDF（Phase 2） |

### ゲーティング実装（v1.2.0 → v1.4.0）

| ファイル | 変更内容 |
|---------|---------|
| `manifest.json` | v1.4.0、`storage`パーミッション追加 |
| `background.js` | ExtPay初期化、`CHECK_PAYMENT_STATUS`/`OPEN_PAYMENT_PAGE` メッセージハンドラ、`onPaid`リスナー |
| `popup.html` | Proアップグレードバナー（`#proBanner`）、Proバッジ（`#proStatus`）、v1.4.0表記 |
| `popup.js` | 支払いステータスチェック、`isPro`フラグでUI切替、リアルタイムアップグレード検知、タブロック表示 |
| `popup.css` | `.pro-banner`/`.pro-status`グラデーションスタイル、ロックアイコン |
| `ExtPay.js` | ExtensionPayライブラリ（GitHubから取得） |
| `content/cro-analyzer.js` | **[NEW]** CRO分析11項目（見出し・画像alt・Sticky CTA・テキスト密度等） |
| `content/ec-analyzer.js` | **[NEW]** EC分析11項目（カート検知・お気に入り・クロスセル・決済手段・SKU等） |

### Freemiumアップセルフロー（v1.3.0）
- Pro限定タブ（CRO/EC/History）をFreeユーザーにもロック状態で表示
- タブクリック時にフィーチャー別アップセルティーザーを表示
- 絵文字アイコンをプロフェッショナルSVGに置換済み

### ローンチ価格（GA4チェックリスト）
- プロモコード: `LAUNCH500`（¥480引き → ¥500）
- 期限: 2026/04/30、上限50回

## アーキテクチャ

```
pagepulse/
├── manifest.json          # Manifest V3 (v1.4.0)
├── background.js          # Service Worker + ExtPay統合
├── ExtPay.js              # ExtensionPayライブラリ
├── popup/
│   ├── popup.html         # UI構造（Proバナー/バッジ/タブロック含む）
│   ├── popup.css          # ダークモード + Glassmorphism + SVGアイコン
│   └── popup.js           # コントローラー（課金ゲーティング + アップセル含む）
├── content/
│   ├── analyzer.js        # ページ分析ロジック（5カテゴリ基本）
│   ├── cro-analyzer.js    # CRO分析（11項目）[Pro]
│   └── ec-analyzer.js     # EC分析（11項目）[Pro]
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 分析カテゴリ（v1.4.0: 合計22項目 Pro分析）

### Free（5カテゴリ基本分析）

| カテゴリ | ウェイト | 分析項目 |
|---|---|---|
| **SEO** | 20% | title, meta description, H1, canonical, OGP, heading hierarchy |
| **Performance** | 20% | 画像dimensions, lazy loading, render-blocking scripts, inline styles |
| **Accessibility** | 15% | alt text, lang属性, form labels, empty links, viewport meta |
| **Structure** | 15% | JSON-LD, robots meta, favicon, HTTPS, HTML document size |
| **AI最適化 (LLMO)** | 30% | AI検索最適化チェック |

### Pro（CRO分析 11項目）
1. CTA存在チェック
2. CTA視認性（コントラスト比）
3. フォーム最適化
4. 社会的証明（レビュー・実績）
5. 緊急性・限定性要素
6. ファーストビュー要素分析
7. H1構造・順序チェック
8. 画像alt属性判定
9. 追従型CTA（Sticky CTA）検知
10. テキスト密度（可読性）チェック
11. ナビゲーション構造分析

### Pro（EC分析 11項目）
1. 商品画像品質チェック
2. 価格表示の明確さ
3. 購入ボタン最適化
4. 商品説明の充実度
5. 送料・配送情報の明示
6. カートシステム検知（Shopify, MakeShop等）
7. お気に入り・ウィッシュリスト導線
8. 関連商品・クロスセル領域
9. 決済手段（Payment Methods）明記
10. SKU・商品コード表記
11. レビュー・評価セクション

## スコア算出

- 各カテゴリ100点満点（fail = -100/n, warn = -50/n, info = 除外）
- 総合スコア = SEO×0.20 + Performance×0.20 + A11y×0.15 + Structure×0.15 + LLMO×0.30

## 開発ルール

1. **言語:** 英語ファースト（UI・ストア説明文・コード内コメント）
2. **Manifest V3** 準拠を厳守
3. **依存なし:** Vanilla JS/CSS のみ（バンドル不要）
4. **git push:** `knomoto-comrade/pagepulse`へはローカルgitでpush可。`pulse-digital-dev`へはSKILL参照（MCP不可）

## 公開手順

1. Chrome Web Store デベロッパー登録（$5） ✅
2. ストア説明文・スクリーンショット作成 ✅
3. ZIPパッケージ作成（manifest.json含む） ✅
4. Chrome Web Store ダッシュボードから申請 ✅
5. 審査通過（1-3営業日） ⏳ **2026-03-27時点 審査中**

### ZIPパッケージ作成コマンド
```bash
cd /Users/nomotokengo/COM/knomoto/20_新規ビジネス/pagepulse
zip -r ~/Desktop/pagepulse-v1.4.0.zip . -x ".git/*" "docs/*" ".agent/*" ".DS_Store" ".gitignore" "README.md" "pagepulse-v*.zip"
```

## ロードマップ

- [x] アイコン配置（16/48/128px）
- [x] Chrome Web Store 公開申請済み（2026-03-24）→ **審査中**
- [x] LP公開（pulse-digital.dev）
- [x] GTM/GA4/Clarity 計測基盤構築
- [x] デジタル商品販売基盤（Stripe + サンクスページ + 特商法）
- [x] GA4 purchaseイベント計測設定（GTM v2公開）
- [x] GSC登録 + サイトマップ送信
- [x] プロモコード LAUNCH500 設定
- [x] Premium月額プラン設計 承認済み
- [x] **v1.2: ExtensionPay導入 + Pro課金ゲーティング実装** (2026-03-26)
- [x] **v1.3: Freemiumアップセルフロー（タブロック + SVGアイコン）** (2026-03-25)
- [x] **v1.4: CRO分析11項目 + EC分析11項目 = 22項目Pro分析スイート** (2026-03-26)
- [x] LP Pro訴求コピー更新（22項目反映済み）
- [x] X（Twitter）匿名アカウント開設
- [x] ✅ ExtensionPay Stripe Connect全ステップ完了（2026-03-27）
- [x] ~~代替案: 自前決済基盤の検討~~ → 不要
- [ ] ローカル課金フローテスト（テストカードで検証）
- [ ] CWS審査通過後にv1.4.0 ZIPアップロード
- [ ] Product Huntリスティング作成
- [ ] **v2.0: AI改善提案（Claude API Haiku）**
- [ ] v3.0: Team プラン + 一括分析

## 自前決済基盤（代替案）設計メモ

ExtensionPayのStripe Connect問題が解決しない場合の代替構成:

| 要素 | 実装 | 工数 |
|--|--|--|
| 決済ページ | Stripe Payment Links（ダッシュボードで作成） | 5分 |
| ユーザー識別 | `chrome.storage.sync` にUUID生成 | 30分 |
| 支払い確認 | Cloudflare Workers + Stripe Webhook | 2〜3時間 |
| 拡張側変更 | `extpay.getUser().paid` → 自前API呼び出し差替 | 1〜2時間 |

**メリット:** ExtensionPay手数料5%が不要、Stripe標準3.6%のみ
**デメリット:** サーバーレス基盤の保守が必要
