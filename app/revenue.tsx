import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert, Dimensions, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import NeonCard from '../components/NeonCard';
import NeonButton from '../components/NeonButton';
import NeonInput from '../components/NeonInput';
import AmountText from '../components/AmountText';
import SectionLabel from '../components/SectionLabel';
import HubBackground from '../components/HubBackground';
import RevenueScene from '../components/scenes/RevenueScene';
import { theme } from '../theme';
import type { RevenueEntry } from '../types';

const SOURCES = ['Salary', 'Freelance', 'Gift', 'Investment', 'Other'];
const { width } = Dimensions.get('window');

function genId() {
  return Date.now().toString() + Math.random().toString(36).slice(2);
}

export default function RevenueScreen() {
  const { currentUser } = useAuth();
  const [revenue, setRevenue] = useState<RevenueEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState(SOURCES[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const storageKey = `revenue_${currentUser}`;

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(storageKey).then(raw => setRevenue(raw ? JSON.parse(raw) : []));
    }, [currentUser])
  );

  async function save(updated: RevenueEntry[]) {
    setRevenue(updated);
    await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
  }

  async function addRevenue() {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { Alert.alert('Invalid', 'Enter a valid amount.'); return; }
    await save([{ id: genId(), date, amount: amt, source, note }, ...revenue]);
    setAmount(''); setNote(''); setDate(new Date().toISOString().split('T')[0]);
    setSource(SOURCES[0]); setModalVisible(false);
  }

  async function deleteRevenue(id: string) {
    Alert.alert('Delete', 'Remove this entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => save(revenue.filter(r => r.id !== id)) },
    ]);
  }

  const monthStart = new Date();
  monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const monthTotal = revenue.filter(r => new Date(r.date) >= monthStart).reduce((s, r) => s + r.amount, 0);

  // Source breakdown bars
  const srcMap: Record<string, number> = {};
  SOURCES.forEach(s => { srcMap[s] = 0; });
  revenue.filter(r => new Date(r.date) >= monthStart).forEach(r => {
    srcMap[r.source] = (srcMap[r.source] || 0) + r.amount;
  });
  const maxSrc = Math.max(...Object.values(srcMap), 1);

  return (
    <View style={styles.container}>
      <HubBackground />
      <View style={styles.sceneBg} pointerEvents="none">
        <RevenueScene width={width} height={280} />
      </View>

      <ScreenHeader title="Revenue" accentColor={theme.colors.neonGreen} />

      <FlatList
        data={revenue}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            {/* Total card */}
            <NeonCard accentColor={theme.colors.neonGreen} style={styles.totalCard}>
              <SectionLabel label="Total This Month" color={theme.colors.neonGreen} style={{ marginBottom: 6 }} />
              <AmountText value={monthTotal} size={theme.font.xxl} />
              <Text style={styles.dimText}>total this month</Text>

              {/* Source bars */}
              {SOURCES.filter(s => srcMap[s] > 0).map(s => (
                <View key={s} style={styles.srcRow}>
                  <Text style={styles.srcName}>{s}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${(srcMap[s] / maxSrc) * 100}%` }]} />
                  </View>
                  <Text style={styles.srcAmt}>${srcMap[s].toLocaleString()}</Text>
                </View>
              ))}
            </NeonCard>

            <SectionLabel label="Recent" color={theme.colors.neonGreen} style={{ marginBottom: 8, marginTop: 4 }} />
          </>
        }
        ListEmptyComponent={<Text style={styles.empty}>No revenue yet. Tap + to add.</Text>}
        renderItem={({ item }) => (
          <NeonCard accentColor={theme.colors.neonGreen} style={styles.entryRow}>
            <View>
              <Text style={styles.srcLabel}>{item.source}</Text>
              <Text style={styles.dateText}>{item.date}{item.note ? ` — ${item.note}` : ''}</Text>
            </View>
            <View style={styles.rowRight}>
              <AmountText value={item.amount} size={theme.font.lg} />
              <TouchableOpacity onPress={() => deleteRevenue(item.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteX}>×</Text>
              </TouchableOpacity>
            </View>
          </NeonCard>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets={true}
          >
              <View style={styles.modalSheet}>
                <Text style={styles.modalTitle}>Add Revenue</Text>

                <NeonInput placeholder="Amount" value={amount} onChangeText={setAmount}
                  keyboardType="decimal-pad" accentColor={theme.colors.neonGreen} style={styles.modalInput} />
                <NeonInput placeholder="Note (optional)" value={note} onChangeText={setNote}
                  accentColor={theme.colors.neonGreen} style={styles.modalInput} />
                <NeonInput placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate}
                  accentColor={theme.colors.neonGreen} style={styles.modalInput} />

                <SectionLabel label="Source" color={theme.colors.neonGreen} style={{ marginBottom: 8, marginTop: 4 }} />
                <View style={styles.sourceGrid}>
                  {SOURCES.map(s => (
                    <TouchableOpacity key={s} onPress={() => setSource(s)}
                      style={[styles.filterPill, source === s && { backgroundColor: 'rgba(57,255,154,0.15)', borderColor: theme.colors.neonGreen }]}>
                      <Text style={[styles.filterText, source === s && { color: theme.colors.neonGreen }]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <NeonButton label="Add Revenue" onPress={addRevenue} color={theme.colors.neonGreen} style={{ marginTop: 8, marginBottom: 8 }} />
                <NeonButton label="Cancel" onPress={() => setModalVisible(false)} color={theme.colors.textMuted} style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
              </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  sceneBg: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 280, opacity: 0.5 },
  list: { padding: 16, gap: 10, paddingBottom: 100 },
  totalCard: { marginBottom: 16 },
  dimText: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
  srcRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  srcName: { fontSize: 11, color: theme.colors.textMuted, width: 70 },
  barTrack: { flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: 3, backgroundColor: theme.colors.neonGreen, borderRadius: 2,
    shadowColor: theme.colors.neonGreen, shadowOpacity: 0.6, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  srcAmt: { fontSize: 11, color: theme.colors.neonGreen, fontWeight: '600', width: 54, textAlign: 'right' },
  entryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  srcLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  dateText: { fontSize: 10, color: theme.colors.textDim, marginTop: 2 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  deleteBtn: { padding: 4 },
  deleteX: { fontSize: 18, color: theme.colors.textMuted, lineHeight: 20 },
  empty: { color: theme.colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 13 },
  fab: {
    position: 'absolute', bottom: 32, right: 24, width: 52, height: 52, borderRadius: 26,
    backgroundColor: theme.colors.neonGreen, justifyContent: 'center', alignItems: 'center',
    shadowColor: theme.colors.neonGreen, shadowOpacity: 0.8, shadowRadius: 12, shadowOffset: { width: 0, height: 0 },
  },
  fabText: { fontSize: 28, color: '#000', fontWeight: '300', lineHeight: 32, marginTop: -2 },
  modalBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalScrollContent: { flexGrow: 1, justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: theme.colors.surfaceModal, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 16 },
  modalInput: { marginBottom: 12 },
  sourceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  filterPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  filterText: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '600' },
});
