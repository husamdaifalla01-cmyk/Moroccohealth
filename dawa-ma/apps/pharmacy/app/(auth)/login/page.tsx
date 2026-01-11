'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuthStore } from '@/store/auth-store';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setPharmacy, setAccessToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement Supabase authentication
      // const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      //   email: data.email,
      //   password: data.password,
      // });

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock successful login
      setAccessToken('mock-access-token');
      setPharmacy({
        id: 'mock-pharmacy-id',
        name: 'Pharmacie Test',
        licenseNumber: 'PPB123456',
        licenseVerified: true,
        addressLine1: '123 Rue Test',
        city: 'Casablanca',
        region: 'Casablanca-Settat',
        phonePrimary: '+212522123456',
        operatingHours: {},
        is24Hour: false,
        isPharmacieDeGarde: false,
        acceptsPrescriptions: true,
        acceptsOtc: true,
        acceptsCosmetics: true,
        hasColdStorage: false,
        deliveryRadiusKm: 5,
        averagePreparationTimeMinutes: 15,
        commissionRate: 0.05,
        ratingAverage: 4.5,
        ratingCount: 100,
        orderCount: 500,
        fulfillmentRate: 0.98,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any);

      router.push('/dashboard');
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">D</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Portail Pharmacie</CardTitle>
          <CardDescription>
            Connectez-vous à votre espace pharmacie DAWA.ma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="pharmacie@exemple.ma"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </Button>

            <div className="text-center text-sm">
              <a href="#" className="text-teal-600 hover:underline">
                Mot de passe oublié?
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
