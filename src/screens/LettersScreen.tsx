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
    color: '#2d221f',
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 14,
  },
  card: {
    backgroundColor: '#fbfaf9',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e5d8d3',
    shadowColor: '#c8bbb7',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3a2d29',
  },
  cardHint: {
    fontSize: 13,
    color: '#8c7d76',
    marginTop: 4,
  },
  separator: {
    height: 10,
  },
});
