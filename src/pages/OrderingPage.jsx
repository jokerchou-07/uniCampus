import React from 'react';
import { Search, X, Star, ChevronLeft } from 'lucide-react';

/**
 * 校內訂餐頁面組件
 */
const OrderingPage = ({
  isSearchOpen,
  setIsSearchOpen,
  searchQuery,
  setSearchQuery,
  activeFoodCat,
  setActiveFoodCat,
  foodCategories, // 來自 constants
  filteredStores,
  setSelectedStore,
  setCurrentPage
}) => {
  return (
    <div className="pb-24 animate-in slide-in-from-right">
      {/* Header & Search */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md z-40 px-8 py-4 border-b border-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black text-[#1A1A1A] italic uppercase tracking-tighter">
            Dining
          </h2>
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-2.5 rounded-xl border transition-all active:scale-90 ${
              isSearchOpen ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-orange-500 border-gray-100 shadow-sm'
            }`}
          >
            <Search size={20} />
          </button>
        </div>

        {isSearchOpen && (
          <div className="pb-2 animate-in slide-in-from-top-2">
            <div className="relative">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋餐廳..."
                className="w-full p-3 pl-10 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:border-orange-400 transition-all shadow-inner"
              />
              <Search size={14} className="absolute left-4 top-3.5 text-gray-400" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-3 text-gray-300">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="px-8 py-3 flex gap-2 overflow-x-auto scrollbar-hide mb-4">
        {foodCategories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveFoodCat(c)}
            className={`px-5 py-2 rounded-full text-[10px] font-black whitespace-nowrap transition-all ${
              activeFoodCat === c
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Store List */}
      <div className="px-8 space-y-5">
        {filteredStores.map((s) => (
          <div
            key={s.id}
            onClick={() => {
              setSelectedStore(s);
              setCurrentPage('storeDetail');
            }}
            className="bg-white border border-gray-100 p-5 rounded-[32px] flex items-center gap-5 active:bg-gray-50 transition-all shadow-md"
          >
            <img src={s.img} className="w-16 h-16 rounded-[20px] object-cover" alt={s.name} />
            <div className="flex-1">
              <h4 className="font-black text-base text-gray-800 tracking-tighter">
                {s.name}
              </h4>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[9px] font-black text-orange-500 uppercase bg-orange-50 px-2 py-0.5 rounded-full">
                  {s.wait}
                </span>
                <span className="text-yellow-500 font-black text-xs flex items-center gap-1">
                  <Star size={14} fill="currentColor" /> {s.rating}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderingPage;