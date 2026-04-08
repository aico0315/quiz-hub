# CSS でテキスト折り返しを実装する

## 何が問題だったのか

アプリの「あなたの出力」という箇所に長いテキスト（配列や数値の羅列）が表示される時に、テキストが折り返されずに画面からはみ出してしまっていました。

```
❌ 悪い例：[12000,34000,45000,67000,89000] ← 1行で表示される
✅ 良い例：
[12000,34000,
45000,67000,
89000] ← 適切に折り返される
```

---

## なぜ折り返されなかったのか

`<code>` 要素（HTMLコード）はデフォルトで「**インライン要素**」です。

### インライン要素とは

- テキストと同じように流れる要素
- 幅が自動に決まる（親の幅に合わせて拡大する）
- 親の幅を超えるテキストは自動では折り返されない

```html
<code>とても長いテキスト...</code>
```

このコードだけだと、親がいくら狭くても `<code>` は幅を広げてしまいます。

---

## 修正方法（3つの CSS プロパティ）

### 1️⃣ `display: block;`

インライン要素をブロック要素に変更します。ブロック要素は親の幅に収まります。

```css
code {
  display: block;  /* 親の幅を100%使う */
}
```

### 2️⃣ `word-break: break-all;`

単語の途中であっても折り返します。

```css
code {
  word-break: break-all;  /* 単語の途中でも折り返す */
}
```

| 値 | 動き | 使う場面 |
|---|------|--------|
| `normal` | 単語ごとに折り返す（デフォルト） | 英語など |
| `break-word` | 単語が長い場合に途中で折り返す | まあまあ長い単語 |
| **`break-all`** | 常に文字ごとに折り返す | プログラムコード、数値列 |

### 3️⃣ `overflow-wrap: break-word;`

長い単語がある時の念のための保険です。

```css
code {
  overflow-wrap: break-word;  /* 単語が長すぎる場合の安全弁 */
}
```

---

## 完成形

```css
.outputBox code {
  font-family: "Fira Code", "Courier New", monospace;
  font-size: 0.9rem;
  color: var(--text-primary);
  background: var(--bg-subtle);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  
  /* ✅ 追加した3つ */
  display: block;
  word-break: break-all;
  overflow-wrap: break-word;
  
  white-space: pre-wrap;  /* 元々あった：改行を保つ */
}
```

---

## この修正が活躍する場面

### ✅ 活躍する場面
- コード実行結果の表示
- JSON データの表示
- 配列・オブジェクトの出力
- ログメッセージ
- エラーメッセージ

### ⚠️ 注意点
スマートフォンの狭い画面では、`break-all` によって単語が1文字ずつ折り返されることがあります。

---

## 発展：より洗練された方法

実装例では `break-all` を使いましたが、より洗練された方法もあります：

```css
code {
  display: block;
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;  /* ハイフンを自動挿入（言語指定必須） */
}
```

この場合、単語を優先的に保ちながら、必要な時だけ途中で折り返します。

---

## 関連リソース

- [MDN: word-break](https://developer.mozilla.org/ja/docs/Web/CSS/word-break)
- [MDN: overflow-wrap](https://developer.mozilla.org/ja/docs/Web/CSS/overflow-wrap)
- [MDN: white-space](https://developer.mozilla.org/ja/docs/Web/CSS/white-space)
