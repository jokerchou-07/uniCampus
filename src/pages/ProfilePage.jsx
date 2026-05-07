import React from 'react';
import { 
  LogIn, ChevronLeft, ChevronRight, Receipt, Gift, 
  UserPlus, Eye, EyeOff, CreditCard as IDCard 
} from 'lucide-react';

/**
 * 個人資料、登入與註冊頁面組件
 */
const ProfilePage = ({
  user,
  userProfile,
  isRegistering,
  setIsRegistering,
  loginForm,
  setLoginForm,
  registerForm,
  setRegisterForm,
  showPassword,
  setShowPassword,
  handleSignIn,
  handleRegister,
  handleLogOut,
  setCurrentPage,
  setHistoryType
}) => {
  // 如果已登入，顯示個人選單
  if (user) {
    return (
      <div className="p-10 flex flex-col items-center animate-in slide-in-from-bottom">
        <div className="w-28 h-28 bg-orange-500 text-white flex items-center justify-center text-4xl font-black rounded-[35px] shadow-xl border-4 border-white mb-6">
          {userProfile.name?.[0] || 'U'}
        </div>
        <h2 className="text-xl font-black text-[#1A1A1A] italic uppercase tracking-tighter">
          {userProfile.name}
        </h2>

        <div className="w-full mt-10 space-y-3">
          <MenuButton 
            icon={Receipt} 
            label="訂單記錄" 
            onClick={() => { setHistoryType('orders'); setCurrentPage('historyView'); }} 
          />
          <MenuButton 
            icon={Gift} 
            label="我的兌換" 
            onClick={() => { setHistoryType('redeems'); setCurrentPage('historyView'); }} 
          />
          <button
            onClick={handleLogOut}
            className="w-full p-6 bg-red-50 text-red-600 rounded-[24px] flex justify-between items-center border border-red-100 active:scale-[0.98] transition-all mt-3"
          >
            <div className="flex items-center gap-4 font-black text-sm uppercase tracking-tighter">
              <LogIn size={18} className="rotate-180" /> 登出帳戶
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        </div>
      </div>
    );
  }

  // 如果正在註冊，顯示註冊表單
  if (isRegistering) {
    return (
      <div className="p-10 flex flex-col items-center animate-in fade-in">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsRegistering(false)} className="p-2 bg-gray-50 rounded-full active:scale-90">
              <ChevronLeft />
            </button>
            <h2 className="text-2xl font-black italic tracking-tighter text-gray-800 uppercase">註冊新帳號</h2>
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-[25px] flex flex-col items-center justify-center text-gray-300">
              <IDCard size={40} strokeWidth={1.5} />
              <span className="text-[10px] font-black uppercase mt-2 tracking-widest">上傳學生證正反面</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="姓名" value={registerForm.name} onChange={(v) => setRegisterForm({...registerForm, name: v})} placeholder="王小明" />
              <Input label="學號" value={registerForm.studentId} onChange={(v) => setRegisterForm({...registerForm, studentId: v})} placeholder="E140..." />
            </div>
            <Input label="大學 / 系所" value={registerForm.university} onChange={(v) => setRegisterForm({...registerForm, university: v})} placeholder="A大學 資工系" />
            <Input label="手機號碼 (帳號)" value={registerForm.phone} onChange={(v) => setRegisterForm({...registerForm, phone: v})} placeholder="09xxxxxxxx" />
            <Input label="密碼" type="password" value={registerForm.password} onChange={(v) => setRegisterForm({...registerForm, password: v})} placeholder="••••" />
            <button type="submit" className="w-full py-5 bg-gray-900 text-white rounded-[25px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all mt-4">
              提交審核並註冊
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 預設顯示登入頁面
  return (
    <div className="p-10 flex flex-col items-center animate-in fade-in">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-black italic tracking-tighter text-gray-800 uppercase">Login</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">請輸入校園帳號密碼</p>
        </div>
        <div className="bg-orange-50/50 p-5 rounded-3xl border border-dashed border-orange-200">
          <p className="text-[10px] text-orange-600 font-bold leading-relaxed">
            此為測試模式<br />請輸入手機 0912345678 與密碼 1234 進行登入
          </p>
        </div>
        <form onSubmit={handleSignIn} className="space-y-4 text-left">
          <Input label="Phone Number" value={loginForm.phone} onChange={(v) => setLoginForm({...loginForm, phone: v})} placeholder="09xxxxxxxx" />
          <div className="relative">
            <Input label="Password" type={showPassword ? 'text' : 'password'} value={loginForm.password} onChange={(v) => setLoginForm({...loginForm, password: v})} placeholder="••••" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-9 text-gray-300">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button type="submit" className="w-full py-5 bg-orange-500 text-white rounded-[25px] font-black uppercase tracking-widest shadow-xl shadow-orange-100 active:scale-95 transition-all mt-6">
            登入帳戶
          </button>
          <button type="button" onClick={() => setIsRegistering(true)} className="w-full py-5 bg-white border border-gray-100 text-gray-400 rounded-[25px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 mt-2">
            <UserPlus size={18} /> 註冊新帳號
          </button>
        </form>
      </div>
    </div>
  );
};

// 內部輔助組件
const MenuButton = ({ icon: Icon, label, onClick }) => (
  <button onClick={onClick} className="w-full p-6 bg-gray-50 rounded-[24px] flex justify-between items-center border border-gray-50 active:bg-gray-100 transition-all">
    <div className="flex items-center gap-4 font-black text-sm text-gray-700 uppercase tracking-tighter">
      <Icon size={18} className="text-orange-500" /> {label}
    </div>
    <ChevronRight size={16} className="text-gray-200" />
  </button>
);

const Input = ({ label, type = "text", value, onChange, placeholder }) => (
  <div className="space-y-1">
    <label className="text-[8px] font-black text-gray-400 uppercase ml-4">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-5 bg-gray-50 rounded-[25px] text-xs font-bold border-none outline-none focus:ring-2 ring-orange-500/20 shadow-inner"
      placeholder={placeholder}
    />
  </div>
);

export default ProfilePage;