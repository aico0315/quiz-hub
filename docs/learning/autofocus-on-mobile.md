# モバイルでのオートフォーカス制御

## 問題：スマホで問題文が見えなくなる

次の問題へ移った瞬間、入力欄に自動でフォーカスが当たることで**スマホのキーボードが起動**します。
その結果、問題文を読む前に画面が入力欄まで自動スクロールしてしまい、毎回上に戻す手間が生まれていました。

```
❌ 問題のある動作（スマホ）
問題が切り替わる
　↓
入力欄にフォーカス → キーボードが起動
　↓
画面が入力欄まで自動スクロール
　↓
問題文を読むために手動で上にスクロールする必要がある
```

---

## 解決方法：タッチデバイスを検知してフォーカスをスキップ

### `window.matchMedia("(pointer: coarse)")` とは

ポインターデバイスの種類を検知するCSSメディアクエリです。

| 値 | デバイス | 例 |
|---|---------|---|
| `pointer: fine` | 精密なポインター | マウス（PC） |
| `pointer: coarse` | 大まかなポインター | 指（スマホ・タブレット） |

スマホやタブレットは指でタップするため `pointer: coarse` が `true` になります。

---

## 実装

```ts
const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
if (!isTouchDevice) textareaRef.current?.focus();
```

`!isTouchDevice`（タッチデバイスでない場合）のみフォーカスするようにしています。

### 変更前

```ts
useEffect(() => {
  const saved = localStorage.getItem(`quiz-hub-code-${question.id}`);
  setCode(saved ?? question.starterCode);
  setSubmitted(false);
  setActualOutput([]);
  setRunError(null);
  textareaRef.current?.focus();  // 常にフォーカス
}, [question.id, question.starterCode]);
```

### 変更後

```ts
useEffect(() => {
  const saved = localStorage.getItem(`quiz-hub-code-${question.id}`);
  setCode(saved ?? question.starterCode);
  setSubmitted(false);
  setActualOutput([]);
  setRunError(null);
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
  if (!isTouchDevice) textareaRef.current?.focus();  // PCのみフォーカス
}, [question.id, question.starterCode]);
```

---

## 修正対象と理由

| 画面 | 修正 | 理由 |
|------|------|------|
| **LogicQuizScreen** | ✅ フォーカスをスキップ | コードを書く前に問題文を読む必要がある |
| **MethodQuizScreen** | 変更なし | テキスト入力なので即フォーカスが快適 |
| **WebApiQuizScreen** | 変更なし | テキスト入力なので即フォーカスが快適 |

ロジック問題はコードエディタに問題文を読んでから書き始めるため、スマホでのオートフォーカスが特に邪魔になっていました。

---

## 動作結果

```
✅ 修正後の動作

PC：今まで通り、問題が切り替わるとエディタに自動フォーカス
スマホ：フォーカスされず、問題文を上から読める
```

---

## 関連リソース

- [MDN: Window.matchMedia()](https://developer.mozilla.org/ja/docs/Web/API/Window/matchMedia)
- [MDN: pointer メディア特性](https://developer.mozilla.org/ja/docs/Web/CSS/@media/pointer)
