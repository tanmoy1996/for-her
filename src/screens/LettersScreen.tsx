import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { RootStackParamList } from '../../App';
import { ScreenContainer } from '../components/ScreenContainer';
import { letters } from '../data/letters';

type Props = NativeStackScreenProps<RootStackParamList, 'Letters'>;

export function LettersScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Letters</Text>
      <FlatList
        data={letters}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate('LetterDetail', { letter: item })}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardHint}>Tap to read full letter</Text>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4f3d46',
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 14,
  },
  card: {
    backgroundColor: '#fff7fb',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#f4dce8',
    shadowColor: '#d58ca8',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5d4a54',
  },
  cardHint: {
    fontSize: 13,
    color: '#8d7480',
    marginTop: 4,
  },
  separator: {
    height: 10,
  },
});
