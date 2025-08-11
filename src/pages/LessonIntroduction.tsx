import { lessonData } from '../data/lessonData';
import './LessonIntroduction.css';

const LessonIntroduction: React.FC = () => {
  return (
    <div className="lesson-container">
      <div className="lesson-header">
        <h1 className="lesson-title">{lessonData.title}</h1>
        <div className="lesson-summary">
          {lessonData.summary.map((paragraph, index) => (
            <p key={index} className="summary-paragraph">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="lesson-images">
        {lessonData.images.map((image, index) => (
          <div key={index} className="image-container">
            <img 
              src={image} 
              alt={`Hình minh họa ${index + 1}`}
              className="lesson-image"
              onError={(e) => {
                // Hiển thị ảnh placeholder nếu không tìm thấy ảnh
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5IaW5oIG1pbmggaOG7jWE8L3RleHQ+PC9zdmc+';
              }}
            />
            <p className="image-caption">Hình minh họa {index + 1}</p>
          </div>
        ))}
      </div>

      <div 
        className="lesson-content-detail"
        dangerouslySetInnerHTML={{ __html: lessonData.content }}
      />

      <div className="lesson-footer">
        <p className="study-tip">
          💡 <strong>Gợi ý học tập:</strong> Hãy đọc kỹ nội dung trên và ghi chú những điểm quan trọng 
          trước khi làm bài kiểm tra. Bạn có thể quay lại trang này bất cứ lúc nào để ôn tập.
        </p>
      </div>
    </div>
  );
};

export default LessonIntroduction;
