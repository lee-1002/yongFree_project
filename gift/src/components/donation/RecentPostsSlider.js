import React, { useEffect, useState } from "react";
import { getRecentList } from "../../api/donationBoardApi";
import { API_SERVER_HOST } from "../../api/todoApi";
import { Link } from "react-router-dom";
import { useRef } from "react";
import "./RecentPostsSlider.css";

function HorizontalCarousel({
  items,
  visibleCount = 4,
  autoPlay = false,
  showControls = true,
}) {
  const count = items.length;
  const slides = [...items]; // 무한 슬라이딩 로직은 제거하고, 아이템만 사용
  const [idx, setIdx] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    if (!trackRef.current) return;
    const track = trackRef.current;

    if (items.length === 0) return;

    // 아이템 너비 계산
    const itemWidth = track.children[0]?.offsetWidth || 0;
    const itemMarginRight = 16; // CSS의 `mr-4`에 해당하는 값
    const w = itemWidth + itemMarginRight;

    track.style.transition = "transform 0.5s ease";
    track.style.transform = `translateX(-${idx * w}px)`;
  }, [idx, items]);

  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(count - visibleCount, i + 1));

  // 데이터가 없으면 null 반환
  if (count === 0) return null;

  return (
    <div className="horizontal-carousel-container">
      {showControls && (
        <button className="carousel-button carousel-button-prev" onClick={prev}>
          &lt;
        </button>
      )}
      <div className="carousel-viewport">
        <div className="carousel-track" ref={trackRef}>
          {slides.map((it, i) => {
            return (
              <div
                className="carousel-card"
                key={`${it.tno}-${i}`}
                style={{ width: `calc(100% / ${visibleCount})` }}
              >
                <Link to={`/donationBoard/read/${it.tno}`}>
                  <div className="card-link-wrapper">
                    <div className="card-image-wrapper">
                      {it.uploadFileNames && it.uploadFileNames.length > 0 ? (
                        <img
                          src={`${API_SERVER_HOST}/files/s_${it.uploadFileNames[0]}`}
                          alt={it.title}
                          className="card-image"
                        />
                      ) : (
                        <div className="card-no-image">이미지 없음</div>
                      )}
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{it.title}</h3>
                      <p className="card-writer">{it.writer}</p>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
      {showControls && (
        <button className="carousel-button carousel-button-next" onClick={next}>
          &gt;
        </button>
      )}
    </div>
  );
}

// RecentPostsSlider 컴포넌트
const RecentPostsSlider = () => {
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    getRecentList().then((data) => {
      if (Array.isArray(data)) {
        setRecentPosts(data);
      } else {
        console.error("API 응답 형식이 올바르지 않습니다.");
        setRecentPosts([]);
      }
    });
  }, []);

  if (recentPosts.length === 0) {
    return null;
  }

  return (
    <div className="recent-posts-slider-container">
      <h2 className="recent-posts-title">최신 기부 스토리</h2>
      <HorizontalCarousel items={recentPosts} visibleCount={2} />
    </div>
  );
};

export default RecentPostsSlider;
