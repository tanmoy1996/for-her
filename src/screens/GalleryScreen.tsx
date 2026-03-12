import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { ScreenContainer } from '../components/ScreenContainer';
import { useSharedAccount } from '../hooks/useSharedAccount';
import { getMemories, Memory } from '../services/firebase';

type GalleryItem = Pick<Memory, 'id' | 'imageUrl' | 'title' | 'date'>;

export function GalleryScreen() {
  const { session } = useSharedAccount();
  const { width } = useWindowDimensions();
  const columns = width >= 768 ? 3 : 2;
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const images = useMemo(
    () =>
      memories
        .filter((memory) => memory.imageUrl?.trim().length > 0)
        .map((memory) => ({
          id: memory.id,
          imageUrl: memory.imageUrl,
          title: memory.title,
          date: memory.date,
        })),
    [memories],
  );

  const itemSize = useMemo(() => {
    const horizontalPadding = 40;
    const gapTotal = (columns - 1) * 10;
    return Math.floor((width - horizontalPadding - gapTotal) / columns);
  }, [columns, width]);

  const fetchGallery = useCallback(async () => {
    if (!session?.relationshipId) {
      setMemories([]);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await getMemories(session.relationshipId);
      setMemories(data);
    } catch (error) {
      setErrorMessage('Could not load gallery images right now.');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      void fetchGallery();
    }, [fetchGallery]),
  );

  return (
    <ScreenContainer>
      <Text style={styles.title}>Gallery</Text>

      {isLoading ? <ActivityIndicator size="small" color="#d57291" /> : null}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {!isLoading && !errorMessage && images.length === 0 ? (
        <Text style={styles.emptyState}>No images yet. Add a memory with a photo.</Text>
      ) : null}

      <FlatList
        data={images}
        key={`${columns}`}
        numColumns={columns}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={columns > 1 ? styles.row : undefined}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelectedImage(item)}>
            <Image source={{ uri: item.imageUrl }} style={[styles.gridImage, { width: itemSize, height: itemSize }]} />
          </Pressable>
        )}
      />

      <Modal visible={!!selectedImage} animationType="fade" transparent onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.closeButton} onPress={() => setSelectedImage(null)}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>

          {selectedImage ? (
            <>
              <Image source={{ uri: selectedImage.imageUrl }} style={styles.fullImage} resizeMode="contain" />
              <Text style={styles.modalTitle}>{selectedImage.title}</Text>
              <Text style={styles.modalDate}>{selectedImage.date}</Text>
            </>
          ) : null}
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#503d47',
  },
  error: {
    color: '#ba4c6e',
  },
  emptyState: {
    color: '#7c6470',
  },
  gridContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridImage: {
    borderRadius: 16,
    backgroundColor: '#fdf3f7',
    borderWidth: 1,
    borderColor: '#f4dce8',
    shadowColor: '#d58ca8',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 10, 14, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 52,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    zIndex: 2,
  },
  closeText: {
    color: '#fff',
    fontWeight: '700',
  },
  fullImage: {
    width: '100%',
    height: '72%',
  },
  modalTitle: {
    color: '#fff',
    marginTop: 14,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalDate: {
    color: '#eac8d7',
    marginTop: 6,
    fontSize: 14,
    textAlign: 'center',
  },
});
