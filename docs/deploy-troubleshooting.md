# デプロイ トラブルシューティング

## Vercel でデプロイしたら画面が真っ白になった

### 症状

ブラウザのコンソールに以下のようなエラーが出て、画面が真っ白になる。

```
Failed to load resource: 404
index-DveFzTsi.css
index-BNFR9WxC.js
/quiz-hub/favicon.svg
```

---

### 原因

`vite.config.ts` に GitHub Pages 用の `base` 設定が残っていたためです。

```ts
// 問題のあった設定
export default defineConfig({
  plugins: [react()],
  base: "/quiz-hub/",  // ← これが原因
});
```

#### `base` とは何か

Vite の `base` はビルド後のアセット（JS・CSS・画像など）の **URL の起点** を指定するオプションです。

`base: "/quiz-hub/"` を設定すると、ビルド結果のすべてのパスが `/quiz-hub/` から始まります。

```html
<!-- base: "/quiz-hub/" のとき -->
<script src="/quiz-hub/assets/index-BNFR9WxC.js"></script>
<link  href="/quiz-hub/assets/index-DveFzTsi.css">
```

#### GitHub Pages では必要だった理由

GitHub Pages では URL が以下の形式になります。

```
https://ユーザー名.github.io/リポジトリ名/
```

例: `https://aico0315.github.io/quiz-hub/`

ルート（`/`）ではなく `/quiz-hub/` の下に置かれるため、`base: "/quiz-hub/"` が必要でした。

#### Vercel では不要な理由

Vercel ではデプロイ後の URL がルートになります。

```
https://quiz-hub-xxx.vercel.app/
```

この場合 `base` を `/quiz-hub/` にしたままだと、Vercel はルート（`/`）にファイルを置いているのに、
アプリは `/quiz-hub/assets/...` を探しに行くため **404 エラー** が発生します。

---

### 修正内容

`base` の指定を削除して、デフォルト（`/`）に戻しました。

```ts
// 修正後
export default defineConfig({
  plugins: [react()],
  // base を削除 → デフォルトの "/" が使われる
});
```

---

### まとめ

| デプロイ先 | `base` の設定 |
|-----------|--------------|
| GitHub Pages（リポジトリ名サブパス） | `base: "/リポジトリ名/"` が必要 |
| Vercel / Netlify / ルートドメイン | `base` の指定不要（削除する） |

**「どこにデプロイするか」によって `vite.config.ts` の設定が変わる** という点を覚えておきましょう。
