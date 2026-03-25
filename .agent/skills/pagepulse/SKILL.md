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
├── manifest.json          # Manifest V3 (v1.0.0)
├── background.js          # Service Worker（最小構成）
├── popup/
│   ├── popup.html         # UI構造 (lang="ja")
│   ├── popup.css          # ダークモード + Glassmorphism
│   └── popup.js           # コントローラー（タブ切替、スコア算出、結果描画）
├── content/
│   └── analyzer.js        # ページ分析ロジック（5カテゴリ）
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
zip -r ~/Desktop/pagepulse-v1.0.0.zip . -x ".git/*" "docs/*" ".agent/*" ".DS_Store" ".gitignore" "README.md"
```

## 収益モデル

| プラン | 価格 | 機能 |
|---|---|---|
| Free | \u00a50 | 5カテゴリ基本分析 + スコア |
| Premium | \u00a51,480/月 | AI提案、CRO診断、EC特化、CSV出力 |

## ドメイン計画

- **候補:** `pulse-digital.dev`（ハイフン入り）
- **推奨レジストラ:** Cloudflare（原価販売 ~$10.18/年 ≈ \u00a51,530）
- **用途:** LP + プライバシーポリシー + 連絡先メール
- **ホスティング:** GitHub Pages → Cloudflare Pages（将来移行）

## ドメイン・インフラ

- **ドメイン:** `pulse-digital.dev` ✅ 取得完了（2026-03-24, Cloudflare, $12.20/年）
- **Cloudflareアカウント:** `dz.ken55555@gmail.com`
- **WHOIS登録者:** Kengo Nomoto / Pulse Digital
- **自動更新:** ON（2027-03-24期限、60日前に自動更新）
- **ホスティング:** Cloudflare Pages（無料）
- **メール:** ✅ Cloudflare Email Routing設定済み（`contact@pulse-digital.dev` → `dz.ken55555@gmail.com`）

## ランディングページ

- **ファイル:** `/tmp/pagepulse-lp/index.html`（単一ファイル構成、ダークモードデザイン）
- **Privacy Policy:** `/tmp/pagepulse-lp/privacy-policy/index.html`（統一デザイン）
- **デプロイ先:** Cloudflare Pages（`pulse-digital-dev/pagepulse` リポジトリ連携）
- **ステータス:** HTMLファイル作成済み → GitHub pushとCloudflare Pages連携が必要

## 今後のロードマップ

- [/] Chrome Web Store 審査待ち（1-3営業日）
- [x] `pulse-digital.dev` ドメイン取得（Cloudflare, $12.20/年）
- [x] Cloudflare Email Routing設定（contact@pulse-digital.dev）
- [x] LP作成（HTML/CSS）
- [x] LP → `pulse-digital-dev/pagepulse` にpush済み
- [x] Cloudflare Pages設定（LP公開済み: https://pulse-digital.dev）
- [ ] v1.1: Export機能（PDF/CSV）
- [ ] v1.2: Premium課金（ExtensionPay + Stripe）
- [ ] v2.0: AI提案エンジン（Claude API連携）
