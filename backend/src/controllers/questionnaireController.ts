import { Response } from 'express';
import { QuestionnaireResponseModel } from '../models/QuestionnaireResponse';
import { GamificationModel } from '../models/Gamification';
import { gamificationEngine } from '../services/gamificationEngine';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import questionnaireData from '../data/questionnaires.json';

/**
 * Obtiene todos los cuestionarios disponibles
 */
export const getQuestionnaires = asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json({
        success: true,
        data: questionnaireData,
    });
});

/**
 * Obtiene un cuestionario específico por categoría
 */
export const getQuestionnaireByCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { category } = req.params;

    const categoryData = questionnaireData.categories.find(c => c.id === category);

    if (!categoryData) {
        throw new AppError('Categoría no encontrada', 404);
    }

    res.json({
        success: true,
        data: categoryData,
    });
});

/**
 * Envía respuestas de un cuestionario
 */
export const submitQuestionnaire = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const { category, responses } = req.body;

    if (!category || !responses || !Array.isArray(responses)) {
        throw new AppError('Categoría y respuestas son requeridas', 400);
    }

    // Eliminar respuestas anteriores de esta categoría (permitir re-tomar)
    QuestionnaireResponseModel.deleteByUserAndCategory(userId, category);

    // Crear nuevas respuestas
    const responseData = responses.map((r: any) => ({
        userId,
        category,
        questionId: r.questionId,
        answerValue: r.answerValue,
        riskWeight: r.riskWeight,
    }));

    QuestionnaireResponseModel.createMany(responseData);

    // Verificar si se completa alguna misión
    const completedCategories = QuestionnaireResponseModel.getCompletedCategories(userId);
    const gamification = GamificationModel.findByUserId(userId) || GamificationModel.initialize(userId);

    // Verificar misiones
    const missionIds = [`assess_${category}`, 'complete_profile'];
    missionIds.forEach(missionId => {
        const isCompleted = gamificationEngine.checkMissionCompletion(
            missionId,
            gamification.missionsCompleted,
            {
                hasProfile: true,
                completedQuestionnaires: completedCategories,
            }
        );

        if (isCompleted) {
            GamificationModel.completeMission(userId, missionId);
            const points = gamificationEngine.getMissionPoints(missionId);
            GamificationModel.addPoints(userId, points);
        }
    });

    // Verificar insignias
    const updatedGamification = GamificationModel.findByUserId(userId)!;
    const badgeIds = ['first_step', `${category}_conscious`, 'full_profile'];

    badgeIds.forEach(badgeId => {
        const shouldUnlock = gamificationEngine.checkBadgeUnlock(
            badgeId,
            updatedGamification.badgesUnlocked,
            {
                completedQuestionnaires: completedCategories,
                currentLevel: updatedGamification.currentLevel,
            }
        );

        if (shouldUnlock) {
            GamificationModel.unlockBadge(userId, badgeId);
        }
    });

    // Actualizar nivel si es necesario
    const finalGamification = GamificationModel.findByUserId(userId)!;
    const currentLevel = gamificationEngine.getCurrentLevel(finalGamification.totalPoints);

    if (currentLevel.level !== finalGamification.currentLevel) {
        GamificationModel.updateLevel(userId, currentLevel.level);
    }

    res.json({
        success: true,
        message: `Cuestionario de ${category} completado exitosamente`,
        data: {
            category,
            responsesCount: responses.length,
        },
    });
});

/**
 * Obtiene las respuestas del usuario
 */
export const getUserResponses = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;

    const responses = QuestionnaireResponseModel.findByUserId(userId);
    const completedCategories = QuestionnaireResponseModel.getCompletedCategories(userId);

    res.json({
        success: true,
        data: {
            responses,
            completedCategories,
        },
    });
});
