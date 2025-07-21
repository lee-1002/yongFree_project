import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SearchContext = createContext();
export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
  const navigate = useNavigate();

  const [displayTerm, setDisplayTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [initialProducts, setInitialProducts] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    setIsInitialLoading(true);
    axios
      .get("http://localhost:8080/api/products")
      .then((res) => {
        setInitialProducts(res.data);
      })
      .catch((err) => {
        console.error("초기 상품 목록 로딩 에러:", err);
      })
      .finally(() => {
        setIsInitialLoading(false);
      });
  }, []);

  // 텍스트 검색 기능
  const performTextSearch = useCallback(
    async (query) => {
      // 쿼리가 비어있으면 검색 대신 displayTerm 초기화 및 검색 결과 비움
      if (!query || !query.trim()) {
        setDisplayTerm(""); // 검색어 상태 초기화
        setSearchResults([]); // 검색 결과도 비워줌
        // navigate("/search/list"); // 필요한 경우 다시 전체 목록 페이지로 이동 (이미 list 페이지에 있다면 불필요할 수 있음)
        setIsLoading(false); // 로딩 상태 종료
        return;
      }

      setDisplayTerm(query);
      setIsLoading(true);

      try {
        // 실제 Gifree 자바 백엔드의 검색 API 주소를 사용* 엔드포인트랑 포트번호 확인
        const response = await axios.get(
          `http://localhost:8080/api/products?query=${query}`
        );
        setSearchResults(response.data);
        navigate("/search/list");
      } catch (error) {
        console.error("상품 검색 에러:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  // 호출 될 이미지 분석 및 검색 함수
  const analyzeImageAndSearch = useCallback(
    async (file) => {
      if (!file) return;

      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        console.log("FastAPI 서버로 분석 요청*이거 안나오면 호출 에러임");
        const res = await axios.post(
          "http://localhost:8000/analyze-brand",
          formData
        );
        const brandName = res.data.brand_name;

        if (brandName && brandName !== "인식된 브랜드가 없습니다.") {
          await performTextSearch(brandName);
        } else {
          alert("이미지에서 브랜드를 찾지 못했습니다.");
          setIsLoading(false);
        }
      } catch (err) {
        alert("이미지 분석 중 오류가 발생했습니다.");
        setIsLoading(false);
      } finally {
      }
    },
    [performTextSearch]
  );

  const value = {
    searchResults,
    isLoading,
    displayTerm,
    initialProducts,
    isInitialLoading,
    performTextSearch,
    analyzeImageAndSearch,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};
