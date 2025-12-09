import { ProductionRecord, Shift, User, NotificationSettings, SystemNotification } from '../types';
import { supabase } from './supabaseClient';

// --- INITIAL DATA CONSTANTS (Fallback) ---
const INITIAL_SHIFTS: Shift[] = [
  { id: '1', name: 'Дневная смена', startTime: '08:00', endTime: '16:00' },
  { id: '2', name: 'Вечерняя смена', startTime: '16:00', endTime: '00:00' },
  { id: '3', name: 'Ночная смена', startTime: '00:00', endTime: '08:00' },
];

const INITIAL_SETTINGS: NotificationSettings = {
  maxDefects: 5,
  maxDowntime: 45,
  telegramBotToken: '',
  telegramChatId: '',
  costPerDefect: 1500,
  costPerMinuteDowntime: 5000
};

// Local storage keys for settings/theme only
const KEY_SETTINGS = 'ssk_settings';

export const db = {
  // --- AUTH & USERS ---
  getUsers: async (): Promise<User[]> => {
    // Try Supabase first
    if (supabase) {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data && data.length > 0) {
        return data.map((u: any) => ({
          id: u.id,
          fullName: u.full_name,
          username: u.username,
          role: u.role,
          password: u.password_hash 
        }));
      }
    }
    return []; // Fallback empty if no connection
  },

  addUser: async (newUser: User): Promise<User> => {
    if (supabase) {
      const { data, error } = await supabase.from('users').insert({
        full_name: newUser.fullName,
        username: newUser.username,
        password_hash: newUser.password, // In real app, hash this!
        role: newUser.role
      }).select().single();
      
      if (!error && data) {
         return { ...newUser, id: data.id };
      }
    }
    return newUser;
  },

  login: async (username: string, password: string): Promise<User | null> => {
    // 1. Check Supabase
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password_hash', password) // In real app, verify hash
        .single();
      
      if (!error && data) {
        return {
          id: data.id,
          fullName: data.full_name,
          username: data.username,
          role: data.role,
          password: data.password_hash
        };
      }
    }
    return null;
  },

  // --- DATA ---
  getShifts: async (): Promise<Shift[]> => {
    // Shifts are usually static, but could be in DB
    return INITIAL_SHIFTS; 
  },

  getData: async (): Promise<ProductionRecord[]> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('production_logs')
        .select(`
          *,
          users (full_name)
        `)
        .order('date', { ascending: false });

      if (!error && data) {
        return data.map((row: any) => ({
          id: row.id,
          date: row.date,
          shiftId: row.shift_id,
          operatorId: row.operator_id,
          operatorName: row.users?.full_name || 'Unknown',
          productCount: row.product_count,
          defectCount: row.defect_count,
          downtimeMinutes: row.downtime_minutes,
          comments: row.comments,
          createdAt: row.created_at
        }));
      }
    }
    return [];
  },

  addRecord: async (record: Omit<ProductionRecord, 'id' | 'createdAt'>): Promise<ProductionRecord> => {
    let newId = Math.random().toString(36).substr(2, 9);
    let createdAt = new Date().toISOString();

    if (supabase) {
      const { data, error } = await supabase.from('production_logs').insert({
        date: record.date,
        shift_id: record.shiftId,
        operator_id: record.operatorId,
        product_count: record.productCount,
        defect_count: record.defectCount,
        downtime_minutes: record.downtimeMinutes,
        comments: record.comments
      }).select().single();

      if (!error && data) {
        newId = data.id;
        createdAt = data.created_at;
      }
    }

    return { ...record, id: newId, createdAt };
  },

  // --- SETTINGS (Keep in LocalStorage for simplicity of this demo, or move to DB) ---
  getSettings: async (): Promise<NotificationSettings> => {
    const stored = localStorage.getItem(KEY_SETTINGS);
    if (!stored) return INITIAL_SETTINGS;
    return JSON.parse(stored);
  },

  saveSettings: async (settings: NotificationSettings): Promise<void> => {
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
  },

  // --- NOTIFICATIONS (Local state for simplicity, or DB table) ---
  // For this update, we will simply filter the Production Records from Supabase based on thresholds
  getNotifications: async (): Promise<SystemNotification[]> => {
    const settings = await db.getSettings();
    const data = await db.getData(); // Get fresh data from Supabase
    
    const notifications: SystemNotification[] = [];

    // Simple logic: convert high defect/downtime records into notifications on the fly
    data.forEach(r => {
      if (r.defectCount > settings.maxDefects) {
        notifications.push({
          id: `def-${r.id}`,
          title: 'Превышен порог брака',
          message: `Смена ${r.date}: ${r.defectCount} шт. (Норма: ${settings.maxDefects})`,
          comment: r.comments,
          type: 'error',
          timestamp: r.createdAt,
          read: false
        });
      }
      if (r.downtimeMinutes > settings.maxDowntime) {
        notifications.push({
          id: `down-${r.id}`,
          title: 'Критический простой',
          message: `Смена ${r.date}: ${r.downtimeMinutes} мин. (Норма: ${settings.maxDowntime})`,
          comment: r.comments,
          type: 'warning',
          timestamp: r.createdAt,
          read: false
        });
      }
    });

    // In a real app, 'read' status would be stored in a separate table 'notifications'
    // Here we just return the calculated list. 
    // The "Clear All" in UI clears local state, but refreshing page re-calculates them.
    // For a diploma, this is acceptable, or you create a 'notifications' table in Supabase.
    
    return notifications.slice(0, 50); // Limit to 50
  },

  markNotificationsRead: async () => {
    // In this hybrid approach, we can't persistently mark "calculated" notifications as read
    // without a DB table. For the UI demo, the Layout component handles the visual clearing.
    return; 
  },
  
  addNotification: async (notif: any) => {
    // No-op in this architecture, alerts are derived from data
  },

  // --- ANALYTICS ---
  getRecentStatsForAI: async (startDate?: string, endDate?: string): Promise<{json: string, financials: any}> => {
    const data = await db.getData();
    const settings = await db.getSettings();
    
    let filtered = data;
    if (startDate && endDate) {
      filtered = data.filter(r => r.date >= startDate && r.date <= endDate);
    } else {
      filtered = data.slice(0, 20);
    }

    const payload = filtered.map(r => ({
      date: r.date,
      shift: r.shiftId === '1' ? 'День' : r.shiftId === '2' ? 'Вечер' : 'Ночь',
      produced: r.productCount,
      defects: r.defectCount,
      downtime: r.downtimeMinutes,
      operator: r.operatorName
    }));

    const totalDefects = filtered.reduce((acc, r) => acc + r.defectCount, 0);
    const totalDowntime = filtered.reduce((acc, r) => acc + r.downtimeMinutes, 0);
    const defectCost = totalDefects * settings.costPerDefect;
    const downtimeCost = totalDowntime * settings.costPerMinuteDowntime;
    
    const financialSummary = {
       costPerDefect: settings.costPerDefect,
       costPerMinuteDowntime: settings.costPerMinuteDowntime,
       totalDefectCost: defectCost,
       totalDowntimeCost: downtimeCost,
       totalLosses: defectCost + downtimeCost
    };

    return {
      json: JSON.stringify({ productionData: payload, financialSummary }),
      financials: financialSummary
    };
  }
};