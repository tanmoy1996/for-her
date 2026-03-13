import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  useFonts,
} from '@expo-google-fonts/playfair-display';
import dayjs from 'dayjs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { RootStackParamList } from '../../App';
import { MemoryCard } from '../components/MemoryCard';
import { ScreenContainer } from '../components/ScreenContainer';
import { useSharedAccount } from '../hooks/useSharedAccount';
import { getMemories, Memory } from '../services/firebase';

type Props = NativeStackScreenProps<RootStackParamList, 'Timeline'>;

export function TimelineScreen({ navigation }: Props) {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });
  const { session, setSession } = useSharedAccount();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const relationshipStartDate = dayjs('2024-01-01');

  const daysTogether =
    dayjs().startOf('day').diff(relationshipStartDate.startOf('day'), 'day') +
    1;

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

  const fetchMemories = useCallback(
    async (withRefreshing = false) => {
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
    },
    [session],
  );

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
      <View style={styles.topBar}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroEyebrow}>Hi 👋</Text>
          <Text style={[styles.heroTitle, fontsLoaded && styles.heroTitleFont]}>
            {session?.username ?? 'guest'}
          </Text>
        </View>
        <Pressable
          style={styles.actionPill}
          onPress={async () => {
            await setSession(null);
            navigation.replace('Landing');
          }}
        >
          <Text style={styles.actionPillText}>Sign Out</Text>
        </Pressable>
      </View>

      <View style={styles.actionRow}>
        {!session?.relationshipId ? (
          <Pressable
            style={styles.actionPill}
            onPress={() => navigation.navigate('ConnectPartner')}
          >
            <Text style={styles.actionPillText}>Create or Enter Rel. Code</Text>
          </Pressable>
        ) : null}
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
        renderItem={({ item, index }) => (
          <MemoryCard
            memory={item}
            index={index}
            onPress={() =>
              navigation.navigate('MemoryDetail', { memory: item })
            }
          />
        )}
        ItemSeparatorComponent={() => (
          <View style={styles.memoryDivider}>
            <View style={styles.memoryDividerLine} />
            <Text style={styles.memoryDividerIcon}>✦</Text>
            <View style={styles.memoryDividerLine} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#d57291"
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                {session?.relationshipId ? 'No memories yet' : 'Connect first'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {session?.relationshipId
                  ? 'Tap + to add your first memory.'
                  : 'Link your person to unlock a shared timeline.'}
              </Text>
            </View>
          ) : null
        }
      />

      <Pressable
        style={styles.bottomButton}
        onPress={() => navigation.navigate('AddMemory')}
      >
        <Text style={styles.bottomButtonText}>Add A Memory</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  topBarBack: {
    fontSize: 34,
    color: '#9d6f5d',
    lineHeight: 34,
  },
  topBarTitle: {
    fontSize: 16,
    color: '#9d6f5d',
  },
  topBarTitleFont: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
  },
  topBarGhost: {
    color: 'transparent',
    fontSize: 16,
  },
  heroCard: {
    backgroundColor: '#fcfaf8',
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eadfd8',
    marginBottom: 14,
  },
  heroBand: {
    height: 64,
    backgroundColor: '#c7ab99',
  },
  heroDecoration: {
    position: 'absolute',
    top: 24,
    right: 0,
    width: 108,
    height: 84,
    backgroundColor: '#ebb7ba',
    borderTopLeftRadius: 26,
    borderBottomLeftRadius: 26,
  },
  heroContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    alignItems: 'center',
  },
  heroLeft: {
    flex: 1,
  },
  heroRight: {
    width: 126,
    alignItems: 'center',
  },
  heroEyebrow: {
    fontSize: 20,
    color: '#7e665d',
  },
  heroTitle: {
    fontSize: 38,
    color: '#2a211d',
    marginBottom: 8,
  },
  heroTitleFont: {
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  meta: {
    fontSize: 13,
    color: '#786a63',
    lineHeight: 20,
  },
  daysCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#f1e5df',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  daysValue: {
    fontSize: 30,
    color: '#9b5b3a',
    lineHeight: 34,
  },
  daysValueFont: {
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  daysLabel: {
    fontSize: 11,
    color: '#8c766b',
    textAlign: 'center',
    marginTop: 2,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  heroFooterText: {
    color: '#786a63',
    fontSize: 13,
  },
  heroSpark: {
    color: '#d894a1',
    fontSize: 22,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  actionPill: {
    alignSelf: 'flex-start',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#fbfaf9',
    borderWidth: 1,
    borderColor: '#e2d5cf',
  },
  actionPillText: {
    color: '#7c6b64',
    fontSize: 13,
    fontWeight: '700',
  },
  feedContent: {
    paddingTop: 8,
    paddingBottom: 108,
  },
  memoryDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  memoryDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e3d6d0',
  },
  memoryDividerIcon: {
    color: '#d894a1',
    fontSize: 16,
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
    backgroundColor: '#fcfaf8',
    borderRadius: 28,
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
  bottomButton: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 26,
    borderRadius: 999,
    backgroundColor: '#ef8a8e',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    shadowColor: '#de8c87',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  bottomButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
