import express from 'express';
import { authenticateWallet, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/role', authenticateWallet, (req: AuthRequest, res) => {
  res.json({
    wallet: req.wallet,
    role: req.role,
  });
});

export default router;
