'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/auth-store';
import { useContentStore } from '@/lib/store/content-store';
import { getSeriesCategories, getSeries } from '@/lib/api/xtream';
import { SeriesCategory, Series } from '@/types/content';
import { ContentGrid } from '@/components/content/content-grid';
import { Button } from '@/components/ui/button';
import { MediaPlayer } from '@/components/player/media-player';
import { usePlayerStore } from '@/lib/store/player-store';

export default function SeriesPage() {
  const { session } = useAuthStore();
  const { seriesCategories, seriesList, setSeriesCategories, setSeriesList } = useContentStore();
  const { streamUrl } = usePlayerStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredSeries, setFilteredSeries] = useState<Series[]>([]);
  
  // Fetch series categories
  const { isLoading: isLoadingCategories } = useQuery({
    queryKey: ['seriesCategories'],
    queryFn: async () => {
      if (!session?.credentials) throw new Error('No credentials');
      
      const categories = await getSeriesCategories(session.credentials);
      setSeriesCategories(categories);
      
      // Select first category by default
      if (categories.length > 0 && !selectedCategory) {
        setSelectedCategory(categories[0].category_id);
      }
      
      return categories;
    },
    enabled: !!session?.credentials && seriesCategories.length === 0,
  });
  
  // Fetch series list
  const { isLoading: isLoadingSeries } = useQuery({
    queryKey: ['seriesList'],
    queryFn: async () => {
      if (!session?.credentials) throw new Error('No credentials');
      
      const series = await getSeries(session.credentials);
      setSeriesList(series);
      return series;
    },
    enabled: !!session?.credentials && seriesList.length === 0,
  });
  
  // Filter series by selected category
  useEffect(() => {
    if (selectedCategory) {
      const filtered = seriesList.filter(
        (series) => series.category_id === selectedCategory
      );
      setFilteredSeries(filtered);
    } else {
      setFilteredSeries(seriesList);
    }
  }, [selectedCategory, seriesList]);
  
  // Map series to content items
  const contentItems = filteredSeries.map((series) => ({
    id: series.series_id,
    type: 'series' as const,
    title: series.name,
    description: series.plot || undefined,
    posterUrl: series.cover || undefined,
    year: series.year || undefined,
    detailsUrl: `/series/${series.series_id}`,
  }));
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">Diziler</h1>
        
        {/* Category tabs */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex space-x-2">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(null)}
            >
              Tümü
            </Button>
            
            {seriesCategories.map((category) => (
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
          isLoading={isLoadingCategories || isLoadingSeries}
          emptyMessage={
            selectedCategory
              ? 'Bu kategoride dizi bulunamadı'
              : 'Dizi bulunamadı'
          }
        />
      </div>
      
      {/* Media player */}
      {streamUrl && <MediaPlayer />}
    </div>
  );
}