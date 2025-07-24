import React, { useCallback } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import "./IndexComponent.css";

const IndexComponent = () => {
  const navigate = useNavigate();

  const handleClickAdd = useCallback(() => {
    navigate({ pathname: "add" });
  }, [navigate]);

  return (
    <>
      <div className="donationBoard-main-iamge-box">
        <img
          src={"donationBoardMain.jpg"}
          alt="기부 페이지 메인 이미지"
          className="donation-main-image"
        />
      </div>
      <div className="index-container">
        <button className="donation-write-button" onClick={handleClickAdd}>
          글쓰기 (관리자 전용)
        </button>
        <div className="donation-story-title-container">
          <div className="donation-story-title">기부 스토리</div>
          <div className="donation-story-title-sub">
            작은 기부, 큰 변화의 시작
            {/* 작은 기부가 모여 세상을 바꾸는 큰 변화의 시작이 됩니다. 여러분의 작은 나눔이 누군가에게는 희망의 빛이 되고, 더 나은 미래를 만드는 소중한 한 걸음이 될 것입니다. 함께하는 마음으로 세상을 따뜻하게 변화시켜 나가요. */}
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
};

export default IndexComponent;
