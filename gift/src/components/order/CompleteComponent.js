// src/components/order/CompleteComponent.js
import React from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { API_SERVER_HOST } from "../../api/backendApi";

const CompleteComponent = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL 파라미터에서 결제 정보 읽기
  const receiptId = searchParams.get("receiptId");
  const orderId = searchParams.get("orderId");
  const totalAmount = searchParams.get("totalAmount");
  const itemCount = searchParams.get("itemCount");

  console.log("CompleteComponent - URL params:", {
    receiptId,
    orderId,
    totalAmount,
    itemCount,
  });
  console.log("CompleteComponent - state:", state);

  // URL 파라미터로 결제 완료 정보가 있는 경우
  if (receiptId && orderId) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center">
        <div className="bg-white p-6 rounded shadow w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-green-600">
            🎉 결제 완료!
          </h2>

          <div className="mb-6 p-4 bg-green-50 rounded">
            <p className="text-sm text-green-700 mb-2">
              <strong>결제 승인번호:</strong> {receiptId}
            </p>
            <p className="text-sm text-green-700 mb-2">
              <strong>주문번호:</strong> {orderId}
            </p>
            <p className="text-sm text-green-700">
              <strong>결제 금액:</strong>{" "}
              {totalAmount ? parseInt(totalAmount).toLocaleString() : 0}원
            </p>
            <p className="text-sm text-green-700">
              <strong>구매 상품 수:</strong> {itemCount}개
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={() => navigate("/")}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              메인으로
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="w-full py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              장바구니로
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 기존 state로 주문 완료 정보가 있는 경우
  const { ono, items } = state || {};
  if (ono && items) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center">
        <div className="bg-white p-6 rounded shadow w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">🎉 주문 완료!</h2>
          <p className="mb-6">
            주문번호: <strong>{ono}</strong>
          </p>

          <h3 className="font-semibold mb-2">구매 상품 내역</h3>
          <ul className="divide-y">
            {items.map((it, idx) => (
              <li key={idx} className="py-4 flex items-center">
                <img
                  src={`${API_SERVER_HOST}/api/products/view/${it.imageFile}`}
                  alt={it.pname}
                  className="w-16 h-16 object-cover rounded mr-4"
                />
                <div className="flex-1">
                  <div className="font-medium">{it.pname}</div>
                  <div className="text-sm text-gray-600">수량: {it.qty}</div>
                </div>
                <div className="font-semibold">
                  {(it.price * it.qty).toLocaleString()}원
                </div>
              </li>
            ))}
          </ul>

          <button
            onClick={() => navigate("/")}
            className="mt-6 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            메인으로
          </button>
        </div>
      </div>
    );
  }

  // 잘못된 접근
  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center">
      <div className="bg-white p-6 rounded shadow w-full max-w-md text-center">
        <h2 className="text-xl font-bold mb-4 text-red-600">⚠️ 잘못된 접근</h2>
        <p className="mb-6">결제 정보를 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate("/")}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          메인으로
        </button>
      </div>
    </div>
  );
};

export default CompleteComponent;
