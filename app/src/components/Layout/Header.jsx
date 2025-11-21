import authService from '../services/authService';
import './Header.css';

function Header({ user, onLogout }) {
    const handleLogout = () => {
        authService.logout();
        onLogout();
    };

    return (
        <header className="app-header">
            <div className="header-container">
                <div className="header-logo">
                    <span className="logo-emoji">🎲</span>
                    <span className="logo-text">¿Y si sí pasa?</span>
                </div>

                <nav className="header-nav">
                    <a href="/questionnaire" className="nav-link">Cuestionarios</a>
                    <a href="/results" className="nav-link">Resultados</a>
                    <a href="/profile" className="nav-link">Perfil</a>
                </nav>

                <div className="header-user">
                    {user && (
                        <>
                            <span className="user-name">
                                {user.name || user.email || 'Anónimo'}
                            </span>
                            <button onClick={handleLogout} className="btn btn-sm btn-secondary">
                                Salir
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
