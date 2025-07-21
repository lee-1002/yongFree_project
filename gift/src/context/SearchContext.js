import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as productsApi from "../api/productsApi";

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
    // axios.get("http://localhost:8080/api/products");
    productsApi
      .getList({ page: 1, size: 20 })
      .then((res) => {
        setInitialProducts(res.dtoList);
      })
      .catch((err) => {
        console.error("초기 상품 목록 로딩 에러:", err);
        setInitialProducts([]);
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
        setDisplayTerm("");
        setSearchResults([]);
        setIsLoading(false);
        setDisplayTerm("");
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      setDisplayTerm(query);
      setIsLoading(true);

      try {
        const response = await productsApi.getList({
          page: 1, // 검색 결과의 기본 페이지
          size: 20, // 검색 결과의 기본 사이즈
          keyword: query, // 검색어를 'keyword' 파라미터로 전달
        });
        // 백엔드가 PageResponseDTO를 반환하므로 response.dtoList에 실제 데이터가 있습니다.
        setSearchResults(response.dtoList);
        navigate("/search/list");
      } catch (error) {
        console.error("상품 검색 에러:", error);
        setSearchResults([]); // 에러 시 검색 결과를 빈 배열로 설정
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
