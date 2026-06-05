import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUser,
  getAllCampaigns,
  updateCampaignStatus,
  deleteCampaign,
  adminAdjustWallet,
  getAllWithdrawals,
  updateWithdrawalStatus,
} from '../controllers/admin';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate);
router.use(requireRole(['ADMIN']));

// Dashboard
router.get('/stats', getDashboardStats);

// User Management
router.get('/users', getAllUsers);
router.patch('/users/:id', updateUser);

// Campaign Management
router.get('/campaigns', getAllCampaigns);
router.patch('/campaigns/:id/status', updateCampaignStatus);
router.delete('/campaigns/:id', deleteCampaign);

// Wallet
router.post('/wallet/adjust', adminAdjustWallet);

// Withdrawals
router.get('/withdrawals', getAllWithdrawals);
router.patch('/withdrawals/:id/status', updateWithdrawalStatus);

export default router;
