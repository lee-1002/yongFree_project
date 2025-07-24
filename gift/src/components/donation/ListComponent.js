import { useCallback, useEffect, useState } from "react";
import { getList, getRecentList } from "../../api/donationBoardApi";
import useCustomMove from "../../hooks/useCustomMove";
import PageComponent from "../common/PageComponent";
import { API_SERVER_HOST } from "../../api/todoApi";
import RecentPostsSlider from "./RecentPostsSlider";
import "./ListComponent.css";
import { useNavigate } from "react-router-dom";

const initState = {
  dtoList: [],
  pageNumList: [],
  pageRequestDTO: null,
  prev: false,
  next: false,
  totalCount: 0,
  prevPage: 0,
  nextPage: 0,
  totalPage: 0,
  current: 0,
};

const IMAGE_BASE_URL = `${API_SERVER_HOST}/files`;

const getPlainText = (htmlString) => {
  if (!htmlString) return "";
  // 정규식을 사용해 모든 HTML 태그를 제거
  const plainText = htmlString.replace(/<[^>]*>?/gm, "").trim();
  // 추출된 텍스트가 비어있으면 null을 반환
  return plainText || null;
};
const ListComponent = () => {
  const { page, size, refresh, moveToList, moveToRead } = useCustomMove();
  const [serverData, setServerData] = useState(initState);
  const [recentPosts, setRecentPosts] = useState([]);
  const navigate = useNavigate();

  const handleClickAdd = useCallback(() => {
    navigate({ pathname: "add" });
  }, [navigate]);

  useEffect(() => {
    getList({ page, size: 12 })
      .then((data) => {
        console.log("API 응답 데이터:", data);
        if (data && Array.isArray(data.dtoList)) {
          // 아이템이 12개 미만일 경우 빈 아이템으로 채우기
          const filledDtoList = [...data.dtoList];
          const emptyCount = 12 - filledDtoList.length;
          if (emptyCount > 0 && filledDtoList.length > 0) {
            // ⭐ 아이템이 하나라도 있어야 채움
            for (let i = 0; i < emptyCount; i++) {
              filledDtoList.push({ tno: `empty-${i}`, empty: true }); // 빈 아이템 추가
            }
          }
          setServerData({ ...data, dtoList: filledDtoList });
        } else {
          console.error(
            "API 응답 형식이 예상과 다릅니다. dtoList가 없거나 배열이 아닙니다:",
            data
          );
          setServerData(initState);
        }
      })
      .catch((error) => {
        console.error("데이터를 가져오는 중 오류 발생:", error);
        setServerData(initState);
      });
    getRecentList()
      .then((data) => {
        if (Array.isArray(data)) {
          setRecentPosts(data);
        } else {
          console.error("최신 게시글 응답 형식이 올바르지 않습니다.");
          setRecentPosts([]);
        }
      })
      .catch((error) => {
        console.error("최신 게시글 목록을 가져오는 중 오류 발생:", error);
        // 이 에러가 401 Unauthorized 에러입니다.
        setRecentPosts([]);
      });
  }, [page, size, refresh]);

  return (
    <>
      <div className="donationBoard-main-iamge-box">
        <img src={"donationBoardMain.jpg"} alt="기부 페이지 메인 이미지" />
        <div className="index-container">
          <div className="donation-story-title-container">
            <div className="donation-story-title">기부 스토리</div>
            <div className="donation-story-title-sub">
              작은 기부, 큰 변화의 시작
            </div>
          </div>
        </div>
      </div>
      <button className="donation-write-button" onClick={handleClickAdd}>
        글쓰기 (관리자 전용)
      </button>

      <RecentPostsSlider />
      <div className="donation-board-container">
        <div className="donation-list-wrap">
          {serverData.dtoList.length > 0 ? (
            serverData.dtoList.map((donationBoard) => (
              <div
                key={donationBoard.tno}
                className="donation-item"
                onClick={() => moveToRead(donationBoard.tno, "/donationBoard")}
              >
                {/* 이미지를 위한 컨테이너 (위쪽에 배치) */}
                <div className="donation-image-container">
                  {donationBoard.uploadFileNames &&
                  donationBoard.uploadFileNames.length > 0 ? (
                    <img
                      src={`${IMAGE_BASE_URL}/s_${donationBoard.uploadFileNames[0]}`}
                      alt={donationBoard.title}
                      className="donation-image"
                    />
                  ) : (
                    <div className="no-image-placeholder">
                      <span>이미지</span>
                    </div>
                  )}
                </div>

                {/* 텍스트를 위한 컨테이너 (아래쪽에 배치) */}
                <div className="donation-text-container">
                  <div className="donation-board-title">
                    {donationBoard.title}
                  </div>
                  <div className="donation-board-context">
                    {donationBoard.content &&
                      getPlainText(donationBoard.content)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data-message">데이터가 없습니다.</div>
          )}
        </div>
        <PageComponent
          serverData={serverData}
          movePage={(pageObj) => {
            const pageNum = pageObj.page;
            console.log("movePage 호출, pageNum:", pageNum);
            moveToList("/donationBoard", { page: pageNum, size: 12 });
          }}
        ></PageComponent>
      </div>
    </>
  );
};
export default ListComponent;
