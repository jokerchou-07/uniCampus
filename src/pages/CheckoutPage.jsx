import React, { useEffect } from 'react';
import { ChevronLeft, MapPin, CreditCard, Wallet, Store, Gift } from 'lucide-react';
/**
 * 結帳頁面組件
 */
const CheckoutPage = ({
  activeCartTab,
  marketCart,
  foodCart,
  userProfile,
  checkoutData,
  setCheckoutData,
  handleCheckout,
  setCurrentPage
}) => {
  // 定義回饋點數常數
  const REWARD_POINTS = activeCartTab === 'food' ? 5 : 5;

  // 計算總金額
  const list = activeCartTab === 'market' ? marketCart : foodCart;
  const total = list.reduce((a, b) => a + (b.price || 0) * (b.quantity || 1), 0);
  
  // 計算折抵後的最終金額
  const redemption = Math.min(
    checkoutData.pointRedemption || 0,
    userProfile.points || 0,
    total
  );
  const final = total - redemption;
  useEffect(() => {
    setCheckoutData((prev) => ({
      ...prev,
      pointRedemption: 0,
    }));
  }, [activeCartTab]);
  const onConfirm = () => {
    // 除了原本的 checkoutData，我們傳遞點數異動資訊給父組件
    handleCheckout({
      ...checkoutData,
      usedPoints: redemption,
      rewardPoints: REWARD_POINTS,
      finalAmount: final
    });
  };

  return (
    <div className="h-full flex flex-col bg-white animate-in slide-in-from-right">
      {/* Header */}
      <div className="p-4 border-b border-gray-50 flex items-center gap-4">
        <button onClick={() => setCurrentPage('home')} className="p-2 bg-gray-50 rounded-full">
          <ChevronLeft />
        </button>
        <span className="font-black text-xs uppercase tracking-widest text-gray-800">
          Checkout 結帳
        </span>
      </div>

      <div className="flex-1 p-8 space-y-8 overflow-y-auto scrollbar-hide pb-32">
        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 shadow-inner">
          <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4 italic">Summary</h3>
          <div className="space-y-3">
            {list.map((i) => (
              <div key={i.id} className="flex justify-between items-center py-1.5 border-b border-dashed border-gray-200 text-xs font-bold text-gray-700">
                <span>{i.name} x{i.quantity || 1}</span>
                <span>${i.price * (i.quantity || 1)}</span>
              </div>
            ))}
            <div className="pt-4 mt-2 border-t border-gray-300">
              <div className="flex justify-between items-center text-gray-400 text-[10px]">
                <span>SUBTOTAL</span>
                <span>${total}</span>
              </div>
              {redemption > 0 && (
                <div className="flex justify-between items-center mt-1 text-red-500 text-[10px]">
                  <span>POINTS REDEEMED 點數折抵</span>
                  <span>-${redemption}</span>
                </div>
              )}
              <div className="flex justify-between items-center mt-1 text-green-600 text-[10px] font-bold">
                <div className="flex items-center gap-1">
                  <Gift size={10} />
                  <span>ESTIMATED REWARD 預計回饋</span>
                </div>
                <span>+{REWARD_POINTS} Pts</span>
              </div>

              <div className="flex justify-between items-center mt-2 text-2xl font-black text-orange-600 tracking-tighter">
                <span>TOTAL</span>
                <span>${final}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="space-y-4">
          <SectionHeader icon={MapPin} title="配送與取貨" />
          {activeCartTab === 'market' ? (
            <div className="bg-white border border-gray-100 p-5 rounded-[32px] space-y-3 shadow-sm">
              <CheckoutInput 
                placeholder="收件人" 
                value={checkoutData.receiver} 
                onChange={(v) => setCheckoutData({ ...checkoutData, receiver: v })} 
              />
              <CheckoutInput 
                placeholder="電話" 
                value={checkoutData.phone} 
                onChange={(v) => setCheckoutData({ ...checkoutData, phone: v })} 
              />
              <CheckoutInput 
                placeholder="位置 / 門市" 
                value={checkoutData.locationDetail} 
                onChange={(v) => setCheckoutData({ ...checkoutData, locationDetail: v })} 
              />
            </div>
          ) : (
            <div className="bg-orange-50/50 border border-orange-100 p-5 rounded-[32px] flex items-center gap-4 text-orange-800">
              <Store size={24} />
              <div className="flex-1 font-black text-xs">
                至餐廳現場取餐
                <p className="text-[9px] text-orange-600">請憑訂單畫面至櫃檯取餐</p>
              </div>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="space-y-4">
          <SectionHeader icon={CreditCard} title="支付方式" />
          <div className="flex gap-2">
            <PaymentButton 
              active={checkoutData.payment === 'card'} 
              onClick={() => setCheckoutData({ ...checkoutData, payment: 'card' })}
              label="信用卡支付" 
            />
            <PaymentButton 
              active={checkoutData.payment === 'cash'} 
              onClick={() => setCheckoutData({ ...checkoutData, payment: 'cash' })}
              label="取貨付款" 
            />
          </div>
        </div>

        {/* Points Redemption */}
        <div className="space-y-4">
          <SectionHeader icon={Wallet} title="點數折抵" />
          <div className="bg-orange-50 border border-orange-100 rounded-[32px] p-5 flex items-center gap-3 shadow-inner">
            <input
              type="number"
              value={checkoutData.pointRedemption || ''}
              onChange={(e) => setCheckoutData({
                ...checkoutData,
                pointRedemption: Math.min(parseInt(e.target.value) || 0, userProfile.points, total)
              })}
              className="flex-1 p-3 bg-white rounded-xl text-xs font-bold border-none outline-none"
              placeholder="輸入點數"
            />
            <button
              onClick={() => setCheckoutData({ ...checkoutData, pointRedemption: Math.min(userProfile.points, total) })}
              className="bg-orange-500 text-white px-4 py-3 rounded-xl text-[10px] font-black"
            >
              MAX
            </button>
          </div>
        </div>
      </div>

      {/* Footer Confirm */}
      <div className="p-6 border-t border-gray-50 absolute bottom-0 w-full bg-white/95 z-30">
        <button
          onClick={onConfirm}
          className="w-full py-4 bg-gray-900 text-white rounded-[20px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
        >
          確認訂單並送出
        </button>
      </div>
    </div>
  );
};

// 輔助小組件
const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 ml-2 text-orange-500">
    <Icon size={14} />
    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</h3>
  </div>
);

const CheckoutInput = ({ placeholder, value, onChange }) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold border-none outline-none shadow-inner"
    placeholder={placeholder}
  />
);

const PaymentButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 rounded-2xl text-[10px] font-black transition-all ${
      active ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'
    }`}
  >
    {label}
  </button>
);

export default CheckoutPage;