import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { RootStackParamList } from '../../App';
import { ScreenContainer } from '../components/ScreenContainer';

type Props = NativeStackScreenProps<RootStackParamList, 'LetterDetail'>;

export function LetterDetailScreen({ route }: Props) {
  const { letter } = route.params;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{letter.title}</Text>
        <Text style={styles.message}>{letter.message}</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#fbfaf9',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5d8d3',
    shadowColor: '#c8bbb7',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d221f',
    marginBottom: 14,
  },
  message: {
    fontSize: 16,
    color: '#655853',
    lineHeight: 26,
  },
});
