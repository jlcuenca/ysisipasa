export interface RiskCategory {
    category: string;
    score: number;
    weight: number;
    impact: number;
    probability: number;
    vulnerability: number;
    insuranceLevel: number;
}

export interface RiskCalculationResult {
    overallScore: number;
    level: 'low' | 'medium' | 'high';
    categories: RiskCategory[];
    insights: string[];
}

export interface QuestionnaireAnswer {
    questionId: string;
    category: string;
    value: string;
    riskWeight: number;
    impactWeight?: number;
}

/**
 * Calcula el índice "¿Y si sí pasa?" basado en las respuestas del usuario
 * 
 * Fórmula: Score = (Probabilidad * 0.3 + Impacto * 0.4 + Vulnerabilidad * 0.2) - (NivelAseguramiento * 0.1)
 */
export class RiskCalculator {
    private readonly WEIGHTS = {
        probability: 0.3,
        impact: 0.4,
        vulnerability: 0.2,
        insurance: 0.1,
    };

    /**
     * Calcula el score de riesgo total
     */
    calculateRiskScore(answers: QuestionnaireAnswer[]): RiskCalculationResult {
        // Agrupar respuestas por categoría
        const categoriesMap = this.groupByCategory(answers);

        // Calcular score por categoría
        const categories: RiskCategory[] = Object.keys(categoriesMap).map(category => {
            const categoryAnswers = categoriesMap[category];
            return this.calculateCategoryScore(category, categoryAnswers);
        });

        // Calcular score general (promedio ponderado)
        const overallScore = this.calculateOverallScore(categories);

        // Determinar nivel de riesgo
        const level = this.getRiskLevel(overallScore);

        // Generar insights
        const insights = this.generateInsights(categories, overallScore);

        return {
            overallScore: Math.round(overallScore * 10) / 10, // Redondear a 1 decimal
            level,
            categories,
            insights,
        };
    }

    /**
     * Agrupa respuestas por categoría
     */
    private groupByCategory(answers: QuestionnaireAnswer[]): Record<string, QuestionnaireAnswer[]> {
        return answers.reduce((acc, answer) => {
            if (!acc[answer.category]) {
                acc[answer.category] = [];
            }
            acc[answer.category].push(answer);
            return acc;
        }, {} as Record<string, QuestionnaireAnswer[]>);
    }

    /**
     * Calcula el score de una categoría específica
     */
    private calculateCategoryScore(category: string, answers: QuestionnaireAnswer[]): RiskCategory {
        // Calcular componentes
        const probability = this.calculateProbability(answers);
        const impact = this.calculateImpact(answers);
        const vulnerability = this.calculateVulnerability(answers);
        const insuranceLevel = this.calculateInsuranceLevel(answers);

        // Aplicar fórmula ponderada
        const rawScore = (
            probability * this.WEIGHTS.probability +
            impact * this.WEIGHTS.impact +
            vulnerability * this.WEIGHTS.vulnerability
        ) - (insuranceLevel * this.WEIGHTS.insurance);

        // Normalizar a escala 0-100
        const score = Math.max(0, Math.min(100, rawScore));

        return {
            category,
            score: Math.round(score * 10) / 10,
            weight: this.getCategoryWeight(category),
            impact,
            probability,
            vulnerability,
            insuranceLevel,
        };
    }

    /**
     * Calcula la probabilidad de riesgo (0-100)
     */
    private calculateProbability(answers: QuestionnaireAnswer[]): number {
        const avgRiskWeight = answers.reduce((sum, a) => sum + a.riskWeight, 0) / answers.length;
        return avgRiskWeight * 100;
    }

    /**
     * Calcula el impacto económico potencial (0-100)
     */
    private calculateImpact(answers: QuestionnaireAnswer[]): number {
        // Si hay impactWeight específico, usarlo; si no, usar riskWeight
        const avgImpact = answers.reduce((sum, a) => {
            const weight = a.impactWeight !== undefined ? a.impactWeight : a.riskWeight;
            return sum + weight;
        }, 0) / answers.length;

        return avgImpact * 100;
    }

    /**
     * Calcula la vulnerabilidad personal (0-100)
     */
    private calculateVulnerability(answers: QuestionnaireAnswer[]): number {
        // Vulnerabilidad se basa en factores de protección
        const protectionFactors = answers.filter(a => a.riskWeight < 0.5).length;
        const totalAnswers = answers.length;

        // Menos factores de protección = mayor vulnerabilidad
        return ((totalAnswers - protectionFactors) / totalAnswers) * 100;
    }

    /**
     * Calcula el nivel de aseguramiento actual (0-100)
     */
    private calculateInsuranceLevel(answers: QuestionnaireAnswer[]): number {
        // Buscar respuestas relacionadas con seguros
        const insuranceAnswers = answers.filter(a =>
            a.questionId.includes('insurance') || a.questionId.includes('policy')
        );

        if (insuranceAnswers.length === 0) {
            return 0; // Sin seguros
        }

        // Promedio de nivel de aseguramiento (invertir riskWeight)
        const avgCoverage = insuranceAnswers.reduce((sum, a) => sum + (1 - a.riskWeight), 0) / insuranceAnswers.length;
        return avgCoverage * 100;
    }

    /**
     * Obtiene el peso de una categoría en el cálculo general
     */
    private getCategoryWeight(category: string): number {
        const weights: Record<string, number> = {
            health: 0.25,
            financial: 0.30,
            auto: 0.15,
            home: 0.20,
            insurance: 0.10,
        };

        return weights[category] || 0.2;
    }

    /**
     * Calcula el score general ponderado
     */
    private calculateOverallScore(categories: RiskCategory[]): number {
        const totalWeight = categories.reduce((sum, c) => sum + c.weight, 0);
        const weightedScore = categories.reduce((sum, c) => sum + (c.score * c.weight), 0);

        return weightedScore / totalWeight;
    }

    /**
     * Determina el nivel de riesgo basado en el score
     */
    private getRiskLevel(score: number): 'low' | 'medium' | 'high' {
        if (score < 40) return 'low';
        if (score < 70) return 'medium';
        return 'high';
    }

    /**
     * Genera insights personalizados basados en el perfil de riesgo
     */
    private generateInsights(categories: RiskCategory[], overallScore: number): string[] {
        const insights: string[] = [];

        // Insight general
        if (overallScore > 70) {
            insights.push('Tu nivel de riesgo es alto. Es momento de tomar acción para proteger tu patrimonio.');
        } else if (overallScore > 40) {
            insights.push('Tienes un nivel de riesgo moderado. Algunas mejoras pueden hacer una gran diferencia.');
        } else {
            insights.push('¡Buen trabajo! Tu nivel de riesgo es bajo, pero siempre hay espacio para mejorar.');
        }

        // Insights por categoría
        categories.forEach(cat => {
            if (cat.score > 70) {
                insights.push(`⚠️ Tu riesgo en ${this.getCategoryName(cat.category)} es alto.`);
            }

            if (cat.insuranceLevel < 30) {
                insights.push(`🛡️ Considera mejorar tu aseguramiento en ${this.getCategoryName(cat.category)}.`);
            }
        });

        // Insight sobre vulnerabilidad
        const avgVulnerability = categories.reduce((sum, c) => sum + c.vulnerability, 0) / categories.length;
        if (avgVulnerability > 70) {
            insights.push('Tu vulnerabilidad es alta. Un evento inesperado podría tener un gran impacto.');
        }

        return insights;
    }

    /**
     * Obtiene el nombre legible de una categoría
     */
    private getCategoryName(category: string): string {
        const names: Record<string, string> = {
            health: 'Salud',
            financial: 'Finanzas',
            auto: 'Auto',
            home: 'Hogar',
            insurance: 'Aseguramiento',
        };

        return names[category] || category;
    }
}

// Exportar instancia singleton
export const riskCalculator = new RiskCalculator();
