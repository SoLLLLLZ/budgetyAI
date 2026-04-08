import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import HubBackground from '../components/HubBackground';
import RetrowaveSun from '../components/RetrowaveSun';
import BudgetScene from '../components/scenes/BudgetScene';
import ExpensesScene from '../components/scenes/ExpensesScene';
import RevenueScene from '../components/scenes/RevenueScene';
import OverviewScene from '../components/scenes/OverviewScene';
import ScanScene from '../components/scenes/ScanScene';
import AccountScene from '../components/scenes/AccountScene';
import { theme } from '../theme';
import type { Expense, RevenueEntry, Budget } from '../types';

const { width } = Dimensions.get('window');
const PADDING = 14;
const GAP = 10;
const FULL_W = width - PADDING * 2;
const HALF_W = (FULL_W - GAP) / 2;

// --- Widget helpers ---
function formatMoney(n: number) {
  return '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getWeekStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function getMonthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

// --- Hub Widget wrapper ---
function Widget({ children, style, onPress, accentColor = theme.colors.neonPurple }: {
  children: React.ReactNode;
  style?: object;
  onPress: () => void;
  accentColor?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        {
          borderColor: accentColor,
          shadowColor: accentColor,
        },
        style,
      ]}
    >
      {children}
    </TouchableOpacity>
  );
}

function Scrim() {
  return <View style={styles.scrim} pointerEvents="none" />;
}

export default function HubScreen() {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [revenue, setRevenue] = useState<RevenueEntry[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [lastScan, setLastScan] = useState<{ merchant: string; amount: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!currentUser) return;
      Promise.all([
        AsyncStorage.getItem(`expenses_${currentUser}`),
        AsyncStorage.getItem(`revenue_${currentUser}`),
        AsyncStorage.getItem(`budget_${currentUser}`),
        AsyncStorage.getItem(`lastScan_${currentUser}`),
      ]).then(([e, r, b, s]) => {
        setExpenses(e ? JSON.parse(e) : []);
        setRevenue(r ? JSON.parse(r) : []);
        setBudget(b ? JSON.parse(b) : null);
        setLastScan(s ? JSON.parse(s) : null);
      });
    }, [currentUser])
  );

  // Computed values
  const weekStart = getWeekStart();
  const monthStart = getMonthStart();

  const weekExpenses = expenses
    .filter((e) => new Date(e.date) >= weekStart)
    .reduce((sum, e) => sum + e.amount, 0);

  const monthRevenue = revenue
    .filter((r) => new Date(r.date) >= monthStart)
    .reduce((sum, r) => sum + r.amount, 0);

  const monthExpenses = expenses
    .filter((e) => new Date(e.date) >= monthStart)
    .reduce((sum, e) => sum + e.amount, 0);

  const netPL = monthRevenue - monthExpenses;

  const totalBudget: number = budget
    ? Object.values(budget.categories ?? {}).reduce((s, v) => s + (Number(v) || 0), 0)
    : 0;

  const budgetPct = totalBudget > 0 ? Math.min(monthExpenses / totalBudget, 1) : 0;

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate();

  const monthLabel = now.toLocaleString('default', { month: 'long' });

  // Top expense categories this week
  const catMap: Record<string, number> = {};
  expenses.filter(e => new Date(e.date) >= weekStart).forEach(e => {
    catMap[e.category] = (catMap[e.category] ?? 0) + e.amount;
  });
  const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // Last revenue entry
  const lastRev = revenue.length > 0
    ? [...revenue].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  // Initials
  const initials = currentUser ? currentUser.slice(0, 2).toUpperCase() : 'ME';

  return (
    <View style={styles.container}>
      <HubBackground />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>ようこそ — WELCOME BACK</Text>
            <Text style={styles.appTitle}>
              Budget<Text style={styles.appTitleAccent}>AI</Text>
            </Text>
            <Text style={styles.dateLabel}>
              {monthLabel.toUpperCase()} {now.getFullYear()}
            </Text>
          </View>
          <Text style={styles.kanji}>予算{'\n'}AI</Text>
        </View>

        {/* Sun */}
        <View style={styles.sunRow}>
          <RetrowaveSun size={130} />
        </View>

        {/* Grid */}
        <View style={styles.grid}>

          {/* Budget — full width */}
          <Widget
            accentColor={theme.colors.neonPink}
            style={[styles.widgetFull, { height: FULL_W / 2.1 }]}
            onPress={() => router.push('/budget')}
          >
            <View style={StyleSheet.absoluteFill}>
              <BudgetScene width={FULL_W} height={FULL_W / 2.1} />
            </View>
            <Scrim />
            <View style={styles.dataOverlay}>
              <Text style={[styles.widgetLabel, { color: theme.colors.neonPink }]}>BUDGET</Text>
              <View style={styles.budgetRow}>
                <View>
                  <Text style={styles.bigNumber}>{formatMoney(monthExpenses)}</Text>
                  <Text style={styles.dimText}>{totalBudget > 0 ? `of ${formatMoney(totalBudget)} · ${monthLabel}` : `No budget set · ${monthLabel}`}</Text>
                </View>
                {totalBudget > 0 && (
                  <View style={styles.pctCol}>
                    <Text style={[styles.pctText, { color: theme.colors.neonPink }]}>
                      {Math.round(budgetPct * 100)}%
                    </Text>
                    <Text style={styles.dimText}>{daysLeft} days left</Text>
                  </View>
                )}
              </View>
              {totalBudget > 0 && (
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${budgetPct * 100}%` }]} />
                </View>
              )}
            </View>
          </Widget>

          {/* Expenses + Revenue row */}
          <View style={styles.halfRow}>
            <Widget
              accentColor={theme.colors.neonCyan}
              style={[styles.widgetHalf, { height: HALF_W }]}
              onPress={() => router.push('/expenses')}
            >
              <View style={StyleSheet.absoluteFill}>
                <ExpensesScene width={HALF_W} height={HALF_W} />
              </View>
              <Scrim />
              <View style={styles.dataOverlay}>
                <Text style={[styles.widgetLabel, { color: theme.colors.neonCyan }]}>EXPENSES</Text>
                <Text style={styles.bigNumber}>{formatMoney(weekExpenses)}</Text>
                <Text style={styles.dimText}>this week</Text>
                <View style={styles.divider} />
                {topCats.length > 0 ? topCats.map(([cat, amt]) => (
                  <View key={cat} style={styles.catRow}>
                    <Text style={styles.catName}>{cat}</Text>
                    <Text style={styles.catAmt}>{formatMoney(amt)}</Text>
                  </View>
                )) : <Text style={styles.dimText}>No expenses yet</Text>}
              </View>
            </Widget>

            <Widget
              accentColor={theme.colors.neonGreen}
              style={[styles.widgetHalf, { height: HALF_W }]}
              onPress={() => router.push('/revenue')}
            >
              <View style={StyleSheet.absoluteFill}>
                <RevenueScene width={HALF_W} height={HALF_W} />
              </View>
              <Scrim />
              <View style={styles.dataOverlay}>
                <Text style={[styles.widgetLabel, { color: theme.colors.neonGreen }]}>REVENUE</Text>
                <Text style={[styles.bigNumber, { color: theme.colors.neonGreen, shadowColor: theme.colors.neonGreen }]}>
                  {formatMoney(monthRevenue)}
                </Text>
                <Text style={styles.dimText}>this month</Text>
                {lastRev && (
                  <>
                    <View style={styles.divider} />
                    <Text style={styles.catName}>Last</Text>
                    <Text style={[styles.catAmt, { color: theme.colors.neonGreen }]}>+{formatMoney(lastRev.amount)}</Text>
                    <View style={[styles.pill, { borderColor: theme.colors.neonGreen, backgroundColor: 'rgba(57,255,154,0.1)' }]}>
                      <Text style={[styles.pillText, { color: theme.colors.neonGreen }]}>
                        {lastRev.source} · {new Date(lastRev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </Widget>
          </View>

          {/* Overview — full width */}
          <Widget
            accentColor={theme.colors.neonPurple}
            style={[styles.widgetFull, { height: FULL_W / 2.1 }]}
            onPress={() => router.push('/overview')}
          >
            <View style={StyleSheet.absoluteFill}>
              <OverviewScene width={FULL_W} height={FULL_W / 2.1} />
            </View>
            <Scrim />
            <View style={styles.dataOverlay}>
              <Text style={[styles.widgetLabel, { color: theme.colors.neonPurple }]}>OVERVIEW</Text>
              <View style={styles.overviewRow}>
                <View>
                  <Text style={styles.dimText}>Net P&L · {monthLabel}</Text>
                  <Text style={[
                    styles.bigNumber,
                    { color: netPL >= 0 ? theme.colors.neonGreen : theme.colors.neonPink,
                      shadowColor: netPL >= 0 ? theme.colors.neonGreen : theme.colors.neonPink }
                  ]}>
                    {netPL >= 0 ? '+' : '-'}{formatMoney(netPL)}
                  </Text>
                </View>
                <View style={styles.vertDivider} />
                <View style={styles.statCol}>
                  <Text style={styles.dimText}>Earned</Text>
                  <Text style={[styles.statVal, { color: theme.colors.neonGreen }]}>{formatMoney(monthRevenue)}</Text>
                  <Text style={styles.dimText}>Spent</Text>
                  <Text style={[styles.statVal, { color: theme.colors.neonPink }]}>{formatMoney(monthExpenses)}</Text>
                </View>
              </View>
            </View>
          </Widget>

          {/* Scan + Account row */}
          <View style={styles.halfRow}>
            <Widget
              accentColor={theme.colors.neonCyan}
              style={[styles.widgetHalf, { height: HALF_W }]}
              onPress={() => router.push('/scan')}
            >
              <View style={StyleSheet.absoluteFill}>
                <ScanScene width={HALF_W} height={HALF_W} />
              </View>
              <Scrim />
              <View style={styles.dataOverlay}>
                <Text style={[styles.widgetLabel, { color: theme.colors.neonCyan }]}>SCAN</Text>
                <Text style={styles.bigNumber}>Receipt</Text>
                {lastScan ? (
                  <Text style={styles.dimText}>Last: {lastScan.merchant} {formatMoney(lastScan.amount)}</Text>
                ) : (
                  <Text style={styles.dimText}>Tap to scan</Text>
                )}
                <View style={[styles.pill, { borderColor: theme.colors.neonCyan, backgroundColor: 'rgba(0,240,255,0.08)' }]}>
                  <Text style={[styles.pillText, { color: theme.colors.neonCyan }]}>Tap to scan</Text>
                </View>
              </View>
            </Widget>

            <Widget
              accentColor={theme.colors.neonPurple}
              style={[styles.widgetHalf, { height: HALF_W }]}
              onPress={() => router.push('/account')}
            >
              <View style={StyleSheet.absoluteFill}>
                <AccountScene width={HALF_W} height={HALF_W} />
              </View>
              <Scrim />
              <View style={[styles.dataOverlay, { bottom: undefined, top: 0 }]}>
                <Text style={[styles.widgetLabel, { color: theme.colors.neonPurple }]}>ACCOUNT</Text>
                <View style={styles.avatarRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{currentUser}</Text>
                    <Text style={styles.dimText}>{monthLabel} {now.getFullYear()}</Text>
                    <View style={[styles.pill, { borderColor: theme.colors.neonPurple, backgroundColor: 'rgba(167,139,250,0.1)', marginTop: 4 }]}>
                      <Text style={[styles.pillText, { color: theme.colors.neonPurple }]}>Logged in</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Widget>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingBottom: 40 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: PADDING,
    paddingTop: 56,
    paddingBottom: 0,
  },
  greeting: {
    fontSize: 9,
    color: theme.colors.neonPurple,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
    shadowColor: theme.colors.neonPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  appTitleAccent: { color: theme.colors.neonPink },
  dateLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.28)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  kanji: {
    fontSize: 11,
    color: 'rgba(167,139,250,0.5)',
    textAlign: 'right',
    letterSpacing: 1,
    lineHeight: 16,
  },

  sunRow: { alignItems: 'center', marginTop: -10, marginBottom: -20 },

  grid: { paddingHorizontal: PADDING, gap: GAP, marginTop: 20 },

  widgetFull: {
    width: FULL_W,
    borderRadius: theme.radius.widget,
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  widgetHalf: {
    width: HALF_W,
    borderRadius: theme.radius.widget,
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  halfRow: { flexDirection: 'row', gap: GAP },

  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  dataOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 13,
  },

  widgetLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  bigNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  dimText: {
    fontSize: 9,
    color: theme.colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: 4,
  },
  catRow: { flexDirection: 'row', justifyContent: 'space-between' },
  catName: { fontSize: 9, color: theme.colors.textMuted },
  catAmt: { fontSize: 9, color: theme.colors.text, fontWeight: '600' },

  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  pctCol: { alignItems: 'flex-end' },
  pctText: {
    fontSize: 18,
    fontWeight: '700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 1,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: 2,
    backgroundColor: theme.colors.neonPink,
    shadowColor: theme.colors.neonPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },

  overviewRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  vertDivider: { width: 1, height: 50, backgroundColor: 'rgba(255,255,255,0.12)' },
  statCol: { gap: 2 },
  statVal: { fontSize: 13, fontWeight: '700' },

  pill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: theme.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  pillText: { fontSize: 8, fontWeight: '700' },

  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.neonPink,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.neonPurple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  avatarText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  userName: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
});
