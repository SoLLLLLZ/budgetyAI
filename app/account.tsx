import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, Alert, Dimensions, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import NeonCard from '../components/NeonCard';
import NeonButton from '../components/NeonButton';
import SectionLabel from '../components/SectionLabel';
import HubBackground from '../components/HubBackground';
import AccountScene from '../components/scenes/AccountScene';
import { theme } from '../theme';

const { width } = Dimensions.get('window');
const SESSION_KEY = 'budgetai_session';

export default function AccountScreen() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const [basicInfoSet, setBasicInfoSet] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        AsyncStorage.getItem(SESSION_KEY),
        AsyncStorage.getItem(`basicInfo_${currentUser}`),
      ]).then(([session, bi]) => {
        setRememberMe(!!session);
        setBasicInfoSet(!!bi);
      });
    }, [currentUser])
  );

  async function toggleRememberMe(val: boolean) {
    setRememberMe(val);
    if (val && currentUser) {
      await AsyncStorage.setItem(SESSION_KEY, currentUser);
    } else {
      await AsyncStorage.removeItem(SESSION_KEY);
    }
  }

  async function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  }

  const now = new Date();
  const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  const initials = currentUser ? currentUser.slice(0, 2).toUpperCase() : 'ME';

  return (
    <View style={styles.container}>
      <HubBackground />

      {/* Background scene */}
      <View style={styles.sceneBg} pointerEvents="none">
        <AccountScene width={width} height={280} />
      </View>

      <ScreenHeader title="Account" accentColor={theme.colors.neonPurple} />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.username}>{currentUser}</Text>
          <Text style={styles.memberSince}>Member since {now.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
        </View>

        {/* Info card */}
        <NeonCard accentColor={theme.colors.neonPurple} style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current month</Text>
            <Text style={styles.infoValue}>{monthLabel}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Basic info</Text>
            <View style={[styles.badge, basicInfoSet
              ? { borderColor: theme.colors.neonGreen, backgroundColor: 'rgba(57,255,154,0.1)' }
              : { borderColor: theme.colors.textDim, backgroundColor: 'rgba(255,255,255,0.05)' }]}>
              <Text style={[styles.badgeText, { color: basicInfoSet ? theme.colors.neonGreen : theme.colors.textDim }]}>
                {basicInfoSet ? 'Complete' : 'Not set'}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Remember me</Text>
            <Switch
              value={rememberMe}
              onValueChange={toggleRememberMe}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.colors.neonPurple }}
              thumbColor={rememberMe ? theme.colors.neonPink : '#fff'}
            />
          </View>
        </NeonCard>

        <NeonButton
          label="Log Out"
          onPress={handleLogout}
          color={theme.colors.neonPink}
          style={styles.logoutBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  sceneBg: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 280, opacity: 0.4 },
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: theme.colors.neonPink,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: theme.colors.neonPurple,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 16,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#fff' },
  username: { fontSize: 22, fontWeight: '700', color: theme.colors.text },
  memberSince: { fontSize: 12, color: theme.colors.textMuted },
  infoCard: { gap: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  infoLabel: { fontSize: 13, color: theme.colors.textMuted },
  infoValue: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  badge: { borderWidth: 1, borderRadius: theme.radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 4 },
  logoutBtn: { marginTop: 0 },
});
