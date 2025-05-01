'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { usePreferencesStore } from '@/lib/store/preferences-store';
import { getTimeRemaining } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tv, Film, Video, History, Star } from 'lucide-react';

export default function DashboardPage() {
  const { session } = useAuthStore();
  const { watchHistory, favorites } = usePreferencesStore();
  const [greeting, setGreeting] = useState('');
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Günaydın');
    } else if (hour < 18) {
      setGreeting('İyi günler');
    } else {
      setGreeting('İyi akşamlar');
    }
  }, []);
  
  const recentlyWatched = watchHistory.slice(0, 5);
  const favoriteItems = favorites.slice(0, 5);
  
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">
          {greeting}, {session?.userInfo.username}
        </h1>
        
        {session?.userInfo.exp_date && (
          <p className="text-muted-foreground">
            Abonelik bitiş tarihi: {new Date(session.userInfo.exp_date).toLocaleDateString('tr-TR')} (
            {getTimeRemaining(session.userInfo.exp_date)})
          </p>
        )}
      </section>
      
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/live">
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tv className="mr-2 h-5 w-5" />
                Canlı TV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tüm canlı TV kanallarını izleyin. Spor, haber, belgesel ve daha fazlası.
              </p>
              <Button className="mt-4" variant="outline">
                Kanalları Görüntüle
              </Button>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/movies">
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Film className="mr-2 h-5 w-5" />
                Filmler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Binlerce film arasından seçim yapın. En yeni filmler ve klasikler.
              </p>
              <Button className="mt-4" variant="outline">
                Filmleri Keşfet
              </Button>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/series">
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="mr-2 h-5 w-5" />
                Diziler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                En sevdiğiniz dizileri izleyin. Tüm sezonlar ve bölümler.
              </p>
              <Button className="mt-4" variant="outline">
                Dizileri Keşfet
              </Button>
            </CardContent>
          </Card>
        </Link>
      </section>
      
      {recentlyWatched.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center">
            <History className="mr-2 h-5 w-5" />
            Son İzlenenler
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recentlyWatched.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="relative aspect-[2/3] bg-muted rounded-md overflow-hidden">
                  {item.poster ? (
                    <img
                      src={item.poster}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.type === 'movie' ? (
                        <Film className="h-10 w-10 text-muted-foreground" />
                      ) : (
                        <Video className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                  )}
                  
                  {item.progress > 0 && item.progress < 100 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.type === 'movie' ? 'Film' : 'Dizi'}
                  {item.progress === 100 ? ' • Tamamlandı' : ''}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {favoriteItems.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center">
            <Star className="mr-2 h-5 w-5" />
            Favoriler
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favoriteItems.map((item) => (
              <div key={`${item.id}-${item.type}`} className="space-y-2">
                <div className="relative aspect-[2/3] bg-muted rounded-md overflow-hidden">
                  {item.poster ? (
                    <img
                      src={item.poster}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.type === 'movie' ? (
                        <Film className="h-10 w-10 text-muted-foreground" />
                      ) : item.type === 'series' ? (
                        <Video className="h-10 w-10 text-muted-foreground" />
                      ) : (
                        <Tv className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.type === 'movie'
                    ? 'Film'
                    : item.type === 'series'
                    ? 'Dizi'
                    : 'Kanal'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}