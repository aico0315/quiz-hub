import type { LogicQuestion } from "../types";

export const logicQuestions: LogicQuestion[] = [
  {
    id: "l-1",
    level: "junior",
    category: "配列の操作",
    question: "ECサイトの商品一覧から、価格が3000円以上の商品価格だけを取り出して `console.log` で出力してください。",
    starterCode: `const prices = [1200, 3500, 800, 5000, 2000];

// ここにコードを書く
`,
    expected: "[3500,5000]",
    explanation: "「条件に合う要素だけ取り出す」には `filter` を使います。\n\n```js\nconst result = prices.filter(p => p >= 3000);\nconsole.log(result);\n```\n\n`filter` に渡した関数が `true` を返した要素だけが、新しい配列に残ります。元の `prices` 配列はそのまま残ります（非破壊メソッド）。\n\nmap と混同しやすいポイント：\n- filter → 要素を「絞り込む」（数が減る）\n- map → 要素を「変換する」（数は変わらない）",
  },
  {
    id: "l-2",
    level: "junior",
    category: "配列の操作",
    question: "ECサイトの商品価格リストに消費税（1.1倍）をかけた、税込み価格の配列を `console.log` で出力してください。",
    starterCode: `const prices = [1000, 2000, 3000, 4000, 5000];

// ここにコードを書く
`,
    expected: "[1100,2200,3300,4400,5500]",
    explanation: "「全要素を同じルールで変換した新しい配列を作る」には `map` を使います。\n\n```js\nconst result = prices.map(p => Math.round(p * 1.1));\nconsole.log(result);\n```\n\n`p * 1.1` だけだと浮動小数点の誤差で `3300.0000000000005` のような値になることがあります。`Math.round()` で四捨五入することで正確な整数が得られます。\n\n`map` は元の配列を変えず、変換後の新しい配列を返します（非破壊メソッド）。",
  },
  {
    id: "l-3",
    level: "junior",
    category: "配列の操作",
    question: "管理画面で表示する月別売上を、金額が低い順に並び替えて `console.log` で出力してください。",
    starterCode: `const sales = [45000, 12000, 89000, 34000, 67000];

// ここにコードを書く
`,
    expected: "[12000,34000,45000,67000,89000]",
    explanation: "配列の並び替えには `sort` を使います。数値を正しく並び替えるには、比較関数を渡す必要があります。\n\n```js\nconst result = sales.sort((a, b) => a - b);\nconsole.log(result);\n```\n\nなぜ比較関数が必要？\n引数なしの `sort()` は数値を文字列として並べるため、`[12000, 34000, 45000, 67000, 89000]` ではなく `[12000, 34000, 45000, 67000, 89000]`…と字面で比べてしまい意図しない順番になることがあります。`(a, b) => a - b` と渡すと数値として正しく比較されます。\n\n⚠️ `sort()` は元の配列を直接書き換えます（破壊メソッド）。元のデータを残したい場合は、先にコピーしてから並び替えるのが安全です。\n\n```js\nconst result = [...sales].sort((a, b) => a - b);\n```",
  },
  {
    id: "l-4",
    level: "junior",
    category: "配列の操作",
    question: "ECサイトのカートに入っている商品の合計金額を計算して `console.log` で出力してください。",
    starterCode: `const cart = [
  { name: 'Tシャツ', price: 2500 },
  { name: 'ジーンズ', price: 6800 },
  { name: 'スニーカー', price: 9800 },
];

// ここにコードを書く
`,
    expected: "19100",
    explanation: "「配列の全要素を1つの値にまとめる」には `reduce` を使います。合計・最大値・グルーピングなど、「最終的に1つの値にしたい」場面が出番です。\n\n```js\nconst result = cart.reduce((acc, item) => acc + item.price, 0);\nconsole.log(result);\n```\n\n引数の読み方：\n- `acc`（accumulator＝累積値）：今まで足してきた合計\n- `item`：今見ている要素\n- `0`：最初の `acc` の値（初期値）\n\n実行イメージ：\n1. acc=0, item={price:2500} → acc=2500\n2. acc=2500, item={price:6800} → acc=9300\n3. acc=9300, item={price:9800} → acc=19100",
  },
  {
    id: "l-5",
    level: "junior",
    category: "配列の操作",
    question: "ブログ記事に付けられたタグ一覧から、重複を取り除いた配列を `console.log` で出力してください。",
    starterCode: `const tags = ['JavaScript', 'React', 'JavaScript', 'TypeScript', 'React'];

// ここにコードを書く
`,
    expected: '["JavaScript","React","TypeScript"]',
    explanation: "重複を取り除くには `Set` を使います。\n\n```js\nconst result = [...new Set(tags)];\nconsole.log(result);\n```\n\n`Set` は「同じ値を2つ以上持てない」データ構造です。配列を渡すと自動で重複が取り除かれます。最後のスプレッド構文 `[...]` で通常の配列に戻しています。\n\nfilter で自前実装することもできますが、Set を使う方がシンプルで読みやすいコードになります。",
  },
  {
    id: "l-6",
    level: "junior",
    category: "配列の操作",
    question: "ブログの日別ページビュー数から、最もアクセス数が多い日の数値を `console.log` で出力してください。",
    starterCode: `const pageViews = [1240, 3850, 920, 5670, 2100];

// ここにコードを書く
`,
    expected: "5670",
    explanation: "`Math.max` にスプレッド構文を組み合わせると、配列の最大値が取れます。\n\n```js\nconst result = Math.max(...pageViews);\nconsole.log(result);\n```\n\n`Math.max` は「複数の引数」を受け取る関数です（例：`Math.max(1, 2, 3)` → 3）。スプレッド構文 `...` で配列を個別の引数として展開することで、配列にも使えるようになります。\n\n⚠️ 要素数が非常に多い配列（数万件以上）では、引数の数が多すぎてエラーになることがあります。大量データには `reduce` の方が安全です。\n\n```js\nconst result = pageViews.reduce((max, v) => v > max ? v : max, -Infinity);\n```",
  },
  {
    id: "l-7",
    level: "junior",
    category: "文字列の操作",
    question: "ブログ記事のタグがカンマ区切りの文字列で保存されています。これを分割して配列にし、`console.log` で出力してください。",
    starterCode: `const tagString = 'React,TypeScript,Vite,Node.js';

// ここにコードを書く
`,
    expected: '["React","TypeScript","Vite","Node.js"]',
    explanation: "文字列を区切り文字で分割して配列にするには `split` を使います。\n\n```js\nconst result = tagString.split(',');\nconsole.log(result);\n```\n\n`split` は `join` の逆操作です。\n- `join` → 配列を文字列に結合する\n- `split` → 文字列を配列に分割する\n\nDBにカンマ区切りで保存されたデータを扱う場面や、CSVの処理でよく使います。",
  },
  {
    id: "l-8",
    level: "junior",
    category: "文字列の操作",
    question: "ECサイトの現在地を示すパンくずリストを、カテゴリの配列から `/`（スラッシュの前後にスペースあり）で繋いだ文字列にして `console.log` で出力してください。",
    starterCode: `const breadcrumb = ['メンズ', 'トップス', 'セール'];

// ここにコードを書く
`,
    expected: '"メンズ / トップス / セール"',
    explanation: "配列を1つの文字列に結合するには `join` を使います。\n\n```js\nconst result = breadcrumb.join(' / ');\nconsole.log(result);\n```\n\n引数に渡した文字列が、各要素の「間」に挿入されます。スペースも含めて `' / '` と指定するのがポイントです。\n\n`join` と `split` はセットで覚えましょう。`['a', 'b', 'c'].join(',')` → `'a,b,c'`、`'a,b,c'.split(',')` → `['a', 'b', 'c']`",
  },
  {
    id: "l-9",
    level: "junior",
    category: "オブジェクトの操作",
    question: "管理画面でユーザー情報の入力フォームを動的に生成したい。ユーザーオブジェクトのフィールド名（キー）一覧を配列で `console.log` してください。",
    starterCode: `const user = { id: 1, name: '田中太郎', email: 'tanaka@example.com', role: 'admin' };

// ここにコードを書く
`,
    expected: '["id","name","email","role"]',
    explanation: "オブジェクトのキー（プロパティ名）一覧を配列で取得するには `Object.keys` を使います。\n\n```js\nconst result = Object.keys(user);\nconsole.log(result);\n```\n\nなぜこれが便利？\nキーが分かれば `forEach` や `map` でループしてフォームの入力欄を自動生成できます。フィールドが増えても手動で追加する必要がなくなります。\n\nセットで覚えたいメソッド：\n- `Object.keys(obj)` → キーの配列\n- `Object.values(obj)` → 値の配列\n- `Object.entries(obj)` → [キー, 値] のペアの配列",
  },
  {
    id: "l-10",
    level: "junior",
    category: "条件分岐",
    question: "ECサイトで在庫状況を表示したい。`stock` が1以上なら `'在庫あり'`、0なら `'在庫なし'` と `console.log` で出力してください。",
    starterCode: `const stock = 0;

// ここにコードを書く
`,
    expected: '"在庫なし"',
    explanation: "条件によって値を切り替えるには、三項演算子が使えます。\n\n```js\nconst result = stock >= 1 ? '在庫あり' : '在庫なし';\nconsole.log(result);\n```\n\n三項演算子の構造：`条件 ? 条件がtrueのとき : 条件がfalseのとき`\n\nif文でも同じことができます。条件が単純なときは三項演算子、複数の分岐があるときは if文の方が読みやすくなります。\n\n```js\nif (stock >= 1) {\n  console.log('在庫あり');\n} else {\n  console.log('在庫なし');\n}\n```\n\n💡 実務では `stock > 0` と書くことが多いです。返品処理でマイナス在庫が発生するシステムでは `>= 1` より `> 0` の方が意図が明確になります。",
  },
  {
    id: "l-11",
    level: "middle",
    category: "配列の操作",
    question: "SNSのユーザー一覧から、フォロワー数が1000以上のユーザー名だけを取り出した配列を `console.log` してください。",
    starterCode: `const users = [
  { name: '田中', followers: 1500 },
  { name: '佐藤', followers: 320 },
  { name: '鈴木', followers: 4200 },
  { name: '山田', followers: 890 },
];

// ここにコードを書く
`,
    expected: '["田中","鈴木"]',
    explanation: "`filter` と `map` をメソッドチェーン（連続して呼び出すこと）で繋げます。\n\n```js\nconst result = users\n  .filter(u => u.followers >= 1000)\n  .map(u => u.name);\nconsole.log(result);\n```\n\n「絞り込んでから変換」という順番が重要です。逆（変換してから絞り込む）にすると、name だけになった後では followers で絞り込めません。\n\nステップごとに考えると分かりやすいです：\n1. `filter` → フォロワー1000以上のユーザーオブジェクトだけ残す\n2. `map` → 残ったオブジェクトから name だけ取り出す",
  },
  {
    id: "l-12",
    level: "middle",
    category: "オブジェクトの操作",
    question: "ECサイトの注文一覧を、`shipped`（発送済み）と `pending`（未発送）に分類した注文IDのリストオブジェクトを `console.log` してください。",
    starterCode: `const orders = [
  { id: 1, status: 'shipped' },
  { id: 2, status: 'pending' },
  { id: 3, status: 'shipped' },
  { id: 4, status: 'pending' },
  { id: 5, status: 'shipped' },
];

// ここにコードを書く
`,
    expected: '{"shipped":[1,3,5],"pending":[2,4]}',
    explanation: "`reduce` は「配列を1つの値にまとめる」メソッドです。その「1つの値」はオブジェクトでも構いません。\n\n```js\nconst result = orders.reduce(\n  (acc, order) => {\n    acc[order.status].push(order.id);\n    return acc;\n  },\n  { shipped: [], pending: [] } // 初期値：分類先のオブジェクト\n);\nconsole.log(result);\n```\n\nこのように「配列をオブジェクトに変換する」パターンはよく使います。「グルーピング」とも呼ばれます。\n\n`filter` を2回使う方法（shipped だけ絞る・pending だけ絞る）でも実現できますが、`reduce` を使うと配列を1回だけ走査（ループ）すれば済むので効率的です。",
  },
  {
    id: "l-13",
    level: "middle",
    category: "非同期処理",
    question: "商品情報を取得するAPIを模した関数 `fetchProduct` があります。これを呼び出して、取得した商品の `name` を `console.log` してください。",
    starterCode: `const fetchProduct = () =>
  new Promise(resolve =>
    setTimeout(() => resolve({ id: 1, name: 'ワイヤレスイヤホン', price: 12800 }), 500)
  );

// ここにコードを書く
`,
    expected: '"ワイヤレスイヤホン"',
    explanation: "`async/await` を使うと、非同期処理（時間のかかる処理）の結果を「待ってから」次の行を実行できます。\n\n```js\nasync function main() {\n  const product = await fetchProduct();\n  console.log(product.name);\n}\nmain();\n```\n\nなぜ async/await が必要？\n`fetchProduct()` は結果がすぐ返ってこず、500ms後に返ってくる非同期処理です。`await` なしで呼ぶと、結果が届く前に次の行が実行されてしまいます。\n\n`async` をつけた関数の中でだけ `await` が使えます。実際のAPI呼び出しもこの同じパターンで書きます。\n\n⚠️ 実務では `try/catch` でエラー処理をセットで書くのが基本です。APIが失敗したときに何もしないと、アプリが止まったりユーザーに何も表示されなくなります。\n\n```js\nasync function main() {\n  try {\n    const product = await fetchProduct();\n    console.log(product.name);\n  } catch (error) {\n    console.error('取得に失敗しました:', error);\n  }\n}\nmain();\n```",
  },
];
