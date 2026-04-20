# 問題補足テキストの修正まとめ

実際にアプリを使いながら「おかしい」「わかりにくい」と気づいた箇所を修正しました。
初学者がつまずきやすいポイントを中心に、コードの正確さと説明のわかりやすさを改善しています。

---

## 1. Markdown の装飾（**）を除去

### 何が問題だったか
`logicQuestions.ts` の補足テキスト4箇所に `**filter**` や `**なぜ比較関数が必要？**` のような Markdown の太字記法が残っていました。アプリ内では `**` がそのまま文字として表示されてしまい、見た目がおかしくなっていました。

### 修正内容
`**` をすべて削除して、プレーンテキストに統一しました。

---

## 2. 文字列 includes：段階的な実務例に改善

### 何が問題だったか
実務例が「`filter` + `toLowerCase` + `includes` を組み合わせた検索絞り込み」の1パターンだけで、`includes` 単体の一番シンプルな使い方が伝わりませんでした。

### 修正内容
2段階の実務例に整理しました。

**実務例①（シンプルな使い方）**
```js
const message = 'network error occurred';
if (message.includes('network')) {
  showNetworkError();
}
```

**実務例②（応用パターン）**
```js
const keyword = searchInput.toLowerCase();
const filtered = products.filter(p =>
  p.name.toLowerCase().includes(keyword)
);
```

①を理解してから②を見ると「さっきのを組み合わせているだけ」と繋がりやすくなります。

---

## 3. sort()：説明文の誤りと例の不備を修正

### 何が問題だったか

**問題①：同じ配列を2回書いていた**
「`[12000, 34000, ...]` ではなく `[12000, 34000, ...]`」と、「ではなく」の前後が全く同じ内容になっていました。

**問題②：例として不適切な数値を使っていた**
元の `sales` 配列 `[45000, 12000, 89000, 34000, 67000]` は全部5桁なので、比較関数なしの `sort()` でもたまたま正しい順番になってしまいます。「比較関数が必要」という説明の根拠になりません。

### 修正内容
桁数が混在する数値を使って、文字列ソートの問題を明確に示しました。

```js
[100, 25, 1000, 9, 50].sort()
// → [100, 1000, 25, 50, 9]  ← 「1」「2」「5」「9」の字面順になってしまう

[100, 25, 1000, 9, 50].sort((a, b) => a - b)
// → [9, 25, 50, 100, 1000]  ← 数値として正しい昇順
```

また `(a, b) => a - b` の仕組み（負なら a を前に、正なら b を前に）も添えました。

---

## 4. slice()：ページネーション例に説明を追加

### 何が問題だったか
```js
const current = items.slice((page - 1) * perPage, page * perPage);
```
`items` がどこから来たのか定義がなく、計算式だけが突然現れる形でした。初学者には「何をしているのか」が読み取りにくい状態でした。

### 修正内容
変数を定義し、計算結果をコメントで明示しました。

```js
const allItems = ['商品A', '商品B', '商品C', /* ...全100件 */];
const page = 2;      // 表示したいページ番号
const perPage = 10;  // 1ページあたりの件数

const start = (page - 1) * perPage; // → 10
const end = page * perPage;         // → 20
const current = allItems.slice(start, end);
// インデックス10〜19の10件が取り出される
```

---

## 5. window.scrollTo：セクションスクロールの例を追加

### 何が問題だったか
実務例が「ページトップへ戻る（`top: 0`）」の1パターンだけで、`window.scrollTo` の本来の強みである「任意の位置へスクロール」が伝わりませんでした。

### 修正内容
ナビゲーションリンクからセクションへスムーズスクロールする例を追加しました。

```js
const link = document.querySelector('a[href="#about"]');
link.addEventListener('click', (e) => {
  e.preventDefault(); // aタグのデフォルトのジャンプを無効化
  const section = document.querySelector('#about');
  const top = section.getBoundingClientRect().top + window.scrollY;
  // getBoundingClientRect().top → 今の画面上の位置
  // window.scrollY → すでにスクロールした量
  // 2つを足すとページ先頭からの距離になる
  window.scrollTo({ top, behavior: 'smooth' });
});
```

---

## 6. document.querySelectorAll：NodeList の説明を改善・実務例②を追加

### 何が問題だったか
「返り値は NodeList（配列に似たリスト）なので forEach で回せる」という説明で、用語が先に来てしまい意味が伝わりにくい状態でした。

### 修正内容
意味を先に、用語を後に並べ替えました。

> 「取得した結果は**要素のリスト（NodeList）**として返ってくる。forEach でひとつずつ処理できるが、map や filter は使えない。」

また、`map` や `filter` を使いたい場合にスプレッド構文で配列に変換する実務例②を追加しました。

```js
const items = document.querySelectorAll('.item');
const texts = [...items].map(item => item.textContent);
// ['テキスト1', 'テキスト2', 'テキスト3', ...]
```

---

## 7. localStorage × JSON：null フォールバックを追加

### 何が問題だったか
```js
const saved = JSON.parse(localStorage.getItem('cart'));
```
データがまだ保存されていない場合、`getItem` は `null` を返します。その後 `saved.forEach(...)` などを書くと「Cannot read properties of null」エラーになります。初学者が実際に使うと高確率でハマるパターンでした。

### 修正内容
`|| '[]'` を追加して、データがない場合のフォールバックを示しました。

```js
// || '[]' は「データがまだ保存されていない場合は空配列として扱う」という意味
const saved = JSON.parse(localStorage.getItem('cart') || '[]');
```

`||` は「左側が null や undefined のとき、右側の値を使う」という意味です（OR演算子のフォールバック活用）。

---

## 8. document.getElementById：nullチェックを追加

### 何が問題だったか
```js
const btn = document.getElementById('submit-btn');
btn.disabled = true;
```
該当するIDの要素が存在しない場合、`getElementById` は `null` を返します。`btn` が `null` のまま `btn.disabled` にアクセスすると「Cannot set properties of null」エラーになります。

### 修正内容
`if (btn)` でラップして nullチェックを入れました。

```js
const btn = document.getElementById('submit-btn');
if (btn) {
  btn.disabled = true;
}
// if がないと、btnがnullのとき「Cannot set properties of null」エラーになる
```

`querySelector` も同様で、要素を取得した後に操作する前は必ず nullチェックを入れる習慣をつけることが大切です。

---

## まとめ：今回の修正で学べること

| 修正内容 | 学べること |
|---|---|
| `**` の除去 | Markdown 記法はアプリ外では表示されない |
| includes の段階化 | 「シンプルな使い方」→「応用」の順で学ぶ |
| sort() の修正 | 引数なし sort() の落とし穴（文字列ソート） |
| slice() の補足 | 計算式はコメントで中間結果を示すと読みやすい |
| scrollTo の追加例 | `top: 0` 以外への応用パターン |
| querySelectorAll の改善 | NodeList は配列とは別物 |
| localStorage の修正 | `null` を受け取った後の処理を考える習慣 |
| getElementById の修正 | DOM 取得後は必ず nullチェック |
