// components/AddToWatchlistModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  CreateWatchlistItemRequest,
  Movie,
  WatchlistStatus,
} from "../../types";

interface AddToWatchlistModalProps {
  visible: boolean;
  movie: Movie | null;
  onClose: () => void;
  onSubmit: (item: CreateWatchlistItemRequest) => void;
}

export const AddToWatchlistModal: React.FC<AddToWatchlistModalProps> = ({
  visible,
  movie,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<WatchlistStatus>(
    WatchlistStatus.PLANNED,
  );

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!visible) {
      setRating(null);
      setNotes("");
      setStatus(WatchlistStatus.PLANNED);
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!movie) return;

    const listItem: CreateWatchlistItemRequest = {
      movieId: movie.id,
      status: status,
      rating: rating || 0,
      notes: notes.trim() || "",
    };

    onSubmit(listItem);
  };

  const handleClose = () => {
    setRating(null);
    setNotes("");
    setStatus(WatchlistStatus.PLANNED);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            {/* Header - Fixed at top */}
            <View style={styles.header}>
              <Text style={styles.modalTitle}>Add to Watchlist</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Movie Title */}
            {movie && (
              <Text style={styles.movieTitle} numberOfLines={2}>
                {movie.title}
              </Text>
            )}

            {/* Scrollable Content */}
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Status Selection */}
              <View style={styles.section}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusContainer}>
                  {Object.values(WatchlistStatus).map((statusOption) => (
                    <TouchableOpacity
                      key={statusOption}
                      style={[
                        styles.statusButton,
                        status === statusOption && styles.statusButtonActive,
                      ]}
                      onPress={() => setStatus(statusOption)}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          status === statusOption &&
                            styles.statusButtonTextActive,
                        ]}
                      >
                        {statusOption.charAt(0) +
                          statusOption.slice(1).toLowerCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Rating */}
              <View style={styles.section}>
                <Text style={styles.label}>Rating (optional)</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={
                          rating && rating >= star ? "star" : "star-outline"
                        }
                        size={36}
                        color="#FFD700"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                {rating && (
                  <TouchableOpacity onPress={() => setRating(null)}>
                    <Text style={styles.clearRating}>Clear rating</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Notes */}
              <View style={styles.section}>
                <Text style={styles.label}>Notes (optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Add your thoughts about this movie..."
                  placeholderTextColor="#999"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text style={styles.characterCount}>{notes.length}/500</Text>
              </View>
            </ScrollView>

            {/* Buttons - Fixed at bottom */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalWrapper: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  movieTitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
    fontWeight: "500",
  },
  scrollView: {
    maxHeight: "70%",
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  statusButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  statusButtonTextActive: {
    color: "#fff",
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  clearRating: {
    color: "#007AFF",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    fontWeight: "500",
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    backgroundColor: "#f9f9f9",
    color: "#333",
  },
  characterCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#007AFF",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
