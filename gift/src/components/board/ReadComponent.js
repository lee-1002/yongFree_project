import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchBoard } from "../../api/boardsApi";
import "./ReadComponent.css";

export default function ReadComponent() {
  const { bno } = useParams();
  const nav = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetchBoard(bno)
      .then(setPost)
      .catch(() => nav(-1));
  }, [bno]);

  if (!post) return <div>로딩중…</div>;
  return (
    <div className="ReadPage-container">
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <div className="file-list">
        {post.images.map((fn, idx) =>
          /\.(jpe?g|png|gif)$/i.test(fn) ? (
            <img
              key={idx}
              src={`/api/boards/view/${fn}`}
              alt=""
              className="uploaded-image"
            />
          ) : (
            <a key={idx} href={`/api/boards/view/${fn}`} download>
              {fn}
            </a>
          )
        )}
      </div>
      <button onClick={() => nav(-1)}>목록</button>
    </div>
  );
}
