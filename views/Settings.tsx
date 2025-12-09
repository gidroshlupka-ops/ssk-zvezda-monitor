import React, { useState, useEffect } from 'react';
import { Bell, Users, Save, Shield, Plus, Key, Copy, Check, Moon, Sun, DollarSign, Monitor } from 'lucide-react';
import { db } from '../services/mockDatabase';
import { User, NotificationSettings, Role, Theme } from '../types';

interface SettingsProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const Settings: React.FC<SettingsProps> = ({ theme, onThemeChange }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'users'>('general');
  const [settings, setSettings] = useState<NotificationSettings>({
    maxDefects: 5,
    maxDowntime: 45,
    telegramBotToken: '',
    telegramChatId: '',
    costPerDefect: 1500,
    costPerMinuteDowntime: 5000
  });
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState('');

  // New User Form State
  const [newUser, setNewUser] = useState({ fullName: '', username: '', role: 'OPERATOR' as Role });
  const [generatedPass, setGeneratedPass] = useState('');

  useEffect(() => {
    const load = async () => {
      setSettings(await db.getSettings());
      setUsers(await db.getUsers());
    };
    load();
  }, []);

  const handleSaveSettings = async () => {
    await db.saveSettings(settings);
    setMessage('Настройки сохранены');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCreateUser = async () => {
    if(!newUser.fullName || !newUser.username) return;

    const adjectives = ['Fast', 'Smart', 'Bright', 'Cool', 'Super'];
    const nouns = ['Worker', 'Star', 'Ship', 'Metal', 'Bolt'];
    const randomPass = `${adjectives[Math.floor(Math.random()*adjectives.length)]}-${nouns[Math.floor(Math.random()*nouns.length)]}-${Math.floor(Math.random()*999)}`;
    
    const u: User = {
      id: Math.random().toString(36).substr(2, 9),
      fullName: newUser.fullName,
      username: newUser.username,
      role: newUser.role,
      password: randomPass
    };

    const updated = await db.addUser(u);
    setUsers(prev => [...prev, updated]);
    setGeneratedPass(randomPass);
    setNewUser({ fullName: '', username: '', role: 'OPERATOR' });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Настройки системы</h2>
        <p className="text-slate-500 dark:text-slate-400">Управление параметрами, финансами и доступом.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 min-w-[150px] py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'general' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30 dark:bg-blue-900/20 dark:text-blue-400' 
                : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            <Monitor size={18} /> Общие и Тема
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 min-w-[150px] py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'notifications' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30 dark:bg-blue-900/20 dark:text-blue-400' 
                : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            <Bell size={18} /> Уведомления и Финансы
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 min-w-[150px] py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'users' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30 dark:bg-blue-900/20 dark:text-blue-400' 
                : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            <Users size={18} /> Сотрудники
          </button>
        </div>

        <div className="p-6 md:p-8">
          
          {/* GENERAL / THEME TAB */}
          {activeTab === 'general' && (
            <div className="space-y-8 max-w-2xl">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Оформление интерфейса</h3>
                <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => onThemeChange('light')}
                     className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                       theme === 'light' 
                       ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500 text-blue-700 dark:text-blue-400 ring-1 ring-blue-500' 
                       : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                     }`}
                   >
                      <Sun size={32} />
                      <span className="font-medium text-sm">Светлая тема</span>
                   </button>
                   <button 
                     onClick={() => onThemeChange('dark')}
                     className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                       theme === 'dark' 
                       ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500 text-blue-700 dark:text-blue-400 ring-1 ring-blue-500' 
                       : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                     }`}
                   >
                      <Moon size={32} />
                      <span className="font-medium text-sm">Темная тема</span>
                   </button>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS & FINANCIALS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-8 max-w-2xl">
               <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Пороговые значения (Триггеры)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Макс. допустимый брак (шт)</label>
                      <input 
                        type="number" 
                        value={settings.maxDefects}
                        onChange={(e) => setSettings({...settings, maxDefects: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Макс. время простоя (мин)</label>
                      <input 
                        type="number" 
                        value={settings.maxDowntime}
                        onChange={(e) => setSettings({...settings, maxDowntime: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4">
                  <h3 className="font-semibold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                    <DollarSign size={20} className="text-green-600 dark:text-green-500" />
                    Финансовые параметры
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Используются для расчета потерь в аналитике.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Стоимость брака (₽/шт)</label>
                      <input 
                        type="number" 
                        value={settings.costPerDefect}
                        onChange={(e) => setSettings({...settings, costPerDefect: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Стоимость простоя (₽/мин)</label>
                      <input 
                        type="number" 
                        value={settings.costPerMinuteDowntime}
                        onChange={(e) => setSettings({...settings, costPerMinuteDowntime: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4">
                  <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Telegram Integration</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bot API Token</label>
                    <input 
                      type="password" 
                      value={settings.telegramBotToken}
                      onChange={(e) => setSettings({...settings, telegramBotToken: e.target.value})}
                      placeholder="token"
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm bg-white dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Chat ID</label>
                    <input 
                      type="text" 
                      value={settings.telegramChatId}
                      onChange={(e) => setSettings({...settings, telegramChatId: e.target.value})}
                      placeholder="chat_id"
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm bg-white dark:bg-slate-700 dark:text-white"
                    />
                  </div>
               </div>

               <button 
                 onClick={handleSaveSettings}
                 className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
               >
                 <Save size={18} /> Сохранить настройки
               </button>
               {message && <span className="text-green-600 dark:text-green-400 text-sm ml-4 animate-fade-in">{message}</span>}
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-8">
               {/* Add User */}
               <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-xl border border-slate-100 dark:border-slate-600">
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Plus size={18} /> Добавить нового пользователя</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                     <div className="md:col-span-1">
                       <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">ФИО Сотрудника</label>
                       <input 
                         type="text" 
                         className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white"
                         placeholder="Иванов И.И."
                         value={newUser.fullName}
                         onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                       />
                     </div>
                     <div className="md:col-span-1">
                       <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Логин для входа</label>
                       <input 
                         type="text" 
                         className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white"
                         placeholder="ivanov"
                         value={newUser.username}
                         onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                       />
                     </div>
                     <div className="md:col-span-1">
                       <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Роль</label>
                       <select 
                         className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white"
                         value={newUser.role}
                         onChange={(e) => setNewUser({...newUser, role: e.target.value as Role})}
                       >
                         <option value="OPERATOR">Оператор</option>
                         <option value="ADMIN">Администратор</option>
                       </select>
                     </div>
                     <button 
                       onClick={handleCreateUser}
                       className="px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-blue-700 text-sm font-medium"
                     >
                       Создать
                     </button>
                  </div>
                  {generatedPass && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
                       <div className="text-sm text-green-800 dark:text-green-400">
                         <strong>Пользователь создан!</strong> Пароль: <code className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded border dark:border-slate-700">{generatedPass}</code>
                       </div>
                       <Copy className="text-green-600 dark:text-green-400 cursor-pointer hover:text-green-800" size={16} onClick={() => navigator.clipboard.writeText(generatedPass)}/>
                    </div>
                  )}
               </div>

               {/* User List */}
               <div>
                 <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Список пользователей</h3>
                 <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                   <table className="w-full text-left text-sm">
                     <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                       <tr>
                         <th className="px-4 py-3">ФИО</th>
                         <th className="px-4 py-3">Логин</th>
                         <th className="px-4 py-3">Роль</th>
                         <th className="px-4 py-3">Пароль (Демо)</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                       {users.map(u => (
                         <tr key={u.id}>
                           <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{u.fullName}</td>
                           <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.username}</td>
                           <td className="px-4 py-3">
                             {u.role === 'ADMIN' ? (
                               <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
                                 <Shield size={10} /> Админ
                               </span>
                             ) : (
                               <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                                 <Users size={10} /> Оператор
                               </span>
                             )}
                           </td>
                           <td className="px-4 py-3 font-mono text-xs text-slate-400">
                             {u.password || '******'}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;