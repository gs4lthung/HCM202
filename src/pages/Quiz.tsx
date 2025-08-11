import { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { quizQuestions } from '../data/quizQuestions';
import type { QuizResult } from '../types';
import './Quiz.css';

const QUESTION_TIME_LIMIT = 20; // giây
const TOTAL_QUIZ_TIME = 300; // 5 phút = 300 giây

const Quiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [totalTimeLeft, setTotalTimeLeft] = useState(TOTAL_QUIZ_TIME);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [username, setUsername] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // Timer cho câu hỏi hiện tại
  useEffect(() => {
    if (!isStarted || isQuizFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return QUESTION_TIME_LIMIT;
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

  const startQuiz = () => {
    if (username.trim() === '') {
      alert('Vui lòng nhập tên của bạn để bắt đầu!');
      return;
    }
    setIsStarted(true);
    setStartTime(Date.now());
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeLeft(QUESTION_TIME_LIMIT);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setIsQuizFinished(true);
    
    // Tính điểm
    let correctAnswers = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === quizQuestions[index].correctAnswer) {
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
        totalQuestions: quizQuestions.length,
        timeTaken: actualTimeTaken,
        quizDuration: TOTAL_QUIZ_TIME,
        timestamp: new Date()
      };
      
      await addDoc(collection(db, 'quizResults'), quizResult);
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
    setTimeLeft(QUESTION_TIME_LIMIT);
    setTotalTimeLeft(TOTAL_QUIZ_TIME);
    setIsQuizFinished(false);
    setIsStarted(false);
    setScore(0);
    setUsername('');
    setShowResult(false);
    setStartTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Màn hình bắt đầu
  if (!isStarted) {
    return (
      <div className="quiz-container">
        <div className="quiz-start">
          <h1>Kiểm Tra Kiến Thức</h1>
          <p className="quiz-description">
            Bài kiểm tra gồm {quizQuestions.length} câu hỏi trắc nghiệm về tư tưởng Hồ Chí Minh.
          </p>
          <div className="quiz-rules">
            <h3>Quy định:</h3>
            <ul>
              <li>Thời gian làm bài: {TOTAL_QUIZ_TIME / 60} phút</li>
              <li>Mỗi câu hỏi có thời gian: {QUESTION_TIME_LIMIT} giây</li>
              <li>Tự động chuyển câu khi hết thời gian</li>
              <li>Không thể quay lại câu trước</li>
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
            disabled={username.trim() === ''}
          >
            Bắt Đầu Kiểm Tra
          </button>
        </div>
      </div>
    );
  }

  // Màn hình kết quả
  if (isQuizFinished && showResult) {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    
    return (
      <div className="quiz-container">
        <div className="quiz-result">
          <h1>Kết Quả Kiểm Tra</h1>
          <div className="result-summary">
            <h2>Chúc mừng {username}!</h2>
            <div className="score-display">
              <span className="score-number">{score}/{quizQuestions.length}</span>
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
            {quizQuestions.map((question, index) => (
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
  const question = quizQuestions[currentQuestion];
  
  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-progress">
          <span>Câu {currentQuestion + 1}/{quizQuestions.length}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
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
            {currentQuestion === quizQuestions.length - 1 ? 'Hoàn Thành' : 'Câu Tiếp Theo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
