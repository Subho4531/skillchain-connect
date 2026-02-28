import express from 'express';
import { authenticateWallet, requireRole, AuthRequest } from '../middleware/auth';
import { contractService } from '../services/contract.service';

const router = express.Router();

// Get admin addresses from contract
router.get('/contract-admins', authenticateWallet, async (req: AuthRequest, res) => {
  try {
    const admins = await contractService.getAdmins();
    res.json(admins);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
