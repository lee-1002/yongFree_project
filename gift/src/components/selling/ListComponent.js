import { useEffect, useState } from "react";
import { getList } from "../../api/productsApi";
import useCustomMove from "../../hooks/useCustomMove";
import FetchingModal from "../common/FetchingModal";
import { API_SERVER_HOST } from "../../api/todoApi";
import useCustomLogin from "../../hooks/useCustomLogin";
import { Link } from "react-router-dom";
import "./ListComponent.css";

const host = API_SERVER_HOST;

const SORT_OPTIONS = [
  { key: "low", label: "낮은 가격순" },
  { key: "high", label: "높은 가격순" },
];

const BRAND_CATEGORIES = [
  { label: "커피/음료", items: ["스타벅스", "컴포즈", "메가커피"] },
  { label: "베이커리/도넛", items: ["파리바게뜨", "뚜레쥬르", "던킨"] },
  { label: "아이스크림", items: ["배스킨라빈스", "요거트아이스크림의정석"] },
  { label: "버거/피자/치킨", items: ["BBQ", "도미노피자", "교촌치킨"] },
  { label: "편의점", items: ["GS25", "CU"] },
];

const initState = {
  dtoList: [],
  pageNumList: [],
  pageRequestDTO: null,
  prev: false,
  next: false,
  totoalCount: 0,
  prevPage: 0,
  nextPage: 0,
  totalPage: 0,
  current: 0,
};

const ListComponent = () => {
  const { page, size, refresh, moveToRead } = useCustomMove();
  const { exceptionHandle } = useCustomLogin();

  const [serverData, setServerData] = useState(initState);
  const [fetching, setFetching] = useState(false);

  const [brandFilter, setBrandFilter] = useState(null);
  const [sortKey, setSortKey] = useState("low");
  const [visibleCount, setVisibleCount] = useState(20);

  // 상품 목록 로딩
  useEffect(() => {
    setFetching(true);
    console.log("📦 Calling getList with params:", { page, size });

    getList({ page, size })
      .then((data) => {
        console.log("✅ getList response:", data);
        setServerData(data);
        setVisibleCount(20);
        setFetching(false);
      })
      .catch((err) => {
        console.error("❌ getList error:", err);
        exceptionHandle(err);
      });
  }, [page, size, refresh, brandFilter, sortKey]);

  // 무한스크롤 처리
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 100 &&
        !fetching &&
        visibleCount < (serverData.dtoList?.length ?? 0)
      ) {
        setFetching(true);
        setTimeout(() => {
          setVisibleCount((prev) => prev + 20);
          setFetching(false);
        }, 500);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetching, visibleCount, serverData.dtoList?.length]);

  const sortFns = {
    low: (a, b) => a.price - b.price,
    high: (a, b) => b.price - a.price,
  };

  const filteredAndSorted = (serverData.dtoList || [])
    .filter((p) =>
      brandFilter
        ? p.brand === brandFilter || p.pname.includes(brandFilter)
        : true
    )
    .sort(sortFns[sortKey]);

  const displayedItems = filteredAndSorted.slice(0, visibleCount);

  return (
    <>
      <div className="add-button-container">
        <Link to="/selling/add" className="add-button">
          ADD
        </Link>
      </div>
      <div className="selling-page">
        {fetching && <FetchingModal />}

        {/* 카테고리 필터 */}
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

        {/* 정렬 옵션 */}
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
          {displayedItems.map((product) => {
            const hasDiscount =
              product.salePrice != null &&
              product.discountRate != null &&
              product.discountRate > 0;

            return (
              <li
                key={product.pno}
                className="product-card"
                onClick={() => moveToRead(product.pno)}
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
                        {product.price.toLocaleString()}원
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

          {displayedItems.length === 0 && (
            <li className="no-items">선택한 브랜드의 상품이 없습니다.</li>
          )}
        </ul>
      </div>
    </>
  );
};

export default ListComponent;
