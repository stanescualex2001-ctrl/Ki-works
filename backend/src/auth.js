import crypto from 'crypto';

const SECRET = process.env.AUTH_SECRET || 'dev-secret-change-me';

export function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(pw, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(pw, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const check = crypto.scryptSync(pw, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'));
}

export function signToken(payload, ttlSeconds = 60 * 60 * 24 * 30) {
  const body = { ...payload, exp: Date.now() + ttlSeconds * 1000 };
  const data = Buffer.from(JSON.stringify(body)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [data, sig] = token.split('.');
  const expect = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  if (sig.length !== expect.length
    || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

// Public routes stay open; internal calls (n8n, Skripte auf dem Server selbst,
// erkennbar an fehlendem Proxy-Header) gelten als Admin; alles andere braucht Token.
export function authMiddleware(req, res, next) {
  if (req.path.startsWith('/api/webhooks/')
    || req.path === '/api/login'
    || req.path === '/api/health') return next();
  const viaProxy = Boolean(req.headers['x-real-ip']);
  const local = ['127.0.0.1', '::ffff:127.0.0.1', '::1'].includes(req.socket.remoteAddress);
  if (local && !viaProxy) {
    req.user = { role: 'admin', internal: true };
    return next();
  }
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'unauthorized' });
  req.user = payload;
  return next();
}

export const customerScope = (req) =>
  (req.user?.role === 'customer' ? req.user.restaurant_id : null);

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'admin only' });
  return next();
}
