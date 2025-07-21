import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById, deleteEventById } from "../../api/eventApi";
import { formatShortDate } from "../../util/dateUtil";
import "./EventRead.css";

const EventReadComponent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getEventById(id);
        setEvent(data);
      } catch (err) {
        setError("이벤트를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteEventById(id);
      alert("삭제되었습니다.");
      navigate("/event");
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div className="loading-msg">로딩 중...</div>;
  if (error) return <div className="error-msg">{error}</div>;
  if (!event) return <div>이벤트를 찾을 수 없습니다.</div>;

  return (
    <div className="event-read-container">
      <div className="title-area">
        <h1>{event.title}</h1>
      </div>

      <div className="content-area">
        <div className="top-content">
          <div className="photo-box">
            <img
              src={event.imageUrl || "/placeholder.png"}
              alt={event.title}
              className="event-photo"
            />
          </div>
          <div className="info-box">
            <div className="info-item">
              <label>가게 상호명</label>
              <div>{event.storeName || "-"}</div>
            </div>
            <div className="info-item">
              <label>가게 주소</label>
              <div>{event.storeAddress || "-"}</div>
            </div>
            <div className="info-item">
              <label>기간</label>
              <div>
                {formatShortDate(event.startDate)} ~ {formatShortDate(event.endDate)}
              </div>
            </div>
          </div>
        </div>

        <div className="bottom-content">
          <label>이벤트 설명</label>
          <p className="description">{event.description || "설명 없음"}</p>
        </div>

        <div className="bottom-controls">
          <div className="status">
            상태:{" "}
            <span className={event.isActive ? "active" : "inactive"}>
              {event.isActive ? "✅ 활성화" : "⛔ 비활성화"}
            </span>
          </div>
          <button onClick={handleDelete} className="delete-btn">
            삭제하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventReadComponent;