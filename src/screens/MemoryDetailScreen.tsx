import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  useFonts,
} from '@expo-google-fonts/playfair-display';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { RootStackParamList } from '../../App';
import { ScreenContainer } from '../components/ScreenContainer';
import { deleteMemory } from '../services/firebase';

type Props = NativeStackScreenProps<RootStackParamList, 'MemoryDetail'>;

export function MemoryDetailScreen({ navigation, route }: Props) {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });
  const { memory } = route.params;
  const [isDeleting, setIsDeleting] = useState(false);

  const onDeleteMemory = () => {
    Alert.alert(
      'Delete memory?',
      'This will remove this memory from your shared timeline.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteMemory(memory.id);
              navigation.dispatch((state) => {
                const routes = state.routes.filter((item) => {
                  if (item.key === route.key) {
                    return false;
                  }

                  const routeParams = item.params;
                  const hasMemoryParam =
                    routeParams &&
                    typeof routeParams === 'object' &&
                    'memory' in routeParams &&
                    routeParams.memory;

                  if (
                    item.name === 'AddMemory' &&
                    hasMemoryParam &&
                    routeParams.memory.id === memory.id
                  ) {
                    return false;
                  }

                  return true;
                });

                const timelineIndex = routes.findIndex(
                  (item) => item.name === 'Timeline',
                );

                if (timelineIndex >= 0) {
                  return CommonActions.reset({
                    ...state,
                    routes,
                    index: timelineIndex,
                  });
                }

                return CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Timeline' }],
                });
              });
            } catch {
              setIsDeleting(false);
              Alert.alert(
                'Could not delete memory',
                'Please try again in a moment.',
              );
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.topLabel}>Memory</Text>
          <Pressable
            onPress={() => navigation.navigate('AddMemory', { memory })}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
        </View>

        {memory.imageUrl ? <Image source={{ uri: memory.imageUrl }} style={styles.heroImage} /> : null}

        <View style={styles.card}>
          <Text style={[styles.title, fontsLoaded && styles.titleFont]}>{memory.title}</Text>
          <Text style={styles.author}>Added by @{memory.authorName}</Text>
          <Text style={styles.date}>{dayjs(memory.date).format('MMMM D, YYYY')}</Text>
          <View style={styles.divider} />
          <Text style={[styles.sectionTitle, fontsLoaded && styles.sectionTitleFont]}>Our Story</Text>
          <Text style={styles.description}>{memory.description}</Text>

          <Pressable
            onPress={onDeleteMemory}
            style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator color="#fffaf8" />
            ) : (
              <Text style={styles.deleteButtonText}>Delete Memory</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 28,
    gap: 14,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fbfaf9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5d8d3',
    shadowColor: '#c8bbb7',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  backButtonText: {
    color: '#6e625e',
    fontSize: 20,
    fontWeight: '700',
    marginTop: -1,
  },
  topLabel: {
    color: '#ad958d',
    fontSize: 13,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  editButton: {
    minWidth: 58,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 14,
    backgroundColor: '#ef8a8e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#d38a8f',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  editButtonText: {
    color: '#fffaf8',
    fontSize: 14,
    fontWeight: '700',
  },
  heroImage: {
    width: '100%',
    height: 280,
    borderRadius: 28,
  },
  card: {
    backgroundColor: '#fbfaf9',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#eadfd8',
    padding: 20,
    shadowColor: '#c8bbb7',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  title: {
    fontSize: 34,
    color: '#2a211d',
    lineHeight: 38,
  },
  titleFont: {
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  author: {
    marginTop: 10,
    color: '#cf8a8d',
    fontSize: 14,
    fontWeight: '700',
  },
  date: {
    marginTop: 4,
    color: '#8d7d77',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#e8dcd6',
    marginVertical: 18,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#7e665d',
    marginBottom: 10,
  },
  sectionTitleFont: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
  },
  description: {
    color: '#625651',
    fontSize: 16,
    lineHeight: 28,
  },
  deleteButton: {
    marginTop: 22,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#d9787f',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#c9757c',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  deleteButtonDisabled: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: '#fffaf8',
    fontSize: 15,
    fontWeight: '700',
  },
});
