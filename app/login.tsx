import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import HubBackground from '../components/HubBackground';
import NeonInput from '../components/NeonInput';
import NeonButton from '../components/NeonButton';
import { theme } from '../theme';
import RetrowaveSun from '../components/RetrowaveSun';

export default function LoginScreen() {
  const { login, createAccount } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [mode, setMode] = useState<'login' | 'create'>('login');
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.');
      return;
    }
    const result = await login(username.trim(), password, rememberMe);
    if (result.error) {
      setError(result.error);
    } else {
      router.replace('/hub');
    }
  }

  async function handleCreate() {
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    const result = await createAccount(username.trim(), password);
    if (result.error) {
      setError(result.error);
    } else {
      router.replace('/hub');
    }
  }

  return (
    <View style={styles.container}>
      <HubBackground />

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={true}
        >
          <View style={styles.inner}>
            <View style={styles.sunContainer}>
              <RetrowaveSun size={160} />
            </View>

            <Text style={styles.title}>
              Budget<Text style={styles.titleAccent}>AI</Text>
            </Text>
            <Text style={styles.subtitle}>ようこそ — WELCOME BACK</Text>

            <View style={styles.form}>
              {error ? (
                <Text style={styles.error}>{error}</Text>
              ) : null}

              <NeonInput
                placeholder="Username"
                value={username}
                onChangeText={(t) => { setUsername(t); setError(''); }}
                autoCapitalize="none"
                accentColor={theme.colors.neonPink}
                style={styles.input}
              />
              <NeonInput
                placeholder="Password"
                value={password}
                onChangeText={(t) => { setPassword(t); setError(''); }}
                secureTextEntry
                accentColor={theme.colors.neonPink}
                style={styles.input}
              />

              <View style={styles.rememberRow}>
                <Text style={styles.rememberLabel}>Remember me</Text>
                <Switch
                  value={rememberMe}
                  onValueChange={setRememberMe}
                  trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.colors.neonPurple }}
                  thumbColor={rememberMe ? theme.colors.neonPink : '#fff'}
                />
              </View>

              {mode === 'login' ? (
                <>
                  <NeonButton label="Log In" onPress={handleLogin} color={theme.colors.neonPink} style={styles.btn} />
                  <TouchableOpacity onPress={() => { setMode('create'); setError(''); }} style={styles.switchMode}>
                    <Text style={styles.switchText}>No account? <Text style={{ color: theme.colors.neonPurple }}>Create one</Text></Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <NeonButton label="Create Account" onPress={handleCreate} color={theme.colors.neonPurple} style={styles.btn} />
                  <TouchableOpacity onPress={() => { setMode('login'); setError(''); }} style={styles.switchMode}>
                    <Text style={styles.switchText}>Have an account? <Text style={{ color: theme.colors.neonPink }}>Log in</Text></Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flexGrow: 1, paddingVertical: 32 },
  inner: { padding: theme.spacing.xl, paddingTop: 24 },
  sunContainer: { alignItems: 'center', marginBottom: theme.spacing.lg },
  title: {
    fontSize: theme.font.hero,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    shadowColor: theme.colors.neonPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
  },
  titleAccent: {
    color: theme.colors.neonPink,
  },
  subtitle: {
    fontSize: theme.font.xs,
    color: theme.colors.neonPurple,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: theme.spacing.xl,
  },
  form: { gap: theme.spacing.md },
  input: { marginBottom: 0 },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  rememberLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.font.md,
  },
  btn: { marginTop: theme.spacing.sm },
  switchMode: { alignItems: 'center', paddingVertical: theme.spacing.sm },
  switchText: { color: theme.colors.textMuted, fontSize: theme.font.md },
  error: {
    color: theme.colors.neonPink,
    fontSize: theme.font.sm,
    textAlign: 'center',
    backgroundColor: 'rgba(255,45,155,0.1)',
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,45,155,0.3)',
  },
});
