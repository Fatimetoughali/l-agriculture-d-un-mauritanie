// src/app/agriculteur/parcelles/page.js
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Edit, 
  Trash2,
  Eye
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import { parcellesService } from '@/lib/parcelles';
import { formatDate, formatNumber, getStatutColor, getCultureIcon, TYPES_CULTURE } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ParcellesPage() {
  const [parcelles, setParcelles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [parcelleToDelete, setParcelleToDelete] = useState(null);
  const [typesCulture, setTypesCulture] = useState([]);
  const [statutsCulture, setStatutsCulture] = useState([]);

  useEffect(() => {
    fetchParcelles();
    fetchMetadata();
  }, []);

  const fetchParcelles = async () => {
    try {
      const response = await parcellesService.getMesParcelles();
      if (response.success) {
        setParcelles(response.data);
      } else {
        toast.error('Erreur lors du chargement des parcelles');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [typesResponse, statutsResponse] = await Promise.all([
        parcellesService.getTypesCulture(),
        parcellesService.getStatutsCulture()
      ]);

      if (typesResponse.success) {
        setTypesCulture(typesResponse.data);
      }

      if (statutsResponse.success) {
        setStatutsCulture(statutsResponse.data);
      }
    } catch (error) {
      console.error('Erreur chargement métadonnées:', error);
    }
  };

  const handleDelete = async () => {
    if (!parcelleToDelete) return;

    try {
      const response = await parcellesService.supprimerParcelle(parcelleToDelete.id);
      if (response.success) {
        setParcelles(prev => prev.filter(p => p.id !== parcelleToDelete.id));
        toast.success('Parcelle supprimée avec succès');
        setShowDeleteModal(false);
        setParcelleToDelete(null);
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleStatusChange = async (parcelleId, newStatus) => {
    try {
      const response = await parcellesService.mettreAJourStatut(parcelleId, newStatus);
      if (response.success) {
        setParcelles(prev => 
          prev.map(p => 
            p.id === parcelleId 
              ? { ...p, statutCulture: newStatus }
              : p
          )
        );
        toast.success('Statut mis à jour');
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Filtrage des parcelles
  const filteredParcelles = parcelles.filter(parcelle => {
    const matchSearch = parcelle.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       parcelle.typeCulture.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = !selectedType || parcelle.typeCulture === selectedType;
    const matchStatut = !selectedStatut || parcelle.statutCulture === selectedStatut;
    
    return matchSearch && matchType && matchStatut;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Parcelles</h1>
            <p className="text-gray-600">
              Gérez vos {parcelles.length} parcelles agricoles
            </p>
          </div>
          <Link href="/agriculteur/parcelles/nouvelle">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Parcelle
            </Button>
          </Link>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              placeholder="Type de culture"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              options={typesCulture.map(type => ({ value: type, label: type }))}
            />
            <Select
              placeholder="Statut"
              value={selectedStatut}
              onChange={(e) => setSelectedStatut(e.target.value)}
              options={statutsCulture.map(statut => ({ 
                value: statut.code, 
                label: statut.libelle 
              }))}
            />
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedType('');
              setSelectedStatut('');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </Card>

        {/* Liste des parcelles */}
        {filteredParcelles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParcelles.map((parcelle) => (
              <Card key={parcelle.id} className="hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* En-tête de la carte */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">
                        {getCultureIcon(parcelle.typeCulture)}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{parcelle.nom}</h3>
                        <p className="text-sm text-gray-600">{parcelle.typeCulture}</p>
                      </div>
                    </div>
                    <Badge className={getStatutColor(parcelle.statutCulture)}>
                      {parcelle.statutCulture?.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Informations */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Superficie:</span>
                      <span className="font-medium">{formatNumber(parcelle.superficie)} ha</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Région:</span>
                      <span className="font-medium">{parcelle.region}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Date plantation:</span>
                      <span className="font-medium">
                        {formatDate(parcelle.datePlantation)}
                      </span>
                    </div>
                    {parcelle.rendementEstime && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Rendement estimé:</span>
                        <span className="font-medium">{formatNumber(parcelle.rendementEstime)} t/ha</span>
                      </div>
                    )}
                  </div>

                  {/* Changement de statut */}
                  <div>
                    <Select
                      placeholder="Changer le statut"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleStatusChange(parcelle.id, e.target.value);
                        }
                      }}
                      options={statutsCulture.map(statut => ({ 
                        value: statut.code, 
                        label: statut.libelle 
                      }))}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link href={`/agriculteur/parcelles/${parcelle.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                    </Link>
                    <Link href={`/agriculteur/parcelles/${parcelle.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                    </Link>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => {
                        setParcelleToDelete(parcelle);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune parcelle trouvée
              </h3>
              <p className="text-gray-600 mb-6">
                {parcelles.length === 0 
                  ? "Commencez par créer votre première parcelle" 
                  : "Aucune parcelle ne correspond à vos critères de recherche"
                }
              </p>
              <Link href="/agriculteur/parcelles/nouvelle">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une parcelle
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Modal de confirmation de suppression */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Confirmer la suppression"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer la parcelle "{parcelleToDelete?.nom}" ?
              Cette action est irréversible.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                className="flex-1"
              >
                Supprimer
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

// src/app/agriculteur/parcelles/nouvelle/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { parcellesService } from '@/lib/parcelles';
import { 
  validateRequired, 
  validatePositiveNumber, 
  getErrorMessage,
  REGIONS_MAURITANIE,
  TYPES_CULTURE,
  METHODES_IRRIGATION
} from '@/lib/utils';
import toast from 'react-hot-toast';

export default function NouvelleParcellePage() {
  const [formData, setFormData] = useState({
    nom: '',
    typeCulture: '',
    superficie: '',
    region: '',
    commune: '',
    latitude: '',
    longitude: '',
    datePlantation: '',
    dateRecolteEstimee: '',
    rendementEstime: '',
    methodeIrrigation: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation des champs obligatoires
    const requiredError = validateRequired(formData.nom, 'Le nom');
    if (requiredError) newErrors.nom = requiredError;

    const typeError = validateRequired(formData.typeCulture, 'Le type de culture');
    if (typeError) newErrors.typeCulture = typeError;

    const superficieError = validateRequired(formData.superficie, 'La superficie');
    if (superficieError) {
      newErrors.superficie = superficieError;
    } else {
      const positiveError = validatePositiveNumber(parseFloat(formData.superficie), 'La superficie');
      if (positiveError) newErrors.superficie = positiveError;
    }

    const regionError = validateRequired(formData.region, 'La région');
    if (regionError) newErrors.region = regionError;

    // Validation des coordonnées si fournies
    if (formData.latitude && (formData.latitude < -90 || formData.latitude > 90)) {
      newErrors.latitude = 'La latitude doit être entre -90 et 90';
    }
    if (formData.longitude && (formData.longitude < -180 || formData.longitude > 180)) {
      newErrors.longitude = 'La longitude doit être entre -180 et 180';
    }

    // Validation du rendement estimé
    if (formData.rendementEstime) {
      const rendementError = validatePositiveNumber(parseFloat(formData.rendementEstime), 'Le rendement estimé');
      if (rendementError) newErrors.rendementEstime = rendementError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Convertir les valeurs numériques
      const dataToSend = {
        ...formData,
        superficie: parseFloat(formData.superficie),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        rendementEstime: formData.rendementEstime ? parseFloat(formData.rendementEstime) : null,
      };

      const response = await parcellesService.creerParcelle(dataToSend);
      
      if (response.success) {
        toast.success('Parcelle créée avec succès !');
        router.push('/agriculteur/parcelles');
      } else {
        toast.error(response.message || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur création parcelle:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle Parcelle</h1>
          <p className="text-gray-600">
            Créez une nouvelle parcelle pour votre exploitation
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Informations générales */}
            <Card title="Informations Générales">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nom de la parcelle"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  error={errors.nom}
                  placeholder="Ex: Parcelle Nord, Champ de tomates..."
                  required
                />

                <Select
                  label="Type de culture"
                  name="typeCulture"
                  value={formData.typeCulture}
                  onChange={handleChange}
                  error={errors.typeCulture}
                  options={TYPES_CULTURE}
                  required
                />

                <Input
                  label="Superficie (hectares)"
                  name="superficie"
                  type="number"
                  step="0.01"
                  value={formData.superficie}
                  onChange={handleChange}
                  error={errors.superficie}
                  placeholder="Ex: 2.5"
                  required
                />

                <Select
                  label="Méthode d'irrigation"
                  name="methodeIrrigation"
                  value={formData.methodeIrrigation}
                  onChange={handleChange}
                  error={errors.methodeIrrigation}
                  options={METHODES_IRRIGATION}
                />
              </div>
            </Card>

            {/* Localisation */}
            <Card title="Localisation">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Région"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  error={errors.region}
                  options={REGIONS_MAURITANIE}
                  required
                />

                <Input
                  label="Commune"
                  name="commune"
                  value={formData.commune}
                  onChange={handleChange}
                  error={errors.commune}
                  placeholder="Ex: Sebkha, Tevragh-Zeina..."
                />

                <Input
                  label="Latitude (optionnel)"
                  name="latitude"
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={handleChange}
                  error={errors.latitude}
                  placeholder="Ex: 18.0735"
                />

                <Input
                  label="Longitude (optionnel)"
                  name="longitude"
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={handleChange}
                  error={errors.longitude}
                  placeholder="Ex: -15.9582"
                />
              </div>
            </Card>

            {/* Calendrier cultural */}
            <Card title="Calendrier Cultural">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Date de plantation"
                  name="datePlantation"
                  type="date"
                  value={formData.datePlantation}
                  onChange={handleChange}
                  error={errors.datePlantation}
                />

                <Input
                  label="Date de récolte estimée"
                  name="dateRecolteEstimee"
                  type="date"
                  value={formData.dateRecolteEstimee}
                  onChange={handleChange}
                  error={errors.dateRecolteEstimee}
                />

                <Input
                  label="Rendement estimé (tonnes/hectare)"
                  name="rendementEstime"
                  type="number"
                  step="0.1"
                  value={formData.rendementEstime}
                  onChange={handleChange}
                  error={errors.rendementEstime}
                  placeholder="Ex: 5.2"
                />
              </div>
            </Card>

            {/* Notes */}
            <Card title="Notes et Observations">
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Notes, observations, spécificités de la parcelle..."
              />
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
              >
                Créer la parcelle
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

// src/app/agriculteur/parcelles/[id]/page.js
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Edit, 
  MapPin, 
  Calendar, 
  Droplets, 
  TrendingUp,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import { parcellesService } from '@/lib/parcelles';
import { formatDate, formatNumber, getStatutColor, getCultureIcon } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ParcelleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [parcelle, setParcelle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchParcelle();
    }
  }, [params.id]);

  const fetchParcelle = async () => {
    try {
      const response = await parcellesService.getParcelle(params.id);
      if (response.success) {
        setParcelle(response.data);
      } else {
        toast.error('Parcelle non trouvée');
        router.push('/agriculteur/parcelles');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement de la parcelle');
      router.push('/agriculteur/parcelles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await parcellesService.supprimerParcelle(params.id);
      if (response.success) {
        toast.success('Parcelle supprimée avec succès');
        router.push('/agriculteur/parcelles');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!parcelle) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Parcelle non trouvée</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="text-3xl mr-3">
                  {getCultureIcon(parcelle.typeCulture)}
                </span>
                {parcelle.nom}
              </h1>
              <p className="text-gray-600">{parcelle.typeCulture}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={getStatutColor(parcelle.statutCulture)}>
              {parcelle.statutCulture?.replace('_', ' ')}
            </Badge>
            <Link href={`/agriculteur/parcelles/${params.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </Link>
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations générales */}
            <Card title="Informations Générales">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Superficie</p>
                  <p className="font-semibold text-lg">{formatNumber(parcelle.superficie)} ha</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Méthode d'irrigation</p>
                  <p className="font-semibold">{parcelle.methodeIrrigation || 'Non spécifiée'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date de création</p>
                  <p className="font-semibold">{formatDate(parcelle.dateCreation)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dernière mise à jour</p>
                  <p className="font-semibold">{formatDate(parcelle.dateModification)}</p>
                </div>
              </div>
            </Card>

            {/* Localisation */}
            <Card title="Localisation" actions={
              <MapPin className="h-5 w-5 text-gray-400" />
            }>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Région</p>
                    <p className="font-semibold">{parcelle.region}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Commune</p>
                    <p className="font-semibold">{parcelle.commune || 'Non spécifiée'}</p>
                  </div>
                </div>
                
                {(parcelle.latitude && parcelle.longitude) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Coordonnées GPS</p>
                    <p className="font-mono text-sm">
                      {formatNumber(parcelle.latitude, 6)}, {formatNumber(parcelle.longitude, 6)}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        const url = `https://www.google.com/maps?q=${parcelle.latitude},${parcelle.longitude}`;
                        window.open(url, '_blank');
                      }}
                    >
                      Voir sur la carte
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Notes et observations */}
            {parcelle.notes && (
              <Card title="Notes et Observations">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{parcelle.notes}</p>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Calendrier cultural */}
            <Card title="Calendrier Cultural" actions={
              <Calendar className="h-5 w-5 text-gray-400" />
            }>
              <div className="space-y-4">
                {parcelle.datePlantation && (
                  <div>
                    <p className="text-sm text-gray-600">Date de plantation</p>
                    <p className="font-semibold">{formatDate(parcelle.datePlantation)}</p>
                  </div>
                )}
                {parcelle.dateRecolteEstimee && (
                  <div>
                    <p className="text-sm text-gray-600">Récolte estimée</p>
                    <p className="font-semibold">{formatDate(parcelle.dateRecolteEstimee)}</p>
                  </div>
                )}
                {parcelle.dateRecolteReelle && (
                  <div>
                    <p className="text-sm text-gray-600">Récolte réelle</p>
                    <p className="font-semibold">{formatDate(parcelle.dateRecolteReelle)}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Performance */}
            <Card title="Performance" actions={
              <TrendingUp className="h-5 w-5 text-gray-400" />
            }>
              <div className="space-y-4">
                {parcelle.rendementEstime && (
                  <div>
                    <p className="text-sm text-gray-600">Rendement estimé</p>
                    <p className="font-semibold text-lg text-green-600">
                      {formatNumber(parcelle.rendementEstime)} t/ha
                    </p>
                  </div>
                )}
                {parcelle.rendementReel && (
                  <div>
                    <p className="text-sm text-gray-600">Rendement réel</p>
                    <p className="font-semibold text-lg text-blue-600">
                      {formatNumber(parcelle.rendementReel)} t/ha
                    </p>
                  </div>
                )}
                {parcelle.coutTotal && (
                  <div>
                    <p className="text-sm text-gray-600">Coût total</p>
                    <p className="font-semibold">{formatNumber(parcelle.coutTotal)} MRU</p>
                  </div>
                )}
                {parcelle.revenuTotal && (
                  <div>
                    <p className="text-sm text-gray-600">Revenu total</p>
                    <p className="font-semibold text-green-600">{formatNumber(parcelle.revenuTotal)} MRU</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Actions rapides */}
            <Card title="Actions Rapides">
              <div className="space-y-2">
                <Link href={`/agriculteur/parcelles/${params.id}/edit`}>
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier la parcelle
                  </Button>
                </Link>
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Planifier une tâche
                </Button>
                <Button variant="outline" className="w-full">
                  <Droplets className="h-4 w-4 mr-2" />
                  Enregistrer arrosage
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Modal de confirmation de suppression */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Confirmer la suppression"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer la parcelle "{parcelle.nom}" ?
              Cette action est irréversible et supprimera toutes les données associées.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                className="flex-1"
              >
                Supprimer définitivement
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}