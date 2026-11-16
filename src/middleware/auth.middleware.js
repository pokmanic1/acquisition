import logger from '#config/logger.js';
import { jwttoken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

// Verifies the JWT (from the `token` cookie set at sign-in, or an
// `Authorization: Bearer <token>` header) and attaches the payload to req.user.
export const authenticateToken = (req, res, next) => {
  const header = req.get('Authorization');
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  const token = cookies.get(req, 'token') || bearer;

  if (!token) {
    return res
      .status(401)
      .json({ error: 'Unauthorized', message: 'Authentication required' });
  }

  try {
    const { id, email, role } = jwttoken.verify(token);
    req.user = { id, email, role };
    next();
  } catch (e) {
    logger.warn('Invalid or expired token', {
      path: req.path,
      error: e.message,
    });
    return res
      .status(401)
      .json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
};

// Usage: router.get('/', authenticateToken, requireRole('admin'), handler)
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      logger.warn('Insufficient permissions', {
        userId: req.user?.id,
        role: req.user?.role,
        required: roles,
        path: req.path,
      });
      return res
        .status(403)
        .json({ error: 'Forbidden', message: 'Insufficient permissions' });
    }
    next();
  };
}
