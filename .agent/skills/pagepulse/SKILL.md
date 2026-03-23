---
name: pagepulse
description: PagePulse Chrome拡張（AI Website Analyzer）の開発・運用ナレッジ。アーキテクチャ、分析ロジック、公開手順を定義。
---

# PagePulse - AI Website Analyzer

## 概要

ワンクリックでWebページのSEO・パフォーマンス・アクセシビリティ・構造を分析するChrome拡張。
英語ファーストでグローバル市場をターゲット。

## リポジトリ

- **GitHub:** https://github.com/knomoto-comrade/pagepulse （プライベート）
- **ローカル:** `/Users/nomotokengo/COM/knomoto/20_新規ビジネス/pagepulse/`

## アーキテクチャ

```
pagepulse/
├── manifest.json          # Manifest V3
├── background.js          # Service Worker
├── popup/
│   ├── popup.html         # UI構造
│   ├── popup.css          # ダークモード + Glassmorphism
│   └── popup.js           # コントローラー（タブ切替、スコア算出、結果描画）
├── content/
│   └── analyzer.js        # ページ分析ロジック（4カテゴリ）
└── icons/                 # 未配置（Chrome既定アイコンで代用中）
```

## 分析カテゴリ

| カテゴリ | 分析項目 |
|---|---|
| **SEO** | title, meta description, H1, canonical, OGP, heading hierarchy |
| **Performance** | 画像dimensions, lazy loading, render-blocking scripts, inline styles |
| **Accessibility** | alt text, lang属性, form labels, empty links, viewport meta |
| **Structure** | JSON-LD, robots meta, favicon, HTTPS, HTML document size |

## スコア算出

- 各カテゴリ100点満点（fail = -100/n, warn = -50/n, info = 除外）
- 総合スコア = SEO×0.35 + Performance×0.25 + A11y×0.20 + Structure×0.20

## 収益モデル

| プラン | 価格 | 機能 |
|---|---|---|
| Free | ¥0 | 4カテゴリ基本分析 + スコア |
| Premium | ¥1,480/月 | AI提案、CRO診断、EC特化、CSV出力 |

## 開発ルール

1. **言語:** 英語ファースト（UI・ストア説明文・コード内コメント）
2. **Manifest V3** 準拠を厳守
3. **依存なし:** Vanilla JS/CSS のみ（バンドル不要）
4. **git push:** GitHub MCP `mcp_github_push_files` 経由（ローカルgit操作禁止）

## 公開手順

1. Chrome Web Store デベロッパー登録（$5）
2. ストア説明文・スクリーンショット作成
3. ZIPパッケージ作成（manifest.json含む）
4. Chrome Web Store ダッシュボードから申請
5. 審査通過（1-3営業日）

## 今後のロードマップ

- [ ] アイコン配置（16/48/128px）
- [ ] 実EC サイトでのテスト・精度検証
- [ ] Chrome Web Store 公開
- [ ] v1.1: Export機能（PDF/CSV）
- [ ] v1.2: Premium課金（ExtensionPay + Stripe）
- [ ] v2.0: AI提案エンジン（Claude API連携）
