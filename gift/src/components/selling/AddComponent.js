import React, { useRef, useState } from "react";
import { postAdd } from "../../api/productsApi";
import FetchingModal from "../common/FetchingModal";
import ResultModal from "../common/ResultModal";
import useCustomMove from "../../hooks/useCustomMove";
import "./AddComponent.css";

const initState = {
  pname: "",
  pdesc: "",
  price: 0,
  brand: "",
  discountRate: 0,
  salePrice: 0,
  files: [],
};

const AddComponent = () => {
  const [product, setProduct] = useState({ ...initState });
  const uploadRef = useRef();
  const [fetching, setFetching] = useState(false);
  const [result, setResult] = useState(null);
  const { moveToList } = useCustomMove();

  const handleChangeProduct = (e) => {
    const { name, value } = e.target;

    // price, discountRate 입력 시 숫자만 허용
    if (name === "price" || name === "discountRate") {
      // 빈 문자열은 허용 (사용자가 지우는 중일 수 있어서)
      if (value !== "" && /[^0-9]/.test(value)) {
        alert("반드시 숫자를 입력해주십시오");
        return; // 상태 업데이트도 막음
      }
      const num = parseInt(value || "0", 10);
      setProduct((prev) => {
        const updated = { ...prev, [name]: num };
        updated.salePrice = Math.round(
          (updated.price * (100 - updated.discountRate)) / 100
        );
        return updated;
      });
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleClickAdd = () => {
    // 최종 제출 전에도 한 번 더 검증
    if (
      !/^\d+$/.test(product.price.toString()) ||
      !/^\d+$/.test(product.discountRate.toString())
    ) {
      alert("반드시 숫자를 입력해주십시오");
      return;
    }

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

    setFetching(true);
    postAdd(formData).then((data) => {
      setFetching(false);
      setResult(data.result);
    });
  };

  const closeModal = () => {
    setResult(null);
    moveToList("/selling", { page: 1 });
  };

  return (
    <div className="add-component">
      {fetching && <FetchingModal className="modal-overlay" />}
      {result && (
        <ResultModal
          title="Product Add Result"
          content={`${result}번 등록 완료`}
          callbackFn={closeModal}
        />
      )}

      {/* Brand */}
      <div className="form-group">
        <div className="form-label">Brand</div>
        <div className="form-input">
          <input
            name="brand"
            type="text"
            value={product.brand}
            onChange={handleChangeProduct}
          />
        </div>
      </div>

      {/* Product Name */}
      <div className="form-group">
        <div className="form-label">Product Name</div>
        <div className="form-input">
          <input
            name="pname"
            type="text"
            value={product.pname}
            onChange={handleChangeProduct}
          />
        </div>
      </div>

      {/* Price */}
      <div className="form-group">
        <div className="form-label">Price</div>
        <div className="form-input">
          <input
            name="price"
            type="text" // 문자 제한을 위해 number -> text로 변경해도 좋습니다
            value={product.price === 0 ? "" : product.price}
            onChange={handleChangeProduct}
          />
        </div>
      </div>

      {/* Discount Rate (%) */}
      <div className="form-group">
        <div className="form-label">Discount Rate (%)</div>
        <div className="form-input">
          <input
            name="discountRate"
            type="text" // 동일
            value={product.discountRate === 0 ? "" : product.discountRate}
            onChange={handleChangeProduct}
          />
        </div>
      </div>

      {/* Sale Price (읽기 전용) */}
      <div className="form-group">
        <div className="form-label">Sale Price</div>
        <div className="form-input">
          <input
            className="readonly-input"
            type="text"
            readOnly
            value={`${product.salePrice.toLocaleString()} 원`}
          />
        </div>
      </div>

      {/* Desc */}
      <div className="form-group">
        <div className="form-label">Desc</div>
        <div className="form-input">
          <textarea
            name="pdesc"
            rows="4"
            value={product.pdesc}
            onChange={handleChangeProduct}
          />
        </div>
      </div>

      {/* Files */}
      <div className="form-group">
        <div className="form-label">Files</div>
        <div className="form-input">
          <input ref={uploadRef} type="file" multiple />
        </div>
      </div>

      {/* ADD 버튼 */}
      <div className="button-group">
        <button type="button" onClick={handleClickAdd}>
          ADD
        </button>
      </div>
    </div>
  );
};

export default AddComponent;
