# セキュリティの基本：アプリを安全に公開するために

## はじめに

アプリが「動く」ことと「安全に公開できる」ことは別物です。
特に外部に公開するアプリでは、最低限のセキュリティを押さえておく必要があります。

---

## 1. 環境変数の管理（APIキーの流出を防ぐ）

### 環境変数とは？

APIキーなどの「秘密の情報」を、コードに直接書かずに管理する仕組みです。

```
❌ 悪い例：コードに直接書く
const apiKey = "sk-abc123..."  // GitHubに上がると丸見え！

✅ 良い例：環境変数を使う
const apiKey = process.env.ANTHROPIC_API_KEY  // 値はコードに含まれない
```

### NEXT_PUBLIC_ の罠

Next.jsでは `NEXT_PUBLIC_` というプレフィックスをつけた環境変数は**ブラウザに公開**されます。

```
✅ 公開してOK
NEXT_PUBLIC_SUPABASE_URL        → Supabaseの公開URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   → 匿名キー（RLSで保護されている）

❌ 絶対に公開してはいけない
SUPABASE_SERVICE_ROLE_KEY       → RLSを無視して全データにアクセスできる管理者キー
ANTHROPIC_API_KEY               → Claude APIキー（課金が発生する）
```

LLMのAPIキー（Claude、OpenAIなど）をフロントエンドに公開すると、
第三者があなたのアカウントで無制限にAPIを呼び出せてしまい、
**高額な請求が発生するリスク**があります。

### AIのAPI呼び出しはサーバー側で行う

```ts
// ❌ NG：クライアントから直接呼ぶ
const res = await fetch("https://api.anthropic.com/...", {
  headers: { "x-api-key": process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY } // 公開されてしまう！
})

// ✅ OK：Route Handler（サーバー側）経由で呼ぶ
// app/api/chat/route.ts
export async function POST(request: Request) {
  const res = await fetch("https://api.anthropic.com/...", {
    headers: { "x-api-key": process.env.ANTHROPIC_API_KEY } // サーバー側のみ
  })
}
```

### .env.local をGitにコミットしない

`.gitignore` に `.env*` が含まれているか確認しましょう。

```bash
# 過去にコミットされていないか確認
git log --all --full-history -- .env.local
# 何も表示されなければOK
```

---

## 2. RLS（Row Level Security）

### RLSとは？

Supabaseのデータベースに「誰がどのデータにアクセスできるか」を制御するルールです。

### RLSが無効だとどうなるか

Supabaseの `anon key`（匿名キー）は公開される前提のキーです。
**RLSが無効だと、誰でも全データを読み書きできてしまいます。**

```ts
// ブラウザの開発者ツールで誰でも実行できてしまう
const { data } = await supabase
  .from('users')
  .select('*')  // 全ユーザーのデータが取得できてしまう！
```

### RLSの設定例

```sql
-- RLSを有効にする
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 自分のデータだけ読める
CREATE POLICY "自分のtodoだけ読める" ON todos
  FOR SELECT
  USING (auth.uid() = user_id);
```

`auth.uid()` はログイン中のユーザーのIDを返す関数です。
これで「自分のデータだけ」に制限できます。

---

## 3. 認証まわりの注意点

### getUser() と getSession() の違い

サーバー側でユーザー情報を取得するときは、必ず `getUser()` を使います。

| メソッド | 動作 | 使うべきか |
|---|---|---|
| `getUser()` | Supabaseサーバーにリクエストを送り、トークンを検証する | ✅ 推奨 |
| `getSession()` | CookieのJWTを読み取るだけ（検証なし） | ❌ 認証に使わない |

```ts
// ✅ OK
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')

// ❌ NG：トークンが改ざんされている可能性がある
const { data: { session } } = await supabase.auth.getSession()
```

### Middlewareだけに頼らない

MiddlewareはUXのための便利な機能であり、セキュリティの保証ではありません。
**Route Handlers や Server Actions の中でも必ず認証チェックを行いましょう。**

---

## 4. 「認証」と「認可」は別物

よくある勘違いが「ログインチェックをしているから安全」というものです。

- **認証**：この人はログインしているか？
- **認可**：この人はこのデータにアクセスしてよいか？

認証を通過しただけでは、**他のユーザーのデータを見る権限があるわけではありません。**

```ts
// ❌ NG：user_idの条件がない（他人のデータも取得できる）
const { data } = await supabase
  .from('todos')
  .select('*')
  .eq('id', todoId)

// ✅ OK：user_idも条件に含める
const { data } = await supabase
  .from('todos')
  .select('*')
  .eq('id', todoId)
  .eq('user_id', user.id)  // 自分のデータだけに制限
```

---

## 5. quiz-hub のセキュリティチェック結果

quiz-hubは React + Vite の純粋なフロントエンドアプリのため、
バックエンドやAPIキーが存在しません。

| チェック項目 | 状態 |
|---|---|
| APIキーの流出 | ✅ APIキー自体が存在しない |
| RLS設定 | ✅ Supabaseを使っていないので不要 |
| 環境変数の漏洩 | ✅ .env ファイルなし |
| コード実行の安全性 | ✅ iframeのsandboxで隔離済み |

---

## 6. 2FA（二段階認証）とは

### 2FAとは？

ログインの時に「パスワード」だけでなく、**もう1つの確認**を求める仕組みです。

```
通常のログイン：
パスワード → ログイン完了

2FA有効時：
パスワード → 6桁の数字を入力 → ログイン完了
```

パスワードが漏れても、**スマホがないとログインできない**ので安全です。

### なぜ必要？

Supabaseのダッシュボードにログインできれば、データベースを直接操作できます。
第三者にログインされると、ユーザーデータの流出・削除などの被害が起こりえます。

### 使うアプリ

**Google Authenticator** や **Microsoft Authenticator** などの認証アプリを使います。

### 6桁の数字が変わり続ける理由

**TOTP（時間ベースのワンタイムパスワード）** という仕組みで、30秒ごとに新しい数字が生成されます。

```
毎回違う数字 → 盗み見されても使えない → 安全！
```

ネット接続がなくても使えます（時刻を元に計算しているため）。

### スマホを変える時の注意

認証アプリを消したり、スマホを変える時は**事前に移行作業が必要**です。
そのまま消してしまうとログインできなくなるので注意してください。

---

## セキュリティチェックリスト

アプリを公開する前に確認しましょう。

- [ ] APIキーに `NEXT_PUBLIC_` がついていない
- [ ] `.env.local` が `.gitignore` に含まれている
- [ ] `.env.local` がGitの履歴にコミットされていない
- [ ] 全テーブルでRLSが有効になっている
- [ ] 各テーブルにRLSポリシーが設定されている
- [ ] Route HandlerでAPIキーを使っている（クライアントからではなく）
- [ ] サーバー側の処理で `getUser()` を使っている（`getSession()` ではなく）
- [ ] データ取得・更新・削除に `user_id` の条件が含まれている
- [ ] Supabaseダッシュボードに2FAを設定している
- [ ] Next.jsを最新のセキュリティパッチ適用済みバージョンにしている
