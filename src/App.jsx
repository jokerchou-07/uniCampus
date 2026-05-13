import { auth, db, storage } from './lib/firebase';
import 'leaflet/dist/leaflet.css';
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


import { 
  MARKET_CATEGORIES, 
  FOOD_CATEGORIES, 
  CAMPUS_STORES, 
  STUDENT_REWARDS, 
  LS_KEYS 
} from './lib/constants';

import { readLS, writeLS, colorClasses } from './lib/utils';

//頁面
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import CartDrawer from './components/CartDrawer';
import MarketPage from './pages/MarketPage';
import HomePage from './pages/HomePage';
import OrderingPage from './pages/OrderingPage';
import ProfilePage from './pages/ProfilePage';
import ItemDetailPage from './pages/ItemDetailPage';
import StoreDetailPage from './pages/StoreDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import HistoryPage from './pages/HistoryPage';
import ExchangePage from './pages/ExchangePage';
import FoodMapPage from './pages/FoodMapPage';

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
const TEST_MARKET_ITEMS = [];

const navItems = [
  { id: 'home', icon: Home },
  { id: 'market', icon: ShoppingBag },
  { id: 'ordering', icon: Utensils },
  { id: 'profile', icon: User },
];

// -----------------------------
// localStorage helpers
// -----------------------------
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState({
    points: '---',
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
    university: '',
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
        pointRedemption: 0,
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
        points: 200,
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

  const handleCheckout = async (orderDataFromPage) => {
    if (!user) return;

    const target = activeCartTab === 'market' ? marketCart : foodCart;
    if (target.length === 0) return;

    const total = target.reduce((a, b) => a + (b.price || 0) * (b.quantity || 1), 0);
    const redemption = Math.min(
      checkoutData.pointRedemption || 0,
      userProfile.points || 0,
      total
    );
    const REWARD_POINTS = 5; 
    // 計算最終點數：原有點數 - 折抵 + 回饋
    const updatedPoints = userProfile.points - redemption + REWARD_POINTS;

    setIsLoading(true); // 開始處理，顯示讀取中

    // 1. 本地模式處理 (Local Mode)
    if (!firebaseEnabled) {
      setUserProfile((prev) => ({ ...prev, points: updatedPoints }));
      setIsOrderSuccess(true);
      setIsLoading(false);
      return;
    }

    // 2. Firebase 模式處理
    try {
      // A. 處理點數折抵
      await setDoc(
        doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'),
        { points: updatedPoints },
        { merge: true }  
      );  
      

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
        const marketRef = collection(
          db,
          'artifacts',
          appId,
          'public',
          'data',
          'marketItems'
        );

        await addDoc(marketRef, postData);

        // 上架回饋 +2 點
        await setDoc(
          doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'),
          {
            points: (userProfile.points || 0) + 2
          },
          { merge: true }
        );

        // 寫入歷史紀錄（可選）
        await addDoc(
          collection(db, 'artifacts', appId, 'users', user.uid, 'history'),
          {
            type: 'upload_reward',
            name: '二手商品上架回饋',
            pointsRewarded: 2,
            at: Date.now()
          }
        );

        console.log("Firestore 寫入成功 (Base64 模式)");
      } else {
        setMarketItems((prev) => [{ id: Date.now(), ...postData }, ...prev]);

        // Local 模式也加點
        setUserProfile((prev) => ({
          ...prev,
          points: (prev.points || 0) + 2
        }));
      }

      setIsUploadOpen(false);
      setNewPost({ name: '', price: '', category: '玩具', desc: '', imageFile: null });
      showToast('商品已成功上架，點數+2');
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
          <HomePage 
            user={user}
            userProfile={userProfile}
            setCurrentPage={setCurrentPage}
            triggerLoginPrompt={triggerLoginPrompt}
            colorClasses={colorClasses}
          />
        );
      case 'market':
        return (
          <MarketPage 
            isSearchOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setIsUploadOpen={setIsUploadOpen}
            activeMarketCat={activeMarketCat}
            setActiveMarketCat={setActiveMarketCat}
            marketCategories={MARKET_CATEGORIES}
            filteredMarketItems={filteredMarketItems}
            setSelectedItem={setSelectedItem}
            setCurrentPage={setCurrentPage}
          />
        );

      case 'ordering':
        return (
          <OrderingPage 
            isSearchOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeFoodCat={activeFoodCat}
            setActiveFoodCat={setActiveFoodCat}
            foodCategories={FOOD_CATEGORIES}
            filteredStores={filteredStores}
            setSelectedStore={setSelectedStore}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'storeDetail':
        return (
          <StoreDetailPage 
            selectedStore={selectedStore} 
            setCurrentPage={setCurrentPage} 
            foodCart={foodCart} 
            addFoodToCart={addFoodToCart} 
          />
        );
      case 'profile':
        return (
          <ProfilePage 
            user={user}
            userProfile={userProfile}
            isRegistering={isRegistering}
            setIsRegistering={setIsRegistering}
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            registerForm={registerForm}
            setRegisterForm={setRegisterForm}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleSignIn={handleSignIn}
            handleRegister={handleRegister}
            handleLogOut={handleLogOut}
            setCurrentPage={setCurrentPage}
            setHistoryType={setHistoryType}
          />
        );
      case 'foodMap':
        return (
          <FoodMapPage 
            setCurrentPage={setCurrentPage}
          />
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
          <ExchangePage 
            userProfile={userProfile} 
            studentRewards={STUDENT_REWARDS} 
            setPendingReward={setPendingReward} 
            setConfirmMode={setConfirmMode} 
            setCurrentPage={setCurrentPage} 
          />
        );
      case 'checkout':
        return (
          <CheckoutPage 
            activeCartTab={activeCartTab}
            marketCart={marketCart}
            foodCart={foodCart}
            userProfile={userProfile}
            checkoutData={checkoutData}
            setCheckoutData={setCheckoutData}
            handleCheckout={handleCheckout}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'itemDetail':
        return (
          <ItemDetailPage 
            selectedItem={selectedItem} 
            setCurrentPage={setCurrentPage} 
            addToMarketCart={addToMarketCart} 
          />
        );
      case 'historyView':
        return (
          <HistoryPage 
            userHistory={userHistory} 
            historyType={historyType} 
            setCurrentPage={setCurrentPage} 
          />
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
    <div className="min-h-dvh bg-slate-200 flex justify-center w-full selection:bg-orange-100">
      <div className="w-full max-w-full md:max-w-[390px] min-h-dvh md:h-[844px] bg-white md:rounded-[45px] md:shadow-2xl overflow-hidden flex flex-col relative md:border-[10px] md:border-gray-900 transition-all pb-[calc(7rem+env(safe-area-inset-bottom))]">
        {![
          'itemDetail',
          'storeDetail',
          'checkout',
          'historyView',
          'exchange',
          'foodMap',
          'orderTracking',
        ].includes(currentPage) && (
          <header 
          style={{ paddingTop: `calc(env(safe-area-inset-top) + 20px)` }}
          className="px-8 py-3 flex justify-between items-center shrink-0 z-[90] bg-white">
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
            className="fixed bottom-24 right-6 w-14 h-14 bg-gray-900 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 z-[100] border-4 border-white transition-all"
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

        <Navbar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          user={user} 
          triggerLoginPrompt={triggerLoginPrompt}
          navItems={navItems}
        />

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

        <CartDrawer 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          user={user}
          activeCartTab={activeCartTab}
          setActiveCartTab={setActiveCartTab}
          marketCart={marketCart}
          foodCart={foodCart}
          updateFoodQty={updateFoodQty}
          deleteMarketCartItem={deleteMarketCartItem}
          setCurrentPage={setCurrentPage}
        />

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
                  if (file) {
                    // 1. 設定限制大小 (2MB)
                    const MAX_FILE_SIZE = 2 * 1024 * 1024;

                    // 2. 檢查大小
                    if (file.size > MAX_FILE_SIZE) {
                      showToast('檔案太大了！圖片不可超過 2MB');
                      e.target.value = ""; // 重置 input，防止選中該大檔案
                      return; 
                    }

                    // 3. 檢查通過才存入 state
                    setNewPost({ ...newPost, imageFile: file });
                  }
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

        <Toast message={toastMsg} />

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