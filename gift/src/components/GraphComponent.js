import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./GraphComponent.css";

const GraphComponent = () => {
  const [input, setInput] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [listData, setListData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  //   const [showResults, setShowResults] = useState(false);
  //   const [showAnalysisResults, setShowAnalysisResults] = useState(false); // 분석 결과 표시 여부

  const handleSearch = async (searchTerm) => {
    // 검색어가 비어있거나 로딩 중이면 실행하지 않음
    if (!searchTerm || !searchTerm.trim() || isLoading) return;

    setIsLoading(true);
    setError("");
    setImageSrc("");
    setListData([]);

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        // 포트 번호 확인!
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: searchTerm }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "분석 데이터를 가져오는데 실패했습니다."
        );
      }

      const data = await response.json();
      setImageSrc(`data:image/png;base64,${data.graphImage}`);
      setListData(data.listData);
    } catch (err) {
      console.error("분석 요청 중 에러:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch("기부 횟수");
  }, []);

  return (
    <div className="ad-graph-list-container">
      {/* 광고 및 이벤트 이미지 */}
      <div className="ad-container">
        <Link to="/event">
          <img src="/event_test_img(1).png" alt="이벤트 테스트 이미지" />
        </Link>
      </div>
      <div className="graph-list-container">
        {/* 그래프 */}
        <div className="graph-container">
          <h2>📊궁금한 정보를 검색해보세요</h2>
          <div className="input-group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ex) 기부 금액 순위"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(input); // input 상태값을 인자로 전달
                }
              }}
            />
            <button onClick={() => handleSearch(input)} disabled={isLoading}>
              {isLoading ? "검색중..." : "검색"}
            </button>
          </div>

          {/* --- 결과 표시 영역 --- */}
          <div className="results-container">
            {isLoading && <p>그래프와 목록을 생성 중입니다...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* 그래프 표시 */}
            {imageSrc && (
              <div className="graph-display">
                <img src={imageSrc} alt="분석 그래프" />
              </div>
            )}
          </div>
        </div>

        {/* 명단 리스트(표) 표시 */}
        {listData.length > 0 && (
          <div className="list-container">
            <p>상위 10개</p>
            <div className="list-container-table">
              <div className="list-container-table-head">
                <div className="div-table-cell rank-cell">순위</div>
                <div className="div-table-cell name-cell">기부자</div>
              </div>
              <div className="div-table-body">
                {listData.map((item, index) => (
                  <div className="div-table-row" key={index}>
                    {/* item 객체의 '순위'와 '기부자명' 값을 직접 사용합니다. */}
                    <div className="div-table-cell rank-cell">{`${item.순위}위`}</div>
                    <div className="div-table-cell name-cell">
                      {item.기부자명}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphComponent;
