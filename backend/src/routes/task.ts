import { Router } from 'express';
import { getAvailableTasks, completeTask, getMyTaskHistory, getMyWallet } from '../controllers/task';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

// All viewer routes require authentication and VIEWER role
router.use(authenticate);
router.use(requireRole(['VIEWER']));

router.get('/available', getAvailableTasks);
router.post('/complete/:campaignId', completeTask);
router.get('/history', getMyTaskHistory);
router.get('/wallet', getMyWallet);

export default router;
