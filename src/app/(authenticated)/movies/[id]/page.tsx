'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/auth-store';
import { useContentStore } from '@/lib/store/content-store';
import { usePlayerStore } from '@/lib/store/player-store';
import { usePreferencesStore } from '@/lib/store/preferences-store';
import { getVodInfo } from '@/lib/api/xtream';
import { getMovieDetails } from '@/lib/api/tmdb';
import { VodStream } from '@/types/content';
import { TMDBMovieDetails } from '@/types/tmdb';
import { formatMinutes, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MediaPlayer } from '@/components/player/media-player';
import { ContentGrid } from '@/components/content/content-grid';
import { Play, Star, Clock, Calendar, Info } from 'lucide-react';

export default function MovieDetailPage() {
  const params = useParams();
  const movieId = params.id as string;
  
  const { session } = useAuthStore();
  const { vodStreams } = useContentStore();
  const { playContent, streamUrl } = usePlayerStore();
  const { watchHistory, updateWatchHistory } = usePreferencesStore();
  
  const [movie, setMovie] = useState<VodStream | null>(null);
  const [tmdbDetails, setTmdbDetails] = useState<TMDBMovieDetails | null>(null);
  
  // Find movie in store or fetch it
  useEffect(() => {
    const foundMovie = vodStreams.find((stream) => stream.stream_id === movieId);
    if (foundMovie) {
      setMovie(foundMovie);
    }
  }, [movieId, vodStreams]);
  
  // Fetch movie details if not in store
  const { isLoading: isLoadingMovie } = useQuery({
    queryKey: ['vodInfo', movieId],
    queryFn: async () => {
      if (!session?.credentials) throw new Error('No credentials');
      
      const movieInfo = await getVodInfo(session.credentials, movieId);
      setMovie(movieInfo);
      return movieInfo;
    },
    enabled: !!session?.credentials && !movie,
  });
  
  // Fetch TMDB details
  const { isLoading: isLoadingTMDB } = useQuery({
    queryKey: ['tmdbMovie', movie?.name],
    queryFn: async () => {
      if (!movie?.name) throw new Error('No movie name');
      
      const details = await getMovieDetails(movie.name, movie.year);
      setTmdbDetails(details);
      return details;
    },
    enabled: !!movie?.name,
  });
  
  // Get watch progress
  const watchItem = watchHistory.find(
    (item) => item.id === movieId && item.type === 'movie'
  );
  
  // Handle play button click
  const handlePlay = () => {
    if (!movie) return;
    
    playContent({
      contentId: movie.stream_id,
      contentType: 'movie',
      contentTitle: movie.name,
      contentPoster: movie.stream_icon || undefined,
      streamUrl: movie.stream_url,
    });
    
    // Add to watch history
    updateWatchHistory({
      id: movie.stream_id,
      type: 'movie',
      name: movie.name,
      poster: movie.stream_icon || undefined,
      progress: 0,
      duration: movie.duration_secs ? parseInt(movie.duration_secs) : undefined,
      timestamp: Date.now(),
    });
  };
  
  // Loading state
  if (isLoadingMovie || (!movie && !isLoadingMovie)) {
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
            alt={movie.name}
            fill
            className="object-cover"
          />
        ) : movie.stream_icon ? (
          <Image
            src={movie.stream_icon}
            alt={movie.name}
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
            {movie.stream_icon ? (
              <Image
                src={movie.stream_icon}
                alt={movie.name}
                fill
                className="object-cover"
              />
            ) : tmdbDetails?.poster_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w500${tmdbDetails.poster_path}`}
                alt={movie.name}
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
            <h1 className="text-3xl font-bold">{movie.name}</h1>
            
            <div className="flex flex-wrap gap-4 text-sm">
              {movie.year && (
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  <span>{movie.year}</span>
                </div>
              )}
              
              {movie.duration_secs && (
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>{formatMinutes(parseInt(movie.duration_secs) / 60)}</span>
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
            </div>
            
            <div className="flex space-x-4">
              <Button onClick={handlePlay} className="flex items-center">
                <Play className="mr-2 h-4 w-4" />
                {watchItem?.progress && watchItem.progress < 100
                  ? 'Devam Et'
                  : 'İzle'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Description */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Özet</h2>
          <p className="text-muted-foreground">
            {movie.plot || tmdbDetails?.overview || 'Bu film için özet bulunmuyor.'}
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
        
        {/* Similar Movies */}
        {tmdbDetails?.similar?.results && tmdbDetails.similar.results.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Benzer Filmler</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tmdbDetails.similar.results.slice(0, 6).map((similar) => (
                <div key={similar.id} className="text-center">
                  <div className="relative h-[200px] w-full rounded-lg overflow-hidden bg-muted mb-2">
                    {similar.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w200${similar.poster_path}`}
                        alt={similar.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="font-medium truncate">{similar.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {similar.release_date && formatDate(similar.release_date)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Media player */}
      {streamUrl && <MediaPlayer />}
    </div>
  );
}