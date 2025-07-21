// src/components/MapPage.js
import React, { useEffect, useRef, useState } from "react";

export default function MapPage() {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [userLoc, setUserLoc] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [placeList, setPlaceList] = useState([]);
  const markersRef = useRef([]);
  const pulseOverlayRef = useRef(null);
  const infoWindowRef = useRef(null);

  const loadKakaoMapScript = () => {
    return new Promise((resolve, reject) => {
      if (window.kakao && window.kakao.maps) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_API_KEY}&autoload=false&libraries=services,clusterer,geometry`;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const clearMarkers = () => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    infoWindowRef.current?.setMap?.(null);
    infoWindowRef.current = null;
  };

  const showUserLocation = (kakaoMap, loc) => {
    pulseOverlayRef.current?.setMap(null);
    const overlay = new window.kakao.maps.CustomOverlay({
      position: loc,
      content: `<div class="pulse-dot"></div>`,
      yAnchor: 0.5,
    });
    overlay.setMap(kakaoMap);
    pulseOverlayRef.current = overlay;
  };

  const showBalloon = (place) => {
    if (!map) return;
    infoWindowRef.current?.setMap(null);
    const pos = new window.kakao.maps.LatLng(place.y, place.x);
    const content = `
      <div style="position:relative; background:#fff; border:2px solid #3B82F6;
                  border-radius:10px; padding:4px 10px; box-shadow:0 2px 8px rgba(59,130,246,0.09);
                  font-size:14px; font-weight:500; display:inline-block; min-width:60px;
                  text-align:center; white-space:nowrap;">
        ${place.place_name}
        <span style="position:absolute; left:50%; bottom:-10px; transform:translateX(-50%);
                     border-left:7px solid transparent; border-right:7px solid transparent;
                     border-top:10px solid #3B82F6;"></span>
        <span style="position:absolute; left:50%; bottom:-9px; transform:translateX(-50%);
                     border-left:6px solid transparent; border-right:6px solid transparent;
                     border-top:8px solid #fff; z-index:1;"></span>
      </div>`;
    const overlay = new window.kakao.maps.CustomOverlay({
      position: pos,
      content,
      yAnchor: 2,
      zIndex: 20,
    });
    overlay.setMap(map);
    infoWindowRef.current = overlay;
    map.setCenter(pos);
  };

  const searchNearby = (loc, query) => {
    if (!map || !loc) return;
    setLoading(true);
    clearMarkers();

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(
      query.trim() || "음식점",
      (data, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const bounds = new window.kakao.maps.LatLngBounds();
          setPlaceList(data);
          data.forEach((place) => {
            const pos = new window.kakao.maps.LatLng(place.y, place.x);
            const marker = new window.kakao.maps.Marker({ map, position: pos });
            window.kakao.maps.event.addListener(marker, "click", () => {
              showBalloon(place);
              setPlaceList((prev) => {
                const idx = prev.findIndex((p) => p.id === place.id);
                if (idx > 0)
                  return [
                    prev[idx],
                    ...prev.slice(0, idx),
                    ...prev.slice(idx + 1),
                  ];
                return prev;
              });
            });
            markersRef.current.push(marker);
            bounds.extend(pos);
          });
          bounds.extend(loc);
          map.setBounds(bounds);
          showUserLocation(map, loc);
        } else {
          setPlaceList([]);
          map.setCenter(loc);
          map.setLevel(4);
          showUserLocation(map, loc);
        }
        setLoading(false);
      },
      { location: loc, radius: 2000, page: 1 }
    );
  };

  useEffect(() => {
    const init = async () => {
      try {
        await loadKakaoMapScript();

        if (!document.getElementById("pulse-dot-style")) {
          const style = document.createElement("style");
          style.id = "pulse-dot-style";
          style.textContent = `
            .pulse-dot { width:12px; height:12px; background:#ff3b30; border-radius:50%; position:relative; }
            .pulse-dot::after {
              content:""; position:absolute; top:0; left:0;
              width:12px; height:12px; border-radius:50%;
              border:2px solid rgba(59,130,246,0.4);
              animation:pulse 3s ease-out infinite;
            }
            @keyframes pulse { 0% { transform:scale(1); opacity:1 } 100% { transform:scale(3); opacity:0 } }
          `;
          document.head.appendChild(style);
        }

        window.kakao.maps.load(() => {
          if (!mapRef.current) return;

          const kakaoMap = new window.kakao.maps.Map(mapRef.current, {
            center: new window.kakao.maps.LatLng(37.5665, 126.978),
            level: 4,
          });

          setMap(kakaoMap);

          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              ({ coords }) => {
                const loc = new window.kakao.maps.LatLng(
                  coords.latitude,
                  coords.longitude
                );
                setUserLoc(loc);
                kakaoMap.setCenter(loc);
                showUserLocation(kakaoMap, loc);
                searchNearby(loc, "");
              },
              () => alert("위치 정보를 가져올 수 없습니다.")
            );
          }
        });
      } catch (err) {
        console.error("지도 초기화 에러:", err);
      }
    };

    init();
  }, []);

  const handleRecenter = () => {
    if (!userLoc || !map) return;
    map.setCenter(userLoc);
    map.setLevel(4);
    showUserLocation(map, userLoc);
    searchNearby(userLoc, keyword);
  };

  const formatDistance = (d) =>
    d >= 1000 ? `${(d / 1000).toFixed(1)}km` : `${Math.round(d)}m`;

  const handleSearch = () => {
    searchNearby(userLoc, keyword);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4">
      <div className="flex-1">
        <h1 className="text-2xl font-semibold mb-4">우리 동네 기프티콘</h1>
        <div className="flex space-x-2 mb-4">
          <input
            className="border p-2 flex-1"
            type="text"
            placeholder="브랜드명 또는 상품명 입력"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            className={`px-4 py-2 rounded text-white ${
              loading ? "bg-blue-500" : "bg-blue-500 hover:bg-blue-600"
            }`}
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "검색 중..." : "검색"}
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleRecenter}
          >
            내 위치
          </button>
        </div>
        <div
          ref={mapRef}
          style={{ width: "100%", height: "600px" }}
          className="border rounded"
        />
      </div>

      <div className="w-full lg:w-[340px] flex flex-col items-center">
        <div
          className="h-[655px] w-full overflow-y-auto bg-white border rounded shadow-sm p-4 mt-[55px]"
          style={{ maxWidth: 340 }}
        >
          <h2 className="text-lg font-bold mb-2">매장 리스트</h2>
          {placeList.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              검색 결과가 없습니다.
            </div>
          ) : (
            <ul>
              {placeList.map((place, idx) => {
                let dist = "";
                if (userLoc && window.kakao?.maps?.geometry) {
                  const d = window.kakao.maps.geometry.getDistance(
                    userLoc,
                    new window.kakao.maps.LatLng(place.y, place.x)
                  );
                  dist = formatDistance(d);
                }
                return (
                  <li
                    key={place.id || place.place_url}
                    className={`mb-3 cursor-pointer hover:bg-blue-50 p-2 rounded flex items-center gap-3 ${
                      idx === 0 ? "bg-blue-100" : ""
                    }`}
                    onClick={() => {
                      setPlaceList((prev) => {
                        const i = prev.findIndex((p) => p.id === place.id);
                        if (i > 0)
                          return [
                            prev[i],
                            ...prev.slice(0, i),
                            ...prev.slice(i + 1),
                          ];
                        return prev;
                      });
                      showBalloon(place);
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">
                          {place.place_name}
                        </span>
                        {dist && (
                          <span className="text-xs text-gray-700">{dist}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {place.road_address_name || place.address_name}
                      </div>
                      <div className="text-xs text-blue-500 truncate">
                        {place.phone}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
