import type { Level, QuizType } from "../types";
import styles from "./LevelScreen.module.css";

interface Props {
  quizType: QuizType;
  onSelect: (level: Level) => void;
  onBack: () => void;
}

const typeLabels: Record<QuizType, string> = {
  method: "メソッド問題",
  webapi: "WEB API問題",
  logic: "ロジック組み立て問題",
};

const levels: { value: Level; label: string; description: string }[] = [
  { value: "junior", label: "Junior", description: "基本的な構文・メソッド・ロジック" },
  { value: "middle", label: "Middle", description: "応用・メソッドチェーン・非同期処理" },
];

export default function LevelScreen({ quizType, onSelect, onBack }: Props) {
  return (
    <div className={styles.container}>
      <button className={styles.back} onClick={onBack}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        ダッシュボードへ戻る
      </button>
      <h2 className={styles.title}>{typeLabels[quizType]}</h2>
      <p className={styles.subtitle}>レベルを選んでください</p>
      <div className={styles.levels}>
        {levels.map(({ value, label, description }) => (
          <button key={value} className={styles.levelButton} onClick={() => onSelect(value)}>
            <span className={styles.levelLabel}>{label}</span>
            <span className={styles.levelDesc}>{description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
