import { useState, useRef, useEffect } from "react";
import type { MethodQuestion, QuizType, Level } from "../types";
import styles from "./MethodQuizScreen.module.css";

const QUIZ_TYPE_LABEL: Record<QuizType, string> = {
  method: "メソッド問題",
  webapi: "WEB API問題",
  logic: "ロジック問題",
};

const LEVEL_LABEL: Record<Level, string> = {
  junior: "Junior",
  middle: "Middle",
};

interface Props {
  question: MethodQuestion;
  questionNumber: number;
  totalQuestions: number;
  quizType: QuizType;
  level: Level;
  onNext: (isCorrect: boolean) => void;
  onMenu: () => void;
}

function normalize(str: string): string {
  return str.replace(/　/g, " ").trim();
}

const CODE_START = /^(const |let |var |new |await |fetch|try|catch|\}|\{|if |return |reader\.|es\.|fd\.|el\.|btn\.|form\.|parent\.|ul\.|  )/;

function isCodeLine(line: string): boolean {
  return CODE_START.test(line);
}

function renderSupplement(text: string) {
  const lines = text.split("\n");
  const result: React.ReactNode[] = [];
  let codeBuffer: string[] = [];

  const flushCode = (key: number) => {
    if (codeBuffer.length > 0) {
      result.push(
        <pre key={`code-${key}`} className={styles.supplementCode}>
          <code>{codeBuffer.join("\n")}</code>
        </pre>
      );
      codeBuffer = [];
    }
  };

  lines.forEach((line, i) => {
    if (isCodeLine(line)) {
      codeBuffer.push(line);
    } else {
      flushCode(i);
      if (line.trim()) {
        result.push(
          <p key={i} className={styles.supplementLine}>{line}</p>
        );
      }
    }
  });
  flushCode(lines.length);

  return result;
}

function judge(input: string, answers: string[]): boolean {
  const normalized = normalize(input);
  return answers.some((answer) => normalized === answer);
}

export default function MethodQuizScreen({ question, questionNumber, totalQuestions, quizType, level, onNext, onMenu }: Props) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput("");
    setSubmitted(false);
    inputRef.current?.focus();
  }, [question.id]);

  const handleSubmit = () => {
    if (!normalize(input)) return;
    const result = judge(input, question.answer);
    setIsCorrect(result);
    setSubmitted(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!submitted) handleSubmit();
      else onNext(isCorrect);
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
        <span>{QUIZ_TYPE_LABEL[quizType]}</span>
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

      {!submitted ? (
        <div className={styles.inputArea}>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="答えを入力..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <button className={styles.submitButton} onClick={handleSubmit} disabled={!normalize(input)}>
            回答する
          </button>
        </div>
      ) : (
        <div className={styles.resultArea}>
          <div className={`${styles.judgment} ${isCorrect ? styles.correct : styles.incorrect}`}>
            {isCorrect ? "正解！" : "不正解"}
          </div>
          <div className={styles.answerBox}>
            <div className={styles.yourAnswer}>あなたの回答：<code>{input}</code></div>
            {!isCorrect && (
              <div className={styles.correctAnswer}>正解：<code>{question.answer.join(" / ")}</code></div>
            )}
          </div>
          <div className={styles.supplement}>
            <span className={styles.supplementLabel}>補足</span>
            {renderSupplement(question.supplement)}
          </div>
          <button className={styles.nextButton} onClick={() => onNext(isCorrect)}>
            次の問題へ →
          </button>
          <p className={styles.enterHint}>Enter でも進めます</p>
        </div>
      )}
    </div>
  );
}
