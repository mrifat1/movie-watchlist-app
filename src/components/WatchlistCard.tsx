import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { WatchlistItem, WatchlistStatus } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface WatchlistCardProps {
  item: WatchlistItem;
  onPress: () => void;
  onStatusChange?: (status: WatchlistStatus) => void;
}

const statusColors = {
  PLANNED: '#FFA500',
  WATCHING: '#007AFF',
  COMPLETED: '#28a745',
  DROPPED: '#dc3545',
};

const statusLabels = {
  PLANNED: 'Plan to Watch',
  WATCHING: 'Watching',
  COMPLETED: 'Completed',
  DROPPED: 'Dropped',
};

export const WatchlistCard: React.FC<WatchlistCardProps> = ({
  item,
  onPress,
  onStatusChange,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {item.movie?.posterUrl ? (
        <Image source={{ uri: item.movie.posterUrl }} style={styles.poster} />
      ) : (
        <View style={[styles.poster, styles.placeholderPoster]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {item.movie?.title}
        </Text>
        <Text style={styles.year}>{item.movie?.releaseYear}</Text>
        
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[item.status] },
          ]}
        >
          <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
        </View>

        {item.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{item.rating}/10</Text>
          </View>
        )}

        {item.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {item.notes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  placeholderPoster: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 12,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  year: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  notes: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});
