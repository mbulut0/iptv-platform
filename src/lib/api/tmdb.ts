import axios from 'axios';
import { TMDBMovie, TMDBSeries, TMDBCredits } from '@/types/content';

// TMDB API configuration
const TMDB_API_KEY = '42125c682636b68d10d70b487c692685';
const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MjEyNWM2ODI2MzZiNjhkMTBkNzBiNDg3YzY5MjY4NSIsIm5iZiI6MS42NDM4MjA2NjA2OTUwMDAyZSs5LCJzdWIiOiI2MWZhYjY3NGI3YWJiNTAwNjY1YWQ4MzAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.e06dzH5trScMiz7obFbCFip5dO1XQp-bUC3lecJ8sxU';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Create axios instance for TMDB API
const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Get image URL with specified size
export const getImageUrl = (path: string | null, size: string = 'w500'): string | null => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Search for movies
export const searchMovies = async (query: string, year?: number): Promise<TMDBMovie[]> => {
  try {
    const params: Record<string, string | number> = {
      query,
      include_adult: false,
      language: 'tr-TR'
    };
    
    if (year) {
      params.year = year;
    }
    
    const response = await tmdbClient.get<{ results: TMDBMovie[] }>('/search/movie', { params });
    return response.data.results;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw new Error('Failed to search movies');
  }
};

// Search for TV series
export const searchTVSeries = async (query: string, firstAirYear?: number): Promise<TMDBSeries[]> => {
  try {
    const params: Record<string, string | number> = {
      query,
      include_adult: false,
      language: 'tr-TR'
    };
    
    if (firstAirYear) {
      params.first_air_date_year = firstAirYear;
    }
    
    const response = await tmdbClient.get<{ results: TMDBSeries[] }>('/search/tv', { params });
    return response.data.results;
  } catch (error) {
    console.error('Error searching TV series:', error);
    throw new Error('Failed to search TV series');
  }
};

// Get movie details
export const getMovieDetails = async (movieId: number): Promise<TMDBMovie> => {
  try {
    const response = await tmdbClient.get<TMDBMovie>(`/movie/${movieId}`, {
      params: {
        language: 'tr-TR',
        append_to_response: 'videos,images'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw new Error('Failed to fetch movie details');
  }
};

// Get movie credits (cast and crew)
export const getMovieCredits = async (movieId: number): Promise<TMDBCredits> => {
  try {
    const response = await tmdbClient.get<TMDBCredits>(`/movie/${movieId}/credits`, {
      params: {
        language: 'tr-TR'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movie credits:', error);
    throw new Error('Failed to fetch movie credits');
  }
};

// Get similar movies
export const getSimilarMovies = async (movieId: number): Promise<TMDBMovie[]> => {
  try {
    const response = await tmdbClient.get<{ results: TMDBMovie[] }>(`/movie/${movieId}/similar`, {
      params: {
        language: 'tr-TR',
        page: 1
      }
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    throw new Error('Failed to fetch similar movies');
  }
};

// Get TV series details
export const getTVSeriesDetails = async (seriesId: number): Promise<TMDBSeries> => {
  try {
    const response = await tmdbClient.get<TMDBSeries>(`/tv/${seriesId}`, {
      params: {
        language: 'tr-TR',
        append_to_response: 'videos,images'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching TV series details:', error);
    throw new Error('Failed to fetch TV series details');
  }
};

// Get TV series credits (cast and crew)
export const getTVSeriesCredits = async (seriesId: number): Promise<TMDBCredits> => {
  try {
    const response = await tmdbClient.get<TMDBCredits>(`/tv/${seriesId}/credits`, {
      params: {
        language: 'tr-TR'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching TV series credits:', error);
    throw new Error('Failed to fetch TV series credits');
  }
};

// Get similar TV series
export const getSimilarTVSeries = async (seriesId: number): Promise<TMDBSeries[]> => {
  try {
    const response = await tmdbClient.get<{ results: TMDBSeries[] }>(`/tv/${seriesId}/similar`, {
      params: {
        language: 'tr-TR',
        page: 1
      }
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching similar TV series:', error);
    throw new Error('Failed to fetch similar TV series');
  }
};

// Get season details
export const getSeasonDetails = async (seriesId: number, seasonNumber: number) => {
  try {
    const response = await tmdbClient.get(`/tv/${seriesId}/season/${seasonNumber}`, {
      params: {
        language: 'tr-TR'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching season details:', error);
    throw new Error('Failed to fetch season details');
  }
};