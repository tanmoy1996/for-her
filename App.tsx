import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { LandingScreen } from './src/screens/LandingScreen';
import { TimelineScreen } from './src/screens/TimelineScreen';
import { AddMemoryScreen } from './src/screens/AddMemoryScreen';
import { GalleryScreen } from './src/screens/GalleryScreen';
import { LettersScreen } from './src/screens/LettersScreen';
import { LetterDetailScreen } from './src/screens/LetterDetailScreen';
import { SignInScreen } from './src/screens/SignInScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';
import { ConnectPartnerScreen } from './src/screens/ConnectPartnerScreen';
import { scheduleDailyLoveNotification, setNotificationHandler } from './src/services/notifications';
import { Letter } from './src/data/letters';
import { SharedAccountProvider, useSharedAccount } from './src/hooks/useSharedAccount';

export type RootStackParamList = {
  Landing: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ConnectPartner: undefined;
  Timeline: undefined;
  AddMemory: undefined;
  Gallery: undefined;
  Letters: undefined;
  LetterDetail: { letter: Letter };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SharedAccountProvider>
      <AppNavigator />
    </SharedAccountProvider>
  );
}

function AppNavigator() {
  const { session, isHydrating } = useSharedAccount();

  useEffect(() => {
    setNotificationHandler();
    void scheduleDailyLoveNotification();
  }, []);

  if (isHydrating) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff9fb', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#d57291" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName={session ? 'Timeline' : 'Landing'}
        screenOptions={{
          headerStyle: { backgroundColor: '#fff9fb' },
          headerShadowVisible: false,
          headerTitleStyle: { color: '#4f3d46', fontWeight: '700' },
          contentStyle: { backgroundColor: '#fff9fb' },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} options={{ title: 'For Her' }} />
        <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ConnectPartner" component={ConnectPartnerScreen} options={{ title: 'Connect With Your Person' }} />
        <Stack.Screen name="Timeline" component={TimelineScreen} />
        <Stack.Screen name="AddMemory" component={AddMemoryScreen} options={{ title: 'Add Memory' }} />
        <Stack.Screen name="Gallery" component={GalleryScreen} />
        <Stack.Screen name="Letters" component={LettersScreen} />
        <Stack.Screen
          name="LetterDetail"
          component={LetterDetailScreen}
          options={({ route }) => ({ title: route.params.letter.title })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
