import { motion } from 'framer-motion';
import './GamificationPanel.css';

function GamificationPanel({ data }) {
    const { currentLevel, nextLevel, progressToNextLevel, badges, missions, totalPoints } = data;

    return (
        <div className="gamification-panel">
            <h3>Tu Progreso</h3>

            {/* Level Section */}
            <div className="level-section">
                <div className="level-info">
                    <div className="level-badge">
                        <span className="level-icon">{currentLevel.icon}</span>
                        <div>
                            <span className="level-name">{currentLevel.name}</span>
                            <span className="level-points">{totalPoints} puntos</span>
                        </div>
                    </div>

                    {nextLevel && (
                        <div className="next-level">
                            <span className="text-muted">Siguiente:</span>
                            <span>{nextLevel.name} {nextLevel.icon}</span>
                        </div>
                    )}
                </div>

                {nextLevel && (
                    <div className="level-progress">
                        <div className="progress-bar">
                            <motion.div
                                className="progress-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressToNextLevel}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                        </div>
                        <span className="progress-text">{progressToNextLevel}%</span>
                    </div>
                )}
            </div>

            {/* Badges Section */}
            {badges.length > 0 && (
                <div className="badges-section">
                    <h4>Insignias desbloqueadas</h4>
                    <div className="badges-grid">
                        {badges.map((badge) => (
                            <motion.div
                                key={badge.id}
                                className="badge-item"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.1 }}
                            >
                                <span className="badge-icon">{badge.icon}</span>
                                <span className="badge-name">{badge.name}</span>
                                <span className="badge-description">{badge.description}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Missions Section */}
            <div className="missions-section">
                <h4>Misiones</h4>
                <div className="missions-list">
                    {missions.slice(0, 5).map((mission) => (
                        <div key={mission.id} className={`mission-item ${mission.completed ? 'completed' : ''}`}>
                            <div className="mission-info">
                                <span className="mission-icon">{mission.completed ? '✅' : '⭕'}</span>
                                <div>
                                    <span className="mission-name">{mission.name}</span>
                                    <span className="mission-description">{mission.description}</span>
                                </div>
                            </div>
                            <span className="mission-points">+{mission.points}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default GamificationPanel;
