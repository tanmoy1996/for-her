import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  useFonts,
} from '@expo-google-fonts/playfair-display';
import dayjs from 'dayjs';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Memory } from '../services/firebase';

type MemoryCardProps = {
  memory: Memory;
  index: number;
  onPress?: () => void;
};

export function MemoryCard({ memory, index, onPress }: MemoryCardProps) {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });
  const fadeValue = useRef(new Animated.Value(0)).current;
  const reverseLayout = index % 2 === 1;
  const hasImage = Boolean(memory.imageUrl);
  const imageVariant = index % 3;

  useEffect(() => {
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 380,
      delay: Math.min(index * 70, 420),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fadeValue, index]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeValue,
          transform: [
            {
              translateY: fadeValue.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Pressable onPress={onPress}>
        <View
          style={[
            styles.contentRow,
            reverseLayout && styles.contentRowReverse,
            !hasImage && styles.contentRowTextOnly,
          ]}
        >
          <View style={[styles.content, reverseLayout && styles.contentReverse]}>
            <Text style={[styles.title, fontsLoaded && styles.titleFont]}>
              {memory.title}
            </Text>
            <Text style={styles.author}>@{memory.authorName}</Text>
            <Text style={styles.date}>
              {dayjs(memory.date).format('MMMM D, YYYY')}
            </Text>
            <Text style={styles.description} numberOfLines={6}>
              {memory.description}
            </Text>
            <Text style={styles.readMore}>Read more</Text>
          </View>

          {hasImage ? (
            <View style={styles.visualColumn}>
              <Image
                source={{ uri: memory.imageUrl }}
                style={[
                  styles.image,
                  imageVariant === 0 && styles.imageCircle,
                  imageVariant === 1 && styles.imageRoundedCard,
                  imageVariant === 2 && styles.imageArch,
                ]}
              />
            </View>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    marginBottom: 18,
  },
  cardBand: {
    height: 22,
    backgroundColor: '#c7ab99',
  },
  dotCluster: {
    position: 'absolute',
    top: 14,
    right: 16,
  },
  dotText: {
    color: '#f7ece6',
    fontSize: 12,
    letterSpacing: 2,
  },
  contentRow: {
    flexDirection: 'row',
    padding: 18,
    gap: 14,
    alignItems: 'center',
  },
  contentRowReverse: {
    flexDirection: 'row-reverse',
  },
  contentRowTextOnly: {
    paddingVertical: 8,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  contentReverse: {
    alignItems: 'flex-end',
  },
  visualColumn: {
    width: 132,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  image: {
    backgroundColor: '#eadfd8',
  },
  imageCircle: {
    width: 124,
    height: 124,
    borderRadius: 62,
  },
  imageRoundedCard: {
    width: 132,
    height: 152,
    borderRadius: 28,
  },
  imageArch: {
    width: 128,
    height: 154,
    borderTopLeftRadius: 64,
    borderTopRightRadius: 64,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  kicker: {
    fontSize: 14,
    color: '#9d6f5d',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  kickerFont: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
  },
  title: {
    fontSize: 28,
    color: '#2a211d',
    lineHeight: 32,
    textTransform: 'capitalize',
  },
  titleFont: {
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  date: {
    fontSize: 13,
    color: '#8d7d77',
  },
  author: {
    fontSize: 13,
    color: '#cf8a8d',
    fontWeight: '700',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#e8dcd6',
    marginVertical: 4,
  },
  description: {
    fontSize: 14,
    color: '#625651',
    lineHeight: 21,
  },
  readMore: {
    marginTop: 6,
    color: '#cf8a8d',
    fontSize: 13,
    fontWeight: '700',
  },
  sparkle: {
    color: '#d894a1',
    fontSize: 22,
  },
});
