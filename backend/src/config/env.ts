import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
    dbPath: process.env.DB_PATH || './database.sqlite',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

// Validación de configuración crítica
if (config.nodeEnv === 'production' && config.jwtSecret === 'your-secret-key-change-this-in-production') {
    console.error('⚠️  ERROR: JWT_SECRET debe ser configurado en producción');
    process.exit(1);
}
