import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addImageFilesForBoard,
  deleteOne,
  getOne,
  putOne,
} from "../../api/donationBoardApi";
import ResultModal from "../common/ResultModal";
import useCustomMove from "../../hooks/useCustomMove";
import Quill from "react-quill";
import "react-quill/dist/quill.snow.css";
import jwtAxios from "../../util/jwtUtil";
import { API_SERVER_HOST } from "../../api/backendApi";

const initState = {
  tno: 0,
  title: "",
  writer: "",
  content: "",
  complete: false,
  uploadFileNames: [],
};

const ModifyComponent = ({ tno }) => {
  const [donationBoard, setDonationBoard] = useState({ ...initState });
  const [result, setResult] = useState(null);
  const { moveToList, moveToRead } = useCustomMove();
  const basePath = "/donationBoard";

  const quillRef = useRef(null);

  const imageHandler = useCallback(() => {
    const editor = quillRef.current.getEditor();
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) {
        return;
      }

      const formData = new FormData();
      formData.append("files", file);

      try {
        const response = await jwtAxios.post(
          `${API_SERVER_HOST}/files/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const savedFileName = response.data[0];

        setDonationBoard((prev) => ({
          ...prev,
          uploadFileNames: [...prev.uploadFileNames, savedFileName],
        }));

        const range = editor.getSelection();
        editor.insertEmbed(
          range.index,
          "image",
          `${API_SERVER_HOST}/files/${savedFileName}`
        );
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        alert("이미지 업로드에 실패했습니다. 로그인 상태를 확인해주세요.");
      }
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["link", "image"],
          [{ color: [] }, { background: [] }],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler]
  );

  const handleQuillChange = (htmlContent) => {
    setDonationBoard((prev) => ({
      ...prev,
      content: htmlContent,
    }));
  };

  useEffect(() => {
    getOne(tno).then((data) => setDonationBoard(data));
  }, [tno]);

  const handleChangeDonationBoard = (e) => {
    const { name, value } = e.target;
    setDonationBoard((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeDonationBoardComplete = (e) => {
    const value = e.target.value;
    setDonationBoard((prev) => ({
      ...prev,
      complete: value === "Y",
    }));
  };

  const handleClickModify = () => {
    putOne(donationBoard)
      .then((data) => {
        console.log("modify text result: " + data);

        const fileNames = donationBoard.uploadFileNames;
        if (fileNames && fileNames.length > 0) {
          addImageFilesForBoard(tno, fileNames)
            .then(() => {
              setResult("게시글과 파일이 성공적으로 수정되었습니다!");
            })
            .catch((e) => {
              console.error("파일 정보 수정 실패:", e);
              setResult(
                "게시글은 수정되었으나 파일 정보 업데이트에 실패했습니다."
              );
            });
        } else {
          setResult("게시글이 수정되었습니다!");
        }
      })
      .catch((e) => {
        console.error("게시글 수정 실패:", e);
        setResult("게시글 수정에 실패했습니다.");
      });
  };

  const handleClickDelete = () => {
    deleteOne(tno).then((data) => {
      console.log("delete result: " + data);
      setResult("Deleted");
    });
  };

  const closeModal = () => {
    setResult(null);
    if (result === "Deleted") {
      moveToList(basePath, {}, false);
    } else {
      moveToRead(tno, basePath);
    }
  };

  return (
    <div className="border-2 border-sky-200 mt-10 p-4 w-full">
      {result ? (
        <ResultModal
          title={"처리결과"}
          content={result}
          callbackFn={closeModal}
        ></ResultModal>
      ) : (
        <></>
      )}
      <p className="text-2xl font-bold mb-6 text-center">게시글 수정</p>
      <div className="space-y-4">
        {/* 작성자 (Writer) - 읽기 전용 */}
        <div className="flex flex-col items-start w-full">
          <div className="p-1 font-bold">작성자</div>
          <input
            className="w-full p-3 rounded-md border border-solid border-neutral-300 bg-gray-100 shadow-sm cursor-not-allowed"
            name="writer"
            type="text"
            value={donationBoard.writer}
            readOnly
          />
        </div>

        {/* 제목 (Title) */}
        <div className="flex flex-col items-start w-full">
          <div className="p-1 font-bold">제목</div>
          <input
            className="w-full p-3 rounded-md border border-solid border-neutral-300 focus:border-blue-500 focus:ring focus:ring-blue-200 shadow-sm"
            name="title"
            type="text"
            value={donationBoard.title}
            onChange={handleChangeDonationBoard}
          />
        </div>

        {/* 내용 (Content) */}
        <div className="flex flex-col items-start w-full">
          <div className="p-1 font-bold">내용</div>
          <Quill
            ref={quillRef}
            className="w-full border border-solid border-neutral-300 rounded-md shadow-sm"
            // style 속성에서 고정 높이를 제거하고, minHeight를 지정하여 최소 높이만 설정합니다.
            style={{ height: "auto", minHeight: "300px" }}
            theme="snow"
            value={donationBoard.content}
            onChange={handleQuillChange}
            placeholder="내용을 입력해주세요."
            modules={modules}
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
          <div className="h-4"></div>
        </div>
      </div>

      <div className="flex justify-end p-4">
        <button
          type="button"
          className="inline-block rounded p-4 m-2 text-xl w-32 text-white bg-red-500"
          onClick={handleClickDelete}
        >
          Delete
        </button>
        <button
          type="button"
          className="rounded p-4 m-2 text-xl w-32 text-white bg-blue-500"
          onClick={handleClickModify}
        >
          Modify
        </button>
      </div>
    </div>
  );
};

export default ModifyComponent;
