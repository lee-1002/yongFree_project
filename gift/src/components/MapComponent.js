// src/components/MapComponent.js
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getList } from "../api/productsApi";
import { API_SERVER_HOST } from "../api/backendApi";
import useCustomCart from "../hooks/useCustomCart";
import useCustomLogin from "../hooks/useCustomLogin";
import { postChangeCartAsync, getCartItemsAsync } from "../slices/cartSlice";
import ResultModal from "./common/ResultModal";

const MapComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowsRef = useRef([]);
  const myMarkerRef = useRef(null);

  const [places, setPlaces] = useState([]);
  const [myLocation, setMyLocation] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(null);

  const [listType, setListType] = useState("place");
  const [products, setProducts] = useState([]);

  const { cartItems } = useCustomCart();
  const { loginState, isLogin } = useCustomLogin();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalCallback, setModalCallback] = useState(null);

  const showModal = (title, content, callback) => {
    setModalTitle(title);
    setModalContent(content);
    setModalCallback(() => callback);
    setModalVisible(true);
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_KEY}` +
      "&autoload=false&libraries=services";
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        mapRef.current = new window.kakao.maps.Map(
          document.getElementById("map"),
          { center: new window.kakao.maps.LatLng(37.5665, 126.978), level: 3 }
        );
      });
    };
    document.head.appendChild(script);

    getList({ page: 1, size: 20 })
      .then((data) =>
        setProducts(data.dtoList || data.list || data.content || [])
      )
      .catch(() =>
        showModal(
          "상품 조회 오류",
          "상품 목록을 불러오는 중 문제가 발생했습니다.",
          () => setModalVisible(false)
        )
      );
  }, []);

  const getDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371e3;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const clearMarkers = () => {
    markersRef.current.forEach((m) => m.setMap(null));
    infoWindowsRef.current.forEach((i) => i.close());
    markersRef.current = [];
    infoWindowsRef.current = [];
  };

  const showMyLocationMarker = (lat, lon) => {
    if (!mapRef.current) return;
    const pos = new window.kakao.maps.LatLng(lat, lon);
    if (myMarkerRef.current) myMarkerRef.current.setMap(null);
    myMarkerRef.current = new window.kakao.maps.Marker({
      position: pos,
      map: mapRef.current,
      image: new window.kakao.maps.MarkerImage(
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
        new window.kakao.maps.Size(24, 35),
        { offset: new window.kakao.maps.Point(12, 35) }
      ),
    });
  };

  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      return showModal("검색 요청 필요", "검색어를 입력해 주세요.", () =>
        setModalVisible(false)
      );
    }
    if (!window.kakao.maps.services) return;

    if (!myLocation) {
      return navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setMyLocation({ lat: latitude, lon: longitude });
        showMyLocationMarker(latitude, longitude);
        setTimeout(handleSearch, 300);
      });
    }

    const ps = new window.kakao.maps.services.Places();
    clearMarkers();
    ps.keywordSearch(
      searchKeyword,
      (data, status) => {
        if (
          status !== window.kakao.maps.services.Status.OK ||
          data.length === 0
        ) {
          setPlaces([]);
          return showModal(
            "검색 결과 없음",
            `"${searchKeyword}"에 대한 결과가 없습니다.`,
            () => setModalVisible(false)
          );
        }
        const results = data
          .map((p) => ({
            ...p,
            distance: getDistance(
              myLocation.lat,
              myLocation.lon,
              parseFloat(p.y),
              parseFloat(p.x)
            ),
          }))
          .filter((p) => p.distance <= 2000)
          .sort((a, b) => a.distance - b.distance);

        setPlaces(results);
        setHighlightIndex(null);

        const bounds = new window.kakao.maps.LatLngBounds();
        results.forEach((place, idx) => {
          const position = new window.kakao.maps.LatLng(place.y, place.x);
          const marker = new window.kakao.maps.Marker({
            position,
            map: mapRef.current,
          });
          const infoWindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:6px;">🍴 ${place.place_name}</div>`,
          });
          window.kakao.maps.event.addListener(marker, "click", () => {
            infoWindowsRef.current.forEach((i) => i.close());
            infoWindow.open(mapRef.current, marker);
            mapRef.current.setCenter(position);
            setHighlightIndex(idx);
          });
          markersRef.current.push(marker);
          infoWindowsRef.current.push(infoWindow);
          bounds.extend(position);
        });
        mapRef.current.setBounds(bounds);
        showMyLocationMarker(myLocation.lat, myLocation.lon);
      },
      {
        location: new window.kakao.maps.LatLng(myLocation.lat, myLocation.lon),
        radius: 2000,
      }
    );
  };

  const handleAddCart = (pno) => {
    if (!isLogin) {
      showModal("로그인 필요", "장바구니를 이용하려면 로그인 해주세요.", () =>
        navigate("/member/login")
      );
      return;
    }

    let qty = 1;
    const exist = cartItems.find((i) => i.pno === pno);
    if (exist) {
      if (
        !window.confirm(
          "이미 장바구니에 있는 상품입니다. 수량을 추가하시겠습니까?"
        )
      )
        return;
      qty = exist.qty + 1;
    }

    dispatch(postChangeCartAsync({ email: loginState.email, pno, qty }))
      .then((action) => {
        if (action.error) {
          console.error(action.error);
          return showModal("추가 실패", "장바구니 추가에 실패했습니다.", () =>
            setModalVisible(false)
          );
        }
        dispatch(getCartItemsAsync());
        showModal("추가 완료", "상품이 장바구니에 성공적으로 담겼습니다.", () =>
          setModalVisible(false)
        );
      })
      .catch((err) => {
        console.error(err);
        showModal("오류 발생", "장바구니 처리 중 오류가 발생했습니다.", () =>
          setModalVisible(false)
        );
      });
  };

  // 탭 스타일 (border shorthand 제거, borderBottom만 사용)
  const tabBase = {
    background: "none",
    padding: "4px 12px",
    cursor: "pointer",
  };
  const activeTab = {
    ...tabBase,
    fontWeight: "bold",
    borderBottom: "2px solid #333",
  };
  const inactiveTab = {
    ...tabBase,
    color: "#666",
    borderBottom: "none",
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          height: "80vh",
          maxWidth: 1160,
          margin: "0 auto",
          padding: 8,
          boxSizing: "border-box",
        }}
      >
        {/* 지도 영역 */}
        <div
          style={{
            flex: 3,
            display: "flex",
            flexDirection: "column",
            marginRight: 8,
          }}
        >
          <h3 style={{ margin: "4px 0" }}>📍 우리 동네 기프티콘</h3>
          <div style={{ paddingBottom: 4 }}>
            <input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="가게 이름 검색"
              style={{ padding: "4px", width: 160, marginRight: 4 }}
            />
            <button onClick={handleSearch} style={{ padding: "4px 8px" }}>
              검색
            </button>
          </div>
          <div
            id="map"
            style={{
              flex: 1,
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* 리스트 영역 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            borderLeft: "1px solid #ddd",
            paddingLeft: 8,
          }}
        >
          <div style={{ paddingBottom: 4, borderBottom: "1px solid #ddd" }}>
            <h3 style={{ margin: "4px 0" }}>📋 결과 리스트</h3>
            <div>
              <button
                style={listType === "place" ? activeTab : inactiveTab}
                onClick={() => setListType("place")}
              >
                가게
              </button>
              <button
                style={listType === "product" ? activeTab : inactiveTab}
                onClick={() => setListType("product")}
              >
                상품
              </button>
            </div>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              paddingTop: 4,
            }}
          >
            {listType === "place" ? (
              places.length === 0 ? (
                <p style={{ margin: 4 }}>가게 검색 결과가 없습니다.</p>
              ) : (
                places.map((place, idx) => (
                  <div
                    key={place.id || `${place.x}-${place.y}`}
                    onClick={() =>
                      window.kakao.maps.event.trigger(
                        markersRef.current[idx],
                        "click"
                      )
                    }
                    style={{
                      padding: 6,
                      marginBottom: 6,
                      border: "1px solid #eee",
                      borderRadius: 4,
                      backgroundColor:
                        highlightIndex === idx ? "#fffae6" : "#fff",
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    <strong>
                      {idx + 1}. {place.place_name}
                    </strong>
                    <div style={{ color: "#555" }}>
                      {place.road_address_name || place.address_name} ·{" "}
                      {Math.round(place.distance)}m
                    </div>
                  </div>
                ))
              )
            ) : products.length === 0 ? (
              <p style={{ margin: 4 }}>상품이 없습니다.</p>
            ) : (
              products.map((prod) => (
                <div
                  key={prod.pno}
                  style={{
                    padding: 6,
                    marginBottom: 6,
                    border: "1px solid #eee",
                    borderRadius: 4,
                    textAlign: "center",
                    fontSize: 14,
                  }}
                >
                  {prod.uploadFileNames[0] && (
                    <img
                      src={`${API_SERVER_HOST}/api/products/view/${prod.uploadFileNames[0]}`}
                      alt={prod.pname}
                      style={{
                        width: "100%",
                        height: "auto",
                        marginBottom: 4,
                      }}
                    />
                  )}
                  <strong>{prod.pname}</strong>
                  <div style={{ color: "#555" }}>
                    {prod.price.toLocaleString()}원
                  </div>
                  <button
                    onClick={() => handleAddCart(prod.pno)}
                    style={{
                      marginTop: 4,
                      padding: "4px 8px",
                      border: "none",
                      borderRadius: 4,
                      backgroundColor: "#4caf50",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    장바구니
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {modalVisible && (
        <ResultModal
          title={modalTitle}
          content={modalContent}
          callbackFn={() => {
            setModalVisible(false);
            modalCallback && modalCallback();
          }}
        />
      )}
    </>
  );
};

export default MapComponent;
