export default async function handler(req, res) {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: '缺少座標' });
  }

  // 使用極簡 Query 以加快 kumi 節點的處理速度
  const query = `[out:json][timeout:15];node["shop"="convenience"]["brand"~"7-Eleven|7-11|統一超商",i](around:1000,${lat},${lng});out body;`;

  // 將 kumi.systems 放在最前面進行實驗
  const endpoint = 'https://overpass.kumi.systems/api/interpreter';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 給予 12 秒寬限

  try {
    console.log(`實驗性請求 kumi.systems 節點...`);
    
    const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const elements = (data.elements || []).map(item => ({
        id: item.id,
        lat: item.lat,
        lng: item.lon, // kumi 回傳的是標準 OSM 格式，需將 lon 轉為 lng
        name: item.tags?.name || "7-Eleven"
      }));

      // 如果 kumi 有回傳資料
      if (elements.length > 0) {
        return res.status(200).json({ elements, source: 'kumi.systems' });
      } else {
        return res.status(200).json({ elements: [], message: '該區域無門市資料' });
      }
    } else {
      throw new Error(`Kumi 節點回報狀態: ${response.status}`);
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("Kumi 實驗失敗:", err.message);
    
    // 如果實驗失敗，自動回傳 3 家模擬店，讓你確認前端地圖元件是否正常
    return res.status(200).json({
      source: 'failover-mock',
      elements: [
        { id: 'k1', lat: parseFloat(lat) + 0.001, lng: parseFloat(lng) + 0.001, name: "Kumi連線失敗-備援店A" },
        { id: 'k2', lat: parseFloat(lat) - 0.001, lng: parseFloat(lng) + 0.002, name: "Kumi連線失敗-備援店B" }
      ]
    });
  }
}