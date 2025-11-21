import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface QuestionnaireResponse {
    id: string;
    userId: string;
    category: string;
    questionId: string;
    answerValue: string;
    riskWeight: number;
    createdAt: number;
}

export interface CreateResponseData {
    userId: string;
    category: string;
    questionId: string;
    answerValue: string;
    riskWeight: number;
}

export class QuestionnaireResponseModel {
    /**
     * Crea una nueva respuesta
     */
    static create(data: CreateResponseData): QuestionnaireResponse {
        const id = uuidv4();
        const now = Date.now();

        const stmt = db.prepare(`
      INSERT INTO questionnaire_responses (id, user_id, category, question_id, answer_value, risk_weight, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            id,
            data.userId,
            data.category,
            data.questionId,
            data.answerValue,
            data.riskWeight,
            now
        );

        return this.findById(id)!;
    }

    /**
     * Crea múltiples respuestas en una transacción
     */
    static createMany(responses: CreateResponseData[]): QuestionnaireResponse[] {
        const insert = db.transaction((items: CreateResponseData[]) => {
            const results: QuestionnaireResponse[] = [];
            for (const item of items) {
                results.push(this.create(item));
            }
            return results;
        });

        return insert(responses);
    }

    /**
     * Busca una respuesta por ID
     */
    static findById(id: string): QuestionnaireResponse | null {
        const stmt = db.prepare('SELECT * FROM questionnaire_responses WHERE id = ?');
        const row = stmt.get(id) as any;

        if (!row) return null;

        return this.mapRowToResponse(row);
    }

    /**
     * Obtiene todas las respuestas de un usuario
     */
    static findByUserId(userId: string): QuestionnaireResponse[] {
        const stmt = db.prepare('SELECT * FROM questionnaire_responses WHERE user_id = ? ORDER BY created_at DESC');
        const rows = stmt.all(userId) as any[];

        return rows.map(row => this.mapRowToResponse(row));
    }

    /**
     * Obtiene respuestas por categoría
     */
    static findByUserAndCategory(userId: string, category: string): QuestionnaireResponse[] {
        const stmt = db.prepare(`
      SELECT * FROM questionnaire_responses 
      WHERE user_id = ? AND category = ? 
      ORDER BY created_at DESC
    `);
        const rows = stmt.all(userId, category) as any[];

        return rows.map(row => this.mapRowToResponse(row));
    }

    /**
     * Obtiene categorías completadas por un usuario
     */
    static getCompletedCategories(userId: string): string[] {
        const stmt = db.prepare(`
      SELECT DISTINCT category 
      FROM questionnaire_responses 
      WHERE user_id = ?
    `);
        const rows = stmt.all(userId) as any[];

        return rows.map(row => row.category);
    }

    /**
     * Elimina las respuestas de un usuario para una categoría específica
     */
    static deleteByUserAndCategory(userId: string, category: string): void {
        const stmt = db.prepare('DELETE FROM questionnaire_responses WHERE user_id = ? AND category = ?');
        stmt.run(userId, category);
    }

    /**
     * Mapea una fila de DB a objeto QuestionnaireResponse
     */
    private static mapRowToResponse(row: any): QuestionnaireResponse {
        return {
            id: row.id,
            userId: row.user_id,
            category: row.category,
            questionId: row.question_id,
            answerValue: row.answer_value,
            riskWeight: row.risk_weight,
            createdAt: row.created_at,
        };
    }
}
