'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sprout, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/lib/auth';
import { getErrorMessage, validatePhone, REGIONS_MAURITANIE } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    motDePasse: '',
    confirmMotDePasse: '',
    adresse: '',
    region: '',
    commune: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est obligatoire';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est obligatoire';
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le numéro de téléphone est obligatoire';
    } else {
      const phoneError = validatePhone(formData.telephone);
      if (phoneError) newErrors.telephone = phoneError;
    }
    
    if (!formData.motDePasse) {
      newErrors.motDePasse = 'Le mot de passe est obligatoire';
    } else if (formData.motDePasse.length < 6) {
      newErrors.motDePasse = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    if (!formData.confirmMotDePasse) {
      newErrors.confirmMotDePasse = 'Veuillez confirmer le mot de passe';
    } else if (formData.motDePasse !== formData.confirmMotDePasse) {
      newErrors.confirmMotDePasse = 'Les mots de passe ne correspondent pas';
    }
    
    if (!formData.region) newErrors.region = 'La région est obligatoire';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { confirmMotDePasse, acceptTerms, ...dataToSend } = formData;
      const response = await authService.registerAgriculteur(dataToSend);
      
      if (response.success) {
        toast.success('Inscription réussie !');
        router.push('/agriculteur/dashboard');
      } else {
        toast.error(response.message || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center bg-primary-600 rounded-lg">
            <Sprout className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Inscription Agriculteur
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Créez votre compte pour gérer vos parcelles
          </p>
        </div>

        {/* Formulaire */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                error={errors.nom}
                required
              />
              <Input
                label="Prénom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                error={errors.prenom}
                required
              />
            </div>

            <Input
              label="Téléphone"
              name="telephone"
              type="tel"
              value={formData.telephone}
              onChange={handleChange}
              error={errors.telephone}
              placeholder="+222 12 34 56 78"
              required
            />

            <Input
              label="Email (optionnel)"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="votre@email.com"
            />

            <div className="relative">
              <Input
                label="Mot de passe"
                name="motDePasse"
                type={showPassword ? 'text' : 'password'}
                value={formData.motDePasse}
                onChange={handleChange}
                error={errors.motDePasse}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirmer le mot de passe"
                name="confirmMotDePasse"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmMotDePasse}
                onChange={handleChange}
                error={errors.confirmMotDePasse}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Input
              label="Adresse (optionnel)"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              error={errors.adresse}
            />

            <div className="grid grid-cols-2 gap-4">
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
              />
            </div>

            <div className="flex items-center">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                J'accepte les{' '}
                <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                  conditions d'utilisation
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-red-600">{errors.acceptTerms}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            S'inscrire
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Déjà un compte ?{' '}
              <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
                Se connecter
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}