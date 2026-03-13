import dayjs from 'dayjs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { RootStackParamList } from '../../App';
import { MemoryCard } from '../components/MemoryCard';
import { ScreenContainer } from '../components/ScreenContainer';
import { useSharedAccount } from '../hooks/useSharedAccount';
import { getMemories, Memory } from '../services/firebase';

type Props = NativeStackScreenProps<RootStackParamList, 'Timeline'>;

export function TimelineScreen({ navigation }: Props) {
  const { session, setSession } = useSharedAccount();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const relationshipStartDate = dayjs('2024-01-01');

  const daysTogether = dayjs().startOf('day').diff(relationshipStartDate.startOf('day'), 'day') + 1;

  const sortedMemories = useMemo(
    () =>
      [...memories].sort((a, b) => {
        const aDate = dayjs(a.date);
        const bDate = dayjs(b.date);

        if (aDate.isSame(bDate)) {
          return a.createdAt - b.createdAt;
        }

        return aDate.isBefore(bDate) ? -1 : 1;
      }),
    [memories],
  );

  const fetchMemories = useCallback(async (withRefreshing = false) => {
    if (!session?.relationshipId) {
      setMemories([]);
      setIsLoading(false);
      setIsRefreshing(false);
      setErrorMessage(null);
      return;
    }

    try {
      if (withRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);
      const data = await getMemories(session.relationshipId);
      setMemories(data);
    } catch (error) {
      setErrorMessage('Could not load memories right now.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      void fetchMemories();
    }, [fetchMemories]),
  );

  const onRefresh = useCallback(() => {
    void fetchMemories(true);
  }, [fetchMemories]);

  return (
    <ScreenContainer>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Our Timeline</Text>
        <Text style={styles.meta}>Signed in as: @{session?.username ?? 'guest'}</Text>
        <Text style={styles.meta}>Relationship start: {relationshipStartDate.format('MMMM D, YYYY')}</Text>
        <Text style={styles.meta}>Days together: {daysTogether}</Text>
        <Text style={styles.meta}>Total memories: {sortedMemories.length}</Text>
      </View>

      <View style={styles.actionRow}>
        {!session?.relationshipId ? (
          <Pressable style={styles.accountButton} onPress={() => navigation.navigate('ConnectPartner')}>
            <Text style={styles.accountButtonText}>Create or Enter Rel. Code</Text>
          </Pressable>
        ) : null}

        <Pressable
          style={styles.accountButton}
          onPress={async () => {
            await setSession(null);
            navigation.replace('Landing');
          }}
        >
          <Text style={styles.accountButtonText}>Sign Out</Text>
        </Pressable>
      </View>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#d57291" />
          <Text style={styles.loading}>Loading memories...</Text>
        </View>
      ) : null}

      <FlatList
        data={sortedMemories}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <MemoryCard memory={item} index={index} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#d57291" />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{session?.relationshipId ? 'No memories yet' : 'Connect first'}</Text>
              <Text style={styles.emptySubtitle}>
                {session?.relationshipId ? 'Tap + to add your first memory.' : 'Link your person to unlock a shared timeline.'}
              </Text>
            </View>
          ) : null
        }
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate('AddMemory')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: '#fbfaf9',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5d8d3',
    gap: 4,
    shadowColor: '#c8bbb7',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2b211e',
  },
  meta: {
    fontSize: 14,
    color: '#7a6b64',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  accountButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#fbfaf9',
    borderWidth: 1,
    borderColor: '#e2d5cf',
  },
  accountButtonText: {
    color: '#7c6b64',
    fontSize: 13,
    fontWeight: '700',
  },
  feedContent: {
    paddingTop: 8,
    paddingBottom: 86,
  },
  loading: {
    color: '#7a6871',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  error: {
    color: '#b5636f',
  },
  emptyCard: {
    marginTop: 10,
    backgroundColor: '#fbfaf9',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5d8d3',
    padding: 18,
    alignItems: 'center',
    shadowColor: '#c8bbb7',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2f241f',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#85746c',
  },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 26,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ef8a8e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#de8c87',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 7,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 34,
    marginTop: -2,
  },
});
