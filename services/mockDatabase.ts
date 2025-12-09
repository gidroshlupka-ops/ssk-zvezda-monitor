import { ProductionRecord, Shift, User, NotificationSettings, SystemNotification } from '../types';
import { supabase } from './supabaseClient';

// Fallback settings
const INITIAL_SETTINGS: NotificationSettings = {
  maxDefects: 5,
  maxDowntime: 45,
  telegramBotToken: '',
  telegramChatId: '',
  costPerDefect: 1500,
  costPerMinuteDowntime: 5000
};

const KEY_SETTINGS = 'ssk_settings';

export const db = {
  // --- AUTH & USERS ---
  // Работает с таблицей 'users' из вашего SQL
  getUsers: async (): Promise<User[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('full_name');

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    return (data || []).map((u: any) => ({
      id: u.id,
      fullName: u.full_name, // Соответствует SQL: full_name
      username: u.username,
      role: u.role,
      password: u.password_hash // Соответствует SQL: password_hash
    }));
  },

  addUser: async (newUser: User): Promise<User> => {
    if (!supabase) return newUser;

    const { data, error } = await supabase.from('users').insert({
      full_name: newUser.fullName,
      username: newUser.username,
      password_hash: newUser.password,
      role: newUser.role
    }).select().single();
    
    if (error) {
      console.error("Error creating user:", error);
      return newUser;
    }
    
    return { ...newUser, id: data.id };
  },

  login: async (username: string, password: string): Promise<User | null> => {
    // 1. Прямой запрос в Supabase (проверка по таблице users)
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username.trim())
          .eq('password_hash', password.trim()) // Сравниваем напрямую, как в вашем SQL
          .single();
        
        if (!error && data) {
          console.log("Supabase Login Success:", data.username);
          return {
            id: data.id,
            fullName: data.full_name,
            username: data.username,
            role: data.role,
            password: data.password_hash
          };
        } else {
          console.warn("Supabase Login Failed:", error?.message || "User not found");
        }
      } catch (e) {
        console.error("Supabase connection error:", e);
      }
    }

    // 2. Резервный вход для Админа (на случай если база недоступна/зависла)
    // Это гарантирует, что вы сможете войти и показать интерфейс
    if (username.trim() === 'admin' && password.trim() === 'Ssk-Zvezda-Secure-Cloud-99!#') {
        console.log("Using Fallback Admin Login");
        return {
            id: 'admin-fallback',
            fullName: 'Журбин А.А. (Fallback)',
            username: 'admin',
            role: 'ADMIN',
            password: '...'
        };
    }

    return null;
  },

  // --- DATA ---
  getShifts: async (): Promise<Shift[]> => {
    // Если в базе есть таблица shifts, берем оттуда, иначе статика
    if (supabase) {
      const { data } = await supabase.from('shifts').select('*');
      if (data && data.length > 0) {
        return data.map((s: any) => ({
          id: s.id,
          name: s.name,
          startTime: s.start_time,
          endTime: s.end_time
        }));
      }
    }
    // Fallback если таблица пустая
    return [
      { id: '1', name: 'Дневная смена', startTime: '08:00', endTime: '16:00' },
      { id: '2', name: 'Вечерняя смена', startTime: '16:00', endTime: '00:00' },
      { id: '3', name: 'Ночная смена', startTime: '00:00', endTime: '08:00' },
    ]; 
  },

  getData: async (): Promise<ProductionRecord[]> => {
    if (!supabase) {
      console.error("No Supabase client available");
      return [];
    }

    // Запрос к production_logs с присоединением users для получения имени оператора
    const { data, error } = await supabase
      .from('production_logs')
      .select(`
        *,
        users (full_name)
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error("Supabase Data Load Error:", error);
      return [];
    }

    if (!data || data.length === 0) {
      console.warn("Supabase returned NO data (Empty table or RLS blocked)");
      return []; 
    }

    // Маппинг данных из SQL (snake_case) в TypeScript (camelCase)
    return data.map((row: any) => ({
      id: row.id,
      date: row.date,
      shiftId: row.shift_id, // SQL: shift_id
      operatorId: row.operator_id, // SQL: operator_id
      operatorName: row.users?.full_name || 'Неизвестный', // Join result
      productCount: row.product_count, // SQL: product_count
      defectCount: row.defect_count, // SQL: defect_count
      downtimeMinutes: row.downtime_minutes, // SQL: downtime_minutes
      comments: row.comments,
      createdAt: row.created_at
    }));
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

      if (error) {
        console.error("Error inserting record:", error);
        throw error;
      }

      if (data) {
        newId = data.id;
        createdAt = data.created_at;
      }
    }

    return { ...record, id: newId, createdAt };
  },

  getSettings: async (): Promise<NotificationSettings> => {
    const stored = localStorage.getItem(KEY_SETTINGS);
    if (!stored) return INITIAL_SETTINGS;
    return JSON.parse(stored);
  },

  saveSettings: async (settings: NotificationSettings): Promise<void> => {
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
  },

  getNotifications: async (): Promise<SystemNotification[]> => {
    const settings = await db.getSettings();
    const data = await db.getData();
    const notifications: SystemNotification[] = [];

    // Генерируем уведомления на лету из реальных данных базы
    data.forEach(r => {
      if (r.defectCount > settings.maxDefects) {
        notifications.push({
          id: `def-${r.id}`,
          title: 'Превышен порог брака',
          message: `Смена ${r.date}: ${r.defectCount} шт.`,
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
          message: `Смена ${r.date}: ${r.downtimeMinutes} мин.`,
          comment: r.comments,
          type: 'warning',
          timestamp: r.createdAt,
          read: false
        });
      }
    });
    
    return notifications.slice(0, 50);
  },

  markNotificationsRead: async () => { return; },
  
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
       totalLosses: defectCost + downtimeCost,
       totalDefectCost: defectCost,
       totalDowntimeCost: downtimeCost,
       costPerDefect: settings.costPerDefect,
       costPerMinuteDowntime: settings.costPerMinuteDowntime
    };

    return {
      json: JSON.stringify({ productionData: payload, financialSummary }),
      financials: financialSummary
    };
  }
};