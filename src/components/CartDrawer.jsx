import React from 'react';
import { X, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';

/**
 * 購物車抽屜組件
 */
const CartDrawer = ({ 
  isOpen, 
  onClose, 
  user, 
  activeCartTab, 
  setActiveCartTab, 
  marketCart, 
  foodCart, 
  updateFoodQty, 
  deleteMarketCartItem, 
  setCurrentPage 
}) => {
  if (!isOpen) return null;

  const currentList = activeCartTab === 'market' ? marketCart : foodCart;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[200] animate-in fade-in flex items-end">
      <div className="w-full bg-white max-h-[80%] flex flex-col rounded-t-[50px] shadow-2xl animate-in slide-in-from-bottom snappy-anim">
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-center">
          <h3 className="font-black text-lg text-gray-800 uppercase tracking-tighter">
            My Cart
          </h3>
          <button onClick={onClose} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 active:rotate-90 transition-all">
            <X size={20} />
          </button>
        </div>

        {!user ? (
          <div className="p-20 text-center text-gray-400 font-bold">請先登入以使用購物車</div>
        ) : (
          <>
            {/* Tabs */}
            <div className="px-8 py-2 flex gap-3">
              <button
                onClick={() => setActiveCartTab('market')}
                className={`flex-1 py-3 rounded-2xl text-[10px] font-black transition-all ${
                  activeCartTab === 'market' ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-50 text-gray-300'
                }`}
              >
                市集 ({marketCart.length})
              </button>
              <button
                onClick={() => setActiveCartTab('food')}
                className={`flex-1 py-3 rounded-2xl text-[10px] font-black transition-all ${
                  activeCartTab === 'food' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-50 text-gray-300'
                }`}
              >
                餐飲 ({foodCart.length})
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-8 space-y-3 scrollbar-hide">
              {currentList.length === 0 ? (
                <div className="text-center py-20 text-gray-200 font-black italic text-xs uppercase tracking-widest">Empty</div>
              ) : (
                currentList.map((i) => (
                  <div key={i.id} className="flex gap-4 items-center bg-gray-50/50 p-4 rounded-[28px] border border-gray-100 shadow-sm">
                    <img src={i.img || 'https://via.placeholder.com/150'} className="w-12 h-12 object-cover rounded-xl" alt="" />
                    <div className="flex-1">
                      <h4 className="font-black text-[11px] text-gray-800 truncate uppercase tracking-tighter">{i.name}</h4>
                      <span className="text-orange-500 font-black text-[11px]">${i.price * (i.quantity || 1)}</span>
                    </div>

                    {activeCartTab === 'food' ? (
                      <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
                        <button onClick={() => updateFoodQty(i.id, -1)} className="w-6 h-6 flex items-center justify-center bg-gray-50 rounded-lg text-orange-500"><Minus size={12} /></button>
                        <span className="text-[11px] font-black min-w-[16px] text-center">{i.quantity}</span>
                        <button onClick={() => updateFoodQty(i.id, 1)} className="w-6 h-6 flex items-center justify-center bg-gray-50 rounded-lg text-orange-500"><Plus size={12} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-1 rounded-md">數量: 1</span>
                        <button onClick={() => deleteMarketCartItem(i.id)} className="text-gray-200 active:text-red-500 transition-colors p-2"><Trash2 size={18} /></button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer Button */}
            <div className="p-8 border-t border-gray-50">
              <button
                onClick={() => { onClose(); setCurrentPage('checkout'); }}
                className="w-full py-4 bg-gray-900 text-white rounded-[20px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                disabled={currentList.length === 0}
              >
                結帳
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;