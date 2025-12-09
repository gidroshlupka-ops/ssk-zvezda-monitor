export type Role = 'ADMIN' | 'OPERATOR';
export type Theme = 'light' | 'dark';

export interface User {
  id: string;
  fullName: string;
  username: string;
  password?: string; // Only for initial display/mock
  role: Role;
}

export interface Shift {
  id: string;
  name: string; // "Утренняя", "Вечерняя", "Ночная"
  startTime: string;
  endTime: string;
}

export interface ProductionRecord {
  id: string;
  date: string;
  shiftId: string;
  operatorId: string; // Link to User
  operatorName: string; // Snapshot of name
  productCount: number;
  downtimeMinutes: number;
  defectCount: number;
  comments?: string;
  createdAt: string;
}

export interface ProductionStats {
  totalProduction: number;
  totalDefects: number;
  totalDowntime: number;
  defectRate: number;
}

export interface NotificationSettings {
  maxDefects: number;
  maxDowntime: number;
  telegramBotToken: string;
  telegramChatId: string;
  costPerDefect: number; // in Rubles
  costPerMinuteDowntime: number; // in Rubles
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  comment?: string; // Operator's comment attached to the event
  type: 'info' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export enum ViewState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  JOURNAL = 'JOURNAL',
  ENTRY = 'ENTRY',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS'
}