import React from 'react';
import { ChevronLeft, MessageCircle, CheckCircle2 } from 'lucide-react';

const ItemDetailPage = ({ selectedItem, setCurrentPage, addToMarketCart }) => {
  if (!selectedItem) return null;

  return (
    <div className="h-full flex flex-col bg-white animate-in slide-in-from-bottom">
      <div className="p-4 flex items-center justify-between border-b border-gray-50">
        <button onClick={() => setCurrentPage('market')} className="p-2 bg-gray-50 rounded-full">
          <ChevronLeft size={22} />
        </button>
        <span className="font-black text-xs uppercase tracking-widest text-gray-800">Product Detail</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <img src={selectedItem.img} className="w-full aspect-square object-cover" alt="" />
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <h1 className="text-xl font-black text-gray-800 uppercase tracking-tighter leading-tight">
              {selectedItem.name}
            </h1>
            <div className="text-2xl font-black text-orange-500">${selectedItem.price}</div>
          </div>

          <div className="p-5 bg-gray-50 rounded-[28px] flex items-center justify-between border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-500 font-black text-lg shadow-sm">
                {selectedItem.user?.[0] || 'U'}
              </div>
              <div>
                <p className="text-xs font-black text-gray-800">{selectedItem.user}</p>
                <p className="text-[8px] text-green-600 font-bold uppercase flex items-center gap-1 mt-0.5">
                  <CheckCircle2 size={10} /> 已驗證成員
                </p>
              </div>
            </div>
            <button className="p-2.5 bg-white text-orange-500 rounded-lg shadow-sm border border-orange-50 active:scale-90">
              <MessageCircle size={18} />
            </button>
          </div>

          <p className="text-sm text-gray-500 leading-relaxed font-medium">{selectedItem.desc}</p>
        </div>
      </div>

      <div className="p-6 border-t border-gray-50">
        <button
          onClick={() => addToMarketCart(selectedItem)}
          className="w-full py-4 bg-orange-500 text-white rounded-[20px] font-black uppercase shadow-xl active:scale-95 transition-all"
        >
          加入購物車
        </button>
      </div>
    </div>
  );
};

export default ItemDetailPage;