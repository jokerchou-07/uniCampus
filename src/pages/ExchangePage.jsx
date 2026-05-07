import React from 'react';
import { ChevronLeft } from 'lucide-react';

const ExchangePage = ({ userProfile, studentRewards, setPendingReward, setConfirmMode, setCurrentPage }) => {
  return (
    <div className="h-full flex flex-col bg-white animate-in slide-in-from-right">
      <div className="p-4 border-b border-gray-50 flex items-center justify-between">
        <button onClick={() => setCurrentPage('home')} className="p-2 bg-gray-50 rounded-full"><ChevronLeft /></button>
        <span className="font-black text-xs uppercase tracking-widest text-gray-800">點數兌換</span>
        <div className="w-10" />
      </div>
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 rounded-[32px] shadow-xl">
          <p className="text-[10px] uppercase tracking-widest font-black text-white/70">Current Balance</p>
          <p className="text-4xl font-black mt-2">{userProfile.points}</p>
        </div>
        <div className="space-y-4">
          {studentRewards.map((reward) => {
            const Icon = reward.icon;
            const canRedeem = userProfile.points >= reward.points;
            return (
              <div key={reward.id} className="bg-white border border-gray-100 rounded-[28px] p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center"><Icon size={24} /></div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-gray-800">{reward.name}</p>
                    <p className="text-[11px] text-gray-500 mt-2">{reward.desc}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-base font-black text-gray-900">{reward.points} 點</span>
                  <button
                    disabled={!canRedeem}
                    onClick={() => { setPendingReward(reward); setConfirmMode('confirmExchange'); }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${canRedeem ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {canRedeem ? '立即兌換' : '點數不足'}
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

export default ExchangePage;