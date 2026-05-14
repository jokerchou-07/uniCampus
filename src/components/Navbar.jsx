import React from 'react';

/**
 * Navbar 組件
 * @param {string} currentPage - 目前頁面 ID
 * @param {function} setCurrentPage - 切換頁面的函式
 * @param {object} user - 使用者登入狀態
 * @param {function} triggerLoginPrompt - 觸發登入提醒的函式
 * @param {Array} navItems - 導覽列項目配置
 */
const Navbar = ({ currentPage, setCurrentPage, user, triggerLoginPrompt, navItems }) => {
  // 判斷哪些頁面不需要顯示導覽列
  const hideNavPages = [
    'itemDetail', 'storeDetail', 'checkout', 'historyView', 
    'exchange', 'foodMap', 'orderTracking'
  ];

  if (hideNavPages.includes(currentPage)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white px-8 py-4 pb-[calc(2rem+env(safe-area-inset-bottom))] flex justify-between items-center z-[90] border-t border-gray-50">
      {navItems.map((i) => (
        <button
          key={i.id}
          onClick={() => {
            // 如果不是回首頁且沒登入，就擋住
            if (i.id !== 'home' && !user) return triggerLoginPrompt();
            setCurrentPage(i.id);
          }}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentPage === i.id ? 'text-orange-500 scale-110' : 'text-gray-200'
          }`}
        >
          <i.icon size={20} strokeWidth={currentPage === i.id ? 4 : 2.5} />
          {currentPage === i.id && (
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-0.5 shadow-lg animate-pulse" />
          )}
        </button>
      ))}
    </nav>
  );
};

export default Navbar;