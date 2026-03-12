import { NativeStackScreenProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RootStackParamList } from '../../App';
import { ScreenContainer } from '../components/ScreenContainer';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export function LandingScreen({ navigation }: Props) {
  const relationshipStartDate = dayjs('2024-01-01');
  const daysTogether = dayjs().startOf('day').diff(relationshipStartDate.startOf('day'), 'day') + 1;

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>For Her ❤️</Text>
        <Text style={styles.subtitle}>A little place for our memories</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Relationship Started</Text>
          <Text style={styles.infoValue}>{relationshipStartDate.format('MMMM D, YYYY')}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Days together</Text>
          <Text style={styles.daysValue}>{daysTogether}</Text>
        </View>

        <Pressable style={styles.button} onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.secondaryButtonText}>Create Account</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    backgroundColor: '#fff1f6',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: '#f4dce8',
    shadowColor: '#d58ca8',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#4b3f44',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#76656d',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#fff8fb',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f4dce8',
    shadowColor: '#e2abc0',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8b7480',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4b3f44',
  },
  daysValue: {
    fontSize: 30,
    fontWeight: '800',
    color: '#d16586',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#ee90ad',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
    shadowColor: '#cb6788',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ecc4d3',
    backgroundColor: '#fffafd',
  },
  secondaryButtonText: {
    color: '#8f6d7b',
    fontSize: 15,
    fontWeight: '700',
  },
});
