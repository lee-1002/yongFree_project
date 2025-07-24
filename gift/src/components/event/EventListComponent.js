import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatShortDate } from "../../util/dateUtil";
import { getEvents } from "../../api/eventApi";
import "./EventList.css";

const IMAGE_BASE_URL = "http://localhost:8080/files";

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
                    src={`${IMAGE_BASE_URL}/${event.imageUrl}`}
                    width="360"
                    height="134"
                    alt={event.title}
                    onError={(e) => {
                      e.target.onerror = null; // 무한 루프 방지
                      e.target.src =
                        "https://img.sa.nexon.com/S2/Game/sudden/2011/temp/thumb_event_noImage.jpg";
                    }}
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
