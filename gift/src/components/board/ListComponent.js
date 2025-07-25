// src/components/board/ListComponent.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBoards, postAddBoard } from "../../api/boardsApi";
import FetchingModal from "../common/FetchingModal";
import ResultModal from "../common/ResultModal";
import "./ListComponent.css";

export default function ListComponent() {
  const navigate = useNavigate();
  const uploadRef = useRef();

  // 게시글 데이터 + 로딩/결과 상태
  const [posts, setPosts] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [result, setResult] = useState(null);

  // 페이지네이션
  const POSTS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // 새 글 폼
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  // 초기 데이터 로드
  useEffect(() => {
    loadPosts();
  }, []);

  // --- 변경된 loadPosts: bno 기준 내림차순 정렬 추가 ---
  const loadPosts = async () => {
    const data = await fetchBoards();
    // bno 기준 내림차순 정렬 (가장 큰 번호 먼저)
    const sorted = data.sort((a, b) => b.bno - a.bno);
    setPosts(sorted);
    // (옵션) 페이지를 1로 리셋하고 싶다면:
    // setCurrentPage(1);
  };
  // ------------------------------------------------------

  // 파일 선택 처리
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files.map((f) => f.name));
  };
  const clearFileSelection = () => {
    uploadRef.current.value = null;
    setSelectedFiles([]);
  };

  // 글 등록
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("writer", "user1");
    Array.from(uploadRef.current.files).forEach((f) =>
      formData.append("files", f)
    );

    setFetching(true);
    try {
      const { result: bno } = await postAddBoard(formData);
      setResult(bno);
      await loadPosts(); // 등록 후에도 내림차순 유지
    } catch (err) {
      console.error(err);
      alert("등록 실패했습니다.");
    } finally {
      setFetching(false);
      setShowForm(false);
      setTitle("");
      setContent("");
      clearFileSelection();
    }
  };

  // 현재 페이지에 보여줄 게시글
  const indexOfLast = currentPage * POSTS_PER_PAGE;
  const indexOfFirst = indexOfLast - POSTS_PER_PAGE;
  const currentPosts = posts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  return (
    <div className="Board-main">
      {fetching && <FetchingModal />}

      {result && (
        <ResultModal
          title="등록 완료"
          content={`${result}번 게시글이 등록되었습니다.`}
          callbackFn={() => setResult(null)}
        />
      )}

      {/* 검색바 (현재 검색 기능 미구현) */}
      <div className="search-bar">
        <select>
          <option value="">전체</option>
        </select>
        <input type="text" placeholder="검색어를 입력하세요" disabled />
        <button disabled>검색</button>
        <div className="add-post-button" onClick={() => setShowForm(true)}>
          <span className="add-post-text">글쓰기</span>
        </div>
      </div>

      {/* 카테고리 + 테이블 */}
      <div className="Board-content-area">
        <div className="category-container">
          <ul className="category-list">
            <li>
              <button className="category-btn active">전체</button>
            </li>
          </ul>
        </div>
        <div className="board-table-container">
          <table className="board-table">
            <thead>
              <tr>
                <th className="id">번호</th>
                <th className="title">제목</th>
                <th className="date">등록일</th>
                <th className="views">조회수</th>
              </tr>
            </thead>
            <tbody>
              {currentPosts.map((p) => (
                <tr key={p.bno}>
                  <td className="id">{p.bno}</td>
                  <td
                    className="title"
                    onClick={() => navigate(`/board/read/${p.bno}`)}
                  >
                    {p.title}
                  </td>
                  <td className="date">{p.regDate?.slice(0, 10) || ""}</td>
                  <td className="views">{p.views ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 페이지네이션 */}
      <nav className="pagination-nav">
        <ul className="pagination-list">
          <li
            className="pagination-item prev"
            onClick={() =>
              currentPage > 1 && setCurrentPage((prev) => prev - 1)
            }
          >
            &lt;
          </li>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <li
              key={num}
              className={`pagination-item ${
                currentPage === num ? "active" : ""
              }`}
              onClick={() => setCurrentPage(num)}
            >
              {num}
            </li>
          ))}
          <li
            className="pagination-item next"
            onClick={() =>
              currentPage < totalPages && setCurrentPage((prev) => prev + 1)
            }
          >
            &gt;
          </li>
        </ul>
      </nav>

      {/* 글쓰기 모달 */}
      {showForm && (
        <div className="Form-overlay">
          <form className="Write-form" onSubmit={handleSubmit}>
            <h2>새 글 작성</h2>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
            />
            <label>파일 업로드</label>
            <input
              ref={uploadRef}
              type="file"
              multiple
              onChange={handleFileChange}
            />
            {selectedFiles.length > 0 && (
              <ul>
                {selectedFiles.map((name, idx) => (
                  <li key={idx}>{name}</li>
                ))}
              </ul>
            )}
            <div className="Write-buttons">
              <button type="submit">등록</button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  clearFileSelection();
                }}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
