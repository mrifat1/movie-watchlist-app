import api from './config';
import { Movie, CreateMovieRequest } from '../types';

export const moviesService = {
  async getMovies(search?: string): Promise<Movie[]> {
    const params = search ? { search } : {};
    const response = await api.get<Movie[]>('/movies', { params });
    return response.data;
  },

  async getMovie(id: string): Promise<Movie> {
    const response = await api.get<Movie>(`/movies/${id}`);
    return response.data;
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
