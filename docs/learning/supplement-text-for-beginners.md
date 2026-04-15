# 補足テキストの書き方：初学者に伝わる解説の設計

## 何を変えたか

| ファイル | 変更内容 |
|---|---|
| `src/data/methodQuestions.ts` | 全30問の補足テキストを初学者向けに書き直し＋実務例コード追加 |
| `src/data/webApiQuestions.ts` | コード例が未記載だった5問を補完＋専門語に補足追加 |
| `src/data/logicQuestions.ts` | 「なぜこのメソッドを使うか」の説明を全問に追加 |
| `src/components/MethodQuizScreen.tsx` | `renderSupplement` をコードフェンス対応に修正 |

---

## 1. 専門用語は「やさしい説明（用語）」の形式で出す

専門用語をいきなり使うと意味が分からず止まってしまう。かといって用語を避けると、検索しても調べられない。

**解決策：まず言葉で説明してから、括弧で用語をセットにする。**

```
// 悪い例：用語だけ
元の配列は変更しない非破壊メソッド。

// 良い例：説明 + 用語
元の配列はそのまま残り、変換後の新しい配列が返ってくる（非破壊メソッド）。
```

他の例：
- 元の配列自体が書き換わる（破壊メソッド）
- true か false が返ってくる（真偽値を返すメソッド）
- 今まで積み上げてきた合計（acc＝accumulator）
- ページを丸ごと読み込まず必要な部分だけ更新するアプリの仕組み（SPA）

---

## 2. 「何ができるか」より「いつ使うか」を先に伝える

初学者が困るのは「このメソッドが何をするか」ではなく、「この状況でどのメソッドを使えばいいか」が分からないこと。

```
// 悪い例：機能の説明だけ
arr.filter(x => x > 0) のように使う。条件を満たさない要素は除外される。

// 良い例：場面 → 機能 → コード の順
ECサイトで「在庫あり」の商品だけ表示したいとき → filter を使う。

const inStock = products.filter(p => p.stock > 0);
```

---

## 3. 似たメソッドは比較して覚えさせる

単体で説明するより、混同しやすいものをセットで示すと記憶に残りやすい。

```
// filter と map の違い
- filter → 要素を「絞り込む」（数が減る）
- map   → 要素を「変換する」（数は変わらない）

// join と split の違い
- join  → 配列を文字列に結合する
- split → 文字列を配列に分割する（join の逆）
```

---

## 4. reduce はステップごとに実行イメージを見せる

reduce は初学者がつまずきやすいメソッド。「何が起きているか」を順番に書くと理解しやすい。

```js
const cart = [
  { name: 'Tシャツ', price: 2500 },
  { name: 'ジーンズ', price: 6800 },
  { name: 'スニーカー', price: 9800 },
];
const total = cart.reduce((acc, item) => acc + item.price, 0);
```

実行イメージ：
1. acc=0,     item={price:2500} → acc=2500
2. acc=2500,  item={price:6800} → acc=9300
3. acc=9300,  item={price:9800} → acc=19100

---

## 5. コードブロックの表示：コードフェンス対応

### 問題

補足テキストに ` ```js ``` ` 形式でコードを書いても、正しく1つのブロックとして表示されなかった。`];` や `// コメント` などが独立したコードブロックになってしまっていた。

### 原因

`renderSupplement` 関数が自前の正規表現でコード行を判定していたため、コードフェンス（` ``` `）を理解できなかった。

### 修正後のコード

```tsx
function renderSupplement(text: string) {
  const lines = text.split("\n");
  const result: React.ReactNode[] = [];
  let codeBuffer: string[] = [];
  let inCode = false;
  let keyCounter = 0;

  lines.forEach((line, i) => {
    if (line.startsWith("```")) {
      if (!inCode) {
        inCode = true;   // コードブロック開始
        codeBuffer = [];
      } else {
        inCode = false;  // コードブロック終了 → まとめて <pre> に
        result.push(
          <pre key={`code-${keyCounter++}`} className={styles.supplementCode}>
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        );
        codeBuffer = [];
      }
    } else if (inCode) {
      codeBuffer.push(line); // コードブロック内の行を溜める
    } else if (line.trim()) {
      result.push(
        <p key={i} className={styles.supplementLine}>{line}</p>
      );
    }
  });

  return result;
}
```

**ポイント：**
- ` ``` ` が来たら「コードブロックの中に入る」フラグを立てる
- ` ``` ` が2回目に来たら「コードブロックが終わった」として `<pre>` タグとして出力する
- フラグ（`inCode`）で「今どこにいるか」を管理するのが状態管理の基本的なパターン

---

## 6. 学習まとめ

| 工夫 | 効果 |
|---|---|
| 説明（用語）の形式 | 言葉で理解してから用語を覚えられる |
| 「いつ使うか」を先に | 実際の場面とメソッドが結びつく |
| 似たメソッドの比較 | 混同を防ぎ、使い分けが身につく |
| ステップ実行イメージ | 抽象的な処理が具体的に見える |
| コードフェンス対応 | 複数行のコードを1つのブロックとして表示できる |
