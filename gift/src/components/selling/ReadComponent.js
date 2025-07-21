import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOne } from "../../api/productsApi";
import { API_SERVER_HOST } from "../../api/todoApi";
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

const host = API_SERVER_HOST;

const ReadComponent = () => {
  const { pno } = useParams();
  const numPno = parseInt(pno);

  const [product, setProduct] = useState(initState);
  const [error, setError] = useState(null);

  const { moveToList, moveToModify } = useCustomMove();
  const [fetching, setFetching] = useState(false);

  const { changeCart, cartItems } = useCustomCart();
  const { loginState } = useCustomLogin();

  const handleClickAddCart = () => {
    let qty = 1;

    const addedItem = cartItems.find((item) => item.pno === numPno);

    if (addedItem) {
      if (!window.confirm("이미 추가된 상품입니다. 추가하시겠습니까?")) {
        return;
      }
      qty = addedItem.qty + 1;
    }

    changeCart({ email: loginState.email, pno: numPno, qty: qty });
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
      .catch((error) => {
        console.error("상품 조회 오류:", error);
        setFetching(false);
        setError("상품 정보를 불러오는데 실패했습니다.");
        alert("상품 정보를 불러오는데 실패했습니다.");
      });
  }, [numPno]);

  if (error) {
    return (
      <div className="border-2 border-red-200 mt-10 m-2 p-4">
        <div className="flex justify-center mt-10">
          <div className="text-red-500 text-xl font-bold">{error}</div>
        </div>
        <div className="flex justify-end p-4">
          <button
            type="button"
            className="rounded p-4 m-2 text-xl w-32 text-white bg-blue-500"
            onClick={moveToList}
          >
            List
          </button>
        </div>
      </div>
    );
  }

  // 할인 여부 판단
  const hasDiscount =
    product.salePrice != null &&
    product.discountRate != null &&
    product.discountRate > 0;

  return (
    <div className="border-2 border-sky-200 mt-10 m-2 p-4">
      {fetching && <FetchingModal />}

      <div className="flex justify-center mt-10">
        <div className="relative mb-4 flex w-full flex-wrap items-stretch">
          <div className="w-1/5 p-6 text-right font-bold">PNO</div>
          <div className="w-4/5 p-6 rounded-r border border-solid shadow-md">
            {product.pno}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="relative mb-4 flex w-full flex-wrap items-stretch">
          <div className="w-1/5 p-6 text-right font-bold">BRAND</div>
          <div className="w-4/5 p-6 rounded-r border border-solid shadow-md">
            {product.brand}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="relative mb-4 flex w-full flex-wrap items-stretch">
          <div className="w-1/5 p-6 text-right font-bold">PNAME</div>
          <div className="w-4/5 p-6 rounded-r border border-solid shadow-md">
            {product.pname}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="relative mb-4 flex w-full flex-wrap items-stretch">
          <div className="w-1/5 p-6 text-right font-bold">PRICE</div>
          <div className="w-4/5 p-6 rounded-r border border-solid shadow-md">
            {hasDiscount ? (
              <>
                <span className="text-red-600 font-bold mr-2">
                  할인율: ~{product.discountRate}%
                </span>
                <span className="text-green-600 font-bold mr-4">
                  할인가: {product.salePrice.toLocaleString()}원
                </span>
                <span className="line-through text-gray-500">
                  정가: {product.price.toLocaleString()}원
                </span>
              </>
            ) : (
              <span>
                {product.price?.toLocaleString() ?? "가격 정보 없음"}원
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="relative mb-4 flex w-full flex-wrap items-stretch">
          <div className="w-1/5 p-6 text-right font-bold">PDESC</div>
          <div className="w-4/5 p-6 rounded-r border border-solid shadow-md">
            {product.pdesc}
          </div>
        </div>
      </div>

      <div className="w-full justify-center flex flex-col m-auto items-center">
        {product.uploadFileNames.map((imgFile, i) => (
          <img
            alt="product"
            key={i}
            className="p-4 w-1/2"
            src={`${host}/api/products/view/${imgFile}`}
          />
        ))}
      </div>

      <div className="flex justify-end p-4">
        <button
          type="button"
          className="inline-block rounded p-4 m-2 text-xl w-32 text-white bg-green-500"
          onClick={handleClickAddCart}
        >
          Add Cart
        </button>
        <button
          type="button"
          className="inline-block rounded p-4 m-2 text-xl w-32 text-white bg-red-500"
          onClick={() => moveToModify(numPno)}
        >
          Modify
        </button>
        <button
          type="button"
          className="rounded p-4 m-2 text-xl w-32 text-white bg-blue-500"
          onClick={moveToList}
        >
          List
        </button>
      </div>
    </div>
  );
};

export default ReadComponent;
