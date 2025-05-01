import { useState } from 'react';
import Image from 'next/image';
import { Series } from '@/lib/types/content';
import { usePreferencesStore } from '@/lib/store/preferences-store';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, StarOff, Play, Info, Video } from 'lucide-react';
import { motion } from 'framer-motion';

interface SeriesCardProps {
  series: Series;
  onClick?: () => void;
}

export function SeriesCard({ series, onClick }: SeriesCardProps) {
  const { favorites, addToFavorites, removeFromFavorites } = usePreferencesStore();
  const [isHovered, setIsHovered] = useState(false);
  
  // Check if series is in favorites
  const isFavorite = favorites.some(
    item => item.id === series.series_id && item.type === 'series'
  );
  
  // Toggle favorite
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isFavorite) {
      removeFromFavorites(series.series_id, 'series');
    } else {
      addToFavorites({
        id: series.series_id,
        type: 'series',
        name: series.name,
        poster: series.cover || '',
      });
    }
  };
  
  // Get number of seasons
  const seasonCount = series.seasons ? Object.keys(series.seasons).length : 0;
  
  return (
    <motion.div
      className="h-full"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      <Card className="h-full overflow-hidden cursor-pointer group">
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          {series.cover ? (
            <Image
              src={series.cover}
              alt={series.name}
              fill
              className={cn(
                "object-cover transition-transform duration-300",
                isHovered && "scale-110"
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Video className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          
          {/* Favorite button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-2 right-2 bg-background/80 backdrop-blur-sm opacity-0 transition-opacity",
              isHovered && "opacity-100"
            )}
            onClick={handleToggleFavorite}
          >
            {isFavorite ? (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>
          
          {/* Season count badge */}
          {seasonCount > 0 && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
              {seasonCount} Sezon
            </div>
          )}
          
          {/* Hover overlay with play button */}
          <div
            className={cn(
              "absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 transition-opacity",
              isHovered && "opacity-100"
            )}
          >
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
              <Play className="h-6 w-6" />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-3">
          <h3 className="font-medium text-sm truncate">{series.name}</h3>
          
          <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
            <span>{series.year}</span>
            
            {series.rating && (
              <div className="flex items-center">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{series.rating}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}