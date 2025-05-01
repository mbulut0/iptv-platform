'use client';

import { useEffect, useState } from 'react';
import { useMediaPlayer } from '@/lib/hooks/use-media-player';
import { usePlayerStore } from '@/lib/store/player-store';
import { formatTime } from '@/lib/utils';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  X,
  Settings,
  SkipBack,
  SkipForward,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function MediaPlayer() {
  const {
    contentId,
    contentType,
    contentTitle,
    streamUrl,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    closePlayer,
  } = usePlayerStore();
  
  const {
    videoRef,
    isBuffering,
    error,
    qualities,
    currentQuality,
    controls,
  } = useMediaPlayer();
  
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Hide controls after inactivity
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
      
      const timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
      
      setControlsTimeout(timeout);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [isPlaying, controlsTimeout]);
  
  // Handle fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        const playerElement = document.getElementById('media-player-container');
        if (playerElement) {
          await playerElement.requestFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          controls.togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          controls.toggleMute();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (contentType !== 'live') {
            controls.seek(currentTime + 10);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (contentType !== 'live') {
            controls.seek(Math.max(0, currentTime - 10));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          controls.setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          controls.setVolume(Math.max(0, volume - 0.1));
          break;
        case 'Escape':
          if (!isFullscreen) {
            controls.close();
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [controls, currentTime, volume, isMuted, isFullscreen, contentType]);
  
  if (!streamUrl) {
    return null;
  }
  
  return (
    <div
      id="media-player-container"
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onClick={() => setShowControls(true)}
    >
      {/* Video element */}
      <div className="relative flex-1 flex items-center justify-center">
        <video
          ref={videoRef}
          className="w-full h-full"
          playsInline
          onClick={(e) => {
            e.stopPropagation();
            controls.togglePlay();
          }}
        />
        
        {/* Loading indicator */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="max-w-md p-6 bg-card rounded-lg shadow-lg text-center">
              <h3 className="text-xl font-bold mb-2">Oynatma Hatası</h3>
              <p className="mb-4">{error}</p>
              <Button onClick={closePlayer}>Kapat</Button>
            </div>
          </div>
        )}
        
        {/* Title bar */}
        <div
          className={cn(
            'absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity',
            showControls ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={closePlayer}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h2 className="ml-2 text-white text-lg font-medium truncate">
              {contentTitle || 'Video Player'}
            </h2>
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={closePlayer}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Controls overlay */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity',
            showControls ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Progress bar (only for VOD) */}
          {contentType !== 'live' && (
            <div className="mb-4">
              <div className="relative h-1 bg-white/30 rounded-full">
                <div
                  className="absolute h-full bg-primary rounded-full"
                  style={{
                    width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                  }}
                />
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => controls.seek(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs text-white/80 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}
          
          {/* Control buttons */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={controls.togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>
            
            {contentType !== 'live' && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => controls.seek(Math.max(0, currentTime - 10))}
                >
                  <SkipBack className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => controls.seek(currentTime + 10)}
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </>
            )}
            
            <div className="flex items-center ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={controls.toggleMute}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              
              <div className="w-24 mx-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => controls.setVolume(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="ml-auto flex items-center">
              {qualities.length > 0 && (
                <div className="relative mr-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 text-xs"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="h-5 w-5 mr-1" />
                    {currentQuality === 'auto' ? 'Otomatik' : `${currentQuality}p`}
                  </Button>
                  
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 p-2 bg-black/90 rounded shadow-lg">
                      <div className="text-white text-xs font-medium mb-1 px-2">
                        Kalite
                      </div>
                      <div className="space-y-1">
                        <button
                          className={cn(
                            'block w-full text-left px-3 py-1 text-sm rounded',
                            currentQuality === 'auto'
                              ? 'bg-primary text-primary-foreground'
                              : 'text-white hover:bg-white/10'
                          )}
                          onClick={() => {
                            controls.changeQuality('auto');
                            setShowSettings(false);
                          }}
                        >
                          Otomatik
                        </button>
                        {qualities.map((quality) => (
                          <button
                            key={quality}
                            className={cn(
                              'block w-full text-left px-3 py-1 text-sm rounded',
                              currentQuality === quality
                                ? 'bg-primary text-primary-foreground'
                                : 'text-white hover:bg-white/10'
                            )}
                            onClick={() => {
                              controls.changeQuality(quality);
                              setShowSettings(false);
                            }}
                          >
                            {quality}p
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}