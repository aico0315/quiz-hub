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
    explanation: "`filter` で条件に合う要素だけ取り出せます。\n\n```js\nconst result = prices.filter(p => p >= 3000);\nconsole.log(result);\n```\n\n`p >= 3000` が true の要素だけが新しい配列に残ります。",
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
    explanation: "`map` で各要素を変換した新しい配列を作れます。\n\n```js\nconst result = prices.map(p => Math.round(p * 1.1));\nconsole.log(result);\n```\n\n`p * 1.1` だけだと浮動小数点誤差で `3300.0000000000005` になることがあります。`Math.round()` で丸めることで正確な整数が得られます。`map` は元の配列を変えず、変換後の新しい配列を返します。",
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
    explanation: "`sort` に比較関数を渡すと数値順に並び替えられます。\n\n```js\nconst result = sales.sort((a, b) => a - b);\nconsole.log(result);\n```\n\n引数なしの `sort()` は文字列順になるため、数値のソートでは必ず比較関数を渡しましょう。\n\n⚠️ `sort()` は元の配列を直接書き換えます（破壊的メソッド）。実務では元データを残したい場合が多いので、スプレッド構文でコピーしてから並び替えるのが安全です。\n\n```js\nconst result = [...sales].sort((a, b) => a - b);\n```",
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
    explanation: "`reduce` で配列を1つの値にまとめられます。\n\n```js\nconst result = cart.reduce((acc, item) => acc + item.price, 0);\nconsole.log(result);\n```\n\n`acc` が合計の累積値で、`0` が初期値です。各 `item.price` を順番に足していきます。",
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
    explanation: "`Set` はユニークな値だけを保持するデータ構造です。\n\n```js\nconst result = [...new Set(tags)];\nconsole.log(result);\n```\n\n`new Set(tags)` で重複が除去され、スプレッド構文 `[...]` で配列に戻します。",
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
    explanation: "`Math.max` にスプレッド構文を組み合わせると配列の最大値が取れます。\n\n```js\nconst result = Math.max(...pageViews);\nconsole.log(result);\n```\n\n`...pageViews` で配列を個別の引数として展開しています。\n\n⚠️ 配列の要素数が非常に多い場合（数万件以上）、スプレッド構文では引数が多すぎてエラーになることがあります。大量データを扱う実務では `reduce` の方が安全です。\n\n```js\nconst result = pageViews.reduce((max, v) => v > max ? v : max, -Infinity);\n```",
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
    explanation: "`split` で文字列を区切り文字で分割できます。\n\n```js\nconst result = tagString.split(',');\nconsole.log(result);\n```\n\n区切り文字自体は結果に含まれません。",
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
    explanation: "`join` で配列を1つの文字列に結合できます。\n\n```js\nconst result = breadcrumb.join(' / ');\nconsole.log(result);\n```\n\n引数に渡した文字列が各要素の間に挿入されます。",
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
    explanation: "`Object.keys` でオブジェクトのキー一覧を配列で取得できます。\n\n```js\nconst result = Object.keys(user);\nconsole.log(result);\n```\n\nフォームの項目を動的に生成したいときや、オブジェクトをループしたいときによく使います。",
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
    explanation: "三項演算子で条件によって値を切り替えられます。\n\n```js\nconst result = stock >= 1 ? '在庫あり' : '在庫なし';\nconsole.log(result);\n```\n\n`条件 ? trueのとき : falseのとき` という書き方です。if文よりも短く書けます。\n\n💡 実務では `stock > 0` と書くことが多いです。返品処理などでマイナス在庫が発生するシステムでは `>= 1` より `> 0` の方が意図が明確になります。また、在庫数を表示する場合は三項演算子よりも早期リターンで書くとより読みやすくなります。\n\n```js\nif (stock <= 0) {\n  console.log('在庫なし');\n  return;\n}\nconsole.log('在庫あり');\n```",
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
    explanation: "`filter` と `map` をメソッドチェーンで繋げます。\n\n```js\nconst result = users\n  .filter(u => u.followers >= 1000)\n  .map(u => u.name);\nconsole.log(result);\n```\n\n「絞り込み → 変換」の順番で処理することで、条件を満たすユーザーの名前だけを取り出せます。",
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
    explanation: "`reduce` でオブジェクトにまとめられます。\n\n```js\nconst result = orders.reduce(\n  (acc, order) => {\n    acc[order.status].push(order.id);\n    return acc;\n  },\n  { shipped: [], pending: [] }\n);\nconsole.log(result);\n```\n\n初期値に `{ shipped: [], pending: [] }` を渡し、各注文のステータスに応じてIDを振り分けています。",
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
    explanation: "`async/await` で非同期処理の結果を受け取れます。\n\n```js\nasync function main() {\n  const product = await fetchProduct();\n  console.log(product.name);\n}\nmain();\n```\n\n`await` を使うことで Promise の完了を待ってから次の行に進めます。実際のAPI呼び出しも同じパターンで書きます。\n\n⚠️ 実務では `try/catch` によるエラーハンドリングが必須です。APIが失敗したときに何も対処しないと、アプリが意図せず止まったりユーザーに何も表示されなくなります。\n\n```js\nasync function main() {\n  try {\n    const product = await fetchProduct();\n    console.log(product.name);\n  } catch (error) {\n    console.error('取得に失敗しました:', error);\n  }\n}\nmain();\n```",
  },
];
