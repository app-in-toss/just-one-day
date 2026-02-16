import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
}

function decodeJwtPayload(token: string): Record<string, any> {
  const payload = token.split('.')[1];
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization header is required' });
    return;
  }

  try {
    const token = authorization.replace('Bearer ', '');
    const payload = decodeJwtPayload(token);
    const userId = payload.sub as string;

    if (!userId) {
      res.status(401).json({ error: 'Invalid token: missing sub claim' });
      return;
    }

    req.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
