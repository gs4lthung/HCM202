import React from "react";
import "./About.css";

const About: React.FC = () => {
  const teamMembers = [
    {
      name: "Lâm Tiên Hưng",
    },
    {
      name: "Nguyễn Anh Tuấn",
    },
    {
      name: "Phạm Văn Quốc Vương ",
    },
    {
      name: "Nguyễn Thanh Phong",
    },
    {
      name: "Trương Gia Hải",
    },
    {
      name: "Đặng Lê Hoàng Phúc",
    },
    {
      name: "Phước Sang",
    },
  ];

  return (
    <div className="about-container">
      <div className="about-header">
        <h1>Về Chúng Tôi</h1>
        <p className="about-subtitle">Dự án học tập về tư tưởng Hồ Chí Minh</p>
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

      <section className="team-section">
        <h2>Thành Viên Nhóm</h2>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-card">
              <h3 className="member-name">{member.name}</h3>
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
