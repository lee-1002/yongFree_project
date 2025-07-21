import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addEvent } from "../../api/eventApi";
import "./EventAdd.css"; // 위 CSS를 여기에 저장

const EventAddComponent = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    image_url: "",
    start_date: "",
    end_date: "",
    store_name: "", // 추가
    store_address: "",
    is_active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        ...form,
        start_date: form.start_date ? form.start_date.replace("T", " ") : null,
        end_date: form.end_date ? form.end_date.replace("T", " ") : null,
      };
      await addEvent(formData);
      alert("이벤트가 성공적으로 등록되었습니다.");
      navigate("/event");
    } catch (error) {
      alert("등록 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="event-add-form">
      <div className="form-group">
        <label htmlFor="title">제목</label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          type="text"
          placeholder="이벤트 제목을 입력하세요"
          required
        />
      </div>
      <div className="form-row">
        {/* 왼쪽: 사진 */}
        <div className="photo-box">
          <label htmlFor="image_url">가게 사진 URL</label>
          <input
            id="image_url"
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            type="url"
            placeholder="https://example.com/image.png"
          />
          {/* 실제 이미지 미리보기도 추가 가능 */}
          {form.image_url && (
            <img
              src={form.image_url}
              alt="가게 사진"
              style={{
                width: 150,
                height: 150,
                objectFit: "cover",
                marginTop: 8,
              }}
            />
          )}
        </div>

        {/* 오른쪽: 가게명, 가게주소, 이벤트 기간 */}
        <div className="info-box">
          <div className="form-group">
            <label htmlFor="store_name">가게명</label>
            <input
              id="store_name"
              name="store_name"
              value={form.store_name}
              onChange={handleChange}
              type="text"
              placeholder="가게명을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="store_address">가게 주소</label>
            <input
              id="store_address"
              name="store_address"
              value={form.store_address}
              onChange={handleChange}
              type="text"
              placeholder="가게 주소를 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="start_date">이벤트 기간</label>
            <div className="date-range">
              <input
                id="start_date"
                name="start_date"
                type="datetime-local"
                value={form.start_date}
                onChange={handleChange}
                required
              />
              <span style={{ margin: "0 8px" }}>~</span>
              <input
                id="end_date"
                name="end_date"
                type="datetime-local"
                value={form.end_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* 설명, 활성화, 제출 버튼 등 아래에 계속 */}
      <div className="form-group">
        <label htmlFor="description">설명</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          placeholder="이벤트 설명을 입력하세요"
        />
      </div>

      <div className="form-group checkbox-group">
        <label htmlFor="is_active">활성화</label>
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          checked={form.is_active}
          onChange={handleChange}
        />
      </div>

      <button type="submit" className="submit-btn">
        등록
      </button>
    </form>
  );
};

export default EventAddComponent;
