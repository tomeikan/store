const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: '未登入' });
  try {
    req.user = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token 無效或已過期' });
  }
}

function adminMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: '未授權' });
  try {
    const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    if (!decoded.is_admin) return res.status(403).json({ error: '無管理員權限' });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token 無效' });
  }
}

module.exports = { authMiddleware, adminMiddleware };
