import { Router } from 'express';
import { createCampaign, getMyCampaigns, getCampaignMetrics, pauseCampaign } from '../controllers/campaign';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

// All campaign routes require authentication and CREATOR role
router.use(authenticate);
router.use(requireRole(['CREATOR']));

router.post('/', createCampaign);
router.get('/', getMyCampaigns);
router.get('/:id/metrics', getCampaignMetrics);
router.patch('/:id/pause', pauseCampaign);

export default router;
