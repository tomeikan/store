-- =============================================
-- 資料庫建立腳本
-- 請在 Supabase SQL Editor 貼上並執行
-- =============================================

-- 會員表
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  line_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  picture TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 商品表
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '📦',
  category TEXT DEFAULT 'life',
  price INTEGER NOT NULL,
  original_price INTEGER,
  description TEXT,
  is_sale BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 公告表
CREATE TABLE notices (
  id SERIAL PRIMARY KEY,
  tag TEXT DEFAULT 'info',
  tag_label TEXT DEFAULT '通知',
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 訂單表
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  items JSONB NOT NULL,
  total INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 預設範例商品
INSERT INTO products (name, emoji, category, price, original_price, description, is_sale) VALUES
('療癒系玩偶', '🧸', 'toy', 380, 540, '柔軟舒適的療癒玩偶，適合送禮', true),
('手工餅乾禮盒', '🍪', 'food', 280, null, '精選手工餅乾，新鮮製作', false),
('日系棉質上衣', '👚', 'clothing', 650, 890, '舒適透氣的日系棉質上衣', true),
('香氛蠟燭組', '🕯', 'life', 460, null, '天然大豆蠟，多種香氛選擇', false),
('益智積木玩具', '🧩', 'toy', 320, null, '適合 3 歲以上兒童，安全無毒', false),
('生活雜貨組合', '🌿', 'life', 199, 280, '精選生活好物組合', true);

-- 預設範例公告
INSERT INTO notices (tag, tag_label, title, content) VALUES
('sale', '促銷活動', '🎉 週年慶特賣，全館 85 折', '感謝大家的支持！即日起至月底，全館商品享 85 折優惠。'),
('new', '新品上架', '春夏新款服飾已全面上架', '多款日系、韓系服飾全新到貨，歡迎選購！'),
('info', '出貨通知', '出貨時間說明', '下單後 1-2 個工作天出貨，假日不出貨，感謝您的耐心等候。');
