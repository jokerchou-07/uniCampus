// src/lib/constants.js
import { Coffee, Gift, BookOpen, Zap } from 'lucide-react';

/** 
 * 市集與訂餐的分類標籤
 */
export const MARKET_CATEGORIES = ['全部', '玩具', '電子產品', '書籍', '生活用品'];
export const FOOD_CATEGORIES = ['全部', '早餐', '午餐', '晚餐', '飲品'];

/** 
 * 校園餐廳靜態資料
 */
export const CAMPUS_STORES = [
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

/** 
 * 點數兌換獎勵資料
 */
export const STUDENT_REWARDS = [
  { id: 'r1', name: '期末加油包', points: 150, brand: '熬夜必備', desc: '內含大杯美式咖啡 x1 + 能量飲 x1', icon: Coffee },
  { id: 'r2', name: '歐趴糖禮盒', points: 250, brand: 'ALL PASS', desc: '精選進口巧克力與綜合果乾', icon: Gift },
  { id: 'r3', name: '校園影印100張', points: 50, brand: '報告救星', desc: '校內影印部專用', icon: BookOpen },
  { id: 'r4', name: '校內餐廳優惠卷', points: 30, brand: '專屬福利', desc: '享 50 元現折優惠', icon: Zap },
];

/** 
 * LocalStorage 鍵名
 */
export const LS_KEYS = {
  user: 'uni-campus-user',
  profile: 'uni-campus-profile',
  marketItems: 'uni-campus-market-items',
  marketCart: 'uni-campus-market-cart',
  foodCart: 'uni-campus-food-cart',
  history: 'uni-campus-history',
};