const router = require('express').Router();
const supabase = require('../supabase');
const { adminMiddleware } = require('../middleware/auth');

router.use(adminMiddleware);

// ===== 統計 =====
router.get('/stats', async (req, res) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const [orders, products, users] = await Promise.all([
    supabase.from('orders').select('total, created_at'),
    supabase.from('products').select('id'),
    supabase.from('users').select('id'),
  ]);
  const todayOrders = (orders.data || []).filter(o => new Date(o.created_at) >= today);
  res.json({
    today_orders: todayOrders.length,
    today_revenue: todayOrders.reduce((s, o) => s + o.total, 0),
    total_products: (products.data || []).length,
    total_users: (users.data || []).length,
  });
});

// ===== 商品管理 =====
router.get('/products', async (req, res) => {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/products', async (req, res) => {
  const { data, error } = await supabase.from('products').insert({ ...req.body, is_active: true }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.put('/products/:id', async (req, res) => {
  const { data, error } = await supabase.from('products').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete('/products/:id', async (req, res) => {
  const { error } = await supabase.from('products').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ===== 公告管理 =====
router.get('/notices', async (req, res) => {
  const { data, error } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/notices', async (req, res) => {
  const { data, error } = await supabase.from('notices').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.put('/notices/:id', async (req, res) => {
  const { data, error } = await supabase.from('notices').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete('/notices/:id', async (req, res) => {
  const { error } = await supabase.from('notices').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ===== 訂單管理 =====
router.get('/orders', async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 100;
  const { data, error } = await supabase
    .from('orders')
    .select('*, users(display_name)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return res.status(500).json({ error: error.message });
  const orders = data.map(o => ({
    ...o,
    user_name: o.users?.display_name || '-',
    items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
  }));
  res.json(orders);
});

router.patch('/orders/:id', async (req, res) => {
  const { data, error } = await supabase.from('orders').update({ status: req.body.status }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ===== 會員管理 =====
router.get('/users', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
