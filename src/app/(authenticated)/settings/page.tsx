'use client';

import { useState } from 'react';
import { usePreferencesStore } from '@/lib/store/preferences-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sun, Moon, Monitor, Lock, Info, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const { preferences, updatePreferences } = usePreferencesStore();
  const [parentalPin, setParentalPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updatePreferences({ theme });
  };
  
  const handleLanguageChange = (language: 'tr' | 'en') => {
    updatePreferences({ language });
  };
  
  const handleParentalControlToggle = (enabled: boolean) => {
    if (!enabled) {
      // Disable parental control
      updatePreferences({ parentalControlEnabled: false });
    } else {
      // When enabling, we need to set a PIN first
      if (!preferences.parentalPin) {
        // Don't enable yet, user needs to set PIN
        updatePreferences({ parentalControlEnabled: false });
      } else {
        updatePreferences({ parentalControlEnabled: true });
      }
    }
  };
  
  const handleSetPin = () => {
    setPinError('');
    
    if (parentalPin.length < 4) {
      setPinError('PIN en az 4 karakter olmalıdır');
      return;
    }
    
    if (parentalPin !== confirmPin) {
      setPinError('PIN\'ler eşleşmiyor');
      return;
    }
    
    updatePreferences({ 
      parentalPin,
      parentalControlEnabled: true 
    });
    
    setParentalPin('');
    setConfirmPin('');
    
    alert('PIN başarıyla ayarlandı');
  };
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Ayarlar</h1>
      
      <Tabs defaultValue="appearance">
        <TabsList className="mb-6">
          <TabsTrigger value="appearance" className="flex items-center">
            <Monitor className="mr-2 h-4 w-4" />
            Görünüm
          </TabsTrigger>
          <TabsTrigger value="parental" className="flex items-center">
            <Lock className="mr-2 h-4 w-4" />
            Ebeveyn Kontrolü
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center">
            <Info className="mr-2 h-4 w-4" />
            Hakkında
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tema</CardTitle>
                <CardDescription>
                  Uygulamanın görünümünü özelleştirin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={preferences.theme === 'light' ? 'default' : 'outline'}
                    className="flex flex-col items-center justify-center py-6"
                    onClick={() => handleThemeChange('light')}
                  >
                    <Sun className="mb-2 h-6 w-6" />
                    <span>Aydınlık</span>
                  </Button>
                  
                  <Button
                    variant={preferences.theme === 'dark' ? 'default' : 'outline'}
                    className="flex flex-col items-center justify-center py-6"
                    onClick={() => handleThemeChange('dark')}
                  >
                    <Moon className="mb-2 h-6 w-6" />
                    <span>Karanlık</span>
                  </Button>
                  
                  <Button
                    variant={preferences.theme === 'system' ? 'default' : 'outline'}
                    className="flex flex-col items-center justify-center py-6"
                    onClick={() => handleThemeChange('system')}
                  >
                    <Monitor className="mb-2 h-6 w-6" />
                    <span>Sistem</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Dil</CardTitle>
                <CardDescription>
                  Uygulama dilini seçin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={preferences.language === 'tr' ? 'default' : 'outline'}
                    onClick={() => handleLanguageChange('tr')}
                  >
                    Türkçe
                  </Button>
                  
                  <Button
                    variant={preferences.language === 'en' ? 'default' : 'outline'}
                    onClick={() => handleLanguageChange('en')}
                  >
                    English
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="parental">
          <Card>
            <CardHeader>
              <CardTitle>Ebeveyn Kontrolü</CardTitle>
              <CardDescription>
                Yetişkin içeriklere erişimi kısıtlayın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="parental-control">Ebeveyn Kontrolü</Label>
                  <p className="text-sm text-muted-foreground">
                    Yetişkin içerikler için PIN koruması ekler
                  </p>
                </div>
                <Switch
                  id="parental-control"
                  checked={preferences.parentalControlEnabled}
                  onCheckedChange={handleParentalControlToggle}
                />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="parental-pin">Ebeveyn PIN Kodu</Label>
                  <p className="text-sm text-muted-foreground">
                    Yetişkin içeriklere erişmek için kullanılacak PIN kodunu belirleyin
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pin">PIN</Label>
                    <Input
                      id="pin"
                      type="password"
                      placeholder="PIN kodunuz"
                      value={parentalPin}
                      onChange={(e) => setParentalPin(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-pin">PIN Tekrar</Label>
                    <Input
                      id="confirm-pin"
                      type="password"
                      placeholder="PIN kodunuzu tekrar girin"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                    />
                  </div>
                </div>
                
                {pinError && (
                  <p className="text-sm text-destructive">{pinError}</p>
                )}
                
                <Button onClick={handleSetPin}>
                  PIN Kodunu Ayarla
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>Uygulama Hakkında</CardTitle>
              <CardDescription>
                Uygulama bilgileri ve teknik detaylar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">IPTV Platform</h3>
                <p className="text-sm text-muted-foreground">
                  Versiyon 1.0.0
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Teknolojiler</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Next.js 14</li>
                  <li>TypeScript</li>
                  <li>Tailwind CSS</li>
                  <li>Framer Motion</li>
                  <li>HLS.js</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">API Entegrasyonları</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Xtream Codes API</li>
                  <li>TMDB API</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Lisans</h3>
                <p className="text-sm text-muted-foreground">
                  © 2025 IPTV Platform. Tüm hakları saklıdır.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}