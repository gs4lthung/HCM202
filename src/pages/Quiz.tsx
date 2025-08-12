import { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { quizQuestions } from '../data/quizQuestions';
import { generateAIQuiz } from '../utils/geminiService';
import type { QuizResult } from '../types';
import './Quiz.css';

const STANDARD_QUESTION_TIME = 30; // 30 giây cho câu hỏi chuẩn
const AI_QUESTION_TIME = 60; // 60 giây cho câu hỏi AI
const STANDARD_TOTAL_TIME = 300; // 5 phút cho quiz chuẩn
const AI_TOTAL_TIME = 420; // 7 phút cho AI quiz (5 câu x 60s + buffer)

type QuizMode = 'standard' | 'ai';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Question {
  id?: string;
  question: string;
  options: string[];
  correctAnswer?: number;
  correct?: number;
  explanation?: string;
}

const Quiz: React.FC = () => {
  const [quizMode, setQuizMode] = useState<QuizMode>('standard');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(STANDARD_QUESTION_TIME);
  const [totalTimeLeft, setTotalTimeLeft] = useState(STANDARD_TOTAL_TIME);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [username, setUsername] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // Get question time limit based on quiz mode
  const getQuestionTimeLimit = () => {
    return quizMode === 'ai' ? AI_QUESTION_TIME : STANDARD_QUESTION_TIME;
  };

  // Get total quiz time based on quiz mode
  const getTotalQuizTime = () => {
    return quizMode === 'ai' ? AI_TOTAL_TIME : STANDARD_TOTAL_TIME;
  };

  // Timer cho câu hỏi hiện tại
  useEffect(() => {
    if (!isStarted || isQuizFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return getQuestionTimeLimit();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, isStarted, isQuizFinished]);

  // Timer cho tổng thời gian làm bài
  useEffect(() => {
    if (!isStarted || isQuizFinished) return;

    const timer = setInterval(() => {
      setTotalTimeLeft((prev) => {
        if (prev <= 1) {
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isQuizFinished]);

  // Initialize questions based on mode
  useEffect(() => {
    if (quizMode === 'standard') {
      setCurrentQuestions(quizQuestions.map(q => ({
        ...q,
        correctAnswer: q.correctAnswer
      })));
    } else if (quizMode === 'ai') {
      // Reset questions for AI mode
      setCurrentQuestions([]);
    }
    // Update time when mode changes (only if not started)
    if (!isStarted) {
      setTimeLeft(getQuestionTimeLimit());
      setTotalTimeLeft(getTotalQuizTime());
    }
  }, [quizMode, isStarted]);

  const generateAIQuizData = async () => {
    try {
      console.log('Generating AI quiz with difficulty:', difficulty); // Debug log
      const data = await generateAIQuiz(difficulty);
      console.log('AI quiz data received:', data); // Debug log
      const aiQuestions = data.questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correct,
        explanation: q.explanation
      }));
      setCurrentQuestions(aiQuestions);
      console.log('Generated AI questions:', aiQuestions); // Debug log
      return true;
    } catch (error) {
      console.error('Error generating AI quiz:', error);
      alert('Có lỗi xảy ra khi tạo câu hỏi AI. Vui lòng thử lại.');
      setCurrentQuestions([]); // Reset questions on error
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const startQuiz = async () => {
    if (username.trim() === '') {
      alert('Vui lòng nhập tên của bạn để bắt đầu!');
      return;
    }

    if (quizMode === 'ai') {
      const success = await generateAIQuizData();
      if (!success) {
        return; // Error occurred in generation
      }
    }

    // Set initial time based on quiz mode
    setTimeLeft(getQuestionTimeLimit());
    setTotalTimeLeft(getTotalQuizTime());
    setIsStarted(true);
    setStartTime(Date.now());
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeLeft(getQuestionTimeLimit());
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setIsQuizFinished(true);
    
    // Tính điểm
    let correctAnswers = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === currentQuestions[index]?.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const finalScore = correctAnswers;
    setScore(finalScore);
    
    // Tính thời gian thực tế làm bài
    const actualTimeTaken = Math.round((Date.now() - startTime) / 1000);
    
    // Lưu kết quả vào Firestore
    try {
      const quizResult: Omit<QuizResult, 'id'> = {
        username: username.trim(),
        score: finalScore,
        totalQuestions: currentQuestions.length,
        timeTaken: actualTimeTaken,
        quizDuration: getTotalQuizTime(),
        timestamp: new Date(),
        quizType: quizMode === 'ai' ? `ai-${difficulty}` : 'standard',
        difficulty: quizMode === 'ai' ? difficulty : undefined
      };
      
      // Lưu vào collection phù hợp
      const collectionName = quizMode === 'ai' ? 'aiQuizResults' : 'quizResults';
      await addDoc(collection(db, collectionName), quizResult);
      setShowResult(true);
    } catch (error) {
      console.error('Lỗi khi lưu kết quả:', error);
      alert('Có lỗi xảy ra khi lưu kết quả. Vui lòng thử lại sau.');
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setTimeLeft(getQuestionTimeLimit());
    setTotalTimeLeft(getTotalQuizTime());
    setIsQuizFinished(false);
    setIsStarted(false);
    setScore(0);
    setUsername('');
    setShowResult(false);
    setStartTime(0);
    setQuizMode('standard');
    setDifficulty('medium');
    setCurrentQuestions([]);
    setIsGenerating(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Màn hình loading khi tạo AI quiz
  if (isGenerating) {
    return (
      <div className="quiz-container">
        <div className="quiz-start">
          <h1>🤖 Đang tạo câu hỏi AI</h1>
          <p className="quiz-description">
            Vui lòng đợi trong giây lát, AI đang tạo {5} câu hỏi về tư tưởng Hồ Chí Minh với độ khó {difficulty === 'easy' ? 'Dễ' : difficulty === 'medium' ? 'Trung bình' : 'Khó'}...
          </p>
          <div className="loading-animation">
            <div className="spinner"></div>
            <p>Đang xử lý...</p>
          </div>
        </div>
      </div>
    );
  }

  // Màn hình bắt đầu
  if (!isStarted) {
    const questionCount = quizMode === 'ai' ? (currentQuestions.length || 5) : quizQuestions.length;
    
    return (
      <div className="quiz-container">
        <div className="quiz-start">
          <h1>Kiểm Tra Kiến Thức</h1>
          <p className="quiz-description">
            {quizMode === 'ai' 
              ? `Thử thách bản thân với ${questionCount} câu hỏi được tạo bởi AI về tư tưởng Hồ Chí Minh`
              : `Bài kiểm tra gồm ${questionCount} câu hỏi trắc nghiệm về tư tưởng Hồ Chí Minh`}
          </p>
          
          {/* Time info highlight */}
          <div className={`time-info ${quizMode === 'ai' ? 'ai-mode' : 'standard-mode'}`}>
            <span>⏱️ {getQuestionTimeLimit()} giây/câu</span>
            {quizMode === 'ai' && <span className="ai-badge">Thời gian dài hơn cho AI</span>}
          </div>

          {/* Quiz Mode Selection */}
          <div className="quiz-mode-selection">
            <h3>Chế độ kiểm tra:</h3>
            <div className="mode-options">
              <label className="mode-option">
                <input
                  type="radio"
                  name="quizMode"
                  value="standard"
                  checked={quizMode === 'standard'}
                  onChange={() => setQuizMode('standard')}
                />
                <span>📚 Câu hỏi chuẩn</span>
              </label>
              <label className="mode-option">
                <input
                  type="radio"
                  name="quizMode"
                  value="ai"
                  checked={quizMode === 'ai'}
                  onChange={() => setQuizMode('ai')}
                />
                <span>🤖 Thách thức AI</span>
              </label>
            </div>
          </div>

          {/* Difficulty Selection for AI mode */}
          {quizMode === 'ai' && (
            <div className="difficulty-selection">
              <h3>Độ khó:</h3>
              <div className="difficulty-options">
                <label className="difficulty-option">
                  <input
                    type="radio"
                    name="difficulty"
                    value="easy"
                    checked={difficulty === 'easy'}
                    onChange={() => setDifficulty('easy')}
                  />
                  <span>🟢 Dễ</span>
                </label>
                <label className="difficulty-option">
                  <input
                    type="radio"
                    name="difficulty"
                    value="medium"
                    checked={difficulty === 'medium'}
                    onChange={() => setDifficulty('medium')}
                  />
                  <span>🟡 Trung bình</span>
                </label>
                <label className="difficulty-option">
                  <input
                    type="radio"
                    name="difficulty"
                    value="hard"
                    checked={difficulty === 'hard'}
                    onChange={() => setDifficulty('hard')}
                  />
                  <span>🔴 Khó</span>
                </label>
              </div>
            </div>
          )}
          
          <div className="quiz-rules">
            <h3>Quy định:</h3>
            <ul>
              <li>Thời gian làm bài: {Math.round(getTotalQuizTime() / 60)} phút</li>
              <li>Mỗi câu hỏi có thời gian: {getQuestionTimeLimit()} giây</li>
              <li>Tự động chuyển câu khi hết thời gian</li>
              <li>Không thể quay lại câu trước</li>
              {quizMode === 'ai' && <li>Câu hỏi được tạo tự động bởi AI</li>}
              {quizMode === 'ai' && <li>AI quiz có thời gian dài hơn do độ khó cao</li>}
            </ul>
          </div>
          <div className="username-input">
            <input
              type="text"
              placeholder="Nhập tên của bạn"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={50}
            />
          </div>
          <button 
            className="start-button" 
            onClick={startQuiz}
            disabled={username.trim() === '' || isGenerating}
          >
            {isGenerating ? '🤖 Đang tạo câu hỏi...' : 'Bắt Đầu Kiểm Tra'}
          </button>
        </div>
      </div>
    );
  }

  // Màn hình kết quả
  if (isQuizFinished && showResult) {
    const percentage = Math.round((score / currentQuestions.length) * 100);
    
    return (
      <div className="quiz-container">
        <div className="quiz-result">
          <h1>Kết Quả Kiểm Tra</h1>
          <div className="result-summary">
            <h2>Chúc mừng {username}!</h2>
            <div className="quiz-info">
              <span className="quiz-type">
                {quizMode === 'ai' ? `🤖 Thách thức AI - Độ khó: ${difficulty === 'easy' ? 'Dễ' : difficulty === 'medium' ? 'Trung bình' : 'Khó'}` : '📚 Câu hỏi chuẩn'}
              </span>
            </div>
            <div className="score-display">
              <span className="score-number">{score}/{currentQuestions.length}</span>
              <span className="score-percentage">({percentage}%)</span>
            </div>
            <p className="result-message">
              {percentage >= 80 ? 'Xuất sắc! Bạn đã nắm vững kiến thức!' :
               percentage >= 60 ? 'Tốt! Bạn đã hiểu khá tốt bài học.' :
               percentage >= 40 ? 'Khá! Bạn cần ôn tập thêm một chút.' :
               'Hãy ôn tập lại bài học và thử lần nữa nhé!'}
            </p>
          </div>
          
          <div className="answer-review">
            <h3>Chi tiết câu trả lời:</h3>
            {currentQuestions.map((question, index) => (
              <div key={question.id} className="answer-item">
                <p className="question-text">
                  <strong>Câu {index + 1}:</strong> {question.question}
                </p>
                <div className="answer-options">
                  {question.options.map((option, optionIndex) => (
                    <div 
                      key={optionIndex} 
                      className={`option ${
                        optionIndex === question.correctAnswer ? 'correct' :
                        optionIndex === selectedAnswers[index] && optionIndex !== question.correctAnswer ? 'incorrect' :
                        ''
                      }`}
                    >
                      {option}
                      {optionIndex === question.correctAnswer && ' ✓'}
                      {optionIndex === selectedAnswers[index] && optionIndex !== question.correctAnswer && ' ✗'}
                    </div>
                  ))}
                </div>
                {question.explanation && (
                  <p className="explanation">💡 {question.explanation}</p>
                )}
              </div>
            ))}
          </div>
          
          <button className="retry-button" onClick={resetQuiz}>
            Làm Lại Bài Kiểm Tra
          </button>
        </div>
      </div>
    );
  }

  // Màn hình làm bài
  const question = currentQuestions[currentQuestion];
  
  if (!question) {
    return <div className="quiz-container">Loading...</div>;
  }
  
  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-progress">
          <span>Câu {currentQuestion + 1}/{currentQuestions.length}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentQuestion + 1) / currentQuestions.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="quiz-timers">
          <div className="question-timer">
            <span>Câu hỏi: {timeLeft}s</span>
          </div>
          <div className="total-timer">
            <span>Tổng: {formatTime(totalTimeLeft)}</span>
          </div>
        </div>
      </div>

      <div className="question-container">
        <h2 className="question-text">{question.question}</h2>
        <div className="options-container">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={`option-button ${selectedAnswers[currentQuestion] === index ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(index)}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>

        <div className="question-actions">
          <button 
            className="next-button"
            onClick={handleNextQuestion}
            disabled={selectedAnswers[currentQuestion] === undefined}
          >
            {currentQuestion === currentQuestions.length - 1 ? 'Hoàn Thành' : 'Câu Tiếp Theo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
