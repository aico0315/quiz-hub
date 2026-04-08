# スクロールバーのレイアウト調整とバランス

## 問題：スクロールバーが表示されて余白が崩れる

長いテキストをスクロール可能にする時、スクロールバーが出現することで余白のバランスが悪くなることがあります。

```
❌ 悪い例：スクロールバーで下部の余白が不均等
┌─────────────────────────┐
│ あなたの出力             │
│ [12000,34000,45000...  ║  ← スクロールバー
│                         ║
└─────────────────────────┘
  パディングなし → バランス悪い

✅ 良い例：スクロールバーを考慮した余白
┌─────────────────────────┐
│ あなたの出力             │
│ [12000,34000,45000...  ║  ← スクロールバー
│                         ║
│ (下部に余白)            │
└─────────────────────────┘
  padding-bottom で調整 → バランス良い
```

---

## 解決方法：パディングを調整する

### 1️⃣ 親要素に余白を設定

```css
.outputBox {
  padding: 1rem 1rem 1.5rem 1rem;  /* 下部を多めに */
  overflow-x: auto;
}
```

| 方向 | 値 | 理由 |
|------|-----|------|
| 上 | `1rem` | 通常の余白 |
| 左右 | `1rem` | 通常の余白 |
| **下** | `1.5rem` | **スクロールバー高さ分を追加** |

---

## テキストの折り返しを防ぐ

スクロール対応の時は、テキストの折り返しをコントロールすることが重要です。

### `white-space` プロパティ

```css
.outputBox code {
  white-space: pre;  /* 改行は保つ、自動折り返しはしない */
}
```

| 値 | 動き | 使う場面 |
|---|------|--------|
| `normal` | スペース/改行が圧縮される | 通常のテキスト |
| `pre-wrap` | 改行と自動折り返しを保つ | テキストを画面幅で折り返す |
| **`pre`** | 改行だけ保つ、自動折り返ししない | **スクロール可能なコード** |
| `nowrap` | 改行なし、スペース圧縮、折り返さない | 1行固定のテキスト |

---

## インライン要素でテキスト幅を確保する

`display: inline-block` を使う時は、テキスト幅を確保する必要があります。

```css
.outputBox code {
  display: inline-block;
  min-width: max-content;  /* 内容の幅を確保 */
}
```

### `min-width: max-content` とは

親要素の幅を超えるテキストがある場合、子要素が内容幅に合わせられます。

```
親の幅：400px
テキスト幅：600px

❌ min-width なし → テキストが折り返される
┌────────────┐
│ [12000,    │
│ 34000,     │
│ 45000...   │

✅ min-width: max-content → テキスト幅を確保
┌─────────────────────────────────────┐
│ [12000,34000,45000,67000,89000]    ║ ← スクロール
```

---

## 完成形：実装例

```css
.outputBox {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem 1rem 1.5rem 1rem;  /* ✅ 下部余白を増やす */
  overflow-x: auto;                 /* ✅ 横スクロール可能 */
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.outputBox code {
  font-family: "Fira Code", "Courier New", monospace;
  font-size: 0.9rem;
  color: var(--text-primary);
  background: var(--bg-subtle);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  display: inline-block;            /* ✅ インライン要素 */
  white-space: pre;                 /* ✅ 折り返し防止 */
  min-width: max-content;           /* ✅ テキスト幅確保 */
}
```

---

## ポイント

| 要素 | 設定 | 効果 |
|-----|------|------|
| 親（`.outputBox`） | `overflow-x: auto` | スクロール可能にする |
| 親（`.outputBox`） | `padding-bottom: 1.5rem` | スクロールバー分の余白 |
| 子（`.code`） | `display: inline-block` | インラインながら幅をコントロール |
| 子（`.code`） | `white-space: pre` | テキスト折り返しを防止 |
| 子（`.code`） | `min-width: max-content` | 内容幅を確保 |

---

## Webkit ブラウザのスクロールバーカスタマイズ

Chrome・Safari でもスクロールバーを統一するには：

```css
.outputBox::-webkit-scrollbar {
  height: 6px;  /* 高さ */
}

.outputBox::-webkit-scrollbar-track {
  background: transparent;  /* トラック */
}

.outputBox::-webkit-scrollbar-thumb {
  background-color: var(--border);
  border-radius: 3px;
}
```

---

## 関連リソース

- [MDN: white-space](https://developer.mozilla.org/ja/docs/Web/CSS/white-space)
- [MDN: overflow](https://developer.mozilla.org/ja/docs/Web/CSS/overflow)
- [MDN: padding](https://developer.mozilla.org/ja/docs/Web/CSS/padding)
