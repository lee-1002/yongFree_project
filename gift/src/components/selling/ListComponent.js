// src/components/ListComponent.js

import { useEffect, useState, useRef } from "react";
import { getList } from "../../api/productsApi";
import useCustomMove from "../../hooks/useCustomMove";
import FetchingModal from "../common/FetchingModal";
import { API_SERVER_HOST } from "../../api/backendApi";
import useCustomLogin from "../../hooks/useCustomLogin";
import { Link } from "react-router-dom";
import "./ListComponent.css";

const host = API_SERVER_HOST;

const SORT_OPTIONS = [
  { key: "low", label: "낮은 가격순" },
  { key: "high", label: "높은 가격순" },
  { key: "discountLow", label: "최저 할인" },
  { key: "discountHigh", label: "최대 할인" },
];

const BRAND_CATEGORIES = [
  { label: "커피/음료", items: ["스타벅스", "컴포즈", "메가커피"] },
  { label: "베이커리/도넛", items: ["파리바게뜨", "뚜레쥬르", "던킨"] },
  { label: "아이스크림", items: ["배스킨라빈스", "요거트아이스크림의정석"] },
  { label: "버거/피자/치킨", items: ["BBQ", "도미노피자", "교촌치킨"] },
  { label: "편의점", items: ["GS25", "CU"] },
];

const ListComponent = () => {
  const { moveToRead } = useCustomMove();
  const { exceptionHandle } = useCustomLogin();

  const [dtoList, setDtoList] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [brandFilter, setBrandFilter] = useState(null);
  const [sortKey, setSortKey] = useState("low");

  const [page, setPage] = useState(1);
  const size = 20; // 한 번에 20개씩

  const sentinelRef = useRef(null);

  // 1) 페이지 변화 시 데이터 페칭
  useEffect(() => {
    setFetching(true);
    getList({ page, size })
      .then((data) => {
        const list = data.dtoList || [];
        if (list.length < size) {
          setHasMore(false);
        }
        setDtoList((prev) => [...prev, ...list]);
      })
      .catch((err) => exceptionHandle(err))
      .finally(() => setFetching(false));
  }, [page]);

  // 2) IntersectionObserver 로 무한스크롤 트리거
  useEffect(() => {
    if (!hasMore || fetching) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [hasMore, fetching]);

  // 3) 필터 & 정렬
  const sortFns = {
    low: (a, b) => a.price - b.price,
    high: (a, b) => b.price - a.price,
    discountLow: (a, b) => (a.discountRate || 0) - (b.discountRate || 0),
    discountHigh: (a, b) => (b.discountRate || 0) - (a.discountRate || 0),
  };

  const filteredAndSorted = dtoList
    .filter((p) =>
      brandFilter
        ? p.brand === brandFilter || p.pname.includes(brandFilter)
        : true
    )
    .sort(sortFns[sortKey]);

  return (
    <>
      <div className="add-button-container">
        <Link to="/selling/add" className="add-button">
          ADD
        </Link>
      </div>

      <div className="selling-page">
        {fetching && <FetchingModal />}

        {/* 카테고리 메뉴 */}
        <div className="category-menu">
          <div className="category-column">
            <h4>전체</h4>
            <ul>
              <li
                className={brandFilter === null ? "active" : ""}
                onClick={() => setBrandFilter(null)}
              >
                전체
              </li>
            </ul>
          </div>
          {BRAND_CATEGORIES.map((cat) => (
            <div key={cat.label} className="category-column">
              <h4>{cat.label}</h4>
              <ul>
                {cat.items.map((name) => (
                  <li
                    key={name}
                    className={brandFilter === name ? "active" : ""}
                    onClick={() =>
                      setBrandFilter((cur) => (cur === name ? null : name))
                    }
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 정렬 메뉴 */}
        <ul className="sort-menu">
          {SORT_OPTIONS.map((opt) => (
            <li
              key={opt.key}
              className={opt.key === sortKey ? "active" : ""}
              onClick={() => setSortKey(opt.key)}
            >
              {opt.label}
            </li>
          ))}
        </ul>

        {/* 상품 리스트 */}
        <ul className="product-list">
          {filteredAndSorted.map((product) => {
            const hasDiscount =
              product.salePrice != null &&
              product.discountRate != null &&
              product.discountRate > 0;

            return (
              <li
                key={product.pno}
                className="product-card"
                onClick={() => moveToRead(product.pno, "/selling")}
                style={{ cursor: "pointer" }}
              >
                <div className="product-link">
                  {product.uploadFileNames?.length > 0 && (
                    <img
                      alt="product"
                      className="product-image"
                      src={`${host}/api/products/view/s_${product.uploadFileNames[0]}`}
                    />
                  )}
                  <p className="title">
                    {product.brand && !product.pname.startsWith(product.brand)
                      ? `${product.brand} ${product.pname}`
                      : product.pname}
                  </p>
                  {hasDiscount ? (
                    <p className="price">
                      <span className="discount">~{product.discountRate}%</span>
                      <span className="sale-price">
                        {product.salePrice.toLocaleString()}원
                      </span>
                      <span className="original-price">
                        <s>{product.price.toLocaleString()}원</s>
                      </span>
                    </p>
                  ) : (
                    <p className="price">
                      {product.price?.toLocaleString() ?? "가격 정보 없음"}원
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* sentinel: 뷰포트 근처에 들어올 때만 다음 페이지 로드 */}
        <div ref={sentinelRef} />

        {/* 로딩/끝 메시지 */}
        {!fetching && filteredAndSorted.length === 0 && (
          <div className="no-items">선택한 브랜드의 상품이 없습니다.</div>
        )}
      </div>
    </>
  );
};

export default ListComponent;
