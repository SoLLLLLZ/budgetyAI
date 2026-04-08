import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import OpenAI from 'openai';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated, Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AmountText from '../components/AmountText';
import HubBackground from '../components/HubBackground';
import NeonButton from '../components/NeonButton';
import NeonCard from '../components/NeonCard';
import NeonInput from '../components/NeonInput';
import ScanScene from '../components/scenes/ScanScene';
import ScreenHeader from '../components/ScreenHeader';
import SectionLabel from '../components/SectionLabel';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY!;

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    'HTTP-Referer': 'https://budgetai.app',
    'X-Title': 'BudgetAI',
  },
});

const CATEGORIES = ['Food', 'Transport', 'Clothing', 'Entertainment', 'Health', 'Other'];
const { width } = Dimensions.get('window');
const FRAME = width * 0.72;

function genId() {
  return Date.now().toString() + Math.random().toString(36).slice(2);
}

export default function ScanScreen() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [parseError, setParseError] = useState('');

  // Form state
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  // Laser animation
  const laserY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(laserY, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(laserY, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const laserTranslate = laserY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FRAME - 4],
  });

  async function pickImage(useCamera: boolean) {
    const perm = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Please grant permission to access your ' + (useCamera ? 'camera' : 'photos'));
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

    if (result.canceled) return;
    await processImage(result.assets[0].uri);
  }

  async function processImage(uri: string) {
    setLoading(true);
    setParseError('');
    setParsed(null);
    setSaved(false);

    try {
      // Compress
      const compressed = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      console.log('[Scan] Image compressed, size ~', Math.round((compressed.base64?.length ?? 0) / 1024), 'KB');

      const response = await client.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Parse this receipt image and return ONLY a JSON object with these fields: { "merchant": "store name or empty string", "amount": number or 0, "date": "YYYY-MM-DD or empty string", "category": "one of: Food, Transport, Clothing, Entertainment, Health, Other", "note": "brief description or empty string", "isReceipt": true or false }. If this is not a receipt, set isReceipt to false and all other fields to empty/0.',
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${compressed.base64 ?? ''}` },
            },
          ],
        }],
        max_tokens: 200,
      });

      const raw = response.choices[0].message.content ?? '{}';
      console.log('[Scan] Parsed response:', raw);
      const data = JSON.parse(raw);

      if (!data.isReceipt) {
        setParseError("That doesn't look like a receipt. Please try again with a receipt photo.");
        return;
      }

      setParsed(data);
      setMerchant(data.merchant || '');
      setAmount(data.amount ? String(data.amount) : '');
      setDate(data.date || new Date().toISOString().split('T')[0]);
      setCategory(CATEGORIES.includes(data.category) ? data.category : 'Other');
      setNote(data.note || '');
    } catch (err: unknown) {
      console.error('[Scan] Error:', err);
      const e = err as { message?: string; status?: number };
      const errMsg = e.message?.includes('PLACEHOLDER') || e.status === 401
        ? 'API key not configured.'
        : `Could not parse receipt: ${e.message}`;
      setParseError(errMsg);
    } finally {
      setLoading(false);
    }
  }

  async function confirmExpense() {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { Alert.alert('Invalid amount', 'Please enter a valid amount.'); return; }

    const key = `expenses_${currentUser}`;
    const raw = await AsyncStorage.getItem(key);
    const expenses = raw ? JSON.parse(raw) : [];
    const entry = { id: genId(), date, amount: amt, category, note: note || merchant };
    await AsyncStorage.setItem(key, JSON.stringify([entry, ...expenses]));

    // Save last scan for hub widget
    await AsyncStorage.setItem(`lastScan_${currentUser}`, JSON.stringify({ merchant, amount: amt }));

    setSaved(true);
    Alert.alert('Saved!', 'Expense added to your tracker.');
  }

  return (
    <View style={styles.container}>
      <HubBackground />

      <ScreenHeader title="Receipt AI" accentColor={theme.colors.neonCyan} />

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets={true}>

          {/* Scan frame */}
          {!parsed && (
            <View style={styles.frameSection}>
              <View style={styles.frame}>
                {/* Scene behind */}
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                  <ScanScene width={FRAME} height={FRAME} />
                </View>

                {/* Corner brackets */}
                <View style={[styles.corner, styles.tl]} />
                <View style={[styles.corner, styles.tr]} />
                <View style={[styles.corner, styles.bl]} />
                <View style={[styles.corner, styles.br]} />

                {/* Laser */}
                <Animated.View style={[styles.laser, { transform: [{ translateY: laserTranslate }] }]} />

                {loading && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator color={theme.colors.neonCyan} size="large" />
                    <Text style={styles.loadingText}>Scanning receipt...</Text>
                  </View>
                )}
              </View>

              {parseError ? (
                <NeonCard accentColor={theme.colors.neonPink} style={styles.errorCard}>
                  <Text style={styles.errorText}>{parseError}</Text>
                </NeonCard>
              ) : null}

              <View style={styles.btnRow}>
                <NeonButton label="📷 Camera" onPress={() => pickImage(true)} color={theme.colors.neonCyan}
                  style={{ flex: 1 }} disabled={loading} />
                <NeonButton label="🖼 Library" onPress={() => pickImage(false)} color={theme.colors.neonPurple}
                  style={{ flex: 1 }} disabled={loading} />
              </View>
            </View>
          )}

          {/* Parsed result form */}
          {parsed && !saved && (
            <NeonCard accentColor={theme.colors.neonCyan} style={styles.parsedCard}>
              <SectionLabel label="Parsed" color={theme.colors.neonCyan} style={{ marginBottom: 12 }} />

              <View style={styles.parsedHeader}>
                <Text style={styles.merchantText}>{merchant || 'Unknown merchant'}</Text>
                <AmountText value={-parseFloat(amount || '0')} size={theme.font.xl} />
              </View>

              <NeonInput placeholder="Merchant" value={merchant} onChangeText={setMerchant}
                accentColor={theme.colors.neonCyan} style={styles.formInput} />
              <NeonInput placeholder="Amount" value={amount} onChangeText={setAmount}
                keyboardType="decimal-pad" accentColor={theme.colors.neonCyan} style={styles.formInput} />
              <NeonInput placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate}
                accentColor={theme.colors.neonCyan} style={styles.formInput} />
              <NeonInput placeholder="Note" value={note} onChangeText={setNote}
                accentColor={theme.colors.neonCyan} style={styles.formInput} />

              <SectionLabel label="Category" color={theme.colors.neonCyan} style={{ marginVertical: 8 }} />
              <View style={styles.catGrid}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity key={c} onPress={() => setCategory(c)}
                    style={[styles.catPill, category === c && { backgroundColor: 'rgba(0,240,255,0.15)', borderColor: theme.colors.neonCyan }]}>
                    <Text style={[styles.catText, category === c && { color: theme.colors.neonCyan }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <NeonButton label="Confirm & Save" onPress={confirmExpense} color={theme.colors.neonCyan} style={{ marginTop: 8 }} />
              <NeonButton label="Rescan" onPress={() => { setParsed(null); setParseError(''); }}
                color={theme.colors.textMuted} style={{ marginTop: 8, borderColor: 'rgba(255,255,255,0.2)' }} />
            </NeonCard>
          )}

          {saved && (
            <NeonCard accentColor={theme.colors.neonGreen} style={styles.savedCard}>
              <Text style={styles.savedText}>✓ Expense saved to tracker!</Text>
              <NeonButton label="Scan Another" color={theme.colors.neonCyan}
                onPress={() => { setParsed(null); setSaved(false); setParseError(''); }}
                style={{ marginTop: 12 }} />
            </NeonCard>
          )}
        </ScrollView>
    </View>
  );
}

const CORNER = 20;
const CORNER_W = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: 16, gap: 16, paddingBottom: 40, alignItems: 'center' },
  frameSection: { width: '100%', alignItems: 'center', gap: 16 },
  frame: {
    width: FRAME, height: FRAME,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: theme.colors.neonCyan },
  tl: { top: 0, left: 0, borderTopWidth: CORNER_W, borderLeftWidth: CORNER_W },
  tr: { top: 0, right: 0, borderTopWidth: CORNER_W, borderRightWidth: CORNER_W },
  bl: { bottom: 0, left: 0, borderBottomWidth: CORNER_W, borderLeftWidth: CORNER_W },
  br: { bottom: 0, right: 0, borderBottomWidth: CORNER_W, borderRightWidth: CORNER_W },
  laser: {
    position: 'absolute', left: 0, right: 0, height: 2,
    backgroundColor: theme.colors.neonCyan,
    shadowColor: theme.colors.neonCyan, shadowOpacity: 0.9, shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)', gap: 12,
  },
  loadingText: { color: theme.colors.neonCyan, fontSize: 13 },
  errorCard: { width: '100%' },
  errorText: { color: theme.colors.neonPink, fontSize: 13 },
  btnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  parsedCard: { width: '100%' },
  parsedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  merchantText: { fontSize: 18, fontWeight: '700', color: theme.colors.text, flex: 1, marginRight: 8 },
  formInput: { marginBottom: 10 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  catPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  catText: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '600' },
  savedCard: { width: '100%', alignItems: 'center' },
  savedText: { fontSize: 16, fontWeight: '700', color: theme.colors.neonGreen },
});
