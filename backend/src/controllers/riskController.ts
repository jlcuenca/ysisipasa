import { Response } from 'express';
import { QuestionnaireResponseModel } from '../models/QuestionnaireResponse';
import { riskCalculator } from '../services/riskCalculator';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * Calcula el índice de riesgo del usuario
 */
export const calculateRisk = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;

    // Obtener todas las respuestas del usuario
    const responses = QuestionnaireResponseModel.findByUserId(userId);

    if (responses.length === 0) {
        throw new AppError('No hay respuestas para calcular el riesgo. Completa al menos un cuestionario.', 400);
    }

    // Convertir a formato para el calculador
    const answers = responses.map(r => ({
        questionId: r.questionId,
        category: r.category,
        value: r.answerValue,
        riskWeight: r.riskWeight,
    }));

    // Calcular riesgo
    const riskResult = riskCalculator.calculateRiskScore(answers);

    res.json({
        success: true,
        data: riskResult,
    });
});

/**
 * Obtiene el score de riesgo por categoría
 */
export const getRiskByCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const { category } = req.params;

    // Obtener respuestas de la categoría
    const responses = QuestionnaireResponseModel.findByUserAndCategory(userId, category);

    if (responses.length === 0) {
        throw new AppError(`No hay respuestas para la categoría ${category}`, 400);
    }

    // Convertir a formato para el calculador
    const answers = responses.map(r => ({
        questionId: r.questionId,
        category: r.category,
        value: r.answerValue,
        riskWeight: r.riskWeight,
    }));

    // Calcular riesgo solo para esta categoría
    const riskResult = riskCalculator.calculateRiskScore(answers);
    const categoryRisk = riskResult.categories.find(c => c.category === category);

    res.json({
        success: true,
        data: categoryRisk,
    });
});
