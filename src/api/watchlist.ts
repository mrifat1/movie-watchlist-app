import api from './config';
import { WatchlistItem, CreateWatchlistItemRequest, UpdateWatchlistItemRequest } from '../types';

export const watchlistService = {
  async getWatchlist(): Promise<WatchlistItem[]> {
    const response = await api.get<WatchlistItem[]>('/watchlist');
    return response.data;
  },

  async getWatchlistItem(id: string): Promise<WatchlistItem> {
    const response = await api.get<WatchlistItem>(`/watchlist/${id}`);
    return response.data;
  },

  async addToWatchlist(data: CreateWatchlistItemRequest): Promise<WatchlistItem> {
    const response = await api.post<WatchlistItem>('/watchlist', data);
    return response.data;
  },

  async updateWatchlistItem(
    id: string,
    data: UpdateWatchlistItemRequest
  ): Promise<WatchlistItem> {
    const response = await api.put<WatchlistItem>(`/watchlist/${id}`, data);
    return response.data;
  },

  async removeFromWatchlist(id: string): Promise<void> {
    await api.delete(`/watchlist/${id}`);
  },

  async getWatchlistByStatus(status: string): Promise<WatchlistItem[]> {
    const response = await api.get<WatchlistItem[]>('/watchlist', {
      params: { status },
    });
    return response.data;
  },
};
