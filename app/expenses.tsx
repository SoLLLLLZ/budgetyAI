import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  ScrollView, Alert, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { BarChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import NeonCard from '../components/NeonCard';
import NeonButton from '../components/NeonButton';
import NeonInput from '../components/NeonInput';
import AmountText from '../components/AmountText';
import SectionLabel from '../components/SectionLabel';
import HubBackground from '../components/HubBackground';
import ExpensesScene from '../components/scenes/ExpensesScene';
import { theme } from '../theme';
import type { Expense } from '../types';

const CATEGORIES = ['Food', 'Transport', 'Clothing', 'Entertainment', 'Health', 'Other'];
const CAT_COLORS: Record<string, string> = {
  Food: '#ff2d9b', Transport: '#00f0ff', Clothing: '#a78bfa',
  Entertainment: '#f59e0b', Health: '#39ff9a', Other: '#ffffff',
};

const { width } = Dimensions.get('window');

function genId() {
  return Date.now().toString() + Math.random().toString(36).slice(2);
}

export default function ExpensesScreen() {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [tab, setTab] = useState<'Table' | 'Calendar' | 'Breakdown'>('Table');
  const [filterCat, setFilterCat] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const storageKey = `expenses_${currentUser}`;

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(storageKey).then((raw) => {
        setExpenses(raw ? JSON.parse(raw) : []);
      });
    }, [currentUser])
  );

  async function saveExpenses(updated: Expense[]) {
    setExpenses(updated);
    await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
  }

  async function addExpense() {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.');
      return;
    }
    const entry = { id: genId(), date, amount: amt, category, note };
    await saveExpenses([entry, ...expenses]);
    setAmount(''); setNote(''); setDate(new Date().toISOString().split('T')[0]);
    setCategory(CATEGORIES[0]);
    setModalVisible(false);
  }

  async function deleteExpense(id: string) {
    Alert.alert('Delete', 'Remove this expense?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => saveExpenses(expenses.filter(e => e.id !== id)) },
    ]);
  }

  const filtered = expenses.filter(e =>
    (filterCat === 'All' || e.category === filterCat) &&
    (tab !== 'Calendar' || !selectedDay || e.date === selectedDay)
  );

  // Calendar marked dates
  const markedDates: Record<string, { dots?: { color: string }[]; marked?: boolean; selected?: boolean; selectedColor?: string }> = {};
  expenses.forEach(e => {
    if (!markedDates[e.date]) {
      markedDates[e.date] = { dots: [], marked: true };
    }
    const color = CAT_COLORS[e.category] ?? '#fff';
    if (!markedDates[e.date].dots!.find(d => d.color === color)) {
      markedDates[e.date].dots!.push({ color });
    }
  });
  if (selectedDay) {
    markedDates[selectedDay] = { ...(markedDates[selectedDay] ?? {}), selected: true, selectedColor: 'rgba(0,240,255,0.3)' };
  }

  // Breakdown data
  const catTotals: Record<string, number> = {};
  CATEGORIES.forEach(c => { catTotals[c] = 0; });
  expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] ?? 0) + e.amount; });
  const chartData = {
    labels: CATEGORIES.map(c => c.slice(0, 5)),
    datasets: [{ data: CATEGORIES.map(c => catTotals[c] || 0) }],
  };

  return (
    <View style={styles.container}>
      <HubBackground />
      {/* Scene bleed at top */}
      <View style={styles.sceneBg} pointerEvents="none">
        <ExpensesScene width={width} height={220} />
      </View>

      <ScreenHeader title="Expenses" accentColor={theme.colors.neonCyan} />

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['Table', 'Calendar', 'Breakdown'] as const).map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tabPill, tab === t && { backgroundColor: 'rgba(0,240,255,0.15)', borderColor: theme.colors.neonCyan }]}>
            <Text style={[styles.tabText, tab === t && { color: theme.colors.neonCyan }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'Table' && (
        <>
          {/* Category filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
            {['All', ...CATEGORIES].map(c => (
              <TouchableOpacity key={c} onPress={() => setFilterCat(c)}
                style={[styles.filterPill, filterCat === c && { backgroundColor: 'rgba(0,240,255,0.15)', borderColor: theme.colors.neonCyan }]}>
                <Text style={[styles.filterText, filterCat === c && { color: theme.colors.neonCyan }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={filtered}
            keyExtractor={i => i.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>No expenses yet. Tap + to add one.</Text>}
            renderItem={({ item }) => (
              <NeonCard accentColor={CAT_COLORS[item.category] || '#fff'} style={styles.expenseRow}>
                <View style={styles.rowLeft}>
                  <View style={[styles.dot, { backgroundColor: CAT_COLORS[item.category] || '#fff' }]} />
                  <View>
                    <Text style={styles.catLabel}>{item.category}</Text>
                    {item.note ? <Text style={styles.noteText}>{item.note}</Text> : null}
                    <Text style={styles.dateText}>{item.date}</Text>
                  </View>
                </View>
                <View style={styles.rowRight}>
                  <AmountText value={-item.amount} size={theme.font.lg} />
                  <TouchableOpacity onPress={() => deleteExpense(item.id)} style={styles.deleteBtn}>
                    <Text style={styles.deleteX}>×</Text>
                  </TouchableOpacity>
                </View>
              </NeonCard>
            )}
          />
        </>
      )}

      {tab === 'Calendar' && (
        <ScrollView contentContainerStyle={styles.list}>
          <Calendar
            markingType="multi-dot"
            markedDates={markedDates}
            onDayPress={d => setSelectedDay(selectedDay === d.dateString ? null : d.dateString)}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'rgba(8,4,20,0.75)',
              textSectionTitleColor: theme.colors.textMuted,
              selectedDayBackgroundColor: theme.colors.neonCyan,
              selectedDayTextColor: '#000',
              todayTextColor: theme.colors.neonCyan,
              dayTextColor: theme.colors.text,
              textDisabledColor: theme.colors.textDim,
              dotColor: theme.colors.neonPink,
              monthTextColor: theme.colors.text,
              arrowColor: theme.colors.neonCyan,
            }}
            style={styles.calendar}
          />
          {selectedDay && (
            <View style={styles.calDaySection}>
              <SectionLabel label={selectedDay} color={theme.colors.neonCyan} style={{ marginBottom: 8 }} />
              {filtered.length > 0 ? filtered.map(e => (
                <NeonCard key={e.id} accentColor={CAT_COLORS[e.category] || '#fff'} style={styles.expenseRow}>
                  <View style={styles.rowLeft}>
                    <View style={[styles.dot, { backgroundColor: CAT_COLORS[e.category] || '#fff' }]} />
                    <Text style={styles.catLabel}>{e.category}{e.note ? ` — ${e.note}` : ''}</Text>
                  </View>
                  <AmountText value={-e.amount} size={theme.font.lg} />
                </NeonCard>
              )) : <Text style={styles.empty}>No expenses on this day.</Text>}
            </View>
          )}
        </ScrollView>
      )}

      {tab === 'Breakdown' && (
        <ScrollView contentContainerStyle={styles.list}>
          <NeonCard accentColor={theme.colors.neonCyan} style={{ marginBottom: theme.spacing.md }}>
            <SectionLabel label="Budget vs Actual" color={theme.colors.neonCyan} style={{ marginBottom: 12 }} />
            <BarChart
              data={chartData}
              width={width - 60}
              height={180}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: '#08040F',
                backgroundGradientTo: '#08040F',
                color: (opacity = 1) => `rgba(0,240,255,${opacity})`,
                labelColor: () => theme.colors.textMuted,
                barPercentage: 0.6,
                decimalPlaces: 0,
              }}
              style={{ borderRadius: 12 }}
              showValuesOnTopOfBars
              withInnerLines={false}
            />
          </NeonCard>
          {CATEGORIES.map(c => catTotals[c] > 0 && (
            <NeonCard key={c} accentColor={CAT_COLORS[c]} style={styles.expenseRow}>
              <View style={styles.rowLeft}>
                <View style={[styles.dot, { backgroundColor: CAT_COLORS[c] }]} />
                <Text style={styles.catLabel}>{c}</Text>
              </View>
              <AmountText value={-catTotals[c]} size={theme.font.lg} />
            </NeonCard>
          ))}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add expense modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets={true}
          >
              <View style={styles.modalSheet}>
                <Text style={styles.modalTitle}>Add Expense</Text>

                <NeonInput placeholder="Amount (e.g. 42.50)" value={amount}
                  onChangeText={setAmount} keyboardType="decimal-pad"
                  accentColor={theme.colors.neonCyan} style={styles.modalInput} />

                <NeonInput placeholder="Note (optional)" value={note}
                  onChangeText={setNote} accentColor={theme.colors.neonCyan} style={styles.modalInput} />

                <NeonInput placeholder="Date (YYYY-MM-DD)" value={date}
                  onChangeText={setDate} accentColor={theme.colors.neonCyan} style={styles.modalInput} />

                <SectionLabel label="Category" color={theme.colors.neonCyan} style={{ marginBottom: 8, marginTop: 4 }} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} keyboardShouldPersistTaps="handled">
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {CATEGORIES.map(c => (
                      <TouchableOpacity key={c} onPress={() => setCategory(c)}
                        style={[styles.filterPill, category === c && { backgroundColor: 'rgba(0,240,255,0.15)', borderColor: theme.colors.neonCyan }]}>
                        <Text style={[styles.filterText, category === c && { color: theme.colors.neonCyan }]}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <NeonButton label="Add Expense" onPress={addExpense} color={theme.colors.neonCyan} style={{ marginBottom: 8 }} />
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
  sceneBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 220, opacity: 0.4 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  tabPill: {
    flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: theme.radius.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  tabText: { fontSize: 12, fontWeight: '600', color: theme.colors.textMuted },
  filterScroll: { maxHeight: 44 },
  filterContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  filterPill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  filterText: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '600' },
  list: { padding: 16, gap: 10, paddingBottom: 100 },
  expenseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  catLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  noteText: { fontSize: 11, color: theme.colors.textMuted },
  dateText: { fontSize: 10, color: theme.colors.textDim },
  deleteBtn: { padding: 4 },
  deleteX: { fontSize: 18, color: theme.colors.textMuted, lineHeight: 20 },
  empty: { color: theme.colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 13 },
  calendar: { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  calDaySection: { gap: 8 },
  fab: {
    position: 'absolute', bottom: 32, right: 24, width: 52, height: 52, borderRadius: 26,
    backgroundColor: theme.colors.neonCyan, justifyContent: 'center', alignItems: 'center',
    shadowColor: theme.colors.neonCyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 12,
  },
  fabText: { fontSize: 28, color: '#000', fontWeight: '300', lineHeight: 32, marginTop: -2 },
  modalBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalScrollContent: { flexGrow: 1, justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: theme.colors.surfaceModal, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 0,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 16 },
  modalInput: { marginBottom: 12 },
});
