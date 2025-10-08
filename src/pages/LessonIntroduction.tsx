import React, { useEffect, useState, useRef } from "react";
import { lessonData } from "../data/lessonData";
import VideoSection from "../components/VideoSection";
// import Timeline from "../components/Timeline";
import KeyQuotes from "../components/KeyQuotes";
import { Play, Pause } from "lucide-react";
import "./LessonIntroduction.css";

// Helper function to recursively render content
function renderContent(content: any, key: any) {
  if (typeof content === "string") {
    return <p key={key}>{content}</p>;
  } else if (
    typeof content === "object" &&
    content !== null &&
    "title" in content &&
    Array.isArray(content.content)
  ) {
    return (
      <div key={key}>
        <strong>{content.title}</strong>
        {content.content.map((sub: any, subIdx: any) =>
          renderContent(sub, subIdx)
        )}
      </div>
    );
  }
  return null;
}

const LessonIntroduction: React.FC = () => {
  const [openItem, setOpenItem] = useState<{
    cardIndex: number;
    itemIndex: number;
  } | null>(null);

  const [currentAudio, setCurrentAudio] = useState<{
    cardIndex: number;
    itemIndex: number;
  } | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleItem = (cardIndex: number, itemIndex: number) => {
    if (
      openItem?.cardIndex === cardIndex &&
      openItem?.itemIndex === itemIndex
    ) {
      setOpenItem(null); // nếu click lại vào item đang mở -> đóng
    } else {
      setOpenItem({ cardIndex, itemIndex });
    }
  };

  const toggleAudio = (cardIndex: number, itemIndex: number, audioPath: string) => {
    // Stop current audio if playing a different item
    if (currentAudio && (currentAudio.cardIndex !== cardIndex || currentAudio.itemIndex !== itemIndex)) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }

    // If clicking on the same audio that's playing, pause it
    if (currentAudio?.cardIndex === cardIndex && currentAudio?.itemIndex === itemIndex && isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    // Create new audio and play
    const newAudio = new Audio(audioPath);
    newAudio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentAudio(null);
    });

    audioRef.current = newAudio;
    setCurrentAudio({ cardIndex, itemIndex });
    setIsPlaying(true);
    newAudio.play().catch(err => {
      console.error("Error playing audio:", err);
      setIsPlaying(false);
      setCurrentAudio(null);
    });
  };
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused] = useState(false);

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? lessonData.images.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === lessonData.images.length - 1 ? 0 : prev + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index);
  };

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(nextImage, 5000);
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  return (
    <div className="lesson-container">
      <h1 className="lesson-title">{lessonData.title}</h1>

      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="lesson-summary">
              {lessonData.summary.map((paragraph, index) => (
                <p key={index} className="summary-paragraph">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {lessonData.images.length > 0 && (
        <div className="carousel-container">
          <div className={`carousel ${isFullscreen ? "fullscreen" : ""}`}>
            <div
              className="carousel-inner"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {lessonData.images.map((image, index) => (
                <div
                  className={`carousel-item ${
                    index === currentImageIndex ? "active" : ""
                  }`}
                  key={index}
                >
                  <div className="image-wrapper">
                    <img
                      src={image}
                      alt={`Hình minh họa ${index + 1}`}
                      className="lesson-image"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5IaW5oIGFuaCBtaW5oIGjGsGE8L3RleHQ+PC9zdmc+";
                      }}
                    />
                    <div className="image-overlay">
                      <div className="image-info">
                        <span className="image-counter">
                          {index + 1} / {lessonData.images.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="carousel-indicators">
              {lessonData.images.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${
                    index === currentImageIndex ? "active" : ""
                  }`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Đi đến hình ${index + 1}`}
                />
              ))}
            </div>

            <div className="carousel-progress">
              <div
                className="progress-bar"
                style={{
                  width: `${
                    ((currentImageIndex + 1) / lessonData.images.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      <section className="content-section">
        <div className="content-wrapper">
          {lessonData.cards.map((card, cardIndex) => (
            <div key={cardIndex} className={`lesson-card border-${card.color}`}>
              <div className="card-content">
                <h3 className={`card-title text-${card.color}`}>
                  {cardIndex + 1}. {card.title}
                </h3>
                <ul>
                  {card.items.map((item, itemIndex) => (
                    <li
                      className="card-li"
                      key={itemIndex}
                      onClick={() => toggleItem(cardIndex, itemIndex)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="item-header">
                        <strong>{item.title}</strong>
                        {item.audio && (
                          <button
                            className={`voice-btn ${
                              currentAudio?.cardIndex === cardIndex &&
                              currentAudio?.itemIndex === itemIndex &&
                              isPlaying ? 'playing' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAudio(cardIndex, itemIndex, item.audio);
                            }}
                            aria-label={
                              currentAudio?.cardIndex === cardIndex &&
                              currentAudio?.itemIndex === itemIndex &&
                              isPlaying
                                ? "Pause audio"
                                : "Play audio"
                            }
                            title={
                              currentAudio?.cardIndex === cardIndex &&
                              currentAudio?.itemIndex === itemIndex &&
                              isPlaying
                                ? "Pause audio"
                                : "Play audio"
                            }
                          >
                            {currentAudio?.cardIndex === cardIndex &&
                             currentAudio?.itemIndex === itemIndex &&
                             isPlaying ? (
                              <span style={{ fontSize: '16px' }}>⏸️</span>
                            ) : (
                              <span style={{ fontSize: '16px' }}>▶️</span>
                            )}
                          </button>
                        )}
                      </div>
                      {openItem?.cardIndex === cardIndex &&
                        openItem?.itemIndex === itemIndex && (
                          <div className={`item-content border-${card.color}`}>
                            {item.content.map((line, idx) =>
                              renderContent(line, idx)
                            )}
                          </div>
                        )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Video Section */}
      {lessonData.videos && lessonData.videos.length > 0 && (
        <VideoSection videos={lessonData.videos} />
      )}

      {/* Timeline Section */}
      {/* {lessonData.timeline && lessonData.timeline.length > 0 && (
        <Timeline timeline={lessonData.timeline} />
      )} */}

      {/* Key Quotes Section */}
      {lessonData.keyQuotes && lessonData.keyQuotes.length > 0 && (
        <KeyQuotes quotes={lessonData.keyQuotes} />
      )}

      {/* Interactive Elements Section */}
      {/* {lessonData.interactiveElements && lessonData.interactiveElements.length > 0 && (
        <InteractiveElements elements={lessonData.interactiveElements} />
      )} */}

      <div className="lesson-footer">
        <p className="study-tip">
          💡 <strong>Gợi ý học tập:</strong> Hãy đọc kỹ nội dung trên và ghi chú
          những điểm quan trọng trước khi làm bài kiểm tra. Bạn có thể quay lại
          trang này bất cứ lúc nào để ôn tập.
        </p>
      </div>
    </div>
  );
};

export default LessonIntroduction;
