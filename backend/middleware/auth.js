const jwt = require('jsonwebtoken');
module.exports = function(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = payload.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
