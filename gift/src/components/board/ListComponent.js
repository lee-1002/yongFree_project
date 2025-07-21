import React, { useState, useEffect, useRef } from "react";
import { List, InfiniteLoader } from "react-virtualized";
import "./ListComponent.css";

const currentNickname = "user1";

const createDummyPosts = () =>
  Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    title: `추천합니다~ (${i + 1})`,
    content: `여기 싸게 팔고 좋네요~`,
    nickname: i % 2 === 0 ? "user1" : "userN",
  }));

export default function ListComponent() {
  const [allPosts, setAllPosts] = useState(createDummyPosts());
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);
  const [vh, setVh] = useState(window.innerHeight);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const listContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const onResize = () => {
      setVh(window.innerHeight);
      if (listContainerRef.current) {
        setContainerWidth(listContainerRef.current.offsetWidth);
      }
    };
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const filtered = allPosts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase())
  );
  const loaded = filtered.slice(0, visibleCount);

  const loadMore = ({ stopIndex }) =>
    new Promise((res) => {
      if (visibleCount > stopIndex) return res();
      setTimeout(() => {
        setVisibleCount((prev) => Math.min(prev + 5, filtered.length));
        res();
      }, 300);
    });

  const isLoaded = ({ index }) => index < loaded.length;

  const onUpdate = (post) => {
    const t = prompt("새 제목:", post.title);
    const c = prompt("새 내용:", post.content);
    if (t && c) {
      setAllPosts((prev) =>
        prev.map((p) =>
          p.id === post.id && p.nickname === currentNickname
            ? { ...p, title: t, content: c }
            : p
        )
      );
    }
  };

  const onDelete = (id) =>
    setAllPosts((prev) =>
      prev.filter((p) => !(p.id === id && p.nickname === currentNickname))
    );

  const renderRow = ({ index, key, style }) => {
    const post = loaded[index];
    if (!post) return null;
    const isOwner = post.nickname === currentNickname;
    const truncated =
      post.content.length > 100
        ? post.content.slice(0, 100) + "..."
        : post.content;
    return (
      <div key={key} style={style} className="Board-card">
        <div className={`Board-header${!isOwner ? " no-actions" : ""}`}>
          <div>
            <h3>{post.title}</h3>
            <small>작성자: {post.nickname}</small>
          </div>
          {isOwner && (
            <div className="button-container">
              <button className="edit-btn" onClick={() => onUpdate(post)}>
                수정
              </button>
              <button className="delete-btn" onClick={() => onDelete(post.id)}>
                삭제
              </button>
            </div>
          )}
        </div>
        <p>{truncated}</p>
      </div>
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) {
      alert("제목과 내용을 입력해주세요");
      return;
    }
    const newPost = {
      id: allPosts.length + 1,
      title: newTitle,
      content: newContent,
      nickname: currentNickname,
    };
    setAllPosts((prev) => [newPost, ...prev]);
    setVisibleCount((v) => v + 1);
    setShowForm(false);
    setNewTitle("");
    setNewContent("");
  };

  return (
    <div className="Board-main">
      <h1 className="board-title">게시판</h1>

      <div className="Board-controls">
        <input
          type="text"
          placeholder="제목+내용"
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleCount(5);
          }}
        />
        <div className="add-post-button" onClick={() => setShowForm(true)}>
          <img src="/write.png" alt="글쓰기" className="add-post-image" />
          <span className="add-post-text">글쓰기</span>
        </div>
      </div>

      <div className="Board-content-area">
        <aside className="category-container">
          <h3>카테고리</h3>
          <ul className="category-list">
            {[
              "전체",
              "자유게시판",
              "거래후기/리뷰",
              "사기 주의/블랙리스트",
              "꿀팁/노하우",
              "이용문의",
            ].map((c) => (
              <li key={c}>
                <button className="category-btn">{c}</button>
              </li>
            ))}
          </ul>
        </aside>

        <section
          className="board-list-container"
          ref={listContainerRef}
          style={{ height: vh - 200 }}
        >
          <InfiniteLoader
            isRowLoaded={isLoaded}
            loadMoreRows={loadMore}
            rowCount={filtered.length}
            threshold={2}
          >
            {({ onRowsRendered, registerChild }) => (
              <List
                width={containerWidth}
                height={vh - 200}
                rowHeight={170}
                rowCount={loaded.length}
                rowRenderer={renderRow}
                onRowsRendered={onRowsRendered}
                ref={registerChild}
              />
            )}
          </InfiniteLoader>
        </section>
      </div>

      {showForm && (
        <div className="Form-overlay" style={{ height: vh }}>
          <form className="Write-form" onSubmit={handleSubmit}>
            <h2>새 글쓰기</h2>
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <textarea
              placeholder="내용을 입력하세요"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
            <div className="Write-buttons">
              <button type="submit">등록</button>
              <button type="button" onClick={() => setShowForm(false)}>
                취소
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
