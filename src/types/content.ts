// Common types for content
export interface Category {
  category_id: string;
  category_name: string;
  parent_id: number;
}

// Live TV types
export interface LiveCategory extends Category {}

export interface LiveStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  epg_channel_id: string;
  added: string;
  category_id: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
}

// Movie types
export interface MovieCategory extends Category {}

export interface Movie {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  added: string;
  category_id: string;
  container_extension: string;
  custom_sid: string;
  direct_source: string;
  plot: string;
  rating: string;
  rating_5based: number;
  releasedate: string;
  year: string;
  tmdb_id?: string;
  backdrop_path?: string;
  duration_secs?: number;
  duration?: string;
  director?: string;
  actors?: string;
  cast?: string;
  genre?: string;
  country?: string;
}

// Series types
export interface SeriesCategory extends Category {}

export interface Series {
  num: number;
  name: string;
  series_id: number;
  cover: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  releaseDate: string;
  last_modified: string;
  rating: string;
  rating_5based: number;
  backdrop_path: string;
  youtube_trailer: string;
  episode_run_time: string;
  category_id: string;
  tmdb_id?: string;
}

export interface Season {
  air_date: string;
  episode_count: string;
  id: string;
  name: string;
  overview: string;
  season_number: string;
  cover: string;
  cover_big: string;
}

export interface Episode {
  id: string;
  episode_num: string;
  title: string;
  container_extension: string;
  info: {
    movie_image: string;
    plot: string;
    releasedate: string;
    duration_secs: string;
    duration: string;
    tmdb_id: string;
    rating: string;
    season: string;
  };
  added: string;
  season: string;
  direct_source: string;
}

// EPG types
export interface EPGProgram {
  id: string;
  start: string; // ISO date string
  end: string; // ISO date string
  title: string;
  description: string;
  category: string;
  start_timestamp: number;
  stop_timestamp: number;
}

// Alias for EPGProgram
export type EpgItem = EPGProgram;

export interface EPGData {
  [channelId: string]: EPGProgram[];
}

// TMDB types
export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  runtime: number;
  genres: { id: number; name: string }[];
}

export interface TMDBSeries {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  episode_run_time: number[];
  genres: { id: number; name: string }[];
}

export interface TMDBCredits {
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string;
    order: number;
  }[];
  crew: {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string;
  }[];
}

// Playback types
export interface PlaybackState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  quality: string;
  playbackRate: number;
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  parentalControlEnabled: boolean;
  parentalControlPin: string;
  autoPlayNext: boolean;
  defaultSubtitleLanguage: string;
  defaultAudioLanguage: string;
  bufferSize: number;
}

// Favorites and watch history
export interface FavoriteItem {
  id: string;
  type: 'live' | 'movie' | 'series';
  name: string;
  poster: string;
  addedAt: string;
}

export interface WatchHistoryItem {
  id: string;
  type: 'movie' | 'episode';
  name: string;
  poster: string;
  progress: number; // 0-100
  duration: number;
  lastWatched: string;
  seasonNumber?: number;
  episodeNumber?: number;
  seriesId?: string;
  seriesName?: string;
}