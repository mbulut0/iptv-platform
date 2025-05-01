import axios from 'axios';
import { 
  AuthResponse, 
  XtreamCredentials 
} from '@/types/auth';
import { 
  LiveCategory, 
  LiveStream, 
  MovieCategory, 
  Movie, 
  SeriesCategory, 
  Series, 
  Season, 
  Episode, 
  EPGData 
} from '@/types/content';

// Create axios instance for Xtream API
const createXtreamClient = (credentials: XtreamCredentials) => {
  const { server, username, password } = credentials;
  
  // Ensure server URL is properly formatted
  const baseURL = server.endsWith('/') ? server : `${server}/`;
  
  return axios.create({
    baseURL,
    params: {
      username,
      password
    }
  });
};

// Authentication
export const authenticate = async (credentials: XtreamCredentials): Promise<AuthResponse> => {
  try {
    const { server, username, password } = credentials;
    // Ensure server URL is properly formatted
    const baseURL = server.endsWith('/') ? server.slice(0, -1) : server;
    
    // Direct API call for authentication
    const response = await axios.get<AuthResponse>(`${baseURL}/player_api.php`, {
      params: {
        username,
        password
      }
    });
    
    console.log('Auth response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('Failed to authenticate with Xtream server');
  }
};

// Live TV
export const getLiveCategories = async (credentials: XtreamCredentials): Promise<LiveCategory[]> => {
  try {
    const client = createXtreamClient(credentials);
    const response = await client.get<LiveCategory[]>('player_api.php', {
      params: {
        action: 'get_live_categories'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching live categories:', error);
    throw new Error('Failed to fetch live TV categories');
  }
};

export const getLiveStreams = async (
  credentials: XtreamCredentials, 
  categoryId?: string
): Promise<LiveStream[]> => {
  try {
    const client = createXtreamClient(credentials);
    const params: Record<string, string> = {
      action: 'get_live_streams'
    };
    
    if (categoryId) {
      params.category_id = categoryId;
    }
    
    const response = await client.get<LiveStream[]>('player_api.php', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching live streams:', error);
    throw new Error('Failed to fetch live streams');
  }
};

export const getLiveStreamUrl = (
  credentials: XtreamCredentials, 
  streamId: number
): string => {
  const { server, username, password } = credentials;
  const baseURL = server.endsWith('/') ? server.slice(0, -1) : server;
  return `${baseURL}/live/${username}/${password}/${streamId}.m3u8`;
};

// Movies
export const getMovieCategories = async (credentials: XtreamCredentials): Promise<MovieCategory[]> => {
  try {
    const client = createXtreamClient(credentials);
    const response = await client.get<MovieCategory[]>('player_api.php', {
      params: {
        action: 'get_vod_categories'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movie categories:', error);
    throw new Error('Failed to fetch movie categories');
  }
};

// Alias for getVodCategories
export const getVodCategories = getMovieCategories;

export const getMovies = async (
  credentials: XtreamCredentials, 
  categoryId?: string
): Promise<Movie[]> => {
  try {
    const client = createXtreamClient(credentials);
    const params: Record<string, string> = {
      action: 'get_vod_streams'
    };
    
    if (categoryId) {
      params.category_id = categoryId;
    }
    
    const response = await client.get<Movie[]>('player_api.php', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw new Error('Failed to fetch movies');
  }
};

// Alias for getVodStreams
export const getVodStreams = getMovies;

export const getMovieInfo = async (
  credentials: XtreamCredentials, 
  movieId: number
): Promise<Movie> => {
  try {
    const client = createXtreamClient(credentials);
    const response = await client.get<{ info: Movie }>('player_api.php', {
      params: {
        action: 'get_vod_info',
        vod_id: movieId
      }
    });
    return response.data.info;
  } catch (error) {
    console.error('Error fetching movie info:', error);
    throw new Error('Failed to fetch movie information');
  }
};

// Alias for getVodInfo
export const getVodInfo = getMovieInfo;

export const getMovieUrl = (
  credentials: XtreamCredentials, 
  movieId: number,
  extension: string = 'mp4'
): string => {
  const { server, username, password } = credentials;
  const baseURL = server.endsWith('/') ? server.slice(0, -1) : server;
  return `${baseURL}/movie/${username}/${password}/${movieId}.${extension}`;
};

// Series
export const getSeriesCategories = async (credentials: XtreamCredentials): Promise<SeriesCategory[]> => {
  try {
    const client = createXtreamClient(credentials);
    const response = await client.get<SeriesCategory[]>('player_api.php', {
      params: {
        action: 'get_series_categories'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching series categories:', error);
    throw new Error('Failed to fetch series categories');
  }
};

export const getAllSeries = async (
  credentials: XtreamCredentials, 
  categoryId?: string
): Promise<Series[]> => {
  try {
    const client = createXtreamClient(credentials);
    const params: Record<string, string> = {
      action: 'get_series'
    };
    
    if (categoryId) {
      params.category_id = categoryId;
    }
    
    const response = await client.get<Series[]>('player_api.php', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching series:', error);
    throw new Error('Failed to fetch series');
  }
};

// Alias for getSeries
export const getSeries = getAllSeries;

export const getSeriesInfo = async (
  credentials: XtreamCredentials, 
  seriesId: number
): Promise<{ info: Series; episodes: Record<string, Episode[]> }> => {
  try {
    const client = createXtreamClient(credentials);
    const response = await client.get<{ info: Series; episodes: Record<string, Episode[]> }>('player_api.php', {
      params: {
        action: 'get_series_info',
        series_id: seriesId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching series info:', error);
    throw new Error('Failed to fetch series information');
  }
};

export const getEpisodeUrl = (
  credentials: XtreamCredentials, 
  episodeId: string,
  extension: string = 'mp4'
): string => {
  const { server, username, password } = credentials;
  const baseURL = server.endsWith('/') ? server.slice(0, -1) : server;
  return `${baseURL}/series/${username}/${password}/${episodeId}.${extension}`;
};

// EPG (Electronic Program Guide)
export const getEPG = async (
  credentials: XtreamCredentials,
  streamId?: string
): Promise<EPGData> => {
  try {
    const client = createXtreamClient(credentials);
    const params: Record<string, string> = {
      action: 'get_simple_data_table'
    };
    
    if (streamId) {
      params.stream_id = streamId;
    }
    
    const response = await client.get<EPGData>('player_api.php', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching EPG data:', error);
    throw new Error('Failed to fetch EPG data');
  }
};

// Short EPG for a specific channel
export const getShortEPG = async (
  credentials: XtreamCredentials,
  streamId: string,
  limit: number = 5
): Promise<EPGProgram[]> => {
  try {
    const client = createXtreamClient(credentials);
    const response = await client.get<{ epg_listings: EPGProgram[] }>('player_api.php', {
      params: {
        action: 'get_short_epg',
        stream_id: streamId,
        limit
      }
    });
    return response.data.epg_listings;
  } catch (error) {
    console.error('Error fetching short EPG:', error);
    throw new Error('Failed to fetch short EPG data');
  }
};

// Alias for getLiveStreamEpg
export const getLiveStreamEpg = getShortEPG;

// Helper function to check if credentials are valid
export const isValidXtreamUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') && !!urlObj.hostname;
  } catch (error) {
    return false;
  }
};