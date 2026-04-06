# クイズ進捗の保存・復元機能

## 何を解決したか

ロジック組み立て問題でコードを書いている途中に別の画面に移動したりリロードすると、
最初からやり直しになってしまう問題を解決しました。

**修正後の挙動：**
- 別の画面に移動してもコードが消えない
- リロードしても同じ問題の同じ進捗から再開できる
- 書きかけのコードもそのまま復元される

---

## どのデータを保存しているか

`localStorage` に 2 種類のデータを保存しています。

### 1. クイズセッション（`quiz-hub-session`）

```json
{
  "screen": "quiz",
  "quizType": "logic",
  "level": "junior",
  "currentIndex": 2,
  "correctCount": 1,
  "logicQIds": ["l-3", "l-7", "l-1", "..."],
  "methodQIds": []
}
```

- `currentIndex`: 今何問目か
- `correctCount`: 今何問正解しているか
- `logicQIds`: シャッフル済みの問題IDの並び順

### 2. エディタのコード（`quiz-hub-code-{問題ID}`）

```
quiz-hub-code-l-3 → "const prices = [1200, 3500];\n\nconst result = prices.filter..."
```

問題IDごとにキーを分けているので、複数の問題のコードを個別に保存できます。

---

## 実装の解説（App.tsx）

### セッションの保存

クイズ中（`screen === "quiz"`）は state が変わるたびに自動保存します。

```tsx
useEffect(() => {
  if (screen !== "quiz") return;
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      screen,
      quizType,
      level,
      currentIndex,
      correctCount,
      methodQIds: methodQs.map((q) => q.id),
      logicQIds: logicQs.map((q) => q.id),
    })
  );
}, [screen, quizType, level, currentIndex, correctCount, methodQs, logicQs]);
```

`useEffect` の依存配列に state を全部入れることで、
どれか 1 つでも変化したときに自動で保存されます。

### セッションの復元

`useState` の初期値を関数にして、起動時に一度だけ `localStorage` を読み込みます。

```tsx
const [screen, setScreen] = useState<Screen>(() => {
  const s = loadSession();
  return s?.screen === "quiz" ? "quiz" : "dashboard";
});

const [currentIndex, setCurrentIndex] = useState<number>(
  () => loadSession()?.currentIndex ?? 0
);
```

`() => ...` と関数を渡す書き方を **遅延初期化（lazy initialization）** といいます。
`useState(value)` と書くとレンダリングのたびに `value` が評価されますが、
`useState(() => value)` と書くと初回レンダリングのときだけ評価されます。
`localStorage` の読み込みは毎回やる必要がないので、この書き方が適切です。

### 問題の順番を復元する

シャッフルした問題の並び順を ID の配列として保存し、復元時に ID を元に問題データを引き当てます。

```tsx
// 保存: 問題オブジェクト全体ではなく ID だけを保存
logicQIds: logicQs.map((q) => q.id)  // ["l-3", "l-7", "l-1", ...]

// 復元: ID の順番通りに問題データを取り出す
const [logicQs, setLogicQs] = useState<LogicQuestion[]>(() => {
  const s = loadSession();
  if (s?.screen !== "quiz" || !s?.logicQIds) return [];
  return s.logicQIds
    .map((id: string) => logicQuestions.find((q) => q.id === id))
    .filter(Boolean) as LogicQuestion[];
});
```

問題データ全体（大きなオブジェクト）を保存するより、ID だけ保存してコードから引き当てる方が
`localStorage` の容量を節約できてシンプルです。

### セッションのクリア

以下のタイミングでセッションを削除します。

```tsx
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// 全問終了時
const handleNext = useCallback((isCorrect: boolean) => {
  if (nextIndex >= total) {
    clearSession();   // ← クリア画面に移る前に削除
    setScreen("clear");
  }
}, [...]);

// ダッシュボードへ戻るとき
const handleDashboard = useCallback(() => {
  clearSession();
  setScreen("dashboard");
}, []);

// もう一度挑戦するとき
const handleRetry = useCallback(() => {
  clearSession();    // ← 古いセッションを消してから再シャッフル
  handleSelectLevel(level);
}, [...]);
```

---

## 実装の解説（LogicQuizScreen.tsx）

### エディタコードの復元

問題が切り替わるたびに `localStorage` から保存済みのコードを読み込みます。
保存がなければ `starterCode`（初期コード）を使います。

```tsx
useEffect(() => {
  const saved = localStorage.getItem(`quiz-hub-code-${question.id}`);
  setCode(saved ?? question.starterCode);  // 保存あり → 復元 / なし → 初期コード
  setSubmitted(false);
  setActualOutput([]);
  setRunError(null);
  textareaRef.current?.focus();
}, [question.id, question.starterCode]);
```

`??` は **Null 合体演算子** です。左辺が `null` または `undefined` のときだけ右辺を使います。

### エディタコードの保存

テキストエリアの内容が変わるたびに `localStorage` に書き込みます。

```tsx
onChange={(e) => {
  setCode(e.target.value);
  localStorage.setItem(`quiz-hub-code-${question.id}`, e.target.value);
}}
```

キーを `quiz-hub-code-${question.id}` にすることで、問題ごとに独立して保存されます。
例えば `l-1` と `l-3` のコードは別々のキーで保存されるので、お互いに上書きしません。

---

## セッションのライフサイクルまとめ

```
レベル選択 → 問題開始
    ↓ localStorage に保存開始
問題を解く（コードを書く・別画面へ・リロード）
    ↓ 復元して同じ問題から再開
全問終了 または ダッシュボードへ戻る
    ↓ localStorage をクリア
```
