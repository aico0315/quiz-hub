# Vercel のデプロイメント保護設定

## 何をする設定なのか

Vercelにデプロイしたアプリに対して、**「誰がアクセスできるか」を制御する設定**です。

```
🔒  保護あり（デフォルト）
→ ログイン済みのチームメンバーだけがアクセス可能

🔓 保護なし
→ URLを知っていれば誰でもアクセス可能
```

---

## 2つのアクセス制御方法

| 設定 | 説明 | こんな場面で使う |
|------|------|-----------------|
| **Vercel Authentication** | ログインが必須 | 本番環境、プライベートプロジェクト |
| **Password Protection** | パスワードが必須 | パスワードで限定共有したい時 |

---

## ハッカソンの場合：「Vercel Authentication」を OFF にする

ハッカソンのような**短期イベント**では、URLを知っていれば誰でも見られる状態にするのが便利です。

### 設定手順

#### 1️⃣ Vercel ダッシュボードを開く

https://vercel.com/dashboard にアクセスしてログイン

#### 2️⃣ プロジェクトを選ぶ

左上で対象のプロジェクト（例：`engineer-simulator`）を選択

#### 3️⃣ 「Deployment Protection」タブをクリック

画面上部のタブから「**Deployment Protection**」を選択

```
[Project Settings] [Deployment Protection] ← ここ
```

#### 4️⃣ 「Vercel Authentication」を OFF にする

**設定画面：**

```
┌─────────────────────────────────────┐
│ Vercel Authentication              │
│ Ensures visitors to your            │
│ deployments are logged in...        │
│                                     │
│ [🔵 ON] Enabled for Standard        │ ← ここをクリック
│         Protection        ▼         │
└─────────────────────────────────────┘
```

**クリック後：**

```
┌─────────────────────────────────────┐
│ Vercel Authentication              │
│ Ensures visitors to your            │
│ deployments are logged in...        │
│                                     │
│ [⭕ OFF] Disabled                   │ ← OFF になった
└─────────────────────────────────────┘
```

#### 5️⃣ 「Save」ボタンをクリック

画面右下の「**Save**」ボタンで設定を保存

---

## 設定後の動作

### ✅ OFF（保護なし）の場合

```
あなた：URLをハッカソン会場で共有
　　　 「このURL にアクセスしてね」

ハッカソン参加者：
　　　 URL をそのままブラウザに貼り付け
　　　 ↓
　　　 ログインなしで即アプリが表示される ✅
```

### ❌ ON（保護あり）の場合

```
ハッカソン参加者：
　　　 URL をブラウザに貼り付け
　　　 ↓
　　　 ログイン画面が表示される ❌
　　　 （Vercel アカウントが必須）
```

---

## 注意事項

### ⚠️ セキュリティ的な注意

**OFF にしてもいい場面：**
- ✅ ハッカソンなど短期イベント
- ✅ 会場で信用できる人にだけ共有
- ✅ 機密情報を含まないデモアプリ

**ON にすべき場面：**
- ⛔ 本番環境（ユーザーが使うアプリ）
- ⛔ 機密情報を扱う場合
- ⛔ 長期的に公開するプロジェクト

---

## ハッカソン終了後：保護を戻す

ハッカソン終了後は、**セキュリティのため保護を戻す**ことをおすすめします。

### 戻す手順

同じ「Deployment Protection」ページで、「Vercel Authentication」を **ON** に戻すだけです。

```
[⭕ OFF] Disabled  →  [🔵 ON] Enabled for Standard Protection
                              ↓
                        「Save」をクリック
```

---

## Password Protection との違い

「Password Protection」もありますが、こちらは有料機能です。

```
Vercel Authentication  → 無料、Vercel ログイン必須
Password Protection    → 有料（$150/月）、パスワード入力で共有
```

ハッカソンなら、**Vercel Authentication を OFF にするだけで十分**です。

---

## 関連リソース

- [Vercel公式：Deployment Protection](https://vercel.com/docs/deployments/deployment-protection)
- [Vercel公式：Vercel Authentication](https://vercel.com/docs/deployments/deployment-protection/vercel-authentication)
