import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

export interface AuthRequest extends Request {
  wallet?: string;
  role?: 'PLATFORM_ADMIN' | 'COLLEGE_ADMIN' | 'STUDENT';
}

export function authenticateWallet(req: AuthRequest, res: Response, next: NextFunction) {
  const wallet = req.headers['x-wallet-address'] as string;

  if (!wallet) {
    return res.status(401).json({ error: 'Wallet address required' });
  }

  // Determine role server-side
  let role: 'PLATFORM_ADMIN' | 'COLLEGE_ADMIN' | 'STUDENT';

  if (wallet === config.platformAdminWallet) {
    role = 'PLATFORM_ADMIN';
  } else if (wallet === config.collegeAdminWallet) {
    role = 'COLLEGE_ADMIN';
  } else {
    role = 'STUDENT';
  }

  req.wallet = wallet;
  req.role = role;

  next();
}

export function requireRole(...roles: Array<'PLATFORM_ADMIN' | 'COLLEGE_ADMIN' | 'STUDENT'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.role || !roles.includes(req.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
