import api from './api';

export const authService = {
    /**
     * Registra un nuevo usuario
     */
    async register(userData) {
        const response = await api.post('/auth/register', userData);
        if (response.success && response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response;
    },

    /**
     * Inicia sesión
     */
    async login(credentials) {
        const response = await api.post('/auth/login', credentials);
        if (response.success && response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response;
    },

    /**
     * Cierra sesión
     */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    },

    /**
     * Obtiene el usuario actual del localStorage
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Verifica si el usuario está autenticado
     */
    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    /**
     * Obtiene el perfil del usuario desde el backend
     */
    async getProfile() {
        const response = await api.get('/auth/profile');
        return response.data;
    },
};

export default authService;
