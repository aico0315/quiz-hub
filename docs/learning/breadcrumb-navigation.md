# パンくずリストの実装

## 何をしたのか

クイズ画面に「今どの問題タイプ・どのレベルをやっているか」を表示するパンくずリストを追加しました。

```
← レベル選択へ戻る        DOM操作

メソッド問題 › Junior     ← これを追加

1 / 10
━━━━━━━━━━━
```

---

## パンくずリストとは？

**パンくずリスト（Breadcrumb）** とは、今自分がどこにいるかを示すナビゲーションの一種です。

```
例：ECサイトのパンくず
ホーム › メンズ › トップス › Tシャツ
```

quiz-hubでは画面遷移の履歴ではなく、「問題タイプ ›レベル」という現在地の情報を表示しています。

---

## 実装方法

### 1. ラベルの定義

QuizType と Level という型を日本語表示に変換するマッピングを用意しました。

```ts
const QUIZ_TYPE_LABEL: Record<QuizType, string> = {
  method: "メソッド問題",
  webapi: "WEB API問題",
  logic: "ロジック問題",
};

const LEVEL_LABEL: Record<Level, string> = {
  junior: "Junior",
  middle: "Middle",
};
```

`Record<QuizType, string>` は「QuizTypeの全キーに対してstringの値を持つオブジェクト」という型です。
これでキーの入力ミスをTypeScriptが検出してくれます。

### 2. Propsに追加

コンポーネントに `quizType` と `level` を受け取れるよう Props を追加しました。

```ts
interface Props {
  question: MethodQuestion;
  questionNumber: number;
  totalQuestions: number;
  quizType: QuizType;  // ← 追加
  level: Level;        // ← 追加
  onNext: (isCorrect: boolean) => void;
  onMenu: () => void;
}
```

### 3. JSXで表示

```tsx
<div className={styles.breadcrumb}>
  <span>{QUIZ_TYPE_LABEL[quizType]}</span>
  <span className={styles.breadcrumbSep}>›</span>
  <span>{LEVEL_LABEL[level]}</span>
</div>
```

`›` は「›」という HTMLエンティティで、矢印のような区切り文字です。

### 4. 親コンポーネントから値を渡す

App.tsx で quizType と level を Props として渡すようにしました。

```tsx
<MethodQuizScreen
  question={methodQs[currentIndex]}
  questionNumber={currentIndex + 1}
  totalQuestions={methodQs.length}
  quizType={quizType}   // ← 追加
  level={level}         // ← 追加
  onNext={handleNext}
  onMenu={handleBackToLevel}
/>
```

---

## CSS

```css
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 500;
  margin-top: -0.75rem;  /* ヘッダーとの余白を詰める */
}

.breadcrumbSep {
  color: var(--text-very-muted);  /* 区切り文字は少し薄く */
}
```

`margin-top: -0.75rem` でコンテナの `gap` による余白を打ち消し、ヘッダーとの距離を自然なバランスに調整しています。

---

## ポイント：情報の流れ

このように親から子へ情報を渡す流れが React の基本です。

```
App.tsx（state を持つ親）
  ↓ quizType, level を props で渡す
MethodQuizScreen.tsx（受け取って表示する子）
```

App.tsx がどの問題タイプ・レベルを選んでいるかを知っているので、
その情報を子コンポーネントに渡すだけで表示できます。

---

## 関連ファイル

- [src/App.tsx](../../src/App.tsx) — quizType・level を Props として渡す
- [src/components/MethodQuizScreen.tsx](../../src/components/MethodQuizScreen.tsx) — メソッド・WEB API問題のパンくず
- [src/components/LogicQuizScreen.tsx](../../src/components/LogicQuizScreen.tsx) — ロジック問題のパンくず
