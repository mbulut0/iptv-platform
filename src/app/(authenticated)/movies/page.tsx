'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/auth-store';
import { useContentStore } from '@/lib/store/content-store';
import { getVodCategories, getVodStreams } from '@/lib/api/xtream';
import { VodCategory, VodStream } from '@/types/content';
import { ContentGrid } from '@/components/content/content-grid';
import { Button } from '@/components/ui/button';
import { MediaPlayer } from '@/components/player/media-player';
import { usePlayerStore } from '@/lib/store/player-store';
import { usePreferencesStore } from '@/lib/store/preferences-store';

export default function MoviesPage() {
  const { session } = useAuthStore();
  const { vodCategories, vodStreams, setVodCategories, setVodStreams } = useContentStore();
  const { streamUrl } = usePlayerStore();
  const { watchHistory } = usePreferencesStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredStreams, setFilteredStreams] = useState<VodStream[]>([]);
  
  // Fetch VOD categories
  const { isLoading: isLoadingCategories } = useQuery({
    queryKey: ['vodCategories'],
    queryFn: async () => {
      if (!session?.credentials) throw new Error('No credentials');
      
      const categories = await getVodCategories(session.credentials);
      setVodCategories(categories);
      
      // Select first category by default
      if (categories.length > 0 && !selectedCategory) {
        setSelectedCategory(categories[0].category_id);
      }
      
      return categories;
    },
    enabled: !!session?.credentials && vodCategories.length === 0,
  });
  
  // Fetch VOD streams
  const { isLoading: isLoadingStreams } = useQuery({
    queryKey: ['vodStreams'],
    queryFn: async () => {
      if (!session?.credentials) throw new Error('No credentials');
      
      const streams = await getVodStreams(session.credentials);
      setVodStreams(streams);
      return streams;
    },
    enabled: !!session?.credentials && vodStreams.length === 0,
  });
  
  // Filter streams by selected category
  useEffect(() => {
    if (selectedCategory) {
      const filtered = vodStreams.filter(
        (stream) => stream.category_id === selectedCategory
      );
      setFilteredStreams(filtered);
    } else {
      setFilteredStreams(vodStreams);
    }
  }, [selectedCategory, vodStreams]);
  
  // Map streams to content items with watch progress
  const contentItems = filteredStreams.map((stream) => {
    // Find watch progress if any
    const watchItem = watchHistory.find(
      (item) => item.id === stream.stream_id && item.type === 'movie'
    );
    
    return {
      id: stream.stream_id,
      type: 'movie' as const,
      title: stream.name,
      description: stream.plot || undefined,
      posterUrl: stream.stream_icon || undefined,
      streamUrl: stream.stream_url,
      year: stream.year || undefined,
      duration: stream.duration_secs ? parseInt(stream.duration_secs) : undefined,
      progress: watchItem?.progress,
      detailsUrl: `/movies/${stream.stream_id}`,
    };
  });
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">Filmler</h1>
        
        {/* Category tabs */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex space-x-2">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(null)}
            >
              Tümü
            </Button>
            
            {vodCategories.map((category) => (
              <Button
                key={category.category_id}
                variant={
                  selectedCategory === category.category_id
                    ? 'default'
                    : 'outline'
                }
                onClick={() => setSelectedCategory(category.category_id)}
              >
                {category.category_name}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Content grid */}
        <ContentGrid
          items={contentItems}
          isLoading={isLoadingCategories || isLoadingStreams}
          emptyMessage={
            selectedCategory
              ? 'Bu kategoride film bulunamadı'
              : 'Film bulunamadı'
          }
        />
      </div>
      
      {/* Media player */}
      {streamUrl && <MediaPlayer />}
    </div>
  );
}