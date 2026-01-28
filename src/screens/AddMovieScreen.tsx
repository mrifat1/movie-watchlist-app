import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { moviesService } from '../api/movies';

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller',
];

export const AddMovieScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [overview, setOverview] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [runtime, setRuntime] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSubmit = async () => {
    if (!title || !releaseYear) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    const year = parseInt(releaseYear);
    if (isNaN(year) || year < 1800 || year > new Date().getFullYear() + 5) {
      Alert.alert('Error', 'Please enter a valid release year');
      return;
    }

    const runtimeNum = runtime ? parseInt(runtime) : undefined;
    if (runtime && (isNaN(runtimeNum!) || runtimeNum! <= 0)) {
      Alert.alert('Error', 'Please enter a valid runtime');
      return;
    }

    setLoading(true);
    try {
      await moviesService.createMovie({
        title,
        overview: overview || undefined,
        releaseYear: year,
        genres: selectedGenres,
        runtime: runtimeNum,
        posterUrl: posterUrl || undefined,
      });
      Alert.alert('Success', 'Movie added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to add movie'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Input
          label="Title *"
          placeholder="Enter movie title"
          value={title}
          onChangeText={setTitle}
        />

        <Input
          label="Overview"
          placeholder="Enter movie overview"
          value={overview}
          onChangeText={setOverview}
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />

        <Input
          label="Release Year *"
          placeholder="e.g., 2024"
          value={releaseYear}
          onChangeText={setReleaseYear}
          keyboardType="numeric"
        />

        <Input
          label="Runtime (minutes)"
          placeholder="e.g., 120"
          value={runtime}
          onChangeText={setRuntime}
          keyboardType="numeric"
        />

        <Input
          label="Poster URL"
          placeholder="Enter poster image URL"
          value={posterUrl}
          onChangeText={setPosterUrl}
          autoCapitalize="none"
        />

        <View style={styles.genresContainer}>
          <Text style={styles.label}>Genres</Text>
          <View style={styles.genresGrid}>
            {GENRE_OPTIONS.map(genre => (
              <Button
                key={genre}
                title={genre}
                onPress={() => toggleGenre(genre)}
                variant={selectedGenres.includes(genre) ? 'primary' : 'secondary'}
              />
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Add Movie"
            onPress={handleSubmit}
            loading={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  genresContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  genresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
