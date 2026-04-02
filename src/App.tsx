import { useState, useCallback, useEffect } from "react";
import type { Level, QuizType, Screen, MethodQuestion, LogicQuestion } from "./types";
import { methodQuestions } from "./data/methodQuestions";
import { webApiQuestions } from "./data/webApiQuestions";
import { logicQuestions } from "./data/logicQuestions";
import DashboardScreen from "./components/DashboardScreen";
import LevelScreen from "./components/LevelScreen";
import MethodQuizScreen from "./components/MethodQuizScreen";
import LogicQuizScreen from "./components/LogicQuizScreen";
import ClearScreen from "./components/ClearScreen";
import styles from "./App.module.css";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [quizType, setQuizType] = useState<QuizType>("method");
  const [level, setLevel] = useState<Level>("junior");
  const [methodQs, setMethodQs] = useState<MethodQuestion[]>([]);
  const [logicQs, setLogicQs] = useState<LogicQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const handleSelectType = useCallback((type: QuizType) => {
    setQuizType(type);
    setScreen("level");
  }, []);

  const handleSelectLevel = useCallback((selectedLevel: Level) => {
    setLevel(selectedLevel);
    setCurrentIndex(0);
    setCorrectCount(0);
    if (quizType === "logic") {
      setLogicQs(shuffle(logicQuestions.filter((q) => q.level === selectedLevel)));
    } else {
      const pool = quizType === "method" ? methodQuestions : webApiQuestions;
      setMethodQs(shuffle(pool.filter((q) => q.level === selectedLevel)));
    }
    setScreen("quiz");
  }, [quizType]);

  const handleNext = useCallback((isCorrect: boolean) => {
    const nextCorrect = isCorrect ? correctCount + 1 : correctCount;
    const total = quizType === "logic" ? logicQs.length : methodQs.length;
    const nextIndex = currentIndex + 1;
    if (nextIndex >= total) {
      setCorrectCount(nextCorrect);
      setScreen("clear");
    } else {
      setCorrectCount(nextCorrect);
      setCurrentIndex(nextIndex);
    }
  }, [correctCount, currentIndex, quizType, logicQs.length, methodQs.length]);

  const handleRetry = useCallback(() => {
    handleSelectLevel(level);
  }, [handleSelectLevel, level]);

  const handleDashboard = useCallback(() => setScreen("dashboard"), []);
  const handleBackToLevel = useCallback(() => setScreen("level"), []);

  const totalCount = quizType === "logic" ? logicQs.length : methodQs.length;

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <button className={styles.logo} onClick={handleDashboard}>
          Quiz Hub
        </button>
        <button
          className={styles.themeToggle}
          onClick={() => setIsDark((d) => !d)}
          aria-label={isDark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </header>
      <main className={styles.main}>
        {screen === "dashboard" && (
          <DashboardScreen onSelect={handleSelectType} />
        )}
        {screen === "level" && (
          <LevelScreen quizType={quizType} onSelect={handleSelectLevel} onBack={handleDashboard} />
        )}
        {screen === "quiz" && quizType !== "logic" && methodQs.length > 0 && (
          <MethodQuizScreen
            question={methodQs[currentIndex]}
            questionNumber={currentIndex + 1}
            totalQuestions={methodQs.length}
            onNext={handleNext}
            onMenu={handleBackToLevel}
          />
        )}
        {screen === "quiz" && quizType === "logic" && logicQs.length > 0 && (
          <LogicQuizScreen
            question={logicQs[currentIndex]}
            questionNumber={currentIndex + 1}
            totalQuestions={logicQs.length}
            onNext={handleNext}
            onMenu={handleBackToLevel}
          />
        )}
        {screen === "clear" && (
          <ClearScreen
            correctCount={correctCount}
            totalCount={totalCount}
            level={level}
            onRetry={handleRetry}
            onMenu={handleDashboard}
          />
        )}
      </main>
    </div>
  );
}
