import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { initializeDatabase, closeDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth.routes';
import questionnaireRoutes from './routes/questionnaire.routes';
import riskRoutes from './routes/risk.routes';
import gamificationRoutes from './routes/gamification.routes';

const app = express();

// Middlewares
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '¿Y si sí pasa? API funcionando 🚀',
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/questionnaires', questionnaireRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/gamification', gamificationRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
    });
});

// Error Handler (debe ser el último middleware)
app.use(errorHandler);

// Inicializar base de datos
initializeDatabase();

// Manejo de cierre gracioso
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    closeDatabase();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Cerrando servidor...');
    closeDatabase();
    process.exit(0);
});

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`\n✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 Entorno: ${config.nodeEnv}`);
    console.log(`🎮 ¿Y si sí pasa? - Backend activo\n`);
});

export default app;
