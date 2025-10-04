import React from "react";
import "./About.css";

const About: React.FC = () => {
  const teamMembers = [
    {
      name: "Lâm Tiên Hưng",
      role: "Xây dựng Web + Chatbot",
    },
    {
      name: "Nguyễn Anh Tuấn",
      role: "Xây dựng Web + Chatbot",
    },
    {
      name: "Phạm Văn Quốc Vương ",
      role: "Xây dựng Web + Chatbot",
    },
    {
      name: "Nguyễn Thanh Phong",
      role: "Chuẩn bị nội dung",
    },
    {
      name: "Trương Gia Hải",
      role: "Chuẩn bị nội dung",
    },
    {
      name: "Đặng Lê Hoàng Phúc",
      role: "Chuẩn bị nội dung",
    },
    {
      name: "Trương Phước Sang",
      role: "Chuẩn bị nội dung",
    },
  ];

  return (
    <div className="about-container">
      <div className="about-header">
        <h1>Về Chúng Tôi</h1>
        {/* <p className="about-subtitle">Dự án học tập về tư tưởng Hồ Chí Minh</p> */}
      </div>

      <section className="project-intro">
        <h2>Giới Thiệu Dự Án</h2>
        <p>
          Đây là dự án học tập được xây dựng nhằm mục đích phổ biến kiến thức về
          tư tưởng và đạo đức Hồ Chí Minh đến với thế hệ trẻ. Chúng tôi mong
          muốn tạo ra một nền tảng học tập trực quan, sinh động và tương tác
          giúp người học dễ dàng tiếp cận và hiểu sâu sắc hơn về những giá trị
          tư tưởng vĩ đại của Chủ tịch Hồ Chí Minh.
        </p>
      </section>

      <section className="technology-section">
        <h2>Công Nghệ Sử Dụng</h2>
        <div className="tech-grid">
          <div className="tech-card">
            <div className="tech-proof">
              <img
                src="/images/image.png "
                alt="Gemini Chatbot Implementation"
              />
              <div className="proof-label">Chatbot + Quiz AI</div>
            </div>
            <h3>Google Gemini</h3>
            <p>
              Tích hợp API Gemini để xây dựng chatbot thông minh học từ những
              kiến thức có sẵn và giúp trả lời câu hỏi và tạo bộ câu hỏi trắc
              nghiệm tự động về tư tưởng Hồ Chí Minh.
            </p>
            <div className="tech-features">
              <span>✅ Chatbot thông minh</span>
              <span>✅ Tạo câu hỏi tự động</span>
            </div>
          </div>
          <div className="tech-card">
            <div className="tech-proof">
              <img
                src="/images/claude-code.png"
                alt="Claude Code Implementation"
              />
              <div className="proof-label">Code được hỗ trợ bởi Claude</div>
            </div>
            <h3>Claude AI</h3>
            <p>
              Sử dụng Claude để hỗ trợ triển khai code, tối ưu cấu trúc dự án và
              phát triển các tính năng.
            </p>
            <div className="tech-features">
              <span>✅ Tối ưu code</span>
              <span>✅ Gợi ý giải pháp</span>
            </div>
          </div>
          {/* <div className="tech-card">
            <div className="tech-proof">
              <img src="/screenshots/ai-images.png" alt="AI Image Generation" />
              <div className="proof-label">Hình ảnh AI tự động</div>
            </div>
            <h3>Hình Ảnh Thông Minh</h3>
            <p>Tích hợp API tìm kiếm và tạo ảnh tự động để cung cấp nội dung hình ảnh trực quan, sinh động cho bài học.</p>
            <div className="tech-features">
              <span>✅ Tìm ảnh tự động</span>
              <span>✅ Tối ưu nội dung</span>
              <span>✅ API hình ảnh</span>
            </div>
          </div> */}
        </div>
      </section>

      <section className="team-section">
        <h2>Thành Viên Nhóm</h2>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-card">
              <h3 className="member-name">{member.name}</h3>
              <p className="member-role">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="contact-section">
        <h2>Liên Hệ</h2>
        <p>
          Nếu bạn có bất kỳ câu hỏi hay góp ý nào về dự án, vui lòng liên hệ với
          chúng tôi qua email: <strong>hungltse170216@fpt.edu.vn</strong>
        </p>
      </section>
    </div>
  );
};

export default About;
