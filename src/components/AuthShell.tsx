import { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type AuthShellProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  footerText: string;
  footerActionLabel: string;
  onFooterPress: () => void;
  bottomHint?: ReactNode;
  onBackPress?: () => void;
  brandLabel?: string;
}>;

export function AuthShell({
  eyebrow,
  title,
  children,
  footerText,
  footerActionLabel,
  onFooterPress,
  bottomHint,
  onBackPress,
  brandLabel = 'For Her',
}: AuthShellProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.topLineOne} />
      <View style={styles.topLineTwo} />
      <View style={styles.topLineThree} />
      <View style={styles.blobLeft} />
      <View style={styles.blobRight} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.phoneCard}>
            <View style={styles.topBar}>
              {onBackPress ? (
                <Pressable onPress={onBackPress} style={styles.backButton}>
                  <Text style={styles.backButtonText}>←</Text>
                </Pressable>
              ) : (
                <View style={styles.backButtonSpacer} />
              )}
            </View>

            <View style={styles.cornerWashTop} />
            <View style={styles.cornerWashBottom} />
            <View style={styles.dotGrid}>
              <Text style={styles.dotRow}>• • • • • •</Text>
              <Text style={styles.dotRow}>• • • • • •</Text>
              <Text style={styles.dotRow}>• • • • • •</Text>
              <Text style={styles.dotRow}>• • • • • •</Text>
            </View>

            <View style={styles.dotGridBottom}>
              <Text style={styles.dotRow}>• • •</Text>
              <Text style={styles.dotRow}>• • •</Text>
              <Text style={styles.dotRow}>• • •</Text>
              <Text style={styles.dotRow}>• • •</Text>
            </View>

            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>

            <View style={styles.formCard}>{children}</View>

            {bottomHint}

            <Pressable onPress={onFooterPress}>
              <Text style={styles.footerLink}>
                {footerText}{' '}
                <Text style={styles.footerLinkStrong}>{footerActionLabel}</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#efd5c6',
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  topLineOne: {
    position: 'absolute',
    top: 18,
    left: -10,
    width: 200,
    height: 84,
    borderWidth: 3,
    borderColor: '#f7f5f1',
    borderRadius: 999,
    backgroundColor: 'transparent',
    transform: [{ rotate: '8deg' }],
  },
  topLineTwo: {
    position: 'absolute',
    top: 8,
    left: 98,
    width: 148,
    height: 84,
    borderWidth: 3,
    borderColor: '#f7f5f1',
    borderRadius: 999,
    backgroundColor: 'transparent',
    transform: [{ rotate: '-18deg' }],
  },
  topLineThree: {
    position: 'absolute',
    top: 48,
    left: 170,
    width: 116,
    height: 48,
    borderWidth: 3,
    borderColor: '#f7f5f1',
    borderRadius: 999,
    backgroundColor: 'transparent',
    transform: [{ rotate: '18deg' }],
  },
  blobLeft: {
    position: 'absolute',
    left: -58,
    bottom: -34,
    width: 220,
    height: 240,
    backgroundColor: '#ff705e',
    borderTopLeftRadius: 160,
    borderTopRightRadius: 130,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 110,
    transform: [{ rotate: '-12deg' }],
  },
  blobRight: {
    position: 'absolute',
    right: -110,
    bottom: 0,
    width: 280,
    height: 320,
    backgroundColor: '#e9b09f',
    borderRadius: 180,
  },
  phoneCard: {
    backgroundColor: '#f8f2f1',
    borderRadius: 30,
    minHeight: 700,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 28,
    overflow: 'hidden',
    shadowColor: '#b88e80',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff8f7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#c7aba0',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  backButtonSpacer: {
    width: 40,
    height: 40,
  },
  backButtonText: {
    color: '#6e625e',
    fontSize: 20,
    fontWeight: '700',
    marginTop: -1,
  },
  brandLabel: {
    color: '#ad958d',
    fontSize: 13,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  cornerWashTop: {
    position: 'absolute',
    top: -180,
    right: -190,
    width: 340,
    height: 340,
    backgroundColor: '#ede2df',
    borderRadius: 300,
  },
  cornerWashBottom: {
    position: 'absolute',
    left: -48,
    bottom: -95,
    width: 250,
    height: 250,
    backgroundColor: '#efe6e4',
    borderRadius: 200,
  },
  dotGrid: {
    position: 'absolute',
    top: 5,
    right: 105,
  },
  dotGridBottom: {
    position: 'absolute',
    bottom: 105,
    left: 5,
  },
  dotRow: {
    color: '#b9a58a',
    fontSize: 11,
    letterSpacing: 3,
    lineHeight: 12,
  },
  eyebrow: {
    marginTop: 48,
    fontSize: 20,
    color: '#4f4a47',
    fontWeight: '500',
  },
  title: {
    fontSize: 26,
    lineHeight: 33,
    color: '#171514',
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 26,
  },
  formCard: {
    backgroundColor: '#fbfaf9',
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 26,
    shadowColor: '#c8bbb7',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  footerLink: {
    textAlign: 'center',
    color: '#8d7f79',
    marginTop: 18,
    fontSize: 14,
  },
  footerLinkStrong: {
    color: '#f08d8f',
    fontWeight: '700',
  },
});
