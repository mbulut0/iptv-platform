import { useState } from 'react';
import Image from 'next/image';
import { VodStream } from '@/lib/types/content';
import { usePreferencesStore } from '@/lib/store/preferences-store';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, StarOff, Play, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface MovieCardProps {
  movie: VodStream;
  onClick?: () => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  const { favorites, addToFavorites, removeFromFavorites, watchHistory } = usePreferencesStore();
  const [isHovered, setIsHovered] = useState(false);
  
  // Check if movie is in favorites
  const isFavorite = favorites.some(
    item => item.id === movie.stream_id && item.type === 'movie'
  );
  
  // Get watch progress if any
  const watchItem = watchHistory.find(
    item => item.id === movie.stream_id && item.type === 'movie'
  );
  
  // Toggle favorite
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isFavorite) {
      removeFromFavorites(movie.stream_id, 'movie');
    } else {
      addToFavorites({
        id: movie.stream_id,
        type: 'movie',
        name: movie.name,
        poster: movie.stream_icon || '',
      });
    }
  };
  
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
          {movie.stream_icon ? (
            <Image
              src={movie.stream_icon}
              alt={movie.name}
              fill
              className={cn(
                "object-cover transition-transform duration-300",
                isHovered && "scale-110"
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Info className="h-10 w-10 text-muted-foreground" />
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
          
          {/* Watch progress */}
          {watchItem?.progress !== undefined && watchItem.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/50">
              <div
                className="h-full bg-primary"
                style={{ width: `${watchItem.progress}%` }}
              />
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
          <h3 className="font-medium text-sm truncate">{movie.name}</h3>
          
          <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
            <span>{movie.year}</span>
            
            {movie.rating && (
              <div className="flex items-center">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{movie.rating}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}