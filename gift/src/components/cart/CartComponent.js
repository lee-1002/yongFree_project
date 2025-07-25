// src/components/CartComponent.js
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCustomLogin from "../../hooks/useCustomLogin";
import useCustomCart from "../../hooks/useCustomCart";
import { createOrder } from "../../api/orderApi"; // ← 추가
import CartItemComponent from "./CartItemComponent";

const CartComponent = () => {
  const { isLogin, loginState } = useCustomLogin();
  const { refreshCart, cartItems, changeCart } = useCustomCart();
  const navigate = useNavigate();

  const [checkedItems, setCheckedItems] = useState([]); // 선택된 cino 배열

  const total = useMemo(
    () =>
      cartItems
        .filter((item) => checkedItems.includes(item.cino))
        .reduce((sum, item) => sum + item.price * item.qty, 0),
    [cartItems, checkedItems]
  );

  const isAllChecked =
    cartItems.length > 0 && checkedItems.length === cartItems.length;

  useEffect(() => {
    if (isLogin) {
      refreshCart();
    }
  }, [isLogin]);

  const handleToggleAll = () => {
    if (isAllChecked) {
      setCheckedItems([]);
    } else {
      setCheckedItems(cartItems.map((item) => item.cino));
    }
  };

  const handleToggleItem = (cino) => {
    setCheckedItems((prev) =>
      prev.includes(cino) ? prev.filter((id) => id !== cino) : [...prev, cino]
    );
  };

  const handlePurchase = async () => {
    const selectedItems = cartItems.filter((item) =>
      checkedItems.includes(item.cino)
    );
    if (selectedItems.length === 0) {
      alert("상품을 하나 이상 선택해주세요.");
      return;
    }

    // ─────────────────────────────────────────────────────────────
    // 1) 주문 테이블에 저장 요청
    try {
      const orderReq = {
        memberId: loginState.email,
        couponCode: null, // 필요 시 쿠폰 코드
        items: selectedItems.map((it) => ({
          pno: it.pno,
          qty: it.qty,
        })),
      };
      const {
        data: { ono },
      } = await createOrder(orderReq);

      // 2) 저장된 주문번호(ono)를 state 로 넘겨서 결제 페이지로 이동
      navigate("/order/purchase", {
        state: {
          selectedItems,
          ono, // order 테이블에 올라간 주문번호
        },
      });
    } catch (err) {
      console.error("주문 생성 실패:", err);
      alert("주문 생성에 실패했습니다. 다시 시도해주세요.");
    }
    // ─────────────────────────────────────────────────────────────
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-10 px-4">
      {isLogin ? (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 왼쪽 - 장바구니 상품 목록 */}
          <div className="flex-1">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-bold">
                <span className="text-gray-800">장바구니</span>
              </h2>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <input
                type="checkbox"
                checked={isAllChecked}
                onChange={handleToggleAll}
              />
              <span className="text-gray-700 font-medium">전체 선택</span>
              <span className="text-sm text-gray-500">
                ({checkedItems.length}/{cartItems.length})
              </span>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              {cartItems.map((item) => (
                <CartItemComponent
                  key={item.cino}
                  {...item}
                  changeCart={changeCart}
                  memberid={loginState.email}
                  checked={checkedItems.includes(item.cino)}
                  onToggle={() => handleToggleItem(item.cino)}
                />
              ))}
            </div>
          </div>

          {/* 오른쪽 - 결제 요약 정보 */}
          <div className="w-full lg:w-1/3 bg-gray-50 border rounded-md p-6 shadow-sm h-fit">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">
              주문 예상 금액
            </h3>

            <div className="text-sm flex justify-between py-2 border-b">
              <span>총 상품 가격</span>
              <span>{total.toLocaleString()}원</span>
            </div>
            <div className="text-sm flex justify-between py-2 border-b">
              <span>총 할인</span>
              <span className="text-red-500">-0원</span>
            </div>
            <div className="text-lg font-bold flex justify-between pt-4">
              <span>총 결제금액</span>
              <span className="text-blue-600 text-xl">
                {total.toLocaleString()}원
              </span>
            </div>

            <button
              onClick={handlePurchase}
              className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded font-semibold text-lg"
            >
              구매하기 ({checkedItems.length})
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 text-lg mt-20">
          로그인 후 장바구니를 확인하세요.
        </div>
      )}
    </div>
  );
};

export default CartComponent;
