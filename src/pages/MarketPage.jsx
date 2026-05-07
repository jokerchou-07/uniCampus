import React from 'react';
import { Search, Plus, X } from 'lucide-react';

/**
 * 二手市集分頁組件
 */
const MarketPage = ({ 
  isSearchOpen, 
  setIsSearchOpen, 
  searchQuery, 
  setSearchQuery, 
  setIsUploadOpen, 
  activeMarketCat, 
  setActiveMarketCat, 
  marketCategories, // 從 constants 傳入
  filteredMarketItems, 
  setSelectedItem, 
  setCurrentPage 
}) => {
  return (
    <div className="pb-24 animate-in slide-in-from-right">
      {/* Header & Search Bar */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md z-40 px-8 py-4 border-b border-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black text-[#1A1A1A] italic uppercase tracking-tighter">
            Market
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2.5 rounded-xl border transition-all active:scale-90 ${
                isSearchOpen
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-orange-500 border-gray-100 shadow-sm'
              }`}
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="p-2.5 bg-orange-500 text-white rounded-xl shadow-lg active:scale-90 transition-transform"
            >
              <Plus size={22} />
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="pb-2 animate-in slide-in-from-top-2">
            <div className="relative">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋商品..."
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
      <div className="px-8 py-3 flex gap-2 overflow-x-auto scrollbar-hide mb-2">
        {marketCategories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveMarketCat(c)}
            className={`px-5 py-2 rounded-full text-[10px] font-black whitespace-nowrap transition-all ${
              activeMarketCat === c ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid List */}
      <div className="px-8 grid grid-cols-2 gap-5">
        {filteredMarketItems.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              setSelectedItem(item);
              setCurrentPage('itemDetail');
            }}
            className="bg-white border border-gray-50 rounded-[28px] overflow-hidden shadow-md active:scale-[0.98] transition-all"
          >
            <div className="aspect-square relative">
              <img src={item.img} className="w-full h-full object-cover" alt={item.name} />
            </div>
            <div className="p-4">
              <p className="text-[11px] font-black text-gray-800 truncate uppercase tracking-tighter">
                {item.name}
              </p>
              <p className="text-orange-500 font-black text-sm mt-0.5">
                ${item.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketPage;