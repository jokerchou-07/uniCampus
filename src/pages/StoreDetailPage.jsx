import React from 'react';
import { ChevronLeft, Plus } from 'lucide-react';

const StoreDetailPage = ({ selectedStore, setCurrentPage, foodCart, addFoodToCart }) => {
  if (!selectedStore) return null;

  return (
    <div className="h-full flex flex-col bg-white animate-in slide-in-from-bottom">
      <div className="p-4 bg-red-600 text-white flex items-center justify-between shadow-md">
        <button onClick={() => setCurrentPage('ordering')} className="p-2 active:bg-white/10 rounded-full">
          <ChevronLeft size={22} />
        </button>
        <span className="font-black text-xs uppercase tracking-widest italic">Store Menu</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="text-center">
          <img src={selectedStore.img} className="w-24 h-24 rounded-[35px] mx-auto shadow-xl border-4 border-white mb-4" alt="" />
          <h1 className="text-xl font-black uppercase text-gray-900 tracking-tighter">{selectedStore.name}</h1>
        </div>

        <div className="space-y-4">
          {selectedStore.menu.map((m) => {
            const inCart = foodCart.find((i) => i.id === m.id);
            return (
              <div key={m.id} className="p-5 border border-gray-50 bg-white rounded-[28px] flex items-center justify-between shadow-md">
                <div>
                  <p className="font-black text-sm uppercase text-gray-800">{m.name}</p>
                  <p className="text-red-500 font-black text-base mt-0.5">${m.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  {inCart && (
                    <span className="text-xs font-black text-red-500 bg-red-50 px-3 py-1 rounded-full">
                      x{inCart.quantity}
                    </span>
                  )}
                  <button
                    onClick={() => addFoodToCart(m, selectedStore)}
                    className="p-2.5 bg-red-500 text-white rounded-xl shadow-lg active:scale-90"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StoreDetailPage;