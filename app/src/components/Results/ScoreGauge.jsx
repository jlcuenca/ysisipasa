import { motion } from 'framer-motion';
import './ScoreGauge.css';

function ScoreGauge({ score, level }) {
    // Calculate rotation for needle (0-100 maps to -90deg to 90deg)
    const rotation = -90 + (score / 100) * 180;

    const getColor = () => {
        if (score < 40) return 'var(--color-success)';
        if (score < 70) return 'var(--color-warning)';
        return 'var(--color-danger)';
    };

    return (
        <div className="score-gauge">
            <svg viewBox="0 0 200 120" className="gauge-svg">
                {/* Background Arc */}
                <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="var(--color-surface-elevated)"
                    strokeWidth="20"
                    strokeLinecap="round"
                />

                {/* Colored Arc */}
                <motion.path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke={getColor()}
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (score / 100) * 251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (score / 100) * 251.2 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                />

                {/* Needle */}
                <motion.g
                    initial={{ rotate: -90 }}
                    animate={{ rotate: rotation }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{ transformOrigin: '100px 100px' }}
                >
                    <line
                        x1="100"
                        y1="100"
                        x2="100"
                        y2="40"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                    <circle cx="100" cy="100" r="6" fill="white" />
                </motion.g>
            </svg>

            <div className="gauge-score">
                <motion.span
                    className="score-value"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    {score.toFixed(1)}
                </motion.span>
                <span className="score-label">/ 100</span>
            </div>
        </div>
    );
}

export default ScoreGauge;
