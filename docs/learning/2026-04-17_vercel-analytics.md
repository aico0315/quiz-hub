# Vercel Analytics の導入と設定

## Vercel Analytics とは？

自分のアプリに何人アクセスしたか、どのページが見られているかを確認できる無料のアクセス解析ツールです。Vercel にデプロイしているアプリであれば、少しのコードを追加するだけで使えます。

Google Analytics のように複雑な設定は不要で、Vercel のダッシュボード上でシンプルに確認できます。

---

## 導入手順

### 1. パッケージをインストールする

ターミナルでプロジェクトのフォルダに移動し、以下を実行します。

```bash
npm install @vercel/analytics
```

### 2. コードに追加する

使っているフレームワークによって書き方が異なります。

#### Next.js の場合（engineer-simulator）

`app/layout.tsx` に追加します。

```tsx
import { Analytics } from '@vercel/analytics/next'  // 追加

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />  {/* 追加 */}
      </body>
    </html>
  )
}
```

`<Analytics />` を `<body>` の中に置くだけで、全ページのアクセスが自動で計測されます。

#### Vite + React の場合（quiz-hub / quiz-hub-cozy）

`src/main.tsx` に追加します。

```tsx
import { inject } from '@vercel/analytics'  // 追加

inject()  // 追加（アプリ起動時に一度だけ呼ぶ）

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Next.js のようにコンポーネントを使う方法もありますが、Vite の場合は `inject()` を呼ぶ方法がシンプルです。

### 3. Vercel にデプロイする

コードを GitHub にプッシュすると、Vercel が自動でデプロイします。

### 4. Vercel ダッシュボードで Analytics を有効にする

1. [vercel.com](https://vercel.com) にログイン
2. 対象のプロジェクトを選択
3. 上部タブの **Analytics** をクリック
4. **Enable** ボタンを押す

---

## 「Get Started」画面について

Analytics タブを開くと最初は「Get Started」という画面が表示されます。

これは**まだデータが集まっていない初期状態**を示しているだけで、設定が間違っているわけではありません。

デプロイが完了してから誰かがサイトにアクセスすると、自動でデータの表示に切り替わります。自分でURLを開くだけでも反映されます。

---

## 自分のアクセスを除外する方法

Analytics を導入すると、自分がサイトを確認するたびにアクセスとしてカウントされてしまいます。「実際に他の人がどれだけ来ているか」を正確に把握したい場合は、自分のアクセスを除外する設定が必要です。

### Chrome 拡張「Block Analytics」を使う

1. Chrome ウェブストアで **「Block Analytics」** を検索してインストール
2. 拡張機能のアイコンをクリック
3. **Manage Blocked Sites** をクリック
4. 除外したいサイトのURLを追加して保存

設定後、そのサイトを開いた時に拡張機能が「blocked」状態になっていれば、自分のアクセスは Analytics に送られなくなります。

---

## まとめ

| やること | 方法 |
|---|---|
| パッケージ追加 | `npm install @vercel/analytics` |
| コード追加（Next.js） | `layout.tsx` に `<Analytics />` を追加 |
| コード追加（Vite） | `main.tsx` に `inject()` を追加 |
| Vercel 側の有効化 | ダッシュボードの Analytics タブから Enable |
| 自分を除外 | Chrome 拡張「Block Analytics」でURLを登録 |

- 「Get Started」画面はデータが集まれば自動で消える
- 自分のアクセスを除外したい場合はブラウザ拡張が手軽
