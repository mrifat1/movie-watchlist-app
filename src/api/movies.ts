import api from './config';
import { Movie, CreateMovieRequest, MovieListResponse, SingleMovieResponse } from '../types';

export const moviesService = {
  async getAllMovies(): Promise<Movie[]> {
    const response = await api.get<MovieListResponse>('/movies/getAllMovies');
    return response.data.data;
  },
  async getMovies(search?: string): Promise<Movie[]> {
    const params = search ? { search } : {};
    const response = await api.get<MovieListResponse>('/movies', { params });
    return response.data.data;
  },

  async getMovie(id: string): Promise<Movie> {
    const response = await api.get<SingleMovieResponse>(`/movies/getMovie/${id}`);
    return response.data.data;
  },

  async createMovie(movieData: CreateMovieRequest): Promise<Movie> {
    const response = await api.post<Movie>('/movies', movieData);
    return response.data;
  },

  async updateMovie(id: string, movieData: Partial<CreateMovieRequest>): Promise<Movie> {
    const response = await api.put<Movie>(`/movies/${id}`, movieData);
    return response.data;
  },

  async deleteMovie(id: string): Promise<void> {
    await api.delete(`/movies/${id}`);
  },
};
