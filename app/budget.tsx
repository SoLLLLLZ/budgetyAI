import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
  type FlatList as FlatListType,
} from 'react-native';
import type { ChatCompletionMessageParam } from 'openai/resources';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import HubBackground from '../components/HubBackground';
import SectionLabel from '../components/SectionLabel';
import NeonButton from '../components/NeonButton';
import NeonInput from '../components/NeonInput';
import NeonCard from '../components/NeonCard';
import { theme } from '../theme';
import OpenAI from 'openai';

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

const SYSTEM_PROMPT = `You are BudgetAI, a friendly and conversational personal budget planner assistant. Your job is to help users plan their monthly budget through natural, friendly conversation — NOT a rigid Q&A.

Guide the user through:
1. Their profession/situation (student, working professional, retired, etc.)
2. Their main expense types (food, transport, clothing, luxury, etc.)
3. Their income (if any)
4. Their goal for the month (save more, spend freely, etc.)
5. Any special situations this month (trips, big purchases, etc.)

After gathering this info, suggest realistic spending amounts per category. Present them in a clear format like:
• Food: $X
• Transport: $Y
• etc.

Be warm, encouraging, and conversational. Keep responses concise (2-4 sentences max per turn).`;

const INTRO_MESSAGE: ChatCompletionMessageParam = {
  role: 'assistant',
  content: "Hey! I'm BudgetAI 👋 I'm here to help you plan your monthly budget. Let's start — tell me a little about yourself. Are you a student, working professional, retired, or something else?",
};

function RobotIcon({ color, size = 28 }: { color: string; size?: number }) {
  return (
    <View style={[styles.robotIcon, { borderColor: color, width: size, height: size, borderRadius: size / 4 }]}>
      <Text style={{ fontSize: size * 0.5, textAlign: 'center', lineHeight: size }}>🤖</Text>
    </View>
  );
}

export default function BudgetScreen() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'manual'>('chat');
  const [budget, setBudget] = useState<{ categories: Record<string, number>; createdAt: string } | null>(null);
  const [basicInfo, setBasicInfo] = useState<{ conversationSummary: string } | null>(null);
  const listRef = useRef<FlatListType<ChatCompletionMessageParam>>(null);
  const lastUserForMessagesRef = useRef<string | null | undefined>(undefined);
  const prevMessageCountRef = useRef(0);

  const budgetKey = `budget_${currentUser}`;
  const basicInfoKey = `basicInfo_${currentUser}`;

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        AsyncStorage.getItem(budgetKey),
        AsyncStorage.getItem(basicInfoKey),
      ]).then(([b, bi]) => {
        if (b) setBudget(JSON.parse(b));
        if (bi) setBasicInfo(JSON.parse(bi));
      });

      setMessages((prev) => {
        if (lastUserForMessagesRef.current !== currentUser) {
          lastUserForMessagesRef.current = currentUser;
          return [INTRO_MESSAGE];
        }
        if (prev.length > 0) return prev;
        return [INTRO_MESSAGE];
      });
    }, [currentUser])
  );

  useEffect(() => {
    const n = messages.length;
    if (n > prevMessageCountRef.current) {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
    prevMessageCountRef.current = n;
  }, [messages.length]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const newMessages: ChatCompletionMessageParam[] = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages: ChatCompletionMessageParam[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...(basicInfo ? [{ role: 'system' as const, content: `User's basic info: ${JSON.stringify(basicInfo)}` }] : []),
        ...newMessages,
      ];

      console.log('[BudgetAI] Sending to OpenRouter:', JSON.stringify(apiMessages).slice(0, 200));

      const completion = await client.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: apiMessages,
        max_tokens: 400,
      });

      const reply = completion.choices[0].message.content ?? '';
      console.log('[BudgetAI] Response:', reply);

      const updated: ChatCompletionMessageParam[] = [...newMessages, { role: 'assistant' as const, content: reply }];
      setMessages(updated);

      // Save basic info after a few turns
      if (!basicInfo && updated.length > 4) {
        const info = { conversationSummary: updated.slice(0, 6).map(m => `${m.role}: ${m.content}`).join('\n') };
        await AsyncStorage.setItem(`basicInfo_${currentUser}`, JSON.stringify(info));
        setBasicInfo(info);
      }
    } catch (err: unknown) {
      console.error('[BudgetAI] API error:', err);
      const e = err as { message?: string; status?: number };
      const errMsg = e.message?.includes('PLACEHOLDER') || e.status === 401
        ? 'API key not configured. Please add your OpenRouter key in the app.'
        : `Error: ${e.message}`;
      setMessages(prev => [...prev, { role: 'assistant' as const, content: errMsg }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  async function saveBudget(categories: Record<string, number>) {
    const b = { categories, createdAt: new Date().toISOString() };
    setBudget(b);
    await AsyncStorage.setItem(budgetKey, JSON.stringify(b));
    Alert.alert('Budget Saved', 'Your budget has been saved!');
  }

  return (
    <View style={styles.container}>
      <HubBackground />
      <ScreenHeader title="Budget Chat" accentColor={theme.colors.neonPink} />

      {/* Mode toggle */}
      <View style={styles.modeRow}>
        {(['chat', 'manual'] as const).map(m => (
          <TouchableOpacity key={m} onPress={() => setMode(m)}
            style={[styles.modePill, mode === m && { backgroundColor: 'rgba(255,45,155,0.15)', borderColor: theme.colors.neonPink }]}>
            <Text style={[styles.modeText, mode === m && { color: theme.colors.neonPink }]}>
              {m === 'chat' ? '🤖 AI Chat' : '✏️ Manual'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'chat' ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.chatContainer} keyboardVerticalOffset={20}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={styles.messageList}
            keyboardDismissMode="none"
            renderItem={({ item }) => (
              <View style={[styles.messageRow, item.role === 'user' ? styles.userRow : styles.aiRow]}>
                {item.role === 'assistant' && <RobotIcon color={theme.colors.neonCyan} />}
                <View style={[
                  styles.bubble,
                  item.role === 'user' ? styles.userBubble : styles.aiBubble,
                ]}>
                  {item.role === 'assistant' && (
                    <Text style={styles.aiLabel}>BudgetAI</Text>
                  )}
                  <Text style={styles.bubbleText}>{typeof item.content === 'string' ? item.content : ''}</Text>
                </View>
                {item.role === 'user' && <RobotIcon color={theme.colors.neonPink} />}
              </View>
            )}
            ListFooterComponent={loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={theme.colors.neonCyan} size="small" />
                <Text style={styles.typingText}>BudgetAI is thinking...</Text>
              </View>
            ) : null}
          />

          <View style={styles.inputBar}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Message..."
              placeholderTextColor={theme.colors.textDim}
              style={styles.chatInput}
              multiline
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity onPress={sendMessage} disabled={loading || !input.trim()} style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.4 }]}>
              <Text style={styles.sendArrow}>▶</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <ManualBudgetEditor budget={budget} onSave={saveBudget} />
      )}
    </View>
  );
}

function ManualBudgetEditor({
  budget,
  onSave,
}: {
  budget: { categories: Record<string, number>; createdAt: string } | null;
  onSave: (cats: Record<string, number>) => void;
}) {
  const [cats, setCats] = useState<Record<string, string>>(() => {
    const existing = budget?.categories ?? {};
    const init: Record<string, string> = {};
    CATEGORIES.forEach(c => { init[c] = existing[c] !== undefined ? String(existing[c]) : ''; });
    return init;
  });

  function handleSave() {
    const result: Record<string, number> = {};
    for (const [k, v] of Object.entries(cats)) {
      const n = parseFloat(v as string);
      result[k] = isNaN(n) ? 0 : n;
    }
    onSave(result);
  }

  const total = Object.values(cats).reduce((s, v) => s + (parseFloat(v) || 0), 0);

  return (
    <ScrollView
      contentContainerStyle={styles.manualScroll}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <SectionLabel label="Monthly Budget" color={theme.colors.neonPink} style={{ marginBottom: 16 }} />
      {CATEGORIES.map(c => (
        <View key={c} style={styles.catRow}>
          <Text style={styles.catLabel}>{c}</Text>
          <NeonInput
            value={cats[c]}
            onChangeText={(v: string) => setCats(prev => ({ ...prev, [c]: v }))}
            placeholder="0"
            keyboardType="decimal-pad"
            accentColor={theme.colors.neonPink}
            style={styles.catInput}
          />
        </View>
      ))}
      <NeonCard accentColor={theme.colors.neonPink} style={styles.totalCard}>
        <Text style={styles.totalLabel}>Monthly Total</Text>
        <Text style={styles.totalValue}>${total.toLocaleString('en-US', { minimumFractionDigits: 0 })}</Text>
      </NeonCard>
      <NeonButton label="Save Budget" onPress={handleSave} color={theme.colors.neonPink} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  modeRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  modePill: {
    flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: theme.radius.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  modeText: { fontSize: 12, fontWeight: '600', color: theme.colors.textMuted },
  chatContainer: { flex: 1 },
  messageList: { padding: 16, gap: 12, paddingBottom: 20 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '75%', borderWidth: 1.5, borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    borderColor: theme.colors.neonPink,
    backgroundColor: 'rgba(255,45,155,0.06)',
    shadowColor: theme.colors.neonPink,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8,
  },
  aiBubble: {
    borderColor: theme.colors.neonCyan,
    backgroundColor: 'rgba(0,240,255,0.06)',
    shadowColor: theme.colors.neonCyan,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8,
  },
  aiLabel: { fontSize: 8, color: theme.colors.neonPurple, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  bubbleText: { fontSize: 13, color: theme.colors.text, lineHeight: 20 },
  robotIcon: {
    borderWidth: 1.5, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 12 },
  typingText: { fontSize: 11, color: theme.colors.textDim, fontStyle: 'italic' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    margin: 12, marginBottom: 28,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: theme.radius.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  chatInput: {
    flex: 1, color: theme.colors.text, fontSize: 14,
    maxHeight: 100, paddingVertical: 4,
  },
  sendBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: theme.colors.neonPink,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: theme.colors.neonPink, shadowOpacity: 0.7, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
  },
  sendArrow: { fontSize: 14, color: '#fff' },

  // Manual editor
  manualScroll: { padding: 16, gap: 12, paddingBottom: 40 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  catLabel: { width: 100, fontSize: 13, fontWeight: '600', color: theme.colors.text },
  catInput: { flex: 1 },
  totalCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 13, color: theme.colors.textMuted },
  totalValue: { fontSize: 20, fontWeight: '700', color: theme.colors.neonPink,
    shadowColor: theme.colors.neonPink, shadowOpacity: 0.7, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
});
