/**
 * 讀取 LocalStorage 資料
 * @param {string} key - 儲存鍵名
 * @param {any} fallback - 若無資料時的預設值
 */
export function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`讀取 LocalStorage [${key}] 失敗:`, error);
    return fallback;
  }
}

/**
 * 寫入資料到 LocalStorage
 */
export function writeLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`寫入 LocalStorage [${key}] 失敗:`, error);
  }
}

/**
 * 根據顏色字串回傳對應的 Tailwind CSS 類名
 */
export function colorClasses(color) {
  const map = {
    orange: 'text-orange-600 bg-orange-50',
    green: 'text-green-600 bg-green-50',
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    red: 'text-red-600 bg-red-50',
  };
  return map[color] || 'text-gray-600 bg-gray-50';
}