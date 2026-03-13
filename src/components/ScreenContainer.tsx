import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function ScreenContainer({ children }: PropsWithChildren) {
  return (
    <View style={styles.screen}>
      <View style={styles.cornerWashTop} />
      <View style={styles.cornerWashBottom} />
      <View style={styles.wave}>
        <Text style={styles.waveRow}>~~~~~~</Text>
        <Text style={styles.waveRow}>~~~~~~</Text>
        <Text style={styles.waveRow}>~~~~~~</Text>
        <Text style={styles.waveRow}>~~~~~~</Text>
      </View>
      <Text style={styles.heartTopLeft}>♡</Text>
      <Text style={styles.heartTopRight}>♡</Text>
      <Text style={styles.heartMiddleRight}>♡</Text>
      <Text style={styles.heartBottomLeft}>♡</Text>
      <Text style={styles.heartBottomRight}>♡</Text>
      <View style={styles.dotGrid}>
        <Text style={styles.dotRow}>• • • • • •</Text>
        <Text style={styles.dotRow}>• • • • • •</Text>
        <Text style={styles.dotRow}>• • • • • •</Text>
        <Text style={styles.dotRow}>• • • • • •</Text>
        <Text style={styles.dotRow}>• • • • • •</Text>
      </View>

      <View style={styles.dotGridBottom}>
        <Text style={styles.dotRow}>• •</Text>
        <Text style={styles.dotRow}>• •</Text>
        <Text style={styles.dotRow}>• •</Text>
        <Text style={styles.dotRow}>• •</Text>
        <Text style={styles.dotRow}>• •</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f2f1',
    padding: 20,
    gap: 12,
    overflow: 'hidden',
    paddingTop: 80,
  },
  cornerWashTop: {
    position: 'absolute',
    top: -180,
    right: -190,
    width: 340,
    height: 340,
    backgroundColor: '#ede2df',
    borderRadius: 300,
  },
  cornerWashBottom: {
    position: 'absolute',
    left: -108,
    bottom: -100,
    width: 270,
    height: 290,
    backgroundColor: '#efe6e4',
    borderTopLeftRadius: 160,
    borderTopRightRadius: 130,
    borderBottomRightRadius: 90,
    borderBottomLeftRadius: 110,
    transform: [{ rotate: '50deg' }],
  },
  wave: {
    position: 'absolute',
    top: 300,
    right: 0,
    fontSize: 22,
    letterSpacing: 2,
  },

  waveRow: {
    color: '#e4dcd1',
    fontSize: 15,
    letterSpacing: 0,
    lineHeight: 12,
  },
  heartTopLeft: {
    position: 'absolute',
    top: 100,
    left: 28,
    color: '#f5e8e4',
    fontSize: 30,
    transform: [{ rotate: '-30deg' }],
  },
  heartTopRight: {
    position: 'absolute',
    top: 58,
    right: 28,
    color: '#f5e8e4',
    fontSize: 22,
    transform: [{ rotate: '20deg' }],
  },
  heartMiddleRight: {
    position: 'absolute',
    top: 400,
    right: 130,
    color: '#f5e8e4',
    fontSize: 30,
    transform: [{ rotate: '30deg' }],
  },
  heartBottomLeft: {
    position: 'absolute',
    bottom: 200,
    left: 56,
    color: '#f1dfda',
    fontSize: 26,
  },
  heartBottomRight: {
    position: 'absolute',
    bottom: 90,
    right: 50,
    color: '#f1dfda',
    fontSize: 32,
    transform: [{ rotate: '-10deg' }],
  },
  dotGrid: {
    position: 'absolute',
    top: 5,
    right: 105,
  },
  dotGridBottom: {
    position: 'absolute',
    bottom: 145,
    left: 5,
  },
  dotRow: {
    color: '#b9a58a',
    fontSize: 11,
    letterSpacing: 3,
    lineHeight: 12,
  },
});
