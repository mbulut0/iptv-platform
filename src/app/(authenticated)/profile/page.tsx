'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { usePreferencesStore } from '@/lib/store/preferences-store';
import { getTimeRemaining } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentGrid } from '@/components/content/content-grid';
import { MediaPlayer } from '@/components/player/media-player';
import { usePlayerStore } from '@/lib/store/player-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Star, User, Clock } from 'lucide-react';

export default function ProfilePage() {
  const { session } = useAuthStore();
  const { watchHistory, favorites, clearWatchHistory, clearFavorites } = usePreferencesStore();
  const { streamUrl } = usePlayerStore();
  const [activeTab, setActiveTab] = useState('history');
  
  // Map watch history to content items
  const historyItems = watchHistory.map((item) => ({
    id: item.id,
    type: item.type as 'movie' | 'episode',
    title: item.name,
    posterUrl: item.poster,
    progress: item.progress,
    duration: item.duration,
    detailsUrl: 
      item.type === 'movie' 
        ? `/movies/${item.id}` 
        : `/series/${item.id.split('_')[0]}/episode/${item.id}`,
  }));
  
  // Map favorites to content items
  const favoriteItems = favorites.map((item) => ({
    id: item.id,
    type: item.type as 'live' | 'movie' | 'series',
    title: item.name,
    posterUrl: item.poster,
    detailsUrl: 
      item.type === 'live'
        ? `/live/${item.id}`
        : item.type === 'movie'
        ? `/movies/${item.id}`
        : `/series/${item.id}`,
  }));
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Profil</h1>
      
      {/* User info card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Hesap Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Kullanıcı Adı</p>
              <p className="text-lg">{session?.userInfo.username}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Durum</p>
              <p className="text-lg">
                {session?.userInfo.status === 'Active' ? 'Aktif' : 'Pasif'}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Abonelik Bitiş Tarihi</p>
              <p className="text-lg">
                {session?.userInfo.exp_date
                  ? new Date(session.userInfo.exp_date).toLocaleDateString('tr-TR')
                  : 'Belirtilmemiş'}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Kalan Süre</p>
              <p className="text-lg">
                {session?.userInfo.exp_date
                  ? getTimeRemaining(session.userInfo.exp_date)
                  : 'Belirtilmemiş'}
              </p>
            </div>
            
            {session?.userInfo.max_connections && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Maksimum Bağlantı</p>
                <p className="text-lg">{session.userInfo.max_connections}</p>
              </div>
            )}
            
            {session?.userInfo.active_cons && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aktif Bağlantı</p>
                <p className="text-lg">{session.userInfo.active_cons}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Watch history and favorites */}
      <Tabs defaultValue="history" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="history" className="flex items-center">
              <History className="mr-2 h-4 w-4" />
              İzleme Geçmişi
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center">
              <Star className="mr-2 h-4 w-4" />
              Favoriler
            </TabsTrigger>
          </TabsList>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (activeTab === 'history') {
                if (confirm('İzleme geçmişini temizlemek istediğinize emin misiniz?')) {
                  clearWatchHistory();
                }
              } else {
                if (confirm('Favorileri temizlemek istediğinize emin misiniz?')) {
                  clearFavorites();
                }
              }
            }}
          >
            Temizle
          </Button>
        </div>
        
        <TabsContent value="history">
          <ContentGrid
            items={historyItems}
            emptyMessage="İzleme geçmişiniz boş"
          />
        </TabsContent>
        
        <TabsContent value="favorites">
          <ContentGrid
            items={favoriteItems}
            emptyMessage="Favori listeniz boş"
          />
        </TabsContent>
      </Tabs>
      
      {/* Media player */}
      {streamUrl && <MediaPlayer />}
    </div>
  );
}