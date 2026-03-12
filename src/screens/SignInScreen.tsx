import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { RootStackParamList } from '../../App';
import { AuthShell } from '../components/AuthShell';
import { useSharedAccount } from '../hooks/useSharedAccount';
import { signInUserAccount } from '../services/firebase';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export function SignInScreen({ navigation }: Props) {
  const { setSession } = useSharedAccount();
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!username.trim() || !passcode.trim()) {
      setErrorMessage('Enter your username and passcode.');
      return;
    }

    if (!/^\d{6}$/.test(passcode)) {
      setErrorMessage('Passcode must be exactly 6 numbers.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const session = await signInUserAccount(username.trim(), passcode.trim());
      await setSession(session);
      navigation.replace('Timeline');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not sign in.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Hello,"
      title="welcome back !"
      footerText="Need an account?"
      footerActionLabel="Sign up"
      onFooterPress={() => navigation.navigate('SignUp')}
      onBackPress={() => navigation.goBack()}
      bottomHint={
        <Text style={styles.forgotPassword}>Sign in, then use a relationship code to connect two accounts.</Text>
      }
    >
      <View style={styles.formGroup}>
        <TextInput
          autoCapitalize="none"
          placeholder="Username"
          placeholderTextColor="#c0b8b5"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          keyboardType="number-pad"
          maxLength={6}
          secureTextEntry
          placeholder="6-digit passcode"
          placeholderTextColor="#c0b8b5"
          style={styles.input}
          value={passcode}
          onChangeText={setPasscode}
        />
      </View>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <Pressable
        style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
        disabled={isSubmitting}
        onPress={handleSignIn}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Login</Text>
        )}
      </Pressable>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    gap: 18,
  },
  input: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd5d2',
    paddingHorizontal: 10,
    paddingVertical: 14,
    color: '#4a4543',
    fontSize: 15,
  },
  error: {
    color: '#b75b70',
    fontSize: 14,
    marginTop: 14,
  },
  primaryButton: {
    backgroundColor: '#ef8a8e',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#de8c87',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  forgotPassword: {
    textAlign: 'center',
    color: '#c0b6b1',
    marginTop: 12,
    fontSize: 13,
  },
});
