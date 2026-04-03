# Quiz Hub — 初学者向けコードリーディングガイド

## このアプリについて

JavaScript / TypeScript のスキルを実務レベルに引き上げるための練習アプリです。
3 種類の問題タイプを 1 つのアプリに統合しています。

| 問題タイプ | 形式 | 何を鍛えるか |
|-----------|------|-------------|
| メソッド問題 | テキスト入力 | 配列・文字列・Object のメソッドを咄嗟に書く |
| WEB API 問題 | テキスト入力 | localStorage・fetch・addEventListener などを咄嗟に書く |
| ロジック組み立て問題 | コードエディタで実装 | 日本語のシナリオをコードに落とし込む思考 |

---

## 画面構成と遷移

```
DashboardScreen（問題タイプ選択）
    ↓ タイプを選ぶ
LevelScreen（レベル選択: Junior / Middle）
    ↓ レベルを選ぶ
MethodQuizScreen または LogicQuizScreen（問題画面）
    ↓ 全問終了
ClearScreen（結果・スコア表示）
```

---

## ファイル構成と役割

```
src/
├── main.tsx                          # エントリーポイント。Reactをマウントするだけ
├── App.tsx                           # アプリ全体の状態管理・画面切替
├── App.module.css                    # ヘッダー・レイアウトのスタイル
├── index.css                         # CSS変数（ライト/ダーク）・body のリセット
├── types.ts                          # 型定義
│
├── data/
│   ├── methodQuestions.ts            # メソッド問題データ（30問）
│   ├── webApiQuestions.ts            # WEB API問題データ（24問）
│   └── logicQuestions.ts            # ロジック問題データ（13問）
│
├── lib/
│   └── runner.ts                     # コード実行エンジン（iframe sandbox）
│
└── components/
    ├── DashboardScreen.tsx / .css    # 問題タイプ選択画面
    ├── LevelScreen.tsx / .css        # レベル選択画面
    ├── MethodQuizScreen.tsx / .css   # メソッド・WEB API問題の問題画面
    ├── LogicQuizScreen.tsx / .css    # ロジック問題の問題画面
    └── ClearScreen.tsx / .css        # 結果表示画面
```

---

## 型定義（types.ts）

アプリ全体で使われる型を 1 ファイルに集約しています。

```ts
// 選択中の画面
type Screen = "dashboard" | "level" | "quiz" | "clear";

// 選択中の問題タイプ
type QuizType = "method" | "webapi" | "logic";

// 選択中のレベル
type Level = "junior" | "middle";

// メソッド問題・WEB API問題の問題データ
interface MethodQuestion {
  id: string;
  level: Level;
  category: string;
  question: string;
  answer: string[];    // 正解の文字列配列（複数の表記を許容できる）
  supplement: string;  // 回答後に表示する補足説明
}

// ロジック問題の問題データ
interface LogicQuestion {
  id: string;
  level: Level;
  category: string;
  question: string;
  starterCode: string; // エディタの初期コード
  expected: string;    // console.log の期待出力（JSON.stringify と一致する文字列）
  explanation: string; // 回答後に表示する解説（マークダウンのコードブロック対応）
}
```

---

## 状態管理の流れ（App.tsx）

`App.tsx` がアプリ全体の state を一元管理し、子コンポーネントへ props で渡します。

```tsx
// 現在表示している画面
const [screen, setScreen] = useState<Screen>("dashboard");

// 選択した問題タイプ
const [quizType, setQuizType] = useState<QuizType>("method");

// 選択したレベル
const [level, setLevel] = useState<Level>("junior");

// 出題する問題リスト（シャッフル済み）
const [methodQs, setMethodQs] = useState<MethodQuestion[]>([]);
const [logicQs, setLogicQs] = useState<LogicQuestion[]>([]);

// 現在の問題インデックスと正解数
const [currentIndex, setCurrentIndex] = useState(0);
const [correctCount, setCorrectCount] = useState(0);
```

### 画面遷移のトリガー

| ユーザーの操作 | 呼ばれる関数 | 結果 |
|--------------|-------------|------|
| タイプカードをクリック | `handleSelectType` | `screen = "level"` |
| レベルボタンをクリック | `handleSelectLevel` | 問題をシャッフルして `screen = "quiz"` |
| 全問回答 | `handleNext` | `screen = "clear"` |
| もう一度挑戦 | `handleRetry` | `handleSelectLevel` を再実行（同じレベルで再出題） |
| ダッシュボードへ | `handleDashboard` | `screen = "dashboard"` |

### 問題のシャッフルロジック

```ts
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];  // 要素を交換
  }
  return copy;
}
```

Fisher-Yates アルゴリズムで末尾から順にランダムな位置と交換します。
毎回 `[...arr]` でコピーを作るので元の配列は変更されません。

---

## メソッド問題・WEB API問題の仕組み（MethodQuizScreen.tsx）

### 答え合わせ

```ts
function normalize(str: string): string {
  return str.replace(/　/g, " ").trim(); // 全角スペース→半角に変換してtrim
}

function judge(input: string, answers: string[]): boolean {
  return answers.some((answer) => normalize(input) === answer);
}
```

- 全角スペースを許容することで、モバイルの誤入力に対応しています
- `answer` が配列なので、複数の正解表記（例: `forEach` と `for...of`）を持てます

### Enter キーで操作を進める

```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Enter") {
    if (!submitted) handleSubmit(); // 未回答 → 回答する
    else onNext(isCorrect);         // 回答済み → 次の問題へ
  }
};
```

---

## ロジック問題の仕組み（LogicQuizScreen.tsx + lib/runner.ts）

### コードの安全な実行

ユーザーが入力したコードをそのまま `eval()` で実行すると、DOM や `localStorage` にアクセスできてしまい危険です。
このアプリでは `sandbox` 属性付きの `<iframe>` 内で実行することで完全に隔離しています。

```
1. <iframe sandbox="allow-scripts"> を動的に作成（allow-scripts 以外は全部ブロック）
2. console.log を上書きして出力を配列に集める
3. ユーザーのコードを実行
4. postMessage で iframe → 親ウィンドウへ結果を送信
5. iframe を破棄
```

```ts
// runner.ts の核心部分
const html = `
  <script>
    const logs = [];
    console.log = (...args) => {
      logs.push(args.map(a => JSON.stringify(a)).join(" "));
    };
    try {
      ${code}  // ← ユーザーのコードがここに展開される
      Promise.resolve().then(() => {
        setTimeout(() => {
          parent.postMessage({ type: "run-result", output: logs, error: null }, "*");
        }, 0);
      });
    } catch (e) {
      parent.postMessage({ type: "run-result", output: logs, error: e.message }, "*");
    }
  <\/script>
`;
const blob = new Blob([html], { type: "text/html; charset=utf-8" });
iframe.src = URL.createObjectURL(blob);
```

`Promise.resolve().then(() => setTimeout(...))` という二重ネストは、
`async/await` を使ったコードが完了するのを待つためのパターンです。

### 判定方法

```ts
export function judge(output: string[], expected: string): boolean {
  return output.join("\n").trim() === expected.trim();
}
```

`console.log` の出力を改行で結合した文字列と `expected` を比較します。
問題データの `expected` は `JSON.stringify` の出力と合わせる必要があります。

```ts
// 例: console.log([1, 2, 3]) の出力は JSON.stringify で "[1,2,3]"
expected: "[1,2,3]"

// 例: console.log("hello") の出力は JSON.stringify で '"hello"'（ダブルクォート込み）
expected: '"hello"'
```

### Tab キーでインデント

テキストエリアは通常 Tab キーでフォーカスが移動してしまいます。
`preventDefault()` でそれを防ぎ、2 スペースを挿入しています。

```tsx
if (e.key === "Tab") {
  e.preventDefault();
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const newCode = code.substring(0, start) + "  " + code.substring(end);
  setCode(newCode);
  setTimeout(() => {
    el.selectionStart = start + 2;
    el.selectionEnd = start + 2;
  }, 0);
}
```

`setTimeout` は `setCode` による再レンダリング後にカーソル位置を設定するための遅延です。

---

## ダークモードの仕組み

```tsx
// App.tsx: localStorage から初期値を読み込む
const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");

// isDark が変わるたびに <html> の属性と localStorage を更新
useEffect(() => {
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}, [isDark]);
```

```css
/* index.css: data-theme 属性で CSS 変数を切り替える */
:root           { --bg-app: #f9fafb; --text-accent: #6366f1; /* ... */ }
[data-theme="dark"] { --bg-app: #0f0f17; --text-accent: #818cf8; /* ... */ }
```

`data-theme` 属性を `<html>` に付け替えるだけで、全コンポーネントの色が一斉に変わります。
`localStorage` に保存しているので、再訪問時も前回の設定が引き継がれます。

---

## ヘッダーの構成（App.tsx + App.module.css）

```tsx
<header className={styles.header}>
  <button className={styles.logo} onClick={handleDashboard}>
    Quiz Hub  {/* クリックでダッシュボードに戻る */}
  </button>
  <button className={styles.themeToggle}>🌙</button>
</header>
```

- `position: fixed` で画面上部に常時表示
- `justify-content: space-between` でロゴ左・トグル右に配置
- `<main>` に `padding-top: 4.25rem` でヘッダー分の余白を確保

---

## 問題を追加するには

### メソッド問題・WEB API問題

`src/data/methodQuestions.ts` または `src/data/webApiQuestions.ts` の配列に追加するだけです。

```ts
{
  id: "m-31",                    // ユニークな文字列
  level: "junior",               // "junior" | "middle"
  category: "配列メソッド",
  question: "〇〇したいとき",    // 「こういう場面では何を使う？」形式
  answer: ["メソッド名"],        // 複数正解は配列に追加: ["forEach", "for...of"]
  supplement: "補足説明",
},
```

### ロジック問題

`src/data/logicQuestions.ts` の配列に追加します。

```ts
{
  id: "l-14",
  level: "junior",
  category: "配列の操作",
  question: "問題文...",
  starterCode: `const arr = [1, 2, 3];\n\n// ここにコードを書く\n`,
  expected: "[2,4,6]",           // ブラウザの Console で JSON.stringify(result) を確認して記入
  explanation: "解説文...\n\n```js\n// コード例\n```",
},
```

`expected` の確認方法：ブラウザの Console で実際に `console.log(結果)` を実行して、
表示された文字列をそのまま `expected` に書きます。

---

## デプロイの仕組み

### ローカル起動

```bash
npm install
npm run dev   # http://localhost:5173 で起動
```

### GitHub Pages への自動デプロイ

`main` ブランチに push すると `.github/workflows/deploy.yml` が実行され、
自動でビルド → GitHub Pages にデプロイされます。

```
git add .
git commit -m "コメント"
git push origin main
# → 約1分後に https://aico0315.github.io/quiz-hub/ に反映
```

### なぜ vite.config.ts に base が必要か

GitHub Pages では URL が `https://ユーザー名.github.io/リポジトリ名/` になります。
`base: "/quiz-hub/"` を設定しないと、JS・CSS などのアセットのパスが `/assets/...` になってしまい、
サブパス配下では正しく読み込めません。

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: "/quiz-hub/",  // ← GitHub Pages のリポジトリ名に合わせる
});
```
