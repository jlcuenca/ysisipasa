import { Response } from 'express';
import { GamificationModel } from '../models/Gamification';
import { QuestionnaireResponseModel } from '../models/QuestionnaireResponse';
import { gamificationEngine } from '../services/gamificationEngine';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * Obtiene el estado de gamificación del usuario
 */
export const getGamificationState = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;

    const gamification = GamificationModel.findByUserId(userId) || GamificationModel.initialize(userId);

    const state = gamificationEngine.getGamificationState(
        gamification.totalPoints,
        gamification.badgesUnlocked,
        gamification.missionsCompleted
    );

    res.json({
        success: true,
        data: state,
    });
});

/**
 * Registra que el usuario vio sus resultados (desbloquea misión/insignia)
 */
export const markResultsViewed = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;

    const gamification = GamificationModel.findByUserId(userId) || GamificationModel.initialize(userId);
    const completedCategories = QuestionnaireResponseModel.getCompletedCategories(userId);

    // Verificar misión "view_results"
    const viewResultsMissionCompleted = gamificationEngine.checkMissionCompletion(
        'view_results',
        gamification.missionsCompleted,
        {
            viewedResults: true,
            completedQuestionnaires: completedCategories,
        }
    );

    if (viewResultsMissionCompleted) {
        GamificationModel.completeMission(userId, 'view_results');
        const points = gamificationEngine.getMissionPoints('view_results');
        GamificationModel.addPoints(userId, points);
    }

    // Verificar insignia "insight_seeker"
    const shouldUnlockBadge = gamificationEngine.checkBadgeUnlock(
        'insight_seeker',
        gamification.badgesUnlocked,
        {
            completedQuestionnaires: completedCategories,
        }
    );

    if (shouldUnlockBadge) {
        GamificationModel.unlockBadge(userId, 'insight_seeker');
    }

    // Actualizar nivel si es necesario
    const updatedGamification = GamificationModel.findByUserId(userId)!;
    const currentLevel = gamificationEngine.getCurrentLevel(updatedGamification.totalPoints);

    if (currentLevel.level !== updatedGamification.currentLevel) {
        GamificationModel.updateLevel(userId, currentLevel.level);
    }

    res.json({
        success: true,
        message: 'Resultados marcados como vistos',
    });
});

/**
 * Otorga puntos manualmente (para eventos especiales)
 */
export const awardPoints = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const { points, reason } = req.body;

    if (!points || points <= 0) {
        throw new Error('Puntos deben ser mayores a 0');
    }

    GamificationModel.addPoints(userId, points);

    // Actualizar nivel si es necesario
    const updatedGamification = GamificationModel.findByUserId(userId)!;
    const currentLevel = gamificationEngine.getCurrentLevel(updatedGamification.totalPoints);

    if (currentLevel.level !== updatedGamification.currentLevel) {
        GamificationModel.updateLevel(userId, currentLevel.level);
    }

    res.json({
        success: true,
        message: `${points} puntos otorgados${reason ? `: ${reason}` : ''}`,
        data: {
            totalPoints: updatedGamification.totalPoints,
            currentLevel: currentLevel.level,
        },
    });
});
