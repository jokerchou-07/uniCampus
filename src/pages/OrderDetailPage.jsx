import React from 'react';
import { ChevronLeft, Calendar, FileText, ShoppingBag, DollarSign, Gift } from 'lucide-react';

export default function OrderDetailPage({ order, setCurrentPage }) {
  if (!order) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6">
        <p className="font-black">找不到此筆訂單資訊</p>
        <button onClick={() => setCurrentPage('historyView')} className="mt-4 px-4 py-2 bg-white text-white rounded-xl text-xs font-black">
          返回歷史紀錄
        </button>
      </div>
    );
  }

  // 格式化時間
  const orderDate = new Date(order.at).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="h-full bg-white flex flex-col animate-in slide-in-from-right">
      {/* 頂部導覽列 */}
      <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => setCurrentPage('historyView')} className="p-2 bg-gray-50 rounded-full text-gray-600 active:scale-90 transition-transform">
          <ChevronLeft size={20} />
        </button>
        <span className="font-black text-sm tracking-wider text-gray-800">訂單詳情明細</span>
        <div className="w-9" />
      </div>

      {/* 內容區域 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 pb-12">
        {/* 狀態大卡片 */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm text-center space-y-2">
          <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <ShoppingBag size={24} />
          </div>
          <h3 className="font-black text-lg text-gray-800">
            {order.type === 'order_food' ? '校內訂餐' : '二手市集'}
          </h3>
          <span className="inline-block px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full uppercase tracking-wider">
            交易已完成
          </span>
        </div>

        {/* 訂單基本資訊 */}
        <div className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm space-y-3 text-xs text-gray-500 font-bold">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <span>購買時間：{orderDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-gray-400" />
            <span>訂單編號：{order.id || `UNI-${order.at}`}</span>
          </div>
        </div>

        {/* 商品明細卡片 (你想看到的：吃了什麼) */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
          <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 border-b border-gray-50 pb-2">
            購買品項明細
          </h4>
          
          <div className="space-y-4">
            {order.details && order.details.length > 0 ? (
              order.details.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <h5 className="font-black text-sm text-gray-800">{item.name}</h5>
                    <p className="text-[10px] text-gray-400 font-bold">數量：x{item.quantity || 1}</p>
                  </div>
                  <span className="font-black text-sm text-gray-800">${item.price * (item.quantity || 1)}</span>
                </div>
              ))
            ) : (
              // 備份防呆：如果沒有 details 陣列，直接顯示 items 名字
              order.items && order.items.map((name, index) => (
                <div key={index} className="flex justify-between items-center">
                  <h5 className="font-black text-sm text-gray-800">{name}</h5>
                  <span className="font-black text-sm text-gray-800">x1</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 點數與支付金額結算 */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-3 text-xs text-gray-600 font-bold">
          <div className="flex justify-between">
            <span>商品總計</span>
            <span className="text-gray-800 font-black">${order.total}</span>
          </div>
          {order.pointsRedeemed > 0 && (
            <div className="flex justify-between text-orange-500">
              <span>點數折抵</span>
              <span className="font-black">-{order.pointsRedeemed} 點</span>
            </div>
          )}
          <div className="flex justify-between text-green-600">
            <div className="flex items-center gap-1">
              <Gift size={12} />
              <span>獲得消費回饋</span>
            </div>
            <span className="font-black">+{order.pointsRewarded || 5} Pts</span>
          </div>
          <hr className="border-gray-50 my-2" />
          <div className="flex justify-between items-center text-sm font-black text-gray-800">
            <span>實際付費</span>
            <span className="text-lg text-orange-500 font-black">${order.finalPaid ?? (order.total - (order.pointsRedeemed || 0))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}