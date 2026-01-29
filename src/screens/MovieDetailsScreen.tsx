import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { moviesService } from "../api/movies";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const POSTER_HEIGHT = SCREEN_WIDTH * 1.5;

// Define your navigation types
type RootStackParamList = {
  MovieDetails: { movieId: string };
  // ... other screens
};

type Props = NativeStackScreenProps<RootStackParamList, "MovieDetails">;

interface Movie {
  id: string;
  title: string;
  overview: string;
  releaseYear: number;
  genres: string[];
  runtime: number;
  posterUrl: string;
}

export default function MovieDetailsScreen({ route, navigation }: Props) {
  const { movieId } = route.params;
  console.log("movieId", movieId);

  const insets = useSafeAreaInsets();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMovieDetails();
    // checkWatchlistStatus();
  }, [movieId]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const response = await moviesService.getMovie(movieId);
      console.log("response", response);

      setMovie(response);
    } catch (err) {
      console.log("responseerr", err);

      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  //   const checkWatchlistStatus = async () => {
  //     try {
  //       // Check if movie is in watchlist
  //       const response = await fetch(`YOUR_API_URL/watchlist/check/${movieId}`);
  //       const data = await response.json();
  //       setIsInWatchlist(data.isInWatchlist);
  //     } catch (err) {
  //       console.error("Error checking watchlist:", err);
  //     }
  //   };

  const toggleWatchlist = async () => {
    try {
      if (isInWatchlist) {
        await fetch(`YOUR_API_URL/watchlist/${movieId}`, {
          method: "DELETE",
        });
        setIsInWatchlist(false);
      } else {
        await fetch(`YOUR_API_URL/watchlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movieId }),
        });
        setIsInWatchlist(true);
      }
    } catch (err) {
      console.error("Error toggling watchlist:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#999" />
        <Text style={styles.errorText}>{error || "Movie not found"}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchMovieDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Poster Image */}
        <View style={styles.posterContainer}>
          <Image
            source={{ uri: movie.posterUrl }}
            style={styles.poster}
            resizeMode="cover"
          />

          {/* Back Button */}
          <TouchableOpacity
            style={[styles.backButton, { top: insets.top + 10 }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Watchlist Button */}
          <TouchableOpacity
            style={[styles.watchlistButton, { top: insets.top + 10 }]}
            onPress={toggleWatchlist}
          >
            <Ionicons
              name={isInWatchlist ? "bookmark" : "bookmark-outline"}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          {/* Gradient Overlay */}
          <View style={styles.gradientOverlay} />
        </View>

        {/* Movie Info */}
        <View style={styles.infoContainer}>
          {/* Title */}
          <Text style={styles.title}>{movie.title}</Text>

          {/* Meta Info */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{movie.releaseYear}</Text>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{movie.runtime} min</Text>
            </View>
          </View>

          {/* Genres */}
          <View style={styles.genresContainer}>
            {movie.genres.map((genre, index) => (
              <View key={index} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>

          {/* Overview */}
          <View style={styles.overviewContainer}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.overview}>{movie.overview}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  posterContainer: {
    width: SCREEN_WIDTH,
    height: POSTER_HEIGHT * 0.6,
    position: "relative",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    left: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  watchlistButton: {
    position: "absolute",
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "transparent",
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#999",
    marginHorizontal: 12,
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  genreTag: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  genreText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  overviewContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  overview: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
