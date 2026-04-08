import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import NeonCard from '../components/NeonCard';
import AmountText from '../components/AmountText';
import SectionLabel from '../components/SectionLabel';
import HubBackground from '../components/HubBackground';
import OverviewScene from '../components/scenes/OverviewScene';
import { theme } from '../theme';
import type { Expense, RevenueEntry, Budget } from '../types';

const CATEGORIES = ['Food', 'Transport', 'Clothing', 'Entertainment', 'Health', 'Other'];
const { width } = Dimensions.get('window');

export default function OverviewScreen() {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [revenue, setRevenue] = useState<RevenueEntry[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        AsyncStorage.getItem(`expenses_${currentUser}`),
        AsyncStorage.getItem(`revenue_${currentUser}`),
        AsyncStorage.getItem(`budget_${currentUser}`),
      ]).then(([e, r, b]) => {
        setExpenses(e ? JSON.parse(e) : []);
        setRevenue(r ? JSON.parse(r) : []);
        setBudget(b ? JSON.parse(b) : null);
      });
    }, [currentUser])
  );

  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
  const monthLabel = targetDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  function inMonth(dateStr: string) {
    const d = new Date(dateStr);
    return d >= monthStart && d <= monthEnd;
  }

  const monthExpenses = expenses.filter(e => inMonth(e.date));
  const monthRevenue = revenue.filter(r => inMonth(r.date));
  const totalSpent = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const totalEarned = monthRevenue.reduce((s, r) => s + r.amount, 0);
  const netPL = totalEarned - totalSpent;

  // Category totals
  const catSpent: Record<string, number> = {};
  CATEGORIES.forEach(c => { catSpent[c] = 0; });
  monthExpenses.forEach(e => { catSpent[e.category] = (catSpent[e.category] ?? 0) + e.amount; });

  // Budget per category
  const catBudget: Record<string, number> = budget?.categories ?? {};

  const chartLabels = CATEGORIES.map(c => c.slice(0, 5));
  const chartData = {
    labels: chartLabels,
    datasets: [{
      data: CATEGORIES.map(c => catSpent[c] ?? 0),
      colors: CATEGORIES.map(c => {
        const spent = catSpent[c] ?? 0;
        const budgeted = Number(catBudget[c]) || 0;
        if (budgeted === 0) return () => theme.colors.neonPurple;
        return spent > budgeted ? () => theme.colors.neonPink : () => theme.colors.neonGreen;
      }),
    }],
  };

  return (
    <View style={styles.container}>
      <HubBackground />
      <View style={styles.sceneBg} pointerEvents="none">
        <OverviewScene width={width} height={200} />
      </View>

      <ScreenHeader title="Overview" accentColor={theme.colors.neonPurple} />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Month selector */}
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={() => setMonthOffset(o => o - 1)} style={styles.arrow}>
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <TouchableOpacity onPress={() => setMonthOffset(o => Math.min(o + 1, 0))} style={styles.arrow}>
            <Text style={[styles.arrowText, monthOffset === 0 && styles.dimArrow]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Summary card */}
        <NeonCard accentColor={theme.colors.neonPurple} style={styles.summaryCard}>
          <View style={styles.statGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Net P&L</Text>
              <AmountText value={netPL} size={theme.font.xl} />
            </View>
            <View style={styles.vDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Earned</Text>
              <Text style={[styles.statVal, { color: theme.colors.neonGreen }]}>${totalEarned.toLocaleString()}</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={[styles.statVal, { color: theme.colors.neonPink }]}>${totalSpent.toLocaleString()}</Text>
            </View>
          </View>
        </NeonCard>

        {/* Bar chart */}
        <NeonCard accentColor={theme.colors.neonPurple} style={styles.chartCard}>
          <SectionLabel label="Budget vs Actual" color={theme.colors.neonPurple} style={{ marginBottom: 12 }} />
          <BarChart
            data={chartData}
            width={width - 64}
            height={180}
            yAxisLabel=""
            yAxisSuffix=""
            withCustomBarColorFromData
            flatColor
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: '#080418',
              backgroundGradientTo: '#080418',
              color: () => theme.colors.neonPurple,
              labelColor: () => theme.colors.textMuted,
              barPercentage: 0.55,
              decimalPlaces: 0,
            }}
            style={{ borderRadius: 12 }}
            showValuesOnTopOfBars
            withInnerLines={false}
          />
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.neonGreen }]} />
              <Text style={styles.legendText}>under</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.neonPink }]} />
              <Text style={styles.legendText}>over budget</Text>
            </View>
          </View>
        </NeonCard>

        {/* Category breakdown */}
        <SectionLabel label="Category Breakdown" color={theme.colors.neonPurple} style={{ marginHorizontal: 16, marginBottom: 8 }} />
        {CATEGORIES.filter(c => catSpent[c] > 0).map(c => {
          const budgeted = Number(catBudget[c]) || 0;
          const spent = catSpent[c];
          const over = budgeted > 0 && spent > budgeted;
          return (
            <NeonCard key={c} accentColor={over ? theme.colors.neonPink : theme.colors.neonPurple} style={styles.catCard}>
              <View style={styles.catRow}>
                <Text style={styles.catName}>{c}</Text>
                <View style={styles.catRight}>
                  {budgeted > 0 && (
                    <Text style={styles.budgetedText}>of ${budgeted.toLocaleString()}</Text>
                  )}
                  <AmountText value={-spent} size={theme.font.md} />
                  {over && (
                    <Text style={styles.overTag}>OVER</Text>
                  )}
                </View>
              </View>
              {budgeted > 0 && (
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, {
                    width: `${Math.min(spent / budgeted, 1) * 100}%`,
                    backgroundColor: over ? theme.colors.neonPink : theme.colors.neonGreen,
                  }]} />
                </View>
              )}
            </NeonCard>
          );
        })}

        {CATEGORIES.every(c => !catSpent[c]) && (
          <Text style={styles.empty}>No data for {monthLabel}.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  sceneBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 200, opacity: 0.3 },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 4 },
  arrow: { padding: 8 },
  arrowText: { fontSize: 24, color: theme.colors.neonPurple, fontWeight: '300' },
  dimArrow: { opacity: 0.3 },
  monthLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  summaryCard: { marginBottom: 0 },
  statGrid: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center', gap: 4, flex: 1 },
  statLabel: { fontSize: 10, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  statVal: { fontSize: 18, fontWeight: '700' },
  vDivider: { width: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.12)' },
  chartCard: {},
  legend: { flexDirection: 'row', gap: 16, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: theme.colors.textMuted },
  catCard: { marginHorizontal: 0 },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catName: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  catRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  budgetedText: { fontSize: 10, color: theme.colors.textDim },
  overTag: { fontSize: 8, fontWeight: '700', color: theme.colors.neonPink, letterSpacing: 1,
    backgroundColor: 'rgba(255,45,155,0.15)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  progressTrack: { height: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: 2, borderRadius: 1 },
  empty: { color: theme.colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 13 },
});
