import { create } from 'zustand';
import { 
  LiveCategory, 
  LiveStream, 
  MovieCategory, 
  Movie, 
  SeriesCategory, 
  Series, 
  EPGData 
} from '@/types/content';

interface ContentState {
  // Live TV
  liveCategories: LiveCategory[];
  liveStreams: Record<string, LiveStream[]>; // categoryId -> streams
  currentLiveCategory: string | null;
  
  // Movies
  movieCategories: MovieCategory[];
  movies: Record<string, Movie[]>; // categoryId -> movies
  currentMovieCategory: string | null;
  
  // Series
  seriesCategories: SeriesCategory[];
  seriesList: Record<string, Series[]>; // categoryId -> series
  currentSeriesCategory: string | null;
  
  // EPG
  epgData: EPGData;
  
  // Actions
  setLiveCategories: (categories: LiveCategory[]) => void;
  setLiveStreams: (categoryId: string, streams: LiveStream[]) => void;
  setCurrentLiveCategory: (categoryId: string | null) => void;
  
  setMovieCategories: (categories: MovieCategory[]) => void;
  setMovies: (categoryId: string, movies: Movie[]) => void;
  setCurrentMovieCategory: (categoryId: string | null) => void;
  
  setSeriesCategories: (categories: SeriesCategory[]) => void;
  setSeries: (categoryId: string, series: Series[]) => void;
  setCurrentSeriesCategory: (categoryId: string | null) => void;
  
  setEPGData: (data: EPGData) => void;
  clearContent: () => void;
}

export const useContentStore = create<ContentState>((set) => ({
  // Live TV
  liveCategories: [],
  liveStreams: {},
  currentLiveCategory: null,
  
  // Movies
  movieCategories: [],
  movies: {},
  currentMovieCategory: null,
  
  // Series
  seriesCategories: [],
  seriesList: {},
  currentSeriesCategory: null,
  
  // EPG
  epgData: {},
  
  // Actions
  setLiveCategories: (categories) => set({ liveCategories: categories }),
  setLiveStreams: (categoryId, streams) => 
    set((state) => ({ 
      liveStreams: { 
        ...state.liveStreams, 
        [categoryId]: streams 
      } 
    })),
  setCurrentLiveCategory: (categoryId) => set({ currentLiveCategory: categoryId }),
  
  setMovieCategories: (categories) => set({ movieCategories: categories }),
  setMovies: (categoryId, movies) => 
    set((state) => ({ 
      movies: { 
        ...state.movies, 
        [categoryId]: movies 
      } 
    })),
  setCurrentMovieCategory: (categoryId) => set({ currentMovieCategory: categoryId }),
  
  setSeriesCategories: (categories) => set({ seriesCategories: categories }),
  setSeries: (categoryId, series) => 
    set((state) => ({ 
      seriesList: { 
        ...state.seriesList, 
        [categoryId]: series 
      } 
    })),
  setCurrentSeriesCategory: (categoryId) => set({ currentSeriesCategory: categoryId }),
  
  setEPGData: (data) => set({ epgData: data }),
  clearContent: () => set({ 
    liveCategories: [],
    liveStreams: {},
    currentLiveCategory: null,
    movieCategories: [],
    movies: {},
    currentMovieCategory: null,
    seriesCategories: [],
    seriesList: {},
    currentSeriesCategory: null,
    epgData: {}
  }),
}));