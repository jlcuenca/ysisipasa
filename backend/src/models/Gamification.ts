import { db } from '../config/database';

export interface UserGamification {
    userId: string;
    totalPoints: number;
    currentLevel: number;
    badgesUnlocked: string[];
    missionsCompleted: string[];
    createdAt: number;
    updatedAt: number;
}

export class GamificationModel {
    /**
     * Crea o inicializa la gamificación de un usuario
     */
    static initialize(userId: string): UserGamification {
        const now = Date.now();

        const stmt = db.prepare(`
      INSERT INTO user_gamification (user_id, total_points, current_level, badges_unlocked, missions_completed, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO NOTHING
    `);

        stmt.run(userId, 0, 1, '[]', '[]', now, now);

        return this.findByUserId(userId)!;
    }

    /**
     * Obtiene la gamificación de un usuario
     */
    static findByUserId(userId: string): UserGamification | null {
        const stmt = db.prepare('SELECT * FROM user_gamification WHERE user_id = ?');
        const row = stmt.get(userId) as any;

        if (!row) return null;

        return this.mapRowToGamification(row);
    }

    /**
     * Agrega puntos a un usuario
     */
    static addPoints(userId: string, points: number): UserGamification {
        const current = this.findByUserId(userId) || this.initialize(userId);
        const newTotal = current.totalPoints + points;

        const stmt = db.prepare(`
      UPDATE user_gamification 
      SET total_points = ?, updated_at = ?
      WHERE user_id = ?
    `);

        stmt.run(newTotal, Date.now(), userId);

        return this.findByUserId(userId)!;
    }

    /**
     * Actualiza el nivel del usuario
     */
    static updateLevel(userId: string, level: number): UserGamification {
        const stmt = db.prepare(`
      UPDATE user_gamification 
      SET current_level = ?, updated_at = ?
      WHERE user_id = ?
    `);

        stmt.run(level, Date.now(), userId);

        return this.findByUserId(userId)!;
    }

    /**
     * Desbloquea una insignia
     */
    static unlockBadge(userId: string, badgeId: string): UserGamification {
        const current = this.findByUserId(userId) || this.initialize(userId);

        if (current.badgesUnlocked.includes(badgeId)) {
            return current; // Ya desbloqueada
        }

        const newBadges = [...current.badgesUnlocked, badgeId];

        const stmt = db.prepare(`
      UPDATE user_gamification 
      SET badges_unlocked = ?, updated_at = ?
      WHERE user_id = ?
    `);

        stmt.run(JSON.stringify(newBadges), Date.now(), userId);

        return this.findByUserId(userId)!;
    }

    /**
     * Completa una misión
     */
    static completeMission(userId: string, missionId: string): UserGamification {
        const current = this.findByUserId(userId) || this.initialize(userId);

        if (current.missionsCompleted.includes(missionId)) {
            return current; // Ya completada
        }

        const newMissions = [...current.missionsCompleted, missionId];

        const stmt = db.prepare(`
      UPDATE user_gamification 
      SET missions_completed = ?, updated_at = ?
      WHERE user_id = ?
    `);

        stmt.run(JSON.stringify(newMissions), Date.now(), userId);

        return this.findByUserId(userId)!;
    }

    /**
     * Mapea una fila de DB a objeto UserGamification
     */
    private static mapRowToGamification(row: any): UserGamification {
        return {
            userId: row.user_id,
            totalPoints: row.total_points,
            currentLevel: row.current_level,
            badgesUnlocked: JSON.parse(row.badges_unlocked || '[]'),
            missionsCompleted: JSON.parse(row.missions_completed || '[]'),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
