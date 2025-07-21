import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatShortDate } from "../../util/dateUtil";
import {
  getEvents,
  patchToggleEventStatus,
  deleteEventById as deleteEventApi,
} from "../../api/eventApi";
import "./EventList.css";

const EventListComponent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvents();
      console.log("서버에서 받은 이벤트 데이터:", data);

      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        setError("이벤트 데이터가 올바르지 않습니다.");
        setEvents([]);
      }
    } catch (err) {
      setError("이벤트를 불러오는 데 실패했습니다.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const updatedEvent = await patchToggleEventStatus(id);
      setEvents((prev) =>
        prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
      );
    } catch {
      alert("이벤트 상태 변경에 실패했습니다.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteEventApi(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert("이벤트 삭제에 실패했습니다.");
    }
  };

  const handleAdd = () => {
    navigate("/event/add");
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="event-container">
      <h1>이벤트 목록</h1>
      <ul className="boardEventList">
        {events.length === 0 ? (
          <li>등록된 이벤트가 없습니다.</li>
        ) : (
          events.map((event) => (
            <li key={event.id}>
              <div className="thumb">
                <Link to={`/event/${event.id}`}>
                  <img
                    src={event.imageUrl || "/placeholder.png"}
                    alt={event.title}
                  />
                </Link>
              </div>
              <div className="data">
                <Link to={`/event/${event.id}`} className="title-link">
                  {event.title}
                </Link>
                <div className="event-date">
                  {formatShortDate(event.startDate)} ~{" "}
                  {formatShortDate(event.endDate)}
                </div>
                <div className="txt ellipsis">{event.description}</div>

                {/* 새로 추가된 가게명과 주소 */}
                <div className="store-info">
                  <strong>가게명:</strong> {event.store_name || "정보 없음"}
                  <br />
                  <strong>주소:</strong> {event.store_address || "정보 없음"}
                </div>

                <button onClick={() => handleToggle(event.id)}>
                  {event.isActive ? "비활성화" : "활성화"}
                </button>
                <button onClick={() => handleDelete(event.id)}>삭제</button>
              </div>
              <Link to={`/event/${event.id}`} className="btn_detail">
                <b>자세히 보기</b>
              </Link>
            </li>
          ))
        )}
      </ul>
      <button onClick={handleAdd}>이벤트 추가</button>
    </div>
  );
};

export default EventListComponent;
