import dayjs from 'dayjs';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

import { Memory } from '../services/firebase';

type MemoryCardProps = {
  memory: Memory;
  index: number;
};

export function MemoryCard({ memory, index }: MemoryCardProps) {
  const fadeValue = useRef(new Animated.Value(0)).current;

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
      {memory.imageUrl ? (
        <Image source={{ uri: memory.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>No image</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{memory.title}</Text>
        <Text style={styles.author}>Added by {memory.authorName}</Text>
        <Text style={styles.date}>{dayjs(memory.date).format('MMMM D, YYYY')}</Text>
        <Text style={styles.description}>{memory.description}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fffafd',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f4dfeb',
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#d58ca8',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#fbeff4',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#927784',
    fontSize: 14,
  },
  content: {
    padding: 14,
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4f3d46',
  },
  date: {
    fontSize: 13,
    color: '#8b6e7d',
  },
  author: {
    fontSize: 13,
    color: '#cc7692',
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    color: '#5e4d56',
    lineHeight: 21,
  },
});
