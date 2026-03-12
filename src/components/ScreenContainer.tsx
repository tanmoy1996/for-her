import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

export function ScreenContainer({ children }: PropsWithChildren) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff9fb',
    padding: 20,
    gap: 12,
  },
});
