export interface Level {
    level: number;
    name: string;
    minPoints: number;
    icon: string;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt?: number;
}

export interface Mission {
    id: string;
    name: string;
    description: string;
    points: number;
    completed: boolean;
    completedAt?: number;
}

export interface GamificationState {
    totalPoints: number;
    currentLevel: Level;
    nextLevel: Level | null;
    progressToNextLevel: number;
    badges: Badge[];
    missions: Mission[];
}

/**
 * Motor de gamificación para gestionar niveles, insignias y misiones
 */
export class GamificationEngine {
    private levels: Level[] = [
        { level: 1, name: 'Despistado', minPoints: 0, icon: '🤷' },
        { level: 2, name: 'Curioso', minPoints: 100, icon: '🤔' },
        { level: 3, name: 'Consciente', minPoints: 300, icon: '💡' },
        { level: 4, name: 'Prevenido', minPoints: 600, icon: '🛡️' },
        { level: 5, name: 'Asegurado', minPoints: 1000, icon: '✅' },
        { level: 6, name: 'Blindado', minPoints: 1500, icon: '🏆' },
    ];

    private badgeDefinitions: Omit<Badge, 'unlockedAt'>[] = [
        {
            id: 'first_step',
            name: 'Primer Paso',
            description: 'Completaste tu primer cuestionario',
            icon: '👣',
        },
        {
            id: 'risk_aware',
            name: 'Descubridor de Riesgos',
            description: 'Identificaste 5 riesgos personales',
            icon: '🔍',
        },
        {
            id: 'health_conscious',
            name: 'Consciente de Salud',
            description: 'Completaste el cuestionario de salud',
            icon: '❤️',
        },
        {
            id: 'finance_guru',
            name: 'Maestro del Ahorro',
            description: 'Completaste el cuestionario financiero',
            icon: '💰',
        },
        {
            id: 'full_profile',
            name: 'Perfil Completo',
            description: 'Completaste todos los cuestionarios',
            icon: '📋',
        },
        {
            id: 'insight_seeker',
            name: 'Buscador de Insights',
            description: 'Revisaste tus resultados completamente',
            icon: '💡',
        },
        {
            id: 'level_3',
            name: 'Consciente Nivel 3',
            description: 'Alcanzaste el nivel 3',
            icon: '⭐',
        },
        {
            id: 'level_5',
            name: 'Asegurado Nivel 5',
            description: 'Alcanzaste el nivel 5',
            icon: '🌟',
        },
        {
            id: 'max_level',
            name: 'Blindado Total',
            description: 'Alcanzaste el nivel máximo',
            icon: '👑',
        },
        {
            id: 'shared_results',
            name: 'Compartidor',
            description: 'Compartiste tus resultados con un asesor',
            icon: '🤝',
        },
    ];

    private missionDefinitions: Omit<Mission, 'completed' | 'completedAt'>[] = [
        {
            id: 'complete_profile',
            name: 'Completa tu perfil',
            description: 'Crea una cuenta o continúa como anónimo',
            points: 50,
        },
        {
            id: 'assess_health',
            name: 'Evalúa tus riesgos de salud',
            description: 'Completa el cuestionario de salud',
            points: 100,
        },
        {
            id: 'assess_financial',
            name: 'Evalúa tus finanzas',
            description: 'Completa el cuestionario financiero',
            points: 100,
        },
        {
            id: 'assess_auto',
            name: 'Evalúa tu auto',
            description: 'Completa el cuestionario de auto',
            points: 80,
        },
        {
            id: 'assess_home',
            name: 'Evalúa tu hogar',
            description: 'Completa el cuestionario de hogar',
            points: 80,
        },
        {
            id: 'view_results',
            name: 'Revisa tus resultados',
            description: 'Ve tu dashboard de riesgos completo',
            points: 50,
        },
        {
            id: 'reach_level_3',
            name: 'Alcanza el nivel 3',
            description: 'Sube al nivel Consciente',
            points: 150,
        },
        {
            id: 'unlock_5_badges',
            name: 'Coleccionista',
            description: 'Desbloquea 5 insignias diferentes',
            points: 200,
        },
    ];

    /**
     * Calcula el nivel actual basado en puntos
     */
    getCurrentLevel(points: number): Level {
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (points >= this.levels[i].minPoints) {
                return this.levels[i];
            }
        }
        return this.levels[0];
    }

    /**
     * Obtiene el siguiente nivel
     */
    getNextLevel(currentLevel: Level): Level | null {
        const currentIndex = this.levels.findIndex(l => l.level === currentLevel.level);
        if (currentIndex === -1 || currentIndex === this.levels.length - 1) {
            return null; // Ya está en el nivel máximo
        }
        return this.levels[currentIndex + 1];
    }

    /**
     * Calcula el progreso hacia el siguiente nivel (0-100)
     */
    calculateProgressToNextLevel(points: number, currentLevel: Level, nextLevel: Level | null): number {
        if (!nextLevel) {
            return 100; // Ya está al máximo
        }

        const currentLevelMin = currentLevel.minPoints;
        const nextLevelMin = nextLevel.minPoints;
        const range = nextLevelMin - currentLevelMin;
        const progress = points - currentLevelMin;

        return Math.min(100, Math.round((progress / range) * 100));
    }

    /**
     * Verifica si se debe desbloquear una insignia
     */
    checkBadgeUnlock(
        badgeId: string,
        userBadges: string[],
        context: {
            completedQuestionnaires?: string[];
            totalRisks?: number;
            currentLevel?: number;
            totalBadges?: number;
            sharedResults?: boolean;
        }
    ): boolean {
        // Ya tiene la insignia
        if (userBadges.includes(badgeId)) {
            return false;
        }

        // Lógica de desbloqueo por insignia
        switch (badgeId) {
            case 'first_step':
                return (context.completedQuestionnaires?.length || 0) >= 1;

            case 'risk_aware':
                return (context.totalRisks || 0) >= 5;

            case 'health_conscious':
                return context.completedQuestionnaires?.includes('health') || false;

            case 'finance_guru':
                return context.completedQuestionnaires?.includes('financial') || false;

            case 'full_profile':
                return (context.completedQuestionnaires?.length || 0) >= 4;

            case 'insight_seeker':
                return true; // Se desbloquea al ver resultados

            case 'level_3':
                return (context.currentLevel || 0) >= 3;

            case 'level_5':
                return (context.currentLevel || 0) >= 5;

            case 'max_level':
                return (context.currentLevel || 0) >= 6;

            case 'shared_results':
                return context.sharedResults || false;

            default:
                return false;
        }
    }

    /**
     * Obtiene todas las insignias desbloqueadas
     */
    getUnlockedBadges(unlockedBadgeIds: string[]): Badge[] {
        return this.badgeDefinitions
            .filter(badge => unlockedBadgeIds.includes(badge.id))
            .map(badge => ({
                ...badge,
                unlockedAt: Date.now(), // En producción, esto vendría de la DB
            }));
    }

    /**
     * Obtiene todas las misiones con su estado
     */
    getMissions(completedMissionIds: string[]): Mission[] {
        return this.missionDefinitions.map(mission => ({
            ...mission,
            completed: completedMissionIds.includes(mission.id),
            completedAt: completedMissionIds.includes(mission.id) ? Date.now() : undefined,
        }));
    }

    /**
     * Verifica si una misión está completa
     */
    checkMissionCompletion(
        missionId: string,
        completedMissions: string[],
        context: {
            hasProfile?: boolean;
            completedQuestionnaires?: string[];
            viewedResults?: boolean;
            currentLevel?: number;
            totalBadges?: number;
        }
    ): boolean {
        // Ya completó la misión
        if (completedMissions.includes(missionId)) {
            return false; // No dar puntos de nuevo
        }

        // Lógica de completación por misión
        switch (missionId) {
            case 'complete_profile':
                return context.hasProfile || false;

            case 'assess_health':
                return context.completedQuestionnaires?.includes('health') || false;

            case 'assess_financial':
                return context.completedQuestionnaires?.includes('financial') || false;

            case 'assess_auto':
                return context.completedQuestionnaires?.includes('auto') || false;

            case 'assess_home':
                return context.completedQuestionnaires?.includes('home') || false;

            case 'view_results':
                return context.viewedResults || false;

            case 'reach_level_3':
                return (context.currentLevel || 0) >= 3;

            case 'unlock_5_badges':
                return (context.totalBadges || 0) >= 5;

            default:
                return false;
        }
    }

    /**
     * Calcula puntos por completar una misión
     */
    getMissionPoints(missionId: string): number {
        const mission = this.missionDefinitions.find(m => m.id === missionId);
        return mission?.points || 0;
    }

    /**
     * Obtiene el estado completo de gamificación de un usuario
     */
    getGamificationState(
        totalPoints: number,
        unlockedBadges: string[],
        completedMissions: string[]
    ): GamificationState {
        const currentLevel = this.getCurrentLevel(totalPoints);
        const nextLevel = this.getNextLevel(currentLevel);
        const progressToNextLevel = this.calculateProgressToNextLevel(totalPoints, currentLevel, nextLevel);

        return {
            totalPoints,
            currentLevel,
            nextLevel,
            progressToNextLevel,
            badges: this.getUnlockedBadges(unlockedBadges),
            missions: this.getMissions(completedMissions),
        };
    }
}

// Exportar instancia singleton
export const gamificationEngine = new GamificationEngine();
