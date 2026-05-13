import React from 'react';
import { ChevronLeft, History, Package, Gift } from 'lucide-react';

const HistoryPage = ({ userHistory, historyType, setCurrentPage }) => {
  const filteredHistory = userHistory.filter((h) => {
    if (historyType === 'orders') {
      return h.type?.startsWith('order');
    }

    if (historyType === 'redeems') {
      return h.type === 'reward';
    }

    if (historyType === 'points') {
      return h.pointsRewarded > 0 || h.type === 'point_reward';
    }

    return false;
  });

  const title =
    historyType === 'orders'
      ? 'Order History'
      : historyType === 'redeems'
      ? 'My Vouchers'
      : 'Point Rewards';

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-in slide-in-from-right">
      <div className="p-4 bg-white border-b flex items-center justify-between">
        <button
          onClick={() => setCurrentPage('profile')}
          className="p-2 active:bg-gray-100 rounded-full text-gray-400"
        >
          <ChevronLeft size={20} />
        </button>

        <span className="font-black text-xs uppercase tracking-widest text-gray-800">
          {title}
        </span>

        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
            <History size={48} />
            <p className="text-[10px] font-black uppercase mt-4">
              No Records Found
            </p>
          </div>
        ) : (
          filteredHistory.map((h, i) => {
            const isPointReward = historyType === 'points';

            return (
              <div
                key={i}
                className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex gap-4 items-center"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-50">
                  {h.thumbnail ? (
                    <img
                      src={h.thumbnail}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      {isPointReward ? <Gift size={24} /> : <Package size={24} />}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">
                      {new Date(h.at).toLocaleDateString()}
                    </span>

                    <div
                      className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase ${
                        isPointReward
                          ? 'bg-green-50 text-green-500'
                          : h.type === 'order_market'
                          ? 'bg-blue-50 text-blue-500'
                          : h.type === 'reward'
                          ? 'bg-orange-50 text-orange-500'
                          : 'bg-orange-50 text-orange-500'
                      }`}
                    >
                      {isPointReward
                        ? '點數回饋'
                        : h.type === 'order_market'
                        ? '二手市集'
                        : h.type === 'reward'
                        ? '點數兌換'
                        : '校園訂餐'}
                    </div>
                  </div>

                  <h4 className="text-[11px] font-black text-gray-800 uppercase truncate">
                    {isPointReward
                      ? h.name || '獲得點數'
                      : h.type === 'reward'
                      ? h.name
                      : h.items?.join(', ')}
                  </h4>

                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-[9px] font-black text-gray-400 uppercase">
                      {isPointReward ? 'Reward' : 'Amount'}
                    </span>

                    <span
                      className={`text-sm font-black tracking-tighter ${
                        isPointReward ? 'text-green-600' : 'text-gray-900'
                      }`}
                    >
                      {isPointReward
                        ? `+${h.pointsRewarded || h.points || 0} Pts`
                        : h.type === 'reward'
                        ? `${h.points} Pts`
                        : `$${h.total}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryPage;