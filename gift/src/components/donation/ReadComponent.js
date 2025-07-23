import { useEffect, useState } from "react";
import { getOne } from "../../api/donationBoardApi";
import useCustomMove from "../../hooks/useCustomMove";
import { Link } from "react-router-dom";
import "quill/dist/quill.snow.css";

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
  // const [fetching, setFetching] = useState(false);
  const { moveToModify } = useCustomMove();

  useEffect(() => {
    getOne(tno).then((data) => {
      console.log(data);
      setDonationBoard(data);
      // setFetching(false);
    });
  }, [tno]);

  const makeDiv = (title, value) => (
    <div className="flex justify-center">
      <div className="relative mb-4 flex w-full flex-wrap items-stretch">
        <div className="w-1/5 p-6 text-right font-bold">{title}</div>
        {title === "Content" ? (
          <div
            className="w-4/5 p-6 rounded-r border border-solid shadow-md bg-white ql-editor" // ⭐ 여기에 ql-editor 클래스 추가
            style={{ minHeight: "300px" }}
            dangerouslySetInnerHTML={{ __html: value }}
          ></div>
        ) : (
          <div className="w-4/5 p-6 rounded-r border border-solid shadow-md bg-gray-100">
            {value}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div>
        <span>게시글</span>
      </div>
      <div className="border-2 border-sky-200 mt-10 m-2 p-4 ">
        {makeDiv("Tno", donationBoard.tno)}
        {makeDiv("Writer", donationBoard.writer)}
        {makeDiv("Title", donationBoard.title)}
        {makeDiv("Due Date", donationBoard.dueDate)}
        {makeDiv("Content", donationBoard.content)}
        {makeDiv("Complete", donationBoard.complete ? "Completed" : "Not Yet")}

        {/* Quill 에디터 스타일을 강제로 적용하기 위해 !important로 우선순위 */}
        <style>
          {`
            .ql-editor {
              min-height: 300px;
              line-height: 1.42;
              font-size: 16px;
              color: #000;
              padding: 12px 15px !important;
            }

            .ql-editor h1 {
              font-size: 2em !important;
              margin: 0.67em 0 !important;
              font-weight: bold !important;
            }

            .ql-editor p {
              margin: 0 0 1em 0 !important;
            }
            
            .ql-editor img {
              max-width: 100% !important;
              height: auto !important;
              display: block !important;
              margin: 10px auto !important;
              border: 1px solid #ddd !important;
              object-fit: contain !important;
            }
          `}
        </style>
        <div className="flex justify-end p-4">
          <button
            type="button"
            className="rounded p-4 m-2 text-xl w-34 text-white bg-red-500 text-center"
            onClick={() => moveToModify(tno, basePath)}
          >
            게시글 수정
          </button>
          <div className="flex justify-end p-4">
            <Link
              to="/donationBoard"
              className="rounded p-4 m-2 text-xl w-34 text-white bg-blue-500 text-center"
            >
              게시글 목록
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReadComponent;
