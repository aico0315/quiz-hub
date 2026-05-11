# ダークモードをデバイス設定に合わせる：useEffectとイベントハンドラの役割分担

## 何が起きていたか

アプリを開くと、デバイスがダークモードになっているのに、アプリは常にライトモードで起動してしまう問題がありました。

コードを見ると、「`localStorage`（ブラウザの保存領域）に設定が残っていればそれを優先し、なければデバイス設定に従う」という意図で書かれていました。しかし実際には、**アプリを起動するたびにデバイス設定が `localStorage` に上書き保存されていた**ため、手動でトグルしなくても設定が固定されてしまっていました。

---

## 原因：useEffect が「起動のたびに」実行される

### useEffect とは？

`useEffect` は、「画面が描画されたあとに自動で実行される処理」を書く場所です。

```js
useEffect(() => {
  // ここに書いた処理が、isDark が変わるたびに自動で実行される
}, [isDark]);
```

`[isDark]` の部分は「`isDark` が変わったときだけ実行してね」という指定です。

### 問題のコード

```js
useEffect(() => {
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  localStorage.setItem("theme", isDark ? "dark" : "light"); // ← これが問題
}, [isDark]);
```

アプリが起動したとき、`isDark` の初期値がセットされる → `isDark` が「変わった」とみなされる → `useEffect` が実行される → `localStorage` に保存される、という流れが毎回起きていました。

その結果、以下のような状況になっていました。

```
1回目の起動（localStorage に何もない）
  → デバイス設定: ダーク
  → isDark = true（正しい）
  → useEffect が動く → localStorage に "dark" を保存

ユーザーがトグルでライトに切り替える
  → localStorage に "light" を保存

2回目の起動
  → localStorage に "light" が残っている
  → isDark = false（デバイス設定を無視してライトで起動）← 問題はここ
```

---

## 修正：保存するタイミングを「トグルを押したとき」だけにする

### 修正前

```js
// useEffect の中で常に保存していた
useEffect(() => {
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  localStorage.setItem("theme", isDark ? "dark" : "light"); // 毎回保存されてしまう
}, [isDark]);

// トグルボタン
onClick={() => setIsDark((d) => !d)}
```

### 修正後

```js
// useEffect からは localStorage の保存を削除
useEffect(() => {
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
}, [isDark]);

// トグルボタンを押したときだけ保存する
onClick={() => setIsDark((d) => {
  const next = !d;
  localStorage.setItem("theme", next ? "dark" : "light"); // 手動操作のときだけ保存
  return next;
})}
```

---

## なぜこれで直るのか

**「自動的に動く処理（useEffect）」と「ユーザーの操作（クリック）」を分けた**ことがポイントです。

| タイミング | 修正前 | 修正後 |
|---|---|---|
| アプリ起動時 | useEffect が動いて localStorage に保存 | 保存しない |
| トグルを押したとき | useEffect 経由で保存 | クリック処理の中で直接保存 |

起動時は保存しないので、次回起動したときに `localStorage` が空のまま → デバイス設定を読みに行く、という正しい流れになります。

一度でもトグルを押せば localStorage に保存されるので、「あえてライトで使いたい」というユーザーの手動設定もちゃんと記憶されます。

---

## まとめ

- `useEffect` は「状態が変わったら自動で動く」ので、「ユーザーが操作したときだけ動かしたい処理」には向かない
- ユーザーの操作をきっかけにしたい処理は、`onClick` などのイベントハンドラに書く
- **「いつ・誰が・何をしたときに保存するか」を意識して処理を書く場所を選ぶ**ことが大切
