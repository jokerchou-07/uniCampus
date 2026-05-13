import React, { useEffect, useState } from 'react';
import { ChevronLeft, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 修正預設 Leaflet Marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// 紅色圖釘 (我的位置)
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// 地圖控制組件：監控 mapCenter 並移動
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16);
      setTimeout(() => { map.invalidateSize(); }, 400);
    }
  }, [center, map]);
  return null;
};

const FoodMapPage = ({ setCurrentPage }) => {
  const [myLocation, setMyLocation] = useState(null); // 你的真實位置 (不變)
  const [mapCenter, setMapCenter] = useState(null);   // 地圖聚焦中心 (會變)
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1) return '--';
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords = [latitude, longitude];
        setMyLocation(coords);  // 記錄我的位置
        setMapCenter(coords);   // 初始化中心點
        fetchNearbyStores(latitude, longitude);
      },
      () => { alert('請開啟定位權限'); },
      { enableHighAccuracy: true }
    );
  }, []);

  const fetchNearbyStores = async (lat, lng) => {
    setLoading(true);
    const query = `[out:json];node["brand"="7-Eleven"](around:1500,${lat},${lng});out;`;
    try {
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();
      setStores(data.elements.map((item) => ({
        id: item.id,
        name: (item.tags.name || '7-Eleven') + (item.tags.branch ? ` (${item.tags.branch})` : ''),
        lat: item.lat,
        lng: item.lon,
        stock: Math.floor(Math.random() * 15) + 1 + '件',
      })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-white overflow-hidden font-sans">
      <header className="fixed top-0 left-0 w-full h-16 bg-white border-b z-[4000] flex items-center justify-between px-4">
        <button onClick={() => setCurrentPage('home')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <span className="font-black text-sm tracking-widest uppercase text-gray-800">I 珍食門市實況</span>
        <div className="w-10" />
      </header>

      <div className="fixed top-16 left-0 w-full h-[430px] z-[1000] bg-gray-50">
        <MapContainer center={myLocation || [24.18, 120.60]} zoom={15} zoomControl={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {/* 控制地圖飛往 mapCenter */}
          <MapController center={mapCenter} />

          {/* 我的真實位置：永遠顯示，不會消失 */}
          {myLocation && (
            <Marker position={myLocation} icon={redIcon}>
              <Popup>你的位置</Popup>
            </Marker>
          )}

          {/* 門市圖釘 */}
          {stores.map((s) => (
            <Marker 
              key={s.id} 
              position={[s.lat, s.lng]}
              eventHandlers={{ click: () => setMapCenter([s.lat, s.lng]) }}
            >
              <Popup>{s.name}<br/>庫存：{s.stock}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="absolute top-[470px] left-0 right-0 bottom-0 z-[2000] bg-white shadow-[0_-12px_30px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden">
        <div className="shrink-0 bg-white pt-4">
          <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-2" />
          <div className="px-8 py-3 flex items-center justify-between border-b border-gray-50">
            <h3 className="font-bold text-gray-800 text-lg">附近 1.5km 門市</h3>
            {/* 新增一個按鈕可以快速回看自己的位置 */}
            <button 
                onClick={() => setMapCenter(myLocation)}
                className="text-xs text-blue-500 font-bold"
            >
                回我的位置
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 bg-white pb-10">
          <div className="space-y-4 pt-4">
            {stores.length === 0 && !loading && (
              <div className="text-center py-20 text-gray-400 text-sm">搜尋不到附近門市</div>
            )}
            {stores.map((shop) => (
              <div
                key={shop.id}
                onClick={() => setMapCenter([shop.lat, shop.lng])} // 點擊移動中心，但不改變 myLocation
                className="bg-gray-50 p-5 rounded-[28px] flex justify-between items-center active:scale-[0.95] transition-all cursor-pointer hover:bg-gray-100"
              >
                <div className="flex-1 pr-4">
                  <h4 className="font-bold text-gray-800 text-sm mb-1">{shop.name}</h4>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                    <MapPin size={12} />
                    距離 {calculateDistance(myLocation?.[0], myLocation?.[1], shop.lat, shop.lng)} km
                  </p>
                </div>
                <div className="bg-green-100/50 px-4 py-2 rounded-2xl shrink-0">
                  <span className="text-green-700 text-sm font-black">{shop.stock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodMapPage;