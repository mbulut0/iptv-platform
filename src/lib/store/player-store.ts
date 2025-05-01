import { create } from 'zustand';
import { PlaybackState } from '@/types/content';

interface PlayerState extends PlaybackState {
  contentId: string | null;
  contentType: 'live' | 'movie' | 'episode' | null;
  contentTitle: string | null;
  contentPoster: string | null;
  streamUrl: string | null;
  isPlayerOpen: boolean;
  
  // Actions
  setPlaybackState: (state: Partial<PlaybackState>) => void;
  playContent: (params: {
    contentId: string;
    contentType: 'live' | 'movie' | 'episode';
    contentTitle: string;
    contentPoster?: string;
    streamUrl: string;
  }) => void;
  closePlayer: () => void;
  resetPlayer: () => void;
}

const initialPlaybackState: PlaybackState = {
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  volume: 1,
  isMuted: false,
  isFullscreen: false,
  quality: 'auto',
  playbackRate: 1,
};

export const usePlayerStore = create<PlayerState>((set) => ({
  ...initialPlaybackState,
  contentId: null,
  contentType: null,
  contentTitle: null,
  contentPoster: null,
  streamUrl: null,
  isPlayerOpen: false,
  
  // Actions
  setPlaybackState: (state) => set((prev) => ({ ...prev, ...state })),
  
  playContent: ({ contentId, contentType, contentTitle, contentPoster = null, streamUrl }) => 
    set({
      contentId,
      contentType,
      contentTitle,
      contentPoster,
      streamUrl,
      isPlayerOpen: true,
      isPlaying: true,
      currentTime: 0,
      duration: 0,
    }),
  
  closePlayer: () => set({ isPlayerOpen: false, isPlaying: false }),
  
  resetPlayer: () => set({
    ...initialPlaybackState,
    contentId: null,
    contentType: null,
    contentTitle: null,
    contentPoster: null,
    streamUrl: null,
    isPlayerOpen: false,
  }),
}));