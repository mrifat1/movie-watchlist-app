// Types matching your Prisma schema

export enum WatchlistStatus {
  PLANNED = 'PLANNED',
  WATCHING = 'WATCHING',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Movie {
  id: string;
  title: string;
  overview?: string;
  releaseYear: number;
  genres: string[];
  runtime?: number;
  posterUrl?: string;
  createdBy: string;
  createdAt: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  movieId: string;
  status: WatchlistStatus;
  rating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  movie?: Movie;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface CreateMovieRequest {
  title: string;
  overview?: string;
  releaseYear: number;
  genres: string[];
  runtime?: number;
  posterUrl?: string;
}

export interface CreateWatchlistItemRequest {
  movieId: string;
  status?: WatchlistStatus;
  rating?: number;
  notes?: string;
}

export interface UpdateWatchlistItemRequest {
  status?: WatchlistStatus;
  rating?: number;
  notes?: string;
}
