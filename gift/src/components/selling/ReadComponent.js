// src/components/selling/ReadComponent.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOne, deleteOne } from "../../api/productsApi";
import { API_SERVER_HOST } from "../../api/backendApi";
import useCustomMove from "../../hooks/useCustomMove";
import FetchingModal from "../common/FetchingModal";
import useCustomLogin from "../../hooks/useCustomLogin";
import useCustomCart from "../../hooks/useCustomCart";

const initState = {
  pno: 0,
  pname: "",
  brand: "",
  pdesc: "",
  price: 0,
  discountRate: 0,
  salePrice: 0,
  uploadFileNames: [],
};

const ReadComponent = () => {
  const { pno } = useParams();
  const numPno = parseInt(pno, 10);
  const host = API_SERVER_HOST;

  const [product, setProduct] = useState(initState);
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(false);

  const { moveToList, moveToModify } = useCustomMove();
  const { changeCart, cartItems } = useCustomCart();
  const { loginState } = useCustomLogin();

  const handleClickAddCart = () => {
    let qty = 1;
    const addedItem = cartItems.find((item) => item.pno === numPno);
    if (addedItem) {
      if (!window.confirm("이미 추가된 상품입니다. 추가하시겠습니까?")) return;
      qty = addedItem.qty + 1;
    }
    changeCart({ email: loginState.email, pno: numPno, qty });
  };

  const handleClickDelete = async () => {
    if (!window.confirm("정말 이 상품을 삭제하시겠습니까?")) return;
    setFetching(true);
    try {
      await deleteOne(numPno);
      alert("상품이 삭제되었습니다.");
      moveToList("/selling");
    } catch (err) {
      console.error("삭제 오류:", err);
      alert("상품 삭제에 실패했습니다.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!numPno || isNaN(numPno)) {
      setError("유효하지 않은 상품 번호입니다.");
      return;
    }
    setFetching(true);
    setError(null);
    getOne(numPno)
      .then((data) => {
        setProduct(data);
        setFetching(false);
      })
      .catch((err) => {
        console.error("상품 조회 오류:", err);
        setError("상품 정보를 불러오는데 실패했습니다.");
        setFetching(false);
        alert("상품 정보를 불러오는데 실패했습니다.");
      });
  }, [numPno]);

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-24 p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-center text-red-600 text-lg font-semibold">
          {error}
        </p>
        <button
          onClick={() => moveToList("/selling")}
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg block mx-auto"
        >
          목록으로
        </button>
      </div>
    );
  }

  const hasDiscount = product.salePrice != null && product.discountRate > 0;

  return (
    <div className="relative w-[90vw] max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-xl font-sans">
      {fetching && <FetchingModal />}

      <div className="flex flex-col md:flex-row gap-6">
        {/* 좌측: 이미지 */}
        <div className="md:w-1/2 flex flex-col space-y-4">
          {product.uploadFileNames.length > 0 ? (
            product.uploadFileNames.map((imgFile, i) => (
              <img
                key={i}
                className="w-full rounded-lg shadow-md object-contain"
                src={`${host}/api/products/view/${imgFile}`}
                alt="product"
              />
            ))
          ) : (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              이미지 없음
            </div>
          )}
        </div>

        {/* 우측: 상세 정보 */}
        <dl className="md:w-1/2 flex flex-col space-y-4">
          <div className="flex items-center pb-2 border-b border-gray-200">
            <dt className="w-1/3 text-gray-700 font-semibold">BRAND</dt>
            <dd className="w-2/3 text-gray-600">{product.brand}</dd>
          </div>
          <div className="flex items-center py-2 border-b border-gray-200">
            <dt className="w-1/3 text-gray-700 font-semibold">PNAME</dt>
            <dd className="w-2/3 text-gray-600">{product.pname}</dd>
          </div>
          <div className="flex items-baseline py-2 border-b border-gray-200">
            <dt className="w-1/3 text-gray-700 font-semibold">PRICE</dt>
            <dd className="w-2/3 flex items-baseline space-x-2">
              {hasDiscount ? (
                <>
                  <span className="text-red-600 font-bold">
                    ~{product.discountRate}%
                  </span>
                  <span className="text-blue-600 font-bold">
                    {product.salePrice.toLocaleString()}원
                  </span>
                  <span className="text-gray-400 line-through">
                    {product.price.toLocaleString()}원
                  </span>
                </>
              ) : (
                <span className="text-gray-700">
                  {product.price?.toLocaleString() ?? "가격 정보 없음"}원
                </span>
              )}
            </dd>
          </div>
          <div className="flex flex-col py-2 border-b border-gray-200">
            <dt className="text-gray-700 font-semibold">PDESC</dt>
            <dd className="mt-1 text-gray-600 whitespace-pre-wrap">
              {product.pdesc}
            </dd>
          </div>
        </dl>
      </div>

      {/* 오른쪽 하단에 고정된 버튼 */}
      <div className="absolute bottom-6 right-6 flex space-x-3">
        <button
          onClick={handleClickAddCart}
          className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
        >
          Add Cart
        </button>
        <button
          onClick={() => moveToModify(numPno, "/selling")}
          className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
        >
          Modify
        </button>
        <button
          onClick={handleClickDelete}
          className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
        >
          Delete
        </button>
        <button
          onClick={() => moveToList("/selling")}
          className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
        >
          List
        </button>
      </div>
    </div>
  );
};

export default ReadComponent;
