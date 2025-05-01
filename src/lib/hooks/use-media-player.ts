import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { usePlayerStore } from '@/lib/store/player-store';
import { usePreferencesStore } from '@/lib/store/preferences-store';
import { WatchHistoryItem } from '@/types/content';

export function useMediaPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const {
    contentId,
    contentType,
    contentTitle,
    contentPoster,
    streamUrl,
    isPlaying,
    volume,
    isMuted,
    playbackRate,
    currentTime,
    duration,
    setPlaybackState,
    closePlayer,
  } = usePlayerStore();
  
  const { addToWatchHistory, updateWatchProgress } = usePreferencesStore();
  
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qualities, setQualities] = useState<{ height: number; bitrate: number; url: string }[]>([]);
  const [currentQuality, setCurrentQuality] = useState<string>('auto');
  
  // Initialize HLS.js when stream URL changes
  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;
    
    const video = videoRef.current;
    
    // Clean up previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    setError(null);
    
    // Check if the URL is an HLS stream
    if (streamUrl.includes('.m3u8')) {
      // Check if HLS.js is supported
      if (Hls.isSupported()) {
        const hls = new Hls({
          maxBufferLength: 30,
          maxMaxBufferLength: 600,
          enableWorker: true,
        });
        
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          // Extract available qualities
          if (data.levels.length > 1) {
            const availableQualities = data.levels.map((level) => ({
              height: level.height,
              bitrate: level.bitrate,
              url: level.url,
            }));
            setQualities(availableQualities);
          }
          
          // Auto play when manifest is loaded
          if (isPlaying) {
            video.play().catch((err) => {
              console.error('Error auto-playing video:', err);
            });
          }
        });
        
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('HLS network error', data);
                setError('Ağ hatası: Video yüklenemedi. Lütfen bağlantınızı kontrol edin.');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('HLS media error', data);
                setError('Medya hatası: Video oynatılamıyor.');
                hls.recoverMediaError();
                break;
              default:
                console.error('HLS fatal error', data);
                setError('Video oynatılırken bir hata oluştu.');
                hls.destroy();
                break;
            }
          }
        });
        
        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          if (isPlaying) {
            video.play().catch((err) => {
              console.error('Error auto-playing video:', err);
            });
          }
        });
      } else {
        setError('Bu tarayıcı HLS video formatını desteklemiyor.');
      }
    } else {
      // Regular video URL
      video.src = streamUrl;
      if (isPlaying) {
        video.play().catch((err) => {
          console.error('Error auto-playing video:', err);
          setError('Video oynatılırken bir hata oluştu.');
        });
      }
    }
    
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      if (video) {
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [streamUrl, isPlaying]);
  
  // Handle play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.play().catch((err) => {
        console.error('Error playing video:', err);
      });
    } else {
      video.pause();
    }
  }, [isPlaying]);
  
  // Handle volume and mute changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = volume;
    video.muted = isMuted;
  }, [volume, isMuted]);
  
  // Handle playback rate changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    video.playbackRate = playbackRate;
  }, [playbackRate]);
  
  // Handle seeking
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !duration) return;
    
    // Only seek if the difference is significant (more than 1 second)
    if (Math.abs(video.currentTime - currentTime) > 1) {
      video.currentTime = currentTime;
    }
  }, [currentTime, duration]);
  
  // Set up event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setPlaybackState({
        currentTime: video.currentTime,
        duration: video.duration || 0,
      });
      
      // Update watch progress for movies and episodes
      if (contentId && (contentType === 'movie' || contentType === 'episode') && video.duration > 0) {
        const progress = Math.floor((video.currentTime / video.duration) * 100);
        
        // Only update every 5 seconds to avoid excessive updates
        if (Math.floor(video.currentTime) % 5 === 0) {
          updateWatchProgress(contentId, progress);
        }
      }
    };
    
    const handleLoadStart = () => {
      setIsBuffering(true);
    };
    
    const handleCanPlay = () => {
      setIsBuffering(false);
    };
    
    const handleWaiting = () => {
      setIsBuffering(true);
    };
    
    const handlePlaying = () => {
      setIsBuffering(false);
      setPlaybackState({ isPlaying: true });
    };
    
    const handlePause = () => {
      setPlaybackState({ isPlaying: false });
    };
    
    const handleEnded = () => {
      setPlaybackState({ isPlaying: false, currentTime: 0 });
      
      // Add to watch history with 100% progress when finished
      if (contentId && (contentType === 'movie' || contentType === 'episode')) {
        const historyItem: WatchHistoryItem = {
          id: contentId,
          type: contentType,
          name: contentTitle || '',
          poster: contentPoster || '',
          progress: 100,
          duration: video.duration,
          lastWatched: new Date().toISOString(),
        };
        
        addToWatchHistory(historyItem);
      }
    };
    
    const handleVolumeChange = () => {
      setPlaybackState({
        volume: video.volume,
        isMuted: video.muted,
      });
    };
    
    const handleError = () => {
      setError('Video oynatılırken bir hata oluştu.');
    };
    
    // Add event listeners
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('error', handleError);
    
    // Add to watch history when starting to watch
    if (contentId && (contentType === 'movie' || contentType === 'episode')) {
      const historyItem: WatchHistoryItem = {
        id: contentId,
        type: contentType,
        name: contentTitle || '',
        poster: contentPoster || '',
        progress: 0,
        duration: video.duration || 0,
        lastWatched: new Date().toISOString(),
      };
      
      addToWatchHistory(historyItem);
    }
    
    // Clean up event listeners
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('error', handleError);
    };
  }, [
    contentId,
    contentType,
    contentTitle,
    contentPoster,
    setPlaybackState,
    addToWatchHistory,
    updateWatchProgress,
  ]);
  
  // Change quality
  const changeQuality = (qualityLevel: string) => {
    if (!hlsRef.current || qualities.length === 0) return;
    
    setCurrentQuality(qualityLevel);
    
    if (qualityLevel === 'auto') {
      hlsRef.current.currentLevel = -1; // Auto quality
    } else {
      // Find the index of the selected quality
      const selectedQuality = qualities.find(
        (q) => q.height.toString() === qualityLevel
      );
      
      if (selectedQuality) {
        const levelIndex = qualities.indexOf(selectedQuality);
        hlsRef.current.currentLevel = levelIndex;
      }
    }
  };
  
  // Player controls
  const controls = {
    play: () => setPlaybackState({ isPlaying: true }),
    pause: () => setPlaybackState({ isPlaying: false }),
    togglePlay: () => setPlaybackState({ isPlaying: !isPlaying }),
    seek: (time: number) => setPlaybackState({ currentTime: time }),
    setVolume: (vol: number) => setPlaybackState({ volume: vol }),
    mute: () => setPlaybackState({ isMuted: true }),
    unmute: () => setPlaybackState({ isMuted: false }),
    toggleMute: () => setPlaybackState({ isMuted: !isMuted }),
    setPlaybackRate: (rate: number) => setPlaybackState({ playbackRate: rate }),
    changeQuality,
    close: closePlayer,
  };
  
  return {
    videoRef,
    isBuffering,
    error,
    qualities: qualities.map((q) => q.height.toString()),
    currentQuality,
    controls,
  };
}