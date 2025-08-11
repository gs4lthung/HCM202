export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizResult {
  id?: string;
  username: string;
  score: number;
  totalQuestions: number;
  timeTaken: number; // thời gian thực tế làm bài (giây)
  quizDuration: number; // tổng thời gian cho phép (giây)
  timestamp: Date;
  quizType?: string; // 'standard', 'ai-easy', 'ai-medium', 'ai-hard'
  difficulty?: string; // for AI quizzes
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface LessonContent {
  title: string;
  summary: string[];
  images: string[];
  content: string;
}
