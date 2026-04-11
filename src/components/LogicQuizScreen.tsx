import { useState, useEffect, useRef } from "react";
import type { LogicQuestion, Level } from "../types";
import { runCode, judge } from "../lib/runner";
import styles from "./LogicQuizScreen.module.css";

const LEVEL_LABEL: Record<Level, string> = {
  junior: "Junior",
  middle: "Middle",
};

interface Props {
  question: LogicQuestion;
  questionNumber: number;
  totalQuestions: number;
  level: Level;
  onNext: (isCorrect: boolean) => void;
  onMenu: () => void;
}

function renderExplanation(text: string) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const code = part.replace(/^```\w*\n?/, "").replace(/```$/, "");
      return <pre key={i} className={styles.codeBlock}><code>{code}</code></pre>;
    }
    return <span key={i} style={{ whiteSpace: "pre-wrap" }}>{part}</span>;
  });
}

export default function LogicQuizScreen({ question, questionNumber, totalQuestions, level, onNext, onMenu }: Props) {
  const [code, setCode] = useState(question.starterCode);
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [actualOutput, setActualOutput] = useState<string[]>([]);
  const [runError, setRunError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`quiz-hub-code-${question.id}`);
    setCode(saved ?? question.starterCode);
    setSubmitted(false);
    setActualOutput([]);
    setRunError(null);
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (!isTouchDevice) textareaRef.current?.focus();
  }, [question.id, question.starterCode]);

  const handleRun = async () => {
    setRunning(true);
    setRunError(null);
    const result = await runCode(code);
    setRunning(false);
    setActualOutput(result.output);
    setRunError(result.error);
    if (!result.error) {
      setIsCorrect(judge(result.output, question.expected));
      setSubmitted(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        el.selectionStart = start + 2;
        el.selectionEnd = start + 2;
      }, 0);
    }
  };

  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.menuButton} onClick={onMenu}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          レベル選択へ戻る
        </button>
        <span className={styles.category}>{question.category}</span>
      </div>
      <div className={styles.breadcrumb}>
        <span>ロジック問題</span>
        <span className={styles.breadcrumbSep}>›</span>
        <span>{LEVEL_LABEL[level]}</span>
      </div>
      <div className={styles.progressRow}>
        <span className={styles.progress}>{questionNumber} / {totalQuestions}</span>
      </div>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>
      <div className={styles.questionBox}>
        <p className={styles.question}>{question.question}</p>
      </div>
      <div className={styles.editorArea}>
        <div className={styles.editorLabel}>コードを書く</div>
        <textarea
          ref={textareaRef}
          className={styles.editor}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            localStorage.setItem(`quiz-hub-code-${question.id}`, e.target.value);
          }}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          rows={10}
        />
      </div>

      {!submitted ? (
        <div className={styles.actions}>
          <button className={styles.runButton} onClick={handleRun} disabled={running}>
            {running ? "実行中..." : "▶ 実行して確認"}
          </button>
          {runError && (
            <div className={styles.errorBox}>
              <span className={styles.errorLabel}>エラー</span>
              <pre>{runError}</pre>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.resultArea}>
          <div className={`${styles.judgment} ${isCorrect ? styles.correct : styles.incorrect}`}>
            {isCorrect ? "正解！" : "不正解"}
          </div>
          <div className={styles.outputBox}>
            <div className={styles.outputRow}>
              <span className={styles.outputLabel}>あなたの出力</span>
              <code>{actualOutput.join("\n") || "(出力なし)"}</code>
            </div>
            {!isCorrect && (
              <div className={styles.outputRow}>
                <span className={styles.outputLabel}>期待する出力</span>
                <code>{question.expected}</code>
              </div>
            )}
          </div>
          <div className={styles.explanation}>
            <span className={styles.explanationLabel}>解説</span>
            <div className={styles.explanationBody}>{renderExplanation(question.explanation)}</div>
          </div>
          <button className={styles.nextButton} onClick={() => onNext(isCorrect)}>
            次の問題へ →
          </button>
        </div>
      )}
    </div>
  );
}
