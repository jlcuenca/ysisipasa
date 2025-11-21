import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../services/authService';
import './Welcome.css';

function Welcome({ onUserSet }) {
    const navigate = useNavigate();
    const [isRegistering, set IsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnonymousStart = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await authService.register({
                isAnonymous: true,
            });

            onUserSet(response.data.user);
            navigate('/questionnaire');
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión anónima');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.target);
        const data = {
            email: formData.get('email'),
            password: formData.get('password'),
            name: formData.get('name'),
        };

        try {
            const response = await authService.register(data);
            onUserSet(response.data.user);
            navigate('/questionnaire');
        } catch (err) {
            setError(err.message || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.target);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password'),
        };

        try {
            const response = await authService.login(credentials);
            onUserSet(response.data.user);
            navigate('/questionnaire');
        } catch (err) {
            setError(err.message || 'Credenciales inválidas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="welcome-screen">
            <motion.div
                className="welcome-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Hero Section */}
                <div className="hero-section">
                    <motion.h1
                        className="hero-title"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        ¿Y si sí pasa? 🤔
                    </motion.h1>

                    <motion.p
                        className="hero-subtitle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        Descubre tu nivel de riesgo y mejora tu protección financiera.<br />
                        <span className="text-muted">Tranqui, no es examen. Solo queremos ayudarte.</span>
                    </motion.p>
                </div>

                {/* Auth Section */}
                <motion.div
                    className="auth-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {!isRegistering ? (
                        // Login Form
                        <div className="auth-card">
                            <h2>Inicia sesión</h2>
                            <form onSubmit={handleLogin} className="auth-form">
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        placeholder="tu@email.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">Contraseña</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        required
                                        placeholder="••••••••"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                    disabled={loading}
                                >
                                    {loading ? 'Cargando...' : 'Entrar'}
                                </button>
                            </form>

                            <div className="auth-divider">
                                <span>o</span>
                            </div>

                            <button
                                onClick={handleAnonymousStart}
                                className="btn btn-secondary btn-lg"
                                disabled={loading}
                            >
                                Continuar sin registro
                            </button>

                            <p className="auth-switch">
                                ¿No tienes cuenta?{' '}
                                <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(true); }}>
                                    Regístrate
                                </a>
                            </p>
                        </div>
                    ) : (
                        // Register Form
                        <div className="auth-card">
                            <h2>Crear cuenta</h2>
                            <form onSubmit={handleRegister} className="auth-form">
                                <div className="form-group">
                                    <label htmlFor="name">Nombre</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="Tu nombre"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="reg-email">Email</label>
                                    <input
                                        type="email"
                                        id="reg-email"
                                        name="email"
                                        required
                                        placeholder="tu@email.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="reg-password">Contraseña</label>
                                    <input
                                        type="password"
                                        id="reg-password"
                                        name="password"
                                        required
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                    disabled={loading}
                                >
                                    {loading ? 'Creando cuenta...' : 'Registrarse'}
                                </button>
                            </form>

                            <div className="auth-divider">
                                <span>o</span>
                            </div>

                            <button
                                onClick={handleAnonymousStart}
                                className="btn btn-secondary btn-lg"
                                disabled={loading}
                            >
                                Continuar sin registro
                            </button>

                            <p className="auth-switch">
                                ¿Ya tienes cuenta?{' '}
                                <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(false); }}>
                                    Inicia sesión
                                </a>
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Features */}
                <motion.div
                    className="features"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                >
                    <div className="feature">
                        <div className="feature-icon">🎮</div>
                        <h3>Gamificado</h3>
                        <p>Sube de nivel y desbloquea insignias</p>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">📊</div>
                        <h3>Personalizado</h3>
                        <p>Insights adaptados a tu situación</p>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">🔒</div>
                        <h3>Privado</h3>
                        <p>Tus datos están seguros</p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default Welcome;
