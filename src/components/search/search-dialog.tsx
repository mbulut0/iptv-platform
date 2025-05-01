'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useContentStore } from '@/lib/store/content-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentCard } from '@/components/content/content-card';
import { Search, X, Tv, Film, Video } from 'lucide-react';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const { liveStreams, vodStreams, seriesList } = useContentStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Reset search when dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery('');
    }
  }, [open]);
  
  // Filter content based on search query
  const filteredLiveStreams = liveStreams.filter((stream) =>
    stream.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredVodStreams = vodStreams.filter((stream) =>
    stream.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredSeries = seriesList.filter((series) =>
    series.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Map to content items
  const liveItems = filteredLiveStreams.map((stream) => ({
    id: stream.stream_id,
    type: 'live' as const,
    title: stream.name,
    posterUrl: stream.stream_icon || undefined,
    streamUrl: stream.stream_url,
    detailsUrl: `/live/${stream.stream_id}`,
  }));
  
  const movieItems = filteredVodStreams.map((stream) => ({
    id: stream.stream_id,
    type: 'movie' as const,
    title: stream.name,
    description: stream.plot || undefined,
    posterUrl: stream.stream_icon || undefined,
    streamUrl: stream.stream_url,
    year: stream.year || undefined,
    duration: stream.duration_secs ? parseInt(stream.duration_secs) : undefined,
    detailsUrl: `/movies/${stream.stream_id}`,
  }));
  
  const seriesItems = filteredSeries.map((series) => ({
    id: series.series_id,
    type: 'series' as const,
    title: series.name,
    description: series.plot || undefined,
    posterUrl: series.cover || undefined,
    year: series.year || undefined,
    detailsUrl: `/series/${series.series_id}`,
  }));
  
  // Get all items or filtered by tab
  const getItems = () => {
    switch (activeTab) {
      case 'live':
        return liveItems;
      case 'movies':
        return movieItems;
      case 'series':
        return seriesItems;
      default:
        return [...liveItems, ...movieItems, ...seriesItems];
    }
  };
  
  const handleItemClick = (detailsUrl: string) => {
    onOpenChange(false);
    router.push(detailsUrl);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Ara</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Film, dizi veya kanal ara..."
            className="pl-10 pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="live" className="flex items-center">
              <Tv className="mr-2 h-4 w-4" />
              Canlı TV
            </TabsTrigger>
            <TabsTrigger value="movies" className="flex items-center">
              <Film className="mr-2 h-4 w-4" />
              Filmler
            </TabsTrigger>
            <TabsTrigger value="series" className="flex items-center">
              <Video className="mr-2 h-4 w-4" />
              Diziler
            </TabsTrigger>
          </TabsList>
          
          <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(80vh - 200px)' }}>
            {searchQuery.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {getItems().map((item) => (
                  <div key={`${item.type}-${item.id}`} onClick={() => handleItemClick(item.detailsUrl!)}>
                    <ContentCard
                      id={item.id}
                      type={item.type}
                      title={item.title}
                      description={item.description}
                      posterUrl={item.posterUrl}
                      streamUrl={item.streamUrl}
                      year={item.year}
                      duration={item.duration}
                      detailsUrl={item.detailsUrl}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aramak için bir şeyler yazın
              </div>
            )}
            
            {searchQuery.length > 0 && getItems().length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Sonuç bulunamadı
              </div>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}