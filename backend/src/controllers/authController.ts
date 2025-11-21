import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { GamificationModel } from '../models/Gamification';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { config } from '../config/env';

/**
 * Registra un nuevo usuario
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name, isAnonymous } = req.body;

    // Si es anónimo, no requiere email ni password
    if (!isAnonymous && (!email || !password)) {
        throw new AppError('Email y contraseña son requeridos para cuentas no anónimas', 400);
    }

    //  Verificar si el email ya existe
    if (email) {
        const existingUser = UserModel.findByEmail(email);
        if (existingUser) {
            throw new AppError('Ya existe una cuenta con este email', 400);
        }
    }

    // Crear usuario
    const user = await UserModel.create({
        email,
        password,
        name,
        isAnonymous: isAnonymous || false,
    });

    // Inicializar gamificación
    GamificationModel.initialize(user.id);

    // Generar token
    const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
        expiresIn: '30d',
    });

    res.status(201).json({
        success: true,
        data: {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isAnonymous: user.isAnonymous,
            },
            token,
        },
    });
});

/**
 * Inicia sesión
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError('Email y contraseña son requeridos', 400);
    }

    // Buscar usuario
    const user = UserModel.findByEmail(email);
    if (!user) {
        throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar contraseña
    const isPasswordValid = await UserModel.verifyPassword(user, password);
    if (!isPasswordValid) {
        throw new AppError('Credenciales inválidas', 401);
    }

    // Generar token
    const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
        expiresIn: '30d',
    });

    res.json({
        success: true,
        data: {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isAnonymous: user.isAnonymous,
            },
            token,
        },
    });
});

/**
 * Obtiene el perfil del usuario actual
 */
export const getProfile = asyncHandler(async (req: any, res: Response) => {
    const userId = req.userId;

    const user = UserModel.findById(userId);
    if (!user) {
        throw new AppError('Usuario no encontrado', 404);
    }

    res.json({
        success: true,
        data: {
            id: user.id,
            email: user.email,
            name: user.name,
            isAnonymous: user.isAnonymous,
            createdAt: user.createdAt,
        },
    });
});
