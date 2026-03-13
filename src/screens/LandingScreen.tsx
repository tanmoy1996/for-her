import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  useFonts,
} from '@expo-google-fonts/playfair-display';
import dayjs from 'dayjs';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { RootStackParamList } from '../../App';
import { ScreenContainer } from '../components/ScreenContainer';

const landingImage = require('../assets/image/landingImage.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export function LandingScreen({ navigation }: Props) {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });
  const relationshipStartDate = dayjs('2024-01-01');
  const daysTogether =
    dayjs().startOf('day').diff(relationshipStartDate.startOf('day'), 'day') +
    1;

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.imageFrame}>
          <Image
            source={landingImage}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        <Text style={[styles.title, fontsLoaded && styles.titleFont]}>
          For Her 🦋
        </Text>
        <Text style={[styles.subtitle, fontsLoaded && styles.subtitleFont]}>
          A little place for our memories
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.footerLink}>
            Need an account?{' '}
            <Text style={styles.footerLinkStrong}>Sign up</Text>
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 8,
    paddingVertical: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2a1f1c',
    // lineHeight: 15,
  },
  titleFont: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontWeight: '400',
  },
  imageFrame: {
    // width: '100%',
    height: 350,
    marginBottom: 8,
    marginLeft: -24,
    marginRight: -24,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  subtitle: {
    fontSize: 18,
    color: '#9b9491',
    lineHeight: 24,
    marginBottom: 14,
  },
  subtitleFont: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontWeight: '400',
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#fbfaf9',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5d8d3',
    shadowColor: '#c8bbb7',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#998983',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e2320',
  },
  daysValue: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ef8a8e',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#ef8a8e',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
    shadowColor: '#de8c87',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerLink: {
    textAlign: 'center',
    color: '#8d7f79',
    marginTop: 10,
    fontSize: 14,
  },
  footerLinkStrong: {
    color: '#f08d8f',
    fontWeight: '700',
  },
});
