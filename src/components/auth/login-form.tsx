import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { XtreamCredentials } from '@/types/auth';

// Validation schema
const loginSchema = z.object({
  server: z
    .string()
    .min(1, 'Sunucu adresi gereklidir')
    .refine(
      (value) => {
        try {
          const url = new URL(value);
          return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (error) {
          return false;
        }
      },
      {
        message: 'Geçerli bir URL girin (http:// veya https:// ile başlamalı)',
      }
    ),
  username: z.string().min(1, 'Kullanıcı adı gereklidir'),
  password: z.string().min(1, 'Şifre gereklidir'),
});

export function LoginForm() {
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<XtreamCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      server: '',
      username: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: XtreamCredentials) => {
    clearError();
    await login(data);
  };
  
  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-lg">
      <div className="text-center">
        <h1 className="text-2xl font-bold">IPTV Platformu</h1>
        <p className="mt-2 text-muted-foreground">
          Xtream Codes hesabınızla giriş yapın
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="server" className="text-sm font-medium">
              Sunucu Adresi
            </label>
            <Input
              id="server"
              placeholder="http://sunucu.adres:port"
              {...register('server')}
              onChange={() => clearError()}
            />
            {errors.server && (
              <p className="text-sm text-destructive">{errors.server.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Kullanıcı Adı
            </label>
            <Input
              id="username"
              placeholder="Kullanıcı adınız"
              {...register('username')}
              onChange={() => clearError()}
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Şifre
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Şifreniz"
                {...register('password')}
                onChange={() => clearError()}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <span className="text-xs">Gizle</span>
                ) : (
                  <span className="text-xs">Göster</span>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
        </div>
        
        {error && (
          <div className="p-3 text-sm text-white bg-destructive rounded">
            {error}
          </div>
        )}
        
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
        </Button>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Test hesabı: <br />
            Sunucu: http://denge.click:8080 <br />
            Kullanıcı: dengedenge <br />
            Şifre: sadeceben20
          </p>
        </div>
      </form>
    </div>
  );
}