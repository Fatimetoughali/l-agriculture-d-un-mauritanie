import api from './api';
import Cookies from 'js-cookie';

export const authService = {
  // Connexion
  async login(credentials) {
    const response = await api.post('/api/auth/login', credentials);
    if (response.data.success) {
      const { token, refreshToken } = response.data.data;
      Cookies.set('authToken', token, { expires: 1 }); // 1 jour
      Cookies.set('refreshToken', refreshToken, { expires: 7 }); // 7 jours
    }
    return response.data;
  },

  // Inscription agriculteur
  async registerAgriculteur(data) {
    const response = await api.post('/api/auth/register/agriculteur', data);
    if (response.data.success) {
      const { token, refreshToken } = response.data.data;
      Cookies.set('authToken', token, { expires: 1 });
      Cookies.set('refreshToken', refreshToken, { expires: 7 });
    }
    return response.data;
  },

  // Déconnexion
  logout() {
    Cookies.remove('authToken');
    Cookies.remove('refreshToken');
    window.location.href = '/auth/login';
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return !!Cookies.get('authToken');
  },

  // Obtenir le profil utilisateur
  async getProfile() {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },

  // Rafraîchir le token
  async refreshToken() {
    const refreshToken = Cookies.get('refreshToken');
    const response = await api.post('/api/auth/refresh', { refreshToken });
    if (response.data.success) {
      const { token, refreshToken: newRefreshToken } = response.data.data;
      Cookies.set('authToken', token, { expires: 1 });
      Cookies.set('refreshToken', newRefreshToken, { expires: 7 });
    }
    return response.data;
  }
};
