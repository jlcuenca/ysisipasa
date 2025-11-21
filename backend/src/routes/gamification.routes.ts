import { Router } from 'express';
import {
    getGamificationState,
    markResultsViewed,
    awardPoints,
} from '../controllers/gamificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/state', authenticate, getGamificationState);
router.post('/viewed-results', authenticate, markResultsViewed);
router.post('/award-points', authenticate, awardPoints);

export default router;
