# スライドトグルスイッチの実装

## 何を作ったか

ダークモード切り替えボタンを、丸ボタンからスライドトグルスイッチに変更しました。

```
変更前：丸いボタンに絵文字（☀️ / 🌙）
変更後：スライドするトグルスイッチ（ライト：ピーチ色 / ダーク：黒）
```

---

## HTML 構造

```tsx
<button className={`${styles.themeToggle} ${isDark ? styles.darkMode : ""}`}>
  <svg className={styles.sunIcon} ... />   {/* 太陽アイコン（左側） */}
  <span className={styles.knob} />          {/* 白い丸（スライドする部分） */}
  <svg className={styles.moonIcon} ... />  {/* 月アイコン（右側） */}
</button>
```

### ポイント：クラスの動的切り替え

```tsx
className={`${styles.themeToggle} ${isDark ? styles.darkMode : ""}`}
```

`isDark` が `true` の時だけ `.darkMode` クラスが追加されます。
このクラスの有無でCSSのスタイルが切り替わります。

---

## CSS の仕組み

### トグル本体

```css
.themeToggle {
  position: relative;   /* 子要素を absolute で配置するための基準 */
  width: 46px;
  height: 24px;
  border-radius: 12px;  /* 横長の丸角 */
  background: #f0b89a;  /* ライト時：ピーチ色 */
}

.themeToggle.darkMode {
  background: #1e1e2e;  /* ダーク時：ダーク色 */
}
```

### ノブ（白い丸）のスライド

```css
.knob {
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  top: 3px;
  left: 25px;           /* ライト時：右側 */
  transition: left 0.25s ease;  /* スライドアニメーション */
}

.darkMode .knob {
  left: 3px;            /* ダーク時：左側 */
}
```

**`transition: left 0.25s ease`** がスライドアニメーションの正体です。
`left` の値が変わる時に0.25秒かけてなめらかに動きます。

### アイコンの配置

```css
.sunIcon {
  position: absolute;
  top: 50%;
  left: 6px;
  transform: translateY(-50%);  /* 縦中央揃え */
}

.moonIcon {
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
}
```

`position: absolute` で本体の左右に固定配置しています。

---

## アニメーションの仕組みまとめ

```
ライトモード時：
[☀️ ][    ●]  ← ノブが右（left: 25px）

ダークモード時：
[● ][    ☾]  ← ノブが左（left: 3px）

切り替え時：
transition: left 0.25s ease でなめらかにスライド
```

---

## サイズ調整のコツ

トグルが大きすぎるとヘッダー内で浮いて見えます。
ヘッダーの高さに対して **60〜70%** の高さが自然なバランスです。

```
ヘッダー高さ: 3.25rem（≒ 52px）
トグル高さ:   24px（約 46%）
```

---

## 関連リソース

- [MDN: position](https://developer.mozilla.org/ja/docs/Web/CSS/position)
- [MDN: transition](https://developer.mozilla.org/ja/docs/Web/CSS/transition)
