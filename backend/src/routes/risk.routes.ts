import { Router } from 'express';
import { calculateRisk, getRiskByCategory } from '../controllers/riskController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/calculate', authenticate, calculateRisk);
router.get('/category/:category', authenticate, getRiskByCategory);

export default router;
