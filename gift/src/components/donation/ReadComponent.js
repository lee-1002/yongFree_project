import { useEffect, useState } from "react";
import { getOne } from "../../api/donationBoardApi";
import useCustomMove from "../../hooks/useCustomMove";
import { Link } from "react-router-dom";
import "quill/dist/quill.snow.css";
import "./ReadComponent.css";

const initState = {
  tno: 0,
  title: "",
  writer: "",
  content: "",
  dueDate: null,
  complete: false,
};
const basePath = "/donationBoard";

const ReadComponent = ({ tno }) => {
  const [donationBoard, setDonationBoard] = useState(initState);
  const { moveToModify } = useCustomMove();

  useEffect(() => {
    getOne(tno).then((data) => {
      console.log(data);
      setDonationBoard(data);
    });
  }, [tno]);

  return (
    <>
      <div className="flex flex-col items-center p-4 w-full">
        {/* 제목 섹션 */}
        <h1 className="text-3xl font-bold mb-4">{donationBoard.title}</h1>
        <hr className="w-full my-4 border-gray-300" />

        {/* 내용 섹션 */}
        <div className="w-full px-4 ql-editor">
          <div dangerouslySetInnerHTML={{ __html: donationBoard.content }} />
        </div>

        {/* 작성자 섹션 */}
        <hr className="w-full my-4 border-gray-300" />
        <div className="text-center text-sm text-gray-600 mb-4">
          작성자: {donationBoard.writer}
        </div>

        {/* 버튼 섹션 */}
        <div className="flex justify-center p-4 w-full">
          <button
            type="button"
            className="rounded p-4 m-2 text-xl w-34 text-white bg-red-500 text-center"
            onClick={() => moveToModify(tno, basePath)}
          >
            게시글 수정
          </button>
          <Link
            to="/donationBoard"
            className="rounded p-4 m-2 text-xl w-34 text-white bg-blue-500 text-center"
          >
            게시글 목록
          </Link>
        </div>
      </div>
    </>
  );
};

export default ReadComponent;
