const router = require('express').Router();
const https = require('https');
const jwt = require('jsonwebtoken');
const supabase = require('../supabase');

function httpsPost(hostname, path, data, headers) {
  return new Promise((resolve, reject) => {
    const body = typeof data === 'string' ? data : JSON.stringify(data);
    const options = {
      hostname, path, method: 'POST',
      headers: { ...headers, 'Content-Length': Buffer.byteLength(body) }
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => resolve(JSON.parse(raw)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function httpsGet(hostname, path, headers) {
  return new Promise((resolve, reject) => {
    const options = { hostname, path, method: 'GET', headers };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => resolve(JSON.parse(raw)));
    });
    req.on('error', reject);
    req.end();
  });
}

router.post('/line/callback', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: '缺少 code' });

  const CALLBACK_URL = 'https://tomeikan.github.io/store/callback.html';

  try {
    const body = [
      'grant_type=authorization_code',
      'code=' + encodeURIComponent(code),
      'redirect_uri=' + encodeURIComponent(CALLBACK_URL),
      'client_id=' + encodeURIComponent(process.env.LINE_CHANNEL_ID),
      'client_secret=' + encodeURIComponent(process.env.LINE_CHANNEL_SECRET)
    ].join('&');

    const tokenData = await httpsPost(
      'api.line.me',
      '/oauth2/v2.1/token',
      body,
      { 'Content-Type': 'application/x-www-form-urlencoded' }
    );

    console.log('Token response:', JSON.stringify(tokenData));

    if (!tokenData.access_token) throw new Error('No access_token: ' + JSON.stringify(tokenData));

    const profile = await httpsGet(
      'api.line.me',
      '/v2/profile',
      { Authorization: 'Bearer ' + tokenData.access_token }
    );

    console.log('Profile:', JSON.stringify(profile));

    const { data: user, error } = await supabase
      .from('users')
      .upsert(
        { line_id: profile.userId, display_name: profile.displayName, picture: profile.pictureUrl },
        { onConflict: 'line_id' }
      )
      .select().single();

    if (error) throw error;

    const token = jwt.sign(
      { id: user.id, line_id: profile.userId, display_name: profile.displayName, picture: profile.pictureUrl },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token, user: { id: user.id, display_name: profile.displayName, picture: profile.pictureUrl } });

} catch (e) {
  console.error('LINE login error:', e.message);
  console.error('Full error:', JSON.stringify(e));
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