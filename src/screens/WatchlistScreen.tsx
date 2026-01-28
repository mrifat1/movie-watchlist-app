import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { WatchlistCard } from '../components/WatchlistCard';
import { watchlistService } from '../api/watchlist';
import { WatchlistItem, WatchlistStatus } from '../types';

const STATUS_FILTERS = [
  { label: 'All', value: null },
  { label: 'Planned', value: WatchlistStatus.PLANNED },
  { label: 'Watching', value: WatchlistStatus.WATCHING },
  { label: 'Completed', value: WatchlistStatus.COMPLETED },
  { label: 'Dropped', value: WatchlistStatus.DROPPED },
];

export const WatchlistScreen = ({ navigation }: any) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [filteredWatchlist, setFilteredWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<WatchlistStatus | null>(null);

  useEffect(() => {
    loadWatchlist();
  }, []);

  useEffect(() => {
    filterWatchlist();
  }, [watchlist, selectedFilter]);

  const loadWatchlist = async () => {
    try {
      const data = await watchlistService.getWatchlist();
      setWatchlist(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load watchlist');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterWatchlist = () => {
    if (selectedFilter === null) {
      setFilteredWatchlist(watchlist);
    } else {
      setFilteredWatchlist(watchlist.filter(item => item.status === selectedFilter));
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadWatchlist();
  }, []);

  const renderItem = ({ item }: { item: WatchlistItem }) => (
    <WatchlistCard
      item={item}
      onPress={() => navigation.navigate('WatchlistDetail', { itemId: item.id })}
    />
  );

  const renderFilterButton = (filter: { label: string; value: WatchlistStatus | null }) => (
    <TouchableOpacity
      key={filter.label}
      style={[
        styles.filterButton,
        selectedFilter === filter.value && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(filter.value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter.value && styles.filterButtonTextActive,
        ]}
      >
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {STATUS_FILTERS.map(renderFilterButton)}
      </View>

      <FlatList
        data={filteredWatchlist}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {selectedFilter
                ? `No ${selectedFilter.toLowerCase()} items`
                : 'Your watchlist is empty'}
            </Text>
            <Text style={styles.emptySubtext}>
              Add movies from the Movies tab
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
});
