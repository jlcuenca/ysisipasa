import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
    userId?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No autenticado. Por favor inicia sesión.', 401);
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };

        req.userId = decoded.userId;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new AppError('Token inválido. Por favor inicia sesión de nuevo.', 401));
        }
        next(error);
    }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
            req.userId = decoded.userId;
        }

        next();
    } catch (error) {
        // Si hay error, simplemente continuar sin userId
        next();
    }
};
