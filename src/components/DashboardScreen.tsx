import type { QuizType } from "../types";
import styles from "./DashboardScreen.module.css";

interface Props {
  onSelect: (type: QuizType) => void;
}

const quizTypes: { type: QuizType; icon: string; title: string; description: string }[] = [
  {
    type: "method",
    icon: "[ ]",
    title: "メソッド問題",
    description: "配列・文字列・Objectの基本メソッドをテキストで答える",
  },
  {
    type: "webapi",
    icon: "</>",
    title: "WEB API問題",
    description: "localStorage・fetch・addEventListener などブラウザAPIをテキストで答える",
  },
  {
    type: "logic",
    icon: "▶",
    title: "ロジック組み立て問題",
    description: "日本語のシナリオをコードで実装し、実行して正解を確認する",
  },
];

export default function DashboardScreen({ onSelect }: Props) {
  return (
    <div className={styles.container}>
      <p className={styles.subtitle}>問題タイプを選んでください</p>
      <div className={styles.cards}>
        {quizTypes.map(({ type, icon, title, description }) => (
          <button key={type} className={styles.card} onClick={() => onSelect(type)}>
            <span className={styles.icon}>{icon}</span>
            <span className={styles.cardTitle}>{title}</span>
            <span className={styles.cardDesc}>{description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
