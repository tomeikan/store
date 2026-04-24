const router = require('express').Router();
const supabase = require('../supabase');
const { authMiddleware } = require('../middleware/auth');

// 建立訂單
router.post('/', authMiddleware, async (req, res) => {
  const { items } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: '購物車是空的' });

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: req.user.id,
      items: JSON.stringify(items),
      total,
      status: 'pending'
    })
    .select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 取得我的訂單
router.get('/', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  // 把 items JSON 字串解析回來
  const orders = data.map(o => ({ ...o, items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items }));
  res.json(orders);
});

module.exports = router;
