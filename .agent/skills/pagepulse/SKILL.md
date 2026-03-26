---
name: pagepulse
description: PagePulse Chrome拡張（AI Website Analyzer）の開発・運用ナレッジ。アーキテクチャ、分析ロジック、公開手順を定義。
---

# PagePulse - AI Website Analyzer

## 概要

ワンクリックでWebページのSEO・パフォーマンス・アクセシビリティ・構造・AI最適化(LLMO)を分析するChrome拡張。
UIは日本語。Chrome Web Store掲載文は英語メイン。

## ブランド

- **Publisher name:** Pulse Digital（Chrome Web Store開発者アカウント）
- **個人運営:** comrade-inc とは完全分離
- **今後のツール展開:** Pulse Digital ブランドで統一（FormPulse, AdPulse 等）
- **連絡先:** `contact@pulse-digital.dev`（Cloudflare Email Routing → `dz.ken55555@gmail.com` 転送設定済み）

## アカウント情報

| 項目 | 値 |
|------|----|
| Chrome Web Store アカウント | `dz.ken55555@gmail.com` |
| Publisher name | Pulse Digital |
| EEA 区分 | トレーダー（将来の課金を考慮） |
| GitHub Org（公開用） | `pulse-digital-dev`（Public: LP・プライバシーポリシー用）**※Pulseアカウント管理** |
| GitHub Org（ソースコード） | `knomoto-comrade`（Private: 開発用） |
| ドメイン | `pulse-digital.dev`（Cloudflare Registrar, 取得済み） |
| X (Twitter) | [@pulsedigitaldev](https://x.com/pulsedigitaldev) |

## リポジトリ

- **開発用 (Private):** https://github.com/knomoto-comrade/pagepulse
- **公開用 (Public):** https://github.com/pulse-digital-dev/pagepulse （LP・プライバシーポリシー公開用）
- **ローカル:** `/Users/nomotokengo/COM/knomoto/20_新規ビジネス/pagepulse/`

## Git運用ルール（重要）

| リポジトリ | GitHubアカウント | GitHub MCP | push方法 |
|---|---|---|---|
| `knomoto-comrade/pagepulse` | knomoto-comrade | ✅ 使用可 | `mcp_github_push_files` or ローカルgit |
| `pulse-digital-dev/pagepulse` | **Pulseアカウント** | ❌ 操作不可 | **ユーザーがローカルgitで手動push** |

> **注意:** `pulse-digital-dev` org は Pulse専用GitHubアカウントで管理。
> Antigravityの GitHub MCP トークンは `knomoto-comrade` 用のため、
> `pulse-digital-dev` への push/操作は一切できない。
> LPファイル等をpushする際は `/tmp/` にファイルを準備し、ユーザーに手動push手順を案内する。

## アーキテクチャ

```
pagepulse/
├── manifest.json          # Manifest V3 (v1.3.0)
├── background.js          # Service Worker + ExtPay統合
├── ExtPay.js              # ExtensionPayライブラリ
├── popup/
│   ├── popup.html         # UI構造 (lang="ja")
│   ├── popup.css          # ダークモード + Glassmorphism
│   └── popup.js           # コントローラー（課金ゲーティング含む）
├── content/
│   ├── analyzer.js        # ページ分析ロジック（5カテゴリ）
│   ├── cro-analyzer.js    # CRO診断（Pro）
│   └── ec-analyzer.js     # EC特化分析（Pro）
├── lib/
│   ├── jspdf.umd.min.js   # jsPDF v2.5.2（ローカルバンドル）
│   └── pdf-generator.js   # PDFレポート生成（Pro）
├── icons/
│   ├── icon16.png         # ツールバー用
│   ├── icon48.png         # 拡張管理画面用
│   └── icon128.png        # ストア用
└── docs/
    ├── privacy-policy.md  # プライバシーポリシー
    ├── store-listing.md   # Chrome Web Store 掲載文（英語＋日本語）
    └── screenshots/       # ストア用スクリーンショット（5枚）
```

## 分析カテゴリ（5つ）

| カテゴリ | ウェイト | 分析項目 |
|---|---|---|
| **SEO** | 20% | title, meta description, H1, canonical, OGP, heading hierarchy |
| **Performance** | 20% | 画像dimensions, lazy loading, render-blocking scripts, inline styles |
| **Accessibility** | 15% | alt text, lang属性, form labels, empty links, viewport meta |
| **Structure** | 15% | JSON-LD, robots meta, favicon, HTTPS, HTML document size |
| **LLMO (AI最適化)** | 30% | EC用Schema, E-E-A-T シグナル |

## スコア算出

- 各カテゴリ100点満点（fail = -100/n, warn = -50/n, info = 除外）
- 総合スコア = SEO×0.20 + Performance×0.20 + A11y×0.15 + Structure×0.15 + LLMO×0.30

## パーミッション

- `activeTab` — クリック時のみ現在タブにアクセス
- `scripting` — 分析スクリプトの注入
- `host_permissions` は**不使用**（審査通過しやすい構成）

## 技術的判断事項

| 判断 | 理由 |
|---|---|
| robots.txt / llms.txt チェックを削除 | `host_permissions` 除去により cross-origin fetch が不可に。FETCH_RESOURCE ハンドラも削除 |
| analyzeLLMO を sync 関数に変更 | await 呼び出しがなくなったため |
| background.js を最小構成に | FETCH_RESOURCE 削除後、onInstalled のみ |
| アップグレードURL → `pulse-digital.dev/pagepulse` | 個人運営のため comrade-inc ドメインを不使用。ブランド統一のためドメイン変更予定 |
| manifest.json description を日本語化 | ストアの「パッケージの概要」がmanifestから自動取得されるため |

## 開発ルール

1. **UI言語:** 日本語（ターゲットユーザーは日本のWeb担当者・EC運営者）
2. **Manifest V3** 準拠を厳守
3. **依存なし:** Vanilla JS/CSS のみ（バンドル不要）
4. **git push（開発用）:** GitHub MCP `mcp_github_push_files` 経由推奨（サンドボックス制約時）
5. **git push（公開用）:** `pulse-digital-dev` へはユーザーが手動push（MCPトークン対象外）
6. **日本語文字列:** Unicodeエスケープ (`\uXXXX`) でJSファイルに記述（GitHub MCP経由push時の文字化け防止）

## Chrome Web Store 公開手順

1. [x] アイコン作成・配置（16/48/128px）
2. [x] プライバシーポリシー作成 (`docs/privacy-policy.md`)
3. [x] ストア掲載文作成 (`docs/store-listing.md`)
4. [x] スクリーンショット撮影 (`docs/screenshots/` 5枚)
5. [x] 開発者アカウント登録（$5, `dz.ken55555@gmail.com`, Publisher: "Pulse Digital"）
6. [x] manifest.json description を日本語化
7. [x] ZIPパッケージ作成・アップロード
8. [x] ストア掲載情報入力（日本語説明文・カテゴリ・SS・アイコン）
9. [x] プライバシーポリシーURL公開（`https://pulse-digital-dev.github.io/pagepulse/privacy-policy`）
10. [x] 「プライバシーへの取り組み」タブ入力完了
11. [x] **審査に提出済み（2026-03-24）** — 審査待ち（1-3営業日）

## Chrome Web Store ダッシュボード

- URL: https://chrome.google.com/webstore/devconsole
- Extension ID: `biihgmkmmdihocjmdfedmhmkdmepfcoc`

## ZIPパッケージ作成コマンド

```bash
cd /Users/nomotokengo/COM/knomoto/20_新規ビジネス/pagepulse
zip -r ~/Desktop/pagepulse-v1.3.0.zip . -x ".git/*" "docs/*" ".agent/*" ".DS_Store" ".gitignore" "README.md" "pagepulse-v*.zip"
```

## 収益モデル（3段階プラン）

> [!IMPORTANT]
> 機能追加・変更時は、必ずこのプラン表と照合してFree/Pro/Teamの境界を逸脱していないか確認すること。

### Free（¥0）— 日常使いの入り口

| 機能 | 実装状態 |
|------|---------|
| 5カテゴリ基本分析（SEO / パフォーマンス / a11y / 構造 / LLMO） | ✅ |
| 100点満点スコアリング | ✅ |
| CSV / JSONエクスポート | ✅ |
| 分析回数制限なし | ✅ |
| 改善アドバイス + コード例表示 | ✅ |
| SVGアイコンUI | ✅ |
| CRO/EC/履歴タブのロック表示（Proティーザー） | ✅ |

### Pro（¥980/月 / ¥7,800/年）— 個人の実務ツール

> 外部APIなしで完結する機能中心。¥980/月の利益率を維持

| 機能 | 実装状態 |
|------|---------|
| 分析履歴（最大50件、chrome.storage.local） | ✅ |
| CRO診断（CTA分析・フォーム・電話リンク・信頼性要素・タッチターゲット） | ✅ |
| EC特化分析（商品画像・価格表示・カート導線・配送情報・パンくず・特商法） | ✅ |
| 改善アドバイス強化（全項目にコピペ可能なHTMLコードスニペット） | ✅ |
| PDFレポート出力（jsPDF v2.5.2、標準テンプレート） | ✅ |

### Team（¥2,980/月 / ¥29,800/年）— クライアントワーク向け

> Pro課金が5件以上になったら着手

| 機能 | 実装状態 |
|------|---------|
| Pro全機能 | — |
| AI改善提案（Claude Haiku API） | ❌ 未実装 |
| 一括URL診断 | ❌ 未実装 |
| ホワイトラベルPDF（企業ロゴ・カラー入り） | ❌ 未実装 |
| 競合比較（2サイト横並び比較） | ❌ 未実装 |

### 決済基盤

- **ExtensionPay** + **Stripe** で課金管理
- ExtensionPayは1プロダクト1プランが基本。Teamプランは別決済フローの可能性あり
- Stripeアカウント: 本人確認済み

## ドメイン・インフラ

- **ドメイン:** `pulse-digital.dev` ✅ 取得完了（2026-03-24, Cloudflare, $12.20/年）
- **Cloudflareアカウント:** `dz.ken55555@gmail.com`
- **WHOIS登録者:** Kengo Nomoto / Pulse Digital
- **自動更新:** ON（2027-03-24期限、60日前に自動更新）
- **ホスティング:** Cloudflare Pages（無料）
- **メール:** ✅ Cloudflare Email Routing設定済み（`contact@pulse-digital.dev` → `dz.ken55555@gmail.com`）

## ランディングページ

- **リポジトリ:** `pulse-digital-dev/pagepulse`（GitHub Pages経由）
- **URL:** https://pulse-digital.dev
- **Privacy Policy:** https://pulse-digital.dev/privacy-policy
- **特商法表記:** https://pulse-digital.dev/tokushoho
- **デプロイ:** Cloudflare Pages自動デプロイ

## 今後のロードマップ

### Phase 1: Pro基盤（v1.3 — 進行中）
- [x] CRO診断（cro-analyzer.js）
- [x] EC特化分析（ec-analyzer.js）
- [x] 分析履歴（chrome.storage.local）
- [x] 改善アドバイス強化（全項目にコード例）
- [x] SVGアイコン化（絵文字→インラインSVG）
- [x] Free版Proティーザー（ロック表示 + アップセルUI）
- [x] UIブラッシュアップ（カード間隔拡大 + ステータス別セクションヘッダー追加）
- [x] PDFレポート出力（jsPDF v2.5.2、Pro限定、lib/pdf-generator.js）
- [ ] Chrome Web Store v1.3.0 再パッケージ＆再提出（ZIPは手動作成 → CWSダッシュボードへアップロード）

### Phase 2: Team基盤（v2.0 — Pro課金5件以上で着手）
- [ ] AI改善提案（Claude Haiku API）
- [ ] 一括URL診断
- [ ] ホワイトラベルPDF
- [ ] 競合比較

