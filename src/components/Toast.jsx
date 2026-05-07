import React from 'react';
import { CheckCircle2 } from 'lucide-react';

/**
 * Toast 提示組件
 * @param {string} message - 顯示的文字訊息
 */
const Toast = ({ message }) => {
  if (!message) return null;

  return (
    <div className="absolute inset-x-0 bottom-28 flex justify-center z-[1000] px-10 animate-in slide-in-from-bottom snappy-anim">
      <div className="bg-gray-900/95 backdrop-blur-md text-white px-8 py-5 rounded-full flex items-center gap-4 shadow-2xl border border-white/10">
        <CheckCircle2 size={18} className="text-orange-500" />
        <span className="text-xs font-black uppercase tracking-widest">
          {message}
        </span>
      </div>
    </div>
  );
};

export default Toast;