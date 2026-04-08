export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  note: string;
}

export interface RevenueEntry {
  id: string;
  date: string;
  amount: number;
  source: string;
  note: string;
}

export interface Budget {
  categories: Record<string, number>;
  createdAt: string;
}
