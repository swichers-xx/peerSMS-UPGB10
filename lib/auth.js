import jwt from 'jsonwebtoken';
import User from '../models/User';

export async function verifyToken(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return null;
    }

    return { id: user._id };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function authMiddleware(handler) {
  return async (req, res) => {
    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = user;
    return handler(req, res);
  };
}
