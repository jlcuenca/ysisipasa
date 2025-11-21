import { Router } from 'express';
import {
    getQuestionnaires,
    getQuestionnaireByCategory,
    submitQuestionnaire,
    getUserResponses,
} from '../controllers/questionnaireController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getQuestionnaires);
router.get('/:category', getQuestionnaireByCategory);
router.post('/submit', authenticate, submitQuestionnaire);
router.get('/responses/me', authenticate, getUserResponses);

export default router;
