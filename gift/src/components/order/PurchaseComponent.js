// src/components/order/PurchaseComponent.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useCustomLogin from "../../hooks/useCustomLogin";

const BOOTPAY_SCRIPT_SRC = "https://cdn.bootpay.co.kr/js/bootpay-3.2.3.min.js";
const APPLICATION_ID = "6880972a836e97280fee7b0b"; // JavaScript 키

export default function PurchaseComponent() {
  const { isLogin, loginState } = useCustomLogin();
  const { state } = useLocation();
  const navigate = useNavigate();
  const selected = state?.selectedItems || [];

  const subtotal = useMemo(
    () => selected.reduce((sum, it) => sum + it.price * it.qty, 0),
    [selected]
  );

  const [sdkReady, setSdkReady] = useState(false);

  // BootPay SDK 로드
  useEffect(() => {
    // 이미 로드되어 있는지 확인
    if (window.BootPay || window.bootpay || window.Bootpay) {
      setSdkReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = BOOTPAY_SCRIPT_SRC;
    script.async = true;
    script.crossOrigin = "anonymous";

    script.onload = () => {
      console.log("BootPay SDK 로드 성공");
      setSdkReady(true);
    };

    script.onerror = () => {
      console.error("BootPay SDK 로드 실패");
      alert("결제 SDK 로딩에 실패했습니다. 네트워크를 확인해주세요.");
    };

    document.body.appendChild(script);

    return () => {
      try {
        if (document.body && script && document.body.contains(script)) {
          document.body.removeChild(script);
        }
      } catch (e) {
        console.log("스크립트 제거 오류:", e);
      }
    };
  }, []);

  const handlePayment = useCallback(async () => {
    if (!sdkReady) {
      alert("결제 SDK 준비 중입니다. 잠시만 기다려주세요.");
      return;
    }

    // 부트페이 객체 확인
    const bootpay = window.BootPay || window.bootpay || window.Bootpay;
    if (!bootpay) {
      alert("결제 SDK를 찾을 수 없습니다.");
      return;
    }

    try {
      // 간단한 결제창만 띄우기
      const paymentRequest = bootpay.request({
        application_id: APPLICATION_ID,
        price: subtotal,
        name: `주문상품 ${selected.length}건`,
        // pg: "nicepay",
        method: "card",
        order_id: `order_${Date.now()}`,
        user_info: {
          username: loginState.email,
          email: loginState.email,
        },
        // 테스트용 결제 정보 추가
        extra: {
          card_quota: "0,2,3", // 할부 개월 수 (일시불, 2개월, 3개월)
          seller_name: "GIFREE", // 판매자명
          delivery_day: "1", // 배송일
          delivery_name: loginState.email, // 수령인명
          delivery_tel: "010-1234-5678", // 수령인 연락처
          delivery_addr: "서울시 강남구", // 배송주소
          delivery_postcode: "12345", // 우편번호
          // 테스트 모드용 설정
          test_verification: true, // 테스트 검증 활성화
        },
      });

      // Promise 방식으로 처리
      if (paymentRequest && typeof paymentRequest.then === "function") {
        paymentRequest
          .then((response) => {
            console.log("결제 완료 (Promise):", response);

            // 부트페이 결제창 강제로 닫기
            if (bootpay && typeof bootpay.close === "function") {
              try {
                bootpay.close();
              } catch (e) {
                console.log("부트페이 close 오류:", e);
              }
            }

            // 부트페이 관련 DOM 요소들 제거 (안전한 방법)
            try {
              const bootpayElements = document.querySelectorAll(
                '[id*="bootpay"], [class*="bootpay"]'
              );
              bootpayElements.forEach((el) => {
                if (el && el.parentNode) {
                  el.parentNode.removeChild(el);
                }
              });

              // 모달 오버레이 제거
              const overlays = document.querySelectorAll(
                ".modal-overlay, .bootpay-overlay"
              );
              overlays.forEach((overlay) => {
                if (overlay && overlay.parentNode) {
                  overlay.parentNode.removeChild(overlay);
                }
              });
            } catch (e) {
              console.log("DOM 정리 오류:", e);
            }

            alert("결제가 완료되었습니다!");

            // URL 파라미터로 결제 정보 전달
            const orderId = `order_${Date.now()}`;
            const params = new URLSearchParams({
              receiptId: response.receipt_id,
              orderId: orderId,
              totalAmount: subtotal.toString(),
              itemCount: selected.length.toString(),
            });

            navigate(`/order/complete?${params.toString()}`);
          })
          .catch((error) => {
            console.error("결제 실패 (Promise):", error);
            alert("결제에 실패했습니다.");
          });
      } else {
        // 체이닝 방식으로 처리
        paymentRequest
          .error((error) => {
            console.error("결제 에러:", error);
            alert("결제 중 오류가 발생했습니다.");
          })
          .cancel(() => {
            console.log("결제 취소됨");
            alert("결제가 취소되었습니다.");
          })
          .confirm((data) => {
            console.log("결제 확인됨:", data);
            // 결제 승인 후 바로 완료 처리
            setTimeout(() => {
              console.log("결제 완료 처리:", data);

              // 부트페이 결제창 강제로 닫기
              if (bootpay && typeof bootpay.close === "function") {
                try {
                  bootpay.close();
                } catch (e) {
                  console.log("부트페이 close 오류:", e);
                }
              }

              // 부트페이 관련 DOM 요소들 제거 (안전한 방법)
              try {
                const bootpayElements = document.querySelectorAll(
                  '[id*="bootpay"], [class*="bootpay"]'
                );
                bootpayElements.forEach((el) => {
                  if (el && el.parentNode) {
                    el.parentNode.removeChild(el);
                  }
                });

                // 모달 오버레이 제거
                const overlays = document.querySelectorAll(
                  ".modal-overlay, .bootpay-overlay"
                );
                overlays.forEach((overlay) => {
                  if (overlay && overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                  }
                });
              } catch (e) {
                console.log("DOM 정리 오류:", e);
              }

              alert("결제가 완료되었습니다!");

              // URL 파라미터로 결제 정보 전달
              const orderId = `order_${Date.now()}`;
              const params = new URLSearchParams({
                receiptId: data.receipt_id,
                orderId: orderId,
                totalAmount: subtotal.toString(),
                itemCount: selected.length.toString(),
              });

              navigate(`/order/complete?${params.toString()}`);
            }, 1000); // 1초 후 완료 처리
            return true; // 결제 승인
          })
          .done((response) => {
            console.log("결제 완료 (done):", response);
            // confirm에서 이미 처리했으므로 여기서는 로그만
          })
          .close(() => {
            console.log("결제창 닫힘");
          });
      }
    } catch (error) {
      console.error("결제 요청 실패:", error);
      alert("결제 요청에 실패했습니다.");
    }
  }, [sdkReady, subtotal, selected, loginState.email, navigate]);

  if (!isLogin) {
    return <div className="p-6">로그인 후 이용해주세요.</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8 max-w-4xl mx-auto">
        <section className="flex-1 bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold">
            주문 상품 ({selected.length})
          </h2>
          <ul className="mt-4 space-y-4">
            {selected.map((it) => (
              <li key={it.pno} className="flex items-center border-b pb-2">
                <img
                  src={`/api/products/view/${it.imageFile}`}
                  alt={it.pname}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="ml-4 flex-1">
                  <div className="font-medium">{it.pname}</div>
                  <div className="text-sm text-gray-600">수량: {it.qty}</div>
                </div>
                <div className="font-semibold">
                  {(it.price * it.qty).toLocaleString()}원
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="w-full lg:w-80 bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold">결제 금액</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>상품 합계</span>
              <span>{subtotal.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between font-bold pt-2">
              <span>총 결제</span>
              <span>{subtotal.toLocaleString()}원</span>
            </div>
          </div>
          <button
            onClick={handlePayment}
            disabled={!sdkReady}
            className={`mt-6 w-full py-2 text-white rounded ${
              sdkReady
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {sdkReady ? "카카오페이 결제하기" : "결제 SDK 로딩중..."}
          </button>
          {!sdkReady && (
            <div className="mt-2 text-sm text-gray-500 text-center">
              SDK 로딩 중... 잠시만 기다려주세요.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
