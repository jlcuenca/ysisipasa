import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export interface User {
    id: string;
    email: string | null;
    passwordHash: string | null;
    name: string | null;
    isAnonymous: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface CreateUserData {
    email?: string;
    password?: string;
    name?: string;
    isAnonymous?: boolean;
}

export class UserModel {
    /**
     * Crea un nuevo usuario
     */
    static async create(data: CreateUserData): Promise<User> {
        const id = uuidv4();
        const now = Date.now();

        let passwordHash = null;
        if (data.password) {
            passwordHash = await bcrypt.hash(data.password, 10);
        }

        const stmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, name, is_anonymous, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            id,
            data.email || null,
            passwordHash,
            data.name || null,
            data.isAnonymous ? 1 : 0,
            now,
            now
        );

        return this.findById(id)!;
    }

    /**
     * Busca un usuario por ID
     */
    static findById(id: string): User | null {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        const row = stmt.get(id) as any;

        if (!row) return null;

        return this.mapRowToUser(row);
    }

    /**
     * Busca un usuario por email
     */
    static findByEmail(email: string): User | null {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        const row = stmt.get(email) as any;

        if (!row) return null;

        return this.mapRowToUser(row);
    }

    /**
     * Verifica la contraseña de un usuario
     */
    static async verifyPassword(user: User, password: string): Promise<boolean> {
        if (!user.passwordHash) return false;
        return bcrypt.compare(password, user.passwordHash);
    }

    /**
     * Actualiza un usuario
     */
    static update(id: string, data: Partial<CreateUserData>): User | null {
        const updates: string[] = [];
        const values: any[] = [];

        if (data.name !== undefined) {
            updates.push('name = ?');
            values.push(data.name);
        }

        if (data.email !== undefined) {
            updates.push('email = ?');
            values.push(data.email);
        }

        updates.push('updated_at = ?');
        values.push(Date.now());

        values.push(id);

        const stmt = db.prepare(`
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

        stmt.run(...values);

        return this.findById(id);
    }

    /**
     * Mapea una fila de DB a objeto User
     */
    private static mapRowToUser(row: any): User {
        return {
            id: row.id,
            email: row.email,
            passwordHash: row.password_hash,
            name: row.name,
            isAnonymous: row.is_anonymous === 1,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
