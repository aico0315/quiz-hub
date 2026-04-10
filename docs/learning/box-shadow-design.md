# box-shadow で奥行き感を出す

## なぜ shadow を使うのか

枠やボタンに影をつけることで、要素が「浮いている」ような奥行き感が生まれ、UIの完成度が上がります。

```
❌ shadow なし → 平面的でのっぺりした印象
✅ shadow あり → 立体感があり、触れそうな感じ
```

---

## box-shadow の書き方

```css
box-shadow: X軸 Y軸 ぼかし 広がり 色;
```

| 値 | 説明 |
|---|------|
| X軸 | 横方向のズレ（正=右、負=左） |
| Y軸 | 縦方向のズレ（正=下、負=上） |
| ぼかし | 大きいほどふわっとした影 |
| 広がり | 省略可。影のサイズ調整 |
| 色 | `rgba()` で透明度を指定するのが一般的 |

---

## quiz-hub で使った3種類の shadow

### 1️⃣ カード・ボックス系（通常時）

```css
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
```

- 真下に薄く落ちる影
- 主張しすぎない自然な浮き感

### 2️⃣ ホバー時（カード）

```css
box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
transform: translateY(-2px);
```

- 影を強くしながら上に少し動く
- アクセントカラー（パープル）の影でブランドカラーを活かす
- `transform` と組み合わせると「浮き上がる」演出になる

### 3️⃣ アクセントボタン

```css
box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
```

- ボタンと同じ色系の影をつける
- 「カラーシャドウ」と呼ばれる手法
- ボタンの存在感が増す

---

## ダークモードでの注意点

ダークモードでは背景が暗いため、黒い影は見えにくくなります。

```css
/* ライトモード */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);  /* 薄くてOK */

/* ダークモード */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);   /* 少し濃くする */
```

---

## transition と組み合わせる

shadow に transition を設定すると、ホバー時になめらかに変化します。

```css
.card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.15s, transform 0.15s;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
  transform: translateY(-2px);
}
```

---

## 関連リソース

- [MDN: box-shadow](https://developer.mozilla.org/ja/docs/Web/CSS/box-shadow)
- [MDN: transform](https://developer.mozilla.org/ja/docs/Web/CSS/transform)
