import React, { useState } from "react";
import "./RandomBoxComponent.css";
// import { drawRandomBoxProduct } from "../api/productsApi.js"; // 이 부분은 주석 처리하거나 삭제
import { getList } from "../api/productsApi.js"; // getList를 임포트합니다.
import { API_SERVER_HOST } from "../api/backendApi"; // 이미지 경로를 위해 필요합니다.

const host = API_SERVER_HOST; // 이미지 호스트 정의

const rarityConfig = {
  names: {
    low: "하",
    middle: "중",
    high: "상",
  },
};

const ProbabilityIndicator = () => {
  return (
    <div className="probability-container">
      <div>확률 안내 (백엔드 정책 적용)</div>
      <span className="probability-item low">하</span>
      <span className="probability-item middle">중</span>
      <span className="probability-item high">상</span>
    </div>
  );
};

const GachaButton = ({ onClick, isOpening, disabled }) => {
  return (
    <button
      className={`gacha-box ${isOpening ? "opening" : ""} ${
        disabled ? "disabled" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {isOpening ? "🎁 열고 있는 중..." : "📦 랜덤박스 열기!"}
    </button>
  );
};

const ItemCard = ({ item }) => {
  if (!item) {
    return (
      <div className="waiting-message">랜덤박스를 열어 상품을 확인하세요!</div>
    ); // 메시지 변경
  }

  return (
    <div className={`card`}>
      {/* 상품 이미지를 표시하려면 아래 주석을 해제하고 사용하세요. */}
      {item.uploadFileNames?.length > 0 && (
        <img
          alt="product"
          className="card-image" // CSS에 .card-image 스타일 추가 필요
          src={`${host}/api/products/view/s_${item.uploadFileNames[0]}`}
        />
      )}
      <div className="card-name">{item.pname}</div>
      <div className="card-rarity">
        {rarityConfig.names[getRarityByPrice(item.price)]}
      </div>
      <div className="card-description">{item.pdesc}</div>
      <div className="card-price">가격: {item.price.toLocaleString()} 원</div>
    </div>
  );
};

const getRarityByPrice = (price) => {
  if (price >= 20000) return "high";
  if (price >= 10000) return "middle";
  return "low";
};

const WaitingMessage = () => (
  <div className="waiting-message">상품이 나오고 있습니다...!</div>
);

const EmptyMessage = () => (
  <div className="empty-message">
    랜덤박스가 비어있거나 상품을 찾을 수 없습니다.
  </div> // 메시지 변경
);

const RandomBoxComponent = () => {
  const [currentItem, setCurrentItem] = useState(null);
  const [isOpening, setIsOpening] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const handleOpenBox = async () => {
    console.log("handleOpenBox 함수 호출됨");
    setIsOpening(true);
    setIsWaiting(true);
    setIsEmpty(false);
    setCurrentItem(null);

    try {
      // getList를 사용하여 상품 목록을 가져옵니다.
      // 여기서는 1페이지만 가져와서 그 중 하나를 랜덤으로 선택합니다.
      const response = await getList({ page: 1, size: 100 }); // 충분히 많은 상품을 가져오도록 size를 늘립니다.

      if (!response.dtoList || response.dtoList.length === 0) {
        setIsEmpty(true);
      } else {
        // 가져온 상품 목록에서 랜덤으로 하나의 상품을 선택합니다.
        const randomIndex = Math.floor(Math.random() * response.dtoList.length);
        const randomProduct = response.dtoList[randomIndex];
        setCurrentItem(randomProduct);
      }
    } catch (err) {
      // getList에서 발생할 수 있는 오류 처리
      alert("상품 목록을 불러오는 데 실패했습니다.");
      console.error("Failed to fetch product list:", err);
      setIsEmpty(true); // 에러 발생 시 비어있다고 표시
    } finally {
      setTimeout(() => {
        setIsOpening(false);
        setIsWaiting(false);
      }, 800);
    }
  };

  return (
    <div className="random-box-container">
      <div className="main-card">
        <h1 className="title">🎁 랜덤박스 열기</h1>

        <ProbabilityIndicator />

        <GachaButton
          onClick={handleOpenBox}
          isOpening={isOpening}
          disabled={isOpening}
        />

        <div className="card-result">
          {isWaiting ? (
            <WaitingMessage />
          ) : isEmpty ? (
            <EmptyMessage />
          ) : (
            <ItemCard item={currentItem} />
          )}
        </div>
      </div>
    </div>
  );
};

export default RandomBoxComponent;
