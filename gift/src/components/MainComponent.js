import React, { useState, useEffect, useRef, useCallback } from "react";
import "./MainComponent.css";
import GraphComponent from "../components/GraphComponent";

// --- 데이터 정의 ---
const giftItems = [
  {
    id: 1,
    name: "스타벅스 아메리카노",
    price: 4000,
    discountRate: 10,
    imageUrl: "/sample1.png",
  },
  {
    id: 2,
    name: "투썸 카페라떼",
    price: 4500,
    discountRate: 5,
    imageUrl: "/sample2.png",
  },
  {
    id: 3,
    name: "이디야 돌체 라떼",
    price: 4200,
    discountRate: 10,
    imageUrl: "/sample3.png",
  },
  {
    id: 4,
    name: "BHC 치킨 5조각",
    price: 17000,
    discountRate: 15,
    imageUrl: "/sample4.png",
  },
  {
    id: 5,
    name: "도미노 피자",
    price: 20000,
    discountRate: 20,
    imageUrl: "/sample5.png",
  },
  {
    id: 6,
    name: "CU 기프티콘 샘플",
    price: 5000,
    discountRate: 10,
    imageUrl: "/sample6.png",
  },
];

const baskinItems = [
  {
    id: 1,
    name: "싱글킹 아이스크림",
    price: 4700,
    discountRate: 15,
    imageUrl: "/br1.png",
  },
  {
    id: 2,
    name: "파인트 아이스크림",
    price: 9000,
    discountRate: 10,
    imageUrl: "/br2.png",
  },
  {
    id: 3,
    name: "쿼터 아이스크림",
    price: 18500,
    discountRate: 12,
    imageUrl: "/br3.png",
  },
  {
    id: 4,
    name: "하프갤론",
    price: 31500,
    discountRate: 10,
    imageUrl: "/br4.png",
  },
  {
    id: 5,
    name: "아빠왔다 팩",
    price: 15600,
    discountRate: 10,
    imageUrl: "/br5.png",
  },
  {
    id: 6,
    name: "버라이어티 팩",
    price: 23400,
    discountRate: 12,
    imageUrl: "/br6.png",
  },
];

const categories = [
  { name: "배스킨라빈스", emoji: "🍨", items: baskinItems },
  { name: "도미노 피자", emoji: "🍕", items: giftItems },
  { name: "BHC", emoji: "🍗", items: giftItems },
  { name: "메가커피", emoji: "☕️", items: giftItems },
  { name: "CU", emoji: "🏪", items: giftItems },
];

// --- HorizontalCarousel 컴포넌트 ---
function HorizontalCarousel({
  items,
  visibleCount = 4,
  autoPlay = false,
  showControls = true,
}) {
  const count = items.length;
  const slides = [...items, ...items];
  const [idx, setIdx] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    if (!autoPlay) return;
    const iv = setInterval(() => setIdx((i) => i + 1), 3000);
    return () => clearInterval(iv);
  }, [autoPlay]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    // Calculate width of a single item including margin (assuming 16px right margin from CSS)
    // You might need to adjust this if your CSS for .hc-card changes its margin/padding
    const itemWidth = track.children[0]?.offsetWidth || 0;
    const itemMarginRight = 16; // Based on typical spacing, adjust if needed
    const w = itemWidth + itemMarginRight;

    track.style.transition = "transform 0.5s ease";
    track.style.transform = `translateX(-${idx * w}px)`;
    if (idx >= count) {
      setTimeout(() => {
        track.style.transition = "none";
        track.style.transform = "translateX(0)";
        setIdx(0);
      }, 500);
    }
  }, [idx, count, items]); // Added 'items' to dependency array for robust width calculation if items change

  const prev = () => setIdx((i) => (i <= 0 ? count - visibleCount : i - 1));
  const next = () => setIdx((i) => (i >= count - visibleCount ? 0 : i + 1));

  return (
    <div className={`hc-container${!showControls ? " no-controls" : ""}`}>
      {showControls && (
        <button className="hc-btn left" onClick={prev}>
          &lt;
        </button>
      )}
      <div className="hc-viewport">
        <div className="hc-track" ref={trackRef}>
          {slides.map((it, i) => {
            const sale = Math.round((it.price * (100 - it.discountRate)) / 100);
            return (
              <div className="hc-card" key={`${it.id}-${i}`}>
                <img
                  src={it.imageUrl}
                  alt={it.name}
                  className="hc-card-image"
                />
                <div className="hc-card-info">
                  <p className="hc-card-name">{it.name}</p>
                  {it.discountRate > 0 ? (
                    <>
                      <p className="hc-card-sale-price">
                        {sale.toLocaleString()}원
                      </p>
                      <p className="hc-card-original-price">
                        {it.price.toLocaleString()}원
                      </p>
                      <span className="hc-card-discount">
                        ~{it.discountRate}%
                      </span>
                    </>
                  ) : (
                    <p className="hc-card-price">
                      {it.price.toLocaleString()}원
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {showControls && (
        <button className="hc-btn right" onClick={next}>
          &gt;
        </button>
      )}
    </div>
  );
}

// --- GridPaginator 컴포넌트 ---
function GridPaginator({ items, perPage = 2 }) {
  const total = Math.ceil(items.length / perPage);
  const [page, setPage] = useState(0);
  const slice = items.slice(page * perPage, page * perPage + perPage);

  return (
    <div className="grid-paginator">
      <button
        className="grid-btn left"
        onClick={() => setPage((p) => Math.max(0, p - 1))}
        disabled={page === 0}
      >
        &lt;
      </button>
      <div className="grid-viewport">
        {slice.map((it) => {
          const sale = Math.round((it.price * (100 - it.discountRate)) / 100);
          return (
            <div className="hc-card" key={it.id}>
              <img src={it.imageUrl} alt={it.name} className="hc-card-image" />
              <div className="hc-card-info">
                <p className="hc-card-name">{it.name}</p>
                {it.discountRate > 0 ? (
                  <>
                    <p className="hc-card-sale-price">
                      {sale.toLocaleString()}원
                    </p>
                    <p className="hc-card-original-price">
                      {it.price.toLocaleString()}원
                    </p>
                    <span className="hc-card-discount">
                      ~{it.discountRate}%
                    </span>
                  </>
                ) : (
                  <p className="hc-card-price">{it.price.toLocaleString()}원</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <button
        className="grid-btn right"
        onClick={() => setPage((p) => Math.min(total - 1, p + 1))}
        disabled={page === total - 1}
      >
        &gt;
      </button>
      <div className="paging">
        {page + 1} / {total}
      </div>
    </div>
  );
}

// --- MainPage 컴포넌트 ---
export default function MainPage() {
  // States from the first MainPage (gift items, carousels, infinite scroll)
  const [visible, setVisible] = useState(1);
  const loadRef = useRef();
  const onIntersect = useCallback(
    ([entry]) => {
      if (entry.isIntersecting && visible < categories.length) {
        setVisible((v) => v + 1);
      }
    },
    [visible]
  );
  useEffect(() => {
    const obs = new IntersectionObserver(onIntersect, { threshold: 1.0 });
    if (loadRef.current) obs.observe(loadRef.current);
    return () => obs.disconnect();
  }, [onIntersect]);

  return (
    <>
      {/* 그래프 컴포넌트 */}
      <GraphComponent />
      {/* Hot Deal Section */}
      <h2 className="section-title">🔥 Hot deal 🔥</h2>
      <HorizontalCarousel
        items={giftItems}
        visibleCount={4}
        autoPlay
        showControls={false}
      />

      {/* Category Sections with Infinite Scroll */}
      {categories.slice(0, visible).map((cat) => (
        <section key={cat.name} className="category-section">
          <h3 className="category-title">
            {cat.emoji} {cat.name}
          </h3>
          <GridPaginator items={cat.items} perPage={2} />
        </section>
      ))}
      <div ref={loadRef} style={{ height: 1 }} />
    </>
  );
}
