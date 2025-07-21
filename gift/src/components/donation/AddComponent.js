import { useState } from "react";
import { postAdd } from "../../api/donationBoardApi";
import useCustomMove from "../../hooks/useCustomMove";
//Quill 에디터 기본 스타일시트(수정시 관리자가 글자 세부 지정 가능토록)npm install react-quill quill
import Quill from "react-quill";
import "react-quill/dist/quill.snow.css";

const initState = {
  title: "",
  writer: "",
  content: "",
  dueDate: null,
  complete: false,
};

const AddComponent = () => {
  const [donationBoard, setDonationBoard] = useState({ ...initState });

  const { moveToList } = useCustomMove();

  const handleChangeDonationBoard = (e) => {
    const { name, value } = e.target;
    setDonationBoard((prev) => ({
      // 이전 상태를 활용하여 업데이트
      ...prev,
      [name]: value,
    }));
  };

  const handleQuillChange = (htmlContent) => {
    setDonationBoard((prev) => ({
      ...prev,
      content: htmlContent, // Quill이 반환하는 HTML 내용을 content 필드에 저장
    }));
  };

  const handleClickAdd = () => {
    console.log("handleClickAdd 호출됨!");
    console.log("현재 donationBoard 상태:", donationBoard); // <-- 이 부분을 추가해서 확인
    console.log("content 내용:", donationBoard.content);
    postAdd(donationBoard)
      .then((result) => {
        console.log(result);
        alert("게시글이 성공적으로 등록되었습니다!");
        setDonationBoard({ ...initState });
        moveToList();
      })
      .catch((e) => {
        console.error(e);
        alert("게시글 등록에 실패했습니다. 다시 시도해주세요.");
      });
  };

  return (
    <div className="border-2 border-sky-200 mt-10 p-4 mx-auto max-w-4xl px-12">
      {" "}
      {/* max-w-4xl로 늘리고 px-12 (48px) 적용 */}
      {/* 모달 처리 */}
      <p className="text-2xl font-bold mb-6 text-center">게시글 작성</p>
      <div className="space-y-4">
        {/* 작성자 (Writer) */}
        <div className="flex flex-col items-start w-full">
          {" "}
          {/* mx-auto max-w-lg 제거하고 w-full 적용 */}
          <div className="p-1 font-bold">작성자</div>
          <input
            className="w-full p-3 rounded-md border border-solid border-neutral-300 focus:border-blue-500 focus:ring focus:ring-blue-200 shadow-sm"
            name="writer"
            type="text"
            value={donationBoard.writer}
            onChange={handleChangeDonationBoard}
            placeholder="작성자를 입력해주세요."
          />
        </div>

        {/* 제목 (Title) */}
        <div className="flex flex-col items-start w-full">
          {" "}
          {/* mx-auto max-w-lg 제거하고 w-full 적용 */}
          <div className="p-1 font-bold">제목</div>
          <input
            className="w-full p-3 rounded-md border border-solid border-neutral-300 focus:border-blue-500 focus:ring focus:ring-blue-200 shadow-sm"
            name="title"
            type="text"
            value={donationBoard.title}
            onChange={handleChangeDonationBoard}
            placeholder="제목을 입력해주세요."
          />
        </div>

        {/* 내용 (Content) */}
        <div className="flex flex-col items-start w-full">
          {" "}
          {/* mx-auto max-w-lg 제거하고 w-full 적용 */}
          <div className="p-1 font-bold">내용</div>
          <Quill
            className="w-full border border-solid border-neutral-300 rounded-md shadow-sm"
            style={{ height: "700px" }}
            theme="snow" // 툴바와 에디터 영역이 분리된 테마
            value={donationBoard.content} // donationBoard 상태의 content와 연결
            onChange={handleQuillChange} // 내용 변경 시 handleQuillChange 호출
            placeholder="내용을 입력해주세요."
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ align: [] }],
                ["link", "image"],
                [{ color: [] }, { background: [] }],
                ["clean"],
              ],
            }}
            formats={[
              "header",
              "bold",
              "italic",
              "underline",
              "strike",
              "list",
              "bullet",
              "align",
              "link",
              "image",
              "color",
              "background",
              "clean",
            ]}
          />
          {/* Quill 에디터의 높이 문제 해결을 위한 공간 (Quill 자체 height가 커졌으므로 조정) */}
          <div className="h-4"></div>{" "}
          {/* 700px로 늘렸기 때문에 h-12에서 h-4로 줄임 */}
        </div>
      </div>
      <div className="flex justify-center mt-6 text-gray-600">
        날짜는 자동 생성 목록에서 자동 생성되도록
      </div>
      <div className="flex justify-center mt-6">
        <button
          type="button"
          className="rounded px-8 py-3 bg-blue-500 text-xl text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
          onClick={handleClickAdd}
        >
          등록
        </button>
      </div>
    </div>
  );
};

export default AddComponent;
