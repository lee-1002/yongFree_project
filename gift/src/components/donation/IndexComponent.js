import React, { useCallback } from "react";
import { useNavigate, Outlet } from "react-router-dom";

const IndexComponent = () => {
  const navigate = useNavigate();

  const handleClickAdd = useCallback(() => {
    navigate({ pathname: "add" });
  }, [navigate]);

  return (
    <>
      <div className="w-full flex m-2 p-2 relative items-center">
        {/* 글쓰기 버튼 - 왼쪽 하단 */}
        <div
          className="absolute right-0 bottom-0 text-xl p-2 w-30 font-extrabold text-center underline cursor-pointer"
          onClick={handleClickAdd}
        >
          글쓰기 (관리자 전용)
        </div>

        {/* 기부 스토리 - 중앙 */}
        <div className="flex-grow flex justify-center items-center">
          <span className="text-4xl font-bold">기부 스토리</span>
        </div>
      </div>
      <Outlet />
    </>
  );
};

export default IndexComponent;
