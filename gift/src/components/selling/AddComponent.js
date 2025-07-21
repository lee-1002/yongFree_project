import { useRef, useState } from "react";
import { postAdd } from "../../api/productsApi";
import FetchingModal from "../common/FetchingModal";
import ResultModal from "../common/ResultModal";
import useCustomMove from "../../hooks/useCustomMove";

const initState = {
  pname: "",
  pdesc: "",
  price: 0,
  brand: "",
  discountRate: 0,
  salePrice: 0, // 자동 계산용으로 상태만 둠
  files: [],
};

const AddComponent = () => {
  const [product, setProduct] = useState({ ...initState });
  const uploadRef = useRef();

  // 진행중 모달
  const [fetching, setFetching] = useState(false);
  // 결과 모달
  const [result, setResult] = useState(null);

  const { moveToList } = useCustomMove(); // 이동을 위한 함수

  const handleChangeProduct = (e) => {
    const { name, value } = e.target;

    if (name === "price" || name === "discountRate") {
      // 앞 0 제거, 단 숫자 '0'은 유지
      const normalizedValue = value.replace(/^0+(?=\d)/, "");
      const parsedValue = parseInt(normalizedValue, 10) || 0;

      setProduct((prev) => {
        const updated = { ...prev, [name]: parsedValue };

        // price 또는 discountRate가 바뀌면 salePrice 자동 계산
        if (name === "price" || name === "discountRate") {
          updated.salePrice = Math.round(
            (updated.price * (100 - updated.discountRate)) / 100
          );
        }

        return updated;
      });
    } else {
      setProduct((prev) => {
        const updated = { ...prev, [name]: value };
        return updated;
      });
    }
  };

  const handleClickAdd = () => {
    const files = uploadRef.current.files;
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    formData.append("pname", product.pname);
    formData.append("pdesc", product.pdesc);
    formData.append("price", product.price.toString());
    formData.append("brand", product.brand);
    formData.append("discountRate", product.discountRate.toString());
    formData.append("salePrice", product.salePrice.toString());

    // 디버깅용 로그
    for (let pair of formData.entries()) {
      console.log("formData ✅", pair[0], ":", pair[1]);
    }

    setFetching(true);

    postAdd(formData).then((data) => {
      setFetching(false);
      setResult(data.result);
    });
  };

  const closeModal = () => {
    setResult(null);
    moveToList("/products", { page: 1 }); // basePath 추가
  };

  return (
    <div className="border-2 border-sky-200 mt-10 m-2 p-4">
      {fetching && <FetchingModal />}
      {result && (
        <ResultModal
          title={"Product Add Result"}
          content={`${result}번 등록 완료`}
          callbackFn={closeModal}
        />
      )}

      {/* pname */}
      <div className="flex justify-center">
        <div className="relative mb-4 flex w-full flex-wrap items-stretch">
          <div className="w-1/5 p-6 text-right font-bold">Product Name</div>
          <input
            className="w-4/5 p-6 rounded-r border border-solid border-neutral-300 shadow-md"
            name="pname"
            type="text"
            value={product.pname}
            onChange={handleChangeProduct}
          />
        </div>
      </div>

      {/* pdesc */}
      <div className="flex justify-center">
        <div className="relative mb-4 flex w-full flex-wrap items-stretch">
          <div className="w-1/5 p-6 text-right font-bold">Desc</div>
          <textarea
            className="w-4/5 p-6 rounded-r border border-solid border-neutral-300 shadow-md resize-y"
            name="pdesc"
            rows="4"
            onChange={handleChangeProduct}
            value={product.pdesc}
          />
        </div>
      </div>

      {/* price */}
      <div className="flex justify-center">
        <div className="relative mb-4 flex w-full flex-wrap items-stretch">
          <div className="w-1/5 p-6 text-right font-bold">Price</div>
          <input
            className="w-4/5 p-6 rounded-r border border-solid border-neutral-300 shadow-md"
            name="price"
            type="number"
            value={product.price === 0 ? "" : product.price}
            onChange={handleChangeProduct}
          />
        </div>
      </div>

      {/* brand */}
      <div className="flex justify-center">
        <div className="relative mb-4 flex w-full flex-wrap items-stretch">
          <div className="w-1/5 p-6 text-right font-bold">Brand</div>
          <input
            className="w-4/5 p-6 rounded-r border border-solid border-neutral-300 shadow-md"
            name="brand"
            type="text"
            value={product.brand}
            onChange={handleChangeProduct}
          />
        </div>
      </div>

      {/* discountRate */}
      <div className="flex justify-center">
        <div className="relative mb-4 flex w-full flex-wrap items-stretch">
          <div className="w-1/5 p-6 text-right font-bold">
            Discount Rate (%)
          </div>
          <input
            className="w-4/5 p-6 rounded-r border border-solid border-neutral-300 shadow-md"
            name="discountRate"
            type="number"
            value={product.discountRate === 0 ? "" : product.discountRate}
            onChange={handleChangeProduct}
          />
        </div>
      </div>

      {/* salePrice 출력 (읽기 전용) */}
      <div className="flex justify-center">
        <div className="relative mb-4 flex w-full flex-wrap items-stretch items-center">
          <div className="w-1/5 p-6 text-right font-bold">Sale Price</div>
          <div className="w-4/5 p-6 rounded-r border border-solid border-neutral-300 shadow-md bg-gray-100">
            {product.salePrice.toLocaleString()} 원
          </div>
        </div>
      </div>

      {/* files */}
      <div className="flex justify-center">
        <div className="relative mb-4 flex w-full flex-wrap items-stretch">
          <div className="w-1/5 p-6 text-right font-bold">Files</div>
          <input
            ref={uploadRef}
            className="w-4/5 p-6 rounded-r border border-solid border-neutral-300 shadow-md"
            type="file"
            multiple
          />
        </div>
      </div>

      {/* add button */}
      <div className="flex justify-end">
        <div className="relative mb-4 flex p-4 flex-wrap items-stretch">
          <button
            type="button"
            className="rounded p-4 w-36 bg-blue-500 text-xl text-white"
            onClick={handleClickAdd}
          >
            ADD
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddComponent;
