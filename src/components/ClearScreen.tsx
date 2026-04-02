import type { Level } from "../types";
import styles from "./ClearScreen.module.css";

interface Props {
  correctCount: number;
  totalCount: number;
  level: Level;
  onRetry: () => void;
  onMenu: () => void;
}

export default function ClearScreen({ correctCount, totalCount, level, onRetry, onMenu }: Props) {
  const percentage = Math.round((correctCount / totalCount) * 100);

  const getMessage = () => {
    if (percentage === 100) return "完璧！全問正解です！";
    if (percentage >= 80) return "素晴らしい！もう少しで完璧です";
    if (percentage >= 60) return "いい調子！もう一度挑戦してみよう";
    return "まだ伸びしろがあります。繰り返し練習しよう！";
  };

  return (
    <div className={styles.container}>
      <div className={styles.badge}>CLEAR</div>
      <h1 className={styles.message}>{getMessage()}</h1>
      <div className={styles.scoreBox}>
        <div className={styles.score}>
          <span className={styles.scoreNum}>{correctCount}</span>
          <span className={styles.scoreTotal}>/ {totalCount}</span>
        </div>
        <div className={styles.percentage}>{percentage}%</div>
      </div>
      <div className={styles.levelBadge}>{level.toUpperCase()} レベル</div>
      <div className={styles.actions}>
        <button className={styles.retryButton} onClick={onRetry}>もう一度挑戦</button>
        <button className={styles.menuButton} onClick={onMenu}>ダッシュボードへ戻る</button>
      </div>
    </div>
  );
}
