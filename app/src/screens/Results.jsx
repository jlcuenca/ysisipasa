import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import ScoreGauge from '../components/Results/ScoreGauge';
import GamificationPanel from '../components/Gamification/GamificationPanel';
import './Results.css';

function Results() {
    const [riskData, setRiskData] = useState(null);
    const [gamification, setGamification] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        try {
            const [riskResponse, gamificationResponse] = await Promise.all([
                api.get('/risk/calculate'),
                api.get('/gamification/state'),
            ]);

            setRiskData(riskResponse.data);
            setGamification(gamificationResponse.data);

            // Marcar que vio resultados (para desbloquear misión/badges)
            await api.post('/gamification/viewed-results');

            setLoading(false);
        } catch (error) {
            console.error('Error loading results:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="results-screen">
                <div className="container">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (!riskData) {
        return (
            <div className="results-screen">
                <div className="container">
                    <div className="empty-state">
                        <h2>No hay resultados todavía</h2>
                        <p>Completa al menos un cuestionario para ver tu nivel de riesgo.</p>
                        <a href="/questionnaire" className="btn btn-primary">
                            Comenzar evaluación
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    const getRiskLevelText = (level) => {
        switch (level) {
            case 'low':
                return { text: 'Bajo', color: 'var(--color-success)' };
            case 'medium':
                return { text: 'Moderado', color: 'var(--color-warning)' };
            case 'high':
                return { text: 'Alto', color: 'var(--color-danger)' };
            default:
                return { text: 'Desconocido', color: 'var(--color-text-muted)' };
        }
    };

    const levelInfo = getRiskLevelText(riskData.level);

    return (
        <div className="results-screen">
            <div className="container">
                <motion.div
                    className="results-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Header */}
                    <div className="results-header">
                        <h1>Tus Resultados</h1>
                        <p className="subtitle">Índice "¿Y si sí pasa?"</p>
                    </div>

                    {/* Score Section */}
                    <div className="score-section">
                        <ScoreGauge score={riskData.overallScore} level={riskData.level} />

                        <div className="score-info">
                            <h2>Nivel de riesgo: <span style={{ color: levelInfo.color }}>{levelInfo.text}</span></h2>
                            <p className="score-description">
                                {riskData.overallScore < 40 && '¡Excelente! Estás bien protegido.'}
                                {riskData.overallScore >= 40 && riskData.overallScore < 70 && 'Hay espacio para mejorar tu protección.'}
                                {riskData.overallScore >= 70 && '⚠️ Es momento de tomar acción para reducir tu riesgo.'}
                            </p>
                        </div>
                    </div>

                    {/* Categories Breakdown */}
                    <div className="categories-breakdown">
                        <h3>Desglose por categoría</h3>
                        <div className="categories-grid">
                            {riskData.categories.map((cat, index) => (
                                <motion.div
                                    key={cat.category}
                                    className="category-result-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="category-header">
                                        <h4>{getCategoryName(cat.category)}</h4>
                                        <span className="category-score">{cat.score.toFixed(1)}</span>
                                    </div>
                                    <div className="category-bar">
                                        <motion.div
                                            className="category-bar-fill"
                                            style={{
                                                backgroundColor: getScoreColor(cat.score),
                                            }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${cat.score}%` }}
                                            transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                                        />
                                    </div>
                                    <div className="category-details">
                                        <div className="detail-item">
                                            <span className="text-muted">Probabilidad:</span>
                                            <span>{cat.probability.toFixed(0)}%</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="text-muted">Impacto:</span>
                                            <span>{cat.impact.toFixed(0)}%</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="text-muted">Aseguramiento:</span>
                                            <span>{cat.insuranceLevel.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Insights */}
                    <div className="insights-section">
                        <h3>Insights personalizados</h3>
                        <div className="insights-list">
                            {riskData.insights.map((insight, index) => (
                                <motion.div
                                    key={index}
                                    className="insight-card"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <p>{insight}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Gamification */}
                    {gamification && <GamificationPanel data={gamification} />}

                    {/* Actions */}
                    <div className="results-actions">
                        <a href="/questionnaire" className="btn btn-primary btn-lg">
                            Evaluar otra categoría
                        </a>
                        <button className="btn btn-secondary btn-lg">
                            Hablar con un asesor 💬
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function getCategoryName(category) {
    const names = {
        health: 'Salud',
        financial: 'Finanzas',
        auto: 'Auto',
        home: 'Hogar',
        insurance: 'Aseguramiento',
    };
    return names[category] || category;
}

function getScoreColor(score) {
    if (score < 40) return 'var(--color-success)';
    if (score < 70) return 'var(--color-warning)';
    return 'var(--color-danger)';
}

export default Results;
