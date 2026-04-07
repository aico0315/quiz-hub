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

const SESSION_KEY = "quiz-hub-session";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function clearSession() {
  // セッション本体を削除
  localStorage.removeItem(SESSION_KEY);
  // 保存済みのエディタコードを全て削除
  Object.keys(localStorage)
    .filter((key) => key.startsWith("quiz-hub-code-"))
    .forEach((key) => localStorage.removeItem(key));
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    const s = loadSession();
    return s?.screen === "quiz" ? "quiz" : "dashboard";
  });
  const [quizType, setQuizType] = useState<QuizType>(() => loadSession()?.quizType ?? "method");
  const [level, setLevel] = useState<Level>(() => loadSession()?.level ?? "junior");
  const [currentIndex, setCurrentIndex] = useState<number>(() => loadSession()?.currentIndex ?? 0);
  const [correctCount, setCorrectCount] = useState<number>(() => loadSession()?.correctCount ?? 0);

  const [methodQs, setMethodQs] = useState<MethodQuestion[]>(() => {
    const s = loadSession();
    if (s?.screen !== "quiz" || !s?.methodQIds) return [];
    const pool = s.quizType === "webapi" ? webApiQuestions : methodQuestions;
    return s.methodQIds
      .map((id: string) => pool.find((q) => q.id === id))
      .filter(Boolean) as MethodQuestion[];
  });

  const [logicQs, setLogicQs] = useState<LogicQuestion[]>(() => {
    const s = loadSession();
    if (s?.screen !== "quiz" || !s?.logicQIds) return [];
    return s.logicQIds
      .map((id: string) => logicQuestions.find((q) => q.id === id))
      .filter(Boolean) as LogicQuestion[];
  });

  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");

  // ダークモード
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  // クイズ中のセッションを保存
  useEffect(() => {
    if (screen !== "quiz") return;
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        screen,
        quizType,
        level,
        currentIndex,
        correctCount,
        methodQIds: methodQs.map((q) => q.id),
        logicQIds: logicQs.map((q) => q.id),
      })
    );
  }, [screen, quizType, level, currentIndex, correctCount, methodQs, logicQs]);

  const handleSelectType = useCallback((type: QuizType) => {
    setQuizType(type);
    setScreen("level");
  }, []);

  const handleSelectLevel = useCallback((selectedLevel: Level) => {
    clearSession();
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
      clearSession();
      setScreen("clear");
    } else {
      setCorrectCount(nextCorrect);
      setCurrentIndex(nextIndex);
    }
  }, [correctCount, currentIndex, quizType, logicQs.length, methodQs.length]);

  const handleRetry = useCallback(() => {
    clearSession();
    handleSelectLevel(level);
  }, [handleSelectLevel, level]);

  const handleDashboard = useCallback(() => {
    clearSession();
    setScreen("dashboard");
  }, []);

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
