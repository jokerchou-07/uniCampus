import { auth, db, storage } from './lib/firebase';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  setDoc,      // 補上這行，這是 handleSignIn 報錯的主因
  deleteDoc,
  query, 
  where, 
  getDocs, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  limit
} from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Home,
  ShoppingBag,
  Ticket,
  Utensils,
  User,
  Bell,
  ChevronRight,
  Star,
  Smartphone,
  ChevronLeft,
  MessageCircle,
  Plus,
  Minus,
  X,
  Image as ImageIcon,
  ShoppingCart,
  Trash2,
  CreditCard,
  Wallet,
  Check,
  CheckCircle2,
  BookOpen,
  UtensilsCrossed,
  Receipt,
  History,
  Gift,
  LayoutGrid,
  Search,
  MapPin,
  Store,
  Coffee,
  Zap,
  Barcode,
  RefreshCw,
  Map as MapIcon,
  Package,
  LogIn,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  CreditCard as IDCard,
} from 'lucide-react';



// -----------------------------
// Firebase 安全初始化
// -----------------------------

const appId =
  typeof __app_id !== 'undefined' ? __app_id : 'uni-campus-master-final';
const initialAuthToken =
  typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// -----------------------------
// 靜態資料
// -----------------------------
const MARKET_CATEGORIES = ['全部', '玩具', '電子產品', '書籍', '生活用品'];
const FOOD_CATEGORIES = ['全部', '早餐', '午餐', '晚餐', '飲品'];

const CAMPUS_STORES = [
  {
    id: 'f1',
    name: '晨曦活力早餐',
    rating: 4.8,
    wait: '10 min',
    category: '早餐',
    img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
    menu: [
      { id: 'menu1', name: '肉蛋吐司', price: 55 },
      { id: 'menu2', name: '培根起司堡', price: 70 },
      { id: 'menu3', name: '大杯奶茶', price: 25 },
    ],
  },
  {
    id: 'f2',
    name: '學霸日式簡餐',
    rating: 4.5,
    wait: '20 min',
    category: '午餐',
    img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    menu: [
      { id: 'menu4', name: '日式豬排丼', price: 120 },
      { id: 'menu5', name: '唐揚炸雞飯', price: 135 },
    ],
  },
  {
    id: 'f3',
    name: '大三元快餐',
    rating: 4.2,
    wait: '15 min',
    category: '午餐',
    img: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600',
    menu: [
      { id: 'menu6', name: '招牌排骨飯', price: 95 },
      { id: 'menu7', name: '雞腿飯', price: 105 },
    ],
  },
  {
    id: 'f4',
    name: '校園義大利麵',
    rating: 4.6,
    wait: '25 min',
    category: '晚餐',
    img: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400',
    menu: [
      { id: 'menu8', name: '白醬培根麵', price: 140 },
      { id: 'menu9', name: '紅醬肉醬麵', price: 130 },
    ],
  },
  {
    id: 'f5',
    name: '午茶時光甜點',
    rating: 4.9,
    wait: '5 min',
    category: '飲品',
    img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    menu: [
      { id: 'menu10', name: '珍珠鮮奶茶', price: 65 },
      { id: 'menu11', name: '紅豆紫米粥', price: 50 },
    ],
  },
  {
    id: 'f6',
    name: '飽飽大飯糰',
    rating: 4.4,
    wait: '8 min',
    category: '早餐',
    img: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=400',
    menu: [
      { id: 'menu12', name: '傳統紫米飯糰', price: 45 },
      { id: 'menu13', name: '鮪魚玉米飯糰', price: 50 },
    ],
  },
];

const STUDENT_REWARDS = [
  {
    id: 'r1',
    name: '期末加油包',
    points: 450,
    brand: '熬夜必備',
    desc: '內含大杯美式咖啡 x1 + 能量飲 x1',
    icon: Coffee,
  },
  {
    id: 'r2',
    name: '歐趴糖禮盒',
    points: 600,
    brand: 'ALL PASS',
    desc: '精選進口巧克力與綜合果乾',
    icon: Gift,
  },
  {
    id: 'r3',
    name: '校園影印100張',
    points: 200,
    brand: '報告救星',
    desc: '校內影印部專用',
    icon: BookOpen,
  },
  {
    id: 'r4',
    name: '校內餐廳優惠卷',
    points: 100,
    brand: '專屬福利',
    desc: '享 50 元現折優惠',
    icon: Zap,
  },
];

const TEST_MARKET_ITEMS = [];

// -----------------------------
// localStorage helpers
// -----------------------------
const LS_KEYS = {
  user: 'uni-campus-user',
  profile: 'uni-campus-profile',
  marketItems: 'uni-campus-market-items',
  marketCart: 'uni-campus-market-cart',
  foodCart: 'uni-campus-food-cart',
  history: 'uni-campus-history',
};

function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function colorClasses(color) {
  const map = {
    orange: 'text-orange-600 bg-orange-50',
    green: 'text-green-600 bg-green-50',
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    red: 'text-red-600 bg-red-50',
  };
  return map[color] || 'text-gray-600 bg-gray-50';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState({
    points: 1280,
    name: '訪客',
    phone: '未登入',
  });
  const [marketItems, setMarketItems] = useState([]);
  const [marketCart, setMarketCart] = useState([]);
  const [foodCart, setFoodCart] = useState([]);
  const [userHistory, setUserHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [loginForm, setLoginForm] = useState({ phone: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    studentId: '',
    phone: '',
    password: '',
    university: 'A大學',
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [activeMarketCat, setActiveMarketCat] = useState('全部');
  const [activeFoodCat, setActiveFoodCat] = useState('全部');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCartTab, setActiveCartTab] = useState('market');
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [historyType, setHistoryType] = useState('orders');
  const [confirmMode, setConfirmMode] = useState(null);
  const [pendingItem, setPendingItem] = useState(null);
  const [pendingStore, setPendingStore] = useState(null);
  const [pendingReward, setPendingReward] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    name: '',
    price: '',
    category: '玩具',
    desc: '',
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkoutData, setCheckoutData] = useState({
    receiver: '',
    phone: '',
    deliveryType: 'face',
    building: '第一男生宿舍',
    locationDetail: '',
    payment: 'card',
    pointRedemption: 0,
  });

  const firebaseEnabled = Boolean(auth && db);

  const showToast = (m) => {
    setToastMsg(m);
    setTimeout(() => setToastMsg(null), 1500);
  };

  const triggerLoginPrompt = () => setConfirmMode('requireLogin');

  // 初始化：Firebase 或 local 模式
  useEffect(() => {
    if (!firebaseEnabled) {
      const localUser = readLS(LS_KEYS.user, null);
      const localProfile = readLS(LS_KEYS.profile, {
        points: 1280,
        name: '訪客',
        phone: '未登入',
      });
      const localItems = readLS(LS_KEYS.marketItems, TEST_MARKET_ITEMS);
      const localMarketCart = readLS(LS_KEYS.marketCart, []);
      const localFoodCart = readLS(LS_KEYS.foodCart, []);
      const localHistory = readLS(LS_KEYS.history, []);

      setUser(localUser);
      setUserProfile(localProfile);
      setMarketItems(
        [...localItems, ...TEST_MARKET_ITEMS]
          .reduce((acc, curr) => {
            if (!acc.find((i) => i.id === curr.id)) acc.push(curr);
            return acc;
          }, [])
          .sort((a, b) => (b.at || 0) - (a.at || 0))
      );
      setMarketCart(localMarketCart);
      setFoodCart(localFoodCart);
      setUserHistory(localHistory.sort((a, b) => b.at - a.at));
      setCheckoutData((prev) => ({
        ...prev,
        receiver: localProfile.name || '',
        phone: localProfile.phone || '',
      }));
      setIsLoading(false);
      return;
    }

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoading(false);
    });

    return () => unsubAuth();
  }, [firebaseEnabled]);

  useEffect(() => {
    if (!firebaseEnabled || !user || !db) return;

    const unsubProfile = onSnapshot(
      doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'),
      (s) => {
        if (s.exists()) {
          const d = s.data();
          setUserProfile(d);
          setCheckoutData((prev) => ({
            ...prev,
            receiver: d.name || '',
            phone: d.phone || '',
          }));
        }
      }
    );

    const unsubMarket = onSnapshot(
      collection(db, 'artifacts', appId, 'public', 'data', 'marketItems'),
      (s) => {
        // 直接從 Firestore 抓取所有文件
        const dbItems = s.docs.map((d) => ({ 
          id: d.id, 
          ...d.data() 
        }));
        
        // 依照時間排序 (最新的在前面)
        const sortedItems = dbItems.sort((a, b) => (b.at || 0) - (a.at || 0));
        
        // 直接設定，不再合併 TEST_MARKET_ITEMS
        setMarketItems(sortedItems);
      }
    );

    const unsubMCart = onSnapshot(
      collection(db, 'artifacts', appId, 'users', user.uid, 'marketCart'),
      (s) => {
        setMarketCart(s.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    const unsubFCart = onSnapshot(
      collection(db, 'artifacts', appId, 'users', user.uid, 'foodCart'),
      (s) => {
        setFoodCart(s.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    const unsubHistory = onSnapshot(
      collection(db, 'artifacts', appId, 'users', user.uid, 'history'),
      (s) => {
        setUserHistory(
          s.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => b.at - a.at)
        );
      }
    );

    return () => {
      unsubProfile();
      unsubMarket();
      unsubMCart();
      unsubFCart();
      unsubHistory();
    };
  }, [firebaseEnabled, user]);

  // local mode sync
  useEffect(() => {
    if (firebaseEnabled) return;
    writeLS(LS_KEYS.user, user);
  }, [user, firebaseEnabled]);

  useEffect(() => {
    if (firebaseEnabled) return;
    writeLS(LS_KEYS.profile, userProfile);
  }, [userProfile, firebaseEnabled]);

  useEffect(() => {
    if (firebaseEnabled) return;
    writeLS(LS_KEYS.marketItems, marketItems);
  }, [marketItems, firebaseEnabled]);

  useEffect(() => {
    if (firebaseEnabled) return;
    writeLS(LS_KEYS.marketCart, marketCart);
  }, [marketCart, firebaseEnabled]);

  useEffect(() => {
    if (firebaseEnabled) return;
    writeLS(LS_KEYS.foodCart, foodCart);
  }, [foodCart, firebaseEnabled]);

  useEffect(() => {
    if (firebaseEnabled) return;
    writeLS(LS_KEYS.history, userHistory);
  }, [userHistory, firebaseEnabled]);


  const handleLogOut = async () => {
    setIsLoading(true);
    try {
      if (firebaseEnabled) {
        await signOut(auth);
      }
      // 重置本地狀態
      setUser(null);
      setUserProfile({
        points: 1280,
        name: '訪客',
        phone: '未登入',
      });
      showToast("已成功登出");
      setCurrentPage('home'); // 登出後導回首頁
    } catch (err) {
      console.error("登出失敗：", err);
      showToast("登出時發生錯誤");
    }
    setIsLoading(false);
  };

  const handleSignIn = async (e) => {
    if (e) e.preventDefault();
    
    // 技巧：將 0912345678 變成 0912345678@phone.com
    const fakeEmail = `${loginForm.phone}@phone.com`;
    

    setIsLoading(true);
    try {
      // 實際上還是用 Email 登入函數，但使用者感覺是在用手機登入
      await signInWithEmailAndPassword(auth, fakeEmail, loginForm.password);
      showToast("手機號碼登入成功！");
      setCurrentPage('home');
    } catch (err) {
      console.error("登入錯誤：", err.code);
      showToast("手機或密碼錯誤");
    }
    setIsLoading(false);
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();

    // 1. 欄位檢查 (增加密碼長度檢查，Firebase 要求至少 6 位)
    if (!registerForm.name || !registerForm.phone || !registerForm.password) {
      return showToast('請完整填寫註冊資料');
    }
    if (registerForm.password.length < 6) {
      return showToast('密碼至少需要 6 位數');
    }

    setIsLoading(true);

    // 處理 Local 模式
    if (!firebaseEnabled) {
      const localUser = { uid: 'local-user-' + Date.now() };
      const profile = {
        name: registerForm.name,
        studentId: registerForm.studentId,
        phone: registerForm.phone,
        university: registerForm.university,
        points: 500,
      };
      setUser(localUser);
      setUserProfile(profile);
      showToast('註冊成功！(Local)');
      setIsRegistering(false);
      setCurrentPage('home');
      setIsLoading(false);
      return;
    }

    // 處理 Firebase 模式
    try {
      const fakeEmail = `${registerForm.phone.trim()}@phone.com`;

      // A. 建立 Auth 帳號
      const cred = await createUserWithEmailAndPassword(
        auth,
        fakeEmail,
        registerForm.password
      );
      
      // B. 建立資料庫文件
      // 注意這裡的路徑：必須包含 appId (uni-campus-master-final)
      await setDoc(
        doc(db, 'artifacts', appId, 'users', cred.user.uid, 'profile', 'info'),
        {
          name: registerForm.name,
          studentId: registerForm.studentId || '',
          phone: registerForm.phone.trim(),
          university: registerForm.university || '',
          email: fakeEmail, // 存入備查
          points: 500,      // 初始贈送點數
          createdAt: Date.now()
        },
        { merge: true }
      );

      showToast('註冊成功！');
      setIsRegistering(false);
      setCurrentPage('home');
    } catch (err) {
      console.error("註冊失敗：", err.code);
      if (err.code === 'auth/email-already-in-use') {
        showToast('此號碼已被註冊過');
      } else {
        showToast('註冊失敗，請稍後再試');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addFoodToCart = async (item, store) => {
    if (!user) return triggerLoginPrompt();

    const conflict =
      foodCart.length > 0 && foodCart.some((i) => i.storeId !== store.id);

    if (conflict) {
      setPendingItem(item);
      setPendingStore(store);
      setConfirmMode('clearFoodCart');
      return;
    }

    const existing = foodCart.find((i) => i.id === item.id);
    const qty = existing ? (existing.quantity || 1) + 1 : 1;

    if (!firebaseEnabled) {
      const next = existing
        ? foodCart.map((i) =>
            i.id === item.id
              ? { ...i, quantity: qty, storeId: store.id, img: store.img }
              : i
          )
        : [
            ...foodCart,
            {
              ...item,
              storeId: store.id,
              quantity: 1,
              at: Date.now(),
              img: store.img,
            },
          ];
      setFoodCart(next);
      showToast(`已更新數量: ${qty}`);
      return;
    }

    await setDoc(
      doc(db, 'artifacts', appId, 'users', user.uid, 'foodCart', item.id.toString()),
      {
        ...item,
        storeId: store.id,
        quantity: qty,
        at: Date.now(),
        img: store.img,
      },
      { merge: true }
    );
    showToast(`已更新數量: ${qty}`);
  };

  const updateFoodQty = async (id, delta) => {
    if (!user) return;
    const item = foodCart.find((i) => i.id === id);
    if (!item) return;

    const newQty = (item.quantity || 1) + delta;

    if (!firebaseEnabled) {
      if (newQty <= 0) {
        setFoodCart(foodCart.filter((i) => i.id !== id));
      } else {
        setFoodCart(
          foodCart.map((i) => (i.id === id ? { ...i, quantity: newQty } : i))
        );
      }
      return;
    }

    if (newQty <= 0) {
      await deleteDoc(
        doc(db, 'artifacts', appId, 'users', user.uid, 'foodCart', id.toString())
      );
    } else {
      await setDoc(
        doc(db, 'artifacts', appId, 'users', user.uid, 'foodCart', id.toString()),
        { quantity: newQty },
        { merge: true }
      );
    }
  };

  const addToMarketCart = async (item) => {
    if (!user) return triggerLoginPrompt();

    // 檢查購物車是否已經有這件商品
    const existing = marketCart.find((i) => i.id === item.id);
    
    // 如果已經有了，就跳出提醒，不增加數量
    if (existing) {
      return showToast('此商品已在購物車中');
    }

    // 如果沒有，則加入，並強制數量為 1
    if (!firebaseEnabled) {
      const next = [...marketCart, { ...item, quantity: 1, at: Date.now() }];
      setMarketCart(next);
      showToast(`已加入購物車`);
      return;
    }

    await setDoc(
      doc(db, 'artifacts', appId, 'users', user.uid, 'marketCart', item.id.toString()),
      {
        ...item,
        quantity: 1, // 強制固定為 1
        at: Date.now(),
      },
      { merge: true }
    );

    showToast(`已加入購物車`);
  };

  const deleteMarketCartItem = async (id) => {
    if (!user) return;

    if (!firebaseEnabled) {
      setMarketCart(marketCart.filter((i) => i.id !== id));
      return;
    }

    await deleteDoc(
      doc(db, 'artifacts', appId, 'users', user.uid, 'marketCart', id.toString())
    );
  };

  const handleClearAndAddFood = async () => {
    if (!user || !pendingItem || !pendingStore) return;

    if (!firebaseEnabled) {
      setFoodCart([
        {
          ...pendingItem,
          storeId: pendingStore.id,
          quantity: 1,
          at: Date.now(),
          img: pendingStore.img,
        },
      ]);
      setConfirmMode(null);
      setPendingItem(null);
      setPendingStore(null);
      showToast('已清空並更換餐廳');
      return;
    }

    await Promise.all(
      foodCart.map((item) =>
        deleteDoc(
          doc(
            db,
            'artifacts',
            appId,
            'users',
            user.uid,
            'foodCart',
            item.id.toString()
          )
        )
      )
    );

    await setDoc(
      doc(
        db,
        'artifacts',
        appId,
        'users',
        user.uid,
        'foodCart',
        pendingItem.id.toString()
      ),
      {
        ...pendingItem,
        storeId: pendingStore.id,
        quantity: 1,
        at: Date.now(),
        img: pendingStore.img,
      },
      { merge: true }
    );

    setConfirmMode(null);
    setPendingItem(null);
    setPendingStore(null);
    showToast('已清空並更換餐廳');
  };

  const handleExchange = async () => {
    if (!user || !pendingReward) return;

    if (userProfile.points < pendingReward.points) {
      showToast('點數不足！');
      setConfirmMode(null);
      return;
    }

    const newPoints = userProfile.points - pendingReward.points;
    const historyItem = {
      id: `h_${Date.now()}`,
      type: 'reward',
      name: pendingReward.name,
      points: pendingReward.points,
      at: Date.now(),
    };

    if (!firebaseEnabled) {
      setUserProfile((prev) => ({ ...prev, points: newPoints }));
      setUserHistory((prev) => [historyItem, ...prev].sort((a, b) => b.at - a.at));
      showToast('兌換成功！');
      setConfirmMode(null);
      setPendingReward(null);
      return;
    }

    try {
      await setDoc(
        doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'),
        { points: newPoints },
        { merge: true }
      );
      await addDoc(
        collection(db, 'artifacts', appId, 'users', user.uid, 'history'),
        {
          type: 'reward',
          name: pendingReward.name,
          points: pendingReward.points,
          at: Date.now(),
        }
      );
      showToast('兌換成功！');
      setConfirmMode(null);
      setPendingReward(null);
    } catch (e) {
      console.error(e);
    }
  };

  // 記得確認檔案最上方有 import { updateDoc } from 'firebase/firestore';

  const handleCheckout = async () => {
    if (!user) return;

    const target = activeCartTab === 'market' ? marketCart : foodCart;
    if (target.length === 0) return;

    const total = target.reduce((a, b) => a + (b.price || 0) * (b.quantity || 1), 0);
    const redemption = Math.min(
      checkoutData.pointRedemption || 0,
      userProfile.points || 0,
      total
    );

    setIsLoading(true); // 開始處理，顯示讀取中

    // 1. 本地模式處理 (Local Mode)
    if (!firebaseEnabled) {
      // ... (保持你原本的本地處理邏輯即可)
      setIsOrderSuccess(true);
      setIsLoading(false);
      return;
    }

    // 2. Firebase 模式處理
    try {
      // A. 處理點數折抵
      if (redemption > 0) {
        await setDoc(
          doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'),
          { points: userProfile.points - redemption },
          { merge: true }
        );
      }

      // B. 寫入訂單歷史
      await addDoc(
        collection(db, 'artifacts', appId, 'users', user.uid, 'history'),
        {
          type: activeCartTab === 'market' ? 'order_market' : 'order_food',
          // 為了讓紀錄頁面好看，我們可以多存一張代表圖 (取第一件商品的圖)
          thumbnail: target[0]?.img || '', 
          // 存入所有品項名稱
          items: target.map((i) => i.name),
          // 紀錄每一項的詳細資料 (選配，若想做細節頁面可用)
          details: target.map(i => ({ name: i.name, price: i.price })),
          total,
          pointsRedeemed: redemption,
          finalPaid: total - redemption,
          at: Date.now(),
          status: 'completed' // 標記交易完成
        }
      );

      // C. 關鍵修改：逐一處理購物車品項
      for (const item of target) {
        // 如果是市集商品，將公眾資料庫中的商品狀態改為「已售出」
        if (activeCartTab === 'market') {
          const itemRef = doc(db, 'artifacts', appId, 'public', 'data', 'marketItems', item.id.toString());
          await updateDoc(itemRef, {
            status: 'sold',     // 標記售出
            buyerId: user.uid,  // 紀錄買家
            soldAt: Date.now()  // 紀錄時間
          });
        }

        // 將品項從個人購物車（市集或訂餐）中刪除
        await deleteDoc(
          doc(
            db,
            'artifacts',
            appId,
            'users',
            user.uid,
            activeCartTab === 'market' ? 'marketCart' : 'foodCart',
            item.id.toString()
          )
        );
      }

      setIsOrderSuccess(true);
    } catch (error) {
      console.error("結帳失敗:", error);
      showToast("結帳過程發生錯誤");
    } finally {
      setIsLoading(false);
    }
  };


  const handleUpload = async (e) => {
    e.preventDefault();
    if (!user) return;

    // -------------------
    // 必填欄位檢查
    // -------------------
    if (!newPost.name.trim()) {
      return showToast('請輸入商品名稱');
    }

    if (!newPost.price) {
      return showToast('請輸入商品價格');
    }

    if (!newPost.desc.trim()) {
      return showToast('請輸入商品描述');
    }

    if (!newPost.imageFile) {
      return showToast('請上傳商品照片');
    }

    // -------------------
    // 圖片大小限制
    // -------------------
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 1MB

    if (newPost.imageFile.size > MAX_FILE_SIZE) {
      return showToast('圖片不可超過 2MB');
    }

    // -------------------
    // 圖片格式限制
    // -------------------
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
    ];

    if (!allowedTypes.includes(newPost.imageFile.type)) {
      return showToast('不支援此圖片');
    }
    setIsLoading(true);

    try {
      // 預設圖片網址 (當使用者未選取照片時)
      let finalImageUrl = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600';

      // 檢查是否有選取檔案
      if (newPost.imageFile) {
        // 圖片壓縮邏輯
        finalImageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(newPost.imageFile);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 800; // 限制最大寬度
              let width = img.width;
              let height = img.height;

              // 計算縮放比例
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);

              // 關鍵：這裡 0.6 代表 60% 的畫質，能大幅縮小檔案體積
              const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
              resolve(dataUrl);
            };
          };
        });
      }

      // 封裝資料，確保 price 是數字
      const postData = {
        name: newPost.name,
        price: Number(newPost.price) || 0, // 強制轉型
        category: newPost.category,
        desc: newPost.desc,
        img: finalImageUrl, 
        at: Date.now(),
        user: userProfile.name,
      };

      if (firebaseEnabled) {
        const marketRef = collection(db, 'artifacts', appId, 'public', 'data', 'marketItems');
        await addDoc(marketRef, postData);
        console.log("Firestore 寫入成功 (Base64 模式)");
      } else {
        setMarketItems((prev) => [{ id: Date.now(), ...postData }, ...prev]);
      }

      setIsUploadOpen(false);
      setNewPost({ name: '', price: '', category: '玩具', desc: '', imageFile: null });
      showToast('商品已成功上架');
    } catch (error) {
      console.error("錯誤細節:", error);
      showToast('發佈失敗：圖片可能太大 (需小於 1MB)');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMarketItems = useMemo(() => {
    return marketItems.filter(
      (i) =>
        // 關鍵：只顯示狀態不是 'sold' 的商品
        i.status !== 'sold' && 
        (activeMarketCat === '全部' || i.category === activeMarketCat) &&
        (searchQuery === '' || i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [marketItems, activeMarketCat, searchQuery]);

  const filteredStores = useMemo(() => {
    return CAMPUS_STORES.filter(
      (s) =>
        (activeFoodCat === '全部' || s.category === activeFoodCat) &&
        (searchQuery === '' ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [activeFoodCat, searchQuery]);

  const renderPage = () => {
    if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center font-black text-orange-500 animate-pulse text-xs">
          PROCESSING...
        </div>
      );
    }

    switch (currentPage) {
      case 'home':
        return (
          <div className="px-8 py-2 space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center pt-4">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-orange-400 uppercase tracking-[0.3em] block">
                  Welcome Back
                </span>
                <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight leading-none">
                  Hi, {user ? userProfile.name : '訪客同學'}
                </h1>
              </div>
              {!user && (
                <button
                  onClick={() => setCurrentPage('profile')}
                  className="bg-orange-500 text-white p-2.5 rounded-xl active:scale-90 transition-all shadow-lg shadow-orange-100"
                >
                  <LogIn size={20} />
                </button>
              )}
            </div>

            <div className="relative h-40 rounded-[35px] overflow-hidden shadow-[0_15px_30px_-10px_rgba(255,130,0,0.3)] border border-orange-200">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF9838] via-[#FF8200] to-[#FF4E00]" />
              <div className="relative z-10 p-8 h-full flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <span className="text-[13px] font-bold text-white/80 uppercase tracking-[0.1em]">
                    Openpoint Balance
                  </span>
                  <button
                    onClick={() => {
                      if (!user) return triggerLoginPrompt();
                      setCurrentPage('exchange');
                    }}
                    className="p-1.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 active:scale-90"
                  >
                    <Ticket size={20} />
                  </button>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black italic tracking-tighter">
                    {user ? userProfile.points : '---'}
                  </span>
                  <span className="text-xs font-black text-white/50 uppercase tracking-widest italic">
                    Pts
                  </span>
                </div>
                <div className="w-full h-1 bg-black/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full shadow-[0_0_8px_white]"
                    style={{ width: user ? '65%' : '0%' }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pb-4">
              <div className="flex items-center gap-2 px-2">
                <LayoutGrid size={12} className="text-orange-500" />
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  校園特區 / Campus Services
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    if (!user) return triggerLoginPrompt();
                    setCurrentPage('market');
                  }}
                  className="bg-white border border-gray-100 p-4 rounded-3xl shadow-sm flex items-center gap-3 active:scale-95 transition-all"
                >
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                    <ShoppingBag size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-[#1A1A1A]">二手市集</p>
                    <p className="text-[8px] text-orange-400 font-bold uppercase tracking-widest leading-none">
                      Market
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (!user) return triggerLoginPrompt();
                    setCurrentPage('ordering');
                  }}
                  className="bg-white border border-gray-100 p-4 rounded-3xl shadow-sm flex items-center gap-3 active:scale-95 transition-all"
                >
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                    <Utensils size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-[#1A1A1A]">校內訂餐</p>
                    <p className="text-[8px] text-red-400 font-bold uppercase tracking-widest leading-none">
                      Ordering
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (!user) return triggerLoginPrompt();
                    setCurrentPage('foodMap');
                  }}
                  className="bg-white border border-gray-100 p-4 rounded-3xl shadow-sm flex items-center gap-3 active:scale-95 transition-all"
                >
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                    <MapIcon size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-[#1A1A1A]">i 珍食</p>
                    <p className="text-[8px] text-green-400 font-bold uppercase tracking-widest leading-none">
                      Food
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (!user) return triggerLoginPrompt();
                    setSelectedTrackingOrder(null);
                    setCurrentPage('orderTracking');
                  }}
                  className="bg-white border border-gray-100 p-4 rounded-3xl shadow-sm flex items-center gap-3 active:scale-95 transition-all"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                    <Package size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-[#1A1A1A]">物流專區</p>
                    <p className="text-[8px] text-blue-400 font-bold uppercase tracking-widest leading-none">
                      Logistics
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-4 pb-4">
              <div className="flex items-center gap-2 px-2">
                <LayoutGrid size={12} className="text-orange-500" />
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  廣告特區 / Campus Ads
                </h3>
              </div>

              <div className="flex flex-col gap-4 px-1">
                {[
                  {
                    t: '登入校園模式!',
                    s: '專屬學生OPENPOINT模式',
                    c: 'orange',
                    img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200',
                  },
                  {
                    t: '點數限時加倍送',
                    s: '指定鮮食 OPENPOINT 10倍',
                    c: 'green',
                    img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
                  },
                  {
                    t: '舊衣回收愛地球',
                    s: '寄送舊衣到指定位置換好禮',
                    c: 'blue',
                    img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200',
                  },
                  {
                    t: '期末加油禮包',
                    s: '點數兌換專區限時優惠中',
                    c: 'purple',
                    img: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=200',
                  },
                  {
                    t: '統一一起瘋青春',
                    s: '一鍵查看校園活動',
                    c: 'red',
                    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200',
                  },
                ].map((ad, i) => {
                  const adColor = colorClasses(ad.c);
                  return (
                    <div
                      key={i}
                      className="w-full bg-white border border-gray-100 rounded-[28px] p-4 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-all"
                    >
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl shrink-0 overflow-hidden shadow-inner">
                        <img src={ad.img} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-black text-[#1A1A1A] leading-tight">
                          {ad.t}
                        </p>
                        <p
                          className={`text-[9px] font-bold mt-1 inline-block px-2 py-0.5 rounded-full ${adColor}`}
                        >
                          {ad.s}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'market':
        return (
          <div className="pb-24 animate-in slide-in-from-right">
            <div className="sticky top-0 bg-white/95 backdrop-blur-md z-40 px-8 py-4 border-b border-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-black text-[#1A1A1A] italic uppercase tracking-tighter">
                  Market
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className={`p-2.5 rounded-xl border transition-all active:scale-90 ${
                      isSearchOpen
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-orange-500 border-gray-100 shadow-sm'
                    }`}
                  >
                    <Search size={20} />
                  </button>
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="p-2.5 bg-orange-500 text-white rounded-xl shadow-lg active:scale-90 transition-transform"
                  >
                    <Plus size={22} />
                  </button>
                </div>
              </div>

              {isSearchOpen && (
                <div className="pb-2 animate-in slide-in-from-top-2">
                  <div className="relative">
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜尋商品..."
                      className="w-full p-3 pl-10 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:border-orange-400 transition-all shadow-inner"
                    />
                    <Search size={14} className="absolute left-4 top-3.5 text-gray-400" />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-3 text-gray-300"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 py-3 flex gap-2 overflow-x-auto scrollbar-hide mb-2">
              {MARKET_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveMarketCat(c)}
                  className={`px-5 py-2 rounded-full text-[10px] font-black whitespace-nowrap transition-all ${
                    activeMarketCat === c
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="px-8 grid grid-cols-2 gap-5">
              {filteredMarketItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setCurrentPage('itemDetail');
                  }}
                  className="bg-white border border-gray-50 rounded-[28px] overflow-hidden shadow-md active:scale-[0.98] transition-all"
                >
                  <div className="aspect-square relative">
                    <img src={item.img} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-black text-gray-800 truncate uppercase tracking-tighter">
                      {item.name}
                    </p>
                    <p className="text-orange-500 font-black text-sm mt-0.5">
                      ${item.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'ordering':
        return (
          <div className="pb-24 animate-in slide-in-from-right">
            <div className="sticky top-0 bg-white/95 backdrop-blur-md z-40 px-8 py-4 border-b border-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-black text-[#1A1A1A] italic uppercase tracking-tighter">
                  Dining
                </h2>
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={`p-2.5 rounded-xl border transition-all active:scale-90 ${
                    isSearchOpen ? 'bg-orange-500 text-white' : 'bg-white text-orange-500'
                  }`}
                >
                  <Search size={20} />
                </button>
              </div>

              {isSearchOpen && (
                <div className="pb-2 animate-in slide-in-from-top-2">
                  <div className="relative">
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜尋餐廳..."
                      className="w-full p-3 pl-10 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:border-orange-400 transition-all shadow-inner"
                    />
                    <Search size={14} className="absolute left-4 top-3.5 text-gray-400" />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-3 text-gray-300"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 py-3 flex gap-2 overflow-x-auto scrollbar-hide mb-4">
              {FOOD_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveFoodCat(c)}
                  className={`px-5 py-2 rounded-full text-[10px] font-black whitespace-nowrap transition-all ${
                    activeFoodCat === c
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="px-8 space-y-5">
              {filteredStores.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedStore(s);
                    setCurrentPage('storeDetail');
                  }}
                  className="bg-white border border-gray-100 p-5 rounded-[32px] flex items-center gap-5 active:bg-gray-50 transition-all shadow-md"
                >
                  <img src={s.img} className="w-16 h-16 rounded-[20px] object-cover" />
                  <div className="flex-1">
                    <h4 className="font-black text-base text-gray-800 tracking-tighter">
                      {s.name}
                    </h4>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[9px] font-black text-orange-500 uppercase bg-orange-50 px-2 py-0.5 rounded-full">
                        {s.wait}
                      </span>
                      <span className="text-yellow-500 font-black text-xs flex items-center gap-1">
                        <Star size={14} fill="currentColor" /> {s.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'storeDetail':
        return (
          selectedStore && (
            <div className="h-full flex flex-col bg-white animate-in slide-in-from-bottom">
              <div className="p-4 bg-red-600 text-white flex items-center justify-between shadow-md">
                <button
                  onClick={() => setCurrentPage('ordering')}
                  className="p-2 active:bg-white/10 rounded-full"
                >
                  <ChevronLeft size={22} />
                </button>
                <span className="font-black text-xs uppercase tracking-widest italic">
                  Store Menu
                </span>
                <div className="w-10" />
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="text-center">
                  <img
                    src={selectedStore.img}
                    className="w-24 h-24 rounded-[35px] mx-auto shadow-xl border-4 border-white mb-4"
                  />
                  <h1 className="text-xl font-black uppercase text-gray-900 tracking-tighter">
                    {selectedStore.name}
                  </h1>
                </div>

                <div className="space-y-4">
                  {selectedStore.menu.map((m) => {
                    const inCart = foodCart.find((i) => i.id === m.id);
                    return (
                      <div
                        key={m.id}
                        className="p-5 border border-gray-50 bg-white rounded-[28px] flex items-center justify-between shadow-md"
                      >
                        <div>
                          <p className="font-black text-sm uppercase text-gray-800">
                            {m.name}
                          </p>
                          <p className="text-red-500 font-black text-base mt-0.5">
                            ${m.price}
                          </p>
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
          )
        );

      case 'profile':
        return (
          <div className="p-10 flex flex-col items-center animate-in slide-in-from-bottom">
            {user ? (
              <>
                <div className="w-28 h-28 bg-orange-500 text-white flex items-center justify-center text-4xl font-black rounded-[35px] shadow-xl border-4 border-white mb-6">
                  王
                </div>
                <h2 className="text-xl font-black text-[#1A1A1A] italic uppercase tracking-tighter">
                  {userProfile.name}
                </h2>

                <div className="w-full mt-10 space-y-3">
                  <button
                    onClick={() => {
                      setHistoryType('orders');
                      setCurrentPage('historyView');
                    }}
                    className="w-full p-6 bg-gray-50 rounded-[24px] flex justify-between items-center border border-gray-50 active:bg-gray-100 transition-all"
                  >
                    <div className="flex items-center gap-4 font-black text-sm text-gray-700 uppercase tracking-tighter">
                      <Receipt size={18} className="text-orange-500" /> 訂單記錄
                    </div>
                    <ChevronRight size={16} className="text-gray-200" />
                  </button>

                  <button
                    onClick={() => {
                      setHistoryType('redeems');
                      setCurrentPage('historyView');
                    }}
                    className="w-full p-6 bg-gray-50 rounded-[24px] flex justify-between items-center border border-gray-50 active:bg-gray-100 transition-all"
                  >
                    <div className="flex items-center gap-4 font-black text-sm text-gray-700 uppercase tracking-tighter">
                      <Gift size={18} className="text-orange-500" /> 我的兌換
                    </div>
                    <ChevronRight size={16} className="text-gray-200" />
                  </button>
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
              </>
            ) : isRegistering ? (
              <div className="w-full max-w-sm space-y-8 animate-in fade-in">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsRegistering(false)}
                    className="p-2 bg-gray-50 rounded-full active:scale-90"
                  >
                    <ChevronLeft />
                  </button>
                  <h2 className="text-2xl font-black italic tracking-tighter text-gray-800 uppercase">
                    註冊新帳號
                  </h2>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-[25px] flex flex-col items-center justify-center text-gray-300 active:bg-white transition-all cursor-pointer">
                    <IDCard size={40} strokeWidth={1.5} />
                    <span className="text-[10px] font-black uppercase mt-2 tracking-widest">
                      上傳學生證正反面
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-gray-400 uppercase ml-2">
                        姓名
                      </label>
                      <input
                        value={registerForm.name}
                        onChange={(e) =>
                          setRegisterForm({ ...registerForm, name: e.target.value })
                        }
                        className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none shadow-inner"
                        placeholder="王小明"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-gray-400 uppercase ml-2">
                        學號
                      </label>
                      <input
                        value={registerForm.studentId}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            studentId: e.target.value,
                          })
                        }
                        className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none shadow-inner"
                        placeholder="E140..."
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-400 uppercase ml-2">
                      大學 / 系所
                    </label>
                    <input
                      value={registerForm.university}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          university: e.target.value,
                        })
                      }
                      className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none shadow-inner"
                      placeholder="A大學 資工系"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-400 uppercase ml-2">
                      手機號碼 (帳號)
                    </label>
                    <input
                      value={registerForm.phone}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, phone: e.target.value })
                      }
                      className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none shadow-inner"
                      placeholder="09xxxxxxxx"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-400 uppercase ml-2">
                      密碼
                    </label>
                    <input
                      type="password"
                      value={registerForm.password}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          password: e.target.value,
                        })
                      }
                      className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none shadow-inner"
                      placeholder="••••"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-5 bg-gray-900 text-white rounded-[25px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all mt-4"
                  >
                    提交審核並註冊
                  </button>
                </form>
              </div>
            ) : (
              <div className="w-full max-w-sm space-y-8 animate-in fade-in">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black italic tracking-tighter text-gray-800 uppercase">
                    Login
                  </h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    請輸入校園帳號密碼
                  </p>
                </div>

                <div className="bg-orange-50/50 p-5 rounded-3xl border border-dashed border-orange-200">
                  <p className="text-[10px] text-orange-600 font-bold text-center leading-relaxed">
                    此為測試模式
                    <br />
                    請輸入手機 0912345678 與密碼 1234 進行登入
                  </p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-400 uppercase ml-4">
                      Phone Number
                    </label>
                    <input
                      value={loginForm.phone}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, phone: e.target.value })
                      }
                      className="w-full p-5 bg-gray-50 rounded-[25px] text-xs font-bold border-none outline-none focus:ring-2 ring-orange-500/20 shadow-inner"
                      placeholder="09xxxxxxxx"
                    />
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-[8px] font-black text-gray-400 uppercase ml-4">
                      Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                      className="w-full p-5 bg-gray-50 rounded-[25px] text-xs font-bold border-none outline-none focus:ring-2 ring-orange-500/20 shadow-inner"
                      placeholder="••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-9 text-gray-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-5 bg-orange-500 text-white rounded-[25px] font-black uppercase tracking-widest shadow-xl shadow-orange-100 active:scale-95 transition-all mt-6"
                  >
                    登入帳戶
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRegistering(true)}
                    className="w-full py-5 bg-white border border-gray-100 text-gray-400 rounded-[25px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <UserPlus size={18} /> 註冊新帳號
                  </button>
                </form>

                
              </div>
            )}
          </div>
        );

      case 'foodMap':
        return (
          <div className="h-full bg-gray-50 flex flex-col animate-in slide-in-from-right">
            <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage('home')}
                className="p-2 bg-gray-50 rounded-full"
              >
                <ChevronLeft />
              </button>
              <span className="font-black text-xs uppercase tracking-widest text-gray-800">
                i 珍食地圖
              </span>
              <div className="w-10" />
            </div>

            <div className="flex-1 p-6 space-y-4">
              <div className="bg-white p-5 rounded-[32px] shadow-sm border border-green-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-800">校園周邊 7-11 分佈</p>
                  <p className="text-[9px] text-green-600 font-bold uppercase tracking-widest">
                    偵測到 3 間門市提供 i 珍食折扣
                  </p>
                </div>
              </div>

              {[
                { n: 'A大一門市', d: '150m', s: '8件' },
                { n: 'A大二門市', d: '320m', s: '12件' },
                { n: 'A大三門市', d: '450m', s: '3件' },
              ].map((shop, i) => (
                <div
                  key={i}
                  className="bg-white p-5 rounded-[32px] shadow-sm flex justify-between items-center border border-gray-50"
                >
                  <div>
                    <h4 className="font-black text-sm text-gray-800">{shop.n}</h4>
                    <p className="text-[9px] text-gray-400 font-bold mt-1">
                      距離約 {shop.d}
                    </p>
                  </div>
                  <span className="bg-green-50 text-green-600 text-[10px] font-black px-3 py-1 rounded-full">
                    {shop.s} 品項中
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'orderTracking':
        return (
          <div className="h-full bg-blue-50/20 flex flex-col animate-in slide-in-from-right">
            <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
              <button
                onClick={() => {
                  if (selectedTrackingOrder) setSelectedTrackingOrder(null);
                  else setCurrentPage('home');
                }}
                className="p-2 bg-gray-50 rounded-full"
              >
                <ChevronLeft />
              </button>
              <span className="font-black text-xs uppercase tracking-widest text-gray-800">
                物流追蹤
              </span>
              <div className="w-10" />
            </div>

            {!selectedTrackingOrder ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {[
                  {
                    id: 'UNI-88271',
                    item: 'MacBook Air M1',
                    status: '派送中',
                    time: '10:45 AM',
                    color: 'blue',
                  },
                  {
                    id: 'DIN-44120',
                    item: '學霸簡餐 - 豬排丼',
                    status: '餐點製作中',
                    time: '12:30 PM',
                    color: 'orange',
                  },
                ].map((order, i) => {
                  const pill = colorClasses(order.color);
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedTrackingOrder(order)}
                      className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 flex justify-between items-center active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${pill}`}
                        >
                          <Package size={20} />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-gray-800">
                            {order.item}
                          </h4>
                          <p className="text-[9px] text-gray-400 font-bold uppercase">
                            {order.id}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-200" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 p-8 animate-in fade-in">
                <div className="bg-white p-8 rounded-[40px] shadow-xl text-center space-y-4 mb-10 border border-blue-50">
                  <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Package size={36} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-gray-800">
                      訂單：{selectedTrackingOrder.id}
                    </h3>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">
                      {selectedTrackingOrder.status}...
                    </p>
                  </div>
                </div>

                <div className="space-y-8 relative pl-10">
                  <div className="absolute left-[20px] top-2 bottom-2 w-0.5 bg-blue-100 border-dashed border-l-2" />
                  {[
                    { t: '訂單已送達', active: false },
                    { t: '派送中', active: true },
                    { t: '包裹抵達中轉站', active: false },
                    { t: '賣家已出貨', active: false },
                  ].map((step, i) => (
                    <div key={i} className="relative">
                      <div
                        className={`absolute -left-10 w-6 h-6 rounded-full border-4 border-white shadow-sm ${
                          step.active ? 'bg-blue-500 animate-pulse' : 'bg-gray-200'
                        }`}
                      />
                      <p
                        className={`font-black text-sm ${
                          step.active ? 'text-blue-600' : 'text-gray-400'
                        }`}
                      >
                        {step.t}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'exchange':
        return (
          <div className="h-full flex flex-col bg-white animate-in slide-in-from-right">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage('home')}
                className="p-2 bg-gray-50 rounded-full"
              >
                <ChevronLeft />
              </button>
              <span className="font-black text-xs uppercase tracking-widest text-gray-800">
                點數兌換
              </span>
              <div className="w-10" />
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 rounded-[32px] shadow-xl">
                <p className="text-[10px] uppercase tracking-widest font-black text-white/70">
                  Current Balance
                </p>
                <p className="text-4xl font-black mt-2">{userProfile.points}</p>
                <p className="text-xs font-bold text-white/70 mt-1">OPENPOINT</p>
              </div>

              <div className="space-y-4">
                {STUDENT_REWARDS.map((reward) => {
                  const Icon = reward.icon;
                  const canRedeem = userProfile.points >= reward.points;
                  return (
                    <div
                      key={reward.id}
                      className="bg-white border border-gray-100 rounded-[28px] p-5 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                          <Icon size={24} />
                        </div>

                        <div className="flex-1">
                          <p className="text-sm font-black text-gray-800">{reward.name}</p>
                          <p className="text-[9px] text-orange-500 font-bold uppercase mt-1">
                            {reward.brand}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-2">{reward.desc}</p>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-base font-black text-gray-900">
                          {reward.points} 點
                        </span>
                        <button
                          disabled={!canRedeem}
                          onClick={() => {
                            setPendingReward(reward);
                            setConfirmMode('confirmExchange');
                          }}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                            canRedeem
                              ? 'bg-orange-500 text-white shadow-lg active:scale-95'
                              : 'bg-gray-100 text-gray-400'
                          }`}
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

      case 'checkout': {
        const list = activeCartTab === 'market' ? marketCart : foodCart;
        const total = list.reduce((a, b) => a + (b.price || 0) * (b.quantity || 1), 0);
        const final = total - Math.min(checkoutData.pointRedemption || 0, userProfile.points || 0, total);

        return (
          <div className="h-full flex flex-col bg-white animate-in slide-in-from-right">
            <div className="p-4 border-b border-gray-50 flex items-center gap-4">
              <button
                onClick={() => setCurrentPage('home')}
                className="p-2 bg-gray-50 rounded-full"
              >
                <ChevronLeft />
              </button>
              <span className="font-black text-xs uppercase tracking-widest text-gray-800">
                Checkout 結帳
              </span>
            </div>

            <div className="flex-1 p-8 space-y-8 overflow-y-auto scrollbar-hide pb-32">
              <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 shadow-inner">
                <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4 italic">
                  Summary
                </h3>
                <div className="space-y-3">
                  {list.map((i) => (
                    <div
                      key={i.id}
                      className="flex justify-between items-center py-1.5 border-b border-dashed border-gray-200 text-xs font-bold text-gray-700"
                    >
                      <span>
                        {i.name} x{i.quantity || 1}
                      </span>
                      <span>${i.price * (i.quantity || 1)}</span>
                    </div>
                  ))}
                  <div className="pt-4 mt-2 flex flex-col gap-1 border-t border-gray-300">
                    <div className="flex justify-between items-center text-gray-400 text-[10px]">
                      <span>SUBTOTAL</span>
                      <span>${total}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-2xl font-black text-orange-600 tracking-tighter">
                      <span>TOTAL</span>
                      <span>${final}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 ml-2 text-orange-500">
                  <MapPin size={14} />
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    配送與取貨
                  </h3>
                </div>

                {activeCartTab === 'market' ? (
                  <div className="bg-white border border-gray-100 p-5 rounded-[32px] space-y-3 shadow-sm">
                    <input
                      value={checkoutData.receiver}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, receiver: e.target.value })
                      }
                      className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold border-none outline-none shadow-inner"
                      placeholder="收件人"
                    />
                    <input
                      value={checkoutData.phone}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, phone: e.target.value })
                      }
                      className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold border-none outline-none shadow-inner"
                      placeholder="電話"
                    />
                    <input
                      value={checkoutData.locationDetail}
                      onChange={(e) =>
                        setCheckoutData({
                          ...checkoutData,
                          locationDetail: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold border-none outline-none shadow-inner"
                      placeholder="位置 / 門市"
                    />
                  </div>
                ) : (
                  <div className="bg-orange-50/50 border border-orange-100 p-5 rounded-[32px] flex items-center gap-4 text-orange-800 shadow-inner">
                    <Store size={24} />
                    <div className="flex-1 font-black text-xs">
                      至餐廳現場取餐
                      <p className="text-[9px] text-orange-600">
                        請憑訂單畫面至櫃檯取餐
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 ml-2 text-orange-500">
                  <CreditCard size={14} />
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    支付方式
                  </h3>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCheckoutData({ ...checkoutData, payment: 'card' })}
                    className={`flex-1 py-3 rounded-2xl text-[10px] font-black transition-all ${
                      checkoutData.payment === 'card'
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    信用卡支付
                  </button>
                  <button
                    onClick={() => setCheckoutData({ ...checkoutData, payment: 'cash' })}
                    className={`flex-1 py-3 rounded-2xl text-[10px] font-black transition-all ${
                      checkoutData.payment === 'cash'
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    取貨付款
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 ml-2 text-orange-500">
                  <Wallet size={14} />
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    點數折抵
                  </h3>
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-[32px] p-5 flex items-center gap-3 shadow-inner">
                  <input
                    type="number"
                    value={checkoutData.pointRedemption || ''}
                    onChange={(e) =>
                      setCheckoutData({
                        ...checkoutData,
                        pointRedemption: Math.min(
                          parseInt(e.target.value, 10) || 0,
                          userProfile.points,
                          total
                        ),
                      })
                    }
                    className="flex-1 p-3 bg-white rounded-xl text-xs font-bold border-none outline-none"
                    placeholder="輸入點數"
                  />
                  <button
                    onClick={() =>
                      setCheckoutData({
                        ...checkoutData,
                        pointRedemption: Math.min(userProfile.points, total),
                      })
                    }
                    className="bg-orange-500 text-white px-4 py-3 rounded-xl text-[10px] font-black active:scale-95"
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-50 absolute bottom-0 w-full bg-white/95 z-30">
              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-gray-900 text-white rounded-[20px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl"
              >
                確認訂單並送出
              </button>
            </div>
          </div>
        );
      }

      case 'itemDetail':
        return (
          selectedItem && (
            <div className="h-full flex flex-col bg-white animate-in slide-in-from-bottom">
              <div className="p-4 flex items-center justify-between border-b border-gray-50">
                <button
                  onClick={() => setCurrentPage('market')}
                  className="p-2 bg-gray-50 rounded-full"
                >
                  <ChevronLeft size={22} />
                </button>
                <span className="font-black text-xs uppercase tracking-widest text-gray-800">
                  Product Detail
                </span>
                <div className="w-10" />
              </div>

              <div className="flex-1 overflow-y-auto">
                <img src={selectedItem.img} className="w-full aspect-square object-cover" />
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <h1 className="text-xl font-black text-gray-800 uppercase tracking-tighter leading-tight">
                      {selectedItem.name}
                    </h1>
                    <div className="text-2xl font-black text-orange-500">
                      ${selectedItem.price}
                    </div>
                  </div>

                  <div className="p-5 bg-gray-50 rounded-[28px] flex items-center justify-between border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-500 font-black text-lg shadow-sm">
                        {selectedItem.user?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-800">
                          {selectedItem.user}
                        </p>
                        <p className="text-[8px] text-green-600 font-bold uppercase flex items-center gap-1 mt-0.5">
                          <CheckCircle2 size={10} /> 已驗證成員
                        </p>
                      </div>
                    </div>
                    <button className="p-2.5 bg-white text-orange-500 rounded-lg shadow-sm border border-orange-50 active:scale-90">
                      <MessageCircle size={18} />
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed font-medium">
                    {selectedItem.desc}
                  </p>
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
          )
        );

      case 'historyView':
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
                {historyType === 'orders' ? 'Order History' : 'My Vouchers'}
              </span>
              <div className="w-10" />
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide">
              {userHistory.filter((h) =>
                historyType === 'orders'
                  ? h.type.startsWith('order')
                  : h.type === 'reward'
              ).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                  <History size={48} />
                  <p className="text-[10px] font-black uppercase mt-4">
                    No Records Found
                  </p>
                </div>
              ) : (
                userHistory
                  .filter((h) =>
                    historyType === 'orders'
                      ? h.type.startsWith('order')
                      : h.type === 'reward'
                  )
                  .map((h, i) => (
                    // 找到 userHistory.map((h, i) => ( 之後開始替換
                    <div
                      key={i}
                      className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex gap-4 items-center"
                    >
                      {/* 新增：左側照片預覽 */}
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-50">
                        {h.thumbnail ? (
                          <img src={h.thumbnail} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200">
                            <Package size={24} />
                          </div>
                        )}
                      </div>

                      {/* 右側資訊 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">
                            {new Date(h.at).toLocaleDateString()}
                          </span>
                          <div
                            className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase ${
                              h.type === 'order_market'
                                ? 'bg-blue-50 text-blue-500'
                                : h.type === 'reward'
                                ? 'bg-orange-50 text-orange-500'
                                : 'bg-gray-50 text-gray-500'
                            }`}
                          >
                            {h.type === 'order_market' ? '二手市集' : h.type === 'reward' ? '點數兌換' : '校園訂餐'}
                          </div>
                        </div>

                        <h4 className="text-[11px] font-black text-gray-800 uppercase truncate">
                          {h.type === 'reward' ? h.name : h.items.join(', ')}
                        </h4>

                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-[9px] font-black text-gray-400 uppercase">Amount</span>
                          <span className="text-sm font-black text-gray-900 tracking-tighter">
                            {h.type === 'reward' ? `${h.points} Pts` : `$${h.total}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center text-gray-400 font-black">
            Page Not Found
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 flex justify-center items-center w-full selection:bg-orange-100">
      <div className="w-full max-w-full md:max-w-[390px] h-screen md:h-[844px] bg-white md:rounded-[45px] md:shadow-2xl overflow-hidden flex flex-col relative md:border-[10px] md:border-gray-900 transition-all">
        <div className="h-10 flex items-center justify-between px-10 shrink-0 z-[100] bg-white">
          <span className="text-[12px] font-black tracking-tight text-gray-900">
            00:47
          </span>
          <div className="flex gap-2 items-center">
            <Smartphone size={14} className="text-gray-800" strokeWidth={3} />
            <div className="w-6 h-3 border-2 border-gray-900 relative rounded-sm p-[1px]">
              <div className="w-3/4 h-full bg-gray-900 rounded-[1px]" />
            </div>
          </div>
        </div>

        {![
          'itemDetail',
          'storeDetail',
          'checkout',
          'historyView',
          'exchange',
          'foodMap',
          'orderTracking',
        ].includes(currentPage) && (
          <header className="px-8 py-2.5 flex justify-between items-center shrink-0 z-[90]">
            <div
              className="flex items-center gap-3 active:scale-95 transition-transform cursor-pointer"
              onClick={() => setCurrentPage('home')}
            >
              <div className="w-6 h-6 border-[4px] border-orange-500 rounded-full" />
              <h1 className="text-lg font-black italic text-[#1A1A1A] tracking-tighter uppercase">
                Uni-Campus
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!user) return triggerLoginPrompt();
                  showToast('支付條碼功能');
                }}
                className="w-9 h-9 bg-white text-orange-500 rounded-lg flex items-center justify-center border border-gray-100 shadow-sm active:scale-90 transition-all"
              >
                <Barcode size={22} />
              </button>

              <button
                onClick={() => showToast('目前暫無新通知')}
                className="w-9 h-9 bg-white text-orange-500 rounded-lg flex items-center justify-center border border-gray-100 shadow-sm relative active:scale-90 transition-all"
              >
                <Bell size={18} />
                <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
              </button>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-hidden relative bg-white">
          <div className="h-full overflow-y-auto scrollbar-hide">{renderPage()}</div>
        </main>

        {['market', 'ordering', 'itemDetail', 'storeDetail'].includes(currentPage) && (
          <button
            onClick={() => {
              if (!user) return triggerLoginPrompt();
              setActiveCartTab(
                ['market', 'itemDetail'].includes(currentPage) ? 'market' : 'food'
              );
              setIsCartOpen(true);
            }}
            className="absolute bottom-24 right-6 w-14 h-14 bg-gray-900 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 z-[100] border-4 border-white transition-all"
          >
            <ShoppingCart size={20} />
            {user &&
              (['market', 'itemDetail'].includes(currentPage)
                ? marketCart
                : foodCart
              ).length > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border border-white shadow-md">
                  {(['market', 'itemDetail'].includes(currentPage)
                    ? marketCart
                    : foodCart
                  ).length}
                </div>
              )}
          </button>
        )}

        {![
          'itemDetail',
          'storeDetail',
          'checkout',
          'historyView',
          'exchange',
          'foodMap',
          'orderTracking',
        ].includes(currentPage) && (
          <nav className="bg-white px-8 py-4 pb-8 flex justify-between items-center shrink-0 z-[90] border-t border-gray-50 relative">
            {[
              { id: 'home', icon: Home },
              { id: 'market', icon: ShoppingBag },
              { id: 'ordering', icon: Utensils },
              { id: 'profile', icon: User },
            ].map((i) => (
              <button
                key={i.id}
                onClick={() => {
                  if (i.id !== 'home' && !user) return triggerLoginPrompt();
                  setCurrentPage(i.id);
                }}
                className={`flex flex-col items-center gap-1 transition-all ${
                  currentPage === i.id ? 'text-orange-500 scale-110' : 'text-gray-200'
                }`}
              >
                <i.icon size={20} strokeWidth={currentPage === i.id ? 4 : 2.5} />
                {currentPage === i.id && (
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-0.5 shadow-lg animate-pulse" />
                )}
              </button>
            ))}
          </nav>
        )}

        {(confirmMode === 'clearFoodCart' ||
          confirmMode === 'confirmExchange' ||
          confirmMode === 'requireLogin') && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[300] flex items-center justify-center p-10 animate-in fade-in">
            <div className="bg-white w-full rounded-[40px] p-8 shadow-2xl text-center space-y-6 snappy-anim scale-in">
              {confirmMode === 'requireLogin' ? (
                <>
                  <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-orange-100">
                    <Lock size={36} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">
                      需要登入
                    </h3>
                    <p className="text-xs text-gray-400 font-bold px-4">
                      請先登入以開啟完整校園服務功能。
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 pt-4">
                    <button
                      onClick={() => {
                        setConfirmMode(null);
                        setIsRegistering(false);
                        setCurrentPage('profile');
                      }}
                      className="w-full py-4 bg-orange-50 text-orange-600 rounded-[22px] font-black uppercase shadow-lg shadow-orange-100"
                    >
                      前往登入頁
                    </button>
                    <button
                      onClick={() => setConfirmMode(null)}
                      className="py-2 text-xs font-black text-gray-300 uppercase tracking-widest"
                    >
                      暫不登入
                    </button>
                  </div>
                </>
              ) : confirmMode === 'confirmExchange' ? (
                <>
                  <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Ticket size={36} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">
                      確認兌換？
                    </h3>
                    <p className="text-xs text-gray-400 font-bold px-4">
                      扣除{' '}
                      <span className="text-orange-600 font-black">
                        {pendingReward?.points} 點
                      </span>{' '}
                      兌換{' '}
                      <span className="text-gray-800 font-black">
                        {pendingReward?.name}
                      </span>
                      。
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 pt-4">
                    <button
                      onClick={handleExchange}
                      className="w-full py-4 bg-orange-500 text-white rounded-[22px] font-black uppercase shadow-lg shadow-orange-100"
                    >
                      確認兌換
                    </button>
                    <button
                      onClick={() => setConfirmMode(null)}
                      className="py-2 text-xs font-black text-gray-300 uppercase tracking-widest"
                    >
                      取消
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <UtensilsCrossed size={36} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">
                      更換餐廳？
                    </h3>
                    <p className="text-xs text-gray-400 font-bold px-4">
                      更換餐廳將清空目前的購物車。
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 pt-4">
                    <button
                      onClick={handleClearAndAddFood}
                      className="w-full py-4 bg-red-500 text-white rounded-[22px] font-black uppercase shadow-lg shadow-red-100"
                    >
                      清空並更換
                    </button>
                    <button
                      onClick={() => setConfirmMode(null)}
                      className="py-2 text-xs font-black text-gray-300 uppercase tracking-widest"
                    >
                      取消
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {isCartOpen && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[200] animate-in fade-in flex items-end">
            <div className="w-full bg-white max-h-[80%] flex flex-col rounded-t-[50px] shadow-2xl animate-in slide-in-from-bottom snappy-anim">
              <div className="p-8 pb-4 flex justify-between items-center">
                <h3 className="font-black text-lg text-gray-800 uppercase tracking-tighter">
                  My Cart
                </h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 active:rotate-90 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {!user ? (
                <div className="p-20 text-center text-gray-400 font-bold">
                  請先登入以使用購物車
                </div>
              ) : (
                <>
                  <div className="px-8 py-2 flex gap-3">
                    <button
                      onClick={() => setActiveCartTab('market')}
                      className={`flex-1 py-3 rounded-2xl text-[10px] font-black transition-all ${
                        activeCartTab === 'market'
                          ? 'bg-orange-500 text-white shadow-lg'
                          : 'bg-gray-50 text-gray-300'
                      }`}
                    >
                      市集 ({marketCart.length})
                    </button>
                    <button
                      onClick={() => setActiveCartTab('food')}
                      className={`flex-1 py-3 rounded-2xl text-[10px] font-black transition-all ${
                        activeCartTab === 'food'
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'bg-gray-50 text-gray-300'
                      }`}
                    >
                      餐飲 ({foodCart.length})
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-3 scrollbar-hide">
                    {(activeCartTab === 'market' ? marketCart : foodCart).length === 0 ? (
                      <div className="text-center py-20 text-gray-200 font-black italic text-xs uppercase tracking-widest">
                        Empty
                      </div>
                    ) : (
                      (activeCartTab === 'market' ? marketCart : foodCart).map((i) => (
                        <div
                          key={i.id}
                          className="flex gap-4 items-center bg-gray-50/50 p-4 rounded-[28px] border border-gray-100 shadow-sm"
                        >
                          <img
                            src={i.img || 'https://via.placeholder.com/150'}
                            className="w-12 h-12 object-cover rounded-xl"
                          />
                          <div className="flex-1">
                            <h4 className="font-black text-[11px] text-gray-800 truncate uppercase tracking-tighter">
                              {i.name}
                            </h4>
                            <span className="text-orange-500 font-black text-[11px]">
                              ${i.price * (i.quantity || 1)}
                            </span>
                          </div>

                          {activeCartTab === 'food' ? (
                            <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
                              <button
                                onClick={() => updateFoodQty(i.id, -1)}
                                className="w-6 h-6 flex items-center justify-center bg-gray-50 rounded-lg text-orange-500"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-[11px] font-black min-w-[16px] text-center">
                                {i.quantity}
                              </span>
                              <button
                                onClick={() => updateFoodQty(i.id, 1)}
                                className="w-6 h-6 flex items-center justify-center bg-gray-50 rounded-lg text-orange-500"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-1 rounded-md">數量: 1</span>
                                <button
                                  onClick={() => deleteMarketCartItem(i.id)}
                                  className="text-gray-200 active:text-red-500 transition-colors p-2"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-8 border-t border-gray-50">
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        setCurrentPage('checkout');
                      }}
                      className="w-full py-4 bg-gray-900 text-white rounded-[20px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                      disabled={(activeCartTab === 'market' ? marketCart : foodCart).length === 0}
                    >
                      結帳
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {isOrderSuccess && (
          <div className="absolute inset-0 bg-white z-[800] flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95">
            <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[40px] flex items-center justify-center mb-8 border-4 border-green-100 shadow-2xl animate-bounce">
              <Check size={48} strokeWidth={4} />
            </div>
            <h2 className="text-3xl font-black italic tracking-tighter text-gray-900 leading-none">
              訂單已完成！
            </h2>
            <p className="text-[11px] text-gray-400 mt-5 px-6 leading-relaxed font-bold uppercase tracking-widest italic opacity-60">
              您的訂單已成功送出，謝謝您的使用。
            </p>
            <button
              onClick={() => {
                setIsOrderSuccess(false);
                setCurrentPage('home');
              }}
              className="w-full py-5 bg-gray-900 text-white rounded-[25px] font-black text-[11px] uppercase mt-12 shadow-2xl active:scale-95 transition-all"
            >
              Back to Home
            </button>
          </div>
        )}

        {isUploadOpen && (
          <div className="absolute inset-0 bg-white z-[600] flex flex-col animate-in slide-in-from-bottom">
            <div className="p-6 flex justify-between items-center border-b border-gray-50">
              <button onClick={() => setIsUploadOpen(false)} className="p-2 text-gray-300">
                <X size={22} />
              </button>
              <span className="font-black text-[10px] uppercase tracking-[0.4em] text-gray-400 italic">Create Post</span>
              <div className="w-10" />
            </div>

            <form onSubmit={handleUpload} className="p-8 space-y-6 flex-1 overflow-y-auto">
              {/* 圖片上傳區塊 */}
              <div 
                className="aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-[35px] flex flex-col items-center justify-center text-gray-300 cursor-pointer relative overflow-hidden"
                onClick={() => document.getElementById('marketFileInput').click()}
              >
                {newPost.imageFile ? (
                  <img 
                    src={URL.createObjectURL(newPost.imageFile)} 
                    className="w-full h-full object-cover" 
                    alt="preview"
                  />
                ) : (
                  <>
                    <ImageIcon size={48} strokeWidth={1} />
                    <span className="text-[9px] font-black uppercase mt-4 tracking-widest opacity-50">點擊上傳照片</span>
                  </>
                )}
              </div>

              <input 
                id="marketFileInput"
                type="file" 
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setNewPost({ ...newPost, imageFile: file });
                }}
              />
              
              {/* 欄位輸入區 */}
              <div className="space-y-4">
                <input
                  required
                  className="w-full p-5 bg-gray-50 rounded-[20px] text-xs font-bold outline-none border border-gray-100"
                  placeholder="商品名稱"
                  value={newPost.name}
                  onChange={(e) => setNewPost({ ...newPost, name: e.target.value })}
                />
                <input
                  required
                  type="number"
                  className="w-full p-5 bg-gray-50 rounded-[20px] text-xs font-bold outline-none border border-gray-100"
                  placeholder="價格"
                  value={newPost.price}
                  onChange={(e) => setNewPost({ ...newPost, price: e.target.value })}
                />
                <select
                  className="w-full p-5 bg-gray-50 rounded-[20px] text-xs font-bold border border-gray-100"
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                >
                  {MARKET_CATEGORIES.filter(c => c !== '全部').map(c => <option key={c}>{c}</option>)}
                </select>
                <textarea
                  className="w-full p-5 bg-gray-50 rounded-[20px] text-xs font-bold border border-gray-100 h-24"
                  placeholder="詳情描述..."
                  value={newPost.desc}
                  onChange={(e) => setNewPost({ ...newPost, desc: e.target.value })}
                />
              </div>

              <button type="submit" className="w-full py-5 bg-orange-500 text-white rounded-[25px] font-black uppercase shadow-2xl">
                發佈商品
              </button>
            </form>
          </div>
        )}

        {toastMsg && (
          <div className="absolute inset-x-0 bottom-28 flex justify-center z-[1000] px-10 animate-in slide-in-from-bottom snappy-anim">
            <div className="bg-gray-900/95 backdrop-blur-md text-white px-8 py-5 rounded-full flex items-center gap-4 shadow-2xl border border-white/10">
              <CheckCircle2 size={18} className="text-orange-500" />
              <span className="text-xs font-black uppercase tracking-widest">
                {toastMsg}
              </span>
            </div>
          </div>
        )}

        <div className="h-5 w-full flex justify-center items-end pb-2 shrink-0 bg-white">
          <div className="w-24 h-[4px] bg-gray-100 rounded-full" />
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-from-bottom { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slide-in-from-right { from { transform: translateX(15px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes zoom-in-95 { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes scale-in { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-in { animation-duration: 0.2s; animation-fill-mode: both; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
        .snappy-anim { animation-duration: 0.15s !important; }
        .scale-in { animation-name: scale-in; }
        .fade-in { animation-name: fade-in; }
        .slide-in-from-bottom { animation-name: slide-in-from-bottom; }
        .slide-in-from-right { animation-name: slide-in-from-right; }
        .zoom-in-95 { animation-name: zoom-in-95; }
      `}</style>
    </div>
  );
}