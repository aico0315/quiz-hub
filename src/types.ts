export type Level = "junior" | "middle";
export type QuizType = "method" | "webapi" | "logic";
export type Screen = "dashboard" | "level" | "quiz" | "clear";

export interface MethodQuestion {
  id: string;
  level: Level;
  category: string;
  question: string;
  answer: string[];
  supplement: string;
}

export interface LogicQuestion {
  id: string;
  level: Level;
  category: string;
  question: string;
  starterCode: string;
  expected: string;
  explanation: string;
}
