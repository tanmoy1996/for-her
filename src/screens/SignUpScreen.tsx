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
import { createUserAccount } from '../services/firebase';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const { setSession } = useSharedAccount();
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!username.trim() || !passcode.trim() || !confirmPasscode.trim()) {
      setErrorMessage('Complete all fields.');
      return;
    }

    if (passcode !== confirmPasscode) {
      setErrorMessage('Passcodes do not match.');
      return;
    }

    if (!/^\d{6}$/.test(passcode)) {
      setErrorMessage('Passcode must be exactly 6 numbers.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      console.log('here');
      const session = await createUserAccount(username.trim(), passcode.trim());
      await setSession(session);
      navigation.replace('Timeline');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not create account.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Hello beautiful,"
      title="let's sign you up !"
      footerText="Already have an account?"
      footerActionLabel="Sign in"
      onFooterPress={() => navigation.navigate('SignIn')}
      onBackPress={() => navigation.goBack()}
      bottomHint={
        <Text style={styles.hint}>
          Your person will create their own account and connect with your code
          later.
        </Text>
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
        <TextInput
          keyboardType="number-pad"
          maxLength={6}
          secureTextEntry
          placeholder="Confirm 6-digit passcode"
          placeholderTextColor="#c0b8b5"
          style={styles.input}
          value={confirmPasscode}
          onChangeText={setConfirmPasscode}
        />
      </View>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <Pressable
        style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
        disabled={isSubmitting}
        onPress={handleSignUp}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Sign up</Text>
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
  hint: {
    textAlign: 'center',
    color: '#c0b6b1',
    marginTop: 12,
    fontSize: 13,
  },
});
