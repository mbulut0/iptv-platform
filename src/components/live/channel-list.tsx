'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useContentStore } from '@/lib/store/content-store';
import { usePlayerStore } from '@/lib/store/player-store';
import { usePreferencesStore } from '@/lib/store/preferences-store';
import { LiveStream, LiveCategory } from '@/types/content';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Star, StarOff, Tv } from 'lucide-react';

export function ChannelList() {
  const router = useRouter();
  const { liveCategories, liveStreams } = useContentStore();
  const { playContent } = usePlayerStore();
  const { favorites, addToFavorites, removeFromFavorites } = usePreferencesStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChannels, setFilteredChannels] = useState<LiveStream[]>([]);
  
  // Set first category as selected by default
  useEffect(() => {
    if (liveCategories.length > 0 && !selectedCategory) {
      setSelectedCategory('favorites');
    }
  }, [liveCategories, selectedCategory]);
  
  // Filter channels based on selected category and search query
  useEffect(() => {
    let channels: LiveStream[] = [];
    
    if (selectedCategory === 'favorites') {
      // Get favorite channels
      const favoriteIds = favorites
        .filter(item => item.type === 'live')
        .map(item => item.id);
      
      channels = liveStreams.filter(stream => 
        favoriteIds.includes(stream.stream_id)
      );
    } else if (selectedCategory === 'all') {
      channels = [...liveStreams];
    } else if (selectedCategory) {
      channels = liveStreams.filter(
        stream => stream.category_id === selectedCategory
      );
    }
    
    // Apply search filter if any
    if (searchQuery) {
      channels = channels.filter(channel =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredChannels(channels);
  }, [selectedCategory, searchQuery, liveStreams, favorites]);
  
  // Create a reference to the parent container
  const parentRef = React.useRef<HTMLDivElement>(null);
  
  // Set up virtualization
  const rowVirtualizer = useVirtualizer({
    count: filteredChannels.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Estimated row height
    overscan: 5,
  });
  
  // Handle channel play
  const handlePlayChannel = (channel: LiveStream) => {
    playContent({
      contentId: channel.stream_id,
      contentType: 'live',
      contentTitle: channel.name,
      contentPoster: channel.stream_icon || undefined,
      streamUrl: channel.stream_url,
    });
    
    // Navigate to channel detail page
    router.push(`/live/${channel.stream_id}`);
  };
  
  // Toggle favorite
  const toggleFavorite = (e: React.MouseEvent, channel: LiveStream) => {
    e.stopPropagation();
    
    const isFavorite = favorites.some(
      item => item.id === channel.stream_id && item.type === 'live'
    );
    
    if (isFavorite) {
      removeFromFavorites(channel.stream_id, 'live');
    } else {
      addToFavorites({
        id: channel.stream_id,
        type: 'live',
        name: channel.name,
        poster: channel.stream_icon,
      });
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Kanal ara..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Categories tabs */}
      <Tabs 
        value={selectedCategory || 'all'} 
        onValueChange={setSelectedCategory}
        className="flex-1 flex flex-col"
      >
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="favorites" className="flex items-center">
            <Star className="mr-2 h-4 w-4" />
            Favoriler
          </TabsTrigger>
          <TabsTrigger value="all">Tümü</TabsTrigger>
          {liveCategories.map((category) => (
            <TabsTrigger key={category.category_id} value={category.category_id}>
              {category.category_name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* Channel list */}
        <div 
          ref={parentRef} 
          className="flex-1 overflow-auto border rounded-md"
          style={{ height: 'calc(100vh - 300px)' }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const channel = filteredChannels[virtualRow.index];
              const isFavorite = favorites.some(
                item => item.id === channel.stream_id && item.type === 'live'
              );
              
              return (
                <div
                  key={channel.stream_id}
                  className={cn(
                    "absolute top-0 left-0 w-full border-b last:border-b-0 hover:bg-accent/50 transition-colors cursor-pointer",
                    "flex items-center p-3 gap-3"
                  )}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  onClick={() => handlePlayChannel(channel)}
                >
                  {/* Channel logo */}
                  <div className="relative h-12 w-12 rounded overflow-hidden bg-card flex-shrink-0">
                    {channel.stream_icon ? (
                      <Image
                        src={channel.stream_icon}
                        alt={channel.name}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Tv className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* Channel info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{channel.name}</h3>
                    
                    {/* EPG info could be added here */}
                    <p className="text-sm text-muted-foreground truncate">
                      {channel.epg_channel_id ? 'Program bilgisi mevcut' : 'Program bilgisi yok'}
                    </p>
                  </div>
                  
                  {/* Favorite button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={(e) => toggleFavorite(e, channel)}
                  >
                    {isFavorite ? (
                      <Star className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <StarOff className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
          
          {filteredChannels.length === 0 && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {searchQuery ? 'Arama sonucu bulunamadı' : 'Bu kategoride kanal bulunmuyor'}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}