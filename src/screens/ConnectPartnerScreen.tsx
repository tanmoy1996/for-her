import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { RootStackParamList } from '../../App';
import { ScreenContainer } from '../components/ScreenContainer';
import { useSharedAccount } from '../hooks/useSharedAccount';
import { generateConnectionCode, redeemConnectionCode } from '../services/firebase';

type Props = NativeStackScreenProps<RootStackParamList, 'ConnectPartner'>;

export function ConnectPartnerScreen({ navigation }: Props) {
  const { session, setSession, refreshSession } = useSharedAccount();
  const [joinCode, setJoinCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerateCode = async () => {
    if (!session) {
      setErrorMessage('Sign in first.');
      return;
    }

    try {
      setIsGenerating(true);
      setErrorMessage(null);
      const code = await generateConnectionCode(session.userId);
      setGeneratedCode(code);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create a code.';
      setErrorMessage(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleJoinCode = async () => {
    if (!session) {
      setErrorMessage('Sign in first.');
      return;
    }

    if (!joinCode.trim()) {
      setErrorMessage('Enter the code your person shared.');
      return;
    }

    try {
      setIsJoining(true);
      setErrorMessage(null);
      const nextSession = await redeemConnectionCode(session.userId, joinCode.trim());
      await setSession(nextSession);
      await refreshSession();
      navigation.replace('Timeline');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not connect accounts.';
      setErrorMessage(message);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Connect your accounts</Text>
        <Text style={styles.subtitle}>Each person keeps their own login. Once linked, both memories show up in the same timeline.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Share a code</Text>
          <Text style={styles.cardText}>Generate a one-time code and send it to your person. The code expires in 15 minutes.</Text>

          {generatedCode ? <Text style={styles.code}>{generatedCode}</Text> : null}

          <Pressable style={[styles.primaryButton, isGenerating && styles.buttonDisabled]} disabled={isGenerating} onPress={handleGenerateCode}>
            {isGenerating ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{generatedCode ? 'Refresh Code' : 'Generate Code'}</Text>}
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Enter a code</Text>
          <Text style={styles.cardText}>If your person already created a code, paste it here to link both accounts.</Text>

          <TextInput
            autoCapitalize="characters"
            placeholder="Enter code"
            placeholderTextColor="#b8a7a1"
            style={styles.input}
            value={joinCode}
            onChangeText={setJoinCode}
          />

          <Pressable style={[styles.primaryButton, isJoining && styles.buttonDisabled]} disabled={isJoining} onPress={handleJoinCode}>
            {isJoining ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Connect Accounts</Text>}
          </Pressable>
        </View>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
    gap: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2d221f',
  },
  subtitle: {
    color: '#72645e',
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#fbfaf9',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5d8d3',
    padding: 18,
    gap: 12,
    shadowColor: '#c8bbb7',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#322723',
  },
  cardText: {
    color: '#7b6d66',
    lineHeight: 21,
  },
  code: {
    backgroundColor: '#efe6e4',
    borderRadius: 20,
    paddingVertical: 16,
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '800',
    color: '#ef8a8e',
    letterSpacing: 4,
  },
  input: {
    backgroundColor: '#fbfaf9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5d8d3',
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#4a3f3b',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#ef8a8e',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#de8c87',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  error: {
    color: '#b5636f',
    fontSize: 14,
  },
});
