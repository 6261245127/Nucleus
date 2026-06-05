import { Router } from 'express';
import { register, login, googleLogin, bypassLogin, getMe } from '../controllers/auth';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/bypass', bypassLogin);
router.get('/me', authenticate, getMe);

export default router;
