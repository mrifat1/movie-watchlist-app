import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { watchlistService } from '../api/watchlist';
import { WatchlistItem, WatchlistStatus } from '../types';

const STATUS_OPTIONS = [
  { label: 'Plan to Watch', value: WatchlistStatus.PLANNED },
  { label: 'Watching', value: WatchlistStatus.WATCHING },
  { label: 'Completed', value: WatchlistStatus.COMPLETED },
  { label: 'Dropped', value: WatchlistStatus.DROPPED },
];

export const WatchlistDetailScreen = ({ route, navigation }: any) => {
  const { itemId } = route.params;
  const [item, setItem] = useState<WatchlistItem | null>(null);
  const [status, setStatus] = useState<WatchlistStatus>(WatchlistStatus.PLANNED);
  const [rating, setRating] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadItem();
  }, []);

  const loadItem = async () => {
    try {
      const data = await watchlistService.getWatchlistItem(itemId);
      setItem(data);
      setStatus(data.status);
      setRating(data.rating?.toString() || '');
      setNotes(data.notes || '');
    } catch (error) {
      Alert.alert('Error', 'Failed to load item');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const ratingNum = rating ? parseInt(rating) : undefined;
    if (rating && (isNaN(ratingNum!) || ratingNum! < 1 || ratingNum! > 10)) {
      Alert.alert('Error', 'Rating must be between 1 and 10');
      return;
    }

    setSaving(true);
    try {
      await watchlistService.updateWatchlistItem(itemId, {
        status,
        rating: ratingNum,
        notes: notes || undefined,
      });
      Alert.alert('Success', 'Updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Remove from Watchlist',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await watchlistService.removeFromWatchlist(itemId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove item');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!item) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle}>{item.movie?.title}</Text>
        <Text style={styles.movieYear}>{item.movie?.releaseYear}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        {STATUS_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.statusOption,
              status === option.value && styles.statusOptionSelected,
            ]}
            onPress={() => setStatus(option.value)}
          >
            <View style={styles.statusOptionContent}>
              <Text
                style={[
                  styles.statusOptionText,
                  status === option.value && styles.statusOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
              {status === option.value && (
                <Ionicons name="checkmark" size={24} color="#007AFF" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Input
          label="Rating (1-10)"
          placeholder="Rate this movie"
          value={rating}
          onChangeText={setRating}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.section}>
        <Input
          label="Notes"
          placeholder="Add your thoughts..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={6}
          style={styles.textArea}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Save Changes" onPress={handleSave} loading={saving} />
        <View style={styles.spacer} />
        <Button title="Remove from Watchlist" onPress={handleDelete} variant="danger" />
      </View>
    </ScrollView>
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
  content: {
    padding: 20,
  },
  movieInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  movieTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  movieYear: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusOption: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statusOptionSelected: {
    borderColor: '#007AFF',
  },
  statusOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: 16,
    color: '#333',
  },
  statusOptionTextSelected: {
    fontWeight: '600',
    color: '#007AFF',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 20,
  },
  spacer: {
    height: 12,
  },
});
