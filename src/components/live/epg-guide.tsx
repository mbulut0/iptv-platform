'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/auth-store';
import { getLiveStreamEpg } from '@/lib/api/xtream';
import { EpgItem } from '@/types/content';
import { formatTime } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock } from 'lucide-react';

interface EpgGuideProps {
  channelId: string;
  onPlayChannel: () => void;
}

export function EpgGuide({ channelId, onPlayChannel }: EpgGuideProps) {
  const { session } = useAuthStore();
  const [epgData, setEpgData] = useState<EpgItem[]>([]);
  const [currentProgram, setCurrentProgram] = useState<EpgItem | null>(null);
  const [nextPrograms, setNextPrograms] = useState<EpgItem[]>([]);
  
  // Fetch EPG data
  const { isLoading } = useQuery({
    queryKey: ['epg', channelId],
    queryFn: async () => {
      if (!session?.credentials) throw new Error('No credentials');
      
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
        
        setNextPrograms(upcoming.slice(0, 5));
      }
      
      return epg;
    },
    enabled: !!session?.credentials,
  });
  
  // Calculate progress percentage for current program
  const calculateProgress = () => {
    if (!currentProgram) return 0;
    
    const now = Math.floor(Date.now() / 1000);
    const total = currentProgram.stop_timestamp - currentProgram.start_timestamp;
    const elapsed = now - currentProgram.start_timestamp;
    
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };
  
  const [progress, setProgress] = useState(0);
  
  // Update progress every second
  useEffect(() => {
    if (!currentProgram) return;
    
    setProgress(calculateProgress());
    
    const interval = setInterval(() => {
      const newProgress = calculateProgress();
      setProgress(newProgress);
      
      // If program ended, refetch EPG
      if (newProgress >= 100) {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentProgram]);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-16 bg-muted rounded-lg" />
        <div className="animate-pulse h-16 bg-muted rounded-lg" />
        <div className="animate-pulse h-16 bg-muted rounded-lg" />
      </div>
    );
  }
  
  if (epgData.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Bu kanal için program rehberi bulunmuyor.
      </div>
    );
  }
  
  return (
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
              
              <Button size="sm" onClick={onPlayChannel}>
                <Play className="mr-2 h-4 w-4" />
                İzle
              </Button>
            </div>
            
            <h3 className="text-lg font-medium mt-2">{currentProgram.title}</h3>
            
            {/* Progress bar */}
            <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {currentProgram.description && (
              <p className="text-sm text-muted-foreground mt-2">
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
              <Clock className="mr-1 h-4 w-4" />
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
  );
}