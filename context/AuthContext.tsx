import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextValue {
  currentUser: string | null;
  loading: boolean;
  login: (username: string, password: string, rememberMe: boolean) => Promise<{ success?: boolean; error?: string }>;
  createAccount: (username: string, password: string) => Promise<{ success?: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  loading: true,
  login: async () => ({ error: 'Not initialized' }),
  createAccount: async () => ({ error: 'Not initialized' }),
  logout: async () => {},
});

const ACCOUNTS_KEY = 'budgetai_accounts';
const SESSION_KEY = 'budgetai_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY).then((username) => {
      if (username) setCurrentUser(username);
      setLoading(false);
    });
  }, []);

  async function getAccounts(): Promise<Record<string, { password: string; createdAt: string }>> {
    const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  }

  async function saveAccounts(accounts: Record<string, { password: string; createdAt: string }>) {
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  async function login(username: string, password: string, rememberMe: boolean) {
    const accounts = await getAccounts();
    const account = accounts[username.toLowerCase()];
    if (!account) return { error: 'Account not found' };
    if (account.password !== password) return { error: 'Incorrect password' };
    setCurrentUser(username.toLowerCase());
    if (rememberMe) {
      await AsyncStorage.setItem(SESSION_KEY, username.toLowerCase());
    }
    return { success: true };
  }

  async function createAccount(username: string, password: string) {
    const accounts = await getAccounts();
    const key = username.toLowerCase();
    if (accounts[key]) return { error: 'Username already taken' };
    accounts[key] = { password, createdAt: new Date().toISOString() };
    await saveAccounts(accounts);
    setCurrentUser(key);
    return { success: true };
  }

  async function logout() {
    await AsyncStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, createAccount, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
