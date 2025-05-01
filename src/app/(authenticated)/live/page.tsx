'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/auth-store';
import { useContentStore } from '@/lib/store/content-store';
import { usePlayerStore } from '@/lib/store/player-store';
import { getLiveCategories, getLiveStreams } from '@/lib/api/xtream';
import { MediaPlayer } from '@/components/player/media-player';
import { ChannelList } from '@/components/live/channel-list';
import { EpgGuide } from '@/components/live/epg-guide';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid2X2, List, Calendar } from 'lucide-react';

export default function LiveTVPage() {
  const { session } = useAuthStore();
  const { liveCategories, liveStreams, setLiveCategories, setLiveStreams } = useContentStore();
  const { streamUrl } = usePlayerStore();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  
  // Fetch live categories
  const { isLoading: isLoadingCategories } = useQuery({
    queryKey: ['liveCategories'],
    queryFn: async () => {
      if (!session?.credentials) throw new Error('No credentials');
      
      const categories = await getLiveCategories(session.credentials);
      setLiveCategories(categories);
      return categories;
    },
    enabled: !!session?.credentials && liveCategories.length === 0,
  });
  
  // Fetch live streams
  const { isLoading: isLoadingStreams } = useQuery({
    queryKey: ['liveStreams'],
    queryFn: async () => {
      if (!session?.credentials) throw new Error('No credentials');
      
      const streams = await getLiveStreams(session.credentials);
      setLiveStreams(streams);
      
      // Set first channel as selected by default
      if (streams.length > 0 && !selectedChannelId) {
        setSelectedChannelId(streams[0].stream_id);
      }
      
      return streams;
    },
    enabled: !!session?.credentials && liveStreams.length === 0,
  });
  
  // Get selected channel
  const selectedChannel = liveStreams.find(
    (stream) => stream.stream_id === selectedChannelId
  );
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Canlı TV</h1>
        
        <div className="flex items-center space-x-2">
          <Tabs 
            value={viewMode} 
            onValueChange={(value) => setViewMode(value as 'grid' | 'list')}
            className="hidden md:block"
          >
            <TabsList>
              <TabsTrigger value="list" className="flex items-center">
                <List className="mr-2 h-4 w-4" />
                Liste
              </TabsTrigger>
              <TabsTrigger value="grid" className="flex items-center">
                <Grid2X2 className="mr-2 h-4 w-4" />
                Izgara
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Channel list */}
        <div className="md:col-span-1">
          <ChannelList />
        </div>
        
        {/* EPG guide */}
        <div className="md:col-span-2">
          {selectedChannel ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Program Rehberi
              </h2>
              
              <EpgGuide 
                channelId={selectedChannel.stream_id} 
                onPlayChannel={() => {
                  // This would be handled by the channel list component
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Program rehberi için bir kanal seçin
            </div>
          )}
        </div>
      </div>
      
      {/* Media player */}
      {streamUrl && <MediaPlayer />}
    </div>
  );
}