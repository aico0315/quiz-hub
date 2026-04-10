# 補足テキストにコードブロックを自動表示する

## 何をしたのか

補足エリアのテキストを「説明文」と「コード」で自動的に分けて表示するようにしました。

```
変更前：全て同じスタイルのテキストで表示
変更後：コード行 → ダークなコードブロック
        説明文  → 読みやすい段落
```

---

## なぜこの方法にしたのか

補足テキストにコード例を含めると、長い1行が画面端で途切れて読みにくくなる問題がありました。

最初は CSS の `word-break` や `\n` で改行を挿入して対応しようとしましたが、どうしても不自然な見た目になってしまいました。

ロジック問題の解説エリアが「コードをコードブロックで表示」していることに気づき、同じ方法を補足エリアにも適用することにしました。

---

## 実装の仕組み

### 1. コード行の判定

行の先頭が `const` `let` `new` `fetch` `try` などで始まる行を「コード」と判定します。

```ts
const CODE_START = /^(const |let |var |new |await |fetch|try|catch|\}|\{|if |return |...)/;

function isCodeLine(line: string): boolean {
  return CODE_START.test(line);
}
```

### 2. テキストを行ごとに分類して表示

```ts
function renderSupplement(text: string) {
  const lines = text.split("\n");  // \n で行に分割
  const result = [];
  let codeBuffer = [];             // コード行をまとめるバッファ

  lines.forEach((line) => {
    if (isCodeLine(line)) {
      codeBuffer.push(line);       // コード行はバッファに追加
    } else {
      if (codeBuffer.length > 0) {
        // バッファにコードが溜まっていたら一括でコードブロックに
        result.push(<pre><code>{codeBuffer.join("\n")}</code></pre>);
        codeBuffer = [];
      }
      // 説明文は段落として表示
      result.push(<p>{line}</p>);
    }
  });

  return result;
}
```

### 3. 補足エリアで使う

```tsx
<div className={styles.supplement}>
  <span className={styles.supplementLabel}>補足</span>
  {renderSupplement(question.supplement)}
</div>
```

---

## データの書き方

コードと説明文を `\n` で区切って書くだけで自動的に振り分けられます。

```ts
supplement: "例：ユーザー情報と投稿を同時に取得する。\nconst [user, posts] = await Promise.all([fetchUser(id), fetchPosts(id)])\n順番に fetch するより速い。",
```

**表示結果：**
```
例：ユーザー情報と投稿を同時に取得する。

┌─────────────────────────────────────────────────────────┐
│ const [user, posts] = await Promise.all([...])          │  ← コードブロック
└─────────────────────────────────────────────────────────┘

順番に fetch するより速い。
```

---

## CSS スタイル

```css
/* コードブロック */
.supplementCode {
  background: #1e1e2e;       /* ダーク背景 */
  color: #cdd6f4;            /* 明るいテキスト */
  border-radius: 8px;
  padding: 0.7rem 1rem;
  font-size: 0.82rem;
  line-height: 1.7;
  overflow-x: auto;          /* 長いコードは横スクロール */
  white-space: pre;          /* インデントを保持 */
}

.supplementCode code {
  font-family: "Fira Code", "Courier New", monospace;
}

/* 説明文の段落 */
.supplementLine {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  line-height: 1.65;
  overflow-wrap: break-word;
  word-break: normal;
}

.supplementLine:last-child {
  margin-bottom: 0;
}
```

---

## 学んだこと

### 問題を根本から解決する

最初は「長いコードが折り返される」問題を CSS だけで解決しようとしていました。しかし、コードという性質上、途中で折り返すと読みにくくなります。

「コードはコードとして表示する」という根本的な解決策に切り替えたことで、見た目も実装もシンプルになりました。

### 既存の実装を参考にする

ロジック問題の解説エリア（`LogicQuizScreen`）が既に同じ問題を `renderExplanation()` 関数で解決していました。同じパターンをメソッド問題の補足エリアに適用することで、一貫性のある実装になりました。

---

## 関連ファイル

- [src/components/MethodQuizScreen.tsx](../../src/components/MethodQuizScreen.tsx) — renderSupplement 関数
- [src/components/MethodQuizScreen.module.css](../../src/components/MethodQuizScreen.module.css) — supplementCode / supplementLine スタイル
- [src/data/webApiQuestions.ts](../../src/data/webApiQuestions.ts) — 補足テキストのデータ
