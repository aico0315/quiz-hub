# GitHub Actions のデプロイ失敗：npm ci と npm install の違い

## 何が起きていたか

Vercel Analytics を追加してプッシュしたところ、GitHub から「Deploy to GitHub Pages: All jobs have failed」というメールが届きました。

GitHub Actions（自動デプロイの仕組み）が途中でエラーになり、GitHub Pages へのデプロイが止まってしまった状態です。

---

## エラーの内容

GitHub Actions のログにはこう書かれていました。

```
npm error `npm ci` can only install packages when your package.json and
package-lock.json are in sync.

npm error Missing: @emnapi/core@1.10.0 from lock file
npm error Missing: @emnapi/runtime@1.10.0 from lock file
```

日本語にすると：

> 「`package.json` と `package-lock.json` の内容が一致していません。足りないパッケージがあります。」

---

## 原因：OSによってインストールされるパッケージが違う

### package-lock.json とは？

`npm install` を実行すると、インストールしたパッケージの正確なバージョン情報が `package-lock.json` というファイルに記録されます。

このファイルがあることで、「どの環境でも同じバージョンのパッケージをインストールできる」ことが保証されます。

### なぜズレが起きたのか

一部のパッケージは **OS（オペレーティングシステム）ごとに別々のファイル**を使います。

- macOS でインストール → macOS 用のファイルが lock ファイルに記録される
- Ubuntu（Linux）でインストール → Ubuntu 用のファイルが必要

今回のケース：
- **ローカル（macOS）** で `npm install @vercel/analytics` を実行
- `package-lock.json` には macOS 用の情報だけ記録された
- **GitHub Actions（Ubuntu）** が同じ lock ファイルを使おうとしたら、Linux 用のパッケージが見つからずエラーに

---

## npm ci と npm install の違い

| コマンド | 特徴 |
|---|---|
| `npm ci` | lock ファイルと完全一致していないとエラー。**厳格モード** |
| `npm install` | lock ファイルと差異があっても柔軟に対応。**柔軟モード** |

`npm ci` は「本番環境で使うための厳格なインストール」として推奨されていますが、OS をまたぐ場合にこのようなズレが起きることがあります。

---

## 修正方法：ワークフローの npm ci を npm install に変更

GitHub Actions の設定ファイル（`.github/workflows/deploy.yml`）を修正しました。

### 修正前

```yaml
- run: npm ci
```

### 修正後

```yaml
- run: npm install
```

たった1行の変更ですが、これで Ubuntu 環境でも柔軟にパッケージをインストールできるようになり、デプロイが成功するようになりました。

---

## GitHub Actions とは？

補足として、GitHub Actions について簡単に説明します。

GitHub Actions は「コードを GitHub にプッシュしたとき、自動で何かの処理を実行する」仕組みです。

このプロジェクトでは、`main` ブランチにプッシュするたびに：

1. Ubuntu の仮想マシンが起動する
2. コードを取得する（`checkout`）
3. Node.js をセットアップする
4. パッケージをインストールする（`npm install`）
5. ビルドする（`npm run build`）
6. GitHub Pages にデプロイする

という流れが自動で行われています。設定は `.github/workflows/deploy.yml` に書かれています。

---

## まとめ

- `package-lock.json` はOSごとに内容が変わることがある
- `npm ci` は lock ファイルと完全一致が必要 → OS をまたぐと失敗することがある
- `npm install` は柔軟に対応してくれる → GitHub Actions との相性が良い
- エラーはログを読めば原因が特定できる（GitHub の Actions タブから確認できる）
