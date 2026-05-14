import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, MapPin, Loader2, RefreshCcw } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 修正 Leaflet 預設圖標路徑
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// 使用者位置紅色圖標
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// 地圖控制中心
const MapController = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (!center) return;

    map.flyTo(center, 16);

    setTimeout(() => {
      map.invalidateSize();
    }, 400);
  }, [center, map]);

  return null;
};

const FoodMapPage = ({ setCurrentPage }) => {
  const [myLocation, setMyLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([23.973875, 120.977503]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);

  const fetchOverpassData = async (lat, lng) => {
    setLoading(true);

    const endpoint = 'https://overpass.kumi.systems/api/interpreter';

    const query = `
      [out:json][timeout:15];
      (
        node["shop"="convenience"]["brand"~"7-Eleven|7-11|統一超商", i](around:500,${lat},${lng});
        way["shop"="convenience"]["brand"~"7-Eleven|7-11|統一超商", i](around:500,${lat},${lng});
      );
      out center tags;
    `;

    try {
      const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error('Overpass 伺服器回應異常');
      }

      const data = await response.json();

      const formatted = (data.elements || [])
        .map((item) => {
          const tags = item.tags || {};

          const latValue = item.lat || item.center?.lat;
          const lngValue = item.lon || item.center?.lon;

          if (!latValue || !lngValue) return null;

          const name = tags.name || tags.brand || tags.operator || '7-Eleven 門市';
          const branch = tags.branch ? ` (${tags.branch})` : '';

          return {
            id: item.id,
            lat: latValue,
            lng: lngValue,
            name: `${name}${branch}`,
            stock: `${Math.floor(Math.random() * 15) + 1}件`,
          };
        })
        .filter(Boolean);

      setStores(formatted);
    } catch (err) {
      console.error('抓取失敗', err);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];

        setMyLocation(coords);
        setMapCenter(coords);
        fetchOverpassData(coords[0], coords[1]);
      },
      () => {
        const fallback = [23.973875, 120.977503];

        setMyLocation(null);
        setMapCenter(fallback);
        fetchOverpassData(fallback[0], fallback[1]);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }, []);

  return (
    <div className="fixed inset-0 bg-white overflow-hidden touch-pan-y font-sans text-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-[4000] flex items-center justify-between px-4">
        <button
          onClick={() => setCurrentPage('home')}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        <h1 className="absolute left-1/2 -translate-x-1/2 text-sm font-black tracking-widest text-gray-800 whitespace-nowrap uppercase">
          I 珍食門市實況
        </h1>

        <button
          onClick={() => {
            const target = myLocation || mapCenter;
            if (target) fetchOverpassData(target[0], target[1]);
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full text-blue-500 hover:bg-blue-50 transition-colors"
        >
          <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      {/* Map Section */}
      <div className="fixed top-16 left-0 right-0 h-[45dvh] z-[1000] bg-gray-100">
        <MapContainer
          center={mapCenter}
          zoom={16}
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <MapController center={mapCenter} />

          {myLocation && (
            <Marker position={myLocation} icon={redIcon}>
              <Popup>你的位置</Popup>
            </Marker>
          )}

          {stores.map((store) => (
            <Marker
              key={store.id}
              position={[store.lat, store.lng]}
              eventHandlers={{
                click: () => setMapCenter([store.lat, store.lng]),
              }}
            >
              <Popup>
                <div className="font-bold">{store.name}</div>
                <div className="text-green-600 font-bold mt-1">
                  i珍食庫存：{store.stock}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* List Section */}
      <div className="absolute inset-x-0 bottom-0 top-[42%] z-[2000] bg-white rounded-t-[32px] shadow-[0_-12px_30px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden">
        <div className="shrink-0 bg-white pt-4">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-3" />

          <div className="px-6 pb-4 flex items-center justify-between border-b border-gray-100">
            <div>
              <h2 className="font-black text-lg text-gray-800">
                附近 500m 門市
              </h2>
            </div>

            <button
              onClick={() => {
                if (myLocation) setMapCenter([...myLocation]);
              }}
              className="text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full"
            >
              回到我的位置
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 pb-[calc(7rem+env(safe-area-inset-bottom))] overscroll-contain">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-sm">
              <Loader2 className="animate-spin mb-3 text-green-500" size={32} />
              <p>搜尋門市中...</p>
            </div>
          )}

          {!loading && stores.length === 0 && (
            <div className="text-center py-20 text-gray-400 text-sm">
              此區域搜尋不到 7-Eleven
            </div>
          )}

          {!loading && stores.length > 0 && (
            <div className="space-y-3">
              {stores.map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => setMapCenter([shop.lat, shop.lng])}
                  className="p-5 bg-gray-50 rounded-[24px] flex justify-between items-center active:scale-[0.96] transition-all cursor-pointer border border-transparent hover:border-green-100"
                >
                  <div className="flex-1 pr-4">
                    <h3 className="font-bold text-gray-800 text-sm mb-1 leading-tight">
                      {shop.name}
                    </h3>

                    <div className="flex items-center text-[11px] text-gray-400 font-medium">
                      <MapPin size={12} className="mr-1" />
                      查看門市位置
                    </div>
                  </div>

                  <div className="bg-green-100/80 px-4 py-2 rounded-2xl text-center min-w-[70px] shrink-0">
                    <p className="text-[10px] text-green-600 font-bold mb-1 leading-none uppercase">
                      庫存
                    </p>
                    <p className="text-green-700 text-sm font-black leading-none">
                      {shop.stock}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodMapPage;