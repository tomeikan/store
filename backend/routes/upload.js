const router = require('express').Router();
const supabase = require('../supabase');
const { adminMiddleware } = require('../middleware/auth');

// 上傳圖片到 Supabase Storage
router.post('/', adminMiddleware, async (req, res) => {
  const { base64, filename, mimetype } = req.body;
  if (!base64 || !filename) return res.status(400).json({ error: '缺少圖片資料' });

  try {
    // 把 base64 轉成 Buffer
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // 產生唯一檔名避免衝突
    const ext = filename.split('.').pop() || 'jpg';
    const uniqueName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // 上傳到 Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(uniqueName, buffer, {
        contentType: mimetype || 'image/jpeg',
        upsert: false
      });

    if (error) throw error;

    // 取得公開網址
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(uniqueName);

    res.json({ url: urlData.publicUrl });
  } catch (e) {
    console.error('Upload error:', e.message);
    res.status(500).json({ error: '上傳失敗：' + e.message });
  }
});

module.exports = router;
