# デバイス連動ダークモード・フォント読み込み・影の調整

## 何を変えたか

| ファイル | 変更内容 |
|---|---|
| `src/App.tsx` | 初回アクセス時にデバイスのダークモード設定に自動で従うよう変更 |
| `index.html` | Google Fonts（EB Garamond）を読み込み |
| `src/App.module.css` | ロゴにGaramondフォントを適用・サイズ調整・ヘッダーの影を強化 |
| `src/components/DashboardScreen.tsx` | ヘッダーと重複していたタイトルを削除 |
| `src/components/DashboardScreen.module.css` | カードの影の透明度を上げて視認性を改善 |

---

## 1. デバイスのダークモード設定を検知する

### prefers-color-scheme とは

ユーザーのOS・デバイスがダークモードに設定されているかを、ブラウザが教えてくれる仕組み。

### JavaScript での使い方

```js
window.matchMedia('(prefers-color-scheme: dark)').matches
// デバイスがダークモードなら true、ライトモードなら false
```

### 実装のポイント：「手動設定を優先しつつ、未設定ならデバイスに従う」

```js
const [isDark, setIsDark] = useState(() => {
  const saved = localStorage.getItem('theme');
  if (saved) return saved === 'dark'; // 手動で設定済みならそれを優先
  return window.matchMedia('(prefers-color-scheme: dark)').matches; // 未設定ならデバイス設定に従う
});
```

**処理の流れ：**
1. まず localStorage に保存された設定があるか確認する
2. あればそれを使う（ユーザーが手動で変えた設定を尊重）
3. なければデバイスの設定に従う（初回アクセス時など）

**なぜこの順番にするか：**
デバイス設定だけを見ると「手動で切り替えてもリロードで元に戻る」という問題が起きる。localStorage を優先することで、手動切り替えも維持できる。

---

## 2. Google Fonts の読み込み方

### なぜ index.html に書くのか

Google Fonts はCSSではなく HTML の `<head>` に書くのが基本。ページを読み込む一番早いタイミングでフォントの取得を開始できるため、フォントが遅れて適用される「ちらつき」を防げる。

### 書き方

```html
<head>
  <!-- フォント配信サーバーへの事前接続（読み込みを速くするための準備） -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

  <!-- フォント本体の読み込み -->
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@600&display=swap" rel="stylesheet" />
</head>
```

**各行の意味：**
- `preconnect` → 「このサーバーと後で通信するよ」とブラウザに事前に伝えて準備させる（プリコネクト）
- `crossorigin` → 別ドメインのリソースを安全に取得するための属性
- `display=swap` → フォントが読み込まれる前はシステムフォントで表示して、読み込み完了後に切り替える（ちらつきを最小限に抑える）

### CSSでの適用方法

```css
.logo {
  font-family: 'EB Garamond', Georgia, serif;
  /* ↑ 優先順位: Garamond → 読み込めなければ Georgia → それもなければ serif系フォント */
}
```

フォント名をカンマで並べておくと、万が一読み込みに失敗しても見た目が崩れにくい（フォールバック）。

---

## 3. 影（box-shadow）の視認性調整

### box-shadow の基本構造

```css
box-shadow: 0 2px 12px rgba(100, 60, 20, 0.06);
/*          ↑  ↑   ↑    ↑               ↑
         X方向 Y方向 ぼかし 色（RGB）      透明度（0〜1）*/
```

### 色によって透明度の効き方が違う

黒（`rgba(0,0,0,...)`）の影は少ない透明度でもはっきり見えるが、ブラウン系（`rgba(100,60,20,...)`）は色が薄いため同じ透明度では目立ちにくい。

```css
/* 黒系: 0.07 でも十分見える */
box-shadow: 0 1px 8px rgba(0, 0, 0, 0.07);

/* ブラウン系: 同じ 0.07 では薄すぎる → 0.13 程度に上げる */
box-shadow: 0 1px 12px rgba(100, 60, 20, 0.13);
```

**調整のコツ：** 影が見えにくいと感じたら、まず透明度（最後の数値）を2倍にして確認する。

---

## 4. 重複コンテンツの削除

ヘッダーに「Quiz Hub」が表示されているのに、ダッシュボードの本文にも大きく「Quiz Hub」と表示されていた。

- 同じ情報が2箇所に出ると冗長になる
- モバイルでは縦幅が限られるため、不要な要素は省いた方がすっきりする

```tsx
// 削除したコード
<h1 className={styles.title}>Quiz Hub</h1>

// 残したコード（役割が違うので残す）
<p className={styles.subtitle}>問題タイプを選んでください</p>
```

---

## 5. 学習まとめ

| 技術 | 使いどころ |
|---|---|
| `prefers-color-scheme` | デバイスのダークモード設定に自動で従いたいとき |
| `localStorage` との組み合わせ | 「デフォルトはデバイス設定・手動変更も保持」を両立させたいとき |
| Google Fonts の `preconnect` | フォント読み込みを速くしてちらつきを防ぎたいとき |
| フォントのフォールバック | 読み込み失敗時も見た目が崩れないようにしたいとき |
| 影の透明度調整 | ブラウン・ベージュ系の色で影が見えにくいとき |
