import { useEffect, useState } from "react";
import { getList } from "../../api/donationBoardApi";
import useCustomMove from "../../hooks/useCustomMove";
import PageComponent from "../common/PageComponent";

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

const ListComponent = () => {
  const { page, size, refresh, moveToList, moveToRead } = useCustomMove();

  const [serverData, setServerData] = useState(initState);

  useEffect(() => {
    getList({ page, size })
      .then((data) => {
        console.log("API 응답 데이터:", data); // ① 여기서 실제 응답 데이터 구조 확인
        // data가 객체이고, dtoList 속성이 있으며, dtoList가 배열인지 확인
        if (data && Array.isArray(data.dtoList)) {
          setServerData(data);
        } else {
          // ② 응답 데이터가 예상과 다를 경우 처리 (예: 에러 로그, 기본값 설정)
          console.error(
            "API 응답 형식이 예상과 다릅니다. dtoList가 없거나 배열이 아닙니다:",
            data
          );
          setServerData({ ...initState, totalCount: data?.totalCount || 0 }); // 최소한 totalCount는 업데이트
        }
      })
      .catch((error) => {
        // ③ API 호출 자체에서 에러가 발생한 경우 처리
        console.error("데이터를 가져오는 중 오류 발생:", error);
        setServerData(initState); // 에러 발생 시 초기 상태로 리셋
      });
  }, [page, size, refresh]);

  return (
    <div className="border-2 border-blue-100 mt-10 mr-2 ml-2">
      <div className="flex flex-wrap mx-auto justify-center p-6">
        {/* serverData.dtoList가 항상 배열임을 확신할 수 있으므로 안전하게 map 사용 */}
        {serverData.dtoList.length > 0 ? (
          serverData.dtoList.map((donationBoard) => (
            <div
              key={donationBoard.tno}
              className="w-full min-w-[400px]  p-2 m-2 rounded shadow-md"
              onClick={() => moveToRead(donationBoard.tno)}
            >
              <div className="flex ">
                <div className="font-extrabold text-2xl p-2 w-1/12">
                  {donationBoard.tno}
                </div>
                <div className="text-1xl m-1 p-2 w-8/12 font-extrabold">
                  {donationBoard.title}
                </div>
                <div className="text-1xl m-1 p-2 w-2/10 font-medium">
                  {donationBoard.dueDate}
                </div>
              </div>
            </div>
          ))
        ) : (
          // dtoList가 비어있을 때 (데이터 없음 또는 로딩 중) 표시할 내용
          <div className="text-center text-gray-500 py-10">
            데이터가 없습니다.
          </div>
        )}
      </div>
      <PageComponent
        serverData={serverData}
        movePage={moveToList}
      ></PageComponent>
    </div>
  );
};

export default ListComponent;
