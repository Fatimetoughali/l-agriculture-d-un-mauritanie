// src/app/agriculteur/dashboard/page.js
'use client';
import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Sprout, 
  TrendingUp, 
  AlertCircle,
  Plus,
  Calendar,
  Droplets,
  Thermometer,
  Sun
} from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { parcellesService } from '@/lib/parcelles';
import { formatDate, formatNumber, getStatutColor, getCultureIcon } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await parcellesService.getDashboard();
        if (response.success) {
          setDashboardData(response.data);
        } else {
          toast.error('Erreur lors du chargement du tableau de bord');
        }
      } catch (error) {
        console.error('Erreur dashboard:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const {
    totalParcelles = 0,
    superficieTotale = 0,
    parcellesActives = 0,
    prochaineSaison = null,
    recentesParcelles = [],
    statistiques = {},
    alertes = []
  } = dashboardData || {};

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600">
            Bienvenue sur votre plateforme de gestion agricole
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Parcelles</p>
                <p className="text-2xl font-bold text-gray-900">{totalParcelles}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Sprout className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Superficie Totale</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(superficieTotale)} ha
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Parcelles Actives</p>
                <p className="text-2xl font-bold text-gray-900">{parcellesActives}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Prochaine Saison</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prochaineSaison ? formatDate(prochaineSaison) : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Alertes et notifications */}
        {alertes.length > 0 && (
          <Card className="mb-8 border-l-4 border-l-orange-400">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-orange-600 mt-1" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Alertes et Notifications
                </h3>
                <div className="space-y-2">
                  {alertes.map((alerte, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-orange-800">{alerte.titre}</p>
                        <p className="text-sm text-orange-600">{alerte.message}</p>
                      </div>
                      <Badge variant="warning" size="sm">
                        {alerte.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Parcelles récentes */}
          <Card 
            title="Parcelles Récentes"
            actions={
              <Link href="/agriculteur/parcelles">
                <Button variant="outline" size="sm">
                  Voir tout
                </Button>
              </Link>
            }
          >
            {recentesParcelles.length > 0 ? (
              <div className="space-y-4">
                {recentesParcelles.map((parcelle) => (
                  <div key={parcelle.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {getCultureIcon(parcelle.typeCulture)}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900">{parcelle.nom}</h4>
                        <p className="text-sm text-gray-600">
                          {parcelle.typeCulture} • {formatNumber(parcelle.superficie)} ha
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatutColor(parcelle.statutCulture)}>
                        {parcelle.statutCulture?.replace('_', ' ')}
                      </Badge>
                      <Link href={`/agriculteur/parcelles/${parcelle.id}`}>
                        <Button variant="outline" size="sm">
                          Voir
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Aucune parcelle trouvée</p>
                <Link href="/agriculteur/parcelles/nouvelle">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une parcelle
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Météo et conditions */}
          <Card title="Conditions Actuelles">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Sun className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="font-medium text-gray-900">Ensoleillé</p>
                    <p className="text-sm text-gray-600">Conditions favorables</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">28°C</p>
                  <p className="text-sm text-gray-600">Nouakchott</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Thermometer className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">Température</p>
                    <p className="font-medium">22°C - 32°C</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Humidité</p>
                    <p className="font-medium">65%</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Recommandations</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Arroser tôt le matin ou tard le soir</li>
                  <li>• Surveiller les cultures sensibles à la chaleur</li>
                  <li>• Vérifier l'irrigation goutte à goutte</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Statistiques détaillées */}
        <Card title="Statistiques par Type de Culture">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(statistiques).map(([type, stats]) => (
              <div key={type} className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-3xl mb-2">{getCultureIcon(type)}</div>
                <h4 className="font-medium text-gray-900 mb-2">{type}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>{stats.nombreParcelles} parcelles</p>
                  <p>{formatNumber(stats.superficie)} ha</p>
                  <p>{formatNumber(stats.rendementMoyen)} t/ha</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions rapides */}
        <Card title="Actions Rapides" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/agriculteur/parcelles/nouvelle">
              <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <Plus className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Nouvelle Parcelle</h4>
                  <p className="text-sm text-gray-600">Créer une nouvelle parcelle</p>
                </div>
              </div>
            </Link>

            <Link href="/agriculteur/parcelles/recherche">
              <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <MapPin className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Rechercher</h4>
                  <p className="text-sm text-gray-600">Trouver des parcelles</p>
                </div>
              </div>
            </Link>

            <Link href="/agriculteur/statistiques">
              <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Statistiques</h4>
                  <p className="text-sm text-gray-600">Analyser les performances</p>
                </div>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}