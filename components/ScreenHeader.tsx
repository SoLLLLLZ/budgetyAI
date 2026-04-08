import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../theme';

export default function ScreenHeader({ title, accentColor = theme.colors.neonPink }: { title: string; accentColor?: string }) {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={[styles.chevron, { color: accentColor }]}>‹</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: 56,
    paddingBottom: theme.spacing.md,
  },
  back: {
    width: 36,
    alignItems: 'center',
  },
  chevron: {
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 36,
    marginTop: -4,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: theme.font.lg,
    fontWeight: theme.font.weight.bold,
    letterSpacing: 1,
  },
  spacer: {
    width: 36,
  },
});
