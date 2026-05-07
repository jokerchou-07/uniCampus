import React from 'react';
import { 
  LogIn, Ticket, LayoutGrid, ShoppingBag, Utensils, 
  Map as MapIcon, Package, Coffee, Gift, BookOpen, Zap 
} from 'lucide-react';

/**
 * 首頁組件
 */
const HomePage = ({ 
  user, 
  userProfile, 
  setCurrentPage, 
  triggerLoginPrompt, 
  colorClasses 
}) => {
  // 廣告資料配置 (保持在組件內，方便未來更新)
  const ADS = [
    { t: '登入校園模式!', s: '專屬學生OPENPOINT模式', c: 'orange', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200' },
    { t: '點數限時加倍送', s: '指定鮮食 OPENPOINT 10倍', c: 'green', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200' },
    { t: '舊衣回收愛地球', s: '寄送舊衣到指定位置換好禮', c: 'blue', img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200' },
    { t: '期末加油禮包', s: '點數兌換專區限時優惠中', c: 'purple', img: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=200' },
    { t: '統一一起瘋青春', s: '一鍵查看校園活動', c: 'red', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200' },
  ];

  const handleServiceClick = (targetPage) => {
    if (!user) return triggerLoginPrompt();
    setCurrentPage(targetPage);
  };

  return (
    <div className="px-8 py-2 space-y-6 animate-in fade-in">
      {/* 歡迎區塊 */}
      <div className="flex justify-between items-center pt-4">
        <div className="space-y-0.5">
          <span className="text-[9px] font-black text-orange-400 uppercase tracking-[0.3em] block">Welcome Back</span>
          <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight leading-none">
            Hi, {user ? userProfile.name : '訪客同學'}
          </h1>
        </div>
        {!user && (
          <button onClick={() => setCurrentPage('profile')} className="bg-orange-500 text-white p-2.5 rounded-xl active:scale-90 transition-all shadow-lg shadow-orange-100">
            <LogIn size={20} />
          </button>
        )}
      </div>

      {/* 餘額卡片 */}
      <div className="relative h-40 rounded-[35px] overflow-hidden shadow-[0_15px_30px_-10px_rgba(255,130,0,0.3)] border border-orange-200">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF9838] via-[#FF8200] to-[#FF4E00]" />
        <div className="relative z-10 p-8 h-full flex flex-col justify-between text-white">
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-bold text-white/80 uppercase tracking-[0.1em]">Openpoint Balance</span>
            <button 
              onClick={() => handleServiceClick('exchange')}
              className="p-1.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 active:scale-90"
            >
              <Ticket size={20} />
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black italic tracking-tighter">{user ? userProfile.points : '---'}</span>
            <span className="text-xs font-black text-white/50 uppercase tracking-widest italic">Pts</span>
          </div>
          <div className="w-full h-1 bg-black/10 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full shadow-[0_0_8px_white]" style={{ width: user ? '65%' : '0%' }} />
          </div>
        </div>
      </div>

      {/* 校園服務按鈕網格 */}
      <div className="space-y-4 pb-4">
        <div className="flex items-center gap-2 px-2">
          <LayoutGrid size={12} className="text-orange-500" />
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">校園特區 / Campus Services</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ServiceButton onClick={() => handleServiceClick('market')} icon={ShoppingBag} label="二手市集" subLabel="Market" color="orange" />
          <ServiceButton onClick={() => handleServiceClick('ordering')} icon={Utensils} label="校內訂餐" subLabel="Ordering" color="red" />
          <ServiceButton onClick={() => handleServiceClick('foodMap')} icon={MapIcon} label="i 珍食" subLabel="Food" color="green" />
          <ServiceButton onClick={() => handleServiceClick('orderTracking')} icon={Package} label="物流專區" subLabel="Logistics" color="blue" />
        </div>
      </div>

      {/* 廣告特區 */}
      <div className="space-y-4 pb-4">
        <div className="flex items-center gap-2 px-2">
          <LayoutGrid size={12} className="text-orange-500" />
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">廣告特區 / Campus Ads</h3>
        </div>
        <div className="flex flex-col gap-4 px-1">
          {ADS.map((ad, i) => (
            <div key={i} className="w-full bg-white border border-gray-100 rounded-[28px] p-4 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-all">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl shrink-0 overflow-hidden shadow-inner">
                <img src={ad.img} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-black text-[#1A1A1A] leading-tight">{ad.t}</p>
                <p className={`text-[9px] font-bold mt-1 inline-block px-2 py-0.5 rounded-full ${colorClasses(ad.c)}`}>
                  {ad.s}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 內部小型組件，讓代碼更精簡
const ServiceButton = ({ onClick, icon: Icon, label, subLabel, color }) => {
  const colorMap = {
    orange: 'bg-orange-50 text-orange-500',
    red: 'bg-red-50 text-red-500',
    green: 'bg-green-50 text-green-500',
    blue: 'bg-blue-50 text-blue-500'
  };
  return (
    <button onClick={onClick} className="bg-white border border-gray-100 p-4 rounded-3xl shadow-sm flex items-center gap-3 active:scale-95 transition-all">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
      <div className="text-left">
        <p className="text-sm font-black text-[#1A1A1A]">{label}</p>
        <p className={`text-[8px] font-bold uppercase tracking-widest leading-none opacity-70`}>{subLabel}</p>
      </div>
    </button>
  );
};

export default HomePage;