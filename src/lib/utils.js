import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// Formatage des dates
export const formatDate = (dateString, formatStr = 'dd/MM/yyyy') => {
  if (!dateString) return '-';
  return format(parseISO(dateString), formatStr, { locale: fr });
};

// Formatage des nombres
export const formatNumber = (number, decimals = 2) => {
  if (number === null || number === undefined) return '-';
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

// Couleurs par statut de culture
export const getStatutColor = (statut) => {
  const colors = {
    EN_PREPARATION: 'bg-gray-100 text-gray-800',
    PLANTE: 'bg-blue-100 text-blue-800',
    EN_CROISSANCE: 'bg-green-100 text-green-800',
    EN_FLORAISON: 'bg-yellow-100 text-yellow-800',
    MATURATION: 'bg-orange-100 text-orange-800',
    PRET_A_RECOLTER: 'bg-purple-100 text-purple-800',
    RECOLTE: 'bg-emerald-100 text-emerald-800',
    EN_REPOS: 'bg-gray-100 text-gray-600',
  };
  return colors[statut] || 'bg-gray-100 text-gray-800';
};

// Icônes par type de culture
export const getCultureIcon = (typeCulture) => {
  const icons = {
    'Maraîchage': '🥬',
    'Céréales': '🌾',
    'Légumineuses': '🫘',
    'Arboriculture': '🌳',
    'Élevage': '🐄',
    'Cultures fourragères': '🌱',
    'Cultures industrielles': '🏭',
  };
  return icons[typeCulture] || '🌱';
};

// Validation des formulaires
export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    return `${fieldName} est obligatoire`;
  }
  return null;
};

export const validatePhone = (phone) => {
  const phoneRegex = /^(\+222[0-9]{8}|[0-9]{8})$/;
  if (!phoneRegex.test(phone)) {
    return 'Format téléphone invalide (8 chiffres ou +222xxxxxxxx)';
  }
  return null;
};

export const validatePositiveNumber = (value, fieldName) => {
  if (value !== null && value !== undefined && value <= 0) {
    return `${fieldName} doit être positif`;
  }
  return null;
};

// Gestion des erreurs
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Une erreur inattendue s\'est produite';
};

// Debounce pour les recherches
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Constantes
export const REGIONS_MAURITANIE = [
  'Nouakchott',
  'Adrar',
  'Assaba',
  'Brakna',
  'Dakhlet Nouadhibou',
  'Gorgol',
  'Guidimaka',
  'Hodh Ech Chargui',
  'Hodh El Gharbi',
  'Inchiri',
  'Tagant',
  'Tiris Zemmour',
  'Trarza',
];

export const TYPES_CULTURE = [
  'Maraîchage',
  'Céréales',
  'Légumineuses',
  'Arboriculture',
  'Élevage',
  'Cultures fourragères',
  'Cultures industrielles',
];

export const METHODES_IRRIGATION = [
  'Goutte à goutte',
  'Aspersion',
  'Gravitaire',
  'Submersion',
  'Micro-aspersion',
];

export const STATUTS_CULTURE = [
  { code: 'EN_PREPARATION', libelle: 'En préparation' },
  { code: 'PLANTE', libelle: 'Planté' },
  { code: 'EN_CROISSANCE', libelle: 'En croissance' },
  { code: 'EN_FLORAISON', libelle: 'En floraison' },
  { code: 'MATURATION', libelle: 'En maturation' },
  { code: 'PRET_A_RECOLTER', libelle: 'Prêt à récolter' },
  { code: 'RECOLTE', libelle: 'Récolté' },
  { code: 'EN_REPOS', libelle: 'En repos' },
];