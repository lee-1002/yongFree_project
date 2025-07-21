import { useNavigate } from "react-router-dom";

const useCustomMove = () => {
  const navigate = useNavigate();

  // 상세 페이지 이동
  const moveToRead = (num) => {
    navigate(`/selling/read/${num}`);
  };

  // 리스트 페이지 이동 (예: /selling/list?page=1)
  const moveToList = (params) => {
    const page = params?.page || 1;
    navigate(`/selling/list?page=${page}`);
  };

  return { moveToRead, moveToList };
};

export default useCustomMove;
