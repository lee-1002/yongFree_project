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
  const [pageInfo, setPageInfo] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    loadEvents(currentPage);
  }, [currentPage]);

  const loadEvents = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvents(page);
      console.log("서버에서 받은 이벤트 데이터:", data);

      if (data?.dtoList) {
        setEvents(data.dtoList);
        setPageInfo({
          pageNumList: data.pageNumList,
          prev: data.prev,
          next: data.next,
          prevPage: data.prevPage,
          nextPage: data.nextPage,
          current: data.current,
          totalPage: data.totalPage,
        });
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

                <div className="store-info">
                  <strong>가게명:</strong> {event.storeName || "정보 없음"}
                  <br />
                  <strong>주소:</strong> {event.storeAddress || "정보 없음"}
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

      {/* ✅ 추가된 페이징 UI */}
      <div className="pagination">
        {" "}
        {/* 🔥 추가됨 */}
        {pageInfo.prev && (
          <button onClick={() => handlePageClick(pageInfo.prevPage)}>
            &laquo;
          </button> // 🔥 추가됨
        )}
        {pageInfo.pageNumList?.map((num) => (
          <button
            key={num}
            onClick={() => handlePageClick(num)} // 🔥 추가됨
            className={num === pageInfo.current ? "active" : ""} // 🔥 추가됨
          >
            {num}
          </button>
        ))}
        {pageInfo.next && (
          <button onClick={() => handlePageClick(pageInfo.nextPage)}>
            &raquo;
          </button> // 🔥 추가됨
        )}
      </div>

      <button onClick={handleAdd}>이벤트 추가</button>
    </div>
  );
};

export default EventListComponent;
