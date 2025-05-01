'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/auth-store';
import { useContentStore } from '@/lib/store/content-store';
import { usePlayerStore } from '@/lib/store/player-store';
import { usePreferencesStore } from '@/lib/store/preferences-store';
import { getLiveStreamEpg } from '@/lib/api/xtream';
import { LiveStream, EpgItem } from '@/types/content';
import { formatTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MediaPlayer } from '@/components/player/media-player';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Tv, Clock, Calendar, Info } from 'lucide-react';

export default function LiveChannelDetailPage() {
  const params = useParams();
  const channelId = params.id as string;
  
  const { session } = useAuthStore();
  const { liveStreams } = useContentStore();
  const { playContent, streamUrl } = usePlayerStore();
  const { favorites, addToFavorites, removeFromFavorites } = usePreferencesStore();
  
  const [channel, setChannel] = useState<LiveStream | null>(null);
  const [epgData, setEpgData] = useState<EpgItem[]>([]);
  const [currentProgram, setCurrentProgram] = useState<EpgItem | null>(null);
  const [nextPrograms, setNextPrograms] = useState<EpgItem[]>([]);
  
  // Find channel in store or fetch it
  useEffect(() => {
    const foundChannel = liveStreams.find((stream) => stream.stream_id === channelId);
    if (foundChannel) {
      setChannel(foundChannel);
    }
  }, [channelId, liveStreams]);
  
  // Check if channel is in favorites
  const isFavorite = favorites.some(
    (item) => item.id === channelId && item.type === 'live'
  );
  
  // Fetch EPG data
  const { isLoading: isLoadingEpg } = useQuery({
    queryKey: ['epg', channelId],
    queryFn: async () => {
      if (!session?.credentials || !channel) throw new Error('No credentials or channel');
      
      const epg = await getLiveStreamEpg(session.credentials, channelId);
      setEpgData(epg);
      
      // Find current and next programs
      const now = Math.floor(Date.now() / 1000);
      const current = epg.find(
        (item) => item.start_timestamp <= now && item.stop_timestamp > now
      );
      
      if (current) {
        setCurrentProgram(current);
        
        const upcoming = epg.filter(
          (item) => item.start_timestamp > now
        ).sort((a, b) => a.start_timestamp - b.start_timestamp);
        
        setNextPrograms(upcoming.slice(0, 10));
      }
      
      return epg;
    },
    enabled: !!session?.credentials && !!channel,
  });
  
  // Handle play button click
  const handlePlay = () => {
    if (!channel) return;
    
    playContent({
      contentId: channel.stream_id,
      contentType: 'live',
      contentTitle: channel.name,
      contentPoster: channel.stream_icon || undefined,
      streamUrl: channel.stream_url,
    });
  };
  
  // Toggle favorite
  const toggleFavorite = () => {
    if (!channel) return;
    
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
  
  // Loading state
  if (!channel) {
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
      {/* Channel header */}
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* Channel logo */}
        <div className="relative h-[200px] w-[200px] rounded-lg overflow-hidden shadow-lg flex-shrink-0 bg-card">
          {channel.stream_icon ? (
            <Image
              src={channel.stream_icon}
              alt={channel.name}
              fill
              className="object-contain p-4"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tv className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Channel info */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <h1 className="text-3xl font-bold">{channel.name}</h1>
          
          {currentProgram && (
            <div className="space-y-1">
              <p className="text-lg font-medium">Şu an yayında:</p>
              <p className="text-xl">{currentProgram.title}</p>
              <p className="text-sm text-muted-foreground">
                {formatTime(new Date(currentProgram.start_timestamp * 1000))} - 
                {formatTime(new Date(currentProgram.stop_timestamp * 1000))}
              </p>
              
              {currentProgram.description && (
                <p className="text-muted-foreground mt-2">
                  {currentProgram.description}
                </p>
              )}
            </div>
          )}
          
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Button onClick={handlePlay} className="flex items-center">
              <Play className="mr-2 h-4 w-4" />
              İzle
            </Button>
            
            <Button 
              variant={isFavorite ? "default" : "outline"} 
              onClick={toggleFavorite}
            >
              {isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Program guide */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Program Rehberi</h2>
        
        {isLoadingEpg ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        ) : epgData.length === 0 ? (
          <p className="text-muted-foreground">Bu kanal için program rehberi bulunmuyor.</p>
        ) : (
          <div className="space-y-4">
            {/* Current program */}
            {currentProgram && (
              <Card className="border-primary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium mr-3">
                        ŞU AN
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatTime(new Date(currentProgram.start_timestamp * 1000))} - 
                        {formatTime(new Date(currentProgram.stop_timestamp * 1000))}
                      </div>
                    </div>
                    
                    <Button size="sm" onClick={handlePlay}>
                      İzle
                    </Button>
                  </div>
                  
                  <h3 className="text-lg font-medium mt-2">{currentProgram.title}</h3>
                  
                  {currentProgram.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentProgram.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Next programs */}
            {nextPrograms.map((program) => (
              <Card key={program.id} className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    {formatTime(new Date(program.start_timestamp * 1000))} - 
                    {formatTime(new Date(program.stop_timestamp * 1000))}
                  </div>
                  
                  <h3 className="text-lg font-medium mt-1">{program.title}</h3>
                  
                  {program.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {program.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Media player */}
      {streamUrl && <MediaPlayer />}
    </div>
  );
}