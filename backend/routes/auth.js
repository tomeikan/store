const router = require('express').Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const supabase = require('../supabase');

router.post('/line/callback', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: '缺少 code' });

  const CALLBACK_URL = 'https://tomeikan.github.io/store/callback.html';

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', CALLBACK_URL);
    params.append('client_id', process.env.LINE_CHANNEL_ID);
    params.append('client_secret', process.env.LINE_CHANNEL_SECRET);

    const tokenRes = await axios({
      method: 'post',
      url: 'https://api.line.me/oauth2/v2.1/token',
      data: params.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const access_token = tokenRes.data.access_token;

    const profileRes = await axios({
      method: 'get',
      url: 'https://api.line.me/v2/profile',
      headers: { Authorization: 'Bearer ' + access_token }
    });

    const line_id = profileRes.data.userId;
    const display_name = profileRes.data.displayName;
    const picture = profileRes.data.pictureUrl;

    const { data: user, error } = await supabase
      .from('users')
      .upsert({ line_id, display_name, picture }, { onConflict: 'line_id' })
      .select().single();

    if (error) throw error;

    const token = jwt.sign(
      { id: user.id, line_id, display_name, picture },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token, user: { id: user.id, display_name, picture } });

  } catch (e) {
    console.error('LINE login error:', e.message);
    console.error('LINE error detail:', JSON.stringify(e.response && e.response.data));
    res.status(500).json({ error: '登入失敗' });
  }
});

router.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: '密碼錯誤' });
  }
  const token = jwt.sign({ is_admin: true }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

module.exports = router;