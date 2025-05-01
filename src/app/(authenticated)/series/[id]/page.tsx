'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/auth-store';
import { useContentStore } from '@/lib/store/content-store';
import { usePlayerStore } from '@/lib/store/player-store';
import { usePreferencesStore } from '@/lib/store/preferences-store';
import { getSeriesInfo } from '@/lib/api/xtream';
import { getSeriesDetails } from '@/lib/api/tmdb';
import { Series, SeriesEpisode } from '@/types/content';
import { TMDBSeriesDetails } from '@/types/tmdb';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MediaPlayer } from '@/components/player/media-player';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Calendar, Info, User, Video, Play } from 'lucide-react';

export default function SeriesDetailPage() {
  const params = useParams();
  const seriesId = params.id as string;
  
  const { session } = useAuthStore();
  const { seriesList } = useContentStore();
  const { playContent, streamUrl } = usePlayerStore();
  const { watchHistory, updateWatchHistory } = usePreferencesStore();
  
  const [series, setSeries] = useState<Series | null>(null);
  const [tmdbDetails, setTmdbDetails] = useState<TMDBSeriesDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  
  // Find series in store or fetch it
  useEffect(() => {
    const foundSeries = seriesList.find((s) => s.series_id === seriesId);
    if (foundSeries) {
      setSeries(foundSeries);
    }
  }, [seriesId, seriesList]);
  
  // Fetch series details if not in store
  const { isLoading: isLoadingSeries } = useQuery({
    queryKey: ['seriesInfo', seriesId],
    queryFn: async () => {
      if (!session?.credentials) throw new Error('No credentials');
      
      const seriesInfo = await getSeriesInfo(session.credentials, seriesId);
      setSeries(seriesInfo);
      
      // Set first season as selected by default
      if (seriesInfo.seasons && Object.keys(seriesInfo.seasons).length > 0) {
        setSelectedSeason(Object.keys(seriesInfo.seasons)[0]);
      }
      
      return seriesInfo;
    },
    enabled: !!session?.credentials && !series,
  });
  
  // Fetch TMDB details
  const { isLoading: isLoadingTMDB } = useQuery({
    queryKey: ['tmdbSeries', series?.name],
    queryFn: async () => {
      if (!series?.name) throw new Error('No series name');
      
      const details = await getSeriesDetails(series.name, series.year);
      setTmdbDetails(details);
      return details;
    },
    enabled: !!series?.name,
  });
  
  // Handle episode play
  const handlePlayEpisode = (episode: SeriesEpisode) => {
    if (!series) return;
    
    playContent({
      contentId: `${series.series_id}_${episode.id}`,
      contentType: 'episode',
      contentTitle: `${series.name} - ${episode.title}`,
      contentPoster: series.cover || undefined,
      streamUrl: episode.stream_url,
    });
    
    // Add to watch history
    updateWatchHistory({
      id: `${series.series_id}_${episode.id}`,
      type: 'episode',
      name: `${series.name} - ${episode.title}`,
      poster: series.cover || undefined,
      progress: 0,
      duration: episode.duration_secs ? parseInt(episode.duration_secs) : undefined,
      timestamp: Date.now(),
    });
  };
  
  // Get episodes for selected season
  const getEpisodes = () => {
    if (!series || !selectedSeason || !series.seasons[selectedSeason]) {
      return [];
    }
    
    return series.seasons[selectedSeason].episodes;
  };
  
  // Loading state
  if (isLoadingSeries || (!series && !isLoadingSeries)) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-[400px] bg-muted rounded-lg" />
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Hero section with backdrop */}
      <div className="relative h-[400px] rounded-lg overflow-hidden">
        {tmdbDetails?.backdrop_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/original${tmdbDetails.backdrop_path}`}
            alt={series.name}
            fill
            className="object-cover"
          />
        ) : series.cover ? (
          <Image
            src={series.cover}
            alt={series.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Info className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col md:flex-row gap-6">
          {/* Poster */}
          <div className="relative h-[200px] w-[133px] rounded-lg overflow-hidden shadow-lg flex-shrink-0">
            {series.cover ? (
              <Image
                src={series.cover}
                alt={series.name}
                fill
                className="object-cover"
              />
            ) : tmdbDetails?.poster_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w500${tmdbDetails.poster_path}`}
                alt={series.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Info className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold">{series.name}</h1>
            
            <div className="flex flex-wrap gap-4 text-sm">
              {series.year && (
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  <span>{series.year}</span>
                </div>
              )}
              
              {tmdbDetails?.vote_average && (
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 text-yellow-500" />
                  <span>{tmdbDetails.vote_average.toFixed(1)}/10</span>
                </div>
              )}
              
              {tmdbDetails?.genres && tmdbDetails.genres.length > 0 && (
                <div>
                  {tmdbDetails.genres.map((genre) => genre.name).join(', ')}
                </div>
              )}
              
              {series.seasons && (
                <div className="flex items-center">
                  <Video className="mr-1 h-4 w-4" />
                  <span>{Object.keys(series.seasons).length} Sezon</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Description */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Özet</h2>
        <p className="text-muted-foreground">
          {series.plot || tmdbDetails?.overview || 'Bu dizi için özet bulunmuyor.'}
        </p>
      </div>
      
      {/* Cast */}
      {tmdbDetails?.credits?.cast && tmdbDetails.credits.cast.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Oyuncular</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {tmdbDetails.credits.cast.slice(0, 6).map((person) => (
              <div key={person.id} className="text-center">
                <div className="relative h-[150px] w-full rounded-lg overflow-hidden bg-muted mb-2">
                  {person.profile_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
                      alt={person.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="font-medium truncate">{person.name}</p>
                <p className="text-sm text-muted-foreground truncate">{person.character}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Seasons and Episodes */}
      {series.seasons && Object.keys(series.seasons).length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Bölümler</h2>
          
          <Tabs 
            defaultValue={selectedSeason || Object.keys(series.seasons)[0]} 
            onValueChange={setSelectedSeason}
          >
            <TabsList className="mb-6 flex flex-wrap">
              {Object.entries(series.seasons).map(([seasonNum, season]) => (
                <TabsTrigger key={seasonNum} value={seasonNum}>
                  Sezon {seasonNum}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(series.seasons).map(([seasonNum, season]) => (
              <TabsContent key={seasonNum} value={seasonNum}>
                <div className="space-y-4">
                  {season.episodes.map((episode) => {
                    // Find watch progress if any
                    const watchItem = watchHistory.find(
                      (item) => item.id === `${series.series_id}_${episode.id}` && item.type === 'episode'
                    );
                    
                    return (
                      <div 
                        key={episode.id} 
                        className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        {/* Episode thumbnail */}
                        <div className="relative h-[120px] sm:w-[213px] rounded overflow-hidden bg-muted flex-shrink-0">
                          {episode.info?.movie_image ? (
                            <Image
                              src={episode.info.movie_image}
                              alt={episode.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          
                          {/* Progress bar */}
                          {watchItem?.progress !== undefined && watchItem.progress > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${watchItem.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                        
                        {/* Episode info */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-medium text-lg">
                              {episode.episode_num}. {episode.title}
                            </h3>
                            
                            <p className="text-sm text-muted-foreground mt-1">
                              {episode.info?.plot || 'Bu bölüm için açıklama bulunmuyor.'}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center text-sm text-muted-foreground">
                              {episode.info?.duration_secs && (
                                <span className="flex items-center mr-4">
                                  <Clock className="mr-1 h-4 w-4" />
                                  {Math.floor(parseInt(episode.info.duration_secs) / 60)}:
                                  {(parseInt(episode.info.duration_secs) % 60).toString().padStart(2, '0')}
                                </span>
                              )}
                              
                              {episode.info?.releasedate && (
                                <span className="flex items-center">
                                  <Calendar className="mr-1 h-4 w-4" />
                                  {formatDate(episode.info.releasedate)}
                                </span>
                              )}
                              
                              {watchItem?.progress === 100 && (
                                <span className="ml-4 text-primary">İzlendi</span>
                              )}
                            </div>
                            
                            <Button 
                              size="sm" 
                              onClick={() => handlePlayEpisode(episode)}
                              className="flex items-center"
                            >
                              <Play className="mr-2 h-4 w-4" />
                              {watchItem?.progress && watchItem.progress < 100
                                ? 'Devam Et'
                                : 'İzle'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
      
      {/* Similar Series */}
      {tmdbDetails?.similar?.results && tmdbDetails.similar.results.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Benzer Diziler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {tmdbDetails.similar.results.slice(0, 6).map((similar) => (
              <div key={similar.id} className="text-center">
                <div className="relative h-[200px] w-full rounded-lg overflow-hidden bg-muted mb-2">
                  {similar.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w200${similar.poster_path}`}
                      alt={similar.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="font-medium truncate">{similar.name}</p>
                <p className="text-sm text-muted-foreground">
                  {similar.first_air_date && formatDate(similar.first_air_date)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Media player */}
      {streamUrl && <MediaPlayer />}
    </div>
  );
}