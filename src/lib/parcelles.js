import api from './api';

export const parcellesService = {
  // Obtenir toutes les parcelles
  async getMesParcelles() {
    const response = await api.get('/api/agriculteur/parcelles');
    return response.data;
  },

  // Obtenir une parcelle par ID
  async getParcelle(id) {
    const response = await api.get(`/api/agriculteur/parcelles/${id}`);
    return response.data;
  },

  // Créer une parcelle
  async creerParcelle(data) {
    const response = await api.post('/api/agriculteur/parcelles', data);
    return response.data;
  },

  // Modifier une parcelle
  async modifierParcelle(id, data) {
    const response = await api.put(`/api/agriculteur/parcelles/${id}`, data);
    return response.data;
  },

  // Supprimer une parcelle
  async supprimerParcelle(id) {
    const response = await api.delete(`/api/agriculteur/parcelles/${id}`);
    return response.data;
  },

  // Mettre à jour le statut
  async mettreAJourStatut(id, statut) {
    const response = await api.put(`/api/agriculteur/parcelles/${id}/statut?statut=${statut}`);
    return response.data;
  },

  // Rechercher des parcelles
  async rechercherParcelles(filters) {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/api/agriculteur/parcelles/recherche?${params}`);
    return response.data;
  },

  // Recherche textuelle
  async rechercherParTexte(searchTerm) {
    const response = await api.get(`/api/agriculteur/parcelles/recherche-texte?q=${searchTerm}`);
    return response.data;
  },

  // Obtenir le dashboard
  async getDashboard() {
    const response = await api.get('/api/agriculteur/dashboard');
    return response.data;
  },

  // Obtenir les statistiques
  async getStatistiques() {
    const response = await api.get('/api/agriculteur/statistiques');
    return response.data;
  },

  // Obtenir les types de culture
  async getTypesCulture() {
    const response = await api.get('/api/agriculteur/parcelles/types-culture');
    return response.data;
  },

  // Obtenir les statuts de culture
  async getStatutsCulture() {
    const response = await api.get('/api/agriculteur/parcelles/statuts');
    return response.data;
  }
};
