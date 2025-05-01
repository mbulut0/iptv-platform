'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/lib/store/player-store';
import { usePreferencesStore } from '@/lib/store/preferences-store';
import { cn } from '@/lib/utils';
import { Play, Info, Star, StarOff, Tv, Film, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContentCardProps {
  id: string;
  type: 'live' | 'movie' | 'series' | 'episode';
  title: string;
  description?: string;
  posterUrl?: string;
  streamUrl?: string;
  year?: string;
  duration?: number;
  progress?: number;
  onClick?: () => void;
  detailsUrl?: string;
}

export function ContentCard({
  id,
  type,
  title,
  description,
  posterUrl,
  streamUrl,
  year,
  duration,
  progress,
  onClick,
  detailsUrl,
}: ContentCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const { playContent } = usePlayerStore();
  const { favorites, addToFavorites, removeFromFavorites } = usePreferencesStore();
  
  const isFavorite = favorites.some(
    (item) => item.id === id && item.type === type
  );
  
  const handlePlay = () => {
    if (streamUrl) {
      playContent({
        contentId: id,
        contentType: type,
        contentTitle: title,
        contentPoster: posterUrl,
        streamUrl,
      });
    }
  };
  
  const handleDetails = () => {
    if (detailsUrl) {
      router.push(detailsUrl);
    } else if (onClick) {
      onClick();
    }
  };
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isFavorite) {
      removeFromFavorites(id, type);
    } else {
      addToFavorites({
        id,
        type,
        name: title,
        poster: posterUrl,
      });
    }
  };
  
  const getTypeIcon = () => {
    switch (type) {
      case 'live':
        return <Tv className="h-4 w-4" />;
      case 'movie':
        return <Film className="h-4 w-4" />;
      case 'series':
      case 'episode':
        return <Video className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  return (
    <motion.div
      className="group relative rounded-lg overflow-hidden bg-card shadow-sm transition-all hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleDetails}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      {/* Poster */}
      <div className="aspect-[2/3] relative bg-muted">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {getTypeIcon()}
          </div>
        )}
        
        {/* Progress bar for movies and episodes */}
        {(type === 'movie' || type === 'episode') && progress !== undefined && progress > 0 && progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div
              className="h-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        {/* Hover overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4 transition-opacity',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <h3 className="text-white text-center font-medium mb-2 line-clamp-2">
            {title}
          </h3>
          
          {description && (
            <p className="text-white/80 text-xs text-center mb-4 line-clamp-3">
              {description}
            </p>
          )}
          
          <div className="flex space-x-2">
            {streamUrl && (
              <Button
                size="sm"
                className="flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlay();
                }}
              >
                <Play className="mr-1 h-4 w-4" />
                İzle
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              className="flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                handleDetails();
              }}
            >
              <Info className="mr-1 h-4 w-4" />
              Detaylar
            </Button>
          </div>
        </div>
      </div>
      
      {/* Favorite button */}
      <button
        className={cn(
          'absolute top-2 right-2 p-1 rounded-full transition-opacity',
          isFavorite ? 'bg-primary text-primary-foreground' : 'bg-black/50 text-white',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
        onClick={toggleFavorite}
      >
        {isFavorite ? (
          <StarOff className="h-4 w-4" />
        ) : (
          <Star className="h-4 w-4" />
        )}
      </button>
      
      {/* Content info */}
      <div className="p-3">
        <h3 className="font-medium truncate">{title}</h3>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          {getTypeIcon()}
          <span className="ml-1">
            {type === 'live'
              ? 'Canlı'
              : type === 'movie'
              ? 'Film'
              : type === 'series'
              ? 'Dizi'
              : 'Bölüm'}
          </span>
          
          {year && <span className="ml-2">{year}</span>}
          
          {duration && (
            <span className="ml-2">
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
            </span>
          )}
          
          {progress === 100 && (
            <span className="ml-2 text-primary">İzlendi</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}