import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSearch } from "../../context/SearchContext";
import "./ListComponent.css";

const ListComponent = () => {
  const {
    searchResults,
    isLoading,
    displayTerm,
    performTextSearch,
    initialProducts,
    isInitialLoading,
  } = useSearch();

  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  //페이지 내 검색창 실행 함수
  const handleSearch = () => {
    performTextSearch(searchTerm);

    setSearchTerm("");
  };

  useEffect(() => {
    setSearchTerm("");
  }, [location.pathname]);

  const hasSearched = displayTerm && displayTerm.length > 0;
  const itemsToDisplay =
    hasSearched && searchResults.length > 0
      ? searchResults // 검색 결과가 있다면 검색 결과를 보여줌
      : initialProducts; // 그 외의 경우 전체 상품 목록

  const searchResult =
    hasSearched && searchResults.length > 0
      ? `'${displayTerm}' 검색 결과`
      : "상품 리스트";

  if (isLoading || (hasSearched === false && isInitialLoading)) {
    return <div>상품을 불러오는 중...</div>;
  }

  return (
    <>
      <h1>상품 검색 폰트 유하게</h1>

      {/* 검색창 */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder={"원하는 상품 또는 브랜드를 검색하세요"}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="search-input"
          />
        </div>

        <button onClick={handleSearch} className="search-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="search-icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </button>
      </div>

      {/* 검색결과 없을 시 */}
      {hasSearched && searchResults.length === 0 && (
        <div className="no-items">
          <p className="no-items-text-bold">
            '{displayTerm}'에 대한 검색 결과가 없습니다.
          </p>
          <p className="no-items-text-sub">
            기프리에서 판매중인 다른 상품을 만나보세요.
          </p>
        </div>
      )}
      <div className="selling-page">
        <h2>{searchResult}</h2>

        {/* 제품 리스트 */}
        <ul className="product-list">
          {itemsToDisplay.map((item) => {
            const hasDiscount =
              item.salePrice != null &&
              item.discountRate != null &&
              item.discountRate > 0;
            return (
              <li key={item.pno} className="product-card">
                <Link to={`/selling/read/${item.pno}`} className="product-link">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.pname}
                      className="product-image"
                    />
                  )}
                  <p className="brand">
                    {item.brand ??
                      (item.pname ? item.pname.split(" ")[0] : "알 수 없음")}
                  </p>
                  <p className="title">{item.pname}</p>
                  {hasDiscount ? (
                    <p className="price">
                      <span className="discount">~{item.discountRate}%</span>
                      <span className="sale-price">
                        {item.salePrice.toLocaleString()}원
                      </span>
                      <span className="original-price">
                        {item.price.toLocaleString()}원
                      </span>
                    </p>
                  ) : (
                    <p className="price">
                      {item.price?.toLocaleString() ?? "가격 정보 없음"}원
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};
export default ListComponent;
