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

以下のタイミングでセッションとエディタコードをまとめて削除します。

```tsx
function clearSession() {
  // セッション本体を削除
  localStorage.removeItem(SESSION_KEY);
  // 保存済みのエディタコードを全て削除
  Object.keys(localStorage)
    .filter((key) => key.startsWith("quiz-hub-code-"))
    .forEach((key) => localStorage.removeItem(key));
}
```

`Object.keys(localStorage)` で localStorage に保存されている全キーを配列で取得し、
`quiz-hub-code-` で始まるものだけを絞り込んでまとめて削除しています。

クリアのタイミングは以下の4つです：

```tsx
// 1. レベル選択でセッション開始するとき（古いコードをリセット）
const handleSelectLevel = useCallback((selectedLevel: Level) => {
  clearSession();
  // ... 問題のシャッフルなど
}, []);

// 2. 全問終了時
const handleNext = useCallback((isCorrect: boolean) => {
  if (nextIndex >= total) {
    clearSession();
    setScreen("clear");
  }
}, [...]);

// 3. ダッシュボードへ戻るとき
const handleDashboard = useCallback(() => {
  clearSession();
  setScreen("dashboard");
}, []);

// 4. もう一度挑戦するとき
const handleRetry = useCallback(() => {
  clearSession();
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
レベル選択
    ↓ 古いセッション・コードをクリア → 新しいセッション開始
問題を解く（コードを書く）
    ↓ localStorage に自動保存
途中でメールなど別アプリへ → 戻る
    ↓ 同じ問題・書きかけのコードを復元
全問終了 / ダッシュボードへ戻る / もう一度挑戦
    ↓ localStorage をクリア
```

## なぜ「セッション開始時」にもクリアが必要だったか

最初の実装ではセッション終了時（全問終了・ダッシュボードへ戻る・もう一度挑戦）にしかクリアしていませんでした。

しかし、過去に途中で終了したセッションのコードが `localStorage` に残り続けるため、
**新しく問題を始めたのに以前書きかけたコードが出てきてしまう**という問題が発生しました。

レベル選択のタイミング（= 新しいセッションの開始）でもクリアすることで、
常にまっさらな状態から始められるようになりました。
