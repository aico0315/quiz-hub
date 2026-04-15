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

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark"; // 手動で設定済みならそれを優先
    return window.matchMedia("(prefers-color-scheme: dark)").matches; // 未設定ならデバイス設定に従う
  });

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
          className={`${styles.themeToggle} ${isDark ? styles.darkMode : ""}`}
          onClick={() => setIsDark((d) => !d)}
          aria-label={isDark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
        >
          <svg className={styles.sunIcon} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <span className={styles.knob} />
          <svg className={styles.moonIcon} width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
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
            quizType={quizType}
            level={level}
            onNext={handleNext}
            onMenu={handleBackToLevel}
          />
        )}
        {screen === "quiz" && quizType === "logic" && logicQs.length > 0 && (
          <LogicQuizScreen
            question={logicQs[currentIndex]}
            questionNumber={currentIndex + 1}
            totalQuestions={logicQs.length}
            level={level}
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
