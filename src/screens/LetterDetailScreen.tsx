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
    backgroundColor: '#fff4f9',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#f4dce8',
    shadowColor: '#d58ca8',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4f3d46',
    marginBottom: 14,
  },
  message: {
    fontSize: 16,
    color: '#5e4d56',
    lineHeight: 26,
  },
});
